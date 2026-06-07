'use strict';

(function () {
  var POKEDEX_MIN = 1;
  var POKEDEX_MAX = 649;
  var POKEDEX_TOTAL = POKEDEX_MAX - POKEDEX_MIN + 1;
  var PARTY_LIMIT = 6;
  var LANGUAGE_STORAGE_KEY = 'agent-safari-name-language';
  var LEGACY_LANGUAGE_STORAGE_KEY = 'agent-safari-sticker-name-language';
  var TIER_IDS = [1, 2, 3, 4, 5];
  var TIER_WEIGHTS = { 1: 40, 2: 25, 3: 15, 4: 5, 5: 1 };

  var snapshot = null;
  var eventStream = null;
  var pollTimer = null;
  var connectionStatus = 'connecting';
  var pokemonNames = {};
  var pokemonKoNames = {};
  var pokemonPool = [];
  var pokemonTierPools = {};
  var pokemonPoolReady = false;
  var evolutionPaths = {};
  var nameLanguage = readStoredNameLanguage();
  var languageMenuOpen = false;

  var els = {
    sourcePill: document.getElementById('source-pill'),
    languageMenuButton: document.getElementById('language-menu-button'),
    languageOptions: document.getElementById('language-options'),
    activeCount: document.getElementById('active-count'),
    rateLimitList: document.getElementById('rate-limit-list'),
    currentPoints: document.getElementById('sticker-current-points'),
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

  var TEXT = {
    en: {
      uiLanguage: 'UI language',
      uiLanguageEnglish: 'UI language: English',
      uiLanguageKorean: 'UI language: Korean',
      openDashboard: 'Open dashboard',
      minimize: 'Minimize',
      quit: 'Quit',
      usageBudgets: 'Usage budgets',
      all: 'All',
      myPokemonParty: 'My Pokemon party',
      myPokemonCompact: 'MY POKEMON',
      currentPoints: 'Current points',
      agents: 'Agents',
      agentStatusCounts: 'Agent status counts',
      statusActive: 'active',
      statusThinking: 'thinking',
      statusTool: 'tool',
      statusWaiting: 'waiting',
      statusSleeping: 'sleeping',
      statusIdle: 'idle',
      connecting: 'connecting',
      online: 'online',
      offline: 'offline',
      unknown: 'unknown',
      pokemon: 'Pokemon',
      waitingForActivity: 'Waiting for activity',
      unnamedAgent: 'Unnamed agent',
      noBudgetData: 'No budget data yet',
      noPartyPokemon: 'No party Pokemon yet',
      noAgentsYet: 'No agents yet',
      project: 'Project',
      unassigned: 'unassigned',
      tokens: 'Tokens',
      seen: 'Seen',
      archive: 'Archive',
      archiveAgent: 'Archive agent',
      updatedAt: 'updated {time}',
      codexBudget: 'Codex Budget',
      claudeBudget: 'Claude Budget',
      budget: 'Budget',
      rateNoData: '{provider} {period}: no data',
      rateRemaining: '{provider} {period}: {remaining}% remaining',
      rateLeft: '{time} left',
      rateResets: 'resets {time}'
    },
    ko: {
      uiLanguage: 'UI 언어',
      uiLanguageEnglish: 'UI 언어: 영어',
      uiLanguageKorean: 'UI 언어: 한국어',
      openDashboard: '대시보드 열기',
      minimize: '최소화',
      quit: '종료',
      usageBudgets: 'Usage budgets',
      all: '전체',
      myPokemonParty: '내 포켓몬 파티',
      myPokemonCompact: '내 포켓몬',
      agents: 'Agents',
      agentStatusCounts: 'Agent status counts',
      statusActive: 'active',
      statusThinking: 'thinking',
      statusTool: 'tool',
      statusWaiting: 'waiting',
      statusSleeping: 'sleeping',
      statusIdle: 'idle',
      connecting: '연결 중',
      online: '온라인',
      offline: '오프라인',
      unknown: '미확인',
      pokemon: '포켓몬',
      waitingForActivity: 'Waiting for activity',
      unnamedAgent: 'Unnamed agent',
      noBudgetData: 'No budget data yet',
      noPartyPokemon: '아직 파티 포켓몬이 없습니다',
      noAgentsYet: 'No agents yet',
      project: 'Project',
      unassigned: '미지정',
      tokens: 'Tokens',
      seen: 'Seen',
      archive: 'Archive',
      archiveAgent: 'Archive agent',
      updatedAt: '{time} 업데이트',
      codexBudget: 'Codex Budget',
      claudeBudget: 'Claude Budget',
      budget: 'Budget',
      rateNoData: '{provider} {period}: 데이터 없음',
      rateRemaining: '{provider} {period}: {remaining}% 남음',
      rateLeft: '{time} 남음',
      rateResets: '{time} 리셋'
    }
  };

  function currentLanguage() {
    return nameLanguage === 'ko' ? 'ko' : 'en';
  }

  function t(key, params) {
    var dict = TEXT[currentLanguage()] || TEXT.en;
    var text = Object.prototype.hasOwnProperty.call(dict, key) ? dict[key] : TEXT.en[key];
    if (text === undefined) return key;
    return String(text).replace(/\{([a-zA-Z0-9_]+)\}/g, function (_, name) {
      return params && params[name] !== undefined ? String(params[name]) : '';
    });
  }

  function applyStaticTranslations(root) {
    var host = root || document;
    Array.prototype.forEach.call(host.querySelectorAll('[data-i18n]'), function (node) {
      node.textContent = t(node.getAttribute('data-i18n'));
    });
    Array.prototype.forEach.call(host.querySelectorAll('[data-i18n-aria]'), function (node) {
      node.setAttribute('aria-label', t(node.getAttribute('data-i18n-aria')));
    });
    Array.prototype.forEach.call(host.querySelectorAll('[data-i18n-title]'), function (node) {
      node.setAttribute('title', t(node.getAttribute('data-i18n-title')));
    });
  }

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

  function pickPokemonFromTierPools(agentId, tierPools) {
    var speciesPoolsByTier = {};
    var effectiveWeights = {};
    for (var i = 0; i < TIER_IDS.length; i += 1) {
      var tier = TIER_IDS[i];
      var speciesPool = tierPools && tierPools[tier];
      speciesPoolsByTier[tier] = Array.isArray(speciesPool) ? speciesPool : [];
      effectiveWeights[tier] = speciesPoolsByTier[tier].length > 0 ? TIER_WEIGHTS[tier] || 1 : 0;
    }

    for (var missingIndex = 0; missingIndex < TIER_IDS.length; missingIndex += 1) {
      var missingTier = TIER_IDS[missingIndex];
      if (speciesPoolsByTier[missingTier].length > 0) continue;
      var missingWeight = TIER_WEIGHTS[missingTier] || 1;
      for (var lowerTier = missingTier - 1; lowerTier >= 1; lowerTier -= 1) {
        if (speciesPoolsByTier[lowerTier] && speciesPoolsByTier[lowerTier].length > 0) {
          effectiveWeights[lowerTier] += missingWeight;
          break;
        }
      }
    }

    var entries = [];
    for (var entryIndex = 0; entryIndex < TIER_IDS.length; entryIndex += 1) {
      var entryTier = TIER_IDS[entryIndex];
      if (speciesPoolsByTier[entryTier].length === 0 || effectiveWeights[entryTier] <= 0) continue;
      entries.push({
        tier: entryTier,
        speciesPool: speciesPoolsByTier[entryTier],
        weight: effectiveWeights[entryTier]
      });
    }
    if (entries.length === 0) return null;

    var totalWeight = 0;
    for (var j = 0; j < entries.length; j += 1) totalWeight += entries[j].weight;
    var roll = hashCode(String(agentId) + ':tier') % totalWeight;
    var selected = entries[entries.length - 1];
    for (var k = 0; k < entries.length; k += 1) {
      if (roll < entries[k].weight) {
        selected = entries[k];
        break;
      }
      roll -= entries[k].weight;
    }

    var speciesIndex = hashCode(String(agentId) + ':species:' + selected.tier) % selected.speciesPool.length;
    return selected.speciesPool[speciesIndex];
  }

  function fallbackPokemonIdForAgentId(agentId) {
    if (!agentId) return POKEDEX_MIN;
    if (pokemonPoolReady && pokemonPool.length > 0) {
      return pickPokemonFromTierPools(agentId, pokemonTierPools) || pokemonPool[hashCode(agentId) % pokemonPool.length];
    }
    return (hashCode(agentId) % POKEDEX_TOTAL) + POKEDEX_MIN;
  }

  function pickHistoricalAgent(candidates, beforeTs) {
    if (!candidates || candidates.length === 0) return null;
    var cutoff = typeof beforeTs === 'number' ? beforeTs : Infinity;
    var best = null;
    var bestCreatedAt = -Infinity;

    for (var i = 0; i < candidates.length; i += 1) {
      var candidate = candidates[i];
      if (!candidate) continue;
      var createdAt = typeof candidate.createdAt === 'number' ? candidate.createdAt : -Infinity;
      if (createdAt > cutoff) continue;
      if (!best || createdAt >= bestCreatedAt) {
        best = candidate;
        bestCreatedAt = createdAt;
      }
    }

    if (best) return best;

    for (var j = 0; j < candidates.length; j += 1) {
      var fallback = candidates[j];
      if (!fallback) continue;
      var fallbackCreatedAt = typeof fallback.createdAt === 'number' ? fallback.createdAt : -Infinity;
      if (!best || fallbackCreatedAt >= bestCreatedAt) {
        best = fallback;
        bestCreatedAt = fallbackCreatedAt;
      }
    }

    return best;
  }

  function findSnapshotAgentById(agentId, beforeTs) {
    if (!agentId || !snapshot) return null;
    var candidates = [];
    ['agents', 'boxedAgents', 'subagentHistory'].forEach(function (key) {
      var list = Array.isArray(snapshot[key]) ? snapshot[key] : [];
      for (var i = list.length - 1; i >= 0; i -= 1) {
        if (list[i] && list[i].agentId === agentId) candidates.push(list[i]);
      }
    });
    return pickHistoricalAgent(candidates, beforeTs);
  }

  function getEvolutionPath(pokemonId) {
    var normalizedId = Number(pokemonId);
    var path = evolutionPaths[String(normalizedId)] || evolutionPaths[normalizedId];
    return Array.isArray(path) && path.length > 0 ? path : [normalizedId];
  }

  function pokemonIdForAgent(agent, seen) {
    var rendered = Number(agent && agent.renderedPokemonId);
    if (Number.isInteger(rendered) && rendered >= POKEDEX_MIN && rendered <= POKEDEX_MAX) {
      return rendered;
    }
    if (agent && agent.forcedPokemonId) {
      return agent.forcedPokemonId;
    }
    if (!agent || !agent.agentId) return POKEDEX_MIN;
    if (!agent.parentId) return fallbackPokemonIdForAgentId(agent.agentId);

    var visiting = seen || {};
    if (visiting[agent.agentId]) return fallbackPokemonIdForAgentId(agent.agentId);
    visiting[agent.agentId] = true;

    var parentAgent = findSnapshotAgentById(agent.parentId, agent.createdAt);
    var parentPokemonId = parentAgent
      ? pokemonIdForAgent(parentAgent, visiting)
      : fallbackPokemonIdForAgentId(agent.parentId);
    var candidates = getEvolutionPath(parentPokemonId);
    return candidates[hashCode(agent.agentId) % candidates.length];
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
      return 'en';
    }
    return 'en';
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
    var title = isEnglish ? t('uiLanguageEnglish') : t('uiLanguageKorean');
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
    applyStaticTranslations();
    updateLanguageToggle();
    setConnection(connectionStatus);
    if (snapshot) render(snapshot);
  }

  function formatPokemonName(name) {
    if (!name) return t('unknown');
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
    var fallback = t('pokemon') + ' #' + String(id || POKEDEX_MIN).padStart(3, '0');
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
    if (!pokemon) return t('pokemon');
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
        var pool = [];
        var tierPools = {};
        list.forEach(function (pokemon) {
          var id = Number(pokemon && pokemon.pokemon_id);
          if (!Number.isInteger(id)) return;
          if (pokemon.name) pokemonNames[id] = formatPokemonName(pokemon.name);
          if (pokemon.name_ko) pokemonKoNames[id] = pokemon.name_ko;
          if (id >= POKEDEX_MIN && id <= POKEDEX_MAX) {
            var tier = Number.isInteger(pokemon.final_tier) && pokemon.final_tier >= 1 && pokemon.final_tier <= 5
              ? pokemon.final_tier
              : 1;
            var weight = TIER_WEIGHTS[tier] || 1;
            if (!tierPools[tier]) tierPools[tier] = [];
            tierPools[tier].push(id);
            for (var i = 0; i < weight; i += 1) {
              pool.push(id);
            }
          }
        });
        pokemonPool = pool;
        pokemonTierPools = tierPools;
        pokemonPoolReady = pool.length > 0;
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

    var evolution = fetch(dataUrl('evolution_paths.json'), { cache: 'no-cache' })
      .then(function (res) {
        if (!res.ok) throw new Error('evolution paths failed');
        return res.json();
      })
      .then(function (data) {
        evolutionPaths = data && data.paths && typeof data.paths === 'object' ? data.paths : {};
      })
      .catch(function () {});

    Promise.all([english, korean, evolution]).then(function () {
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

  function formatPointCount(value) {
    var num = Number(value);
    if (!Number.isFinite(num) || num <= 0) return '0';
    return Math.round(num).toLocaleString(currentLanguage() === 'ko' ? 'ko-KR' : 'en-US');
  }

  function formatTime(ts) {
    var num = Number(ts);
    if (!Number.isFinite(num) || num <= 0) return '--';
    return new Date(num).toLocaleTimeString(currentLanguage() === 'ko' ? 'ko-KR' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  function formatAge(ts) {
    var num = Number(ts);
    if (!Number.isFinite(num) || num <= 0) return '--';
    var seconds = Math.max(0, Math.floor((Date.now() - num) / 1000));
    if (seconds < 60) return currentLanguage() === 'ko' ? seconds + '초 전' : seconds + 's ago';
    var minutes = Math.floor(seconds / 60);
    if (minutes < 60) return currentLanguage() === 'ko' ? minutes + '분 전' : minutes + 'm ago';
    var hours = Math.floor(minutes / 60);
    if (hours < 48) return currentLanguage() === 'ko' ? hours + '시간 전' : hours + 'h ago';
    var days = Math.floor(hours / 24);
    return currentLanguage() === 'ko' ? days + '일 전' : days + 'd ago';
  }

  function titleCase(raw) {
    var text = String(raw || '').replace(/[_-]+/g, ' ').trim();
    if (!text) return t('unknown');
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  function compactModelName(model, provider) {
    var text = String(model || '').trim();
    if (!text) {
      return titleCase(provider || t('unknown'));
    }
    text = text
      .replace(/^claude[-_]/i, '')
      .replace(/^openai[-_]/i, '')
      .replace(/^gpt[-_]/i, 'GPT ')
      .replace(/[-_]20\d{6,}$/i, '')
      .replace(/[-_](latest|preview)$/i, '')
      .replace(/[-_]+/g, ' ')
      .trim();
    return text ? titleCase(text) : titleCase(provider || t('unknown'));
  }

  function shortProjectName(projectId) {
    if (!projectId) return t('unknown');
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
    if (!agent) return t('waitingForActivity');
    return agent.displayName || agent.name || agent.subagentType || agent.agentId || t('unnamedAgent');
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
    if (agent && agent.isSleeping) return t('statusSleeping');
    if (agent && agent.isActive) return t('statusActive');
    return localizedStatusText((agent && (agent.status || agent.activity)) || 'idle');
  }

  function localizedStatusText(raw) {
    var normalized = String(raw || '').toLowerCase().replace(/[_-]+/g, ' ').trim();
    if (normalized === 'active') return t('statusActive');
    if (normalized === 'thinking') return t('statusThinking');
    if (normalized === 'tool' || normalized === 'tool running' || normalized === 'tool use' || normalized === 'tooling') return t('statusTool');
    if (normalized === 'waiting') return t('statusWaiting');
    if (normalized === 'sleeping') return t('statusSleeping');
    if (normalized === 'idle') return t('statusIdle');
    return normalized || t('unknown');
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
    return d.toLocaleString(currentLanguage() === 'ko' ? 'ko-KR' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function rateLimitProviderLabel(provider) {
    if (provider === 'codex') return t('codexBudget');
    if (provider === 'claude') return t('claudeBudget');
    return t('budget');
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
    var tooltip = t('rateNoData', { provider: providerLabel, period: periodLabel });

    if (hasValue) {
      tooltip = t('rateRemaining', { provider: providerLabel, period: periodLabel, remaining: remain.toFixed(1) });
      tooltip += resetKind === 'remaining'
        ? ' / ' + t('rateLeft', { time: formatRemainingShort(rateLimit.resets_at) })
        : ' / ' + t('rateResets', { time: formatResetAtShort(rateLimit.resets_at) });
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
      els.rateLimitList.innerHTML = '<div class="panel-empty">' + escapeHtml(t('noBudgetData')) + '</div>';
      return;
    }
    els.rateLimitList.innerHTML = entries.map(rateLimitProviderHtml).join('');
  }

  function renderOwned(owned) {
    var party = owned.filter(function (pokemon) {
      return pokemon && Number.isInteger(pokemon.partySlot);
    }).sort(function (a, b) {
      if (a.partySlot !== b.partySlot) return a.partySlot - b.partySlot;
      return Number(b.updatedAt || b.createdAt || 0) - Number(a.updatedAt || a.createdAt || 0);
    });
    els.ownedCount.textContent = String(Math.min(party.length, PARTY_LIMIT));

    if (party.length === 0) {
      els.ownedList.innerHTML = '<div class="panel-empty">' + escapeHtml(t('noPartyPokemon')) + '</div>';
      return;
    }

    var html = '';
    party.slice(0, PARTY_LIMIT).forEach(function (pokemon) {
      var stats = ownedLevel(pokemon);
      var speciesId = Number(pokemon.speciesId) || POKEDEX_MIN;
      var displayName = ownedDisplayName(pokemon);
      var speciesName = pokemonDisplayName(speciesId);
      var assigned = pokemon.assignedProjectId ? shortProjectName(pokemon.assignedProjectId) : t('unassigned');
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
      html += '<span>' + escapeHtml(t('project')) + ' ' + escapeHtml(assigned) + '</span>';
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
      els.agentList.innerHTML = '<div class="panel-empty">' + escapeHtml(t('noAgentsYet')) + '</div>';
      return;
    }

    var html = '';
    sorted.forEach(function (agent) {
      var level = agentLevel(agent);
      var hp = contextStats(agent);
      var pokemonId = pokemonIdForAgent(agent);
      var pokemonLabel = pokemonNumberLabel(pokemonId);
      var name = agentName(agent);
      var model = compactModelName(agent.model, agent.provider);
      var status = localizedStatusText(agent.status || agent.activity || 'active');
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
      html += '<button class="agent-row-archive" type="button" data-agent-action="archive" data-agent-id="' + escapeHtml(agent.agentId) + '" title="' + escapeHtml(t('archiveAgent')) + '" aria-label="' + escapeHtml(t('archiveAgent')) + '">' + escapeHtml(t('archive')) + '</button>';
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
      html += '<span>Lv.' + level.level + ' / ' + escapeHtml(t('tokens')) + ' ' + formatNumber(level.totalTokens) + '</span>';
      html += '<span>' + escapeHtml(t('project')) + ' ' + escapeHtml(shortProjectName(agent.projectId)) + '</span>';
      html += '<span>' + escapeHtml(t('seen')) + ' ' + escapeHtml(formatAge(agent.lastSeen || agent.createdAt)) + '</span>';
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
    connectionStatus = status || 'connecting';
    els.connectionState.classList.remove('online', 'offline');
    if (status) els.connectionState.classList.add(status);
    els.connectionState.textContent = t(connectionStatus);
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

    els.sourcePill.textContent = source === 'all' ? t('all') : source;
    els.activeCount.textContent = String(activeCount);
    els.thinkingCount.textContent = String(counts.thinking);
    els.toolCount.textContent = String(counts.tool);
    els.waitingCount.textContent = String(counts.waiting);
    els.sleepingCount.textContent = String(counts.sleeping);
    els.lastUpdate.textContent = t('updatedAt', { time: formatTime(snapshot.lastUpdate || snapshot.now) });
    if (els.currentPoints) {
      var itemState = snapshot.evolutionItems || {};
      els.currentPoints.textContent = formatPointCount(itemState.itemPoints) + ' pts';
      els.currentPoints.setAttribute('title', t('currentPoints'));
    }

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
  applyStaticTranslations();
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
