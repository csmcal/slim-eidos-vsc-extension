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
        // Core Language Functions
        // Basic language operations and control flow
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
        'size': {
            description: 'Returns the length of a vector or string',
            parameters: {
                'x': 'Vector or string to measure'
            },
            returns: 'integer',
            example: 'size(c(1,2,3)); // 3'
        },
        'apply': {
            description: 'Applies a function to each element, allowing early exit',
            parameters: {
                'x': 'Vector to process',
                'lambda': 'Function to apply'
            },
            returns: 'void',
            example: 'apply(1:3, "if (applyValue > 2) stop(); print(applyValue);");'
        },
        'doCall': {
            description: 'Calls a function with arguments supplied as a vector',
            parameters: {
                'functionName': 'Name of function to call',
                'arguments': 'Vector of arguments'
            },
            returns: 'any',
            example: 'doCall("mean", list(c(1,2,3)));'
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
        },

        // Type System
        // Type checking and conversion
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
        'isFloat': {
            description: 'Tests if a value is a float',
            parameters: {
                'x': 'Value to test'
            },
            returns: 'logical',
            example: 'isFloat(3.14);'
        },
        'isInteger': {
            description: 'Tests if a value is an integer',
            parameters: {
                'x': 'Value to test'
            },
            returns: 'logical',
            example: 'isInteger(42);'
        },

        // Array Operations
        // Vector and matrix manipulations
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
        'sample': {
            description: 'Randomly samples elements from a vector',
            parameters: {
                'x': 'Vector to sample from',
                'size': 'Number of elements to sample',
                'replace': '(optional) Whether to sample with replacement'
            },
            returns: 'vector',
            example: 'sample(1:10, 5, F); // 5 unique numbers'
        },
        'match': {
            description: 'Returns positions of first matches of elements',
            parameters: {
                'x': 'Values to match',
                'table': 'Values to match against'
            },
            returns: 'integer[]',
            example: 'match(c(1,2,3), c(2,3,4)); // c(NA,1,2)'
        },
        'rev': {
            description: 'Reverses elements in a vector',
            parameters: {
                'x': 'Vector to reverse'
            },
            returns: 'vector',
            example: 'rev(1:5); // c(5,4,3,2,1)'
        },
        'sort': {
            description: 'Sorts elements in a vector',
            parameters: {
                'x': 'Vector to sort',
                'decreasing': '(optional) Sort in decreasing order'
            },
            returns: 'vector',
            example: 'sort(c(3,1,4,2)); // c(1,2,3,4)'
        },
        'cumsum': {
            description: 'Calculates cumulative sums of vector elements',
            parameters: {
                'x': 'Numeric vector'
            },
            returns: 'numeric[]',
            example: 'cumsum(c(1,2,3)); // c(1,3,6)'
        },
        'diff': {
            description: 'Calculates differences between consecutive elements',
            parameters: {
                'x': 'Numeric vector',
                'lag': '(optional) Gap between elements'
            },
            returns: 'numeric[]',
            example: 'diff(c(1,3,6,10)); // c(2,3,4)'
        },
        'intersect': {
            description: 'Returns common elements between vectors',
            parameters: {
                'x': 'First vector',
                'y': 'Second vector'
            },
            returns: 'vector',
            example: 'intersect(1:5, 3:7); // c(3,4,5)'
        },
        'setDiff': {
            description: 'Returns elements in x but not in y',
            parameters: {
                'x': 'First vector',
                'y': 'Second vector'
            },
            returns: 'vector',
            example: 'setDiff(1:5, 3:7); // c(1,2)'
        },
        'rep': {
            description: 'Repeats a value or vector multiple times',
            parameters: {
                'x': 'Value to repeat',
                'count': 'Number of times to repeat'
            },
            returns: 'vector',
            example: 'rep(5, 3); // c(5,5,5)'
        },
        'sapply': {
            description: 'Applies a function to each element of a vector',
            parameters: {
                'x': 'Vector to process',
                'lambda': 'Function to apply'
            },
            returns: 'vector',
            example: 'sapply(1:3, "applyValue * 2;"); // c(2,4,6)'
        },

        // Matrix Operations
        'matrix': {
            description: 'Creates a matrix from a vector',
            parameters: {
                'x': 'Vector of values',
                'nrow': 'Number of rows',
                'ncol': 'Number of columns',
                'byrow': '(optional) Fill by row instead of column'
            },
            returns: 'matrix',
            example: 'matrix(1:6, 2, 3); // 2x3 matrix'
        },
        'cbind': {
            description: 'Combines vectors/matrices by columns',
            parameters: {
                'x': 'First vector/matrix',
                'y': 'Second vector/matrix'
            },
            returns: 'matrix',
            example: 'cbind(c(1,2), c(3,4)); // 2x2 matrix'
        },
        'rbind': {
            description: 'Combines vectors/matrices by rows',
            parameters: {
                'x': 'First vector/matrix',
                'y': 'Second vector/matrix'
            },
            returns: 'matrix',
            example: 'rbind(c(1,2), c(3,4)); // 2x2 matrix'
        },
        'det': {
            description: 'Calculates determinant of a matrix',
            parameters: {
                'x': 'Square matrix'
            },
            returns: 'float',
            example: 'det(matrix(c(1,2,3,4), 2, 2));'
        },
        'solve': {
            description: 'Solves a system of linear equations',
            parameters: {
                'a': 'Coefficient matrix',
                'b': 'Right-hand side vector'
            },
            returns: 'numeric[]',
            example: 'solve(matrix(c(1,1,1,-1), 2, 2), c(2,0));'
        },

        // Mathematical Functions
        // Basic mathematical operations
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
        'pow': {
            description: 'Raises a number to a power',
            parameters: {
                'base': 'Base value',
                'exponent': 'Exponent value'
            },
            returns: 'float',
            example: 'pow(2, 3); // 8'
        },
        'log': {
            description: 'Calculates the natural logarithm',
            parameters: {
                'x': 'Numeric value'
            },
            returns: 'float',
            example: 'log(2.718); // ~1.0'
        },
        'log10': {
            description: 'Calculates base-10 logarithm',
            parameters: {
                'x': 'Numeric value'
            },
            returns: 'float',
            example: 'log10(100); // 2.0'
        },
        'exp': {
            description: 'Calculates e raised to the power',
            parameters: {
                'x': 'Power to raise e to'
            },
            returns: 'float',
            example: 'exp(1); // 2.718...'
        },
        'round': {
            description: 'Rounds numbers to specified decimal places',
            parameters: {
                'x': 'Number(s) to round',
                'digits': '(optional) Number of decimal places'
            },
            returns: 'float',
            example: 'round(3.14159, 2); // 3.14'
        },
        'ceiling': {
            description: 'Rounds up to the nearest integer',
            parameters: {
                'x': 'Numeric value'
            },
            returns: 'integer',
            example: 'ceiling(3.1); // 4'
        },
        'floor': {
            description: 'Rounds down to the nearest integer',
            parameters: {
                'x': 'Numeric value'
            },
            returns: 'integer',
            example: 'floor(3.9); // 3'
        },

        // Advanced Mathematics
        'factorial': {
            description: 'Calculates factorial of a number',
            parameters: {
                'x': 'Non-negative integer'
            },
            returns: 'integer',
            example: 'factorial(5); // 120'
        },
        'choose': {
            description: 'Calculates binomial coefficients',
            parameters: {
                'n': 'Number of items',
                'k': 'Number to choose'
            },
            returns: 'integer',
            example: 'choose(5, 2); // 10'
        },
        'gamma': {
            description: 'Calculates the gamma function',
            parameters: {
                'x': 'Numeric value'
            },
            returns: 'float',
            example: 'gamma(5); // 24'
        },
        'lgamma': {
            description: 'Calculates the natural logarithm of the gamma function',
            parameters: {
                'x': 'Numeric value'
            },
            returns: 'float',
            example: 'lgamma(5); // ~3.178'
        },

        // Statistical Functions
        'mean': {
            description: 'Calculates the arithmetic mean of a vector',
            parameters: {
                'x': 'Numeric vector'
            },
            returns: 'float',
            example: 'mean(c(1,2,3)); // 2'
        },
        'median': {
            description: 'Calculates the median value of a vector',
            parameters: {
                'x': 'Numeric vector'
            },
            returns: 'float',
            example: 'median(c(1,2,3,4)); // 2.5'
        },
        'mode': {
            description: 'Finds the most frequent value(s) in a vector',
            parameters: {
                'x': 'Vector to analyze'
            },
            returns: 'vector',
            example: 'mode(c(1,2,2,3)); // 2'
        },
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
        'quantile': {
            description: 'Calculates sample quantiles of a vector',
            parameters: {
                'x': 'Numeric vector',
                'probs': 'Vector of probabilities'
            },
            returns: 'float[]',
            example: 'quantile(x, c(0.25, 0.5, 0.75));'
        },
        'cor': {
            description: 'Calculates correlation between vectors',
            parameters: {
                'x': 'First numeric vector',
                'y': 'Second numeric vector'
            },
            returns: 'float',
            example: 'cor(x, y);'
        },
        'rank': {
            description: 'Returns ranks of elements in a vector',
            parameters: {
                'x': 'Vector to rank',
                'ties.method': '(optional) Method for handling ties ("average", "min", "max")'
            },
            returns: 'numeric[]',
            example: 'rank(c(3,1,4,1,5)); // c(3,1.5,4,1.5,5)'
        },

        // Random Number Generation
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
        'rbinom': {
            description: 'Generates random binomial variates',
            parameters: {
                'n': 'Number of trials',
                'size': 'Size parameter',
                'prob': 'Probability of success'
            },
            returns: 'integer[]',
            example: 'rbinom(10, 1, 0.5); // 10 coin flips'
        },
        'setSeed': {
            description: 'Sets the random number generator seed',
            parameters: {
                'seed': 'Seed value'
            },
            returns: 'void',
            example: 'setSeed(42);'
        },

        // String Operations
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

        // File I/O
        // Basic file operations
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
        'readDirectory': {
            description: 'Lists files in a directory',
            parameters: {
                'path': 'Directory path',
                'pattern': '(optional) File pattern to match'
            },
            returns: 'string[]',
            example: 'readDirectory(".", "*.txt");'
        },

        // Structured File I/O
        'writeCSV': {
            description: 'Writes data to a CSV file',
            parameters: {
                'x': 'Data to write',
                'path': 'File path',
                'header': '(optional) Include header row',
                'sep': '(optional) Field separator'
            },
            returns: 'void',
            example: 'writeCSV(data, "output.csv", T, ",");'
        },
        'readCSV': {
            description: 'Reads data from a CSV file',
            parameters: {
                'path': 'File path',
                'header': '(optional) File has header',
                'sep': '(optional) Field separator'
            },
            returns: 'matrix',
            example: 'data = readCSV("input.csv", T);'
        },
        'writeJSON': {
            description: 'Writes data in JSON format',
            parameters: {
                'x': 'Data to write',
                'path': 'File path',
                'pretty': '(optional) Pretty print'
            },
            returns: 'void',
            example: 'writeJSON(data, "output.json", T);'
        },
        'writeTable': {
            description: 'Writes data to a table file',
            parameters: {
                'x': 'Data to write',
                'path': 'File path',
                'sep': '(optional) Field separator',
                'rowNames': '(optional) Row names',
                'colNames': '(optional) Column names'
            },
            returns: 'void',
            example: 'writeTable(data, "output.table", "\t", rowNames, colNames);'
        },
        'readTable': {
            description: 'Reads data from a table file',
            parameters: {
                'path': 'File path',
                'sep': '(optional) Field separator',
                'header': '(optional) File has header',
                'rowNames': '(optional) Row names column',
                'colNames': '(optional) Column names row'
            },
            returns: 'matrix',
            example: 'data = readTable("input.table", "\t", T, 1, 1);'
        },

        // SLiM Initialization
        // Basic initialization
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
        'initializeSex': {
            description: 'Initializes sexual reproduction in the simulation',
            parameters: {
                'dominance': '(optional) Sex-specific dominance coefficient'
            },
            returns: 'void',
            example: 'initializeSex("A");'
        },

        // Advanced initialization
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
        'initializeRecombinationRate': {
            description: 'Sets the recombination rate between positions',
            parameters: {
                'rates': 'Vector of rates',
                'ends': 'Vector of end positions'
            },
            returns: 'void',
            example: 'initializeRecombinationRate(c(1e-8), c(1e6));'
        },
        'initializeInteractionType': {
            description: 'Defines a new interaction type for social interactions',
            parameters: {
                'id': 'Identifier for interaction type',
                'maxDistance': 'Maximum interaction distance',
                'reciprocal': '(optional) Whether interaction is reciprocal'
            },
            returns: 'void',
            example: 'initializeInteractionType("i1", 1.0);'
        },

        // Tree Sequence Operations
        'initializeTreeSeq': {
            description: 'Initializes tree sequence recording',
            parameters: {
                'simplify': '(optional) Whether to simplify recorded trees',
                'retainCoalescentOnly': '(optional) Record only coalescent events'
            },
            returns: 'void',
            example: 'initializeTreeSeq(T);'
        },
        'treeSeqOutput': {
            description: 'Writes tree sequence to a file',
            parameters: {
                'path': 'Path to output file',
                'simplify': '(optional) Whether to simplify before output'
            },
            returns: 'void',
            example: 'treeSeqOutput("trees.trees");'
        },
        'treeSeqSimplify': {
            description: 'Simplifies a tree sequence',
            parameters: {
                'treeSeq': 'Tree sequence to simplify',
                'samples': 'Samples to retain',
                'filter': '(optional) Filter function'
            },
            returns: 'TreeSequence',
            example: 'simplifiedSeq = treeSeqSimplify(treeSeq, samples);'
        },
        'treeSeqMutations': {
            description: 'Extracts mutations from a tree sequence',
            parameters: {
                'treeSeq': 'Tree sequence to query',
                'node': 'Node ID',
                'population': '(optional) Population ID'
            },
            returns: 'vector',
            example: 'mutations = treeSeqMutations(treeSeq, 1, 1);'
        },

        // Population Genetics
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
        }
    },
    
    // Objects section remains unchanged
    objects: {
        'Individual': {
            description: 'Represents an individual in the simulation',
            properties: {
                'id': {
                    description: 'Unique identifier for the individual',
                    returns: 'string'
                },
                'genome': {
                    description: 'Genome object associated with the individual',
                    returns: 'Genome'
                },
                'subpopulation': {
                    description: 'Subpopulation to which the individual belongs',
                    returns: 'Subpopulation'
                },
                'sex': {
                    description: 'Sex of the individual',
                    returns: 'string'
                },
                'age': {
                    description: 'Age of the individual',
                    returns: 'integer'
                },
                'fitness': {
                    description: 'Fitness value of the individual',
                    returns: 'float'
                },
                'spatialPosition': {
                    description: 'Spatial position of the individual',
                    returns: 'float[]'
                },
                'tag': {
                    description: 'Custom tag for the individual',
                    returns: 'integer'
                }
            },
            methods: {
                'relatedness': {
                    description: 'Calculates the relatedness between two individuals',
                    parameters: {
                        'other': 'Individual to compare'
                    },
                    returns: 'float',
                    example: 'relatedness = individual1.relatedness(individual2);'
                },
                'spatialInteraction': {
                    description: 'Calculates the spatial interaction value with another individual',
                    parameters: {
                        'other': 'Individual to interact with',
                        'interactionType': 'Interaction type identifier'
                    },
                    returns: 'float',
                    example: 'interactionValue = individual1.spatialInteraction(individual2, "i1");'
                }
            }
        },
        'Subpopulation': {
            description: 'Represents a subpopulation in the simulation',
            properties: {
                'id': {
                    description: 'Unique identifier for the subpopulation',
                    returns: 'string'
                },
                'individuals': {
                    description: 'List of individuals in the subpopulation',
                    returns: 'Individual[]'
                },
                'spatialBounds': {
                    description: 'Spatial bounds of the subpopulation',
                    returns: 'object'
                },
                'size': {
                    description: 'Current size of the subpopulation',
                    returns: 'integer'
                }
            },
            methods: {
                'setSpatialBounds': {
                    description: 'Sets the spatial bounds of the subpopulation',
                    parameters: {
                        'bounds': 'Spatial bounds object'
                    },
                    returns: 'void',
                    example: 'subpopulation.setSpatialBounds(bounds);'
                },
                'sampleIndividuals': {
                    description: 'Randomly samples individuals from the subpopulation',
                    parameters: {
                        'n': 'Number of individuals to sample',
                        'replace': '(optional) Whether to sample with replacement'
                    },
                    returns: 'Individual[]',
                    example: 'samples = subpopulation.sampleIndividuals(10, F);'
                },
                'spatialMap': {
                    description: 'Maps the subpopulation to a spatial grid',
                    parameters: {
                        'grid': 'Spatial grid object'
                    },
                    returns: 'void',
                    example: 'subpopulation.spatialMap(grid);'
                }
            }
        },
        'Genome': {
            description: 'Represents the genome of an individual',
            properties: {
                'genomicElements': {
                    description: 'List of genomic elements in the genome',
                    returns: 'GenomicElement[]'
                },
                'mutations': {
                    description: 'List of mutations in the genome',
                    returns: 'Mutation[]'
                }
            },
            methods: {
                'mutationCount': {
                    description: 'Returns the number of mutations in the genome',
                    returns: 'integer',
                    example: 'count = genome.mutationCount();'
                },
                'mutationsAt': {
                    description: 'Returns mutations at a specific genomic position',
                    parameters: {
                        'position': 'Genomic position'
                    },
                    returns: 'Mutation[]',
                    example: 'mutations = genome.mutationsAt(1000);'
                }
            }
        },
        'GenomicElement': {
            description: 'Represents a genomic element in the simulation',
            properties: {
                'type': {
                    description: 'Type of genomic element',
                    returns: 'string'
                },
                'start': {
                    description: 'Start position of the element',
                    returns: 'integer'
                },
                'end': {
                    description: 'End position of the element',
                    returns: 'integer'
                }
            },
            methods: {
                'length': {
                    description: 'Returns the length of the genomic element',
                    returns: 'integer',
                    example: 'length = genomicElement.length();'
                }
            }
        },
        'Mutation': {
            description: 'Represents a mutation in the simulation',
            properties: {
                'type': {
                    description: 'Type of mutation',
                    returns: 'string'
                },
                'position': {
                    description: 'Genomic position of the mutation',
                    returns: 'integer'
                },
                'effect': {
                    description: 'Effect of the mutation',
                    returns: 'float'
                }
            },
            methods: {
                'dominanceCoefficient': {
                    description: 'Returns the dominance coefficient of the mutation',
                    returns: 'float',
                    example: 'coeff = mutation.dominanceCoefficient();'
                }
            }
        },
        'TreeSequence': {
            description: 'Represents a tree sequence in the simulation',
            properties: {
                'nodes': {
                    description: 'List of nodes in the tree sequence',
                    returns: 'dictionary'
                },
                'edges': {
                    description: 'List of edges in the tree sequence',
                    returns: 'dictionary'
                },
                'mutations': {
                    description: 'List of mutations in the tree sequence',
                    returns: 'dictionary'
                }
            },
            methods: {
                'simplify': {
                    description: 'Simplifies the tree sequence',
                    parameters: {
                        'samples': 'Samples to retain',
                        'filter': '(optional) Filter function'
                    },
                    returns: 'TreeSequence',
                    example: 'simplifiedSeq = treeSequence.simplify(samples);'
                },
                'mutationsForNode': {
                    description: 'Returns mutations for a specific node',
                    parameters: {
                        'node': 'Node ID',
                        'population': '(optional) Population ID'
                    },
                    returns: 'Mutation[]',
                    example: 'mutations = treeSequence.mutationsForNode(1, 1);'
                }
            }
        },
        'SpatialGrid': {
            description: 'Represents a spatial grid for mapping individuals',
            properties: {
                'cells': {
                    description: 'List of cells in the grid',
                    returns: 'Cell[]'
                },
                'resolution': {
                    description: 'Resolution of the grid',
                    returns: 'float'
                }
            },
            methods: {
                'cellAt': {
                    description: 'Returns the cell at a specific spatial position',
                    parameters: {
                        'position': 'Spatial position'
                    },
                    returns: 'SpatialCell',
                    example: 'cell = spatialGrid.cellAt(position);'
                }
            }
        },
        'SpatialCell': {
            description: 'Represents a cell in a spatial grid',
            properties: {
                'position': {
                    description: 'Spatial position of the cell',
                    returns: 'float[]'
                },
                'individuals': {
                    description: 'List of individuals in the cell',
                    returns: 'Individual[]'
                }
            },
            methods: {
                'nearestNeighbor': {
                    description: 'Returns the nearest neighbor individual',
                    parameters: {
                        'individual': 'Reference individual'
                    },
                    returns: 'Individual',
                    example: 'neighbor = cell.nearestNeighbor(individual);'
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