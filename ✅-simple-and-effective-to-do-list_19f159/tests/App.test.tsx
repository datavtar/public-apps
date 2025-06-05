import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';
import { AuthContext } from '../src/contexts/authContext';

// Mock the auth context
const mockAuthContextValue = {
    currentUser: { id: 'test-user', first_name: 'Test', username: 'testuser' },
    logout: jest.fn(),
};

// Mock localStorage
const localStorageMock = (() => {
    let store: { [key: string]: string } = {};

    return {
        getItem(key: string): string | null {
            return store[key] || null;
        },
        setItem(key: string, value: string) {
            store[key] = String(value);
        },
        clear() {
            store = {};
        },
        removeItem(key: string) {
            delete store[key];
        },
    };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });


// Mock the AILayer component
jest.mock('../src/components/AILayer', () => {
    return {
        __esModule: true,
        default: React.forwardRef((props, ref) => {
            return (
                <div data-testid="ai-layer-mock">
                    Mock AILayer
                </div>
            );
        }),
    };
});


describe('App Component', () => {

    beforeEach(() => {
        localStorageMock.clear();
        jest.clearAllMocks();
    });

    test('renders without crashing', () => {
        render(
            <AuthContext.Provider value={mockAuthContextValue}>
                <App />
            </AuthContext.Provider>
        );
        expect(screen.getByText('ProductiPal To-Do')).toBeInTheDocument();
    });

    test('renders loading authentication initially', () => {
        const mockAuthContextValueLoading = {
            currentUser: null,
            logout: jest.fn(),
        };

        render(
            <AuthContext.Provider value={mockAuthContextValueLoading}>
                <App />
            </AuthContext.Provider>
        );

        expect(screen.getByText('Loading authentication...')).toBeInTheDocument();
    });

    test('adds a new todo', async () => {
        render(
            <AuthContext.Provider value={mockAuthContextValue}>
                <App />
            </AuthContext.Provider>
        );

        const inputElement = screen.getByLabelText('Task description') as HTMLInputElement;
        const addButton = screen.getByRole('button', { name: /^Add Task$/i });

        fireEvent.change(inputElement, { target: { value: 'Test todo' } });
        fireEvent.click(addButton);

        await waitFor(() => {
            expect(screen.getByText('Test todo')).toBeInTheDocument();
        });
    });

    test('toggles a todo completion', async () => {
        localStorage.setItem(`todos-${mockAuthContextValue.currentUser.id}`, JSON.stringify([{id: '1', text: 'Initial Todo', completed: false, createdAt: new Date().toISOString(), priority: 'medium'}]));

        render(
            <AuthContext.Provider value={mockAuthContextValue}>
                <App />
            </AuthContext.Provider>
        );

        await waitFor(() => {
            expect(screen.getByText('Initial Todo')).toBeInTheDocument();
        });

        const completeButton = screen.getByRole('button', {name: 'Mark as complete'});
        fireEvent.click(completeButton);

        await waitFor(() => {
            expect(screen.getByRole('button', {name: 'Mark as incomplete'})).toBeInTheDocument();
        });

    });


    test('opens and closes the edit modal', async () => {
        localStorage.setItem(`todos-${mockAuthContextValue.currentUser.id}`, JSON.stringify([{id: '1', text: 'Initial Todo', completed: false, createdAt: new Date().toISOString(), priority: 'medium'}]));
        render(
            <AuthContext.Provider value={mockAuthContextValue}>
                <App />
            </AuthContext.Provider>
        );

        await waitFor(() => {
            expect(screen.getByText('Initial Todo')).toBeInTheDocument();
        });

        const editButton = screen.getByRole('button', { name: /^Edit$/i });
        fireEvent.click(editButton);

        await waitFor(() => {
            expect(screen.getByText('Edit Task')).toBeInTheDocument();
        });

        const closeButton = screen.getByRole('button', {name: 'Close edit modal'});
        fireEvent.click(closeButton);
    });

    test('renders settings page', async () => {
        render(
            <AuthContext.Provider value={mockAuthContextValue}>
                <App />
            </AuthContext.Provider>
        );

        const settingsLink = screen.getByRole('button', {name: 'Settings'});
        fireEvent.click(settingsLink);

        await waitFor(() => {
            expect(screen.getByText('Settings')).toBeInTheDocument();
        });
    });

    test('renders AI suggester page', async () => {
        render(
            <AuthContext.Provider value={mockAuthContextValue}>
                <App />
            </AuthContext.Provider>
        );

        const aiSuggesterLink = screen.getByRole('button', {name: 'AI Suggester'});
        fireEvent.click(aiSuggesterLink);

        await waitFor(() => {
            expect(screen.getByText('AI Task Suggester')).toBeInTheDocument();
        });
    });
});