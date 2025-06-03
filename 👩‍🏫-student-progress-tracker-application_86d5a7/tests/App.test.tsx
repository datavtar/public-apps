import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';

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

// Mock the camera functionality
const mockTakePhoto = jest.fn();
const mockSwitchCamera = jest.fn();

jest.mock('react-camera-pro', () => ({
  Camera: React.forwardRef((props, ref) => {
    React.useImperativeHandle(ref, () => ({
      takePhoto: mockTakePhoto,
      switchCamera: mockSwitchCamera,
    }));
    return <div data-testid="camera-mock">Camera Mock</div>;
  }),
}));

// Helper function to add a student for testing purposes
const addTestStudent = async () => {
    fireEvent.click(screen.getByRole('button', { name: /Add Student/i }));
    await screen.findByText(/Full Name/i);
    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'Test Student' } });
    fireEvent.change(screen.getByLabelText(/Student ID/i), { target: { value: 'TS001' } });
    fireEvent.click(screen.getByRole('button', { name: /Add Photo/i }));
    await screen.findByTestId('camera-mock');
    mockTakePhoto.mockReturnValue('mock-photo-base64');
    fireEvent.click(screen.getByRole('button', { name: /Capture Photo/i }));
    fireEvent.click(screen.getByRole('button', { name: /Add Student/i }));
    await screen.findByText(/Student added successfully!/i);
};

describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
    mockTakePhoto.mockClear();
    mockSwitchCamera.mockClear();
  });

  test('renders header and navigates to dashboard', () => {
    render(<App />);
    expect(screen.getByText(/Student Progress Tracker/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Dashboard/i })).toBeInTheDocument();
  });

  test('renders header and navigates to students', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Students/i }));
    expect(screen.getByText(/Students/i)).toBeInTheDocument();
  });

  test('adds a student', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Students/i }));
    fireEvent.click(screen.getByRole('button', { name: /Add Student/i }));
    await screen.findByText(/Full Name/i);
    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'Test Student' } });
    fireEvent.change(screen.getByLabelText(/Student ID/i), { target: { value: 'TS001' } });
    fireEvent.click(screen.getByRole('button', { name: /Add Photo/i }));
    await screen.findByTestId('camera-mock');
    mockTakePhoto.mockReturnValue('mock-photo-base64');
    fireEvent.click(screen.getByRole('button', { name: /Capture Photo/i }));
    fireEvent.click(screen.getByRole('button', { name: /Add Student/i }));
    await screen.findByText(/Student added successfully!/i);

    expect(screen.getByText(/Test Student/i)).toBeInTheDocument();
  });

  test('shows toast message on student add', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Students/i }));
    fireEvent.click(screen.getByRole('button', { name: /Add Student/i }));
    await screen.findByText(/Full Name/i);
    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'Test Student' } });
    fireEvent.change(screen.getByLabelText(/Student ID/i), { target: { value: 'TS001' } });
    fireEvent.click(screen.getByRole('button', { name: /Add Photo/i }));
    await screen.findByTestId('camera-mock');
    mockTakePhoto.mockReturnValue('mock-photo-base64');
    fireEvent.click(screen.getByRole('button', { name: /Capture Photo/i }));
    fireEvent.click(screen.getByRole('button', { name: /Add Student/i }));
    await screen.findByText(/Student added successfully!/i);
    expect(screen.getByText(/Student added successfully!/i)).toBeVisible();
  });

 test('deletes a student', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Students/i }));

    // Add a test student first
    await addTestStudent();

    // Now delete the student
    fireEvent.click(screen.getByRole('button', { name: /Trash2/i })); // Delete button
    await screen.findByText(/delete Test Student\?/i);
    fireEvent.click(screen.getByRole('button', { name: /Delete/i })); // Confirm delete

    await screen.findByText(/Student deleted successfully!/i);
    expect(screen.queryByText(/Test Student/i)).not.toBeInTheDocument();
 });

  test('imports students from CSV', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Students/i }));
    fireEvent.click(screen.getByRole('button', { name: /Import/i }));
    const fileContent = 'Student ID,Full Name\nS004,"New Student"';
    const file = new File([fileContent], 'test.csv', { type: 'text/csv' });
    const input = screen.getByRole('textbox', {hidden: true});
    fireEvent.change(input, { target: { files: [file] } });

    await screen.findByText(/1 students imported successfully!/i);
    expect(screen.getByText(/New Student/i)).toBeInTheDocument();
  });

  test('exports all data', () => {
    // Mock createObjectURL and revokeObjectURL
    const mockCreateObjectURL = jest.fn();
    const mockRevokeObjectURL = jest.fn();
    global.URL.createObjectURL = mockCreateObjectURL;
    global.URL.revokeObjectURL = mockRevokeObjectURL;

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Students/i }));
    fireEvent.click(screen.getByRole('button', { name: /Export All/i }));

    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(screen.getByText(/All data exported!/i)).toBeVisible();

    // Restore original functions after the test
    global.URL.createObjectURL = URL.createObjectURL;
    global.URL.revokeObjectURL = URL.revokeObjectURL;
  });
});