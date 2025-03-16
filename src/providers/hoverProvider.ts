import * as vscode from 'vscode';
import { getHoverDocumentation } from '../documentation';
import { EidosSymbol, EidosSymbolManager } from '../symbolManager';

export class EidosHoverProvider implements vscode.HoverProvider {
    constructor(private symbolManager: EidosSymbolManager) {}

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

        // First check if it's a user-defined symbol
        const symbol = this.symbolManager.getSymbol(word, position);
        if (symbol) {
            return this.createSymbolHover(symbol, document);
        }

        const documentation = getHoverDocumentation(word, context);
        if (documentation) {
            return documentation;
        }

        return null;
    }

    private createSymbolHover(symbol: EidosSymbol, document: vscode.TextDocument): vscode.Hover {
        const contents: vscode.MarkdownString[] = [];
        const mainContent = new vscode.MarkdownString();

        // Add title with syntax highlighting
        mainContent.appendMarkdown(`### ${symbol.name}\n\n`);
        
        // Add type with more detail
        mainContent.appendMarkdown(`**Type:** \`${this.formatType(symbol.type)}\`\n\n`);

        // Add scope information
        mainContent.appendMarkdown(`**Scope:** ${this.formatScope(symbol.scope)}\n\n`);

        // Add definition location
        const defLocation = this.formatDefinitionLocation(symbol, document);
        if (defLocation) {
            mainContent.appendMarkdown(`**Defined at:** ${defLocation}\n\n`);
        }

        // Add value with syntax highlighting if available
        if (symbol.value) {
            mainContent.appendMarkdown('**Value:**\n```eidos\n');
            mainContent.appendMarkdown(this.formatValue(symbol.value, symbol.type));
            mainContent.appendMarkdown('\n```\n\n');
        }

        // Add usage examples if it's a function
        if (symbol.type === 'function') {
            mainContent.appendMarkdown('**Example Usage:**\n```eidos\n');
            mainContent.appendMarkdown(this.createFunctionExample(symbol));
            mainContent.appendMarkdown('\n```\n\n');
        }

        contents.push(mainContent);

        // If it's a known object type, add its documentation
        const objectDocs = getHoverDocumentation(symbol.type);
        if (objectDocs && objectDocs.contents) {
            // Add a separator
            const separator = new vscode.MarkdownString('---\n\n');
            contents.push(separator);

            // Add type documentation
            const typeContent = new vscode.MarkdownString();
            typeContent.appendMarkdown(`### ${symbol.type} Type Documentation\n\n`);
            contents.push(typeContent);

            // Ensure all contents are MarkdownString objects
            const markdownContents = objectDocs.contents.map(content => {
                if (content instanceof vscode.MarkdownString) {
                    return content;
                }
                return new vscode.MarkdownString(content.toString());
            });
            contents.push(...markdownContents);
        }

        return new vscode.Hover(contents, symbol.range);
    }

    private formatType(type: string): string {
        if (type.startsWith('vector<')) {
            return type; // Already formatted
        }
        if (this.isObjectType(type)) {
            return `object<${type}>`;
        }
        return type;
    }

    private formatScope(scope: any): string {
        if (scope.type === 'global') {
            return 'Global';
        }
        if (scope.type === 'function') {
            return 'Function-local';
        }
        if (scope.type === 'block') {
            return 'Block-local';
        }
        return `${scope.type.charAt(0).toUpperCase() + scope.type.slice(1)} callback`;
    }

    private formatDefinitionLocation(symbol: EidosSymbol, document: vscode.TextDocument): string | undefined {
        if (!symbol.range) return undefined;
        
        const line = symbol.range.start.line + 1;
        const character = symbol.range.start.character + 1;
        return `line ${line}, column ${character}`;
    }

    private formatValue(value: string, type: string): string {
        if (type === 'string') {
            return `"${value}"`;
        }
        return value;
    }

    private createFunctionExample(symbol: EidosSymbol): string {
        if (!symbol.value) return '';
        
        // Extract parameters from function declaration
        const paramMatch = symbol.value.match(/function\((.*?)\)/);
        if (!paramMatch) return '';
        
        const params = paramMatch[1].split(',').map(p => p.trim());
        const paramValues = params.map(p => this.getExampleValue(p));
        
        return `${symbol.name}(${paramValues.join(', ')});`;
    }

    private getExampleValue(paramName: string): string {
        // Provide sensible example values based on parameter name hints
        if (paramName.includes('size') || paramName.includes('count')) return '10';
        if (paramName.includes('name') || paramName.includes('id')) return '"example"';
        if (paramName.includes('probability') || paramName.includes('rate')) return '0.5';
        if (paramName.includes('flag') || paramName.includes('enable')) return 'T';
        return '...';
    }

    private isObjectType(type: string): boolean {
        return [
            'Individual', 'Genome', 'Mutation', 'Subpopulation', 'Species',
            'GenomicElement', 'InteractionType', 'GenomicElementType', 'MutationType'
        ].includes(type);
    }
} 