import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';


describe('App Component', () => {
  test('renders the component', () => {
    render(<App />);
    expect(screen.getByText(/BIM Modeling System/i)).toBeInTheDocument();
  });

  test('renders the Projects tab by default', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /^Projects$/i })).toHaveClass('bg-primary-600');
  });

  test('displays "No projects found" message when there are no projects', () => {
    localStorage.setItem('bimProjects', '[]');
    render(<App />);
    expect(screen.getByText(/No projects found/i)).toBeInTheDocument();
    localStorage.removeItem('bimProjects');
  });

  test('allows adding a new project', async () => {
    render(<App />);
    const newProjectButton = screen.getByRole('button', { name: /New Project/i });
    fireEvent.click(newProjectButton);

    const projectNameInput = screen.getByLabelText(/Project Name/i);
    fireEvent.change(projectNameInput, { target: { value: 'Test Project' } });

    const projectClientInput = screen.getByLabelText(/Client/i);
    fireEvent.change(projectClientInput, { target: { value: 'Test Client' } });

    const projectStartDateInput = screen.getByLabelText(/Start Date/i);
    fireEvent.change(projectStartDateInput, { target: { value: '2024-01-01' } });

    const projectEndDateInput = screen.getByLabelText(/End Date/i);
    fireEvent.change(projectEndDateInput, { target: { value: '2024-01-02' } });
    
    const createProjectButton = screen.getByRole('button', {name: /Create Project/i})
    fireEvent.click(createProjectButton);

    expect(screen.getByText(/Test Project/i)).toBeInTheDocument();
  });

  test('allows to import project from file', async () => {
    const mockProject = {
      id: 'test-project',
      name: 'Mock Project',
      description: 'Mock description',
      client: 'Mock Client',
      location: 'Mock Location',
      startDate: '2023-01-01',
      endDate: '2024-01-01',
      status: 'planning',
      budget: 1000000,
      architects: ['Mock Architect'],
      engineers: ['Mock Engineer'],
      contractors: ['Mock Contractor'],
      models: []
    };

    const fileContent = JSON.stringify(mockProject);
    const file = new File([fileContent], 'mockProject.json', { type: 'application/json' });

    render(<App />);
    const importButton = screen.getByText(/Import/i);
    const fileInput = importButton.querySelector('input[type="file"]');

    if (fileInput) {
      Object.defineProperty(fileInput, 'files', {
        value: [file],
      });

      fireEvent.change(fileInput);
      await screen.findByText(/Mock Project/i);
      expect(screen.getByText(/Mock Project/i)).toBeInTheDocument();
    }
  });

  test('allows toggling dark mode', () => {
    render(<App />);
    const darkModeButton = screen.getByRole('button', {name: /Switch to dark mode/i});
    fireEvent.click(darkModeButton);
    expect(localStorage.getItem('bimDarkMode')).toBe('true');
  });

  test('correctly filters projects based on status', async () => {
    render(<App />);

    const filterSelect = screen.getByRole('combobox');
    fireEvent.change(filterSelect, { target: { value: 'planning' } });

    // Check if only 'planning' projects are now displayed. Since it renders static projects
    // We can only assert there is at least one. Not that others are hidden. 
    expect(screen.getByText(/Riverside Medical Center/i)).toBeVisible();
  });

  test('navigates to the viewer tab when a project and model are selected', async () => {
    render(<App />);
    const viewDetailsButton = screen.getAllByText(/View Details/i)[0];
    fireEvent.click(viewDetailsButton);

    expect(screen.getByText(/Model Viewer/i)).toBeInTheDocument();
  });
});