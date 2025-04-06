import React, { useState, useEffect, useRef } from 'react';
import { Camera } from 'react-camera-pro';
import {
  User,
  Download,
  Upload,
  Sun,
  Moon,
  Menu,
  X,
  Briefcase,
  GraduationCap,
  Code,
  Award,
  FileText,
  Github,
  Linkedin,
  Mail,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Calendar,
  PanelRight,
  Phone,
  MapPin,
  Globe
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import styles from './styles/styles.module.css';

// Define types for the application
type ExperienceType = {
  id: string;
  company: string;
  role: string;
  duration: string;
  description: string;
  skills: string[];
  projects: ProjectType[];
};

type ProjectType = {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  link?: string;
};

type EducationType = {
  id: string;
  institution: string;
  degree: string;
  field: string;
  year: string;
};

type SkillType = {
  id: string;
  name: string;
  proficiency: number; // 0-100
  category: 'technical' | 'soft' | 'language' | 'tool';
};

type ResumeType = {
  name: string;
  title: string;
  bio: string;
  contact: {
    email: string;
    phone: string;
    location: string;
    website?: string;
    github?: string;
    linkedin?: string;
  };
  experiences: ExperienceType[];
  education: EducationType[];
  skills: SkillType[];
  achievements: string[];
  resumeFile?: string; // base64 encoded file
};

// Define theme context type
type Theme = 'light' | 'dark';

// Main App Component
function App() {
  // Sections for the CV application
  enum Section {
    Home = 'home',
    About = 'about',
    Experience = 'experience',
    ExperienceDetail = 'experienceDetail',
    Projects = 'projects',
    ProjectDetail = 'projectDetail',
    Skills = 'skills',
    Education = 'education',
    Contact = 'contact',
    ViewResume = 'viewResume',
    UploadResume = 'uploadResume'
  }

  // State variables
  const [theme, setTheme] = useState<Theme>('light');
  const [activeSection, setActiveSection] = useState<Section>(Section.Home);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [resumeFile, setResumeFile] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [currentExperience, setCurrentExperience] = useState<ExperienceType | null>(null);
  const [currentProject, setCurrentProject] = useState<ProjectType | null>(null);
  const [camera, setCamera] = useState<any>(null);
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [activeExperienceIndex, setActiveExperienceIndex] = useState<number>(0);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedResume, setEditedResume] = useState<ResumeType | null>(null);

  // Default resume data
  const defaultResumeData: ResumeType = {
    name: 'Alex Johnson',
    title: 'Senior Product Manager',
    bio: 'Experienced product manager with over 8 years of experience in the tech industry. Passionate about creating products that solve real-world problems and deliver exceptional user experiences.',
    contact: {
      email: 'alex.johnson@example.com',
      phone: '+1 (555) 123-4567',
      location: 'San Francisco, CA',
      website: 'alexjohnson.dev',
      github: 'github.com/alexjohnson',
      linkedin: 'linkedin.com/in/alexjohnson'
    },
    experiences: [
      {
        id: 'exp1',
        company: 'TechCorp',
        role: 'Senior Product Manager',
        duration: '2019 - Present',
        description: 'Leading product development for enterprise solutions. Managed a team of designers and developers to deliver innovative products that increased customer satisfaction by 35%.',
        skills: ['Product Strategy', 'UX Design', 'Agile', 'JIRA', 'User Research'],
        projects: [
          {
            id: 'proj1',
            name: 'Enterprise Dashboard',
            description: 'Led the development of a comprehensive analytics dashboard for enterprise clients, resulting in 45% increase in user engagement.',
            technologies: ['React', 'Node.js', 'MongoDB', 'D3.js']
          },
          {
            id: 'proj2',
            name: 'Mobile App Redesign',
            description: 'Spearheaded the redesign of the company mobile app, improving user satisfaction scores from 72% to 94%.',
            technologies: ['Figma', 'React Native', 'Swift', 'User Testing']
          }
        ]
      },
      {
        id: 'exp2',
        company: 'InnovateSoft',
        role: 'Product Manager',
        duration: '2016 - 2019',
        description: 'Managed the product lifecycle for a SaaS platform. Collaborated with cross-functional teams to define product vision and roadmap.',
        skills: ['Product Roadmap', 'Market Research', 'A/B Testing', 'Stakeholder Management'],
        projects: [
          {
            id: 'proj3',
            name: 'Customer Analytics Platform',
            description: 'Developed a customer analytics platform that provided insights into user behavior, resulting in 28% increase in customer retention.',
            technologies: ['Python', 'AWS', 'Tableau', 'Machine Learning']
          }
        ]
      },
      {
        id: 'exp3',
        company: 'StartupVision',
        role: 'Associate Product Manager',
        duration: '2014 - 2016',
        description: 'Assisted in the development of an AI-powered marketing automation tool. Conducted user research and competitive analysis.',
        skills: ['User Stories', 'Wireframing', 'Competitive Analysis', 'Data Analysis'],
        projects: [
          {
            id: 'proj4',
            name: 'Marketing Automation Tool',
            description: 'Helped build an AI-driven marketing automation tool that increased campaign effectiveness by 40% for our clients.',
            technologies: ['AI/ML', 'JavaScript', 'HubSpot API', 'Google Analytics']
          }
        ]
      }
    ],
    education: [
      {
        id: 'edu1',
        institution: 'Stanford University',
        degree: 'Master of Business Administration',
        field: 'Product Management',
        year: '2014'
      },
      {
        id: 'edu2',
        institution: 'University of California, Berkeley',
        degree: 'Bachelor of Science',
        field: 'Computer Science',
        year: '2012'
      }
    ],
    skills: [
      { id: 'skill1', name: 'Product Strategy', proficiency: 95, category: 'technical' },
      { id: 'skill2', name: 'Agile Methodology', proficiency: 90, category: 'technical' },
      { id: 'skill3', name: 'User Research', proficiency: 85, category: 'technical' },
      { id: 'skill4', name: 'Data Analysis', proficiency: 80, category: 'technical' },
      { id: 'skill5', name: 'UX/UI Design', proficiency: 75, category: 'technical' },
      { id: 'skill6', name: 'Stakeholder Management', proficiency: 90, category: 'soft' },
      { id: 'skill7', name: 'Team Leadership', proficiency: 85, category: 'soft' },
      { id: 'skill8', name: 'Communication', proficiency: 95, category: 'soft' },
      { id: 'skill9', name: 'JIRA', proficiency: 90, category: 'tool' },
      { id: 'skill10', name: 'Figma', proficiency: 85, category: 'tool' },
      { id: 'skill11', name: 'Tableau', proficiency: 75, category: 'tool' },
      { id: 'skill12', name: 'SQL', proficiency: 70, category: 'technical' }
    ],
    achievements: [
      'Increased product adoption by 65% through strategic feature development and marketing',
      'Awarded "Product Manager of the Year" at TechCorp in 2021',
      'Reduced development time by 30% through implementation of improved agile processes',
      'Speaker at ProductCon 2020 on "Building Products that Scale"',
      'Published article on product management best practices in Harvard Business Review'
    ]
  };

  // State for managing resume data
  const [resumeData, setResumeData] = useState<ResumeType>(defaultResumeData);

  // Refs
  const modalRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const experienceContainerRef = useRef<HTMLDivElement>(null);

  // Load resume data from localStorage on component mount
  useEffect(() => {
    const savedResumeData = localStorage.getItem('resumeData');
    if (savedResumeData) {
      try {
        setResumeData(JSON.parse(savedResumeData));
      } catch (e) {
        console.error('Error parsing saved resume data:', e);
      }
    }

    const savedProfileImage = localStorage.getItem('profileImage');
    if (savedProfileImage) {
      setProfileImage(savedProfileImage);
    }

    // Load theme preference
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }

    // Event listener for ESC key to close modals
    const handleEscKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsCameraOpen(false);
        setIsMobileMenuOpen(false);
      }
    };
    
    document.addEventListener('keydown', handleEscKeyPress);
    
    return () => {
      document.removeEventListener('keydown', handleEscKeyPress);
    };
  }, []);

  // Save resume data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('resumeData', JSON.stringify(resumeData));
  }, [resumeData]);

  // Save profile image to localStorage whenever it changes
  useEffect(() => {
    if (profileImage) {
      localStorage.setItem('profileImage', profileImage);
    }
  }, [profileImage]);

  // Save theme preference to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Handle theme toggle
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  // Handle section change
  const navigateTo = (section: Section) => {
    setActiveSection(section);
    setIsMobileMenuOpen(false);
  };

  // Handle resume file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadstart = () => setUploadProgress(0);
    
    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        const progress = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(progress);
      }
    };
    
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setResumeFile(result);
      setUploadProgress(100);
      
      // Update resume data with the file
      setResumeData(prev => ({
        ...prev,
        resumeFile: result
      }));
      
      // Navigate to view resume section after upload
      setTimeout(() => {
        setActiveSection(Section.ViewResume);
        setUploadProgress(0);
      }, 500);
    };
    
    reader.readAsDataURL(file);
  };

  // Handle view experience detail
  const viewExperienceDetail = (experience: ExperienceType) => {
    setCurrentExperience(experience);
    setActiveSection(Section.ExperienceDetail);
  };

  // Handle view project detail
  const viewProjectDetail = (project: ProjectType) => {
    setCurrentProject(project);
    setActiveSection(Section.ProjectDetail);
  };

  // Handle camera capture
  const capturePhoto = () => {
    if (camera) {
      const photo = camera.takePhoto();
      setProfileImage(photo);
      setIsCameraOpen(false);
    }
  };

  // Navigate experiences
  const navigateExperience = (direction: 'next' | 'prev') => {
    const experiences = resumeData.experiences;
    let newIndex = activeExperienceIndex;
    
    if (direction === 'next') {
      newIndex = (activeExperienceIndex + 1) % experiences.length;
    } else {
      newIndex = (activeExperienceIndex - 1 + experiences.length) % experiences.length;
    }
    
    setActiveExperienceIndex(newIndex);
  };
  
  // Handle edit resume
  const handleEditResume = () => {
    setEditedResume({...resumeData});
    setIsEditing(true);
  };
  
  // Handle save edited resume
  const handleSaveResume = () => {
    if (editedResume) {
      setResumeData(editedResume);
      setIsEditing(false);
    }
  };
  
  // Handle editing resume fields
  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: string, subfield?: string) => {
    if (!editedResume) return;
    
    if (subfield) {
      setEditedResume({
        ...editedResume,
        [field]: {
          ...editedResume[field as keyof ResumeType] as object,
          [subfield]: e.target.value
        }
      });
    } else {
      setEditedResume({
        ...editedResume,
        [field]: e.target.value
      });
    }
  };

  // Sample chart data for skills visualization
  const skillChartData = resumeData.skills
    .filter(skill => skill.category === 'technical')
    .slice(0, 6)
    .map(skill => ({
      name: skill.name,
      value: skill.proficiency
    }));

  // Growth data for visualization
  const growthData = [
    { year: '2014', growth: 40 },
    { year: '2015', growth: 55 },
    { year: '2016', growth: 65 },
    { year: '2017', growth: 70 },
    { year: '2018', growth: 75 },
    { year: '2019', growth: 80 },
    { year: '2020', growth: 85 },
    { year: '2021', growth: 95 },
    { year: '2022', growth: 100 },
  ];

  // Experience timeline component
  const ExperienceTimeline = () => (
    <div className="space-y-6 py-4">
      {resumeData.experiences.map((exp, index) => (
        <div key={exp.id} className="card hover:shadow-md transition-shadow cursor-pointer" onClick={() => viewExperienceDetail(exp)}>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
              <Briefcase className="text-primary-600 dark:text-primary-300" size={20} />
            </div>
            <div className="flex-grow">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">{exp.role}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">{exp.company} · {exp.duration}</p>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{exp.description}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {exp.skills.slice(0, 3).map((skill, idx) => (
                  <span key={idx} className="badge badge-info text-xs">{skill}</span>
                ))}
                {exp.skills.length > 3 && (
                  <span className="badge bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 text-xs">+{exp.skills.length - 3} more</span>
                )}
              </div>
            </div>
            <ChevronRight className="text-gray-400" size={20} />
          </div>
        </div>
      ))}
    </div>
  );

  // Skills component
  const SkillsSection = () => (
    <div className="py-4 space-y-6">
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Technical Skills</h3>
        <div className="space-y-4">
          {resumeData.skills
            .filter(skill => skill.category === 'technical')
            .map(skill => (
              <div key={skill.id} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{skill.name}</span>
                  <span>{skill.proficiency}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-primary-600 dark:bg-primary-500 h-2 rounded-full" 
                    style={{ width: `${skill.proficiency}%` }}
                  ></div>
                </div>
              </div>
            ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Soft Skills</h3>
          <div className="space-y-4">
            {resumeData.skills
              .filter(skill => skill.category === 'soft')
              .map(skill => (
                <div key={skill.id} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{skill.name}</span>
                    <span>{skill.proficiency}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-secondary-500 dark:bg-secondary-400 h-2 rounded-full" 
                      style={{ width: `${skill.proficiency}%` }}
                    ></div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Tools & Technologies</h3>
          <div className="grid grid-cols-2 gap-4">
            {resumeData.skills
              .filter(skill => skill.category === 'tool')
              .map(skill => (
                <div key={skill.id} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary-500"></div>
                  <span className="text-sm">{skill.name}</span>
                </div>
              ))}
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Skills Visualization</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={skillChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  // Experience Carousel component
  const ExperienceCarousel = () => {
    const experience = resumeData.experiences[activeExperienceIndex];
    
    return (
      <div ref={experienceContainerRef} className="py-4 space-y-6">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigateExperience('prev')} className="btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700">
            <ChevronLeft size={20} />
          </button>
          <div className="text-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {activeExperienceIndex + 1} of {resumeData.experiences.length}
            </span>
          </div>
          <button onClick={() => navigateExperience('next')} className="btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700">
            <ChevronRight size={20} />
          </button>
        </div>
        
        <div className={styles.carouselCard}>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-shrink-0 w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
              <Briefcase className="text-primary-600 dark:text-primary-300" size={18} />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{experience.role}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">{experience.company} · {experience.duration}</p>
            </div>
          </div>
          
          <p className="text-gray-700 dark:text-gray-300 mb-4">{experience.description}</p>
          
          <div className="mb-4">
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">Key Skills</h4>
            <div className="flex flex-wrap gap-2">
              {experience.skills.map((skill, idx) => (
                <span key={idx} className="badge badge-info">{skill}</span>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">Projects</h4>
            <div className="space-y-3">
              {experience.projects.map(project => (
                <div 
                  key={project.id} 
                  className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                  onClick={() => viewProjectDetail(project)}
                >
                  <h5 className="font-medium text-gray-900 dark:text-white">{project.name}</h5>
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{project.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Education component
  const EducationSection = () => (
    <div className="py-4 space-y-6">
      {resumeData.education.map(edu => (
        <div key={edu.id} className="card hover:shadow-md transition-shadow">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
              <GraduationCap className="text-primary-600 dark:text-primary-300" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">{edu.institution}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">{edu.degree} in {edu.field}</p>
              <div className="mt-1 flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                <Calendar size={14} />
                <span>{edu.year}</span>
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className="card overflow-hidden">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Career Growth</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={growthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis dataKey="year" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Area type="monotone" dataKey="growth" stroke="#8884d8" fill="#8884d833" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  // UI components based on active section
  const renderContent = () => {
    switch (activeSection) {
      case Section.Home:
        return (
          <div className="space-y-8 py-4">
            <div className="card-responsive flex flex-col md:flex-row items-center gap-6">
              <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                {profileImage ? (
                  <img src={profileImage} alt={resumeData.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <User size={48} />
                  </div>
                )}
                <button 
                  onClick={() => setIsCameraOpen(true)}
                  className="absolute bottom-1 right-1 bg-primary-500 text-white p-1 rounded-full hover:bg-primary-600"
                  aria-label="Take photo"
                >
                  <Camera size={16} />
                </button>
              </div>
              <div className="text-center md:text-left">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{resumeData.name}</h1>
                <p className="text-lg text-primary-600 dark:text-primary-400">{resumeData.title}</p>
                <p className="mt-2 text-gray-600 dark:text-gray-300">{resumeData.bio}</p>
                <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
                  <a 
                    href={`mailto:${resumeData.contact.email}`} 
                    className="btn-sm flex items-center gap-1 bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                    aria-label="Email me"
                  >
                    <Mail size={14} />
                    <span>Email</span>
                  </a>
                  {resumeData.contact.linkedin && (
                    <a 
                      href={`https://${resumeData.contact.linkedin}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn-sm flex items-center gap-1 bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800"
                      aria-label="LinkedIn profile"
                    >
                      <Linkedin size={14} />
                      <span>LinkedIn</span>
                    </a>
                  )}
                  {resumeData.contact.github && (
                    <a 
                      href={`https://${resumeData.contact.github}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn-sm flex items-center gap-1 bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                      aria-label="GitHub profile"
                    >
                      <Github size={14} />
                      <span>GitHub</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Quick Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="stat-card">
                  <div className="stat-title">Years of Experience</div>
                  <div className="stat-value">8+</div>
                  <div className="stat-desc">In Product Management</div>
                </div>
                <div className="stat-card">
                  <div className="stat-title">Projects Delivered</div>
                  <div className="stat-value">20+</div>
                  <div className="stat-desc">Across various industries</div>
                </div>
                <div className="stat-card">
                  <div className="stat-title">Team Size Managed</div>
                  <div className="stat-value">15</div>
                  <div className="stat-desc">Cross-functional members</div>
                </div>
              </div>
            </div>

            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Notable Achievements</h2>
              <div className="space-y-3">
                {resumeData.achievements.map((achievement, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <Award className="text-primary-500" size={18} />
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">{achievement}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Interactive Resume</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Explore my career journey and experience through this interactive CV app or view my traditional resume.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={() => navigateTo(Section.Experience)}
                  className="btn btn-primary flex items-center justify-center gap-2"
                  aria-label="Explore Career"
                >
                  <Briefcase size={18} />
                  <span>Explore My Career</span>
                </button>
                <button 
                  onClick={() => navigateTo(Section.UploadResume)}
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 flex items-center justify-center gap-2"
                  aria-label="Upload Resume"
                >
                  <Upload size={18} />
                  <span>Upload Resume</span>
                </button>
                {resumeData.resumeFile && (
                  <button 
                    onClick={() => navigateTo(Section.ViewResume)}
                    className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 flex items-center justify-center gap-2"
                    aria-label="View Resume"
                  >
                    <FileText size={18} />
                    <span>View Resume</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        );

      case Section.About:
        return (
          <div className="space-y-8 py-4">
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">About Me</h2>
              <p className="text-gray-700 dark:text-gray-300">{resumeData.bio}</p>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Contact Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <Mail size={16} className="text-gray-500 dark:text-gray-400" />
                      <a href={`mailto:${resumeData.contact.email}`} className="hover:text-primary-600 dark:hover:text-primary-400">
                        {resumeData.contact.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <Phone size={16} className="text-gray-500 dark:text-gray-400" />
                      <span>{resumeData.contact.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <MapPin size={16} className="text-gray-500 dark:text-gray-400" />
                      <span>{resumeData.contact.location}</span>
                    </div>
                    {resumeData.contact.website && (
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <Globe size={16} className="text-gray-500 dark:text-gray-400" />
                        <a 
                          href={`https://${resumeData.contact.website}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:text-primary-600 dark:hover:text-primary-400"
                        >
                          {resumeData.contact.website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Professional Profiles</h3>
                  <div className="space-y-2">
                    {resumeData.contact.linkedin && (
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <Linkedin size={16} className="text-gray-500 dark:text-gray-400" />
                        <a 
                          href={`https://${resumeData.contact.linkedin}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:text-primary-600 dark:hover:text-primary-400"
                        >
                          {resumeData.contact.linkedin}
                        </a>
                      </div>
                    )}
                    {resumeData.contact.github && (
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <Github size={16} className="text-gray-500 dark:text-gray-400" />
                        <a 
                          href={`https://${resumeData.contact.github}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:text-primary-600 dark:hover:text-primary-400"
                        >
                          {resumeData.contact.github}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Professional Summary</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                As a product manager with over 8 years of experience, I have developed a strong track record of 
                delivering successful products across various industries. My approach combines strategic thinking 
                with a deep understanding of user needs and market trends.
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                I specialize in developing product roadmaps, conducting market research, and collaborating with 
                cross-functional teams to bring innovative solutions to market. My leadership style emphasizes 
                clear communication, data-driven decision making, and agile methodologies.
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                Throughout my career, I've prioritized user-centered design and have implemented processes that 
                increased product adoption and customer satisfaction. I am passionate about creating products 
                that not only meet business objectives but also delight users.
              </p>
            </div>

            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Career Philosophy</h2>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 space-y-4">
                  <div className="p-4 bg-primary-50 dark:bg-primary-900/30 rounded-lg">
                    <h3 className="text-lg font-medium text-primary-700 dark:text-primary-300 mb-2">My Vision</h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      To develop products that solve real problems and have a positive impact on users' lives 
                      while contributing to business growth and innovation.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-secondary-50 dark:bg-secondary-900/30 rounded-lg">
                    <h3 className="text-lg font-medium text-secondary-700 dark:text-secondary-300 mb-2">My Approach</h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      I believe in a user-centered, data-driven approach to product development that balances 
                      innovation with practical execution and measurable outcomes.
                    </p>
                  </div>
                </div>
                
                <div className="flex-1 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Core Values</h3>
                  <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <div className="mt-1 text-primary-500">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="6" cy="6" r="6" fill="currentColor" />
                        </svg>
                      </div>
                      <span><strong>User Empathy:</strong> Understanding the needs and pain points of users</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="mt-1 text-primary-500">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="6" cy="6" r="6" fill="currentColor" />
                        </svg>
                      </div>
                      <span><strong>Data-Driven:</strong> Making decisions based on evidence and metrics</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="mt-1 text-primary-500">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="6" cy="6" r="6" fill="currentColor" />
                        </svg>
                      </div>
                      <span><strong>Collaborative:</strong> Working effectively with cross-functional teams</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="mt-1 text-primary-500">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="6" cy="6" r="6" fill="currentColor" />
                        </svg>
                      </div>
                      <span><strong>Adaptable:</strong> Embracing change and learning continuously</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="mt-1 text-primary-500">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="6" cy="6" r="6" fill="currentColor" />
                        </svg>
                      </div>
                      <span><strong>Result-Oriented:</strong> Focusing on delivering measurable outcomes</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            {isEditing ? (
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Edit Profile</h2>
                <div className="space-y-4">
                  <div className="form-group">
                    <label className="form-label" htmlFor="name">Name</label>
                    <input 
                      id="name" 
                      type="text" 
                      className="input" 
                      value={editedResume?.name || ''}
                      onChange={(e) => handleResumeChange(e, 'name')}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="title">Professional Title</label>
                    <input 
                      id="title" 
                      type="text" 
                      className="input" 
                      value={editedResume?.title || ''}
                      onChange={(e) => handleResumeChange(e, 'title')}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="bio">Bio</label>
                    <textarea 
                      id="bio" 
                      className="input min-h-[100px]" 
                      value={editedResume?.bio || ''}
                      onChange={(e) => handleResumeChange(e, 'bio')}
                    ></textarea>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-group">
                      <label className="form-label" htmlFor="email">Email</label>
                      <input 
                        id="email" 
                        type="email" 
                        className="input" 
                        value={editedResume?.contact.email || ''}
                        onChange={(e) => handleResumeChange(e, 'contact', 'email')}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label" htmlFor="phone">Phone</label>
                      <input 
                        id="phone" 
                        type="tel" 
                        className="input" 
                        value={editedResume?.contact.phone || ''}
                        onChange={(e) => handleResumeChange(e, 'contact', 'phone')}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label" htmlFor="location">Location</label>
                      <input 
                        id="location" 
                        type="text" 
                        className="input" 
                        value={editedResume?.contact.location || ''}
                        onChange={(e) => handleResumeChange(e, 'contact', 'location')}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label" htmlFor="website">Website</label>
                      <input 
                        id="website" 
                        type="text" 
                        className="input" 
                        value={editedResume?.contact.website || ''}
                        onChange={(e) => handleResumeChange(e, 'contact', 'website')}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-3 mt-6">
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSaveResume}
                      className="btn btn-primary"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex justify-end">
                <button 
                  onClick={handleEditResume}
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                  <span>Edit Profile</span>
                </button>
              </div>
            )}
          </div>
        );

      case Section.Experience:
        return <ExperienceTimeline />;

      case Section.ExperienceDetail:
        return currentExperience ? (
          <div className="py-4 space-y-6">
            <button 
              onClick={() => navigateTo(Section.Experience)}
              className="btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700 flex items-center gap-2"
              aria-label="Back to experiences"
            >
              <ChevronLeft size={18} />
              <span>Back to experiences</span>
            </button>
            
            <div className="card">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-shrink-0 w-14 h-14 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                  <Briefcase className="text-primary-600 dark:text-primary-300" size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{currentExperience.role}</h2>
                  <p className="text-lg text-gray-600 dark:text-gray-300">{currentExperience.company} · {currentExperience.duration}</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Description</h3>
                  <p className="text-gray-700 dark:text-gray-300">{currentExperience.description}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Key Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {currentExperience.skills.map((skill, idx) => (
                      <span key={idx} className="badge badge-info">{skill}</span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Projects</h3>
                  <div className="space-y-4">
                    {currentExperience.projects.map(project => (
                      <div 
                        key={project.id} 
                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => viewProjectDetail(project)}
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-md font-semibold text-gray-900 dark:text-white">{project.name}</h4>
                          <ExternalLink size={18} className="text-gray-400" />
                        </div>
                        <p className="mt-2 text-gray-600 dark:text-gray-300">{project.description}</p>
                        <div className="mt-3 flex flex-wrap gap-1">
                          {project.technologies.map((tech, idx) => (
                            <span key={idx} className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">{tech}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-4 text-center">
            <p className="text-gray-600 dark:text-gray-300">Experience not found. Please go back and select an experience.</p>
            <button 
              onClick={() => navigateTo(Section.Experience)}
              className="mt-4 btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700"
            >
              Go to Experiences
            </button>
          </div>
        );
        
      case Section.ProjectDetail:
        return currentProject ? (
          <div className="py-4 space-y-6">
            <button 
              onClick={() => navigateTo(Section.ExperienceDetail)}
              className="btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700 flex items-center gap-2"
              aria-label="Back to experience"
            >
              <ChevronLeft size={18} />
              <span>Back to experience</span>
            </button>
            
            <div className="card">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-shrink-0 w-14 h-14 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                  <Code className="text-primary-600 dark:text-primary-300" size={24} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{currentProject.name}</h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Description</h3>
                  <p className="text-gray-700 dark:text-gray-300">{currentProject.description}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Technologies</h3>
                  <div className="flex flex-wrap gap-2">
                    {currentProject.technologies.map((tech, idx) => (
                      <span key={idx} className="badge bg-secondary-100 text-secondary-700 dark:bg-secondary-900 dark:text-secondary-300">{tech}</span>
                    ))}
                  </div>
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Project Showcase</h3>
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 text-center">
                    <div className="mb-4">
                      <Code size={48} className="mx-auto text-gray-400" />
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">This is a demonstration of the project. In a real app, there would be a preview or interactive demo here.</p>
                    {currentProject.link && (
                      <a 
                        href={currentProject.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn btn-primary inline-flex items-center gap-2"
                      >
                        <ExternalLink size={18} />
                        <span>View Project</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-4 text-center">
            <p className="text-gray-600 dark:text-gray-300">Project not found. Please go back and select a project.</p>
            <button 
              onClick={() => navigateTo(Section.Experience)}
              className="mt-4 btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700"
            >
              Go to Experiences
            </button>
          </div>
        );

      case Section.Projects:
        return <ExperienceCarousel />;
        
      case Section.Skills:
        return <SkillsSection />;
        
      case Section.Education:
        return <EducationSection />;
        
      case Section.Contact:
        return (
          <div className="py-4 space-y-6">
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                    <Mail className="text-primary-600 dark:text-primary-300" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                    <a href={`mailto:${resumeData.contact.email}`} className="text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400">
                      {resumeData.contact.email}
                    </a>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                    <Phone className="text-primary-600 dark:text-primary-300" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                    <p className="text-gray-900 dark:text-white">{resumeData.contact.phone}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                    <MapPin className="text-primary-600 dark:text-primary-300" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                    <p className="text-gray-900 dark:text-white">{resumeData.contact.location}</p>
                  </div>
                </div>
                
                {resumeData.contact.website && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                      <Globe className="text-primary-600 dark:text-primary-300" size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Website</p>
                      <a 
                        href={`https://${resumeData.contact.website}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400"
                      >
                        {resumeData.contact.website}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Social Profiles</h2>
              <div className="space-y-4">
                {resumeData.contact.linkedin && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <Linkedin className="text-blue-600 dark:text-blue-400" size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">LinkedIn</p>
                      <a 
                        href={`https://${resumeData.contact.linkedin}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        {resumeData.contact.linkedin}
                      </a>
                    </div>
                  </div>
                )}
                
                {resumeData.contact.github && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <Github className="text-gray-700 dark:text-gray-400" size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">GitHub</p>
                      <a 
                        href={`https://${resumeData.contact.github}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-200"
                      >
                        {resumeData.contact.github}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Send a Message</h2>
              <form className="space-y-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="name">Your Name</label>
                  <input id="name" type="text" className="input" placeholder="John Doe" />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="email">Your Email</label>
                  <input id="email" type="email" className="input" placeholder="john@example.com" />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="subject">Subject</label>
                  <input id="subject" type="text" className="input" placeholder="Job Opportunity" />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="message">Message</label>
                  <textarea 
                    id="message" 
                    className="input min-h-[120px]" 
                    placeholder="I'd like to discuss a potential opportunity..."
                  ></textarea>
                </div>
                
                <button 
                  type="button" 
                  className="btn btn-primary w-full sm:w-auto"
                  onClick={() => alert('In a real app, this would send a message!')}
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        );
        
      case Section.UploadResume:
        return (
          <div className="py-4 space-y-6">
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Upload Your Resume</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Upload your resume in PDF or DOC format to view it directly in the app.
              </p>
              
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center">
                <div className="mb-4">
                  <Upload size={48} className="mx-auto text-gray-400" />
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4">Drag and drop your file here, or click to browse</p>
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept=".pdf,.doc,.docx" 
                  className="hidden" 
                  onChange={handleFileUpload}
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="btn btn-primary"
                >
                  Choose File
                </button>
              </div>
              
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Uploading... {uploadProgress}%</p>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-primary-600 h-2 rounded-full" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Download Template</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  You can download a template resume to see the expected format.
                </p>
                <button 
                  onClick={() => {
                    // In a real app, this would download a template file
                    alert('In a real app, this would download a template resume file');
                  }}
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <Download size={18} />
                  <span>Download Template</span>
                </button>
              </div>
            </div>
          </div>
        );
        
      case Section.ViewResume:
        return (
          <div className="py-4 space-y-6">
            {resumeData.resumeFile ? (
              <div className="card">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Resume Preview</h2>
                  <a 
                    href={resumeData.resumeFile} 
                    download="resume.pdf"
                    className="btn-sm bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 flex items-center gap-1"
                  >
                    <Download size={16} />
                    <span>Download</span>
                  </a>
                </div>
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <iframe 
                    src={resumeData.resumeFile} 
                    className="w-full h-[600px]"
                    title="Resume Preview"
                  ></iframe>
                </div>
              </div>
            ) : (
              <div className="py-4 text-center">
                <p className="text-gray-600 dark:text-gray-300 mb-4">No resume has been uploaded yet.</p>
                <button 
                  onClick={() => navigateTo(Section.UploadResume)}
                  className="btn btn-primary"
                >
                  Upload Resume
                </button>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="py-4 text-center">
            <p className="text-gray-600 dark:text-gray-300">Section not found</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 theme-transition-all">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 shadow-sm theme-transition">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                <span className="text-primary-600 dark:text-primary-400">CV</span> App
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-4">
              <button 
                onClick={() => navigateTo(Section.Home)}
                className={`px-3 py-2 rounded-md text-sm font-medium ${activeSection === Section.Home ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}
              >
                Home
              </button>
              <button 
                onClick={() => navigateTo(Section.About)}
                className={`px-3 py-2 rounded-md text-sm font-medium ${activeSection === Section.About ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}
              >
                About
              </button>
              <button 
                onClick={() => navigateTo(Section.Experience)}
                className={`px-3 py-2 rounded-md text-sm font-medium ${activeSection === Section.Experience || activeSection === Section.ExperienceDetail ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}
              >
                Experience
              </button>
              <button 
                onClick={() => navigateTo(Section.Projects)}
                className={`px-3 py-2 rounded-md text-sm font-medium ${activeSection === Section.Projects || activeSection === Section.ProjectDetail ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}
              >
                Projects
              </button>
              <button 
                onClick={() => navigateTo(Section.Skills)}
                className={`px-3 py-2 rounded-md text-sm font-medium ${activeSection === Section.Skills ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}
              >
                Skills
              </button>
              <button 
                onClick={() => navigateTo(Section.Education)}
                className={`px-3 py-2 rounded-md text-sm font-medium ${activeSection === Section.Education ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}
              >
                Education
              </button>
              <button 
                onClick={() => navigateTo(Section.Contact)}
                className={`px-3 py-2 rounded-md text-sm font-medium ${activeSection === Section.Contact ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}
              >
                Contact
              </button>
            </div>
            
            <div className="flex items-center">
              <button 
                onClick={toggleTheme}
                className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              </button>
              
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="ml-2 md:hidden p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none"
                aria-label="Open menu"
              >
                <Menu size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-gray-600 bg-opacity-75 flex md:hidden">
          <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-white dark:bg-gray-800 shadow-xl flex flex-col theme-transition">
            <div className="flex items-center justify-between px-4 pt-5 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                <span className="text-primary-600 dark:text-primary-400">CV</span> App
              </div>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-grow overflow-y-auto py-4 px-4">
              <nav className="space-y-2">
                <button 
                  onClick={() => navigateTo(Section.Home)}
                  className={`w-full px-3 py-2 rounded-md text-sm font-medium text-left ${activeSection === Section.Home ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                  Home
                </button>
                <button 
                  onClick={() => navigateTo(Section.About)}
                  className={`w-full px-3 py-2 rounded-md text-sm font-medium text-left ${activeSection === Section.About ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                  About
                </button>
                <button 
                  onClick={() => navigateTo(Section.Experience)}
                  className={`w-full px-3 py-2 rounded-md text-sm font-medium text-left ${activeSection === Section.Experience || activeSection === Section.ExperienceDetail ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                  Experience
                </button>
                <button 
                  onClick={() => navigateTo(Section.Projects)}
                  className={`w-full px-3 py-2 rounded-md text-sm font-medium text-left ${activeSection === Section.Projects || activeSection === Section.ProjectDetail ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                  Projects
                </button>
                <button 
                  onClick={() => navigateTo(Section.Skills)}
                  className={`w-full px-3 py-2 rounded-md text-sm font-medium text-left ${activeSection === Section.Skills ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                  Skills
                </button>
                <button 
                  onClick={() => navigateTo(Section.Education)}
                  className={`w-full px-3 py-2 rounded-md text-sm font-medium text-left ${activeSection === Section.Education ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                  Education
                </button>
                <button 
                  onClick={() => navigateTo(Section.Contact)}
                  className={`w-full px-3 py-2 rounded-md text-sm font-medium text-left ${activeSection === Section.Contact ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                  Contact
                </button>
              </nav>
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between px-3">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme</span>
                  <button 
                    onClick={toggleTheme}
                    className="theme-toggle"
                    aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
                  >
                    <span className={`theme-toggle-thumb ${theme === 'dark' ? 'translate-x-5' : 'translate-x-0'}`}></span>
                    <span className="sr-only">{theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderContent()}
      </main>
      
      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-6 theme-transition">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            Copyright © 2025 of Datavtar Private Limited. All rights reserved.
          </div>
        </div>
      </footer>
      
      {/* Camera Modal */}
      {isCameraOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center"
          onClick={() => setIsCameraOpen(false)}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg p-4 max-w-lg w-full mx-4 theme-transition"
            onClick={(e) => e.stopPropagation()}
            ref={modalRef}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Take a Profile Photo</h3>
              <button 
                onClick={() => setIsCameraOpen(false)}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                aria-label="Close camera"
              >
                <X size={20} />
              </button>
            </div>
            <div className="relative">
              <div className="aspect-w-1 aspect-h-1 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                <Camera ref={(ref) => setCamera(ref)} />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-3">
              <button 
                onClick={() => setIsCameraOpen(false)}
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button 
                onClick={capturePhoto}
                className="btn btn-primary"
              >
                Take Photo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;