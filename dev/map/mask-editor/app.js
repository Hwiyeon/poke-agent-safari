(async function () {
  'use strict';

  const saveBtn = document.getElementById('saveBtn');
  const reloadBtn = document.getElementById('reloadBtn');
  const undoBtn = document.getElementById('undoBtn');
  const redoBtn = document.getElementById('redoBtn');
  const brushSizeEl = document.getElementById('brushSize');
  const brushSizeValueEl = document.getElementById('brushSizeValue');
  const overlayOpacityEl = document.getElementById('overlayOpacity');
  const overlayOpacityValueEl = document.getElementById('overlayOpacityValue');
  const showReferenceOverlayEl = document.getElementById('showReferenceOverlay');
  const statusTextEl = document.getElementById('statusText');
  const cursorTextEl = document.getElementById('cursorText');
  const paletteEl = document.getElementById('palette');
  const editorCanvas = document.getElementById('editorCanvas');
  const referenceCanvas = document.getElementById('referenceCanvas');
  const vizPreviewEl = document.getElementById('vizPreview');

  const editorCtx = editorCanvas.getContext('2d');
  const referenceCtx = referenceCanvas.getContext('2d');
  editorCtx.imageSmoothingEnabled = false;
  referenceCtx.imageSmoothingEnabled = false;

  const maskCanvas = document.createElement('canvas');
  const maskCtx = maskCanvas.getContext('2d');
  maskCtx.imageSmoothingEnabled = false;

  const compositeCanvas = document.createElement('canvas');
  const compositeCtx = compositeCanvas.getContext('2d');
  compositeCtx.imageSmoothingEnabled = false;

  const state = {
    config: null,
    selectedAreaId: null,
    brushSize: Number(brushSizeEl.value),
    overlayOpacity: Number(overlayOpacityEl.value) / 100,
    pointerDown: false,
    lastPoint: null,
    undoStack: [],
    redoStack: [],
    backgroundImage: null,
    referenceImage: null,
    referenceOverlay: null,
    maskImageData: null,
    areaByColor: new Map(),
    areaList: [],
  };

  function setStatus(message, isError) {
    statusTextEl.textContent = message;
    statusTextEl.classList.toggle('error', !!isError);
  }

  function areaKey(r, g, b, a) {
    return [r, g, b, a].join(',');
  }

  function buildPalette(areaDefs) {
    paletteEl.innerHTML = '';
    const areaList = areaDefs.slice();
    areaList.unshift({
      id: 'none',
      label: 'Transparent / Off-map',
      color: '#000000',
      alpha: 0,
    });

    state.areaList = areaList;

    for (let i = 0; i < areaList.length; i++) {
      const area = areaList[i];
      const button = document.createElement('button');
      button.className = 'swatch';
      button.type = 'button';
      button.dataset.areaId = area.id;
      button.innerHTML =
        '<span class="swatch-chip"></span>' +
        '<span>' + area.label + '</span>';
      const chip = button.querySelector('.swatch-chip');
      if (area.id === 'none') {
        chip.style.background =
          'linear-gradient(135deg, rgba(255,255,255,0) 0 48%, rgba(255,120,120,0.9) 48% 52%, rgba(255,255,255,0) 52% 100%)';
      } else {
        chip.style.background = area.color;
      }
      button.addEventListener('click', function () {
        selectArea(area.id);
      });
      paletteEl.appendChild(button);
    }
  }

  function selectArea(areaId) {
    state.selectedAreaId = areaId;
    const buttons = paletteEl.querySelectorAll('.swatch');
    for (let i = 0; i < buttons.length; i++) {
      buttons[i].classList.toggle('active', buttons[i].dataset.areaId === areaId);
    }
  }

  function pushUndoSnapshot() {
    if (!state.maskImageData) return;
    state.undoStack.push(new Uint8ClampedArray(state.maskImageData.data));
    if (state.undoStack.length > 40) state.undoStack.shift();
    state.redoStack.length = 0;
    syncHistoryButtons();
  }

  function syncHistoryButtons() {
    undoBtn.disabled = state.undoStack.length === 0;
    redoBtn.disabled = state.redoStack.length === 0;
  }

  function restoreMask(bytes) {
    state.maskImageData.data.set(bytes);
    render();
    syncHistoryButtons();
  }

  function undo() {
    if (state.undoStack.length === 0 || !state.maskImageData) return;
    state.redoStack.push(new Uint8ClampedArray(state.maskImageData.data));
    const snapshot = state.undoStack.pop();
    restoreMask(snapshot);
  }

  function redo() {
    if (state.redoStack.length === 0 || !state.maskImageData) return;
    state.undoStack.push(new Uint8ClampedArray(state.maskImageData.data));
    const snapshot = state.redoStack.pop();
    restoreMask(snapshot);
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function getCanvasPoint(event) {
    const rect = editorCanvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) * state.config.width / rect.width);
    const y = Math.floor((event.clientY - rect.top) * state.config.height / rect.height);
    return {
      x: clamp(x, 0, state.config.width - 1),
      y: clamp(y, 0, state.config.height - 1),
    };
  }

  function getAreaById(areaId) {
    for (let i = 0; i < state.areaList.length; i++) {
      if (state.areaList[i].id === areaId) return state.areaList[i];
    }
    return null;
  }

  function colorAt(x, y) {
    const idx = (y * state.config.width + x) * 4;
    const data = state.maskImageData.data;
    return {
      r: data[idx],
      g: data[idx + 1],
      b: data[idx + 2],
      a: data[idx + 3],
    };
  }

  function pickAreaAt(x, y) {
    const color = colorAt(x, y);
    const found = state.areaByColor.get(areaKey(color.r, color.g, color.b, color.a));
    if (found) return found;
    return getAreaById('none');
  }

  function stampBrush(x, y) {
    const area = getAreaById(state.selectedAreaId);
    if (!area || !state.maskImageData) return;
    const radius = state.brushSize;
    const data = state.maskImageData.data;
    const alpha = area.id === 'none' ? 0 : 255;
    let color = [0, 0, 0];
    if (area.id !== 'none') {
      const raw = area.color.replace('#', '');
      color = [
        parseInt(raw.slice(0, 2), 16),
        parseInt(raw.slice(2, 4), 16),
        parseInt(raw.slice(4, 6), 16),
      ];
    }

    for (let py = -radius; py <= radius; py++) {
      for (let px = -radius; px <= radius; px++) {
        if (px * px + py * py > radius * radius) continue;
        const tx = x + px;
        const ty = y + py;
        if (tx < 0 || tx >= state.config.width || ty < 0 || ty >= state.config.height) continue;
        const idx = (ty * state.config.width + tx) * 4;
        data[idx] = color[0];
        data[idx + 1] = color[1];
        data[idx + 2] = color[2];
        data[idx + 3] = alpha;
      }
    }
  }

  function paintStroke(from, to) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const steps = Math.max(Math.abs(dx), Math.abs(dy), 1);
    for (let i = 0; i <= steps; i++) {
      const x = Math.round(from.x + dx * (i / steps));
      const y = Math.round(from.y + dy * (i / steps));
      stampBrush(x, y);
    }
  }

  function renderReference() {
    referenceCtx.clearRect(0, 0, referenceCanvas.width, referenceCanvas.height);
    referenceCtx.drawImage(state.referenceImage, 0, 0, referenceCanvas.width, referenceCanvas.height);
  }

  function render() {
    if (!state.maskImageData) return;
    maskCtx.putImageData(state.maskImageData, 0, 0);

    compositeCtx.clearRect(0, 0, compositeCanvas.width, compositeCanvas.height);
    compositeCtx.drawImage(state.backgroundImage, 0, 0);

    if (showReferenceOverlayEl.checked && state.referenceOverlay) {
      compositeCtx.globalAlpha = 0.45;
      compositeCtx.drawImage(state.referenceOverlay, 0, 0, compositeCanvas.width, compositeCanvas.height);
      compositeCtx.globalAlpha = 1;
    }

    compositeCtx.globalAlpha = state.overlayOpacity;
    compositeCtx.drawImage(maskCanvas, 0, 0);
    compositeCtx.globalAlpha = 1;

    editorCtx.clearRect(0, 0, editorCanvas.width, editorCanvas.height);
    editorCtx.drawImage(compositeCanvas, 0, 0, editorCanvas.width, editorCanvas.height);
  }

  async function loadImage(url) {
    return new Promise(function (resolve, reject) {
      const img = new Image();
      img.onload = function () { resolve(img); };
      img.onerror = function () { reject(new Error('Failed to load ' + url)); };
      img.src = url + '?t=' + Date.now();
    });
  }

  async function reloadMaskFromDisk() {
    const image = await loadImage(state.config.files.mask);
    maskCanvas.width = state.config.width;
    maskCanvas.height = state.config.height;
    maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
    maskCtx.drawImage(image, 0, 0, maskCanvas.width, maskCanvas.height);
    state.maskImageData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
    state.undoStack.length = 0;
    state.redoStack.length = 0;
    syncHistoryButtons();
    render();
  }

  async function refreshVizPreview() {
    vizPreviewEl.src = state.config.files.viz + '?t=' + Date.now();
  }

  async function saveMask() {
    if (!state.maskImageData) return;
    setStatus('Saving mask...', false);
    maskCtx.putImageData(state.maskImageData, 0, 0);
    const blob = await new Promise(function (resolve) {
      maskCanvas.toBlob(resolve, 'image/png');
    });
    const response = await fetch('/api/save-mask', {
      method: 'POST',
      headers: {
        'Content-Type': 'image/png',
      },
      body: blob,
    });
    const payload = await response.json();
    if (!response.ok || !payload.ok) {
      throw new Error(payload.error || 'Failed to save mask');
    }
    await refreshVizPreview();
    setStatus('Saved dev/data/generated/area_mask.png and refreshed preview.', false);
  }

  function handlePointerMove(event) {
    if (!state.config || !state.maskImageData) return;
    const point = getCanvasPoint(event);
    const area = pickAreaAt(point.x, point.y);
    cursorTextEl.textContent = 'Cursor: ' + point.x + ', ' + point.y + ' | ' + area.label;

    if (!state.pointerDown) return;
    paintStroke(state.lastPoint, point);
    state.lastPoint = point;
    render();
  }

  function beginPaint(event) {
    if (event.button === 2) {
      event.preventDefault();
      const point = getCanvasPoint(event);
      const picked = pickAreaAt(point.x, point.y);
      selectArea(picked.id);
      return;
    }
    if (event.button !== 0) return;
    pushUndoSnapshot();
    state.pointerDown = true;
    state.lastPoint = getCanvasPoint(event);
    paintStroke(state.lastPoint, state.lastPoint);
    render();
    editorCanvas.setPointerCapture(event.pointerId);
  }

  function endPaint(event) {
    if (!state.pointerDown) return;
    state.pointerDown = false;
    state.lastPoint = null;
    if (event.pointerId !== undefined) {
      try {
        editorCanvas.releasePointerCapture(event.pointerId);
      } catch (_) {
        // Ignore.
      }
    }
  }

  async function init() {
    const response = await fetch('/api/config');
    state.config = await response.json();
    compositeCanvas.width = state.config.width;
    compositeCanvas.height = state.config.height;

    for (let i = 0; i < state.config.areaDefs.length; i++) {
      const area = state.config.areaDefs[i];
      state.areaByColor.set(areaKey(
        parseInt(area.color.slice(1, 3), 16),
        parseInt(area.color.slice(3, 5), 16),
        parseInt(area.color.slice(5, 7), 16),
        255
      ), area);
    }
    state.areaByColor.set(areaKey(0, 0, 0, 0), { id: 'none', label: 'Transparent / Off-map' });

    buildPalette(state.config.areaDefs.map(function (area) {
      return {
        id: area.id,
        label: area.label,
        color: area.color,
      };
    }));
    selectArea(state.config.areaDefs[0].id);

    const assets = await Promise.all([
      loadImage(state.config.files.island),
      loadImage(state.config.files.areaMap),
    ]);
    state.backgroundImage = assets[0];
    state.referenceImage = assets[1];
    state.referenceOverlay = assets[1];

    renderReference();
    await reloadMaskFromDisk();
    await refreshVizPreview();
    setStatus('Ready. Paint on the left canvas and save when it looks right.', false);
  }

  brushSizeEl.addEventListener('input', function () {
    state.brushSize = Number(brushSizeEl.value);
    brushSizeValueEl.textContent = state.brushSize + ' px';
  });

  overlayOpacityEl.addEventListener('input', function () {
    state.overlayOpacity = Number(overlayOpacityEl.value) / 100;
    overlayOpacityValueEl.textContent = overlayOpacityEl.value + '%';
    render();
  });

  showReferenceOverlayEl.addEventListener('change', render);

  saveBtn.addEventListener('click', function () {
    saveMask().catch(function (error) {
      setStatus(error.message, true);
    });
  });

  reloadBtn.addEventListener('click', function () {
    reloadMaskFromDisk().then(function () {
      setStatus('Reloaded mask from disk.', false);
    }).catch(function (error) {
      setStatus(error.message, true);
    });
  });

  undoBtn.addEventListener('click', undo);
  redoBtn.addEventListener('click', redo);

  editorCanvas.addEventListener('pointerdown', beginPaint);
  editorCanvas.addEventListener('pointermove', handlePointerMove);
  editorCanvas.addEventListener('pointerup', endPaint);
  editorCanvas.addEventListener('pointerleave', function () {
    if (!state.pointerDown) cursorTextEl.textContent = 'Cursor: -';
  });
  editorCanvas.addEventListener('contextmenu', function (event) {
    event.preventDefault();
  });

  window.addEventListener('keydown', function (event) {
    const cmd = event.ctrlKey || event.metaKey;
    if (cmd && event.key.toLowerCase() === 's') {
      event.preventDefault();
      saveMask().catch(function (error) {
        setStatus(error.message, true);
      });
      return;
    }
    if (cmd && event.key.toLowerCase() === 'z' && !event.shiftKey) {
      event.preventDefault();
      undo();
      return;
    }
    if (cmd && event.key.toLowerCase() === 'z' && event.shiftKey) {
      event.preventDefault();
      redo();
    }
  });

  brushSizeValueEl.textContent = state.brushSize + ' px';
  overlayOpacityValueEl.textContent = overlayOpacityEl.value + '%';

  try {
    await init();
  } catch (error) {
    setStatus(error.message, true);
  }
})();
