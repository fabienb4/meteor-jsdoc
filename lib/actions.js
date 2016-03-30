const each    = require("lodash/each");
const drop    = require("lodash/drop");
const pull    = require("lodash/pull");
const spawn   = require("child_process").spawn;
const exec    = require('child_process').exec;
const fse     = require('fs-extra');
const os      = require("os");
const path    = require("path");
const ejs     = require("ejs");
const helpers = require("./helpers");

module.exports = Actions;

const EXAMPLE_DIR = path.resolve(__dirname, "..", "example");
const METEOR_DIR  = path.resolve(EXAMPLE_DIR, "meteor");

function Actions(config, cwd) {
  this.cwd    = cwd;
  this.config = config;

  helpers.debug("DEBUG: config =", config);
}

Actions.prototype._applyTemplate = function(file, vars, callback) {
  var self = this;

  fse.readFile(file, { encoding: "utf8" }, (err, content) => {
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

Actions.prototype.conf = function() {
  var self = this;

  helpers.info("Project's config:", self.config);
};

Actions.prototype.build = function() {
  var self = this;

  try {
    fse.mkdirsSync(self.config.docsPath);
  } catch(e) {
    if (e.code != "EEXIST") {
      helpers.error("Cannot create docs folder ('docsPath'):", e);

      process.exit(1);
    }
  }

  if (self.config.initMeteor) {
    var src = path.join(METEOR_DIR);
    var dest = path.join(self.config.docsPath);

    fse.copySync(src, dest);

    helpers.success("Meteor initialized.");
  } else if (self.config.updateMeteor) {
    var src = path.join(METEOR_DIR, ".meteor");
    var dest = path.join(self.config.docsPath, ".meteor");

    fse.copySync(src, dest);

    helpers.success("Meteor updated.");
  }

  if (self.config.docsConfig) {
    var srcHead  = path.resolve(METEOR_DIR, "client", "templates", "layout.html");
    var destHead = path.resolve(self.config.docsPath, "client", "templates", "layout.html");

    self._applyTemplate(srcHead, self.config.docsConfig, (err, content) => {
      if (err) {
        helpers.error(err);
      } else {
        fse.writeFileSync(destHead, content);
      }
    });
  }

  // XXX: Test if deep folder exist to make sure Meteor is copied.
  var destClientTemplates = path.resolve(self.config.docsPath, "client", "templates");

  if (! fse.existsSync(destClientTemplates)) {
    helpers.error("Meteor doesn't appear to be initialized. Please set 'initMeteor' to true in 'jsdoc.conf'.");
    process.exit(1);
  }

  if (self.config.preamble) {
    var fileName     = "preamble.md";
    var srcPreamble  = path.resolve(EXAMPLE_DIR, fileName);
    var destPreamble = path.resolve(self.config.docsPath, "client", "templates", fileName);

    if (fse.existsSync(destPreamble)) {
      var log = `Skipped ${fileName} copy to avoid overwritting.`;

      helpers.warn(log);
    } else {
      fse.copySync(srcPreamble, destPreamble);
    }
  }

  fse.mkdirsSync(path.join(self.config.docsPath, "client", "data"));

  process.env.DOCS_PATH    = self.config.docsPath;
  process.env.PROJECT_REPO = self.config.projectRepo;

  var nodePath      = os.platform() === "win32" ? "" : `"${self.config.nodePath}"`;
  var jsdocPath     = `"${path.resolve(__dirname, "..", "node_modules", ".bin", "jsdoc")}"`;
  var jsdocArgs     = self.config.debug ? "--debug" : "--verbose";
  var jsdocTmplPath = `"${path.resolve(__dirname, "..", "template")}"`;
  var jsdocConf     = `"${path.resolve("jsdoc-conf.json")}"`;
  var docsPath      = `"${self.config.docsPath}"`;

  var cmd = `find . -type f ! -path "*/.git/*" ! -path "*/.meteor/*" | xargs grep -lswH "@summary" | xargs -L 10000 -t ${nodePath} ${jsdocPath} ${jsdocArgs} -t ${jsdocTmplPath} -c ${jsdocConf} -d ${docsPath} 2>&1`;

  exec(cmd, (error, stdout, stderr) => {
    if (stderr) {
      helpers.error(stderr);

      return;
    }

    var logs = stdout.split("\n");

    // Show cmd ran when in debug mode
    helpers.debug("DEBUG:", logs[0]);

    each(drop(logs), (log) => {
      if (log.startsWith("DEBUG")) {
        helpers.debug(log);
      } else if (log.startsWith("WARNING")) {
        helpers.warn(log);
      } else if (log.startsWith("ERROR")) {
        helpers.error(log);
      } else {
        helpers.info(log);
      }
    });

    if (error !== null) {
      helpers.warn("Docs built with errors.");
    } else {
      helpers.success("Docs successfully built.");
    }
  });
};

Actions.prototype.start = function() {
  var self = this;
  var cmd  = `meteor --port ${self.config.meteorPort} > app.log 2>&1 &`;

  exec(cmd, { cwd: self.config.docsPath }, (error, stdout, stderr) => {
    if (error !== null) {
      helpers.error(error);
    } else {
      helpers.success(`Meteor docs server starting at http://localhost:${self.config.meteorPort}/`);
    }
  });
};

Actions.prototype.stop = function() {
  var self         = this;
  var meteorPidCmd = `ps ax | grep meteor | grep 'index.js --port ${self.config.meteorPort}' | awk '{print $1}'`;
  var mongoPidCmd  = `ps ax | grep mongod | grep 'dbpath ${self.config.docsPath}' | awk '{print $1}'`;

  var killPid = function(pid) {
    exec(`kill -9 ${pid}`, (error, stdout, stderr) => {
      if (error === null) {
        helpers.success(`Stopped PID: ${pid}.`);
      }
    });
  }

  each([meteorPidCmd, mongoPidCmd], (cmd) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error !== null) {
        helpers.error(error);
      } else {
        pids = pull(stdout.split("\n"), "");

        if (pids.length === 2) {
          pid = pids[0];
          killPid(pid);
        }
      }
    });
  });
};

Actions.init = function() {
  var jsdocJson     = path.resolve("jsdoc.json");
  var jsdocConfJson = path.resolve("jsdoc-conf.json");

  if (fse.existsSync(jsdocJson)) {
    helpers.error("A JSDoc project already exists");
    process.exit(1);
  }

  var jsdocJsonExample     = path.resolve(__dirname, "..", "example", "jsdoc.json");
  var jsdocConfJsonExample = path.resolve(__dirname, "..", "example", "jsdoc-conf.json");

  fse.copySync(jsdocJsonExample, jsdocJson);
  fse.copySync(jsdocConfJsonExample, jsdocConfJson);

  helpers.success("JSDoc project initialized.");
  helpers.info(`Check "${jsdocJson}" for project specific options.`)
  helpers.info(`[Advanced] Check "${jsdocConfJson}" for jsdoc options.`);
};
