const vscode = require('vscode');
const { renderHTML } = require('./render');

/**
 * 激活插件时会调用
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// 注册命令 extension.showRegExp
	// 回调中是命令会做的事情
	// 回调函数的参数
	// 1. 如果是从资源管理器右键执行命令，那么会把选中资源的路径 uri 传递过去
	// 2. 从编辑器中右键菜单执行，那么会把当前文件路径 url 传递过去
	// 3. 直接按 ctrl + shift + p 执行命令，这个参数为空
	let previewRegExp = vscode.commands.registerCommand('extension.previewRegExp', function (uri) {
		let panel = null;
		let editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showInformationMessage('open a file first')
		}
		let selection = editor.selection;
		let text = editor.document.getText(selection);
		if (!text) return;
		text = text.trim();
		let reg = /^new RegExp\(([\s\S]+)\);?$/;
		// new RegExp 形式的正则表达式，那么需要转为 /  / 形式的正则
		if (reg.test(text)) {
			text = eval(text).toString();
		}
		if (!panel) {
			panel = vscode.window.createWebviewPanel(
				'testWebview',
				'Preview RegExp',
				vscode.ViewColumn.Two,
				{
					enableScripts: true, // 启用JS，默认禁用
					retainContextWhenHidden: true, // webview被隐藏时保持状态，避免被重置
				}
			)
		}
		panel.webview.html = renderHTML(text);
	});

	let regExpEditor = vscode.commands.registerCommand('extension.regExpEditor', function () {
		let panel = null;
		vscode.workspace.openTextDocument({
			content: '',
			language: 'js',
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
			let text = editor.document.getText().trim();
			if (!panel) {
				panel = vscode.window.createWebviewPanel(
					'testWebview',
					'Preview RegExp',
					vscode.ViewColumn.Two,
					{
						enableScripts: true, // 启用JS，默认禁用
						retainContextWhenHidden: true, // webview被隐藏时保持状态，避免被重置
					}
				)
			}
			panel.webview.html = renderHTML(text);
			vscode.workspace.onDidChangeTextDocument(function(event) {
				if (event.document === vscode.window.activeTextEditor.document) {
					let text = editor.document.getText().trim();
					panel.webview.html = renderHTML(text);
				}
			})
		})
	})

	context.subscriptions.push(previewRegExp, regExpEditor);
}

// 关闭时调用
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
