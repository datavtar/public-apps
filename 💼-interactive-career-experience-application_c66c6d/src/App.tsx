import React, { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { User, Mail, Linkedin, Github, MapPin, Briefcase, Calendar, Target, GraduationCap, Code, Lightbulb, BarChart as BarChartIcon, Clock, Sun, Moon, ChevronDown, ChevronUp, Settings, Zap } from 'lucide-react';
import styles from './styles/styles.module.css';

// -----------------
// Types and Interfaces
// -----------------
interface ProfileData {
  name: string;
  title: string;
  summary: string;
  location: string;
  contact: {
    email: string;
    linkedin: string;
    github: string;
  };
}

enum ShowcaseType {
  Description = 'description',
  Chart = 'chart',
  Timeline = 'timeline',
  MiniApp = 'mini-app',
}

interface ChartDataPoint {
  name: string;
  value: number;
}

interface ChartShowcaseData {
  type: 'line' | 'bar' | 'pie';
  data: ChartDataPoint[];
  title: string;
  colors?: string[];
}

interface TimelineEvent {
  date: string;
  description: string;
}

interface TimelineShowcaseData {
  events: TimelineEvent[];
  title: string;
}

interface MiniAppShowcaseData {
  appName: string;
  appType: 'toggles' | 'simple-list';
  title: string;
}

interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  duration: string;
  description: string;
  keyAchievements: string[];
  showcaseType: ShowcaseType;
  showcaseData?: ChartShowcaseData | TimelineShowcaseData | MiniAppShowcaseData;
}

interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  duration: string;
  description?: string;
}

interface Skill {
  id: string;
  name: string;
  level: number; // 1-5 for potential visualization
}

interface SkillCategory {
  id: string;
  category: string;
  skills: Skill[];
}

interface CVData {
  profile: ProfileData;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: SkillCategory[];
}

