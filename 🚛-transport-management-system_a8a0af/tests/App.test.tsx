import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};

  return {
    getItem: (key: string): string | null => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = String(value);
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});


// Mock window.confirm
global.confirm = jest.fn(() => true);


beforeEach(() => {
  localStorageMock.clear();
  jest.clearAllMocks();
});

describe('App Component', () => {
  it('renders without crashing', () => {
    render(<App />);
  });

  it('displays loading message initially', () => {
    render(<App />);
    expect(screen.getByText('Loading application data...')).toBeInTheDocument();
  });

  it('renders the dashboard view after loading', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });
  });

  it('toggles theme correctly', async () => {
    render(<App />);
    await waitFor(() => screen.getByLabelText(/^Switch to/i));

    const toggleButton = screen.getByLabelText(/^Switch to/i);

    fireEvent.click(toggleButton);

  });

 it('adds a new vehicle', async () => {
    render(<App />);

    await waitFor(() => screen.getByText('Vehicles'));
    fireEvent.click(screen.getByText('Vehicles'));

    await waitFor(() => screen.getByRole('button', { name: /^Add Vehicle$/i }));
    fireEvent.click(screen.getByRole('button', { name: /^Add Vehicle$/i }));

    await waitFor(() => screen.getByLabelText('Registration Number'));

    fireEvent.change(screen.getByLabelText('Registration Number'), { target: { value: 'TEST123' } });
    fireEvent.change(screen.getByLabelText('Type'), { target: { value: 'Truck' } });
    fireEvent.change(screen.getByLabelText('Model'), { target: { value: 'TestModel' } });

    fireEvent.click(screen.getByRole('button', { name: /^Add$/i }));

    await waitFor(() => expect(screen.getByText('Vehicle added successfully!')).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText('TEST123')).toBeInTheDocument());
  });

  it('deletes a vehicle', async () => {
    render(<App />);
    await waitFor(() => screen.getByText('Vehicles'));
    fireEvent.click(screen.getByText('Vehicles'));

    // Add a vehicle first
    await waitFor(() => screen.getByRole('button', { name: /^Add Vehicle$/i }));
    fireEvent.click(screen.getByRole('button', { name: /^Add Vehicle$/i }));

    await waitFor(() => screen.getByLabelText('Registration Number'));

    fireEvent.change(screen.getByLabelText('Registration Number'), { target: { value: 'DELETE123' } });
    fireEvent.change(screen.getByLabelText('Type'), { target: { value: 'Truck' } });
    fireEvent.change(screen.getByLabelText('Model'), { target: { value: 'TestModel' } });

    fireEvent.click(screen.getByRole('button', { name: /^Add$/i }));

    await waitFor(() => expect(screen.getByText('DELETE123')).toBeInTheDocument());

    // Now delete it
    fireEvent.click(screen.getByLabelText(/^Delete DELETE123$/i));

    await waitFor(() => expect(screen.getByText('Vehicle deleted successfully!')).toBeInTheDocument());
  });

 it('adds a new driver', async () => {
        render(<App />);

        await waitFor(() => screen.getByText('Drivers'));
        fireEvent.click(screen.getByText('Drivers'));

        await waitFor(() => screen.getByRole('button', { name: /^Add Driver$/i }));
        fireEvent.click(screen.getByRole('button', { name: /^Add Driver$/i }));

        await waitFor(() => screen.getByLabelText('Full Name'));

        fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'Test Driver' } });
        fireEvent.change(screen.getByLabelText('License Number'), { target: { value: 'DL1234' } });
        fireEvent.change(screen.getByLabelText('Contact Phone'), { target: { value: '1234567890' } });

        fireEvent.click(screen.getByRole('button', { name: /^Add$/i }));

        await waitFor(() => expect(screen.getByText('Driver added successfully!')).toBeInTheDocument());
        await waitFor(() => expect(screen.getByText('Test Driver')).toBeInTheDocument());
    });

    it('deletes a driver', async () => {
        render(<App />);

        await waitFor(() => screen.getByText('Drivers'));
        fireEvent.click(screen.getByText('Drivers'));

        // Add a driver first
        await waitFor(() => screen.getByRole('button', { name: /^Add Driver$/i }));
        fireEvent.click(screen.getByRole('button', { name: /^Add Driver$/i }));

        await waitFor(() => screen.getByLabelText('Full Name'));

        fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'Driver to Delete' } });
        fireEvent.change(screen.getByLabelText('License Number'), { target: { value: 'DL5678' } });
        fireEvent.change(screen.getByLabelText('Contact Phone'), { target: { value: '9876543210' } });

        fireEvent.click(screen.getByRole('button', { name: /^Add$/i }));

        await waitFor(() => expect(screen.getByText('Driver to Delete')).toBeInTheDocument());

        // Now delete it
        fireEvent.click(screen.getByLabelText(/^Delete Driver to Delete$/i));

        await waitFor(() => expect(screen.getByText('Driver deleted successfully!')).toBeInTheDocument());
    });

  it('adds a new trip', async () => {
        render(<App />);

        await waitFor(() => screen.getByText('Trips'));
        fireEvent.click(screen.getByText('Trips'));

        await waitFor(() => screen.getByRole('button', { name: /^Schedule Trip$/i }));
        fireEvent.click(screen.getByRole('button', { name: /^Schedule Trip$/i }));

        await waitFor(() => screen.getByLabelText('Origin'));

        fireEvent.change(screen.getByLabelText('Origin'), { target: { value: 'Origin Test' } });
        fireEvent.change(screen.getByLabelText('Destination'), { target: { value: 'Destination Test' } });

        // Mock Select Values, requires adding test vehicles/drivers
        const mockVehicleId = 'vehicle-test-id';
        const mockDriverId = 'driver-test-id';

        localStorageMock.setItem( 'transportManagementSystemData_v2', JSON.stringify( {
                    vehicles: [ { id: mockVehicleId, registrationNumber: 'VEH123', type: 'Truck', model: 'Volvo', capacity: '20T', purchaseDate: '2024-01-01', status: 'Available' } ],
                    drivers: [ { id: mockDriverId, name: 'Test Driver', licenseNumber: 'Lic123', contactPhone: '1234567890', status: 'Active' } ],
                    trips: [],
                    theme: 'light'
                }));

        // re-render to use updated local storage
        render(<App />);

        await waitFor(() => screen.getByText('Trips'));
        fireEvent.click(screen.getByText('Trips'));

        await waitFor(() => screen.getByRole('button', { name: /^Schedule Trip$/i }));
        fireEvent.click(screen.getByRole('button', { name: /^Schedule Trip$/i }));

        await waitFor(() => screen.getByLabelText('Origin'));

        fireEvent.change(screen.getByLabelText('Origin'), { target: { value: 'Origin Test' } });
        fireEvent.change(screen.getByLabelText('Destination'), { target: { value: 'Destination Test' } });
        fireEvent.change(screen.getByLabelText('Vehicle'), { target: { value: mockVehicleId } });
        fireEvent.change(screen.getByLabelText('Driver'), { target: { value: mockDriverId } });

        fireEvent.click(screen.getByRole('button', { name: /^Add$/i }));

        await waitFor(() => expect(screen.getByText('Trip scheduled successfully!')).toBeInTheDocument());
        await waitFor(() => expect(screen.getByText('Origin Test')).toBeInTheDocument());
    });


 it('deletes a trip', async () => {
      render(<App />);

        await waitFor(() => screen.getByText('Trips'));
        fireEvent.click(screen.getByText('Trips'));

        await waitFor(() => screen.getByRole('button', { name: /^Schedule Trip$/i }));
        fireEvent.click(screen.getByRole('button', { name: /^Schedule Trip$/i }));

        await waitFor(() => screen.getByLabelText('Origin'));

        fireEvent.change(screen.getByLabelText('Origin'), { target: { value: 'Origin Test' } });
        fireEvent.change(screen.getByLabelText('Destination'), { target: { value: 'Destination Test' } });

        // Mock Select Values, requires adding test vehicles/drivers
        const mockVehicleId = 'vehicle-test-id-delete';
        const mockDriverId = 'driver-test-id-delete';

        localStorageMock.setItem( 'transportManagementSystemData_v2', JSON.stringify( {
            vehicles: [ { id: mockVehicleId, registrationNumber: 'VEH123', type: 'Truck', model: 'Volvo', capacity: '20T', purchaseDate: '2024-01-01', status: 'Available' } ],
            drivers: [ { id: mockDriverId, name: 'Test Driver', licenseNumber: 'Lic123', contactPhone: '1234567890', status: 'Active' } ],
            trips: [],
            theme: 'light'
        }));

      render(<App />);

        await waitFor(() => screen.getByText('Trips'));
        fireEvent.click(screen.getByText('Trips'));

        await waitFor(() => screen.getByRole('button', { name: /^Schedule Trip$/i }));
        fireEvent.click(screen.getByRole('button', { name: /^Schedule Trip$/i }));

        await waitFor(() => screen.getByLabelText('Origin'));

        fireEvent.change(screen.getByLabelText('Origin'), { target: { value: 'Origin Test' } });
        fireEvent.change(screen.getByLabelText('Destination'), { target: { value: 'Destination Test' } });
        fireEvent.change(screen.getByLabelText('Vehicle'), { target: { value: mockVehicleId } });
        fireEvent.change(screen.getByLabelText('Driver'), { target: { value: mockDriverId } });

        fireEvent.click(screen.getByRole('button', { name: /^Add$/i }));

        await waitFor(() => expect(screen.getByText('Origin Test')).toBeInTheDocument());


        // Now delete it
        fireEvent.click(screen.getByLabelText(/^Delete trip/i));

        await waitFor(() => expect(screen.getByText('Trip deleted successfully!')).toBeInTheDocument());

    });
});