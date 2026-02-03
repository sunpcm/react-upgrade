# React 18 新特性详解

> **发布日期**: 2022年3月29日  
> **里程碑版本**: 并发渲染时代的开启

## 🎯 版本突破

React 18 是 React 历史上的又一个重大版本，相比 React 17 的"过渡版本"定位，React 18 带来了**革命性的并发渲染（Concurrent Rendering）**特性。这个版本不仅引入了新的 API，更重要的是为 React 应用提供了更好的用户体验和性能优化能力。

---

## 🆕 核心变化对比 React 17

### 1. 新的渲染 API - createRoot

#### React 17 的渲染方式

```tsx
// React 17 - 传统渲染 API
import ReactDOM from "react-dom";
import App from "./App";

// 使用 ReactDOM.render
ReactDOM.render(<App />, document.getElementById("root"));

// 底层行为：
// - 同步渲染，阻塞主线程
// - 无法中断渲染过程
// - 不支持并发特性
```

#### React 18 的新渲染方式

```tsx
// React 18 - 并发渲染 API
import { createRoot } from "react-dom/client";
import App from "./App";

// 使用 createRoot
const container = document.getElementById("root");
if (!container) throw new Error("Root container not found");

const root = createRoot(container);
root.render(<App />);

// 底层行为：
// - 支持并发渲染
// - 可中断和恢复渲染
// - 启用所有 React 18 新特性
```

#### 渲染行为对比

```tsx
// 性能密集型组件示例
function HeavyComponent({ items }) {
  // 模拟大量计算
  const processedItems = items.map((item) => ({
    ...item,
    processed: heavyCalculation(item), // 耗时操作
  }));

  return (
    <ul>
      {processedItems.map((item) => (
        <li key={item.id}>
          {item.name}: {item.processed}
        </li>
      ))}
    </ul>
  );
}

// React 17 行为：
// - 渲染开始后无法中断
// - 大量数据会导致主线程阻塞
// - 用户交互可能卡顿

// React 18 行为：
// - 渲染过程可以被高优先级任务中断
// - 渲染工作分片执行
// - 保持界面响应性
```

### 2. 自动批处理 (Automatic Batching)

#### React 17 的批处理限制

```tsx
// React 17 - 有限的批处理
function Button() {
  const [count, setCount] = useState(0);
  const [flag, setFlag] = useState(false);

  // ✅ React 事件处理器中的更新会被批处理
  const handleClick = () => {
    console.log("批处理开始");
    setCount((c) => c + 1); // 不会立即触发重渲染
    setFlag((f) => !f); // 不会立即触发重渲染
    console.log("批处理结束"); // 两个更新会被合并为一次重渲染
  };

  // ❌ 异步操作中的更新不会被批处理
  const handleAsyncClick = () => {
    setTimeout(() => {
      console.log("异步更新开始");
      setCount((c) => c + 1); // 触发一次重渲染
      setFlag((f) => !f); // 触发另一次重渲染
      console.log("异步更新结束"); // 总共两次重渲染
    }, 0);
  };

  // ❌ Promise 中的更新不会被批处理
  const handlePromiseClick = () => {
    Promise.resolve().then(() => {
      setCount((c) => c + 1); // 触发一次重渲染
      setFlag((f) => !f); // 触发另一次重渲染
    });
  };

  console.log("组件重渲染"); // 观察渲染次数

  return (
    <div>
      <p>
        Count: {count}, Flag: {flag.toString()}
      </p>
      <button onClick={handleClick}>同步更新</button>
      <button onClick={handleAsyncClick}>异步更新</button>
      <button onClick={handlePromiseClick}>Promise更新</button>
    </div>
  );
}
```

#### React 18 的自动批处理

