import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};

  return {
    getItem(key: string): string | null {
      return store[key] || null;
    },
    setItem(key: string, value: string): void {
      store[key] = String(value);
    },
    removeItem(key: string): void {
      delete store[key];
    },
    clear(): void {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});


// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});


describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('renders the component', () => {
    render(<App />);
    expect(screen.getByText('Lesson Planner')).toBeInTheDocument();
  });

  test('New Lesson Plan Modal Opens and Closes', async () => {
    render(<App />);
    const newPlanButton = screen.getByRole('button', { name: 'New Plan' });
    fireEvent.click(newPlanButton);
    await waitFor(() => {
      expect(screen.getByText('Create New Lesson Plan')).toBeInTheDocument();
    });
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelButton);
    await waitFor(() => {
      expect(screen.queryByText('Create New Lesson Plan')).not.toBeInTheDocument();
    });
  });

  test('New Material Modal Opens and Closes', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Teaching Materials' }));
    const newMaterialButton = screen.getByRole('button', { name: 'New Material' });
    fireEvent.click(newMaterialButton);
    await waitFor(() => {
      expect(screen.getByText('Add New Teaching Material')).toBeInTheDocument();
    });
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelButton);
    await waitFor(() => {
      expect(screen.queryByText('Add New Teaching Material')).not.toBeInTheDocument();
    });
  });

  test('toggle dark mode', async () => {
    render(<App />);
    const toggleButton = screen.getByRole('button', {name: /switch to dark mode/i});
    fireEvent.click(toggleButton);

    expect(localStorage.setItem).toHaveBeenCalledWith('darkMode', 'true');
  });

  test('Create a new lesson plan', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'New Plan' }));

    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Test Lesson' } });
    fireEvent.change(screen.getByLabelText('Subject'), { target: { value: 'Test Subject' } });
    fireEvent.change(screen.getByLabelText('Grade'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Duration (minutes)'), { target: { value: '30' } });
    fireEvent.change(screen.getByLabelText('Objectives (one per line)'), { target: { value: 'Objective 1\nObjective 2' } });
    fireEvent.change(screen.getByLabelText('Materials (one per line)'), { target: { value: 'Material 1\nMaterial 2' } });
    fireEvent.change(screen.getByLabelText('Assessment'), { target: { value: 'Test Assessment' } });
    fireEvent.change(screen.getByLabelText('Notes'), { target: { value: 'Test Notes' } });
    fireEvent.change(screen.getByLabelText('Tags (comma separated)'), { target: { value: 'tag1, tag2' } });
    fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'published' } });

    fireEvent.click(screen.getByRole('button', { name: 'Create Lesson Plan' }));

    await waitFor(() => {
      expect(screen.queryByText('Create New Lesson Plan')).not.toBeInTheDocument();
      expect(screen.getByText('Test Lesson')).toBeInTheDocument();
    });
  });

  test('Delete a lesson plan', async () => {
    render(<App />);

    // Create a lesson plan first to delete
    fireEvent.click(screen.getByRole('button', { name: 'New Plan' }));

    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Lesson to Delete' } });
    fireEvent.change(screen.getByLabelText('Subject'), { target: { value: 'Subject' } });
    fireEvent.change(screen.getByLabelText('Grade'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Duration (minutes)'), { target: { value: '30' } });
    fireEvent.change(screen.getByLabelText('Objectives (one per line)'), { target: { value: 'Objective' } });
    fireEvent.change(screen.getByLabelText('Materials (one per line)'), { target: { value: 'Material' } });
    fireEvent.change(screen.getByLabelText('Assessment'), { target: { value: 'Assessment' } });
    fireEvent.change(screen.getByLabelText('Notes'), { target: { value: 'Notes' } });
    fireEvent.change(screen.getByLabelText('Tags (comma separated)'), { target: { value: 'tag' } });
    fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'published' } });

    fireEvent.click(screen.getByRole('button', { name: 'Create Lesson Plan' }));

    await waitFor(() => expect(screen.getByText('Lesson to Delete')).toBeInTheDocument());

    const deleteButton = screen.getAllByRole('button', { name: /trash2/i })[0];
    fireEvent.click(deleteButton);

    // Mock window.confirm
    const confirmMock = jest.spyOn(window, 'confirm');
    confirmMock.mockImplementation(() => true);

    await waitFor(() => expect(confirmMock).toHaveBeenCalled());

    await waitFor(() => expect(screen.queryByText('Lesson to Delete')).not.toBeInTheDocument());
  });
});