# React 16.8 新特性详解

> **发布日期**: 2019年2月6日  
> **里程碑版本**: React Hooks 首次发布  
> **涵盖版本**: React 16.0 - 16.8 的累积特性

## 🎯 核心突破

React 16.8 是 React 发展历史上的里程碑版本，首次引入了 **Hooks API**，彻底改变了 React 应用的开发方式。这个版本让函数组件拥有了状态管理和生命周期的能力，使得类组件不再是状态管理的唯一选择。

除了 Hooks，React 16.x 系列还引入了多个重要特性，包括 Fragments、Portals、Error Boundaries、新的 Context API、Suspense & React.lazy 以及 React.memo 等，共同构成了现代 React 开发的基础。

---

## 🆕 新特性详解

### 1. Fragments - 避免额外 DOM 节点

> **引入版本**: React 16.0 | **稳定版本**: React 16.2

#### React 15 的限制

```tsx
// React 15 - 必须有单一根元素
class Table extends React.Component {
  render() {
    return (
      <div>
        {" "}
        {/* ❌ 额外的 div 破坏了 HTML 结构 */}
        <td>列 1</td>
        <td>列 2</td>
      </div>
    );
  }
}

// 导致无效的 HTML
<table>
  <tr>
    <div>
      {" "}
      {/* ❌ div 不能作为 tr 的直接子元素 */}
      <td>列 1</td>
      <td>列 2</td>
    </div>
  </tr>
</table>;
```

#### React 16.0+ 的解决方案

```tsx
// React 16+ - Fragment 语法
import React, { Fragment } from "react";

function TableRow() {
  return (
    <>
      <td>列 1</td>
      <td>列 2</td>
    </>
  );
}

// 带 key 的 Fragment（列表渲染）
function DescriptionList({ items }) {
  return (
    <dl>
      {items.map((item) => (
        <Fragment key={item.id}>
          <dt>{item.term}</dt>
          <dd>{item.description}</dd>
        </Fragment>
      ))}
    </dl>
  );
}
```

### 2. Portals - 跨层级渲染

> **引入版本**: React 16.0

Portals 提供了一种将子组件渲染到父组件 DOM 层次结构之外的方式，常用于模态框、提示框等场景。

```tsx
import { useState, useEffect } from "react";
import ReactDOM from "react-dom";

// React 15 的问题
function BadModal({ children }) {
  // ❌ 模态框被限制在父组件的 DOM 层次内
  // 可能被 overflow: hidden 或 z-index 影响
  return <div className="modal">{children}</div>;
}

// React 16.0+ Portal 解决方案（函数组件 + Hooks）
function Modal({ children, onClose }) {
  const [modalRoot, setModalRoot] = useState(null);

  useEffect(() => {
    // 确保 modal-root 节点存在
    let root = document.getElementById("modal-root");
    if (!root) {
      root = document.createElement("div");
      root.id = "modal-root";
      document.body.appendChild(root);
    }
    setModalRoot(root);

    // 可选：组件卸载时的清理逻辑
    return () => {
      // 如果需要，可以在这里清理
    };
  }, []);

  if (!modalRoot) return null;

  // ✅ 渲染到 body 下的独立节点
  return ReactDOM.createPortal(children, modalRoot);
}

// HTML 结构
// <div id="root">
//   <App /> <!-- 应用主体 -->
// </div>
// <div id="modal-root"></div> <!-- Modal 渲染位置（可自动创建）-->

// 实际应用示例
function App() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div style={{ overflow: "hidden", position: "relative" }}>
      <h1>应用主体</h1>
      <button onClick={() => setShowModal(true)}>打开模态框</button>

      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <div className="modal-content">
            <h2>模态框标题</h2>
            <p>模态框内容不受父组件 overflow: hidden 影响</p>
            <button onClick={() => setShowModal(false)}>关闭</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// Portal 中的事件冒泡
function Parent() {
  const [clicks, setClicks] = useState(0);

  // ✅ 即使 Portal 渲染到外部，事件仍会冒泡到 React 树
  const handleClick = () => {
    setClicks((c) => c + 1);
  };

  return (
    <div onClick={handleClick}>
      <p>点击次数: {clicks}</p>
      <Modal>
        <button>点击我</button> {/* 点击会触发父组件的 handleClick */}
      </Modal>
    </div>
  );
}
```

