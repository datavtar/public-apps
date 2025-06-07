import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './contexts/authContext';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import { 
  User, 
  Trophy, 
  BarChart3, 
  Settings, 
  Brain, 
  Play, 
  ArrowRight, 
  Check, 
  X, 
  Star, 
  Target, 
  TrendingUp,
  Download,
  Upload,
  FileText,
  Plus,
  Trash2,
  LogOut,
  Sun,
  Moon,
  Globe,
  Clock,
  Filter,
  RotateCcw,
  Zap
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import styles from './styles/styles.module.css';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  explanation?: string;
}

interface QuizResult {
  questionId: string;
  selectedAnswer: number;
  isCorrect: boolean;
  timeTaken: number;
}

interface QuizSession {
  id: string;
  category: string;
  difficulty: string;
  questions: Question[];
  results: QuizResult[];
  score: number;
  totalQuestions: number;
  completedAt: Date;
  timeTaken: number;
}

interface QuizStats {
  totalQuizzes: number;
  totalQuestions: number;
  correctAnswers: number;
  averageScore: number;
  bestScore: number;
  categoriesPlayed: string[];
  difficultyStats: Record<string, { played: number; average: number }>;
}

type ActiveTab = 'dashboard' | 'quiz' | 'statistics' | 'settings' | 'ai-features';

const CATEGORIES = ['General Knowledge', 'Science', 'History', 'Sports', 'Technology'];
const DIFFICULTIES = ['easy', 'medium', 'hard'];

const DIFFICULTY_MULTIPLIERS = {
  easy: 1,
  medium: 1.5,
  hard: 2
};

const SAMPLE_QUESTIONS: Question[] = [
  {
    id: '1',
    question: 'What is the capital of France?',
    options: ['London', 'Berlin', 'Paris', 'Madrid'],
    correctAnswer: 2,
    category: 'General Knowledge',
    difficulty: 'easy',
    explanation: 'Paris has been the capital of France since 508 AD.'
  },
  {
    id: '2',
    question: 'Which planet is known as the Red Planet?',
    options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
    correctAnswer: 1,
    category: 'Science',
    difficulty: 'easy',
    explanation: 'Mars appears red due to iron oxide (rust) on its surface.'
  },
  {
    id: '3',
    question: 'In which year did World War II end?',
    options: ['1944', '1945', '1946', '1947'],
    correctAnswer: 1,
    category: 'History',
    difficulty: 'medium',
    explanation: 'World War II ended in 1945 with the surrender of Japan in September.'
  },
  {
    id: '4',
    question: 'What is the chemical symbol for gold?',
    options: ['Go', 'Gd', 'Au', 'Ag'],
    correctAnswer: 2,
    category: 'Science',
    difficulty: 'medium',
    explanation: 'Au comes from the Latin word "aurum" meaning gold.'
  },
  {
    id: '5',
    question: 'Which programming language was developed by James Gosling?',
    options: ['Python', 'Java', 'C++', 'JavaScript'],
    correctAnswer: 1,
    category: 'Technology',
    difficulty: 'hard',
    explanation: 'Java was developed by James Gosling at Sun Microsystems in 1995.'
  }
];

