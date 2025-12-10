import { createContext, useState, useMemo, useContext } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

const ThemeContext = createContext();

export const useThemeContext = () => useContext(ThemeContext);

export default function CustomThemeProvider({ children }) {
  const [mode, setMode] = useState("dark"); // Default to dark for "premium" feel

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === 'light'
            ? {
                // Light mode palette
                primary: { main: '#667eea' },
                secondary: { main: '#764ba2' },
                background: {
                  default: '#f3f4f6',
                  paper: '#ffffff',
                },
                text: {
                  primary: '#1f2937',
                  secondary: '#6b7280',
                },
              }
            : {
                // Dark mode palette
                primary: { main: '#818cf8' },
                secondary: { main: '#a78bfa' },
                background: {
                  default: '#111827', // Dark gray/blue
                  paper: '#1f2937',   // Slightly lighter
                },
                text: {
                  primary: '#f9fafb',
                  secondary: '#d1d5db',
                },
              }),
        },
        typography: {
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
          h3: { fontWeight: 700 },
          h5: { fontWeight: 600 },
          h6: { fontWeight: 600 },
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: 'none',
                borderRadius: 8,
                fontWeight: 600,
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: 16,
              },
            },
          },
          MuiDialog: {
            styleOverrides: {
              paper: {
                borderRadius: 16,
              },
            },
          },
        },
      }),
    [mode]
  );

  return (
    <ThemeContext.Provider value={{ mode, setMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}
