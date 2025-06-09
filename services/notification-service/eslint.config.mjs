
import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
  {
    files: ['**/*.ts'],
    languageOptions: {
      sourceType: 'module', // Use ES modules
      globals: {
        ...globals.node, // Node.js globals (e.g., process, __dirname)
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      ...pluginJs.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
      '@typescript-eslint/no-require-imports': 'off', // Allow require if needed for legacy code
      'no-undef': 'error', // Ensure undefined variables are caught
    },
  },
  {
    // Ignore compiled files
    files: ['dist/**/*'],
    ignores: ['dist/**/*'],
  },
];
