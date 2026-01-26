// React 19
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";

const container = document.getElementById("root");

// React 19 继续使用 createRoot API
if (!container) throw new Error("Root container not found");

const root = createRoot(container);
root.render(<App />);

// 🔍 React 19 的新特性:
// 1. React Compiler - 自动优化，减少手动 memo
// 2. Actions - 简化表单和数据提交
// 3. use Hook - 处理 Promise 和 Context
// 4. useOptimistic - 乐观更新 UI
// 5. useFormStatus - 表单状态管理
// 6. Document Metadata - 原生支持 <title>, <meta> 等
// 7. ref as prop - ref 可以作为普通 prop 传递
// 8. useActionState - 管理 action 状态
