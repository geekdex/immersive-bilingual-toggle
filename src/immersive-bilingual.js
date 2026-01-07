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
        transition: background-color 0.2s ease;
      }
      
      .bilingual-container:hover {
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
      }
      
      .bilingual-original {
        color: #666;
        font-size: 0.9em;
        display: none;
      }
      
      /* 点击切换状态 */
      .bilingual-container.show-original .bilingual-original {
        display: block;
      }
      
      .bilingual-container.show-original .bilingual-translation {
        display: none;
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