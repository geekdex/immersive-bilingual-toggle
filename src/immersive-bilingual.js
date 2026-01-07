/**
 * Immersive Bilingual Toggle Library
 * A universal JavaScript library for bilingual text toggling
 */

class ImmersiveBilingual {
  constructor(options = {}) {
    this.options = {
      translationData: null,
      translationUrl: null,
      toggleSelector: '.bilingual-toggle',
      textSelector: '[data-translate]',
      showOriginalClass: 'show-original',
      showTranslationClass: 'show-translation',
      toggleButtonText: {
        showOriginal: '显示原文',
        showTranslation: '显示译文'
      },
      autoInject: true,
      clickToToggle: true,
      ...options
    };

    this.translationData = {};
    this.currentMode = 'original'; // 默认显示原文
    this.initialized = false;

    if (this.options.autoInject) {
      this.init();
    }
  }

  async init() {
    if (this.initialized) return;

    try {
      await this.loadTranslationData();
      this.injectStyles();
      this.processTextNodes();
      this.setupToggleButtons();
      this.setupClickToggle();
      this.setInitialState(); // 设置初始状态
      this.initialized = true;
      console.log('Immersive Bilingual initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Immersive Bilingual:', error);
    }
  }

  async loadTranslationData() {
    if (this.options.translationData) {
      this.translationData = this.options.translationData;
      return;
    }

    if (this.options.translationUrl) {
      try {
        const response = await fetch(this.options.translationUrl);
        this.translationData = await response.json();
      } catch (error) {
        console.error('Failed to load translation data:', error);
        throw error;
      }
    } else {
      // Try to load from default location
      try {
        const response = await fetch('./translations.json');
        this.translationData = await response.json();
      } catch (error) {
        console.warn('No translation data found. Please provide translationData or translationUrl option.');
      }
    }
  }

  injectStyles() {
    const styles = `
      .bilingual-container {
        position: relative;
      }
      
      .bilingual-text {
        cursor: pointer;
        transition: opacity 0.3s ease;
      }
      
      .bilingual-text:hover {
        background-color: rgba(197, 61, 86, 0.1);
        border-radius: 2px;
      }
      
      .bilingual-original,
      .bilingual-translation {
        display: block;
        margin: 4px 0;
      }
      
      .bilingual-translation {
        border-left: 4px solid #C53D56;
        padding-left: 12px;
        color: #2c3e50;
        font-style: italic;
        display: none; /* 默认隐藏译文 */
      }
      
      .show-original .bilingual-translation {
        display: none;
      }
      
      .show-translation .bilingual-original {
        display: none;
      }
      
      .show-translation .bilingual-translation {
        display: block; /* 翻译模式下显示译文 */
      }
      
      .bilingual-toggle {
        position: fixed;
        top: 20px;
        right: 20px;
        background: #C53D56;
        color: white;
        border: none;
        padding: 10px 15px;
        border-radius: 5px;
        cursor: pointer;
        font-size: 14px;
        z-index: 9999;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        transition: background-color 0.3s ease;
      }
      
      .bilingual-toggle:hover {
        background: #a02d42;
      }
      
      .bilingual-status {
        position: fixed;
        top: 70px;
        right: 20px;
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 5px 10px;
        border-radius: 3px;
        font-size: 12px;
        z-index: 9998;
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      
      .bilingual-status.show {
        opacity: 1;
      }
    `;

    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
  }

