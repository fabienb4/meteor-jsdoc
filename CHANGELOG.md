meteor-jsdoc
=========================

Automated JSDoc generation for Meteor projects.

## ChangeLog

### 0.10.0

- Changed from `git grep` to `grep` to avoid git/non-git folder problems.
- Added defaults for configs.
- Added `debug` config.
- Logging is now more verbose.
- Added support for `@constant` kind.
- Cleanup.
- Updated README.

### 0.9.0 [BREAKING]

- Improved `filepath`. Now able to display links to the repository under the function/variable name.
- Added support for `<head>` customization via config.
- Added `@before` and `@after` custom jsdoc tags to be able to include custom markdown before and after a function/variable's documentation.
- Cleaned up CSS.

> You need to update your config and templates to use the new features.

> `head.html` is now overridden on build, to customize it, use the `docsConfig` variable in `jsdoc.conf`. Any custom code can go in `preamble.md`.

### 0.8.0

- Added Windows support.
- Updated Meteor for docs to 1.2.1.

### 0.7.5

- Fixed `filepath` & `lineno` to work outside `packages` folder.

### 0.7.4

- Fixed problem with special arguments detection.

### 0.7.3

- Handle proper display of "Array of Array of Types".

### 0.7.2

- Fixed special arguments' nested arguments.

### 0.7.1

- Updated jsdoc's file inclusion pattern to recognize `.jsx` files by default.
- Updated log messages for start/stop.
- Handle any name for special argument not just `options`.

### 0.7.0

- Updated Meteor for docs to 1.2.0.2.
  - Make use of ES6.
- Added new config `updateMeteor`. Allow Meteor to be updated without overwriting your changes.
- Fixed `meteor-jsdoc stop` command.

### 0.6.2

- Fixed meteorPort not being properly validated.
- Updated Meteor for docs to 1.1.0.3.

### 0.6.1

- node v0.12 or higher required.
- Added more checks to prevent errors in console.
- Fixed helper name.

### 0.6.0

- Improved preamble handling. A separate markdown file is now used.
- Enhanced the build process to make the preamble handling smoother.
- Improved design for preamble.

### 0.5.2

- Added preamble support.

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
