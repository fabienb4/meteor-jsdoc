const config = require("./config");

require("colors");

var stringify = function(variable) {
  return variable ? JSON.stringify(variable, null, 2) : "";
}

exports.printHelp = function() {
  console.log(`\nmeteor-jsdoc (v${require("../package.json").version})`);
  console.log("\n---------------");
  console.log(" Valid Actions ");
  console.log("---------------");
  console.log("conf  - Show the config for the project.");
  console.log("init  - Copy the config file to your project's directory.");
  console.log("build - Build/rebuild the documentation for a Meteor project");
  console.log("start - Start the meteor server for the docs");
  console.log("stop  - Stop the meteor server for the docs\n");
};

exports.debug = function(log, variable, raw) {
  if (config.read().debug) {
    console.log(stringify(log).gray, raw ? variable.gray : stringify(variable).gray);
  }
};

exports.log = function(log, variable) {
  console.log(stringify(log).blue.bold, stringify(variable).blue.bold);
};

exports.info = function(log, variable) {
  console.log(stringify(log).gray.bold, stringify(variable).gray.bold);
};

exports.error = function(log, variable) {
  console.log(stringify(log).red.bold, stringify(variable).red.bold);
};

exports.success = function(log, variable) {
  console.log(stringify(log).green.bold, stringify(variable).green.bold);
};

exports.warn = function(log, variable) {
  console.log(stringify(log).yellow.bold, stringify(variable).yellow.bold);
};
