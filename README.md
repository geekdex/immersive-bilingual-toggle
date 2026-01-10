# 沉浸式双语切换

通用 JavaScript 库，实现网页双语切换。支持基于路由的翻译数据管理。

## 功能

- 基于路由的翻译数据管理
- 默认显示原文，点击显示译文
- 支持块级翻译标签
- 智能保持原始标签结构和样式
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

**块级翻译：**
```html
<!-- trans:intro_1 -->
<p>JavaScript is a programming language</p>
<!-- trans_end:intro_1 -->

<!-- trans:intro_2 -->
<p>that adds interactivity to your website</p>
<!-- trans_end:intro_2 -->
```

## 工作原理

1. **默认显示**：页面加载时显示原始内容，保持网页原有的结构和样式
2. **点击切换**：点击任何有翻译的区块时，在下方显示翻译内容
3. **样式保持**：翻译内容保持与原始内容相同的HTML结构，只调整颜色为灰色以示区别
4. **再次点击**：再次点击可隐藏翻译内容

## 特性

- **无侵入性**：不改变原始网页的任何内容和样式
- **智能结构保持**：翻译内容完全复制原始HTML结构（标题、段落、链接、代码块等）
- **ID冲突处理**：自动移除翻译内容中的ID属性，避免重复ID问题
- **路由管理**：根据当前页面路径自动加载对应的翻译数据
- **本地缓存**：翻译数据自动保存到localStorage，提高加载速度

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
