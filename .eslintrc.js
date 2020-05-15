module.exports = {
  root: true,
  env: {
    node: true,
    es6: true
  },
  "parserOptions": {
    "sourceType": "module",
    "ecmaVersion": 2019
  },
  extends: [
    "eslint:recommended",
    "plugin:prettier/recommended"
  ],
  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-unused-vars": "off",
    "prettier/prettier": [
      "error",
      {
        "singleQuote": true,
        "trailingComma": "es5",
        "printWidth": 120,
      }
    ]
  }
};
