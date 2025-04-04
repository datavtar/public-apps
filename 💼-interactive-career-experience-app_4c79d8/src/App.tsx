import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { User, Briefcase, Settings, Code, Target, CheckCircle, Zap, Sun, Moon, X, ChevronLeft, ChevronRight, Download, Upload, Eye, Pencil, Trash2, Plus, XCircle, Mail, Linkedin, Github } from 'lucide-react';
import styles from './styles/styles.module.css';

// Define types within App.tsx
interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  imageUrl?: string; // Optional image for slideshow
  impactData?: { name: string; value: number }[]; // Optional data for charts
}

interface Experience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string; // 'Present' or a date
  description: string;
  achievements: string[];
  projects: Project[];
  interactiveType: 'slideshow' | 'chart' | 'demo' | 'none';
}

interface Profile {
  name: string;
  title: string;
  summary: string;
  email: string;
  linkedin: string; // URL
  github: string; // URL
  skills: string[];
}

interface CvData {
  profile: Profile;
  experiences: Experience[];
}

// Default Data (if localStorage is empty)
const defaultCvData: CvData = {
  profile: {
    name: "Alex Chen (Demo)",
    title: "Senior Product Manager",
    summary: "Innovative Product Manager with 8+ years of experience leading cross-functional teams to design, build, and launch successful B2B and B2C products. Proven ability to translate complex user needs into actionable product roadmaps and drive significant user growth and revenue.",
    email: "alex.chen.demo@example.com",
    linkedin: "https://linkedin.com/in/alexchendemo",
    github: "https://github.com/alexchendemo",
    skills: ["Product Strategy", "Roadmap Planning", "Agile Methodologies", "User Research", "Data Analysis", "A/B Testing", "Stakeholder Management", "UI/UX Design Principles"]
  },
  experiences: [
    {
      id: "exp1",
      company: "Innovate Solutions Inc.",
      role: "Senior Product Manager",
      startDate: "2020-01",
      endDate: "Present",
      description: "Led product strategy and execution for the company's flagship SaaS platform, focusing on AI-driven analytics.",
      achievements: [
        "Increased user engagement by 30% through redesigned dashboard.",
        "Launched 3 major features ahead of schedule.",
        "Grew subscription revenue by 25% YoY."
      ],
      projects: [
        { id: "p1a", name: "AI Analytics Dashboard", description: "A complete overhaul of the user dashboard using React and Recharts.", technologies: ["React", "TypeScript", "Recharts", "Node.js"], impactData: [{ name: 'Q1', value: 15 }, { name: 'Q2', value: 25 }, { name: 'Q3', value: 20 }, { name: 'Q4', value: 30 }] },
        { id: "p1b", name: "Feature Prioritization Tool", description: "Internal tool for roadmap planning.", technologies: ["Python", "Flask", "PostgreSQL"] }
      ],
      interactiveType: 'chart'
    },
    {
      id: "exp2",
      company: "Tech Forward LLC",
      role: "Product Manager",
      startDate: "2017-06",
      endDate: "2019-12",
      description: "Managed the product lifecycle for a suite of mobile productivity apps.",
      achievements: [
        "Successfully launched iOS and Android apps, reaching 1M+ downloads.",
        "Improved app store ratings from 3.5 to 4.5 stars.",
        "Implemented key features based on user feedback, reducing churn by 15%."
      ],
      projects: [
        { id: "p2a", name: "Productivity App Suite", description: "Cross-platform mobile applications.", technologies: ["React Native", "Firebase"], imageUrl: 'https://via.placeholder.com/600x400/cccccc/888888?text=App+Screenshot+1' },
        { id: "p2b", name: "User Feedback Portal", description: "Web portal for collecting user suggestions.", technologies: ["Vue.js", "Node.js"], imageUrl: 'https://via.placeholder.com/600x400/eeeeee/777777?text=Mockup+2' }
      ],
      interactiveType: 'slideshow'
    },
     {
      id: "exp3",
      company: "Startup Creative Co.",
      role: "Associate Product Manager",
      startDate: "2015-08",
      endDate: "2017-05",
      description: "Supported product development for a new e-commerce platform.",
      achievements: [
        "Contributed to the MVP launch of the platform.",
        "Conducted user testing sessions and gathered feedback.",
        "Assisted in defining product requirements and user stories."
      ],
      projects: [
        { id: "p3a", name: "E-commerce Platform MVP", description: "Initial version of the online store.", technologies: ["Ruby on Rails", "JavaScript", "Heroku"] },
      ],
      interactiveType: 'demo'
    }
  ]
};

