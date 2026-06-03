'use strict';

const net = require('net');
const path = require('path');
const { app, BrowserWindow, ipcMain, shell } = require('electron');

const PROJECT_ROOT = path.resolve(__dirname, '..');
process.chdir(PROJECT_ROOT);

const { AgentState } = require('../state');
const { TranscriptWatcher } = require('../watcher');
const { DashboardServer } = require('../server');
const { resolveRenderedPokemonIdForAgent } = require('../pokemon');
const bootstrap = require('../bootstrap');
const configResolver = require('../configResolver');
const { createMockDriver } = require('../mockDriver');
const { applyClaudeEnvironment } = require('../claudeSettings');
const { normalizeCodexLine } = require('../codexParser');

let mainWindow = null;
let runtime = null;
let isQuitting = false;

function hasSource(source, target) {
  return source === 'all' || source === target;
}

function normalizeMode(mode) {
  return mode === 'mock' ? 'mock' : 'watch';
}

function isSupportedMode(mode) {
  return mode === 'watch' || mode === 'mock';
}

function resolveElectronConfig() {
  const argv = process.argv.slice(2);
  const { command, config } = configResolver.resolveCli(argv);
  const mode = normalizeMode(command);

  if (command === 'help' || command === '--help' || command === '-h') {
    return { mode: 'watch', config, showHelp: true };
  }

  if (!isSupportedMode(command)) {
    throw new Error(`Unknown Electron mode: ${command}`);
  }

  return { mode, config, showHelp: false };
}

function getPersistencePaths(mode, source) {
  const baseRoot = app.isPackaged ? app.getPath('userData') : PROJECT_ROOT;
  return bootstrap.resolvePersistPaths({
    mode,
    cwd: baseRoot,
    ssotBaseDir: path.join(baseRoot, 'data', 'runtime', 'all'),
    mockBaseDir: path.join(baseRoot, 'data', 'runtime', 'mock')
  });
}

function createAgentState(mode, config) {
  return new AgentState({
    activeTimeoutSec: config.activeTimeoutSec,
    staleTimeoutSec: config.staleTimeoutSec,
    boxSubagentsImmediately: mode !== 'mock',
    resolvePokemonId(agentId, context = {}) {
      const agent = context.agent || null;
      const meta = context.meta || {};
      return resolveRenderedPokemonIdForAgent(agentId, {
        parentId: (agent && agent.parentId) || meta.parentId || null,
        getAgentById: context.getAgentById,
        createdAt: (agent && agent.createdAt) || context.ts
      });
    }
  });
}

function createWatchers(config, state) {
  const watchers = [];

  if (hasSource(config.source, 'claude')) {
    watchers.push(new TranscriptWatcher({
      provider: 'claude',
      label: 'Claude Code',
      rootPath: config.claudeProjectsPath,
      staleTimeoutMs: config.staleTimeoutSec * 1000
    }));
  }

  if (hasSource(config.source, 'codex')) {
    watchers.push(new TranscriptWatcher({
      provider: 'codex',
      label: 'Codex',
      rootPath: config.codexSessionsPath,
      normalizeLine: normalizeCodexLine,
      staleTimeoutMs: config.staleTimeoutSec * 1000
    }));
  }

  for (const watcher of watchers) {
    watcher.on('info', (message) => console.log(`[watcher] ${message}`));
    watcher.on('warn', (message) => console.warn(`[watcher] ${message}`));
    watcher.on('event', (event) => state.applyEvent(event));
  }

  return watchers;
}

function canListen(host, port) {
  return new Promise((resolve) => {
    const tester = net.createServer();
    tester.once('error', () => resolve(false));
    tester.once('listening', () => {
      tester.close(() => resolve(true));
    });
    tester.listen(port, host);
  });
}

async function choosePort(host, preferredPort) {
  for (let offset = 0; offset < 20; offset += 1) {
    const port = preferredPort + offset;
    if (await canListen(host, port)) {
      return port;
    }
  }
  throw new Error(`No available dashboard port near ${preferredPort}`);
}

