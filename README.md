# Getting Started with the Project

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

#### Creating Certificates
Inorder to start the project you will need to create valid https certificates and make them trusted in certificate trust store

1. Install [Chocolatey](https://chocolatey.org/docs/installation)
2. Run `choco install mkcert` once it's installed. [mkcert](https://github.com/FiloSottile/mkcert)
3. Create a .cert folder in this project root and navigate from CMD and run `mkcert -install`
3. Now you should get prompt **Root Certificate was successfully installed**.
4. within .cert folder execute `mkcert localhost 127.0.0.1 ::1`.
5. Two files should be created as *.pem and *-key.pem. Rename them as cert.pem and key.pem respectively.
6. Now the certificates should be correctly created.

### `yarn test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
# json-validator

## Limitations
 - Schema should have only 2 deep levels
 - Descriptions must be unique
