# slim-eidos README

![SLiM Icon](images/SLiM_256.jpg)

This VSCode extension is built to provide grammar highlighting in Eidos scripts. Eidos is the domain-specific language used within the SLiM framework to simulate the genetics of a population forward-in-time.

## Features

![Highlighting and Hover Functionality](images/highlight_hover.png)

Grammar highlighting includes comments, keywords, etc. The colors are determined by the settings in your local VS Code/Cursor/etc instance.

Only .slim files are automatically associated with eidos grammar, as .txt is too broadly used. If you are not seeing grammar highlighting and this is the issue, consider changing .txt files to .slim files, or manually change the language mode by clicking on the button in the bottom right of VS Code and related editors.

Completions, snippets, hover and diagnostic providers coded with the help of Cursor and Claude.

<!-- ## Extension Settings

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

* `myExtension.enable`: Enable/disable this extension.
* `myExtension.thing`: Set to `blah` to do something. -->

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

<!-- ## Known Issues

No known issues identified yet. -->

## Installing the Extension

There are several ways to use this extension:

### Development/Testing
If you want to test the extension or contribute improvements:
1. Clone this repository
2. Install [Node.js](https://nodejs.org/) if you haven't already
3. Open the extension folder in VS Code
4. Run `npm install` to install dependencies
5. Run `npm run vscode:prepublish` (or `npm run compile` from terminal)
6. Press F5 in VS Code to open a new window with the extension running

### Installation for Regular Use
Currently, there are two methods to install the extension:

1. **VS Code Marketplace** (Recommended if available, should be up soon)
   - Open VS Code
   - Click the Extensions icon in the sidebar (or press Ctrl+Shift+X)
   - Search for "slim-eidos"
   - Click Install

2. **Manual Installation**
   - Download a .vsix file from the [latest release](https://github.com/csmcal/slim-eidos-vsc-extension/releases/)
   - Open VS Code
   - Press Ctrl+Shift+P and type "Install from VSIX"
   - Select the downloaded .vsix file

## Release Notes

Only the primary release has been made available so far.

### 0.1

Initial release of the slim-eidos grammar highlighting extension.

---
<!-- 
## Working with Markdown

You can author your README using Visual Studio Code. Here are some useful editor keyboard shortcuts:

* Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux).
* Toggle preview (`Shift+Cmd+V` on macOS or `Shift+Ctrl+V` on Windows and Linux).
* Press `Ctrl+Space` (Windows, Linux, macOS) to see a list of Markdown snippets.

## For more information

* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!** -->
