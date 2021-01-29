export interface IOpenApiSchema {
  components: any;
  info: {
    title: string;
    version: string;
  };
  openapi: string;
  paths: Object;
  servers: Array<any>;
}
