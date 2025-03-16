import * as vscode from 'vscode';
import { EidosDocumentation, Method, Property } from './types';
import { EidosObject } from './types';

interface DocumentationItem {
    description: string;
    parameters?: { [key: string]: string };
    returns?: string;
    example?: string;
}

// Add helper functions for consistent formatting
function formatFunctionDocumentation(doc: DocumentationItem): string {
    try {
        let formatted = doc.description + '\n\n';
        
        if (doc.parameters) {
            formatted += '**Parameters:**\n';
            for (const [param, desc] of Object.entries(doc.parameters)) {
                formatted += `- \`${param}\`: ${desc}\n`;
            }
        }

        if (doc.returns) {
            formatted += `\n**Returns:** ${doc.returns}\n`;
        }

        if (doc.example) {
            formatted += `\n**Example:**\n\`\`\`eidos\n${doc.example}\n\`\`\``;
        }

        return formatted;
    } catch (e) {
        vscode.window.showErrorMessage(`Error formatting documentation: ${e}`);
        return doc.description;
    }
}

function formatMethodDocumentation(doc: DocumentationItem): string {
    try {
        let formatted = doc.description + '\n\n';
        
        if (doc.parameters) {
            formatted += '**Parameters:**\n';
            for (const [param, desc] of Object.entries(doc.parameters)) {
                formatted += `- \`${param}\`: ${desc}\n`;
            }
        }

        if (doc.returns) {
            formatted += `\n**Returns:** ${doc.returns}\n`;
        }

        if (doc.example) {
            formatted += `\n**Example:**\n\`\`\`eidos\n${doc.example}\n\`\`\``;
        }

        return formatted;
    } catch (e) {
        vscode.window.showErrorMessage(`Error formatting method documentation: ${e}`);
        return doc.description;
    }
}

// Add this helper function
function getHoverContent(word: string, context?: string): vscode.MarkdownString[] {
    const item = context 
        ? eidosDoc.objects[context]?.methods[word]
        : (eidosDoc.objects[word] || eidosDoc.functions[word]);
    
    return item ? formatHoverDocumentation(item) : [new vscode.MarkdownString()];
}

// Update getHoverDocumentation to use the content
export function getHoverDocumentation(word: string, context?: string): vscode.Hover {
    return new vscode.Hover(getHoverContent(word, context));
}

// Integration with CompletionProvider
export function getCompletionItems(prefix: string, context?: string): vscode.CompletionItem[] {
    const items: vscode.CompletionItem[] = [];

    if (!context) {
        // Add function completions
        for (const [func, details] of Object.entries(eidosDoc.functions)) {
            if (func.startsWith(prefix)) {
                const item = new vscode.CompletionItem(func, vscode.CompletionItemKind.Function);
                item.documentation = getHoverContent(func)[0];  // Use first MarkdownString
                item.detail = `(function) ${func}`;
                if (details.parameters) {
                    const params = Object.keys(details.parameters);
                    item.insertText = new vscode.SnippetString(
                        `${func}(${params.map((p, i) => `\${${i + 1}:${p}}`).join(', ')})`
                    );
                }
                items.push(item);
            }
        }
    } else if (eidosDoc.objects[context]) {
        // Add method completions
        const objectMethods = eidosDoc.objects[context].methods;
        for (const [method, details] of Object.entries(objectMethods)) {
            if (method.startsWith(prefix)) {
                const item = new vscode.CompletionItem(method, vscode.CompletionItemKind.Method);
                item.documentation = getHoverContent(method, context)[0];  // Use first MarkdownString
                item.detail = `(method) ${context}.${method}`;
                if (details.parameters) {
                    const params = Object.keys(details.parameters);
                    item.insertText = new vscode.SnippetString(
                        `${method}(${params.map((p, i) => `\${${i + 1}:${p}}`).join(', ')})`
                    );
                }
                items.push(item);
            }
        }
    }

    return items;
}

function formatHoverDocumentation(item: EidosObject | Method): vscode.MarkdownString[] {
    const contents: vscode.MarkdownString[] = [];
    const mainContent = new vscode.MarkdownString();
    
    // Add title and type
    if ('extends' in item) {
        // It's an object
        mainContent.appendMarkdown(`## ${getTypeAnnotation('object')}: ${item.description}\n\n`);
        mainContent.appendMarkdown(`*Extends: \`${item.extends}\`*\n\n`);
    } else {
        // It's a method/function
        mainContent.appendMarkdown(`## ${item.description}\n\n`);
    }

    // Add signature for methods
    if ('parameters' in item && item.parameters) {
        const signature = getMethodSignature(item);
        mainContent.appendCodeblock(signature, 'slim');
        
        mainContent.appendMarkdown('\n**Parameters:**\n');
        for (const [name, desc] of Object.entries(item.parameters)) {
            mainContent.appendMarkdown(`- \`${name}\`: ${desc}\n`);
        }
    }

    // Add return type if present
    if ('returns' in item && item.returns) {
        mainContent.appendMarkdown(`\n**Returns:** ${getTypeAnnotation(item.returns)}\n`);
    }

    // Add example if present
    if ('example' in item && item.example) {
        mainContent.appendMarkdown('\n**Example:**\n');
        mainContent.appendCodeblock(item.example, 'slim');
    }

    mainContent.isTrusted = true;
    contents.push(mainContent);

    // Add properties section for objects
    if ('properties' in item && item.properties) {
        const propContent = new vscode.MarkdownString();
        propContent.appendMarkdown('---\n### Properties\n\n');
        
        for (const [name, prop] of Object.entries(item.properties) as [string, Property][]) {
            propContent.appendMarkdown(`**${name}** ${getTypeAnnotation(prop.type)}\n> ${prop.description}\n\n`);
        }
        
        propContent.isTrusted = true;
        contents.push(propContent);
    }

    // Add methods section for objects
    if ('methods' in item && Object.keys(item.methods).length > 0) {
        const methodContent = new vscode.MarkdownString();
        methodContent.appendMarkdown('---\n### Methods\n\n');
        
        for (const [name, method] of Object.entries(item.methods) as [string, Method][]) {
            methodContent.appendMarkdown(`**${name}**\n> ${method.description}\n\n`);
        }
        
        methodContent.isTrusted = true;
        contents.push(methodContent);
    }

    return contents;
}

// Helper function to get method signature
function getMethodSignature(item: Method): string {
    if (!item.parameters) {
        return '()';
    }
    
    const params = Object.entries(item.parameters)
        .map(([name, desc]) => {
            const isOptional = desc.includes('(optional)');
            return isOptional ? `[${name}]` : name;
        })
        .join(', ');
    
    return `(${params})`;
}

// Helper function for type annotations
function getTypeAnnotation(type: string): string {
    if (type.startsWith('object<')) {
        const objectType = type.slice(7, -1); // Remove 'object<' and '>'
        return `[\`${type}\`](command:slim.showType?${encodeURIComponent(objectType)})`;
    }
    return `\`${type}\``;
}

