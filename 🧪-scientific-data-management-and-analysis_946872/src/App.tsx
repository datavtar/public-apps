import React, { useState, useEffect, useRef } from 'react';
import styles from './styles/styles.module.css';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import {
  Beaker,
  FlaskConical,
  Database,
  FileText,
  Search,
  Plus,
  Trash2,
  Edit,
  ChevronDown,
  ChevronUp,
  X,
  Check,
  ArrowUp,
  ArrowDown,
  Filter,
  Download,
  Upload,
  Save,
  Moon,
  Sun,
  Microscope,
  Dna,
  BrainCircuit,
  Pill,
  Syringe,
  ChartLine,
  ChartBar
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

// Define enums, types and interfaces
enum ProjectStatus {
  ONGOING = 'Ongoing',
  COMPLETED = 'Completed',
  PLANNED = 'Planned',
  ON_HOLD = 'On Hold'
}

enum ExperimentType {
  IN_VITRO = 'In Vitro',
  IN_VIVO = 'In Vivo',
  COMPUTATIONAL = 'Computational',
  CLINICAL = 'Clinical'
}

enum CompoundCategory {
  SMALL_MOLECULE = 'Small Molecule',
  PEPTIDE = 'Peptide',
  ANTIBODY = 'Antibody',
  PROTEIN = 'Protein',
  NUCLEIC_ACID = 'Nucleic Acid',
  OTHER = 'Other'
}

interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  startDate: string;
  endDate?: string;
  target: string;
  leadResearcher: string;
  collaborators: string[];
  createdAt: string;
  updatedAt: string;
}

interface Experiment {
  id: string;
  projectId: string;
  name: string;
  type: ExperimentType;
  description: string;
  protocol: string;
  startDate: string;
  endDate?: string;
  results: string;
  conclusion: string;
  createdAt: string;
  updatedAt: string;
}

interface Compound {
  id: string;
  name: string;
  smiles: string;
  molWeight: number;
  category: CompoundCategory;
  targetActivity: string;
  ic50?: number;
  status: string;
  toxicity?: string;
  solubility?: string;
  createdAt: string;
  updatedAt: string;
}

interface ExperimentalData {
  id: string;
  experimentId: string;
  compoundId: string;
  measurementType: string;
  value: number;
  unit: string;
  date: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface DashboardStat {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: number;
  color: string;
}

interface ChartData {
  name: string;
  value: number;
  category?: string;
}

type ActiveTab = 'dashboard' | 'projects' | 'experiments' | 'compounds' | 'data';
type ActiveModal = 'project' | 'experiment' | 'compound' | 'data' | 'deleteProject' | 'deleteExperiment' | 'deleteCompound' | 'deleteData' | null;

const App: React.FC = () => {
  // State management
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [compounds, setCompounds] = useState<Compound[]>([]);
  const [experimentalData, setExperimentalData] = useState<ExperimentalData[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [currentExperiment, setCurrentExperiment] = useState<Experiment | null>(null);
  const [currentCompound, setCurrentCompound] = useState<Compound | null>(null);
  const [currentData, setCurrentData] = useState<ExperimentalData | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterExperimentType, setFilterExperimentType] = useState<string>('All');
  const [filterCompoundCategory, setFilterCompoundCategory] = useState<string>('All');
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'ascending' | 'descending' } | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const modalRef = useRef<HTMLDivElement>(null);

  // Form hooks
  const projectForm = useForm<Project>();
  const experimentForm = useForm<Experiment>();
  const compoundForm = useForm<Compound>();
  const dataForm = useForm<ExperimentalData>();

  // Load data from localStorage on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Simulate loading time
        await new Promise(resolve => setTimeout(resolve, 1000));

        const savedProjects = localStorage.getItem('scienceProjects');
        const savedExperiments = localStorage.getItem('scienceExperiments');
        const savedCompounds = localStorage.getItem('scienceCompounds');
        const savedData = localStorage.getItem('scienceExperimentalData');
        const savedDarkMode = localStorage.getItem('scienceDarkMode');

        if (savedProjects) setProjects(JSON.parse(savedProjects));
        if (savedExperiments) setExperiments(JSON.parse(savedExperiments));
        if (savedCompounds) setCompounds(JSON.parse(savedCompounds));
        if (savedData) setExperimentalData(JSON.parse(savedData));
        if (savedDarkMode) setIsDarkMode(JSON.parse(savedDarkMode));

        setLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Save data to localStorage when it changes
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('scienceProjects', JSON.stringify(projects));
      localStorage.setItem('scienceExperiments', JSON.stringify(experiments));
      localStorage.setItem('scienceCompounds', JSON.stringify(compounds));
      localStorage.setItem('scienceExperimentalData', JSON.stringify(experimentalData));
      localStorage.setItem('scienceDarkMode', JSON.stringify(isDarkMode));
    }
  }, [projects, experiments, compounds, experimentalData, isDarkMode, loading]);

  // Handle dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeModal) {
        closeModal();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [activeModal]);

  // Handle clicks outside modal to close it
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node) && activeModal) {
        closeModal();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeModal]);

  // Common utility functions
  const generateId = (): string => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const getCurrentTimestamp = (): string => {
    return new Date().toISOString();
  };

  const closeModal = (): void => {
    setActiveModal(null);
    projectForm.reset();
    experimentForm.reset();
    compoundForm.reset();
    dataForm.reset();
    setCurrentProject(null);
    setCurrentExperiment(null);
    setCurrentCompound(null);
    setCurrentData(null);
  };

  const openModal = (type: ActiveModal, item: any = null): void => {
    setActiveModal(type);

    switch (type) {
      case 'project':
        if (item) {
          setCurrentProject(item);
          projectForm.reset(item);
        }
        break;
      case 'experiment':
        if (item) {
          setCurrentExperiment(item);
          experimentForm.reset(item);
        }
        break;
      case 'compound':
        if (item) {
          setCurrentCompound(item);
          compoundForm.reset(item);
        }
        break;
      case 'data':
        if (item) {
          setCurrentData(item);
          dataForm.reset(item);
        }
        break;
      case 'deleteProject':
        setCurrentProject(item);
        break;
      case 'deleteExperiment':
        setCurrentExperiment(item);
        break;
      case 'deleteCompound':
        setCurrentCompound(item);
        break;
      case 'deleteData':
        setCurrentData(item);
        break;
      default:
        break;
    }
  };

  // Form submission handlers
  const handleAddProject = (data: Project): void => {
    const timestamp = getCurrentTimestamp();
    const newProject: Project = {
      ...data,
      id: currentProject ? currentProject.id : generateId(),
      createdAt: currentProject ? currentProject.createdAt : timestamp,
      updatedAt: timestamp,
      collaborators: data.collaborators || []
    };

    if (currentProject) {
      // Update existing project
      setProjects(projects.map(p => p.id === currentProject.id ? newProject : p));
    } else {
      // Add new project
      setProjects([...projects, newProject]);
    }

    closeModal();
  };

  const handleAddExperiment = (data: Experiment): void => {
    const timestamp = getCurrentTimestamp();
    const newExperiment: Experiment = {
      ...data,
      id: currentExperiment ? currentExperiment.id : generateId(),
      createdAt: currentExperiment ? currentExperiment.createdAt : timestamp,
      updatedAt: timestamp
    };

    if (currentExperiment) {
      // Update existing experiment
      setExperiments(experiments.map(e => e.id === currentExperiment.id ? newExperiment : e));
    } else {
      // Add new experiment
      setExperiments([...experiments, newExperiment]);
    }

    closeModal();
  };

  const handleAddCompound = (data: Compound): void => {
    const timestamp = getCurrentTimestamp();
    const newCompound: Compound = {
      ...data,
      id: currentCompound ? currentCompound.id : generateId(),
      createdAt: currentCompound ? currentCompound.createdAt : timestamp,
      updatedAt: timestamp
    };

    if (currentCompound) {
      // Update existing compound
      setCompounds(compounds.map(c => c.id === currentCompound.id ? newCompound : c));
    } else {
      // Add new compound
      setCompounds([...compounds, newCompound]);
    }

    closeModal();
  };

  const handleAddData = (data: ExperimentalData): void => {
    const timestamp = getCurrentTimestamp();
    const newData: ExperimentalData = {
      ...data,
      id: currentData ? currentData.id : generateId(),
      createdAt: currentData ? currentData.createdAt : timestamp,
      updatedAt: timestamp
    };

    if (currentData) {
      // Update existing data
      setExperimentalData(experimentalData.map(d => d.id === currentData.id ? newData : d));
    } else {
      // Add new data
      setExperimentalData([...experimentalData, newData]);
    }

    closeModal();
  };

  // Delete handlers
  const handleDeleteProject = (): void => {
    if (currentProject) {
      // Also delete related experiments and data
      const relatedExperiments = experiments.filter(e => e.projectId === currentProject.id);
      const relatedExperimentIds = relatedExperiments.map(e => e.id);

      setProjects(projects.filter(p => p.id !== currentProject.id));
      setExperiments(experiments.filter(e => e.projectId !== currentProject.id));
      setExperimentalData(experimentalData.filter(d => !relatedExperimentIds.includes(d.experimentId)));
    }
    closeModal();
  };

  const handleDeleteExperiment = (): void => {
    if (currentExperiment) {
      setExperiments(experiments.filter(e => e.id !== currentExperiment.id));
      setExperimentalData(experimentalData.filter(d => d.experimentId !== currentExperiment.id));
    }
    closeModal();
  };

  const handleDeleteCompound = (): void => {
    if (currentCompound) {
      setCompounds(compounds.filter(c => c.id !== currentCompound.id));
      setExperimentalData(experimentalData.filter(d => d.compoundId !== currentCompound.id));
    }
    closeModal();
  };

  const handleDeleteData = (): void => {
    if (currentData) {
      setExperimentalData(experimentalData.filter(d => d.id !== currentData.id));
    }
    closeModal();
  };

  // Filtering and sorting functions
  const filterProjects = (): Project[] => {
    let filteredProjects = [...projects];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredProjects = filteredProjects.filter(p => 
        p.name.toLowerCase().includes(term) || 
        p.description.toLowerCase().includes(term) ||
        p.target.toLowerCase().includes(term) ||
        p.leadResearcher.toLowerCase().includes(term)
      );
    }

    // Apply status filter
    if (filterStatus !== 'All') {
      filteredProjects = filteredProjects.filter(p => p.status === filterStatus);
    }

    // Apply sorting
    if (sortConfig) {
      filteredProjects.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof Project];
        const bValue = b[sortConfig.key as keyof Project];

        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    return filteredProjects;
  };

  const filterExperiments = (): Experiment[] => {
    let filteredExperiments = [...experiments];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredExperiments = filteredExperiments.filter(e => 
        e.name.toLowerCase().includes(term) || 
        e.description.toLowerCase().includes(term) ||
        e.protocol.toLowerCase().includes(term) ||
        e.results.toLowerCase().includes(term) ||
        e.conclusion.toLowerCase().includes(term)
      );
    }

    // Apply type filter
    if (filterExperimentType !== 'All') {
      filteredExperiments = filteredExperiments.filter(e => e.type === filterExperimentType);
    }

    // Apply sorting
    if (sortConfig) {
      filteredExperiments.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof Experiment];
        const bValue = b[sortConfig.key as keyof Experiment];

        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    return filteredExperiments;
  };

  const filterCompounds = (): Compound[] => {
    let filteredCompounds = [...compounds];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredCompounds = filteredCompounds.filter(c => 
        c.name.toLowerCase().includes(term) || 
        c.smiles.toLowerCase().includes(term) ||
        c.targetActivity.toLowerCase().includes(term) ||
        (c.toxicity && c.toxicity.toLowerCase().includes(term)) ||
        (c.solubility && c.solubility.toLowerCase().includes(term))
      );
    }

    // Apply category filter
    if (filterCompoundCategory !== 'All') {
      filteredCompounds = filteredCompounds.filter(c => c.category === filterCompoundCategory);
    }

    // Apply sorting
    if (sortConfig) {
      filteredCompounds.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof Compound];
        const bValue = b[sortConfig.key as keyof Compound];

        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    return filteredCompounds;
  };

  const filterExperimentalData = (): ExperimentalData[] => {
    let filteredData = [...experimentalData];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredData = filteredData.filter(d => 
        d.measurementType.toLowerCase().includes(term) || 
        d.notes.toLowerCase().includes(term)
      );
    }

    // Apply sorting
    if (sortConfig) {
      filteredData.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof ExperimentalData];
        const bValue = b[sortConfig.key as keyof ExperimentalData];

        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    return filteredData;
  };

  const handleSort = (key: string): void => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Dashboard data calculations
  const getDashboardStats = (): DashboardStat[] => [
    {
      title: 'Active Projects',
      value: projects.filter(p => p.status === ProjectStatus.ONGOING).length,
      icon: <BrainCircuit className="h-8 w-8" />,
      change: 12,
      color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    },
    {
      title: 'Total Experiments',
      value: experiments.length,
      icon: <FlaskConical className="h-8 w-8" />,
      change: 8,
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    },
    {
      title: 'Compounds',
      value: compounds.length,
      icon: <Pill className="h-8 w-8" />,
      change: 23,
      color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    },
    {
      title: 'Data Points',
      value: experimentalData.length,
      icon: <Database className="h-8 w-8" />,
      change: 42,
      color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    }
  ];

  const getCompoundsByCategoryData = (): ChartData[] => {
    const categories = Object.values(CompoundCategory);
    return categories.map(category => ({
      name: category,
      value: compounds.filter(c => c.category === category).length
    }));
  };

  const getExperimentsByTypeData = (): ChartData[] => {
    const types = Object.values(ExperimentType);
    return types.map(type => ({
      name: type,
      value: experiments.filter(e => e.type === type).length
    }));
  };

  const getProjectTrendData = (): ChartData[] => {
    // Mock trend data - in a real app, this would be calculated from actual historical data
    return [
      { name: 'Jan', value: 4 },
      { name: 'Feb', value: 7 },
      { name: 'Mar', value: 5 },
      { name: 'Apr', value: 8 },
      { name: 'May', value: 12 },
      { name: 'Jun', value: 14 },
      { name: 'Jul', value: 18 },
      { name: 'Aug', value: 16 },
      { name: 'Sep', value: 20 }
    ];
  };

  const getRecentActivity = () => {
    // Combine all items with timestamps, sort by date, and take recent ones
    const allItems = [
      ...projects.map(p => ({ type: 'project', item: p, date: new Date(p.updatedAt) })),
      ...experiments.map(e => ({ type: 'experiment', item: e, date: new Date(e.updatedAt) })),
      ...compounds.map(c => ({ type: 'compound', item: c, date: new Date(c.updatedAt) })),
      ...experimentalData.map(d => ({ type: 'data', item: d, date: new Date(d.updatedAt) }))
    ];

    return allItems
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 5);
  };

  // Template download handlers
  const downloadProjectTemplate = () => {
    const template = {
      name: 'Project Name',
      description: 'Project Description',
      status: 'Ongoing',
      startDate: '2023-01-01',
      endDate: '2023-12-31',
      target: 'Target Name',
      leadResearcher: 'Lead Researcher Name',
      collaborators: ['Collaborator 1', 'Collaborator 2']
    };

    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'project_template.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadExperimentTemplate = () => {
    const template = {
      projectId: 'project-id',
      name: 'Experiment Name',
      type: 'In Vitro',
      description: 'Experiment Description',
      protocol: 'Experiment Protocol',
      startDate: '2023-01-01',
      endDate: '2023-01-15',
      results: 'Experiment Results',
      conclusion: 'Experiment Conclusion'
    };

    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'experiment_template.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadCompoundTemplate = () => {
    const template = {
      name: 'Compound Name',
      smiles: 'CN1C=NC2=C1C(=O)N(C(=O)N2C)C',
      molWeight: 194.19,
      category: 'Small Molecule',
      targetActivity: 'Enzyme inhibition',
      ic50: 0.5,
      status: 'Active',
      toxicity: 'Low',
      solubility: 'Water soluble'
    };

    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'compound_template.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadDataTemplate = () => {
    const template = {
      experimentId: 'experiment-id',
      compoundId: 'compound-id',
      measurementType: 'IC50',
      value: 0.5,
      unit: 'nM',
      date: '2023-01-01',
      notes: 'Measurement notes'
    };

    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data_template.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Render UI components
  const renderDashboard = () => {
    const stats = getDashboardStats();
    const compoundsByCategory = getCompoundsByCategoryData();
    const experimentsByType = getExperimentsByTypeData();
    const projectTrend = getProjectTrendData();
    const recentActivity = getRecentActivity();

    // Color arrays for charts
    const COLORS = ['#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c', '#d0ed57'];

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="card theme-transition">
              <div className={`inline-flex items-center justify-center p-3 rounded-full ${stat.color}`}>
                {stat.icon}
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-bold dark:text-white">{stat.value}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.title}</p>
              </div>
              {stat.change && (
                <div className="mt-2 flex items-center text-sm">
                  <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-500">{stat.change}% increase</span>
                  <span className="text-gray-400 ml-1">from last month</span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Project Trends Chart */}
          <div className="card theme-transition">
            <h3 className="text-lg font-semibold mb-4 dark:text-white">Project Growth Trends</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={projectTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip />
                  <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Compounds by Category Chart */}
          <div className="card theme-transition">
            <h3 className="text-lg font-semibold mb-4 dark:text-white">Compounds by Category</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={compoundsByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {compoundsByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Experiments by Type Chart */}
          <div className="card theme-transition">
            <h3 className="text-lg font-semibold mb-4 dark:text-white">Experiments by Type</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={experimentsByType} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip />
                  <Bar dataKey="value" fill="#82ca9d">
                    {experimentsByType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card theme-transition">
            <h3 className="text-lg font-semibold mb-4 dark:text-white">Recent Activity</h3>
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => {
                  let icon;
                  let title = '';
                  let detail = '';

                  switch (activity.type) {
                    case 'project':
                      icon = <BrainCircuit className="h-5 w-5 text-purple-500" />;
                      title = activity.item.name;
                      detail = `Project ${activity.item.status}`;
                      break;
                    case 'experiment':
                      icon = <FlaskConical className="h-5 w-5 text-blue-500" />;
                      title = activity.item.name;
                      detail = `${activity.item.type} experiment`;
                      break;
                    case 'compound':
                      icon = <Pill className="h-5 w-5 text-green-500" />;
                      title = activity.item.name;
                      detail = `${activity.item.category} compound`;
                      break;
                    case 'data':
                      icon = <Database className="h-5 w-5 text-yellow-500" />;
                      title = activity.item.measurementType;
                      detail = `${activity.item.value} ${activity.item.unit}`;
                      break;
                    default:
                      break;
                  }

                  return (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">{icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{title}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{detail}</p>
                      </div>
                      <div className="flex-shrink-0 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {format(activity.date, 'MMM d, yyyy')}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm">No recent activity found.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderProjects = () => {
    const filteredProjects = filterProjects();

    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="input pl-10"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative">
              <select
                className="input appearance-none pr-8"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                aria-label="Filter by status"
              >
                <option value="All">All Statuses</option>
                {Object.values(ProjectStatus).map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <ChevronDown className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              className="btn btn-primary flex items-center gap-2"
              onClick={() => openModal('project')}
            >
              <Plus className="h-5 w-5" />
              <span>Add Project</span>
            </button>
            <button 
              className="btn flex items-center gap-2"
              onClick={downloadProjectTemplate}
            >
              <Download className="h-5 w-5" />
              <span className="hidden sm:inline">Template</span>
            </button>
          </div>
        </div>

        {filteredProjects.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th 
                    className="table-header cursor-pointer"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center">
                      <span>Name</span>
                      {sortConfig?.key === 'name' && (
                        sortConfig.direction === 'ascending' ? 
                          <ChevronUp className="ml-1 h-4 w-4" /> : 
                          <ChevronDown className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="table-header cursor-pointer"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center">
                      <span>Status</span>
                      {sortConfig?.key === 'status' && (
                        sortConfig.direction === 'ascending' ? 
                          <ChevronUp className="ml-1 h-4 w-4" /> : 
                          <ChevronDown className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th className="table-header hidden md:table-cell">Target</th>
                  <th 
                    className="table-header hidden lg:table-cell cursor-pointer"
                    onClick={() => handleSort('startDate')}
                  >
                    <div className="flex items-center">
                      <span>Start Date</span>
                      {sortConfig?.key === 'startDate' && (
                        sortConfig.direction === 'ascending' ? 
                          <ChevronUp className="ml-1 h-4 w-4" /> : 
                          <ChevronDown className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th className="table-header hidden lg:table-cell">Lead Researcher</th>
                  <th className="table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="table-cell font-medium text-gray-900 dark:text-white">{project.name}</td>
                    <td className="table-cell">
                      <span className={`badge ${project.status === ProjectStatus.ONGOING ? 'badge-success' : 
                                    project.status === ProjectStatus.COMPLETED ? 'badge-info' : 
                                    project.status === ProjectStatus.PLANNED ? 'badge-warning' : 'badge-error'}`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="table-cell hidden md:table-cell">{project.target}</td>
                    <td className="table-cell hidden lg:table-cell">{format(new Date(project.startDate), 'MMM d, yyyy')}</td>
                    <td className="table-cell hidden lg:table-cell">{project.leadResearcher}</td>
                    <td className="table-cell text-right">
                      <div className="flex justify-end items-center gap-2">
                        <button 
                          className="btn btn-sm btn-primary"
                          onClick={() => openModal('project', project)}
                          aria-label={`Edit ${project.name}`}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          className="btn btn-sm btn-error"
                          onClick={() => openModal('deleteProject', project)}
                          aria-label={`Delete ${project.name}`}
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
        ) : (
          <div className="text-center py-8">
            <Beaker className="h-12 w-12 mx-auto text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">No projects found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by creating a new project.</p>
            <div className="mt-6">
              <button 
                className="btn btn-primary inline-flex items-center"
                onClick={() => openModal('project')}
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Project
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderExperiments = () => {
    const filteredExperiments = filterExperiments();

    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="input pl-10"
                placeholder="Search experiments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative">
              <select
                className="input appearance-none pr-8"
                value={filterExperimentType}
                onChange={(e) => setFilterExperimentType(e.target.value)}
                aria-label="Filter by experiment type"
              >
                <option value="All">All Types</option>
                {Object.values(ExperimentType).map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <ChevronDown className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              className="btn btn-primary flex items-center gap-2"
              onClick={() => openModal('experiment')}
            >
              <Plus className="h-5 w-5" />
              <span>Add Experiment</span>
            </button>
            <button 
              className="btn flex items-center gap-2"
              onClick={downloadExperimentTemplate}
            >
              <Download className="h-5 w-5" />
              <span className="hidden sm:inline">Template</span>
            </button>
          </div>
        </div>

        {filteredExperiments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th 
                    className="table-header cursor-pointer"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center">
                      <span>Name</span>
                      {sortConfig?.key === 'name' && (
                        sortConfig.direction === 'ascending' ? 
                          <ChevronUp className="ml-1 h-4 w-4" /> : 
                          <ChevronDown className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="table-header cursor-pointer"
                    onClick={() => handleSort('type')}
                  >
                    <div className="flex items-center">
                      <span>Type</span>
                      {sortConfig?.key === 'type' && (
                        sortConfig.direction === 'ascending' ? 
                          <ChevronUp className="ml-1 h-4 w-4" /> : 
                          <ChevronDown className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th className="table-header hidden md:table-cell">Project</th>
                  <th 
                    className="table-header hidden lg:table-cell cursor-pointer"
                    onClick={() => handleSort('startDate')}
                  >
                    <div className="flex items-center">
                      <span>Start Date</span>
                      {sortConfig?.key === 'startDate' && (
                        sortConfig.direction === 'ascending' ? 
                          <ChevronUp className="ml-1 h-4 w-4" /> : 
                          <ChevronDown className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th className="table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExperiments.map((experiment) => {
                  const project = projects.find(p => p.id === experiment.projectId);
                  return (
                    <tr key={experiment.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="table-cell font-medium text-gray-900 dark:text-white">{experiment.name}</td>
                      <td className="table-cell">
                        <span className={`badge ${experiment.type === ExperimentType.IN_VITRO ? 'badge-info' : 
                                      experiment.type === ExperimentType.IN_VIVO ? 'badge-warning' : 
                                      experiment.type === ExperimentType.COMPUTATIONAL ? 'badge-success' : 'badge-primary'}`}>
                          {experiment.type}
                        </span>
                      </td>
                      <td className="table-cell hidden md:table-cell">{project?.name || 'N/A'}</td>
                      <td className="table-cell hidden lg:table-cell">{format(new Date(experiment.startDate), 'MMM d, yyyy')}</td>
                      <td className="table-cell text-right">
                        <div className="flex justify-end items-center gap-2">
                          <button 
                            className="btn btn-sm btn-primary"
                            onClick={() => openModal('experiment', experiment)}
                            aria-label={`Edit ${experiment.name}`}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            className="btn btn-sm btn-error"
                            onClick={() => openModal('deleteExperiment', experiment)}
                            aria-label={`Delete ${experiment.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
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
          <div className="text-center py-8">
            <FlaskConical className="h-12 w-12 mx-auto text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">No experiments found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by creating a new experiment.</p>
            <div className="mt-6">
              <button 
                className="btn btn-primary inline-flex items-center"
                onClick={() => openModal('experiment')}
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Experiment
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderCompounds = () => {
    const filteredCompounds = filterCompounds();

    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="input pl-10"
                placeholder="Search compounds..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative">
              <select
                className="input appearance-none pr-8"
                value={filterCompoundCategory}
                onChange={(e) => setFilterCompoundCategory(e.target.value)}
                aria-label="Filter by compound category"
              >
                <option value="All">All Categories</option>
                {Object.values(CompoundCategory).map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <ChevronDown className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              className="btn btn-primary flex items-center gap-2"
              onClick={() => openModal('compound')}
            >
              <Plus className="h-5 w-5" />
              <span>Add Compound</span>
            </button>
            <button 
              className="btn flex items-center gap-2"
              onClick={downloadCompoundTemplate}
            >
              <Download className="h-5 w-5" />
              <span className="hidden sm:inline">Template</span>
            </button>
          </div>
        </div>

        {filteredCompounds.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th 
                    className="table-header cursor-pointer"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center">
                      <span>Name</span>
                      {sortConfig?.key === 'name' && (
                        sortConfig.direction === 'ascending' ? 
                          <ChevronUp className="ml-1 h-4 w-4" /> : 
                          <ChevronDown className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="table-header cursor-pointer"
                    onClick={() => handleSort('category')}
                  >
                    <div className="flex items-center">
                      <span>Category</span>
                      {sortConfig?.key === 'category' && (
                        sortConfig.direction === 'ascending' ? 
                          <ChevronUp className="ml-1 h-4 w-4" /> : 
                          <ChevronDown className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th className="table-header hidden md:table-cell">SMILES</th>
                  <th 
                    className="table-header hidden lg:table-cell cursor-pointer"
                    onClick={() => handleSort('molWeight')}
                  >
                    <div className="flex items-center">
                      <span>Mol Weight</span>
                      {sortConfig?.key === 'molWeight' && (
                        sortConfig.direction === 'ascending' ? 
                          <ChevronUp className="ml-1 h-4 w-4" /> : 
                          <ChevronDown className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th className="table-header hidden lg:table-cell">Target Activity</th>
                  <th className="table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCompounds.map((compound) => (
                  <tr key={compound.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="table-cell font-medium text-gray-900 dark:text-white">{compound.name}</td>
                    <td className="table-cell">
                      <span className={`badge ${compound.category === CompoundCategory.SMALL_MOLECULE ? 'badge-primary' : 
                                    compound.category === CompoundCategory.PEPTIDE ? 'badge-success' : 
                                    compound.category === CompoundCategory.ANTIBODY ? 'badge-warning' : 
                                    compound.category === CompoundCategory.PROTEIN ? 'badge-info' :
                                    compound.category === CompoundCategory.NUCLEIC_ACID ? 'badge-error' : 'badge'}`}>
                        {compound.category}
                      </span>
                    </td>
                    <td className="table-cell hidden md:table-cell truncate max-w-xs">{compound.smiles}</td>
                    <td className="table-cell hidden lg:table-cell">{compound.molWeight} g/mol</td>
                    <td className="table-cell hidden lg:table-cell">{compound.targetActivity}</td>
                    <td className="table-cell text-right">
                      <div className="flex justify-end items-center gap-2">
                        <button 
                          className="btn btn-sm btn-primary"
                          onClick={() => openModal('compound', compound)}
                          aria-label={`Edit ${compound.name}`}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          className="btn btn-sm btn-error"
                          onClick={() => openModal('deleteCompound', compound)}
                          aria-label={`Delete ${compound.name}`}
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
        ) : (
          <div className="text-center py-8">
            <Pill className="h-12 w-12 mx-auto text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">No compounds found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by creating a new compound.</p>
            <div className="mt-6">
              <button 
                className="btn btn-primary inline-flex items-center"
                onClick={() => openModal('compound')}
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Compound
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderExperimentalData = () => {
    const filteredData = filterExperimentalData();

    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="input pl-10"
                placeholder="Search data..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              className="btn btn-primary flex items-center gap-2"
              onClick={() => openModal('data')}
            >
              <Plus className="h-5 w-5" />
              <span>Add Data</span>
            </button>
            <button 
              className="btn flex items-center gap-2"
              onClick={downloadDataTemplate}
            >
              <Download className="h-5 w-5" />
              <span className="hidden sm:inline">Template</span>
            </button>
          </div>
        </div>

        {filteredData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th className="table-header">Experiment</th>
                  <th className="table-header">Compound</th>
                  <th 
                    className="table-header cursor-pointer"
                    onClick={() => handleSort('measurementType')}
                  >
                    <div className="flex items-center">
                      <span>Measurement</span>
                      {sortConfig?.key === 'measurementType' && (
                        sortConfig.direction === 'ascending' ? 
                          <ChevronUp className="ml-1 h-4 w-4" /> : 
                          <ChevronDown className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="table-header cursor-pointer"
                    onClick={() => handleSort('value')}
                  >
                    <div className="flex items-center">
                      <span>Value</span>
                      {sortConfig?.key === 'value' && (
                        sortConfig.direction === 'ascending' ? 
                          <ChevronUp className="ml-1 h-4 w-4" /> : 
                          <ChevronDown className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th className="table-header hidden lg:table-cell">Unit</th>
                  <th 
                    className="table-header hidden md:table-cell cursor-pointer"
                    onClick={() => handleSort('date')}
                  >
                    <div className="flex items-center">
                      <span>Date</span>
                      {sortConfig?.key === 'date' && (
                        sortConfig.direction === 'ascending' ? 
                          <ChevronUp className="ml-1 h-4 w-4" /> : 
                          <ChevronDown className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th className="table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((data) => {
                  const experiment = experiments.find(e => e.id === data.experimentId);
                  const compound = compounds.find(c => c.id === data.compoundId);
                  return (
                    <tr key={data.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="table-cell">{experiment?.name || 'N/A'}</td>
                      <td className="table-cell">{compound?.name || 'N/A'}</td>
                      <td className="table-cell font-medium text-gray-900 dark:text-white">{data.measurementType}</td>
                      <td className="table-cell">{data.value}</td>
                      <td className="table-cell hidden lg:table-cell">{data.unit}</td>
                      <td className="table-cell hidden md:table-cell">{format(new Date(data.date), 'MMM d, yyyy')}</td>
                      <td className="table-cell text-right">
                        <div className="flex justify-end items-center gap-2">
                          <button 
                            className="btn btn-sm btn-primary"
                            onClick={() => openModal('data', data)}
                            aria-label={`Edit data for ${data.measurementType}`}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            className="btn btn-sm btn-error"
                            onClick={() => openModal('deleteData', data)}
                            aria-label={`Delete data for ${data.measurementType}`}
                          >
                            <Trash2 className="h-4 w-4" />
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
          <div className="text-center py-8">
            <Database className="h-12 w-12 mx-auto text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">No experimental data found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by adding some experimental data.</p>
            <div className="mt-6">
              <button 
                className="btn btn-primary inline-flex items-center"
                onClick={() => openModal('data')}
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Data
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Modal content rendering based on activeModal
  const renderModalContent = () => {
    switch (activeModal) {
      case 'project':
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4 dark:text-white">
              {currentProject ? 'Edit Project' : 'Add New Project'}
            </h2>
            <form onSubmit={projectForm.handleSubmit(handleAddProject)} className="space-y-4">
              <div className="form-group">
                <label className="form-label" htmlFor="project-name">Project Name</label>
                <input
                  id="project-name"
                  className="input"
                  type="text"
                  placeholder="Enter project name"
                  {...projectForm.register('name', { required: true })}
                />
                {projectForm.formState.errors.name && (
                  <p className="form-error">Project name is required</p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="project-description">Description</label>
                <textarea
                  id="project-description"
                  className="input min-h-[100px]"
                  placeholder="Enter project description"
                  {...projectForm.register('description', { required: true })}
                />
                {projectForm.formState.errors.description && (
                  <p className="form-error">Description is required</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="project-status">Status</label>
                  <select
                    id="project-status"
                    className="input"
                    {...projectForm.register('status', { required: true })}
                  >
                    {Object.values(ProjectStatus).map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                  {projectForm.formState.errors.status && (
                    <p className="form-error">Status is required</p>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="project-target">Target</label>
                  <input
                    id="project-target"
                    className="input"
                    type="text"
                    placeholder="e.g., Enzyme, Receptor"
                    {...projectForm.register('target', { required: true })}
                  />
                  {projectForm.formState.errors.target && (
                    <p className="form-error">Target is required</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="project-start-date">Start Date</label>
                  <input
                    id="project-start-date"
                    className="input"
                    type="date"
                    {...projectForm.register('startDate', { required: true })}
                  />
                  {projectForm.formState.errors.startDate && (
                    <p className="form-error">Start date is required</p>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="project-end-date">End Date (if completed)</label>
                  <input
                    id="project-end-date"
                    className="input"
                    type="date"
                    {...projectForm.register('endDate')}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="project-lead">Lead Researcher</label>
                <input
                  id="project-lead"
                  className="input"
                  type="text"
                  placeholder="Enter lead researcher name"
                  {...projectForm.register('leadResearcher', { required: true })}
                />
                {projectForm.formState.errors.leadResearcher && (
                  <p className="form-error">Lead researcher is required</p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="project-collaborators">Collaborators (comma separated)</label>
                <input
                  id="project-collaborators"
                  className="input"
                  type="text"
                  placeholder="e.g., John Doe, Jane Smith"
                  defaultValue={currentProject?.collaborators?.join(', ') || ''}
                  {...projectForm.register('collaborators', {
                    setValueAs: (v: string) => v.split(',').map(s => s.trim()).filter(s => s !== '')
                  })}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  {currentProject ? 'Update Project' : 'Add Project'}
                </button>
              </div>
            </form>
          </div>
        );

      case 'experiment':
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4 dark:text-white">
              {currentExperiment ? 'Edit Experiment' : 'Add New Experiment'}
            </h2>
            <form onSubmit={experimentForm.handleSubmit(handleAddExperiment)} className="space-y-4">
              <div className="form-group">
                <label className="form-label" htmlFor="experiment-name">Experiment Name</label>
                <input
                  id="experiment-name"
                  className="input"
                  type="text"
                  placeholder="Enter experiment name"
                  {...experimentForm.register('name', { required: true })}
                />
                {experimentForm.formState.errors.name && (
                  <p className="form-error">Experiment name is required</p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="experiment-project">Project</label>
                <select
                  id="experiment-project"
                  className="input"
                  {...experimentForm.register('projectId', { required: true })}
                >
                  <option value="">Select a project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>{project.name}</option>
                  ))}
                </select>
                {experimentForm.formState.errors.projectId && (
                  <p className="form-error">Project is required</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="experiment-type">Type</label>
                  <select
                    id="experiment-type"
                    className="input"
                    {...experimentForm.register('type', { required: true })}
                  >
                    {Object.values(ExperimentType).map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {experimentForm.formState.errors.type && (
                    <p className="form-error">Type is required</p>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="experiment-protocol">Protocol</label>
                  <input
                    id="experiment-protocol"
                    className="input"
                    type="text"
                    placeholder="e.g., Standard procedure #123"
                    {...experimentForm.register('protocol', { required: true })}
                  />
                  {experimentForm.formState.errors.protocol && (
                    <p className="form-error">Protocol is required</p>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="experiment-description">Description</label>
                <textarea
                  id="experiment-description"
                  className="input min-h-[100px]"
                  placeholder="Enter experiment description"
                  {...experimentForm.register('description', { required: true })}
                />
                {experimentForm.formState.errors.description && (
                  <p className="form-error">Description is required</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="experiment-start-date">Start Date</label>
                  <input
                    id="experiment-start-date"
                    className="input"
                    type="date"
                    {...experimentForm.register('startDate', { required: true })}
                  />
                  {experimentForm.formState.errors.startDate && (
                    <p className="form-error">Start date is required</p>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="experiment-end-date">End Date (if completed)</label>
                  <input
                    id="experiment-end-date"
                    className="input"
                    type="date"
                    {...experimentForm.register('endDate')}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="experiment-results">Results</label>
                <textarea
                  id="experiment-results"
                  className="input min-h-[100px]"
                  placeholder="Enter experiment results"
                  {...experimentForm.register('results', { required: true })}
                />
                {experimentForm.formState.errors.results && (
                  <p className="form-error">Results are required</p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="experiment-conclusion">Conclusion</label>
                <textarea
                  id="experiment-conclusion"
                  className="input min-h-[100px]"
                  placeholder="Enter experiment conclusion"
                  {...experimentForm.register('conclusion', { required: true })}
                />
                {experimentForm.formState.errors.conclusion && (
                  <p className="form-error">Conclusion is required</p>
                )}
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  {currentExperiment ? 'Update Experiment' : 'Add Experiment'}
                </button>
              </div>
            </form>
          </div>
        );

      case 'compound':
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4 dark:text-white">
              {currentCompound ? 'Edit Compound' : 'Add New Compound'}
            </h2>
            <form onSubmit={compoundForm.handleSubmit(handleAddCompound)} className="space-y-4">
              <div className="form-group">
                <label className="form-label" htmlFor="compound-name">Compound Name</label>
                <input
                  id="compound-name"
                  className="input"
                  type="text"
                  placeholder="Enter compound name"
                  {...compoundForm.register('name', { required: true })}
                />
                {compoundForm.formState.errors.name && (
                  <p className="form-error">Compound name is required</p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="compound-smiles">SMILES Notation</label>
                <input
                  id="compound-smiles"
                  className="input"
                  type="text"
                  placeholder="e.g., CC(=O)OC1=CC=CC=C1C(=O)O"
                  {...compoundForm.register('smiles', { required: true })}
                />
                {compoundForm.formState.errors.smiles && (
                  <p className="form-error">SMILES notation is required</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="compound-molweight">Molecular Weight (g/mol)</label>
                  <input
                    id="compound-molweight"
                    className="input"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 180.16"
                    {...compoundForm.register('molWeight', { 
                      required: true,
                      valueAsNumber: true,
                      min: 0
                    })}
                  />
                  {compoundForm.formState.errors.molWeight && (
                    <p className="form-error">Valid molecular weight is required</p>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="compound-category">Category</label>
                  <select
                    id="compound-category"
                    className="input"
                    {...compoundForm.register('category', { required: true })}
                  >
                    {Object.values(CompoundCategory).map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  {compoundForm.formState.errors.category && (
                    <p className="form-error">Category is required</p>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="compound-target">Target Activity</label>
                <input
                  id="compound-target"
                  className="input"
                  type="text"
                  placeholder="e.g., Kinase inhibition"
                  {...compoundForm.register('targetActivity', { required: true })}
                />
                {compoundForm.formState.errors.targetActivity && (
                  <p className="form-error">Target activity is required</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="compound-ic50">IC50 (nM)</label>
                  <input
                    id="compound-ic50"
                    className="input"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 25.4"
                    {...compoundForm.register('ic50', { 
                      valueAsNumber: true,
                      min: 0
                    })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="compound-status">Status</label>
                  <input
                    id="compound-status"
                    className="input"
                    type="text"
                    placeholder="e.g., Active, Inactive"
                    {...compoundForm.register('status', { required: true })}
                  />
                  {compoundForm.formState.errors.status && (
                    <p className="form-error">Status is required</p>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="compound-toxicity">Toxicity</label>
                  <input
                    id="compound-toxicity"
                    className="input"
                    type="text"
                    placeholder="e.g., Low, Medium, High"
                    {...compoundForm.register('toxicity')}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="compound-solubility">Solubility</label>
                <input
                  id="compound-solubility"
                  className="input"
                  type="text"
                  placeholder="e.g., Water soluble, DMSO soluble"
                  {...compoundForm.register('solubility')}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  {currentCompound ? 'Update Compound' : 'Add Compound'}
                </button>
              </div>
            </form>
          </div>
        );

      case 'data':
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4 dark:text-white">
              {currentData ? 'Edit Experimental Data' : 'Add New Experimental Data'}
            </h2>
            <form onSubmit={dataForm.handleSubmit(handleAddData)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="data-experiment">Experiment</label>
                  <select
                    id="data-experiment"
                    className="input"
                    {...dataForm.register('experimentId', { required: true })}
                  >
                    <option value="">Select an experiment</option>
                    {experiments.map((experiment) => (
                      <option key={experiment.id} value={experiment.id}>{experiment.name}</option>
                    ))}
                  </select>
                  {dataForm.formState.errors.experimentId && (
                    <p className="form-error">Experiment is required</p>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="data-compound">Compound</label>
                  <select
                    id="data-compound"
                    className="input"
                    {...dataForm.register('compoundId', { required: true })}
                  >
                    <option value="">Select a compound</option>
                    {compounds.map((compound) => (
                      <option key={compound.id} value={compound.id}>{compound.name}</option>
                    ))}
                  </select>
                  {dataForm.formState.errors.compoundId && (
                    <p className="form-error">Compound is required</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="data-measurement">Measurement Type</label>
                  <input
                    id="data-measurement"
                    className="input"
                    type="text"
                    placeholder="e.g., IC50, Ki, EC50"
                    {...dataForm.register('measurementType', { required: true })}
                  />
                  {dataForm.formState.errors.measurementType && (
                    <p className="form-error">Measurement type is required</p>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="data-value">Value</label>
                  <input
                    id="data-value"
                    className="input"
                    type="number"
                    step="0.000001"
                    placeholder="e.g., 25.4"
                    {...dataForm.register('value', { 
                      required: true, 
                      valueAsNumber: true
                    })}
                  />
                  {dataForm.formState.errors.value && (
                    <p className="form-error">Valid numeric value is required</p>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="data-unit">Unit</label>
                  <input
                    id="data-unit"
                    className="input"
                    type="text"
                    placeholder="e.g., nM, µM, %"
                    {...dataForm.register('unit', { required: true })}
                  />
                  {dataForm.formState.errors.unit && (
                    <p className="form-error">Unit is required</p>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="data-date">Date</label>
                <input
                  id="data-date"
                  className="input"
                  type="date"
                  {...dataForm.register('date', { required: true })}
                />
                {dataForm.formState.errors.date && (
                  <p className="form-error">Date is required</p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="data-notes">Notes</label>
                <textarea
                  id="data-notes"
                  className="input min-h-[100px]"
                  placeholder="Enter any additional notes"
                  {...dataForm.register('notes')}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  {currentData ? 'Update Data' : 'Add Data'}
                </button>
              </div>
            </form>
          </div>
        );

      case 'deleteProject':
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4 dark:text-white">Delete Project</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete the project <strong className="text-gray-900 dark:text-white">{currentProject?.name}</strong>? 
              This will also delete all experiments and data associated with this project. This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-error"
                onClick={handleDeleteProject}
              >
                Delete Project
              </button>
            </div>
          </div>
        );

      case 'deleteExperiment':
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4 dark:text-white">Delete Experiment</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete the experiment <strong className="text-gray-900 dark:text-white">{currentExperiment?.name}</strong>? 
              This will also delete all data associated with this experiment. This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-error"
                onClick={handleDeleteExperiment}
              >
                Delete Experiment
              </button>
            </div>
          </div>
        );

      case 'deleteCompound':
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4 dark:text-white">Delete Compound</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete the compound <strong className="text-gray-900 dark:text-white">{currentCompound?.name}</strong>? 
              This will also delete all data associated with this compound. This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-error"
                onClick={handleDeleteCompound}
              >
                Delete Compound
              </button>
            </div>
          </div>
        );

      case 'deleteData':
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4 dark:text-white">Delete Experimental Data</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete this experimental data point? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-error"
                onClick={handleDeleteData}
              >
                Delete Data
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Main render
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 theme-transition">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm theme-transition">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between">
          <div className="flex items-center mb-4 sm:mb-0">
            <Microscope className="h-8 w-8 text-primary-600 dark:text-primary-400" />
            <h1 className="ml-2 text-xl font-bold text-gray-900 dark:text-white">ScienceTracker</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              className="theme-toggle p-2 rounded-full bg-gray-200 dark:bg-gray-700 focus:outline-none"
              onClick={() => setIsDarkMode(!isDarkMode)}
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5 text-yellow-500" />
              ) : (
                <Moon className="h-5 w-5 text-gray-700" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm theme-transition">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto">
            <button
              className={`flex items-center px-4 py-3 text-sm font-medium ${activeTab === 'dashboard' ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
              onClick={() => {
                setActiveTab('dashboard');
                setSearchTerm('');
                setSortConfig(null);
              }}
            >
              <ChartBar className="h-5 w-5 mr-2" />
              Dashboard
            </button>
            <button
              className={`flex items-center px-4 py-3 text-sm font-medium ${activeTab === 'projects' ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
              onClick={() => {
                setActiveTab('projects');
                setSearchTerm('');
                setFilterStatus('All');
                setSortConfig(null);
              }}
            >
              <BrainCircuit className="h-5 w-5 mr-2" />
              Projects
            </button>
            <button
              className={`flex items-center px-4 py-3 text-sm font-medium ${activeTab === 'experiments' ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
              onClick={() => {
                setActiveTab('experiments');
                setSearchTerm('');
                setFilterExperimentType('All');
                setSortConfig(null);
              }}
            >
              <FlaskConical className="h-5 w-5 mr-2" />
              Experiments
            </button>
            <button
              className={`flex items-center px-4 py-3 text-sm font-medium ${activeTab === 'compounds' ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
              onClick={() => {
                setActiveTab('compounds');
                setSearchTerm('');
                setFilterCompoundCategory('All');
                setSortConfig(null);
              }}
            >
              <Pill className="h-5 w-5 mr-2" />
              Compounds
            </button>
            <button
              className={`flex items-center px-4 py-3 text-sm font-medium ${activeTab === 'data' ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
              onClick={() => {
                setActiveTab('data');
                setSearchTerm('');
                setSortConfig(null);
              }}
            >
              <Database className="h-5 w-5 mr-2" />
              Data
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 dark:border-primary-400"></div>
          </div>
        ) : (
          <div>
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'projects' && renderProjects()}
            {activeTab === 'experiments' && renderExperiments()}
            {activeTab === 'compounds' && renderCompounds()}
            {activeTab === 'data' && renderExperimentalData()}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 theme-transition shadow-sm mt-auto">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Copyright © 2025 of Datavtar Private Limited. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black opacity-50 transition-opacity"></div>
            <div 
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-auto z-50 overflow-hidden theme-transition"
              ref={modalRef}
            >
              <div className="p-6">
                <div className="absolute top-4 right-4">
                  <button 
                    className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                    onClick={closeModal}
                    aria-label="Close modal"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                {renderModalContent()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;