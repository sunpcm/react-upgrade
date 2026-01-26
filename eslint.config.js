/**
 * ESLint v9 Flat Config
 *
 * - We keep the repo-wide rules in `@biu/eslint-config`.
 * - This root config mainly wires it up and adds Node-specific overrides for build/config files.
 */

module.exports = [
  // Replaces legacy `.eslintignore` (deprecated in ESLint v9)
  {
    ignores: [
      "**/dist/**",
      "**/.turbo/**",
      "**/.vite/**",
      "**/.webpack_cache/**",
      "**/node_modules/**",
    ],
  },

  // Base rules shared across apps/packages
  ...require("@biu/eslint-config"),

  // Override for webpack-app (React 16.8)
  {
    files: ["apps/react168/**/*.{ts,tsx,js,jsx}"],
    settings: {
      react: {
        version: "16.8",
      },
    },
    rules: {
      // React 16.8 需要在作用域中引入 React
      "react/react-in-jsx-scope": "error",
      // 禁用 React 18+ 的 deprecated 警告
      "react/no-deprecated": "off",
    },
  },

  // Override for React 17 app
  {
    files: ["apps/react17/**/*.{ts,tsx,js,jsx}"],
    settings: {
      react: {
        version: "17.0",
      },
    },
    rules: {
      // React 17+ 支持新的 JSX 转换，可以不导入 React
      "react/react-in-jsx-scope": "off",
      // ReactDOM.render 在 React 17 中仍然是正确的 API
      "react/no-deprecated": "off",
    },
  },

  // Override for React 18 apps (如果创建了)
  // {
  //   files: ["apps/react18-app/**/*.{ts,tsx,js,jsx}"],
  //   settings: {
  //     react: {
  //       version: "18.0",
  //     },
  //   },
  //   rules: {
  //     "react/react-in-jsx-scope": "off",
  //     "react/no-deprecated": "warn",
  //   },
  // },

  // Override for React 19 apps (如果创建了)
  // {
  //   files: ["apps/react19-app/**/*.{ts,tsx,js,jsx}"],
  //   settings: {
  //     react: {
  //       version: "19.0",
  //     },
  //   },
  //   rules: {
  //     "react/react-in-jsx-scope": "off",
  //     "react/no-deprecated": "error", // React 19 严格要求使用新 API
  //   },
  // },
];
