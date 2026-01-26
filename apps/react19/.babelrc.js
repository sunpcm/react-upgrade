module.exports = function (api) {
  api.cache.using(() => process.env.NODE_ENV);

  const isDevelopment = process.env.NODE_ENV === "development";
  const isProduction = process.env.NODE_ENV === "production";

  return {
    presets: [
      [
        "@babel/preset-env",
        {
          useBuiltIns: "usage",
          corejs: { version: 3, proposals: true },
          modules: false,
          debug: isDevelopment,
        },
      ],
      [
        "@babel/preset-react",
        {
          // React 19 继续使用新的 JSX 转换
          runtime: "automatic",
          development: isDevelopment,
          ...(isProduction && { removeProperties: { removeImport: true } }),
        },
      ],
      "@babel/preset-typescript",
    ],
    plugins: [
      // ✅ React Fast Refresh（React 17+ 支持，React 19 继续支持）
      isDevelopment && "react-refresh/babel",

      // ✅ transform-runtime
      [
        "@babel/plugin-transform-runtime",
        {
          helpers: true,
          regenerator: true,
          skipHelperValidation: true,
        },
      ],
    ].filter(Boolean),
  };
};
