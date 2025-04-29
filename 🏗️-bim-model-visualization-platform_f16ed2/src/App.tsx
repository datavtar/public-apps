import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Grid, Box, Sphere, Cylinder, Text } from '@react-three/drei';
import { Trash2, Settings, Download, Upload, Plus, ArrowLeftRight, UserPlus, Database, Palette, UserRound, Building, Menu, X, ArrowDown, ChevronDown, Check } from 'lucide-react';
import styles from './styles/styles.module.css';

// Types
type ModelElement = {
  id: string;
  type: 'box' | 'sphere' | 'cylinder';
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  color: string;
  name: string;
};

type Project = {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  elements: ModelElement[];
};

type User = {
  id: string;
  name: string;
  role: 'architect' | 'engineer' | 'contractor' | 'client';
};

// Main App Component
const App: React.FC = () => {
  // State management
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode === 'true' || 
      (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [selectedElement, setSelectedElement] = useState<ModelElement | null>(null);
  const [showElementPanel, setShowElementPanel] = useState<boolean>(false);
  const [showProjectPanel, setShowProjectPanel] = useState<boolean>(false);
  const [showTeamPanel, setShowTeamPanel] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [colorPalette, setColorPalette] = useState<string[]>(['#FF5733', '#33FF57', '#3357FF', '#F3FF33', '#FF33F3']);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [newMemberName, setNewMemberName] = useState<string>('');
  const [newMemberRole, setNewMemberRole] = useState<'architect' | 'engineer' | 'contractor' | 'client'>('architect');
  
  // Element editing form state
  const [elementForm, setElementForm] = useState<{
    name: string;
    type: 'box' | 'sphere' | 'cylinder';
    color: string;
    posX: number;
    posY: number;
    posZ: number;
    rotX: number;
    rotY: number;
    rotZ: number;
    scaleX: number;
    scaleY: number;
    scaleZ: number;
  }>({
    name: '',
    type: 'box',
    color: '#FF5733',
    posX: 0,
    posY: 0,
    posZ: 0,
    rotX: 0,
    rotY: 0,
    rotZ: 0,
    scaleX: 1,
    scaleY: 1,
    scaleZ: 1
  });

  // Project form state
  const [projectForm, setProjectForm] = useState<{
    name: string;
    description: string;
  }>({
    name: '',
    description: ''
  });
  
  // Canvas click handler ref
  const clickHandlerRef = useRef<((event: MouseEvent) => void) | null>(null);

  // Load data from localStorage on component mount
  useEffect(() => {
    try {
      const savedProjects = localStorage.getItem('bimProjects');
      if (savedProjects) {
        setProjects(JSON.parse(savedProjects));
      } else {
        // Initialize with a demo project if none exists
        const demoProject: Project = {
          id: generateId(),
          name: 'Demo Building',
          description: 'A sample building model to get started with',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          elements: [
            {
              id: generateId(),
              type: 'box',
              position: [0, 0, 0],
              rotation: [0, 0, 0],
              scale: [5, 0.2, 5],
              color: '#999999',
              name: 'Floor'
            },
            {
              id: generateId(),
              type: 'box',
              position: [-2, 1, -2],
              rotation: [0, 0, 0],
              scale: [0.2, 2, 0.2],
              color: '#FF5733',
              name: 'Column 1'
            },
            {
              id: generateId(),
              type: 'box',
              position: [2, 1, -2],
              rotation: [0, 0, 0],
              scale: [0.2, 2, 0.2],
              color: '#FF5733',
              name: 'Column 2'
            },
            {
              id: generateId(),
              type: 'box',
              position: [2, 1, 2],
              rotation: [0, 0, 0],
              scale: [0.2, 2, 0.2],
              color: '#FF5733',
              name: 'Column 3'
            },
            {
              id: generateId(),
              type: 'box',
              position: [-2, 1, 2],
              rotation: [0, 0, 0],
              scale: [0.2, 2, 0.2],
              color: '#FF5733',
              name: 'Column 4'
            },
            {
              id: generateId(),
              type: 'box',
              position: [0, 2.1, 0],
              rotation: [0, 0, 0],
              scale: [5, 0.2, 5],
              color: '#999999',
              name: 'Ceiling'
            }
          ]
        };
        setProjects([demoProject]);
        localStorage.setItem('bimProjects', JSON.stringify([demoProject]));
      }
      
      const savedTeamMembers = localStorage.getItem('bimTeamMembers');
      if (savedTeamMembers) {
        setTeamMembers(JSON.parse(savedTeamMembers));
      } else {
        // Initialize with demo team members
        const demoTeamMembers: User[] = [
          { id: generateId(), name: 'John Architect', role: 'architect' },
          { id: generateId(), name: 'Sarah Engineer', role: 'engineer' }
        ];
        setTeamMembers(demoTeamMembers);
        localStorage.setItem('bimTeamMembers', JSON.stringify(demoTeamMembers));
      }
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
    }
  }, []);

  // Apply dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  // Update localStorage when projects change
  useEffect(() => {
    if (projects.length > 0) {
      localStorage.setItem('bimProjects', JSON.stringify(projects));
    }
  }, [projects]);

  // Update localStorage when team members change
  useEffect(() => {
    localStorage.setItem('bimTeamMembers', JSON.stringify(teamMembers));
  }, [teamMembers]);

  // Set current project if none is selected and projects exist
  useEffect(() => {
    if (!currentProject && projects.length > 0) {
      setCurrentProject(projects[0]);
    }
  }, [currentProject, projects]);

  // Update form when selected element changes
  useEffect(() => {
    if (selectedElement) {
      setElementForm({
        name: selectedElement.name,
        type: selectedElement.type,
        color: selectedElement.color,
        posX: selectedElement.position[0],
        posY: selectedElement.position[1],
        posZ: selectedElement.position[2],
        rotX: selectedElement.rotation[0],
        rotY: selectedElement.rotation[1],
        rotZ: selectedElement.rotation[2],
        scaleX: selectedElement.scale[0],
        scaleY: selectedElement.scale[1],
        scaleZ: selectedElement.scale[2]
      });
      setShowElementPanel(true);
    }
  }, [selectedElement]);

  // Generate a unique ID
  const generateId = (): string => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  // Create a new project
  const createProject = () => {
    const newProject: Project = {
      id: generateId(),
      name: projectForm.name,
      description: projectForm.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      elements: []
    };
    
    setProjects([...projects, newProject]);
    setCurrentProject(newProject);
    setProjectForm({ name: '', description: '' });
    setShowProjectPanel(false);
  };

  // Update the current project
  const updateProject = () => {
    if (!currentProject) return;
    
    const updatedProject: Project = {
      ...currentProject,
      name: projectForm.name,
      description: projectForm.description,
      updatedAt: new Date().toISOString()
    };
    
    setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
    setCurrentProject(updatedProject);
    setShowProjectPanel(false);
  };

  // Delete the current project
  const deleteProject = (projectId: string) => {
    const updatedProjects = projects.filter(p => p.id !== projectId);
    setProjects(updatedProjects);
    
    if (currentProject?.id === projectId) {
      setCurrentProject(updatedProjects.length > 0 ? updatedProjects[0] : null);
    }
  };

  // Add a new element to the current project
  const addElement = () => {
    if (!currentProject) return;
    
    const newElement: ModelElement = {
      id: generateId(),
      type: elementForm.type,
      position: [elementForm.posX, elementForm.posY, elementForm.posZ],
      rotation: [elementForm.rotX, elementForm.rotY, elementForm.rotZ],
      scale: [elementForm.scaleX, elementForm.scaleY, elementForm.scaleZ],
      color: elementForm.color,
      name: elementForm.name || `New ${elementForm.type}`
    };
    
    const updatedProject: Project = {
      ...currentProject,
      elements: [...currentProject.elements, newElement],
      updatedAt: new Date().toISOString()
    };
    
    setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
    setCurrentProject(updatedProject);
    setSelectedElement(null);
    setShowElementPanel(false);
    resetElementForm();
  };

  // Update an existing element
  const updateElement = () => {
    if (!currentProject || !selectedElement) return;
    
    const updatedElement: ModelElement = {
      ...selectedElement,
      type: elementForm.type,
      position: [elementForm.posX, elementForm.posY, elementForm.posZ],
      rotation: [elementForm.rotX, elementForm.rotY, elementForm.rotZ],
      scale: [elementForm.scaleX, elementForm.scaleY, elementForm.scaleZ],
      color: elementForm.color,
      name: elementForm.name
    };
    
    const updatedProject: Project = {
      ...currentProject,
      elements: currentProject.elements.map(e => e.id === updatedElement.id ? updatedElement : e),
      updatedAt: new Date().toISOString()
    };
    
    setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
    setCurrentProject(updatedProject);
    setSelectedElement(null);
    setShowElementPanel(false);
    resetElementForm();
  };

  // Delete an element
  const deleteElement = (elementId: string) => {
    if (!currentProject) return;
    
    const updatedProject: Project = {
      ...currentProject,
      elements: currentProject.elements.filter(e => e.id !== elementId),
      updatedAt: new Date().toISOString()
    };
    
    setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
    setCurrentProject(updatedProject);
    
    if (selectedElement?.id === elementId) {
      setSelectedElement(null);
      setShowElementPanel(false);
    }
  };

  // Reset the element form to default values
  const resetElementForm = () => {
    setElementForm({
      name: '',
      type: 'box',
      color: colorPalette[0],
      posX: 0,
      posY: 0,
      posZ: 0,
      rotX: 0,
      rotY: 0,
      rotZ: 0,
      scaleX: 1,
      scaleY: 1,
      scaleZ: 1
    });
  };

  // Edit an existing project
  const editProject = (project: Project) => {
    setProjectForm({
      name: project.name,
      description: project.description
    });
    setShowProjectPanel(true);
  };

  // Add a new team member
  const addTeamMember = () => {
    if (!newMemberName.trim()) return;
    
    const newMember: User = {
      id: generateId(),
      name: newMemberName,
      role: newMemberRole
    };
    
    setTeamMembers([...teamMembers, newMember]);
    setNewMemberName('');
  };

  // Delete a team member
  const deleteTeamMember = (memberId: string) => {
    setTeamMembers(teamMembers.filter(m => m.id !== memberId));
  };

  // Export current project to JSON
  const exportProject = () => {
    if (!currentProject) return;
    
    const dataStr = JSON.stringify(currentProject, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileDefaultName = `${currentProject.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Import project from JSON file
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileInput = event.target;
    const file = fileInput.files?.[0];
    
    if (!file) {
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result;
        if (typeof result === 'string') {
          const importedProject: Project = JSON.parse(result);
          // Ensure the imported project has all required fields
          if (!importedProject.id || !importedProject.name) {
            throw new Error('Invalid project file format');
          }
          
          // Check if project with same ID already exists
          const existingProjectIndex = projects.findIndex(p => p.id === importedProject.id);
          let updatedProjects: Project[];
          
          if (existingProjectIndex >= 0) {
            // Update existing project
            updatedProjects = [...projects];
            updatedProjects[existingProjectIndex] = {
              ...importedProject,
              updatedAt: new Date().toISOString()
            };
          } else {
            // Add as new project
            updatedProjects = [...projects, {
              ...importedProject,
              id: generateId(), // Generate new ID to avoid conflicts
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }];
          }
          
          setProjects(updatedProjects);
          setCurrentProject(updatedProjects[updatedProjects.length - 1]);
        }
      } catch (error) {
        console.error('Error importing project:', error);
        alert('Error importing project. Please check the file format.');
      }
    };
    reader.readAsText(file);
    
    // Reset the input value to allow uploading the same file again
    fileInput.value = '';
  };

  // Handle model element click
  const handleModelElementClick = (element: ModelElement) => {
    setSelectedElement(element);
  };

  // Memo to avoid frequent re-rendering of model
  const modelElements = useMemo(() => {
    if (!currentProject) return null;
    
    return currentProject.elements.map(element => {
      const isSelected = selectedElement?.id === element.id;
      const elementColor = isSelected ? '#00FFFF' : element.color;
      
      switch (element.type) {
        case 'box':
          return (
            <Box
              key={element.id}
              position={element.position}
              rotation={element.rotation}
              scale={element.scale}
              onClick={(e) => {
                e.stopPropagation();
                handleModelElementClick(element);
              }}
            >
              <meshStandardMaterial 
                color={elementColor} 
                opacity={isSelected ? 0.8 : 1} 
                transparent={isSelected}
              />
              <Text
                position={[0, Math.max(...element.scale) / 2 + 0.2, 0]}
                color="#ffffff"
                fontSize={0.2}
                anchorX="center"
                anchorY="middle"
                visible={isSelected}
              >
                {element.name}
              </Text>
            </Box>
          );
        case 'sphere':
          return (
            <Sphere
              key={element.id}
              position={element.position}
              rotation={element.rotation}
              scale={element.scale}
              onClick={(e) => {
                e.stopPropagation();
                handleModelElementClick(element);
              }}
            >
              <meshStandardMaterial 
                color={elementColor} 
                opacity={isSelected ? 0.8 : 1} 
                transparent={isSelected}
              />
              <Text
                position={[0, Math.max(...element.scale) / 2 + 0.2, 0]}
                color="#ffffff"
                fontSize={0.2}
                anchorX="center"
                anchorY="middle"
                visible={isSelected}
              >
                {element.name}
              </Text>
            </Sphere>
          );
        case 'cylinder':
          return (
            <Cylinder
              key={element.id}
              position={element.position}
              rotation={element.rotation}
              scale={element.scale}
              onClick={(e) => {
                e.stopPropagation();
                handleModelElementClick(element);
              }}
            >
              <meshStandardMaterial 
                color={elementColor} 
                opacity={isSelected ? 0.8 : 1} 
                transparent={isSelected}
              />
              <Text
                position={[0, Math.max(...element.scale) / 2 + 0.2, 0]}
                color="#ffffff"
                fontSize={0.2}
                anchorX="center"
                anchorY="middle"
                visible={isSelected}
              >
                {element.name}
              </Text>
            </Cylinder>
          );
        default:
          return null;
      }
    });
  }, [currentProject, selectedElement]);

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle canvas click to deselect element
  useEffect(() => {
    const handleCanvasClick = (event: MouseEvent) => {
      // Only deselect if clicking directly on the canvas, not on an element
      const target = event.target as HTMLElement;
      if (target.tagName === 'CANVAS') {
        setSelectedElement(null);
      }
    };

    // Store the handler in the ref for cleanup
    clickHandlerRef.current = handleCanvasClick;

    // Add the event listener
    document.addEventListener('click', handleCanvasClick);

    // Cleanup function
    return () => {
      if (clickHandlerRef.current) {
        document.removeEventListener('click', clickHandlerRef.current);
      }
    };
  }, []);

  // Close any panel when escape key is pressed
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowElementPanel(false);
        setShowProjectPanel(false);
        setShowTeamPanel(false);
        setSelectedElement(null);
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => {
      window.removeEventListener('keydown', handleEscKey);
    };
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-slate-900 overflow-hidden">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm z-10">
        <div className="container-fluid py-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div className="flex items-center">
              <button 
                className="md:hidden btn-sm mr-2 text-gray-600 dark:text-gray-400"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              <div className="flex items-center">
                <Building size={24} className="text-primary-600 dark:text-primary-400 mr-2" />
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">BIM Modeller</h1>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              {/* Project Selection Dropdown */}
              <div className="relative">
                <button 
                  className="btn bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-white flex items-center gap-2"
                  onClick={() => document.getElementById('project-dropdown')?.classList.toggle('hidden')}
                  aria-haspopup="true"
                  aria-expanded="false"
                >
                  <Database size={16} />
                  <span className="truncate max-w-[150px]">{currentProject?.name || 'Select Project'}</span>
                  <ArrowDown size={14} />
                </button>
                <div 
                  id="project-dropdown" 
                  className="hidden absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-slate-800 ring-1 ring-black ring-opacity-5 z-[var(--z-dropdown)]"
                >
                  <div className="py-1">
                    {projects.map(project => (
                      <button
                        key={project.id}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700"
                        onClick={() => {
                          setCurrentProject(project);
                          document.getElementById('project-dropdown')?.classList.add('hidden');
                        }}
                      >
                        {project.name}
                      </button>
                    ))}
                    <div className="border-t border-gray-200 dark:border-slate-700 my-1"></div>
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-primary-600 dark:text-primary-400 flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-slate-700"
                      onClick={() => {
                        setProjectForm({ name: '', description: '' });
                        setShowProjectPanel(true);
                        document.getElementById('project-dropdown')?.classList.add('hidden');
                      }}
                    >
                      <Plus size={16} />
                      <span>New Project</span>
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Import/Export Buttons */}
              <div className="flex items-center gap-1">
                <button 
                  className="btn-sm bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-white flex items-center justify-center gap-1"
                  onClick={exportProject}
                  disabled={!currentProject}
                  title="Export Project"
                  aria-label="Export Project"
                >
                  <Download size={16} />
                  <span className="responsive-hide">Export</span>
                </button>
                
                <label className="btn-sm bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-white flex items-center justify-center gap-1 cursor-pointer">
                  <Upload size={16} />
                  <span className="responsive-hide">Import</span>
                  <input 
                    type="file" 
                    accept=".json" 
                    className="hidden" 
                    onChange={handleFileUpload}
                    aria-label="Import Project"
                  />
                </label>
              </div>
              
              {/* Team Button */}
              <button 
                className="btn-sm bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-white flex items-center justify-center gap-1"
                onClick={() => setShowTeamPanel(true)}
                aria-label="Manage Team"
              >
                <UserPlus size={16} />
                <span className="responsive-hide">Team</span>
              </button>
              
              {/* Dark Mode Toggle */}
              <button 
                className="theme-toggle" 
                onClick={() => setIsDarkMode(!isDarkMode)}
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                <span className="theme-toggle-thumb"></span>
                <span className="sr-only">
                  {isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 p-3">
          <div className="space-y-2">
            <button 
              className="w-full btn-sm bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-white flex items-center gap-2 justify-start"
              onClick={() => {
                setShowElementPanel(true);
                setIsMenuOpen(false);
                resetElementForm();
              }}
            >
              <Plus size={16} />
              <span>Add Element</span>
            </button>
            <button 
              className="w-full btn-sm bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-white flex items-center gap-2 justify-start"
              onClick={() => {
                if (currentProject) {
                  editProject(currentProject);
                  setIsMenuOpen(false);
                }
              }}
              disabled={!currentProject}
            >
              <Settings size={16} />
              <span>Edit Project</span>
            </button>
            <button 
              className="w-full btn-sm bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-white flex items-center gap-2 justify-start"
              onClick={() => {
                setShowTeamPanel(true);
                setIsMenuOpen(false);
              }}
            >
              <UserPlus size={16} />
              <span>Manage Team</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="hidden md:block w-64 bg-white dark:bg-slate-800 shadow-sm overflow-y-auto">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Project</h2>
              <div className="flex gap-1">
                <button 
                  className="btn-sm bg-primary-50 dark:bg-primary-900 text-primary-600 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-800"
                  onClick={() => {
                    if (currentProject) {
                      editProject(currentProject);
                    }
                  }}
                  disabled={!currentProject}
                  aria-label="Edit Project"
                >
                  <Settings size={16} />
                </button>
              </div>
            </div>
            
            {currentProject && (
              <div className="space-y-2 mb-6">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <p className="font-medium text-gray-900 dark:text-white">{currentProject.name}</p>
                  <p className="mt-1">{currentProject.description}</p>
                  <p className="mt-2 text-xs">Last updated: {formatDate(currentProject.updatedAt)}</p>
                </div>
              </div>
            )}
            
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Elements</h2>
              <button 
                className="btn-sm bg-primary-50 dark:bg-primary-900 text-primary-600 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-800"
                onClick={() => {
                  setShowElementPanel(true);
                  resetElementForm();
                }}
                disabled={!currentProject}
                aria-label="Add Element"
              >
                <Plus size={16} />
              </button>
            </div>
            
            {currentProject && currentProject.elements.length > 0 ? (
              <ul className="space-y-1">
                {currentProject.elements.map(element => (
                  <li 
                    key={element.id} 
                    className={`p-2 rounded-md cursor-pointer flex justify-between items-center ${selectedElement?.id === element.id ? 'bg-primary-50 dark:bg-primary-900 text-primary-600 dark:text-primary-300' : 'hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300'}`}
                    onClick={() => setSelectedElement(element)}
                  >
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: element.color }}
                      ></div>
                      <span className="truncate">{element.name}</span>
                    </div>
                    <button 
                      className="text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteElement(element.id);
                      }}
                      aria-label={`Delete ${element.name}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400 italic text-sm py-4">
                {currentProject ? 'No elements in this project yet' : 'Select a project to view elements'}
              </div>
            )}
          </div>
        </aside>

        {/* 3D Viewport */}
        <main className="flex-1 bg-gray-50 dark:bg-slate-950 relative">
          <Canvas style={{ background: isDarkMode ? '#0a1122' : '#f0f2f5' }}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
            <Grid infiniteGrid cellSize={1} fadeDistance={50} fadeStrength={1.5} />
            <PerspectiveCamera makeDefault position={[5, 5, 5]} />
            <OrbitControls />
            {modelElements}
          </Canvas>
          
          {/* Bottom Toolbar */}
          <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-800 bg-opacity-90 dark:bg-opacity-90 p-2 shadow-lg flex items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Mode:</span>
              <select 
                className="input-sm bg-transparent border-gray-300 dark:border-slate-600 text-gray-700 dark:text-white rounded"
                value="view"
                onChange={() => {}}
                aria-label="Mode"
              >
                <option value="view">View</option>
                <option value="edit">Edit</option>
                <option value="measure">Measure</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Color:</span>
              <button 
                className="p-1 rounded border border-gray-300 dark:border-slate-600"
                onClick={() => setShowElementPanel(true)}
                aria-label="Select Color"
              >
                <Palette size={18} className="text-primary-600 dark:text-primary-400" />
              </button>
            </div>
          </div>
        </main>

        {/* Element Panel (Slide from right) */}
        {showElementPanel && (
          <div className={`absolute top-0 right-0 h-full bg-white dark:bg-slate-800 shadow-lg w-full sm:w-96 transform transition-transform ${styles.slideInPanel}`}>
            <div className="p-4 h-full overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedElement ? 'Edit Element' : 'Add Element'}
                </h2>
                <button 
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  onClick={() => {
                    setShowElementPanel(false);
                    setSelectedElement(null);
                  }}
                  aria-label="Close Panel"
                >
                  <X size={20} />
                </button>
              </div>
              
              <form className="space-y-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="element-name">Name</label>
                  <input 
                    id="element-name"
                    type="text" 
                    className="input"
                    value={elementForm.name}
                    onChange={(e) => setElementForm({...elementForm, name: e.target.value})}
                    placeholder="Element name"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="element-type">Type</label>
                  <select 
                    id="element-type"
                    className="input"
                    value={elementForm.type}
                    onChange={(e) => setElementForm({...elementForm, type: e.target.value as 'box' | 'sphere' | 'cylinder'})}
                  >
                    <option value="box">Box</option>
                    <option value="sphere">Sphere</option>
                    <option value="cylinder">Cylinder</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Color</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="color" 
                      className="w-10 h-10 rounded-md cursor-pointer"
                      value={elementForm.color}
                      onChange={(e) => setElementForm({...elementForm, color: e.target.value})}
                    />
                    <div className="flex-1 grid grid-cols-5 gap-1">
                      {colorPalette.map(color => (
                        <div 
                          key={color} 
                          className="w-7 h-7 rounded-md cursor-pointer border border-gray-300 dark:border-slate-600"
                          style={{ backgroundColor: color }}
                          onClick={() => setElementForm({...elementForm, color})}
                          role="button"
                          aria-label={`Select color ${color}`}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="pos-x">Position X</label>
                    <input 
                      id="pos-x"
                      type="number" 
                      className="input"
                      value={elementForm.posX}
                      onChange={(e) => setElementForm({...elementForm, posX: parseFloat(e.target.value) || 0})}
                      step="0.1"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="pos-y">Position Y</label>
                    <input 
                      id="pos-y"
                      type="number" 
                      className="input"
                      value={elementForm.posY}
                      onChange={(e) => setElementForm({...elementForm, posY: parseFloat(e.target.value) || 0})}
                      step="0.1"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="pos-z">Position Z</label>
                    <input 
                      id="pos-z"
                      type="number" 
                      className="input"
                      value={elementForm.posZ}
                      onChange={(e) => setElementForm({...elementForm, posZ: parseFloat(e.target.value) || 0})}
                      step="0.1"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="rot-x">Rotation X</label>
                    <input 
                      id="rot-x"
                      type="number" 
                      className="input"
                      value={elementForm.rotX}
                      onChange={(e) => setElementForm({...elementForm, rotX: parseFloat(e.target.value) || 0})}
                      step="0.1"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="rot-y">Rotation Y</label>
                    <input 
                      id="rot-y"
                      type="number" 
                      className="input"
                      value={elementForm.rotY}
                      onChange={(e) => setElementForm({...elementForm, rotY: parseFloat(e.target.value) || 0})}
                      step="0.1"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="rot-z">Rotation Z</label>
                    <input 
                      id="rot-z"
                      type="number" 
                      className="input"
                      value={elementForm.rotZ}
                      onChange={(e) => setElementForm({...elementForm, rotZ: parseFloat(e.target.value) || 0})}
                      step="0.1"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="scale-x">Scale X</label>
                    <input 
                      id="scale-x"
                      type="number" 
                      className="input"
                      value={elementForm.scaleX}
                      onChange={(e) => setElementForm({...elementForm, scaleX: parseFloat(e.target.value) || 0.1})}
                      step="0.1"
                      min="0.1"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="scale-y">Scale Y</label>
                    <input 
                      id="scale-y"
                      type="number" 
                      className="input"
                      value={elementForm.scaleY}
                      onChange={(e) => setElementForm({...elementForm, scaleY: parseFloat(e.target.value) || 0.1})}
                      step="0.1"
                      min="0.1"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="scale-z">Scale Z</label>
                    <input 
                      id="scale-z"
                      type="number" 
                      className="input"
                      value={elementForm.scaleZ}
                      onChange={(e) => setElementForm({...elementForm, scaleZ: parseFloat(e.target.value) || 0.1})}
                      step="0.1"
                      min="0.1"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  {selectedElement && (
                    <button 
                      type="button"
                      className="btn bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-800"
                      onClick={() => {
                        if (selectedElement) {
                          deleteElement(selectedElement.id);
                        }
                      }}
                    >
                      Delete
                    </button>
                  )}
                  <button 
                    type="button"
                    className="btn bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-slate-600"
                    onClick={() => {
                      setShowElementPanel(false);
                      setSelectedElement(null);
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button"
                    className="btn btn-primary"
                    onClick={selectedElement ? updateElement : addElement}
                  >
                    {selectedElement ? 'Update' : 'Add'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {/* Project Panel (Slide from right) */}
        {showProjectPanel && (
          <div className={`absolute top-0 right-0 h-full bg-white dark:bg-slate-800 shadow-lg w-full sm:w-96 transform transition-transform ${styles.slideInPanel}`}>
            <div className="p-4 h-full overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {currentProject && projectForm.name ? 'Edit Project' : 'New Project'}
                </h2>
                <button 
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  onClick={() => setShowProjectPanel(false)}
                  aria-label="Close Panel"
                >
                  <X size={20} />
                </button>
              </div>
              
              <form className="space-y-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="project-name">Project Name</label>
                  <input 
                    id="project-name"
                    type="text" 
                    className="input"
                    value={projectForm.name}
                    onChange={(e) => setProjectForm({...projectForm, name: e.target.value})}
                    placeholder="Enter project name"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="project-description">Description</label>
                  <textarea 
                    id="project-description"
                    className="input min-h-[100px]"
                    value={projectForm.description}
                    onChange={(e) => setProjectForm({...projectForm, description: e.target.value})}
                    placeholder="Enter project description"
                  ></textarea>
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  {currentProject && projectForm.name && (
                    <button 
                      type="button"
                      className="btn bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-800"
                      onClick={() => {
                        if (currentProject) {
                          deleteProject(currentProject.id);
                          setShowProjectPanel(false);
                        }
                      }}
                    >
                      Delete
                    </button>
                  )}
                  <button 
                    type="button"
                    className="btn bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-slate-600"
                    onClick={() => setShowProjectPanel(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button"
                    className="btn btn-primary"
                    onClick={currentProject && projectForm.name ? updateProject : createProject}
                    disabled={!projectForm.name}
                  >
                    {currentProject && projectForm.name ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {/* Team Panel (Slide from right) */}
        {showTeamPanel && (
          <div className={`absolute top-0 right-0 h-full bg-white dark:bg-slate-800 shadow-lg w-full sm:w-96 transform transition-transform ${styles.slideInPanel}`}>
            <div className="p-4 h-full overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Team Management</h2>
                <button 
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  onClick={() => setShowTeamPanel(false)}
                  aria-label="Close Panel"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-slate-700 p-3 rounded-md">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-white mb-2">Add Team Member</h3>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      className="input flex-1"
                      value={newMemberName}
                      onChange={(e) => setNewMemberName(e.target.value)}
                      placeholder="Member name"
                    />
                    <select 
                      className="input w-1/3"
                      value={newMemberRole}
                      onChange={(e) => setNewMemberRole(e.target.value as 'architect' | 'engineer' | 'contractor' | 'client')}
                    >
                      <option value="architect">Architect</option>
                      <option value="engineer">Engineer</option>
                      <option value="contractor">Contractor</option>
                      <option value="client">Client</option>
                    </select>
                    <button 
                      className="btn-sm btn-primary"
                      onClick={addTeamMember}
                      disabled={!newMemberName.trim()}
                    >
                      <Check size={16} />
                    </button>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-white mb-2">Team Members</h3>
                  {teamMembers.length > 0 ? (
                    <ul className="space-y-2">
                      {teamMembers.map(member => (
                        <li 
                          key={member.id} 
                          className="flex items-center justify-between p-2 bg-white dark:bg-slate-700 rounded-md shadow-sm"
                        >
                          <div className="flex items-center gap-2">
                            <UserRound size={18} className="text-gray-500 dark:text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-700 dark:text-white">{member.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{member.role}</p>
                            </div>
                          </div>
                          <button 
                            className="text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                            onClick={() => deleteTeamMember(member.id)}
                            aria-label={`Delete ${member.name}`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-center text-gray-500 dark:text-gray-400 italic text-sm py-4">
                      No team members added yet
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 shadow-sm py-2 px-4 text-center text-xs text-gray-500 dark:text-gray-400">
        Copyright © 2025 of Datavtar Private Limited. All rights reserved.
      </footer>
    </div>
  );
};

export default App;