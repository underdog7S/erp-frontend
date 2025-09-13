import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { SnackbarProvider } from 'notistack';
import ErrorBoundary from './ErrorBoundary';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1a237e' },
    secondary: { main: '#e53935' },
  },
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <ErrorBoundary>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <App />
      </SnackbarProvider>
    </ThemeProvider>
  </ErrorBoundary>
);
