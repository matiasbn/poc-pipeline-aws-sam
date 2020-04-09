module.exports = {
  env: {
    es6: true,
    node: true,
    jest: true,
  },
  extends: [
    'airbnb-base',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  rules: {
    "one-var": ["error", "never"],
    "no-underscore-dangle": 0,
    "no-plusplus": 0,
    "import/no-dynamic-require": 0,
    "global-require": 0,
    "func-names": 0,
    "camelcase": 0
  },
  plugins: [
    "sort-requires"
  ]
};
