import * as vscode from 'vscode';
import { getCompletionItems } from '../documentation';
import { EidosSymbol, EidosSymbolManager } from '../symbolManager';

export class EidosCompletionProvider implements vscode.CompletionItemProvider {
    constructor(private symbolManager: EidosSymbolManager) {}

    public provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.CompletionContext
    ): vscode.ProviderResult<vscode.CompletionItem[]> {
        const linePrefix = document.lineAt(position).text.substring(0, position.character);
        
        // Check if we're in a method chain
        const methodMatch = linePrefix.match(/(\w+)\.(\w*)$/);
        if (methodMatch) {
            const objectName = methodMatch[1];
            const partialMethod = methodMatch[2];

            // First check if it's a user-defined symbol
            const symbol = this.symbolManager.getSymbol(objectName, position);
            if (symbol) {
                return this.getMethodCompletions(symbol.type, partialMethod);
            }

            // Fall back to built-in completions
            return getCompletionItems(partialMethod, objectName);
        }

        // Get word being typed
        const wordRange = document.getWordRangeAtPosition(position);
        const word = wordRange ? document.getText(wordRange) : '';

        return this.getAllCompletions(document, position, word);
    }

    private async getAllCompletions(
        document: vscode.TextDocument,
        position: vscode.Position,
        word: string
    ): Promise<vscode.CompletionItem[]> {
        const completions: vscode.CompletionItem[] = [];

        // Add user-defined symbols
        const symbols = this.getUserDefinedSymbols(document, position);
        for (const symbol of symbols) {
            const item = this.createCompletionItem(symbol);
            completions.push(item);
        }

        // Add built-in completions
        const builtInItems = await getCompletionItems(word);
        if (builtInItems) {
            completions.push(...builtInItems);
        }

        // Add SLiM-specific keywords
        this.addKeywordCompletions(completions);

        return completions;
    }

    private getUserDefinedSymbols(document: vscode.TextDocument, position: vscode.Position): EidosSymbol[] {
        const symbols: EidosSymbol[] = [];
        const seen = new Set<string>();

        // Get all symbols from the document
        const uri = document.uri.toString();
        const documentSymbols = this.symbolManager['documentSymbols'].get(uri) || [];

        for (const symbol of documentSymbols) {
            // Only include symbols that are in scope and haven't been seen
            if (this.symbolManager['isInScope'](symbol, position) && !seen.has(symbol.name)) {
                symbols.push(symbol);
                seen.add(symbol.name);
            }
        }

        return symbols;
    }

    private createCompletionItem(symbol: EidosSymbol): vscode.CompletionItem {
        const item = new vscode.CompletionItem(symbol.name);

        // Set the kind based on the symbol type
        item.kind = this.getCompletionKind(symbol.type);

        // Add detail (shown to the right)
        item.detail = `(${symbol.type}) ${symbol.scope.type}`;

        // Add documentation (shown in the details widget)
        const docs = new vscode.MarkdownString();
        docs.appendMarkdown(`### ${symbol.name}\n\n`);
        docs.appendMarkdown(`**Type:** \`${symbol.type}\`\n\n`);
        docs.appendMarkdown(`**Scope:** ${symbol.scope.type}\n\n`);
        if (symbol.value) {
            docs.appendMarkdown(`**Value:**\n\`\`\`eidos\n${symbol.value}\n\`\`\``);
        }
        item.documentation = docs;

        // Add insert text for functions
        if (symbol.type === 'function') {
            const params = this.extractFunctionParams(symbol.value);
            item.insertText = new vscode.SnippetString(
                `${symbol.name}(${params.map((p, i) => `\${${i + 1}:${p}}`).join(', ')})`
            );
        }

        return item;
    }

    private getMethodCompletions(type: string, partial: string): vscode.CompletionItem[] {
        // Get built-in method completions for the type
        const builtInMethods = getCompletionItems(partial, type) || [];

        // Add any user-defined methods if applicable
        // (This could be extended to support user-defined methods in the future)

        return builtInMethods;
    }

    private getCompletionKind(type: string): vscode.CompletionItemKind {
        switch (type) {
            case 'function': return vscode.CompletionItemKind.Function;
            case 'integer':
            case 'float': return vscode.CompletionItemKind.Value;
            case 'string': return vscode.CompletionItemKind.Text;
            case 'logical': return vscode.CompletionItemKind.Value;
            case 'vector':
            case 'matrix':
            case 'list': return vscode.CompletionItemKind.Variable;
            default:
                if (type.startsWith('vector<')) return vscode.CompletionItemKind.Variable;
                if (this.isEidosObjectType(type)) return vscode.CompletionItemKind.Class;
                return vscode.CompletionItemKind.Variable;
        }
    }

    private extractFunctionParams(value: string | undefined): string[] {
        if (!value) return [];
        const match = value.match(/function\((.*?)\)/);
        if (!match) return [];
        return match[1].split(',').map(p => p.trim());
    }

    private addKeywordCompletions(completions: vscode.CompletionItem[]): void {
        const keywords = [
            'early', 'late', 'fitness', 'interaction', 'mateChoice', 'modifyChild',
            'if', 'else', 'for', 'while', 'in', 'return', 'function'
        ];

        for (const keyword of keywords) {
            const item = new vscode.CompletionItem(keyword, vscode.CompletionItemKind.Keyword);
            item.detail = 'keyword';
            
            // Add snippets for common constructs
            switch (keyword) {
                case 'if':
                    item.insertText = new vscode.SnippetString('if (${1:condition}) {\n\t${2}\n}');
                    break;
                case 'for':
                    item.insertText = new vscode.SnippetString('for (${1:i} in ${2:1:10}) {\n\t${3}\n}');
                    break;
                case 'function':
                    item.insertText = new vscode.SnippetString('function (${1:params}) {\n\t${2}\n}');
                    break;
                case 'early':
                case 'late':
                    item.insertText = new vscode.SnippetString(`${keyword}(\${1:generation}) {\n\t\${2}\n}`);
                    break;
            }

            completions.push(item);
        }
    }

    private isEidosObjectType(type: string): boolean {
        return [
            'Individual', 'Genome', 'Mutation', 'Subpopulation', 'Species',
            'GenomicElement', 'InteractionType', 'GenomicElementType', 'MutationType'
        ].includes(type);
    }
} 