import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { 
  Plus, X, Search, Edit, Trash2, Download, Upload, Filter, ArrowUp, ArrowDown,
  Microscope, TestTube, FileText, Dna, FlaskConical, ChartBar, ChartLine, Brain,
  Moon, Sun, Menu, UserRound, Biohazard
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import styles from './styles/styles.module.css';

const App: React.FC = () => {
  // Types & Interfaces
  type ProjectStatus = 'Active' | 'Completed' | 'On Hold' | 'Planning';
  type MoleculeStatus = 'Synthesis' | 'Testing' | 'Validation' | 'Failed' | 'Approved';
  type ExperimentType = 'In vitro' | 'In vivo' | 'Computational' | 'Analytical';
  
  interface Project {
    id: string;
    title: string;
    description: string;
    status: ProjectStatus;
    startDate: string;
    targetDate: string;
    collaborators: string[];
    tags: string[];
    createdAt: string;
    updatedAt: string;
  }
  
  interface Molecule {
    id: string;
    name: string;
    formula: string;
    structure: string; // could be a SMILES/InChI string or image reference
    molecularWeight: number;
    status: MoleculeStatus;
    projectId: string;
    targetActivity: string;
    purity: number;
    createdAt: string;
    tags: string[];
  }
  
  interface Experiment {
    id: string;
    title: string;
    description: string;
    type: ExperimentType;
    date: string;
    results: string;
    conclusion: string;
    projectId: string;
    moleculeIds: string[];
    performers: string[];
    tags: string[];
    createdAt: string;
  }
  
  interface Note {
    id: string;
    title: string;
    content: string;
    date: string;
    projectId: string;
    moleculeIds: string[];
    experimentIds: string[];
    tags: string[];
  }
  
  interface User {
    name: string;
    role: string;
    avatar: string;
  }
  
  interface AppData {
    projects: Project[];
    molecules: Molecule[];
    experiments: Experiment[];
    notes: Note[];
  }
  
  interface TabProps {
    name: string;
    icon: React.ReactNode;
  }
  
  interface AnalyticsData {
    projects: { name: string; count: number }[];
    molecules: { status: string; count: number }[];
    experiments: { type: string; count: number }[];
    activityByMonth: { month: string; experiments: number; molecules: number }[];
  }
  
  // App state management
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [appData, setAppData] = useState<AppData>({
    projects: [],
    molecules: [],
    experiments: [],
    notes: []
  });
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedMolecule, setSelectedMolecule] = useState<Molecule | null>(null);
  const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalType, setModalType] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [sortField, setSortField] = useState<string>('updatedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    projects: [],
    molecules: [],
    experiments: [],
    activityByMonth: []
  });
  
  // Mock current user
  const currentUser: User = {
    name: 'Dr. Marie Curie',
    role: 'Lead Scientist',
    avatar: 'https://i.pravatar.cc/150?img=5'
  };
  
  // Form handling with react-hook-form
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();
  
  // Load data from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('scientistLabData');
    const savedDarkMode = localStorage.getItem('darkMode');
    
    if (savedData) {
      setAppData(JSON.parse(savedData));
    } else {
      // Initialize with sample data
      const sampleData = generateSampleData();
      setAppData(sampleData);
      localStorage.setItem('scientistLabData', JSON.stringify(sampleData));
    }
    
    if (savedDarkMode) {
      const isDark = savedDarkMode === 'true';
      setDarkMode(isDark);
      if (isDark) {
        document.documentElement.classList.add('dark');
      }
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
    
    // Initial analytics calculation
    updateAnalytics();
  }, []);
  
  // Update localStorage when data changes
  useEffect(() => {
    localStorage.setItem('scientistLabData', JSON.stringify(appData));
    updateAnalytics();
  }, [appData]);
  
  // Update dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);
  
  // Generate sample data for initial loading
  const generateSampleData = (): AppData => {
    const now = new Date().toISOString();
    
    const projects: Project[] = [
      {
        id: 'p1',
        title: 'Novel Kinase Inhibitors',
        description: 'Development of selective kinase inhibitors for cancer therapy',
        status: 'Active',
        startDate: '2023-01-15',
        targetDate: '2024-06-30',
        collaborators: ['Dr. James Watson', 'Dr. Rosalind Franklin'],
        tags: ['cancer', 'kinase', 'inhibitors'],
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'p2',
        title: 'Antibacterial Peptides',
        description: 'Designing novel antimicrobial peptides against resistant bacteria',
        status: 'Planning',
        startDate: '2023-03-10',
        targetDate: '2024-09-15',
        collaborators: ['Dr. Alexander Fleming', 'Dr. Louis Pasteur'],
        tags: ['antibacterial', 'peptides', 'resistance'],
        createdAt: now,
        updatedAt: now
      }
    ];
    
    const molecules: Molecule[] = [
      {
        id: 'm1',
        name: 'KIN-387',
        formula: 'C21H19N5O2',
        structure: 'CC1=C(C=C(C=C1)NC(=O)C2=CC=C(C=C2)CN3CCN(CC3)C)NC4=NC=CC(=N4)C',
        molecularWeight: 374.41,
        status: 'Testing',
        projectId: 'p1',
        targetActivity: 'EGFR inhibition',
        purity: 98.5,
        createdAt: now,
        tags: ['kinase', 'EGFR', 'small molecule']
      },
      {
        id: 'm2',
        name: 'ABP-24',
        formula: 'C45H72N12O12',
        structure: 'KLFKRLFKKLLFSLRKY',
        molecularWeight: 985.13,
        status: 'Synthesis',
        projectId: 'p2',
        targetActivity: 'Membrane disruption',
        purity: 95.2,
        createdAt: now,
        tags: ['peptide', 'antibacterial', 'cationic']
      }
    ];
    
    const experiments: Experiment[] = [
      {
        id: 'e1',
        title: 'KIN-387 Enzyme Assay',
        description: 'In vitro kinase inhibition assay against purified EGFR',
        type: 'In vitro',
        date: '2023-02-20',
        results: 'IC50 = 12.3 nM against wild-type EGFR',
        conclusion: 'Compound shows promising activity, proceed to cell testing',
        projectId: 'p1',
        moleculeIds: ['m1'],
        performers: ['Dr. Marie Curie'],
        tags: ['enzyme assay', 'kinase', 'IC50'],
        createdAt: now
      },
      {
        id: 'e2',
        title: 'ABP-24 MIC Determination',
        description: 'Minimum inhibitory concentration against S. aureus and E. coli',
        type: 'In vitro',
        date: '2023-03-25',
        results: 'MIC = 4 μg/ml (S. aureus), 16 μg/ml (E. coli)',
        conclusion: 'Peptide shows higher activity against Gram-positive bacteria',
        projectId: 'p2',
        moleculeIds: ['m2'],
        performers: ['Dr. Marie Curie', 'Dr. Alexander Fleming'],
        tags: ['MIC', 'bacteria', 'antibacterial'],
        createdAt: now
      }
    ];
    
    const notes: Note[] = [
      {
        id: 'n1',
        title: 'KIN-387 Solubility Issues',
        content: 'KIN-387 shows poor aqueous solubility. Consider adding solubilizing groups or preparing as a salt form.',
        date: '2023-02-25',
        projectId: 'p1',
        moleculeIds: ['m1'],
        experimentIds: ['e1'],
        tags: ['solubility', 'formulation']
      },
      {
        id: 'n2',
        title: 'ABP-24 Stability',
        content: 'ABP-24 exhibits good stability in serum for up to 8 hours. Consider PEGylation for extended half-life.',
        date: '2023-04-02',
        projectId: 'p2',
        moleculeIds: ['m2'],
        experimentIds: ['e2'],
        tags: ['stability', 'half-life', 'PEGylation']
      }
    ];
    
    return { projects, molecules, experiments, notes };
  };
  
  // Analytics data calculation
  const updateAnalytics = () => {
    // Project analytics
    const projectStatusCount = appData.projects.reduce<Record<string, number>>((acc, project) => {
      acc[project.status] = (acc[project.status] || 0) + 1;
      return acc;
    }, {});
    
    const projectData = Object.entries(projectStatusCount).map(([name, count]) => ({
      name,
      count
    }));
    
    // Molecule analytics
    const moleculeStatusCount = appData.molecules.reduce<Record<string, number>>((acc, molecule) => {
      acc[molecule.status] = (acc[molecule.status] || 0) + 1;
      return acc;
    }, {});
    
    const moleculeData = Object.entries(moleculeStatusCount).map(([status, count]) => ({
      status,
      count
    }));
    
    // Experiment analytics
    const experimentTypeCount = appData.experiments.reduce<Record<string, number>>((acc, experiment) => {
      acc[experiment.type] = (acc[experiment.type] || 0) + 1;
      return acc;
    }, {});
    
    const experimentData = Object.entries(experimentTypeCount).map(([type, count]) => ({
      type,
      count
    }));
    
    // Activity by month
    const monthlyActivity: Record<string, { experiments: number; molecules: number }> = {};
    
    // Process experiments by month
    appData.experiments.forEach(experiment => {
      const monthYear = format(new Date(experiment.date), 'MMM yyyy');
      if (!monthlyActivity[monthYear]) {
        monthlyActivity[monthYear] = { experiments: 0, molecules: 0 };
      }
      monthlyActivity[monthYear].experiments += 1;
    });
    
    // Process molecules by month
    appData.molecules.forEach(molecule => {
      const monthYear = format(new Date(molecule.createdAt), 'MMM yyyy');
      if (!monthlyActivity[monthYear]) {
        monthlyActivity[monthYear] = { experiments: 0, molecules: 0 };
      }
      monthlyActivity[monthYear].molecules += 1;
    });
    
    // Convert to array and sort by month
    const activityData = Object.entries(monthlyActivity)
      .map(([month, data]) => ({
        month,
        ...data
      }))
      .sort((a, b) => {
        const dateA = new Date(a.month);
        const dateB = new Date(b.month);
        return dateA.getTime() - dateB.getTime();
      });
    
    setAnalyticsData({
      projects: projectData,
      molecules: moleculeData,
      experiments: experimentData,
      activityByMonth: activityData
    });
  };
  
  // Tab configuration
  const tabs: TabProps[] = [
    { name: 'dashboard', icon: <ChartBar size={20} /> },
    { name: 'projects', icon: <Microscope size={20} /> },
    { name: 'molecules', icon: <FlaskConical size={20} /> },
    { name: 'experiments', icon: <TestTube size={20} /> },
    { name: 'notes', icon: <FileText size={20} /> },
    { name: 'analytics', icon: <ChartLine size={20} /> }
  ];
  
  // Form submission handlers
  const handleFormSubmit = (data: any) => {
    const now = new Date().toISOString();
    
    switch (modalType) {
      case 'addProject':
      case 'editProject': {
        const projectData: Project = {
          id: modalType === 'addProject' ? `p${Date.now()}` : selectedProject!.id,
          title: data.title,
          description: data.description,
          status: data.status as ProjectStatus,
          startDate: data.startDate,
          targetDate: data.targetDate,
          collaborators: data.collaborators.split(',').map((c: string) => c.trim()).filter((c: string) => c !== ''),
          tags: data.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t !== ''),
          createdAt: modalType === 'addProject' ? now : selectedProject!.createdAt,
          updatedAt: now
        };
        
        if (modalType === 'addProject') {
          setAppData(prev => ({
            ...prev,
            projects: [...prev.projects, projectData]
          }));
        } else {
          setAppData(prev => ({
            ...prev,
            projects: prev.projects.map(p => p.id === projectData.id ? projectData : p)
          }));
        }
        break;
      }
      
      case 'addMolecule':
      case 'editMolecule': {
        const moleculeData: Molecule = {
          id: modalType === 'addMolecule' ? `m${Date.now()}` : selectedMolecule!.id,
          name: data.name,
          formula: data.formula,
          structure: data.structure,
          molecularWeight: parseFloat(data.molecularWeight),
          status: data.status as MoleculeStatus,
          projectId: data.projectId,
          targetActivity: data.targetActivity,
          purity: parseFloat(data.purity),
          createdAt: modalType === 'addMolecule' ? now : selectedMolecule!.createdAt,
          tags: data.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t !== '')
        };
        
        if (modalType === 'addMolecule') {
          setAppData(prev => ({
            ...prev,
            molecules: [...prev.molecules, moleculeData]
          }));
        } else {
          setAppData(prev => ({
            ...prev,
            molecules: prev.molecules.map(m => m.id === moleculeData.id ? moleculeData : m)
          }));
        }
        break;
      }
      
      case 'addExperiment':
      case 'editExperiment': {
        const experimentData: Experiment = {
          id: modalType === 'addExperiment' ? `e${Date.now()}` : selectedExperiment!.id,
          title: data.title,
          description: data.description,
          type: data.type as ExperimentType,
          date: data.date,
          results: data.results,
          conclusion: data.conclusion,
          projectId: data.projectId,
          moleculeIds: Array.isArray(data.moleculeIds) ? data.moleculeIds : [data.moleculeIds],
          performers: data.performers.split(',').map((p: string) => p.trim()).filter((p: string) => p !== ''),
          tags: data.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t !== ''),
          createdAt: modalType === 'addExperiment' ? now : selectedExperiment!.createdAt
        };
        
        if (modalType === 'addExperiment') {
          setAppData(prev => ({
            ...prev,
            experiments: [...prev.experiments, experimentData]
          }));
        } else {
          setAppData(prev => ({
            ...prev,
            experiments: prev.experiments.map(e => e.id === experimentData.id ? experimentData : e)
          }));
        }
        break;
      }
      
      case 'addNote':
      case 'editNote': {
        const noteData: Note = {
          id: modalType === 'addNote' ? `n${Date.now()}` : selectedNote!.id,
          title: data.title,
          content: data.content,
          date: data.date || format(new Date(), 'yyyy-MM-dd'),
          projectId: data.projectId,
          moleculeIds: Array.isArray(data.moleculeIds) ? data.moleculeIds : [data.moleculeIds],
          experimentIds: Array.isArray(data.experimentIds) ? data.experimentIds : [data.experimentIds],
          tags: data.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t !== '')
        };
        
        if (modalType === 'addNote') {
          setAppData(prev => ({
            ...prev,
            notes: [...prev.notes, noteData]
          }));
        } else {
          setAppData(prev => ({
            ...prev,
            notes: prev.notes.map(n => n.id === noteData.id ? noteData : n)
          }));
        }
        break;
      }
      
      default:
        break;
    }
    
    closeModal();
  };
  
  // Delete handlers
  const handleDelete = (type: string, id: string) => {
    switch (type) {
      case 'project':
        setAppData(prev => ({
          ...prev,
          projects: prev.projects.filter(p => p.id !== id),
          // Cascade delete related items
          molecules: prev.molecules.filter(m => m.projectId !== id),
          experiments: prev.experiments.filter(e => e.projectId !== id),
          notes: prev.notes.filter(n => n.projectId !== id)
        }));
        break;
      
      case 'molecule':
        setAppData(prev => ({
          ...prev,
          molecules: prev.molecules.filter(m => m.id !== id),
          // Update related experiments and notes
          experiments: prev.experiments.map(e => ({
            ...e,
            moleculeIds: e.moleculeIds.filter(mId => mId !== id)
          })),
          notes: prev.notes.map(n => ({
            ...n,
            moleculeIds: n.moleculeIds.filter(mId => mId !== id)
          }))
        }));
        break;
      
      case 'experiment':
        setAppData(prev => ({
          ...prev,
          experiments: prev.experiments.filter(e => e.id !== id),
          // Update related notes
          notes: prev.notes.map(n => ({
            ...n,
            experimentIds: n.experimentIds.filter(eId => eId !== id)
          }))
        }));
        break;
      
      case 'note':
        setAppData(prev => ({
          ...prev,
          notes: prev.notes.filter(n => n.id !== id)
        }));
        break;
      
      default:
        break;
    }
  };
  
  // Modal handlers
  const openModal = (type: string, item: any = null) => {
    setModalType(type);
    reset(); // Clear form
    
    if (item) {
      // Pre-populate form for editing
      switch (type) {
        case 'editProject':
          setSelectedProject(item);
          Object.entries(item).forEach(([key, value]) => {
            if (key === 'collaborators' || key === 'tags') {
              setValue(key, (value as string[]).join(', '));
            } else {
              setValue(key, value as string);
            }
          });
          break;
        
        case 'editMolecule':
          setSelectedMolecule(item);
          Object.entries(item).forEach(([key, value]) => {
            if (key === 'tags') {
              setValue(key, (value as string[]).join(', '));
            } else {
              setValue(key, value as string);
            }
          });
          break;
        
        case 'editExperiment':
          setSelectedExperiment(item);
          Object.entries(item).forEach(([key, value]) => {
            if (key === 'performers' || key === 'tags') {
              setValue(key, (value as string[]).join(', '));
            } else if (key === 'moleculeIds') {
              // For select elements that accept multiple values
              setValue(key, value);
            } else {
              setValue(key, value as string);
            }
          });
          break;
        
        case 'editNote':
          setSelectedNote(item);
          Object.entries(item).forEach(([key, value]) => {
            if (key === 'tags') {
              setValue(key, (value as string[]).join(', '));
            } else if (key === 'moleculeIds' || key === 'experimentIds') {
              // For select elements that accept multiple values
              setValue(key, value);
            } else {
              setValue(key, value as string);
            }
          });
          break;
        
        default:
          break;
      }
    }
    
    document.body.classList.add('modal-open');
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    document.body.classList.remove('modal-open');
    setIsModalOpen(false);
    setSelectedProject(null);
    setSelectedMolecule(null);
    setSelectedExperiment(null);
    setSelectedNote(null);
  };
  
  // Filter and sort data
  const getFilteredAndSortedData = (type: 'projects' | 'molecules' | 'experiments' | 'notes') => {
    let items = [...appData[type]];
    
    // Filter by search term across multiple fields
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      items = items.filter(item => {
        // Check common fields
        if (item.title && item.title.toLowerCase().includes(term)) return true;
        if (item.description && item.description.toLowerCase().includes(term)) return true;
        if (item.tags && item.tags.some(tag => tag.toLowerCase().includes(term))) return true;
        
        // Check type-specific fields
        switch (type) {
          case 'projects':
            return (item as Project).status.toLowerCase().includes(term);
          case 'molecules':
            return (
              (item as Molecule).name.toLowerCase().includes(term) ||
              (item as Molecule).formula.toLowerCase().includes(term) ||
              (item as Molecule).targetActivity.toLowerCase().includes(term)
            );
          case 'experiments':
            return (
              (item as Experiment).type.toLowerCase().includes(term) ||
              (item as Experiment).results.toLowerCase().includes(term) ||
              (item as Experiment).conclusion.toLowerCase().includes(term)
            );
          case 'notes':
            return (item as Note).content.toLowerCase().includes(term);
          default:
            return false;
        }
      });
    }
    
    // Filter by status
    if (filterStatus !== 'All') {
      items = items.filter(item => {
        switch (type) {
          case 'projects':
            return (item as Project).status === filterStatus;
          case 'molecules':
            return (item as Molecule).status === filterStatus;
          case 'experiments':
            return (item as Experiment).type === filterStatus;
          default:
            return true;
        }
      });
    }
    
    // Sort data
    items.sort((a, b) => {
      let valueA: any;
      let valueB: any;
      
      // Get values to compare based on sortField
      switch (sortField) {
        case 'date':
          valueA = new Date(a.date || a.startDate || a.createdAt);
          valueB = new Date(b.date || b.startDate || b.createdAt);
          break;
        case 'title':
        case 'name':
          valueA = (a.title || a.name || '').toLowerCase();
          valueB = (b.title || b.name || '').toLowerCase();
          break;
        case 'status':
          valueA = (a.status || '').toLowerCase();
          valueB = (b.status || '').toLowerCase();
          break;
        case 'updatedAt':
          valueA = new Date(a.updatedAt || a.createdAt);
          valueB = new Date(b.updatedAt || b.createdAt);
          break;
        default:
          valueA = a[sortField];
          valueB = b[sortField];
      }
      
      // Perform the comparison
      if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    
    return items;
  };
  
  // Template download handlers
  const downloadTemplate = (type: string) => {
    let template = '';
    let filename = '';
    
    switch (type) {
      case 'project':
        template = 'title,description,status,startDate,targetDate,collaborators,tags\nExample Project,Project description,Active,2023-06-01,2023-12-31,"John Doe, Jane Smith","tag1, tag2, tag3"';
        filename = 'project_template.csv';
        break;
      
      case 'molecule':
        template = 'name,formula,structure,molecularWeight,status,projectId,targetActivity,purity,tags\nMOL-123,C21H27NO5,SMILES or structure notation,385.44,Synthesis,projectID,Enzyme inhibition,98.5,"tag1, tag2, tag3"';
        filename = 'molecule_template.csv';
        break;
      
      case 'experiment':
        template = 'title,description,type,date,results,conclusion,projectId,moleculeIds,performers,tags\nEnzyme Assay,Description of experiment,In vitro,2023-06-15,Result summary,Conclusion,projectID,"moleculeID1, moleculeID2","John Doe, Jane Smith","tag1, tag2, tag3"';
        filename = 'experiment_template.csv';
        break;
      
      case 'note':
        template = 'title,content,date,projectId,moleculeIds,experimentIds,tags\nImportant Note,Note content text,2023-06-20,projectID,"moleculeID1, moleculeID2","experimentID1, experimentID2","tag1, tag2, tag3"';
        filename = 'note_template.csv';
        break;
      
      default:
        break;
    }
    
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Render elements of the UI
  const renderNavigation = () => {
    return (
      <nav className="bg-slate-800 text-white p-4 md:p-6 dark:bg-slate-900 flex flex-col h-full">
        <div className="flex items-center mb-8">
          <Dna size={32} className="text-primary-500" />
          <h1 className="text-xl font-bold ml-2">SciLab</h1>
        </div>
        
        <div className="flex flex-col space-y-2">
          {tabs.map(tab => (
            <button
              key={tab.name}
              className={`flex items-center p-3 rounded-lg transition-all ${activeTab === tab.name ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}
              onClick={() => setActiveTab(tab.name)}
              aria-label={`Navigate to ${tab.name}`}
            >
              {tab.icon}
              <span className="ml-3 capitalize">{tab.name}</span>
            </button>
          ))}
        </div>
        
        <div className="mt-auto pt-6 border-t border-slate-700">
          <div className="flex items-center p-2">
            <img src={currentUser.avatar} alt={currentUser.name} className="w-10 h-10 rounded-full" />
            <div className="ml-3">
              <p className="font-medium">{currentUser.name}</p>
              <p className="text-sm text-slate-400">{currentUser.role}</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-4">
            <span className="text-sm">Theme</span>
            <button 
              className="theme-toggle"
              onClick={() => setDarkMode(!darkMode)}
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
              <span className="ml-2">{darkMode ? 'Light' : 'Dark'}</span>
            </button>
          </div>
        </div>
      </nav>
    );
  };
  
  const renderSearchAndControls = (type: string) => {
    let statusOptions: string[] = [];
    
    switch (type) {
      case 'projects':
        statusOptions = ['All', 'Active', 'Completed', 'On Hold', 'Planning'];
        break;
      case 'molecules':
        statusOptions = ['All', 'Synthesis', 'Testing', 'Validation', 'Failed', 'Approved'];
        break;
      case 'experiments':
        statusOptions = ['All', 'In vitro', 'In vivo', 'Computational', 'Analytical'];
        break;
      default:
        statusOptions = ['All'];
        break;
    }
    
    return (
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center w-full md:w-auto">
          <div className="relative flex-grow md:w-64">
            <input
              type="text"
              className="input py-2 pl-10 pr-4 w-full"
              placeholder={`Search ${type}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label={`Search ${type}`}
            />
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          
          <div className="ml-2">
            <select
              className="input py-2 pl-3 pr-8"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              aria-label="Filter by status"
            >
              {statusOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex space-x-2 w-full md:w-auto">
          <button 
            className="btn btn-primary flex items-center" 
            onClick={() => openModal(`add${type.charAt(0).toUpperCase() + type.slice(1, -1)}`)}
            aria-label={`Add new ${type.slice(0, -1)}`}
          >
            <Plus size={18} />
            <span className="ml-1">Add</span>
          </button>
          
          <button 
            className="btn bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white flex items-center" 
            onClick={() => downloadTemplate(type.slice(0, -1))}
            aria-label={`Download ${type.slice(0, -1)} template`}
          >
            <Download size={18} />
            <span className="ml-1">Template</span>
          </button>
        </div>
      </div>
    );
  };
  
  const renderStatusBadge = (status: string) => {
    let badgeClass = 'badge ';
    switch (status) {
      case 'Active':
      case 'Approved':
        badgeClass += 'badge-success';
        break;
      case 'Completed':
      case 'Validation':
        badgeClass += 'badge-info';
        break;
      case 'On Hold':
      case 'Testing':
        badgeClass += 'badge-warning';
        break;
      case 'Planning':
      case 'Synthesis':
        badgeClass += 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
        break;
      case 'Failed':
        badgeClass += 'badge-error';
        break;
      case 'In vitro':
        badgeClass += 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
        break;
      case 'In vivo':
        badgeClass += 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
        break;
      case 'Computational':
        badgeClass += 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300';
        break;
      case 'Analytical':
        badgeClass += 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300';
        break;
      default:
        badgeClass += 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
    return <span className={badgeClass}>{status}</span>;
  };
  
  const renderProjectsTable = () => {
    const projects = getFilteredAndSortedData('projects');
    
    return (
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th className="table-header">
                <button 
                  className="flex items-center"
                  onClick={() => {
                    if (sortField === 'title') {
                      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortField('title');
                      setSortDirection('asc');
                    }
                  }}
                  aria-label="Sort by title"
                >
                  Title
                  {sortField === 'title' && (
                    sortDirection === 'asc' ? <ArrowUp size={16} className="ml-1" /> : <ArrowDown size={16} className="ml-1" />
                  )}
                </button>
              </th>
              <th className="table-header">
                <button 
                  className="flex items-center"
                  onClick={() => {
                    if (sortField === 'status') {
                      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortField('status');
                      setSortDirection('asc');
                    }
                  }}
                  aria-label="Sort by status"
                >
                  Status
                  {sortField === 'status' && (
                    sortDirection === 'asc' ? <ArrowUp size={16} className="ml-1" /> : <ArrowDown size={16} className="ml-1" />
                  )}
                </button>
              </th>
              <th className="table-header">
                <button 
                  className="flex items-center"
                  onClick={() => {
                    if (sortField === 'startDate') {
                      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortField('startDate');
                      setSortDirection('asc');
                    }
                  }}
                  aria-label="Sort by start date"
                >
                  Start Date
                  {sortField === 'startDate' && (
                    sortDirection === 'asc' ? <ArrowUp size={16} className="ml-1" /> : <ArrowDown size={16} className="ml-1" />
                  )}
                </button>
              </th>
              <th className="table-header">Target Date</th>
              <th className="table-header">Tags</th>
              <th className="table-header">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
            {projects.length > 0 ? (
              projects.map(project => (
                <tr key={project.id}>
                  <td className="table-cell">
                    <div className="font-medium text-gray-900 dark:text-white">{project.title}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{project.description}</div>
                  </td>
                  <td className="table-cell">{renderStatusBadge(project.status)}</td>
                  <td className="table-cell">{format(new Date(project.startDate), 'MMM d, yyyy')}</td>
                  <td className="table-cell">{format(new Date(project.targetDate), 'MMM d, yyyy')}</td>
                  <td className="table-cell">
                    <div className="flex flex-wrap gap-1">
                      {project.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                          {tag}
                        </span>
                      ))}
                      {project.tags.length > 3 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                          +{project.tags.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="flex space-x-2">
                      <button 
                        className="btn btn-sm btn-primary"
                        onClick={() => openModal('editProject', project)}
                        aria-label={`Edit project ${project.title}`}
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        className="btn btn-sm bg-red-500 hover:bg-red-600 text-white"
                        onClick={() => handleDelete('project', project.id)}
                        aria-label={`Delete project ${project.title}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="table-cell text-center py-8 text-gray-500 dark:text-gray-400">
                  No projects found. Add a new project to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };
  
  const renderMoleculesTable = () => {
    const molecules = getFilteredAndSortedData('molecules');
    
    return (
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th className="table-header">
                <button 
                  className="flex items-center"
                  onClick={() => {
                    if (sortField === 'name') {
                      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortField('name');
                      setSortDirection('asc');
                    }
                  }}
                  aria-label="Sort by name"
                >
                  Name
                  {sortField === 'name' && (
                    sortDirection === 'asc' ? <ArrowUp size={16} className="ml-1" /> : <ArrowDown size={16} className="ml-1" />
                  )}
                </button>
              </th>
              <th className="table-header">Formula</th>
              <th className="table-header">
                <button 
                  className="flex items-center"
                  onClick={() => {
                    if (sortField === 'status') {
                      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortField('status');
                      setSortDirection('asc');
                    }
                  }}
                  aria-label="Sort by status"
                >
                  Status
                  {sortField === 'status' && (
                    sortDirection === 'asc' ? <ArrowUp size={16} className="ml-1" /> : <ArrowDown size={16} className="ml-1" />
                  )}
                </button>
              </th>
              <th className="table-header">Project</th>
              <th className="table-header">Target Activity</th>
              <th className="table-header">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
            {molecules.length > 0 ? (
              molecules.map(molecule => {
                const project = appData.projects.find(p => p.id === molecule.projectId);
                
                return (
                  <tr key={molecule.id}>
                    <td className="table-cell">
                      <div className="font-medium text-gray-900 dark:text-white">{molecule.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        MW: {molecule.molecularWeight.toFixed(2)} | Purity: {molecule.purity.toFixed(1)}%
                      </div>
                    </td>
                    <td className="table-cell font-mono text-sm">{molecule.formula}</td>
                    <td className="table-cell">{renderStatusBadge(molecule.status)}</td>
                    <td className="table-cell">{project?.title || 'Unknown Project'}</td>
                    <td className="table-cell">{molecule.targetActivity}</td>
                    <td className="table-cell">
                      <div className="flex space-x-2">
                        <button 
                          className="btn btn-sm btn-primary"
                          onClick={() => openModal('editMolecule', molecule)}
                          aria-label={`Edit molecule ${molecule.name}`}
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          className="btn btn-sm bg-red-500 hover:bg-red-600 text-white"
                          onClick={() => handleDelete('molecule', molecule.id)}
                          aria-label={`Delete molecule ${molecule.name}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="table-cell text-center py-8 text-gray-500 dark:text-gray-400">
                  No molecules found. Add a new molecule to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };
  
  const renderExperimentsTable = () => {
    const experiments = getFilteredAndSortedData('experiments');
    
    return (
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th className="table-header">
                <button 
                  className="flex items-center"
                  onClick={() => {
                    if (sortField === 'title') {
                      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortField('title');
                      setSortDirection('asc');
                    }
                  }}
                  aria-label="Sort by title"
                >
                  Title
                  {sortField === 'title' && (
                    sortDirection === 'asc' ? <ArrowUp size={16} className="ml-1" /> : <ArrowDown size={16} className="ml-1" />
                  )}
                </button>
              </th>
              <th className="table-header">
                <button 
                  className="flex items-center"
                  onClick={() => {
                    if (sortField === 'type') {
                      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortField('type');
                      setSortDirection('asc');
                    }
                  }}
                  aria-label="Sort by type"
                >
                  Type
                  {sortField === 'type' && (
                    sortDirection === 'asc' ? <ArrowUp size={16} className="ml-1" /> : <ArrowDown size={16} className="ml-1" />
                  )}
                </button>
              </th>
              <th className="table-header">
                <button 
                  className="flex items-center"
                  onClick={() => {
                    if (sortField === 'date') {
                      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortField('date');
                      setSortDirection('asc');
                    }
                  }}
                  aria-label="Sort by date"
                >
                  Date
                  {sortField === 'date' && (
                    sortDirection === 'asc' ? <ArrowUp size={16} className="ml-1" /> : <ArrowDown size={16} className="ml-1" />
                  )}
                </button>
              </th>
              <th className="table-header">Project</th>
              <th className="table-header">Molecules</th>
              <th className="table-header">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
            {experiments.length > 0 ? (
              experiments.map(experiment => {
                const project = appData.projects.find(p => p.id === experiment.projectId);
                const experimentMolecules = appData.molecules.filter(m => experiment.moleculeIds.includes(m.id));
                
                return (
                  <tr key={experiment.id}>
                    <td className="table-cell">
                      <div className="font-medium text-gray-900 dark:text-white">{experiment.title}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{experiment.description}</div>
                    </td>
                    <td className="table-cell">{renderStatusBadge(experiment.type)}</td>
                    <td className="table-cell">{format(new Date(experiment.date), 'MMM d, yyyy')}</td>
                    <td className="table-cell">{project?.title || 'Unknown Project'}</td>
                    <td className="table-cell">
                      <div className="flex flex-wrap gap-1">
                        {experimentMolecules.slice(0, 2).map(molecule => (
                          <span key={molecule.id} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                            {molecule.name}
                          </span>
                        ))}
                        {experimentMolecules.length > 2 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                            +{experimentMolecules.length - 2}
                          </span>
                        )}
                        {experimentMolecules.length === 0 && (
                          <span className="text-sm text-gray-500 dark:text-gray-400">None</span>
                        )}
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex space-x-2">
                        <button 
                          className="btn btn-sm btn-primary"
                          onClick={() => openModal('editExperiment', experiment)}
                          aria-label={`Edit experiment ${experiment.title}`}
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          className="btn btn-sm bg-red-500 hover:bg-red-600 text-white"
                          onClick={() => handleDelete('experiment', experiment.id)}
                          aria-label={`Delete experiment ${experiment.title}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="table-cell text-center py-8 text-gray-500 dark:text-gray-400">
                  No experiments found. Add a new experiment to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };
  
  const renderNotesTable = () => {
    const notes = getFilteredAndSortedData('notes');
    
    return (
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th className="table-header">
                <button 
                  className="flex items-center"
                  onClick={() => {
                    if (sortField === 'title') {
                      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortField('title');
                      setSortDirection('asc');
                    }
                  }}
                  aria-label="Sort by title"
                >
                  Title
                  {sortField === 'title' && (
                    sortDirection === 'asc' ? <ArrowUp size={16} className="ml-1" /> : <ArrowDown size={16} className="ml-1" />
                  )}
                </button>
              </th>
              <th className="table-header">
                <button 
                  className="flex items-center"
                  onClick={() => {
                    if (sortField === 'date') {
                      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortField('date');
                      setSortDirection('asc');
                    }
                  }}
                  aria-label="Sort by date"
                >
                  Date
                  {sortField === 'date' && (
                    sortDirection === 'asc' ? <ArrowUp size={16} className="ml-1" /> : <ArrowDown size={16} className="ml-1" />
                  )}
                </button>
              </th>
              <th className="table-header">Project</th>
              <th className="table-header">Related Items</th>
              <th className="table-header">Tags</th>
              <th className="table-header">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
            {notes.length > 0 ? (
              notes.map(note => {
                const project = appData.projects.find(p => p.id === note.projectId);
                const noteMolecules = appData.molecules.filter(m => note.moleculeIds.includes(m.id));
                const noteExperiments = appData.experiments.filter(e => note.experimentIds.includes(e.id));
                
                return (
                  <tr key={note.id}>
                    <td className="table-cell">
                      <div className="font-medium text-gray-900 dark:text-white">{note.title}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{note.content}</div>
                    </td>
                    <td className="table-cell">{format(new Date(note.date), 'MMM d, yyyy')}</td>
                    <td className="table-cell">{project?.title || 'Unknown Project'}</td>
                    <td className="table-cell">
                      <div className="flex flex-col space-y-1">
                        {noteMolecules.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {noteMolecules.slice(0, 2).map(molecule => (
                              <span key={molecule.id} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                {molecule.name}
                              </span>
                            ))}
                            {noteMolecules.length > 2 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                +{noteMolecules.length - 2} molecules
                              </span>
                            )}
                          </div>
                        )}
                        {noteExperiments.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {noteExperiments.slice(0, 1).map(experiment => (
                              <span key={experiment.id} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                                {experiment.title}
                              </span>
                            ))}
                            {noteExperiments.length > 1 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                                +{noteExperiments.length - 1} experiments
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex flex-wrap gap-1">
                        {note.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                            {tag}
                          </span>
                        ))}
                        {note.tags.length > 2 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                            +{note.tags.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex space-x-2">
                        <button 
                          className="btn btn-sm btn-primary"
                          onClick={() => openModal('editNote', note)}
                          aria-label={`Edit note ${note.title}`}
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          className="btn btn-sm bg-red-500 hover:bg-red-600 text-white"
                          onClick={() => handleDelete('note', note.id)}
                          aria-label={`Delete note ${note.title}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="table-cell text-center py-8 text-gray-500 dark:text-gray-400">
                  No notes found. Add a new note to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };
  
  const renderDashboard = () => {
    const recentProjects = [...appData.projects]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 3);
    
    const recentExperiments = [...appData.experiments]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3);
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="stat-card">
            <div className="stat-title">Total Projects</div>
            <div className="stat-value">{appData.projects.length}</div>
            <div className="stat-desc flex items-center mt-2">
              <Microscope size={16} className="mr-1" />
              {appData.projects.filter(p => p.status === 'Active').length} active projects
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-title">Total Molecules</div>
            <div className="stat-value">{appData.molecules.length}</div>
            <div className="stat-desc flex items-center mt-2">
              <FlaskConical size={16} className="mr-1" />
              {appData.molecules.filter(m => m.status === 'Testing').length} in testing
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-title">Total Experiments</div>
            <div className="stat-value">{appData.experiments.length}</div>
            <div className="stat-desc flex items-center mt-2">
              <TestTube size={16} className="mr-1" />
              {appData.experiments.filter(e => new Date(e.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length} in last 30 days
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-title">Total Notes</div>
            <div className="stat-value">{appData.notes.length}</div>
            <div className="stat-desc flex items-center mt-2">
              <FileText size={16} className="mr-1" />
              {appData.notes.filter(n => new Date(n.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length} in last 30 days
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-lg font-medium mb-4">Recent Projects</h3>
            {recentProjects.length > 0 ? (
              <div className="space-y-4">
                {recentProjects.map(project => (
                  <div key={project.id} className="p-4 border rounded-md dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{project.title}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{project.description}</p>
                      </div>
                      <div>{renderStatusBadge(project.status)}</div>
                    </div>
                    <div className="flex justify-between items-center mt-3 text-sm text-gray-500 dark:text-gray-400">
                      <div>Started {format(new Date(project.startDate), 'MMM d, yyyy')}</div>
                      <div className="flex items-center">
                        <button 
                          className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                          onClick={() => {
                            setActiveTab('projects');
                            openModal('editProject', project);
                          }}
                          aria-label={`Edit project ${project.title}`}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No projects found. Add a new project to get started.
              </div>
            )}
            <div className="mt-4">
              <button 
                className="btn btn-primary w-full"
                onClick={() => setActiveTab('projects')}
                aria-label="View all projects"
              >
                View All Projects
              </button>
            </div>
          </div>
          
          <div className="card">
            <h3 className="text-lg font-medium mb-4">Recent Experiments</h3>
            {recentExperiments.length > 0 ? (
              <div className="space-y-4">
                {recentExperiments.map(experiment => {
                  const project = appData.projects.find(p => p.id === experiment.projectId);
                  
                  return (
                    <div key={experiment.id} className="p-4 border rounded-md dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{experiment.title}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{project?.title || 'Unknown Project'}</p>
                        </div>
                        <div>{renderStatusBadge(experiment.type)}</div>
                      </div>
                      <div className="flex justify-between items-center mt-3 text-sm text-gray-500 dark:text-gray-400">
                        <div>Conducted on {format(new Date(experiment.date), 'MMM d, yyyy')}</div>
                        <div className="flex items-center">
                          <button 
                            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                            onClick={() => {
                              setActiveTab('experiments');
                              openModal('editExperiment', experiment);
                            }}
                            aria-label={`Edit experiment ${experiment.title}`}
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No experiments found. Add a new experiment to get started.
              </div>
            )}
            <div className="mt-4">
              <button 
                className="btn btn-primary w-full"
                onClick={() => setActiveTab('experiments')}
                aria-label="View all experiments"
              >
                View All Experiments
              </button>
            </div>
          </div>
        </div>
        
        <div className="card">
          <h3 className="text-lg font-medium mb-4">Activity Overview</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analyticsData.activityByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="month" 
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickFormatter={(value) => value.toFixed(0)}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                    borderColor: darkMode ? '#374151' : '#e5e7eb',
                    color: darkMode ? '#f3f4f6' : '#1f2937'
                  }}
                  itemStyle={{
                    color: darkMode ? '#f3f4f6' : 'inherit'
                  }}
                  labelStyle={{
                    color: darkMode ? '#f3f4f6' : '#111827',
                    fontWeight: 600
                  }}
                />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ paddingTop: '16px' }} />
                <Line 
                  type="monotone" 
                  dataKey="experiments" 
                  name="Experiments" 
                  stroke="#3b82f6" 
                  activeDot={{ r: 8 }} 
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="molecules" 
                  name="Molecules" 
                  stroke="#10b981" 
                  activeDot={{ r: 8 }} 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };
  
  const renderAnalytics = () => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-lg font-medium mb-4">Project Status</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={analyticsData.projects}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#6b7280"
                    fontSize={12}
                    tickLine={false}
                    axisLine={{ stroke: '#e5e7eb' }}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    fontSize={12}
                    tickLine={false}
                    axisLine={{ stroke: '#e5e7eb' }}
                    tickFormatter={(value) => value.toFixed(0)}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                      borderColor: darkMode ? '#374151' : '#e5e7eb',
                      color: darkMode ? '#f3f4f6' : '#1f2937'
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ paddingTop: '16px' }} />
                  <Bar 
                    dataKey="count" 
                    name="Projects" 
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="card">
            <h3 className="text-lg font-medium mb-4">Molecule Status</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={analyticsData.molecules}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="status" 
                    stroke="#6b7280"
                    fontSize={12}
                    tickLine={false}
                    axisLine={{ stroke: '#e5e7eb' }}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    fontSize={12}
                    tickLine={false}
                    axisLine={{ stroke: '#e5e7eb' }}
                    tickFormatter={(value) => value.toFixed(0)}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                      borderColor: darkMode ? '#374151' : '#e5e7eb',
                      color: darkMode ? '#f3f4f6' : '#1f2937'
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ paddingTop: '16px' }} />
                  <Bar 
                    dataKey="count" 
                    name="Molecules" 
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-lg font-medium mb-4">Experiment Types</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={analyticsData.experiments}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="type" 
                    stroke="#6b7280"
                    fontSize={12}
                    tickLine={false}
                    axisLine={{ stroke: '#e5e7eb' }}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    fontSize={12}
                    tickLine={false}
                    axisLine={{ stroke: '#e5e7eb' }}
                    tickFormatter={(value) => value.toFixed(0)}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                      borderColor: darkMode ? '#374151' : '#e5e7eb',
                      color: darkMode ? '#f3f4f6' : '#1f2937'
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ paddingTop: '16px' }} />
                  <Bar 
                    dataKey="count" 
                    name="Experiments" 
                    fill="#f59e0b"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="card">
            <h3 className="text-lg font-medium mb-4">Productivity Trends</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analyticsData.activityByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#6b7280"
                    fontSize={12}
                    tickLine={false}
                    axisLine={{ stroke: '#e5e7eb' }}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    fontSize={12}
                    tickLine={false}
                    axisLine={{ stroke: '#e5e7eb' }}
                    tickFormatter={(value) => value.toFixed(0)}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                      borderColor: darkMode ? '#374151' : '#e5e7eb',
                      color: darkMode ? '#f3f4f6' : '#1f2937'
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ paddingTop: '16px' }} />
                  <Line 
                    type="monotone" 
                    dataKey="experiments" 
                    name="Experiments" 
                    stroke="#3b82f6" 
                    activeDot={{ r: 8 }} 
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="molecules" 
                    name="Molecules" 
                    stroke="#10b981" 
                    activeDot={{ r: 8 }} 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        <div className="card">
          <h3 className="text-lg font-medium mb-4">Summary Statistics</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
              <h4 className="font-medium text-gray-700 dark:text-gray-300">Average Molecule Purity</h4>
              <p className="text-2xl font-semibold mt-2 text-gray-900 dark:text-white">
                {appData.molecules.length > 0 
                  ? (appData.molecules.reduce((sum, mol) => sum + mol.purity, 0) / appData.molecules.length).toFixed(1) + '%'
                  : 'N/A'}
              </p>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
              <h4 className="font-medium text-gray-700 dark:text-gray-300">Completed Projects</h4>
              <p className="text-2xl font-semibold mt-2 text-gray-900 dark:text-white">
                {appData.projects.filter(p => p.status === 'Completed').length}
              </p>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
              <h4 className="font-medium text-gray-700 dark:text-gray-300">Total Tags Used</h4>
              <p className="text-2xl font-semibold mt-2 text-gray-900 dark:text-white">
                {new Set(
                  [...appData.projects.flatMap(p => p.tags),
                   ...appData.molecules.flatMap(m => m.tags),
                   ...appData.experiments.flatMap(e => e.tags),
                   ...appData.notes.flatMap(n => n.tags)]
                ).size}
              </p>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
              <h4 className="font-medium text-gray-700 dark:text-gray-300">Researchers Involved</h4>
              <p className="text-2xl font-semibold mt-2 text-gray-900 dark:text-white">
                {new Set(
                  [...appData.projects.flatMap(p => p.collaborators),
                   ...appData.experiments.flatMap(e => e.performers)]
                ).size}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  const renderFormModal = () => {
    let modalTitle = '';
    let formContent = null;
    
    switch (modalType) {
      case 'addProject':
      case 'editProject':
        modalTitle = modalType === 'addProject' ? 'Add New Project' : 'Edit Project';
        formContent = (
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <div className="form-group">
              <label className="form-label" htmlFor="title">Project Title</label>
              <input 
                id="title" 
                className={`input ${errors.title ? 'border-red-500' : ''}`}
                {...register('title', { required: 'Title is required' })}
              />
              {errors.title && <p className="form-error">{errors.title.message as string}</p>}
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="description">Description</label>
              <textarea 
                id="description" 
                className={`input min-h-24 ${errors.description ? 'border-red-500' : ''}`}
                {...register('description', { required: 'Description is required' })}
              ></textarea>
              {errors.description && <p className="form-error">{errors.description.message as string}</p>}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label" htmlFor="status">Status</label>
                <select 
                  id="status" 
                  className={`input ${errors.status ? 'border-red-500' : ''}`}
                  {...register('status', { required: 'Status is required' })}
                >
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Planning">Planning</option>
                </select>
                {errors.status && <p className="form-error">{errors.status.message as string}</p>}
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="collaborators">Collaborators</label>
                <input 
                  id="collaborators" 
                  className="input"
                  placeholder="Names separated by commas"
                  {...register('collaborators')}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label" htmlFor="startDate">Start Date</label>
                <input 
                  id="startDate" 
                  type="date" 
                  className={`input ${errors.startDate ? 'border-red-500' : ''}`}
                  {...register('startDate', { required: 'Start date is required' })}
                />
                {errors.startDate && <p className="form-error">{errors.startDate.message as string}</p>}
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="targetDate">Target Completion Date</label>
                <input 
                  id="targetDate" 
                  type="date" 
                  className={`input ${errors.targetDate ? 'border-red-500' : ''}`}
                  {...register('targetDate', { required: 'Target date is required' })}
                />
                {errors.targetDate && <p className="form-error">{errors.targetDate.message as string}</p>}
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="tags">Tags</label>
              <input 
                id="tags" 
                className="input"
                placeholder="Tags separated by commas"
                {...register('tags')}
              />
            </div>
            
            <div className="modal-footer">
              <button type="button" className="btn bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white" onClick={closeModal}>Cancel</button>
              <button type="submit" className="btn btn-primary">Save Project</button>
            </div>
          </form>
        );
        break;
      
      case 'addMolecule':
      case 'editMolecule':
        modalTitle = modalType === 'addMolecule' ? 'Add New Molecule' : 'Edit Molecule';
        formContent = (
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <div className="form-group">
              <label className="form-label" htmlFor="name">Molecule Name</label>
              <input 
                id="name" 
                className={`input ${errors.name ? 'border-red-500' : ''}`}
                {...register('name', { required: 'Name is required' })}
              />
              {errors.name && <p className="form-error">{errors.name.message as string}</p>}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label" htmlFor="formula">Chemical Formula</label>
                <input 
                  id="formula" 
                  className={`input ${errors.formula ? 'border-red-500' : ''}`}
                  {...register('formula', { required: 'Formula is required' })}
                />
                {errors.formula && <p className="form-error">{errors.formula.message as string}</p>}
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="molecularWeight">Molecular Weight (g/mol)</label>
                <input 
                  id="molecularWeight" 
                  type="number" 
                  step="0.01" 
                  className={`input ${errors.molecularWeight ? 'border-red-500' : ''}`}
                  {...register('molecularWeight', { 
                    required: 'Molecular weight is required',
                    valueAsNumber: true,
                    min: { value: 0, message: 'Must be a positive number' }
                  })}
                />
                {errors.molecularWeight && <p className="form-error">{errors.molecularWeight.message as string}</p>}
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="structure">Structure Notation (SMILES, InChI, etc.)</label>
              <textarea 
                id="structure" 
                className={`input ${errors.structure ? 'border-red-500' : ''}`}
                {...register('structure', { required: 'Structure notation is required' })}
              ></textarea>
              {errors.structure && <p className="form-error">{errors.structure.message as string}</p>}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label" htmlFor="status">Status</label>
                <select 
                  id="status" 
                  className={`input ${errors.status ? 'border-red-500' : ''}`}
                  {...register('status', { required: 'Status is required' })}
                >
                  <option value="Synthesis">Synthesis</option>
                  <option value="Testing">Testing</option>
                  <option value="Validation">Validation</option>
                  <option value="Failed">Failed</option>
                  <option value="Approved">Approved</option>
                </select>
                {errors.status && <p className="form-error">{errors.status.message as string}</p>}
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="purity">Purity (%)</label>
                <input 
                  id="purity" 
                  type="number" 
                  step="0.1" 
                  min="0"
                  max="100"
                  className={`input ${errors.purity ? 'border-red-500' : ''}`}
                  {...register('purity', { 
                    required: 'Purity is required',
                    valueAsNumber: true,
                    min: { value: 0, message: 'Must be between 0 and 100' },
                    max: { value: 100, message: 'Must be between 0 and 100' }
                  })}
                />
                {errors.purity && <p className="form-error">{errors.purity.message as string}</p>}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label" htmlFor="projectId">Associated Project</label>
                <select 
                  id="projectId" 
                  className={`input ${errors.projectId ? 'border-red-500' : ''}`}
                  {...register('projectId', { required: 'Project is required' })}
                >
                  {appData.projects.map(project => (
                    <option key={project.id} value={project.id}>{project.title}</option>
                  ))}
                </select>
                {errors.projectId && <p className="form-error">{errors.projectId.message as string}</p>}
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="targetActivity">Target Activity</label>
                <input 
                  id="targetActivity" 
                  className={`input ${errors.targetActivity ? 'border-red-500' : ''}`}
                  {...register('targetActivity', { required: 'Target activity is required' })}
                />
                {errors.targetActivity && <p className="form-error">{errors.targetActivity.message as string}</p>}
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="tags">Tags</label>
              <input 
                id="tags" 
                className="input"
                placeholder="Tags separated by commas"
                {...register('tags')}
              />
            </div>
            
            <div className="modal-footer">
              <button type="button" className="btn bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white" onClick={closeModal}>Cancel</button>
              <button type="submit" className="btn btn-primary">Save Molecule</button>
            </div>
          </form>
        );
        break;
      
      case 'addExperiment':
      case 'editExperiment':
        modalTitle = modalType === 'addExperiment' ? 'Add New Experiment' : 'Edit Experiment';
        formContent = (
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <div className="form-group">
              <label className="form-label" htmlFor="title">Experiment Title</label>
              <input 
                id="title" 
                className={`input ${errors.title ? 'border-red-500' : ''}`}
                {...register('title', { required: 'Title is required' })}
              />
              {errors.title && <p className="form-error">{errors.title.message as string}</p>}
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="description">Description</label>
              <textarea 
                id="description" 
                className={`input min-h-20 ${errors.description ? 'border-red-500' : ''}`}
                {...register('description', { required: 'Description is required' })}
              ></textarea>
              {errors.description && <p className="form-error">{errors.description.message as string}</p>}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label" htmlFor="type">Experiment Type</label>
                <select 
                  id="type" 
                  className={`input ${errors.type ? 'border-red-500' : ''}`}
                  {...register('type', { required: 'Type is required' })}
                >
                  <option value="In vitro">In vitro</option>
                  <option value="In vivo">In vivo</option>
                  <option value="Computational">Computational</option>
                  <option value="Analytical">Analytical</option>
                </select>
                {errors.type && <p className="form-error">{errors.type.message as string}</p>}
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="date">Date Conducted</label>
                <input 
                  id="date" 
                  type="date" 
                  className={`input ${errors.date ? 'border-red-500' : ''}`}
                  {...register('date', { required: 'Date is required' })}
                />
                {errors.date && <p className="form-error">{errors.date.message as string}</p>}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label" htmlFor="projectId">Associated Project</label>
                <select 
                  id="projectId" 
                  className={`input ${errors.projectId ? 'border-red-500' : ''}`}
                  {...register('projectId', { required: 'Project is required' })}
                >
                  {appData.projects.map(project => (
                    <option key={project.id} value={project.id}>{project.title}</option>
                  ))}
                </select>
                {errors.projectId && <p className="form-error">{errors.projectId.message as string}</p>}
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="moleculeIds">Associated Molecules</label>
                <select 
                  id="moleculeIds" 
                  multiple
                  className={`input h-24 ${errors.moleculeIds ? 'border-red-500' : ''}`}
                  {...register('moleculeIds')}
                >
                  {appData.molecules.map(molecule => (
                    <option key={molecule.id} value={molecule.id}>{molecule.name}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Hold Ctrl (or Cmd) to select multiple</p>
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="results">Results</label>
              <textarea 
                id="results" 
                className={`input min-h-20 ${errors.results ? 'border-red-500' : ''}`}
                {...register('results', { required: 'Results are required' })}
              ></textarea>
              {errors.results && <p className="form-error">{errors.results.message as string}</p>}
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="conclusion">Conclusion</label>
              <textarea 
                id="conclusion" 
                className={`input min-h-20 ${errors.conclusion ? 'border-red-500' : ''}`}
                {...register('conclusion', { required: 'Conclusion is required' })}
              ></textarea>
              {errors.conclusion && <p className="form-error">{errors.conclusion.message as string}</p>}
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="performers">Performed By</label>
              <input 
                id="performers" 
                className="input"
                placeholder="Names separated by commas"
                {...register('performers')}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="tags">Tags</label>
              <input 
                id="tags" 
                className="input"
                placeholder="Tags separated by commas"
                {...register('tags')}
              />
            </div>
            
            <div className="modal-footer">
              <button type="button" className="btn bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white" onClick={closeModal}>Cancel</button>
              <button type="submit" className="btn btn-primary">Save Experiment</button>
            </div>
          </form>
        );
        break;
      
      case 'addNote':
      case 'editNote':
        modalTitle = modalType === 'addNote' ? 'Add New Note' : 'Edit Note';
        formContent = (
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <div className="form-group">
              <label className="form-label" htmlFor="title">Note Title</label>
              <input 
                id="title" 
                className={`input ${errors.title ? 'border-red-500' : ''}`}
                {...register('title', { required: 'Title is required' })}
              />
              {errors.title && <p className="form-error">{errors.title.message as string}</p>}
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="content">Content</label>
              <textarea 
                id="content" 
                className={`input min-h-32 ${errors.content ? 'border-red-500' : ''}`}
                {...register('content', { required: 'Content is required' })}
              ></textarea>
              {errors.content && <p className="form-error">{errors.content.message as string}</p>}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label" htmlFor="date">Date</label>
                <input 
                  id="date" 
                  type="date" 
                  className={`input ${errors.date ? 'border-red-500' : ''}`}
                  {...register('date', { required: 'Date is required' })}
                />
                {errors.date && <p className="form-error">{errors.date.message as string}</p>}
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="projectId">Associated Project</label>
                <select 
                  id="projectId" 
                  className={`input ${errors.projectId ? 'border-red-500' : ''}`}
                  {...register('projectId')}
                >
                  <option value="">None</option>
                  {appData.projects.map(project => (
                    <option key={project.id} value={project.id}>{project.title}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label" htmlFor="moleculeIds">Associated Molecules</label>
                <select 
                  id="moleculeIds" 
                  multiple
                  className="input h-24"
                  {...register('moleculeIds')}
                >
                  {appData.molecules.map(molecule => (
                    <option key={molecule.id} value={molecule.id}>{molecule.name}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Hold Ctrl (or Cmd) to select multiple</p>
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="experimentIds">Associated Experiments</label>
                <select 
                  id="experimentIds" 
                  multiple
                  className="input h-24"
                  {...register('experimentIds')}
                >
                  {appData.experiments.map(experiment => (
                    <option key={experiment.id} value={experiment.id}>{experiment.title}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Hold Ctrl (or Cmd) to select multiple</p>
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="tags">Tags</label>
              <input 
                id="tags" 
                className="input"
                placeholder="Tags separated by commas"
                {...register('tags')}
              />
            </div>
            
            <div className="modal-footer">
              <button type="button" className="btn bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white" onClick={closeModal}>Cancel</button>
              <button type="submit" className="btn btn-primary">Save Note</button>
            </div>
          </form>
        );
        break;
      
      default:
        break;
    }
    
    return (
      <div 
        className={`modal-backdrop ${isModalOpen ? 'block' : 'hidden'}`} 
        onClick={closeModal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div 
          className="modal-content" 
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <h3 id="modal-title" className="text-lg font-medium text-gray-900 dark:text-white">{modalTitle}</h3>
            <button 
              className="text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200" 
              onClick={closeModal}
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
          <div className="mt-4">
            {formContent}
          </div>
        </div>
      </div>
    );
  };
  
  const renderMobileMenu = () => {
    return (
      <div className="bg-slate-800 text-white p-4 flex justify-between items-center md:hidden dark:bg-slate-900">
        <div className="flex items-center">
          <Dna size={24} className="text-primary-500" />
          <h1 className="text-lg font-bold ml-2">SciLab</h1>
        </div>
        
        <button 
          className="text-white p-2 rounded-md hover:bg-slate-700"
          onClick={() => document.getElementById('sidebar')!.classList.toggle('open')}
          aria-label="Toggle navigation menu"
        >
          <Menu size={24} />
        </button>
      </div>
    );
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 theme-transition">
      {renderMobileMenu()}
      
      <div className="flex flex-1 overflow-hidden">
        <div id="sidebar" className={styles.sidebar}>
          {renderNavigation()}
        </div>
        
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          <div className="container mx-auto max-w-7xl">
            {activeTab === 'dashboard' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
                {renderDashboard()}
              </div>
            )}
            
            {activeTab === 'projects' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Projects</h2>
                {renderSearchAndControls('projects')}
                {renderProjectsTable()}
              </div>
            )}
            
            {activeTab === 'molecules' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Molecules</h2>
                {renderSearchAndControls('molecules')}
                {renderMoleculesTable()}
              </div>
            )}
            
            {activeTab === 'experiments' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Experiments</h2>
                {renderSearchAndControls('experiments')}
                {renderExperimentsTable()}
              </div>
            )}
            
            {activeTab === 'notes' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Notes</h2>
                {renderSearchAndControls('notes')}
                {renderNotesTable()}
              </div>
            )}
            
            {activeTab === 'analytics' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Analytics</h2>
                {renderAnalytics()}
              </div>
            )}
          </div>
          
          <footer className="mt-8 py-4 border-t border-gray-200 dark:border-gray-800 text-center text-sm text-gray-500 dark:text-gray-400">
            Copyright © 2025 of Datavtar Private Limited. All rights reserved.
          </footer>
        </main>
      </div>
      
      {renderFormModal()}
    </div>
  );
};

export default App;