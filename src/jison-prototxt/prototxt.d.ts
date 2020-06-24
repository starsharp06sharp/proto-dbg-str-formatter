export class DomTree {
    key: string;
    value: string | DomTree[];
}

export declare function parse(text: string): DomTree[];
