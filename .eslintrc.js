module.exports = {
  env: { browser: true, es6: true, node: true },
  parser: 'babel-eslint',
  parserOptions: { sourceType: 'module' },
  extends: 'standard',
  globals: {
    NODE_ENV: false,
  },
  plugins: [
    'standard',
    'promise'
  ],
  rules: {
    'no-undef': ['error'],
    'max-len': ['off'],
    'require-jsdoc': ['off'],
    'padded-blocks': ['off'],
    'no-var': ['error'],
    'comma-dangle': ['warn', 'always-multiline'],
    'object-curly-spacing': [
      'error', 'always', { arraysInObjects: true, objectsInObjects: true },
    ],
    'template-curly-spacing': [
      'error', 'always'
    ],
    'space-before-function-paren': [
      'error', { anonymous: 'always', named: 'never', asyncArrow: 'always'}
    ]
  }
};