### 3. Error Boundaries - 错误边界

> **引入版本**: React 16.0

Error Boundaries 用于捕获子组件树中的 JavaScript 错误，记录错误并显示降级 UI。

```tsx
// React 15 的问题
// 组件错误会导致整个应用崩溃，白屏

// React 16.0+ Error Boundary（目前仍需要 class 组件）
// ⚠️ 注意：Error Boundary 目前无法用 Hooks 实现，因为需要 componentDidCatch
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // 更新 state 使下一次渲染显示降级 UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // 可以将错误日志上报给服务器
    console.error("错误捕获:", error);
    console.error("组件栈:", errorInfo.componentStack);

    this.setState({
      error,
      errorInfo,
    });

    // 上报错误到监控服务
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // 支持自定义降级 UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 默认降级 UI
      return (
        <div className="error-boundary">
          <h1>😢 出错了</h1>
          <details style={{ whiteSpace: "pre-wrap" }}>
            <summary>查看错误详情</summary>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
          {this.props.showReset && (
            <button onClick={() => this.setState({ hasError: false })}>重试</button>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

// ✅ 推荐：使用函数组件风格的 API
function App() {
  const handleError = (error, errorInfo) => {
    // 上报到错误监控服务
    logErrorToService(error, errorInfo);
  };

  return (
    <div>
      <h1>我的应用</h1>

      {/* 基础用法 */}
      <ErrorBoundary onError={handleError}>
        <UserProfile /> {/* 如果这里出错，只影响这个区域 */}
      </ErrorBoundary>

      {/* 自定义降级 UI */}
      <ErrorBoundary fallback={<div>⚠️ 列表加载失败</div>} onError={handleError}>
        <TodoList />
      </ErrorBoundary>
    </div>
  );
}

// 💡 进阶：使用 react-error-boundary 库（推荐）
// npm install react-error-boundary
import { ErrorBoundary as ErrorBoundaryLib } from "react-error-boundary";

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert">
      <h2>出错了:</h2>
      <pre style={{ color: "red" }}>{error.message}</pre>
      <button onClick={resetErrorBoundary}>重试</button>
    </div>
  );
}

function AppWithLib() {
  const handleError = (error, errorInfo) => {
    logErrorToService(error, errorInfo);
  };

  const handleReset = () => {
    // 重置应用状态
  };

  return (
    <ErrorBoundaryLib FallbackComponent={ErrorFallback} onError={handleError} onReset={handleReset}>
      <UserProfile />
    </ErrorBoundaryLib>
  );
}

// ⚠️ Error Boundary 无法捕获的错误：
// 1. 事件处理器中的错误（使用 try-catch 或 useState）
// 2. 异步代码（setTimeout、Promise）
// 3. 服务端渲染
// 4. Error Boundary 自身的错误

// 事件处理器使用 Hooks 处理错误
function MyComponent() {
  const [error, setError] = useState(null);

  const handleClick = () => {
    try {
      // 可能出错的代码
      doSomethingRisky();
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error("事件处理错误:", err);
    }
  };

  return (
    <div>
      <button onClick={handleClick}>点击</button>
      {error && <div style={{ color: "red" }}>错误: {error}</div>}
    </div>
  );
}

// 异步错误处理
function AsyncComponent() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData()
      .then(setData)
      .catch((err) => {
        setError(err.message);
        console.error("异步错误:", err);
      });
  }, []);

  if (error) return <div>加载失败: {error}</div>;
  if (!data) return <div>加载中...</div>;
  return <div>{data}</div>;
}
```

### 4. 新的 Context API

> **引入版本**: React 16.3

React 16.3 引入了新的 Context API，替代了旧的不稳定的 Context。

