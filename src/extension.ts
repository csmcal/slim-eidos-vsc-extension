import * as vscode from 'vscode';
import { EidosHoverProvider } from './providers/hoverProvider';
import { EidosSymbolProvider } from './providers/symbolProvider';
import { EidosCompletionProvider } from './providers/completionProvider';
import { EidosSymbolManager } from './symbolManager';

export function activate(context: vscode.ExtensionContext) {
    // Create instances of our providers
    const symbolManager = new EidosSymbolManager();
    const hoverProvider = new EidosHoverProvider(symbolManager);
    const symbolProvider = new EidosSymbolProvider(symbolManager);
    const completionProvider = new EidosCompletionProvider(symbolManager);

    // Register the providers
    context.subscriptions.push(
        vscode.languages.registerHoverProvider('eidos', hoverProvider),
        vscode.languages.registerDocumentSymbolProvider('eidos', symbolProvider),
        vscode.languages.registerCompletionItemProvider(
            'eidos',
            completionProvider,
            '.',  // Trigger completion on dot for method chains
            ' ',  // Trigger completion on space for keywords
            '('   // Trigger completion on open paren for function calls
        )
    );

    // Register a document change listener to update symbols
    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument(event => {
            if (event.document.languageId === 'eidos') {
                symbolProvider.provideDocumentSymbols(event.document, new vscode.CancellationTokenSource().token);
            }
        })
    );
}

export function deactivate() {} 