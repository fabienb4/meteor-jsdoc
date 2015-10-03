exports.printHelp = function() {
  console.error("\nmeteor-jsdoc (v" + require("../package.json").version + ")");
  console.error("\n---------------");
  console.error(" Valid Actions ");
  console.error("---------------");
  console.error("init  - Copy the config file to your project's directory.");
  console.error("build - Build/rebuild the documentation for a Meteor project");
  console.error("start - Start the meteor server for the docs");
  console.error("stop  - Stop the meteor server for the docs\n");
};
