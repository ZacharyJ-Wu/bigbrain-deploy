import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import WaitingScreen from '../pages/WaitingScreen';

describe('WaitingScreen', () => {
    it('renders waiting message and loading spinner', () => {
        render(
            <BrowserRouter>
                <WaitingScreen />
            </BrowserRouter>
        );

        expect(screen.getByText(/Waiting for the game to start/i)).toBeInTheDocument();
        expect(screen.getByText(/Please wait for the host to begin the game/i)).toBeInTheDocument();
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
});