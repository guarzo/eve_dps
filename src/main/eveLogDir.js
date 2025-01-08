// src/main/eveLogDir.js
import fs from 'fs';
import os from 'os';
import path from 'path';
import { execSync } from 'child_process';

/**
 * Detect if we are running on WSL by reading /proc/version
 */
function isWSL() {
  if (process.platform !== 'linux') return false;
  try {
    const contents = fs.readFileSync('/proc/version', 'utf8');
    return contents.toLowerCase().includes('microsoft');
  } catch {
    return false;
  }
}

/**
 * If WSL, retrieve Windows home dir and convert with wslpath
 */
function getWindowsHomeInWSL() {
  const rawHome = execSync('cmd.exe /C echo %USERPROFILE%').toString().trim();
  return execSync(`wslpath -u "${rawHome}"`).toString().trim();
}

/**
 * Locate the EVE log folder. Returns a string path or null if not found.
 */
export function getEveLogDir() {
  let homeDir = os.homedir();

  if (isWSL()) {
    try {
      homeDir = getWindowsHomeInWSL();
    } catch (err) {
      console.error('[EVELOGDIR] Failed to retrieve Windows home directory in WSL:', err);
    }
  }

  const candidates = [
    path.join(homeDir, 'Documents', 'EVE', 'logs', 'Gamelogs'),
    path.join(homeDir, 'OneDrive', 'Documents', 'EVE', 'logs', 'Gamelogs'),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  console.error('[EVELOGDIR] No EVE log directory found in any candidate path.');
  return null;
}