// Helper function to generate unique IDs
const generateId = () => `_${Math.random().toString(36).substr(2, 9)}`;

// Theme Toggle Component Logic (integrated into App)
const ThemeToggle: React.FC<{ isDarkMode: boolean; toggleDarkMode: () => void }> = ({ isDarkMode, toggleDarkMode }) => {
  return (
    <button
      onClick={toggleDarkMode}
      className="theme-toggle relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800 bg-gray-200 dark:bg-gray-700"
      role="switch"
      aria-checked={isDarkMode}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className="sr-only">Use setting</span>
      <span
        className={`${isDarkMode ? 'translate-x-6' : 'translate-x-1'
          } inline-block w-4 h-4 transform bg-white dark:bg-gray-900 rounded-full transition-transform duration-200 ease-in-out flex items-center justify-center`}
      >
        {isDarkMode ? (
          <Moon size={12} className="text-yellow-400" />
        ) : (
          <Sun size={12} className="text-orange-500" />
        )}
      </span>
    </button>
  );
};

// Slideshow Component
const Slideshow: React.FC<{ projects: Project[] }> = ({ projects }) => {
  const images = projects.filter(p => p.imageUrl).map(p => ({ url: p.imageUrl!, caption: p.name }));
  const [currentIndex, setCurrentIndex] = useState(0);

  if (images.length === 0) {
    return <p className="text-center text-gray-500 dark:text-gray-400 italic">No images available for this experience.</p>;
  }

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto" role="region" aria-label="Project Slideshow">
      <div className="aspect-w-16 aspect-h-9 overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-700">
        <img src={images[currentIndex].url} alt={images[currentIndex].caption} className="object-contain w-full h-full" />
      </div>
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-md text-sm">
        {images[currentIndex].caption} ({currentIndex + 1} / {images.length})
      </div>
      {images.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-black bg-opacity-30 text-white p-2 rounded-full hover:bg-opacity-50 transition-opacity"
              aria-label="Previous slide"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={nextSlide}
              className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-black bg-opacity-30 text-white p-2 rounded-full hover:bg-opacity-50 transition-opacity"
              aria-label="Next slide"
            >
              <ChevronRight size={24} />
            </button>
          </>
      )}
    </div>
  );
};

