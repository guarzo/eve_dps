# EVE Online DPS Monitor

This application is an Electron-based, real-time DPS (Damage Per Second) monitor for **EVE Online**. It watches the EVE log files in your `Documents/EVE/logs/Gamelogs` directory, parses incoming and outgoing damage events, and displays a rolling DPS chart and summary table.

---

## Features

- **Real-Time Parsing**: Watches EVE combat log files and processes new lines as they’re written.  
- **Rolling DPS Window**: Shows short-window (e.g., 3s, 5s) DPS in a chart, and longer-window averages (e.g., 60s) in a table.  
- **Multi-Character Support**: Aggregates damage events for multiple pilots, displaying separate lines or combined stats.  
- **Custom Electron UI**: Frameless window with a custom title bar, close button, and dark theme styling.  
- **Scrollbar Styling**: Matches the dark theme with a custom teal scrollbar (in Chromium-based environments).

---

## Setup & Installation

1. **Clone or Download**

    ```
    git clone https://github.com/guarzo/eve-dps-monitor.git
    ```
    Or download the latest zip release.

2. **Install Dependencies**

    ```
    npm install
    ```
    This will install all required Node/Electron packages, including `electron`, `chokidar`, `@mui/material`, and other dependencies.

3. **Run the App in Dev Mode**

    ```
    npm run dev
    ```
    This launches the Electron app in development mode and opens the main window.

4. **Build for Production**

    ```
    npm run build
    ```
    Or use `electron-builder` / `electron-vite` (depending on your setup) to package the app into a distributable format.

---

## Usage

Once the app is running, it automatically searches for EVE log files in the commonly found locations

# EVE Online DPS Monitor

This application is an Electron-based, real-time DPS (Damage Per Second) monitor for **EVE Online**. It watches the EVE log files in your `Documents/EVE/logs/Gamelogs` directory, parses incoming and outgoing damage events, and displays a rolling DPS chart and summary table.

---

## Features

- **Real-Time Parsing**: Watches EVE combat log files and processes new lines as they’re written.  
- **Rolling DPS Window**: Shows short-window (e.g., 3s, 5s) DPS in a chart, and longer-window averages (e.g., 60s) in a table.  
- **Multi-Character Support**: Aggregates damage events for multiple pilots, displaying separate lines or combined stats.  
- **Custom Electron UI**: Frameless window with a custom title bar, close button, and dark theme styling.  
- **Scrollbar Styling**: Matches the dark theme with a custom teal scrollbar (in Chromium-based environments).

---

## Setup & Installation

1. **Clone or Download**

    ```
    git clone https://github.com/yourusername/eve-dps-monitor.git
    ```
    Or download the latest zip release.

2. **Install Dependencies**

    ```
    npm install
    ```
    This will install all required Node/Electron packages, including `electron`, `chokidar`, `@mui/material`, and other dependencies.

3. **Run the App in Dev Mode**

    ```
    npm run dev
    ```
    This launches the Electron app in development mode and opens the main window.

4. **Build for Production**

    ```
    npm run build
    ```
    Or use `electron-builder` / `electron-vite` (depending on your setup) to package the app into a distributable format.

---

## Usage

Once the app is running, it automatically searches for EVE log files in:

# EVE Online DPS Monitor

This application is an Electron-based, real-time DPS (Damage Per Second) monitor for **EVE Online**. It watches the EVE log files in your `Documents/EVE/logs/Gamelogs` directory, parses incoming and outgoing damage events, and displays a rolling DPS chart and summary table.

---

## Features

- **Real-Time Parsing**: Watches EVE combat log files and processes new lines as they’re written.  
- **Rolling DPS Window**: Shows short-window (e.g., 3s, 5s) DPS in a chart, and longer-window averages (e.g., 60s) in a table.  
- **Multi-Character Support**: Aggregates damage events for multiple pilots, displaying separate lines or combined stats.  
- **Custom Electron UI**: Frameless window with a custom title bar, close button, and dark theme styling.  
- **Scrollbar Styling**: Matches the dark theme with a custom teal scrollbar (in Chromium-based environments).

---

## Setup & Installation

1. **Clone or Download**

    ```
    git clone https://github.com/yourusername/eve-dps-monitor.git
    ```
    Or download the latest zip release.

2. **Install Dependencies**

    ```
    npm install
    ```
    This will install all required Node/Electron packages, including `electron`, `chokidar`, `@mui/material`, and other dependencies.

3. **Run the App in Dev Mode**

    ```
    npm run dev
    ```
    This launches the Electron app in development mode and opens the main window.

4. **Build for Production**

    ```
    npm run build
    ```
    Or use `electron-builder` / `electron-vite` (depending on your setup) to package the app into a distributable format.

---

## Usage

Once the app is running, it automatically searches for EVE log files in:

As soon as combat lines appear in the log, you’ll see:

- **DPS Over Time Chart**: Rolling short-window (e.g. 3s) DPS with separate lines for “in” and “out” damage for each character.
- **Average DPS Table**: A longer-window (e.g. 60s) average DPS, broken down by character.

Hovering over the chart displays a tooltip grouping “incoming” and “outgoing” lines for each pilot. The legend condenses “PilotName_in” and “PilotName_out” lines into a single pilot entry.

---

## Customizations

- **Rolling Window Durations**  
  Check `dps-emitter.js` and `useDpsData.js` to change the short/long window durations (e.g., 3s / 60s).

- **Dark Theme & Colors**  
  Adjust `theme.js` and `global.css` to refine the Material UI palette and scrollbar styling.

- **Character Merging or Regex**  
  `line-parser.js` has the regex capturing `<b>123</b> to/from MyChar.`  
  Adapt the expression if your EVE logs differ or you want extra details (e.g., weapon name, partial hits).

---

## Architecture Overview

The app is structured into:

- **main/** (Electron Main Process)  
  - **`index.js`**: Creates the frameless window, listens for “close-app” IPC, sets up logs watchers, etc.  
  - **`event-bus.js`**: Exports an `EventEmitter` for DPS events.  
  - **`dps-calculator.js`**: Maintains `damageEvents` array, computes rolling DPS.  
  - **`watch-logs.js`**: Uses `chokidar` to watch EVE log files, calls `parseLineForDamage()`.  
  - **`line-parser.js`**: Regex that extracts damage lines and updates `damageEvents`.  
  - **`dps-emitter.js`**: `startEmittingDps()` on an interval, sending short/long DPS to the renderer via IPC.

- **renderer/** (React Front End)  
  - **`App.jsx`**: Custom `<AppBar>`, close button, theming, and layout.  
  - **`hooks/useDpsData.js`**: Subscribes to IPC events `dps-by-character-updated-short` / `long`, builds chart data.  
  - **`components/DpsChart.jsx`**: Renders Recharts line chart, custom tooltip/legend, domain logic for rolling windows.  
  - **`components/DpsTable.jsx`**: Material UI table for the average DPS window.  
  - **`global.css`**: Custom scrollbar styling, body resets, etc.  
  - **`theme.js`**: Material UI custom palette, typography, etc.

---

## Closing the App

The top-right **Close** button in the custom AppBar calls:

which triggers `app.quit()` in the main process. Since there is no OS frame by design, you must use this custom close button or <kbd>Alt+F4</kbd> / <kbd>Cmd+Q</kbd> on macOS to exit.

---

## License

You can place your own license details here (MIT, GPL, etc.).  
For example, **MIT License** - See the `LICENSE` file for more details.