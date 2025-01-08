// src/main/eveLogWatcher.js
// FULL FILE EXAMPLE

import fs from 'fs';
import path from 'path';
import os from 'os';
import chokidar from 'chokidar';
import { EventEmitter } from 'events';

// We can re-use the same "damageOut" pattern from your Python code (English only, for brevity).
//   'damageOut': "\(combat\) <.*?><b>([0-9]+).*>to<"
//
// But we also need to capture the pilot name, etc. For a minimal example, let's just parse
// the damage amount and not worry about pilot/weapon. We'll keep it simple for demonstrating
// real-time DPS.
const englishDamageOutRegex = /\(combat\) <.*?><b>([0-9]+).*?>to</;

// We’ll emit events (DPS updates) to whomever is listening in the main process.
export const dpsEmitter = new EventEmitter();

function getEveLogDir() {
  if (process.platform === 'win32') {
    // Windows - replicate logic from Python version
    // Typically: C:\Users\USERNAME\Documents\EVE\logs\Gamelogs
    // If you want a more robust solution, consider using 'win32com' approach via Node ActiveX
    // or just let the user set their path. For brevity, we'll do a naive approach here:
    return path.join(os.homedir(), 'Documents', 'EVE', 'logs', 'Gamelogs');
  } else {
    // Mac / Linux
    return path.join(os.homedir(), 'Documents', 'EVE', 'logs', 'Gamelogs');
  }
}

// We'll keep track of damage events in a sliding window
// so we can compute DPS over, e.g., the last 10 seconds:
const damageEvents = [];  // array of { timestamp: number, amount: number }

// Helper function: compute DPS over the last N seconds
function computeDps(slidingSeconds = 10) {
  const now = Date.now();
  const cutoff = now - slidingSeconds * 1000;
  
  // Remove old events older than cutoff
  while (damageEvents.length && damageEvents[0].timestamp < cutoff) {
    damageEvents.shift();
  }
  
  // Sum the damage in the window
  const totalDamage = damageEvents.reduce((sum, ev) => sum + ev.amount, 0);
  // DPS is totalDamage / slidingSeconds
  return totalDamage / slidingSeconds;
}

// This function will parse new lines, look for damageOut, and update the damage array
function parseLineForDamage(line) {
  console.log('[DEBUG] New log line:', line); // Add this
  const match = line.match(englishDamageOutRegex);

  if (match) {
    console.log('[DEBUG] Matched damage line -> damageAmount =', match[1]); // And this
    const damageAmount = parseInt(match[1], 10) || 0;
    damageEvents.push({ timestamp: Date.now(), amount: damageAmount });

    const dpsValue = computeDps(5); // Rolling 5-second DPS
    console.log('[DEBUG] Emitting DPS:', dpsValue);
    dpsEmitter.emit('dps-updated', dpsValue);
  }
}


// We’ll export a function to start watching:
export function startWatchingLogs() {
  const eveLogDir = getEveLogDir();
  
  // If the directory doesn't exist or is empty, fail gracefully
  if (!fs.existsSync(eveLogDir)) {
    console.error(`EVE logs dir not found: ${eveLogDir}`);
    return;
  }
  
  console.log(`Watching EVE logs in: ${eveLogDir}`);

  // Create a watcher on all .txt files in that directory
  const watcher = chokidar.watch(path.join(eveLogDir, '*.txt'), {
    ignoreInitial: false,  // Read files that already exist
    persistent: true,
  });

  // We'll store a Tail-like "file read position" for each file
  // so that we only parse newly added lines.
  const filePositions = new Map(); // Map<filename, lastByteRead>

  async function readNewLines(filePath) {
    const stat = fs.statSync(filePath);
    const lastPos = filePositions.get(filePath) || 0;

    // If the file shrank or something, reset to 0
    if (stat.size < lastPos) {
      filePositions.set(filePath, 0);
      return;
    }

    // If there's nothing new, skip
    if (stat.size === lastPos) return;

    // Read from lastPos to new EOF
    const readStream = fs.createReadStream(filePath, {
      start: lastPos,
      end: stat.size,
      encoding: 'utf-8',
    });

    let fileData = '';
    for await (const chunk of readStream) {
      fileData += chunk;
    }

    // Update the pointer
    filePositions.set(filePath, stat.size);

    // Split new data into lines, parse each one for damage
    const lines = fileData.split('\n');
    lines.forEach((line) => parseLineForDamage(line));
  }

  // When a file is added or changed, read the new lines
  watcher
    .on('add', (filePath) => {
      filePositions.set(filePath, 0);
      readNewLines(filePath);
    })
    .on('change', (filePath) => {
      readNewLines(filePath);
    })
    .on('error', (error) => console.error(error));
}