async function startRuntime(mode, config) {
  const persist = getPersistencePaths(mode, mode === 'watch' ? config.source : 'mock');
  const state = createAgentState(mode, config);
  const publicConfig = {
    mode,
    source: mode === 'watch' ? config.source : 'mock',
    enablePokeapiSprites: config.enablePokeapiSprites,
    isMockMode: mode === 'mock',
    supportsHardReset: true
  };

  if (mode === 'watch' && hasSource(config.source, 'claude')) {
    applyClaudeEnvironment();
  }

  bootstrap.loadState(state, persist);
  bootstrap.loadPokedex(state, persist);
  bootstrap.savePokedex(state, persist);

  if (mode === 'watch' && config.source === 'claude') {
    const startup = bootstrap.runStartupZombieBoxing(state);
    if (startup.boxedCount > 0) {
      bootstrap.saveState(state, persist);
    }
  }

  const watchers = mode === 'watch' ? createWatchers(config, state) : [];
  const mock = mode === 'mock' ? createMockDriver(state) : null;
  const port = await choosePort(config.host, config.port);
  const server = new DashboardServer({
    host: config.host,
    port,
    publicDir: path.join(PROJECT_ROOT, 'public'),
    state,
    publicConfig,
    onHardReset: () => bootstrap.performDashboardHardReset({
      command: mode,
      persist,
      state,
      mock,
      watcher: watchers.length > 0
        ? { resetToCurrentEnd: () => Promise.all(watchers.map((item) => item.resetToCurrentEnd())) }
        : null
    })
  });

  server.on('info', (message) => console.log(`[server] ${message}`));
  server.on('warn', (message) => console.warn(`[server] ${message}`));
  state.on('pokedex', () => bootstrap.savePokedex(state, persist));

  await server.start();

  if (watchers.length > 0) {
    const skipInitialTail = bootstrap.consumeResetFlag(persist);
    for (const watcher of watchers) {
      await watcher.start({ skipInitialTail });
    }
  }

  if (mock) {
    mock.start();
  }

  const tickTimer = bootstrap.startPeriodicTick(state);
  const pidCheckTimer = mode === 'watch' && hasSource(config.source, 'claude')
    ? bootstrap.startPeriodicPidCheck(state)
    : null;
  const saveTimer = bootstrap.startPeriodicSave(state, persist);

  return {
    mode,
    config: { ...config, port },
    persist,
    state,
    watchers,
    mock,
    server,
    timers: [tickTimer, pidCheckTimer, saveTimer].filter(Boolean),
    url(pathname = '/') {
      return `http://${config.host}:${port}${pathname}`;
    },
    async stop() {
      bootstrap.stopAll(this.timers);
      if (this.mode === 'watch' && hasSource(this.config.source, 'codex')) {
        this.state.boxActiveRootAgents({ provider: 'codex' });
      }
      bootstrap.saveState(this.state, this.persist);
      bootstrap.savePokedex(this.state, this.persist);

      for (const watcher of this.watchers) {
        await watcher.stop();
      }
      if (this.mock) {
        this.mock.stop();
      }
      await this.server.stop();
    }
  };
}

function createWindow() {
  const win = new BrowserWindow({
    width: 360,
    height: 280,
    minWidth: 300,
    minHeight: 260,
    show: false,
    frame: false,
    resizable: true,
    skipTaskbar: true,
    backgroundColor: '#17191f',
    title: 'Agent Safari',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith(runtime.url('/'))) {
      return { action: 'allow' };
    }
    shell.openExternal(url);
    return { action: 'deny' };
  });

  win.once('ready-to-show', () => win.show());
  win.on('closed', () => {
    mainWindow = null;
    if (!isQuitting) {
      app.quit();
    }
  });

  return win;
}

function setMacWorkspaceVisibility(win, visible) {
  if (process.platform !== 'darwin') return;
  win.setVisibleOnAllWorkspaces(visible, { visibleOnFullScreen: visible });
}

function showSticker() {
  if (!mainWindow || !runtime) return;
  mainWindow.setAlwaysOnTop(true, 'floating');
  setMacWorkspaceVisibility(mainWindow, true);
  mainWindow.setSkipTaskbar(true);
  mainWindow.setMinimumSize(300, 260);
  mainWindow.setSize(360, 280, true);
  mainWindow.loadURL(runtime.url('/sticker.html'));
}

function showFullDashboard() {
  if (!mainWindow || !runtime) return;
  mainWindow.setAlwaysOnTop(false);
  setMacWorkspaceVisibility(mainWindow, false);
  mainWindow.setSkipTaskbar(false);
  mainWindow.setMinimumSize(900, 620);
  mainWindow.setSize(1280, 860, true);
  mainWindow.center();
  mainWindow.loadURL(runtime.url('/'));
}

function wireIpc() {
  ipcMain.handle('agentSafari:compact', () => showSticker());
  ipcMain.handle('agentSafari:expand', () => showFullDashboard());
  ipcMain.handle('agentSafari:minimize', () => {
    if (mainWindow) mainWindow.minimize();
  });
  ipcMain.handle('agentSafari:quit', () => app.quit());
}

async function shutdownAndQuit() {
  if (isQuitting) return;
  isQuitting = true;

  if (runtime) {
    try {
      await runtime.stop();
    } catch (error) {
      console.warn(`[shutdown] ${error.message}`);
    }
    runtime = null;
  }

  app.quit();
}

app.whenReady().then(async () => {
  wireIpc();
  const { mode, config } = resolveElectronConfig();
  runtime = await startRuntime(mode, config);
  mainWindow = createWindow();
  showSticker();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0 && runtime) {
    mainWindow = createWindow();
    showSticker();
  }
});

app.on('before-quit', (event) => {
  if (isQuitting) return;
  event.preventDefault();
  shutdownAndQuit();
});
