import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Plus,
  Trash2,
  Edit,
  Building,
  Construction,
  FileText,
  UserRound,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  TrendingUp,
  ChartBar,
  Download,
  X,
  Sun,
  Moon,
  Menu,
  Package,
  Truck,
  Warehouse,
  Database,
  ChartPie as RechartsIcon,
  Filter,
  Settings,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import styles from './styles/styles.module.css';

// Types for our application
type Project = {
  id: string;
  name: string;
  client: string;
  location: string;
  startDate: string;
  endDate: string;
  budget: number;
  status: 'Planning' | 'In Progress' | 'Completed' | 'On Hold';
  description: string;
  projectManager: string;
  projectType: 'Construction' | 'Infrastructure' | 'Industrial' | 'Residential' | 'Commercial';
};

type Contact = {
  id: string;
  name: string;
  role: string;
  company: string;
  email: string;
  phone: string;
  notes: string;
};

type Task = {
  id: string;
  projectId: string;
  title: string;
  description: string;
  assignedTo: string;
  dueDate: string;
  status: 'To Do' | 'In Progress' | 'Completed' | 'Blocked';
  priority: 'Low' | 'Medium' | 'High';
};

type Resource = {
  id: string;
  name: string;
  type: 'Equipment' | 'Material' | 'Labor';
  quantity: number;
  unit: string;
  unitPrice: number;
  supplier: string;
  deliveryDate?: string;
  status: 'Ordered' | 'In Transit' | 'Delivered' | 'On Site';
};

type Analytics = {
  projectsByStatus: { name: string; value: number }[];
  projectsByType: { name: string; value: number }[];
  resourceAllocation: { name: string; value: number }[];
  monthlyBudgetData: { month: string; planned: number; actual: number }[];
};

type AppData = {
  projects: Project[];
  contacts: Contact[];
  tasks: Task[];
  resources: Resource[];
};

type TabType = 'projects' | 'tasks' | 'resources' | 'contacts' | 'analytics';

type ModalType = 'addProject' | 'editProject' | 'addTask' | 'editTask' | 'addResource' | 'editResource' | 'addContact' | 'editContact' | 'projectDetails' | null;

