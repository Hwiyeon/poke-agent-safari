'use strict';

const assert = require('assert').strict;
const http = require('http');
const path = require('path');
const { test, run } = require('./runner');
const { DashboardServer } = require('../server');
const { buildPublicSnapshot } = require('../snapshotPayload');
const { resolveRenderedPokemonIdForAgent } = require('../pokemon');

function createStateStub() {
  return {
    on() {},
    off() {},
    snapshot() {
      return {
        now: 1,
        lastUpdate: 2,
        activeTimeoutSec: 10,
        staleTimeoutSec: 20,
        activeAgentCount: 0,
        pokedex: { seenPokemonIds: [], firstDiscoveryByPokemon: {}, discoveredCount: 0, totalCount: 649 },
        agents: [],
        recentEvents: [],
        boxedAgents: [],
        subagentHistory: []
      };
    }
  };
}

function requestText(port, pathname) {
  return new Promise((resolve, reject) => {
    const req = http.get({
      host: '127.0.0.1',
      port,
      path: pathname
    }, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          contentType: res.headers['content-type'] || '',
          body: Buffer.concat(chunks).toString('utf8')
        });
      });
    });
    req.on('error', reject);
  });
}

function requestJson(port, pathname, payload) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload || {});
    const req = http.request({
      host: '127.0.0.1',
      port,
      path: pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    }, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          contentType: res.headers['content-type'] || '',
          body: Buffer.concat(chunks).toString('utf8')
        });
      });
    });
    req.on('error', reject);
    req.end(body);
  });
}

test('dashboard server snapshot payload uses the shared public snapshot builder', () => {
  const state = {
    on() {},
    off() {},
    snapshot() {
      return {
        now: 1,
        lastUpdate: 2,
        activeTimeoutSec: 10,
        staleTimeoutSec: 20,
        activeAgentCount: 1,
        pokedex: { seenPokemonIds: [25], firstDiscoveryByPokemon: {}, discoveredCount: 1, totalCount: 649 },
        agents: [{ agentId: 'a-1' }],
        recentEvents: [],
        boxedAgents: [],
        subagentHistory: []
      };
    }
  };

  const publicConfig = {
    mode: 'mock',
    enablePokeapiSprites: true,
    isMockMode: true,
    supportsHardReset: true
  };

  const server = new DashboardServer({
    state,
    publicConfig
  });

  assert.deepEqual(
    server.snapshotPayload(),
    buildPublicSnapshot(state, publicConfig)
  );
});

test('public snapshot keeps Claude and Codex rate limits separate for all-source dashboards', () => {
  const codexLimits = {
    five_hour: { used_percentage: 7, resets_at: 1 },
    seven_day: { used_percentage: 11, resets_at: 2 }
  };
  const claudeLimits = {
    five_hour: { used_percentage: 20, resets_at: 3 },
    seven_day: { used_percentage: 40, resets_at: 4 }
  };
  const state = {
    rateLimits: codexLimits,
    rateLimitsByProvider: { codex: codexLimits },
    snapshot() {
      return {
        now: 1,
        lastUpdate: 2,
        activeTimeoutSec: 10,
        staleTimeoutSec: 20,
        activeAgentCount: 0,
        pokedex: { seenPokemonIds: [], firstDiscoveryByPokemon: {}, discoveredCount: 0, totalCount: 649 },
        rateLimits: codexLimits,
        rateLimitsByProvider: { codex: codexLimits },
        agents: [],
        recentEvents: [],
        boxedAgents: [],
        subagentHistory: []
      };
    }
  };

  const snapshot = buildPublicSnapshot(
    state,
    { source: 'all' },
    { claudeRateLimits: claudeLimits }
  );

  assert.equal(snapshot.rateLimitsByProvider.claude.five_hour.used_percentage, 20);
  assert.equal(snapshot.rateLimitsByProvider.codex.five_hour.used_percentage, 7);
});

test('mock public snapshot includes synthetic Claude and Codex budgets', () => {
  const state = {
    snapshot() {
      return {
        now: 1,
        lastUpdate: 2,
        activeTimeoutSec: 10,
        staleTimeoutSec: 20,
        activeAgentCount: 0,
        pokedex: { seenPokemonIds: [], firstDiscoveryByPokemon: {}, discoveredCount: 0, totalCount: 649 },
        agents: [],
        recentEvents: [],
        boxedAgents: [],
        subagentHistory: []
      };
    }
  };

  const snapshot = buildPublicSnapshot(state, {
    mode: 'mock',
    source: 'mock',
    isMockMode: true
  });

  assert.equal(snapshot.rateLimitsByProvider.claude.five_hour.used_percentage, 22);
  assert.equal(snapshot.rateLimitsByProvider.codex.five_hour.used_percentage, 9);
});

