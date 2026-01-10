# 沉浸式双语切换

通用 JavaScript 库，实现网页双语切换。支持基于路由的翻译数据管理。

## 功能

- 基于路由的翻译数据管理
- 默认显示译文，点击切换原文
- 支持块级翻译和自动文本匹配
- 本地存储翻译数据
- **🆕 智能保持原始标签结构和样式**

## 最新优化 (v1.1.0)

### 问题修复
- ✅ **保持原始标签类型**：翻译后的 `<p>` 标签仍然是 `<p>`，`<h1>` 仍然是 `<h1>`
- ✅ **保持段落间距**：修复翻译后段落间距消失的问题
- ✅ **保持样式属性**：自动复制原始元素的 class、style 等属性
- ✅ **语义化结构**：保持 HTML 语义化，不破坏文档结构
- ✅ **智能多元素处理**：正确处理包含多个元素的翻译块

### 对比效果

**优化前：**
```html
<!-- 原始内容 -->
<p>JavaScript is a programming language</p>
<p>Variables are containers for data</p>

<!-- 翻译后 (问题) -->
<div class="bilingual-translation">JavaScript 是一种编程语言</div>
<div class="bilingual-translation">变量是数据容器</div>
<!-- 失去了 p 标签的语义和间距 -->
```

**优化后：**
```html
<!-- 原始内容 -->
<p>JavaScript is a programming language</p>
<p>Variables are containers for data</p>

<!-- 翻译后 (正确) -->
<div class="bilingual-container">
  <div class="bilingual-translation">
    <p>JavaScript 是一种编程语言</p>  <!-- 保持 p 标签 -->
  </div>
</div>
<div class="bilingual-container">
  <div class="bilingual-translation">
    <p>变量是数据容器</p>  <!-- 保持 p 标签和间距 -->
  </div>
</div>
```

## 快速使用

### 1. 引入文件

```html
<script src="translations.js"></script>
<script src="immersive-bilingual.min.js"></script>
```

### 2. 配置翻译数据

```javascript
window.ImmersiveBilingualConfig = {
    translationData: {
        "/example/": {
            "intro_1": "JavaScript 是一种编程语言",
            "intro_2": "用于为网站添加交互性"
        },
        "/docs/": {
            "title": "文档标题",
            "content": "文档内容"
        }
    }
};
```

### 3. 使用方式

**块级翻译（推荐）：**
```html
<!-- trans:intro_1 -->
<p>JavaScript is a programming language</p>
<!-- trans_end:intro_1 -->

<!-- trans:intro_2 -->
<p>that adds interactivity to your website</p>
<!-- trans_end:intro_2 -->

<!-- 标题翻译 -->
<!-- trans:main_title -->
<h1>Getting Started</h1>
<!-- trans_end:main_title -->

<!-- 混合内容翻译 -->
<!-- trans:feature_list -->
<h3>Features</h3>
<ul>
  <li>Feature 1</li>
  <li>Feature 2</li>
</ul>
<!-- trans_end:feature_list -->
```

**自动文本匹配：**
页面中的英文文本会自动匹配翻译数据中的 ID，显示对应译文。

## API

```javascript
const bilingual = new ImmersiveBilingual(config);

// 设置路由翻译数据
bilingual.setRouteData('/path/', { id: '译文' });

// 获取当前路由数据
bilingual.getTranslationData();

// 导出/导入全量数据
const data = bilingual.exportAllData();
bilingual.importAllData(data);
```

## 测试优化效果

查看优化效果对比：
- `test-optimization.html` - 基础功能测试
- `comparison.html` - 优化前后效果对比

## 构建

```bash
npm install
npm run build
```

## 示例

查看 `example/` 目录

## 许可证

MIT