import React, { useState, useEffect, useRef, ChangeEvent, FormEvent } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import styles from './styles/styles.module.css';
import { User, Download, Upload, FileText, ChevronRight, ChevronLeft, Menu, X, Moon, Sun, Laptop, GraduationCap, Briefcase, Award, Github, Linkedin, Mail, Phone, MapPin, Calendar, Globe, Star, Search, ArrowRight, MessageCircle, FileImage, Play, Pause } from 'lucide-react';

// Types & Interfaces
type Theme = 'light' | 'dark' | 'system';

interface ResumeData {
  personalInfo: PersonalInfo;
  education: EducationItem[];
  experience: ExperienceItem[];
  skills: SkillCategory[];
  projects: ProjectItem[];
  certifications: CertificationItem[];
  portfolio: PortfolioItem[];
}

interface PersonalInfo {
  name: string;
  title: string;
  summary: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  github: string;
  avatar?: string;
}

interface EducationItem {
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  description: string;
  location: string;
}

interface ExperienceItem {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
  achievements: string[];
  technologies: string[];
  location: string;
}

interface SkillCategory {
  category: string;
  skills: string[];
}

interface ProjectItem {
  name: string;
  description: string;
  technologies: string[];
  link: string;
  image?: string;
  demoUrl?: string;
}

interface CertificationItem {
  name: string;
  issuer: string;
  date: string;
  link: string;
}

interface PortfolioItem {
  title: string;
  description: string;
  type: 'image' | 'video' | 'interactive';
  media: string;
  technologies: string[];
  date: string;
}

