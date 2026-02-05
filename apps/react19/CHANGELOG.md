# React 19 新特性详解

> **发布日期**: 2024年12月5日  
> **里程碑版本**: React Compiler 和 Actions 时代

## 🎯 版本革命

React 19 相比 React 18 的并发渲染基础，进一步引入了**React Compiler（自动优化）**和**Actions（简化数据提交）**等革命性特性。这个版本不仅让 React 应用更智能，还大大简化了开发者的心智负担，标志着 React 进入了**自动化优化时代**。

---

## 🆕 核心变化对比 React 18

### 1. React Compiler - 告别手动优化

#### React 18 的性能优化负担

```tsx
// React 18 - 需要大量手动优化
import { memo, useMemo, useCallback } from "react";

const ExpensiveItem = memo(function ExpensiveItem({ item, onUpdate }) {
  // 手动缓存计算结果
  const processedData = useMemo(() => {
    return heavyProcessing(item.data);
  }, [item.data]);

  // 手动缓存回调函数
  const handleClick = useCallback(() => {
    onUpdate(item.id, processedData);
  }, [item.id, processedData, onUpdate]);

  return (
    <div onClick={handleClick}>
      {item.name}: {processedData}
    </div>
  );
});

// 父组件也需要手动优化
function ItemList({ items, onItemUpdate }) {
  // 手动缓存回调以避免子组件重渲染
  const handleUpdate = useCallback(
    (id, data) => {
      onItemUpdate(id, data);
    },
    [onItemUpdate],
  );

  // 手动缓存过滤结果
  const visibleItems = useMemo(() => {
    return items.filter((item) => item.visible);
  }, [items]);

  return (
    <div>
      {visibleItems.map((item) => (
        <ExpensiveItem
          key={item.id}
          item={item}
          onUpdate={handleUpdate} // 必须缓存
        />
      ))}
    </div>
  );
}

// 问题：
// 1. 大量样板代码
// 2. 容易遗漏优化点
// 3. 过度优化导致代码复杂
// 4. 依赖数组维护困难
```

#### React 19 的 React Compiler 自动优化

```tsx
// React 19 - React Compiler 自动处理优化
function ExpensiveItem({ item, onUpdate }) {
  // 🆕 不再需要 useMemo，编译器自动优化
  const processedData = heavyProcessing(item.data);

  // 🆕 不再需要 useCallback，编译器自动缓存
  const handleClick = () => {
    onUpdate(item.id, processedData);
  };

  return (
    <div onClick={handleClick}>
      {item.name}: {processedData}
    </div>
  );
}

// 🆕 不再需要 memo，编译器自动判断何时重渲染
function ItemList({ items, onItemUpdate }) {
  // 🆕 编译器自动优化过滤操作
  const visibleItems = items.filter((item) => item.visible);

  // 🆕 编译器自动优化回调函数
  const handleUpdate = (id, data) => {
    onItemUpdate(id, data);
  };

  return (
    <div>
      {visibleItems.map((item) => (
        <ExpensiveItem
          key={item.id}
          item={item}
          onUpdate={handleUpdate} // 编译器自动处理依赖
        />
      ))}
    </div>
  );
}

// 编译器优化效果：
// ✅ 自动检测依赖变化
// ✅ 智能跳过不必要的重渲染
// ✅ 自动缓存昂贵的计算
// ✅ 优化回调函数引用
// ✅ 减少 90% 的优化样板代码
```

#### React Compiler 工作原理示例

- 静态分析：像 ESLint 一样理解你的代码语法和数据流向。
- 自动插入缓存：把组件拆解成如果不依赖外部变化就不会重新执行的“块”。
- 引用稳定性：保证只要原始数据没变，生成的对象、函数、JSX 节点的引用地址就永远不变

