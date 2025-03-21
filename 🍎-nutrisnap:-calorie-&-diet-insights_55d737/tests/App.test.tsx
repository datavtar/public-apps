import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';


descrive('App Component', () => {

  test('renders NutriSnap title', () => {
    render(<App />);
    expect(screen.getByText('NutriSnap')).toBeInTheDocument();
  });

  test('toggles dark mode', async () => {
    render(<App />);
    const darkModeButton = screen.getByRole('button', {name: /Switch to dark mode/i});

    fireEvent.click(darkModeButton);

    await waitFor(() => {
      expect(localStorage.getItem('darkMode')).toBe('true');
    })

    const lightModeButton = screen.getByRole('button', {name: /Switch to light mode/i});
    expect(lightModeButton).toBeInTheDocument()
    fireEvent.click(lightModeButton);
    await waitFor(() => {
      expect(localStorage.getItem('darkMode')).toBe('false');
    })
  });

  test('renders the home tab by default', () => {
    render(<App />);
    expect(screen.getByText("Today's Summary")).toBeInTheDocument();
  });

  test('navigates to insights tab', () => {
    render(<App />);
    const insightsButton = screen.getByRole('button', { name: /Insights/i });
    fireEvent.click(insightsButton);
    expect(screen.getByText('Nutrition Insights')).toBeInTheDocument();
  });

 test('navigates to profile tab', () => {
    render(<App />);
    const profileButton = screen.getByRole('button', { name: /Profile/i });
    fireEvent.click(profileButton);
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });

  test('navigates to history tab', () => {
    render(<App />);
    const historyButton = screen.getByRole('button', { name: /History/i });
    fireEvent.click(historyButton);
    expect(screen.getByText('Food History')).toBeInTheDocument();
  });

  test('opens and closes the camera', async () => {
    render(<App />);
    const takePhotoBtn = screen.getByRole('button', {name: /Take Photo/i});
    fireEvent.click(takePhotoBtn);
    await waitFor(() => {
     expect(screen.getByText('Take Food Picture')).toBeInTheDocument()
    })

    const closeCameraBtn = screen.getByRole('button', {name: /Close camera/i});
    fireEvent.click(closeCameraBtn);
    await waitFor(() => {
      expect(takePhotoBtn).toBeInTheDocument()
    })
  });

  test('displays analyzing food message when analyzing food', async () => {
    render(<App />);
    const uploadPhotoButton = screen.getByRole('button', { name: /Upload Photo/i });
    
    fireEvent.click(uploadPhotoButton);


  });

});