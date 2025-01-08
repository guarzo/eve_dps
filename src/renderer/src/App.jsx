// src/renderer/src/App.jsx
import { AppBar, Box, Container, CssBaseline, IconButton, Toolbar, Typography } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useDpsData } from './hooks/useDpsData.js';
import { DpsTable } from './components/DpsTable.jsx';
import { DpsChart } from './components/DpsChart.jsx';

function App() {
  const {
    dpsByCharacterLong,
    dpsByCharacterShort,
    dpsHistory
  } = useDpsData();

  // Handle close
  const handleCloseApp = () => {
    // Send IPC to main to close
    window.electron.ipcRenderer.send('close-app');
  };

  return (
    <>
      <CssBaseline />

      {/* Frameless Window: we allow dragging on the entire AppBar area */}
      <AppBar 
        position="static"
        enableColorOnDark
        elevation={8}
        sx={{
          WebkitAppRegion: 'drag', // user can drag the entire top bar
        }}
      >
        <Toolbar>
          <Typography variant="h4" sx={{ flexGrow: 1 }}>
            EVE DPS Monitor
          </Typography>

          {/* The close button must not be draggable */}
          <IconButton
            color="inherit"
            onClick={handleCloseApp}
            sx={{
              WebkitAppRegion: 'no-drag', // exclude from drag
            }}
          >
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: 'background.default',
          color: 'text.primary',
          py: 4
        }}
      >
        <Container maxWidth="md">
          {/* Long Window Average Table */}
          <DpsTable
            dpsByCharacter={dpsByCharacterLong}
            title="Damage by Character (Average)"
          />

          {/* DPS Over Time Chart (short window) */}
          <Box sx={{ mt: 4 }}>
            <DpsChart
              dpsHistory={dpsHistory}
              dpsByCharacter={dpsByCharacterShort}
            />
          </Box>
        </Container>
      </Box>
    </>
  );
}

export default App;
