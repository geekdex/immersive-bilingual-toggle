# 集成指南

本指南详细说明如何将 Immersive Bilingual 集成到各种静态网站生成器和框架中。

## 通用集成步骤

### 1. 下载库文件

```bash
# 方式一：直接下载
wget https://github.com/yourusername/immersive-bilingual/releases/latest/download/immersive-bilingual.min.js

# 方式二：使用 CDN
# 在 HTML 中直接引用 CDN 链接
```

### 2. 准备翻译文件

创建 `translations.json` 文件，放在网站根目录或 assets 目录：

```json
{
  "Getting Started": "开始使用",
  "Documentation": "文档",
  "API Reference": "API 参考",
  "Examples": "示例"
}
```

### 3. 基础 HTML 集成

```html
<!DOCTYPE html>
<html>
<head>
    <title>Your Site</title>
</head>
<body>
    <!-- 你的内容 -->
    <h1 data-translate="Getting Started">Getting Started</h1>
    
    <!-- 在页面底部引入库 -->
    <script src="path/to/immersive-bilingual.min.js"></script>
    <script>
        window.ImmersiveBilingualConfig = {
            translationUrl: './translations.json'
        };
    </script>
</body>
</html>
```

## 静态网站生成器集成

### Jekyll

#### 1. 文件结构
```
your-jekyll-site/
├── _layouts/
│   └── default.html
├── assets/
│   ├── js/
│   │   └── immersive-bilingual.min.js
│   └── translations.json
└── _config.yml
```

#### 2. 修改 `_layouts/default.html`

```html
<!DOCTYPE html>
<html lang="{{ page.lang | default: site.lang | default: 'en' }}">
<head>
    <!-- 你的 head 内容 -->
</head>
<body>
    {{ content }}
    
    <!-- 沉浸式翻译 -->
    <script src="{{ '/assets/js/immersive-bilingual.min.js' | relative_url }}"></script>
    <script>
        window.ImmersiveBilingualConfig = {
            translationUrl: '{{ "/assets/translations.json" | relative_url }}'
        };
    </script>
</body>
</html>
```

#### 3. 在 Markdown 文件中使用

```markdown
---
layout: default
---

# Getting Started
{: data-translate="Getting Started"}

Welcome to our documentation.
{: data-translate="Welcome to our documentation"}
```

### Hugo

#### 1. 文件结构
```
your-hugo-site/
├── layouts/
│   └── _default/
│       └── baseof.html
├── static/
│   ├── js/
│   │   └── immersive-bilingual.min.js
│   └── translations.json
└── config.yaml
```

#### 2. 修改 `layouts/_default/baseof.html`

```html
<!DOCTYPE html>
<html lang="{{ .Site.Language.Lang }}">
<head>
    <!-- 你的 head 内容 -->
</head>
<body>
    {{ block "main" . }}{{ end }}
    
    <!-- 沉浸式翻译 -->
    <script src="{{ "js/immersive-bilingual.min.js" | relURL }}"></script>
    <script>
        window.ImmersiveBilingualConfig = {
            translationUrl: '{{ "translations.json" | relURL }}'
        };
    </script>
</body>
</html>
```

#### 3. 在内容文件中使用

```markdown
---
title: "Getting Started"
---

{{< bilingual key="Getting Started" >}}Getting Started{{< /bilingual >}}

{{< bilingual key="Welcome message" >}}Welcome to our documentation{{< /bilingual >}}
```

创建 shortcode `layouts/shortcodes/bilingual.html`：

```html
<span data-translate="{{ .Get "key" }}">{{ .Inner }}</span>
```

### VitePress

#### 1. 配置文件 `.vitepress/config.js`

```javascript
export default {
  title: 'Your Site',
  description: 'Your site description',
  
  head: [
    ['script', { src: '/immersive-bilingual.min.js' }],
    ['script', {}, `
      window.ImmersiveBilingualConfig = {
        translationUrl: '/translations.json'
      };
    `]
  ],
  
  // 其他配置...
}
```

#### 2. 文件结构
```
your-vitepress-site/
├── .vitepress/
│   └── config.js
├── public/
│   ├── immersive-bilingual.min.js
│   └── translations.json
└── index.md
```

#### 3. 在 Markdown 中使用

```markdown
# <span data-translate="Getting Started">Getting Started</span>

<p data-translate="Welcome message">Welcome to our documentation</p>
```

### Docusaurus

#### 1. 安装和配置

```javascript
// docusaurus.config.js
module.exports = {
  // 其他配置...
  
  scripts: [
    {
      src: '/js/immersive-bilingual.min.js',
      async: true,
    },
    {
      src: '/js/bilingual-config.js',
      async: true,
    }
  ],
  
  // 其他配置...
};
```

#### 2. 创建配置文件 `static/js/bilingual-config.js`

