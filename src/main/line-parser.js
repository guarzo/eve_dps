// parseLineForDamage just updates the damageEvents array.
import { damageEvents } from './dps-calculator.js';

const englishDamageRegex = /\(combat\).*?<b>(\d+)<\/b>.*?\b(to|from)\b.*?<b><color[^>]*>([^<]+)/i;

export function parseLineForDamage(line) {
  const match = line.match(englishDamageRegex);
  if (!match) return;

  const damageAmount = parseInt(match[1], 10) || 0;
  const directionRaw = match[2].trim().toLowerCase();  // 'to' or 'from'
  const characterName = match[3].trim();

  if (!['to', 'from'].includes(directionRaw)) return;

  damageEvents.push({
    timestamp: Date.now(),
    amount: damageAmount,
    direction: directionRaw,
    character: characterName
  });
}
