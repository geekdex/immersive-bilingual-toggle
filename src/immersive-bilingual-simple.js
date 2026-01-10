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
      this.processBlockTranslations();
      this.initialized = true;
      console.log('Immersive Bilingual initialized successfully');
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
      }
      
      .bilingual-translation {
        display: block;
      }
      
      /* 确保翻译内容中的元素保持原有样式 */
      .bilingual-translation > * {
        margin: inherit !important;
        padding: inherit !important;
        line-height: inherit !important;
      }
      
      /* 特别处理段落元素，确保段落间距正常 */
      .bilingual-translation > p {
        margin-bottom: 1em !important;
        margin-top: 0 !important;
      }
      
      /* 标题元素保持原有间距 */
      .bilingual-translation > h1,
      .bilingual-translation > h2,
      .bilingual-translation > h3,
      .bilingual-translation > h4,
      .bilingual-translation > h5,
      .bilingual-translation > h6 {
        margin-top: 1.5em !important;
        margin-bottom: 0.5em !important;
      }
      
      .bilingual-original {
        display: none;
        color: #666;
        font-size: 0.9em;
        margin-top: 8px;
        padding-top: 8px;
        border-top: 1px dashed #ccc;
      }
      
      .bilingual-container.show-original .bilingual-original {
        display: block;
      }
      
      /* 确保容器不会破坏原有的文档流 */
      .bilingual-container {
        display: block;
      }
      
      /* 针对不同类型的内容元素进行优化 */
      .bilingual-container p,
      .bilingual-container h1,
      .bilingual-container h2,
      .bilingual-container h3,
      .bilingual-container h4,
      .bilingual-container h5,
      .bilingual-container h6 {
        margin: inherit;
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
    
    // 创建翻译元素，尽可能保持原始标签结构和样式
    const translation = document.createElement('div');
    translation.className = 'bilingual-translation';
    
    // 智能处理翻译内容的标签结构
    if (blockContent.elements.length === 1) {
      const originalElement = blockContent.elements[0];
      
      // 创建与原始元素相同类型的翻译元素
      const translationElement = document.createElement(originalElement.tagName.toLowerCase());
      translationElement.innerHTML = translationText;
      
      // 复制原始元素的所有属性（除了可能冲突的 id）
      for (const attr of originalElement.attributes) {
        if (attr.name !== 'id') {
          translationElement.setAttribute(attr.name, attr.value);
        }
      }
      
      // 复制原始元素的 class，保持样式一致
      if (originalElement.className) {
        translationElement.className = originalElement.className;
      }
      
      translation.appendChild(translationElement);
    } else if (blockContent.elements.length > 1) {
      // 多个元素的情况，尝试解析翻译文本中的 HTML 标签
      // 如果翻译文本包含 HTML 标签，直接使用；否则包装在适当的标签中
      if (translationText.includes('<')) {
        translation.innerHTML = translationText;
      } else {
        // 如果翻译文本是纯文本，根据原始内容的主要标签类型来包装
        const mainTagType = this.getMainTagType(blockContent.elements);
        if (mainTagType) {
          const translationElement = document.createElement(mainTagType);
          translationElement.textContent = translationText;
          translation.appendChild(translationElement);
        } else {
          translation.innerHTML = translationText;
        }
      }
    } else {
      // 没有元素的情况，直接使用翻译文本
      translation.innerHTML = translationText;
    }
    
    const original = document.createElement('div');
    original.className = 'bilingual-original';
    original.innerHTML = blockContent.htmlContent;
    
    container.appendChild(translation);
    container.appendChild(original);
    
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
      container.classList.toggle('show-original');
    });
  }

  /**
   * 获取元素列表中的主要标签类型
   */
  getMainTagType(elements) {
    const tagCounts = {};
    
    elements.forEach(el => {
      const tagName = el.tagName.toLowerCase();
      tagCounts[tagName] = (tagCounts[tagName] || 0) + 1;
    });
    
    // 返回出现次数最多的标签类型
    let maxCount = 0;
    let mainTag = null;
    
    for (const [tag, count] of Object.entries(tagCounts)) {
      if (count > maxCount) {
        maxCount = count;
        mainTag = tag;
      }
    }
    
    return mainTag;
  }

  // Public API methods
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