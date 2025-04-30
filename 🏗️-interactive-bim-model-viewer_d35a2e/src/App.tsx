import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Grid, Environment, useGLTF, Html } from '@react-three/drei';
import { Bar as RechartsBar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { Sun, Moon, Plus, Trash2, Download, Upload, Save, Edit, X, Database, FileJson, Info, Layers, Eye, EyeOff, PenTool, Palette, Building, Construction } from 'lucide-react';
import styles from './styles/styles.module.css';

// Define TypeScript interfaces for our data models
interface BimElement {
  id: string;
  name: string;
  type: ElementType;
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
  material: string;
  visible: boolean;
  properties: Record<string, string>;
}

interface BimProject {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  elements: BimElement[];
}

interface MaterialOption {
  id: string;
  name: string;
  color: string;
}

interface StatData {
  name: string;
  value: number;
}

// Enums for element types and views
enum ElementType {
  WALL = 'wall',
  FLOOR = 'floor',
  CEILING = 'ceiling',
  COLUMN = 'column',
  DOOR = 'door',
  WINDOW = 'window',
  FURNITURE = 'furniture',
  OTHER = 'other'
}

enum ViewMode {
  MODEL = 'model',
  ANALYTICS = 'analytics',
  PROPERTIES = 'properties',
  LAYERS = 'layers'
}

// Color palette for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD', '#5DADE2', '#58D68D', '#F4D03F'];

// Material options for BIM elements
const MATERIALS: MaterialOption[] = [
  { id: 'concrete', name: 'Concrete', color: '#CCCCCC' },
  { id: 'brick', name: 'Brick', color: '#C75D4D' },
  { id: 'wood', name: 'Wood', color: '#C19A6B' },
  { id: 'glass', name: 'Glass', color: '#ADD8E6' },
  { id: 'metal', name: 'Metal', color: '#B8B8B8' },
  { id: 'drywall', name: 'Drywall', color: '#F5F5F5' },
  { id: 'carpet', name: 'Carpet', color: '#6B8E23' },
  { id: 'ceramic', name: 'Ceramic', color: '#E6E6FA' },
];

// Sample default project
const DEFAULT_PROJECT: BimProject = {
  id: 'project-1',
  name: 'Sample BIM Project',
  description: 'A sample project to demonstrate BIM modeling capabilities',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  elements: [
    {
      id: 'wall-1',
      name: 'Wall 1',
      type: ElementType.WALL,
      dimensions: { width: 10, height: 3, depth: 0.3 },
      position: { x: 0, y: 1.5, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      material: 'concrete',
      visible: true,
      properties: { 'Load Bearing': 'Yes', 'Fire Rating': '2 hours' }
    },
    {
      id: 'floor-1',
      name: 'Floor 1',
      type: ElementType.FLOOR,
      dimensions: { width: 20, height: 0.3, depth: 20 },
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      material: 'concrete',
      visible: true,
      properties: { 'Strength': '4000 PSI', 'Finish': 'Polished' }
    },
    {
      id: 'column-1',
      name: 'Column 1',
      type: ElementType.COLUMN,
      dimensions: { width: 0.5, height: 3, depth: 0.5 },
      position: { x: 5, y: 1.5, z: 5 },
      rotation: { x: 0, y: 0, z: 0 },
      material: 'concrete',
      visible: true,
      properties: { 'Structural': 'Yes', 'Reinforcement': 'Steel Bars' }
    },
    {
      id: 'window-1',
      name: 'Window 1',
      type: ElementType.WINDOW,
      dimensions: { width: 2, height: 1.5, depth: 0.1 },
      position: { x: 0, y: 2, z: 5 },
      rotation: { x: 0, y: 0, z: 0 },
      material: 'glass',
      visible: true,
      properties: { 'U-Value': '0.3', 'Opening Type': 'Sliding' }
    },
    {
      id: 'door-1',
      name: 'Door 1',
      type: ElementType.DOOR,
      dimensions: { width: 1, height: 2.1, depth: 0.1 },
      position: { x: 0, y: 1.05, z: -5 },
      rotation: { x: 0, y: 0, z: 0 },
      material: 'wood',
      visible: true,
      properties: { 'Fire Rating': '1 hour', 'Accessibility': 'ADA Compliant' }
    }
  ]
};

// Helper function to get material color
const getMaterialColor = (materialId: string): string => {
  const material = MATERIALS.find(m => m.id === materialId);
  return material?.color || '#CCCCCC';
};

// BIM Element component for 3D rendering
const BimElementModel: React.FC<{ element: BimElement; isSelected: boolean; onClick: () => void }> = ({ element, isSelected, onClick }) => {
  const materialColor = getMaterialColor(element.material);
  
  return (
    <mesh
      position={[element.position.x, element.position.y, element.position.z]}
      rotation={[element.rotation.x, element.rotation.y, element.rotation.z]}
      scale={[element.dimensions.width, element.dimensions.height, element.dimensions.depth]}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      visible={element.visible}
    >
      <boxGeometry />
      <meshStandardMaterial 
        color={materialColor} 
        transparent={element.material === 'glass'}
        opacity={element.material === 'glass' ? 0.4 : 1}
        wireframe={isSelected}
      />
      {isSelected && (
        <Html>
          <div className={styles.elementLabel}>{element.name}</div>
        </Html>
      )}
    </mesh>
  );
};

const App: React.FC = () => {
  // State management
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });
  
  const [projects, setProjects] = useState<BimProject[]>(() => {
    const savedProjects = localStorage.getItem('bimProjects');
    return savedProjects ? JSON.parse(savedProjects) : [DEFAULT_PROJECT];
  });
  
  const [currentProjectId, setCurrentProjectId] = useState<string>(() => {
    const savedProjectId = localStorage.getItem('currentBimProjectId');
    return savedProjectId || DEFAULT_PROJECT.id;
  });
  
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.MODEL);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [isNewElementModalOpen, setIsNewElementModalOpen] = useState<boolean>(false);
  const [isEditElementModalOpen, setIsEditElementModalOpen] = useState<boolean>(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState<boolean>(false);
  const [newElement, setNewElement] = useState<Partial<BimElement>>({
    name: '',
    type: ElementType.WALL,
    dimensions: { width: 1, height: 1, depth: 1 },
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    material: 'concrete',
    visible: true,
    properties: {}
  });
  
  const [newProject, setNewProject] = useState<Partial<BimProject>>({
    name: '',
    description: '',
    elements: []
  });
  
  const [newPropertyKey, setNewPropertyKey] = useState<string>('');
  const [newPropertyValue, setNewPropertyValue] = useState<string>('');
  
  // Effect to save data to local storage
  useEffect(() => {
    localStorage.setItem('bimProjects', JSON.stringify(projects));
  }, [projects]);
  
  useEffect(() => {
    localStorage.setItem('currentBimProjectId', currentProjectId);
  }, [currentProjectId]);
  
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);
  
  // Event handlers for keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Close modals with Escape key
      if (e.key === 'Escape') {
        setIsNewElementModalOpen(false);
        setIsEditElementModalOpen(false);
        setIsProjectModalOpen(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  
  // Helper functions
  const getCurrentProject = (): BimProject | undefined => {
    return projects.find(project => project.id === currentProjectId);
  };
  
  const getSelectedElement = (): BimElement | undefined => {
    if (!selectedElementId) return undefined;
    const project = getCurrentProject();
    return project?.elements.find(element => element.id === selectedElementId);
  };
  
  // Element CRUD operations
  const addElement = () => {
    if (!newElement.name) return;
    
    const element: BimElement = {
      id: `element-${Date.now()}`,
      name: newElement.name || '',
      type: newElement.type || ElementType.OTHER,
      dimensions: newElement.dimensions || { width: 1, height: 1, depth: 1 },
      position: newElement.position || { x: 0, y: 0, z: 0 },
      rotation: newElement.rotation || { x: 0, y: 0, z: 0 },
      material: newElement.material || 'concrete',
      visible: true,
      properties: newElement.properties || {}
    };
    
    setProjects(prevProjects => {
      return prevProjects.map(project => {
        if (project.id === currentProjectId) {
          return {
            ...project,
            elements: [...project.elements, element],
            updatedAt: new Date().toISOString()
          };
        }
        return project;
      });
    });
    
    // Reset form and close modal
    setNewElement({
      name: '',
      type: ElementType.WALL,
      dimensions: { width: 1, height: 1, depth: 1 },
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      material: 'concrete',
      visible: true,
      properties: {}
    });
    setIsNewElementModalOpen(false);
  };
  
  const updateElement = (updatedElement: BimElement) => {
    setProjects(prevProjects => {
      return prevProjects.map(project => {
        if (project.id === currentProjectId) {
          return {
            ...project,
            elements: project.elements.map(element => 
              element.id === updatedElement.id ? updatedElement : element
            ),
            updatedAt: new Date().toISOString()
          };
        }
        return project;
      });
    });
    
    setIsEditElementModalOpen(false);
  };
  
  const deleteElement = (elementId: string) => {
    setProjects(prevProjects => {
      return prevProjects.map(project => {
        if (project.id === currentProjectId) {
          return {
            ...project,
            elements: project.elements.filter(element => element.id !== elementId),
            updatedAt: new Date().toISOString()
          };
        }
        return project;
      });
    });
    
    if (selectedElementId === elementId) {
      setSelectedElementId(null);
    }
  };
  
  const toggleElementVisibility = (elementId: string) => {
    setProjects(prevProjects => {
      return prevProjects.map(project => {
        if (project.id === currentProjectId) {
          return {
            ...project,
            elements: project.elements.map(element => {
              if (element.id === elementId) {
                return { ...element, visible: !element.visible };
              }
              return element;
            }),
            updatedAt: new Date().toISOString()
          };
        }
        return project;
      });
    });
  };
  
  // Project CRUD operations
  const addProject = () => {
    if (!newProject.name) return;
    
    const project: BimProject = {
      id: `project-${Date.now()}`,
      name: newProject.name || 'New Project',
      description: newProject.description || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      elements: []
    };
    
    setProjects(prevProjects => [...prevProjects, project]);
    setCurrentProjectId(project.id);
    setNewProject({ name: '', description: '', elements: [] });
    setIsProjectModalOpen(false);
  };
  
  const deleteProject = (projectId: string) => {
    if (projects.length <= 1) {
      alert('Cannot delete the last project.');
      return;
    }
    
    setProjects(prevProjects => {
      const filtered = prevProjects.filter(project => project.id !== projectId);
      if (currentProjectId === projectId && filtered.length > 0) {
        setCurrentProjectId(filtered[0].id);
      }
      return filtered;
    });
  };
  
  // Export project as JSON
  const exportProject = () => {
    const project = getCurrentProject();
    if (!project) return;
    
    const dataStr = JSON.stringify(project, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportName = `${project.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportName);
    linkElement.click();
  };
  
  // Import project from JSON file
  const importProject = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedProject = JSON.parse(content) as BimProject;
        
        // Validate required fields
        if (!importedProject.id || !importedProject.name || !Array.isArray(importedProject.elements)) {
          throw new Error('Invalid project format');
        }
        
        // Check for duplicate ID
        const projectExists = projects.some(p => p.id === importedProject.id);
        const finalProject = projectExists ? {
          ...importedProject,
          id: `project-${Date.now()}`
        } : importedProject;
        
        setProjects(prevProjects => [...prevProjects, finalProject]);
        setCurrentProjectId(finalProject.id);
        alert('Project imported successfully!');
      } catch (error) {
        alert('Error importing project. Please check the file format.');
        console.error('Import error:', error);
      }
    };
    
    reader.readAsText(file);
    // Reset the input
    event.target.value = '';
  };
  
  // Prepare analytics data
  const prepareAnalyticsData = () => {
    const project = getCurrentProject();
    if (!project) return { elementTypes: [], materialUsage: [] };
    
    // Count elements by type
    const elementTypeCounts: Record<string, number> = {};
    // Count elements by material
    const materialCounts: Record<string, number> = {};
    
    project.elements.forEach(element => {
      // Count by type
      elementTypeCounts[element.type] = (elementTypeCounts[element.type] || 0) + 1;
      
      // Count by material
      materialCounts[element.material] = (materialCounts[element.material] || 0) + 1;
    });
    
    // Convert to array format for charts
    const elementTypes: StatData[] = Object.entries(elementTypeCounts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1), // Capitalize
      value
    }));
    
    const materialUsage: StatData[] = Object.entries(materialCounts).map(([id, value]) => {
      const materialName = MATERIALS.find(m => m.id === id)?.name || id;
      return {
        name: materialName,
        value
      };
    });
    
    return { elementTypes, materialUsage };
  };
  
  // Add property to element
  const addProperty = () => {
    if (!newPropertyKey || !selectedElementId) return;
    
    const selectedElement = getSelectedElement();
    if (!selectedElement) return;
    
    const updatedElement = {
      ...selectedElement,
      properties: {
        ...selectedElement.properties,
        [newPropertyKey]: newPropertyValue
      }
    };
    
    updateElement(updatedElement);
    setNewPropertyKey('');
    setNewPropertyValue('');
  };
  
  // Remove property from element
  const removeProperty = (key: string) => {
    const selectedElement = getSelectedElement();
    if (!selectedElement) return;
    
    const updatedProperties = { ...selectedElement.properties };
    delete updatedProperties[key];
    
    const updatedElement = {
      ...selectedElement,
      properties: updatedProperties
    };
    
    updateElement(updatedElement);
  };
  
  // Prepare rendered components based on current view mode
  const renderViewContent = () => {
    const project = getCurrentProject();
    if (!project) return null;
    
    switch (viewMode) {
      case ViewMode.MODEL:
        return (
          <div className="relative w-full h-full">
            <Canvas>
              <PerspectiveCamera makeDefault position={[10, 10, 10]} />
              <OrbitControls />
              <ambientLight intensity={0.5} />
              <directionalLight position={[10, 10, 5]} intensity={1} />
              <Grid infiniteGrid followCamera cellSize={1} cellThickness={0.5} cellColor="#6f6f6f" sectionSize={3} sectionThickness={1} sectionColor="#9d4b4b" fadeDistance={50} />
              <Environment preset="city" />
              
              {project.elements.map(element => (
                <BimElementModel 
                  key={element.id} 
                  element={element} 
                  isSelected={element.id === selectedElementId}
                  onClick={() => setSelectedElementId(element.id)}
                />
              ))}
            </Canvas>
          </div>
        );
        
      case ViewMode.ANALYTICS:
        const { elementTypes, materialUsage } = prepareAnalyticsData();
        return (
          <div className="p-4 space-y-6">
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Element Types Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={elementTypes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <RechartsBar dataKey="value" fill="#8884d8" name="Count" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="card mt-6">
              <h3 className="text-lg font-semibold mb-4">Material Usage</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={materialUsage}
                    cx="50%"
                    cy="50%"
                    labelLine
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {materialUsage.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
        
      case ViewMode.PROPERTIES:
        const selectedElement = getSelectedElement();
        return (
          <div className="p-4">
            {selectedElement ? (
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">{selectedElement.name} Properties</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-md font-medium mb-2">Basic Properties</h4>
                    <div className="bg-gray-50 dark:bg-slate-700 p-3 rounded">
                      <p><span className="font-medium">Type:</span> {selectedElement.type}</p>
                      <p><span className="font-medium">Material:</span> {MATERIALS.find(m => m.id === selectedElement.material)?.name || selectedElement.material}</p>
                      <p><span className="font-medium">Dimensions:</span> W: {selectedElement.dimensions.width}m × H: {selectedElement.dimensions.height}m × D: {selectedElement.dimensions.depth}m</p>
                      <p><span className="font-medium">Position:</span> X: {selectedElement.position.x}, Y: {selectedElement.position.y}, Z: {selectedElement.position.z}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-md font-medium mb-2">Custom Properties</h4>
                    {Object.keys(selectedElement.properties).length > 0 ? (
                      <div className="bg-gray-50 dark:bg-slate-700 p-3 rounded space-y-2">
                        {Object.entries(selectedElement.properties).map(([key, value]) => (
                          <div key={key} className="flex justify-between items-center">
                            <p><span className="font-medium">{key}:</span> {value}</p>
                            <button 
                              onClick={() => removeProperty(key)}
                              className="text-red-500 hover:text-red-700"
                              aria-label={`Remove ${key} property`}
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">No custom properties defined</p>
                    )}
                    
                    <div className="mt-4">
                      <h5 className="text-sm font-medium mb-2">Add Property</h5>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={newPropertyKey}
                          onChange={(e) => setNewPropertyKey(e.target.value)}
                          placeholder="Property name"
                          className="input input-sm flex-1"
                        />
                        <input
                          type="text"
                          value={newPropertyValue}
                          onChange={(e) => setNewPropertyValue(e.target.value)}
                          placeholder="Value"
                          className="input input-sm flex-1"
                        />
                        <button 
                          onClick={addProperty}
                          className="btn btn-sm btn-primary"
                          disabled={!newPropertyKey}
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card flex flex-col items-center justify-center text-center p-8">
                <Info size={48} className="text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No Element Selected</h3>
                <p className="text-gray-500">Select an element from the model view or layers panel to see its properties.</p>
              </div>
            )}
          </div>
        );
        
      case ViewMode.LAYERS:
        return (
          <div className="p-4">
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Project Layers</h3>
              
              <div className="space-y-1">
                {project.elements.map(element => (
                  <div 
                    key={element.id} 
                    className={`flex items-center justify-between p-2 rounded hover:bg-gray-100 dark:hover:bg-slate-700 ${element.id === selectedElementId ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                  >
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => toggleElementVisibility(element.id)}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        aria-label={element.visible ? 'Hide element' : 'Show element'}
                      >
                        {element.visible ? <Eye size={18} /> : <EyeOff size={18} />}
                      </button>
                      <div 
                        className="flex-1 cursor-pointer" 
                        onClick={() => setSelectedElementId(element.id)}
                      >
                        <p className="font-medium">{element.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{element.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => {
                          setNewElement({
                            ...element,
                            name: element.name
                          });
                          setIsEditElementModalOpen(true);
                        }}
                        className="text-blue-500 hover:text-blue-700 p-1"
                        aria-label={`Edit ${element.name}`}
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => deleteElement(element.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                        aria-label={`Delete ${element.name}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
                
                {project.elements.length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-gray-500 italic">No elements in this project</p>
                    <button 
                      onClick={() => setIsNewElementModalOpen(true)}
                      className="btn btn-sm btn-primary mt-2"
                    >
                      <Plus size={16} className="mr-1" /> Add Element
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
    }
  };
  
  return (
    <div className={`min-h-screen flex flex-col bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white ${darkMode ? 'dark' : ''}`}>
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm">
        <div className="container-fluid py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Building className="text-primary-600" size={28} />
              <h1 className="text-xl font-bold">BIM Modeler</h1>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Project selector */}
              <div className="flex-1 min-w-[200px]">
                <select 
                  className="input input-sm w-full" 
                  value={currentProjectId}
                  onChange={(e) => setCurrentProjectId(e.target.value)}
                >
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Project actions */}
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setIsProjectModalOpen(true)}
                  className="btn btn-sm bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 flex items-center gap-1"
                  aria-label="New project"
                >
                  <Plus size={16} />
                </button>
                
                <button 
                  onClick={() => {
                    const project = getCurrentProject();
                    if (project && window.confirm(`Delete project "${project.name}"?`)) {
                      deleteProject(project.id);
                    }
                  }}
                  className="btn btn-sm bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 flex items-center gap-1"
                  aria-label="Delete project"
                >
                  <Trash2 size={16} />
                </button>
                
                <button 
                  onClick={exportProject}
                  className="btn btn-sm bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 flex items-center gap-1"
                  aria-label="Export project"
                >
                  <Download size={16} />
                </button>
                
                <label className="btn btn-sm bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 flex items-center gap-1 cursor-pointer">
                  <Upload size={16} />
                  <span className="sr-only">Import project</span>
                  <input 
                    type="file" 
                    accept=".json" 
                    className="hidden" 
                    onChange={importProject}
                  />
                </label>
                
                <button 
                  onClick={() => setDarkMode(!darkMode)}
                  className="btn btn-sm bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                  aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {darkMode ? <Sun size={16} /> : <Moon size={16} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-white dark:bg-slate-800 shadow-sm md:border-r border-gray-200 dark:border-slate-700">
          <div className="p-4">
            <button
              onClick={() => setIsNewElementModalOpen(true)}
              className="btn btn-primary w-full flex items-center justify-center gap-2"
            >
              <Plus size={18} />
              <span>Add Element</span>
            </button>
          </div>
          
          <nav className="p-2">
            <ul className="space-y-1">
              <li>
                <button
                  onClick={() => setViewMode(ViewMode.MODEL)}
                  className={`w-full text-left px-4 py-2 rounded flex items-center gap-2 ${viewMode === ViewMode.MODEL ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300' : 'hover:bg-gray-100 dark:hover:bg-slate-700'}`}
                >
                  <Construction size={18} />
                  <span>3D Model</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setViewMode(ViewMode.LAYERS)}
                  className={`w-full text-left px-4 py-2 rounded flex items-center gap-2 ${viewMode === ViewMode.LAYERS ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300' : 'hover:bg-gray-100 dark:hover:bg-slate-700'}`}
                >
                  <Layers size={18} />
                  <span>Layers</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setViewMode(ViewMode.PROPERTIES)}
                  className={`w-full text-left px-4 py-2 rounded flex items-center gap-2 ${viewMode === ViewMode.PROPERTIES ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300' : 'hover:bg-gray-100 dark:hover:bg-slate-700'}`}
                >
                  <PenTool size={18} />
                  <span>Properties</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setViewMode(ViewMode.ANALYTICS)}
                  className={`w-full text-left px-4 py-2 rounded flex items-center gap-2 ${viewMode === ViewMode.ANALYTICS ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300' : 'hover:bg-gray-100 dark:hover:bg-slate-700'}`}
                >
                  <Database size={18} />
                  <span>Analytics</span>
                </button>
              </li>
            </ul>
          </nav>
          
          {/* Project info */}
          <div className="p-4 border-t border-gray-200 dark:border-slate-700 mt-4">
            <h2 className="font-semibold text-sm uppercase text-gray-500 dark:text-gray-400 mb-2">Current Project</h2>
            <div className="space-y-1">
              <p className="font-medium">{getCurrentProject()?.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{getCurrentProject()?.description || 'No description'}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                {getCurrentProject()?.elements.length} elements
              </p>
            </div>
          </div>
        </aside>
        
        {/* Main view area */}
        <div className="flex-1 overflow-auto">
          {renderViewContent()}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>Copyright © 2025 of Datavtar Private Limited. All rights reserved.</p>
      </footer>
      
      {/* Modals */}
      {/* New Element Modal */}
      {isNewElementModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsNewElementModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium">Add New Element</h3>
              <button onClick={() => setIsNewElementModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                <X size={20} />
              </button>
            </div>
            
            <div className="mt-4 space-y-4">
              <div className="form-group">
                <label className="form-label" htmlFor="element-name">Name</label>
                <input
                  id="element-name"
                  type="text"
                  className="input"
                  value={newElement.name || ''}
                  onChange={(e) => setNewElement({...newElement, name: e.target.value})}
                  placeholder="Element name"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="element-type">Type</label>
                <select
                  id="element-type"
                  className="input"
                  value={newElement.type || ElementType.WALL}
                  onChange={(e) => setNewElement({...newElement, type: e.target.value as ElementType})}
                >
                  {Object.values(ElementType).map(type => (
                    <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="element-material">Material</label>
                <select
                  id="element-material"
                  className="input"
                  value={newElement.material || 'concrete'}
                  onChange={(e) => setNewElement({...newElement, material: e.target.value})}
                >
                  {MATERIALS.map(material => (
                    <option key={material.id} value={material.id}>{material.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="element-width">Width (m)</label>
                  <input
                    id="element-width"
                    type="number"
                    className="input"
                    value={newElement.dimensions?.width || 1}
                    onChange={(e) => setNewElement({
                      ...newElement, 
                      dimensions: { 
                        ...newElement.dimensions || { width: 1, height: 1, depth: 1 }, 
                        width: Number(e.target.value) 
                      }
                    })}
                    min="0.1"
                    step="0.1"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="element-height">Height (m)</label>
                  <input
                    id="element-height"
                    type="number"
                    className="input"
                    value={newElement.dimensions?.height || 1}
                    onChange={(e) => setNewElement({
                      ...newElement, 
                      dimensions: { 
                        ...newElement.dimensions || { width: 1, height: 1, depth: 1 }, 
                        height: Number(e.target.value) 
                      }
                    })}
                    min="0.1"
                    step="0.1"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="element-depth">Depth (m)</label>
                  <input
                    id="element-depth"
                    type="number"
                    className="input"
                    value={newElement.dimensions?.depth || 1}
                    onChange={(e) => setNewElement({
                      ...newElement, 
                      dimensions: { 
                        ...newElement.dimensions || { width: 1, height: 1, depth: 1 }, 
                        depth: Number(e.target.value) 
                      }
                    })}
                    min="0.1"
                    step="0.1"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="element-pos-x">Position X</label>
                  <input
                    id="element-pos-x"
                    type="number"
                    className="input"
                    value={newElement.position?.x || 0}
                    onChange={(e) => setNewElement({
                      ...newElement, 
                      position: { 
                        ...newElement.position || { x: 0, y: 0, z: 0 }, 
                        x: Number(e.target.value) 
                      }
                    })}
                    step="0.5"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="element-pos-y">Position Y</label>
                  <input
                    id="element-pos-y"
                    type="number"
                    className="input"
                    value={newElement.position?.y || 0}
                    onChange={(e) => setNewElement({
                      ...newElement, 
                      position: { 
                        ...newElement.position || { x: 0, y: 0, z: 0 }, 
                        y: Number(e.target.value) 
                      }
                    })}
                    step="0.5"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="element-pos-z">Position Z</label>
                  <input
                    id="element-pos-z"
                    type="number"
                    className="input"
                    value={newElement.position?.z || 0}
                    onChange={(e) => setNewElement({
                      ...newElement, 
                      position: { 
                        ...newElement.position || { x: 0, y: 0, z: 0 }, 
                        z: Number(e.target.value) 
                      }
                    })}
                    step="0.5"
                  />
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                onClick={() => setIsNewElementModalOpen(false)}
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
              >
                Cancel
              </button>
              <button 
                onClick={addElement}
                className="btn btn-primary flex items-center gap-1"
                disabled={!newElement.name}
              >
                <Plus size={16} />
                <span>Add Element</span>
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Element Modal */}
      {isEditElementModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsEditElementModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium">Edit Element</h3>
              <button onClick={() => setIsEditElementModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                <X size={20} />
              </button>
            </div>
            
            <div className="mt-4 space-y-4">
              <div className="form-group">
                <label className="form-label" htmlFor="edit-element-name">Name</label>
                <input
                  id="edit-element-name"
                  type="text"
                  className="input"
                  value={newElement.name || ''}
                  onChange={(e) => setNewElement({...newElement, name: e.target.value})}
                  placeholder="Element name"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="edit-element-type">Type</label>
                <select
                  id="edit-element-type"
                  className="input"
                  value={newElement.type}
                  onChange={(e) => setNewElement({...newElement, type: e.target.value as ElementType})}
                >
                  {Object.values(ElementType).map(type => (
                    <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="edit-element-material">Material</label>
                <select
                  id="edit-element-material"
                  className="input"
                  value={newElement.material}
                  onChange={(e) => setNewElement({...newElement, material: e.target.value})}
                >
                  {MATERIALS.map(material => (
                    <option key={material.id} value={material.id}>{material.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="edit-element-width">Width (m)</label>
                  <input
                    id="edit-element-width"
                    type="number"
                    className="input"
                    value={newElement.dimensions?.width}
                    onChange={(e) => setNewElement({
                      ...newElement, 
                      dimensions: { 
                        ...newElement.dimensions!, 
                        width: Number(e.target.value) 
                      }
                    })}
                    min="0.1"
                    step="0.1"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="edit-element-height">Height (m)</label>
                  <input
                    id="edit-element-height"
                    type="number"
                    className="input"
                    value={newElement.dimensions?.height}
                    onChange={(e) => setNewElement({
                      ...newElement, 
                      dimensions: { 
                        ...newElement.dimensions!, 
                        height: Number(e.target.value) 
                      }
                    })}
                    min="0.1"
                    step="0.1"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="edit-element-depth">Depth (m)</label>
                  <input
                    id="edit-element-depth"
                    type="number"
                    className="input"
                    value={newElement.dimensions?.depth}
                    onChange={(e) => setNewElement({
                      ...newElement, 
                      dimensions: { 
                        ...newElement.dimensions!, 
                        depth: Number(e.target.value) 
                      }
                    })}
                    min="0.1"
                    step="0.1"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="edit-element-pos-x">Position X</label>
                  <input
                    id="edit-element-pos-x"
                    type="number"
                    className="input"
                    value={newElement.position?.x}
                    onChange={(e) => setNewElement({
                      ...newElement, 
                      position: { 
                        ...newElement.position!, 
                        x: Number(e.target.value) 
                      }
                    })}
                    step="0.5"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="edit-element-pos-y">Position Y</label>
                  <input
                    id="edit-element-pos-y"
                    type="number"
                    className="input"
                    value={newElement.position?.y}
                    onChange={(e) => setNewElement({
                      ...newElement, 
                      position: { 
                        ...newElement.position!, 
                        y: Number(e.target.value) 
                      }
                    })}
                    step="0.5"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="edit-element-pos-z">Position Z</label>
                  <input
                    id="edit-element-pos-z"
                    type="number"
                    className="input"
                    value={newElement.position?.z}
                    onChange={(e) => setNewElement({
                      ...newElement, 
                      position: { 
                        ...newElement.position!, 
                        z: Number(e.target.value) 
                      }
                    })}
                    step="0.5"
                  />
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                onClick={() => setIsEditElementModalOpen(false)}
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  if (newElement.id) {
                    updateElement(newElement as BimElement);
                  }
                }}
                className="btn btn-primary flex items-center gap-1"
                disabled={!newElement.name}
              >
                <Save size={16} />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* New Project Modal */}
      {isProjectModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsProjectModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium">Create New Project</h3>
              <button onClick={() => setIsProjectModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                <X size={20} />
              </button>
            </div>
            
            <div className="mt-4 space-y-4">
              <div className="form-group">
                <label className="form-label" htmlFor="project-name">Project Name</label>
                <input
                  id="project-name"
                  type="text"
                  className="input"
                  value={newProject.name || ''}
                  onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                  placeholder="Enter project name"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="project-description">Description</label>
                <textarea
                  id="project-description"
                  className="input"
                  value={newProject.description || ''}
                  onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                  placeholder="Enter project description"
                  rows={3}
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                onClick={() => setIsProjectModalOpen(false)}
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
              >
                Cancel
              </button>
              <button 
                onClick={addProject}
                className="btn btn-primary flex items-center gap-1"
                disabled={!newProject.name}
              >
                <Plus size={16} />
                <span>Create Project</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;