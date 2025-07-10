/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  extends: [
    'next/core-web-vitals', // Next.js base rules
    'plugin:prettier/recommended', // Enables eslint-plugin-prettier + disables conflicting rules
  ],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'error', // Show Prettier formatting issues as errors
  },
};