```tsx
// 开发者编写的代码
function ProductCard({ product, onAddToCart }) {
  const discount = calculateDiscount(product.price, product.category);
  const finalPrice = product.price - discount;

  const handleAddToCart = () => {
    onAddToCart({
      ...product,
      finalPrice,
      timestamp: Date.now(),
    });
  };

  return (
    <div>
      <h3>{product.name}</h3>
      <p>原价: ${product.price}</p>
      <p>折扣: ${discount}</p>
      <p>现价: ${finalPrice}</p>
      <button onClick={handleAddToCart}>加入购物车</button>
    </div>
  );
}

// React 18 手动优化版本
function ProductCard({ product, onAddToCart }) {
  const discount = useMemo(
    () => calculateDiscount(product.price, product.category),
    [product.price, product.category],
  );

  const finalPrice = useMemo(() => product.price - discount, [product.price, discount]);

  const handleAddToCart = useCallback(() => {
    onAddToCart({
      ...product,
      finalPrice,
      timestamp: Date.now(),
    });
  }, [product, finalPrice, onAddToCart]);

  return (
    <div>
      <h3>{product.name}</h3>
      <p>原价: ${product.price}</p>
      <p>折扣: ${discount}</p>
      <p>现价: ${finalPrice}</p>
      <button onClick={handleAddToCart}>加入购物车</button>
    </div>
  );
}

// React 19 编译器自动生成的优化版本（概念示例）
function ProductCard({ product, onAddToCart }) {
  // 编译器插入的优化逻辑
  const $$discount = useMemo(
    () => calculateDiscount(product.price, product.category),
    [product.price, product.category],
  );

  const $$finalPrice = useMemo(() => product.price - $$discount, [product.price, $$discount]);

  const $$handleAddToCart = useCallback(() => {
    onAddToCart({
      ...product,
      finalPrice: $$finalPrice,
      timestamp: Date.now(), // 编译器智能处理非纯函数
    });
  }, [product, $$finalPrice, onAddToCart]);

  // 编译器智能跳过不必要的重渲染
  return (
    <div>
      <h3>{product.name}</h3>
      <p>原价: ${product.price}</p>
      <p>折扣: ${$$discount}</p>
      <p>现价: ${$$finalPrice}</p>
      <button onClick={$$handleAddToCart}>加入购物车</button>
    </div>
  );
}
```

### 2. Actions - 简化表单和数据提交

#### React 18 的表单处理复杂性

```tsx
// React 18 - 复杂的表单状态管理
function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (field) => (event) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
    // 清除之前的错误
    if (error) setError(null);
    if (success) setSuccess(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      setError(null);

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("提交失败");
      }

      setSuccess(true);
      setFormData({ name: "", email: "", message: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input
          type="text"
          value={formData.name}
          onChange={handleInputChange("name")}
          placeholder="姓名"
          disabled={isSubmitting}
        />
      </div>

      <div>
        <input
          type="email"
          value={formData.email}
          onChange={handleInputChange("email")}
          placeholder="邮箱"
          disabled={isSubmitting}
        />
      </div>

      <div>
        <textarea
          value={formData.message}
          onChange={handleInputChange("message")}
          placeholder="消息"
          disabled={isSubmitting}
        />
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "提交中..." : "发送"}
      </button>

      {error && <div style={{ color: "red" }}>{error}</div>}
      {success && <div style={{ color: "green" }}>发送成功！</div>}
    </form>
  );
}

// 问题：
// 1. 大量状态管理样板代码
// 2. 手动处理加载、错误、成功状态
// 3. 防止重复提交需要手动处理
// 4. 表单禁用状态需要手动同步
```

#### React 19 的 Actions 简化方案

```tsx
// React 19 - 使用 Actions 简化表单
import { useActionState } from 'react';

// 🆕 Action 函数：自动处理异步状态
async function submitContact(prevState, formData) {
  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      body: formData  // 直接使用 FormData
    });

    if (!response.ok) {
      return { success: false, error: '提交失败，请重试' };
    }

    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function ContactForm() {
  // 🆕 useActionState 自动管理异步状态
  const [state, formAction, isPending] = useActionState(submitContact, {
    success: false,
    error: null
  });

  return (
    {/* 🆕 action 属性直接处理表单提交 */}
    <form action={formAction}>
      <div>
        <input
          name="name"  {/* 🆕 使用 name 属性而不是受控状态 */}
          type="text"
          placeholder="姓名"
          required
        />
      </div>

      <div>
        <input
          name="email"
          type="email"
          placeholder="邮箱"
          required
        />
      </div>

      <div>
        <textarea
          name="message"
          placeholder="消息"
          required
        />
      </div>

      {/* 🆕 自动禁用按钮和显示加载状态 */}
      <button type="submit" disabled={isPending}>
        {isPending ? '提交中...' : '发送'}
      </button>

      {/* 🆕 自动错误和成功状态显示 */}
      {state.error && (
        <div style={{ color: 'red' }}>{state.error}</div>
      )}
      {state.success && (
        <div style={{ color: 'green' }}>发送成功！</div>
      )}
    </form>
  );
}

// 优势：
// ✅ 代码量减少 70%
// ✅ 自动处理 pending 状态
// ✅ 自动防止重复提交
// ✅ 更好的可访问性（原生表单行为）
// ✅ 服务端渲染友好
```

#### 复杂 Action 场景

