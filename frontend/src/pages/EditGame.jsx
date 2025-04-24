import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  IconButton,
  CircularProgress,
  Grid,
  TextField,
  Alert,
  Fab,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import config from '../../backend.config.json';

export default function EditGame() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [allGames, setAllGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [editTitle, setEditTitle] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newThumbnail, setNewThumbnail] = useState('');

  const fetchGame = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${config.url}/admin/games`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);


      if (!Array.isArray(data.games)) {
        throw new Error('Games data is not an array');
      }

      setAllGames(data.games);

      const currentGame = data.games.find(g => g.id == gameId);
      if (!currentGame) throw new Error('Game not found');

      const localGameData = JSON.parse(localStorage.getItem(`game-${gameId}`));
      currentGame.questions = localGameData?.questions ?? [];

      setGame(currentGame);
      setNewTitle(currentGame.name);
      setNewThumbnail(currentGame.thumbnail || '');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGame();
  }, [gameId]);

  const handleUpdateGame = async () => {
    setSaving(true);
    setError('');
    const token = localStorage.getItem('token');

    try {
      if (!allGames || !Array.isArray(allGames)) {
        throw new Error('No games data available');
      }

      const updatedGames = allGames.map(g => {
        if (g.id == gameId) {
          return {
            ...g,
            name: newTitle,
            thumbnail: newThumbnail,
          };
        }
        return g;
      });


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
        throw new Error(errorData.error || 'Failed to update game');
      }

      setEditTitle(false);
      fetchGame();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteQuestion = async (questionIndex) => {
    const token = localStorage.getItem('token');

    try {
      if (!game) {
        throw new Error('Game data not available');
      }

      if (!allGames || !Array.isArray(allGames)) {
        throw new Error('No games data available');
      }

      const currentGame = { ...game };

      const questions = Array.isArray(currentGame.questions) ? [...currentGame.questions] : [];

      questions.splice(questionIndex, 1);

      const updatedGames = allGames.map(g => {
        if (g.id == gameId) {
          return {
            ...g,
            questions: questions,
          };
        }
        return g;
      });


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
        throw new Error(errorData.error || 'Failed to delete question');
      }
      localStorage.setItem(`game-${gameId}`, JSON.stringify({
        ...game,
        questions: questions,
      }));
      fetchGame();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setNewThumbnail(reader.result);
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 5 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button variant="outlined" onClick={() => navigate('/dashboard')}>
                    Back to Dashboard
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 5, mb: 5 }}>
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={() => navigate('/dashboard')} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        {editTitle ? (
          <Box display="flex" gap={2} alignItems="center">
            <TextField
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              size="small"
              sx={{ width: '300px' }}
            />
            <Button
              variant="contained"
              onClick={handleUpdateGame}
              disabled={saving}
            >
                            Save
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                setEditTitle(false);
                setNewTitle(game.name);
              }}
            >
                            Cancel
            </Button>
          </Box>
        ) : (
          <Box display="flex" alignItems="center">
            <Typography variant="h4" sx={{ mr: 2 }}>
              {game.name}
            </Typography>
            <IconButton onClick={() => setEditTitle(true)}>
              <EditIcon />
            </IconButton>
          </Box>
        )}
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Game Thumbnail</Typography>
              <Box
                sx={{
                  width: '100%',
                  height: 200,
                  mb: 2,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  border: '1px dashed #ccc',
                  borderRadius: 1,
                  overflow: 'hidden',
                }}
              >
                {newThumbnail ? (
                  <img
                    src={newThumbnail}
                    alt="Game thumbnail"
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                  />
                ) : (
                  <Typography color="text.secondary">No thumbnail</Typography>
                )}
              </Box>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="thumbnail-upload"
                type="file"
                onChange={handleImageUpload}
              />
              <label htmlFor="thumbnail-upload">
                <Button variant="outlined" component="span" fullWidth>
                                    Upload New Thumbnail
                </Button>
              </label>
              {newThumbnail !== game.thumbnail && (
                <Button
                  variant="contained"
                  onClick={handleUpdateGame}
                  sx={{ mt: 2 }}
                  fullWidth
                  disabled={saving}
                >
                                    Save Thumbnail
                </Button>
              )}
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6">Game Statistics</Typography>
              <Typography>Total Questions: {game.questions?.length || 0}</Typography>
              <Typography>
                                Total Time: {game.questions?.reduce((sum, q) => sum + (q.timeLimit || 0), 0)} seconds
              </Typography>
              <Typography>Created By: {game.owner}</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Typography variant="h5" gutterBottom>Questions</Typography>
      <Grid container spacing={2}>
        {game.questions?.map((question, index) => (
          <Grid item xs={12} key={index}>
            <Card
              sx={{
                cursor: 'pointer',
                '&:hover': { bgcolor: 'action.hover' },
                position: 'relative',
              }}
            >
              <CardContent onClick={() => navigate(`/game/${gameId}/question/${index}`)}>
                <Typography variant="h6">
                                    Question {index + 1}
                </Typography>
                <Typography>
                                    Type: {question.type || 'Single Choice'}
                </Typography>
                <Typography>
                  {question.question || 'Untitled Question'}
                </Typography>
                <Typography color="text.secondary">
                                    Time Limit: {question.timeLimit || 0} seconds
                </Typography>
                <Typography color="text.secondary">
                                    Points: {question.points || 0}
                </Typography>
              </CardContent>
              <IconButton
                sx={{ position: 'absolute', top: 8, right: 8 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteQuestion(index);
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 32, right: 32 }}
        onClick={() => navigate(`/game/${gameId}/question/new`)}
      >
        <AddIcon />
      </Fab>
    </Container>
  );
};