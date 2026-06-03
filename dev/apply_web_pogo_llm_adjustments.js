#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SOURCE_151_PATH = path.join(
  ROOT,
  'dev',
  'data',
  'generated',
  'llm_habitat_rarity_judgement_001_151.json',
);
const LLM_251_PATH = path.join(
  ROOT,
  'dev',
  'data',
  'generated',
  'llm_habitat_rarity_judgement_001_251.json',
);

const TIER_LABELS = {
  1: 'Common',
  2: 'Uncommon',
  3: 'Rare',
  4: 'Very Rare',
  5: 'Legendary',
};

const EXTRA_ROWS = [
  { id: 152, name: 'chikorita', name_ko: '치코리타', llm_habitat: 'grassland', llm_tier: 2, memo_ko: '풀 스타터라 기본종 중엔 다소 희귀' },
  { id: 153, name: 'bayleef', name_ko: '베이리프', llm_habitat: 'grassland', llm_tier: 2, memo_ko: '스타터 중간형이나 GO 기준 보통' },
  { id: 154, name: 'meganium', name_ko: '메가니움', llm_habitat: 'grassland', llm_tier: 3, memo_ko: '스타터 최종형이라 희귀권 유지' },
  { id: 155, name: 'cyndaquil', name_ko: '브케인', llm_habitat: 'mountain', llm_tier: 2, memo_ko: '불꽃 스타터라 흔한 야생종은 아님' },
  { id: 156, name: 'quilava', name_ko: '마그케인', llm_habitat: 'mountain', llm_tier: 2, memo_ko: '불꽃 스타터 중간형, 관대하게 보통' },
  { id: 157, name: 'typhlosion', name_ko: '블레이범', llm_habitat: 'mountain', llm_tier: 3, memo_ko: '인기 불꽃 스타터 최종형' },
  { id: 158, name: 'totodile', name_ko: '리아코', llm_habitat: 'waters-edge', llm_tier: 2, memo_ko: '물 스타터라 기본종 중 다소 희귀' },
  { id: 159, name: 'croconaw', name_ko: '엘리게이', llm_habitat: 'waters-edge', llm_tier: 2, memo_ko: '물 스타터 중간형, GO 접근성 반영' },
  { id: 160, name: 'feraligatr', name_ko: '장크로다일', llm_habitat: 'waters-edge', llm_tier: 3, memo_ko: '강한 물 스타터 최종형' },
  { id: 161, name: 'sentret', name_ko: '꼬리선', llm_habitat: 'grassland', llm_tier: 1, memo_ko: '초반 초원 설치류라 흔함' },
  { id: 162, name: 'furret', name_ko: '다꼬리', llm_habitat: 'grassland', llm_tier: 1, memo_ko: '진화체지만 초반 흔한 계열' },
  { id: 163, name: 'hoothoot', name_ko: '부우부', llm_habitat: 'forest', llm_tier: 1, memo_ko: '밤 숲과 길목에 흔한 조류' },
  { id: 164, name: 'noctowl', name_ko: '야부엉', llm_habitat: 'forest', llm_tier: 1, memo_ko: '흔한 야행성 조류 진화체' },
  { id: 165, name: 'ledyba', name_ko: '레디바', llm_habitat: 'forest', llm_tier: 1, memo_ko: '초반 숲 벌레라 흔함' },
  { id: 166, name: 'ledian', name_ko: '레디안', llm_habitat: 'forest', llm_tier: 1, memo_ko: '벌레 진화체지만 GO식 관대 보정' },
  { id: 167, name: 'spinarak', name_ko: '페이검', llm_habitat: 'forest', llm_tier: 1, memo_ko: '초반 숲 거미 포켓몬' },
  { id: 168, name: 'ariados', name_ko: '아리아도스', llm_habitat: 'forest', llm_tier: 1, memo_ko: '거미 진화체지만 일반 야생 체감' },
  { id: 169, name: 'crobat', name_ko: '크로뱃', llm_habitat: 'cave', llm_tier: 2, memo_ko: '흔한 주뱃 계열의 친밀도 최종형' },
  { id: 170, name: 'chinchou', name_ko: '초라기', llm_habitat: 'sea', llm_tier: 1, memo_ko: '바다 낚시 전기어 기본종' },
  { id: 171, name: 'lanturn', name_ko: '랜턴', llm_habitat: 'sea', llm_tier: 2, memo_ko: '해양 진화체로 보통권' },
  { id: 172, name: 'pichu', name_ko: '피츄', llm_habitat: 'forest', llm_tier: 2, memo_ko: '아기 포켓몬이나 피카츄 계열 접근성 반영' },
  { id: 173, name: 'cleffa', name_ko: '삐', llm_habitat: 'mountain', llm_tier: 2, memo_ko: '달 이미지 아기 포켓몬' },
  { id: 174, name: 'igglybuff', name_ko: '푸푸린', llm_habitat: 'grassland', llm_tier: 1, memo_ko: '푸린 계열 아기 포켓몬, 관대 보정' },
  { id: 175, name: 'togepi', name_ko: '토게피', llm_habitat: 'forest', llm_tier: 2, memo_ko: '알 포켓몬 상징성으로 보통' },
  { id: 176, name: 'togetic', name_ko: '토게틱', llm_habitat: 'forest', llm_tier: 2, memo_ko: '토게피 진화체지만 이벤트 접근성 반영' },
  { id: 177, name: 'natu', name_ko: '네이티', llm_habitat: 'forest', llm_tier: 1, memo_ko: '숲과 유적 주변의 흔한 기본종' },
  { id: 178, name: 'xatu', name_ko: '네이티오', llm_habitat: 'forest', llm_tier: 2, memo_ko: '심령 조류 진화체로 보통' },
  { id: 179, name: 'mareep', name_ko: '메리프', llm_habitat: 'grassland', llm_tier: 1, memo_ko: '초원 양 포켓몬, GO 커뮤니티 접근성 높음' },
  { id: 180, name: 'flaaffy', name_ko: '보송송', llm_habitat: 'grassland', llm_tier: 1, memo_ko: '메리프 계열 중간형도 흔한 편' },
  { id: 181, name: 'ampharos', name_ko: '전룡', llm_habitat: 'grassland', llm_tier: 2, memo_ko: '인기 전기 최종형이나 관대 보정' },
  { id: 182, name: 'bellossom', name_ko: '아르코', llm_habitat: 'grassland', llm_tier: 2, memo_ko: '뚜벅쵸 분기 진화체라 보통' },
  { id: 183, name: 'marill', name_ko: '마릴', llm_habitat: 'waters-edge', llm_tier: 1, memo_ko: '물가에 흔한 물쥐 기본종' },
  { id: 184, name: 'azumarill', name_ko: '마릴리', llm_habitat: 'waters-edge', llm_tier: 2, memo_ko: '물가 진화체와 배틀 인식 반영' },
  { id: 185, name: 'sudowoodo', name_ko: '꼬지모', llm_habitat: 'grassland', llm_tier: 1, memo_ko: '고정 조우 이미지가 있지만 GO식으로 관대 보정' },
  { id: 186, name: 'politoed', name_ko: '왕구리', llm_habitat: 'waters-edge', llm_tier: 3, memo_ko: '왕의징표석 분기 진화체' },
  { id: 187, name: 'hoppip', name_ko: '통통코', llm_habitat: 'grassland', llm_tier: 1, memo_ko: '바람 타는 초원 흔한 기본종' },
  { id: 188, name: 'skiploom', name_ko: '두코', llm_habitat: 'grassland', llm_tier: 1, memo_ko: '통통코 계열 중간형도 흔함' },
  { id: 189, name: 'jumpluff', name_ko: '솜솜코', llm_habitat: 'grassland', llm_tier: 2, memo_ko: '최종형이나 흔한 초원 계열' },
  { id: 190, name: 'aipom', name_ko: '에이팜', llm_habitat: 'forest', llm_tier: 1, memo_ko: '나무 위 원숭이 기본종, GO식 관대 보정' },
  { id: 191, name: 'sunkern', name_ko: '해너츠', llm_habitat: 'grassland', llm_tier: 1, memo_ko: '낮은 종족값의 흔한 씨앗 포켓몬' },
  { id: 192, name: 'sunflora', name_ko: '해루미', llm_habitat: 'grassland', llm_tier: 1, memo_ko: '해너츠 진화체지만 관대 보정' },
  { id: 193, name: 'yanma', name_ko: '왕자리', llm_habitat: 'waters-edge', llm_tier: 1, memo_ko: '습지 잠자리, GO 이벤트 체감 반영' },
  { id: 194, name: 'wooper', name_ko: '우파', llm_habitat: 'waters-edge', llm_tier: 1, memo_ko: '물가에 흔한 기본종' },
  { id: 195, name: 'quagsire', name_ko: '누오', llm_habitat: 'waters-edge', llm_tier: 1, memo_ko: '누오도 GO식 관대 체감상 흔함' },
  { id: 196, name: 'espeon', name_ko: '에브이', llm_habitat: 'urban', llm_tier: 2, memo_ko: '이브이 진화체라 접근성 높음' },
  { id: 197, name: 'umbreon', name_ko: '블래키', llm_habitat: 'urban', llm_tier: 3, memo_ko: '팬 인기 최상위 이브이 진화체' },
  { id: 198, name: 'murkrow', name_ko: '니로우', llm_habitat: 'urban', llm_tier: 2, memo_ko: '야간 도시 까마귀지만 GO 체감은 보통' },
  { id: 199, name: 'slowking', name_ko: '야도킹', llm_habitat: 'waters-edge', llm_tier: 3, memo_ko: '왕의징표석 분기 진화체' },
  { id: 200, name: 'misdreavus', name_ko: '무우마', llm_habitat: 'cave', llm_tier: 2, memo_ko: '고스트 단독종이나 이벤트 접근성 반영' },
  { id: 201, name: 'unown', name_ko: '안농', llm_habitat: 'rare', llm_tier: 4, memo_ko: 'GO에서도 이벤트 의존도가 큰 상징적 희귀종' },
  { id: 202, name: 'wobbuffet', name_ko: '마자용', llm_habitat: 'cave', llm_tier: 1, memo_ko: '특이한 심령종이나 GO 접근성 반영' },
  { id: 203, name: 'girafarig', name_ko: '키링키', llm_habitat: 'grassland', llm_tier: 1, memo_ko: '초원 심령 기린, 관대 분포상 흔한 축' },
  { id: 204, name: 'pineco', name_ko: '피콘', llm_habitat: 'forest', llm_tier: 1, memo_ko: '나무에 붙는 벌레 기본종' },
  { id: 205, name: 'forretress', name_ko: '쏘콘', llm_habitat: 'forest', llm_tier: 2, memo_ko: '강철 벌레 진화체로 보통' },
  { id: 206, name: 'dunsparce', name_ko: '노고치', llm_habitat: 'cave', llm_tier: 2, memo_ko: '본가 희귀 단독종 인식과 GO 접근성을 절충' },
  { id: 207, name: 'gligar', name_ko: '글라이거', llm_habitat: 'mountain', llm_tier: 1, memo_ko: '절벽 전갈박쥐지만 GO 이벤트 체감 반영' },
  { id: 208, name: 'steelix', name_ko: '강철톤', llm_habitat: 'cave', llm_tier: 3, memo_ko: '메탈코트 진화와 강한 이미지' },
  { id: 209, name: 'snubbull', name_ko: '블루', llm_habitat: 'urban', llm_tier: 1, memo_ko: '도시형 페어리 기본종' },
  { id: 210, name: 'granbull', name_ko: '그랑블루', llm_habitat: 'urban', llm_tier: 2, memo_ko: '도시형 진화체로 보통' },
  { id: 211, name: 'qwilfish', name_ko: '침바루', llm_habitat: 'waters-edge', llm_tier: 1, memo_ko: '낚시 수중 독가시 기본종, 관대 보정' },
  { id: 212, name: 'scizor', name_ko: '핫삼', llm_habitat: 'forest', llm_tier: 3, memo_ko: '인기 높은 메탈코트 진화체' },
  { id: 213, name: 'shuckle', name_ko: '단단지', llm_habitat: 'mountain', llm_tier: 1, memo_ko: '바위 틈 국지종이나 이벤트 체감은 흔한 축' },
  { id: 214, name: 'heracross', name_ko: '헤라크로스', llm_habitat: 'forest', llm_tier: 3, memo_ko: 'Johto 지역한정 장벽과 강한 팬 인식' },
  { id: 215, name: 'sneasel', name_ko: '포푸니', llm_habitat: 'mountain', llm_tier: 2, memo_ko: '설산·고산권 악/얼음 기본종으로 보통' },
  { id: 216, name: 'teddiursa', name_ko: '깜지곰', llm_habitat: 'mountain', llm_tier: 1, memo_ko: '곰 기본종, GO 접근성 높음' },
  { id: 217, name: 'ursaring', name_ko: '링곰', llm_habitat: 'mountain', llm_tier: 2, memo_ko: '곰 진화체지만 일반종으로 보정' },
  { id: 218, name: 'slugma', name_ko: '마그마그', llm_habitat: 'mountain', llm_tier: 1, memo_ko: '화산성 기본종이나 GO 체감 흔함' },
  { id: 219, name: 'magcargo', name_ko: '마그카르고', llm_habitat: 'mountain', llm_tier: 2, memo_ko: '마그마그 진화체로 보통' },
  { id: 220, name: 'swinub', name_ko: '꾸꾸리', llm_habitat: 'cave', llm_tier: 1, memo_ko: '눈·동굴권 기본종, 커뮤니티 접근성 높음' },
  { id: 221, name: 'piloswine', name_ko: '메꾸리', llm_habitat: 'cave', llm_tier: 2, memo_ko: '얼음돼지 진화체로 보통' },
  { id: 222, name: 'corsola', name_ko: '코산호', llm_habitat: 'sea', llm_tier: 3, memo_ko: '해안 조건 Johto 지역한정 포켓몬' },
  { id: 223, name: 'remoraid', name_ko: '총어', llm_habitat: 'sea', llm_tier: 1, memo_ko: '바다 낚시 기본종' },
  { id: 224, name: 'octillery', name_ko: '대포무노', llm_habitat: 'sea', llm_tier: 2, memo_ko: '해양 진화체로 보통' },
  { id: 225, name: 'delibird', name_ko: '딜리버드', llm_habitat: 'mountain', llm_tier: 2, memo_ko: '계절 이벤트 의존성이 있는 선물 포켓몬' },
  { id: 226, name: 'mantine', name_ko: '만타인', llm_habitat: 'sea', llm_tier: 2, memo_ko: '넓은 바다 가오리, 보통권' },
  { id: 227, name: 'skarmory', name_ko: '무장조', llm_habitat: 'rough-terrain', llm_tier: 3, memo_ko: '강철 조류와 배틀 인식으로 희귀' },
  { id: 228, name: 'houndour', name_ko: '델빌', llm_habitat: 'rough-terrain', llm_tier: 2, memo_ko: '악/불꽃 야간 기본종이라 보통권' },
  { id: 229, name: 'houndoom', name_ko: '헬가', llm_habitat: 'rough-terrain', llm_tier: 3, memo_ko: '악/불꽃 진화체와 강한 팬 인식으로 희귀' },
  { id: 230, name: 'kingdra', name_ko: '킹드라', llm_habitat: 'sea', llm_tier: 3, memo_ko: '용의비늘 진화와 드래곤 위상' },
  { id: 231, name: 'phanpy', name_ko: '코코리', llm_habitat: 'rough-terrain', llm_tier: 1, memo_ko: '건조 지대 코끼리 기본종, 관대 보정' },
  { id: 232, name: 'donphan', name_ko: '코리갑', llm_habitat: 'rough-terrain', llm_tier: 3, memo_ko: '코코리 최종형, 500급 종족값으로 희귀' },
  { id: 233, name: 'porygon2', name_ko: '폴리곤2', llm_habitat: 'urban', llm_tier: 4, memo_ko: '인공 포켓몬 계열 희귀도 유지' },
  { id: 234, name: 'stantler', name_ko: '노라키', llm_habitat: 'forest', llm_tier: 1, memo_ko: '숲 사슴 단독종, 관대 분포상 흔한 축' },
  { id: 235, name: 'smeargle', name_ko: '루브도', llm_habitat: 'urban', llm_tier: 1, memo_ko: 'GO 포토밤 접근성을 반영해 흔한 축' },
  { id: 236, name: 'tyrogue', name_ko: '배루키', llm_habitat: 'urban', llm_tier: 2, memo_ko: '격투 아기 포켓몬, 계열 기준 보통' },
  { id: 237, name: 'hitmontop', name_ko: '카포에라', llm_habitat: 'urban', llm_tier: 3, memo_ko: '분기 격투 진화체로 희귀' },
  { id: 238, name: 'smoochum', name_ko: '뽀뽀라', llm_habitat: 'cave', llm_tier: 2, memo_ko: '루주라 계열 아기 포켓몬' },
  { id: 239, name: 'elekid', name_ko: '에레키드', llm_habitat: 'urban', llm_tier: 2, memo_ko: '에레브 계열 아기 포켓몬' },
  { id: 240, name: 'magby', name_ko: '마그비', llm_habitat: 'mountain', llm_tier: 2, memo_ko: '마그마 계열 아기 포켓몬' },
  { id: 241, name: 'miltank', name_ko: '밀탱크', llm_habitat: 'grassland', llm_tier: 3, memo_ko: '금은 탱크 이미지와 낮은 포획률' },
  { id: 242, name: 'blissey', name_ko: '해피너스', llm_habitat: 'grassland', llm_tier: 4, memo_ko: '럭키 계열보다 낮아지지 않는 최종형' },
  { id: 243, name: 'raikou', name_ko: '라이코', llm_habitat: 'grassland', llm_tier: 5, memo_ko: '전설의 번개 짐승' },
  { id: 244, name: 'entei', name_ko: '앤테이', llm_habitat: 'mountain', llm_tier: 5, memo_ko: '화산 이미지의 전설 짐승' },
  { id: 245, name: 'suicune', name_ko: '스이쿤', llm_habitat: 'waters-edge', llm_tier: 5, memo_ko: '물 정화 이미지의 전설 짐승' },
  { id: 246, name: 'larvitar', name_ko: '애버라스', llm_habitat: 'mountain', llm_tier: 3, memo_ko: '희귀 산악 준전설 계열 기본종' },
  { id: 247, name: 'pupitar', name_ko: '데기라스', llm_habitat: 'mountain', llm_tier: 3, memo_ko: '준전설 계열 중간형' },
  { id: 248, name: 'tyranitar', name_ko: '마기라스', llm_habitat: 'mountain', llm_tier: 4, memo_ko: '인기투표 상위권 준전설 최종형' },
  { id: 249, name: 'lugia', name_ko: '루기아', llm_habitat: 'sea', llm_tier: 5, memo_ko: '바다 수호 전설 포켓몬' },
  { id: 250, name: 'ho-oh', name_ko: '칠색조', llm_habitat: 'rare', llm_tier: 5, memo_ko: '무지개와 탑의 전설 포켓몬' },
  { id: 251, name: 'celebi', name_ko: '세레비', llm_habitat: 'forest', llm_tier: 5, memo_ko: '시간을 넘는 숲의 환상 포켓몬' },
];

