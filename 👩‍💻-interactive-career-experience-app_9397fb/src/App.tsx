import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import styles from './styles/styles.module.css';
import { format } from 'date-fns';
import {
  User,
  Briefcase,
  GraduationCap, // Changed from Graduation
  Book,
  Medal,
  Code,
  Download,
  Upload,
  Moon,
  Sun,
  Menu,
  X,
  Github,
  Linkedin,
  Mail,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  FileText
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// Types
type Section = 'about' | 'experience' | 'education' | 'skills' | 'projects' | 'contact';

interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
  technologies: string[];
  achievements: string[];
}

interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface Skill {
  id: string;
  name: string;
  level: number; // 1-10
  category: 'technical' | 'soft' | 'language' | 'tool';
}

interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  link?: string;
  image?: string;
  demoLink?: string;
}

interface Resume {
  id: string;
  name: string;
  title: string;
  summary: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  github: string;
  experiences: Experience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
  file?: File | null;
}

interface FileWithPreview extends File {
  preview?: string;
}

const App: React.FC = () => {
  // State for resume data
  const [resume, setResume] = useState<Resume>(() => {
    const savedResume = localStorage.getItem('resume');
    if (savedResume) {
      return JSON.parse(savedResume);
    }
    return {
      id: '1',
      name: 'John Doe',
      title: 'Product Manager',
      summary: 'Experienced Product Manager with a proven track record in developing innovative products that drive business growth. Skilled in strategic planning, user research, and agile methodologies.',
      email: 'john.doe@example.com',
      phone: '+1 (123) 456-7890',
      location: 'San Francisco, CA',
      website: 'www.johndoe.com',
      linkedin: 'linkedin.com/in/johndoe',
      github: 'github.com/johndoe',
      experiences: [
        {
          id: '1',
          company: 'Tech Innovations Inc.',
          position: 'Senior Product Manager',
          startDate: '2020-01-01',
          endDate: 'Present',
          description: 'Leading product strategy and execution for the company\'s flagship SaaS platform.',
          technologies: ['Jira', 'Figma', 'Google Analytics', 'SQL'],
          achievements: [
            'Increased user engagement by 45% through data-driven UX improvements',
            'Led cross-functional team of 12 developers, designers, and QA engineers',
            'Launched 3 major product features that generated $2M in additional revenue'
          ]
        },
        {
          id: '2',
          company: 'Digital Solutions Ltd.',
          position: 'Product Manager',
          startDate: '2017-03-15',
          endDate: '2019-12-31',
          description: 'Managed the product lifecycle for a B2B analytics platform.',
          technologies: ['Trello', 'Sketch', 'Mixpanel', 'Python'],
          achievements: [
            'Reduced churn rate by 20% through implementing customer feedback loops',
            'Coordinated successful product launch that acquired 50 enterprise clients in first quarter',
            'Implemented agile methodologies that increased team velocity by 30%'
          ]
        }
      ],
      education: [
        {
          id: '1',
          institution: 'Stanford University',
          degree: 'Master of Business Administration',
          field: 'Product Management',
          startDate: '2015-09-01',
          endDate: '2017-06-30',
          description: 'Focused on product strategy and innovation. President of the Product Management Club.'
        },
        {
          id: '2',
          institution: 'University of California, Berkeley',
          degree: 'Bachelor of Science',
          field: 'Computer Science',
          startDate: '2011-09-01',
          endDate: '2015-05-30',
          description: 'Graduated with honors. Relevant coursework included software engineering, user experience design, and data analytics.'
        }
      ],
      skills: [
        { id: '1', name: 'Product Strategy', level: 9, category: 'technical' },
        { id: '2', name: 'User Research', level: 8, category: 'technical' },
        { id: '3', name: 'Agile Methodologies', level: 9, category: 'technical' },
        { id: '4', name: 'Data Analysis', level: 7, category: 'technical' },
        { id: '5', name: 'Wireframing', level: 8, category: 'technical' },
        { id: '6', name: 'SQL', level: 6, category: 'technical' },
        { id: '7', name: 'Leadership', level: 9, category: 'soft' },
        { id: '8', name: 'Communication', level: 9, category: 'soft' },
        { id: '9', name: 'Problem Solving', level: 8, category: 'soft' },
        { id: '10', name: 'Jira', level: 9, category: 'tool' },
        { id: '11', name: 'Figma', level: 8, category: 'tool' },
        { id: '12', name: 'Google Analytics', level: 7, category: 'tool' }
      ],
      projects: [
        {
          id: '1',
          name: 'Enterprise Analytics Dashboard',
          description: 'Led the development of a comprehensive analytics dashboard for enterprise clients, providing real-time insights into business operations.',
          technologies: ['React', 'Node.js', 'D3.js', 'SQL'],
          link: 'https://github.com/johndoe/analytics-dashboard',
          demoLink: 'https://analytics-dashboard-demo.com'
        },
        {
          id: '2',
          name: 'Mobile Customer Engagement App',
          description: 'Designed and launched a mobile application focused on improving customer engagement and retention through personalized experiences.',
          technologies: ['React Native', 'Firebase', 'Redux', 'Stripe API'],
          link: 'https://github.com/johndoe/customer-app'
        }
      ],
      file: null
    };
  });

  // Current active section
  const [activeSection, setActiveSection] = useState<Section>('about');
  
  // Dark mode state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode === 'true' || 
      (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);
  const [modalTitle, setModalTitle] = useState<string>('');
  
  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  
  // File upload state
  const [uploadedFile, setUploadedFile] = useState<FileWithPreview | null>(null);
  
  // Experience carousel state
  const [currentExperienceIndex, setCurrentExperienceIndex] = useState<number>(0);
  
  // Project carousel state
  const [currentProjectIndex, setCurrentProjectIndex] = useState<number>(0);
  
  // Refs
  const modalRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Save resume to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem('resume', JSON.stringify(resume));
  }, [resume]);
  
  // Apply dark mode class to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);
  
  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isModalOpen) {
        closeModal();
      }
    };
    
    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isModalOpen]);
  
  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
  }, [isModalOpen]);
  
  // Handle file upload
  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0] as FileWithPreview;
      // Create URL for preview
      file.preview = URL.createObjectURL(file);
      setUploadedFile(file);
      
      setResume(prev => ({
        ...prev,
        file
      }));
    }
  };
  
  // Clean up object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      if (uploadedFile && uploadedFile.preview) {
        URL.revokeObjectURL(uploadedFile.preview);
      }
    };
  }, [uploadedFile]);

  // Modal functions
  const openModal = (title: string, content: React.ReactNode) => {
    setModalTitle(title);
    setModalContent(content);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalContent(null);
    setModalTitle('');
  };

  // Experience carousel functions
  const nextExperience = () => {
    setCurrentExperienceIndex((prevIndex) => 
      prevIndex === resume.experiences.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevExperience = () => {
    setCurrentExperienceIndex((prevIndex) => 
      prevIndex === 0 ? resume.experiences.length - 1 : prevIndex - 1
    );
  };

  // Project carousel functions
  const nextProject = () => {
    setCurrentProjectIndex((prevIndex) => 
      prevIndex === resume.projects.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevProject = () => {
    setCurrentProjectIndex((prevIndex) => 
      prevIndex === 0 ? resume.projects.length - 1 : prevIndex - 1
    );
  };

  // Format date function
  const formatDate = (dateString: string): string => {
    if (dateString === 'Present') return 'Present';
    try {
      return format(new Date(dateString), 'MMM yyyy');
    } catch (error) {
      return dateString;
    }
  };

  // Download template resume
  const downloadTemplate = () => {
    const templateResume = {
      name: 'Your Name',
      title: 'Your Title',
      summary: 'A brief summary about yourself',
      email: 'your.email@example.com',
      phone: 'Your Phone Number',
      location: 'Your Location',
      website: 'your-website.com',
      linkedin: 'linkedin.com/in/yourprofile',
      github: 'github.com/yourusername',
      experiences: [
        {
          company: 'Company Name',
          position: 'Your Position',
          startDate: 'YYYY-MM-DD',
          endDate: 'YYYY-MM-DD or Present',
          description: 'Description of your role',
          technologies: ['Technology 1', 'Technology 2'],
          achievements: ['Achievement 1', 'Achievement 2']
        }
      ],
      education: [
        {
          institution: 'Institution Name',
          degree: 'Your Degree',
          field: 'Your Field of Study',
          startDate: 'YYYY-MM-DD',
          endDate: 'YYYY-MM-DD',
          description: 'Description of your education'
        }
      ],
      skills: [
        { name: 'Skill Name', level: 1-10, category: 'technical/soft/language/tool' }
      ],
      projects: [
        {
          name: 'Project Name',
          description: 'Project Description',
          technologies: ['Technology 1', 'Technology 2'],
          link: 'https://github.com/yourusername/project',
          demoLink: 'https://demo-link.com'
        }
      ]
    };
    
    const templateJSON = JSON.stringify(templateResume, null, 2);
    const blob = new Blob([templateJSON], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resume-template.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Navigation rendering
  const renderNavigation = () => {
    const navItems: { id: Section; label: string; icon: React.ReactNode }[] = [
      { id: 'about', label: 'About', icon: <User size={18} /> },
      { id: 'experience', label: 'Experience', icon: <Briefcase size={18} /> },
      { id: 'education', label: 'Education', icon: <GraduationCap size={18} /> }, // Changed from Graduation
      { id: 'skills', label: 'Skills', icon: <Book size={18} /> },
      { id: 'projects', label: 'Projects', icon: <Code size={18} /> },
      { id: 'contact', label: 'Contact', icon: <Mail size={18} /> }
    ];

    return (
      <>
        {/* Desktop Navigation */}
        <nav className="hidden md:block bg-white dark:bg-slate-800 shadow-md rounded-lg p-4 sticky top-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-2 p-2 rounded-md transition-all ${activeSection === item.id
                    ? 'bg-primary-500 text-white'
                    : 'hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200'}`}
                  aria-label={`Navigate to ${item.label} section`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-slate-400">Light</span>
              <button
                className={`${styles.themeToggle} ${isDarkMode ? styles.darkMode : ''}`}
                onClick={() => setIsDarkMode(!isDarkMode)}
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                <span className={styles.themeToggleThumb}></span>
              </button>
              <span className="text-sm text-gray-600 dark:text-slate-400">Dark</span>
            </div>
          </div>
        </nav>
        
        {/* Mobile Navigation Menu Button */}
        <button
          className="md:hidden fixed z-10 top-4 right-4 bg-white dark:bg-slate-800 p-2 rounded-full shadow-md"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        
        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-20 bg-white dark:bg-slate-900 p-4">
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold dark:text-white">Navigation</h2>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800"
                  aria-label="Close menu"
                >
                  <X size={24} />
                </button>
              </div>
              <ul className="space-y-4">
                {navItems.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => {
                        setActiveSection(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 p-3 rounded-md transition-all ${activeSection === item.id
                        ? 'bg-primary-500 text-white'
                        : 'hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200'}`}
                      aria-label={`Navigate to ${item.label} section`}
                    >
                      {item.icon}
                      <span className="text-lg">{item.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-6 border-t border-gray-200 dark:border-slate-700">
                <div className="flex items-center justify-center space-x-3">
                  <span className="text-gray-600 dark:text-slate-400">Light</span>
                  <button
                    className={`${styles.themeToggle} ${isDarkMode ? styles.darkMode : ''}`}
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                  >
                    <span className={styles.themeToggleThumb}></span>
                  </button>
                  <span className="text-gray-600 dark:text-slate-400">Dark</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  // Section rendering based on active section
  const renderSection = () => {
    switch (activeSection) {
      case 'about':
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 dark:bg-slate-700 flex items-center justify-center">
                {uploadedFile && uploadedFile.preview ? (
                  <img 
                    src={uploadedFile.preview} 
                    alt={resume.name} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <User size={48} className="text-gray-400 dark:text-gray-500" />
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">{resume.name}</h1>
                <p className="text-xl text-primary-600 dark:text-primary-400 mt-1">{resume.title}</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <a 
                    href={`mailto:${resume.email}`} 
                    className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
                    aria-label="Email"
                  >
                    <Mail size={16} />
                    <span>{resume.email}</span>
                  </a>
                  <a 
                    href={`https://${resume.linkedin}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
                    aria-label="LinkedIn profile"
                  >
                    <Linkedin size={16} />
                    <span>LinkedIn</span>
                  </a>
                  <a 
                    href={`https://${resume.github}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
                    aria-label="GitHub profile"
                  >
                    <Github size={16} />
                    <span>GitHub</span>
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Professional Summary</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{resume.summary}</p>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6">
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                  <FileText size={20} className="mr-2 text-primary-500" />
                  Resume File
                </h3>
                <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                  {uploadedFile ? (
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{uploadedFile.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <div className="mt-4 flex justify-center gap-3">
                        <button 
                          className="btn btn-sm bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                          onClick={() => {
                            setUploadedFile(null);
                            setResume(prev => ({ ...prev, file: null }));
                            if (fileInputRef.current) {
                              fileInputRef.current.value = '';
                            }
                          }}
                          aria-label="Remove file"
                        >
                          Remove
                        </button>
                        <a 
                          href={uploadedFile.preview}
                          download={uploadedFile.name}
                          className="btn btn-sm btn-primary"
                          aria-label="Download file"
                        >
                          <Download size={16} className="mr-1" /> Download
                        </a>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload size={36} className="text-gray-400 dark:text-gray-500 mb-3" />
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Drag and drop your resume file or click to browse</p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx,.json"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="resume-file"
                        aria-label="Upload resume file"
                      />
                      <label htmlFor="resume-file" className="btn btn-sm btn-primary">
                        <Upload size={16} className="mr-1" /> Upload Resume
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                        Or download a template to get started:
                      </p>
                      <button 
                        className="text-primary-500 hover:text-primary-600 text-sm mt-1 flex items-center"
                        onClick={downloadTemplate}
                        aria-label="Download template"
                      >
                        <Download size={14} className="mr-1" /> Template
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 'experience':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">Work Experience</h2>
            
            {resume.experiences.length > 0 ? (
              <div className="relative">
                <div className="card p-6">
                  <div className="flex flex-col md:flex-row justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                        {resume.experiences[currentExperienceIndex].position}
                      </h3>
                      <p className="text-lg text-primary-600 dark:text-primary-400">
                        {resume.experiences[currentExperienceIndex].company}
                      </p>
                    </div>
                    <div className="text-gray-600 dark:text-gray-300 mt-2 md:mt-0 text-sm md:text-right">
                      <p>
                        {formatDate(resume.experiences[currentExperienceIndex].startDate)} - {' '}
                        {formatDate(resume.experiences[currentExperienceIndex].endDate)}
                      </p>
                    </div>
                  </div>

                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      {resume.experiences[currentExperienceIndex].description}
                    </p>
                  </div>

                  <div className="mt-6">
                    <h4 className="text-md font-semibold text-gray-700 dark:text-gray-200 mb-2">Technologies Used</h4>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {resume.experiences[currentExperienceIndex].technologies.map((tech, idx) => (
                        <span 
                          key={idx} 
                          className="badge bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4">
                    <h4 className="text-md font-semibold text-gray-700 dark:text-gray-200 mb-2">Key Achievements</h4>
                    <ul className="space-y-2">
                      {resume.experiences[currentExperienceIndex].achievements.map((achievement, idx) => (
                        <li 
                          key={idx}
                          className="flex items-start text-gray-600 dark:text-gray-300"
                        >
                          <span className="text-primary-500 mr-2">•</span>
                          <span>{achievement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {resume.experiences.length > 1 && (
                  <div className="flex justify-between mt-4">
                    <button 
                      onClick={prevExperience} 
                      className="btn btn-sm bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center"
                      aria-label="Previous experience"
                    >
                      <ChevronLeft size={16} className="mr-1" /> Previous
                    </button>
                    <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                      {currentExperienceIndex + 1} of {resume.experiences.length}
                    </div>
                    <button 
                      onClick={nextExperience} 
                      className="btn btn-sm bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center"
                      aria-label="Next experience"
                    >
                      Next <ChevronRight size={16} className="ml-1" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center p-8 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                <p className="text-gray-500 dark:text-gray-400">No work experience added yet.</p>
              </div>
            )}
          </div>
        );

      case 'education':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">Education</h2>
            
            <div className="grid grid-cols-1 gap-6">
              {resume.education.map((edu) => (
                <div key={edu.id} className="card p-6">
                  <div className="flex flex-col md:flex-row justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white">{edu.degree}</h3>
                      <p className="text-lg text-primary-600 dark:text-primary-400">{edu.institution}</p>
                      <p className="text-gray-600 dark:text-gray-300 mt-1">{edu.field}</p>
                    </div>
                    <div className="text-gray-600 dark:text-gray-300 mt-2 md:mt-0 text-sm md:text-right">
                      <p>
                        {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                      </p>
                    </div>
                  </div>

                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-gray-600 dark:text-gray-300">{edu.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {resume.education.length === 0 && (
              <div className="text-center p-8 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                <p className="text-gray-500 dark:text-gray-400">No education history added yet.</p>
              </div>
            )}
          </div>
        );

      case 'skills':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">Skills & Expertise</h2>
            
            <div className="grid grid-cols-1 gap-8">
              {/* Technical Skills */}
              <div className="card p-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Technical Skills</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {resume.skills
                    .filter(skill => skill.category === 'technical')
                    .map((skill) => (
                      <div key={skill.id} className="">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-gray-700 dark:text-gray-300">{skill.name}</span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">{skill.level}/10</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                          <div 
                            className="bg-primary-500 h-2.5 rounded-full" 
                            style={{ width: `${skill.level * 10}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                </div>

                {resume.skills.filter(skill => skill.category === 'technical').length === 0 && (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">No technical skills added yet.</p>
                )}
              </div>

              {/* Soft Skills */}
              <div className="card p-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Soft Skills</h3>
                
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart 
                    data={resume.skills
                      .filter(skill => skill.category === 'soft')
                      .map(skill => ({
                        name: skill.name,
                        value: skill.level
                      }))}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                  >
                    <XAxis type="number" domain={[0, 10]} />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip 
                      formatter={(value) => [`${value}/10`, 'Skill Level']}
                      contentStyle={{
                        backgroundColor: isDarkMode ? '#1e293b' : '#fff',
                        border: isDarkMode ? '1px solid #475569' : '1px solid #e2e8f0',
                        borderRadius: '0.375rem',
                        color: isDarkMode ? '#f8fafc' : '#1e293b'
                      }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {resume.skills
                        .filter(skill => skill.category === 'soft')
                        .map((_, index) => (
                          <Cell key={`cell-${index}`} fill="#3b82f6" />
                        ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>

                {resume.skills.filter(skill => skill.category === 'soft').length === 0 && (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">No soft skills added yet.</p>
                )}
              </div>

              {/* Tools */}
              <div className="card p-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Tools & Technologies</h3>
                <div className="flex flex-wrap gap-2">
                  {resume.skills
                    .filter(skill => skill.category === 'tool')
                    .sort((a, b) => b.level - a.level)
                    .map((skill) => (
                      <div 
                        key={skill.id} 
                        className="bg-gray-100 dark:bg-slate-700 px-4 py-2 rounded-full flex items-center gap-2"
                        style={{
                          fontSize: `${Math.max(0.8, Math.min(1.2, skill.level / 10 + 0.5))}rem`
                        }}
                      >
                        <span className="text-gray-800 dark:text-gray-200">{skill.name}</span>
                        <span className="text-xs py-0.5 px-1.5 bg-primary-100 dark:bg-primary-800 text-primary-800 dark:text-primary-200 rounded">
                          {skill.level}/10
                        </span>
                      </div>
                    ))}
                </div>

                {resume.skills.filter(skill => skill.category === 'tool').length === 0 && (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">No tools added yet.</p>
                )}
              </div>
            </div>
          </div>
        );

      case 'projects':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">Projects & Portfolio</h2>
            
            {resume.projects.length > 0 ? (
              <div className="relative">
                <div className="card p-6">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                      {resume.projects[currentProjectIndex].name}
                      {resume.projects[currentProjectIndex].link && (
                        <a 
                          href={resume.projects[currentProjectIndex].link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-primary-500 hover:text-primary-600 flex items-center"
                          aria-label="View project repository"
                        >
                          <Github size={16} className="ml-2" />
                        </a>
                      )}
                    </h3>
                  </div>

                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      {resume.projects[currentProjectIndex].description}
                    </p>
                  </div>

                  <div className="mt-4">
                    <h4 className="text-md font-semibold text-gray-700 dark:text-gray-200 mb-2">Technologies Used</h4>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {resume.projects[currentProjectIndex].technologies.map((tech, idx) => (
                        <span 
                          key={idx} 
                          className="badge bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {resume.projects[currentProjectIndex].demoLink && (
                    <div className="mt-6">
                      <a 
                        href={resume.projects[currentProjectIndex].demoLink} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="btn btn-primary flex items-center justify-center gap-2 w-full sm:w-auto"
                        aria-label="View live demo"
                      >
                        <ExternalLink size={16} />
                        View Live Demo
                      </a>
                    </div>
                  )}
                </div>

                {resume.projects.length > 1 && (
                  <div className="flex justify-between mt-4">
                    <button 
                      onClick={prevProject} 
                      className="btn btn-sm bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center"
                      aria-label="Previous project"
                    >
                      <ChevronLeft size={16} className="mr-1" /> Previous
                    </button>
                    <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                      {currentProjectIndex + 1} of {resume.projects.length}
                    </div>
                    <button 
                      onClick={nextProject} 
                      className="btn btn-sm bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center"
                      aria-label="Next project"
                    >
                      Next <ChevronRight size={16} className="ml-1" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center p-8 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                <p className="text-gray-500 dark:text-gray-400">No projects added yet.</p>
              </div>
            )}
          </div>
        );

      case 'contact':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">Contact Information</h2>
            
            <div className="card p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Get in Touch</h3>
                  
                  <div className="space-y-4">
                    <a 
                      href={`mailto:${resume.email}`}
                      className="flex items-center gap-3 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
                      aria-label="Email"
                    >
                      <Mail size={20} className="text-primary-500" />
                      <span>{resume.email}</span>
                    </a>
                    
                    {resume.phone && (
                      <p className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                        <span className="text-primary-500">☎</span>
                        <span>{resume.phone}</span>
                      </p>
                    )}
                    
                    {resume.location && (
                      <p className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                        <span className="text-primary-500">📍</span>
                        <span>{resume.location}</span>
                      </p>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Professional Profiles</h3>
                  
                  <div className="space-y-4">
                    {resume.website && (
                      <a 
                        href={`https://${resume.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
                        aria-label="Personal website"
                      >
                        <span className="text-primary-500">🌐</span>
                        <span>{resume.website}</span>
                      </a>
                    )}
                    
                    <a 
                      href={`https://${resume.linkedin}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
                      aria-label="LinkedIn profile"
                    >
                      <Linkedin size={20} className="text-primary-500" />
                      <span>{resume.linkedin}</span>
                    </a>
                    
                    <a 
                      href={`https://${resume.github}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
                      aria-label="GitHub profile"
                    >
                      <Github size={20} className="text-primary-500" />
                      <span>{resume.github}</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 theme-transition">
      {/* Modal */}
      {isModalOpen && (
        <div 
          className="modal-backdrop fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div 
            ref={modalRef}
            className="modal-content w-full max-w-md bg-white dark:bg-slate-800 rounded-lg shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header p-4 border-b border-gray-200 dark:border-slate-700">
              <h3 id="modal-title" className="text-lg font-medium text-gray-900 dark:text-white">{modalTitle}</h3>
              <button 
                onClick={closeModal} 
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4">
              {modalContent}
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <aside className="md:w-64 shrink-0">
            {renderNavigation()}
          </aside>
          
          {/* Main Content */}
          <main className="flex-1 bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
            {renderSection()}
          </main>
        </div>

        {/* Footer */}
        <footer className="mt-12 border-t border-gray-200 dark:border-slate-800 pt-6 text-center text-sm text-gray-500 dark:text-slate-400">
          Copyright © 2025 of Datavtar Private Limited. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default App;