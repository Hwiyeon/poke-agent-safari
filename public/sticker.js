'use strict';

(function () {
  var snapshot = null;
  var eventStream = null;
  var pollTimer = null;

  var els = {
    sourcePill: document.getElementById('source-pill'),
    activeCount: document.getElementById('active-count'),
    latestName: document.getElementById('latest-name'),
    latestMeta: document.getElementById('latest-meta'),
    hpFill: document.getElementById('hp-fill'),
    hpValue: document.getElementById('hp-value'),
    tokenFill: document.getElementById('token-fill'),
    tokenValue: document.getElementById('token-value'),
    thinkingCount: document.getElementById('thinking-count'),
    toolCount: document.getElementById('tool-count'),
    waitingCount: document.getElementById('waiting-count'),
    sleepingCount: document.getElementById('sleeping-count'),
    connectionState: document.getElementById('connection-state'),
    lastUpdate: document.getElementById('last-update'),
    expandBtn: document.getElementById('expand-btn'),
    minimizeBtn: document.getElementById('minimize-btn'),
    quitBtn: document.getElementById('quit-btn')
  };

  function electronBridge() {
    return window.agentSafariElectron || null;
  }

  function clampPct(value) {
    if (!Number.isFinite(value)) return 0;
    return Math.max(0, Math.min(100, value));
  }

  function formatNumber(value) {
    var num = Number(value);
    if (!Number.isFinite(num) || num <= 0) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(num >= 10000000 ? 0 : 1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(num >= 10000 ? 0 : 1) + 'K';
    return String(Math.round(num));
  }

  function formatTime(ts) {
    var num = Number(ts);
    if (!Number.isFinite(num) || num <= 0) return '--';
    return new Date(num).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  function titleCase(raw) {
    var text = String(raw || '').replace(/[_-]+/g, ' ').trim();
    if (!text) return 'Unknown';
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  function agentName(agent) {
    if (!agent) return 'Waiting for activity';
    return agent.displayName || agent.name || agent.agentId || 'Unnamed agent';
  }

  function agentMeta(agent) {
    if (!agent) return 'No sessions yet';
    var provider = titleCase(agent.provider || 'agent');
    var status = titleCase(agent.status || agent.activity || 'active');
    var project = agent.projectId ? ' · ' + agent.projectId : '';
    return provider + ' · ' + status + project;
  }

  function contextStats(agent) {
    if (!agent) {
      return { pct: 0, label: '--', color: '#7bd389' };
    }
    var max = Number(agent.contextMax);
    var used = Number(agent.contextUsed);
    if (!Number.isFinite(max) || max <= 0) max = 200000;
    if (!Number.isFinite(used) || used < 0) used = 0;
    var remaining = Math.max(0, max - used);
    var pct = clampPct((remaining / max) * 100);
    var color = pct < 25 ? '#ff6b6b' : pct < 50 ? '#ffd166' : '#7bd389';
    return {
      pct: pct,
      label: Math.round(pct) + '%',
      color: color
    };
  }

  function countByStatus(agents) {
    var counts = {
      thinking: 0,
      tool: 0,
      waiting: 0,
      sleeping: 0
    };

    agents.forEach(function (agent) {
      var status = String(agent.status || agent.activity || '').toLowerCase();
      if (status === 'thinking') counts.thinking += 1;
      if (status === 'tool' || status === 'tool-running' || status === 'tool_use' || status === 'tooling') counts.tool += 1;
      if (status === 'waiting' || status === 'idle') counts.waiting += 1;
      if (status === 'sleeping' || agent.isSleeping) counts.sleeping += 1;
    });

    return counts;
  }

  function newestAgent(agents) {
    var active = agents.filter(function (agent) { return agent && agent.isActive; });
    var pool = active.length > 0 ? active : agents;
    pool.sort(function (a, b) {
      return Number(b.lastSeen || b.createdAt || 0) - Number(a.lastSeen || a.createdAt || 0);
    });
    return pool[0] || null;
  }

  function tokenStats(agents) {
    var total = agents.reduce(function (sum, agent) {
      return sum + (Number(agent.totalTokens) || Number(agent.selfTokens) || 0);
    }, 0);
    var max = agents.reduce(function (sum, agent) {
      return sum + (Number(agent.contextMax) || 0);
    }, 0);
    return {
      total: total,
      pct: max > 0 ? clampPct((total / max) * 100) : 0
    };
  }

  function setConnection(status) {
    if (!els.connectionState) return;
    els.connectionState.classList.remove('online', 'offline');
    if (status) els.connectionState.classList.add(status);
    els.connectionState.textContent = status || 'connecting';
  }

  function render(nextSnapshot) {
    snapshot = nextSnapshot || snapshot || {};
    var agents = Array.isArray(snapshot.agents) ? snapshot.agents.slice() : [];
    var latest = newestAgent(agents);
    var activeCount = Number(snapshot.activeAgentCount);
    if (!Number.isFinite(activeCount)) {
      activeCount = agents.filter(function (agent) { return agent && agent.isActive; }).length;
    }
    var hp = contextStats(latest);
    var tokens = tokenStats(agents);
    var counts = countByStatus(agents);
    var source = snapshot.config && snapshot.config.source ? snapshot.config.source : 'all';

    els.sourcePill.textContent = source;
    els.activeCount.textContent = String(activeCount);
    els.latestName.textContent = agentName(latest);
    els.latestMeta.textContent = agentMeta(latest);
    els.hpFill.style.width = hp.pct.toFixed(1) + '%';
    els.hpFill.style.background = hp.color;
    els.hpValue.textContent = hp.label;
    els.tokenFill.style.width = tokens.pct.toFixed(1) + '%';
    els.tokenValue.textContent = formatNumber(tokens.total);
    els.thinkingCount.textContent = String(counts.thinking);
    els.toolCount.textContent = String(counts.tool);
    els.waitingCount.textContent = String(counts.waiting);
    els.sleepingCount.textContent = String(counts.sleeping);
    els.lastUpdate.textContent = 'updated ' + formatTime(snapshot.lastUpdate || snapshot.now);
  }

  function loadState() {
    return fetch('/api/state', { cache: 'no-cache' })
      .then(function (res) {
        if (!res.ok) throw new Error('state load failed: ' + res.status);
        return res.json();
      })
      .then(function (state) {
        setConnection('online');
        render(state);
      })
      .catch(function () {
        setConnection('offline');
      });
  }

  function connectEvents() {
    if (!window.EventSource) return;
    eventStream = new EventSource('/events');
    eventStream.addEventListener('state', function (event) {
      setConnection('online');
      render(JSON.parse(event.data));
    });
    eventStream.onerror = function () {
      setConnection('offline');
    };
  }

  function wireControls() {
    els.expandBtn.addEventListener('click', function () {
      var bridge = electronBridge();
      if (bridge) {
        bridge.expand();
      } else {
        window.location.href = '/';
      }
    });

    els.minimizeBtn.addEventListener('click', function () {
      var bridge = electronBridge();
      if (bridge) bridge.minimize();
    });

    els.quitBtn.addEventListener('click', function () {
      var bridge = electronBridge();
      if (bridge) {
        bridge.quit();
      } else {
        window.close();
      }
    });
  }

  wireControls();
  setConnection('connecting');
  loadState();
  connectEvents();
  pollTimer = setInterval(loadState, 10000);

  window.addEventListener('pagehide', function () {
    if (eventStream) eventStream.close();
    if (pollTimer) clearInterval(pollTimer);
  });
})();
