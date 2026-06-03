'use strict';

const { contextBridge, ipcRenderer } = require('electron');

function invoke(channel) {
  return ipcRenderer.invoke(channel);
}

contextBridge.exposeInMainWorld('agentSafariElectron', {
  compact: () => invoke('agentSafari:compact'),
  expand: () => invoke('agentSafari:expand'),
  minimize: () => invoke('agentSafari:minimize'),
  quit: () => invoke('agentSafari:quit'),
  platform: process.platform
});

function injectDashboardControls() {
  if (window.location.pathname !== '/') return;
  if (document.getElementById('agent-safari-electron-controls')) return;

  const style = document.createElement('style');
  style.textContent = `
    #agent-safari-electron-controls {
      -webkit-app-region: no-drag;
      position: fixed;
      top: 10px;
      right: 10px;
      z-index: 2147483647;
      display: flex;
      gap: 6px;
      padding: 6px;
      border: 1px solid rgba(255,255,255,0.16);
      border-radius: 8px;
      background: rgba(20, 24, 31, 0.88);
      box-shadow: 0 10px 32px rgba(0,0,0,0.28);
      backdrop-filter: blur(8px);
    }
    #agent-safari-electron-controls button {
      width: 34px;
      height: 30px;
      border: 0;
      border-radius: 6px;
      color: #f5f7fb;
      background: rgba(255,255,255,0.12);
      font: 700 14px/1 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      cursor: pointer;
    }
    #agent-safari-electron-controls button:hover {
      background: rgba(123, 211, 137, 0.28);
    }
  `;

  const controls = document.createElement('div');
  controls.id = 'agent-safari-electron-controls';
  controls.innerHTML = `
    <button type="button" data-electron-action="compact" title="Compact sticker" aria-label="Compact sticker">⇲</button>
    <button type="button" data-electron-action="minimize" title="Minimize" aria-label="Minimize">_</button>
    <button type="button" data-electron-action="quit" title="Quit" aria-label="Quit">×</button>
  `;

  controls.addEventListener('click', (event) => {
    const button = event.target.closest('[data-electron-action]');
    if (!button) return;
    const action = button.getAttribute('data-electron-action');
    if (action === 'compact') invoke('agentSafari:compact');
    if (action === 'minimize') invoke('agentSafari:minimize');
    if (action === 'quit') invoke('agentSafari:quit');
  });

  document.head.appendChild(style);
  document.body.appendChild(controls);
}

window.addEventListener('DOMContentLoaded', injectDashboardControls);
