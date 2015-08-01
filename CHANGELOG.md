meteor-jsdoc
=========================

Automated JSDoc generation for Meteor projects with a Meteor server to output the docs.

## ChangeLog

### 0.5.1

- Added jsdoc errors & warnings logging support.
- Updated build scripts to match Meteor's.

### 0.5.0

- Switched to development version of jsdoc to provide ES6 support until officially released.

### 0.4.2

- Remove new line special character in `which node` output.

### 0.4.1

- `nodePath` config default is now empty (`which node` is used if not specified).
- Improved some config checks.

### 0.4.0

- `nodePath` is now retrieved automatically if not specified (using `which node`).
- Updated dependencies.

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