// -----------------
// Initial CV Data (Hardcoded for this example)
// -----------------
const initialCvData: CVData = {
  profile: {
    name: 'Alex Chen', // Placeholder Name
    title: 'Senior Product Manager', // Placeholder Title
    summary:
      'Innovative Product Manager with 8+ years of experience leading cross-functional teams to design, build, and launch successful B2B SaaS products. Proven ability to translate complex user needs into actionable product roadmaps and drive significant revenue growth. Passionate about user-centric design and data-driven decision making.',
    location: 'San Francisco, CA',
    contact: {
      email: 'alex.chen.pm@email.com',
      linkedin: 'linkedin.com/in/alexchenpm',
      github: 'github.com/alexchenpm',
    },
  },
  experience: [
    {
      id: 'exp1',
      company: 'Tech Innovations Inc.',
      role: 'Senior Product Manager',
      duration: 'Jan 2020 - Present',
      description:
        'Lead product strategy and execution for the core SaaS platform, focusing on enhancing user engagement and introducing AI-powered features.',
      keyAchievements: [
        'Launched AI Assistant feature, resulting in a 25% increase in user task completion rates.',
        'Redefined the user onboarding flow, improving conversion by 15%.',
        'Grew platform revenue by 40% over two years.',
      ],
      showcaseType: ShowcaseType.Chart,
      showcaseData: {
        type: 'line',
        title: 'Simulated User Engagement Growth',
        data: [
          { name: 'Q1 20', value: 1200 }, { name: 'Q2 20', value: 1500 }, { name: 'Q3 20', value: 1400 },
          { name: 'Q4 20', value: 1800 }, { name: 'Q1 21', value: 2200 }, { name: 'Q2 21', value: 2500 },
          { name: 'Q3 21', value: 2800 }, { name: 'Q4 21', value: 3100 }, { name: 'Q1 22', value: 3500 },
        ],
      } as ChartShowcaseData,
    },
    {
      id: 'exp2',
      company: 'Startup Solutions Co.',
      role: 'Product Manager',
      duration: 'Jun 2017 - Dec 2019',
      description:
        'Managed the development lifecycle for a new mobile-first analytics tool targeted at small businesses. Conducted user research, defined requirements, and worked closely with engineering.',
      keyAchievements: [
        'Successfully launched MVP within 9 months.',
        'Acquired first 1,000 paying customers within 6 months post-launch.',
        'Implemented key user feedback leading to a 4.5-star app store rating.',
      ],
      showcaseType: ShowcaseType.Timeline,
      showcaseData: {
        title: 'Mobile App Launch Timeline',
        events: [
          { date: 'Jun 2017', description: 'Joined Startup Solutions Co.' },
          { date: 'Aug 2017', description: 'Initial User Research Completed' },
          { date: 'Dec 2017', description: 'MVP Feature Set Defined' },
          { date: 'Mar 2018', description: 'MVP Launch' },
          { date: 'Sep 2018', description: 'Reached 1,000 Customers' },
          { date: 'Dec 2019', description: 'Transitioned to Tech Innovations' },
        ],
      } as TimelineShowcaseData,
    },
     {
      id: 'exp3',
      company: 'Digital Creators Hub',
      role: 'Associate Product Manager',
      duration: 'Jul 2015 - May 2017',
      description:
        'Supported product development for a web platform connecting digital artists with clients. Focused on improving the project bidding and collaboration tools.',
      keyAchievements: [
        'Assisted in redesigning the project bidding interface.',
        'Contributed to a 10% increase in successful project matches.',
        'Managed user feedback collection and prioritization.',
      ],
      showcaseType: ShowcaseType.MiniApp,
      showcaseData: {
        title: 'Feature Demo: Settings Panel',
        appName: 'Settings Simulation',
        appType: 'toggles',
      } as MiniAppShowcaseData,
    },
  ],
  education: [
    {
      id: 'edu1',
      institution: 'Stanford University',
      degree: 'M.S. Management Science & Engineering',
      duration: '2013 - 2015',
    },
    {
      id: 'edu2',
      institution: 'UC Berkeley',
      degree: 'B.S. Computer Science',
      duration: '2009 - 2013',
      description: 'Minor in Economics',
    },
  ],
  skills: [
    {
      id: 'sk1',
      category: 'Product Management',
      skills: [
        { id: 's1', name: 'Roadmapping', level: 5 }, { id: 's2', name: 'User Research', level: 5 },
        { id: 's3', name: 'Agile Methodologies', level: 4 }, { id: 's4', name: 'Data Analysis', level: 4 },
        { id: 's5', name: 'A/B Testing', level: 4 }, { id: 's6', name: 'Market Analysis', level: 4 },
      ],
    },
    {
      id: 'sk2',
      category: 'Technical Skills',
      skills: [
        { id: 's7', name: 'SQL', level: 3 }, { id: 's8', name: 'JIRA/Confluence', level: 5 },
        { id: 's9', name: 'Figma', level: 4 }, { id: 's10', name: 'Mixpanel/Amplitude', level: 4 },
        { id: 's11', name: 'Basic HTML/CSS', level: 3 },
      ],
    },
    {
        id: 'sk3',
        category: 'Soft Skills',
        skills: [
            { id: 's12', name: 'Leadership', level: 5 }, { id: 's13', name: 'Communication', level: 5 },
            { id: 's14', name: 'Problem Solving', level: 5 }, { id: 's15', name: 'Collaboration', level: 5 },
            { id: 's16', name: 'Prioritization', level: 4 },
        ]
    }
  ],
};

