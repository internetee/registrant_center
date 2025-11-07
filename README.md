[![Maintainability](https://qlty.sh/gh/internetee/projects/registrant_center/maintainability.svg)](https://qlty.sh/gh/internetee/projects/registrant_center)
[![Code Coverage](https://qlty.sh/gh/internetee/projects/registrant_center/coverage.svg)](https://qlty.sh/gh/internetee/projects/registrant_center)

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
- Unit Testing: [Vitest](https://vitest.dev/)
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
npm start          # Start development server with hot reload and linting
npm run dev        # Start Vite development server
npm run dev:server # Start backend server in development mode
```

### Building
```bash
npm run build     # Build the application for production
npm run preview   # Preview the production build locally
```

### Production
```bash
npm run serve     # Start production server
```

### Linting
```bash
npm run lint      # Run ESLint check
npm run lint:fix  # Fix ESLint issues automatically
npm run lint:watch # Watch files and run linting on changes
```

### Testing
```bash
npm run test      # Run linting and unit tests
npm run coverage  # Run tests with coverage report
npm run test:e2e  # Run end-to-end tests
npm run cypress:open  # Open Cypress test runner
npm run cypress:run  # Run Cypress tests in headless mode
```

### Deployment
```bash
npm run deploy    # Full deployment process: test, build, e2e tests, and serve
```