const USER_RARITY_OVERRIDES = {
  83: { tier: 3, reason: '사용자 보정: 교환/지역한정 이미지가 있는 특수 단독종' },
  130: { tier: 2, reason: '사용자 보정: 강하지만 진화 접근성이 높아 보통권' },
  132: { tier: 3, reason: '사용자 보정: 변신 기믹이 강한 특수 단독종' },
  133: { tier: 3, reason: '사용자 보정: 이브이 시리즈는 상징성과 분기진화 가치를 희귀로 평가' },
  134: { tier: 3, reason: '사용자 보정: 이브이 시리즈 전체 희귀 보정' },
  135: { tier: 3, reason: '사용자 보정: 이브이 시리즈 전체 희귀 보정' },
  136: { tier: 3, reason: '사용자 보정: 이브이 시리즈 전체 희귀 보정' },
  137: { tier: 3, reason: '사용자 보정: 인공 포켓몬 특수성은 희귀, 매우 희귀까지는 아님' },
  138: { tier: 3, reason: '사용자 보정: 복원 화석 기본종은 희귀' },
  140: { tier: 3, reason: '사용자 보정: 복원 화석 기본종은 희귀' },
  143: { tier: 3, reason: '사용자 보정: 상징성은 강하지만 매우 희귀까지는 아님' },
  185: { tier: 3, reason: '사용자 보정: 고정 조우 이미지가 강한 특수 단독종' },
  186: { tier: 4, reason: '사용자 보정: 분기/아이템 최종 진화체는 매우 희귀' },
  193: { tier: 2, reason: '사용자 보정: 습지 잠자리 단독 기본종은 보통권' },
  196: { tier: 3, reason: '사용자 보정: 이브이 시리즈 전체 희귀 보정' },
  197: { tier: 3, reason: '사용자 보정: 이브이 시리즈 전체 희귀 보정' },
  199: { tier: 4, reason: '사용자 보정: 분기/아이템 최종 진화체는 매우 희귀' },
  201: { tier: 2, reason: '사용자 보정: 이벤트 희귀성만으로 매우 희귀까지 올리지 않음' },
  202: { tier: 3, reason: '사용자 보정: 특수 심령 단독종은 희귀' },
  203: { tier: 2, reason: '사용자 보정: 특이한 단독종이지만 희귀권까지는 아님' },
  207: { tier: 2, reason: '사용자 보정: 조건성 있는 기본종은 보통권' },
  211: { tier: 2, reason: '사용자 보정: 조건성 있는 수중 기본종은 보통권' },
  212: { tier: 4, reason: '사용자 보정: 인기 높은 아이템 최종 진화체는 매우 희귀' },
  213: { tier: 2, reason: '사용자 보정: 기묘한 바위 단독종은 보통권' },
  225: { tier: 3, reason: '사용자 보정: 계절성 강한 단독종은 희귀' },
  226: { tier: 3, reason: '사용자 보정: 큰 해양 단독종은 희귀' },
  227: { tier: 3, reason: '사용자 보정: 강한 강철 조류 단독종은 희귀' },
  230: { tier: 4, reason: '사용자 보정: 드래곤/아이템 최종 진화체는 매우 희귀' },
  232: { tier: 2, reason: '사용자 보정: 일반 진화 최종형은 보통권으로 완화' },
  234: { tier: 2, reason: '사용자 보정: 특이한 숲 단독종은 보통권' },
  235: { tier: 3, reason: '사용자 보정: 독자 기믹이 강한 단독종은 희귀' },
  236: { tier: 3, reason: '사용자 보정: 분기 진화 기반 아기 포켓몬은 희귀' },
};

