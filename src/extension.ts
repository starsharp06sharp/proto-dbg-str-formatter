// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { DomTree, parse as parse_prototxt } from './jison-prototxt/prototxt';

let logger = vscode.window.createOutputChannel("proto-dbg-str-formatter");

function tarvelDomTree(tree: DomTree, tabStr: string, tabCount: number): string {
	let prefix = tabStr.repeat(tabCount);
	if (typeof tree.value === "string") {
		return prefix + tree.key + ": " + tree.value + "\n";
	}
	let text = prefix + tree.key + " {\n";
	tree.value.forEach(val => {
		text += tarvelDomTree(val, tabStr, tabCount + 1);
	});
	text += prefix + "}\n";
	return text;
}

function transParseResult2FormatedText(result: DomTree[], tabStr: string) {
	let text = "";
	result.forEach(val => {
		text += tarvelDomTree(val, tabStr, 0);
	});
	return text;
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	vscode.languages.registerDocumentFormattingEditProvider('prototxt', {
		provideDocumentFormattingEdits(document: vscode.TextDocument): vscode.TextEdit[] {
			const lastLine = document.lineAt(document.lineCount - 1);
			return [vscode.TextEdit.replace(
				new vscode.Range(0, 0, lastLine.lineNumber, lastLine.text.length),
				transParseResult2FormatedText(parse_prototxt(document.getText()), "  "),
			)];
		}
	});

}

// this method is called when your extension is deactivated
export function deactivate() { }
