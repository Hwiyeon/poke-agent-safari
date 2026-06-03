'use strict';

const TARGET_WIDTH = 480;
const TARGET_HEIGHT = 320;

const AREA_DEFS = [
  { id: 'mountain', label: 'Mountain', habitat: 'mountain', color: '#FF0000', viz: '#ff5d6c', seed: [126, 46] },
  { id: 'cave', label: 'Cave', habitat: 'cave', color: '#FF8000', viz: '#ff9b3f', seed: [206, 138] },
  { id: 'forest', label: 'Forest', habitat: 'forest', color: '#008000', viz: '#33b06d', seed: [377, 230] },
  { id: 'ruin', label: 'Ruins', habitat: 'rare', color: '#FFFF00', viz: '#ffe166', seed: [309, 56] },
  { id: 'rough_terrain', label: 'Hard Terrain', habitat: 'rough-terrain', color: '#800080', viz: '#b06be0', seed: [84, 176] },
  { id: 'grassland', label: 'Grassland', habitat: 'grassland', color: '#00FF00', viz: '#60d967', seed: [389, 130] },
  { id: 'urban', label: 'Urban', habitat: 'urban', color: '#FF00FF', viz: '#f06bb5', seed: [242, 230] },
  { id: 'waters_edge', label: "Water's Edge", habitat: 'waters-edge', color: '#00FFFF', viz: '#58d6ff', seed: [247, 289] },
  { id: 'sea', label: 'Sea', habitat: 'sea', color: '#0000FF', viz: '#2f74ff', seed: [383, 297] },
];

function hexToRgb(hex) {
  const value = parseInt(String(hex).replace('#', ''), 16);
  return [(value >> 16) & 0xFF, (value >> 8) & 0xFF, value & 0xFF];
}

module.exports = {
  AREA_DEFS,
  TARGET_HEIGHT,
  TARGET_WIDTH,
  hexToRgb,
};
