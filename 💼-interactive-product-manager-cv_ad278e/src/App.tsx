import React, { useState, useEffect, useRef } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Area, AreaChart
} from 'recharts';
import {
  User, Briefcase, Award, BookOpen, Code, ChartBar, Globe,
  Mail, Phone, Linkedin, Github, Download, ExternalLink,
  Calendar, Filter, ArrowLeftRight, Search, Menu, X, ChevronRight,
  ChevronLeft, ArrowRight, Tag, ArrowUp, ArrowDown // Added ArrowUp, ArrowDown
} from 'lucide-react';
import styles from './styles/styles.module.css';

// Define types for our application
type Role = {
  id: string;
  title: string;
  company: string;
  period: string;
  description: string;
  responsibilities: string[];
  achievements: string[];
  skills: string[];
  icon: React.ReactNode;
};

type Project = {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  link?: string;
  image?: string;
  roleId: string;
};

type Education = {
  degree: string;
  institution: string;
  year: string;
  description: string;
};

type Certification = {
  name: string;
  issuer: string;
  year: string;
  link?: string;
};

type PersonalInfo = {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  summary: string;
  photo?: string;
};

type ExperienceData = {
  roles: Role[];
  projects: Project[];
  education: Education[];
  certifications: Certification[];
  personalInfo: PersonalInfo;
};

type FinancialMetric = {
  name: string;
  value: number;
  trend: number;
  color: string;
};

type ChartData = {
  name: string;
  value: number;
  previous?: number;
}[];

type ChartTimeframe = 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Yearly';

