import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styles from './styles/styles.module.css';
import { Sun, Moon, User, Briefcase, BrainCircuit, Zap, Target, Lightbulb, Users, Code, BarChart, ArrowLeft, Check, X, Search } from 'lucide-react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Define Types directly in App.tsx
interface Skill {
  name: string;
  level: number; // e.g., 1-5 or 1-100
}

interface InteractiveElement {
  type: 'quiz' | 'demo' | 'timeline' | 'stats';
  data: any;
}

interface CareerEntry {
  id: string;
  role: string;
  company: string;
  duration: string;
  summary: string;
  keyAchievements: string[];
  skills: Skill[];
  interactiveElement: InteractiveElement;
}

// Sample Data (Replace with actual Product Manager CV data)
const initialCareerData: CareerEntry[] = [
  {
    id: 'pm-lead-2022',
    role: 'Lead Product Manager',
    company: 'Innovatech Solutions',
    duration: 'Jan 2022 - Present',
    summary: 'Leading product strategy and roadmap execution for AI-powered analytics platform. Managing a team of 3 PMs and collaborating cross-functionally with engineering, design, and marketing.',
    keyAchievements: [
      'Launched V2 of the platform, resulting in a 40% increase in user engagement.',
      'Defined and shipped 3 major new features based on customer feedback and market analysis.',
      'Grew the active user base by 25% through targeted product improvements.',
    ],
    skills: [
      { name: 'Roadmapping', level: 90 },
      { name: 'User Research', level: 85 },
      { name: 'Agile/Scrum', level: 95 },
      { name: 'Team Leadership', level: 80 },
      { name: 'Analytics', level: 75 },
    ],
    interactiveElement: {
      type: 'stats',
      data: {
        title: 'Product V2 Launch Impact',
        metrics: [
          { name: 'Engagement', value: 40, unit: '%' },
          { name: 'User Growth', value: 25, unit: '%' },
          { name: 'Feature Adoption', value: 60, unit: '%' },
        ],
      },
    },
  },
  {
    id: 'pm-senior-2019',
    role: 'Senior Product Manager',
    company: 'NextGen Apps',
    duration: 'Mar 2019 - Dec 2021',
    summary: 'Owned the product lifecycle for a B2B mobile application suite. Focused on user onboarding and feature adoption.',
    keyAchievements: [
      'Redesigned the onboarding flow, decreasing drop-off rate by 30%.',
      'Implemented in-app guides, boosting feature discovery by 50%.',
      'Successfully launched integrations with 2 key enterprise systems.',
    ],
    skills: [
      { name: 'Mobile PM', level: 85 },
      { name: 'Onboarding UX', level: 90 },
      { name: 'A/B Testing', level: 70 },
      { name: 'Stakeholder Mgmt', level: 80 },
      { name: 'JIRA/Confluence', level: 95 },
    ],
    interactiveElement: {
      type: 'demo',
      data: {
        title: 'Simulated Onboarding Flow',
        steps: [
          { id: 1, text: 'Welcome Screen - Click Next', next: 2 },
          { id: 2, text: 'Step 1: Enter Profile Info - Click Next', next: 3 },
          { id: 3, text: 'Step 2: Connect Account - Click Connect', next: 4 },
          { id: 4, text: 'Step 3: Quick Tutorial - Click Finish', next: 5 },
          { id: 5, text: 'Onboarding Complete!', next: null },
        ],
      },
    },
  },
  {
    id: 'pm-2017',
    role: 'Product Manager',
    company: 'Startup Hub Inc.',
    duration: 'Jun 2017 - Feb 2019',
    summary: 'Managed the development of an MVP for a SaaS collaboration tool. Conducted initial market research and user interviews.',
    keyAchievements: [
      'Shipped the MVP within 6 months, acquiring the first 100 beta users.',
      'Gathered crucial early feedback that shaped the future product direction.',
      'Contributed to securing seed funding based on MVP traction.',
    ],
    skills: [
      { name: 'MVP Dev', level: 80 },
      { name: 'User Interviews', level: 85 },
      { name: 'Market Research', level: 75 },
      { name: 'Prototyping', level: 70 },
      { name: 'Pitching', level: 65 },
    ],
    interactiveElement: {
      type: 'quiz',
      data: {
        title: 'MVP Strategy Quiz',
        questions: [
          {
            question: 'What is the primary goal of an MVP?',
            options: ['Generate revenue', 'Maximize features', 'Test core hypothesis', 'Achieve perfect design'],
            correctAnswer: 'Test core hypothesis',
          },
          {
            question: 'Which feedback is most valuable for an early MVP?',
            options: ['Feature requests from potential VCs', 'Qualitative user interviews', 'Competitor feature lists', 'Internal stakeholder opinions'],
            correctAnswer: 'Qualitative user interviews',
          },
        ],
      },
    },
  },
];