```tsx
// React 18 - 自动批处理所有更新
function Button() {
  const [count, setCount] = useState(0);
  const [flag, setFlag] = useState(false);

  // ✅ React 事件处理器 - 批处理（与 React 17 相同）
  const handleClick = () => {
    console.log("同步批处理开始");
    setCount((c) => c + 1);
    setFlag((f) => !f);
    console.log("同步批处理结束"); // 仍然是一次重渲染
  };

  // ✅ 异步操作 - 现在也会批处理！
  const handleAsyncClick = () => {
    setTimeout(() => {
      console.log("异步批处理开始");
      setCount((c) => c + 1); // 不会立即触发重渲染
      setFlag((f) => !f); // 不会立即触发重渲染
      console.log("异步批处理结束"); // 🆕 合并为一次重渲染！
    }, 0);
  };

  // ✅ Promise - 现在也会批处理！
  const handlePromiseClick = () => {
    Promise.resolve().then(() => {
      console.log("Promise批处理开始");
      setCount((c) => c + 1); // 不会立即触发重渲染
      setFlag((f) => !f); // 不会立即触发重渲染
      console.log("Promise批处理结束"); // 🆕 合并为一次重渲染！
    });
  };

  // ✅ 网络请求 - 也会批处理！
  const handleFetchClick = async () => {
    const response = await fetch("/api/data");
    const data = await response.json();

    // 这些更新会被自动批处理
    setCount(data.count);
    setFlag(data.flag);
    // 只触发一次重渲染！
  };

  console.log("组件重渲染"); // React 18 中渲染次数显著减少

  return (
    <div>
      <p>
        Count: {count}, Flag: {flag.toString()}
      </p>
      <button onClick={handleClick}>同步更新</button>
      <button onClick={handleAsyncClick}>异步更新</button>
      <button onClick={handlePromiseClick}>Promise更新</button>
      <button onClick={handleFetchClick}>网络请求更新</button>
    </div>
  );
}
```

#### 退出批处理（如需要）

```tsx
// React 18 - 强制同步更新
import { flushSync } from "react-dom";

function SyncUpdateComponent() {
  const [count, setCount] = useState(0);
  const [flag, setFlag] = useState(false);

  const handleClick = () => {
    // 强制同步执行，不进行批处理
    flushSync(() => {
      setCount((c) => c + 1); // 立即触发重渲染
    });

    flushSync(() => {
      setFlag((f) => !f); // 立即触发另一次重渲染
    });

    console.log("两次独立的同步更新");
  };

  return <button onClick={handleClick}>强制同步更新</button>;
}
```

### 3. 并发特性 - Transitions

#### React 17 的更新优先级

```tsx
// React 17 - 所有更新都是紧急的
function SearchApp() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  // 用户输入和搜索结果更新优先级相同
  const handleSearch = (value) => {
    setQuery(value); // 紧急：用户输入反馈

    // 昂贵的搜索操作
    const searchResults = performExpensiveSearch(value);
    setResults(searchResults); // 紧急：搜索结果更新

    // 问题：昂贵的搜索会阻塞用户输入的渲染
  };

  return (
    <div>
      <input value={query} onChange={(e) => handleSearch(e.target.value)} placeholder="搜索..." />
      <SearchResults results={results} />
    </div>
  );
}

// React 17 行为：
// 1. 用户快速输入时界面可能卡顿
// 2. 无法区分紧急和非紧急更新
// 3. 所有更新都会阻塞渲染
```

#### React 18 的 Transitions

```tsx
// React 18 - 使用 useTransition 区分优先级
import { useState, useTransition } from "react";

function SearchApp() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isPending, startTransition] = useTransition();

  const handleSearch = (value) => {
    // 紧急更新：立即响应用户输入
    setQuery(value);

    // 非紧急更新：可以被中断的搜索
    startTransition(() => {
      const searchResults = performExpensiveSearch(value);
      setResults(searchResults);
    });
  };

  return (
    <div>
      <input value={query} onChange={(e) => handleSearch(e.target.value)} placeholder="搜索..." />

      {/* 显示加载状态 */}
      {isPending && <div>搜索中...</div>}

      {/* 搜索结果可能延迟显示，但不会阻塞输入 */}
      <SearchResults results={results} />
    </div>
  );
}

// React 18 行为：
// 1. 用户输入始终保持响应
// 2. 搜索结果更新可以被用户输入中断
// 3. 提供加载状态反馈
```

