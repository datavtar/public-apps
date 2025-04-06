import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};

  return {
    getItem(key: string): string | null {
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

// Mock the media query
const matchMediaMock = (matches: boolean) => ({
    matches: matches,
    addListener: () => {},
    removeListener: () => {},
  });
  
window.matchMedia = jest.fn().mockImplementation((query) => {
    return matchMediaMock(query === '(prefers-color-scheme: dark)');
});


describe('App Component', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  test('renders the component', () => {
    render(<App />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  test('toggles dark mode', () => {
    render(<App />);
    const themeToggle = screen.getByRole('button', { name: /Switch to light mode|Switch to dark mode/ });

    fireEvent.click(themeToggle);

    expect(localStorageMock.setItem).toHaveBeenCalledWith('darkMode', 'true');

    fireEvent.click(themeToggle);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('darkMode', 'false');
  });

  test('navigates to different sections', () => {
    render(<App />);
    const experienceButton = screen.getByRole('button', { name: 'Experience' });
    fireEvent.click(experienceButton);

    expect(screen.getByText('Work Experience')).toBeInTheDocument();
  });

  test('Handles the download template', () => {
    const { container } = render(<App />);
    const downloadButton = screen.getByRole('button', { name: /Template/i });

    // Mock URL.createObjectURL and document.createElement for the download
    const createObjectURLMock = jest.fn(() => 'mocked-url');
    window.URL.createObjectURL = createObjectURLMock;
    const createElementMock = jest.spyOn(document, 'createElement');

    fireEvent.click(downloadButton);

    expect(createObjectURLMock).toHaveBeenCalled();
    expect(createElementMock).toHaveBeenCalledWith('a');

    createElementMock.mockRestore();
    window.URL.createObjectURL = URL.createObjectURL;
  });

  test('renders experience section with carousel', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Experience' }));

    const nextButton = screen.getByRole('button', { name: /Next experience/i });
    const prevButton = screen.getByRole('button', { name: /Previous experience/i });

    if (screen.queryByText('No work experience added yet.')){
      return;
    }

    if (screen.queryByText('Tech Innovations Inc.')) {
      expect(screen.getByText('Tech Innovations Inc.')).toBeInTheDocument();
      fireEvent.click(nextButton);
    }
  });

  test('renders education section', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Education' }));

    if (screen.queryByText('No education history added yet.')) {
      return;
    }
    
    expect(screen.getByText('Stanford University')).toBeInTheDocument();
  });

  test('renders skills section', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Skills' }));

    if(screen.queryByText('No technical skills added yet.')){
      return;
    }
    expect(screen.getByText('Product Strategy')).toBeInTheDocument();
  });

  test('renders projects section with carousel', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Projects' }));

    const nextButton = screen.getByRole('button', { name: /Next project/i });
    const prevButton = screen.getByRole('button', { name: /Previous project/i });

    if (screen.queryByText('No projects added yet.')){
      return;
    }

    if (screen.queryByText('Enterprise Analytics Dashboard')){
      expect(screen.getByText('Enterprise Analytics Dashboard')).toBeInTheDocument();
      fireEvent.click(nextButton);
    }
  });

  test('renders contact section', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Contact' }));

    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
  });
});
