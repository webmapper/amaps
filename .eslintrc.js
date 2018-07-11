module.exports = {
  "root": true,
  "env": {
    "browser": true,
    "es6": true
  },
  "globals": {
    "ENV": true
  },
  "extends": "airbnb",
  "parserOptions": {
    "sourceType": "module",
    "ecmaVersion": 2017
  },
  "rules": {
    "arrow-parens": ["error", "always"],
    "comma-dangle": ["error", "never"],
    "no-nested-ternary": "off",
    "no-underscore-dangle": ["error", { "allow": [] }],
    "linebreak-style": "off",
  }
}
