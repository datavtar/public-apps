import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import {
  User, ArrowRight, ChevronDown, Download, Briefcase, Calendar, Medal, 
  GraduationCap, Github, Linkedin, Mail, Phone, Globe, Rocket, 
  Code, Brain, Moon, Sun, X, Menu, ChevronUp
} from 'lucide-react';
import styles from './styles/styles.module.css';

// Types and interfaces
type TimelineItem = {
  id: string;
  title: string;
  company: string;
  period: string;
  description: string;
  skills: string[];
  achievements: string[];
  projects?: Project[];
};

type Project = {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  link?: string;
  image?: string;
};

type Education = {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startYear: string;
  endYear: string;
  description?: string;
  achievements?: string[];
};

type Skill = {
  id: string;
  name: string;
  level: number; // 1-5 scale
  category: 'technical' | 'soft' | 'language' | 'tools';
};

type Certificate = {
  id: string;
  name: string;
  issuer: string;
  date: string;
  url?: string;
};

type Contact = {
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  website?: string;
};

type PersonalInfo = {
  name: string;
  title: string;
  summary: string;
  location: string;
  contact: Contact;
  skills: Skill[];
  experience: TimelineItem[];
  education: Education[];
  certificates: Certificate[];
  languages: {name: string, proficiency: string}[];
};

type SectionRef = {
  about: React.RefObject<HTMLDivElement>;
  experience: React.RefObject<HTMLDivElement>;
  education: React.RefObject<HTMLDivElement>;
  skills: React.RefObject<HTMLDivElement>;
  projects: React.RefObject<HTMLDivElement>;
  contact: React.RefObject<HTMLDivElement>;
};

const defaultData: PersonalInfo = {
  name: "Alex Johnson",
  title: "Senior Product Manager",
  summary: "Innovative Product Manager with 8+ years of experience in creating user-centric digital products. Specialized in agile methodologies, data-driven decision making, and leading cross-functional teams to deliver successful products that exceed business objectives.",
  location: "San Francisco, CA",
  contact: {
    email: "alex.johnson@example.com",
    phone: "+1 (555) 123-4567",
    linkedin: "linkedin.com/in/alexjohnson",
    github: "github.com/alexjohnson",
    website: "alexjohnson.example.com"
  },
  skills: [
    { id: "1", name: "Product Strategy", level: 5, category: "technical" },
    { id: "2", name: "User Research", level: 4, category: "technical" },
    { id: "3", name: "Agile/Scrum", level: 5, category: "technical" },
    { id: "4", name: "Data Analysis", level: 4, category: "technical" },
    { id: "5", name: "Wireframing", level: 4, category: "technical" },
    { id: "6", name: "Prototyping", level: 4, category: "technical" },
    { id: "7", name: "A/B Testing", level: 3, category: "technical" },
    { id: "8", name: "Product Roadmapping", level: 5, category: "technical" },
    { id: "9", name: "SQL", level: 3, category: "technical" },
    { id: "10", name: "JavaScript", level: 3, category: "technical" },
    { id: "11", name: "Leadership", level: 4, category: "soft" },
    { id: "12", name: "Communication", level: 5, category: "soft" },
    { id: "13", name: "Problem Solving", level: 5, category: "soft" },
    { id: "14", name: "Stakeholder Management", level: 4, category: "soft" },
    { id: "15", name: "Jira", level: 5, category: "tools" },
    { id: "16", name: "Figma", level: 4, category: "tools" },
    { id: "17", name: "Google Analytics", level: 4, category: "tools" },
    { id: "18", name: "Mixpanel", level: 3, category: "tools" },
  ],
  experience: [
    {
      id: "1",
      title: "Senior Product Manager",
      company: "TechGlobal Inc.",
      period: "Jan 2020 - Present",
      description: "Leading the product strategy and roadmap for the company's flagship SaaS platform serving over 2 million users worldwide.",
      skills: ["Product Strategy", "User Research", "Agile", "Data Analysis"],
      achievements: [
        "Increased user engagement by 45% through implementation of personalized features",
        "Led cross-functional team to successfully launch 6 major product updates",
        "Reduced churn by 25% by identifying and addressing key user pain points"
      ],
      projects: [
        {
          id: "p1",
          title: "AI-Powered Recommendation Engine",
          description: "Led the development of an AI recommendation system that increased conversion rates by 35%",
          technologies: ["Machine Learning", "Python", "Product Strategy"],
          image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
        },
        {
          id: "p2",
          title: "Mobile App Redesign",
          description: "Spearheaded complete UX redesign of mobile application resulting in 28% improvement in user satisfaction",
          technologies: ["UX Design", "Figma", "User Testing"],
          image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
        }
      ]
    },
    {
      id: "2",
      title: "Product Manager",
      company: "InnovateSoft",
      period: "Mar 2017 - Dec 2019",
      description: "Managed the product lifecycle of multiple B2B enterprise solutions, collaborating closely with engineering, design, and marketing teams.",
      skills: ["Product Roadmapping", "Stakeholder Management", "Wireframing", "Agile"],
      achievements: [
        "Launched a new analytics dashboard that became the company's fastest-growing product, generating $1.2M in first-year revenue",
        "Implemented agile methodologies that reduced time-to-market by 30%",
        "Created comprehensive user personas that improved product-market fit across the product line"
      ],
      projects: [
        {
          id: "p3",
          title: "Analytics Dashboard Suite",
          description: "Conceptualized and delivered real-time analytics platform that became company's fastest growing product",
          technologies: ["Data Visualization", "SQL", "Product Strategy"],
          image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
        }
      ]
    },
    {
      id: "3",
      title: "Associate Product Manager",
      company: "DataViz Corp",
      period: "Jun 2015 - Feb 2017",
      description: "Supported the senior product team in developing and enhancing data visualization products for financial services clients.",
      skills: ["User Research", "A/B Testing", "Prototyping", "SQL"],
      achievements: [
        "Conducted user research that led to a 40% improvement in user onboarding completion",
        "Facilitated successful A/B testing program resulting in 15% increase in feature adoption",
        "Collaborated with engineering to resolve over 200 backlog items in 12 months"
      ],
      projects: [
        {
          id: "p4",
          title: "Financial Dashboard Revamp",
          description: "Improved data visualization platform with interactive charting capabilities that reduced analysis time by 50%",
          technologies: ["UX Design", "D3.js", "Financial Data Analysis"],
          image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
        }
      ]
    }
  ],
  education: [
    {
      id: "1",
      institution: "Stanford University",
      degree: "Master of Business Administration",
      field: "Product Management and Innovation",
      startYear: "2013",
      endYear: "2015",
      description: "Specialized in product innovation and technology management. Recipient of the Dean's Award for Academic Excellence.",
      achievements: [
        "Graduated with distinction",
        "Product Innovation Challenge Winner",
        "Technology Leadership Fellowship"
      ]
    },
    {
      id: "2",
      institution: "University of California, Berkeley",
      degree: "Bachelor of Science",
      field: "Computer Science",
      startYear: "2009",
      endYear: "2013",
      description: "Focused on software engineering and human-computer interaction. Active member of the Product Development Club.",
      achievements: [
        "Dean's List (all semesters)",
        "Senior Project Award for Innovation",
        "Undergraduate Research Assistant"
      ]
    }
  ],
  certificates: [
    {
      id: "1",
      name: "Certified Scrum Product Owner (CSPO)",
      issuer: "Scrum Alliance",
      date: "2019",
      url: "https://example.com/cspo"
    },
    {
      id: "2",
      name: "Product Management Certification",
      issuer: "Product School",
      date: "2018",
      url: "https://example.com/pmc"
    },
    {
      id: "3",
      name: "Google Analytics Certification",
      issuer: "Google",
      date: "2017",
      url: "https://example.com/gac"
    }
  ],
  languages: [
    { name: "English", proficiency: "Native" },
    { name: "Spanish", proficiency: "Fluent" },
    { name: "French", proficiency: "Intermediate" }
  ]
};

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      return savedMode === 'true' || 
        (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>(() => {
    const savedData = localStorage.getItem('cv-data');
    return savedData ? JSON.parse(savedData) : defaultData;
  });

  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  // Save data to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('cv-data', JSON.stringify(personalInfo));
  }, [personalInfo]);

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

  // Close menu when Escape key is pressed
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 theme-transition">
        <Routes>
          <Route path="/" element={<HomePage personalInfo={personalInfo} setIsDarkMode={setIsDarkMode} isDarkMode={isDarkMode} isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />} />
          <Route path="/experience/:id" element={<ExperienceDetailPage personalInfo={personalInfo} setIsDarkMode={setIsDarkMode} isDarkMode={isDarkMode} isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />} />
          <Route path="/projects/:id" element={<ProjectDetailPage personalInfo={personalInfo} setIsDarkMode={setIsDarkMode} isDarkMode={isDarkMode} isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />} />
          <Route path="/skills" element={<SkillsPage personalInfo={personalInfo} setIsDarkMode={setIsDarkMode} isDarkMode={isDarkMode} isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />} />
          <Route path="/resume" element={<ResumePage personalInfo={personalInfo} setIsDarkMode={setIsDarkMode} isDarkMode={isDarkMode} isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />} />
          <Route path="/contact" element={<ContactPage personalInfo={personalInfo} setIsDarkMode={setIsDarkMode} isDarkMode={isDarkMode} isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />} />
        </Routes>
      </div>
    </Router>
  );
};

