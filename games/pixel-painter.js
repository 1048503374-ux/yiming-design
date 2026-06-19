window.PixelPainter = (function () {
  'use strict';

  // =========================== CONSTANTS ===========================

  var GRID_SIZE = 16;
  var CELL_SIZE = 22;
  var GAP = 2;
  var CANVAS_SIZE = 400;
  var OFFSET = Math.floor((CANVAS_SIZE - GRID_SIZE * CELL_SIZE - (GRID_SIZE - 1) * GAP) / 2);
  var DEFAULT_COLOR = '#333333';

  var COLORS = [
    { label: '黑色', value: '#1a1a1a' },
    { label: '白色', value: '#f0f0f0' },
    { label: '红色', value: '#ef4444' },
    { label: '橙色', value: '#f59e0b' },
    { label: '黄色', value: '#fbbf24' },
    { label: '绿色', value: '#22c55e' },
    { label: '青色', value: '#06b6d4' },
    { label: '蓝色', value: '#3b82f6' },
    { label: '紫色', value: '#7c3aed' },
    { label: '粉色', value: '#ec4899' },
    { label: '棕色', value: '#92400e' },
    { label: '灰色', value: '#888888' },
  ];

  // 预设图案 "像素一鸣"
  // 0 = 默认灰色, 1 = 紫色(#7c3aed), 2 = 蓝色(#3b82f6), 3 = 深灰(#666666)
  var PRESET = [
    [0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0],
    [0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0],
    [0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 2, 2, 3, 3, 3, 3, 2, 2, 0, 0, 0, 0],
    [0, 0, 0, 2, 2, 3, 3, 3, 3, 3, 3, 2, 2, 0, 0, 0],
    [0, 0, 0, 0, 0, 3, 3, 0, 0, 3, 3, 0, 0, 0, 0, 0],
  ];

  var COLOR_MAP = [
    DEFAULT_COLOR,
    '#7c3aed',
    '#3b82f6',
    '#666666',
  ];

  // =========================== STATE ===========================

  var state = {
    grid: [],
    selectedColorIndex: 7, // default to blue
    isMouseDown: false,
    isErasing: false,
    lastPaintedRow: -1,
    lastPaintedCol: -1,
  };

  var dom = {};

  // =========================== PRIVATE METHODS ===========================

  function createGrid() {
    var grid = [];
    for (var r = 0; r < GRID_SIZE; r++) {
      grid[r] = [];
      for (var c = 0; c < GRID_SIZE; c++) {
        grid[r][c] = 0;
      }
    }
    return grid;
  }

  function drawGrid() {
    var ctx = dom.ctx;
    var w = dom.canvas.width;
    var h = dom.canvas.height;

    // Clear
    ctx.clearRect(0, 0, w, h);

    // Background
    ctx.fillStyle = '#1e1e1e';
    ctx.fillRect(0, 0, w, h);

    // Draw cells
    for (var r = 0; r < GRID_SIZE; r++) {
      for (var c = 0; c < GRID_SIZE; c++) {
        var x = OFFSET + c * (CELL_SIZE + GAP);
        var y = OFFSET + r * (CELL_SIZE + GAP);
        var colorIndex = state.grid[r][c];
        var color = COLOR_MAP[colorIndex] || DEFAULT_COLOR;

        ctx.fillStyle = color;
        ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);

        // Subtle border for non-empty cells to add depth
        if (colorIndex !== 0) {
          ctx.fillStyle = 'rgba(255,255,255,0.06)';
          ctx.fillRect(x, y, CELL_SIZE, 1);
          ctx.fillRect(x, y, 1, CELL_SIZE);
          ctx.fillStyle = 'rgba(0,0,0,0.15)';
          ctx.fillRect(x, y + CELL_SIZE - 1, CELL_SIZE, 1);
          ctx.fillRect(x + CELL_SIZE - 1, y, 1, CELL_SIZE);
        }
      }
    }

    // Draw grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    for (var i = 0; i <= GRID_SIZE; i++) {
      var pos = OFFSET + i * (CELL_SIZE + GAP) - (i === 0 || i === GRID_SIZE ? 0 : 0);
      // Vertical
      ctx.beginPath();
      ctx.moveTo(OFFSET + i * (CELL_SIZE + GAP) - GAP / 2, OFFSET - GAP / 2);
      ctx.lineTo(OFFSET + i * (CELL_SIZE + GAP) - GAP / 2, OFFSET + GRID_SIZE * (CELL_SIZE + GAP) - GAP / 2);
      ctx.stroke();
      // Horizontal
      ctx.beginPath();
      ctx.moveTo(OFFSET - GAP / 2, OFFSET + i * (CELL_SIZE + GAP) - GAP / 2);
      ctx.lineTo(OFFSET + GRID_SIZE * (CELL_SIZE + GAP) - GAP / 2, OFFSET + i * (CELL_SIZE + GAP) - GAP / 2);
      ctx.stroke();
    }
  }

  function getCellFromPos(clientX, clientY) {
    var rect = dom.canvas.getBoundingClientRect();
    var scaleX = dom.canvas.width / rect.width;
    var scaleY = dom.canvas.height / rect.height;
    var x = (clientX - rect.left) * scaleX;
    var y = (clientY - rect.top) * scaleY;

    var col = Math.floor((x - OFFSET) / (CELL_SIZE + GAP));
    var row = Math.floor((y - OFFSET) / (CELL_SIZE + GAP));

    if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) {
      return null;
    }

    // Check if within actual cell area (not in gap)
    var cellX = OFFSET + col * (CELL_SIZE + GAP);
    var cellY = OFFSET + row * (CELL_SIZE + GAP);
    if (x < cellX || x > cellX + CELL_SIZE || y < cellY || y > cellY + CELL_SIZE) {
      return null;
    }

    return { row: row, col: col };
  }

  function paintCell(row, col) {
    if (state.isErasing) {
      state.grid[row][col] = 0;
    } else {
      state.grid[row][col] = state.selectedColorIndex;
    }
    drawGrid();
  }

  function handlePointerDown(clientX, clientY, button) {
    var cell = getCellFromPos(clientX, clientY);
    if (!cell) return;

    state.isMouseDown = true;
    state.isErasing = (button === 2); // right click
    state.lastPaintedRow = cell.row;
    state.lastPaintedCol = cell.col;
    paintCell(cell.row, cell.col);
  }

  function handlePointerMove(clientX, clientY) {
    if (!state.isMouseDown) return;

    var cell = getCellFromPos(clientX, clientY);
    if (!cell) return;

    // Avoid repainting same cell
    if (cell.row === state.lastPaintedRow && cell.col === state.lastPaintedCol) return;

    state.lastPaintedRow = cell.row;
    state.lastPaintedCol = cell.col;
    paintCell(cell.row, cell.col);
  }

  function handlePointerUp() {
    state.isMouseDown = false;
    state.lastPaintedRow = -1;
    state.lastPaintedCol = -1;
  }

  function loadPreset() {
    state.grid = createGrid();
    for (var r = 0; r < GRID_SIZE; r++) {
      for (var c = 0; c < GRID_SIZE; c++) {
        state.grid[r][c] = PRESET[r][c];
      }
    }
    drawGrid();
  }

  function clearAll() {
    state.grid = createGrid();
    drawGrid();
  }

  function saveImage() {
    // Create a clean canvas without grid lines for save
    var saveCanvas = document.createElement('canvas');
    saveCanvas.width = CANVAS_SIZE;
    saveCanvas.height = CANVAS_SIZE;
    var saveCtx = saveCanvas.getContext('2d');

    // Background
    saveCtx.fillStyle = '#1e1e1e';
    saveCtx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw cells
    for (var r = 0; r < GRID_SIZE; r++) {
      for (var c = 0; c < GRID_SIZE; c++) {
        var x = OFFSET + c * (CELL_SIZE + GAP);
        var y = OFFSET + r * (CELL_SIZE + GAP);
        var colorIndex = state.grid[r][c];
        var color = COLOR_MAP[colorIndex] || DEFAULT_COLOR;
        saveCtx.fillStyle = color;
        saveCtx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
      }
    }

    var link = document.createElement('a');
    link.download = 'pixel-art-' + Date.now() + '.png';
    link.href = saveCanvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function selectColor(index) {
    state.selectedColorIndex = index;

    // Update UI - color swatches
    var swatches = dom.palette.querySelectorAll('.pp-color-swatch');
    swatches.forEach(function (el, i) {
      if (i === index) {
        el.classList.add('pp-selected');
      } else {
        el.classList.remove('pp-selected');
      }
    });

    // Update current color display
    if (dom.currentColorBox) {
      var colorValue = COLORS[index] ? COLORS[index].value : COLOR_MAP[index] || DEFAULT_COLOR;
      dom.currentColorBox.style.backgroundColor = colorValue;
    }
  }

  function handleCustomColorChange(e) {
    var hex = e.target.value;
    // Find if this hex already exists in COLORS
    for (var i = 0; i < COLORS.length; i++) {
      if (COLORS[i].value === hex) {
        selectColor(i);
        return;
      }
    }

    // Add a temporary color index at position 12 (or replace)
    // We'll use index -1 to represent custom color
    // Map it by modifying COLOR_MAP temporarily
    COLOR_MAP[COLORS.length] = hex; // index 12
    state.selectedColorIndex = COLORS.length; // index 12

    // Update swatch visual - clear all selection
    var swatches = dom.palette.querySelectorAll('.pp-color-swatch');
    swatches.forEach(function (el) {
      el.classList.remove('pp-selected');
    });

    // Update current color display
    if (dom.currentColorBox) {
      dom.currentColorBox.style.backgroundColor = hex;
    }
  }

  // =========================== DOM CREATION ===========================

  function createDOM(containerId) {
    var container = document.getElementById(containerId);
    if (!container) {
      container = document.body;
    }

    // Main wrapper
    var wrapper = document.createElement('div');
    wrapper.className = 'pp-wrapper';

    // --- Styles ---
    var style = document.createElement('style');
    style.textContent = getStyles();
    document.head.appendChild(style);
    dom.styleEl = style;

    // --- Top area: canvas + palette ---
    var topRow = document.createElement('div');
    topRow.className = 'pp-top-row';

    // Canvas container
    var canvasContainer = document.createElement('div');
    canvasContainer.className = 'pp-canvas-container';

    var canvas = document.createElement('canvas');
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;
    canvas.className = 'pp-canvas';
    canvasContainer.appendChild(canvas);
    topRow.appendChild(canvasContainer);
    dom.canvas = canvas;
    dom.ctx = canvas.getContext('2d');

    // --- Right: Color palette ---
    var palette = document.createElement('div');
    palette.className = 'pp-palette';
    dom.palette = palette;

    var paletteTitle = document.createElement('div');
    paletteTitle.className = 'pp-palette-title';
    paletteTitle.textContent = '颜色面板';
    palette.appendChild(paletteTitle);

    var colorGrid = document.createElement('div');
    colorGrid.className = 'pp-color-grid';

    COLORS.forEach(function (c, i) {
      var swatch = document.createElement('div');
      swatch.className = 'pp-color-swatch' + (i === state.selectedColorIndex ? ' pp-selected' : '');
      swatch.style.backgroundColor = c.value;
      swatch.title = c.label + ' (' + c.value + ')';
      swatch.dataset.index = i;

      swatch.addEventListener('click', function (e) {
        e.stopPropagation();
        selectColor(i);
      });

      colorGrid.appendChild(swatch);
    });

    palette.appendChild(colorGrid);

    // Custom color
    var customRow = document.createElement('div');
    customRow.className = 'pp-custom-color-row';

    var customLabel = document.createElement('span');
    customLabel.className = 'pp-custom-label';
    customLabel.textContent = '自定义';
    customRow.appendChild(customLabel);

    var customInput = document.createElement('input');
    customInput.type = 'color';
    customInput.className = 'pp-custom-input';
    customInput.value = '#3b82f6';
    customInput.addEventListener('input', handleCustomColorChange);
    customRow.appendChild(customInput);

    palette.appendChild(customRow);

    // Current color display
    var currentRow = document.createElement('div');
    currentRow.className = 'pp-current-row';
    currentRow.innerHTML = '当前颜色';
    var currentColorBox = document.createElement('div');
    currentColorBox.className = 'pp-current-color';
    currentColorBox.style.backgroundColor = COLORS[state.selectedColorIndex].value;
    currentRow.appendChild(currentColorBox);
    palette.appendChild(currentRow);
    dom.currentColorBox = currentColorBox;

    topRow.appendChild(palette);

    // --- Bottom: Toolbar ---
    var toolbar = document.createElement('div');
    toolbar.className = 'pp-toolbar';

    var clearBtn = document.createElement('button');
    clearBtn.className = 'pp-btn pp-btn-clear';
    clearBtn.textContent = '清空画板';
    clearBtn.addEventListener('click', clearAll);
    toolbar.appendChild(clearBtn);

    var saveBtn = document.createElement('button');
    saveBtn.className = 'pp-btn pp-btn-save';
    saveBtn.textContent = '截图保存';
    saveBtn.addEventListener('click', saveImage);
    toolbar.appendChild(saveBtn);

    var presetBtn = document.createElement('button');
    presetBtn.className = 'pp-btn pp-btn-preset';
    presetBtn.textContent = '加载示例';
    presetBtn.addEventListener('click', loadPreset);
    toolbar.appendChild(presetBtn);

    // Assemble
    wrapper.appendChild(topRow);
    wrapper.appendChild(toolbar);
    container.appendChild(wrapper);
    dom.wrapper = wrapper;

    return wrapper;
  }

  // =========================== STYLES ===========================

  function getStyles() {
    return [
      '.pp-wrapper {',
      '  display: inline-flex;',
      '  flex-direction: column;',
      '  background: #1a1a2e;',
      '  border-radius: 12px;',
      '  padding: 20px;',
      '  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;',
      '  user-select: none;',
      '}',
      '.pp-top-row {',
      '  display: flex;',
      '  gap: 20px;',
      '  align-items: flex-start;',
      '}',
      '.pp-canvas-container {',
      '  flex-shrink: 0;',
      '}',
      '.pp-canvas {',
      '  width: 400px;',
      '  height: 400px;',
      '  border-radius: 8px;',
      '  cursor: crosshair;',
      '  display: block;',
      '}',
      '.pp-palette {',
      '  display: flex;',
      '  flex-direction: column;',
      '  gap: 12px;',
      '  min-width: 140px;',
      '}',
      '.pp-palette-title {',
      '  color: #e0e0e0;',
      '  font-size: 13px;',
      '  font-weight: 600;',
      '  letter-spacing: 0.5px;',
      '  text-transform: uppercase;',
      '}',
      '.pp-color-grid {',
      '  display: grid;',
      '  grid-template-columns: repeat(3, 36px);',
      '  gap: 6px;',
      '}',
      '.pp-color-swatch {',
      '  width: 36px;',
      '  height: 36px;',
      '  border-radius: 6px;',
      '  cursor: pointer;',
      '  border: 2px solid transparent;',
      '  transition: border-color 0.15s, transform 0.1s;',
      '  box-sizing: border-box;',
      '}',
      '.pp-color-swatch:hover {',
      '  transform: scale(1.1);',
      '  border-color: rgba(255,255,255,0.3);',
      '}',
      '.pp-color-swatch.pp-selected {',
      '  border-color: #ffffff;',
      '  box-shadow: 0 0 8px rgba(255,255,255,0.4);',
      '  transform: scale(1.1);',
      '}',
      '.pp-custom-color-row {',
      '  display: flex;',
      '  align-items: center;',
      '  gap: 8px;',
      '}',
      '.pp-custom-label {',
      '  color: #aaa;',
      '  font-size: 12px;',
      '}',
      '.pp-custom-input {',
      '  width: 36px;',
      '  height: 36px;',
      '  border: none;',
      '  border-radius: 6px;',
      '  cursor: pointer;',
      '  padding: 0;',
      '  background: transparent;',
      '}',
      '.pp-custom-input::-webkit-color-swatch-wrapper {',
      '  padding: 0;',
      '}',
      '.pp-custom-input::-webkit-color-swatch {',
      '  border: 2px solid rgba(255,255,255,0.2);',
      '  border-radius: 6px;',
      '}',
      '.pp-current-row {',
      '  display: flex;',
      '  align-items: center;',
      '  gap: 8px;',
      '  color: #aaa;',
      '  font-size: 12px;',
      '}',
      '.pp-current-color {',
      '  width: 24px;',
      '  height: 24px;',
      '  border-radius: 4px;',
      '  border: 1px solid rgba(255,255,255,0.2);',
      '}',
      '.pp-toolbar {',
      '  display: flex;',
      '  gap: 10px;',
      '  margin-top: 16px;',
      '}',
      '.pp-btn {',
      '  padding: 8px 18px;',
      '  border: none;',
      '  border-radius: 6px;',
      '  font-size: 13px;',
      '  font-weight: 500;',
      '  cursor: pointer;',
      '  transition: background 0.15s, transform 0.1s;',
      '}',
      '.pp-btn:hover {',
      '  transform: translateY(-1px);',
      '}',
      '.pp-btn:active {',
      '  transform: translateY(0);',
      '}',
      '.pp-btn-clear {',
      '  background: #ef4444;',
      '  color: #fff;',
      '}',
      '.pp-btn-clear:hover {',
      '  background: #dc2626;',
      '}',
      '.pp-btn-save {',
      '  background: #22c55e;',
      '  color: #fff;',
      '}',
      '.pp-btn-save:hover {',
      '  background: #16a34a;',
      '}',
      '.pp-btn-preset {',
      '  background: #3b82f6;',
      '  color: #fff;',
      '}',
      '.pp-btn-preset:hover {',
      '  background: #2563eb;',
      '}',
    ].join('\n');
  }

  // =========================== EVENT BINDING ===========================

  var handlers = {};

  function bindEvents() {
    var canvas = dom.canvas;

    handlers.onMouseDown = function (e) {
      e.preventDefault();
      handlePointerDown(e.clientX, e.clientY, e.button);
    };

    handlers.onMouseMove = function (e) {
      e.preventDefault();
      handlePointerMove(e.clientX, e.clientY);
    };

    handlers.onMouseUp = function () {
      if (state.isMouseDown) {
        handlePointerUp();
      }
    };

    handlers.onContextMenu = function (e) {
      e.preventDefault();
    };

    handlers.onTouchStart = function (e) {
      e.preventDefault();
      var touch = e.touches[0];
      handlePointerDown(touch.clientX, touch.clientY, 0);
    };

    handlers.onTouchMove = function (e) {
      e.preventDefault();
      var touch = e.touches[0];
      handlePointerMove(touch.clientX, touch.clientY);
    };

    handlers.onTouchEnd = function (e) {
      e.preventDefault();
      handlePointerUp();
    };

    // Mouse events
    canvas.addEventListener('mousedown', handlers.onMouseDown);
    canvas.addEventListener('mousemove', handlers.onMouseMove);
    document.addEventListener('mouseup', handlers.onMouseUp);
    canvas.addEventListener('contextmenu', handlers.onContextMenu);

    // Touch events for mobile
    canvas.addEventListener('touchstart', handlers.onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handlers.onTouchMove, { passive: false });
    canvas.addEventListener('touchend', handlers.onTouchEnd, { passive: false });
  }

  function unbindEvents() {
    var canvas = dom.canvas;
    if (!canvas) return;

    canvas.removeEventListener('mousedown', handlers.onMouseDown);
    canvas.removeEventListener('mousemove', handlers.onMouseMove);
    document.removeEventListener('mouseup', handlers.onMouseUp);
    canvas.removeEventListener('contextmenu', handlers.onContextMenu);
    canvas.removeEventListener('touchstart', handlers.onTouchStart);
    canvas.removeEventListener('touchmove', handlers.onTouchMove);
    canvas.removeEventListener('touchend', handlers.onTouchEnd);

    handlers = {};
  }

  // =========================== PUBLIC API ===========================

  return {
    /**
     * 初始化像素画板
     * @param {string} containerId - 容器元素的 ID
     */
    init: function (containerId) {
      if (dom.wrapper) {
        this.destroy();
      }

      state.grid = createGrid();
      state.selectedColorIndex = 7;
      state.isMouseDown = false;
      state.isErasing = false;
      state.lastPaintedRow = -1;
      state.lastPaintedCol = -1;

      createDOM(containerId);
      bindEvents();
      loadPreset();
    },

    /**
     * 清理画板，移除 DOM 元素和事件监听
     */
    destroy: function () {
      unbindEvents();
      if (dom.wrapper && dom.wrapper.parentNode) {
        dom.wrapper.parentNode.removeChild(dom.wrapper);
      }
      if (dom.styleEl && dom.styleEl.parentNode) {
        dom.styleEl.parentNode.removeChild(dom.styleEl);
      }
      dom = {};
      state.grid = [];
    },
  };
})();
