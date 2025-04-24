import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <Button
      variant="outlined"
      color="error"
      onClick={handleLogout}
      sx={{ position: 'absolute', top: 16, right: 16 }}
    >
      Logout
    </Button>
  );
};