#### 复杂场景的 Transition 应用

```tsx
// 大数据列表的过滤
function DataTable({ data }) {
  const [filter, setFilter] = useState("");
  const [filteredData, setFilteredData] = useState(data);
  const [isPending, startTransition] = useTransition();

  const handleFilterChange = (value) => {
    // 立即更新输入框
    setFilter(value);

    // 非紧急：昂贵的过滤操作
    startTransition(() => {
      const filtered = data.filter(
        (item) =>
          item.name.toLowerCase().includes(value.toLowerCase()) ||
          item.description.toLowerCase().includes(value.toLowerCase()),
      );
      setFilteredData(filtered);
    });
  };

  return (
    <div>
      <input
        value={filter}
        onChange={(e) => handleFilterChange(e.target.value)}
        placeholder="过滤数据..."
      />

      <div style={{ opacity: isPending ? 0.7 : 1 }}>
        {filteredData.map((item) => (
          <div key={item.id}>
            <h3>{item.name}</h3>
            <p>{item.description}</p>
          </div>
        ))}
      </div>

      {isPending && <div>正在过滤...</div>}
    </div>
  );
}
```

### 4. 新的 Hooks

#### useId - 唯一 ID 生成

```tsx
// React 17 - 手动管理 ID，SSR 问题
let globalId = 0;

function FormField({ label, children }) {
  // ❌ 服务端和客户端 ID 不匹配
  const [id] = useState(() => `field-${++globalId}`);

  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <div id={id}>{children}</div>
    </div>
  );
}

// React 18 - useId 解决 SSR 一致性
import { useId } from "react";

function FormField({ label, children }) {
  // ✅ 服务端和客户端 ID 保持一致
  const id = useId();

  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <div id={id}>{children}</div>
    </div>
  );
}

// 复杂表单示例
function ContactForm() {
  const nameId = useId();
  const emailId = useId();
  const messageId = useId();

  return (
    <form>
      <div>
        <label htmlFor={nameId}>姓名</label>
        <input id={nameId} type="text" />
      </div>

      <div>
        <label htmlFor={emailId}>邮箱</label>
        <input id={emailId} type="email" />
      </div>

      <div>
        <label htmlFor={messageId}>消息</label>
        <textarea id={messageId} />
      </div>
    </form>
  );
}
```

#### useDeferredValue - 延迟值更新

```tsx
// React 17 - 防抖处理
import { useState, useEffect } from "react";

function SearchComponent() {
  const [query, setQuery] = useState("");
  const [deferredQuery, setDeferredQuery] = useState("");

  // 手动实现防抖
  useEffect(() => {
    const timer = setTimeout(() => {
      setDeferredQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <SearchResults query={deferredQuery} />
    </div>
  );
}

// React 18 - useDeferredValue
import { useState, useDeferredValue } from "react";

function SearchComponent() {
  const [query, setQuery] = useState("");
  // 🆕 延迟值，低优先级更新
  const deferredQuery = useDeferredValue(query);

  return (
    <div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      {/* deferredQuery 的更新不会阻塞用户输入 */}
      <SearchResults query={deferredQuery} />
    </div>
  );
}

// 高级用法：配合 memo 优化
import { memo } from "react";

const SearchResults = memo(function SearchResults({ query }) {
  const results = performExpensiveSearch(query);

  return (
    <ul>
      {results.map((result) => (
        <li key={result.id}>{result.title}</li>
      ))}
    </ul>
  );
});

function App() {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  // 只有当 deferredQuery 真正改变时，SearchResults 才会重新计算
  return (
    <div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="输入搜索..." />
      <SearchResults query={deferredQuery} />
    </div>
  );
}
```

#### useSyncExternalStore - 外部状态同步

