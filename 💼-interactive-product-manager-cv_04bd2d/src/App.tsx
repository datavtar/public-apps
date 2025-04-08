import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  User,
  Award,
  ArrowRight,
  ArrowLeft,
  ArrowUp,  // Added import
  ArrowDown, // Added import
  Briefcase,
  MapPin,
  Calendar,
  ChevronDown,
  ChevronUp,
  ChartBar,
  ChartLine,
  FileText,
  Grid,
  Star,
  Code,
  Database,
  Moon,
  Sun,
  Lightbulb,
  MessageCircle,
  Check,
  X,
  Globe
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, BarChart, Bar, Legend, PieChart, Pie, Cell } from 'recharts';
import styles from './styles/styles.module.css';

type CareerSection = {
  id: string;
  company: string;
  role: string;
  period: string;
  location: string;
  description: string;
  responsibilities: string[];
  achievements: string[];
  skills: string[];
  metrics?: {
    title: string;
    value: number;
    prefix?: string;
    suffix?: string;
    trend?: 'up' | 'down' | 'neutral';
    change?: number;
  }[];
  userGrowthData?: Array<{name: string, users: number}>;
  revenueData?: Array<{name: string, revenue: number}>;
  satisfactionData?: Array<{name: string, value: number, color: string}>;
  projectCompletionData?: Array<{name: string, completed: number, inProgress: number}>;
  logo?: string;
  color: string;
  secondaryColor: string;
};

type Education = {
  id: string;
  institution: string;
  degree: string;
  period: string;
  location: string;
  description?: string;
};

type Certificate = {
  id: string;
  name: string;
  issuer: string;
  date: string;
  description?: string;
};

type LanguageSkill = {
  language: string;
  proficiency: 'Native' | 'Fluent' | 'Professional' | 'Intermediate' | 'Basic';
};

type PersonalInfo = {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  linkedin?: string;
  github?: string;
  website?: string;
  languages: LanguageSkill[];
  avatar?: string;
};

type CVData = {
  personalInfo: PersonalInfo;
  experience: CareerSection[];
  education: Education[];
  certificates: Certificate[];
  skills: string[];
};

