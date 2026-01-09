// 翻译配置文件
// 使用路由作为键名，访问对应路由时只加载该路由的翻译数据
// 注意：index.html 会自动转换为目录路由，如 /example/index.html -> /example/

window.ImmersiveBilingualConfig = {
    translationData: {
        // 路由 /example/ (对应 /example/index.html)
        "/example/": {
            "js_doc_title": "JavaScript 文档",
            "intro_title": "介绍",
            "intro_desc": "JavaScript 是一种为网站添加交互性的编程语言。",
            "variables_title": "变量",
            "variables_desc": "变量是存储数据值的容器。",
            "variables_declare": "在 JavaScript 中，你可以使用 var、let 或 const 声明变量。",
            "functions_title": "函数",
            "functions_desc": "函数是为执行特定任务而设计的代码块。",
            "functions_invoke": "当某些东西调用函数时，函数就会被执行。"
        },
        
        // 路由 /example/page1.html (React 教程)
        "/example/page1.html": {
            "react_title": "React 入门指南",
            "what_is_react": "什么是 React？",
            "react_desc": "React 是一个用于构建用户界面的 JavaScript 库。",
            "react_components": "它允许你通过称为组件的小型独立代码片段来组合复杂的用户界面。",
            "creating_component": "创建组件",
            "component_desc": "组件是独立且可复用的代码片段。",
            "component_purpose": "它们的作用与 JavaScript 函数相同，但独立工作。",
            "props_state": "Props 和 State",
            "props_desc": "Props 是传递给 React 组件的参数。",
            "state_desc": "State 是一个内置对象，用于存储属于组件的属性值。"
        },
        
        // 路由 /example/page2.html (Vue 教程)
        "/example/page2.html": {
            "vue_title": "Vue.js 入门",
            "what_is_vue": "什么是 Vue？",
            "vue_desc": "Vue 是一个用于构建用户界面的渐进式框架。",
            "vue_adoptable": "与其他单体框架不同，Vue 被设计为可以渐进式采用。",
            "template_syntax": "模板语法",
            "template_desc": "Vue 使用基于 HTML 的模板语法，允许你声明式地将渲染的 DOM 绑定到数据。",
            "template_valid": "所有 Vue 模板都是语法上有效的 HTML。",
            "reactivity_title": "响应式基础",
            "reactivity_desc": "Vue 自动追踪 JavaScript 状态变化并高效地更新 DOM。",
            "reactivity_simple": "响应式系统使状态管理变得简单直观。"
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
