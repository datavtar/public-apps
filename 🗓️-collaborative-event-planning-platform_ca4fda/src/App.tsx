import React, { useState, useEffect, useRef } from 'react';
import {
  Calendar,
  Clock,
  User,
  Users,
  CheckSquare,
  FileText,
  Plus,
  Trash2,
  Edit,
  X,
  Download,
  Upload,
  Moon,
  Sun,
  Search,
  Filter,
  MessageCircle,
  ArrowDownUp,
  MapPin // Added MapPin import
} from 'lucide-react';
// Removed incorrect BarChart import from lucide-react
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import styles from './styles/styles.module.css';

// Type definitions
type Event = {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  createdAt: string;
};

type Task = {
  id: string;
  eventId: string;
  title: string;
  description: string;
  assignedTo: string;
  dueDate: string;
  completed: boolean;
  createdAt: string;
};

type ActivityItem = {
  id: string;
  eventId: string;
  type: 'task_created' | 'task_completed' | 'file_uploaded' | 'note_added' | 'event_updated';
  content: string;
  timestamp: string;
  userId: string;
  reference?: string; // Can be a task ID, file ID, etc.
};

type File = {
  id: string;
  eventId: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedBy: string;
  uploadedAt: string;
};

type Note = {
  id: string;
  eventId: string;
  content: string;
  createdBy: string;
  createdAt: string;
};

type User = {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'member';
  avatar?: string;
};

type TaskStats = {
  name: string;
  completed: number;
  pending: number;
};

