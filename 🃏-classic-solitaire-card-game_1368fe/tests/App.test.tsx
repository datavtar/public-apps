import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';


describe('App Component', () => {
  test('renders Solitaire title', () => {
    render(<App />);
    expect(screen.getByText('Solitaire')).toBeInTheDocument();
  });

  test('renders initial score and moves', () => {
    render(<App />);
    expect(screen.getByText(/Score:/)).toBeInTheDocument();
    expect(screen.getByText(/Moves:/)).toBeInTheDocument();
  });

  test('renders pause button', () => {
    render(<App />);
    const pauseButton = screen.getByRole('button', { name: /pause game/i });
    expect(pauseButton).toBeInTheDocument();
  });

  test('renders undo button', () => {
    render(<App />);
    const undoButton = screen.getByRole('button', { name: /undo last move/i });
    expect(undoButton).toBeInTheDocument();
  });

  test('renders hint button', () => {
    render(<App />);
    const hintButton = screen.getByRole('button', { name: /get hint/i });
    expect(hintButton).toBeInTheDocument();
  });

  test('renders statistics button', () => {
    render(<App />);
    const statsButton = screen.getByRole('button', { name: /view statistics/i });
    expect(statsButton).toBeInTheDocument();
  });

  test('renders settings button', () => {
    render(<App />);
    const settingsButton = screen.getByRole('button', { name: /open settings/i });
    expect(settingsButton).toBeInTheDocument();
  });

  test('new game button in settings works', async () => {
    render(<App />);
    const settingsButton = screen.getByRole('button', { name: /open settings/i });
    fireEvent.click(settingsButton);

    const newGameButton = screen.getByRole('button', { name: /new game/i });
    expect(newGameButton).toBeInTheDocument();
  });
});