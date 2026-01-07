# Immersive Bilingual Toggle

一个通用的 JavaScript 库，用于实现网页的沉浸式双语切换功能。支持点击文本区域在原文和译文之间切换，特别适合技术文档网站的汉化需求。

## 特性

- 🎯 **点击切换**: 点击任意文本区域即可在原文和译文之间切换
- 🔄 **全局切换**: 提供全局切换按钮，一键切换整个页面
- 📝 **JSON 配置**: 使用简单的 JSON 文件管理翻译对照
- 🎨 **样式友好**: 保持原有页面布局，译文有独特的视觉标识
- 🚀 **即插即用**: 一行代码集成，支持所有静态网站生成器
- 📱 **响应式**: 支持移动端和桌面端
- 🔍 **自动检测**: 自动检测页面文本并应用翻译

## 快速开始

### 1. 引入库文件

```html
<script src="https://cdn.jsdelivr.net/gh/yourusername/immersive-bilingual@main/dist/immersive-bilingual.min.js"></script>
```

### 2. 准备翻译配置

创建 `translations.json` 文件：

```json
{
  "Getting Started": "开始使用",
  "Introduction": "介绍",
  "Installation": "安装",
  "Welcome to our documentation": "欢迎来到我们的文档"
}
```

### 3. 初始化

```html
<script>
window.ImmersiveBilingualConfig = {
  translationUrl: './translations.json'
};
</script>
```

### 4. 标记需要翻译的文本（可选）

```html
<h1 data-translate="Getting Started">Getting Started</h1>
<p data-translate="Welcome to our documentation">Welcome to our documentation</p>
```

## 配置选项

```javascript
window.ImmersiveBilingualConfig = {
  // 翻译数据源（二选一）
  translationData: null,           // 直接提供翻译对象
  translationUrl: null,            // 翻译文件 URL
  
  // 选择器配置
  toggleSelector: '.bilingual-toggle',     // 切换按钮选择器
  textSelector: '[data-translate]',        // 文本元素选择器
  
  // 样式类名
  showOriginalClass: 'show-original',      // 显示原文时的类名
  showTranslationClass: 'show-translation', // 显示译文时的类名
  
  // 按钮文本
  toggleButtonText: {
    showOriginal: '显示原文',
    showTranslation: '显示译文'
  },
  
  // 功能开关
  autoInject: true,                // 自动初始化
  clickToToggle: true              // 启用点击切换
};
```

## 使用方式

### 方式一：自动检测（推荐）

库会自动检测页面中的文本，并根据 JSON 配置进行匹配翻译：

```html
<h1>Getting Started</h1>
<p>Welcome to our documentation</p>
```

### 方式二：手动标记

使用 `data-translate` 属性明确指定需要翻译的元素：

```html
<h1 data-translate="Getting Started">Getting Started</h1>
<p data-translate="Welcome to our documentation">Welcome to our documentation</p>
```

## 集成到静态网站生成器

### Jekyll

在 `_layouts/default.html` 中添加：

```html
<script src="path/to/immersive-bilingual.min.js"></script>
<script>
window.ImmersiveBilingualConfig = {
  translationUrl: '{{ "/assets/translations.json" | relative_url }}'
};
</script>
```

### Hugo

在 `layouts/_default/baseof.html` 中添加：

```html
<script src="{{ "js/immersive-bilingual.min.js" | relURL }}"></script>
<script>
window.ImmersiveBilingualConfig = {
  translationUrl: '{{ "translations.json" | relURL }}'
};
</script>
```

### VitePress / VuePress

在配置文件中添加：

```javascript
export default {
  head: [
    ['script', { src: '/immersive-bilingual.min.js' }],
    ['script', {}, `
      window.ImmersiveBilingualConfig = {
        translationUrl: '/translations.json'
      };
    `]
  ]
}
```

## API 参考

### 构造函数

```javascript
const bilingual = new ImmersiveBilingual(options);
```

### 方法

```javascript
// 设置翻译数据
bilingual.setTranslationData(data);

// 添加单个翻译
bilingual.addTranslation(key, value);

// 切换全部文本
bilingual.toggleAll();

// 销毁实例
bilingual.destroy();
```

## 样式自定义

库提供了默认样式，你也可以自定义：

```css
.bilingual-translation {
  border-left: 4px solid #your-color;
  padding-left: 12px;
  color: #your-text-color;
  font-style: italic;
}

.bilingual-toggle {
  background: #your-button-color;
  /* 其他样式 */
}
```

## 浏览器支持

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 开发

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build

# 测试
npm run test
```

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！

## 相关项目

- [Immersive Translate](https://immersivetranslate.com/) - 浏览器插件版本
- 灵感来源：[EAF 沉浸式翻译实现](https://github.com/emacs-eaf/emacs-application-framework)