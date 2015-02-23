var cjson = require("cjson");
var path = require("path");
var fs = require("fs");
var helpers = require("./helpers");
var format = require("util").format;

require("colors");

exports.read = function() {
  var jsDocJsonPath = path.resolve("jsdoc.json");

  if(fs.existsSync(jsDocJsonPath)) {
    var jsDocJson = cjson.load(jsDocJsonPath);

    if (typeof jsDocJson.meteorPort === "undefined") {
      jsDocJson.meteorPort = 3333;
    }

    if(!jsDocJson.projectPath) {
      jsDocErrorLog("Project Path does not exist");
    }

    if(!jsDocJson.docsPath) {
      jsDocErrorLog("Docs Path does not exist");
    }

    //rewrite ~ with $HOME
    jsDocJson.projectPath = rewriteHome(jsDocJson.projectPath);
    jsDocJson.docsPath    = rewriteHome(jsDocJson.docsPath);

    return jsDocJson;
  } else {
    console.error("jsdoc.json file does not exist!".red.bold);
    helpers.printHelp();
    process.exit(1);
  }
};

function jsDocErrorLog(message) {
  var errorMessage = "Invalid jsdoc.json file: " + message;
  console.error(errorMessage.red.bold);
  process.exit(1);
}

function rewriteHome(location) {
  return location.replace("~", process.env.HOME);
}
