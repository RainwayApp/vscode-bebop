// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'
import { checkProject, checkSchema, ensurePermissions } from 'bebop-tools'
import path = require('path')
import child_process = require('child_process')
import util = require('util')

const exec = util.promisify(child_process.exec)

let diagnosticCollection: vscode.DiagnosticCollection
let diagnosticMap: Map<string, vscode.Diagnostic[]> = new Map()

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
	await ensurePermissions()
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Bebop activated.');

	diagnosticCollection = vscode.languages.createDiagnosticCollection('bebop')

	if (vscode.window.activeTextEditor?.document) {
		updateDiagnostics(vscode.window.activeTextEditor.document)
	}
	/* const onChangeEditorDisposable = vscode.window.onDidChangeActiveTextEditor((event) => {
		if (event?.document) {
			updateDiagnostics(event.document)
		}
	}) */
	const onSaveDisposable = vscode.workspace.onDidSaveTextDocument((document) => {
		updateDiagnostics(document)
	})
	const onChangeDisposable = vscode.workspace.onDidChangeTextDocument((event) => {
		clearDiagnosticsForDirty(event.document)
	})
	context.subscriptions.push(onSaveDisposable, onChangeDisposable)
	//context.subscriptions.push(onChangeDisposable, onChangeEditorDisposable)
}

/**
 * We currently have no way to run diagnostics on dirty files AND
 * the rest of the project, which is necessary to check imports.
 * So instead, warn the user to save the dirty file to see diagnostics.
 */
function clearDiagnosticsForDirty(document: vscode.TextDocument) {
	if (document.languageId === 'bebop' && document.isDirty) {
		/* let checked = false */
		const diagnostic = new vscode.Diagnostic(
			new vscode.Range(0, 0, 0, 1), 
			"Save file to see diagnostics.", 
			vscode.DiagnosticSeverity.Information
		)
		diagnosticCollection.set(document.uri, [diagnostic])
		/* diagnosticCollection.forEach((uri, diagnostics) => {
			if (uri.toString() === document.uri.toString()) {
				diagnosticCollection.set(uri, [diagnostic])
				checked = true
			}
		}) */
		
	}
}

/** To be run on file change. Runs compiler in check mode and loads diagnostics. */
async function updateDiagnostics(document: vscode.TextDocument) {
	if (document.languageId === 'bebop') {
		const uri = document.uri
		if (uri.scheme === 'file') {
			diagnosticCollection.clear()
			// Just for right now
			diagnosticMap.clear()
			//const checkOutput = await checkSchema(document.getText())
			const checkOutput = await checkProject({directory: path.resolve(document.uri.fsPath, "..")})
			console.log(checkOutput)
			if (checkOutput.error) {
				const issues = checkOutput.issues
				const seenUris: string[] = []
				for (const issue of issues) {
					let range = new vscode.Range(issue.startLine, issue.startColumn, issue.endLine, issue.endColumn)
					const issueUri = vscode.Uri.file(issue.fileName)
					const diagnostic = new vscode.Diagnostic(range, issue.description, vscode.DiagnosticSeverity.Error)
					console.log(seenUris)
					if (!seenUris.includes(issueUri.toString())) {
						diagnosticMap.set(issueUri.toString(), [])
					}
					const diagnosticsForUri = diagnosticMap.get(issueUri.toString())
					diagnosticsForUri!.push(diagnostic)
					seenUris.push(issueUri.toString())
				}
			}
			else {
				diagnosticMap.clear()
			}
			for (const [uri, diagnostics] of diagnosticMap) {
				diagnosticCollection.set(vscode.Uri.parse(uri), diagnostics)
				console.log(uri, diagnostics)
			}
		}
	}
}

// this method is called when your extension is deactivated
export function deactivate() {

}
