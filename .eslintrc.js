module.exports = {
  env: {
    es2021: true,
    node: true,
  },
  extends: ['airbnb-base', 'prettier'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
  plugins: ['@typescript-eslint'],
  rules: {
    'import/extensions': 0,
    'import/prefer-default-export': 0,
    'comma-dangle': [
      'error',
      {
        arrays: 'only-multiline',
        objects: 'only-multiline',
        imports: 'only-multiline',
        exports: 'only-multiline',
      },
    ],
    'import/no-extraneous-dependencies': 0,
    'class-methods-use-this': 0,
    'no-param-reassign': 0,
    'implicit-arrow-linebreak': 0,
    'no-underscore-dangle': 0,
  },
};
