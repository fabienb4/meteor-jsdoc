/*global require: true */
(function() {
  "use strict";

  // This file receives data from JSDoc via the `publish` exported function,
  // and converts it into JSON that is written to a file.

  const fs        = require("jsdoc/fs");
  const helper    = require("jsdoc/util/templateHelper");
  const each      = require("lodash/each");
  const extend    = require("lodash/extend");
  const stringify = require("canonical-json");
  const path      = require("path");

  // This is the big map of name -> data that we'll write to a file.
  var dataContents = {};
  // List of just the names, which we'll also write to a file.
  var names        = [];

  /**
   * Get a tag dictionary from the tags field on the object, for custom fields
   * like package
   * @param  {JSDocData} data The thing you get in the TaffyDB from JSDoc
   * @return {Object}      Keys are the parameter names, values are the values.
   */
  var getTagDict = function(data) {
    var tagDict = {};

    if (data.tags) {
      each(data.tags, function(tag) {
        tagDict[tag.title] = tag.value;
      });
    }

    return tagDict;
  };

  // Fix up a JSDoc entry and add it to `dataContents`.
  var addToData = function(entry) {
    extend(entry, getTagDict(entry));

    // strip properties we don't want
    // entry.comment = undefined;
    entry.___id = undefined;
    entry.___s  = undefined;
    entry.tags  = undefined;

    // generate `.filepath` and `.lineno` from `.meta`
    if (entry.meta && entry.meta.path) {
      var currentDir = entry.meta.path.replace(process.env.PWD, "");

      entry.filename = entry.meta.filename;
      entry.filepath = process.env.PROJECT_REPO + currentDir + "/" + entry.filename;
      entry.lineno   = entry.meta.lineno;
    }

    entry.meta = undefined;

    names.push(entry.longname);

    dataContents[entry.longname] = entry;
  };

  /**
    Entry point where JSDoc calls us.  It passes us data in the form of
    a TaffyDB object (which is an in-JS database of sorts that you can
    query for records.

    @param {TAFFY} taffyData See <http://taffydb.com/>.
    @param {object} opts
    @param {Tutorial} tutorials
   */
  exports.publish = function(taffyData) {
    var data = helper.prune(taffyData);

    var namespaces = helper.find(data, { kind: "namespace" });

    // prepare all of the namespaces
    each(namespaces, function(namespace) {
      if (namespace.summary) {
        addToData(namespace);
      }
    });

    // prepare all of the members
    var properties = helper.find(data, { kind: "member" });

    each(properties, function(property) {
      if (property.summary) {
        addToData(property);
      }
    });

    // prepare all of the constants
    var constants = helper.find(data, { kind: "constant" });

    each(constants, function(constant) {
      if (constant.summary) {
        addToData(constant);
      }
    });

    // Callback descriptions are going to be embeded into Function descriptions
    // when they are used as arguments, so we always attach them to reference
    // them later.
    var callbacks = helper.find(data, { kind: "typedef" });

    each(callbacks, function(cb) {
      delete cb.comment;
      addToData(cb);
    });

    var functions    = helper.find(data, { kind: "function" });
    var constructors = helper.find(data, { kind: "class" });

    // we want to do all of the same transformations to classes and functions
    functions = functions.concat(constructors);

    // insert all of the function data into the namespaces
    each(functions, function(func) {
      if (! func.summary) {
        // we use the @summary tag to indicate that an item is documented
        return;
      }

      var filteredParams = [];

      // Starting a param with `xyz.` makes it a special argument, not a
      // param.  Dot (`.`) in this case binds tighter than comma, so
      // `xyz.foo,bar` will create a special argument named `foo, bar`
      // (representing two arguments in the docs).  We process pipes so
      // that `xyz.foo|bar` also results in `foo, bar`.
      each(func.params, function(param) {
        param.name = param.name || '';

        param.name = param.name.replace(/,|\|/g, ", ");

        var splitName = param.name.split(".");

        if (splitName.length < 2) {
          // not an option
          filteredParams.push(param);

          return;
        }

        if (splitName.length > 2) {
          param.name = _.rest(splitName).join(".");
        } else {
          param.name = splitName[1];
        }

        if (typeof func[splitName[0]] === 'object') {
          func[splitName[0]].push(param);
        } else {
          func[splitName[0]] = [param];
        }
      });

      func.params = filteredParams;

      if (typeof func.comment === 'string') {
        // the entire unparsed doc comment.  takes up too much room in the
        // data file.
        delete func.comment;
      }

      addToData(func);
    });

    // write full docs JSON
    var jsonString = stringify(dataContents, null, 2);
    var jsString = "DocsData = " + jsonString + ";";
    jsString = "// This file is automatically generated by meteor-jsdoc. Regenerate it with 'meteor-jsdoc build'\n" + jsString;
    var docsDataFilename = process.env.DOCS_PATH + "/client/data/docs-data.js";
    fs.writeFileSync(docsDataFilename, jsString);

    // write name tree JSON
    jsonString = stringify(names.sort(), null, 2);
    jsString = "DocsNames = " + jsonString + ";";
    jsString = "// This file is automatically generated by meteor-jsdoc. Regenerate it with 'meteor-jsdoc build'\n" + jsString;
    var nameTreeFilename= process.env.DOCS_PATH + "/client/data/docs-names.js";
    fs.writeFileSync(nameTreeFilename, jsString);
  };
})();
