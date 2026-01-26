/**
 * ESLint config for react17 (React 17.0)
 *
 * Override shared config for React 17 specific rules
 */

module.exports = [
  // Import shared base config
  ...require("@biu/eslint-config"),

  // Override for React 17
  {
    files: ["src/**/*.{ts,tsx,js,jsx}"],
    settings: {
      react: {
        version: "17.0", // Specify React 17
      },
    },
    rules: {
      // React 17 支持新的 JSX 转换，不需要导入 React
      "react/react-in-jsx-scope": "off",

      // ReactDOM.render 在 React 17 中仍然是推荐的 API
      // React 18 才改用 createRoot
      "react/no-deprecated": "off",
    },
  },
];
