import { builtinModules } from 'module';
import globals from 'globals';

export default [
  {
    ignores: ["node_modules/**"],
  },
  {
    files: ["**/*.js", "**/*.jsx"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        ...builtinModules.reduce((acc, mod) => {
          acc[mod] = "readonly";
          return acc;
        }, {}),
        ...globals.browser,
        ...globals.node
      }
    },
    rules: {
      "no-undef": "error",
      "quotes": ["warn", "double"],
      "no-console": "error",
      "semi": ["error", "always"],
      "no-var": "warn",
      "func-names": "error",
      "no-trailing-spaces": "warn",
      "space-before-blocks": ["error", "always"],
      "quote-props": ["error", "consistent"],
      "no-unused-vars": "error",
      "indent": ["error", 2],
      "no-eval": "error",
      "camelcase": ["warn", { "properties": "never" }],
      "no-multiple-empty-lines": ["error", { "max": 1 }]
    }
  }
];