const App: React.FC = () => {
  // State management
  const [experienceData, setExperienceData] = useState<ExperienceData | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      return savedMode === 'true' || 
        (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  
  // Chart state for dashboard
  const [customerTimeframe, setCustomerTimeframe] = useState<ChartTimeframe>('Monthly');
  const [paymentTimeframe, setPaymentTimeframe] = useState<ChartTimeframe>('Monthly');
  
  // Refs
  const modalRef = useRef<HTMLDivElement>(null);

  // Sample data for the dashboard
  const dashboardMetrics: FinancialMetric[] = [
    { name: 'Net Income', value: 1254350, trend: 12.5, color: 'bg-emerald-500' },
    { name: 'Payouts', value: 854210, trend: 8.2, color: 'bg-blue-500' },
    { name: 'Customers', value: 3245, trend: 24.3, color: 'bg-purple-500' },
    { name: 'Net Volume', value: 2450670, trend: 15.8, color: 'bg-amber-500' }
  ];

  const monthlySalesData: ChartData = [
    { name: 'Jan', value: 65000, previous: 45000 },
    { name: 'Feb', value: 72000, previous: 50000 },
    { name: 'Mar', value: 90000, previous: 60000 },
    { name: 'Apr', value: 95000, previous: 70000 },
    { name: 'May', value: 110000, previous: 80000 },
    { name: 'Jun', value: 130000, previous: 85000 },
    { name: 'Jul', value: 150000, previous: 90000 },
    { name: 'Aug', value: 160000, previous: 95000 },
    { name: 'Sep', value: 175000, previous: 100000 },
    { name: 'Oct', value: 185000, previous: 110000 },
    { name: 'Nov', value: 195000, previous: 120000 },
    { name: 'Dec', value: 210000, previous: 130000 }
  ];

  const customersData: { [key in ChartTimeframe]: ChartData } = {
    Daily: Array.from({ length: 30 }, (_, i) => ({
      name: `Day ${i + 1}`,
      value: Math.floor(Math.random() * 200) + 100
    })),
    Weekly: Array.from({ length: 12 }, (_, i) => ({
      name: `Week ${i + 1}`,
      value: Math.floor(Math.random() * 1000) + 500
    })),
    Monthly: [
      { name: 'Jan', value: 1250 },
      { name: 'Feb', value: 1380 },
      { name: 'Mar', value: 1520 },
      { name: 'Apr', value: 1650 },
      { name: 'May', value: 1820 },
      { name: 'Jun', value: 2100 },
      { name: 'Jul', value: 2350 },
      { name: 'Aug', value: 2600 },
      { name: 'Sep', value: 2800 },
      { name: 'Oct', value: 3000 },
      { name: 'Nov', value: 3120 },
      { name: 'Dec', value: 3245 }
    ],
    Quarterly: [
      { name: 'Q1', value: 1520 },
      { name: 'Q2', value: 2100 },
      { name: 'Q3', value: 2800 },
      { name: 'Q4', value: 3245 }
    ],
    Yearly: [
      { name: '2020', value: 1200 },
      { name: '2021', value: 1800 },
      { name: '2022', value: 2400 },
      { name: '2023', value: 3245 }
    ]
  };

  const netVolumeData: ChartData = [
    { name: 'Q1', value: 450000 },
    { name: 'Q2', value: 650000 },
    { name: 'Q3', value: 850000 },
    { name: 'Q4', value: 950000 }
  ];

  const paymentsData: { [key in ChartTimeframe]: ChartData } = {
    Daily: Array.from({ length: 30 }, (_, i) => ({
      name: `Day ${i + 1}`,
      value: Math.floor(Math.random() * 10000) + 5000
    })),
    Weekly: Array.from({ length: 12 }, (_, i) => ({
      name: `Week ${i + 1}`,
      value: Math.floor(Math.random() * 50000) + 25000
    })),
    Monthly: [
      { name: 'Jan', value: 45000 },
      { name: 'Feb', value: 52000 },
      { name: 'Mar', value: 58000 },
      { name: 'Apr', value: 64000 },
      { name: 'May', value: 72000 },
      { name: 'Jun', value: 78000 },
      { name: 'Jul', value: 85000 },
      { name: 'Aug', value: 92000 },
      { name: 'Sep', value: 96000 },
      { name: 'Oct', value: 102000 },
      { name: 'Nov', value: 112000 },
      { name: 'Dec', value: 120000 }
    ],
    Quarterly: [
      { name: 'Q1', value: 155000 },
      { name: 'Q2', value: 214000 },
      { name: 'Q3', value: 273000 },
      { name: 'Q4', value: 334000 }
    ],
    Yearly: [
      { name: '2020', value: 300000 },
      { name: '2021', value: 450000 },
      { name: '2022', value: 600000 },
      { name: '2023', value: 854210 }
    ]
  };

  // Generate sample data for the CV application
  useEffect(() => {
    // Mock data loading
    const loadData = () => {
      try {
        const savedData = localStorage.getItem('cvExperienceData');
        
        if (savedData) {
          const parsedData = JSON.parse(savedData) as ExperienceData;
          setExperienceData(parsedData);
          setSelectedRoleId(parsedData.roles[0].id);
        } else {
          // Sample data if nothing in localStorage
          const sampleData: ExperienceData = {
            personalInfo: {
              name: 'Alex Johnson',
              title: 'Senior Product Manager',
              email: 'alex.johnson@example.com',
              phone: '+1 (555) 123-4567',
              location: 'San Francisco, CA',
              linkedin: 'linkedin.com/in/alexjohnson',
              github: 'github.com/alexjohnson',
              summary: 'Experienced Product Manager with 8+ years of experience in tech. Specialized in building data-driven products that solve real user problems. Strong background in market research, user experience, and product strategy.',
              photo: 'https://randomuser.me/api/portraits/men/32.jpg'
            },
            roles: [
              {
                id: 'role1',
                title: 'Senior Product Manager',
                company: 'TechCorp Inc.',
                period: 'Jan 2021 - Present',
                description: 'Leading the development of financial analytics dashboard products with direct revenue impact of $15M annually.',
                responsibilities: [
                  'Developed product strategy and roadmap for financial analytics platform',
                  'Led cross-functional teams across engineering, design, and marketing',
                  'Conducted market research and competitive analysis',
                  'Implemented data-driven product development methodologies'
                ],
                achievements: [
                  'Increased user engagement by 35% through UX improvements',
                  'Launched 4 major features that contributed to 28% revenue growth',
                  'Reduced churn rate by 40% through targeted product improvements',
                  'Expanded product offering to enterprise segment, resulting in 5 new key accounts'
                ],
                skills: ['Product Strategy', 'User Research', 'Analytics', 'Agile Methodologies', 'Financial Products'],
                icon: <ChartBar size={24} />
              },
              {
                id: 'role2',
                title: 'Product Manager',
                company: 'Innovate Solutions',
                period: 'Mar 2018 - Dec 2020',
                description: 'Managed the development and launch of a customer relationship management (CRM) platform for small businesses.',
                responsibilities: [
                  'Defined product requirements and created detailed specifications',
                  'Collaborated with UX/UI teams on interface design',
                  'Prioritized features based on customer feedback and business value',
                  'Managed product release cycles and go-to-market strategies'
                ],
                achievements: [
                  'Successfully launched CRM platform with 10,000+ users in first quarter',
                  'Achieved 92% customer satisfaction rating',
                  'Implemented automated onboarding that increased conversion by 45%',
                  'Secured key partnerships that expanded market reach by 30%'
                ],
                skills: ['Product Management', 'CRM Systems', 'User Testing', 'B2B Solutions', 'Go-to-Market Strategy'],
                icon: <Briefcase size={24} />
              },
              {
                id: 'role3',
                title: 'Associate Product Manager',
                company: 'Global Tech Solutions',
                period: 'Jun 2016 - Feb 2018',
                description: 'Supported the development of e-commerce solutions for retail clients.',
                responsibilities: [
                  'Assisted senior product managers in feature planning and execution',
                  'Conducted user interviews and usability testing',
                  'Analyzed product metrics and created performance reports',
                  'Managed backlog and collaborated with engineering teams'
                ],
                achievements: [
                  'Contributed to platform redesign that improved conversion rates by 25%',
                  'Implemented A/B testing framework that optimized user flows',
                  'Developed product documentation that reduced support tickets by 30%',
                  'Led integration with payment processors that expanded market reach'
                ],
                skills: ['E-commerce', 'User Testing', 'A/B Testing', 'Product Analytics', 'Technical Documentation'],
                icon: <Code size={24} />
              },
              {
                id: 'role4',
                title: 'Business Analyst',
                company: 'ConsultTech',
                period: 'Aug 2014 - May 2016',
                description: 'Analyzed business processes and requirements for enterprise clients in finance and healthcare industries.',
                responsibilities: [
                  'Gathered and documented business requirements',
                  'Created process flow diagrams and specifications',
                  'Performed gap analysis between current and desired states',
                  'Presented recommendations to stakeholders'
                ],
                achievements: [
                  'Identified process inefficiencies that saved $2M annually for a banking client',
                  'Streamlined reporting workflow that reduced manual effort by 65%',
                  'Developed data migration strategy for healthcare client\'s system upgrade',
                  'Created dashboard solution that increased data visibility across departments'
                ],
                skills: ['Business Analysis', 'Process Optimization', 'Requirements Gathering', 'Stakeholder Management', 'Technical Documentation'],
                icon: <Globe size={24} />
              }
            ],
            projects: [
              {
                id: 'proj1',
                title: 'Financial Analytics Dashboard',
                description: 'Comprehensive dashboard providing insights into financial metrics, customer trends, and payment analytics.',
                technologies: ['React', 'Node.js', 'Recharts', 'PostgreSQL'],
                link: 'https://example.com/projects/financial-dashboard',
                roleId: 'role1'
              },
              {
                id: 'proj2',
                title: 'Mobile Payment Platform',
                description: 'Secure and user-friendly mobile payment solution for small businesses with real-time analytics.',
                technologies: ['React Native', 'Express', 'MongoDB', 'Stripe API'],
                link: 'https://example.com/projects/mobile-payments',
                roleId: 'role1'
              },
              {
                id: 'proj3',
                title: 'Customer Relationship Management System',
                description: 'Intuitive CRM platform designed for small businesses with automation and analytics capabilities.',
                technologies: ['Vue.js', 'Python', 'Django', 'MySQL'],
                link: 'https://example.com/projects/crm-platform',
                roleId: 'role2'
              },
              {
                id: 'proj4',
                title: 'E-commerce Platform Redesign',
                description: 'Complete overhaul of retail client\'s e-commerce platform focusing on mobile optimization and conversion.',
                technologies: ['React', 'Redux', 'Node.js', 'MongoDB'],
                link: 'https://example.com/projects/ecommerce-redesign',
                roleId: 'role3'
              },
              {
                id: 'proj5',
                title: 'Healthcare Analytics Platform',
                description: 'Data visualization and reporting tool for healthcare providers to track patient outcomes and operational metrics.',
                technologies: ['Angular', 'Express', 'D3.js', 'SQL Server'],
                link: 'https://example.com/projects/healthcare-analytics',
                roleId: 'role4'
              }
            ],
            education: [
              {
                degree: 'Master of Business Administration (MBA)',
                institution: 'Stanford University',
                year: '2014',
                description: 'Specialized in Technology Management with focus on Product Development and Innovation.'
              },
              {
                degree: 'Bachelor of Science in Computer Science',
                institution: 'University of California, Berkeley',
                year: '2012',
                description: 'Minor in Business Administration. Senior project on predictive analytics applications.'
              }
            ],
            certifications: [
              {
                name: 'Certified Scrum Product Owner (CSPO)',
                issuer: 'Scrum Alliance',
                year: '2020',
                link: 'https://www.scrumalliance.org/certifications/practitioners/cspo-certification'
              },
              {
                name: 'Professional Product Manager (PPM)',
                issuer: 'Product School',
                year: '2019',
                link: 'https://productschool.com/product-management-certification/'
              },
              {
                name: 'Google Analytics Certification',
                issuer: 'Google',
                year: '2018',
                link: 'https://analytics.google.com/analytics/academy/'
              }
            ]
          };
          
          setExperienceData(sampleData);
          setSelectedRoleId(sampleData.roles[0].id);
          localStorage.setItem('cvExperienceData', JSON.stringify(sampleData));
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Handle dark mode toggle
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  // Handle escape key for modal closing
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [mobileMenuOpen]);

  // Handle outside click for modal closing
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node) && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [mobileMenuOpen]);

  // Format numbers with commas
  const formatNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Download CV as PDF
  const downloadCV = () => {
    alert('CV Download functionality would be implemented here');
    // In a real implementation, this would generate and download a PDF version of the CV
  };

  // Navigate to previous role
  const goToPreviousRole = () => {
    if (!experienceData) return;
    
    const currentIndex = experienceData.roles.findIndex(role => role.id === selectedRoleId);
    if (currentIndex > 0) {
      setSelectedRoleId(experienceData.roles[currentIndex - 1].id);
    }
  };

  // Navigate to next role
  const goToNextRole = () => {
    if (!experienceData) return;
    
    const currentIndex = experienceData.roles.findIndex(role => role.id === selectedRoleId);
    if (currentIndex < experienceData.roles.length - 1) {
      setSelectedRoleId(experienceData.roles[currentIndex + 1].id);
    }
  };

  if (loading) {
    return (
      <div className="flex-center h-screen w-full">
        <div className="space-y-4 text-center">
          <div className="skeleton-circle w-16 h-16 mx-auto"></div>
          <div className="skeleton-text w-48 h-6 mx-auto"></div>
          <div className="skeleton-text w-64 h-4 mx-auto"></div>
          <div className="skeleton-text w-56 h-4 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!experienceData) {
    return (
      <div className="flex-center h-screen w-full">
        <div className="alert alert-error">
          <p>Failed to load CV data. Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  const selectedRole = experienceData.roles.find(role => role.id === selectedRoleId);
  const relatedProjects = experienceData.projects.filter(project => project.roleId === selectedRoleId);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 theme-transition">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white dark:bg-slate-800 shadow-sm theme-transition">
        <div className="container-fluid">
          <div className="flex-between py-4">
            <div className="flex items-center gap-2">
              <User size={24} className="text-primary-600 dark:text-primary-400" />
              <h1 className="text-xl font-bold">{experienceData.personalInfo.name}</h1>
            </div>
            
            <div className="hidden md:flex items-center space-x-6">
              {experienceData.roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRoleId(role.id)}
                  className={`text-sm font-medium py-2 border-b-2 transition-colors ${selectedRoleId === role.id
                    ? 'border-primary-600 text-primary-700 dark:border-primary-400 dark:text-primary-300'
                    : 'border-transparent hover:text-primary-600 dark:hover:text-primary-400 text-gray-600 dark:text-slate-300'
                  }`}
                  aria-label={`View ${role.title} experience`}
                >
                  {role.title}
                </button>
              ))}
            </div>
            
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="theme-toggle"
                aria-label="Toggle dark mode"
              >
                <span className="theme-toggle-thumb"></span>
              </button>
              
              <button 
                onClick={downloadCV}
                className="hidden sm:flex btn btn-sm md:btn-md btn-primary items-center gap-1"
                aria-label="Download CV"
              >
                <Download size={16} />
                <span>Download CV</span>
              </button>
              
              <button 
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden btn btn-icon p-2 text-gray-600 dark:text-slate-300"
                aria-label="Open menu"
              >
                <Menu size={24} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Modal */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-end">
          <div 
            ref={modalRef}
            className="bg-white dark:bg-slate-800 w-64 h-full overflow-y-auto shadow-xl transform transition-transform theme-transition"
          >
            <div className="p-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">Menu</h2>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700"
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-slate-400">Experience</h3>
                  {experienceData.roles.map((role) => (
                    <button
                      key={role.id}
                      onClick={() => {
                        setSelectedRoleId(role.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`block w-full text-left px-3 py-2 text-sm rounded-md ${selectedRoleId === role.id
                        ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                        : 'text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      {role.title} - {role.company}
                    </button>
                  ))}
                </div>
                
                <div className="pt-2 border-t border-gray-200 dark:border-slate-700">
                  <button 
                    onClick={downloadCV}
                    className="btn btn-primary w-full items-center justify-center mt-2 gap-2"
                  >
                    <Download size={16} />
                    <span>Download CV</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container-fluid py-6 md:py-8">
        {/* Profile Section - Only on First Role */}
        {selectedRoleId === experienceData.roles[0].id && (
          <section className="card mb-8">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-shrink-0">
                {experienceData.personalInfo.photo && (
                  <img
                    src={experienceData.personalInfo.photo}
                    alt={experienceData.personalInfo.name}
                    className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-white shadow-md"
                  />
                )}
              </div>
              
              <div className="flex-grow">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  {experienceData.personalInfo.name}
                </h2>
                <p className="text-lg text-primary-600 dark:text-primary-400 font-medium mt-1">
                  {experienceData.personalInfo.title}
                </p>
                
                <p className="mt-3 text-gray-600 dark:text-slate-300">
                  {experienceData.personalInfo.summary}
                </p>
                
                <div className="mt-4 flex flex-wrap gap-3 md:gap-6">
                  <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-slate-300">
                    <Mail size={16} />
                    <a href={`mailto:${experienceData.personalInfo.email}`} className="hover:text-primary-600 dark:hover:text-primary-400">
                      {experienceData.personalInfo.email}
                    </a>
                  </div>
                  
                  <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-slate-300">
                    <Phone size={16} />
                    <a href={`tel:${experienceData.personalInfo.phone}`} className="hover:text-primary-600 dark:hover:text-primary-400">
                      {experienceData.personalInfo.phone}
                    </a>
                  </div>
                  
                  <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-slate-300">
                    <Linkedin size={16} />
                    <a href={`https://${experienceData.personalInfo.linkedin}`} target="_blank" rel="noopener noreferrer" className="hover:text-primary-600 dark:hover:text-primary-400">
                      {experienceData.personalInfo.linkedin}
                    </a>
                  </div>
                  
                  <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-slate-300">
                    <Github size={16} />
                    <a href={`https://${experienceData.personalInfo.github}`} target="_blank" rel="noopener noreferrer" className="hover:text-primary-600 dark:hover:text-primary-400">
                      {experienceData.personalInfo.github}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
        
        {/* Role Navigation */}
        <div className="flex-between mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
            {selectedRole?.title} at {selectedRole?.company}
          </h2>
          
          <div className="flex gap-2">
            <button
              onClick={goToPreviousRole}
              disabled={selectedRoleId === experienceData.roles[0].id}
              className={`btn btn-sm md:btn-md items-center gap-1 ${selectedRoleId === experienceData.roles[0].id
                ? 'bg-gray-100 text-gray-400 dark:bg-slate-700 dark:text-slate-500 cursor-not-allowed'
                : 'bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-600 border border-gray-300 dark:border-slate-600'
              }`}
              aria-label="Previous role"
            >
              <ChevronLeft size={16} />
              <span className="hidden sm:inline">Previous</span>
            </button>
            
            <button
              onClick={goToNextRole}
              disabled={selectedRoleId === experienceData.roles[experienceData.roles.length - 1].id}
              className={`btn btn-sm md:btn-md items-center gap-1 ${selectedRoleId === experienceData.roles[experienceData.roles.length - 1].id
                ? 'bg-gray-100 text-gray-400 dark:bg-slate-700 dark:text-slate-500 cursor-not-allowed'
                : 'bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-600 border border-gray-300 dark:border-slate-600'
              }`}
              aria-label="Next role"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Role Details */}
        <section className="card mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="p-2 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
              {selectedRole?.icon}
            </span>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedRole?.title}</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400">{selectedRole?.period}</p>
            </div>
          </div>
          
          <p className="text-gray-700 dark:text-slate-300 mb-6">{selectedRole?.description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">Key Responsibilities</h4>
              <ul className="space-y-2">
                {selectedRole?.responsibilities.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-700 dark:text-slate-300">
                    <span className="mt-1 text-primary-600 dark:text-primary-400">
                      <ChevronRight size={16} />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">Key Achievements</h4>
              <ul className="space-y-2">
                {selectedRole?.achievements.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-700 dark:text-slate-300">
                    <span className="mt-1 text-emerald-600 dark:text-emerald-400">
                      <ChevronRight size={16} />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="mt-6">
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">Skills Used</h4>
            <div className="flex flex-wrap gap-2">
              {selectedRole?.skills.map((skill, index) => (
                <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-slate-300">
                  <Tag size={14} className="mr-1" /> {skill}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Interactive Dashboard for Role 1 */}
        {selectedRoleId === 'role1' && (
          <section className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Financial Analytics Dashboard</h3>
            <p className="text-gray-600 dark:text-slate-300 mb-6">
              Interactive demonstration of the financial analytics dashboard I designed and led development for. This product helped businesses visualize their financial data and make informed decisions.
            </p>
            
            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {dashboardMetrics.map((metric) => (
                <div key={metric.name} className="stat-card theme-transition">
                  <div className="stat-title">{metric.name}</div>
                  <div className="stat-value">{metric.name.includes('Volume') || metric.name.includes('Income') || metric.name.includes('Payouts') ? formatCurrency(metric.value) : formatNumber(metric.value)}</div>
                  <div className={`stat-desc flex items-center gap-1 ${metric.trend > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {metric.trend > 0 ? (
                      <ArrowUp size={14} />
                    ) : (
                      <ArrowDown size={14} />
                    )}
                    <span>{Math.abs(metric.trend)}% from previous period</span>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Main Chart */}
            <div className="card mb-6 p-4">
              <div className="flex-between mb-4">
                <h4 className="font-medium text-gray-900 dark:text-white">Monthly Sales</h4>
                <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-slate-400">
                  <span className="inline-block w-3 h-3 rounded-full bg-primary-500"></span> 2023
                  <span className="inline-block w-3 h-3 rounded-full bg-gray-300 dark:bg-slate-600 ml-2"></span> 2022
                </div>
              </div>
              
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlySalesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="name" stroke="#6b7280" />
                    <YAxis 
                      stroke="#6b7280"
                      tickFormatter={(value) => `$${value / 1000}k`}
                    />
                    <Tooltip 
                      formatter={(value: number) => [`$${formatNumber(value)}`, 'Revenue']}
                      labelFormatter={(label) => `Month: ${label}`}
                      contentStyle={{ 
                        backgroundColor: isDarkMode ? '#1e293b' : '#fff',
                        borderColor: isDarkMode ? '#334155' : '#e5e7eb',
                        color: isDarkMode ? '#e2e8f0' : '#374151' 
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="previous" 
                      name="2022" 
                      stroke="#9ca3af" 
                      strokeWidth={2} 
                      dot={{ r: 3 }} 
                      activeDot={{ r: 5 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      name="2023" 
                      stroke="#3b82f6" 
                      strokeWidth={2} 
                      dot={{ r: 3 }} 
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Overview Section */}
            <div className="card p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-4">Overview</h4>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Customers Chart */}
                <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-4">
                  <div className="flex-between mb-4">
                    <h5 className="font-medium text-gray-800 dark:text-slate-200">Customers</h5>
                    <select
                      value={customerTimeframe}
                      onChange={(e) => setCustomerTimeframe(e.target.value as ChartTimeframe)}
                      className="input input-sm py-0.5 px-2 w-auto text-sm"
                      aria-label="Select timeframe for customers chart"
                    >
                      <option value="Daily">Daily</option>
                      <option value="Weekly">Weekly</option>
                      <option value="Monthly">Monthly</option>
                      <option value="Quarterly">Quarterly</option>
                      <option value="Yearly">Yearly</option>
                    </select>
                  </div>
                  
                  <div className="h-[180px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={customersData[customerTimeframe]} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#334155' : '#e5e7eb'} />
                        <XAxis 
                          dataKey="name" 
                          stroke={isDarkMode ? '#94a3b8' : '#6b7280'}
                          tick={{ fontSize: 11 }}
                          tickMargin={5}
                        />
                        <YAxis 
                          stroke={isDarkMode ? '#94a3b8' : '#6b7280'}
                          tickFormatter={(value) => value.toString()}
                          tick={{ fontSize: 11 }}
                        />
                        <Tooltip 
                          formatter={(value: number) => [formatNumber(value), 'Customers']}
                          contentStyle={{ 
                            backgroundColor: isDarkMode ? '#1e293b' : '#fff',
                            borderColor: isDarkMode ? '#334155' : '#e5e7eb',
                            color: isDarkMode ? '#e2e8f0' : '#374151' 
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#8b5cf6" 
                          strokeWidth={2}
                          dot={{ r: 2 }}
                          activeDot={{ r: 4 }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="value" 
                          fill="#8b5cf680"
                          stroke="transparent"
                          fillOpacity={0.2} 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                {/* Net Volume Chart */}
                <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-4">
                  <div className="flex-between mb-4">
                    <h5 className="font-medium text-gray-800 dark:text-slate-200">Net Volume (Quarterly)</h5>
                  </div>
                  
                  <div className="h-[180px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={netVolumeData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#334155' : '#e5e7eb'} />
                        <XAxis 
                          dataKey="name" 
                          stroke={isDarkMode ? '#94a3b8' : '#6b7280'}
                          tick={{ fontSize: 11 }}
                        />
                        <YAxis 
                          stroke={isDarkMode ? '#94a3b8' : '#6b7280'}
                          tickFormatter={(value) => `$${value / 1000}k`}
                          tick={{ fontSize: 11 }}
                        />
                        <Tooltip 
                          formatter={(value: number) => [formatCurrency(value), 'Volume']}
                          contentStyle={{ 
                            backgroundColor: isDarkMode ? '#1e293b' : '#fff',
                            borderColor: isDarkMode ? '#334155' : '#e5e7eb',
                            color: isDarkMode ? '#e2e8f0' : '#374151' 
                          }}
                        />
                        <Bar dataKey="value" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                {/* Payments Chart */}
                <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-4">
                  <div className="flex-between mb-4">
                    <h5 className="font-medium text-gray-800 dark:text-slate-200">Payments</h5>
                    <select
                      value={paymentTimeframe}
                      onChange={(e) => setPaymentTimeframe(e.target.value as ChartTimeframe)}
                      className="input input-sm py-0.5 px-2 w-auto text-sm"
                      aria-label="Select timeframe for payments chart"
                    >
                      <option value="Monthly">Monthly</option>
                      <option value="Quarterly">Quarterly</option>
                      <option value="Yearly">Yearly</option>
                    </select>
                  </div>
                  
                  <div className="h-[180px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={paymentsData[paymentTimeframe]} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#334155' : '#e5e7eb'} />
                        <XAxis 
                          dataKey="name" 
                          stroke={isDarkMode ? '#94a3b8' : '#6b7280'}
                          tick={{ fontSize: 11 }}
                        />
                        <YAxis 
                          stroke={isDarkMode ? '#94a3b8' : '#6b7280'}
                          tickFormatter={(value) => `$${value / 1000}k`}
                          tick={{ fontSize: 11 }}
                        />
                        <Tooltip 
                          formatter={(value: number) => [formatCurrency(value), 'Payments']}
                          contentStyle={{ 
                            backgroundColor: isDarkMode ? '#1e293b' : '#fff',
                            borderColor: isDarkMode ? '#334155' : '#e5e7eb',
                            color: isDarkMode ? '#e2e8f0' : '#374151' 
                          }}
                        />
                        <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
        
        {/* Interactive CRM Dashboard for Role 2 */}
        {selectedRoleId === 'role2' && (
          <section className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">CRM Platform Overview</h3>
            <p className="text-gray-600 dark:text-slate-300 mb-6">
              This section demonstrates the CRM platform I managed, designed for small businesses to manage their customer relationships effectively.
            </p>
            
            <div className="card mb-6 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6">
                <h4 className="text-2xl font-bold">Customer Relationship Management</h4>
                <p className="opacity-80 mt-2">Track, manage, and grow your customer relationships</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                    <div className="text-3xl font-bold">10,000+</div>
                    <div className="text-sm opacity-80">Active Users</div>
                  </div>
                  
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                    <div className="text-3xl font-bold">92%</div>
                    <div className="text-sm opacity-80">Customer Satisfaction</div>
                  </div>
                  
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                    <div className="text-3xl font-bold">45%</div>
                    <div className="text-sm opacity-80">Conversion Increase</div>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <h5 className="font-semibold text-lg text-gray-900 dark:text-white mb-4">Key Features Implemented</h5>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <User size={20} />
                      </div>
                      <div>
                        <h6 className="font-medium text-gray-900 dark:text-white">Contact Management</h6>
                        <p className="text-sm text-gray-600 dark:text-slate-400">Comprehensive customer profiles with interaction history, notes, and activity tracking.</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                        <ArrowRight size={20} />
                      </div>
                      <div>
                        <h6 className="font-medium text-gray-900 dark:text-white">Sales Pipeline</h6>
                        <p className="text-sm text-gray-600 dark:text-slate-400">Visual representation of sales process from lead to closed deal with customizable stages.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                        <Calendar size={20} />
                      </div>
                      <div>
                        <h6 className="font-medium text-gray-900 dark:text-white">Task Management</h6>
                        <p className="text-sm text-gray-600 dark:text-slate-400">Organize tasks, set reminders, and track progress to ensure nothing falls through the cracks.</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
                        <ChartBar size={20} />
                      </div>
                      <div>
                        <h6 className="font-medium text-gray-900 dark:text-white">Reports & Analytics</h6>
                        <p className="text-sm text-gray-600 dark:text-slate-400">Customizable dashboards and reports to track sales performance, customer growth, and team productivity.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card p-6">
              <h5 className="font-semibold text-lg text-gray-900 dark:text-white mb-4">Implementation Results</h5>
              
              <div className="h-[300px] w-full mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={[
                      { month: 'Jan', users: 1000, revenue: 50000 },
                      { month: 'Feb', users: 2000, revenue: 65000 },
                      { month: 'Mar', users: 3200, revenue: 78000 },
                      { month: 'Apr', users: 4500, revenue: 90000 },
                      { month: 'May', users: 5800, revenue: 102000 },
                      { month: 'Jun', users: 7000, revenue: 115000 },
                      { month: 'Jul', users: 8100, revenue: 135000 },
                      { month: 'Aug', users: 8800, revenue: 152000 },
                      { month: 'Sep', users: 9300, revenue: 168000 },
                      { month: 'Oct', users: 9800, revenue: 185000 },
                      { month: 'Nov', users: 10000, revenue: 200000 }
                    ]}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#334155' : '#e5e7eb'} />
                    <XAxis dataKey="month" stroke={isDarkMode ? '#94a3b8' : '#6b7280'} />
                    <YAxis stroke={isDarkMode ? '#94a3b8' : '#6b7280'} yAxisId="left" tickFormatter={(value) => `${value}`} />
                    <YAxis yAxisId="right" orientation="right" stroke={isDarkMode ? '#94a3b8' : '#6b7280'} tickFormatter={(value) => `$${value/1000}k`} />
                    <Tooltip 
                      formatter={(value: number, name: string) => {
                        return [name === 'users' ? formatNumber(value) : formatCurrency(value), name === 'users' ? 'Users' : 'Revenue'];
                      }}
                      contentStyle={{ 
                        backgroundColor: isDarkMode ? '#1e293b' : '#fff',
                        borderColor: isDarkMode ? '#334155' : '#e5e7eb',
                        color: isDarkMode ? '#e2e8f0' : '#374151' 
                      }}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="users" name="Active Users" stroke="#8884d8" fill="#8884d8" fillOpacity={0.2} yAxisId="left" />
                    <Area type="monotone" dataKey="revenue" name="Client Revenue" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.2} yAxisId="right" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg">
                  <div className="text-xl font-bold text-gray-900 dark:text-white">45%</div>
                  <div className="text-sm text-gray-600 dark:text-slate-400">Increase in conversion rates after implementing automated onboarding</div>
                </div>
                
                <div className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg">
                  <div className="text-xl font-bold text-gray-900 dark:text-white">30%</div>
                  <div className="text-sm text-gray-600 dark:text-slate-400">Expanded market reach through strategic partnerships</div>
                </div>
                
                <div className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg">
                  <div className="text-xl font-bold text-gray-900 dark:text-white">92%</div>
                  <div className="text-sm text-gray-600 dark:text-slate-400">Customer satisfaction rating, well above the industry average of 76%</div>
                </div>
              </div>
            </div>
          </section>
        )}
        
        {/* E-commerce Platform for Role 3 */}
        {selectedRoleId === 'role3' && (
          <section className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">E-commerce Platform Redesign</h3>
            <p className="text-gray-600 dark:text-slate-300 mb-6">
              Showcase of the e-commerce platform I helped redesign, focusing on mobile optimization and conversion rate improvements.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="card overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-6">
                  <h4 className="text-xl font-bold">Before Redesign</h4>
                  <p className="mt-1 opacity-80">Key metrics before the redesign initiative</p>
                </div>
                
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-slate-400">Conversion Rate</span>
                    <span className="font-medium text-gray-900 dark:text-white">2.4%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2.5">
                    <div className="bg-red-500 h-2.5 rounded-full" style={{ width: '24%' }}></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-slate-400">Mobile Usage</span>
                    <span className="font-medium text-gray-900 dark:text-white">45%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2.5">
                    <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-slate-400">Cart Abandonment</span>
                    <span className="font-medium text-gray-900 dark:text-white">78%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2.5">
                    <div className="bg-red-500 h-2.5 rounded-full" style={{ width: '78%' }}></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-slate-400">Page Load Time</span>
                    <span className="font-medium text-gray-900 dark:text-white">4.2s</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2.5">
                    <div className="bg-red-500 h-2.5 rounded-full" style={{ width: '70%' }}></div>
                  </div>
                </div>
              </div>
              
              <div className="card overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6">
                  <h4 className="text-xl font-bold">After Redesign</h4>
                  <p className="mt-1 opacity-80">Improvements achieved through redesign</p>
                </div>
                
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-slate-400">Conversion Rate</span>
                    <span className="font-medium text-gray-900 dark:text-white">3.7%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2.5">
                    <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: '37%' }}></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-slate-400">Mobile Usage</span>
                    <span className="font-medium text-gray-900 dark:text-white">68%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2.5">
                    <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: '68%' }}></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-slate-400">Cart Abandonment</span>
                    <span className="font-medium text-gray-900 dark:text-white">52%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2.5">
                    <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: '52%' }}></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-slate-400">Page Load Time</span>
                    <span className="font-medium text-gray-900 dark:text-white">1.8s</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2.5">
                    <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: '30%' }}></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card p-6 mb-6">
              <h4 className="font-semibold text-lg text-gray-900 dark:text-white mb-4">A/B Testing Results</h4>
              
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { name: 'Homepage', variantA: 3.2, variantB: 4.8 },
                      { name: 'Product Page', variantA: 5.1, variantB: 7.3 },
                      { name: 'Cart Page', variantA: 2.8, variantB: 5.2 },
                      { name: 'Checkout', variantA: 1.9, variantB: 3.6 }
                    ]}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#334155' : '#e5e7eb'} />
                    <XAxis dataKey="name" stroke={isDarkMode ? '#94a3b8' : '#6b7280'} />
                    <YAxis 
                      stroke={isDarkMode ? '#94a3b8' : '#6b7280'}
                      label={{ value: 'Conversion Rate (%)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                    />
                    <Tooltip 
                      formatter={(value: number) => [`${value}%`, 'Conversion Rate']}
                      contentStyle={{ 
                        backgroundColor: isDarkMode ? '#1e293b' : '#fff',
                        borderColor: isDarkMode ? '#334155' : '#e5e7eb',
                        color: isDarkMode ? '#e2e8f0' : '#374151' 
                      }}
                    />
                    <Legend />
                    <Bar dataKey="variantA" name="Original Design" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="variantB" name="New Design" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="card p-6">
              <h4 className="font-semibold text-lg text-gray-900 dark:text-white mb-4">Key Improvements Implemented</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-3">
                    <Search size={20} />
                  </div>
                  <h5 className="font-medium text-gray-900 dark:text-white mb-2">Enhanced Search</h5>
                  <p className="text-sm text-gray-600 dark:text-slate-400">Implemented predictive search with filters that improved product discovery by 40%.</p>
                </div>
                
                <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-4">
                  <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-3">
                    <Filter size={20} />
                  </div>
                  <h5 className="font-medium text-gray-900 dark:text-white mb-2">Mobile-First Design</h5>
                  <p className="text-sm text-gray-600 dark:text-slate-400">Redesigned the entire experience with mobile users as the primary focus.</p>
                </div>
                
                <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3">
                    <ArrowLeftRight size={20} />
                  </div>
                  <h5 className="font-medium text-gray-900 dark:text-white mb-2">Streamlined Checkout</h5>
                  <p className="text-sm text-gray-600 dark:text-slate-400">Reduced checkout steps from 5 to 2, decreasing cart abandonment by 33%.</p>
                </div>
              </div>
            </div>
          </section>
        )}
        
        {/* Business Analytics for Role 4 */}
        {selectedRoleId === 'role4' && (
          <section className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Business Process Analysis</h3>
            <p className="text-gray-600 dark:text-slate-300 mb-6">
              Overview of the business analysis and process optimization work I performed for enterprise clients in finance and healthcare.
            </p>
            
            <div className="card overflow-hidden mb-6">
              <div className="bg-gradient-to-r from-gray-700 to-gray-900 text-white p-6">
                <h4 className="text-xl font-bold">Banking Client Case Study</h4>
                <p className="mt-1 opacity-80">Process optimization that resulted in $2M annual savings</p>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h5 className="font-medium text-gray-900 dark:text-white mb-3">Challenge</h5>
                    <p className="text-gray-600 dark:text-slate-400 mb-2">
                      The client, a regional bank with 50+ branches, struggled with inefficient reporting processes that required manual data collection and consolidation from multiple systems.
                    </p>
                    <ul className="space-y-1 text-gray-600 dark:text-slate-400">
                      <li className="flex items-start gap-2">
                        <span className="mt-1 text-red-600 dark:text-red-400"><ChevronRight size={16} /></span>
                        <span>12+ hours spent weekly by each branch on manual reporting</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1 text-red-600 dark:text-red-400"><ChevronRight size={16} /></span>
                        <span>High error rates due to manual data entry</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1 text-red-600 dark:text-red-400"><ChevronRight size={16} /></span>
                        <span>Delayed decision making due to report processing times</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-gray-900 dark:text-white mb-3">Solution</h5>
                    <p className="text-gray-600 dark:text-slate-400 mb-2">
                      Conducted comprehensive analysis of reporting workflows and implemented an automated data integration solution.
                    </p>
                    <ul className="space-y-1 text-gray-600 dark:text-slate-400">
                      <li className="flex items-start gap-2">
                        <span className="mt-1 text-emerald-600 dark:text-emerald-400"><ChevronRight size={16} /></span>
                        <span>Created centralized data warehouse with automated feeds</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1 text-emerald-600 dark:text-emerald-400"><ChevronRight size={16} /></span>
                        <span>Developed self-service reporting dashboards for branches</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1 text-emerald-600 dark:text-emerald-400"><ChevronRight size={16} /></span>
                        <span>Implemented validation rules to ensure data integrity</span>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <h5 className="font-medium text-gray-900 dark:text-white mb-3">Results</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">65%</div>
                    <div className="text-sm text-gray-600 dark:text-slate-400">Reduction in manual reporting effort</div>
                  </div>
                  
                  <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">$2M</div>
                    <div className="text-sm text-gray-600 dark:text-slate-400">Annual cost savings</div>
                  </div>
                  
                  <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">90%</div>
                    <div className="text-sm text-gray-600 dark:text-slate-400">Decrease in reporting errors</div>
                  </div>
                  
                  <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">4hr</div>
                    <div className="text-sm text-gray-600 dark:text-slate-400">Reduced decision time</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card p-6">
              <h4 className="font-semibold text-lg text-gray-900 dark:text-white mb-4">Healthcare Client: Data Migration Strategy</h4>
              
              <div className="mb-6">
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { phase: 'Planning', allocated: 120, actual: 135 },
                        { phase: 'Analysis', allocated: 180, actual: 175 },
                        { phase: 'Development', allocated: 250, actual: 220 },
                        { phase: 'Testing', allocated: 150, actual: 180 },
                        { phase: 'Deployment', allocated: 100, actual: 95 },
                        { phase: 'Training', allocated: 80, actual: 95 }
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#334155' : '#e5e7eb'} />
                      <XAxis dataKey="phase" stroke={isDarkMode ? '#94a3b8' : '#6b7280'} />
                      <YAxis 
                        stroke={isDarkMode ? '#94a3b8' : '#6b7280'}
                        label={{ value: 'Hours', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                      />
                      <Tooltip 
                        formatter={(value: number) => [`${value} hours`, 'Time']}
                        contentStyle={{ 
                          backgroundColor: isDarkMode ? '#1e293b' : '#fff',
                          borderColor: isDarkMode ? '#334155' : '#e5e7eb',
                          color: isDarkMode ? '#e2e8f0' : '#374151' 
                        }}
                      />
                      <Legend />
                      <Bar dataKey="allocated" name="Allocated Time" fill="#64748b" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="actual" name="Actual Time" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-medium text-gray-900 dark:text-white mb-3">Project Overview</h5>
                  <p className="text-gray-600 dark:text-slate-400 mb-3">
                    Led a complex data migration project for a healthcare provider transitioning from legacy systems to a modern integrated health records platform.
                  </p>
                  <ul className="space-y-2 text-gray-600 dark:text-slate-400">
                    <li className="flex items-start gap-2">
                      <span className="mt-1 text-blue-600 dark:text-blue-400"><ChevronRight size={16} /></span>
                      <span>Created detailed mapping between old and new data structures</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 text-blue-600 dark:text-blue-400"><ChevronRight size={16} /></span>
                      <span>Developed data cleansing protocols to improve data quality</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 text-blue-600 dark:text-blue-400"><ChevronRight size={16} /></span>
                      <span>Designed phased migration approach to minimize disruption</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h5 className="font-medium text-gray-900 dark:text-white mb-3">Key Outcomes</h5>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-slate-400">Data Migration Completion</span>
                      <span className="font-medium text-gray-900 dark:text-white">98%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2.5">
                      <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: '98%' }}></div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-slate-400">Data Quality Improvement</span>
                      <span className="font-medium text-gray-900 dark:text-white">87%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2.5">
                      <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: '87%' }}></div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-slate-400">System Downtime</span>
                      <span className="font-medium text-gray-900 dark:text-white">4.5 hours</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2.5">
                      <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: '15%' }}></div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-slate-400">User Satisfaction</span>
                      <span className="font-medium text-gray-900 dark:text-white">92%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2.5">
                      <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: '92%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
        
        {/* Related Projects Section */}
        {relatedProjects.length > 0 && (
          <section className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Related Projects</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProjects.map((project) => (
                <div key={project.id} className="card hover:shadow-lg transition-shadow">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{project.title}</h4>
                  <p className="text-gray-600 dark:text-slate-400 mb-4">{project.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.technologies.map((tech, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-slate-300 text-xs rounded-md">
                        {tech}
                      </span>
                    ))}
                  </div>
                  
                  {project.link && (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-primary-600 dark:text-primary-400 hover:underline"
                    >
                      <ExternalLink size={14} />
                      <span>View Project</span>
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
        
        {/* Education & Certifications - Only show on first role */}
        {selectedRoleId === experienceData.roles[0].id && (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="card">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <BookOpen size={20} />
                <span>Education</span>
              </h3>
              
              <div className="space-y-6">
                {experienceData.education.map((edu, index) => (
                  <div key={index} className="border-l-2 border-gray-200 dark:border-slate-700 pl-4 ml-2">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">{edu.degree}</h4>
                    <p className="text-gray-600 dark:text-slate-400">{edu.institution}</p>
                    <p className="text-sm text-gray-500 dark:text-slate-500 mb-2">{edu.year}</p>
                    <p className="text-gray-600 dark:text-slate-400">{edu.description}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="card">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Award size={20} />
                <span>Certifications</span>
              </h3>
              
              <div className="space-y-4">
                {experienceData.certifications.map((cert, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full">
                      <Award size={16} />
                    </div>
                    <div>
                      <h4 className="text-md font-medium text-gray-900 dark:text-white">{cert.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-slate-400">{cert.issuer}, {cert.year}</p>
                      {cert.link && (
                        <a
                          href={cert.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary-600 dark:text-primary-400 hover:underline inline-flex items-center gap-1 mt-1"
                        >
                          <ExternalLink size={14} />
                          <span>Verify</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 py-6 theme-transition">
        <div className="container-fluid text-center text-gray-600 dark:text-slate-400 text-sm">
          <p>Copyright © 2025 of Datavtar Private Limited. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
