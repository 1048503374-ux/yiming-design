/* ============================================================
   设计性格测试 · Designer Quiz
   ============================================================ */

(function () {
  'use strict';

  // ==================== 备用数据 ====================
  var FALLBACK_DATA = {
    title: '你是哪种设计师？',
    questions: [
      {
        q: '接到一个新项目，你最先做的是什么？',
        options: [
          { text: '打开 Pinterest/站酷找灵感', type: 'vision' },
          { text: '列需求清单，梳理信息架构', type: 'logic' },
          { text: '跟客户深聊，理解业务背景', type: 'empathy' },
          { text: '直接画草图，先出感觉', type: 'spont' }
        ]
      },
      {
        q: '你最喜欢哪种设计风格？',
        options: [
          { text: '极简主义，少即是多', type: 'logic' },
          { text: '色彩丰富，视觉冲击强', type: 'vision' },
          { text: '温暖治愈，有情感温度', type: 'empathy' },
          { text: '实验性，打破常规', type: 'spont' }
        ]
      },
      {
        q: '工作中你最受不了什么？',
        options: [
          { text: '没有设计规范，随心所欲', type: 'logic' },
          { text: '甲方说「字再大点」', type: 'vision' },
          { text: '需求不明确，反复改', type: 'empathy' },
          { text: '创意被扼杀，只能做模板', type: 'spont' }
        ]
      },
      {
        q: '你的桌面通常是？',
        options: [
          { text: '干净整洁，文件分类清晰', type: 'logic' },
          { text: '色彩斑斓，贴满灵感便签', type: 'vision' },
          { text: '堆满各种参考截图', type: 'empathy' },
          { text: '看似乱但我知道在哪', type: 'spont' }
        ]
      },
      {
        q: '周末你更可能做什么？',
        options: [
          { text: '逛设计展/美术馆', type: 'vision' },
          { text: '研究新工具/新技能', type: 'logic' },
          { text: '约朋友聊天喝茶', type: 'empathy' },
          { text: '做点跟设计无关的事', type: 'spont' }
        ]
      }
    ],
    results: {
      logic: {
        title: '🧠 逻辑架构师',
        desc: '你理性、有条理，擅长把复杂需求梳理成清晰的设计系统。你是团队里的「骨架搭建者」，设计规范、组件库、交互逻辑是你的强项。'
      },
      vision: {
        title: '🎨 视觉魔术师',
        desc: '你对美有天然的敏感度，色彩、排版、细节都逃不过你的眼睛。你是团队里的「颜值担当」，作品总是让人眼前一亮。'
      },
      empathy: {
        title: '🤝 用户代言人',
        desc: '你最在意的永远是「用户怎么想」。你做设计不是为了好看，而是为了好用。你是团队里的「用户之声」，总能站在真实需求的角度思考。'
      },
      spont: {
        title: '⚡ 创意先锋',
        desc: '你讨厌套路和模板，总想尝试新的表达方式。你是团队里的「灵感发动机」，虽然有时候天马行空，但总能带来让人惊喜的想法。'
      }
    }
  };

  // ==================== 状态管理 ====================
  var state = {
    container: null,
    currentIndex: 0,
    scores: { vision: 0, logic: 0, empathy: 0, spont: 0 },
    total: 5,
    isProcessing: false
  };

  // ==================== 获取数据 ====================
  function getData() {
    if (typeof window.SITE_DATA !== 'undefined' && window.SITE_DATA.quiz) {
      return window.SITE_DATA.quiz;
    }
    return FALLBACK_DATA;
  }

  // ==================== 内联样式注入 ====================
  var STYLE_ID = 'designer-quiz-style';

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var css = `
      #designer-quiz-root * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      #designer-quiz-root {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans SC", sans-serif;
        color: #fff;
        width: 100%;
        min-height: 480px;
        position: relative;
        overflow: hidden;
      }
      .dq-container {
        width: 100%;
        max-width: 560px;
        margin: 0 auto;
        padding: 32px 20px;
        position: relative;
      }
      /* ===== 开始界面 ===== */
      .dq-start {
        text-align: center;
        padding: 60px 20px 40px;
      }
      .dq-start-title {
        font-size: 28px;
        font-weight: 700;
        margin-bottom: 16px;
        background: linear-gradient(135deg, #a78bfa, #7c3aed);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      .dq-start-sub {
        font-size: 15px;
        color: rgba(255,255,255,0.6);
        line-height: 1.6;
        margin-bottom: 36px;
      }
      .dq-btn-start {
        display: inline-block;
        padding: 14px 48px;
        border: none;
        border-radius: 12px;
        background: linear-gradient(135deg, #7c3aed, #6d28d9);
        color: #fff;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: transform 0.2s, box-shadow 0.2s;
        box-shadow: 0 4px 20px rgba(124,58,237,0.35);
      }
      .dq-btn-start:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 28px rgba(124,58,237,0.5);
      }
      .dq-btn-start:active {
        transform: translateY(0);
      }
      /* ===== 进度指示器 ===== */
      .dq-progress {
        display: flex;
        justify-content: center;
        gap: 10px;
        margin-bottom: 32px;
      }
      .dq-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: rgba(255,255,255,0.15);
        transition: background 0.3s, transform 0.3s;
      }
      .dq-dot.active {
        background: #7c3aed;
        box-shadow: 0 0 12px rgba(124,58,237,0.5);
        transform: scale(1.2);
      }
      .dq-dot.done {
        background: #22c55e;
      }
      /* ===== 答题界面 ===== */
      .dq-question-area {
        text-align: center;
      }
      .dq-question {
        font-size: 18px;
        font-weight: 600;
        line-height: 1.5;
        margin-bottom: 28px;
        padding: 0 4px;
      }
      .dq-options {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }
      .dq-option {
        position: relative;
        padding: 18px 14px;
        border-radius: 16px;
        background: rgba(255,255,255,0.06);
        border: 1px solid rgba(255,255,255,0.06);
        cursor: pointer;
        text-align: center;
        font-size: 14px;
        line-height: 1.5;
        color: rgba(255,255,255,0.85);
        transition: border-color 0.25s, background 0.25s, transform 0.2s, box-shadow 0.25s;
        user-select: none;
        -webkit-user-select: none;
      }
      .dq-option:hover {
        border-color: rgba(255,255,255,0.25);
        background: rgba(255,255,255,0.09);
      }
      .dq-option.selected {
        border-color: #7c3aed;
        background: rgba(124,58,237,0.15);
        transform: scale(0.96);
        box-shadow: 0 0 20px rgba(124,58,237,0.35);
      }
      .dq-option .dq-option-icon {
        font-size: 24px;
        display: block;
        margin-bottom: 6px;
      }
      /* 淡入动画 */
      .dq-option.fade-in {
        animation: dqSlideUp 0.4s ease-out both;
      }
      .dq-option.fade-in:nth-child(1) { animation-delay: 0.00s; }
      .dq-option.fade-in:nth-child(2) { animation-delay: 0.06s; }
      .dq-option.fade-in:nth-child(3) { animation-delay: 0.12s; }
      .dq-option.fade-in:nth-child(4) { animation-delay: 0.18s; }
      .dq-question.fade-in {
        animation: dqSlideUp 0.4s ease-out both;
      }
      @keyframes dqSlideUp {
        from {
          opacity: 0;
          transform: translateY(24px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      /* ===== 结果界面 ===== */
      .dq-result {
        text-align: center;
        padding: 20px 10px;
      }
      .dq-result-emoji {
        font-size: 64px;
        display: block;
        margin-bottom: 16px;
        animation: dqBounceIn 0.6s ease-out both;
      }
      @keyframes dqBounceIn {
        0% { opacity: 0; transform: scale(0.3); }
        50% { transform: scale(1.15); }
        70% { transform: scale(0.95); }
        100% { opacity: 1; transform: scale(1); }
      }
      .dq-result-title {
        font-size: 28px;
        font-weight: 700;
        margin-bottom: 14px;
      }
      .dq-result-desc {
        font-size: 15px;
        line-height: 1.7;
        color: rgba(255,255,255,0.7);
        max-width: 400px;
        margin: 0 auto 28px;
      }
      .dq-share-text {
        font-size: 13px;
        color: rgba(255,255,255,0.4);
        margin-bottom: 12px;
      }
      .dq-btn-retry {
        display: inline-block;
        padding: 12px 36px;
        border: 1px solid rgba(255,255,255,0.15);
        border-radius: 12px;
        background: rgba(255,255,255,0.06);
        color: #fff;
        font-size: 14px;
        cursor: pointer;
        transition: background 0.25s, border-color 0.25s;
      }
      .dq-btn-retry:hover {
        background: rgba(255,255,255,0.1);
        border-color: rgba(255,255,255,0.3);
      }
    `;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = css;
    document.head.appendChild(style);
  }

  // ==================== DOM 工具 ====================
  function createEl(tag, className, html) {
    var el = document.createElement(tag);
    if (className) el.className = className;
    if (html !== undefined) el.innerHTML = html;
    return el;
  }

  // ==================== 渲染：开始界面 ====================
  function renderStart() {
    var container = state.container;
    container.innerHTML = '';
    var wrapper = createEl('div', 'dq-container');
    var start = createEl('div', 'dq-start');
    var title = createEl('div', 'dq-start-title', getData().title);
    var sub = createEl('div', 'dq-start-sub', '5道题快速测试你的设计师性格类型<br>找到你与生俱来的设计天赋');
    var btn = createEl('button', 'dq-btn-start', '开始测试 →');
    btn.addEventListener('click', function () {
      startQuiz();
    });
    start.appendChild(title);
    start.appendChild(sub);
    start.appendChild(btn);
    wrapper.appendChild(start);
    container.appendChild(wrapper);
  }

  // ==================== 开始答题 ====================
  function startQuiz() {
    state.currentIndex = 0;
    state.scores = { vision: 0, logic: 0, empathy: 0, spont: 0 };
    renderQuestion();
  }

  // ==================== 渲染：题目 ====================
  function renderQuestion() {
    var data = getData();
    var idx = state.currentIndex;
    var qData = data.questions[idx];
    var container = state.container;
    container.innerHTML = '';

    var wrapper = createEl('div', 'dq-container');

    // 进度条
    var progress = createEl('div', 'dq-progress');
    for (var i = 0; i < state.total; i++) {
      var dot = createEl('div', 'dq-dot');
      if (i === idx) dot.classList.add('active');
      else if (i < idx) dot.classList.add('done');
      progress.appendChild(dot);
    }
    wrapper.appendChild(progress);

    // 题目区域
    var qArea = createEl('div', 'dq-question-area');
    var qEl = createEl('div', 'dq-question fade-in', qData.q);
    qArea.appendChild(qEl);

    var optsGrid = createEl('div', 'dq-options');
    var icons = ['🎨', '📐', '💬', '✨'];
    qData.options.forEach(function (opt, oi) {
      var card = createEl('div', 'dq-option fade-in');
      card.innerHTML = '<span class="dq-option-icon">' + icons[oi] + '</span>' + opt.text;
      card.dataset.type = opt.type;
      card.addEventListener('click', function () {
        if (state.isProcessing) return;
        selectOption(card, opt.type);
      });
      optsGrid.appendChild(card);
    });
    qArea.appendChild(optsGrid);
    wrapper.appendChild(qArea);
    container.appendChild(wrapper);
  }

  // ==================== 选择选项 ====================
  function selectOption(el, type) {
    state.isProcessing = true;

    // 选中动画
    el.classList.add('selected');

    // 计分
    state.scores[type]++;

    // 禁用所有点击
    var allOptions = state.container.querySelectorAll('.dq-option');
    for (var i = 0; i < allOptions.length; i++) {
      allOptions[i].style.pointerEvents = 'none';
    }

    // 0.5秒后进入下一题或结果
    setTimeout(function () {
      state.isProcessing = false;
      state.currentIndex++;
      if (state.currentIndex >= state.total) {
        renderResult();
      } else {
        renderQuestion();
      }
    }, 500);
  }

  // ==================== 渲染：结果 ====================
  function renderResult() {
    var data = getData();
    // 找最高分类型
    var maxScore = 0;
    var resultType = 'logic';
    var types = ['vision', 'logic', 'empathy', 'spont'];
    for (var i = 0; i < types.length; i++) {
      var t = types[i];
      if (state.scores[t] > maxScore) {
        maxScore = state.scores[t];
        resultType = t;
      }
    }

    var result = data.results[resultType];
    var container = state.container;
    container.innerHTML = '';

    var wrapper = createEl('div', 'dq-container');

    // 进度条（全部完成）
    var progress = createEl('div', 'dq-progress');
    for (var i = 0; i < state.total; i++) {
      var dot = createEl('div', 'dq-dot done');
      progress.appendChild(dot);
    }
    wrapper.appendChild(progress);

    var resultDiv = createEl('div', 'dq-result');
    // 从 title 中提取 emoji（第一个空格前的部分）
    var titleParts = result.title.split(' ');
    var emoji = titleParts[0] || '🎉';
    var label = titleParts.slice(1).join(' ') || result.title;
    var emojiEl = createEl('div', 'dq-result-emoji', emoji);
    var titleEl = createEl('div', 'dq-result-title', label);
    var descEl = createEl('div', 'dq-result-desc', result.desc);

    var shareText = createEl('div', 'dq-share-text', '我是「' + label + '」，点击测测你是哪种设计师 →');
    var retryBtn = createEl('button', 'dq-btn-retry', '🔄 再测一次');
    retryBtn.addEventListener('click', function () {
      renderStart();
    });

    resultDiv.appendChild(emojiEl);
    resultDiv.appendChild(titleEl);
    resultDiv.appendChild(descEl);
    resultDiv.appendChild(shareText);
    resultDiv.appendChild(retryBtn);
    wrapper.appendChild(resultDiv);
    container.appendChild(wrapper);
  }

  // ==================== 清理 ====================
  function destroy() {
    if (state.container) {
      state.container.innerHTML = '';
    }
    // 移除样式（可选，保留以免闪烁）
    // var style = document.getElementById(STYLE_ID);
    // if (style) style.parentNode.removeChild(style);
  }

  // ==================== 导出接口 ====================
  window.DesignerQuiz = {
    init: function (containerId) {
      var container = document.getElementById(containerId);
      if (!container) {
        console.error('[DesignerQuiz] 未找到容器元素 #' + containerId);
        return;
      }
      state.container = container;
      state.currentIndex = 0;
      state.scores = { vision: 0, logic: 0, empathy: 0, spont: 0 };
      state.isProcessing = false;
      injectStyles();
      renderStart();
    },
    destroy: function () {
      destroy();
    }
  };

})();
