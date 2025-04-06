import React, { useState, useEffect, useRef } from 'react';
import styles from './styles/styles.module.css';
import {
  User,
  GraduationCap,
  Briefcase,
  Code,
  FileText,
  Download,
  Moon,
  Sun,
  ArrowRight,
  ArrowLeft,
  Github,
  Linkedin,
  Mail,
  Phone,
  Globe,
  X,
  ChevronDown,
  ChevronUp,
  Terminal,
  Zap,
  Star,
  Edit // Added missing Edit icon import
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

// Types
type ResumeData = {
  personalInfo: {
    name: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    website: string;
    linkedin: string;
    github: string;
    summary: string;
    profilePicture: string | null;
  };
  education: EducationItem[];
  experience: ExperienceItem[];
  skills: SkillItem[];
  projects: ProjectItem[];
  certifications: CertificationItem[];
};

type EducationItem = {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  description: string;
  gpa?: string;
};

type ExperienceItem = {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
  achievements: string[];
  techStack: string[];
};

type SkillItem = {
  id: string;
  name: string;
  level: number; // 1-5
  category: 'technical' | 'soft' | 'language' | 'tool';
};

type ProjectItem = {
  id: string;
  name: string;
  description: string;
  techStack: string[];
  link?: string;
  githubLink?: string;
  startDate: string;
  endDate: string;
  image?: string;
};

type CertificationItem = {
  id: string;
  name: string;
  issuer: string;
  date: string;
  link?: string;
};

type Section = 'about' | 'experience' | 'education' | 'skills' | 'projects';

type ModalType = 'pdfUpload' | 'projectDemo' | 'experience' | 'skills' | null;

// Initial Resume Data
const defaultResumeData: ResumeData = {
  personalInfo: {
    name: 'Alex Morgan',
    title: 'Senior Product Manager',
    email: 'alex.morgan@example.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    website: 'alexmorgan.example.com',
    linkedin: 'linkedin.com/in/alexmorgan',
    github: 'github.com/alexmorgan',
    summary: 'Product manager with 7+ years of experience in tech, specializing in SaaS products and data-driven growth strategies. Passionate about creating intuitive user experiences and building products that solve real-world problems.',
    profilePicture: null,
  },
  education: [
    {
      id: '1',
      institution: 'Stanford University',
      degree: 'Master of Business Administration',
      field: 'Product Management',
      startDate: '2014',
      endDate: '2016',
      description: 'Focused on product strategy, market analysis, and technology management.',
      gpa: '3.92',
    },
    {
      id: '2',
      institution: 'University of California, Berkeley',
      degree: 'Bachelor of Science',
      field: 'Computer Science',
      startDate: '2010',
      endDate: '2014',
      description: 'Specialized in Human-Computer Interaction and Software Engineering.',
      gpa: '3.85',
    },
  ],
  experience: [
    {
      id: '1',
      company: 'Tech Innovations Inc.',
      position: 'Senior Product Manager',
      startDate: 'Jan 2020',
      endDate: 'Present',
      description: 'Leading a cross-functional team to develop and launch enterprise SaaS solutions.',
      achievements: [
        'Led the redesign of the flagship product, resulting in a 35% increase in user engagement.',
        'Implemented agile methodologies that reduced time-to-market by 40%.',
        'Developed product roadmap and strategy for a new B2B platform with projected annual revenue of $2.5M.',
      ],
      techStack: ['Jira', 'Figma', 'Amplitude', 'SQL', 'Tableau']
    },
    {
      id: '2',
      company: 'DataFlow Systems',
      position: 'Product Manager',
      startDate: 'Mar 2017',
      endDate: 'Dec 2019',
      description: 'Managed the full product lifecycle for data analytics tools aimed at enterprise clients.',
      achievements: [
        'Launched 3 major product features that increased customer retention by 25%.',
        'Conducted user research and usability testing that improved NPS score from 32 to 48.',
        'Collaborated with engineering to implement machine learning algorithms for predictive analytics features.',
      ],
      techStack: ['Product Board', 'Google Analytics', 'Mixpanel', 'Sketch', 'Python']
    },
    {
      id: '3',
      company: 'StartUp Solutions',
      position: 'Associate Product Manager',
      startDate: 'Jul 2016',
      endDate: 'Feb 2017',
      description: 'Assisted in the development of mobile applications for startup clients.',
      achievements: [
        'Conducted competitive analysis for 5 key product features.',
        'Created wireframes and prototypes for mobile applications.',
        'Collaborated with developers to prioritize and implement features based on user feedback.',
      ],
      techStack: ['Trello', 'InVision', 'Adobe XD', 'Slack']
    },
  ],
  skills: [
    { id: '1', name: 'Product Strategy', level: 5, category: 'technical' },
    { id: '2', name: 'Market Analysis', level: 4, category: 'technical' },
    { id: '3', name: 'Agile Methodologies', level: 5, category: 'technical' },
    { id: '4', name: 'User Experience Design', level: 4, category: 'technical' },
    { id: '5', name: 'Data Analysis', level: 4, category: 'technical' },
    { id: '6', name: 'SQL', level: 3, category: 'technical' },
    { id: '7', name: 'Python', level: 3, category: 'technical' },
    { id: '8', name: 'Project Management', level: 5, category: 'technical' },
    { id: '9', name: 'A/B Testing', level: 4, category: 'technical' },
    { id: '10', name: 'Leadership', level: 4, category: 'soft' },
    { id: '11', name: 'Communication', level: 5, category: 'soft' },
    { id: '12', name: 'Problem Solving', level: 5, category: 'soft' },
    { id: '13', name: 'Teamwork', level: 4, category: 'soft' },
    { id: '14', name: 'English', level: 5, category: 'language' },
    { id: '15', name: 'Spanish', level: 3, category: 'language' },
  ],
  projects: [
    {
      id: '1',
      name: 'Enterprise Analytics Dashboard',
      description: 'Led the development of a real-time analytics dashboard for enterprise clients that increased data visibility and decision-making efficiency.',
      techStack: ['React', 'Node.js', 'D3.js', 'AWS'],
      link: 'example.com/analytics-dashboard',
      githubLink: 'github.com/analytics-dashboard',
      startDate: 'Jan 2021',
      endDate: 'Aug 2021',
    },
    {
      id: '2',
      name: 'Customer Feedback System',
      description: 'Designed and implemented a comprehensive feedback collection and analysis system that improved product development prioritization.',
      techStack: ['Python', 'Django', 'PostgreSQL', 'NLP'],
      link: 'example.com/feedback-system',
      githubLink: 'github.com/feedback-system',
      startDate: 'Sep 2020',
      endDate: 'Dec 2020',
    },
    {
      id: '3',
      name: 'Mobile Onboarding Experience',
      description: 'Redesigned the mobile app onboarding flow, resulting in a 40% increase in completed onboarding and a 25% reduction in first-week churn.',
      techStack: ['Figma', 'Swift', 'Kotlin', 'Firebase'],
      link: 'example.com/mobile-onboarding',
      startDate: 'Mar 2020',
      endDate: 'Jul 2020',
    },
  ],
  certifications: [
    {
      id: '1',
      name: 'Certified Scrum Product Owner (CSPO)',
      issuer: 'Scrum Alliance',
      date: 'Jun 2019',
      link: 'scrumalliance.org/certifications/cspo',
    },
    {
      id: '2',
      name: 'Product Management Certification',
      issuer: 'Product School',
      date: 'Nov 2018',
      link: 'productschool.com/certifications',
    },
    {
      id: '3',
      name: 'Google Analytics Certification',
      issuer: 'Google',
      date: 'Apr 2018',
      link: 'analytics.google.com/certification',
    },
  ],
};

// Demo charts data
const productGrowthData = [
  { month: 'Jan', users: 1000 },
  { month: 'Feb', users: 1500 },
  { month: 'Mar', users: 2000 },
  { month: 'Apr', users: 2500 },
  { month: 'May', users: 3700 },
  { month: 'Jun', users: 4500 },
  { month: 'Jul', users: 6000 },
  { month: 'Aug', users: 7200 },
];

const featureUsageData = [
  { name: 'Dashboard', value: 35 },
  { name: 'Reports', value: 25 },
  { name: 'Analytics', value: 20 },
  { name: 'Settings', value: 10 },
  { name: 'Profile', value: 10 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28BFF'];

const userRetentionData = [
  { name: 'Week 1', retention: 100 },
  { name: 'Week 2', retention: 80 },
  { name: 'Week 3', retention: 65 },
  { name: 'Week 4', retention: 55 },
  { name: 'Week 5', retention: 50 },
  { name: 'Week 6', retention: 48 },
  { name: 'Week 7', retention: 45 },
  { name: 'Week 8', retention: 43 },
];

const App: React.FC = () => {
  // State
  const [resumeData, setResumeData] = useState<ResumeData>(() => {
    const savedData = localStorage.getItem('resumeData');
    return savedData ? JSON.parse(savedData) : defaultResumeData;
  });
  const [activeSection, setActiveSection] = useState<Section>('about');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode === 'true' || 
      (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [currentExp, setCurrentExp] = useState<number>(0);
  const [currentProject, setCurrentProject] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('resumeData', JSON.stringify(resumeData));
  }, [resumeData]);

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

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isModalOpen]);

  // Handle click outside modal to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        closeModal();
      }
    };

    if (isModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isModalOpen]);

  // Open modal with specified type
  const openModal = (type: ModalType) => {
    setModalType(type);
    setIsModalOpen(true);
    document.body.classList.add('overflow-hidden');
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setModalType(null);
    document.body.classList.remove('overflow-hidden');
  };

  // Handle resume upload
  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Normally you would parse the PDF or DOC, but for this demo, we'll just update with sample data
    // In real app, you'd use a PDF/DOC parsing library
    alert(`Resume file "${file.name}" uploaded successfully! Processing data...`);
    closeModal();
    
    // Just to show something happened - in real app, you'd parse the file
    setTimeout(() => {
      setResumeData({
        ...resumeData,
        personalInfo: {
          ...resumeData.personalInfo,
          name: file.name.split('.')[0].replace(/_/g, ' '),
        }
      });
    }, 1000);
  };

  // Upload profile picture
  const handleProfilePictureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setResumeData({
        ...resumeData,
        personalInfo: {
          ...resumeData.personalInfo,
          profilePicture: event.target?.result as string,
        }
      });
    };
    reader.readAsDataURL(file);
  };

  // Function to download the resume template
  const downloadResumeTemplate = () => {
    // In a real app, you would serve a real file
    // For now, let's create a text representation
    const templateContent = JSON.stringify(defaultResumeData, null, 2);
    const blob = new Blob([templateContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resume_template.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handle the navigation through sections
  const goToNextExperience = () => {
    if (currentExp < resumeData.experience.length - 1) {
      setCurrentExp(currentExp + 1);
    }
  };

  const goToPrevExperience = () => {
    if (currentExp > 0) {
      setCurrentExp(currentExp - 1);
    }
  };

  const goToNextProject = () => {
    if (currentProject < resumeData.projects.length - 1) {
      setCurrentProject(currentProject + 1);
    }
  };

  const goToPrevProject = () => {
    if (currentProject > 0) {
      setCurrentProject(currentProject - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 theme-transition">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center">
          <div className="flex items-center mb-4 sm:mb-0">
            <div className="flex-shrink-0 mr-4">
              {resumeData.personalInfo.profilePicture ? (
                <img 
                  src={resumeData.personalInfo.profilePicture} 
                  alt="Profile" 
                  className="h-12 w-12 rounded-full object-cover border-2 border-primary-500"
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 dark:text-primary-300">
                  <User size={24} />
                </div>
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold">{resumeData.personalInfo.name}</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">{resumeData.personalInfo.title}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <nav className="hidden md:block">
              <ul className="flex space-x-6">
                <li>
                  <button 
                    onClick={() => setActiveSection('about')}
                    className={`pb-1 ${activeSection === 'about' ? 'border-b-2 border-primary-500 font-medium text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                  >
                    About
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveSection('experience')}
                    className={`pb-1 ${activeSection === 'experience' ? 'border-b-2 border-primary-500 font-medium text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                  >
                    Experience
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveSection('education')}
                    className={`pb-1 ${activeSection === 'education' ? 'border-b-2 border-primary-500 font-medium text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                  >
                    Education
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveSection('skills')}
                    className={`pb-1 ${activeSection === 'skills' ? 'border-b-2 border-primary-500 font-medium text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                  >
                    Skills
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveSection('projects')}
                    className={`pb-1 ${activeSection === 'projects' ? 'border-b-2 border-primary-500 font-medium text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                  >
                    Projects
                  </button>
                </li>
              </ul>
            </nav>
            <div className="md:hidden relative">
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  const dropdown = document.getElementById('mobile-menu');
                  dropdown?.classList.toggle('hidden');
                }}
                aria-label="Open navigation menu"
              >
                Menu
              </button>
              <div id="mobile-menu" className="hidden absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-20">
                <button 
                  onClick={() => {
                    setActiveSection('about');
                    document.getElementById('mobile-menu')?.classList.add('hidden');
                  }}
                  className={`block px-4 py-2 text-sm w-full text-left ${activeSection === 'about' ? 'bg-gray-100 dark:bg-gray-700 text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'}`}
                >
                  About
                </button>
                <button 
                  onClick={() => {
                    setActiveSection('experience');
                    document.getElementById('mobile-menu')?.classList.add('hidden');
                  }}
                  className={`block px-4 py-2 text-sm w-full text-left ${activeSection === 'experience' ? 'bg-gray-100 dark:bg-gray-700 text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'}`}
                >
                  Experience
                </button>
                <button 
                  onClick={() => {
                    setActiveSection('education');
                    document.getElementById('mobile-menu')?.classList.add('hidden');
                  }}
                  className={`block px-4 py-2 text-sm w-full text-left ${activeSection === 'education' ? 'bg-gray-100 dark:bg-gray-700 text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'}`}
                >
                  Education
                </button>
                <button 
                  onClick={() => {
                    setActiveSection('skills');
                    document.getElementById('mobile-menu')?.classList.add('hidden');
                  }}
                  className={`block px-4 py-2 text-sm w-full text-left ${activeSection === 'skills' ? 'bg-gray-100 dark:bg-gray-700 text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'}`}
                >
                  Skills
                </button>
                <button 
                  onClick={() => {
                    setActiveSection('projects');
                    document.getElementById('mobile-menu')?.classList.add('hidden');
                  }}
                  className={`block px-4 py-2 text-sm w-full text-left ${activeSection === 'projects' ? 'bg-gray-100 dark:bg-gray-700 text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'}`}
                >
                  Projects
                </button>
              </div>
            </div>
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="theme-toggle p-2 rounded-full bg-gray-200 dark:bg-gray-700"
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={() => openModal('pdfUpload')}
              className="btn btn-primary"
            >
              <FileText size={16} className="mr-1" />
              Upload Resume
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* About Section */}
        {activeSection === 'about' && (
          <section className="fade-in space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <User size={24} />
                    About Me
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    {resumeData.personalInfo.summary}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                    <div className="flex items-center gap-2">
                      <Mail className="text-gray-500 dark:text-gray-400" size={18} />
                      <a href={`mailto:${resumeData.personalInfo.email}`} className="text-primary-600 dark:text-primary-400 hover:underline">
                        {resumeData.personalInfo.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="text-gray-500 dark:text-gray-400" size={18} />
                      <a href={`tel:${resumeData.personalInfo.phone}`} className="text-primary-600 dark:text-primary-400 hover:underline">
                        {resumeData.personalInfo.phone}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="text-gray-500 dark:text-gray-400" size={18} />
                      <a href={`https://${resumeData.personalInfo.website}`} target="_blank" rel="noopener noreferrer" className="text-primary-600 dark:text-primary-400 hover:underline">
                        {resumeData.personalInfo.website}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Linkedin className="text-gray-500 dark:text-gray-400" size={18} />
                      <a href={`https://${resumeData.personalInfo.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-primary-600 dark:text-primary-400 hover:underline">
                        {resumeData.personalInfo.linkedin}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Github className="text-gray-500 dark:text-gray-400" size={18} />
                      <a href={`https://${resumeData.personalInfo.github}`} target="_blank" rel="noopener noreferrer" className="text-primary-600 dark:text-primary-400 hover:underline">
                        {resumeData.personalInfo.github}
                      </a>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="relative">
                    {resumeData.personalInfo.profilePicture ? (
                      <img 
                        src={resumeData.personalInfo.profilePicture} 
                        alt="Profile" 
                        className="w-40 h-40 rounded-full object-cover border-4 border-primary-500"
                      />
                    ) : (
                      <div className="w-40 h-40 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 dark:text-primary-300">
                        <User size={64} />
                      </div>
                    )}
                    <label htmlFor="profile-picture" className="absolute bottom-2 right-2 bg-primary-500 text-white p-2 rounded-full cursor-pointer hover:bg-primary-600 transition-colors">
                      <input 
                        type="file" 
                        id="profile-picture" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleProfilePictureUpload}
                      />
                      <Edit size={16} />
                    </label>
                  </div>
                  <h3 className="text-xl font-semibold mt-4">{resumeData.personalInfo.name}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{resumeData.personalInfo.title}</p>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">{resumeData.personalInfo.location}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <GraduationCap size={24} />
                Education Highlights
              </h2>
              <div className="space-y-6">
                {resumeData.education.slice(0, 2).map((edu) => (
                  <div key={edu.id} className="border-l-4 border-primary-500 pl-4 py-1">
                    <h3 className="text-lg font-semibold">{edu.institution}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{edu.degree} in {edu.field}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">{edu.startDate} - {edu.endDate}</p>
                  </div>
                ))}
              </div>
              <button onClick={() => setActiveSection('education')} className="btn btn-secondary mt-4">
                View All Education
              </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Briefcase size={24} />
                Experience Highlights
              </h2>
              <div className="space-y-6">
                {resumeData.experience.slice(0, 2).map((exp) => (
                  <div key={exp.id} className="border-l-4 border-primary-500 pl-4 py-1">
                    <h3 className="text-lg font-semibold">{exp.position}</h3>
                    <p className="text-primary-600 dark:text-primary-400">{exp.company}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">{exp.startDate} - {exp.endDate}</p>
                    <button 
                      onClick={() => {
                        setCurrentExp(resumeData.experience.findIndex(e => e.id === exp.id));
                        openModal('experience');
                      }} 
                      className="text-sm text-primary-600 dark:text-primary-400 hover:underline mt-1"
                    >
                      View Details
                    </button>
                  </div>
                ))}
              </div>
              <button onClick={() => setActiveSection('experience')} className="btn btn-secondary mt-4">
                View All Experience
              </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Code size={24} />
                Project Highlights
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {resumeData.projects.slice(0, 2).map((project) => (
                  <div key={project.id} className="card">
                    <h3 className="text-lg font-semibold">{project.name}</h3>
                    <p className="text-gray-600 dark:text-gray-400 line-clamp-2">{project.description}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {project.techStack.slice(0, 3).map((tech, index) => (
                        <span key={index} className="badge badge-info">{tech}</span>
                      ))}
                      {project.techStack.length > 3 && (
                        <span className="badge badge-secondary">+{project.techStack.length - 3} more</span>
                      )}
                    </div>
                    <button 
                      onClick={() => {
                        setCurrentProject(resumeData.projects.findIndex(p => p.id === project.id));
                        openModal('projectDemo');
                      }} 
                      className="btn btn-primary mt-3"
                    >
                      View Demo
                    </button>
                  </div>
                ))}
              </div>
              <button onClick={() => setActiveSection('projects')} className="btn btn-secondary mt-6">
                View All Projects
              </button>
            </div>
          </section>
        )}

        {/* Experience Section */}
        {activeSection === 'experience' && (
          <section className="fade-in space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Briefcase size={24} />
                Work Experience
              </h2>
                            
              <div className="space-y-8">
                {resumeData.experience.map((exp) => (
                  <div key={exp.id} className="border-l-4 border-primary-500 pl-4 py-1 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                    <h3 className="text-lg font-semibold">{exp.position}</h3>
                    <p className="text-primary-600 dark:text-primary-400">{exp.company}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">{exp.startDate} - {exp.endDate}</p>
                    <p className="mt-2 text-gray-700 dark:text-gray-300">{exp.description}</p>
                    
                    <div className="mt-3">
                      <button 
                        onClick={() => {
                          setCurrentExp(resumeData.experience.findIndex(e => e.id === exp.id));
                          openModal('experience');
                        }}
                        className="text-primary-600 dark:text-primary-400 hover:underline inline-flex items-center"
                      >
                        View Details <ArrowRight size={16} className="ml-1" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Star size={24} />
                Certifications
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {resumeData.certifications.map((cert) => (
                  <div key={cert.id} className="card">
                    <h3 className="text-lg font-semibold">{cert.name}</h3>
                    <p className="text-primary-600 dark:text-primary-400">{cert.issuer}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">{cert.date}</p>
                    {cert.link && (
                      <a 
                        href={`https://${cert.link}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary-600 dark:text-primary-400 hover:underline text-sm mt-2 inline-block"
                      >
                        View Certificate
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Education Section */}
        {activeSection === 'education' && (
          <section className="fade-in space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <GraduationCap size={24} />
                Education
              </h2>
              <div className="space-y-8">
                {resumeData.education.map((edu) => (
                  <div key={edu.id} className="border-l-4 border-primary-500 pl-4 py-1">
                    <h3 className="text-xl font-semibold">{edu.institution}</h3>
                    <p className="text-lg text-primary-600 dark:text-primary-400">{edu.degree} in {edu.field}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">{edu.startDate} - {edu.endDate}</p>
                    {edu.gpa && (
                      <p className="text-gray-700 dark:text-gray-300 mt-1">GPA: {edu.gpa}</p>
                    )}
                    <p className="mt-2 text-gray-700 dark:text-gray-300">{edu.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Skills Section */}
        {activeSection === 'skills' && (
          <section className="fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Zap size={24} />
                Skills
              </h2>

              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Technical Skills</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {resumeData.skills
                      .filter(skill => skill.category === 'technical')
                      .map((skill) => (
                        <div key={skill.id} className="flex items-center">
                          <div className="w-1/3">
                            <span className="font-medium">{skill.name}</span>
                          </div>
                          <div className="w-2/3 pl-2">
                            <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                              <div 
                                className="bg-primary-500 h-2.5 rounded-full" 
                                style={{ width: `${skill.level * 20}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Soft Skills</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {resumeData.skills
                      .filter(skill => skill.category === 'soft')
                      .map((skill) => (
                        <div key={skill.id} className="flex items-center">
                          <div className="w-1/3">
                            <span className="font-medium">{skill.name}</span>
                          </div>
                          <div className="w-2/3 pl-2">
                            <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                              <div 
                                className="bg-secondary-500 h-2.5 rounded-full" 
                                style={{ width: `${skill.level * 20}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Languages</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {resumeData.skills
                      .filter(skill => skill.category === 'language')
                      .map((skill) => (
                        <div key={skill.id} className="flex items-center">
                          <div className="w-1/3">
                            <span className="font-medium">{skill.name}</span>
                          </div>
                          <div className="w-2/3 pl-2">
                            <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                              <div 
                                className="bg-green-500 h-2.5 rounded-full" 
                                style={{ width: `${skill.level * 20}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <button 
                  onClick={() => openModal('skills')}
                  className="btn btn-primary"
                >
                  View Skill Analysis
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Projects Section */}
        {activeSection === 'projects' && (
          <section className="fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Code size={24} />
                Projects
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {resumeData.projects.map((project) => (
                  <div key={project.id} className="card">
                    <h3 className="text-xl font-semibold">{project.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-500">{project.startDate} - {project.endDate}</p>
                    <p className="mt-2 text-gray-700 dark:text-gray-300">{project.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mt-3">
                      {project.techStack.map((tech, index) => (
                        <span key={index} className="badge badge-info">{tech}</span>
                      ))}
                    </div>
                    
                    <div className="mt-4 flex flex-wrap gap-3">
                      <button 
                        onClick={() => {
                          setCurrentProject(resumeData.projects.findIndex(p => p.id === project.id));
                          openModal('projectDemo');
                        }}
                        className="btn btn-primary"
                      >
                        View Demo
                      </button>
                      
                      {project.link && (
                        <a 
                          href={`https://${project.link}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn btn-secondary"
                        >
                          Live Demo
                        </a>
                      )}
                      
                      {project.githubLink && (
                        <a 
                          href={`https://${project.githubLink}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn btn-outline flex items-center gap-1"
                        >
                          <Github size={16} /> GitHub
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
      <footer className="bg-white dark:bg-gray-800 shadow-inner py-6 mt-8">
        <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-400 text-sm">
          <p>Copyright © 2025 of Datavtar Private Limited. All rights reserved.</p>
        </div>
      </footer>

      {/* Modals */}
      {isModalOpen && (
        <div className="modal-backdrop fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div ref={modalRef} className="modal-content bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-auto">
            <div className="modal-header flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {modalType === 'pdfUpload' && 'Upload Resume'}
                {modalType === 'projectDemo' && resumeData.projects[currentProject]?.name}
                {modalType === 'experience' && resumeData.experience[currentExp]?.company}
                {modalType === 'skills' && 'Skill Analysis'}
              </h3>
              <button 
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                aria-label="Close modal"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6">
              {/* PDF Upload Modal */}
              {modalType === 'pdfUpload' && (
                <div>
                  <p className="mb-4 text-gray-700 dark:text-gray-300">
                    Upload your resume in PDF or DOC format to automatically populate your profile information.
                  </p>
                  
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center mb-4">
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept=".pdf,.doc,.docx"
                      onChange={handleResumeUpload}
                    />
                    <FileText size={48} className="mx-auto mb-4 text-gray-400" />
                    <p className="mb-2 text-gray-700 dark:text-gray-300">Drag and drop your resume or</p>
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="btn btn-primary"
                    >
                      Browse Files
                    </button>
                  </div>
                  
                  <div className="mt-6">
                    <h4 className="text-lg font-medium mb-2">Don't have a resume yet?</h4>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      Download our template to get started and then upload it when you're done.
                    </p>
                    <button 
                      onClick={downloadResumeTemplate} 
                      className="btn btn-secondary flex items-center gap-2"
                    >
                      <Download size={16} /> Download Template
                    </button>
                  </div>
                </div>
              )}
              
              {/* Project Demo Modal */}
              {modalType === 'projectDemo' && resumeData.projects[currentProject] && (
                <div className="space-y-6">
                  <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                    <h4 className="text-lg font-medium mb-2">Project Overview</h4>
                    <p className="text-gray-700 dark:text-gray-300">
                      {resumeData.projects[currentProject].description}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-medium mb-2">Technology Stack</h4>
                    <div className="flex flex-wrap gap-2">
                      {resumeData.projects[currentProject].techStack.map((tech, index) => (
                        <span key={index} className="badge badge-info">{tech}</span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-medium mb-3">Project Timeline</h4>
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <span>{resumeData.projects[currentProject].startDate}</span>
                      <span>→</span>
                      <span>{resumeData.projects[currentProject].endDate}</span>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h4 className="text-lg font-medium mb-3">Project Demo</h4>
                    
                    {/* Interactive demo area - would be customized per project in a real app */}
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <h5 className="text-md font-medium mb-3">User Growth Over Time</h5>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={productGrowthData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Line 
                              type="monotone" 
                              dataKey="users" 
                              stroke="#8884d8" 
                              activeDot={{ r: 8 }}
                              name="Users"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <h5 className="text-md font-medium mb-3">Feature Usage</h5>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={featureUsageData}
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                nameKey="name"
                                label
                              >
                                {featureUsageData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                      
                      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <h5 className="text-md font-medium mb-3">User Retention</h5>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={userRetentionData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip />
                              <Bar 
                                dataKey="retention" 
                                fill="#00C49F"
                                name="Retention %"
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between mt-6">
                    <button 
                      onClick={goToPrevProject} 
                      className="btn btn-outline flex items-center gap-1"
                      disabled={currentProject === 0}
                    >
                      <ArrowLeft size={16} /> Previous Project
                    </button>
                    <button 
                      onClick={goToNextProject} 
                      className="btn btn-outline flex items-center gap-1"
                      disabled={currentProject === resumeData.projects.length - 1}
                    >
                      Next Project <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}
              
              {/* Experience Detail Modal */}
              {modalType === 'experience' && resumeData.experience[currentExp] && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xl font-semibold text-primary-600 dark:text-primary-400">
                      {resumeData.experience[currentExp].position}
                    </h4>
                    <p className="text-lg font-medium">{resumeData.experience[currentExp].company}</p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {resumeData.experience[currentExp].startDate} - {resumeData.experience[currentExp].endDate}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-medium mb-2">Description</h4>
                    <p className="text-gray-700 dark:text-gray-300">
                      {resumeData.experience[currentExp].description}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-medium mb-2">Key Achievements</h4>
                    <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300">
                      {resumeData.experience[currentExp].achievements.map((achievement, index) => (
                        <li key={index}>{achievement}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-medium mb-2">Technology & Tools</h4>
                    <div className="flex flex-wrap gap-2">
                      {resumeData.experience[currentExp].techStack.map((tech, index) => (
                        <span key={index} className="badge badge-info">{tech}</span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h4 className="text-lg font-medium mb-3">Impact</h4>
                    
                    {/* This would be customized per experience in a real app */}
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <h5 className="text-md font-medium mb-3">KPI Improvements</h5>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={[
                            { name: 'User Engagement', before: 65, after: 100 },
                            { name: 'Time-to-Market', before: 100, after: 60 },
                            { name: 'Revenue Growth', before: 70, after: 95 },
                            { name: 'Customer Retention', before: 75, after: 100 },
                          ]}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="before" fill="#8884d8" name="Before" />
                            <Bar dataKey="after" fill="#82ca9d" name="After" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between mt-6">
                    <button 
                      onClick={goToPrevExperience} 
                      className="btn btn-outline flex items-center gap-1"
                      disabled={currentExp === 0}
                    >
                      <ArrowLeft size={16} /> Previous Role
                    </button>
                    <button 
                      onClick={goToNextExperience} 
                      className="btn btn-outline flex items-center gap-1"
                      disabled={currentExp === resumeData.experience.length - 1}
                    >
                      Next Role <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}
              
              {/* Skills Analysis Modal */}
              {modalType === 'skills' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-medium mb-3">Technical Skills Analysis</h4>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart 
                          data={resumeData.skills
                            .filter(skill => skill.category === 'technical')
                            .map(skill => ({ name: skill.name, value: skill.level }))}
                          layout="vertical"
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" domain={[0, 5]} />
                          <YAxis dataKey="name" type="category" width={150} />
                          <Tooltip />
                          <Bar dataKey="value" fill="#8884d8" name="Skill Level (1-5)" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-lg font-medium mb-3">Soft Skills</h4>
                      <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart 
                            data={resumeData.skills
                              .filter(skill => skill.category === 'soft')
                              .map(skill => ({ name: skill.name, value: skill.level }))}
                            layout="vertical"
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" domain={[0, 5]} />
                            <YAxis dataKey="name" type="category" width={120} />
                            <Tooltip />
                            <Bar dataKey="value" fill="#82ca9d" name="Skill Level (1-5)" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-medium mb-3">Languages</h4>
                      <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart 
                            data={resumeData.skills
                              .filter(skill => skill.category === 'language')
                              .map(skill => ({ name: skill.name, value: skill.level }))}
                            layout="vertical"
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" domain={[0, 5]} />
                            <YAxis dataKey="name" type="category" width={120} />
                            <Tooltip />
                            <Bar dataKey="value" fill="#FF8042" name="Skill Level (1-5)" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-medium mb-3">Technical vs. Non-Technical Split</h4>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Technical', value: resumeData.skills.filter(s => s.category === 'technical').length },
                              { name: 'Soft Skills', value: resumeData.skills.filter(s => s.category === 'soft').length },
                              { name: 'Languages', value: resumeData.skills.filter(s => s.category === 'language').length },
                            ]}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label
                          >
                            <Cell fill="#8884d8" />
                            <Cell fill="#82ca9d" />
                            <Cell fill="#FF8042" />
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="modal-footer border-t border-gray-200 dark:border-gray-700 p-6">
              <button onClick={closeModal} className="btn btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
