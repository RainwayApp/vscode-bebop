// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'
import {checkSchema} from 'bebop-tools'
import path = require('path')
import child_process = require('child_process')
import util = require('util')

const exec = util.promisify(child_process.exec)

let diagnosticCollection: vscode.DiagnosticCollection
let diagnosticMap: Map<vscode.Uri, vscode.Diagnostic[]> = new Map()

async function ensurePermissions() {
	const toolsDir = path.resolve(require.resolve('bebop-tools'), '../../tools')
	if (process.platform === "darwin") {
		const executable = path.resolve(toolsDir, 'macos/bebopc')
		await exec(`chmod +x "${executable}"`)
	}
	else if (process.platform === "linux") {
		const executable = path.resolve(toolsDir, 'linux/bebopc')
		await exec(`chmod +x "${executable}"`)
	}
	else if (process.platform === "win32") {
		const executable = path.resolve(toolsDir, 'windows/bebopc.exe')
		await exec(`Unblock-File -Path "${executable}"`, {shell: "powershell.exe"})
	}
}

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
	const onChangeEditorDisposable = vscode.window.onDidChangeActiveTextEditor((event) => {
		if (event?.document) {
			updateDiagnostics(event.document)
		}
	})
	const onChangeDisposable = vscode.workspace.onDidChangeTextDocument((event) => {
		updateDiagnostics(event.document)
	})
	vscode.workspace.onDidSaveTextDocument((event) => {

	})
	context.subscriptions.push(onChangeDisposable, onChangeEditorDisposable)
}



/** To be run on file change. Runs compiler in check mode and loads diagnostics. */
async function updateDiagnostics(document: vscode.TextDocument) {
	if (document.languageId === 'bebop') {
		const uri = document.uri
		if (uri.scheme === 'file') {
			diagnosticCollection.clear()
			const checkOutput = await checkSchema(document.getText())
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