const App: React.FC = () => {
  // Initialize app data from localStorage or with defaults
  const [data, setData] = useState<AppData>(() => {
    const savedData = localStorage.getItem('epcnxtData');
    if (savedData) {
      return JSON.parse(savedData);
    }
    return {
      projects: [
        {
          id: '1',
          name: 'City Center Redevelopment',
          client: 'Metropolis Development Corp',
          location: 'Downtown Metropolis',
          startDate: '2025-03-01',
          endDate: '2026-09-30',
          budget: 25000000,
          status: 'In Progress',
          description: 'Major urban renewal project including commercial spaces, residential units, and public areas.',
          projectManager: 'Sarah Johnson',
          projectType: 'Commercial'
        },
        {
          id: '2',
          name: 'Harbor Bridge Expansion',
          client: 'State Transportation Authority',
          location: 'Harbor District',
          startDate: '2025-06-15',
          endDate: '2027-12-31',
          budget: 85000000,
          status: 'Planning',
          description: 'Expansion of the main harbor bridge to accommodate increased traffic flow and add pedestrian access.',
          projectManager: 'Michael Chen',
          projectType: 'Infrastructure'
        },
        {
          id: '3',
          name: 'Green Energy Plant',
          client: 'CleanPower Inc.',
          location: 'Industrial Park',
          startDate: '2025-01-10',
          endDate: '2026-04-30',
          budget: 42000000,
          status: 'In Progress',
          description: 'Construction of a new solar and wind energy production facility with battery storage capabilities.',
          projectManager: 'Alex Rodriguez',
          projectType: 'Industrial'
        }
      ],
      contacts: [
        {
          id: '1',
          name: 'Sarah Johnson',
          role: 'Project Manager',
          company: 'EPCNxt',
          email: 'sarah.johnson@epcnxt.com',
          phone: '(555) 123-4567',
          notes: 'Lead project manager for commercial projects'
        },
        {
          id: '2',
          name: 'Michael Chen',
          role: 'Civil Engineer',
          company: 'EPCNxt',
          email: 'michael.chen@epcnxt.com',
          phone: '(555) 987-6543',
          notes: 'Specializes in infrastructure projects'
        }
      ],
      tasks: [
        {
          id: '1',
          projectId: '1',
          title: 'Finalize architectural designs',
          description: 'Review and approve final architectural plans for the main building complex',
          assignedTo: 'Sarah Johnson',
          dueDate: '2025-05-01',
          status: 'In Progress',
          priority: 'High'
        },
        {
          id: '2',
          projectId: '2',
          title: 'Environmental impact assessment',
          description: 'Complete the environmental impact study for the bridge expansion',
          assignedTo: 'Michael Chen',
          dueDate: '2025-07-15',
          status: 'To Do',
          priority: 'Medium'
        }
      ],
      resources: [
        {
          id: '1',
          name: 'Steel Beams',
          type: 'Material',
          quantity: 5000,
          unit: 'tons',
          unitPrice: 1200,
          supplier: 'SteelWorks Inc.',
          deliveryDate: '2025-04-10',
          status: 'Ordered'
        },
        {
          id: '2',
          name: 'Excavator',
          type: 'Equipment',
          quantity: 3,
          unit: 'units',
          unitPrice: 250000,
          supplier: 'HeavyEquip Rentals',
          deliveryDate: '2025-03-15',
          status: 'Delivered'
        }
      ]
    };
  });

  const [activeTab, setActiveTab] = useState<TabType>('projects');
  const [modalType, setModalType] = useState<ModalType>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<Project | Contact | Task | Resource | null>(null);
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode === 'true' || (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const modalRef = useRef<HTMLDivElement>(null);

  // Save data to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('epcnxtData', JSON.stringify(data));
  }, [data]);

  // Apply dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && modalType) {
        closeModal();
      }
    };
    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [modalType]);

  // Close the modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node) && modalType) {
        closeModal();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [modalType]);

  // Generate analytics data based on current projects, resources, etc.
  const getAnalyticsData = (): Analytics => {
    // Count projects by status
    const projectsByStatus = Object.entries(
      data.projects.reduce((acc: Record<string, number>, project) => {
        acc[project.status] = (acc[project.status] || 0) + 1;
        return acc;
      }, {})
    ).map(([name, value]) => ({ name, value }));

    // Count projects by type
    const projectsByType = Object.entries(
      data.projects.reduce((acc: Record<string, number>, project) => {
        acc[project.projectType] = (acc[project.projectType] || 0) + 1;
        return acc;
      }, {})
    ).map(([name, value]) => ({ name, value }));

    // Resource allocation by type
    const resourceAllocation = Object.entries(
      data.resources.reduce((acc: Record<string, number>, resource) => {
        acc[resource.type] = (acc[resource.type] || 0) + (resource.quantity * resource.unitPrice);
        return acc;
      }, {})
    ).map(([name, value]) => ({ name, value }));

    // Generate some sample monthly budget data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyBudgetData = months.map(month => {
      const planned = Math.floor(Math.random() * 1000000) + 500000;
      const actual = Math.floor(planned * (0.9 + Math.random() * 0.2)); // -10% to +10% of planned
      return { month, planned, actual };
    });

    return { projectsByStatus, projectsByType, resourceAllocation, monthlyBudgetData };
  };

  const analytics = getAnalyticsData();

  // Open modal
  const openModal = (type: ModalType, item?: Project | Contact | Task | Resource) => {
    setModalType(type);
    if (item) {
      setSelectedItem(item);
    } else {
      setSelectedItem(null);
    }
    document.body.classList.add('modal-open');
  };

  // Close modal
  const closeModal = () => {
    setModalType(null);
    setSelectedItem(null);
    document.body.classList.remove('modal-open');
  };

  // Generate a unique ID
  const generateId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  };

  // Handle form submission
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const newItem: any = {};
    
    // Convert formData to object and handle types
    formData.forEach((value, key) => {
      if (key === 'budget' || key === 'quantity' || key === 'unitPrice') {
        newItem[key] = parseFloat(value as string) || 0;
      } else {
        newItem[key] = value;
      }
    });

    // Add ID if it's a new item
    if (!newItem.id) {
      newItem.id = generateId();
    }

    // Update the data based on modal type
    if (modalType === 'addProject' || modalType === 'editProject') {
      if (modalType === 'addProject') {
        setData(prev => ({ ...prev, projects: [...prev.projects, newItem as Project] }));
      } else {
        setData(prev => ({
          ...prev,
          projects: prev.projects.map(p => (p.id === newItem.id ? newItem as Project : p))
        }));
      }
    } else if (modalType === 'addTask' || modalType === 'editTask') {
      if (modalType === 'addTask') {
        setData(prev => ({ ...prev, tasks: [...prev.tasks, newItem as Task] }));
      } else {
        setData(prev => ({
          ...prev,
          tasks: prev.tasks.map(t => (t.id === newItem.id ? newItem as Task : t))
        }));
      }
    } else if (modalType === 'addResource' || modalType === 'editResource') {
      if (modalType === 'addResource') {
        setData(prev => ({ ...prev, resources: [...prev.resources, newItem as Resource] }));
      } else {
        setData(prev => ({
          ...prev,
          resources: prev.resources.map(r => (r.id === newItem.id ? newItem as Resource : r))
        }));
      }
    } else if (modalType === 'addContact' || modalType === 'editContact') {
      if (modalType === 'addContact') {
        setData(prev => ({ ...prev, contacts: [...prev.contacts, newItem as Contact] }));
      } else {
        setData(prev => ({
          ...prev,
          contacts: prev.contacts.map(c => (c.id === newItem.id ? newItem as Contact : c))
        }));
      }
    }

    closeModal();
  };

  // Delete an item
  const deleteItem = (type: TabType, id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      if (type === 'projects') {
        setData(prev => ({ ...prev, projects: prev.projects.filter(p => p.id !== id) }));
        // Also delete related tasks
        setData(prev => ({ ...prev, tasks: prev.tasks.filter(t => t.projectId !== id) }));
      } else if (type === 'tasks') {
        setData(prev => ({ ...prev, tasks: prev.tasks.filter(t => t.id !== id) }));
      } else if (type === 'resources') {
        setData(prev => ({ ...prev, resources: prev.resources.filter(r => r.id !== id) }));
      } else if (type === 'contacts') {
        setData(prev => ({ ...prev, contacts: prev.contacts.filter(c => c.id !== id) }));
      }
    }
  };

  // Filter data based on search term and filter status
  const getFilteredData = (type: TabType) => {
    let filteredData;
    
    if (type === 'projects') {
      filteredData = data.projects.filter(project => {
        const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.location.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
        return matchesSearch && matchesStatus;
      });
    } else if (type === 'tasks') {
      filteredData = data.tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.assignedTo.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
        return matchesSearch && matchesStatus;
      });
    } else if (type === 'resources') {
      filteredData = data.resources.filter(resource => {
        const matchesSearch = resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           resource.supplier.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || resource.status === filterStatus;
        return matchesSearch && matchesStatus;
      });
    } else {
      filteredData = data.contacts.filter(contact =>
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filteredData;
  };

  // Export data as CSV
  const exportCSV = (type: TabType) => {
    let csvContent = '';
    let fileName = '';
    
    if (type === 'projects') {
      const headers = 'ID,Name,Client,Location,Start Date,End Date,Budget,Status,Project Manager,Project Type\n';
      const rows = data.projects.map(p => 
        `${p.id},"${p.name}","${p.client}","${p.location}",${p.startDate},${p.endDate},${p.budget},${p.status},"${p.projectManager}",${p.projectType}`
      ).join('\n');
      csvContent = headers + rows;
      fileName = 'epcnxt-projects.csv';
    } else if (type === 'tasks') {
      const headers = 'ID,Project ID,Title,Assigned To,Due Date,Status,Priority\n';
      const rows = data.tasks.map(t => 
        `${t.id},${t.projectId},"${t.title}","${t.assignedTo}",${t.dueDate},${t.status},${t.priority}`
      ).join('\n');
      csvContent = headers + rows;
      fileName = 'epcnxt-tasks.csv';
    } else if (type === 'resources') {
      const headers = 'ID,Name,Type,Quantity,Unit,Unit Price,Supplier,Delivery Date,Status\n';
      const rows = data.resources.map(r => 
        `${r.id},"${r.name}",${r.type},${r.quantity},${r.unit},${r.unitPrice},"${r.supplier}",${r.deliveryDate || ''},${r.status}`
      ).join('\n');
      csvContent = headers + rows;
      fileName = 'epcnxt-resources.csv';
    } else if (type === 'contacts') {
      const headers = 'ID,Name,Role,Company,Email,Phone\n';
      const rows = data.contacts.map(c => 
        `${c.id},"${c.name}","${c.role}","${c.company}",${c.email},${c.phone}`
      ).join('\n');
      csvContent = headers + rows;
      fileName = 'epcnxt-contacts.csv';
    }
    
    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Get filter options based on active tab
  const getFilterOptions = () => {
    if (activeTab === 'projects') {
      return [
        { value: 'all', label: 'All Statuses' },
        { value: 'Planning', label: 'Planning' },
        { value: 'In Progress', label: 'In Progress' },
        { value: 'Completed', label: 'Completed' },
        { value: 'On Hold', label: 'On Hold' }
      ];
    } else if (activeTab === 'tasks') {
      return [
        { value: 'all', label: 'All Statuses' },
        { value: 'To Do', label: 'To Do' },
        { value: 'In Progress', label: 'In Progress' },
        { value: 'Completed', label: 'Completed' },
        { value: 'Blocked', label: 'Blocked' }
      ];
    } else if (activeTab === 'resources') {
      return [
        { value: 'all', label: 'All Statuses' },
        { value: 'Ordered', label: 'Ordered' },
        { value: 'In Transit', label: 'In Transit' },
        { value: 'Delivered', label: 'Delivered' },
        { value: 'On Site', label: 'On Site' }
      ];
    }
    return [{ value: 'all', label: 'All' }];
  };

  // Get the color for status badges
  const getStatusColor = (status: string): string => {
    const statusColors: Record<string, string> = {
      'Planning': 'badge badge-info',
      'In Progress': 'badge badge-warning',
      'Completed': 'badge badge-success',
      'On Hold': 'badge badge-error',
      'To Do': 'badge badge-info',
      'Blocked': 'badge badge-error',
      'Ordered': 'badge badge-info',
      'In Transit': 'badge badge-warning',
      'Delivered': 'badge badge-success',
      'On Site': 'badge badge-success',
    };
    return statusColors[status] || 'badge';
  };

  // Get the correct icon for tab
  const getTabIcon = (tab: TabType) => {
    switch (tab) {
      case 'projects':
        return <Building className="h-5 w-5" />;
      case 'tasks':
        return <FileText className="h-5 w-5" />;
      case 'resources':
        return <Truck className="h-5 w-5" />;
      case 'contacts':
        return <UserRound className="h-5 w-5" />;
      case 'analytics':
        return <ChartBar className="h-5 w-5" />;
      default:
        return null;
    }
  };

  // Render project modal form
  const renderProjectForm = () => {
    const project = selectedItem as Project;
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="hidden" name="id" value={project?.id || ''} />
        <div className="form-group">
          <label htmlFor="name" className="form-label">Project Name</label>
          <input type="text" id="name" name="name" className="input" defaultValue={project?.name || ''} required />
        </div>
        <div className="form-group">
          <label htmlFor="client" className="form-label">Client</label>
          <input type="text" id="client" name="client" className="input" defaultValue={project?.client || ''} required />
        </div>
        <div className="form-group">
          <label htmlFor="location" className="form-label">Location</label>
          <input type="text" id="location" name="location" className="input" defaultValue={project?.location || ''} required />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label htmlFor="startDate" className="form-label">Start Date</label>
            <input type="date" id="startDate" name="startDate" className="input" defaultValue={project?.startDate || ''} required />
          </div>
          <div className="form-group">
            <label htmlFor="endDate" className="form-label">End Date</label>
            <input type="date" id="endDate" name="endDate" className="input" defaultValue={project?.endDate || ''} required />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="budget" className="form-label">Budget ($)</label>
          <input type="number" id="budget" name="budget" className="input" defaultValue={project?.budget || 0} required min="0" step="1000" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label htmlFor="status" className="form-label">Status</label>
            <select id="status" name="status" className="input" defaultValue={project?.status || 'Planning'} required>
              <option value="Planning">Planning</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="On Hold">On Hold</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="projectType" className="form-label">Project Type</label>
            <select id="projectType" name="projectType" className="input" defaultValue={project?.projectType || 'Construction'} required>
              <option value="Construction">Construction</option>
              <option value="Infrastructure">Infrastructure</option>
              <option value="Industrial">Industrial</option>
              <option value="Residential">Residential</option>
              <option value="Commercial">Commercial</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="projectManager" className="form-label">Project Manager</label>
          <input type="text" id="projectManager" name="projectManager" className="input" defaultValue={project?.projectManager || ''} required />
        </div>
        <div className="form-group">
          <label htmlFor="description" className="form-label">Description</label>
          <textarea id="description" name="description" className="input" rows={3} defaultValue={project?.description || ''} required></textarea>
        </div>
        <div className="flex justify-end space-x-2">
          <button type="button" className="btn bg-gray-300 text-gray-800 hover:bg-gray-400" onClick={closeModal}>Cancel</button>
          <button type="submit" className="btn btn-primary">
            {modalType === 'addProject' ? 'Add Project' : 'Update Project'}
          </button>
        </div>
      </form>
    );
  };

  // Render task modal form
  const renderTaskForm = () => {
    const task = selectedItem as Task;
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="hidden" name="id" value={task?.id || ''} />
        <div className="form-group">
          <label htmlFor="projectId" className="form-label">Project</label>
          <select id="projectId" name="projectId" className="input" defaultValue={task?.projectId || ''} required>
            {data.projects.map(project => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="title" className="form-label">Task Title</label>
          <input type="text" id="title" name="title" className="input" defaultValue={task?.title || ''} required />
        </div>
        <div className="form-group">
          <label htmlFor="description" className="form-label">Description</label>
          <textarea id="description" name="description" className="input" rows={3} defaultValue={task?.description || ''}></textarea>
        </div>
        <div className="form-group">
          <label htmlFor="assignedTo" className="form-label">Assigned To</label>
          <input type="text" id="assignedTo" name="assignedTo" className="input" defaultValue={task?.assignedTo || ''} required />
        </div>
        <div className="form-group">
          <label htmlFor="dueDate" className="form-label">Due Date</label>
          <input type="date" id="dueDate" name="dueDate" className="input" defaultValue={task?.dueDate || ''} required />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label htmlFor="status" className="form-label">Status</label>
            <select id="status" name="status" className="input" defaultValue={task?.status || 'To Do'} required>
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Blocked">Blocked</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="priority" className="form-label">Priority</label>
            <select id="priority" name="priority" className="input" defaultValue={task?.priority || 'Medium'} required>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <button type="button" className="btn bg-gray-300 text-gray-800 hover:bg-gray-400" onClick={closeModal}>Cancel</button>
          <button type="submit" className="btn btn-primary">
            {modalType === 'addTask' ? 'Add Task' : 'Update Task'}
          </button>
        </div>
      </form>
    );
  };

  // Render resource modal form
  const renderResourceForm = () => {
    const resource = selectedItem as Resource;
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="hidden" name="id" value={resource?.id || ''} />
        <div className="form-group">
          <label htmlFor="name" className="form-label">Resource Name</label>
          <input type="text" id="name" name="name" className="input" defaultValue={resource?.name || ''} required />
        </div>
        <div className="form-group">
          <label htmlFor="type" className="form-label">Type</label>
          <select id="type" name="type" className="input" defaultValue={resource?.type || 'Material'} required>
            <option value="Equipment">Equipment</option>
            <option value="Material">Material</option>
            <option value="Labor">Labor</option>
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label htmlFor="quantity" className="form-label">Quantity</label>
            <input type="number" id="quantity" name="quantity" className="input" defaultValue={resource?.quantity || 0} required min="0" />
          </div>
          <div className="form-group">
            <label htmlFor="unit" className="form-label">Unit</label>
            <input type="text" id="unit" name="unit" className="input" defaultValue={resource?.unit || ''} required />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="unitPrice" className="form-label">Unit Price ($)</label>
          <input type="number" id="unitPrice" name="unitPrice" className="input" defaultValue={resource?.unitPrice || 0} required min="0" step="0.01" />
        </div>
        <div className="form-group">
          <label htmlFor="supplier" className="form-label">Supplier</label>
          <input type="text" id="supplier" name="supplier" className="input" defaultValue={resource?.supplier || ''} required />
        </div>
        <div className="form-group">
          <label htmlFor="deliveryDate" className="form-label">Delivery Date</label>
          <input type="date" id="deliveryDate" name="deliveryDate" className="input" defaultValue={resource?.deliveryDate || ''} />
        </div>
        <div className="form-group">
          <label htmlFor="status" className="form-label">Status</label>
          <select id="status" name="status" className="input" defaultValue={resource?.status || 'Ordered'} required>
            <option value="Ordered">Ordered</option>
            <option value="In Transit">In Transit</option>
            <option value="Delivered">Delivered</option>
            <option value="On Site">On Site</option>
          </select>
        </div>
        <div className="flex justify-end space-x-2">
          <button type="button" className="btn bg-gray-300 text-gray-800 hover:bg-gray-400" onClick={closeModal}>Cancel</button>
          <button type="submit" className="btn btn-primary">
            {modalType === 'addResource' ? 'Add Resource' : 'Update Resource'}
          </button>
        </div>
      </form>
    );
  };

  // Render contact modal form
  const renderContactForm = () => {
    const contact = selectedItem as Contact;
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="hidden" name="id" value={contact?.id || ''} />
        <div className="form-group">
          <label htmlFor="name" className="form-label">Name</label>
          <input type="text" id="name" name="name" className="input" defaultValue={contact?.name || ''} required />
        </div>
        <div className="form-group">
          <label htmlFor="role" className="form-label">Role</label>
          <input type="text" id="role" name="role" className="input" defaultValue={contact?.role || ''} required />
        </div>
        <div className="form-group">
          <label htmlFor="company" className="form-label">Company</label>
          <input type="text" id="company" name="company" className="input" defaultValue={contact?.company || ''} required />
        </div>
        <div className="form-group">
          <label htmlFor="email" className="form-label">Email</label>
          <input type="email" id="email" name="email" className="input" defaultValue={contact?.email || ''} required />
        </div>
        <div className="form-group">
          <label htmlFor="phone" className="form-label">Phone</label>
          <input type="text" id="phone" name="phone" className="input" defaultValue={contact?.phone || ''} required />
        </div>
        <div className="form-group">
          <label htmlFor="notes" className="form-label">Notes</label>
          <textarea id="notes" name="notes" className="input" rows={3} defaultValue={contact?.notes || ''}></textarea>
        </div>
        <div className="flex justify-end space-x-2">
          <button type="button" className="btn bg-gray-300 text-gray-800 hover:bg-gray-400" onClick={closeModal}>Cancel</button>
          <button type="submit" className="btn btn-primary">
            {modalType === 'addContact' ? 'Add Contact' : 'Update Contact'}
          </button>
        </div>
      </form>
    );
  };

  // Render project details modal
  const renderProjectDetails = () => {
    const project = selectedItem as Project;
    const projectTasks = data.tasks.filter(task => task.projectId === project.id);
    
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Project Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Client</p>
              <p className="font-medium">{project.client}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
              <p className="font-medium">{project.location}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Timeline</p>
              <p className="font-medium">{new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Budget</p>
              <p className="font-medium">${project.budget.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
              <span className={getStatusColor(project.status)}>{project.status}</span>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Project Manager</p>
              <p className="font-medium">{project.projectManager}</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Description</h3>
          <p className="text-gray-700 dark:text-gray-300">{project.description}</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Related Tasks</h3>
          {projectTasks.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr className="table-header">
                    <th className="table-cell">Task</th>
                    <th className="table-cell">Status</th>
                    <th className="table-cell">Assigned To</th>
                    <th className="table-cell">Due Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                  {projectTasks.map(task => (
                    <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="table-cell font-medium">{task.title}</td>
                      <td className="table-cell"><span className={getStatusColor(task.status)}>{task.status}</span></td>
                      <td className="table-cell">{task.assignedTo}</td>
                      <td className="table-cell">{new Date(task.dueDate).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 italic">No tasks associated with this project yet.</p>
          )}
        </div>
        <div className="flex justify-end space-x-2">
          <button 
            className="btn bg-gray-300 text-gray-800 hover:bg-gray-400" 
            onClick={closeModal}
          >
            Close
          </button>
          <button 
            className="btn btn-primary" 
            onClick={() => {
              closeModal();
              setTimeout(() => openModal('editProject', project), 100);
            }}
          >
            Edit Project
          </button>
        </div>
      </div>
    );
  };

  // Render the appropriate form based on modal type
  const renderModalContent = () => {
    switch(modalType) {
      case 'addProject':
      case 'editProject':
        return renderProjectForm();
      case 'addTask':
      case 'editTask':
        return renderTaskForm();
      case 'addResource':
      case 'editResource':
        return renderResourceForm();
      case 'addContact':
      case 'editContact':
        return renderContactForm();
      case 'projectDetails':
        return renderProjectDetails();
      default:
        return null;
    }
  };

  // Get modal title
  const getModalTitle = () => {
    switch(modalType) {
      case 'addProject':
        return 'Add New Project';
      case 'editProject':
        return 'Edit Project';
      case 'addTask':
        return 'Add New Task';
      case 'editTask':
        return 'Edit Task';
      case 'addResource':
        return 'Add New Resource';
      case 'editResource':
        return 'Edit Resource';
      case 'addContact':
        return 'Add New Contact';
      case 'editContact':
        return 'Edit Contact';
      case 'projectDetails':
        return (selectedItem as Project)?.name || 'Project Details';
      default:
        return '';
    }
  };

  // Render projects tab content
  const renderProjectsTab = () => {
    const filteredProjects = getFilteredData('projects') as Project[];
    return (
      <div>
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr className="table-header">
                <th className="table-cell">Name</th>
                <th className="table-cell hidden md:table-cell">Client</th>
                <th className="table-cell hidden lg:table-cell">Location</th>
                <th className="table-cell hidden sm:table-cell">Status</th>
                <th className="table-cell">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {filteredProjects.map(project => (
                <tr key={project.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="table-cell font-medium">
                    <button 
                      className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-left" 
                      onClick={() => openModal('projectDetails', project)}
                    >
                      {project.name}
                    </button>
                  </td>
                  <td className="table-cell hidden md:table-cell">{project.client}</td>
                  <td className="table-cell hidden lg:table-cell">{project.location}</td>
                  <td className="table-cell hidden sm:table-cell">
                    <span className={getStatusColor(project.status)}>{project.status}</span>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center space-x-2">
                      <button 
                        className="text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400" 
                        onClick={() => openModal('editProject', project)}
                        aria-label="Edit project"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button 
                        className="text-gray-600 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400" 
                        onClick={() => deleteItem('projects', project.id)}
                        aria-label="Delete project"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProjects.length === 0 && (
                <tr>
                  <td colSpan={5} className="table-cell text-center py-8 text-gray-500 dark:text-gray-400 italic">
                    No projects found. Add a new project to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Render tasks tab content
  const renderTasksTab = () => {
    const filteredTasks = getFilteredData('tasks') as Task[];
    return (
      <div>
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr className="table-header">
                <th className="table-cell">Title</th>
                <th className="table-cell hidden md:table-cell">Project</th>
                <th className="table-cell hidden sm:table-cell">Assigned To</th>
                <th className="table-cell hidden lg:table-cell">Due Date</th>
                <th className="table-cell">Status</th>
                <th className="table-cell">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {filteredTasks.map(task => {
                const project = data.projects.find(p => p.id === task.projectId);
                return (
                  <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="table-cell font-medium">{task.title}</td>
                    <td className="table-cell hidden md:table-cell">{project?.name || 'N/A'}</td>
                    <td className="table-cell hidden sm:table-cell">{task.assignedTo}</td>
                    <td className="table-cell hidden lg:table-cell">{new Date(task.dueDate).toLocaleDateString()}</td>
                    <td className="table-cell">
                      <span className={getStatusColor(task.status)}>{task.status}</span>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center space-x-2">
                        <button 
                          className="text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400" 
                          onClick={() => openModal('editTask', task)}
                          aria-label="Edit task"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button 
                          className="text-gray-600 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400" 
                          onClick={() => deleteItem('tasks', task.id)}
                          aria-label="Delete task"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredTasks.length === 0 && (
                <tr>
                  <td colSpan={6} className="table-cell text-center py-8 text-gray-500 dark:text-gray-400 italic">
                    No tasks found. Add a new task to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Render resources tab content
  const renderResourcesTab = () => {
    const filteredResources = getFilteredData('resources') as Resource[];
    return (
      <div>
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr className="table-header">
                <th className="table-cell">Name</th>
                <th className="table-cell hidden sm:table-cell">Type</th>
                <th className="table-cell hidden md:table-cell">Quantity</th>
                <th className="table-cell hidden lg:table-cell">Unit Price</th>
                <th className="table-cell">Status</th>
                <th className="table-cell">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {filteredResources.map(resource => (
                <tr key={resource.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="table-cell font-medium">{resource.name}</td>
                  <td className="table-cell hidden sm:table-cell">{resource.type}</td>
                  <td className="table-cell hidden md:table-cell">{resource.quantity} {resource.unit}</td>
                  <td className="table-cell hidden lg:table-cell">${resource.unitPrice.toLocaleString()}</td>
                  <td className="table-cell">
                    <span className={getStatusColor(resource.status)}>{resource.status}</span>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center space-x-2">
                      <button 
                        className="text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400" 
                        onClick={() => openModal('editResource', resource)}
                        aria-label="Edit resource"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button 
                        className="text-gray-600 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400" 
                        onClick={() => deleteItem('resources', resource.id)}
                        aria-label="Delete resource"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredResources.length === 0 && (
                <tr>
                  <td colSpan={6} className="table-cell text-center py-8 text-gray-500 dark:text-gray-400 italic">
                    No resources found. Add a new resource to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Render contacts tab content
  const renderContactsTab = () => {
    const filteredContacts = getFilteredData('contacts') as Contact[];
    return (
      <div>
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr className="table-header">
                <th className="table-cell">Name</th>
                <th className="table-cell hidden sm:table-cell">Role</th>
                <th className="table-cell hidden md:table-cell">Company</th>
                <th className="table-cell hidden lg:table-cell">Email</th>
                <th className="table-cell hidden xl:table-cell">Phone</th>
                <th className="table-cell">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {filteredContacts.map(contact => (
                <tr key={contact.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="table-cell font-medium">{contact.name}</td>
                  <td className="table-cell hidden sm:table-cell">{contact.role}</td>
                  <td className="table-cell hidden md:table-cell">{contact.company}</td>
                  <td className="table-cell hidden lg:table-cell">
                    <a href={`mailto:${contact.email}`} className="text-primary-600 hover:underline dark:text-primary-400">
                      {contact.email}
                    </a>
                  </td>
                  <td className="table-cell hidden xl:table-cell">
                    <a href={`tel:${contact.phone.replace(/\D/g, '')}`} className="text-primary-600 hover:underline dark:text-primary-400">
                      {contact.phone}
                    </a>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center space-x-2">
                      <button 
                        className="text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400" 
                        onClick={() => openModal('editContact', contact)}
                        aria-label="Edit contact"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button 
                        className="text-gray-600 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400" 
                        onClick={() => deleteItem('contacts', contact.id)}
                        aria-label="Delete contact"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredContacts.length === 0 && (
                <tr>
                  <td colSpan={6} className="table-cell text-center py-8 text-gray-500 dark:text-gray-400 italic">
                    No contacts found. Add a new contact to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // RECHARTS COLORS
  const CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  // Render analytics tab content
  const renderAnalyticsTab = () => {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Project Status Distribution */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Projects by Status</h3>
            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.projectsByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analytics.projectsByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} projects`, 'Count']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Project Type Distribution */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Projects by Type</h3>
            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.projectsByType}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analytics.projectsByType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} projects`, 'Count']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Resource Allocation */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Resource Allocation ($)</h3>
            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.resourceAllocation}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${(value as number).toLocaleString()}`, 'Value']} />
                  <Legend />
                  <Bar dataKey="value" name="Value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Budget Comparison */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Monthly Budget Comparison</h3>
            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.monthlyBudgetData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${(value as number).toLocaleString()}`, '']} /> 
                  <Legend />
                  <Bar dataKey="planned" name="Planned Budget" fill="#8884d8" />
                  <Bar dataKey="actual" name="Actual Expenses" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="stat-title">Total Projects</p>
                  <p className="stat-value">{data.projects.length}</p>
                </div>
                <Building className="h-10 w-10 text-primary-500" />
              </div>
              <p className="stat-desc">
                <span className="text-green-500 flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  {Math.floor(Math.random() * 10) + 5}% from last month
                </span>
              </p>
            </div>
            <div className="stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="stat-title">Active Tasks</p>
                  <p className="stat-value">{data.tasks.filter(t => t.status !== 'Completed').length}</p>
                </div>
                <FileText className="h-10 w-10 text-primary-500" />
              </div>
              <p className="stat-desc">
                {data.tasks.filter(t => t.priority === 'High').length} high priority
              </p>
            </div>
            <div className="stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="stat-title">Resources</p>
                  <p className="stat-value">{data.resources.length}</p>
                </div>
                <Package className="h-10 w-10 text-primary-500" />
              </div>
              <p className="stat-desc">
                {data.resources.filter(r => r.status === 'Ordered').length} ordered
              </p>
            </div>
            <div className="stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="stat-title">Total Budget</p>
                  <p className="stat-value">
                    ${data.projects.reduce((sum, p) => sum + p.budget, 0).toLocaleString()}
                  </p>
                </div>
                <Database className="h-10 w-10 text-primary-500" />
              </div>
              <p className="stat-desc">
                Across {data.projects.length} projects
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render the appropriate tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'projects':
        return renderProjectsTab();
      case 'tasks':
        return renderTasksTab();
      case 'resources':
        return renderResourcesTab();
      case 'contacts':
        return renderContactsTab();
      case 'analytics':
        return renderAnalyticsTab();
      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 ${styles.appWrapper}`}>
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="container-fluid py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className={styles.logo}>
                <Construction className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                <span className="text-xl font-bold ml-2">EPCNxt</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                className="bg-gray-200 dark:bg-gray-700 rounded-full p-2 text-gray-600 dark:text-gray-200 theme-transition"
                onClick={() => setDarkMode(prev => !prev)}
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>
              <div className="hidden md:block">
                <span className="text-sm font-medium">
                  EPC Management Platform
                </span>
              </div>
              <button
                className="md:hidden text-gray-600 dark:text-gray-200"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Nav Sidebar (when menu is open) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div 
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          ></div>
          <div className="fixed top-0 right-0 h-full w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-all duration-300 overflow-y-auto">
            <div className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
              <span className="text-lg font-semibold">Menu</span>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="p-4">
              {(['projects', 'tasks', 'resources', 'contacts', 'analytics'] as TabType[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left px-4 py-3 rounded-md mb-2 flex items-center ${activeTab === tab ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                  {getTabIcon(tab)}
                  <span className="ml-3 capitalize">{tab}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      <div className="container-fluid py-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar (desktop) */}
          <aside className="hidden md:block w-64 space-y-2">
            <div className="card sticky top-6">
              <nav className="space-y-1">
                {(['projects', 'tasks', 'resources', 'contacts', 'analytics'] as TabType[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`block w-full text-left px-4 py-3 rounded-md flex items-center ${activeTab === tab ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                  >
                    {getTabIcon(tab)}
                    <span className="ml-3 capitalize">{tab}</span>
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <div className="card">
              {/* Tab Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
                <h1 className="text-2xl font-bold capitalize flex items-center gap-2">
                  {getTabIcon(activeTab)}
                  <span>{activeTab}</span>
                </h1>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <div className="flex">
                    <div className="relative flex-1 min-w-0">
                      <input
                        type="text"
                        placeholder="Search..."
                        className="input pr-10 w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  {activeTab !== 'analytics' && (
                    <div className="flex items-center space-x-2">
                      {activeTab !== 'contacts' && (
                        <select
                          className="input py-2"
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value)}
                          aria-label="Filter by status"
                        >
                          {getFilterOptions().map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      )}
                      <button 
                        className="btn btn-primary" 
                        onClick={() => openModal(`add${activeTab.slice(0, -1)}` as ModalType)}
                        aria-label={`Add new ${activeTab.slice(0, -1)}`}
                      >
                        <Plus className="h-5 w-5" />
                      </button>
                      {activeTab !== 'analytics' && (
                        <button 
                          className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600" 
                          onClick={() => exportCSV(activeTab)}
                          aria-label={`Export ${activeTab} as CSV`}
                        >
                          <Download className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Tab Content */}
              {renderTabContent()}
            </div>
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 shadow-sm mt-auto py-4">
        <div className="container-fluid text-center text-gray-500 dark:text-gray-400 text-sm">
          Copyright © 2025 of Datavtar Private Limited. All rights reserved.
        </div>
      </footer>

      {/* Modal */}
      {modalType && (
        <div className="modal-backdrop theme-transition" role="dialog" aria-modal="true">
          <div 
            className="modal-content max-w-xl w-full" 
            ref={modalRef}
          >
            <div className="modal-header">
              <h2 className="text-xl font-semibold" id="modal-title">{getModalTitle()}</h2>
              <button 
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4">
              {renderModalContent()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