// Chart Component
const ImpactChart: React.FC<{ projects: Project[] }> = ({ projects }) => {
  const chartData = projects.find(p => p.impactData)?.impactData;

  if (!chartData || chartData.length === 0) {
    return <p className="text-center text-gray-500 dark:text-gray-400 italic">No impact data available for this experience.</p>;
  }

  return (
    <div className={`${styles.rechartsContainer} w-full h-64 md:h-80`} role="img" aria-label="Impact Data Chart">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
          <XAxis dataKey="name" className="text-xs fill-gray-600 dark:fill-gray-400" />
          <YAxis className="text-xs fill-gray-600 dark:fill-gray-400" />
          <Tooltip
             contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', color: '#333', borderRadius: '4px', border: '1px solid #ccc' }}
             itemStyle={{ color: '#333' }}
             cursor={{ fill: 'rgba(200, 200, 200, 0.3)' }}
           />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Bar dataKey="value" fill="var(--color-primary-500)" name="Engagement/Growth Metric" barSize={30} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Demo Component (Simple Form Example)
const InteractiveDemo: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [submittedValue, setSubmittedValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedValue(inputValue);
  };

  return (
    <div className="p-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800">
      <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-3">Simple Feature Demo</h4>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">This is a mock interactive element. Try submitting the form.</p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="form-group">
          <label htmlFor="demoInput" className="form-label text-sm">Sample Input:</label>
          <input
            id="demoInput"
            type="text"
            className="input input-responsive text-sm"
            value={inputValue}
            onChange={(e) => setInputValue((e.target as HTMLInputElement).value)}
            placeholder="Enter some text"
          />
        </div>
        <button type="submit" className="btn btn-sm btn-secondary">Simulate Action</button>
      </form>
      {submittedValue && (
        <p className="mt-4 text-sm text-green-600 dark:text-green-400 fade-in">
          <CheckCircle size={16} className="inline mr-1"/> Submitted: {submittedValue}
        </p>
      )}
    </div>
  );
};

// Main App Component
const App: React.FC = () => {
  const [cvData, setCvData] = useState<CvData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      return savedMode === 'true' || (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('pmCvData');
      if (savedData) {
        setCvData(JSON.parse(savedData));
      } else {
        // Initialize with default data if nothing is saved
        setCvData(defaultCvData);
        localStorage.setItem('pmCvData', JSON.stringify(defaultCvData));
      }
    } catch (err) {
      console.error("Failed to load or parse CV data:", err);
      setError("Failed to load CV data. Please clear local storage or contact support.");
      setCvData(defaultCvData); // Fallback to default data on error
    } finally {
      setLoading(false);
    }
  }, []);

  // Update localStorage when cvData changes (excluding initial load)
  useEffect(() => {
    if (!loading && cvData) {
      try {
        localStorage.setItem('pmCvData', JSON.stringify(cvData));
      } catch (err) {
         console.error("Failed to save CV data:", err);
         setError("Failed to save CV data. Changes might not persist.");
      }
    }
  }, [cvData, loading]);

  // Handle Dark Mode
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  // Handle modal closing with Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && selectedExperience) {
        closeModal();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedExperience]); // Re-bind if selectedExperience changes

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const openModal = (experience: Experience) => {
    setSelectedExperience(experience);
    document.body.classList.add(styles.modalOpen); // Prevent background scroll
  };

  const closeModal = useCallback(() => {
    setSelectedExperience(null);
    document.body.classList.remove(styles.modalOpen); // Re-enable background scroll
  }, []);

  // Handle clicks outside the modal content to close it
  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && event.target === modalRef.current) {
      closeModal();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="space-y-3">
          <div className="skeleton-text w-1/2 mx-auto"></div>
          <div className="skeleton-text w-full"></div>
          <div className="skeleton-text w-2/3"></div>
          <div className="flex items-center mt-4 gap-2 justify-center">
            <div className="skeleton-circle w-10 h-10"></div>
            <div className="space-y-2">
              <div className="skeleton-text w-24 h-3"></div>
              <div className="skeleton-text w-32 h-3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !cvData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 dark:bg-gray-900 p-4">
        <div className="alert alert-error max-w-md mx-auto">
           <XCircle size={20} />
          <p>{error || "An unexpected error occurred."}</p>
        </div>
      </div>
    );
  }

  const { profile, experiences } = cvData;

  // Function to render the interactive component based on type
  const renderInteractiveComponent = (experience: Experience) => {
    switch (experience.interactiveType) {
      case 'slideshow':
        return <Slideshow projects={experience.projects} />;
      case 'chart':
        return <ImpactChart projects={experience.projects} />;
      case 'demo':
        return <InteractiveDemo />;
      case 'none':
      default:
        return <p className="text-center text-gray-500 dark:text-gray-400 italic">No interactive element for this experience.</p>;
    }
  };


  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 theme-transition-all font-sans ${selectedExperience ? styles.modalOpen : ''}`}>
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-40 theme-transition">
        <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-bold text-primary-600 dark:text-primary-400"> {profile.name}'s Interactive CV</h1>
          <div className="flex items-center space-x-3">
             <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hidden sm:inline">Theme</span>
            <ThemeToggle isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-wide mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Section */}
        <section id="profile" aria-labelledby="profile-heading" className="mb-12">
          <div className="card-responsive bg-white dark:bg-gray-800 theme-transition shadow-lg">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
                <User size={60} className="text-primary-500 dark:text-primary-400 flex-shrink-0" />
                <div className="text-center sm:text-left">
                  <h2 id="profile-heading" className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{profile.name}</h2>
                  <p className="text-lg md:text-xl text-primary-600 dark:text-primary-400 font-medium mt-1">{profile.title}</p>
                  <p className="mt-3 text-sm md:text-base text-gray-600 dark:text-gray-300 prose prose-sm dark:prose-invert max-w-none">
                    {profile.summary}
                  </p>
                  <div className="mt-4 flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-2 text-sm">
                     <a href={`mailto:${profile.email}`} className="flex items-center gap-1 text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors">
                       <Mail size={16} /> {profile.email}
                     </a>
                     <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors">
                       <Linkedin size={16} /> LinkedIn
                     </a>
                     <a href={profile.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors">
                       <Github size={16} /> GitHub
                     </a>
                  </div>
                </div>
             </div>
             {profile.skills.length > 0 && (
               <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                 <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Key Skills:</h3>
                 <div className="flex flex-wrap gap-2">
                   {profile.skills.map(skill => (
                     <span key={skill} className="badge badge-info text-xs">{skill}</span>
                   ))}
                 </div>
               </div>
             )}
          </div>
        </section>

        {/* Experience Section */}
        <section id="experience" aria-labelledby="experience-heading">
          <h2 id="experience-heading" className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-2">
            <Briefcase size={28} /> Career Experience
          </h2>
          <div className="space-y-6">
            {experiences.map((exp) => (
              <div key={exp.id} className="card bg-white dark:bg-gray-800 theme-transition shadow-md hover:shadow-lg transition-shadow duration-300">
                 <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2">
                   <div>
                     <h3 className="text-lg md:text-xl font-semibold text-primary-700 dark:text-primary-300">{exp.role}</h3>
                     <p className="text-md md:text-lg font-medium text-gray-800 dark:text-gray-200">{exp.company}</p>
                     <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
                       {exp.startDate} - {exp.endDate}
                     </p>
                   </div>
                   <button
                      onClick={() => openModal(exp)}
                      className="btn btn-sm btn-primary mt-3 sm:mt-0 self-start sm:self-center flex items-center gap-1"
                      aria-label={`Explore experience at ${exp.company}`}
                    >
                     <Eye size={16} /> Explore
                   </button>
                 </div>
                 <p className="mt-3 text-sm md:text-base text-gray-600 dark:text-gray-400 prose prose-sm dark:prose-invert max-w-none">{exp.description}</p>
                 {exp.achievements.length > 0 && (
                   <div className="mt-4">
                     <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Key Achievements:</h4>
                     <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                       {exp.achievements.map((ach, index) => (
                         <li key={index}>{ach}</li>
                       ))}
                     </ul>
                   </div>
                 )}
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-16 py-6 border-t border-gray-200 dark:border-gray-700 theme-transition">
        <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-gray-500 dark:text-gray-400">
          Copyright © {new Date().getFullYear()} Datavtar Private Limited. All rights reserved.
        </div>
      </footer>

       {/* Modal for Detailed Experience */}
      {selectedExperience && (
        <div
          ref={modalRef}
          className="modal-backdrop fade-in flex items-center justify-center p-4"
          onClick={handleBackdropClick}
          role="dialog"
          aria-modal="true"
          aria-labelledby={`modal-title-${selectedExperience.id}`}
        >
          <div className="modal-content max-w-3xl w-full slide-in bg-white dark:bg-gray-800 theme-transition-all" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
              <h3 id={`modal-title-${selectedExperience.id}`} className="text-xl font-semibold text-primary-700 dark:text-primary-300">{selectedExperience.role} at {selectedExperience.company}</h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                aria-label="Close modal"
              >
                <X size={24} />
              </button>
            </div>
            <div className="modal-body mt-4 max-h-[70vh] overflow-y-auto pr-2 text-sm md:text-base">
               <p className="text-gray-600 dark:text-gray-400 mb-4 prose prose-sm dark:prose-invert max-w-none">{selectedExperience.description}</p>

               {selectedExperience.achievements.length > 0 && (
                 <div className="mb-6">
                   <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-2">Achievements</h4>
                   <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                       {selectedExperience.achievements.map((ach, index) => (
                         <li key={index}>{ach}</li>
                       ))}
                   </ul>
                 </div>
               )}

               {selectedExperience.projects.length > 0 && (
                  <div className="mb-6">
                     <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-3">Key Projects</h4>
                     <div className="space-y-4">
                       {selectedExperience.projects.map(proj => (
                         <div key={proj.id} className="p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-700/50">
                           <h5 className="font-medium text-gray-900 dark:text-gray-100">{proj.name}</h5>
                           <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{proj.description}</p>
                           {proj.technologies.length > 0 && (
                             <div className="mt-2 flex flex-wrap gap-1">
                               {proj.technologies.map(tech => (
                                 <span key={tech} className="badge badge-secondary text-xs">{tech}</span>
                               ))}
                             </div>
                           )}
                         </div>
                       ))}
                     </div>
                  </div>
               )}

               {/* Interactive Element */}
               <div className={`mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 ${styles.interactiveElementFadeIn}`}>
                  <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                    <Zap size={18} className="text-yellow-500"/> Interactive Element
                  </h4>
                  {renderInteractiveComponent(selectedExperience)}
               </div>

            </div>
            <div className="modal-footer mt-5 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <button
                onClick={closeModal}
                className="btn bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
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