// Default data
const defaultResumeData: ResumeData = {
  personalInfo: {
    name: 'Alex Morgan',
    title: 'Senior Product Manager',
    summary: 'Experienced Product Manager with 8+ years of experience leading cross-functional teams to deliver innovative products. Skilled in product strategy, market research, and user-centered design.',
    email: 'alex.morgan@example.com',
    phone: '(555) 123-4567',
    location: 'San Francisco, CA',
    website: 'www.alexmorgan.dev',
    linkedin: 'linkedin.com/in/alexmorgan',
    github: 'github.com/alexmorgan',
    avatar: '',
  },
  education: [
    {
      institution: 'Stanford University',
      degree: 'Master of Business Administration',
      field: 'Product Management & Innovation',
      startDate: '2012-09-01',
      endDate: '2014-06-30',
      description: 'Focused on product strategy and innovation. Completed capstone project on emerging tech adoption in enterprise.',
      location: 'Stanford, CA',
    },
    {
      institution: 'University of California, Berkeley',
      degree: 'Bachelor of Science',
      field: 'Computer Science',
      startDate: '2008-09-01',
      endDate: '2012-05-30',
      description: 'Graduated with honors. Specialized in Human-Computer Interaction.',
      location: 'Berkeley, CA',
    },
  ],
  experience: [
    {
      company: 'TechNova',
      position: 'Senior Product Manager',
      startDate: '2020-03-01',
      endDate: 'Present',
      description: 'Leading product strategy and execution for the company\'s flagship SaaS platform. Managing a cross-functional team of designers, engineers, and marketers to deliver innovative features.',
      achievements: [
        'Increased user engagement by 35% through redesign of core features',
        'Led the launch of 3 major product initiatives that generated $2.5M in new ARR',
        'Implemented agile methodologies that reduced development cycle by 40%',
      ],
      technologies: ['Jira', 'Figma', 'Amplitude', 'SQL', 'Tableau'],
      location: 'San Francisco, CA',
    },
    {
      company: 'GrowthLabs',
      position: 'Product Manager',
      startDate: '2017-06-01',
      endDate: '2020-02-28',
      description: 'Managed the development of a B2B analytics platform from concept to launch. Collaborated with stakeholders to gather requirements and translate them into product features.',
      achievements: [
        'Drove user acquisition from 0 to 10,000 in first year post-launch',
        'Established product-market fit through extensive customer research and prototyping',
        'Reduced churn by 15% by implementing customer feedback loops',
      ],
      technologies: ['Mixpanel', 'Sketch', 'Python', 'Google Analytics'],
      location: 'Oakland, CA',
    },
    {
      company: 'InnovateTech',
      position: 'Associate Product Manager',
      startDate: '2014-08-01',
      endDate: '2017-05-30',
      description: 'Assisted in the development of mobile applications for enterprise clients. Conducted market research and competitive analysis to inform product roadmap.',
      achievements: [
        'Contributed to products that served over 500,000 users',
        'Designed and implemented A/B testing framework that improved conversion by 25%',
        'Led usability studies with over 200 participants',
      ],
      technologies: ['InVision', 'UserTesting', 'Excel', 'Trello'],
      location: 'San Jose, CA',
    },
  ],
  skills: [
    {
      category: 'Product Management',
      skills: ['Product Strategy', 'Roadmap Planning', 'User Research', 'Agile Methodologies', 'A/B Testing', 'Go-to-Market Strategy'],
    },
    {
      category: 'Technical',
      skills: ['SQL', 'Python', 'Data Analysis', 'API Design', 'Web Analytics', 'Basic Front-end Development'],
    },
    {
      category: 'Tools',
      skills: ['Jira', 'Figma', 'Amplitude', 'Tableau', 'Mixpanel', 'Google Analytics', 'Excel', 'Miro'],
    },
    {
      category: 'Soft Skills',
      skills: ['Leadership', 'Cross-functional Collaboration', 'Stakeholder Management', 'Presentation', 'Communication', 'Problem Solving'],
    },
  ],
  projects: [
    {
      name: 'Enterprise Analytics Platform',
      description: 'Led the development of a comprehensive analytics solution for enterprise customers that provides real-time insights into business operations.',
      technologies: ['SQL', 'Tableau', 'Python', 'React'],
      link: 'https://example.com/project1',
      image: '',
      demoUrl: 'https://demo.example.com/analytics',
    },
    {
      name: 'Mobile Customer Portal',
      description: 'Redesigned the customer portal mobile experience, improving user satisfaction scores by 40% and increasing mobile usage by 65%.',
      technologies: ['Figma', 'React Native', 'Firebase'],
      link: 'https://example.com/project2',
      image: '',
    },
    {
      name: 'Product Lifecycle Management Tool',
      description: 'Conceptualized and launched an internal tool for tracking product development from ideation to retirement, adopted by 5 teams across the organization.',
      technologies: ['JavaScript', 'Node.js', 'MongoDB'],
      link: 'https://example.com/project3',
      image: '',
    },
  ],
  certifications: [
    {
      name: 'Certified Scrum Product Owner (CSPO)',
      issuer: 'Scrum Alliance',
      date: '2019-05-15',
      link: 'https://www.scrumalliance.org/certifications/practitioners/cspo-certification',
    },
    {
      name: 'Product Management Certification',
      issuer: 'Product School',
      date: '2018-02-10',
      link: 'https://productschool.com/product-management-certification/',
    },
    {
      name: 'Google Analytics Individual Qualification',
      issuer: 'Google',
      date: '2017-11-05',
      link: 'https://analytics.google.com/analytics/academy/',
    },
  ],
  portfolio: [
    {
      title: 'Enterprise Dashboard Redesign',
      description: 'Complete redesign of the enterprise customer dashboard, focusing on usability and data visualization.',
      type: 'image',
      media: 'https://via.placeholder.com/800x600?text=Dashboard+Redesign',
      technologies: ['Figma', 'React', 'D3.js'],
      date: '2022-03-15',
    },
    {
      title: 'Product Demo: Analytics Platform',
      description: 'Walkthrough of the key features of our analytics platform with real-world use cases.',
      type: 'video',
      media: 'https://example.com/demo-video.mp4',
      technologies: ['Tableau', 'SQL', 'Python'],
      date: '2021-11-10',
    },
    {
      title: 'Interactive User Journey Map',
      description: 'An interactive visualization of the customer journey, highlighting touchpoints and pain points.',
      type: 'interactive',
      media: 'https://example.com/journey-map',
      technologies: ['JavaScript', 'HTML/CSS', 'SVG'],
      date: '2021-07-22',
    },
  ],
};

// Generate chart data from resume
const generateSkillsChartData = (skills: SkillCategory[]) => {
  return skills.flatMap(category => 
    category.skills.map(skill => ({
      category: category.category,
      skill,
      value: Math.floor(Math.random() * 50) + 50, // Random value between 50-100 for demo
    }))
  ).slice(0, 10); // Limit to top 10 skills for readability
};

