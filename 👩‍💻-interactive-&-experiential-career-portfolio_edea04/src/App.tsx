import React, { useState, useEffect, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import {
  User,
  Briefcase,
  Code,
  Award,
  FileText,
  Github,
  ExternalLink,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  Star,
  Download,
  GraduationCap,
  BookOpen,
  Menu,
  X
} from 'lucide-react';
import styles from './styles/styles.module.css';

// Define types for our CV data
interface Experience {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
  technologies: string[];
  achievements: string[];
  projectLink?: string;
  demoAvailable: boolean;
}

interface Education {
  id: string;
  degree: string;
  institution: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
  achievements: string[];
}

interface Skill {
  id: string;
  name: string;
  level: number; // 1-10
  category: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  link?: string;
  image?: string;
  demoAvailable: boolean;
}

interface PersonalInfo {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  linkedin: string;
  github: string;
  website?: string;
  avatar: string;
}

interface CVData {
  personalInfo: PersonalInfo;
  experiences: Experience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
  achievements: string[];
}

interface ProjectDemoProps {
  project: Project;
  onClose: () => void;
}

interface TimelineStatsData {
  year: string;
  projects: number;
  skills: number;
}

interface SkillDistributionData {
  name: string;
  value: number;
}

const App: React.FC = () => {
  // State for light/dark mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      return savedMode === 'true' || 
        (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  // Active section tracking
  const [activeSection, setActiveSection] = useState<string>('home');
  
  // State for mobile navigation
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  
  // State for currently selected experience (for detailed view)
  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null);
  
  // State for project demo modal
  const [showProjectDemo, setShowProjectDemo] = useState<boolean>(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Timeline chart data based on experiences
  const [timelineData, setTimelineData] = useState<TimelineStatsData[]>([]);
  
  // Skill distribution data
  const [skillDistribution, setSkillDistribution] = useState<SkillDistributionData[]>([]);

  // Default CV data
  const defaultCVData: CVData = {
    personalInfo: {
      name: "Jane Smith",
      title: "Senior Product Manager",
      email: "jane.smith@example.com",
      phone: "+1 (555) 123-4567",
      location: "San Francisco, CA",
      bio: "Seasoned product manager with 8+ years of experience driving product strategy and execution across various domains. Passionate about building user-centric products that solve real problems and create business value.",
      linkedin: "https://linkedin.com/in/janesmith",
      github: "https://github.com/janesmith",
      website: "https://janesmith.me",
      avatar: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='50' fill='%236366f1'/%3E%3Cpath d='M65,76 C65,69.3726 56.7275,64 46.5,64 C36.2725,64 28,69.3726 28,76 L65,76 Z' fill='%23f9fafb'/%3E%3Ccircle cx='50' cy='36' r='16' fill='%23f9fafb'/%3E%3C/svg%3E"
    },
    experiences: [
      {
        id: "exp1",
        title: "Lead Product Manager",
        company: "TechInnovate Inc.",
        location: "San Francisco, CA",
        startDate: "Jan 2020",
        endDate: "Present",
        description: "Leading product development for AI-powered analytics platform. Collaborated with cross-functional teams to define product vision, roadmap, and strategy. Launched 3 successful products with 40% YoY growth.",
        technologies: ["Product Strategy", "Agile/Scrum", "Data Analytics", "Machine Learning", "User Research"],
        achievements: [
          "Increased user retention by 35% through implementing feedback loops",
          "Led team of 5 junior product managers across distributed teams",
          "Reduced product development cycle by 30% by implementing new Agile practices"
        ],
        demoAvailable: true
      },
      {
        id: "exp2",
        title: "Senior Product Manager",
        company: "CloudSolutions Co.",
        location: "Seattle, WA",
        startDate: "Mar 2017",
        endDate: "Dec 2019",
        description: "Managed entire product lifecycle for cloud infrastructure monitoring tools. Worked closely with engineering to prioritize features based on market research and customer feedback. Drove product adoption across enterprise clients.",
        technologies: ["Cloud Technologies", "Metrics & Analytics", "Enterprise Solutions", "Stakeholder Management", "Product Requirements"],
        achievements: [
          "Achieved 90% customer satisfaction score for product releases",
          "Developed product strategy that expanded market share by 15%",
          "Successfully launched 4 major product updates with high adoption rates"
        ],
        projectLink: "https://example.com/cloudsolutions",
        demoAvailable: true
      },
      {
        id: "exp3",
        title: "Product Manager",
        company: "FinTech Innovators",
        location: "New York, NY",
        startDate: "Jun 2015",
        endDate: "Feb 2017",
        description: "Responsible for mobile banking application used by over 500,000 customers. Defined product requirements, conducted competitive analysis, and prioritized feature backlog. Worked with UX designers to improve user experience.",
        technologies: ["Mobile Applications", "Financial Services", "UX Design", "API Integration", "User Testing"],
        achievements: [
          "Drove 25% increase in mobile app engagement through new feature releases",
          "Streamlined onboarding process reducing drop-off rate by 40%",
          "Implemented A/B testing framework for feature validation"
        ],
        demoAvailable: false
      }
    ],
    education: [
      {
        id: "edu1",
        degree: "MBA, Technology Management",
        institution: "Stanford University",
        location: "Stanford, CA",
        startDate: "Sep 2013",
        endDate: "Jun 2015",
        description: "Focused on product management, technology strategy, and entrepreneurship. Active member of Product Management Club and Technology Entrepreneurship Association.",
        achievements: [
          "Graduated with Honors",
          "Led team to win annual startup pitch competition",
          "Published research paper on disruptive innovation metrics"
        ]
      },
      {
        id: "edu2",
        degree: "BS, Computer Science",
        institution: "University of California, Berkeley",
        location: "Berkeley, CA",
        startDate: "Sep 2009",
        endDate: "May 2013",
        description: "Specialized in human-computer interaction and software engineering. Minor in Business Administration.",
        achievements: [
          "Graduated Magna Cum Laude",
          "Received Dean's Leadership Award",
          "Led development team for campus navigation app"
        ]
      }
    ],
    skills: [
      { id: "skill1", name: "Product Strategy", level: 9, category: "Business" },
      { id: "skill2", name: "Product Requirements", level: 10, category: "Business" },
      { id: "skill3", name: "User Research", level: 8, category: "Research" },
      { id: "skill4", name: "Roadmap Planning", level: 9, category: "Business" },
      { id: "skill5", name: "Market Analysis", level: 8, category: "Research" },
      { id: "skill6", name: "Agile/Scrum", level: 9, category: "Methodology" },
      { id: "skill7", name: "Data Analytics", level: 7, category: "Technical" },
      { id: "skill8", name: "A/B Testing", level: 8, category: "Methodology" },
      { id: "skill9", name: "UI/UX Design", level: 7, category: "Design" },
      { id: "skill10", name: "Product Marketing", level: 8, category: "Business" },
      { id: "skill11", name: "SQL", level: 6, category: "Technical" },
      { id: "skill12", name: "Python", level: 5, category: "Technical" },
      { id: "skill13", name: "Cross-Functional Leadership", level: 9, category: "Leadership" },
      { id: "skill14", name: "Stakeholder Management", level: 9, category: "Leadership" },
      { id: "skill15", name: "Product Lifecycle Management", level: 8, category: "Business" }
    ],
    projects: [
      {
        id: "proj1",
        title: "AI-Powered Analytics Dashboard",
        description: "Led the development of an advanced analytics dashboard using machine learning algorithms to provide predictive insights. The platform allows users to visualize complex data patterns and make data-driven decisions.",
        technologies: ["Product Management", "Machine Learning", "Data Visualization", "User Research", "Agile"],
        link: "https://example.com/analytics-dashboard",
        demoAvailable: true
      },
      {
        id: "proj2",
        title: "Mobile Banking Redesign",
        description: "Spearheaded complete redesign of mobile banking application used by 500,000+ customers. Introduced biometric authentication, personalized financial insights, and simplified transaction flows.",
        technologies: ["Mobile UX", "Financial Services", "User Testing", "Prototype Design", "A/B Testing"],
        demoAvailable: true
      },
      {
        id: "proj3",
        title: "Enterprise Cloud Monitoring Suite",
        description: "Developed comprehensive monitoring solution for enterprise cloud infrastructure. Features included real-time alerts, performance metrics, cost optimization recommendations, and security compliance tracking.",
        technologies: ["Cloud Infrastructure", "Enterprise Software", "Metrics & Analytics", "API Integration"],
        link: "https://example.com/cloud-monitor",
        demoAvailable: true
      },
      {
        id: "proj4",
        title: "Product Management Workshop Series",
        description: "Created and delivered a series of workshops on product management best practices. Topics included user story creation, feature prioritization, roadmap planning, and stakeholder communication.",
        technologies: ["Training", "Workshop Facilitation", "Product Management", "Team Development"],
        demoAvailable: false
      }
    ],
    achievements: [
      "Speaker at ProductCon 2022 on 'AI-Driven Product Management'",
      "Published article in Harvard Business Review on product innovation strategy",
      "Mentor for Women in Product organization, supporting 10+ mentees",
      "Recipient of Industry Innovator Award, Product Management Summit 2021",
      "Increased user adoption rates by average of 32% across all managed products"
    ]
  };

  // State for CV data
  const [cvData, setCVData] = useState<CVData>(() => {
    const savedData = localStorage.getItem('cvData');
    return savedData ? JSON.parse(savedData) : defaultCVData;
  });

  // Save CV data to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('cvData', JSON.stringify(cvData));
    
    // Generate timeline data
    generateTimelineData();
    
    // Generate skill distribution
    generateSkillDistribution();
  }, [cvData]);

  // Apply dark mode class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  // Handle ESC key press to close modals
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showProjectDemo) {
          setShowProjectDemo(false);
        }
        if (selectedExperience) {
          setSelectedExperience(null);
        }
        if (mobileMenuOpen) {
          setMobileMenuOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => {
      window.removeEventListener('keydown', handleEscKey);
    };
  }, [showProjectDemo, selectedExperience, mobileMenuOpen]);

  // Generate timeline data for chart
  const generateTimelineData = () => {
    const years = new Set<string>();
    
    // Extract all years from experiences
    cvData.experiences.forEach(exp => {
      const startYear = exp.startDate.split(' ')[1];
      const endYear = exp.endDate === 'Present' ? new Date().getFullYear().toString() : exp.endDate.split(' ')[1];
      
      // Add all years between start and end
      const startYearNum = parseInt(startYear);
      const endYearNum = endYear === 'Present' ? new Date().getFullYear() : parseInt(endYear);
      
      for (let year = startYearNum; year <= endYearNum; year++) {
        years.add(year.toString());
      }
    });
    
    // Create timeline data
    const data: TimelineStatsData[] = Array.from(years).sort().map(year => {
      // Count projects and skills added in this year
      const projects = cvData.projects.filter(p => p.id.includes(year)).length;
      const skills = cvData.skills.filter(s => s.id.includes(year)).length;
      
      return {
        year,
        projects: projects || Math.floor(Math.random() * 3), // Fallback to random for demo
        skills: skills || Math.floor(Math.random() * 4)     // Fallback to random for demo
      };
    });
    
    setTimelineData(data);
  };

  // Generate skill distribution data
  const generateSkillDistribution = () => {
    const categories = {};
    
    cvData.skills.forEach(skill => {
      if (categories[skill.category]) {
        categories[skill.category] += 1;
      } else {
        categories[skill.category] = 1;
      }
    });
    
    const data: SkillDistributionData[] = Object.entries(categories).map(([name, value]) => ({
      name,
      value: value as number
    }));
    
    setSkillDistribution(data);
  };

  // Demo component for projects
  const ProjectDemo: React.FC<ProjectDemoProps> = ({ project, onClose }) => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4 theme-transition"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-demo-title">
        <div 
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-auto theme-transition"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 id="project-demo-title" className="text-xl font-bold text-gray-900 dark:text-white">
              {project.title} Demo
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              aria-label="Close demo"
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="p-6">
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-300 mb-4">{project.description}</p>
              
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Technologies</h3>
              <div className="flex flex-wrap gap-2 mb-6">
                {project.technologies.map((tech, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-primary-100 text-primary-800 dark:bg-primary-900 dark:bg-opacity-30 dark:text-primary-300 rounded-full text-sm"
                  >
                    {tech}
                  </span>
                ))}
              </div>
              
              {/* Interactive Demo Placeholder */}
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 mb-6 text-center">
                <div className="text-gray-500 dark:text-gray-400 mb-4">
                  <Code size={48} className="mx-auto mb-2" />
                  <p className="text-lg font-medium">Interactive Demo Environment</p>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  The actual interactive demo would be embedded here, showing key features of the project.
                </p>
                <div className={styles.demoAnimation}>
                  <div className={styles.demoContent}></div>
                </div>
              </div>
              
              {project.link && (
                <div className="mt-4">
                  <a 
                    href={project.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
                  >
                    <ExternalLink size={16} />
                    Visit project
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Format skills for display
  const formatSkillLevel = (level: number): string => {
    if (level >= 9) return "Expert";
    if (level >= 7) return "Advanced";
    if (level >= 5) return "Intermediate";
    return "Beginner";
  };

  // Show project demo modal
  const showDemo = (project: Project) => {
    setSelectedProject(project);
    setShowProjectDemo(true);
  };

  // Group skills by category
  const skillsByCategory = cvData.skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 theme-transition-all">
      {/* Header/Navigation */}
      <header className="sticky top-0 bg-white dark:bg-gray-800 shadow-sm z-30 theme-transition">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            {cvData.personalInfo.name} <span className="hidden sm:inline text-gray-500 dark:text-gray-400 font-normal">| {cvData.personalInfo.title}</span>
          </h1>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <button 
              onClick={() => setActiveSection('home')}
              className={`${activeSection === 'home' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-300'} hover:text-primary-700 dark:hover:text-primary-300`}
            >
              Home
            </button>
            <button 
              onClick={() => setActiveSection('experience')}
              className={`${activeSection === 'experience' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-300'} hover:text-primary-700 dark:hover:text-primary-300`}
            >
              Experience
            </button>
            <button 
              onClick={() => setActiveSection('projects')}
              className={`${activeSection === 'projects' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-300'} hover:text-primary-700 dark:hover:text-primary-300`}
            >
              Projects
            </button>
            <button 
              onClick={() => setActiveSection('skills')}
              className={`${activeSection === 'skills' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-300'} hover:text-primary-700 dark:hover:text-primary-300`}
            >
              Skills
            </button>
            <button 
              onClick={() => setActiveSection('education')}
              className={`${activeSection === 'education' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-300'} hover:text-primary-700 dark:hover:text-primary-300`}
            >
              Education
            </button>
            <button
              onClick={toggleDarkMode}
              className="ml-4 p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </nav>
          
          {/* Mobile menu button */}
          <div className="flex md:hidden items-center space-x-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Open mobile menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-800 shadow-lg theme-transition">
            <div className="container mx-auto px-4 py-2 space-y-2">
              <button 
                onClick={() => {
                  setActiveSection('home');
                  setMobileMenuOpen(false);
                }}
                className={`${activeSection === 'home' ? 'text-primary-600 dark:text-primary-400 bg-gray-100 dark:bg-gray-700' : 'text-gray-600 dark:text-gray-300'} w-full text-left p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700`}
              >
                Home
              </button>
              <button 
                onClick={() => {
                  setActiveSection('experience');
                  setMobileMenuOpen(false);
                }}
                className={`${activeSection === 'experience' ? 'text-primary-600 dark:text-primary-400 bg-gray-100 dark:bg-gray-700' : 'text-gray-600 dark:text-gray-300'} w-full text-left p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700`}
              >
                Experience
              </button>
              <button 
                onClick={() => {
                  setActiveSection('projects');
                  setMobileMenuOpen(false);
                }}
                className={`${activeSection === 'projects' ? 'text-primary-600 dark:text-primary-400 bg-gray-100 dark:bg-gray-700' : 'text-gray-600 dark:text-gray-300'} w-full text-left p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700`}
              >
                Projects
              </button>
              <button 
                onClick={() => {
                  setActiveSection('skills');
                  setMobileMenuOpen(false);
                }}
                className={`${activeSection === 'skills' ? 'text-primary-600 dark:text-primary-400 bg-gray-100 dark:bg-gray-700' : 'text-gray-600 dark:text-gray-300'} w-full text-left p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700`}
              >
                Skills
              </button>
              <button 
                onClick={() => {
                  setActiveSection('education');
                  setMobileMenuOpen(false);
                }}
                className={`${activeSection === 'education' ? 'text-primary-600 dark:text-primary-400 bg-gray-100 dark:bg-gray-700' : 'text-gray-600 dark:text-gray-300'} w-full text-left p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700`}
              >
                Education
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Home/Profile Section */}
        {activeSection === 'home' && (
          <section className="space-y-8">
            {/* Profile Header */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden theme-transition">
              <div className="bg-gradient-to-r from-primary-600 to-primary-400 h-32 md:h-48"></div>
              <div className="px-4 sm:px-6 lg:px-8 pb-6 relative">
                <div className="flex flex-col sm:flex-row sm:items-end -mt-16 sm:-mt-20 mb-6 sm:mb-8 space-y-4 sm:space-y-0 sm:space-x-6">
                  <div className="h-32 w-32 sm:h-40 sm:w-40 rounded-full ring-4 ring-white dark:ring-gray-800 overflow-hidden bg-white theme-transition">
                    <img 
                      src={cvData.personalInfo.avatar} 
                      alt={cvData.personalInfo.name} 
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white theme-transition">
                      {cvData.personalInfo.name}
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300 theme-transition">
                      {cvData.personalInfo.title}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400 theme-transition">
                      <div className="flex items-center gap-1">
                        <MapPin size={16} />
                        <span>{cvData.personalInfo.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Mail size={16} />
                        <a href={`mailto:${cvData.personalInfo.email}`} className="hover:text-primary-600 dark:hover:text-primary-400">
                          {cvData.personalInfo.email}
                        </a>
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone size={16} />
                        <a href={`tel:${cvData.personalInfo.phone}`} className="hover:text-primary-600 dark:hover:text-primary-400">
                          {cvData.personalInfo.phone}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Bio */}
                <div className="prose dark:prose-invert max-w-none theme-transition">
                  <p>{cvData.personalInfo.bio}</p>
                </div>
                
                {/* Social Links */}
                <div className="mt-6 flex flex-wrap gap-3">
                  <a 
                    href={cvData.personalInfo.linkedin} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 theme-transition"
                  >
                    <Linkedin size={18} />
                    <span className="text-sm">LinkedIn</span>
                  </a>
                  <a 
                    href={cvData.personalInfo.github} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 theme-transition"
                  >
                    <Github size={18} />
                    <span className="text-sm">GitHub</span>
                  </a>
                  {cvData.personalInfo.website && (
                    <a 
                      href={cvData.personalInfo.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 theme-transition"
                    >
                      <ExternalLink size={18} />
                      <span className="text-sm">Website</span>
                    </a>
                  )}
                  <button 
                    className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 theme-transition"
                    onClick={() => {
                      // Download resume functionality could be added here
                      alert('Resume download functionality would be implemented here.');
                    }}
                    aria-label="Download resume"
                  >
                    <Download size={18} />
                    <span className="text-sm">Download Resume</span>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Career Highlights */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 theme-transition">
              <h2 className="text-xl font-bold mb-5 text-gray-900 dark:text-white flex items-center gap-2 theme-transition">
                <Award size={20} />
                Career Highlights
              </h2>
              
              <ul className="space-y-3">
                {cvData.achievements.map((achievement, index) => (
                  <li key={index} className="flex gap-3">
                    <div className="flex-shrink-0 text-primary-500 dark:text-primary-400">
                      <Star size={18} />
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 theme-transition">{achievement}</p>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Career Timeline */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 theme-transition">
              <h2 className="text-xl font-bold mb-5 text-gray-900 dark:text-white flex items-center gap-2 theme-transition">
                <Briefcase size={20} />
                Career Growth
              </h2>
              
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={timelineData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="year" 
                      stroke={isDarkMode ? "#9ca3af" : "#374151"}
                    />
                    <YAxis stroke={isDarkMode ? "#9ca3af" : "#374151"} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: isDarkMode ? '#1f2937' : '#fff',
                        borderColor: isDarkMode ? '#374151' : '#e5e7eb',
                        color: isDarkMode ? '#f9fafb' : '#1f2937'
                      }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="projects" 
                      stackId="1"
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      name="Projects"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="skills" 
                      stackId="1"
                      stroke="#82ca9d" 
                      fill="#82ca9d" 
                      name="Skills"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-2 theme-transition">
                Growth in projects and skills acquisition over time
              </p>
            </div>
            
            {/* Featured Projects */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 theme-transition">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 theme-transition">
                  <Code size={20} />
                  Featured Projects
                </h2>
                <button 
                  onClick={() => setActiveSection('projects')}
                  className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium flex items-center gap-1 theme-transition"
                >
                  View All
                  <ChevronRight size={16} />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cvData.projects.slice(0, 2).map((project) => (
                  <div 
                    key={project.id} 
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow theme-transition"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 theme-transition">{project.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2 theme-transition">{project.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.technologies.slice(0, 3).map((tech, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs theme-transition"
                        >
                          {tech}
                        </span>
                      ))}
                      {project.technologies.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs theme-transition">
                          +{project.technologies.length - 3} more
                        </span>
                      )}
                    </div>
                    
                    {project.demoAvailable && (
                      <button
                        onClick={() => showDemo(project)}
                        className="btn btn-sm btn-primary w-full"
                      >
                        View Demo
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Skill Distribution */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 theme-transition">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 theme-transition">
                  <Code size={20} />
                  Skill Distribution
                </h2>
                <button 
                  onClick={() => setActiveSection('skills')}
                  className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium flex items-center gap-1 theme-transition"
                >
                  View All Skills
                  <ChevronRight size={16} />
                </button>
              </div>
              
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={skillDistribution}
                    margin={{ top: 10, right: 30, left: 20, bottom: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45} 
                      textAnchor="end" 
                      height={70} 
                      stroke={isDarkMode ? "#9ca3af" : "#374151"}
                    />
                    <YAxis stroke={isDarkMode ? "#9ca3af" : "#374151"} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: isDarkMode ? '#1f2937' : '#fff',
                        borderColor: isDarkMode ? '#374151' : '#e5e7eb',
                        color: isDarkMode ? '#f9fafb' : '#1f2937'
                      }}
                    />
                    <Bar 
                      dataKey="value" 
                      name="Skills" 
                      fill="#6366f1" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-2 theme-transition">
                Distribution of skills by category
              </p>
            </div>
          </section>
        )}

        {/* Experience Section */}
        {activeSection === 'experience' && (
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2 theme-transition">
              <Briefcase size={24} />
              Professional Experience
            </h2>
            
            {/* Selected Experience Details */}
            {selectedExperience ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden theme-transition">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white theme-transition">
                        {selectedExperience.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 theme-transition">
                        {selectedExperience.company} • {selectedExperience.location}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 theme-transition">
                        {selectedExperience.startDate} - {selectedExperience.endDate}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedExperience(null)}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      aria-label="Close experience details"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  
                  <div className="mt-6 prose dark:prose-invert max-w-none theme-transition">
                    <p>{selectedExperience.description}</p>
                    
                    <h4 className="text-lg font-semibold">Key Technologies</h4>
                    <div className="flex flex-wrap gap-2 mb-6 not-prose">
                      {selectedExperience.technologies.map((tech, index) => (
                        <span 
                          key={index}
                          className="px-3 py-1 bg-primary-100 text-primary-800 dark:bg-primary-900 dark:bg-opacity-30 dark:text-primary-300 rounded-full text-sm"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                    
                    <h4 className="text-lg font-semibold">Key Achievements</h4>
                    <ul>
                      {selectedExperience.achievements.map((achievement, index) => (
                        <li key={index}>{achievement}</li>
                      ))}
                    </ul>
                    
                    {selectedExperience.demoAvailable && (
                      <div className="mt-6 not-prose">
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center">
                          <div className="text-gray-500 dark:text-gray-400 mb-4">
                            <Code size={48} className="mx-auto mb-2" />
                            <p className="text-lg font-medium">Interactive Role Experience</p>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            This section would contain an interactive demo of work samples from this role.
                          </p>
                          <div className={styles.demoAnimation}>
                            <div className={styles.demoContent}></div>
                          </div>
                          <button
                            className="btn btn-primary mt-6"
                            onClick={() => alert('This would launch an interactive demo of the work done in this role.')}
                          >
                            Explore Role Experience
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {selectedExperience.projectLink && (
                      <div className="mt-4 not-prose">
                        <a 
                          href={selectedExperience.projectLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
                        >
                          <ExternalLink size={16} />
                          View Related Project
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {cvData.experiences.map((experience) => (
                  <div 
                    key={experience.id} 
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow transition-shadow theme-transition"
                    onClick={() => setSelectedExperience(experience)}
                  >
                    <div className="p-6 cursor-pointer">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white theme-transition">
                            {experience.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300 theme-transition">
                            {experience.company} • {experience.location}
                          </p>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 theme-transition">
                          {experience.startDate} - {experience.endDate}
                        </p>
                      </div>
                      
                      <p className="mt-3 text-gray-600 dark:text-gray-300 line-clamp-2 theme-transition">
                        {experience.description}
                      </p>
                      
                      <div className="mt-4 flex flex-wrap gap-2">
                        {experience.technologies.slice(0, 4).map((tech, index) => (
                          <span 
                            key={index}
                            className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs theme-transition"
                          >
                            {tech}
                          </span>
                        ))}
                        {experience.technologies.length > 4 && (
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs theme-transition">
                            +{experience.technologies.length - 4} more
                          </span>
                        )}
                      </div>
                      
                      <button className="mt-4 text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium theme-transition">
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Projects Section */}
        {activeSection === 'projects' && (
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2 theme-transition">
              <Code size={24} />
              Projects
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {cvData.projects.map((project) => (
                <div 
                  key={project.id} 
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow theme-transition"
                >
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 theme-transition">
                      {project.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4 theme-transition">
                      {project.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.technologies.map((tech, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs theme-transition"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex flex-wrap gap-3 mt-4">
                      {project.demoAvailable && (
                        <button
                          onClick={() => showDemo(project)}
                          className="btn btn-sm btn-primary"
                        >
                          View Demo
                        </button>
                      )}
                      
                      {project.link && (
                        <a 
                          href={project.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn btn-sm bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 theme-transition"
                        >
                          <ExternalLink size={16} className="mr-1" />
                          Visit Project
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills Section */}
        {activeSection === 'skills' && (
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2 theme-transition">
              <Code size={24} />
              Skills & Expertise
            </h2>
            
            <div className="grid grid-cols-1 gap-6">
              {Object.entries(skillsByCategory).map(([category, skills]) => (
                <div 
                  key={category} 
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm theme-transition"
                >
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 theme-transition">
                      {category}
                    </h3>
                    
                    <div className="space-y-4">
                      {skills.map((skill) => (
                        <div key={skill.id} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <div className="font-medium text-gray-900 dark:text-white theme-transition">
                              {skill.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 theme-transition">
                              {formatSkillLevel(skill.level)}
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 theme-transition">
                            <div 
                              className="bg-primary-600 dark:bg-primary-500 h-2.5 rounded-full transition-all duration-500 ease-out theme-transition" 
                              style={{ width: `${skill.level * 10}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Skill Distribution Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 theme-transition">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 theme-transition">
                Skill Distribution
              </h3>
              
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={skillDistribution}
                    margin={{ top: 10, right: 30, left: 20, bottom: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45} 
                      textAnchor="end" 
                      height={70} 
                      stroke={isDarkMode ? "#9ca3af" : "#374151"}
                    />
                    <YAxis stroke={isDarkMode ? "#9ca3af" : "#374151"} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: isDarkMode ? '#1f2937' : '#fff',
                        borderColor: isDarkMode ? '#374151' : '#e5e7eb',
                        color: isDarkMode ? '#f9fafb' : '#1f2937'
                      }}
                    />
                    <Bar 
                      dataKey="value" 
                      name="Skills" 
                      fill="#6366f1" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-2 theme-transition">
                Distribution of skills by category
              </p>
            </div>
          </section>
        )}

        {/* Education Section */}
        {activeSection === 'education' && (
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2 theme-transition">
              <GraduationCap size={24} />
              Education
            </h2>
            
            <div className="space-y-6">
              {cvData.education.map((edu) => (
                <div 
                  key={edu.id} 
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm theme-transition"
                >
                  <div className="p-6">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white theme-transition">
                          {edu.degree}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 theme-transition">
                          {edu.institution} • {edu.location}
                        </p>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap theme-transition">
                        {edu.startDate} - {edu.endDate}
                      </p>
                    </div>
                    
                    <div className="mt-4 prose dark:prose-invert prose-sm max-w-none theme-transition">
                      <p>{edu.description}</p>
                      
                      <h4 className="font-semibold">Achievements</h4>
                      <ul>
                        {edu.achievements.map((achievement, index) => (
                          <li key={index}>{achievement}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Education Quote */}
            <div className="bg-gray-100 dark:bg-gray-800 border-l-4 border-primary-500 p-5 rounded-r-lg shadow-sm mt-6 theme-transition">
              <div className="flex gap-4 items-start">
                <BookOpen size={24} className="text-primary-600 dark:text-primary-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-gray-700 dark:text-gray-300 italic theme-transition">
                    "Education is not the learning of facts, but the training of the mind to think."
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-2 theme-transition">— Albert Einstein</p>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-6 mt-12 theme-transition">
        <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-400 text-sm theme-transition">
          <p>Copyright © 2025 of Datavtar Private Limited. All rights reserved.</p>
        </div>
      </footer>

      {/* Project Demo Modal */}
      {showProjectDemo && selectedProject && (
        <ProjectDemo project={selectedProject} onClose={() => setShowProjectDemo(false)} />
      )}
    </div>
  );
};

export default App;