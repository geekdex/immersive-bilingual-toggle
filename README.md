# 沉浸式双语切换

通用 JavaScript 库，实现网页中英文双语切换。适合技术文档汉化。

## 功能

- 默认显示中文译文
- 点击文字块切换原文/译文
- 自动检测文本匹配翻译

## 快速使用

### 1. 引入文件

```html
<!-- 引入翻译配置 -->
<script src="translations.js"></script>
<!-- 引入库文件 -->
<script src="immersive-bilingual.min.js"></script>
```

### 2. 配置翻译

`translations.js` 文件内容：
```javascript
window.ImmersiveBilingualConfig = {
    translationData: {
        "Hello World": "你好世界",
        "Welcome": "欢迎"
    }
};
```

### 3. 使用方式

- 页面加载后默认显示中文译文
- 点击任意文字块切换到英文原文
- 再次点击切换回中文译文

## 配置选项

```javascript
window.ImmersiveBilingualConfig = {
    translationData: {        // 翻译数据对象（必需）
        "原文": "译文"
    }
};
```

## 构建

```bash
npm install
npm run build
```

## 示例

查看 `example/index.html`

## 许可证

MIT