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
        },

        // Add these core language functions
        'size': {
            description: 'Returns the length of a vector or string',
            parameters: {
                'x': 'Vector or string to measure'
            },
            returns: 'integer',
            example: 'size(c(1,2,3)); // 3'
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
        
        // Add these mathematical functions
        'log': {
            description: 'Calculates the natural logarithm',
            parameters: {
                'x': 'Numeric value'
            },
            returns: 'float',
            example: 'log(2.718); // ~1.0'
        },
        'exp': {
            description: 'Calculates e raised to the power',
            parameters: {
                'x': 'Power to raise e to'
            },
            returns: 'float',
            example: 'exp(1); // 2.718...'
        },

        // Add these type checking functions
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

        // Flow control functions
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

        // Vector manipulation
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

        // Additional math functions
        'round': {
            description: 'Rounds numbers to specified decimal places',
            parameters: {
                'x': 'Number(s) to round',
                'digits': '(optional) Number of decimal places'
            },
            returns: 'float',
            example: 'round(3.14159, 2); // 3.14'
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

        // Trigonometric functions
        'sin': {
            description: 'Calculates the sine of an angle (in radians)',
            parameters: {
                'x': 'Angle in radians'
            },
            returns: 'float',
            example: 'sin(3.14159/2); // ~1.0'
        },
        'cos': {
            description: 'Calculates the cosine of an angle (in radians)',
            parameters: {
                'x': 'Angle in radians'
            },
            returns: 'float',
            example: 'cos(0.0); // 1.0'
        },
        
        // Additional initialization functions
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

        // Additional statistical functions
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

        // Matrix operations
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

        // Advanced vector operations
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

        // Tree sequence recording
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

        // Advanced I/O
        'writeFile': {
            description: 'Writes data to a file with options',
            parameters: {
                'path': 'File path',
                'contents': 'Data to write',
                'append': '(optional) Whether to append',
                'compress': '(optional) Whether to compress output'
            },
            returns: 'void',
            example: 'writeFile("data.gz", "content", F, T);'
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

        // Additional math functions
        'log10': {
            description: 'Calculates base-10 logarithm',
            parameters: {
                'x': 'Numeric value'
            },
            returns: 'float',
            example: 'log10(100); // 2.0'
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

        // Advanced vector operations
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

        // Advanced mathematical functions
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

        // Matrix math operations
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

        // Enhanced I/O operations
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

        // Advanced vector statistics
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
        'rank': {
            description: 'Returns ranks of elements in a vector',
            parameters: {
                'x': 'Vector to rank',
                'ties.method': '(optional) Method for handling ties ("average", "min", "max")'
            },
            returns: 'numeric[]',
            example: 'rank(c(3,1,4,1,5)); // c(3,1.5,4,1.5,5)'
        },

        // Advanced mathematical operations
        'gamma': {
            description: 'Calculates the gamma function',
            parameters: {
                'x': 'Numeric value'
            },
            returns: 'float',
            example: 'gamma(5); // 24'
        },
        'lgamma': {
            description: 'Calculates the natural log of the gamma function',
            parameters: {
                'x': 'Numeric value'
            },
            returns: 'float',
            example: 'lgamma(5); // ~3.178'
        },

        // Enhanced tree sequence operations
        'treeSeqSimplify': {
            description: 'Simplifies tree sequence with advanced options',
            parameters: {
                'ts': 'Tree sequence object',
                'samples': 'Sample nodes to preserve',
                'filter_sites': '(optional) Whether to filter sites',
                'filter_populations': '(optional) Whether to filter populations'
            },
            returns: 'TreeSequence',
            example: 'treeSeqSimplify(ts, samples, T, T);'
        },
        'treeSeqMutations': {
            description: 'Extracts mutation information from tree sequence',
            parameters: {
                'ts': 'Tree sequence object',
                'site_id': '(optional) Specific site to query'
            },
            returns: 'dictionary',
            example: 'treeSeqMutations(ts);'
        },

        // Advanced I/O operations
        'writeTable': {
            description: 'Writes a matrix or data frame to a file',
            parameters: {
                'x': 'Data to write',
                'file': 'File path',
                'row.names': '(optional) Include row names',
                'col.names': '(optional) Include column names',
                'quote': '(optional) Quote strings',
                'sep': '(optional) Field separator'
            },
            returns: 'void',
            example: 'writeTable(data, "output.txt", T, T, T, "\t");'
        },
        'readTable': {
            description: 'Reads a table from a file with advanced options',
            parameters: {
                'file': 'File path',
                'header': '(optional) Has header',
                'sep': '(optional) Field separator',
                'skip': '(optional) Lines to skip',
                'comment.char': '(optional) Comment character'
            },
            returns: 'matrix',
            example: 'readTable("input.txt", T, "\t", 1, "#");'
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
                },
                'tag': {
                    description: 'Get or set a custom tag value for the individual',
                    parameters: {
                        'value': '(optional) New tag value'
                    },
                    returns: 'integer',
                    example: 'ind.tag = 5;'
                },
                'spatialPosition': {
                    description: 'Get or set spatial coordinates of the individual',
                    parameters: {
                        'x': 'X coordinate',
                        'y': 'Y coordinate',
                        'z': '(optional) Z coordinate'
                    },
                    returns: 'float[]',
                    example: 'ind.spatialPosition = c(0.5, 1.0);'
                },
                'relatedness': {
                    description: 'Calculates genetic relatedness with another individual',
                    parameters: {
                        'other': 'Individual to compare with'
                    },
                    returns: 'float',
                    example: 'ind1.relatedness(ind2);'
                },
                'getNearestNeighbors': {
                    description: 'Finds nearest neighboring individuals',
                    parameters: {
                        'count': 'Number of neighbors to find',
                        'maxDistance': '(optional) Maximum search distance'
                    },
                    returns: 'Individual[]',
                    example: 'ind.getNearestNeighbors(5, 1.0);'
                },
                'getInteractionValue': {
                    description: 'Gets interaction strength with another individual',
                    parameters: {
                        'other': 'Individual to interact with',
                        'interactionType': 'Type of interaction'
                    },
                    returns: 'float',
                    example: 'ind1.getInteractionValue(ind2, "i1");'
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
                },
                'sex': {
                    description: 'Sex of the individual ("M" or "F")',
                    returns: 'string'
                },
                'subpopulation': {
                    description: 'Subpopulation the individual belongs to',
                    returns: 'Subpopulation'
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
                },
                'containsMutations': {
                    description: 'Tests if genome contains specific mutations',
                    parameters: {
                        'mutations': 'Mutations to check for'
                    },
                    returns: 'logical[]',
                    example: 'genome1.containsMutations(muts);'
                },
                'mutationsOfType': {
                    description: 'Returns mutations of specified type',
                    parameters: {
                        'mutType': 'Mutation type to filter for'
                    },
                    returns: 'Mutation[]',
                    example: 'genome1.mutationsOfType(m1);'
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
                },
                'setSpatialBounds': {
                    description: 'Sets the spatial boundaries of the subpopulation',
                    parameters: {
                        'minX': 'Minimum X coordinate',
                        'maxX': 'Maximum X coordinate',
                        'minY': 'Minimum Y coordinate',
                        'maxY': 'Maximum Y coordinate'
                    },
                    returns: 'void',
                    example: 'p1.setSpatialBounds(0.0, 1.0, 0.0, 1.0);'
                },
                'setSubpopulationSize': {
                    description: 'Sets the target size of the subpopulation',
                    parameters: {
                        'size': 'New target size'
                    },
                    returns: 'void',
                    example: 'p1.setSubpopulationSize(500);'
                },
                'sampleIndividuals': {
                    description: 'Randomly samples individuals from the subpopulation',
                    parameters: {
                        'n': 'Number of individuals to sample',
                        'replace': '(optional) Whether to sample with replacement'
                    },
                    returns: 'Individual[]',
                    example: 'p1.sampleIndividuals(10);'
                },
                'defineSpatialMap': {
                    description: 'Defines a spatial map for the subpopulation',
                    parameters: {
                        'name': 'Name of the map',
                        'values': 'Matrix of values',
                        'interpolate': '(optional) Whether to interpolate values'
                    },
                    returns: 'void',
                    example: 'p1.defineSpatialMap("resources", matrix);'
                },
                'pointInBounds': {
                    description: 'Tests if a point is within subpopulation bounds',
                    parameters: {
                        'x': 'X coordinate',
                        'y': 'Y coordinate'
                    },
                    returns: 'logical',
                    example: 'p1.pointInBounds(0.5, 0.5);'
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
                },
                'spatialBounds': {
                    description: 'Current spatial boundaries of the subpopulation',
                    returns: 'float[]'
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
        },
        'GenomicElementType': {
            methods: {
                'setMutationTypes': {
                    description: 'Sets mutation types and their proportions',
                    parameters: {
                        'mutTypes': 'Vector of mutation types',
                        'proportions': 'Vector of proportions'
                    },
                    returns: 'void',
                    example: 'g1.setMutationTypes(c(m1,m2), c(0.8,0.2));'
                }
            },
            properties: {
                'id': {
                    description: 'Identifier of the genomic element type',
                    returns: 'string'
                },
                'mutationTypes': {
                    description: 'Vector of mutation types used by this element',
                    returns: 'MutationType[]'
                }
            }
        },
        'TreeSequence': {
            methods: {
                'simplify': {
                    description: 'Simplifies the recorded tree sequence',
                    parameters: {
                        'preserveNodes': '(optional) Nodes to preserve'
                    },
                    returns: 'void',
                    example: 'ts.simplify(individuals.genomes);'
                },
                'nodeTable': {
                    description: 'Returns the node table of the tree sequence',
                    returns: 'dictionary',
                    example: 'ts.nodeTable();'
                },
                'mutationTable': {
                    description: 'Returns the mutation table of the tree sequence',
                    returns: 'dictionary',
                    example: 'ts.mutationTable();'
                },
                'siteTable': {
                    description: 'Returns the site table of the tree sequence',
                    returns: 'dictionary',
                    example: 'ts.siteTable();'
                },
                'individualTable': {
                    description: 'Returns the individual table of the tree sequence',
                    returns: 'dictionary',
                    example: 'ts.individualTable();'
                },
                'computeStatistics': {
                    description: 'Computes population genetic statistics',
                    parameters: {
                        'statistic': 'Name of statistic to compute',
                        'windows': '(optional) Windows for computation',
                        'mode': '(optional) Computation mode'
                    },
                    returns: 'numeric[]',
                    example: 'ts.computeStatistics("diversity", windows);'
                }
            },
            properties: {
                'numTrees': {
                    description: 'Number of trees in the sequence',
                    returns: 'integer'
                },
                'sequenceLength': {
                    description: 'Length of the genomic sequence',
                    returns: 'float'
                }
            }
        },
        'Matrix': {
            methods: {
                'dim': {
                    description: 'Gets dimensions of the matrix',
                    returns: 'integer[2]',
                    example: 'matrix.dim();'
                },
                'transpose': {
                    description: 'Transposes the matrix',
                    returns: 'matrix',
                    example: 'matrix.transpose();'
                },
                'multiply': {
                    description: 'Multiplies with another matrix',
                    parameters: {
                        'other': 'Matrix to multiply with'
                    },
                    returns: 'matrix',
                    example: 'matrix1.multiply(matrix2);'
                },
                'eigenvalues': {
                    description: 'Calculates eigenvalues of the matrix',
                    returns: 'numeric[]',
                    example: 'matrix.eigenvalues();'
                },
                'inverse': {
                    description: 'Calculates inverse of the matrix',
                    returns: 'matrix',
                    example: 'matrix.inverse();'
                },
                'rowSums': {
                    description: 'Calculates sums of each row',
                    returns: 'numeric[]',
                    example: 'matrix.rowSums();'
                },
                'colSums': {
                    description: 'Calculates sums of each column',
                    returns: 'numeric[]',
                    example: 'matrix.colSums();'
                }
            },
            properties: {
                'isSymmetric': {
                    description: 'Whether the matrix is symmetric',
                    returns: 'logical'
                },
                'diagonal': {
                    description: 'Diagonal elements of the matrix',
                    returns: 'numeric[]'
                }
            }
        },
        'File': {
            methods: {
                'seek': {
                    description: 'Moves file pointer to specified position',
                    parameters: {
                        'offset': 'Byte offset',
                        'origin': '(optional) Reference position'
                    },
                    returns: 'void',
                    example: 'file.seek(100);'
                },
                'flush': {
                    description: 'Flushes file buffer to disk',
                    returns: 'void',
                    example: 'file.flush();'
                },
                'readLines': {
                    description: 'Reads specified number of lines',
                    parameters: {
                        'n': '(optional) Number of lines to read'
                    },
                    returns: 'string[]',
                    example: 'file.readLines(10);'
                },
                'readBlock': {
                    description: 'Reads a block of bytes from file',
                    parameters: {
                        'size': 'Number of bytes to read',
                        'offset': '(optional) Starting position'
                    },
                    returns: 'string',
                    example: 'file.readBlock(1024, 0);'
                },
                'writeBlock': {
                    description: 'Writes a block of bytes to file',
                    parameters: {
                        'data': 'Data to write',
                        'offset': '(optional) Starting position'
                    },
                    returns: 'void',
                    example: 'file.writeBlock(data, 1024);'
                },
                'compress': {
                    description: 'Compresses file contents',
                    parameters: {
                        'algorithm': 'Compression algorithm ("gzip", "bzip2")',
                        'level': '(optional) Compression level'
                    },
                    returns: 'void',
                    example: 'file.compress("gzip", 9);'
                }
            },
            properties: {
                'position': {
                    description: 'Current position in file',
                    returns: 'integer'
                },
                'size': {
                    description: 'Size of file in bytes',
                    returns: 'integer'
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