import * as vscode from 'vscode';
import { EidosDocumentation } from './types';

interface DocumentationItem {
    description: string;
    parameters?: { [key: string]: string };
    returns?: string;
    example?: string;
}

export const eidosDoc: EidosDocumentation = {
    functions: {
        // Core language functions
        'print': {
            description: 'Prints values to the output',
            parameters: {
                'values': 'One or more values to print'
            },
            returns: 'void',
            example: 'print("Hello World");'
        },
        'c': {
            description: 'Combines values into a vector',
            parameters: {
                'values': 'One or more values to combine'
            },
            returns: 'vector',
            example: 'x = c(1, 2, 3);'
        },
        'seq': {
            description: 'Generates a sequence of numbers',
            parameters: {
                'from': 'Starting value',
                'to': 'Ending value',
                'by': '(optional) Step size'
            },
            returns: 'numeric[]',
            example: 'seq(1, 10, 2); // 1,3,5,7,9'
        },

        // Math functions
        'abs': {
            description: 'Returns the absolute value of a number',
            parameters: {
                'x': 'Numeric value'
            },
            returns: 'float',
            example: 'abs(-5.3); // 5.3'
        },
        'sum': {
            description: 'Calculates the sum of all elements in a vector',
            parameters: {
                'x': 'Numeric vector'
            },
            returns: 'numeric',
            example: 'sum(c(1,2,3)); // 6'
        },
        'mean': {
            description: 'Calculates the arithmetic mean of a vector',
            parameters: {
                'x': 'Numeric vector'
            },
            returns: 'float',
            example: 'mean(c(1,2,3)); // 2'
        },

        // Random number generation
        'runif': {
            description: 'Generates uniform random numbers',
            parameters: {
                'n': 'Number of values to generate',
                'min': '(optional) Minimum value',
                'max': '(optional) Maximum value'
            },
            returns: 'float[]',
            example: 'runif(5, 0, 1);'
        },
        'rnorm': {
            description: 'Generates normal random numbers',
            parameters: {
                'n': 'Number of values to generate',
                'mean': '(optional) Mean of distribution',
                'sd': '(optional) Standard deviation'
            },
            returns: 'float[]',
            example: 'rnorm(10, 0, 1);'
        },

        // SLiM initialization functions
        'initializeMutationType': {
            description: 'Defines a new mutation type',
            parameters: {
                'id': 'Identifier for mutation type',
                'dominance': 'Dominance coefficient',
                'distributionType': 'Type of distribution ("f", "e", "n", etc.)',
                'parameters': 'Distribution parameters'
            },
            returns: 'void',
            example: 'initializeMutationType("m1", 0.5, "f", 0.0);'
        },
        'initializeGenomicElement': {
            description: 'Defines a genomic element',
            parameters: {
                'type': 'Genomic element type',
                'start': 'Start position',
                'end': 'End position'
            },
            returns: 'void',
            example: 'initializeGenomicElement(g1, 0, 999);'
        },

        // Additional math and statistical functions
        'sd': {
            description: 'Calculates the standard deviation of a vector',
            parameters: {
                'x': 'Numeric vector'
            },
            returns: 'float',
            example: 'sd(c(1,2,3,4,5)); // standard deviation'
        },
        'var': {
            description: 'Calculates the variance of a vector',
            parameters: {
                'x': 'Numeric vector'
            },
            returns: 'float',
            example: 'var(c(1,2,3,4,5)); // variance'
        },
        'max': {
            description: 'Returns the maximum value in a vector',
            parameters: {
                'x': 'Numeric vector'
            },
            returns: 'numeric',
            example: 'max(c(1,2,3)); // 3'
        },
        'min': {
            description: 'Returns the minimum value in a vector',
            parameters: {
                'x': 'Numeric vector'
            },
            returns: 'numeric',
            example: 'min(c(1,2,3)); // 1'
        },
        'range': {
            description: 'Returns the range (min and max) of a vector',
            parameters: {
                'x': 'Numeric vector'
            },
            returns: 'numeric[2]',
            example: 'range(c(1,2,3)); // c(1,3)'
        },

        // Additional string manipulation
        'strsplit': {
            description: 'Splits a string by a delimiter',
            parameters: {
                'x': 'String to split',
                'delimiter': 'Character(s) to split on'
            },
            returns: 'string[]',
            example: 'strsplit("a,b,c", ","); // c("a","b","c")'
        },
        'paste0': {
            description: 'Concatenates strings without separator',
            parameters: {
                'strings': 'Strings to concatenate'
            },
            returns: 'string',
            example: 'paste0("a", "b", "c"); // "abc"'
        },
        'nchar': {
            description: 'Counts the number of characters in a string',
            parameters: {
                'x': 'String to measure'
            },
            returns: 'integer',
            example: 'nchar("hello"); // 5'
        },

        // Additional SLiM initialization functions
        'initializeSex': {
            description: 'Initializes sexual reproduction in the simulation',
            parameters: {
                'dominance': '(optional) Sex-specific dominance coefficient'
            },
            returns: 'void',
            example: 'initializeSex("A");'
        },
        'initializeAncestralNucleotides': {
            description: 'Sets up ancestral nucleotide sequences',
            parameters: {
                'sequence': 'String of nucleotides (ACGT)'
            },
            returns: 'void',
            example: 'initializeAncestralNucleotides("ACGT");'
        },
        'initializeMutationStack': {
            description: 'Initializes the mutation stack for tracking',
            parameters: {
                'stack_size': 'Maximum number of mutations to track'
            },
            returns: 'void',
            example: 'initializeMutationStack(1000);'
        },

        // Population genetic statistics
        'calcFST': {
            description: 'Calculates FST between subpopulations',
            parameters: {
                'subpop1': 'First subpopulation',
                'subpop2': 'Second subpopulation'
            },
            returns: 'float',
            example: 'calcFST(p1, p2);'
        },
        'calcHeterozygosity': {
            description: 'Calculates expected heterozygosity',
            parameters: {
                'subpop': 'Subpopulation to analyze'
            },
            returns: 'float',
            example: 'calcHeterozygosity(p1);'
        },
        'calcLD': {
            description: 'Calculates linkage disequilibrium',
            parameters: {
                'pos1': 'First position',
                'pos2': 'Second position',
                'subpop': 'Subpopulation to analyze'
            },
            returns: 'float',
            example: 'calcLD(1000, 2000, p1);'
        },

        // File I/O Functions
        'writeFile': {
            description: 'Writes data to a file',
            parameters: {
                'path': 'File path to write to',
                'contents': 'Data to write',
                'append': '(optional) Whether to append to existing file'
            },
            returns: 'void',
            example: 'writeFile("output.txt", "Data");'
        },
        'readFile': {
            description: 'Reads contents from a file',
            parameters: {
                'path': 'File path to read from'
            },
            returns: 'string',
            example: 'content = readFile("input.txt");'
        },

        // Vector Operations
        'unique': {
            description: 'Returns unique elements of a vector',
            parameters: {
                'x': 'Vector to process'
            },
            returns: 'vector',
            example: 'unique(c(1,1,2,2,3)); // c(1,2,3)'
        },
        'which': {
            description: 'Returns indices where a logical vector is TRUE',
            parameters: {
                'x': 'Logical vector'
            },
            returns: 'integer[]',
            example: 'which(x > 5);'
        },
        'order': {
            description: 'Returns indices that would sort a vector',
            parameters: {
                'x': 'Vector to sort',
                'decreasing': '(optional) Sort in decreasing order'
            },
            returns: 'integer[]',
            example: 'order(c(3,1,2)); // c(2,3,1)'
        },

        // Type Conversion
        'asInteger': {
            description: 'Converts values to integer type',
            parameters: {
                'x': 'Value to convert'
            },
            returns: 'integer',
            example: 'asInteger("123");'
        },
        'asFloat': {
            description: 'Converts values to float type',
            parameters: {
                'x': 'Value to convert'
            },
            returns: 'float',
            example: 'asFloat("12.34");'
        },
        'asString': {
            description: 'Converts values to string type',
            parameters: {
                'x': 'Value to convert'
            },
            returns: 'string',
            example: 'asString(123);'
        },
        'asLogical': {
            description: 'Converts values to logical type',
            parameters: {
                'x': 'Value to convert'
            },
            returns: 'logical',
            example: 'asLogical(1);'
        },

        // Simulation Control
        'setSeed': {
            description: 'Sets the random number generator seed',
            parameters: {
                'seed': 'Seed value'
            },
            returns: 'void',
            example: 'setSeed(42);'
        },
        'stop': {
            description: 'Stops the simulation with an optional message',
            parameters: {
                'message': '(optional) Error message'
            },
            returns: 'void',
            example: 'stop("Error condition met");'
        },
        'clock': {
            description: 'Returns the current simulation time',
            returns: 'float',
            example: 'time = clock();'
        }
    },
    objects: {
        'Individual': {
            methods: {
                'genome1': {
                    description: 'Returns first genome of the individual',
                    returns: 'Genome',
                    example: 'ind.genome1;'
                },
                'genome2': {
                    description: 'Returns second genome of the individual',
                    returns: 'Genome',
                    example: 'ind.genome2;'
                },
                'fitness': {
                    description: 'Get or set individual fitness',
                    parameters: {
                        'value': '(optional) New fitness value'
                    },
                    returns: 'float',
                    example: 'ind.fitness = 0.8;'
                }
            },
            properties: {
                'age': {
                    description: 'Age of the individual',
                    returns: 'integer'
                },
                'index': {
                    description: 'Index in the subpopulation',
                    returns: 'integer'
                }
            }
        },
        'Population': {
            methods: {
                'addSubpop': {
                    description: 'Adds a new subpopulation',
                    parameters: {
                        'id': 'Subpopulation identifier',
                        'size': 'Initial size'
                    },
                    returns: 'Subpopulation',
                    example: 'sim.addSubpop("p1", 1000);'
                },
                'addSubpopSplit': {
                    description: 'Creates a new subpopulation as a split from existing one',
                    parameters: {
                        'id': 'New subpopulation identifier',
                        'size': 'Size of new subpopulation',
                        'sourceSubpop': 'Source subpopulation'
                    },
                    returns: 'Subpopulation',
                    example: 'sim.addSubpopSplit("p2", 500, p1);'
                }
            },
            properties: {
                'generation': {
                    description: 'Current generation number',
                    returns: 'integer'
                }
            }
        },
        'Mutation': {
            methods: {
                'setSelectionCoeff': {
                    description: 'Sets the selection coefficient of the mutation',
                    parameters: {
                        'coeff': 'New selection coefficient'
                    },
                    returns: 'void',
                    example: 'mut.setSelectionCoeff(0.1);'
                },
                'setDominanceCoeff': {
                    description: 'Sets the dominance coefficient of the mutation',
                    parameters: {
                        'coeff': 'New dominance coefficient'
                    },
                    returns: 'void',
                    example: 'mut.setDominanceCoeff(0.5);'
                }
            },
            properties: {
                'id': {
                    description: 'Unique identifier of the mutation',
                    returns: 'integer'
                },
                'position': {
                    description: 'Position of the mutation in the genome',
                    returns: 'integer'
                },
                'selectionCoeff': {
                    description: 'Selection coefficient of the mutation',
                    returns: 'float'
                },
                'dominanceCoeff': {
                    description: 'Dominance coefficient of the mutation',
                    returns: 'float'
                },
                'subpopID': {
                    description: 'ID of the subpopulation where mutation originated',
                    returns: 'integer'
                }
            }
        },
        'Genome': {
            methods: {
                'addMutations': {
                    description: 'Adds multiple mutations to the genome',
                    parameters: {
                        'mutations': 'Vector of mutations to add'
                    },
                    returns: 'void',
                    example: 'genome1.addMutations(muts);'
                },
                'removeMutations': {
                    description: 'Removes specified mutations from the genome',
                    parameters: {
                        'mutations': 'Vector of mutations to remove'
                    },
                    returns: 'void',
                    example: 'genome1.removeMutations(muts);'
                },
                'countOfMutations': {
                    description: 'Counts mutations in the genome',
                    returns: 'integer',
                    example: 'genome1.countOfMutations();'
                }
            },
            properties: {
                'type': {
                    description: 'Type of the genome (A/X/Y)',
                    returns: 'string'
                },
                'isNullified': {
                    description: 'Whether the genome is nullified',
                    returns: 'logical'
                }
            }
        },
        'Subpopulation': {
            methods: {
                'setMigrationRates': {
                    description: 'Sets migration rates to other subpopulations',
                    parameters: {
                        'sourceSubpops': 'Vector of source subpopulations',
                        'rates': 'Vector of migration rates'
                    },
                    returns: 'void',
                    example: 'p1.setMigrationRates(c(p2,p3), c(0.1,0.2));'
                },
                'setSpatialPosition': {
                    description: 'Sets spatial position of the subpopulation',
                    parameters: {
                        'x': 'X coordinate',
                        'y': 'Y coordinate',
                        'z': '(optional) Z coordinate'
                    },
                    returns: 'void',
                    example: 'p1.setSpatialPosition(0, 0);'
                },
                'cachedFitness': {
                    description: 'Returns cached fitness values for the subpopulation',
                    returns: 'float[]',
                    example: 'p1.cachedFitness();'
                }
            },
            properties: {
                'id': {
                    description: 'Identifier of the subpopulation',
                    returns: 'string'
                },
                'individualCount': {
                    description: 'Number of individuals in the subpopulation',
                    returns: 'integer'
                },
                'genomes': {
                    description: 'All genomes in the subpopulation',
                    returns: 'Genome[]'
                }
            }
        },
        'Simulation': {
            methods: {
                'getValue': {
                    description: 'Retrieves a stored simulation value',
                    parameters: {
                        'key': 'Name of the value to retrieve'
                    },
                    returns: 'any',
                    example: 'sim.getValue("populationSize");'
                },
                'setValue': {
                    description: 'Stores a value in the simulation',
                    parameters: {
                        'key': 'Name to store the value under',
                        'value': 'Value to store'
                    },
                    returns: 'void',
                    example: 'sim.setValue("populationSize", 1000);'
                },
                'rescheduleScriptBlock': {
                    description: 'Reschedules a script block to run at a different time',
                    parameters: {
                        'id': 'Script block ID',
                        'start': 'New start time',
                        'end': 'New end time'
                    },
                    returns: 'void',
                    example: 'sim.rescheduleScriptBlock(s1, 100, 200);'
                }
            },
            properties: {
                'generation': {
                    description: 'Current generation number',
                    returns: 'integer'
                },
                'scriptBlocks': {
                    description: 'All script blocks in the simulation',
                    returns: 'dictionary'
                }
            }
        },
        'MutationType': {
            methods: {
                'drawSelectionCoefficient': {
                    description: 'Draws a selection coefficient from the distribution',
                    returns: 'float',
                    example: 'm1.drawSelectionCoefficient();'
                }
            },
            properties: {
                'mutationStackPolicy': {
                    description: 'Policy for handling mutation stack overflow',
                    returns: 'string'
                },
                'convertToSubstitution': {
                    description: 'Whether fixed mutations convert to substitutions',
                    returns: 'logical'
                }
            }
        },
        'GenomicElement': {
            methods: {
                'setMutationRate': {
                    description: 'Sets mutation rate for this element',
                    parameters: {
                        'rate': 'New mutation rate'
                    },
                    returns: 'void',
                    example: 'g1.setMutationRate(1e-7);'
                }
            },
            properties: {
                'start': {
                    description: 'Start position of the element',
                    returns: 'integer'
                },
                'end': {
                    description: 'End position of the element',
                    returns: 'integer'
                },
                'type': {
                    description: 'Type of genomic element',
                    returns: 'GenomicElementType'
                }
            }
        }
    }
};

// Integration with HoverProvider
export function getHoverDocumentation(word: string, context?: string): string | undefined {
    try {
        if (!word) {
            return undefined;
        }

        if (context && eidosDoc.objects[context]?.methods[word]) {
            const method = eidosDoc.objects[context].methods[word];
            return formatMethodDocumentation(method);
        }

        if (eidosDoc.functions[word]) {
            return formatFunctionDocumentation(eidosDoc.functions[word]);
        }

        return undefined;
    } catch (e) {
        vscode.window.showErrorMessage(`Error getting documentation: ${e}`);
        return undefined;
    }
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

// Integration with CompletionProvider
export function getCompletionItems(prefix: string, context?: string): vscode.CompletionItem[] {
    const items: vscode.CompletionItem[] = [];

    if (!context) {
        // Add function completions
        for (const [func, details] of Object.entries(eidosDoc.functions)) {
            if (func.startsWith(prefix)) {
                const item = new vscode.CompletionItem(func, vscode.CompletionItemKind.Function);
                item.documentation = new vscode.MarkdownString(getHoverDocumentation(func));
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
                item.documentation = new vscode.MarkdownString(getHoverDocumentation(method, context));
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