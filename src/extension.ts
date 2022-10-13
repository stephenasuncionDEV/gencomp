import { commands, ExtensionContext } from "vscode";
import { setConfig, generate } from "./commands";

export function activate(context: ExtensionContext) {

	const setRootFunc = commands.registerCommand('gencomp.setRoot', () => setConfig('rootPath'));
	const setOutputFunc = commands.registerCommand('gencomp.setOutput', () => setConfig('outputPath'));
	const generateFunc = commands.registerCommand('gencomp.generate', generate);

	context.subscriptions.push(
		setRootFunc,
		setOutputFunc,
		generateFunc
	);
}

export function deactivate() {}