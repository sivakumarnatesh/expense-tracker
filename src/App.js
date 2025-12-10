import { useState } from "react";
import CustomThemeProvider from "./context/ThemeContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ThemeToggle from "./components/ThemeToggle";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import Signup from "./components/Signup";
import { Container, AppBar, Toolbar, Typography, Button, Box } from "@mui/material";

function Main() {
  const { currentUser, logout } = useAuth();
  const [isSignup, setIsSignup] = useState(false);

  if (!currentUser) {
    return isSignup ? (
      <Signup onToggleLogin={() => setIsSignup(false)} />
    ) : (
      <Login onToggleSignup={() => setIsSignup(true)} />
    );
  }

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Box 
            component="img" 
            src="/favicon.png" 
            alt="Logo" 
            sx={{ width: 40, height: 40, mr: 2 }} 
          />
          <Typography variant="h5" sx={{ flexGrow: 1, fontWeight: 'bold',fontSize: '1rem' }}>
            Expense Tracker
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
              {currentUser.email}
            </Typography>
            <ThemeToggle />
            <Button color="inherit" onClick={logout}>Logout</Button>
          </Box>
        </Toolbar>
      </AppBar>
      <Container sx={{ mt: 4 }}>
        <Dashboard />
      </Container>
    </>
  );
}

function App() {
  return (
    <CustomThemeProvider>
      <AuthProvider>
        <Main />
      </AuthProvider>
    </CustomThemeProvider>
  );
}

export default App;
