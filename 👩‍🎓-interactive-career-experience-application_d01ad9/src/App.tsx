import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Link, useNavigate, BrowserRouter } from 'react-router-dom';
import { Bar, XAxis, YAxis } from 'recharts'; // Corrected: Imported XAxis, YAxis from recharts
// Removed useForm import
import { format } from 'date-fns';
import styles from './styles/styles.module.css';
import {
  User,
  Briefcase,
  Award,
  GraduationCap,
  Code,
  Download,
  Upload,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Github,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  Sun,
  Moon,
  FileText,
  X,
  Menu,
  ChevronRight,
  ExternalLink,
  // Removed StarIcon
  Rocket,
  FileImage,
  Search,
  Zap,
  // Removed incorrect imports of XAxis, YAxis from lucide-react
} from 'lucide-react';

// Define TypeScript interfaces for our data models
interface ResumeData {
  personalInfo: PersonalInfo;
  summary: string;
  workExperience: WorkExperience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
  certifications: Certification[];
  languages: Language[];
}

interface PersonalInfo {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  website?: string;
  linkedIn?: string;
  github?: string;
  photo?: string;
}

interface WorkExperience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string | null;
  description: string;
  highlights: string[];
  technologies: string[];
  accomplishments?: string[];
}

interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string | null;
  grade?: string;
  activities?: string[];
}

interface Skill {
  id: string;
  name: string;
  level: number; // 1-5
  category: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  link?: string;
  githubLink?: string;
  image?: string;
  accomplishments: string[];
}

interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  link?: string;
}

interface Language {
  id: string;
  name: string;
  proficiency: 'Basic' | 'Intermediate' | 'Fluent' | 'Native';
}

interface DemoBubble {
  id: string;
  title: string;
  description: string;
  color: string;
  icon: React.ReactNode;
}

