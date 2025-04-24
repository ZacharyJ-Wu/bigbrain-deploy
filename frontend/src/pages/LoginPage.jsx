import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Container, Typography, Alert, Box } from '@mui/material';
import { loginUser } from '../api/auth';

export default function LoginPage() {
  // State for user input and error handling
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Used for page navigation

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form behavior
    setError('');

    try {
      // Attempt login
      const token = await loginUser(email, password);
      localStorage.setItem('token', token);   // Store token for authentication
      localStorage.setItem('email', email);   // Optionally store user email
      navigate('/dashboard');                 // Redirect to dashboard
    } catch (err) {
      // Show error if login fails
      setError(err.message);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box mt={10} p={4} boxShadow={3} borderRadius={2}>
        {/* Page title */}
        <Typography variant="h4" gutterBottom align="center">
          Login
        </Typography>

        {/* Login form */}
        <form onSubmit={handleSubmit}>
          {/* Email input */}
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
          />

          {/* Password input */}
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
          />

          {/* Error message */}
          {error && (
            <Alert severity="error" sx={{ my: 2 }}>
              {error}
            </Alert>
          )}

          {/* Submit button */}
          <Button fullWidth type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
            Login
          </Button>
        </form>

        {/* Link to registration page */}
        <Box mt={2} textAlign="center">
          <Button variant="text" onClick={() => navigate('/register')}>
            Don’t have an account? Register here
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
