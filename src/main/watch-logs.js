// src/main/watch-logs.js
import fs from 'fs';
import chokidar from 'chokidar';
import debug from 'debug';

import { parseLineForDamage } from './line-parser.js';
import { getEveLogDir } from './eveLogDir.js';

// Force-enable chokidar debugging (optional)
debug.enable('chokidar*');

/**
 * We'll store file read positions to emulate "tail":
 * key: filePath -> lastByteRead
 */
const filePositions = new Map();

/**
 * readAppendedLines(filePath):
 *  - Stats the file to see if it grew
 *  - Reads from lastPos to newSize
 *  - Calls parseLineForDamage on each new line
 */
function readAppendedLines(filePath) {
  let stat;
  try {
    stat = fs.statSync(filePath);
  } catch (err) {
    console.error('[WATCH-LOGS] Failed to stat file:', filePath, err);
    return;
  }

  const lastPos = filePositions.get(filePath) || 0;
  const newSize = stat.size;

  // If file shrank (rotated?), reset pointer
  if (newSize < lastPos) {
    filePositions.set(filePath, 0);
    return;
  }

  // If no new data, skip
  if (newSize === lastPos) {
    return;
  }

  const readStream = fs.createReadStream(filePath, {
    start: lastPos,
    end: newSize,
    encoding: 'utf-8',
  });

  let chunkData = '';
  readStream.on('data', (chunk) => {
    chunkData += chunk;
  });

  readStream.on('end', () => {
    filePositions.set(filePath, newSize);

    const lines = chunkData.split('\n');
    for (const line of lines) {
      if (line.trim()) {
        parseLineForDamage(line);
      }
    }
  });

  readStream.on('error', (err) => {
    console.error(`[WATCH-LOGS] Error reading ${filePath}:`, err);
  });
}

/**
 * startWatchingLogs():
 *  - Finds the EVE log dir
 *  - Uses Chokidar to watch the entire directory (not just *.txt)
 *    to avoid issues with certain path/glob combos in WSL/OneDrive.
 */
export function startWatchingLogs() {
  const eveLogDir = getEveLogDir();
  if (!eveLogDir) {
    console.log('[WATCH-LOGS] No EVE log dir found, aborting watch.');
    return;
  }

  console.log(`[WATCH-LOGS] Using Chokidar to watch EVE logs in: ${eveLogDir}`);

  // Just watch the entire directory, then filter by .txt in "add" or "change" if needed
  const watcher = chokidar.watch(eveLogDir, {
    ignoreInitial: false,
    persistent: true,
    usePolling: true,
    interval: 100,
  });

  watcher
    .on('ready', () => {
      console.log('[CHOKIDAR] initial scan complete');
    })
    .on('add', (filePath) => {
      // Optionally skip non-.txt files
      if (!filePath.endsWith('.txt')) return;

      console.log('[CHOKIDAR] add =>', filePath);
      try {
        // Initialize file pointer at file's end so we only see new lines going forward
        const { size } = fs.statSync(filePath);
        filePositions.set(filePath, size);
      } catch (err) {
        console.error('[WATCH-LOGS] Error stat on new file:', filePath, err);
      }
    })
    .on('change', (filePath) => {
      if (!filePath.endsWith('.txt')) return;
      console.log('[CHOKIDAR] change =>', filePath);
      readAppendedLines(filePath);
    })
    .on('error', (error) => {
      console.error('[CHOKIDAR] error =>', error);
    });
}
