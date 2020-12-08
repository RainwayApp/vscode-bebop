// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import {check} from 'bebop-tools'

let diagnosticCollection: vscode.DiagnosticCollection
let diagnosticMap: Map<vscode.Uri, vscode.Diagnostic[]> = new Map()

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

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

	diagnosticCollection = vscode.languages.createDiagnosticCollection('bebop')

	const onChangeDisposable = vscode.workspace.onDidChangeTextDocument((event) => {
		onChange(event)
	})

	context.subscriptions.push(disposable, onChangeDisposable)
}

async function onChange(event: vscode.TextDocumentChangeEvent) {
	if (event.document.languageId === 'bebop') {
		diagnosticCollection.clear()
		const uri = event.document.uri
		if (uri.scheme === 'file') {
			
			const checkOutput = await check(uri.fsPath)
			const issues = checkOutput.issues
			if (issues?.length) {
				//let diagnostics = diagnosticMap.get(uri)
				let diagnostics = []
				for (const issue of issues) {
					let range = new vscode.Range(issue.line-1, issue.column-1, issue.line-1, issue.column)
					diagnostics.push(new vscode.Diagnostic(range, issue.description, vscode.DiagnosticSeverity.Error))
				}
				diagnosticMap.set(uri, diagnostics)
			}
			console.log(checkOutput)
		}
		for (const [uri, diagnostics] of diagnosticMap) {
			diagnosticCollection.set(uri, diagnostics)
		}
		console.log("Bebop file changed.")
	}
}

// this method is called when your extension is deactivated
export function deactivate() {

}
