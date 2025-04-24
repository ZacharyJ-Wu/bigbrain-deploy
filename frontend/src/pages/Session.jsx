import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container, Typography, Box, Button, CircularProgress, Alert, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper
} from '@mui/material';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import config from '../../backend.config.json';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function Session() {
  const { sessionId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sessionData, setSessionData] = useState(null);
  const [gameId, setGameId] = useState(localStorage.getItem('lastGameId'));
  const [results, setResults] = useState([]);

  const token = localStorage.getItem('token');

  const fetchStatus = async () => {
    try {
      const res = await fetch(`${config.url}/admin/session/${sessionId}/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSessionData(data.results);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchResults = async () => {
    try {
      const res = await fetch(`${config.url}/admin/session/${sessionId}/results`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResults(data.results);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAdvance = async () => {
    try {
      await fetch(`${config.url}/admin/game/${gameId}/mutate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ mutationType: 'ADVANCE' }),
      });
      fetchStatus();
    } catch (_err) {
      setError('Failed to advance game');
    }
  };

  const handleStop = async () => {
    try {
      await fetch(`${config.url}/admin/game/${gameId}/mutate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ mutationType: 'END' }),
      });
      fetchStatus();
      fetchResults();
    } catch (_err) {
      setError('Failed to stop game');
    }
  };

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('token');
      const res = await fetch(`${config.url}/admin/games`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      let gid = null;
      const fromActive = data.games.find(g => String(g.active) === String(sessionId));
      if (fromActive) {
        gid = fromActive.id;
      } else {
        gid = localStorage.getItem('lastGameId');
      }

      setGameId(gid);

      try {
        const statusRes = await fetch(`${config.url}/admin/session/${Number(sessionId)}/status`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!statusRes.ok) throw new Error('Session not found or ended');
        const statusData = await statusRes.json();
        setSessionData(statusData.results);

        if (!statusData.results.active) {
          const resultsRes = await fetch(`${config.url}/admin/session/${Number(sessionId)}/results`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const resultsData = await resultsRes.json();
          if (!resultsRes.ok) throw new Error('Results fetch failed');
          setResults(resultsData.results);
        }
      } catch (err) {
        console.warn('Fetch failed:', err.message);
      }

      setLoading(false);
    };
    init();
  }, [sessionId]);

  if (loading) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;


  const topUsers = results.map((p) => ({
    name: p.name,
    score: p.answers.filter(a => a.correct).length * 100,
  })).sort((a, b) => b.score - a.score).slice(0, 5);

  const correctRateChart = {
    labels: sessionData.questions.map((_, i) => `Q${i + 1}`),
    datasets: [{
      label: '% Correct',
      data: sessionData.questions.map((_, i) => {
        const correctCount = results.filter(p => p.answers[i]?.correct).length;
        return (correctCount / results.length) * 100;
      }),
      backgroundColor: 'rgba(75,192,192,0.6)',
    }]
  };

  const answerTimeChart = {
    labels: sessionData.questions.map((_, i) => `Q${i + 1}`),
    datasets: [{
      label: 'Avg Response Time (s)',
      data: sessionData.questions.map((_, i) => {
        const times = results.map(p => {
          const a = p.answers[i];
          if (!a?.questionStartedAt || !a?.answeredAt) return 0;
          return (new Date(a.answeredAt) - new Date(a.questionStartedAt)) / 1000;
        });
        const avg = times.reduce((sum, t) => sum + t, 0) / times.length;
        return Math.round(avg * 10) / 10;
      }),
      borderColor: 'rgba(255,99,132,1)',
      borderWidth: 2,
    }]
  };


  return (
    <Container sx={{ mt: 5 }}>
      <Typography variant="h4" gutterBottom>Session {sessionId}</Typography>

      {sessionData.active && (
        <Box mb={3} display="flex" gap={2}>
          <Button variant="contained" color="primary" onClick={handleAdvance}>Advance</Button>
          <Button variant="outlined" color="error" onClick={handleStop}>Stop</Button>
        </Box>
      )}

      {!sessionData.active && results.length > 0 && (
        <>
          <Typography variant="h5" gutterBottom>Top Players</Typography>
          <TableContainer component={Paper} sx={{ mb: 4 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Score</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {topUsers.map((user, i) => (
                  <TableRow key={i}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.score}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Typography variant="h6">Question Accuracy</Typography>
          <Bar data={correctRateChart} style={{ marginBottom: 40 }} />

          <Typography variant="h6">Average Response Time</Typography>
          <Line data={answerTimeChart} />
        </>
      )}
    </Container>
  );
}