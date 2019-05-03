# Eesti Interneti Sihtasutuse Registreerija Portaal

### Kasutatud 📦
 - Node.js: [node 8 või 10](https://nodejs.org/en/)
 - Core: [React v16](https://www.npmjs.com/package/react), [Redux](https://www.npmjs.com/package/redux), [React Router v4](https://www.npmjs.com/package/react-router), [React Intl](https://github.com/yahoo/react-intl)
 - Code: ES2017+ standard modern javascript
 - Server: [express v4](https://www.npmjs.com/package/express)
 - Logging: [winston](https://www.npmjs.com/package/winston)
 - Bundler: [Parcel](https://parceljs.org/)

### Automaattestid ja linting
 - Syntax checking (aka linting) with [eslint](https://www.npmjs.com/package/eslint)
 - Unit testing with [jest](http://facebook.github.io/jest/)
 - End to end/integration testing with [cypress](https://www.cypress.io/)

## Ülesseadmine
- Sea üles mongoDB
- Loo .env.example põhjal .env failid.
- Muuda ```PORT``` erinevate keskkondade jaoks
    - Development: ```.env.development```
    - Production: ```.env.production```
    - Test: ```.env.test```

## Esmane käivitamine
```console
npm i
npm run prod
```

## NPM Skriptid

##### Arenduskeskkonna ülesseadmise käsk
```npm run dev```
##### Produktsiooni keskkonna ülesseadmise käsk
```npm run prod```
##### Automaattestide käsud (Linting, Unit ja e2e testid)
```npm run test```

Saab ka jooksutada eraldi: 
- ```npm run lint```
- ```npm run test:unit```
- ```npm run test:e2e``` - edit cypress.json baseUrl before use

##### Testide jälgimine
```npm run test:watch```

Kasutada arenduse ajal koos ```npm run dev```

```npm run test:e2e:dev```
Use this when authoring e2e tests. ```npm run test:e2e``` runs the tests in headless mode and handles the build + running of the app which is great for test runs and CI but is not optimal for developing and debugging. To develope e2e tests 
 - In a terminal window, start up the app with ```npm run prod```
 - In a second terminal window, open the cypress UI with ```npm run test:e2e:dev```

##### TODO helper
```npm run todo```


## MONGODB commandid
#### Esmasel sisselogimisel MongoDB-sse
```mongo```
```use admin```
#### Loo "root" kasutaja
```
db.createUser(
{
    user: "root",
    pwd: "pass",
    roles: [ "root" ]
})
```
#### Käivitamine
```mongod --auth --port 27017 --dbpath ~/mongodb/db```
#### Sisse logimine
```mongo -u root -p pass --authenticationDatabase admin```
#### Andmebaasi loomine
```use ANDMEBAASI_NIMI ```
#### Kasutaja loomine andmebaasile
```
db.createUser(
    {
        user: "user",
        pwd: "pass",
        roles: [ { role: "readWrite", db: "EIS_Client" }, { role: "dbAdmin", db: "EIS_Client" }]
    }
)
```
NB! Sama andmebaasi nimi ning kasutaja ja parool märgitakse ära ka .env faili.