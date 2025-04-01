import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, LineChart, Line, ResponsiveContainer, Cell } from 'recharts';
import { 
  Users, 
  Kanban, 
  ChartBar, 
  ChartLine, 
  ChartPie, 
  Clock, 
  Calendar, 
  Filter, 
  Plus, 
  X, 
  Edit, 
  Trash2, 
  Moon, 
  Sun, 
  Check,
  Search
} from 'lucide-react';
import styles from './styles/styles.module.css';

// Define types and interfaces
interface Sprint {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'planning' | 'inProgress' | 'completed';
  storyPoints: {
    total: number;
    completed: number;
  };
}

interface Epic {
  id: string;
  name: string;
  description: string;
  status: 'notStarted' | 'inProgress' | 'completed';
  progress: number;
}

interface UserStory {
  id: string;
  title: string;
  description: string;
  epicId: string;
  sprintId: string | null;
  storyPoints: number;
  status: 'backlog' | 'todo' | 'inProgress' | 'review' | 'done';
  assignedTo: string | null;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
}

interface Team {
  id: string;
  name: string;
  members: string[];
}

interface Roadmap {
  id: string;
  name: string;
  quarters: Quarter[];
}

interface Quarter {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  epics: string[];
}

interface DashboardData {
  sprints: Sprint[];
  epics: Epic[];
  userStories: UserStory[];
  teams: Team[];
  roadmaps: Roadmap[];
}

interface ModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

type StatusTypes = 'backlog' | 'todo' | 'inProgress' | 'review' | 'done';
type StatusColors = Record<StatusTypes, string>;

