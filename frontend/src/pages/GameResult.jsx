import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container, Typography, Box, CircularProgress, Table, TableHead,
  TableBody, TableRow, TableCell, Paper
} from '@mui/material';
import config from '../../backend.config.json';

export default function GameResult() {
  const { playerId } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await fetch(`${config.url}/play/${playerId}/results`);
        const data = await res.json();
        if (res.ok) {
          setResult(data);
        }
      } catch (err) {
        console.error('Fetch result error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [playerId]);

  if (loading) {
    return <Box mt={10} textAlign="center"><CircularProgress /></Box>;
  }

  return (
    <Container maxWidth="md" sx={{ mt: 5 }}>
      <Typography variant="h4" gutterBottom>Game Results</Typography>
      <Table component={Paper}>
        <TableHead>
          <TableRow>
            <TableCell>Question</TableCell>
            <TableCell>Correct</TableCell>
            <TableCell>Score</TableCell>
            <TableCell>Time Taken (s)</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {result.answers.map((answer, index) => {
            const correct = answer.correct;
            const score = correct ? 100 : 0;
            const timeTaken = answer.answeredAt && answer.questionStartedAt
              ? Math.round((new Date(answer.answeredAt) - new Date(answer.questionStartedAt)) / 1000)
              : '-';

            return (
              <TableRow key={index}>
                <TableCell>Q{index + 1}</TableCell>
                <TableCell>{correct ? '✔️' : '❌'}</TableCell>
                <TableCell>{score}</TableCell>
                <TableCell>{timeTaken}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Container>
  );
}