```tsx
import { createContext, useContext, useState } from "react";

// React 15 旧的 Context API（已废弃，使用 class 组件）
// ❌ 不推荐使用
class OldParent extends React.Component {
  getChildContext() {
    return { theme: "dark" };
  }
  render() {
    return <OldChild />;
  }
}
OldParent.childContextTypes = {
  theme: PropTypes.string,
};

// React 16.3+ 新的 Context API（推荐使用函数组件）
const ThemeContext = createContext("light"); // 默认值

// ✅ Provider 提供数据（函数组件 + Hooks）
function App() {
  const [theme, setTheme] = useState("dark");

  return (
    <ThemeContext.Provider value={theme}>
      <Toolbar />
      <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>切换主题</button>
    </ThemeContext.Provider>
  );
}

// Consumer 消费数据（React 16.3-16.7 写法，仍可用但不推荐）
function ThemedButtonOld() {
  return (
    <ThemeContext.Consumer>
      {(theme) => <button className={`btn-${theme}`}>按钮（{theme} 主题）</button>}
    </ThemeContext.Consumer>
  );
}

// ✅ useContext Hook 消费数据（React 16.8+，强烈推荐）
function ThemedButton() {
  const theme = useContext(ThemeContext);
  return <button className={`btn-${theme}`}>按钮（{theme} 主题）</button>;
}

// 复杂的 Context 示例（多个 Context + Hooks）
const UserContext = createContext(null);
const SettingsContext = createContext({});

function AppWithMultipleContexts() {
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState({
    language: "zh",
    theme: "dark",
  });

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <SettingsContext.Provider value={{ settings, setSettings }}>
        <Dashboard />
      </SettingsContext.Provider>
    </UserContext.Provider>
  );
}

function Dashboard() {
  // ✅ 使用 useContext 消费多个 Context
  const { user } = useContext(UserContext);
  const { settings } = useContext(SettingsContext);

  return (
    <div className={`theme-${settings.theme}`}>
      <h1>欢迎，{user?.name || "访客"}!</h1>
      <p>语言: {settings.language}</p>
    </div>
  );
}

// 💡 自定义 Hook 封装 Context（最佳实践）
function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within UserProvider");
  }
  return context;
}

// 使用自定义 Hook
function Profile() {
  const { user, setUser } = useUser();
  const { settings } = useSettings();

  return (
    <div className={settings.theme}>
      <h2>{user.name}</h2>
      <button onClick={() => setUser({ ...user, name: "New Name" })}>更新名字</button>
    </div>
  );
}
```

### 5. Suspense & React.lazy - 代码分割

> **引入版本**: React 16.6

Suspense 和 React.lazy 实现了基于路由的代码分割，优化应用加载性能。

```tsx
// React 15 的问题
// 所有组件都打包在一起，首屏加载慢
import Home from "./Home";
import About from "./About";
import Dashboard from "./Dashboard";

// React 16.6+ 代码分割
import React, { Suspense, lazy } from "react";

// ✅ 动态导入，按需加载
const Home = lazy(() => import("./Home"));
const About = lazy(() => import("./About"));
const Dashboard = lazy(() => import("./Dashboard"));

function App() {
  return (
    <div>
      <nav>
        <Link to="/">首页</Link>
        <Link to="/about">关于</Link>
        <Link to="/dashboard">仪表板</Link>
      </nav>

      {/* Suspense 提供加载状态 */}
      <Suspense fallback={<div>加载中...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Suspense>
    </div>
  );
}

// 嵌套 Suspense 边界
function Dashboard() {
  return (
    <div>
      <h1>仪表板</h1>

      <Suspense fallback={<Spinner />}>
        <UserStats />
      </Suspense>

      <Suspense fallback={<Spinner />}>
        <RecentActivity />
      </Suspense>
    </div>
  );
}

// 自定义加载组件
function LoadingFallback() {
  return (
    <div className="loading">
      <div className="spinner"></div>
      <p>加载组件中...</p>
    </div>
  );
}

function App() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <LazyComponent />
    </Suspense>
  );
}

// 错误边界 + Suspense
function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<Loading />}>
        <LazyComponent />
      </Suspense>
    </ErrorBoundary>
  );
}
```

### 6. React.memo - 函数组件优化

> **引入版本**: React 16.6

