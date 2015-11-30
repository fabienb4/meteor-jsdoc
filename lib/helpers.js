var config = require("./config");

require("colors");

exports.printHelp = function() {
  console.log("\nmeteor-jsdoc (v" + require("../package.json").version + ")");
  console.log("\n---------------");
  console.log(" Valid Actions ");
  console.log("---------------");
  console.log("init  - Copy the config file to your project's directory.");
  console.log("build - Build/rebuild the documentation for a Meteor project");
  console.log("start - Start the meteor server for the docs");
  console.log("stop  - Stop the meteor server for the docs\n");
};

exports.debug = function(log, variable, raw) {
  if (config.read().debug) {
    log = "DEBUG: " + log;

    console.log(log.gray, variable ? (raw ? variable.gray : JSON.stringify(variable, null, 2).gray) : "");
  }
};

exports.log = function(log, variable) {
  console.log(log.blue.bold, variable ? JSON.stringify(variable, null, 2).blue.bold : "");
};

exports.info = function(log, variable) {
  console.log(log.gray.bold, variable ? JSON.stringify(variable, null, 2).gray.bold : "");
};

exports.error = function(log, variable) {
  console.log(log.red.bold, variable ? JSON.stringify(variable, null, 2).red.bold : "");
};

exports.success = function(log, variable) {
  console.log(log.green.bold, variable ? JSON.stringify(variable, null, 2).green.gold : "");
};

exports.warn = function(log, variable) {
  console.log(log.yellow.bold, variable ? JSON.stringify(variable, null, 2).yellow.bold : "");
};
