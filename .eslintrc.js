module.exports = {
  //need babel-eslint to allow class static props
  "parser": "babel-eslint",
  "extends": [ "eslint:recommended", "plugin:react/recommended", "airbnb", "prettier", "prettier/react"],
  "plugins": [ "react", "jest", "json", "prettier" ],
  "env": {
      "browser": true,
      "commonjs": true,
      "es6": true,
      "node": true,
      "jest/globals": true
  },
  "globals":{
    "window": true,
    "apiHost": true,
    "window": true,
    "document": true,
    "localStorage": true,
    "FormData": true,
    "FileReader": true,
    "Blob": true,
    "navigator": true,
    //unit tests
    "expect": true,
    "shallow": true,
    "render": true,
    "mount": true,
    "jest": true,
    "beforeAll": true,
    //e2e tests
    "cy": true,
    "Cypress": true,
    //mock file variables
    "mockUser": true,
    "mockDomains": true,
    "mockContacts": true,
    "mockMainMenu": true,
    "mockFooterMenu": true,
  },
  "parserOptions": {
      "ecmaFeatures": {
          "experimentalObjectRestSpread": true,
          "jsx": true
      },
      "sourceType": "module"
  },
  "rules": {
      //general
      "indent": [ "error", 2 ],
      "quotes": [ "error", "single" ],
      "semi": [ "error", "always" ],
      "no-console": ["error", { allow: ["warn", "error"] }],
      //react
      "react/react-in-jsx-scope": "off",
      //jest
      "jest/no-disabled-tests": "warn",
      "jest/no-focused-tests": "error",
      "jest/no-identical-title": "error",
      "jest/prefer-to-have-length": "warn",
      "jest/valid-expect": "error",
      "react/jsx-filename-extension": [
        1,
        {
          "extensions": [".js", ".jsx"]
        }
      ],
      "react/prop-types": 0,
      "no-underscore-dangle": 0,
      "import/imports-first": ["error", "absolute-first"],
      "import/newline-after-import": "error",
      "jsx-a11y/label-has-for": [ 2, {
        "required": {
          "every": [ "id" ]
        }
      }],
      "jsx-a11y/label-has-associated-control": [ 2, {
        "controlComponents": ["Checkbox"],
        "depth": 2,
      }],
  }
};