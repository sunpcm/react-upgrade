/**
 * ESLint config for react19 (React 19.0)
 *
 * Override shared config for React 19 specific rules
 */

module.exports = [
  // Import shared base config
  ...require("@biu/eslint-config"),

  // Override for React 19
  {
    files: ["src/**/*.{ts,tsx,js,jsx}"],
    settings: {
      react: {
        version: "19.0", // Specify React 19
      },
    },
    rules: {
      // React 19 支持新的 JSX 转换，不需要导入 React
      "react/react-in-jsx-scope": "off",

      // React 19 严格要求使用现代 API
      "react/no-deprecated": "error",
    },
  },
];