```tsx
// React 17 - 手动订阅外部 store
function useWindowWidth() {
  const [width, setWidth] = useState(() => window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return width;
}

// React 18 - useSyncExternalStore
import { useSyncExternalStore } from "react";

function useWindowWidth() {
  return useSyncExternalStore(
    // subscribe: 订阅函数
    (callback) => {
      window.addEventListener("resize", callback);
      return () => window.removeEventListener("resize", callback);
    },
    // getSnapshot: 获取当前值
    () => window.innerWidth,
    // getServerSnapshot: 服务端渲染时的值（可选）
    () => 1024, // 服务端默认宽度
  );
}

// 复杂的外部 store 示例
class UserStore {
  constructor() {
    this.user = null;
    this.listeners = new Set();
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  getUser() {
    return this.user;
  }

  setUser(user) {
    this.user = user;
    this.listeners.forEach((callback) => callback());
  }
}

const userStore = new UserStore();

function useUser() {
  return useSyncExternalStore(
    userStore.subscribe.bind(userStore),
    userStore.getUser.bind(userStore),
    () => null, // 服务端默认值
  );
}

function UserProfile() {
  const user = useUser();

  if (!user) {
    return <div>请登录</div>;
  }

  return (
    <div>
      <h1>欢迎，{user.name}!</h1>
      <p>邮箱：{user.email}</p>
    </div>
  );
}
```

#### useInsertionEffect - CSS-in-JS 优化

```tsx
// React 17 - CSS-in-JS 库的问题
function StyledComponent() {
  // 样式可能在组件渲染后才插入，导致闪烁
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `.my-style { color: red; }`;
    document.head.appendChild(style);

    return () => document.head.removeChild(style);
  }, []);

  return <div className="my-style">带样式的组件</div>;
}

// React 18 - useInsertionEffect
import { useInsertionEffect } from "react";

function StyledComponent() {
  // 🆕 在 DOM 变更之前同步执行，避免样式闪烁
  useInsertionEffect(() => {
    const style = document.createElement("style");
    style.textContent = `.my-style { color: red; }`;
    document.head.appendChild(style);

    return () => document.head.removeChild(style);
  }, []);

  return <div className="my-style">带样式的组件</div>;
}

// CSS-in-JS 库的实际应用
function useStyles(styles) {
  const className = useMemo(() => `generated-${Math.random().toString(36).substr(2, 9)}`, []);

  useInsertionEffect(() => {
    const css = Object.entries(styles)
      .map(([key, value]) => `${key}: ${value};`)
      .join(" ");

    const styleElement = document.createElement("style");
    styleElement.textContent = `.${className} { ${css} }`;
    document.head.appendChild(styleElement);

    return () => {
      if (document.head.contains(styleElement)) {
        document.head.removeChild(styleElement);
      }
    };
  }, [className, styles]);

  return className;
}

function DynamicStyledComponent({ color, fontSize }) {
  const className = useStyles({
    color,
    "font-size": fontSize,
    "font-weight": "bold",
  });

  return <div className={className}>动态样式组件</div>;
}
```

#### 为什么我们需要它？（性能瓶颈在哪里？）

在 React 中，CSS-in-JS 库通常需要在组件运行时**动态生成 CSS 类名**，并把 `<style>` 标签插入到文档的 `<head>` 里。

在 `useInsertionEffect` 出现之前，库作者基本只能在两个“都不太好”的时机里选一个：

##### 1) 在 `useLayoutEffect` 中插入样式

**流程：**

1. React 计算 DOM
2. 浏览器计算布局（layout）
3. `useLayoutEffect` 运行
4. 插入新的 CSS
5. 浏览器被迫重新计算布局
6. 绘制（paint）

**后果：布局抖动（Layout Thrashing）**

浏览器刚算好每个元素多宽多高，你突然塞进来一段 CSS 说“所有 `div` 都要变大”，浏览器只能再重算一遍——性能很差、很卡。

---

##### 2) 在 `useEffect` 中插入样式

**流程：**

1. 绘制（paint）
2. `useEffect` 运行
3. 插入 CSS
4. 重新绘制

**后果：样式闪烁（FOUC）**

用户会先看到一个“没样式的丑页面”，然后样式突然出现。

---

#### React 18 的解决方案