```javascript
window.ImmersiveBilingualConfig = {
  translationUrl: '/translations.json',
  toggleButtonText: {
    showOriginal: 'Show English',
    showTranslation: '显示中文'
  }
};
```

#### 3. 文件结构
```
your-docusaurus-site/
├── static/
│   ├── js/
│   │   ├── immersive-bilingual.min.js
│   │   └── bilingual-config.js
│   └── translations.json
└── docusaurus.config.js
```

### GitBook

#### 1. 在 `book.json` 中配置

```json
{
  "plugins": ["immersive-bilingual"],
  "pluginsConfig": {
    "immersive-bilingual": {
      "translationUrl": "./translations.json"
    }
  }
}
```

#### 2. 创建插件文件 `node_modules/gitbook-plugin-immersive-bilingual/index.js`

```javascript
module.exports = {
  hooks: {
    "page:after": function(page) {
      const config = this.config.get('pluginsConfig.immersive-bilingual', {});
      
      page.content = page.content + `
        <script src="path/to/immersive-bilingual.min.js"></script>
        <script>
          window.ImmersiveBilingualConfig = ${JSON.stringify(config)};
        </script>
      `;
      
      return page;
    }
  }
};
```

## 高级配置

### 自定义样式

```css
/* 自定义翻译文本样式 */
.bilingual-translation {
  border-left: 4px solid #your-brand-color;
  background-color: #your-background-color;
  padding: 8px 12px;
  margin: 8px 0;
  border-radius: 4px;
}

/* 自定义切换按钮样式 */
.bilingual-toggle {
  background: linear-gradient(45deg, #your-color1, #your-color2);
  border-radius: 20px;
  font-weight: bold;
}

/* 自定义悬停效果 */
.bilingual-text:hover {
  background-color: rgba(your-rgb-values, 0.1);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
```

### 动态加载翻译

```javascript
// 根据用户语言偏好动态加载
const userLang = navigator.language.startsWith('zh') ? 'zh' : 'en';
const translationUrl = `./translations-${userLang}.json`;

window.ImmersiveBilingualConfig = {
  translationUrl: translationUrl,
  autoInject: false  // 手动初始化
};

// 手动初始化
document.addEventListener('DOMContentLoaded', async function() {
  try {
    const bilingual = new ImmersiveBilingual(window.ImmersiveBilingualConfig);
    await bilingual.init();
  } catch (error) {
    console.warn('Translation not available for this language');
  }
});
```

### 与现有 i18n 系统集成

```javascript
// 与 i18next 集成示例
import i18next from 'i18next';

// 从 i18next 获取翻译数据
const translationData = {};
const keys = ['getting-started', 'documentation', 'api-reference'];

keys.forEach(key => {
  translationData[i18next.t(key, { lng: 'en' })] = i18next.t(key, { lng: 'zh' });
});

window.ImmersiveBilingualConfig = {
  translationData: translationData,
  clickToToggle: true
};
```

## 性能优化

### 1. 延迟加载

```javascript
// 只在需要时加载翻译功能
function loadBilingualTranslation() {
  if (!window.ImmersiveBilingual) {
    const script = document.createElement('script');
    script.src = 'path/to/immersive-bilingual.min.js';
    script.onload = function() {
      new ImmersiveBilingual(window.ImmersiveBilingualConfig);
    };
    document.head.appendChild(script);
  }
}

// 用户点击翻译按钮时才加载
document.getElementById('translate-btn').addEventListener('click', loadBilingualTranslation);
```

### 2. 缓存翻译数据

```javascript
// 使用 localStorage 缓存翻译数据
window.ImmersiveBilingualConfig = {
  translationUrl: './translations.json',
  cacheTranslations: true,  // 自定义选项
  
  // 自定义加载函数
  async loadTranslationData() {
    const cacheKey = 'bilingual-translations';
    const cached = localStorage.getItem(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }
    
    const response = await fetch(this.translationUrl);
    const data = await response.json();
    
    localStorage.setItem(cacheKey, JSON.stringify(data));
    return data;
  }
};
```

## 故障排除

### 常见问题

1. **翻译不显示**
   - 检查 `translations.json` 文件路径是否正确
   - 确认 JSON 格式是否有效
   - 查看浏览器控制台是否有错误信息

2. **样式冲突**
   - 使用更具体的 CSS 选择器
   - 添加 `!important` 声明
   - 检查 CSS 加载顺序

3. **性能问题**
   - 减少翻译数据大小
   - 使用 `data-translate` 属性明确标记需要翻译的元素
   - 考虑分页加载大量内容

### 调试模式

```javascript
window.ImmersiveBilingualConfig = {
  translationUrl: './translations.json',
  debug: true,  // 启用调试模式
  
  // 自定义日志函数
  onTranslationApplied: function(element, original, translation) {
    console.log('Translation applied:', { element, original, translation });
  },
  
  onError: function(error) {
    console.error('Bilingual error:', error);
  }
};
```