```tsx
// React 19 - 复杂的数据操作 Action
import { useOptimistic, useActionState } from "react";

// 乐观更新的 Action
async function addTodo(prevState, formData) {
  const text = formData.get("text");

  try {
    const response = await fetch("/api/todos", {
      method: "POST",
      body: JSON.stringify({ text, completed: false }),
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) throw new Error("添加失败");

    const newTodo = await response.json();
    return {
      todos: [...prevState.todos, newTodo],
      error: null,
    };
  } catch (error) {
    return {
      ...prevState,
      error: error.message,
    };
  }
}

async function toggleTodo(prevState, formData) {
  const id = Number(formData.get("id"));
  const completed = formData.get("completed") === "true";

  try {
    await fetch(`/api/todos/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ completed: !completed }),
      headers: { "Content-Type": "application/json" },
    });

    return {
      todos: prevState.todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !completed } : todo,
      ),
      error: null,
    };
  } catch (error) {
    return {
      ...prevState,
      error: error.message,
    };
  }
}

function TodoApp({ initialTodos }) {
  const [state, dispatch] = useActionState(
    (prevState, action) => {
      switch (action.type) {
        case "ADD_TODO":
          return addTodo(prevState, action.formData);
        case "TOGGLE_TODO":
          return toggleTodo(prevState, action.formData);
        default:
          return prevState;
      }
    },
    { todos: initialTodos, error: null },
  );

  // 🆕 乐观更新：立即显示 UI 变化
  const [optimisticTodos, addOptimisticTodo] = useOptimistic(state.todos, (state, newTodo) => [
    ...state,
    { ...newTodo, id: Date.now() },
  ]);

  return (
    <div>
      <h1>Todo 应用</h1>

      {/* 添加 Todo */}
      <form
        action={(formData) => {
          // 乐观更新
          addOptimisticTodo({ text: formData.get("text"), completed: false });
          // 实际提交
          dispatch({ type: "ADD_TODO", formData });
        }}
      >
        <input name="text" placeholder="新任务..." required />
        <button type="submit">添加</button>
      </form>

      {/* Todo 列表 */}
      <ul>
        {optimisticTodos.map((todo) => (
          <li key={todo.id}>
            <form action={(formData) => dispatch({ type: "TOGGLE_TODO", formData })}>
              <input type="hidden" name="id" value={todo.id} />
              <input type="hidden" name="completed" value={todo.completed} />
              <button type="submit">{todo.completed ? "✅" : "⬜"}</button>
              <span
                style={{
                  textDecoration: todo.completed ? "line-through" : "none",
                }}
              >
                {todo.text}
              </span>
            </form>
          </li>
        ))}
      </ul>

      {state.error && <div style={{ color: "red" }}>错误: {state.error}</div>}
    </div>
  );
}
```

### 3. 新的 Hooks

#### use Hook - 统一的异步处理

```tsx
// React 18 - 分别处理 Promise 和 Context
function UserProfile({ userPromise }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    userPromise
      .then((userData) => {
        setUser(userData);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, [userPromise]);

  const theme = useContext(ThemeContext);

  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误: {error.message}</div>;

  return (
    <div style={{ color: theme.textColor }}>
      <h1>{user.name}</h1>
      <p>{user.bio}</p>
    </div>
  );
}

// React 19 - use Hook 统一处理
function UserProfile({ userPromise }) {
  // 🆕 直接使用 Promise，use 自动处理 loading/error
  const user = use(userPromise);

  // 🆕 use 也可以用于 Context
  const theme = use(ThemeContext);

  return (
    <div style={{ color: theme.textColor }}>
      <h1>{user.name}</h1>
      <p>{user.bio}</p>
    </div>
  );
}

// 🆕 条件使用 - React 18 不支持
function ConditionalTheme({ showTheme }) {
  // React 18: ❌ 不能在条件中使用 hooks
  // const theme = showTheme ? useContext(ThemeContext) : null;

  // React 19: ✅ use 可以在条件中使用
  const theme = showTheme ? use(ThemeContext) : null;

  return (
    <div style={{ color: theme?.textColor || "black" }}>
      {showTheme ? "主题颜色文本" : "默认颜色文本"}
    </div>
  );
}
```

#### useOptimistic - 乐观更新

```tsx
// React 18 - 手动乐观更新
function LikeButton({ postId, initialLikes }) {
  const [likes, setLikes] = useState(initialLikes);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleLike = async () => {
    if (isUpdating) return;

    setIsUpdating(true);

    // 乐观更新
    const newLikes = likes + 1;
    setLikes(newLikes);

    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("点赞失败");
      }

      const result = await response.json();
      setLikes(result.likes); // 使用服务器返回的真实数据
    } catch (error) {
      // 回滚乐观更新
      setLikes(initialLikes);
      alert("点赞失败，请重试");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <button onClick={handleLike} disabled={isUpdating}>
      ❤️ {likes} {isUpdating && "(更新中...)"}
    </button>
  );
}