const App: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const aiLayerRef = useRef<AILayerHandle>(null);

  // Main app state
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('quizapp_darkMode');
    return saved === 'true' || (saved === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // Quiz state
  const [questions, setQuestions] = useState<Question[]>(SAMPLE_QUESTIONS);
  const [currentQuiz, setCurrentQuiz] = useState<Question[] | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState<boolean>(false);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [quizStartTime, setQuizStartTime] = useState<number>(0);
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);

  // Quiz configuration
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [questionCount, setQuestionCount] = useState<number>(5);

  // Quiz sessions and statistics
  const [quizSessions, setQuizSessions] = useState<QuizSession[]>([]);

  // AI Features state
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<any>(null);

  // Settings state
  const [settings, setSettings] = useState({
    language: 'en',
    autoNextQuestion: true,
    showExplanations: true,
    timeLimit: 0,
    soundEffects: true
  });

  // UI state
  const [showConfirmDelete, setShowConfirmDelete] = useState<boolean>(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedQuestions = localStorage.getItem('quizapp_questions');
    if (savedQuestions) {
      try {
        const parsed = JSON.parse(savedQuestions);
        setQuestions(parsed.length > 0 ? parsed : SAMPLE_QUESTIONS);
      } catch {
        setQuestions(SAMPLE_QUESTIONS);
      }
    }

    const savedSessions = localStorage.getItem('quizapp_sessions');
    if (savedSessions) {
      try {
        const parsed = JSON.parse(savedSessions);
        setQuizSessions(parsed);
      } catch {
        setQuizSessions([]);
      }
    }

    const savedSettings = localStorage.getItem('quizapp_settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...settings, ...parsed });
      } catch {
        // Keep default settings
      }
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('quizapp_questions', JSON.stringify(questions));
  }, [questions]);

  useEffect(() => {
    localStorage.setItem('quizapp_sessions', JSON.stringify(quizSessions));
  }, [quizSessions]);

  useEffect(() => {
    localStorage.setItem('quizapp_settings', JSON.stringify(settings));
  }, [settings]);

  // Dark mode effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('quizapp_darkMode', isDarkMode.toString());
  }, [isDarkMode]);

  // Calculate statistics
  const calculateStats = (): QuizStats => {
    if (quizSessions.length === 0) {
      return {
        totalQuizzes: 0,
        totalQuestions: 0,
        correctAnswers: 0,
        averageScore: 0,
        bestScore: 0,
        categoriesPlayed: [],
        difficultyStats: {}
      };
    }

    const totalQuizzes = quizSessions.length;
    const totalQuestions = quizSessions.reduce((sum, session) => sum + session.totalQuestions, 0);
    const correctAnswers = quizSessions.reduce((sum, session) => 
      sum + session.results.filter(r => r.isCorrect).length, 0
    );
    const averageScore = quizSessions.reduce((sum, session) => sum + session.score, 0) / totalQuizzes;
    const bestScore = Math.max(...quizSessions.map(session => session.score));
    const categoriesPlayed = [...new Set(quizSessions.map(session => session.category))];

    const difficultyStats: Record<string, { played: number; average: number }> = {};
    DIFFICULTIES.forEach(difficulty => {
      const sessionsForDifficulty = quizSessions.filter(s => s.difficulty === difficulty);
      if (sessionsForDifficulty.length > 0) {
        difficultyStats[difficulty] = {
          played: sessionsForDifficulty.length,
          average: sessionsForDifficulty.reduce((sum, s) => sum + s.score, 0) / sessionsForDifficulty.length
        };
      }
    });

    return {
      totalQuizzes,
      totalQuestions,
      correctAnswers,
      averageScore,
      bestScore,
      categoriesPlayed,
      difficultyStats
    };
  };

  const stats = calculateStats();

  // Quiz functions
  const startQuiz = () => {
    let filteredQuestions = [...questions];

    if (selectedCategory !== 'all') {
      filteredQuestions = filteredQuestions.filter(q => q.category === selectedCategory);
    }

    if (selectedDifficulty !== 'all') {
      filteredQuestions = filteredQuestions.filter(q => q.difficulty === selectedDifficulty);
    }

    // Shuffle and limit questions
    const shuffled = filteredQuestions.sort(() => Math.random() - 0.5);
    const quizQuestions = shuffled.slice(0, Math.min(questionCount, shuffled.length));

    if (quizQuestions.length === 0) {
      alert('No questions available for the selected criteria. Please adjust your filters.');
      return;
    }

    setCurrentQuiz(quizQuestions);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setQuizResults([]);
    setQuizStartTime(Date.now());
    setQuestionStartTime(Date.now());
    setActiveTab('quiz');
  };

  const selectAnswer = (answerIndex: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(answerIndex);
    setShowResult(true);

    const currentQuestion = currentQuiz?.[currentQuestionIndex];
    if (!currentQuestion) return;

    const timeTaken = Date.now() - questionStartTime;
    const isCorrect = answerIndex === currentQuestion.correctAnswer;

    const result: QuizResult = {
      questionId: currentQuestion.id,
      selectedAnswer: answerIndex,
      isCorrect,
      timeTaken
    };

    setQuizResults(prev => [...prev, result]);
  };

  const nextQuestion = () => {
    if (!currentQuiz) return;

    if (currentQuestionIndex < currentQuiz.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setQuestionStartTime(Date.now());
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    if (!currentQuiz) return;

    const totalTimeTaken = Date.now() - quizStartTime;
    const correctCount = quizResults.filter(r => r.isCorrect).length;
    const difficultyMultiplier = selectedDifficulty !== 'all' 
      ? DIFFICULTY_MULTIPLIERS[selectedDifficulty as keyof typeof DIFFICULTY_MULTIPLIERS]
      : 1;
    
    const baseScore = (correctCount / currentQuiz.length) * 100;
    const finalScore = Math.round(baseScore * difficultyMultiplier);

    const session: QuizSession = {
      id: Date.now().toString(),
      category: selectedCategory === 'all' ? 'Mixed' : selectedCategory,
      difficulty: selectedDifficulty === 'all' ? 'Mixed' : selectedDifficulty,
      questions: currentQuiz,
      results: quizResults,
      score: finalScore,
      totalQuestions: currentQuiz.length,
      completedAt: new Date(),
      timeTaken: totalTimeTaken
    };

    setQuizSessions(prev => [session, ...prev]);
    setCurrentQuiz(null);
    setActiveTab('statistics');
  };

  // AI Functions
  const generateQuestions = () => {
    if (!aiPrompt.trim()) {
      setAiError('Please provide a topic or description for question generation.');
      return;
    }

    const enhancedPrompt = `Generate 5 multiple-choice quiz questions about: ${aiPrompt}

Return the response in this exact JSON format:
{
  "questions": [
    {
      "question": "Question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "category": "Appropriate category",
      "difficulty": "easy/medium/hard",
      "explanation": "Brief explanation of the correct answer"
    }
  ]
}

Make sure the questions are educational, accurate, and engaging. Include a mix of difficulty levels.`;

    setAiResult(null);
    setAiError(null);
    
    try {
      aiLayerRef.current?.sendToAI(enhancedPrompt);
    } catch (error) {
      setAiError('Failed to generate questions. Please try again.');
    }
  };

  const handleAiResult = (result: string) => {
    setAiResult(result);
    
    try {
      const parsed = JSON.parse(result);
      if (parsed.questions && Array.isArray(parsed.questions)) {
        const newQuestions: Question[] = parsed.questions.map((q: any, index: number) => ({
          id: `ai_${Date.now()}_${index}`,
          question: q.question || '',
          options: Array.isArray(q.options) ? q.options : [],
          correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0,
          category: q.category || 'AI Generated',
          difficulty: ['easy', 'medium', 'hard'].includes(q.difficulty) ? q.difficulty : 'medium',
          explanation: q.explanation || ''
        })).filter(q => q.question && q.options.length === 4);

        if (newQuestions.length > 0) {
          setQuestions(prev => [...newQuestions, ...prev]);
          setAiPrompt('');
          alert(`Successfully added ${newQuestions.length} new questions!`);
        }
      }
    } catch (error) {
      // If JSON parsing fails, just show the raw result
      console.error('Failed to parse AI response as JSON:', error);
    }
  };

  // Data management functions
  const exportData = () => {
    const data = {
      questions,
      sessions: quizSessions,
      settings,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quiz-app-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadTemplate = () => {
    const template = `question,option1,option2,option3,option4,correctAnswer,category,difficulty,explanation
"What is 2+2?","3","4","5","6",1,"Math","easy","Basic arithmetic"
"Capital of Japan?","Tokyo","Osaka","Kyoto","Nagoya",0,"Geography","easy","Tokyo is the capital"`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quiz-questions-template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        if (file.type === 'application/json') {
          const data = JSON.parse(e.target?.result as string);
          if (data.questions && Array.isArray(data.questions)) {
            const importedQuestions = data.questions.map((q: any, index: number) => ({
              id: `imported_${Date.now()}_${index}`,
              question: q.question || '',
              options: Array.isArray(q.options) ? q.options : [],
              correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0,
              category: q.category || 'Imported',
              difficulty: ['easy', 'medium', 'hard'].includes(q.difficulty) ? q.difficulty : 'medium',
              explanation: q.explanation || ''
            })).filter((q: Question) => q.question && q.options.length >= 2);

            setQuestions(prev => [...importedQuestions, ...prev]);
            alert(`Successfully imported ${importedQuestions.length} questions!`);
          }
        } else if (file.type === 'text/csv') {
          const csv = e.target?.result as string;
          const lines = csv.split('\n').slice(1); // Skip header
          const importedQuestions: Question[] = [];

          lines.forEach((line, index) => {
            const columns = line.split(',').map(col => col.replace(/^"|"$/g, '').trim());
            if (columns.length >= 8) {
              importedQuestions.push({
                id: `csv_${Date.now()}_${index}`,
                question: columns[0],
                options: [columns[1], columns[2], columns[3], columns[4]],
                correctAnswer: parseInt(columns[5]) || 0,
                category: columns[6] || 'Imported',
                difficulty: ['easy', 'medium', 'hard'].includes(columns[7]) ? columns[7] as any : 'medium',
                explanation: columns[8] || ''
              });
            }
          });

          setQuestions(prev => [...importedQuestions, ...prev]);
          alert(`Successfully imported ${importedQuestions.length} questions from CSV!`);
        }
      } catch (error) {
        alert('Error importing file. Please check the format and try again.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const clearAllData = () => {
    setQuestions(SAMPLE_QUESTIONS);
    setQuizSessions([]);
    setSettings({
      language: 'en',
      autoNextQuestion: true,
      showExplanations: true,
      timeLimit: 0,
      soundEffects: true
    });
    setShowConfirmDelete(false);
    alert('All data has been cleared successfully!');
  };

  // Render functions
  const renderNavigation = () => (
    <nav className="bg-white dark:bg-slate-800 shadow-lg border-b border-gray-200 dark:border-slate-700">
      <div className="container-wide">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary-600" />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">QuizMaster</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-slate-300">
              Welcome, {currentUser?.first_name}
            </span>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-lg bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );

  const renderTabs = () => (
    <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
      <div className="container-wide">
        <div className="flex space-x-8">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Target, tourId: 'dashboard-tab' },
            { id: 'quiz', label: 'Take Quiz', icon: Play, tourId: 'quiz-tab' },
            { id: 'statistics', label: 'Statistics', icon: BarChart3, tourId: 'statistics-tab' },
            { id: 'ai-features', label: 'AI Features', icon: Zap, tourId: 'ai-features-tab' },
            { id: 'settings', label: 'Settings', icon: Settings, tourId: 'settings-tab' }
          ].map(({ id, label, icon: Icon, tourId }) => (
            <button
              key={id}
              id={tourId}
              onClick={() => setActiveTab(id as ActiveTab)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors ${
                activeTab === id
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 hover:border-gray-300'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div id="welcome_fallback" className="container-wide py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <div className="card">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Welcome Back!</h2>
            <p className="text-gray-600 dark:text-slate-300 mb-6">
              Ready to test your knowledge? Choose from our quiz categories and challenge yourself!
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="stat-card bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800">
                <div className="stat-title text-primary-600 dark:text-primary-400">Total Quizzes</div>
                <div className="stat-value text-primary-700 dark:text-primary-300">{stats.totalQuizzes}</div>
              </div>
              <div className="stat-card bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <div className="stat-title text-green-600 dark:text-green-400">Average Score</div>
                <div className="stat-value text-green-700 dark:text-green-300">
                  {stats.averageScore ? Math.round(stats.averageScore) : 0}%
                </div>
              </div>
            </div>

            <button
              id="start-quiz-btn"
              onClick={() => setActiveTab('quiz')}
              className="btn btn-primary btn-lg flex items-center gap-2"
            >
              <Play className="h-5 w-5" />
              Start New Quiz
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-slate-400">Questions Answered</span>
                <span className="font-semibold text-gray-900 dark:text-white">{stats.totalQuestions}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-slate-400">Correct Answers</span>
                <span className="font-semibold text-green-600 dark:text-green-400">{stats.correctAnswers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-slate-400">Best Score</span>
                <span className="font-semibold text-yellow-600 dark:text-yellow-400">{stats.bestScore}%</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Categories Played</h3>
            <div className="space-y-2">
              {stats.categoriesPlayed.length > 0 ? (
                stats.categoriesPlayed.map(category => (
                  <div key={category} className="badge badge-info">
                    {category}
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-slate-400">No quizzes completed yet</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {quizSessions.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Quiz Sessions</h3>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th className="table-header">Date</th>
                  <th className="table-header">Category</th>
                  <th className="table-header">Difficulty</th>
                  <th className="table-header">Score</th>
                  <th className="table-header">Questions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                {quizSessions.slice(0, 5).map(session => (
                  <tr key={session.id}>
                    <td className="table-cell">
                      {new Date(session.completedAt).toLocaleDateString()}
                    </td>
                    <td className="table-cell">{session.category}</td>
                    <td className="table-cell">
                      <span className={`badge ${
                        session.difficulty === 'easy' ? 'badge-success' :
                        session.difficulty === 'medium' ? 'badge-warning' : 'badge-error'
                      }`}>
                        {session.difficulty}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className="font-semibold">{session.score}%</span>
                    </td>
                    <td className="table-cell">{session.totalQuestions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  const renderQuizSetup = () => (
    <div className="container-wide py-8">
      <div className="max-w-2xl mx-auto">
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Configure Your Quiz</h2>
          
          <div className="space-y-6">
            <div className="form-group">
              <label className="form-label" htmlFor="category-select">Category</label>
              <select
                id="category-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input"
              >
                <option value="all">All Categories</option>
                {CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="difficulty-select">Difficulty</label>
              <select
                id="difficulty-select"
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="input"
              >
                <option value="all">All Difficulties</option>
                <option value="easy">Easy (1x points)</option>
                <option value="medium">Medium (1.5x points)</option>
                <option value="hard">Hard (2x points)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="question-count">Number of Questions</label>
              <select
                id="question-count"
                value={questionCount}
                onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                className="input"
              >
                <option value={5}>5 Questions</option>
                <option value={10}>10 Questions</option>
                <option value={15}>15 Questions</option>
                <option value={20}>20 Questions</option>
              </select>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Available Questions</h4>
              <p className="text-blue-700 dark:text-blue-300 text-sm">
                {(() => {
                  let filtered = questions;
                  if (selectedCategory !== 'all') {
                    filtered = filtered.filter(q => q.category === selectedCategory);
                  }
                  if (selectedDifficulty !== 'all') {
                    filtered = filtered.filter(q => q.difficulty === selectedDifficulty);
                  }
                  return `${filtered.length} questions available with current filters`;
                })()}
              </p>
            </div>

            <button
              id="start-quiz-action"
              onClick={startQuiz}
              className="btn btn-primary btn-lg w-full flex items-center justify-center gap-2"
            >
              <Play className="h-5 w-5" />
              Start Quiz
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderQuizQuestion = () => {
    if (!currentQuiz || currentQuestionIndex >= currentQuiz.length) {
      return <div>No questions available</div>;
    }

    const currentQuestion = currentQuiz[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / currentQuiz.length) * 100;

    return (
      <div id="generation_issue_fallback" className="container-wide py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-slate-400">
                Question {currentQuestionIndex + 1} of {currentQuiz.length}
              </span>
              <span className="text-sm font-medium text-gray-600 dark:text-slate-400">
                {currentQuestion.category} • {currentQuestion.difficulty}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              {currentQuestion.question}
            </h2>

            <div className="space-y-3 mb-6">
              {currentQuestion.options.map((option, index) => {
                let buttonClass = "w-full p-4 text-left border rounded-lg transition-all ";
                
                if (selectedAnswer === null) {
                  buttonClass += "border-gray-300 dark:border-slate-600 hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 text-gray-900 dark:text-white";
                } else if (index === currentQuestion.correctAnswer) {
                  buttonClass += "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200";
                } else if (index === selectedAnswer) {
                  buttonClass += "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200";
                } else {
                  buttonClass += "border-gray-300 dark:border-slate-600 text-gray-500 dark:text-slate-400";
                }

                return (
                  <button
                    key={index}
                    onClick={() => selectAnswer(index)}
                    disabled={selectedAnswer !== null}
                    className={buttonClass}
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span>{option}</span>
                      {selectedAnswer !== null && index === currentQuestion.correctAnswer && (
                        <Check className="h-5 w-5 text-green-600 ml-auto" />
                      )}
                      {selectedAnswer === index && index !== currentQuestion.correctAnswer && (
                        <X className="h-5 w-5 text-red-600 ml-auto" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {showResult && (
              <div className="space-y-4">
                <div className={`alert ${selectedAnswer === currentQuestion.correctAnswer ? 'alert-success' : 'alert-error'}`}>
                  {selectedAnswer === currentQuestion.correctAnswer ? (
                    <>
                      <Check className="h-5 w-5" />
                      <span>Correct! Well done!</span>
                    </>
                  ) : (
                    <>
                      <X className="h-5 w-5" />
                      <span>Incorrect. The correct answer was {String.fromCharCode(65 + currentQuestion.correctAnswer)}.</span>
                    </>
                  )}
                </div>

                {settings.showExplanations && currentQuestion.explanation && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Explanation</h4>
                    <p className="text-blue-700 dark:text-blue-300 text-sm">{currentQuestion.explanation}</p>
                  </div>
                )}

                <button
                  onClick={nextQuestion}
                  className="btn btn-primary flex items-center gap-2"
                >
                  {currentQuestionIndex < currentQuiz.length - 1 ? (
                    <>
                      Next Question
                      <ArrowRight className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Finish Quiz
                      <Target className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderStatistics = () => {
    const chartData = quizSessions.slice(0, 10).reverse().map((session, index) => ({
      name: `Quiz ${index + 1}`,
      score: session.score,
      date: new Date(session.completedAt).toLocaleDateString()
    }));

    const categoryData = CATEGORIES.map(category => {
      const categoryQuizzes = quizSessions.filter(s => s.category === category);
      return {
        name: category,
        count: categoryQuizzes.length,
        average: categoryQuizzes.length > 0 
          ? Math.round(categoryQuizzes.reduce((sum, s) => sum + s.score, 0) / categoryQuizzes.length)
          : 0
      };
    }).filter(item => item.count > 0);

    const difficultyData = DIFFICULTIES.map(difficulty => ({
      name: difficulty.charAt(0).toUpperCase() + difficulty.slice(1),
      value: stats.difficultyStats[difficulty]?.played || 0,
      average: stats.difficultyStats[difficulty]?.average || 0
    })).filter(item => item.value > 0);

    const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

    return (
      <div className="container-wide py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="stat-card bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-700">
            <div className="stat-title text-blue-600 dark:text-blue-400">Total Quizzes</div>
            <div className="stat-value text-blue-700 dark:text-blue-300">{stats.totalQuizzes}</div>
            <div className="stat-desc text-blue-500 dark:text-blue-400">Completed</div>
          </div>
          
          <div className="stat-card bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-700">
            <div className="stat-title text-green-600 dark:text-green-400">Average Score</div>
            <div className="stat-value text-green-700 dark:text-green-300">
              {stats.averageScore ? Math.round(stats.averageScore) : 0}%
            </div>
            <div className="stat-desc text-green-500 dark:text-green-400">Across all quizzes</div>
          </div>
          
          <div className="stat-card bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border border-yellow-200 dark:border-yellow-700">
            <div className="stat-title text-yellow-600 dark:text-yellow-400">Best Score</div>
            <div className="stat-value text-yellow-700 dark:text-yellow-300">{stats.bestScore}%</div>
            <div className="stat-desc text-yellow-500 dark:text-yellow-400">Personal best</div>
          </div>
          
          <div className="stat-card bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-700">
            <div className="stat-title text-purple-600 dark:text-purple-400">Accuracy</div>
            <div className="stat-value text-purple-700 dark:text-purple-300">
              {stats.totalQuestions > 0 ? Math.round((stats.correctAnswers / stats.totalQuestions) * 100) : 0}%
            </div>
            <div className="stat-desc text-purple-500 dark:text-purple-400">Overall accuracy</div>
          </div>
        </div>

        {chartData.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Score Trends</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="#3B82F6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance by Category</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="average" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {difficultyData.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Difficulty Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={difficultyData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {difficultyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {quizSessions.slice(0, 5).map(session => (
                  <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {session.category} Quiz
                      </div>
                      <div className="text-sm text-gray-500 dark:text-slate-400">
                        {new Date(session.completedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {session.score}%
                      </div>
                      <div className="text-sm text-gray-500 dark:text-slate-400">
                        {session.results.filter(r => r.isCorrect).length}/{session.totalQuestions}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {quizSessions.length === 0 && (
          <div className="card text-center py-12">
            <Trophy className="h-16 w-16 text-gray-400 dark:text-slate-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Statistics Yet</h3>
            <p className="text-gray-600 dark:text-slate-400 mb-4">
              Take your first quiz to see your performance statistics here.
            </p>
            <button
              onClick={() => setActiveTab('quiz')}
              className="btn btn-primary"
            >
              Take Your First Quiz
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderAiFeatures = () => (
    <div className="container-wide py-8">
      <div className="max-w-4xl mx-auto">
        <div className="card mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">AI-Powered Question Generation</h2>
          <p className="text-gray-600 dark:text-slate-300 mb-6">
            Use AI to generate custom quiz questions on any topic. Just describe what you'd like questions about,
            and our AI will create engaging multiple-choice questions for you.
          </p>

          <div className="space-y-4">
            <div className="form-group">
              <label className="form-label" htmlFor="ai-prompt">
                Describe the topic or subject for quiz questions
              </label>
              <textarea
                id="ai-prompt"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g., 'Ancient Egyptian civilization', 'JavaScript programming basics', 'Climate change and environment'..."
                className="input h-24 resize-none"
                disabled={aiLoading}
              />
            </div>

            <button
              onClick={generateQuestions}
              disabled={aiLoading || !aiPrompt.trim()}
              className="btn btn-primary flex items-center gap-2"
            >
              {aiLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Generating Questions...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  Generate Questions
                </>
              )}
            </button>
          </div>

          {aiError && (
            <div className="alert alert-error mt-4">
              <X className="h-5 w-5" />
              <span>{aiError}</span>
            </div>
          )}

          {aiResult && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Generated Content</h3>
              <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4 border">
                <pre className="text-sm text-gray-700 dark:text-slate-300 whitespace-pre-wrap">
                  {aiResult}
                </pre>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-4">
                <p className="text-blue-700 dark:text-blue-300 text-sm">
                  <strong>Note:</strong> AI-generated content may contain inaccuracies. Please review questions before use.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">AI Features Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
              <div className="flex items-center gap-3 mb-2">
                <Brain className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                <h4 className="font-semibold text-blue-800 dark:text-blue-200">Smart Question Generation</h4>
              </div>
              <p className="text-blue-700 dark:text-blue-300 text-sm">
                Generate questions on any topic with appropriate difficulty levels and explanations.
              </p>
            </div>

            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-700">
              <div className="flex items-center gap-3 mb-2">
                <Target className="h-6 w-6 text-green-600 dark:text-green-400" />
                <h4 className="font-semibold text-green-800 dark:text-green-200">Adaptive Content</h4>
              </div>
              <p className="text-green-700 dark:text-green-300 text-sm">
                AI adapts to your learning needs and creates personalized quiz content.
              </p>
            </div>

            <div className="p-4 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
              <div className="flex items-center gap-3 mb-2">
                <Star className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                <h4 className="font-semibold text-purple-800 dark:text-purple-200">Quality Assurance</h4>
              </div>
              <p className="text-purple-700 dark:text-purple-300 text-sm">
                Generated questions include explanations and are structured for optimal learning.
              </p>
            </div>

            <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg border border-orange-200 dark:border-orange-700">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                <h4 className="font-semibold text-orange-800 dark:text-orange-200">Continuous Learning</h4>
              </div>
              <p className="text-orange-700 dark:text-orange-300 text-sm">
                Expand your question bank continuously with fresh, relevant content.
              </p>
            </div>
          </div>
        </div>

        <AILayer
          ref={aiLayerRef}
          prompt={aiPrompt}
          onResult={handleAiResult}
          onError={(error) => setAiError(error)}
          onLoading={(loading) => setAiLoading(loading)}
        />
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="container-wide py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Settings</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quiz Preferences</h3>
              
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={settings.autoNextQuestion}
                    onChange={(e) => setSettings(prev => ({ ...prev, autoNextQuestion: e.target.checked }))}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-slate-300">Auto-advance to next question</span>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={settings.showExplanations}
                    onChange={(e) => setSettings(prev => ({ ...prev, showExplanations: e.target.checked }))}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-slate-300">Show answer explanations</span>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={settings.soundEffects}
                    onChange={(e) => setSettings(prev => ({ ...prev, soundEffects: e.target.checked }))}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-slate-300">Enable sound effects</span>
                </label>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="time-limit">Time Limit (minutes, 0 = no limit)</label>
                <select
                  id="time-limit"
                  value={settings.timeLimit}
                  onChange={(e) => setSettings(prev => ({ ...prev, timeLimit: parseInt(e.target.value) }))}
                  className="input"
                >
                  <option value={0}>No Time Limit</option>
                  <option value={5}>5 Minutes</option>
                  <option value={10}>10 Minutes</option>
                  <option value={15}>15 Minutes</option>
                  <option value={30}>30 Minutes</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Display Settings</h3>
              
              <div className="form-group">
                <label className="form-label" htmlFor="language-select">Language</label>
                <select
                  id="language-select"
                  value={settings.language}
                  onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
                  className="input"
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                  <option value="it">Italiano</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Theme</label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setIsDarkMode(false)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
                      !isDarkMode 
                        ? 'border-primary-500 bg-primary-50 text-primary-700' 
                        : 'border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300'
                    }`}
                  >
                    <Sun className="h-4 w-4" />
                    Light
                  </button>
                  <button
                    onClick={() => setIsDarkMode(true)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300' 
                        : 'border-gray-300 text-gray-700'
                    }`}
                  >
                    <Moon className="h-4 w-4" />
                    Dark
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Data Management</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 dark:text-white">Import Data</h4>
              <div className="space-y-2">
                <button
                  onClick={downloadTemplate}
                  className="btn bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700 w-full flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download CSV Template
                </button>
                <label className="btn bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700 w-full flex items-center gap-2 cursor-pointer">
                  <Upload className="h-4 w-4" />
                  Import Questions
                  <input
                    type="file"
                    accept=".json,.csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 dark:text-white">Export & Reset</h4>
              <div className="space-y-2">
                <button
                  onClick={exportData}
                  className="btn bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-700 w-full flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Export All Data
                </button>
                <button
                  onClick={() => setShowConfirmDelete(true)}
                  className="btn bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-300 dark:border-red-700 w-full flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear All Data
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
            <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Data Information</h4>
            <div className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
              <div>Total Questions: {questions.length}</div>
              <div>Quiz Sessions: {quizSessions.length}</div>
              <div>Data Storage: Browser Local Storage</div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Question Categories</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {CATEGORIES.map(category => {
              const count = questions.filter(q => q.category === category).length;
              return (
                <div key={category} className="text-center p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                  <div className="font-medium text-gray-900 dark:text-white text-sm">{category}</div>
                  <div className="text-xs text-gray-500 dark:text-slate-400">{count} questions</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {showConfirmDelete && (
        <div className="modal-backdrop" onClick={() => setShowConfirmDelete(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Confirm Data Deletion</h3>
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="text-gray-400 hover:text-gray-500"
                aria-label="Close modal"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="mt-2">
              <p className="text-gray-500 dark:text-slate-400">
                This will permanently delete all your quiz data, including questions, quiz sessions, and statistics. 
                This action cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={clearAllData}
                className="btn bg-red-600 text-white hover:bg-red-700"
              >
                Delete All Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    if (currentQuiz) {
      return renderQuizQuestion();
    }

    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'quiz':
        return renderQuizSetup();
      case 'statistics':
        return renderStatistics();
      case 'ai-features':
        return renderAiFeatures();
      case 'settings':
        return renderSettings();
      default:
        return renderDashboard();
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="text-center">
          <Brain className="h-12 w-12 text-primary-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-slate-900 ${styles.app}`}>
      {renderNavigation()}
      {renderTabs()}
      <main className="flex-1">
        {renderContent()}
      </main>
      <footer className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 py-4">
        <div className="container-wide text-center text-sm text-gray-600 dark:text-slate-400">
          Copyright © 2025 Datavtar Private Limited. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default App;