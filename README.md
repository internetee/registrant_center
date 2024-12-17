# EESTI INTERNETI SA - Registrant Center

## Tech Stack 🛠

### Core Technologies
- Node.js: [Node 22](https://nodejs.org/en/)
- Frontend: 
  - [React v18](https://www.npmjs.com/package/react)
  - [Redux](https://www.npmjs.com/package/redux)
  - [React Router v7](https://www.npmjs.com/package/react-router)
  - [React Intl](https://github.com/yahoo/react-intl)
- Backend: [Express v4](https://www.npmjs.com/package/express)
- Logging: [Winston v3](https://www.npmjs.com/package/winston)

### Development Tools
- Bundler: [Vite v6](https://github.com/vitejs/vite)
- Language: Modern JavaScript (ES2020+)
  - Full ESM support (import/export)
  - Latest ECMAScript features
  - TypeScript and JSX support
  
### Quality Assurance
- Linting: [ESLint](https://www.npmjs.com/package/eslint)
- Unit Testing: [Jest](http://facebook.github.io/jest/)
- E2E Testing: [Cypress](https://www.cypress.io/)

## Getting Started 🚀

### Prerequisites
- Node.js 22 or higher
- npm 10 or higher

### Setup
1. Clone the repository
2. Create `.env` file:
   ```bash
   cp .env.example .env
   ```
3. Install dependencies and deploy:
   ```bash
   npm i
   npm run deploy
   ```

## Available Scripts 📜

### Development
```bash
npm start        # Start development environment
```

### Production
```bash
npm run serve    # Start production environment
```

### Testing
```bash
npm run test     # Run unit tests
npm run test:e2e # Run end-to-end tests (update cypress.json baseUrl first)
```