interface PageProps {
  personalInfo: PersonalInfo;
  setIsDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
  isDarkMode: boolean;
  isMenuOpen: boolean;
  setIsMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Header: React.FC<PageProps> = ({ personalInfo, isDarkMode, setIsDarkMode, isMenuOpen, setIsMenuOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isActive = (path: string): boolean => {
    return location.pathname === path;
  };

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 shadow-md theme-transition">
      <div className="container-fluid px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <button 
            onClick={() => navigate('/')} 
            className="text-xl font-bold text-primary-600 dark:text-primary-400 flex items-center gap-2 hover:opacity-80 theme-transition"
            aria-label="Go to home page"
          >
            <User className="h-6 w-6" />
            <span className="hidden sm:inline">{personalInfo.name}</span>
          </button>
        </div>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/" className={`nav-link ${isActive('/') ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'}`}>Home</Link>
          <Link to="/skills" className={`nav-link ${isActive('/skills') ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'}`}>Skills</Link>
          <Link to="/resume" className={`nav-link ${isActive('/resume') ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'}`}>Resume</Link>
          <Link to="/contact" className={`nav-link ${isActive('/contact') ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'}`}>Contact</Link>
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 theme-transition"
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </nav>

        {/* Mobile menu button */}
        <div className="flex items-center md:hidden gap-2">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 theme-transition"
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <button 
            onClick={toggleMenu}
            className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 theme-transition"
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {isMenuOpen && (
        <nav className="md:hidden py-3 px-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 theme-transition">
          <div className="flex flex-col space-y-3">
            <Link 
              to="/" 
              className={`py-2 px-3 rounded-md ${isActive('/') ? 'bg-gray-100 dark:bg-gray-700 text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/skills" 
              className={`py-2 px-3 rounded-md ${isActive('/skills') ? 'bg-gray-100 dark:bg-gray-700 text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Skills
            </Link>
            <Link 
              to="/resume" 
              className={`py-2 px-3 rounded-md ${isActive('/resume') ? 'bg-gray-100 dark:bg-gray-700 text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Resume
            </Link>
            <Link 
              to="/contact" 
              className={`py-2 px-3 rounded-md ${isActive('/contact') ? 'bg-gray-100 dark:bg-gray-700 text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
};

const Footer: React.FC = () => {
  return (
    <footer className="py-6 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 theme-transition mt-auto">
      <div className="container mx-auto px-4 text-center text-gray-500 dark:text-gray-400 text-sm">
        <p>Copyright © 2025 of Datavtar Private Limited. All rights reserved.</p>
      </div>
    </footer>
  );
};

const ScrollToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  return (
    <div className={`fixed bottom-6 right-6 z-10 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <button
        onClick={scrollToTop}
        className="bg-primary-500 hover:bg-primary-600 text-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300"
        aria-label="Scroll to top"
      >
        <ChevronUp className="h-6 w-6" />
      </button>
    </div>
  );
};

const HomePage: React.FC<PageProps> = ({ personalInfo, isDarkMode, setIsDarkMode, isMenuOpen, setIsMenuOpen }) => {
  const navigate = useNavigate();
  const aboutRef = useRef<HTMLDivElement>(null);
  const experienceRef = useRef<HTMLDivElement>(null);
  const educationRef = useRef<HTMLDivElement>(null);
  const skillsRef = useRef<HTMLDivElement>(null);
  const projectsRef = useRef<HTMLDivElement>(null);
  
  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Chart data for skills
  const technicalSkills = personalInfo.skills
    .filter(skill => skill.category === 'technical')
    .sort((a, b) => b.level - a.level)
    .slice(0, 5);

  const skillChartData = technicalSkills.map(skill => ({
    name: skill.name,
    value: skill.level
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A378FF'];

  return (
    <div className="flex flex-col min-h-screen">
      <Header 
        personalInfo={personalInfo} 
        isDarkMode={isDarkMode} 
        setIsDarkMode={setIsDarkMode} 
        isMenuOpen={isMenuOpen} 
        setIsMenuOpen={setIsMenuOpen} 
      />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-800 dark:to-gray-900 theme-transition">
          <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 text-center md:text-left mb-10 md:mb-0">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 text-primary-600 dark:text-primary-400">
                {personalInfo.name}
              </h1>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-medium mb-6 text-gray-700 dark:text-gray-300">
                {personalInfo.title}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mb-8">
                {personalInfo.summary}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <button 
                  onClick={() => scrollToSection(experienceRef)}
                  className="btn btn-primary flex items-center justify-center gap-2"
                  aria-label="View my experience"
                >
                  <span>My Experience</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => navigate('/contact')}
                  className="btn bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 border border-primary-600 dark:border-primary-400 hover:bg-primary-50 dark:hover:bg-gray-700 theme-transition"
                  aria-label="Contact me"
                >
                  Contact Me
                </button>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="max-w-sm w-full">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={skillChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {skillChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">Top Technical Skills</p>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Links */}
        <section className="py-8 bg-white dark:bg-gray-800 shadow-md theme-transition sticky top-16 z-40">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-4">
              <button 
                onClick={() => scrollToSection(aboutRef)}
                className="btn-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 theme-transition"
                aria-label="Scroll to About section"
              >
                About
              </button>
              <button 
                onClick={() => scrollToSection(experienceRef)}
                className="btn-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 theme-transition"
                aria-label="Scroll to Experience section"
              >
                Experience
              </button>
              <button 
                onClick={() => scrollToSection(educationRef)}
                className="btn-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 theme-transition"
                aria-label="Scroll to Education section"
              >
                Education
              </button>
              <button 
                onClick={() => scrollToSection(skillsRef)}
                className="btn-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 theme-transition"
                aria-label="Scroll to Skills section"
              >
                Skills
              </button>
              <button 
                onClick={() => scrollToSection(projectsRef)}
                className="btn-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 theme-transition"
                aria-label="Scroll to Projects section"
              >
                Projects
              </button>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section ref={aboutRef} className="py-16 bg-gray-50 dark:bg-gray-900 theme-transition">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8 text-center text-gray-800 dark:text-white">
              About Me
            </h2>
            <div className="max-w-3xl mx-auto">
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                {personalInfo.summary}
              </p>
              <div className="flex flex-wrap justify-center gap-6 mt-10">
                <div className="flex items-center">
                  <Briefcase className="h-5 w-5 text-primary-500 mr-2" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {personalInfo.experience.length} years experience
                  </span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-primary-500 mr-2" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {personalInfo.experience[0].period}
                  </span>
                </div>
                <div className="flex items-center">
                  <GraduationCap className="h-5 w-5 text-primary-500 mr-2" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {personalInfo.education[0].degree}
                  </span>
                </div>
                <div className="flex items-center">
                  <Medal className="h-5 w-5 text-primary-500 mr-2" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {personalInfo.certificates.length} certifications
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Experience Section */}
        <section ref={experienceRef} className="py-16 bg-white dark:bg-gray-800 theme-transition">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8 text-center text-gray-800 dark:text-white">
              My Experience
            </h2>
            <div className="max-w-4xl mx-auto">
              <div className="space-y-12">
                {personalInfo.experience.map((exp) => (
                  <div key={exp.id} className="card-responsive hover:shadow-lg transition-all duration-300">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{exp.title}</h3>
                        <p className="text-lg text-primary-600 dark:text-primary-400">{exp.company}</p>
                      </div>
                      <div className="text-gray-500 dark:text-gray-400 mt-2 md:mt-0">
                        {exp.period}
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">{exp.description}</p>
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Key Skills:</h4>
                      <div className="flex flex-wrap gap-2">
                        {exp.skills.map((skill, index) => (
                          <span 
                            key={index}
                            className="badge badge-primary"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="mb-6">
                      <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Key Achievements:</h4>
                      <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-300">
                        {exp.achievements.map((achievement, index) => (
                          <li key={index}>{achievement}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex justify-end">
                      <button 
                        onClick={() => navigate(`/experience/${exp.id}`)}
                        className="btn-sm bg-primary-50 dark:bg-gray-700 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-gray-600 flex items-center gap-1 theme-transition"
                        aria-label={`View details about ${exp.title} position`}
                      >
                        View Details
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Education Section */}
        <section ref={educationRef} className="py-16 bg-gray-50 dark:bg-gray-900 theme-transition">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8 text-center text-gray-800 dark:text-white">
              Education
            </h2>
            <div className="max-w-4xl mx-auto">
              <div className="space-y-8">
                {personalInfo.education.map((edu) => (
                  <div key={edu.id} className="card-responsive hover:shadow-lg transition-all duration-300">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{edu.degree}</h3>
                        <p className="text-lg text-primary-600 dark:text-primary-400">{edu.institution}</p>
                        <p className="text-gray-600 dark:text-gray-300">{edu.field}</p>
                      </div>
                      <div className="text-gray-500 dark:text-gray-400 mt-2 md:mt-0">
                        {edu.startYear} - {edu.endYear}
                      </div>
                    </div>
                    {edu.description && (
                      <p className="text-gray-600 dark:text-gray-300 mb-4">{edu.description}</p>
                    )}
                    {edu.achievements && edu.achievements.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Achievements:</h4>
                        <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-300">
                          {edu.achievements.map((achievement, index) => (
                            <li key={index}>{achievement}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Skills Section */}
        <section ref={skillsRef} className="py-16 bg-white dark:bg-gray-800 theme-transition">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8 text-center text-gray-800 dark:text-white">
              Skills & Expertise
            </h2>
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="card-responsive">
                  <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">Technical Skills</h3>
                  <div className="space-y-4">
                    {personalInfo.skills
                      .filter(skill => skill.category === 'technical')
                      .map(skill => (
                        <div key={skill.id} className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-700 dark:text-gray-300">{skill.name}</span>
                            <span className="text-gray-500 dark:text-gray-400">{skill.level}/5</span>
                          </div>
                          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary-500 dark:bg-primary-400 rounded-full" 
                              style={{ width: `${(skill.level / 5) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </div>
                <div className="card-responsive">
                  <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">Soft Skills & Tools</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                    <div>
                      <h4 className="font-medium mb-3 text-gray-700 dark:text-gray-300">Soft Skills</h4>
                      <div className="space-y-3">
                        {personalInfo.skills
                          .filter(skill => skill.category === 'soft')
                          .map(skill => (
                            <div key={skill.id} className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${getSkillLevelColor(skill.level)}`}></div>
                              <span className="text-gray-600 dark:text-gray-400">{skill.name}</span>
                            </div>
                          ))
                        }
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-3 text-gray-700 dark:text-gray-300">Tools & Software</h4>
                      <div className="space-y-3">
                        {personalInfo.skills
                          .filter(skill => skill.category === 'tools')
                          .map(skill => (
                            <div key={skill.id} className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${getSkillLevelColor(skill.level)}`}></div>
                              <span className="text-gray-600 dark:text-gray-400">{skill.name}</span>
                            </div>
                          ))
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-8 text-center">
                <button 
                  onClick={() => navigate('/skills')}
                  className="btn btn-primary"
                  aria-label="View all skills"
                >
                  View All Skills
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Projects Section */}
        <section ref={projectsRef} className="py-16 bg-gray-50 dark:bg-gray-900 theme-transition">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8 text-center text-gray-800 dark:text-white">
              Featured Projects
            </h2>
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {personalInfo.experience
                  .flatMap(exp => exp.projects || [])
                  .slice(0, 3)
                  .map(project => (
                    <div key={project.id} className="card-responsive hover:shadow-lg transition-all duration-300">
                      <div className="aspect-w-16 aspect-h-9 mb-4 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                        {project.image ? (
                          <img 
                            src={project.image} 
                            alt={project.title} 
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                            <Rocket className="h-12 w-12" />
                          </div>
                        )}
                      </div>
                      <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{project.title}</h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">{project.description}</p>
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                          {project.technologies.map((tech, index) => (
                            <span 
                              key={index}
                              className="badge bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 theme-transition"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <button 
                          onClick={() => navigate(`/projects/${project.id}`)}
                          className="btn-sm bg-primary-50 dark:bg-gray-700 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-gray-600 flex items-center gap-1 theme-transition"
                          aria-label={`View details about ${project.title} project`}
                        >
                          View Project
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 bg-primary-600 dark:bg-primary-700 text-white theme-transition">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to work together?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">Let's discuss how I can contribute to your team and help achieve your product goals.</p>
            <button 
              onClick={() => navigate('/contact')}
              className="btn bg-white text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-200 transition duration-300"
              aria-label="Contact me to discuss opportunities"
            >
              Get in Touch
            </button>
          </div>
        </section>
        
        <ScrollToTopButton />
      </main>
      
      <Footer />
    </div>
  );
};

const ExperienceDetailPage: React.FC<PageProps> = ({ personalInfo, isDarkMode, setIsDarkMode, isMenuOpen, setIsMenuOpen }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const experience = personalInfo.experience.find(exp => exp.id === id);

  if (!experience) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header 
          personalInfo={personalInfo} 
          isDarkMode={isDarkMode} 
          setIsDarkMode={setIsDarkMode} 
          isMenuOpen={isMenuOpen} 
          setIsMenuOpen={setIsMenuOpen} 
        />
        <main className="flex-grow flex items-center justify-center py-20 bg-gray-50 dark:bg-gray-900 theme-transition">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Experience not found</h2>
            <button 
              onClick={() => navigate('/')}
              className="btn btn-primary"
              aria-label="Go back to home page"
            >
              Go Back Home
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header 
        personalInfo={personalInfo} 
        isDarkMode={isDarkMode} 
        setIsDarkMode={setIsDarkMode} 
        isMenuOpen={isMenuOpen} 
        setIsMenuOpen={setIsMenuOpen} 
      />
      
      <main className="flex-grow">
        <div className="py-6 bg-gray-100 dark:bg-gray-800 theme-transition">
          <div className="container mx-auto px-4">
            <button 
              onClick={() => navigate('/')}
              className="btn-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-1 mb-4 theme-transition"
              aria-label="Go back to home page"
            >
              ← Back
            </button>
            <div className="card-responsive">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{experience.title}</h1>
                  <p className="text-xl text-primary-600 dark:text-primary-400">{experience.company}</p>
                </div>
                <div className="text-gray-500 dark:text-gray-400 mt-2 md:mt-0">
                  {experience.period}
                </div>
              </div>

              <div className="prose dark:prose-invert max-w-none mb-8">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Role Overview</h2>
                <p className="text-gray-600 dark:text-gray-300">{experience.description}</p>
              </div>

              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Key Skills & Technologies</h2>
                <div className="flex flex-wrap gap-2">
                  {experience.skills.map((skill, index) => (
                    <span 
                      key={index}
                      className="badge badge-primary"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Key Achievements</h2>
                <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-300">
                  {experience.achievements.map((achievement, index) => (
                    <li key={index}>{achievement}</li>
                  ))}
                </ul>
              </div>

              {experience.projects && experience.projects.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Notable Projects</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {experience.projects.map(project => (
                      <div key={project.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow duration-300">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">{project.title}</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">{project.description}</p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {project.technologies.map((tech, index) => (
                            <span 
                              key={index}
                              className="badge bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 theme-transition"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                        <div className="flex justify-end">
                          <button 
                            onClick={() => navigate(`/projects/${project.id}`)}
                            className="btn-sm bg-primary-50 dark:bg-gray-700 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-gray-600 flex items-center gap-1 theme-transition"
                            aria-label={`View details about ${project.title} project`}
                          >
                            View Project
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 justify-center sm:justify-start mt-8">
                <button 
                  onClick={() => navigate('/')}
                  className="btn btn-secondary flex items-center justify-center gap-2"
                  aria-label="Go back to home page"
                >
                  Back to Home
                </button>
                <button 
                  onClick={() => navigate('/contact')}
                  className="btn btn-primary flex items-center justify-center gap-2"
                  aria-label="Contact me"
                >
                  Contact Me
                </button>
              </div>
            </div>
          </div>
        </div>
        <ScrollToTopButton />
      </main>
      
      <Footer />
    </div>
  );
};

const ProjectDetailPage: React.FC<PageProps> = ({ personalInfo, isDarkMode, setIsDarkMode, isMenuOpen, setIsMenuOpen }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  // Find the project across all experiences
  const project = personalInfo.experience
    .flatMap(exp => exp.projects || [])
    .find(proj => proj?.id === id);

  // Find which experience this project belongs to
  const parentExperience = personalInfo.experience
    .find(exp => exp.projects?.some(proj => proj.id === id));

  if (!project || !parentExperience) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header 
          personalInfo={personalInfo} 
          isDarkMode={isDarkMode} 
          setIsDarkMode={setIsDarkMode} 
          isMenuOpen={isMenuOpen} 
          setIsMenuOpen={setIsMenuOpen} 
        />
        <main className="flex-grow flex items-center justify-center py-20 bg-gray-50 dark:bg-gray-900 theme-transition">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Project not found</h2>
            <button 
              onClick={() => navigate('/')}
              className="btn btn-primary"
              aria-label="Go back to home page"
            >
              Go Back Home
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header 
        personalInfo={personalInfo} 
        isDarkMode={isDarkMode} 
        setIsDarkMode={setIsDarkMode} 
        isMenuOpen={isMenuOpen} 
        setIsMenuOpen={setIsMenuOpen} 
      />
      
      <main className="flex-grow">
        <div className="py-6 bg-gray-100 dark:bg-gray-800 theme-transition">
          <div className="container mx-auto px-4">
            <button 
              onClick={() => navigate(-1)}
              className="btn-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-1 mb-4 theme-transition"
              aria-label="Go back"
            >
              ← Back
            </button>
            <div className="card-responsive">
              <div className="mb-8">
                {project.image ? (
                  <div className="aspect-w-16 aspect-h-9 mb-6 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                    <img 
                      src={project.image} 
                      alt={project.title} 
                      className="object-cover w-full h-full"
                    />
                  </div>
                ) : null}
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">{project.title}</h1>
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="text-gray-600 dark:text-gray-400">Project at:</span>
                  <button 
                    onClick={() => navigate(`/experience/${parentExperience.id}`)}
                    className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
                    aria-label={`View ${parentExperience.company} experience details`}
                  >
                    {parentExperience.company}
                  </button>
                  <span className="text-gray-500 dark:text-gray-400">({parentExperience.period})</span>
                </div>
              </div>

              <div className="prose dark:prose-invert max-w-none mb-8">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Project Overview</h2>
                <p className="text-gray-600 dark:text-gray-300">{project.description}</p>
              </div>

              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Technologies Used</h2>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech, index) => (
                    <span 
                      key={index}
                      className="badge badge-primary"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {project.link && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Project Link</h2>
                  <a 
                    href={project.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-2"
                    aria-label={`Visit ${project.title} project website`}
                  >
                    <Globe className="h-5 w-5" />
                    Visit Project
                  </a>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 justify-center sm:justify-start mt-8">
                <button 
                  onClick={() => navigate(`/experience/${parentExperience.id}`)}
                  className="btn btn-secondary flex items-center justify-center gap-2"
                  aria-label={`View ${parentExperience.title} experience details`}
                >
                  View Related Experience
                </button>
                <button 
                  onClick={() => navigate('/')}
                  className="btn btn-primary flex items-center justify-center gap-2"
                  aria-label="Go back to home page"
                >
                  Back to Home
                </button>
              </div>
            </div>
          </div>
        </div>
        <ScrollToTopButton />
      </main>
      
      <Footer />
    </div>
  );
};

const SkillsPage: React.FC<PageProps> = ({ personalInfo, isDarkMode, setIsDarkMode, isMenuOpen, setIsMenuOpen }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'technical' | 'soft' | 'tools'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Filter skills based on active tab and search term
  const filteredSkills = personalInfo.skills.filter(skill => {
    const matchesTab = activeTab === 'all' || skill.category === activeTab;
    const matchesSearch = skill.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Prepare data for chart
  const topSkills = [...personalInfo.skills]
    .sort((a, b) => b.level - a.level)
    .slice(0, 5);

  const chartData = topSkills.map(skill => ({
    name: skill.name,
    value: skill.level
  }));

  return (
    <div className="flex flex-col min-h-screen">
      <Header 
        personalInfo={personalInfo} 
        isDarkMode={isDarkMode} 
        setIsDarkMode={setIsDarkMode} 
        isMenuOpen={isMenuOpen} 
        setIsMenuOpen={setIsMenuOpen} 
      />
      
      <main className="flex-grow">
        <section className="py-12 bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-800 dark:to-gray-900 theme-transition">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-4">Skills & Expertise</h1>
            <p className="text-lg text-center text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8">
              A comprehensive overview of my technical abilities, soft skills, and tools proficiency.
            </p>

            <div className="max-w-3xl mx-auto">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-8 theme-transition">
                <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md px-4 py-2 focus-within:ring-2 focus-within:ring-primary-500 dark:focus-within:ring-primary-400 theme-transition">
                  <input
                    type="text"
                    placeholder="Search skills..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-gray-700 dark:text-gray-300 placeholder-gray-500 dark:placeholder-gray-400 theme-transition"
                    aria-label="Search skills"
                  />
                  <button 
                    onClick={() => setSearchTerm('')}
                    className={`text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition ${!searchTerm ? 'hidden' : ''}`}
                    aria-label="Clear search"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-2 mb-8">
                <button 
                  onClick={() => setActiveTab('all')}
                  className={`btn-sm ${activeTab === 'all' ? 'btn-primary' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'} theme-transition`}
                  aria-label="Show all skills"
                  aria-pressed={activeTab === 'all'}
                >
                  All
                </button>
                <button 
                  onClick={() => setActiveTab('technical')}
                  className={`btn-sm ${activeTab === 'technical' ? 'btn-primary' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'} theme-transition`}
                  aria-label="Show only technical skills"
                  aria-pressed={activeTab === 'technical'}
                >
                  Technical
                </button>
                <button 
                  onClick={() => setActiveTab('soft')}
                  className={`btn-sm ${activeTab === 'soft' ? 'btn-primary' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'} theme-transition`}
                  aria-label="Show only soft skills"
                  aria-pressed={activeTab === 'soft'}
                >
                  Soft Skills
                </button>
                <button 
                  onClick={() => setActiveTab('tools')}
                  className={`btn-sm ${activeTab === 'tools' ? 'btn-primary' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'} theme-transition`}
                  aria-label="Show only tools"
                  aria-pressed={activeTab === 'tools'}
                >
                  Tools
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                <div className="card-responsive">
                  <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">Top Skills</h2>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
                      >
                        <XAxis type="number" domain={[0, 5]} />  
                        <YAxis type="category" dataKey="name" />  
                        <Tooltip formatter={(value) => [`${value}/5`, 'Level']} />  
                        <Bar dataKey="value" fill="#8884d8" name="Skill Level" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div className="card-responsive">
                  <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">Skills By Category</h2>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Technical', value: personalInfo.skills.filter(s => s.category === 'technical').length },
                            { name: 'Soft Skills', value: personalInfo.skills.filter(s => s.category === 'soft').length },
                            { name: 'Tools', value: personalInfo.skills.filter(s => s.category === 'tools').length }
                          ]}
                          cx="50%"
                          cy="50%"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          <Cell fill="#0088FE" />
                          <Cell fill="#00C49F" />
                          <Cell fill="#FFBB28" />
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="card-responsive">
                <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-gray-200">
                  {activeTab === 'all' ? 'All Skills' : 
                    activeTab === 'technical' ? 'Technical Skills' : 
                    activeTab === 'soft' ? 'Soft Skills' : 'Tools & Software'}
                  {searchTerm && ` matching "${searchTerm}"`}
                  {filteredSkills.length > 0 && ` (${filteredSkills.length})`}
                </h2>
                
                {filteredSkills.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">No skills found matching your criteria.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {filteredSkills.map(skill => (
                      <div key={skill.id} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0 last:pb-0 theme-transition">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                          <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">{skill.name}</h3>
                          <div className="flex items-center mt-1 sm:mt-0">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <div 
                                  key={i} 
                                  className={`w-6 h-6 rounded-full flex items-center justify-center mr-1 ${i < skill.level ? 'bg-primary-500 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-400 dark:text-gray-500'} theme-transition`}
                                >
                                  {i + 1}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div>
                          <span className={`text-sm rounded-full px-3 py-1 ${getCategoryBadgeColor(skill.category)} theme-transition`}>
                            {skill.category === 'technical' ? 'Technical' : 
                             skill.category === 'soft' ? 'Soft Skill' : 'Tool'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {personalInfo.languages.length > 0 && (
                <div className="card-responsive mt-8">
                  <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-gray-200">Languages</h2>
                  <div className="space-y-4">
                    {personalInfo.languages.map((language, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-gray-700 dark:text-gray-300">{language.name}</span>
                        <span className="badge badge-info">{language.proficiency}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
        <ScrollToTopButton />
      </main>
      
      <Footer />
    </div>
  );
};

const ResumePage: React.FC<PageProps> = ({ personalInfo, isDarkMode, setIsDarkMode, isMenuOpen, setIsMenuOpen }) => {
  const generatePDF = () => {
    alert('PDF resume would be generated here in a real implementation.');
    // In a real implementation, this would generate and download a PDF
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header 
        personalInfo={personalInfo} 
        isDarkMode={isDarkMode} 
        setIsDarkMode={setIsDarkMode} 
        isMenuOpen={isMenuOpen} 
        setIsMenuOpen={setIsMenuOpen} 
      />
      
      <main className="flex-grow bg-gray-50 dark:bg-gray-900 theme-transition">
        <section className="py-10">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Resume</h1>
              <button 
                onClick={generatePDF}
                className="btn btn-primary flex items-center gap-2"
                aria-label="Download resume as PDF"
              >
                <Download className="h-5 w-5" />
                Download PDF
              </button>
            </div>
            
            <div className="card-responsive mb-8 print:shadow-none">
              <div className="flex flex-col md:flex-row justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{personalInfo.name}</h2>
                  <p className="text-xl text-primary-600 dark:text-primary-400">{personalInfo.title}</p>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">{personalInfo.location}</p>
                </div>
                <div className="mt-4 md:mt-0 space-y-1">
                  <div className="flex items-center text-gray-700 dark:text-gray-300">
                    <Mail className="h-4 w-4 mr-2" />
                    <a href={`mailto:${personalInfo.contact.email}`} className="hover:text-primary-600 dark:hover:text-primary-400">
                      {personalInfo.contact.email}
                    </a>
                  </div>
                  <div className="flex items-center text-gray-700 dark:text-gray-300">
                    <Phone className="h-4 w-4 mr-2" />
                    <a href={`tel:${personalInfo.contact.phone}`} className="hover:text-primary-600 dark:hover:text-primary-400">
                      {personalInfo.contact.phone}
                    </a>
                  </div>
                  <div className="flex items-center text-gray-700 dark:text-gray-300">
                    <Linkedin className="h-4 w-4 mr-2" />
                    <a href={`https://${personalInfo.contact.linkedin}`} target="_blank" rel="noopener noreferrer" className="hover:text-primary-600 dark:hover:text-primary-400">
                      {personalInfo.contact.linkedin}
                    </a>
                  </div>
                  <div className="flex items-center text-gray-700 dark:text-gray-300">
                    <Github className="h-4 w-4 mr-2" />
                    <a href={`https://${personalInfo.contact.github}`} target="_blank" rel="noopener noreferrer" className="hover:text-primary-600 dark:hover:text-primary-400">
                      {personalInfo.contact.github}
                    </a>
                  </div>
                </div>
              </div>
              
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2 border-b border-gray-200 dark:border-gray-700 pb-2">Summary</h3>
                <p className="text-gray-600 dark:text-gray-300">{personalInfo.summary}</p>
              </div>
              
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Experience</h3>
                <div className="space-y-6">
                  {personalInfo.experience.map((exp) => (
                    <div key={exp.id} className="border-b border-gray-200 dark:border-gray-700 last:border-0 pb-6 last:pb-0">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                        <div>
                          <h4 className="text-md font-bold text-gray-900 dark:text-white">{exp.title}</h4>
                          <p className="text-primary-600 dark:text-primary-400">{exp.company}</p>
                        </div>
                        <div className="text-gray-500 dark:text-gray-400 mt-1 sm:mt-0">
                          {exp.period}
                        </div>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">{exp.description}</p>
                      <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-300 space-y-1 mb-2">
                        {exp.achievements.map((achievement, index) => (
                          <li key={index}>{achievement}</li>
                        ))}
                      </ul>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {exp.skills.map((skill, index) => (
                          <span 
                            key={index}
                            className="inline-block text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full theme-transition"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Education</h3>
                <div className="space-y-6">
                  {personalInfo.education.map((edu) => (
                    <div key={edu.id} className="border-b border-gray-200 dark:border-gray-700 last:border-0 pb-6 last:pb-0">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                        <div>
                          <h4 className="text-md font-bold text-gray-900 dark:text-white">{edu.degree}</h4>
                          <p className="text-primary-600 dark:text-primary-400">{edu.institution}</p>
                          <p className="text-gray-600 dark:text-gray-300 text-sm">{edu.field}</p>
                        </div>
                        <div className="text-gray-500 dark:text-gray-400 mt-1 sm:mt-0">
                          {edu.startYear} - {edu.endYear}
                        </div>
                      </div>
                      {edu.achievements && edu.achievements.length > 0 && (
                        <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-300 space-y-1 mt-2">
                          {edu.achievements.map((achievement, index) => (
                            <li key={index}>{achievement}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Skills</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Technical Skills</h4>
                    <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-300 space-y-1">
                      {personalInfo.skills
                        .filter(skill => skill.category === 'technical')
                        .map(skill => (
                          <li key={skill.id}>{skill.name}</li>
                        ))
                      }
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Soft Skills</h4>
                    <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-300 space-y-1">
                      {personalInfo.skills
                        .filter(skill => skill.category === 'soft')
                        .map(skill => (
                          <li key={skill.id}>{skill.name}</li>
                        ))
                      }
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Tools & Software</h4>
                    <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-300 space-y-1">
                      {personalInfo.skills
                        .filter(skill => skill.category === 'tools')
                        .map(skill => (
                          <li key={skill.id}>{skill.name}</li>
                        ))
                      }
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Certifications</h3>
                <div className="space-y-3">
                  {personalInfo.certificates.map((cert) => (
                    <div key={cert.id} className="flex flex-col sm:flex-row sm:items-center justify-between">
                      <div>
                        <h4 className="text-md font-medium text-gray-800 dark:text-gray-200">{cert.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{cert.issuer}</p>
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 sm:mt-0">
                        {cert.date}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Languages</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {personalInfo.languages.map((lang, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-gray-700 dark:text-gray-300">{lang.name}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{lang.proficiency}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
        <ScrollToTopButton />
      </main>
      
      <Footer />
    </div>
  );
};

const ContactPage: React.FC<PageProps> = ({ personalInfo, isDarkMode, setIsDarkMode, isMenuOpen, setIsMenuOpen }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user types
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.subject.trim()) {
      errors.subject = 'Subject is required';
    }
    
    if (!formData.message.trim()) {
      errors.message = 'Message is required';
    } else if (formData.message.length < 10) {
      errors.message = 'Message must be at least 10 characters';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      // Simulate API call with timeout
      setTimeout(() => {
        setIsSubmitting(false);
        setSubmitSuccess(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
        
        // Reset success message after 5 seconds
        setTimeout(() => setSubmitSuccess(false), 5000);
      }, 1500);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header 
        personalInfo={personalInfo} 
        isDarkMode={isDarkMode} 
        setIsDarkMode={setIsDarkMode} 
        isMenuOpen={isMenuOpen} 
        setIsMenuOpen={setIsMenuOpen} 
      />
      
      <main className="flex-grow bg-gray-50 dark:bg-gray-900 theme-transition">
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">Get In Touch</h1>
            
            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1 space-y-6">
                  <div className="card-responsive">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Contact Information</h2>
                    
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <Mail className="h-5 w-5 text-primary-500 mt-1 mr-3" />
                        <div>
                          <p className="font-medium text-gray-700 dark:text-gray-300">Email</p>
                          <a 
                            href={`mailto:${personalInfo.contact.email}`} 
                            className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition"
                          >
                            {personalInfo.contact.email}
                          </a>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <Phone className="h-5 w-5 text-primary-500 mt-1 mr-3" />
                        <div>
                          <p className="font-medium text-gray-700 dark:text-gray-300">Phone</p>
                          <a 
                            href={`tel:${personalInfo.contact.phone}`} 
                            className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition"
                          >
                            {personalInfo.contact.phone}
                          </a>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <Globe className="h-5 w-5 text-primary-500 mt-1 mr-3" />
                        <div>
                          <p className="font-medium text-gray-700 dark:text-gray-300">Location</p>
                          <p className="text-gray-600 dark:text-gray-400">{personalInfo.location}</p>
                        </div>
                      </div>
                      
                      <div className="pt-4 flex items-center space-x-4">
                        <a 
                          href={`https://${personalInfo.contact.linkedin}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition"
                          aria-label="LinkedIn profile"
                        >
                          <Linkedin className="h-6 w-6" />
                        </a>
                        <a 
                          href={`https://${personalInfo.contact.github}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition"
                          aria-label="GitHub profile"
                        >
                          <Github className="h-6 w-6" />
                        </a>
                        {personalInfo.contact.website && (
                          <a 
                            href={`https://${personalInfo.contact.website}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition"
                            aria-label="Personal website"
                          >
                            <Globe className="h-6 w-6" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <div className="card-responsive">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-6">Send Me a Message</h2>
                    
                    {submitSuccess && (
                      <div className="alert alert-success mb-6">
                        <p>Thank you for your message! I'll get back to you soon.</p>
                      </div>
                    )}
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="form-group">
                          <label htmlFor="name" className="form-label">Your Name</label>
                          <input 
                            type="text" 
                            id="name" 
                            name="name" 
                            value={formData.name}
                            onChange={handleChange}
                            className={`input ${formErrors.name ? 'border-red-500 dark:border-red-400' : ''}`}
                            placeholder="John Doe"
                          />
                          {formErrors.name && <p className="form-error">{formErrors.name}</p>}
                        </div>
                        
                        <div className="form-group">
                          <label htmlFor="email" className="form-label">Your Email</label>
                          <input 
                            type="email" 
                            id="email" 
                            name="email" 
                            value={formData.email}
                            onChange={handleChange}
                            className={`input ${formErrors.email ? 'border-red-500 dark:border-red-400' : ''}`}
                            placeholder="john@example.com"
                          />
                          {formErrors.email && <p className="form-error">{formErrors.email}</p>}
                        </div>
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="subject" className="form-label">Subject</label>
                        <input 
                          type="text" 
                          id="subject" 
                          name="subject" 
                          value={formData.subject}
                          onChange={handleChange}
                          className={`input ${formErrors.subject ? 'border-red-500 dark:border-red-400' : ''}`}
                          placeholder="Project Inquiry"
                        />
                        {formErrors.subject && <p className="form-error">{formErrors.subject}</p>}
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="message" className="form-label">Message</label>
                        <textarea 
                          id="message" 
                          name="message" 
                          rows={5} 
                          value={formData.message}
                          onChange={handleChange}
                          className={`input ${formErrors.message ? 'border-red-500 dark:border-red-400' : ''}`}
                          placeholder="Your message here..."
                        ></textarea>
                        {formErrors.message && <p className="form-error">{formErrors.message}</p>}
                      </div>
                      
                      <div className="flex justify-end">
                        <button 
                          type="submit" 
                          className={`btn btn-primary ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                          disabled={isSubmitting}
                          aria-label="Send message"
                        >
                          {isSubmitting ? 'Sending...' : 'Send Message'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <ScrollToTopButton />
      </main>
      
      <Footer />
    </div>
  );
};

// Helper functions
const getSkillLevelColor = (level: number): string => {
  if (level >= 5) return 'bg-green-500 dark:bg-green-400';
  if (level >= 4) return 'bg-blue-500 dark:bg-blue-400';
  if (level >= 3) return 'bg-yellow-500 dark:bg-yellow-400';
  if (level >= 2) return 'bg-orange-500 dark:bg-orange-400';
  return 'bg-red-500 dark:bg-red-400';
};

const getCategoryBadgeColor = (category: string): string => {
  switch (category) {
    case 'technical':
      return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
    case 'soft':
      return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
    case 'tools':
      return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200';
    default:
      return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200';
  }
};

export default App;
