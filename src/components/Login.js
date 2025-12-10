import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Card, 
  CardContent, 
  Alert,
  Link,
  Stack,
  Divider
} from "@mui/material";
import GoogleIcon from '@mui/icons-material/Google';

export default function Login({ onToggleSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setError("");
      setLoading(true);
      await login(email, password);
    } catch (err) {
      setError("Failed to log in: " + err.message);
    }
    setLoading(false);
  }

  async function handleGoogleLogin() {
    try {
      setError("");
      setLoading(true);
      await loginWithGoogle();
    } catch (err) {
      setError("Failed to log in with Google: " + err.message);
    }
    setLoading(false);
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <Card sx={{ maxWidth: 400, width: '100%', m: 2, borderRadius: 4, boxShadow: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold" textAlign="center">
            Welcome Back
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center" mb={3}>
            Login to manage your expenses
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                label="Email"
                type="email"
                fullWidth
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <TextField
                label="Password"
                type="password"
                fullWidth
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button disabled={loading} type="submit" variant="contained" size="large" fullWidth>
                Log In
              </Button>
            </Stack>
          </form>

          <Divider sx={{ my: 3 }}>OR</Divider>

          <Button 
            variant="outlined" 
            fullWidth 
            startIcon={<GoogleIcon />} 
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            Sign in with Google
          </Button>

          <Box mt={3} textAlign="center">
            <Typography variant="body2">
              Need an account? <Link component="button" onClick={onToggleSignup}>Sign Up</Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
