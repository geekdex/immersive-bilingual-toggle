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
      
      /* 点击后显示原文 */
      .bilingual-container.show-original .bilingual-original {
        display: block;
      }
    `;

    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
  }

  processTextNodes() {
    // Process elements with data-translate attribute
    const elements = document.querySelectorAll('[data-translate]');
    
    elements.forEach(element => {
      const key = element.getAttribute('data-translate');
      if (key && this.translationData[key]) {
        this.createBilingualElement(element, element.textContent.trim(), this.translationData[key]);
      }
    });

    // Auto-detect and process text nodes if no data-translate elements found
    if (elements.length === 0) {
      this.autoDetectAndProcess();
    }
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