  processTextNodes() {
    // Process elements with data-translate attribute
    const elements = document.querySelectorAll(this.options.textSelector);
    
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
    const skipClasses = ['bilingual-toggle', 'bilingual-status'];
    
    return skipTags.includes(element.tagName) || 
           skipClasses.some(cls => element.classList?.contains(cls));
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
    container.className = 'bilingual-container bilingual-text';
    
    const original = document.createElement('span');
    original.className = 'bilingual-original';
    original.textContent = originalText;
    
    const translation = document.createElement('span');
    translation.className = 'bilingual-translation';
    translation.textContent = translationText;
    
    container.appendChild(original);
    container.appendChild(translation);
    
    // Replace original element content
    element.innerHTML = '';
    element.appendChild(container);
    
    // Add click handler for individual toggle
    if (this.options.clickToToggle) {
      container.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleSingleElement(container);
      });
    }
  }

  setupToggleButtons() {
    // Create main toggle button
    const toggleButton = document.createElement('button');
    toggleButton.className = 'bilingual-toggle';
    toggleButton.textContent = this.options.toggleButtonText.showTranslation; // 初始显示"显示译文"
    toggleButton.addEventListener('click', () => this.toggleAll());
    document.body.appendChild(toggleButton);

    // Create status indicator
    const statusDiv = document.createElement('div');
    statusDiv.className = 'bilingual-status';
    statusDiv.textContent = '当前显示: 原文'; // 初始状态显示原文
    document.body.appendChild(statusDiv);

    this.toggleButton = toggleButton;
    this.statusDiv = statusDiv;
  }

  setupClickToggle() {
    if (!this.options.clickToToggle) return;

    // Add global click handler info
    const info = document.createElement('div');
    info.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: rgba(0,0,0,0.7);
      color: white;
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 12px;
      z-index: 9997;
    `;
    info.textContent = '点击文本切换原文/译文';
    document.body.appendChild(info);

    // Auto-hide after 5 seconds
    setTimeout(() => {
      info.style.opacity = '0';
      setTimeout(() => info.remove(), 300);
    }, 5000);
  }

  setInitialState() {
    // 设置初始状态：显示原文，隐藏译文
    document.body.classList.remove(this.options.showOriginalClass, this.options.showTranslationClass);
    
    // 更新按钮文本和状态显示
    if (this.toggleButton) {
      this.toggleButton.textContent = this.options.toggleButtonText.showTranslation;
    }
    if (this.statusDiv) {
      this.statusDiv.textContent = '当前显示: 原文';
    }
  }

  toggleAll() {
    this.currentMode = this.currentMode === 'translation' ? 'original' : 'translation';
    
    document.body.classList.remove(this.options.showOriginalClass, this.options.showTranslationClass);
    
    if (this.currentMode === 'original') {
      document.body.classList.add(this.options.showOriginalClass);
      this.toggleButton.textContent = this.options.toggleButtonText.showTranslation;
      this.statusDiv.textContent = '当前显示: 原文';
    } else {
      document.body.classList.add(this.options.showTranslationClass);
      this.toggleButton.textContent = this.options.toggleButtonText.showOriginal;
      this.statusDiv.textContent = '当前显示: 译文';
    }

    this.showStatus();
  }

  toggleSingleElement(element) {
    const isShowingOriginal = element.classList.contains('show-original-single');
    
    if (isShowingOriginal) {
      element.classList.remove('show-original-single');
      element.querySelector('.bilingual-translation').style.display = 'block';
      element.querySelector('.bilingual-original').style.display = 'block';
    } else {
      element.classList.add('show-original-single');
      element.querySelector('.bilingual-translation').style.display = 'none';
      element.querySelector('.bilingual-original').style.display = 'block';
    }
  }

  showStatus() {
    this.statusDiv.classList.add('show');
    setTimeout(() => {
      this.statusDiv.classList.remove('show');
    }, 2000);
  }

  // Public API methods
  setTranslationData(data) {
    this.translationData = data;
    if (this.initialized) {
      this.processTextNodes();
    }
  }

  addTranslation(key, value) {
    this.translationData[key] = value;
  }

  destroy() {
    // Remove injected elements
    document.querySelectorAll('.bilingual-toggle, .bilingual-status').forEach(el => el.remove());
    
    // Remove classes
    document.body.classList.remove(this.options.showOriginalClass, this.options.showTranslationClass);
    
    this.initialized = false;
  }
}

// Auto-initialize if window.ImmersiveBilingualConfig exists
if (typeof window !== 'undefined') {
  window.ImmersiveBilingual = ImmersiveBilingual;
  
  // Auto-init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      if (window.ImmersiveBilingualConfig) {
        new ImmersiveBilingual(window.ImmersiveBilingualConfig);
      }
    });
  } else if (window.ImmersiveBilingualConfig) {
    new ImmersiveBilingual(window.ImmersiveBilingualConfig);
  }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ImmersiveBilingual;
}