const App: React.FC = () => {
  // State management
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    sprints: [],
    epics: [],
    userStories: [],
    teams: [],
    roadmaps: []
  });
  const [activeTab, setActiveTab] = useState<'overview' | 'sprints' | 'epics' | 'stories' | 'roadmap'>('overview');
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [modalContent, setModalContent] = useState<'sprint' | 'epic' | 'userStory' | 'team' | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // Load data from local storage on initial render
  useEffect(() => {
    const savedData = localStorage.getItem('agile-dashboard-data');
    if (savedData) {
      setDashboardData(JSON.parse(savedData));
    } else {
      // Initialize with sample data if nothing in localStorage
      initializeWithSampleData();
    }
    
    // Check for dark mode preference
    const savedDarkMode = localStorage.getItem('dark-mode-preference');
    if (savedDarkMode === 'true') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
    
    // Close modal on Escape key press
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setModalVisible(false);
      }
    };
    
    window.addEventListener('keydown', handleEscKey);
    return () => {
      window.removeEventListener('keydown', handleEscKey);
    };
  }, []);
  
  // Save data to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem('agile-dashboard-data', JSON.stringify(dashboardData));
  }, [dashboardData]);
  
  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    localStorage.setItem('dark-mode-preference', String(newDarkMode));
  };
  
  // Initialize with sample data
  const initializeWithSampleData = () => {
    const sampleData: DashboardData = {
      sprints: [
        {
          id: '1',
          name: 'Sprint 1',
          startDate: '2025-01-01',
          endDate: '2025-01-14',
          status: 'completed',
          storyPoints: {
            total: 40,
            completed: 38
          }
        },
        {
          id: '2',
          name: 'Sprint 2',
          startDate: '2025-01-15',
          endDate: '2025-01-28',
          status: 'inProgress',
          storyPoints: {
            total: 45,
            completed: 20
          }
        },
        {
          id: '3',
          name: 'Sprint 3',
          startDate: '2025-01-29',
          endDate: '2025-02-11',
          status: 'planning',
          storyPoints: {
            total: 35,
            completed: 0
          }
        }
      ],
      epics: [
        {
          id: '1',
          name: 'User Authentication',
          description: 'Implement user authentication and authorization',
          status: 'completed',
          progress: 100
        },
        {
          id: '2',
          name: 'Product Management',
          description: 'Features for managing product catalog',
          status: 'inProgress',
          progress: 60
        },
        {
          id: '3',
          name: 'Reporting Dashboard',
          description: 'Creating analytics and reporting dashboard',
          status: 'notStarted',
          progress: 0
        }
      ],
      userStories: [
        {
          id: '1',
          title: 'User Login',
          description: 'As a user, I want to login with my credentials',
          epicId: '1',
          sprintId: '1',
          storyPoints: 5,
          status: 'done',
          assignedTo: 'Alice Johnson',
          priority: 'high',
          createdAt: '2024-12-15'
        },
        {
          id: '2',
          title: 'User Registration',
          description: 'As a user, I want to create a new account',
          epicId: '1',
          sprintId: '1',
          storyPoints: 8,
          status: 'done',
          assignedTo: 'Bob Smith',
          priority: 'high',
          createdAt: '2024-12-16'
        },
        {
          id: '3',
          title: 'Password Reset',
          description: 'As a user, I want to reset my forgotten password',
          epicId: '1',
          sprintId: '1',
          storyPoints: 3,
          status: 'done',
          assignedTo: 'Charlie Davis',
          priority: 'medium',
          createdAt: '2024-12-18'
        },
        {
          id: '4',
          title: 'Add Product',
          description: 'As an admin, I want to add new products to the catalog',
          epicId: '2',
          sprintId: '2',
          storyPoints: 5,
          status: 'inProgress',
          assignedTo: 'David Wilson',
          priority: 'medium',
          createdAt: '2024-12-20'
        },
        {
          id: '5',
          title: 'Edit Product',
          description: 'As an admin, I want to edit existing products',
          epicId: '2',
          sprintId: '2',
          storyPoints: 3,
          status: 'todo',
          assignedTo: 'Emma Brown',
          priority: 'low',
          createdAt: '2024-12-22'
        },
        {
          id: '6',
          title: 'View Sales Reports',
          description: 'As a manager, I want to view monthly sales reports',
          epicId: '3',
          sprintId: null,
          storyPoints: 8,
          status: 'backlog',
          assignedTo: null,
          priority: 'medium',
          createdAt: '2024-12-23'
        }
      ],
      teams: [
        {
          id: '1',
          name: 'Frontend Team',
          members: ['Alice Johnson', 'Bob Smith']
        },
        {
          id: '2',
          name: 'Backend Team',
          members: ['Charlie Davis', 'David Wilson']
        },
        {
          id: '3',
          name: 'QA Team',
          members: ['Emma Brown']
        }
      ],
      roadmaps: [
        {
          id: '1',
          name: '2025 Product Roadmap',
          quarters: [
            {
              id: 'q1-2025',
              name: 'Q1 2025',
              startDate: '2025-01-01',
              endDate: '2025-03-31',
              epics: ['1', '2']
            },
            {
              id: 'q2-2025',
              name: 'Q2 2025',
              startDate: '2025-04-01',
              endDate: '2025-06-30',
              epics: ['3']
            }
          ]
        }
      ]
    };
    
    setDashboardData(sampleData);
    localStorage.setItem('agile-dashboard-data', JSON.stringify(sampleData));
  };

  // Helper functions for CRUD operations
  const addSprint = (sprint: Omit<Sprint, 'id'>) => {
    const newSprint: Sprint = {
      ...sprint,
      id: Date.now().toString()
    };
    
    setDashboardData(prev => ({
      ...prev,
      sprints: [...prev.sprints, newSprint]
    }));
    
    setModalVisible(false);
  };
  
  const updateSprint = (updatedSprint: Sprint) => {
    setDashboardData(prev => ({
      ...prev,
      sprints: prev.sprints.map(sprint => 
        sprint.id === updatedSprint.id ? updatedSprint : sprint
      )
    }));
    
    setModalVisible(false);
  };
  
  const deleteSprint = (id: string) => {
    setDashboardData(prev => ({
      ...prev,
      sprints: prev.sprints.filter(sprint => sprint.id !== id),
      // Update any user stories assigned to this sprint
      userStories: prev.userStories.map(story => 
        story.sprintId === id ? { ...story, sprintId: null } : story
      )
    }));
  };
  
  const addEpic = (epic: Omit<Epic, 'id'>) => {
    const newEpic: Epic = {
      ...epic,
      id: Date.now().toString()
    };
    
    setDashboardData(prev => ({
      ...prev,
      epics: [...prev.epics, newEpic]
    }));
    
    setModalVisible(false);
  };
  
  const updateEpic = (updatedEpic: Epic) => {
    setDashboardData(prev => ({
      ...prev,
      epics: prev.epics.map(epic => 
        epic.id === updatedEpic.id ? updatedEpic : epic
      )
    }));
    
    setModalVisible(false);
  };
  
  const deleteEpic = (id: string) => {
    setDashboardData(prev => ({
      ...prev,
      epics: prev.epics.filter(epic => epic.id !== id),
      // Update any roadmaps that reference this epic
      roadmaps: prev.roadmaps.map(roadmap => ({
        ...roadmap,
        quarters: roadmap.quarters.map(quarter => ({
          ...quarter,
          epics: quarter.epics.filter(epicId => epicId !== id)
        }))
      })),
      // Mark any user stories from this epic as orphaned
      userStories: prev.userStories.map(story => 
        story.epicId === id ? { ...story, epicId: 'orphaned' } : story
      )
    }));
  };
  
  const addUserStory = (story: Omit<UserStory, 'id' | 'createdAt'>) => {
    const newStory: UserStory = {
      ...story,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    setDashboardData(prev => ({
      ...prev,
      userStories: [...prev.userStories, newStory]
    }));
    
    setModalVisible(false);
  };
  
  const updateUserStory = (updatedStory: UserStory) => {
    setDashboardData(prev => ({
      ...prev,
      userStories: prev.userStories.map(story => 
        story.id === updatedStory.id ? updatedStory : story
      )
    }));
    
    setModalVisible(false);
  };
  
  const deleteUserStory = (id: string) => {
    setDashboardData(prev => ({
      ...prev,
      userStories: prev.userStories.filter(story => story.id !== id)
    }));
  };
  
  // Modal component
  const Modal: React.FC<ModalProps> = ({ title, isOpen, onClose, children }) => {
    if (!isOpen) return null;
    
    return (
      <div 
        className="modal-backdrop fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div 
          className="modal-content bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          <div className="modal-header flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 id="modal-title" className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
            <button 
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
              onClick={onClose}
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
          <div className="p-4">
            {children}
          </div>
        </div>
      </div>
    );
  };
  
  // Sprint form component
  const SprintForm: React.FC<{ sprint?: Sprint, onSubmit: (sprint: any) => void }> = ({ sprint, onSubmit }) => {
    const [formData, setFormData] = useState<{
      name: string;
      startDate: string;
      endDate: string;
      status: 'planning' | 'inProgress' | 'completed';
      totalStoryPoints: number;
      completedStoryPoints: number;
    }>({
      name: sprint?.name || '',
      startDate: sprint?.startDate || '',
      endDate: sprint?.endDate || '',
      status: sprint?.status || 'planning',
      totalStoryPoints: sprint?.storyPoints.total || 0,
      completedStoryPoints: sprint?.storyPoints.completed || 0
    });
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: name === 'totalStoryPoints' || name === 'completedStoryPoints' 
          ? parseInt(value) || 0 
          : value
      }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      onSubmit({
        id: sprint?.id,
        name: formData.name,
        startDate: formData.startDate,
        endDate: formData.endDate,
        status: formData.status,
        storyPoints: {
          total: formData.totalStoryPoints,
          completed: formData.completedStoryPoints
        }
      });
    };
    
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-group">
          <label className="form-label" htmlFor="sprint-name">Sprint Name</label>
          <input
            id="sprint-name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            className="input w-full"
            required
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label className="form-label" htmlFor="start-date">Start Date</label>
            <input
              id="start-date"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
              className="input w-full"
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="end-date">End Date</label>
            <input
              id="end-date"
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleChange}
              className="input w-full"
              required
            />
          </div>
        </div>
        
        <div className="form-group">
          <label className="form-label" htmlFor="sprint-status">Status</label>
          <select
            id="sprint-status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="input w-full"
            required
          >
            <option value="planning">Planning</option>
            <option value="inProgress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label className="form-label" htmlFor="total-points">Total Story Points</label>
            <input
              id="total-points"
              name="totalStoryPoints"
              type="number"
              min="0"
              value={formData.totalStoryPoints}
              onChange={handleChange}
              className="input w-full"
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="completed-points">Completed Story Points</label>
            <input
              id="completed-points"
              name="completedStoryPoints"
              type="number"
              min="0"
              max={formData.totalStoryPoints}
              value={formData.completedStoryPoints}
              onChange={handleChange}
              className="input w-full"
              required
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button 
            type="button" 
            onClick={() => setModalVisible(false)}
            className="btn bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            {sprint ? 'Update Sprint' : 'Add Sprint'}
          </button>
        </div>
      </form>
    );
  };
  
  // Epic form component
  const EpicForm: React.FC<{ epic?: Epic, onSubmit: (epic: any) => void }> = ({ epic, onSubmit }) => {
    const [formData, setFormData] = useState<{
      name: string;
      description: string;
      status: 'notStarted' | 'inProgress' | 'completed';
      progress: number;
    }>({
      name: epic?.name || '',
      description: epic?.description || '',
      status: epic?.status || 'notStarted',
      progress: epic?.progress || 0
    });
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: name === 'progress' ? parseInt(value) || 0 : value
      }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      onSubmit({
        id: epic?.id,
        ...formData
      });
    };
    
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-group">
          <label className="form-label" htmlFor="epic-name">Epic Name</label>
          <input
            id="epic-name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            className="input w-full"
            required
          />
        </div>
        
        <div className="form-group">
          <label className="form-label" htmlFor="epic-description">Description</label>
          <textarea
            id="epic-description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="input w-full h-24"
            required
          />
        </div>
        
        <div className="form-group">
          <label className="form-label" htmlFor="epic-status">Status</label>
          <select
            id="epic-status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="input w-full"
            required
          >
            <option value="notStarted">Not Started</option>
            <option value="inProgress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        
        <div className="form-group">
          <label className="form-label" htmlFor="epic-progress">
            Progress: {formData.progress}%
          </label>
          <input
            id="epic-progress"
            name="progress"
            type="range"
            min="0"
            max="100"
            value={formData.progress}
            onChange={handleChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            required
          />
        </div>
        
        <div className="flex justify-end space-x-3">
          <button 
            type="button" 
            onClick={() => setModalVisible(false)}
            className="btn bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            {epic ? 'Update Epic' : 'Add Epic'}
          </button>
        </div>
      </form>
    );
  };
  
  // User Story form component
  const UserStoryForm: React.FC<{ story?: UserStory, onSubmit: (story: any) => void }> = ({ story, onSubmit }) => {
    const [formData, setFormData] = useState<{
      title: string;
      description: string;
      epicId: string;
      sprintId: string | null;
      storyPoints: number;
      status: 'backlog' | 'todo' | 'inProgress' | 'review' | 'done';
      assignedTo: string | null;
      priority: 'low' | 'medium' | 'high';
    }>({
      title: story?.title || '',
      description: story?.description || '',
      epicId: story?.epicId || '',
      sprintId: story?.sprintId || null,
      storyPoints: story?.storyPoints || 0,
      status: story?.status || 'backlog',
      assignedTo: story?.assignedTo || null,
      priority: story?.priority || 'medium'
    });
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: name === 'storyPoints' 
          ? parseInt(value) || 0 
          : name === 'sprintId' || name === 'assignedTo' 
            ? value === '' ? null : value 
            : value
      }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      onSubmit({
        id: story?.id,
        createdAt: story?.createdAt || new Date().toISOString().split('T')[0],
        ...formData
      });
    };
    
    // Extract unique team members for the assignee dropdown
    const teamMembers = Array.from(
      new Set(
        dashboardData.teams.flatMap(team => team.members)
      )
    ).sort();
    
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-group">
          <label className="form-label" htmlFor="story-title">Title</label>
          <input
            id="story-title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleChange}
            className="input w-full"
            required
          />
        </div>
        
        <div className="form-group">
          <label className="form-label" htmlFor="story-description">Description</label>
          <textarea
            id="story-description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="input w-full h-24"
            required
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label className="form-label" htmlFor="story-epic">Epic</label>
            <select
              id="story-epic"
              name="epicId"
              value={formData.epicId}
              onChange={handleChange}
              className="input w-full"
              required
            >
              <option value="">Select Epic</option>
              {dashboardData.epics.map(epic => (
                <option key={epic.id} value={epic.id}>{epic.name}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="story-sprint">Sprint (optional)</label>
            <select
              id="story-sprint"
              name="sprintId"
              value={formData.sprintId || ''}
              onChange={handleChange}
              className="input w-full"
            >
              <option value="">None</option>
              {dashboardData.sprints.map(sprint => (
                <option key={sprint.id} value={sprint.id}>{sprint.name}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="form-group">
            <label className="form-label" htmlFor="story-points">Story Points</label>
            <input
              id="story-points"
              name="storyPoints"
              type="number"
              min="0"
              max="20"
              value={formData.storyPoints}
              onChange={handleChange}
              className="input w-full"
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="story-status">Status</label>
            <select
              id="story-status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="input w-full"
              required
            >
              <option value="backlog">Backlog</option>
              <option value="todo">To Do</option>
              <option value="inProgress">In Progress</option>
              <option value="review">Review</option>
              <option value="done">Done</option>
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="story-priority">Priority</label>
            <select
              id="story-priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="input w-full"
              required
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
        
        <div className="form-group">
          <label className="form-label" htmlFor="story-assignee">Assigned To (optional)</label>
          <select
            id="story-assignee"
            name="assignedTo"
            value={formData.assignedTo || ''}
            onChange={handleChange}
            className="input w-full"
          >
            <option value="">Unassigned</option>
            {teamMembers.map(member => (
              <option key={member} value={member}>{member}</option>
            ))}
          </select>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button 
            type="button" 
            onClick={() => setModalVisible(false)}
            className="btn bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            {story ? 'Update Story' : 'Add Story'}
          </button>
        </div>
      </form>
    );
  };
  
  // Chart data preparation
  const prepareSprintBurndownData = () => {
    return dashboardData.sprints.map(sprint => ({
      name: sprint.name,
      total: sprint.storyPoints.total,
      completed: sprint.storyPoints.completed,
      remaining: sprint.storyPoints.total - sprint.storyPoints.completed
    }));
  };
  
  const prepareEpicProgressData = () => {
    return dashboardData.epics.map(epic => ({
      name: epic.name,
      progress: epic.progress
    }));
  };
  
  const prepareStoryStatusData = () => {
    const statusCounts: Record<string, number> = {
      backlog: 0,
      todo: 0,
      inProgress: 0,
      review: 0,
      done: 0
    };
    
    dashboardData.userStories.forEach(story => {
      statusCounts[story.status] += 1;
    });
    
    return Object.entries(statusCounts).map(([status, count]) => ({
      name: formatStatusName(status),
      value: count
    }));
  };
  
  const formatStatusName = (status: string): string => {
    switch (status) {
      case 'backlog': return 'Backlog';
      case 'todo': return 'To Do';
      case 'inProgress': return 'In Progress';
      case 'review': return 'Review';
      case 'done': return 'Done';
      default: return status;
    }
  };
  
  // Get the status color for user stories
  const getStatusColor = (status: StatusTypes): string => {
    const statusColors: StatusColors = {
      backlog: 'bg-gray-500',
      todo: 'bg-blue-500',
      inProgress: 'bg-yellow-500',
      review: 'bg-purple-500',
      done: 'bg-green-500'
    };
    
    return statusColors[status];
  };
  
  const getStatusBadgeClass = (status: StatusTypes): string => {
    const statusColors: StatusColors = {
      backlog: 'badge-gray',
      todo: 'badge-blue',
      inProgress: 'badge-yellow',
      review: 'badge-purple',
      done: 'badge-green'
    };
    
    return `badge ${statusColors[status]}`;
  };
  
  // Get the color for the pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD'];
  
  // Filter stories based on search and filter criteria
  const filteredStories = dashboardData.userStories.filter(story => {
    const matchesSearch = searchQuery === '' || 
      story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || story.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });
  
  // Find sprint by ID
  const getSprintById = (id: string | null): Sprint | undefined => {
    if (!id) return undefined;
    return dashboardData.sprints.find(sprint => sprint.id === id);
  };
  
  // Find epic by ID
  const getEpicById = (id: string): Epic | undefined => {
    return dashboardData.epics.find(epic => epic.id === id);
  };
  
  // Calculate sprint velocity
  const calculateSprintVelocity = (): number => {
    const completedSprints = dashboardData.sprints.filter(sprint => sprint.status === 'completed');
    
    if (completedSprints.length === 0) return 0;
    
    const totalCompletedPoints = completedSprints.reduce(
      (sum, sprint) => sum + sprint.storyPoints.completed, 0
    );
    
    return Math.round(totalCompletedPoints / completedSprints.length);
  };
  
  // Calculate total stories by status
  const getStoriesByStatus = (): Record<string, number> => {
    const statusCounts: Record<string, number> = {
      backlog: 0,
      todo: 0,
      inProgress: 0,
      review: 0,
      done: 0
    };
    
    dashboardData.userStories.forEach(story => {
      statusCounts[story.status] += 1;
    });
    
    return statusCounts;
  };
  
  // Render dashboard components
  const renderOverviewTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Sprint Velocity */}
        <div className="stat-card">
          <div className="stat-title">Sprint Velocity</div>
          <div className="stat-value">{calculateSprintVelocity()}</div>
          <div className="stat-desc">Points per sprint</div>
        </div>
        
        {/* Total Stories */}
        <div className="stat-card">
          <div className="stat-title">Total Stories</div>
          <div className="stat-value">{dashboardData.userStories.length}</div>
          <div className="stat-desc">
            {dashboardData.userStories.filter(story => story.status === 'done').length} completed
          </div>
        </div>
        
        {/* Current Sprint */}
        <div className="stat-card">
          <div className="stat-title">Current Sprint</div>
          <div className="stat-value">
            {dashboardData.sprints.find(sprint => sprint.status === 'inProgress')?.name || 'None'}
          </div>
          <div className="stat-desc">
            {dashboardData.sprints.filter(sprint => sprint.status === 'inProgress').length > 0 
              ? 'In progress' 
              : 'No active sprint'}
          </div>
        </div>
        
        {/* Epics Progress */}
        <div className="stat-card">
          <div className="stat-title">Epics Progress</div>
          <div className="stat-value">
            {Math.round(
              dashboardData.epics.reduce((sum, epic) => sum + epic.progress, 0) / 
              (dashboardData.epics.length || 1)
            )}%
          </div>
          <div className="stat-desc">
            {dashboardData.epics.filter(epic => epic.status === 'completed').length} completed
          </div>
        </div>
      </div>
      
      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sprint Burndown Chart */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Sprint Burndown</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={prepareSprintBurndownData()}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" fill="#4CAF50" name="Completed" />
                <Bar dataKey="remaining" fill="#F44336" name="Remaining" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Story Status Distribution */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Story Status Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={prepareStoryStatusData()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {prepareStoryStatusData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Epic Progress */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Epic Progress</h3>
        <div className="space-y-4">
          {dashboardData.epics.map(epic => (
            <div key={epic.id} className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">{epic.name}</span>
                <span>{epic.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${epic.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {dashboardData.userStories
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 5)
            .map(story => (
              <div key={story.id} className="flex items-start">
                <div className={`w-2 h-2 mt-2 mr-3 rounded-full ${getStatusColor(story.status)}`} />
                <div>
                  <h4 className="font-medium">{story.title}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Added on {format(new Date(story.createdAt), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
  
  const renderSprintsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Sprints</h2>
        <button 
          className="btn btn-primary flex items-center gap-2"
          onClick={() => {
            setSelectedItem(null);
            setModalContent('sprint');
            setModalVisible(true);
          }}
        >
          <Plus size={16} />
          Add Sprint
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {dashboardData.sprints.map(sprint => (
          <div key={sprint.id} className="card">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">{sprint.name}</h3>
              <div className="flex space-x-2">
                <button 
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  onClick={() => {
                    setSelectedItem(sprint);
                    setModalContent('sprint');
                    setModalVisible(true);
                  }}
                  aria-label="Edit sprint"
                >
                  <Edit size={16} />
                </button>
                <button 
                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  onClick={() => deleteSprint(sprint.id)}
                  aria-label="Delete sprint"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {format(new Date(sprint.startDate), 'MMM d')} - {format(new Date(sprint.endDate), 'MMM d, yyyy')}
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Progress: {Math.round((sprint.storyPoints.completed / sprint.storyPoints.total) * 100) || 0}%
                </span>
                <span 
                  className={`px-2 py-1 text-xs rounded-full ${
                    sprint.status === 'planning' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                    sprint.status === 'inProgress' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                  }`}
                >
                  {sprint.status === 'planning' ? 'Planning' :
                   sprint.status === 'inProgress' ? 'In Progress' :
                   'Completed'}
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${(sprint.storyPoints.completed / sprint.storyPoints.total) * 100 || 0}%` }}
                />
              </div>
              
              <div className="flex justify-between text-sm mt-2">
                <span>
                  <span className="font-medium">{sprint.storyPoints.completed}</span> of {sprint.storyPoints.total} points
                </span>
                <span>
                  {dashboardData.userStories.filter(story => story.sprintId === sprint.id && story.status === 'done').length} of {dashboardData.userStories.filter(story => story.sprintId === sprint.id).length} stories
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Sprint Burndown Chart */}
      <div className="card mt-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Sprint Comparison</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={prepareSprintBurndownData()}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="total" stroke="#8884d8" activeDot={{ r: 8 }} name="Total Points" />
              <Line type="monotone" dataKey="completed" stroke="#82ca9d" name="Completed Points" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
  
  const renderEpicsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Epics</h2>
        <button 
          className="btn btn-primary flex items-center gap-2"
          onClick={() => {
            setSelectedItem(null);
            setModalContent('epic');
            setModalVisible(true);
          }}
        >
          <Plus size={16} />
          Add Epic
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {dashboardData.epics.map(epic => (
          <div key={epic.id} className="card">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">{epic.name}</h3>
              <div className="flex space-x-2">
                <button 
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  onClick={() => {
                    setSelectedItem(epic);
                    setModalContent('epic');
                    setModalVisible(true);
                  }}
                  aria-label="Edit epic"
                >
                  <Edit size={16} />
                </button>
                <button 
                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  onClick={() => deleteEpic(epic.id)}
                  aria-label="Delete epic"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">{epic.description}</p>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Progress: {epic.progress}%
                </span>
                <span 
                  className={`px-2 py-1 text-xs rounded-full ${
                    epic.status === 'notStarted' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                    epic.status === 'inProgress' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                  }`}
                >
                  {epic.status === 'notStarted' ? 'Not Started' :
                   epic.status === 'inProgress' ? 'In Progress' :
                   'Completed'}
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${epic.progress}%` }}
                />
              </div>
              
              <div className="mt-3">
                <span className="text-sm font-medium">User Stories:</span>
                <div className="mt-2 space-y-2">
                  {dashboardData.userStories
                    .filter(story => story.epicId === epic.id)
                    .slice(0, 3)
                    .map(story => (
                      <div key={story.id} className="flex items-center">
                        <div className={`w-2 h-2 mr-2 rounded-full ${getStatusColor(story.status)}`} />
                        <span className="text-sm truncate">{story.title}</span>
                      </div>
                    ))
                  }
                  {dashboardData.userStories.filter(story => story.epicId === epic.id).length > 3 && (
                    <div className="text-sm text-blue-600 dark:text-blue-400">
                      +{dashboardData.userStories.filter(story => story.epicId === epic.id).length - 3} more stories
                    </div>
                  )}
                  {dashboardData.userStories.filter(story => story.epicId === epic.id).length === 0 && (
                    <div className="text-sm text-gray-500 dark:text-gray-400">No stories yet</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Epic Progress Chart */}
      <div className="card mt-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Epic Progress</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={prepareEpicProgressData()}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis dataKey="name" type="category" width={150} />
              <Tooltip />
              <Legend />
              <Bar dataKey="progress" fill="#8884d8" name="Progress (%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
  
  const renderUserStoriesTab = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">User Stories</h2>
        <button 
          className="btn btn-primary flex items-center gap-2"
          onClick={() => {
            setSelectedItem(null);
            setModalContent('userStory');
            setModalVisible(true);
          }}
        >
          <Plus size={16} />
          Add User Story
        </button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="input pl-10 w-full"
            placeholder="Search stories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <select
          className="input w-full md:w-48"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="backlog">Backlog</option>
          <option value="todo">To Do</option>
          <option value="inProgress">In Progress</option>
          <option value="review">Review</option>
          <option value="done">Done</option>
        </select>
      </div>
      
      <div className="overflow-x-auto">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th className="table-header">Story</th>
                <th className="table-header">Epic</th>
                <th className="table-header">Sprint</th>
                <th className="table-header">Points</th>
                <th className="table-header">Status</th>
                <th className="table-header">Assigned To</th>
                <th className="table-header">Priority</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {filteredStories.length > 0 ? (
                filteredStories.map(story => (
                  <tr key={story.id}>
                    <td className="table-cell font-medium">{story.title}</td>
                    <td className="table-cell">{getEpicById(story.epicId)?.name || 'Unassigned'}</td>
                    <td className="table-cell">{getSprintById(story.sprintId)?.name || 'Unassigned'}</td>
                    <td className="table-cell text-center">{story.storyPoints}</td>
                    <td className="table-cell">
                      <span className={getStatusBadgeClass(story.status)}>
                        {formatStatusName(story.status)}
                      </span>
                    </td>
                    <td className="table-cell">{story.assignedTo || 'Unassigned'}</td>
                    <td className="table-cell">
                      <span 
                        className={`px-2 py-1 text-xs rounded-full ${
                          story.priority === 'low' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                          story.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                        }`}
                      >
                        {story.priority.charAt(0).toUpperCase() + story.priority.slice(1)}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center space-x-2">
                        <button 
                          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                          onClick={() => {
                            setSelectedItem(story);
                            setModalContent('userStory');
                            setModalVisible(true);
                          }}
                          aria-label="Edit story"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          onClick={() => deleteUserStory(story.id)}
                          aria-label="Delete story"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="table-cell text-center py-4 text-gray-500 dark:text-gray-400">
                    No stories found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Kanban Board View */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Kanban Board</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto">
          {(['backlog', 'todo', 'inProgress', 'review', 'done'] as StatusTypes[]).map(status => (
            <div key={status} className="kanban-column">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900 dark:text-white">{formatStatusName(status)}</h4>
                <span className="text-xs bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full">
                  {dashboardData.userStories.filter(s => s.status === status).length}
                </span>
              </div>
              
              <div className="space-y-2">
                {dashboardData.userStories
                  .filter(s => s.status === status)
                  .map(story => (
                    <div 
                      key={story.id} 
                      className="bg-white dark:bg-gray-700 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600"
                      onClick={() => {
                        setSelectedItem(story);
                        setModalContent('userStory');
                        setModalVisible(true);
                      }}
                    >
                      <div className="font-medium text-sm mb-1">{story.title}</div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {story.storyPoints} pts
                        </span>
                        <span 
                          className={`text-xs px-1.5 py-0.5 rounded-full ${
                            story.priority === 'low' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                            story.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                          }`}
                        >
                          {story.priority}
                        </span>
                      </div>
                      {story.assignedTo && (
                        <div className="mt-2 text-xs flex items-center">
                          <Users size={12} className="mr-1 text-gray-500 dark:text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-300 truncate">
                            {story.assignedTo}
                          </span>
                        </div>
                      )}
                    </div>
                  ))
                }
                {dashboardData.userStories.filter(s => s.status === status).length === 0 && (
                  <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-3 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                    No stories
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
  
  const renderRoadmapTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Product Roadmap</h2>
      </div>
      
      {dashboardData.roadmaps.map(roadmap => (
        <div key={roadmap.id} className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{roadmap.name}</h3>
          
          <div className="space-y-8">
            {roadmap.quarters.map(quarter => (
              <div key={quarter.id} className="card">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-base font-medium text-gray-900 dark:text-white">{quarter.name}</h4>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {format(new Date(quarter.startDate), 'MMM d')} - {format(new Date(quarter.endDate), 'MMM d, yyyy')}
                  </span>
                </div>
                
                <div className="space-y-4">
                  {quarter.epics.map(epicId => {
                    const epic = getEpicById(epicId);
                    if (!epic) return null;
                    
                    return (
                      <div key={epicId} className="border-l-4 border-blue-500 pl-4 py-2">
                        <h5 className="font-medium">{epic.name}</h5>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{epic.description}</p>
                        
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Progress: {epic.progress}%</span>
                            <span 
                              className={`px-2 py-0.5 text-xs rounded-full ${
                                epic.status === 'notStarted' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                                epic.status === 'inProgress' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                                'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                              }`}
                            >
                              {epic.status === 'notStarted' ? 'Not Started' :
                               epic.status === 'inProgress' ? 'In Progress' :
                               'Completed'}
                            </span>
                          </div>
                          
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1 dark:bg-gray-700">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${epic.progress}%` }}
                            />
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            {dashboardData.userStories.filter(story => story.epicId === epic.id).length} stories
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  
                  {quarter.epics.length === 0 && (
                    <div className="text-sm text-gray-500 dark:text-gray-400">No epics planned for this quarter</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      
      {/* Timeline Chart */}
      <div className="card mt-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Epic Timeline</h3>
        <div>
          {dashboardData.epics.map(epic => (
            <div key={epic.id} className="relative mb-8">
              <div className="flex items-center mb-2">
                <div className="w-3 h-3 rounded-full bg-blue-500 mr-3" />
                <h4 className="font-medium">{epic.name}</h4>
              </div>
              
              <div className="ml-6 border-l-2 border-gray-300 dark:border-gray-600 pl-4 py-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">{epic.description}</p>
                
                <div className="mt-3 space-y-2">
                  {dashboardData.userStories
                    .filter(story => story.epicId === epic.id)
                    .slice(0, 3)
                    .map(story => (
                      <div key={story.id} className="flex items-center">
                        <div className={`w-2 h-2 mr-2 rounded-full ${getStatusColor(story.status)}`} />
                        <span className="text-sm">{story.title}</span>
                        <span className={`ml-2 ${getStatusBadgeClass(story.status)} text-xs`}>
                          {formatStatusName(story.status)}
                        </span>
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
  
  // Render the appropriate modal content
  const renderModalContent = () => {
    switch (modalContent) {
      case 'sprint':
        return (
          <SprintForm 
            sprint={selectedItem as Sprint} 
            onSubmit={selectedItem ? updateSprint : addSprint} 
          />
        );
      case 'epic':
        return (
          <EpicForm 
            epic={selectedItem as Epic} 
            onSubmit={selectedItem ? updateEpic : addEpic} 
          />
        );
      case 'userStory':
        return (
          <UserStoryForm 
            story={selectedItem as UserStory} 
            onSubmit={selectedItem ? updateUserStory : addUserStory} 
          />
        );
      default:
        return null;
    }
  };
  
  // Main render
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between">
          <div className="flex items-center mb-4 sm:mb-0">
            <Kanban className="h-8 w-8 text-primary-600 mr-2" />
            <h1 className="text-xl font-bold">Agile Roadmap Dashboard</h1>
          </div>
          
          <div className="flex items-center">
            <button 
              className="theme-toggle mr-4"
              onClick={toggleDarkMode}
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </header>
      
      {/* Navigation Tabs */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto">
            <button
              className={`py-4 px-6 focus:outline-none ${activeTab === 'overview' ? 'border-b-2 border-primary-500 font-medium text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
              onClick={() => setActiveTab('overview')}
            >
              <div className="flex items-center justify-center gap-2">
                <ChartBar size={16} />
                <span>Overview</span>
              </div>
            </button>
            
            <button
              className={`py-4 px-6 focus:outline-none ${activeTab === 'sprints' ? 'border-b-2 border-primary-500 font-medium text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
              onClick={() => setActiveTab('sprints')}
            >
              <div className="flex items-center justify-center gap-2">
                <Calendar size={16} />
                <span>Sprints</span>
              </div>
            </button>
            
            <button
              className={`py-4 px-6 focus:outline-none ${activeTab === 'epics' ? 'border-b-2 border-primary-500 font-medium text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
              onClick={() => setActiveTab('epics')}
            >
              <div className="flex items-center justify-center gap-2">
                <ChartPie size={16} />
                <span>Epics</span>
              </div>
            </button>
            
            <button
              className={`py-4 px-6 focus:outline-none ${activeTab === 'stories' ? 'border-b-2 border-primary-500 font-medium text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
              onClick={() => setActiveTab('stories')}
            >
              <div className="flex items-center justify-center gap-2">
                <Users size={16} />
                <span>User Stories</span>
              </div>
            </button>
            
            <button
              className={`py-4 px-6 focus:outline-none ${activeTab === 'roadmap' ? 'border-b-2 border-primary-500 font-medium text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
              onClick={() => setActiveTab('roadmap')}
            >
              <div className="flex items-center justify-center gap-2">
                <ChartLine size={16} />
                <span>Roadmap</span>
              </div>
            </button>
          </div>
        </div>
      </nav>
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'sprints' && renderSprintsTab()}
        {activeTab === 'epics' && renderEpicsTab()}
        {activeTab === 'stories' && renderUserStoriesTab()}
        {activeTab === 'roadmap' && renderRoadmapTab()}
      </main>
      
      {/* Modals */}
      <Modal 
        title={`${
          selectedItem 
            ? modalContent === 'sprint' 
              ? 'Edit Sprint' 
              : modalContent === 'epic' 
                ? 'Edit Epic' 
                : 'Edit User Story' 
            : modalContent === 'sprint' 
              ? 'Add Sprint' 
              : modalContent === 'epic' 
                ? 'Add Epic' 
                : 'Add User Story'
        }`}
        isOpen={modalVisible}
        onClose={() => setModalVisible(false)}
      >
        {renderModalContent()}
      </Modal>
      
      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 shadow-inner py-4 mt-8">
        <div className="container mx-auto px-4 text-center text-gray-500 dark:text-gray-400 text-sm">
          Copyright © 2025 of Datavtar Private Limited. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default App;
