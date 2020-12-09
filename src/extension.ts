// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import {checkSchema} from 'bebop-tools'

let diagnosticCollection: vscode.DiagnosticCollection
let diagnosticMap: Map<vscode.Uri, vscode.Diagnostic[]> = new Map()

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Bebop activated.');

	diagnosticCollection = vscode.languages.createDiagnosticCollection('bebop')
	const onChangeDisposable = vscode.workspace.onDidChangeTextDocument((event) => {
		onChange(event)
	})
	context.subscriptions.push(onChangeDisposable)
}

/** To be run on file change. Runs compiler in check mode and loads diagnostics. */
async function onChange(event: vscode.TextDocumentChangeEvent) {
	if (event.document.languageId === 'bebop') {
		const uri = event.document.uri
		if (uri.scheme === 'file') {
			diagnosticCollection.clear()
			const checkOutput = await checkSchema(event.document.getText())
			const issues = checkOutput.issues
			const diagnostics = []
			if (issues?.length) {
				for (const issue of issues) {
					let range = new vscode.Range(issue.startLine, issue.startColumn, issue.endLine, issue.endColumn)
					diagnostics.push(new vscode.Diagnostic(range, issue.description, vscode.DiagnosticSeverity.Error))
				}
			}
			diagnosticMap.set(uri, diagnostics)
			for (const [uri, diagnostics] of diagnosticMap) {
				diagnosticCollection.set(uri, diagnostics)
			}
		}
	}
}

// this method is called when your extension is deactivated
export function deactivate() {

}
