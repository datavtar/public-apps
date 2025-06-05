import '@testing-library/jest-dom'
import * as React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import App from '../src/App'
import { AuthContext } from '../src/contexts/authContext';

const mockLogout = jest.fn();
const mockCurrentUser = {
    first_name: 'Test',
    last_name: 'User',
    email: 'test@example.com',
};

const renderWithAuthProvider = (ui: React.ReactElement) => {
    return render(
        <AuthContext.Provider value={{ currentUser: mockCurrentUser, logout: mockLogout }}>
            {ui}
        </AuthContext.Provider>
    );
};

describe('App Component', () => {

    beforeEach(() => {
        localStorage.clear();
        jest.clearAllMocks();
    });

    test('renders the app', () => {
        renderWithAuthProvider(<App />);
        expect(screen.getByText(/TMS Pro/i)).toBeInTheDocument();
    });

    test('renders Dashboard by default', () => {
        renderWithAuthProvider(<App />);
        expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
    });

    test('navigates to Vehicles page', async () => {
        renderWithAuthProvider(<App />);
        fireEvent.click(screen.getByText(/Vehicles/i));
        await waitFor(() => {
            expect(screen.getByText(/Vehicles/i)).toBeInTheDocument();
        });
    });

    test('navigates to Drivers page', async () => {
        renderWithAuthProvider(<App />);
        fireEvent.click(screen.getByText(/Drivers/i));
        await waitFor(() => {
            expect(screen.getByText(/Drivers/i)).toBeInTheDocument();
        });
    });

    test('navigates to Routes page', async () => {
        renderWithAuthProvider(<App />);
        fireEvent.click(screen.getByText(/Routes/i));
        await waitFor(() => {
            expect(screen.getByText(/Routes/i)).toBeInTheDocument();
        });
    });

    test('navigates to Schedules page', async () => {
        renderWithAuthProvider(<App />);
        fireEvent.click(screen.getByText(/Schedules/i));
        await waitFor(() => {
            expect(screen.getByText(/Schedules/i)).toBeInTheDocument();
        });
    });

    test('navigates to Shipments page', async () => {
        renderWithAuthProvider(<App />);
        fireEvent.click(screen.getByText(/Shipments/i));
        await waitFor(() => {
            expect(screen.getByText(/Shipments/i)).toBeInTheDocument();
        });
    });

    test('navigates to AI Tools page', async () => {
         renderWithAuthProvider(<App />);
         fireEvent.click(screen.getByText(/AI Tools/i));
         await waitFor(() => {
             expect(screen.getByText(/AI Powered Tools/i)).toBeInTheDocument();
         });
     });

    test('navigates to Settings page', async () => {
        renderWithAuthProvider(<App />);
        fireEvent.click(screen.getByText(/Settings/i));
        await waitFor(() => {
            expect(screen.getByText(/Settings/i)).toBeInTheDocument();
        });
    });

    test('calls logout on logout button click', () => {
        renderWithAuthProvider(<App />);
        fireEvent.click(screen.getByText(/Logout/i));
        expect(mockLogout).toHaveBeenCalledTimes(1);
    });

    test('renders total vehicles stat card', () => {
        renderWithAuthProvider(<App />);
        expect(screen.getByText(/Total Vehicles/i)).toBeInTheDocument();
    });

    test('renders total drivers stat card', () => {
        renderWithAuthProvider(<App />);
        expect(screen.getByText(/Total Drivers/i)).toBeInTheDocument();
    });

    test('renders active schedules stat card', () => {
        renderWithAuthProvider(<App />);
        expect(screen.getByText(/Active Schedules/i)).toBeInTheDocument();
    });

    test('renders pending shipments stat card', () => {
        renderWithAuthProvider(<App />);
        expect(screen.getByText(/Pending Shipments/i)).toBeInTheDocument();
    });

    test('theme toggle button exists', () => {
        renderWithAuthProvider(<App />);
        const themeToggleButton = screen.getByRole('button', { name: /Toggle theme/i });
        expect(themeToggleButton).toBeInTheDocument();
    });

    test('search input exists', () => {
         renderWithAuthProvider(<App />);
         const searchInput = screen.getByPlaceholderText(/Search in Dashboard.../i);
         expect(searchInput).toBeInTheDocument();
     });
});