const generateExperienceTimelineData = (experience: ExperienceItem[]) => {
  return experience.map(exp => {
    const startDate = new Date(exp.startDate);
    const endDate = exp.endDate === 'Present' ? new Date() : new Date(exp.endDate);
    const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                   endDate.getMonth() - startDate.getMonth();
    
    return {
      company: exp.company,
      position: exp.position,
      duration: months,
      achievements: exp.achievements.length,
    };
  });
};

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>('system');
  const [resumeData, setResumeData] = useState<ResumeData>(defaultResumeData);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string>('');
  const [activeSection, setActiveSection] = useState<string>('profile');
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [skillsChartData, setSkillsChartData] = useState<any[]>([]);
  const [experienceTimelineData, setExperienceTimelineData] = useState<any[]>([]);
  const [portfolioIndex, setPortfolioIndex] = useState<number>(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(false);
  const [showContactModal, setShowContactModal] = useState<boolean>(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [contactStatus, setContactStatus] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Initialize theme from system preference or localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
  }, []);

  // Apply theme when it changes
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Initialize data from localStorage or defaults
  useEffect(() => {
    const storedData = localStorage.getItem('resumeData');
    if (storedData) {
      try {
        setResumeData(JSON.parse(storedData));
      } catch (e) {
        console.error('Failed to parse stored resume data', e);
        setResumeData(defaultResumeData);
      }
    }
  }, []);

  // Generate chart data whenever resume data changes
  useEffect(() => {
    setSkillsChartData(generateSkillsChartData(resumeData.skills));
    setExperienceTimelineData(generateExperienceTimelineData(resumeData.experience));
    
    // Save to localStorage whenever data changes
    localStorage.setItem('resumeData', JSON.stringify(resumeData));
  }, [resumeData]);

  // Close modal when Escape key is pressed
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowContactModal(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Handle click outside modal to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowContactModal(false);
      }
    };

    if (showContactModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showContactModal]);

  // Toggle video play/pause
  const toggleVideo = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  };

  // Handle file upload
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setResumeFile(file);
    setUploadError('');
  };

  const handleUpload = async () => {
    if (!resumeFile) {
      setUploadError('Please select a file first');
      return;
    }

    setIsUploading(true);
    setUploadError('');

    try {
      // In a real app, we would upload the file to a server
      // For this demo, we'll simulate parsing a resume
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Instead of a real API call, we'll just use our default data
      // In a real app, this would come from parsing the uploaded resume
      setResumeData(prev => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          avatar: URL.createObjectURL(resumeFile),
        },
      }));

      setResumeFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      setUploadError('Failed to process resume');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  // Download resume template
  const downloadTemplate = () => {
    // In a real app, this would download an actual template file
    // For this demo, we'll create a JSON file with our current data structure
    const dataStr = JSON.stringify(resumeData, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const link = document.createElement('a');
    link.setAttribute('href', dataUri);
    link.setAttribute('download', 'resume_template.json');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Navigate to next/previous portfolio item
  const navigatePortfolio = (direction: 'next' | 'prev') => {
    if (direction === 'next') {
      setPortfolioIndex((prevIndex) => 
        prevIndex === resumeData.portfolio.length - 1 ? 0 : prevIndex + 1
      );
    } else {
      setPortfolioIndex((prevIndex) => 
        prevIndex === 0 ? resumeData.portfolio.length - 1 : prevIndex - 1
      );
    }
    // Reset video state when changing items
    setIsVideoPlaying(false);
  };

  // Contact form handling
  const handleContactChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContactForm(prev => ({ ...prev, [name]: value }));
  };

  const handleContactSubmit = (e: FormEvent) => {
    e.preventDefault();
    setContactStatus('sending');
    
    // Simulate API call
    setTimeout(() => {
      setContactStatus('success');
      setContactForm({ name: '', email: '', message: '' });
      
      // Close modal after success message
      setTimeout(() => {
        setShowContactModal(false);
        setContactStatus('');
      }, 2000);
    }, 1500);
  };

  // Color palette based on theme
  const getThemeColors = () => {
    return theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
      ? {
          primary: '#6366f1',
          secondary: '#8b5cf6',
          text: '#f3f4f6',
          background: '#1f2937',
          chartColors: ['#6366f1', '#8b5cf6', '#ec4899', '#f97316', '#14b8a6'],
        }
      : {
          primary: '#4f46e5',
          secondary: '#7c3aed',
          text: '#1f2937',
          background: '#ffffff',
          chartColors: ['#4f46e5', '#7c3aed', '#ec4899', '#f97316', '#14b8a6'],
        };
  };

  const colors = getThemeColors();

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 theme-transition-all">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 shadow">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <button 
                className="md:hidden btn-responsive p-2"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle menu"
              >
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                {resumeData.personalInfo.name} <span className="text-gray-600 dark:text-gray-400 text-lg font-normal">| {resumeData.personalInfo.title}</span>
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-1">
                <button 
                  className={`btn-sm ${activeSection === 'profile' ? 'btn-primary' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                  onClick={() => setActiveSection('profile')}
                >
                  Profile
                </button>
                <button 
                  className={`btn-sm ${activeSection === 'experience' ? 'btn-primary' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                  onClick={() => setActiveSection('experience')}
                >
                  Experience
                </button>
                <button 
                  className={`btn-sm ${activeSection === 'skills' ? 'btn-primary' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                  onClick={() => setActiveSection('skills')}
                >
                  Skills
                </button>
                <button 
                  className={`btn-sm ${activeSection === 'portfolio' ? 'btn-primary' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                  onClick={() => setActiveSection('portfolio')}
                >
                  Portfolio
                </button>
              </div>
              
              <button 
                onClick={() => setShowContactModal(true)}
                className="btn-sm btn-primary hidden md:inline-flex">
                <Mail size={16} className="mr-1" /> Contact Me
              </button>
              
              <div className="flex items-center space-x-1 p-1 bg-gray-100 dark:bg-gray-700 rounded-md">
                <button 
                  onClick={() => setTheme('light')}
                  className={`p-1.5 rounded ${theme === 'light' ? 'bg-white dark:bg-gray-600 shadow' : 'text-gray-400'}`}
                  aria-label="Light mode"
                >
                  <Sun size={16} />
                </button>
                <button 
                  onClick={() => setTheme('system')}
                  className={`p-1.5 rounded ${theme === 'system' ? 'bg-white dark:bg-gray-600 shadow' : 'text-gray-400'}`}
                  aria-label="System preference"
                >
                  <Laptop size={16} />
                </button>
                <button 
                  onClick={() => setTheme('dark')}
                  className={`p-1.5 rounded ${theme === 'dark' ? 'bg-white dark:bg-gray-600 shadow' : 'text-gray-400'}`}
                  aria-label="Dark mode"
                >
                  <Moon size={16} />
                </button>
              </div>
            </div>
          </div>
        </header>
        
        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-800 shadow-lg">
            <div className="container mx-auto px-4 py-2 space-y-2">
              <button 
                className={`btn w-full text-left ${activeSection === 'profile' ? 'btn-primary' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                onClick={() => {
                  setActiveSection('profile');
                  setMenuOpen(false);
                }}
              >
                Profile
              </button>
              <button 
                className={`btn w-full text-left ${activeSection === 'experience' ? 'btn-primary' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                onClick={() => {
                  setActiveSection('experience');
                  setMenuOpen(false);
                }}
              >
                Experience
              </button>
              <button 
                className={`btn w-full text-left ${activeSection === 'skills' ? 'btn-primary' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                onClick={() => {
                  setActiveSection('skills');
                  setMenuOpen(false);
                }}
              >
                Skills
              </button>
              <button 
                className={`btn w-full text-left ${activeSection === 'portfolio' ? 'btn-primary' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                onClick={() => {
                  setActiveSection('portfolio');
                  setMenuOpen(false);
                }}
              >
                Portfolio
              </button>
              <button 
                onClick={() => {
                  setShowContactModal(true);
                  setMenuOpen(false);
                }}
                className="btn w-full btn-primary flex items-center justify-center">
                <Mail size={16} className="mr-1" /> Contact Me
              </button>
            </div>
          </div>
        )}
        
        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          {/* Upload Resume Area */}
          <div className="card mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-bold mb-2">Interactive Resume Experience</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Upload your resume to personalize this experience or explore my professional journey.
                </p>
              </div>
              
              <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={downloadTemplate}
                  className="btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600 flex items-center justify-center"
                >
                  <Download size={16} className="mr-1" /> Template
                </button>
                
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.json"
                      className="hidden"
                      id="resume-upload"
                    />
                    <label 
                      htmlFor="resume-upload"
                      className="btn bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center cursor-pointer"
                    >
                      <FileText size={16} className="mr-1" /> Select File
                    </label>
                  </div>
                  
                  <button 
                    onClick={handleUpload}
                    disabled={isUploading || !resumeFile}
                    className="btn btn-primary flex items-center justify-center"
                  >
                    {isUploading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Uploading...
                      </span>
                    ) : (
                      <>
                        <Upload size={16} className="mr-1" /> Upload
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
            
            {resumeFile && (
              <div className="mt-2 flex items-center text-sm text-gray-600 dark:text-gray-400">
                <FileText size={16} className="mr-1" /> {resumeFile.name}
              </div>
            )}
            
            {uploadError && (
              <div className="mt-2 text-sm text-red-600 dark:text-red-400">
                {uploadError}
              </div>
            )}
          </div>
          
          {/* Active Section Content */}
          <div className="mb-8">
            {activeSection === 'profile' && (
              <div className="space-y-6">
                {/* Profile Header */}
                <div className="card">
                  <div className="flex flex-col md:flex-row md:items-center gap-6">
                    <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      {resumeData.personalInfo.avatar ? (
                        <img 
                          src={resumeData.personalInfo.avatar} 
                          alt={resumeData.personalInfo.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User size={64} className="text-gray-400" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold">{resumeData.personalInfo.name}</h2>
                      <h3 className="text-xl text-indigo-600 dark:text-indigo-400 font-medium mb-2">{resumeData.personalInfo.title}</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-8 text-sm">
                        <div className="flex items-center">
                          <Mail size={16} className="mr-2 text-gray-600 dark:text-gray-400" />
                          <span>{resumeData.personalInfo.email}</span>
                        </div>
                        <div className="flex items-center">
                          <Phone size={16} className="mr-2 text-gray-600 dark:text-gray-400" />
                          <span>{resumeData.personalInfo.phone}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin size={16} className="mr-2 text-gray-600 dark:text-gray-400" />
                          <span>{resumeData.personalInfo.location}</span>
                        </div>
                        <div className="flex items-center">
                          <Globe size={16} className="mr-2 text-gray-600 dark:text-gray-400" />
                          <span>{resumeData.personalInfo.website}</span>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex space-x-3">
                        <a 
                          href={`https://${resumeData.personalInfo.linkedin}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
                        >
                          <Linkedin size={18} className="mr-1" /> LinkedIn
                        </a>
                        <a 
                          href={`https://${resumeData.personalInfo.github}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white flex items-center"
                        >
                          <Github size={18} className="mr-1" /> GitHub
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Professional Summary */}
                <div className="card">
                  <h3 className="text-xl font-bold mb-4">Professional Summary</h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    {resumeData.personalInfo.summary}
                  </p>
                </div>
                
                {/* Education */}
                <div className="card">
                  <h3 className="text-xl font-bold mb-4">Education</h3>
                  <div className="space-y-6">
                    {resumeData.education.map((edu, index) => (
                      <div key={index} className="flex flex-col md:flex-row">
                        <div className="md:w-1/4 flex flex-col mb-2 md:mb-0">
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-1">
                            <Calendar size={14} className="mr-1" />
                            <span>{new Date(edu.startDate).getFullYear()} - {edu.endDate === 'Present' ? 'Present' : new Date(edu.endDate).getFullYear()}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <MapPin size={14} className="mr-1" />
                            <span>{edu.location}</span>
                          </div>
                        </div>
                        
                        <div className="md:w-3/4">
                          <h4 className="text-lg font-medium">{edu.institution}</h4>
                          <p className="text-indigo-600 dark:text-indigo-400">{edu.degree} in {edu.field}</p>
                          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                            {edu.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Certifications */}
                <div className="card">
                  <h3 className="text-xl font-bold mb-4">Certifications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {resumeData.certifications.map((cert, index) => (
                      <div key={index} className="border dark:border-gray-700 rounded-lg p-4 hover:shadow-md dark:hover:bg-gray-800 transition-all">
                        <h4 className="font-medium text-indigo-600 dark:text-indigo-400">{cert.name}</h4>
                        <div className="flex justify-between items-center mt-2 text-sm">
                          <span className="text-gray-600 dark:text-gray-400">{cert.issuer}</span>
                          <span className="text-gray-600 dark:text-gray-400">{new Date(cert.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}</span>
                        </div>
                        <div className="mt-3">
                          <a 
                            href={cert.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
                          >
                            View Certificate <ArrowRight size={14} className="ml-1" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {activeSection === 'experience' && (
              <div className="space-y-6">
                {/* Experience Visualization */}
                <div className="card">
                  <h3 className="text-xl font-bold mb-4">Career Timeline</h3>
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={experienceTimelineData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="company" />
                        <YAxis label={{ value: 'Months', angle: -90, position: 'insideLeft' }} />
                        <Tooltip />
                        <Area 
                          type="monotone" 
                          dataKey="duration" 
                          name="Duration (months)" 
                          stroke={colors.primary} 
                          fill={colors.primary} 
                          fillOpacity={0.3} 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                {/* Experience Details */}
                <div className="card">
                  <h3 className="text-xl font-bold mb-4">Work Experience</h3>
                  <div className="space-y-8">
                    {resumeData.experience.map((exp, index) => (
                      <div key={index} className="pb-6 border-b dark:border-gray-700 last:border-0 last:pb-0">
                        <div className="flex flex-col md:flex-row gap-4">
                          <div className="md:w-1/4">
                            <h4 className="font-bold text-lg">{exp.company}</h4>
                            <p className="text-indigo-600 dark:text-indigo-400 font-medium">{exp.position}</p>
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-1 mt-2">
                              <Calendar size={14} className="mr-1" />
                              <span>
                                {new Date(exp.startDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })} - 
                                {exp.endDate === 'Present' ? 'Present' : new Date(exp.endDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}
                              </span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                              <MapPin size={14} className="mr-1" />
                              <span>{exp.location}</span>
                            </div>
                          </div>
                          
                          <div className="md:w-3/4">
                            <p className="text-gray-700 dark:text-gray-300 mb-4">
                              {exp.description}
                            </p>
                            
                            <h5 className="font-medium mb-2">Key Achievements:</h5>
                            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1 ml-1 mb-4">
                              {exp.achievements.map((achievement, aIndex) => (
                                <li key={aIndex}>{achievement}</li>
                              ))}
                            </ul>
                            
                            <div className="flex flex-wrap gap-2">
                              {exp.technologies.map((tech, tIndex) => (
                                <span 
                                  key={tIndex} 
                                  className="badge badge-primary"
                                >
                                  {tech}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Projects */}
                <div className="card">
                  <h3 className="text-xl font-bold mb-4">Key Projects</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {resumeData.projects.map((project, index) => (
                      <div key={index} className="border dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-all">
                        <div className="h-40 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          {project.image ? (
                            <img 
                              src={project.image} 
                              alt={project.name} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <FileImage size={48} className="text-gray-400" />
                          )}
                        </div>
                        
                        <div className="p-4">
                          <h4 className="font-bold text-lg">{project.name}</h4>
                          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                            {project.description}
                          </p>
                          
                          <div className="mt-3 flex flex-wrap gap-2">
                            {project.technologies.slice(0, 3).map((tech, tIndex) => (
                              <span 
                                key={tIndex} 
                                className="badge badge-primary"
                              >
                                {tech}
                              </span>
                            ))}
                            {project.technologies.length > 3 && (
                              <span className="badge badge-secondary">+{project.technologies.length - 3}</span>
                            )}
                          </div>
                          
                          <div className="mt-4 flex space-x-3">
                            <a 
                              href={project.link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center"
                            >
                              View Project <ArrowRight size={14} className="ml-1" />
                            </a>
                            
                            {project.demoUrl && (
                              <a 
                                href={project.demoUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sm text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 flex items-center"
                              >
                                Live Demo <ArrowRight size={14} className="ml-1" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {activeSection === 'skills' && (
              <div className="space-y-6">
                {/* Skills Visualization */}
                <div className="card">
                  <h3 className="text-xl font-bold mb-4">Skills Analysis</h3>
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={skillsChartData} layout="vertical" margin={{ top: 10, right: 30, left: 120, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" domain={[0, 100]} />
                        <YAxis 
                          type="category" 
                          dataKey="skill" 
                          width={100} 
                          tickFormatter={(value) => value.length > 15 ? `${value.slice(0, 15)}...` : value} 
                        />
                        <Tooltip />
                        <Legend />
                        <Bar 
                          dataKey="value" 
                          name="Proficiency" 
                          fill={colors.primary} 
                          radius={[0, 4, 4, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                {/* Skills Categories */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {resumeData.skills.map((category, index) => (
                    <div key={index} className="card">
                      <h3 className="text-lg font-bold mb-4">{category.category}</h3>
                      <div className="flex flex-wrap gap-2">
                        {category.skills.map((skill, sIndex) => (
                          <span 
                            key={sIndex} 
                            className={`badge ${index % 4 === 0 ? 'badge-primary' : 
                                         index % 4 === 1 ? 'badge-secondary' : 
                                         index % 4 === 2 ? 'badge-success' : 'badge-info'}`}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Skill Distribution */}
                <div className="card">
                  <h3 className="text-xl font-bold mb-4">Skill Distribution</h3>
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={resumeData.skills.map((category, index) => ({
                            name: category.category,
                            value: category.skills.length,
                            color: colors.chartColors[index % colors.chartColors.length]
                          }))}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {resumeData.skills.map((category, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={colors.chartColors[index % colors.chartColors.length]} 
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
            
            {activeSection === 'portfolio' && (
              <div className="space-y-6">
                {/* Portfolio Showcase */}
                <div className="card">
                  <h3 className="text-xl font-bold mb-4">Portfolio Showcase</h3>
                  
                  {resumeData.portfolio.length > 0 && (
                    <div className="mb-4">
                      <div className="relative overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                        <div className="aspect-w-16 aspect-h-9 w-full">
                          {resumeData.portfolio[portfolioIndex].type === 'image' && (
                            <img 
                              src={resumeData.portfolio[portfolioIndex].media} 
                              alt={resumeData.portfolio[portfolioIndex].title} 
                              className="w-full h-full object-cover"
                            />
                          )}
                          
                          {resumeData.portfolio[portfolioIndex].type === 'video' && (
                            <div className="relative w-full h-full">
                              <video 
                                ref={videoRef}
                                src={resumeData.portfolio[portfolioIndex].media} 
                                className="w-full h-full object-cover"
                                poster="https://via.placeholder.com/800x450?text=Video+Preview"
                              />
                              <button 
                                onClick={toggleVideo}
                                className="absolute inset-0 m-auto w-16 h-16 flex items-center justify-center rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-all"
                                aria-label={isVideoPlaying ? 'Pause video' : 'Play video'}
                              >
                                {isVideoPlaying ? <Pause size={32} /> : <Play size={32} />}
                              </button>
                            </div>
                          )}
                          
                          {resumeData.portfolio[portfolioIndex].type === 'interactive' && (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                              <a 
                                href={resumeData.portfolio[portfolioIndex].media}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-primary"
                              >
                                View Interactive Demo
                              </a>
                            </div>
                          )}
                        </div>
                        
                        {/* Navigation Arrows */}
                        <button 
                          onClick={() => navigatePortfolio('prev')}
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700"
                          aria-label="Previous portfolio item"
                        >
                          <ChevronLeft size={20} />
                        </button>
                        
                        <button 
                          onClick={() => navigatePortfolio('next')}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700"
                          aria-label="Next portfolio item"
                        >
                          <ChevronRight size={20} />
                        </button>
                        
                        {/* Indicators */}
                        <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                          {resumeData.portfolio.map((_, index) => (
                            <button 
                              key={index}
                              onClick={() => setPortfolioIndex(index)}
                              className={`w-2.5 h-2.5 rounded-full ${index === portfolioIndex ? 'bg-white' : 'bg-white/50 dark:bg-gray-400'}`}
                              aria-label={`Go to portfolio item ${index + 1}`}
                            />
                          ))}
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <h4 className="text-lg font-bold">{resumeData.portfolio[portfolioIndex].title}</h4>
                        <p className="mt-2 text-gray-700 dark:text-gray-300">
                          {resumeData.portfolio[portfolioIndex].description}
                        </p>
                        
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex flex-wrap gap-2">
                            {resumeData.portfolio[portfolioIndex].technologies.map((tech, tIndex) => (
                              <span 
                                key={tIndex} 
                                className="badge badge-primary"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                          
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(resumeData.portfolio[portfolioIndex].date).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* All Portfolio Items */}
                <div className="card">
                  <h3 className="text-xl font-bold mb-4">All Projects</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {resumeData.portfolio.map((item, index) => (
                      <div 
                        key={index} 
                        className={`border dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-all ${portfolioIndex === index ? 'ring-2 ring-indigo-500' : ''}`}
                        onClick={() => setPortfolioIndex(index)}
                        role="button"
                        tabIndex={0}
                        aria-label={`Select ${item.title}`}
                      >
                        <div className="h-40 bg-gray-200 dark:bg-gray-700 relative">
                          {item.type === 'image' && (
                            <img 
                              src={item.media} 
                              alt={item.title} 
                              className="w-full h-full object-cover"
                            />
                          )}
                          
                          {item.type === 'video' && (
                            <div className="w-full h-full flex items-center justify-center bg-gray-800">
                              <Play size={32} className="text-white" />
                            </div>
                          )}
                          
                          {item.type === 'interactive' && (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                              <Globe size={32} className="text-gray-500 dark:text-gray-400" />
                            </div>
                          )}
                          
                          <div className="absolute top-2 right-2">
                            <span className={`badge ${item.type === 'image' ? 'badge-info' : item.type === 'video' ? 'badge-success' : 'badge-warning'}`}>
                              {item.type === 'image' ? 'Image' : item.type === 'video' ? 'Video' : 'Interactive'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="p-4">
                          <h4 className="font-medium text-lg">{item.title}</h4>
                          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
        
        {/* Contact Modal */}
        {showContactModal && (
          <div className="modal-backdrop">
            <div className="modal-content" ref={modalRef}>
              <div className="modal-header">
                <h3 id="contact-modal-title" className="text-lg font-medium text-gray-900 dark:text-white">Contact Me</h3>
                <button 
                  onClick={() => setShowContactModal(false)}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="mt-4">
                {contactStatus === 'success' ? (
                  <div className="alert alert-success">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <p>Message sent successfully! I'll get back to you soon.</p>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div className="form-group">
                      <label className="form-label" htmlFor="name">Name</label>
                      <input 
                        id="name" 
                        name="name" 
                        type="text" 
                        value={contactForm.name}
                        onChange={handleContactChange}
                        className="input" 
                        required 
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label" htmlFor="email">Email</label>
                      <input 
                        id="email" 
                        name="email" 
                        type="email" 
                        value={contactForm.email}
                        onChange={handleContactChange}
                        className="input" 
                        required 
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label" htmlFor="message">Message</label>
                      <textarea 
                        id="message" 
                        name="message" 
                        rows={4} 
                        value={contactForm.message}
                        onChange={handleContactChange}
                        className="input" 
                        required
                      />
                    </div>
                    
                    <div className="modal-footer">
                      <button 
                        type="button" 
                        className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                        onClick={() => setShowContactModal(false)}
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="btn btn-primary"
                        disabled={contactStatus === 'sending'}
                      >
                        {contactStatus === 'sending' ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Sending...
                          </span>
                        ) : 'Send Message'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Footer */}
        <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-6 mt-8">
          <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-400 text-sm">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div>
                <p>Copyright © 2025 of Datavtar Private Limited. All rights reserved.</p>
              </div>
              <div className="mt-4 md:mt-0 flex items-center space-x-4">
                <a href="#" className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                  <Linkedin size={16} />
                </a>
                <a href="#" className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                  <Github size={16} />
                </a>
                <a href="#" className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                  <Mail size={16} />
                </a>
                <button 
                  onClick={() => setShowContactModal(true)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <MessageCircle size={16} />
                </button>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;