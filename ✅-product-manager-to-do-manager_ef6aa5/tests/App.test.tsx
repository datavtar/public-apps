import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import App from '../src/App';


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
        removeItem(key: string) {
            delete store[key];
        },
        clear() {
            store = {};
        },
    };
})();

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
});

// Mock window.confirm
const originalConfirm = window.confirm;

beforeEach(() => {
    window.confirm = jest.fn(() => true); // Always return true for confirmation
    localStorageMock.clear();
});

afterEach(() => {
    window.confirm = originalConfirm;
    jest.restoreAllMocks();
});


describe('App Component', () => {

    test('renders header and initial content', async () => {
        render(<App />);

        // Check for loading state
        expect(screen.getByText('Loading...')).toBeInTheDocument();

        // Wait for loading to finish
        await waitFor(() => {
            expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        });

        // Check if the header text is rendered
        expect(screen.getByText('✅ Product Manager To-Do Manager')).toBeInTheDocument();

        // Verify at least one task is rendered after loading (using sample data)
        expect(screen.getByText('Create product roadmap')).toBeInTheDocument();
    });

    test('adds a new todo', async () => {
        render(<App />);

        await waitFor(() => {
            expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        });

        const addButton = screen.getByRole('button', { name: /New Task/i });
        fireEvent.click(addButton);

        const titleInput = await screen.findByLabelText('Title');
        fireEvent.change(titleInput, { target: { value: 'New Test Todo' } });

        const descriptionInput = screen.getByLabelText('Description');
        fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });

        const dueDateInput = screen.getByLabelText('Due Date');
        fireEvent.change(dueDateInput, { target: { value: '2024-12-31' } });

        const addTheTaskButton = screen.getByRole('button', { name: /Add Task/i });
        fireEvent.click(addTheTaskButton);

        await waitFor(() => {
            expect(screen.getByText('New Test Todo')).toBeInTheDocument();
        });
    });

    test('deletes a todo', async () => {
        render(<App />);

        await waitFor(() => {
            expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        });

        const deleteButton = await screen.findByTitle('Delete Task');

        fireEvent.click(deleteButton);

        await waitFor(() => {
            expect(screen.queryByText('Create product roadmap')).not.toBeInTheDocument();
        });
    });

    test('toggles dark mode', async () => {
        render(<App />);

        const darkModeButton = screen.getByRole('button', { name: /Switch to dark mode/i });
        fireEvent.click(darkModeButton);

        expect(localStorage.getItem('darkMode')).toBe('true');

        const lightModeButton = screen.getByRole('button', { name: /Switch to light mode/i });
        fireEvent.click(lightModeButton);

        expect(localStorage.getItem('darkMode')).toBe('false');
    });

    test('filters todos by status', async () => {
        render(<App />);

        await waitFor(() => {
            expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        });

        const statusFilter = screen.getByLabelText('Filter by status');
        fireEvent.change(statusFilter, { target: { value: 'completed' } });

        await waitFor(() => {
            expect(screen.getByText('User interview preparation')).toBeInTheDocument();
        });

        expect(screen.queryByText('Create product roadmap')).not.toBeInTheDocument();
    });

    test('filters todos by priority', async () => {
        render(<App />);

        await waitFor(() => {
            expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        });

        const priorityFilter = screen.getByLabelText('Filter by priority');
        fireEvent.change(priorityFilter, { target: { value: 'high' } });

         await waitFor(() => {
            expect(screen.getByText('Create product roadmap')).toBeInTheDocument();
        });

        expect(screen.queryByText('User interview preparation')).not.toBeInTheDocument();
    });

    test('filters todos by tag', async () => {
        render(<App />);

        await waitFor(() => {
            expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        });

        const tagFilter = screen.getByLabelText('Filter by tag');
        fireEvent.change(tagFilter, { target: { value: 'strategy' } });

        await waitFor(() => {
            expect(screen.getByText('Create product roadmap')).toBeInTheDocument();
        });

        expect(screen.queryByText('User interview preparation')).not.toBeInTheDocument();
    });

    test('filters todos by search query', async () => {
        render(<App />);

        await waitFor(() => {
            expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        });

        const searchInput = screen.getByLabelText('Search tasks');
        fireEvent.change(searchInput, { target: { value: 'roadmap' } });

         await waitFor(() => {
            expect(screen.getByText('Create product roadmap')).toBeInTheDocument();
        });

        expect(screen.queryByText('User interview preparation')).not.toBeInTheDocument();
    });
});