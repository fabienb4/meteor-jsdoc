var _        = require("lodash");
var spawn    = require("child_process").spawn;
var execSync = require("child_process").execSync;
var fs       = require("fs");
var os       = require("os");
var path     = require("path");
var ejs      = require("ejs");
var helpers  = require("./helpers");

module.exports = Actions;

var SCRIPT_DIR  = path.resolve(__dirname, "../scripts");
var EXAMPLE_DIR = path.resolve(__dirname, "../example");
var METEOR_DIR  = path.resolve(EXAMPLE_DIR, "meteor");

function Actions(config, cwd) {
  this.cwd    = cwd;
  this.config = config;

  helpers.debug("config = ", config);
}

Actions.prototype._randomId = function(noOfTexts) {
  noOfTexts    = noOfTexts || 17;
  var text     = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < noOfTexts; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
};

Actions.prototype._applyTemplate = function(file, vars, callback) {
  var self = this;

  fs.readFile(file, { encoding: "utf8" }, function(err, content) {
    if (err) {
      callback(err);
    } else {
      if (vars) {
        content = ejs.compile(content, {})(vars);
      }

      callback(null, content);
    }
  });
};

Actions.prototype._execute = function(command, callback) {
  callback = callback || function() {};

  var self      = this;
  var tmpScript = path.join(os.tmpdir(), self._randomId());
  var logs      = { stdout: "", stderr: ""};
  var bash;

  fs.writeFile(tmpScript, command, function(err) {
    if (err) {
      callback(err);
    } else {
      executeTmpScript();
    }
  });

  function executeTmpScript() {
    bash = spawn("bash", [tmpScript]);

    bash.stdout.on("data", onStdOut);
    bash.stderr.on("data", onStdErr);
    bash.once("error", sendCallback);
    bash.once("close", onClose);
  }

  function sendCallback(err, code, logs) {
    if (callback) {
      callback(err, code, logs);
      callback = null;

      //cleanup
      bash.stdout.removeListener("data", onStdOut);
      bash.stderr.removeListener("data", onStdErr);

      bash.removeListener("error", sendCallback);
      bash.removeListener("close", onClose);

      //clean up tmpScript
      fs.unlink(tmpScript);
    }
  }

  function onClose(code) {
    sendCallback(null, code, logs);
  }

  function onStdOut(data) {
    logs.stdout += data.toString();
  }

  function onStdErr(data) {
    logs.stderr += data.toString();
  }
};

Actions.prototype._executeScript = function(scriptFile, vars, callback) {
  callback = callback || function() {};

  var self = this;

  self._applyTemplate(scriptFile, vars, function(err, content) {
    if (err) {
      callback(err);
    } else {
      self._execute(content, callback);
    }
  });
};

Actions.prototype._copyFile = function(src, dest) {
  var content = fs.readFileSync(src, "utf8");

  fs.writeFileSync(dest, content);
};

