import { ITemplateNode } from "../../validator/interfaces/ITemplateNode";
import { AutoCompleteEnumType } from "../enums/AutoCompleteElementType";

export class CogniteOpenApiSchemaValidator {
    public errors:{ path: string, message: string }[] =  [];

    public compile(schema: any): (json: any) => boolean {
        this.validate.bind(this);

        return this.validate;
    }

    public validate(json: any): boolean {
        this.errors.push({ path: "Random path", message: "random error"});
        return true;
    }

    public autoComplete(text: string, path: string, keyOrValue: AutoCompleteEnumType, json: any): Promise<string[]> {
        return Promise.resolve([]);
    }

    public templateOptions(path: string, json: any): ITemplateNode[] {
        return [];
    }

    public updateJson(path: string, json: any, replacement: any): any{
        return "";
    }
}