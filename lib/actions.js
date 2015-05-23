var exec = require("child_process").exec;
var spawn = require("child_process").spawn;
var fs = require("fs");
var path = require("path");
var ejs = require("ejs");
require("colors");

module.exports = Actions;

var SCRIPT_DIR = path.resolve(__dirname, "../scripts");
var METEOR_DIR = path.resolve(__dirname, "../example/meteor");

function Actions(config, cwd) {
  this.cwd = cwd;
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
    if(err) {
      callback(err);
    } else {
      if(vars) {
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
    if(err) {
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
    if(callback) {
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
    if(err) {
      callback(err);
    } else {
      self._execute(content, callback);
    }
  });
};

Actions.prototype.build = function() {
  var self = this;

  if (self.config.initMeteor) {
    var initMeteor = {
      script: path.resolve(SCRIPT_DIR, "init_meteor.sh"),
      vars: {
        docsPath:    self.config.docsPath,
        meteorFiles: METEOR_DIR,
      }
    };

    self._executeScript(initMeteor.script, initMeteor.vars, function(err, code, logs) {
      if(err) {
        console.log(err.bold.red);
      } else {
        console.log("Meteor initialized.".bold.green);
      }
    });
  }

  process.env.DOCS_PATH = self.config.docsPath;

  var build_docs = {
    script: path.resolve(SCRIPT_DIR, "build_docs.sh"),
    vars: {
      nodePath:      self.config.nodePath,
      jsdocPath:     self.config.jsdocPath,
      projectPath:   self.config.projectPath,
      jsdocTmplPath: path.resolve(__dirname, "../template"),
      jsdocConf:     path.resolve(__dirname, "../jsdoc-conf.json")
    }
  };

  self._executeScript(build_docs.script, build_docs.vars, function(err, code, logs) {
    if(err) {
      console.log(err.bold.red);
    } else {
      var errors   = logs.stderr;
      var cmdIndex = errors.indexOf("/usr/bin/node /usr/bin/jsdoc -t");

      errors = errors.substr(0, cmdIndex);

      if (errors) {
        console.log(errors.bold.red);
      } else {
        console.log("Docs successfully built.".bold.green);
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
    if(err) {
      console.log(err.bold.red);
    } else {
      var log = "Meteor started at http://localhost:" + self.config.meteorPort + "/";
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
    if(err) {
      console.log(err.bold.red);
    } else {
      console.log("Meteor server stopped.".bold.green);
    }
  });
};

Actions.init = function() {
  var destJSDocJson = path.resolve("jsdoc.json");

  if(fs.existsSync(destJSDocJson)) {
    console.error("A JSDoc project already exists".bold.red);
    process.exit(1);
  }

  var exampleJSDocJson = path.resolve(__dirname, "../example/jsdoc.json");

  copyFile(exampleJSDocJson, destJSDocJson);

  console.log("JSDoc project initialized!".bold.green);
  console.log("See jsdoc.json in your project folder to set project specific options!".bold.green);

  function copyFile(src, dest) {
    var content = fs.readFileSync(src, "utf8");
    fs.writeFileSync(dest, content);
  }
};
