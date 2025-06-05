import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './contexts/authContext';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import {
  User,
  BookOpen,
  Code,
  Play,
  Check,
  ChevronRight,
  ChevronLeft,
  Download,
  Upload,
  Settings,
  Trophy,
  Target,
  Brain,
  FileText,
  Trash2,
  LogOut,
  MessageCircle,
  X,
  Menu,
  Star,
  Clock,
  ArrowRight,
  Lightbulb,
  Zap
} from 'lucide-react';
import styles from './styles/styles.module.css';

// Types and Interfaces
interface Tutorial {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  lessons: Lesson[];
  completed: boolean;
}

interface Lesson {
  id: string;
  title: string;
  content: string;
  code: string;
  expectedOutput: string;
  hints: string[];
  completed: boolean;
}

interface UserProgress {
  completedTutorials: string[];
  completedLessons: string[];
  totalScore: number;
  streak: number;
  lastActiveDate: string;
}

interface Settings {
  theme: 'light' | 'dark';
  fontSize: 'small' | 'medium' | 'large';
  autoSave: boolean;
  showHints: boolean;
}

const App: React.FC = () => {
  const { currentUser, logout } = useAuth();
  
  // AI Layer
  const aiLayerRef = useRef<AILayerHandle>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<any | null>(null);
  const [showAiChat, setShowAiChat] = useState(false);
  
  // App State
  const [currentView, setCurrentView] = useState<'dashboard' | 'tutorial' | 'lesson' | 'progress' | 'settings'>('dashboard');
  const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [userCode, setUserCode] = useState('');
  const [codeOutput, setCodeOutput] = useState('');
  const [showHints, setShowHints] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Data State
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress>({
    completedTutorials: [],
    completedLessons: [],
    totalScore: 0,
    streak: 0,
    lastActiveDate: new Date().toISOString().split('T')[0]
  });
  const [settings, setSettings] = useState<Settings>({
    theme: 'light',
    fontSize: 'medium',
    autoSave: true,
    showHints: true
  });

  // Initialize default tutorials
  useEffect(() => {
    const defaultTutorials: Tutorial[] = [
      {
        id: 'python-basics',
        title: 'Python Basics',
        description: 'Learn the fundamentals of Python programming',
        difficulty: 'beginner',
        estimatedTime: '45 min',
        completed: false,
        lessons: [
          {
            id: 'hello-world',
            title: 'Hello World',
            content: 'Welcome to Python! Let\'s start with the classic "Hello World" program. The print() function displays text on the screen.',
            code: 'print("Hello, World!")',
            expectedOutput: 'Hello, World!',
            hints: ['Use the print() function', 'Put your text in quotes', 'Don\'t forget the parentheses'],
            completed: false
          },
          {
            id: 'variables',
            title: 'Variables',
            content: 'Variables store data that you can use later. In Python, you can create a variable by simply assigning a value to it.',
            code: 'name = "Alice"\nage = 25\nprint(f"My name is {name} and I am {age} years old")',
            expectedOutput: 'My name is Alice and I am 25 years old',
            hints: ['Use = to assign values', 'Strings go in quotes', 'Use f-strings for formatting'],
            completed: false
          },
          {
            id: 'math-operations',
            title: 'Math Operations',
            content: 'Python can perform mathematical calculations. Try basic arithmetic operations.',
            code: 'a = 10\nb = 3\nprint(f"Addition: {a + b}")\nprint(f"Multiplication: {a * b}")\nprint(f"Division: {a / b}")',
            expectedOutput: 'Addition: 13\nMultiplication: 30\nDivision: 3.3333333333333335',
            hints: ['Use +, -, *, / for basic operations', 'Variables can store numbers', 'Print multiple lines with separate print statements'],
            completed: false
          }
        ]
      },
      {
        id: 'data-types',
        title: 'Data Types',
        description: 'Understand different types of data in Python',
        difficulty: 'beginner',
        estimatedTime: '30 min',
        completed: false,
        lessons: [
          {
            id: 'strings',
            title: 'Working with Strings',
            content: 'Strings are sequences of characters. Learn how to create and manipulate them.',
            code: 'text = "Python Programming"\nprint(text.upper())\nprint(text.lower())\nprint(len(text))',
            expectedOutput: 'PYTHON PROGRAMMING\npython programming\n18',
            hints: ['Strings have methods like .upper() and .lower()', 'Use len() to get string length', 'Chain methods with dots'],
            completed: false
          },
          {
            id: 'lists',
            title: 'Lists',
            content: 'Lists store multiple items in a single variable. They are ordered and changeable.',
            code: 'fruits = ["apple", "banana", "orange"]\nprint(fruits)\nfruits.append("grape")\nprint(fruits[0])',
            expectedOutput: '["apple", "banana", "orange"]\n["apple", "banana", "orange", "grape"]\napple',
            hints: ['Use square brackets for lists', 'append() adds items to the end', 'Access items with index [0, 1, 2...]'],
            completed: false
          }
        ]
      },
      {
        id: 'control-flow',
        title: 'Control Flow',
        description: 'Learn about conditions and loops',
        difficulty: 'intermediate',
        estimatedTime: '60 min',
        completed: false,
        lessons: [
          {
            id: 'if-statements',
            title: 'If Statements',
            content: 'Use if statements to make decisions in your code.',
            code: 'temperature = 25\nif temperature > 20:\n    print("It\'s warm outside!")\nelse:\n    print("It\'s cool outside!")',
            expectedOutput: 'It\'s warm outside!',
            hints: ['Use if, elif, else for conditions', 'Don\'t forget the colon :', 'Indent the code block'],
            completed: false
          },
          {
            id: 'for-loops',
            title: 'For Loops',
            content: 'Loops let you repeat code multiple times.',
            code: 'for i in range(5):\n    print(f"Count: {i}")',
            expectedOutput: 'Count: 0\nCount: 1\nCount: 2\nCount: 3\nCount: 4',
            hints: ['range() creates a sequence of numbers', 'Use for to iterate', 'Remember indentation'],
            completed: false
          }
        ]
      }
    ];

    const savedTutorials = localStorage.getItem('pythonTutorials');
    const savedProgress = localStorage.getItem('userProgress');
    const savedSettings = localStorage.getItem('appSettings');

    if (savedTutorials) {
      setTutorials(JSON.parse(savedTutorials));
    } else {
      setTutorials(defaultTutorials);
      localStorage.setItem('pythonTutorials', JSON.stringify(defaultTutorials));
    }

    if (savedProgress) {
      setUserProgress(JSON.parse(savedProgress));
    }

    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('pythonTutorials', JSON.stringify(tutorials));
  }, [tutorials]);

  useEffect(() => {
    localStorage.setItem('userProgress', JSON.stringify(userProgress));
  }, [userProgress]);

  useEffect(() => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
  }, [settings]);

  // AI Helper Functions
  const handleAskAI = () => {
    if (!aiPrompt.trim()) {
      setAiError('Please enter a question about Python');
      return;
    }

    setAiResult(null);
    setAiError(null);
    
    const contextPrompt = `You are a Python programming tutor. The user is learning Python basics. Please provide a clear, beginner-friendly explanation for: ${aiPrompt}. Keep your response concise and include a simple code example if relevant.`;
    
    try {
      aiLayerRef.current?.sendToAI(contextPrompt);
    } catch (error) {
      setAiError('Failed to process AI request');
    }
  };

  // Code execution simulation
  const runCode = () => {
    if (!selectedLesson) return;
    
    try {
      // Simple simulation of Python code execution
      let output = '';
      const lines = userCode.split('\n');
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('print(')) {
          const match = trimmedLine.match(/print\((.*)\)/);
          if (match) {
            let content = match[1];
            // Handle f-strings
            if (content.startsWith('f"') || content.startsWith("f'")) {
              content = content.slice(2, -1);
              // Simple variable replacement for demo
              content = content.replace(/{([^}]+)}/g, (_, expr) => {
                if (expr.includes('+')) {
                  const parts = expr.split('+').map(p => p.trim());
                  const result = parts.reduce((sum, part) => {
                    const num = parseInt(part);
                    return isNaN(num) ? sum : sum + num;
                  }, 0);
                  return result.toString();
                }
                return expr;
              });
            } else {
              content = content.replace(/["\']/g, '');
            }
            output += content + '\n';
          }
        }
      }
      
      setCodeOutput(output.trim());
      
      // Check if output matches expected
      if (output.trim() === selectedLesson.expectedOutput) {
        markLessonComplete();
      }
    } catch (error) {
      setCodeOutput('Error: Invalid code');
    }
  };

  const markLessonComplete = () => {
    if (!selectedLesson || !selectedTutorial) return;
    
    const updatedTutorials = tutorials.map(tutorial => {
      if (tutorial.id === selectedTutorial.id) {
        const updatedLessons = tutorial.lessons.map(lesson => {
          if (lesson.id === selectedLesson.id) {
            return { ...lesson, completed: true };
          }
          return lesson;
        });
        
        const allLessonsComplete = updatedLessons.every(lesson => lesson.completed);
        return {
          ...tutorial,
          lessons: updatedLessons,
          completed: allLessonsComplete
        };
      }
      return tutorial;
    });
    
    setTutorials(updatedTutorials);
    
    // Update progress
    const newProgress = {
      ...userProgress,
      completedLessons: [...new Set([...userProgress.completedLessons, selectedLesson.id])],
      totalScore: userProgress.totalScore + 10,
      lastActiveDate: new Date().toISOString().split('T')[0]
    };
    
    if (selectedTutorial.lessons.every(lesson => lesson.completed)) {
      newProgress.completedTutorials = [...new Set([...newProgress.completedTutorials, selectedTutorial.id])];
      newProgress.totalScore += 50;
    }
    
    setUserProgress(newProgress);
  };

  const startTutorial = (tutorial: Tutorial) => {
    setSelectedTutorial(tutorial);
    setSelectedLesson(tutorial.lessons[0]);
    setCurrentLessonIndex(0);
    setUserCode(tutorial.lessons[0].code);
    setCodeOutput('');
    setCurrentView('lesson');
  };

  const nextLesson = () => {
    if (!selectedTutorial || currentLessonIndex >= selectedTutorial.lessons.length - 1) return;
    
    const nextIndex = currentLessonIndex + 1;
    const nextLesson = selectedTutorial.lessons[nextIndex];
    setCurrentLessonIndex(nextIndex);
    setSelectedLesson(nextLesson);
    setUserCode(nextLesson.code);
    setCodeOutput('');
    setShowHints(false);
  };

  const previousLesson = () => {
    if (currentLessonIndex <= 0) return;
    
    const prevIndex = currentLessonIndex - 1;
    const prevLesson = selectedTutorial!.lessons[prevIndex];
    setCurrentLessonIndex(prevIndex);
    setSelectedLesson(prevLesson);
    setUserCode(prevLesson.code);
    setCodeOutput('');
    setShowHints(false);
  };

  const exportProgress = () => {
    const data = {
      tutorials,
      userProgress,
      settings,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'python-learning-progress.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importProgress = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.tutorials) setTutorials(data.tutorials);
        if (data.userProgress) setUserProgress(data.userProgress);
        if (data.settings) setSettings(data.settings);
      } catch (error) {
        console.error('Invalid file format');
      }
    };
    reader.readAsText(file);
  };

  const clearAllData = () => {
    localStorage.removeItem('pythonTutorials');
    localStorage.removeItem('userProgress');
    localStorage.removeItem('appSettings');
    window.location.reload();
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900';
      case 'advanced': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700';
    }
  };

  const completionPercentage = () => {
    const totalLessons = tutorials.reduce((sum, tutorial) => sum + tutorial.lessons.length, 0);
    const completedLessons = userProgress.completedLessons.length;
    return totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your Python learning journey...</p>
        </div>
      </div>
    );
  }

  return (
    <div id="welcome_fallback" className={`min-h-screen bg-gray-50 dark:bg-slate-900 ${settings.theme === 'dark' ? 'dark' : ''}`}>
      {/* AI Layer */}
      <AILayer
        ref={aiLayerRef}
        prompt={aiPrompt}
        onResult={(result) => setAiResult(result)}
        onError={(error) => setAiError(error)}
        onLoading={(loading) => setIsAiLoading(loading)}
      />

      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Code className="h-8 w-8 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Python Learning Hub</h1>
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-4">
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'dashboard' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setCurrentView('progress')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                }`}
              >
                Progress
              </button>
              <button
                onClick={() => setCurrentView('settings')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'settings' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                }`}
              >
                Settings
              </button>
              <button
                onClick={() => setShowAiChat(true)}
                className="btn btn-primary btn-sm flex items-center gap-2"
              >
                <Brain className="h-4 w-4" />
                AI Helper
              </button>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <User className="h-4 w-4" />
                <span>{currentUser.first_name}</span>
              </div>
              <button
                onClick={logout}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
            
            <button
              className="md:hidden p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
          
          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200 dark:border-slate-700">
              <div className="space-y-2">
                <button
                  onClick={() => { setCurrentView('dashboard'); setIsMobileMenuOpen(false); }}
                  className="block w-full text-left px-3 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => { setCurrentView('progress'); setIsMobileMenuOpen(false); }}
                  className="block w-full text-left px-3 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                >
                  Progress
                </button>
                <button
                  onClick={() => { setCurrentView('settings'); setIsMobileMenuOpen(false); }}
                  className="block w-full text-left px-3 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                >
                  Settings
                </button>
                <button
                  onClick={() => { setShowAiChat(true); setIsMobileMenuOpen(false); }}
                  className="block w-full text-left px-3 py-2 text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  AI Helper
                </button>
                <button
                  onClick={logout}
                  className="block w-full text-left px-3 py-2 text-red-600 hover:text-red-700 dark:text-red-400"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard View */}
        {currentView === 'dashboard' && (
          <div id="generation_issue_fallback" className="space-y-8">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Welcome back, {currentUser.first_name}!</h2>
                  <p className="text-blue-100 text-lg">Continue your Python learning journey</p>
                  <div className="mt-4 flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-5 w-5" />
                      <span>{userProgress.totalScore} points</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      <span>{completionPercentage()}% complete</span>
                    </div>
                  </div>
                </div>
                <div className="hidden md:block">
                  <div className={`${styles.pythonLogo} text-6xl opacity-20`}>🐍</div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="stat-card">
                <div className="stat-title">Completed Lessons</div>
                <div className="stat-value">{userProgress.completedLessons.length}</div>
                <div className="stat-desc">Keep up the great work!</div>
              </div>
              <div className="stat-card">
                <div className="stat-title">Total Score</div>
                <div className="stat-value">{userProgress.totalScore}</div>
                <div className="stat-desc">Points earned</div>
              </div>
              <div className="stat-card">
                <div className="stat-title">Learning Streak</div>
                <div className="stat-value">{userProgress.streak}</div>
                <div className="stat-desc">Days in a row</div>
              </div>
            </div>

            {/* Tutorials Grid */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Available Tutorials</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tutorials.map((tutorial) => (
                  <div key={tutorial.id} id={`tutorial-${tutorial.id}`} className="card hover:shadow-lg transition-shadow duration-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{tutorial.title}</h4>
                      </div>
                      {tutorial.completed && (
                        <div className="flex items-center gap-1 text-green-600">
                          <Check className="h-4 w-4" />
                          <span className="text-xs">Complete</span>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-300 mb-4">{tutorial.description}</p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <span className={`badge ${getDifficultyColor(tutorial.difficulty)}`}>
                        {tutorial.difficulty}
                      </span>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        <span>{tutorial.estimatedTime}</span>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                        <span>Progress</span>
                        <span>{tutorial.lessons.filter(l => l.completed).length}/{tutorial.lessons.length}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(tutorial.lessons.filter(l => l.completed).length / tutorial.lessons.length) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => startTutorial(tutorial)}
                      className="btn btn-primary w-full flex items-center justify-center gap-2"
                    >
                      {tutorial.completed ? 'Review' : 'Start Learning'}
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Lesson View */}
        {currentView === 'lesson' && selectedLesson && selectedTutorial && (
          <div className="space-y-6">
            {/* Lesson Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </button>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedLesson.title}</h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Lesson {currentLessonIndex + 1} of {selectedTutorial.lessons.length} • {selectedTutorial.title}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={previousLesson}
                  disabled={currentLessonIndex === 0}
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-300"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={nextLesson}
                  disabled={currentLessonIndex === selectedTutorial.lessons.length - 1}
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-300"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-300 flex items-center justify-end pr-2"
                style={{ width: `${((currentLessonIndex + 1) / selectedTutorial.lessons.length) * 100}%` }}
              >
                <span className="text-xs text-white font-medium">
                  {Math.round(((currentLessonIndex + 1) / selectedTutorial.lessons.length) * 100)}%
                </span>
              </div>
            </div>

            {/* Lesson Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Theory Section */}
              <div className="card">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Learn</h3>
                </div>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{selectedLesson.content}</p>
                </div>
                
                {/* Hints Section */}
                <div className="mt-6">
                  <button
                    onClick={() => setShowHints(!showHints)}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <Lightbulb className="h-4 w-4" />
                    {showHints ? 'Hide Hints' : 'Show Hints'}
                  </button>
                  
                  {showHints && (
                    <div className="mt-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">💡 Hints:</h4>
                      <ul className="space-y-1">
                        {selectedLesson.hints.map((hint, index) => (
                          <li key={index} className="text-sm text-yellow-700 dark:text-yellow-300">• {hint}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Code Practice Section */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Code className="h-5 w-5 text-green-600" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Practice</h3>
                  </div>
                  <button
                    onClick={runCode}
                    className="btn btn-primary btn-sm flex items-center gap-2"
                  >
                    <Play className="h-4 w-4" />
                    Run Code
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="form-label">Your Code:</label>
                    <textarea
                      value={userCode}
                      onChange={(e) => setUserCode(e.target.value)}
                      className={`input min-h-32 font-mono text-sm ${styles.codeEditor}`}
                      placeholder="Write your Python code here..."
                    />
                  </div>
                  
                  <div>
                    <label className="form-label">Output:</label>
                    <div className={`${styles.codeOutput} p-3 bg-gray-900 text-green-400 rounded-md font-mono text-sm min-h-20 whitespace-pre-wrap`}>
                      {codeOutput || 'Run your code to see the output'}
                    </div>
                  </div>
                  
                  {selectedLesson.completed && (
                    <div className="alert alert-success">
                      <Check className="h-5 w-5" />
                      <p>Great job! You've completed this lesson.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Progress View */}
        {currentView === 'progress' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Learning Progress</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={exportProgress}
                  className="btn bg-green-600 text-white hover:bg-green-700 flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export
                </button>
                <label className="btn bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2 cursor-pointer">
                  <Upload className="h-4 w-4" />
                  Import
                  <input
                    type="file"
                    accept=".json"
                    onChange={importProgress}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Overall Progress */}
            <div className="card">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Overall Progress</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{completionPercentage()}%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Complete</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{userProgress.completedLessons.length}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Lessons Done</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{userProgress.totalScore}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Points</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">{userProgress.streak}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Day Streak</div>
                </div>
              </div>
            </div>

            {/* Tutorial Progress */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Tutorial Progress</h3>
              {tutorials.map((tutorial) => {
                const completedLessons = tutorial.lessons.filter(lesson => lesson.completed).length;
                const progressPercent = (completedLessons / tutorial.lessons.length) * 100;
                
                return (
                  <div key={tutorial.id} className="card">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white">{tutorial.title}</h4>
                      <span className={`badge ${getDifficultyColor(tutorial.difficulty)}`}>
                        {tutorial.difficulty}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <span>{completedLessons}/{tutorial.lessons.length} lessons completed</span>
                      <span>{Math.round(progressPercent)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Settings View */}
        {currentView === 'settings' && (
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h2>

            {/* Theme Settings */}
            <div className="card">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Appearance</h3>
              <div className="space-y-4">
                <div>
                  <label className="form-label">Theme</label>
                  <select
                    value={settings.theme}
                    onChange={(e) => setSettings({...settings, theme: e.target.value as 'light' | 'dark'})}
                    className="input w-full max-w-xs"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Font Size</label>
                  <select
                    value={settings.fontSize}
                    onChange={(e) => setSettings({...settings, fontSize: e.target.value as 'small' | 'medium' | 'large'})}
                    className="input w-full max-w-xs"
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Learning Settings */}
            <div className="card">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Learning Preferences</h3>
              <div className="space-y-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.autoSave}
                    onChange={(e) => setSettings({...settings, autoSave: e.target.checked})}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700 dark:text-gray-300">Auto-save progress</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.showHints}
                    onChange={(e) => setSettings({...settings, showHints: e.target.checked})}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700 dark:text-gray-300">Show hints by default</span>
                </label>
              </div>
            </div>

            {/* Data Management */}
            <div className="card">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Data Management</h3>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={exportProgress}
                    className="btn bg-green-600 text-white hover:bg-green-700 flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export All Data
                  </button>
                  <label className="btn bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2 cursor-pointer">
                    <Upload className="h-4 w-4" />
                    Import Data
                    <input
                      type="file"
                      accept=".json"
                      onChange={importProgress}
                      className="hidden"
                    />
                  </label>
                  <button
                    onClick={clearAllData}
                    className="btn bg-red-600 text-white hover:bg-red-700 flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Clear All Data
                  </button>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Export your progress to backup your data or import previously saved progress.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* AI Chat Modal */}
      {showAiChat && (
        <div className="modal-backdrop" onClick={() => setShowAiChat(false)}>
          <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-600" />
                AI Python Helper
              </h3>
              <button 
                onClick={() => setShowAiChat(false)}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="mt-4 space-y-4">
              <div>
                <label className="form-label">Ask me anything about Python:</label>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g., How do I create a list in Python? or Explain what variables are"
                  className="input min-h-24"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.ctrlKey) {
                      handleAskAI();
                    }
                  }}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Tip: Press Ctrl+Enter to send</p>
              </div>
              
              {aiResult && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <h4 className="text-sm font-medium text-green-800 dark:text-green-200 mb-2 flex items-center gap-1">
                    <Zap className="h-4 w-4" />
                    AI Response:
                  </h4>
                  <div className="text-sm text-green-700 dark:text-green-300 whitespace-pre-wrap">{aiResult}</div>
                </div>
              )}
              
              {aiError && (
                <div className="alert alert-error">
                  <X className="h-5 w-5" />
                  <p>Error: {aiError.toString()}</p>
                </div>
              )}
            </div>
            
            <div className="modal-footer">
              <button
                onClick={() => setShowAiChat(false)}
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Close
              </button>
              <button
                onClick={handleAskAI}
                disabled={isAiLoading || !aiPrompt.trim()}
                className="btn btn-primary flex items-center gap-2 disabled:opacity-50"
              >
                {isAiLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Thinking...
                  </>
                ) : (
                  <>
                    <MessageCircle className="h-4 w-4" />
                    Ask AI
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600 dark:text-gray-400">
            <p>Copyright © 2025 Datavtar Private Limited. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;