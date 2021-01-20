import { BaseNode } from "../nodes/BaseNode";

export interface ITemplateNode {
    key: string;
    data: Record<string, unknown>;
    node: BaseNode;
    sample: any;
}