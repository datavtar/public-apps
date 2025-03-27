import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';


describe('App Component', () => {
  test('renders the component', () => {
    render(<App />);
    expect(screen.getByText('Student Progress Tracker')).toBeInTheDocument();
  });

  test('opens and closes the modal for adding a student', async () => {
    render(<App />);

    // Arrange
    const addButton = screen.getByRole('button', { name: /Add Student/i });

    // Act
    fireEvent.click(addButton);

    // Assert
    expect(screen.getByText('Add New Student')).toBeInTheDocument();

    // Act
    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);

    // Assert
    expect(screen.queryByText('Add New Student')).not.toBeInTheDocument();
  });

  test('adds a new student', async () => {
    render(<App />);

    // Arrange
    const addButton = screen.getByRole('button', { name: /Add Student/i });
    fireEvent.click(addButton);

    // Act
    fireEvent.change(screen.getByLabelText(/Student Name/i), { target: { value: 'Test Student' } });
    fireEvent.change(screen.getByLabelText(/Subject/i), { target: { value: 'Test Subject' } });
    fireEvent.change(screen.getByLabelText(/Grade/i), { target: { value: 'A' } });

    const submitButton = screen.getByRole('button', { name: /Add Student/i });
    fireEvent.click(submitButton);

    // Assert
    expect(await screen.findByText('Test Student')).toBeInTheDocument();
  });

    test('deletes a student', async () => {
    // Arrange
    const { rerender } = render(<App />);

    let deleteButton;
    try {
      deleteButton = await screen.findByRole('button', { name: /^delete-/ });
    } catch (error) {
      console.error("Delete button not found", error);
      throw error; // Re-throw the error to fail the test
    }


    const initialStudentName = screen.getByText('Alice Smith');

    // Mock the window.confirm function
    const confirmMock = jest.spyOn(window, 'confirm');
    confirmMock.mockImplementation(() => true);

    // Act
    fireEvent.click(deleteButton);

    // Assert
    expect(confirmMock).toHaveBeenCalled();
    expect(initialStudentName).not.toBeInTheDocument();

    confirmMock.mockRestore(); // Restore the original confirm function
  });

  test('filters students by subject', async () => {
    render(<App />);

    // Arrange
    const selectElement = screen.getByLabelText(/Filter by Subject/i);

    // Act
    fireEvent.change(selectElement, { target: { value: 'Mathematics' } });

    // Assert
    expect(await screen.findByText('Alice Smith')).toBeInTheDocument();
    expect(screen.queryByText('Bob Johnson')).not.toBeInTheDocument();
  });

  test('searches students by name', async () => {
      render(<App />);

      // Arrange
      const searchInput = screen.getByLabelText(/Search/i);

      // Act
      fireEvent.change(searchInput, { target: { value: 'Alice' } });

      // Assert
      expect(await screen.findByText('Alice Smith')).toBeInTheDocument();
      expect(screen.queryByText('Bob Johnson')).not.toBeInTheDocument();
    });

    test('sorts students by name', async () => {
    render(<App />);

    // Arrange
    const nameHeader = screen.getByRole('button', { name: /sort-name/i });

    // Act
    fireEvent.click(nameHeader);

    const firstStudent = await screen.findAllByRole('cell', {name: /Alice Smith/i});

    // Assert
    expect(firstStudent[0]).toBeInTheDocument();
  });

   test('opens the edit modal', async () => {
    render(<App />);

    // Find the edit button for the first student
    const editButton = await screen.findByRole('button', { name: /^edit-/ });

    // Act
    fireEvent.click(editButton);

    // Assert
    expect(screen.getByText('Edit Student')).toBeInTheDocument();

    // Close the modal
    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);

    expect(screen.queryByText('Edit Student')).not.toBeInTheDocument();
  });
});