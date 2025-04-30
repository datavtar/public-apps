import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';


describe('App Component', () => {
  test('renders without crashing', () => {
    render(<App />);
    expect(screen.getByText(/BIM Modeler/i)).toBeInTheDocument();
  });

  test('adds a new project', async () => {
    render(<App />);

    // Open the new project modal
    const newProjectButton = screen.getByRole('button', { name: /New project/i });
    fireEvent.click(newProjectButton);

    // Fill in the project details
    const projectNameInput = screen.getByLabelText(/Project Name/i);
    fireEvent.change(projectNameInput, { target: { value: 'Test Project' } });

    const projectDescriptionInput = screen.getByLabelText(/Description/i);
    fireEvent.change(projectDescriptionInput, { target: { value: 'Test Description' } });

    // Create the project
    const createProjectButton = screen.getByRole('button', { name: /Create Project/i });
    fireEvent.click(createProjectButton);

    // Wait for the project to be created and selected
    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Test Project' }).selected).toBe(true);
    });
  });

  test('adds a new element', async () => {
    render(<App />);

    // Open the new element modal
    const addElementButton = screen.getByRole('button', { name: /Add Element/i });
    fireEvent.click(addElementButton);

    // Fill in the element details
    const elementNameInput = screen.getByLabelText(/Name/i);
    fireEvent.change(elementNameInput, { target: { value: 'Test Element' } });

    // Add the element
    const createElementButton = screen.getByRole('button', { name: /Add Element/i });
    fireEvent.click(createElementButton);

    // Wait for the element to be created
    await waitFor(() => {
      expect(screen.getByText(/Test Element/i)).toBeInTheDocument();
    });
  });

 test('deletes a project', async () => {
    render(<App />);

    // First add a project to delete
    const newProjectButton = screen.getByRole('button', { name: /New project/i });
    fireEvent.click(newProjectButton);

    const projectNameInput = screen.getByLabelText(/Project Name/i);
    fireEvent.change(projectNameInput, { target: { value: 'ToDelete Project' } });

    const createProjectButton = screen.getByRole('button', { name: /Create Project/i });
    fireEvent.click(createProjectButton);

    await waitFor(() => {
        expect(screen.getByRole('option', { name: 'ToDelete Project' }).selected).toBe(true);
      });

    // Then Delete the Project
    const deleteProjectButton = screen.getAllByRole('button', {name: /Delete project/i})[0];

    // Mock the window.confirm function
    const mockConfirm = jest.spyOn(window, 'confirm');
    mockConfirm.mockImplementation(() => true);

    fireEvent.click(deleteProjectButton);

    // Restore the original window.confirm function after the test
    mockConfirm.mockRestore();

    // Wait for the project to be deleted
     await waitFor(() => {
            expect(screen.queryByRole('option', { name: 'ToDelete Project' })).toBeNull();
          });
  });

  test('toggles dark mode', async () => {
    render(<App />);

    const darkModeButton = screen.getByRole('button', { name: /Switch to dark mode/i });
    fireEvent.click(darkModeButton);

    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    const lightModeButton = screen.getByRole('button', { name: /Switch to light mode/i });
    fireEvent.click(lightModeButton);

    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
  });


  test('renders the 3D model view by default', () => {
    render(<App />);
    expect(screen.getByText(/OrbitControls/i)).toBeInTheDocument();
  });



});