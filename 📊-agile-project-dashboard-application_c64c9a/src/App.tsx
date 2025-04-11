import React, { useState, useEffect, useRef } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, ComposedChart, ReferenceLine
} from 'recharts';
import {
  Plus, Trash2, Download, Upload, Filter, Edit, User, X, Check, Settings, CheckCircle,
  ChevronDown, ChevronUp, FileText, PenTool, ChevronRight, FileJson, AlertCircle, PieChart,
  Trello, TrendingUp, BarChart as BarChartIcon, ArrowLeft, ArrowRight,
  Clock, Calendar, CalendarDays, Menu // Added Menu import
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { format, isValid, parseISO } from 'date-fns';
import styles from './styles/styles.module.css';

// Define TypeScript interfaces for our data model
interface SprintDay {
  date: string;
  remainingPoints: number;
  idealBurndown: number;
}

interface Sprint {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  totalPoints: number;
  completedPoints: number;
  status: 'active' | 'completed' | 'planned';
  burndownData: SprintDay[];
}

interface StoryPoint {
  sprint: string;
  planned: number;
  completed: number;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  image: string | null;
}

interface Story {
  id: string;
  title: string;
  description: string;
  points: number;
  status: 'todo' | 'in-progress' | 'done';
  sprint: string;
  assignee?: string;
  createdAt: string;
  completedAt?: string;
}

interface AgileProject {
  id: string;
  name: string;
  description: string;
  sprints: Sprint[];
  members: TeamMember[];
  stories: Story[];
  createdAt: string;
  updatedAt: string;
}

interface DashboardFilters {
  sprintId: string;
  dateRange: string;
  statusFilter: string[];
}

const App: React.FC = () => {
  // State for theme toggle
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode === 'true' || 
      (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // Main application states
  const [projects, setProjects] = useState<AgileProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<AgileProject | null>(null);
  const [selectedSprint, setSelectedSprint] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState<boolean>(false);
  const [isCreateSprintModalOpen, setIsCreateSprintModalOpen] = useState<boolean>(false);
  const [isCreateStoryModalOpen, setIsCreateStoryModalOpen] = useState<boolean>(false);
  const [dashboardFilters, setDashboardFilters] = useState<DashboardFilters>({
    sprintId: '',
    dateRange: 'all',
    statusFilter: ['todo', 'in-progress', 'done']
  });
  const [showSideMenu, setShowSideMenu] = useState<boolean>(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedProjects = localStorage.getItem('agile-projects');
    if (savedProjects) {
      try {
        const parsedProjects = JSON.parse(savedProjects) as AgileProject[];
        setProjects(parsedProjects);
        
        // If there's at least one project, select the first one by default
        if (parsedProjects.length > 0) {
          setSelectedProject(parsedProjects[0]);
          // Select the most recent active sprint if available
          const activeSprint = parsedProjects[0].sprints.find(s => s.status === 'active');
          setSelectedSprint(activeSprint?.id || (parsedProjects[0].sprints[0]?.id || ''));
        }
      } catch (error) {
        console.error('Error parsing saved projects:', error);
      }
    } else {
      // Initialize with sample data if no saved projects exist
      initializeSampleData();
    }
  }, []);

  // Apply dark mode class to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  // Update localStorage whenever projects change
  useEffect(() => {
    localStorage.setItem('agile-projects', JSON.stringify(projects));
  }, [projects]);

  // Handle keyboard events for modals
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeAllModals();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, []);

  // Close all modals function
  const closeAllModals = () => {
    setIsImportModalOpen(false);
    setIsCreateProjectModalOpen(false);
    setIsCreateSprintModalOpen(false);
    setIsCreateStoryModalOpen(false);
    document.body.classList.remove('modal-open');
  };

  // Initialize with sample data
  const initializeSampleData = () => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 7);
    
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 7);
    
    // Generate sample burndown data
    const burndownData: SprintDay[] = [];
    const totalDays = 14;
    const totalPoints = 100;
    
    for (let i = 0; i <= totalDays; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      const idealBurndown = totalPoints - ((totalPoints / totalDays) * i);
      const randomDeviation = Math.random() * 10 - 5; // Between -5 and 5
      
      burndownData.push({
        date: currentDate.toISOString().split('T')[0],
        remainingPoints: Math.max(0, Math.round(idealBurndown + randomDeviation)),
        idealBurndown: Math.round(idealBurndown)
      });
    }
    
    const sampleProject: AgileProject = {
      id: 'proj-' + Date.now(),
      name: 'Sample Agile Project',
      description: 'This is a sample project to help you get started with the Agile Dashboard.',
      sprints: [
        {
          id: 'sprint-' + Date.now(),
          name: 'Sprint 1',
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          totalPoints: 100,
          completedPoints: 35,
          status: 'active',
          burndownData
        }
      ],
      members: [
        {
          id: 'member-1',
          name: 'John Doe',
          role: 'Scrum Master',
          image: null
        },
        {
          id: 'member-2',
          name: 'Jane Smith',
          role: 'Product Owner',
          image: null
        },
        {
          id: 'member-3',
          name: 'Mike Johnson',
          role: 'Developer',
          image: null
        }
      ],
      stories: [
        {
          id: 'story-1',
          title: 'Set up development environment',
          description: 'Install and configure all necessary tools for development',
          points: 5,
          status: 'done',
          sprint: 'sprint-' + Date.now(),
          assignee: 'member-3',
          createdAt: startDate.toISOString(),
          completedAt: new Date(startDate.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'story-2',
          title: 'Create user authentication flow',
          description: 'Implement login, registration, and password reset functionality',
          points: 13,
          status: 'in-progress',
          sprint: 'sprint-' + Date.now(),
          assignee: 'member-3',
          createdAt: startDate.toISOString()
        },
        {
          id: 'story-3',
          title: 'Design dashboard UI',
          description: 'Create wireframes and high-fidelity designs for the main dashboard',
          points: 8,
          status: 'done',
          sprint: 'sprint-' + Date.now(),
          assignee: 'member-2',
          createdAt: startDate.toISOString(),
          completedAt: new Date(startDate.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'story-4',
          title: 'Implement REST API endpoints',
          description: 'Create backend API endpoints for the main application features',
          points: 21,
          status: 'todo',
          sprint: 'sprint-' + Date.now(),
          assignee: 'member-1',
          createdAt: startDate.toISOString()
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setProjects([sampleProject]);
    setSelectedProject(sampleProject);
    setSelectedSprint(sampleProject.sprints[0].id);
  };

  // Data manipulation functions
  const handleCreateProject = (data: any) => {
    const newProject: AgileProject = {
      id: 'proj-' + Date.now(),
      name: data.name,
      description: data.description,
      sprints: [],
      members: [],
      stories: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setProjects([...projects, newProject]);
    setSelectedProject(newProject);
    setSelectedSprint('');
    closeAllModals();
    reset();
    setActiveTab('sprints'); // Switch to sprints tab to create new sprint
  };

  const handleDeleteProject = (projectId: string) => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      const updatedProjects = projects.filter(p => p.id !== projectId);
      setProjects(updatedProjects);
      
      if (selectedProject?.id === projectId) {
        setSelectedProject(updatedProjects[0] || null);
        setSelectedSprint(updatedProjects[0]?.sprints[0]?.id || '');
      }
    }
  };

  const handleCreateSprint = (data: any) => {
    if (!selectedProject) return;
    
    const newSprint: Sprint = {
      id: 'sprint-' + Date.now(),
      name: data.name,
      startDate: data.startDate,
      endDate: data.endDate,
      totalPoints: parseInt(data.totalPoints) || 0,
      completedPoints: 0,
      status: data.status as 'active' | 'completed' | 'planned',
      burndownData: generateBurndownData(data.startDate, data.endDate, parseInt(data.totalPoints) || 0)
    };
    
    const updatedProject = {
      ...selectedProject,
      sprints: [...selectedProject.sprints, newSprint],
      updatedAt: new Date().toISOString()
    };
    
    updateProject(updatedProject);
    setSelectedSprint(newSprint.id);
    closeAllModals();
    reset();
  };

  const handleDeleteSprint = (sprintId: string) => {
    if (!selectedProject) return;
    
    if (window.confirm('Are you sure you want to delete this sprint? All associated stories will be unassigned.')) {
      // Update the stories that were assigned to this sprint
      const updatedStories = selectedProject.stories.map(story => {
        if (story.sprint === sprintId) {
          return { ...story, sprint: '' };
        }
        return story;
      });
      
      const updatedProject = {
        ...selectedProject,
        sprints: selectedProject.sprints.filter(s => s.id !== sprintId),
        stories: updatedStories,
        updatedAt: new Date().toISOString()
      };
      
      updateProject(updatedProject);
      
      if (selectedSprint === sprintId) {
        setSelectedSprint(updatedProject.sprints[0]?.id || '');
      }
    }
  };

  const handleCreateStory = (data: any) => {
    if (!selectedProject) return;
    
    const newStory: Story = {
      id: 'story-' + Date.now(),
      title: data.title,
      description: data.description,
      points: parseInt(data.points) || 0,
      status: data.status as 'todo' | 'in-progress' | 'done',
      sprint: data.sprint,
      assignee: data.assignee || undefined,
      createdAt: new Date().toISOString(),
      completedAt: data.status === 'done' ? new Date().toISOString() : undefined
    };
    
    // Update sprint if the story is added to a sprint
    let updatedSprints = [...selectedProject.sprints];
    if (data.sprint) {
      updatedSprints = updatedSprints.map(sprint => {
        if (sprint.id === data.sprint) {
          return {
            ...sprint,
            totalPoints: sprint.totalPoints + (parseInt(data.points) || 0),
            completedPoints: data.status === 'done' ? sprint.completedPoints + (parseInt(data.points) || 0) : sprint.completedPoints
          };
        }
        return sprint;
      });
    }
    
    const updatedProject = {
      ...selectedProject,
      sprints: updatedSprints,
      stories: [...selectedProject.stories, newStory],
      updatedAt: new Date().toISOString()
    };
    
    updateProject(updatedProject);
    closeAllModals();
    reset();
  };

  const handleUpdateStoryStatus = (storyId: string, newStatus: 'todo' | 'in-progress' | 'done') => {
    if (!selectedProject) return;
    
    const story = selectedProject.stories.find(s => s.id === storyId);
    if (!story) return;
    
    const updatedStories = selectedProject.stories.map(s => {
      if (s.id === storyId) {
        return { 
          ...s, 
          status: newStatus,
          completedAt: newStatus === 'done' ? new Date().toISOString() : undefined
        };
      }
      return s;
    });
    
    // Update sprint completed points if needed
    let updatedSprints = [...selectedProject.sprints];
    if (story.sprint) {
      updatedSprints = updatedSprints.map(sprint => {
        if (sprint.id === story.sprint) {
          // Calculate new completed points based on status changes
          let pointsDelta = 0;
          
          // If moving to done, add points
          if (newStatus === 'done' && story.status !== 'done') {
            pointsDelta = story.points;
          }
          // If moving from done to another status, subtract points
          else if (newStatus !== 'done' && story.status === 'done') {
            pointsDelta = -story.points;
          }
          
          return {
            ...sprint,
            completedPoints: Math.max(0, sprint.completedPoints + pointsDelta)
          };
        }
        return sprint;
      });
    }
    
    const updatedProject = {
      ...selectedProject,
      sprints: updatedSprints,
      stories: updatedStories,
      updatedAt: new Date().toISOString()
    };
    
    updateProject(updatedProject);
  };

  const handleDeleteStory = (storyId: string) => {
    if (!selectedProject) return;
    
    if (window.confirm('Are you sure you want to delete this story?')) {
      const story = selectedProject.stories.find(s => s.id === storyId);
      if (!story) return;
      
      // Update sprint points if needed
      let updatedSprints = [...selectedProject.sprints];
      if (story.sprint) {
        updatedSprints = updatedSprints.map(sprint => {
          if (sprint.id === story.sprint) {
            return {
              ...sprint,
              totalPoints: Math.max(0, sprint.totalPoints - story.points),
              completedPoints: story.status === 'done' ? Math.max(0, sprint.completedPoints - story.points) : sprint.completedPoints
            };
          }
          return sprint;
        });
      }
      
      const updatedProject = {
        ...selectedProject,
        sprints: updatedSprints,
        stories: selectedProject.stories.filter(s => s.id !== storyId),
        updatedAt: new Date().toISOString()
      };
      
      updateProject(updatedProject);
    }
  };

  // Helper functions
  const updateProject = (updatedProject: AgileProject) => {
    const updatedProjects = projects.map(p => 
      p.id === updatedProject.id ? updatedProject : p
    );
    setProjects(updatedProjects);
    setSelectedProject(updatedProject);
  };

  const generateBurndownData = (startDate: string, endDate: string, totalPoints: number): SprintDay[] => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (!isValid(start) || !isValid(end)) {
      return [];
    }
    
    const burndownData: SprintDay[] = [];
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    for (let i = 0; i < totalDays; i++) {
      const currentDate = new Date(start);
      currentDate.setDate(start.getDate() + i);
      
      // Calculate ideal burndown - straight line from total to 0
      const idealBurndown = Math.max(0, totalPoints - ((totalPoints / (totalDays - 1)) * i));
      
      burndownData.push({
        date: currentDate.toISOString().split('T')[0],
        remainingPoints: Math.round(idealBurndown), // Initially set to ideal, will be updated with real data
        idealBurndown: Math.round(idealBurndown)
      });
    }
    
    return burndownData;
  };

  const calculateVelocityData = (): StoryPoint[] => {
    if (!selectedProject) return [];
    
    return selectedProject.sprints.map(sprint => ({
      sprint: sprint.name,
      planned: sprint.totalPoints,
      completed: sprint.completedPoints
    }));
  };

  const getSprintStoriesStats = (sprintId: string) => {
    if (!selectedProject) return { total: 0, todo: 0, inProgress: 0, done: 0, todoPoints: 0, inProgressPoints: 0, donePoints: 0 };
    
    const sprintStories = selectedProject.stories.filter(s => s.sprint === sprintId);
    
    return {
      total: sprintStories.length,
      todo: sprintStories.filter(s => s.status === 'todo').length,
      inProgress: sprintStories.filter(s => s.status === 'in-progress').length,
      done: sprintStories.filter(s => s.status === 'done').length,
      todoPoints: sprintStories.filter(s => s.status === 'todo').reduce((sum, s) => sum + s.points, 0),
      inProgressPoints: sprintStories.filter(s => s.status === 'in-progress').reduce((sum, s) => sum + s.points, 0),
      donePoints: sprintStories.filter(s => s.status === 'done').reduce((sum, s) => sum + s.points, 0),
    };
  };

  // Import/Export functions
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        let importedData: AgileProject[];
        
        if (file.name.endsWith('.json')) {
          importedData = JSON.parse(content) as AgileProject[];
        } else if (file.name.endsWith('.csv')) {
          // Simple CSV parser as an example
          alert('CSV import is supported but requires a specific format. For simplicity, please use JSON format for now.');
          return;
        } else {
          alert('Unsupported file format. Please use JSON or CSV.');
          return;
        }
        
        // Validate imported data structure
        if (!Array.isArray(importedData)) {
          importedData = [importedData]; // If it's a single project, wrap it in an array
        }
        
        // Basic validation
        const isValid = importedData.every(project => 
          project.id && project.name && Array.isArray(project.sprints) && Array.isArray(project.stories)
        );
        
        if (!isValid) {
          alert('Invalid data format. Please check the structure of your import file.');
          return;
        }
        
        setProjects(importedData);
        setSelectedProject(importedData[0] || null);
        setSelectedSprint(importedData[0]?.sprints[0]?.id || '');
        closeAllModals();
      } catch (error) {
        console.error('Error importing data:', error);
        alert('Error importing data. Please check the file format.');
      }
    };
    
    reader.readAsText(file);
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(projects, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'agile-dashboard-data.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const exportTemplateFile = () => {
    // Create a sample template with the correct structure
    const templateData = [
      {
        "id": "sample-project-id",
        "name": "Project Name",
        "description": "Project Description",
        "sprints": [
          {
            "id": "sample-sprint-id",
            "name": "Sprint 1",
            "startDate": "2023-01-01",
            "endDate": "2023-01-14",
            "totalPoints": 50,
            "completedPoints": 30,
            "status": "active",
            "burndownData": [
              {
                "date": "2023-01-01",
                "remainingPoints": 50,
                "idealBurndown": 50
              },
              {
                "date": "2023-01-02",
                "remainingPoints": 46,
                "idealBurndown": 46
              }
            ]
          }
        ],
        "members": [
          {
            "id": "member-1",
            "name": "Team Member 1",
            "role": "Developer",
            "image": null
          }
        ],
        "stories": [
          {
            "id": "story-1",
            "title": "Story Title",
            "description": "Story Description",
            "points": 5,
            "status": "todo",
            "sprint": "sample-sprint-id",
            "assignee": "member-1",
            "createdAt": "2023-01-01T00:00:00.000Z"
          }
        ],
        "createdAt": "2023-01-01T00:00:00.000Z",
        "updatedAt": "2023-01-01T00:00:00.000Z"
      }
    ];
    
    const dataStr = JSON.stringify(templateData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'agile-dashboard-template.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Rendering functions - UI components
  const renderProjectSelector = () => {
    return (
      <div className="flex-between p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Project</h2>
          <select 
            className="input mt-1"
            value={selectedProject?.id || ''}
            onChange={(e) => {
              const projectId = e.target.value;
              const project = projects.find(p => p.id === projectId) || null;
              setSelectedProject(project);
              if (project) {
                setSelectedSprint(project.sprints[0]?.id || '');
              }
            }}
          >
            {projects.map(project => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>
        </div>
        
        <div className="flex gap-2">
          <button 
            className="btn btn-secondary flex-center gap-2"
            onClick={() => {
              setIsCreateProjectModalOpen(true);
              document.body.classList.add('modal-open');
            }}
          >
            <Plus size={16} />
            <span>New Project</span>
          </button>
          
          {selectedProject && (
            <button 
              className="btn bg-red-500 hover:bg-red-600 text-white flex-center gap-2"
              onClick={() => handleDeleteProject(selectedProject.id)}
            >
              <Trash2 size={16} />
              <span>Delete</span>
            </button>
          )}
          
          <button 
            className="btn bg-emerald-500 hover:bg-emerald-600 text-white flex-center gap-2"
            onClick={handleExportData}
          >
            <Download size={16} />
            <span className="responsive-hide">Export</span>
          </button>
          
          <button 
            className="btn bg-indigo-500 hover:bg-indigo-600 text-white flex-center gap-2"
            onClick={() => {
              setIsImportModalOpen(true);
              document.body.classList.add('modal-open');
            }}
          >
            <Upload size={16} />
            <span className="responsive-hide">Import</span>
          </button>
        </div>
      </div>
    );
  };

  const renderNavigationTabs = () => {
    return (
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6 overflow-x-auto no-scrollbar">
        <button
          className={`px-4 py-2 font-medium text-sm ${activeTab === 'dashboard' 
            ? 'text-primary-600 border-b-2 border-primary-500' 
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        
        <button
          className={`px-4 py-2 font-medium text-sm ${activeTab === 'sprints' 
            ? 'text-primary-600 border-b-2 border-primary-500' 
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
          onClick={() => setActiveTab('sprints')}
        >
          Sprints
        </button>
        
        <button
          className={`px-4 py-2 font-medium text-sm ${activeTab === 'stories' 
            ? 'text-primary-600 border-b-2 border-primary-500' 
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
          onClick={() => setActiveTab('stories')}
        >
          Stories
        </button>
        
        <button
          className={`px-4 py-2 font-medium text-sm ${activeTab === 'team' 
            ? 'text-primary-600 border-b-2 border-primary-500' 
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
          onClick={() => setActiveTab('team')}
        >
          Team
        </button>
      </div>
    );
  };

  const renderDashboard = () => {
    if (!selectedProject) {
      return (
        <div className="flex-center flex-col p-10">
          <div className="text-lg text-gray-500 dark:text-gray-400 mb-4">No project selected</div>
          <button 
            className="btn btn-primary"
            onClick={() => {
              setIsCreateProjectModalOpen(true);
              document.body.classList.add('modal-open');
            }}
          >
            Create New Project
          </button>
        </div>
      );
    }
    
    // Get the active sprint for dashboard
    const activeSprint = selectedProject.sprints.find(s => 
      dashboardFilters.sprintId ? s.id === dashboardFilters.sprintId : s.status === 'active'
    ) || selectedProject.sprints[0];
    
    // If no sprints exist, show empty state
    if (selectedProject.sprints.length === 0) {
      return (
        <div className="flex-center flex-col p-10">
          <div className="text-lg text-gray-500 dark:text-gray-400 mb-4">No sprints available</div>
          <button 
            className="btn btn-primary"
            onClick={() => {
              setIsCreateSprintModalOpen(true);
              document.body.classList.add('modal-open');
            }}
          >
            Create New Sprint
          </button>
        </div>
      );
    }
    
    // Get stats for the selected/active sprint
    const sprintStats = activeSprint ? getSprintStoriesStats(activeSprint.id) : { total: 0, todo: 0, inProgress: 0, done: 0, todoPoints: 0, inProgressPoints: 0, donePoints: 0 };
    
    return (
      <div>
        {/* Dashboard Filters */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4 mb-6">
          <div className="flex-between mb-2">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Dashboard Filters</h3>
            <button
              className="text-sm text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              onClick={() => setDashboardFilters({
                sprintId: '',
                dateRange: 'all',
                statusFilter: ['todo', 'in-progress', 'done']
              })}
            >
              Reset Filters
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="form-label">Sprint</label>
              <select 
                className="input"
                value={dashboardFilters.sprintId}
                onChange={(e) => setDashboardFilters({...dashboardFilters, sprintId: e.target.value})}
              >
                <option value="">All Sprints</option>
                {selectedProject.sprints.map(sprint => (
                  <option key={sprint.id} value={sprint.id}>{sprint.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="form-label">Date Range</label>
              <select 
                className="input"
                value={dashboardFilters.dateRange}
                onChange={(e) => setDashboardFilters({...dashboardFilters, dateRange: e.target.value})}
              >
                <option value="all">All Time</option>
                <option value="last-7">Last 7 Days</option>
                <option value="last-30">Last 30 Days</option>
                <option value="last-90">Last 90 Days</option>
              </select>
            </div>
            
            <div>
              <label className="form-label">Status</label>
              <div className="flex gap-2 mt-1">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    checked={dashboardFilters.statusFilter.includes('todo')}
                    onChange={(e) => {
                      const newFilters = e.target.checked
                        ? [...dashboardFilters.statusFilter, 'todo']
                        : dashboardFilters.statusFilter.filter(s => s !== 'todo');
                      setDashboardFilters({...dashboardFilters, statusFilter: newFilters});
                    }}
                  />
                  <span className="text-gray-700 dark:text-gray-300">To Do</span>
                </label>
                
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    checked={dashboardFilters.statusFilter.includes('in-progress')}
                    onChange={(e) => {
                      const newFilters = e.target.checked
                        ? [...dashboardFilters.statusFilter, 'in-progress']
                        : dashboardFilters.statusFilter.filter(s => s !== 'in-progress');
                      setDashboardFilters({...dashboardFilters, statusFilter: newFilters});
                    }}
                  />
                  <span className="text-gray-700 dark:text-gray-300">In Progress</span>
                </label>
                
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    checked={dashboardFilters.statusFilter.includes('done')}
                    onChange={(e) => {
                      const newFilters = e.target.checked
                        ? [...dashboardFilters.statusFilter, 'done']
                        : dashboardFilters.statusFilter.filter(s => s !== 'done');
                      setDashboardFilters({...dashboardFilters, statusFilter: newFilters});
                    }}
                  />
                  <span className="text-gray-700 dark:text-gray-300">Done</span>
                </label>
              </div>
            </div>
          </div>
        </div>
        
        {/* Sprint Overview */}
        {activeSprint && (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4 mb-6">
            <div className="flex-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Sprint Overview: {activeSprint.name}
              </h3>
              <div className="badge badge-primary bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                {activeSprint.status.charAt(0).toUpperCase() + activeSprint.status.slice(1)}
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="stat-card">
                <div className="stat-title">Start Date</div>
                <div className="stat-value text-xl">
                  {isValid(parseISO(activeSprint.startDate)) 
                    ? format(parseISO(activeSprint.startDate), 'MMM d, yyyy')
                    : 'Invalid Date'}
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-title">End Date</div>
                <div className="stat-value text-xl">
                  {isValid(parseISO(activeSprint.endDate)) 
                    ? format(parseISO(activeSprint.endDate), 'MMM d, yyyy')
                    : 'Invalid Date'}
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-title">Total Points</div>
                <div className="stat-value text-xl">{activeSprint.totalPoints}</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-title">Completed Points</div>
                <div className="stat-value text-xl">
                  {activeSprint.completedPoints} / {activeSprint.totalPoints}
                  <span className="text-sm ml-2 text-gray-500 dark:text-gray-400">
                    ({Math.round((activeSprint.completedPoints / Math.max(1, activeSprint.totalPoints)) * 100)}%)
                  </span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="stat-card">
                <div className="stat-title">To Do</div>
                <div className="flex-between">
                  <div className="stat-value text-xl">{sprintStats.todo}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {sprintStats.todoPoints} points
                  </div>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-title">In Progress</div>
                <div className="flex-between">
                  <div className="stat-value text-xl">{sprintStats.inProgress}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {sprintStats.inProgressPoints} points
                  </div>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-title">Done</div>
                <div className="flex-between">
                  <div className="stat-value text-xl">{sprintStats.done}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {sprintStats.donePoints} points
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Burndown Chart */}
        {activeSprint && (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Burndown Chart</h3>
            
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={activeSprint.burndownData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#888" opacity={0.2} />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => {
                      if (!date) return '';
                      try {
                        return format(new Date(date), 'M/d');
                      } catch (e) {
                        return date;
                      }
                    }}
                  />
                  <YAxis label={{ value: 'Points', angle: -90, position: 'insideLeft' }} />
                  <Tooltip 
                    labelFormatter={(date) => {
                      if (!date) return '';
                      try {
                        return format(new Date(date), 'MMMM d, yyyy');
                      } catch (e) {
                        return date;
                      }
                    }}
                    formatter={(value) => [`${value} points`, undefined]}
                  />
                  <Legend />
                  
                  <Area 
                    type="monotone" 
                    dataKey="remainingPoints" 
                    name="Remaining Points" 
                    stroke="#8884d8" 
                    fill="#8884d8" 
                    fillOpacity={0.2}
                  />
                  
                  <Line 
                    type="monotone" 
                    dataKey="idealBurndown" 
                    name="Ideal Burndown" 
                    stroke="#82ca9d"
                    strokeWidth={2}
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        
        {/* Velocity Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Velocity Chart</h3>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={calculateVelocityData()}
                margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#888" opacity={0.2} />
                <XAxis 
                  dataKey="sprint" 
                  angle={-45} 
                  textAnchor="end" 
                  interval={0}
                  height={70} 
                />
                <YAxis label={{ value: 'Points', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value) => [`${value} points`, undefined]} />
                <Legend />
                <ReferenceLine y={0} stroke="#000" />
                <Bar dataKey="planned" name="Planned Points" fill="#8884d8" />
                <Bar dataKey="completed" name="Completed Points" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  const renderSprints = () => {
    if (!selectedProject) {
      return (
        <div className="flex-center flex-col p-10">
          <div className="text-lg text-gray-500 dark:text-gray-400 mb-4">No project selected</div>
          <button 
            className="btn btn-primary"
            onClick={() => {
              setIsCreateProjectModalOpen(true);
              document.body.classList.add('modal-open');
            }}
          >
            Create New Project
          </button>
        </div>
      );
    }
    
    return (
      <div>
        <div className="flex-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Sprints</h2>
          <button 
            className="btn btn-primary flex-center gap-2"
            onClick={() => {
              setIsCreateSprintModalOpen(true);
              document.body.classList.add('modal-open');
            }}
          >
            <Plus size={16} />
            <span>New Sprint</span>
          </button>
        </div>
        
        {selectedProject.sprints.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-8 text-center">
            <div className="text-lg text-gray-500 dark:text-gray-400 mb-4">No sprints available</div>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Create your first sprint to start tracking your agile project.
            </p>
            <button 
              className="btn btn-primary"
              onClick={() => {
                setIsCreateSprintModalOpen(true);
                document.body.classList.add('modal-open');
              }}
            >
              Create New Sprint
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {selectedProject.sprints.map(sprint => {
              const sprintStats = getSprintStoriesStats(sprint.id);
              const progress = sprint.totalPoints > 0 
                ? Math.round((sprint.completedPoints / sprint.totalPoints) * 100) 
                : 0;
              
              return (
                <div 
                  key={sprint.id} 
                  className={`bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4 border-l-4 
                    ${sprint.status === 'active' ? 'border-green-500' : 
                      sprint.status === 'completed' ? 'border-blue-500' : 'border-gray-500'}`}
                >
                  <div className="md:flex-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{sprint.name}</h3>
                        <div className={`badge ${sprint.status === 'active' ? 'badge-success' : 
                          sprint.status === 'completed' ? 'badge-info' : 'badge-warning'}`}>
                          {sprint.status.charAt(0).toUpperCase() + sprint.status.slice(1)}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          <span>
                            {isValid(parseISO(sprint.startDate)) 
                              ? format(parseISO(sprint.startDate), 'MMM d, yyyy')
                              : 'Invalid Date'}
                            {' - '}
                            {isValid(parseISO(sprint.endDate)) 
                              ? format(parseISO(sprint.endDate), 'MMM d, yyyy')
                              : 'Invalid Date'}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <CheckCircle size={14} />
                          <span>{sprint.completedPoints} / {sprint.totalPoints} points</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <FileText size={14} />
                          <span>{sprintStats.total} stories</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-4 md:mt-0">
                      <button 
                        className="btn btn-sm bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200"
                        onClick={() => setSelectedSprint(sprint.id)}
                      >
                        View Details
                      </button>
                      
                      <button 
                        className="btn btn-sm bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900 dark:hover:bg-red-800 dark:text-red-200"
                        onClick={() => handleDeleteSprint(sprint.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex-between mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    <div className="text-center p-2 bg-red-50 rounded-md dark:bg-red-900/30">
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">To Do</div>
                      <div className="text-lg font-semibold text-red-600 dark:text-red-400">
                        {sprintStats.todo}
                      </div>
                    </div>
                    
                    <div className="text-center p-2 bg-yellow-50 rounded-md dark:bg-yellow-900/30">
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">In Progress</div>
                      <div className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">
                        {sprintStats.inProgress}
                      </div>
                    </div>
                    
                    <div className="text-center p-2 bg-green-50 rounded-md dark:bg-green-900/30">
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Done</div>
                      <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                        {sprintStats.done}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderStories = () => {
    if (!selectedProject) {
      return (
        <div className="flex-center flex-col p-10">
          <div className="text-lg text-gray-500 dark:text-gray-400 mb-4">No project selected</div>
          <button 
            className="btn btn-primary"
            onClick={() => {
              setIsCreateProjectModalOpen(true);
              document.body.classList.add('modal-open');
            }}
          >
            Create New Project
          </button>
        </div>
      );
    }
    
    // Filter stories by selected sprint if needed
    const filteredStories = selectedSprint
      ? selectedProject.stories.filter(story => story.sprint === selectedSprint)
      : selectedProject.stories;
    
    // Group stories by status
    const storiesByStatus = {
      todo: filteredStories.filter(story => story.status === 'todo'),
      inProgress: filteredStories.filter(story => story.status === 'in-progress'),
      done: filteredStories.filter(story => story.status === 'done')
    };
    
    return (
      <div>
        <div className="flex-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Stories</h2>
          <button 
            className="btn btn-primary flex-center gap-2"
            onClick={() => {
              setIsCreateStoryModalOpen(true);
              document.body.classList.add('modal-open');
            }}
          >
            <Plus size={16} />
            <span>New Story</span>
          </button>
        </div>
        
        <div className="mb-6">
          <label className="form-label">Filter by Sprint</label>
          <select 
            className="input"
            value={selectedSprint}
            onChange={(e) => setSelectedSprint(e.target.value)}
          >
            <option value="">All Sprints</option>
            {selectedProject.sprints.map(sprint => (
              <option key={sprint.id} value={sprint.id}>{sprint.name}</option>
            ))}
          </select>
        </div>
        
        {filteredStories.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-8 text-center">
            <div className="text-lg text-gray-500 dark:text-gray-400 mb-4">No stories available</div>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Create your first story to start tracking your tasks.
            </p>
            <button 
              className="btn btn-primary"
              onClick={() => {
                setIsCreateStoryModalOpen(true);
                document.body.classList.add('modal-open');
              }}
            >
              Create New Story
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* To Do Column */}
            <div className="bg-red-50 dark:bg-slate-800 rounded-lg p-4">
              <div className="flex-between mb-4">
                <h3 className="font-semibold text-gray-800 dark:text-white flex items-center">
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                  To Do
                  <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                    ({storiesByStatus.todo.length})
                  </span>
                </h3>
              </div>
              
              <div className="space-y-3">
                {storiesByStatus.todo.map(story => (
                  <div 
                    key={story.id} 
                    className="bg-white dark:bg-slate-700 rounded-lg shadow-sm p-3"
                  >
                    <div className="flex-between mb-2">
                      <h4 className="font-medium text-gray-800 dark:text-white">{story.title}</h4>
                      <div className="flex items-center">
                        <span className="badge badge-primary bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mr-2">
                          {story.points} pts
                        </span>
                        <div className="dropdown relative">
                          <button className="text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-white">
                            <div className="w-1 h-1 bg-gray-400 dark:bg-gray-300 rounded-full mb-1"></div>
                            <div className="w-1 h-1 bg-gray-400 dark:bg-gray-300 rounded-full mb-1"></div>
                            <div className="w-1 h-1 bg-gray-400 dark:bg-gray-300 rounded-full"></div>
                          </button>
                          {/* Dropdown content would go here - functionality not fully implemented */}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
                      {story.description}
                    </p>
                    
                    <div className="flex-between">
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {story.assignee && (
                          <div className="flex items-center gap-1">
                            <User size={12} />
                            <span>
                              {selectedProject.members.find(m => m.id === story.assignee)?.name || 'Unassigned'}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-1">
                        <button 
                          className="p-1 text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300"
                          onClick={() => handleUpdateStoryStatus(story.id, 'in-progress')}
                          aria-label="Move to In Progress"
                        >
                          <ArrowRight size={14} />
                        </button>
                        
                        <button 
                          className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          onClick={() => handleDeleteStory(story.id)}
                          aria-label="Delete Story"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {storiesByStatus.todo.length === 0 && (
                  <div className="text-center p-4 text-sm text-gray-500 dark:text-gray-400">
                    No stories in this column
                  </div>
                )}
              </div>
            </div>
            
            {/* In Progress Column */}
            <div className="bg-yellow-50 dark:bg-slate-800 rounded-lg p-4">
              <div className="flex-between mb-4">
                <h3 className="font-semibold text-gray-800 dark:text-white flex items-center">
                  <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                  In Progress
                  <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                    ({storiesByStatus.inProgress.length})
                  </span>
                </h3>
              </div>
              
              <div className="space-y-3">
                {storiesByStatus.inProgress.map(story => (
                  <div 
                    key={story.id} 
                    className="bg-white dark:bg-slate-700 rounded-lg shadow-sm p-3"
                  >
                    <div className="flex-between mb-2">
                      <h4 className="font-medium text-gray-800 dark:text-white">{story.title}</h4>
                      <div className="flex items-center">
                        <span className="badge badge-primary bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mr-2">
                          {story.points} pts
                        </span>
                        <div className="dropdown relative">
                          <button className="text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-white">
                            <div className="w-1 h-1 bg-gray-400 dark:bg-gray-300 rounded-full mb-1"></div>
                            <div className="w-1 h-1 bg-gray-400 dark:bg-gray-300 rounded-full mb-1"></div>
                            <div className="w-1 h-1 bg-gray-400 dark:bg-gray-300 rounded-full"></div>
                          </button>
                          {/* Dropdown content would go here */}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
                      {story.description}
                    </p>
                    
                    <div className="flex-between">
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {story.assignee && (
                          <div className="flex items-center gap-1">
                            <User size={12} />
                            <span>
                              {selectedProject.members.find(m => m.id === story.assignee)?.name || 'Unassigned'}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-1">
                        <button 
                          className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          onClick={() => handleUpdateStoryStatus(story.id, 'todo')}
                          aria-label="Move to To Do"
                        >
                          <ArrowLeft size={14} />
                        </button>
                        
                        <button 
                          className="p-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                          onClick={() => handleUpdateStoryStatus(story.id, 'done')}
                          aria-label="Move to Done"
                        >
                          <ArrowRight size={14} />
                        </button>
                        
                        <button 
                          className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          onClick={() => handleDeleteStory(story.id)}
                          aria-label="Delete Story"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {storiesByStatus.inProgress.length === 0 && (
                  <div className="text-center p-4 text-sm text-gray-500 dark:text-gray-400">
                    No stories in this column
                  </div>
                )}
              </div>
            </div>
            
            {/* Done Column */}
            <div className="bg-green-50 dark:bg-slate-800 rounded-lg p-4">
              <div className="flex-between mb-4">
                <h3 className="font-semibold text-gray-800 dark:text-white flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                  Done
                  <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                    ({storiesByStatus.done.length})
                  </span>
                </h3>
              </div>
              
              <div className="space-y-3">
                {storiesByStatus.done.map(story => (
                  <div 
                    key={story.id} 
                    className="bg-white dark:bg-slate-700 rounded-lg shadow-sm p-3"
                  >
                    <div className="flex-between mb-2">
                      <h4 className="font-medium text-gray-800 dark:text-white">{story.title}</h4>
                      <div className="flex items-center">
                        <span className="badge badge-primary bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mr-2">
                          {story.points} pts
                        </span>
                        <div className="dropdown relative">
                          <button className="text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-white">
                            <div className="w-1 h-1 bg-gray-400 dark:bg-gray-300 rounded-full mb-1"></div>
                            <div className="w-1 h-1 bg-gray-400 dark:bg-gray-300 rounded-full mb-1"></div>
                            <div className="w-1 h-1 bg-gray-400 dark:bg-gray-300 rounded-full"></div>
                          </button>
                          {/* Dropdown content would go here */}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
                      {story.description}
                    </p>
                    
                    <div className="flex-between">
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {story.assignee && (
                          <div className="flex items-center gap-1">
                            <User size={12} />
                            <span>
                              {selectedProject.members.find(m => m.id === story.assignee)?.name || 'Unassigned'}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-1">
                        <button 
                          className="p-1 text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300"
                          onClick={() => handleUpdateStoryStatus(story.id, 'in-progress')}
                          aria-label="Move to In Progress"
                        >
                          <ArrowLeft size={14} />
                        </button>
                        
                        <button 
                          className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          onClick={() => handleDeleteStory(story.id)}
                          aria-label="Delete Story"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {storiesByStatus.done.length === 0 && (
                  <div className="text-center p-4 text-sm text-gray-500 dark:text-gray-400">
                    No stories in this column
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderTeam = () => {
    if (!selectedProject) {
      return (
        <div className="flex-center flex-col p-10">
          <div className="text-lg text-gray-500 dark:text-gray-400 mb-4">No project selected</div>
          <button 
            className="btn btn-primary"
            onClick={() => {
              setIsCreateProjectModalOpen(true);
              document.body.classList.add('modal-open');
            }}
          >
            Create New Project
          </button>
        </div>
      );
    }
    
    // This would be enhanced with user management features in a future version
    return (
      <div>
        <div className="flex-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Team Members</h2>
          <div className="badge badge-info">
            Read-Only View
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4 mb-6">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            <AlertCircle className="inline-block mr-2" size={16} />
            Team management is read-only in this view. User management is handled at the platform level.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {selectedProject.members.map(member => (
            <div 
              key={member.id} 
              className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4 flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex-center overflow-hidden">
                {member.image ? (
                  <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                ) : (
                  <User size={24} className="text-gray-400 dark:text-gray-500" />
                )}
              </div>
              
              <div>
                <h3 className="font-medium text-gray-800 dark:text-white">{member.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Modal Components
  const renderImportModal = () => {
    if (!isImportModalOpen) return null;
    
    return (
      <div 
        className="modal-backdrop"
        onClick={closeAllModals}
        role="dialog"
        aria-modal="true"
        aria-labelledby="import-modal-title"
      >
        <div 
          className="modal-content"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <h3 id="import-modal-title" className="text-lg font-medium text-gray-900 dark:text-white">Import Data</h3>
            <button 
              className="text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200"
              onClick={closeAllModals}
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Upload your JSON or CSV file to import project data. Make sure your file matches the expected format.
            </p>
            
            <div className="flex-center flex-col p-6 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="text-gray-400 dark:text-gray-500 mb-2" size={24} />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Click to upload</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">JSON or CSV files only</p>
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept=".json,.csv"
                onChange={handleImportData}
              />
            </div>
            
            <div className="mt-4">
              <button 
                className="btn bg-blue-500 hover:bg-blue-600 text-white w-full"
                onClick={exportTemplateFile}
              >
                Download Template File
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCreateProjectModal = () => {
    if (!isCreateProjectModalOpen) return null;
    
    return (
      <div 
        className="modal-backdrop"
        onClick={closeAllModals}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-project-modal-title"
      >
        <div 
          className="modal-content"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <h3 id="create-project-modal-title" className="text-lg font-medium text-gray-900 dark:text-white">Create New Project</h3>
            <button 
              className="text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200"
              onClick={closeAllModals}
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit(handleCreateProject)}>
            <div className="p-4">
              <div className="form-group">
                <label className="form-label" htmlFor="project-name">Project Name</label>
                <input 
                  id="project-name"
                  type="text" 
                  className="input"
                  placeholder="Enter project name"
                  {...register('name', { required: 'Project name is required' })}
                />
                {errors.name && (
                  <p className="form-error">{errors.name.message as string}</p>
                )}
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="project-description">Description</label>
                <textarea 
                  id="project-description"
                  className="input" 
                  rows={3}
                  placeholder="Enter project description"
                  {...register('description')}
                ></textarea>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                onClick={closeAllModals}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
              >
                Create Project
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderCreateSprintModal = () => {
    if (!isCreateSprintModalOpen) return null;
    
    return (
      <div 
        className="modal-backdrop"
        onClick={closeAllModals}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-sprint-modal-title"
      >
        <div 
          className="modal-content"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <h3 id="create-sprint-modal-title" className="text-lg font-medium text-gray-900 dark:text-white">Create New Sprint</h3>
            <button 
              className="text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200"
              onClick={closeAllModals}
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit(handleCreateSprint)}>
            <div className="p-4">
              <div className="form-group">
                <label className="form-label" htmlFor="sprint-name">Sprint Name</label>
                <input 
                  id="sprint-name"
                  type="text" 
                  className="input"
                  placeholder="Enter sprint name"
                  {...register('name', { required: 'Sprint name is required' })}
                />
                {errors.name && (
                  <p className="form-error">{errors.name.message as string}</p>
                )}
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="sprint-start-date">Start Date</label>
                <input 
                  id="sprint-start-date"
                  type="date" 
                  className="input"
                  {...register('startDate', { required: 'Start date is required' })}
                />
                {errors.startDate && (
                  <p className="form-error">{errors.startDate.message as string}</p>
                )}
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="sprint-end-date">End Date</label>
                <input 
                  id="sprint-end-date"
                  type="date" 
                  className="input"
                  {...register('endDate', { required: 'End date is required' })}
                />
                {errors.endDate && (
                  <p className="form-error">{errors.endDate.message as string}</p>
                )}
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="sprint-total-points">Total Points</label>
                <input 
                  id="sprint-total-points"
                  type="number" 
                  className="input"
                  min="0"
                  placeholder="Enter total story points"
                  {...register('totalPoints')}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="sprint-status">Status</label>
                <select 
                  id="sprint-status"
                  className="input"
                  {...register('status', { required: 'Status is required' })}
                >
                  <option value="planned">Planned</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
                {errors.status && (
                  <p className="form-error">{errors.status.message as string}</p>
                )}
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                onClick={closeAllModals}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
              >
                Create Sprint
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderCreateStoryModal = () => {
    if (!isCreateStoryModalOpen) return null;
    
    return (
      <div 
        className="modal-backdrop"
        onClick={closeAllModals}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-story-modal-title"
      >
        <div 
          className="modal-content"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <h3 id="create-story-modal-title" className="text-lg font-medium text-gray-900 dark:text-white">Create New Story</h3>
            <button 
              className="text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200"
              onClick={closeAllModals}
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit(handleCreateStory)}>
            <div className="p-4">
              <div className="form-group">
                <label className="form-label" htmlFor="story-title">Title</label>
                <input 
                  id="story-title"
                  type="text" 
                  className="input"
                  placeholder="Enter story title"
                  {...register('title', { required: 'Title is required' })}
                />
                {errors.title && (
                  <p className="form-error">{errors.title.message as string}</p>
                )}
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="story-description">Description</label>
                <textarea 
                  id="story-description"
                  className="input" 
                  rows={3}
                  placeholder="Enter story description"
                  {...register('description')}
                ></textarea>
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="story-points">Story Points</label>
                <select 
                  id="story-points"
                  className="input"
                  {...register('points')}
                >
                  <option value="1">1 - Very Small</option>
                  <option value="2">2 - Small</option>
                  <option value="3">3 - Medium Small</option>
                  <option value="5">5 - Medium</option>
                  <option value="8">8 - Medium Large</option>
                  <option value="13">13 - Large</option>
                  <option value="21">21 - Very Large</option>
                  <option value="34">34 - Extra Large</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="story-status">Status</label>
                <select 
                  id="story-status"
                  className="input"
                  {...register('status', { required: 'Status is required' })}
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
                {errors.status && (
                  <p className="form-error">{errors.status.message as string}</p>
                )}
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="story-sprint">Sprint</label>
                <select 
                  id="story-sprint"
                  className="input"
                  {...register('sprint')}
                >
                  <option value="">None</option>
                  {selectedProject?.sprints.map(sprint => (
                    <option key={sprint.id} value={sprint.id}>{sprint.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="story-assignee">Assignee</label>
                <select 
                  id="story-assignee"
                  className="input"
                  {...register('assignee')}
                >
                  <option value="">Unassigned</option>
                  {selectedProject?.members.map(member => (
                    <option key={member.id} value={member.id}>{member.name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                onClick={closeAllModals}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
              >
                Create Story
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Main application layout
  return (
    <div className="bg-gray-50 dark:bg-slate-900 min-h-screen">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm">
        <div className="container-fluid">
          <div className="flex-between py-4">
            <div className="flex items-center gap-2">
              <button 
                className="md:hidden text-gray-500 dark:text-gray-400"
                onClick={() => setShowSideMenu(!showSideMenu)}
              >
                <Menu size={24} />
              </button>
              
              <div className="flex items-center gap-2">
                <div className="bg-primary-500 text-white p-2 rounded-md">
                  <Trello size={20} />
                </div>
                <h1 className="text-xl font-bold text-gray-800 dark:text-white">Agile Dashboard</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button 
                className="theme-toggle"
                onClick={() => setIsDarkMode(!isDarkMode)}
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                <span className="theme-toggle-thumb"></span>
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container-fluid py-6">
        {renderProjectSelector()}
        {renderNavigationTabs()}
        
        {/* Main Content */}
        <div className="theme-transition">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'sprints' && renderSprints()}
          {activeTab === 'stories' && renderStories()}
          {activeTab === 'team' && renderTeam()}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-gray-700 py-4 mt-auto">
        <div className="container-fluid text-center text-sm text-gray-500 dark:text-gray-400">
          Copyright © 2025 of Datavtar Private Limited. All rights reserved.
        </div>
      </footer>
      
      {/* Modals */}
      {renderImportModal()}
      {renderCreateProjectModal()}
      {renderCreateSprintModal()}
      {renderCreateStoryModal()}
    </div>
  );
};

export default App;