import { Versioned3DFile } from "@cognite/sdk/dist/src";

export interface IOpenApiSchema {
  components: any;
  info: {
    title: string;
    version: Versioned3DFile;
  };
  openapi: string;
  paths: Object;
  servers: Array<any>;
}
