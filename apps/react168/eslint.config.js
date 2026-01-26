/**
 * ESLint config for webpack-app (React 16.8)
 *
 * Override shared config to disable React 18+ specific warnings
 */

module.exports = [
  // Import shared base config
  ...require("@biu/eslint-config"),

  // Override for React 16.8
  {
    files: ["src/**/*.{ts,tsx,js,jsx}"],
    settings: {
      react: {
        version: "16.8", // Specify React 16.8
      },
    },
    rules: {
      // React 16.8 需要在作用域中引入 React
      "react/react-in-jsx-scope": "error",

      // 禁用 React 18+ 的 deprecated 警告
      // 因为 ReactDOM.render 在 React 16.8 中是正确的 API
      "react/no-deprecated": "off",
    },
  },
];
