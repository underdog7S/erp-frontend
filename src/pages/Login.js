import React, { useState } from "react";
import { login } from "../services/api";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { Box, Card, CardContent, Typography, TextField, Button, Alert, Avatar, CircularProgress, Divider } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(username, password); // sets tokens in localStorage
      // Fetch user profile after login
      const res = await api.get('/users/me/');
      if (res && res.data) {
        localStorage.setItem('user', JSON.stringify(res.data));
        window.dispatchEvent(new Event('userChanged'));
        navigate("/dashboard");
      } else {
        setError("Failed to fetch user profile after login.");
      }
    } catch (err) {
      setError("Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f6fa' }}>
      <Card sx={{ maxWidth: 400, width: '100%', p: 3 }}>
        <CardContent>
          <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
            <Avatar sx={{ bgcolor: 'primary.main', mb: 1 }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography variant="h5" gutterBottom>Welcome Back</Typography>
            <Typography variant="body2" color="textSecondary" textAlign="center">
              Sign in to your account to continue
            </Typography>
          </Box>
          
          
          <Box sx={{ my: 2 }}>
            <Divider>
              <Typography variant="body2" color="textSecondary">OR</Typography>
            </Divider>
          </Box>
          
          <form onSubmit={handleSubmit}>
            <TextField
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              fullWidth
              margin="normal"
              required
              autoFocus
              autoComplete="username"
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              margin="normal"
              required
              autoComplete="current-password"
            />
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2 }}
              disabled={loading}
              startIcon={loading && <CircularProgress size={20} color="inherit" />}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
          
          <Box mt={2} textAlign="center">
            <Typography variant="body2">
              Don't have an account? <a href="/register">Register</a>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;
