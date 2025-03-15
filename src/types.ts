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
}

// Interface for documenting object interfaces
interface EidosInterface {
    description: string;
    methods: { [key: string]: Method };
    properties?: { [key: string]: Property };
}

// Interface for documenting Eidos objects
interface EidosObject {
    description: string;
    constructor?: Constructor;
    properties?: { [key: string]: Property };
    methods: { [key: string]: Method };
    implements?: string[];  // Interfaces this object implements
    extends?: string;       // Parent class this object extends
}

// Main documentation interface
export interface EidosDocumentation {
    functions: { [key: string]: Method };
    objects: { [key: string]: EidosObject };
    interfaces?: { [key: string]: EidosInterface };
}

// Export all interfaces
export type { ConstructorParam, Constructor, Property, Method, EidosInterface, EidosObject };