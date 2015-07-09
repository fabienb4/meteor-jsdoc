meteor-jsdoc
=========================

Automated JSDoc generation for Meteor projects with a Meteor server to output the docs.

## ChangeLog

### 0.3.2

- `jsdoc-conf.json` file is now copied in your project to allow you to customize options passed to jsdoc.

### 0.3.1

- `projectPath` is now retrieved automatically. It can safely be removed from the `jsdoc.json` file.
- Cleaned up some old code.

### 0.3.0

- `jsdocPath` is now retrieved automatically. It can safely be removed from the `jsdoc.json` file.

### 0.2.5

- Errors are now properly displayed in terminal.
- Fix to allow meteor-jsdoc to work when used in a non-git folder.
