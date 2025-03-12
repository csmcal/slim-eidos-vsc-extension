import * as vscode from 'vscode';
import { getHoverDocumentation } from '../documentation';

export class EidosHoverProvider implements vscode.HoverProvider {
    public provideHover(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.Hover> {
        const range = document.getWordRangeAtPosition(position);
        if (!range) {
            return null;
        }
        
        const word = document.getText(range);
        
        if (!word || word.trim().length === 0) {
            return null;
        }

        const linePrefix = document.lineAt(position).text.substring(0, position.character);
        
        const methodMatch = linePrefix.match(/(\w+)\.(\w*)$/);
        const context = methodMatch ? methodMatch[1] : undefined;
        const partialMethod = methodMatch ? methodMatch[2] : undefined;

        const documentation = getHoverDocumentation(word, context);
        if (documentation) {
            try {
                return new vscode.Hover(new vscode.MarkdownString(documentation));
            } catch (e) {
                vscode.window.showErrorMessage(`Error creating hover: ${e}`);
                return null;
            }
        }

        return null;
    }
} 