我们需要一个时间点：在 **“DOM 发生变化之前”** 就能把 `<style>` 塞进去。这样当 React 真正去更新 DOM，以及后续 `useLayoutEffect` 读取布局时，样式已经就位。

这就是 `useInsertionEffect`。

---

#### 执行时机：Hook 的三兄弟

为了理解它的位置，先看 React 更新 DOM 的流水线：

1. **Render Phase**（组件函数执行，计算 Virtual DOM）
2. **Commit Phase Begins**
3. **🛑 `useInsertionEffect` 执行**（这里！趁 DOM 还没变，赶紧插入 style）
4. **DOM Mutations**（React 真正修改 DOM 节点）
5. **🛑 `useLayoutEffect` 执行**（此时读取 DOM 布局是安全的，样式已生效）
6. **Browser Paint**（浏览器把像素画到屏幕上）
7. **🛑 `useEffect` 执行**（异步，不阻塞渲染）

**三个 Hook 的对比：**

| Hook                 | 执行时机           | 用途               | 是否阻塞渲染 |
| -------------------- | ------------------ | ------------------ | ------------ |
| `useInsertionEffect` | DOM 变更前         | 插入全局样式       | ✅ 阻塞      |
| `useLayoutEffect`    | DOM 变更后，绘制前 | 读取布局、同步 DOM | ✅ 阻塞      |
| `useEffect`          | 绘制后             | 副作用、异步操作   | ❌ 不阻塞    |

---

## 🔧 Suspense 增强

### React 17 的 Suspense 限制

```tsx
// React 17 - Suspense 主要用于代码分割
import { Suspense, lazy } from "react";

const LazyComponent = lazy(() => import("./LazyComponent"));

function App() {
  return (
    <div>
      <Suspense fallback={<div>加载中...</div>}>
        <LazyComponent />
      </Suspense>
    </div>
  );
}

// 数据获取需要手动处理
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser(userId).then((userData) => {
      setUser(userData);
      setLoading(false);
    });
  }, [userId]);

  if (loading) return <div>加载用户信息...</div>;
  return <div>用户：{user.name}</div>;
}
```

### React 18 的 Suspense 改进

```tsx
// React 18 - Suspense 支持数据获取
function createResource(promise) {
  let status = "pending";
  let result;

  const suspender = promise.then(
    (response) => {
      status = "success";
      result = response;
    },
    (error) => {
      status = "error";
      result = error;
    },
  );

  return {
    read() {
      if (status === "pending") {
        throw suspender; // Suspense 会捕获这个 Promise
      } else if (status === "error") {
        throw result;
      } else if (status === "success") {
        return result;
      }
    },
  };
}

// 数据获取组件
function UserProfile({ userId }) {
  const userResource = useMemo(() => createResource(fetchUser(userId)), [userId]);

  const user = userResource.read(); // 可能抛出 Promise

  return <div>用户：{user.name}</div>;
}

// 使用 Suspense 包装
function App() {
  const [userId, setUserId] = useState(1);

  return (
    <div>
      <button onClick={() => setUserId((id) => id + 1)}>切换用户</button>

      <Suspense fallback={<div>加载用户信息...</div>}>
        <UserProfile userId={userId} />
      </Suspense>
    </div>
  );
}

// 嵌套 Suspense 边界
function Dashboard() {
  return (
    <div>
      <h1>仪表板</h1>

      <Suspense fallback={<div>加载用户信息...</div>}>
        <UserInfo />
      </Suspense>

      <Suspense fallback={<div>加载统计数据...</div>}>
        <Statistics />
      </Suspense>

      <Suspense fallback={<div>加载最新消息...</div>}>
        <RecentMessages />
      </Suspense>
    </div>
  );
}
```

---

## ⚡ 性能优化对比

### 渲染性能测试