// -----------------
// Theme Toggle Component (Integrated into App)
// -----------------
const ThemeToggle: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      return savedMode === 'true' || (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  return (
    <button
      className="theme-toggle p-1 rounded-full flex items-center justify-center transition-colors duration-200 ease-in-out bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-900"
      onClick={() => setIsDarkMode(!isDarkMode)}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      role="switch"
      aria-checked={isDarkMode}
    >
      {isDarkMode ? (
        <Sun className="w-5 h-5 text-yellow-400" />
      ) : (
        <Moon className="w-5 h-5 text-primary-600" />
      )}
      <span className="sr-only">
        {isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      </span>
    </button>
  );
};

// -----------------
// Showcase Render Function
// -----------------
const renderShowcase = (type: ShowcaseType, data?: any, isDarkMode?: boolean) => {
  const chartColorsLight = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F'];
  const chartColorsDark = ['#A0AEC0', '#F6AD55', '#F56565', '#4FD1C5', '#63B3ED', '#B794F4'];
  const colors = isDarkMode ? chartColorsDark : chartColorsLight;
  const gridColor = isDarkMode ? '#4A5568' : '#E2E8F0'; // gray-700 dark, gray-300 light
  const textColor = isDarkMode ? '#E2E8F0' : '#4A5568'; // gray-300 dark, gray-700 light

  switch (type) {
    case ShowcaseType.Chart:
      const chartData = data as ChartShowcaseData;
      if (!chartData || !chartData.data) return <p className="text-sm text-gray-500 dark:text-slate-400">No chart data available.</p>;
      
      return (
        <div className="mt-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
          <h4 className="text-base font-semibold mb-3 text-gray-800 dark:text-slate-200 flex items-center gap-2"><BarChartIcon size={18} /> {chartData.title}</h4>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              {chartData.type === 'bar' && (
                <BarChart data={chartData.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="name" tick={{ fill: textColor, fontSize: 12 }} />
                  <YAxis tick={{ fill: textColor, fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: isDarkMode ? '#2D3748' : '#FFFFFF', border: `1px solid ${gridColor}`}} 
                    itemStyle={{ color: textColor }}
                    cursor={{ fill: 'rgba(100, 116, 139, 0.1)'}}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', color: textColor }} />
                  <Bar dataKey="value" fill={colors[0] || '#8884d8'} />
                </BarChart>
              )}
              {chartData.type === 'line' && (
                <LineChart data={chartData.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="name" tick={{ fill: textColor, fontSize: 12 }} />
                  <YAxis tick={{ fill: textColor, fontSize: 12 }} />
                  <Tooltip 
                     contentStyle={{ backgroundColor: isDarkMode ? '#2D3748' : '#FFFFFF', border: `1px solid ${gridColor}`}} 
                     itemStyle={{ color: textColor }}
                     cursor={{ stroke: colors[0], strokeWidth: 1 }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', color: textColor }} />
                  <Line type="monotone" dataKey="value" stroke={colors[0] || '#8884d8'} activeDot={{ r: 6 }} />
                </LineChart>
              )}
              {chartData.type === 'pie' && (
                <PieChart>
                  <Pie
                    data={chartData.data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    fontSize={12}
                    stroke={isDarkMode ? '#1A202C' : '#FFFFFF'}
                  >
                    {(chartData.data || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                     contentStyle={{ backgroundColor: isDarkMode ? '#2D3748' : '#FFFFFF', border: `1px solid ${gridColor}`}} 
                     itemStyle={{ color: textColor }}
                  />
                   <Legend wrapperStyle={{ fontSize: '12px', color: textColor }} />
                </PieChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      );

    case ShowcaseType.Timeline:
      const timelineData = data as TimelineShowcaseData;
      if (!timelineData || !timelineData.events || timelineData.events.length === 0) return <p className="text-sm text-gray-500 dark:text-slate-400">No timeline data available.</p>;
      return (
        <div className="mt-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
          <h4 className="text-base font-semibold mb-4 text-gray-800 dark:text-slate-200 flex items-center gap-2"><Clock size={18} /> {timelineData.title}</h4>
          <div className="relative pl-6 border-l border-gray-300 dark:border-gray-600">
            {timelineData.events.map((event, index) => (
              <div key={index} className="mb-6">
                <div className="absolute w-3 h-3 bg-primary-500 rounded-full -left-[7px] border border-white dark:border-gray-900 dark:bg-primary-400"></div>
                <time className="mb-1 text-xs font-normal leading-none text-gray-500 dark:text-gray-400">{event.date}</time>
                <p className="text-sm font-normal text-gray-700 dark:text-slate-300">{event.description}</p>
              </div>
            ))}
          </div>
        </div>
      );

    case ShowcaseType.MiniApp:
        const miniAppData = data as MiniAppShowcaseData;
        if (!miniAppData) return <p className="text-sm text-gray-500 dark:text-slate-400">No app demo available.</p>;
        return (
            <div className="mt-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
                <h4 className="text-base font-semibold mb-3 text-gray-800 dark:text-slate-200 flex items-center gap-2"><Zap size={18} /> {miniAppData.title}</h4>
                {miniAppData.appType === 'toggles' && <MiniAppSettingsDemo />}
                {/* Add other mini-app types here */} 
                 {miniAppData.appType === 'simple-list' && <MiniAppListDemo />}
            </div>
        );

    case ShowcaseType.Description:
    default:
      return null; // Description is shown by default, no extra component needed
  }
};

// Dummy Mini App Components
const MiniAppSettingsDemo: React.FC = () => {
    const [toggle1, setToggle1] = useState(false);
    const [toggle2, setToggle2] = useState(true);

    return (
        <div className="space-y-3 p-2 rounded bg-white dark:bg-gray-700 shadow-sm">
            <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-slate-300">Enable Notifications</span>
                <button 
                  role="switch"
                  aria-checked={toggle1}
                  onClick={() => setToggle1(!toggle1)} 
                  className={`${toggle1 ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'} relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800`}
                 >
                  <span className={`${toggle1 ? 'translate-x-6' : 'translate-x-1'} inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out`}/>
                </button>
            </div>
             <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-slate-300">Dark Mode Preference</span>
                 <button 
                  role="switch"
                  aria-checked={toggle2}
                  onClick={() => setToggle2(!toggle2)} 
                  className={`${toggle2 ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'} relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800`}
                 >
                  <span className={`${toggle2 ? 'translate-x-6' : 'translate-x-1'} inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out`}/>
                </button>
            </div>
        </div>
    );
};

const MiniAppListDemo: React.FC = () => (
    <div className="space-y-2 p-2 rounded bg-white dark:bg-gray-700 shadow-sm">
        <p className="text-sm text-gray-700 dark:text-slate-300 p-2 border-b border-gray-200 dark:border-gray-600">Feature Update 1: Launched</p>
        <p className="text-sm text-gray-700 dark:text-slate-300 p-2 border-b border-gray-200 dark:border-gray-600">User Feedback Session Scheduled</p>
        <p className="text-sm text-gray-500 dark:text-slate-400 p-2 italic">Bug Fix Deployed</p>
    </div>
);


// -----------------
// Main App Component
// -----------------
function App() {
  const cvData = initialCvData; // Using static data for this example
  const [activeExperience, setActiveExperience] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Read initial theme state from localStorage or system preference
  useEffect(() => {
      const savedMode = localStorage.getItem('darkMode');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initialMode = savedMode === 'true' || (savedMode === null && prefersDark);
      setIsDarkMode(initialMode);
      if (initialMode) {
          document.documentElement.classList.add('dark');
      } else {
          document.documentElement.classList.remove('dark');
      }
  }, []);

  const handleToggleExperience = useCallback((id: string) => {
    setActiveExperience(prevId => (prevId === id ? null : id));
  }, []);

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-slate-100 theme-transition-all font-sans ${styles.appContainer}`}> 
      {/* Header */} 
      <header className="container-fluid py-6 bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10 theme-transition">
        <div className="container-wide mx-auto flex flex-col sm:flex-row justify-between items-center">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-primary-600 dark:text-primary-400">{cvData.profile.name}</h1>
            <p className="text-base sm:text-lg text-gray-600 dark:text-slate-300">{cvData.profile.title}</p>
          </div>
          <div className="flex items-center space-x-2 mt-3 sm:mt-0">
              <span className="text-sm text-gray-600 dark:text-slate-300 hidden sm:inline">Light</span>
               <ThemeToggle />
              <span className="text-sm text-gray-600 dark:text-slate-300 hidden sm:inline">Dark</span>
          </div>
        </div>
      </header>

      {/* Main Content */} 
      <main className="container-wide mx-auto p-4 sm:p-6 md:p-8">
        {/* Profile Summary */} 
        <section id="profile" aria-labelledby="profile-heading" className="mb-8 md:mb-12">
          <div className="card-responsive bg-white dark:bg-gray-800 shadow-md theme-transition">
            <h2 id="profile-heading" className="text-xl sm:text-2xl font-semibold mb-4 flex items-center gap-2 text-gray-800 dark:text-slate-200"><User size={22} /> Profile</h2>
            <p className="text-gray-700 dark:text-slate-300 prose prose-sm sm:prose dark:prose-invert max-w-none">
              {cvData.profile.summary}
            </p>
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-2 sm:space-y-0 text-sm">
              <div className="flex items-center gap-2 text-gray-600 dark:text-slate-400">
                <MapPin size={16} /><span>{cvData.profile.location}</span>
              </div>
              <a href={`mailto:${cvData.profile.contact.email}`} className="flex items-center gap-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors">
                <Mail size={16} /><span>{cvData.profile.contact.email}</span>
              </a>
              <a href={`https://${cvData.profile.contact.linkedin}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors">
                <Linkedin size={16} /><span>LinkedIn</span>
              </a>
              <a href={`https://${cvData.profile.contact.github}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors">
                <Github size={16} /><span>GitHub</span>
              </a>
            </div>
          </div>
        </section>

        {/* Experience Section */} 
        <section id="experience" aria-labelledby="experience-heading" className="mb-8 md:mb-12">
          <h2 id="experience-heading" className="text-xl sm:text-2xl font-semibold mb-4 flex items-center gap-2 text-gray-800 dark:text-slate-200"><Briefcase size={22} /> Experience</h2>
          <div className="space-y-6">
            {cvData.experience.map((exp) => (
              <div key={exp.id} className="card bg-white dark:bg-gray-800 shadow-md theme-transition overflow-hidden">
                 <button 
                    className="w-full p-4 text-left focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500" 
                    onClick={() => handleToggleExperience(exp.id)}
                    aria-expanded={activeExperience === exp.id}
                    aria-controls={`experience-details-${exp.id}`}
                  >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">{exp.role}</h3>
                      <p className="text-sm font-medium text-primary-600 dark:text-primary-400">{exp.company}</p>
                      <p className="mt-1 text-xs text-gray-500 dark:text-slate-400 flex items-center gap-1">
                          <Calendar size={14} /> {exp.duration}
                      </p>
                    </div>
                    <div>
                        {activeExperience === exp.id ? <ChevronUp size={20} className="text-gray-500 dark:text-slate-400" /> : <ChevronDown size={20} className="text-gray-500 dark:text-slate-400" />}
                    </div>
                  </div>
                 </button>
                
                {/* Collapsible Content */} 
                 <div 
                    id={`experience-details-${exp.id}`}
                    className={`transition-all duration-300 ease-in-out ${activeExperience === exp.id ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}
                    style={{ transitionProperty: 'max-height, opacity' }}
                    > 
                    <div className="px-4 pb-4 pt-0">
                         <p className="mt-2 text-sm text-gray-600 dark:text-slate-300 prose prose-sm dark:prose-invert max-w-none">
                             {exp.description}
                         </p>
                        <h4 className="mt-4 text-sm font-semibold text-gray-800 dark:text-slate-200 flex items-center gap-2"><Target size={16} /> Key Achievements:</h4>
                        <ul className="mt-2 list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-slate-300 prose prose-sm dark:prose-invert max-w-none">
                            {exp.keyAchievements.map((ach, index) => (
                                <li key={index}>{ach}</li>
                            ))}
                        </ul>
                        {/* Showcase Area */} 
                         {exp.showcaseType !== ShowcaseType.Description && (
                             <div className="mt-4">
                                {renderShowcase(exp.showcaseType, exp.showcaseData, isDarkMode)}
                             </div>
                        )} 
                    </div>
                  </div> 
              </div>
            ))}
          </div>
        </section>

        {/* Skills Section */} 
        <section id="skills" aria-labelledby="skills-heading" className="mb-8 md:mb-12">
          <h2 id="skills-heading" className="text-xl sm:text-2xl font-semibold mb-4 flex items-center gap-2 text-gray-800 dark:text-slate-200"><Code size={22} /> Skills</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cvData.skills.map((category) => (
              <div key={category.id} className="card bg-white dark:bg-gray-800 shadow-md theme-transition p-4">
                <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2">{category.category}</h3>
                <ul className="space-y-1">
                  {category.skills.map((skill) => (
                    <li key={skill.id} className="text-sm text-gray-600 dark:text-slate-300 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      {skill.name}
                      {/* Optional: Add skill level indicator, e.g., dots */} 
                       {/* <span className="ml-2 text-primary-500">{'●'.repeat(skill.level)}{'○'.repeat(5 - skill.level)}</span> */} 
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Education Section */} 
        <section id="education" aria-labelledby="education-heading" className="mb-8 md:mb-12">
          <h2 id="education-heading" className="text-xl sm:text-2xl font-semibold mb-4 flex items-center gap-2 text-gray-800 dark:text-slate-200"><GraduationCap size={22} /> Education</h2>
          <div className="space-y-4">
            {cvData.education.map((edu) => (
              <div key={edu.id} className="card-responsive bg-white dark:bg-gray-800 shadow-md theme-transition p-4">
                <h3 className="text-base font-medium text-gray-900 dark:text-white">{edu.degree}</h3>
                <p className="text-sm font-medium text-primary-600 dark:text-primary-400">{edu.institution}</p>
                <p className="mt-1 text-xs text-gray-500 dark:text-slate-400 flex items-center gap-1">
                    <Calendar size={14} /> {edu.duration}
                </p>
                {edu.description && (
                  <p className="mt-2 text-sm text-gray-600 dark:text-slate-300">{edu.description}</p>
                )}
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* Footer */} 
       <footer className="mt-12 py-4 bg-gray-100 dark:bg-gray-800 theme-transition">
          <div className="container-wide mx-auto text-center text-xs text-gray-500 dark:text-slate-400">
            Copyright © 2025 Datavtar Private Limited. All rights reserved.
          </div>
        </footer>
    </div>
  );
}

export default App;
