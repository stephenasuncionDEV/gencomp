import { commands, ExtensionContext } from "vscode";
import { setConfig, generate } from "./commands";

export function activate(context: ExtensionContext) {

	const setOutputFunc = commands.registerCommand('gencomp.setOutput', () => setConfig('outputPath'));
	const generateFunc = commands.registerCommand('gencomp.generate', generate);

	context.subscriptions.push(
		setOutputFunc,
		generateFunc
	);
}

export function deactivate() {}