// src/renderer/src/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark', // ensures a dark baseline
    primary: {
      main: '#14b8a6'
    },
    secondary: {
      main: '#ef4444'
    },
    info: {
      main: '#14b8a6'
    },
    warning: {
      main: '#f59e0b'
    },
    background: {
      default: '#1f2937', // body background
      paper: '#2d3748'    // cards/paper background
    },
    text: {
      primary: '#d1d5db',
      secondary: '#9ca3af'
    },
  },
  typography: {
    fontFamily: 'Inter, Roboto, sans-serif',
    h4: {
      fontSize: '1.8rem',
      fontWeight: 700,
      letterSpacing: '0.5px',     // a touch more spacing
      lineHeight: 1.3,           // slightly taller lines
    },
    h6: {
      fontSize: '1.3rem',        // slightly bigger subhead
      fontWeight: 600,
      letterSpacing: '0.25px',
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,           // more readable for paragraphs
    },
  },
  components: {
    MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            borderRadius: 8,
          },
        },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: 4,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        select: {
          // If you really want to ensure the background is the 'paper' color,
          // you can do:
          // backgroundColor: '#2d3748',
          // Or use palette references if needed.
          backgroundColor: 'background.paper',
          borderRadius: 1,
        },
      },
    },
  },
});

export default theme;
