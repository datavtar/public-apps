import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';

// Mock the AILayer component to avoid actual AI calls
const mockAILayer = React.forwardRef((props, ref) => {
  React.useImperativeHandle(ref, () => ({
    sendToAI: async () => {
      props.onLoading(true);
      // Simulate a successful AI response after a delay
      setTimeout(() => {
        props.onResult('Mock AI Description');
        props.onLoading(false);
      }, 500);
    },
  }));
  return null;
});

jest.mock('../src/App', () => {
  const OriginalApp = jest.requireActual('../src/App').default;
  return {
    __esModule: true,
    default: function MockedApp(props) {
      return <OriginalApp {...props} AILayer={mockAILayer} />;
    },
  };
});



describe('App Component', () => {
  test('renders without crashing', () => {
    render(<App />);
    expect(screen.getByText(/AI Image Describer/i)).toBeInTheDocument();
  });

  test('allows image upload and displays preview', async () => {
    render(<App />);
    const file = new File(['(⌐□_□)'], 'test.png', { type: 'image/png' });
    const input = screen.getByLabelText(/Upload Image/i);

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
        expect(screen.getByAltText('Selected preview')).toBeInTheDocument();
    });
  });

  test('displays error message for invalid file type', async () => {
    render(<App />);
    const file = new File(['(⌐□_□)'], 'test.txt', { type: 'text/plain' });
    const input = screen.getByLabelText(/Upload Image/i);

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText(/Invalid file type/i)).toBeInTheDocument();
    });
  });

  test('shows loading state when describing image', async () => {
    render(<App />);
    const file = new File(['(⌐□_□)'], 'test.png', { type: 'image/png' });
    const input = screen.getByLabelText(/Upload Image/i);
    fireEvent.change(input, { target: { files: [file] } });

    const describeButton = await screen.findByRole('button', { name: /Describe Image/i });
    fireEvent.click(describeButton);

    await waitFor(() => {
      expect(screen.getByText(/AI is thinking.../i)).toBeInTheDocument();
    });
  });

  test('displays AI generated description after successful description', async () => {
    render(<App />);
    const file = new File(['(⌐□_□)'], 'test.png', { type: 'image/png' });
    const input = screen.getByLabelText(/Upload Image/i);
    fireEvent.change(input, { target: { files: [file] } });

    const describeButton = await screen.findByRole('button', { name: /Describe Image/i });
    fireEvent.click(describeButton);

    await waitFor(() => {
      expect(screen.getByText(/AI Generated Description/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText(/Mock AI Description/i)).toBeInTheDocument();
    });
  });

  test('clears selected image and description when clear button is clicked', async () => {
    render(<App />);
    const file = new File(['(⌐□_□)'], 'test.png', { type: 'image/png' });
    const input = screen.getByLabelText(/Upload Image/i);
    fireEvent.change(input, { target: { files: [file] } });

    const describeButton = await screen.findByRole('button', { name: /Describe Image/i });
    fireEvent.click(describeButton);

    const clearButton = await screen.findByRole('button', { name: /Clear/i });
    fireEvent.click(clearButton);

    await waitFor(() => {
      expect(screen.queryByAltText('Selected preview')).not.toBeInTheDocument();
      expect(screen.queryByText(/AI Generated Description/i)).not.toBeInTheDocument();
    });
  });
});
