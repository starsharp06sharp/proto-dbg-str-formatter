export class DomTree {
    key: string;
    value: string | DomTree[];
}

export class Parser {
    parse(input: string): DomTree[];
}

export declare let parser: Parser;
