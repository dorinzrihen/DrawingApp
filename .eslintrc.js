module.exports = {
  root: true,
  env: {
    // 'react-native/react-native' env if you prefer
    browser: true,
    es6: true,
    node: true,
  },
  extends: [
    // Base ESLint recommended rules
    'eslint:recommended',
    // (Optional) If you want the Airbnb style guide:
    // 'airbnb',
    // Add React recommended rules
    'plugin:react/recommended',
    // Add React Native recommended rules
    'plugin:react-native/all',
    // (Optional) Integrate Prettier to auto-format
    'plugin:prettier/recommended',
  ],
  plugins: [
    'react',
    'react-native',
    // 'prettier' if using Prettier
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    // ECMAScript version: 2020 allows for optional chaining, etc.
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  rules: {
    /*
      You can fine-tune any of the recommended rules.
      Examples:
    */

    // Enforce consistent indentation (spaces vs tabs)
    'indent': ['error', 2],
    // Enforce single quotes for strings
    'quotes': ['error', 'single', { avoidEscape: true }],
    // No unused variables
    'no-unused-vars': ['warn'],
    // No console logs (or warn)
    'no-console': 'warn',
    
    // React
    'react/prop-types': 'off', // If you're not using prop-types
    'react/display-name': 'off', // Typically turned off in RN

    // React Native
    // 'react-native/no-inline-styles': 'error', // can help discourage inline styling
    'react-native/no-raw-text': 'off', // you might enable this if you want all text wrapped in <Text> components

    // If using Prettier:
    // 'prettier/prettier': 'error',
  },
  settings: {
    react: {
      version: 'detect', // Tells eslint-plugin-react to automatically detect the React version
    },
  },
};
