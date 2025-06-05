import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import App from '../src/App';
import * as authContext from '../src/contexts/authContext';

// Mock the auth context
jest.mock('../src/contexts/authContext', () => ({
  useAuth: jest.fn(() => ({
    currentUser: { first_name: 'Test' },
    logout: jest.fn(),
  })),
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock matchMedia for dark mode preference
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

const mockTasks = [
  {
    id: '1',
    title: 'Buy groceries',
    description: 'Milk, Eggs, Bread',
    category: 'personal',
    priority: 'high',
    status: 'pending',
    dueDate: '2025-01-15',
    createdAt: '2025-01-10T10:00:00Z',
    tags: ['shopping', 'home'],
  },
  {
    id: '2',
    title: 'Prepare presentation',
    description: 'For Q1 review',
    category: 'work',
    priority: 'high',
    status: 'in-progress',
    dueDate: '2025-01-20',
    createdAt: '2025-01-12T14:30:00Z',
    tags: ['work', 'presentation'],
  },
  {
    id: '3',
    title: 'Book doctor appointment',
    description: '',
    category: 'personal',
    priority: 'medium',
    status: 'completed',
    dueDate: '2025-01-10',
    createdAt: '2025-01-05T09:00:00Z',
    completedAt: '2025-01-10T11:00:00Z',
    tags: ['health'],
  },
];

describe('App Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    localStorageMock.clear.mockClear();
    jest.clearAllMocks();

    // Set a default return for localStorage.getItem to simulate no saved tasks
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'tasks') return '[]';
      if (key === 'darkMode') return 'false'; // Default to light mode
      return null;
    });

    // Mock date for consistent `isToday` etc. behavior
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-01-14T12:00:00Z')); // Consistent date
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test('1. Renders the main application structure and dashboard by default', async () => {
    render(<App />);

    expect(screen.getByText('TaskMaster Pro')).toBeInTheDocument();
    expect(screen.getByText('Welcome back, Test!')).toBeInTheDocument();
    expect(screen.getByText('Here\'s your productivity overview for today')).toBeInTheDocument();

    // Check if navigation items are present
    expect(screen.getByRole('button', { name: /Dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Tasks/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Calendar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Analytics/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Settings/i })).toBeInTheDocument();

    // Check for dashboard specific elements
    expect(screen.getByText('Total Tasks')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Overdue')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /New Task/i })).toBeInTheDocument();
    expect(screen.getByText('No tasks due today')).toBeInTheDocument();
  });

  test('2. Allows creating a new task', async () => {
    render(<App />);

    // Click the 'New Task' button to open the form
    const newTaskBtn = screen.getByRole('button', { name: /New Task/i });
    fireEvent.click(newTaskBtn);

    // Verify the task form modal appears
    expect(screen.getByText('Create New Task')).toBeInTheDocument();

    // Fill out the form
    const titleInput = screen.getByLabelText(/Title \*/i);
    const descriptionInput = screen.getByLabelText(/Description/i);
    const categorySelect = screen.getByLabelText(/Category/i);
    const prioritySelect = screen.getByLabelText(/Priority/i);
    const dueDateInput = screen.getByLabelText(/Due Date/i);
    const tagsInput = screen.getByLabelText(/Tags/i);

    fireEvent.change(titleInput, { target: { value: 'Test Task' } });
    fireEvent.change(descriptionInput, { target: { value: 'This is a test description.' } });
    fireEvent.change(categorySelect, { target: { value: 'work' } });
    fireEvent.change(prioritySelect, { target: { value: 'high' } });
    fireEvent.change(dueDateInput, { target: { value: '2025-01-25' } });
    fireEvent.change(tagsInput, { target: { value: 'testing, demo' } });

    // Click the 'Create Task' button
    const createTaskButton = screen.getByRole('button', { name: 'Create Task' });
    fireEvent.click(createTaskButton);

    // Verify the form closes
    await waitFor(() => {
      expect(screen.queryByText('Create New Task')).not.toBeInTheDocument();
    });

    // Navigate to tasks view to verify the new task
    const tasksNavBtn = screen.getByRole('button', { name: /Tasks/i });
    fireEvent.click(tasksNavBtn);

    // Verify the new task is displayed
    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('This is a test description.')).toBeInTheDocument();
    expect(screen.getByText('work', { selector: '.badge' })).toBeInTheDocument();
    expect(screen.getByText('high', { selector: '.badge' })).toBeInTheDocument();
    expect(screen.getByText('#testing')).toBeInTheDocument();
    expect(screen.getByText('#demo')).toBeInTheDocument();
  });

  test('3. Prevents creating a task with an empty title', async () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /New Task/i }));

    const titleInput = screen.getByLabelText(/Title \*/i);
    fireEvent.change(titleInput, { target: { value: '' } }); // Empty title

    const createTaskButton = screen.getByRole('button', { name: 'Create Task' });
    expect(createTaskButton).toBeDisabled();

    // Try to click, nothing should happen
    fireEvent.click(createTaskButton);
    expect(screen.getByText('Create New Task')).toBeInTheDocument(); // Form still open

    // Provide title and re-enable button
    fireEvent.change(titleInput, { target: { value: 'Valid Title' } });
    expect(createTaskButton).not.toBeDisabled();

    fireEvent.click(createTaskButton);
    await waitFor(() => {
      expect(screen.queryByText('Create New Task')).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Tasks/i }));
    expect(screen.getByText('Valid Title')).toBeInTheDocument();
  });

  test('4. Allows editing an existing task', async () => {
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(mockTasks));
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /Tasks/i }));
    expect(screen.getByText('Buy groceries')).toBeInTheDocument();

    // Click the edit button for 'Buy groceries'
    const editButton = screen.getAllByRole('button', { name: /Edit/i })[0]; // Assuming 'Buy groceries' is first
    fireEvent.click(editButton);

    // Verify form is pre-filled with task data
    const titleInput = screen.getByLabelText(/Title \*/i);
    expect(titleInput).toHaveValue('Buy groceries');
    expect(screen.getByLabelText(/Description/i)).toHaveValue('Milk, Eggs, Bread');
    expect(screen.getByLabelText(/Category/i)).toHaveValue('personal');
    expect(screen.getByLabelText(/Priority/i)).toHaveValue('high');
    expect(screen.getByLabelText(/Due Date/i)).toHaveValue('2025-01-15');
    expect(screen.getByLabelText(/Tags/i)).toHaveValue('shopping, home');

    // Modify the task title and priority
    fireEvent.change(titleInput, { target: { value: 'Buy more groceries' } });
    fireEvent.change(screen.getByLabelText(/Priority/i), { target: { value: 'medium' } });

    // Click 'Update Task'
    fireEvent.click(screen.getByRole('button', { name: 'Update Task' }));

    // Verify modal closes and task is updated
    await waitFor(() => {
      expect(screen.queryByText('Edit Task')).not.toBeInTheDocument();
    });
    expect(screen.getByText('Buy more groceries')).toBeInTheDocument();
    expect(screen.queryByText('Buy groceries')).not.toBeInTheDocument();
    expect(screen.getAllByText('medium')[0]).toBeInTheDocument(); // Find the updated priority badge
  });

  test('5. Allows deleting a task', async () => {
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(mockTasks));
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /Tasks/i }));
    expect(screen.getByText('Buy groceries')).toBeInTheDocument();

    // Click delete button for 'Buy groceries'
    const deleteButton = screen.getAllByRole('button', { name: /Trash2/i })[0]; // Assuming 'Buy groceries' is first
    fireEvent.click(deleteButton);

    // Verify confirmation modal appears
    expect(screen.getByText('Confirm Delete')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to delete this task? This action cannot be undone.')).toBeInTheDocument();

    // Click 'Cancel'
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => {
      expect(screen.queryByText('Confirm Delete')).not.toBeInTheDocument();
    });
    expect(screen.getByText('Buy groceries')).toBeInTheDocument(); // Task still present

    // Click delete again and confirm
    fireEvent.click(deleteButton);
    fireEvent.click(screen.getByRole('button', { name: 'Delete Task' }));

    // Verify task is removed
    await waitFor(() => {
      expect(screen.queryByText('Buy groceries')).not.toBeInTheDocument();
    });
  });

  test('6. Allows changing task status', async () => {
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify([
      { ...mockTasks[0], status: 'pending' }, // Buy groceries
    ]));
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /Tasks/i }));
    const taskTitle = screen.getByText('Buy groceries');
    const statusToggleButton = screen.getByRole('button', { name: /Circle/i }); // Initial state: pending

    // Change from pending to in-progress
    fireEvent.click(statusToggleButton);
    expect(screen.getByRole('button', { name: /Clock/i })).toBeInTheDocument(); // In-progress icon
    expect(taskTitle).not.toHaveClass('line-through');
    expect(screen.getByText('in-progress', { selector: '.badge' })).toBeInTheDocument();

    // Change from in-progress to completed
    fireEvent.click(screen.getByRole('button', { name: /Clock/i }));
    expect(screen.getByRole('button', { name: /CheckCircle/i })).toBeInTheDocument(); // Completed icon
    expect(taskTitle).toHaveClass('line-through');
    expect(screen.getByText('completed', { selector: '.badge' })).toBeInTheDocument();

    // Change from completed back to pending
    fireEvent.click(screen.getByRole('button', { name: /CheckCircle/i }));
    expect(screen.getByRole('button', { name: /Circle/i })).toBeInTheDocument(); // Pending icon
    expect(taskTitle).not.toHaveClass('line-through');
    expect(screen.getByText('pending', { selector: '.badge' })).toBeInTheDocument();
  });

  test('7. Filters tasks by search term, category, status, and priority', async () => {
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(mockTasks));
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /Tasks/i }));

    // Initial state: all tasks visible
    expect(screen.getByText('Buy groceries')).toBeInTheDocument();
    expect(screen.getByText('Prepare presentation')).toBeInTheDocument();
    expect(screen.getByText('Book doctor appointment')).toBeInTheDocument();

    // Search by title
    const searchInput = screen.getByPlaceholderText('Search tasks...');
    fireEvent.change(searchInput, { target: { value: 'groceries' } });
    expect(screen.getByText('Buy groceries')).toBeInTheDocument();
    expect(screen.queryByText('Prepare presentation')).not.toBeInTheDocument();
    fireEvent.change(searchInput, { target: { value: '' } }); // Clear search

    // Filter by category: Work
    const categoryFilter = screen.getByRole('combobox', { name: /All Categories/i });
    fireEvent.change(categoryFilter, { target: { value: 'work' } });
    expect(screen.queryByText('Buy groceries')).not.toBeInTheDocument();
    expect(screen.getByText('Prepare presentation')).toBeInTheDocument();
    fireEvent.change(categoryFilter, { target: { value: 'all' } }); // Clear filter

    // Filter by status: Completed
    const statusFilter = screen.getByRole('combobox', { name: /All Status/i });
    fireEvent.change(statusFilter, { target: { value: 'completed' } });
    expect(screen.queryByText('Buy groceries')).not.toBeInTheDocument();
    expect(screen.getByText('Book doctor appointment')).toBeInTheDocument();
    fireEvent.change(statusFilter, { target: { value: 'all' } }); // Clear filter

    // Filter by priority: High
    const priorityFilter = screen.getByRole('combobox', { name: /All Priorities/i });
    fireEvent.change(priorityFilter, { target: { value: 'high' } });
    expect(screen.getByText('Buy groceries')).toBeInTheDocument();
    expect(screen.getByText('Prepare presentation')).toBeInTheDocument();
    expect(screen.queryByText('Book doctor appointment')).not.toBeInTheDocument();
    fireEvent.change(priorityFilter, { target: { value: 'all' } }); // Clear filter
  });

  test('8. Sorts tasks correctly by due date, priority, created, and title', async () => {
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(mockTasks));
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /Tasks/i }));

    const getTaskTitles = () => screen.getAllByRole('heading', { level: 3 }).map(el => el.textContent);

    // Default sort by dueDate (asc) - 'Book doctor appointment' (2025-01-10), 'Buy groceries' (2025-01-15), 'Prepare presentation' (2025-01-20)
    // Note: mockTasks[2] is completed so it might be excluded based on default filters. Let's make sure they are all 'pending' or 'in-progress' for this test.
    const sortableTasks = [
      { ...mockTasks[0], dueDate: '2025-01-15' }, // Buy groceries
      { ...mockTasks[1], dueDate: '2025-01-20' }, // Prepare presentation
      { ...mockTasks[2], dueDate: '2025-01-10', status: 'pending' }, // Book doctor appointment
    ];
    localStorageMock.getItem.mockReturnValue(JSON.stringify(sortableTasks));
    fireEvent.click(screen.getByRole('button', { name: /Tasks/i })); // Re-render with new data

    // Initial sort (dueDate asc)
    expect(getTaskTitles()).toEqual(['Book doctor appointment', 'Buy groceries', 'Prepare presentation']);

    // Sort by Priority (desc - high to low)
    const sortBySelect = screen.getByRole('combobox', { name: /Due Date/i });
    fireEvent.change(sortBySelect, { target: { value: 'priority' } });
    expect(getTaskTitles()).toEqual(['Buy groceries', 'Prepare presentation', 'Book doctor appointment']); // High, High, Medium

    // Change sort direction to asc for priority
    const sortDirectionButton = screen.getByRole('button', { name: /Desc/i });
    fireEvent.click(sortDirectionButton);
    expect(getTaskTitles()).toEqual(['Book doctor appointment', 'Buy groceries', 'Prepare presentation']); // Medium, High, High

    // Sort by Title (asc)
    fireEvent.change(sortBySelect, { target: { value: 'title' } });
    fireEvent.click(sortDirectionButton); // Change back to asc
    expect(getTaskTitles()).toEqual(['Book doctor appointment', 'Buy groceries', 'Prepare presentation']);

    // Sort by Created (asc)
    fireEvent.change(sortBySelect, { target: { value: 'created' } });
    expect(getTaskTitles()).toEqual(['Book doctor appointment', 'Buy groceries', 'Prepare presentation']);
  });

  test('9. Toggles dark mode and persists setting', async () => {
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'tasks') return '[]';
      if (key === 'darkMode') return 'false'; // Start in light mode
      return null;
    });
    render(<App />);

    const htmlElement = document.documentElement;
    const themeToggleButton = screen.getByRole('button', { title: 'Switch to dark mode' });

    // Initial state: light mode
    expect(htmlElement).not.toHaveClass('dark');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('darkMode', 'false');

    // Toggle to dark mode (header button)
    fireEvent.click(themeToggleButton);
    await waitFor(() => {
      expect(htmlElement).toHaveClass('dark');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('darkMode', 'true');
    });

    // Toggle back to light mode
    fireEvent.click(themeToggleButton);
    await waitFor(() => {
      expect(htmlElement).not.toHaveClass('dark');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('darkMode', 'false');
    });

    // Navigate to settings and toggle from there
    fireEvent.click(screen.getByRole('button', { name: /Settings/i }));
    const settingsThemeToggle = screen.getByRole('button', { name: /Moon/i });
    fireEvent.click(settingsThemeToggle);
    await waitFor(() => {
      expect(htmlElement).toHaveClass('dark');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('darkMode', 'true');
    });
  });

  test('10. Handles data export to JSON and CSV', async () => {
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(mockTasks));
    render(<App />);

    // Mock URL.createObjectURL and document.createElement('a').click()
    const createObjectURLMock = jest.fn();
    const revokeObjectURLMock = jest.fn();
    const appendChildMock = jest.fn();
    const removeChildMock = jest.fn();
    const clickMock = jest.fn();

    Object.defineProperty(window.URL, 'createObjectURL', { value: createObjectURLMock });
    Object.defineProperty(window.URL, 'revokeObjectURL', { value: revokeObjectURLMock });
    jest.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'a') {
        return {
          href: '',
          download: '',
          click: clickMock,
          style: { display: '' },
          appendChild: appendChildMock,
          removeChild: removeChildMock,
        } as unknown as HTMLAnchorElement;
      }
      return {} as unknown as HTMLElement;
    });
    jest.spyOn(document.body, 'appendChild').mockImplementation(appendChildMock);
    jest.spyOn(document.body, 'removeChild').mockImplementation(removeChildMock);

    fireEvent.click(screen.getByRole('button', { name: /Settings/i }));

    // Export JSON
    fireEvent.click(screen.getByRole('button', { name: /Export Tasks \(JSON\)/i }));
    expect(createObjectURLMock).toHaveBeenCalled();
    expect(clickMock).toHaveBeenCalled();
    expect(revokeObjectURLMock).toHaveBeenCalled();

    // Export CSV
    fireEvent.click(screen.getByRole('button', { name: /Export Tasks \(CSV\)/i }));
    expect(createObjectURLMock).toHaveBeenCalledTimes(2);
    expect(clickMock).toHaveBeenCalledTimes(2);
    expect(revokeObjectURLMock).toHaveBeenCalledTimes(2);
  });

  test('11. Handles data import from JSON', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Settings/i }));

    const importButton = screen.getByRole('button', { name: /Import Tasks/i });
    const fileInput = screen.getByLabelText(/Import Tasks/i, { selector: 'input[type="file"]' });

    const fileContent = JSON.stringify([
      { id: 'new1', title: 'Imported Task 1', description: '', category: 'personal', priority: 'low', status: 'pending', dueDate: '2025-02-01', createdAt: '2025-01-20T00:00:00Z', tags: [] },
      { id: 'new2', title: 'Imported Task 2', description: '', category: 'work', priority: 'medium', status: 'completed', dueDate: '2025-02-02', createdAt: '2025-01-21T00:00:00Z', tags: [] },
    ]);
    const file = new File([fileContent], 'tasks.json', { type: 'application/json' });

    const dataTransfer = { files: [file] };

    // Simulate file selection
    await act(async () => {
      fireEvent.change(fileInput, { target: dataTransfer });
    });

    // Navigate to tasks view to verify the new task
    fireEvent.click(screen.getByRole('button', { name: /Tasks/i }));

    expect(screen.getByText('Imported Task 1')).toBeInTheDocument();
    expect(screen.getByText('Imported Task 2')).toBeInTheDocument();
  });

  test('12. Allows clearing all data', async () => {
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(mockTasks));
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /Tasks/i }));
    expect(screen.getByText('Buy groceries')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Settings/i }));

    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);

    fireEvent.click(screen.getByRole('button', { name: /Clear All Data/i }));

    expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to delete all tasks? This action cannot be undone.');
    expect(localStorageMock.clear).toHaveBeenCalled(); // localStorage.clear() might not be called directly if localStorage.removeItem('tasks') is used
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('tasks');

    // Navigate back to tasks and check for empty state
    fireEvent.click(screen.getByRole('button', { name: /Tasks/i }));
    expect(screen.queryByText('Buy groceries')).not.toBeInTheDocument();
    expect(screen.getByText('No tasks found')).toBeInTheDocument();

    confirmSpy.mockRestore();
  });

  test('13. Navigates between views', async () => {
    render(<App />);

    // Navigate to Tasks
    fireEvent.click(screen.getByRole('button', { name: /Tasks/i }));
    expect(screen.getByTestId('tasks-view')).toBeInTheDocument();
    expect(screen.queryByTestId('welcome_fallback')).not.toBeInTheDocument();

    // Navigate to Calendar
    fireEvent.click(screen.getByRole('button', { name: /Calendar/i }));
    expect(screen.getByTestId('calendar-view')).toBeInTheDocument();
    expect(screen.queryByTestId('tasks-view')).not.toBeInTheDocument();

    // Navigate to Analytics
    fireEvent.click(screen.getByRole('button', { name: /Analytics/i }));
    expect(screen.getByTestId('analytics-view')).toBeInTheDocument();
    expect(screen.queryByTestId('calendar-view')).not.toBeInTheDocument();

    // Navigate to Settings
    fireEvent.click(screen.getByRole('button', { name: /Settings/i }));
    expect(screen.getByTestId('settings-view')).toBeInTheDocument();
    expect(screen.queryByTestId('analytics-view')).not.toBeInTheDocument();

    // Navigate back to Dashboard
    fireEvent.click(screen.getByRole('button', { name: /Dashboard/i }));
    expect(screen.getByTestId('welcome_fallback')).toBeInTheDocument();
    expect(screen.queryByTestId('settings-view')).not.toBeInTheDocument();
  });

  test('14. Displays correct stats on Dashboard and Analytics views', async () => {
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(mockTasks));
    render(<App />);

    // Dashboard stats
    expect(screen.getByText('Total Tasks')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument(); // 3 total tasks
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getAllByText('1')[0]).toBeInTheDocument(); // 1 completed task
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getAllByText('1')[1]).toBeInTheDocument(); // 1 in-progress task
    expect(screen.getByText('Overdue')).toBeInTheDocument();
    expect(screen.getAllByText('0')[0]).toBeInTheDocument(); // 0 overdue (based on mock date 2025-01-14, '2025-01-10' is completed, '2025-01-15' is future)

    // Navigate to Analytics
    fireEvent.click(screen.getByRole('button', { name: /Analytics/i }));

    // Analytics stats
    expect(screen.getByText('Task Completion Rate')).toBeInTheDocument();
    expect(screen.getByText('33%')).toBeInTheDocument(); // 1 completed / 3 total = 33.33%
    expect(screen.getByText('Category Distribution')).toBeInTheDocument();
    expect(screen.getByText('Work')).toBeInTheDocument();
    expect(screen.getByText('Personal')).toBeInTheDocument();
    expect(screen.getByText('Tasks Completed')).toBeInTheDocument();
    expect(screen.getByText('1', { selector: '.text-2xl.font-bold' })).toBeInTheDocument(); // 1 completed task
    expect(screen.getByText('Active Tasks')).toBeInTheDocument();
    expect(screen.getByText('1', { selector: '.text-2xl.font-bold' })).toBeInTheDocument(); // 1 in-progress task
    expect(screen.getByText('Overdue Tasks')).toBeInTheDocument();
    expect(screen.getByText('0', { selector: '.text-2xl.font-bold' })).toBeInTheDocument(); // 0 overdue
  });

  test('15. Displays tasks correctly in Calendar view', async () => {
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(mockTasks));
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /Calendar/i }));

    // Verify current month header
    expect(screen.getByText('January 2025')).toBeInTheDocument();

    // Check for 'Buy groceries' on Jan 15
    // Need to find the specific day cell. This is tricky without a specific data-testid on day cells.
    // Let's assume the calendar renders days in order. Jan 1 is a Wednesday in 2025.
    // Dec 29, 30, 31, Jan 1, 2, 3, 4
    // 5, 6, 7, 8, 9, 10, 11
    // 12, 13, 14 (today), 15 (Buy groceries), 16, 17, 18
    const taskOnJan15 = await screen.findByTitle('Buy groceries');
    expect(taskOnJan15).toBeInTheDocument();

    // Check for 'Book doctor appointment' on Jan 10 (completed, so it should still show)
    const taskOnJan10 = await screen.findByTitle('Book doctor appointment');
    expect(taskOnJan10).toBeInTheDocument();
  });

  test('16. Logout button functionality', async () => {
    const mockLogout = jest.fn();
    (authContext.useAuth as jest.Mock).mockReturnValue({
      currentUser: { first_name: 'Test' },
      logout: mockLogout,
    });
    render(<App />);

    const logoutButton = screen.getByRole('button', { name: /Logout/i });
    fireEvent.click(logoutButton);

    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  test('17. ESC key closes task form and delete confirmation modal', async () => {
    render(<App />);

    // Open task form
    fireEvent.click(screen.getByRole('button', { name: /New Task/i }));
    expect(screen.getByText('Create New Task')).toBeInTheDocument();

    // Press ESC to close
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
    await waitFor(() => {
      expect(screen.queryByText('Create New Task')).not.toBeInTheDocument();
    });

    // Add a task to enable delete button
    fireEvent.click(screen.getByRole('button', { name: /New Task/i }));
    fireEvent.change(screen.getByLabelText(/Title \*/i), { target: { value: 'Task to Delete' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create Task' }));

    fireEvent.click(screen.getByRole('button', { name: /Tasks/i }));
    expect(screen.getByText('Task to Delete')).toBeInTheDocument();

    // Open delete confirmation
    fireEvent.click(screen.getByRole('button', { name: /Trash2/i }));
    expect(screen.getByText('Confirm Delete')).toBeInTheDocument();

    // Press ESC to close
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
    await waitFor(() => {
      expect(screen.queryByText('Confirm Delete')).not.toBeInTheDocument();
    });
    expect(screen.getByText('Task to Delete')).toBeInTheDocument(); // Task should still be there
  });

  test('18. Displays No tasks found message when filters yield no results', async () => {
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(mockTasks));
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /Tasks/i }));
    expect(screen.getByText('Buy groceries')).toBeInTheDocument();

    // Apply a filter that yields no results
    const searchInput = screen.getByPlaceholderText('Search tasks...');
    fireEvent.change(searchInput, { target: { value: 'nonexistent task' } });

    expect(screen.queryByText('Buy groceries')).not.toBeInTheDocument();
    expect(screen.getByText('No tasks found')).toBeInTheDocument();
    expect(screen.getByText('Try adjusting your filters or create a new task')).toBeInTheDocument();

    // Clear filter and verify tasks reappear
    fireEvent.change(searchInput, { target: { value: '' } });
    expect(screen.getByText('Buy groceries')).toBeInTheDocument();
    expect(screen.queryByText('No tasks found')).not.toBeInTheDocument();
  });
});
