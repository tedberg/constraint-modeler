module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    'plugin:vue/essential',
    '@vue/standard'
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    semi: [1, 'always'],
    ignoreComments: 0,
    skipBlankLines: 0,
    'no-multiple-empty-lines' : [0],
    'no-unused-vars' : [1],
    'one-var' : [0],
    'space-before-function-paren' : [0],
    'padded-blocks' : [0],
    'no-multi-spaces': [0],
    'no-trailing-spaces': [0],
    'spaced-comment': [0]
  },
  overrides: [
    {
      'files': ['*.vue'],
      'rules': {
        'indent': 'off'
      }
    }
  ],
  parserOptions: {
    parser: 'babel-eslint'
  }
};
