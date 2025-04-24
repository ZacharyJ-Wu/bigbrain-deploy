import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, CircularProgress } from '@mui/material';
import config from '../../backend.config.json';

export default function WaitingScreen() {
  // Extract playerId from the URL parameters
  const { playerId } = useParams();

  const navigate = useNavigate();

  useEffect(() => {
    // Start polling the session status every 3 seconds
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${config.url}/play/${playerId}/status`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('playerToken')}`
          }
        });
        const data = await res.json();

        // If the game has started and a question is active, navigate to the play screen
        if (res.ok && data?.atQuestion !== null) {
          clearInterval(interval);
          navigate(`/play/${playerId}`);
        }
      } catch (err) {
        console.error('Failed to check session status:', err.message);
      }
    }, 3000);

    // Clean up interval when component is unmounted
    return () => clearInterval(interval);
  }, [playerId, navigate]);

  return (
    <Container maxWidth="sm" sx={{ mt: 10 }}>
      <Box textAlign="center">
        <Typography variant="h4" gutterBottom>
                    Waiting for the game to start...
        </Typography>
        <Typography sx={{ mb: 3 }}>
                    Please wait for the host to begin the game.
        </Typography>
        <CircularProgress />
      </Box>
    </Container>
  );
}
