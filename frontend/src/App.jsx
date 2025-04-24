import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import EditGame from './pages/EditGame';
import EditQuestion from './pages/EditQuestion';
import Session from './pages/Session';
import JoinSession from './pages/JoinSession';
import PlayGame from './pages/PlayGame';
import WaitingScreen from './pages/WaitingScreen';
import GameResult from './pages/GameResult';

export default function App() {
  const isAuthed = !!localStorage.getItem('token');

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to={isAuthed ? '/dashboard' : '/login'} />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/game/:gameId" element={<EditGame />} />
        <Route path="/game/:gameId/question/:questionId" element={<EditQuestion />} />
        <Route path="/session/:sessionId" element={<Session />} />
        <Route path="/play/:playerId/waiting" element={<WaitingScreen />} />
        <Route path="/play/:playerId" element={<PlayGame />} />
        <Route path="/play/:sessionId/join" element={<JoinSession />} />
        <Route path="/play" element={<JoinSession />} />
        <Route path="/play/:playerId/result" element={<GameResult />} />
      </Routes>
    </Router>
  );
};
