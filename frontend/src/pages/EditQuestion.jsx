import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  IconButton,
  Card,
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ImageIcon from '@mui/icons-material/Image';
import LinkIcon from '@mui/icons-material/Link';
import config from '../../backend.config.json';

export default function EditQuestion() {
  const { gameId, questionId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [questionData, setQuestionData] = useState({
    type: 'single',
    question: '',
    timeLimit: 30,
    points: 1,
    media: null,
    mediaType: null,
    options: [
      { text: '', correct: false },
      { text: '', correct: false },
    ],
  });

  const isNewQuestion = questionId === 'new';

  const fetchQuestion = async () => {
    if (isNewQuestion) {
      setLoading(false);
      return;
    }

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

      const game = data.games.find(g => g.id == gameId);
      if (!game) throw new Error('Game not found');

      game.questions = Array.isArray(game.questions) ? game.questions : [];

      const qIndex = parseInt(questionId);
      if (qIndex < 0 || qIndex >= game.questions.length) {
        throw new Error('Question not found');
      }

      const question = game.questions[qIndex];
      setQuestionData({
        ...question,
        type: question.type || 'single',
        options: Array.isArray(question.options) ? question.options : [
          { text: '', correct: false },
          { text: '', correct: false },
        ]
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestion();
  }, [gameId, questionId]);

  const handleSave = async () => {
    if (!questionData.question.trim()) {
      setError('Question text is required');
      return;
    }

    if (questionData.options.length < 2) {
      setError('At least 2 options are required');
      return;
    }

    if (!questionData.options.some(opt => opt.correct)) {
      setError('At least one correct answer is required');
      return;
    }

    if (questionData.options.some(opt => !opt.text.trim())) {
      setError('All options must have text');
      return;
    }

    setSaving(true);
    setError('');
    const token = localStorage.getItem('token');

    try {
      const getRes = await fetch(`${config.url}/admin/games`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await getRes.json();
      if (!getRes.ok) throw new Error(data.error);

      if (!Array.isArray(data.games)) {
        throw new Error('Games data is not an array');
      }


      const gameIndex = data.games.findIndex(game => game.id == gameId);

      if (gameIndex === -1) {
        throw new Error('Game not found when saving question');
      }

      const updatedGames = [...data.games];

      const currentGame = { ...updatedGames[gameIndex] };

      currentGame.questions = Array.isArray(currentGame.questions) ? [...currentGame.questions] : [];

      const preparedQuestionData = {
        ...questionData,
        type: questionData.type || 'single',
        timeLimit: questionData.timeLimit || 30,
        points: questionData.points || 1,
        options: questionData.options.map(opt => ({
          text: opt.text,
          correct: !!opt.correct
        }))
      };

      if (isNewQuestion) {
        currentGame.questions.push(preparedQuestionData);
      } else {
        const qIndex = parseInt(questionId);
        if (qIndex >= 0 && qIndex < currentGame.questions.length) {
          currentGame.questions[qIndex] = preparedQuestionData;
        } else {
          throw new Error('Question index out of bounds');
        }
      }

      updatedGames[gameIndex] = currentGame;


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
        throw new Error(errorData.error || 'Failed to save question');
      }
      localStorage.setItem(`game-${gameId}`, JSON.stringify(currentGame));


      navigate(`/game/${gameId}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setQuestionData(prev => ({
      ...prev,
      type: newType,
      options: prev.options.map(opt => ({
        ...opt,
        correct: newType === 'single' ? false : opt.correct,
      })),
    }));
  };

  const handleOptionChange = (index, field, value) => {
    setQuestionData(prev => {
      const newOptions = [...prev.options];

      if (field === 'correct' && prev.type === 'single') {
        // For single choice, uncheck all other options
        newOptions.forEach((opt, i) => {
          opt.correct = i === index ? value : false;
        });
      } else {
        newOptions[index][field] = value;
      }

      return {
        ...prev,
        options: newOptions,
      };
    });
  };

  const addOption = () => {
    if (questionData.options.length >= 6) return;
    setQuestionData(prev => ({
      ...prev,
      options: [...prev.options, { text: '', correct: false }],
    }));
  };

  const removeOption = (index) => {
    if (questionData.options.length <= 2) return;
    setQuestionData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  };

  const handleMediaUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setQuestionData(prev => ({
        ...prev,
        media: reader.result,
        mediaType: file.type.startsWith('image/') ? 'image' : 'video',
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleMediaURL = () => {
    const url = prompt('Enter image or YouTube URL:');
    if (!url) return;

    let mediaType = 'image';
    let mediaURL = url;

    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      mediaType = 'youtube';
      // Extract video ID from URL
      const videoId = url.includes('youtu.be/')
        ? url.split('youtu.be/')[1]
        : url.split('v=')[1]?.split('&')[0];

      if (videoId) {
        mediaURL = `https://www.youtube.com/embed/${videoId}`;
      }
    }

    setQuestionData(prev => ({
      ...prev,
      media: mediaURL,
      mediaType: mediaType,
    }));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 5, mb: 5 }}>
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={() => navigate(`/game/${gameId}`)} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4">
          {isNewQuestion ? 'Create New Question' : `Edit Question ${parseInt(questionId) + 1}`}
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Question Text"
                value={questionData.question}
                onChange={(e) => setQuestionData(prev => ({ ...prev, question: e.target.value }))}
                multiline
                rows={3}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Question Type</InputLabel>
                <Select
                  value={questionData.type}
                  label="Question Type"
                  onChange={handleTypeChange}
                >
                  <MenuItem value="single">Single Choice</MenuItem>
                  <MenuItem value="multiple">Multiple Choice</MenuItem>
                  <MenuItem value="judgement">Judgement</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                label="Time Limit (seconds)"
                value={questionData.timeLimit}
                onChange={(e) => setQuestionData(prev => ({ ...prev, timeLimit: parseInt(e.target.value) || 30 }))}
                inputProps={{ min: 5, max: 120 }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                label="Points"
                value={questionData.points}
                onChange={(e) => setQuestionData(prev => ({ ...prev, points: parseInt(e.target.value) || 1 }))}
                inputProps={{ min: 1, max: 10 }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Media</Typography>
          {questionData.media && (
            <Box sx={{ mb: 2, textAlign: 'center' }}>
              {questionData.mediaType === 'youtube' ? (
                <iframe
                  width="100%"
                  height="315"
                  src={questionData.media}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <img
                  src={questionData.media}
                  alt="Question media"
                  style={{ maxWidth: '100%', maxHeight: 300 }}
                />
              )}
              <Button
                color="error"
                onClick={() => setQuestionData(prev => ({ ...prev, media: null, mediaType: null }))}
                sx={{ mt: 1 }}
              >
                Remove Media
              </Button>
            </Box>
          )}

          <Box display="flex" gap={2}>
            <input
              accept="image/*,video/*"
              style={{ display: 'none' }}
              id="media-upload"
              type="file"
              onChange={handleMediaUpload}
            />
            <label htmlFor="media-upload">
              <Button variant="outlined" component="span" startIcon={<ImageIcon />}>
                Upload File
              </Button>
            </label>
            <Button variant="outlined" startIcon={<LinkIcon />} onClick={handleMediaURL}>
              Add URL
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Answer Options</Typography>
            <Button
              startIcon={<AddIcon />}
              onClick={addOption}
              disabled={questionData.options.length >= 6}
            >
              Add Option
            </Button>
          </Box>

          {questionData.options.map((option, index) => (
            <Box key={index} display="flex" alignItems="center" gap={2} mb={2}>
              <TextField
                fullWidth
                label={`Option ${index + 1}`}
                value={option.text}
                onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={option.correct}
                    onChange={(e) => handleOptionChange(index, 'correct', e.target.checked)}
                  />
                }
                label="Correct"
              />
              <IconButton
                onClick={() => removeOption(index)}
                disabled={questionData.options.length <= 2}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}
        </CardContent>
      </Card>

      <Box display="flex" justifyContent="flex-end" gap={2}>
        <Button
          variant="outlined"
          onClick={() => navigate(`/game/${gameId}`)}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Question'}
        </Button>
      </Box>
    </Container>
  );
}