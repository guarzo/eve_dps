// File: src/renderer/src/hooks/useDpsData.js
import { useEffect, useRef, useState } from 'react';

export function useDpsData() {
  const [dpsByCharacterLong, setDpsByCharacterLong] = useState({});
  const [dpsByCharacterShort, setDpsByCharacterShort] = useState({});
  const [dpsHistory, setDpsHistory] = useState([]);

  // We'll track the start time so we can place each data point along the X-axis.
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    const handleLong = (_evt, dpsObj) => {
      setDpsByCharacterLong(dpsObj);
    };

    const handleShort = (_evt, dpsObj) => {
      // Update short DPS in state
      setDpsByCharacterShort(dpsObj);

      // Build a single data point for the chart
      const now = Date.now();
      const secondsSinceStart = Math.floor((now - startTimeRef.current) / 1000);

      const dataPoint = { t: secondsSinceStart };
      for (const charName of Object.keys(dpsObj)) {
        dataPoint[`${charName}_in`] = dpsObj[charName].incomingDps;
        dataPoint[`${charName}_out`] = dpsObj[charName].outgoingDps;
      }

      // Append to the history, limiting to last 200 points
      setDpsHistory((prev) => [...prev.slice(-200), dataPoint]);
    };

    // Listen for both events from main
    window.electron.ipcRenderer.on('dps-by-character-updated-long', handleLong);
    window.electron.ipcRenderer.on('dps-by-character-updated-short', handleShort);

    return () => {
      window.electron.ipcRenderer.removeListener('dps-by-character-updated-long', handleLong);
      window.electron.ipcRenderer.removeListener('dps-by-character-updated-short', handleShort);
    };
  }, []);

  return {
    dpsByCharacterLong,
    dpsByCharacterShort,
    dpsHistory
  };
}
