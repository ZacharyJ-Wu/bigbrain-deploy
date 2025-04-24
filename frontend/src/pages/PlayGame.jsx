import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import {
  Container, Typography, Box, CircularProgress, Alert, Checkbox, FormControlLabel,
} from '@mui/material';
import config from '../../backend.config.json';

export default function PlayGame() {
  const { playerId } = useParams();
  const [status, setStatus] = useState(null);
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [showAnswer, setShowAnswer] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState([]);
  const timerRef = useRef(null);
  const [answerEnabled, setAnswerEnabled] = useState(false);
  const lastPositionRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${config.url}/play/${playerId}/status`);
        const data = await res.json();
        if (res.ok) {
          if (lastPositionRef.current !== data.position) {
            fetchQuestion();
            setShowAnswer(false);
            setSelectedAnswers([]);
            lastPositionRef.current = data.position;
          }
          setStatus(data);
        }
      } catch (err) {
        console.error('Status fetch error:', err);
      } finally {
        setLoading(false);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [playerId]);


  const fetchQuestion = async (retryCount = 0) => {
    try {
      const res = await fetch(`${config.url}/play/${playerId}/question`);
      const data = await res.json();

      if (res.ok && data.question) {
        setQuestion(data.question);
        setCountdown(data.duration || 30);
        setAnswerEnabled(false);
        startCountdown(data.duration || 30);
        setTimeout(() => setAnswerEnabled(true), 300);
      } else {
        if (retryCount < 5) {
          setTimeout(() => fetchQuestion(retryCount + 1), 300);
        } else {
          console.error("Question not ready after retrying.");
        }
      }
    } catch (err) {
      console.error('Question fetch error:', err);
    }
  };


  const startCountdown = (_duration) => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          getCorrectAnswer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const submitAnswer = async (selectedIndexes) => {
    try {
      const answerTexts = selectedIndexes.map(i => question.options[i].text);
      console.log('Submitting answer:', answerTexts);

      const res = await fetch(`${config.url}/play/${playerId}/answer`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers: answerTexts
        }),
      });

      const data = await res.json();
      console.log('Answer submit response:', res.status, data);

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit answer');
      }
    } catch (err) {
      console.error('Answer submit error:', err.message);
    }
  };

  const handleSelect = (index) => {
    if (!answerEnabled || countdown <= 0 || showAnswer) return;

    let updated = [...selectedAnswers];
    const isMultiple = question.type === 'multiple';

    if (question.type === 'judgement') {
      updated = [index];
    } else if (isMultiple) {
      if (updated.includes(index)) {
        updated = updated.filter(i => i !== index);
      } else {
        updated.push(index);
      }
    } else {
      updated = [index];
    }

    setSelectedAnswers(updated);
    submitAnswer(updated);
  };

  const getCorrectAnswer = async () => {
    try {
      const res = await fetch(`${config.url}/play/${playerId}/answer`);
      const data = await res.json();
      if (res.ok) {
        setCorrectAnswers(data.answer);
        setShowAnswer(true);
        if (status.atQuestion === status.questions.length - 1) {
          navigate(`/play/${playerId}/result`);
        }
      }

    } catch (err) {
      console.error('Get correct answer error:', err);
    }
  };

  if (loading) {
    return <Box textAlign="center" mt={10}><CircularProgress /></Box>;
  }

  if (!status?.started) {
    return <Container><Typography variant="h4">Please wait for the game to start...</Typography></Container>;
  }

  if (!question) {
    return <Container><Typography variant="h4">Loading question...</Typography></Container>;
  }

  return (
    <Container maxWidth="md">
      <Box mt={5}>
        <Typography variant="h5">{question.question}</Typography>

        {question.media && question.mediaType === 'image' && (
          <img src={question.media} alt="question media" style={{ maxWidth: '100%', marginTop: 20 }} />
        )}
        {question.media && question.mediaType === 'youtube' && (
          <iframe
            width="100%" height="315"
            src={question.media}
            title="YouTube video"
            allow="autoplay; encrypted-media" allowFullScreen
            style={{ marginTop: 20 }}
          />
        )}

        <Typography mt={3} variant="h6">Time Remaining: {countdown}s</Typography>

        <Box mt={3}>
          {question.options.map((opt, i) => (
            <FormControlLabel
              key={i}
              control={
                <Checkbox
                  checked={selectedAnswers.includes(i)}
                  onChange={() => handleSelect(i)}
                  disabled={countdown <= 0}
                />
              }
              label={opt.text}
            />
          ))}
        </Box>

        {showAnswer && (
          <Alert severity="info" sx={{ mt: 4 }}>
                        Correct answer: {correctAnswers.join(', ')}
          </Alert>
        )}
      </Box>
    </Container>
  );
}