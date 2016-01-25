const isBoolean = require("lodash/isBoolean");
const isEmpty   = require("lodash/isEmpty");
const isNumber  = require("lodash/isNumber");
const isString  = require("lodash/isString");
const cjson     = require("cjson");
const path      = require("path");
const fse       = require('fs-extra');
const os        = require("os");
const helpers   = require("./helpers");

require("colors");

exports.read = function() {
  var jsdocJsonPath = path.resolve("jsdoc.json");

  if (fse.existsSync(jsdocJsonPath)) {
    var jsdocJson = cjson.load(jsdocJsonPath);

    if (typeof jsdocJson.debug === "undefined" || ! isBoolean(jsdocJson.debug)) {
      jsdocJson.debug = false;
    }

    if (typeof jsdocJson.meteorPort === "undefined" || ! isNumber(jsdocJson.meteorPort)) {
      jsdocJson.meteorPort = 3333;
    }

    if (typeof jsdocJson.nodePath === "undefined" || isEmpty(jsdocJson.nodePath)) {
      jsdocJson.nodePath = process.execPath;
    }

    if (typeof jsdocJson.docsPath === "undefined" || isEmpty(jsdocJson.docsPath)) {
      helpers.error("Invalid jsdoc.json file: docsPath is not specified.");
      process.exit(1);
    }

    jsdocJson.docsPath = path.resolve(jsdocJson.docsPath.replace("~", os.homedir()));

    if (typeof jsdocJson.initMeteor === "undefined" || ! isBoolean(jsdocJson.initMeteor)) {
      jsdocJson.initMeteor = true;
    }

    if (typeof jsdocJson.updateMeteor === "undefined" || ! isBoolean(jsdocJson.updateMeteor)) {
      jsdocJson.updateMeteor = true;
    }

    if (typeof jsdocJson.preamble === "undefined" || ! isBoolean(jsdocJson.preamble)) {
      jsdocJson.preamble = true;
    }

    if (typeof jsdocJson.projectRepo === "undefined" || ! isString(jsdocJson.projectRepo)) {
      jsdocJson.projectRepo = "";
    }

    if (typeof jsdocJson.docsConfig === "undefined" || isEmpty(jsdocJson.docsConfig)) {
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