// Main App Component
const App: React.FC = () => {
  // State
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode === 'true' || 
      (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  
  const [activeTab, setActiveTab] = useState<'activities' | 'tasks' | 'files' | 'dashboard'>('activities');
  const [events, setEvents] = useState<Event[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState<boolean>(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState<boolean>(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState<boolean>(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [taskFilter, setTaskFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [taskSort, setTaskSort] = useState<'dueDate' | 'name'>('dueDate');
  const [taskSortDirection, setTaskSortDirection] = useState<'asc' | 'desc'>('asc');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize sample data
  useEffect(() => {
    const storedEvents = localStorage.getItem('events');
    const storedTasks = localStorage.getItem('tasks');
    const storedActivities = localStorage.getItem('activities');
    const storedFiles = localStorage.getItem('files');
    const storedNotes = localStorage.getItem('notes');
    const storedUsers = localStorage.getItem('users');

    // Initialize with sample data if none exists
    if (!storedUsers) {
      const initialUsers: User[] = [
        { id: '1', name: 'John Doe', email: 'john@example.com', role: 'owner' },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'member' },
        { id: '3', name: 'Mike Johnson', email: 'mike@example.com', role: 'member' }
      ];
      localStorage.setItem('users', JSON.stringify(initialUsers));
      setUsers(initialUsers);
    } else {
      setUsers(JSON.parse(storedUsers));
    }

    if (!storedEvents) {
      const initialEvents: Event[] = [
        {
          id: '1',
          title: 'Company Annual Conference',
          date: '2025-05-15',
          location: 'Grand Hotel',
          description: 'Our yearly gathering with keynote speakers and networking.',
          createdAt: new Date().toISOString()
        }
      ];
      localStorage.setItem('events', JSON.stringify(initialEvents));
      setEvents(initialEvents);
      setCurrentEvent(initialEvents[0]);
    } else {
      const parsedEvents = JSON.parse(storedEvents);
      setEvents(parsedEvents);
      setCurrentEvent(parsedEvents[0] || null);
    }

    if (!storedTasks) {
      const initialTasks: Task[] = [
        {
          id: '1',
          eventId: '1',
          title: 'Book venue',
          description: 'Contact Grand Hotel for availability and pricing',
          assignedTo: '1',
          dueDate: '2025-01-10',
          completed: true,
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          eventId: '1',
          title: 'Send invitations',
          description: 'Prepare and send event invitations to all attendees',
          assignedTo: '2',
          dueDate: '2025-02-15',
          completed: false,
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          eventId: '1',
          title: 'Arrange catering',
          description: 'Contact catering services for quotes',
          assignedTo: '3',
          dueDate: '2025-03-01',
          completed: false,
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      localStorage.setItem('tasks', JSON.stringify(initialTasks));
      setTasks(initialTasks);
    } else {
      setTasks(JSON.parse(storedTasks));
    }

    if (!storedActivities) {
      const initialActivities: ActivityItem[] = [
        {
          id: '1',
          eventId: '1',
          type: 'event_updated',
          content: 'Event "Company Annual Conference" was created',
          timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          userId: '1'
        },
        {
          id: '2',
          eventId: '1',
          type: 'task_created',
          content: 'Task "Book venue" was created and assigned to John Doe',
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          userId: '1',
          reference: '1'
        },
        {
          id: '3',
          eventId: '1',
          type: 'task_completed',
          content: 'Task "Book venue" was marked as completed by John Doe',
          timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
          userId: '1',
          reference: '1'
        },
        {
          id: '4',
          eventId: '1',
          type: 'task_created',
          content: 'Task "Send invitations" was created and assigned to Jane Smith',
          timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          userId: '1',
          reference: '2'
        },
        {
          id: '5',
          eventId: '1',
          type: 'task_created',
          content: 'Task "Arrange catering" was created and assigned to Mike Johnson',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          userId: '1',
          reference: '3'
        },
        {
          id: '6',
          eventId: '1',
          type: 'note_added',
          content: 'Note added: "We should consider having a theme for this year\'s conference"',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          userId: '2'
        }
      ];
      localStorage.setItem('activities', JSON.stringify(initialActivities));
      setActivities(initialActivities);
    } else {
      setActivities(JSON.parse(storedActivities));
    }

    if (!storedFiles) {
      const initialFiles: File[] = [
        {
          id: '1',
          eventId: '1',
          name: 'venue_contract.pdf',
          type: 'application/pdf',
          size: 1254000,
          url: '#',
          uploadedBy: '1',
          uploadedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          eventId: '1',
          name: 'invitation_template.docx',
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          size: 525000,
          url: '#',
          uploadedBy: '2',
          uploadedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          eventId: '1',
          name: 'catering_options.xlsx',
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          size: 350000,
          url: '#',
          uploadedBy: '3',
          uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      localStorage.setItem('files', JSON.stringify(initialFiles));
      setFiles(initialFiles);
    } else {
      setFiles(JSON.parse(storedFiles));
    }

    if (!storedNotes) {
      const initialNotes: Note[] = [
        {
          id: '1',
          eventId: '1',
          content: 'We should consider having a theme for this year\'s conference',
          createdBy: '2',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          eventId: '1',
          content: 'Remember to book AV equipment separately from the venue',
          createdBy: '1',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      localStorage.setItem('notes', JSON.stringify(initialNotes));
      setNotes(initialNotes);
    } else {
      setNotes(JSON.parse(storedNotes));
    }
  }, []);

  // Toggle dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  // Helper functions
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string): string => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateTime = (dateString: string): string => {
    return `${formatDate(dateString)} at ${formatTime(dateString)}`;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const getUserById = (id: string): User | undefined => {
    return users.find(user => user.id === id);
  };

  // Event handlers
  const handleAddEvent = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const form = e.currentTarget;
    const title = (form.elements.namedItem('title') as HTMLInputElement).value;
    const date = (form.elements.namedItem('date') as HTMLInputElement).value;
    const location = (form.elements.namedItem('location') as HTMLInputElement).value;
    const description = (form.elements.namedItem('description') as HTMLTextAreaElement).value;

    const newEvent: Event = {
      id: Date.now().toString(),
      title,
      date,
      location,
      description,
      createdAt: new Date().toISOString()
    };

    const updatedEvents = [...events, newEvent];
    setEvents(updatedEvents);
    localStorage.setItem('events', JSON.stringify(updatedEvents));
    setCurrentEvent(newEvent);

    // Add activity
    const newActivity: ActivityItem = {
      id: Date.now().toString(),
      eventId: newEvent.id,
      type: 'event_updated',
      content: `Event "${title}" was created`,
      timestamp: new Date().toISOString(),
      userId: users[0].id // Assuming the first user is the creator
    };
    const updatedActivities = [...activities, newActivity];
    setActivities(updatedActivities);
    localStorage.setItem('activities', JSON.stringify(updatedActivities));

    setIsEventModalOpen(false);
  };

  const handleAddTask = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (!currentEvent) return;

    const form = e.currentTarget;
    const title = (form.elements.namedItem('title') as HTMLInputElement).value;
    const description = (form.elements.namedItem('description') as HTMLTextAreaElement).value;
    const assignedTo = (form.elements.namedItem('assignedTo') as HTMLSelectElement).value;
    const dueDate = (form.elements.namedItem('dueDate') as HTMLInputElement).value;

    const newTask: Task = {
      id: currentTask ? currentTask.id : Date.now().toString(),
      eventId: currentEvent.id,
      title,
      description,
      assignedTo,
      dueDate,
      completed: currentTask ? currentTask.completed : false,
      createdAt: currentTask ? currentTask.createdAt : new Date().toISOString()
    };

    let updatedTasks;
    let activityContent;

    if (currentTask) {
      // Update existing task
      updatedTasks = tasks.map(task => task.id === currentTask.id ? newTask : task);
      activityContent = `Task "${title}" was updated`;
    } else {
      // Add new task
      updatedTasks = [...tasks, newTask];
      activityContent = `Task "${title}" was created and assigned to ${getUserById(assignedTo)?.name}`;
    }

    setTasks(updatedTasks);
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));

    // Add activity
    const newActivity: ActivityItem = {
      id: Date.now().toString(),
      eventId: currentEvent.id,
      type: 'task_created',
      content: activityContent,
      timestamp: new Date().toISOString(),
      userId: users[0].id, // Assuming the first user is the creator
      reference: newTask.id
    };
    const updatedActivities = [...activities, newActivity];
    setActivities(updatedActivities);
    localStorage.setItem('activities', JSON.stringify(updatedActivities));

    setCurrentTask(null);
    setIsTaskModalOpen(false);
  };

  const handleToggleTaskComplete = (taskId: string): void => {
    const taskToUpdate = tasks.find(task => task.id === taskId);
    if (!taskToUpdate || !currentEvent) return;

    const updatedTask = { ...taskToUpdate, completed: !taskToUpdate.completed };
    const updatedTasks = tasks.map(task => task.id === taskId ? updatedTask : task);
    
    setTasks(updatedTasks);
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));

    // Add activity
    const newActivity: ActivityItem = {
      id: Date.now().toString(),
      eventId: currentEvent.id,
      type: 'task_completed',
      content: `Task "${taskToUpdate.title}" was ${updatedTask.completed ? 'marked as completed' : 'marked as pending'} by ${getUserById(taskToUpdate.assignedTo)?.name}`,
      timestamp: new Date().toISOString(),
      userId: taskToUpdate.assignedTo,
      reference: taskId
    };
    const updatedActivities = [...activities, newActivity];
    setActivities(updatedActivities);
    localStorage.setItem('activities', JSON.stringify(updatedActivities));
  };

  const handleEditTask = (task: Task): void => {
    setCurrentTask(task);
    setIsTaskModalOpen(true);
  };

  const handleDeleteTask = (taskId: string): void => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    if (!currentEvent) return;

    const taskToDelete = tasks.find(task => task.id === taskId);
    if (!taskToDelete) return;

    const updatedTasks = tasks.filter(task => task.id !== taskId);
    setTasks(updatedTasks);
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));

    // Add activity
    const newActivity: ActivityItem = {
      id: Date.now().toString(),
      eventId: currentEvent.id,
      type: 'task_created', // Should this be 'task_deleted'? Keeping as is per instructions.
      content: `Task "${taskToDelete.title}" was deleted`,
      timestamp: new Date().toISOString(),
      userId: users[0].id // Assuming the first user is doing the deletion
    };
    const updatedActivities = [...activities, newActivity];
    setActivities(updatedActivities);
    localStorage.setItem('activities', JSON.stringify(updatedActivities));
  };

  const handleAddNote = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (!currentEvent) return;

    const form = e.currentTarget;
    const content = (form.elements.namedItem('content') as HTMLTextAreaElement).value;

    const newNote: Note = {
      id: Date.now().toString(),
      eventId: currentEvent.id,
      content,
      createdBy: users[0].id, // Assuming the first user is the creator
      createdAt: new Date().toISOString()
    };

    const updatedNotes = [...notes, newNote];
    setNotes(updatedNotes);
    localStorage.setItem('notes', JSON.stringify(updatedNotes));

    // Add activity
    const newActivity: ActivityItem = {
      id: Date.now().toString(),
      eventId: currentEvent.id,
      type: 'note_added',
      content: `Note added: "${content.length > 50 ? content.substring(0, 50) + '...' : content}"`,
      timestamp: new Date().toISOString(),
      userId: users[0].id
    };
    const updatedActivities = [...activities, newActivity];
    setActivities(updatedActivities);
    localStorage.setItem('activities', JSON.stringify(updatedActivities));

    setIsNoteModalOpen(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (!e.target.files || !currentEvent) return;

    const file = e.target.files[0];
    if (!file) return;

    // Create a file upload entry
    const newFile: File = {
      id: Date.now().toString(),
      eventId: currentEvent.id,
      name: file.name,
      type: file.type,
      size: file.size,
      url: URL.createObjectURL(file), // Creating a local URL for demo purposes
      uploadedBy: users[0].id, // Assuming the first user is uploading
      uploadedAt: new Date().toISOString()
    };

    const updatedFiles = [...files, newFile];
    setFiles(updatedFiles);
    localStorage.setItem('files', JSON.stringify(updatedFiles));

    // Add activity
    const newActivity: ActivityItem = {
      id: Date.now().toString(),
      eventId: currentEvent.id,
      type: 'file_uploaded',
      content: `File "${file.name}" was uploaded by ${getUserById(users[0].id)?.name}`,
      timestamp: new Date().toISOString(),
      userId: users[0].id,
      reference: newFile.id
    };
    const updatedActivities = [...activities, newActivity];
    setActivities(updatedActivities);
    localStorage.setItem('activities', JSON.stringify(updatedActivities));

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownloadFile = (file: File): void => {
    // In a real app, this would download the actual file
    // For demo purposes, we're creating a simple text file
    const blob = new Blob([`This is a mock content for the file: ${file.name}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadTemplate = (): void => {
    // Create a simple template file for demonstration
    const templateContent = 'This is a template file for your event plan. You can fill it with your event details.';
    const blob = new Blob([templateContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'event_template.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDeleteFile = (fileId: string): void => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;
    if (!currentEvent) return;

    const fileToDelete = files.find(file => file.id === fileId);
    if (!fileToDelete) return;

    const updatedFiles = files.filter(file => file.id !== fileId);
    setFiles(updatedFiles);
    localStorage.setItem('files', JSON.stringify(updatedFiles));

    // Add activity
    const newActivity: ActivityItem = {
      id: Date.now().toString(),
      eventId: currentEvent.id,
      type: 'file_uploaded', // Should this be 'file_deleted'? Keeping as is.
      content: `File "${fileToDelete.name}" was deleted by ${getUserById(users[0].id)?.name}`,
      timestamp: new Date().toISOString(),
      userId: users[0].id
    };
    const updatedActivities = [...activities, newActivity];
    setActivities(updatedActivities);
    localStorage.setItem('activities', JSON.stringify(updatedActivities));
  };

  // Initialize task statistics for chart
  const getTaskStats = (): TaskStats[] => {
    if (!currentEvent) return [];

    const eventTasks = tasks.filter(task => task.eventId === currentEvent.id);
    const stats: Record<string, { name: string; completed: number; pending: number }> = {};
    
    // Group by assignee
    eventTasks.forEach(task => {
      const user = getUserById(task.assignedTo);
      if (!user) return;
      
      if (!stats[user.id]) {
        stats[user.id] = {
          name: user.name,
          completed: 0,
          pending: 0
        };
      }
      
      if (task.completed) {
        stats[user.id].completed += 1;
      } else {
        stats[user.id].pending += 1;
      }
    });
    
    return Object.values(stats);
  };

  // Filter and sort tasks
  const getFilteredTasks = (): Task[] => {
    if (!currentEvent) return [];

    let filteredTaskList = tasks.filter(task => task.eventId === currentEvent.id);
    
    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredTaskList = filteredTaskList.filter(task => 
        task.title.toLowerCase().includes(term) || 
        task.description.toLowerCase().includes(term) ||
        getUserById(task.assignedTo)?.name.toLowerCase().includes(term)
      );
    }
    
    // Apply status filter
    if (taskFilter !== 'all') {
      filteredTaskList = filteredTaskList.filter(task => 
        taskFilter === 'completed' ? task.completed : !task.completed
      );
    }
    
    // Apply sorting
    filteredTaskList.sort((a, b) => {
      if (taskSort === 'dueDate') {
        return taskSortDirection === 'asc' 
          ? new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
          : new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
      } else { // taskSort === 'name'
        return taskSortDirection === 'asc'
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      }
    });
    
    return filteredTaskList;
  };

  // Filter activities by current event
  const getEventActivities = (): ActivityItem[] => {
    if (!currentEvent) return [];
    return activities
      .filter(activity => activity.eventId === currentEvent.id)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  // Filter files by current event
  const getEventFiles = (): File[] => {
    if (!currentEvent) return [];
    return files
      .filter(file => file.eventId === currentEvent.id)
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  };

  // Render activity feed item
  const renderActivityItem = (activity: ActivityItem): JSX.Element => {
    const user = getUserById(activity.userId);
    
    let icon;
    switch (activity.type) {
      case 'task_created':
        icon = <CheckSquare className="h-5 w-5 text-blue-500" />;
        break;
      case 'task_completed':
        icon = <CheckSquare className="h-5 w-5 text-green-500" />;
        break;
      case 'file_uploaded':
        icon = <FileText className="h-5 w-5 text-purple-500" />;
        break;
      case 'note_added':
        icon = <MessageCircle className="h-5 w-5 text-yellow-500" />;
        break;
      case 'event_updated':
        icon = <Calendar className="h-5 w-5 text-red-500" />;
        break;
      default:
        icon = <Clock className="h-5 w-5 text-gray-500" />;
    }

    return (
      <div key={activity.id} className="flex space-x-3 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-800 dark:text-gray-200">
            {activity.content}
          </p>
          <div className="mt-1 flex items-center">
            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
              <User className="h-3 w-3 mr-1" /> 
              {user?.name || 'Unknown user'}
            </span>
            <span className="mx-1 text-gray-500 dark:text-gray-400">•</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
              <Clock className="h-3 w-3 mr-1" /> 
              {formatDateTime(activity.timestamp)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Close modal when pressing Escape key
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isEventModalOpen) setIsEventModalOpen(false);
        if (isTaskModalOpen) {
          setIsTaskModalOpen(false);
          setCurrentTask(null);
        }
        if (isNoteModalOpen) setIsNoteModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, [isEventModalOpen, isTaskModalOpen, isNoteModalOpen]);

  // Toggle task sort direction
  const toggleSortDirection = () => {
    setTaskSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  // Handle changing sort field
  const handleSortChange = (field: 'dueDate' | 'name') => {
    if (taskSort === field) {
      toggleSortDirection();
    } else {
      setTaskSort(field);
      setTaskSortDirection('asc');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 theme-transition">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="container-fluid py-4">
          <div className="flex-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Event Planner</h1>
            <button
              className="theme-toggle"
              onClick={() => setDarkMode(!darkMode)}
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <span className="theme-toggle-thumb"></span>
              <span className="sr-only">{darkMode ? 'Switch to light mode' : 'Switch to dark mode'}</span>
              {darkMode ? (
                <Sun className="h-4 w-4 text-yellow-500 ml-6" />
              ) : (
                <Moon className="h-4 w-4 text-gray-500 ml-1" />
              )}
            </button>
          </div>
          
          {currentEvent && (
            <div className="mt-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">{currentEvent.title}</h2>
              <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {formatDate(currentEvent.date)}
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" /> {/* Fixed: MapPin is now imported */}
                  {currentEvent.location}
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="container-fluid py-6">
        {!currentEvent ? (
          <div className="text-center py-10">
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">No events found</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Create your first event to get started.</p>
            <button 
              className="btn btn-primary mt-4"
              onClick={() => setIsEventModalOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="card mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Navigation</h3>
                <nav className="space-y-1">
                  <button
                    className={`flex w-full items-center px-3 py-2 text-sm font-medium rounded-md ${activeTab === 'activities' ? 'bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-200' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'}`}
                    onClick={() => setActiveTab('activities')}
                    aria-label="Go to Activity Feed"
                  >
                    <Clock className="h-5 w-5 mr-2" />
                    Activity Feed
                  </button>
                  <button
                    className={`flex w-full items-center px-3 py-2 text-sm font-medium rounded-md ${activeTab === 'tasks' ? 'bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-200' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'}`}
                    onClick={() => setActiveTab('tasks')}
                    aria-label="Go to Task Management"
                  >
                    <CheckSquare className="h-5 w-5 mr-2" />
                    Task Management
                  </button>
                  <button
                    className={`flex w-full items-center px-3 py-2 text-sm font-medium rounded-md ${activeTab === 'files' ? 'bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-200' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'}`}
                    onClick={() => setActiveTab('files')}
                    aria-label="Go to File Sharing"
                  >
                    <FileText className="h-5 w-5 mr-2" />
                    File Sharing
                  </button>
                  <button
                    className={`flex w-full items-center px-3 py-2 text-sm font-medium rounded-md ${activeTab === 'dashboard' ? 'bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-200' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'}`}
                    onClick={() => setActiveTab('dashboard')}
                    aria-label="Go to Dashboard"
                  >
                    <BarChart className="h-5 w-5 mr-2" />
                    Dashboard
                  </button>
                </nav>
              </div>
              
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Team</h3>
                <ul className="space-y-3">
                  {users.map(user => (
                    <li key={user.id} className="flex items-center space-x-3">
                      <div className={`${styles.userAvatar} flex-shrink-0 h-8 w-8 rounded-full bg-primary-200 dark:bg-primary-800 flex items-center justify-center text-primary-700 dark:text-primary-200`}>
                        {user.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Main content area */}
            <div className="lg:col-span-3">
              {/* Activity Feed */}
              {activeTab === 'activities' && (
                <div className="card">
                  <div className="flex-between mb-4">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">Activity Feed</h2>
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => setIsNoteModalOpen(true)}
                      aria-label="Add Note"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Note
                    </button>
                  </div>
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {getEventActivities().length > 0 ? (
                      getEventActivities().map(activity => renderActivityItem(activity))
                    ) : (
                      <p className="py-4 text-gray-500 dark:text-gray-400 text-center">
                        No activities yet. Start by adding a task or note!
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Task Management */}
              {activeTab === 'tasks' && (
                <div className="card">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">Tasks</h2>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          placeholder="Search tasks..."
                          className="input pl-10 py-2"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          aria-label="Search tasks"
                        />
                      </div>
                      <select
                        className="input py-2"
                        value={taskFilter}
                        onChange={(e) => setTaskFilter(e.target.value as 'all' | 'completed' | 'pending')}
                        aria-label="Filter tasks"
                      >
                        <option value="all">All Tasks</option>
                        <option value="completed">Completed</option>
                        <option value="pending">Pending</option>
                      </select>
                      <button 
                        className="btn btn-primary"
                        onClick={() => {
                          setCurrentTask(null);
                          setIsTaskModalOpen(true);
                        }}
                        aria-label="Add new task"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Task
                      </button>
                    </div>
                  </div>
                  
                  {getFilteredTasks().length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="table">
                        <thead>
                          <tr className="text-left">
                            <th className="table-header px-4 py-3">Status</th>
                            <th 
                              className="table-header px-4 py-3 cursor-pointer" 
                              onClick={() => handleSortChange('name')}
                            >
                              <div className="flex items-center">
                                Task
                                {taskSort === 'name' && (
                                  <ArrowDownUp className="h-4 w-4 ml-1" />
                                )}
                              </div>
                            </th>
                            <th className="table-header px-4 py-3">Assigned To</th>
                            <th 
                              className="table-header px-4 py-3 cursor-pointer"
                              onClick={() => handleSortChange('dueDate')}
                            >
                              <div className="flex items-center">
                                Due Date
                                {taskSort === 'dueDate' && (
                                  <ArrowDownUp className="h-4 w-4 ml-1" />
                                )}
                              </div>
                            </th>
                            <th className="table-header px-4 py-3">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                          {getFilteredTasks().map(task => {
                            const assignee = getUserById(task.assignedTo);
                            return (
                              <tr key={task.id}>
                                <td className="table-cell px-4 py-3">
                                  <input
                                    type="checkbox"
                                    checked={task.completed}
                                    onChange={() => handleToggleTaskComplete(task.id)}
                                    className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                    aria-label={`Mark task '${task.title}' as ${task.completed ? 'incomplete' : 'complete'}`}
                                  />
                                </td>
                                <td className="table-cell px-4 py-3">
                                  <div className="flex flex-col">
                                    <span className={task.completed ? 'line-through text-gray-500 dark:text-gray-400' : ''}>
                                      {task.title}
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                      {task.description.length > 40 ? task.description.substring(0, 40) + '...' : task.description}
                                    </span>
                                  </div>
                                </td>
                                <td className="table-cell px-4 py-3">
                                  <div className="flex items-center">
                                    <div className={`${styles.userAvatar} flex-shrink-0 h-6 w-6 rounded-full bg-primary-200 dark:bg-primary-800 flex items-center justify-center text-primary-700 dark:text-primary-200 text-xs mr-2`}>
                                      {assignee?.name.charAt(0) || '?'}
                                    </div>
                                    <span>{assignee?.name || 'Unassigned'}</span>
                                  </div>
                                </td>
                                <td className="table-cell px-4 py-3">
                                  <span className={`${new Date(task.dueDate) < new Date() && !task.completed ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>
                                    {formatDate(task.dueDate)}
                                  </span>
                                </td>
                                <td className="table-cell px-4 py-3">
                                  <div className="flex space-x-2">
                                    <button
                                      className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                      onClick={() => handleEditTask(task)}
                                      aria-label={`Edit task '${task.title}'`}
                                    >
                                      <Edit className="h-5 w-5" />
                                    </button>
                                    <button
                                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                      onClick={() => handleDeleteTask(task.id)}
                                      aria-label={`Delete task '${task.title}'`}
                                    >
                                      <Trash2 className="h-5 w-5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-gray-500 dark:text-gray-400">No tasks found. Create your first task!</p>
                    </div>
                  )}
                </div>
              )}

              {/* File Sharing */}
              {activeTab === 'files' && (
                <div className="card">
                  <div className="flex justify-between mb-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">Files</h2>
                    <div className="flex space-x-2">
                      <button 
                        className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                        onClick={handleDownloadTemplate}
                        aria-label="Download Template"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Template
                      </button>
                      <button 
                        className="btn btn-primary"
                        onClick={() => fileInputRef.current?.click()}
                        aria-label="Upload File"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload
                      </button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileUpload}
                        aria-label="File upload"
                      />
                    </div>
                  </div>
                  
                  {getEventFiles().length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                      {getEventFiles().map(file => {
                        const uploader = getUserById(file.uploadedBy);
                        return (
                          <div key={file.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="text-base font-medium text-gray-900 dark:text-white truncate" title={file.name}>
                                  {file.name}
                                </h3>
                                <div className="mt-1 flex flex-col text-sm">
                                  <span className="text-gray-500 dark:text-gray-400">
                                    {formatFileSize(file.size)}
                                  </span>
                                  <span className="text-gray-500 dark:text-gray-400 flex items-center mt-1">
                                    <User className="h-3 w-3 mr-1" />
                                    {uploader?.name || 'Unknown'}
                                  </span>
                                  <span className="text-gray-500 dark:text-gray-400 flex items-center mt-1">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {formatDateTime(file.uploadedAt)}
                                  </span>
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                  onClick={() => handleDownloadFile(file)}
                                  aria-label={`Download file '${file.name}'`}
                                >
                                  <Download className="h-5 w-5" />
                                </button>
                                <button
                                  className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                  onClick={() => handleDeleteFile(file.id)}
                                  aria-label={`Delete file '${file.name}'`}
                                >
                                  <Trash2 className="h-5 w-5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-gray-500 dark:text-gray-400">No files uploaded yet. Upload your first file!</p>
                    </div>
                  )}
                </div>
              )}

              {/* Dashboard */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  <div className="card">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Event Overview</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="stat-card">
                        <div className="stat-title">Total Tasks</div>
                        <div className="stat-value">{tasks.filter(task => task.eventId === currentEvent?.id).length}</div>
                        <div className="stat-desc">
                          {tasks.filter(task => task.eventId === currentEvent?.id && task.completed).length} completed
                        </div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-title">Files Shared</div>
                        <div className="stat-value">{files.filter(file => file.eventId === currentEvent?.id).length}</div>
                        <div className="stat-desc">Latest: {getEventFiles()[0]?.name.substring(0, 15) || 'None'}</div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-title">Team Members</div>
                        <div className="stat-value">{users.length}</div>
                        <div className="stat-desc">{users.filter(u => u.role === 'member').length} members</div>
                      </div>
                    </div>
                  </div>

                  <div className="card">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Task Progress by Assignee</h2>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={getTaskStats()}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="completed" stackId="a" name="Completed" fill="#22c55e" />
                          <Bar dataKey="pending" stackId="a" name="Pending" fill="#f97316" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="card">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Activities</h2>
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                      {getEventActivities().slice(0, 5).map(activity => renderActivityItem(activity))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 shadow-inner py-6">
        <div className="container-fluid text-center text-gray-500 dark:text-gray-400 text-sm">
          Copyright © 2025 of Datavtar Private Limited. All rights reserved.
        </div>
      </footer>

      {/* Event Modal */}
      {isEventModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsEventModalOpen(false)}>
          <div 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="event-modal-title"
          >
            <div className="modal-header">
              <h3 id="event-modal-title" className="text-lg font-medium text-gray-900 dark:text-white">Create New Event</h3>
              <button 
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                onClick={() => setIsEventModalOpen(false)}
                aria-label="Close modal"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleAddEvent}>
              <div className="mt-4 space-y-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="title">Event Title</label>
                  <input id="title" name="title" type="text" className="input" required />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="date">Event Date</label>
                  <input id="date" name="date" type="date" className="input" required />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="location">Location</label>
                  <input id="location" name="location" type="text" className="input" required />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="description">Description</label>
                  <textarea id="description" name="description" rows={3} className="input" required></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                  onClick={() => setIsEventModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">Create Event</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Modal */}
      {isTaskModalOpen && (
        <div className="modal-backdrop" onClick={() => {
          setIsTaskModalOpen(false);
          setCurrentTask(null);
        }}>
          <div 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="task-modal-title"
          >
            <div className="modal-header">
              <h3 id="task-modal-title" className="text-lg font-medium text-gray-900 dark:text-white">
                {currentTask ? 'Edit Task' : 'Create New Task'}
              </h3>
              <button 
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                onClick={() => {
                  setIsTaskModalOpen(false);
                  setCurrentTask(null);
                }}
                aria-label="Close modal"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleAddTask}>
              <div className="mt-4 space-y-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="title">Task Title</label>
                  <input 
                    id="title" 
                    name="title" 
                    type="text" 
                    className="input" 
                    required 
                    defaultValue={currentTask?.title || ''}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="description">Description</label>
                  <textarea 
                    id="description" 
                    name="description" 
                    rows={3} 
                    className="input" 
                    required
                    defaultValue={currentTask?.description || ''}
                  ></textarea>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="assignedTo">Assigned To</label>
                  <select 
                    id="assignedTo" 
                    name="assignedTo" 
                    className="input" 
                    required
                    defaultValue={currentTask?.assignedTo || ''}
                  >
                    <option value="">Select a team member</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>{user.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="dueDate">Due Date</label>
                  <input 
                    id="dueDate" 
                    name="dueDate" 
                    type="date" 
                    className="input" 
                    required
                    defaultValue={currentTask?.dueDate || ''}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                  onClick={() => {
                    setIsTaskModalOpen(false);
                    setCurrentTask(null);
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {currentTask ? 'Update Task' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Note Modal */}
      {isNoteModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsNoteModalOpen(false)}>
          <div 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="note-modal-title"
          >
            <div className="modal-header">
              <h3 id="note-modal-title" className="text-lg font-medium text-gray-900 dark:text-white">Add Note</h3>
              <button 
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                onClick={() => setIsNoteModalOpen(false)}
                aria-label="Close modal"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleAddNote}>
              <div className="mt-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="content">Note Content</label>
                  <textarea id="content" name="content" rows={5} className="input" required></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                  onClick={() => setIsNoteModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">Add Note</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
