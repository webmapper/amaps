module.exports = {
  "root": true,
  "env": {
    "es6": true
  },
  "globals": {
    "ENV": true
  },
  "extends": "eslint:recommended",
  "parserOptions": {
    "sourceType": "module",
    "ecmaVersion": 2017
  },
  "rules": {
    "linebreak-style": "off",
    "comma-dangle": "off",
    "max-len": ["error", { "code": 160 }],
    "no-else-return": "off",
    "eqeqeq": ["error", "always", { "null": "ignore" }],
    "arrow-body-style": "off", 
    "no-plusplus": "off",
    "no-undef": "off" 
  }
}
