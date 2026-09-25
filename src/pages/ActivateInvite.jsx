import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Box, Container, Paper, Typography, TextField, Button, Alert, CircularProgress } from '@mui/material';
import api from '../services/api';

// Landing page for the link in a team invitation: set a password, or use Google with the same email.
const ActivateInvite = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const email = params.get('email') || '';
  const token = params.get('token') || '';
  const [info, setInfo] = useState(null);
  const [problem, setProblem] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    api.get('/invitations/info/', { params: { email, token } })
      .then(r => setInfo(r.data))
      .catch(e => setProblem(e.response?.data?.error || 'This invitation could not be checked.'));
  }, [email, token]);

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setBusy(true);
    try {
      await api.post('/users/activate/', { email, token, password });
      setDone(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not activate your account.');
    } finally { setBusy(false); }
  };

  return (
    <Container maxWidth="xs" sx={{ py: 8 }}>
      <Paper sx={{ p: 3 }}>
        {!info && !problem && <Box sx={{ textAlign: 'center' }}><CircularProgress /></Box>}
        {problem && <Alert severity="warning">{problem} Ask your admin to send a new invitation.</Alert>}
        {info && !done && (
          <form onSubmit={submit}>
            <Typography variant="h5" fontWeight={700} gutterBottom>Join {info.team}</Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>You have been invited as <b>{info.role}</b> with the email {info.email}.</Typography>
            <TextField fullWidth required type="password" margin="dense" label="Choose a password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} helperText="At least 12 characters" />
            <TextField fullWidth required type="password" margin="dense" label="Confirm password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
              error={!!confirm && confirm !== password} />
            {error && <Alert severity="error" sx={{ my: 1 }}>{error}</Alert>}
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 1 }} disabled={busy || password.length < 12 || password !== confirm}>{busy ? 'Saving...' : 'Activate account'}</Button>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Prefer Google? <Link to="/login">Sign in with Google</Link> using {info.email}, and you will join {info.team} automatically.
            </Typography>
          </form>
        )}
        {done && <Alert severity="success">Account activated. Taking you to the sign-in page...</Alert>}
      </Paper>
    </Container>
  );
};

export default ActivateInvite;