Actions.prototype.build = function() {
  var self = this;

  try {
    fs.mkdirSync(self.config.docsPath);
  } catch(e) {
    if (e.code != "EEXIST") {
      helpers.error("Cannot create docs folder ('docsPath'):", e);

      process.exit(1);
    }
  }

  if (self.config.initMeteor) {
    execSync("cp -R '" + METEOR_DIR + "/.' '" + self.config.docsPath + "/'");

    helpers.success("Meteor initialized.");
  } else if (self.config.updateMeteor) {
    execSync("cp -R '" + METEOR_DIR + "/.meteor' '" + self.config.docsPath + "/'");

    helpers.success("Meteor updated.");
  }

  if (self.config.docsConfig) {
    var srcHead  = path.resolve(METEOR_DIR, "client/head.html");
    var destHead = path.resolve(self.config.docsPath, "client/head.html");

    self._applyTemplate(srcHead, self.config.docsConfig, function(err, content) {
      if (err) {
        helpers.error(err);
      } else {
        fs.writeFileSync(destHead, content);
      }
    });
  }

  // XXX: Test if deep folder exist to make sure Meteor is copied.
  var destClientTemplates = path.resolve(self.config.docsPath, "client/templates");

  if (! fs.existsSync(destClientTemplates)) {
    helpers.error("Meteor doesn't appear to be initialized. Please set 'initMeteor' to true in 'jsdoc.conf'.");

    process.exit(1);
  }

  if (self.config.preamble) {
    var fileName     = "preamble.md";
    var srcPreamble  = path.resolve(EXAMPLE_DIR, fileName);
    var destPreamble = path.resolve(self.config.docsPath, "client/templates", fileName);

    if (fs.existsSync(destPreamble)) {
      var log = "Skipped '" + fileName + "' copy to avoid overwritting.";

      helpers.warn(log);
    } else {
      self._copyFile(srcPreamble, destPreamble);
    }
  }

  process.env.DOCS_PATH    = self.config.docsPath;
  process.env.PROJECT_REPO = self.config.projectRepo;

  var jsdocPath  = path.resolve(__dirname, "../node_modules/.bin/jsdoc");
  var build_docs = {
    script: path.resolve(SCRIPT_DIR, "build_docs.sh"),
    vars  : {
      nodePath     : self.config.nodePath,
      jsdocPath    : jsdocPath,
      jsdocArgs    : self.config.debug ? "--debug" : "--verbose",
      projectPath  : path.resolve("."),
      jsdocTmplPath: path.resolve(__dirname, "../template"),
      jsdocConf    : path.resolve("jsdoc-conf.json")
    }
  };

  self._executeScript(build_docs.script, build_docs.vars, function(err, code, logs) {
    if (self.config.debug) {
      helpers.debug("Build cmd: ", logs.stdout, true);
    } else {
      newLineIndex = logs.stdout.indexOf("\n");
      helpers.info(logs.stdout.substring(newLineIndex + 1, logs.stdout.length - 1));
    }

    if (err) {
      helpers.error(err);
    } else {
      var fatalErrors = logs.stderr;
      var cmdIndex    = fatalErrors.indexOf(self.config.nodePath + " " + jsdocPath);

      fatalErrors = fatalErrors.substr(0, cmdIndex);

      if (fatalErrors) {
        helpers.error(fatalErrors);
      } else {
        var stdoutErrors = logs.stdout;
        var warningRegex = /WARNING:.+\n/g;
        var errorRegex   = /ERROR:.+\n/g;
        var warnings     = stdoutErrors.match(warningRegex);
        var errors       = stdoutErrors.match(errorRegex);

        _.each(warnings, function(warning) {
          helpers.warn(warning.toString().replace("\n", "") + "\n");
        });

        if (errors) {
          _.each(errors, function(error) {
            helpers.error(error.toString().replace("\n", "") + "\n");
          });
          helpers.warn("Docs built with errors.");
        } else {
          helpers.success("Docs successfully built.");
        }
      }
    }
  });
};

Actions.prototype.start = function() {
  var self = this;

  var start_meteor = {
    script: path.resolve(SCRIPT_DIR, "start_meteor.sh"),
    vars: {
      docsPath  : self.config.docsPath,
      meteorPort: self.config.meteorPort
    }
  };

  self._executeScript(start_meteor.script, start_meteor.vars, function(err, code, logs) {
    if (err) {
      helpers.error(err);
    } else {
      var log = "Meteor docs server starting at http://localhost:" + self.config.meteorPort + "/";

      helpers.success(log);
    }
  });
};

Actions.prototype.stop = function() {
  var self = this;

  var stop_meteor =  {
    script: path.resolve(SCRIPT_DIR, "stop_meteor.sh"),
    vars  : {
      docsPath  : self.config.docsPath,
      meteorPort: self.config.meteorPort
    }
  };

  self._executeScript(stop_meteor.script, stop_meteor.vars, function(err, code, logs) {
    if (err) {
      helpers.error(err);
    } else {
      helpers.success("Meteor docs server stopped.");
    }
  });
};

Actions.init = function() {
  var jsdocJson     = path.resolve("jsdoc.json");
  var jsdocConfJson = path.resolve("jsdoc-conf.json");

  if (fs.existsSync(jsdocJson)) {
    helpers.error("A JSDoc project already exists");
    process.exit(1);
  }

  var jsdocJsonExample     = path.resolve(__dirname, "../example/jsdoc.json");
  var jsdocConfJsonExample = path.resolve(__dirname, "../example/jsdoc-conf.json");

  copyFile(jsdocJsonExample, jsdocJson);
  copyFile(jsdocConfJsonExample, jsdocConfJson);

  helpers.success("JSDoc project initialized.");
  helpers.info("See jsdoc.json in your project folder to set project specific options.")
  helpers.info("[Advanced] See jsdoc-conf.json in your project folder to set jsdoc options.");

  function copyFile(src, dest) {
    var content = fs.readFileSync(src, "utf8");
    fs.writeFileSync(dest, content);
  }
};
