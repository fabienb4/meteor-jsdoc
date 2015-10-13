var _        = require("lodash");
var spawn    = require("child_process").spawn;
var execSync = require("child_process").execSync;
var fs       = require("fs");
var path     = require("path");
var ejs      = require("ejs");

require("colors");

module.exports = Actions;

var SCRIPT_DIR  = path.resolve(__dirname, "../scripts");
var EXAMPLE_DIR = path.resolve(__dirname, "../example");
var METEOR_DIR  = path.resolve(EXAMPLE_DIR, "meteor");

function Actions(config, cwd) {
  this.cwd    = cwd;
  this.config = config;
}

Actions.prototype._randomId = function(noOfTexts) {
  noOfTexts = noOfTexts || 17;
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for( var i=0; i < noOfTexts; i++ ) {
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

  var self = this;
  var tmpScript = "/tmp/" + self._randomId();
  var logs = { stdout: "", stderr: ""};
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
      console.error("Cannot create docs folder ('docsPath'):", e);

      process.exit(1);
    }
  }

  if (self.config.initMeteor) {
    execSync("cp -R " + METEOR_DIR + "/. " + self.config.docsPath + "/");
    console.log("Meteor initialized.".bold.green);
  } else if (self.config.updateMeteor) {
    execSync("cp -R " + METEOR_DIR + "/.meteor " + self.config.docsPath + "/");
    console.log("Meteor updated.".bold.green);
  }

  // Test if deep folder exist to make sure Meteor is copied.
  var destClientTemplates = path.resolve(self.config.docsPath, "client/templates");

  if (! fs.existsSync(destClientTemplates)) {
    console.log("Meteor doesn't appear to be initialized. Please set 'initMeteor' to true in 'jsdoc.conf'.".bold.red);

    process.exit(1);
  }

  if (self.config.preamble) {
    var fileName     = "preamble.md";
    var srcPreamble  = path.resolve(EXAMPLE_DIR, fileName);
    var destPreamble = path.resolve(self.config.docsPath, "client/templates", fileName);

    if (fs.existsSync(destPreamble)) {
      var log = "Skipped '" + fileName + "' copy to avoid overwritting.";

      console.log(log.bold.yellow);
    } else {
      self._copyFile(srcPreamble, destPreamble);
    }
  }

  process.env.DOCS_PATH = self.config.docsPath;

  var jsdocPath  = path.resolve(__dirname, "../node_modules/.bin/jsdoc");
  var build_docs = {
    script: path.resolve(SCRIPT_DIR, "build_docs.sh"),
    vars: {
      nodePath:      self.config.nodePath,
      jsdocPath:     jsdocPath,
      projectPath:   path.resolve("."),
      jsdocTmplPath: path.resolve(__dirname, "../template"),
      jsdocConf:     path.resolve("jsdoc-conf.json")
    }
  };

  self._executeScript(build_docs.script, build_docs.vars, function(err, code, logs) {
    if (err) {
      console.log(err.bold.red);
    } else {
      var fatalErrors = logs.stderr;
      var cmdIndex    = fatalErrors.indexOf(self.config.nodePath + " " + jsdocPath);

      fatalErrors = fatalErrors.substr(0, cmdIndex);

      if (fatalErrors) {
        console.log(fatalErrors.bold.red);
      } else {
        var stdoutErrors = logs.stdout;
        var warningRegex = /WARNING:.+\n/g;
        var errorRegex   = /ERROR:.+\n/g;
        var warnings     = stdoutErrors.match(warningRegex);
        var errors       = stdoutErrors.match(errorRegex);

        _.each(warnings, function(warning) {
          console.log(warning.replace("\n", "").bold.yellow, "\n");
        });

        if (errors) {
          _.each(errors, function(error) {
            console.log(error.replace("\n", "").bold.red, "\n");
          });
          console.log("Docs built with errors.".bold.yellow);
        } else {
          console.log("Docs successfully built.".bold.green);
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
      docsPath:   self.config.docsPath,
      meteorPort: self.config.meteorPort
    }
  };

  self._executeScript(start_meteor.script, start_meteor.vars, function(err, code, logs) {
    if (err) {
      console.log(err.bold.red);
    } else {
      var log = "Meteor docs server starting at http://localhost:" + self.config.meteorPort + "/";
      console.log(log.bold.green);
    }
  });
};

Actions.prototype.stop = function() {
  var self = this;

  var stop_meteor =  {
    script: path.resolve(SCRIPT_DIR, "stop_meteor.sh"),
    vars: {
      docsPath: self.config.docsPath,
      meteorPort: self.config.meteorPort
    }
  };

  self._executeScript(stop_meteor.script, stop_meteor.vars, function(err, code, logs) {
    if (err) {
      console.log(err.bold.red);
    } else {
      console.log("Meteor docs server stopped.".bold.green);
    }
  });
};

Actions.init = function() {
  var jsdocJson     = path.resolve("jsdoc.json");
  var jsdocConfJson = path.resolve("jsdoc-conf.json");

  if (fs.existsSync(jsdocJson)) {
    console.error("A JSDoc project already exists".bold.red);
    process.exit(1);
  }

  var jsdocJsonExample     = path.resolve(__dirname, "../example/jsdoc.json");
  var jsdocConfJsonExample = path.resolve(__dirname, "../example/jsdoc-conf.json");

  copyFile(jsdocJsonExample, jsdocJson);
  copyFile(jsdocConfJsonExample, jsdocConfJson);

  console.log("JSDoc project initialized!".bold.green);
  console.log("See jsdoc.json in your project folder to set project specific options!".bold);
  console.log("[Advanced] See jsdoc-conf.json in your project folder to set jsdoc options!".bold);

  function copyFile(src, dest) {
    var content = fs.readFileSync(src, "utf8");
    fs.writeFileSync(dest, content);
  }
};
