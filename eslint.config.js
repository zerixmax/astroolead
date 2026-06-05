import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintPluginAstro from 'eslint-plugin-astro';
import jsxA11y from 'eslint-plugin-jsx-a11y';

export default tseslint.config(
  // JS recommended
  eslint.configs.recommended,

  // TS recommended
  ...tseslint.configs.recommended,

  // Astro recommended
  ...eslintPluginAstro.configs.recommended,

  // Astro accessibility rules
  ...eslintPluginAstro.configs['jsx-a11y-recommended'],

  // Overrides for Astro files to parse TypeScript scripts inside them
  {
    files: ['**/*.astro'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: ['.astro'],
      },
    },
  },

  // Standard JSX accessibility rules for standard JavaScript and TypeScript files
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      'jsx-a11y': jsxA11y,
    },
    rules: {
      ...jsxA11y.flatConfigs.recommended.rules,
    },
  },

  // Directories to ignore
  {
    ignores: ['dist/', '.astro/', 'node_modules/'],
  }
);
