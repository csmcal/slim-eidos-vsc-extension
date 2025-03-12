import * as vscode from 'vscode';
import { EidosHoverProvider } from './providers/hoverProvider';
import { EidosCompletionProvider } from './providers/completionProvider';

export function activate(context: vscode.ExtensionContext) {
    // Register the hover provider for Eidos language
    const hoverProvider = vscode.languages.registerHoverProvider(
        'eidos',
        new EidosHoverProvider()
    );

    // Register the completion provider
    const completionProvider = vscode.languages.registerCompletionItemProvider(
        'eidos',
        new EidosCompletionProvider(),
        '.' // Trigger completion on dot for method chains
    );

    context.subscriptions.push(hoverProvider, completionProvider);
}

export function deactivate() {} 