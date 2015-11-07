var _        = require("lodash");
var execSync = require("child_process").execSync;
var cjson    = require("cjson");
var path     = require("path");
var fs       = require("fs");
var os       = require("os");
var helpers  = require("./helpers");
var format   = require("util").format;

require("colors");

exports.read = function() {
  var jsdocJsonPath = path.resolve("jsdoc.json");

  if (fs.existsSync(jsdocJsonPath)) {
    var jsdocJson = cjson.load(jsdocJsonPath);

    if (typeof jsdocJson.meteorPort === "undefined" || ! _.isNumber(jsdocJson.meteorPort)) {
      jsdocJson.meteorPort = 3333;
    }

    if (typeof jsdocJson.nodePath === "undefined" || _.isEmpty(jsdocJson.nodePath)) {
      var executableFinder;
      if(os.platform() === "win32") {
        executableFinder = "where";
      }
      else {
        executableFinder = "which";
      }
      var nodePath = execSync(executableFinder + " node").toString().replace("\n", "");

      if (! nodePath) {
        jsdocErrorLog("Could not detect a node installation");
      }

      jsdocJson.nodePath = nodePath;
    }

    if (typeof jsdocJson.docsPath === "undefined" || _.isEmpty(jsdocJson.docsPath)) {
      jsdocErrorLog("docsPath does not exist");
    }

    jsdocJson.docsPath = rewriteHome(jsdocJson.docsPath);

    return jsdocJson;
  } else {
    console.error("jsdoc.json file does not exist!".red.bold);
    helpers.printHelp();
    process.exit(1);
  }
};

function jsdocErrorLog(message) {
  var errorMessage = "Invalid jsdoc.json file: " + message;

  console.error(errorMessage.red.bold);
  process.exit(1);
}

function rewriteHome(location) {
  return location.replace("~", process.env.HOME);
}
