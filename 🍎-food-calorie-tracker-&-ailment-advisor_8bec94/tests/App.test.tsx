import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';


// Mock the browser's localStorage
const localStorageMock = (() => {
 let store: { [key: string]: string } = {};
 return {
 getItem: (key: string) => store[key] || null,
 setItem: (key: string, value: string) => {
 store[key] = String(value);
 },
 removeItem: (key: string) => {
 delete store[key];
 },
 clear: () => {
 store = {};
 },
 };
})();

Object.defineProperty(window, 'localStorage', {
 value: localStorageMock,
});

// Mock the media devices
Object.defineProperty(navigator, 'mediaDevices', {
 value: {
 getUserMedia: jest.fn().mockResolvedValue({
 getTracks: () => [{
 stop: jest.fn(),
 }],
 }),
 },
});


// Mock date-fns format function to avoid locale issues in tests
jest.mock('date-fns/format', () => ({
 format: jest.fn((date, format) => {
 // Mock implementation to return a consistent string
 if (format === 'EEEE, MMMM d, yyyy') {
 return 'Monday, January 1, 2024'; // Consistent date string
 }
 if (format === 'yyyy-MM-dd') {
 return '2024-01-01';
 }
 if (format === 'h:mm a') {
 return '12:00 AM';
 }
 return 'mocked-date-string'; // Default mocked return
 }),
}));


describe('App Component', () => {
 beforeAll(() => {
 // Mock the matchMedia function
 window.matchMedia = jest.fn().mockReturnValue({
 matches: false,
 addListener: jest.fn(),
 removeListener: jest.fn(),
 });
 });

 beforeEach(() => {
 localStorageMock.clear();
 jest.clearAllMocks();
 });

 test('renders the app', () => {
 render(<App />);
 const nutriTrackElement = screen.getByText(/NutriTrack/i);
 expect(nutriTrackElement).toBeInTheDocument();
 });

 test('toggles dark mode', async () => {
 render(<App />);
 const darkModeButton = screen.getByRole('button', { name: /Switch to dark mode/i });

 // Initially, dark mode should be off
 expect(document.documentElement.classList.contains('dark')).toBe(false);

 // Click the button to toggle dark mode on
 fireEvent.click(darkModeButton);

 // Now, dark mode should be on
 expect(document.documentElement.classList.contains('dark')).toBe(true);

 // Click again to toggle dark mode off
 fireEvent.click(darkModeButton);

 // Dark mode should be off again
 expect(document.documentElement.classList.contains('dark')).toBe(false);
 });

 test('navigates to insights tab', () => {
 render(<App />);
 const insightsTabButton = screen.getByRole('button', { name: /Insights tab/i });
 fireEvent.click(insightsTabButton);
 });

 test('navigates to logs tab', () => {
 render(<App />);
 const logsTabButton = screen.getByRole('button', { name: /Logs tab/i });
 fireEvent.click(logsTabButton);
 });

 test('navigates to profile tab', () => {
 render(<App />);
 const profileTabButton = screen.getByRole('button', { name: /Profile tab/i });
 fireEvent.click(profileTabButton);
 });

 test('opens camera when capture food button is clicked', async () => {
 render(<App />);
 const captureFoodButton = screen.getByRole('button', { name: /Capture Food/i });

 fireEvent.click(captureFoodButton);

 // Wait for the camera to be active
 await waitFor(() => {
 expect(screen.getByRole('button', { name: /Close camera/i })).toBeInTheDocument();
 });
 });

 test('opens add food modal when add manually button is clicked', async () => {
 render(<App />);

 // Navigate to the logs tab
 const logsTabButton = screen.getByRole('button', { name: /Logs tab/i });
 fireEvent.click(logsTabButton);

 const addManuallyButton = screen.getByRole('button', { name: /Add Manually/i });
 fireEvent.click(addManuallyButton);

 await waitFor(() => {
 expect(screen.getByRole('heading', { name: /Add Food Manually/i })).toBeInTheDocument();
 });


 });

 test('displays food log entries', async () => {
 render(<App />);

 // Navigate to the logs tab
 const logsTabButton = screen.getByRole('button', { name: /Logs tab/i });
 fireEvent.click(logsTabButton);

 // Wait for the food logs to load
 await waitFor(() => {
 expect(screen.getByText(/Apple/i)).toBeInTheDocument();
 });

 // Check if the food log entries are displayed
 expect(screen.getByText(/Apple/i)).toBeVisible();
 expect(screen.getByText(/Salad with Grilled Chicken/i)).toBeVisible();
 expect(screen.getByText(/Greek Yogurt/i)).toBeVisible();
 });

 test('displays no food logs message when no logs are available', async () => {
 // Mock the foodLogs state to be an empty array
 jest.spyOn(React, 'useState').mockReturnValueOnce([[], jest.fn()]);

 render(<App />);

 // Navigate to the logs tab
 const logsTabButton = screen.getByRole('button', { name: /Logs tab/i });
 fireEvent.click(logsTabButton);

 // Wait for the component to render
 await waitFor(() => {
 expect(screen.getByText(/No food logs for this day/i)).toBeInTheDocument();
 });

 expect(screen.getByText(/No food logs for this day/i)).toBeVisible();
 });

});