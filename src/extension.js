// https://code.visualstudio.com/api/get-started/extension-anatomy#extension-entry-file
const vscode = require('vscode');
const {
	renderHTML
} = require('./render');

let panel = null;
let activeLiveEditorDocument = null;
let hasLinkedPanel = false;

function activate(context) {
	const previewRegExp = vscode.commands.registerCommand('regexExplainer.previewRegExp', async function (uri) {

		let editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showWarningMessage('Please, Open a file first !');
			return;
		}
		let selection = editor.selection;
		const document=editor.document;
		let text = document.getText(selection);
		if (!text) return;
		text = text.trim();
		let reg = /(?:\b|^|=)\s*new RegExp\s*\(([^,\)]+)\s*(?:,\s*(['"])([^']+)\2)?\);?/;
		let match = reg.exec(text);
		if (match) {
			text = match[1];
			if (match.length > 3) {
				text += match[3];
			}
		}

		if (!panel || panel._isDisposed) {
			panel = createWebviewPanel();
		}
		if (activeLiveEditorDocument) {
			hasLinkedPanel = false;
			await closeEditor(activeLiveEditorDocument);
			activeLiveEditorDocument = null;
			await vscode.window.showTextDocument(document);
		}
		panel.webview.html = renderHTML(text);
	});

	const regExpEditor = vscode.commands.registerCommand('regexExplainer.regExpEditor', async function () {
		if (activeLiveEditorDocument) {
			try {
				activeLiveEditorDocument = vscode.workspace.textDocuments.find(doc => doc.uri._formatted == activeLiveEditorDocument.uri._formatted);
				if (!activeLiveEditorDocument)
					activeLiveEditorDocument = null;
				else {
					await vscode.window.showTextDocument(activeLiveEditorDocument);
					await vscode.commands.executeCommand('editor.action.selectAll');
				}
			} catch (err) {
				vscode.window.showErrorMessage('An error has occurred while refreshing the doc ' + err);
			}
		}

		if (!activeLiveEditorDocument) {
			vscode.workspace.openTextDocument({
					content: '',
					language: 'js'
				})
				.then((doc) => {
					activeLiveEditorDocument = doc;
					return vscode.window.showTextDocument(doc);
				})
				.then((editor) => {
					if (!editor) {
						vscode.window.showInformationMessage('Open a file first!')
						return;
					}
					if (!panel || panel._isDisposed) {
						panel = createWebviewPanel();
					}
					hasLinkedPanel = true;
					let text = activeLiveEditorDocument.getText().trim();
					panel.webview.html = renderHTML(text);
				});
		}
	})

	const getExplainRegex = vscode.commands.registerCommand('regexExplainer.getExplainRegexHtml', function (regex) {
		return renderHTML(regex);
	});

	context.subscriptions.push(previewRegExp, regExpEditor, getExplainRegex,
		vscode.workspace.onDidChangeTextDocument(function (event) {
			if (!activeLiveEditorDocument || !panel)
				return;
			if (event.document.uri._formatted === activeLiveEditorDocument.uri._formatted) {
				let text = event.document.getText().trim();
				panel.webview.html = renderHTML(text);
			}
		}),
		vscode.workspace.onDidCloseTextDocument(function (closedDocument) {
			try {
				if (activeLiveEditorDocument && activeLiveEditorDocument.uri._formatted === closedDocument.uri._formatted) {
					activeLiveEditorDocument = null;
					if (hasLinkedPanel) {
						panel.dispose();
						panel = null;
					}
				}
			} catch (err) {
				vscode.window.showErrorMessage('An error has occurred while closing the editor: ' + err);
			}
		})
	);
}

function createWebviewPanel() {
	let panel = vscode.window.createWebviewPanel(
		'RegexExplainer',
		'Explain RegExp',
		vscode.ViewColumn.Two, {
			enableScripts: true,
			retainContextWhenHidden: true,
		}
	);
	panel.onDidDispose(async (event) => {
		try {
			if (activeLiveEditorDocument) {
				hasLinkedPanel = false;
				await closeEditor(activeLiveEditorDocument);
			}
		} catch (err) {
			vscode.window.showErrorMessage('An error has occurred while closing the panel: ' + err);
		}
	});
	return panel;
}

async function closeEditor(textEditorDocument) {
	await vscode.window.showTextDocument(textEditorDocument);
	await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
}

function deactivate() {}

module.exports = {
	activate,
	deactivate
}