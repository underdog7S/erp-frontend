import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00f2fe',
      light: '#4facfe',
      dark: '#00a8cc',
      contrastText: '#000000',
    },
    secondary: {
      main: '#7b2ff7',
      light: '#9d5bfa',
      dark: '#5816c9',
      contrastText: '#ffffff',
    },
    success: {
      main: '#00e676',
      light: '#33eb91',
      dark: '#00a152',
    },
    warning: {
      main: '#ff9100',
      light: '#ffa733',
      dark: '#b26500',
    },
    error: {
      main: '#ff1744',
      light: '#ff4569',
      dark: '#b2102f',
    },
    background: {
      default: '#000000',
      paper: 'rgba(15, 15, 22, 0.7)',
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontSize: '2.5rem', fontWeight: 700, lineHeight: 1.2 },
    h2: { fontSize: '2rem', fontWeight: 700, lineHeight: 1.3 },
    h3: { fontSize: '1.75rem', fontWeight: 600, lineHeight: 1.3 },
    h4: { fontSize: '1.5rem', fontWeight: 600, lineHeight: 1.4 },
    h5: { fontSize: '1.25rem', fontWeight: 600, lineHeight: 1.4 },
    h6: { fontSize: '1rem', fontWeight: 600, lineHeight: 1.5 },
    subtitle1: { fontSize: '1rem', fontWeight: 500 },
    subtitle2: { fontSize: '0.875rem', fontWeight: 500 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: 'radial-gradient(circle at 10% 20%, rgb(0, 0, 0) 0%, rgb(15, 15, 22) 100%)',
          minHeight: '100vh',
          backgroundAttachment: 'fixed',
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'rgba(20, 20, 30, 0.65) !important',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderRadius: 16,
          border: '1px solid rgba(255, 255, 255, 0.05)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 12px 40px 0 rgba(0, 242, 254, 0.1)',
            border: '1px solid rgba(0, 242, 254, 0.15)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: 'rgba(20, 20, 30, 0.65)',
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 24px',
          fontWeight: 600,
        },
        contained: {
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
          '&:hover': {
            boxShadow: '0 6px 20px rgba(0, 242, 254, 0.3)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            '& fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.1)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.2)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#00f2fe',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
          backgroundColor: 'rgba(255,255,255,0.05)',
        },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: 'none',
          background: 'rgba(20, 20, 30, 0.4)',
          borderRadius: 16,
          '& .MuiDataGrid-cell': {
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            color: 'rgba(255,255,255,0.8)'
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            borderBottom: '1px solid rgba(0,242,254,0.2)',
            color: '#00f2fe'
          },
          '& .MuiDataGrid-footerContainer': {
            borderTop: '1px solid rgba(255,255,255,0.05)',
          }
        },
      },
    },
  },
});

export default theme;