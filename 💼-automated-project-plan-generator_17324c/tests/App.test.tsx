import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';


describe('App Component', () => {
  test('renders learn react link', () => {
    render(<App />);
    const linkElement = screen.getByText(/PreSales Architect/i);
    expect(linkElement).toBeInTheDocument();
  });

  test('renders the component', () => {
    render(<App />);
    expect(screen.getByText(/Project Plans/i)).toBeInTheDocument();
  });

  test('create new plan button exists', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /New Plan/i })).toBeInTheDocument();
  });

  test('import button exists', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /Import/i })).toBeInTheDocument();
  });

  test('search input exists', () => {
    render(<App />);
    expect(screen.getByPlaceholderText(/Search plans.../i)).toBeInTheDocument();
  });

    test('renders project plans list', () => {
        render(<App />);
        expect(screen.getByText(/Project Plans/i)).toBeInTheDocument();
    });

    test('renders template download button', () => {
        render(<App />);
        expect(screen.getByRole('button', { name: /Template/i })).toBeInTheDocument();
    });

  test('handles PDF file upload', async () => {
    render(<App />);
    const importButton = screen.getByRole('button', { name: /Import/i });
    const fileInput = importButton.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['dummy content'], 'test.pdf', { type: 'application/pdf' });

    // Mock URL.createObjectURL
    URL.createObjectURL = jest.fn(() => 'blob://mock-url');

    fireEvent.change(fileInput, {
      target: { files: [file] },
    });

    // Wait for the PDF preview modal to open
    await screen.findByText(/PDF Preview: test.pdf/i);
    expect(screen.getByText(/PDF Preview: test.pdf/i)).toBeVisible();

    // clean up mock
    (URL.createObjectURL as jest.Mock).mockRestore();
  });


  test('displays error message for non-PDF file upload', () => {
    render(<App />);
    const importButton = screen.getByRole('button', { name: /Import/i });
    const fileInput = importButton.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['dummy content'], 'test.txt', { type: 'text/plain' });

    fireEvent.change(fileInput, {
      target: { files: [file] },
    });

    // Wait for the error message to appear
    setTimeout(() => {
        expect(screen.getByText(/Please upload a PDF file only/i)).toBeInTheDocument();
    }, 0);
  });

  test('renders the generate plan section', () => {
    render(<App />);
    const generatePlanButton = screen.getByText(/Generate Plan/i);
    expect(generatePlanButton).toBeInTheDocument();
  });
});