React.memo 是函数组件的性能优化工具，类似于类组件的 PureComponent。

```tsx
// React 15 - 类组件优化
class ExpensiveComponent extends React.PureComponent {
  render() {
    console.log("渲染 ExpensiveComponent");
    return <div>{this.props.data}</div>;
  }
}

// React 16.6+ - 函数组件优化
const ExpensiveComponent = React.memo(function ExpensiveComponent({ data }) {
  console.log("渲染 ExpensiveComponent");
  return <div>{data}</div>;
});

// memo 默认浅比较 props
function Parent() {
  const [count, setCount] = useState(0);
  const [user, setUser] = useState({ name: "Alice" });

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>计数: {count}</button>

      {/* ✅ count 改变时，ExpensiveComponent 不会重渲染 */}
      <ExpensiveComponent data={user.name} />
    </div>
  );
}

// 自定义比较函数
const MyComponent = React.memo(
  function MyComponent({ user, onClick }) {
    return (
      <div onClick={onClick}>
        {user.name} - {user.age}
      </div>
    );
  },
  (prevProps, nextProps) => {
    // 返回 true 表示不重渲染
    // 返回 false 表示需要重渲染
    return prevProps.user.id === nextProps.user.id && prevProps.onClick === nextProps.onClick;
  },
);

// memo + useCallback 组合
function Parent() {
  const [count, setCount] = useState(0);
  const [text, setText] = useState("");

  // ✅ 使用 useCallback 保持引用稳定
  const handleClick = useCallback(() => {
    console.log("点击", text);
  }, [text]);

  return (
    <div>
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <button onClick={() => setCount(count + 1)}>计数: {count}</button>

      {/* ✅ count 改变时，Child 不会重渲染 */}
      <Child onClick={handleClick} />
    </div>
  );
}

const Child = React.memo(function Child({ onClick }) {
  console.log("渲染 Child");
  return <button onClick={onClick}>子组件按钮</button>;
});
```

### 7. Hooks API - 革命性变化

> **引入版本**: React 16.8

#### 核心 Hooks

| Hook                  | 用途            | 替代的类组件特性                       |
| --------------------- | --------------- | -------------------------------------- |
| `useState`            | 状态管理        | `this.state` + `this.setState`         |
| `useEffect`           | 副作用处理      | `componentDidMount/Update/WillUnmount` |
| `useContext`          | Context 消费    | `<Consumer>` 或 `contextType`          |
| `useReducer`          | 复杂状态管理    | `this.setState` + reducer 模式         |
| `useCallback`         | 回调函数优化    | 手动 bind 或箭头函数                   |
| `useMemo`             | 计算结果缓存    | 手动缓存或 `PureComponent`             |
| `useRef`              | DOM 引用/可变值 | `React.createRef()`                    |
| `useImperativeHandle` | 自定义 ref 暴露 | 类组件的 ref 方法                      |
| `useLayoutEffect`     | 同步副作用      | `componentDidMount/Update`             |
| `useDebugValue`       | 开发者工具标签  | 无直接对应                             |

#### useState - 函数组件的状态

```tsx
import { useState } from "react";

// React 16.8 之前 - 类组件（旧方式，不推荐）
class CounterOld extends React.Component {
  constructor(props) {
    super(props);
    this.state = { count: 0 };
  }

  increment = () => {
    this.setState({ count: this.state.count + 1 });
  };

  render() {
    return (
      <div>
        <p>计数: {this.state.count}</p>
        <button onClick={this.increment}>+1</button>
      </div>
    );
  }
}

// ✅ React 16.8+ - 函数组件 + Hooks（推荐）
function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>计数: {count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
    </div>
  );
}
```

#### useEffect - 副作用统一处理

