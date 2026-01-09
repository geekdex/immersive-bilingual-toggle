/**
 * Immersive Bilingual Toggle Library
 * A simple JavaScript library for bilingual text toggling
 * Supports route-based translation data loading
 */

class ImmersiveBilingual {
  constructor(options = {}) {
    this.options = {
      translationData: null, // 全量翻译数据，以路由为键名 { "/geekdex": {...}, "/posts/xxx.html": {...} }
      defaultMode: 'translation', // 默认显示译文（中文）
      storageKey: 'immersive_bilingual_translations', // localStorage 存储键名
      ...options
    };

    this.allTranslationData = {}; // 全量数据（以路由为键名）
    this.translationData = {}; // 当前路由的翻译数据
    this.initialized = false;
    this.currentRoute = this.getCurrentRoute();

    this.init();
  }

  /**
   * 获取当前路由
   * 例如: https://github.com/geekdex -> /geekdex
   * 例如: https://blog.algs.tech/posts/xxx.html -> /posts/xxx.html
   * 例如: /example/index.html -> /example/
   * 例如: /index.html -> /
   */
  getCurrentRoute() {
    let pathname = window.location.pathname || '/';
    
    // 处理 index.html 的情况，将其转换为目录路由
    // /example/index.html -> /example/
    // /index.html -> /
    if (pathname.endsWith('/index.html')) {
      pathname = pathname.slice(0, -10); // 移除 'index.html'
      if (pathname === '') {
        pathname = '/';
      }
    }
    
    return pathname;
  }

