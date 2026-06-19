/**
 * 色感挑战 (Color Sense Challenge)
 * A Canvas-based color discrimination game
 * 
 * 玩法：从4个相似色块中找出与目标完全相同的那一个
 * 难度渐进，共10轮，最终给出色感评分
 */

;(function () {
  'use strict';

  // ============================================================
  // 配置常量
  // ============================================================
  var CONFIG = {
    CANVAS_WIDTH: 500,
    CANVAS_HEIGHT: 400,
    TOTAL_ROUNDS: 10,

    // 目标色块
    TARGET_WIDTH: 200,
    TARGET_HEIGHT: 120,
    TARGET_Y: 30,

    // 选项色块
    OPTION_WIDTH: 120,
    OPTION_HEIGHT: 80,
    OPTION_GAP: 20,
    OPTION_GRID_Y: 180,
    OPTION_COLS: 2,

    // 色块圆角
    CORNER_RADIUS: 12,

    // 高亮颜色
    HIGHLIGHT_COLOR: '#7c3aed',
    CORRECT_COLOR: '#22c55e',
    WRONG_COLOR: '#ef4444',

    // HSL 生成范围
    HUE_MIN: 0,
    HUE_MAX: 360,
    SAT_MIN: 50,
    SAT_MAX: 100,
    LIGHT_MIN: 40,
    LIGHT_MAX: 80,

    // 难度配置 [hueDelta, satDelta, lightDelta]
    DIFFICULTY: [
      { label: 'easy',   hueRange: [25, 50],   satRange: [12, 20],  lightRange: [12, 20] },
      { label: 'medium', hueRange: [12, 25],   satRange: [6, 12],   lightRange: [6, 12] },
      { label: 'hard',   hueRange: [3, 8],     satRange: [2, 5],    lightRange: [2, 5] },
    ],
  };

  // ============================================================
  // 工具函数
  // ============================================================

  /**
   * 在 [min, max] 范围内生成随机整数
   */
  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * 限制值在 [min, max] 范围内
   */
  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  /**
   * 将 HSL 转换为 CSS 颜色字符串
   */
  function hslStr(h, s, l) {
    return 'hsl(' + h + ', ' + s + '%, ' + l + '%)';
  }

  /**
   * 判断两个 HSL 颜色是否完全相同
   */
  function isSameColor(a, b) {
    return a.h === b.h && a.s === b.s && a.l === b.l;
  }

  /**
   * 生成随机目标色
   */
  function randomTargetColor() {
    return {
      h: randInt(CONFIG.HUE_MIN, CONFIG.HUE_MAX),
      s: randInt(CONFIG.SAT_MIN, CONFIG.SAT_MAX),
      l: randInt(CONFIG.LIGHT_MIN, CONFIG.LIGHT_MAX),
    };
  }

  /**
   * 根据难度对目标色做一个随机偏移，生成干扰色
   */
  function makeDistractor(base, difficulty) {
    var dh = randInt(difficulty.hueRange[0], difficulty.hueRange[1]);
    var ds = randInt(difficulty.satRange[0], difficulty.satRange[1]);
    var dl = randInt(difficulty.lightRange[0], difficulty.lightRange[1]);

    // 随机选择正负方向
    if (Math.random() < 0.5) dh = -dh;
    if (Math.random() < 0.5) ds = -ds;
    if (Math.random() < 0.5) dl = -dl;

    return {
      h: (base.h + dh + 360) % 360,
      s: clamp(base.s + ds, CONFIG.SAT_MIN, CONFIG.SAT_MAX),
      l: clamp(base.l + dl, CONFIG.LIGHT_MIN, CONFIG.LIGHT_MAX),
    };
  }

  /**
   * 检测点 (px, py) 是否在矩形区域 (rx, ry, rw, rh) 内
   */
  function hitTest(px, py, rx, ry, rw, rh) {
    return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
  }

  // ============================================================
  // 绘图函数
  // ============================================================

  /**
   * 绘制圆角矩形路径
   */
  function roundedRect(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  /**
   * 绘制一个填充色块
   */
  function drawColorBlock(ctx, x, y, w, h, color, highlight, flashColor, flashAlpha) {
    // 闪烁背景
    if (flashAlpha > 0 && flashColor) {
      ctx.save();
      roundedRect(ctx, x, y, w, h, CONFIG.CORNER_RADIUS);
      ctx.fillStyle = flashColor;
      ctx.globalAlpha = flashAlpha;
      ctx.fill();
      ctx.restore();
    }

    // 色块主体
    ctx.save();
    roundedRect(ctx, x + 2, y + 2, w - 4, h - 4, CONFIG.CORNER_RADIUS - 1);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();

    // 高亮边框
    if (highlight) {
      ctx.save();
      roundedRect(ctx, x, y, w, h, CONFIG.CORNER_RADIUS);
      ctx.strokeStyle = CONFIG.HIGHLIGHT_COLOR;
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();
    }
  }

  /**
   * 绘制文本
   */
  function drawText(ctx, text, x, y, color, size, align, baseline) {
    ctx.save();
    ctx.fillStyle = color || '#ffffff';
    ctx.font = (size || 16) + 'px "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.textAlign = align || 'left';
    ctx.textBaseline = baseline || 'top';
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  /**
   * 绘制游戏结束结果卡片
   */
  function drawResultCard(ctx, state) {
    var cw = CONFIG.CANVAS_WIDTH;
    var ch = CONFIG.CANVAS_HEIGHT;

    // 半透明遮罩
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, cw, ch);
    ctx.restore();

    // 卡片背景
    var cardW = 320;
    var cardH = 280;
    var cardX = (cw - cardW) / 2;
    var cardY = (ch - cardH) / 2;

    ctx.save();
    roundedRect(ctx, cardX, cardY, cardW, cardH, 16);
    ctx.fillStyle = 'rgba(30, 30, 50, 0.95)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(124, 58, 237, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // 标题
    drawText(ctx, '色感挑战完成!', cw / 2, cardY + 30, '#ffffff', 22, 'center', 'top');

    // 分数
    var score = state.score;
    var maxScore = CONFIG.TOTAL_ROUNDS * 10;
    var pct = Math.round((score / maxScore) * 100);
    drawText(ctx, pct + ' 分', cw / 2, cardY + 70, '#fbbf24', 48, 'center', 'top');

    // 评级
    var rating = getRating(pct);
    drawText(ctx, rating.label, cw / 2, cardY + 130, rating.color, 24, 'center', 'top');

    // 统计
    var statsText = '正确: ' + state.correctCount + ' / ' + CONFIG.TOTAL_ROUNDS;
    drawText(ctx, statsText, cw / 2, cardY + 170, '#94a3b8', 15, 'center', 'top');

    // 重玩按钮
    var btnW = 140;
    var btnH = 44;
    var btnX = (cw - btnW) / 2;
    var btnY = cardY + 210;

    ctx.save();
    roundedRect(ctx, btnX, btnY, btnW, btnH, 22);
    ctx.fillStyle = '#7c3aed';
    ctx.fill();
    ctx.restore();

    drawText(ctx, '再来一次', cw / 2, btnY + (btnH / 2), '#ffffff', 16, 'center', 'middle');

    // 保存按钮区域以便点击检测
    state._restartBtn = { x: btnX, y: btnY, w: btnW, h: btnH };
  }

  /**
   * 根据百分比获取评分等级
   */
  function getRating(pct) {
    if (pct >= 90) return { label: '色感大师', color: '#fbbf24' };
    if (pct >= 70) return { label: '色彩达人', color: '#a78bfa' };
    if (pct >= 50) return { label: '正常水平', color: '#34d399' };
    return { label: '需要练习', color: '#94a3b8' };
  }

  // ============================================================
  // 游戏核心逻辑
  // ============================================================

  /**
   * 根据当前轮次获取难度配置
   */
  function getDifficultyForRound(round) {
    if (round <= 3) return CONFIG.DIFFICULTY[0]; // easy
    if (round <= 7) return CONFIG.DIFFICULTY[1]; // medium
    return CONFIG.DIFFICULTY[2]; // hard
  }

  /**
   * 生成一轮的题目
   */
  function generateRound(round) {
    var target = randomTargetColor();
    var difficulty = getDifficultyForRound(round);

    // 正确选项的索引（0-3）
    var correctIndex = randInt(0, 3);

    var options = [];
    for (var i = 0; i < 4; i++) {
      if (i === correctIndex) {
        options.push({ h: target.h, s: target.s, l: target.l });
      } else {
        options.push(makeDistractor(target, difficulty));
      }
    }

    return {
      target: target,
      options: options,
      correctIndex: correctIndex,
      selectedIndex: -1,
      isCorrect: false,
      isAnswered: false,
    };
  }

  /**
   * 计算选项色块的布局位置
   */
  function getOptionRect(index) {
    var col = index % CONFIG.OPTION_COLS;
    var row = Math.floor(index / CONFIG.OPTION_COLS);
    var totalGridW = CONFIG.OPTION_WIDTH * CONFIG.OPTION_COLS + CONFIG.OPTION_GAP * (CONFIG.OPTION_COLS - 1);
    var gridStartX = (CONFIG.CANVAS_WIDTH - totalGridW) / 2;

    return {
      x: gridStartX + col * (CONFIG.OPTION_WIDTH + CONFIG.OPTION_GAP),
      y: CONFIG.OPTION_GRID_Y + row * (CONFIG.OPTION_HEIGHT + CONFIG.OPTION_GAP),
      w: CONFIG.OPTION_WIDTH,
      h: CONFIG.OPTION_HEIGHT,
    };
  }

  // ============================================================
  // 主游戏对象
  // ============================================================

  function ColorChallenge() {
    this.canvas = null;
    this.ctx = null;
    this.animationId = null;
    this.state = null;
    this.boundClick = null;
  }

  ColorChallenge.prototype.init = function (canvasId) {
    try {
      var canvas = document.getElementById(canvasId);
      if (!canvas) {
        throw new Error('找不到 Canvas 元素: #' + canvasId);
      }

      // 自适应尺寸
      var container = canvas.parentElement;
      var maxW = container ? container.clientWidth : window.innerWidth;
      var scale = Math.min(1, (maxW - 20) / CONFIG.CANVAS_WIDTH);

      canvas.width = CONFIG.CANVAS_WIDTH;
      canvas.height = CONFIG.CANVAS_HEIGHT;
      canvas.style.width = Math.round(CONFIG.CANVAS_WIDTH * scale) + 'px';
      canvas.style.height = Math.round(CONFIG.CANVAS_HEIGHT * scale) + 'px';

      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');

      // 绑定点击事件
      this.boundClick = this._handleClick.bind(this);
      canvas.addEventListener('click', this.boundClick);

      // 初始化游戏状态
      this._resetGame();

      // 启动渲染循环
      this._loop();

    } catch (e) {
      console.error('[ColorChallenge] 初始化失败:', e.message);
    }
  };

  ColorChallenge.prototype.destroy = function () {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    if (this.canvas && this.boundClick) {
      this.canvas.removeEventListener('click', this.boundClick);
    }
    this.canvas = null;
    this.ctx = null;
    this.state = null;
  };

  ColorChallenge.prototype._resetGame = function () {
    this.state = {
      round: 1,
      score: 0,
      correctCount: 0,
      currentRound: null,
      gameOver: false,
      flashTimer: 0,
      flashColor: null,
      flashAlpha: 0,
      highlightedIndex: -1,
      _restartBtn: null,
      isTransitioning: false,
    };
    this.state.currentRound = generateRound(1);
  };

  ColorChallenge.prototype._loop = function () {
    if (!this._paused) {
      this._update();
      this._render();
    }
    this.animationId = requestAnimationFrame(this._loop.bind(this));
  };

  ColorChallenge.prototype._update = function () {
    var s = this.state;
    if (s.flashTimer > 0) {
      s.flashTimer -= 16; // ~60fps
      s.flashAlpha = Math.min(1, s.flashTimer / 300);
      if (s.flashTimer <= 0) {
        s.flashTimer = 0;
        s.flashAlpha = 0;
        s.flashColor = null;

        // 闪烁结束后，如果是正确答案且不是最后一轮，进入过渡
        if (s.currentRound && s.currentRound.isCorrect && !s.gameOver) {
          s.isTransitioning = true;
          // 短暂延迟后进入下一轮
          var self = this;
          setTimeout(function () {
            s.isTransitioning = false;
            self._nextRound();
          }, 400);
        } else if (s.currentRound && s.currentRound.isCorrect && s.gameOver) {
          // 最后一轮正确后显示结果
          s._restartBtn = null;
        }
      }
    }
  };

  ColorChallenge.prototype._render = function () {
    var ctx = this.ctx;
    var s = this.state;
    var cw = CONFIG.CANVAS_WIDTH;
    var ch = CONFIG.CANVAS_HEIGHT;

    if (!ctx) return;

    // 清空画布（透明背景）
    ctx.clearRect(0, 0, cw, ch);

    if (s.gameOver) {
      drawResultCard(ctx, s);
      return;
    }

    var roundData = s.currentRound;
    if (!roundData) return;

    // ---- 绘制左上角轮次 ----
    var roundText = '第 ' + s.round + ' / ' + CONFIG.TOTAL_ROUNDS + ' 轮';
    drawText(ctx, roundText, 12, 8, '#94a3b8', 14);

    // ---- 绘制右上角分数 ----
    drawText(ctx, '分数: ' + s.score, cw - 12, 8, '#ffffff', 14, 'right');

    // ---- 绘制难度标记 ----
    var diff = getDifficultyForRound(s.round);
    var diffLabel = diff.label === 'easy' ? '简单' : diff.label === 'medium' ? '中等' : '困难';
    var diffColor = diff.label === 'easy' ? '#34d399' : diff.label === 'medium' ? '#fbbf24' : '#ef4444';
    drawText(ctx, diffLabel, cw / 2, 8, diffColor, 12, 'center');

    // ---- 绘制目标色块 ----
    var tx = (cw - CONFIG.TARGET_WIDTH) / 2;
    var ty = CONFIG.TARGET_Y;

    // 目标色块标签
    drawText(ctx, '找出完全相同的颜色', cw / 2, ty - 18, '#cbd5e1', 12, 'center');

    drawColorBlock(ctx, tx, ty, CONFIG.TARGET_WIDTH, CONFIG.TARGET_HEIGHT,
      hslStr(roundData.target.h, roundData.target.s, roundData.target.l));

    // ---- 绘制选项色块 ----
    for (var i = 0; i < 4; i++) {
      var rect = getOptionRect(i);
      var color = roundData.options[i];
      var isHighlighted = s.highlightedIndex === i && !roundData.isAnswered;
      var flashColor = null;
      var flashAlpha = 0;

      // 已作答时显示闪烁效果
      if (roundData.isAnswered && s.flashAlpha > 0) {
        if (i === roundData.correctIndex) {
          flashColor = CONFIG.CORRECT_COLOR;
          flashAlpha = s.flashAlpha;
        } else if (i === roundData.selectedIndex && !roundData.isCorrect) {
          flashColor = CONFIG.WRONG_COLOR;
          flashAlpha = s.flashAlpha;
        }
      }

      drawColorBlock(ctx, rect.x, rect.y, rect.w, rect.h,
        hslStr(color.h, color.s, color.l),
        isHighlighted, flashColor, flashAlpha);

      // 已作答时在正确选项上打勾
      if (roundData.isAnswered && i === roundData.correctIndex) {
        ctx.save();
        ctx.fillStyle = '#22c55e';
        ctx.font = 'bold 20px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('✓', rect.x + rect.w / 2, rect.y + rect.h / 2);
        ctx.restore();
      }
    }
  };

  ColorChallenge.prototype._handleClick = function (e) {
    var s = this.state;
    if (!s || s.gameOver) {
      // 点击重玩按钮
      if (s && s._restartBtn) {
        var rect = this.canvas.getBoundingClientRect();
        var scaleX = this.canvas.width / rect.width;
        var scaleY = this.canvas.height / rect.height;
        var mx = (e.clientX - rect.left) * scaleX;
        var my = (e.clientY - rect.top) * scaleY;
        var btn = s._restartBtn;
        if (hitTest(mx, my, btn.x, btn.y, btn.w, btn.h)) {
          this._resetGame();
        }
      }
      return;
    }

    if (s.isTransitioning) return;

    var roundData = s.currentRound;
    if (!roundData || roundData.isAnswered) return;

    // 计算点击位置
    var rect = this.canvas.getBoundingClientRect();
    var scaleX = this.canvas.width / rect.width;
    var scaleY = this.canvas.height / rect.height;
    var mx = (e.clientX - rect.left) * scaleX;
    var my = (e.clientY - rect.top) * scaleY;

    // 检测点击了哪个选项
    for (var i = 0; i < 4; i++) {
      var optRect = getOptionRect(i);
      if (hitTest(mx, my, optRect.x, optRect.y, optRect.w, optRect.h)) {
        roundData.selectedIndex = i;
        roundData.isCorrect = (i === roundData.correctIndex);
        roundData.isAnswered = true;

        // 更新分数
        if (roundData.isCorrect) {
          s.score += 10;
          s.correctCount++;
        } else {
          s.score = Math.max(0, s.score - 5);
        }

        // 触发闪烁动画
        s.flashTimer = 500;
        s.flashColor = roundData.isCorrect ? CONFIG.CORRECT_COLOR : CONFIG.WRONG_COLOR;
        s.flashAlpha = 1;

        // 如果是最后一轮，标记游戏结束
        if (s.round >= CONFIG.TOTAL_ROUNDS) {
          s.gameOver = true;
        }

        break;
      }
    }
  };

  ColorChallenge.prototype._nextRound = function () {
    var s = this.state;
    s.round++;

    if (s.round > CONFIG.TOTAL_ROUNDS) {
      s.gameOver = true;
      return;
    }

    s.currentRound = generateRound(s.round);
    s.highlightedIndex = -1;
    s.flashTimer = 0;
    s.flashAlpha = 0;
    s.flashColor = null;
  };

  // ============================================================
  // 暴露全局接口
  // ============================================================

  var instance = null;

  window.ColorChallenge = {
    init: function (canvasId) {
      // 清理旧实例
      if (instance) {
        instance.destroy();
      }
      instance = new ColorChallenge();
      instance.init(canvasId);
      // Store instance reference for external pause control
      window.ColorChallenge._instance = instance;
    },
    destroy: function () {
      if (instance) {
        instance.destroy();
        instance = null;
        window.ColorChallenge._instance = null;
      }
    },
  };

})();
