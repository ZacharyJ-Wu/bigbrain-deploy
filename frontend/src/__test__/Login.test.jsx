import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';  // ✅ 添加这一行
import LoginPage from '../pages/LoginPage';

describe('LoginPage Component', () => {
    it('renders email and password fields', () => {
        render(
            <MemoryRouter>
                <LoginPage />
            </MemoryRouter>
        );
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    it('allows user to input email and password', async () => {
        render(
            <MemoryRouter>
                <LoginPage />
            </MemoryRouter>
        );
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);

        await userEvent.type(emailInput, 'user@test.com');
        await userEvent.type(passwordInput, 'pass123');

        expect(emailInput).toHaveValue('user@test.com');
        expect(passwordInput).toHaveValue('pass123');
    });

    it('calls fetch on login button click', async () => {
        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ token: 'abc123' }),
            })
        );

        render(
            <MemoryRouter>
                <LoginPage />
            </MemoryRouter>
        );

        await userEvent.type(screen.getByLabelText(/email/i), 'user@test.com');
        await userEvent.type(screen.getByLabelText(/password/i), 'pass123');
        await userEvent.click(screen.getByRole('button', { name: /login/i }));

        expect(global.fetch).toHaveBeenCalled();
        global.fetch.mockRestore();
    });
});