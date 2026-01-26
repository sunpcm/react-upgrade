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
          // React 17 支持新的 JSX 转换（automatic）
          // 也可以使用 "classic" 保持向后兼容
          runtime: "automatic",
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
