export interface DocumentationItem {
    description: string;
    parameters?: { [key: string]: string };
    returns?: string;
    example?: string;
}

export interface SLiMObject {
    description: string;
    methods: { [key: string]: DocumentationItem };
    properties: { [key: string]: DocumentationItem };
}

export interface EidosDocumentation {
    functions: { [key: string]: DocumentationItem };
    objects: { [key: string]: SLiMObject };
}