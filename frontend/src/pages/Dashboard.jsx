import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  CircularProgress,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Snackbar,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import LogoutButton from '../components/LogoutButton';
import config from '../../backend.config.json';

export default function Dashboard() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [newGameName, setNewGameName] = useState('');
  const [newThumbnail, setNewThumbnail] = useState('');
  const [sessionDialogOpen, setSessionDialogOpen] = useState(false);
  const [sessionUrl, setSessionUrl] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [viewResultsGameId, setViewResultsGameId] = useState(null);

  const navigate = useNavigate();

  const fetchGames = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${config.url}/admin/games`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      const processedGames = Array.isArray(data.games) ? data.games : [];
      const safeGames = processedGames.map(game => ({
        ...game,
        questions: Array.isArray(game.questions) ? game.questions : []
      }));

      setGames(safeGames);
    } catch (err) {
      console.error('Failed to fetch games:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  const handleDeleteGame = async (id) => {
    const token = localStorage.getItem('token');
    try {
      const getRes = await fetch(`${config.url}/admin/games`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await getRes.json();

      if (!getRes.ok) throw new Error(data.error);

      if (!Array.isArray(data.games)) {
        throw new Error('Games data is not an array');
      }

      const updatedGames = data.games.filter(game => game.id != id);

      const putRes = await fetch(`${config.url}/admin/games`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ games: updatedGames }),
      });

      if (!putRes.ok) {
        const errorData = await putRes.json();
        throw new Error(errorData.error || 'Failed to update game list');
      }

      fetchGames();
    } catch (err) {
      console.error('Delete game failed:', err.message);
    }
  };

  const handleStartGame = async (gameId) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${config.url}/admin/game/${gameId}/mutate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ mutationType: 'START' }),
      });

      const data = await res.json();
      console.log('Start game response:', data);
      if (!res.ok) throw new Error(data.error);

      const link = `${window.location.origin}/play/${data.data.sessionId}/join`;
      setSessionUrl(link);
      setSessionDialogOpen(true);
      localStorage.setItem('currentSessionId', data.data.sessionId);
      fetchGames();
    } catch (err) {
      console.error('Start game failed:', err.message);
    }
  };

  const handleStopGame = async (gameId) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${config.url}/admin/game/${gameId}/mutate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ mutationType: 'END' }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setViewResultsGameId(gameId);
      fetchGames();
      const getRes = await fetch(`${config.url}/admin/games`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const allGameData = await getRes.json();
      const currentGame = allGameData.games.find(g => g.id == gameId);
      if (currentGame) {
        localStorage.setItem('lastSessionId', localStorage.getItem('currentSessionId') || '');
        localStorage.setItem('lastGameId', currentGame.id);
      }

    } catch (err) {
      console.error('Stop game failed:', err.message);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(sessionUrl);
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Failed to copy:', err.message);
    }
  };

  return (
    <Box position="relative" minHeight="100vh" paddingTop="24px">
      <LogoutButton />
      <Container>
        <Box my={5}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h4">Game Dashboard</Typography>
            <IconButton onClick={() => setCreateOpen(true)} color="primary">
              <AddIcon />
            </IconButton>
          </Box>

          {loading ? (
            <CircularProgress />
          ) : (
            <Grid container spacing={3}>
              {games.map((game) => (
                <Grid item xs={12} sm={6} md={4} key={game.id}>
                  <Card sx={{ borderRadius: 2, boxShadow: 3, transition: '0.3s', '&:hover': { boxShadow: 6 } }}>
                    <CardMedia
                      component="img"
                      height="140"
                      image={game.thumbnail || 'https://placehold.co/300x140?text=No+Image'}
                      alt="Game Thumbnail"
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardContent>
                      <Typography variant="h6">{game.name}</Typography>
                      <Typography variant="body2">
                        Questions: {(game.questions?.length ?? 0)}
                      </Typography>
                      <Typography variant="body2">
                        Total time: {(game.questions?.reduce?.((sum, q) => sum + (q.timeLimit || 0), 0) ?? 0)} sec
                      </Typography>
                      {game.active && (
                        <Typography variant="body2" color="success.main">
                          Active: {game.active}
                        </Typography>
                      )}
                    </CardContent>
                    <CardActions>
                      <Button size="small" onClick={() => navigate(`/game/${game.id}`)}>Edit</Button>
                      {game.active ? (
                        <Button size="small" color="warning" onClick={() => handleStopGame(game.id)}>Stop</Button>
                      ) : (
                        <Button size="small" onClick={() => handleStartGame(game.id)}>Start</Button>
                      )}
                      <Button size="small" color="error" onClick={() => handleDeleteGame(game.id)}>
                        Delete
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Container>

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)}>
        <DialogTitle>Create New Game</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Game Name"
            fullWidth
            value={newGameName}
            onChange={(e) => setNewGameName(e.target.value)}
          />
          <TextField
            fullWidth
            type="file"
            inputProps={{ accept: 'image/*' }}
            onChange={(e) => {
              const file = e.target.files[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onloadend = () => {
                setNewThumbnail(reader.result);
              };
              reader.readAsDataURL(file);
            }}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button
            onClick={async () => {
              if (!newGameName.trim()) {
                alert('Game name cannot be empty');
                return;
              }
              const token = localStorage.getItem('token');
              const myEmail = localStorage.getItem('email');
              try {
                const getRes = await fetch(`${config.url}/admin/games`, {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                });
                const data = await getRes.json();

                if (!getRes.ok) throw new Error(data.error);

                const existingGames = Array.isArray(data.games) ? data.games : [];

                const newGame = {
                  id: Date.now().toString(),
                  name: newGameName,
                  owner: myEmail,
                  questions: [],
                  thumbnail: newThumbnail,
                };

                const updatedGames = [...existingGames, newGame];

                const putRes = await fetch(`${config.url}/admin/games`, {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({ games: updatedGames }),
                });

                if (!putRes.ok) {
                  const errorData = await putRes.json();
                  throw new Error(errorData.error || 'Failed to create game');
                }

                setCreateOpen(false);
                setNewGameName('');
                setNewThumbnail('');
                fetchGames();
              } catch (err) {
                console.error('Create game failed:', err.message);
              }
            }}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={sessionDialogOpen} onClose={() => setSessionDialogOpen(false)}>
        <DialogTitle>Game Session Started</DialogTitle>
        <DialogContent>
          <Typography>Session Link:</Typography>
          <Box display="flex" alignItems="center" gap={1} mt={1}>
            <TextField fullWidth value={sessionUrl} disabled size="small" />
            <IconButton onClick={handleCopy}>
              <ContentCopyIcon />
            </IconButton>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSessionDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={viewResultsGameId !== null} onClose={() => setViewResultsGameId(null)}>
        <DialogTitle>Session Ended</DialogTitle>
        <DialogContent>
          <Typography>Would you like to view the results?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewResultsGameId(null)}>No</Button>
          <Button onClick={() => {
            const sessionId = localStorage.getItem('currentSessionId');
            if (sessionId) {
              navigate(`/session/${sessionId}`);
            } else {
              alert('No active session found for this game.');
            }
            setViewResultsGameId(null);
          }}>
            Yes
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSnackbarOpen(false)}>
          Link copied to clipboard!
        </Alert>
      </Snackbar>
    </Box>
  );
}
