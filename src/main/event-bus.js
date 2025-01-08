// src/main/event-bus.js
import { EventEmitter } from 'events';

/**
 * A shared event bus so we can emit DPS updates and have other parts
 * of the code (or main process) listen for them.
 */
export const dpsEmitter = new EventEmitter();
