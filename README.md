# EESTI INTERNETI SA - Registrant center

### Kasutatud 📦
 - Node.js: [node 14](https://nodejs.org/en/)
 - Core: [React v16](https://www.npmjs.com/package/react), [Redux](https://www.npmjs.com/package/redux), [React Router v4](https://www.npmjs.com/package/react-router), [React Intl](https://github.com/yahoo/react-intl)
 - Code: ES2017+ standard modern javascript
 - Server: [express v4](https://www.npmjs.com/package/express)
 - Logging: [winston](https://www.npmjs.com/package/winston)
 - Bundler: [CRA](https://github.com/facebook/create-react-app)

### Tests and linting
 - Syntax checking (aka linting) with [eslint](https://www.npmjs.com/package/eslint)
 - Unit testing with [jest](http://facebook.github.io/jest/)
 - End to end/integration testing with [cypress](https://www.cypress.io/)

## Setup
- Create .env file from .env.example

```
npm i
npm run deploy
```

## Scripts

##### Start development environment
```npm start```
##### Start production environment
```npm run serve```
##### Run tests
```npm run test```
```npm run test:e2e``` - edit cypress.json baseUrl before use
