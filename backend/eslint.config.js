const globals = require("globals");

module.exports = [
  {
    files: [ "**/*.js" ],
    ignores: [ "node_modules/**" ],

    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs",
      globals: {
        ...globals.node,
      },
    },

    rules: {
      "no-unused-vars": [ "warn", { argsIgnorePattern: "^_" } ],
      "no-console": "off",
      "semi": [ "error", "always" ],
      "quotes": [ "error", "double" ],
    },
  },
];
