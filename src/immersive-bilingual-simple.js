/**
 * 简化版沉浸式双语切换库
 * 只支持块级翻译: <!-- trans:id --> ... <!-- trans_end:id -->
 */

class ImmersiveBilingual {
  constructor(options = {}) {
    this.options = {
      translationData: null,
      storageKey: 'immersive_bilingual_translations',
      ...options
    };

    this.allTranslationData = {};
    this.translationData = {};
    this.initialized = false;
    this.currentRoute = this.getCurrentRoute();

    this.init();
  }

  getCurrentRoute() {
    let pathname = window.location.pathname || '/';
    
    if (pathname.endsWith('/index.html')) {
      pathname = pathname.slice(0, -10);
      if (pathname === '') {
        pathname = '/';
      }
    }
    
    return pathname;
  }

  loadCurrentRouteData() {
    if (this.allTranslationData[this.currentRoute]) {
      this.translationData = this.allTranslationData[this.currentRoute];
      console.log(`Translation data loaded for route: ${this.currentRoute}`);
      return this.translationData;
    }

    try {
      const stored = localStorage.getItem(this.options.storageKey);
      if (stored) {
        const allData = JSON.parse(stored);
        if (allData[this.currentRoute]) {
          this.translationData = allData[this.currentRoute];
          console.log(`Translation data loaded from storage for route: ${this.currentRoute}`);
          return this.translationData;
        }
      }
    } catch (error) {
      console.error('Failed to load translation data from storage:', error);
    }

    console.log(`No translation data found for route: ${this.currentRoute}`);
    return null;
  }

  saveToStorage() {
    try {
      localStorage.setItem(this.options.storageKey, JSON.stringify(this.allTranslationData));
      console.log('Translation data saved to storage');
      return true;
    } catch (error) {
      console.error('Failed to save translation data:', error);
      return false;
    }
  }

  init() {
    if (this.initialized) return;

    try {
      this.loadTranslationData();
      this.loadCurrentRouteData();
      this.injectStyles();
      const blockCount = this.processBlockTranslations();
      this.initialized = true;
      console.log(`Immersive Bilingual initialized successfully: ${blockCount} block translations`);
    } catch (error) {
      console.error('Failed to initialize Immersive Bilingual:', error);
    }
  }

  loadTranslationData() {
    if (this.options.translationData) {
      this.allTranslationData = this.options.translationData;
      this.saveToStorage();
    } else {
      try {
        const stored = localStorage.getItem(this.options.storageKey);
        if (stored) {
          this.allTranslationData = JSON.parse(stored);
        }
      } catch (error) {
        console.error('Failed to load translation data from storage:', error);
      }
    }
  }

  injectStyles() {
    const styles = `
      .bilingual-container {
        cursor: pointer;
        display: contents;
      }
      
      .bilingual-original {
        display: contents;
      }
      
      /* 确保原始内容中的元素保持原有颜色 */
      .bilingual-original > * {
        color: inherit !important;
      }
      
      .bilingual-translation {
        display: none;
        margin: 8px 0 16px 0;
        padding: 8px 0 12px 0;
        border-top: 1px dashed #ccc;
      }
      
      /* 翻译内容保持原有结构样式，但调整颜色 */
      .bilingual-translation > * {
        color: #666 !important;
      }
      
      /* 只对段落文本调整字体大小，标题保持原有大小 */
      .bilingual-translation p {
        font-size: 0.9em !important;
      }
      
      /* 翻译内容中的链接保持可点击性 */
      .bilingual-translation a {
        color: #0066cc !important;
        text-decoration: underline !important;
      }
      
      .bilingual-container.show-translation .bilingual-translation {
        display: block;
      }
      
      /* 翻译内容中的行内代码样式 */
      .bilingual-translation code {
        background-color: rgba(127, 127, 127, 0.15) !important;
        padding: 0.1em 0.3em !important;
        border-radius: 3px !important;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
        font-size: 0.85em !important;
        color: #333 !important;
      }
      
      /* 翻译内容中的强调文本 */
      .bilingual-translation strong,
      .bilingual-translation b {
        color: #555 !important;
      }
      
      /* 翻译内容中的引用块 */
      .bilingual-translation blockquote {
        border-left: 4px solid #ddd !important;
        margin: 0 0 16px 0 !important;
        padding: 0 16px !important;
        color: #666 !important;
      }
    `;

    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
  }

  processBlockTranslations() {
    // 首先收集所有的注释，然后再处理，避免在遍历过程中修改DOM
    const comments = [];
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_COMMENT,
      null,
      false
    );

    let comment;
    while (comment = walker.nextNode()) {
      const startMatch = comment.textContent.trim().match(/^trans:(.+)$/);
      if (startMatch) {
        comments.push({
          node: comment,
          id: startMatch[1].trim()
        });
      }
    }

    let processedCount = 0;
    const processedComments = new Set();

    // 现在处理收集到的注释
    for (const commentInfo of comments) {
      if (processedComments.has(commentInfo.node)) continue;
      
      const transId = commentInfo.id;
      const translation = this.translationData[transId];
      
      if (translation) {
        const endComment = this.findEndComment(commentInfo.node, transId);
        if (endComment) {
          const blockContent = this.extractBlockContent(commentInfo.node, endComment);
          if (blockContent.elements.length > 0) {
            this.createBlockBilingualElement(commentInfo.node, endComment, blockContent, translation, transId);
            processedComments.add(commentInfo.node);
            processedComments.add(endComment);
            processedCount++;
          }
        }
      }
    }