```tsx
import { useState, useEffect } from "react";

// React 16.8 之前 - 多个生命周期方法（旧方式，不推荐）
class UserProfileOld extends React.Component {
  state = { user: null, loading: true };

  componentDidMount() {
    this.fetchUser();
    document.title = "用户资料";
  }

  componentDidUpdate(prevProps) {
    if (prevProps.userId !== this.props.userId) {
      this.fetchUser();
    }
    document.title = `${this.state.user?.name || "用户资料"}`;
  }

  componentWillUnmount() {
    document.title = "应用";
  }

  fetchUser = async () => {
    this.setState({ loading: true });
    const user = await api.getUser(this.props.userId);
    this.setState({ user, loading: false });
  };

  render() {
    const { user, loading } = this.state;
    if (loading) return <div>加载中...</div>;
    return <div>用户: {user?.name}</div>;
  }
}

// ✅ React 16.8+ - useEffect 统一处理（推荐）
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 数据获取副作用
  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      const userData = await api.getUser(userId);
      setUser(userData);
      setLoading(false);
    };
    fetchUser();
  }, [userId]); // 依赖项数组

  // 文档标题副作用
  useEffect(() => {
    document.title = user?.name || "用户资料";
    return () => {
      document.title = "应用"; // 清理函数
    };
  }, [user?.name]);

  if (loading) return <div>加载中...</div>;
  return <div>用户: {user.name}</div>;
}
```

#### useContext - 简化 Context 使用

```tsx
import { createContext, useContext } from "react";

const ThemeContext = createContext();

// React 16.8 之前 - Consumer 方式（旧方式，仍可用但不推荐）
class ThemedButtonOld extends React.Component {
  render() {
    return (
      <ThemeContext.Consumer>
        {(theme) => <button className={theme.buttonClass}>点击我</button>}
      </ThemeContext.Consumer>
    );
  }
}

// ✅ React 16.8+ - useContext（推荐）
function ThemedButton() {
  const theme = useContext(ThemeContext);
  return <button className={theme.buttonClass}>点击我</button>;
}
```

#### useReducer - 复杂状态管理

```tsx
// 状态和动作类型
const initialState = { count: 0, step: 1 };

function reducer(state, action) {
  switch (action.type) {
    case "increment":
      return { ...state, count: state.count + state.step };
    case "decrement":
      return { ...state, count: state.count - state.step };
    case "set_step":
      return { ...state, step: action.step };
    case "reset":
      return initialState;
    default:
      throw new Error("未知动作");
  }
}

function CounterWithReducer() {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <div>
      <p>计数: {state.count}</p>
      <p>步长: {state.step}</p>
      <button onClick={() => dispatch({ type: "increment" })}>+</button>
      <button onClick={() => dispatch({ type: "decrement" })}>-</button>
      <input
        type="number"
        value={state.step}
        onChange={(e) =>
          dispatch({
            type: "set_step",
            step: Number(e.target.value),
          })
        }
      />
      <button onClick={() => dispatch({ type: "reset" })}>重置</button>
    </div>
  );
}
```

### 2. 自定义 Hooks - 逻辑复用新方式

自定义 Hooks 是 React 16.8 最强大的特性之一，允许提取组件逻辑到可复用的函数中。

#### 示例：useLocalStorage Hook

```tsx
// 自定义 Hook
function useLocalStorage(key, initialValue) {
  // 从 localStorage 读取初始值
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // 封装的 setter 函数
  const setValue = useCallback(
    (value) => {
      try {
        // 支持函数形式更新
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue],
  );

  return [storedValue, setValue];
}

// 使用自定义 Hook
function Settings() {
  const [theme, setTheme] = useLocalStorage("theme", "light");
  const [language, setLanguage] = useLocalStorage("language", "zh");

  return (
    <div>
      <select value={theme} onChange={(e) => setTheme(e.target.value)}>
        <option value="light">浅色</option>
        <option value="dark">深色</option>
      </select>
      <select value={language} onChange={(e) => setLanguage(e.target.value)}>
        <option value="zh">中文</option>
        <option value="en">English</option>
      </select>
    </div>
  );
}
```

#### 示例：useAsync Hook

