# Bebop support for Visual Studio Code

## Getting started

First check out `vsc-extension-quickstart.md`. You can use the F5 key to start a new window with the extension enabled, but make sure you have `yarn run watch` running beforehand.

The meat of the extension lives in `src/extension.ts`. This project interfaces with `bebop-tools`, a small JS wrapper around bebopc. You can use `yarn link` to work on both projects simultaneously. Before publishing a new version of this project, you'll want to publish `bebop-tools` to npm, update the version in package.json in this project, and make sure to run `yarn` to install it, as extension packaging and publishing includes the `node_modules` directory as present within the project.

This setup isn't perfect. Ideally, `bebopc` should have a language server mode, then we'd be able to benefit from the standardized language server protocol.

## Publishing a new version
Make sure the bebop-tools version is set appropriately, dependencies up to date and the project is built (`yarn run compile`).
You'll need to contact Andrew to get set up with an Azure DevOps account and personal access token, as they are the one responsible for publishing in the past. Check [this documentation](https://code.visualstudio.com/api/working-with-extensions/publishing-extension) for more information.

(I'm working on a Github Actions workflow to make this more seamless.)
