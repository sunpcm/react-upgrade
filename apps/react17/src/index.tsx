// React 17
import ReactDOM from "react-dom";
import App from "./App";
import "./styles.css";

const container = document.getElementById("root");

// 语法: ReactDOM.render(组件, 容器)
// React 17 仍然使用 ReactDOM.render (React 18 才改用 createRoot)
ReactDOM.render(<App />, container);

// 🔍 React 17 的改进:
// 1. 新的 JSX 转换 - 不需要 import React（如果使用 runtime: "automatic"）
// 2. 事件委托改进 - 事件监听器挂载在: root 容器而不是 document
// 3. 更好的错误处理和性能优化