test('public snapshot includes rendered pokemon ids shared by sticker and dashboard', () => {
  const parent = {
    agentId: 'root-agent-for-shared-render',
    createdAt: 1000
  };
  const child = {
    agentId: 'child-agent-for-shared-render',
    parentId: parent.agentId,
    createdAt: 2000
  };
  const state = {
    snapshot() {
      return {
        now: 1,
        lastUpdate: 2,
        activeTimeoutSec: 10,
        staleTimeoutSec: 20,
        activeAgentCount: 2,
        pokedex: { seenPokemonIds: [], firstDiscoveryByPokemon: {}, discoveredCount: 0, totalCount: 649 },
        agents: [parent, child],
        recentEvents: [],
        boxedAgents: [],
        subagentHistory: []
      };
    }
  };

  const snapshot = buildPublicSnapshot(state, { source: 'all' });
  const snapshotParent = snapshot.agents.find((agent) => agent.agentId === parent.agentId);
  const snapshotChild = snapshot.agents.find((agent) => agent.agentId === child.agentId);

  assert.equal(snapshotParent.renderedPokemonId, resolveRenderedPokemonIdForAgent(parent.agentId));
  assert.equal(
    snapshotChild.renderedPokemonId,
    resolveRenderedPokemonIdForAgent(child.agentId, {
      parentId: parent.agentId,
      createdAt: child.createdAt,
      getAgentById(agentId) {
        return agentId === parent.agentId ? parent : null;
      }
    })
  );
});

test('public snapshot honors assigned root pokemon ids', () => {
  const parent = {
    agentId: 'assigned-root-agent',
    assignedPokemonId: 25,
    createdAt: 1000
  };
  const child = {
    agentId: 'assigned-child-agent',
    parentId: parent.agentId,
    createdAt: 2000
  };
  const state = {
    snapshot() {
      return {
        now: 1,
        lastUpdate: 2,
        activeTimeoutSec: 10,
        staleTimeoutSec: 20,
        activeAgentCount: 2,
        pokedex: { seenPokemonIds: [], firstDiscoveryByPokemon: {}, discoveredCount: 0, totalCount: 649 },
        agents: [parent, child],
        recentEvents: [],
        boxedAgents: [],
        subagentHistory: []
      };
    }
  };

  const snapshot = buildPublicSnapshot(state, { source: 'all' });
  const snapshotParent = snapshot.agents.find((agent) => agent.agentId === parent.agentId);
  const snapshotChild = snapshot.agents.find((agent) => agent.agentId === child.agentId);

  assert.equal(snapshotParent.renderedPokemonId, parent.assignedPokemonId);
  assert.equal(
    snapshotChild.renderedPokemonId,
    resolveRenderedPokemonIdForAgent(child.agentId, {
      parentId: parent.agentId,
      createdAt: child.createdAt,
      getAgentById(agentId) {
        return agentId === parent.agentId ? parent : null;
      }
    })
  );
});

test('dashboard server updates exploration area through the API', async () => {
  const state = createStateStub();
  state.explorationAreaId = 'all';
  state.setExplorationArea = (areaId) => {
    state.explorationAreaId = areaId;
    return { ok: true, areaId };
  };

  const server = new DashboardServer({
    host: '127.0.0.1',
    port: 0,
    publicDir: path.join(__dirname, '..', 'public'),
    state
  });

  await server.start();
  const port = server.server.address().port;

  try {
    const res = await requestJson(port, '/api/exploration-area', { areaId: 'cave' });
    assert.equal(res.statusCode, 200);
    assert.deepEqual(JSON.parse(res.body), { ok: true, areaId: 'cave' });
    assert.equal(state.explorationAreaId, 'cave');
  } finally {
    await server.stop();
  }
});

test('dashboard server serves sticker static assets', async () => {
  const server = new DashboardServer({
    host: '127.0.0.1',
    port: 0,
    publicDir: path.join(__dirname, '..', 'public'),
    state: createStateStub()
  });

  await server.start();
  const port = server.server.address().port;

  try {
    const html = await requestText(port, '/sticker.html');
    const js = await requestText(port, '/sticker.js');
    const css = await requestText(port, '/sticker.css');

    assert.equal(html.statusCode, 200);
    assert.match(html.contentType, /text\/html/);
    assert.match(html.body, /Agent Safari Sticker/);
    assert.equal(js.statusCode, 200);
    assert.match(js.contentType, /text\/javascript/);
    assert.match(js.body, /EventSource/);
    assert.equal(css.statusCode, 200);
    assert.match(css.contentType, /text\/css/);
    assert.match(css.body, /sticker-shell/);
  } finally {
    await server.stop();
  }
});

test('dashboard server serves map assets from the shared map asset folder', async () => {
  const server = new DashboardServer({
    host: '127.0.0.1',
    port: 0,
    publicDir: path.join(__dirname, '..', 'public'),
    state: createStateStub()
  });

  await server.start();
  const port = server.server.address().port;

  try {
    const mask = await requestText(port, '/data/map_assets/area_mask.png');
    const oldMask = await requestText(port, '/data/area_mask.png');
    const archivedMap = await requestText(port, '/data/map_assets/archive/forest_detail.png');

    assert.equal(mask.statusCode, 200);
    assert.match(mask.contentType, /image\/png/);
    assert.equal(oldMask.statusCode, 404);
    assert.equal(archivedMap.statusCode, 404);
  } finally {
    await server.stop();
  }
});

run();
