import React, { useState, useEffect, useRef } from 'react';
import { Sun, Moon, Plus, Trash2, Save, Filter, Search, Download, Upload, ChevronDown, X, Eye, EyeOff, Layers, Edit, ArrowLeft, ArrowRight, Home, Building, Construction, Hammer, FlaskConical, Settings, User } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import styles from './styles/styles.module.css';

// Type definitions
type ProjectStatus = 'planning' | 'design' | 'construction' | 'complete';
type MaterialType = 'concrete' | 'steel' | 'wood' | 'glass' | 'brick' | 'other';

interface BIMProject {
  id: string;
  name: string;
  description: string;
  client: string;
  location: string;
  startDate: string;
  endDate: string;
  status: ProjectStatus;
  budget: number;
  architects: string[];
  engineers: string[];
  contractors: string[];
  models: BIMModel[];
}

interface BIMModel {
  id: string;
  name: string;
  type: string;
  dateCreated: string;
  dateModified: string;
  author: string;
  version: string;
  description: string;
  elements: BIMElement[];
  isVisible: boolean;
}

interface BIMElement {
  id: string;
  name: string;
  type: string;
  material: MaterialType;
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  position: {
    x: number;
    y: number;
    z: number;
  };
  rotation: {
    x: number;
    y: number;
    z: number;
  };
  properties: Record<string, string | number | boolean>;
  isSelected: boolean;
}

interface ProjectAnalytics {
  materialDistribution: { name: string; value: number }[];
  elementTypeDistribution: { name: string; value: number }[];
  modelProgress: { name: string; complete: number; incomplete: number }[];
}