// React 19 - useOptimistic 简化
function LikeButton({ postId, initialLikes }) {
  const [likes, setLikes] = useState(initialLikes);

  // 🆕 乐观更新状态
  const [optimisticLikes, addOptimisticLike] = useOptimistic(
    likes,
    (currentLikes, increment) => currentLikes + increment,
  );

  const handleLike = async () => {
    // 🆕 立即显示乐观更新
    addOptimisticLike(1);

    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
      });

      if (!response.ok) throw new Error("点赞失败");

      const result = await response.json();
      setLikes(result.likes); // 🆕 自动同步真实数据
    } catch (error) {
      // 🆕 自动回滚，无需手动处理
      alert("点赞失败，请重试");
    }
  };

  return <button onClick={handleLike}>❤️ {optimisticLikes}</button>;
}

// 复杂场景：购物车乐观更新
function ShoppingCart({ items, onUpdateQuantity }) {
  const [optimisticItems, addOptimisticUpdate] = useOptimistic(
    items,
    (currentItems, { id, quantity }) => {
      return currentItems.map((item) => (item.id === id ? { ...item, quantity } : item));
    },
  );

  const handleQuantityChange = async (id, newQuantity) => {
    // 立即更新 UI
    addOptimisticUpdate({ id, quantity: newQuantity });

    try {
      await onUpdateQuantity(id, newQuantity);
    } catch (error) {
      // 自动回滚到之前状态
      console.error("更新失败:", error);
    }
  };

  return (
    <div>
      {optimisticItems.map((item) => (
        <div key={item.id}>
          <span>{item.name}</span>
          <input
            type="number"
            value={item.quantity}
            onChange={(e) => handleQuantityChange(item.id, e.target.value)}
          />
          <span>${(item.price * item.quantity).toFixed(2)}</span>
        </div>
      ))}
    </div>
  );
}
```

### 4. ref 作为 prop - 告别 forwardRef

#### React 18 的 ref 传递复杂性

```tsx
// React 18 - 需要 forwardRef 包装
import { forwardRef, useImperativeHandle, useRef } from "react";

// 必须使用 forwardRef
const InputWithFocus = forwardRef(function InputWithFocus(props, ref) {
  const inputRef = useRef(null);

  // 复杂的 ref 处理
  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current?.focus();
    },
    getValue: () => {
      return inputRef.current?.value || "";
    },
  }));

  return <input ref={inputRef} {...props} />;
});

// 使用时需要创建 ref
function ParentComponent() {
  const inputRef = useRef(null);

  const handleFocus = () => {
    inputRef.current?.focus();
  };

  return (
    <div>
      <InputWithFocus ref={inputRef} placeholder="输入..." />
      <button onClick={handleFocus}>聚焦输入框</button>
    </div>
  );
}

// 高阶组件的 ref 传递更复杂
const withLogging = (WrappedComponent) => {
  return forwardRef((props, ref) => {
    console.log("组件渲染");
    return <WrappedComponent {...props} ref={ref} />;
  });
};
```

#### React 19 的简化 ref 处理

```tsx
// React 19 - ref 作为普通 prop
function InputWithFocus({ ref, ...props }) {
  const inputRef = useRef(null);

  // 🆕 直接使用 ref prop，无需 forwardRef
  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current?.focus();
    },
    getValue: () => {
      return inputRef.current?.value || "";
    },
  }));

  return <input ref={inputRef} {...props} />;
}

// 使用方式相同，但组件定义更简单
function ParentComponent() {
  const inputRef = useRef(null);

  const handleFocus = () => {
    inputRef.current?.focus();
  };

  return (
    <div>
      <InputWithFocus ref={inputRef} placeholder="输入..." />
      <button onClick={handleFocus}>聚焦输入框</button>
    </div>
  );
}

// 🆕 高阶组件的 ref 传递变简单
const withLogging = (WrappedComponent) => {
  return (props) => {
    console.log("组件渲染");
    return <WrappedComponent {...props} />; // ref 自动传递
  };
};

// 复杂组件的 ref 处理
function CustomButton({ ref, variant = "primary", children, ...props }) {
  const buttonRef = useRef(null);

  // 组合多个 ref 功能
  useImperativeHandle(ref, () => ({
    focus: () => buttonRef.current?.focus(),
    click: () => buttonRef.current?.click(),
    getBoundingRect: () => buttonRef.current?.getBoundingClientRect(),
    // 添加自定义方法
    pulse: () => {
      buttonRef.current?.animate(
        [{ transform: "scale(1)" }, { transform: "scale(1.1)" }, { transform: "scale(1)" }],
        { duration: 200 },
      );
    },
  }));

  const className = `btn btn-${variant}`;

  return (
    <button ref={buttonRef} className={className} {...props}>
      {children}
    </button>
  );
}