```tsx
// 异步操作封装
function useAsync(asyncFunction, dependencies = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isCancelled = false;

    const execute = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await asyncFunction();
        if (!isCancelled) {
          setData(result);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    execute();

    return () => {
      isCancelled = true;
    };
  }, dependencies);

  return { data, loading, error };
}

// 使用异步 Hook
function UserList() {
  const {
    data: users,
    loading,
    error,
  } = useAsync(
    () => api.getUsers(),
    [], // 空依赖数组，仅在组件挂载时执行
  );

  if (loading) return <div>加载用户列表...</div>;
  if (error) return <div>错误: {error.message}</div>;

  return (
    <ul>
      {users?.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

### 3. 性能优化 Hooks

#### useMemo - 计算结果缓存

```tsx
function ExpensiveComponent({ items, filter }) {
  // 昂贵的过滤计算
  const filteredItems = useMemo(() => {
    console.log("执行过滤计算"); // 只在依赖变化时执行
    return items.filter((item) => item.name.toLowerCase().includes(filter.toLowerCase()));
  }, [items, filter]);

  // 昂贵的统计计算
  const stats = useMemo(() => {
    return {
      total: filteredItems.length,
      completed: filteredItems.filter((item) => item.completed).length,
    };
  }, [filteredItems]);

  return (
    <div>
      <p>
        总计: {stats.total}, 已完成: {stats.completed}
      </p>
      <ul>
        {filteredItems.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

#### useCallback - 回调函数缓存

```tsx
function TodoList({ todos, onToggle, onDelete }) {
  const [filter, setFilter] = useState("all");

  // 缓存过滤函数
  const getFilteredTodos = useCallback(() => {
    switch (filter) {
      case "completed":
        return todos.filter((todo) => todo.completed);
      case "active":
        return todos.filter((todo) => !todo.completed);
      default:
        return todos;
    }
  }, [todos, filter]);

  // 缓存处理函数，避免子组件不必要的重渲染
  const handleToggle = useCallback(
    (id) => {
      onToggle(id);
    },
    [onToggle],
  );

  const handleDelete = useCallback(
    (id) => {
      onDelete(id);
    },
    [onDelete],
  );

  const filteredTodos = getFilteredTodos();

  return (
    <div>
      <FilterBar filter={filter} onFilterChange={setFilter} />
      {filteredTodos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} onToggle={handleToggle} onDelete={handleDelete} />
      ))}
    </div>
  );
}
```

---

## 🔧 使用规则和限制

### Hook 调用规则

React 16.8 引入了严格的 Hook 使用规则，由 ESLint 插件 `eslint-plugin-react-hooks` 强制执行：

#### 1. 只在函数组件或自定义 Hook 中调用

```tsx
// ✅ 正确
function MyComponent() {
  const [state, setState] = useState(0);
  return <div>{state}</div>;
}

// ✅ 正确 - 自定义 Hook
function useCounter() {
  const [count, setCount] = useState(0);
  return [count, setCount];
}

// ❌ 错误 - 普通函数中调用
function regularFunction() {
  const [state, setState] = useState(0); // 违反规则
  return state;
}
```

#### 2. 只在函数顶层调用，不在循环、条件或嵌套函数中调用

```tsx
function MyComponent({ condition }) {
  // ✅ 正确 - 顶层调用
  const [count, setCount] = useState(0);

  // ❌ 错误 - 条件调用
  if (condition) {
    const [name, setName] = useState(""); // 违反规则
  }

  // ❌ 错误 - 循环调用
  for (let i = 0; i < 10; i++) {
    useEffect(() => {}); // 违反规则
  }

  // ❌ 错误 - 嵌套函数调用
  const handleClick = () => {
    const [temp, setTemp] = useState(0); // 违反规则
  };

  return <div>{count}</div>;
}
```

#### 3. 条件逻辑应该放在 Hook 内部

```tsx
function UserProfile({ userId }) {
  // ✅ 正确 - Hook 在顶层，条件在内部
  useEffect(() => {
    if (userId) {
      fetchUser(userId);
    }
  }, [userId]);

  // ✅ 正确 - 使用 Hook 的返回值进行条件渲染
  const user = useUser(userId);

  if (!user) {
    return <div>用户不存在</div>;
  }

  return <div>{user.name}</div>;
}
```

---

## 📈 性能影响和优化

### 渲染优化

React 16.8 的 Hooks 在某些情况下可能带来性能开销，需要合理使用：

```tsx
// ❌ 性能问题 - 每次渲染都创建新对象
function MyComponent() {
  const [user, setUser] = useState({ name: "", age: 0 });

  const updateName = (name) => {
    setUser({ ...user, name }); // 每次都创建新对象
  };

  return <div>{user.name}</div>;
}

// ✅ 优化版本 - 使用函数式更新
function MyComponent() {
  const [user, setUser] = useState({ name: "", age: 0 });

  const updateName = useCallback((name) => {
    setUser((prevUser) => ({ ...prevUser, name }));
  }, []);

  return <div>{user.name}</div>;
}
```

### 依赖数组优化

```tsx
function SearchComponent({ query }) {
  const [results, setResults] = useState([]);

  // ❌ 缺少依赖或依赖过多
  useEffect(() => {
    searchAPI(query).then(setResults);
  }, []); // 缺少 query 依赖

  // ✅ 正确的依赖管理
  useEffect(() => {
    searchAPI(query).then(setResults);
  }, [query]);

  // ✅ 使用 useCallback 优化依赖
  const search = useCallback(async (searchQuery) => {
    const data = await searchAPI(searchQuery);
    setResults(data);
  }, []);

  useEffect(() => {
    search(query);
  }, [query, search]);
}
```

---

## 🔄 迁移策略

### 从类组件迁移到函数组件

#### 状态迁移

```tsx
import { useState, useCallback } from "react";

// 之前：类组件（旧方式，不推荐）
class UserFormOld extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      email: "",
      errors: {},
    };
  }

  handleInputChange = (field) => (event) => {
    this.setState({
      [field]: event.target.value,
      errors: { ...this.state.errors, [field]: "" },
    });
  };

  render() {
    const { name, email, errors } = this.state;
    return (
      <form>
        <input value={name} onChange={this.handleInputChange("name")} />
        <input value={email} onChange={this.handleInputChange("email")} />
      </form>
    );
  }
}

// ✅ 之后：函数组件 + Hooks（推荐）
function UserForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    errors: {},
  });

  const handleInputChange = useCallback(
    (field) => (event) => {
      setFormData((prev) => ({
        ...prev,
        [field]: event.target.value,
        errors: { ...prev.errors, [field]: "" },
      }));
    },
    [],
  );

  return (
    <form>
      <input value={formData.name} onChange={handleInputChange("name")} />
      <input value={formData.email} onChange={handleInputChange("email")} />
    </form>
  );
}
```

#### 生命周期迁移

```tsx
import { useState, useEffect } from "react";

// 之前：类组件生命周期（旧方式，不推荐）
class DataComponentOld extends React.Component {
  constructor(props) {
    super(props);
    this.state = { data: null, loading: true, error: null };
  }

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.id !== this.props.id) {
      this.fetchData();
    }
  }

  componentWillUnmount() {
    this.cancelled = true;
  }

  fetchData = async () => {
    this.setState({ loading: true, error: null });
    try {
      const data = await api.getData(this.props.id);
      if (!this.cancelled) {
        this.setState({ data, loading: false });
      }
    } catch (error) {
      if (!this.cancelled) {
        this.setState({ error, loading: false });
      }
    }
  };

  render() {
    const { data, loading, error } = this.state;
    if (loading) return <div>加载中...</div>;
    if (error) return <div>错误: {error.message}</div>;
    return <div>{data}</div>;
  }
}

// ✅ 之后：函数组件 + useEffect（推荐）
function DataComponent({ id }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await api.getData(id);
        if (!cancelled) {
          setData(result);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err);
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [id]);

  // 组件逻辑...
}
```

---

## 🚀 实际应用场景

### 表单管理

```tsx
// 复杂表单 Hook
function useForm(initialValues, validationRules) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const setValue = useCallback(
    (name, value) => {
      setValues((prev) => ({ ...prev, [name]: value }));

      // 清除对应字段的错误
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: "" }));
      }
    },
    [errors],
  );

  const setError = useCallback((name, error) => {
    setErrors((prev) => ({ ...prev, [name]: error }));
  }, []);

  const setTouched = useCallback((name) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
  }, []);

  const validate = useCallback(() => {
    const newErrors = {};

    Object.keys(validationRules).forEach((field) => {
      const rule = validationRules[field];
      const value = values[field];

      if (rule.required && !value) {
        newErrors[field] = `${field} 是必填项`;
      } else if (rule.pattern && !rule.pattern.test(value)) {
        newErrors[field] = rule.message;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [values, validationRules]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    setValue,
    setError,
    setTouched,
    validate,
    reset,
  };
}

// 使用表单 Hook
function ContactForm() {
  const { values, errors, touched, setValue, setTouched, validate, reset } = useForm(
    { name: "", email: "", message: "" },
    {
      name: { required: true },
      email: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: "请输入有效的邮箱地址",
      },
      message: { required: true },
    },
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      // 提交表单
      console.log("提交:", values);
      reset();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input
          type="text"
          placeholder="姓名"
          value={values.name}
          onChange={(e) => setValue("name", e.target.value)}
          onBlur={() => setTouched("name")}
        />
        {touched.name && errors.name && <span className="error">{errors.name}</span>}
      </div>

      <div>
        <input
          type="email"
          placeholder="邮箱"
          value={values.email}
          onChange={(e) => setValue("email", e.target.value)}
          onBlur={() => setTouched("email")}
        />
        {touched.email && errors.email && <span className="error">{errors.email}</span>}
      </div>

      <div>
        <textarea
          placeholder="消息"
          value={values.message}
          onChange={(e) => setValue("message", e.target.value)}
          onBlur={() => setTouched("message")}
        />
        {touched.message && errors.message && <span className="error">{errors.message}</span>}
      </div>

      <button type="submit">发送</button>
      <button type="button" onClick={reset}>
        重置
      </button>
    </form>
  );
}
```

---

## 🎉 总结

React 16.x 系列是 React 发展历史上的重要转折点，从 React 16.0 到 16.8 累积引入了多个革命性特性：

### 🏆 React 16.x 系列核心特性回顾

| 版本     | 核心特性                             | 影响                        |
| -------- | ------------------------------------ | --------------------------- |
| **16.0** | Fragments, Portals, Error Boundaries | 解决 DOM 结构和错误处理问题 |
| **16.3** | 新的 Context API                     | 更好的跨组件数据传递        |
| **16.6** | React.memo, Suspense, React.lazy     | 性能优化和代码分割          |
| **16.8** | Hooks API                            | 彻底改变开发范式            |

### 💡 主要优势

1. **Fragments**: 避免额外 DOM 节点，保持 HTML 结构语义化
2. **Portals**: 跨 DOM 层级渲染，解决模态框等场景问题
3. **Error Boundaries**: 组件级错误捕获，提升应用健壮性
4. **Context API**: 更优雅的全局状态管理方案
5. **Suspense & Lazy**: 代码分割和按需加载，优化性能
6. **React.memo**: 函数组件性能优化利器
7. **Hooks**: 逻辑复用新方式，函数组件拥有完整能力

### 📝 最佳实践

#### 结构优化

- 使用 **Fragments** 避免无意义的包裹元素
- 使用 **Portals** 处理模态框、工具提示等跨层级 UI
- 使用 **Error Boundaries** 实现优雅的错误降级

#### 状态管理

- 使用新的 **Context API** 替代旧的 context
- 使用 **Hooks** (useState, useReducer) 管理组件状态
- 使用 **useContext** 简化 Context 消费

#### 性能优化

- 使用 **React.memo** 优化函数组件渲染
- 使用 **useMemo** 和 **useCallback** 避免不必要的计算和渲染
- 使用 **Suspense & React.lazy** 实现路由级代码分割

#### 代码组织

- 使用 **自定义 Hooks** 提取和复用组件逻辑
- 遵循 **Hook 规则**，使用 ESLint 插件强制执行
- **渐进式迁移**，不必急于重写所有类组件

React 16.x 系列为现代 React 开发奠定了坚实基础，其引入的概念和模式在后续版本（17、18、19）中得到了进一步的发展和完善。
