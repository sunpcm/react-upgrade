/**
 * ESLint config for react18 (React 18.3)
 *
 * Override shared config for React 18 specific rules
 */

module.exports = [
  // Import shared base config
  ...require("@biu/eslint-config"),

  // Override for React 18
  {
    files: ["src/**/*.{ts,tsx,js,jsx}"],
    settings: {
      react: {
        version: "18.3", // Specify React 18
      },
    },
    rules: {
      // React 18 支持新的 JSX 转换，不需要导入 React
      "react/react-in-jsx-scope": "off",

      // React 18 应该使用 createRoot 而不是 ReactDOM.render
      "react/no-deprecated": "warn",
    },
  },
];
