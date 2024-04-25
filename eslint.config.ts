import antfu from '@antfu/eslint-config'

export default antfu({
  stylistic: {
    indent: 2,
    quotes: 'single',
  },
  typescript: true,
}, {
  rules: {
    'ts/no-unused-vars': 'off',
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': [
      'warn',
      {
        vars: 'all',
        varsIgnorePattern: '^_',
        args: 'after-used',
        argsIgnorePattern: '^_',
      },
    ],

    'node/prefer-global/process': 'off',
    'node/prefer-global/buffer': 'off',

    'import/order': [
      2,
      {
        'pathGroups': [
          {
            pattern: '~/**',
            group: 'external',
            position: 'after',
          },
        ],
        'alphabetize': { order: 'asc', caseInsensitive: false },
        'newlines-between': 'always-and-inside-groups',
        'warnOnUnassignedImports': true,
      },
    ],
  },
})
