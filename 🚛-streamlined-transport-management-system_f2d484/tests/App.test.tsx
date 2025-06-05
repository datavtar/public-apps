import '@testing-library/jest-dom'
import * as React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import App from '../src/App'
import { AuthProvider, useAuth } from '../src/contexts/authContext';
import { MemoryRouter } from 'react-router-dom';

// Mock the authContext and AILayer components
jest.mock('../src/contexts/authContext', () => ({
    AuthProvider: ({ children }: any) => children,
    useAuth: () => ({
        currentUser: { first_name: 'Test' },
        logout: jest.fn(),
    }),
}));

jest.mock('../src/components/AILayer', () => {
    return {
        __esModule: true,
        default: React.forwardRef((props, ref) => {
            React.useImperativeHandle(ref, () => ({
                sendToAI: jest.fn()
            }));
            return <div data-testid="ai-layer"></div>;
        }),
    };
});

const renderWithAuthProvider = (ui: React.ReactElement) => {
    return render(
        <MemoryRouter>
            <AuthProvider>
                {ui}
            </AuthProvider>
        </MemoryRouter>
    );
};


describe('App Component', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    test('renders basic layout with dashboard', () => {
        renderWithAuthProvider(<App />);
        expect(screen.getByText('Transport Dashboard')).toBeInTheDocument();
        expect(screen.getByText(/Welcome back, Test!/i)).toBeInTheDocument();
    });

    test('renders dashboard statistics', () => {
        renderWithAuthProvider(<App />);
        expect(screen.getByText(/Total Vehicles/i)).toBeInTheDocument();
        expect(screen.getByText(/Total Drivers/i)).toBeInTheDocument();
        expect(screen.getByText(/Total Shipments/i)).toBeInTheDocument();
        expect(screen.getByText(/Total Revenue/i)).toBeInTheDocument();
    });

    test('renders Fleet Management when fleet tab is clicked', async () => {
        renderWithAuthProvider(<App />);
        const fleetButton = screen.getByText(/Fleet/i);
        fireEvent.click(fleetButton);
        await waitFor(() => {
            expect(screen.getByText(/Fleet Management/i)).toBeInTheDocument();
        });
    });

    test('renders Drivers Management when drivers tab is clicked', async () => {
        renderWithAuthProvider(<App />);
        const driversButton = screen.getByText(/Drivers/i);
        fireEvent.click(driversButton);
        await waitFor(() => {
            expect(screen.getByText(/Drivers Management/i)).toBeInTheDocument();
        });
    });

    test('renders Routes Management when routes tab is clicked', async () => {
        renderWithAuthProvider(<App />);
        const routesButton = screen.getByText(/Routes/i);
        fireEvent.click(routesButton);
        await waitFor(() => {
            expect(screen.getByText(/Routes Management/i)).toBeInTheDocument();
        });
    });

    test('renders Shipments Management when shipments tab is clicked', async () => {
        renderWithAuthProvider(<App />);
        const shipmentsButton = screen.getByText(/Shipments/i);
        fireEvent.click(shipmentsButton);
        await waitFor(() => {
            expect(screen.getByText(/Shipments Management/i)).toBeInTheDocument();
        });
    });

    test('renders Settings when settings tab is clicked', async () => {
        renderWithAuthProvider(<App />);
        const settingsButton = screen.getByText(/Settings/i);
        fireEvent.click(settingsButton);
        await waitFor(() => {
            expect(screen.getByText(/Settings/i)).toBeInTheDocument();
        });
    });

    test('clear all data confirmation dialog', async () => {
        renderWithAuthProvider(<App />);
        fireEvent.click(screen.getByText(/Settings/i));
        await waitFor(() => {
            expect(screen.getByText(/Clear All Data/i)).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText(/Clear All Data/i));

        await waitFor(() => {
            expect(screen.getByText(/Confirm Action/i)).toBeInTheDocument();
        });
    });
});