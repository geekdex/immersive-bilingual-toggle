# 沉浸式双语切换

通用 JavaScript 库，实现网页双语切换。支持基于路由的翻译数据管理。

## 功能

- 基于路由的翻译数据管理
- 默认显示译文，点击切换原文
- 支持块级翻译和自动文本匹配
- 本地存储翻译数据

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

**自动文本匹配：**
页面中的英文文本会自动匹配翻译数据中的 ID，显示对应译文。

**块级翻译（推荐）：**
```html
<!-- trans:intro_1 -->
<p>JavaScript is a programming language</p>
<!-- trans_end:intro_1 -->

<!-- trans:intro_2 -->
<p>that adds interactivity to your website</p>
<!-- trans_end:intro_2 -->
```

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

## 构建

```bash
npm install
npm run build
```

## 示例

查看 `example/` 目录

## 许可证

MIT