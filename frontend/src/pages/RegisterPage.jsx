import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Container, Typography, Alert, Box } from '@mui/material';
import { registerUser } from '../api/auth';

export default function RegisterPage() {
  // State for form inputs and error message
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Hook for navigation

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form action
    setError('');

    // Check if passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      // Try registering the user
      const token = await registerUser(email, password, name);
      localStorage.setItem('token', token); // Store token
      navigate('/dashboard'); // Redirect to dashboard
    } catch (err) {
      // Show error message if registration fails
      setError(err.message);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box mt={10} p={4} boxShadow={3} borderRadius={2}>
        {/* Page title */}
        <Typography variant="h4" gutterBottom align="center">
          Register
        </Typography>

        {/* Registration form */}
        <form onSubmit={handleSubmit}>
          {/* Name input */}
          <TextField
            fullWidth
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            margin="normal"
            required
          />
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
          {/* Confirm password input */}
          <TextField
            fullWidth
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
            Register
          </Button>
        </form>

        {/* Link to login page */}
        <Box mt={2} textAlign="center">
          <Button variant="text" onClick={() => navigate('/login')}>
            Already have an account? Log in here
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