// 使用时完全一样
function ButtonDemo() {
  const buttonRef = useRef(null);

  const handlePulse = () => {
    buttonRef.current?.pulse();
  };

  return (
    <div>
      <CustomButton ref={buttonRef} variant="success">
        点击我
      </CustomButton>
      <button onClick={handlePulse}>脉冲动画</button>
    </div>
  );
}
```

### 5. Document Metadata 原生支持

#### React 18 需要第三方库处理

```tsx
// React 18 - 使用 react-helmet 等第三方库
import { Helmet } from "react-helmet";

function BlogPost({ post }) {
  return (
    <div>
      <Helmet>
        <title>{post.title} - 我的博客</title>
        <meta name="description" content={post.excerpt} />
        <meta name="author" content={post.author} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:image" content={post.coverImage} />
        <link rel="canonical" href={`/posts/${post.slug}`} />
      </Helmet>

      <article>
        <h1>{post.title}</h1>
        <p>{post.content}</p>
      </article>
    </div>
  );
}

// 问题：
// 1. 需要额外的依赖
// 2. 增加包体积
// 3. 可能的 SSR 问题
// 4. 学习额外的 API
```

#### React 19 原生 Document Metadata

```tsx
// React 19 - 原生支持 document metadata
function BlogPost({ post }) {
  return (
    <article>
      {/* 🆕 直接在组件中使用，自动提升到 <head> */}
      <title>{post.title} - 我的博客</title>
      <meta name="description" content={post.excerpt} />
      <meta name="author" content={post.author} />
      <meta property="og:title" content={post.title} />
      <meta property="og:description" content={post.excerpt} />
      <meta property="og:image" content={post.coverImage} />
      <link rel="canonical" href={`/posts/${post.slug}`} />

      <h1>{post.title}</h1>
      <div className="post-meta">
        作者：{post.author} | 发布时间：{post.publishDate}
      </div>
      <p>{post.content}</p>
    </article>
  );
}

// 动态 metadata 更简单
function ProductPage({ product }) {
  const pageTitle = `${product.name} - ${product.category} - 商店`;
  const ogImage = product.images?.[0] || "/default-product.jpg";

  return (
    <div>
      {/* 动态 metadata */}
      <title>{pageTitle}</title>
      <meta name="description" content={product.description} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:type" content="product" />
      <meta property="product:price:amount" content={product.price} />
      <meta property="product:price:currency" content="USD" />

      {/* 条件 metadata */}
      {product.onSale && <meta name="keywords" content={`${product.category}, 打折, 促销`} />}

      <div className="product">
        <h1>{product.name}</h1>
        <img src={product.images[0]} alt={product.name} />
        <p>{product.description}</p>
        <div className="price">${product.price}</div>
      </div>
    </div>
  );
}

// 嵌套路由的 metadata
function Layout({ children }) {
  return (
    <div>
      {/* 全局 metadata */}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#000000" />
      <link rel="icon" href="/favicon.ico" />

      <header>网站导航</header>
      <main>{children}</main>
      <footer>网站版权信息</footer>
    </div>
  );
}

function UserProfilePage({ user }) {
  return (
    <Layout>
      {/* 页面特定 metadata 会覆盖全局设置 */}
      <title>{user.name} 的个人资料</title>
      <meta name="description" content={`查看 ${user.name} 的个人资料和活动`} />

      <div className="profile">
        <h1>{user.name}</h1>
        <p>{user.bio}</p>
      </div>
    </Layout>
  );
}
```

---

## 🔧 废弃和移除的 API

### React 18 vs React 19 API 变更

```tsx
// ❌ React 19 中被废弃的 API

// 1. forwardRef - 不再需要
// React 18
const MyInput = forwardRef((props, ref) => {
  return <input {...props} ref={ref} />;
});

// React 19 - 直接使用 ref prop
function MyInput({ ref, ...props }) {
  return <input {...props} ref={ref} />;
}

// 2. React.lazy 的一些用法变更
// React 18
const LazyComponent = React.lazy(() => import("./Component"));

// React 19 - 依然支持，但推荐使用新的 Suspense 模式
const LazyComponent = React.lazy(() => import("./Component"));

// 3. defaultProps 在函数组件中被废弃
// React 18
function Button({ type, children }) {
  return <button type={type}>{children}</button>;
}
Button.defaultProps = {
  type: "button",
};

// React 19 - 使用默认参数
function Button({ type = "button", children }) {
  return <button type={type}>{children}</button>;
}

// 4. propTypes 被完全移除（推荐 TypeScript）
// React 18
import PropTypes from "prop-types";

function UserCard({ name, age }) {
  return (
    <div>
      {name}, {age}
    </div>
  );
}
UserCard.propTypes = {
  name: PropTypes.string.required,
  age: PropTypes.number,
};

// React 19 - 使用 TypeScript
interface UserCardProps {
  name: string;
  age?: number;
}

