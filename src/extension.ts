// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { DomTree, parser } from './jison-prototxt/prototxt';

let logger = vscode.window.createOutputChannel("proto-dbg-str-formatter");
let diagnosticCollection: vscode.DiagnosticCollection;

function tryTranslateUtf8EscapeStr(escapedStr: string): string {
	if (escapedStr[0] !== '"') {
		return escapedStr;
	}
	try {
		let unescaped = false;
		// translate octal escaped character like '\\346' TO '\xe6'
		let utf8Str = escapedStr.replace(/(\\)+[0-7]{3}/g, val => {
			let len = val.length;
			if (len % 2 !== 0) {
				// deal with situation like '\\\\346'
				return val;
			}
			unescaped = true;
			return val.substring(0, len - 4) + String.fromCharCode(parseInt(val.substring(len - 3), 8));
		});
		if (!unescaped) {
			return escapedStr;
		}
		return decodeURIComponent(escape(utf8Str));
	} catch (error) {
		logger.appendLine(`try traslate ${escapedStr} error: ${error}`);
		return escapedStr;
	}
}

function tarvelDomTree(tree: DomTree, tabStr: string, tabCount: number): string {
	let prefix = tabStr.repeat(tabCount);
	if (typeof tree.value === "string") {
		return prefix + tree.key + ": " + tryTranslateUtf8EscapeStr(tree.value) + "\n";
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

function reduceErrorMessageToOneLine(message: string) {
	let splitMessage = message.split('\n');
	if (message.startsWith('Parse error on line ')) {
		if (splitMessage.length === 4) {
			return splitMessage[0] + ' ' + splitMessage[3];
		}
	} else if (message.startsWith('Lexical error on line ')) {
		return splitMessage[0];
	}
	return message;
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	diagnosticCollection = vscode.languages.createDiagnosticCollection('prototxt');
	context.subscriptions.push(diagnosticCollection);

	vscode.languages.registerDocumentFormattingEditProvider('prototxt', {
		provideDocumentFormattingEdits(document: vscode.TextDocument): vscode.TextEdit[] {
			diagnosticCollection.clear();

			let domTrees: DomTree[];
			try {
				domTrees = parser.parse(document.getText());
			} catch (error) {
				// Example:
				// 'Parse error on line 1:
				// abc: "123" def: 123 ]
				// --------------------^
				// Expecting 'EOF', 'IDENT', '}', got ']''
				vscode.window.showErrorMessage(reduceErrorMessageToOneLine(error.message));

				// Example:
				// {
				//     text: "1",
				//     token: "INVALID",
				//     line: 0,
				//     loc: { first_line: 1, last_line: 1, first_column: 14, last_column: 15 },
				//     expected: [ "'NUMBER'", "'STRING'", "'IDENT'" ],
				// }
				let hash = error.hash;
				let matchLength = Math.min(hash.text.length, 20);
				let errRange = new vscode.Range(
					hash.loc.first_line - 1, hash.loc.first_column,
					hash.loc.last_line - 1, hash.loc.last_column + matchLength
				);
				diagnosticCollection.set(
					document.uri,
					[new vscode.Diagnostic(errRange, error.message)]
				);
				let editor = vscode.window.activeTextEditor;
				editor?.revealRange(errRange, vscode.TextEditorRevealType.InCenter);
				return [];
			}

			if (domTrees.length === 0) {
				return [];
			}
			const lastLine = document.lineAt(document.lineCount - 1);
			return [vscode.TextEdit.replace(
				new vscode.Range(0, 0, lastLine.lineNumber, lastLine.text.length),
				transParseResult2FormatedText(domTrees, "  "),
			)];
		}
	});

}

// this method is called when your extension is deactivated
export function deactivate() { }
