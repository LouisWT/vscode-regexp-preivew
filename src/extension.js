const vscode = require('vscode');
const {
	renderHTML
} = require('./render');

/**
 * TODO: please translate into plain english, in order to allow more developers to contribute
 * 激活插件时会调用
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	let panel = null;
	let activeLiveEditor = null;
	// 注册命令 extension.showRegExp
	// 回调中是命令会做的事情
	// 回调函数的参数
	// 1. 如果是从资源管理器右键执行命令，那么会把选中资源的路径 uri 传递过去
	// 2. 从编辑器中右键菜单执行，那么会把当前文件路径 url 传递过去
	// 3. 直接按 ctrl + shift + p 执行命令，这个参数为空
	const previewRegExp = vscode.commands.registerCommand('regexExplainer.previewRegExp', async function (uri) {

		let editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showWarningMessage('Please, Open a file first !');
			return;
		}
		let selection = editor.selection;
		let text = editor.document.getText(selection);
		if (!text) return;
		text = text.trim();
		let reg = /(?:\b|^|=)\s*new RegExp\s*\(([^,\)]+)(?:,(['"])([^']+)\2)?\);?/;
		// new RegExp 形式的正则表达式，那么需要转为 /  / 形式的正则
		// NEVER DO THIS ! because you can't trust users https://alligator.io/js/eval/
		// if (reg.test(text)) {
		// 	text = eval(text).toString();
		// }
		let match = reg.exec(text);
		if (match) {
			text = match[1];
			if (match.length > 3) {
				text += match[3];
			}
		}

		if (!panel) {
			panel = createWebviewPanel();
		}
		if (panel.lastExplainedEditor && !panel.lastExplainedEditor._disposed) {
			// todo: strange never called, but the panel remains
			const closablePanel = panel.lastExplainedEditor;
			panel.lastExplainedEditor = null;
			await closeTextEditor(closablePanel);
			editor.show();
		}
		panel.webview.html = renderHTML(text);
	});

	const regExpEditor = vscode.commands.registerCommand('regexExplainer.regExpEditor', async function () {
		if (!activeLiveEditor || activeLiveEditor._disposed)
			vscode.workspace.openTextDocument({
				content: '',
				language: 'js'
			})
			.then((doc) => {
				return vscode.window.showTextDocument(doc);
			})
			.then(() => {
				let editor = vscode.window.activeTextEditor;
				if (!editor) {
					vscode.window.showInformationMessage('Open a file first!')
					return;
				}
				if (!panel || panel._isDisposed) {
					panel = createWebviewPanel();
				}
				activeLiveEditor = editor;
				let text = editor.document.getText().trim();
				panel.lastExplainedEditor = editor;
				panel.webview.html = renderHTML(text);
			});
		else if (activeLiveEditor) {
			activeLiveEditor.show();
			await vscode.commands.executeCommand('editor.action.selectAll');
		}
	})

	const getExplainRegex = vscode.commands.registerCommand('regexExplainer.getExplainRegexHtml', function (regex) {
		return renderHTML(regex);
	});

	context.subscriptions.push(previewRegExp, regExpEditor, getExplainRegex,
		vscode.workspace.onDidChangeTextDocument(function (event) {
			if (!activeLiveEditor || !panel || !vscode.window.activeTextEditor)
				return;
			if (event.document === activeLiveEditor.document) {
				let text = event.document.getText().trim();
				panel.webview.html = renderHTML(text);
			}
		}),
		vscode.workspace.onDidCloseTextDocument(function (closedDocument) {
			try {
				if (activeLiveEditor && activeLiveEditor.document === closedDocument) {
					activeLiveEditor = null;
					panel.lastExplainedEditor = null;
					panel.dispose();
					panel = null;
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
			enableScripts: true, // 启用JS，默认禁用
			retainContextWhenHidden: true, // webview被隐藏时保持状态，避免被重置
		}
	);
	panel.onDidDispose(async (event) => {
		try {
			const lastExplainedEditor = panel.lastExplainedEditor;
			if (lastExplainedEditor && !lastExplainedEditor._disposed) {
				closeTextEditor(lastExplainedEditor);
			}
		} catch (err) {
			vscode.window.showErrorMessage('An error has occurred while closing the panel: ' + err);

		}
	});
	return panel;
}

async function closeTextEditor(textEditor) {
	textEditor.show();
	await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
}

// 关闭时调用
function deactivate() {}

module.exports = {
	activate,
	deactivate
}