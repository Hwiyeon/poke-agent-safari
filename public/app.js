(() => {
  'use strict';

  const __vscode = typeof acquireVsCodeApi === 'function' ? acquireVsCodeApi() : null;
  const __assetBase = (typeof window !== 'undefined' && window.__PAS_ASSET_BASE__) || '';
  const __dataBase = (typeof window !== 'undefined' && window.__PAS_DATA_BASE__) || '';
  const __itemBase = (typeof window !== 'undefined' && window.__PAS_ITEM_BASE__) || '';
  const LANGUAGE_STORAGE_KEY = 'agent-safari-name-language';
  const LEGACY_STICKER_LANGUAGE_STORAGE_KEY = 'agent-safari-sticker-name-language';

  function joinBase(base, leaf) {
    return String(base).replace(/\/+$/, '') + '/' + String(leaf).replace(/^\/+/, '');
  }

  function spriteUrl(kind, id, ext) {
    const leaf = kind + '/' + id + '.' + ext;
    return __assetBase ? joinBase(__assetBase, leaf) : ('/sprites/' + leaf);
  }

  function dataUrl(name) {
    return __dataBase ? joinBase(__dataBase, name) : ('/data/' + name);
  }

  function itemSpriteUrl(itemId) {
    const fileName = String(itemId || '') + '.png';
    return __itemBase ? joinBase(__itemBase, fileName) : ('/sprites/items/' + fileName);
  }

  function readStoredLanguage() {
    try {
      var shared = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (shared === 'ko' || shared === 'en') return shared;
      var legacy = localStorage.getItem(LEGACY_STICKER_LANGUAGE_STORAGE_KEY);
      if (legacy === 'ko' || legacy === 'en') return legacy;
    } catch (_) {}
    return 'en';
  }

  function storeLanguage(language) {
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
      localStorage.setItem(LEGACY_STICKER_LANGUAGE_STORAGE_KEY, language);
    } catch (_) {}
  }

  let activeUiLanguage = readStoredLanguage();

  const UI_TEXT = {
    en: {
      tagline: 'Live local activity from Claude Code and Codex transcripts',
      uiLanguage: 'UI language',
      uiLanguageEnglish: 'UI language: English',
      uiLanguageKorean: 'UI language: Korean',
      pokedex: 'Pokedex',
      pokedexTitle: 'Safari Pokedex',
      promoStudio: 'Promo Studio',
      promoStudioSubtitle: 'Custom scene builder',
      hardReset: 'Hard Reset',
      dashboardInfo: 'Dashboard info',
      active: 'Active',
      lastUpdate: 'Last Update',
      tokensUsed: 'Tokens Used',
      area: 'Area',
      allAreas: 'All Areas',
      unknownArea: 'Unknown Area',
      pokedexSort: 'Pokedex sort',
      pokedexSortNumber: 'Number',
      pokedexSortArea: 'Area',
      pokedexSortRarity: 'Rarity',
      pokedexEntries: 'Entries',
      pokedexRewards: 'Rewards',
      pokedexRewardsReady: '{count} ready',
      pokedexRewardStage: 'Reward stage {level}',
      pokedexRewardProgressFull: '{caught} caught out of {total}',
      pokedexFeaturedReward: 'Featured reward',
      pokedexNationalDex: 'National Dex',
      pokedexAreaDex: 'Area Dex',
      pokedexNextReward: 'Next reward',
      pokedexNoPendingReward: 'No pending reward',
      pokedexRewardReady: 'Ready',
      pokedexRewardClaimed: 'Claimed',
      pokedexRewardLocked: 'Locked',
      pokedexRewardClaim: 'Claim',
      pokedexRewardClaiming: 'Claiming...',
      pokedexCaughtMilestone: 'Caught {count}',
      pokedexSeenMilestone: 'Seen {count}',
      pokedexSeenPass: 'Encounter Pass',
      pokedexOwnedPass: 'Recruit Pass',
      pokedexTicketReward: '{ticket} recruit ticket x{count}',
      pokedexRecruitTicketCount: 'Recruit ticket x{count}',
      pokedexAreaMilestone: 'Lv.{level} - {percent}%',
      pokedexRewardProgress: '{caught} / {target} caught',
      pokedexSeenRewardProgress: '{seen} / {target} seen',
      pokedexAreaProgress: '{caught} / {total} caught',
      pokedexPointsReward: '+{points} pts',
      pokedexGlobalRadar: 'Global radar Lv.{level}',
      pokedexAreaBoost: 'Area boost',
      pokedexNotCaughtBoost: 'Uncaught spawn x{multiplier}',
      pokedexRareBoost: 'Rare boost Lv.{level}',
      pokedexBadgeReward: 'Badge: {badge}',
      pokedexClaimedReward: 'Claimed {reward}.',
      pokedexClaimResult: 'Pokedex Reward',
      pokedexRewardClaimFailed: 'Reward claim failed.',
      selectedArea: 'selected area',
      agentsOutsideArea: 'Agents outside {area}',
      myPokemon: 'My Pokemon',
      openMyPokemonDetails: 'Open My Pokemon details',
      myPokemonParty: 'My Pokemon party',
      ownedShort: '{count} owned',
      ownedPokemonCount: '{count} owned Pokemon',
      agents: 'Agents',
      noAgentsYet: 'No agents yet.',
      safariLog: 'Safari Log',
      viewAll: 'View All',
      close: 'Close',
      back: 'Back',
      useCustomScene: 'Use custom scene',
      addRoot: 'Add Root',
      reset: 'Reset',
      downloadPng: 'Download PNG',
      buildPromoScene: 'Build a custom promo-ready scene in mock mode.',
      party: 'Party',
      inventory: 'Inventory',
      itemRules: 'Item Rules',
      evolutionItemWallet: 'Evolution item wallet',
      itemPointProgress: 'Item point progress',
      evolutionItems: 'Evolution Items',
      recruitTickets: 'Recruit Tickets',
      points: 'Points',
      draw: 'Draw',
      target: 'Target',
      tickets: 'Tickets',
      use: 'Use',
      sell: 'Sell',
      nextPoint: 'Next point',
      claimTarget: 'Claim Target',
      pokemonBox: 'Pokemon Box',
      recruitPokemon: 'Recruit Pokemon',
      recruit: 'Recruit',
      recruitView: 'Recruit view',
      available: 'Available',
      action: 'Action',
      confirm: 'Confirm',
      yes: 'Yes',
      no: 'No',
      ok: 'OK',
      item: 'Item',
      currentPoints: 'Current points',
      plannedSpend: 'Planned spend',
      afterRecruit: 'After recruit',
      pokedexRegistered: 'Pokedex registered',
      newPokedexEntry: 'New Pokedex entry',
      before: 'Before',
      after: 'After',
      consumes: 'Consumes',
      actionFailed: 'Action failed.',
      itemRulesPoints: '{tokens} total tokens = 1 point. Cached input tokens count.',
      itemRulesDraw: 'Costs {cost} pts. Success rate is 30%; successful pulls are 80% items and 20% recruit tickets.',
      itemRulesTarget: 'Target only applies when a successful pull produces an evolution item.',
      itemRulesTickets: 'If a successful item pull misses the target item, target ticket +1. Spend {cost} tickets to claim the target.',
      itemRulesSell: 'Sell gives +{value} pts. Point buying is disabled.',
      itemRulesChanceTable: 'Draw chances',
      itemRulesReward: 'Reward',
      itemRulesChance: 'Chance',
      itemRulesChanceOpen: 'Open chance table',
      itemRulesFailure: 'No reward',
      itemRulesEvolutionItemReward: 'Evolution item',
      itemRulesEvolutionItemTotal: 'Evolution items total',
      itemRulesTicketReward: '{ticket} recruit ticket',
      itemRulesTargetMark: 'Target',
      noTarget: 'No target',
      noEvolutionItems: 'No evolution items available.',
      noDiscoveredPokemon: 'No discovered Pokemon available yet.',
      emptyPartySlot: 'Empty party slot',
      emptyPartySpot: 'Empty party spot',
      noBoxedPokemon: 'No boxed Pokemon yet.',
      itemCount: '{count} items',
      dragToArrange: 'Drag to arrange',
      boxedCount: '{count} boxed',
      discoveredCount: '{count} / {total} discovered',
      pokedexProgressFull: 'Seen {seen} / {total} | Caught {caught} / {total}',
      availableCount: '{count} available',
      availablePokedexCount: '{count} / {total} available',
      seen: 'seen',
      unseen: 'unseen',
      caught: 'caught',
      seenNotCaught: 'seen not caught',
      newEntryShort: 'new',
      firstCatchBonus: 'First catch bonus',
      catchReward: 'Catch reward',
      alreadyCaughtDiscount: 'Caught discount',
      pokedexStatus: 'Status',
      pokedexStatusAll: 'All',
      pokedexStatusUndiscovered: 'Undiscovered',
      pokedexStatusDiscovered: 'Discovered',
      pokedexStatusCaught: 'Caught',
      need: 'Need',
      spent: 'Spent',
      recruitCost: 'Recruit cost',
      drawResult: 'Draw Result',
      itemResult: 'Item Result',
      buyResult: 'Buy Result',
      claimResult: 'Claim Result',
      sellResult: 'Sell Result',
      evolutionResult: 'Evolution Result',
      recruitResult: 'Recruit Result',
      drawRequestSent: 'Draw request was sent.',
      requestSent: 'Request was sent.',
      noItemThisTime: 'No item this time.',
      youDrewItem: 'You drew {item}.',
      youDrewTicket: 'You drew a {ticket} recruit ticket.',
      boughtItem: 'Bought {item}.',
      claimedItem: 'Claimed {item}.',
      soldItem: 'Sold {item}. +{value} pts gained.',
      useTicketPrompt: 'Use {ticket} recruit ticket?',
      usedTicket: '{pokemon} joined from {ticket} recruit ticket.',
      ticketRecruitedPokemon: 'Recruited {pokemon}.',
      pointsEarned: '+{points} pts earned',
      evolutionRequestSent: 'Evolution request was sent.',
      evolvedInto: '{from} evolved into {to}.',
      evolved: '{from} evolved.',
      recruitPrompt: 'Recruit {pokemon} for {cost} pts?',
      recruitSpawnPrompt: 'Recruit {pokemon} (spawns in {area}) for {cost} pts?',
      recruitedPokemon: 'Recruited {pokemon}.',
      sellPrompt: 'Sell {item} for +{value} pts?',
      claimPrompt: 'Claim {item} for {cost} tickets?',
      evolvePrompt: 'Evolve {from} into {to}?',
      selectedEvolution: 'the selected evolution',
      releasePrompt: 'Release {pokemon} from My Pokemon?',
      thisPokemon: 'this Pokemon',
      nicknamePrompt: 'Pokemon nickname',
      hardResetPrompt: 'Reset {mode}{source} state, safari log, My Pokemon, evolution items, and discovered Pokedex progress?',
      promoResetPrompt: 'Reset the custom promo scene to the default starter setup?',
      hardResetFailed: 'hard reset failed: {status}',
      failedToLoadState: 'Failed to load state: {message}',
      noSafariRecords: 'No safari log records yet.',
      safariRecords: '{count} safari records',
      subagentHistory: 'Sub-agent History',
      noSubhistory: 'No boxed sub-agent history yet.',
      records: '{count} records',
      oneRecord: '1 record',
      parent: 'Parent',
      depth: 'Depth',
      live: 'Live',
      finished: 'Finished',
      tokens: 'Tokens',
      tools: 'Tools',
      started: 'Started',
      ended: 'Ended',
      lastSeen: 'Last seen',
      duration: 'Duration',
      project: 'Project',
      session: 'Session',
      lastCommand: 'Last command',
      lastActivity: 'Last Activity',
      lastTool: 'Last tool',
      toolsRun: 'Tools run',
      context: 'Context',
      visibleSubs: 'Visible subs',
      subagents: 'Sub-agents',
      subHistory: 'Sub history',
      openSubagentHistory: 'Open Sub-agent History',
      lastQuery: 'Last query',
      show: 'Show',
      hide: 'Hide',
      showSubagentHierarchy: 'Show sub-agent hierarchy',
      hideSubagentHierarchy: 'Hide sub-agent hierarchy',
      agentInfo: 'Agent Info',
      archiveInfo: 'Archive Info',
      trainerMemo: 'Trainer Memo',
      metInProjectAt: 'Met in {project} at {time}.',
      totalToken: 'Total token',
      type: 'Type',
      name: 'Name',
      model: 'Model',
      uptime: 'Uptime',
      id: 'ID',
      archive: 'Archive',
      restore: 'Restore',
      manuallyArchived: 'Manually archived - restores on next query',
      alreadyAdopted: 'Already adopted into My Pokemon',
      endedAt: 'Ended {time}',
      durationValue: 'Duration {duration}',
      subHistoryCount: 'Sub-history ({count})',
      recruitForPts: 'Recruit for {cost} pts',
      needPtsToRecruit: 'Need {cost} pts to recruit',
      adoptButton: 'Adopt ({cost} pts)',
      noProject: 'No project',
      unassigned: 'unassigned',
      training: 'Training',
      fromProject: 'From {project}',
      boxed: 'Boxed',
      box: 'Box',
      release: 'Release',
      holdEvo: 'Hold Evo',
      allowEvo: 'Allow Evo',
      evolve: 'Evolve',
      canEvolve: 'Can evolve',
      needsItem: 'Needs {item}',
      evolvesAtLevel: 'Evolves at Lv.{level}',
      pathsReady: '{count} paths ready',
      evolutionPaths: '{count} evolution paths',
      promoSummary: '{roots} root agent{rootPlural}, {subagents} sub-agent{subPlural}, {boxed} boxed.',
      noPromoAgents: 'No custom agents yet. Add a root Pokemon to start composing a promo scene.',
      rootAgent: 'Root Agent {count}',
      subagent: 'Sub-agent {count}',
      remove: 'Remove',
      pokemon: 'Pokemon',
      level: 'Level',
      status: 'Status',
      expTokenAuto: 'Token total updates automatically.',
      expConverted: 'EXP is converted into token totals.',
      configured: '{count} configured',
      addSubagent: 'Add Sub-agent',
      rootAgentLabel: 'Root Agent',
      subagentLabel: 'Sub-agent',
      unknown: 'Unknown',
      noRecord: 'No record',
      rateNoData: '{provider} {period}: no data',
      rateRemaining: '{provider} {period}: {remaining}% remaining',
      rateLeft: '{time} left',
      rateResets: 'resets {time}',
      codexBudget: 'Codex Budget',
      claudeBudget: 'Claude Budget',
      budget: 'Budget',
      spawnArea: 'Spawn area: {area}',
      outsideSelectedArea: 'selected area',
      statusIdle: 'Idle',
      statusThinking: 'Thinking',
      statusToolRunning: 'Tool-Running',
      statusOutputting: 'Outputting',
      statusWaiting: 'Waiting',
      statusSleeping: 'Sleeping',
      statusArchived: 'Archived'
    },
    ko: {
      tagline: 'Claude Code와 Codex transcript의 로컬 활동을 실시간으로 보여줍니다',
      uiLanguage: 'UI 언어',
      uiLanguageEnglish: 'UI 언어: 영어',
      uiLanguageKorean: 'UI 언어: 한국어',
      pokedex: '도감',
      pokedexTitle: 'Safari 도감',
      promoStudio: 'Promo Studio',
      promoStudioSubtitle: '커스텀 장면 빌더',
      hardReset: '전체 초기화',
      dashboardInfo: '대시보드 정보',
      active: 'Active',
      lastUpdate: '마지막 업데이트',
      tokensUsed: '사용 토큰',
      area: '지역',
      allAreas: '전체 지역',
      unknownArea: '미확인 지역',
      pokedexSort: '도감 정렬',
      pokedexSortNumber: '번호순',
      pokedexSortArea: '지역순',
      pokedexSortRarity: '레어도 순',
      pokedexEntries: '도감 목록',
      pokedexRewards: '도감 보상',
      pokedexRewardsReady: '{count}개 수령 가능',
      pokedexRewardStage: '달성 단계 {level}',
      pokedexRewardProgressFull: '{total}마리 중 {caught}마리 포획',
      pokedexFeaturedReward: '주요 보상',
      pokedexNationalDex: '전국 도감',
      pokedexAreaDex: '지역 도감',
      pokedexNextReward: '다음 보상',
      pokedexNoPendingReward: '남은 보상 없음',
      pokedexRewardReady: '수령 가능',
      pokedexRewardClaimed: '수령 완료',
      pokedexRewardLocked: '미달성',
      pokedexRewardClaim: '수령',
      pokedexRewardClaiming: '수령 중...',
      pokedexCaughtMilestone: '{count}마리 포획',
      pokedexSeenMilestone: '{count}마리 발견',
      pokedexSeenPass: '발견 패스',
      pokedexOwnedPass: '영입 패스',
      pokedexTicketReward: '{ticket} 영입 티켓 x{count}',
      pokedexRecruitTicketCount: '영입 티켓 x{count}',
      pokedexAreaMilestone: 'Lv.{level} - {percent}%',
      pokedexRewardProgress: '{caught} / {target} 포획',
      pokedexSeenRewardProgress: '{seen} / {target} 발견',
      pokedexAreaProgress: '{caught} / {total} 포획',
      pokedexPointsReward: '+{points} pts',
      pokedexGlobalRadar: '전역 탐색 보정 Lv.{level}',
      pokedexAreaBoost: '지역 보너스',
      pokedexNotCaughtBoost: '미포획 등장 x{multiplier}',
      pokedexRareBoost: '레어도 보정 Lv.{level}',
      pokedexBadgeReward: '배지: {badge}',
      pokedexClaimedReward: '{reward} 보상을 수령했습니다.',
      pokedexClaimResult: '도감 보상',
      pokedexRewardClaimFailed: '보상 수령에 실패했습니다.',
      selectedArea: '선택 지역',
      agentsOutsideArea: 'Agents outside {area}',
      myPokemon: '내 포켓몬',
      openMyPokemonDetails: '내 포켓몬 상세 열기',
      myPokemonParty: '내 포켓몬 파티',
      ownedShort: '{count} 보유',
      ownedPokemonCount: '내 포켓몬 {count}마리',
      agents: 'Agents',
      noAgentsYet: 'No agents yet.',
      safariLog: '만난 포켓몬',
      viewAll: '전체 보기',
      close: '닫기',
      back: '뒤로',
      useCustomScene: '커스텀 장면 사용',
      addRoot: '루트 추가',
      reset: '초기화',
      downloadPng: 'PNG 다운로드',
      buildPromoScene: 'Mock 모드에서 배포용 장면을 구성합니다.',
      party: '파티',
      inventory: '인벤토리',
      itemRules: '아이템 규칙',
      evolutionItemWallet: '진화 아이템 지갑',
      itemPointProgress: '아이템 포인트 진행도',
      evolutionItems: '진화 아이템',
      recruitTickets: '영입 티켓',
      points: '포인트',
      draw: '뽑기',
      target: '타깃',
      tickets: '티켓',
      use: '사용',
      sell: '판매',
      nextPoint: '다음 포인트',
      claimTarget: '타깃 확정',
      pokemonBox: '포켓몬 박스',
      recruitPokemon: '포켓몬 영입',
      recruit: '영입',
      recruitView: '영입 보기',
      available: '영입 가능',
      action: '작업',
      confirm: '확인',
      yes: '예',
      no: '아니오',
      ok: '확인',
      item: '아이템',
      currentPoints: '현재 포인트',
      plannedSpend: '소모 예정',
      afterRecruit: '사용 후 예상',
      pokedexRegistered: '도감 등록됨',
      newPokedexEntry: '도감 신규 등록',
      before: '진화 전',
      after: '진화 후',
      consumes: '소모',
      actionFailed: '작업에 실패했습니다.',
      itemRulesPoints: '{tokens} total tokens마다 1 point를 얻습니다. 캐시된 입력 토큰도 포함됩니다.',
      itemRulesDraw: '{cost} pts를 사용합니다. 성공률은 30%, 성공 보상은 진화 아이템 80% / 영입 티켓 20%입니다.',
      itemRulesTarget: '타깃은 뽑기 성공 보상이 진화 아이템일 때만 적용됩니다.',
      itemRulesTickets: '타깃 뽑기에 성공했지만 타깃이 아니면 티켓 +1. {cost} tickets로 타깃을 확정 획득합니다.',
      itemRulesSell: '판매하면 +{value} pts를 얻습니다. 일반 포인트 구매는 비활성화되어 있습니다.',
      itemRulesChanceTable: '뽑기 확률표',
      itemRulesReward: '보상',
      itemRulesChance: '확률',
      itemRulesChanceOpen: '확률표 보기',
      itemRulesFailure: '보상 없음',
      itemRulesEvolutionItemReward: '진화 아이템',
      itemRulesEvolutionItemTotal: '진화 아이템 전체',
      itemRulesTicketReward: '{ticket} 영입 티켓',
      itemRulesTargetMark: '타깃',
      noTarget: '타깃 없음',
      noEvolutionItems: '사용 가능한 진화 아이템이 없습니다.',
      noDiscoveredPokemon: '아직 영입 가능한 발견 포켓몬이 없습니다.',
      emptyPartySlot: '빈 파티 슬롯',
      emptyPartySpot: '빈 파티 자리',
      noBoxedPokemon: '박스에 보관된 포켓몬이 없습니다.',
      itemCount: '{count}개 아이템',
      dragToArrange: '드래그해서 정렬',
      boxedCount: '박스 {count}마리',
      discoveredCount: '{count} / {total} 발견',
      pokedexProgressFull: '본 포켓몬 {seen} / {total} | 잡은 포켓몬 {caught} / {total}',
      availableCount: '{count}마리 가능',
      availablePokedexCount: '{count} / {total} 가능',
      seen: '만남',
      unseen: '못 봄',
      caught: '잡음',
      seenNotCaught: '봤지만 안 잡음',
      newEntryShort: '신규',
      firstCatchBonus: '첫 포획 보너스',
      catchReward: '포획 보상',
      alreadyCaughtDiscount: '포획 할인',
      pokedexStatus: '\uc0c1\ud0dc',
      pokedexStatusAll: '\uc804\uccb4',
      pokedexStatusUndiscovered: '\ubbf8\ubc1c\uacac',
      pokedexStatusDiscovered: '\ubc1c\uacac',
      pokedexStatusCaught: '\ud3ec\ud68d',
      need: '필요',
      spent: '사용',
      recruitCost: '영입 비용',
      drawResult: '뽑기 결과',
      itemResult: '아이템 결과',
      buyResult: '구매 결과',
      claimResult: '확정 획득 결과',
      sellResult: '판매 결과',
      evolutionResult: '진화 결과',
      recruitResult: '영입 결과',
      drawRequestSent: '뽑기 요청을 보냈습니다.',
      requestSent: '요청을 보냈습니다.',
      noItemThisTime: '이번에는 아이템이 나오지 않았습니다.',
      youDrewItem: '{item} 획득!',
      youDrewTicket: '{ticket} 영입 티켓 획득!',
      boughtItem: '{item} 구매 완료.',
      claimedItem: '{item} 확정 획득 완료.',
      soldItem: '{item} 판매 완료. +{value} pts 획득.',
      useTicketPrompt: '{ticket} 영입 티켓을 사용할까요?',
      usedTicket: '{ticket} 영입 티켓에서 {pokemon}이(가) 나왔습니다.',
      ticketRecruitedPokemon: '{pokemon}을(를) 영입했습니다.',
      pointsEarned: '+{points} pts 획득',
      evolutionRequestSent: '진화 요청을 보냈습니다.',
      evolvedInto: '{from} -> {to} 진화 완료.',
      evolved: '{from} 진화 완료.',
      recruitPrompt: '{pokemon}을(를) {cost} pts로 영입할까요?',
      recruitSpawnPrompt: '{pokemon} ({area} 출현)을(를) {cost} pts로 영입할까요?',
      recruitedPokemon: '{pokemon} 영입 완료.',
      sellPrompt: '{item}을(를) 판매하고 +{value} pts를 받을까요?',
      claimPrompt: '{item}을(를) {cost} tickets로 확정 획득할까요?',
      evolvePrompt: '{from}을(를) {to}(으)로 진화할까요?',
      selectedEvolution: '선택한 진화',
      releasePrompt: '{pokemon}을(를) 내 포켓몬에서 방생할까요?',
      thisPokemon: '이 포켓몬',
      nicknamePrompt: '포켓몬 닉네임',
      hardResetPrompt: '{mode}{source} 상태, 만난 포켓몬, 내 포켓몬, 진화 아이템, 도감 진행도를 초기화할까요?',
      promoResetPrompt: '커스텀 Promo Studio 장면을 기본 스타터 구성으로 초기화할까요?',
      hardResetFailed: '전체 초기화 실패: {status}',
      failedToLoadState: '상태를 불러오지 못했습니다: {message}',
      noSafariRecords: '아직 만난 포켓몬 기록이 없습니다.',
      safariRecords: '만난 포켓몬 기록 {count}개',
      subagentHistory: 'Sub-agent History',
      noSubhistory: 'No boxed sub-agent history yet.',
      records: '{count} records',
      oneRecord: '1 record',
      parent: 'Parent',
      depth: 'Depth',
      live: 'Live',
      finished: 'Finished',
      tokens: 'Tokens',
      tools: 'Tools',
      started: 'Started',
      ended: 'Ended',
      lastSeen: 'Last seen',
      duration: 'Duration',
      project: 'Project',
      session: 'Session',
      lastCommand: 'Last command',
      lastActivity: 'Last Activity',
      lastTool: 'Last tool',
      toolsRun: 'Tools run',
      context: 'Context',
      visibleSubs: 'Visible subs',
      subagents: 'Sub-agents',
      subHistory: 'Sub history',
      openSubagentHistory: 'Open Sub-agent History',
      lastQuery: 'Last query',
      show: 'Show',
      hide: 'Hide',
      showSubagentHierarchy: 'Show sub-agent hierarchy',
      hideSubagentHierarchy: 'Hide sub-agent hierarchy',
      agentInfo: 'Agent Info',
      archiveInfo: 'Archive Info',
      trainerMemo: 'Trainer Memo',
      metInProjectAt: 'Met in {project} at {time}.',
      totalToken: 'Total token',
      type: 'Type',
      name: '이름',
      model: 'Model',
      uptime: 'Uptime',
      id: 'ID',
      archive: 'Archive',
      restore: 'Restore',
      manuallyArchived: 'Manually archived - restores on next query',
      alreadyAdopted: '이미 내 포켓몬으로 영입됨',
      endedAt: 'Ended {time}',
      durationValue: 'Duration {duration}',
      subHistoryCount: 'Sub-history ({count})',
      recruitForPts: 'Recruit for {cost} pts',
      needPtsToRecruit: 'Need {cost} pts to recruit',
      adoptButton: '영입 ({cost} pts)',
      noProject: 'No project',
      unassigned: 'unassigned',
      training: '훈련',
      fromProject: '{project}에서 만남',
      boxed: '박스',
      box: '박스',
      release: '방생',
      holdEvo: '진화 보류',
      allowEvo: '진화 허용',
      evolve: '진화',
      canEvolve: '진화 가능',
      needsItem: '{item} 필요',
      evolvesAtLevel: 'Lv.{level}에 진화',
      pathsReady: '{count}개 경로 준비됨',
      evolutionPaths: '진화 경로 {count}개',
      promoSummary: '{roots} root agent{rootPlural}, {subagents} sub-agent{subPlural}, {boxed} boxed.',
      noPromoAgents: 'No custom agents yet. Add a root Pokemon to start composing a promo scene.',
      rootAgent: 'Root Agent {count}',
      subagent: 'Sub-agent {count}',
      remove: 'Remove',
      pokemon: '포켓몬',
      level: '레벨',
      status: 'Status',
      expTokenAuto: '토큰 합계가 자동으로 업데이트됩니다.',
      expConverted: 'EXP는 토큰 합계로 변환됩니다.',
      configured: '{count} configured',
      addSubagent: 'Sub-agent 추가',
      rootAgentLabel: 'Root Agent',
      subagentLabel: 'Sub-agent',
      unknown: '미확인',
      noRecord: 'No record',
      rateNoData: '{provider} {period}: 데이터 없음',
      rateRemaining: '{provider} {period}: {remaining}% 남음',
      rateLeft: '{time} 남음',
      rateResets: '{time} 리셋',
      codexBudget: 'Codex Budget',
      claudeBudget: 'Claude Budget',
      budget: 'Budget',
      spawnArea: '출현 지역: {area}',
      outsideSelectedArea: '선택 지역',
      statusIdle: 'Idle',
      statusThinking: 'Thinking',
      statusToolRunning: 'Tool-Running',
      statusOutputting: 'Outputting',
      statusWaiting: 'Waiting',
      statusSleeping: 'Sleeping',
      statusArchived: 'Archived'
    }
  };

  function currentLanguage() {
    return activeUiLanguage === 'ko' ? 'ko' : 'en';
  }

  function t(key, params) {
    var lang = currentLanguage();
    var dict = UI_TEXT[lang] || UI_TEXT.en;
    var text = Object.prototype.hasOwnProperty.call(dict, key) ? dict[key] : UI_TEXT.en[key];
    if (text === undefined) return key;
    return String(text).replace(/\{([a-zA-Z0-9_]+)\}/g, function (_, name) {
      return params && params[name] !== undefined ? String(params[name]) : '';
    });
  }

  function hasHangulFinalConsonant(value) {
    var chars = Array.from(String(value || '').trim());
    if (chars.length === 0) return false;
    var code = chars[chars.length - 1].charCodeAt(0);
    if (code < 0xAC00 || code > 0xD7A3) return false;
    return ((code - 0xAC00) % 28) !== 0;
  }

  function objectParticleKo(value) {
    return hasHangulFinalConsonant(value) ? '을' : '를';
  }

  function subjectParticleKo(value) {
    return hasHangulFinalConsonant(value) ? '이' : '가';
  }

  function directionParticleKo(value) {
    var chars = Array.from(String(value || '').trim());
    if (chars.length === 0) return '로';
    var code = chars[chars.length - 1].charCodeAt(0);
    if (code < 0xAC00 || code > 0xD7A3) return '로';
    var finalIndex = (code - 0xAC00) % 28;
    return finalIndex !== 0 && finalIndex !== 8 ? '으로' : '로';
  }

  function recruitedPokemonText(pokemonName) {
    if (currentLanguage() === 'ko') {
      return pokemonName + objectParticleKo(pokemonName) + ' 영입했습니다.';
    }
    return t('ticketRecruitedPokemon', { pokemon: pokemonName });
  }

  function ticketRecruitedPokemonText(pokemonName) {
    return recruitedPokemonText(pokemonName);
  }

  function evolvedPokemonText(beforeName, afterName) {
    if (currentLanguage() === 'ko' && afterName) {
      return beforeName + subjectParticleKo(beforeName) + ' ' + afterName + directionParticleKo(afterName) + ' 진화했습니다.';
    }
    return afterName ? t('evolvedInto', { from: beforeName, to: afterName }) : t('evolved', { from: beforeName });
  }

  function applyStaticTranslations(root) {
    var host = root || document;
    var textNodes = host.querySelectorAll('[data-i18n]');
    Array.prototype.forEach.call(textNodes, function (node) {
      node.textContent = t(node.getAttribute('data-i18n'));
    });
    var ariaNodes = host.querySelectorAll('[data-i18n-aria]');
    Array.prototype.forEach.call(ariaNodes, function (node) {
      node.setAttribute('aria-label', t(node.getAttribute('data-i18n-aria')));
    });
    var titleNodes = host.querySelectorAll('[data-i18n-title]');
    Array.prototype.forEach.call(titleNodes, function (node) {
      node.setAttribute('title', t(node.getAttribute('data-i18n-title')));
    });
  }

  let vscodeRequestSeq = 0;
  const vscodePendingRequests = {};

  function postVscodeAction(message) {
    const requestId = 'action-' + (++vscodeRequestSeq);
    __vscode.postMessage({ ...message, requestId });
    return new Promise(function (resolve) {
      const timeout = setTimeout(function () {
        if (!vscodePendingRequests[requestId]) return;
        delete vscodePendingRequests[requestId];
        resolve({ ok: true, pending: true });
      }, 1800);
      vscodePendingRequests[requestId] = function (result) {
        clearTimeout(timeout);
        resolve(result && typeof result === 'object' ? result : { ok: !!result });
      };
    });
  }

  const transport = __vscode ? {
    async connect(onState) {
      function handleMessage(event) {
        if (event.data && event.data.type === 'state') {
          onState(event.data.snapshot);
        } else if (event.data && event.data.type === 'actionResult' && event.data.requestId) {
          const resolve = vscodePendingRequests[event.data.requestId];
          if (resolve) {
            delete vscodePendingRequests[event.data.requestId];
            resolve(event.data.result);
          }
        }
      }
      window.addEventListener('message', handleMessage);
      __vscode.postMessage({ type: 'ready' });
      return {
        dispose() {
          window.removeEventListener('message', handleMessage);
        }
      };
    },
    box(id) {
      return postVscodeAction({ type: 'box', id: id });
    },
    unbox(id) {
      return postVscodeAction({ type: 'unbox', id: id });
    },
    owned(action, payload) {
      return postVscodeAction({ type: 'owned', action: action, payload: payload || {} });
    },
    items(action, payload) {
      return postVscodeAction({ type: 'items', action: action, payload: payload || {} });
    },
    pokedex(action, payload) {
      return postVscodeAction({ type: 'pokedex', action: action, payload: payload || {} });
    },
    explorationArea(areaId) {
      return postVscodeAction({ type: 'explorationArea', areaId: areaId || 'all' });
    },
    hardReset() {
      return postVscodeAction({ type: 'hardReset' });
    }
  } : {
    async connect(onState) {
      const res = await fetch('/api/state', { cache: 'no-cache' });
      if (!res.ok) throw new Error('state load failed: ' + res.status);
      onState(await res.json());

      const stream = new EventSource('/events');
      stream.addEventListener('state', function (event) {
        try { onState(JSON.parse(event.data)); } catch (_) {}
      });
      stream.onerror = function () {};
      return {
        dispose() {
          stream.close();
        }
      };
    },
    box(id) {
      return fetch('/api/box/' + encodeURIComponent(id), { method: 'POST' });
    },
    unbox(id) {
      return fetch('/api/unbox/' + encodeURIComponent(id), { method: 'POST' });
    },
    owned(action, payload) {
      payload = payload || {};
      var path = null;
      if (action === 'adopt') {
        path = '/api/owned/adopt';
      } else if (action === 'nickname') {
        path = '/api/owned/' + encodeURIComponent(payload.id) + '/nickname';
      } else if (action === 'party') {
        path = '/api/owned/' + encodeURIComponent(payload.id) + '/party';
      } else if (action === 'box') {
        path = '/api/owned/' + encodeURIComponent(payload.id) + '/box';
      } else if (action === 'assignProject') {
        path = '/api/owned/' + encodeURIComponent(payload.id) + '/assign-project';
      } else if (action === 'evolve') {
        path = '/api/owned/' + encodeURIComponent(payload.id) + '/evolve';
      } else if (action === 'holdEvolution') {
        path = '/api/owned/' + encodeURIComponent(payload.id) + '/evolution-hold';
      } else if (action === 'release') {
        path = '/api/owned/' + encodeURIComponent(payload.id) + '/release';
      }
      if (!path) return Promise.resolve({ ok: false, status: 400 });
      return fetch(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    },
    items(action, payload) {
      payload = payload || {};
      var path = null;
      if (action === 'pickup') {
        path = '/api/items/pickup';
      } else if (action === 'pull') {
        path = '/api/items/pull';
      } else if (action === 'buy') {
        path = '/api/items/buy';
      } else if (action === 'sell') {
        path = '/api/items/sell';
      } else if (action === 'use-ticket') {
        path = '/api/items/use-ticket';
      }
      if (!path) return Promise.resolve({ ok: false, status: 400 });
      return fetch(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    },
    pokedex(action, payload) {
      payload = payload || {};
      var path = null;
      if (action === 'claim') {
        path = '/api/pokedex/claim';
      }
      if (!path) return Promise.resolve({ ok: false, status: 400 });
      return fetch(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    },
    explorationArea(areaId) {
      return fetch('/api/exploration-area', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ areaId: areaId || 'all' })
      });
    },
    hardReset() {
      return fetch('/api/hard-reset', { method: 'POST' });
    }
  };

  const WORLD_WIDTH = 480;
  const WORLD_HEIGHT = 320;
  const SPRITE_SIZE = 16;
  const DRAW_SIZE = 32;
  const SUBAGENT_DRAW_SIZE = 19;
  const ENTITY_EDGE_PAD = 8;
  const OVERLAY_EDGE_PAD = 2;
  const POKEDEX_MIN = 1;
  const POKEDEX_MAX = 649;
  const POKEDEX_TOTAL = POKEDEX_MAX - POKEDEX_MIN + 1;
  const OWNED_PARTY_SIZE = 6;
  const RING_SLOTS = 6;
  const RING_BASE_RADIUS = 30;
  const RING_STEP = 22;
  const SUBAGENT_RING_SLOTS = 12;
  const SUBAGENT_RING_BASE_RADIUS = 29;
  const SUBAGENT_RING_STEP = 4;
  const DEFAULT_PROMO_CONTEXT_MAX = 100000;
  const PROMO_SCENE_STORAGE_KEY = 'poke-agents-promo-scene-v1';
  const PROMO_POKEDEX_STORAGE_KEY = 'poke-agents-promo-pokedex-v1';
  const PROMO_BOX_STORAGE_KEY = 'poke-agents-promo-box-v1';
  const PROMO_EXPORT_SCALE = 2;
  const PROMO_STATUSES = ['Idle', 'Thinking', 'Tool-Running', 'Outputting', 'Waiting', 'Sleeping'];
  const RECRUIT_TICKET_ITEM_IDS_BY_MIN_TIER = Object.freeze({
    1: 'recruit-ticket-common',
    2: 'recruit-ticket-uncommon',
    3: 'recruit-ticket-rare',
    4: 'recruit-ticket-very-rare',
    5: 'recruit-ticket-legend'
  });

  // Pokeball spawn/despawn animation constants
  const SPAWN_DURATION_MS = 900;   // total spawn animation
  const DESPAWN_DURATION_MS = 700; // total despawn animation
  const BALL_SHAKE_MS = 300;       // ball wiggle phase
  const BALL_OPEN_MS = 300;        // ball opens + flash
  const APPEAR_MS = 300;           // monster fades in

  // ── Area mask system ──
  // The area_mask.png encodes each region as a unique solid color.
  // We load it onto a hidden canvas and use getImageData() to look up
  // which area any (x,y) pixel belongs to.

  const MAP_ASSET_DIR = 'map_assets/';
  const OVERVIEW_MAP_ASSET = MAP_ASSET_DIR + 'island_map_cc.png';
  const AREA_MASK_ASSET = MAP_ASSET_DIR + 'area_mask.png';
  const DETAIL_AREA_BOUNDS = { x: 0, y: 0, w: WORLD_WIDTH, h: WORLD_HEIGHT };

  // Color-to-area mapping — must match tools/generate_area_mask.js AREA_COLORS
  const AREA_DEFS = [
    { color: 'FF0000', id: 'mountain',      label: 'Mountain',      index: 0, detailAsset: MAP_ASSET_DIR + 'mountain_detail_v2.png' },
    { color: 'FF8000', id: 'cave',           label: 'Cave',          index: 1, detailAsset: MAP_ASSET_DIR + 'cave_detail_v2.png' },
    { color: '008000', id: 'forest',         label: 'Forest',        index: 2, detailAsset: MAP_ASSET_DIR + 'forest_detail_v2.png' },
    { color: 'FFFF00', id: 'ruin',           label: 'Ruins',         index: 3, detailAsset: MAP_ASSET_DIR + 'ruin_detail_v2.png' },
    { color: '800080', id: 'rough_terrain',  label: 'Hard Terrain',  index: 4, detailAsset: MAP_ASSET_DIR + 'rough_terrain_detail_v2.png' },
    { color: '00FF00', id: 'grassland',      label: 'Grassland',     index: 5, detailAsset: MAP_ASSET_DIR + 'grassland_detail_v2.png' },
    { color: 'FF00FF', id: 'urban',          label: 'Urban',         index: 6, detailAsset: MAP_ASSET_DIR + 'urban_detail_v2.png' },
    { color: '00FFFF', id: 'waters_edge',    label: "Water's Edge",  index: 7, detailAsset: MAP_ASSET_DIR + 'waters_edge_detail_v2.png' },
    { color: '0000FF', id: 'sea',            label: 'Sea',           index: 8, detailAsset: MAP_ASSET_DIR + 'sea_detail_v2.png' },
  ];

  // Build fast color→index lookup (key = "R,G,B")
  const COLOR_TO_INDEX = {};
  for (var d = 0; d < AREA_DEFS.length; d++) {
    var cv = parseInt(AREA_DEFS[d].color, 16);
    var cr = (cv >> 16) & 0xFF, cg = (cv >> 8) & 0xFF, cb = cv & 0xFF;
    COLOR_TO_INDEX[cr + ',' + cg + ',' + cb] = AREA_DEFS[d].index;
  }

  // Mutable AREAS array — starts with hardcoded fallback, replaced once mask loads
  var AREAS = [
    { x: 15,  y: 8,   w: 190, h: 82,  id: 'mountain',      label: 'Mountain' },
    { x: 115, y: 88,  w: 170, h: 82,  id: 'cave',           label: 'Cave' },
    { x: 305, y: 195, w: 150, h: 55,  id: 'forest',         label: 'Forest' },
    { x: 275, y: 8,   w: 140, h: 82,  id: 'ruin',           label: 'Ruins' },
    { x: 10,  y: 92,  w: 100, h: 78,  id: 'rough_terrain',  label: 'Hard Terrain' },
    { x: 300, y: 94,  w: 160, h: 96,  id: 'grassland',      label: 'Grassland' },
    { x: 120, y: 175, w: 180, h: 60,  id: 'urban',          label: 'Urban' },
    { x: 55,  y: 240, w: 380, h: 28,  id: 'waters_edge',    label: "Water's Edge" },
    { x: 0,   y: 270, w: 480, h: 50,  id: 'sea',            label: 'Sea' },
  ];

  // Mask pixel data (Uint8ClampedArray) and valid-coordinate lists per area
  var areaMaskData = null;    // raw RGBA pixels, length = WORLD_WIDTH * WORLD_HEIGHT * 4
  var areaMaskReady = false;
  var areaValidCoords = [];   // index → [{x,y}, ...] list of walkable pixels for that area

  // Load area mask onto hidden canvas
  (function loadAreaMask() {
    var img = new Image();
    img.onload = function () {
      var c = document.createElement('canvas');
      c.width = WORLD_WIDTH;
      c.height = WORLD_HEIGHT;
      var ctx = c.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0, WORLD_WIDTH, WORLD_HEIGHT);
      areaMaskData = ctx.getImageData(0, 0, WORLD_WIDTH, WORLD_HEIGHT).data;

      // Compute bounding boxes and valid-coordinate lists from mask
      var minX = [], maxX = [], minY = [], maxY = [];
      var coords = [];
      for (var i = 0; i < AREA_DEFS.length; i++) {
        minX[i] = WORLD_WIDTH; maxX[i] = 0;
        minY[i] = WORLD_HEIGHT; maxY[i] = 0;
        coords[i] = [];
      }

      // Sample every 2nd pixel for valid-coords (saves memory, still dense enough)
      for (var y = 0; y < WORLD_HEIGHT; y++) {
        for (var x = 0; x < WORLD_WIDTH; x++) {
          var off = (y * WORLD_WIDTH + x) * 4;
          var r = areaMaskData[off], g = areaMaskData[off + 1], b = areaMaskData[off + 2];
          var idx = COLOR_TO_INDEX[r + ',' + g + ',' + b];
          if (idx === undefined) continue;
          if (x < minX[idx]) minX[idx] = x;
          if (x > maxX[idx]) maxX[idx] = x;
          if (y < minY[idx]) minY[idx] = y;
          if (y > maxY[idx]) maxY[idx] = y;
          if ((x % 2 === 0) && (y % 2 === 0)) {
            coords[idx].push({ x: x, y: y });
          }
        }
      }

      // Update AREAS with mask-derived bounding boxes
      for (var i = 0; i < AREA_DEFS.length; i++) {
        if (coords[i].length > 0) {
          AREAS[i] = {
            x: minX[i], y: minY[i],
            w: maxX[i] - minX[i], h: maxY[i] - minY[i],
            id: AREA_DEFS[i].id, label: AREA_DEFS[i].label
          };
        }
      }

      areaValidCoords = coords;
      areaMaskReady = true;

      // Re-place any entities that were created before the mask loaded
      // (they may be stuck at fallback bounding-box positions)
      relocateEntitiesToMask();
      savePositionCache();
    };
    img.src = dataUrl(AREA_MASK_ASSET);
  })();

  // Re-position all existing entities using mask data (called once after mask loads)
  function relocateEntitiesToMask() {
    if (!areaMaskReady) return;
    // Clear all positions so overlapsExisting works fresh
    var entries = [];
    for (var [id, entity] of appState.entityById) {
      entries.push({ id: id, entity: entity });
    }
    // Temporarily remove all, then re-place one by one to avoid self-overlap
    for (var i = 0; i < entries.length; i++) {
      appState.entityById.delete(entries[i].id);
    }
    for (var i = 0; i < entries.length; i++) {
      var e = entries[i].entity;
      var cached = positionCache[entries[i].id];
      // Use cached position if it's inside the correct area
      if (cached && typeof cached.x === 'number' && isInsideArea(cached.x + DRAW_SIZE / 2, cached.y + DRAW_SIZE / 2, e.roomIndex)) {
        e.x = cached.x; e.y = cached.y;
        e.baseX = cached.x; e.baseY = cached.y;
      } else {
        var slot = pickSlotInArea(e.roomIndex, hashCode(entries[i].id));
        e.x = slot.x; e.y = slot.y;
        e.baseX = slot.x; e.baseY = slot.y;
      }
      appState.entityById.set(entries[i].id, e);
    }
  }

  // Look up area index for a world-space pixel
  function getAreaAtPixel(x, y) {
    if (!areaMaskReady) return -1;
    x = Math.round(x); y = Math.round(y);
    if (x < 0 || x >= WORLD_WIDTH || y < 0 || y >= WORLD_HEIGHT) return -1;
    var off = (y * WORLD_WIDTH + x) * 4;
    var r = areaMaskData[off], g = areaMaskData[off + 1], b = areaMaskData[off + 2];
    var idx = COLOR_TO_INDEX[r + ',' + g + ',' + b];
    return idx !== undefined ? idx : -1;
  }

  // Pick a random valid coordinate inside the given area
  function pickCoordsInArea(areaIndex, seed) {
    if (!areaMaskReady || !areaValidCoords[areaIndex] || areaValidCoords[areaIndex].length === 0) {
      // Fallback to bounding-box center
      var area = AREAS[areaIndex];
      return { x: area.x + area.w / 2, y: area.y + area.h / 2 };
    }
    var list = areaValidCoords[areaIndex];
    var pick = seed % list.length;
    return list[pick];
  }

  // Check if a coordinate is inside the given area (mask-based)
  function isInsideArea(x, y, areaIndex) {
    return getAreaAtPixel(x, y) === areaIndex;
  }

  // Map habitat strings from pokemon_data.json to area indices
  const HABITAT_TO_AREA = {
    'mountain': 0, 'cave': 1, 'forest': 2, 'rare': 3,
    'rough-terrain': 4, 'grassland': 5, 'urban': 6,
    'waters-edge': 7, 'sea': 8
  };

  var evolutionPaths = {};

  (function loadEvolutionPaths() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', dataUrl('evolution_paths.json'));
    xhr.onload = function () {
      if (xhr.status !== 200) return;
      try {
        var data = JSON.parse(xhr.responseText);
        if (data && data.paths && typeof data.paths === 'object') {
          evolutionPaths = data.paths;
        }
      } catch (_) {
        // Keep single-species evolution fallback if the mapping file is unavailable.
      }
    };
    xhr.send();
  })();

  const colorSeeds = [
    ['#5b8f5a', '#3f6e3d', '#cde8b5'],
    ['#7899d1', '#4d6f9f', '#dae8ff'],
    ['#d97f5a', '#a45536', '#ffd9bf'],
    ['#9b80c6', '#6d5798', '#eedcff'],
    ['#d0b44f', '#987e2c', '#fff1b8'],
    ['#5ca59a', '#35756d', '#d2fff7']
  ];

  const canvas = document.getElementById('office-canvas');
  const overlayEl = document.getElementById('agent-overlay');
  const activeCountEl = document.getElementById('active-count');
  const lastUpdateEl = document.getElementById('last-update');
  const tokenTotalEl = document.getElementById('token-total');
  const areaFilterEl = document.getElementById('area-filter');
  const agentListEl = document.getElementById('agent-list');
  const boxListEl = document.getElementById('box-list');
  const boxCountEl = document.getElementById('box-count');
  const boxHistoryToggleEl = document.getElementById('box-history-toggle');
  const boxHistoryModalEl = document.getElementById('box-history-modal');
  const boxHistoryBackdropEl = document.getElementById('box-history-backdrop');
  const boxHistoryCloseEl = document.getElementById('box-history-close');
  const boxHistorySummaryEl = document.getElementById('box-history-summary');
  const boxHistoryGridEl = document.getElementById('box-history-grid');
  const subhistoryModalEl = document.getElementById('subhistory-modal');
  const subhistoryBackdropEl = document.getElementById('subhistory-backdrop');
  const subhistoryCloseEl = document.getElementById('subhistory-close');
  const subhistoryTitleEl = document.getElementById('subhistory-title');
  const subhistorySummaryEl = document.getElementById('subhistory-summary');
  const subhistoryGridEl = document.getElementById('subhistory-grid');
  const actionModalEl = document.getElementById('action-modal');
  const actionBackdropEl = document.getElementById('action-backdrop');
  const actionPanelEl = document.getElementById('action-panel');
  const actionTitleEl = document.getElementById('action-title');
  const actionVisualEl = document.getElementById('action-visual');
  const actionMessageEl = document.getElementById('action-message');
  const actionConfirmEl = document.getElementById('action-confirm');
  const actionCancelEl = document.getElementById('action-cancel');
  const pokedexToggleEl = document.getElementById('pokedex-toggle');
  const ownedToggleEl = document.getElementById('owned-toggle');
  const ownedRecruitToggleEl = document.getElementById('owned-recruit-toggle');
  const ownedRecruitPanelEl = document.getElementById('owned-recruit-panel');
  const ownedRecruitCloseEl = document.getElementById('owned-recruit-close');
  const ownedRecruitAvailableEl = document.getElementById('owned-recruit-available');
  const ownedRecruitPokedexEl = document.getElementById('owned-recruit-pokedex');
  const ownedRecruitSummaryEl = document.getElementById('owned-recruit-summary');
  const ownedRecruitGridEl = document.getElementById('owned-recruit-grid');
  const ownedCurrentPointsEl = document.getElementById('owned-current-points');
  const ownedProgressEl = document.getElementById('owned-progress');
  const ownedModalEl = document.getElementById('owned-modal');
  const ownedBackdropEl = document.getElementById('owned-backdrop');
  const ownedCloseEl = document.getElementById('owned-close');
  const ownedSummaryEl = document.getElementById('owned-summary');
  const ownedPartyCountEl = document.getElementById('owned-party-count');
  const ownedBoxCountEl = document.getElementById('owned-box-count');
  const ownedStripGridEl = document.getElementById('owned-strip-grid');
  const ownedPartyGridEl = document.getElementById('owned-party-grid');
  const ownedBoxGridEl = document.getElementById('owned-box-grid');
  const ownedItemSummaryEl = document.getElementById('owned-item-summary');
  const ownedItemInfoEl = document.getElementById('owned-item-info');
  const ownedItemInfoPopoverEl = document.getElementById('owned-item-info-popover');
  const ownedItemPointsEl = document.getElementById('owned-item-points');
  const ownedPickupPointsEl = document.getElementById('owned-pickup-points');
  const ownedItemProgressTextEl = document.getElementById('owned-item-progress-text');
  const ownedItemProgressFillEl = document.getElementById('owned-item-progress-fill');
  const ownedPickupSelectEl = document.getElementById('owned-pickup-select');
  const ownedItemPullEl = document.getElementById('owned-item-pull');
  const ownedItemBuyEl = document.getElementById('owned-item-buy');
  const ownedItemSellEl = document.getElementById('owned-item-sell');
  const ownedItemClaimPickupEl = document.getElementById('owned-item-claim-pickup');
  const ownedItemInventoryEl = document.getElementById('owned-item-inventory');
  const hardResetBtnEl = document.getElementById('hard-reset-btn');
  const promoStudioToggleEl = document.getElementById('promo-studio-toggle');
  const promoStudioPanelEl = document.getElementById('promo-studio-panel');
  const promoStudioSummaryEl = document.getElementById('promo-studio-summary');
  const promoStudioCloseEl = document.getElementById('promo-studio-close');
  const promoStudioEnabledEl = document.getElementById('promo-studio-enabled');
  const promoAddRootEl = document.getElementById('promo-add-root');
  const promoResetEl = document.getElementById('promo-reset');
  const promoExportEl = document.getElementById('promo-export');
  const promoStudioListEl = document.getElementById('promo-studio-list');
  const pokedexProgressEl = document.getElementById('pokedex-progress');
  const pokedexModalEl = document.getElementById('pokedex-modal');
  const pokedexBackdropEl = document.getElementById('pokedex-backdrop');
  const pokedexCloseEl = document.getElementById('pokedex-close');
  const pokedexSummaryEl = document.getElementById('pokedex-summary');
  const pokedexEntriesPanelEl = document.getElementById('pokedex-entries-panel');
  const pokedexRewardsPanelEl = document.getElementById('pokedex-rewards-panel');
  const pokedexTabEntriesEl = document.getElementById('pokedex-tab-entries');
  const pokedexTabRewardsEl = document.getElementById('pokedex-tab-rewards');
  const pokedexRewardCountEl = document.getElementById('pokedex-reward-count');
  const pokedexGridEl = document.getElementById('pokedex-grid');
  const pokedexCategoryControlEl = document.getElementById('pokedex-category-control');
  const pokedexSortEl = document.getElementById('pokedex-sort');
  const pokedexLangButtonEl = document.getElementById('pokedex-lang-button');
  const pokedexLangOptionsEl = document.getElementById('pokedex-lang-options');
  const rateLimitsWrapEl = document.getElementById('rate-limits-wrap');

  const uiState = {
    areaFilter: 'all',
    pokedexOpen: false,
    pokedexCategory: 'all',
    ownedOpen: false,
    ownedRecruitOpen: false,
    ownedRecruitMode: 'available',
    selectedEvolutionItemId: null,
    ownedItemChanceOpen: false,
    draggedOwnedId: null,
    ownedBoxPopoverTimer: null,
    boxHistoryOpen: false,
    subhistoryOpen: false,
    subhistoryParentId: null,
    pokedexSort: 'number',
    pokedexCategory: 'all',
    pokedexTab: 'entries',
    pokedexLanguage: activeUiLanguage,
    pokedexLanguageMenuOpen: false,
    collapsedSubtrees: {},
    promoStudioOpen: false,
    promoStudioEnabled: false
  };
  let actionDialogResolver = null;

  function areaDefById(areaId) {
    for (var i = 0; i < AREA_DEFS.length; i++) {
      if (AREA_DEFS[i].id === areaId) return AREA_DEFS[i];
    }
    return null;
  }

  function areaLabelKo(areaId) {
    return {
      mountain: '\uc0b0\uc545',
      cave: '\ub3d9\uad74',
      forest: '\uc232',
      ruin: '\uc720\uc801',
      rough_terrain: '\ud5d8\uc9c0',
      grassland: '\ucd08\uc6d0',
      urban: '\ub3c4\uc2dc',
      waters_edge: '\ubb3c\uac00',
      sea: '\ubc14\ub2e4'
    }[areaId] || null;
  }

  function localizedUnknownAreaLabel() {
    return t('unknownArea');
  }

  function localizedAllAreasLabel() {
    return t('allAreas');
  }

  function localizedAreaLabel(areaOrId) {
    var area = null;
    if (typeof areaOrId === 'number') {
      area = AREA_DEFS[areaOrId] || AREAS[areaOrId] || null;
    } else if (typeof areaOrId === 'string') {
      area = areaDefById(areaOrId);
    } else {
      area = areaOrId || null;
    }
    if (!area) return localizedUnknownAreaLabel();
    if (uiState.pokedexLanguage === 'ko') {
      return areaLabelKo(area.id) || area.label || localizedUnknownAreaLabel();
    }
    return area.label || localizedUnknownAreaLabel();
  }

  function localizedAreaControlLabel() {
    return t('area');
  }

  function localizedOutsideAreaLabel(area) {
    var areaName = area ? localizedAreaLabel(area) : t('outsideSelectedArea');
    return t('agentsOutsideArea', { area: areaName });
  }

  function localizedStatusText(status) {
    var normalized = String(status || 'Idle').toLowerCase().replace(/[_\s]+/g, '-');
    if (normalized === 'idle') return t('statusIdle');
    if (normalized === 'thinking') return t('statusThinking');
    if (normalized === 'tool' || normalized === 'tool-running' || normalized === 'tool-use' || normalized === 'tooling') return t('statusToolRunning');
    if (normalized === 'outputting') return t('statusOutputting');
    if (normalized === 'waiting') return t('statusWaiting');
    if (normalized === 'sleeping') return t('statusSleeping');
    if (normalized === 'archived') return t('statusArchived');
    return String(status || t('statusIdle'));
  }

  function formatSecondsAgo(seconds) {
    var safeSeconds = Math.max(0, Math.floor(Number(seconds) || 0));
    return currentLanguage() === 'ko' ? safeSeconds + '초 전' : safeSeconds + 's ago';
  }

  function selectedAreaIndex() {
    var area = areaDefById(uiState.areaFilter);
    return area ? area.index : -1;
  }

  function isAreaDetailMode() {
    return selectedAreaIndex() >= 0;
  }

  function isDetailAreaRoom(roomIndex) {
    return isAreaDetailMode() && roomIndex === selectedAreaIndex();
  }

  function areaBounds(roomIndex) {
    if (isDetailAreaRoom(roomIndex)) return DETAIL_AREA_BOUNDS;
    return AREAS[roomIndex] || DETAIL_AREA_BOUNDS;
  }

  function isSubtreeCollapsed(agentId, depth, childCount, collapsedIds) {
    if (!childCount) return false;
    if (Object.prototype.hasOwnProperty.call(collapsedIds, agentId)) {
      return !!collapsedIds[agentId];
    }
    return depth === 0;
  }

  const appState = {
    snapshot: {
      agents: [],
      activeAgentCount: 0,
      config: { enablePokeapiSprites: true },
      pokedex: { seenPokemonIds: [], caughtPokemonIds: [], firstDiscoveryByPokemon: {}, firstCatchByPokemon: {}, discoveredCount: 0, caughtCount: 0, totalCount: POKEDEX_TOTAL },
      ownedPokemon: [],
      pokemonBoxes: [],
      projectTraining: {},
      trainingEvents: []
    },
    liveSnapshot: null,
    entityById: new Map(),
    subhistoryEntryByKey: new Map(),
    roomAssignments: new Map(),
    projects: []
  };

  var exportImageCache = new Map();
  var promoStudioState = loadPromoStudioState();
  var promoPokedexState = loadPromoPokedexState();
  var promoBoxState = loadPromoBoxState();
  uiState.promoStudioEnabled = !!promoStudioState.enabled;

  function promoClampInt(value, min, max, fallback) {
    var num = parseInt(value, 10);
    if (!Number.isFinite(num)) num = fallback;
    if (!Number.isFinite(num)) num = min;
    return Math.max(min, Math.min(max, num));
  }

  function createPromoId(prefix) {
    return prefix + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
  }

  function createPromoSubagent(parentPokemonId) {
    return {
      id: createPromoId('promo-sub'),
      label: 'Sub Agent',
      pokemonId: promoClampInt(parentPokemonId, POKEDEX_MIN, POKEDEX_MAX, 133),
      level: 8,
      exp: 3600,
      hp: 86,
      status: 'Tool-Running'
    };
  }

  function createPromoRoot() {
    var root = {
      id: createPromoId('promo-root'),
      label: 'Main Agent',
      pokemonId: 25,
      level: 18,
      exp: 6200,
      hp: 100,
      status: 'Thinking',
      subagents: []
    };
    root.subagents.push(createPromoSubagent(root.pokemonId));
    return root;
  }

  function createDefaultPromoStudioState() {
    return {
      enabled: false,
      roots: [createPromoRoot()]
    };
  }

  function normalizePromoUnit(raw, isRoot) {
    var fallback = isRoot ? createPromoRoot() : createPromoSubagent();
    var level = promoClampInt(raw && raw.level, 1, 100, fallback.level);
    var needed = level >= 100 ? 0 : expToNextLevel(level);
    return {
      id: (raw && raw.id) || fallback.id,
      label: raw && typeof raw.label === 'string' ? raw.label.slice(0, 40) : fallback.label,
      pokemonId: promoClampInt(raw && raw.pokemonId, POKEDEX_MIN, POKEDEX_MAX, fallback.pokemonId),
      level: level,
      exp: promoClampInt(raw && raw.exp, 0, level >= 100 ? 0 : needed, fallback.exp),
      hp: promoClampInt(raw && raw.hp, 0, 100, fallback.hp),
      status: PROMO_STATUSES.indexOf(raw && raw.status) >= 0 ? raw.status : fallback.status,
      subagents: isRoot && raw && Array.isArray(raw.subagents)
        ? raw.subagents.map(function (sub) { return normalizePromoUnit(sub, false); })
        : (isRoot ? [] : undefined)
    };
  }

  function normalizePromoStudioState(raw) {
    var normalized = raw && typeof raw === 'object' ? raw : {};
    var hasRoots = Array.isArray(normalized.roots);
    var roots = hasRoots
      ? normalized.roots.map(function (root) { return normalizePromoUnit(root, true); })
      : [];
    if (!hasRoots) {
      roots = createDefaultPromoStudioState().roots;
    }
    return {
      enabled: !!normalized.enabled,
      roots: roots
    };
  }

  function loadPromoStudioState() {
    try {
      var raw = localStorage.getItem(PROMO_SCENE_STORAGE_KEY);
      if (!raw) return createDefaultPromoStudioState();
      return normalizePromoStudioState(JSON.parse(raw));
    } catch (_) {
      return createDefaultPromoStudioState();
    }
  }

  function savePromoStudioState() {
    try {
      localStorage.setItem(PROMO_SCENE_STORAGE_KEY, JSON.stringify({
        enabled: uiState.promoStudioEnabled,
        roots: promoStudioState.roots
      }));
    } catch (_) {
      // Ignore storage errors.
    }
  }

  function normalizePromoPokedexState(raw) {
    var normalized = raw && typeof raw === 'object' ? raw : {};
    var seenLookup = {};
    var seenPokemonIds = [];
    var rawSeenIds = Array.isArray(normalized.seenPokemonIds) ? normalized.seenPokemonIds : [];
    for (var i = 0; i < rawSeenIds.length; i++) {
      var pokemonId = Number(rawSeenIds[i]);
      if (!Number.isInteger(pokemonId) || pokemonId < POKEDEX_MIN || pokemonId > POKEDEX_MAX || seenLookup[pokemonId]) {
        continue;
      }
      seenLookup[pokemonId] = true;
      seenPokemonIds.push(pokemonId);
    }
    seenPokemonIds.sort(function (a, b) { return a - b; });

    var caughtLookup = {};
    var caughtPokemonIds = [];
    var rawCaughtIds = Array.isArray(normalized.caughtPokemonIds) ? normalized.caughtPokemonIds : [];
    for (var c = 0; c < rawCaughtIds.length; c++) {
      var caughtId = Number(rawCaughtIds[c]);
      if (!Number.isInteger(caughtId) || caughtId < POKEDEX_MIN || caughtId > POKEDEX_MAX || caughtLookup[caughtId]) {
        continue;
      }
      caughtLookup[caughtId] = true;
      caughtPokemonIds.push(caughtId);
      if (!seenLookup[caughtId]) {
        seenLookup[caughtId] = true;
        seenPokemonIds.push(caughtId);
      }
    }
    seenPokemonIds.sort(function (a, b) { return a - b; });
    caughtPokemonIds.sort(function (a, b) { return a - b; });

    var firstDiscoveryByPokemon = {};
    var rawDiscovery = normalized.firstDiscoveryByPokemon && typeof normalized.firstDiscoveryByPokemon === 'object'
      ? normalized.firstDiscoveryByPokemon
      : {};
    for (var key in rawDiscovery) {
      if (!Object.prototype.hasOwnProperty.call(rawDiscovery, key)) continue;
      var discoveryId = Number(key);
      if (!seenLookup[discoveryId]) continue;
      firstDiscoveryByPokemon[discoveryId] = { ...rawDiscovery[key] };
    }

    var firstCatchByPokemon = {};
    var rawCatch = normalized.firstCatchByPokemon && typeof normalized.firstCatchByPokemon === 'object'
      ? normalized.firstCatchByPokemon
      : {};
    for (var catchKey in rawCatch) {
      if (!Object.prototype.hasOwnProperty.call(rawCatch, catchKey)) continue;
      var catchId = Number(catchKey);
      if (!caughtLookup[catchId]) continue;
      firstCatchByPokemon[catchId] = { ...rawCatch[catchKey] };
    }

    return {
      seenPokemonIds: seenPokemonIds,
      caughtPokemonIds: caughtPokemonIds,
      firstDiscoveryByPokemon: firstDiscoveryByPokemon,
      firstCatchByPokemon: firstCatchByPokemon,
      seenCount: seenPokemonIds.length,
      caughtCount: caughtPokemonIds.length,
      discoveredCount: seenPokemonIds.length,
      totalCount: POKEDEX_TOTAL
    };
  }

  function loadPromoPokedexState() {
    try {
      var raw = localStorage.getItem(PROMO_POKEDEX_STORAGE_KEY);
      if (!raw) {
        return normalizePromoPokedexState(null);
      }
      return normalizePromoPokedexState(JSON.parse(raw));
    } catch (_) {
      return normalizePromoPokedexState(null);
    }
  }

  function savePromoPokedexState() {
    try {
      localStorage.setItem(PROMO_POKEDEX_STORAGE_KEY, JSON.stringify({
        seenPokemonIds: promoPokedexState.seenPokemonIds || [],
        caughtPokemonIds: promoPokedexState.caughtPokemonIds || [],
        firstDiscoveryByPokemon: promoPokedexState.firstDiscoveryByPokemon || {},
        firstCatchByPokemon: promoPokedexState.firstCatchByPokemon || {}
      }));
    } catch (_) {
      // Ignore storage errors.
    }
  }

  function normalizePromoBoxSession(raw) {
    var boxedAt = Number(raw && raw.boxedAt);
    if (!Number.isFinite(boxedAt) || boxedAt <= 0) boxedAt = Date.now();
    return {
      id: (raw && raw.id) || createPromoId('promo-box'),
      boxedAt: boxedAt,
      root: normalizePromoUnit(raw && raw.root, true)
    };
  }

  function normalizePromoBoxState(raw) {
    var normalized = raw && typeof raw === 'object' ? raw : {};
    var rawSessions = Array.isArray(normalized.sessions) ? normalized.sessions : [];
    var sessions = rawSessions.map(function (session) {
      return normalizePromoBoxSession(session);
    });
    sessions.sort(function (a, b) {
      return (a.boxedAt || 0) - (b.boxedAt || 0);
    });
    return { sessions: sessions };
  }

  function loadPromoBoxState() {
    try {
      var raw = localStorage.getItem(PROMO_BOX_STORAGE_KEY);
      if (!raw) {
        return normalizePromoBoxState(null);
      }
      return normalizePromoBoxState(JSON.parse(raw));
    } catch (_) {
      return normalizePromoBoxState(null);
    }
  }

  function savePromoBoxState() {
    try {
      localStorage.setItem(PROMO_BOX_STORAGE_KEY, JSON.stringify({
        sessions: promoBoxState.sessions || []
      }));
    } catch (_) {
      // Ignore storage errors.
    }
  }

  function resetPromoBoxState() {
    promoBoxState = normalizePromoBoxState(null);
    try {
      localStorage.removeItem(PROMO_BOX_STORAGE_KEY);
    } catch (_) {
      savePromoBoxState();
    }
  }

  function resetPromoPokedexState() {
    promoPokedexState = normalizePromoPokedexState(null);
    try {
      localStorage.removeItem(PROMO_POKEDEX_STORAGE_KEY);
    } catch (_) {
      savePromoPokedexState();
    }
  }

  // ── Position persistence via localStorage ──
  const POSITION_CACHE_KEY_PREFIX = 'poke-agents-positions:';

  function getPositionCacheScope(config) {
    var modeScope = config && config.isMockMode ? 'mock' : 'watch';
    var sceneScope = config && config.promoStudioActive ? modeScope + ':promo' : modeScope;
    var areaScope = uiState.areaFilter === 'all' ? 'overview' : ('area:' + uiState.areaFilter);
    return sceneScope + ':' + areaScope;
  }

  function getPositionCacheKey(scope) {
    return POSITION_CACHE_KEY_PREFIX + scope;
  }

  function loadPositionCache(scope) {
    if (!scope) return {};
    try {
      var raw = localStorage.getItem(getPositionCacheKey(scope));
      return raw ? JSON.parse(raw) : {};
    } catch (_) {
      return {};
    }
  }

  function savePositionCache() {
    if (!positionCacheScope) return;
    try {
      var cache = {};
      for (var [id, entity] of appState.entityById) {
        cache[id] = { x: entity.baseX, y: entity.baseY, roomIndex: entity.roomIndex, parentId: entity.parentId };
      }
      localStorage.setItem(getPositionCacheKey(positionCacheScope), JSON.stringify(cache));
    } catch (_) { /* quota exceeded etc */ }
  }

  function applyPositionCacheScope(config) {
    var nextScope = getPositionCacheScope(config);
    if (positionCacheScope === nextScope) return;
    positionCacheScope = nextScope;
    positionCache = loadPositionCache(positionCacheScope);
    appState.entityById.clear();
    appState.roomAssignments.clear();
    appState.prevAgentMap = new Map();
    agentPokemonCache = {};
    subagentPokemonCache = {};
    animations.clear();
  }

  var positionCacheScope = null;
  var positionCache = {};

  const worldCanvas = document.createElement('canvas');
  const worldCtx = worldCanvas.getContext('2d');
  worldCtx.imageSmoothingEnabled = false;

  const screenCtx = canvas.getContext('2d');
  screenCtx.imageSmoothingEnabled = false;

  function hashCode(input) {
    let h = 2166136261;
    for (let i = 0; i < input.length; i += 1) {
      h ^= input.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return Math.abs(h >>> 0);
  }

  // ── Weighted Pokemon spawn by rarity tier ──
  // Tier weights: choose rarity first, then choose uniformly within that rarity.
  var TIER_IDS = [1, 2, 3, 4, 5];
  var TIER_WEIGHTS = { 1: 40, 2: 25, 3: 15, 4: 5, 5: 1 };
  var pokemonPool = [];       // weighted array of pokemon IDs
  var pokemonPoolReady = false;
  var pokemonTierPools = {};  // tier number -> [pokemon_id, ...]
  var agentPokemonCache = {}; // agentId → pokemon_id (stable assignment)
  var subagentPokemonCache = {}; // subagent agentId → rendered pokemon_id
  var pokemonHabitat = {};    // pokemon_id → habitat string (e.g. 'cave', 'forest')
  var pokemonNames = {};      // pokemon_id → display name
  var pokemonKoNames = {};    // pokemon_id → Korean display name
  var pokemonRarityLabels = {}; // pokemon_id → rarity label
  var pokemonRarityTiers = {};  // pokemon_id → rarity tier number

  // Per-area weighted pools: areaIndex → [pokemon_id, ...]
  var areaPoolMap = {};

  function pickPokemonFromTierPools(agentId, tierPools) {
    var speciesPoolsByTier = {};
    var effectiveWeights = {};
    for (var i = 0; i < TIER_IDS.length; i++) {
      var tier = TIER_IDS[i];
      var speciesPool = tierPools && tierPools[tier];
      speciesPoolsByTier[tier] = Array.isArray(speciesPool) ? speciesPool : [];
      effectiveWeights[tier] = speciesPoolsByTier[tier].length > 0 ? TIER_WEIGHTS[tier] || 1 : 0;
    }

    for (var missingIndex = 0; missingIndex < TIER_IDS.length; missingIndex++) {
      var missingTier = TIER_IDS[missingIndex];
      if (speciesPoolsByTier[missingTier].length > 0) continue;
      var missingWeight = TIER_WEIGHTS[missingTier] || 1;
      for (var lowerTier = missingTier - 1; lowerTier >= 1; lowerTier--) {
        if (speciesPoolsByTier[lowerTier] && speciesPoolsByTier[lowerTier].length > 0) {
          effectiveWeights[lowerTier] += missingWeight;
          break;
        }
      }
    }

    var entries = [];
    for (var entryIndex = 0; entryIndex < TIER_IDS.length; entryIndex++) {
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
    for (var j = 0; j < entries.length; j++) totalWeight += entries[j].weight;
    var roll = hashCode(String(agentId) + ':tier') % totalWeight;
    var selected = entries[entries.length - 1];
    for (var k = 0; k < entries.length; k++) {
      if (roll < entries[k].weight) {
        selected = entries[k];
        break;
      }
      roll -= entries[k].weight;
    }

    var speciesIndex = hashCode(String(agentId) + ':species:' + selected.tier) % selected.speciesPool.length;
    return selected.speciesPool[speciesIndex];
  }

  (function loadPokemonData() {
    var xhr = new XMLHttpRequest();
      xhr.open('GET', dataUrl('pokemon_data.json'));
    xhr.onload = function () {
      if (xhr.status !== 200) return;
      try {
        var data = JSON.parse(xhr.responseText);
        var pool = [];
        var areaPools = {};
        var tierPools = {};
        for (var i = 0; i < data.pokemon.length; i++) {
          var p = data.pokemon[i];
          if (p.pokemon_id < POKEDEX_MIN || p.pokemon_id > POKEDEX_MAX) continue;
          var tier = Number.isInteger(p.final_tier) && p.final_tier >= 1 && p.final_tier <= 5 ? p.final_tier : 1;
          var w = TIER_WEIGHTS[tier] || 1;
          if (!tierPools[tier]) tierPools[tier] = [];
          tierPools[tier].push(p.pokemon_id);
          for (var j = 0; j < w; j++) {
            pool.push(p.pokemon_id);
          }
          // Store habitat lookup
          if (p.habitat) {
            pokemonHabitat[p.pokemon_id] = p.habitat;
          }
          if (p.name) {
            pokemonNames[p.pokemon_id] = formatPokemonName(p.name);
          }
          if (p.tier_label) {
            pokemonRarityLabels[p.pokemon_id] = p.tier_label;
          }
          if (Number.isInteger(p.final_tier)) {
            pokemonRarityTiers[p.pokemon_id] = p.final_tier;
          }
          // Build per-area pools
          var areaIdx = HABITAT_TO_AREA[p.habitat];
          if (areaIdx !== undefined) {
            if (!areaPools[areaIdx]) areaPools[areaIdx] = [];
            for (var j = 0; j < w; j++) {
              areaPools[areaIdx].push(p.pokemon_id);
            }
          }
        }
        pokemonPool = pool;
        areaPoolMap = areaPools;
        pokemonTierPools = tierPools;
        pokemonPoolReady = true;
        renderLanguageDependentViews();
      } catch (e) {
        // Fallback: uniform full Pokedex range.
      }
    };
    xhr.send();
  })();

  (function loadPokemonKoNames() {
    var xhr = new XMLHttpRequest();
      xhr.open('GET', dataUrl('pokemon_names_ko.json'));
    xhr.onload = function () {
      if (xhr.status !== 200) return;
      try {
        var data = JSON.parse(xhr.responseText);
        for (var id in data) {
          if (!Object.prototype.hasOwnProperty.call(data, id)) continue;
          pokemonKoNames[Number(id)] = data[id];
        }
        renderLanguageDependentViews();
      } catch (_) {
        // Keep English fallback if the mapping file is unavailable or malformed.
      }
    };
    xhr.send();
  })();

  function getPokemonId(agentId) {
    var forced = forcedPokemonIdForAgent(agentId);
    if (forced) return forced;
    if (agentPokemonCache[agentId]) return agentPokemonCache[agentId];
    if (pokemonPoolReady && pokemonPool.length > 0) {
      // Use hash to pick deterministically from tier-first rarity pools.
      var id = pickPokemonFromTierPools(agentId, pokemonTierPools);
      if (!id) {
        var idx = hashCode(agentId) % pokemonPool.length;
        id = pokemonPool[idx];
      }
      agentPokemonCache[agentId] = id;
      return id;
    }
    // Data not loaded yet — return temp value without caching so it gets
    // re-evaluated once the pool is ready on the next render cycle.
    return (hashCode(agentId) % POKEDEX_TOTAL) + POKEDEX_MIN;
  }

  function validPokemonId(value) {
    var pokemonId = Number(value);
    return Number.isInteger(pokemonId) && pokemonId >= POKEDEX_MIN && pokemonId <= POKEDEX_MAX
      ? pokemonId
      : null;
  }

  function pickHistoricalAgent(candidates, beforeTs) {
    if (!candidates || candidates.length === 0) return null;

    var cutoff = typeof beforeTs === 'number' ? beforeTs : Infinity;
    var best = null;
    var bestCreatedAt = -Infinity;

    for (var i = 0; i < candidates.length; i++) {
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

    for (var j = 0; j < candidates.length; j++) {
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

  function findHistoricalAgentById(agentId, beforeTs) {
    if (!agentId) return null;
    var candidates = [];
    if (appState.agentById && appState.agentById.has(agentId)) {
      candidates.push(appState.agentById.get(agentId));
    }
    if (appState.prevAgentMap && appState.prevAgentMap.has(agentId)) {
      candidates.push(appState.prevAgentMap.get(agentId));
    }
    var boxed = (appState.snapshot && appState.snapshot.boxedAgents) || [];
    for (var i = boxed.length - 1; i >= 0; i--) {
      if (boxed[i] && boxed[i].agentId === agentId) {
        candidates.push(boxed[i]);
      }
    }

    var history = (appState.snapshot && appState.snapshot.subagentHistory) || [];
    for (var j = history.length - 1; j >= 0; j--) {
      if (history[j] && history[j].agentId === agentId) {
        candidates.push(history[j]);
      }
    }

    return pickHistoricalAgent(candidates, beforeTs);
  }

  function getAgentById(agentId, beforeTs) {
    return findHistoricalAgentById(agentId, beforeTs);
  }

  function forcedPokemonIdForAgent(agentId, beforeTs) {
    var agent = findHistoricalAgentById(agentId, beforeTs);
    if (!agent) return null;
    var pokemonId = Number(agent.forcedPokemonId);
    if (!Number.isInteger(pokemonId) || pokemonId < POKEDEX_MIN || pokemonId > POKEDEX_MAX) {
      return null;
    }
    return pokemonId;
  }

  function getEvolutionPath(pokemonId) {
    var normalizedId = Number(pokemonId);
    var path = evolutionPaths[String(normalizedId)] || evolutionPaths[normalizedId];
    return Array.isArray(path) && path.length > 0 ? path : [normalizedId];
  }

  function getNextEvolution(pokemonId) {
    pokemonId = Number(pokemonId);
    if (!Number.isInteger(pokemonId)) return null;
    for (var key in evolutionPaths) {
      if (!Object.prototype.hasOwnProperty.call(evolutionPaths, key)) continue;
      var path = evolutionPaths[key] || [];
      var index = path.indexOf(pokemonId);
      if (index >= 0 && index < path.length - 1) {
        return path[index + 1];
      }
    }
    return null;
  }

  var OWNED_LEVEL_100_EXP = 30115800;
  var OWNED_MEDIUM_FAST_LEVEL_100_EXP = 1000000;

  function ownedMediumFastTotalExpForLevel(level) {
    var normalizedLevel = Math.max(1, Math.min(100, Number(level) || 1));
    if (normalizedLevel <= 1) return 0;
    return Math.round((Math.pow(normalizedLevel, 3) / OWNED_MEDIUM_FAST_LEVEL_100_EXP) * OWNED_LEVEL_100_EXP);
  }

  function ownedBaseExpToNextLevel(level) {
    var normalizedLevel = Math.max(1, Math.min(100, Math.floor(Number(level) || 1)));
    if (normalizedLevel >= 100) return 0;
    return Math.max(1, ownedMediumFastTotalExpForLevel(normalizedLevel + 1) - ownedMediumFastTotalExpForLevel(normalizedLevel));
  }

  function ownedExpToNextLevel(level, growthRate) {
    var baseExp = ownedBaseExpToNextLevel(level);
    if (baseExp <= 0) return 0;
    var normalizedGrowth = Number.isFinite(Number(growthRate)) && Number(growthRate) > 0 ? Number(growthRate) : 1;
    return Math.max(1, Math.round(normalizedGrowth * baseExp));
  }

  function ownedEvolutionInfo(pokemon) {
    if (!pokemon) return null;
    if (pokemon.evolution) return pokemon.evolution;
    var nextSpeciesId = getNextEvolution(pokemon.speciesId);
    if (!nextSpeciesId) return null;
    var nextPath = getEvolutionPath(nextSpeciesId);
    var stageIndex = nextPath.indexOf(pokemon.speciesId);
    var requiredLevel = stageIndex <= 0 ? 16 : 36;
    return {
      nextSpeciesId: nextSpeciesId,
      requiredLevel: requiredLevel,
      canEvolve: (pokemon.level || 1) >= requiredLevel && !pokemon.evolutionHeld
    };
  }

  function encounterIdForAgent(agent) {
    if (!agent || !agent.agentId) return null;
    return [
      agent.provider || 'claude',
      agent.agentId,
      Number.isFinite(agent.createdAt) ? agent.createdAt : 0
    ].join(':');
  }

  function ownedPokemonForEncounter(agent) {
    var encounterId = encounterIdForAgent(agent);
    if (!encounterId) return null;
    var owned = (appState.snapshot && appState.snapshot.ownedPokemon) || [];
    for (var i = 0; i < owned.length; i++) {
      if (owned[i] && owned[i].sourceEncounterId === encounterId) return owned[i];
    }
    return null;
  }

  function ownedProjectOptions(selectedProjectId) {
    var seen = {};
    var projects = [];
    function add(projectId) {
      if (!projectId || seen[projectId]) return;
      seen[projectId] = true;
      projects.push(projectId);
    }
    var agents = (appState.snapshot && appState.snapshot.agents) || [];
    for (var i = 0; i < agents.length; i++) add(agents[i].projectId);
    var boxed = (appState.snapshot && appState.snapshot.boxedAgents) || [];
    for (var j = 0; j < boxed.length; j++) add(boxed[j].projectId);
    var owned = (appState.snapshot && appState.snapshot.ownedPokemon) || [];
    for (var k = 0; k < owned.length; k++) {
      add(owned[k].assignedProjectId);
      add(owned[k].sourceProjectId);
    }
    add(selectedProjectId);
    projects.sort();
    return projects;
  }

  function getRenderPokemonId(agent) {
    if (!agent) return POKEDEX_MIN;
    var renderedPokemonId = validPokemonId(agent.renderedPokemonId);
    if (renderedPokemonId) return renderedPokemonId;
    var forcedPokemonId = validPokemonId(agent.forcedPokemonId);
    if (forcedPokemonId) return forcedPokemonId;
    var assignedPokemonId = validPokemonId(agent.assignedPokemonId);
    if (assignedPokemonId) return assignedPokemonId;
    if (!agent.parentId) {
      return getPokemonId(agent.agentId);
    }
    if (subagentPokemonCache[agent.agentId]) {
      return subagentPokemonCache[agent.agentId];
    }

    var parentAgent = getAgentById(agent.parentId, agent.createdAt);
    var parentPokemonId = parentAgent ? getRenderPokemonId(parentAgent) : getPokemonId(agent.parentId);
    var candidates = getEvolutionPath(parentPokemonId);
    var selected = candidates[hashCode(agent.agentId) % candidates.length];
    if (parentAgent) {
      subagentPokemonCache[agent.agentId] = selected;
    }
    return selected;
  }

  // Get the area index that a pokemon's habitat maps to
  function getPokemonAreaIndex(pokemonId) {
    var habitat = pokemonHabitat[pokemonId];
    if (!habitat) return -1;
    var idx = HABITAT_TO_AREA[habitat];
    return idx !== undefined ? idx : -1;
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

  function getPokemonName(pokemonId) {
    return pokemonNames[pokemonId] || (t('pokemon') + ' ' + pokemonId);
  }

  function pokemonDisplayName(pokemonId) {
    if (uiState.pokedexLanguage === 'ko') {
      return pokemonKoNames[pokemonId] || getPokemonName(pokemonId);
    }
    return getPokemonName(pokemonId);
  }

  function syncPokedexLanguageMenu() {
    if (!pokedexLangButtonEl) return;
    var isKo = uiState.pokedexLanguage === 'ko';
    document.documentElement.lang = isKo ? 'ko' : 'en';
    pokedexLangButtonEl.textContent = isKo ? 'KO' : 'EN';
    pokedexLangButtonEl.setAttribute('aria-expanded', uiState.pokedexLanguageMenuOpen ? 'true' : 'false');
    pokedexLangButtonEl.setAttribute('aria-label', isKo ? t('uiLanguageKorean') : t('uiLanguageEnglish'));
    if (pokedexLangOptionsEl) {
      pokedexLangOptionsEl.setAttribute('aria-label', t('uiLanguage'));
      pokedexLangOptionsEl.classList.toggle('open', uiState.pokedexLanguageMenuOpen);
      var options = pokedexLangOptionsEl.querySelectorAll('[data-pokedex-language]');
      Array.prototype.forEach.call(options, function (option) {
        var selected = option.getAttribute('data-pokedex-language') === uiState.pokedexLanguage;
        option.classList.toggle('selected', selected);
        option.setAttribute('aria-checked', selected ? 'true' : 'false');
      });
    }
  }

  function setPokedexLanguageMenu(open) {
    uiState.pokedexLanguageMenuOpen = !!open;
    syncPokedexLanguageMenu();
  }

  function renderLanguageDependentViews() {
    applyStaticTranslations();
    updateFilterOptions();
    renderAgentList();
    renderBoxList();
    renderOwnedPokemon();
    if (uiState.boxHistoryOpen) {
      renderBoxHistory();
    }
    if (uiState.subhistoryOpen) {
      renderSubhistoryModal();
    }
    renderPokedex();
    renderPromoStudio();
    hidePokedexTooltip();
  }

  function setPokedexLanguage(language) {
    var nextLanguage = language === 'ko' ? 'ko' : 'en';
    uiState.pokedexLanguageMenuOpen = false;
    if (uiState.pokedexLanguage === nextLanguage) {
      syncPokedexLanguageMenu();
      return;
    }
    uiState.pokedexLanguage = nextLanguage;
    activeUiLanguage = nextLanguage;
    storeLanguage(nextLanguage);
    syncPokedexLanguageMenu();
    renderLanguageDependentViews();
  }

  function pokedexDiscoveryInfo(pokemonId) {
    var pokedex = appState.snapshot.pokedex || {};
    var discoveryMap = pokedex.firstDiscoveryByPokemon || {};
    return discoveryMap[pokemonId] || null;
  }

  function pokedexCatchInfo(pokemonId) {
    var pokedex = appState.snapshot.pokedex || {};
    var catchMap = pokedex.firstCatchByPokemon || {};
    return catchMap[pokemonId] || null;
  }

  function isPokedexPokemonSeen(pokemonId) {
    var pokedex = appState.snapshot.pokedex || {};
    var seenIds = Array.isArray(pokedex.seenPokemonIds) ? pokedex.seenPokemonIds : [];
    return seenIds.indexOf(Number(pokemonId)) >= 0;
  }

  function pokedexCaughtSpeciesLookup() {
    var lookup = {};
    var pokedex = appState.snapshot.pokedex || {};
    var caughtIds = Array.isArray(pokedex.caughtPokemonIds) ? pokedex.caughtPokemonIds : [];
    for (var i = 0; i < caughtIds.length; i++) {
      var speciesId = Number(caughtIds[i]);
      if (Number.isInteger(speciesId) && speciesId >= POKEDEX_MIN && speciesId <= POKEDEX_MAX) {
        lookup[speciesId] = true;
      }
    }
    return lookup;
  }

  function pokedexOwnedSpeciesLookup() {
    var lookup = {};
    var owned = appState.snapshot && Array.isArray(appState.snapshot.ownedPokemon)
      ? appState.snapshot.ownedPokemon
      : [];
    for (var i = 0; i < owned.length; i++) {
      var speciesId = Number(owned[i] && owned[i].speciesId);
      if (Number.isInteger(speciesId) && speciesId >= POKEDEX_MIN && speciesId <= POKEDEX_MAX) {
        lookup[speciesId] = true;
      }
    }
    return lookup;
  }

  function pokedexStatusForPokemon(pokemonId, seenLookup, caughtLookup) {
    if (caughtLookup && caughtLookup[pokemonId]) return 'caught';
    if (seenLookup ? seenLookup[pokemonId] : isPokedexPokemonSeen(pokemonId)) return 'discovered';
    return 'undiscovered';
  }

  function pokedexStatusLabel(status) {
    if (status === 'all') return t('pokedexStatusAll');
    if (status === 'caught') return t('pokedexStatusCaught');
    if (status === 'discovered') return t('pokedexStatusDiscovered');
    return t('pokedexStatusUndiscovered');
  }

  function normalizePokedexCategory(value) {
    if (value === 'undiscovered' || value === 'discovered' || value === 'caught') return value;
    return 'all';
  }

  function pokedexCategoryIncludesStatus(category, status) {
    var normalized = normalizePokedexCategory(category);
    if (normalized === 'all') return true;
    if (normalized === 'undiscovered') return status === 'undiscovered';
    if (normalized === 'caught') return status === 'caught';
    return status === 'discovered';
  }

  function pokedexStatusCounts(seenLookup, caughtLookup) {
    var counts = { all: 0, undiscovered: 0, discovered: 0, caught: 0 };
    for (var pokemonId = POKEDEX_MIN; pokemonId <= POKEDEX_MAX; pokemonId++) {
      var status = pokedexStatusForPokemon(pokemonId, seenLookup, caughtLookup);
      counts.all += 1;
      counts[status] += 1;
    }
    return counts;
  }

  function syncPokedexCategoryControl(counts) {
    if (!pokedexCategoryControlEl) return;
    uiState.pokedexCategory = normalizePokedexCategory(uiState.pokedexCategory);
    pokedexCategoryControlEl.setAttribute('aria-label', t('pokedexStatus'));
    var options = pokedexCategoryControlEl.querySelectorAll('[data-pokedex-category]');
    Array.prototype.forEach.call(options, function (option) {
      var category = normalizePokedexCategory(option.getAttribute('data-pokedex-category'));
      var selected = category === uiState.pokedexCategory;
      option.classList.toggle('active', selected);
      option.setAttribute('aria-pressed', selected ? 'true' : 'false');
      option.textContent = pokedexStatusLabel(category) + ' ' + String((counts && counts[category]) || 0);
    });
  }

  function setPokedexCategory(category) {
    var nextCategory = normalizePokedexCategory(category);
    if (uiState.pokedexCategory === nextCategory) {
      return;
    }
    uiState.pokedexCategory = nextCategory;
    if (pokedexGridEl) pokedexGridEl.scrollTop = 0;
    hidePokedexTooltip();
    renderPokedex();
  }

  function pokedexEncounterCount(pokemonId) {
    var snapshot = appState.snapshot || {};
    var countedAgents = {};
    var count = 0;
    var discovery = pokedexDiscoveryInfo(pokemonId);

    function addAgent(agent) {
      if (!agent || !agent.agentId || countedAgents[agent.agentId]) return;
      countedAgents[agent.agentId] = true;
      if (Number(getRenderPokemonId(agent)) === pokemonId) {
        count += 1;
      }
    }

    var liveAgents = Array.isArray(snapshot.agents) ? snapshot.agents : [];
    var boxedAgents = Array.isArray(snapshot.boxedAgents) ? snapshot.boxedAgents : [];
    var subhistoryAgents = Array.isArray(snapshot.subagentHistory) ? snapshot.subagentHistory : [];

    for (var i = 0; i < liveAgents.length; i++) addAgent(liveAgents[i]);
    for (var j = 0; j < boxedAgents.length; j++) addAgent(boxedAgents[j]);
    for (var k = 0; k < subhistoryAgents.length; k++) addAgent(subhistoryAgents[k]);

    if (discovery && discovery.agentId && !countedAgents[discovery.agentId]) {
      count += 1;
    }

    return count;
  }

  function pokedexTooltipLabels() {
    if (uiState.pokedexLanguage === 'ko') {
      return {
        metCount: '만난 횟수',
        firstMeet: '첫 만남',
        firstMeetHint: '처음 기록된 순간',
        project: '프로젝트',
        date: '날짜',
        time: '시간',
        undiscovered: '아직 만난 기록이 없어요.'
      };
    }
    return {
      metCount: 'Met',
      firstMeet: 'First encounter',
      firstMeetHint: 'First recorded moment',
      project: 'Project',
      date: 'Date',
      time: 'Time',
      undiscovered: 'No encounter recorded yet.'
    };
  }

  function getPokemonRarity(pokemonId) {
    var label = pokemonRarityLabels[pokemonId];
    var tier = pokemonRarityTiers[pokemonId];
    if (!label && !tier) return null;
    return {
      label: label || t('unknown'),
      tier: tier || 0
    };
  }

  function pokemonRarityBadgeHtml(pokemonId, className) {
    var rarity = getPokemonRarity(pokemonId);
    if (!rarity) return '';
    return '<span class="pokedex-rarity-badge tier-' + escapeHtml(String(rarity.tier)) + (className ? ' ' + escapeHtml(className) : '') + '">' + escapeHtml(rarity.label) + '</span>';
  }

  function normalizePokedexSort(value) {
    return value === 'area' || value === 'rarity' ? value : 'number';
  }

  function normalizePokedexTab(value) {
    return value === 'rewards' ? 'rewards' : 'entries';
  }

  function pokemonIdCompare(a, b) {
    return a - b;
  }

  function pokedexAreaSortValue(pokemonId) {
    var areaIndex = getPokemonAreaIndex(pokemonId);
    return areaIndex >= 0 ? areaIndex : AREA_DEFS.length;
  }

  function pokedexRaritySortValue(pokemonId) {
    var tier = pokemonRarityTiers[pokemonId];
    return Number.isInteger(tier) ? tier : 0;
  }

  function pokedexGroupKey(pokemonId) {
    var sort = normalizePokedexSort(uiState.pokedexSort);
    if (sort === 'area') {
      return 'area:' + pokedexAreaSortValue(pokemonId);
    }
    if (sort === 'rarity') {
      return 'rarity:' + pokedexRaritySortValue(pokemonId);
    }
    return '';
  }

  function pokedexGroupLabel(pokemonId) {
    var sort = normalizePokedexSort(uiState.pokedexSort);
    if (sort === 'area') {
      var areaIndex = getPokemonAreaIndex(pokemonId);
      return areaIndex >= 0 && AREA_DEFS[areaIndex]
        ? localizedAreaLabel(AREA_DEFS[areaIndex])
        : localizedUnknownAreaLabel();
    }
    if (sort === 'rarity') {
      var rarity = getPokemonRarity(pokemonId);
      return rarity ? rarity.label : t('unknown');
    }
    return '';
  }

  function pokedexGroupIconHtml(pokemonId) {
    var sort = normalizePokedexSort(uiState.pokedexSort);
    if (sort === 'area') {
      var areaMeta = pokemonSpawnAreaMeta(pokemonId);
      return '<span class="pokedex-group-icon pokedex-group-area-icon" style="' + escapeHtml(spawnAreaChipStyle(areaMeta)) + '" aria-hidden="true">' +
        '<span class="spawn-area-icon"></span>' +
        '</span>';
    }
    if (sort === 'rarity') {
      var tier = pokedexRaritySortValue(pokemonId);
      var tierText = tier > 0 ? ('T' + tier) : '?';
      return '<span class="pokedex-rarity-badge tier-' + escapeHtml(String(tier)) + ' pokedex-group-rarity-mark" aria-hidden="true">' + escapeHtml(tierText) + '</span>';
    }
    return '';
  }

  function pokedexGroupHeaderHtml(pokemonId) {
    var sort = normalizePokedexSort(uiState.pokedexSort);
    if (sort === 'number') return '';
    var classes = ['pokedex-group-header', 'pokedex-group-' + sort];
    if (sort === 'rarity') {
      classes.push('tier-' + pokedexRaritySortValue(pokemonId));
    }
    return '<div class="' + classes.join(' ') + '" role="heading" aria-level="3">' +
      '<span class="pokedex-group-inner">' +
      pokedexGroupIconHtml(pokemonId) +
      '<span class="pokedex-group-label">' + escapeHtml(pokedexGroupLabel(pokemonId)) + '</span>' +
      '</span>' +
      '</div>';
  }

  function comparePokedexPokemon(a, b) {
    var sort = normalizePokedexSort(uiState.pokedexSort);
    if (sort === 'area') {
      var areaDiff = pokedexAreaSortValue(a) - pokedexAreaSortValue(b);
      if (areaDiff) return areaDiff;
      return pokemonIdCompare(a, b);
    }
    if (sort === 'rarity') {
      var aRarity = pokedexRaritySortValue(a);
      var bRarity = pokedexRaritySortValue(b);
      if (!aRarity && bRarity) return 1;
      if (aRarity && !bRarity) return -1;
      var rarityDiff = aRarity - bRarity;
      if (rarityDiff) return rarityDiff;
      return pokemonIdCompare(a, b);
    }
    return pokemonIdCompare(a, b);
  }

  function sortedPokedexPokemonIds() {
    var ids = [];
    for (var pokemonId = POKEDEX_MIN; pokemonId <= POKEDEX_MAX; pokemonId++) {
      ids.push(pokemonId);
    }
    ids.sort(comparePokedexPokemon);
    return ids;
  }

  function syncPokedexSortControl() {
    if (!pokedexSortEl) return;
    uiState.pokedexSort = normalizePokedexSort(uiState.pokedexSort);
    pokedexSortEl.value = uiState.pokedexSort;
    pokedexSortEl.setAttribute('aria-label', t('pokedexSort'));
  }

  function setPokedexSort(sort) {
    var nextSort = normalizePokedexSort(sort);
    if (uiState.pokedexSort === nextSort) {
      syncPokedexSortControl();
      return;
    }
    uiState.pokedexSort = nextSort;
    if (pokedexGridEl) pokedexGridEl.scrollTop = 0;
    hidePokedexTooltip();
    renderPokedex();
  }

  function syncPokedexTabs() {
    uiState.pokedexTab = normalizePokedexTab(uiState.pokedexTab);
    var isRewards = uiState.pokedexTab === 'rewards';
    if (pokedexTabEntriesEl) {
      pokedexTabEntriesEl.classList.toggle('active', !isRewards);
      pokedexTabEntriesEl.setAttribute('aria-selected', isRewards ? 'false' : 'true');
    }
    if (pokedexTabRewardsEl) {
      pokedexTabRewardsEl.classList.toggle('active', isRewards);
      pokedexTabRewardsEl.setAttribute('aria-selected', isRewards ? 'true' : 'false');
    }
    if (pokedexEntriesPanelEl) pokedexEntriesPanelEl.hidden = isRewards;
    if (pokedexRewardsPanelEl) pokedexRewardsPanelEl.hidden = !isRewards;
    var sortControl = pokedexSortEl && pokedexSortEl.closest ? pokedexSortEl.closest('.pokedex-sort-control') : null;
    if (sortControl) sortControl.hidden = isRewards;
  }

  function setPokedexTab(tab) {
    var nextTab = normalizePokedexTab(tab);
    if (uiState.pokedexTab === nextTab) {
      syncPokedexTabs();
      return;
    }
    uiState.pokedexTab = nextTab;
    hidePokedexTooltip();
    syncPokedexTabs();
    renderPokedex();
  }

  function pokedexRewardStatus(milestone) {
    if (milestone && milestone.claimed) return 'claimed';
    if (milestone && milestone.claimable) return 'claimable';
    return 'locked';
  }

  function pokedexRewardStatusLabel(status) {
    if (status === 'claimed') return t('pokedexRewardClaimed');
    if (status === 'claimable') return t('pokedexRewardReady');
    return t('pokedexRewardLocked');
  }

  function pokedexBadgeName(value) {
    return String(value || '')
      .replace(/[-_]+/g, ' ')
      .replace(/\b\w/g, function (match) { return match.toUpperCase(); });
  }

  function pokedexTicketRewardLabel(ticketReward) {
    if (!ticketReward) return '';
    return ticketReward.label || 'Common+';
  }

  function pokedexTicketItemId(ticketReward) {
    return recruitTicketItemIdForReward(ticketReward);
  }

  function pokedexRewardEffects(milestone, options) {
    var effects = [];
    if (!milestone) return effects;
    var includePoints = !options || options.includePoints !== false;
    var points = Number(milestone.pointReward) || 0;
    if (includePoints && points > 0) effects.push(t('pokedexPointsReward', { points: formatTokenCount(points) }));
    if (milestone.ticketReward) {
      effects.push(t('pokedexTicketReward', {
        ticket: pokedexTicketRewardLabel(milestone.ticketReward),
        count: Number(milestone.ticketReward.count) || 1
      }));
    }
    if (milestone.globalRadarLevel) effects.push(t('pokedexGlobalRadar', { level: milestone.globalRadarLevel }));
    if (milestone.notCaughtMultiplier) effects.push(t('pokedexNotCaughtBoost', { multiplier: milestone.notCaughtMultiplier }));
    if (milestone.rareBoostLevel) effects.push(t('pokedexRareBoost', { level: milestone.rareBoostLevel }));
    if (milestone.badge) effects.push(t('pokedexBadgeReward', { badge: pokedexBadgeName(milestone.badge) }));
    return effects;
  }

  function pokedexRewardTextSizeClass(text) {
    var length = String(text || '').length;
    if (length >= 29) return ' tiny';
    if (length >= 23) return ' compact';
    return '';
  }

  function pokedexRewardItemRows(milestone, options) {
    var rows = [];
    if (!milestone) return rows;
    options = options || {};
    var includePoints = options.includePoints !== false;
    var includeTickets = options.includeTickets !== false;
    var includeBonuses = options.includeBonuses !== false;
    var points = Number(milestone.pointReward) || 0;
    if (includePoints && points > 0) {
      var pointsText = t('pokedexPointsReward', { points: formatTokenCount(points) });
      rows.push({
        type: 'points',
        iconText: 'P',
        label: pointsText
      });
    }
    if (includeTickets && milestone.ticketReward) {
      var ticketCount = Number(milestone.ticketReward.count) || 1;
      rows.push({
        type: 'ticket',
        itemId: pokedexTicketItemId(milestone.ticketReward),
        label: pokedexTicketRewardLabel(milestone.ticketReward),
        detail: t('pokedexRecruitTicketCount', { count: ticketCount })
      });
    }
    if (includeBonuses) {
      var bonusEffects = pokedexRewardEffects(milestone, { includePoints: false }).filter(function (effect) {
        return !milestone.ticketReward || effect !== t('pokedexTicketReward', {
          ticket: pokedexTicketRewardLabel(milestone.ticketReward),
          count: Number(milestone.ticketReward.count) || 1
        });
      });
      for (var i = 0; i < bonusEffects.length; i++) {
        rows.push({
          type: 'bonus',
          label: bonusEffects[i]
        });
      }
    }
    return rows;
  }

  function pokedexRewardEffectsHtml(milestone, options) {
    var rows = pokedexRewardItemRows(milestone, options);
    if (rows.length === 0) return '';
    var html = '<div class="pokedex-reward-effects rows-' + Math.min(rows.length, 3) + '">';
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      var labelClass = 'pokedex-reward-effect-label' + pokedexRewardTextSizeClass(row.label);
      html += '<span class="pokedex-reward-effect ' + escapeHtml(row.type) + '">';
      if (row.type === 'ticket') {
        html += '<img class="pokedex-reward-effect-icon" src="' + escapeHtml(itemSpriteUrl(row.itemId)) + '" alt="" loading="lazy" />';
      } else if (row.type === 'points') {
        html += '<span class="pokedex-reward-effect-icon points" aria-hidden="true">' + escapeHtml(row.iconText) + '</span>';
      } else {
        html += '<span class="pokedex-reward-effect-icon bonus" aria-hidden="true">+</span>';
      }
      html += '<span class="' + labelClass + '">';
      html += '<span>' + escapeHtml(row.label) + '</span>';
      if (row.detail) {
        html += '<span class="pokedex-reward-effect-detail">' + escapeHtml(row.detail) + '</span>';
      }
      html += '</span>';
      html += '</span>';
    }
    html += '</div>';
    return html;
  }

  function nextUnclaimedPokedexReward(milestones) {
    if (!Array.isArray(milestones)) return null;
    for (var i = 0; i < milestones.length; i++) {
      if (milestones[i] && milestones[i].claimable) return milestones[i];
    }
    for (var j = 0; j < milestones.length; j++) {
      if (milestones[j] && !milestones[j].claimed) return milestones[j];
    }
    return null;
  }

  function pokedexRewardTitle(milestone, type) {
    if (!milestone) return t('pokedexNoPendingReward');
    if (type === 'area') {
      var percent = Math.round((Number(milestone.percent) || 0) * 100);
      return t('pokedexAreaMilestone', { level: milestone.level, percent: percent });
    }
    if (type === 'seen') {
      return t('pokedexSeenMilestone', { count: milestone.count });
    }
    return t('pokedexCaughtMilestone', { count: milestone.count });
  }

  function pokedexRewardClaimButton(milestone, type, extraClass) {
    if (!milestone) return '';
    var id = milestone.id || '';
    var status = pokedexRewardStatus(milestone);
    var classes = ['pokedex-reward-claim'];
    if (extraClass) classes.push(extraClass);
    if (status !== 'claimable') classes.push('state', status);
    if (status === 'claimable') {
      return '<button class="' + escapeHtml(classes.join(' ')) + '" type="button" data-pokedex-action="claim-reward" data-reward-type="' + escapeHtml(type) + '" data-reward-id="' + escapeHtml(id) + '">' + escapeHtml(t('pokedexRewardClaim')) + '</button>';
    }
    return '<button class="' + escapeHtml(classes.join(' ')) + '" type="button" disabled>' + escapeHtml(pokedexRewardStatusLabel(status)) + '</button>';
  }

  function pokedexRewardClaimSlotHtml(milestone, type) {
    return '<div class="pokedex-reward-claim-slot">' + pokedexRewardClaimButton(milestone, type, 'track') + '</div>';
  }

  function pokedexRewardVisualHtml(milestone, type) {
    if (!milestone) return '';
    var html = '<div class="pokedex-pass-reward-visual">';
    var rewardRows = pokedexRewardItemRows(milestone, { includeBonuses: false });
    if (rewardRows.length > 0) {
      html += pokedexRewardEffectsHtml(milestone, { includeBonuses: false });
    } else {
      html += '<span class="pokedex-pass-area-token">L' + escapeHtml(milestone.level || 1) + '</span>';
    }
    html += '</div>';
    return html;
  }

  function renderPokedexRewardRow(milestone, type, progressText, progressRatio) {
    if (!milestone) return '';
    var status = pokedexRewardStatus(milestone);
    var id = milestone.id || '';
    var ratio = Math.max(0, Math.min(1, Number(progressRatio) || 0));
    var nodeLabel = type === 'area' ? 'L' + String(milestone.level || 1) : String(milestone.count || '');
    var html = '<div class="pokedex-reward-row ' + escapeHtml(status) + '" data-reward-id="' + escapeHtml(id) + '" style="--reward-progress:' + (ratio * 100).toFixed(1) + '%">';
    html += '<div class="pokedex-pass-reward-card">';
    html += pokedexRewardVisualHtml(milestone, type);
    html += pokedexRewardEffectsHtml(milestone, { includePoints: false, includeTickets: false, includeBonuses: true });
    html += '<strong class="pokedex-pass-reward-title">' + escapeHtml(pokedexRewardTitle(milestone, type)) + '</strong>';
    html += '</div>';
    html += pokedexRewardClaimSlotHtml(milestone, type);
    html += '<div class="pokedex-pass-node"><span>' + escapeHtml(nodeLabel) + '</span></div>';
    html += '<span class="pokedex-pass-step-progress">' + escapeHtml(progressText) + '</span>';
    html += '</div>';
    return html;
  }

  function renderPokedexNextReward(nextReward, type, progressText, progressRatio) {
    var status = pokedexRewardStatus(nextReward);
    var html = '<div class="pokedex-next-reward ' + escapeHtml(status) + '">';
    html += '<div class="pokedex-next-copy">';
    html += '<span class="pokedex-next-label">' + escapeHtml(t('pokedexFeaturedReward')) + '</span>';
    html += '<strong class="pokedex-next-title">' + escapeHtml(nextReward ? pokedexRewardTitle(nextReward, type) : t('pokedexNoPendingReward')) + '</strong>';
    html += '<span class="pokedex-next-progress">' + escapeHtml(progressText || '') + '</span>';
    html += '</div>';
    if (nextReward) {
      html += pokedexRewardVisualHtml(nextReward, type);
      html += '<div class="pokedex-reward-meter" aria-hidden="true"><span style="width:' + (Math.max(0, Math.min(1, Number(progressRatio) || 0)) * 100).toFixed(1) + '%"></span></div>';
      html += pokedexRewardEffectsHtml(nextReward, { includePoints: false, includeTickets: false });
      html += pokedexRewardClaimButton(nextReward, type, 'featured');
    }
    html += '</div>';
    return html;
  }

  function pokedexPassTrackRatio(milestones, type, value, total) {
    var safeMilestones = Array.isArray(milestones) ? milestones.filter(Boolean) : [];
    if (safeMilestones.length <= 1) {
      return total > 0 ? Math.max(0, Math.min(1, value / total)) : 0;
    }
    var current = Math.max(0, Number(value) || 0);
    var thresholds = safeMilestones.map(function (milestone) {
      return type === 'area' ? Number(milestone.threshold) || total : Number(milestone.count) || total;
    });
    var lastIndex = thresholds.length - 1;
    if (current <= thresholds[0]) return 0;
    if (current >= thresholds[lastIndex]) return 1;
    for (var i = 1; i < thresholds.length; i++) {
      var target = thresholds[i];
      if (current <= target) {
        var previous = thresholds[i - 1];
        var segmentSize = Math.max(1, target - previous);
        var segmentProgress = Math.max(0, Math.min(1, (current - previous) / segmentSize));
        return Math.max(0, Math.min(1, ((i - 1 + segmentProgress) / lastIndex)));
      }
    }
    return 1;
  }

  function renderPokedexRewardTrack(milestones, type, caught, total, compact) {
    var safeMilestones = Array.isArray(milestones) ? milestones : [];
    var ratio = pokedexPassTrackRatio(safeMilestones, type, caught, total);
    var html = '<div class="pokedex-pass-track-wrap ' + (compact ? 'compact' : '') + '">';
    html += '<div class="pokedex-pass-track" style="--pass-progress:' + (ratio * 100).toFixed(1) + '%">';
    html += '<div class="pokedex-pass-track-rail" aria-hidden="true"><span style="width:' + (ratio * 100).toFixed(1) + '%"></span></div>';
    for (var i = 0; i < safeMilestones.length; i++) {
      var milestone = safeMilestones[i];
      var target = type === 'area' ? Number(milestone.threshold) || total : Number(milestone.count) || total;
      var progressText = type === 'seen'
        ? t('pokedexSeenRewardProgress', { seen: Math.min(caught, target), target: target })
        : t('pokedexRewardProgress', { caught: Math.min(caught, target), target: target });
      html += renderPokedexRewardRow(
        milestone,
        type,
        progressText,
        target > 0 ? caught / target : 0
      );
    }
    html += '</div></div>';
    return html;
  }

  function renderPokedexRewards() {
    if (!pokedexRewardsPanelEl) return;
    var pokedex = appState.snapshot.pokedex || {};
    var seen = typeof pokedex.seenCount === 'number'
      ? pokedex.seenCount
      : (typeof pokedex.discoveredCount === 'number' ? pokedex.discoveredCount : 0);
    var caught = typeof pokedex.caughtCount === 'number' ? pokedex.caughtCount : 0;
    var total = typeof pokedex.totalCount === 'number' ? pokedex.totalCount : POKEDEX_TOTAL;
    var claimableCount = Number(pokedex.claimableRewardCount) || 0;
    var seenMilestones = Array.isArray(pokedex.seenMilestones) ? pokedex.seenMilestones : [];
    var catchMilestones = Array.isArray(pokedex.catchMilestones) ? pokedex.catchMilestones : [];
    var areaProgress = Array.isArray(pokedex.areaCatchProgress) ? pokedex.areaCatchProgress : [];
    var seenNext = nextUnclaimedPokedexReward(seenMilestones);
    var ownedNext = nextUnclaimedPokedexReward(catchMilestones);
    var nationalNext = ownedNext || seenNext;
    var nationalNextType = nationalNext && String(nationalNext.id || '').startsWith('seen-') ? 'seen' : 'catch';
    var nationalTarget = nationalNext ? Number(nationalNext.count) || total : total;
    var nationalRatio = pokedexPassTrackRatio(catchMilestones, 'catch', caught, total);
    var seenRatio = total > 0 ? Math.max(0, Math.min(1, seen / total)) : 0;
    var passLevel = Math.max(1, catchMilestones.filter(function (milestone) { return milestone && milestone.reached; }).length || 1);
    var html = '<div class="pokedex-pass-shell">';
    html += '<section class="pokedex-pass-hero">';
    html += '<div class="pokedex-pass-copy">';
    html += '<span class="pokedex-rewards-kicker">' + escapeHtml(t('pokedexRewards')) + '</span>';
    html += '<h3>' + escapeHtml(t('pokedexRewards')) + '</h3>';
    html += '<div class="pokedex-pass-level"><b>' + escapeHtml(String(passLevel)) + '</b><span>' + escapeHtml(t('pokedexRewardStage', { level: passLevel })) + '</span></div>';
    html += '<div class="pokedex-pass-progress-row"><span>' + escapeHtml(t('pokedexRewardProgressFull', { caught: caught, total: total })) + '</span><strong>' + Math.round(nationalRatio * 100) + '%</strong></div>';
    html += '<div class="pokedex-pass-progress" aria-hidden="true"><span style="width:' + (nationalRatio * 100).toFixed(1) + '%"></span></div>';
    html += '<div class="pokedex-pass-ready"><span>' + escapeHtml(t('pokedexRewardsReady', { count: claimableCount })) + '</span></div>';
    html += '</div>';
    html += '<div class="pokedex-pass-stage reward-only" aria-hidden="true">' + (nationalNext ? pokedexRewardVisualHtml(nationalNext, nationalNextType) : '<span class="pokedex-pass-area-token">OK</span>') + '</div>';
    html += renderPokedexNextReward(
      nationalNext,
      nationalNextType,
      nationalNext ? (nationalNextType === 'seen'
        ? t('pokedexSeenRewardProgress', { seen: Math.min(seen, nationalTarget), target: nationalTarget })
        : t('pokedexRewardProgress', { caught: Math.min(caught, nationalTarget), target: nationalTarget })) : '',
      nationalTarget > 0 ? (nationalNextType === 'seen' ? seen : caught) / nationalTarget : 0
    );
    html += '</section>';

    html += '<section class="pokedex-reward-section">';
    html += '<div class="pokedex-reward-section-head">';
    html += '<div><h3>' + escapeHtml(t('pokedexSeenPass')) + '</h3>';
    html += '<p>' + escapeHtml(t('pokedexSeenRewardProgress', { seen: seen, target: total })) + '</p></div>';
    html += '</div>';
    html += renderPokedexRewardTrack(seenMilestones, 'seen', seen, total, false);
    html += '</section>';

    html += '<section class="pokedex-reward-section">';
    html += '<div class="pokedex-reward-section-head">';
    html += '<div><h3>' + escapeHtml(t('pokedexOwnedPass')) + '</h3>';
    html += '<p>' + escapeHtml(t('pokedexRewardProgress', { caught: caught, target: total })) + '</p></div>';
    html += '</div>';
    html += renderPokedexRewardTrack(catchMilestones, 'catch', caught, total, false);
    html += '</section>';

    html += '<section class="pokedex-reward-section">';
    html += '<div class="pokedex-reward-section-head">';
    html += '<div><h3>' + escapeHtml(t('pokedexAreaDex')) + '</h3>';
    html += '<p>' + escapeHtml(t('pokedexAreaBoost')) + '</p></div>';
    html += '</div>';
    html += '<div class="pokedex-area-rewards">';
    for (var a = 0; a < areaProgress.length; a++) {
      var progress = areaProgress[a] || {};
      var areaId = progress.areaId || '';
      var areaMilestones = Array.isArray(progress.milestones) ? progress.milestones : [];
      var areaNext = nextUnclaimedPokedexReward(areaMilestones);
      var areaCaught = Number(progress.caughtCount) || 0;
      var areaTotal = Number(progress.totalCount) || 0;
      var areaMeta = areaDefById(areaId);
      html += '<div class="pokedex-area-reward">';
      html += '<div class="pokedex-area-reward-head">';
      html += '<span class="spawn-area-chip pokedex-area-reward-chip" style="' + escapeHtml(spawnAreaChipStyle(areaMeta)) + '"><span class="spawn-area-icon"></span>' + escapeHtml(localizedAreaLabel(areaId)) + '</span>';
      html += '<span>' + escapeHtml(t('pokedexAreaProgress', { caught: areaCaught, total: areaTotal })) + '</span>';
      html += '</div>';
      html += renderPokedexNextReward(
        areaNext,
        'area',
        areaNext ? t('pokedexRewardProgress', { caught: Math.min(areaCaught, Number(areaNext.threshold) || areaTotal), target: Number(areaNext.threshold) || areaTotal }) : '',
        areaNext ? areaCaught / (Number(areaNext.threshold) || areaTotal || 1) : 0
      );
      html += renderPokedexRewardTrack(areaMilestones, 'area', areaCaught, areaTotal, true);
      html += '</div>';
    }
    html += '</div></section></div>';
    pokedexRewardsPanelEl.innerHTML = html;
  }

  function pokedexMatchingAgents(pokemonId) {
    var snapshot = appState.snapshot || {};
    var matches = [];
    var seenAgentIds = {};

    function addAgent(agent, source) {
      if (!agent || !agent.agentId || seenAgentIds[agent.agentId]) return;
      if (Number(getRenderPokemonId(agent)) !== pokemonId) return;
      seenAgentIds[agent.agentId] = true;
      matches.push({ agent: agent, source: source });
    }

    var liveAgents = Array.isArray(snapshot.agents) ? snapshot.agents : [];
    var boxedAgents = Array.isArray(snapshot.boxedAgents) ? snapshot.boxedAgents : [];
    var subhistoryAgents = Array.isArray(snapshot.subagentHistory) ? snapshot.subagentHistory : [];

    for (var i = 0; i < liveAgents.length; i++) addAgent(liveAgents[i], 'live');
    for (var j = 0; j < boxedAgents.length; j++) addAgent(boxedAgents[j], 'boxed');
    for (var k = 0; k < subhistoryAgents.length; k++) addAgent(subhistoryAgents[k], 'subhistory');

    return matches;
  }

  function pokedexEncounterCount(pokemonId) {
    var matches = pokedexMatchingAgents(pokemonId);
    var discovery = pokedexDiscoveryInfo(pokemonId);
    var countedAgents = {};
    var count = matches.length;

    for (var i = 0; i < matches.length; i++) {
      countedAgents[matches[i].agent.agentId] = true;
    }

    if (discovery && discovery.agentId && !countedAgents[discovery.agentId]) {
      count += 1;
    }

    return count;
  }

  function pokedexRecentSightingInfo(pokemonId) {
    var matches = pokedexMatchingAgents(pokemonId);
    var best = null;
    var discovery = pokedexDiscoveryInfo(pokemonId);

    for (var i = 0; i < matches.length; i++) {
      var match = matches[i];
      var agent = match.agent;
      var ts = match.source === 'live'
        ? (agent.lastSeen || agent.createdAt || 0)
        : (agent.doneAt || agent.lastSeen || agent.createdAt || 0);
      if (!best || ts > best.ts) {
        best = {
          ts: ts,
          projectId: agent.projectId || null
        };
      }
    }

    if (best) return best;
    if (!discovery) return null;

    return {
      ts: discovery.discoveredAt || discovery.createdAt || 0,
      projectId: discovery.projectId || null
    };
  }

  function pokedexHabitatLabel(pokemonId) {
    var areaIndex = getPokemonAreaIndex(pokemonId);
    if (areaIndex >= 0 && AREA_DEFS[areaIndex]) {
      return localizedAreaLabel(AREA_DEFS[areaIndex]);
    }

    var rawHabitat = pokemonHabitat[pokemonId];
    if (!rawHabitat) {
      return uiState.pokedexLanguage === 'ko' ? '\ubbf8\ud655\uc778' : 'Unknown';
    }
    return formatPokemonName(String(rawHabitat).replace(/_/g, '-'));
  }

  function areaColorCss(area) {
    var color = area && typeof area.color === 'string' ? area.color.replace(/[^0-9a-fA-F]/g, '') : '';
    if (color.length !== 6) return '#8f98a4';
    return '#' + color.toUpperCase();
  }

  function areaColorRgb(area) {
    var color = areaColorCss(area).slice(1);
    return {
      r: parseInt(color.slice(0, 2), 16),
      g: parseInt(color.slice(2, 4), 16),
      b: parseInt(color.slice(4, 6), 16)
    };
  }

  function areaColorRgba(area, alpha) {
    var rgb = areaColorRgb(area);
    return 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', ' + alpha + ')';
  }

  function pokemonSpawnAreaMeta(pokemonId) {
    var areaIndex = getPokemonAreaIndex(pokemonId);
    if (areaIndex >= 0 && AREA_DEFS[areaIndex]) {
      var area = AREA_DEFS[areaIndex];
      return {
        known: true,
        id: area.id,
        label: pokedexHabitatLabel(pokemonId),
        color: areaColorCss(area),
        soft: areaColorRgba(area, 0.22),
        border: areaColorRgba(area, 0.62)
      };
    }
    return {
      known: false,
      id: 'unknown',
      label: localizedUnknownAreaLabel(),
      color: '#8f98a4',
      soft: 'rgba(143, 152, 164, 0.18)',
      border: 'rgba(143, 152, 164, 0.48)'
    };
  }

  function agentSpawnAreaMeta(agent) {
    return pokemonSpawnAreaMeta(getRenderPokemonId(agent));
  }

  function spawnAreaChipStyle(meta) {
    return '--spawn-area-color:' + meta.color + ';--spawn-area-soft:' + meta.soft + ';--spawn-area-border:' + meta.border + ';';
  }

  function spawnAreaChipHtml(meta, className) {
    var title = t('spawnArea', { area: meta.label });
    return '<span class="spawn-area-chip ' + escapeHtml(className || '') + '" style="' + escapeHtml(spawnAreaChipStyle(meta)) + '" title="' + escapeHtml(title) + '" aria-label="' + escapeHtml(title) + '">' +
      '<span class="spawn-area-icon" aria-hidden="true"></span>' +
      '<span class="spawn-area-label">' + escapeHtml(meta.label) + '</span>' +
      '</span>';
  }

  function pokedexTooltipLabels() {
    if (uiState.pokedexLanguage === 'ko') {
      return {
        metCount: '\ub9cc\ub09c \ud69f\uc218',
        habitat: '\uc11c\uc2dd\uc9c0',
        firstMeet: '\uccab \ub9cc\ub0a8',
        firstMeetHint: '\ucc98\uc74c \uae30\ub85d\ub41c \uc2dc\uac04',
        firstCatch: '\uccab \ud3ec\ud68d',
        firstCatchHint: '\ucc98\uc74c \uc7a1\uc740 \uc2dc\uac04',
        recentSeen: '\ucd5c\uadfc \ubaa9\uaca9',
        recentSeenHint: '\ub9c8\uc9c0\ub9c9\uc73c\ub85c \ud655\uc778\ub41c \uc2dc\uac04',
        project: '\ud504\ub85c\uc81d\ud2b8',
        date: '\ub0a0\uc9dc',
        time: '\uc2dc\uac04',
        undiscovered: '\uc544\uc9c1 \ub9cc\ub09c \uae30\ub85d\uc774 \uc5c6\uc5b4\uc694.'
      };
    }
    return {
      metCount: 'Met',
      habitat: 'Habitat',
      firstMeet: 'First encounter',
      firstMeetHint: 'First recorded moment',
      firstCatch: 'First catch',
      firstCatchHint: 'First captured moment',
      recentSeen: 'Recent sighting',
      recentSeenHint: 'Most recently observed',
      project: 'Project',
      date: 'Date',
      time: 'Time',
      undiscovered: 'No encounter recorded yet.'
    };
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function clampToRoomBounds(x, y, roomIndex, drawSize) {
    var room = areaBounds(roomIndex);
    var size = typeof drawSize === 'number' ? drawSize : DRAW_SIZE;
    return {
      x: clamp(x, room.x + ENTITY_EDGE_PAD, room.x + room.w - size - ENTITY_EDGE_PAD),
      y: clamp(y, room.y + ENTITY_EDGE_PAD, room.y + room.h - size - ENTITY_EDGE_PAD)
    };
  }

  function toShortId(value) {
    if (!value) return 'unknown';
    return value.length <= 14 ? value : value.slice(0, 6) + '...' + value.slice(-5);
  }

  function shortProjectName(projectId) {
    if (!projectId) return 'unknown';
    var segments = projectId.replace(/^-+/, '').split('-').filter(Boolean);
    var skip = { home:1, users:1, user:1, projects:1, repos:1, src:1, code:1, work:1, workspace:1, documents:1, desktop:1 };
    var last = -1;
    for (var i = 0; i < segments.length; i++) {
      if (skip[segments[i].toLowerCase()]) last = i;
    }
    var meaningful = segments.slice(last + 1);
    return meaningful.length > 0 ? meaningful.join('-') : segments[segments.length - 1] || projectId;
  }

  // Strip legacy "project: query" prefix from displayName for agents persisted before the split.
  // The prefix is a single token with no spaces followed by ": ".
  function stripProjectPrefix(displayName) {
    if (!displayName) return displayName;
    var colonIdx = displayName.indexOf(': ');
    if (colonIdx > 0 && colonIdx < 40) {
      var prefix = displayName.slice(0, colonIdx);
      if (prefix.indexOf(' ') === -1) {
        return displayName.slice(colonIdx + 2);
      }
    }
    return displayName;
  }

  function commandText(value) {
    if (!value) return '';
    return String(value).replace(/\s+/g, ' ').trim();
  }

  function snapshotSource() {
    var config = (appState.snapshot && appState.snapshot.config) || {};
    return String(config.source || '').toLowerCase();
  }

  function agentProvider(agent) {
    var provider = String((agent && agent.provider) || '').toLowerCase();
    if (provider) return provider;
    var source = snapshotSource();
    if (source === 'codex') return 'codex';
    if (source === 'claude') return 'claude';
    return '';
  }

  function defaultAgentTypeLabel(agent) {
    var provider = agentProvider(agent);
    if (provider === 'codex') return 'Codex';
    if (provider === 'claude') return 'Opus 4.6 (1M context)';
    return provider ? provider.charAt(0).toUpperCase() + provider.slice(1) : 'Agent';
  }

  function agentTypeLabel(agent, contextMax) {
    return formatModelName(agent && agent.model, contextMax) || defaultAgentTypeLabel(agent);
  }

  function agentContextStats(agent, fallbackMax) {
    var rawMax = Number(agent && agent.contextMax);
    var rawUsed = Number(agent && agent.contextUsed);
    var contextMax = Number.isFinite(rawMax) && rawMax > 0
      ? rawMax
      : (fallbackMax || 200000);
    var contextUsed = Number.isFinite(rawUsed) && rawUsed > 0 ? rawUsed : 0;
    var contextRemaining = Math.max(0, contextMax - contextUsed);
    var hpRatio = contextMax > 0 ? (contextRemaining / contextMax) : 0;

    return {
      contextMax: contextMax,
      contextUsed: contextUsed,
      contextRemaining: contextRemaining,
      hpRatio: hpRatio,
      hpPct: Math.max(0, Math.min(100, hpRatio * 100)),
      hpColor: hpBarColor(hpRatio)
    };
  }

  function summarizeCommand(value, maxLen) {
    var text = commandText(value);
    var limit = typeof maxLen === 'number' ? maxLen : 48;
    if (!text) return '';
    if (text.length <= limit) return text;
    return text.slice(0, Math.max(0, limit - 1)).trimEnd() + '...';
  }

  function agentLabel(agent) {
    if (agent.displayName) {
      var label = stripProjectPrefix(agent.displayName);
      if (agent.subagentType) label = '[' + agent.subagentType + '] ' + label;
      return label;
    }
    if (agent.subagentType) return agent.subagentType;
    return toShortId(agent.agentId);
  }

  function setCanvasSize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const nativeW = Math.max(Math.round(rect.width * dpr), 320);
    const nativeH = Math.max(Math.round(rect.height * dpr), 240);
    canvas.width = nativeW;
    canvas.height = nativeH;
    worldCanvas.width = nativeW;
    worldCanvas.height = nativeH;
    screenCtx.setTransform(1, 0, 0, 1, 0, 0);
    screenCtx.imageSmoothingEnabled = false;
  }

  function getTransform() {
    const scale = Math.min(worldCanvas.width / WORLD_WIDTH, worldCanvas.height / WORLD_HEIGHT);
    const offsetX = Math.floor((worldCanvas.width - WORLD_WIDTH * scale) / 2);
    const offsetY = Math.floor((worldCanvas.height - WORLD_HEIGHT * scale) / 2);
    return { scale, offsetX, offsetY };
  }

  function desiredAreaIndexForAgent(agent) {
    if (!agent) return -1;
    if (agent.parentId) {
      const parentEntity = appState.entityById.get(agent.parentId);
      if (parentEntity !== undefined) return parentEntity.roomIndex;
      const assigned = appState.roomAssignments.get(agent.parentId);
      if (assigned !== undefined) return assigned;
      var parentAgent = getAgentById(agent.parentId, agent.createdAt);
      if (parentAgent) return desiredAreaIndexForAgent(parentAgent);
      return -1;
    }
    var pokemonId = getRenderPokemonId(agent);
    return getPokemonAreaIndex(pokemonId);
  }

  function getAreaIndex(agent) {
    // Child agents follow their parent's area
    if (agent.parentId) {
      const parentEntity = appState.entityById.get(agent.parentId);
      if (parentEntity !== undefined) return parentEntity.roomIndex;
      const assigned = appState.roomAssignments.get(agent.parentId);
      if (assigned !== undefined) return assigned;
    }
    const existing = appState.roomAssignments.get(agent.agentId);
    if (existing !== undefined) {
      if (!agent.parentId && agent.isPromoCustom) {
        var desiredPromoArea = desiredAreaIndexForAgent(agent);
        if (desiredPromoArea >= 0 && desiredPromoArea !== existing) {
          appState.roomAssignments.set(agent.agentId, desiredPromoArea);
          return desiredPromoArea;
        }
      }
      return existing;
    }

    // Determine area from the agent's assigned pokemon's habitat
    var habitatArea = desiredAreaIndexForAgent(agent);
    if (habitatArea >= 0) {
      appState.roomAssignments.set(agent.agentId, habitatArea);
      return habitatArea;
    }

    // Fallback: assign to a land area round-robin
    const landAreas = 7;
    const occupied = new Set(appState.roomAssignments.values());
    for (let i = 0; i < landAreas; i++) {
      if (!occupied.has(i)) {
        appState.roomAssignments.set(agent.agentId, i);
        return i;
      }
    }
    const idx = appState.roomAssignments.size % landAreas;
    appState.roomAssignments.set(agent.agentId, idx);
    return idx;
  }

  class LocalSpriteProvider {
    constructor() {
      this.cache = new Map();
    }

    getSprite(agent, frame, status) {
      const palette = colorSeeds[hashCode(agent.agentId) % colorSeeds.length];
      const key = palette.join('|') + ':' + status + ':' + frame;
      if (this.cache.has(key)) return this.cache.get(key);

      const sprite = document.createElement('canvas');
      sprite.width = SPRITE_SIZE;
      sprite.height = SPRITE_SIZE;
      const ctx = sprite.getContext('2d');
      ctx.imageSmoothingEnabled = false;

      const body = palette[0];
      const outline = palette[1];
      const light = palette[2];
      const bob = (status === 'Idle' || status === 'Sleeping') ? (frame % 2 === 0 ? 0 : 1) : 0;

      function px(x, y, color) {
        ctx.fillStyle = color;
        ctx.fillRect(x, y + bob, 1, 1);
      }

      for (let y = 5; y <= 11; y += 1) {
        for (let x = 4; x <= 11; x += 1) px(x, y, body);
      }
      for (let y = 4; y <= 12; y += 1) { px(3, y, outline); px(12, y, outline); }
      for (let x = 3; x <= 12; x += 1) { px(x, 4, outline); px(x, 12, outline); }
      px(5, 4, body); px(10, 4, body); px(4, 3, outline); px(11, 3, outline);
      px(6, 7, '#111'); px(9, 7, '#111'); px(7, 9, light); px(8, 9, light);

      if (status === 'Outputting') {
        px(7, 10, '#111'); px(8, 10, '#111');
        if (frame % 2 === 0) px(9, 10, '#111');
      }
      if (status === 'Tool-Running') {
        const offset = frame % 3;
        px(12, 8 + (offset === 0 ? -1 : offset === 2 ? 1 : 0), '#e9e2d0');
        px(13, 8, '#111');
      }
      if (status === 'Waiting') px(7, 10, '#111');
      if (status === 'Thinking') px(7, 6, light);

      this.cache.set(key, sprite);
      return sprite;
    }
  }

  class PokeApiSpriteProvider {
    constructor(localProvider) {
      this.localProvider = localProvider;
      this.urls = new Map();
      this.failedIds = new Set();
      this.sleepScaleCache = new Map();
      this.sleepScalePending = new Set();
    }

    getSpriteUrl(agent, sleeping) {
      const id = getRenderPokemonId(agent);
      if (this.failedIds.has(id)) return null;
      var spec = pokemonSpriteSpec(sleeping);
      var folder = spec.folder;
      var cacheKey = folder + ':' + id;
      if (this.urls.has(cacheKey)) return this.urls.get(cacheKey);
      var url = spriteUrl(folder, id, spec.ext);
      this.urls.set(cacheKey, url);
      // Preload to detect failures
      var img = new Image();
      img.onerror = () => { this.failedIds.add(id); this.urls.delete(cacheKey); };
      img.src = url;
      return url;
    }

    getSprite(agent, frame, status) {
      return this.localProvider.getSprite(agent, frame, status);
    }

    getSleepScale(agent) {
      var id = getRenderPokemonId(agent);
      if (this.sleepScaleCache.has(id)) {
        return this.sleepScaleCache.get(id);
      }
      this.primeSleepScale(id);
      return FALLBACK_SLEEP_SPRITE_SCALE;
    }

    primeSleepScale(id) {
      if (!id || this.sleepScalePending.has(id)) return;

      this.sleepScalePending.add(id);

      var staticImg = new Image();
      var animatedImg = new Image();
      var staticMax = 96;
      var animatedMax = 96;
      var remaining = 2;
      var self = this;

      function finish() {
        remaining -= 1;
        if (remaining > 0) return;
        self.sleepScalePending.delete(id);
        var rawScale = staticMax / Math.max(1, animatedMax);
        var finalScale = clamp(rawScale, MIN_SLEEP_SPRITE_SCALE, MAX_SLEEP_SPRITE_SCALE);
        self.sleepScaleCache.set(id, finalScale);
      }

      staticImg.onload = function () {
        staticMax = Math.max(staticImg.naturalWidth || 0, staticImg.naturalHeight || 0, 1);
        finish();
      };
      staticImg.onerror = finish;

      animatedImg.onload = function () {
        animatedMax = Math.max(animatedImg.naturalWidth || 0, animatedImg.naturalHeight || 0, 1);
        finish();
      };
      animatedImg.onerror = finish;

      staticImg.src = spriteUrl('static', id, 'png');
      animatedImg.src = spriteUrl('animated', id, 'gif');
    }
  }

  const localProvider = new LocalSpriteProvider();
  const pokeProvider = new PokeApiSpriteProvider(localProvider);
  const FALLBACK_SLEEP_SPRITE_SCALE = 1.9;
  const MIN_SLEEP_SPRITE_SCALE = 0.6;
  const MAX_SLEEP_SPRITE_SCALE = 2.8;

  function spriteProvider() {
    return appState.snapshot.config && appState.snapshot.config.enablePokeapiSprites ? pokeProvider : localProvider;
  }

  // --- Pokeball sprite (16x16 pixel art, drawn once) ---
  const pokeballSprite = (function () {
    const c = document.createElement('canvas');
    c.width = 16; c.height = 16;
    const g = c.getContext('2d');
    g.imageSmoothingEnabled = false;
    function px(x, y, color) { g.fillStyle = color; g.fillRect(x, y, 1, 1); }
    var O = '#222', R = '#e03030', W = '#f8f8f8', L = '#c02020', G = '#aaa';
    // Top half (red)
    for (var x = 4; x <= 11; x++) px(x, 1, O);
    for (var x = 3; x <= 12; x++) px(x, 2, O);
    px(3, 2, O); px(12, 2, O);
    for (var x = 4; x <= 11; x++) px(x, 2, R);
    px(2, 3, O); for (var x = 3; x <= 12; x++) px(x, 3, R); px(13, 3, O);
    px(1, 4, O); for (var x = 2; x <= 13; x++) px(x, 4, R); px(14, 4, O);
    px(1, 5, O); for (var x = 2; x <= 13; x++) px(x, 5, R); px(14, 5, O);
    px(1, 6, O); for (var x = 2; x <= 13; x++) px(x, 6, R); px(14, 6, O);
    // Highlight
    px(4, 3, L); px(5, 3, '#f06060'); px(4, 4, '#f06060'); px(5, 4, '#f88'); px(5, 5, '#f06060');
    // Center band
    px(1, 7, O); for (var x = 2; x <= 13; x++) px(x, 7, G); px(14, 7, O);
    px(1, 8, O); for (var x = 2; x <= 13; x++) px(x, 8, G); px(14, 8, O);
    // Button
    px(6, 7, O); px(9, 7, O); px(6, 8, O); px(9, 8, O);
    px(7, 7, W); px(8, 7, W); px(7, 8, W); px(8, 8, W);
    px(7, 6, O); px(8, 6, O); px(7, 9, O); px(8, 9, O);
    // Bottom half (white)
    px(1, 9, O); for (var x = 2; x <= 13; x++) px(x, 9, W); px(14, 9, O);
    px(1, 10, O); for (var x = 2; x <= 13; x++) px(x, 10, W); px(14, 10, O);
    px(1, 11, O); for (var x = 2; x <= 13; x++) px(x, 11, W); px(14, 11, O);
    px(2, 12, O); for (var x = 3; x <= 12; x++) px(x, 12, W); px(13, 12, O);
    px(3, 13, O); for (var x = 4; x <= 11; x++) px(x, 13, W); px(12, 13, O);
    for (var x = 4; x <= 11; x++) px(x, 14, O);
    return c;
  })();

  // Open pokeball sprite (top half lifted)
  const pokeballOpenSprite = (function () {
    var c = document.createElement('canvas');
    c.width = 16; c.height = 16;
    var g = c.getContext('2d');
    g.imageSmoothingEnabled = false;
    function px(x, y, color) { g.fillStyle = color; g.fillRect(x, y, 1, 1); }
    var O = '#222', R = '#e03030', W = '#f8f8f8', G = '#aaa';
    // Top half shifted up 3px and slightly apart
    for (var x = 4; x <= 11; x++) px(x, 0, O);
    px(3, 1, O); for (var x = 4; x <= 11; x++) px(x, 1, R); px(12, 1, O);
    px(2, 2, O); for (var x = 3; x <= 12; x++) px(x, 2, R); px(13, 2, O);
    px(2, 3, O); for (var x = 3; x <= 12; x++) px(x, 3, R); px(13, 3, O);
    // Center band + button (stays in place)
    px(1, 7, O); for (var x = 2; x <= 13; x++) px(x, 7, G); px(14, 7, O);
    px(1, 8, O); for (var x = 2; x <= 13; x++) px(x, 8, G); px(14, 8, O);
    px(6, 7, O); px(9, 7, O); px(6, 8, O); px(9, 8, O);
    px(7, 7, '#ff0'); px(8, 7, '#ff0'); px(7, 8, '#ff0'); px(8, 8, '#ff0');
    px(7, 6, O); px(8, 6, O); px(7, 9, O); px(8, 9, O);
    // Bottom half (white)
    px(1, 9, O); for (var x = 2; x <= 13; x++) px(x, 9, W); px(14, 9, O);
    px(1, 10, O); for (var x = 2; x <= 13; x++) px(x, 10, W); px(14, 10, O);
    px(1, 11, O); for (var x = 2; x <= 13; x++) px(x, 11, W); px(14, 11, O);
    px(2, 12, O); for (var x = 3; x <= 12; x++) px(x, 12, W); px(13, 12, O);
    px(3, 13, O); for (var x = 4; x <= 11; x++) px(x, 13, W); px(12, 13, O);
    for (var x = 4; x <= 11; x++) px(x, 14, O);
    return c;
  })();

  // --- Spawn/despawn animation state ---
  // key: agentId, value: { type: 'spawn'|'despawn', startTime, x, y, entity?, agent? }
  const animations = new Map();

  function startSpawnAnimation(agentId, entity) {
    animations.set(agentId, {
      type: 'spawn',
      startTime: performance.now(),
      x: entity.baseX,
      y: entity.baseY
    });
  }

  function startDespawnAnimation(agentId, entity, agent) {
    animations.set(agentId, {
      type: 'despawn',
      startTime: performance.now(),
      x: entity.x,
      y: entity.y,
      agent: agent  // keep ref for final sprite render
    });
  }

  function getEntityDepth(entityId) {
    var depth = 0;
    var cur = appState.entityById.get(entityId);
    while (cur && cur.parentId) {
      depth++;
      cur = appState.entityById.get(cur.parentId);
      if (depth > 10) break;
    }
    return depth;
  }

  // Minimum distance between entity centers to avoid overlap
  var MIN_ENTITY_DIST = DRAW_SIZE + 4;

  // Check if a candidate position overlaps any existing entity
  function overlapsExisting(cx, cy) {
    for (const e of appState.entityById.values()) {
      var existingSize = e.drawSize || DRAW_SIZE;
      var ex = e.baseX + existingSize / 2;
      var ey = e.baseY + existingSize / 2;
      var minDist = (DRAW_SIZE + existingSize) * 0.5 + 2;
      var dx = cx - ex, dy = cy - ey;
      if (dx * dx + dy * dy < minDist * minDist) return true;
    }
    return false;
  }

  // Pick a non-overlapping random position inside the area
  function pickSlotInArea(roomIndex, seed) {
    if (isDetailAreaRoom(roomIndex)) {
      var detailRoom = areaBounds(roomIndex);
      var detailMargin = DRAW_SIZE + ENTITY_EDGE_PAD;
      var detailUsableW = Math.max(1, detailRoom.w - detailMargin * 2);
      var detailUsableH = Math.max(1, detailRoom.h - detailMargin * 2);
      for (var detailAttempt = 0; detailAttempt < 60; detailAttempt++) {
        var detailX = detailRoom.x + detailMargin + ((seed + detailAttempt * 3571) % detailUsableW);
        var detailY = detailRoom.y + detailMargin + (((seed + detailAttempt * 7919) * 2654435761) >>> 0) % detailUsableH;
        if (!overlapsExisting(detailX + DRAW_SIZE / 2, detailY + DRAW_SIZE / 2)) {
          return { x: detailX, y: detailY };
        }
      }
      return {
        x: detailRoom.x + detailRoom.w / 2 - DRAW_SIZE / 2,
        y: detailRoom.y + detailRoom.h / 2 - DRAW_SIZE / 2
      };
    }

    if (areaMaskReady && areaValidCoords[roomIndex] && areaValidCoords[roomIndex].length > 0) {
      var list = areaValidCoords[roomIndex];
      // Use two different hash components to spread starting positions
      var startIdx = seed % list.length;

      // Try up to 50 candidates with a large prime stride for good spread
      for (var attempt = 0; attempt < 50; attempt++) {
        var idx = (startIdx + attempt * 7919) % list.length;
        var coord = list[idx];
        var cx = coord.x, cy = coord.y;
        var candidate = clampToRoomBounds(cx - DRAW_SIZE / 2, cy - DRAW_SIZE / 2, roomIndex);
        if (candidate.x !== cx - DRAW_SIZE / 2 || candidate.y !== cy - DRAW_SIZE / 2) {
          continue;
        }
        if (!overlapsExisting(cx, cy)) {
          return candidate;
        }
      }
      // All candidates overlapped — use the seed pick anyway
      var coord = list[startIdx];
      return clampToRoomBounds(coord.x - DRAW_SIZE / 2, coord.y - DRAW_SIZE / 2, roomIndex);
    }
    // Fallback when mask not loaded: scatter within the bounding box using seed
    var room = areaBounds(roomIndex);
    var margin = DRAW_SIZE + ENTITY_EDGE_PAD;
    var usableW = Math.max(1, room.w - margin * 2);
    var usableH = Math.max(1, room.h - margin * 2);
    // Pseudo-random scatter based on seed
    var px = room.x + margin + (seed % usableW);
    var py = room.y + margin + ((seed * 7919) % usableH);
    // Try a few offsets to avoid overlap
    for (var attempt = 0; attempt < 15; attempt++) {
      var tx = room.x + margin + ((seed + attempt * 3571) % usableW);
      var ty = room.y + margin + (((seed + attempt * 7919) * 2654435761) >>> 0) % usableH;
      if (!overlapsExisting(tx + DRAW_SIZE / 2, ty + DRAW_SIZE / 2)) {
        return { x: tx, y: ty };
      }
    }
    return { x: px, y: py };
  }

  // Clamp a position to stay inside the area (mask-aware)
  function clampToArea(x, y, roomIndex, drawSize) {
    var size = typeof drawSize === 'number' ? drawSize : DRAW_SIZE;
    var clamped = clampToRoomBounds(x, y, roomIndex, size);
    var cx = clamped.x;
    var cy = clamped.y;
    if (isDetailAreaRoom(roomIndex)) {
      return { x: cx, y: cy };
    }
    // If mask is available, verify the center of the sprite is inside the area
    if (areaMaskReady && !isInsideArea(cx + size / 2, cy + size / 2, roomIndex)) {
      // Find nearest valid coord in this area
      var best = pickSlotInArea(roomIndex, hashCode(cx + ',' + cy));
      cx = best.x; cy = best.y;
    }
    return { x: cx, y: cy };
  }

  function overlapsExistingAt(x, y, drawSize, ignoreId) {
    var size = typeof drawSize === 'number' ? drawSize : DRAW_SIZE;
    var cx = x + size / 2;
    var cy = y + size / 2;
    for (const e of appState.entityById.values()) {
      if (ignoreId && e.id === ignoreId) continue;
      var existingSize = e.drawSize || DRAW_SIZE;
      var ex = e.baseX + existingSize / 2;
      var ey = e.baseY + existingSize / 2;
      var minDist = (existingSize + size) * 0.5 + 2;
      var dx = cx - ex;
      var dy = cy - ey;
      if (dx * dx + dy * dy < minDist * minDist) return true;
    }
    return false;
  }

  function pickNearbySubagentSlot(parentEntity, roomIndex, seed, drawSize, agentId) {
    var parentX = typeof parentEntity.x === 'number' ? parentEntity.x : parentEntity.baseX;
    var parentY = typeof parentEntity.y === 'number' ? parentEntity.y : parentEntity.baseY;
    var parentCX = parentX + DRAW_SIZE / 2;
    var parentCY = parentY + DRAW_SIZE / 2;
    var bounds = getSubagentRadiusBounds(drawSize);
    var minRadius = bounds.min;
    var maxRadius = bounds.max;
    var slotCount = SUBAGENT_RING_SLOTS;
    var ringStep = Math.max(SUBAGENT_RING_STEP, drawSize * 0.45);
    var angleOffset = (seed % 360) * (Math.PI / 180);
    var best = null;
    var bestScore = Infinity;

    for (var ring = 0; ring < 3; ring++) {
      var radius = Math.min(maxRadius, Math.max(minRadius + 1, SUBAGENT_RING_BASE_RADIUS + ring * ringStep));
      for (var slotIndex = 0; slotIndex < slotCount; slotIndex++) {
        var angle = angleOffset + (Math.PI * 2 * slotIndex / slotCount);
        var x = parentCX + Math.cos(angle) * radius - drawSize / 2;
        var y = parentCY + Math.sin(angle) * radius - drawSize / 2;
        var clamped = clampToArea(x, y, roomIndex, drawSize);
        var dx = (clamped.x + drawSize / 2) - parentCX;
        var dy = (clamped.y + drawSize / 2) - parentCY;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < minRadius) continue;
        if (dist > maxRadius) continue;
        var score = Math.abs(dist - radius);
        if (score < bestScore) {
          best = clamped;
          bestScore = score;
        }
        if (!overlapsExistingAt(clamped.x, clamped.y, drawSize, agentId)) {
          return clamped;
        }
      }
    }

    if (best) {
      return best;
    }

    for (var attempt = 0; attempt < 24; attempt++) {
      var angle = angleOffset + (Math.PI * 2 * attempt / 24);
      var radius = Math.min(maxRadius, minRadius + 1 + attempt * 0.5);
      var x = parentCX + Math.cos(angle) * radius - drawSize / 2;
      var y = parentCY + Math.sin(angle) * radius - drawSize / 2;
      var clamped = clampToArea(x, y, roomIndex, drawSize);
      var dx = (clamped.x + drawSize / 2) - parentCX;
      var dy = (clamped.y + drawSize / 2) - parentCY;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < minRadius || dist > maxRadius) continue;
      if (!overlapsExistingAt(clamped.x, clamped.y, drawSize, agentId)) {
        return clamped;
      }
    }

    return clampToArea(parentCX + maxRadius - drawSize / 2, parentCY - drawSize / 2, roomIndex, drawSize);
  }

  function getParentAnchor(parentId, roomIndex) {
    if (!parentId) return null;
    var liveParent = appState.entityById.get(parentId);
    if (liveParent) {
      return {
        x: liveParent.baseX,
        y: liveParent.baseY,
        roomIndex: liveParent.roomIndex
      };
    }

    var cached = positionCache[parentId];
    if (cached && typeof cached.x === 'number' && typeof cached.y === 'number') {
      return {
        x: cached.x,
        y: cached.y,
        roomIndex: typeof cached.roomIndex === 'number' ? cached.roomIndex : roomIndex
      };
    }

    return null;
  }

  function subagentDistanceFromParent(x, y, drawSize, parentAnchor) {
    if (!parentAnchor) return Infinity;
    var parentCX = parentAnchor.x + DRAW_SIZE / 2;
    var parentCY = parentAnchor.y + DRAW_SIZE / 2;
    var childCX = x + drawSize / 2;
    var childCY = y + drawSize / 2;
    var dx = childCX - parentCX;
    var dy = childCY - parentCY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function isValidSubagentPosition(x, y, drawSize, parentAnchor) {
    if (!parentAnchor) return false;
    var bounds = getSubagentRadiusBounds(drawSize);
    var minRadius = bounds.min;
    var maxRadius = bounds.max;
    var dist = subagentDistanceFromParent(x, y, drawSize, parentAnchor);
    return dist >= minRadius && dist <= maxRadius + 2;
  }

  function getSubagentRadiusBounds(drawSize) {
    var minRadius = Math.ceil((DRAW_SIZE + drawSize) * 0.5) + 2;
    var maxRadius = minRadius + Math.max(6, Math.round(drawSize * 0.35));
    return { min: minRadius, max: maxRadius };
  }

  function clampSubagentToParentRadius(x, y, roomIndex, drawSize, parentAnchor) {
    var clamped = clampToArea(x, y, roomIndex, drawSize);
    if (!parentAnchor) return null;
    if (isValidSubagentPosition(clamped.x, clamped.y, drawSize, parentAnchor)) {
      return clamped;
    }
    return pickNearbySubagentSlot(parentAnchor, roomIndex, hashCode(String(x) + ',' + String(y)), drawSize);
  }

  function ensureEntity(agent) {
    let entity = appState.entityById.get(agent.agentId);
    if (entity) return entity;

    var drawSize = agent.parentId ? SUBAGENT_DRAW_SIZE : DRAW_SIZE;
    var parentAnchor = agent.parentId ? getParentAnchor(agent.parentId, getAreaIndex(agent)) : null;

    // Try to restore from localStorage cache
    var cached = positionCache[agent.agentId];
    if (cached && typeof cached.x === 'number' && typeof cached.y === 'number') {
      var cachedRoom = typeof cached.roomIndex === 'number' ? cached.roomIndex : getAreaIndex(agent);
      var cachedPos = clampToArea(cached.x, cached.y, cachedRoom, drawSize);
      if (agent.parentId) {
        var cachedParentAnchor = getParentAnchor(agent.parentId, cachedRoom);
        if (!cachedParentAnchor) {
          cached = null;
        } else if (!isValidSubagentPosition(cachedPos.x, cachedPos.y, drawSize, cachedParentAnchor)) {
          cachedPos = pickNearbySubagentSlot(cachedParentAnchor, cachedRoom, hashCode(agent.agentId), drawSize, agent.agentId);
        }
      }
      if (cached) {
        appState.roomAssignments.set(agent.agentId, cachedRoom);
        entity = {
          id: agent.agentId,
          parentId: agent.parentId || null,
          x: cachedPos.x,
          y: cachedPos.y,
          baseX: cachedPos.x,
          baseY: cachedPos.y,
        roomIndex: cachedRoom
        ,
        drawSize: drawSize
      };
        appState.entityById.set(agent.agentId, entity);
        savePositionCache();
        startSpawnAnimation(agent.agentId, entity);
        return entity;
      }
    }

    const roomIndex = getAreaIndex(agent);
    const room = AREAS[roomIndex];

    var slot;
    if (agent.parentId) {
      if (parentAnchor) {
        var siblingIndex = 0;
        for (const e of appState.entityById.values()) {
          if (e.parentId === agent.parentId) siblingIndex++;
        }
        // Shrink orbit radius for deeper nesting levels
        var depth = getEntityDepth(agent.parentId) + 1;
        var radiusShrink = Math.max(0.4, 1.0 - (depth - 1) * 0.25);
        var baseRadius = SUBAGENT_RING_BASE_RADIUS * radiusShrink;
        var stepRadius = SUBAGENT_RING_STEP * radiusShrink;
        var radiusBounds = getSubagentRadiusBounds(drawSize);

        var ring = Math.floor(siblingIndex / SUBAGENT_RING_SLOTS);
        var slotInRing = siblingIndex % SUBAGENT_RING_SLOTS;
        // Offset angle by depth to avoid overlapping orbit patterns
        var angleOffset = depth * (Math.PI / 7);
        var angle = (Math.PI * 2 * slotInRing / SUBAGENT_RING_SLOTS) - Math.PI / 2 + angleOffset;
        var orbitRadius = Math.min(radiusBounds.max, Math.max(radiusBounds.min + 1, baseRadius + ring * (stepRadius + 2)));

        var parentCX = parentAnchor.x + DRAW_SIZE / 2;
        var parentCY = parentAnchor.y + DRAW_SIZE / 2;
        slot = {
          x: parentCX + Math.cos(angle) * orbitRadius - drawSize / 2,
          y: parentCY + Math.sin(angle) * orbitRadius - drawSize / 2
        };

        // Keep subagents close to the parent even when area clamping kicks in.
        var clamped = clampSubagentToParentRadius(slot.x, slot.y, roomIndex, drawSize, parentAnchor);
        // Check if clamped position is too close to parent
        var dx = (clamped.x + drawSize / 2) - parentCX;
        var dy = (clamped.y + drawSize / 2) - parentCY;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < ((DRAW_SIZE + drawSize) * 0.5) + 2) {
          clamped = pickNearbySubagentSlot(parentAnchor, roomIndex, hashCode(agent.agentId + ':near'), drawSize, agent.agentId);
        }
        // If still overlapping another entity, find a non-overlapping spot
        if (overlapsExistingAt(clamped.x, clamped.y, drawSize, agent.agentId)) {
          var nearby = pickNearbySubagentSlot(parentAnchor, roomIndex, hashCode(agent.agentId), drawSize, agent.agentId);
          clamped.x = nearby.x;
          clamped.y = nearby.y;
        }
        slot.x = clamped.x;
        slot.y = clamped.y;
      } else {
        return null;
      }
    } else {
      // Root agent: use mask to place inside the area
      slot = pickSlotInArea(roomIndex, hashCode(agent.agentId));
    }

    slot = agent.parentId
      ? clampSubagentToParentRadius(slot.x, slot.y, roomIndex, drawSize, parentAnchor)
      : clampToArea(slot.x, slot.y, roomIndex, drawSize);
    if (!slot) return null;

    entity = {
      id: agent.agentId,
      parentId: agent.parentId || null,
      x: slot.x,
      y: slot.y,
      baseX: slot.x,
      baseY: slot.y,
      roomIndex: roomIndex
      ,
      drawSize: drawSize
    };

    appState.entityById.set(agent.agentId, entity);
    savePositionCache();
    startSpawnAnimation(agent.agentId, entity);
    return entity;
  }

  function reconcileEntities(agents) {
    const live = new Set(agents.map(function (a) { return a.agentId; }));
    for (const agentId in subagentPokemonCache) {
      if (!live.has(agentId)) {
        delete subagentPokemonCache[agentId];
      }
    }
    for (const [id, entity] of appState.entityById.entries()) {
      if (!live.has(id)) {
        // Start despawn animation instead of instant removal
        if (!animations.has(id)) {
          var lastAgent = appState.prevAgentMap ? appState.prevAgentMap.get(id) : null;
          startDespawnAnimation(id, entity, lastAgent);
        }
        appState.entityById.delete(id);
      }
    }
    for (const id of appState.roomAssignments.keys()) {
      if (!live.has(id)) {
        // Delay room cleanup until despawn animation finishes
        if (!animations.has(id)) appState.roomAssignments.delete(id);
      }
    }
    savePositionCache();
    // Keep a map of current agents for despawn sprite reference
    appState.prevAgentMap = new Map(agents.map(function (a) { return [a.agentId, a]; }));

    // Sort agents so parents are always processed before children
    var agentById = {};
    for (var i = 0; i < agents.length; i++) {
      agentById[agents[i].agentId] = agents[i];
    }
    var sorted = [];
    var visited = {};
    function visit(agent) {
      if (visited[agent.agentId]) return;
      visited[agent.agentId] = true;
      if (agent.parentId && agentById[agent.parentId]) {
        visit(agentById[agent.parentId]);
      }
      sorted.push(agent);
    }
    for (var i = 0; i < agents.length; i++) {
      visit(agents[i]);
    }

    for (var i = 0; i < sorted.length; i++) {
      ensureEntity(sorted[i]);
    }
  }

  function normalizeAreaFilter(areaId) {
    return areaDefById(areaId) ? areaId : 'all';
  }

  function snapshotAgents() {
    return (appState.snapshot && appState.snapshot.agents) || [];
  }

  function filteredAgents() {
    var areaIndex = selectedAreaIndex();
    return snapshotAgents().filter(function (agent) {
      if (areaIndex >= 0 && getAreaIndex(agent) !== areaIndex) return false;
      return true;
    });
  }

  function outsideAreaAgents() {
    var areaIndex = selectedAreaIndex();
    if (areaIndex < 0) return [];
    return snapshotAgents().filter(function (agent) {
      return getAreaIndex(agent) !== areaIndex;
    });
  }

  function listedAgents() {
    return snapshotAgents().slice();
  }

  function updateFilterOptions() {
    if (!areaFilterEl) return;
    var areaControl = areaFilterEl.closest ? areaFilterEl.closest('.control') : null;
    var areaControlText = areaControl ? areaControl.querySelector('span') : null;
    if (areaControlText) areaControlText.textContent = localizedAreaControlLabel();
    areaFilterEl.setAttribute('aria-label', localizedAreaControlLabel());
    areaFilterEl.innerHTML = '';
    var allOpt = document.createElement('option');
    allOpt.value = 'all';
    allOpt.textContent = localizedAllAreasLabel();
    if (uiState.areaFilter === 'all') allOpt.selected = true;
    areaFilterEl.appendChild(allOpt);
    for (var j = 0; j < AREA_DEFS.length; j++) {
      var area = AREA_DEFS[j];
      var opt = document.createElement('option');
      opt.value = area.id;
      opt.textContent = localizedAreaLabel(area);
      if (area.id === uiState.areaFilter) opt.selected = true;
      areaFilterEl.appendChild(opt);
    }
    if (uiState.areaFilter !== 'all' && !areaDefById(uiState.areaFilter)) {
      uiState.areaFilter = 'all';
    }
    areaFilterEl.value = uiState.areaFilter;
  }

  function syncAreaFilterFromSnapshot(config) {
    var nextArea = normalizeAreaFilter((config && config.explorationAreaId) || appState.snapshot.explorationAreaId);
    if (uiState.areaFilter === nextArea) return;
    uiState.areaFilter = nextArea;
    syncTerrainImage();
  }

  function setAreaFilter(areaId, options) {
    options = options || {};
    var nextArea = normalizeAreaFilter(areaId);
    if (uiState.areaFilter === nextArea) return;
    uiState.areaFilter = nextArea;
    syncTerrainImage();
    applyPositionCacheScope((appState.snapshot && appState.snapshot.config) || {});
    reconcileEntities(filteredAgents());
    renderAgentList();
    tokenTotalEl.textContent = formatTokenCount(filteredTokenTotal(filteredAgents()));
    if (options.syncServer !== false && transport.explorationArea) {
      Promise.resolve(transport.explorationArea(nextArea)).catch(function () {});
    }
  }

  function resetFilters() {
    setAreaFilter('all');
    if (areaFilterEl) areaFilterEl.value = 'all';
  }

  function buildAgentTree(agents) {
    var byId = {};
    var roots = [];
    for (var i = 0; i < agents.length; i++) {
      byId[agents[i].agentId] = agents[i];
    }
    for (var i = 0; i < agents.length; i++) {
      var agent = agents[i];
      if (agent.parentId && byId[agent.parentId]) {
        var parent = byId[agent.parentId];
        if (!parent._children) parent._children = [];
        parent._children.push(agent);
      } else {
        roots.push(agent);
      }
    }
    return { roots: roots, byId: byId };
  }

  function renderAgentCard(agent, depth, tree, expandedIds, collapsedIds) {
    var contextStats = agentContextStats(agent);
    var contextMax = contextStats.contextMax;
    var contextRemaining = contextStats.contextRemaining;
    var barColor = contextStats.hpColor;
    var barPct = contextStats.hpPct;
    var childCount = agent._children ? agent._children.length : 0;

    var activeClass = agent.isActive ? ' active' : (agent.isSleeping ? ' sleeping' : ' idle');
    var isExpanded = expandedIds[agent.agentId] ? ' expanded' : '';
    var hierarchyClass = depth > 0 ? ' subagent-card' : ' root-card';
    var branchHostClass = childCount > 0 ? ' branch-host' : '';

    var xp = agentLevelProgress(agent);
    var spriteUrl = agent.isSleeping ? pokemonStaticIconUrl(agent) : pokemonIconUrl(agent);
    var name = agentPanelName(agent);
    var lastCommand = commandText(agent.lastCommand);
    var parentAgent = depth > 0 && agent.parentId ? tree.byId[agent.parentId] : null;
    var parentName = parentAgent ? agentPanelName(parentAgent) : (agent.parentId ? toShortId(agent.parentId) : '');
    var fullLabel = agentLabel(agent);
    var subhistoryCount = subhistoryFamilyCount(agent.agentId);
    var uptime = formatUptime(agent.createdAt);
    var secsAgo = Math.max(0, Math.floor((Date.now() - agent.lastSeen) / 1000));
    var visibleChildLabel = currentLanguage() === 'ko' ? '하위 ' + childCount : childCount + ' sub' + (childCount === 1 ? '' : 's');
    var isCollapsed = isSubtreeCollapsed(agent.agentId, depth, childCount, collapsedIds);
    var adopted = ownedPokemonForEncounter(agent);

    var html = '';
    html += '<article class="poke-slot' + hierarchyClass + activeClass + isExpanded + branchHostClass + '" data-agent-id="' + escapeHtml(agent.agentId) + '" data-depth="' + depth + '">';

    html += '<img class="poke-slot-sprite" src="' + escapeHtml(spriteUrl) + '" />';

    html += '<div class="poke-slot-info">';

    html += '<div class="poke-slot-row1">';
    html += '<div class="poke-slot-title">';
    html += '<div class="poke-lv-row">';
    html += '<span class="poke-lv">LV.' + xp.level + '</span>';
    if (!agent.parentId) {
      var projName = shortProjectName(agent.projectId);
      html += '<span class="poke-project-badge" data-full="' + escapeHtml(projName) + '">' + escapeHtml(projName) + '</span>';
    }
    html += '</div>';
    html += '<span class="poke-slot-name" title="' + escapeHtml(fullLabel) + '">' + escapeHtml(name) + '</span>';
    html += '</div>';
    html += '<span class="poke-slot-status">' + escapeHtml(localizedStatusText(agent.status)) + '</span>';
    html += '</div>';

    if (depth > 0 || childCount > 0) {
      html += '<div class="poke-slot-row-meta">';
      if (depth > 0) {
        html += '<span class="poke-subagent-badge">SUB</span>';
        html += '<span class="poke-depth-badge">D' + depth + '</span>';
        if (parentName) {
          html += '<span class="poke-parent-pill" title="' + escapeHtml(t('parent') + ': ' + parentName) + '">' + escapeHtml(t('parent') + ' ' + parentName) + '</span>';
        }
      }
      if (childCount > 0) {
        html += '<span class="poke-children-pill">' + escapeHtml(visibleChildLabel) + '</span>';
        html += '<button class="poke-hierarchy-toggle' + (isCollapsed ? ' collapsed' : '') + '" type="button" data-action="toggle-subtree" data-agent-id="' + escapeHtml(agent.agentId) + '" data-depth="' + depth + '" aria-expanded="' + String(!isCollapsed) + '" title="' + escapeHtml(isCollapsed ? t('showSubagentHierarchy') : t('hideSubagentHierarchy')) + '">';
        html += '<span class="poke-hierarchy-toggle-label">' + escapeHtml(isCollapsed ? t('show') : t('hide')) + '</span>';
        html += '</button>';
      }
      html += '</div>';
    }

    html += '<div class="poke-slot-row2">';
    html += '<span class="poke-hp-label">HP</span>';
    html += '<div class="poke-hp-track"><div class="poke-hp-fill" style="width:' + barPct.toFixed(1) + '%;background:' + barColor + '"></div></div>';
    html += '<span class="poke-hp-nums">' + formatContextK(contextRemaining) + '/' + formatContextK(contextMax) + '</span>';
    html += '</div>';

    html += '<div class="poke-slot-row3">';
    html += '<span class="poke-exp-label">EXP</span>';
    html += '<div class="poke-exp-track"><div class="poke-exp-fill" style="width:' + xp.progress.toFixed(1) + '%"></div></div>';
    html += '<span class="poke-exp-nums">' + formatTokenCount(xp.intoLevel) + ' / ' + formatTokenCount(xp.needed) + '</span>';
    html += '</div>';

    html += '<div class="poke-slot-row4">';
    var modelName = formatModelName(agent.model, contextMax);
    if (modelName) {
      html += '<span class="poke-model-badge">' + escapeHtml(modelName) + '</span>';
    }
    html += '<span class="poke-token-nums">TOK ' + formatTokenCount(xp.totalTokens) + '</span>';
    html += '</div>';
    html += '</div>';

    html += '<div class="poke-slot-details">';
    html += '<div class="detail-row detail-title"><span class="detail-value">' + escapeHtml(fullLabel) + '</span></div>';
    html += '<div class="detail-row"><span class="detail-label">' + escapeHtml(t('id')) + '</span><span class="detail-value">' + escapeHtml(toShortId(agent.agentId)) + '</span></div>';
    if (depth > 0) {
      html += '<div class="detail-row"><span class="detail-label">' + escapeHtml(t('depth')) + '</span><span class="detail-value">' + depth + '</span></div>';
      html += '<div class="detail-row"><span class="detail-label">' + escapeHtml(t('parent')) + '</span><span class="detail-value">' + escapeHtml(parentName || '-') + '</span></div>';
    }
    if (agent.model) {
      html += '<div class="detail-row"><span class="detail-label">' + escapeHtml(t('model')) + '</span><span class="detail-value">' + escapeHtml(modelName || agent.model) + '</span></div>';
    }
    html += '<div class="detail-row"><span class="detail-label">' + escapeHtml(t('started')) + '</span><span class="detail-value">' + formatTime(agent.createdAt) + '</span></div>';
    html += '<div class="detail-row"><span class="detail-label">' + escapeHtml(t('uptime')) + '</span><span class="detail-value">' + escapeHtml(uptime) + '</span></div>';
    html += '<div class="detail-row"><span class="detail-label">' + escapeHtml(t('lastSeen')) + '</span><span class="detail-value">' + escapeHtml(formatSecondsAgo(secsAgo)) + '</span></div>';
    html += '<div class="detail-row"><span class="detail-label">' + escapeHtml(t('lastTool')) + '</span><span class="detail-value">' + escapeHtml(agent.lastTool || '-') + '</span></div>';
    html += '<div class="detail-row"><span class="detail-label">' + escapeHtml(t('toolsRun')) + '</span><span class="detail-value">' + (agent.counters.toolStarts || 0) + '</span></div>';
    html += '<div class="detail-row"><span class="detail-label">' + escapeHtml(t('context')) + '</span><span class="detail-value">' + formatContextK(contextRemaining) + ' / ' + formatContextK(contextMax) + '</span></div>';
    html += '<div class="detail-row"><span class="detail-label">' + escapeHtml(t('tokens')) + '</span><span class="detail-value">' + formatTokenCount(xp.totalTokens) + '</span></div>';
    html += '<div class="detail-row"><span class="detail-label">' + escapeHtml(t('project')) + '</span><span class="detail-value">' + escapeHtml(agent.projectId) + '</span></div>';
    html += '<div class="detail-row"><span class="detail-label">' + escapeHtml(t('session')) + '</span><span class="detail-value">' + escapeHtml(agent.sessionId) + '</span></div>';
    if (childCount > 0) {
      html += '<div class="detail-row"><span class="detail-label">' + escapeHtml(t('visibleSubs')) + '</span><span class="detail-value">' + childCount + '</span></div>';
    }
    if (agent.childrenIds && agent.childrenIds.length > 0) {
      html += '<div class="detail-row"><span class="detail-label">' + escapeHtml(t('subagents')) + '</span><span class="detail-value">' + agent.childrenIds.length + '</span></div>';
    }
    if (subhistoryCount > 0) {
      html += '<div class="detail-row"><span class="detail-label">' + escapeHtml(t('subHistory')) + '</span><span class="detail-value">' + subhistoryCount + '</span></div>';
      html += '<button class="box-detail-btn" data-action="open-subhistory" data-agent-id="' + escapeHtml(agent.agentId) + '">' + escapeHtml(t('openSubagentHistory')) + '</button>';
    }
    if (lastCommand) {
      html += '<div class="detail-command" title="' + escapeHtml(lastCommand) + '"><span class="detail-label">' + escapeHtml(t('lastCommand')) + '</span><span class="detail-value">' + escapeHtml(lastCommand) + '</span></div>';
    }
    if (agent.lastUserQuery) {
      html += '<div class="detail-row detail-query"><span class="detail-label">' + escapeHtml(t('lastQuery')) + '</span><span class="detail-value">' + escapeHtml(agent.lastUserQuery) + '</span></div>';
    }
    if (!agent.isPromoCustom || !agent.parentId) {
      if (!adopted) {
        html += renderAdoptAgentButton(agent);
      }
      html += '<button class="box-btn" data-action="box" data-agent-id="' + escapeHtml(agent.agentId) + '">' + escapeHtml(t('archive')) + '</button>';
    }
    html += '</div>';

    html += '</article>';
    return html;
  }

  function renderAgentBranch(agent, depth, tree, expandedIds, collapsedIds, renderState, isLastChild) {
    var limit = Number.isFinite(renderState.limit) ? renderState.limit : 80;
    if (renderState.count >= limit) return '';

    var childCount = agent._children ? agent._children.length : 0;
    var isCollapsed = isSubtreeCollapsed(agent.agentId, depth, childCount, collapsedIds);
    var branchClasses = ['agent-branch'];
    if (depth === 0) branchClasses.push('root-branch');
    if (depth > 0 && !isLastChild) {
      branchClasses.push('branch-continued');
    }
    if (childCount > 0) branchClasses.push('has-children');
    if (isCollapsed) branchClasses.push('collapsed');

    var html = '<div class="' + branchClasses.join(' ') + '" data-depth="' + depth + '">';
    html += '<div class="agent-branch-node">';
    html += renderAgentCard(agent, depth, tree, expandedIds, collapsedIds);
    html += '</div>';
    renderState.count += 1;

    if (childCount > 0 && !isCollapsed && renderState.count < limit) {
      var children = agent._children.slice();
      children.sort(function (a, b) { return (a.createdAt || 0) - (b.createdAt || 0); });
      html += '<div class="agent-branch-children">';
      for (var i = 0; i < children.length && renderState.count < limit; i++) {
        html += renderAgentBranch(children[i], depth + 1, tree, expandedIds, collapsedIds, renderState, i === children.length - 1);
      }
      html += '</div>';
    }

    html += '</div>';
    return html;
  }

  function formatUptime(createdAt) {
    var secs = Math.max(0, Math.floor((Date.now() - createdAt) / 1000));
    if (secs < 60) return secs + 's';
    var mins = Math.floor(secs / 60);
    if (mins < 60) return mins + 'm ' + (secs % 60) + 's';
    var hrs = Math.floor(mins / 60);
    return hrs + 'h ' + (mins % 60) + 'm';
  }

  function formatTime(ts) {
    if (!ts) return '-';
    var d = new Date(ts);
    var mo = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    var h = String(d.getHours()).padStart(2, '0');
    var m = String(d.getMinutes()).padStart(2, '0');
    var s = String(d.getSeconds()).padStart(2, '0');
    return mo + '/' + day + ' ' + h + ':' + m + ':' + s;
  }

  function formatDateStamp(ts) {
    if (!ts) return '-';
    var d = new Date(ts);
    var year = d.getFullYear();
    var mo = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return year + '.' + mo + '.' + day;
  }

  function formatClockTime(ts) {
    if (!ts) return '-';
    var d = new Date(ts);
    var h = String(d.getHours()).padStart(2, '0');
    var m = String(d.getMinutes()).padStart(2, '0');
    var s = String(d.getSeconds()).padStart(2, '0');
    return h + ':' + m + ':' + s;
  }

  function formatDuration(startTs, endTs) {
    if (!startTs || !endTs) return '-';
    var secs = Math.max(0, Math.floor((endTs - startTs) / 1000));
    if (secs < 60) return secs + 's';
    var mins = Math.floor(secs / 60);
    if (mins < 60) return mins + 'm ' + (secs % 60) + 's';
    var hrs = Math.floor(mins / 60);
    return hrs + 'h ' + (mins % 60) + 'm';
  }

  function boxedSubagentsForParent(parentId) {
    var boxed = appState.snapshot.subagentHistory || [];
    var result = [];
    for (var i = 0; i < boxed.length; i++) {
      if (boxed[i].parentId === parentId) {
        result.push(boxed[i]);
      }
    }
    result.sort(function (a, b) {
      return (b.doneAt || 0) - (a.doneAt || 0);
    });
    return result;
  }

  function liveSubagentsForParent(parentId) {
    var live = appState.snapshot.agents || [];
    var result = [];
    for (var i = 0; i < live.length; i++) {
      if (live[i].parentId === parentId) {
        result.push(live[i]);
      }
    }
    result.sort(function (a, b) {
      return (a.createdAt || 0) - (b.createdAt || 0);
    });
    return result;
  }

  function boxedAgentById(agentId) {
    var boxed = appState.snapshot.boxedAgents || [];
    for (var i = 0; i < boxed.length; i++) {
      if (boxed[i].agentId === agentId) return boxed[i];
    }
    return null;
  }

  function parentHistoryLabel(parentId) {
    var live = appState.agentById && appState.agentById.get(parentId);
    if (live) return agentLabel(live);
    var boxed = boxedAgentById(parentId);
    if (boxed) return agentLabel(boxed);
    return toShortId(parentId);
  }

  function parentHistoryAgent(parentId) {
    var live = appState.agentById && appState.agentById.get(parentId);
    if (live) return { isLive: true, isHistory: false, source: 'live', ...live, doneAt: null };
    var boxed = boxedAgentById(parentId);
    if (boxed) return { isLive: false, isHistory: true, source: 'history', ...boxed };
    return {
      agentId: parentId,
      displayName: null,
      subagentType: 'Parent',
      projectId: '-',
      sessionId: '-',
      totalTokens: 0,
      createdAt: 0,
      doneAt: 0,
      counters: {},
      isLive: false,
      isHistory: true,
      source: 'history'
    };
  }

  function subhistoryKey(agent) {
    return String(agent.agentId || 'unknown') + ':' + String(agent.createdAt || 0) + ':' + String(agent.doneAt || 0);
  }

  function subhistoryLineageForParent(parentId) {
    var items = appState.snapshot.subagentHistory || [];
    var live = appState.snapshot.agents || [];
    var byParent = new Map();
    var relevantKeys = {};
    var stack = [parentId];
    var ordered = [];

    for (var i = 0; i < items.length; i++) {
      var entry = {
        source: 'history',
        isLive: false,
        isHistory: true,
        ...items[i]
      };
      var bucket = byParent.get(entry.parentId || '');
      if (!bucket) {
        bucket = [];
        byParent.set(entry.parentId || '', bucket);
      }
      bucket.push(entry);
    }

    for (var j = 0; j < live.length; j++) {
      if (!live[j].parentId) continue;
      var liveEntry = {
        source: 'live',
        isLive: true,
        isHistory: false,
        ...live[j],
        doneAt: null
      };
      var liveBucket = byParent.get(liveEntry.parentId || '');
      if (!liveBucket) {
        liveBucket = [];
        byParent.set(liveEntry.parentId || '', liveBucket);
      }
      liveBucket.push(liveEntry);
    }

    byParent.forEach(function (bucket) {
      bucket.sort(function (a, b) {
        return (a.createdAt || 0) - (b.createdAt || 0);
      });
    });

    while (stack.length > 0) {
      var currentParent = stack.shift();
      var children = byParent.get(currentParent || '') || [];
      for (var j = 0; j < children.length; j++) {
        var child = children[j];
        var key = subhistoryKey(child);
        if (relevantKeys[key]) continue;
        relevantKeys[key] = true;
        ordered.push(child);
        stack.push(child.agentId);
      }
    }

    return ordered;
  }

  function subhistoryFamilyCount(parentId) {
    return subhistoryLineageForParent(parentId).length;
  }

  function buildSubhistoryTree(parentId) {
    var items = subhistoryLineageForParent(parentId);
    var nodesByParent = new Map();
    var roots = [];

    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      item._subhistoryChildren = [];
      var key = item.parentId || '';
      if (!nodesByParent.has(key)) nodesByParent.set(key, []);
      nodesByParent.get(key).push(item);
    }

    function attach(node) {
      var children = nodesByParent.get(node.agentId) || [];
      for (var i = 0; i < children.length; i++) {
        node._subhistoryChildren.push(children[i]);
        attach(children[i]);
      }
    }

    roots = nodesByParent.get(parentId || '') || [];
    for (var r = 0; r < roots.length; r++) {
      attach(roots[r]);
    }
    return roots;
  }

  function collectSubhistoryGenerations(nodes, depth, generations) {
    if (!generations[depth]) generations[depth] = [];
    for (var i = 0; i < nodes.length; i++) {
      generations[depth].push(nodes[i]);
      if (nodes[i]._subhistoryChildren && nodes[i]._subhistoryChildren.length > 0) {
        collectSubhistoryGenerations(nodes[i]._subhistoryChildren, depth + 1, generations);
      }
    }
  }

  function historyStatSnapshot(agent) {
    var xp = agentLevelProgress(agent);
    var contextStats = agentContextStats(agent);

    return {
      xp: xp,
      contextMax: contextStats.contextMax,
      contextRemaining: contextStats.contextRemaining,
      hpPct: contextStats.hpPct,
      hpColor: contextStats.hpColor
    };
  }

  function renderHistoryStats(agent, extraClass) {
    var stats = historyStatSnapshot(agent);
    var className = extraClass ? ' ' + extraClass : '';
    var html = '';

    html += '<div class="history-stats' + className + '">';
    html += '<div class="history-stats-summary">';
    html += '<span class="history-stats-level">LV.' + stats.xp.level + '</span>';
    html += '<span class="history-stats-token">TOK ' + formatTokenCount(stats.xp.totalTokens) + '</span>';
    html += '</div>';

    html += '<div class="history-stats-bar">';
    html += '<span class="history-stats-label">HP</span>';
    html += '<div class="history-stats-track history-stats-track-hp">';
    html += '<div class="history-stats-fill" style="width:' + stats.hpPct.toFixed(1) + '%;background:' + stats.hpColor + '"></div>';
    html += '</div>';
    html += '<span class="history-stats-value">' + formatContextK(stats.contextRemaining) + '/' + formatContextK(stats.contextMax) + '</span>';
    html += '</div>';

    html += '<div class="history-stats-bar">';
    html += '<span class="history-stats-label">EXP</span>';
    html += '<div class="history-stats-track history-stats-track-exp">';
    html += '<div class="history-stats-fill history-stats-fill-exp" style="width:' + stats.xp.progress.toFixed(1) + '%"></div>';
    html += '</div>';
    html += '<span class="history-stats-value">' + formatTokenCount(stats.xp.intoLevel) + '/' + formatTokenCount(stats.xp.needed) + '</span>';
    html += '</div>';

    html += '</div>';
    return html;
  }

  function renderSubhistoryCard(agent, kind) {
    var key = kind + ':' + subhistoryKey(agent);
    var label = agent.displayName || agent.subagentType || toShortId(agent.agentId);
    var timeValue = kind === 'parent'
      ? (agent.lastSeen || agent.doneAt || agent.createdAt)
      : (agent.isLive ? (agent.lastSeen || agent.createdAt) : agent.doneAt);
    var iconUrl = agent.isLive && !(agent.isSleeping || !agent.isActive)
      ? pokemonIconUrl(agent)
      : pokemonStaticIconUrl(agent);
    appState.subhistoryEntryByKey.set(key, agent);

    var html = '';
    html += '<article class="subhistory-lineage-card" data-subhistory-key="' + escapeHtml(key) + '">';
    html += '<div class="subhistory-lineage-header">';
    html += '<img class="subhistory-lineage-icon" src="' + escapeHtml(iconUrl) + '" alt="" />';
    html += '<div class="subhistory-lineage-main">';
    html += '<div class="subhistory-lineage-top">';
    html += '<span class="subhistory-lineage-name">' + escapeHtml(label) + '</span>';
    html += '</div>';
    html += renderHistoryStats(agent, 'subhistory-lineage-stats');
    html += '<div class="subhistory-lineage-bottom">';
    html += '<span class="subhistory-lineage-type">' + escapeHtml(agent.subagentType || (kind === 'parent' ? t('parent') : t('subagentLabel'))) + '</span>';
    html += '<span class="subhistory-lineage-time">' + escapeHtml(agent.isLive ? t('live') : formatTime(timeValue)) + '</span>';
    html += '</div>';
    html += '</div>';
    html += '</div>';
    html += '</article>';
    return html;
  }

  function renderSubhistoryColumns(parentId) {
    var roots = buildSubhistoryTree(parentId);
    var generations = [];
    var parent = parentHistoryAgent(parentId);
    collectSubhistoryGenerations(roots, 1, generations);

    var html = '<div class="subhistory-columns">';
    html += '<section class="subhistory-column">';
    html += '<div class="subhistory-column-title">' + escapeHtml(t('parent')) + '</div>';
    html += renderSubhistoryCard(parent, 'parent');
    html += '</section>';

    for (var depth = 1; depth < generations.length; depth++) {
      var generation = generations[depth] || [];
      if (generation.length === 0) continue;
      html += '<section class="subhistory-column">';
      html += '<div class="subhistory-column-title">' + escapeHtml(t('depth')) + ' ' + depth + '</div>';
      for (var i = 0; i < generation.length; i++) {
        html += renderSubhistoryCard(generation[i], 'child');
      }
      html += '</section>';
    }

    html += '</div>';
    return html;
  }

  function renderSubagentHistory(items, options) {
    var html = '';
    var limit = options && typeof options.limit === 'number' ? options.limit : items.length;
    for (var i = 0; i < items.length && i < limit; i++) {
      var agent = items[i];
      var label = agent.displayName || agent.subagentType || toShortId(agent.agentId);
      html += '<div class="subhistory-item">';
      html += '<div class="subhistory-row">';
      html += '<span class="subhistory-name">' + escapeHtml(label) + '</span>';
      html += '<span class="subhistory-time">' + escapeHtml(formatTime(agent.doneAt)) + '</span>';
      html += '</div>';
      html += '<div class="subhistory-meta">';
      html += '<span>' + escapeHtml(agent.subagentType || t('subagentLabel')) + '</span>';
      html += '<span>' + escapeHtml(t('tools')) + ' ' + (agent.counters.toolStarts || 0) + '</span>';
      html += '<span>TOK ' + formatTokenCount(agent.totalTokens || 0) + '</span>';
      html += '<span>' + escapeHtml(formatDuration(agent.createdAt, agent.doneAt)) + '</span>';
      html += '</div>';
      html += '</div>';
    }
    return html;
  }

  function setSubhistoryOpen(isOpen, parentId) {
    uiState.subhistoryOpen = !!isOpen;
    uiState.subhistoryParentId = isOpen ? (parentId || uiState.subhistoryParentId) : null;
    subhistoryModalEl.hidden = !uiState.subhistoryOpen;
    if (!uiState.subhistoryOpen) {
      hideBoxTooltip();
      hideSubhistoryTooltip();
    }
  }

  function renderSubhistoryModal() {
    var parentId = uiState.subhistoryParentId;
    var items = parentId ? subhistoryLineageForParent(parentId) : [];
    var label = parentId ? parentHistoryLabel(parentId) : t('subagentHistory');
    var countLabel = items.length === 1 ? t('oneRecord') : t('records', { count: items.length });
    appState.subhistoryEntryByKey = new Map();
    subhistoryTitleEl.textContent = label;
    subhistorySummaryEl.textContent = countLabel;
    subhistoryGridEl.innerHTML = items.length
      ? renderSubhistoryColumns(parentId)
      : '<div class="box-empty">' + escapeHtml(t('noSubhistory')) + '</div>';
  }

  function pokemonSpriteUrl(agent, sleeping) {
    var id = getRenderPokemonId(agent);
    var spec = pokemonSpriteSpec(sleeping);
    return spriteUrl(spec.folder, id, spec.ext);
  }

  function pokemonIconUrl(agent) {
    var id = getRenderPokemonId(agent);
    return spriteUrl('icon', id, 'png');
  }

  function pokemonAnimatedSpriteUrl(agent) {
    var id = getRenderPokemonId(agent);
    return spriteUrl('animated', id, 'gif');
  }

  function pokemonStaticIconUrl(agent) {
    var id = getRenderPokemonId(agent);
    return spriteUrl('icon-static', id, 'png');
  }

  function pokemonSpriteSpec(sleeping) {
    return sleeping
      ? { folder: 'static', ext: 'png' }
      : { folder: 'animated', ext: 'gif' };
  }

  function agentSleepSpriteScale(agent) {
    if (!agent || agent.parentId) return 1;
    if (!(appState.snapshot.config && appState.snapshot.config.enablePokeapiSprites)) return 1;
    return pokeProvider.getSleepScale(agent);
  }

  function formatContextK(value) {
    return Math.floor(value / 1000) + 'k';
  }

  function formatTokenCount(value) {
    return Math.max(0, Math.floor(value || 0)).toLocaleString('en-US');
  }

  function formatProbability(value) {
    var percent = Math.max(0, Number(value) || 0) * 100;
    if (percent === 0) return '0%';
    var digits = percent < 10 ? 2 : 0;
    return percent.toFixed(digits).replace(/\.0+$/, '').replace(/(\.\d*[1-9])0+$/, '$1') + '%';
  }

  async function readActionResult(actionPromise) {
    try {
      var response = await Promise.resolve(actionPromise);
      if (response && typeof response.json === 'function') {
        var data = null;
        try { data = await response.json(); } catch (_) {}
        if (data && typeof data === 'object') {
          if (response.ok === false && data.ok !== false) data.ok = false;
          return data;
        }
        return response.ok ? { ok: true } : { ok: false, error: 'Request failed.' };
      }
      if (response && typeof response === 'object') {
        return response;
      }
      return { ok: !!response };
    } catch (error) {
      return { ok: false, error: error && error.message ? error.message : 'Request failed.' };
    }
  }

  function mergeOwnedPokemonIntoSnapshot(snapshot, pokemon, recruitCost) {
    if (!snapshot || !pokemon || typeof snapshot !== 'object') return snapshot;
    var speciesId = validPokemonId(pokemon.speciesId);
    if (!speciesId) return snapshot;

    var next = { ...snapshot };
    var owned = Array.isArray(snapshot.ownedPokemon) ? snapshot.ownedPokemon.slice() : [];
    var ownedId = pokemon.id ? String(pokemon.id) : null;
    var added = true;
    if (ownedId) {
      for (var i = 0; i < owned.length; i++) {
        if (owned[i] && String(owned[i].id) === ownedId) {
          owned[i] = { ...owned[i], ...pokemon };
          added = false;
          break;
        }
      }
    }
    if (added) {
      owned.push({ ...pokemon });
    }
    next.ownedPokemon = owned;

    var pokedex = snapshot.pokedex || {};
    var seenIds = Array.isArray(pokedex.seenPokemonIds) ? pokedex.seenPokemonIds.slice() : [];
    if (seenIds.indexOf(speciesId) < 0) {
      seenIds.push(speciesId);
      seenIds.sort(function (a, b) { return a - b; });
      next.pokedex = {
        ...pokedex,
        seenPokemonIds: seenIds,
        discoveredCount: seenIds.length,
        totalCount: pokedex.totalCount || POKEDEX_TOTAL
      };
    }

    var pointCost = Number(recruitCost && recruitCost.pointCost);
    var currentPoints = Number(next.evolutionItems && next.evolutionItems.itemPoints);
    if (added && Number.isFinite(pointCost) && pointCost > 0 && Number.isFinite(currentPoints)) {
      next.evolutionItems = {
        ...next.evolutionItems,
        itemPoints: Math.max(0, currentPoints - pointCost)
      };
    }

    return next;
  }

  function applyOwnedPokemonActionResult(result) {
    if (!result || !result.ok || !result.pokemon) return;
    var baseSnapshot = appState.liveSnapshot || appState.snapshot;
    var nextSnapshot = mergeOwnedPokemonIntoSnapshot(baseSnapshot, result.pokemon, result.recruitCost);
    if (nextSnapshot && nextSnapshot !== baseSnapshot) {
      applySnapshot(nextSnapshot);
    }
  }

  function applyPokedexRewardClaimResult(result) {
    if (!result || !result.ok) return;
    var baseSnapshot = appState.liveSnapshot || appState.snapshot;
    if (!baseSnapshot) return;

    var nextSnapshot = baseSnapshot;
    if (result.pokedex) {
      nextSnapshot = {
        ...nextSnapshot,
        pokedex: result.pokedex
      };
    }

    if (result.evolutionItems) {
      nextSnapshot = {
        ...nextSnapshot,
        evolutionItems: result.evolutionItems
      };
    }

    var itemPoints = Number(result.itemPoints);
    if (Number.isFinite(itemPoints)) {
      nextSnapshot = {
        ...nextSnapshot,
        evolutionItems: {
          ...(nextSnapshot.evolutionItems || {}),
          itemPoints: itemPoints
        }
      };
    }

    var ticketResults = Array.isArray(result.ticketResults) ? result.ticketResults : [];
    for (var i = 0; i < ticketResults.length; i++) {
      if (ticketResults[i] && ticketResults[i].pokemon) {
        nextSnapshot = mergeOwnedPokemonIntoSnapshot(nextSnapshot, ticketResults[i].pokemon, null);
      }
    }

    if (nextSnapshot !== baseSnapshot) {
      applySnapshot(nextSnapshot);
    }
  }

  function localizedActionText(en, ko) {
    return currentLanguage() === 'ko' ? ko : en;
  }

  function pokemonSpriteBySpeciesId(speciesId) {
    return spriteUrl('animated', speciesId, 'gif');
  }

  function actionItemVisualHtml(visual) {
    if (!visual || !visual.itemId) return '';
    var itemName = visual.name || evolutionItemLabel(visual.itemId);
    var label = visual.label || t('item');
    var detail = visual.detail || '';
    return [
      '<div class="action-item-showcase">',
      '<div class="action-item-orb"><img src="' + escapeHtml(itemSpriteUrl(visual.itemId)) + '" alt="" loading="lazy" /></div>',
      '<div class="action-item-label">',
      '<span>' + escapeHtml(label) + '</span>',
      '<strong>' + escapeHtml(itemName) + '</strong>',
      detail ? '<span>' + escapeHtml(detail) + '</span>' : '',
      '</div>',
      '</div>'
    ].join('');
  }

  function actionPointsVisualHtml(visual) {
    var value = visual && visual.value ? visual.value : '0 pts';
    var label = visual && visual.label ? visual.label : t('points');
    return [
      '<div class="action-points-showcase">',
      '<div class="action-points-badge">' + escapeHtml(value) + '</div>',
      '<span>' + escapeHtml(label) + '</span>',
      '</div>'
    ].join('');
  }

  function pokedexRewardPopupEntries(reward) {
    var rows = pokedexRewardItemRows(reward, { includePoints: true, includeTickets: true, includeBonuses: true });
    return rows.map(function (row) {
      if (row.type === 'ticket') {
        return {
          type: row.type,
          itemId: row.itemId,
          label: row.label,
          detail: row.detail
        };
      }
      return {
        type: row.type,
        iconText: row.iconText || '+',
        label: row.label
      };
    });
  }

  function pokedexRewardPopupVisual(reward) {
    var entries = pokedexRewardPopupEntries(reward);
    if (entries.length === 0) return null;
    return {
      type: 'pokedex-reward',
      entries: entries
    };
  }

  function actionPokedexRewardVisualHtml(visual) {
    var entries = Array.isArray(visual && visual.entries) ? visual.entries : [];
    if (entries.length === 0) return '';
    var html = '<div class="action-pokedex-reward-showcase">';
    for (var i = 0; i < entries.length; i++) {
      var entry = entries[i] || {};
      html += '<div class="action-pokedex-reward-card ' + escapeHtml(entry.type || 'bonus') + '">';
      if (entry.type === 'ticket' && entry.itemId) {
        html += '<span class="action-pokedex-reward-icon item"><img src="' + escapeHtml(itemSpriteUrl(entry.itemId)) + '" alt="" loading="lazy" /></span>';
      } else {
        html += '<span class="action-pokedex-reward-icon ' + escapeHtml(entry.type || 'bonus') + '">' + escapeHtml(entry.iconText || '+') + '</span>';
      }
      html += '<span class="action-pokedex-reward-text">';
      html += '<strong>' + escapeHtml(entry.label || '') + '</strong>';
      if (entry.detail) {
        html += '<span>' + escapeHtml(entry.detail) + '</span>';
      }
      html += '</span>';
      html += '</div>';
    }
    html += '</div>';
    return html;
  }

  function actionRecruitVisualHtml(visual) {
    if (!visual || !visual.pokemonId) return '';
    var name = visual.name || pokemonDisplayName(visual.pokemonId);
    var currentPoints = Math.max(0, Number(visual.currentPoints) || 0);
    var pointCost = Math.max(0, Number(visual.pointCost) || 0);
    var afterPoints = Math.max(0, Number.isFinite(Number(visual.afterPoints)) ? Number(visual.afterPoints) : currentPoints - pointCost);
    var discovered = !!visual.discovered;
    var caught = !!visual.caught;
    var discoveryText = caught
      ? t('alreadyCaughtDiscount')
      : discovered
      ? t('pokedexRegistered')
      : t('newPokedexEntry');
    var rows = [
      { label: t('currentPoints'), value: formatTokenCount(currentPoints) },
      { label: t('plannedSpend'), value: '-' + formatTokenCount(pointCost), tone: 'cost', note: discoveryText },
      { label: t('afterRecruit'), value: formatTokenCount(afterPoints), tone: 'after' }
    ];
    var html = '';
    html += '<div class="action-recruit-showcase">';
    html += '<div class="action-recruit-hero">';
    html += '<img src="' + escapeHtml(pokemonSpriteBySpeciesId(visual.pokemonId)) + '" alt="" loading="lazy" />';
    html += '<div class="action-recruit-hero-text">';
    html += '<span class="action-recruit-discovery' + (discovered ? ' discovered' : ' new') + '">' + escapeHtml(discoveryText) + '</span>';
    html += '<strong>' + escapeHtml(name) + '</strong>';
    html += '</div>';
    html += '</div>';
    html += '<div class="action-recruit-ledger">';
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      html += '<div class="action-recruit-row' + (row.tone ? ' ' + row.tone : '') + '">';
      html += '<span class="action-recruit-label">' + escapeHtml(row.label) + '</span>';
      html += '<span class="action-recruit-value">' + escapeHtml(row.value) + ' pts</span>';
      if (row.note) html += '<span class="action-recruit-note">' + escapeHtml(row.note) + '</span>';
      html += '</div>';
    }
    html += '</div>';
    html += '</div>';
    return html;
  }

  function actionEvolutionVisualHtml(visual) {
    if (!visual || !visual.beforeSpeciesId || !visual.afterSpeciesId) return '';
    var beforeName = visual.beforeName || pokemonDisplayName(visual.beforeSpeciesId);
    var afterName = visual.afterName || pokemonDisplayName(visual.afterSpeciesId);
    var html = '';
    html += '<div class="action-evolution-showcase">';
    html += '<div class="action-pokemon-card">';
    html += '<span>' + escapeHtml(t('before')) + '</span>';
    html += '<img src="' + escapeHtml(pokemonSpriteBySpeciesId(visual.beforeSpeciesId)) + '" alt="" loading="lazy" />';
    html += '<strong>' + escapeHtml(beforeName) + '</strong>';
    html += '</div>';
    html += '<div class="action-evolution-arrow" aria-hidden="true"></div>';
    html += '<div class="action-pokemon-card">';
    html += '<span>' + escapeHtml(t('after')) + '</span>';
    html += '<img src="' + escapeHtml(pokemonSpriteBySpeciesId(visual.afterSpeciesId)) + '" alt="" loading="lazy" />';
    html += '<strong>' + escapeHtml(afterName) + '</strong>';
    html += '</div>';
    if (visual.itemId) {
      var itemName = visual.itemName || evolutionItemLabel(visual.itemId);
      html += '<div class="action-consume-strip">';
      html += '<img src="' + escapeHtml(itemSpriteUrl(visual.itemId)) + '" alt="" loading="lazy" />';
      html += '<span>' + escapeHtml(t('consumes')) + ': ' + escapeHtml(itemName) + '</span>';
      html += '</div>';
    }
    html += '</div>';
    return html;
  }

  function actionTicketResultVisualHtml(visual) {
    if (!visual || !visual.pokemonId) return '';
    var pokemonName = visual.name || pokemonDisplayName(visual.pokemonId);
    var rarityHtml = pokemonRarityBadgeHtml(visual.pokemonId, 'action-ticket-result-rarity');
    var html = '';
    html += '<div class="action-ticket-result-showcase">';
    html += '<div class="action-pokemon-card">';
    html += '<span>' + escapeHtml(t('recruitResult')) + '</span>';
    html += '<img src="' + escapeHtml(pokemonSpriteBySpeciesId(visual.pokemonId)) + '" alt="" loading="lazy" />';
    html += '<strong>' + escapeHtml(pokemonName) + '</strong>';
    html += '</div>';
    if (visual.itemId || rarityHtml) {
      html += '<div class="action-consume-strip">';
      if (visual.itemId) {
        html += '<img src="' + escapeHtml(itemSpriteUrl(visual.itemId)) + '" alt="" loading="lazy" />';
      }
      html += rarityHtml || '<span>' + escapeHtml(t('unknown')) + '</span>';
      html += '</div>';
    }
    html += '</div>';
    return html;
  }

  function actionVisualHtml(visual) {
    if (!visual || !visual.type) return '';
    if (visual.type === 'item') return actionItemVisualHtml(visual);
    if (visual.type === 'points') return actionPointsVisualHtml(visual);
    if (visual.type === 'pokedex-reward') return actionPokedexRewardVisualHtml(visual);
    if (visual.type === 'recruit') return actionRecruitVisualHtml(visual);
    if (visual.type === 'evolution') return actionEvolutionVisualHtml(visual);
    if (visual.type === 'ticket-result') return actionTicketResultVisualHtml(visual);
    return '';
  }

  function setActionButtonContent(button, label, iconClass) {
    if (!button) return;
    button.innerHTML = [
      '<span class="action-btn-symbol ' + escapeHtml(iconClass || 'ok') + '" aria-hidden="true"></span>',
      '<span>' + escapeHtml(label || '') + '</span>'
    ].join('');
  }

  function closeActionDialog(value) {
    if (!actionModalEl || actionModalEl.hidden) return;
    actionModalEl.hidden = true;
    var resolver = actionDialogResolver;
    actionDialogResolver = null;
    if (resolver) resolver(!!value);
  }

  function openActionDialog(config) {
    var isConfirm = config && config.mode === 'confirm';
    if (!actionModalEl || !actionTitleEl || !actionMessageEl || !actionConfirmEl || !actionCancelEl) {
      return Promise.resolve(isConfirm ? false : true);
    }
    if (actionDialogResolver) closeActionDialog(false);
    var visualHtml = actionVisualHtml(config && config.visual);
    if (actionPanelEl) {
      actionPanelEl.classList.toggle('evolution', !!(config && config.visual && config.visual.type === 'evolution'));
      actionPanelEl.classList.toggle('recruit', !!(config && config.visual && config.visual.type === 'recruit'));
      actionPanelEl.classList.toggle('pokedex-reward', !!(config && config.visual && config.visual.type === 'pokedex-reward'));
    }
    if (actionVisualEl) {
      actionVisualEl.innerHTML = visualHtml;
      actionVisualEl.hidden = !visualHtml;
    }
    actionTitleEl.textContent = (config && config.title) || t('action');
    if (config && config.messageHtml) {
      actionMessageEl.innerHTML = config.messageHtml;
    } else {
      actionMessageEl.textContent = (config && config.message) || '';
    }
    actionMessageEl.classList.toggle('error', !!(config && config.isError));
    actionCancelEl.hidden = !isConfirm;
    actionCancelEl.textContent = (config && config.cancelText) || t('no');
    actionConfirmEl.textContent = (config && config.confirmText) || (isConfirm ? t('yes') : t('ok'));
    setActionButtonContent(
      actionConfirmEl,
      (config && config.confirmText) || (isConfirm ? t('yes') : t('ok')),
      isConfirm ? 'yes' : 'ok'
    );
    setActionButtonContent(
      actionCancelEl,
      (config && config.cancelText) || t('no'),
      'no'
    );
    actionModalEl.hidden = false;
    window.setTimeout(function () {
      try { actionConfirmEl.focus({ preventScroll: true }); } catch (_) {}
    }, 0);
    return new Promise(function (resolve) {
      actionDialogResolver = resolve;
    });
  }

  function showActionPopup(titleEn, titleKo, messageEn, messageKo) {
    var options = arguments.length > 4 && arguments[4] ? arguments[4] : {};
    return openActionDialog({
      mode: 'result',
      title: localizedActionText(titleEn, titleKo),
      message: localizedActionText(messageEn, messageKo),
      messageHtml: options.messageHtml || '',
      visual: options.visual || null,
      isError: !!options.isError,
      confirmText: t('ok')
    });
  }

  function confirmActionPopup(messageEn, messageKo) {
    var options = arguments.length > 2 && arguments[2] ? arguments[2] : {};
    return openActionDialog({
      mode: 'confirm',
      visual: options.visual || null,
      title: t('confirm'),
      message: options.message || localizedActionText(messageEn, messageKo),
      confirmText: t('yes'),
      cancelText: t('no')
    });
  }

  function actionErrorMessage(result) {
    return result && result.error ? result.error : t('actionFailed');
  }

  function catchRewardMessage(result) {
    var total = catchRewardPoints(result);
    if (total <= 0) return '';
    return ' ' + t('catchReward') + ': +' + formatTokenCount(total) + ' pts.';
  }

  function agentPanelName(agent) {
    if (!agent) return 'unknown';
    if (agent.parentId) {
      return agent.displayName || agent.subagentType || toShortId(agent.agentId);
    }
    return rootAgentBadge(agent);
  }

  function filteredTokenTotal(agents) {
    var total = 0;
    for (var i = 0; i < agents.length; i++) {
      total += agents[i].selfTokens || 0;
    }
    return total;
  }

  function hpBarColor(ratio) {
    if (ratio > 0.5) return '#58d058';
    if (ratio > 0.2) return '#f0c838';
    return '#e85040';
  }

  function formatRemainingShort(epoch) {
    if (!epoch) return '-';
    var diffMs = epoch * 1000 - Date.now();
    if (diffMs <= 0) return currentLanguage() === 'ko' ? '지금' : 'now';
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

  function rateLimitProviderOrder(snapshot) {
    var source = String((snapshot.config && snapshot.config.source) || '').toLowerCase();
    if (source === 'codex') return ['codex'];
    if (source === 'claude') return ['claude'];
    return ['claude', 'codex'];
  }

  function rateLimitEntries(snapshot) {
    var byProvider = (snapshot && snapshot.rateLimitsByProvider) || {};
    var order = rateLimitProviderOrder(snapshot || {});
    var entries = [];

    for (var i = 0; i < order.length; i++) {
      var provider = order[i];
      if (byProvider[provider]) {
        entries.push({ provider: provider, rateLimits: byProvider[provider] });
      }
    }

    if (entries.length === 0 && snapshot && snapshot.rateLimits) {
      var source = String((snapshot.config && snapshot.config.source) || '').toLowerCase();
      var fallbackProvider = source === 'codex' || source === 'claude' ? source : 'budget';
      entries.push({ provider: fallbackProvider, rateLimits: snapshot.rateLimits });
    }

    return entries;
  }

  function rateLimitBarHtml(providerLabel, periodLabel, rateLimit, resetKind) {
    var hasValue = rateLimit && typeof rateLimit.used_percentage === 'number';
    var remain = hasValue
      ? 100 - Math.min(100, Math.max(0, rateLimit.used_percentage))
      : 0;
    var color = hasValue ? hpBarColor(remain / 100) : '#777';
    var pctText = hasValue ? remain.toFixed(1) + '%' : '-';
    var tooltip = t('rateNoData', { provider: providerLabel, period: periodLabel });

    if (hasValue) {
      tooltip = t('rateRemaining', { provider: providerLabel, period: periodLabel, remaining: remain.toFixed(1) });
      if (resetKind === 'remaining') {
        tooltip += '\n' + t('rateLeft', { time: formatRemainingShort(rateLimit.resets_at) });
      } else {
        tooltip += '\n' + t('rateResets', { time: formatResetAtShort(rateLimit.resets_at) });
      }
    }

    return [
      '<div class="rate-limit-bar" data-tooltip="' + escapeHtml(tooltip) + '">',
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

  function updateRateLimits(snapshot) {
    var entries = rateLimitEntries(snapshot);
    if (entries.length === 0) {
      rateLimitsWrapEl.hidden = true;
      rateLimitsWrapEl.innerHTML = '';
      return;
    }

    rateLimitsWrapEl.hidden = false;
    rateLimitsWrapEl.innerHTML = entries.map(rateLimitProviderHtml).join('');
  }

  function formatModelName(model, contextMax) {
    if (!model) return null;
    var m = String(model).toLowerCase();
    // Parse family and version from model ID (e.g. "claude-opus-4-6" → "Opus 4.6")
    var family = '';
    var version = '';
    if (m.includes('opus')) family = 'Opus';
    else if (m.includes('sonnet')) family = 'Sonnet';
    else if (m.includes('haiku')) family = 'Haiku';
    else if (m.includes('gpt-')) return model.toUpperCase();
    else return model;
    // Extract version: match "4-6", "4-5", etc. after the family name
    var vMatch = m.match(/(\d+)-(\d+)/);
    if (vMatch) {
      version = ' ' + vMatch[1] + '.' + vMatch[2];
    }
    var tier = (contextMax && contextMax >= 1000000) ? ' (1M)' : '';
    return family + version + tier;
  }

  function expToNextLevel(level) {
    var stage = Math.max(0, level - 1);
    return 69000 + stage * 4800;
  }

  function agentLevelProgress(agent) {
    var totalTokens = Math.max(0, agent && agent.totalTokens ? agent.totalTokens : 0);
    var level = 1;
    var currentBase = 0;

    while (level < 100) {
      var nextDelta = expToNextLevel(level);
      if (totalTokens < currentBase + nextDelta) {
        break;
      }
      currentBase += nextDelta;
      level += 1;
    }

    var nextLevelBase = level >= 100 ? currentBase : currentBase + expToNextLevel(level);
    var intoLevel = totalTokens - currentBase;
    var needed = Math.max(1, nextLevelBase - currentBase);
    var progress = level >= 100 ? 100 : Math.max(0, Math.min(100, (intoLevel / needed) * 100));

    return {
      level: level,
      totalTokens: totalTokens,
      currentBase: currentBase,
      nextLevelBase: nextLevelBase,
      intoLevel: level >= 100 ? needed : intoLevel,
      needed: needed,
      progress: progress
    };
  }

  function promoStudioAvailable() {
    var snapshot = appState.liveSnapshot || appState.snapshot || {};
    var config = snapshot.config || {};
    return !!config.isMockMode;
  }

  function promoSceneCounts() {
    var roots = promoStudioState.roots || [];
    var boxed = promoBoxState.sessions || [];
    var subagents = 0;
    for (var i = 0; i < roots.length; i++) {
      subagents += Array.isArray(roots[i].subagents) ? roots[i].subagents.length : 0;
    }
    return {
      roots: roots.length,
      subagents: subagents,
      boxed: boxed.length
    };
  }

  function promoDisplayLabel(unit) {
    var label = unit && typeof unit.label === 'string' ? unit.label.trim() : '';
    return label || pokemonDisplayName(unit && unit.pokemonId ? unit.pokemonId : POKEDEX_MIN);
  }

  function promoLevelDetails(unit) {
    var level = promoClampInt(unit && unit.level, 1, 100, 1);
    var needed = level >= 100 ? 0 : expToNextLevel(level);
    var intoLevel = promoClampInt(unit && unit.exp, 0, level >= 100 ? 0 : needed, 0);
    var totalTokens = 0;
    for (var cursor = 1; cursor < level; cursor++) {
      totalTokens += expToNextLevel(cursor);
    }
    totalTokens += intoLevel;
    return {
      level: level,
      needed: needed,
      intoLevel: intoLevel,
      totalTokens: totalTokens,
      hp: promoClampInt(unit && unit.hp, 0, 100, 100)
    };
  }

  function promoSlug(value, fallback) {
    var text = String(value || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return text || fallback;
  }

  function promoRootProjectId(root, index) {
    var label = root && typeof root.label === 'string' && root.label.trim()
      ? root.label.trim()
      : 'pokemon-' + String(root && root.pokemonId ? root.pokemonId : (index + 1));
    return 'promo-' + promoSlug(label, 'team-' + (index + 1));
  }

  function resolvePromoRenderedPokemonId(unit, parentAgent) {
    var configuredPokemonId = promoClampInt(unit && unit.pokemonId, POKEDEX_MIN, POKEDEX_MAX, POKEDEX_MIN);
    if (!parentAgent) return configuredPokemonId;

    var parentConfiguredPokemonId = promoClampInt(
      parentAgent && parentAgent.promoConfiguredPokemonId,
      POKEDEX_MIN,
      POKEDEX_MAX,
      parentAgent && parentAgent.forcedPokemonId ? parentAgent.forcedPokemonId : configuredPokemonId
    );

    if (configuredPokemonId !== parentConfiguredPokemonId) {
      return configuredPokemonId;
    }

    var candidates = getEvolutionPath(configuredPokemonId);
    if (!candidates.length) {
      return configuredPokemonId;
    }
    return candidates[hashCode(String(unit && unit.id ? unit.id : configuredPokemonId)) % candidates.length];
  }

  function buildPromoAgentsForRoots(roots, now, options) {
    var agents = [];
    var settings = options || {};
    var baseTime = typeof settings.baseTime === 'number' ? settings.baseTime : now;
    var doneAt = typeof settings.doneAt === 'number' ? settings.doneAt : null;
    var rootIndexOffset = Number.isFinite(settings.rootIndexOffset) ? settings.rootIndexOffset : 0;

    function buildPromoAgent(unit, rootIndex, parentAgent, depth, siblingIndex) {
      var details = promoLevelDetails(unit);
      var isSleeping = unit.status === 'Sleeping';
      var displayName = unit && typeof unit.label === 'string' && unit.label.trim() ? unit.label.trim() : null;
      var configuredPokemonId = promoClampInt(unit && unit.pokemonId, POKEDEX_MIN, POKEDEX_MAX, POKEDEX_MIN);
      var renderedPokemonId = resolvePromoRenderedPokemonId(unit, parentAgent);
      var absoluteRootIndex = rootIndexOffset + rootIndex;
      var projectId = parentAgent ? parentAgent.projectId : promoRootProjectId(unit, absoluteRootIndex);
      var childUnits = Array.isArray(unit.subagents) ? unit.subagents : [];
      var createdOffset = absoluteRootIndex * 8000 + depth * 1800 + siblingIndex * 420;
      var agent = {
        agentId: unit.id,
        name: displayName || unit.id,
        displayName: displayName,
        subagentType: null,
        projectId: projectId,
        sessionId: settings.sessionId || 'promo-studio',
        parentId: parentAgent ? parentAgent.agentId : null,
        childrenIds: [],
        status: unit.status,
        activity: doneAt ? 'Boxed Promo Scene' : (isSleeping ? 'Sleeping' : 'Promo Scene'),
        lastTool: unit.status === 'Tool-Running' ? 'bash' : null,
        lastCommand: unit.status === 'Tool-Running'
          ? 'node cli.js mock'
          : (unit.status === 'Thinking'
            ? 'Plan the promo composition'
            : (unit.status === 'Outputting' ? 'Draft launch copy' : null)),
        lastSeen: doneAt || (baseTime - createdOffset),
        createdAt: baseTime - (createdOffset + 3200),
        doneAt: doneAt,
        isActive: doneAt ? false : !isSleeping,
        isSleeping: isSleeping,
        contextUsed: Math.round(DEFAULT_PROMO_CONTEXT_MAX * ((100 - details.hp) / 100)),
        contextMax: DEFAULT_PROMO_CONTEXT_MAX,
        selfTokens: details.totalTokens,
        totalTokens: details.totalTokens,
        lastUserQuery: parentAgent
          ? 'Support the main agent with a promo-friendly subtask.'
          : 'Compose a promotional scene with custom Pokemon agents.',
        counters: {
          seen: 1,
          toolStarts: unit.status === 'Tool-Running' ? 1 : 0,
          toolEnds: unit.status === 'Tool-Running' ? 1 : 0,
          outputs: unit.status === 'Outputting' ? 1 : 0,
          waits: unit.status === 'Waiting' ? 1 : 0,
          spawns: childUnits.length
        },
        promoConfiguredPokemonId: configuredPokemonId,
        forcedPokemonId: renderedPokemonId,
        isPromoCustom: true
      };

      agents.push(agent);

      for (var subIndex = 0; subIndex < childUnits.length; subIndex++) {
        var childUnit = childUnits[subIndex];
        agent.childrenIds.push(childUnit.id);
        buildPromoAgent(childUnit, rootIndex, agent, depth + 1, subIndex);
      }

      return agent;
    }

    var rootUnits = Array.isArray(roots) ? roots : [];
    for (var rootIndex = 0; rootIndex < rootUnits.length; rootIndex++) {
      buildPromoAgent(rootUnits[rootIndex], rootIndex, null, 0, rootIndex);
    }

    return agents;
  }

  function buildPromoAgents(now) {
    return buildPromoAgentsForRoots(promoStudioState.roots || [], now, { sessionId: 'promo-studio' });
  }

  function buildPromoBoxSnapshot(now) {
    var boxedAgents = [];
    var subagentHistory = [];
    var sessions = promoBoxState.sessions || [];

    for (var i = 0; i < sessions.length; i++) {
      var session = sessions[i];
      if (!session || !session.root) continue;
      var boxedAt = typeof session.boxedAt === 'number' ? session.boxedAt : now;
      var agents = buildPromoAgentsForRoots([session.root], boxedAt, {
        sessionId: session.id || 'promo-box',
        baseTime: boxedAt,
        doneAt: boxedAt,
        rootIndexOffset: i
      });
      if (!agents.length) continue;
      boxedAgents.push(agents[0]);
      for (var j = 1; j < agents.length; j++) {
        subagentHistory.push(agents[j]);
      }
    }

    boxedAgents.sort(function (a, b) {
      return (a.doneAt || 0) - (b.doneAt || 0);
    });
    subagentHistory.sort(function (a, b) {
      var doneDiff = (a.doneAt || 0) - (b.doneAt || 0);
      if (doneDiff) return doneDiff;
      return (a.createdAt || 0) - (b.createdAt || 0);
    });

    return {
      boxedAgents: boxedAgents,
      subagentHistory: subagentHistory
    };
  }

  function buildPromoDiscoveryRecord(agent, agents, pokemonId, now) {
    var parentPromoAgent = null;
    if (agent.parentId) {
      for (var i = 0; i < agents.length; i++) {
        if (agents[i].agentId === agent.parentId) {
          parentPromoAgent = agents[i];
          break;
        }
      }
    }
    return {
      agentId: agent.agentId,
      agentName: agent.displayName || promoDisplayLabel({ pokemonId: pokemonId }),
      projectId: agent.projectId,
      sessionId: agent.sessionId,
      createdAt: agent.createdAt,
      discoveredAt: now,
      parentId: agent.parentId || null,
      parentName: parentPromoAgent ? agentLabel(parentPromoAgent) : null,
      viaSubagent: !!agent.parentId
    };
  }

  function promoPokedexSnapshotForAgents(agents, now) {
    var previous = normalizePromoPokedexState(promoPokedexState);
    var seenPokemonIds = new Set(previous.seenPokemonIds || []);
    var firstDiscoveryByPokemon = { ...(previous.firstDiscoveryByPokemon || {}) };
    var changed = false;

    for (var i = 0; i < agents.length; i++) {
      var promoAgent = agents[i];
      var pokemonId = Number(promoAgent.forcedPokemonId);
      if (!Number.isInteger(pokemonId)) continue;
      if (!seenPokemonIds.has(pokemonId)) {
        seenPokemonIds.add(pokemonId);
        changed = true;
      }
      if (!firstDiscoveryByPokemon[pokemonId]) {
        firstDiscoveryByPokemon[pokemonId] = buildPromoDiscoveryRecord(promoAgent, agents, pokemonId, now);
        changed = true;
      }
    }

    var snapshot = {
      seenPokemonIds: Array.from(seenPokemonIds).sort(function (a, b) { return a - b; }),
      firstDiscoveryByPokemon: firstDiscoveryByPokemon,
      discoveredCount: seenPokemonIds.size,
      totalCount: POKEDEX_TOTAL
    };

    if (
      changed ||
      previous.discoveredCount !== snapshot.discoveredCount ||
      (previous.totalCount || POKEDEX_TOTAL) !== snapshot.totalCount
    ) {
      promoPokedexState = snapshot;
      savePromoPokedexState();
    } else {
      promoPokedexState = previous;
      snapshot = previous;
    }

    return snapshot;
  }

  function buildPromoSnapshot(baseSnapshot) {
    var source = baseSnapshot || appState.liveSnapshot || appState.snapshot;
    var base = source || {
      config: { isMockMode: true, enablePokeapiSprites: true },
      pokedex: { seenPokemonIds: [], firstDiscoveryByPokemon: {}, totalCount: POKEDEX_TOTAL }
    };
    var now = Date.now();
    var agents = buildPromoAgents(now);
    var promoBoxSnapshot = buildPromoBoxSnapshot(now);
    var promoPokedex = promoPokedexSnapshotForAgents(agents, now);

    return {
      now: now,
      lastUpdate: now,
      activeTimeoutSec: base.activeTimeoutSec || 8,
      staleTimeoutSec: base.staleTimeoutSec || 120,
      activeAgentCount: agents.filter(function (agent) { return agent.isActive; }).length,
      pokedex: promoPokedex,
      agents: agents,
      recentEvents: [],
      boxedAgents: promoBoxSnapshot.boxedAgents,
      subagentHistory: promoBoxSnapshot.subagentHistory,
      ownedPokemon: base.ownedPokemon || [],
      pokemonBoxes: base.pokemonBoxes || [],
      evolutionItems: base.evolutionItems || evolutionItemState(),
      projectTraining: base.projectTraining || {},
      trainingEvents: base.trainingEvents || [],
      config: {
        ...(base.config || {}),
        promoStudioActive: true
      }
    };
  }

  function applyDisplaySnapshot(snapshot) {
    var agents;
    var config = snapshot.config || {};
    appState.snapshot = snapshot;
    syncAreaFilterFromSnapshot(config);
    applyPositionCacheScope(config);
    if (hardResetBtnEl) {
      hardResetBtnEl.hidden = !(config.isMockMode && config.supportsHardReset);
    }
    renderPromoStudio(false);
    appState.agentById = new Map((snapshot.agents || []).map(function (agent) {
      return [agent.agentId, agent];
    }));
    updateFilterOptions();
    reconcileEntities(filteredAgents());
    renderAgentList();
    renderBoxList();
    renderOwnedPokemon();
    if (uiState.boxHistoryOpen) {
      renderBoxHistory();
    }
    if (uiState.ownedOpen) {
      renderOwnedPokemon();
    }
    if (uiState.subhistoryOpen) {
      renderSubhistoryModal();
    }
    renderPokedex();
    agents = filteredAgents();
    activeCountEl.textContent = String(snapshot.activeAgentCount || 0);
    lastUpdateEl.textContent = formatTime(snapshot.lastUpdate || Date.now());
    tokenTotalEl.textContent = formatTokenCount(filteredTokenTotal(agents));
    updateRateLimits(snapshot);
  }

  function syncVisibleSnapshot() {
    var baseSnapshot = appState.liveSnapshot || appState.snapshot;
    if (!baseSnapshot) return;
    if (!promoStudioAvailable()) {
      applyDisplaySnapshot(baseSnapshot);
      return;
    }
    applyDisplaySnapshot(uiState.promoStudioEnabled ? buildPromoSnapshot(baseSnapshot) : baseSnapshot);
  }

  function promoPokemonOptionsHtml(selectedId) {
    var html = '';
    for (var pokemonId = POKEDEX_MIN; pokemonId <= POKEDEX_MAX; pokemonId++) {
      html += '<option value="' + pokemonId + '"' + (pokemonId === selectedId ? ' selected' : '') + '>';
      html += '#' + String(pokemonId).padStart(3, '0') + ' ' + escapeHtml(pokemonDisplayName(pokemonId));
      html += '</option>';
    }
    return html;
  }

  function promoStatusOptionsHtml(selectedStatus) {
    var html = '';
    for (var i = 0; i < PROMO_STATUSES.length; i++) {
      var status = PROMO_STATUSES[i];
      html += '<option value="' + escapeHtml(status) + '"' + (status === selectedStatus ? ' selected' : '') + '>' + escapeHtml(localizedStatusText(status)) + '</option>';
    }
    return html;
  }

  function renderPromoSubagentCard(rootId, subagent, index) {
    var stats = promoLevelDetails(subagent);
    var expMax = stats.level >= 100 ? 0 : stats.needed;
    var subtitle = '#' + String(subagent.pokemonId).padStart(3, '0') + ' ' + escapeHtml(pokemonDisplayName(subagent.pokemonId));
    var html = '';
    html += '<article class="promo-scene-card subagent-card" data-root-id="' + escapeHtml(rootId) + '" data-sub-id="' + escapeHtml(subagent.id) + '">';
    html += '<div class="promo-scene-card-head">';
    html += '<div class="promo-scene-card-title-wrap">';
    html += '<h3 class="promo-scene-card-title">' + escapeHtml(t('subagent', { count: index + 1 })) + '</h3>';
    html += '<p class="promo-scene-card-subtitle">' + subtitle + '</p>';
    html += '</div>';
    html += '<button class="promo-scene-remove" type="button" data-action="remove-subagent" data-root-id="' + escapeHtml(rootId) + '" data-sub-id="' + escapeHtml(subagent.id) + '">' + escapeHtml(t('remove')) + '</button>';
    html += '</div>';
    html += '<div class="promo-scene-fields">';
    html += '<label class="promo-field-wide"><span class="promo-field-label">' + escapeHtml(t('name')) + '</span><input type="text" data-root-id="' + escapeHtml(rootId) + '" data-sub-id="' + escapeHtml(subagent.id) + '" data-field="label" value="' + escapeHtml(subagent.label || '') + '" maxlength="40" /></label>';
    html += '<label class="promo-field-wide"><span class="promo-field-label">' + escapeHtml(t('pokemon')) + '</span><select data-root-id="' + escapeHtml(rootId) + '" data-sub-id="' + escapeHtml(subagent.id) + '" data-field="pokemonId">' + promoPokemonOptionsHtml(subagent.pokemonId) + '</select></label>';
    html += '<label class="promo-field"><span class="promo-field-label">' + escapeHtml(t('level')) + '</span><input type="number" min="1" max="100" data-root-id="' + escapeHtml(rootId) + '" data-sub-id="' + escapeHtml(subagent.id) + '" data-field="level" value="' + stats.level + '" /></label>';
    html += '<label class="promo-field"><span class="promo-field-label">EXP</span><input type="number" min="0" max="' + expMax + '" data-root-id="' + escapeHtml(rootId) + '" data-sub-id="' + escapeHtml(subagent.id) + '" data-field="exp" value="' + stats.intoLevel + '" /><span class="promo-field-note">' + escapeHtml(t('expTokenAuto')) + '</span></label>';
    html += '<label class="promo-field"><span class="promo-field-label">HP %</span><input type="number" min="0" max="100" data-root-id="' + escapeHtml(rootId) + '" data-sub-id="' + escapeHtml(subagent.id) + '" data-field="hp" value="' + stats.hp + '" /></label>';
    html += '<label class="promo-field"><span class="promo-field-label">' + escapeHtml(t('status')) + '</span><select data-root-id="' + escapeHtml(rootId) + '" data-sub-id="' + escapeHtml(subagent.id) + '" data-field="status">' + promoStatusOptionsHtml(subagent.status) + '</select></label>';
    html += '</div>';
    html += '<div class="promo-scene-stats">';
    html += '<span class="promo-scene-chip">TOK ' + formatTokenCount(stats.totalTokens) + '</span>';
    html += '<span class="promo-scene-chip">EXP ' + formatTokenCount(stats.intoLevel) + ' / ' + formatTokenCount(stats.needed) + '</span>';
    html += '<span class="promo-scene-chip">HP ' + stats.hp + '%</span>';
    html += '</div>';
    html += '</article>';
    return html;
  }

  function renderPromoRootCard(root, index) {
    var stats = promoLevelDetails(root);
    var subagents = Array.isArray(root.subagents) ? root.subagents : [];
    var expMax = stats.level >= 100 ? 0 : stats.needed;
    var html = '';
    html += '<article class="promo-scene-card" data-root-id="' + escapeHtml(root.id) + '">';
    html += '<div class="promo-scene-card-head">';
    html += '<div class="promo-scene-card-title-wrap">';
    html += '<h3 class="promo-scene-card-title">' + escapeHtml(t('rootAgent', { count: index + 1 })) + '</h3>';
    html += '<p class="promo-scene-card-subtitle">#' + String(root.pokemonId).padStart(3, '0') + ' ' + escapeHtml(pokemonDisplayName(root.pokemonId)) + ' - ' + subagents.length + ' ' + escapeHtml(t('subagents')) + '</p>';
    html += '</div>';
    html += '<div class="promo-scene-card-actions">';
    html += '<button class="promo-scene-box" type="button" data-action="box-root" data-root-id="' + escapeHtml(root.id) + '">' + escapeHtml(t('box')) + '</button>';
    html += '<button class="promo-scene-remove" type="button" data-action="remove-root" data-root-id="' + escapeHtml(root.id) + '">' + escapeHtml(t('remove')) + '</button>';
    html += '</div>';
    html += '</div>';
    html += '<div class="promo-scene-fields">';
    html += '<label class="promo-field-wide"><span class="promo-field-label">' + escapeHtml(t('name')) + '</span><input type="text" data-root-id="' + escapeHtml(root.id) + '" data-field="label" value="' + escapeHtml(root.label || '') + '" maxlength="40" /></label>';
    html += '<label class="promo-field-wide"><span class="promo-field-label">' + escapeHtml(t('pokemon')) + '</span><select data-root-id="' + escapeHtml(root.id) + '" data-field="pokemonId">' + promoPokemonOptionsHtml(root.pokemonId) + '</select></label>';
    html += '<label class="promo-field"><span class="promo-field-label">' + escapeHtml(t('level')) + '</span><input type="number" min="1" max="100" data-root-id="' + escapeHtml(root.id) + '" data-field="level" value="' + stats.level + '" /></label>';
    html += '<label class="promo-field"><span class="promo-field-label">EXP</span><input type="number" min="0" max="' + expMax + '" data-root-id="' + escapeHtml(root.id) + '" data-field="exp" value="' + stats.intoLevel + '" /><span class="promo-field-note">' + escapeHtml(t('expConverted')) + '</span></label>';
    html += '<label class="promo-field"><span class="promo-field-label">HP %</span><input type="number" min="0" max="100" data-root-id="' + escapeHtml(root.id) + '" data-field="hp" value="' + stats.hp + '" /></label>';
    html += '<label class="promo-field"><span class="promo-field-label">' + escapeHtml(t('status')) + '</span><select data-root-id="' + escapeHtml(root.id) + '" data-field="status">' + promoStatusOptionsHtml(root.status) + '</select></label>';
    html += '</div>';
    html += '<div class="promo-scene-stats">';
    html += '<span class="promo-scene-chip">TOK ' + formatTokenCount(stats.totalTokens) + '</span>';
    html += '<span class="promo-scene-chip">EXP ' + formatTokenCount(stats.intoLevel) + ' / ' + formatTokenCount(stats.needed) + '</span>';
    html += '<span class="promo-scene-chip">HP ' + stats.hp + '%</span>';
    html += '</div>';
    html += '<section class="promo-scene-subagents">';
    html += '<div class="promo-scene-subagents-head">';
    html += '<div><h4 class="promo-scene-subagents-title">' + escapeHtml(t('subagents')) + '</h4><div class="promo-scene-subagents-count">' + escapeHtml(t('configured', { count: subagents.length })) + '</div></div>';
    html += '<button class="promo-studio-btn promo-scene-add-subagent" type="button" data-action="add-subagent" data-root-id="' + escapeHtml(root.id) + '">' + escapeHtml(t('addSubagent')) + '</button>';
    html += '</div>';
    html += '<div class="promo-scene-subagents-list">';
    for (var i = 0; i < subagents.length; i++) {
      html += renderPromoSubagentCard(root.id, subagents[i], i);
    }
    html += '</div>';
    html += '</section>';
    html += '</article>';
    return html;
  }

  function renderPromoStudio(rebuildList) {
    var shouldRebuildList = rebuildList !== false;
    if (!promoStudioToggleEl || !promoStudioPanelEl) return;
    var available = promoStudioAvailable();
    promoStudioToggleEl.hidden = !available;
    if (!available) {
      uiState.promoStudioOpen = false;
      promoStudioPanelEl.hidden = true;
      return;
    }
    promoStudioToggleEl.setAttribute('aria-pressed', String(uiState.promoStudioOpen));
    promoStudioPanelEl.hidden = !uiState.promoStudioOpen;
    promoStudioEnabledEl.checked = !!uiState.promoStudioEnabled;
    var counts = promoSceneCounts();
    promoStudioSummaryEl.textContent = t('promoSummary', {
      roots: counts.roots,
      rootPlural: counts.roots === 1 ? '' : 's',
      subagents: counts.subagents,
      subPlural: counts.subagents === 1 ? '' : 's',
      boxed: counts.boxed
    });
    if (!shouldRebuildList) {
      return;
    }
    if (!uiState.promoStudioOpen) {
      return;
    }
    if (!counts.roots) {
      promoStudioListEl.innerHTML = '<div class="promo-scene-empty">' + escapeHtml(t('noPromoAgents')) + '</div>';
      return;
    }
    var html = '';
    for (var i = 0; i < promoStudioState.roots.length; i++) {
      html += renderPromoRootCard(promoStudioState.roots[i], i);
    }
    promoStudioListEl.innerHTML = html;
  }

  function syncPromoStudioState() {
    promoStudioState = normalizePromoStudioState(promoStudioState);
    promoBoxState = normalizePromoBoxState(promoBoxState);
    savePromoStudioState();
    savePromoBoxState();
    renderPromoStudio();
    syncVisibleSnapshot();
  }

  function findPromoRoot(rootId) {
    var roots = promoStudioState.roots || [];
    for (var i = 0; i < roots.length; i++) {
      if (roots[i].id === rootId) return roots[i];
    }
    return null;
  }

  function findPromoSubagent(root, subId) {
    if (!root || !Array.isArray(root.subagents)) return null;
    for (var i = 0; i < root.subagents.length; i++) {
      if (root.subagents[i].id === subId) return root.subagents[i];
    }
    return null;
  }

  function collectPromoUnitIds(unit, out) {
    if (!unit) return;
    out.push(unit.id);
    var subagents = Array.isArray(unit.subagents) ? unit.subagents : [];
    for (var i = 0; i < subagents.length; i++) {
      collectPromoUnitIds(subagents[i], out);
    }
  }

  function invalidateAgentPosition(agentId) {
    if (!agentId) return;
    delete positionCache[agentId];
    appState.entityById.delete(agentId);
    appState.roomAssignments.delete(agentId);
    animations.delete(agentId);
  }

  function invalidatePromoFamilyPositions(rootId) {
    var root = findPromoRoot(rootId);
    if (!root) return;
    invalidatePromoUnitTree(root);
  }

  function invalidatePromoUnitTree(root) {
    if (!root) return;
    var ids = [];
    collectPromoUnitIds(root, ids);
    for (var i = 0; i < ids.length; i++) {
      invalidateAgentPosition(ids[i]);
    }
    savePositionCache();
  }

  function findPromoBoxSession(agentId) {
    var sessions = promoBoxState.sessions || [];
    for (var i = 0; i < sessions.length; i++) {
      if (sessions[i] && sessions[i].root && sessions[i].root.id === agentId) {
        return { index: i, session: sessions[i] };
      }
    }
    return null;
  }

  function boxPromoRoot(rootId) {
    var root = findPromoRoot(rootId);
    if (!root) return false;
    invalidatePromoUnitTree(root);
    promoBoxState.sessions.push({
      id: createPromoId('promo-box'),
      boxedAt: Date.now(),
      root: normalizePromoUnit(root, true)
    });
    promoStudioState.roots = (promoStudioState.roots || []).filter(function (item) {
      return item.id !== rootId;
    });
    syncPromoStudioState();
    return true;
  }

  function unboxPromoRoot(agentId) {
    var match = findPromoBoxSession(agentId);
    if (!match) return false;
    promoBoxState.sessions.splice(match.index, 1);
    var root = normalizePromoUnit(match.session.root, true);
    invalidatePromoUnitTree(root);
    promoStudioState.roots.push(root);
    syncPromoStudioState();
    return true;
  }

  function updatePromoUnitField(rootId, subId, field, rawValue) {
    var targetRoot = findPromoRoot(rootId);
    var target = subId ? findPromoSubagent(targetRoot, subId) : targetRoot;
    if (!target) return;
    var shouldRespawnFamily = false;

    if (field === 'label') {
      target.label = String(rawValue || '').slice(0, 40);
    } else if (field === 'pokemonId') {
      target.pokemonId = promoClampInt(rawValue, POKEDEX_MIN, POKEDEX_MAX, target.pokemonId || POKEDEX_MIN);
      shouldRespawnFamily = !subId;
    } else if (field === 'level') {
      target.level = promoClampInt(rawValue, 1, 100, target.level || 1);
      target.exp = promoClampInt(target.exp, 0, target.level >= 100 ? 0 : expToNextLevel(target.level), 0);
    } else if (field === 'exp') {
      var currentLevel = promoClampInt(target.level, 1, 100, 1);
      target.exp = promoClampInt(rawValue, 0, currentLevel >= 100 ? 0 : expToNextLevel(currentLevel), target.exp || 0);
    } else if (field === 'hp') {
      target.hp = promoClampInt(rawValue, 0, 100, target.hp || 100);
    } else if (field === 'status') {
      target.status = PROMO_STATUSES.indexOf(rawValue) >= 0 ? rawValue : target.status;
    }
    if (shouldRespawnFamily) {
      invalidatePromoFamilyPositions(rootId);
    }
    syncPromoStudioState();
  }

  function rootAgentBadge(agent) {
    if (agent && agent.isPromoCustom) {
      return agent.displayName || pokemonDisplayName(getRenderPokemonId(agent));
    }
    if (agent && agent.displayName) {
      return stripProjectPrefix(agent.displayName);
    }
    return shortProjectName(agent && agent.projectId);
  }

  function renderAgentList() {
    var agents = listedAgents();

    if (agents.length === 0) {
      agentListEl.innerHTML = '<div class="poke-slot" style="cursor:default;justify-content:center">' + escapeHtml(t('noAgentsYet')) + '</div>';
      return;
    }

    // Remember which cards are expanded
    var expandedIds = {};
    var existingCards = agentListEl.querySelectorAll('.poke-slot.expanded');
    for (var e = 0; e < existingCards.length; e++) {
      var eid = existingCards[e].getAttribute('data-agent-id');
      if (eid) expandedIds[eid] = true;
    }

    // Resolve room index for each agent — use entity if available, else derive from pokemon habitat
    for (var i = 0; i < agents.length; i++) {
      var a = agents[i];
      var entity = appState.entityById.get(a.agentId);
      if (entity) {
        a._roomIndex = entity.roomIndex;
      } else {
        // Derive from pokemon habitat even if entity hasn't been created yet
        var pid = getRenderPokemonId(a);
        var hIdx = getPokemonAreaIndex(pid);
        a._roomIndex = hIdx >= 0 ? hIdx : 999;
      }
    }

    // Build tree, then sort roots by area index → createdAt
    var tree = buildAgentTree(agents);
    var selectedRoomIndex = selectedAreaIndex();
    tree.roots.sort(function (a, b) {
      if (selectedRoomIndex >= 0) {
        var aPriority = a._roomIndex === selectedRoomIndex ? 0 : 1;
        var bPriority = b._roomIndex === selectedRoomIndex ? 0 : 1;
        if (aPriority !== bPriority) return aPriority - bPriority;
      }
      if (a._roomIndex !== b._roomIndex) return a._roomIndex - b._roomIndex;
      return (a.createdAt || 0) - (b.createdAt || 0);
    });

    var collapsedIds = uiState.collapsedSubtrees || {};
    var html = '';
    var currentRoom = -1;
    var renderState = { count: 0, limit: agents.length };
    for (var i = 0; i < tree.roots.length && renderState.count < renderState.limit; i++) {
      var agent = tree.roots[i];
      var roomIndex = agent._roomIndex;

      if (roomIndex !== currentRoom) {
        currentRoom = roomIndex;
        var roomLabel = AREAS[roomIndex] ? localizedAreaLabel(AREAS[roomIndex]) : localizedUnknownAreaLabel();
        html += '<div class="room-header">' + escapeHtml(roomLabel) + '</div>';
      }

      html += '<section class="agent-family">';
      html += renderAgentBranch(agent, 0, tree, expandedIds, collapsedIds, renderState, true);
      html += '</section>';
    }

    for (var j = 0; j < agents.length; j++) {
      delete agents[j]._children;
      delete agents[j]._roomIndex;
    }

    agentListEl.innerHTML = html;
  }

  // Project badge tooltip (fixed-position to escape overflow:hidden parents)
  var projectTooltipEl = document.createElement('div');
  projectTooltipEl.className = 'project-tooltip';
  document.body.appendChild(projectTooltipEl);

  agentListEl.addEventListener('mouseover', function (e) {
    var badge = e.target.closest('.poke-project-badge');
    if (!badge) return;
    var text = badge.getAttribute('data-full');
    if (!text) return;
    projectTooltipEl.textContent = text;
    var rect = badge.getBoundingClientRect();
    projectTooltipEl.style.left = rect.left + 'px';
    projectTooltipEl.style.top = (rect.bottom + 4) + 'px';
    projectTooltipEl.classList.add('visible');
  });
  agentListEl.addEventListener('mouseout', function (e) {
    var badge = e.target.closest('.poke-project-badge');
    if (badge) {
      projectTooltipEl.classList.remove('visible');
    }
  });

  // Map tooltip for hovering sprites on the map
  var mapTooltipEl = document.createElement('div');
  mapTooltipEl.className = 'map-tooltip';
  document.body.appendChild(mapTooltipEl);
  var mapTooltipHideTimer = null;
  var mapTooltipHideDelay = 70;
  var mapTooltipBridgeDelay = 95;
  var mapTooltipGap = 2;

  function cancelPendingMapTooltipHide() {
    if (mapTooltipHideTimer !== null) {
      clearTimeout(mapTooltipHideTimer);
      mapTooltipHideTimer = null;
    }
  }

  function scheduleMapTooltipHide(delayMs) {
    cancelPendingMapTooltipHide();
    mapTooltipHideTimer = setTimeout(function () {
      mapTooltipHideTimer = null;
      hideMapTooltip();
    }, typeof delayMs === 'number' ? delayMs : mapTooltipHideDelay);
  }

  mapTooltipEl.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-action="box"]');
    if (btn) {
      var agentId = btn.getAttribute('data-agent-id');
      transport.box(agentId);
      hideMapTooltip();
    }
  });
  mapTooltipEl.addEventListener('mouseenter', function () {
    cancelPendingMapTooltipHide();
  });
  mapTooltipEl.addEventListener('mouseleave', function (e) {
    var related = e.relatedTarget;
    if (related && related.closest && related.closest('.agent-sprite[data-agent-id]')) return;
    scheduleMapTooltipHide();
  });

  function showMapTooltip(agent, anchorRect) {
    var isSleep = agent.isSleeping || !agent.isActive;
    var spriteUrl = pokemonSpriteUrl(agent, isSleep);
    var rawName = stripProjectPrefix(agent.displayName) || agent.subagentType || toShortId(agent.agentId);
    var name = rawName.length > 20 ? rawName.slice(0, 19) + '…' : rawName;
    var fullLabel = agentLabel(agent);
    var lastCommand = commandText(agent.lastCommand);
    var xp = agentLevelProgress(agent);
    var contextStats = agentContextStats(agent);
    var contextMax = contextStats.contextMax;
    var contextRemaining = contextStats.contextRemaining;
    var barColor = contextStats.hpColor;
    var barPct = contextStats.hpPct;

    var html = '';
    html += '<div class="map-tooltip-title">' + escapeHtml(fullLabel) + '</div>';
    html += '<div class="map-tooltip-header">';
    html += '<img class="map-tooltip-sprite" src="' + escapeHtml(spriteUrl) + '" />';
    html += '<div class="map-tooltip-info">';
    html += '<span class="map-tooltip-name">' + escapeHtml(name) + '</span>';
    html += '<div class="map-tooltip-lv-row">';
    html += '<span class="map-tooltip-lv">LV.' + xp.level + '</span>';
    var projName = shortProjectName(agent.projectId);
    html += '<span class="map-tooltip-project">' + escapeHtml(projName) + '</span>';
    html += '</div>';
    html += '</div></div>';
    html += '<div class="map-tooltip-hp">';
    html += '<span class="poke-hp-label">HP</span>';
    html += '<div class="poke-hp-track"><div class="poke-hp-fill" style="width:' + barPct.toFixed(1) + '%;background:' + barColor + '"></div></div>';
    html += '<span class="map-tooltip-hp-nums">' + formatContextK(contextRemaining) + '/' + formatContextK(contextMax) + '</span>';
    html += '</div>';
    html += '<div class="map-tooltip-exp">';
    html += '<span class="poke-exp-label">EXP</span>';
    html += '<div class="poke-exp-track"><div class="poke-exp-fill" style="width:' + xp.progress.toFixed(1) + '%"></div></div>';
    html += '<span class="map-tooltip-exp-nums">' + formatTokenCount(xp.intoLevel) + '/' + formatTokenCount(xp.needed) + '</span>';
    html += '</div>';
    html += '<div class="map-tooltip-details">';
    html += '<div class="detail-row"><span class="detail-label">' + escapeHtml(t('status')) + '</span><span class="detail-value">' + escapeHtml(localizedStatusText(agent.status)) + '</span></div>';
    html += '<div class="detail-row"><span class="detail-label">' + escapeHtml(t('started')) + '</span><span class="detail-value">' + formatTime(agent.createdAt) + '</span></div>';
    html += '<div class="detail-row"><span class="detail-label">' + escapeHtml(t('lastTool')) + '</span><span class="detail-value">' + escapeHtml(agent.lastTool || '-') + '</span></div>';
    html += '<div class="detail-row"><span class="detail-label">' + escapeHtml(t('toolsRun')) + '</span><span class="detail-value">' + (agent.counters.toolStarts || 0) + '</span></div>';
    html += '<div class="detail-row"><span class="detail-label">' + escapeHtml(t('tokens')) + '</span><span class="detail-value">' + formatTokenCount(xp.totalTokens) + '</span></div>';
    var secsAgo = Math.max(0, Math.floor((Date.now() - agent.lastSeen) / 1000));
    html += '<div class="detail-row"><span class="detail-label">' + escapeHtml(t('lastSeen')) + '</span><span class="detail-value">' + escapeHtml(formatSecondsAgo(secsAgo)) + '</span></div>';
    html += '</div>';
    if (lastCommand) {
      html += '<div class="map-tooltip-command" title="' + escapeHtml(lastCommand) + '"><span class="map-tooltip-command-label">' + escapeHtml(t('lastCommand')) + '</span><span class="map-tooltip-command-value">' + escapeHtml(lastCommand) + '</span></div>';
    }
    if (agent.lastUserQuery) {
      html += '<div class="map-tooltip-query">' + escapeHtml(agent.lastUserQuery) + '</div>';
    }
    html += '<button class="map-tooltip-box-btn" data-action="box" data-agent-id="' + escapeHtml(agent.agentId) + '">' + escapeHtml(t('archive')) + '</button>';

    mapTooltipEl.innerHTML = html;
    mapTooltipEl.style.display = 'block';

    var tw = 220;
    var left = anchorRect.left + anchorRect.width / 2 - tw / 2;
    left = Math.max(4, Math.min(left, window.innerWidth - tw - 4));
    var th = mapTooltipEl.offsetHeight;
    var top = anchorRect.top - th - mapTooltipGap;
    if (top < 4) top = anchorRect.bottom + mapTooltipGap;
    mapTooltipEl.style.left = left + 'px';
    mapTooltipEl.style.top = top + 'px';
  }

  function hideMapTooltip() {
    cancelPendingMapTooltipHide();
    mapTooltipEl.style.display = 'none';
  }

  // Shared fixed-position tooltip for box items
  var boxTooltipEl = document.createElement('div');
  boxTooltipEl.className = 'box-tooltip';
  document.body.appendChild(boxTooltipEl);

  var pokedexTooltipEl = document.createElement('div');
  pokedexTooltipEl.className = 'pokedex-tooltip';
  document.body.appendChild(pokedexTooltipEl);

  var subhistoryTooltipEl = document.createElement('div');
  subhistoryTooltipEl.className = 'subhistory-tooltip';
  document.body.appendChild(subhistoryTooltipEl);

  function showBoxTooltip(agent, anchorRect) {
    var spriteUrl = pokemonStaticIconUrl(agent);
    var name = agent.displayName || agent.subagentType || toShortId(agent.agentId);
    var lastCommand = commandText(agent.lastCommand);
    var xp = agentLevelProgress(agent);
    var contextStats = agentContextStats(agent);
    var contextMax = contextStats.contextMax;
    var contextRemaining = contextStats.contextRemaining;
    var barColor = contextStats.hpColor;
    var barPct = contextStats.hpPct;
    var duration = formatDuration(agent.createdAt, agent.doneAt);

    var html = '';
    html += '<div class="box-tooltip-header">';
    html += '<img class="box-tooltip-sprite" src="' + escapeHtml(spriteUrl) + '" />';
    html += '<div class="box-tooltip-title">';
    html += '<span class="box-tooltip-name">' + escapeHtml(name) + '</span>';
    html += '<div class="map-tooltip-lv-row">';
    html += '<span class="box-tooltip-lv">LV.' + xp.level + '</span>';
    var projName = shortProjectName(agent.projectId);
    html += '<span class="map-tooltip-project">' + escapeHtml(projName) + '</span>';
    html += '</div>';
    html += '</div></div>';
    html += '<div class="box-tooltip-hp">';
    html += '<span class="poke-hp-label">HP</span>';
    html += '<div class="poke-hp-track"><div class="poke-hp-fill" style="width:' + barPct.toFixed(1) + '%;background:' + barColor + '"></div></div>';
    html += '<span class="box-tooltip-hp-nums">' + formatContextK(contextRemaining) + '/' + formatContextK(contextMax) + '</span>';
    html += '</div>';
    html += '<div class="box-tooltip-exp">';
    html += '<span class="poke-exp-label">EXP</span>';
    html += '<div class="poke-exp-track"><div class="poke-exp-fill" style="width:' + xp.progress.toFixed(1) + '%"></div></div>';
    html += '<span class="box-tooltip-exp-nums">' + formatTokenCount(xp.intoLevel) + '/' + formatTokenCount(xp.needed) + '</span>';
    html += '</div>';
    html += '<div class="box-tooltip-details">';
    html += '<div class="detail-row"><span class="detail-label">ID</span><span class="detail-value">' + escapeHtml(toShortId(agent.agentId)) + '</span></div>';
    html += '<div class="detail-row"><span class="detail-label">' + escapeHtml(t('started')) + '</span><span class="detail-value">' + formatTime(agent.createdAt) + '</span></div>';
    html += '<div class="detail-row"><span class="detail-label">' + escapeHtml(t('ended')) + '</span><span class="detail-value">' + formatTime(agent.doneAt) + '</span></div>';
    html += '<div class="detail-row"><span class="detail-label">' + escapeHtml(t('duration')) + '</span><span class="detail-value">' + duration + '</span></div>';
    html += '<div class="detail-row"><span class="detail-label">' + escapeHtml(t('toolsRun')) + '</span><span class="detail-value">' + (agent.counters.toolStarts || 0) + '</span></div>';
    html += '<div class="detail-row"><span class="detail-label">' + escapeHtml(t('tokens')) + '</span><span class="detail-value">' + formatTokenCount(xp.totalTokens) + '</span></div>';
    if (agent.subagentType) {
      html += '<div class="detail-row"><span class="detail-label">' + escapeHtml(t('type')) + '</span><span class="detail-value">' + escapeHtml(agent.subagentType) + '</span></div>';
    }
    html += '</div>';
    if (lastCommand) {
      html += '<div class="box-tooltip-command" title="' + escapeHtml(lastCommand) + '"><span class="box-tooltip-command-label">' + escapeHtml(t('lastCommand')) + '</span><span class="box-tooltip-command-value">' + escapeHtml(lastCommand) + '</span></div>';
    }

    boxTooltipEl.innerHTML = html;
    boxTooltipEl.style.display = 'block';

    // Position above the hovered sprite, clamped to viewport
    var tw = 210;
    var left = anchorRect.left + anchorRect.width / 2 - tw / 2;
    left = Math.max(4, Math.min(left, window.innerWidth - tw - 4));
    // Measure tooltip height after content is set
    var th = boxTooltipEl.offsetHeight;
    var top = anchorRect.top - th - mapTooltipGap;
    if (top < 4) top = anchorRect.bottom + mapTooltipGap; // flip below if no room above
    boxTooltipEl.style.left = left + 'px';
    boxTooltipEl.style.top = top + 'px';
  }

  function hideBoxTooltip() {
    boxTooltipEl.style.display = 'none';
  }

  function formatSummaryDate(ts) {
    if (!ts) return t('noRecord');
    var d = new Date(ts);
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return d.getDate() + ' ' + months[d.getMonth()] + ', ' + d.getFullYear();
  }

  function formatSummaryDateTime(ts) {
    if (!ts) return t('noRecord');
    var d = new Date(ts);
    var y = d.getFullYear();
    var mo = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    var h = String(d.getHours()).padStart(2, '0');
    var m = String(d.getMinutes()).padStart(2, '0');
    var s = String(d.getSeconds()).padStart(2, '0');
    return y + '/' + mo + '/' + day + ', ' + h + ':' + m + ':' + s;
  }

  function tooltipAgentName(agent) {
    return agentPanelName(agent);
  }

  function tooltipRoleLabel(agent) {
    if (!agent) return t('agents');
    if (agent.parentId) return agent.subagentType || t('subagentLabel');
    if (agent.subagentType) return agent.subagentType;
    return t('rootAgentLabel');
  }

  function tooltipStatusClass(status) {
    return String(status || 'idle').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  }

  function tooltipAreaLabel(agent) {
    if (!agent) return localizedUnknownAreaLabel();
    var areaIndex = getAreaIndex(agent);
    return AREAS[areaIndex] ? localizedAreaLabel(AREAS[areaIndex]) : localizedUnknownAreaLabel();
  }

  function buildAgentSummaryTooltip(agent, options) {
    options = options || {};

    var archived = !!options.archived;
    var allowBoxAction = !!options.allowBoxAction;
    var isSleep = agent.isSleeping || !agent.isActive;
    var spriteUrl = pokemonAnimatedSpriteUrl(agent);
    var speciesName = pokemonDisplayName(getRenderPokemonId(agent));
    var xp = agentLevelProgress(agent);
    var agentName = tooltipAgentName(agent);
    var fullLabel = agentLabel(agent);
    var statusText = archived ? t('statusArchived') : localizedStatusText(agent.status || 'Idle');
    var projName = shortProjectName(agent.projectId || 'unknown');
    var metAtText = formatSummaryDateTime(agent.createdAt);
    var lastActivity = commandText(agent.activity || statusText || t('statusIdle'));
    var lastCommand = commandText(agent.lastCommand);
    var noteText = summarizeCommand(lastCommand || (currentLanguage() === 'ko' ? '아직 명령 없음' : 'No command yet'), 116);
    var activityText = summarizeCommand(lastActivity, 96);
    var contextStats = agentContextStats(agent);
    var contextMax = contextStats.contextMax;
    var contextRemaining = contextStats.contextRemaining;
    var barColor = contextStats.hpColor;
    var barPct = contextStats.hpPct;
    var modelLabel = agentTypeLabel(agent, contextMax);
    var memoLines = [];
    var lastSeenText = '-';
    var lastSeenLabel = t('lastSeen');
    var rows = [
      { label: t('name'), value: agentName, wrap: true },
      { label: 'HP', kind: 'meter', meterTone: 'hp', value: formatContextK(contextRemaining) + '/' + formatContextK(contextMax), pct: barPct, color: barColor },
      { label: 'EXP', kind: 'meter', meterTone: 'exp', value: formatTokenCount(xp.intoLevel) + '/' + formatTokenCount(xp.needed), subvalue: t('totalToken'), subvalueDetail: formatTokenCount(xp.totalTokens), pct: xp.progress },
      { label: t('type'), value: modelLabel, pill: true, tone: 'type' }
    ];

    if (archived && agent.doneAt) {
      lastSeenText = formatTime(agent.doneAt);
      lastSeenLabel = t('ended');
    } else if (agent.lastSeen) {
      lastSeenText = formatSecondsAgo(Math.max(0, Math.floor((Date.now() - agent.lastSeen) / 1000)));
    }

    memoLines.push({ html: t('metInProjectAt', { project: '<span class="summary-tooltip-project-accent">' + escapeHtml(projName) + '</span>', time: escapeHtml(metAtText) }), accent: false });

    var rarity = getPokemonRarity(getRenderPokemonId(agent));
    var areaMeta = agentSpawnAreaMeta(agent);

    var html = '';
    html += '<div class="summary-tooltip-shell' + (archived ? ' archived' : ' live') + '">';
    html += '<div class="summary-tooltip-topbar">';
    html += '<div class="summary-tooltip-topbar-main">';
    html += spawnAreaChipHtml(areaMeta, 'summary-tooltip-area-chip');
    html += '<span class="summary-tooltip-window-title">' + escapeHtml(archived ? t('archiveInfo') : t('agentInfo')) + '</span>';
    html += '</div>';
    if (rarity) {
      html += '<span class="pokedex-rarity-badge tier-' + rarity.tier + '">' + escapeHtml(rarity.label) + '</span>';
    }
    html += '</div>';
    html += '<div class="summary-tooltip-main">';
    html += '<div class="summary-tooltip-left">';
    html += '<div class="summary-tooltip-namebar">';
    html += '<span class="summary-tooltip-level">Lv' + xp.level + '</span>';
    html += '<span class="summary-tooltip-agent-name" title="' + escapeHtml(speciesName) + '">' + escapeHtml(speciesName) + '</span>';
    html += '</div>';
    html += '<div class="summary-tooltip-portrait">';
    html += '<span class="summary-tooltip-status summary-status-' + tooltipStatusClass(agent.status || (archived ? 'archived' : 'idle')) + '">' + escapeHtml(statusText) + '</span>';
    html += '<img class="summary-tooltip-sprite" src="' + escapeHtml(spriteUrl) + '" />';
    html += '</div>';
    html += '</div>';
    html += '<div class="summary-tooltip-right">';
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      html += '<div class="summary-tooltip-info-row' + (row.kind === 'meter' ? ' meter meter-' + row.meterTone : '') + '">';
      html += '<span class="summary-tooltip-info-label">' + escapeHtml(row.label) + '</span>';
      if (row.kind === 'meter') {
        html += '<div class="summary-tooltip-meter">';
        html += '<div class="summary-tooltip-meter-track"><div class="summary-tooltip-meter-fill tone-' + row.meterTone + '" style="width:' + row.pct.toFixed(1) + '%;' + (row.color ? 'background:' + row.color + ';' : '') + '"></div></div>';
        html += '<div class="summary-tooltip-meter-meta">';
        html += '<span class="summary-tooltip-meter-subvalue' + (row.subvalue ? '' : ' is-empty') + '">';
        if (row.subvalue) {
          html += escapeHtml(row.subvalue);
          if (row.subvalueDetail) html += ' <b>' + escapeHtml(row.subvalueDetail) + '</b>';
        }
        html += '</span>';
        html += '<span class="summary-tooltip-meter-value">' + escapeHtml(row.value) + '</span>';
        html += '</div>';
        html += '</div>';
      } else {
        html += '<span class="summary-tooltip-info-value' + (row.pill ? ' pill tone-' + row.tone : '') + (row.wrap ? ' wrap' : '') + '">' + escapeHtml(row.value) + '</span>';
      }
      html += '</div>';
    }
    html += '</div>';
    html += '</div>';
    html += '<div class="summary-tooltip-memo">';
    html += '<div class="summary-tooltip-memo-head">';
    html += '<span class="summary-tooltip-memo-title">' + escapeHtml(t('trainerMemo')) + '</span>';
    html += '</div>';
    html += '<div class="summary-tooltip-memo-body">';
    for (var j = 0; j < memoLines.length; j++) {
      html += '<div class="summary-tooltip-memo-line' + (memoLines[j].accent ? ' accent' : '') + '">';
      html += memoLines[j].html || escapeHtml(memoLines[j].text);
      html += '</div>';
    }
    html += '</div>';
    if (noteText || lastActivity) {
      html += '<div class="summary-tooltip-note">';
      html += '<div class="summary-tooltip-note-head">';
      html += '<span class="summary-tooltip-note-label">' + escapeHtml(t('lastCommand')) + '</span>';
      html += '<span class="summary-tooltip-note-meta">' + escapeHtml(lastSeenLabel + ' ' + lastSeenText) + '</span>';
      html += '</div>';
      if (noteText) {
        html += '<span class="summary-tooltip-note-value is-command">' + escapeHtml(noteText) + '</span>';
      }
      if (lastActivity) {
        html += '<div class="summary-tooltip-note-head is-secondary">';
        html += '<span class="summary-tooltip-note-label is-secondary">' + escapeHtml(t('lastActivity')) + '</span>';
        html += '</div>';
        html += '<span class="summary-tooltip-note-value is-secondary">' + escapeHtml(activityText) + '</span>';
      }
      html += '</div>';
    }
    if (allowBoxAction) {
      html += '<button class="summary-tooltip-box-btn map-tooltip-box-btn" data-action="box" data-agent-id="' + escapeHtml(agent.agentId) + '">' + escapeHtml(t('archive')) + '</button>';
    }
    html += '</div>';
    html += '</div>';

    return html;
  }

  function showMapTooltipSummary(agent, anchorRect) {
    cancelPendingMapTooltipHide();
    mapTooltipEl.innerHTML = buildAgentSummaryTooltip(agent, { allowBoxAction: true });
    mapTooltipEl.style.display = 'block';

    var tw = mapTooltipEl.offsetWidth;
    var left = anchorRect.left + anchorRect.width / 2 - tw / 2;
    left = Math.max(4, Math.min(left, window.innerWidth - tw - 4));
    var th = mapTooltipEl.offsetHeight;
    var top = anchorRect.top - th - mapTooltipGap;
    if (top < 4) top = anchorRect.bottom + mapTooltipGap;
    mapTooltipEl.style.left = left + 'px';
    mapTooltipEl.style.top = top + 'px';
  }

  function showBoxTooltipSummary(agent, anchorRect) {
    boxTooltipEl.innerHTML = buildAgentSummaryTooltip(agent, { archived: true });
    boxTooltipEl.style.display = 'block';

    var tw = boxTooltipEl.offsetWidth;
    var left = anchorRect.left + anchorRect.width / 2 - tw / 2;
    left = Math.max(4, Math.min(left, window.innerWidth - tw - 4));
    var th = boxTooltipEl.offsetHeight;
    var top = anchorRect.top - th - mapTooltipGap;
    if (top < 4) top = anchorRect.bottom + mapTooltipGap;
    boxTooltipEl.style.left = left + 'px';
    boxTooltipEl.style.top = top + 'px';
  }

  function showPokedexTooltip(pokemonId, anchorRect) {
    var discovery = pokedexDiscoveryInfo(pokemonId);
    var rarity = getPokemonRarity(pokemonId);
    var labels = pokedexTooltipLabels();
    var name = pokemonDisplayName(pokemonId);
    var encounterCount = pokedexEncounterCount(pokemonId);
    var encounterText = uiState.pokedexLanguage === 'ko'
      ? encounterCount + '번'
      : encounterCount + (encounterCount === 1 ? ' time' : ' times');
    var firstMetAt = discovery ? (discovery.discoveredAt || discovery.createdAt) : null;
    var projectName = discovery && discovery.projectId && discovery.projectId !== 'unknown-project'
      ? shortProjectName(discovery.projectId)
      : '-';
    var html = '';

    html += '<div class="pokedex-tooltip-head">';
    html += '<div class="pokedex-tooltip-head-main">';
    html += '<span class="pokedex-tooltip-number">#' + String(pokemonId).padStart(3, '0') + '</span>';
    html += '<div class="pokedex-tooltip-title-wrap">';
    html += '<div class="pokedex-tooltip-title">' + escapeHtml(name) + '</div>';
    html += '</div>';
    html += '</div>';
    if (rarity) {
      html += '<span class="pokedex-rarity-badge tier-' + rarity.tier + '">' + escapeHtml(rarity.label) + '</span>';
    }
    html += '</div>';

    html += '<div class="pokedex-tooltip-body">';
    html += '<div class="pokedex-tooltip-stat">';
    html += '<span class="pokedex-tooltip-stat-label">' + escapeHtml(labels.metCount) + '</span>';
    html += '<span class="pokedex-tooltip-stat-value">' + escapeHtml(encounterText) + '</span>';
    html += '</div>';

    html += '<div class="pokedex-tooltip-section">';
    html += '<div class="pokedex-tooltip-section-head">';
    html += '<span class="pokedex-tooltip-section-title">' + escapeHtml(labels.firstMeet) + '</span>';
    html += '<span class="pokedex-tooltip-section-subtitle">' + escapeHtml(labels.firstMeetHint) + '</span>';
    html += '</div>';

    if (discovery) {
      html += '<div class="pokedex-tooltip-first-card">';
      html += '<div class="pokedex-tooltip-project-row">';
      html += '<span class="pokedex-tooltip-project-label">' + escapeHtml(labels.project) + '</span>';
      html += '<span class="pokedex-tooltip-project-name">' + escapeHtml(projectName) + '</span>';
      html += '</div>';
      html += '<div class="pokedex-tooltip-timestamp-grid">';
      html += '<div class="pokedex-tooltip-timestamp-item">';
      html += '<span class="pokedex-tooltip-timestamp-label">' + escapeHtml(labels.date) + '</span>';
      html += '<span class="pokedex-tooltip-timestamp-value">' + escapeHtml(formatDateStamp(firstMetAt)) + '</span>';
      html += '</div>';
      html += '<div class="pokedex-tooltip-timestamp-item">';
      html += '<span class="pokedex-tooltip-timestamp-label">' + escapeHtml(labels.time) + '</span>';
      html += '<span class="pokedex-tooltip-timestamp-value">' + escapeHtml(formatClockTime(firstMetAt)) + '</span>';
      html += '</div>';
      html += '</div>';
      html += '</div>';
    } else {
      html += '<div class="pokedex-tooltip-empty">' + escapeHtml(labels.undiscovered) + '</div>';
    }

    html += '</div>';
    html += '</div>';

    pokedexTooltipEl.innerHTML = html;
    pokedexTooltipEl.style.display = 'block';

    var tw = pokedexTooltipEl.offsetWidth || 296;
    var left = anchorRect.left + anchorRect.width / 2 - tw / 2;
    left = Math.max(4, Math.min(left, window.innerWidth - tw - 4));
    var th = pokedexTooltipEl.offsetHeight;
    var top = anchorRect.top - th - 8;
    if (top < 4) top = anchorRect.bottom + 8;
    pokedexTooltipEl.style.left = left + 'px';
    pokedexTooltipEl.style.top = top + 'px';
  }

  function hidePokedexTooltip() {
    pokedexTooltipEl.style.display = 'none';
  }

  function showPokedexTooltip(pokemonId, anchorRect) {
    var discovery = pokedexDiscoveryInfo(pokemonId);
    var catchInfo = pokedexCatchInfo(pokemonId);
    var recentSighting = pokedexRecentSightingInfo(pokemonId);
    var rarity = getPokemonRarity(pokemonId);
    var labels = pokedexTooltipLabels();
    var name = pokemonDisplayName(pokemonId);
    var status = pokedexStatusForPokemon(pokemonId, null, pokedexCaughtSpeciesLookup());
    var statusLabel = pokedexStatusLabel(status);
    var encounterText = String(pokedexEncounterCount(pokemonId));
    var habitatName = pokedexHabitatLabel(pokemonId);
    var firstMetAt = discovery ? (discovery.discoveredAt || discovery.createdAt) : null;
    var projectName = discovery && discovery.projectId && discovery.projectId !== 'unknown-project'
      ? shortProjectName(discovery.projectId)
      : '-';
    var recentSeenAt = recentSighting ? recentSighting.ts : null;
    var firstCaughtAt = catchInfo ? catchInfo.caughtAt : null;
    var recentProjectName = recentSighting && recentSighting.projectId && recentSighting.projectId !== 'unknown-project'
      ? shortProjectName(recentSighting.projectId)
      : '-';
    var catchProjectName = catchInfo && catchInfo.projectId && catchInfo.projectId !== 'unknown-project'
      ? shortProjectName(catchInfo.projectId)
      : '-';
    var html = '';

    html += '<div class="pokedex-tooltip-head">';
    html += '<div class="pokedex-tooltip-head-main">';
    html += '<span class="pokedex-tooltip-number">#' + String(pokemonId).padStart(3, '0') + '</span>';
    html += '<div class="pokedex-tooltip-title-wrap">';
    html += '<div class="pokedex-tooltip-title">' + escapeHtml(name) + '</div>';
    html += '</div>';
    html += '</div>';
    if (rarity) {
      html += '<span class="pokedex-rarity-badge tier-' + rarity.tier + '">' + escapeHtml(rarity.label) + '</span>';
    }
    html += '</div>';

    html += '<div class="pokedex-tooltip-body">';
    html += '<div class="pokedex-tooltip-facts">';
    html += '<div class="pokedex-tooltip-fact">';
    html += '<span class="pokedex-tooltip-fact-label">' + escapeHtml(t('pokedexStatus')) + '</span>';
    html += '<span class="pokedex-tooltip-fact-value">' + escapeHtml(statusLabel) + '</span>';
    html += '</div>';
    html += '<div class="pokedex-tooltip-fact">';
    html += '<span class="pokedex-tooltip-fact-label">' + escapeHtml(labels.metCount) + '</span>';
    html += '<span class="pokedex-tooltip-fact-value">' + escapeHtml(encounterText) + '</span>';
    html += '</div>';
    html += '<div class="pokedex-tooltip-fact">';
    html += '<span class="pokedex-tooltip-fact-label">' + escapeHtml(labels.habitat) + '</span>';
    html += '<span class="pokedex-tooltip-fact-value">' + escapeHtml(habitatName) + '</span>';
    html += '</div>';
    html += '</div>';

    html += '<div class="pokedex-tooltip-section">';
    html += '<div class="pokedex-tooltip-section-head">';
    html += '<span class="pokedex-tooltip-section-title">' + escapeHtml(labels.firstMeet) + '</span>';
    html += '<span class="pokedex-tooltip-section-subtitle">' + escapeHtml(labels.firstMeetHint) + '</span>';
    html += '</div>';
    if (discovery) {
      html += '<div class="pokedex-tooltip-first-card">';
      html += '<div class="pokedex-tooltip-project-row">';
      html += '<span class="pokedex-tooltip-project-label">' + escapeHtml(labels.project) + '</span>';
      html += '<span class="pokedex-tooltip-project-name">' + escapeHtml(projectName) + '</span>';
      html += '</div>';
      html += '<div class="pokedex-tooltip-timestamp-grid">';
      html += '<div class="pokedex-tooltip-timestamp-item">';
      html += '<span class="pokedex-tooltip-timestamp-label">' + escapeHtml(labels.date) + '</span>';
      html += '<span class="pokedex-tooltip-timestamp-value">' + escapeHtml(formatDateStamp(firstMetAt)) + '</span>';
      html += '</div>';
      html += '<div class="pokedex-tooltip-timestamp-item">';
      html += '<span class="pokedex-tooltip-timestamp-label">' + escapeHtml(labels.time) + '</span>';
      html += '<span class="pokedex-tooltip-timestamp-value">' + escapeHtml(formatClockTime(firstMetAt)) + '</span>';
      html += '</div>';
      html += '</div>';
      html += '</div>';
    } else {
      html += '<div class="pokedex-tooltip-empty">' + escapeHtml(labels.undiscovered) + '</div>';
    }
    html += '</div>';

    html += '<div class="pokedex-tooltip-section">';
    html += '<div class="pokedex-tooltip-section-head">';
    html += '<span class="pokedex-tooltip-section-title">' + escapeHtml(labels.firstCatch || 'First catch') + '</span>';
    html += '<span class="pokedex-tooltip-section-subtitle">' + escapeHtml(labels.firstCatchHint || 'First captured moment') + '</span>';
    html += '</div>';
    if (catchInfo) {
      html += '<div class="pokedex-tooltip-first-card">';
      html += '<div class="pokedex-tooltip-project-row">';
      html += '<span class="pokedex-tooltip-project-label">' + escapeHtml(labels.project) + '</span>';
      html += '<span class="pokedex-tooltip-project-name">' + escapeHtml(catchProjectName) + '</span>';
      html += '</div>';
      html += '<div class="pokedex-tooltip-timestamp-grid">';
      html += '<div class="pokedex-tooltip-timestamp-item">';
      html += '<span class="pokedex-tooltip-timestamp-label">' + escapeHtml(labels.date) + '</span>';
      html += '<span class="pokedex-tooltip-timestamp-value">' + escapeHtml(formatDateStamp(firstCaughtAt)) + '</span>';
      html += '</div>';
      html += '<div class="pokedex-tooltip-timestamp-item">';
      html += '<span class="pokedex-tooltip-timestamp-label">' + escapeHtml(labels.time) + '</span>';
      html += '<span class="pokedex-tooltip-timestamp-value">' + escapeHtml(formatClockTime(firstCaughtAt)) + '</span>';
      html += '</div>';
      html += '</div>';
      html += '</div>';
    } else {
      html += '<div class="pokedex-tooltip-empty">' + escapeHtml(discovery ? t('seenNotCaught') : t('unseen')) + '</div>';
    }
    html += '</div>';

    html += '<div class="pokedex-tooltip-section">';
    html += '<div class="pokedex-tooltip-section-head">';
    html += '<span class="pokedex-tooltip-section-title">' + escapeHtml(labels.recentSeen) + '</span>';
    html += '<span class="pokedex-tooltip-section-subtitle">' + escapeHtml(labels.recentSeenHint) + '</span>';
    html += '</div>';
    if (recentSighting) {
      html += '<div class="pokedex-tooltip-first-card">';
      html += '<div class="pokedex-tooltip-project-row">';
      html += '<span class="pokedex-tooltip-project-label">' + escapeHtml(labels.project) + '</span>';
      html += '<span class="pokedex-tooltip-project-name">' + escapeHtml(recentProjectName) + '</span>';
      html += '</div>';
      html += '<div class="pokedex-tooltip-timestamp-grid">';
      html += '<div class="pokedex-tooltip-timestamp-item">';
      html += '<span class="pokedex-tooltip-timestamp-label">' + escapeHtml(labels.date) + '</span>';
      html += '<span class="pokedex-tooltip-timestamp-value">' + escapeHtml(formatDateStamp(recentSeenAt)) + '</span>';
      html += '</div>';
      html += '<div class="pokedex-tooltip-timestamp-item">';
      html += '<span class="pokedex-tooltip-timestamp-label">' + escapeHtml(labels.time) + '</span>';
      html += '<span class="pokedex-tooltip-timestamp-value">' + escapeHtml(formatClockTime(recentSeenAt)) + '</span>';
      html += '</div>';
      html += '</div>';
      html += '</div>';
    } else {
      html += '<div class="pokedex-tooltip-empty">' + escapeHtml(labels.undiscovered) + '</div>';
    }
    html += '</div>';
    html += '</div>';

    pokedexTooltipEl.innerHTML = html;
    pokedexTooltipEl.style.display = 'block';

    var tw = pokedexTooltipEl.offsetWidth || 296;
    var left = anchorRect.left + anchorRect.width / 2 - tw / 2;
    left = Math.max(4, Math.min(left, window.innerWidth - tw - 4));
    var th = pokedexTooltipEl.offsetHeight;
    var top = anchorRect.top - th - 8;
    if (top < 4) top = anchorRect.bottom + 8;
    pokedexTooltipEl.style.left = left + 'px';
    pokedexTooltipEl.style.top = top + 'px';
  }

  function showSubhistoryTooltip(agent, anchorRect) {
    if (!agent) return;
    var label = agent.displayName || agent.subagentType || toShortId(agent.agentId);
    var lastCommand = commandText(agent.lastCommand);
    var endTs = agent.isLive ? (agent.lastSeen || Date.now()) : agent.doneAt;
    var duration = formatDuration(agent.createdAt, endTs);
    var html = '';
    html += '<div class="subhistory-tooltip-head">';
    html += '<div class="subhistory-tooltip-title">' + escapeHtml(label) + '</div>';
    html += '<div class="subhistory-tooltip-subtitle">' + escapeHtml(agent.subagentType || t('subagentLabel')) + (agent.isLive ? ' • ' + escapeHtml(t('live')) : ' • ' + escapeHtml(t('finished'))) + '</div>';
    html += '</div>';
    html += '<div class="subhistory-tooltip-details">';
    html += '<div class="subhistory-tooltip-item"><span class="subhistory-tooltip-label">' + escapeHtml(t('tokens')) + '</span><span class="subhistory-tooltip-value">' + formatTokenCount(agent.totalTokens || 0) + '</span></div>';
    html += '<div class="subhistory-tooltip-item"><span class="subhistory-tooltip-label">' + escapeHtml(t('tools')) + '</span><span class="subhistory-tooltip-value">' + (agent.counters.toolStarts || 0) + '</span></div>';
    html += '<div class="subhistory-tooltip-item"><span class="subhistory-tooltip-label">' + escapeHtml(t('started')) + '</span><span class="subhistory-tooltip-value">' + escapeHtml(formatTime(agent.createdAt)) + '</span></div>';
    html += '<div class="subhistory-tooltip-item"><span class="subhistory-tooltip-label">' + escapeHtml(agent.isLive ? t('lastSeen') : t('ended')) + '</span><span class="subhistory-tooltip-value">' + escapeHtml(formatTime(endTs)) + '</span></div>';
    html += '<div class="subhistory-tooltip-item"><span class="subhistory-tooltip-label">' + escapeHtml(t('duration')) + '</span><span class="subhistory-tooltip-value">' + escapeHtml(duration) + '</span></div>';
    html += '<div class="subhistory-tooltip-item"><span class="subhistory-tooltip-label">' + escapeHtml(t('project')) + '</span><span class="subhistory-tooltip-value">' + escapeHtml(agent.projectId || '-') + '</span></div>';
    html += '<div class="subhistory-tooltip-item"><span class="subhistory-tooltip-label">' + escapeHtml(t('session')) + '</span><span class="subhistory-tooltip-value">' + escapeHtml(agent.sessionId || '-') + '</span></div>';
    html += '</div>';
    if (lastCommand) {
      html += '<div class="subhistory-tooltip-command" title="' + escapeHtml(lastCommand) + '"><span class="subhistory-tooltip-command-label">' + escapeHtml(t('lastCommand')) + '</span><span class="subhistory-tooltip-command-value">' + escapeHtml(lastCommand) + '</span></div>';
    }
    if (agent.lastUserQuery) {
      html += '<div class="subhistory-tooltip-query">' + escapeHtml(agent.lastUserQuery) + '</div>';
    }

    subhistoryTooltipEl.innerHTML = html;
    subhistoryTooltipEl.style.display = 'block';
    var tw = 280;
    var left = anchorRect.left + anchorRect.width / 2 - tw / 2;
    left = Math.max(8, Math.min(left, window.innerWidth - tw - 8));
    var th = subhistoryTooltipEl.offsetHeight;
    var top = anchorRect.top - th - 10;
    if (top < 8) top = anchorRect.bottom + 10;
    subhistoryTooltipEl.style.left = left + 'px';
    subhistoryTooltipEl.style.top = top + 'px';
  }

  function hideSubhistoryTooltip() {
    subhistoryTooltipEl.style.display = 'none';
  }

  function renderBoxItems(boxed, options) {
    var compact = !!(options && options.compact);
    var withDetails = !!(options && options.withDetails);
    var emptyMessage = (options && options.emptyMessage) || '';
    var html = '';
    for (var i = boxed.length - 1; i >= 0; i--) {
      var agent = boxed[i];
      var spriteUrl = pokemonStaticIconUrl(agent);
      var label = agent.displayName || agent.subagentType || shortProjectName(agent.projectId);
      var duration = formatDuration(agent.createdAt, agent.doneAt);
      var lastCommand = commandText(agent.lastCommand);
      var adopted = ownedPokemonForEncounter(agent);

      var manualClass = agent.manuallyBoxed ? ' manually-boxed' : '';
      html += '<div class="box-item' + (compact ? ' compact' : ' detailed') + manualClass + '" data-box-index="' + i + '" data-agent-id="' + escapeHtml(agent.agentId) + '">';
      html += '<img class="box-sprite" src="' + escapeHtml(spriteUrl) + '" />';
      if (!compact) {
        var subhistoryCount = subhistoryFamilyCount(agent.agentId);
        html += '<div class="box-item-info">';
        html += '<div class="box-item-row">';
        html += '<div class="box-item-title">';
        html += '<div class="box-item-name-row">';
        html += '<span class="box-item-name" title="' + escapeHtml(agentLabel(agent)) + '">' + escapeHtml(label) + '</span>';
        if (agent.manuallyBoxed) {
          html += '<span class="box-item-manual-badge" title="' + escapeHtml(t('manuallyArchived')) + '">HOLD</span>';
        }
        if (adopted) {
          html += '<span class="box-item-manual-badge adopted" title="' + escapeHtml(t('alreadyAdopted')) + '">ADOPTED</span>';
        }
        html += '</div>';
        html += '</div>';
        html += '</div>';
        html += renderHistoryStats(agent, 'box-item-stats');
        html += '<div class="box-item-meta">' + escapeHtml(agent.sessionId || '-') + '</div>';
        html += '<div class="box-item-meta">' + escapeHtml(t('endedAt', { time: formatTime(agent.doneAt) })) + '</div>';
        html += '<div class="box-item-meta">' + escapeHtml(t('durationValue', { duration: duration })) + '</div>';
        if (lastCommand) {
          html += '<div class="box-item-command" title="' + escapeHtml(lastCommand) + '"><span class="box-item-command-label">CMD</span><span class="box-item-command-value">' + escapeHtml(summarizeCommand(lastCommand, 56)) + '</span></div>';
        }
        if (withDetails) {
          html += '<div class="box-item-actions">';
          if (subhistoryCount > 0) {
            html += '<button class="box-detail-btn" data-action="open-subhistory" data-agent-id="' + escapeHtml(agent.agentId) + '">';
            html += escapeHtml(t('subHistoryCount', { count: subhistoryCount }));
            html += '</button>';
          } else {
            html += '<span class="box-item-action-spacer" aria-hidden="true"></span>';
          }
          if (!adopted) {
            html += renderAdoptAgentButton(agent);
          }
          html += '</div>';
        }
        html += '</div>';
      }
      html += '<button class="unbox-btn" data-action="unbox" data-agent-id="' + escapeHtml(agent.agentId) + '" title="' + escapeHtml(t('restore')) + '">&#x2191;</button>';
      html += '</div>';
    }

    if (!html && emptyMessage) {
      html = '<div class="box-empty">' + escapeHtml(emptyMessage) + '</div>';
    }
    return html;
  }

  function renderBoxList() {
    var boxed = appState.snapshot.boxedAgents || [];
    boxCountEl.textContent = String(boxed.length);
    boxListEl.innerHTML = renderBoxItems(boxed.slice(-60), {
      compact: true,
      emptyMessage: t('noSafariRecords')
    });
  }

  function setBoxHistoryOpen(isOpen) {
    uiState.boxHistoryOpen = !!isOpen;
    boxHistoryModalEl.hidden = !uiState.boxHistoryOpen;
    if (uiState.boxHistoryOpen) {
      renderBoxHistory();
    } else {
      boxHistorySummaryEl.textContent = '';
      boxHistoryGridEl.innerHTML = '';
    }
    if (!uiState.boxHistoryOpen) {
      hideBoxTooltip();
    }
  }

  function renderBoxHistory() {
    if (!uiState.boxHistoryOpen) return;
    var boxed = appState.snapshot.boxedAgents || [];
    boxHistorySummaryEl.textContent = t('safariRecords', { count: boxed.length });
    boxHistoryGridEl.innerHTML = renderBoxItems(boxed, {
      compact: false,
      withDetails: true,
      emptyMessage: t('noSafariRecords')
    });
  }

  function ownedDisplayName(pokemon) {
    if (!pokemon) return t('pokemon');
    return pokemon.nickname || pokemonDisplayName(pokemon.speciesId);
  }

  function evolutionItemState() {
    var fallback = {
      pool: [],
      recruitTickets: [],
      inventory: {},
      itemPoints: 0,
      targetTickets: 0,
      rewardTokenRemainder: 0,
      pickupItemId: null,
      tokenPerItemPoint: 10000,
      randomPullPointCost: 250,
      pullSuccessRate: 0.3,
      pullFailurePointRefund: 0,
      pullSuccessRewardPool: [
        { type: 'item', weight: 80 },
        { type: 'ticket', minTier: 1, weight: 10 },
        { type: 'ticket', minTier: 2, weight: 6 },
        { type: 'ticket', minTier: 3, weight: 3 },
        { type: 'ticket', minTier: 4, weight: 1 }
      ],
      itemBuyPointCost: null,
      itemBuyPickupPointCost: 20,
      itemClaimTicketCost: 20,
      itemSellPointValue: 10
    };
    return (appState.snapshot && appState.snapshot.evolutionItems) || fallback;
  }

  function evolutionItemById(itemId) {
    var itemState = evolutionItemState();
    var items = (itemState.pool || []).concat(itemState.recruitTickets || []);
    for (var i = 0; i < items.length; i++) {
      if (items[i].id === itemId) return items[i];
    }
    return null;
  }

  function inventoryCatalogItems(itemState) {
    itemState = itemState || evolutionItemState();
    return (itemState.pool || []).concat(itemState.recruitTickets || []);
  }

  function evolutionInventoryItems(itemState) {
    itemState = itemState || evolutionItemState();
    return itemState.pool || [];
  }

  function recruitTicketInventoryItems(itemState) {
    itemState = itemState || evolutionItemState();
    return itemState.recruitTickets || [];
  }

  function isRecruitTicketItem(itemOrId) {
    var item = typeof itemOrId === 'string' ? evolutionItemById(itemOrId) : itemOrId;
    return !!(item && typeof item.id === 'string' && item.id.indexOf('recruit-ticket-') === 0);
  }

  function recruitTicketLabel(itemOrId) {
    var item = typeof itemOrId === 'string' ? evolutionItemById(itemOrId) : itemOrId;
    return (item && String(item.label || item.nameEn || item.nameKo || '').replace(/\s*(Recruit Ticket|영입 티켓)$/i, '')) || 'Common+';
  }

  function recruitTicketItemIdForReward(ticketReward) {
    var minTier = Math.max(1, Math.min(5, Math.floor(Number(ticketReward && ticketReward.minTier) || 1)));
    var fallbackItemId = RECRUIT_TICKET_ITEM_IDS_BY_MIN_TIER[minTier] || RECRUIT_TICKET_ITEM_IDS_BY_MIN_TIER[1];
    var tickets = evolutionItemState().recruitTickets || [];
    for (var i = 0; i < tickets.length; i++) {
      if (Number(tickets[i].minTier) === minTier) return tickets[i].id;
    }
    return fallbackItemId;
  }

  function fallbackEvolutionItemName(itemId) {
    return String(itemId || '')
      .split('-')
      .filter(Boolean)
      .map(function (part) { return part.charAt(0).toUpperCase() + part.slice(1); })
      .join(' ');
  }

  function evolutionItemDisplayName(itemOrId) {
    var item = typeof itemOrId === 'string' ? evolutionItemById(itemOrId) : itemOrId;
    if (!item) return fallbackEvolutionItemName(itemOrId);
    if (isRecruitTicketItem(item)) {
      return recruitTicketLabel(item);
    }
    if (uiState.pokedexLanguage === 'ko') {
      return item.nameKo || item.nameEn || fallbackEvolutionItemName(item.id);
    }
    return item.nameEn || fallbackEvolutionItemName(item.id);
  }

  function evolutionItemLabel(itemId) {
    return evolutionItemDisplayName(itemId);
  }

  function ownedPokemonByOwnedId(id) {
    var owned = appState.snapshot.ownedPokemon || [];
    for (var i = 0; i < owned.length; i++) {
      if (owned[i].id === id) return owned[i];
    }
    return null;
  }

  function firstTicketResult(result) {
    var ticketResults = Array.isArray(result && result.ticketResults) ? result.ticketResults : [];
    for (var i = 0; i < ticketResults.length; i++) {
      var pokemon = ticketResults[i] && ticketResults[i].pokemon;
      if (pokemon && validPokemonId(pokemon.speciesId)) {
        return ticketResults[i];
      }
    }
    return null;
  }

  function firstTicketResultPokemon(result) {
    var ticketResult = firstTicketResult(result);
    return ticketResult ? ticketResult.pokemon : null;
  }

  function catchRewardPoints(result) {
    var catchRewards = result && result.catchRewards;
    if (!catchRewards || !catchRewards.isNewCatch) return 0;
    var total = Number(catchRewards.totalPointReward) || 0;
    return total > 0 ? total : 0;
  }

  function catchRewardRowsHtml(result) {
    var catchRewards = result && result.catchRewards;
    if (!catchRewards || !catchRewards.isNewCatch) return '';
    var rewards = Array.isArray(catchRewards.rewards) ? catchRewards.rewards : [];
    var html = '';
    var renderedPointTotal = 0;
    for (var i = 0; i < rewards.length; i++) {
      var reward = rewards[i] || {};
      var pointReward = Math.max(0, Number(reward.pointReward) || 0);
      if (reward.itemId) {
        var itemName = reward.itemName || evolutionItemLabel(reward.itemId);
        var count = Math.max(1, Number(reward.count) || 1);
        html += '<div class="action-result-row item">';
        html += '<span class="action-result-row-icon item"><img src="' + escapeHtml(itemSpriteUrl(reward.itemId)) + '" alt="" loading="lazy" /></span>';
        html += '<span>' + escapeHtml(itemName + (count > 1 ? ' x' + count : '')) + '</span>';
        html += '</div>';
      } else if (pointReward > 0) {
        renderedPointTotal += pointReward;
        html += '<div class="action-result-row points">';
        html += '<span class="action-result-row-icon points" aria-hidden="true">PT</span>';
        html += '<span>' + escapeHtml(t('pointsEarned', { points: formatTokenCount(pointReward) })) + '</span>';
        html += '</div>';
      }
    }
    var total = catchRewardPoints(result);
    if (total > renderedPointTotal) {
      html += '<div class="action-result-row points">';
      html += '<span class="action-result-row-icon points" aria-hidden="true">PT</span>';
      html += '<span>' + escapeHtml(t('pointsEarned', { points: formatTokenCount(total - renderedPointTotal) })) + '</span>';
      html += '</div>';
    }
    return html;
  }

  function actionResultRowsHtml(primary) {
    var options = arguments.length > 1 && arguments[1] ? arguments[1] : {};
    if (!primary || !primary.text) return '';
    var html = '<div class="action-result-rows">';
    var iconClass = primary.iconClass || 'pokemon';
    html += '<div class="action-result-row ' + escapeHtml(primary.tone || 'primary') + '">';
    html += '<span class="action-result-row-icon ' + escapeHtml(iconClass) + '">';
    if (primary.iconUrl) {
      html += '<img src="' + escapeHtml(primary.iconUrl) + '" alt="" loading="lazy" />';
    } else {
      html += escapeHtml(primary.iconText || '');
    }
    html += '</span>';
    html += '<span>' + escapeHtml(primary.text) + '</span>';
    html += '</div>';
    if (options.catchRewardSource) html += catchRewardRowsHtml(options.catchRewardSource);
    html += '</div>';
    return html;
  }

  function ticketUseResultRowsHtml(pokemon, pokemonName, ticketResult) {
    if (!pokemon || !validPokemonId(pokemon.speciesId)) return '';
    return actionResultRowsHtml({
      text: ticketRecruitedPokemonText(pokemonName),
      iconUrl: spriteUrl('icon', pokemon.speciesId, 'png'),
      iconClass: 'pokemon',
      tone: 'recruited'
    }, {
      catchRewardSource: ticketResult
    });
  }

  function showDrawActionResult(result) {
    if (!result || !result.ok) {
      showActionPopup(t('drawResult'), t('drawResult'), actionErrorMessage(result), actionErrorMessage(result));
      return;
    }
    if (result.pending) {
      showActionPopup(t('drawResult'), t('drawResult'), t('drawRequestSent'), t('drawRequestSent'));
      return;
    }
    if (!result.success) {
      showActionPopup(
        t('drawResult'),
        t('drawResult'),
        t('noItemThisTime'),
        t('noItemThisTime')
      );
      return;
    }
    if (result.rewardType === 'ticket' || result.ticketReward) {
      var ticketName = result.ticketReward && result.ticketReward.label ? result.ticketReward.label : 'Common+';
      var ticketItemId = result.itemId || recruitTicketItemIdForReward(result.ticketReward);
      var ticketItemName = evolutionItemLabel(ticketItemId);
      showActionPopup(
        t('drawResult'),
        t('drawResult'),
        t('youDrewTicket', { ticket: ticketName }),
        t('youDrewTicket', { ticket: ticketName }),
        { visual: { type: 'item', itemId: ticketItemId, name: ticketItemName, label: t('drawResult') } }
      );
      return;
    }
    if (result.success) {
      var itemName = evolutionItemLabel(result.itemId);
      showActionPopup(
        t('drawResult'),
        t('drawResult'),
        t('youDrewItem', { item: itemName }),
        t('youDrewItem', { item: itemName }),
        { visual: { type: 'item', itemId: result.itemId, name: itemName, label: t('drawResult') } }
      );
      return;
      showActionPopup(t('drawResult'), t('drawResult'), t('youDrewItem', { item: itemName }), t('youDrewItem', { item: itemName }));
    } else {
      showActionPopup(t('drawResult'), t('drawResult'), t('noItemThisTime'), t('noItemThisTime'));
    }
  }

  function showItemActionResult(action, result, itemId) {
    var itemName = evolutionItemLabel((result && result.itemId) || itemId);
    if (!result || !result.ok) {
      showActionPopup(t('itemResult'), t('itemResult'), actionErrorMessage(result), actionErrorMessage(result));
      return;
    }
    if (result.pending) {
      showActionPopup(t('itemResult'), t('itemResult'), t('requestSent'), t('requestSent'));
      return;
    }
    if (action === 'buy') {
      showActionPopup(
        t('buyResult'),
        t('buyResult'),
        t('boughtItem', { item: itemName }),
        t('boughtItem', { item: itemName }),
        { visual: { type: 'item', itemId: (result && result.itemId) || itemId, name: itemName, label: t('buyResult') } }
      );
      return;
      showActionPopup(t('buyResult'), t('buyResult'), t('boughtItem', { item: itemName }), t('boughtItem', { item: itemName }));
    } else if (action === 'claim') {
      showActionPopup(
        t('claimResult'),
        t('claimResult'),
        t('claimedItem', { item: itemName }),
        t('claimedItem', { item: itemName }),
        { visual: { type: 'item', itemId: (result && result.itemId) || itemId, name: itemName, label: t('claimTarget') } }
      );
      return;
      showActionPopup(t('claimResult'), t('claimResult'), t('claimedItem', { item: itemName }), t('claimedItem', { item: itemName }));
    } else if (action === 'sell') {
      var sellValue = (result && result.evolutionItems && result.evolutionItems.itemSellPointValue) ||
        evolutionItemState().itemSellPointValue || 10;
      showActionPopup(
        t('sellResult'),
        t('sellResult'),
        t('soldItem', { item: itemName, value: sellValue }),
        t('soldItem', { item: itemName, value: sellValue }),
        { visual: { type: 'item', itemId: (result && result.itemId) || itemId, name: itemName, label: t('sell'), detail: '+' + sellValue + ' pts' } }
      );
      return;
      showActionPopup(t('sellResult'), t('sellResult'), t('soldItem', { item: itemName, value: sellValue }), t('soldItem', { item: itemName, value: sellValue }));
    }
  }

  function showTicketUseActionResult(result, itemId) {
    var ticketName = evolutionItemLabel((result && result.itemId) || itemId);
    if (!result || !result.ok) {
      showActionPopup(t('recruitResult'), t('recruitResult'), actionErrorMessage(result), actionErrorMessage(result), { isError: true });
      return;
    }
    if (result.pending) {
      showActionPopup(t('recruitResult'), t('recruitResult'), t('requestSent'), t('requestSent'));
      return;
    }
    var ticketResult = firstTicketResult(result);
    var pokemon = ticketResult && ticketResult.pokemon ? ticketResult.pokemon : null;
    var pokemonName = pokemon ? pokemonDisplayName(pokemon.speciesId) : t('pokemon');
    var message = pokemon
      ? ticketRecruitedPokemonText(pokemonName)
      : t('usedTicket', { ticket: ticketName, pokemon: pokemonName });
    showActionPopup(
      t('recruitResult'),
      t('recruitResult'),
      message,
      message,
      {
        visual: pokemon ? {
          type: 'ticket-result',
          pokemonId: pokemon.speciesId,
          name: pokemonName,
          itemId: (result && result.itemId) || itemId,
          ticketName: ticketName
        } : null,
        messageHtml: ticketUseResultRowsHtml(pokemon, pokemonName, ticketResult)
      }
    );
  }

  function showEvolutionActionResult(result, beforePokemon, targetSpeciesId, consumedItemId) {
    var beforeName = ownedDisplayName(beforePokemon);
    var afterSpeciesId = result && result.pokemon && result.pokemon.speciesId
      ? result.pokemon.speciesId
      : targetSpeciesId;
    var afterName = afterSpeciesId ? pokemonDisplayName(afterSpeciesId) : '';
    if (!result || !result.ok) {
      showActionPopup(t('evolutionResult'), t('evolutionResult'), actionErrorMessage(result), actionErrorMessage(result));
      return;
    }
    if (result.pending) {
      showActionPopup(t('evolutionResult'), t('evolutionResult'), t('evolutionRequestSent'), t('evolutionRequestSent'));
      return;
    }
    var evolutionMessage = evolvedPokemonText(beforeName, afterName);
    showActionPopup(
      t('evolutionResult'),
      t('evolutionResult'),
      evolutionMessage,
      evolutionMessage,
      {
        visual: {
          type: 'evolution',
          beforeSpeciesId: beforePokemon && beforePokemon.speciesId,
          beforeName: beforeName,
          afterSpeciesId: afterSpeciesId,
          afterName: afterName,
          itemId: consumedItemId || (result && result.itemId) || null
        },
        messageHtml: actionResultRowsHtml({
          text: evolutionMessage,
          iconUrl: afterSpeciesId ? spriteUrl('icon', afterSpeciesId, 'png') : '',
          iconClass: 'pokemon',
          tone: 'evolved'
        }, {
          catchRewardSource: result
        })
      }
    );
    return;
    showActionPopup(
      t('evolutionResult'),
      t('evolutionResult'),
      afterName ? t('evolvedInto', { from: beforeName, to: afterName }) : t('evolved', { from: beforeName }),
      afterName ? t('evolvedInto', { from: beforeName, to: afterName }) : t('evolved', { from: beforeName })
    );
  }

  function selectedEvolutionOption(evolution, targetSpeciesId) {
    if (!evolution) return null;
    if (Array.isArray(evolution.options) && evolution.options.length > 0) {
      if (targetSpeciesId) {
        for (var i = 0; i < evolution.options.length; i++) {
          if (evolution.options[i].nextSpeciesId === targetSpeciesId) return evolution.options[i];
        }
      }
      for (var j = 0; j < evolution.options.length; j++) {
        if (evolution.options[j].canEvolve) return evolution.options[j];
      }
      return evolution.options[0];
    }
    return evolution;
  }

  function evolutionOptionLabel(option) {
    if (!option) return '';
    var target = '#' + String(option.nextSpeciesId).padStart(3, '0') + ' ' + pokemonDisplayName(option.nextSpeciesId);
    if (option.method === 'item') {
      return target + ' - ' + evolutionItemLabel(option.itemId);
    }
    return target + ' - Lv.' + option.requiredLevel;
  }

  function evolutionStatusText(evolution) {
    if (!evolution) return '';
    if (evolution.candidateCount > 1) {
      if (evolution.canEvolve) return t('pathsReady', { count: evolution.candidateCount });
      return t('evolutionPaths', { count: evolution.candidateCount });
    }
    if (evolution.method === 'item') {
      return evolution.canEvolve ? t('canEvolve') : t('needsItem', { item: evolutionItemLabel(evolution.itemId) });
    }
    return evolution.canEvolve ? t('canEvolve') : t('evolvesAtLevel', { level: evolution.requiredLevel });
  }

  function renderEvolutionTargetSelect(pokemon, evolution) {
    if (!evolution || !Array.isArray(evolution.options) || evolution.options.length <= 1) {
      return '';
    }
    var selected = evolution.options.find(function (option) { return option.canEvolve; }) || evolution.options[0];
    var html = '<select class="owned-evolution-select" data-owned-field="evolution-target" data-owned-id="' + escapeHtml(pokemon.id) + '">';
    for (var i = 0; i < evolution.options.length; i++) {
      var option = evolution.options[i];
      html += '<option value="' + option.nextSpeciesId + '"' + (option.nextSpeciesId === selected.nextSpeciesId ? ' selected' : '') + (option.canEvolve ? '' : ' disabled') + '>';
      html += escapeHtml(evolutionOptionLabel(option));
      html += '</option>';
    }
    html += '</select>';
    return html;
  }

  function ownedLevelDetails(pokemon) {
    var level = Math.max(1, Math.min(100, Number(pokemon && pokemon.level) || 1));
    var needed = pokemon && typeof pokemon.expToNextLevel === 'number'
      ? pokemon.expToNextLevel
      : (level >= 100 ? 0 : ownedExpToNextLevel(level, pokemon && pokemon.growthRate));
    var exp = level >= 100 ? needed : Math.max(0, Number(pokemon && pokemon.exp) || 0);
    var progress = level >= 100 ? 100 : Math.max(0, Math.min(100, needed > 0 ? (exp / needed) * 100 : 0));
    return {
      level: level,
      exp: exp,
      needed: needed,
      progress: progress
    };
  }

  function renderOwnedProjectSelect(pokemon) {
    var selected = pokemon.assignedProjectId || '';
    var projects = ownedProjectOptions(selected);
    var html = '<select class="owned-project-select" data-owned-field="project" data-owned-id="' + escapeHtml(pokemon.id) + '">';
    html += '<option value="">' + escapeHtml(t('noProject')) + '</option>';
    for (var i = 0; i < projects.length; i++) {
      html += '<option value="' + escapeHtml(projects[i]) + '"' + (projects[i] === selected ? ' selected' : '') + '>';
      html += escapeHtml(shortProjectName(projects[i]));
      html += '</option>';
    }
    html += '</select>';
    return html;
  }

  function renderOwnedTrainingLabel(pokemon) {
    return pokemon && pokemon.assignedProjectId ? shortProjectName(pokemon.assignedProjectId) : t('noProject');
  }

  function renderOwnedExpRow(stats, extraClass) {
    var rowClass = 'owned-exp-row' + (extraClass ? ' ' + extraClass : '');
    return [
      '<div class="' + rowClass + '">',
      '<div class="owned-exp-meter">',
      '<span class="poke-exp-label">EXP</span>',
      '<div class="poke-exp-track"><div class="poke-exp-fill" style="width:' + stats.progress.toFixed(1) + '%"></div></div>',
      '</div>',
      '<span class="poke-exp-nums">' + formatTokenCount(stats.exp) + ' / ' + formatTokenCount(stats.needed) + '</span>',
      '</div>'
    ].join('');
  }

  function renderOwnedInfoDetails(pokemon, options) {
    options = options || {};
    var stats = ownedLevelDetails(pokemon);
    var speciesName = pokemonDisplayName(pokemon.speciesId);
    var evolution = ownedEvolutionInfo(pokemon);
    var isParty = Number.isInteger(pokemon.partySlot);
    var html = '';
    html += '<div class="owned-card-body">';
    html += '<div class="owned-card-top">';
    html += '<div class="owned-card-title">';
    html += '<span class="owned-card-name">' + escapeHtml(ownedDisplayName(pokemon)) + '</span>';
    html += '<span class="owned-card-species">#' + String(pokemon.speciesId).padStart(3, '0') + ' ' + escapeHtml(speciesName) + '</span>';
    html += '</div>';
    html += '<span class="owned-card-level">Lv.' + stats.level + '</span>';
    html += '</div>';
    html += renderOwnedExpRow(stats);
    html += '<div class="owned-card-meta">';
    html += '<span>' + escapeHtml(isParty ? t('party') : t('boxed')) + '</span>';
    if (pokemon.sourceProjectId) {
      html += '<span>' + escapeHtml(t('fromProject', { project: shortProjectName(pokemon.sourceProjectId) })) + '</span>';
    }
    if (evolution) {
      html += '<span>' + escapeHtml(evolutionStatusText(evolution)) + '</span>';
    }
    html += '</div>';
    html += '<div class="owned-project-row">';
    html += '<span>' + escapeHtml(t('training')) + '</span>' + renderOwnedProjectSelect(pokemon);
    html += '</div>';
    if (options.actions !== false) {
      html += '<div class="owned-card-actions">';
      html += '<button type="button" data-owned-action="nickname" data-owned-id="' + escapeHtml(pokemon.id) + '">' + escapeHtml(t('name')) + '</button>';
      if (isParty) {
        html += '<button type="button" data-owned-action="box" data-owned-id="' + escapeHtml(pokemon.id) + '">' + escapeHtml(t('box')) + '</button>';
      } else {
        html += '<button type="button" data-owned-action="party" data-owned-id="' + escapeHtml(pokemon.id) + '">' + escapeHtml(t('party')) + '</button>';
        if (options.release !== false) {
          html += '<button type="button" class="owned-release-btn" data-owned-action="release" data-owned-id="' + escapeHtml(pokemon.id) + '">' + escapeHtml(t('release')) + '</button>';
        }
      }
      if (evolution) {
        html += '<button type="button" data-owned-action="holdEvolution" data-owned-id="' + escapeHtml(pokemon.id) + '" data-held="' + (pokemon.evolutionHeld ? 'false' : 'true') + '">';
        html += escapeHtml(pokemon.evolutionHeld ? t('allowEvo') : t('holdEvo'));
        html += '</button>';
        html += renderEvolutionTargetSelect(pokemon, evolution);
        html += '<button type="button" data-owned-action="evolve" data-owned-id="' + escapeHtml(pokemon.id) + '"' + (evolution.canEvolve ? '' : ' disabled') + '>';
        html += escapeHtml(t('evolve'));
        html += '</button>';
      }
      html += '</div>';
    }
    html += '</div>';
    return html;
  }

  function renderOwnedPokemonCard(pokemon, location) {
    var sprite = spriteUrl('animated', pokemon.speciesId, 'gif');
    var html = '';
    html += '<article class="owned-card" data-owned-id="' + escapeHtml(pokemon.id) + '">';
    html += '<div class="owned-card-main">';
    html += '<img class="owned-card-sprite" src="' + escapeHtml(sprite) + '" alt="" loading="lazy" />';
    html += renderOwnedInfoDetails(pokemon, { release: location === 'box' });
    html += '</div>';
    html += '</article>';
    return html;
  }

  function renderOwnedPartyCard(pokemon, index) {
    var stats = ownedLevelDetails(pokemon);
    var displayName = ownedDisplayName(pokemon);
    var speciesName = pokemonDisplayName(pokemon.speciesId);
    var evolution = ownedEvolutionInfo(pokemon);
    var html = '';
    html += '<article class="owned-party-card" draggable="true" data-owned-id="' + escapeHtml(pokemon.id) + '" data-owned-drop-slot="' + index + '">';
    html += '<img class="owned-party-sprite" src="' + escapeHtml(spriteUrl('animated', pokemon.speciesId, 'gif')) + '" alt="" loading="lazy" />';
    html += '<div class="owned-party-body">';
    html += '<div class="owned-party-top">';
    html += '<div class="owned-party-title">';
    html += '<span class="owned-party-name" title="' + escapeHtml(displayName + ' - ' + speciesName) + '">' + escapeHtml(displayName) + '</span>';
    html += '<span class="owned-party-species">#' + String(pokemon.speciesId).padStart(3, '0') + ' ' + escapeHtml(speciesName) + '</span>';
    html += '</div>';
    html += '<span class="owned-party-level">Lv.' + stats.level + '</span>';
    html += '</div>';
    html += renderOwnedExpRow(stats, 'owned-party-exp-row');
    html += '<div class="owned-party-meta">';
    html += '<span>' + escapeHtml(t('training')) + ': ' + escapeHtml(renderOwnedTrainingLabel(pokemon)) + '</span>';
    if (evolution) {
      html += '<span>' + escapeHtml(evolutionStatusText(evolution)) + '</span>';
    }
    html += '</div>';
    html += '<div class="owned-project-row owned-party-project-row">';
    html += '<span>' + escapeHtml(t('project')) + '</span>' + renderOwnedProjectSelect(pokemon);
    html += '</div>';
    if (evolution) {
      html += '<div class="owned-party-actions">';
      html += renderEvolutionTargetSelect(pokemon, evolution);
      html += '<button class="owned-party-evolve-btn" type="button" data-owned-action="evolve" data-owned-id="' + escapeHtml(pokemon.id) + '"' + (evolution.canEvolve ? '' : ' disabled') + '>';
      html += escapeHtml(t('evolve'));
      html += '</button>';
      html += '</div>';
    }
    html += '</div>';
    html += '<button class="owned-party-box-btn" type="button" data-owned-action="box" data-owned-id="' + escapeHtml(pokemon.id) + '">' + escapeHtml(t('box')) + '</button>';
    html += '</article>';
    return html;
  }

  function renderOwnedBoxTile(pokemon) {
    var stats = ownedLevelDetails(pokemon);
    var title = ownedDisplayName(pokemon) + ' - Lv.' + stats.level + ' ' + pokemonDisplayName(pokemon.speciesId);
    var html = '';
    html += '<article class="owned-box-tile" tabindex="0" data-owned-id="' + escapeHtml(pokemon.id) + '" title="' + escapeHtml(title) + '">';
    html += '<div class="owned-box-tile-face">';
    html += '<img class="owned-box-icon" src="' + escapeHtml(spriteUrl('icon', pokemon.speciesId, 'png')) + '" alt="" loading="lazy" />';
    html += '<span class="owned-box-level">Lv.' + stats.level + '</span>';
    html += '</div>';
    html += '<div class="owned-box-popover">';
    html += '<div class="owned-card-main">';
    html += '<img class="owned-card-sprite" src="' + escapeHtml(spriteUrl('animated', pokemon.speciesId, 'gif')) + '" alt="" loading="lazy" />';
    html += renderOwnedInfoDetails(pokemon, { release: true });
    html += '</div>';
    html += '</div>';
    html += '</article>';
    return html;
  }

  function setOwnedOpen(isOpen) {
    uiState.ownedOpen = !!isOpen;
    ownedModalEl.hidden = !uiState.ownedOpen;
    if (!uiState.ownedOpen) {
      setOwnedItemInfoOpen(false);
      setOwnedRecruitOpen(false);
    }
    if (uiState.ownedOpen) {
      renderOwnedPokemon();
    }
  }

  function setOwnedItemInfoOpen(isOpen) {
    if (!ownedItemInfoEl || !ownedItemInfoPopoverEl) return;
    ownedItemInfoPopoverEl.hidden = !isOpen;
    ownedItemInfoEl.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    if (!isOpen) setOwnedItemChanceOpen(false);
  }

  function setOwnedItemChanceOpen(isOpen) {
    uiState.ownedItemChanceOpen = !!isOpen;
    if (!ownedItemInfoPopoverEl) return;
    var chancePopover = ownedItemInfoPopoverEl.querySelector('[data-item-rules-chances]');
    var chanceToggle = ownedItemInfoPopoverEl.querySelector('[data-item-rules-action="toggle-chances"]');
    if (chancePopover) chancePopover.hidden = !uiState.ownedItemChanceOpen;
    if (chanceToggle) chanceToggle.setAttribute('aria-expanded', uiState.ownedItemChanceOpen ? 'true' : 'false');
  }

  function setOwnedRecruitOpen(isOpen) {
    uiState.ownedRecruitOpen = !!isOpen;
    if (!ownedRecruitPanelEl) return;
    ownedRecruitPanelEl.hidden = !uiState.ownedRecruitOpen;
    if (uiState.ownedRecruitOpen) {
      renderOwnedRecruitGrid();
    }
  }

  function recruitablePokemonIds() {
    var pokedex = appState.snapshot.pokedex || {};
    var seenIds = Array.isArray(pokedex.seenPokemonIds) ? pokedex.seenPokemonIds.slice() : [];
    var idLookup = {};
    for (var i = 0; i < seenIds.length; i++) {
      var seenId = parseInt(seenIds[i], 10);
      if (Number.isInteger(seenId) && seenId >= POKEDEX_MIN && seenId <= POKEDEX_MAX) {
        idLookup[seenId] = true;
      }
    }
    var owned = appState.snapshot && Array.isArray(appState.snapshot.ownedPokemon)
      ? appState.snapshot.ownedPokemon
      : [];
    for (var j = 0; j < owned.length; j++) {
      var speciesId = Number(owned[j] && owned[j].speciesId);
      if (Number.isInteger(speciesId) && speciesId >= POKEDEX_MIN && speciesId <= POKEDEX_MAX) {
        idLookup[speciesId] = true;
      }
    }
    return Object.keys(idLookup)
      .map(function (id) { return parseInt(id, 10); })
      .sort(function (a, b) { return a - b; });
  }

  function isPokemonDiscovered(pokemonId) {
    var pokedex = appState.snapshot.pokedex || {};
    var seenIds = Array.isArray(pokedex.seenPokemonIds) ? pokedex.seenPokemonIds : [];
    return seenIds.indexOf(Number(pokemonId)) >= 0;
  }

  function isPokemonCaught(pokemonId) {
    var pokedex = appState.snapshot.pokedex || {};
    var caughtIds = Array.isArray(pokedex.caughtPokemonIds) ? pokedex.caughtPokemonIds : [];
    return caughtIds.indexOf(Number(pokemonId)) >= 0;
  }

  function pokedexStatusForPokemon(pokemonId, seenLookup, caughtLookup) {
    if (caughtLookup ? caughtLookup[pokemonId] : isPokemonCaught(pokemonId)) return 'caught';
    if (seenLookup ? seenLookup[pokemonId] : isPokemonDiscovered(pokemonId)) return 'discovered';
    return 'undiscovered';
  }

  function pokedexStatusLabel(status) {
    if (status === 'all') return t('pokedexStatusAll');
    if (status === 'caught') return t('pokedexStatusCaught');
    if (status === 'discovered') return t('pokedexStatusDiscovered');
    return t('pokedexStatusUndiscovered');
  }

  function recruitPricing() {
    var pricing = appState.snapshot.recruitPricing || {};
    return {
      discovered: pricing.discovered || { 1: 100, 2: 300, 3: 700, 4: 1000, 5: 2000 },
      undiscovered: pricing.undiscovered || { 1: 500, 2: 1500, 3: 3500, 4: 5000, 5: 10000 },
      caughtDiscountRate: Number.isFinite(Number(pricing.caughtDiscountRate)) ? Number(pricing.caughtDiscountRate) : 0.8
    };
  }

  function recruitCostForPokemon(pokemonId, discovered, caught) {
    var tier = Math.max(1, Math.min(5, Number(pokemonRarityTiers[pokemonId]) || 1));
    var pricing = recruitPricing();
    var isCaught = !!caught;
    var costs = (discovered || isCaught) ? pricing.discovered : pricing.undiscovered;
    var basePointCost = Number(costs[tier]) || Number(costs[String(tier)]) || 0;
    var pointCost = isCaught
      ? Math.max(1, Math.floor(basePointCost * pricing.caughtDiscountRate))
      : basePointCost;
    return {
      tier: tier,
      discovered: !!(discovered || isCaught),
      caught: isCaught,
      discount: isCaught ? { type: 'caught', rate: pricing.caughtDiscountRate } : null,
      pointCost: pointCost
    };
  }

  function currentItemPointBalance() {
    return Math.max(0, Number(evolutionItemState().itemPoints) || 0);
  }

  function recruitCostForAgent(agent) {
    var pokemonId = getRenderPokemonId(agent);
    var discovered = isPokemonDiscovered(pokemonId);
    var caughtLookup = pokedexCaughtSpeciesLookup();
    var caught = !!caughtLookup[pokemonId];
    var costInfo = recruitCostForPokemon(pokemonId, discovered, caught);
    return {
      pokemonId: pokemonId,
      pokemonName: pokemonDisplayName(pokemonId),
      tier: costInfo.tier,
      discovered: costInfo.discovered,
      caught: costInfo.caught,
      discount: costInfo.discount,
      pointCost: costInfo.pointCost
    };
  }

  function renderAdoptAgentButton(agent) {
    var costInfo = recruitCostForAgent(agent);
    var canAfford = currentItemPointBalance() >= costInfo.pointCost;
    var title = canAfford
      ? t('recruitForPts', { cost: costInfo.pointCost })
      : t('needPtsToRecruit', { cost: costInfo.pointCost });
    return '<button class="box-detail-btn" data-action="adopt-agent" data-agent-id="' + escapeHtml(agent.agentId) + '"' +
      ' data-pokemon-id="' + escapeHtml(String(costInfo.pokemonId)) + '" data-point-cost="' + escapeHtml(String(costInfo.pointCost)) + '"' +
      ' title="' + escapeHtml(title) + '"' + (canAfford ? '' : ' disabled') + '>' + escapeHtml(t('adoptButton', { cost: costInfo.pointCost })) + '</button>';
  }

  function setOwnedRecruitMode(mode) {
    uiState.ownedRecruitMode = mode === 'pokedex' ? 'pokedex' : 'available';
    renderOwnedRecruitGrid();
  }

  function syncOwnedRecruitModeButtons() {
    if (!ownedRecruitAvailableEl || !ownedRecruitPokedexEl) return;
    var isPokedex = uiState.ownedRecruitMode === 'pokedex';
    ownedRecruitAvailableEl.classList.toggle('active', !isPokedex);
    ownedRecruitPokedexEl.classList.toggle('active', isPokedex);
    ownedRecruitAvailableEl.setAttribute('aria-pressed', isPokedex ? 'false' : 'true');
    ownedRecruitPokedexEl.setAttribute('aria-pressed', isPokedex ? 'true' : 'false');
  }

  function renderOwnedRecruitGrid() {
    if (!ownedRecruitGridEl) return;
    var availableIds = recruitablePokemonIds();
    var availableLookup = {};
    for (var i = 0; i < availableIds.length; i++) availableLookup[availableIds[i]] = true;
    var caughtLookup = pokedexCaughtSpeciesLookup();
    var showPokedex = uiState.ownedRecruitMode === 'pokedex';
    var ids = showPokedex ? [] : availableIds;
    if (showPokedex) {
      for (var fullId = POKEDEX_MIN; fullId <= POKEDEX_MAX; fullId++) ids.push(fullId);
    }
    if (ownedRecruitSummaryEl) {
      ownedRecruitSummaryEl.textContent = showPokedex
        ? t('availablePokedexCount', { count: availableIds.length, total: POKEDEX_TOTAL })
        : t('availableCount', { count: availableIds.length });
    }
    syncOwnedRecruitModeButtons();
    var html = '';
    var itemPoints = (evolutionItemState().itemPoints || 0);
    for (var j = 0; j < ids.length; j++) {
      var pokemonId = ids[j];
      var seen = !!availableLookup[pokemonId];
      var status = pokedexStatusForPokemon(pokemonId, availableLookup, caughtLookup);
      var discovered = status !== 'undiscovered';
      var caught = status === 'caught';
      var costInfo = recruitCostForPokemon(pokemonId, discovered, caught);
      var canAfford = itemPoints >= costInfo.pointCost;
      var cellClass = 'owned-recruit-cell ' + status + (seen ? ' seen' : ' unseen') + (canAfford ? '' : ' unaffordable');
      var pokemonName = pokemonDisplayName(pokemonId);
      var areaMeta = pokemonSpawnAreaMeta(pokemonId);
      var rarity = getPokemonRarity(pokemonId);
      var statusLabel = pokedexStatusLabel(status);
      var recruitLabel = '#' + String(pokemonId).padStart(3, '0') + ' ' + pokemonName + ', ' + (rarity ? rarity.label + ', ' : '') + t('spawnArea', { area: areaMeta.label }) + ', ' + costInfo.pointCost + ' pts, ' + statusLabel;
      html += '<button class="' + cellClass + '" type="button" data-owned-action="recruit-species" data-pokemon-id="' + pokemonId + '"' +
        ' data-point-cost="' + escapeHtml(String(costInfo.pointCost)) + '" title="' + escapeHtml(recruitLabel) + '" aria-label="' + escapeHtml(recruitLabel) + '"' +
        (canAfford ? '' : ' disabled') + '>';
      html += '<span class="owned-recruit-top">';
      html += '<span class="owned-recruit-number">#' + String(pokemonId).padStart(3, '0') + '</span>';
      html += pokemonRarityBadgeHtml(pokemonId, 'owned-recruit-rarity');
      html += '</span>';
      html += '<span class="owned-recruit-media">';
      if (status === 'undiscovered') {
        html += '<span class="owned-recruit-unknown" aria-hidden="true">?</span>';
      } else {
        html += '<img src="' + escapeHtml(spriteUrl('animated', pokemonId, 'gif')) + '" alt="" loading="lazy" />';
      }
      html += '</span>';
      html += '<span class="owned-recruit-name">' + escapeHtml(pokemonName) + '</span>';
      html += '<span class="owned-recruit-bottom">';
      html += '<span class="owned-recruit-cost"><b>' + escapeHtml(formatTokenCount(costInfo.pointCost)) + ' pts</b></span>';
      html += spawnAreaChipHtml(areaMeta, 'owned-recruit-area-chip');
      html += '</span>';
      html += '<span class="owned-recruit-status">' + escapeHtml(pokedexStatusLabel(status)) + '</span>';
      html += '</button>';
    }
    ownedRecruitGridEl.innerHTML = html || '<div class="owned-empty">' + escapeHtml(t('noDiscoveredPokemon')) + '</div>';
  }

  function ensureSelectedEvolutionItemId(itemState) {
    var pool = itemState.pool || [];
    var inventoryItems = inventoryCatalogItems(itemState);
    var selected = uiState.selectedEvolutionItemId;
    var exists = selected && inventoryItems.some(function (item) { return item.id === selected; });
    if (!exists) {
      var inventory = itemState.inventory || {};
      var ownedItem = inventoryItems.find(function (item) { return (inventory[item.id] || 0) > 0; });
      selected = (ownedItem && ownedItem.id) || itemState.pickupItemId || (pool[0] && pool[0].id) || null;
      uiState.selectedEvolutionItemId = selected;
    }
    return selected;
  }

  function pullSuccessRateForItemState(itemState) {
    var rate = Number(itemState && itemState.pullSuccessRate);
    if (!Number.isFinite(rate)) rate = 0.3;
    return Math.max(0, Math.min(1, rate));
  }

  function pullRewardEntryLabel(entry) {
    if (entry && entry.type === 'ticket') {
      return t('itemRulesTicketReward', {
        ticket: recruitTicketLabel(recruitTicketItemIdForReward({ minTier: entry.minTier }))
      });
    }
    return t('itemRulesEvolutionItemReward');
  }

  function adjustedEvolutionItemWeight(item, itemState) {
    var weight = Math.max(0, Number(item && item.weight) || 0);
    if (!item || !itemState || item.id !== itemState.pickupItemId) return weight;
    return weight * Math.max(1, Number(itemState.pickupWeightMultiplier) || 1);
  }

  function evolutionItemChanceRows(itemState, itemRewardChance) {
    var pool = Array.isArray(itemState && itemState.pool) ? itemState.pool : [];
    var totalWeight = pool.reduce(function (sum, item) {
      return sum + adjustedEvolutionItemWeight(item, itemState);
    }, 0);
    if (itemRewardChance <= 0 || totalWeight <= 0) return [];
    return pool.map(function (item) {
      var label = evolutionItemDisplayName(item);
      if (itemState && item.id === itemState.pickupItemId) {
        label += ' (' + t('itemRulesTargetMark') + ')';
      }
      return {
        reward: label,
        chance: itemRewardChance * (adjustedEvolutionItemWeight(item, itemState) / totalWeight),
        tone: 'item'
      };
    });
  }

  function pullChanceRows(itemState) {
    var successRate = pullSuccessRateForItemState(itemState);
    var rewardPool = Array.isArray(itemState && itemState.pullSuccessRewardPool)
      ? itemState.pullSuccessRewardPool
      : [];
    var totalWeight = rewardPool.reduce(function (sum, entry) {
      return sum + Math.max(0, Number(entry && entry.weight) || 0);
    }, 0);
    var rows = [
      { reward: t('itemRulesFailure'), chance: 1 - successRate, tone: 'summary' }
    ];
    if (successRate <= 0 || totalWeight <= 0) return rows;
    var itemRewardChance = 0;
    var ticketRows = [];
    for (var i = 0; i < rewardPool.length; i++) {
      var entry = rewardPool[i];
      var weight = Math.max(0, Number(entry && entry.weight) || 0);
      if (weight <= 0) continue;
      var chance = successRate * (weight / totalWeight);
      if (entry && entry.type === 'item') {
        itemRewardChance += chance;
        continue;
      }
      ticketRows.push({
        reward: pullRewardEntryLabel(entry),
        chance: chance,
        tone: 'ticket'
      });
    }
    if (itemRewardChance > 0) {
      rows.push({
        reward: t('itemRulesEvolutionItemTotal'),
        chance: itemRewardChance,
        tone: 'summary'
      });
      rows = rows.concat(evolutionItemChanceRows(itemState, itemRewardChance));
    }
    return rows.concat(ticketRows);
  }

  function renderEvolutionItemInfoContent(itemState, tokenPerPoint, drawCost, pickupClaimCost, sellValue) {
    if (!ownedItemInfoPopoverEl) return;
    if (ownedItemInfoEl) {
      ownedItemInfoEl.setAttribute('aria-label', t('itemRules'));
    }
    var rows = [
      [t('points'), t('itemRulesPoints', { tokens: formatTokenCount(tokenPerPoint) })],
      [t('draw'), t('itemRulesDraw', { cost: drawCost })],
      [t('target'), t('itemRulesTarget')],
      [t('tickets'), t('itemRulesTickets', { cost: pickupClaimCost })],
      [t('sell'), t('itemRulesSell', { value: sellValue })]
    ];
    var html = '<h4>' + escapeHtml(t('itemRules')) + '</h4><ul>';
    for (var i = 0; i < rows.length; i++) {
      html += '<li><b>' + escapeHtml(rows[i][0]) + '</b><span>' + escapeHtml(rows[i][1]) + '</span></li>';
    }
    html += '</ul>';
    var chanceRows = pullChanceRows(itemState);
    if (chanceRows.length > 0) {
      var chanceOpen = !!uiState.ownedItemChanceOpen;
      html += '<div class="owned-item-chance-wrap">';
      html += '<button type="button" class="owned-item-chance-toggle" data-item-rules-action="toggle-chances" aria-expanded="' + (chanceOpen ? 'true' : 'false') + '" aria-controls="owned-item-chance-popover">';
      html += escapeHtml(t('itemRulesChanceOpen'));
      html += '</button>';
      html += '<div id="owned-item-chance-popover" class="owned-item-chance-popover" data-item-rules-chances' + (chanceOpen ? '' : ' hidden') + '>';
      html += '<div class="owned-item-chance-head">';
      html += '<h5>' + escapeHtml(t('itemRulesChanceTable')) + '</h5>';
      html += '<button type="button" class="owned-item-chance-close" data-item-rules-action="close-chances" aria-label="' + escapeHtml(t('close')) + '">&times;</button>';
      html += '</div>';
      html += '<table class="owned-item-rules-table">';
      html += '<thead><tr><th scope="col">' + escapeHtml(t('itemRulesReward')) + '</th><th scope="col">' + escapeHtml(t('itemRulesChance')) + '</th></tr></thead>';
      html += '<tbody>';
      for (var j = 0; j < chanceRows.length; j++) {
        var tone = chanceRows[j].tone ? ' class="chance-row-' + escapeHtml(chanceRows[j].tone) + '"' : '';
        html += '<tr' + tone + '><td>' + escapeHtml(chanceRows[j].reward) + '</td><td>' + escapeHtml(formatProbability(chanceRows[j].chance)) + '</td></tr>';
      }
      html += '</tbody></table></div></div>';
    }
    ownedItemInfoPopoverEl.innerHTML = html;
  }

  function renderInventoryItemChip(item, count, selectedItemId) {
    var itemLabel = evolutionItemDisplayName(item);
    var isTicket = isRecruitTicketItem(item);
    var ticketClass = isTicket
      ? ' ticket tier-' + (Number(item.minTier) || 1) + (count <= 0 ? ' placeholder' : '')
      : '';
    var html = '';
    html += '<button type="button" class="owned-item-chip' + ticketClass + (item.id === selectedItemId ? ' selected' : '') + (count <= 0 ? ' empty' : '') + '" data-item-id="' + escapeHtml(item.id) + '" data-item-kind="' + (isTicket ? 'recruit-ticket' : 'evolution') + '" title="' + escapeHtml(itemLabel) + '">';
    html += '<img src="' + escapeHtml(itemSpriteUrl(item.id)) + '" alt="" loading="lazy" />';
    html += '<span>' + escapeHtml(itemLabel) + '</span>';
    html += '<b>x' + count + '</b>';
    html += '</button>';
    return html;
  }

  function renderInventoryCategory(title, items, inventory, selectedItemId, extraClass) {
    var total = items.reduce(function (sum, item) {
      return sum + (inventory[item.id] || 0);
    }, 0);
    var html = '<section class="owned-item-category' + (extraClass ? ' ' + extraClass : '') + '">';
    html += '<div class="owned-item-category-head">';
    html += '<h4>' + escapeHtml(title) + '</h4>';
    html += '<span>' + escapeHtml(t('itemCount', { count: total })) + '</span>';
    html += '</div>';
    html += '<div class="owned-item-category-grid">';
    for (var i = 0; i < items.length; i++) {
      html += renderInventoryItemChip(items[i], inventory[items[i].id] || 0, selectedItemId);
    }
    html += '</div>';
    html += '</section>';
    return html;
  }

  function renderEvolutionItemPanel() {
    if (!ownedItemInventoryEl) return;
    var itemState = evolutionItemState();
    var pool = itemState.pool || [];
    var inventoryItems = inventoryCatalogItems(itemState);
    var evolutionItems = evolutionInventoryItems(itemState);
    var recruitTicketItems = recruitTicketInventoryItems(itemState);
    var inventory = itemState.inventory || {};
    var selectedItemId = ensureSelectedEvolutionItemId(itemState);
    var selectedItem = evolutionItemById(selectedItemId);
    var tokenPerPoint = Math.max(1, Number(itemState.tokenPerItemPoint) || 10000);
    var drawCost = Math.max(1, Number(itemState.randomPullPointCost) || 250);
    var pickupClaimCost = Math.max(1, Number(itemState.itemClaimTicketCost || itemState.itemBuyPickupPointCost) || 20);
    var sellValue = Math.max(1, Number(itemState.itemSellPointValue) || 10);
    var pickupTargetId = itemState.pickupItemId || null;
    var targetTickets = Math.max(0, Number(itemState.targetTickets !== undefined ? itemState.targetTickets : itemState.pickupPoints) || 0);
    var remainder = Math.max(0, Math.min(tokenPerPoint, Number(itemState.rewardTokenRemainder) || 0));
    var progress = Math.max(0, Math.min(100, (remainder / tokenPerPoint) * 100));
    var totalOwnedItems = inventoryItems.reduce(function (sum, item) {
      return sum + (inventory[item.id] || 0);
    }, 0);

    if (ownedItemSummaryEl) ownedItemSummaryEl.textContent = t('itemCount', { count: totalOwnedItems });
    if (ownedItemPointsEl) ownedItemPointsEl.textContent = formatTokenCount(itemState.itemPoints || 0);
    if (ownedPickupPointsEl) ownedPickupPointsEl.textContent = formatTokenCount(targetTickets);
    if (ownedItemProgressTextEl) {
      ownedItemProgressTextEl.textContent = formatTokenCount(remainder) + ' / ' + formatTokenCount(tokenPerPoint);
    }
    if (ownedItemProgressFillEl) {
      ownedItemProgressFillEl.style.width = progress.toFixed(1) + '%';
    }

    if (ownedPickupSelectEl) {
      var pickupHtml = '<option value="">' + escapeHtml(t('noTarget')) + '</option>';
      for (var i = 0; i < pool.length; i++) {
        pickupHtml += '<option value="' + escapeHtml(pool[i].id) + '"' + (pool[i].id === itemState.pickupItemId ? ' selected' : '') + '>';
        pickupHtml += escapeHtml(evolutionItemDisplayName(pool[i]));
        pickupHtml += '</option>';
      }
      ownedPickupSelectEl.innerHTML = pickupHtml;
    }

    if (ownedItemPullEl) ownedItemPullEl.textContent = t('draw') + ' (' + drawCost + ' pts)';
    if (ownedItemBuyEl) ownedItemBuyEl.hidden = true;
    if (ownedItemSellEl) ownedItemSellEl.textContent = t('sell') + ' (+' + sellValue + ' pts)';
    if (ownedItemClaimPickupEl) {
      ownedItemClaimPickupEl.innerHTML =
        '<span>' + escapeHtml(t('claimTarget')) + '</span>' +
        '<b>' + escapeHtml(String(pickupClaimCost)) + ' tickets</b>';
    }
    renderEvolutionItemInfoContent(itemState, tokenPerPoint, drawCost, pickupClaimCost, sellValue);

    var canPull = (itemState.itemPoints || 0) >= drawCost;
    if (ownedItemPullEl) ownedItemPullEl.disabled = !canPull;
    if (ownedItemBuyEl) ownedItemBuyEl.disabled = true;
    if (ownedItemSellEl) {
      ownedItemSellEl.disabled = !selectedItemId ||
        isRecruitTicketItem(selectedItem) ||
        (inventory[selectedItemId] || 0) <= 0;
    }
    if (ownedItemClaimPickupEl) ownedItemClaimPickupEl.disabled = !pickupTargetId || targetTickets < pickupClaimCost;

    var html = '';
    if (evolutionItems.length > 0) {
      html += renderInventoryCategory(t('evolutionItems'), evolutionItems, inventory, selectedItemId, 'evolution-items');
    }
    if (recruitTicketItems.length > 0) {
      html += renderInventoryCategory(t('recruitTickets'), recruitTicketItems, inventory, selectedItemId, 'recruit-tickets');
    }
    ownedItemInventoryEl.innerHTML = html || '<div class="owned-empty compact">' + escapeHtml(t('noEvolutionItems')) + '</div>';
  }

  function renderOwnedPartyStrip(owned) {
    if (!ownedStripGridEl) return;
    var party = owned.filter(function (pokemon) { return Number.isInteger(pokemon.partySlot); })
      .sort(function (a, b) { return a.partySlot - b.partySlot; });

    var html = '';
    for (var slot = 0; slot < OWNED_PARTY_SIZE; slot++) {
      var member = party[slot];
      if (!member) {
        html += '<button class="owned-strip-slot empty" type="button" data-owned-action="open-modal" title="' + escapeHtml(t('emptyPartySlot')) + '">';
        html += '</button>';
        continue;
      }

      var stats = ownedLevelDetails(member);
      var evolution = ownedEvolutionInfo(member);
      var assigned = !!member.assignedProjectId;
      var displayName = ownedDisplayName(member);
      var nameClass = 'owned-strip-name';
      if (displayName.length >= 11) {
        nameClass += ' tiny';
      } else if (displayName.length >= 8) {
        nameClass += ' compact';
      }
      var title = displayName + ' - Lv.' + stats.level + ' ' + pokemonDisplayName(member.speciesId);
      var className = 'owned-strip-slot filled' + (evolution && evolution.canEvolve ? ' can-evolve' : '') + (assigned ? ' assigned' : '');
      html += '<button class="' + className + '" type="button" data-owned-action="open-modal" data-owned-id="' + escapeHtml(member.id) + '" title="' + escapeHtml(title) + '">';
      html += '<span class="' + nameClass + '">' + escapeHtml(displayName) + '</span>';
      html += '<img src="' + escapeHtml(spriteUrl('icon', member.speciesId, 'png')) + '" alt="" loading="lazy" />';
      html += '<span class="owned-strip-level">Lv.' + stats.level + '</span>';
      if (evolution && evolution.canEvolve) {
        html += '<span class="owned-strip-badge" aria-hidden="true"></span>';
      } else if (assigned) {
        html += '<span class="owned-strip-link" aria-hidden="true"></span>';
      }
      html += '</button>';
    }
    ownedStripGridEl.innerHTML = html;
  }

  function renderOwnedPokemon() {
    var owned = appState.snapshot.ownedPokemon || [];
    var party = owned.filter(function (pokemon) { return Number.isInteger(pokemon.partySlot); })
      .sort(function (a, b) { return a.partySlot - b.partySlot; });
    var boxed = owned.filter(function (pokemon) { return !Number.isInteger(pokemon.partySlot); });
    if (ownedProgressEl) ownedProgressEl.textContent = t('ownedShort', { count: owned.length });
    if (ownedCurrentPointsEl) {
      ownedCurrentPointsEl.textContent = formatTokenCount(currentItemPointBalance()) + ' pts';
      ownedCurrentPointsEl.setAttribute('title', t('currentPoints'));
    }
    renderOwnedPartyStrip(owned);
    if (!ownedModalEl) return;
    ownedSummaryEl.textContent = t('ownedPokemonCount', { count: owned.length });
    ownedPartyCountEl.textContent = t('dragToArrange');
    ownedBoxCountEl.textContent = t('boxedCount', { count: boxed.length });
    renderEvolutionItemPanel();

    var partyHtml = '';
    for (var slot = 0; slot < OWNED_PARTY_SIZE; slot++) {
      var member = party[slot];
      if (member) {
        partyHtml += renderOwnedPartyCard(member, slot);
      } else {
        partyHtml += '<div class="owned-party-empty" data-owned-drop-slot="' + slot + '" aria-label="' + escapeHtml(t('emptyPartySpot')) + '"></div>';
      }
    }
    ownedPartyGridEl.innerHTML = partyHtml;

    var boxHtml = '';
    for (var j = 0; j < boxed.length; j++) {
      boxHtml += renderOwnedBoxTile(boxed[j]);
    }
    ownedBoxGridEl.innerHTML = boxHtml || '<div class="owned-empty">' + escapeHtml(t('noBoxedPokemon')) + '</div>';
    if (uiState.ownedRecruitOpen) {
      renderOwnedRecruitGrid();
    }
  }

  function setPokedexOpen(isOpen) {
    uiState.pokedexOpen = !!isOpen;
    pokedexModalEl.hidden = !uiState.pokedexOpen;
    if (!uiState.pokedexOpen) {
      hidePokedexTooltip();
    }
  }

  function renderPokedex() {
    var pokedex = appState.snapshot.pokedex || {};
    var seenIds = Array.isArray(pokedex.seenPokemonIds) ? pokedex.seenPokemonIds : [];
    var caughtIds = Array.isArray(pokedex.caughtPokemonIds) ? pokedex.caughtPokemonIds : [];
    var seenLookup = {};
    for (var i = 0; i < seenIds.length; i++) {
      seenLookup[seenIds[i]] = true;
    }
    var caughtLookup = pokedexCaughtSpeciesLookup();
    var statusCounts = pokedexStatusCounts(seenLookup, caughtLookup);

    var discovered = typeof pokedex.seenCount === 'number'
      ? pokedex.seenCount
      : (typeof pokedex.discoveredCount === 'number' ? pokedex.discoveredCount : seenIds.length);
    var caught = typeof pokedex.caughtCount === 'number' ? pokedex.caughtCount : caughtIds.length;
    var total = typeof pokedex.totalCount === 'number' ? pokedex.totalCount : POKEDEX_TOTAL;
    pokedexProgressEl.textContent = discovered + ' / ' + total + ' | ' + caught + ' ' + t('caught');
    pokedexSummaryEl.textContent = t('pokedexProgressFull', { seen: discovered, caught: caught, total: total });
    var claimableRewardCount = Number(pokedex.claimableRewardCount) || 0;
    if (pokedexRewardCountEl) {
      pokedexRewardCountEl.textContent = String(claimableRewardCount);
      pokedexRewardCountEl.classList.toggle('ready', claimableRewardCount > 0);
      pokedexRewardCountEl.setAttribute('title', t('pokedexRewardsReady', { count: claimableRewardCount }));
    }
    syncPokedexTabs();
    renderPokedexRewards();

    var html = '';
    var scrollTop = pokedexGridEl.scrollTop;
    var activePokemonId = null;
    var activeCell = document.activeElement && document.activeElement.closest
      ? document.activeElement.closest('.pokedex-cell[data-pokemon-id]')
      : null;
    if (activeCell) {
      activePokemonId = parseInt(activeCell.getAttribute('data-pokemon-id'), 10) || null;
    }
    var pokemonIds = sortedPokedexPokemonIds();
    var currentGroupKey = '';
    var showGroupHeaders = normalizePokedexSort(uiState.pokedexSort) !== 'number';
    uiState.pokedexCategory = normalizePokedexCategory(uiState.pokedexCategory);
    for (var p = 0; p < pokemonIds.length; p++) {
      var pokemonId = pokemonIds[p];
      var status = pokedexStatusForPokemon(pokemonId, seenLookup, caughtLookup);
      if (!pokedexCategoryIncludesStatus(uiState.pokedexCategory, status)) {
        continue;
      }
      if (showGroupHeaders) {
        var groupKey = pokedexGroupKey(pokemonId);
        if (groupKey !== currentGroupKey) {
          currentGroupKey = groupKey;
          html += pokedexGroupHeaderHtml(pokemonId);
        }
      }
      var known = status !== 'undiscovered';
      var pokemonName = pokemonDisplayName(pokemonId);
      var statusLabel = pokedexStatusLabel(status);
      var cellLabel = '#' + String(pokemonId).padStart(3, '0') + ' ' + pokemonName + ', ' + statusLabel;
      html += '<div class="pokedex-cell ' + status + '" data-pokemon-id="' + pokemonId + '" tabindex="0" aria-label="' + escapeHtml(cellLabel) + '" title="' + escapeHtml(cellLabel) + '">';
      if (status === 'caught') {
        html += '<span class="pokedex-caught-icon" aria-hidden="true"></span>';
      }
      html += '<div class="pokedex-meta">';
      html += '<span class="pokedex-number">#' + String(pokemonId).padStart(3, '0') + '</span>';
      html += '<span class="pokedex-name">' + escapeHtml(pokemonName) + '</span>';
      html += '</div>';
      html += '<div class="pokedex-media">';
      if (known) {
        html += '<img class="pokedex-icon" src="' + escapeHtml(spriteUrl('animated', pokemonId, 'gif')) + '" alt="' + escapeHtml(pokemonName) + '" loading="lazy" />';
      } else {
        html += '<span class="pokedex-unknown">?</span>';
      }
      html += '</div>';
      html += '</div>';
    }
    pokedexGridEl.innerHTML = html;
    pokedexGridEl.scrollTop = scrollTop;
    if (activePokemonId) {
      var nextActiveCell = pokedexGridEl.querySelector('.pokedex-cell[data-pokemon-id="' + activePokemonId + '"]');
      if (nextActiveCell) {
        nextActiveCell.focus({ preventScroll: true });
      }
    }
    syncPokedexLanguageMenu();
    syncPokedexCategoryControl(statusCounts);
    syncPokedexSortControl();
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function applySnapshot(snapshot) {
    appState.liveSnapshot = snapshot;
    syncVisibleSnapshot();
  }

  function updateEntityMotion(now) {
    const agents = filteredAgents();

    for (const agent of agents) {
      const entity = ensureEntity(agent);
      if (!entity) continue;
      entity.x = entity.baseX;
      entity.y = entity.baseY;
    }
  }

  // ── Load pre-rendered terrain PNG ──
  var terrainImage = null;
  var terrainImageKey = null;
  var terrainImageCache = {};

  function selectedMapAsset() {
    var area = areaDefById(uiState.areaFilter);
    return area && area.detailAsset ? area.detailAsset : OVERVIEW_MAP_ASSET;
  }

  function syncTerrainImage() {
    var asset = selectedMapAsset();
    if (terrainImageKey === asset && terrainImage) return;
    terrainImageKey = asset;
    if (terrainImageCache[asset]) {
      terrainImage = terrainImageCache[asset];
      return;
    }
    terrainImage = null;
    var img = new Image();
    img.onload = function () {
      terrainImageCache[asset] = img;
      if (terrainImageKey === asset) {
        terrainImage = img;
      }
    };
    img.src = dataUrl(asset);
  }

  syncTerrainImage();

  function drawBackground() {
    const { scale, offsetX, offsetY } = getTransform();
    worldCtx.clearRect(0, 0, worldCanvas.width, worldCanvas.height);
    worldCtx.fillStyle = '#1858A0';
    worldCtx.fillRect(0, 0, worldCanvas.width, worldCanvas.height);
    worldCtx.save();
    worldCtx.translate(offsetX, offsetY);
    worldCtx.scale(scale, scale);
    worldCtx.imageSmoothingEnabled = false;
    if (terrainImage) worldCtx.drawImage(terrainImage, 0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    worldCtx.restore();
  }

  
  function drawConnections(agents) {
    // Disabled: no longer drawing parent-child connection lines
  }

  function agentDrawSize(agent) {
    return agent.parentId ? SUBAGENT_DRAW_SIZE : DRAW_SIZE;
  }

  function animationBallSize(drawSize) {
    return Math.max(18, drawSize * 0.42);
  }

  function drawSpriteFooting(ctx, x, y, size) {
    ctx.save();
    ctx.fillStyle = 'rgba(255, 250, 218, 0.28)';
    ctx.beginPath();
    ctx.ellipse(x + size * 0.5, y + size * 0.56, size * 0.34, size * 0.32, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(14, 18, 18, 0.28)';
    ctx.beginPath();
    ctx.ellipse(x + size * 0.5, y + size * 0.84, size * 0.28, size * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawAgents(agents, now) {
    var usePokeSprites = appState.snapshot.config && appState.snapshot.config.enablePokeapiSprites;
    if (usePokeSprites) return;

    const { scale, offsetX, offsetY } = getTransform();

    const drawRows = agents
      .map(function (agent) { return { agent: agent, entity: appState.entityById.get(agent.agentId) }; })
      .filter(function (row) { return !!row.entity && !row.agent.parentId; })
      .sort(function (a, b) { return a.entity.y - b.entity.y; });

    const provider = spriteProvider();

    worldCtx.save();
    worldCtx.translate(offsetX, offsetY);
    worldCtx.scale(scale, scale);
    worldCtx.imageSmoothingEnabled = false;

    for (const row of drawRows) {
      const agent = row.agent;
      const entity = row.entity;
      // Skip if spawn animation hasn't reached the materialization phase yet
      var anim = animations.get(agent.agentId);
      if (anim && anim.type === 'spawn') {
        var animElapsed = now - anim.startTime;
        if (animElapsed < BALL_SHAKE_MS + BALL_OPEN_MS) continue; // still in ball phase
        if (animElapsed < SPAWN_DURATION_MS) continue; // handled by drawAnimations
      }
      if (anim && anim.type === 'despawn') continue; // handled by drawAnimations

      const frame = (agent.status === 'Sleeping' || agent.isSleeping)
        ? 0
        : Math.floor(now / 200 + hashCode(agent.agentId)) % 3;
      const sprite = provider.getSprite(agent, frame, agent.status);

      const spriteX = Math.round(entity.x);
      const spriteY = Math.round(entity.y);
      drawSpriteFooting(worldCtx, spriteX, spriteY, DRAW_SIZE);
      worldCtx.drawImage(sprite, spriteX, spriteY, DRAW_SIZE, DRAW_SIZE);
    }

    worldCtx.restore();
  }

  function drawAnimations(agents, now) {
    const { scale, offsetX, offsetY } = getTransform();
    var finished = [];

    worldCtx.save();
    worldCtx.translate(offsetX, offsetY);
    worldCtx.scale(scale, scale);
    worldCtx.imageSmoothingEnabled = false;

    for (var [id, anim] of animations) {
      var elapsed = now - anim.startTime;
      var cx = Math.round(anim.x);
      var cy = Math.round(anim.y);
      var animAgent = getAgentById(id) || anim.agent || null;
      var drawSize = animAgent ? agentDrawSize(animAgent) : DRAW_SIZE;
      var centerX = cx + drawSize / 2;
      var centerY = cy + drawSize / 2;

      if (anim.type === 'spawn') {
        // Phase 1: ball falls in + shakes (0 ~ BALL_SHAKE_MS)
        // Phase 2: ball opens + white flash (BALL_SHAKE_MS ~ BALL_SHAKE_MS + BALL_OPEN_MS)
        // Phase 3: monster materializes (BALL_SHAKE_MS + BALL_OPEN_MS ~ SPAWN_DURATION_MS)
        if (elapsed >= SPAWN_DURATION_MS) {
          finished.push(id);
          continue;
        }

        if (elapsed < BALL_SHAKE_MS) {
          // Ball drops in and shakes
          var dropT = Math.min(1, elapsed / 150);
          var dropY = cy + (1 - dropT) * -15;
          var shakeX = 0;
          if (elapsed > 100) {
            var shakeT = (elapsed - 100) / (BALL_SHAKE_MS - 100);
            shakeX = Math.sin(shakeT * Math.PI * 4) * 2 * (1 - shakeT);
          }
          var ballSize = animationBallSize(drawSize);
          var bx = cx + (drawSize - ballSize) / 2 + shakeX;
          var by = dropY + (drawSize - ballSize) / 2;
          worldCtx.drawImage(pokeballSprite, bx, by, ballSize, ballSize);
        } else if (elapsed < BALL_SHAKE_MS + BALL_OPEN_MS) {
          // Ball opens with flash
          var openT = (elapsed - BALL_SHAKE_MS) / BALL_OPEN_MS;
          var ballSize = animationBallSize(drawSize);

          // Draw open ball (shrinking)
          var shrink = 1 - openT * 0.6;
          var sbs = ballSize * shrink;
          var sbx = cx + (drawSize - sbs) / 2;
          var sby = cy + drawSize - sbs;
          worldCtx.globalAlpha = 1 - openT;
          worldCtx.drawImage(pokeballOpenSprite, sbx, sby, sbs, sbs);
          worldCtx.globalAlpha = 1;

          // White flash circle expanding
          var flashRadius = drawSize * 0.22 + openT * drawSize * 0.28;
          var flashAlpha = 0.8 * (1 - openT);
          worldCtx.beginPath();
          worldCtx.arc(centerX, centerY, flashRadius, 0, Math.PI * 2);
          worldCtx.fillStyle = 'rgba(255,255,255,' + flashAlpha + ')';
          worldCtx.fill();
        } else {
          // Phase 3: sparkle effect only (actual sprite appears via normal render path after animation ends)
          var appearT = (elapsed - BALL_SHAKE_MS - BALL_OPEN_MS) / APPEAR_MS;

          // Fading white glow where monster will appear
          var glowAlpha = 0.5 * (1 - appearT);
          if (glowAlpha > 0) {
            var glowRadius = drawSize * 0.24 * (1 - appearT * 0.45);
            worldCtx.beginPath();
            worldCtx.arc(centerX, centerY, glowRadius, 0, Math.PI * 2);
            worldCtx.fillStyle = 'rgba(255,255,255,' + glowAlpha + ')';
            worldCtx.fill();
          }

          // Sparkle particles
          if (appearT < 0.8) {
            var sparkles = 4;
            for (var s = 0; s < sparkles; s++) {
              var sa = (s / sparkles) * Math.PI * 2 + now * 0.008;
              var sr = drawSize * 0.26 * (1 - appearT);
              var spx = centerX + Math.cos(sa) * sr;
              var spy = centerY + Math.sin(sa) * sr;
              worldCtx.fillStyle = 'rgba(255,255,220,' + (0.9 - appearT) + ')';
              worldCtx.fillRect(spx - 0.5, spy - 0.5, 1, 1);
            }
          }
        }
      } else if (anim.type === 'despawn') {
        // Phase 1: monster shrinks + red tint (0 ~ DESPAWN_DURATION_MS * 0.4)
        // Phase 2: red beam into ball (DESPAWN_DURATION_MS * 0.4 ~ 0.7)
        // Phase 3: ball shrinks away (DESPAWN_DURATION_MS * 0.7 ~ 1.0)
        if (elapsed >= DESPAWN_DURATION_MS) {
          finished.push(id);
          appState.roomAssignments.delete(id);
          continue;
        }

        var t = elapsed / DESPAWN_DURATION_MS;

        if (t < 0.4) {
          // Red silhouette shrinks (no actual sprite drawn)
          var shrinkT = t / 0.4;
          var scaleDown = 1 - shrinkT * 0.7;
          var silSize = drawSize * scaleDown;
          var silX = cx + (drawSize - silSize) / 2;
          var silY = cy + (drawSize - silSize);
          // Shrinking red glow blob
          worldCtx.globalAlpha = 1 - shrinkT * 0.3;
          var grad = worldCtx.createRadialGradient(
            centerX, centerY, silSize * 0.1,
            centerX, centerY, silSize * 0.6
          );
          grad.addColorStop(0, 'rgba(255,80,80,0.8)');
          grad.addColorStop(1, 'rgba(255,50,50,0)');
          worldCtx.fillStyle = grad;
          worldCtx.fillRect(silX, silY, silSize, silSize);
          worldCtx.globalAlpha = 1;
        } else if (t < 0.7) {
          // Red beam converges into ball center
          var beamT = (t - 0.4) / 0.3;
          var bcx = centerX;
          var bcy = centerY;
          // Converging beam lines
          for (var b = 0; b < 6; b++) {
            var ba = (b / 6) * Math.PI * 2;
            var bRadius = drawSize * 0.6 * (1 - beamT);
            var bsx = bcx + Math.cos(ba) * bRadius;
            var bsy = bcy + Math.sin(ba) * bRadius;
            worldCtx.strokeStyle = 'rgba(255,80,80,' + (0.8 - beamT * 0.5) + ')';
            worldCtx.lineWidth = 1.5 / scale;
            worldCtx.beginPath();
            worldCtx.moveTo(bsx, bsy);
            worldCtx.lineTo(bcx, bcy);
            worldCtx.stroke();
          }
          // Ball appears at center
          var ballSize = animationBallSize(drawSize) * beamT;
          worldCtx.drawImage(pokeballSprite, bcx - ballSize / 2, bcy - ballSize / 2, ballSize, ballSize);
        } else {
          // Ball shrinks and fades
          var fadeT = (t - 0.7) / 0.3;
          var ballSize = animationBallSize(drawSize) * (1 - fadeT * 0.8);
          var bcx = centerX;
          var bcy = centerY;
          worldCtx.globalAlpha = 1 - fadeT;
          worldCtx.drawImage(pokeballSprite, bcx - ballSize / 2, bcy - ballSize / 2, ballSize, ballSize);
          worldCtx.globalAlpha = 1;
        }
      }
    }

    worldCtx.restore();

    for (var f = 0; f < finished.length; f++) {
      animations.delete(finished[f]);
    }
  }

  function renderOutsideAreaRail(agents) {
    if (!isAreaDetailMode() || agents.length === 0) {
      return '';
    }

    var area = areaDefById(uiState.areaFilter);
    var outsideLabel = localizedOutsideAreaLabel(area);
    var html = '<aside class="outside-area-rail" aria-label="' + escapeHtml(outsideLabel) + '">';
    html += '<div class="outside-area-rail-head" title="' + escapeHtml(outsideLabel) + '"><b>' + agents.length + '</b></div>';
    html += '<div class="outside-area-rail-grid">';
    for (var i = 0; i < agents.length; i++) {
      var agent = agents[i];
      var isSleep = agent.isSleeping || !agent.isActive;
      var isSubagent = !!agent.parentId;
      var sprite = isSleep ? pokemonStaticIconUrl(agent) : pokemonIconUrl(agent);
      var sleepScale = isSleep ? agentSleepSpriteScale(agent) : 1;
      var classes = 'agent-sprite agent-sprite-rendered outside-area-agent-icon';
      if (isSubagent) classes += ' outside-area-agent-icon-subagent';
      if (isSleep) classes += ' agent-sprite-sleeping';
      html += '<button type="button" class="' + classes + '" data-agent-id="' + escapeHtml(agent.agentId) + '" title="' + escapeHtml(rootAgentBadge(agent)) + '" style="--sleep-sprite-scale:' + sleepScale.toFixed(3) + '">';
      html += '<img class="agent-sprite-image" src="' + escapeHtml(sprite) + '" alt="" />';
      html += '</button>';
    }
    html += '</div></aside>';
    return html;
  }

  function renderOverlay(agents, now) {
    const { scale, offsetX, offsetY } = getTransform();
    const dpr = window.devicePixelRatio || 1;
    var usePokeSprites = appState.snapshot.config && appState.snapshot.config.enablePokeapiSprites;

    var html = '';
    var zzzHtml = '';

    for (var i = 0; i < agents.length; i++) {
      var agent = agents[i];
      var entity = appState.entityById.get(agent.agentId);
      if (!entity) continue;

      // Hide labels while spawn animation is playing
      var anim = animations.get(agent.agentId);
      if (anim && anim.type === 'spawn' && (performance.now() - anim.startTime) < SPAWN_DURATION_MS) continue;

      // Convert device-pixel coords to CSS pixel coords for HTML overlay
      var sx = (offsetX + Math.round(entity.x) * scale) / dpr;
      var sy = (offsetY + Math.round(entity.y) * scale) / dpr;
      var drawSizeCss = agentDrawSize(agent) * scale / dpr;

      var isSleep = agent.isSleeping || !agent.isActive;
      var isSubagent = !!agent.parentId;
      var sleepScale = isSleep ? agentSleepSpriteScale(agent) : 1;
      var sleepScaleStyle = isSleep ? ';--sleep-sprite-scale:' + sleepScale.toFixed(3) : '';

      // Subagents always use the compact icon sprite treatment.
      if (isSubagent) {
        var subagentSpriteUrl = isSleep ? pokemonStaticIconUrl(agent) : pokemonIconUrl(agent);
        var subagentSleepClass = isSleep ? ' agent-sprite-sleeping' : '';
        html += '<span class="agent-sprite agent-sprite-rendered agent-sprite-subagent' + subagentSleepClass + '" data-agent-id="' + escapeHtml(agent.agentId) + '" style="left:' + sx + 'px;top:' + sy + 'px;width:' + drawSizeCss + 'px;height:' + drawSizeCss + 'px' + sleepScaleStyle + '">';
        html += '<img class="agent-sprite-image" src="' + escapeHtml(subagentSpriteUrl) + '" />';
        html += '</span>';
      } else if (usePokeSprites) {
        var spriteUrl = pokeProvider.getSpriteUrl(agent, isSleep);
        if (spriteUrl) {
          var sleepClass = isSleep ? ' agent-sprite-sleeping' : '';
          html += '<span class="agent-sprite agent-sprite-rendered' + sleepClass + '" data-agent-id="' + escapeHtml(agent.agentId) + '" style="left:' + sx + 'px;top:' + sy + 'px;width:' + drawSizeCss + 'px;height:' + drawSizeCss + 'px' + sleepScaleStyle + '">';
          html += '<img class="agent-sprite-image" src="' + escapeHtml(spriteUrl) + '" />';
          html += '</span>';
        }
      } else {
        // Invisible hit area for canvas-rendered sprites
        html += '<span class="agent-sprite" data-agent-id="' + escapeHtml(agent.agentId) + '" style="left:' + sx + 'px;top:' + sy + 'px;width:' + drawSizeCss + 'px;height:' + drawSizeCss + 'px"></span>';
      }

      if (!isSubagent) {
        var badgeRaw = rootAgentBadge(agent);
        var badge = badgeRaw.length > 20 ? badgeRaw.slice(0, 19) + '...' : badgeRaw;
        var labelX = sx + drawSizeCss * 0.5;
        var labelY = sy - 2;
        html += '<span class="agent-label" style="left:' + labelX + 'px;top:' + labelY + 'px" title="' + escapeHtml(badgeRaw) + '">' + escapeHtml(badge) + '</span>';
      }

      if (isSleep) {
        // Collect zzz bubbles separately so they render on top of everything
        var zzzClass = isSubagent ? ' agent-zzz-bubble-subagent' : '';
        var zzzPhase = now / 1100 + (Math.abs(hashCode(agent.agentId)) % 628) / 100;
        var zzzOffsetX = Math.sin(zzzPhase) * 2.6;
        var zzzOffsetY = Math.cos(zzzPhase * 0.82) * 1.8;
        zzzHtml += '<span class="agent-zzz-bubble' + zzzClass + '" style="left:' + (sx + drawSizeCss * 0.68 + zzzOffsetX) + 'px;top:' + (sy + drawSizeCss * 0.1 + zzzOffsetY) + 'px">zzz<span class="agent-zzz-tail"><span class="agent-zzz-dot agent-zzz-dot-1"></span><span class="agent-zzz-dot agent-zzz-dot-2"></span><span class="agent-zzz-dot agent-zzz-dot-3"></span></span></span>';
      }
    }

    // zzz bubbles appended last so they sit on top of all sprites/labels
    overlayEl.innerHTML = html + zzzHtml + renderOutsideAreaRail(outsideAreaAgents());
    clampOverlayDecorations();
  }

  function clampOverlayDecorations() {
    var overlayRect = overlayEl.getBoundingClientRect();
    if (!overlayRect.width || !overlayRect.height) return;

    var nodes = overlayEl.querySelectorAll('.agent-label, .agent-zzz-bubble');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var rect = el.getBoundingClientRect();
      var dx = 0;
      var dy = 0;

      if (rect.left < overlayRect.left + OVERLAY_EDGE_PAD) {
        dx = (overlayRect.left + OVERLAY_EDGE_PAD) - rect.left;
      } else if (rect.right > overlayRect.right - OVERLAY_EDGE_PAD) {
        dx = (overlayRect.right - OVERLAY_EDGE_PAD) - rect.right;
      }

      if (rect.top < overlayRect.top + OVERLAY_EDGE_PAD) {
        dy = (overlayRect.top + OVERLAY_EDGE_PAD) - rect.top;
      } else if (rect.bottom > overlayRect.bottom - OVERLAY_EDGE_PAD) {
        dy = (overlayRect.bottom - OVERLAY_EDGE_PAD) - rect.bottom;
      }

      if (!dx && !dy) continue;

      var left = parseFloat(el.style.left) || 0;
      var top = parseFloat(el.style.top) || 0;
      el.style.left = (left + dx) + 'px';
      el.style.top = (top + dy) + 'px';
    }
  }

  function loadExportImage(url) {
    if (!url) return Promise.resolve(null);
    if (exportImageCache.has(url)) {
      return exportImageCache.get(url);
    }
    var promise = new Promise(function (resolve) {
      var img = new Image();
      img.onload = function () { resolve(img); };
      img.onerror = function () { resolve(null); };
      img.src = url;
    });
    exportImageCache.set(url, promise);
    return promise;
  }

  function drawExportBadge(ctx, centerX, topY, label) {
    var raw = String(label || 'Agent');
    var text = raw.length > 20 ? raw.slice(0, 19) + '…' : raw;
    ctx.save();
    ctx.font = 'bold 11px Trebuchet MS, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    var width = Math.max(44, Math.ceil(ctx.measureText(text).width + 16));
    var height = 18;
    var x = centerX - width / 2;
    var y = topY - height;
    ctx.fillStyle = 'rgba(18, 31, 39, 0.88)';
    ctx.fillRect(x, y, width, height);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.72)';
    ctx.strokeRect(x + 0.5, y + 0.5, width - 1, height - 1);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(text, centerX, y + height / 2 + 0.5);
    ctx.restore();
  }

  function drawExportSleepMarker(ctx, x, y) {
    ctx.save();
    ctx.font = 'bold 12px Trebuchet MS, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = 'rgba(26, 40, 52, 0.6)';
    ctx.lineWidth = 3;
    ctx.strokeText('zzz', x, y);
    ctx.fillText('zzz', x, y);
    ctx.restore();
  }

  async function drawExportOverlay(ctx, agents, now) {
    var transform = getTransform();
    var usePokeSprites = appState.snapshot.config && appState.snapshot.config.enablePokeapiSprites;

    for (var i = 0; i < agents.length; i++) {
      var agent = agents[i];
      var entity = appState.entityById.get(agent.agentId);
      if (!entity) continue;

      var anim = animations.get(agent.agentId);
      if (anim && anim.type === 'spawn' && (performance.now() - anim.startTime) < SPAWN_DURATION_MS) continue;

      var sx = transform.offsetX + Math.round(entity.x) * transform.scale;
      var sy = transform.offsetY + Math.round(entity.y) * transform.scale;
      var drawSizePx = agentDrawSize(agent) * transform.scale;
      var isSubagent = !!agent.parentId;
      var isSleep = agent.isSleeping || !agent.isActive;
      var spriteUrl = null;

      if (isSubagent) {
        spriteUrl = isSleep ? pokemonStaticIconUrl(agent) : pokemonIconUrl(agent);
      } else if (usePokeSprites) {
        spriteUrl = pokeProvider.getSpriteUrl(agent, isSleep);
      }

      if (spriteUrl) {
        var img = await loadExportImage(spriteUrl);
        if (img) {
          ctx.drawImage(img, sx, sy, drawSizePx, drawSizePx);
        }
      }

      if (!isSubagent) {
        drawExportBadge(ctx, sx + drawSizePx * 0.5, sy - 4, rootAgentBadge(agent));
      }

      if (isSleep) {
        var zzzPhase = now / 1100 + (Math.abs(hashCode(agent.agentId)) % 628) / 100;
        var zzzOffsetX = Math.sin(zzzPhase) * 2.6;
        var zzzOffsetY = Math.cos(zzzPhase * 0.82) * 1.8;
        drawExportSleepMarker(ctx, sx + drawSizePx * 0.68 + zzzOffsetX, sy + drawSizePx * 0.18 + zzzOffsetY);
      }
    }
  }

  async function downloadPromoScenePng() {
    var agents = filteredAgents();
    var exportCanvas = document.createElement('canvas');
    exportCanvas.width = canvas.width * PROMO_EXPORT_SCALE;
    exportCanvas.height = canvas.height * PROMO_EXPORT_SCALE;
    var exportCtx = exportCanvas.getContext('2d');
    exportCtx.imageSmoothingEnabled = false;
    exportCtx.scale(PROMO_EXPORT_SCALE, PROMO_EXPORT_SCALE);
    exportCtx.drawImage(canvas, 0, 0);
    await drawExportOverlay(exportCtx, agents, performance.now());

    var blob = await new Promise(function (resolve) {
      exportCanvas.toBlob(resolve, 'image/png');
    });
    if (!blob) {
      throw new Error('PNG export failed');
    }
    var stamp = new Date().toISOString().replace(/[:.]/g, '-');
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = 'promo-scene-' + stamp + '.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function composeToScreen() {
    screenCtx.setTransform(1, 0, 0, 1, 0, 0);
    screenCtx.imageSmoothingEnabled = false;
    screenCtx.drawImage(worldCanvas, 0, 0);
  }

  function render(now) {
    updateEntityMotion(now);
    drawBackground();
    const agents = filteredAgents();
    drawConnections(agents);
    drawAgents(agents, now);
    drawAnimations(agents, now);
    composeToScreen();
    renderOverlay(agents, now);
    requestAnimationFrame(render);
  }

  async function connectStateTransport() {
    return transport.connect(function (snapshot) {
      applySnapshot(snapshot);
    });
  }

  function bindUi() {
    if (actionConfirmEl) {
      actionConfirmEl.addEventListener('click', function () {
        closeActionDialog(true);
      });
    }
    if (actionCancelEl) {
      actionCancelEl.addEventListener('click', function () {
        closeActionDialog(false);
      });
    }
    if (actionBackdropEl) {
      actionBackdropEl.addEventListener('click', function () {
        closeActionDialog(false);
      });
    }
    // Map sprite hover → tooltip
    function updateMapTooltipForSprite(sprite) {
      if (!sprite) {
        scheduleMapTooltipHide();
        return;
      }
      cancelPendingMapTooltipHide();
      var agentId = sprite.getAttribute('data-agent-id');
      var agents = (appState.snapshot && appState.snapshot.agents) || [];
      var agent = null;
      for (var i = 0; i < agents.length; i++) {
        if (agents[i].agentId === agentId) { agent = agents[i]; break; }
      }
      if (agent) showMapTooltipSummary(agent, sprite.getBoundingClientRect());
      else scheduleMapTooltipHide();
    }

    overlayEl.addEventListener('mouseover', function (e) {
      updateMapTooltipForSprite(e.target.closest('.agent-sprite[data-agent-id]'));
    });
    overlayEl.addEventListener('mousemove', function (e) {
      updateMapTooltipForSprite(e.target.closest('.agent-sprite[data-agent-id]'));
    });
    overlayEl.addEventListener('mouseout', function (e) {
      var related = e.relatedTarget;
      if (!related || !related.closest || (!related.closest('.agent-sprite[data-agent-id]') && !related.closest('.map-tooltip'))) {
        scheduleMapTooltipHide();
      }
    });
    // overlayEl has pointer-events:none so mouseleave on it never fires.
    // Instead listen on the parent canvas-area and the canvas itself.
    var canvasAreaEl = overlayEl.parentElement;
    canvasAreaEl.addEventListener('mouseleave', function (e) {
      var related = e.relatedTarget;
      if (related && related.closest && related.closest('.map-tooltip')) return;
      scheduleMapTooltipHide();
    });
    document.addEventListener('mousemove', function (e) {
      if (mapTooltipEl.style.display !== 'block') return;
      var target = e.target;
      if (target && target.closest) {
        if (target.closest('.map-tooltip')) {
          cancelPendingMapTooltipHide();
          return;
        }
        if (target.closest('.agent-sprite[data-agent-id]')) {
          cancelPendingMapTooltipHide();
          return;
        }
      }
      scheduleMapTooltipHide(mapTooltipBridgeDelay);
    });
    if (promoStudioToggleEl) {
      promoStudioToggleEl.addEventListener('click', function () {
        if (!promoStudioAvailable()) return;
        uiState.promoStudioOpen = !uiState.promoStudioOpen;
        renderPromoStudio();
      });
    }
    if (promoStudioCloseEl) {
      promoStudioCloseEl.addEventListener('click', function () {
        uiState.promoStudioOpen = false;
        renderPromoStudio();
      });
    }
    if (promoStudioEnabledEl) {
      promoStudioEnabledEl.addEventListener('change', function () {
        uiState.promoStudioEnabled = !!promoStudioEnabledEl.checked;
        promoStudioState.enabled = uiState.promoStudioEnabled;
        savePromoStudioState();
        syncVisibleSnapshot();
        renderPromoStudio();
      });
    }
    if (promoAddRootEl) {
      promoAddRootEl.addEventListener('click', function () {
        promoStudioState.roots.push(createPromoRoot());
        syncPromoStudioState();
      });
    }
    if (promoResetEl) {
      promoResetEl.addEventListener('click', function () {
        if (!window.confirm(t('promoResetPrompt'))) return;
        promoStudioState = createDefaultPromoStudioState();
        promoStudioState.enabled = uiState.promoStudioEnabled;
        resetPromoBoxState();
        resetPromoPokedexState();
        syncPromoStudioState();
      });
    }
    if (promoExportEl) {
      promoExportEl.addEventListener('click', async function () {
        promoExportEl.disabled = true;
        try {
          await downloadPromoScenePng();
        } catch (err) {
          window.alert(err.message);
        } finally {
          promoExportEl.disabled = false;
        }
      });
    }
    if (promoStudioListEl) {
      promoStudioListEl.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-action]');
        if (!btn) return;
        var action = btn.getAttribute('data-action');
        var rootId = btn.getAttribute('data-root-id');
        var subId = btn.getAttribute('data-sub-id');
        var root = findPromoRoot(rootId);
        if (!root) return;

        if (action === 'add-subagent') {
          root.subagents.push(createPromoSubagent(root.pokemonId));
          syncPromoStudioState();
          return;
        }
        if (action === 'box-root') {
          boxPromoRoot(rootId);
          return;
        }
        if (action === 'remove-root') {
          promoStudioState.roots = promoStudioState.roots.filter(function (item) { return item.id !== rootId; });
          syncPromoStudioState();
          return;
        }
        if (action === 'remove-subagent') {
          root.subagents = root.subagents.filter(function (item) { return item.id !== subId; });
          syncPromoStudioState();
        }
      });

      promoStudioListEl.addEventListener('change', function (e) {
        var fieldEl = e.target.closest('[data-field]');
        if (!fieldEl) return;
        updatePromoUnitField(
          fieldEl.getAttribute('data-root-id'),
          fieldEl.getAttribute('data-sub-id'),
          fieldEl.getAttribute('data-field'),
          fieldEl.value
        );
      });
    }

    if (areaFilterEl) {
      areaFilterEl.addEventListener('change', function () {
        setAreaFilter(areaFilterEl.value);
      });
    }
    if (hardResetBtnEl) {
      hardResetBtnEl.addEventListener('click', async function () {
        var config = (appState.snapshot && appState.snapshot.config) || {};
        if (!config.supportsHardReset) return;
        var mode = config.mode || (config.isMockMode ? 'mock' : 'watch');
        var source = config.source && config.source !== mode ? '/' + config.source : '';
        if (!window.confirm(t('hardResetPrompt', { mode: mode, source: source }))) return;
        hardResetBtnEl.disabled = true;
        try {
          var res = await transport.hardReset();
          if (res && res.ok === false) {
            throw new Error(t('hardResetFailed', { status: res.status }));
          }
          resetFilters();
          renderAgentList();
          tokenTotalEl.textContent = formatTokenCount(filteredTokenTotal(filteredAgents()));
        } catch (err) {
          window.alert(err.message);
        } finally {
          hardResetBtnEl.disabled = false;
        }
      });
    }
    async function handleAdoptAgentButton(btn) {
      if (!btn || btn.disabled) return;
      var agentId = btn.getAttribute('data-agent-id');
      if (!agentId) return;
      var agent = (appState.agentById && appState.agentById.get(agentId)) || boxedAgentById(agentId);
      var costInfo = agent ? recruitCostForAgent(agent) : {
        pokemonId: Number(btn.getAttribute('data-pokemon-id')) || null,
        pokemonName: t('pokemon'),
        pointCost: Number(btn.getAttribute('data-point-cost')) || 0
      };
      var currentPoints = currentItemPointBalance();
      var visual = {
        type: 'recruit',
        pokemonId: costInfo.pokemonId,
        name: costInfo.pokemonName,
        currentPoints: currentPoints,
        pointCost: costInfo.pointCost,
        afterPoints: currentPoints - costInfo.pointCost,
        discovered: costInfo.discovered,
        caught: costInfo.caught,
        discount: costInfo.discount,
        label: t('recruitCost')
      };
      var promptText = t('recruitPrompt', { pokemon: costInfo.pokemonName, cost: costInfo.pointCost });
      if (!(await confirmActionPopup(
        promptText,
        promptText,
        {
          visual: visual,
          message: promptText
        }
      ))) return;

      btn.disabled = true;
      var result = await readActionResult(transport.owned('adopt', { agentId: agentId, speciesId: costInfo.pokemonId }));
      if (!result || !result.ok) {
        showActionPopup(t('recruitResult'), t('recruitResult'), actionErrorMessage(result), actionErrorMessage(result), { isError: true });
        btn.disabled = false;
        return;
      }
      applyOwnedPokemonActionResult(result);
      var spent = result.recruitCost && Number(result.recruitCost.pointCost) ? Number(result.recruitCost.pointCost) : costInfo.pointCost;
      var recruitedSpeciesId = result.pokemon && validPokemonId(result.pokemon.speciesId)
        ? result.pokemon.speciesId
        : costInfo.pokemonId;
      var recruitedName = recruitedSpeciesId ? pokemonDisplayName(recruitedSpeciesId) : costInfo.pokemonName;
      var recruitMessage = recruitedPokemonText(recruitedName);
      showActionPopup(
        t('recruitResult'),
        t('recruitResult'),
        recruitMessage,
        recruitMessage,
        {
          visual: { type: 'points', value: '-' + spent + ' pts', label: t('spent') },
          messageHtml: actionResultRowsHtml({
            text: recruitMessage,
            iconUrl: recruitedSpeciesId ? spriteUrl('icon', recruitedSpeciesId, 'png') : '',
            iconClass: 'pokemon',
            tone: 'recruited'
          }, {
            catchRewardSource: result
          })
        }
      );
    }

    agentListEl.addEventListener('click', async function (e) {
      var btn = e.target.closest('[data-action="box"]');
      if (btn) {
        e.stopPropagation();
        var agentId = btn.getAttribute('data-agent-id');
        var promoAgent = appState.agentById && appState.agentById.get(agentId);
        if (promoAgent && promoAgent.isPromoCustom) {
          if (!promoAgent.parentId) {
            boxPromoRoot(agentId);
          }
          return;
        }
        transport.box(agentId);
        return;
      }
      btn = e.target.closest('[data-action="toggle-subtree"]');
      if (btn) {
        e.stopPropagation();
        var toggleAgentId = btn.getAttribute('data-agent-id');
        var toggleDepth = parseInt(btn.getAttribute('data-depth') || '0', 10);
        if (toggleAgentId) {
          var liveAgents = (appState.snapshot && appState.snapshot.agents) || [];
          var toggleAgent = null;
          for (var i = 0; i < liveAgents.length; i++) {
            if (liveAgents[i].agentId === toggleAgentId) {
              toggleAgent = liveAgents[i];
              break;
            }
          }
          var currentChildCount = toggleAgent && Array.isArray(toggleAgent.childrenIds) ? toggleAgent.childrenIds.length : 0;
          var currentlyCollapsed = isSubtreeCollapsed(toggleAgentId, Number.isFinite(toggleDepth) ? toggleDepth : 0, currentChildCount, uiState.collapsedSubtrees);
          uiState.collapsedSubtrees[toggleAgentId] = !currentlyCollapsed;
          renderAgentList();
        }
        return;
      }
      btn = e.target.closest('[data-action="open-subhistory"]');
      if (btn) {
        e.stopPropagation();
        setSubhistoryOpen(true, btn.getAttribute('data-agent-id'));
        renderSubhistoryModal();
        return;
      }
      btn = e.target.closest('[data-action="adopt-agent"]');
      if (btn) {
        e.stopPropagation();
        await handleAdoptAgentButton(btn);
        return;
      }
      var card = e.target.closest('.poke-slot');
      if (card) card.classList.toggle('expanded');
    });
    async function handleUnboxClick(e) {
      var btn = e.target.closest('[data-action="unbox"]');
      if (btn) {
        e.stopPropagation();
        var agentId = btn.getAttribute('data-agent-id');
        var boxedAgent = boxedAgentById(agentId);
        if (boxedAgent && boxedAgent.isPromoCustom) {
          unboxPromoRoot(agentId);
          return;
        }
        transport.unbox(agentId);
        return;
      }
      btn = e.target.closest('[data-action="adopt-agent"]');
      if (btn) {
        e.stopPropagation();
        await handleAdoptAgentButton(btn);
        return;
      }
      btn = e.target.closest('[data-action="open-subhistory"]');
      if (btn) {
        e.stopPropagation();
        setSubhistoryOpen(true, btn.getAttribute('data-agent-id'));
        renderSubhistoryModal();
      }
    }

    function updateBoxTooltipForItem(item) {
      if (!item) {
        hideBoxTooltip();
        return;
      }
      var agentId = item.getAttribute('data-agent-id');
      var boxedAgent = agentId ? boxedAgentById(agentId) : null;
      if (boxedAgent) {
        showBoxTooltipSummary(boxedAgent, item.getBoundingClientRect());
      } else {
        hideBoxTooltip();
      }
    }

    function bindBoxInteractions(rootEl) {
      rootEl.addEventListener('click', handleUnboxClick);
      rootEl.addEventListener('mouseenter', function (e) {
        updateBoxTooltipForItem(e.target.closest('.box-item'));
      }, true);
      rootEl.addEventListener('mouseleave', function (e) {
        if (e.target.closest('.box-item')) {
          hideBoxTooltip();
        }
      }, true);
      rootEl.addEventListener('mouseover', function (e) {
        updateBoxTooltipForItem(e.target.closest('.box-item'));
      });
      rootEl.addEventListener('mouseout', function (e) {
        var related = e.relatedTarget;
        if (!related || !related.closest || !related.closest('.box-item')) {
          hideBoxTooltip();
        }
      });
    }

    bindBoxInteractions(boxListEl);
    bindBoxInteractions(boxHistoryGridEl);
    subhistoryGridEl.addEventListener('mouseover', function (e) {
      var card = e.target.closest('.subhistory-lineage-card[data-subhistory-key]');
      if (!card) return;
      var key = card.getAttribute('data-subhistory-key');
      showSubhistoryTooltip(appState.subhistoryEntryByKey.get(key), card.getBoundingClientRect());
    });
    subhistoryGridEl.addEventListener('mouseout', function (e) {
      var card = e.target.closest('.subhistory-lineage-card[data-subhistory-key]');
      if (!card) {
        var related = e.relatedTarget;
        if (!related || !subhistoryGridEl.contains(related)) hideSubhistoryTooltip();
        return;
      }
      var related = e.relatedTarget;
      if (related && related.closest && related.closest('.subhistory-lineage-card[data-subhistory-key]') === card) {
        return;
      }
      hideSubhistoryTooltip();
    });
    subhistoryGridEl.addEventListener('mouseleave', function () {
      hideSubhistoryTooltip();
    });
    boxHistoryToggleEl.addEventListener('click', function () {
      setBoxHistoryOpen(true);
    });
    boxHistoryCloseEl.addEventListener('click', function () {
      setBoxHistoryOpen(false);
    });
    boxHistoryBackdropEl.addEventListener('click', function () {
      setBoxHistoryOpen(false);
    });
    subhistoryCloseEl.addEventListener('click', function () {
      setSubhistoryOpen(false);
    });
    subhistoryBackdropEl.addEventListener('click', function () {
      setSubhistoryOpen(false);
    });
    pokedexToggleEl.addEventListener('click', function () {
      setPokedexOpen(true);
    });
    ownedToggleEl.addEventListener('click', function () {
      setOwnedOpen(true);
    });
    ownedRecruitToggleEl.addEventListener('click', function () {
      setOwnedRecruitOpen(true);
    });
    ownedRecruitCloseEl.addEventListener('click', function () {
      setOwnedRecruitOpen(false);
    });
    ownedRecruitAvailableEl.addEventListener('click', function () {
      setOwnedRecruitMode('available');
    });
    ownedRecruitPokedexEl.addEventListener('click', function () {
      setOwnedRecruitMode('pokedex');
    });
    ownedCloseEl.addEventListener('click', function () {
      setOwnedOpen(false);
    });
    ownedBackdropEl.addEventListener('click', function () {
      setOwnedOpen(false);
    });
    if (ownedItemInfoEl) {
      ownedItemInfoEl.addEventListener('click', function (e) {
        e.stopPropagation();
        setOwnedItemInfoOpen(ownedItemInfoPopoverEl ? ownedItemInfoPopoverEl.hidden : true);
      });
    }
    if (ownedItemInfoPopoverEl) {
      ownedItemInfoPopoverEl.addEventListener('click', function (e) {
        e.stopPropagation();
        var actionBtn = e.target.closest('[data-item-rules-action]');
        if (!actionBtn || !ownedItemInfoPopoverEl.contains(actionBtn)) return;
        e.preventDefault();
        if (actionBtn.getAttribute('data-item-rules-action') === 'toggle-chances') {
          var chancePopover = ownedItemInfoPopoverEl.querySelector('[data-item-rules-chances]');
          setOwnedItemChanceOpen(chancePopover ? chancePopover.hidden : true);
        } else {
          setOwnedItemChanceOpen(false);
        }
      });
    }
    ownedModalEl.addEventListener('click', function (e) {
      if (!ownedItemInfoPopoverEl || ownedItemInfoPopoverEl.hidden) return;
      if (e.target.closest('#owned-item-info') || e.target.closest('#owned-item-info-popover')) return;
      setOwnedItemInfoOpen(false);
    });
    async function handleOwnedClick(e) {
      var btn = e.target.closest('[data-owned-action]');
      if (!btn) return;
      e.stopPropagation();
      var action = btn.getAttribute('data-owned-action');
      var id = btn.getAttribute('data-owned-id');
      if (!id) return;
      if (action === 'nickname') {
        var current = '';
        var owned = appState.snapshot.ownedPokemon || [];
        for (var i = 0; i < owned.length; i++) {
          if (owned[i].id === id) {
            current = owned[i].nickname || '';
            break;
          }
        }
        var nickname = window.prompt(t('nicknamePrompt'), current);
        if (nickname === null) return;
        transport.owned('nickname', { id: id, nickname: nickname });
      } else if (action === 'party') {
        transport.owned('party', { id: id });
      } else if (action === 'box') {
        transport.owned('box', { id: id });
      } else if (action === 'evolve') {
        var evolvingPokemon = ownedPokemonByOwnedId(id);
        var evolutionInfo = ownedEvolutionInfo(evolvingPokemon);
        var targetSpeciesId = null;
        var ownedRoot = btn.closest('[data-owned-id]');
        var targetSelect = ownedRoot ? ownedRoot.querySelector('[data-owned-field="evolution-target"]') : null;
        if (targetSelect && targetSelect.value) {
          targetSpeciesId = parseInt(targetSelect.value, 10) || null;
        } else if (evolutionInfo && evolutionInfo.nextSpeciesId) {
          targetSpeciesId = evolutionInfo.nextSpeciesId;
        }
        var fromLabel = ownedDisplayName(evolvingPokemon);
        var selectedEvolution = selectedEvolutionOption(evolutionInfo, targetSpeciesId);
        var evolutionItemId = selectedEvolution && selectedEvolution.itemId ? selectedEvolution.itemId : null;
        var toLabel = targetSpeciesId ? pokemonDisplayName(targetSpeciesId) : t('selectedEvolution');
        var evolvePrompt = t('evolvePrompt', { from: fromLabel, to: toLabel });
        if (!(await confirmActionPopup(
          evolvePrompt,
          evolvePrompt
        , {
          visual: {
            type: 'evolution',
            beforeSpeciesId: evolvingPokemon && evolvingPokemon.speciesId,
            beforeName: fromLabel,
            afterSpeciesId: targetSpeciesId,
            afterName: toLabel,
            itemId: evolutionItemId
          }
        }))) return;
        var evolveResult = await readActionResult(transport.owned('evolve', { id: id, targetSpeciesId: targetSpeciesId }));
        showEvolutionActionResult(evolveResult, evolvingPokemon, targetSpeciesId, evolutionItemId);
      } else if (action === 'holdEvolution') {
        transport.owned('holdEvolution', { id: id, held: btn.getAttribute('data-held') === 'true' });
      } else if (action === 'release') {
        var target = null;
        var releasedOwned = appState.snapshot.ownedPokemon || [];
        for (var j = 0; j < releasedOwned.length; j++) {
          if (releasedOwned[j].id === id) {
            target = releasedOwned[j];
            break;
          }
        }
        var label = target ? ownedDisplayName(target) : t('thisPokemon');
        if (!window.confirm(t('releasePrompt', { pokemon: label }))) return;
        transport.owned('release', { id: id });
      }
    }
    ownedPartyGridEl.addEventListener('click', handleOwnedClick);
    ownedBoxGridEl.addEventListener('click', handleOwnedClick);
    if (ownedItemPullEl) {
      ownedItemPullEl.addEventListener('click', async function () {
        var result = await readActionResult(transport.items('pull', {}));
        showDrawActionResult(result);
      });
    }
    if (ownedItemSellEl) {
      ownedItemSellEl.addEventListener('click', async function () {
        if (!uiState.selectedEvolutionItemId) return;
        var itemState = evolutionItemState();
        var value = itemState.itemSellPointValue || 10;
        var itemName = evolutionItemLabel(uiState.selectedEvolutionItemId);
        var sellPrompt = t('sellPrompt', { item: itemName, value: value });
        if (!(await confirmActionPopup(
          sellPrompt,
          sellPrompt
        , {
          visual: {
            type: 'item',
            itemId: uiState.selectedEvolutionItemId,
            name: itemName,
            label: t('sell'),
            detail: '+' + value + ' pts'
          }
        }))) return;
        var result = await readActionResult(transport.items('sell', { itemId: uiState.selectedEvolutionItemId }));
        showItemActionResult('sell', result, uiState.selectedEvolutionItemId);
      });
    }
    if (ownedItemClaimPickupEl) {
      ownedItemClaimPickupEl.addEventListener('click', async function () {
        var itemState = evolutionItemState();
        if (!itemState.pickupItemId) return;
        var cost = itemState.itemClaimTicketCost || itemState.itemBuyPickupPointCost || 20;
        var itemName = evolutionItemLabel(itemState.pickupItemId);
        var claimPrompt = t('claimPrompt', { item: itemName, cost: cost });
        if (!(await confirmActionPopup(
          claimPrompt,
          claimPrompt
        , {
          visual: {
            type: 'item',
            itemId: itemState.pickupItemId,
            name: itemName,
            label: t('claimTarget'),
            detail: cost + ' tickets'
          }
        }))) return;
        var result = await readActionResult(transport.items('buy', { itemId: itemState.pickupItemId, currency: 'ticket' }));
        showItemActionResult('claim', result, itemState.pickupItemId);
      });
    }
    if (ownedPickupSelectEl) {
      ownedPickupSelectEl.addEventListener('change', function () {
        transport.items('pickup', { itemId: ownedPickupSelectEl.value || null });
      });
    }
    if (ownedItemInventoryEl) {
      ownedItemInventoryEl.addEventListener('click', async function (e) {
        var itemBtn = e.target.closest('[data-item-id]');
        if (!itemBtn) return;
        var itemId = itemBtn.getAttribute('data-item-id');
        uiState.selectedEvolutionItemId = itemId;
        renderEvolutionItemPanel();
        var itemState = evolutionItemState();
        var inventory = itemState.inventory || {};
        if (itemBtn.getAttribute('data-item-kind') !== 'recruit-ticket' || (inventory[itemId] || 0) <= 0) {
          return;
        }
        var ticketName = evolutionItemLabel(itemId);
        var prompt = t('useTicketPrompt', { ticket: ticketName });
        if (!(await confirmActionPopup(
          prompt,
          prompt,
          {
            visual: {
              type: 'item',
              itemId: itemId,
              name: ticketName,
              label: t('use')
            },
            message: prompt
          }
        ))) return;
        var result = await readActionResult(transport.items('use-ticket', { itemId: itemId }));
        showTicketUseActionResult(result, itemId);
      });
    }
    ownedBoxGridEl.addEventListener('click', function (e) {
      if (e.target.closest('button, select, input, textarea, a')) return;
      var tile = e.target.closest('.owned-box-tile');
      if (!tile || !ownedBoxGridEl.contains(tile)) return;
      e.stopPropagation();
      var willOpen = !tile.classList.contains('popover-open');
      ownedBoxGridEl.querySelectorAll('.owned-box-tile.popover-open').forEach(function (el) {
        el.classList.remove('popover-open');
      });
      tile.classList.toggle('popover-open', willOpen);
    });
    ownedBoxGridEl.addEventListener('mouseover', function (e) {
      var tile = e.target.closest('.owned-box-tile');
      if (!tile || !ownedBoxGridEl.contains(tile)) return;
      if (uiState.ownedBoxPopoverTimer) {
        clearTimeout(uiState.ownedBoxPopoverTimer);
        uiState.ownedBoxPopoverTimer = null;
      }
      ownedBoxGridEl.querySelectorAll('.owned-box-tile.popover-open').forEach(function (el) {
        if (el !== tile) el.classList.remove('popover-open');
      });
      tile.classList.add('popover-open');
    });
    ownedBoxGridEl.addEventListener('mouseout', function (e) {
      var tile = e.target.closest('.owned-box-tile');
      if (!tile || !ownedBoxGridEl.contains(tile)) return;
      var related = e.relatedTarget;
      if (related && tile.contains(related)) return;
      if (uiState.ownedBoxPopoverTimer) clearTimeout(uiState.ownedBoxPopoverTimer);
      uiState.ownedBoxPopoverTimer = setTimeout(function () {
        tile.classList.remove('popover-open');
        uiState.ownedBoxPopoverTimer = null;
      }, 260);
    });
    ownedRecruitGridEl.addEventListener('click', async function (e) {
      var btn = e.target.closest('[data-owned-action="recruit-species"]');
      if (!btn) return;
      e.stopPropagation();
      var pokemonId = parseInt(btn.getAttribute('data-pokemon-id'), 10);
      if (!pokemonId) return;
      var status = pokedexStatusForPokemon(pokemonId, null, pokedexCaughtSpeciesLookup());
      var discovered = status !== 'undiscovered';
      var caught = status === 'caught';
      var costInfo = recruitCostForPokemon(pokemonId, discovered, caught);
      var pokemonName = pokemonDisplayName(pokemonId);
      var currentPoints = currentItemPointBalance();
      var recruitPrompt = t('recruitPrompt', { pokemon: pokemonName, cost: costInfo.pointCost });
      if (!(await confirmActionPopup(
        recruitPrompt,
        recruitPrompt
      , {
        message: recruitPrompt,
        visual: {
          type: 'recruit',
          pokemonId: pokemonId,
          name: pokemonName,
          currentPoints: currentPoints,
          pointCost: costInfo.pointCost,
          afterPoints: currentPoints - costInfo.pointCost,
          discovered: discovered,
          caught: costInfo.caught,
          discount: costInfo.discount,
          label: t('recruitCost')
        }
      }))) return;
      var result = await readActionResult(transport.owned('adopt', { speciesId: pokemonId, inParty: false }));
      if (!result || !result.ok) {
        showActionPopup(t('recruitResult'), t('recruitResult'), actionErrorMessage(result), actionErrorMessage(result));
        return;
      }
      applyOwnedPokemonActionResult(result);
      var resultSpeciesId = result.pokemon && validPokemonId(result.pokemon.speciesId)
        ? result.pokemon.speciesId
        : pokemonId;
      var resultPokemonName = resultSpeciesId ? pokemonDisplayName(resultSpeciesId) : pokemonName;
      var recruitMessage = recruitedPokemonText(resultPokemonName);
      showActionPopup(t('recruitResult'), t('recruitResult'), recruitMessage, recruitMessage, {
        messageHtml: actionResultRowsHtml({
          text: recruitMessage,
          iconUrl: resultSpeciesId ? spriteUrl('icon', resultSpeciesId, 'png') : '',
          iconClass: 'pokemon',
          tone: 'recruited'
        }, {
          catchRewardSource: result
        })
      });
      setOwnedRecruitOpen(false);
    });
    function handleOwnedChange(e) {
      var field = e.target.closest('[data-owned-field]');
      if (!field) return;
      var id = field.getAttribute('data-owned-id');
      if (field.getAttribute('data-owned-field') === 'project') {
        transport.owned('assignProject', { id: id, projectId: field.value });
      }
    }
    ownedPartyGridEl.addEventListener('change', handleOwnedChange);
    ownedBoxGridEl.addEventListener('change', handleOwnedChange);
    ownedPartyGridEl.addEventListener('dragstart', function (e) {
      var card = e.target.closest('.owned-party-card[data-owned-id]');
      if (!card) return;
      uiState.draggedOwnedId = card.getAttribute('data-owned-id');
      card.classList.add('dragging');
      if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', uiState.draggedOwnedId);
      }
    });
    ownedPartyGridEl.addEventListener('dragover', function (e) {
      var target = e.target.closest('[data-owned-drop-slot]');
      if (!target || !uiState.draggedOwnedId) return;
      e.preventDefault();
      target.classList.add('drag-over');
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
    });
    ownedPartyGridEl.addEventListener('dragleave', function (e) {
      var target = e.target.closest('[data-owned-drop-slot]');
      if (target) target.classList.remove('drag-over');
    });
    ownedPartyGridEl.addEventListener('drop', function (e) {
      var target = e.target.closest('[data-owned-drop-slot]');
      if (!target || !uiState.draggedOwnedId) return;
      e.preventDefault();
      var slot = parseInt(target.getAttribute('data-owned-drop-slot'), 10);
      if (Number.isInteger(slot)) {
        transport.owned('party', { id: uiState.draggedOwnedId, slot: slot });
      }
      ownedPartyGridEl.querySelectorAll('.drag-over').forEach(function (el) { el.classList.remove('drag-over'); });
    });
    ownedPartyGridEl.addEventListener('dragend', function () {
      uiState.draggedOwnedId = null;
      ownedPartyGridEl.querySelectorAll('.dragging, .drag-over').forEach(function (el) {
        el.classList.remove('dragging', 'drag-over');
      });
    });
    if (ownedStripGridEl) {
      ownedStripGridEl.addEventListener('click', function () {
        setOwnedOpen(true);
      });
    }
    pokedexCloseEl.addEventListener('click', function () {
      setPokedexOpen(false);
    });
    pokedexBackdropEl.addEventListener('click', function () {
      setPokedexOpen(false);
    });
    if (pokedexTabEntriesEl) {
      pokedexTabEntriesEl.addEventListener('click', function () {
        setPokedexTab('entries');
      });
    }
    if (pokedexTabRewardsEl) {
      pokedexTabRewardsEl.addEventListener('click', function () {
        setPokedexTab('rewards');
      });
    }
    if (pokedexSortEl) {
      pokedexSortEl.addEventListener('change', function () {
        setPokedexSort(pokedexSortEl.value);
      });
    }
    if (pokedexCategoryControlEl) {
      pokedexCategoryControlEl.addEventListener('click', function (event) {
        var option = event.target.closest('[data-pokedex-category]');
        if (!option || !pokedexCategoryControlEl.contains(option)) return;
        setPokedexCategory(option.getAttribute('data-pokedex-category'));
      });
    }
    if (pokedexLangButtonEl) {
      pokedexLangButtonEl.addEventListener('click', function (event) {
        event.stopPropagation();
        setPokedexLanguageMenu(!uiState.pokedexLanguageMenuOpen);
      });
    }
    if (pokedexLangOptionsEl) {
      pokedexLangOptionsEl.addEventListener('click', function (event) {
        var option = event.target.closest('[data-pokedex-language]');
        if (!option) return;
        event.preventDefault();
        event.stopPropagation();
        setPokedexLanguage(option.getAttribute('data-pokedex-language'));
      });
    }
    document.addEventListener('click', function () {
      if (uiState.pokedexLanguageMenuOpen) setPokedexLanguageMenu(false);
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && uiState.pokedexLanguageMenuOpen) setPokedexLanguageMenu(false);
    });
    if (pokedexRewardsPanelEl) {
      pokedexRewardsPanelEl.addEventListener('click', async function (e) {
        var btn = e.target.closest('[data-pokedex-action="claim-reward"]');
        if (!btn) return;
        e.preventDefault();
        var rewardType = btn.getAttribute('data-reward-type');
        var rewardId = btn.getAttribute('data-reward-id');
        if (!rewardType || !rewardId) return;
        var originalText = btn.textContent;
        btn.disabled = true;
        btn.textContent = t('pokedexRewardClaiming');
        var result = null;
        try {
          result = await readActionResult(transport.pokedex('claim', { rewardType: rewardType, id: rewardId }));
        } catch (err) {
          result = { ok: false, error: err && err.message ? err.message : t('pokedexRewardClaimFailed') };
        } finally {
          if (btn.isConnected) {
            btn.disabled = false;
            btn.textContent = originalText;
          }
        }
        if (result && result.ok) {
          applyPokedexRewardClaimResult(result);
          var reward = result.reward || {};
          var effects = pokedexRewardEffects(reward).join(', ');
          var rewardTitleType = rewardType === 'area' ? 'area' : (rewardType === 'seen' || rewardType === 'encounter' ? 'seen' : 'catch');
          var rewardName = pokedexRewardTitle(reward, rewardTitleType);
          var message = t('pokedexClaimedReward', { reward: rewardName }) + (effects ? ' ' + effects + '.' : '');
          var ticketPokemon = firstTicketResultPokemon(result);
          if (ticketPokemon) {
            message += ' ' + t('recruitedPokemon', { pokemon: pokemonDisplayName(ticketPokemon.speciesId) });
          }
          showActionPopup(t('pokedexClaimResult'), t('pokedexClaimResult'), message, message, {
            visual: pokedexRewardPopupVisual(reward)
          });
          renderPokedex();
        } else {
          var errorMessage = result && result.error ? result.error : t('pokedexRewardClaimFailed');
          showActionPopup(t('pokedexClaimResult'), t('pokedexClaimResult'), errorMessage, errorMessage, { isError: true });
          renderPokedex();
        }
      });
    }
    pokedexGridEl.addEventListener('mouseover', function (e) {
      var cell = e.target.closest('.pokedex-cell[data-pokemon-id]');
      if (!cell) return;
      var pokemonId = parseInt(cell.getAttribute('data-pokemon-id'), 10);
      if (!pokemonId) return;
      showPokedexTooltip(pokemonId, cell.getBoundingClientRect());
    });
    pokedexGridEl.addEventListener('mouseout', function (e) {
      var cell = e.target.closest('.pokedex-cell[data-pokemon-id]');
      if (!cell) {
        var related = e.relatedTarget;
        if (!related || !pokedexGridEl.contains(related)) hidePokedexTooltip();
        return;
      }
      var related = e.relatedTarget;
      if (related && related.closest && related.closest('.pokedex-cell[data-pokemon-id]') === cell) {
        return;
      }
      hidePokedexTooltip();
    });
    pokedexGridEl.addEventListener('mouseleave', function () {
      hidePokedexTooltip();
    });
    window.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (actionModalEl && !actionModalEl.hidden) {
        closeActionDialog(false);
        return;
      }
      if (uiState.ownedRecruitOpen) {
        setOwnedRecruitOpen(false);
        return;
      }
      if (uiState.boxHistoryOpen) {
        setBoxHistoryOpen(false);
        return;
      }
      if (uiState.subhistoryOpen) {
        setSubhistoryOpen(false);
        hideSubhistoryTooltip();
        return;
      }
      if (uiState.pokedexOpen) {
        setPokedexOpen(false);
        return;
      }
      if (ownedItemInfoPopoverEl && !ownedItemInfoPopoverEl.hidden) {
        setOwnedItemInfoOpen(false);
        return;
      }
      if (uiState.ownedOpen) {
        setOwnedOpen(false);
        return;
      }
      if (uiState.promoStudioOpen) {
        uiState.promoStudioOpen = false;
        renderPromoStudio();
      }
    });
    window.addEventListener('resize', setCanvasSize);
  }

  async function boot() {
    bindUi();
    applyStaticTranslations();
    syncPokedexLanguageMenu();
    updateFilterOptions();
    setCanvasSize();
    try { await connectStateTransport(); } catch (e) {
      agentListEl.innerHTML = '<div class="agent-card">' + escapeHtml(t('failedToLoadState', { message: e.message })) + '</div>';
    }
    requestAnimationFrame(render);
  }

  boot();
})();
