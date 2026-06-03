'use strict';

(function () {
  var POKEDEX_MIN = 1;
  var POKEDEX_MAX = 649;
  var POKEDEX_TOTAL = POKEDEX_MAX - POKEDEX_MIN + 1;
  var OWNED_LIMIT = 2;
  var AGENT_LIMIT = 3;
  var LANGUAGE_STORAGE_KEY = 'agent-safari-name-language';
  var LEGACY_LANGUAGE_STORAGE_KEY = 'agent-safari-sticker-name-language';

  var snapshot = null;
  var eventStream = null;
  var pollTimer = null;
  var pokemonNames = {};
  var pokemonKoNames = {};
  var nameLanguage = readStoredNameLanguage();
  var languageMenuOpen = false;

  var els = {
    sourcePill: document.getElementById('source-pill'),
    languageMenuButton: document.getElementById('language-menu-button'),
    languageOptions: document.getElementById('language-options'),
    activeCount: document.getElementById('active-count'),
    rateLimitList: document.getElementById('rate-limit-list'),
    ownedCount: document.getElementById('owned-count'),
    ownedList: document.getElementById('owned-list'),
    agentCount: document.getElementById('agent-count'),
    agentList: document.getElementById('agent-list'),
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

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function clampPct(value) {
    if (!Number.isFinite(value)) return 0;
    return Math.max(0, Math.min(100, value));
  }

  function hashCode(input) {
    var text = String(input || '');
    var h = 2166136261;
    for (var i = 0; i < text.length; i += 1) {
      h ^= text.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return Math.abs(h >>> 0);
  }

  function pokemonIdForAgent(agent) {
    if (agent && agent.forcedPokemonId) {
      return agent.forcedPokemonId;
    }
    var rawId = agent && (agent.agentId || agent.parentId);
    return (hashCode(rawId || 'agent') % POKEDEX_TOTAL) + POKEDEX_MIN;
  }

  function spriteUrl(kind, id, ext) {
    var safeId = Math.max(POKEDEX_MIN, Math.min(POKEDEX_MAX, Number(id) || POKEDEX_MIN));
    return '/sprites/' + kind + '/' + safeId + '.' + ext;
  }

  function iconUrl(id) {
    return spriteUrl('icon', id, 'png');
  }

  function staticIconUrl(id) {
    return spriteUrl('icon-static', id, 'png');
  }

  function agentIconUrl(agent, id) {
    return agent && agent.isSleeping ? staticIconUrl(id) : iconUrl(id);
  }

  function dataUrl(name) {
    return '/data/' + name;
  }

  function readStoredNameLanguage() {
    try {
      var shared = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (shared === 'ko' || shared === 'en') return shared;
      var legacy = localStorage.getItem(LEGACY_LANGUAGE_STORAGE_KEY);
      if (legacy === 'ko' || legacy === 'en') return legacy;
    } catch (err) {
      return 'ko';
    }
    return 'ko';
  }

  function storeNameLanguage(lang) {
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
      localStorage.setItem(LEGACY_LANGUAGE_STORAGE_KEY, lang);
    } catch (err) {}
  }

  function updateLanguageToggle() {
    if (!els.languageMenuButton) return;
    var isEnglish = nameLanguage === 'en';
    var label = isEnglish ? 'EN' : 'KO';
    var title = isEnglish ? 'Pokemon names: English' : 'Pokemon names: Korean';
    els.languageMenuButton.textContent = label;
    els.languageMenuButton.title = title;
    els.languageMenuButton.setAttribute('aria-label', title);
    els.languageMenuButton.setAttribute('aria-expanded', languageMenuOpen ? 'true' : 'false');
    if (els.languageOptions) {
      els.languageOptions.classList.toggle('open', languageMenuOpen);
      var buttons = els.languageOptions.querySelectorAll('[data-language-option]');
      Array.prototype.forEach.call(buttons, function (button) {
        var selected = button.getAttribute('data-language-option') === nameLanguage;
        button.classList.toggle('selected', selected);
        button.setAttribute('aria-checked', selected ? 'true' : 'false');
      });
    }
    document.documentElement.lang = isEnglish ? 'en' : 'ko';
  }

  function setLanguageMenu(open) {
    languageMenuOpen = !!open;
    updateLanguageToggle();
  }

  function setNameLanguage(lang) {
    nameLanguage = lang === 'en' ? 'en' : 'ko';
    storeNameLanguage(nameLanguage);
    languageMenuOpen = false;
    updateLanguageToggle();
    if (snapshot) render(snapshot);
  }

  function formatPokemonName(name) {
    if (!name) return 'Unknown';
    return String(name)
      .split('-')
      .map(function (part) {
        if (!part) return '';
        return part.charAt(0).toUpperCase() + part.slice(1);
      })
      .join(' ');
  }

  function pokemonDisplayName(pokemonId, lang) {
    var id = Number(pokemonId);
    var fallback = 'Pokemon #' + String(id || POKEDEX_MIN).padStart(3, '0');
    if ((lang || nameLanguage) === 'en') {
      return pokemonNames[id] || pokemonKoNames[id] || fallback;
    }
    return pokemonKoNames[id] || pokemonNames[id] || fallback;
  }

  function pokemonNumberLabel(pokemonId) {
    var id = Number(pokemonId) || POKEDEX_MIN;
    return '#' + String(id).padStart(3, '0') + ' ' + pokemonDisplayName(id);
  }

  function ownedDisplayName(pokemon) {
    if (!pokemon) return 'Pokemon';
    return pokemon.nickname || pokemonDisplayName(pokemon.speciesId);
  }

  function loadPokemonNames() {
    var english = fetch(dataUrl('pokemon_data.json'), { cache: 'no-cache' })
      .then(function (res) {
        if (!res.ok) throw new Error('pokemon data failed');
        return res.json();
      })
      .then(function (data) {
        var list = Array.isArray(data && data.pokemon) ? data.pokemon : [];
        list.forEach(function (pokemon) {
          var id = Number(pokemon && pokemon.pokemon_id);
          if (!Number.isInteger(id)) return;
          if (pokemon.name) pokemonNames[id] = formatPokemonName(pokemon.name);
          if (pokemon.name_ko) pokemonKoNames[id] = pokemon.name_ko;
        });
      })
      .catch(function () {});

    var korean = fetch(dataUrl('pokemon_names_ko.json'), { cache: 'no-cache' })
      .then(function (res) {
        if (!res.ok) throw new Error('pokemon ko names failed');
        return res.json();
      })
      .then(function (data) {
        Object.keys(data || {}).forEach(function (id) {
          pokemonKoNames[Number(id)] = data[id];
        });
      })
      .catch(function () {});

    Promise.all([english, korean]).then(function () {
      if (snapshot) render(snapshot);
    });
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

  function formatAge(ts) {
    var num = Number(ts);
    if (!Number.isFinite(num) || num <= 0) return '--';
    var seconds = Math.max(0, Math.floor((Date.now() - num) / 1000));
    if (seconds < 60) return seconds + 's ago';
    var minutes = Math.floor(seconds / 60);
    if (minutes < 60) return minutes + 'm ago';
    var hours = Math.floor(minutes / 60);
    if (hours < 48) return hours + 'h ago';
    return Math.floor(hours / 24) + 'd ago';
  }

  function titleCase(raw) {
    var text = String(raw || '').replace(/[_-]+/g, ' ').trim();
    if (!text) return 'Unknown';
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  function compactModelName(model, provider) {
    var text = String(model || '').trim();
    if (!text) {
      return titleCase(provider || 'unknown');
    }
    text = text
      .replace(/^claude[-_]/i, '')
      .replace(/^openai[-_]/i, '')
      .replace(/^gpt[-_]/i, 'GPT ')
      .replace(/[-_]20\d{6,}$/i, '')
      .replace(/[-_](latest|preview)$/i, '')
      .replace(/[-_]+/g, ' ')
      .trim();
    return text ? titleCase(text) : titleCase(provider || 'unknown');
  }

  function shortProjectName(projectId) {
    if (!projectId) return 'unknown';
    var segments = String(projectId).replace(/^-+/, '').split('-').filter(Boolean);
    var skip = { home: 1, users: 1, user: 1, projects: 1, repos: 1, src: 1, code: 1, work: 1, workspace: 1, documents: 1, desktop: 1 };
    var last = -1;
    for (var i = 0; i < segments.length; i += 1) {
      if (skip[segments[i].toLowerCase()]) last = i;
    }
    var meaningful = segments.slice(last + 1);
    return meaningful.length > 0 ? meaningful.join('-') : segments[segments.length - 1] || projectId;
  }

  function truncate(value, max) {
    var text = String(value || '').trim();
    var limit = Number(max) || 32;
    if (text.length <= limit) return text;
    return text.slice(0, Math.max(0, limit - 1)).trimEnd() + '...';
  }

  function agentName(agent) {
    if (!agent) return 'Waiting for activity';
    return agent.displayName || agent.name || agent.subagentType || agent.agentId || 'Unnamed agent';
  }

  function contextStats(agent) {
    if (!agent) {
      return { pct: 0, label: '--', color: '#7bd389', used: 0, max: 0, remaining: 0 };
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
      color: color,
      used: used,
      max: max,
      remaining: remaining
    };
  }

  function contextTokenLabel(stats) {
    if (!stats || !Number.isFinite(stats.max) || stats.max <= 0) return '--/--';
    return formatNumber(stats.used) + '/' + formatNumber(stats.max);
  }

  function agentStateLabel(agent) {
    if (agent && agent.isSleeping) return 'sleeping';
    if (agent && agent.isActive) return 'active';
    return String((agent && (agent.status || agent.activity)) || 'idle').toLowerCase().replace(/[_-]+/g, ' ');
  }

  function agentStateClass(agent) {
    if (agent && agent.isSleeping) return ' sleeping-state';
    if (agent && agent.isActive) return ' active-state';
    return ' idle-state';
  }

  function expToNextLevel(level) {
    var stage = Math.max(0, level - 1);
    return 69000 + stage * 4800;
  }

  function agentLevel(agent) {
    var totalTokens = Math.max(0, Number(agent && agent.totalTokens) || 0);
    var level = 1;
    var currentBase = 0;

    while (level < 100) {
      var nextDelta = expToNextLevel(level);
      if (totalTokens < currentBase + nextDelta) break;
      currentBase += nextDelta;
      level += 1;
    }

    var needed = level >= 100 ? 1 : expToNextLevel(level);
    var progress = level >= 100 ? 100 : clampPct(((totalTokens - currentBase) / needed) * 100);
    return { level: level, progress: progress, totalTokens: totalTokens };
  }

  function ownedLevel(pokemon) {
    var level = Math.max(1, Math.min(100, Number(pokemon && pokemon.level) || 1));
    var needed = pokemon && typeof pokemon.expToNextLevel === 'number'
      ? pokemon.expToNextLevel
      : (level >= 100 ? 0 : 1);
    var exp = level >= 100 ? needed : Math.max(0, Number(pokemon && pokemon.exp) || 0);
    var progress = level >= 100 ? 100 : clampPct(needed > 0 ? (exp / needed) * 100 : 0);
    return { level: level, exp: exp, needed: needed, progress: progress };
  }

  function meterHtml(label, pct, color, valueText) {
    return [
      '<div class="popover-meter">',
      '<span class="popover-meter-label">' + escapeHtml(label) + '</span>',
      '<div class="popover-meter-track"><div class="popover-meter-fill" style="width:' + clampPct(pct).toFixed(1) + '%;background:' + color + '"></div></div>',
      '<span class="popover-meter-value">' + escapeHtml(valueText) + '</span>',
      '</div>'
    ].join('');
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

  function hpBarColor(ratio) {
    if (ratio > 0.5) return '#58d058';
    if (ratio > 0.2) return '#f0c838';
    return '#e85040';
  }

  function formatRemainingShort(epoch) {
    if (!epoch) return '-';
    var diffMs = epoch * 1000 - Date.now();
    if (diffMs <= 0) return 'now';
    var totalMin = Math.floor(diffMs / 60000);
    var h = Math.floor(totalMin / 60);
    var m = totalMin % 60;
    if (h > 0) return h + 'h ' + m + 'm';
    return m + 'm';
  }

  function formatResetAtShort(epoch) {
    if (!epoch) return '-';
    var d = new Date(epoch * 1000);
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return months[d.getMonth()] + ' ' + d.getDate() + ' '
      + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  }

  function rateLimitProviderLabel(provider) {
    if (provider === 'codex') return 'Codex Budget';
    if (provider === 'claude') return 'Claude Budget';
    return 'Budget';
  }

  function rateLimitProviderOrder(nextSnapshot) {
    var source = String((nextSnapshot.config && nextSnapshot.config.source) || '').toLowerCase();
    if (source === 'codex') return ['codex'];
    if (source === 'claude') return ['claude'];
    return ['claude', 'codex'];
  }

  function rateLimitEntries(nextSnapshot) {
    var byProvider = (nextSnapshot && nextSnapshot.rateLimitsByProvider) || {};
    var order = rateLimitProviderOrder(nextSnapshot || {});
    var entries = [];

    for (var i = 0; i < order.length; i += 1) {
      var provider = order[i];
      if (byProvider[provider]) {
        entries.push({ provider: provider, rateLimits: byProvider[provider] });
      }
    }

    if (entries.length === 0 && nextSnapshot && nextSnapshot.rateLimits) {
      var source = String((nextSnapshot.config && nextSnapshot.config.source) || '').toLowerCase();
      var fallbackProvider = source === 'codex' || source === 'claude' ? source : 'budget';
      entries.push({ provider: fallbackProvider, rateLimits: nextSnapshot.rateLimits });
    }

    return entries;
  }

  function rateLimitBarHtml(providerLabel, periodLabel, rateLimit, resetKind) {
    var hasValue = rateLimit && typeof rateLimit.used_percentage === 'number';
    var remain = hasValue ? 100 - Math.min(100, Math.max(0, rateLimit.used_percentage)) : 0;
    var color = hasValue ? hpBarColor(remain / 100) : '#777';
    var pctText = hasValue ? remain.toFixed(1) + '%' : '-';
    var tooltip = providerLabel + ' ' + periodLabel + ': no data';

    if (hasValue) {
      tooltip = providerLabel + ' ' + periodLabel + ': ' + remain.toFixed(1) + '% remaining';
      tooltip += resetKind === 'remaining'
        ? ' / ' + formatRemainingShort(rateLimit.resets_at) + ' left'
        : ' / resets ' + formatResetAtShort(rateLimit.resets_at);
    }

    return [
      '<div class="rate-limit-bar" title="' + escapeHtml(tooltip) + '">',
      '<span class="rate-limit-label">' + periodLabel + '</span>',
      '<div class="rate-limit-track"><div class="rate-limit-fill" style="width:' + remain.toFixed(1) + '%;background:' + color + '"></div></div>',
      '<span class="rate-limit-pct" style="color:' + color + '">' + pctText + '</span>',
      '</div>'
    ].join('');
  }

  function rateLimitProviderHtml(entry) {
    var providerLabel = rateLimitProviderLabel(entry.provider);
    var rateLimits = entry.rateLimits || {};
    return [
      '<div class="rate-limit-provider">',
      '<span class="rate-limit-provider-name">' + escapeHtml(providerLabel) + '</span>',
      '<div class="rate-limit-provider-bars">',
      rateLimitBarHtml(providerLabel, '5H', rateLimits.five_hour, 'remaining'),
      rateLimitBarHtml(providerLabel, '7D', rateLimits.seven_day, 'date'),
      '</div>',
      '</div>'
    ].join('');
  }

  function renderRateLimits(nextSnapshot) {
    var entries = rateLimitEntries(nextSnapshot || {});
    if (entries.length === 0) {
      els.rateLimitList.innerHTML = '<div class="panel-empty">No budget data yet</div>';
      return;
    }
    els.rateLimitList.innerHTML = entries.map(rateLimitProviderHtml).join('');
  }

  function renderOwned(owned) {
    var party = owned.slice().sort(function (a, b) {
      var aSlot = Number.isInteger(a.partySlot) ? a.partySlot : 99;
      var bSlot = Number.isInteger(b.partySlot) ? b.partySlot : 99;
      if (aSlot !== bSlot) return aSlot - bSlot;
      return Number(b.updatedAt || b.createdAt || 0) - Number(a.updatedAt || a.createdAt || 0);
    });
    els.ownedCount.textContent = String(owned.length);

    if (party.length === 0) {
      els.ownedList.innerHTML = '<div class="panel-empty">No party Pokemon yet</div>';
      return;
    }

    var html = '';
    party.slice(0, OWNED_LIMIT).forEach(function (pokemon) {
      var stats = ownedLevel(pokemon);
      var speciesId = Number(pokemon.speciesId) || POKEDEX_MIN;
      var displayName = ownedDisplayName(pokemon);
      var speciesName = pokemonDisplayName(speciesId);
      var assigned = pokemon.assignedProjectId ? shortProjectName(pokemon.assignedProjectId) : 'unassigned';
      html += '<article class="owned-party-card sticker-owned-card" tabindex="0">';
      html += '<img class="owned-party-sprite" src="' + escapeHtml(iconUrl(speciesId)) + '" alt="" />';
      html += '<div class="owned-party-body">';
      html += '<div class="owned-party-top">';
      html += '<div class="owned-party-title">';
      html += '<span class="owned-party-name" title="' + escapeHtml(displayName + ' - ' + speciesName) + '">' + escapeHtml(displayName) + '</span>';
      html += '<span class="owned-party-species">#' + String(speciesId).padStart(3, '0') + ' ' + escapeHtml(speciesName) + '</span>';
      html += '</div>';
      html += '<span class="owned-party-level">Lv.' + stats.level + '</span>';
      html += '</div>';
      html += '</div>';
      html += '<div class="row-popover">';
      html += '<img class="popover-sprite" src="' + escapeHtml(iconUrl(speciesId)) + '" alt="" />';
      html += '<div class="popover-copy">';
      html += '<strong>' + escapeHtml(displayName) + '</strong>';
      html += '<span>#' + String(speciesId).padStart(3, '0') + ' ' + escapeHtml(speciesName) + ' / Lv.' + stats.level + '</span>';
      html += '<span>Project ' + escapeHtml(assigned) + '</span>';
      html += '</div>';
      html += '</div>';
      html += '</article>';
    });
    els.ownedList.innerHTML = html;
  }

  function renderAgents(agents) {
    var sorted = agents.slice().sort(function (a, b) {
      if (!!b.isActive !== !!a.isActive) return b.isActive ? 1 : -1;
      return Number(b.lastSeen || b.createdAt || 0) - Number(a.lastSeen || a.createdAt || 0);
    });
    els.agentCount.textContent = String(agents.length);

    if (sorted.length === 0) {
      els.agentList.innerHTML = '<div class="panel-empty">No agents yet</div>';
      return;
    }

    var html = '';
    sorted.slice(0, AGENT_LIMIT).forEach(function (agent) {
      var level = agentLevel(agent);
      var hp = contextStats(agent);
      var pokemonId = pokemonIdForAgent(agent);
      var pokemonLabel = pokemonNumberLabel(pokemonId);
      var name = agentName(agent);
      var model = compactModelName(agent.model, agent.provider);
      var status = titleCase(agent.status || agent.activity || 'active');
      var stateLabel = agentStateLabel(agent);
      var className = 'agent-row' + agentStateClass(agent);
      if (agent.isSleeping) className += ' sleeping';
      if (agent.parentId) className += ' subagent';

      html += '<article class="' + className + '" tabindex="0">';
      html += '<span class="agent-row-sprite"><img class="agent-row-icon" src="' + escapeHtml(agentIconUrl(agent, pokemonId)) + '" alt="" /></span>';
      html += '<span class="agent-row-name" title="' + escapeHtml(name) + '">' + escapeHtml(name) + '</span>';
      html += '<span class="agent-row-metrics">';
      html += '<span class="agent-row-level">Lv.' + level.level + '</span>';
      html += '<span class="agent-row-hp-label">HP</span>';
      html += '<span class="agent-row-hp" style="--hp:' + hp.pct.toFixed(1) + '%;--hp-color:' + hp.color + '"><span></span></span>';
      html += '<span class="agent-row-hp-pct">' + hp.label + '</span>';
      html += '</span>';
      html += '<span class="agent-row-actions">';
      html += '<span class="agent-row-state">' + escapeHtml(stateLabel) + '</span>';
      html += '<button class="agent-row-archive" type="button" data-agent-action="archive" data-agent-id="' + escapeHtml(agent.agentId) + '" title="Archive agent" aria-label="Archive agent">Archive</button>';
      html += '</span>';
      html += '<div class="row-popover">';
      html += '<div class="popover-figure">';
      html += '<img class="popover-sprite" src="' + escapeHtml(agentIconUrl(agent, pokemonId)) + '" alt="" />';
      html += '<span class="popover-pokemon-label">' + escapeHtml(pokemonLabel) + '</span>';
      html += '</div>';
      html += '<div class="popover-copy">';
      html += '<strong>' + escapeHtml(truncate(name, 54)) + '</strong>';
      html += '<span>' + escapeHtml(model) + ' / ' + escapeHtml(status) + ' / ' + escapeHtml(stateLabel) + '</span>';
      html += meterHtml('HP', hp.pct, hp.color, hp.label + ' ' + contextTokenLabel(hp));
      html += meterHtml('EXP', level.progress, '#f0b35c', Math.round(level.progress) + '%');
      html += '<span>Lv.' + level.level + ' / Tokens ' + formatNumber(level.totalTokens) + '</span>';
      html += '<span>Project ' + escapeHtml(shortProjectName(agent.projectId)) + '</span>';
      html += '<span>Seen ' + escapeHtml(formatAge(agent.lastSeen || agent.createdAt)) + '</span>';
      if (agent.lastCommand) {
        html += '<span>Cmd ' + escapeHtml(truncate(agent.lastCommand, 64)) + '</span>';
      }
      html += '</div>';
      html += '</div>';
      html += '</article>';
    });
    els.agentList.innerHTML = html;
  }

  function archiveAgent(agentId) {
    if (!agentId) return Promise.resolve();
    return fetch('/api/box/' + encodeURIComponent(agentId), { method: 'POST' })
      .then(function (res) {
        if (!res.ok) throw new Error('archive failed');
        return loadState();
      })
      .catch(function () {
        setConnection('offline');
      });
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
    var owned = Array.isArray(snapshot.ownedPokemon) ? snapshot.ownedPokemon.slice() : [];
    var activeCount = Number(snapshot.activeAgentCount);
    if (!Number.isFinite(activeCount)) {
      activeCount = agents.filter(function (agent) { return agent && agent.isActive; }).length;
    }
    var counts = countByStatus(agents);
    var source = snapshot.config && snapshot.config.source ? snapshot.config.source : 'all';

    els.sourcePill.textContent = source;
    els.activeCount.textContent = String(activeCount);
    els.thinkingCount.textContent = String(counts.thinking);
    els.toolCount.textContent = String(counts.tool);
    els.waitingCount.textContent = String(counts.waiting);
    els.sleepingCount.textContent = String(counts.sleeping);
    els.lastUpdate.textContent = 'updated ' + formatTime(snapshot.lastUpdate || snapshot.now);

    renderRateLimits(snapshot);
    renderOwned(owned);
    renderAgents(agents);
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
    if (els.languageMenuButton) {
      els.languageMenuButton.addEventListener('click', function (event) {
        event.stopPropagation();
        setLanguageMenu(!languageMenuOpen);
      });
    }

    if (els.languageOptions) {
      els.languageOptions.addEventListener('click', function (event) {
        var option = event.target.closest('[data-language-option]');
        if (!option) return;
        event.preventDefault();
        event.stopPropagation();
        setNameLanguage(option.getAttribute('data-language-option'));
      });
    }

    document.addEventListener('click', function () {
      if (languageMenuOpen) setLanguageMenu(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && languageMenuOpen) setLanguageMenu(false);
    });

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

    els.agentList.addEventListener('click', function (event) {
      var button = event.target.closest('[data-agent-action="archive"]');
      if (!button) return;
      event.preventDefault();
      event.stopPropagation();
      button.disabled = true;
      archiveAgent(button.getAttribute('data-agent-id')).then(function () {
        button.disabled = false;
      });
    });
  }

  wireControls();
  updateLanguageToggle();
  setConnection('connecting');
  loadPokemonNames();
  loadState();
  connectEvents();
  pollTimer = setInterval(loadState, 10000);

  window.addEventListener('pagehide', function () {
    if (eventStream) eventStream.close();
    if (pollTimer) clearInterval(pollTimer);
  });
})();
