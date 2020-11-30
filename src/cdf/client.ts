import { CogniteClient } from "@cognite/sdk";


export class Client {
    public static sdk = new CogniteClient({ appId: 'json-configurator' });
}
