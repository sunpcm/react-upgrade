// React 18
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";

const container = document.getElementById("root");

// React 18 新的渲染 API: createRoot
if (!container) throw new Error("Root container not found");

const root = createRoot(container);
root.render(<App />);

// 🔍 React 18 的新特性:
// 1. Concurrent Features - 并发渲染
// 2. Automatic Batching - 自动批处理更新
// 3. Transitions - 过渡更新
// 4. Suspense 改进 - 更好的数据加载支持
// 5. 新的 Hooks: useId, useTransition, useDeferredValue 等
