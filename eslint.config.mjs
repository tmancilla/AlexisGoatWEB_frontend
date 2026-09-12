import { builtinModules } from 'module';

export default [
  {
    ignores: ["node_modules/**"],
  },
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      globals: {
        ...builtinModules.reduce((acc, mod) => {
          acc[mod] = "readonly";
          return acc;
        }, {}),
        browser: true,
        node: true
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