```tsx
// 性能测试组件
function PerformanceTest() {
  const [count, setCount] = useState(0);
  const [items, setItems] = useState(() =>
    Array.from({ length: 10000 }, (_, i) => ({ id: i, value: i })),
  );

  // 昂贵的计算
  const expensiveValue = useMemo(() => {
    console.log("执行昂贵计算");
    return items.reduce((sum, item) => sum + item.value, 0);
  }, [items]);

  const [isPending, startTransition] = useTransition();

  const handleUpdate = () => {
    // 紧急更新
    setCount((c) => c + 1);

    // 非紧急更新
    startTransition(() => {
      setItems((prevItems) =>
        prevItems.map((item) => ({
          ...item,
          value: item.value + Math.random(),
        })),
      );
    });
  };

  return (
    <div>
      <h2>性能测试</h2>
      <p>计数：{count}</p>
      <p>总和：{expensiveValue}</p>
      <p>状态：{isPending ? "更新中..." : "完成"}</p>

      <button onClick={handleUpdate}>更新数据 ({items.length} 项)</button>

      {/* React 18: 这个列表的更新不会阻塞按钮点击 */}
      <div style={{ opacity: isPending ? 0.7 : 1 }}>
        {items.slice(0, 100).map((item) => (
          <div key={item.id}>
            项目 {item.id}: {item.value.toFixed(2)}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 批处理性能对比

```tsx
// 批处理性能测试
function BatchingTest() {
  const [renders, setRenders] = useState(0);
  const [updates, setUpdates] = useState([]);

  // 记录每次渲染
  const renderCount = useRef(0);
  renderCount.current++;

  useEffect(() => {
    setRenders(renderCount.current);
  });

  const performUpdates = (type) => {
    const startTime = performance.now();

    if (type === "sync") {
      // 同步更新（React 17 和 18 都会批处理）
      setUpdates((prev) => [...prev, "sync1"]);
      setUpdates((prev) => [...prev, "sync2"]);
      setUpdates((prev) => [...prev, "sync3"]);
    } else if (type === "async") {
      // 异步更新
      setTimeout(() => {
        setUpdates((prev) => [...prev, "async1"]);
        setUpdates((prev) => [...prev, "async2"]);
        setUpdates((prev) => [...prev, "async3"]);

        const endTime = performance.now();
        console.log(`${type} 更新耗时:`, endTime - startTime);
      }, 0);
    } else if (type === "promise") {
      // Promise 更新
      Promise.resolve().then(() => {
        setUpdates((prev) => [...prev, "promise1"]);
        setUpdates((prev) => [...prev, "promise2"]);
        setUpdates((prev) => [...prev, "promise3"]);

        const endTime = performance.now();
        console.log(`${type} 更新耗时:`, endTime - startTime);
      });
    }
  };

  return (
    <div>
      <h2>批处理测试</h2>
      <p>总渲染次数：{renders}</p>
      <p>更新记录：{updates.join(", ")}</p>

      <button onClick={() => performUpdates("sync")}>同步更新 (React 17 和 18 都批处理)</button>

      <button onClick={() => performUpdates("async")}>异步更新 (只有 React 18 批处理)</button>

      <button onClick={() => performUpdates("promise")}>Promise更新 (只有 React 18 批处理)</button>

      <button onClick={() => setUpdates([])}>清空记录</button>
    </div>
  );
}
```

---

## 🔧 配置变更指南

### 1. 包依赖更新

```json
// React 17 依赖
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

// React 18 依赖
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    // 🆕 Fast Refresh 支持
    "@pmmmwh/react-refresh-webpack-plugin": "^0.6.2",
    "react-refresh": "^0.18.0"
  }
}
```

### 2. Babel 配置增强

```javascript
// React 17 配置
module.exports = {
  presets: [
    [
      "@babel/preset-react",
      {
        runtime: "automatic",
      },
    ],
  ],
};

// React 18 配置（增加 Fast Refresh）
module.exports = {
  presets: [
    [
      "@babel/preset-react",
      {
        runtime: "automatic",
      },
    ],
  ],
  plugins: [
    // 🆕 开发模式启用 Fast Refresh
    process.env.NODE_ENV === "development" && "react-refresh/babel",
  ].filter(Boolean),
};
```

### 3. Webpack 配置更新

```javascript
// React 17 webpack 配置
module.exports = {
  // ... 其他配置
  plugins: [new webpack.HotModuleReplacementPlugin()],
};

