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

    if (typeof jsdocJson.debug === "undefined" || ! _.isBoolean(jsdocJson.debug)) {
      jsdocJson.debug = false;
    }

    if (typeof jsdocJson.meteorPort === "undefined" || ! _.isNumber(jsdocJson.meteorPort)) {
      jsdocJson.meteorPort = 3333;
    }

    if (typeof jsdocJson.nodePath === "undefined" || _.isEmpty(jsdocJson.nodePath)) {
      jsdocJson.nodePath = process.execPath;
    }

    if (typeof jsdocJson.docsPath === "undefined" || _.isEmpty(jsdocJson.docsPath)) {
      jsdocErrorLog("docsPath does not exist");
    }

    jsdocJson.docsPath = rewriteHome(jsdocJson.docsPath);

    if (typeof jsdocJson.initMeteor === "undefined" || ! _.isBoolean(jsdocJson.initMeteor)) {
      jsdocJson.initMeteor = true;
    }

    if (typeof jsdocJson.updateMeteor === "undefined" || ! _.isBoolean(jsdocJson.updateMeteor)) {
      jsdocJson.updateMeteor = true;
    }

    if (typeof jsdocJson.preamble === "undefined" || ! _.isBoolean(jsdocJson.preamble)) {
      jsdocJson.preamble = true;
    }

    if (typeof jsdocJson.projectRepo === "undefined" || ! _.isString(jsdocJson.projectRepo)) {
      jsdocJson.projectRepo = "";
    }

    if (typeof jsdocJson.docsConfig === "undefined" || _.isEmpty(jsdocJson.docsConfig)) {
      jsdocJson.docsConfig = {
        "title": "Meteor Project Docs",
        "metas": {
          "description": "Documentation for a meteor project."
        }
      };
    }

    return jsdocJson;
  } else {
    helpers.error("jsdoc.json file does not exist!");
    helpers.printHelp();
    process.exit(1);
  }
};

function jsdocErrorLog(message) {
  var errorMessage = "Invalid jsdoc.json file: " + message;

  helpers.error(errorMessage);
  process.exit(1);
}

function rewriteHome(location) {
  return location.replace("~", process.env.HOME);
}