const App: React.FC = () => {
  // State for theme toggle
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      return savedMode === 'true' || 
        (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  
  // State for mobile menu
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  
  // State for modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalType, setModalType] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // State for resume data
  const [resumeData, setResumeData] = useState<ResumeData>(() => {
    const savedData = localStorage.getItem('resumeData');
    if (savedData) {
      return JSON.parse(savedData);
    }
    
    // Default resume data
    return {
      personalInfo: {
        name: 'Alex Johnson',
        title: 'Product Manager & Full Stack Developer',
        email: 'alex.johnson@example.com',
        phone: '+1 (555) 123-4567',
        location: 'San Francisco, CA',
        website: 'www.alexjohnson.dev',
        linkedIn: 'linkedin.com/in/alexjohnson',
        github: 'github.com/alexjohnson',
        photo: '',
      },
      summary: 'Product Manager with 8+ years of experience bridging the gap between business and technology. Passionate about creating user-centric products that solve real problems. Strong technical background in full-stack development enables me to collaborate effectively with engineering teams and provide practical insights for product solutions.',
      workExperience: [
        {
          id: '1',
          company: 'TechInnovate',
          position: 'Senior Product Manager',
          startDate: '2020-01',
          endDate: null,
          description: 'Leading product strategy and development for AI-powered analytics platform serving enterprise clients.',
          highlights: [
            'Led cross-functional team to launch 3 major product features resulting in 35% revenue growth',
            'Implemented Agile methodologies that improved delivery time by 40%',
            'Created product roadmap and vision for next-generation analytics platform'
          ],
          technologies: ['JIRA', 'Product Analytics', 'SQL', 'Figma', 'User Research', 'A/B Testing'],
          accomplishments: [
            'Received company-wide innovation award for AI feature implementation',
            'Reduced customer churn by 25% through targeted product improvements'
          ]
        },
        {
          id: '2',
          company: 'DataVision Inc.',
          position: 'Product Manager',
          startDate: '2017-03',
          endDate: '2019-12',
          description: 'Managed full product lifecycle for business intelligence dashboard application.',
          highlights: [
            'Defined product requirements and specifications for development team',
            'Conducted user research to identify pain points and opportunities',
            'Collaborated with engineering to prioritize backlog and features'
          ],
          technologies: ['Product Roadmapping', 'Google Analytics', 'Tableau', 'ReactJS', 'Node.js'],
          accomplishments: [
            'Grew monthly active users by 200% in 18 months',
            'Successfully launched mobile version of dashboard application'
          ]
        },
        {
          id: '3',
          company: 'WebSolutions',
          position: 'Full Stack Developer',
          startDate: '2015-06',
          endDate: '2017-02',
          description: 'Developed web applications and integrated systems for enterprise clients.',
          highlights: [
            'Built responsive web applications using React and Node.js',
            'Designed and implemented RESTful APIs for client services',
            'Optimized database queries and application performance'
          ],
          technologies: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Express', 'GraphQL', 'AWS'],
          accomplishments: [
            'Reduced page load time by 60% through code optimization',
            'Implemented CI/CD pipeline that reduced deployment time by 75%'
          ]
        }
      ],
      education: [
        {
          id: '1',
          institution: 'Stanford University',
          degree: 'Master of Science',
          field: 'Computer Science',
          startDate: '2013-09',
          endDate: '2015-05',
          grade: '3.9 GPA',
          activities: ['Research Assistant - AI Lab', 'Hackathon Organizer']
        },
        {
          id: '2',
          institution: 'University of California, Berkeley',
          degree: 'Bachelor of Science',
          field: 'Computer Science',
          startDate: '2009-09',
          endDate: '2013-05',
          grade: '3.8 GPA',
          activities: ['Software Engineering Club', 'Undergraduate Research']
        }
      ],
      skills: [
        { id: '1', name: 'Product Management', level: 5, category: 'Business' },
        { id: '2', name: 'User Research', level: 5, category: 'Business' },
        { id: '3', name: 'Agile Methodology', level: 4, category: 'Business' },
        { id: '4', name: 'Product Analytics', level: 4, category: 'Business' },
        { id: '5', name: 'JavaScript', level: 5, category: 'Technical' },
        { id: '6', name: 'React', level: 4, category: 'Technical' },
        { id: '7', name: 'Node.js', level: 4, category: 'Technical' },
        { id: '8', name: 'Python', level: 3, category: 'Technical' },
        { id: '9', name: 'SQL', level: 4, category: 'Technical' },
        { id: '10', name: 'MongoDB', level: 3, category: 'Technical' },
        { id: '11', name: 'UI/UX Design', level: 4, category: 'Design' },
        { id: '12', name: 'Figma', level: 4, category: 'Design' },
      ],
      projects: [
        {
          id: '1',
          name: 'AI-Powered Analytics Dashboard',
          description: 'Enterprise analytics platform with machine learning capabilities for predictive insights.',
          technologies: ['React', 'Node.js', 'TensorFlow', 'D3.js', 'AWS'],
          link: 'https://analytics-platform.example.com',
          githubLink: 'https://github.com/alexjohnson/analytics-platform',
          image: '',
          accomplishments: [
            'Implemented machine learning algorithms for predictive analytics',
            'Built real-time dashboard with customizable widgets',
            'Designed RESTful API architecture for third-party integrations'
          ]
        },
        {
          id: '2',
          name: 'Mobile Commerce App',
          description: 'Cross-platform mobile application for e-commerce with personalized recommendations.',
          technologies: ['React Native', 'GraphQL', 'Firebase', 'Stripe API'],
          link: 'https://mcommerce.example.com',
          githubLink: 'https://github.com/alexjohnson/mcommerce',
          image: '',
          accomplishments: [
            'Developed personalization engine improving conversion by 45%',
            'Implemented secure payment processing with Stripe',
            'Created offline mode for browsing products'
          ]
        },
        {
          id: '3',
          name: 'Project Management Tool',
          description: 'Web-based project management application with real-time collaboration features.',
          technologies: ['Vue.js', 'Express', 'Socket.io', 'MongoDB', 'Docker'],
          link: 'https://projecttool.example.com',
          githubLink: 'https://github.com/alexjohnson/project-tool',
          image: '',
          accomplishments: [
            'Built real-time collaboration features using Socket.io',
            'Implemented drag-and-drop interface for task management',
            'Created comprehensive reporting and analytics dashboard'
          ]
        }
      ],
      certifications: [
        {
          id: '1',
          name: 'Certified Scrum Product Owner (CSPO)',
          issuer: 'Scrum Alliance',
          date: '2019-05',
          link: 'https://certification.scrumalliance.org/'
        },
        {
          id: '2',
          name: 'AWS Certified Solutions Architect',
          issuer: 'Amazon Web Services',
          date: '2018-07',
          link: 'https://aws.amazon.com/certification/'
        },
        {
          id: '3',
          name: 'Professional Product Manager',
          issuer: 'Product School',
          date: '2020-01',
          link: 'https://productschool.com/'
        }
      ],
      languages: [
        { id: '1', name: 'English', proficiency: 'Native' },
        { id: '2', name: 'Spanish', proficiency: 'Intermediate' },
        { id: '3', name: 'French', proficiency: 'Basic' }
      ]
    };
  });

  // Save resume data to local storage when it changes
  useEffect(() => {
    localStorage.setItem('resumeData', JSON.stringify(resumeData));
  }, [resumeData]);

  // Apply dark mode or light mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  // Close modal when Escape key is pressed
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeModal();
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, [isModalOpen]);

  // Modal refs
  const modalRef = useRef<HTMLDivElement>(null);

  // Helper functions
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Present';
    return format(new Date(dateString), 'MMM yyyy');
  };

  const getSkillLevel = (level: number): string => {
    switch (level) {
      case 1: return 'Novice';
      case 2: return 'Beginner';
      case 3: return 'Intermediate';
      case 4: return 'Advanced';
      case 5: return 'Expert';
      default: return 'Unknown';
    }
  };

  const generateId = (): string => {
    return Math.random().toString(36).substring(2, 11);
  };

  // Modal handlers
  const openModal = (type: string, item: any = null) => {
    setModalType(type);
    setSelectedItem(item);
    setIsModalOpen(true);
    document.body.classList.add('modal-open');
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalType('');
    setSelectedItem(null);
    document.body.classList.remove('modal-open');
  };

  // Handle file upload for resume
  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          // Basic validation to make sure the file has required fields
          if (data.personalInfo && data.workExperience && data.education) {
            setResumeData(data);
            alert('Resume uploaded successfully!');
          } else {
            alert('Invalid resume format. Please check the file and try again.');
          }
        } catch (error) {
          alert('Error parsing the resume file. Please make sure it is valid JSON.');
          console.error(error);
        }
      };
      reader.readAsText(file);
    }
  };

  // Handle resume download
  const handleResumeDownload = () => {
    const dataStr = JSON.stringify(resumeData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataUri);
    downloadAnchorNode.setAttribute('download', 'resume.json');
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  // Handle photo upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setResumeData({
          ...resumeData,
          personalInfo: {
            ...resumeData.personalInfo,
            photo: e.target?.result as string
          }
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle project image upload
  const handleProjectImageUpload = (e: React.ChangeEvent<HTMLInputElement>, projectId: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setResumeData({
          ...resumeData,
          projects: resumeData.projects.map(project => 
            project.id === projectId
              ? { ...project, image: e.target?.result as string }
              : project
          )
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submissions
  const handlePersonalInfoSubmit = (data: PersonalInfo) => {
    setResumeData({
      ...resumeData,
      personalInfo: {
        ...data,
        photo: resumeData.personalInfo.photo // Preserve the photo
      }
    });
    closeModal();
  };

  const handleSummarySubmit = (data: { summary: string }) => {
    setResumeData({
      ...resumeData,
      summary: data.summary
    });
    closeModal();
  };

  const handleWorkExperienceSubmit = (data: WorkExperience) => {
    const updatedExperiences = selectedItem
      ? resumeData.workExperience.map(exp => exp.id === selectedItem.id ? data : exp)
      : [...resumeData.workExperience, { ...data, id: generateId() }];
    
    setResumeData({
      ...resumeData,
      workExperience: updatedExperiences
    });
    closeModal();
  };

  const handleEducationSubmit = (data: Education) => {
    const updatedEducation = selectedItem
      ? resumeData.education.map(edu => edu.id === selectedItem.id ? data : edu)
      : [...resumeData.education, { ...data, id: generateId() }];
    
    setResumeData({
      ...resumeData,
      education: updatedEducation
    });
    closeModal();
  };

  const handleSkillSubmit = (data: Skill) => {
    const updatedSkills = selectedItem
      ? resumeData.skills.map(skill => skill.id === selectedItem.id ? data : skill)
      : [...resumeData.skills, { ...data, id: generateId() }];
    
    setResumeData({
      ...resumeData,
      skills: updatedSkills
    });
    closeModal();
  };

  const handleProjectSubmit = (data: Project) => {
    const updatedProjects = selectedItem
      ? resumeData.projects.map(project => project.id === selectedItem.id ? { ...data, image: selectedItem.image } : project)
      : [...resumeData.projects, { ...data, id: generateId(), image: '' }];
    
    setResumeData({
      ...resumeData,
      projects: updatedProjects
    });
    closeModal();
  };

  const handleCertificationSubmit = (data: Certification) => {
    const updatedCertifications = selectedItem
      ? resumeData.certifications.map(cert => cert.id === selectedItem.id ? data : cert)
      : [...resumeData.certifications, { ...data, id: generateId() }];
    
    setResumeData({
      ...resumeData,
      certifications: updatedCertifications
    });
    closeModal();
  };

  const handleLanguageSubmit = (data: Language) => {
    const updatedLanguages = selectedItem
      ? resumeData.languages.map(lang => lang.id === selectedItem.id ? data : lang)
      : [...resumeData.languages, { ...data, id: generateId() }];
    
    setResumeData({
      ...resumeData,
      languages: updatedLanguages
    });
    closeModal();
  };

  // Delete item handlers
  const deleteWorkExperience = (id: string) => {
    setResumeData({
      ...resumeData,
      workExperience: resumeData.workExperience.filter(exp => exp.id !== id)
    });
  };

  const deleteEducation = (id: string) => {
    setResumeData({
      ...resumeData,
      education: resumeData.education.filter(edu => edu.id !== id)
    });
  };

  const deleteSkill = (id: string) => {
    setResumeData({
      ...resumeData,
      skills: resumeData.skills.filter(skill => skill.id !== id)
    });
  };

  const deleteProject = (id: string) => {
    setResumeData({
      ...resumeData,
      projects: resumeData.projects.filter(project => project.id !== id)
    });
  };

  const deleteCertification = (id: string) => {
    setResumeData({
      ...resumeData,
      certifications: resumeData.certifications.filter(cert => cert.id !== id)
    });
  };

  const deleteLanguage = (id: string) => {
    setResumeData({
      ...resumeData,
      languages: resumeData.languages.filter(lang => lang.id !== id)
    });
  };

  // Experience Bubbles for interactive timeline
  const experienceBubbles: DemoBubble[] = [
    {
      id: 'pm',
      title: 'Product Management',
      description: 'Experience in full product lifecycle management, from ideation to launch',
      color: 'bg-blue-500',
      icon: <Rocket size={24} />
    },
    {
      id: 'dev',
      title: 'Software Development',
      description: 'Full-stack development experience with React, Node.js, and cloud technologies',
      color: 'bg-green-500',
      icon: <Code size={24} />
    },
    {
      id: 'analytics',
      title: 'Data Analytics',
      description: 'Experience in implementing analytics solutions and deriving insights',
      color: 'bg-purple-500',
      icon: <FileImage size={24} />
    },
    {
      id: 'ux',
      title: 'User Experience',
      description: 'Designing intuitive interfaces and improving user satisfaction',
      color: 'bg-yellow-500',
      icon: <Search size={24} />
    },
    {
      id: 'leadership',
      title: 'Team Leadership',
      description: 'Leading cross-functional teams to deliver successful products',
      color: 'bg-red-500',
      icon: <Zap size={24} />
    }
  ];

  // Chart data for skills visualization
  const skillChartData = resumeData.skills.map(skill => ({
    name: skill.name,
    value: skill.level,
    category: skill.category
  }));

  // Filter skills by category
  const businessSkills = resumeData.skills.filter(skill => skill.category === 'Business');
  const technicalSkills = resumeData.skills.filter(skill => skill.category === 'Technical');
  const designSkills = resumeData.skills.filter(skill => skill.category === 'Design');

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 theme-transition-all">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 shadow-md">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <Link to="/" className="text-xl font-bold text-primary-600 dark:text-primary-400 theme-transition">
              {resumeData.personalInfo.name.split(' ')[0]}'s Portfolio
            </Link>
            <div className="hidden md:flex items-center space-x-6">
              <nav>
                <ul className="flex space-x-6">
                  <li>
                    <Link to="/" className="hover:text-primary-600 dark:hover:text-primary-400 theme-transition">Home</Link>
                  </li>
                  <li>
                    <Link to="/experience" className="hover:text-primary-600 dark:hover:text-primary-400 theme-transition">Experience</Link>
                  </li>
                  <li>
                    <Link to="/projects" className="hover:text-primary-600 dark:hover:text-primary-400 theme-transition">Projects</Link>
                  </li>
                  <li>
                    <Link to="/skills" className="hover:text-primary-600 dark:hover:text-primary-400 theme-transition">Skills</Link>
                  </li>
                  <li>
                    <Link to="/edit" className="hover:text-primary-600 dark:hover:text-primary-400 theme-transition">Edit Resume</Link>
                  </li>
                </ul>
              </nav>
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="theme-toggle p-2 rounded-full bg-gray-200 dark:bg-gray-700 theme-transition"
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="mr-4 theme-toggle p-2 rounded-full bg-gray-200 dark:bg-gray-700 theme-transition"
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-700 dark:text-gray-200 focus:outline-none"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="md:hidden bg-white dark:bg-gray-800 shadow-lg">
              <nav className="container mx-auto px-4 py-2">
                <ul className="space-y-2">
                  <li>
                    <Link 
                      to="/" 
                      className="block py-2 hover:text-primary-600 dark:hover:text-primary-400 theme-transition"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/experience" 
                      className="block py-2 hover:text-primary-600 dark:hover:text-primary-400 theme-transition"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Experience
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/projects" 
                      className="block py-2 hover:text-primary-600 dark:hover:text-primary-400 theme-transition"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Projects
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/skills" 
                      className="block py-2 hover:text-primary-600 dark:hover:text-primary-400 theme-transition"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Skills
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/edit" 
                      className="block py-2 hover:text-primary-600 dark:hover:text-primary-400 theme-transition"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Edit Resume
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <Routes>
            {/* Home Page */}
            <Route path="/" element={
              <div className="space-y-12">
                {/* Hero Section */}
                <section className="flex flex-col md:flex-row gap-8 items-center">
                  <div className="flex-1">
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">{resumeData.personalInfo.name}</h1>
                    <h2 className="text-xl md:text-2xl text-primary-600 dark:text-primary-400 mb-6">{resumeData.personalInfo.title}</h2>
                    <p className="text-lg mb-6">{resumeData.summary}</p>
                    <div className="flex flex-wrap gap-4">
                      <a 
                        href={`mailto:${resumeData.personalInfo.email}`} 
                        className="btn btn-primary flex items-center gap-2"
                      >
                        <Mail size={18} /> Contact Me
                      </a>
                      <Link 
                        to="/experience" 
                        className="btn bg-white border border-gray-300 text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                      >
                        <Briefcase size={18} /> View Experience
                      </Link>
                    </div>
                  </div>
                  <div className="w-full md:w-1/3 flex justify-center">
                    {resumeData.personalInfo.photo ? (
                      <img 
                        src={resumeData.personalInfo.photo} 
                        alt={resumeData.personalInfo.name} 
                        className="w-64 h-64 object-cover rounded-full shadow-lg"
                      />
                    ) : (
                      <div className="w-64 h-64 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center shadow-lg">
                        <User size={64} className="text-gray-400 dark:text-gray-500" />
                      </div>
                    )}
                  </div>
                </section>

                {/* Interactive Experience Bubbles */}
                <section className="py-12 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold mb-4">My Areas of Expertise</h2>
                    <p className="text-gray-600 dark:text-gray-300">Interact with each bubble to learn more about my experience</p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-6">
                    {experienceBubbles.map((bubble) => (
                      <div 
                        key={bubble.id}
                        className={`${bubble.color} ${styles.experienceBubble} w-40 h-40 rounded-full flex flex-col items-center justify-center text-white cursor-pointer transition-transform hover:scale-110 p-2`}
                      >
                        <div className="mb-2">{bubble.icon}</div>
                        <h3 className="font-bold text-center text-sm">{bubble.title}</h3>
                        <div className={`${styles.bubbleTooltip} bg-white text-gray-800 dark:bg-gray-900 dark:text-white p-3 rounded-lg shadow-lg text-sm`}>
                          {bubble.description}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Featured Projects */}
                <section>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl md:text-3xl font-bold">Featured Projects</h2>
                    <Link to="/projects" className="text-primary-600 dark:text-primary-400 flex items-center gap-1 hover:underline">
                      View all <ChevronRight size={16} />
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {resumeData.projects.slice(0, 3).map((project) => (
                      <div key={project.id} className="card hover:shadow-lg">
                        {project.image ? (
                          <div className="aspect-w-16 aspect-h-9 mb-4">
                            <img 
                              src={project.image} 
                              alt={project.name} 
                              className="object-cover rounded-lg w-full h-full"
                            />
                          </div>
                        ) : (
                          <div className="aspect-w-16 aspect-h-9 mb-4 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                            <FileImage size={32} className="text-gray-400 dark:text-gray-500" />
                          </div>
                        )}
                        <h3 className="text-lg font-semibold mb-2">{project.name}</h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{project.description}</p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {project.technologies.slice(0, 3).map((tech, index) => (
                            <span 
                              key={index} 
                              className="badge badge-info text-xs"
                            >
                              {tech}
                            </span>
                          ))}
                          {project.technologies.length > 3 && (
                            <span className="badge badge-info text-xs">+{project.technologies.length - 3}</span>
                          )}
                        </div>
                        <div className="flex gap-3">
                          {project.link && (
                            <a 
                              href={project.link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary-600 dark:text-primary-400 text-sm flex items-center gap-1 hover:underline"
                            >
                              <ExternalLink size={14} /> Demo
                            </a>
                          )}
                          {project.githubLink && (
                            <a 
                              href={project.githubLink} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-gray-600 dark:text-gray-300 text-sm flex items-center gap-1 hover:underline"
                            >
                              <Github size={14} /> Code
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Contact Section */}
                <section className="bg-primary-50 dark:bg-gray-800 rounded-lg p-8">
                  <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-2xl md:text-3xl font-bold mb-4">Let's Connect</h2>
                    <p className="mb-6 text-gray-600 dark:text-gray-300">Have a project in mind or want to discuss opportunities? Get in touch with me.</p>
                    <div className="flex flex-wrap justify-center gap-4">
                      <a 
                        href={`mailto:${resumeData.personalInfo.email}`} 
                        className="flex items-center gap-2 p-3 bg-white dark:bg-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                      >
                        <Mail size={20} className="text-primary-600 dark:text-primary-400" />
                        <span>{resumeData.personalInfo.email}</span>
                      </a>
                      <a 
                        href={`tel:${resumeData.personalInfo.phone}`} 
                        className="flex items-center gap-2 p-3 bg-white dark:bg-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                      >
                        <Phone size={20} className="text-primary-600 dark:text-primary-400" />
                        <span>{resumeData.personalInfo.phone}</span>
                      </a>
                      <div className="flex items-center gap-2 p-3 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
                        <MapPin size={20} className="text-primary-600 dark:text-primary-400" />
                        <span>{resumeData.personalInfo.location}</span>
                      </div>
                    </div>
                    <div className="flex justify-center gap-4 mt-6">
                      {resumeData.personalInfo.github && (
                        <a 
                          href={`https://${resumeData.personalInfo.github}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-2 bg-gray-100 dark:bg-gray-600 rounded-full hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                          aria-label="GitHub Profile"
                        >
                          <Github size={24} />
                        </a>
                      )}
                      {resumeData.personalInfo.linkedIn && (
                        <a 
                          href={`https://${resumeData.personalInfo.linkedIn}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-2 bg-gray-100 dark:bg-gray-600 rounded-full hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                          aria-label="LinkedIn Profile"
                        >
                          <Linkedin size={24} />
                        </a>
                      )}
                    </div>
                  </div>
                </section>
              </div>
            } />

            {/* Experience Page */}
            <Route path="/experience" element={
              <div className="space-y-12">
                <section>
                  <h1 className="text-3xl md:text-4xl font-bold mb-8">Work Experience</h1>
                  <div className="space-y-8">
                    {resumeData.workExperience.map((experience, index) => (
                      <div 
                        key={experience.id} 
                        className={`${styles.timelineItem} relative bg-white dark:bg-gray-800 rounded-lg shadow p-6`}
                      >
                        <span className={`${styles.timelineDot} ${index % 2 === 0 ? 'bg-primary-500' : 'bg-secondary-500'}`}></span>
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
                          <div>
                            <h2 className="text-xl font-semibold">{experience.position}</h2>
                            <h3 className="text-lg text-primary-600 dark:text-primary-400">{experience.company}</h3>
                          </div>
                          <div className="mt-2 md:mt-0 text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(experience.startDate)} — {formatDate(experience.endDate)}
                          </div>
                        </div>
                        <p className="mb-4 text-gray-600 dark:text-gray-300">{experience.description}</p>
                        <div className="mb-4">
                          <h4 className="font-medium mb-2">Key Responsibilities:</h4>
                          <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-300">
                            {experience.highlights.map((highlight, idx) => (
                              <li key={idx}>{highlight}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="mb-4">
                          <h4 className="font-medium mb-2">Technologies Used:</h4>
                          <div className="flex flex-wrap gap-2">
                            {experience.technologies.map((tech, idx) => (
                              <span key={idx} className="badge badge-info">{tech}</span>
                            ))}
                          </div>
                        </div>
                        {experience.accomplishments && experience.accomplishments.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2">Key Accomplishments:</h4>
                            <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-300">
                              {experience.accomplishments.map((accomplishment, idx) => (
                                <li key={idx}>{accomplishment}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl md:text-3xl font-bold mb-6">Education</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {resumeData.education.map((edu) => (
                      <div key={edu.id} className="card">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-semibold">{edu.degree} in {edu.field}</h3>
                            <h4 className="text-primary-600 dark:text-primary-400">{edu.institution}</h4>
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(edu.startDate)} — {formatDate(edu.endDate)}
                          </div>
                        </div>
                        {edu.grade && (
                          <div className="mt-2">
                            <span className="text-sm font-medium">Grade:</span> {edu.grade}
                          </div>
                        )}
                        {edu.activities && edu.activities.length > 0 && (
                          <div className="mt-3">
                            <h5 className="text-sm font-medium mb-1">Activities & Societies:</h5>
                            <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600 dark:text-gray-300">
                              {edu.activities.map((activity, idx) => (
                                <li key={idx}>{activity}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl md:text-3xl font-bold mb-6">Certifications</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {resumeData.certifications.map((cert) => (
                      <div key={cert.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex">
                        <div className="mr-4 text-primary-500 dark:text-primary-400">
                          <Award size={24} />
                        </div>
                        <div>
                          <h3 className="font-medium">{cert.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{cert.issuer}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {formatDate(cert.date)}
                          </p>
                          {cert.link && (
                            <a 
                              href={cert.link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary-600 dark:text-primary-400 text-xs mt-2 inline-block hover:underline"
                            >
                              View Certificate
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl md:text-3xl font-bold mb-6">Languages</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {resumeData.languages.map((lang) => (
                      <div key={lang.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                        <h3 className="font-medium text-lg">{lang.name}</h3>
                        <p className="text-primary-600 dark:text-primary-400">{lang.proficiency}</p>
                        <div className="mt-2 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                          <div 
                            className="bg-primary-500 h-2.5 rounded-full" 
                            style={{ 
                              width: lang.proficiency === 'Native' ? '100%' : 
                                     lang.proficiency === 'Fluent' ? '80%' : 
                                     lang.proficiency === 'Intermediate' ? '60%' : '30%' 
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            } />

            {/* Projects Page */}
            <Route path="/projects" element={
              <div className="space-y-8">
                <h1 className="text-3xl md:text-4xl font-bold mb-6">My Projects</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {resumeData.projects.map((project) => (
                    <div key={project.id} className="card hover:shadow-lg">
                      {project.image ? (
                        <div className="aspect-w-16 aspect-h-9 mb-4">
                          <img 
                            src={project.image} 
                            alt={project.name} 
                            className="object-cover rounded-lg"
                          />
                        </div>
                      ) : (
                        <div className="aspect-w-16 aspect-h-9 mb-4 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                          <FileImage size={48} className="text-gray-400 dark:text-gray-500" />
                        </div>
                      )}
                      <h2 className="text-xl font-semibold mb-2">{project.name}</h2>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">{project.description}</p>
                      <div className="mb-4">
                        <h3 className="text-sm font-medium mb-2">Technologies:</h3>
                        <div className="flex flex-wrap gap-2">
                          {project.technologies.map((tech, index) => (
                            <span key={index} className="badge badge-info">{tech}</span>
                          ))}
                        </div>
                      </div>
                      <div className="mb-4">
                        <h3 className="text-sm font-medium mb-2">Key Accomplishments:</h3>
                        <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-300">
                          {project.accomplishments.map((accomplishment, index) => (
                            <li key={index}>{accomplishment}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="flex gap-4 mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                        {project.link && (
                          <a 
                            href={project.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="btn btn-primary text-sm flex items-center gap-1"
                          >
                            <ExternalLink size={14} /> View Demo
                          </a>
                        )}
                        {project.githubLink && (
                          <a 
                            href={project.githubLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="btn bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 text-sm flex items-center gap-1"
                          >
                            <Github size={14} /> View Code
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            } />

            {/* Skills Page */}
            <Route path="/skills" element={
              <div className="space-y-12">
                <h1 className="text-3xl md:text-4xl font-bold mb-6">Skills & Competencies</h1>

                {/* Skill Categories */}
                <section>
                  <h2 className="text-2xl font-bold mb-6">Skill Categories</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="card">
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-blue-600 dark:text-blue-400">
                        <Briefcase size={20} /> Business Skills
                      </h3>
                      <div className="space-y-4">
                        {businessSkills.map((skill) => (
                          <div key={skill.id}>
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-medium">{skill.name}</span>
                              <span className="text-sm text-gray-500 dark:text-gray-400">{getSkillLevel(skill.level)}</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full" 
                                style={{ width: `${skill.level * 20}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="card">
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-green-600 dark:text-green-400">
                        <Code size={20} /> Technical Skills
                      </h3>
                      <div className="space-y-4">
                        {technicalSkills.map((skill) => (
                          <div key={skill.id}>
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-medium">{skill.name}</span>
                              <span className="text-sm text-gray-500 dark:text-gray-400">{getSkillLevel(skill.level)}</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-green-600 dark:bg-green-500 h-2 rounded-full" 
                                style={{ width: `${skill.level * 20}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="card">
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-purple-600 dark:text-purple-400">
                        <Search size={20} /> Design Skills
                      </h3>
                      <div className="space-y-4">
                        {designSkills.map((skill) => (
                          <div key={skill.id}>
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-medium">{skill.name}</span>
                              <span className="text-sm text-gray-500 dark:text-gray-400">{getSkillLevel(skill.level)}</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-purple-600 dark:bg-purple-500 h-2 rounded-full" 
                                style={{ width: `${skill.level * 20}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

                {/* Skill Chart */}
                <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                  <h2 className="text-2xl font-bold mb-6">Skills Visualization</h2>
                  <div className="h-80">
                    {/* Recharts components Bar, XAxis, YAxis are used here */}
                    {/* Removed ResponsiveContainer for simplicity, assuming fixed width/height */}
                    <Bar
                      data={skillChartData}
                      width={800} // Example fixed width
                      height={300} // Example fixed height
                      margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                      barSize={36}
                    >
                      <text x="50%" y="15" fill={isDarkMode ? '#fff' : '#333'} textAnchor="middle" dominantBaseline="central">
                        Skill Proficiency Levels
                      </text>
                      {/* Corrected: XAxis and YAxis imported from recharts */}
                      <XAxis dataKey="name" scale="band" tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280' }} />
                      <YAxis domain={[0, 5]} tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280' }} />
                      <Bar dataKey="value" fill={isDarkMode ? '#3b82f6' : '#2563eb'} />
                    </Bar>
                  </div>
                </section>

                {/* Skills Growth Timeline */}
                <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                  <h2 className="text-2xl font-bold mb-6">Skill Development Journey</h2>
                  <div className={styles.skillTimeline}>
                    <div className={styles.timelinePoint}>
                      <div className={styles.timelineDate}>2015-2017</div>
                      <div className={styles.timelineContent}>
                        <h3 className="font-semibold">Full Stack Developer</h3>
                        <p className="text-gray-600 dark:text-gray-300">Built foundational skills in JavaScript, React, Node.js, and database technologies.</p>
                      </div>
                    </div>
                    <div className={styles.timelinePoint}>
                      <div className={styles.timelineDate}>2017-2019</div>
                      <div className={styles.timelineContent}>
                        <h3 className="font-semibold">Product Manager</h3>
                        <p className="text-gray-600 dark:text-gray-300">Developed product management skills, user research techniques, and analytics proficiency.</p>
                      </div>
                    </div>
                    <div className={styles.timelinePoint}>
                      <div className={styles.timelineDate}>2020-Present</div>
                      <div className={styles.timelineContent}>
                        <h3 className="font-semibold">Senior Product Manager</h3>
                        <p className="text-gray-600 dark:text-gray-300">Advanced leadership skills, strategic planning, and AI product development expertise.</p>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            } />

            {/* Edit Resume Page */}
            <Route path="/edit" element={
              <div className="space-y-8">
                <h1 className="text-3xl md:text-4xl font-bold mb-6">Edit Resume</h1>

                <section className="card">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <FileText size={20} /> Resume Data Management
                  </h2>
                  <div className="flex flex-wrap gap-4">
                    <div className="w-full md:w-auto">
                      <label htmlFor="resume-upload" className="btn btn-primary w-full md:w-auto flex items-center gap-2">
                        <Upload size={18} /> Import Resume JSON
                      </label>
                      <input 
                        type="file" 
                        id="resume-upload" 
                        className="hidden" 
                        accept=".json" 
                        onChange={handleResumeUpload}
                      />
                    </div>
                    <button 
                      onClick={handleResumeDownload}
                      className="btn bg-white border border-gray-300 text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 w-full md:w-auto flex items-center gap-2"
                    >
                      <Download size={18} /> Export Resume JSON
                    </button>
                  </div>
                  <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                    You can import an existing resume JSON file or export your current resume data for backup.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-bold mb-4">Personal Information</h2>
                  <div className="card">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="md:w-1/3">
                        {resumeData.personalInfo.photo ? (
                          <div className="aspect-w-1 aspect-h-1">
                            <img 
                              src={resumeData.personalInfo.photo} 
                              alt="Profile" 
                              className="object-cover rounded-lg"
                            />
                          </div>
                        ) : (
                          <div className="aspect-w-1 aspect-h-1 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                            <User size={48} className="text-gray-400 dark:text-gray-500" />
                          </div>
                        )}
                        <div className="mt-4">
                          <label htmlFor="photo-upload" className="btn btn-sm btn-primary w-full flex items-center justify-center gap-2">
                            <Upload size={14} /> Upload Photo
                          </label>
                          <input 
                            type="file" 
                            id="photo-upload" 
                            className="hidden" 
                            accept="image/*" 
                            onChange={handlePhotoUpload}
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                          <div>
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</dt>
                            <dd className="mt-1">{resumeData.personalInfo.name}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Title</dt>
                            <dd className="mt-1">{resumeData.personalInfo.title}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</dt>
                            <dd className="mt-1">{resumeData.personalInfo.email}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</dt>
                            <dd className="mt-1">{resumeData.personalInfo.phone}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Location</dt>
                            <dd className="mt-1">{resumeData.personalInfo.location}</dd>
                          </div>
                          {resumeData.personalInfo.website && (
                            <div>
                              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Website</dt>
                              <dd className="mt-1">{resumeData.personalInfo.website}</dd>
                            </div>
                          )}
                          {resumeData.personalInfo.linkedIn && (
                            <div>
                              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">LinkedIn</dt>
                              <dd className="mt-1">{resumeData.personalInfo.linkedIn}</dd>
                            </div>
                          )}
                          {resumeData.personalInfo.github && (
                            <div>
                              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">GitHub</dt>
                              <dd className="mt-1">{resumeData.personalInfo.github}</dd>
                            </div>
                          )}
                        </dl>
                        <div className="mt-4">
                          <button 
                            onClick={() => openModal('personal-info', resumeData.personalInfo)}
                            className="btn btn-sm bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                          >
                            Edit Personal Info
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Professional Summary</h2>
                    <button 
                      onClick={() => openModal('summary', { summary: resumeData.summary })}
                      className="btn btn-sm bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      Edit Summary
                    </button>
                  </div>
                  <div className="card">
                    <p className="text-gray-600 dark:text-gray-300">{resumeData.summary}</p>
                  </div>
                </section>

                <section>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Work Experience</h2>
                    <button 
                      onClick={() => openModal('work-experience')}
                      className="btn btn-sm btn-primary"
                    >
                      Add Experience
                    </button>
                  </div>
                  {resumeData.workExperience.length > 0 ? (
                    <div className="space-y-4">
                      {resumeData.workExperience.map((exp) => (
                        <div key={exp.id} className="card">
                          <div className="flex justify-between">
                            <div>
                              <h3 className="font-semibold">{exp.position}</h3>
                              <h4 className="text-primary-600 dark:text-primary-400">{exp.company}</h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {formatDate(exp.startDate)} — {formatDate(exp.endDate)}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => openModal('work-experience', exp)}
                                className="btn btn-sm bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                                aria-label="Edit experience"
                              >
                                Edit
                              </button>
                              <button 
                                onClick={() => deleteWorkExperience(exp.id)}
                                className="btn btn-sm bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800"
                                aria-label="Delete experience"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="card p-8 text-center text-gray-500 dark:text-gray-400">
                      <p>No work experience added yet.</p>
                      <button 
                        onClick={() => openModal('work-experience')}
                        className="btn btn-sm btn-primary mt-4"
                      >
                        Add Your First Experience
                      </button>
                    </div>
                  )}
                </section>

                <section>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Education</h2>
                    <button 
                      onClick={() => openModal('education')}
                      className="btn btn-sm btn-primary"
                    >
                      Add Education
                    </button>
                  </div>
                  {resumeData.education.length > 0 ? (
                    <div className="space-y-4">
                      {resumeData.education.map((edu) => (
                        <div key={edu.id} className="card">
                          <div className="flex justify-between">
                            <div>
                              <h3 className="font-semibold">{edu.degree} in {edu.field}</h3>
                              <h4 className="text-primary-600 dark:text-primary-400">{edu.institution}</h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {formatDate(edu.startDate)} — {formatDate(edu.endDate)}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => openModal('education', edu)}
                                className="btn btn-sm bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                                aria-label="Edit education"
                              >
                                Edit
                              </button>
                              <button 
                                onClick={() => deleteEducation(edu.id)}
                                className="btn btn-sm bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800"
                                aria-label="Delete education"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="card p-8 text-center text-gray-500 dark:text-gray-400">
                      <p>No education added yet.</p>
                      <button 
                        onClick={() => openModal('education')}
                        className="btn btn-sm btn-primary mt-4"
                      >
                        Add Your First Education
                      </button>
                    </div>
                  )}
                </section>

                <section>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Skills</h2>
                    <button 
                      onClick={() => openModal('skill')}
                      className="btn btn-sm btn-primary"
                    >
                      Add Skill
                    </button>
                  </div>
                  {resumeData.skills.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {resumeData.skills.map((skill) => (
                        <div key={skill.id} className="card">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="font-semibold">{skill.name}</h3>
                              <div className="flex items-center justify-between mt-1">
                                <span className="text-sm text-gray-500 dark:text-gray-400">{skill.category}</span>
                                <span className="text-sm text-primary-600 dark:text-primary-400">{getSkillLevel(skill.level)}</span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                                <div 
                                  className="bg-primary-600 dark:bg-primary-500 h-2 rounded-full" 
                                  style={{ width: `${skill.level * 20}%` }}
                                ></div>
                              </div>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <button 
                                onClick={() => openModal('skill', skill)}
                                className="btn btn-sm bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                                aria-label="Edit skill"
                              >
                                Edit
                              </button>
                              <button 
                                onClick={() => deleteSkill(skill.id)}
                                className="btn btn-sm bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800"
                                aria-label="Delete skill"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="card p-8 text-center text-gray-500 dark:text-gray-400">
                      <p>No skills added yet.</p>
                      <button 
                        onClick={() => openModal('skill')}
                        className="btn btn-sm btn-primary mt-4"
                      >
                        Add Your First Skill
                      </button>
                    </div>
                  )}
                </section>

                <section>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Projects</h2>
                    <button 
                      onClick={() => openModal('project')}
                      className="btn btn-sm btn-primary"
                    >
                      Add Project
                    </button>
                  </div>
                  {resumeData.projects.length > 0 ? (
                    <div className="space-y-4">
                      {resumeData.projects.map((project) => (
                        <div key={project.id} className="card">
                          <div className="flex flex-col md:flex-row gap-4">
                            <div className="md:w-1/4">
                              {project.image ? (
                                <div className="aspect-w-16 aspect-h-9">
                                  <img 
                                    src={project.image} 
                                    alt={project.name} 
                                    className="object-cover rounded-lg"
                                  />
                                </div>
                              ) : (
                                <div className="aspect-w-16 aspect-h-9 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                  <FileImage size={36} className="text-gray-400 dark:text-gray-500" />
                                </div>
                              )}
                              <div className="mt-2">
                                <label htmlFor={`project-image-${project.id}`} className="btn btn-sm bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 w-full text-center flex items-center justify-center gap-1">
                                  <Upload size={12} /> Upload Image
                                </label>
                                <input 
                                  type="file" 
                                  id={`project-image-${project.id}`} 
                                  className="hidden" 
                                  accept="image/*" 
                                  onChange={(e) => handleProjectImageUpload(e, project.id)}
                                />
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between">
                                <h3 className="font-semibold">{project.name}</h3>
                                <div className="flex gap-2">
                                  <button 
                                    onClick={() => openModal('project', project)}
                                    className="btn btn-sm bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                                    aria-label="Edit project"
                                  >
                                    Edit
                                  </button>
                                  <button 
                                    onClick={() => deleteProject(project.id)}
                                    className="btn btn-sm bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800"
                                    aria-label="Delete project"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{project.description}</p>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {project.technologies.map((tech, index) => (
                                  <span key={index} className="badge badge-info text-xs">{tech}</span>
                                ))}
                              </div>
                              {(project.link || project.githubLink) && (
                                <div className="flex gap-4 mt-2">
                                  {project.link && (
                                    <a 
                                      href={project.link} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-primary-600 dark:text-primary-400 text-sm flex items-center gap-1 hover:underline"
                                    >
                                      <ExternalLink size={14} /> Live Demo
                                    </a>
                                  )}
                                  {project.githubLink && (
                                    <a 
                                      href={project.githubLink} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-gray-600 dark:text-gray-400 text-sm flex items-center gap-1 hover:underline"
                                    >
                                      <Github size={14} /> GitHub
                                    </a>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="card p-8 text-center text-gray-500 dark:text-gray-400">
                      <p>No projects added yet.</p>
                      <button 
                        onClick={() => openModal('project')}
                        className="btn btn-sm btn-primary mt-4"
                      >
                        Add Your First Project
                      </button>
                    </div>
                  )}
                </section>

                <section>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Certifications</h2>
                    <button 
                      onClick={() => openModal('certification')}
                      className="btn btn-sm btn-primary"
                    >
                      Add Certification
                    </button>
                  </div>
                  {resumeData.certifications.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {resumeData.certifications.map((cert) => (
                        <div key={cert.id} className="card">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold">{cert.name}</h3>
                              <p className="text-primary-600 dark:text-primary-400">{cert.issuer}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {formatDate(cert.date)}
                              </p>
                              {cert.link && (
                                <a 
                                  href={cert.link} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-primary-600 dark:text-primary-400 text-sm mt-2 inline-block hover:underline"
                                >
                                  View Certificate
                                </a>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => openModal('certification', cert)}
                                className="btn btn-sm bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                                aria-label="Edit certification"
                              >
                                Edit
                              </button>
                              <button 
                                onClick={() => deleteCertification(cert.id)}
                                className="btn btn-sm bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800"
                                aria-label="Delete certification"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="card p-8 text-center text-gray-500 dark:text-gray-400">
                      <p>No certifications added yet.</p>
                      <button 
                        onClick={() => openModal('certification')}
                        className="btn btn-sm btn-primary mt-4"
                      >
                        Add Your First Certification
                      </button>
                    </div>
                  )}
                </section>

                <section>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Languages</h2>
                    <button 
                      onClick={() => openModal('language')}
                      className="btn btn-sm btn-primary"
                    >
                      Add Language
                    </button>
                  </div>
                  {resumeData.languages.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {resumeData.languages.map((lang) => (
                        <div key={lang.id} className="card">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="font-semibold">{lang.name}</h3>
                              <p className="text-primary-600 dark:text-primary-400">{lang.proficiency}</p>
                              <div className="mt-2 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div 
                                  className="bg-primary-500 h-2 rounded-full" 
                                  style={{ 
                                    width: lang.proficiency === 'Native' ? '100%' : 
                                           lang.proficiency === 'Fluent' ? '80%' : 
                                           lang.proficiency === 'Intermediate' ? '60%' : '30%' 
                                  }}
                                ></div>
                              </div>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <button 
                                onClick={() => openModal('language', lang)}
                                className="btn btn-sm bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                                aria-label="Edit language"
                              >
                                Edit
                              </button>
                              <button 
                                onClick={() => deleteLanguage(lang.id)}
                                className="btn btn-sm bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800"
                                aria-label="Delete language"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="card p-8 text-center text-gray-500 dark:text-gray-400">
                      <p>No languages added yet.</p>
                      <button 
                        onClick={() => openModal('language')}
                        className="btn btn-sm btn-primary mt-4"
                      >
                        Add Your First Language
                      </button>
                    </div>
                  )}
                </section>
              </div>
            } />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-gray-100 dark:bg-gray-800 py-6">
          <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-300 text-sm">
            <p>Copyright © 2025 of Datavtar Private Limited. All rights reserved.</p>
          </div>
        </footer>

        {/* Modal */}
        {isModalOpen && (
          <div 
            className="modal-backdrop fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <div 
              ref={modalRef}
              className="modal-content w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h3 className="text-lg font-semibold">
                  {modalType === 'personal-info' && 'Edit Personal Information'}
                  {modalType === 'summary' && 'Edit Professional Summary'}
                  {modalType === 'work-experience' && (selectedItem ? 'Edit' : 'Add') + ' Work Experience'}
                  {modalType === 'education' && (selectedItem ? 'Edit' : 'Add') + ' Education'}
                  {modalType === 'skill' && (selectedItem ? 'Edit' : 'Add') + ' Skill'}
                  {modalType === 'project' && (selectedItem ? 'Edit' : 'Add') + ' Project'}
                  {modalType === 'certification' && (selectedItem ? 'Edit' : 'Add') + ' Certification'}
                  {modalType === 'language' && (selectedItem ? 'Edit' : 'Add') + ' Language'}
                </h3>
                <button 
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                {/* Personal Info Form */}
                {modalType === 'personal-info' && (
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      const data = {
                        name: formData.get('name') as string,
                        title: formData.get('title') as string,
                        email: formData.get('email') as string,
                        phone: formData.get('phone') as string,
                        location: formData.get('location') as string,
                        website: formData.get('website') as string,
                        linkedIn: formData.get('linkedIn') as string,
                        github: formData.get('github') as string,
                      };
                      handlePersonalInfoSubmit(data as PersonalInfo);
                    }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="form-group">
                        <label className="form-label" htmlFor="name">Full Name</label>
                        <input 
                          type="text" 
                          id="name" 
                          name="name" 
                          className="input" 
                          defaultValue={selectedItem?.name} 
                          required 
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="title">Professional Title</label>
                        <input 
                          type="text" 
                          id="title" 
                          name="title" 
                          className="input" 
                          defaultValue={selectedItem?.title} 
                          required 
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="email">Email</label>
                        <input 
                          type="email" 
                          id="email" 
                          name="email" 
                          className="input" 
                          defaultValue={selectedItem?.email} 
                          required 
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="phone">Phone</label>
                        <input 
                          type="tel" 
                          id="phone" 
                          name="phone" 
                          className="input" 
                          defaultValue={selectedItem?.phone} 
                          required 
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="location">Location</label>
                        <input 
                          type="text" 
                          id="location" 
                          name="location" 
                          className="input" 
                          defaultValue={selectedItem?.location} 
                          required 
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="website">Website (optional)</label>
                        <input 
                          type="text" 
                          id="website" 
                          name="website" 
                          className="input" 
                          defaultValue={selectedItem?.website} 
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="linkedIn">LinkedIn (optional)</label>
                        <input 
                          type="text" 
                          id="linkedIn" 
                          name="linkedIn" 
                          className="input" 
                          defaultValue={selectedItem?.linkedIn} 
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="github">GitHub (optional)</label>
                        <input 
                          type="text" 
                          id="github" 
                          name="github" 
                          className="input" 
                          defaultValue={selectedItem?.github} 
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                      <button 
                        type="button" 
                        onClick={closeModal}
                        className="btn bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary">Save Changes</button>
                    </div>
                  </form>
                )}

                {/* Summary Form */}
                {modalType === 'summary' && (
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      const data = {
                        summary: formData.get('summary') as string,
                      };
                      handleSummarySubmit(data);
                    }}
                    className="space-y-4"
                  >
                    <div className="form-group">
                      <label className="form-label" htmlFor="summary">Professional Summary</label>
                      <textarea 
                        id="summary" 
                        name="summary" 
                        className="input min-h-[150px]" 
                        defaultValue={selectedItem?.summary} 
                        required 
                      />
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                      <button 
                        type="button" 
                        onClick={closeModal}
                        className="btn bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary">Save Changes</button>
                    </div>
                  </form>
                )}

                {/* Work Experience Form */}
                {modalType === 'work-experience' && (
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      const data: WorkExperience = {
                        id: selectedItem?.id || '',
                        company: formData.get('company') as string,
                        position: formData.get('position') as string,
                        startDate: formData.get('startDate') as string,
                        endDate: formData.get('current') === 'on' ? null : formData.get('endDate') as string,
                        description: formData.get('description') as string,
                        highlights: (formData.get('highlights') as string).split('\n').filter(item => item.trim() !== ''),
                        technologies: (formData.get('technologies') as string).split(',').map(tech => tech.trim()).filter(tech => tech !== ''),
                        accomplishments: (formData.get('accomplishments') as string).split('\n').filter(item => item.trim() !== ''),
                      };
                      handleWorkExperienceSubmit(data);
                    }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="form-group">
                        <label className="form-label" htmlFor="company">Company</label>
                        <input 
                          type="text" 
                          id="company" 
                          name="company" 
                          className="input" 
                          defaultValue={selectedItem?.company} 
                          required 
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="position">Position</label>
                        <input 
                          type="text" 
                          id="position" 
                          name="position" 
                          className="input" 
                          defaultValue={selectedItem?.position} 
                          required 
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="form-group">
                        <label className="form-label" htmlFor="startDate">Start Date</label>
                        <input 
                          type="month" 
                          id="startDate" 
                          name="startDate" 
                          className="input" 
                          defaultValue={selectedItem?.startDate} 
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="form-group">
                          <label className="form-label" htmlFor="endDate">End Date</label>
                          <input 
                            type="month" 
                            id="endDate" 
                            name="endDate" 
                            className="input" 
                            defaultValue={selectedItem?.endDate} 
                            disabled={(document.getElementById('current') as HTMLInputElement)?.checked}
                          />
                        </div>
                        <div className="flex items-center">
                          <input 
                            type="checkbox" 
                            id="current" 
                            name="current" 
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" 
                            defaultChecked={selectedItem?.endDate === null}
                            onChange={(e) => {
                              const endDateInput = document.getElementById('endDate') as HTMLInputElement;
                              if (endDateInput) {
                                endDateInput.disabled = e.target.checked;
                                if (e.target.checked) {
                                  endDateInput.value = '';
                                }
                              }
                            }}
                          />
                          <label htmlFor="current" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                            I currently work here
                          </label>
                        </div>
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="description">Description</label>
                      <textarea 
                        id="description" 
                        name="description" 
                        className="input" 
                        defaultValue={selectedItem?.description} 
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="highlights">Key Responsibilities (one per line)</label>
                      <textarea 
                        id="highlights" 
                        name="highlights" 
                        className="input" 
                        defaultValue={selectedItem?.highlights?.join('\n')} 
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="technologies">Technologies Used (comma separated)</label>
                      <input 
                        type="text" 
                        id="technologies" 
                        name="technologies" 
                        className="input" 
                        defaultValue={selectedItem?.technologies?.join(', ')} 
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="accomplishments">Key Accomplishments (one per line, optional)</label>
                      <textarea 
                        id="accomplishments" 
                        name="accomplishments" 
                        className="input" 
                        defaultValue={selectedItem?.accomplishments?.join('\n')} 
                      />
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                      <button 
                        type="button" 
                        onClick={closeModal}
                        className="btn bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary">Save Experience</button>
                    </div>
                  </form>
                )}

                {/* Education Form */}
                {modalType === 'education' && (
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      const data: Education = {
                        id: selectedItem?.id || '',
                        institution: formData.get('institution') as string,
                        degree: formData.get('degree') as string,
                        field: formData.get('field') as string,
                        startDate: formData.get('startDate') as string,
                        endDate: formData.get('current') === 'on' ? null : formData.get('endDate') as string,
                        grade: formData.get('grade') as string || undefined,
                        activities: (formData.get('activities') as string || '').split('\n').filter(item => item.trim() !== '') || undefined,
                      };
                      handleEducationSubmit(data);
                    }}
                    className="space-y-4"
                  >
                    <div className="form-group">
                      <label className="form-label" htmlFor="institution">Institution</label>
                      <input 
                        type="text" 
                        id="institution" 
                        name="institution" 
                        className="input" 
                        defaultValue={selectedItem?.institution} 
                        required 
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="form-group">
                        <label className="form-label" htmlFor="degree">Degree</label>
                        <input 
                          type="text" 
                          id="degree" 
                          name="degree" 
                          className="input" 
                          defaultValue={selectedItem?.degree} 
                          required 
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="field">Field of Study</label>
                        <input 
                          type="text" 
                          id="field" 
                          name="field" 
                          className="input" 
                          defaultValue={selectedItem?.field} 
                          required 
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="form-group">
                        <label className="form-label" htmlFor="startDate">Start Date</label>
                        <input 
                          type="month" 
                          id="startDate" 
                          name="startDate" 
                          className="input" 
                          defaultValue={selectedItem?.startDate} 
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="form-group">
                          <label className="form-label" htmlFor="endDate">End Date</label>
                          <input 
                            type="month" 
                            id="endDate" 
                            name="endDate" 
                            className="input" 
                            defaultValue={selectedItem?.endDate} 
                            disabled={(document.getElementById('current') as HTMLInputElement)?.checked}
                          />
                        </div>
                        <div className="flex items-center">
                          <input 
                            type="checkbox" 
                            id="current" 
                            name="current" 
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" 
                            defaultChecked={selectedItem?.endDate === null}
                            onChange={(e) => {
                              const endDateInput = document.getElementById('endDate') as HTMLInputElement;
                              if (endDateInput) {
                                endDateInput.disabled = e.target.checked;
                                if (e.target.checked) {
                                  endDateInput.value = '';
                                }
                              }
                            }}
                          />
                          <label htmlFor="current" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                            I'm currently studying here
                          </label>
                        </div>
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="grade">Grade/GPA (optional)</label>
                      <input 
                        type="text" 
                        id="grade" 
                        name="grade" 
                        className="input" 
                        defaultValue={selectedItem?.grade} 
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="activities">Activities & Societies (one per line, optional)</label>
                      <textarea 
                        id="activities" 
                        name="activities" 
                        className="input" 
                        defaultValue={selectedItem?.activities?.join('\n')} 
                      />
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                      <button 
                        type="button" 
                        onClick={closeModal}
                        className="btn bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary">Save Education</button>
                    </div>
                  </form>
                )}

                {/* Skill Form */}
                {modalType === 'skill' && (
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      const data: Skill = {
                        id: selectedItem?.id || '',
                        name: formData.get('name') as string,
                        level: parseInt(formData.get('level') as string, 10),
                        category: formData.get('category') as string,
                      };
                      handleSkillSubmit(data);
                    }}
                    className="space-y-4"
                  >
                    <div className="form-group">
                      <label className="form-label" htmlFor="name">Skill Name</label>
                      <input 
                        type="text" 
                        id="name" 
                        name="name" 
                        className="input" 
                        defaultValue={selectedItem?.name} 
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="category">Category</label>
                      <select 
                        id="category" 
                        name="category" 
                        className="input" 
                        defaultValue={selectedItem?.category} 
                        required
                      >
                        <option value="">Select a category</option>
                        <option value="Business">Business</option>
                        <option value="Technical">Technical</option>
                        <option value="Design">Design</option>
                        <option value="Soft Skills">Soft Skills</option>
                        <option value="Languages">Languages</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="level">Proficiency Level</label>
                      <div className="flex items-center gap-4">
                        <input 
                          type="range" 
                          id="level" 
                          name="level" 
                          min="1" 
                          max="5" 
                          step="1" 
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" 
                          defaultValue={selectedItem?.level || 3} 
                          onChange={(e) => {
                            const levelValue = parseInt(e.target.value, 10);
                            const levelText = e.target.nextElementSibling as HTMLElement;
                            if (levelText) {
                              levelText.textContent = getSkillLevel(levelValue);
                            }
                          }}
                        />
                        <span className="text-gray-700 dark:text-gray-300 w-24 text-right">
                          {getSkillLevel(selectedItem?.level || 3)}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                      <button 
                        type="button" 
                        onClick={closeModal}
                        className="btn bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary">Save Skill</button>
                    </div>
                  </form>
                )}

                {/* Project Form */}
                {modalType === 'project' && (
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      const data: Project = {
                        id: selectedItem?.id || '',
                        name: formData.get('name') as string,
                        description: formData.get('description') as string,
                        technologies: (formData.get('technologies') as string).split(',').map(tech => tech.trim()).filter(tech => tech !== ''),
                        link: formData.get('link') as string || undefined,
                        githubLink: formData.get('githubLink') as string || undefined,
                        image: selectedItem?.image || '',
                        accomplishments: (formData.get('accomplishments') as string).split('\n').filter(item => item.trim() !== ''),
                      };
                      handleProjectSubmit(data);
                    }}
                    className="space-y-4"
                  >
                    <div className="form-group">
                      <label className="form-label" htmlFor="name">Project Name</label>
                      <input 
                        type="text" 
                        id="name" 
                        name="name" 
                        className="input" 
                        defaultValue={selectedItem?.name} 
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="description">Description</label>
                      <textarea 
                        id="description" 
                        name="description" 
                        className="input" 
                        defaultValue={selectedItem?.description} 
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="technologies">Technologies Used (comma separated)</label>
                      <input 
                        type="text" 
                        id="technologies" 
                        name="technologies" 
                        className="input" 
                        defaultValue={selectedItem?.technologies?.join(', ')} 
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="accomplishments">Key Accomplishments (one per line)</label>
                      <textarea 
                        id="accomplishments" 
                        name="accomplishments" 
                        className="input" 
                        defaultValue={selectedItem?.accomplishments?.join('\n')} 
                        required 
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="form-group">
                        <label className="form-label" htmlFor="link">Live Demo URL (optional)</label>
                        <input 
                          type="url" 
                          id="link" 
                          name="link" 
                          className="input" 
                          defaultValue={selectedItem?.link} 
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="githubLink">GitHub URL (optional)</label>
                        <input 
                          type="url" 
                          id="githubLink" 
                          name="githubLink" 
                          className="input" 
                          defaultValue={selectedItem?.githubLink} 
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                      <button 
                        type="button" 
                        onClick={closeModal}
                        className="btn bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary">Save Project</button>
                    </div>
                  </form>
                )}

                {/* Certification Form */}
                {modalType === 'certification' && (
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      const data: Certification = {
                        id: selectedItem?.id || '',
                        name: formData.get('name') as string,
                        issuer: formData.get('issuer') as string,
                        date: formData.get('date') as string,
                        link: formData.get('link') as string || undefined,
                      };
                      handleCertificationSubmit(data);
                    }}
                    className="space-y-4"
                  >
                    <div className="form-group">
                      <label className="form-label" htmlFor="name">Certification Name</label>
                      <input 
                        type="text" 
                        id="name" 
                        name="name" 
                        className="input" 
                        defaultValue={selectedItem?.name} 
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="issuer">Issuing Organization</label>
                      <input 
                        type="text" 
                        id="issuer" 
                        name="issuer" 
                        className="input" 
                        defaultValue={selectedItem?.issuer} 
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="date">Date Issued</label>
                      <input 
                        type="month" 
                        id="date" 
                        name="date" 
                        className="input" 
                        defaultValue={selectedItem?.date} 
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="link">Certificate URL (optional)</label>
                      <input 
                        type="url" 
                        id="link" 
                        name="link" 
                        className="input" 
                        defaultValue={selectedItem?.link} 
                      />
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                      <button 
                        type="button" 
                        onClick={closeModal}
                        className="btn bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary">Save Certification</button>
                    </div>
                  </form>
                )}

                {/* Language Form */}
                {modalType === 'language' && (
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      const data: Language = {
                        id: selectedItem?.id || '',
                        name: formData.get('name') as string,
                        proficiency: formData.get('proficiency') as 'Basic' | 'Intermediate' | 'Fluent' | 'Native',
                      };
                      handleLanguageSubmit(data);
                    }}
                    className="space-y-4"
                  >
                    <div className="form-group">
                      <label className="form-label" htmlFor="name">Language</label>
                      <input 
                        type="text" 
                        id="name" 
                        name="name" 
                        className="input" 
                        defaultValue={selectedItem?.name} 
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="proficiency">Proficiency Level</label>
                      <select 
                        id="proficiency" 
                        name="proficiency" 
                        className="input" 
                        defaultValue={selectedItem?.proficiency} 
                        required
                      >
                        <option value="">Select proficiency level</option>
                        <option value="Native">Native</option>
                        <option value="Fluent">Fluent</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Basic">Basic</option>
                      </select>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                      <button 
                        type="button" 
                        onClick={closeModal}
                        className="btn bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary">Save Language</button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </BrowserRouter>
  );
};

export default App;
