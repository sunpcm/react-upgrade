module.exports = function (api) {
  api.cache.using(() => process.env.NODE_ENV);

  const isDevelopment = process.env.NODE_ENV === "development";
  // const isProduction = process.env.NODE_ENV === "production";

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
          // React 16.8 使用经典 JSX 转换
          runtime: "classic",
          development: isDevelopment,
        },
      ],
      "@babel/preset-typescript",
    ],
    plugins: [
      // ⚠️ React Fast Refresh 不支持 React 16.8，已移除
      // React 16.8 使用传统的 HMR (Hot Module Replacement)

      // ✅ transform-runtime
      [
        "@babel/plugin-transform-runtime",
        {
          helpers: true,
          regenerator: true,
        },
      ],
    ].filter(Boolean),
  };
};
