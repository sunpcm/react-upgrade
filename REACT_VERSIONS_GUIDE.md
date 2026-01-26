# React 多版本测试指南

本 monorepo 用于测试不同版本的 React。每个 app 可以独立选择自己的 React 版本。

## 📋 版本管理策略

### ✅ Catalog 中保留的依赖（所有 app 共享）

- 开发工具：eslint, prettier, typescript
- 构建工具：webpack 相关插件
- 样式工具：tailwindcss, postcss, autoprefixer
- TypeScript 插件：@typescript-eslint/\*

### ❌ 从 Catalog 中移除的依赖（每个 app 独立管理）

- react
- react-dom
- @types/react
- @types/react-dom

## 🎯 创建新的 React 版本 App

### 示例 1: React 16.8 App（已完成）

```bash
# 位置：apps/webpack-app/
```

**package.json 配置：**

```json
{
  "dependencies": {
    "react": "^16.8.6",
    "react-dom": "^16.8.6"
  },
  "devDependencies": {
    "@types/react": "^16.9.56",
    "@types/react-dom": "^16.9.14"
  }
}
```

**关键配置：**

- ✅ 使用 Webpack 5（推荐）
- ✅ Babel preset-react runtime: "classic"
- ❌ 不支持 Fast Refresh（使用传统 HMR）
- ❌ 不支持新的 JSX 转换（需要 `import React`）

### 示例 2: React 17 App（待创建）

```json
{
  "dependencies": {
    "react": "^17.0.2",
    "react-dom": "^17.0.2"
  },
  "devDependencies": {
    "@types/react": "^17.0.62",
    "@types/react-dom": "^17.0.25"
  }
}
```

**关键配置：**

- ✅ 可以使用 Webpack 或 Vite
- ✅ 支持新的 JSX 转换（可选）
- ✅ 支持 Fast Refresh
- ⚠️ 没有并发特性

### 示例 3: React 18 App（待创建）

```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1"
  }
}
```

**关键配置：**

- ✅ 推荐使用 Vite
- ✅ 使用 `createRoot()` API
- ✅ 支持并发特性
- ✅ 支持 Suspense

### 示例 4: React 19 App（待创建）

```json
{
  "dependencies": {
    "react": "^19.2.3",
    "react-dom": "^19.2.3"
  },
  "devDependencies": {
    "@types/react": "^19.2.7",
    "@types/react-dom": "^19.2.3"
  }
}
```

**关键配置：**

- ✅ 推荐使用 Vite
- ✅ 使用 `createRoot()` API
- ✅ 支持 React Compiler
- ✅ 新的 API 和优化

## ⚠️ 依赖兼容性矩阵

### Tailwind CSS

| 版本 | React 16.8 | React 17 | React 18 | React 19 |
| ---- | ---------- | -------- | -------- | -------- |
| 4.x  | ⚠️ 需测试  | ✅       | ✅       | ✅       |
| 3.x  | ✅         | ✅       | ✅       | ✅       |

**注意**：Tailwind CSS 4.x 是新版本，建议在 React 16.8 中进行充分测试。

### eslint-plugin-react-hooks

| 版本 | React 16.8  | React 17 | React 18 | React 19 |
| ---- | ----------- | -------- | -------- | -------- |
| 5.x  | ⚠️ 部分兼容 | ✅       | ✅       | ✅       |
| 4.x  | ✅          | ✅       | ✅       | ✅       |

**注意**：v5.0.0 可能对 React 16.8 的某些 hooks 规则支持不完整。

### 构建工具

| 工具      | React 16.8 | React 17+ |
| --------- | ---------- | --------- |
| Webpack 5 | ✅ 推荐    | ✅ 兼容   |
| Vite 2-3  | ⚠️ 需配置  | ✅ 推荐   |
| Vite 4+   | ❌ 不推荐  | ✅ 推荐   |

## 🔧 共享组件库配置

### packages/ui-lib

**peerDependencies 配置：**

```json
{
  "peerDependencies": {
    "react": ">=16.8.0",
    "react-dom": ">=16.8.0"
  },
  "devDependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "@types/react": "^18.3.12"
  }
}
```

**说明**：

- peerDependencies 声明最低兼容版本（16.8.0+）
- devDependencies 使用中间版本（18.x）进行开发和测试
- 避免使用仅在特定版本才有的 API

## 📦 安装和运行

### 初始化

```bash
pnpm install
```

### 运行特定版本的 app

```bash
# React 16.8
pnpm --filter webpack-app dev

# 后续添加的其他版本
pnpm --filter react17-app dev
pnpm --filter react18-app dev
pnpm --filter react19-app dev
```

### 构建

```bash
pnpm build
```

## 🚀 创建新 App 的步骤

### 方法 1: 手动复制（推荐）

1. 复制现有 app 目录

```bash
cp -r apps/webpack-app apps/react18-app
```

2. 修改 `package.json`
   - 更新 name
   - 更新 React 版本
   - 更新 @types/react 版本

3. 根据 React 版本调整配置
   - 更新 Babel 配置（JSX 转换）
   - 更新入口文件（render API）
   - 添加/移除对应的插件

4. 安装依赖

```bash
pnpm install
```

### 方法 2: 使用 Plop（待开发）

扩展 `plopfile.cjs` 添加 app 生成器：

```bash
pnpm gen app
```

## 📝 注意事项

### 1. 不要在 catalog 中添加 React

❌ 错误做法：

```yaml
catalog:
  react: ^19.0.0 # 会强制所有 app 使用同一版本
```

### 2. 各 app 独立管理 React 版本

✅ 正确做法：

```json
// 每个 app 的 package.json 中直接指定
{
  "dependencies": {
    "react": "^16.8.6"
  }
}
```

### 3. 共享配置要兼容多版本

- eslint-config 需要兼容所有 React 版本
- tsconfig 需要支持不同的 JSX 模式
- postcss-config、tailwind-config 与 React 版本无关

### 4. TypeScript 配置

React 16.8 使用经典 JSX：

```json
{
  "compilerOptions": {
    "jsx": "react"
  }
}
```

React 17+ 可以使用新 JSX：

```json
{
  "compilerOptions": {
    "jsx": "react-jsx"
  }
}
```

## 🔍 调试和测试

### 验证 React 版本

在每个 app 中添加：

```tsx
console.log("React version:", React.version);
```

### 类型检查

```bash
pnpm --filter webpack-app typecheck
```

### Lint 检查

```bash
pnpm lint
```

## 📚 参考资源

- [React 16.8 文档](https://legacy.reactjs.org/docs/getting-started.html)
- [React 17 升级指南](https://react.dev/blog/2020/10/20/react-v17)
- [React 18 升级指南](https://react.dev/blog/2022/03/08/react-18-upgrade-guide)
- [React 19 升级指南](https://react.dev/blog/2024/12/05/react-19)
