import * as vscode from 'vscode';
import { getCompletionItems } from '../documentation';

export class EidosCompletionProvider implements vscode.CompletionItemProvider {
    public provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.CompletionContext
    ): vscode.ProviderResult<vscode.CompletionItem[]> {
        if (position.line < 0 || position.character < 0) {
            return [];
        }

        try {
            const linePrefix = document.lineAt(position).text.substring(0, position.character);
            
            const wordMatch = linePrefix.match(/[\w.]*$/);
            const prefix = wordMatch ? wordMatch[0] : '';

            const methodMatch = linePrefix.match(/(\w+)\.(\w*)$/);
            const objectContext = methodMatch ? methodMatch[1] : undefined;
            const methodPrefix = methodMatch ? methodMatch[2] : undefined;

            if (token.isCancellationRequested) {
                return [];
            }

            const items = getCompletionItems(prefix, objectContext);
            
            return items.sort((a, b) => {
                const labelA = typeof a.label === 'string' ? a.label : a.label.label;
                const labelB = typeof b.label === 'string' ? b.label : b.label.label;
                return labelA.localeCompare(labelB);
            });
        } catch (e) {
            vscode.window.showErrorMessage(`Error providing completions: ${e}`);
            return [];
        }
    }

    public resolveCompletionItem(
        item: vscode.CompletionItem,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.CompletionItem> {
        try {
            if (token.isCancellationRequested) {
                return item;
            }
            return item;
        } catch (e) {
            vscode.window.showErrorMessage(`Error resolving completion item: ${e}`);
            return item;
        }
    }
} 