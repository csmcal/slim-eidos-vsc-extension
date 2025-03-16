import * as vscode from 'vscode';
import { EidosSymbol, EidosSymbolManager, Scope } from '../symbolManager';

export class EidosSymbolProvider implements vscode.DocumentSymbolProvider {
    constructor(private symbolManager: EidosSymbolManager) {}

    public provideDocumentSymbols(
        document: vscode.TextDocument,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.DocumentSymbol[]> {
        // Clear existing symbols for this document
        this.symbolManager.clearDocumentSymbols(document);

        const symbols: vscode.DocumentSymbol[] = [];
        const text = document.getText();
        
        // First, detect all scopes
        this.detectScopes(document, text);

        // Match variable declarations and assignments
        const variableRegex = /(?:^|\s)(\w+)\s*(?:=|:=|<-)\s*(.+?)(?:;|$)/gm;
        let match;

        while ((match = variableRegex.exec(text)) !== null) {
            const name = match[1];
            const value = match[2].trim();
            const startPos = document.positionAt(match.index + match[0].indexOf(name));
            const endPos = document.positionAt(match.index + match[0].length);
            const range = new vscode.Range(startPos, endPos);

            // Find the scope for this position
            const scope = this.symbolManager.findScope(document, startPos);

            // Infer type from value and context
            const type = this.inferType(value, scope.type);

            // Create symbol
            const symbol: EidosSymbol = {
                name,
                type,
                scope,
                range,
                value
            };

            // Add to symbol manager
            this.symbolManager.addSymbol(document, symbol);

            // Create DocumentSymbol for VSCode
            const docSymbol = new vscode.DocumentSymbol(
                name,
                `${type} (${scope.type})`,
                this.getSymbolKind(type),
                range,
                range
            );
            symbols.push(docSymbol);
        }

        // Match function declarations
        const functionRegex = /(?:^|\s)function\s+(\w+)\s*\((.*?)\)/gm;
        while ((match = functionRegex.exec(text)) !== null) {
            const name = match[1];
            const params = match[2];
            const startPos = document.positionAt(match.index);
            const endPos = document.positionAt(match.index + match[0].length);
            const range = new vscode.Range(startPos, endPos);

            // Create function scope
            const scope: Scope = {
                type: 'function',
                range: this.findBlockRange(document, endPos)
            };
            this.symbolManager.addScope(document, scope);

            // Create symbol
            const symbol: EidosSymbol = {
                name,
                type: 'function',
                scope: { type: 'global', range: scope.range },
                range,
                value: `function(${params})`
            };

            this.symbolManager.addSymbol(document, symbol);

            const docSymbol = new vscode.DocumentSymbol(
                name,
                `function(${params})`,
                vscode.SymbolKind.Function,
                range,
                range
            );
            symbols.push(docSymbol);
        }

        return symbols;
    }

    private detectScopes(document: vscode.TextDocument, text: string): void {
        // Match SLiM event blocks
        const eventRegex = /(?:^|\s)(early|late|fitness|interaction|mateChoice|modifyChild)\s*\(\s*(\d+)\s*\)/gm;
        let match;

        while ((match = eventRegex.exec(text)) !== null) {
            const type = match[1] as Scope['type'];
            const startPos = document.positionAt(match.index);
            const range = this.findBlockRange(document, startPos);

            const scope: Scope = { type, range };
            this.symbolManager.addScope(document, scope);
        }

        // Match regular code blocks
        const blockRegex = /[{]/g;
        while ((match = blockRegex.exec(text)) !== null) {
            const startPos = document.positionAt(match.index);
            const range = this.findBlockRange(document, startPos);

            const scope: Scope = {
                type: 'block',
                range,
                parent: this.symbolManager.findScope(document, startPos)
            };
            this.symbolManager.addScope(document, scope);
        }
    }

    private findBlockRange(document: vscode.TextDocument, start: vscode.Position): vscode.Range {
        const text = document.getText();
        let openBraces = 0;
        let pos = document.offsetAt(start);

        // Find the opening brace
        while (pos < text.length && text[pos] !== '{') pos++;
        if (pos >= text.length) return new vscode.Range(start, start);

        // Find the matching closing brace
        do {
            if (text[pos] === '{') openBraces++;
            else if (text[pos] === '}') openBraces--;
            pos++;
        } while (openBraces > 0 && pos < text.length);

        return new vscode.Range(start, document.positionAt(pos));
    }

    private inferType(value: string, scopeType: Scope['type']): string {
        // First check for SLiM-specific patterns based on scope
        if (scopeType === 'fitness') {
            if (value.match(/^[0-9.]+$/)) return 'float';
            if (value.match(/^(1|1\.0|0|0\.0)$/)) return 'float<probability>';
        }
        if (scopeType === 'mateChoice' && value.match(/^(T|F|TRUE|FALSE)$/)) return 'logical';
        if (scopeType === 'modifyChild' && value.match(/^[0-9.]+$/)) return 'float<probability>';

        // Check for SLiM function calls
        const slimFunctionMatch = value.match(/^(sim|self|individual|subpop|genome|mut)\.(\w+)\(/);
        if (slimFunctionMatch) {
            const [_, object, method] = slimFunctionMatch;
            return this.inferSlimMethodReturnType(object, method);
        }

        // Check for vector operations
        const vectorOpMatch = value.match(/^(\w+)\s*([+\-*/])\s*(\w+)$/);
        if (vectorOpMatch) {
            const [_, left, op, right] = vectorOpMatch;
            return this.inferVectorOperationType(left, op as '+' | '-' | '*' | '/', right);
        }

        // Check for basic types
        if (value.match(/^-?\d+$/)) return 'integer';
        if (value.match(/^-?\d*\.\d+$/)) return 'float';
        if (value.match(/^["'].*["']$/)) return 'string';
        if (value.match(/^(T|F|TRUE|FALSE)$/)) return 'logical';
        
        // Check for collections
        if (value.startsWith('c(')) {
            const innerType = this.inferVectorType(value);
            return `vector<${innerType}>`;
        }
        if (value.match(/^matrix\(/)) {
            const matrixType = this.inferMatrixType(value);
            return `matrix<${matrixType}>`;
        }
        if (value.match(/^list\(/)) {
            const listType = this.inferListType(value);
            return listType;
        }
        if (value.match(/^NULL$/)) return 'NULL';
        
        // Check for object constructors
        const objectMatch = value.match(/^(\w+)\((.*)\)/);
        if (objectMatch) {
            const [_, constructor, args] = objectMatch;
            return this.inferConstructorType(constructor, args);
        }

        // Check for method calls
        const methodMatch = value.match(/(\w+)\.(\w+)\(/);
        if (methodMatch) {
            const [_, object, method] = methodMatch;
            return this.inferMethodReturnType(object, method);
        }

        return 'unknown';
    }

    private inferVectorType(value: string): string {
        const innerMatch = value.match(/^c\((.*)\)$/);
        if (!innerMatch) return 'unknown';

        const elements = this.parseElements(innerMatch[1]);
        if (elements.length === 0) return 'unknown';

        // Check first few elements to infer type
        const types = elements.slice(0, 3).map(e => this.inferType(e, 'global'));
        const uniqueTypes = [...new Set(types)];

        if (uniqueTypes.length === 1) return uniqueTypes[0];
        if (uniqueTypes.every(t => t === 'integer' || t === 'float')) return 'float';
        if (uniqueTypes.every(t => t.startsWith('vector<'))) {
            const innerTypes = uniqueTypes.map(t => t.match(/vector<(.+)>/)![1]);
            return `vector<${this.findCommonType(innerTypes)}>`;
        }
        return 'mixed';
    }

    private inferMatrixType(value: string): string {
        const match = value.match(/^matrix\((.*)\)$/);
        if (!match) return 'unknown';

        const elements = this.parseElements(match[1]);
        if (elements.length === 0) return 'unknown';

        const types = elements.map(e => this.inferType(e, 'global'));
        const uniqueTypes = [...new Set(types)];

        if (uniqueTypes.length === 1) return uniqueTypes[0];
        if (uniqueTypes.every(t => t === 'integer' || t === 'float')) return 'float';
        return 'mixed';
    }

    private inferListType(value: string): string {
        const match = value.match(/^list\((.*)\)$/);
        if (!match) return 'list';

        const elements = this.parseElements(match[1]);
        if (elements.length === 0) return 'list';

        const types = elements.map(e => this.inferType(e, 'global'));
        const uniqueTypes = [...new Set(types)];

        if (uniqueTypes.length === 1) return `list<${uniqueTypes[0]}>`;
        return 'list<mixed>';
    }

    private inferConstructorType(constructor: string, args: string): string {
        const slimObjects = [
            'Individual', 'Genome', 'Mutation', 'Subpopulation', 'Species',
            'GenomicElement', 'InteractionType', 'GenomicElementType', 'MutationType'
        ];

        if (slimObjects.includes(constructor)) {
            return constructor;
        }

        // Check for vector constructors
        if (['integer', 'float', 'string', 'logical'].includes(constructor)) {
            return `vector<${constructor}>`;
        }

        return 'unknown';
    }

    private inferMethodReturnType(object: string, method: string): string {
        // Common method return types
        const methodTypes: { [key: string]: string } = {
            'size': 'integer',
            'length': 'integer',
            'getValue': 'float',
            'contains': 'logical',
            'asString': 'string',
            'asInteger': 'integer',
            'asFloat': 'float',
            'asLogical': 'logical'
        };

        return methodTypes[method] || 'unknown';
    }

    private inferSlimMethodReturnType(object: string, method: string): string {
        // SLiM-specific method return types
        const slimMethodTypes: { [key: string]: { [key: string]: string } } = {
            'sim': {
                'generation': 'integer',
                'chromosome': 'Chromosome',
                'subpopulations': 'vector<Subpopulation>',
                'mutations': 'vector<Mutation>'
            },
            'individual': {
                'genome1': 'Genome',
                'genome2': 'Genome',
                'fitness': 'float',
                'age': 'integer'
            },
            'subpop': {
                'individuals': 'vector<Individual>',
                'size': 'integer',
                'id': 'integer'
            }
        };

        return slimMethodTypes[object]?.[method] || 'unknown';
    }

    private inferVectorOperationType(left: string, op: '+' | '-' | '*' | '/', right: string): string {
        const leftType = this.inferType(left, 'global');
        const rightType = this.inferType(right, 'global');

        if (leftType === 'unknown' || rightType === 'unknown') return 'unknown';

        // Matrix operations
        if (leftType.startsWith('matrix<') || rightType.startsWith('matrix<')) {
            return 'matrix<float>';
        }

        // Vector operations
        if (leftType.startsWith('vector<') || rightType.startsWith('vector<')) {
            return 'vector<float>';
        }

        // Numeric operations
        if (['integer', 'float'].includes(leftType) && ['integer', 'float'].includes(rightType)) {
            return op === '/' ? 'float' : (leftType === 'float' || rightType === 'float' ? 'float' : 'integer');
        }

        return 'unknown';
    }

    private parseElements(argsString: string): string[] {
        const elements: string[] = [];
        let current = '';
        let depth = 0;
        let inString = false;
        let stringChar = '';

        for (const char of argsString) {
            if (!inString) {
                if (char === '(' || char === '[' || char === '{') depth++;
                else if (char === ')' || char === ']' || char === '}') depth--;
                else if ((char === '"' || char === "'") && !inString) {
                    inString = true;
                    stringChar = char;
                }
                else if (char === ',' && depth === 0) {
                    elements.push(current.trim());
                    current = '';
                    continue;
                }
            } else if (char === stringChar && !inString) {
                inString = false;
            }
            current += char;
        }
        if (current.trim()) elements.push(current.trim());
        return elements;
    }

    private findCommonType(types: string[]): string {
        if (types.length === 0) return 'unknown';
        if (types.length === 1) return types[0];
        if (types.every(t => t === 'integer' || t === 'float')) return 'float';
        return 'mixed';
    }

    private getSymbolKind(type: string): vscode.SymbolKind {
        switch (type) {
            case 'function': return vscode.SymbolKind.Function;
            case 'integer':
            case 'float': return vscode.SymbolKind.Number;
            case 'string': return vscode.SymbolKind.String;
            case 'logical': return vscode.SymbolKind.Boolean;
            case 'vector':
            case 'matrix':
            case 'list': return vscode.SymbolKind.Array;
            default:
                if (type.startsWith('vector<')) return vscode.SymbolKind.Array;
                if (this.isObjectType(type)) return vscode.SymbolKind.Class;
                return vscode.SymbolKind.Variable;
        }
    }

    private isObjectType(type: string): boolean {
        return [
            'Individual', 'Genome', 'Mutation', 'Subpopulation', 'Species',
            'GenomicElement', 'InteractionType', 'GenomicElementType', 'MutationType'
        ].includes(type);
    }
} 