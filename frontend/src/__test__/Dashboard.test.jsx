import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import { vi } from 'vitest';

// mock fetchGames data
const mockGames = [
    {
        id: '1',
        name: 'Sample Game 1',
        questions: [{ timeLimit: 30 }, { timeLimit: 20 }],
        thumbnail: '',
        active: null,
    },
    {
        id: '2',
        name: 'Sample Game 2',
        questions: [{ timeLimit: 15 }],
        thumbnail: '',
        active: null,
    },
];

// mock fetch and localStorage
beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn(() =>
        Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ games: mockGames }),
        })
    ));
    vi.stubGlobal('localStorage', {
        getItem: vi.fn(() => 'fake-token'),
        setItem: vi.fn(),
    });
});

afterEach(() => {
    vi.unstubAllGlobals();
});

test('Dashboard renders correct number of Edi   t buttons', async () => {
    render(
        <BrowserRouter>
            <Dashboard />
        </BrowserRouter>
    );

    const editButtons = await screen.findAllByRole('button', { name: 'Edit' });
    expect(editButtons).toHaveLength(2); // mockGames has 2 items
});
