// src/main/dps-calculator.js

/**
 * We'll keep a rolling list of recent damage events:
 * { timestamp, amount, direction, character }
 */
export const damageEvents = [];

/**
 * Default rolling window for DPS (in seconds)
 */
export const DPS_WINDOW_1_SEC = 1;

/**
 * Compute overall DPS (all directions) over the last windowSec
 */
export function computeTotalDps(windowSec = DPS_WINDOW_1_SEC) {
  const now = Date.now();
  const cutoff = now - windowSec * 1000;

  // Remove old events
  while (damageEvents.length && damageEvents[0].timestamp < cutoff) {
    damageEvents.shift();
  }

  const totalDamage = damageEvents.reduce((sum, ev) => sum + ev.amount, 0);
  return totalDamage / windowSec;
}

/**
 * Compute DPS by character, splitting into incoming and outgoing
 */
export function computeDpsByCharacter(windowSec = DPS_WINDOW_1_SEC) {
  const now = Date.now();
  const cutoff = now - windowSec * 1000;

  const recentEvents = damageEvents.filter((ev) => ev.timestamp >= cutoff);
  const dpsMap = new Map();

  for (const ev of recentEvents) {
    const { character, direction, amount } = ev;
    if (!dpsMap.has(character)) {
      dpsMap.set(character, { incomingDamage: 0, outgoingDamage: 0 });
    }
    const charStats = dpsMap.get(character);

    if (direction === 'to') {
      charStats.incomingDamage += amount;
    } else {
      charStats.outgoingDamage += amount;
    }
  }

  const result = {};
  for (const [charName, dmgObj] of dpsMap.entries()) {
    result[charName] = {
      incomingDps: dmgObj.incomingDamage / windowSec,
      outgoingDps: dmgObj.outgoingDamage / windowSec,
    };
  }
  return result;
}
