import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';



describe('App Component', () => {
  test('renders the component', () => {
    render(<App />);
    expect(screen.getByText(/Student Progress Tracker/i)).toBeInTheDocument();
  });

  test('adds a new student', async () => {
    render(<App />);

    const nameInput = screen.getByRole('textbox', { name: /Student Name/i });
    const progressInput = screen.getByRole('spinbutton', { name: /Student Progress/i });
    const addButton = screen.getByRole('button', { name: /Add Student/i });

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(progressInput, { target: { value: '85' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
      expect(screen.getByText(/85%/i)).toBeInTheDocument();
      expect(screen.getByText(/B/i)).toBeInTheDocument();
    });
  });

  test('edits a student', async () => {
    render(<App />);

    // Add a student first
    const nameInput = screen.getByRole('textbox', { name: /Student Name/i });
    const progressInput = screen.getByRole('spinbutton', { name: /Student Progress/i });
    const addButton = screen.getByRole('button', { name: /Add Student/i });

    fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });
    fireEvent.change(progressInput, { target: { value: '92' } });
    fireEvent.click(addButton);

    await waitFor(() => expect(screen.getByText(/Jane Doe/i)).toBeInTheDocument());

    const editButton = screen.getByRole('button', { name: /Edit/i });
    fireEvent.click(editButton);

    const editNameInput = screen.getByRole('textbox', { name: /Edit Student Name/i });
    fireEvent.change(editNameInput, { target: { value: 'Jane Updated' } });

    const editProgressInput = screen.getByRole('spinbutton', { name: /Edit Student Progress/i });
    fireEvent.change(editProgressInput, { target: { value: '78' } });

    const updateButton = screen.getByRole('button', { name: /Update/i });
    fireEvent.click(updateButton);

    await waitFor(() => {
        expect(screen.getByText(/Jane Updated/i)).toBeInTheDocument();
        expect(screen.getByText(/78%/i)).toBeInTheDocument();
        expect(screen.getByText(/C/i)).toBeInTheDocument();
    });
  });

  test('deletes a student', async () => {
    render(<App />);

    // Add a student first
    const nameInput = screen.getByRole('textbox', { name: /Student Name/i });
    const progressInput = screen.getByRole('spinbutton', { name: /Student Progress/i });
    const addButton = screen.getByRole('button', { name: /Add Student/i });

    fireEvent.change(nameInput, { target: { value: 'Test Student' } });
    fireEvent.change(progressInput, { target: { value: '70' } });
    fireEvent.click(addButton);

    await waitFor(() => expect(screen.getByText(/Test Student/i)).toBeInTheDocument());

    const deleteButton = screen.getByRole('button', { name: /Delete/i });
    fireEvent.click(deleteButton);

    await waitFor(() => {
        expect(screen.queryByText(/Test Student/i)).toBeNull();
    });
  });

  test('filters students by grade', async () => {
    render(<App />);

        // Add a student first
    const nameInput = screen.getByRole('textbox', { name: /Student Name/i });
    const progressInput = screen.getByRole('spinbutton', { name: /Student Progress/i });
    const addButton = screen.getByRole('button', { name: /Add Student/i });

    fireEvent.change(nameInput, { target: { value: 'Test Student A' } });
    fireEvent.change(progressInput, { target: { value: '95' } });
    fireEvent.click(addButton);

    fireEvent.change(nameInput, { target: { value: 'Test Student B' } });
    fireEvent.change(progressInput, { target: { value: '85' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText(/Test Student A/i)).toBeInTheDocument();
      expect(screen.getByText(/Test Student B/i)).toBeInTheDocument();
    });

    const filterSelect = screen.getByRole('combobox', { name: /Filter by Grade/i });
    fireEvent.change(filterSelect, { target: { value: 'A' } });

    await waitFor(() => {
      expect(screen.getByText(/Test Student A/i)).toBeInTheDocument();
      expect(screen.queryByText(/Test Student B/i)).toBeNull();
    });
  });

  test('searches students by name', async () => {
     render(<App />);

        // Add a student first
    const nameInput = screen.getByRole('textbox', { name: /Student Name/i });
    const progressInput = screen.getByRole('spinbutton', { name: /Student Progress/i });
    const addButton = screen.getByRole('button', { name: /Add Student/i });

    fireEvent.change(nameInput, { target: { value: 'Alice Smith' } });
    fireEvent.change(progressInput, { target: { value: '95' } });
    fireEvent.click(addButton);

    fireEvent.change(nameInput, { target: { value: 'Bob Johnson' } });
    fireEvent.change(progressInput, { target: { value: '85' } });
    fireEvent.click(addButton);

     await waitFor(() => {
      expect(screen.getByText(/Alice Smith/i)).toBeInTheDocument();
      expect(screen.getByText(/Bob Johnson/i)).toBeInTheDocument();
    });

    const searchInput = screen.getByRole('textbox', { name: /Search Students/i });
    fireEvent.change(searchInput, { target: { value: 'Alice' } });

     await waitFor(() => {
      expect(screen.getByText(/Alice Smith/i)).toBeInTheDocument();
      expect(screen.queryByText(/Bob Johnson/i)).toBeNull();
    });
  });
});