function UserCard({ name, age }: UserCardProps) {
  return (
    <div>
      {name}, {age}
    </div>
  );
}
```

---

## ⚡ 性能对比测试

### React Compiler 效果测试

```tsx
// 性能测试组件
function PerformanceComparison() {
  const [items, setItems] = useState(() =>
    Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      name: `项目 ${i}`,
      value: Math.random() * 100,
    })),
  );

  const [filter, setFilter] = useState("");
  const [sortBy, setSortBy] = useState("name");

  // React 18 需要手动优化
  const filteredAndSorted = useMemo(() => {
    const filtered = items.filter((item) => item.name.toLowerCase().includes(filter.toLowerCase()));

    return filtered.sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "value") return a.value - b.value;
      return 0;
    });
  }, [items, filter, sortBy]);

  // React 19 编译器自动优化这些操作
  const autoOptimized = items
    .filter((item) => item.name.toLowerCase().includes(filter.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "value") return a.value - b.value;
      return 0;
    });

  return (
    <div>
      <h2>性能对比测试</h2>

      <div>
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="过滤..."
        />

        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="name">按名称排序</option>
          <option value="value">按值排序</option>
        </select>
      </div>

      <div>
        <h3>React 18 手动优化版本</h3>
        <ItemList items={filteredAndSorted} />
      </div>

      <div>
        <h3>React 19 编译器自动优化版本</h3>
        <ItemList items={autoOptimized} />
      </div>
    </div>
  );
}

// React 18 版本需要 memo
const ItemList = memo(function ItemList({ items }) {
  return (
    <div>
      {items.slice(0, 100).map((item) => (
        <ItemCard key={item.id} item={item} />
      ))}
    </div>
  );
});

const ItemCard = memo(function ItemCard({ item }) {
  return (
    <div>
      <span>{item.name}</span>
      <span>{item.value.toFixed(2)}</span>
    </div>
  );
});

