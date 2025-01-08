// src/renderer/src/utils/colorUtils.js

// Pre-defined palette
const COLOR_PALETTE = [
    '#ff7300', // orange
    '#387908', // green
    '#8884d8', // purple
    '#82ca9d', // light green
    '#d84c72', // pinkish
    '#0066ff', // blue
    '#ff6666', // red
  ];
  
  const charColorMap = {};
  
  /**
   * Returns a consistent color for a given characterName.
   * If that character doesn't have an assigned color yet,
   * it picks the next color from the palette.
   */
  export function getColorForCharacter(charName) {
    if (charColorMap[charName]) {
      return charColorMap[charName];
    }
    const usedCount = Object.keys(charColorMap).length;
    const color = COLOR_PALETTE[usedCount % COLOR_PALETTE.length];
    charColorMap[charName] = color;
    return color;
  }
  