function main() {
  const sourceRows = JSON.parse(fs.readFileSync(SOURCE_151_PATH, 'utf8'));
  const rows = sourceRows
    .filter((row) => row.id >= 1 && row.id <= 151)
    .concat(EXTRA_ROWS.map((row) => ({ ...row, llm_tier_label: TIER_LABELS[row.llm_tier] })))
    .sort((a, b) => a.id - b.id);

  applyUserRarityOverrides(rows);
  enforceEvolutionConstraints(rows);
  validateRows(rows);

  fs.writeFileSync(LLM_251_PATH, JSON.stringify(rows, null, 2) + '\n', 'utf8');

  const dist = {};
  for (const row of rows) dist[row.llm_tier] = (dist[row.llm_tier] || 0) + 1;
  process.stdout.write(JSON.stringify({ rows: rows.length, tier_distribution: dist }, null, 2) + '\n');
}

function applyUserRarityOverrides(rows) {
  for (const row of rows) {
    const override = USER_RARITY_OVERRIDES[row.id];
    if (!override) continue;
    row.llm_tier = override.tier;
    row.llm_tier_label = TIER_LABELS[override.tier];
    row.memo_ko = `${row.memo_ko}; ${override.reason}`;
  }
}

function enforceEvolutionConstraints(rows) {
  const byName = new Map(rows.map((row) => [row.name, row]));
  const chainDir = path.join(ROOT, 'dev', '.cache', 'pokeapi', 'evolution-chain');
  for (const fileName of fs.readdirSync(chainDir)) {
    if (!fileName.endsWith('.json')) continue;
    const chain = JSON.parse(fs.readFileSync(path.join(chainDir, fileName), 'utf8'));
    const stages = flattenChain(chain).map((stage) => stage.filter((name) => byName.has(name))).filter((stage) => stage.length);
    if (stages.length <= 1) continue;

    const baseName = stages.flat().find((name) => byName.has(name));
    if (!baseName) continue;
    const baseHabitat = byName.get(baseName).llm_habitat;
    for (const stage of stages) {
      for (const name of stage) {
        byName.get(name).llm_habitat = baseHabitat;
      }
    }

    let previousMaxTier = Math.max(...stages[0].map((name) => byName.get(name).llm_tier));
    for (let stageIndex = 1; stageIndex < stages.length; stageIndex += 1) {
      for (const name of stages[stageIndex]) {
        const row = byName.get(name);
        if (row.llm_tier < previousMaxTier) {
          row.llm_tier = previousMaxTier;
          row.llm_tier_label = TIER_LABELS[previousMaxTier];
        }
      }
      previousMaxTier = Math.max(previousMaxTier, ...stages[stageIndex].map((name) => byName.get(name).llm_tier));
    }
  }
}

function flattenChain(chainData) {
  if (!chainData || !chainData.chain) return [];
  const stages = [];
  let current = [chainData.chain];
  while (current.length) {
    const names = [];
    const next = [];
    for (const node of current) {
      if (node.species && node.species.name) names.push(node.species.name);
      for (const child of node.evolves_to || []) next.push(child);
    }
    if (names.length) stages.push(names);
    current = next;
  }
  return stages;
}

function validateRows(rows) {
  if (rows.length !== 251) throw new Error(`Expected 251 rows, found ${rows.length}`);
  for (let id = 1; id <= 251; id += 1) {
    const row = rows[id - 1];
    if (!row || row.id !== id) throw new Error(`Missing or out-of-order row for #${id}`);
    if (!TIER_LABELS[row.llm_tier]) throw new Error(`Invalid tier for #${id}: ${row.llm_tier}`);
    if (row.llm_tier_label !== TIER_LABELS[row.llm_tier]) row.llm_tier_label = TIER_LABELS[row.llm_tier];
  }
}

if (require.main === module) {
  main();
}
