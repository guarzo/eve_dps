// File: src/main/dps-emitter.js
import { computeDpsByCharacter } from './dps-calculator.js';
import { dpsEmitter } from './event-bus.js';

export function startEmittingDps() {
  setInterval(() => {
    // Short = 3s rolling window, adjust as needed
    const shortData = computeDpsByCharacter(3);
    // Long = 60s rolling window
    const longData = computeDpsByCharacter(60);

    dpsEmitter.emit('dps-by-character-updated-short', shortData);
    dpsEmitter.emit('dps-by-character-updated-long', longData);
  }, 1000); // every 1 second
}
