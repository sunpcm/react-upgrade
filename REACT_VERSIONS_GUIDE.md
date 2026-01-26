# React 多版本升级指南

本 monorepo 包含 4 个不同版本的 React 应用，用于测试和学习 React 版本升级。

## 📋 目录

- [版本概览](#版本概览)
- [React 16.8](#react-168)
- [React 17](#react-17)
- [React 18](#react-18)
- [React 19](#react-19)
- [配置变化对比](#配置变化对比)
- [迁移指南](#迁移指南)
- [构建工具支持矩阵](#构建工具支持矩阵)
- [常见问题](#常见问题)

---

## 版本概览

| 特性              | React 16.8        | React 17          | React 18     | React 19     |
| ----------------- | ----------------- | ----------------- | ------------ | ------------ |
| 发布时间          | 2019.02           | 2020.10           | 2022.03      | 2024.12      |
| JSX 转换          | Classic           | Automatic         | Automatic    | Automatic    |
| 渲染 API          | `ReactDOM.render` | `ReactDOM.render` | `createRoot` | `createRoot` |
| 事件委托          | document          | root 容器         | root 容器    | root 容器    |
| Fast Refresh      | ❌                | ✅                | ✅           | ✅           |
| 并发特性          | ❌                | ❌                | ✅           | ✅           |
| React Compiler    | ❌                | ❌                | ❌           | ✅           |
| Server Components | ❌                | ❌                | 实验性       | ✅           |

---

## React 16.8

> **里程碑**：Hooks 首次引入

### 🆕 引入的新功能

- **Hooks API**：`useState`, `useEffect`, `useContext`, `useReducer`, `useCallback`, `useMemo`, `useRef`, `useImperativeHandle`, `useLayoutEffect`, `useDebugValue`
- 函数组件可以拥有状态和生命周期
- 自定义 Hooks 复用逻辑

### 📦 依赖版本

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

### ⚙️ 配置特点

#### Babel 配置 (`.babelrc.js`)

```javascript
{
  presets: [
    ["@babel/preset-react", {
      // ⚠️ 必须使用 classic 模式
      runtime: "classic",
      development: isDevelopment,
    }]
  ],
  plugins: [
    // ❌ 不支持 react-refresh/babel
    ["@babel/plugin-transform-runtime", {
      helpers: true,
      regenerator: true,
    }]
  ]
}
```

#### ESLint 配置

```javascript
{
  settings: {
    react: { version: "16.8" }
  },
  rules: {
    // ⚠️ 必须在作用域中引入 React
    "react/react-in-jsx-scope": "error",
    // 关闭 deprecated 警告（ReactDOM.render 是正确的）
    "react/no-deprecated": "off",
  }
}
```

#### TypeScript 配置

```json
{
  "compilerOptions": {
    // 可以使用 "react" 或 "react-jsx"
    // 使用 "react" 时需要 import React
    "jsx": "react"
  }
}
```

#### Webpack 配置

```javascript
// ❌ 不支持 ReactRefreshWebpackPlugin
plugins: [
  new ForkTsCheckerWebpackPlugin(),
  // 使用传统 HMR
];
```

### 📝 入口文件写法

```tsx
// ⚠️ 必须导入 React
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";

// 使用 ReactDOM.render
ReactDOM.render(<App />, document.getElementById("root"));
```

### 🔍 底层行为

- 事件监听器挂载在 `document` 上
- 所有 React 事件都冒泡到 document 统一处理
- 可能与其他框架的事件处理产生冲突

---

## React 17

> **里程碑**：为未来升级铺路的过渡版本

### 🆕 引入的新功能

- **新的 JSX 转换**：不再需要 `import React`
- **事件委托改进**：事件挂载到 root 容器而非 document
- **渐进式升级**：支持多个 React 版本共存
- **改进的错误处理**：更好的组件堆栈追踪
- **原生组件堆栈**：错误信息更清晰

### 📦 依赖版本

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

### ⚙️ 配置变化（相比 16.8）

#### Babel 配置

```diff
  ["@babel/preset-react", {
-   runtime: "classic",
+   runtime: "automatic",  // ✅ 新的 JSX 转换
    development: isDevelopment,
  }]
```

#### ESLint 配置

```diff
  rules: {
-   "react/react-in-jsx-scope": "error",
+   "react/react-in-jsx-scope": "off",  // ✅ 不再需要导入 React
    "react/no-deprecated": "off",
  }
```

#### TypeScript 配置

```json
{
  "compilerOptions": {
    // 推荐使用 react-jsx 配合新的 JSX 转换
    "jsx": "react-jsx"
  }
}
```

### 📝 入口文件写法

```tsx
// ✅ 不再需要 import React（使用 automatic 模式时）
import ReactDOM from "react-dom";
import App from "./App";

// 仍然使用 ReactDOM.render
ReactDOM.render(<App />, document.getElementById("root"));
```

### 🔧 Vite 配置（React 17 开始支持）

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react({
      // React 17 可以使用 Vite
      jsxRuntime: "automatic",
    }),
  ],
});
```

### 🔍 底层行为变化

- 事件监听器挂载到 **root 容器**（而非 document）
- 更好地支持微前端和多 React 版本共存
- `e.persist()` 不再需要（事件池被移除）

---

## React 18

> **里程碑**：并发渲染时代

### 🆕 引入的新功能

#### 核心特性

- **并发渲染（Concurrent Rendering）**：可中断的渲染
- **自动批处理（Automatic Batching）**：所有更新自动合并
- **Transitions**：区分紧急和非紧急更新
- **Suspense 改进**：支持服务端渲染

#### 新的 Hooks

| Hook                   | 用途                  |
| ---------------------- | --------------------- |
| `useId`                | 生成唯一 ID，支持 SSR |
| `useTransition`        | 标记非紧急更新        |
| `useDeferredValue`     | 延迟更新值            |
| `useSyncExternalStore` | 订阅外部 store        |
| `useInsertionEffect`   | CSS-in-JS 库使用      |

#### 新的 API

- `createRoot` - 新的渲染入口
- `hydrateRoot` - 新的 SSR hydration
- `flushSync` - 强制同步更新

### 📦 依赖版本

```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@pmmmwh/react-refresh-webpack-plugin": "^0.6.2",
    "react-refresh": "^0.18.0"
  }
}
```

### ⚙️ 配置变化（相比 17）

#### Babel 配置

```diff
  plugins: [
+   // ✅ 支持 Fast Refresh
+   isDevelopment && "react-refresh/babel",
    ["@babel/plugin-transform-runtime", {
      helpers: true,
      regenerator: true,
+     skipHelperValidation: true,  // 避免与 react-refresh 冲突
    }]
  ]
```

#### ESLint 配置

```diff
  rules: {
    "react/react-in-jsx-scope": "off",
-   "react/no-deprecated": "off",
+   "react/no-deprecated": "warn",  // ⚠️ 警告使用旧 API
  }
```

#### Webpack 配置

```diff
+ const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");

  plugins: [
+   // ✅ 支持 Fast Refresh
+   new ReactRefreshWebpackPlugin(),
    new ForkTsCheckerWebpackPlugin(),
  ]
```

### 📝 入口文件写法（重大变化）

```tsx
// ⚠️ 必须改用 createRoot API
import { createRoot } from "react-dom/client";
import App from "./App";

const container = document.getElementById("root");
if (!container) throw new Error("Root container not found");

// 新的渲染方式
const root = createRoot(container);
root.render(<App />);
```

### 🔧 Vite 配置

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react({
      // React 18 完全支持
      jsxRuntime: "automatic",
      // 开发模式自动启用 Fast Refresh
    }),
  ],
});
```

### 💡 新特性示例

#### Transitions

```tsx
import { useTransition, useState } from "react";

function SearchResults() {
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState("");

  function handleChange(e) {
    // 紧急更新：显示输入内容
    setQuery(e.target.value);

    // 非紧急更新：可以被中断
    startTransition(() => {
      setSearchResults(filterResults(e.target.value));
    });
  }

  return (
    <>
      <input value={query} onChange={handleChange} />
      {isPending ? <Spinner /> : <Results />}
    </>
  );
}
```

---

## React 19

> **里程碑**：React Compiler 和 Actions

### 🆕 引入的新功能

#### 核心特性

- **React Compiler**：自动优化，减少手动 memo
- **Actions**：简化表单和数据提交
- **Document Metadata**：原生支持 `<title>`, `<meta>`
- **ref as prop**：ref 可以作为普通 prop 传递
- **改进的错误处理**：更好的 hydration 错误信息

#### 新的 Hooks

| Hook             | 用途                    |
| ---------------- | ----------------------- |
| `use`            | 处理 Promise 和 Context |
| `useOptimistic`  | 乐观更新 UI             |
| `useFormStatus`  | 表单提交状态            |
| `useActionState` | 管理 action 状态        |

#### 废弃/移除的 API

- ❌ `forwardRef` - 不再需要，ref 可以直接作为 prop
- ❌ `propTypes` - 建议使用 TypeScript
- ❌ `defaultProps`（函数组件）- 使用默认参数

### 📦 依赖版本

```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.2",
    "@types/react-dom": "^19.0.2",
    "@pmmmwh/react-refresh-webpack-plugin": "^0.6.2",
    "react-refresh": "^0.18.0"
  }
}
```

### ⚙️ 配置变化（相比 18）

#### ESLint 配置

```diff
  rules: {
    "react/react-in-jsx-scope": "off",
-   "react/no-deprecated": "warn",
+   "react/no-deprecated": "error",  // ❌ 严格禁止使用已废弃 API
  }
```

> 其他配置（Babel、Webpack、TypeScript）与 React 18 基本相同

### 📝 入口文件写法

```tsx
// 与 React 18 相同
import { createRoot } from "react-dom/client";
import App from "./App";

const container = document.getElementById("root");
if (!container) throw new Error("Root container not found");

const root = createRoot(container);
root.render(<App />);
```

### 💡 新特性示例

#### use Hook

```tsx
// 直接在组件中使用 Promise
function UserProfile({ userPromise }) {
  const user = use(userPromise);
  return <h1>{user.name}</h1>;
}

// 条件使用 Context
function Theme({ children }) {
  if (someCondition) {
    const theme = use(ThemeContext);
    return <div style={{ color: theme.color }}>{children}</div>;
  }
  return children;
}
```

#### useOptimistic

```tsx
function LikeButton({ postId, initialLikes }) {
  const [likes, setLikes] = useState(initialLikes);
  const [optimisticLikes, addOptimisticLike] = useOptimistic(
    likes,
    (current, newLike) => current + 1,
  );

  async function handleLike() {
    addOptimisticLike(1); // 立即更新 UI
    await likePost(postId); // 等待服务器响应
  }

  return <button onClick={handleLike}>{optimisticLikes} ❤️</button>;
}
```

#### Actions 和 useActionState

```tsx
function AddToCartForm({ productId }) {
  const [state, formAction] = useActionState(addToCart, { success: false });

  return (
    <form action={formAction}>
      <input type="hidden" name="productId" value={productId} />
      <button>Add to Cart</button>
      {state.success && <p>Added!</p>}
    </form>
  );
}
```

#### ref as prop（不再需要 forwardRef）

```tsx
// React 19 之前
const MyInput = forwardRef((props, ref) => {
  return <input ref={ref} {...props} />;
});

// React 19
function MyInput({ ref, ...props }) {
  return <input ref={ref} {...props} />;
}
```

#### Document Metadata

```tsx
function BlogPost({ post }) {
  return (
    <article>
      {/* 原生支持，会自动提升到 <head> */}
      <title>{post.title} - My Blog</title>
      <meta name="description" content={post.excerpt} />
      <meta name="author" content={post.author} />

      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </article>
  );
}
```

---

## 配置变化对比

### Babel `@babel/preset-react` 配置

| 版本 | runtime     | react-refresh/babel | 备注               |
| ---- | ----------- | ------------------- | ------------------ |
| 16.8 | `classic`   | ❌                  | 必须手动导入 React |
| 17   | `automatic` | ⚠️ 可选             | 不再需要导入 React |
| 18   | `automatic` | ✅ 推荐             | 支持 Fast Refresh  |
| 19   | `automatic` | ✅ 推荐             | 支持 Fast Refresh  |

### ESLint 规则对比

| 规则                       | 16.8    | 17    | 18     | 19      |
| -------------------------- | ------- | ----- | ------ | ------- |
| `react/react-in-jsx-scope` | `error` | `off` | `off`  | `off`   |
| `react/no-deprecated`      | `off`   | `off` | `warn` | `error` |

### TypeScript `jsx` 配置

| 版本 | 推荐配置                   | 备注                          |
| ---- | -------------------------- | ----------------------------- |
| 16.8 | `"react"` 或 `"react-jsx"` | 使用 `"react"` 需要导入 React |
| 17+  | `"react-jsx"`              | 配合新的 JSX 转换             |

### Webpack 插件对比

| 插件                         | 16.8 | 17      | 18  | 19  |
| ---------------------------- | ---- | ------- | --- | --- |
| `ReactRefreshWebpackPlugin`  | ❌   | ⚠️ 可选 | ✅  | ✅  |
| `ForkTsCheckerWebpackPlugin` | ✅   | ✅      | ✅  | ✅  |

---

## 迁移指南

### 16.8 → 17 迁移

#### ✅ 推荐的改动

1. **更新 Babel 配置**

   ```diff
   - runtime: "classic"
   + runtime: "automatic"
   ```

2. **更新 ESLint 配置**

   ```diff
   - "react/react-in-jsx-scope": "error"
   + "react/react-in-jsx-scope": "off"
   ```

3. **移除不必要的 React 导入**（可选）
   ```diff
   - import React from "react";
     import { useState } from "react";
   ```

#### ⚠️ 注意事项

- 事件委托从 document 改到 root 容器
- 如果代码依赖事件冒泡到 document，需要调整
- `e.persist()` 不再需要（可以移除）

#### 🔧 可选改进

- 启用 Fast Refresh（需要额外配置）
- 迁移到 Vite（更快的开发体验）

---

### 17 → 18 迁移

#### ❗ 必须的改动

1. **更改渲染入口**

   ```diff
   - import ReactDOM from "react-dom";
   + import { createRoot } from "react-dom/client";

   - ReactDOM.render(<App />, document.getElementById("root"));
   + const root = createRoot(document.getElementById("root")!);
   + root.render(<App />);
   ```

2. **SSR hydration 更改**
   ```diff
   - ReactDOM.hydrate(<App />, document.getElementById("root"));
   + import { hydrateRoot } from "react-dom/client";
   + hydrateRoot(document.getElementById("root")!, <App />);
   ```

#### ✅ 推荐的改动

1. **启用 Fast Refresh**

   ```javascript
   // .babelrc.js
   plugins: [isDevelopment && "react-refresh/babel"];

   // webpack.dev.js
   plugins: [new ReactRefreshWebpackPlugin()];
   ```

2. **更新 ESLint 规则**
   ```diff
   - "react/no-deprecated": "off"
   + "react/no-deprecated": "warn"
   ```

#### ⚠️ 注意事项

- Automatic Batching 可能改变更新时机
- 如需同步更新，使用 `flushSync`
- Strict Mode 现在会双重调用 Effect

#### 💡 新特性可选采用

- `useTransition` 优化大列表更新
- `useDeferredValue` 延迟昂贵计算
- Suspense 配合数据获取

---

### 18 → 19 迁移

#### ❗ 必须的改动

1. **更新 ESLint 规则**

   ```diff
   - "react/no-deprecated": "warn"
   + "react/no-deprecated": "error"
   ```

2. **移除 forwardRef（推荐）**
   ```diff
   - const MyInput = forwardRef((props, ref) => {
   -   return <input ref={ref} {...props} />;
   - });
   + function MyInput({ ref, ...props }) {
   +   return <input ref={ref} {...props} />;
   + }
   ```

#### ✅ 推荐的改动

1. **移除不必要的优化**（如果使用 React Compiler）

   ```diff
   - const memoizedValue = useMemo(() => computeValue(a, b), [a, b]);
   + const memoizedValue = computeValue(a, b);  // Compiler 自动优化

   - const MemoizedComponent = memo(MyComponent);
   + // 直接使用 MyComponent，Compiler 自动优化
   ```

2. **采用 Actions 简化表单**
   ```diff
   - <form onSubmit={handleSubmit}>
   + <form action={formAction}>
   ```

#### ⚠️ 注意事项

- 检查是否使用了已废弃的 API
- 测试 ref 作为 prop 的行为
- 如果使用第三方库，确认其支持 React 19

#### 💡 新特性可选采用

- `use` Hook 简化数据获取
- `useOptimistic` 提升用户体验
- Document Metadata 替代 react-helmet

---

## 构建工具支持矩阵

### Webpack

| 版本         | React 16.8 | React 17 | React 18 | React 19 |
| ------------ | ---------- | -------- | -------- | -------- |
| Webpack 5    | ✅ 推荐    | ✅       | ✅       | ✅       |
| Fast Refresh | ❌         | ⚠️ 可选  | ✅       | ✅       |

### Vite

| 版本     | React 16.8 | React 17 | React 18 | React 19 |
| -------- | ---------- | -------- | -------- | -------- |
| Vite 2.x | ❌ 不推荐  | ✅       | ✅       | ❌       |
| Vite 3.x | ❌ 不推荐  | ✅       | ✅       | ⚠️       |
| Vite 4.x | ❌         | ⚠️       | ✅ 推荐  | ✅       |
| Vite 5.x | ❌         | ⚠️       | ✅       | ✅ 推荐  |

### @vitejs/plugin-react

| 版本 | React 16.8 | React 17 | React 18 | React 19 |
| ---- | ---------- | -------- | -------- | -------- |
| 1.x  | ⚠️         | ✅       | ✅       | ❌       |
| 2.x  | ❌         | ✅       | ✅       | ⚠️       |
| 3.x  | ❌         | ⚠️       | ✅       | ✅       |
| 4.x  | ❌         | ❌       | ✅       | ✅ 推荐  |

---

## 常见问题

### Q: 为什么 React 16.8 不能使用 Fast Refresh？

A: React Fast Refresh 依赖于 React 17 引入的内部 API。React 16.8 只能使用传统的 HMR（Hot Module Replacement），它会在修改代码后重新加载整个组件树。

### Q: React 17 为什么仍然使用 ReactDOM.render？

A: React 17 是一个过渡版本，主要目标是为未来的升级铺路。createRoot 是在 React 18 中引入的，它启用了并发渲染等新特性。

### Q: 什么时候应该使用 Vite 而不是 Webpack？

A:

- **Vite**：新项目、React 17+、追求开发速度
- **Webpack**：旧项目、React 16.8、需要复杂的构建配置

### Q: React Compiler 需要手动配置吗？

A: React 19 的 React Compiler 需要单独安装和配置。它会自动分析代码并添加优化，减少手动 memo/useCallback/useMemo 的需要。

### Q: 如何在同一个项目中运行多个 React 版本？

A: 使用 monorepo 结构（如本项目），每个 app 独立管理自己的 React 版本。pnpm workspace 会自动处理依赖隔离。

---

## 快速启动

```bash
# 安装依赖
pnpm install

# 启动 React 16.8 应用
pnpm --filter react168 dev

# 启动 React 17 应用
pnpm --filter react17 dev

# 启动 React 18 应用
pnpm --filter react18 dev

# 启动 React 19 应用
pnpm --filter react19 dev
```

---

## 参考资料

- [React 16.8 Hooks 发布公告](https://legacy.reactjs.org/blog/2019/02/06/react-v16.8.0.html)
- [React 17 发布公告](https://react.dev/blog/2020/10/20/react-v17)
- [React 18 升级指南](https://react.dev/blog/2022/03/08/react-18-upgrade-guide)
- [React 19 发布公告](https://react.dev/blog/2024/12/05/react-19)
- [新的 JSX 转换说明](https://legacy.reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html)