// React 19 版本不需要 memo（编译器自动优化）
function ItemList({ items }) {
  return (
    <div>
      {items.slice(0, 100).map((item) => (
        <ItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}

function ItemCard({ item }) {
  return (
    <div>
      <span>{item.name}</span>
      <span>{item.value.toFixed(2)}</span>
    </div>
  );
}
```

### Actions 性能优势

```tsx
// 表单性能测试
function FormPerformanceTest() {
  const [results, setResults] = useState([]);

  // React 18 传统方式
  const [formData18, setFormData18] = useState({ name: "", email: "" });
  const [loading18, setLoading18] = useState(false);

  const handleSubmit18 = async (e) => {
    e.preventDefault();
    const startTime = performance.now();
    setLoading18(true);

    // 模拟提交
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const endTime = performance.now();
    setResults((prev) => [
      ...prev,
      {
        version: "React 18",
        time: endTime - startTime,
        reRenders: "Multiple (loading, form data, success)",
      },
    ]);
    setLoading18(false);
  };

  // React 19 Actions 方式
  const [state19, action19, isPending19] = useActionState(
    async (prevState, formData) => {
      const startTime = performance.now();

      // 模拟提交
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const endTime = performance.now();
      setResults((prev) => [
        ...prev,
        {
          version: "React 19",
          time: endTime - startTime,
          reRenders: "Minimal (optimized by Actions)",
        },
      ]);

      return { success: true };
    },
    { success: false },
  );

  return (
    <div>
      <h2>表单性能对比</h2>

      <div style={{ display: "flex", gap: "2rem" }}>
        <div>
          <h3>React 18 方式</h3>
          <form onSubmit={handleSubmit18}>
            <input
              value={formData18.name}
              onChange={(e) => setFormData18((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="姓名"
            />
            <input
              value={formData18.email}
              onChange={(e) => setFormData18((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="邮箱"
            />
            <button disabled={loading18}>{loading18 ? "提交中..." : "提交"}</button>
          </form>
        </div>

        <div>
          <h3>React 19 Actions</h3>
          <form action={action19}>
            <input name="name" placeholder="姓名" />
            <input name="email" placeholder="邮箱" />
            <button disabled={isPending19}>{isPending19 ? "提交中..." : "提交"}</button>
          </form>
        </div>
      </div>

      <div>
        <h3>性能结果</h3>
        {results.map((result, i) => (
          <div key={i}>
            {result.version}: {result.time.toFixed(2)}ms ({result.reRenders})
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 🔧 配置升级指南

### 1. 依赖更新

```json
// React 18 依赖
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

// React 19 依赖
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.2",
    "@types/react-dom": "^19.0.2",
    // 🆕 React Compiler（可选）
    "babel-plugin-react-compiler": "^19.0.0"
  }
}
```

### 2. Babel 配置更新

```javascript
// React 18 配置
module.exports = {
  presets: [["@babel/preset-react", { runtime: "automatic" }]],
  plugins: ["react-refresh/babel"],
};

// React 19 配置（启用 React Compiler）
module.exports = {
  presets: [["@babel/preset-react", { runtime: "automatic" }]],
  plugins: [
    "react-refresh/babel",
    // 🆕 React Compiler
    [
      "babel-plugin-react-compiler",
      {
        // 编译器选项
        compilationMode: "annotation", // 或 'all'
        panicThreshold: "all_errors",
      },
    ],
  ],
};
```

### 3. ESLint 配置更新

```javascript
// React 18 配置
module.exports = {
  settings: {
    react: { version: "18.3" },
  },
  rules: {
    "react/no-deprecated": "warn",
  },
};

// React 19 配置
module.exports = {
  settings: {
    react: { version: "19.0" },
  },
  rules: {
    // 🆕 严格模式，禁止已废弃 API
    "react/no-deprecated": "error",

    // 🆕 React Compiler 相关规则
    "react-compiler/react-compiler": "error",
  },
  plugins: [
    // 🆕 React Compiler ESLint 插件
    "react-compiler",
  ],
};
```

### 4. TypeScript 配置

```json
// React 18 配置
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "strict": true
  }
}

// React 19 配置（无需特殊更改）
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "strict": true,
    // 可选：更严格的类型检查
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true
  }
}
```

---

## 🚀 实际应用迁移示例

### 大型应用迁移案例

```tsx
// React 18 复杂应用组件
import { memo, useMemo, useCallback, useEffect, useState } from "react";

const ProductList = memo(function ProductList({ products, onProductUpdate, filters }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 大量手动优化
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      return (
        (!filters.category || product.category === filters.category) &&
        (!filters.minPrice || product.price >= filters.minPrice) &&
        (!filters.maxPrice || product.price <= filters.maxPrice) &&
        (!filters.search || product.name.toLowerCase().includes(filters.search.toLowerCase()))
      );
    });
  }, [products, filters]);

  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      switch (filters.sortBy) {
        case "price":
          return a.price - b.price;
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  }, [filteredProducts, filters.sortBy]);

  const handleProductUpdate = useCallback(
    async (productId, updates) => {
      setLoading(true);
      setError(null);

      try {
        await onProductUpdate(productId, updates);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [onProductUpdate],
  );

  if (error) {
    return <div className="error">错误: {error}</div>;
  }

  return (
    <div className={loading ? "loading" : ""}>
      {sortedProducts.map((product) => (
        <ProductCard key={product.id} product={product} onUpdate={handleProductUpdate} />
      ))}
    </div>
  );
});

const ProductCard = memo(function ProductCard({ product, onUpdate }) {
  const handleUpdate = useCallback(
    (updates) => {
      onUpdate(product.id, updates);
    },
    [product.id, onUpdate],
  );

  return (
    <div className="product-card">
      <h3>{product.name}</h3>
      <p>${product.price}</p>
      <button onClick={() => handleUpdate({ favorite: !product.favorite })}>
        {product.favorite ? "❤️" : "🤍"}
      </button>
    </div>
  );
});

// React 19 迁移后的简化版本
function ProductList({ products, onProductUpdate, filters }) {
  const [error, setError] = useState(null);

  // 🆕 编译器自动优化，无需 useMemo
  const filteredProducts = products.filter((product) => {
    return (
      (!filters.category || product.category === filters.category) &&
      (!filters.minPrice || product.price >= filters.minPrice) &&
      (!filters.maxPrice || product.price <= filters.maxPrice) &&
      (!filters.search || product.name.toLowerCase().includes(filters.search.toLowerCase()))
    );
  });

  // 🆕 编译器自动优化排序
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (filters.sortBy) {
      case "price":
        return a.price - b.price;
      case "name":
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  // 🆕 使用 Actions 简化更新
  const [updateState, updateAction, isUpdating] = useActionState(
    async (prevState, { productId, updates }) => {
      try {
        await onProductUpdate(productId, updates);
        return { success: true, error: null };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
    { success: false, error: null },
  );

  useEffect(() => {
    if (updateState.error) {
      setError(updateState.error);
    }
  }, [updateState]);

  if (error) {
    return <div className="error">错误: {error}</div>;
  }

  return (
    <div className={isUpdating ? "loading" : ""}>
      {sortedProducts.map((product) => (
        <ProductCard key={product.id} product={product} onUpdate={updateAction} />
      ))}
    </div>
  );
}

// 🆕 无需 memo，编译器自动优化
function ProductCard({ product, onUpdate }) {
  return (
    <div className="product-card">
      <h3>{product.name}</h3>
      <p>${product.price}</p>
      <form
        action={(formData) =>
          onUpdate({
            productId: product.id,
            updates: { favorite: !product.favorite },
          })
        }
      >
        <button type="submit">{product.favorite ? "❤️" : "🤍"}</button>
      </form>
    </div>
  );
}

// 代码量对比：
// React 18: ~80 行代码，大量优化样板
// React 19: ~45 行代码，减少 44% 的代码量
```

---

## ⚠️ 升级注意事项和兼容性

### 破坏性变更检查清单

```tsx
// ❌ 需要立即修复的问题

// 1. 移除 forwardRef
// Before (React 18)
const Button = forwardRef((props, ref) => <button ref={ref} {...props} />);

// After (React 19)
function Button({ ref, ...props }) {
  return <button ref={ref} {...props} />;
}

// 2. 移除函数组件的 defaultProps
// Before (React 18)
function Welcome({ name }) {
  return <h1>Hello, {name}!</h1>;
}
Welcome.defaultProps = { name: "World" };

// After (React 19)
function Welcome({ name = "World" }) {
  return <h1>Hello, {name}!</h1>;
}

// 3. 更新错误处理
// React 19 的错误边界行为略有不同
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // React 19 提供更详细的错误信息
    console.log("错误:", error);
    console.log("组件栈:", errorInfo.componentStack);

    // 新增：React 19 特有的错误信息
    if (errorInfo.errorBoundary) {
      console.log("错误边界信息:", errorInfo.errorBoundary);
    }
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}
```

### 渐进式升级策略

```tsx
// 阶段 1: 基础升级
// - 更新 React 版本
// - 移除 forwardRef
// - 更新 defaultProps

// 阶段 2: Actions 迁移
// - 将复杂表单迁移到 Actions
// - 使用 useActionState 替代手动状态管理

// 阶段 3: 编译器优化
// - 启用 React Compiler
// - 逐步移除手动优化 (memo, useMemo, useCallback)

// 阶段 4: 新特性采用
// - 使用 use Hook 简化异步处理
// - 采用 useOptimistic 优化用户体验
// - 使用原生 document metadata

// 升级验证组件
function UpgradeValidator() {
  const [checks, setChecks] = useState([
    { name: "React 版本", status: "pending" },
    { name: "forwardRef 移除", status: "pending" },
    { name: "defaultProps 更新", status: "pending" },
    { name: "Actions 测试", status: "pending" },
    { name: "编译器启用", status: "pending" },
  ]);

  useEffect(() => {
    // 检查升级状态
    const validateUpgrade = () => {
      setChecks((prev) =>
        prev.map((check) => {
          switch (check.name) {
            case "React 版本":
              return { ...check, status: React.version.startsWith("19") ? "success" : "error" };
            case "Actions 测试":
              return {
                ...check,
                status: typeof useActionState === "function" ? "success" : "error",
              };
            default:
              return check;
          }
        }),
      );
    };

    validateUpgrade();
  }, []);

  return (
    <div>
      <h2>React 19 升级检查</h2>
      {checks.map((check) => (
        <div key={check.name}>
          {check.name}: {check.status === "success" ? "✅" : check.status === "error" ? "❌" : "⏳"}
        </div>
      ))}
    </div>
  );
}
```

---

## 🎉 总结

React 19 相比 React 18 实现了**开发体验的质的飞跃**，从手动优化时代进入到**自动化智能时代**：

### 🏆 核心优势对比

| 特性              | React 18        | React 19                |
| ----------------- | --------------- | ----------------------- |
| **性能优化**      | 大量手动优化    | React Compiler 自动优化 |
| **表单处理**      | 复杂状态管理    | Actions 简化            |
| **ref 传递**      | forwardRef 包装 | 直接 prop 传递          |
| **异步处理**      | 多个 Hooks 组合 | use Hook 统一           |
| **乐观更新**      | 手动实现        | useOptimistic           |
| **文档 metadata** | 第三方库        | 原生支持                |
| **代码复杂度**    | 高              | 显著降低                |

### 📈 开发效率提升

1. **代码量减少 40-70%** - React Compiler 和 Actions 大幅简化代码
2. **认知负担降低** - 更少的 API 和概念需要掌握
3. **错误减少** - 自动优化减少人为错误
4. **维护成本降低** - 更少的样板代码和手动优化

### 🎯 升级建议

- **必要升级** - forwardRef 和 defaultProps 的移除是必需变更
- **渐进式采用** - 可以逐步启用新特性，无需一次性重构
- **重点关注** - React Compiler 是最大的生产力提升点
- **面向未来** - 为下一代 React 开发模式做好准备

React 19 不仅仅是一个版本升级，更是 React 开发哲学的重大转变 - **让开发者专注于业务逻辑，将性能优化交给编译器**。这标志着 React 进入了一个更加成熟和智能的发展阶段。
