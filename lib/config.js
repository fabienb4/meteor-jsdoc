var cjson   = require("cjson");
var path    = require("path");
var fs      = require("fs");
var helpers = require("./helpers");
var format  = require("util").format;

require("colors");

exports.read = function() {
  var jsdocExecPath = path.resolve(__dirname, "../node_modules/.bin/jsdoc");
  var jsdocJsonPath = path.resolve("jsdoc.json");

  if(fs.existsSync(jsdocJsonPath)) {
    var jsdocJson = cjson.load(jsdocJsonPath);

    if (typeof jsdocJson.meteorPort === "undefined") {
      jsdocJson.meteorPort = 3333;
    }

    if (typeof jsdocJson.nodePath === "undefined") {
      jsdocJson.nodePath = "/usr/bin/node";
    }

    if(! jsdocJson.projectPath) {
      jsdocJson.projectPath = process.cwd();
    }

    if(! jsdocJson.docsPath) {
      jsdocJson.docsPath = process.cwd() + '/docs';
    }

    // get the local jsdoc executable path
    jsdocJson.jsdocPath = jsdocExecPath;

    //rewrite ~ with $HOME
    jsdocJson.projectPath = rewriteHome(jsdocJson.projectPath);
    jsdocJson.docsPath    = rewriteHome(jsdocJson.docsPath);

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
