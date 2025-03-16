import * as vscode from 'vscode';

export interface Scope {
    type: 'global' | 'block' | 'early' | 'late' | 'fitness' | 'interaction' | 'mateChoice' | 'modifyChild' | 'function' | 'initialize' | 'reproduction' | 'mutation' | 'recombination';
    range: vscode.Range;
    parent?: Scope;
    generation?: number;  // For event callbacks that specify a generation
    subpopulation?: string;  // For callbacks that specify a subpopulation
    species?: string;  // For species-specific callbacks
}

export interface EidosSymbol {
    name: string;
    type: string;
    scope: Scope;
    range: vscode.Range;
    definition?: vscode.Location;
    value?: string;
    isConstant?: boolean;  // For defineConstant declarations
    isGlobal?: boolean;   // For defineGlobal declarations
    isParameter?: boolean; // For function parameters
}

export class EidosSymbolManager {
    private symbols: Map<string, EidosSymbol[]> = new Map();
    private documentSymbols: Map<string, EidosSymbol[]> = new Map();
    private documentScopes: Map<string, Scope[]> = new Map();
    private scopeStack: Map<string, Scope[]> = new Map();  // Track scope nesting per document

    constructor() {
        this.symbols = new Map();
        this.documentSymbols = new Map();
        this.documentScopes = new Map();
        this.scopeStack = new Map();
    }

    public pushScope(document: vscode.TextDocument, scope: Scope): void {
        const uri = document.uri.toString();
        if (!this.scopeStack.has(uri)) {
            this.scopeStack.set(uri, []);
        }
        const stack = this.scopeStack.get(uri)!;
        
        // Set parent to current top of stack
        if (stack.length > 0) {
            scope.parent = stack[stack.length - 1];
        }
        
        stack.push(scope);
        this.addScope(document, scope);
    }

    public popScope(document: vscode.TextDocument): Scope | undefined {
        const uri = document.uri.toString();
        const stack = this.scopeStack.get(uri);
        if (!stack || stack.length === 0) return undefined;
        return stack.pop();
    }

    public getCurrentScope(document: vscode.TextDocument): Scope | undefined {
        const uri = document.uri.toString();
        const stack = this.scopeStack.get(uri);
        if (!stack || stack.length === 0) return undefined;
        return stack[stack.length - 1];
    }

    public addScope(document: vscode.TextDocument, scope: Scope): void {
        const uri = document.uri.toString();
        if (!this.documentScopes.has(uri)) {
            this.documentScopes.set(uri, []);
        }
        this.documentScopes.get(uri)?.push(scope);
    }

    public findScope(document: vscode.TextDocument, position: vscode.Position): Scope {
        const uri = document.uri.toString();
        const scopes = this.documentScopes.get(uri) || [];
        
        // Find all scopes that contain the position
        const containingScopes = scopes.filter(scope => 
            scope.range.contains(position)
        );

        if (containingScopes.length === 0) {
            return { type: 'global', range: new vscode.Range(0, 0, Number.MAX_VALUE, 0) };
        }

        // Sort by specificity:
        // 1. Most deeply nested (smallest range)
        // 2. Most specific type (function > block > global)
        containingScopes.sort((a, b) => {
            // Compare range sizes
            const aSize = a.range.end.line - a.range.start.line;
            const bSize = b.range.end.line - b.range.start.line;
            if (aSize !== bSize) return aSize - bSize;

            // Compare scope type specificity
            return this.getScopeSpecificity(b.type) - this.getScopeSpecificity(a.type);
        });

        return containingScopes[0];
    }

    public addSymbol(document: vscode.TextDocument, symbol: EidosSymbol): void {
        const uri = document.uri.toString();
        if (!this.documentSymbols.has(uri)) {
            this.documentSymbols.set(uri, []);
        }
        this.documentSymbols.get(uri)?.push(symbol);

        if (!this.symbols.has(symbol.name)) {
            this.symbols.set(symbol.name, []);
        }
        this.symbols.get(symbol.name)?.push(symbol);
    }

    public getSymbol(name: string, position: vscode.Position): EidosSymbol | undefined {
        const symbols = this.symbols.get(name);
        if (!symbols) return undefined;

        // Find symbols in scope at the position
        const inScopeSymbols = symbols.filter(symbol => this.isInScope(symbol, position));
        
        // Sort by scope specificity and visibility
        inScopeSymbols.sort((a, b) => {
            // Constants and globals are always accessible
            if (a.isConstant && !b.isConstant) return -1;
            if (!a.isConstant && b.isConstant) return 1;
            if (a.isGlobal && !b.isGlobal) return -1;
            if (!a.isGlobal && b.isGlobal) return 1;

            // Compare scope depths
            const aDepth = this.getScopeDepth(a.scope);
            const bDepth = this.getScopeDepth(b.scope);
            if (aDepth !== bDepth) return bDepth - aDepth;

            // Compare scope type specificity
            return this.getScopeSpecificity(b.scope.type) - this.getScopeSpecificity(a.scope.type);
        });

        return inScopeSymbols[0];
    }

    public clearDocumentSymbols(document: vscode.TextDocument): void {
        const uri = document.uri.toString();
        const documentSymbols = this.documentSymbols.get(uri) || [];
        
        // Remove these symbols from the global symbols map
        for (const symbol of documentSymbols) {
            const symbols = this.symbols.get(symbol.name);
            if (symbols) {
                const index = symbols.indexOf(symbol);
                if (index !== -1) {
                    symbols.splice(index, 1);
                }
                if (symbols.length === 0) {
                    this.symbols.delete(symbol.name);
                }
            }
        }
        
        this.documentSymbols.delete(uri);
        this.documentScopes.delete(uri);
        this.scopeStack.delete(uri);
    }

    private isInScope(symbol: EidosSymbol, position: vscode.Position): boolean {
        // Constants and globals are always in scope after their declaration
        if ((symbol.isConstant || symbol.isGlobal) && symbol.range.start.isBefore(position)) {
            return true;
        }

        // Symbol must be defined before the position
        if (!symbol.range.start.isBefore(position)) {
            return false;
        }

        // Check if position is within the symbol's scope range
        if (!symbol.scope.range.contains(position)) {
            return false;
        }

        // For function parameters, check if we're in the function body
        if (symbol.isParameter) {
            return symbol.scope.type === 'function' && symbol.scope.range.contains(position);
        }

        return true;
    }

    private getScopeDepth(scope: Scope): number {
        let depth = 0;
        let current: Scope | undefined = scope;
        while (current?.parent) {
            depth++;
            current = current.parent;
        }
        return depth;
    }

    private getScopeSpecificity(type: Scope['type']): number {
        const specificity: { [key in Scope['type']]: number } = {
            'global': 0,
            'block': 1,
            'function': 2,
            'initialize': 3,
            'early': 3,
            'late': 3,
            'fitness': 3,
            'interaction': 3,
            'mateChoice': 3,
            'modifyChild': 3,
            'reproduction': 3,
            'mutation': 3,
            'recombination': 3
        };
        return specificity[type] || 0;
    }
} 