    console.log(`Processed ${processedCount} block translations`);
    return processedCount;
  }

  findEndComment(startComment, transId) {
    let node = startComment.nextSibling;
    const endPattern = new RegExp(`^trans_end:${transId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`);
    
    while (node) {
      if (node.nodeType === Node.COMMENT_NODE) {
        if (endPattern.test(node.textContent.trim())) {
          return node;
        }
      }
      node = node.nextSibling;
    }
    
    return null;
  }

  extractBlockContent(startComment, endComment) {
    const elements = [];
    const textContent = [];
    let node = startComment.nextSibling;
    
    while (node && node !== endComment) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        elements.push(node);
        textContent.push(node.textContent.trim());
      } else if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
        textContent.push(node.textContent.trim());
      }
      node = node.nextSibling;
    }
    
    return {
      elements: elements,
      textContent: textContent.join(' ').trim(),
      htmlContent: elements.map(el => el.outerHTML).join('')
    };
  }

  createBlockBilingualElement(startComment, endComment, blockContent, translationText, transId) {
    const container = document.createElement('div');
    container.className = 'bilingual-container';
    container.setAttribute('data-trans-id', transId);
    
    // 创建原始内容元素（默认显示，保持原有结构）
    const original = document.createElement('div');
    original.className = 'bilingual-original';
    original.innerHTML = blockContent.htmlContent;
    
    // 创建翻译元素（默认隐藏，显示在下方）
    const translation = document.createElement('div');
    translation.className = 'bilingual-translation';
    
    // 复制原始HTML结构，但替换文本内容为翻译
    if (blockContent.elements.length === 1) {
      // 单个元素的情况，克隆结构并替换文本
      const originalElement = blockContent.elements[0];
      const translationElement = originalElement.cloneNode(true);
      
      // 替换所有文本节点的内容
      this.replaceTextContent(translationElement, translationText);
      
      translation.appendChild(translationElement);
    } else {
      // 多个元素的情况，直接使用翻译文本
      translation.innerHTML = translationText;
    }
    
    // 先添加原始内容，再添加翻译内容
    container.appendChild(original);
    container.appendChild(translation);
    
    startComment.parentNode.insertBefore(container, startComment);
    
    let nodeToRemove = startComment;
    while (nodeToRemove) {
      const nextNode = nodeToRemove.nextSibling;
      nodeToRemove.parentNode.removeChild(nodeToRemove);
      if (nodeToRemove === endComment) break;
      nodeToRemove = nextNode;
    }
    
    container.addEventListener('click', (e) => {
      e.stopPropagation();
      container.classList.toggle('show-translation');
    });
  }

  // 递归替换元素中的文本内容，保持HTML结构
  replaceTextContent(element, newText) {
    // 如果新文本包含HTML标签，直接设置innerHTML
    if (newText.includes('<')) {
      element.innerHTML = newText;
      return;
    }
    
    // 移除ID属性，避免重复ID
    if (element.id) {
      element.removeAttribute('id');
    }
    
    // 递归处理所有子元素，移除ID
    const elementsWithId = element.querySelectorAll('[id]');
    elementsWithId.forEach(el => {
      el.removeAttribute('id');
    });
    
    // 移除链接的href属性中的锚点引用
    const links = element.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
      link.removeAttribute('href');
    });
    
    // 查找所有文本节点并替换
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
    
    const textNodes = [];
    let node;
    while (node = walker.nextNode()) {
      if (node.textContent.trim()) {
        textNodes.push(node);
      }
    }
    
    // 如果只有一个文本节点，直接替换
    if (textNodes.length === 1) {
      textNodes[0].textContent = newText;
    } else if (textNodes.length > 1) {
      // 多个文本节点，将翻译文本设置到第一个主要文本节点
      const mainTextNode = textNodes.find(node => node.textContent.trim().length > 10) || textNodes[0];
      mainTextNode.textContent = newText;
      
      // 清空其他文本节点
      textNodes.forEach(node => {
        if (node !== mainTextNode) {
          node.textContent = '';
        }
      });
    }
  }

  setAllTranslationData(data, save = true) {
    this.allTranslationData = data;
    this.loadCurrentRouteData();
    if (save) {
      this.saveToStorage();
    }
    if (this.initialized) {
      this.processBlockTranslations();
    }
  }

  getTranslationData() {
    return { ...this.translationData };
  }

  getAllTranslationData() {
    return { ...this.allTranslationData };
  }

  exportAllData() {
    return JSON.stringify(this.allTranslationData, null, 2);
  }

  importAllData(jsonString) {
    try {
      const data = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
      this.setAllTranslationData(data);
      return true;
    } catch (error) {
      console.error('Failed to import translation data:', error);
      return false;
    }
  }
}

// Auto-initialize
if (typeof window !== 'undefined') {
  window.ImmersiveBilingual = ImmersiveBilingual;
  
  const autoInit = () => {
    if (window.ImmersiveBilingualConfig && !window.bilingualInstance) {
      window.bilingualInstance = new ImmersiveBilingual(window.ImmersiveBilingualConfig);
    }
  };
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit);
  } else {
    autoInit();
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ImmersiveBilingual;
}