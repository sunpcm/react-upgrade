// React 16.8
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import "./styles.css";

const container = document.getElementById("root");

// 语法: ReactDOM.render(组件, 容器)
ReactDOM.render(<App />, container);

// 🔍 底层行为:
// 事件监听器挂载在: document
// document.addEventListener('click', handler)
