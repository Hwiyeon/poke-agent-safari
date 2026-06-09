'use strict';

const { buildPublicSnapshot } = require('../../snapshotPayload');

function createWebviewBridge(options = {}) {
  const state = options.state;
  const publicConfig = options.publicConfig || {};
  const panels = new Set();
  const readiness = new Map();

  function postState(panel) {
    if (!readiness.get(panel)) return;
    panel.webview.postMessage({
      type: 'state',
      snapshot: buildPublicSnapshot(state, publicConfig)
    });
  }

  function broadcastState() {
    for (const panel of panels) {
      postState(panel);
    }
  }

  function handleWarning(message) {
    for (const panel of panels) {
      if (!readiness.get(panel)) continue;
      panel.webview.postMessage({
        type: 'toast',
        level: 'warn',
        text: String(message)
      });
    }
    if (typeof options.onWarning === 'function') {
      options.onWarning(String(message));
    }
  }

  const onStateUpdate = () => broadcastState();
  state.on('update', onStateUpdate);

  let watcherWarnHandler = null;
  if (options.watcher && typeof options.watcher.on === 'function') {
    watcherWarnHandler = (message) => handleWarning(message);
    options.watcher.on('warn', watcherWarnHandler);
  }

  function detach(panel) {
    panels.delete(panel);
    readiness.delete(panel);
  }

  return {
    attach(panel) {
      panels.add(panel);
      readiness.set(panel, false);

      const receiveDisposable = panel.webview.onDidReceiveMessage((message) => {
        if (!message || typeof message.type !== 'string') return;

        let actionResult = null;
        switch (message.type) {
          case 'ready':
            readiness.set(panel, true);
            postState(panel);
            break;
          case 'box':
            if (typeof message.id === 'string') actionResult = { ok: !!state.manualBox(message.id) };
            break;
          case 'unbox':
            if (typeof message.id === 'string') actionResult = { ok: !!state.manualUnbox(message.id) };
            break;
          case 'owned':
            if (message.action === 'adopt') {
              actionResult = state.adoptOwnedPokemon(message.payload || {});
            } else if (message.action === 'nickname' && message.payload) {
              actionResult = state.setOwnedPokemonNickname(message.payload.id, message.payload.nickname);
            } else if (message.action === 'party' && message.payload) {
              if (message.payload.inParty === false) {
                actionResult = state.removeOwnedPokemonFromParty(message.payload.id);
              } else {
                actionResult = state.setOwnedPokemonParty(message.payload.id, message.payload.slot);
              }
            } else if (message.action === 'box' && message.payload) {
              actionResult = state.removeOwnedPokemonFromParty(message.payload.id);
            } else if (message.action === 'assignProject' && message.payload) {
              actionResult = state.assignProjectTraining(message.payload.id, message.payload.projectId);
            } else if (message.action === 'evolve' && message.payload) {
              actionResult = state.evolveOwnedPokemon(message.payload.id, message.payload);
            } else if (message.action === 'holdEvolution' && message.payload) {
              actionResult = state.setOwnedPokemonEvolutionHold(message.payload.id, message.payload.held);
            } else if (message.action === 'release' && message.payload) {
              actionResult = state.releaseOwnedPokemon(message.payload.id);
            }
            break;
          case 'items':
            if (message.action === 'pickup') {
              actionResult = state.setEvolutionPickupItem(message.payload && message.payload.itemId);
            } else if (message.action === 'pull') {
              actionResult = state.pullEvolutionItem(message.payload || {});
            } else if (message.action === 'buy' && message.payload) {
              actionResult = state.buyEvolutionItem(message.payload.itemId, message.payload.currency);
            } else if (message.action === 'sell' && message.payload) {
              actionResult = state.sellEvolutionItem(message.payload.itemId);
            } else if (message.action === 'use-ticket' && message.payload) {
              actionResult = state.useRecruitTicketItem(message.payload.itemId);
            }
            break;
          case 'pokedex':
            if (message.action === 'claim' && message.payload) {
              actionResult = state.claimPokedexReward(message.payload.rewardType || message.payload.type, message.payload.id || message.payload.rewardId);
            }
            break;
          case 'explorationArea':
            actionResult = state.setExplorationArea(message.areaId);
            break;
          case 'hardReset':
            if (typeof options.onHardReset === 'function') options.onHardReset();
            actionResult = { ok: true };
            break;
          default:
            break;
        }
        if (message.requestId) {
          panel.webview.postMessage({
            type: 'actionResult',
            requestId: message.requestId,
            result: actionResult || { ok: false, error: 'Unknown action.' }
          });
        }
      });

      const disposeDisposable = panel.onDidDispose(() => {
        detach(panel);
      });

      return {
        dispose() {
          receiveDisposable.dispose();
          disposeDisposable.dispose();
          detach(panel);
        }
      };
    },

    dispose() {
      state.off('update', onStateUpdate);
      if (options.watcher && watcherWarnHandler && typeof options.watcher.off === 'function') {
        options.watcher.off('warn', watcherWarnHandler);
      }
      panels.clear();
      readiness.clear();
    }
  };
}

module.exports = {
  createWebviewBridge
};
