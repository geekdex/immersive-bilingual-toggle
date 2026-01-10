/**
 * 简化版沉浸式双语切换库
 * 只支持块级翻译: <!-- trans:id --> ... <!-- trans_end:id -->
 */

class ImmersiveBilingual {
  constructor(options = {}) {
    this.options = {
      translationData: null,
      commonTranslationData: null, // 通用翻译数据
      storageKey: 'immersive_bilingual_translations',
      ...options
    };

    this.allTranslationData = {};
    this.translationData = {};
    this.commonTranslationData = {}; // 通用翻译数据
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
      const commonCount = this.processCommonTranslations();
      this.initialized = true;
      console.log(`Immersive Bilingual initialized successfully: ${blockCount} block translations, ${commonCount} common translations`);
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

    // 加载通用翻译数据
    if (this.options.commonTranslationData) {
      this.commonTranslationData = this.options.commonTranslationData;
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
      
      /* 确保翻译内容中的元素保持原有样式和颜色 */
      .bilingual-translation > * {
        margin: inherit !important;
        padding: inherit !important;
        line-height: inherit !important;
        color: inherit !important;
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
        margin: 8px 0 16px 0;
        padding: 8px 0 12px 0;
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
      
      // 智能处理翻译文本内容，保持内部结构
      this.setTranslationContent(translationElement, originalElement, translationText);
      
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

  /**
   * 智能设置翻译内容，保持内部结构
   */
  setTranslationContent(translationElement, originalElement, translationText) {
    // 如果翻译文本包含 HTML 标签，直接使用
    if (translationText.includes('<')) {
      translationElement.innerHTML = translationText;
      return;
    }
    
    // 分析原始元素的内部结构
    const innerStructure = this.analyzeInnerStructure(originalElement);
    
    if (innerStructure.hasSimpleTextContent) {
      // 简单文本内容，直接设置
      translationElement.textContent = translationText;
    } else if (innerStructure.hasParagraphs) {
      // 包含段落结构，创建相应的 p 标签并保持内部样式
      const p = document.createElement('p');
      
      // 复制原始 p 标签的属性
      const originalP = originalElement.querySelector('p');
      if (originalP) {
        for (const attr of originalP.attributes) {
          if (attr.name !== 'id') {
            p.setAttribute(attr.name, attr.value);
          }
        }
        if (originalP.className) {
          p.className = originalP.className;
        }
        
        // 检查原始 p 标签内是否有样式标签（如 strong, em, code 等）
        const styleElements = this.extractStyleElements(originalP);
        if (styleElements.length > 0) {
          // 尝试将翻译文本包装在相同的样式标签中
          p.innerHTML = this.wrapTranslationWithStyles(translationText, styleElements);
        } else {
          p.innerHTML = translationText;
        }
      } else {
        p.innerHTML = translationText;
      }
      
      translationElement.appendChild(p);
    } else if (innerStructure.hasComplexContent) {
      // 复杂内容，尝试保持结构
      translationElement.innerHTML = translationText;
    } else {
      // 默认情况
      translationElement.textContent = translationText;
    }
  }

  /**
   * 提取元素中的样式标签
   */
  extractStyleElements(element) {
    const styleElements = [];
    const styleTagNames = ['strong', 'b', 'em', 'i', 'code', 'kbd', 'mark', 'small', 'sub', 'sup', 'u', 's', 'del', 'ins'];
    
    // 递归查找所有样式标签
    const findStyleElements = (el) => {
      for (const child of el.children) {
        if (styleTagNames.includes(child.tagName.toLowerCase())) {
          styleElements.push({
            tagName: child.tagName.toLowerCase(),
            className: child.className,
            attributes: Array.from(child.attributes).reduce((acc, attr) => {
              if (attr.name !== 'id') {
                acc[attr.name] = attr.value;
              }
              return acc;
            }, {})
          });
        }
        findStyleElements(child);
      }
    };
    
    findStyleElements(element);
    return styleElements;
  }

  /**
   * 将翻译文本包装在样式标签中
   */
  wrapTranslationWithStyles(translationText, styleElements) {
    if (styleElements.length === 0) {
      return translationText;
    }
    
    // 对于简单情况，如果只有一个样式标签，直接包装
    if (styleElements.length === 1) {
      const style = styleElements[0];
      let attrs = '';
      
      // 构建属性字符串
      for (const [name, value] of Object.entries(style.attributes)) {
        attrs += ` ${name}="${value}"`;
      }
      
      return `<${style.tagName}${attrs}>${translationText}</${style.tagName}>`;
    }
    
    // 对于多个样式标签，嵌套包装（最常见的是 strong 包含其他标签）
    let result = translationText;
    for (let i = styleElements.length - 1; i >= 0; i--) {
      const style = styleElements[i];
      let attrs = '';
      
      for (const [name, value] of Object.entries(style.attributes)) {
        attrs += ` ${name}="${value}"`;
      }
      
      result = `<${style.tagName}${attrs}>${result}</${style.tagName}>`;
    }
    
    return result;
  }

  /**
   * 分析元素的内部结构
   */
  analyzeInnerStructure(element) {
    const children = Array.from(element.children);
    const textNodes = Array.from(element.childNodes).filter(node => 
      node.nodeType === Node.TEXT_NODE && node.textContent.trim()
    );
    
    return {
      hasSimpleTextContent: children.length === 0 && textNodes.length > 0,
      hasParagraphs: children.some(child => child.tagName === 'P'),
      hasComplexContent: children.length > 1 || 
        (children.length === 1 && children[0].children.length > 0),
      mainChildTag: children.length === 1 ? children[0].tagName.toLowerCase() : null
    };
  }

  /**
   * 处理通用翻译（没有翻译标签的元素）
   */
  processCommonTranslations() {
    if (!this.commonTranslationData || Object.keys(this.commonTranslationData).length === 0) {
      return 0;
    }

    let processedCount = 0;

    // 获取所有可能的文本元素，转换为数组以避免实时更新问题
    // 移除 LI 避免匹配到包含子菜单的列表项
    const elements = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, a, td, th'));
    
    // 收集需要处理的元素和翻译
    const toProcess = [];
    
    for (const element of elements) {
      // 跳过已处理的双语容器及其子元素
      if (element.closest('.bilingual-container')) {
        continue;
      }
      
      // 跳过不合适的元素
      if (!this.isValidTranslationTarget(element)) {
        continue;
      }
      
      // 获取元素的纯文本内容
      const text = element.textContent.trim();
      
      // 查找匹配的通用翻译
      const result = this.findCommonTranslation(text);
      if (result) {
        toProcess.push({ element, text, ...result });
      }
    }
    
    // 批量处理收集到的元素
    for (const item of toProcess) {
      this.createCommonBilingualElement(item.element, item.key, item.translation, item.isPartial);
      processedCount++;
    }

    return processedCount;
  }

  /**
   * 查找通用翻译
   */
  findCommonTranslation(text) {
    // 直接匹配
    if (this.commonTranslationData[text]) {
      return { key: text, translation: this.commonTranslationData[text] };
    }

    // 模糊匹配（忽略大小写和前后空格）
    const normalizedText = text.toLowerCase().trim();
    for (const [key, value] of Object.entries(this.commonTranslationData)) {
      if (key.toLowerCase().trim() === normalizedText) {
        return { key, translation: value };
      }
    }

    // 部分匹配：检查文本是否包含翻译键
    for (const [key, value] of Object.entries(this.commonTranslationData)) {
      if (text.includes(key)) {
        return { key, translation: value, isPartial: true };
      }
    }

    return null;
  }

  /**
   * 判断元素是否适合作为翻译目标
   */
  isValidTranslationTarget(element) {
    const validTags = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'SPAN', 'A', 'TD', 'TH'];
    const skipTags = ['BUTTON', 'INPUT', 'SELECT', 'TEXTAREA', 'SCRIPT', 'STYLE', 'CODE', 'PRE'];
    
    // 基本检查
    if (!validTags.includes(element.tagName) || skipTags.includes(element.tagName)) {
      return false;
    }
    
    // 跳过已处理的容器
    if (element.classList?.contains('bilingual-container')) {
      return false;
    }
    
    // 确保不是空元素
    if (!element.textContent.trim()) {
      return false;
    }
    
    // 跳过包含复杂内容的元素
    if (element.querySelector('img, video, audio, canvas, svg')) {
      return false;
    }
    
    return true;
  }

  /**
   * 创建通用翻译（直接替换文本，不创建双语容器）
   */
  createCommonBilingualElement(element, originalKey, translationText, isPartial = false) {
    // 统一使用 innerHTML.replace 保留原始 HTML 结构
    element.innerHTML = element.innerHTML.replace(originalKey, translationText);
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
      // 处理通用翻译数据
      const config = { ...window.ImmersiveBilingualConfig };
      if (config.commonTanslationData) {
        config.commonTranslationData = config.commonTanslationData;
        delete config.commonTanslationData; // 删除拼写错误的键名
      }
      
      window.bilingualInstance = new ImmersiveBilingual(config);
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