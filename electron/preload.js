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

  document.body.classList.add('agent-safari-electron-dashboard');

  const style = document.createElement('style');
  style.textContent = `
    body.agent-safari-electron-dashboard .top-bar {
      -webkit-app-region: drag;
    }
    body.agent-safari-electron-dashboard .stats-wrap,
    body.agent-safari-electron-dashboard #agent-safari-electron-controls {
      -webkit-app-region: no-drag;
    }
    #agent-safari-electron-controls {
      -webkit-app-region: no-drag;
      display: inline-flex;
      flex: 0 0 auto;
      align-items: center;
      gap: 3px;
      padding: 2px;
      border: 1px solid rgba(31, 35, 38, 0.42);
      border-radius: 6px;
      background: rgba(255, 253, 248, 0.72);
    }
    #agent-safari-electron-controls button {
      display: inline-grid;
      place-items: center;
      width: 24px;
      height: 22px;
      padding: 0;
      border: 0;
      border-radius: 4px;
      color: #2d2c2a;
      background: rgba(31, 35, 38, 0.08);
      font: 800 12px/1 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      cursor: pointer;
    }
    #agent-safari-electron-controls button:hover {
      background: rgba(22, 107, 94, 0.18);
    }
    #agent-safari-electron-controls.agent-safari-electron-controls-floating {
      position: fixed;
      top: 8px;
      right: 8px;
      z-index: 2147483647;
      box-shadow: 0 8px 24px rgba(0,0,0,0.18);
    }
  `;

  const controls = document.createElement('div');
  controls.id = 'agent-safari-electron-controls';
  controls.innerHTML = `
    <button type="button" data-electron-action="compact" title="Compact sticker" aria-label="Compact sticker">-</button>
    <button type="button" data-electron-action="minimize" title="Minimize" aria-label="Minimize">_</button>
    <button type="button" data-electron-action="quit" title="Quit" aria-label="Quit">x</button>
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
  const toolbar = document.querySelector('.stats-wrap');
  if (toolbar) {
    toolbar.appendChild(controls);
  } else {
    controls.classList.add('agent-safari-electron-controls-floating');
    document.body.appendChild(controls);
  }
}

window.addEventListener('DOMContentLoaded', injectDashboardControls);
