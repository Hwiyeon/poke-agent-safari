'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const MOCK_RATE_LIMITS_BY_PROVIDER = Object.freeze({
  claude: Object.freeze({
    five_hour: Object.freeze({ used_percentage: 22, resets_at: null }),
    seven_day: Object.freeze({ used_percentage: 47, resets_at: null })
  }),
  codex: Object.freeze({
    five_hour: Object.freeze({ used_percentage: 9, resets_at: null }),
    seven_day: Object.freeze({ used_percentage: 18, resets_at: null })
  })
});

function readRateLimits(options = {}) {
  const homeDir = options.homeDir || os.homedir();
  try {
    const metaPath = path.join(homeDir, '.claude', 'context_meta', '_rate_limits.json');
    return JSON.parse(fs.readFileSync(metaPath, 'utf8')).rate_limits || null;
  } catch (_) {
    return null;
  }
}

function sourceIncludes(source, provider) {
  const normalized = String(source || 'claude').toLowerCase();
  return normalized === 'all' || normalized === provider;
}

function cloneRateLimitsByProvider(rateLimitsByProvider) {
  const out = {};
  if (!rateLimitsByProvider || typeof rateLimitsByProvider !== 'object') {
    return out;
  }

  for (const provider of ['claude', 'codex']) {
    const rateLimits = rateLimitsByProvider[provider];
    if (rateLimits && typeof rateLimits === 'object') {
      out[provider] = rateLimits;
    }
  }
  return out;
}

function assignLegacyRateLimits(rateLimitsByProvider, source, rateLimits) {
  if (!rateLimits) return;
  const normalized = String(source || 'claude').toLowerCase();
  if (normalized === 'codex') {
    rateLimitsByProvider.codex = rateLimitsByProvider.codex || rateLimits;
  } else if (normalized === 'claude') {
    rateLimitsByProvider.claude = rateLimitsByProvider.claude || rateLimits;
  } else if (normalized === 'all') {
    rateLimitsByProvider.codex = rateLimitsByProvider.codex || rateLimits;
  } else if (!rateLimitsByProvider.codex && !rateLimitsByProvider.claude) {
    rateLimitsByProvider.codex = rateLimits;
  }
}

function selectRateLimitsForSource(source, rateLimitsByProvider, fallbackRateLimits) {
  const normalized = String(source || 'claude').toLowerCase();
  if (normalized === 'codex') return rateLimitsByProvider.codex || fallbackRateLimits || null;
  if (normalized === 'claude') return rateLimitsByProvider.claude || fallbackRateLimits || null;
  if (normalized === 'all') {
    return rateLimitsByProvider.claude || rateLimitsByProvider.codex || fallbackRateLimits || null;
  }
  return fallbackRateLimits || null;
}

function assignMockRateLimits(rateLimitsByProvider) {
  if (rateLimitsByProvider.claude || rateLimitsByProvider.codex) {
    return;
  }
  rateLimitsByProvider.claude = MOCK_RATE_LIMITS_BY_PROVIDER.claude;
  rateLimitsByProvider.codex = MOCK_RATE_LIMITS_BY_PROVIDER.codex;
}

function buildPublicSnapshot(state, publicConfig = {}, options = {}) {
  const config = {
    mode: publicConfig.mode || (publicConfig.isMockMode ? 'mock' : 'watch'),
    source: publicConfig.source || (publicConfig.isMockMode ? 'mock' : 'claude'),
    enablePokeapiSprites: !!publicConfig.enablePokeapiSprites,
    isMockMode: !!publicConfig.isMockMode,
    supportsHardReset: !!publicConfig.supportsHardReset
  };
  const stateSnapshot = state.snapshot();
  const stateRateLimits = options.rateLimits === undefined
    ? (state.rateLimits || stateSnapshot.rateLimits || null)
    : options.rateLimits;
  const rateLimitsByProvider = options.rateLimitsByProvider === undefined
    ? cloneRateLimitsByProvider(state.rateLimitsByProvider || stateSnapshot.rateLimitsByProvider)
    : cloneRateLimitsByProvider(options.rateLimitsByProvider);

  assignLegacyRateLimits(rateLimitsByProvider, config.source, stateRateLimits);
  if (config.isMockMode && !stateRateLimits) {
    assignMockRateLimits(rateLimitsByProvider);
  }

  if (sourceIncludes(config.source, 'claude')) {
    const claudeRateLimits = options.claudeRateLimits === undefined
      ? readRateLimits(options)
      : options.claudeRateLimits;
    if (claudeRateLimits) {
      rateLimitsByProvider.claude = claudeRateLimits;
    }
  }

  const rateLimits = options.rateLimits === undefined
    ? selectRateLimitsForSource(config.source, rateLimitsByProvider, stateRateLimits)
    : stateRateLimits;

  return {
    ...stateSnapshot,
    rateLimits,
    rateLimitsByProvider,
    config
  };
}

module.exports = {
  readRateLimits,
  buildPublicSnapshot
};
