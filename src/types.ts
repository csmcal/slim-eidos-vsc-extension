// Interface for documenting constructor parameters
interface ConstructorParam {
    name: string;
    description: string;
    type: string;
    required: boolean;
}

// Interface for documenting object constructors
interface Constructor {
    description: string;
    parameters?: ConstructorParam[];
    example?: string;
}

// Interface for documenting object properties
interface Property {
    description: string;
    type: string;
    returns: string;
}

// Interface for documenting object methods
interface Method {
    description: string;
    parameters?: { [key: string]: string };
    returns?: string;
    example?: string;
    isStatic?: boolean;  // New property for static methods
}

// Interface for documenting object interfaces
interface EidosInterface {
    description: string;
    methods: { [key: string]: Method };
    properties?: { [key: string]: Property };
}

// Interface for documenting Eidos objects
interface BaseEidosItem {
    description: string;
    documentation?: string;  // Add detailed documentation support
}

interface EidosObject extends BaseEidosItem {
    category?: 'core' | 'simulation' | 'genetics' | 'spatial' | 'io' | 'meta';
    constructor?: Constructor;
    properties?: { [key: string]: Property };
    methods: { [key: string]: Method };
    implements?: string[];
    extends?: string;
}

interface EidosMethod extends BaseEidosItem {
    parameters?: { [key: string]: string };
    returns?: string;
    example?: string;
    isStatic?: boolean;  // Add static method support
}

// Main documentation interface
export interface EidosDocumentation {
    categories: {
        [key: string]: string[];
    };
    functions: { [key: string]: Method };
    objects: { [key: string]: EidosObject };
    interfaces?: { [key: string]: EidosInterface };
    metadata?: {
        version: string;
        lastUpdated: string;
        compatibleSLiMVersions: string[];
    };
}

interface HoverContent {
    signature?: string;
    description: string;
    parameters?: { [key: string]: string };
    returns?: string;
    example?: string;
    seeAlso?: string[];
}

function getTypeAnnotation(type: string): string {
    return type.startsWith('object<') 
        ? `[\`${type}\`](command:slim.showType?${encodeURIComponent(type)})` 
        : `\`${type}\``;
}

// Export all interfaces
export type { ConstructorParam, Constructor, Property, Method, EidosInterface, EidosObject, EidosMethod, HoverContent};
