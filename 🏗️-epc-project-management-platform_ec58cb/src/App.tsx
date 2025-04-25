import React, { useState, useEffect } from 'react';
import {
  User,
  ChevronDown,
  Mail,
  Phone,
  MapPin,
  Building,
  Briefcase,
  Search,
  Plus,
  Edit,
  Trash2,
  Menu,
  X,
  Check,
  Filter,
  Globe,
  Clock,
  Package,
  Construction,
  Truck,
  Factory,
  Wrench,
  ArrowRight,
  ChevronRight,
  Sun,
  Moon
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
  PieChart as RechartsChart,
  Pie,
  Cell
} from 'recharts';
import styles from './styles/styles.module.css';

// Define types and interfaces
interface Project {
  id: string;
  name: string;
  client: string;
  location: string;
  startDate: string;
  endDate: string;
  status: 'Planning' | 'In Progress' | 'Completed' | 'On Hold';
  budget: number;
  description: string;
  sector: string;
  projectManager: string;
  team: string[];
}

interface Service {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  benefits: string[];
}

interface TeamMember {
  id: string;
  name: string;
  position: string;
  photoUrl: string;
  bio: string;
  email: string;
  phone: string;
}

interface Testimonial {
  id: string;
  name: string;
  company: string;
  message: string;
  rating: number;
  photoUrl: string;
}

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  date: string;
  read: boolean;
}

interface CompanyStats {
  projectsCompleted: number;
  clientsServed: number;
  yearsExperience: number;
  countriesActive: number;
}

