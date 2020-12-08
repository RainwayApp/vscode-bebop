"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const bebop_tools_1 = require("bebop-tools");
let diagnosticCollection;
let diagnosticMap = new Map();
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "bebop" is now active!');
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('bebop.helloWorld', () => {
        // The code you place here will be executed every time your command is executed
        // Display a message box to the user
        vscode.window.showInformationMessage('Hello World from bebop!');
    });
    diagnosticCollection = vscode.languages.createDiagnosticCollection('bebop');
    const onChangeDisposable = vscode.workspace.onDidChangeTextDocument((event) => {
        onChange(event);
    });
    context.subscriptions.push(disposable, onChangeDisposable);
}
exports.activate = activate;
function onChange(event) {
    return __awaiter(this, void 0, void 0, function* () {
        if (event.document.languageId === 'bebop') {
            diagnosticCollection.clear();
            const uri = event.document.uri;
            if (uri.scheme === 'file') {
                const checkOutput = yield bebop_tools_1.check(uri.fsPath);
                const issues = checkOutput.issues;
                if (issues === null || issues === void 0 ? void 0 : issues.length) {
                    //let diagnostics = diagnosticMap.get(uri)
                    let diagnostics = [];
                    for (const issue of issues) {
                        let range = new vscode.Range(issue.line - 1, issue.column - 1, issue.line - 1, issue.column);
                        diagnostics.push(new vscode.Diagnostic(range, issue.description, vscode.DiagnosticSeverity.Error));
                    }
                    diagnosticMap.set(uri, diagnostics);
                }
                console.log(checkOutput);
            }
            for (const [uri, diagnostics] of diagnosticMap) {
                diagnosticCollection.set(uri, diagnostics);
            }
            console.log("Bebop file changed.");
        }
    });
}
// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map