export const eidosDoc: EidosDocumentation = {
    categories: {
        core: ['Object', 'Dictionary', 'DataFrame'],
        simulation: ['Genome', 'Individual', 'Subpopulation', 'Species'],
        genetics: ['MutationType', 'GenomicElementType', 'Mutation', 'Substitution'],
        spatial: ['SpatialMap', 'InteractionType'],
        io: ['LogFile'],
        meta: ['Community']
    },
    functions: {
        // ==========================================
        // 1. Core Language Functions
        // ==========================================

        // Math Operations
        'abs': {
            description: 'Returns absolute value',
            parameters: {
                'x': 'Number or vector'
            },
            returns: 'numeric',
            example: 'abs(-3);'
        },
        'acos': {
            description: 'Arc cosine of x',
            parameters: {
                'x': 'Number or vector'
            },
            returns: 'float',
            example: 'acos(0.5);'
        },
        'asin': {
            description: 'Arc sine of x',
            parameters: {
                'x': 'Number or vector'
            },
            returns: 'float',
            example: 'asin(0.5);'
        },
        'atan': {
            description: 'Arc tangent of x',
            parameters: {
                'x': 'Number or vector'
            },
            returns: 'float',
            example: 'atan(1.0);'
        },
        'atan2': {
            description: 'Arc tangent of y/x, inferring the correct quadrant',
            parameters: {
                'x': 'Number or vector',
                'y': 'Number or vector'
            },
            returns: 'float',
            example: 'atan2(1.0, 1.0);'
        },
        'ceil': {
            description: 'Ceiling (rounding toward +∞) of x',
            parameters: {
                'x': 'Float or vector'
            },
            returns: 'float',
            example: 'ceil(3.7);'
        },
        'cos': {
            description: 'Cosine of x',
            parameters: {
                'x': 'Number or vector'
            },
            returns: 'float',
            example: 'cos(0.0);'
        },
        'cumProduct': {
            description: 'Cumulative product along x',
            parameters: {
                'x': 'Number or vector'
            },
            returns: 'numeric',
            example: 'cumProduct(c(1,2,3));'
        },
        'cumSum': {
            description: 'Cumulative summation along x',
            parameters: {
                'x': 'Number or vector'
            },
            returns: 'numeric',
            example: 'cumSum(c(1,2,3));'
        },
        'exp': {
            description: 'Base-e exponential of x, ex',
            parameters: {
                'x': 'Number or vector'
            },
            returns: 'float',
            example: 'exp(1.0);'
        },
        'floor': {
            description: 'Floor (rounding toward −∞) of x',
            parameters: {
                'x': 'Float or vector'
            },
            returns: 'float',
            example: 'floor(3.7);'
        },
        'integerDiv': {
            description: 'Integer division of x by y',
            parameters: {
                'x': 'Integer or vector',
                'y': 'Integer or vector'
            },
            returns: 'integer',
            example: 'integerDiv(7, 3);'
        },
        'integerMod': {
            description: 'Integer modulo of x by y (remainder after integer division)',
            parameters: {
                'x': 'Integer or vector',
                'y': 'Integer or vector'
            },
            returns: 'integer',
            example: 'integerMod(7, 3);'
        },
        'isFinite': {
            description: 'Tests if values are finite (not INF, -INF, or NAN)',
            parameters: {
                'x': 'Float or vector'
            },
            returns: 'logical',
            example: 'isFinite(1.0);'
        },
        'isInfinite': {
            description: 'Tests if values are infinite (INF or -INF only)',
            parameters: {
                'x': 'Float or vector'
            },
            returns: 'logical',
            example: 'isInfinite(1.0/0.0);'
        },
        'isNAN': {
            description: 'Tests if values are NAN',
            parameters: {
                'x': 'Float or vector'
            },
            returns: 'logical',
            example: 'isNAN(0.0/0.0);'
        },
        'log': {
            description: 'Base-e logarithm of x',
            parameters: {
                'x': 'Number or vector'
            },
            returns: 'float',
            example: 'log(2.718);'
        },
        'log10': {
            description: 'Base-10 logarithm of x',
            parameters: {
                'x': 'Number or vector'
            },
            returns: 'float',
            example: 'log10(100.0);'
        },
        'log2': {
            description: 'Base-2 logarithm of x',
            parameters: {
                'x': 'Number or vector'
            },
            returns: 'float',
            example: 'log2(8.0);'
        },
        'product': {
            description: 'Product of the elements of x, Π x',
            parameters: {
                'x': 'Number or vector'
            },
            returns: 'numeric',
            example: 'product(c(1,2,3));'
        },
        'round': {
            description: 'Round x to the nearest values; half-way cases round away from 0',
            parameters: {
                'x': 'Float or vector'
            },
            returns: 'float',
            example: 'round(3.5);'
        },
        'setDifference': {
            description: 'Set-theoretic difference, x ∖ y',
            parameters: {
                'x': 'Vector',
                'y': 'Vector'
            },
            returns: '*',
            example: 'setDifference(c(1,2,3), c(2,3,4));'
        },
        'setIntersection': {
            description: 'Set-theoretic intersection, x ∩ y',
            parameters: {
                'x': 'Vector',
                'y': 'Vector'
            },
            returns: '*',
            example: 'setIntersection(c(1,2,3), c(2,3,4));'
        },
        'setSymmetricDifference': {
            description: 'Set-theoretic symmetric difference x ∆ y',
            parameters: {
                'x': 'Vector',
                'y': 'Vector'
            },
            returns: '*',
            example: 'setSymmetricDifference(c(1,2,3), c(2,3,4));'
        },
        'setUnion': {
            description: 'Set-theoretic union, x ∪ y',
            parameters: {
                'x': 'Vector',
                'y': 'Vector'
            },
            returns: '*',
            example: 'setUnion(c(1,2,3), c(2,3,4));'
        },
        'sin': {
            description: 'Sine of x',
            parameters: {
                'x': 'Number or vector'
            },
            returns: 'float',
            example: 'sin(0.0);'
        },
        'sqrt': {
            description: 'Square root of x',
            parameters: {
                'x': 'Number or vector'
            },
            returns: 'float',
            example: 'sqrt(4.0);'
        },
        'sum': {
            description: 'Summation of the elements of x, Σ x',
            parameters: {
                'x': 'Number or vector'
            },
            returns: 'numeric',
            example: 'sum(c(1,2,3));'
        },
        'sumExact': {
            description: 'Exact summation of x without roundoff error, to the limit of floating-point precision',
            parameters: {
                'x': 'Float or vector'
            },
            returns: 'float',
            example: 'sumExact(c(0.1, 0.2, 0.3));'
        },
        'tan': {
            description: 'Tangent of x',
            parameters: {
                'x': 'Number or vector'
            },
            returns: 'float',
            example: 'tan(0.0);'
        },
        'trunc': {
            description: 'Truncation (rounding toward 0) of x',
            parameters: {
                'x': 'Float or vector'
            },
            returns: 'float',
            example: 'trunc(3.7);'
        },

        // Statistics Operations
        'cor': {
            description: "Sample Pearson's correlation coefficient between x and y",
            parameters: {
                'x': 'First numeric vector',
                'y': 'Second numeric vector'
            },
            returns: 'float',
            example: 'cor(x, y);'
        },
        'cov': {
            description: 'Corrected sample covariance between x and y',
            parameters: {
                'x': 'First numeric vector',
                'y': 'Second numeric vector'
            },
            returns: 'float',
            example: 'cov(x, y);'
        },
        'max': {
            description: 'Largest value within x and additional optional arguments',
            parameters: {
                'x': 'Vector or value',
                '...': 'Additional optional arguments'
            },
            returns: '+',
            example: 'max(c(1,2,3), 4, 5);'
        },
        'mean': {
            description: 'Arithmetic mean of x',
            parameters: {
                'x': 'Numeric vector'
            },
            returns: 'float',
            example: 'mean(c(1,2,3));'
        },
        'min': {
            description: 'Smallest value within x and additional optional arguments',
            parameters: {
                'x': 'Vector or value',
                '...': 'Additional optional arguments'
            },
            returns: '+',
            example: 'min(c(1,2,3), 0, -1);'
        },
        'pmax': {
            description: 'Parallel maximum of x and y (element-wise maximum for each corresponding pair)',
            parameters: {
                'x': 'First vector',
                'y': 'Second vector'
            },
            returns: '+',
            example: 'pmax(c(1,2,3), c(2,1,4));'
        },
        'pmin': {
            description: 'Parallel minimum of x and y (element-wise minimum for each corresponding pair)',
            parameters: {
                'x': 'First vector',
                'y': 'Second vector'
            },
            returns: '+',
            example: 'pmin(c(1,2,3), c(2,1,4));'
        },
        'quantile': {
            description: 'Quantiles of x',
            parameters: {
                'x': 'Numeric vector',
                'probs': '(optional) Probability values for quantiles'
            },
            returns: 'float',
            example: 'quantile(x, c(0.25, 0.5, 0.75));'
        },
        'range': {
            description: 'Range (min/max) of x and additional optional arguments',
            parameters: {
                'x': 'Numeric vector',
                '...': 'Additional optional arguments'
            },
            returns: 'numeric',
            example: 'range(c(1,2,3), 0, 4);'
        },
        'rank': {
            description: 'Ranks of the elements x',
            parameters: {
                'x': 'Numeric vector',
                'tiesMethod': '(optional) Method for handling ties ("average" by default)'
            },
            returns: 'numeric',
            example: 'rank(c(1,2,2,3));'
        },
        'sd': {
            description: 'Corrected sample standard deviation of x',
            parameters: {
                'x': 'Numeric vector'
            },
            returns: 'float',
            example: 'sd(c(1,2,3));'
        },
        'ttest': {
            description: 'Run a one-sample or two-sample t-test',
            parameters: {
                'x': 'Numeric vector',
                'y': '(optional) Second numeric vector for two-sample test',
                'mu': '(optional) True mean for one-sample test'
            },
            returns: 'float',
            example: 'ttest(x, y);'
        },
        'var': {
            description: 'Corrected sample variance of x',
            parameters: {
                'x': 'Numeric vector'
            },
            returns: 'float',
            example: 'var(c(1,2,3));'
        },

        // Vector Construction Operations
        'c': {
            description: 'Concatenate the given vectors to make a single vector of uniform type',
            parameters: {
                '...': 'Values or vectors to concatenate'
            },
            returns: '*',
            example: 'c(1, 2, 3, c(4, 5));'
        },
        'float': {
            description: 'Construct a float vector of length, initialized with 0.0',
            parameters: {
                'length': 'Length of vector to create'
            },
            returns: 'float',
            example: 'float(5);'
        },
        'integer': {
            description: 'Construct an integer vector of length, initialized with the given fill values',
            parameters: {
                'length': 'Length of vector to create',
                'fill1': '(optional) First fill value (default: 0)',
                'fill2': '(optional) Second fill value (default: 1)',
                'fill2indices': '(optional) Indices to fill with fill2'
            },
            returns: 'integer',
            example: 'integer(5, 0, 1, c(1,3));'
        },
        'logical': {
            description: 'Construct a logical vector of length, initialized with F',
            parameters: {
                'length': 'Length of vector to create'
            },
            returns: 'logical',
            example: 'logical(5);'
        },
        'object': {
            description: 'Construct an empty object vector',
            returns: 'object<Object>',
            example: 'object();'
        },
        'rep': {
            description: 'Repeat x a given number of times',
            parameters: {
                'x': 'Value or vector to repeat',
                'count': 'Number of times to repeat'
            },
            returns: '*',
            example: 'rep(c(1,2), 3);'
        },
        'repEach': {
            description: 'Repeat each element of x a given number of times',
            parameters: {
                'x': 'Vector whose elements to repeat',
                'count': 'Number of times to repeat each element'
            },
            returns: '*',
            example: 'repEach(c(1,2), 2);'
        },
        'sample': {
            description: 'Sample from x',
            parameters: {
                'x': 'Vector to sample from',
                'size': 'Number of elements to sample',
                'replace': '(optional) Whether to sample with replacement (default: F)',
                'weights': '(optional) Sampling weights'
            },
            returns: '*',
            example: 'sample(c(1,2,3,4), 2);'
        },
        'seq': {
            description: 'Construct a sequence',
            parameters: {
                'from': 'Start value',
                'to': 'End value',
                'by': '(optional) Step size',
                'length': '(optional) Desired length of sequence'
            },
            returns: 'numeric',
            example: 'seq(1, 10, 2);'
        },
        'seqAlong': {
            description: 'Construct a sequence along the indices of x',
            parameters: {
                'x': 'Vector to construct sequence along'
            },
            returns: 'integer',
            example: 'seqAlong(c("a","b","c"));'
        },
        'seqLen': {
            description: 'Construct a sequence with length elements, counting upward from 0',
            parameters: {
                'length': 'Length of sequence'
            },
            returns: 'integer',
            example: 'seqLen(5);'
        },
        'string': {
            description: 'Construct a string vector of length, initialized with ""',
            parameters: {
                'length': 'Length of vector to create'
            },
            returns: 'string',
            example: 'string(3);'
        },

        // Value Inspection / Manipulation Operations
        'all': {
            description: 'T if all values supplied are T, otherwise F',
            parameters: {
                'x': 'Logical vector',
                '...': 'Additional logical values'
            },
            returns: 'logical',
            example: 'all(c(T,T,T));'
        },
        'any': {
            description: 'T if any values supplied are T, otherwise F',
            parameters: {
                'x': 'Logical vector',
                '...': 'Additional logical values'
            },
            returns: 'logical',
            example: 'any(c(F,T,F));'
        },
        'cat': {
            description: 'Concatenate output',
            parameters: {
                'x': 'Value to output',
                'sep': '(optional) Separator string (default: " ")',
                'error': '(optional) Whether to write to error stream (default: F)'
            },
            returns: 'void',
            example: 'cat("Hello", "World");'
        },
        'catn': {
            description: 'Concatenate output with trailing newline',
            parameters: {
                'x': '(optional) Value to output (default: "")',
                'sep': '(optional) Separator string (default: " ")',
                'error': '(optional) Whether to write to error stream (default: F)'
            },
            returns: 'void',
            example: 'catn("Hello", "World");'
        },
        'format': {
            description: 'Format the elements of x as strings',
            parameters: {
                'format': 'Format string',
                'x': 'Numeric value to format'
            },
            returns: 'string',
            example: 'format("%.2f", 3.14159);'
        },
        'identical': {
            description: 'T if x and y are identical in all respects, otherwise F',
            parameters: {
                'x': 'First value to compare',
                'y': 'Second value to compare'
            },
            returns: 'logical',
            example: 'identical(c(1,2), c(1,2));'
        },
        'ifelse': {
            description: 'Vector conditional',
            parameters: {
                'test': 'Logical condition',
                'trueValues': 'Values to use when test is T',
                'falseValues': 'Values to use when test is F'
            },
            returns: '*',
            example: 'ifelse(x > 0, 1, -1);'
        },
        'length': {
            description: 'Count elements in x (synonymous with size())',
            parameters: {
                'x': 'Vector to measure'
            },
            returns: 'integer',
            example: 'length(c(1,2,3));'
        },
        'match': {
            description: 'Positions of matches for x within table',
            parameters: {
                'x': 'Values to look up',
                'table': 'Values to match against'
            },
            returns: 'integer',
            example: 'match(c(1,2), c(2,3,1));'
        },
        'order': {
            description: 'Indexes of x that would produce sorted order',
            parameters: {
                'x': 'Vector to sort',
                'ascending': '(optional) Sort in ascending order (default: T)'
            },
            returns: 'integer',
            example: 'order(c(3,1,2));'
        },
        'paste': {
            description: 'Paste together a string with separators',
            parameters: {
                '...': 'Values to paste together',
                'sep': '(optional) Separator string (default: " ")'
            },
            returns: 'string',
            example: 'paste("Hello", "World", sep="-");'
        },
        'paste0': {
            description: 'Paste together a string with no separators',
            parameters: {
                '...': 'Values to paste together'
            },
            returns: 'string',
            example: 'paste0("Hello", "World");'
        },
        'print': {
            description: 'Print x to the output stream',
            parameters: {
                'x': 'Value to print',
                'error': '(optional) Whether to write to error stream (default: F)'
            },
            returns: 'void',
            example: 'print("Hello");'
        },
        'rev': {
            description: 'Reverse the order of the elements in x',
            parameters: {
                'x': 'Vector to reverse'
            },
            returns: '*',
            example: 'rev(c(1,2,3));'
        },
        'size': {
            description: 'Count elements in x (synonymous with length())',
            parameters: {
                'x': 'Vector to measure'
            },
            returns: 'integer',
            example: 'size(c(1,2,3));'
        },
        'sort': {
            description: 'Sort non-object vector x',
            parameters: {
                'x': 'Vector to sort',
                'ascending': '(optional) Sort in ascending order (default: T)'
            },
            returns: '+',
            example: 'sort(c(3,1,2));'
        },
        'sortBy': {
            description: 'Sort object vector x by a property',
            parameters: {
                'x': 'Object vector to sort',
                'property': 'Property to sort by',
                'ascending': '(optional) Sort in ascending order (default: T)'
            },
            returns: 'object',
            example: 'sortBy(objects, "name");'
        },
        'str': {
            description: 'Print the external structure of a value',
            parameters: {
                'x': 'Value to examine',
                'error': '(optional) Whether to write to error stream (default: F)'
            },
            returns: 'void',
            example: 'str(x);'
        },
        'tabulate': {
            description: 'Tabulate occurrence counts of values in bin',
            parameters: {
                'bin': 'Vector of bin numbers',
                'maxbin': '(optional) Maximum bin number'
            },
            returns: 'integer',
            example: 'tabulate(c(1,2,2,3));'
        },
        'unique': {
            description: 'Unique values in x (preserveOrder = F is faster)',
            parameters: {
                'x': 'Vector to find unique values in',
                'preserveOrder': '(optional) Whether to preserve order (default: T)'
            },
            returns: '*',
            example: 'unique(c(1,2,2,3));'
        },
        'which': {
            description: 'Indices in x which are T',
            parameters: {
                'x': 'Logical vector'
            },
            returns: 'integer',
            example: 'which(c(T,F,T));'
        },
        'whichMax': {
            description: 'First index in x with the maximum value',
            parameters: {
                'x': 'Vector to search'
            },
            returns: 'integer',
            example: 'whichMax(c(1,3,2));'
        },
        'whichMin': {
            description: 'First index in x with the minimum value',
            parameters: {
                'x': 'Vector to search'
            },
            returns: 'integer',
            example: 'whichMin(c(1,3,2));'
        },

        // Distribution Drawing / Density Operations
        'dmvnorm': {
            description: 'Multivariate normal density function values',
            parameters: {
                'x': 'Float value',
                'mu': 'Mean vector',
                'sigma': 'Covariance matrix'
            },
            returns: 'float',
            example: 'dmvnorm(0.5, c(0,0), matrix(c(1,0,0,1), 2, 2));'
        },
        'dbeta': {
            description: 'Beta distribution density function values',
            parameters: {
                'x': 'Float value',
                'alpha': 'First shape parameter',
                'beta': 'Second shape parameter'
            },
            returns: 'float',
            example: 'dbeta(0.5, 2.0, 2.0);'
        },
        'dexp': {
            description: 'Exponential distribution density function values',
            parameters: {
                'x': 'Float value',
                'mu': '(optional) Rate parameter (default: 1)'
            },
            returns: 'float',
            example: 'dexp(1.0, 2.0);'
        },
        'dgamma': {
            description: 'Gamma distribution density function values',
            parameters: {
                'x': 'Float value',
                'mean': 'Mean parameter',
                'shape': 'Shape parameter'
            },
            returns: 'float',
            example: 'dgamma(1.0, 2.0, 1.0);'
        },
        'dnorm': {
            description: 'Normal density function values',
            parameters: {
                'x': 'Float value',
                'mean': '(optional) Mean parameter (default: 0)',
                'sd': '(optional) Standard deviation parameter (default: 1)'
            },
            returns: 'float',
            example: 'dnorm(0.0, 0.0, 1.0);'
        },
        'findInterval': {
            description: 'Find interval indices',
            parameters: {
                'x': 'Numeric values to find intervals for',
                'vec': 'Numeric vector defining intervals',
                'rightmostClosed': '(optional) Whether rightmost interval is closed (default: F)',
                'allInside': '(optional) Whether all values must fall in intervals (default: F)'
            },
            returns: 'integer',
            example: 'findInterval(c(1.5, 2.5), c(1,2,3));'
        },
        'pnorm': {
            description: 'Normal distribution CDF values',
            parameters: {
                'q': 'Float quantile',
                'mean': '(optional) Mean parameter (default: 0)',
                'sd': '(optional) Standard deviation parameter (default: 1)'
            },
            returns: 'float',
            example: 'pnorm(0.0, 0.0, 1.0);'
        },
        'qnorm': {
            description: 'Normal distribution quantile values',
            parameters: {
                'p': 'Float probability',
                'mean': '(optional) Mean parameter (default: 0)',
                'sd': '(optional) Standard deviation parameter (default: 1)'
            },
            returns: 'float',
            example: 'qnorm(0.975, 0.0, 1.0);'
        },
        'rbeta': {
            description: 'Beta distribution draws',
            parameters: {
                'n': 'Number of draws',
                'alpha': 'First shape parameter',
                'beta': 'Second shape parameter'
            },
            returns: 'float',
            example: 'rbeta(10, 2.0, 2.0);'
        },
        'rbinom': {
            description: 'Binomial distribution draws',
            parameters: {
                'n': 'Number of draws',
                'size': 'Number of trials',
                'prob': 'Success probability'
            },
            returns: 'integer',
            example: 'rbinom(10, 20, 0.5);'
        },
        'rcauchy': {
            description: 'Cauchy distribution draws',
            parameters: {
                'n': 'Number of draws',
                'location': '(optional) Location parameter (default: 0)',
                'scale': '(optional) Scale parameter (default: 1)'
            },
            returns: 'float',
            example: 'rcauchy(10, 0.0, 1.0);'
        },
        'rdunif': {
            description: 'Discrete uniform distribution draws',
            parameters: {
                'n': 'Number of draws',
                'min': '(optional) Minimum value (default: 0)',
                'max': '(optional) Maximum value (default: 1)'
            },
            returns: 'integer',
            example: 'rdunif(10, 1, 6);'
        },
        'rexp': {
            description: 'Exponential distribution draws',
            parameters: {
                'n': 'Number of draws',
                'mu': '(optional) Rate parameter (default: 1)'
            },
            returns: 'float',
            example: 'rexp(10, 2.0);'
        },
        'rf': {
            description: 'F-distribution draws',
            parameters: {
                'n': 'Number of draws',
                'd1': 'Degrees of freedom 1',
                'd2': 'Degrees of freedom 2'
            },
            returns: 'float',
            example: 'rf(10, 5, 10);'
        },
        'rgamma': {
            description: 'Gamma distribution draws',
            parameters: {
                'n': 'Number of draws',
                'mean': 'Mean parameter',
                'shape': 'Shape parameter'
            },
            returns: 'float',
            example: 'rgamma(10, 2.0, 1.0);'
        },
        'rgeom': {
            description: 'Geometric distribution draws',
            parameters: {
                'n': 'Number of draws',
                'p': 'Success probability'
            },
            returns: 'integer',
            example: 'rgeom(10, 0.5);'
        },
        'rlnorm': {
            description: 'Lognormal distribution draws',
            parameters: {
                'n': 'Number of draws',
                'meanlog': '(optional) Mean of log (default: 0)',
                'sdlog': '(optional) SD of log (default: 1)'
            },
            returns: 'float',
            example: 'rlnorm(10, 0.0, 1.0);'
        },
        'rmvnorm': {
            description: 'Multivariate normal distribution draws',
            parameters: {
                'n': 'Number of draws',
                'mu': 'Mean vector',
                'sigma': 'Covariance matrix'
            },
            returns: 'float',
            example: 'rmvnorm(10, c(0,0), matrix(c(1,0,0,1), 2, 2));'
        },
        'rnbinom': {
            description: 'Negative binomial distribution draws',
            parameters: {
                'n': 'Number of draws',
                'size': 'Number of successes',
                'prob': 'Success probability'
            },
            returns: 'integer',
            example: 'rnbinom(10, 10, 0.5);'
        },
        'rnorm': {
            description: 'Normal distribution draws',
            parameters: {
                'n': 'Number of draws',
                'mean': '(optional) Mean parameter (default: 0)',
                'sd': '(optional) Standard deviation parameter (default: 1)'
            },
            returns: 'float',
            example: 'rnorm(10, 0.0, 1.0);'
        },
        'rpois': {
            description: 'Poisson distribution draws',
            parameters: {
                'n': 'Number of draws',
                'lambda': 'Rate parameter'
            },
            returns: 'integer',
            example: 'rpois(10, 2.0);'
        },
        'runif': {
            description: 'Uniform distribution draws',
            parameters: {
                'n': 'Number of draws',
                'min': '(optional) Minimum value (default: 0)',
                'max': '(optional) Maximum value (default: 1)'
            },
            returns: 'float',
            example: 'runif(10, 0.0, 1.0);'
        },
        'rweibull': {
            description: 'Weibull distribution draws',
            parameters: {
                'n': 'Number of draws',
                'lambda': 'Scale parameter',
                'k': 'Shape parameter'
            },
            returns: 'float',
            example: 'rweibull(10, 1.0, 2.0);'
        },

        // Type Testing / Coercion Operations
        'asFloat': {
            description: 'Convert x to type float',
            parameters: {
                'x': 'Value to convert'
            },
            returns: 'float',
            example: 'asFloat(42);'
        },
        'asInteger': {
            description: 'Convert x to type integer',
            parameters: {
                'x': 'Value to convert'
            },
            returns: 'integer',
            example: 'asInteger(3.14);'
        },
        'asLogical': {
            description: 'Convert x to type logical',
            parameters: {
                'x': 'Value to convert'
            },
            returns: 'logical',
            example: 'asLogical(1);'
        },
        'asString': {
            description: 'Convert x to type string',
            parameters: {
                'x': 'Value to convert'
            },
            returns: 'string',
            example: 'asString(42);'
        },
        'elementType': {
            description: 'Element type of x; for object x, this is the class of the object-elements',
            parameters: {
                'x': 'Vector to check'
            },
            returns: 'string',
            example: 'elementType(c(1,2,3));'
        },
        'isFloat': {
            description: 'T if x is of type float, F otherwise',
            parameters: {
                'x': 'Value to check'
            },
            returns: 'logical',
            example: 'isFloat(3.14);'
        },
        'isInteger': {
            description: 'T if x is of type integer, F otherwise',
            parameters: {
                'x': 'Value to check'
            },
            returns: 'logical',
            example: 'isInteger(42);'
        },
        'isLogical': {
            description: 'T if x is of type logical, F otherwise',
            parameters: {
                'x': 'Value to check'
            },
            returns: 'logical',
            example: 'isLogical(T);'
        },
        'isNULL': {
            description: 'T if x is of type NULL, F otherwise',
            parameters: {
                'x': 'Value to check'
            },
            returns: 'logical',
            example: 'isNULL(NULL);'
        },
        'isObject': {
            description: 'T if x is of type object, F otherwise',
            parameters: {
                'x': 'Value to check'
            },
            returns: 'logical',
            example: 'isObject(object());'
        },
        'isString': {
            description: 'T if x is of type string, F otherwise',
            parameters: {
                'x': 'Value to check'
            },
            returns: 'logical',
            example: 'isString("hello");'
        },
        'type': {
            description: 'Type of vector x; this is NULL, logical, integer, float, string, or object',
            parameters: {
                'x': 'Vector to check'
            },
            returns: 'string',
            example: 'type(c(1,2,3));'
        },

        // Filesystem Access Operations
        'createDirectory': {
            description: 'Create a new filesystem directory at path',
            parameters: {
                'path': 'Directory path to create'
            },
            returns: 'logical',
            example: 'createDirectory("newdir");'
        },
        'deleteFile': {
            description: 'Delete file at filePath',
            parameters: {
                'filePath': 'Path to file to delete'
            },
            returns: 'logical',
            example: 'deleteFile("oldfile.txt");'
        },
        'fileExists': {
            description: 'Check for the existence of a file (or directory) at filePath',
            parameters: {
                'filePath': 'Path to check'
            },
            returns: 'logical',
            example: 'fileExists("data.txt");'
        },
        'filesAtPath': {
            description: 'Get the names of the files in a directory',
            parameters: {
                'path': 'Directory path to list',
                'fullPaths': '(optional) Whether to return full paths (default: F)'
            },
            returns: 'string',
            example: 'filesAtPath(".");'
        },
        'flushFile': {
            description: 'Flush any buffered content for the file at filePath',
            parameters: {
                'filePath': 'Path to file to flush'
            },
            returns: 'logical',
            example: 'flushFile("output.txt");'
        },
        'getwd': {
            description: 'Get the current filesystem working directory',
            returns: 'string',
            example: 'getwd();'
        },
        'readCSV': {
            description: 'Read tabular data from a CSV/TSV file to create a new DataFrame',
            parameters: {
                'filePath': 'Path to CSV file',
                'colNames': '(optional) Whether first row contains column names (default: T)',
                'colTypes': '(optional) Column types',
                'sep': '(optional) Field separator (default: ",")',
                'quote': '(optional) Quote character (default: "\"")',
                'dec': '(optional) Decimal point character (default: ".")',
                'comment': '(optional) Comment character (default: "")'
            },
            returns: 'object<DataFrame>',
            example: 'readCSV("data.csv");'
        },
        'readFile': {
            description: 'Read lines from the file at filePath as a string vector',
            parameters: {
                'filePath': 'Path to file to read'
            },
            returns: 'string',
            example: 'readFile("input.txt");'
        },
        'setwd': {
            description: 'Set the filesystem working directory',
            parameters: {
                'path': 'New working directory path'
            },
            returns: 'string',
            example: 'setwd("../data");'
        },
        'tempdir': {
            description: 'Get the path for a directory suitable for temporary files',
            returns: 'string',
            example: 'tempdir();'
        },
        'writeFile': {
            description: 'Write to a file',
            parameters: {
                'filePath': 'Path to file to write',
                'contents': 'Content to write',
                'append': '(optional) Whether to append to existing file (default: F)',
                'compress': '(optional) Whether to compress output (default: F)'
            },
            returns: 'logical',
            example: 'writeFile("output.txt", "Hello");'
        },
        'writeTempFile': {
            description: 'Write to a temporary file',
            parameters: {
                'prefix': 'Prefix for temporary filename',
                'suffix': 'Suffix for temporary filename',
                'contents': 'Content to write',
                'compress': '(optional) Whether to compress output (default: F)'
            },
            returns: 'string',
            example: 'writeTempFile("tmp", ".txt", "Hello");'
        },

        // String Manipulation Operations
        'grep': {
            description: 'Regular expression substring matching',
            parameters: {
                'pattern': 'Regular expression pattern',
                'x': 'String vector to search',
                'ignoreCase': '(optional) Case-insensitive matching (default: F)',
                'grammar': '(optional) Regex grammar to use (default: "ECMAScript")',
                'value': '(optional) Return type (default: "indices")',
                'fixed': '(optional) Fixed string matching (default: F)',
                'invert': '(optional) Invert matches (default: F)'
            },
            returns: 'logical|integer|string',
            example: 'grep("a+", c("abc", "def"));'
        },
        'nchar': {
            description: 'Character counts for the string values in x',
            parameters: {
                'x': 'String vector'
            },
            returns: 'integer',
            example: 'nchar("hello");'
        },
        'strcontains': {
            description: 'Check for occurrence of s in x from pos',
            parameters: {
                'x': 'String to search in',
                's': 'String to search for',
                'pos': '(optional) Starting position (default: 0)'
            },
            returns: 'logical',
            example: 'strcontains("hello", "el");'
        },
        'strfind': {
            description: 'Find first occurrences of s in x from pos',
            parameters: {
                'x': 'String to search in',
                's': 'String to search for',
                'pos': '(optional) Starting position (default: 0)'
            },
            returns: 'integer',
            example: 'strfind("hello", "l");'
        },
        'strprefix': {
            description: 'Check for prefix s in x',
            parameters: {
                'x': 'String to check',
                's': 'Prefix to look for'
            },
            returns: 'logical',
            example: 'strprefix("hello", "he");'
        },
        'strsplit': {
            description: 'Split string x into substrings by separator sep',
            parameters: {
                'x': 'String to split',
                'sep': '(optional) Separator (default: " ")'
            },
            returns: 'string',
            example: 'strsplit("a,b,c", ",");'
        },
        'strsuffix': {
            description: 'Check for suffix s in x',
            parameters: {
                'x': 'String to check',
                's': 'Suffix to look for'
            },
            returns: 'logical',
            example: 'strsuffix("hello", "lo");'
        },
        'substr': {
            description: 'Get substrings from x',
            parameters: {
                'x': 'String to extract from',
                'first': 'Starting position',
                'last': '(optional) Ending position'
            },
            returns: 'string',
            example: 'substr("hello", 1, 3);'
        },

        // Matrix and Array Operations
        'apply': {
            description: 'Apply code across margins of matrix/array x',
            parameters: {
                'x': 'Matrix or array',
                'margin': 'Dimension to apply over',
                'lambdaSource': 'Code to apply'
            },
            returns: '*',
            example: 'apply(matrix(1:4,2,2), 1, "sum(applyValue);");'
        },
        'array': {
            description: 'Create an array from data, with dimensionality dim',
            parameters: {
                'data': 'Data to arrange',
                'dim': 'Dimensions'
            },
            returns: '*',
            example: 'array(1:8, c(2,2,2));'
        },
        'cbind': {
            description: 'Combine vectors and/or matrices by column',
            parameters: {
                '...': 'Vectors or matrices to combine'
            },
            returns: '*',
            example: 'cbind(c(1,2), c(3,4));'
        },
        'diag': {
            description: 'Diagonal of x',
            parameters: {
                'x': '(optional) Matrix (default: 1)',
                'nrow': '(optional) Number of rows',
                'ncol': '(optional) Number of columns'
            },
            returns: '*',
            example: 'diag(c(1,2,3));'
        },
        'dim': {
            description: 'Dimensions of matrix or array x',
            parameters: {
                'x': 'Matrix or array'
            },
            returns: 'integer',
            example: 'dim(matrix(1:4,2,2));'
        },
        'drop': {
            description: 'Drop redundant dimensions from matrix or array x',
            parameters: {
                'x': 'Matrix or array'
            },
            returns: '*',
            example: 'drop(array(1:4,c(2,2,1)));'
        },
        'lowerTri': {
            description: 'Lower triangle of matrix x',
            parameters: {
                'x': 'Matrix',
                'diag': '(optional) Include diagonal (default: F)'
            },
            returns: 'logical',
            example: 'lowerTri(matrix(1:4,2,2));'
        },
        'matrix': {
            description: 'Create a matrix',
            parameters: {
                'data': 'Data to arrange',
                'nrow': '(optional) Number of rows',
                'ncol': '(optional) Number of columns',
                'byrow': '(optional) Fill by row (default: F)'
            },
            returns: '*',
            example: 'matrix(1:4, 2, 2);'
        },
        'matrixMult': {
            description: 'Matrix multiplication of conformable matrices x and y',
            parameters: {
                'x': 'First matrix',
                'y': 'Second matrix'
            },
            returns: 'numeric',
            example: 'matrixMult(matrix(1:4,2,2), matrix(5:8,2,2));'
        },
        'ncol': {
            description: 'Number of columns in matrix or array x',
            parameters: {
                'x': 'Matrix or array'
            },
            returns: 'integer',
            example: 'ncol(matrix(1:4,2,2));'
        },
        'nrow': {
            description: 'Number of rows in matrix or array x',
            parameters: {
                'x': 'Matrix or array'
            },
            returns: 'integer',
            example: 'nrow(matrix(1:4,2,2));'
        },
        'rbind': {
            description: 'Combine vectors and/or matrices by row',
            parameters: {
                '...': 'Vectors or matrices to combine'
            },
            returns: '*',
            example: 'rbind(c(1,2), c(3,4));'
        },
        't': {
            description: 'Transpose of x',
            parameters: {
                'x': 'Matrix'
            },
            returns: '*',
            example: 't(matrix(1:4,2,2));'
        },
        'upperTri': {
            description: 'Upper triangle of matrix x',
            parameters: {
                'x': 'Matrix',
                'diag': '(optional) Include diagonal (default: F)'
            },
            returns: 'logical',
            example: 'upperTri(matrix(1:4,2,2));'
        },

        // Miscellaneous Operations
        'assert': {
            description: 'Assert that condition(s) are true; if not, stop',
            parameters: {
                'assertions': 'Logical conditions to check',
                'message': '(optional) Error message'
            },
            returns: 'void',
            example: 'assert(x > 0, "x must be positive");'
        },
        'beep': {
            description: 'Play a sound or beep',
            parameters: {
                'soundName': '(optional) Name of sound to play'
            },
            returns: 'void',
            example: 'beep();'
        },
        'citation': {
            description: 'Print the reference citation for Eidos and the current Context',
            returns: 'void',
            example: 'citation();'
        },
        'clock': {
            description: 'Get the current CPU usage clock, for timing of code blocks',
            parameters: {
                'type': '(optional) Clock type (default: "cpu")'
            },
            returns: 'float',
            example: 'clock();'
        },
        'date': {
            description: 'Get the current date as a formatted string',
            returns: 'string',
            example: 'date();'
        },
        'debugIndent': {
            description: 'Get the current indentation string for debugging output',
            returns: 'string',
            example: 'debugIndent();'
        },
        'defineConstant': {
            description: 'Define a new constant with a given value',
            parameters: {
                'symbol': 'Name of constant',
                'value': 'Value of constant'
            },
            returns: 'void',
            example: 'defineConstant("pi", 3.14159);'
        },
        'defineGlobal': {
            description: 'Define a new global variable with a given value',
            parameters: {
                'symbol': 'Name of variable',
                'value': 'Initial value'
            },
            returns: 'void',
            example: 'defineGlobal("counter", 0);'
        },
        'doCall': {
            description: 'Call the named function with the given arguments',
            parameters: {
                'functionName': 'Name of function to call',
                '...': 'Arguments to pass'
            },
            returns: '*',
            example: 'doCall("sum", c(1,2,3));'
        },
        'executeLambda': {
            description: 'Execute a string as code',
            parameters: {
                'lambdaSource': 'Code to execute',
                'timed': '(optional) Whether to time execution (default: F)'
            },
            returns: '*',
            example: 'executeLambda("x = 5; return x * 2;");'
        },
        'exists': {
            description: 'T for defined symbols, F otherwise',
            parameters: {
                'symbol': 'Symbol to check'
            },
            returns: 'logical',
            example: 'exists("x");'
        },
        'functionSignature': {
            description: 'Print the call signature(s) for function(s)',
            parameters: {
                'functionName': '(optional) Function name to show'
            },
            returns: 'void',
            example: 'functionSignature("mean");'
        },
        'functionSource': {
            description: 'Print the Eidos source code (if any) for a function',
            parameters: {
                'functionName': 'Function name'
            },
            returns: 'void',
            example: 'functionSource("mean");'
        },
        'getSeed': {
            description: 'Get the last random number generator seed set',
            returns: 'integer',
            example: 'getSeed();'
        },
        'license': {
            description: 'Print license information for Eidos and the current Context',
            returns: 'void',
            example: 'license();'
        },
        'ls': {
            description: 'List all variables currently defined',
            parameters: {
                'showSymbolTables': '(optional) Show symbol table info (default: F)'
            },
            returns: 'void',
            example: 'ls();'
        },
        'rm': {
            description: 'Remove (undefine) variables',
            parameters: {
                'variableNames': '(optional) Names of variables to remove'
            },
            returns: 'void',
            example: 'rm("x");'
        },
        'sapply': {
            description: 'Apply code across elements of x',
            parameters: {
                'x': 'Vector to iterate over',
                'lambdaSource': 'Code to apply',
                'simplify': '(optional) How to simplify result (default: "vector")'
            },
            returns: '*',
            example: 'sapply(1:3, "applyValue * 2;");'
        },
        'setSeed': {
            description: 'Set the random number generator seed',
            parameters: {
                'seed': 'Seed value'
            },
            returns: 'void',
            example: 'setSeed(42);'
        },
        'source': {
            description: 'Execute a source file as code',
            parameters: {
                'filePath': 'Path to source file',
                'chdir': '(optional) Change directory to file location (default: F)'
            },
            returns: 'void',
            example: 'source("script.slim");'
        },
        'stop': {
            description: 'Stop execution and print the given error message',
            parameters: {
                'message': '(optional) Error message'
            },
            returns: 'void',
            example: 'stop("Error occurred");'
        },
        'suppressWarnings': {
            description: 'Suppress (or stop suppressing) warning messages',
            parameters: {
                'suppress': 'Whether to suppress warnings'
            },
            returns: 'logical',
            example: 'suppressWarnings(T);'
        },
        'sysinfo': {
            description: 'Get information about the system – operating system, hardware, etc.',
            parameters: {
                'key': 'Information key to retrieve'
            },
            returns: '*',
            example: 'sysinfo("os");'
        },
        'system': {
            description: 'Run a Un*x command with the given arguments and input',
            parameters: {
                'command': 'Command to run',
                'args': '(optional) Command arguments (default: "")',
                'input': '(optional) Input to command (default: "")',
                'stderr': '(optional) Capture stderr (default: F)',
                'wait': '(optional) Wait for completion (default: T)'
            },
            returns: 'string',
            example: 'system("ls", "-l");'
        },
        'time': {
            description: 'Get the current time as a formatted string',
            returns: 'string',
            example: 'time();'
        },
        'usage': {
            description: 'Get the current or peak memory usage of the process',
            parameters: {
                'peak': '(optional) Get peak usage (default: F)'
            },
            returns: 'float',
            example: 'usage();'
        },
        'version': {
            description: 'Get the Eidos and Context version numbers',
        },

        // ==========================================
        // 2. SLiM Event and Callback Functions
        // ==========================================
        
        'initialize': {
            description: 'Initialize the simulation model. Called at the start of the simulation.',
            parameters: {
                'id': '(optional) Callback identifier'
            },
            returns: 'void',
            example: 'initialize() {\n  initializeMutationType("m1", 0.5, "f", 0.0);\n}'
        },

        'first': {
            description: 'Called first in each generation cycle',
            parameters: {
                'id': '(optional) Callback identifier',
                't1': '(optional) Start generation',
                't2': '(optional) End generation'
            },
            returns: 'void',
            example: '1 first() {\n  sim.addSubpop("p1", 100);\n}'
        },

        'early': {
            description: 'Called early in each generation cycle',
            parameters: {
                'id': '(optional) Callback identifier',
                't1': '(optional) Start generation',
                't2': '(optional) End generation'
            },
            returns: 'void',
            example: '1:10 early() {\n  // early events\n}'
        },

        'late': {
            description: 'Called late in each generation cycle',
            parameters: {
                'id': '(optional) Callback identifier',
                't1': '(optional) Start generation',
                't2': '(optional) End generation'
            },
            returns: 'void',
            example: '1:10 late() {\n  // late events\n}'
        },

        'fitnessEffect': {
            description: 'Calculate fitness effects for individuals',
            parameters: {
                'id': '(optional) Callback identifier',
                't1': '(optional) Start generation',
                't2': '(optional) End generation',
                'subpopId': '(optional) Subpopulation identifier'
            },
            returns: 'float',
            example: '1:10 fitnessEffect(p1) {\n  return 1.0;\n}'
        },

        'interaction': {
            description: 'Handle interactions between individuals',
            parameters: {
                'id': '(optional) Callback identifier',
                't1': '(optional) Start generation',
                't2': '(optional) End generation',
                'intTypeId': 'Interaction type identifier',
                'subpopId': '(optional) Subpopulation identifier'
            },
            returns: 'void',
            example: '1:10 interaction("i1", p1) {\n  // handle interactions\n}'
        },

        'mateChoice': {
            description: 'Choose mates in Wright-Fisher models',
            parameters: {
                'id': '(optional) Callback identifier',
                't1': '(optional) Start generation',
                't2': '(optional) End generation',
                'subpopId': '(optional) Subpopulation identifier'
            },
            returns: 'object<Individual>',
            example: '1:10 mateChoice(p1) {\n  return individual;\n}'
        },

        'modifyChild': {
            description: 'Modify child after generation',
            parameters: {
                'id': '(optional) Callback identifier',
                't1': '(optional) Start generation',
                't2': '(optional) End generation',
                'subpopId': '(optional) Subpopulation identifier'
            },
            returns: 'void',
            example: '1:10 modifyChild(p1) {\n  // modify child\n}'
        },

        'mutationEffect': {
            description: 'Calculate effects of mutations',
            parameters: {
                'id': '(optional) Callback identifier',
                't1': '(optional) Start generation',
                't2': '(optional) End generation',
                'mutTypeId': 'Mutation type identifier',
                'subpopId': '(optional) Subpopulation identifier'
            },
            returns: 'float',
            example: '1:10 mutationEffect(m1, p1) {\n  return 1.0;\n}'
        },

        'recombination': {
            description: 'Handle recombination events',
            parameters: {
                'id': '(optional) Callback identifier',
                't1': '(optional) Start generation',
                't2': '(optional) End generation',
                'subpopId': '(optional) Subpopulation identifier'
            },
            returns: 'integer',
            example: '1:10 recombination(p1) {\n  return breakpoints;\n}'
        },

        'mutation': {
            description: 'Handle mutation events',
            parameters: {
                'id': '(optional) Callback identifier',
                't1': '(optional) Start generation',
                't2': '(optional) End generation',
                'mutTypeId': '(optional) Mutation type identifier',
                'subpopId': '(optional) Subpopulation identifier'
            },
            returns: 'void',
            example: '1:10 mutation(m1, p1) {\n  // handle mutations\n}'
        },

        'reproduction': {
            description: 'Handle reproduction in non-Wright-Fisher models',
            parameters: {
                'id': '(optional) Callback identifier',
                't1': '(optional) Start generation',
                't2': '(optional) End generation',
                'subpopId': '(optional) Subpopulation identifier',
                'sex': '(optional) Sex of parent ("M"/"F")'
            },
            returns: 'void',
            example: '1:10 reproduction(p1, "F") {\n  // handle reproduction\n}'
        },

        'survival': {
            description: 'Handle survival in non-Wright-Fisher models',
            parameters: {
                'id': '(optional) Callback identifier',
                't1': '(optional) Start generation',
                't2': '(optional) End generation',
                'subpopId': '(optional) Subpopulation identifier'
            },
            returns: 'void',
            example: '1:10 survival(p1) {\n  // handle survival\n}'
        },

        // ==========================================
        // 3. SLiM Initialization Functions
        // ==========================================
        
        'initializeAncestralNucleotides': {
            description: 'Initialize ancestral nucleotide sequence (nucleotide-based models only)',
            parameters: {
                'sequence': 'String representing nucleotide sequence'
            },
            returns: 'integer',
            example: 'initializeAncestralNucleotides("ATCG");'
        },

        'initializeGeneConversion': {
            description: 'Configure gene conversion parameters',
            parameters: {
                'nonCrossoverFraction': 'Fraction of recombination events that are gene conversions',
                'meanLength': 'Mean length of gene conversion tract',
                'simpleConversionFraction': 'Fraction of conversions that are simple',
                'bias': '(optional) GC bias parameter',
                'redrawLengthsOnFailure': '(optional) Whether to redraw tract lengths on failure'
            },
            returns: 'void',
            example: 'initializeGeneConversion(0.1, 100.0, 0.5);'
        },

        'initializeGenomicElement': {
            description: 'Define a genomic element',
            parameters: {
                'genomicElementType': 'Type of genomic element',
                'start': 'Start position',
                'end': 'End position'
            },
            returns: 'object<GElement>',
            example: 'initializeGenomicElement(g1, 100, 200);'
        },

        'initializeGenomicElementType': {
            description: 'Define a genomic element type',
            parameters: {
                'id': 'Identifier for the element type',
                'mutationTypes': 'Mutation types that can occur',
                'proportions': 'Relative proportions of mutation types',
                'mutationMatrix': '(optional) Mutation matrix for nucleotide-based models'
            },
            returns: 'object<GEType>',
            example: 'initializeGenomicElementType("g1", m1, 1.0);'
        },

        'initializeHotspotMap': {
            description: 'Define recombination hotspots (nucleotide-based models only)',
            parameters: {
                'multipliers': 'Multiplier values for hotspots',
                'ends': '(optional) End positions for regions',
                'sex': '(optional) Sex-specificity ("M"/"F")'
            },
            returns: 'void',
            example: 'initializeHotspotMap(c(1.0, 5.0, 1.0), c(1000, 2000));'
        },

        'initializeInteractionType': {
            description: 'Define a spatial interaction type',
            parameters: {
                'id': 'Identifier for interaction type',
                'spatiality': 'Spatial properties ("x"/"y"/"z")',
                'reciprocal': '(optional) Whether interaction is reciprocal',
                'maxDistance': '(optional) Maximum interaction distance',
                'sexSegregation': '(optional) Sex-based segregation'
            },
            returns: 'object<IntType>',
            example: 'initializeInteractionType("i1", "xy", T, 1.0);'
        },

        'initializeMutationRate': {
            description: 'Set mutation rate(s)',
            parameters: {
                'rates': 'Mutation rate values',
                'ends': '(optional) End positions for regions',
                'sex': '(optional) Sex-specificity ("M"/"F")'
            },
            returns: 'void',
            example: 'initializeMutationRate(1e-7);'
        },

        'initializeMutationType': {
            description: 'Define a mutation type',
            parameters: {
                'id': 'Identifier for mutation type',
                'dominanceCoeff': 'Dominance coefficient',
                'distributionType': 'Distribution of fitness effects',
                '...': 'Distribution parameters'
            },
            returns: 'object<MutType>',
            example: 'initializeMutationType("m1", 0.5, "f", 0.0);'
        },

        'initializeMutationTypeNuc': {
            description: 'Define a mutation type (nucleotide-based models only)',
            parameters: {
                'id': 'Identifier for mutation type',
                'dominanceCoeff': 'Dominance coefficient',
                'distributionType': 'Distribution of fitness effects',
                '...': 'Distribution parameters'
            },
            returns: 'object<MutType>',
            example: 'initializeMutationTypeNuc("m1", 0.5, "f", 0.0);'
        },

        'initializeRecombinationRate': {
            description: 'Set recombination rate(s)',
            parameters: {
                'rates': 'Recombination rate values',
                'ends': '(optional) End positions for regions',
                'sex': '(optional) Sex-specificity ("M"/"F")'
            },
            returns: 'void',
            example: 'initializeRecombinationRate(1e-8);'
        },

        'initializeSex': {
            description: 'Configure sex determination',
            parameters: {
                'chromosomeType': 'Type of sex chromosomes ("A"/"X"/"Y")'
            },
            returns: 'void',
            example: 'initializeSex("X");'
        },

        'initializeSLiMModelType': {
            description: 'Set the type of SLiM model',
            parameters: {
                'modelType': 'Type of model ("WF"/"nonWF")'
            },
            returns: 'void',
            example: 'initializeSLiMModelType("WF");'
        },

        'initializeSLiMOptions': {
            description: 'Configure SLiM simulation options',
            parameters: {
                'keepPedigrees': '(optional) Whether to track pedigree relationships',
                'dimensionality': '(optional) Spatial dimensions ("x"/"xy"/"xyz")',
                'periodicity': '(optional) Periodic boundaries',
                'mutationRuns': '(optional) Number of mutation runs',
                'preventIncidentalSelfing': '(optional) Prevent accidental self-fertilization',
                'nucleotideBased': '(optional) Use nucleotide-based model',
                'randomizeCallbacks': '(optional) Randomize callback order'
            },
            returns: 'void',
            example: 'initializeSLiMOptions(keepPedigrees=T, dimensionality="xy");'
        },

        'initializeSpecies': {
            description: 'Configure species properties',
            parameters: {
                'tickModulo': '(optional) Modulo for species ticks',
                'tickPhase': '(optional) Phase for species ticks',
                'avatar': '(optional) Species avatar symbol',
                'color': '(optional) Species color'
            },
            returns: 'void',
            example: 'initializeSpecies(tickModulo=1);'
        },

        'initializeTreeSeq': {
            description: 'Configure tree sequence recording',
            parameters: {
                'recordMutations': '(optional) Whether to record mutations',
                'simplificationRatio': '(optional) Simplification ratio',
                'simplificationInterval': '(optional) Simplification interval',
                'checkCoalescence': '(optional) Check for coalescence',
                'runCrosschecks': '(optional) Run consistency checks',
                'retainCoalescentOnly': '(optional) Retain only coalescent nodes',
                'timeUnit': '(optional) Time unit for recording'
            },
            returns: 'void',
            example: 'initializeTreeSeq(recordMutations=T);'
        },

        // ==========================================
        // 4. SLiM Population-Genetics Utilities
        // ==========================================
        
        'calcFST': {
            description: 'Calculate FST between two sets of genomes',
                    parameters: {
                'genomes1': 'First set of genomes',
                'genomes2': 'Second set of genomes',
                'muts': '(optional) Mutations to consider',
                        'start': '(optional) Start position',
                'end': '(optional) End position'
            },
                    returns: 'float',
            example: 'calcFST(p1.genomes, p2.genomes);'
        },

        'calcHeterozygosity': {
            description: 'Calculate expected heterozygosity',
                    parameters: {
                'genomes': 'Genomes to analyze',
                'muts': '(optional) Mutations to consider',
                        'start': '(optional) Start position',
                'end': '(optional) End position'
                    },
                    returns: 'float',
            example: 'calcHeterozygosity(p1.genomes);'
        },

        'calcInbreedingLoad': {
            description: 'Calculate inbreeding load',
                    parameters: {
                'genomes': 'Genomes to analyze',
                'mutType': '(optional) Mutation type to consider'
                    },
                    returns: 'float',
            example: 'calcInbreedingLoad(p1.genomes, m1);'
        },

        'calcPairHeterozygosity': {
            description: 'Calculate heterozygosity between two genomes',
            parameters: {
                'genome1': 'First genome',
                'genome2': 'Second genome',
                'start': '(optional) Start position',
                'end': '(optional) End position',
                'infiniteSites': '(optional) Use infinite sites model'
            },
            returns: 'float',
            example: 'calcPairHeterozygosity(g1, g2);'
        },

        'calcPi': {
            description: 'Calculate nucleotide diversity (π)',
            parameters: {
                'genomes': 'Genomes to analyze',
                'muts': '(optional) Mutations to consider',
                'start': '(optional) Start position',
                'end': '(optional) End position'
            },
            returns: 'float',
            example: 'calcPi(p1.genomes);'
        },

        'calcTajimasD': {
            description: "Calculate Tajima's D statistic",
            parameters: {
                'genomes': 'Genomes to analyze',
                'muts': '(optional) Mutations to consider',
                'start': '(optional) Start position',
                'end': '(optional) End position'
            },
            returns: 'float',
            example: 'calcTajimasD(p1.genomes);'
        },

        'calcVA': {
            description: 'Calculate additive genetic variance',
            parameters: {
                'individuals': 'Individuals to analyze',
                'mutType': 'Mutation type to consider'
            },
            returns: 'float',
            example: 'calcVA(p1.individuals, m1);'
        },
        'calcWattersonsTheta': {
            description: "Calculate Watterson's theta",
            parameters: {
                'genomes': 'Genomes to analyze',
                'muts': '(optional) Mutations to consider',
                'start': '(optional) Start position',
                'end': '(optional) End position'
            },
            returns: 'float',
            example: 'calcWattersonsTheta(p1.genomes);'
        },

        // ==========================================
        // 5. SLiM Nucleotide-Based Utilities
        // ==========================================

        'codonsToAminoAcids': {
            description: 'Convert codons to amino acids',
            parameters: {
                'codons': 'Codons to convert',
                'long': '(optional) Use long names',
                'paste': '(optional) Concatenate results'
            },
            returns: 'string',
            example: 'codonsToAminoAcids(c(1,2,3));'
        },
        'codonsToNucleotides': {
            description: 'Convert codons to nucleotide sequences',
            parameters: {
                'codons': 'Codons to convert',
                'format': '(optional) Output format'
            },
            returns: 'string',
            example: 'codonsToNucleotides(c(1,2,3));'
        },
        'mm16To256': {
            description: 'Convert 16-parameter mutation matrix to 256-parameter',
            parameters: {
                'mutationMatrix': 'Input mutation matrix'
            },
            returns: 'float',
            example: 'mm16To256(matrix);'
        },
        'mmJukesCantor': {
            description: 'Generate Jukes-Cantor mutation matrix',
            parameters: {
                'alpha': 'Substitution rate'
            },
            returns: 'float',
            example: 'mmJukesCantor(0.1);'
        },
        'mmKimura': {
            description: 'Generate Kimura mutation matrix',
            parameters: {
                'alpha': 'Transition rate',
                'beta': 'Transversion rate'
            },
            returns: 'float',
            example: 'mmKimura(0.1, 0.05);'
        },
        'nucleotideCounts': {
            description: 'Count nucleotides in sequence',
            parameters: {
                'sequence': 'Sequence to analyze'
            },
            returns: 'integer',
            example: 'nucleotideCounts("ATCG");'
        },
        'nucleotideFrequencies': {
            description: 'Calculate nucleotide frequencies',
            parameters: {
                'sequence': 'Sequence to analyze'
            },
            returns: 'float',
            example: 'nucleotideFrequencies("ATCG");'
        },
        'nucleotidesToCodons': {
            description: 'Convert nucleotide sequence to codons',
            parameters: {
                'sequence': 'Sequence to convert'
            },
            returns: 'integer',
            example: 'nucleotidesToCodons("ATCGAA");'
        },
        'randomNucleotides': {
            description: 'Generate random nucleotide sequence',
            parameters: {
                'length': 'Length of sequence',
                'basis': '(optional) Base frequencies',
                'format': '(optional) Output format'
            },
            returns: 'string',
            example: 'randomNucleotides(100);'
        },

        // ==========================================
        // 6. SLiM Other Utilities
        // ==========================================

        'summarizeIndividuals': {
            description: 'Summarize individual properties over space',
            parameters: {
                'individuals': 'Individuals to summarize',
                'dim': 'Grid dimensions',
                'spatialBounds': 'Spatial boundaries',
                'operation': 'Summary operation',
                'empty': '(optional) Value for empty cells',
                'perUnitArea': '(optional) Normalize by area',
                'spatiality': '(optional) Spatial dimensions'
            },
            returns: 'float',
            example: 'summarizeIndividuals(p1.individuals, c(10,10), c(0,0,1,1), "count");'
        },
        'treeSeqMetadata': {
            description: 'Get metadata from tree sequence file',
            parameters: {
                'filePath': 'Path to tree sequence file',
                'userData': '(optional) Include user data'
            },
            returns: 'object<Dictionary>',
            example: 'treeSeqMetadata("trees.trees");'
        }
    },
    interfaces: {
        'Comparable': {
            description: 'Interface for objects that can be compared for equality and ordering',
            methods: {
                'compare': {
                    description: 'Compare this object with another for ordering',
                    parameters: {
                        'x': 'Object to compare with'
                    },
                    returns: 'integer (-1, 0, or 1)',
                    example: 'x.compare(y);'
                },
                'equals': {
                    description: 'Test if this object equals another',
                    parameters: {
                        'x': 'Object to compare with'
                    },
                    returns: 'logical',
                    example: 'x.equals(y);'
                }
            }
        },
        
        'Copyable': {
            description: 'Interface for objects that can be copied',
            methods: {
                'copy': {
                    description: 'Create a copy of this object',
                    returns: 'object',
                    example: 'x.copy();'
                }
            }
        }
    },
    objects: {

        // ==========================================
        // 1. Eidos Core Objects
        // ==========================================
        'Object': {
            description: 'Base class for all Eidos objects',
            constructor: {
                description: 'Create a new Object',
                example: 'Object()'
            },
            methods: {
                'length': {
                    description: 'Count elements in the target object vector (synonymous with size())',
                    returns: 'integer',
                    example: 'x.length();'
                },
                'methodSignature': {
                    description: 'Print the signature for methodName, or for all methods',
                    parameters: {
                        'methodName': '(optional) Name of method to show signature for'
                    },
                    returns: 'void',
                    example: 'x.methodSignature("length");'
                },
                'propertySignature': {
                    description: 'Print the signature for propertyName, or for all properties',
                    parameters: {
                        'propertyName': '(optional) Name of property to show signature for'
                    },
                    returns: 'void',
                    example: 'x.propertySignature();'
                },
                'size': {
                    description: 'Count elements in the target object vector (synonymous with length())',
                    returns: 'integer',
                    example: 'x.size();'
                },
                'str': {
                    description: 'Print the internal structure (properties, types, values) for an object vector',
                    returns: 'void',
                    example: 'x.str();'
                },
                'stringRepresentation': {
                    description: 'Returns the string representation that print() would print',
                    returns: 'string',
                    example: 'x.stringRepresentation();'
                }
            }
        },

        'Dictionary': {
            description: 'A key-value mapping object',
            extends: 'Object',
            implements: ['Copyable'],
            constructor: {
                description: 'Creates a new Dictionary',
                parameters: [
                    {
                        name: 'key',
                        description: 'Key for dictionary entry',
                        type: 'integer|string',
                        required: false
                    },
                    {
                        name: 'value',
                        description: 'Value for dictionary entry',
                        type: '*',
                        required: false
                    },
                    {
                        name: '...',
                        description: 'Additional key-value pairs',
                        type: '*',
                        required: false
                    }
                ],
                example: 'Dictionary(); // empty\nDictionary("key", value); // with pairs\nDictionary(d); // copy\nDictionary("{\"key\": \"value\"}"); // from JSON'
            },
            properties: {
                'allKeys': {
                    description: 'A vector of all keys that have been assigned a value',
                    type: 'integer|string',
                    returns: 'integer|string'
                }
            },
            methods: {
                'addKeysAndValuesFrom': {
                    description: 'Adds key-value pairs from source',
                    parameters: {
                        'source': 'Source object to copy from'
                    },
                    returns: 'void',
                    example: 'dict.addKeysAndValuesFrom(other);'
                },
                'appendKeysAndValuesFrom': {
                    description: 'Appends key-value pairs from source',
                    parameters: {
                        'source': 'Source object to append from'
                    },
                    returns: 'void',
                    example: 'dict.appendKeysAndValuesFrom(other);'
                },
                'clearKeysAndValues': {
                    description: 'Removes all key-value pairs',
                    returns: 'void',
                    example: 'dict.clearKeysAndValues();'
                },
                'compactIndices': {
                    description: 'Compacts integer indices used by the receiver',
                    parameters: {
                        'preserveOrder': '(optional) Whether to preserve order (default: F)'
                    },
                    returns: 'integer',
                    example: 'dict.compactIndices(T);'
                },
                'getRowValues': {
                    description: 'Returns selected "rows"',
                    parameters: {
                        'index': 'Row indices to get',
                        'drop': '(optional) Whether to drop single-dimension results (default: F)'
                    },
                    returns: 'Dictionary',
                    example: 'dict.getRowValues(c(1,2));'
                },
                'getValue': {
                    description: 'Fetch the value assigned to key (or NULL if no value is assigned)',
                    parameters: {
                        'key': 'Key to look up'
                    },
                    returns: '*',
                    example: 'dict.getValue("key");'
                },
                'identicalContents': {
                    description: 'Returns T if the target contains identical keys and values to x',
                    parameters: {
                        'x': 'Object to compare with'
                    },
                    returns: 'logical',
                    example: 'dict.identicalContents(other);'
                },
                'serialize': {
                    description: 'Returns a string representation',
                    parameters: {
                        'format': 'Format to use ("slim"/"json"/"csv"/"tsv")'
                    },
                    returns: 'string',
                    example: 'dict.serialize("json");'
                },
                'setValue': {
                    description: 'Sets a key-value pair',
                    parameters: {
                        'key': 'Key to set',
                        'value': 'Value to set'
                    },
                    returns: 'void',
                    example: 'dict.setValue("key", value);'
                }
            }
        },

        'DataFrame': {
            description: 'A tabular data structure with named columns',
            extends: 'Dictionary',
            constructor: {
                description: 'Creates a new DataFrame with the same variants as Dictionary()',
                example: 'DataFrame(); // empty\nDataFrame("col1", values1, "col2", values2); // with data'
            },
            properties: {
                'colNames': {
                    description: 'Names of all columns',
                    type: 'string',
                    returns: 'string'
                },
                'dim': {
                    description: 'Dimensions (rows, columns)',
                    type: 'integer',
                    returns: 'integer'
                },
                'ncol': {
                    description: 'Number of columns',
                    type: 'integer',
                    returns: 'integer'
                },
                'nrow': {
                    description: 'Number of rows',
                    type: 'integer',
                    returns: 'integer'
                }
            },
            methods: {
                'asMatrix': {
                    description: 'Returns a matrix representation of the DataFrame',
                    returns: '*',
                    example: 'df.asMatrix();'
                },
                'cbind': {
                    description: 'Adds columns from source and others, increasing width',
                    parameters: {
                        'source': 'Source object to add columns from',
                        '...': 'Additional sources'
                    },
                    returns: 'void',
                    example: 'df.cbind(other);'
                },
                'rbind': {
                    description: 'Adds rows from source and others, increasing height',
                    parameters: {
                        'source': 'Source object to add rows from',
                        '...': 'Additional sources'
                    },
                    returns: 'void',
                    example: 'df.rbind(other);'
                },
                'subset': {
                    description: 'Returns selected elements, as a DataFrame or vector',
                    parameters: {
                        'rows': '(optional) Row indices to select',
                        'cols': '(optional) Column indices/names to select'
                    },
                    returns: '*',
                    example: 'df.subset(1:5, c("col1", "col2"));'
                },
                'subsetColumns': {
                    description: 'Returns selected columns',
                    parameters: {
                        'index': 'Column indices/names to select'
                    },
                    returns: 'DataFrame',
                    example: 'df.subsetColumns(c("col1", "col2"));'
                },
                'subsetRows': {
                    description: 'Returns selected rows',
                    parameters: {
                        'index': 'Row indices to select',
                        'drop': '(optional) Whether to drop single-dimension results (default: F)'
                    },
                    returns: 'DataFrame',
                    example: 'df.subsetRows(1:5);'
                }
            }
        },

        'Image': {
            description: 'An image object that can read/write PNG files',
            extends: 'Dictionary',
            constructor: {
                description: 'Creates a new Image object from a PNG file',
                parameters: [
                    {
                        name: 'filePath',
                        description: 'Path to PNG file',
                        type: 'string',
                        required: true
                    }
                ],
                example: 'Image("image.png")'
            },
            properties: {
                'width': {
                    description: 'Width of the image in pixels',
                    type: 'integer',
                    returns: 'integer'
                },
                'height': {
                    description: 'Height of the image in pixels',
                    type: 'integer',
                    returns: 'integer'
                },
                'isGrayscale': {
                    description: 'T if grayscale, F if RGB',
                    type: 'logical',
                    returns: 'logical'
                },
                'bitsPerChannel': {
                    description: 'Number of bits per channel (R/G/B/K)',
                    type: 'integer',
                    returns: 'integer'
                },
                'integerR': {
                    description: 'Red channel as 2D integer matrix',
                    type: 'integer',
                    returns: 'integer'
                },
                'integerG': {
                    description: 'Green channel as 2D integer matrix',
                    type: 'integer',
                    returns: 'integer'
                },
                'integerB': {
                    description: 'Blue channel as 2D integer matrix',
                    type: 'integer',
                    returns: 'integer'
                },
                'integerK': {
                    description: 'Black channel as 2D integer matrix',
                    type: 'integer',
                    returns: 'integer'
                },
                'floatR': {
                    description: 'Red channel as 2D float matrix',
                    type: 'float',
                    returns: 'float'
                },
                'floatG': {
                    description: 'Green channel as 2D float matrix',
                    type: 'float',
                    returns: 'float'
                },
                'floatB': {
                    description: 'Blue channel as 2D float matrix',
                    type: 'float',
                    returns: 'float'
                },
                'floatK': {
                    description: 'Black channel as 2D float matrix',
                    type: 'float',
                    returns: 'float'
                }
            },
            methods: {
                'write': {
                    description: 'Write PNG data for the image to file',
                    parameters: {
                        'filePath': 'Path to write PNG file to'
                    },
                    returns: 'void',
                    example: 'img.write("output.png");'
                }
            }
        }, 

        // ==========================================
        // 1. SLiM Objects
        // ==========================================
        
        'Species': {
            description: 'Represents a species in the simulation',
            extends: 'Dictionary',
            constructor: {
                description: 'Create a new Species',
                example: 'Species();'
            },
            properties: {
                'avatar': {
                    description: 'Symbol used to represent the species',
                    type: 'string',
                    returns: 'string'
                },
                'chromosome': {
                    description: 'Chromosome object for the species',
                    type: 'object<Chromosome>',
                    returns: 'object<Chromosome>'
                },
                'chromosomeType': {
                    description: 'Type of chromosome ("A"/"X"/"Y")',
                    type: 'string',
                    returns: 'string'
                },
                'color': {
                    description: 'Color used to represent the species',
                    type: 'string',
                    returns: 'string'
                },
                'cycle': {
                    description: 'Current generation cycle number',
                    type: 'integer',
                    returns: 'integer'
                },
                'description': {
                    description: 'Description of the species',
                    type: 'string',
                    returns: 'string'
                },
                'dimensionality': {
                    description: 'Spatial dimensions ("x"/"xy"/"xyz")',
                    type: 'string',
                    returns: 'string'
                },
                'genomicElementTypes': {
                    description: 'All genomic element types defined',
                    type: 'object<GEType>',
                    returns: 'object<GEType>'
                },
                'id': {
                    description: 'Unique identifier for the species',
                    type: 'integer',
                    returns: 'integer'
                },
                'mutationTypes': {
                    description: 'All mutation types defined',
                    type: 'object<MutType>',
                    returns: 'object<MutType>'
                },
                'mutations': {
                    description: 'All mutations in the simulation',
                    type: 'object<Mut>',
                    returns: 'object<Mut>'
                },
                'name': {
                    description: 'Name of the species',
                    type: 'string',
                    returns: 'string'
                },
                'nucleotideBased': {
                    description: 'Whether this is a nucleotide-based model',
                    type: 'logical',
                    returns: 'logical'
                },
                'periodicity': {
                    description: 'Spatial boundaries periodicity',
                    type: 'string',
                    returns: 'string'
                },
                'scriptBlocks': {
                    description: 'All script blocks defined',
                    type: 'object<SEBlock>',
                    returns: 'object<SEBlock>'
                },
                'sexEnabled': {
                    description: 'Whether sexual reproduction is enabled',
                    type: 'logical',
                    returns: 'logical'
                },
                'subpopulations': {
                    description: 'All subpopulations in the simulation',
                    type: 'object<Subpop>',
                    returns: 'object<Subpop>'
                },
                'substitutions': {
                    description: 'All fixed substitutions',
                    type: 'object<Substitution>',
                    returns: 'object<Substitution>'
                },
                'tag': {
                    description: 'User-defined tag value',
                    type: 'integer',
                    returns: 'integer'
                }
            },
            methods: {
                'addSubpop': {
                    description: 'Add a new subpopulation',
                    parameters: {
                        'subpopID': 'Identifier for the new subpopulation',
                        'size': 'Initial size of the subpopulation',
                        'sexRatio': '(optional) Sex ratio for the subpopulation',
                        'haploid': '(optional) Whether the subpopulation is haploid'
                    },
                    returns: 'object<Subpop>',
                    example: 'sim.addSubpop("p1", 100);'
                },
                'addSubpopSplit': {
                    description: 'Add a new subpopulation split from an existing one (WF model only)',
                    parameters: {
                        'subpopID': 'Identifier for the new subpopulation',
                        'size': 'Initial size of the subpopulation',
                        'sourceSubpop': 'Source subpopulation to split from',
                        'sexRatio': '(optional) Sex ratio for the subpopulation'
                    },
                    returns: 'object<Subpop>',
                    example: 'sim.addSubpopSplit("p2", 50, p1);'
                },
                'countOfMutationsOfType': {
                    description: 'Count mutations of a given type',
                    parameters: {
                        'mutType': 'Mutation type to count'
                    },
                    returns: 'integer',
                    example: 'sim.countOfMutationsOfType(m1);'
                },
                'individualsWithPedigreeIDs': {
                    description: 'Get individuals with given pedigree IDs',
                    parameters: {
                        'pedigreeIDs': 'Vector of pedigree IDs to look up',
                        'subpops': '(optional) Subpopulations to search in'
                    },
                    returns: 'object<Individual>',
                    example: 'sim.individualsWithPedigreeIDs(c(1,2,3));'
                },
                'killIndividuals': {
                    description: 'Remove individuals from the simulation (nonWF model only)',
                    parameters: {
                        'individuals': 'Individuals to remove'
                    },
                    returns: 'void',
                    example: 'sim.killIndividuals(individuals);'
                },
                'mutationCounts': {
                    description: 'Count occurrences of mutations',
                    parameters: {
                        'subpops': 'Subpopulations to count in',
                        'mutations': '(optional) Mutations to count'
                    },
                    returns: 'integer',
                    example: 'sim.mutationCounts(p1);'
                },
                'mutationFrequencies': {
                    description: 'Calculate frequencies of mutations',
                    parameters: {
                        'subpops': 'Subpopulations to calculate in',
                        'mutations': '(optional) Mutations to calculate frequencies for'
                    },
                    returns: 'float',
                    example: 'sim.mutationFrequencies(p1);'
                },
                'mutationsOfType': {
                    description: 'Get all mutations of a given type',
                    parameters: {
                        'mutType': 'Mutation type to get'
                    },
                    returns: 'object<Mut>',
                    example: 'sim.mutationsOfType(m1);'
                },
                'outputFixedMutations': {
                    description: 'Output fixed mutations to a file',
                    parameters: {
                        'filePath': '(optional) Path to output file',
                        'append': '(optional) Whether to append to existing file'
                    },
                    returns: 'void',
                    example: 'sim.outputFixedMutations("fixed.txt");'
                },
                'outputFull': {
                    description: 'Output complete state of the simulation',
                    parameters: {
                        'filePath': '(optional) Path to output file',
                        'binary': '(optional) Whether to use binary format',
                        'append': '(optional) Whether to append to existing file',
                        'spatialPositions': '(optional) Include spatial positions',
                        'ages': '(optional) Include ages',
                        'ancestralNucleotides': '(optional) Include ancestral nucleotides',
                        'pedigreeIDs': '(optional) Include pedigree IDs'
                    },
                    returns: 'void',
                    example: 'sim.outputFull("snapshot.txt");'
                },
                'outputMutations': {
                    description: 'Output specified mutations to a file',
                    parameters: {
                        'mutations': 'Mutations to output',
                        'filePath': '(optional) Path to output file',
                        'append': '(optional) Whether to append to existing file'
                    },
                    returns: 'void',
                    example: 'sim.outputMutations(mutations, "muts.txt");'
                },
                'readFromPopulationFile': {
                    description: 'Read population state from a file',
                    parameters: {
                        'filePath': 'Path to input file',
                        'subpopMap': '(optional) Mapping of subpopulation IDs'
                    },
                    returns: 'integer',
                    example: 'sim.readFromPopulationFile("pop.txt");'
                },
                'recalculateFitness': {
                    description: 'Force recalculation of fitness values',
                    parameters: {
                        'tick': '(optional) Generation tick to recalculate for'
                    },
                    returns: 'void',
                    example: 'sim.recalculateFitness();'
                },
                'simulationFinished': {
                    description: 'End the simulation',
                    returns: 'void',
                    example: 'sim.simulationFinished();'
                },
                'skipTick': {
                    description: 'Skip the current generation tick',
                    returns: 'void',
                    example: 'sim.skipTick();'
                },
                'subsetMutations': {
                    description: 'Get a subset of mutations matching criteria',
                    parameters: {
                        'exclude': '(optional) Mutations to exclude',
                        'mutType': '(optional) Mutation type to filter by',
                        'position': '(optional) Position to filter by',
                        'nucleotide': '(optional) Nucleotide to filter by',
                        'tag': '(optional) Tag value to filter by',
                        'id': '(optional) ID to filter by'
                    },
                    returns: 'object<Mut>',
                    example: 'sim.subsetMutations(mutType=m1);'
                },
                'treeSeqCoalesced': {
                    description: 'Check if tree sequence has coalesced',
                    returns: 'logical',
                    example: 'sim.treeSeqCoalesced();'
                },
                'treeSeqOutput': {
                    description: 'Output tree sequence to a file',
                    parameters: {
                        'path': 'Path to output file',
                        'simplify': '(optional) Whether to simplify before output',
                        'includeModel': '(optional) Whether to include model information',
                        'metadata': '(optional) Additional metadata to include'
                    },
                    returns: 'void',
                    example: 'sim.treeSeqOutput("trees.trees");'
                },
                'treeSeqRememberIndividuals': {
                    description: 'Mark individuals for preservation in tree sequence',
                    parameters: {
                        'individuals': 'Individuals to remember',
                        'permanent': '(optional) Whether to remember permanently'
                    },
                    returns: 'void',
                    example: 'sim.treeSeqRememberIndividuals(individuals);'
                },
                'treeSeqSimplify': {
                    description: 'Simplify the tree sequence',
                    returns: 'void',
                    example: 'sim.treeSeqSimplify();'
                }
            }
        },

        'GenomicElement': {
            description: 'Represents a genomic element in the simulation',
            extends: 'Object',
            constructor: {
                description: 'Create a new GenomicElement',
                example: 'GenomicElement();'
            },
            properties: {
                'endPosition': {
                    description: 'End position of the genomic element',
                    type: 'integer',
                    returns: 'integer'
                },
                'genomicElementType': {
                    description: 'Type of the genomic element',
                    type: 'object<GEType>',
                    returns: 'object<GEType>'
                },
                'startPosition': {
                    description: 'Start position of the genomic element',
                    type: 'integer',
                    returns: 'integer'
                },
                'tag': {
                    description: 'User-defined tag value',
                    type: 'integer',
                    returns: 'integer'
                }
            },
            methods: {
                'setGenomicElementType': {
                    description: 'Set the type of this genomic element',
                    parameters: {
                        'genomicElementType': 'New genomic element type'
                    },
                    returns: 'void',
                    example: 'genomicElement.setGenomicElementType(g1);'
                }
            }
        },

        'Subpopulation': {
            description: 'Represents a subpopulation in the simulation',
            extends: 'Dictionary',
            constructor: {
                description: 'Create a new Subpopulation',
                example: 'Subpopulation();'
            },
            properties: {
                'cloningRate': {
                    description: 'Rate of clonal reproduction (WF model only)',
                    type: 'float',
                    returns: 'float'
                },
                'description': {
                    description: 'Description of the subpopulation',
                    type: 'string',
                    returns: 'string'
                },
                'firstMaleIndex': {
                    description: 'Index of first male in the subpopulation',
                    type: 'integer',
                    returns: 'integer'
                },
                'fitnessScaling': {
                    description: 'Fitness scaling factor',
                    type: 'float',
                    returns: 'float'
                },
                'genomes': {
                    description: 'All genomes in the subpopulation',
                    type: 'object<Genome>',
                    returns: 'object<Genome>'
                },
                'genomesNonNull': {
                    description: 'All non-null genomes in the subpopulation',
                    type: 'object<Genome>',
                    returns: 'object<Genome>'
                },
                'id': {
                    description: 'Unique identifier for the subpopulation',
                    type: 'integer',
                    returns: 'integer'
                },
                'immigrantSubpopFractions': {
                    description: 'Immigration rates from source subpopulations (WF model only)',
                    type: 'float',
                    returns: 'float'
                },
                'immigrantSubpopIDs': {
                    description: 'IDs of source subpopulations for immigration (WF model only)',
                    type: 'integer',
                    returns: 'integer'
                },
                'individualCount': {
                    description: 'Number of individuals in the subpopulation',
                    type: 'integer',
                    returns: 'integer'
                },
                'individuals': {
                    description: 'All individuals in the subpopulation',
                    type: 'object<Individual>',
                    returns: 'object<Individual>'
                },
                'lifetimeReproductiveOutput': {
                    description: 'Total number of offspring produced',
                    type: 'integer',
                    returns: 'integer'
                },
                'lifetimeReproductiveOutputF': {
                    description: 'Number of offspring produced by females',
                    type: 'integer',
                    returns: 'integer'
                },
                'lifetimeReproductiveOutputM': {
                    description: 'Number of offspring produced by males',
                    type: 'integer',
                    returns: 'integer'
                },
                'name': {
                    description: 'Name of the subpopulation',
                    type: 'string',
                    returns: 'string'
                },
                'selfingRate': {
                    description: 'Rate of self-fertilization (WF model only)',
                    type: 'float',
                    returns: 'float'
                },
                'sexRatio': {
                    description: 'Proportion of males in the subpopulation (WF model only)',
                    type: 'float',
                    returns: 'float'
                },
                'spatialBounds': {
                    description: 'Spatial boundaries of the subpopulation',
                    type: 'float',
                    returns: 'float'
                },
                'spatialMaps': {
                    description: 'Spatial maps defined for the subpopulation',
                    type: 'object<SpatialMap>',
                    returns: 'object<SpatialMap>'
                },
                'species': {
                    description: 'Species this subpopulation belongs to',
                    type: 'object<Species>',
                    returns: 'object<Species>'
                },
                'tag': {
                    description: 'User-defined tag value',
                    type: 'integer',
                    returns: 'integer'
                }
            },
            methods: {
                'addCloned': {
                    description: 'Add cloned offspring (nonWF model only)',
                    parameters: {
                        'parent': 'Parent individual to clone',
                        'count': '(optional) Number of clones to create',
                        'defer': '(optional) Whether to defer fitness calculation'
                    },
                    returns: 'object<Individual>',
                    example: 'subpop.addCloned(parent, 1);'
                },
                'addCrossed': {
                    description: 'Add offspring from two parents (nonWF model only)',
                    parameters: {
                        'parent1': 'First parent',
                        'parent2': 'Second parent',
                        'sex': '(optional) Sex of offspring',
                        'count': '(optional) Number of offspring',
                        'defer': '(optional) Whether to defer fitness calculation'
                    },
                    returns: 'object<Individual>',
                    example: 'subpop.addCrossed(parent1, parent2);'
                },
                'addEmpty': {
                    description: 'Add empty individuals (nonWF model only)',
                    parameters: {
                        'sex': '(optional) Sex of individuals',
                        'genome1Null': '(optional) Whether first genome is null',
                        'genome2Null': '(optional) Whether second genome is null',
                        'count': '(optional) Number of individuals'
                    },
                    returns: 'object<Individual>',
                    example: 'subpop.addEmpty("M", F, F, 10);'
                },
                'addRecombinant': {
                    description: 'Add recombinant offspring (nonWF model only)',
                    parameters: {
                        'strand1': 'First strand for first genome',
                        'strand2': 'Second strand for first genome',
                        'breaks1': 'Breakpoints for first genome',
                        'strand3': 'First strand for second genome',
                        'strand4': 'Second strand for second genome',
                        'breaks2': 'Breakpoints for second genome',
                        'sex': '(optional) Sex of offspring',
                        'parent1': '(optional) First parent',
                        'parent2': '(optional) Second parent',
                        'randomizeStrands': '(optional) Whether to randomize strand inheritance',
                        'count': '(optional) Number of offspring',
                        'defer': '(optional) Whether to defer fitness calculation'
                    },
                    returns: 'object<Individual>',
                    example: 'subpop.addRecombinant(s1, s2, b1, s3, s4, b2);'
                },
                'addSelfed': {
                    description: 'Add self-fertilized offspring (nonWF model only)',
                    parameters: {
                        'parent': 'Parent individual',
                        'count': '(optional) Number of offspring',
                        'defer': '(optional) Whether to defer fitness calculation'
                    },
                    returns: 'object<Individual>',
                    example: 'subpop.addSelfed(parent, 1);'
                },
                'addSpatialMap': {
                    description: 'Add a spatial map to the subpopulation',
                    parameters: {
                        'map': 'Spatial map to add'
                    },
                    returns: 'void',
                    example: 'subpop.addSpatialMap(map);'
                },
                'cachedFitness': {
                    description: 'Get cached fitness values',
                    parameters: {
                        'indices': 'Individual indices'
                    },
                    returns: 'float',
                    example: 'subpop.cachedFitness(0:9);'
                },
                'configureDisplay': {
                    description: 'Configure display properties',
                    parameters: {
                        'center': '(optional) Display center',
                        'scale': '(optional) Display scale',
                        'color': '(optional) Display color'
                    },
                    returns: 'void',
                    example: 'subpop.configureDisplay(c(0,0), 1.0, "red");'
                },
                'defineSpatialMap': {
                    description: 'Define a new spatial map',
                    parameters: {
                        'name': 'Name of the map',
                        'spatiality': 'Spatial dimensions',
                        'values': 'Map values',
                        'interpolate': '(optional) Whether to interpolate values',
                        'valueRange': '(optional) Range of values',
                        'colors': '(optional) Colors for visualization'
                    },
                    returns: 'object<SpatialMap>',
                    example: 'subpop.defineSpatialMap("map1", "xy", values);'
                },
                'deviatePositions': {
                    description: 'Deviate spatial positions of individuals',
                    parameters: {
                        'individuals': 'Individuals to move',
                        'boundary': 'Boundary condition',
                        'maxDistance': 'Maximum distance to move',
                        'functionType': 'Type of deviation function',
                        '...': 'Additional function parameters'
                    },
                    returns: 'float',
                    example: 'subpop.deviatePositions(inds, "P", 1.0, "n");'
                },
                'outputMSSample': {
                    description: 'Output MS-format sample',
                    parameters: {
                        'sampleSize': 'Number of individuals to sample',
                        'replace': '(optional) Sample with replacement',
                        'requestedSex': '(optional) Sex to sample',
                        'filePath': '(optional) Output file path',
                        'append': '(optional) Append to existing file',
                        'filterMonomorphic': '(optional) Filter monomorphic sites'
                    },
                    returns: 'void',
                    example: 'subpop.outputMSSample(10);'
                },
                'outputSample': {
                    description: 'Output sample of individuals',
                    parameters: {
                        'sampleSize': 'Number of individuals to sample',
                        'replace': '(optional) Sample with replacement',
                        'requestedSex': '(optional) Sex to sample',
                        'filePath': '(optional) Output file path',
                        'append': '(optional) Append to existing file'
                    },
                    returns: 'void',
                    example: 'subpop.outputSample(10);'
                },
                'outputVCFSample': {
                    description: 'Output VCF-format sample',
                    parameters: {
                        'sampleSize': 'Number of individuals to sample',
                        'replace': '(optional) Sample with replacement',
                        'requestedSex': '(optional) Sex to sample',
                        'outputMultiallelics': '(optional) Output multiallelic variants',
                        'filePath': '(optional) Output file path',
                        'append': '(optional) Append to existing file'
                    },
                    returns: 'void',
                    example: 'subpop.outputVCFSample(10);'
                },
                'pointDeviated': {
                    description: 'Calculate deviated spatial position',
                    parameters: {
                        'n': 'Number of points',
                        'point': 'Starting point',
                        'boundary': 'Boundary condition',
                        'maxDistance': 'Maximum distance',
                        'functionType': 'Type of deviation function',
                        '...': 'Additional function parameters'
                    },
                    returns: 'float',
                    example: 'subpop.pointDeviated(1, c(0,0), "P", 1.0, "n");'
                },
                'pointInBounds': {
                    description: 'Test if point is within spatial bounds',
                    parameters: {
                        'point': 'Point to test'
                    },
                    returns: 'logical',
                    example: 'subpop.pointInBounds(c(0,0));'
                },
                'pointPeriodic': {
                    description: 'Apply periodic boundary conditions to point',
                    parameters: {
                        'point': 'Point to transform'
                    },
                    returns: 'float',
                    example: 'subpop.pointPeriodic(c(0,0));'
                },
                'pointReflected': {
                    description: 'Apply reflecting boundary conditions to point',
                    parameters: {
                        'point': 'Point to transform'
                    },
                    returns: 'float',
                    example: 'subpop.pointReflected(c(0,0));'
                },
                'pointStopped': {
                    description: 'Apply stopping boundary conditions to point',
                    parameters: {
                        'point': 'Point to transform'
                    },
                    returns: 'float',
                    example: 'subpop.pointStopped(c(0,0));'
                },
                'pointUniform': {
                    description: 'Generate uniform random points',
                    parameters: {
                        'n': '(optional) Number of points'
                    },
                    returns: 'float',
                    example: 'subpop.pointUniform(10);'
                },
                'removeSpatialMap': {
                    description: 'Remove a spatial map',
                    parameters: {
                        'map': 'Map to remove'
                    },
                    returns: 'void',
                    example: 'subpop.removeSpatialMap(map);'
                },
                'removeSubpopulation': {
                    description: 'Remove this subpopulation (nonWF model only)',
                    returns: 'void',
                    example: 'subpop.removeSubpopulation();'
                },
                'sampleIndividuals': {
                    description: 'Sample individuals matching criteria',
                    parameters: {
                        'size': 'Sample size',
                        'replace': '(optional) Sample with replacement',
                        'exclude': '(optional) Individuals to exclude',
                        'sex': '(optional) Sex to sample',
                        'tag': '(optional) Tag value to match',
                        'minAge': '(optional) Minimum age',
                        'maxAge': '(optional) Maximum age',
                        'migrant': '(optional) Migration status',
                        'tagL0': '(optional) Level 0 tag status',
                        'tagL1': '(optional) Level 1 tag status',
                        'tagL2': '(optional) Level 2 tag status',
                        'tagL3': '(optional) Level 3 tag status',
                        'tagL4': '(optional) Level 4 tag status'
                    },
                    returns: 'void',
                    example: 'subpop.sampleIndividuals(10);'
                },
                'setCloningRate': {
                    description: 'Set cloning rate (WF model only)',
                    parameters: {
                        'rate': 'New cloning rate'
                    },
                    returns: 'void',
                    example: 'subpop.setCloningRate(0.1);'
                },
                'setMigrationRates': {
                    description: 'Set migration rates (WF model only)',
                    parameters: {
                        'sourceSubpops': 'Source subpopulations',
                        'rates': 'Migration rates'
                    },
                    returns: 'void',
                    example: 'subpop.setMigrationRates(p1, 0.1);'
                },
                'setSelfingRate': {
                    description: 'Set selfing rate (WF model only)',
                    parameters: {
                        'rate': 'New selfing rate'
                    },
                    returns: 'void',
                    example: 'subpop.setSelfingRate(0.1);'
                },
                'setSexRatio': {
                    description: 'Set sex ratio (WF model only)',
                    parameters: {
                        'sexRatio': 'New sex ratio'
                    },
                    returns: 'void',
                    example: 'subpop.setSexRatio(0.5);'
                },
                'setSpatialBounds': {
                    description: 'Set spatial boundaries',
                    parameters: {
                        'bounds': 'New boundaries'
                    },
                    returns: 'void',
                    example: 'subpop.setSpatialBounds(c(0,0,10,10));'
                },
                'setSubpopulationSize': {
                    description: 'Set subpopulation size (WF model only)',
                    parameters: {
                        'size': 'New size'
                    },
                    returns: 'void',
                    example: 'subpop.setSubpopulationSize(100);'
                },
                'spatialMapValue': {
                    description: 'Get spatial map value at point',
                    parameters: {
                        'map': 'Spatial map',
                        'point': 'Point to evaluate'
                    },
                    returns: 'float',
                    example: 'subpop.spatialMapValue(map, c(0,0));'
                },
                'subsetIndividuals': {
                    description: 'Get subset of individuals matching criteria',
                    parameters: {
                        'exclude': '(optional) Individuals to exclude',
                        'sex': '(optional) Sex to match',
                        'tag': '(optional) Tag value to match',
                        'minAge': '(optional) Minimum age',
                        'maxAge': '(optional) Maximum age',
                        'migrant': '(optional) Migration status',
                        'tagL0': '(optional) Level 0 tag status',
                        'tagL1': '(optional) Level 1 tag status',
                        'tagL2': '(optional) Level 2 tag status',
                        'tagL3': '(optional) Level 3 tag status',
                        'tagL4': '(optional) Level 4 tag status'
                    },
                    returns: 'object<Individual>',
                    example: 'subpop.subsetIndividuals(sex="M");'
                },
                'takeMigrants': {
                    description: 'Accept migrants into subpopulation (nonWF model only)',
                    parameters: {
                        'migrants': 'Migrant individuals'
                    },
                    returns: 'void',
                    example: 'subpop.takeMigrants(migrants);'
                }
            }
        },

        'Individual': {
            description: 'Represents an individual organism in the simulation',
            extends: 'Dictionary',
            constructor: {
                description: 'Create a new Individual',
                example: 'Individual();'
            },
            properties: {
                'age': {
                    description: 'Age of the individual (nonWF model only)',
                    type: 'integer',
                    returns: 'integer'
                },
                'color': {
                    description: 'Color used to represent the individual',
                    type: 'string',
                    returns: 'string'
                },
                'fitnessScaling': {
                    description: 'Individual fitness scaling factor',
                    type: 'float',
                    returns: 'float'
                },
                'genomes': {
                    description: 'All genomes of the individual',
                    type: 'object<Genome>',
                    returns: 'object<Genome>'
                },
                'genomesNonNull': {
                    description: 'All non-null genomes of the individual',
                    type: 'object<Genome>',
                    returns: 'object<Genome>'
                },
                'genome1': {
                    description: 'First genome of the individual',
                    type: 'object<Genome>',
                    returns: 'object<Genome>'
                },
                'genome2': {
                    description: 'Second genome of the individual',
                    type: 'object<Genome>',
                    returns: 'object<Genome>'
                },
                'index': {
                    description: 'Index of the individual in its subpopulation',
                    type: 'integer',
                    returns: 'integer'
                },
                'migrant': {
                    description: 'Whether the individual is a migrant',
                    type: 'logical',
                    returns: 'logical'
                },
                'pedigreeID': {
                    description: 'Unique pedigree identifier',
                    type: 'integer',
                    returns: 'integer'
                },
                'pedigreeParentIDs': {
                    description: 'Pedigree IDs of parents',
                    type: 'integer',
                    returns: 'integer'
                },
                'pedigreeGrandparentIDs': {
                    description: 'Pedigree IDs of grandparents',
                    type: 'integer',
                    returns: 'integer'
                },
                'reproductiveOutput': {
                    description: 'Number of offspring produced',
                    type: 'integer',
                    returns: 'integer'
                },
                'sex': {
                    description: 'Sex of the individual ("M" or "F")',
                    type: 'string',
                    returns: 'string'
                },
                'spatialPosition': {
                    description: 'Spatial position coordinates',
                    type: 'float',
                    returns: 'float'
                },
                'subpopulation': {
                    description: 'Subpopulation the individual belongs to',
                    type: 'object<Subpop>',
                    returns: 'object<Subpop>'
                },
                'tag': {
                    description: 'User-defined tag value',
                    type: 'integer',
                    returns: 'integer'
                },
                'tagF': {
                    description: 'User-defined float tag value',
                    type: 'float',
                    returns: 'float'
                },
                'tagL0': {
                    description: 'User-defined logical tag (level 0)',
                    type: 'logical',
                    returns: 'logical'
                },
                'tagL1': {
                    description: 'User-defined logical tag (level 1)',
                    type: 'logical',
                    returns: 'logical'
                },
                'tagL2': {
                    description: 'User-defined logical tag (level 2)',
                    type: 'logical',
                    returns: 'logical'
                },
                'tagL3': {
                    description: 'User-defined logical tag (level 3)',
                    type: 'logical',
                    returns: 'logical'
                },
                'tagL4': {
                    description: 'User-defined logical tag (level 4)',
                    type: 'logical',
                    returns: 'logical'
                },
                'uniqueMutations': {
                    description: 'Mutations unique to this individual',
                    type: 'object<Mut>',
                    returns: 'object<Mut>'
                },
                'x': {
                    description: 'X coordinate of spatial position',
                    type: 'float',
                    returns: 'float'
                },
                'y': {
                    description: 'Y coordinate of spatial position',
                    type: 'float',
                    returns: 'float'
                },
                'z': {
                    description: 'Z coordinate of spatial position',
                    type: 'float',
                    returns: 'float'
                },
                'xy': {
                    description: 'XY coordinates of spatial position',
                    type: 'float',
                    returns: 'float'
                },
                'xz': {
                    description: 'XZ coordinates of spatial position',
                    type: 'float',
                    returns: 'float'
                },
                'yz': {
                    description: 'YZ coordinates of spatial position',
                    type: 'float',
                    returns: 'float'
                },
                'xyz': {
                    description: 'XYZ coordinates of spatial position',
                    type: 'float',
                    returns: 'float'
                }
            },
            methods: {
                'containsMutations': {
                    description: 'Test if individual contains specified mutations',
                    parameters: {
                        'mutations': 'Mutations to check for'
                    },
                    returns: 'logical',
                    example: 'individual.containsMutations(muts);'
                },
                'countOfMutationsOfType': {
                    description: 'Count mutations of a given type',
                    parameters: {
                        'mutType': 'Mutation type to count'
                    },
                    returns: 'integer',
                    example: 'individual.countOfMutationsOfType(m1);'
                },
                'relatedness': {
                    description: 'Calculate genetic relatedness with other individuals',
                    parameters: {
                        'individuals': 'Individuals to compare with'
                    },
                    returns: 'float',
                    example: 'individual.relatedness(others);'
                },
                'setSpatialPosition': {
                    description: 'Set spatial position coordinates',
                    parameters: {
                        'position': 'New position coordinates'
                    },
                    returns: 'void',
                    example: 'individual.setSpatialPosition(c(0,0,0));'
                },
                'sharedParentCount': {
                    description: 'Count shared parents with other individuals',
                    parameters: {
                        'individuals': 'Individuals to compare with'
                    },
                    returns: 'integer',
                    example: 'individual.sharedParentCount(others);'
                },
                'sumOfMutationsOfType': {
                    description: 'Sum selection coefficients of mutations of given type',
                    parameters: {
                        'mutType': 'Mutation type to sum'
                    },
                    returns: 'float',
                    example: 'individual.sumOfMutationsOfType(m1);'
                },
                'uniqueMutationsOfType': {
                    description: 'Get unique mutations of given type',
                    parameters: {
                        'mutType': 'Mutation type to filter'
                    },
                    returns: 'object<Mut>',
                    example: 'individual.uniqueMutationsOfType(m1);'
                }
            }
        },

        'Mutation': {
            description: 'Represents a mutation in the simulation',
            extends: 'Dictionary',
            constructor: {
                description: 'Create a new Mutation',
                example: 'Mutation();'
            },
            properties: {
                'id': {
                    description: 'Unique identifier for the mutation',
                    type: 'integer',
                    returns: 'integer'
                },
                'isFixed': {
                    description: 'Whether the mutation is fixed in the population',
                    type: 'logical',
                    returns: 'logical'
                },
                'isSegregating': {
                    description: 'Whether the mutation is segregating in the population',
                    type: 'logical',
                    returns: 'logical'
                },
                'mutationType': {
                    description: 'Type of the mutation',
                    type: 'object<MutType>',
                    returns: 'object<MutType>'
                },
                'nucleotide': {
                    description: 'Nucleotide state (nucleotide-based models only)',
                    type: 'string',
                    returns: 'string'
                },
                'nucleotideValue': {
                    description: 'Numeric value of nucleotide (nucleotide-based models only)',
                    type: 'integer',
                    returns: 'integer'
                },
                'originTick': {
                    description: 'Generation tick when mutation arose',
                    type: 'integer',
                    returns: 'integer'
                },
                'position': {
                    description: 'Position in the genome',
                    type: 'integer',
                    returns: 'integer'
                },
                'selectionCoeff': {
                    description: 'Selection coefficient',
                    type: 'float',
                    returns: 'float'
                },
                'subpopID': {
                    description: 'ID of subpopulation where mutation arose',
                    type: 'integer',
                    returns: 'integer'
                },
                'tag': {
                    description: 'User-defined tag value',
                    type: 'integer',
                    returns: 'integer'
                }
            },
            methods: {
                'setMutationType': {
                    description: 'Change the type of the mutation',
                    parameters: {
                        'mutType': 'New mutation type'
                    },
                    returns: 'void',
                    example: 'mutation.setMutationType(m1);'
                },
                'setSelectionCoeff': {
                    description: 'Set the selection coefficient',
                    parameters: {
                        'selectionCoeff': 'New selection coefficient'
                    },
                    returns: 'void',
                    example: 'mutation.setSelectionCoeff(0.1);'
                }
            }
        },

        'Substitution': {
            description: 'Represents a fixed mutation (substitution) in the simulation',
            extends: 'Dictionary',
            constructor: {
                description: 'Create a new Substitution',
                example: 'Substitution();'
            },
            properties: {
                'id': {
                    description: 'Unique identifier for the substitution',
                    type: 'integer',
                    returns: 'integer'
                },
                'fixationTick': {
                    description: 'Generation tick when mutation became fixed',
                    type: 'integer',
                    returns: 'integer'
                },
                'mutationType': {
                    description: 'Type of the mutation that fixed',
                    type: 'object<MutType>',
                    returns: 'object<MutType>'
                },
                'nucleotide': {
                    description: 'Nucleotide state (nucleotide-based models only)',
                    type: 'string',
                    returns: 'string'
                },
                'nucleotideValue': {
                    description: 'Numeric value of nucleotide (nucleotide-based models only)',
                    type: 'integer',
                    returns: 'integer'
                },
                'originTick': {
                    description: 'Generation tick when original mutation arose',
                    type: 'integer',
                    returns: 'integer'
                },
                'position': {
                    description: 'Position in the genome',
                    type: 'integer',
                    returns: 'integer'
                },
                'selectionCoeff': {
                    description: 'Selection coefficient of the fixed mutation',
                    type: 'float',
                    returns: 'float'
                },
                'subpopID': {
                    description: 'ID of subpopulation where mutation arose',
                    type: 'integer',
                    returns: 'integer'
                },
                'tag': {
                    description: 'User-defined tag value',
                    type: 'integer',
                    returns: 'integer'
                }
            },
            methods: {}  // Add empty methods object since it's required
        },

        'Chromosome': {
            description: 'Represents a chromosome in the simulation',
            extends: 'Dictionary',
            constructor: {
                description: 'Create a new Chromosome',
                example: 'Chromosome();'
            },
            properties: {
                'colorSubstitution': {
                    description: 'Color used for substitutions',
                    type: 'string',
                    returns: 'string'
                },
                'geneConversionEnabled': {
                    description: 'Whether gene conversion is enabled',
                    type: 'logical',
                    returns: 'logical'
                },
                'geneConversionGCBias': {
                    description: 'GC bias parameter for gene conversion',
                    type: 'float',
                    returns: 'float'
                },
                'geneConversionNonCrossoverFraction': {
                    description: 'Fraction of recombination events that are gene conversions',
                    type: 'float',
                    returns: 'float'
                },
                'geneConversionMeanLength': {
                    description: 'Mean length of gene conversion tracts',
                    type: 'float',
                    returns: 'float'
                },
                'geneConversionSimpleConversionFraction': {
                    description: 'Fraction of conversions that are simple',
                    type: 'float',
                    returns: 'float'
                },
                'genomicElements': {
                    description: 'All genomic elements in the chromosome',
                    type: 'object<GElement>',
                    returns: 'object<GElement>'
                },
                'hotspotEndPositionsF': {
                    description: 'End positions of female-specific hotspots (nucleotide-based models only)',
                    type: 'integer',
                    returns: 'integer'
                },
                'hotspotEndPositionsM': {
                    description: 'End positions of male-specific hotspots (nucleotide-based models only)',
                    type: 'integer',
                    returns: 'integer'
                },
                'hotspotMultipliersF': {
                    description: 'Multipliers for female-specific hotspots (nucleotide-based models only)',
                    type: 'float',
                    returns: 'float'
                },
                'hotspotMultipliersM': {
                    description: 'Multipliers for male-specific hotspots (nucleotide-based models only)',
                    type: 'float',
                    returns: 'float'
                },
                'lastPosition': {
                    description: 'Last position in the chromosome',
                    type: 'integer',
                    returns: 'integer'
                },
                'mutationEndPositionsF': {
                    description: 'End positions of female-specific mutation rate regions',
                    type: 'integer',
                    returns: 'integer'
                },
                'mutationEndPositionsM': {
                    description: 'End positions of male-specific mutation rate regions',
                    type: 'integer',
                    returns: 'integer'
                },
                'mutationRatesF': {
                    description: 'Female-specific mutation rates',
                    type: 'float',
                    returns: 'float'
                },
                'mutationRatesM': {
                    description: 'Male-specific mutation rates',
                    type: 'float',
                    returns: 'float'
                },
                'overallMutationRateF': {
                    description: 'Overall female-specific mutation rate',
                    type: 'float',
                    returns: 'float'
                },
                'overallMutationRateM': {
                    description: 'Overall male-specific mutation rate',
                    type: 'float',
                    returns: 'float'
                },
                'overallRecombinationRateF': {
                    description: 'Overall female-specific recombination rate',
                    type: 'float',
                    returns: 'float'
                },
                'overallRecombinationRateM': {
                    description: 'Overall male-specific recombination rate',
                    type: 'float',
                    returns: 'float'
                },
                'recombinationEndPositionsF': {
                    description: 'End positions of female-specific recombination rate regions',
                    type: 'integer',
                    returns: 'integer'
                },
                'recombinationEndPositionsM': {
                    description: 'End positions of male-specific recombination rate regions',
                    type: 'integer',
                    returns: 'integer'
                },
                'recombinationRatesF': {
                    description: 'Female-specific recombination rates',
                    type: 'float',
                    returns: 'float'
                },
                'recombinationRatesM': {
                    description: 'Male-specific recombination rates',
                    type: 'float',
                    returns: 'float'
                },
                'species': {
                    description: 'Species this chromosome belongs to',
                    type: 'object<Species>',
                    returns: 'object<Species>'
                },
                'tag': {
                    description: 'User-defined tag value',
                    type: 'integer',
                    returns: 'integer'
                }
            },
            methods: {
                'ancestralNucleotides': {
                    description: 'Get ancestral nucleotide sequence (nucleotide-based models only)',
                    parameters: {
                        'start': '(optional) Start position',
                        'end': '(optional) End position',
                        'format': '(optional) Output format'
                    },
                    returns: 'string',
                    example: 'chromosome.ancestralNucleotides(0, 100);'
                },
                'drawBreakpoints': {
                    description: 'Draw recombination breakpoints',
                    parameters: {
                        'parent': '(optional) Parent individual',
                        'n': '(optional) Number of breakpoints'
                    },
                    returns: 'integer',
                    example: 'chromosome.drawBreakpoints(parent, 1);'
                },
                'genomicElementForPosition': {
                    description: 'Get genomic element at specified position',
                    parameters: {
                        'positions': 'Position to query'
                    },
                    returns: 'object<GElement>',
                    example: 'chromosome.genomicElementForPosition(100);'
                },
                'hasGenomicElementForPosition': {
                    description: 'Check if position has a genomic element',
                    parameters: {
                        'positions': 'Position to check'
                    },
                    returns: 'logical',
                    example: 'chromosome.hasGenomicElementForPosition(100);'
                },
                'setAncestralNucleotides': {
                    description: 'Set ancestral nucleotide sequence (nucleotide-based models only)',
                    parameters: {
                        'sequence': 'Nucleotide sequence'
                    },
                    returns: 'integer',
                    example: 'chromosome.setAncestralNucleotides("ATCG");'
                },
                'setGeneConversion': {
                    description: 'Configure gene conversion parameters',
                    parameters: {
                        'nonCrossoverFraction': 'Fraction of recombination events that are gene conversions',
                        'meanLength': 'Mean length of gene conversion tract',
                        'simpleConversionFraction': 'Fraction of conversions that are simple',
                        'bias': '(optional) GC bias parameter'
                    },
                    returns: 'void',
                    example: 'chromosome.setGeneConversion(0.1, 100.0, 0.5);'
                },
                'setHotspotMap': {
                    description: 'Set recombination hotspot map (nucleotide-based models only)',
                    parameters: {
                        'multipliers': 'Hotspot multiplier values',
                        'ends': '(optional) End positions for regions',
                        'sex': '(optional) Sex-specificity ("M"/"F")'
                    },
                    returns: 'void',
                    example: 'chromosome.setHotspotMap(c(1.0, 5.0, 1.0), c(1000, 2000));'
                },
                'setMutationRate': {
                    description: 'Set mutation rate(s)',
                    parameters: {
                        'rates': 'Mutation rate values',
                        'ends': '(optional) End positions for regions',
                        'sex': '(optional) Sex-specificity ("M"/"F")'
                    },
                    returns: 'void',
                    example: 'chromosome.setMutationRate(1e-7);'
                },
                'setRecombinationRate': {
                    description: 'Set recombination rate(s)',
                    parameters: {
                        'rates': 'Recombination rate values',
                        'ends': '(optional) End positions for regions',
                        'sex': '(optional) Sex-specificity ("M"/"F")'
                    },
                    returns: 'void',
                    example: 'chromosome.setRecombinationRate(1e-8);'
                }
            }
        },

        'MutationType': {
            description: 'Represents a type of mutation in the simulation',
            extends: 'Dictionary',
            constructor: {
                description: 'Create a new MutationType',
                example: 'MutationType();'
            },
            properties: {
                'color': {
                    description: 'Color used to represent mutations of this type',
                    type: 'string',
                    returns: 'string'
                },
                'colorSubstitution': {
                    description: 'Color used for fixed substitutions of this type',
                    type: 'string',
                    returns: 'string'
                },
                'convertToSubstitution': {
                    description: 'Whether to convert fixed mutations to substitutions',
                    type: 'logical',
                    returns: 'logical'
                },
                'distributionParams': {
                    description: 'Parameters for the selection coefficient distribution',
                    type: 'float',
                    returns: 'float'
                },
                'distributionType': {
                    description: 'Type of selection coefficient distribution',
                    type: 'string',
                    returns: 'string'
                },
                'dominanceCoeff': {
                    description: 'Dominance coefficient for mutations of this type',
                    type: 'float',
                    returns: 'float'
                },
                'id': {
                    description: 'Unique identifier for the mutation type',
                    type: 'integer',
                    returns: 'integer'
                },
                'mutationStackGroup': {
                    description: 'Stack group for mutation stacking',
                    type: 'integer',
                    returns: 'integer'
                },
                'mutationStackPolicy': {
                    description: 'Policy for mutation stacking',
                    type: 'string',
                    returns: 'string'
                },
                'nucleotideBased': {
                    description: 'Whether this is a nucleotide-based mutation type (nucleotide-based models only)',
                    type: 'logical',
                    returns: 'logical'
                },
                'species': {
                    description: 'Species this mutation type belongs to',
                    type: 'object<Species>',
                    returns: 'object<Species>'
                },
                'tag': {
                    description: 'User-defined tag value',
                    type: 'integer',
                    returns: 'integer'
                }
            },
            methods: {
                'drawSelectionCoefficient': {
                    description: 'Draw selection coefficients from the distribution',
                    parameters: {
                        'n': 'Number of coefficients to draw'
                    },
                    returns: 'float',
                    example: 'mutType.drawSelectionCoefficient(1);'
                },
                'setDistribution': {
                    description: 'Set the selection coefficient distribution',
                    parameters: {
                        'distType': 'Distribution type',
                        '...': 'Distribution parameters'
                    },
                    returns: 'void',
                    example: 'mutType.setDistribution("f", 0.0);'
                }
            }
        },

        'Genome': {
            description: 'Represents a genome (chromosome copy) in the simulation',
            extends: 'Object',
            constructor: {
                description: 'Create a new Genome',
                example: 'Genome();'
            },
            properties: {
                'genomePedigreeID': {
                    description: 'Unique pedigree identifier for the genome',
                    type: 'integer',
                    returns: 'integer'
                },
                'genomeType': {
                    description: 'Type of genome ("A"/"X"/"Y")',
                    type: 'string',
                    returns: 'string'
                },
                'individual': {
                    description: 'Individual this genome belongs to',
                    type: 'object<Individual>',
                    returns: 'object<Individual>'
                },
                'isNullGenome': {
                    description: 'Whether this is a null genome',
                    type: 'logical',
                    returns: 'logical'
                },
                'mutations': {
                    description: 'All mutations in this genome',
                    type: 'object<Mut>',
                    returns: 'object<Mut>'
                },
                'tag': {
                    description: 'User-defined tag value',
                    type: 'integer',
                    returns: 'integer'
                }
            },
            methods: {
                'addMutations': {
                    description: 'Add mutations to the genome',
                    parameters: {
                        'mutations': 'Mutations to add'
                    },
                    returns: 'void',
                    example: 'genome.addMutations(muts);'
                },
                'addNewDrawnMutation': {
                    description: 'Add a new mutation with drawn selection coefficient',
                    parameters: {
                        'mutationType': 'Type of mutation to add',
                        'position': 'Position for the mutation',
                        'originSubpop': '(optional) Subpopulation of origin',
                        'nucleotide': '(optional) Nucleotide state (nucleotide-based models only)'
                    },
                    returns: 'object<Mut>',
                    example: 'genome.addNewDrawnMutation(m1, 100);'
                },
                'addNewMutation': {
                    description: 'Add a new mutation with specified selection coefficient',
                    parameters: {
                        'mutationType': 'Type of mutation to add',
                        'selectionCoeff': 'Selection coefficient',
                        'position': 'Position for the mutation',
                        'originSubpop': '(optional) Subpopulation of origin',
                        'nucleotide': '(optional) Nucleotide state (nucleotide-based models only)'
                    },
                    returns: 'object<Mut>',
                    example: 'genome.addNewMutation(m1, 0.1, 100);'
                },
                'containsMarkerMutation': {
                    description: 'Test for presence of marker mutation',
                    parameters: {
                        'mutType': 'Mutation type to check',
                        'position': 'Position to check',
                        'returnMutation': '(optional) Whether to return mutation instead of logical'
                    },
                    returns: 'logical',
                    example: 'genome.containsMarkerMutation(m1, 100);'
                },
                'containsMutations': {
                    description: 'Test if genome contains specified mutations',
                    parameters: {
                        'mutations': 'Mutations to check for'
                    },
                    returns: 'logical',
                    example: 'genome.containsMutations(muts);'
                },
                'countOfMutationsOfType': {
                    description: 'Count mutations of a given type',
                    parameters: {
                        'mutType': 'Mutation type to count'
                    },
                    returns: 'integer',
                    example: 'genome.countOfMutationsOfType(m1);'
                },
                'mutationCountsInGenomes': {
                    description: 'Count occurrences of mutations across genomes',
                    parameters: {
                        'mutations': 'Mutations to count'
                    },
                    returns: 'integer',
                    example: 'genome.mutationCountsInGenomes(muts);'
                },
                'mutationFrequenciesInGenomes': {
                    description: 'Calculate frequencies of mutations across genomes',
                    parameters: {
                        'mutations': 'Mutations to calculate frequencies for'
                    },
                    returns: 'float',
                    example: 'genome.mutationFrequenciesInGenomes(muts);'
                },
                'mutationsOfType': {
                    description: 'Get all mutations of a given type',
                    parameters: {
                        'mutType': 'Mutation type to get'
                    },
                    returns: 'object<Mut>',
                    example: 'genome.mutationsOfType(m1);'
                },
                'nucleotides': {
                    description: 'Get nucleotide sequence',
                    parameters: {
                        'start': '(optional) Start position',
                        'end': '(optional) End position',
                        'format': '(optional) Output format'
                    },
                    returns: 'string',
                    example: 'genome.nucleotides(0, 100);'
                },
                'output': {
                    description: 'Output genome to a file',
                    parameters: {
                        'filePath': '(optional) Path to output file',
                        'append': '(optional) Whether to append to existing file'
                    },
                    returns: 'void',
                    example: 'genome.output("genome.txt");'
                },
                'outputMS': {
                    description: 'Output genome in MS format',
                    parameters: {
                        'filePath': '(optional) Path to output file',
                        'append': '(optional) Whether to append to existing file',
                        'filterMonomorphic': '(optional) Whether to filter monomorphic sites'
                    },
                    returns: 'void',
                    example: 'genome.outputMS("genome.ms");'
                },
                'outputVCF': {
                    description: 'Output genome in VCF format',
                    parameters: {
                        'filePath': '(optional) Path to output file',
                        'outputMultiallelics': '(optional) Whether to output multiallelic variants',
                        'append': '(optional) Whether to append to existing file'
                    },
                    returns: 'void',
                    example: 'genome.outputVCF("genome.vcf");'
                },
                'positionsOfMutationsOfType': {
                    description: 'Get positions of mutations of given type',
                    parameters: {
                        'mutType': 'Mutation type to get positions for'
                    },
                    returns: 'integer',
                    example: 'genome.positionsOfMutationsOfType(m1);'
                },
                'readFromMS': {
                    description: 'Read mutations from MS-format file',
                    parameters: {
                        'filePath': 'Path to MS file',
                        'mutationType': 'Type for new mutations'
                    },
                    returns: 'object<Mut>',
                    example: 'genome.readFromMS("input.ms", m1);'
                },
                'readFromVCF': {
                    description: 'Read mutations from VCF file',
                    parameters: {
                        'filePath': 'Path to VCF file',
                        'mutationType': '(optional) Type for new mutations'
                    },
                    returns: 'object<Mut>',
                    example: 'genome.readFromVCF("input.vcf", m1);'
                },
                'removeMutations': {
                    description: 'Remove mutations from the genome',
                    parameters: {
                        'mutations': '(optional) Mutations to remove',
                        'substitute': '(optional) Whether to substitute removed mutations'
                    },
                    returns: 'void',
                    example: 'genome.removeMutations(muts);'
                },
                'sumOfMutationsOfType': {
                    description: 'Sum selection coefficients of mutations of given type',
                    parameters: {
                        'mutType': 'Mutation type to sum'
                    },
                    returns: 'float',
                    example: 'genome.sumOfMutationsOfType(m1);'
                }
            }
        },

        'InteractionType': {
            description: 'Represents a type of spatial interaction between individuals',
            extends: 'Dictionary',
            constructor: {
                description: 'Create a new InteractionType',
                example: 'InteractionType();'
            },
            properties: {
                'id': {
                    description: 'Unique identifier for the interaction type',
                    type: 'integer',
                    returns: 'integer'
                },
                'maxDistance': {
                    description: 'Maximum interaction distance',
                    type: 'float',
                    returns: 'float'
                },
                'reciprocal': {
                    description: 'Whether interaction is reciprocal',
                    type: 'logical',
                    returns: 'logical'
                },
                'sexSegregation': {
                    description: 'Sex-based segregation of interactions',
                    type: 'string',
                    returns: 'string'
                },
                'spatiality': {
                    description: 'Spatial dimensions of interaction ("x"/"xy"/"xyz")',
                    type: 'string',
                    returns: 'string'
                },
                'tag': {
                    description: 'User-defined tag value',
                    type: 'integer',
                    returns: 'integer'
                }
            },
            methods: {
                'clippedIntegral': {
                    description: 'Calculate clipped integral over individuals',
                    parameters: {
                        'individuals': 'Individuals to integrate over'
                    },
                    returns: 'float',
                    example: 'intType.clippedIntegral(inds);'
                },
                'distance': {
                    description: 'Calculate distance between individuals',
                    parameters: {
                        'receiver': 'Receiving individual',
                        'exerters': '(optional) Exerting individuals'
                    },
                    returns: 'float',
                    example: 'intType.distance(ind1, ind2);'
                },
                'distanceFromPoint': {
                    description: 'Calculate distance from point to individuals',
                    parameters: {
                        'point': 'Reference point',
                        'exerters': 'Individuals to measure to'
                    },
                    returns: 'float',
                    example: 'intType.distanceFromPoint(c(0,0), inds);'
                },
                'drawByStrength': {
                    description: 'Draw individuals weighted by interaction strength',
                    parameters: {
                        'receiver': 'Receiving individual',
                        'count': '(optional) Number to draw',
                        'exerterSubpop': '(optional) Subpopulation to draw from',
                        'returnDict': '(optional) Return as Dictionary'
                    },
                    returns: 'object',
                    example: 'intType.drawByStrength(ind, 5);'
                },
                'evaluate': {
                    description: 'Evaluate interactions for subpopulations',
                    parameters: {
                        'subpops': 'Subpopulations to evaluate'
                    },
                    returns: 'void',
                    example: 'intType.evaluate(p1);'
                },
                'interactingNeighborCount': {
                    description: 'Count interacting neighbors',
                    parameters: {
                        'receivers': 'Receiving individuals',
                        'exerterSubpop': '(optional) Subpopulation of exerters'
                    },
                    returns: 'integer',
                    example: 'intType.interactingNeighborCount(inds);'
                },
                'interactionDistance': {
                    description: 'Calculate interaction-specific distance',
                    parameters: {
                        'receiver': 'Receiving individual',
                        'exerters': '(optional) Exerting individuals'
                    },
                    returns: 'float',
                    example: 'intType.interactionDistance(ind1, ind2);'
                },
                'localPopulationDensity': {
                    description: 'Calculate local population density',
                    parameters: {
                        'receivers': 'Focal individuals',
                        'exerterSubpop': '(optional) Subpopulation to consider'
                    },
                    returns: 'float',
                    example: 'intType.localPopulationDensity(inds);'
                },
                'nearestInteractingNeighbors': {
                    description: 'Find nearest interacting neighbors',
                    parameters: {
                        'receiver': 'Receiving individual',
                        'count': '(optional) Number of neighbors',
                        'exerterSubpop': '(optional) Subpopulation to search',
                        'returnDict': '(optional) Return as Dictionary'
                    },
                    returns: 'object',
                    example: 'intType.nearestInteractingNeighbors(ind, 5);'
                },
                'nearestNeighbors': {
                    description: 'Find nearest neighbors',
                    parameters: {
                        'receiver': 'Receiving individual',
                        'count': '(optional) Number of neighbors',
                        'exerterSubpop': '(optional) Subpopulation to search',
                        'returnDict': '(optional) Return as Dictionary'
                    },
                    returns: 'object',
                    example: 'intType.nearestNeighbors(ind, 5);'
                },
                'nearestNeighborsOfPoint': {
                    description: 'Find nearest neighbors of a point',
                    parameters: {
                        'point': 'Reference point',
                        'exerterSubpop': 'Subpopulation to search',
                        'count': '(optional) Number of neighbors'
                    },
                    returns: 'object<Individual>',
                    example: 'intType.nearestNeighborsOfPoint(c(0,0), p1, 5);'
                },
                'neighborCount': {
                    description: 'Count neighbors within range',
                    parameters: {
                        'receivers': 'Receiving individuals',
                        'exerterSubpop': '(optional) Subpopulation to count'
                    },
                    returns: 'integer',
                    example: 'intType.neighborCount(inds);'
                },
                'neighborCountOfPoint': {
                    description: 'Count neighbors of a point',
                    parameters: {
                        'receivers': 'Receiving individuals',
                        'exerterSubpop': '(optional) Subpopulation to count'
                    },
                    returns: 'integer',
                    example: 'intType.neighborCountOfPoint(inds);'
                },
                'setConstraints': {
                    description: 'Set interaction constraints',
                    parameters: {
                        'who': 'Type of individuals to constrain',
                        'sex': '(optional) Sex constraint',
                        'tag': '(optional) Tag value constraint',
                        'minAge': '(optional) Minimum age',
                        'maxAge': '(optional) Maximum age',
                        'migrant': '(optional) Migration status',
                        'tagL0': '(optional) Level 0 tag status',
                        'tagL1': '(optional) Level 1 tag status',
                        'tagL2': '(optional) Level 2 tag status',
                        'tagL3': '(optional) Level 3 tag status',
                        'tagL4': '(optional) Level 4 tag status'
                    },
                    returns: 'void',
                    example: 'intType.setConstraints("receiver", "M");'
                },
                'setInteractionFunction': {
                    description: 'Set the interaction function',
                    parameters: {
                        'functionType': 'Type of interaction function',
                        '...': 'Additional function parameters'
                    },
                    returns: 'void',
                    example: 'intType.setInteractionFunction("l", 1.0);'
                },
                'strength': {
                    description: 'Calculate interaction strength',
                    parameters: {
                        'receiver': 'Receiving individual',
                        'exerters': '(optional) Exerting individuals'
                    },
                    returns: 'float',
                    example: 'intType.strength(ind1, ind2);'
                },
                'testConstraints': {
                    description: 'Test individuals against constraints',
                    parameters: {
                        'individuals': 'Individuals to test',
                        'constraints': 'Constraint type to test',
                        'returnIndividuals': '(optional) Return matching individuals'
                    },
                    returns: 'logical|object<Individual>',
                    example: 'intType.testConstraints(inds, "receiver");'
                },
                'totalOfNeighborStrengths': {
                    description: 'Sum interaction strengths with neighbors',
                    parameters: {
                        'receivers': 'Receiving individuals',
                        'exerterSubpop': '(optional) Subpopulation of exerters'
                    },
                    returns: 'float',
                    example: 'intType.totalOfNeighborStrengths(inds);'
                },
                'unevaluate': {
                    description: 'Clear cached interaction values',
                    returns: 'void',
                    example: 'intType.unevaluate();'
                }
            }
        },

        'GenomicElementType': {
            description: 'Represents a type of genomic element in the simulation',
            extends: 'Dictionary',
            constructor: {
                description: 'Create a new GenomicElementType',
                example: 'GenomicElementType();'
            },
            properties: {
                'color': {
                    description: 'Color used to represent elements of this type',
                    type: 'string',
                    returns: 'string'
                },
                'id': {
                    description: 'Unique identifier for the element type',
                    type: 'integer',
                    returns: 'integer'
                },
                'mutationFractions': {
                    description: 'Relative proportions of mutation types',
                    type: 'float',
                    returns: 'float'
                },
                'mutationMatrix': {
                    description: 'Mutation rate matrix (nucleotide-based models only)',
                    type: 'float',
                    returns: 'float'
                },
                'mutationTypes': {
                    description: 'Mutation types that can occur in this element',
                    type: 'object<MutType>',
                    returns: 'object<MutType>'
                },
                'species': {
                    description: 'Species this element type belongs to',
                    type: 'object<Species>',
                    returns: 'object<Species>'
                },
                'tag': {
                    description: 'User-defined tag value',
                    type: 'integer',
                    returns: 'integer'
                }
            },
            methods: {
                'setMutationFractions': {
                    description: 'Set relative proportions of mutation types',
                    parameters: {
                        'mutationTypes': 'Mutation types to set',
                        'proportions': 'Relative proportions'
                    },
                    returns: 'void',
                    example: 'gEType.setMutationFractions(m1, 1.0);'
                },
                'setMutationMatrix': {
                    description: 'Set mutation rate matrix (nucleotide-based models only)',
                    parameters: {
                        'mutationMatrix': 'New mutation matrix'
                    },
                    returns: 'void',
                    example: 'gEType.setMutationMatrix(matrix);'
                }
            }
        },

        'SpatialMap': {
            description: 'Represents a spatial map of values across a continuous space',
            extends: 'Dictionary',
            constructor: {
                description: 'Creates a copy of an existing spatial map with a new name',
                parameters: [
                    {
                        name: 'map',
                        description: 'Name for the new map',
                        type: 'string',
                        required: true
                    },
                    {
                        name: 'source',
                        description: 'Source map to copy',
                        type: 'object<SpatialMap>',
                        required: true
                    }
                ],
                example: 'SpatialMap("newmap", oldmap);'
            },
            properties: {
                'gridDimensions': {
                    description: 'Dimensions of the grid',
                    type: 'integer',
                    returns: 'integer'
                },
                'interpolate': {
                    description: 'Whether to interpolate between grid points',
                    type: 'logical',
                    returns: 'logical'
                },
                'name': {
                    description: 'Name of the spatial map',
                    type: 'string',
                    returns: 'string'
                },
                'spatialBounds': {
                    description: 'Spatial boundaries of the map',
                    type: 'float',
                    returns: 'float'
                },
                'spatiality': {
                    description: 'Spatial dimensions ("x"/"xy"/"xyz")',
                    type: 'string',
                    returns: 'string'
                },
                'tag': {
                    description: 'User-defined tag value',
                    type: 'integer',
                    returns: 'integer'
                }
            },
            methods: {
                'add': {
                    description: 'Add values from another map',
                    parameters: {
                        'x': 'Map to add'
                    },
                    returns: 'object<SpatialMap>',
                    example: 'map.add(otherMap);'
                },
                'blend': {
                    description: 'Blend with another map',
                    parameters: {
                        'x': 'Map to blend with',
                        'xFraction': 'Fraction of other map to use'
                    },
                    returns: 'object<SpatialMap>',
                    example: 'map.blend(otherMap, 0.5);'
                },
                'changeValues': {
                    description: 'Replace values with those from another map',
                    parameters: {
                        'x': 'Map with new values'
                    },
                    returns: 'void',
                    example: 'map.changeValues(newMap);'
                },
                'divide': {
                    description: 'Divide by another map',
                    parameters: {
                        'x': 'Map to divide by'
                    },
                    returns: 'object<SpatialMap>',
                    example: 'map.divide(otherMap);'
                },
                'exp': {
                    description: 'Calculate exponential of map values',
                    returns: 'object<SpatialMap>',
                    example: 'map.exp();'
                },
                'gridValues': {
                    description: 'Get raw grid values',
                    returns: 'float',
                    example: 'map.gridValues();'
                },
                'interpolateValues': {
                    description: 'Interpolate to a finer grid',
                    parameters: {
                        'factor': 'Interpolation factor',
                        'method': '(optional) Interpolation method'
                    },
                    returns: 'object<SpatialMap>',
                    example: 'map.interpolateValues(2);'
                },
                'mapColor': {
                    description: 'Get color for a value',
                    parameters: {
                        'value': 'Value to get color for'
                    },
                    returns: 'string',
                    example: 'map.mapColor(0.5);'
                },
                'mapImage': {
                    description: 'Create image representation',
                    parameters: {
                        'width': '(optional) Image width',
                        'height': '(optional) Image height',
                        'centers': '(optional) Show grid centers',
                        'color': '(optional) Use color'
                    },
                    returns: 'object<Image>',
                    example: 'map.mapImage(100, 100);'
                },
                'mapValue': {
                    description: 'Get interpolated value at point',
                    parameters: {
                        'point': 'Point to evaluate'
                    },
                    returns: 'float',
                    example: 'map.mapValue(c(0,0));'
                },
                'multiply': {
                    description: 'Multiply by another map',
                    parameters: {
                        'x': 'Map to multiply by'
                    },
                    returns: 'object<SpatialMap>',
                    example: 'map.multiply(otherMap);'
                },
                'power': {
                    description: 'Raise to power of another map',
                    parameters: {
                        'x': 'Map containing exponents'
                    },
                    returns: 'object<SpatialMap>',
                    example: 'map.power(otherMap);'
                },
                'range': {
                    description: 'Get range of values',
                    returns: 'float',
                    example: 'map.range();'
                },
                'sampleImprovedNearbyPoint': {
                    description: 'Sample nearby point with improved value',
                    parameters: {
                        'point': 'Starting point',
                        'maxDistance': 'Maximum sampling distance',
                        'functionType': 'Sampling function type',
                        '...': 'Additional function parameters'
                    },
                    returns: 'float',
                    example: 'map.sampleImprovedNearbyPoint(c(0,0), 1.0, "n");'
                },
                'sampleNearbyPoint': {
                    description: 'Sample nearby point',
                    parameters: {
                        'point': 'Starting point',
                        'maxDistance': 'Maximum sampling distance',
                        'functionType': 'Sampling function type',
                        '...': 'Additional function parameters'
                    },
                    returns: 'float',
                    example: 'map.sampleNearbyPoint(c(0,0), 1.0, "n");'
                },
                'smooth': {
                    description: 'Smooth map values',
                    parameters: {
                        'maxDistance': 'Maximum smoothing distance',
                        'functionType': 'Smoothing function type',
                        '...': 'Additional function parameters'
                    },
                    returns: 'object<SpatialMap>',
                    example: 'map.smooth(1.0, "n");'
                },
                'subtract': {
                    description: 'Subtract another map',
                    parameters: {
                        'x': 'Map to subtract'
                    },
                    returns: 'object<SpatialMap>',
                    example: 'map.subtract(otherMap);'
                }
            }
        },

        'LogFile': {
            description: 'Represents a log file for recording simulation data',
            extends: 'Dictionary',
            constructor: {
                description: 'Create a new LogFile',
                example: 'LogFile();'
            },
            properties: {
                'filePath': {
                    description: 'Path to the log file',
                    type: 'string',
                    returns: 'string'
                },
                'logInterval': {
                    description: 'Interval between logging events',
                    type: 'integer',
                    returns: 'integer'
                },
                'precision': {
                    description: 'Numeric output precision',
                    type: 'integer',
                    returns: 'integer'
                },
                'tag': {
                    description: 'User-defined tag value',
                    type: 'integer',
                    returns: 'integer'
                }
            },
            methods: {
                'addCustomColumn': {
                    description: 'Add custom column with calculated values',
                    parameters: {
                        'columnName': 'Name of the column',
                        'source': 'Source code for calculation',
                        'context': '(optional) Context for calculation'
                    },
                    returns: 'void',
                    example: 'log.addCustomColumn("fitness", "mean(p1.individuals.fitness);");'
                },
                'addCycle': {
                    description: 'Add generation cycle number column',
                    returns: 'void',
                    example: 'log.addCycle();'
                },
                'addCycleStage': {
                    description: 'Add cycle stage column',
                    returns: 'void',
                    example: 'log.addCycleStage();'
                },
                'addMeanSDColumns': {
                    description: 'Add columns for mean and standard deviation',
                    parameters: {
                        'columnName': 'Base name for columns',
                        'source': 'Source code for values',
                        'context': '(optional) Context for calculation'
                    },
                    returns: 'void',
                    example: 'log.addMeanSDColumns("fitness", "p1.individuals.fitness;");'
                },
                'addPopulationSexRatio': {
                    description: 'Add column for population sex ratio',
                    returns: 'void',
                    example: 'log.addPopulationSexRatio();'
                },
                'addPopulationSize': {
                    description: 'Add column for total population size',
                    returns: 'void',
                    example: 'log.addPopulationSize();'
                },
                'addSubpopulationSexRatio': {
                    description: 'Add column for subpopulation sex ratio',
                    parameters: {
                        'subpop': 'Subpopulation to monitor'
                    },
                    returns: 'void',
                    example: 'log.addSubpopulationSexRatio(p1);'
                },
                'addSubpopulationSize': {
                    description: 'Add column for subpopulation size',
                    parameters: {
                        'subpop': 'Subpopulation to monitor'
                    },
                    returns: 'void',
                    example: 'log.addSubpopulationSize(p1);'
                },
                'addSuppliedColumn': {
                    description: 'Add column with manually supplied values',
                    parameters: {
                        'columnName': 'Name of the column'
                    },
                    returns: 'void',
                    example: 'log.addSuppliedColumn("custom");'
                },
                'flush': {
                    description: 'Flush buffered output to file',
                    returns: 'void',
                    example: 'log.flush();'
                },
                'logRow': {
                    description: 'Log a row of data',
                    returns: 'void',
                    example: 'log.logRow();'
                },
                'setFilePath': {
                    description: 'Set or change the log file path',
                    parameters: {
                        'filePath': 'Path to log file',
                        'initialContents': '(optional) Initial file contents',
                        'append': '(optional) Whether to append to existing file',
                        'compress': '(optional) Whether to compress output',
                        'sep': '(optional) Column separator'
                    },
                    returns: 'void',
                    example: 'log.setFilePath("output.txt");'
                },
                'setLogInterval': {
                    description: 'Set the logging interval',
                    parameters: {
                        'logInterval': '(optional) New logging interval'
                    },
                    returns: 'void',
                    example: 'log.setLogInterval(10);'
                },
                'setSuppliedValue': {
                    description: 'Set value for a supplied column',
                    parameters: {
                        'columnName': 'Name of the column',
                        'value': 'Value to set'
                    },
                    returns: 'void',
                    example: 'log.setSuppliedValue("custom", 42);'
                },
                'willAutolog': {
                    description: 'Check if automatic logging will occur',
                    returns: 'void',
                    example: 'log.willAutolog();'
                }
            }
        },

        'Community': {
            description: 'Represents the entire simulation community',
            extends: 'Dictionary',
            constructor: {
                description: 'Create a new Community',
                example: 'Community();'
            },
            properties: {
                'allGenomicElementTypes': {
                    description: 'All genomic element types in the simulation',
                    type: 'object<GEType>',
                    returns: 'object<GEType>'
                },
                'allInteractionTypes': {
                    description: 'All interaction types in the simulation',
                    type: 'object<IntType>',
                    returns: 'object<IntType>'
                },
                'allMutationTypes': {
                    description: 'All mutation types in the simulation',
                    type: 'object<MutType>',
                    returns: 'object<MutType>'
                },
                'allScriptBlocks': {
                    description: 'All script blocks in the simulation',
                    type: 'object<SEBlock>',
                    returns: 'object<SEBlock>'
                },
                'allSpecies': {
                    description: 'All species in the simulation',
                    type: 'object<Species>',
                    returns: 'object<Species>'
                },
                'allSubpopulations': {
                    description: 'All subpopulations in the simulation',
                    type: 'object<Subpop>',
                    returns: 'object<Subpop>'
                },
                'cycleStage': {
                    description: 'Current stage in generation cycle',
                    type: 'string',
                    returns: 'string'
                },
                'logFiles': {
                    description: 'All log files in the simulation',
                    type: 'object<LogFile>',
                    returns: 'object<LogFile>'
                },
                'modelType': {
                    description: 'Type of simulation model ("WF"/"nonWF")',
                    type: 'string',
                    returns: 'string'
                },
                'tag': {
                    description: 'User-defined tag value',
                    type: 'integer',
                    returns: 'integer'
                },
                'tick': {
                    description: 'Current generation number',
                    type: 'integer',
                    returns: 'integer'
                },
                'verbosity': {
                    description: 'Level of output verbosity',
                    type: 'integer',
                    returns: 'integer'
                }
            },
            methods: {
                'createLogFile': {
                    description: 'Create a new log file',
                    parameters: {
                        'filePath': 'Path to log file',
                        'initialContents': '(optional) Initial file contents',
                        'append': '(optional) Whether to append to existing file',
                        'compress': '(optional) Whether to compress output',
                        'sep': '(optional) Column separator',
                        'logInterval': '(optional) Logging interval',
                        'flushInterval': '(optional) Flush interval'
                    },
                    returns: 'object<LogFile>',
                    example: 'community.createLogFile("output.txt");'
                },
                'estimatedLastTick': {
                    description: 'Estimate final generation number',
                    returns: 'integer',
                    example: 'community.estimatedLastTick();'
                },
                'deregisterScriptBlock': {
                    description: 'Remove script blocks from simulation',
                    parameters: {
                        'scriptBlocks': 'Script blocks to remove'
                    },
                    returns: 'void',
                    example: 'community.deregisterScriptBlock(block);'
                },
                'genomicElementTypesWithIDs': {
                    description: 'Get genomic element types by ID',
                    parameters: {
                        'ids': 'IDs to look up'
                    },
                    returns: 'object<GEType>',
                    example: 'community.genomicElementTypesWithIDs(c(1,2));'
                },
                'interactionTypesWithIDs': {
                    description: 'Get interaction types by ID',
                    parameters: {
                        'ids': 'IDs to look up'
                    },
                    returns: 'object<IntType>',
                    example: 'community.interactionTypesWithIDs(c(1,2));'
                },
                'mutationTypesWithIDs': {
                    description: 'Get mutation types by ID',
                    parameters: {
                        'ids': 'IDs to look up'
                    },
                    returns: 'object<MutType>',
                    example: 'community.mutationTypesWithIDs(c(1,2));'
                },
                'outputUsage': {
                    description: 'Output memory usage statistics',
                    returns: 'void',
                    example: 'community.outputUsage();'
                },
                'registerFirstEvent': {
                    description: 'Register a first() event callback',
                    parameters: {
                        'id': 'Callback identifier',
                        'source': 'Callback source code',
                        'start': '(optional) Start generation',
                        'end': '(optional) End generation'
                    },
                    returns: 'object<SEBlock>',
                    example: 'community.registerFirstEvent(1, "{ initializeMutationType(\'m1\'); }");'
                },
                'registerEarlyEvent': {
                    description: 'Register an early() event callback',
                    parameters: {
                        'id': 'Callback identifier',
                        'source': 'Callback source code',
                        'start': '(optional) Start generation',
                        'end': '(optional) End generation'
                    },
                    returns: 'object<SEBlock>',
                    example: 'community.registerEarlyEvent(1, "{ ... }");'
                },
                'registerLateEvent': {
                    description: 'Register a late() event callback',
                    parameters: {
                        'id': 'Callback identifier',
                        'source': 'Callback source code',
                        'start': '(optional) Start generation',
                        'end': '(optional) End generation'
                    },
                    returns: 'object<SEBlock>',
                    example: 'community.registerLateEvent(1, "{ ... }");'
                },
                'registerInteractionCallback': {
                    description: 'Register interaction() callback',
                    parameters: {
                        'id': 'Callback identifier',
                        'source': 'Callback source code',
                        'intType': 'Interaction type',
                        'subpop': '(optional) Subpopulation',
                        'start': '(optional) Start generation',
                        'end': '(optional) End generation'
                    },
                    returns: 'object<SEBlock>',
                    example: 'community.registerInteractionCallback(1, "{ ... }", i1);'
                },
                'rescheduleScriptBlock': {
                    description: 'Change timing of script block',
                    parameters: {
                        'block': 'Script block to reschedule',
                        'start': '(optional) New start generation',
                        'end': '(optional) New end generation',
                        'ticks': '(optional) Generation ticks'
                    },
                    returns: 'object<SEBlock>',
                    example: 'community.rescheduleScriptBlock(block, 100, 200);'
                },
                'scriptBlocksWithIDs': {
                    description: 'Get script blocks by ID',
                    parameters: {
                        'ids': 'IDs to look up'
                    },
                    returns: 'object<SEBlock>',
                    example: 'community.scriptBlocksWithIDs(c(1,2));'
                },
                'simulationFinished': {
                    description: 'End the simulation',
                    returns: 'void',
                    example: 'community.simulationFinished();'
                },
                'speciesWithIDs': {
                    description: 'Get species by ID',
                    parameters: {
                        'ids': 'IDs to look up'
                    },
                    returns: 'object<Species>',
                    example: 'community.speciesWithIDs(c(1,2));'
                },
                'subpopulationsWithIDs': {
                    description: 'Get subpopulations by ID',
                    parameters: {
                        'ids': 'IDs to look up'
                    },
                    returns: 'object<Subpop>',
                    example: 'community.subpopulationsWithIDs(c(1,2));'
                },
                'subpopulationsWithNames': {
                    description: 'Get subpopulations by name',
                    parameters: {
                        'names': 'Names to look up'
                    },
                    returns: 'object<Subpop>',
                    example: 'community.subpopulationsWithNames(c("p1","p2"));'
                },
                'usage': {
                    description: 'Get memory usage statistics',
                    returns: 'float',
                    example: 'community.usage();'
                }
            }
        }
    }
};