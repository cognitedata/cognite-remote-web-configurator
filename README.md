# Cognite Remote Configurator

## Available Scripts

### `yarn start`

Follow `Creating certificates` and create https certificates
Runs the app in the development mode.
Open [https://localhost:3000](https://localhost:3000) to view it in the browser.

### `yarn build`
Builds the app for production to the `build` folder.

#### Creating Certificates
Inorder to start the project you will need to create valid https certificates and make them trusted in certificate trust store

1. Install [Chocolatey](https://chocolatey.org/docs/installation)
2. Run `choco install mkcert` once it's installed. [mkcert](https://github.com/FiloSottile/mkcert)
3. Create a .cert folder in this project root and navigate from CMD and run `mkcert -install`
3. Now you should get prompt **Root Certificate was successfully installed**.
4. within .cert folder execute `mkcert localhost 127.0.0.1 ::1`.
5. Two files should be created as *.pem and *-key.pem. Rename them as cert.pem and key.pem respectively.
6. Now the certificates should be correctly created.