// React 18 webpack 配置
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");

module.exports = {
  // ... 其他配置
  plugins: [
    // 🆕 React Fast Refresh
    process.env.NODE_ENV === "development" && new ReactRefreshWebpackPlugin(),
    new webpack.HotModuleReplacementPlugin(),
  ].filter(Boolean),
};
```

### 4. ESLint 配置调整

```javascript
// React 17 配置
module.exports = {
  settings: {
    react: { version: "17.0" },
  },
  rules: {
    "react/no-deprecated": "off", // ReactDOM.render 仍然有效
  },
};

// React 18 配置
module.exports = {
  settings: {
    react: { version: "18.3" },
  },
  rules: {
    "react/no-deprecated": "warn", // 🆕 警告使用 ReactDOM.render
  },
};
```

---

## 🚀 实际应用场景

### 1. 大数据列表优化

```tsx
// React 17 实现
function LargeList({ data }) {
  const [filter, setFilter] = useState("");
  const [filteredData, setFilteredData] = useState(data);

  // 问题：过滤操作会阻塞用户输入
  useEffect(() => {
    const filtered = data.filter((item) => item.name.toLowerCase().includes(filter.toLowerCase()));
    setFilteredData(filtered);
  }, [data, filter]);

  return (
    <div>
      <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="搜索..." />
      <div>
        {filteredData.map((item) => (
          <div key={item.id}>{item.name}</div>
        ))}
      </div>
    </div>
  );
}

// React 18 优化实现
function LargeList({ data }) {
  const [filter, setFilter] = useState("");
  const [filteredData, setFilteredData] = useState(data);
  const [isPending, startTransition] = useTransition();

  // 解决方案：使用 transition 避免阻塞
  const handleFilterChange = (value) => {
    setFilter(value); // 紧急更新：立即更新输入框

    startTransition(() => {
      // 非紧急更新：可以被中断的过滤操作
      const filtered = data.filter((item) => item.name.toLowerCase().includes(value.toLowerCase()));
      setFilteredData(filtered);
    });
  };

  return (
    <div>
      <input
        value={filter}
        onChange={(e) => handleFilterChange(e.target.value)}
        placeholder="搜索..."
      />

      <div style={{ opacity: isPending ? 0.6 : 1 }}>
        {isPending && <div>搜索中...</div>}
        {filteredData.map((item) => (
          <div key={item.id}>{item.name}</div>
        ))}
      </div>
    </div>
  );
}
```

### 2. 复杂表单优化

```tsx
// React 18 - 表单性能优化
function ComplexForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    description: "",
  });
  const [preview, setPreview] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleInputChange = (field, value) => {
    // 立即更新表单字段
    setFormData((prev) => ({ ...prev, [field]: value }));

    // 延迟更新预览（昂贵操作）
    startTransition(() => {
      setPreview(generatePreview(formData, field, value));
    });
  };

  return (
    <form>
      <input
        type="text"
        value={formData.name}
        onChange={(e) => handleInputChange("name", e.target.value)}
        placeholder="姓名"
      />

      <input
        type="email"
        value={formData.email}
        onChange={(e) => handleInputChange("email", e.target.value)}
        placeholder="邮箱"
      />

      <textarea
        value={formData.description}
        onChange={(e) => handleInputChange("description", e.target.value)}
        placeholder="描述"
      />

      <div>
        <h3>预览 {isPending && "(更新中...)"}</h3>
        <div style={{ opacity: isPending ? 0.7 : 1 }}>{preview}</div>
      </div>
    </form>
  );
}
```

### 3. 数据获取模式

```tsx
// React 18 - Suspense 数据获取模式
function UserDashboard({ userId }) {
  return (
    <div>
      <h1>用户仪表板</h1>

      {/* 并行加载多个资源 */}
      <Suspense fallback={<UserInfoSkeleton />}>
        <UserInfo userId={userId} />
      </Suspense>

      <Suspense fallback={<StatsSkeleton />}>
        <UserStats userId={userId} />
      </Suspense>

      <Suspense fallback={<ActivitySkeleton />}>
        <RecentActivity userId={userId} />
      </Suspense>
    </div>
  );
}

