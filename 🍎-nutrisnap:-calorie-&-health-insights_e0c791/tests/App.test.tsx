import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};

  return {
    getItem(key: string): string | null {
      return store[key] || null;
    },
    setItem(key: string, value: string): void {
      store[key] = String(value);
    },
    removeItem(key: string): void {
      delete store[key];
    },
    clear(): void {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock camera ref
const mockCameraRef = {
  current: {
    takePhoto: jest.fn(() => 'mock-image-data'),
  },
};

// Mock the mockFoodRecognition function
const mockFoodRecognition = jest.fn(() => ({
    id: '123',
    name: 'Apple',
    image: 'mock-image-data',
    calories: 95,
    nutrients: {
        protein: 0.5,
        carbs: 25,
        fat: 0.3,
        fiber: 4
    },
    benefits: ['Rich in antioxidants', 'Supports heart health', 'Good source of fiber'],
    warnings: [],
    timestamp: Date.now(),
    mealType: 'lunch'
}));



describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test('renders NutriSnap title', () => {
    render(<App />);
    expect(screen.getByText('NutriSnap')).toBeInTheDocument();
  });

  test('renders logs view by default', () => {
    render(<App />);
    expect(screen.getByText('Nutrition Log')).toBeInTheDocument();
  });

  test('navigates to settings view', async () => {
    render(<App />);
    const settingsButton = screen.getByRole('button', { name: /settings/i });
    fireEvent.click(settingsButton);
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  test('navigates to logs view', async () => {
    render(<App />);
    const settingsButton = screen.getByRole('button', { name: /settings/i });
    fireEvent.click(settingsButton);
    const logButton = screen.getByRole('button', { name: /log/i });
    fireEvent.click(logButton);
    expect(screen.getByText('Nutrition Log')).toBeInTheDocument();
  });

    test('renders the camera view after clicking Add Food button', async () => {
        render(<App />);
        const addFoodButton = screen.getByRole('button', { name: /add food/i });
        fireEvent.click(addFoodButton);
        expect(screen.getByText('Meal Type')).toBeInTheDocument();
    });

  test('shows analyzing food message when capturing image', async () => {
    // Mock camera
    jest.spyOn(React, 'useRef').mockReturnValue(mockCameraRef as any);

    const { container } = render(<App />);
    const addFoodButton = screen.getByRole('button', { name: /add food/i });
    fireEvent.click(addFoodButton);

    const captureButton = screen.getByRole('button', { name: /camera/i });

    fireEvent.click(captureButton);

    // Advance timers to simulate loading
    jest.advanceTimersByTime(500); //Simulate immediate loading
    const analyzingFood = screen.queryByText(/analyzing food/i);

    expect(analyzingFood).toBeInTheDocument();
    jest.advanceTimersByTime(1000); // Simulate food processing completion

    await waitFor(() => {
        const analyzingFoodFinished = screen.queryByText(/analyzing food/i);
        expect(analyzingFoodFinished).toBeNull();
    });
});


  test('renders results view after capturing image and simulating food recognition', async () => {
    // Mock camera
    jest.spyOn(React, 'useRef').mockReturnValue(mockCameraRef as any);

    // Mock food recognition function
    (React as any).useState = jest.fn()
      .mockReturnValueOnce(['logs', (view: string) => {}]) // view
      .mockReturnValueOnce([null, (image: string | null) => {}]) // image
      .mockReturnValueOnce([null, (food: any) => {}]) // currentFood
      .mockReturnValueOnce([[], (logs: any[]) => {}]) // logs
      .mockReturnValueOnce([{
          name: 'User',
          age: 30,
          weight: 70,
          height: 170,
          gender: 'male',
          activityLevel: 'moderate',
          healthConditions: ['None'],
          targetCalories: 2000
      }, (profile: any) => {}]) // userProfile
      .mockReturnValueOnce([false, (editing: boolean) => {}]) // editingProfile
      .mockReturnValueOnce([null, (tempProfile: any) => {}]) // tempProfile
      .mockReturnValueOnce(['2024-01-01', (date: string) => {}]) // selectedDate
      .mockReturnValueOnce([false, (loading: boolean) => {}]) // isLoading
      .mockReturnValueOnce(['lunch', (meal: string) => {}]) // mealType
      .mockReturnValueOnce([false, (showHealth: boolean) => {}]) // showAddHealthCondition
      .mockReturnValueOnce(['', (health: string) => {}]) // newHealthCondition
      .mockReturnValueOnce([false, (nav: boolean) => {}]); // showMobileNav

    (React as any).useState = jest.fn().mockRestore(); // Restore mock
    
    const mockFoodRecognition = jest.fn(() => ({
        id: '123',
        name: 'Apple',
        image: 'mock-image-data',
        calories: 95,
        nutrients: {
            protein: 0.5,
            carbs: 25,
            fat: 0.3,
            fiber: 4
        },
        benefits: ['Rich in antioxidants', 'Supports heart health', 'Good source of fiber'],
        warnings: [],
        timestamp: Date.now(),
        mealType: 'lunch'
    }));

    render(<App />);

    const addFoodButton = screen.getByRole('button', { name: /add food/i });
    fireEvent.click(addFoodButton);

    const captureButton = screen.getByRole('button', { name: /camera/i });
    fireEvent.click(captureButton);

    // Advance timers to simulate loading and recognition delay
    jest.advanceTimersByTime(2000);


    //Assertions after delay
    await waitFor(() => {
      expect(screen.getByText('Apple')).toBeInTheDocument();
      expect(screen.getByText('95 kcal')).toBeInTheDocument();
    });
  });

    test('allows adding a new health condition to the profile', async () => {
        render(<App />);
        const settingsButton = screen.getByRole('button', { name: /settings/i });
        fireEvent.click(settingsButton);

        const editProfileButton = screen.getByRole('button', { name: /edit/i });
        fireEvent.click(editProfileButton);

        const addConditionButton = screen.getByRole('button', {name: /^Add$/i});
        fireEvent.click(addConditionButton);

        const conditionInput = screen.getByPlaceholderText('e.g. Diabetes');
        fireEvent.change(conditionInput, { target: { value: 'Test Condition' } });

        const checkButton = screen.getByRole('button', {name: 'Check'});
        fireEvent.click(checkButton);

        const saveButton = screen.getByRole('button', {name: 'Save Profile'});
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(screen.getByText('Test Condition')).toBeInTheDocument();
        });
    });
});