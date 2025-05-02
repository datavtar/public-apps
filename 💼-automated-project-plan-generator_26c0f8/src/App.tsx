import React, { useState, useEffect, useRef } from 'react';
import styles from './styles/styles.module.css';
import {
  Users,
  Calendar,
  DollarSign,
  FileText,
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  Download,
  Upload,
  ChevronDown,
  Search,
  Monitor,
  Database,
  Code,
  Server,
  Cloud,
  PieChart as LucidePieChart,
  Moon,
  Sun
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

// Define TypeScript interfaces
interface Requirement {
  id: string;
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  category: 'Functional' | 'Technical' | 'Infrastructure' | 'Security' | 'Other';
  estimatedHours: number;
}

interface Resource {
  id: string;
  name: string;
  role: string;
  ratePerHour: number;
  availability: number; // hours per week
  skills: string[];
}

interface ProjectPlan {
  id: string;
  title: string;
  clientName: string;
  createdAt: string;
  lastModified: string;
  requirements: Requirement[];
  resources: Resource[];
  tasks: Task[];
  budget: number;
  duration: number; // in days
  status: 'Draft' | 'Ready' | 'Approved' | 'Archived';
  notes: string;
}

interface Task {
  id: string;
  requirementId: string;
  title: string;
  description: string;
  assignedResourceIds: string[];
  estimatedHours: number;
  status: 'Not Started' | 'In Progress' | 'Completed';
  dependencies: string[]; // IDs of tasks that this task depends on
}

interface ResourceAllocation {
  resourceId: string;
  totalHours: number;
  tasks: string[];
}

interface ChartData {
  name: string;
  value: number;
}

// Template project plan
const templateProjectPlan: ProjectPlan = {
  id: '',
  title: 'New Project Plan',
  clientName: '',
  createdAt: new Date().toISOString(),
  lastModified: new Date().toISOString(),
  requirements: [],
  resources: [],
  tasks: [],
  budget: 0,
  duration: 0,
  status: 'Draft',
  notes: ''
};

// Sample data for demonstration
const sampleRequirements: Requirement[] = [
  {
    id: 'req-001',
    title: 'User Authentication',
    description: 'Implement secure user authentication with multi-factor authentication',
    priority: 'High',
    category: 'Security',
    estimatedHours: 24
  },
  {
    id: 'req-002',
    title: 'Database Schema Design',
    description: 'Design normalized database schema with proper indexes and constraints',
    priority: 'High',
    category: 'Technical',
    estimatedHours: 16
  },
  {
    id: 'req-003',
    title: 'Reporting Dashboard',
    description: 'Create interactive dashboard with key performance indicators',
    priority: 'Medium',
    category: 'Functional',
    estimatedHours: 40
  },
  {
    id: 'req-004',
    title: 'Cloud Infrastructure Setup',
    description: 'Set up scalable cloud infrastructure with auto-scaling capabilities',
    priority: 'High',
    category: 'Infrastructure',
    estimatedHours: 32
  }
];

const sampleResources: Resource[] = [
  {
    id: 'res-001',
    name: 'John Smith',
    role: 'Senior Developer',
    ratePerHour: 75,
    availability: 40,
    skills: ['JavaScript', 'React', 'Node.js', 'AWS']
  },
  {
    id: 'res-002',
    name: 'Sarah Johnson',
    role: 'Database Architect',
    ratePerHour: 85,
    availability: 30,
    skills: ['SQL', 'MongoDB', 'Database Design', 'Performance Tuning']
  },
  {
    id: 'res-003',
    name: 'Michael Chen',
    role: 'Security Specialist',
    ratePerHour: 90,
    availability: 20,
    skills: ['Security Protocols', 'Encryption', 'Authentication', 'Compliance']
  },
  {
    id: 'res-004',
    name: 'Amanda Rodriguez',
    role: 'UI/UX Designer',
    ratePerHour: 70,
    availability: 35,
    skills: ['UI Design', 'UX Research', 'Wireframing', 'Prototyping']
  }
];

const sampleTasks: Task[] = [
  {
    id: 'task-001',
    requirementId: 'req-001',
    title: 'Design Authentication Flow',
    description: 'Create technical design for authentication system',
    assignedResourceIds: ['res-001', 'res-003'],
    estimatedHours: 8,
    status: 'Not Started',
    dependencies: []
  },
  {
    id: 'task-002',
    requirementId: 'req-001',
    title: 'Implement Authentication Backend',
    description: 'Develop server-side authentication components',
    assignedResourceIds: ['res-001'],
    estimatedHours: 16,
    status: 'Not Started',
    dependencies: ['task-001']
  },
  {
    id: 'task-003',
    requirementId: 'req-002',
    title: 'Database Schema Planning',
    description: 'Plan and document database schema',
    assignedResourceIds: ['res-002'],
    estimatedHours: 8,
    status: 'Not Started',
    dependencies: []
  },
  {
    id: 'task-004',
    requirementId: 'req-002',
    title: 'Database Implementation',
    description: 'Implement planned database schema',
    assignedResourceIds: ['res-002'],
    estimatedHours: 8,
    status: 'Not Started',
    dependencies: ['task-003']
  },
  {
    id: 'task-005',
    requirementId: 'req-003',
    title: 'Dashboard UI Design',
    description: 'Create designs for reporting dashboard',
    assignedResourceIds: ['res-004'],
    estimatedHours: 12,
    status: 'Not Started',
    dependencies: []
  },
  {
    id: 'task-006',
    requirementId: 'req-003',
    title: 'Dashboard Implementation',
    description: 'Implement reporting dashboard frontend and backend',
    assignedResourceIds: ['res-001', 'res-004'],
    estimatedHours: 28,
    status: 'Not Started',
    dependencies: ['task-005', 'task-004']
  },
  {
    id: 'task-007',
    requirementId: 'req-004',
    title: 'Cloud Architecture Design',
    description: 'Design cloud infrastructure architecture',
    assignedResourceIds: ['res-001'],
    estimatedHours: 10,
    status: 'Not Started',
    dependencies: []
  },
  {
    id: 'task-008',
    requirementId: 'req-004',
    title: 'Infrastructure Implementation',
    description: 'Implement cloud infrastructure',
    assignedResourceIds: ['res-001'],
    estimatedHours: 22,
    status: 'Not Started',
    dependencies: ['task-007']
  }
];

const sampleProjectPlan: ProjectPlan = {
  id: 'plan-001',
  title: 'E-Commerce Platform Modernization',
  clientName: 'Global Retail Inc.',
  createdAt: '2024-01-15T12:00:00Z',
  lastModified: '2024-01-20T15:30:00Z',
  requirements: sampleRequirements,
  resources: sampleResources,
  tasks: sampleTasks,
  budget: 120000,
  duration: 45,
  status: 'Ready',
  notes: 'This project plan covers the modernization of the client\'s legacy e-commerce platform. Key focus areas include improved security, better database performance, enhanced reporting capabilities, and migration to cloud infrastructure.'
};

const App: React.FC = () => {
  // State variables
  const [projectPlans, setProjectPlans] = useState<ProjectPlan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<ProjectPlan | null>(null);
  const [requirementText, setRequirementText] = useState<string>('');
  const [isCreatingPlan, setIsCreatingPlan] = useState<boolean>(false);
  const [isEditingPlan, setIsEditingPlan] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [showResourceModal, setShowResourceModal] = useState<boolean>(false);
  const [showRequirementModal, setShowRequirementModal] = useState<boolean>(false);
  const [showTaskModal, setShowTaskModal] = useState<boolean>(false);
  const [currentResource, setCurrentResource] = useState<Resource | null>(null);
  const [currentRequirement, setCurrentRequirement] = useState<Requirement | null>(null);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isGeneratingPlan, setIsGeneratingPlan] = useState<boolean>(false);
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const resourceModalRef = useRef<HTMLDivElement>(null);
  const requirementModalRef = useRef<HTMLDivElement>(null);
  const taskModalRef = useRef<HTMLDivElement>(null);

  // Load saved project plans from localStorage on component mount
  useEffect(() => {
    const savedPlans = localStorage.getItem('projectPlans');
    if (savedPlans) {
      setProjectPlans(JSON.parse(savedPlans));
    } else {
      // Add sample data for demo purposes
      setProjectPlans([sampleProjectPlan]);
      localStorage.setItem('projectPlans', JSON.stringify([sampleProjectPlan]));
    }

    // Check dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode');
    const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedDarkMode === 'true' || (savedDarkMode === null && prefersDarkMode)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Handle escape key press for modals
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowResourceModal(false);
        setShowRequirementModal(false);
        setShowTaskModal(false);
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, []);

  // Save project plans to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('projectPlans', JSON.stringify(projectPlans));
  }, [projectPlans]);

  // Save dark mode preference
  useEffect(() => {
    localStorage.setItem('darkMode', isDarkMode.toString());
    
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Filter plans based on search term
  const filteredPlans = projectPlans.filter(plan => 
    plan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.clientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper function to generate unique ID
  const generateId = (prefix: string): string => {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // Create a new project plan
  const createNewPlan = () => {
    const newPlan: ProjectPlan = {
      ...templateProjectPlan,
      id: generateId('plan'),
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };
    setCurrentPlan(newPlan);
    setIsCreatingPlan(true);
  };

  // Save the current plan
  const savePlan = () => {
    if (!currentPlan) return;

    const updatedPlan = {
      ...currentPlan,
      lastModified: new Date().toISOString()
    };

    if (isCreatingPlan) {
      setProjectPlans([...projectPlans, updatedPlan]);
      setIsCreatingPlan(false);
    } else {
      setProjectPlans(projectPlans.map(plan => 
        plan.id === updatedPlan.id ? updatedPlan : plan
      ));
      setIsEditingPlan(false);
    }

    setCurrentPlan(updatedPlan);
  };

  // Delete a plan
  const deletePlan = (id: string) => {
    if (window.confirm('Are you sure you want to delete this project plan?')) {
      setProjectPlans(projectPlans.filter(plan => plan.id !== id));
      if (currentPlan?.id === id) {
        setCurrentPlan(null);
      }
    }
  };

  // Edit an existing plan
  const editPlan = (plan: ProjectPlan) => {
    setCurrentPlan(plan);
    setIsEditingPlan(true);
  };

  // View a plan
  const viewPlan = (plan: ProjectPlan) => {
    setCurrentPlan(plan);
    setIsEditingPlan(false);
    setIsCreatingPlan(false);
  };

  // Cancel editing
  const cancelEditing = () => {
    if (isCreatingPlan) {
      setCurrentPlan(null);
      setIsCreatingPlan(false);
    } else if (isEditingPlan) {
      // Restore the original plan from the plans list
      const originalPlan = projectPlans.find(plan => plan.id === currentPlan?.id);
      if (originalPlan) {
        setCurrentPlan(originalPlan);
      }
      setIsEditingPlan(false);
    }
  };

  // Handle requirement text change
  const handleRequirementTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRequirementText(e.target.value);
  };

  // Generate a project plan from requirement text
  const generateProjectPlan = () => {
    if (!requirementText.trim()) {
      alert('Please enter requirement text to generate a plan.');
      return;
    }

    setIsGeneratingPlan(true);
    setGenerationProgress(0);

    // Simulate plan generation with progress updates
    const interval = setInterval(() => {
      setGenerationProgress(prev => {
        const newProgress = prev + 10;
        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            // Create a new plan based on "extracted" requirements
            const newPlan: ProjectPlan = {
              ...sampleProjectPlan,
              id: generateId('plan'),
              title: 'Generated Plan from Requirements',
              clientName: 'New Client',
              createdAt: new Date().toISOString(),
              lastModified: new Date().toISOString(),
              notes: `Generated from requirements:\n\n${requirementText.substring(0, 200)}...`
            };

            setProjectPlans([...projectPlans, newPlan]);
            setCurrentPlan(newPlan);
            setIsGeneratingPlan(false);
            setRequirementText('');
          }, 500);
        }
        return newProgress;
      });
    }, 300);
  };

  // Download project plan as JSON
  const downloadPlan = () => {
    if (!currentPlan) return;

    const planJson = JSON.stringify(currentPlan, null, 2);
    const blob = new Blob([planJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentPlan.title.replace(/\s+/g, '_')}_project_plan.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Download template
  const downloadTemplate = () => {
    const template = JSON.stringify(templateProjectPlan, null, 2);
    const blob = new Blob([template], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'project_plan_template.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const uploadedPlan = JSON.parse(event.target?.result as string) as ProjectPlan;
        // Validate plan structure (basic validation)
        if (uploadedPlan.id && uploadedPlan.title) {
          // Make sure the uploaded plan has a unique ID
          uploadedPlan.id = generateId('plan');
          uploadedPlan.lastModified = new Date().toISOString();
          setCurrentPlan(uploadedPlan);
          setIsCreatingPlan(true);
        } else {
          alert('Invalid project plan format');
        }
      } catch (error) {
        alert('Failed to parse the uploaded file');
        console.error('File upload error:', error);
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Resource management
  const openResourceModal = (resource?: Resource) => {
    if (resource) {
      setCurrentResource(resource);
    } else {
      setCurrentResource({
        id: generateId('res'),
        name: '',
        role: '',
        ratePerHour: 0,
        availability: 40, // Default to 40 hours per week
        skills: []
      });
    }
    setShowResourceModal(true);
  };

  const saveResource = () => {
    if (!currentPlan || !currentResource || !currentResource.name) return;

    const updatedResources = currentResource.id && currentPlan.resources.some(r => r.id === currentResource.id)
      ? currentPlan.resources.map(r => r.id === currentResource.id ? currentResource : r)
      : [...currentPlan.resources, currentResource];

    setCurrentPlan({
      ...currentPlan,
      resources: updatedResources,
      lastModified: new Date().toISOString()
    });

    setShowResourceModal(false);
    setCurrentResource(null);
  };

  const deleteResource = (resourceId: string) => {
    if (!currentPlan || !window.confirm('Are you sure you want to delete this resource?')) return;

    // Check if the resource is assigned to any tasks
    const assignedTasks = currentPlan.tasks.filter(task => task.assignedResourceIds.includes(resourceId));
    if (assignedTasks.length > 0) {
      alert(`This resource is assigned to ${assignedTasks.length} tasks. Please remove the assignments first.`);
      return;
    }

    setCurrentPlan({
      ...currentPlan,
      resources: currentPlan.resources.filter(r => r.id !== resourceId),
      lastModified: new Date().toISOString()
    });
  };

  // Requirement management
  const openRequirementModal = (requirement?: Requirement) => {
    if (requirement) {
      setCurrentRequirement(requirement);
    } else {
      setCurrentRequirement({
        id: generateId('req'),
        title: '',
        description: '',
        priority: 'Medium',
        category: 'Functional',
        estimatedHours: 0
      });
    }
    setShowRequirementModal(true);
  };

  const saveRequirement = () => {
    if (!currentPlan || !currentRequirement || !currentRequirement.title) return;

    const updatedRequirements = currentRequirement.id && currentPlan.requirements.some(r => r.id === currentRequirement.id)
      ? currentPlan.requirements.map(r => r.id === currentRequirement.id ? currentRequirement : r)
      : [...currentPlan.requirements, currentRequirement];

    setCurrentPlan({
      ...currentPlan,
      requirements: updatedRequirements,
      lastModified: new Date().toISOString()
    });

    setShowRequirementModal(false);
    setCurrentRequirement(null);
  };

  const deleteRequirement = (requirementId: string) => {
    if (!currentPlan || !window.confirm('Are you sure you want to delete this requirement?')) return;

    // Check if there are tasks associated with this requirement
    const associatedTasks = currentPlan.tasks.filter(task => task.requirementId === requirementId);
    if (associatedTasks.length > 0) {
      alert(`This requirement has ${associatedTasks.length} associated tasks. Please remove them first.`);
      return;
    }

    setCurrentPlan({
      ...currentPlan,
      requirements: currentPlan.requirements.filter(r => r.id !== requirementId),
      lastModified: new Date().toISOString()
    });
  };

  // Task management
  const openTaskModal = (task?: Task) => {
    if (task) {
      setCurrentTask(task);
    } else {
      if (currentPlan?.requirements.length === 0) {
        alert('Please add requirements before creating tasks.');
        return;
      }

      setCurrentTask({
        id: generateId('task'),
        requirementId: currentPlan?.requirements[0]?.id || '',
        title: '',
        description: '',
        assignedResourceIds: [],
        estimatedHours: 0,
        status: 'Not Started',
        dependencies: []
      });
    }
    setShowTaskModal(true);
  };

  const saveTask = () => {
    if (!currentPlan || !currentTask || !currentTask.title) return;

    const updatedTasks = currentTask.id && currentPlan.tasks.some(t => t.id === currentTask.id)
      ? currentPlan.tasks.map(t => t.id === currentTask.id ? currentTask : t)
      : [...currentPlan.tasks, currentTask];

    setCurrentPlan({
      ...currentPlan,
      tasks: updatedTasks,
      lastModified: new Date().toISOString()
    });

    setShowTaskModal(false);
    setCurrentTask(null);
  };

  const deleteTask = (taskId: string) => {
    if (!currentPlan || !window.confirm('Are you sure you want to delete this task?')) return;

    // Check if other tasks depend on this one
    const dependentTasks = currentPlan.tasks.filter(task => task.dependencies.includes(taskId));
    if (dependentTasks.length > 0) {
      alert(`Other tasks depend on this task. Please remove dependencies first.`);
      return;
    }

    setCurrentPlan({
      ...currentPlan,
      tasks: currentPlan.tasks.filter(t => t.id !== taskId),
      lastModified: new Date().toISOString()
    });
  };

  // Calculate resource allocation and budget
  const calculateResourceAllocation = (): ResourceAllocation[] => {
    if (!currentPlan) return [];

    const allocation: { [key: string]: ResourceAllocation } = {};

    currentPlan.tasks.forEach(task => {
      task.assignedResourceIds.forEach(resourceId => {
        if (!allocation[resourceId]) {
          allocation[resourceId] = {
            resourceId,
            totalHours: 0,
            tasks: []
          };
        }
        allocation[resourceId].totalHours += task.estimatedHours;
        allocation[resourceId].tasks.push(task.id);
      });
    });

    return Object.values(allocation);
  };

  const calculateTotalBudget = (): number => {
    if (!currentPlan) return 0;

    let totalBudget = 0;
    currentPlan.tasks.forEach(task => {
      task.assignedResourceIds.forEach(resourceId => {
        const resource = currentPlan.resources.find(r => r.id === resourceId);
        if (resource) {
          totalBudget += task.estimatedHours * resource.ratePerHour;
        }
      });
    });

    return totalBudget;
  };

  const calculateTotalDuration = (): number => {
    if (!currentPlan) return 0;

    const totalHours = currentPlan.tasks.reduce((total, task) => total + task.estimatedHours, 0);
    
    // Calculate the effective team hours per day
    const resourceHoursPerDay = currentPlan.resources.reduce((total, resource) => {
      return total + (resource.availability / 5); // Assuming 5 working days per week
    }, 0);

    // Avoid division by zero
    if (resourceHoursPerDay === 0) return 0;

    // Simple estimation - in reality would need to account for dependencies and parallel tasks
    return Math.ceil(totalHours / resourceHoursPerDay);
  };

  // Generate chart data for resource allocation
  const generateResourceAllocationChartData = (): ChartData[] => {
    if (!currentPlan || currentPlan.resources.length === 0) return [];

    const allocation = calculateResourceAllocation();
    
    return allocation.map(item => {
      const resource = currentPlan.resources.find(r => r.id === item.resourceId);
      return {
        name: resource?.name || 'Unknown',
        value: item.totalHours
      };
    });
  };

  // Generate chart data for requirement categories
  const generateCategoryChartData = (): ChartData[] => {
    if (!currentPlan || currentPlan.requirements.length === 0) return [];

    const categoryHours: Record<string, number> = {};
    
    currentPlan.requirements.forEach(req => {
      if (!categoryHours[req.category]) {
        categoryHours[req.category] = 0;
      }
      categoryHours[req.category] += req.estimatedHours;
    });

    return Object.entries(categoryHours).map(([category, hours]) => ({
      name: category,
      value: hours
    }));
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Get resource name by ID
  const getResourceName = (id: string): string => {
    return currentPlan?.resources.find(r => r.id === id)?.name || 'Unknown';
  };

  // Get requirement title by ID
  const getRequirementTitle = (id: string): string => {
    return currentPlan?.requirements.find(r => r.id === id)?.title || 'Unknown';
  };

  // Update current plan when editing fields
  const updatePlanField = (field: keyof ProjectPlan, value: any) => {
    if (!currentPlan) return;
    
    setCurrentPlan({
      ...currentPlan,
      [field]: value
    });
  };

  // COLORS FOR CHARTS
  const CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28EFF', '#FF6B6B', '#4CAF50', '#9C27B0'];

  // Render components based on current state
  const renderPlansList = () => (
    <div className="card">
      <div className="flex-between mb-4">
        <h2 className="text-xl font-semibold">Project Plans</h2>
        <div className="flex gap-2">
          <button 
            className="btn btn-sm btn-primary flex items-center gap-1"
            onClick={createNewPlan}
          >
            <Plus size={16} />
            <span>New Plan</span>
          </button>
          <button 
            className="btn btn-sm bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-1"
            onClick={downloadTemplate}
          >
            <Download size={16} />
            <span>Template</span>
          </button>
          <label className="btn btn-sm bg-green-500 hover:bg-green-600 text-white flex items-center gap-1 cursor-pointer">
            <Upload size={16} />
            <span>Import</span>
            <input 
              type="file" 
              accept=".json" 
              className="hidden" 
              onChange={handleFileUpload} 
            />
          </label>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            className="input pl-10"
            placeholder="Search plans..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
        </div>
      </div>

      <div className="space-y-2">
        {filteredPlans.map(plan => (
          <div key={plan.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <div className="flex-between">
              <div>
                <h3 className="font-medium text-lg">{plan.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Client: {plan.clientName}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`badge ${plan.status === 'Draft' ? 'badge-warning' : plan.status === 'Ready' ? 'badge-info' : plan.status === 'Approved' ? 'badge-success' : 'badge-error'}`}>
                    {plan.status}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Last updated: {formatDate(plan.lastModified)}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  className="btn btn-sm bg-blue-500 hover:bg-blue-600 text-white"
                  onClick={() => viewPlan(plan)}
                >
                  View
                </button>
                <button 
                  className="btn btn-sm bg-yellow-500 hover:bg-yellow-600 text-white"
                  onClick={() => editPlan(plan)}
                >
                  <Edit size={16} />
                </button>
                <button 
                  className="btn btn-sm bg-red-500 hover:bg-red-600 text-white"
                  onClick={() => deletePlan(plan.id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {filteredPlans.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>No project plans found.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderRequirementInput = () => (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4">Generate Project Plan from Requirements</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        Paste client requirements below to automatically generate a project plan including resource allocation, duration, and budget estimates.
      </p>
      
      <div className="mb-4">
        <textarea
          className="input h-64"
          placeholder="Paste client requirements here..."
          value={requirementText}
          onChange={handleRequirementTextChange}
        />
      </div>
      
      <div className="flex justify-end">
        <button 
          className={`btn btn-primary flex items-center gap-2 ${isGeneratingPlan ? 'opacity-75 cursor-not-allowed' : ''}`}
          onClick={generateProjectPlan}
          disabled={isGeneratingPlan}
        >
          {isGeneratingPlan ? (
            <>
              <span className="animate-pulse">Generating...</span>
              <span className="text-sm">{generationProgress}%</span>
            </>
          ) : (
            <>
              <LucidePieChart size={16} />
              <span>Generate Plan</span>
            </>
          )}
        </button>
      </div>
      
      {isGeneratingPlan && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${generationProgress}%` }}
            ></div>
          </div>
          <div className="text-center mt-2 text-sm text-gray-500 dark:text-gray-400">
            {generationProgress < 33 && 'Analyzing requirements...'}
            {generationProgress >= 33 && generationProgress < 66 && 'Estimating resources and timeline...'}
            {generationProgress >= 66 && 'Calculating budget and finalizing plan...'}
          </div>
        </div>
      )}
    </div>
  );

  const renderPlanDetails = () => {
    if (!currentPlan) return null;

    const isEditing = isCreatingPlan || isEditingPlan;
    const resourceAllocation = calculateResourceAllocation();
    const totalBudget = calculateTotalBudget();
    const totalDuration = calculateTotalDuration();
    const resourceAllocationData = generateResourceAllocationChartData();
    const categoryData = generateCategoryChartData();

    return (
      <div className="space-y-6">
        <div className="flex-between">
          <div className="flex items-center gap-4">
            <button 
              className="btn btn-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
              onClick={() => {
                setCurrentPlan(null);
                setActiveTab('dashboard');
              }}
            >
              ← Back to Plans
            </button>
            <h1 className="text-2xl font-bold">
              {isEditing ? (
                <input 
                  type="text" 
                  className="input input-lg" 
                  value={currentPlan.title} 
                  onChange={(e) => updatePlanField('title', e.target.value)}
                  placeholder="Project Title"
                />
              ) : (
                currentPlan.title
              )}
            </h1>
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <button 
                  className="btn btn-primary flex items-center gap-2"
                  onClick={savePlan}
                >
                  <Save size={16} />
                  <span>Save</span>
                </button>
                <button 
                  className="btn bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center gap-2"
                  onClick={cancelEditing}
                >
                  <X size={16} />
                  <span>Cancel</span>
                </button>
              </>
            ) : (
              <>
                <button 
                  className="btn btn-primary flex items-center gap-2"
                  onClick={() => editPlan(currentPlan)}
                >
                  <Edit size={16} />
                  <span>Edit</span>
                </button>
                <button 
                  className="btn bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2"
                  onClick={downloadPlan}
                >
                  <Download size={16} />
                  <span>Export</span>
                </button>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4">
          <div className="lg:w-2/3 space-y-6">
            {/* Project Info */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Project Information</h2>
              <div className="space-y-4">
                <div className="form-group">
                  <label className="form-label">Client Name</label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      className="input" 
                      value={currentPlan.clientName} 
                      onChange={(e) => updatePlanField('clientName', e.target.value)}
                      placeholder="Client Name"
                    />
                  ) : (
                    <p>{currentPlan.clientName || 'Not specified'}</p>
                  )}
                </div>
                
                <div className="form-group">
                  <label className="form-label">Status</label>
                  {isEditing ? (
                    <select 
                      className="input" 
                      value={currentPlan.status}
                      onChange={(e) => updatePlanField('status', e.target.value)}
                    >
                      <option value="Draft">Draft</option>
                      <option value="Ready">Ready</option>
                      <option value="Approved">Approved</option>
                      <option value="Archived">Archived</option>
                    </select>
                  ) : (
                    <span className={`badge ${currentPlan.status === 'Draft' ? 'badge-warning' : currentPlan.status === 'Ready' ? 'badge-info' : currentPlan.status === 'Approved' ? 'badge-success' : 'badge-error'}`}>
                      {currentPlan.status}
                    </span>
                  )}
                </div>
                
                <div className="form-group">
                  <label className="form-label">Notes</label>
                  {isEditing ? (
                    <textarea 
                      className="input h-32" 
                      value={currentPlan.notes} 
                      onChange={(e) => updatePlanField('notes', e.target.value)}
                      placeholder="Project notes..."
                    />
                  ) : (
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md whitespace-pre-wrap">
                      {currentPlan.notes || 'No notes provided.'}
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Created</label>
                    <p>{formatDate(currentPlan.createdAt)}</p>
                  </div>
                  <div>
                    <label className="form-label">Last Modified</label>
                    <p>{formatDate(currentPlan.lastModified)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs for Requirements, Resources, Tasks */}
            <div>
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8">
                  <button
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'requirements' ? 'border-primary-500 text-primary-600 dark:border-primary-400 dark:text-primary-300' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
                    onClick={() => setActiveTab('requirements')}
                  >
                    Requirements
                  </button>
                  <button
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'resources' ? 'border-primary-500 text-primary-600 dark:border-primary-400 dark:text-primary-300' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
                    onClick={() => setActiveTab('resources')}
                  >
                    Resources
                  </button>
                  <button
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'tasks' ? 'border-primary-500 text-primary-600 dark:border-primary-400 dark:text-primary-300' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
                    onClick={() => setActiveTab('tasks')}
                  >
                    Tasks
                  </button>
                </nav>
              </div>

              <div className="mt-4">
                {activeTab === 'requirements' && (
                  <div className="card">
                    <div className="flex-between mb-4">
                      <h3 className="text-lg font-medium">Requirements</h3>
                      {isEditing && (
                        <button 
                          className="btn btn-sm btn-primary flex items-center gap-1"
                          onClick={() => openRequirementModal()}
                        >
                          <Plus size={16} />
                          <span>Add Requirement</span>
                        </button>
                      )}
                    </div>
                    
                    {currentPlan.requirements.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="table w-full">
                          <thead>
                            <tr>
                              <th className="table-header">Title</th>
                              <th className="table-header">Category</th>
                              <th className="table-header">Priority</th>
                              <th className="table-header">Est. Hours</th>
                              {isEditing && <th className="table-header">Actions</th>}
                            </tr>
                          </thead>
                          <tbody>
                            {currentPlan.requirements.map(req => (
                              <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                <td className="table-cell font-medium">{req.title}</td>
                                <td className="table-cell">
                                  <span className={`badge ${req.category === 'Functional' ? 'badge-info' : req.category === 'Technical' ? 'badge-warning' : req.category === 'Infrastructure' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' : req.category === 'Security' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'}`}>
                                    {req.category}
                                  </span>
                                </td>
                                <td className="table-cell">
                                  <span className={`badge ${req.priority === 'High' ? 'badge-error' : req.priority === 'Medium' ? 'badge-warning' : 'badge-success'}`}>
                                    {req.priority}
                                  </span>
                                </td>
                                <td className="table-cell">{req.estimatedHours}</td>
                                {isEditing && (
                                  <td className="table-cell">
                                    <div className="flex gap-2">
                                      <button 
                                        className="btn btn-sm bg-yellow-500 hover:bg-yellow-600 text-white"
                                        onClick={() => openRequirementModal(req)}
                                      >
                                        <Edit size={16} />
                                      </button>
                                      <button 
                                        className="btn btn-sm bg-red-500 hover:bg-red-600 text-white"
                                        onClick={() => deleteRequirement(req.id)}
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    </div>
                                  </td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                        <p>No requirements added yet.</p>
                        {isEditing && (
                          <button 
                            className="btn btn-sm btn-primary mt-2"
                            onClick={() => openRequirementModal()}
                          >
                            Add Requirement
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'resources' && (
                  <div className="card">
                    <div className="flex-between mb-4">
                      <h3 className="text-lg font-medium">Resources</h3>
                      {isEditing && (
                        <button 
                          className="btn btn-sm btn-primary flex items-center gap-1"
                          onClick={() => openResourceModal()}
                        >
                          <Plus size={16} />
                          <span>Add Resource</span>
                        </button>
                      )}
                    </div>
                    
                    {currentPlan.resources.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="table w-full">
                          <thead>
                            <tr>
                              <th className="table-header">Name</th>
                              <th className="table-header">Role</th>
                              <th className="table-header">Rate ($/h)</th>
                              <th className="table-header">Availability (h/week)</th>
                              <th className="table-header">Skills</th>
                              {isEditing && <th className="table-header">Actions</th>}
                            </tr>
                          </thead>
                          <tbody>
                            {currentPlan.resources.map(resource => (
                              <tr key={resource.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                <td className="table-cell font-medium">{resource.name}</td>
                                <td className="table-cell">{resource.role}</td>
                                <td className="table-cell">${resource.ratePerHour}</td>
                                <td className="table-cell">{resource.availability}</td>
                                <td className="table-cell">
                                  <div className="flex flex-wrap gap-1">
                                    {resource.skills.map((skill, index) => (
                                      <span 
                                        key={index} 
                                        className="badge bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                      >
                                        {skill}
                                      </span>
                                    ))}
                                  </div>
                                </td>
                                {isEditing && (
                                  <td className="table-cell">
                                    <div className="flex gap-2">
                                      <button 
                                        className="btn btn-sm bg-yellow-500 hover:bg-yellow-600 text-white"
                                        onClick={() => openResourceModal(resource)}
                                      >
                                        <Edit size={16} />
                                      </button>
                                      <button 
                                        className="btn btn-sm bg-red-500 hover:bg-red-600 text-white"
                                        onClick={() => deleteResource(resource.id)}
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    </div>
                                  </td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                        <p>No resources added yet.</p>
                        {isEditing && (
                          <button 
                            className="btn btn-sm btn-primary mt-2"
                            onClick={() => openResourceModal()}
                          >
                            Add Resource
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'tasks' && (
                  <div className="card">
                    <div className="flex-between mb-4">
                      <h3 className="text-lg font-medium">Tasks</h3>
                      {isEditing && (
                        <button 
                          className="btn btn-sm btn-primary flex items-center gap-1"
                          onClick={() => openTaskModal()}
                        >
                          <Plus size={16} />
                          <span>Add Task</span>
                        </button>
                      )}
                    </div>
                    
                    {currentPlan.tasks.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="table w-full">
                          <thead>
                            <tr>
                              <th className="table-header">Title</th>
                              <th className="table-header">Requirement</th>
                              <th className="table-header">Assigned Resources</th>
                              <th className="table-header">Status</th>
                              <th className="table-header">Hours</th>
                              {isEditing && <th className="table-header">Actions</th>}
                            </tr>
                          </thead>
                          <tbody>
                            {currentPlan.tasks.map(task => (
                              <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                <td className="table-cell font-medium">{task.title}</td>
                                <td className="table-cell">{getRequirementTitle(task.requirementId)}</td>
                                <td className="table-cell">
                                  <div className="flex flex-wrap gap-1">
                                    {task.assignedResourceIds.map(resId => (
                                      <span 
                                        key={resId} 
                                        className="badge bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                      >
                                        {getResourceName(resId)}
                                      </span>
                                    ))}
                                  </div>
                                </td>
                                <td className="table-cell">
                                  <span className={`badge ${task.status === 'Not Started' ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' : task.status === 'In Progress' ? 'badge-warning' : 'badge-success'}`}>
                                    {task.status}
                                  </span>
                                </td>
                                <td className="table-cell">{task.estimatedHours}</td>
                                {isEditing && (
                                  <td className="table-cell">
                                    <div className="flex gap-2">
                                      <button 
                                        className="btn btn-sm bg-yellow-500 hover:bg-yellow-600 text-white"
                                        onClick={() => openTaskModal(task)}
                                      >
                                        <Edit size={16} />
                                      </button>
                                      <button 
                                        className="btn btn-sm bg-red-500 hover:bg-red-600 text-white"
                                        onClick={() => deleteTask(task.id)}
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    </div>
                                  </td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                        <p>No tasks added yet.</p>
                        {isEditing && (
                          <button 
                            className="btn btn-sm btn-primary mt-2"
                            onClick={() => openTaskModal()}
                          >
                            Add Task
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:w-1/3 space-y-6">
            {/* Project Metrics */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Project Metrics</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
                <div className="stat-card">
                  <div className="stat-title">Total Budget</div>
                  <div className="stat-value text-green-600 dark:text-green-400">
                    ${totalBudget.toLocaleString()}
                  </div>
                  <div className="stat-desc flex items-center gap-1">
                    <DollarSign size={14} />
                    <span>Based on resource rates</span>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-title">Estimated Duration</div>
                  <div className="stat-value text-blue-600 dark:text-blue-400">
                    {totalDuration} days
                  </div>
                  <div className="stat-desc flex items-center gap-1">
                    <Calendar size={14} />
                    <span>Based on resource availability</span>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-title">Resources</div>
                  <div className="stat-value text-purple-600 dark:text-purple-400">
                    {currentPlan.resources.length}
                  </div>
                  <div className="stat-desc flex items-center gap-1">
                    <Users size={14} />
                    <span>Assigned to this project</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Resource Allocation Chart */}
            {resourceAllocationData.length > 0 && (
              <div className="card">
                <h2 className="text-lg font-semibold mb-4">Resource Allocation</h2>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={resourceAllocationData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {resourceAllocationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} hours`, 'Time Allocated']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Category Chart */}
            {categoryData.length > 0 && (
              <div className="card">
                <h2 className="text-lg font-semibold mb-4">Requirement Categories</h2>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} hours`, 'Estimated Hours']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Resource Modal
  const renderResourceModal = () => {
    if (!showResourceModal || !currentResource) return null;

    return (
      <div className="modal-backdrop" onClick={() => setShowResourceModal(false)}>
        <div 
          className="modal-content"
          ref={resourceModalRef}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="resource-modal-title"
        >
          <div className="modal-header">
            <h3 id="resource-modal-title" className="text-lg font-medium">
              {currentResource.id && currentPlan?.resources.some(r => r.id === currentResource.id) ? 'Edit Resource' : 'Add Resource'}
            </h3>
            <button className="text-gray-400 hover:text-gray-500" onClick={() => setShowResourceModal(false)} aria-label="Close modal">
              <X size={20} />
            </button>
          </div>
          <div className="space-y-4">
            <div className="form-group">
              <label className="form-label" htmlFor="resource-name">Name</label>
              <input
                id="resource-name"
                type="text"
                className="input"
                value={currentResource.name}
                onChange={(e) => setCurrentResource({ ...currentResource, name: e.target.value })}
                placeholder="Resource name"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="resource-role">Role</label>
              <input
                id="resource-role"
                type="text"
                className="input"
                value={currentResource.role}
                onChange={(e) => setCurrentResource({ ...currentResource, role: e.target.value })}
                placeholder="Job role"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label" htmlFor="resource-rate">Hourly Rate ($)</label>
                <input
                  id="resource-rate"
                  type="number"
                  min="0"
                  className="input"
                  value={currentResource.ratePerHour}
                  onChange={(e) => setCurrentResource({ ...currentResource, ratePerHour: Number(e.target.value) })}
                  placeholder="Rate per hour"
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="resource-availability">Availability (hours/week)</label>
                <input
                  id="resource-availability"
                  type="number"
                  min="0"
                  max="168"
                  className="input"
                  value={currentResource.availability}
                  onChange={(e) => setCurrentResource({ ...currentResource, availability: Number(e.target.value) })}
                  placeholder="Hours per week"
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="resource-skills">Skills (comma separated)</label>
              <input
                id="resource-skills"
                type="text"
                className="input"
                value={currentResource.skills.join(', ')}
                onChange={(e) => setCurrentResource({ 
                  ...currentResource, 
                  skills: e.target.value.split(',').map(skill => skill.trim()).filter(Boolean)
                })}
                placeholder="JavaScript, React, AWS"
              />
            </div>
          </div>
          <div className="modal-footer">
            <button 
              className="btn bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
              onClick={() => setShowResourceModal(false)}
            >
              Cancel
            </button>
            <button 
              className="btn btn-primary"
              onClick={saveResource}
              disabled={!currentResource.name}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Requirement Modal
  const renderRequirementModal = () => {
    if (!showRequirementModal || !currentRequirement) return null;

    return (
      <div className="modal-backdrop" onClick={() => setShowRequirementModal(false)}>
        <div 
          className="modal-content"
          ref={requirementModalRef}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="requirement-modal-title"
        >
          <div className="modal-header">
            <h3 id="requirement-modal-title" className="text-lg font-medium">
              {currentRequirement.id && currentPlan?.requirements.some(r => r.id === currentRequirement.id) ? 'Edit Requirement' : 'Add Requirement'}
            </h3>
            <button className="text-gray-400 hover:text-gray-500" onClick={() => setShowRequirementModal(false)} aria-label="Close modal">
              <X size={20} />
            </button>
          </div>
          <div className="space-y-4">
            <div className="form-group">
              <label className="form-label" htmlFor="requirement-title">Title</label>
              <input
                id="requirement-title"
                type="text"
                className="input"
                value={currentRequirement.title}
                onChange={(e) => setCurrentRequirement({ ...currentRequirement, title: e.target.value })}
                placeholder="Requirement title"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="requirement-description">Description</label>
              <textarea
                id="requirement-description"
                className="input h-24"
                value={currentRequirement.description}
                onChange={(e) => setCurrentRequirement({ ...currentRequirement, description: e.target.value })}
                placeholder="Detailed description of the requirement"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="form-group">
                <label className="form-label" htmlFor="requirement-category">Category</label>
                <select
                  id="requirement-category"
                  className="input"
                  value={currentRequirement.category}
                  onChange={(e) => setCurrentRequirement({ 
                    ...currentRequirement, 
                    category: e.target.value as 'Functional' | 'Technical' | 'Infrastructure' | 'Security' | 'Other'
                  })}
                >
                  <option value="Functional">Functional</option>
                  <option value="Technical">Technical</option>
                  <option value="Infrastructure">Infrastructure</option>
                  <option value="Security">Security</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="requirement-priority">Priority</label>
                <select
                  id="requirement-priority"
                  className="input"
                  value={currentRequirement.priority}
                  onChange={(e) => setCurrentRequirement({ 
                    ...currentRequirement, 
                    priority: e.target.value as 'High' | 'Medium' | 'Low'
                  })}
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="requirement-hours">Estimated Hours</label>
                <input
                  id="requirement-hours"
                  type="number"
                  min="0"
                  className="input"
                  value={currentRequirement.estimatedHours}
                  onChange={(e) => setCurrentRequirement({ 
                    ...currentRequirement, 
                    estimatedHours: Number(e.target.value)
                  })}
                  placeholder="Estimated hours"
                />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button 
              className="btn bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
              onClick={() => setShowRequirementModal(false)}
            >
              Cancel
            </button>
            <button 
              className="btn btn-primary"
              onClick={saveRequirement}
              disabled={!currentRequirement.title}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Task Modal
  const renderTaskModal = () => {
    if (!showTaskModal || !currentTask || !currentPlan) return null;

    return (
      <div className="modal-backdrop" onClick={() => setShowTaskModal(false)}>
        <div 
          className="modal-content"
          ref={taskModalRef}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="task-modal-title"
        >
          <div className="modal-header">
            <h3 id="task-modal-title" className="text-lg font-medium">
              {currentTask.id && currentPlan.tasks.some(t => t.id === currentTask.id) ? 'Edit Task' : 'Add Task'}
            </h3>
            <button className="text-gray-400 hover:text-gray-500" onClick={() => setShowTaskModal(false)} aria-label="Close modal">
              <X size={20} />
            </button>
          </div>
          <div className="space-y-4">
            <div className="form-group">
              <label className="form-label" htmlFor="task-title">Title</label>
              <input
                id="task-title"
                type="text"
                className="input"
                value={currentTask.title}
                onChange={(e) => setCurrentTask({ ...currentTask, title: e.target.value })}
                placeholder="Task title"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="task-description">Description</label>
              <textarea
                id="task-description"
                className="input h-20"
                value={currentTask.description}
                onChange={(e) => setCurrentTask({ ...currentTask, description: e.target.value })}
                placeholder="Detailed description of the task"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="task-requirement">Requirement</label>
              <select
                id="task-requirement"
                className="input"
                value={currentTask.requirementId}
                onChange={(e) => setCurrentTask({ ...currentTask, requirementId: e.target.value })}
              >
                {currentPlan.requirements.map(req => (
                  <option key={req.id} value={req.id}>{req.title}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label" htmlFor="task-status">Status</label>
                <select
                  id="task-status"
                  className="input"
                  value={currentTask.status}
                  onChange={(e) => setCurrentTask({ 
                    ...currentTask, 
                    status: e.target.value as 'Not Started' | 'In Progress' | 'Completed'
                  })}
                >
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="task-hours">Estimated Hours</label>
                <input
                  id="task-hours"
                  type="number"
                  min="0"
                  className="input"
                  value={currentTask.estimatedHours}
                  onChange={(e) => setCurrentTask({ 
                    ...currentTask, 
                    estimatedHours: Number(e.target.value)
                  })}
                  placeholder="Estimated hours"
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Assigned Resources</label>
              <div className="space-y-2 mt-1">
                {currentPlan.resources.length > 0 ? (
                  currentPlan.resources.map(resource => (
                    <div key={resource.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`resource-${resource.id}`}
                        checked={currentTask.assignedResourceIds.includes(resource.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setCurrentTask({
                              ...currentTask,
                              assignedResourceIds: [...currentTask.assignedResourceIds, resource.id]
                            });
                          } else {
                            setCurrentTask({
                              ...currentTask,
                              assignedResourceIds: currentTask.assignedResourceIds.filter(id => id !== resource.id)
                            });
                          }
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <label htmlFor={`resource-${resource.id}`} className="text-sm text-gray-700 dark:text-gray-300">
                        {resource.name} ({resource.role})
                      </label>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    No resources available. Add resources first.
                  </div>
                )}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Dependencies</label>
              <div className="space-y-2 mt-1">
                {currentPlan.tasks.filter(t => t.id !== currentTask.id).length > 0 ? (
                  currentPlan.tasks.filter(t => t.id !== currentTask.id).map(task => (
                    <div key={task.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`dependency-${task.id}`}
                        checked={currentTask.dependencies.includes(task.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setCurrentTask({
                              ...currentTask,
                              dependencies: [...currentTask.dependencies, task.id]
                            });
                          } else {
                            setCurrentTask({
                              ...currentTask,
                              dependencies: currentTask.dependencies.filter(id => id !== task.id)
                            });
                          }
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <label htmlFor={`dependency-${task.id}`} className="text-sm text-gray-700 dark:text-gray-300">
                        {task.title}
                      </label>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    No other tasks available for dependencies.
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button 
              className="btn bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
              onClick={() => setShowTaskModal(false)}
            >
              Cancel
            </button>
            <button 
              className="btn btn-primary"
              onClick={saveTask}
              disabled={!currentTask.title || !currentTask.requirementId}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Main App Layout
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm z-10 theme-transition sticky top-0">
        <div className="container-fluid py-4">
          <div className="flex-between">
            <div className="flex items-center gap-2">
              <div className="text-primary-600 dark:text-primary-400">
                <FileText size={28} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">PreSales Architect</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Project Plan Generator</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                onClick={toggleDarkMode}
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <div className="hidden sm:flex items-center gap-6">
                <button 
                  onClick={() => {
                    setCurrentPlan(null);
                    setActiveTab('dashboard');
                  }} 
                  className={`flex items-center gap-1.5 px-1 py-2 border-b-2 ${!currentPlan && activeTab === 'dashboard' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
                >
                  <LucidePieChart size={18} />
                  <span>Dashboard</span>
                </button>
                <button 
                  onClick={() => setActiveTab('generate')} 
                  className={`flex items-center gap-1.5 px-1 py-2 border-b-2 ${activeTab === 'generate' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
                >
                  <FileText size={18} />
                  <span>Generate Plan</span>
                </button>
              </div>
              <div className="sm:hidden">
                <button 
                  className="flex items-center justify-center w-8 h-8 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  onClick={() => {
                    // Toggle mobile menu
                    const newTab = activeTab === 'dashboard' ? 'generate' : 'dashboard';
                    setActiveTab(newTab);
                    if (newTab === 'dashboard') {
                      setCurrentPlan(null);
                    }
                  }}
                >
                  <ChevronDown size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container-fluid py-6">
        {!currentPlan && activeTab === 'dashboard' && renderPlansList()}
        {!currentPlan && activeTab === 'generate' && renderRequirementInput()}
        {currentPlan && renderPlanDetails()}
        
        {/* Modals */}
        {renderResourceModal()}
        {renderRequirementModal()}
        {renderTaskModal()}
      </main>

      {/* Feature Section */}
      {!currentPlan && activeTab === 'dashboard' && (
        <section className="bg-gray-50 dark:bg-gray-800 py-12 theme-transition">
          <div className="container-fluid">
            <h2 className="text-2xl font-bold text-center mb-10 text-gray-900 dark:text-white">Generate Comprehensive Project Plans</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="card flex flex-col items-center text-center p-6">
                <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full mb-4">
                  <FileText className="text-blue-600 dark:text-blue-300" size={24} />
                </div>
                <h3 className="text-lg font-semibold mb-2">Requirements Parsing</h3>
                <p className="text-gray-500 dark:text-gray-400">Extract project requirements from client documents and automatically organize them.</p>
              </div>
              
              <div className="card flex flex-col items-center text-center p-6">
                <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full mb-4">
                  <Users className="text-green-600 dark:text-green-300" size={24} />
                </div>
                <h3 className="text-lg font-semibold mb-2">Resource Allocation</h3>
                <p className="text-gray-500 dark:text-gray-400">Optimize resource allocation based on skills, availability, and project needs.</p>
              </div>
              
              <div className="card flex flex-col items-center text-center p-6">
                <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full mb-4">
                  <Calendar className="text-purple-600 dark:text-purple-300" size={24} />
                </div>
                <h3 className="text-lg font-semibold mb-2">Timeline Estimation</h3>
                <p className="text-gray-500 dark:text-gray-400">Generate realistic project timelines based on task dependencies and resource availability.</p>
              </div>
              
              <div className="card flex flex-col items-center text-center p-6">
                <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-full mb-4">
                  <DollarSign className="text-yellow-600 dark:text-yellow-300" size={24} />
                </div>
                <h3 className="text-lg font-semibold mb-2">Budget Calculation</h3>
                <p className="text-gray-500 dark:text-gray-400">Calculate accurate project budgets based on resource rates and estimated effort.</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Technology Section */}
      {!currentPlan && activeTab === 'dashboard' && (
        <section className="py-12 theme-transition">
          <div className="container-fluid">
            <h2 className="text-2xl font-bold text-center mb-10 text-gray-900 dark:text-white">Support for Various Technologies</h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              <div className="flex flex-col items-center text-center">
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-3">
                  <Code className="text-gray-700 dark:text-gray-300" size={28} />
                </div>
                <h3 className="text-sm font-medium">Web Development</h3>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-3">
                  <Database className="text-gray-700 dark:text-gray-300" size={28} />
                </div>
                <h3 className="text-sm font-medium">Database Systems</h3>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-3">
                  <Server className="text-gray-700 dark:text-gray-300" size={28} />
                </div>
                <h3 className="text-sm font-medium">Server Infrastructure</h3>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-3">
                  <Cloud className="text-gray-700 dark:text-gray-300" size={28} />
                </div>
                <h3 className="text-sm font-medium">Cloud Services</h3>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-3">
                  <Monitor className="text-gray-700 dark:text-gray-300" size={28} />
                </div>
                <h3 className="text-sm font-medium">UI/UX Design</h3>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-100 dark:bg-gray-800 py-6 theme-transition">
        <div className="container-fluid">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left">
              <p className="text-gray-600 dark:text-gray-400 text-sm">Copyright © 2025 of Datavtar Private Limited. All rights reserved.</p>
            </div>
            <div className="mt-4 md:mt-0">
              <ul className="flex items-center space-x-6">
                <li>
                  <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-sm">Terms</a>
                </li>
                <li>
                  <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-sm">Privacy</a>
                </li>
                <li>
                  <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-sm">Support</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>

      {/* Badge floating at the bottom for mobile navigation */}
      <div className="sm:hidden fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white dark:bg-slate-800 shadow-lg rounded-full flex overflow-hidden theme-transition">
        <button 
          onClick={() => {
            setCurrentPlan(null);
            setActiveTab('dashboard');
          }} 
          className={`flex items-center justify-center py-2 px-4 ${activeTab === 'dashboard' ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}`}
        >
          <LucidePieChart size={20} />
        </button>
        <button 
          onClick={() => setActiveTab('generate')} 
          className={`flex items-center justify-center py-2 px-4 ${activeTab === 'generate' ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}`}
        >
          <FileText size={20} />
        </button>
      </div>
    </div>
  );
};

export default App;