// 错误边界结合 Suspense
function UserDashboardWithErrorHandling({ userId }) {
  return (
    <ErrorBoundary fallback={<div>加载出错，请重试</div>}>
      <Suspense fallback={<div>加载中...</div>}>
        <UserDashboard userId={userId} />
      </Suspense>
    </ErrorBoundary>
  );
}
```

---

## ⚠️ 升级注意事项

### 1. 破坏性变更

```tsx
// ❌ React 18 中必须更改的地方

// 1. 渲染 API 更改
// React 17
import ReactDOM from "react-dom";
ReactDOM.render(<App />, container);

// React 18 - 必须使用 createRoot
import { createRoot } from "react-dom/client";
const root = createRoot(container);
root.render(<App />);

// 2. Strict Mode 行为变化
// React 18 的 Strict Mode 会双重调用 Effects
function MyComponent() {
  useEffect(() => {
    console.log("这在 React 18 Strict Mode 中会打印两次");

    // 确保副作用是幂等的
    const subscription = subscribe();
    return () => subscription.unsubscribe();
  }, []);
}

// 3. 自动批处理可能改变时序
// 某些依赖更新时序的代码可能需要调整
function TimingSensitiveComponent() {
  const [count, setCount] = useState(0);
  const [doubled, setDoubled] = useState(0);

  const handleClick = () => {
    setTimeout(() => {
      setCount(1);
      // React 17: 这里 doubled 会立即基于旧的 count 计算
      // React 18: 由于批处理，count 和 doubled 会一起更新
      setDoubled(count * 2); // 可能需要使用函数式更新
    }, 0);
  };

  // 修复方法：
  const handleClickFixed = () => {
    setTimeout(() => {
      setCount(1);
      setDoubled((prev) => 1 * 2); // 使用具体值而不是依赖 state
    }, 0);
  };
}
```

### 2. TypeScript 类型更新

```typescript
// React 17 类型
interface Props {
  children: React.ReactNode;
}

// React 18 新增类型
interface Props {
  children: React.ReactNode;
}

// 新的 Hook 类型
import { useTransition, useDeferredValue, useId } from "react";

function TypedComponent() {
  // useTransition 返回类型
  const [isPending, startTransition]: [boolean, TransitionStartFunction] = useTransition();

  // useDeferredValue 返回类型与输入相同
  const query: string = "test";
  const deferredQuery: string = useDeferredValue(query);

  // useId 返回字符串
  const id: string = useId();
}
```

---

## 🎉 总结

React 18 相比 React 17 带来了**质的飞跃**，从过渡版本升级到了功能丰富的并发渲染版本：

### 🏆 核心优势对比

| 特性         | React 17          | React 18           |
| ------------ | ----------------- | ------------------ |
| **渲染模式** | 同步渲染          | 并发渲染           |
| **批处理**   | 仅 React 事件     | 所有更新自动批处理 |
| **优先级**   | 无优先级区分      | Transitions 支持   |
| **用户体验** | 可能阻塞          | 始终响应           |
| **数据获取** | 手动处理          | Suspense 增强      |
| **新 Hooks** | 无                | 6个新 Hook         |
| **开发体验** | Fast Refresh 可选 | 完整支持           |

### 📈 性能提升

1. **自动批处理** - 显著减少重渲染次数
2. **并发渲染** - 保持界面响应性
3. **智能调度** - 优先级驱动的更新
4. **更好的 Suspense** - 优化数据加载体验

### 🎯 升级建议

- **必要升级** - createRoot API 是必需的变更
- **渐进式采用** - 新特性可以逐步引入
- **重要优化** - 充分利用并发特性提升用户体验
- **面向未来** - 为 React 19+ 版本做好准备

React 18 标志着 React 进入了**并发时代**，为构建更流畅、响应更快的用户界面提供了强大的工具。
