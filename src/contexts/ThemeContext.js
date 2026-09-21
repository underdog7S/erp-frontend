import React, { createContext, useContext, useState, useMemo } from 'react';
import { createTheme } from '@mui/material/styles';

// ─────────────────────────────────────────────────────────────────────────────
// Dark (Night) Palette – Premium Glassmorphism
// ─────────────────────────────────────────────────────────────────────────────
const darkPalette = {
  mode: 'dark',
  primary: { main: '#00f2fe', light: '#4facfe', dark: '#00a8cc', contrastText: '#000000' },
  secondary: { main: '#7b2ff7', light: '#9d5bfa', dark: '#5816c9', contrastText: '#ffffff' },
  success: { main: '#00e676', light: '#33eb91', dark: '#00a152' },
  warning: { main: '#ff9100', light: '#ffa733', dark: '#b26500' },
  error: { main: '#ff1744', light: '#ff4569', dark: '#b2102f' },
  background: { default: '#0a0a1a', paper: 'rgba(255,255,255,0.04)' },
  text: { primary: '#ffffff', secondary: 'rgba(255,255,255,0.65)' },
  divider: 'rgba(255,255,255,0.08)',
};

// ─────────────────────────────────────────────────────────────────────────────
// Light (Day) Palette – Clean Professional
// ─────────────────────────────────────────────────────────────────────────────
const lightPalette = {
  mode: 'light',
  primary: { main: '#1a73e8', light: '#4dabf5', dark: '#0d47a1', contrastText: '#ffffff' },
  secondary: { main: '#7b2ff7', light: '#9d5bfa', dark: '#5816c9', contrastText: '#ffffff' },
  success: { main: '#2e7d32', light: '#4caf50', dark: '#1b5e20' },
  warning: { main: '#ed6c02', light: '#ff9800', dark: '#e65100' },
  error: { main: '#d32f2f', light: '#ef5350', dark: '#c62828' },
  background: { default: '#f0f4f8', paper: '#ffffff' },
  text: { primary: '#1a202c', secondary: '#4a5568' },
  divider: 'rgba(0,0,0,0.1)',
};

const buildTheme = (mode) => createTheme({
  palette: mode === 'dark' ? darkPalette : lightPalette,
  typography: {
    fontFamily: '"Inter", "Segoe UI", "Roboto", sans-serif',
    h1: { fontWeight: 800, letterSpacing: '-1.5px' },
    h2: { fontWeight: 700, letterSpacing: '-0.5px' },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCssBaseline: {
      styleOverrides: (theme) => ({
        body: {
          background: mode === 'dark'
            ? 'linear-gradient(135deg, #0a0a1a 0%, #0d1030 40%, #0a1628 100%)'
            : 'linear-gradient(135deg, #f0f4f8 0%, #e8edf5 100%)',
          minHeight: '100vh',
          transition: 'background 0.4s ease',
        },
        '*': { boxSizing: 'border-box' },
        '::-webkit-scrollbar': { width: '6px' },
        '::-webkit-scrollbar-track': { background: mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#f0f4f8' },
        '::-webkit-scrollbar-thumb': { background: mode === 'dark' ? 'rgba(0,242,254,0.4)' : '#1a73e8', borderRadius: '3px' },
      }),
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#ffffff',
          backdropFilter: mode === 'dark' ? 'blur(20px)' : 'none',
          border: mode === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: mode === 'dark'
              ? '0 8px 32px rgba(0,242,254,0.12)'
              : '0 8px 24px rgba(26,115,232,0.15)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: mode === 'dark'
            ? 'rgba(10,10,26,0.85)'
            : 'rgba(255,255,255,0.90)',
          backdropFilter: 'blur(20px)',
          borderBottom: mode === 'dark' ? '1px solid rgba(0,242,254,0.15)' : '1px solid rgba(26,115,232,0.15)',
          boxShadow: 'none',
          color: mode === 'dark' ? '#ffffff' : '#1a202c',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        contained: {
          background: mode === 'dark'
            ? 'linear-gradient(135deg, #00f2fe, #4facfe)'
            : 'linear-gradient(135deg, #1a73e8, #4dabf5)',
          color: '#ffffff',
          fontWeight: 600,
          '&:hover': {
            opacity: 0.9,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#ffffff',
          backdropFilter: mode === 'dark' ? 'blur(20px)' : 'none',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: mode === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.08)',
          color: mode === 'dark' ? 'rgba(255,255,255,0.85)' : '#1a202c',
        },
        head: {
          fontWeight: 700,
          background: mode === 'dark' ? 'rgba(0,242,254,0.06)' : 'rgba(26,115,232,0.06)',
          color: mode === 'dark' ? '#00f2fe' : '#1a73e8',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          fontSize: '0.72rem',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          fontSize: '0.75rem',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          textTransform: 'none',
          fontSize: '0.875rem',
          color: mode === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
          '&.Mui-selected': {
            color: mode === 'dark' ? '#00f2fe' : '#1a73e8',
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '& fieldset': {
            borderColor: mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.2)',
          },
          '&:hover fieldset': {
            borderColor: mode === 'dark' ? '#00f2fe' : '#1a73e8',
          },
          color: mode === 'dark' ? '#ffffff' : '#1a202c',
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: mode === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
        },
      },
    },
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────────────────────
const ThemeContext = createContext({ mode: 'dark', toggleMode: () => {} });

export const ThemeContextProvider = ({ children }) => {
  // Always force dark mode as requested by user to prevent UI clashing
  const mode = 'dark';
  const toggleMode = () => { console.warn("Theme toggle disabled. Locked to Dark Mode."); };
  const theme = useMemo(() => buildTheme(mode), [mode]);

  return (
    <ThemeContext.Provider value={{ mode, toggleMode }}>
      {children(theme)}
    </ThemeContext.Provider>
  );
};

export const useThemeMode = () => useContext(ThemeContext);

export default buildTheme;
