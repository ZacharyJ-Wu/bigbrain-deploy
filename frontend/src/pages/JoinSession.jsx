import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Alert
} from '@mui/material';
import config from '../../backend.config.json';

export default function JoinSession() {
  // Extract sessionId from the URL parameters (if present)
  const { sessionId: routeSessionId } = useParams();

  // Local state for session ID and player name
  const [sessionId, setSessionId] = useState(routeSessionId || '');
  const [playerName, setPlayerName] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  // If a sessionId is provided in the route, set it in state
  useEffect(() => {
    if (routeSessionId) {
      setSessionId(routeSessionId);
    }
  }, [routeSessionId]);

  // Handle form submission to join a game session
  const handleJoin = async () => {
    if (!sessionId || !playerName.trim()) {
      setError('Session ID and name are required');
      return;
    }

    try {
      // Send request to join the session
      const res = await fetch(`${config.url}/play/join/${sessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: playerName }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to join session');
      }

      // Store playerId and token in localStorage
      const playerId = data.playerId;
      localStorage.setItem('playerId', playerId);
      localStorage.setItem('playerToken', data.token);

      // Navigate to the waiting screen
      navigate(`/play/${playerId}/waiting`);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 5 }}>
      <Typography variant="h4" gutterBottom>
                Join Game Session
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box display="flex" flexDirection="column" gap={2}>
        <TextField
          label="Session ID"
          value={sessionId}
          onChange={(e) => setSessionId(e.target.value)}
        />
        <TextField
          label="Your Name"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
        />
        <Button variant="contained" onClick={handleJoin}>
                    Join Session
        </Button>
      </Box>
    </Container>
  );
}
