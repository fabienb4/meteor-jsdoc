# Meteor JSDoc

#### Automated JSDoc generation for Meteor projects

Meteor JSDoc is a command line tool which will help with generating documentation for your Meteor project. The result? A website like [Meteor Docs](http://docs.meteor.com/#/full/).

> meteor-jsdoc now uses the development version of jsdoc to provide better support for new Javascript syntax. You might encounter errors due to jsdoc itself, not meteor-jsdoc. Be sure to check the known [issues](https://github.com/jsdoc3/jsdoc/issues).

**Table of Contents**

- [Features](#features)
- [Installation](#installation)
- [Initializing a project](#initializing-a-project)
- [Config file](#config-file)
- [Preamble](#preamble)
- [Adding documentation to your project](#adding-documentation-to-your-project)
- [Building the docs](#building-the-docs)
- [Starting the Meteor server](#starting-the-meteor-server)
- [Stopping the Meteor server](#stopping-the-meteor-server)
- [Custom jsdoc tags](#custom-jsdoc-tags)
- [Updating](#updating)

### Features

* Based on the scripts & templates from Meteor own docs.
* The generated docs are used as data by a Meteor app which displays a nicely formatted documentation for your app (like the [Meteor Docs](http://docs.meteor.com/#/full/)) at `http://localhost/3333/` (configurable).
* A configuration file allows project based configuration, avoiding problem of _port already in use_.
* Markdown supported in `@summary`, `@example` & description in `@param`.

### Installation

    npm install -g meteor-jsdoc

If you are having issues and don't need ES6 support, use:

    npm install -g meteor-jsdoc@0.4.2

### Initializing a project

    meteor create myproject
    cd myproject
    meteor-jsdoc init

This will create a config file in your Meteor project directory:
`jsdoc.json`.

### Config file

```js
{
  // Execute meteor-jsdoc in debug mode to track down errors.
  "debug": false,
  // node.js install path, default to: "`which node`" on Mac and Linux, "`where node`" on Windows
  "nodePath": "",
  // Project docs path
  "docsPath": "~/myproject-docs",
  // Project docs Meteor server port, default to: 3333
  "meteorPort": 3333,
  // Copy the Meteor docs server before building the docs (required for the first build)
  // Setting this to false after the first build allows you to customize the Meteor docs server
  // without seeing your changes overridden the next time you build the docs.
  "initMeteor": true,
  // Update Meteor without overwriting your changes to the docs templates.
  "updateMeteor": true,
  // Add a preamble to your project's docs that will appear at the top of the docs.
  "preamble": true,
  // Link to the project repository (used to construct the file path in the docs). Optional.
  "projectRepo": "https://github.com/username/myproject/tree/master",
  // Values to be used in the `<head>` for the docs.
  "docsConfig": {
    "title": "Meteor Project Docs",
    "metas": {
      "description": "Documentation for a meteor project."
    }
  }
}
```

`<docsPath>` has to be in a different folder than your project, or you will end up with a Meteor server inside a Meteor server.

"~" can be used to specify your home directory.

When using `meteor-jsdoc build` for the first time, it requires the `initMeteor` setting to be true, otherwise, only the data files will be copied, and you won't be able to start the docs server (there will be none).

`<codeRepo>` is used to construct the link to the repository of your project depending on the current function/variable. With hosts like Github, be sure to include the branch in the link (`/tree/master` or whatever your host uses to link to the branch you want).

`<docsConfig>` allows you to customize the `<head>` of your docs. Each meta gets added according to the key/value.

> For the `jsdoc-conf.json` file see: [Configuring JSDoc](http://usejsdoc.org/about-configuring-jsdoc.html).

### Preamble

If you want to add a preamble to your project's docs, you need to enable the option in `jsdoc.json` (enabled by default).

```js
  "preamble": true
```

When building the docs, a file named `preamble.md` will be copied inside `<docsPath>/client/templates`.

> The default preamble will NOT be copied if it is detected in your project's docs, so you can leave `preamble` to `true` in `jsdoc.conf`.

You can edit it to add any content you want, it will be displayed at the top of your project's docs. **Do NOT change or remove the first and last lines inside the file.**

*Both Markdown and HTML syntaxes are supported in the file, but you should stick to Markdown to avoid any unwanted side-effects.*

A table of content is generated automatically for you using the `id="whatever"` occurrences in the compiled `preamble.md` and displayed above the API links in the navbar.
For this reason, you should use the markdown syntax for headers (# ... ######). This way each header will get a link in the navbar according to its type (h1 to h6).

> If your preamble is no longer displayed in the docs, you can look at the `app.log` file in `<docsPath>` to see what went wrong.

Here is an example:

```markdown
{{#template name="preamble"}}

# Meteor Project Docs
*****

## Header 1
This is paragraph one.

This is paragraph two.

## Header 2
### Header A
* Red
* Green
* Blue
### Header B
* Small
* Medium
* Large

{{/template}}
```

### Adding documentation to your project

Some examples from the `mongo` package:

> The `@summary` tag is required for the docs to be generated properly. Any method docs without it won't be processed by `meteor-jsdoc`.

```js
/**
 * @summary Constructor for a Collection
 * @locus Anywhere
 * @instancename collection
 * @class
 * @param {String} name The name of the collection.  If null, creates an unmanaged (unsynchronized) local collection.
 * @param {Object} [options]
 * @param {Object} options.connection The server connection that will manage this collection. Uses the default connection if not specified.  Pass the return value of calling [`DDP.connect`](#ddp_connect) to specify a different server. Pass `null` to specify no connection. Unmanaged (`name` is null) collections cannot specify a connection.
 * @param {String} options.idGeneration The method of generating the `_id` fields of new documents in this collection.  Possible values:
 - **`'STRING'`**: random strings
 - **`'MONGO'`**:  random [`Mongo.ObjectID`](#mongo_object_id) values
The default id generation technique is `'STRING'`.
 * @param {Function} options.transform An optional transformation function. Documents will be passed through this function before being returned from `fetch` or `findOne`, and before being passed to callbacks of `observe`, `map`, `forEach`, `allow`, and `deny`. Transforms are *not* applied for the callbacks of `observeChanges` or to cursors returned from publish functions.
 */
Mongo.Collection = function(name, options) {
  /** ... **/
};
```

```js
/**
 * @summary Find the documents in a collection that match the selector.
 * @locus Anywhere
 * @method find
 * @memberOf Mongo.Collection
 * @instance
 * @param {MongoSelector} [selector] A query describing the documents to find
 * @param {Object} [options]
 * @param {MongoSortSpecifier} options.sort Sort order (default: natural order)
 * @param {Number} options.skip Number of results to skip at the beginning
 * @param {Number} options.limit Maximum number of results to return
 * @param {MongoFieldSpecifier} options.fields Dictionary of fields to return or exclude.
 * @param {Boolean} options.reactive (Client only) Default `true`; pass `false` to disable reactivity
 * @param {Function} options.transform Overrides `transform` on the  [`Collection`](#collections) for this cursor.  Pass `null` to disable transformation.
 * @returns {Mongo.Cursor}
 */
find: function(/* selector, options */) {
  /** ... **/
}
```

### Building the docs

    meteor-jsdoc build

This will copy a basic Meteor server (`v1.1.0.2`) to the `<docsPath>` directory.
And then build the documentation for your project in `<docsPath>/client/data`.

### Starting the Meteor server

From your project folder you have two options:

First:

    meteor-jsdoc start

This will automatically start the Meteor server in `<docsPath>` in the background. **The default address is: `http://localhost:3333/`**. The `<meteorPort>` option in `jsdoc.json` allows you to change the port.

Second:

    cd <docsPath>
    meteor

This will start Meteor as usual with the possibility to `ctrl+c` when you want to stop it.

First method doesn't currently work on Windows.

### Stopping the Meteor server

If you started the Meteor server for the docs using `meteor-jsdoc start`, and want to stop it, the following command (to run from your project folder) is available:

    meteor-jsdoc stop

This will stop the Meteor server associated with `<docsPath>` and `<meteorPort>`.

### Custom jsdoc tags.

- `@before` & `@after`

  These two custom tags are displayed before and after the documentation of a function/variable. You can add them if you want to specify something regarding it but don't want to put everything in the `@summary` (See [example](http://docs.meteor.com/#/full/meteor_publish)). Markdown is supported.

### Updating

To update `meteor-jsdoc` to the latest version, just type:

    npm update meteor-jsdoc -g

You should try and keep `meteor-jsdoc` up to date in order to keep up with the latest Meteor changes.


[![Support via Gratipay](https://cdn.rawgit.com/gratipay/gratipay-badge/2.3.0/dist/gratipay.svg)](https://gratipay.com/fabienb4/)
