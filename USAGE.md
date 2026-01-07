# 使用说明 Usage Guide

## 项目已创建完成！

你现在有了一个完整的沉浸式双语切换 JavaScript 库，可以轻松集成到任何静态网站中。

## 📁 项目结构

```
immersive-bilingual-toggle/
├── src/                          # 源代码
│   └── immersive-bilingual.js    # 主要库文件
├── dist/                         # 构建输出
│   └── immersive-bilingual.min.js # 压缩后的库文件 (11.3KB)
├── example/                      # 示例文件
│   ├── index.html               # 基础示例
│   ├── advanced.html            # 高级示例
│   └── translations.json        # 翻译配置文件
├── docs/                        # 文档
│   └── integration-guide.md     # 集成指南
├── test.html                    # 测试页面
├── cdn-example.html             # CDN 使用示例
├── index.html                   # 项目首页
├── README.md                    # 项目说明
├── package.json                 # 项目配置
└── build.js                     # 构建脚本
```

## 🚀 快速测试

服务器已经在运行中，你可以访问以下页面进行测试：

- **项目首页**: http://localhost:8080/
- **基础示例**: http://localhost:8080/example/
- **高级示例**: http://localhost:8080/example/advanced.html
- **修复测试**: http://localhost:8080/example/test-fixed.html
- **CDN 示例**: http://localhost:8080/example/cdn-example.html

## 💡 核心功能

1. **点击切换**: 点击任意文本在原文和译文之间切换
2. **全局切换**: 右上角按钮一键切换整个页面
3. **自动检测**: 自动匹配页面文本与翻译配置
4. **手动标记**: 使用 `data-translate` 属性精确控制
5. **样式友好**: 译文有独特视觉标识，不破坏布局

## 📝 基础使用

### 1. 引入库文件

```html
<script src="./dist/immersive-bilingual.min.js"></script>
```

### 2. 配置翻译数据

```javascript
window.ImmersiveBilingualConfig = {
  translationData: {
    "Getting Started": "开始使用",
    "Documentation": "文档"
  }
};
```

### 3. 标记文本（可选）

```html
<h1 data-translate="Getting Started">Getting Started</h1>
```

## 🔧 高级配置

```javascript
window.ImmersiveBilingualConfig = {
  // 翻译数据源（二选一）
  translationData: {...},           // 直接提供对象
  translationUrl: './translations.json', // 从文件加载
  
  // 功能开关
  clickToToggle: true,              // 启用点击切换
  autoInject: true,                 // 自动初始化
  
  // 按钮文本
  toggleButtonText: {
    showOriginal: '显示原文',
    showTranslation: '显示译文'
  },
  
  // 选择器配置
  textSelector: '[data-translate]',  // 文本元素选择器
  toggleSelector: '.bilingual-toggle' // 切换按钮选择器
};
```

## 📦 部署到生产环境

### 方式一：直接使用构建文件

1. 复制 `dist/immersive-bilingual.min.js` 到你的网站
2. 复制 `example/translations.json` 并修改翻译内容
3. 在 HTML 中引入并配置

### 方式二：上传到 CDN

1. 将 `dist/immersive-bilingual.min.js` 上传到 CDN（如 jsDelivr, unpkg）
2. 使用 CDN 链接引入：

```html
<script src="https://cdn.jsdelivr.net/gh/yourusername/immersive-bilingual@main/dist/immersive-bilingual.min.js"></script>
```

### 方式三：集成到静态网站生成器

参考 `docs/integration-guide.md` 中的详细说明，支持：
- Jekyll
- Hugo  
- VitePress
- Docusaurus
- GitBook

## 🎨 自定义样式

```css
/* 自定义译文样式 */
.bilingual-translation {
  border-left: 4px solid #your-color;
  background-color: #your-bg-color;
  padding: 8px 12px;
  border-radius: 4px;
}

/* 自定义切换按钮 */
.bilingual-toggle {
  background: #your-brand-color;
  border-radius: 20px;
}
```

## 🔄 开发和构建

```bash
# 修改源代码后重新构建
node build.js

# 启动本地服务器测试
http-server -p 8080 -c-1
```

## 📋 翻译文件格式

```json
{
  "原文1": "译文1",
  "原文2": "译文2",
  "Getting Started": "开始使用",
  "Welcome to our documentation": "欢迎来到我们的文档"
}
```

## 🎯 使用场景

- **技术文档汉化**: 将英文技术文档快速汉化
- **多语言网站**: 提供双语对照阅读体验
- **学习辅助**: 帮助用户学习外语
- **内容本地化**: 快速本地化静态网站内容

## 🔍 故障排除

1. **翻译不显示**: 检查 JSON 文件路径和格式
2. **样式冲突**: 使用更具体的 CSS 选择器
3. **性能问题**: 使用 `data-translate` 精确标记需要翻译的元素

## 📞 技术支持

如果遇到问题，可以：
1. 查看浏览器控制台错误信息
2. 检查网络请求是否成功加载翻译文件
3. 验证 JSON 格式是否正确

---

**恭喜！** 你现在拥有了一个功能完整的沉浸式双语切换库，可以轻松集成到任何网站项目中。🎉