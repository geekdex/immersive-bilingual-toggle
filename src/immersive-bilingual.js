/**
 * Immersive Bilingual Toggle Library
 * A simple JavaScript library for bilingual text toggling
 */

class ImmersiveBilingual {
  constructor(options = {}) {
    this.options = {
      translationData: null,
      defaultMode: 'translation', // 默认显示译文（中文）
      ...options
    };

    this.translationData = {};
    this.initialized = false;

    if (this.options.translationData) {
      this.init();
    }
  }

  init() {
    if (this.initialized) return;

    try {
      this.loadTranslationData();
      this.injectStyles();
      this.processTextNodes();
      this.initialized = true;
      console.log('Immersive Bilingual initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Immersive Bilingual:', error);
    }
  }

  loadTranslationData() {
    if (this.options.translationData) {
      this.translationData = this.options.translationData;
    } else {
      console.warn('No translation data found. Please provide translationData option.');
    }
  }

  injectStyles() {
    const styles = `
      .bilingual-container {
        position: relative;
        cursor: pointer;
        transition: all 0.2s ease;
        padding: 8px 0;
      }
      
      .bilingual-container:hover {
        background-color: rgba(197, 61, 86, 0.05);
        border-radius: 4px;
      }
      
      .bilingual-translation {
        display: block;
        color: #333;
        line-height: 1.6;
        margin: 0;
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