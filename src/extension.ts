// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "proto-dbg-str-formatter" is now active!');

	vscode.languages.registerDocumentFormattingEditProvider('prototxt', {
		provideDocumentFormattingEdits(document: vscode.TextDocument): vscode.TextEdit[] {
			const firstLine = document.lineAt(0);
			return [vscode.TextEdit.insert(firstLine.range.start, '\n')];
		}
	});
}

// this method is called when your extension is deactivated
export function deactivate() { }
