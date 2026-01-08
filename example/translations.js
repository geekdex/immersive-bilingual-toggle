// 翻译配置文件
// 使用路由作为键名，访问对应路由时只加载该路由的翻译数据

window.ImmersiveBilingualConfig = {
    // 全量翻译数据，以路由为键名
    translationData: {
        // 路由 /example/index.html 的翻译数据
        "/example/index.html": {
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
        
        // 路由 /geekdex 的翻译数据（示例）
        "/geekdex": {
            "Welcome": "欢迎",
            "Profile": "个人资料",
            "Repositories": "仓库"
        },
        
        // 路由 /posts/tools_publish-technical-tutorials-in-google-godelab-format.html 的翻译数据（示例）
        "/posts/tools_publish-technical-tutorials-in-google-godelab-format.html": {
            "Getting Started": "开始使用",
            "Prerequisites": "前置条件",
            "Installation": "安装"
        }
    }
};

/**
 * 使用示例：
 * 
 * 1. 数据结构说明：
 *    translationData 以路由为键名，每个路由对应一个翻译对象
 *    {
 *        "/geekdex": { "Hello": "你好", ... },
 *        "/posts/xxx.html": { "Title": "标题", ... }
 *    }
 * 
 * 2. 自动加载：
 *    访问 https://example.com/geekdex 时，自动加载 translationData["/geekdex"]
 *    访问 https://example.com/posts/xxx.html 时，自动加载 translationData["/posts/xxx.html"]
 * 
 * 3. 手动设置指定路由的翻译数据：
 *    bilingual.setRouteData('/geekdex', { "Hello": "你好" });
 * 
 * 4. 获取指定路由的翻译数据：
 *    const data = bilingual.getRouteData('/geekdex');
 * 
 * 5. 获取当前路由的翻译数据：
 *    const data = bilingual.getTranslationData();
 * 
 * 6. 获取所有已存储的路由列表：
 *    const routes = bilingual.getStoredRoutes();
 *    // 返回: ['/geekdex', '/posts/xxx.html', ...]
 * 
 * 7. 删除指定路由的翻译数据：
 *    bilingual.removeRouteData('/posts/old-article.html');
 * 
 * 8. 导出/导入全量数据：
 *    const json = bilingual.exportAllData();
 *    bilingual.importAllData(json);
 */
