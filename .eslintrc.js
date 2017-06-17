module.exports = {
    env: { browser: true, es6: true, node: true },
    parser: 'babel-eslint',
    parserOptions: { sourceType: 'module' },
    extends: 'google',
    plugins: [
        'standard',
        'promise'
    ],
    rules: {
        'no-undef': ['error'],
        'max-len': ['off'],
        'require-jsdoc': ['off'],
        'padded-blocks': ['off'],
        'object-curly-spacing': [
            'error', 'always', { arraysInObjects: true, objectsInObjects: true },
        ],
        'template-curly-spacing': [
            'error', 'always'
        ],
    }
};
