import '@testing-library/jest-dom'
import * as React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import App from '../src/App'
import { AuthProvider } from '../src/contexts/authContext'
import { useAuth } from '../src/contexts/authContext'
import userEvent from '@testing-library/user-event';

// Mock the auth context
jest.mock('../src/contexts/authContext', () => ({
    useAuth: jest.fn(),
}));

// Mock localStorage
const localStorageMock = (() => {
    let store: { [key: string]: string } = {};

    return {
        getItem(key: string) {
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

describe('App Component', () => {
    beforeEach(() => {
        (useAuth as jest.Mock).mockReturnValue({
            currentUser: {
                email: 'test@example.com',
                first_name: 'Test',
                username: 'testuser',
            },
            logout: jest.fn(),
        });
        localStorageMock.clear();
    });

    test('renders the application with default dashboard section', () => {
        render(
            <AuthProvider>
                <App />
            </AuthProvider>
        );

        expect(screen.getByText('Dashboard Overview')).toBeInTheDocument();
        expect(screen.getByText('Total Shipments')).toBeInTheDocument();
        expect(screen.getByText('Total Vehicles')).toBeInTheDocument();
        expect(screen.getByText('Total Drivers')).toBeInTheDocument();
    });

    test('navigates to shipments section when shipments tab is clicked', async () => {
        render(
            <AuthProvider>
                <App />
            </AuthProvider>
        );
        
        const shipmentsTabButton = screen.getByRole('button', { name: /shipments/i });
        fireEvent.click(shipmentsTabButton);
        
        await waitFor(() => {
            expect(screen.getByText('Manage Shipments')).toBeInTheDocument();
        });
    });
    
    test('navigates to vehicles section when vehicles tab is clicked', async () => {
        render(
            <AuthProvider>
                <App />
            </AuthProvider>
        );
        
        const vehiclesTabButton = screen.getByRole('button', { name: /vehicles/i });
        fireEvent.click(vehiclesTabButton);
        
        await waitFor(() => {
            expect(screen.getByText('Manage Vehicles')).toBeInTheDocument();
        });
    });

    test('navigates to drivers section when drivers tab is clicked', async () => {
        render(
            <AuthProvider>
                <App />
            </AuthProvider>
        );

        const driversTabButton = screen.getByRole('button', { name: /drivers/i });
        fireEvent.click(driversTabButton);

        await waitFor(() => {
            expect(screen.getByText('Manage Drivers')).toBeInTheDocument();
        });
    });
    
    test('navigates to routes section when routes tab is clicked', async () => {
        render(
            <AuthProvider>
                <App />
            </AuthProvider>
        );
        
        const routesTabButton = screen.getByRole('button', { name: /routes/i });
        fireEvent.click(routesTabButton);
        
        await waitFor(() => {
            expect(screen.getByText('Manage Routes')).toBeInTheDocument();
        });
    });

    test('navigates to reports section when reports tab is clicked', async () => {
        render(
            <AuthProvider>
                <App />
            </AuthProvider>
        );

        const reportsTabButton = screen.getByRole('button', { name: /reports/i });
        fireEvent.click(reportsTabButton);

        await waitFor(() => {
            expect(screen.getByText('Reports & Analytics')).toBeInTheDocument();
        });
    });

    test('navigates to settings section when settings tab is clicked', async () => {
        render(
            <AuthProvider>
                <App />
            </AuthProvider>
        );

        const settingsTabButton = screen.getByRole('button', { name: /settings/i });
        fireEvent.click(settingsTabButton);

        await waitFor(() => {
            expect(screen.getByText('Application Settings')).toBeInTheDocument();
        });
    });

    test('opens the add shipment modal when add shipment button is clicked', async () => {
        render(
            <AuthProvider>
                <App />
            </AuthProvider>
        );

        fireEvent.click(screen.getByRole('button', { name: 'Shipments' }))

        const addShipmentButton = screen.getByRole('button', { name: 'Add New' });
        fireEvent.click(addShipmentButton);

        await waitFor(() => {
            expect(screen.getByText('Add New Shipment')).toBeInTheDocument();
            expect(screen.getByLabelText('BOL Number')).toBeInTheDocument();
        });
    });

    test('logout button calls the logout function from auth context', async () => {
        const mockLogout = jest.fn();
        (useAuth as jest.Mock).mockReturnValue({
            currentUser: {
                email: 'test@example.com',
                first_name: 'Test',
                username: 'testuser',
            },
            logout: mockLogout,
        });

        render(
            <AuthProvider>
                <App />
            </AuthProvider>
        );
        
        const logoutButton = screen.getByRole('button', { name: /logout/i });
        fireEvent.click(logoutButton);

        expect(mockLogout).toHaveBeenCalled();
    });

     test('toggles dark mode when the theme toggle button is clicked', async () => {
        render(
            <AuthProvider>
                <App />
            </AuthProvider>
        );

        const themeToggleButton = screen.getByRole('button', { name: /switch to dark mode/i });

        fireEvent.click(themeToggleButton);
        expect(localStorage.getItem('darkMode')).toBe('true');

        fireEvent.click(themeToggleButton);
        expect(localStorage.getItem('darkMode')).toBe('false');
    });

    test('opens the add vehicle modal when add vehicle button is clicked', async () => {
        render(
            <AuthProvider>
                <App />
            </AuthProvider>
        );
        fireEvent.click(screen.getByRole('button', { name: 'Vehicles' }))
        const addVehicleButton = screen.getByRole('button', { name: 'Add New' });
        fireEvent.click(addVehicleButton);

        await waitFor(() => {
            expect(screen.getByText('Add New Vehicle')).toBeInTheDocument();
            expect(screen.getByLabelText('Registration Number')).toBeInTheDocument();
        });
    });

    test('opens the add driver modal when add driver button is clicked', async () => {
        render(
            <AuthProvider>
                <App />
            </AuthProvider>
        );
        fireEvent.click(screen.getByRole('button', { name: 'Drivers' }))
        const addDriverButton = screen.getByRole('button', { name: 'Add New' });
        fireEvent.click(addDriverButton);

        await waitFor(() => {
            expect(screen.getByText('Add New Driver')).toBeInTheDocument();
            expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
        });
    });
    
     test('opens the add route modal when add route button is clicked', async () => {
        render(
            <AuthProvider>
                <App />
            </AuthProvider>
        );
        fireEvent.click(screen.getByRole('button', { name: 'Routes' }))
        const addRouteButton = screen.getByRole('button', { name: 'Add New' });
        fireEvent.click(addRouteButton);

        await waitFor(() => {
            expect(screen.getByText('Add New Route')).toBeInTheDocument();
            expect(screen.getByLabelText('Route Name')).toBeInTheDocument();
        });
    });

    test('displays welcome message with current user information', () => {
        render(
            <AuthProvider>
                <App />
            </AuthProvider>
        );

        expect(screen.getByText(/welcome, Test/i)).toBeInTheDocument();
        expect(screen.getByText(/welcome, testuser/i)).toBeInTheDocument();
    });

    test('should display clear all data confirmation modal', async () => {
        render(
            <AuthProvider>
                <App />
            </AuthProvider>
        );

        fireEvent.click(screen.getByRole('button', { name: 'Settings' }))
        const clearDataButton = screen.getByRole('button', { name: 'Clear All Application Data' });
        fireEvent.click(clearDataButton);

        await waitFor(() => {
            expect(screen.getByText('Confirm Clear All Data')).toBeInTheDocument();
            expect(screen.getByText(/Are you sure you want to delete ALL data/i)).toBeInTheDocument();
        });
    });

    test('should display data management import modal for shipments', async () => {
        render(
            <AuthProvider>
                <App />
            </AuthProvider>
        );

        fireEvent.click(screen.getByRole('button', { name: 'Settings' }))
        const importShipmentsButton = screen.getByRole('button', { name: /Import Shipments/i });
        fireEvent.click(importShipmentsButton);

        await waitFor(() => {
            expect(screen.getByText(/Import Shipments from CSV/i)).toBeInTheDocument();
            expect(screen.getByText(/Select a CSV file to import/i)).toBeInTheDocument();
        });
    });
    
    test('should display data management export shipment button', async () => {
        render(
            <AuthProvider>
                <App />
            </AuthProvider>
        );

        fireEvent.click(screen.getByRole('button', { name: 'Settings' }))
        expect(screen.getByRole('button', { name: /Export Shipments/i })).toBeInTheDocument();
    });
});