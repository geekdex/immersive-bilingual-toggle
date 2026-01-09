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
    
    // 创建翻译元素，保持原始标签结构
    const translation = document.createElement('div');
    translation.className = 'bilingual-translation';
    
    // 如果原始内容只有一个元素且是标题标签，保持其标签类型
    if (blockContent.elements.length === 1) {
      const originalElement = blockContent.elements[0];
      const headingTags = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'];
      
      if (headingTags.includes(originalElement.tagName)) {
        // 创建相同类型的标题标签用于翻译
        const translationElement = document.createElement(originalElement.tagName.toLowerCase());
        translationElement.innerHTML = translationText;
        // 复制原始元素的属性（除了内容）
        for (const attr of originalElement.attributes) {
          if (attr.name !== 'id') { // 避免重复 ID
            translationElement.setAttribute(attr.name, attr.value);
          }
        }
        translation.appendChild(translationElement);
      } else {
        // 非标题元素，保持原有逻辑
        translation.innerHTML = translationText;
      }
    } else {
      // 多个元素，保持原有逻辑
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