  /**
   * 从全量数据中加载当前路由的翻译数据
   */
  loadCurrentRouteData() {
    // 优先从传入的 translationData 中查找
    if (this.allTranslationData[this.currentRoute]) {
      this.translationData = this.allTranslationData[this.currentRoute];
      console.log(`Translation data loaded for route: ${this.currentRoute}`);
      return this.translationData;
    }

    // 尝试从 localStorage 加载
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

  /**
   * 保存翻译数据到 localStorage
   */
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

  /**
   * 设置指定路由的翻译数据
   */
  setRouteData(route, data, save = true) {
    this.allTranslationData[route] = data;
    if (route === this.currentRoute) {
      this.translationData = data;
    }
    if (save) {
      this.saveToStorage();
    }
  }

  /**
   * 获取指定路由的翻译数据
   */
  getRouteData(route) {
    return this.allTranslationData[route] || null;
  }

  /**
   * 获取所有已存储的路由列表
   */
  getStoredRoutes() {
    return Object.keys(this.allTranslationData);
  }

  /**
   * 删除指定路由的翻译数据
   */
  removeRouteData(route, save = true) {
    delete this.allTranslationData[route];
    if (route === this.currentRoute) {
      this.translationData = {};
    }
    if (save) {
      this.saveToStorage();
    }
    console.log(`Translation data removed for route: ${route}`);
  }

  /**
   * 清除所有翻译数据
   */
  clearAllData() {
    this.allTranslationData = {};
    this.translationData = {};
    localStorage.removeItem(this.options.storageKey);
    console.log('All translation data cleared');
  }

  init() {
    if (this.initialized) return;

    try {
      this.loadTranslationData();
      this.loadCurrentRouteData();
      this.injectStyles();
      this.processTextNodes();
      this.initialized = true;
      console.log('Immersive Bilingual initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Immersive Bilingual:', error);
    }
  }

  loadTranslationData() {
    // 加载传入的全量数据
    if (this.options.translationData) {
      this.allTranslationData = this.options.translationData;
      this.saveToStorage();
    } else {
      // 尝试从 localStorage 加载
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
        transition: background-color 0.2s ease;
        position: relative;
        margin: 8px 0;
      }
      
      .bilingual-container:hover {
        background-color: rgba(197, 61, 86, 0.05);
        border-radius: 4px;
      }
      
      .bilingual-translation {
        display: block;
        margin: 0;
        padding: 0;
      }
      
      .bilingual-original {
        display: none;
        color: #666;
        font-size: 0.9em;
        line-height: 1.5;
        margin: 8px 0 0 0;
        padding-top: 8px;
        border-top: 1px dashed #ccc;
      }
      
      /* 块级翻译样式 */
      .bilingual-block {
        border-left: 3px solid #007bff;
        padding-left: 12px;
        margin: 16px 0;
      }
      
      .bilingual-block .bilingual-translation {
        background: rgba(0, 123, 255, 0.02);
        padding: 8px;
        border-radius: 4px;
      }
      
      .bilingual-block .bilingual-original {
        background: rgba(108, 117, 125, 0.05);
        padding: 8px;
        border-radius: 4px;
        border-top: 1px solid #dee2e6;
        margin-top: 8px;
      }
      
      .bilingual-id-label {
        display: none;
        position: absolute;
        top: -20px;
        right: 0;
        background: #007bff;
        color: white;
        font-size: 10px;
        padding: 2px 6px;
        border-radius: 3px;
        font-family: monospace;
        z-index: 10;
      }
      
      /* 点击后显示原文和 ID */
      .bilingual-container.show-original .bilingual-original {
        display: block;
      }
      
      .bilingual-container.show-original .bilingual-id-label {
        display: block;
      }
      
      /* 悬停时显示 ID */
      .bilingual-container:hover .bilingual-id-label {
        display: block;
      }
      
      /* 块级翻译的特殊样式 */
      .bilingual-block:hover {
        background-color: rgba(197, 61, 86, 0.02);
        border-left-color: #c53d56;
      }
      
      .bilingual-block .bilingual-id-label {
        background: #28a745;
        top: -15px;
      }
    `;

    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
  }

  processTextNodes() {
    // Only process block translations with <!-- trans:id --> ... <!-- trans_end:id -->
    const processedCount = this.processBlockTranslations();
    console.log(`Processed ${processedCount} block translations`);
  }

  autoDetectAndProcess() {
    const textNodes = this.getTextNodes(document.body);
    
    textNodes.forEach(node => {
      const text = node.textContent.trim();
      
      // Skip if text is too short or contains only numbers/symbols
      if (text.length < 3 || /^[\d\s\p{P}]+$/u.test(text)) {
        return;
      }

      // Skip if parent is a button or other interactive element
      if (this.shouldSkipElement(node.parentNode)) {
        return;
      }

      // Look for translation in data
      const translation = this.findTranslation(text);
      if (translation) {
        this.createBilingualElement(node.parentNode, text, translation);
      }
    });
  }

  getTextNodes(element, nodes = []) {
    if (element.nodeType === Node.TEXT_NODE && element.textContent.trim()) {
      nodes.push(element);
    } else {
      for (const child of element.childNodes) {
        this.getTextNodes(child, nodes);
      }
    }
    return nodes;
  }

  shouldSkipElement(element) {
    const skipTags = ['BUTTON', 'INPUT', 'SELECT', 'TEXTAREA', 'SCRIPT', 'STYLE'];
    return skipTags.includes(element.tagName) || 
           element.classList?.contains('bilingual-container');
  }

  /**
   * 处理块级翻译 <!-- trans:id --> ... <!-- trans_end:id -->
   */
  processBlockTranslations() {
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_COMMENT,
      null,
      false
    );

    let comment;
    let processedCount = 0;
    const processedComments = new Set();

    while (comment = walker.nextNode()) {
      if (processedComments.has(comment)) continue;
      
      const startMatch = comment.textContent.trim().match(/^trans:(.+)$/);
      if (startMatch) {
        const transId = startMatch[1].trim();
        const translation = this.translationData[transId];
        
        if (translation) {
          // 查找对应的结束注释
          const endComment = this.findEndComment(comment, transId);
          if (endComment) {
            // 获取开始和结束注释之间的所有内容
            const blockContent = this.extractBlockContent(comment, endComment);
            if (blockContent.elements.length > 0) {
              this.createBlockBilingualElement(comment, endComment, blockContent, translation, transId);
              processedComments.add(comment);
              processedComments.add(endComment);
              processedCount++;
            }
          }
        }
      }
    }

    return processedCount;
  }

  /**
   * 查找对应的结束注释 <!-- trans_end:id -->
   */
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

  /**
   * 提取块级内容（开始和结束注释之间的所有元素）
   */
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

  /**
   * 创建块级双语元素
   */
  createBlockBilingualElement(startComment, endComment, blockContent, translationText, transId) {
    // 创建容器元素
    const container = document.createElement('div');
    container.className = 'bilingual-container bilingual-block';
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
    original.innerHTML = blockContent.htmlContent; // 保持原始 HTML 格式
    
    // 添加 ID 标识
    const idLabel = document.createElement('div');
    idLabel.className = 'bilingual-id-label';
    idLabel.textContent = `ID: ${transId}`;
    
    container.appendChild(translation);
    container.appendChild(original);
    container.appendChild(idLabel);
    
    // 在开始注释位置插入容器
    startComment.parentNode.insertBefore(container, startComment);
    
    // 移除开始注释到结束注释之间的所有内容（包括注释本身）
    let nodeToRemove = startComment;
    while (nodeToRemove) {
      const nextNode = nodeToRemove.nextSibling;
      nodeToRemove.parentNode.removeChild(nodeToRemove);
      if (nodeToRemove === endComment) break;
      nodeToRemove = nextNode;
    }
    
    // 添加点击事件
    container.addEventListener('click', (e) => {
      e.stopPropagation();
      container.classList.toggle('show-original');
    });
  }

  /**
   * 查找注释后的下一个元素节点
   */
  findNextElementAfterComment(comment) {
    let node = comment.nextSibling;
    
    // 跳过空白文本节点
    while (node && node.nodeType === Node.TEXT_NODE && !node.textContent.trim()) {
      node = node.nextSibling;
    }
    
    // 如果是元素节点，直接返回
    if (node && node.nodeType === Node.ELEMENT_NODE) {
      return node;
    }
    
    // 如果是文本节点，返回其父元素
    if (node && node.nodeType === Node.TEXT_NODE) {
      return node.parentElement;
    }
    
    return null;
  }

  /**
   * 提取元素的文本内容（排除已处理的双语容器）
   */
  extractTextContent(element) {
    if (element.classList?.contains('bilingual-container')) {
      return null;
    }
    
    // 如果元素只包含文本，直接返回
    if (element.childNodes.length === 1 && element.firstChild.nodeType === Node.TEXT_NODE) {
      return element.textContent.trim();
    }
    
    // 如果元素包含多个子节点，提取所有文本内容
    let text = '';
    for (const child of element.childNodes) {
      if (child.nodeType === Node.TEXT_NODE) {
        text += child.textContent;
      } else if (child.nodeType === Node.ELEMENT_NODE && !child.classList?.contains('bilingual-container')) {
        text += child.textContent;
      }
    }
    
    return text.trim();
  }

  findTranslation(text) {
    // Direct match
    if (this.translationData[text]) {
      return this.translationData[text];
    }

    // Fuzzy match (case insensitive, trimmed)
    const normalizedText = text.toLowerCase().trim();
    for (const [key, value] of Object.entries(this.translationData)) {
      if (key.toLowerCase().trim() === normalizedText) {
        return value;
      }
    }

    return null;
  }

  createBilingualElement(element, originalText, translationText) {
    // Skip if already processed
    if (element.classList?.contains('bilingual-container')) {
      return;
    }

    const container = document.createElement('div');
    container.className = 'bilingual-container';
    
    const translation = document.createElement('div');
    translation.className = 'bilingual-translation';
    translation.textContent = translationText;
    
    const original = document.createElement('div');
    original.className = 'bilingual-original';
    original.textContent = originalText;
    
    // 先添加译文（上面），再添加原文（下面）
    container.appendChild(translation);
    container.appendChild(original);
    
    // Replace original element content
    element.innerHTML = '';
    element.appendChild(container);
    
    // Add click handler for toggle
    container.addEventListener('click', (e) => {
      e.stopPropagation();
      container.classList.toggle('show-original');
    });
  }

  /**
   * 创建带 ID 的双语元素（用于基于注释的翻译）
   */
  createBilingualElementWithId(element, originalText, translationText, transId) {
    // Skip if already processed
    if (element.classList?.contains('bilingual-container')) {
      return;
    }

    const container = document.createElement('div');
    container.className = 'bilingual-container';
    container.setAttribute('data-trans-id', transId);
    
    const translation = document.createElement('div');
    translation.className = 'bilingual-translation';
    translation.textContent = translationText;
    
    const original = document.createElement('div');
    original.className = 'bilingual-original';
    original.textContent = originalText;
    
    // 添加 ID 标识
    const idLabel = document.createElement('div');
    idLabel.className = 'bilingual-id-label';
    idLabel.textContent = `ID: ${transId}`;
    
    // 先添加译文（上面），再添加原文（下面），最后添加 ID 标识
    container.appendChild(translation);
    container.appendChild(original);
    container.appendChild(idLabel);
    
    // Replace original element content
    element.innerHTML = '';
    element.appendChild(container);
    
    // Add click handler for toggle
    container.addEventListener('click', (e) => {
      e.stopPropagation();
      container.classList.toggle('show-original');
    });
  }

  // Public API methods
  
  /**
   * 设置全量翻译数据（以路由为键名）
   */
  setAllTranslationData(data, save = true) {
    this.allTranslationData = data;
    this.loadCurrentRouteData();
    if (save) {
      this.saveToStorage();
    }
    if (this.initialized) {
      this.processTextNodes();
    }
  }

  /**
   * 为当前路由添加单条翻译
   */
  addTranslation(key, value, save = true) {
    this.translationData[key] = value;
    this.allTranslationData[this.currentRoute] = this.translationData;
    if (save) {
      this.saveToStorage();
    }
  }

  /**
   * 为当前路由批量添加翻译
   */
  addTranslations(translations, save = true) {
    Object.assign(this.translationData, translations);
    this.allTranslationData[this.currentRoute] = this.translationData;
    if (save) {
      this.saveToStorage();
    }
  }

  /**
   * 获取当前路由的翻译数据
   */
  getTranslationData() {
    return { ...this.translationData };
  }

  /**
   * 获取全量翻译数据
   */
  getAllTranslationData() {
    return { ...this.allTranslationData };
  }

  /**
   * 导出全量翻译数据
   */
  exportAllData() {
    return JSON.stringify(this.allTranslationData, null, 2);
  }

  /**
   * 导入全量翻译数据
   */
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

  destroy() {
    // Remove bilingual containers
    document.querySelectorAll('.bilingual-container').forEach(el => {
      const original = el.querySelector('.bilingual-original');
      if (original && el.parentNode) {
        el.parentNode.innerHTML = original.textContent;
      }
    });
    
    this.initialized = false;
  }
}

// Auto-initialize if window.ImmersiveBilingualConfig exists
if (typeof window !== 'undefined') {
  window.ImmersiveBilingual = ImmersiveBilingual;
  
  // Auto-init on DOM ready
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

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ImmersiveBilingual;
}
