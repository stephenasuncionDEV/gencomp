import { window, Uri, workspace, commands, env } from "vscode";
import { TextEncoder } from "util";
import { GenCompSettings } from "./types";
import * as prettier from "prettier";

export const setConfig = async (configKey: GenCompSettings) => {
  const previousClipboard = await env.clipboard.readText();
  await commands.executeCommand("copyFilePath");
  const filePath = await env.clipboard.readText();

  const fileUri = Uri.file(filePath);

  const config = workspace.getConfiguration("gencomp", null);
  config.update(configKey, fileUri.path, true);

  await env.clipboard.writeText(previousClipboard);

  window.showInformationMessage(`GenComp: Successfuly setup ${configKey}`);
};

export const generate = async () => {
  try {
    const editor = window.activeTextEditor;
    if (!editor) {
      throw new Error("GenComp: Cannot find active editor");
    }

    const fileCode = editor!.document.getText();

    let importsArr: Array<string> = [];

    const lineArr = prettier
      .format(fileCode, {
        tabWidth: 4,
        parser: "babel",
      })
      .split("\n");

    for (let i = 0; i < lineArr.length; i++) {
      if (
        lineArr[i].indexOf("export const") !== -1 ||
        lineArr[i].indexOf("const") !== -1 ||
        lineArr[i].indexOf("export default") !== -1
      ) {
        break;
      }
      importsArr.push(lineArr[i]);
    }

    let imports = "";
    importsArr.forEach((imp, idx, arr) => {
      imports += imp + (idx === arr.length - 1 ? "" : "\n");
    });

    const jsxCode = editor!.document.getText(editor!.selection);

    const config = workspace.getConfiguration("gencomp", null);
    const outputPath = config.get("outputPath") as string;
    const outputPathUri = Uri.file(outputPath);

    const outputPathFiles = await workspace.fs.readDirectory(outputPathUri);
    const newCount =
      outputPathFiles
        .map((file) => file[0])
        .filter((file) => file.slice(0, 7).toLowerCase() === "gencomp").length +
      1;

    const fileExt = {
      javascript: ".js",
      typescriptreact: ".tsx",
    }[editor!.document.languageId];

    const componentUri = Uri.joinPath(
      outputPathUri,
      `GenComp${newCount}${fileExt}`,
    );

    const newCode = prettier.format(
      `
        ${imports}

        const GenComp${newCount} = () => {
            return (
                ${jsxCode}
            )
        }
        
        export default GenComp${newCount}
      `,
      {
        tabWidth: 4,
        parser: "babel",
      },
    );

    await workspace.fs.writeFile(
      componentUri,
      new TextEncoder().encode(newCode),
    );

    window.showInformationMessage(`Successfuly generated component`);
  } catch (err: any) {
    window.showErrorMessage(err.message);
  }
};
