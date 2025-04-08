import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
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

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});



describe('App Component', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(<App />);
    expect(screen.getByText('Loading CV data...')).toBeInTheDocument();
  });

  it('renders the app with default CV data after loading', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('Jamie Sheppard')).toBeInTheDocument();
    });
  });

  it('displays personal info after loading', async () => {
    render(<App />);
    await waitFor(() => {
        expect(screen.getByText('Senior Product Manager')).toBeInTheDocument();
        expect(screen.getByText('jamie.sheppard@example.com')).toBeInTheDocument();
    });

  });

  it('navigates to the experience section when the Experience button is clicked', async () => {
    render(<App />);

    await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Experience' })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Experience' }));

    await waitFor(() => {
        expect(screen.getByText('Professional Experience')).toBeInTheDocument();
    });
  });

  it('navigates between jobs in experience section', async () => {
    render(<App />);

     await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Experience' })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Experience' }));

    await waitFor(() => {
        expect(screen.getByText('Professional Experience')).toBeInTheDocument();
    });

    const nextButton = screen.getByRole('button', { name: /next job/i });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText(/E-Commerce Giants/i)).toBeInTheDocument();
    });

    const prevButton = screen.getByRole('button', { name: /previous job/i });
    fireEvent.click(prevButton);

      await waitFor(() => {
        expect(screen.getByText(/TechVision Inc./i)).toBeInTheDocument();
    });

  });

  it('displays the first job by default in experience section', async () => {
     render(<App />);
     await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Experience' })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Experience' }));
    await waitFor(() => {
        expect(screen.getByText('Professional Experience')).toBeInTheDocument();
    });
     await waitFor(() => {
        expect(screen.getByText(/Senior Product Manager/i)).toBeInTheDocument();
    });
  });

  it('navigates to the education section when the Education button is clicked', async () => {
    render(<App />);
    await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Education' })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Education' }));
    await waitFor(() => {
        expect(screen.getByText('Education')).toBeInTheDocument();
    });

    await waitFor(() => {
        expect(screen.getByText('Stanford University')).toBeInTheDocument();
    });

  });

  it('toggles dark mode', async () => {
    render(<App />);
    const darkModeButton = await screen.findByRole('button', { name: /switch to dark mode/i });

    fireEvent.click(darkModeButton);
    expect(localStorageMock.getItem('darkMode')).toBe('true');

    fireEvent.click(darkModeButton);
    expect(localStorageMock.getItem('darkMode')).toBe('false');
  });

  it('opens and closes modal', async () => {
    render(<App />);

    await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Experience' })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Experience' }));

     await waitFor(() => {
        expect(screen.getByText('Professional Experience')).toBeInTheDocument();
    });

    const viewAllResponsibilitiesButton = await screen.findByRole('button', { name: /View all/i });

    fireEvent.click(viewAllResponsibilitiesButton);

    await waitFor(() => {
      expect(screen.getByText('Key Responsibilities')).toBeInTheDocument();
    });

    const closeModalButton = screen.getByRole('button', { name: /close modal/i });
    fireEvent.click(closeModalButton);

    await waitFor(() => {
      expect(screen.queryByText('Key Responsibilities')).not.toBeInTheDocument();
    });
  });

  it('toggles skills section', async () => {
      render(<App />);
      await waitFor(() => {
          expect(screen.getByRole('button', { name: 'Education' })).toBeInTheDocument();
      });

      const toggleSkillsButton = await screen.findByRole('button', { name: /Expand skills/i });
      fireEvent.click(toggleSkillsButton);
      await waitFor(() => {
        expect(screen.getByRole('button', {name: /Collapse skills/i})).toBeInTheDocument()
      })


    })
});
