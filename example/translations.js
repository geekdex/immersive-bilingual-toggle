// 翻译配置文件
// 使用路由作为键名，访问对应路由时只加载该路由的翻译数据
// 注意：index.html 会自动转换为目录路由，如 /example/index.html -> /example/

window.ImmersiveBilingualConfig = {
    translationData: {
        // 路由 /example/ (对应 /example/index.html)
        "/example/": {
            "JavaScript Documentation": "JavaScript 文档",
            "Introduction": "介绍",
            "JavaScript is a programming language that adds interactivity to your website.": "JavaScript 是一种为网站添加交互性的编程语言。",
            "Variables": "变量",
            "Variables are containers for storing data values.": "变量是存储数据值的容器。",
            "In JavaScript, you can declare variables using var, let, or const.": "在 JavaScript 中，你可以使用 var、let 或 const 声明变量。",
            "Functions": "函数",
            "Functions are blocks of code designed to perform a particular task.": "函数是为执行特定任务而设计的代码块。",
            "A function is executed when something invokes it.": "当某些东西调用函数时，函数就会被执行。"
        },
        
        // 路由 /example/page1.html (React 教程)
        "/example/page1.html": {
            "Getting Started with React": "React 入门指南",
            "What is React?": "什么是 React？",
            "React is a JavaScript library for building user interfaces.": "React 是一个用于构建用户界面的 JavaScript 库。",
            "It lets you compose complex UIs from small and isolated pieces of code called components.": "它允许你通过称为组件的小型独立代码片段来组合复杂的用户界面。",
            "Creating a Component": "创建组件",
            "Components are independent and reusable bits of code.": "组件是独立且可复用的代码片段。",
            "They serve the same purpose as JavaScript functions, but work in isolation.": "它们的作用与 JavaScript 函数相同，但独立工作。",
            "Props and State": "Props 和 State",
            "Props are arguments passed into React components.": "Props 是传递给 React 组件的参数。",
            "State is a built-in object that stores property values that belong to the component.": "State 是一个内置对象，用于存储属于组件的属性值。"
        },
        
        // 路由 /example/page2.html (Vue 教程)
        "/example/page2.html": {
            "Introduction to Vue.js": "Vue.js 入门",
            "What is Vue?": "什么是 Vue？",
            "Vue is a progressive framework for building user interfaces.": "Vue 是一个用于构建用户界面的渐进式框架。",
            "Unlike other monolithic frameworks, Vue is designed to be incrementally adoptable.": "与其他单体框架不同，Vue 被设计为可以渐进式采用。",
            "Template Syntax": "模板语法",
            "Vue uses an HTML-based template syntax that allows you to declaratively bind the rendered DOM.": "Vue 使用基于 HTML 的模板语法，允许你声明式地将渲染的 DOM 绑定到数据。",
            "All Vue templates are syntactically valid HTML.": "所有 Vue 模板都是语法上有效的 HTML。",
            "Reactivity Fundamentals": "响应式基础",
            "Vue automatically tracks JavaScript state changes and efficiently updates the DOM.": "Vue 自动追踪 JavaScript 状态变化并高效地更新 DOM。",
            "The reactive system makes state management simple and intuitive.": "响应式系统使状态管理变得简单直观。"
        },
        
        // 其他路由示例
        "/geekdex": {
            "Welcome": "欢迎",
            "Profile": "个人资料",
            "Repositories": "仓库"
        }
    }
};

/**
 * 路由规则说明：
 * 
 * 1. index.html 会自动转换为目录路由：
 *    - /example/index.html -> /example/
 *    - /index.html -> /
 * 
 * 2. 其他 html 文件保持原路由：
 *    - /example/page1.html -> /example/page1.html
 *    - /posts/article.html -> /posts/article.html
 * 
 * 3. 非 html 路由保持不变：
 *    - /geekdex -> /geekdex
 *    - /api/users -> /api/users
 */