// Helper Hook for Local Storage
function useLocalStorage<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error reading localStorage key “' + key + '”:', error);
      return initialValue;
    }
  });

  const setValue: React.Dispatch<React.SetStateAction<T>> = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error('Error setting localStorage key “' + key + '”:', error);
    }
  };

  return [storedValue, setValue];
}

// --- Interactive Components (Defined within App.tsx) ---

const SkillsChart: React.FC<{ skills: Skill[] }> = ({ skills }) => {
  const chartData = skills.map(skill => ({ name: skill.name, Level: skill.level }));

  return (
    <div className="mt-6 h-64 md:h-80 w-full" role="figure" aria-label="Skills Proficiency Chart">
      <h4 className="text-md font-semibold mb-2 text-gray-700 dark:text-slate-300">Skills Proficiency</h4>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
          <XAxis type="number" domain={[0, 100]} className="text-xs text-gray-600 dark:text-slate-400" />
          <YAxis dataKey="name" type="category" width={100} className="text-xs text-gray-600 dark:text-slate-400" />
          <Tooltip
             cursor={{ fill: 'rgba(210, 210, 210, 0.1)' }}
             contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', border: '1px solid #ccc', borderRadius: '4px' }}
             labelStyle={{ color: '#333', fontWeight: 'bold' }}
          />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Bar dataKey="Level" fill="#4f46e5" className="fill-primary-600" barSize={20} />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};

const StatsExperience: React.FC<{ data: { title: string; metrics: { name: string; value: number; unit: string }[] } }> = ({ data }) => {
  return (
    <div className="mt-6" role="region" aria-label={data.title}>
      <h4 className="text-md font-semibold mb-4 text-gray-700 dark:text-slate-300">Interactive Experience: {data.title}</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {data.metrics.map((metric, index) => (
          <div key={index} className="stat-card theme-transition-all">
            <div className="stat-title">{metric.name}</div>
            <div className="stat-value">{metric.value}{metric.unit}</div>
             {/* Placeholder description, replace if actual change data is available */}
             <div className="stat-desc text-green-500">Increased</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const DemoExperience: React.FC<{ data: { title: string; steps: { id: number; text: string; next: number | null }[] } }> = ({ data }) => {
  const [currentStepId, setCurrentStepId] = useState<number>(data.steps[0]?.id ?? 1);

  const currentStep = useMemo(() => data.steps.find(step => step.id === currentStepId), [currentStepId, data.steps]);

  const handleNext = () => {
    if (currentStep?.next) {
      setCurrentStepId(currentStep.next);
    }
  };

  const handleReset = () => {
     setCurrentStepId(data.steps[0]?.id ?? 1);
  }

  if (!currentStep) return <div>Error: Demo step not found.</div>;

  return (
    <div className="mt-6" role="region" aria-label={data.title}>
      <h4 className="text-md font-semibold mb-4 text-gray-700 dark:text-slate-300">Interactive Experience: {data.title}</h4>
      <div className="card-responsive theme-transition-all p-6 min-h-[150px] flex flex-col justify-between">
        <p className="text-gray-700 dark:text-slate-300 mb-4">{currentStep.text}</p>
        <div className="flex justify-end gap-2 mt-4">
            {currentStep.next === null && (
                <button onClick={handleReset} className="btn btn-secondary btn-sm" name="reset-demo">Start Over</button>
            )}
             {currentStep.next !== null && (
                <button onClick={handleNext} className="btn btn-primary btn-sm" name="next-step-demo">Next</button>
            )}
        </div>
      </div>
    </div>
  );
};

const QuizExperience: React.FC<{ data: { title: string; questions: { question: string; options: string[]; correctAnswer: string }[] } }> = ({ data }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  const currentQuestion = data.questions[currentQuestionIndex];
  const isCorrect = selectedAnswer === currentQuestion?.correctAnswer;

  const handleAnswerSelect = (answer: string) => {
    if (showResult) return; // Don't allow changing answer after submission
    setSelectedAnswer(answer);
  };

  const handleSubmit = () => {
    if (selectedAnswer === null) return; // Require an answer
    setShowResult(true);
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setShowResult(false);
    if (currentQuestionIndex < data.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // End of quiz - maybe show final score
      setCurrentQuestionIndex(-1); // Indicate quiz finished
    }
  };

    const handleRestart = () => {
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setShowResult(false);
      setScore(0);
  }

  return (
    <div className="mt-6" role="region" aria-label={data.title}>
      <h4 className="text-md font-semibold mb-4 text-gray-700 dark:text-slate-300">Interactive Experience: {data.title}</h4>
      <div className="card-responsive theme-transition-all p-6">
        {currentQuestionIndex === -1 ? (
          <div className="text-center">
            <h5 className="text-lg font-medium text-gray-800 dark:text-slate-200">Quiz Complete!</h5>
            <p className="mt-2 text-gray-600 dark:text-slate-400">Your score: {score} out of {data.questions.length}</p>
             <button onClick={handleRestart} className="btn btn-primary mt-4" name="restart-quiz">Restart Quiz</button>
          </div>
        ) : currentQuestion ? (
          <div>
            <p className="font-medium text-gray-800 dark:text-slate-200 mb-3">Question {currentQuestionIndex + 1}/{data.questions.length}: {currentQuestion.question}</p>
            <div className="space-y-2 mb-4">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(option)}
                  disabled={showResult}
                  className={`block w-full text-left p-3 rounded border theme-transition ${selectedAnswer === option
                      ? 'bg-primary-100 dark:bg-primary-900 border-primary-500'
                      : 'bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600'
                    } ${showResult && option === currentQuestion.correctAnswer ? 'border-green-500 ring-1 ring-green-500' : ''}
                     ${showResult && selectedAnswer === option && !isCorrect ? 'border-red-500 ring-1 ring-red-500' : ''}
                     ${showResult ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                   name={`quiz-option-${index}`}
                >
                  {option}
                </button>
              ))}
            </div>
            {showResult && (
              <div className={`mt-3 p-3 rounded text-sm ${isCorrect ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'}`}>
                {isCorrect ? 'Correct!' : `Incorrect. The correct answer is: ${currentQuestion.correctAnswer}`}
              </div>
            )}
            <div className="mt-4 flex justify-end">
              {!showResult ? (
                <button onClick={handleSubmit} disabled={selectedAnswer === null} className="btn btn-primary" name="submit-answer">Submit</button>
              ) : (
                <button onClick={handleNextQuestion} className="btn btn-primary" name="next-question">
                   {currentQuestionIndex < data.questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                </button>
              )}
            </div>
          </div>
        ) : (
           <div>Error: Question not found.</div>
        )}
      </div>
    </div>
  );
};

// --- Main Application Component ---

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useLocalStorage<boolean>('darkMode', false);
  const [careerData, setCareerData] = useLocalStorage<CareerEntry[]>('careerData', initialCareerData);
  const [activeEntryId, setActiveEntryId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode(prevMode => !prevMode);
  };

  const handleSelectEntry = (id: string) => {
    setActiveEntryId(id);
     window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top when selecting an entry
  };

  const handleGoBack = () => {
    setActiveEntryId(null);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(event.target.value);
  }

  const filteredCareerData = useMemo(() => {
      if (!searchTerm) {
          return careerData;
      }
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      return careerData.filter(entry =>
          entry.role.toLowerCase().includes(lowerCaseSearchTerm) ||
          entry.company.toLowerCase().includes(lowerCaseSearchTerm) ||
          entry.summary.toLowerCase().includes(lowerCaseSearchTerm) ||
          entry.skills.some(skill => skill.name.toLowerCase().includes(lowerCaseSearchTerm)) ||
          entry.keyAchievements.some(ach => ach.toLowerCase().includes(lowerCaseSearchTerm))
      );
  }, [careerData, searchTerm]);

  const activeEntry = useMemo(() => {
    return careerData.find(entry => entry.id === activeEntryId) || null;
  }, [activeEntryId, careerData]);

  // Close detail view with Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && activeEntryId) {
        handleGoBack();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeEntryId]); // Re-add listener if activeEntryId changes


  // --- Render Logic ---

  return (
    <div className={`min-h-screen flex flex-col theme-transition-all ${styles.appBackground}`}> {/* Use CSS Module for background */} 
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm sticky top-0 z-40 theme-transition">
        <div className="container-fluid mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-2">
               <User className="w-6 h-6 text-primary-600" />
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-slate-100">Product Manager CV</h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <span className="text-xs sm:text-sm text-gray-500 dark:text-slate-400">Light</span>
               <button
                  onClick={toggleTheme}
                  className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${darkMode ? 'bg-primary-600' : 'bg-gray-200'}`}
                  role="switch"
                  aria-checked={darkMode}
                  aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  <span
                    className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out ${darkMode ? 'translate-x-6' : 'translate-x-1'}`}
                  />
                </button>
              <span className="text-xs sm:text-sm text-gray-500 dark:text-slate-400">Dark</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container-fluid mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!activeEntry ? (
          // List View
          <div>
             <div className="mb-6 relative">
                  <input
                      type="text"
                      placeholder="Search roles, companies, skills..."
                      value={searchTerm}
                      onChange={handleSearchChange}
                      className="input input-responsive pl-10 w-full sm:w-1/2 lg:w-1/3" // Adjusted width for responsiveness
                      aria-label="Search CV entries"
                      name="search-cv"
                  />
                   <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
              </div>

            <div className="grid-responsive gap-6">
              {filteredCareerData.length > 0 ? filteredCareerData.map((entry) => (
                <div
                  key={entry.id}
                  className="card card-responsive theme-transition-all cursor-pointer hover:shadow-lg hover:border-primary-300 dark:hover:border-primary-700 animate-fade-in"
                  onClick={() => handleSelectEntry(entry.id)}
                  role="button"
                  tabIndex={0} // Make it focusable
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSelectEntry(entry.id); }}
                  aria-label={`View details for ${entry.role} at ${entry.company}`}
                >
                  <div className="flex items-center gap-3 mb-2">
                      <Briefcase className="w-5 h-5 text-primary-600 dark:text-primary-400 flex-shrink-0"/>
                      <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white truncate">{entry.role}</h3>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">{entry.company}</p>
                  <p className="text-xs text-gray-400 dark:text-slate-500">{entry.duration}</p>
                  <p className="mt-3 text-sm text-gray-600 dark:text-slate-300 line-clamp-2">{entry.summary}</p>
                  <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                       <span className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline">View Details & Experience</span>
                  </div>
                </div>
              )) : (
                <div className="col-span-1 sm:col-span-2 lg:col-span-3 text-center py-10 text-gray-500 dark:text-slate-400">
                  No entries match your search criteria.
                </div>
              )}
            </div>
          </div>
        ) : (
          // Detail View
          <div className="animate-slide-in" role="article" aria-labelledby="career-entry-title">
             <button
                onClick={handleGoBack}
                className="btn btn-secondary btn-sm mb-6 inline-flex items-center gap-2"
                aria-label="Go back to career list"
                name="back-button"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Overview
             </button>
            <div className="card card-responsive theme-transition-all p-6 md:p-8">
              <div className="flex items-start gap-4 mb-4">
                 <Briefcase className="w-8 h-8 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-1"/>
                 <div>
                    <h2 id="career-entry-title" className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{activeEntry.role}</h2>
                    <p className="text-md sm:text-lg text-gray-600 dark:text-slate-300">{activeEntry.company}</p>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{activeEntry.duration}</p>
                 </div>
              </div>

              <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none mt-4 theme-transition-all">
                <h3 className="flex items-center gap-2"><Lightbulb className="w-5 h-5"/> Summary</h3>
                <p>{activeEntry.summary}</p>

                <h3 className="flex items-center gap-2"><Target className="w-5 h-5"/> Key Achievements</h3>
                <ul>
                  {activeEntry.keyAchievements.map((ach, index) => (
                    <li key={index}>{ach}</li>
                  ))}
                </ul>

                 <h3 className="flex items-center gap-2"><BrainCircuit className="w-5 h-5"/> Skills</h3>
                 {/* Skills could be a list or the chart */}
                 {/* Option 1: Simple List */}
                 {/* <ul className="list-none pl-0 flex flex-wrap gap-2">
                   {activeEntry.skills.map((skill) => (
                     <li key={skill.name}><span className="badge badge-info">{skill.name} ({skill.level}%)</span></li>
                   ))}
                 </ul> */} 
                 {/* Option 2: Chart */} 
                 <SkillsChart skills={activeEntry.skills} />
              </div>

              {/* Interactive Element Section */}
               <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                 <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-500"/> Experience This Role
                 </h3>
                 {activeEntry.interactiveElement.type === 'stats' && <StatsExperience data={activeEntry.interactiveElement.data} />}
                 {activeEntry.interactiveElement.type === 'demo' && <DemoExperience data={activeEntry.interactiveElement.data} />}
                 {activeEntry.interactiveElement.type === 'quiz' && <QuizExperience data={activeEntry.interactiveElement.data} />}
                 {/* Add other interactive types like 'timeline' here if needed */}
               </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 dark:bg-slate-900 text-center py-4 theme-transition mt-auto">
        <p className="text-xs text-gray-500 dark:text-slate-400">
          Copyright © 2025 Datavtar Private Limited. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default App;