// Main App Component
const App: React.FC = () => {
  // State definitions
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      return savedMode === 'true' || 
        (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeSection, setActiveSection] = useState<string>('home');
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showProjectModal, setShowProjectModal] = useState<boolean>(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [selectedSector, setSelectedSector] = useState<string>('All');

  // Stats for the company
  const companyStats: CompanyStats = {
    projectsCompleted: 150,
    clientsServed: 75,
    yearsExperience: 15,
    countriesActive: 12
  };

  // Sample data for charts
  const projectStatusData = [
    { name: 'Planning', value: projects.filter(p => p.status === 'Planning').length || 5 },
    { name: 'In Progress', value: projects.filter(p => p.status === 'In Progress').length || 8 },
    { name: 'Completed', value: projects.filter(p => p.status === 'Completed').length || 12 },
    { name: 'On Hold', value: projects.filter(p => p.status === 'On Hold').length || 3 }
  ];

  const sectorData = [
    { name: 'Oil & Gas', value: 35 },
    { name: 'Infrastructure', value: 25 },
    { name: 'Power', value: 20 },
    { name: 'Industrial', value: 15 },
    { name: 'Others', value: 5 }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  // Sample services data
  const services: Service[] = [
    {
      id: '1',
      name: 'Engineering Design',
      description: 'Comprehensive engineering design services from concept to detailed execution.',
      icon: <Construction size={32} />,
      benefits: ['Optimized designs', 'Cost-effective solutions', 'Compliance with standards']
    },
    {
      id: '2',
      name: 'Procurement Management',
      description: 'Strategic procurement services ensuring quality supplies at competitive prices.',
      icon: <Package size={32} />,
      benefits: ['Vendor qualification', 'Contract negotiation', 'Supply chain optimization']
    },
    {
      id: '3',
      name: 'Construction Management',
      description: 'End-to-end construction management with focus on quality, safety, and timeline.',
      icon: <Building size={32} />,
      benefits: ['Schedule adherence', 'Quality assurance', 'Safety compliance']
    },
    {
      id: '4',
      name: 'Project Management',
      description: 'Comprehensive project management services to ensure project success.',
      icon: <Briefcase size={32} />,
      benefits: ['Risk management', 'Resource optimization', 'Clear communication']
    },
    {
      id: '5',
      name: 'Logistics & Supply Chain',
      description: 'Efficient logistics and supply chain management for project materials.',
      icon: <Truck size={32} />,
      benefits: ['Just-in-time delivery', 'Cost efficiency', 'Reduced downtime']
    },
    {
      id: '6',
      name: 'Maintenance & Operations',
      description: 'Post-construction maintenance and operations support for maximum efficiency.',
      icon: <Wrench size={32} />,
      benefits: ['Preventive maintenance', 'Performance optimization', 'Extended asset life']
    }
  ];

  // Sample team members
  const teamMembers: TeamMember[] = [
    {
      id: '1',
      name: 'John Smith',
      position: 'CEO & Founder',
      photoUrl: 'https://randomuser.me/api/portraits/men/41.jpg',
      bio: 'Over 20 years of experience in EPC projects across multiple industries.',
      email: 'john@epcnxt.com',
      phone: '+1 (555) 123-4567'
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      position: 'Chief Engineer',
      photoUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
      bio: 'Specialized in large-scale infrastructure projects with focus on sustainability.',
      email: 'sarah@epcnxt.com',
      phone: '+1 (555) 987-6543'
    },
    {
      id: '3',
      name: 'David Chen',
      position: 'Procurement Director',
      photoUrl: 'https://randomuser.me/api/portraits/men/15.jpg',
      bio: 'Expert in international procurement and supply chain management.',
      email: 'david@epcnxt.com',
      phone: '+1 (555) 456-7890'
    },
    {
      id: '4',
      name: 'Maria Rodriguez',
      position: 'Construction Manager',
      photoUrl: 'https://randomuser.me/api/portraits/women/28.jpg',
      bio: 'Specialized in managing complex construction projects with precision.',
      email: 'maria@epcnxt.com',
      phone: '+1 (555) 234-5678'
    }
  ];

  // Sample testimonials
  const testimonials: Testimonial[] = [
    {
      id: '1',
      name: 'Robert Williams',
      company: 'Global Energy Corp',
      message: 'EPCNXT delivered our power plant project ahead of schedule and under budget. Their professional approach and technical expertise were impressive.',
      rating: 5,
      photoUrl: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    {
      id: '2',
      name: 'Lisa Chen',
      company: 'Sustainable Infrastructure Inc',
      message: 'We partnered with EPCNXT for our green energy project. Their innovative solutions helped us achieve LEED certification with minimal environmental impact.',
      rating: 5,
      photoUrl: 'https://randomuser.me/api/portraits/women/68.jpg'
    },
    {
      id: '3',
      name: 'Michael Johnson',
      company: 'Metro Development Authority',
      message: 'EPCNXT\'s expertise in urban infrastructure projects was evident throughout our collaboration. Their team was responsive and solutions-oriented.',
      rating: 4,
      photoUrl: 'https://randomuser.me/api/portraits/men/75.jpg'
    }
  ];

  // Default projects data
  const defaultProjects: Project[] = [
    {
      id: '1',
      name: 'Offshore Wind Farm Development',
      client: 'RenewPower Inc',
      location: 'North Sea',
      startDate: '2023-03-15',
      endDate: '2025-06-30',
      status: 'In Progress',
      budget: 150000000,
      description: 'Development of a 500MW offshore wind farm with 75 turbines and offshore substation.',
      sector: 'Renewable Energy',
      projectManager: 'Sarah Johnson',
      team: ['John Smith', 'David Chen', 'Maria Rodriguez']
    },
    {
      id: '2',
      name: 'Urban Metro Extension',
      client: 'Metropolitan Transit Authority',
      location: 'Singapore',
      startDate: '2022-08-10',
      endDate: '2026-12-15',
      status: 'In Progress',
      budget: 320000000,
      description: '15km metro line extension with 8 new stations and depot facilities.',
      sector: 'Infrastructure',
      projectManager: 'David Chen',
      team: ['Maria Rodriguez', 'John Smith']
    },
    {
      id: '3',
      name: 'Petrochemical Plant Modernization',
      client: 'ChemGlobal Industries',
      location: 'Houston, USA',
      startDate: '2022-05-20',
      endDate: '2024-11-10',
      status: 'In Progress',
      budget: 230000000,
      description: 'Modernization of existing petrochemical facility to improve efficiency and reduce emissions.',
      sector: 'Oil & Gas',
      projectManager: 'Maria Rodriguez',
      team: ['John Smith', 'Sarah Johnson']
    },
    {
      id: '4',
      name: 'Hospital Complex Development',
      client: 'National Health Services',
      location: 'Manchester, UK',
      startDate: '2021-11-05',
      endDate: '2024-04-30',
      status: 'Completed',
      budget: 185000000,
      description: 'Construction of a 450-bed hospital complex with specialized medical facilities.',
      sector: 'Healthcare',
      projectManager: 'John Smith',
      team: ['Sarah Johnson', 'David Chen']
    },
    {
      id: '5',
      name: 'Solar Power Plant',
      client: 'SunEnergy Corporation',
      location: 'Arizona, USA',
      startDate: '2023-01-10',
      endDate: '2024-07-15',
      status: 'In Progress',
      budget: 95000000,
      description: '200MW solar photovoltaic power plant with energy storage system.',
      sector: 'Renewable Energy',
      projectManager: 'Sarah Johnson',
      team: ['David Chen', 'Maria Rodriguez']
    },
    {
      id: '6',
      name: 'LNG Terminal Expansion',
      client: 'Global Gas Corporation',
      location: 'Queensland, Australia',
      startDate: '2022-09-15',
      endDate: '2025-03-20',
      status: 'Planning',
      budget: 280000000,
      description: 'Expansion of existing LNG terminal to increase capacity by 50%.',
      sector: 'Oil & Gas',
      projectManager: 'David Chen',
      team: ['John Smith', 'Maria Rodriguez']
    }
  ];

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedProjects = localStorage.getItem('projects');
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    } else {
      setProjects(defaultProjects);
      localStorage.setItem('projects', JSON.stringify(defaultProjects));
    }

    const savedMessages = localStorage.getItem('contactMessages');
    if (savedMessages) {
      setContactMessages(JSON.parse(savedMessages));
    }
    
    // Apply dark mode to document
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Close modal on ESC key
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowProjectModal(false);
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => {
      window.removeEventListener('keydown', handleEscKey);
    };
  }, [isDarkMode]); // Removed defaultProjects from dependency array as it's constant

  // Save projects to localStorage whenever projects state changes
  useEffect(() => {
    localStorage.setItem('projects', JSON.stringify(projects));
  }, [projects]);

  // Save contact messages to localStorage
  useEffect(() => {
    localStorage.setItem('contactMessages', JSON.stringify(contactMessages));
  }, [contactMessages]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    localStorage.setItem('darkMode', String(!isDarkMode));
  };

  // Filter projects based on filter status and search term
  const filteredProjects = projects.filter((project: Project): boolean => {
    const matchesStatus: boolean = filterStatus === 'All' || project.status === filterStatus;
    const matchesSector: boolean = selectedSector === 'All' || project.sector === selectedSector;
    const searchTermLower: string = searchTerm.toLowerCase();
    const matchesSearch: boolean = 
                         project.name.toLowerCase().includes(searchTermLower) ||
                         project.client.toLowerCase().includes(searchTermLower) ||
                         project.location.toLowerCase().includes(searchTermLower);
    return matchesStatus && matchesSector && matchesSearch;
  });

  // Get unique sectors for filtering
  const sectors = Array.from(new Set(projects.map(project => project.sector)));

  // Project form handlers
  const handleAddProject = () => {
    setCurrentProject({
      id: '',
      name: '',
      client: '',
      location: '',
      startDate: '',
      endDate: '',
      status: 'Planning',
      budget: 0,
      description: '',
      sector: '',
      projectManager: '',
      team: []
    });
    setShowProjectModal(true);
  };

  const handleEditProject = (project: Project) => {
    setCurrentProject({...project});
    setShowProjectModal(true);
  };

  const handleDeleteProject = (id: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      setProjects(projects.filter(project => project.id !== id));
    }
  };

  const handleProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentProject) return;
    
    const formData = new FormData(e.target as HTMLFormElement);
    const updatedProject: Project = {
      id: currentProject.id || Date.now().toString(),
      name: formData.get('name') as string,
      client: formData.get('client') as string,
      location: formData.get('location') as string,
      startDate: formData.get('startDate') as string,
      endDate: formData.get('endDate') as string,
      status: formData.get('status') as 'Planning' | 'In Progress' | 'Completed' | 'On Hold',
      budget: parseFloat(formData.get('budget') as string),
      description: formData.get('description') as string,
      sector: formData.get('sector') as string,
      projectManager: formData.get('projectManager') as string,
      team: (formData.get('team') as string).split(',').map(member => member.trim())
    };

    if (currentProject.id) {
      // Update existing project
      setProjects(projects.map(p => p.id === currentProject.id ? updatedProject : p));
    } else {
      // Add new project
      setProjects([...projects, updatedProject]);
    }

    setShowProjectModal(false);
  };

  // Handle contact form submission
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const newMessage: ContactMessage = {
      id: Date.now().toString(),
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      message: formData.get('message') as string,
      date: new Date().toISOString(),
      read: false
    };

    setContactMessages([...contactMessages, newMessage]);
    
    // Reset the form
    (e.target as HTMLFormElement).reset();
    
    // Show success message
    alert('Thank you for your message. We will get back to you soon!');
  };

  // Render status badge with appropriate color
  const renderStatusBadge = (status: string) => {
    let badgeClass = '';
    
    switch (status) {
      case 'Planning':
        badgeClass = 'badge badge-info';
        break;
      case 'In Progress':
        badgeClass = 'badge badge-warning';
        break;
      case 'Completed':
        badgeClass = 'badge badge-success';
        break;
      case 'On Hold':
        badgeClass = 'badge badge-error';
        break;
      default:
        badgeClass = 'badge';
    }
    
    return (
      <span className={badgeClass}>{status}</span>
    );
  };

  return (
    <div className="min-h-screen flex flex-col theme-transition-all">
      {/* Navigation */}
      <header className="bg-white dark:bg-slate-800 shadow-md sticky top-0 z-[var(--z-sticky)]">
        <nav className="container-fluid py-4">
          <div className="flex-between">
            <div className="flex items-center">
              <a href="#" onClick={() => setActiveSection('home')} className="text-2xl font-bold text-primary-600 dark:text-primary-400 flex items-center">
                <Factory className="mr-2" />
                <span>EPCNXT</span>
              </a>
              <div className="hidden md:flex ml-10 space-x-8">
                <a href="#" onClick={() => setActiveSection('home')} className={`${activeSection === 'home' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'} hover:text-primary-500 transition-colors`}>Home</a>
                <a href="#" onClick={() => setActiveSection('services')} className={`${activeSection === 'services' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'} hover:text-primary-500 transition-colors`}>Services</a>
                <a href="#" onClick={() => setActiveSection('projects')} className={`${activeSection === 'projects' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'} hover:text-primary-500 transition-colors`}>Projects</a>
                <a href="#" onClick={() => setActiveSection('about')} className={`${activeSection === 'about' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'} hover:text-primary-500 transition-colors`}>About</a>
                <a href="#" onClick={() => setActiveSection('contact')} className={`${activeSection === 'contact' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'} hover:text-primary-500 transition-colors`}>Contact</a>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Dark mode toggle */}
              <button 
                onClick={toggleDarkMode} 
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 theme-transition"
                aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              
              {/* Mobile menu button */}
              <button 
                className="md:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 theme-transition"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle navigation menu"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
          
          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 py-4 border-t border-gray-200 dark:border-slate-700">
              <div className="flex flex-col space-y-4">
                <a href="#" onClick={() => { setActiveSection('home'); setIsMenuOpen(false); }} className={`${activeSection === 'home' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'} hover:text-primary-500 transition-colors`}>Home</a>
                <a href="#" onClick={() => { setActiveSection('services'); setIsMenuOpen(false); }} className={`${activeSection === 'services' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'} hover:text-primary-500 transition-colors`}>Services</a>
                <a href="#" onClick={() => { setActiveSection('projects'); setIsMenuOpen(false); }} className={`${activeSection === 'projects' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'} hover:text-primary-500 transition-colors`}>Projects</a>
                <a href="#" onClick={() => { setActiveSection('about'); setIsMenuOpen(false); }} className={`${activeSection === 'about' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'} hover:text-primary-500 transition-colors`}>About</a>
                <a href="#" onClick={() => { setActiveSection('contact'); setIsMenuOpen(false); }} className={`${activeSection === 'contact' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'} hover:text-primary-500 transition-colors`}>Contact</a>
              </div>
            </div>
          )}
        </nav>
      </header>

      <main className="flex-grow">
        {/* Home Section */}
        {activeSection === 'home' && (
          <section className="theme-transition">
            {/* Hero Banner */}
            <div className={`${styles.heroBanner} py-20 px-4 text-center text-white`}>
              <div className="container mx-auto max-w-4xl">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 fade-in">
                  Engineering the Future
                </h1>
                <p className="text-xl md:text-2xl mb-10 slide-in">
                  Innovative Engineering, Procurement, and Construction Solutions for Global Challenges
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <a 
                    href="#"
                    onClick={() => setActiveSection('services')}
                    className="btn btn-primary btn-lg flex items-center justify-center gap-2">
                    Our Services <ChevronRight size={20} />
                  </a>
                  <a 
                    href="#"
                    onClick={() => setActiveSection('contact')}
                    className="btn bg-white text-primary-600 hover:bg-gray-100 btn-lg flex items-center justify-center gap-2">
                    Contact Us <ArrowRight size={20} />
                  </a>
                </div>
              </div>
            </div>
            
            {/* Company stats */}
            <div className="py-12 bg-gray-50 dark:bg-slate-900">
              <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="stat-card">
                    <p className="stat-title">Projects Completed</p>
                    <p className="stat-value">{companyStats.projectsCompleted}+</p>
                    <p className="stat-desc">Successful project deliveries</p>
                  </div>
                  <div className="stat-card">
                    <p className="stat-title">Clients Served</p>
                    <p className="stat-value">{companyStats.clientsServed}+</p>
                    <p className="stat-desc">Satisfied organizations</p>
                  </div>
                  <div className="stat-card">
                    <p className="stat-title">Experience</p>
                    <p className="stat-value">{companyStats.yearsExperience}+</p>
                    <p className="stat-desc">Years of industry expertise</p>
                  </div>
                  <div className="stat-card">
                    <p className="stat-title">Global Reach</p>
                    <p className="stat-value">{companyStats.countriesActive}</p>
                    <p className="stat-desc">Countries with active projects</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Featured Services */}
            <div className="py-16 px-4 bg-white dark:bg-slate-800">
              <div className="container mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold mb-3">Our Core Services</h2>
                  <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                    Comprehensive solutions for your most challenging projects from concept to completion
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {services.slice(0, 3).map(service => (
                    <div key={service.id} className="card hover:shadow-lg transition-shadow">
                      <div className="text-primary-600 dark:text-primary-400 mb-4">
                        {service.icon}
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{service.name}</h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">{service.description}</p>
                      <a 
                        href="#"
                        onClick={() => setActiveSection('services')}
                        className="text-primary-600 dark:text-primary-400 font-medium flex items-center gap-1 hover:underline">
                        Learn more <ChevronRight size={16} />
                      </a>
                    </div>
                  ))}
                </div>
                
                <div className="text-center mt-12">
                  <a 
                    href="#"
                    onClick={() => setActiveSection('services')}
                    className="btn btn-primary">
                    View All Services
                  </a>
                </div>
              </div>
            </div>

            {/* Project showcase */}
            <div className="py-16 px-4 bg-gray-50 dark:bg-slate-900">
              <div className="container mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold mb-3">Featured Projects</h2>
                  <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                    Explore our recent successful project deliveries across various sectors
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {projects.slice(0, 3).map(project => (
                    <div key={project.id} className="card hover:shadow-lg transition-shadow overflow-hidden">
                      <div className={styles.projectImage}></div>
                      <div className="p-6">
                        <div className="flex-between mb-3">
                          <h3 className="text-xl font-semibold">{project.name}</h3>
                          {renderStatusBadge(project.status)}
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                          {project.description.length > 100 
                            ? `${project.description.substring(0, 100)}...` 
                            : project.description}
                        </p>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                          <MapPin size={16} className="mr-1" /> {project.location}
                        </div>
                        <a 
                          href="#"
                          onClick={() => setActiveSection('projects')}
                          className="text-primary-600 dark:text-primary-400 font-medium flex items-center gap-1 hover:underline">
                          View Details <ChevronRight size={16} />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="text-center mt-12">
                  <a 
                    href="#"
                    onClick={() => setActiveSection('projects')}
                    className="btn btn-primary">
                    View All Projects
                  </a>
                </div>
              </div>
            </div>

            {/* Testimonials */}
            <div className="py-16 px-4 bg-white dark:bg-slate-800">
              <div className="container mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold mb-3">What Our Clients Say</h2>
                  <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                    Hear from organizations we\'ve partnered with on successful projects
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {testimonials.map(testimonial => (
                    <div key={testimonial.id} className="card hover:shadow-lg transition-shadow">
                      <div className="flex-center mb-4">
                        <div className="relative">
                          <img 
                            src={testimonial.photoUrl} 
                            alt={testimonial.name}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                          <div className="absolute bottom-0 right-0 bg-primary-500 text-white rounded-full p-1">
                            <span className="sr-only">Rating: {testimonial.rating} out of 5</span>
                            {"★".repeat(testimonial.rating)}
                          </div>
                        </div>
                      </div>
                      <blockquote className="text-gray-600 dark:text-gray-300 mb-4 text-center italic">
                        "{testimonial.message}"
                      </blockquote>
                      <div className="text-center">
                        <p className="font-semibold">{testimonial.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.company}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div className={`${styles.ctaBanner} py-16 px-4 text-white text-center`}>
              <div className="container mx-auto max-w-3xl">
                <h2 className="text-3xl font-bold mb-4">Ready to Start Your Next Project?</h2>
                <p className="text-xl mb-8">
                  Our team of experts is ready to help you bring your vision to reality with our comprehensive EPC solutions.
                </p>
                <a 
                  href="#"
                  onClick={() => setActiveSection('contact')}
                  className="btn bg-white text-primary-600 hover:bg-gray-100 btn-lg inline-flex items-center gap-2">
                  Get in Touch <ArrowRight size={20} />
                </a>
              </div>
            </div>
          </section>
        )}

        {/* Services Section */}
        {activeSection === 'services' && (
          <section className="py-16 px-4 bg-white dark:bg-slate-800 theme-transition">
            <div className="container mx-auto">
              <div className="text-center mb-16">
                <h1 className="text-4xl font-bold mb-4">Our Services</h1>
                <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                  Comprehensive Engineering, Procurement, and Construction solutions customized to meet your project requirements
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {services.map(service => (
                  <div key={service.id} className="card hover:shadow-lg transition-shadow h-full flex flex-col">
                    <div className="text-primary-600 dark:text-primary-400 mb-4">
                      {service.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{service.name}</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4 flex-grow">{service.description}</p>
                    
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Key Benefits:</h4>
                      <ul className="space-y-1">
                        {service.benefits.map((benefit, index) => (
                          <li key={index} className="flex items-start">
                            <Check size={16} className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                            <span className="text-gray-600 dark:text-gray-300">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>

              {/* Service Process */}
              <div className="mt-24">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold mb-3">Our Process</h2>
                  <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                    A streamlined approach to deliver excellence at every stage of your project
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="card text-center hover:shadow-lg transition-shadow">
                    <div className="rounded-full bg-primary-100 dark:bg-primary-900/30 w-16 h-16 flex-center mx-auto mb-4">
                      <span className="text-primary-600 dark:text-primary-400 text-2xl font-bold">1</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Consultation</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Understanding your needs, objectives, and constraints to define project scope
                    </p>
                  </div>
                  
                  <div className="card text-center hover:shadow-lg transition-shadow">
                    <div className="rounded-full bg-primary-100 dark:bg-primary-900/30 w-16 h-16 flex-center mx-auto mb-4">
                      <span className="text-primary-600 dark:text-primary-400 text-2xl font-bold">2</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Design</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Developing comprehensive engineering designs and detailed project plans
                    </p>
                  </div>
                  
                  <div className="card text-center hover:shadow-lg transition-shadow">
                    <div className="rounded-full bg-primary-100 dark:bg-primary-900/30 w-16 h-16 flex-center mx-auto mb-4">
                      <span className="text-primary-600 dark:text-primary-400 text-2xl font-bold">3</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Execution</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Procuring materials and managing construction with strict quality control
                    </p>
                  </div>
                  
                  <div className="card text-center hover:shadow-lg transition-shadow">
                    <div className="rounded-full bg-primary-100 dark:bg-primary-900/30 w-16 h-16 flex-center mx-auto mb-4">
                      <span className="text-primary-600 dark:text-primary-400 text-2xl font-bold">4</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Delivery</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Commissioning, testing, and seamless handover with comprehensive documentation
                    </p>
                  </div>
                </div>
              </div>

              {/* Industries Served */}
              <div className="mt-24">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold mb-3">Industries We Serve</h2>
                  <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                    Our expertise spans across multiple industries with specialized solutions for each sector
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="flex items-start p-6 bg-gray-50 dark:bg-slate-700 rounded-lg">
                    <div className="text-primary-600 dark:text-primary-400 mr-4">
                      <Factory size={32} />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Oil & Gas</h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        From upstream exploration to downstream processing facilities and distribution networks
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start p-6 bg-gray-50 dark:bg-slate-700 rounded-lg">
                    <div className="text-primary-600 dark:text-primary-400 mr-4">
                      <Building size={32} />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Infrastructure</h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        Transportation networks, utilities, public facilities, and urban development projects
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start p-6 bg-gray-50 dark:bg-slate-700 rounded-lg">
                    <div className="text-primary-600 dark:text-primary-400 mr-4">
                      <Globe size={32} />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Renewable Energy</h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        Solar, wind, hydro, and other sustainable energy production facilities
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start p-6 bg-gray-50 dark:bg-slate-700 rounded-lg">
                    <div className="text-primary-600 dark:text-primary-400 mr-4">
                      <Construction size={32} />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Industrial</h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        Manufacturing plants, warehouses, and specialized industrial facilities
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start p-6 bg-gray-50 dark:bg-slate-700 rounded-lg">
                    <div className="text-primary-600 dark:text-primary-400 mr-4">
                      <Package size={32} />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Chemical & Pharmaceutical</h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        Specialized facilities with strict compliance and safety requirements
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start p-6 bg-gray-50 dark:bg-slate-700 rounded-lg">
                    <div className="text-primary-600 dark:text-primary-400 mr-4">
                      <Truck size={32} />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Logistics & Transportation</h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        Ports, terminals, distribution centers, and transportation hubs
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Section */}
              <div className="mt-20 py-12 px-6 bg-primary-50 dark:bg-primary-900/20 rounded-xl text-center">
                <h2 className="text-2xl font-bold mb-4">
                  Need a Customized Solution for Your Specific Industry?
                </h2>
                <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
                  Our team of industry specialists can develop tailored EPC solutions to address your unique challenges
                </p>
                <a 
                  href="#"
                  onClick={() => setActiveSection('contact')}
                  className="btn btn-primary btn-lg">
                  Contact Our Specialists
                </a>
              </div>
            </div>
          </section>
        )}

        {/* Projects Section */}
        {activeSection === 'projects' && (
          <section className="py-16 px-4 bg-white dark:bg-slate-800 theme-transition">
            <div className="container mx-auto">
              <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4">Our Projects</h1>
                <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                  Explore our portfolio of successful engineering, procurement, and construction projects
                </p>
              </div>
              
              {/* Filter and Search */}
              <div className="mb-8">
                <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex items-center">
                      <label htmlFor="statusFilter" className="mr-2 flex items-center">
                        <Filter size={16} className="mr-1" /> Status:
                      </label>
                      <select 
                        id="statusFilter"
                        className="input input-sm"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                      >
                        <option value="All">All</option>
                        <option value="Planning">Planning</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="On Hold">On Hold</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center">
                      <label htmlFor="sectorFilter" className="mr-2 flex items-center">
                        <Filter size={16} className="mr-1" /> Sector:
                      </label>
                      <select 
                        id="sectorFilter"
                        className="input input-sm"
                        value={selectedSector}
                        onChange={(e) => setSelectedSector(e.target.value)}
                      >
                        <option value="All">All Sectors</option>
                        {sectors.map(sector => (
                          <option key={sector} value={sector}>{sector}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search size={16} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className="input input-sm pl-10"
                      placeholder="Search projects..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Project Statistics */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-6">Project Overview</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Status Chart */}
                  <div className="card p-4">
                    <h3 className="text-lg font-semibold mb-4">Projects by Status</h3>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsChart>
                          <Pie
                            data={projectStatusData}
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {projectStatusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value, name) => [`${value} Projects`, name]} />
                          <Legend />
                        </RechartsChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  {/* Sector Chart */}
                  <div className="card p-4">
                    <h3 className="text-lg font-semibold mb-4">Projects by Sector</h3>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={sectorData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip formatter={(value) => [`${value}%`, 'Distribution']} />
                          <Bar dataKey="value" fill="#4F46E5" label={{ position: 'top' }} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>

              {/* Project List with Add Button */}
              <div className="mb-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold">Project Portfolio</h2>
                <button 
                  onClick={handleAddProject}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <Plus size={16} /> Add New Project
                </button>
              </div>

              {/* Project Cards */}
              {filteredProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredProjects.map(project => (
                    <div key={project.id} className="card hover:shadow-lg transition-shadow overflow-hidden">
                      <div className={styles.projectImage}></div>
                      <div className="p-6">
                        <div className="flex-between mb-3">
                          <h3 className="text-xl font-semibold">{project.name}</h3>
                          {renderStatusBadge(project.status)}
                        </div>
                        
                        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                          {project.description}
                        </p>
                        
                        <div className="space-y-2 mb-4 text-sm">
                          <div className="flex items-center text-gray-500 dark:text-gray-400">
                            <Building size={16} className="mr-1" /> {project.client}
                          </div>
                          <div className="flex items-center text-gray-500 dark:text-gray-400">
                            <MapPin size={16} className="mr-1" /> {project.location}
                          </div>
                          <div className="flex items-center text-gray-500 dark:text-gray-400">
                            <Clock size={16} className="mr-1" /> {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                          </div>
                          <div className="flex items-center text-gray-500 dark:text-gray-400">
                            <User size={16} className="mr-1" /> {project.projectManager}
                          </div>
                        </div>
                        
                        <div className="flex justify-end space-x-2 mt-4">
                          <button 
                            onClick={() => handleEditProject(project)}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                            aria-label="Edit project"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteProject(project.id)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                            aria-label="Delete project"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="alert alert-info">
                  <p>No projects found matching your filters. Try adjusting your search criteria.</p>
                </div>
              )}
            </div>

            {/* Project Modal Form */}
            {showProjectModal && (
              <div className="modal-backdrop" onClick={() => setShowProjectModal(false)}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}> 
                  <div className="modal-header">
                    <h3 className="text-lg font-medium" id="project-modal-title">
                      {currentProject?.id ? 'Edit Project' : 'Add New Project'}
                    </h3>
                    <button 
                      onClick={() => setShowProjectModal(false)}
                      className="text-gray-400 hover:text-gray-500"
                      aria-label="Close modal"
                    >
                      ×
                    </button>
                  </div>
                  
                  <form onSubmit={handleProjectSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="form-group">
                        <label className="form-label" htmlFor="name">Project Name</label>
                        <input 
                          id="name" 
                          name="name" 
                          type="text" 
                          className="input" 
                          defaultValue={currentProject?.name || ''}
                          required 
                        />
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label" htmlFor="client">Client</label>
                        <input 
                          id="client" 
                          name="client" 
                          type="text" 
                          className="input" 
                          defaultValue={currentProject?.client || ''}
                          required 
                        />
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label" htmlFor="location">Location</label>
                        <input 
                          id="location" 
                          name="location" 
                          type="text" 
                          className="input" 
                          defaultValue={currentProject?.location || ''}
                          required 
                        />
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label" htmlFor="sector">Sector</label>
                        <input 
                          id="sector" 
                          name="sector" 
                          type="text" 
                          className="input" 
                          defaultValue={currentProject?.sector || ''}
                          required 
                        />
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label" htmlFor="startDate">Start Date</label>
                        <input 
                          id="startDate" 
                          name="startDate" 
                          type="date" 
                          className="input" 
                          defaultValue={currentProject?.startDate || ''}
                          required 
                        />
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label" htmlFor="endDate">End Date</label>
                        <input 
                          id="endDate" 
                          name="endDate" 
                          type="date" 
                          className="input" 
                          defaultValue={currentProject?.endDate || ''}
                          required 
                        />
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label" htmlFor="status">Status</label>
                        <select 
                          id="status" 
                          name="status" 
                          className="input" 
                          defaultValue={currentProject?.status || 'Planning'}
                          required
                        >
                          <option value="Planning">Planning</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                          <option value="On Hold">On Hold</option>
                        </select>
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label" htmlFor="budget">Budget ($)</label>
                        <input 
                          id="budget" 
                          name="budget" 
                          type="number" 
                          className="input" 
                          defaultValue={currentProject?.budget || ''}
                          min="0"
                          step="1000"
                          required 
                        />
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label" htmlFor="projectManager">Project Manager</label>
                        <input 
                          id="projectManager" 
                          name="projectManager" 
                          type="text" 
                          className="input" 
                          defaultValue={currentProject?.projectManager || ''}
                          required 
                        />
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label" htmlFor="team">Team (comma separated)</label>
                        <input 
                          id="team" 
                          name="team" 
                          type="text" 
                          className="input" 
                          defaultValue={currentProject?.team?.join(', ') || ''}
                          required 
                        />
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label" htmlFor="description">Description</label>
                      <textarea 
                        id="description" 
                        name="description" 
                        className="input" 
                        rows={4}
                        defaultValue={currentProject?.description || ''}
                        required 
                      ></textarea>
                    </div>
                    
                    <div className="modal-footer">
                      <button 
                        type="button" 
                        className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                        onClick={() => setShowProjectModal(false)}
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary">
                        {currentProject?.id ? 'Update Project' : 'Add Project'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </section>
        )}

        {/* About Section */}
        {activeSection === 'about' && (
          <section className="py-16 px-4 bg-white dark:bg-slate-800 theme-transition">
            <div className="container mx-auto">
              <div className="text-center mb-16">
                <h1 className="text-4xl font-bold mb-4">About EPCNXT</h1>
                <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                  A leading provider of innovative Engineering, Procurement, and Construction solutions for global challenges
                </p>
              </div>

              {/* Company Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16 items-center">
                <div>
                  <h2 className="text-2xl font-bold mb-4">Our Story</h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Founded in 2010, EPCNXT was established with a vision to provide integrated EPC solutions that combine technical expertise with innovative approaches to address the complex challenges of modern infrastructure and industrial projects.
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Over the years, we have grown from a small team of engineers to a global company with operations across 12 countries, serving clients in diverse sectors including oil & gas, renewable energy, infrastructure, and industrial manufacturing.
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    Our commitment to excellence, sustainability, and client satisfaction has positioned us as a trusted partner for organizations seeking reliable EPC solutions for their most challenging projects.
                  </p>
                </div>
                <div className={`${styles.aboutImage} rounded-lg shadow-lg h-80`}></div>
              </div>

              {/* Mission & Values */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                <div className="card">
                  <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    To deliver exceptional engineering, procurement, and construction solutions that transform visions into reality, drive sustainable development, and create lasting value for our clients and communities.
                  </p>
                </div>
                <div className="card">
                  <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    To be the global leader in innovative EPC solutions, recognized for excellence, integrity, and transformative impact across industries and communities worldwide.
                  </p>
                </div>
              </div>

              {/* Core Values */}
              <div className="mb-16">
                <h2 className="text-2xl font-bold mb-8 text-center">Our Core Values</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="card text-center hover:shadow-lg transition-shadow">
                    <div className="text-primary-600 dark:text-primary-400 mb-4 flex-center">
                      <Check size={32} />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Excellence</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      We strive for exceptional quality in every aspect of our work
                    </p>
                  </div>
                  
                  <div className="card text-center hover:shadow-lg transition-shadow">
                    <div className="text-primary-600 dark:text-primary-400 mb-4 flex-center">
                      <Globe size={32} />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Sustainability</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      We prioritize environmentally responsible practices in all projects
                    </p>
                  </div>
                  
                  <div className="card text-center hover:shadow-lg transition-shadow">
                    <div className="text-primary-600 dark:text-primary-400 mb-4 flex-center">
                      <User size={32} />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Integrity</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      We uphold the highest ethical standards in all our relationships
                    </p>
                  </div>
                  
                  <div className="card text-center hover:shadow-lg transition-shadow">
                    <div className="text-primary-600 dark:text-primary-400 mb-4 flex-center">
                      <Construction size={32} />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Innovation</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      We continuously seek new approaches to solve complex challenges
                    </p>
                  </div>
                </div>
              </div>

              {/* Leadership Team */}
              <div className="mb-16">
                <h2 className="text-2xl font-bold mb-8 text-center">Our Leadership Team</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {teamMembers.map(member => (
                    <div key={member.id} className="card hover:shadow-lg transition-shadow text-center">
                      <img 
                        src={member.photoUrl} 
                        alt={member.name}
                        className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                      />
                      <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                      <p className="text-primary-600 dark:text-primary-400 mb-3">{member.position}</p>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">{member.bio}</p>
                      <div className="flex justify-center space-x-4">
                        <a href={`mailto:${member.email}`} className="text-gray-500 hover:text-primary-600 dark:hover:text-primary-400" aria-label={`Email ${member.name}`}>
                          <Mail size={18} />
                        </a>
                        <a href={`tel:${member.phone}`} className="text-gray-500 hover:text-primary-600 dark:hover:text-primary-400" aria-label={`Call ${member.name}`}>
                          <Phone size={18} />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Global Presence */}
              <div className="mb-16">
                <h2 className="text-2xl font-bold mb-8 text-center">Our Global Presence</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="card">
                    <h3 className="text-xl font-semibold mb-4">Americas</h3>
                    <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                      <li className="flex items-center">
                        <MapPin size={16} className="mr-2 text-primary-600 dark:text-primary-400" />
                        Houston, USA (Headquarters)
                      </li>
                      <li className="flex items-center">
                        <MapPin size={16} className="mr-2 text-primary-600 dark:text-primary-400" />
                        Calgary, Canada
                      </li>
                      <li className="flex items-center">
                        <MapPin size={16} className="mr-2 text-primary-600 dark:text-primary-400" />
                        Rio de Janeiro, Brazil
                      </li>
                    </ul>
                  </div>
                  
                  <div className="card">
                    <h3 className="text-xl font-semibold mb-4">Europe & Middle East</h3>
                    <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                      <li className="flex items-center">
                        <MapPin size={16} className="mr-2 text-primary-600 dark:text-primary-400" />
                        London, UK
                      </li>
                      <li className="flex items-center">
                        <MapPin size={16} className="mr-2 text-primary-600 dark:text-primary-400" />
                        Dubai, UAE
                      </li>
                      <li className="flex items-center">
                        <MapPin size={16} className="mr-2 text-primary-600 dark:text-primary-400" />
                        Amsterdam, Netherlands
                      </li>
                    </ul>
                  </div>
                  
                  <div className="card">
                    <h3 className="text-xl font-semibold mb-4">Asia Pacific</h3>
                    <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                      <li className="flex items-center">
                        <MapPin size={16} className="mr-2 text-primary-600 dark:text-primary-400" />
                        Singapore
                      </li>
                      <li className="flex items-center">
                        <MapPin size={16} className="mr-2 text-primary-600 dark:text-primary-400" />
                        Perth, Australia
                      </li>
                      <li className="flex items-center">
                        <MapPin size={16} className="mr-2 text-primary-600 dark:text-primary-400" />
                        Mumbai, India
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* CTA Section */}
              <div className="py-12 px-6 bg-primary-50 dark:bg-primary-900/20 rounded-xl text-center">
                <h2 className="text-2xl font-bold mb-4">
                  Interested in Joining Our Team?
                </h2>
                <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
                  We\'re always looking for talented individuals to join our global team of engineers, project managers, and construction professionals
                </p>
                <a 
                  href="#"
                  onClick={() => setActiveSection('contact')}
                  className="btn btn-primary btn-lg">
                  Contact Our HR Team
                </a>
              </div>
            </div>
          </section>
        )}

        {/* Contact Section */}
        {activeSection === 'contact' && (
          <section className="py-16 px-4 bg-white dark:bg-slate-800 theme-transition">
            <div className="container mx-auto">
              <div className="text-center mb-16">
                <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
                <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                  Reach out to discuss your project requirements or learn more about our services
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Contact Form */}
                <div className="card">
                  <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>
                  <form onSubmit={handleContactSubmit}>
                    <div className="form-group">
                      <label className="form-label" htmlFor="name">Full Name</label>
                      <input 
                        id="name" 
                        name="name" 
                        type="text" 
                        className="input" 
                        required 
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label" htmlFor="email">Email Address</label>
                      <input 
                        id="email" 
                        name="email" 
                        type="email" 
                        className="input" 
                        required 
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label" htmlFor="phone">Phone Number</label>
                      <input 
                        id="phone" 
                        name="phone" 
                        type="tel" 
                        className="input" 
                        required 
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label" htmlFor="message">Message</label>
                      <textarea 
                        id="message" 
                        name="message" 
                        className="input" 
                        rows={5}
                        required 
                      ></textarea>
                    </div>
                    
                    <button type="submit" className="btn btn-primary w-full mt-6">
                      Submit Message
                    </button>
                  </form>
                </div>

                {/* Contact Information */}
                <div>
                  <div className="card mb-8">
                    <h2 className="text-2xl font-bold mb-6">Our Offices</h2>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-semibold mb-2">Headquarters</h3>
                        <div className="flex items-start">
                          <MapPin size={18} className="mr-2 mt-1 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                          <p className="text-gray-600 dark:text-gray-300">
                            1234 Innovation Drive, Suite 500<br />
                            Houston, TX 77002<br />
                            United States
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-xl font-semibold mb-2">London Office</h3>
                        <div className="flex items-start">
                          <MapPin size={18} className="mr-2 mt-1 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                          <p className="text-gray-600 dark:text-gray-300">
                            45 Engineering Lane<br />
                            London, EC2A 4BQ<br />
                            United Kingdom
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-xl font-semibold mb-2">Singapore Office</h3>
                        <div className="flex items-start">
                          <MapPin size={18} className="mr-2 mt-1 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                          <p className="text-gray-600 dark:text-gray-300">
                            78 Marina Bay Drive<br />
                            Singapore, 018956<br />
                            Singapore
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="card">
                    <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <Mail size={18} className="mr-3 text-primary-600 dark:text-primary-400" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                          <a href="mailto:info@epcnxt.com" className="text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400">
                            info@epcnxt.com
                          </a>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <Phone size={18} className="mr-3 text-primary-600 dark:text-primary-400" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">General Inquiries</p>
                          <a href="tel:+1-800-123-4567" className="text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400">
                            +1 (800) 123-4567
                          </a>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <Phone size={18} className="mr-3 text-primary-600 dark:text-primary-400" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Support</p>
                          <a href="tel:+1-800-765-4321" className="text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400">
                            +1 (800) 765-4321
                          </a>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-8">
                      <h3 className="text-lg font-semibold mb-3">Business Hours</h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-1">Monday - Friday: 8:00 AM - 6:00 PM</p>
                      <p className="text-gray-600 dark:text-gray-300">Saturday - Sunday: Closed</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 dark:bg-slate-900 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <Factory className="mr-2" />
                <span>EPCNXT</span>
              </h3>
              <p className="text-gray-400 mb-4">
                Innovative Engineering, Procurement, and Construction Solutions for Global Challenges
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="LinkedIn">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Twitter">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Facebook">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" onClick={() => setActiveSection('home')} className="text-gray-400 hover:text-white transition-colors">Home</a>
                </li>
                <li>
                  <a href="#" onClick={() => setActiveSection('services')} className="text-gray-400 hover:text-white transition-colors">Services</a>
                </li>
                <li>
                  <a href="#" onClick={() => setActiveSection('projects')} className="text-gray-400 hover:text-white transition-colors">Projects</a>
                </li>
                <li>
                  <a href="#" onClick={() => setActiveSection('about')} className="text-gray-400 hover:text-white transition-colors">About Us</a>
                </li>
                <li>
                  <a href="#" onClick={() => setActiveSection('contact')} className="text-gray-400 hover:text-white transition-colors">Contact</a>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Services</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" onClick={() => setActiveSection('services')} className="text-gray-400 hover:text-white transition-colors">Engineering Design</a>
                </li>
                <li>
                  <a href="#" onClick={() => setActiveSection('services')} className="text-gray-400 hover:text-white transition-colors">Procurement</a>
                </li>
                <li>
                  <a href="#" onClick={() => setActiveSection('services')} className="text-gray-400 hover:text-white transition-colors">Construction Management</a>
                </li>
                <li>
                  <a href="#" onClick={() => setActiveSection('services')} className="text-gray-400 hover:text-white transition-colors">Project Management</a>
                </li>
                <li>
                  <a href="#" onClick={() => setActiveSection('services')} className="text-gray-400 hover:text-white transition-colors">Maintenance</a>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <MapPin size={18} className="mr-2 mt-1 text-gray-400" />
                  <span className="text-gray-400">
                    1234 Innovation Drive, Suite 500<br />Houston, TX 77002, USA
                  </span>
                </li>
                <li className="flex items-center">
                  <Mail size={18} className="mr-2 text-gray-400" />
                  <a href="mailto:info@epcnxt.com" className="text-gray-400 hover:text-white transition-colors">
                    info@epcnxt.com
                  </a>
                </li>
                <li className="flex items-center">
                  <Phone size={18} className="mr-2 text-gray-400" />
                  <a href="tel:+1-800-123-4567" className="text-gray-400 hover:text-white transition-colors">
                    +1 (800) 123-4567
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400">
            <p>Copyright © 2025 of Datavtar Private Limited. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;