// Sample data for demonstration
const sampleProjects: BIMProject[] = [
  {
    id: 'p1',
    name: 'City Center Tower',
    description: 'A 35-story commercial tower in downtown',
    client: 'Metro Development Corp',
    location: 'Downtown, Metro City',
    startDate: '2023-06-15',
    endDate: '2025-12-31',
    status: 'design',
    budget: 75000000,
    architects: ['Architectural Visions Inc.'],
    engineers: ['Structural Solutions Ltd', 'MEP Systems Group'],
    contractors: ['BuildWell Construction'],
    models: [
      {
        id: 'm1',
        name: 'Architectural Model',
        type: 'architectural',
        dateCreated: '2023-07-20',
        dateModified: '2023-10-15',
        author: 'John Doe',
        version: '1.2.3',
        description: 'Main architectural model with exterior and interior details',
        isVisible: true,
        elements: [
          {
            id: 'e1',
            name: 'External Wall A1',
            type: 'wall',
            material: 'concrete',
            dimensions: { width: 30, height: 4, depth: 0.3 },
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            properties: { insulated: true, fireRating: '2hr', color: '#CCCCCC' },
            isSelected: false
          },
          {
            id: 'e2',
            name: 'Curtain Wall B1',
            type: 'window',
            material: 'glass',
            dimensions: { width: 15, height: 3.5, depth: 0.1 },
            position: { x: 30, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            properties: { glazingType: 'double', uvProtection: true, color: '#A4C2F4' },
            isSelected: false
          },
          {
            id: 'e3',
            name: 'Main Column C1',
            type: 'column',
            material: 'steel',
            dimensions: { width: 0.6, height: 4, depth: 0.6 },
            position: { x: 15, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            properties: { loadBearing: true, reinforced: true, fireRating: '3hr' },
            isSelected: false
          }
        ]
      },
      {
        id: 'm2',
        name: 'Structural Model',
        type: 'structural',
        dateCreated: '2023-08-01',
        dateModified: '2023-10-20',
        author: 'Jane Smith',
        version: '1.1.5',
        description: 'Core structural elements including beams, columns, and foundations',
        isVisible: true,
        elements: [
          {
            id: 'e4',
            name: 'Foundation F1',
            type: 'foundation',
            material: 'concrete',
            dimensions: { width: 40, height: 1.5, depth: 40 },
            position: { x: 0, y: -1.5, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            properties: { reinforced: true, concreteMix: 'M50', waterproof: true },
            isSelected: false
          },
          {
            id: 'e5',
            name: 'Main Beam MB1',
            type: 'beam',
            material: 'steel',
            dimensions: { width: 0.4, height: 0.6, depth: 10 },
            position: { x: 5, y: 4, z: 5 },
            rotation: { x: 0, y: 0, z: 0 },
            properties: { loadBearing: true, connectionType: 'welded', grade: 'A36' },
            isSelected: false
          }
        ]
      }
    ]
  },
  {
    id: 'p2',
    name: 'Riverside Medical Center',
    description: 'A state-of-the-art medical facility with 6 buildings',
    client: 'Riverside Healthcare Group',
    location: 'Riverside District, Metro City',
    startDate: '2024-01-10',
    endDate: '2026-06-30',
    status: 'planning',
    budget: 120000000,
    architects: ['Healthcare Design Partners'],
    engineers: ['MEP Advanced Group', 'GeoTech Solutions Inc.'],
    contractors: ['Medical Builders Co.', 'Specialized Systems Ltd'],
    models: [
      {
        id: 'm3',
        name: 'Site Planning Model',
        type: 'planning',
        dateCreated: '2024-01-20',
        dateModified: '2024-02-15',
        author: 'Alex Johnson',
        version: '0.9.1',
        description: 'Initial site layout and building placement',
        isVisible: true,
        elements: [
          {
            id: 'e6',
            name: 'Building A Footprint',
            type: 'footprint',
            material: 'other',
            dimensions: { width: 50, height: 0.1, depth: 40 },
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            properties: { purpose: 'Main Hospital', floors: 5, area: 2000 },
            isSelected: false
          },
          {
            id: 'e7',
            name: 'Building B Footprint',
            type: 'footprint',
            material: 'other',
            dimensions: { width: 30, height: 0.1, depth: 25 },
            position: { x: 70, y: 0, z: 10 },
            rotation: { x: 0, y: 0, z: 15 },
            properties: { purpose: 'Research Wing', floors: 3, area: 750 },
            isSelected: false
          }
        ]
      }
    ]
  }
];

// Generate analytics data based on the sample projects
const generateAnalytics = (projects: BIMProject[]): ProjectAnalytics => {
  // Count elements by material
  const materialCounts: Record<string, number> = {};
  // Count elements by type
  const elementTypeCounts: Record<string, number> = {};
  // Track model completion (for demo, we'll randomly assign completion percentages)
  const modelProgress: { name: string; complete: number; incomplete: number }[] = [];
  
  projects.forEach(project => {
    project.models.forEach(model => {
      // Add to model progress
      const completion = Math.floor(Math.random() * 100);
      modelProgress.push({
        name: model.name,
        complete: completion,
        incomplete: 100 - completion
      });
      
      model.elements.forEach(element => {
        // Count by material
        materialCounts[element.material] = (materialCounts[element.material] || 0) + 1;
        
        // Count by element type
        elementTypeCounts[element.type] = (elementTypeCounts[element.type] || 0) + 1;
      });
    });
  });
  
  // Convert to chart-ready format
  const materialDistribution = Object.entries(materialCounts).map(([name, value]) => ({ name, value }));
  const elementTypeDistribution = Object.entries(elementTypeCounts).map(([name, value]) => ({ name, value }));
  
  return {
    materialDistribution,
    elementTypeDistribution,
    modelProgress
  };
};

const App: React.FC = () => {
  // State management
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [projects, setProjects] = useState<BIMProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'projects' | 'viewer' | 'analytics' | 'settings'>('projects');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');
  const [analytics, setAnalytics] = useState<ProjectAnalytics | null>(null);
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState<boolean>(false);
  const [isAddModelModalOpen, setIsAddModelModalOpen] = useState<boolean>(false);
  const [isAddElementModalOpen, setIsAddElementModalOpen] = useState<boolean>(false);
  const [isElementDetailsOpen, setIsElementDetailsOpen] = useState<boolean>(false);
  
  // New project form state
  const [newProject, setNewProject] = useState<Omit<BIMProject, 'id' | 'models'> & { id?: string }>(
    {
      name: '',
      description: '',
      client: '',
      location: '',
      startDate: '',
      endDate: '',
      status: 'planning',
      budget: 0,
      architects: [],
      engineers: [],
      contractors: []
    }
  );
  
  // New model form state
  const [newModel, setNewModel] = useState<Omit<BIMModel, 'id' | 'elements' | 'isVisible'> & { id?: string }>(
    {
      name: '',
      type: '',
      dateCreated: new Date().toISOString().split('T')[0],
      dateModified: new Date().toISOString().split('T')[0],
      author: '',
      version: '1.0.0',
      description: ''
    }
  );
  
  // New element form state
  const [newElement, setNewElement] = useState<Omit<BIMElement, 'id' | 'isSelected'> & { id?: string }>(
    {
      name: '',
      type: '',
      material: 'concrete',
      dimensions: { width: 1, height: 1, depth: 1 },
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      properties: {}
    }
  );
  
  // Dynamic property fields for element
  const [propertyKey, setPropertyKey] = useState<string>('');
  const [propertyValue, setPropertyValue] = useState<string>('');
  
  // References
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Load projects from local storage on initial render
  useEffect(() => {
    const savedProjects = localStorage.getItem('bimProjects');
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    } else {
      // Use sample projects if none found in local storage
      setProjects(sampleProjects);
      localStorage.setItem('bimProjects', JSON.stringify(sampleProjects));
    }
    
    // Check for dark mode preference
    const savedDarkMode = localStorage.getItem('bimDarkMode');
    if (savedDarkMode) {
      setIsDarkMode(savedDarkMode === 'true');
    } else {
      // Check for system preference
      const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDarkMode);
      localStorage.setItem('bimDarkMode', prefersDarkMode.toString());
    }
  }, []);
  
  // Update dark mode in document and localStorage when changed
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('bimDarkMode', isDarkMode.toString());
  }, [isDarkMode]);
  
  // Regenerate analytics when projects change
  useEffect(() => {
    setAnalytics(generateAnalytics(projects));
    
    // Save projects to local storage whenever they change
    localStorage.setItem('bimProjects', JSON.stringify(projects));
  }, [projects]);
  
  // Get the selected project, model, and element
  const selectedProject = selectedProjectId ? projects.find(p => p.id === selectedProjectId) : null;
  const selectedModel = selectedProject && selectedModelId
    ? selectedProject.models.find(m => m.id === selectedModelId)
    : null;
  const selectedElement = selectedModel && selectedElementId
    ? selectedModel.elements.find(e => e.id === selectedElementId)
    : null;
  
  // Close modal when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        closeAllModals();
      }
    };
    
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeAllModals();
      }
    };
    
    if (isAddProjectModalOpen || isAddModelModalOpen || isAddElementModalOpen || isElementDetailsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isAddProjectModalOpen, isAddModelModalOpen, isAddElementModalOpen, isElementDetailsOpen]);
  
  // Helper function to close all modals
  const closeAllModals = () => {
    setIsAddProjectModalOpen(false);
    setIsAddModelModalOpen(false);
    setIsAddElementModalOpen(false);
    setIsElementDetailsOpen(false);
  };
  
  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };
  
  // Filter projects by status and search query
  const filteredProjects = projects.filter(project => {
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.client.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });
  
  // Generate a unique ID
  const generateId = (): string => {
    return Math.random().toString(36).substring(2, 11);
  };
  
  // Add a new project
  const handleAddProject = () => {
    const projectToAdd: BIMProject = {
      ...newProject,
      id: generateId(),
      models: []
    };
    
    setProjects([...projects, projectToAdd]);
    setNewProject({
      name: '',
      description: '',
      client: '',
      location: '',
      startDate: '',
      endDate: '',
      status: 'planning',
      budget: 0,
      architects: [],
      engineers: [],
      contractors: []
    });
    setIsAddProjectModalOpen(false);
  };
  
  // Handle adding multiple team members (comma-separated)
  const handleTeamInput = (field: keyof Pick<BIMProject, 'architects' | 'engineers' | 'contractors'>, value: string) => {
    setNewProject({
      ...newProject,
      [field]: value.split(',').map(item => item.trim()).filter(item => item !== '')
    });
  };
  
  // Add a new model to a project
  const handleAddModel = () => {
    if (!selectedProjectId) return;
    
    const modelToAdd: BIMModel = {
      ...newModel,
      id: generateId(),
      elements: [],
      isVisible: true
    };
    
    setProjects(projects.map(project => {
      if (project.id === selectedProjectId) {
        return {
          ...project,
          models: [...project.models, modelToAdd]
        };
      }
      return project;
    }));
    
    setSelectedModelId(modelToAdd.id);
    setNewModel({
      name: '',
      type: '',
      dateCreated: new Date().toISOString().split('T')[0],
      dateModified: new Date().toISOString().split('T')[0],
      author: '',
      version: '1.0.0',
      description: ''
    });
    setIsAddModelModalOpen(false);
  };
  
  // Add a new element to a model
  const handleAddElement = () => {
    if (!selectedProjectId || !selectedModelId) return;
    
    const elementToAdd: BIMElement = {
      ...newElement,
      id: generateId(),
      isSelected: false
    };
    
    setProjects(projects.map(project => {
      if (project.id === selectedProjectId) {
        return {
          ...project,
          models: project.models.map(model => {
            if (model.id === selectedModelId) {
              return {
                ...model,
                elements: [...model.elements, elementToAdd]
              };
            }
            return model;
          })
        };
      }
      return project;
    }));
    
    setSelectedElementId(elementToAdd.id);
    setNewElement({
      name: '',
      type: '',
      material: 'concrete',
      dimensions: { width: 1, height: 1, depth: 1 },
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      properties: {}
    });
    setIsAddElementModalOpen(false);
  };
  
  // Add a property to the new element
  const handleAddProperty = () => {
    if (!propertyKey || !propertyValue) return;
    
    setNewElement({
      ...newElement,
      properties: {
        ...newElement.properties,
        [propertyKey]: propertyValue
      }
    });
    
    setPropertyKey('');
    setPropertyValue('');
  };
  
  // Delete a property from the new element
  const handleDeleteProperty = (key: string) => {
    const updatedProperties = { ...newElement.properties };
    delete updatedProperties[key];
    
    setNewElement({
      ...newElement,
      properties: updatedProperties
    });
  };
  
  // Toggle model visibility
  const toggleModelVisibility = (modelId: string) => {
    if (!selectedProjectId) return;
    
    setProjects(projects.map(project => {
      if (project.id === selectedProjectId) {
        return {
          ...project,
          models: project.models.map(model => {
            if (model.id === modelId) {
              return {
                ...model,
                isVisible: !model.isVisible
              };
            }
            return model;
          })
        };
      }
      return project;
    }));
  };
  
  // Select/deselect an element
  const toggleElementSelection = (elementId: string) => {
    if (!selectedProjectId || !selectedModelId) return;
    
    setProjects(projects.map(project => {
      if (project.id === selectedProjectId) {
        return {
          ...project,
          models: project.models.map(model => {
            if (model.id === selectedModelId) {
              return {
                ...model,
                elements: model.elements.map(element => {
                  if (element.id === elementId) {
                    return {
                      ...element,
                      isSelected: !element.isSelected
                    };
                  }
                  return element;
                })
              };
            }
            return model;
          })
        };
      }
      return project;
    }));
    
    // Toggle element details panel
    if (selectedElementId === elementId) {
      setSelectedElementId(null);
      setIsElementDetailsOpen(false);
    } else {
      setSelectedElementId(elementId);
      setIsElementDetailsOpen(true);
    }
  };
  
  // Delete a project
  const handleDeleteProject = (projectId: string) => {
    if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) return;
    
    setProjects(projects.filter(project => project.id !== projectId));
    
    if (selectedProjectId === projectId) {
      setSelectedProjectId(null);
      setSelectedModelId(null);
      setSelectedElementId(null);
      setActiveTab('projects');
    }
  };
  
  // Delete a model
  const handleDeleteModel = (modelId: string) => {
    if (!selectedProjectId) return;
    if (!window.confirm('Are you sure you want to delete this model? This action cannot be undone.')) return;
    
    setProjects(projects.map(project => {
      if (project.id === selectedProjectId) {
        return {
          ...project,
          models: project.models.filter(model => model.id !== modelId)
        };
      }
      return project;
    }));
    
    if (selectedModelId === modelId) {
      setSelectedModelId(null);
      setSelectedElementId(null);
    }
  };
  
  // Delete an element
  const handleDeleteElement = (elementId: string) => {
    if (!selectedProjectId || !selectedModelId) return;
    if (!window.confirm('Are you sure you want to delete this element? This action cannot be undone.')) return;
    
    setProjects(projects.map(project => {
      if (project.id === selectedProjectId) {
        return {
          ...project,
          models: project.models.map(model => {
            if (model.id === selectedModelId) {
              return {
                ...model,
                elements: model.elements.filter(element => element.id !== elementId)
              };
            }
            return model;
          })
        };
      }
      return project;
    }));
    
    if (selectedElementId === elementId) {
      setSelectedElementId(null);
      setIsElementDetailsOpen(false);
    }
  };
  
  // Export project data as JSON
  const handleExportProject = (projectId: string) => {
    const projectToExport = projects.find(p => p.id === projectId);
    if (!projectToExport) return;
    
    const dataStr = JSON.stringify(projectToExport, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${projectToExport.name.replace(/\s+/g, '_')}_BIM_Export.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };
  
  // Create a template project for users to download
  const handleDownloadTemplate = () => {
    const templateProject: BIMProject = {
      id: 'template_id',
      name: 'Template Project',
      description: 'Template description',
      client: 'Template Client',
      location: 'Template Location',
      startDate: '2023-01-01',
      endDate: '2024-01-01',
      status: 'planning',
      budget: 1000000,
      architects: ['Template Architect'],
      engineers: ['Template Engineer'],
      contractors: ['Template Contractor'],
      models: [
        {
          id: 'template_model_id',
          name: 'Template Model',
          type: 'architectural',
          dateCreated: '2023-01-01',
          dateModified: '2023-01-01',
          author: 'Template Author',
          version: '1.0.0',
          description: 'Template model description',
          isVisible: true,
          elements: [
            {
              id: 'template_element_id',
              name: 'Template Element',
              type: 'wall',
              material: 'concrete',
              dimensions: { width: 1, height: 1, depth: 1 },
              position: { x: 0, y: 0, z: 0 },
              rotation: { x: 0, y: 0, z: 0 },
              properties: { 'property1': 'value1', 'property2': 'value2' },
              isSelected: false
            }
          ]
        }
      ]
    };
    
    const dataStr = JSON.stringify(templateProject, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', 'BIM_Project_Template.json');
    linkElement.click();
  };
  
  // Handle importing a project from a JSON file
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileInput = event.target;
    if (!fileInput.files || fileInput.files.length === 0) return;
    
    const file = fileInput.files[0];
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        if (!e.target?.result) return;
        
        const importedProject = JSON.parse(e.target.result as string) as BIMProject;
        
        // Validate the imported project structure
        if (!importedProject.id || !importedProject.name || !Array.isArray(importedProject.models)) {
          alert('Invalid project file format.');
          return;
        }
        
        // Check if a project with the same ID already exists
        const existingProject = projects.find(p => p.id === importedProject.id);
        if (existingProject) {
          // Generate a new ID for the imported project
          importedProject.id = generateId();
        }
        
        setProjects([...projects, importedProject]);
        alert(`Project "${importedProject.name}" imported successfully.`);
      } catch (error) {
        alert('Error importing project: ' + (error instanceof Error ? error.message : 'Unknown error'));
      }
    };
    
    reader.readAsText(file);
    // Reset the file input
    fileInput.value = '';
  };
  
  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Get status badge class
  const getStatusBadgeClass = (status: ProjectStatus): string => {
    switch (status) {
      case 'planning': return 'badge badge-info';
      case 'design': return 'badge badge-warning';
      case 'construction': return 'badge badge-primary bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'complete': return 'badge badge-success';
      default: return 'badge';
    }
  };
  
  // Get color for material in charts
  const getMaterialColor = (material: string): string => {
    switch (material) {
      case 'concrete': return '#9CA3AF'; // gray
      case 'steel': return '#60A5FA'; // blue
      case 'wood': return '#F59E0B'; // amber
      case 'glass': return '#A7F3D0'; // green
      case 'brick': return '#EF4444'; // red
      default: return '#D1D5DB'; // light gray
    }
  };
  
  // Render the 3D canvas view (simplified for demo)
  const render3DView = () => {
    return (
      <div className={styles.canvasContainer}>
        <div className={styles.canvasPlaceholder}>
          <div className="text-center">
            <Construction size={64} className="mx-auto text-gray-400 dark:text-gray-600" />
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">3D Viewer</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              In a full implementation, this would be a WebGL-based 3D viewer for BIM models.
            </p>
            {selectedModel ? (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Currently viewing: {selectedModel.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Elements: {selectedModel.elements.length}
                </p>
              </div>
            ) : (
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                Select a model to view its 3D representation
              </p>
            )}
          </div>
          
          {/* Simple representation of selected elements */}
          {selectedModel && selectedModel.elements.length > 0 && (
            <div className="absolute inset-0 pointer-events-none">
              {selectedModel.elements.map(element => element.isSelected && (
                <div
                  key={element.id}
                  className={styles.selectedElement}
                  style={{
                    left: `${(element.position.x % 100) + 50}%`,
                    top: `${(element.position.y % 100) + 50}%`,
                    width: `${Math.min(element.dimensions.width * 3, 30)}px`,
                    height: `${Math.min(element.dimensions.height * 3, 30)}px`,
                    backgroundColor: getMaterialColor(element.material)
                  }}
                ></div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };
  
  // Render material distribution chart
  const renderMaterialChart = () => {
    if (!analytics || analytics.materialDistribution.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">No material data available</p>
        </div>
      );
    }
    
    const COLORS = ['#60A5FA', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6', '#EC4899'];
    
    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={analytics.materialDistribution}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {analytics.materialDistribution.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`${value} elements`, 'Count']} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  };
  
  // Render element type distribution chart
  const renderElementTypeChart = () => {
    if (!analytics || analytics.elementTypeDistribution.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">No element type data available</p>
        </div>
      );
    }
    
    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={analytics.elementTypeDistribution}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip formatter={(value) => [`${value} elements`, 'Count']} />
          <Legend />
          <Bar dataKey="value" fill="#60A5FA" name="Element Count" />
        </BarChart>
      </ResponsiveContainer>
    );
  };
  
  // Render model progress chart
  const renderModelProgressChart = () => {
    if (!analytics || analytics.modelProgress.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">No progress data available</p>
        </div>
      );
    }
    
    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={analytics.modelProgress}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip formatter={(value) => [`${value}%`, 'Completion']} />
          <Legend />
          <Bar dataKey="complete" stackId="a" fill="#10B981" name="Complete" />
          <Bar dataKey="incomplete" stackId="a" fill="#EF4444" name="Incomplete" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 theme-transition">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10 theme-transition">
        <div className="container-fluid py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center">
              <Building className="h-8 w-8 text-primary-600 dark:text-primary-400 mr-2" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">BIM Modeling System</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleDarkMode}
                className="btn-sm flex items-center bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-full"
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </button>
              
              <div className="hidden sm:flex items-center space-x-1">
                <button
                  onClick={() => setActiveTab('projects')}
                  className={`btn-sm ${activeTab === 'projects' ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
                >
                  <Home className="h-4 w-4 mr-1" />
                  Projects
                </button>
                <button
                  onClick={() => setActiveTab('viewer')}
                  className={`btn-sm ${activeTab === 'viewer' ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
                  disabled={!selectedModelId}
                >
                  <Building className="h-4 w-4 mr-1" />
                  Viewer
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`btn-sm ${activeTab === 'analytics' ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
                >
                  <FlaskConical className="h-4 w-4 mr-1" />
                  Analytics
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`btn-sm ${activeTab === 'settings' ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
                >
                  <Settings className="h-4 w-4 mr-1" />
                  Settings
                </button>
              </div>
            </div>
          </div>
          
          {/* Mobile navigation */}
          <div className="sm:hidden flex items-center justify-between mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
            <button
              onClick={() => setActiveTab('projects')}
              className={`flex flex-col items-center ${activeTab === 'projects' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}`}
            >
              <Home className="h-5 w-5" />
              <span className="text-xs mt-1">Projects</span>
            </button>
            
            <button
              onClick={() => setActiveTab('viewer')}
              className={`flex flex-col items-center ${activeTab === 'viewer' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}`}
              disabled={!selectedModelId}
            >
              <Building className="h-5 w-5" />
              <span className="text-xs mt-1">Viewer</span>
            </button>
            
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex flex-col items-center ${activeTab === 'analytics' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}`}
            >
              <FlaskConical className="h-5 w-5" />
              <span className="text-xs mt-1">Analytics</span>
            </button>
            
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex flex-col items-center ${activeTab === 'settings' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}`}
            >
              <Settings className="h-5 w-5" />
              <span className="text-xs mt-1">Settings</span>
            </button>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-grow container-fluid py-6">
        {/* Breadcrumb navigation */}
        <div className="mb-6 flex flex-wrap items-center text-sm">
          <span className="text-gray-500 dark:text-gray-400">
            <Home className="inline-block h-4 w-4 mr-1" />
          </span>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-700 dark:text-gray-300 font-medium">
            {activeTab === 'projects' && 'Projects'}
            {activeTab === 'viewer' && 'Model Viewer'}
            {activeTab === 'analytics' && 'Analytics'}
            {activeTab === 'settings' && 'Settings'}
          </span>
          
          {selectedProjectId && (
            <>
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                {selectedProject?.name}
              </span>
            </>
          )}
          
          {selectedModelId && (
            <>
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                {selectedModel?.name}
              </span>
            </>
          )}
        </div>
        
        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <div>
            {/* Project actions */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-grow max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search projects..."
                    className="input pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <select
                    className="input appearance-none pr-10"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as ProjectStatus | 'all')}
                  >
                    <option value="all">All Statuses</option>
                    <option value="planning">Planning</option>
                    <option value="design">Design</option>
                    <option value="construction">Construction</option>
                    <option value="complete">Complete</option>
                  </select>
                  <Filter className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
                
                <button
                  className="btn btn-primary flex items-center"
                  onClick={() => setIsAddProjectModalOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  New Project
                </button>
                
                <button
                  className="btn bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center"
                  onClick={handleDownloadTemplate}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Template
                </button>
                
                <label className="btn bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center cursor-pointer">
                  <Upload className="h-4 w-4 mr-1" />
                  Import
                  <input
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>
            </div>
            
            {/* Project list */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                    <Building className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No projects found</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    {searchQuery || statusFilter !== 'all' ? 'Try adjusting your search or filters' : 'Create a new project to get started'}
                  </p>
                </div>
              ) : (
                filteredProjects.map(project => (
                  <div
                    key={project.id}
                    className={`card ${selectedProjectId === project.id ? 'ring-2 ring-primary-500' : ''} transition-all hover:shadow-md`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{project.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{project.client}</p>
                      </div>
                      <span className={getStatusBadgeClass(project.status)}>
                        {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">{project.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Start Date</p>
                        <p className="text-sm font-medium">{formatDate(project.startDate)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">End Date</p>
                        <p className="text-sm font-medium">{formatDate(project.endDate)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Budget</p>
                        <p className="text-sm font-medium">{formatCurrency(project.budget)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Models</p>
                        <p className="text-sm font-medium">{project.models.length}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <button
                        className="btn-sm bg-primary-50 text-primary-700 hover:bg-primary-100 dark:bg-primary-900/30 dark:text-primary-400 dark:hover:bg-primary-900/50"
                        onClick={() => {
                          setSelectedProjectId(project.id);
                          if (project.models.length > 0) {
                            setSelectedModelId(project.models[0].id);
                            setActiveTab('viewer');
                          }
                        }}
                      >
                        View Details
                      </button>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          className="btn-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => handleExportProject(project.id)}
                          aria-label="Export project"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          className="btn-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                          onClick={() => handleDeleteProject(project.id)}
                          aria-label="Delete project"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
        
        {/* Viewer Tab */}
        {activeTab === 'viewer' && (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar - Project and Models */}
            <div className="w-full lg:w-64 shrink-0">
              <div className="card mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Project Details</h3>
                
                {selectedProject ? (
                  <div>
                    <h4 className="font-medium">{selectedProject.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-4">{selectedProject.description}</p>
                    
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Client</p>
                        <p className="text-sm font-medium">{selectedProject.client}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Location</p>
                        <p className="text-sm font-medium">{selectedProject.location}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Timeline</p>
                        <p className="text-sm font-medium">
                          {formatDate(selectedProject.startDate)} - {formatDate(selectedProject.endDate)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <h4 className="text-sm font-medium mb-2">Team</h4>
                      
                      {selectedProject.architects.length > 0 && (
                        <div className="mb-2">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Architects</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedProject.architects.map((architect, index) => (
                              <span key={index} className="text-xs px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                                {architect}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {selectedProject.engineers.length > 0 && (
                        <div className="mb-2">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Engineers</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedProject.engineers.map((engineer, index) => (
                              <span key={index} className="text-xs px-2 py-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">
                                {engineer}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {selectedProject.contractors.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Contractors</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedProject.contractors.map((contractor, index) => (
                              <span key={index} className="text-xs px-2 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full">
                                {contractor}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500 dark:text-gray-400 mb-2">No project selected</p>
                    <button
                      className="btn-sm btn-primary"
                      onClick={() => setActiveTab('projects')}
                    >
                      Select a Project
                    </button>
                  </div>
                )}
              </div>
              
              {selectedProject && (
                <div className="card">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Models</h3>
                    <button
                      className="btn-sm bg-primary-50 text-primary-700 hover:bg-primary-100 dark:bg-primary-900/30 dark:text-primary-400 dark:hover:bg-primary-900/50 flex items-center"
                      onClick={() => setIsAddModelModalOpen(true)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add
                    </button>
                  </div>
                  
                  {selectedProject.models.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        No models available for this project
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedProject.models.map(model => (
                        <div
                          key={model.id}
                          className={`flex items-center justify-between p-2 rounded-md ${selectedModelId === model.id ? 'bg-primary-50 dark:bg-primary-900/30' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                        >
                          <div className="flex items-center">
                            <button
                              className="mr-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                              onClick={() => toggleModelVisibility(model.id)}
                              aria-label={model.isVisible ? 'Hide model' : 'Show model'}
                            >
                              {model.isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                            </button>
                            
                            <button
                              className="text-left"
                              onClick={() => setSelectedModelId(model.id)}
                            >
                              <div className="font-medium text-sm">{model.name}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{model.type}</div>
                            </button>
                          </div>
                          
                          <button
                            className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                            onClick={() => handleDeleteModel(model.id)}
                            aria-label="Delete model"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Main content area - 3D Viewer and Elements */}
            <div className="flex-grow">
              {selectedModel ? (
                <div className="space-y-6">
                  {/* 3D viewer */}
                  <div className="card overflow-hidden">
                    {render3DView()}
                  </div>
                  
                  {/* Element list and controls */}
                  <div className="card">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Model Elements</h3>
                      <button
                        className="btn-sm bg-primary-50 text-primary-700 hover:bg-primary-100 dark:bg-primary-900/30 dark:text-primary-400 dark:hover:bg-primary-900/50 flex items-center"
                        onClick={() => setIsAddElementModalOpen(true)}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Element
                      </button>
                    </div>
                    
                    {selectedModel.elements.length === 0 ? (
                      <div className="text-center py-6">
                        <Layers className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">No elements in this model</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Add elements to build your model</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="table">
                          <thead>
                            <tr>
                              <th className="table-header">Name</th>
                              <th className="table-header">Type</th>
                              <th className="table-header">Material</th>
                              <th className="table-header">Dimensions</th>
                              <th className="table-header">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                            {selectedModel.elements.map(element => (
                              <tr key={element.id} className={element.isSelected ? 'bg-primary-50 dark:bg-primary-900/20' : ''}>
                                <td className="table-cell">
                                  <span className="font-medium">{element.name}</span>
                                </td>
                                <td className="table-cell capitalize">{element.type}</td>
                                <td className="table-cell capitalize">{element.material}</td>
                                <td className="table-cell">
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {element.dimensions.width} × {element.dimensions.height} × {element.dimensions.depth} m
                                  </span>
                                </td>
                                <td className="table-cell">
                                  <div className="flex items-center space-x-2">
                                    <button
                                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                      onClick={() => toggleElementSelection(element.id)}
                                      aria-label={element.isSelected ? 'Deselect element' : 'Select element'}
                                    >
                                      {element.isSelected ? (
                                        <Eye className="h-4 w-4" />
                                      ) : (
                                        <EyeOff className="h-4 w-4" />
                                      )}
                                    </button>
                                    <button
                                      className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                                      onClick={() => {
                                        setSelectedElementId(element.id);
                                        setIsElementDetailsOpen(true);
                                      }}
                                      aria-label="View element details"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </button>
                                    <button
                                      className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                                      onClick={() => handleDeleteElement(element.id)}
                                      aria-label="Delete element"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="card flex-center flex-col py-16">
                  <Building className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No Model Selected</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-6">
                    Select a project and model from the sidebar to view and edit BIM elements.
                  </p>
                  <button
                    className="btn btn-primary"
                    onClick={() => setActiveTab('projects')}
                  >
                    Browse Projects
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="stat-card">
                <div className="stat-title">Total Projects</div>
                <div className="stat-value">{projects.length}</div>
                <div className="stat-desc">
                  <span className={`${projects.length > 0 ? 'text-green-500' : 'text-gray-500'}`}>
                    {projects.length > 0 ? '↗︎ Active' : 'No projects'}
                  </span>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-title">Total Models</div>
                <div className="stat-value">
                  {projects.reduce((total, project) => total + project.models.length, 0)}
                </div>
                <div className="stat-desc">
                  <span className="text-blue-500">Across all projects</span>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-title">Total Elements</div>
                <div className="stat-value">
                  {projects.reduce((total, project) => {
                    return total + project.models.reduce((modelTotal, model) => {
                      return modelTotal + model.elements.length;
                    }, 0);
                  }, 0)}
                </div>
                <div className="stat-desc">
                  <span className="text-amber-500">Building components</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Material Distribution</h3>
                {renderMaterialChart()}
              </div>
              
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Element Types</h3>
                {renderElementTypeChart()}
              </div>
            </div>
            
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Model Progress</h3>
              {renderModelProgressChart()}
            </div>
            
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Project Status Overview</h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {(['planning', 'design', 'construction', 'complete'] as ProjectStatus[]).map(status => {
                  const count = projects.filter(p => p.status === status).length;
                  const percentage = projects.length > 0 ? (count / projects.length) * 100 : 0;
                  
                  return (
                    <div key={status} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                      <div className="text-sm font-medium text-gray-500 dark:text-gray-400 capitalize">{status}</div>
                      <div className="text-2xl font-bold mt-1">{count}</div>
                      <div className="text-xs text-gray-500 mt-1">{percentage.toFixed(0)}% of projects</div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-2">
                        <div
                          className="bg-primary-600 h-1.5 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th className="table-header">Project Name</th>
                      <th className="table-header">Client</th>
                      <th className="table-header">Status</th>
                      <th className="table-header">Models</th>
                      <th className="table-header">Elements</th>
                      <th className="table-header">Budget</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                    {projects.map(project => (
                      <tr key={project.id}>
                        <td className="table-cell font-medium">{project.name}</td>
                        <td className="table-cell">{project.client}</td>
                        <td className="table-cell">
                          <span className={getStatusBadgeClass(project.status)}>
                            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                          </span>
                        </td>
                        <td className="table-cell">{project.models.length}</td>
                        <td className="table-cell">
                          {project.models.reduce((total, model) => total + model.elements.length, 0)}
                        </td>
                        <td className="table-cell">{formatCurrency(project.budget)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        
        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto">
            <div className="card mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Display Settings</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">Dark Mode</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Toggle between light and dark appearance</p>
                  </div>
                  <button
                    onClick={toggleDarkMode}
                    className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-700"
                  >
                    <span
                      className={`${isDarkMode ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition`}
                    />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="card mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Project Management</h3>
              
              <div className="space-y-6">
                <div>
                  <button
                    className="btn bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 w-full flex items-center justify-center"
                    onClick={handleDownloadTemplate}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Project Template
                  </button>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Download a template JSON file that you can use as a starting point for importing projects.
                  </p>
                </div>
                
                <div>
                  <label
                    className="btn bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 w-full flex items-center justify-center cursor-pointer"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Import Project from JSON
                    <input
                      type="file"
                      accept=".json"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Import a project from a JSON file. The file should match the template structure.
                  </p>
                </div>
                
                <div>
                  <button
                    className="btn bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 w-full flex items-center justify-center"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to reset all data? This will delete all projects and cannot be undone.')) {
                        setProjects([]);
                        setSelectedProjectId(null);
                        setSelectedModelId(null);
                        setSelectedElementId(null);
                        setActiveTab('projects');
                        localStorage.removeItem('bimProjects');
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Reset All Data
                  </button>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    This will delete all projects and reset the application to its initial state.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">About BIM Modeling System</h3>
              
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p>
                  The Building Information Modeling (BIM) System is a powerful tool for creating, managing, and analyzing
                  3D models of building projects. This system allows for efficient collaboration between architects,
                  engineers, and contractors throughout the project lifecycle.
                </p>
                
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                  Version 1.0.0
                </p>
                
                <div className="flex items-center mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <User className="h-8 w-8 text-gray-400 mr-4" />
                  <div>
                    <h4 className="text-sm font-medium">Developed by</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Datavtar Private Limited</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 shadow-sm py-4 mt-auto theme-transition">
        <div className="container-fluid">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Copyright © 2025 of Datavtar Private Limited. All rights reserved.
            </p>
            
            <div className="flex items-center space-x-4">
              <button
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                onClick={() => setActiveTab('projects')}
              >
                Projects
              </button>
              <button
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                onClick={() => setActiveTab('analytics')}
              >
                Analytics
              </button>
              <button
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                onClick={() => setActiveTab('settings')}
              >
                Settings
              </button>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Add Project Modal */}
      {isAddProjectModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content max-w-md" ref={modalRef}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Add New Project</h3>
              <button
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                onClick={() => setIsAddProjectModalOpen(false)}
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); handleAddProject(); }}>
              <div className="space-y-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="projectName">Project Name</label>
                  <input
                    id="projectName"
                    type="text"
                    className="input"
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="projectDescription">Description</label>
                  <textarea
                    id="projectDescription"
                    className="input"
                    rows={3}
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  ></textarea>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label" htmlFor="projectClient">Client</label>
                    <input
                      id="projectClient"
                      type="text"
                      className="input"
                      value={newProject.client}
                      onChange={(e) => setNewProject({ ...newProject, client: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="projectLocation">Location</label>
                    <input
                      id="projectLocation"
                      type="text"
                      className="input"
                      value={newProject.location}
                      onChange={(e) => setNewProject({ ...newProject, location: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label" htmlFor="projectStartDate">Start Date</label>
                    <input
                      id="projectStartDate"
                      type="date"
                      className="input"
                      value={newProject.startDate}
                      onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="projectEndDate">End Date</label>
                    <input
                      id="projectEndDate"
                      type="date"
                      className="input"
                      value={newProject.endDate}
                      onChange={(e) => setNewProject({ ...newProject, endDate: e.target.value })}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label" htmlFor="projectStatus">Status</label>
                    <select
                      id="projectStatus"
                      className="input"
                      value={newProject.status}
                      onChange={(e) => setNewProject({ ...newProject, status: e.target.value as ProjectStatus })}
                    >
                      <option value="planning">Planning</option>
                      <option value="design">Design</option>
                      <option value="construction">Construction</option>
                      <option value="complete">Complete</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="projectBudget">Budget</label>
                    <input
                      id="projectBudget"
                      type="number"
                      className="input"
                      value={newProject.budget}
                      onChange={(e) => setNewProject({ ...newProject, budget: Number(e.target.value) })}
                      min="0"
                      step="1000"
                      required
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="projectArchitects">Architects (comma-separated)</label>
                  <input
                    id="projectArchitects"
                    type="text"
                    className="input"
                    placeholder="Architect 1, Architect 2, ..."
                    value={newProject.architects.join(', ')}
                    onChange={(e) => handleTeamInput('architects', e.target.value)}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="projectEngineers">Engineers (comma-separated)</label>
                  <input
                    id="projectEngineers"
                    type="text"
                    className="input"
                    placeholder="Engineer 1, Engineer 2, ..."
                    value={newProject.engineers.join(', ')}
                    onChange={(e) => handleTeamInput('engineers', e.target.value)}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="projectContractors">Contractors (comma-separated)</label>
                  <input
                    id="projectContractors"
                    type="text"
                    className="input"
                    placeholder="Contractor 1, Contractor 2, ..."
                    value={newProject.contractors.join(', ')}
                    onChange={(e) => handleTeamInput('contractors', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                  onClick={() => setIsAddProjectModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!newProject.name || !newProject.client || !newProject.startDate || !newProject.endDate}
                >
                  <Save className="h-4 w-4 mr-1" />
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Add Model Modal */}
      {isAddModelModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content max-w-md" ref={modalRef}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Add New Model</h3>
              <button
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                onClick={() => setIsAddModelModalOpen(false)}
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); handleAddModel(); }}>
              <div className="space-y-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="modelName">Model Name</label>
                  <input
                    id="modelName"
                    type="text"
                    className="input"
                    value={newModel.name}
                    onChange={(e) => setNewModel({ ...newModel, name: e.target.value })}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="modelType">Model Type</label>
                  <select
                    id="modelType"
                    className="input"
                    value={newModel.type}
                    onChange={(e) => setNewModel({ ...newModel, type: e.target.value })}
                    required
                  >
                    <option value="">Select a type</option>
                    <option value="architectural">Architectural</option>
                    <option value="structural">Structural</option>
                    <option value="mechanical">Mechanical</option>
                    <option value="electrical">Electrical</option>
                    <option value="plumbing">Plumbing</option>
                    <option value="planning">Planning</option>
                    <option value="interior">Interior</option>
                    <option value="landscape">Landscape</option>
                    <option value="coordination">Coordination</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="modelDescription">Description</label>
                  <textarea
                    id="modelDescription"
                    className="input"
                    rows={3}
                    value={newModel.description}
                    onChange={(e) => setNewModel({ ...newModel, description: e.target.value })}
                  ></textarea>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label" htmlFor="modelAuthor">Author</label>
                    <input
                      id="modelAuthor"
                      type="text"
                      className="input"
                      value={newModel.author}
                      onChange={(e) => setNewModel({ ...newModel, author: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="modelVersion">Version</label>
                    <input
                      id="modelVersion"
                      type="text"
                      className="input"
                      value={newModel.version}
                      onChange={(e) => setNewModel({ ...newModel, version: e.target.value })}
                      placeholder="1.0.0"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label" htmlFor="modelCreatedDate">Date Created</label>
                    <input
                      id="modelCreatedDate"
                      type="date"
                      className="input"
                      value={newModel.dateCreated}
                      onChange={(e) => setNewModel({ ...newModel, dateCreated: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="modelModifiedDate">Date Modified</label>
                    <input
                      id="modelModifiedDate"
                      type="date"
                      className="input"
                      value={newModel.dateModified}
                      onChange={(e) => setNewModel({ ...newModel, dateModified: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                  onClick={() => setIsAddModelModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!newModel.name || !newModel.type || !newModel.author}
                >
                  <Save className="h-4 w-4 mr-1" />
                  Add Model
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Add Element Modal */}
      {isAddElementModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content max-w-lg" ref={modalRef}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Add New Element</h3>
              <button
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                onClick={() => setIsAddElementModalOpen(false)}
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); handleAddElement(); }}>
              <div className="space-y-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="elementName">Element Name</label>
                  <input
                    id="elementName"
                    type="text"
                    className="input"
                    value={newElement.name}
                    onChange={(e) => setNewElement({ ...newElement, name: e.target.value })}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label" htmlFor="elementType">Element Type</label>
                    <select
                      id="elementType"
                      className="input"
                      value={newElement.type}
                      onChange={(e) => setNewElement({ ...newElement, type: e.target.value })}
                      required
                    >
                      <option value="">Select a type</option>
                      <option value="wall">Wall</option>
                      <option value="floor">Floor</option>
                      <option value="ceiling">Ceiling</option>
                      <option value="column">Column</option>
                      <option value="beam">Beam</option>
                      <option value="door">Door</option>
                      <option value="window">Window</option>
                      <option value="roof">Roof</option>
                      <option value="foundation">Foundation</option>
                      <option value="furniture">Furniture</option>
                      <option value="equipment">Equipment</option>
                      <option value="pipe">Pipe</option>
                      <option value="duct">Duct</option>
                      <option value="stair">Stair</option>
                      <option value="railing">Railing</option>
                      <option value="footprint">Footprint</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="elementMaterial">Material</label>
                    <select
                      id="elementMaterial"
                      className="input"
                      value={newElement.material}
                      onChange={(e) => setNewElement({ ...newElement, material: e.target.value as MaterialType })}
                      required
                    >
                      <option value="concrete">Concrete</option>
                      <option value="steel">Steel</option>
                      <option value="wood">Wood</option>
                      <option value="glass">Glass</option>
                      <option value="brick">Brick</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="form-group">
                    <label className="form-label" htmlFor="elementWidth">Width (m)</label>
                    <input
                      id="elementWidth"
                      type="number"
                      className="input"
                      value={newElement.dimensions.width}
                      onChange={(e) => setNewElement({
                        ...newElement,
                        dimensions: {
                          ...newElement.dimensions,
                          width: Number(e.target.value)
                        }
                      })}
                      step="0.1"
                      min="0.1"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="elementHeight">Height (m)</label>
                    <input
                      id="elementHeight"
                      type="number"
                      className="input"
                      value={newElement.dimensions.height}
                      onChange={(e) => setNewElement({
                        ...newElement,
                        dimensions: {
                          ...newElement.dimensions,
                          height: Number(e.target.value)
                        }
                      })}
                      step="0.1"
                      min="0.1"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="elementDepth">Depth (m)</label>
                    <input
                      id="elementDepth"
                      type="number"
                      className="input"
                      value={newElement.dimensions.depth}
                      onChange={(e) => setNewElement({
                        ...newElement,
                        dimensions: {
                          ...newElement.dimensions,
                          depth: Number(e.target.value)
                        }
                      })}
                      step="0.1"
                      min="0.1"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="form-group">
                    <label className="form-label" htmlFor="positionX">Position X</label>
                    <input
                      id="positionX"
                      type="number"
                      className="input"
                      value={newElement.position.x}
                      onChange={(e) => setNewElement({
                        ...newElement,
                        position: {
                          ...newElement.position,
                          x: Number(e.target.value)
                        }
                      })}
                      step="0.1"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="positionY">Position Y</label>
                    <input
                      id="positionY"
                      type="number"
                      className="input"
                      value={newElement.position.y}
                      onChange={(e) => setNewElement({
                        ...newElement,
                        position: {
                          ...newElement.position,
                          y: Number(e.target.value)
                        }
                      })}
                      step="0.1"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="positionZ">Position Z</label>
                    <input
                      id="positionZ"
                      type="number"
                      className="input"
                      value={newElement.position.z}
                      onChange={(e) => setNewElement({
                        ...newElement,
                        position: {
                          ...newElement.position,
                          z: Number(e.target.value)
                        }
                      })}
                      step="0.1"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="form-group">
                    <label className="form-label" htmlFor="rotationX">Rotation X (deg)</label>
                    <input
                      id="rotationX"
                      type="number"
                      className="input"
                      value={newElement.rotation.x}
                      onChange={(e) => setNewElement({
                        ...newElement,
                        rotation: {
                          ...newElement.rotation,
                          x: Number(e.target.value)
                        }
                      })}
                      step="1"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="rotationY">Rotation Y (deg)</label>
                    <input
                      id="rotationY"
                      type="number"
                      className="input"
                      value={newElement.rotation.y}
                      onChange={(e) => setNewElement({
                        ...newElement,
                        rotation: {
                          ...newElement.rotation,
                          y: Number(e.target.value)
                        }
                      })}
                      step="1"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="rotationZ">Rotation Z (deg)</label>
                    <input
                      id="rotationZ"
                      type="number"
                      className="input"
                      value={newElement.rotation.z}
                      onChange={(e) => setNewElement({
                        ...newElement,
                        rotation: {
                          ...newElement.rotation,
                          z: Number(e.target.value)
                        }
                      })}
                      step="1"
                      required
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Custom Properties</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      className="input"
                      placeholder="Property name"
                      value={propertyKey}
                      onChange={(e) => setPropertyKey(e.target.value)}
                    />
                    <input
                      type="text"
                      className="input"
                      placeholder="Property value"
                      value={propertyValue}
                      onChange={(e) => setPropertyValue(e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn-sm bg-primary-50 text-primary-700 hover:bg-primary-100 dark:bg-primary-900/30 dark:text-primary-400 dark:hover:bg-primary-900/50"
                      onClick={handleAddProperty}
                      disabled={!propertyKey || !propertyValue}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {Object.keys(newElement.properties).length > 0 ? (
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-3 space-y-2">
                      {Object.entries(newElement.properties).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-center">
                          <div>
                            <span className="text-sm font-medium">{key}: </span>
                            <span className="text-sm text-gray-600 dark:text-gray-300">{value.toString()}</span>
                          </div>
                          <button
                            type="button"
                            className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                            onClick={() => handleDeleteProperty(key)}
                            aria-label="Delete property"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-md">
                      No properties added yet
                    </div>
                  )}
                </div>
              </div>
              
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                  onClick={() => setIsAddElementModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!newElement.name || !newElement.type}
                >
                  <Save className="h-4 w-4 mr-1" />
                  Add Element
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Element Details Modal */}
      {isElementDetailsOpen && selectedElement && (
        <div className="modal-backdrop">
          <div className="modal-content max-w-lg" ref={modalRef}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">{selectedElement.name}</h3>
              <button
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                onClick={() => setIsElementDetailsOpen(false)}
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Type</h4>
                  <p className="text-base font-medium capitalize">{selectedElement.type}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Material</h4>
                  <p className="text-base font-medium capitalize">{selectedElement.material}</p>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Dimensions</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-3 text-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400 block">Width</span>
                    <span className="text-lg font-medium">{selectedElement.dimensions.width} m</span>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-3 text-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400 block">Height</span>
                    <span className="text-lg font-medium">{selectedElement.dimensions.height} m</span>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-3 text-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400 block">Depth</span>
                    <span className="text-lg font-medium">{selectedElement.dimensions.depth} m</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Position</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-3 text-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400 block">X</span>
                    <span className="text-base font-medium">{selectedElement.position.x}</span>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-3 text-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400 block">Y</span>
                    <span className="text-base font-medium">{selectedElement.position.y}</span>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-3 text-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400 block">Z</span>
                    <span className="text-base font-medium">{selectedElement.position.z}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Rotation (degrees)</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-3 text-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400 block">X</span>
                    <span className="text-base font-medium">{selectedElement.rotation.x}°</span>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-3 text-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400 block">Y</span>
                    <span className="text-base font-medium">{selectedElement.rotation.y}°</span>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-3 text-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400 block">Z</span>
                    <span className="text-base font-medium">{selectedElement.rotation.z}°</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Properties</h4>
                {Object.keys(selectedElement.properties).length > 0 ? (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-4 space-y-2">
                    {Object.entries(selectedElement.properties).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center">
                        <span className="text-sm font-medium">{key}:</span>
                        <span className="text-sm">{value.toString()}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-md">
                    No custom properties
                  </div>
                )}
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-4 text-center">
                <div className="inline-block w-16 h-16 rounded-md" style={{ backgroundColor: getMaterialColor(selectedElement.material) }}></div>
                <p className="text-sm mt-2 text-gray-500 dark:text-gray-400">Material visualization</p>
              </div>
            </div>
            
            <div className="modal-footer">
              <button
                type="button"
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                onClick={() => setIsElementDetailsOpen(false)}
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  toggleElementSelection(selectedElement.id);
                  setIsElementDetailsOpen(false);
                }}
              >
                <Eye className="h-4 w-4 mr-1" />
                {selectedElement.isSelected ? 'Hide in Viewer' : 'Show in Viewer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