const App: React.FC = () => {
  // Default CV Data
  const defaultCVData: CVData = {
    personalInfo: {
      name: "Jamie Sheppard",
      title: "Senior Product Manager",
      email: "jamie.sheppard@example.com",
      phone: "+1 (555) 123-4567",
      location: "San Francisco, CA",
      summary: "Innovative Product Manager with 8+ years of experience driving product strategy and execution in SaaS and e-commerce. Passionate about creating user-centric solutions that solve real problems and deliver measurable business results.",
      linkedin: "linkedin.com/in/jamiesheppard",
      github: "github.com/jamiesheppard",
      website: "jamiesheppard.com",
      languages: [
        { language: "English", proficiency: "Native" },
        { language: "Spanish", proficiency: "Professional" },
        { language: "French", proficiency: "Intermediate" }
      ],
      avatar: "https://randomuser.me/api/portraits/women/44.jpg"
    },
    experience: [
      {
        id: "exp1",
        company: "TechVision Inc.",
        role: "Senior Product Manager",
        period: "Jan 2021 - Present",
        location: "San Francisco, CA",
        description: "Leading product strategy and execution for TechVision's flagship SaaS analytics platform, driving significant user growth and revenue increase through data-driven product decisions.",
        responsibilities: [
          "Define product vision, strategy, and roadmap for the analytics platform",
          "Lead cross-functional teams through all stages of product development",
          "Gather and prioritize requirements based on customer feedback and business goals",
          "Conduct market research and competitive analysis to identify opportunities",
          "Collaborate with engineering, design, and marketing teams to ensure successful product launches"
        ],
        achievements: [
          "Increased user growth by 45% YoY through strategic feature releases",
          "Boosted customer retention by 23% by implementing a new onboarding flow",
          "Led the development and launch of 3 major product features that generated $2.5M in new ARR",
          "Reduced churn by 18% through enhanced user experience and customer feedback loops"
        ],
        skills: ["Product Strategy", "User Research", "Agile/Scrum", "Data Analytics", "A/B Testing", "Wireframing", "Competitive Analysis", "SQL", "Jira", "Product Metrics"],
        metrics: [
          { title: "User Growth", value: 45, suffix: "%", trend: "up", change: 15 },
          { title: "Retention Rate", value: 88, suffix: "%", trend: "up", change: 23 },
          { title: "New ARR", value: 2.5, prefix: "$", suffix: "M", trend: "up", change: 30 },
          { title: "Churn Reduction", value: 18, suffix: "%", trend: "down", change: 18 }
        ],
        userGrowthData: [
          { name: 'Jan', users: 4000 },
          { name: 'Feb', users: 4200 },
          { name: 'Mar', users: 4500 },
          { name: 'Apr', users: 4800 },
          { name: 'May', users: 5100 },
          { name: 'Jun', users: 5400 },
          { name: 'Jul', users: 5800 },
          { name: 'Aug', users: 6200 },
          { name: 'Sep', users: 6500 },
          { name: 'Oct', users: 6800 },
          { name: 'Nov', users: 7200 },
          { name: 'Dec', users: 7500 }
        ],
        revenueData: [
          { name: 'Q1', revenue: 1200000 },
          { name: 'Q2', revenue: 1500000 },
          { name: 'Q3', revenue: 1800000 },
          { name: 'Q4', revenue: 2200000 }
        ],
        satisfactionData: [
          { name: 'Very Satisfied', value: 45, color: '#4ade80' },
          { name: 'Satisfied', value: 30, color: '#a3e635' },
          { name: 'Neutral', value: 15, color: '#facc15' },
          { name: 'Dissatisfied', value: 7, color: '#fb923c' },
          { name: 'Very Dissatisfied', value: 3, color: '#f87171' }
        ],
        color: '#0ea5e9',
        secondaryColor: '#38bdf8'
      },
      {
        id: "exp2",
        company: "E-Commerce Giants",
        role: "Product Manager",
        period: "Mar 2018 - Dec 2020",
        location: "Seattle, WA",
        description: "Managed the product lifecycle for the company's mobile shopping application, focusing on checkout optimization and personalized recommendations.",
        responsibilities: [
          "Developed and executed the product roadmap for the mobile shopping experience",
          "Owned the checkout process, implementing improvements that increased conversion rates",
          "Led A/B testing initiatives to optimize user flows and increase engagement",
          "Collaborated with data science team to develop personalized recommendation algorithms",
          "Worked closely with UX researchers to identify pain points and opportunities"
        ],
        achievements: [
          "Redesigned checkout process, reducing cart abandonment by 22%",
          "Implemented personalized recommendations, increasing average order value by 17%",
          "Launched mobile app redesign that improved user engagement by 35%",
          "Reduced app crash rate by 75% through systematic quality improvements"
        ],
        skills: ["Mobile Product Management", "E-commerce", "A/B Testing", "User Experience", "Conversion Optimization", "Data Analysis", "Figma", "Product Roadmapping", "Stakeholder Management", "User Stories"],
        metrics: [
          { title: "Checkout Success", value: 22, suffix: "%", trend: "up", change: 22 },
          { title: "Avg Order Value", value: 17, suffix: "%", trend: "up", change: 17 },
          { title: "User Engagement", value: 35, suffix: "%", trend: "up", change: 35 },
          { title: "App Stability", value: 75, suffix: "%", trend: "up", change: 75 }
        ],
        projectCompletionData: [
          { name: 'Q1', completed: 12, inProgress: 8 },
          { name: 'Q2', completed: 18, inProgress: 6 },
          { name: 'Q3', completed: 22, inProgress: 4 },
          { name: 'Q4', completed: 25, inProgress: 3 }
        ],
        color: '#ec4899',
        secondaryColor: '#f472b6'
      },
      {
        id: "exp3",
        company: "StartupBoost",
        role: "Associate Product Manager",
        period: "Jun 2016 - Feb 2018",
        location: "Austin, TX",
        description: "Collaborated with the product team to develop and launch a cloud-based project management tool for startups, focusing on user acquisition and product-market fit.",
        responsibilities: [
          "Assisted in defining product requirements and creating user stories",
          "Conducted user interviews and usability testing sessions",
          "Analyzed user feedback and usage metrics to identify improvement areas",
          "Managed the product backlog and sprint planning",
          "Supported marketing efforts for new feature launches"
        ],
        achievements: [
          "Contributed to growing the user base from 5,000 to 50,000 in 18 months",
          "Helped achieve product-market fit through iterative development based on user feedback",
          "Implemented onboarding improvements that increased user activation by 40%",
          "Assisted in securing Series A funding of $7M based on product traction"
        ],
        skills: ["User Interviews", "Usability Testing", "Product-Market Fit", "Sprint Planning", "User Stories", "Metrics Analysis", "Trello", "Slack", "Customer Journey Mapping", "Feature Prioritization"],
        metrics: [
          { title: "User Growth", value: 900, suffix: "%", trend: "up", change: 900 },
          { title: "User Activation", value: 40, suffix: "%", trend: "up", change: 40 },
          { title: "Series A Funding", value: 7, prefix: "$", suffix: "M", trend: "up" },
          { title: "Feature Adoption", value: 65, suffix: "%", trend: "up", change: 65 }
        ],
        userGrowthData: [
          { name: 'Jan', users: 5000 },
          { name: 'Mar', users: 8000 },
          { name: 'May', users: 12000 },
          { name: 'Jul', users: 17000 },
          { name: 'Sep', users: 25000 },
          { name: 'Nov', users: 35000 },
          { name: 'Jan', users: 50000 }
        ],
        color: '#8b5cf6',
        secondaryColor: '#a78bfa'
      }
    ],
    education: [
      {
        id: "edu1",
        institution: "Stanford University",
        degree: "Master of Business Administration (MBA)",
        period: "2014 - 2016",
        location: "Stanford, CA",
        description: "Specialized in Product Management and Entrepreneurship. Participated in the Stanford Design Thinking workshop and served as VP of the Product Management Club."
      },
      {
        id: "edu2",
        institution: "University of California, Berkeley",
        degree: "Bachelor of Science in Computer Science",
        period: "2010 - 2014",
        location: "Berkeley, CA",
        description: "Minor in Business Administration. Dean's List all semesters. Participated in Hackathons and the Entrepreneurship Association."
      }
    ],
    certificates: [
      {
        id: "cert1",
        name: "Product Management Certification",
        issuer: "Product School",
        date: "2019",
        description: "Comprehensive certification covering product strategy, development lifecycle, and go-to-market strategies."
      },
      {
        id: "cert2",
        name: "Agile Scrum Master Certification",
        issuer: "Scrum Alliance",
        date: "2018",
        description: "Professional certification in Agile methodologies and Scrum framework for product development."
      },
      {
        id: "cert3",
        name: "Data Analytics for Product Managers",
        issuer: "Coursera",
        date: "2017",
        description: "Advanced course on using data analytics to drive product decisions and measure success."
      }
    ],
    skills: [
      "Product Strategy", "User Research", "Market Analysis", "Product Roadmapping", "A/B Testing",
      "User Experience Design", "Agile/Scrum", "Data Analytics", "SQL", "Figma", "Jira",
      "Stakeholder Management", "Customer Journey Mapping", "Feature Prioritization", "Product Metrics"
    ]
  };

  // States
  const [cvData, setCVData] = useState<CVData | null>(null);
  const [activeSection, setActiveSection] = useState<string>('about');
  const [currentJob, setCurrentJob] = useState<string>('exp1');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    education: false,
    certificates: false,
    skills: false
  });
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode === 'true' || 
      (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  const modalRef = useRef<HTMLDivElement>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalContent, setModalContent] = useState<{ title: string, content: string[] }>({ title: '', content: [] });

  // Load CV data from localStorage or use default
  useEffect(() => {
    const savedData = localStorage.getItem('cvData');
    if (savedData) {
      try {
        setCVData(JSON.parse(savedData));
      } catch (error) {
        console.error('Error parsing CV data:', error);
        setCVData(defaultCVData);
        localStorage.setItem('cvData', JSON.stringify(defaultCVData));
      }
    } else {
      setCVData(defaultCVData);
      localStorage.setItem('cvData', JSON.stringify(defaultCVData));
    }
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

  // Handle clicking outside modal to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowModal(false);
      }
    };

    // Handle escape key press to close modal
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowModal(false);
      }
    };

    if (showModal) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showModal]);

  const openModal = (title: string, content: string[]) => {
    setModalContent({ title, content });
    setShowModal(true);
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Format currency values
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Get current career section
  const getCurrentExperience = useCallback((): CareerSection | undefined => {
    return cvData?.experience.find(exp => exp.id === currentJob);
  }, [cvData, currentJob]);

  // Navigate between jobs
  const navigateJob = (direction: 'next' | 'prev') => {
    if (!cvData) return;
    
    const currentIndex = cvData.experience.findIndex(exp => exp.id === currentJob);
    if (currentIndex === -1) return;
    
    if (direction === 'next' && currentIndex < cvData.experience.length - 1) {
      setCurrentJob(cvData.experience[currentIndex + 1].id);
    } else if (direction === 'prev' && currentIndex > 0) {
      setCurrentJob(cvData.experience[currentIndex - 1].id);
    }
  };

  // If data is not loaded yet, show loading
  if (!cvData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-700 dark:text-gray-300">Loading CV data...</p>
        </div>
      </div>
    );
  }

  const currentExperience = getCurrentExperience();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 theme-transition-all">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 shadow-md theme-transition">
        <div className="container-fluid py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div className="flex items-center mb-4 sm:mb-0">
              <div className="w-12 h-12 rounded-full overflow-hidden mr-3">
                {cvData.personalInfo.avatar ? (
                  <img 
                    src={cvData.personalInfo.avatar} 
                    alt={cvData.personalInfo.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-primary-500 flex items-center justify-center text-white text-xl font-bold">
                    {cvData.personalInfo.name.charAt(0)}
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {cvData.personalInfo.name}
                </h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                  {cvData.personalInfo.title}
                </p>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <nav className="hidden md:flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button 
                  onClick={() => setActiveSection('about')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeSection === 'about' ? 'bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400'}`}
                  aria-label="About section"
                >
                  About
                </button>
                <button 
                  onClick={() => setActiveSection('experience')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeSection === 'experience' ? 'bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400'}`}
                  aria-label="Experience section"
                >
                  Experience
                </button>
                <button 
                  onClick={() => setActiveSection('education')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeSection === 'education' ? 'bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400'}`}
                  aria-label="Education section"
                >
                  Education
                </button>
              </nav>
              
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="theme-toggle"
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                <span className="theme-toggle-thumb">
                  {isDarkMode ? (
                    <Sun className="h-3 w-3 text-yellow-500" />
                  ) : (
                    <Moon className="h-3 w-3 text-gray-700" />
                  )}
                </span>
                <span className="sr-only">{isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}</span>
              </button>
            </div>
          </div>
          
          {/* Mobile Navigation */}
          <div className="md:hidden mt-4">
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button 
                onClick={() => setActiveSection('about')}
                className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeSection === 'about' ? 'bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'}`}
              >
                About
              </button>
              <button 
                onClick={() => setActiveSection('experience')}
                className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeSection === 'experience' ? 'bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'}`}
              >
                Experience
              </button>
              <button 
                onClick={() => setActiveSection('education')}
                className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeSection === 'education' ? 'bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'}`}
              >
                Education
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container-fluid py-8">
        {/* About Section */}
        {activeSection === 'about' && (
          <div className="fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Personal Info */}
              <div className="lg:col-span-2">
                <div className="card">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2 text-primary-600" /> About Me
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {cvData.personalInfo.summary}
                  </p>
                  
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start">
                      <MapPin className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">Location</h3>
                        <p className="text-gray-600 dark:text-gray-400">{cvData.personalInfo.location}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <MessageCircle className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">Email</h3>
                        <p className="text-gray-600 dark:text-gray-400">{cvData.personalInfo.email}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Globe className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">Languages</h3>
                        <ul className="text-gray-600 dark:text-gray-400">
                          {cvData.personalInfo.languages.map((lang, index) => (
                            <li key={index}>{lang.language} ({lang.proficiency})</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Award className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">Career Focus</h3>
                        <p className="text-gray-600 dark:text-gray-400">Product Management, UX Strategy, Data-Driven Decision Making</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div>
                <div className="card">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                      <Lightbulb className="w-5 h-5 mr-2 text-primary-600" /> Skills
                    </h2>
                    <button 
                      onClick={() => toggleSection('skills')}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                      aria-label={expandedSections.skills ? 'Collapse skills' : 'Expand skills'}
                    >
                      {expandedSections.skills ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                  
                  <div className={`transition-all duration-300 ${expandedSections.skills ? 'max-h-[1000px] opacity-100' : 'max-h-64 overflow-hidden opacity-100'}`}>
                    <div className="flex flex-wrap gap-2">
                      {cvData.skills.slice(0, expandedSections.skills ? cvData.skills.length : 10).map((skill, index) => (
                        <span key={index} className="px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium">
                          {skill}
                        </span>
                      ))}
                      {!expandedSections.skills && cvData.skills.length > 10 && (
                        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium">
                          +{cvData.skills.length - 10} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Certificates */}
                <div className="card mt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                      <Award className="w-5 h-5 mr-2 text-primary-600" /> Certificates
                    </h2>
                    <button 
                      onClick={() => toggleSection('certificates')}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                      aria-label={expandedSections.certificates ? 'Collapse certificates' : 'Expand certificates'}
                    >
                      {expandedSections.certificates ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                  
                  <div className={`space-y-4 transition-all duration-300 ${expandedSections.certificates ? 'max-h-[1000px] opacity-100' : 'max-h-64 overflow-hidden opacity-100'}`}>
                    {cvData.certificates.map((cert) => (
                      <div key={cert.id} className="border-l-4 border-primary-500 pl-4 py-1">
                        <h3 className="text-base font-medium text-gray-900 dark:text-white">{cert.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{cert.issuer} • {cert.date}</p>
                        {expandedSections.certificates && cert.description && (
                          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{cert.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Education */}
            <div className="mt-6">
              <div className="card">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                    <Code className="w-5 h-5 mr-2 text-primary-600" /> Education
                  </h2>
                  <button 
                    onClick={() => toggleSection('education')}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    aria-label={expandedSections.education ? 'Collapse education' : 'Expand education'}
                  >
                    {expandedSections.education ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {cvData.education.map((edu) => (
                    <div key={edu.id} className="border-l-4 border-primary-500 pl-4 py-2">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">{edu.institution}</h3>
                      <p className="text-base font-medium text-gray-700 dark:text-gray-300">{edu.degree}</p>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mt-1">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>{edu.period}</span>
                        <MapPin className="w-4 h-4 ml-3 mr-1" />
                        <span>{edu.location}</span>
                      </div>
                      {expandedSections.education && edu.description && (
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{edu.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Experience Section */}
        {activeSection === 'experience' && (
          <div className="fade-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                <Briefcase className="w-6 h-6 mr-2 text-primary-600" /> Professional Experience
              </h2>
              
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => navigateJob('prev')}
                  disabled={cvData.experience.findIndex(exp => exp.id === currentJob) === 0}
                  className="btn-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Previous job"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => navigateJob('next')}
                  disabled={cvData.experience.findIndex(exp => exp.id === currentJob) === cvData.experience.length - 1}
                  className="btn-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Next job"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Job Navigation Tabs */}
            <div className="flex overflow-x-auto pb-2 mb-6 scrollbar-hide gap-2">
              {cvData.experience.map((exp) => (
                <button
                  key={exp.id}
                  onClick={() => setCurrentJob(exp.id)}
                  className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${currentJob === exp.id ? 
                    `bg-${exp.color.replace('#', '')} text-white` : 
                    'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                  style={currentJob === exp.id ? { backgroundColor: exp.color, color: 'white' } : undefined}
                  aria-label={`View ${exp.company} experience`}
                >
                  {exp.company}
                </button>
              ))}
            </div>

            {currentExperience && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Job Details */}
                <div className="lg:col-span-1 order-2 lg:order-1">
                  <div className="card" style={{ borderTop: `4px solid ${currentExperience.color}` }}>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{currentExperience.role}</h3>
                    <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">{currentExperience.company}</h4>
                    
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-4">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>{currentExperience.period}</span>
                      <MapPin className="w-4 h-4 ml-3 mr-1" />
                      <span>{currentExperience.location}</span>
                    </div>
                    
                    <p className="text-gray-700 dark:text-gray-300 mb-6">
                      {currentExperience.description}
                    </p>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-base font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                          <Check className="w-4 h-4 mr-2 text-green-600" /> Key Responsibilities
                        </h4>
                        <button 
                          onClick={() => openModal('Key Responsibilities', currentExperience.responsibilities)}
                          className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium"
                          aria-label="View all responsibilities"
                        >
                          View all ({currentExperience.responsibilities.length})
                        </button>
                        <ul className="mt-2 space-y-2">
                          {currentExperience.responsibilities.slice(0, 3).map((resp, index) => (
                            <li key={index} className="flex">
                              <span className="text-gray-400 mr-2">•</span>
                              <span className="text-gray-600 dark:text-gray-400 text-sm">{resp}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="text-base font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                          <Star className="w-4 h-4 mr-2 text-yellow-500" /> Key Achievements
                        </h4>
                        <button 
                          onClick={() => openModal('Key Achievements', currentExperience.achievements)}
                          className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium"
                          aria-label="View all achievements"
                        >
                          View all ({currentExperience.achievements.length})
                        </button>
                        <ul className="mt-2 space-y-2">
                          {currentExperience.achievements.slice(0, 3).map((achievement, index) => (
                            <li key={index} className="flex">
                              <span className="text-gray-400 mr-2">•</span>
                              <span className="text-gray-600 dark:text-gray-400 text-sm">{achievement}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="text-base font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                          <Database className="w-4 h-4 mr-2 text-indigo-500" /> Technical Skills
                        </h4>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {currentExperience.skills.map((skill, index) => (
                            <span 
                              key={index} 
                              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md text-xs font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Job Performance Dashboard */}
                <div className="lg:col-span-2 order-1 lg:order-2">
                  <div className="card">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                      <ChartBar className="w-5 h-5 mr-2 text-primary-600" /> Performance Dashboard
                    </h3>

                    {/* Metrics */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                      {currentExperience.metrics?.map((metric, index) => (
                        <div key={index} className="stat-card">
                          <div className="stat-title">{metric.title}</div>
                          <div className="stat-value" style={{ color: currentExperience.color }}>
                            {metric.prefix}{metric.value}{metric.suffix}
                          </div>
                          {metric.change && (
                            <div className={`stat-desc flex items-center ${metric.trend === 'up' ? 'text-green-500' : metric.trend === 'down' ? 'text-red-500' : 'text-gray-500'}`}>
                              {metric.trend === 'up' ? (
                                <ArrowUp className="w-3 h-3 mr-1" />
                              ) : metric.trend === 'down' ? (
                                <ArrowDown className="w-3 h-3 mr-1" />
                              ) : null}
                              {metric.change}% {metric.trend === 'down' && metric.title.includes('Reduction') ? 'Improvement' : metric.trend === 'up' ? 'Increase' : ''}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Charts */}
                    <div className="space-y-6">
                      {/* Line chart for user growth */}
                      {currentExperience.userGrowthData && (
                        <div>
                          <h4 className="text-base font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                            <ChartLine className="w-4 h-4 mr-2 text-blue-500" /> User Growth
                          </h4>
                          <div className="h-64 md:h-72">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={currentExperience.userGrowthData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="name" stroke="#9ca3af" />
                                <YAxis stroke="#9ca3af" />
                                <Tooltip 
                                  contentStyle={{ 
                                    backgroundColor: isDarkMode ? '#1f2937' : '#fff',
                                    borderColor: isDarkMode ? '#374151' : '#e5e7eb',
                                    color: isDarkMode ? '#e5e7eb' : '#1f2937'
                                  }}
                                  formatter={(value) => [new Intl.NumberFormat().format(value as number), 'Users']}
                                />
                                <Line 
                                  type="monotone" 
                                  dataKey="users" 
                                  stroke={currentExperience.color} 
                                  activeDot={{ r: 8 }} 
                                  strokeWidth={2}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      )}

                      {/* Bar chart for revenue */}
                      {currentExperience.revenueData && (
                        <div>
                          <h4 className="text-base font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                            <ChartBar className="w-4 h-4 mr-2 text-green-500" /> Revenue Growth
                          </h4>
                          <div className="h-64 md:h-72">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={currentExperience.revenueData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="name" stroke="#9ca3af" />
                                <YAxis stroke="#9ca3af" />
                                <Tooltip 
                                  contentStyle={{ 
                                    backgroundColor: isDarkMode ? '#1f2937' : '#fff',
                                    borderColor: isDarkMode ? '#374151' : '#e5e7eb',
                                    color: isDarkMode ? '#e5e7eb' : '#1f2937'
                                  }}
                                  formatter={(value) => [formatCurrency(value as number), 'Revenue']}
                                />
                                <Bar dataKey="revenue" fill={currentExperience.color} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      )}

                      {/* Pie chart for satisfaction */}
                      {currentExperience.satisfactionData && (
                        <div>
                          <h4 className="text-base font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                            <Grid className="w-4 h-4 mr-2 text-purple-500" /> Customer Satisfaction
                          </h4>
                          <div className="h-64 md:h-72">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={currentExperience.satisfactionData}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={false}
                                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                  outerRadius={80}
                                  fill="#8884d8"
                                  dataKey="value"
                                >
                                  {currentExperience.satisfactionData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                                </Pie>
                                <Tooltip 
                                  contentStyle={{ 
                                    backgroundColor: isDarkMode ? '#1f2937' : '#fff',
                                    borderColor: isDarkMode ? '#374151' : '#e5e7eb',
                                    color: isDarkMode ? '#e5e7eb' : '#1f2937'
                                  }}
                                  formatter={(value, name) => [`${value}%`, name]}
                                />
                                <Legend />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      )}

                      {/* Stacked bar chart for project completion */}
                      {currentExperience.projectCompletionData && (
                        <div>
                          <h4 className="text-base font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                            <FileText className="w-4 h-4 mr-2 text-orange-500" /> Project Completion Rate
                          </h4>
                          <div className="h-64 md:h-72">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={currentExperience.projectCompletionData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="name" stroke="#9ca3af" />
                                <YAxis stroke="#9ca3af" />
                                <Tooltip 
                                  contentStyle={{ 
                                    backgroundColor: isDarkMode ? '#1f2937' : '#fff',
                                    borderColor: isDarkMode ? '#374151' : '#e5e7eb',
                                    color: isDarkMode ? '#e5e7eb' : '#1f2937'
                                  }}
                                />
                                <Legend />
                                <Bar dataKey="completed" stackId="a" fill={currentExperience.color} name="Completed" />
                                <Bar dataKey="inProgress" stackId="a" fill={currentExperience.secondaryColor} name="In Progress" />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Education Section */}
        {activeSection === 'education' && (
          <div className="fade-in">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <Code className="w-6 h-6 mr-2 text-primary-600" /> Education
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {cvData.education.map((edu) => (
                <div key={edu.id} className="card hover:shadow-md transition-shadow">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{edu.institution}</h3>
                  <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">{edu.degree}</h4>
                  
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>{edu.period}</span>
                    <MapPin className="w-4 h-4 ml-3 mr-1" />
                    <span>{edu.location}</span>
                  </div>
                  
                  {edu.description && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">{edu.description}</p>
                  )}
                </div>
              ))}
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-10 mb-6 flex items-center">
              <Award className="w-6 h-6 mr-2 text-primary-600" /> Certificates & Training
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cvData.certificates.map((cert) => (
                <div key={cert.id} className="card hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{cert.name}</h3>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-3">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>{cert.date}</span>
                    <span className="mx-2">|</span>
                    <span>{cert.issuer}</span>
                  </div>
                  
                  {cert.description && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{cert.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 shadow-md theme-transition py-6">
        <div className="container-fluid text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Copyright © 2025 of Datavtar Private Limited. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div ref={modalRef} className="modal-content">
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">{modalContent.title}</h3>
              <button 
                onClick={() => setShowModal(false)} 
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-4">
              <ul className="space-y-3">
                {modalContent.content.map((item, index) => (
                  <li key={index} className="flex">
                    <span className="text-primary-600 mr-2">•</span>
                    <span className="text-gray-600 dark:text-gray-400">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="modal-footer">
              <button 
                onClick={() => setShowModal(false)} 
                className="btn btn-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                aria-label="Close modal"
              >
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
