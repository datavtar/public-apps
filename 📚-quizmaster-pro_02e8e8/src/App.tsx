import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from './contexts/authContext';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import { 
  Play, 
  Settings, 
  BarChart3, 
  Trophy, 
  Brain, 
  Clock, 
  Target, 
  ChevronRight, 
  Check, 
  X, 
  ArrowLeft, 
  Download, 
  Upload, 
  Plus, 
  Edit, 
  Trash2, 
  Filter, 
  Search,
  LogOut,
  FileText,
  Star,
  TrendingUp,
  Calendar,
  User,
  Globe,
  Calculator,
  Atom,
  Dumbbell,
  Music,
  Palette,
  Code,
  Lightbulb
} from 'lucide-react';
import styles from './styles/styles.module.css';

// Types and Interfaces
interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  theme: string;
}

interface QuizTheme {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  color: string;
  questions: Question[];
}

interface QuizResult {
  id: string;
  theme: string;
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  timeSpent: number;
  date: string;
  answers: Array<{
    questionId: string;
    userAnswer: number;
    isCorrect: boolean;
    timeSpent: number;
  }>;
}

interface QuizSettings {
  language: string;
  showExplanations: boolean;
  timeLimit: number;
  difficulty: 'all' | 'easy' | 'medium' | 'hard';
  soundEffects: boolean;
}

const App: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const aiLayerRef = useRef<AILayerHandle>(null);

  // AI States
  const [promptText, setPromptText] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<any | null>(null);

  // App States
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedTheme, setSelectedTheme] = useState<QuizTheme | null>(null);
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [currentQuiz, setCurrentQuiz] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [quizStartTime, setQuizStartTime] = useState<number>(0);
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [currentResult, setCurrentResult] = useState<QuizResult | null>(null);
  const [settings, setSettings] = useState<QuizSettings>({
    language: 'English',
    showExplanations: true,
    timeLimit: 0,
    difficulty: 'all',
    soundEffects: true
  });
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [showAddQuestion, setShowAddQuestion] = useState<boolean>(false);
  const [newQuestion, setNewQuestion] = useState<Partial<Question>>({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: '',
    difficulty: 'medium',
    theme: ''
  });

  // Sample Quiz Themes with Questions
  const defaultThemes: QuizTheme[] = [
    {
      id: 'science',
      name: 'Science',
      icon: <Atom className="w-6 h-6" />,
      description: 'Test your knowledge of physics, chemistry, and biology',
      color: 'bg-blue-500',
      questions: [
        {
          id: 's1',
          question: 'What is the chemical symbol for gold?',
          options: ['Go', 'Gd', 'Au', 'Ag'],
          correctAnswer: 2,
          explanation: 'Au comes from the Latin word "aurum" meaning gold.',
          difficulty: 'easy',
          theme: 'science'
        },
        {
          id: 's2',
          question: 'Which planet is known as the Red Planet?',
          options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
          correctAnswer: 1,
          explanation: 'Mars appears red due to iron oxide (rust) on its surface.',
          difficulty: 'easy',
          theme: 'science'
        },
        {
          id: 's3',
          question: 'What is the speed of light in vacuum?',
          options: ['300,000 km/s', '299,792,458 m/s', '186,000 mph', 'All of the above'],
          correctAnswer: 1,
          explanation: 'The speed of light in vacuum is exactly 299,792,458 meters per second.',
          difficulty: 'medium',
          theme: 'science'
        },
        {
          id: 's4',
          question: 'Which organelle is known as the powerhouse of the cell?',
          options: ['Nucleus', 'Ribosome', 'Mitochondria', 'Chloroplast'],
          correctAnswer: 2,
          explanation: 'Mitochondria produce ATP, the energy currency of cells.',
          difficulty: 'medium',
          theme: 'science'
        },
        {
          id: 's5',
          question: 'What is the most abundant gas in Earth\'s atmosphere?',
          options: ['Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Argon'],
          correctAnswer: 2,
          explanation: 'Nitrogen makes up about 78% of Earth\'s atmosphere.',
          difficulty: 'easy',
          theme: 'science'
        }
      ]
    },
    {
      id: 'history',
      name: 'History',
      icon: <Globe className="w-6 h-6" />,
      description: 'Explore world history and historical events',
      color: 'bg-amber-500',
      questions: [
        {
          id: 'h1',
          question: 'In which year did World War II end?',
          options: ['1944', '1945', '1946', '1947'],
          correctAnswer: 1,
          explanation: 'World War II ended in 1945 with Japan\'s surrender in September.',
          difficulty: 'easy',
          theme: 'history'
        },
        {
          id: 'h2',
          question: 'Who was the first President of the United States?',
          options: ['Thomas Jefferson', 'John Adams', 'George Washington', 'Benjamin Franklin'],
          correctAnswer: 2,
          explanation: 'George Washington served as the first President from 1789 to 1797.',
          difficulty: 'easy',
          theme: 'history'
        },
        {
          id: 'h3',
          question: 'Which empire was ruled by Julius Caesar?',
          options: ['Greek Empire', 'Roman Empire', 'Byzantine Empire', 'Persian Empire'],
          correctAnswer: 1,
          explanation: 'Julius Caesar was a Roman general and statesman who ruled the Roman Empire.',
          difficulty: 'medium',
          theme: 'history'
        },
        {
          id: 'h4',
          question: 'The Berlin Wall fell in which year?',
          options: ['1987', '1989', '1991', '1993'],
          correctAnswer: 1,
          explanation: 'The Berlin Wall fell on November 9, 1989, marking the end of the Cold War era.',
          difficulty: 'medium',
          theme: 'history'
        },
        {
          id: 'h5',
          question: 'Which ancient wonder of the world was located in Alexandria?',
          options: ['Hanging Gardens', 'Lighthouse of Alexandria', 'Colossus of Rhodes', 'Temple of Artemis'],
          correctAnswer: 1,
          explanation: 'The Lighthouse of Alexandria was one of the Seven Wonders of the Ancient World.',
          difficulty: 'hard',
          theme: 'history'
        }
      ]
    },
    {
      id: 'sports',
      name: 'Sports',
      icon: <Dumbbell className="w-6 h-6" />,
      description: 'Test your sports knowledge and trivia',
      color: 'bg-green-500',
      questions: [
        {
          id: 'sp1',
          question: 'How many players are on a basketball team on the court at one time?',
          options: ['4', '5', '6', '7'],
          correctAnswer: 1,
          explanation: 'Each basketball team has 5 players on the court at any given time.',
          difficulty: 'easy',
          theme: 'sports'
        },
        {
          id: 'sp2',
          question: 'Which country has won the most FIFA World Cups?',
          options: ['Germany', 'Argentina', 'Brazil', 'Italy'],
          correctAnswer: 2,
          explanation: 'Brazil has won the FIFA World Cup 5 times (1958, 1962, 1970, 1994, 2002).',
          difficulty: 'medium',
          theme: 'sports'
        },
        {
          id: 'sp3',
          question: 'In tennis, what is a score of 40-40 called?',
          options: ['Match point', 'Deuce', 'Advantage', 'Set point'],
          correctAnswer: 1,
          explanation: 'When both players reach 40 points, it\'s called "deuce".',
          difficulty: 'easy',
          theme: 'sports'
        },
        {
          id: 'sp4',
          question: 'How long is a marathon race?',
          options: ['24.2 miles', '25.2 miles', '26.2 miles', '27.2 miles'],
          correctAnswer: 2,
          explanation: 'A marathon is exactly 26.2 miles or 42.195 kilometers long.',
          difficulty: 'medium',
          theme: 'sports'
        },
        {
          id: 'sp5',
          question: 'Which sport is played at Wimbledon?',
          options: ['Golf', 'Tennis', 'Cricket', 'Rugby'],
          correctAnswer: 1,
          explanation: 'Wimbledon is the world\'s oldest tennis tournament, held annually in London.',
          difficulty: 'easy',
          theme: 'sports'
        }
      ]
    },
    {
      id: 'technology',
      name: 'Technology',
      icon: <Code className="w-6 h-6" />,
      description: 'Explore the world of technology and computing',
      color: 'bg-purple-500',
      questions: [
        {
          id: 't1',
          question: 'What does "HTML" stand for?',
          options: ['Hypertext Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language', 'Hyperlink and Text Markup Language'],
          correctAnswer: 0,
          explanation: 'HTML stands for Hypertext Markup Language, used for creating web pages.',
          difficulty: 'easy',
          theme: 'technology'
        },
        {
          id: 't2',
          question: 'Who founded Microsoft?',
          options: ['Steve Jobs', 'Bill Gates', 'Larry Page', 'Mark Zuckerberg'],
          correctAnswer: 1,
          explanation: 'Bill Gates co-founded Microsoft with Paul Allen in 1975.',
          difficulty: 'easy',
          theme: 'technology'
        },
        {
          id: 't3',
          question: 'What does "AI" stand for in computing?',
          options: ['Automated Intelligence', 'Artificial Intelligence', 'Advanced Integration', 'Algorithmic Interface'],
          correctAnswer: 1,
          explanation: 'AI stands for Artificial Intelligence, the simulation of human intelligence by machines.',
          difficulty: 'easy',
          theme: 'technology'
        },
        {
          id: 't4',
          question: 'Which programming language is known as the "language of the web"?',
          options: ['Python', 'Java', 'JavaScript', 'C++'],
          correctAnswer: 2,
          explanation: 'JavaScript is called the "language of the web" as it runs in all web browsers.',
          difficulty: 'medium',
          theme: 'technology'
        },
        {
          id: 't5',
          question: 'What does "CPU" stand for?',
          options: ['Computer Processing Unit', 'Central Processing Unit', 'Core Processing Unit', 'Computer Program Unit'],
          correctAnswer: 1,
          explanation: 'CPU stands for Central Processing Unit, the brain of the computer.',
          difficulty: 'easy',
          theme: 'technology'
        }
      ]
    },
    {
      id: 'general',
      name: 'General Knowledge',
      icon: <Lightbulb className="w-6 h-6" />,
      description: 'A mix of questions from various topics',
      color: 'bg-orange-500',
      questions: [
        {
          id: 'g1',
          question: 'What is the capital of Australia?',
          options: ['Sydney', 'Melbourne', 'Canberra', 'Perth'],
          correctAnswer: 2,
          explanation: 'Canberra is the capital city of Australia, not Sydney or Melbourne.',
          difficulty: 'medium',
          theme: 'general'
        },
        {
          id: 'g2',
          question: 'Which is the largest ocean on Earth?',
          options: ['Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean', 'Pacific Ocean'],
          correctAnswer: 3,
          explanation: 'The Pacific Ocean is the largest ocean, covering about 46% of Earth\'s water surface.',
          difficulty: 'easy',
          theme: 'general'
        },
        {
          id: 'g3',
          question: 'How many continents are there?',
          options: ['5', '6', '7', '8'],
          correctAnswer: 2,
          explanation: 'There are 7 continents: Asia, Africa, North America, South America, Antarctica, Europe, and Australia.',
          difficulty: 'easy',
          theme: 'general'
        },
        {
          id: 'g4',
          question: 'What is the smallest country in the world?',
          options: ['Monaco', 'San Marino', 'Vatican City', 'Liechtenstein'],
          correctAnswer: 2,
          explanation: 'Vatican City is the smallest country in the world with an area of just 0.17 square miles.',
          difficulty: 'medium',
          theme: 'general'
        },
        {
          id: 'g5',
          question: 'Which planet is closest to the Sun?',
          options: ['Venus', 'Earth', 'Mercury', 'Mars'],
          correctAnswer: 2,
          explanation: 'Mercury is the closest planet to the Sun in our solar system.',
          difficulty: 'easy',
          theme: 'general'
        }
      ]
    }
  ];

  const [quizThemes, setQuizThemes] = useState<QuizTheme[]>(defaultThemes);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedResults = localStorage.getItem('quizResults');
    const savedSettings = localStorage.getItem('quizSettings');
    const savedThemes = localStorage.getItem('quizThemes');

    if (savedResults) {
      try {
        setQuizResults(JSON.parse(savedResults));
      } catch (error) {
        console.error('Error loading quiz results:', error);
      }
    }

    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }

    if (savedThemes) {
      try {
        setQuizThemes(JSON.parse(savedThemes));
      } catch (error) {
        console.error('Error loading themes:', error);
        setQuizThemes(defaultThemes);
      }
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('quizResults', JSON.stringify(quizResults));
  }, [quizResults]);

  useEffect(() => {
    localStorage.setItem('quizSettings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('quizThemes', JSON.stringify(quizThemes));
  }, [quizThemes]);

  // AI Functions
  const handleSendToAI = (prompt: string, file?: File) => {
    if (!prompt?.trim() && !file) {
      setAiError("Please provide a prompt or select a file to process.");
      return;
    }

    setAiResult(null);
    setAiError(null);

    try {
      aiLayerRef.current?.sendToAI(prompt, file);
    } catch (error) {
      setAiError("Failed to process AI request");
    }
  };

  const generateQuestionsWithAI = (theme: string, count: number) => {
    const prompt = `Generate ${count} multiple-choice quiz questions about ${theme}. Each question should have 4 options with one correct answer. Include explanations for correct answers. Return the response in JSON format with this structure:
    {
      "questions": [
        {
          "question": "Question text",
          "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
          "correctAnswer": 0,
          "explanation": "Explanation text",
          "difficulty": "easy|medium|hard"
        }
      ]
    }`;

    handleSendToAI(prompt);
  };

  // Quiz Functions
  const startQuiz = (theme: QuizTheme, count: number) => {
    const availableQuestions = theme.questions.filter(q => 
      settings.difficulty === 'all' || q.difficulty === settings.difficulty
    );
    
    if (availableQuestions.length === 0) {
      alert('No questions available for the selected difficulty level.');
      return;
    }

    const shuffled = [...availableQuestions].sort(() => Math.random() - 0.5);
    const selectedQuestions = shuffled.slice(0, Math.min(count, shuffled.length));
    
    setCurrentQuiz(selectedQuestions);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setQuizStartTime(Date.now());
    setQuestionStartTime(Date.now());
    setActiveTab('quiz');
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setUserAnswers(newAnswers);

    // Move to next question after a short delay
    setTimeout(() => {
      if (currentQuestionIndex < currentQuiz.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setQuestionStartTime(Date.now());
      } else {
        finishQuiz(newAnswers);
      }
    }, 1000);
  };

  const finishQuiz = (finalAnswers: number[]) => {
    const endTime = Date.now();
    const totalTime = endTime - quizStartTime;
    let correctCount = 0;

    const detailedAnswers = finalAnswers.map((answer, index) => {
      const isCorrect = answer === currentQuiz[index]?.correctAnswer;
      if (isCorrect) correctCount++;
      
      return {
        questionId: currentQuiz[index]?.id || '',
        userAnswer: answer,
        isCorrect,
        timeSpent: 0 // Individual question timing would need more complex state management
      };
    });

    const result: QuizResult = {
      id: Date.now().toString(),
      theme: selectedTheme?.name || '',
      totalQuestions: currentQuiz.length,
      correctAnswers: correctCount,
      score: Math.round((correctCount / currentQuiz.length) * 100),
      timeSpent: Math.round(totalTime / 1000),
      date: new Date().toISOString(),
      answers: detailedAnswers
    };

    setCurrentResult(result);
    setQuizResults(prev => [result, ...prev]);
    setShowResults(true);
    setActiveTab('results');
  };

  const resetQuiz = () => {
    setCurrentQuiz([]);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setShowResults(false);
    setCurrentResult(null);
    setSelectedTheme(null);
    setActiveTab('home');
  };

  // Theme Management Functions
  const addCustomQuestion = () => {
    if (!newQuestion.question || !newQuestion.theme || newQuestion.options?.some(opt => !opt?.trim())) {
      alert('Please fill in all required fields.');
      return;
    }

    const question: Question = {
      id: `custom_${Date.now()}`,
      question: newQuestion.question,
      options: newQuestion.options as string[],
      correctAnswer: newQuestion.correctAnswer || 0,
      explanation: newQuestion.explanation || '',
      difficulty: newQuestion.difficulty as 'easy' | 'medium' | 'hard',
      theme: newQuestion.theme
    };

    const updatedThemes = quizThemes.map(theme => {
      if (theme.id === newQuestion.theme) {
        return {
          ...theme,
          questions: [...theme.questions, question]
        };
      }
      return theme;
    });

    setQuizThemes(updatedThemes);
    setNewQuestion({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
      difficulty: 'medium',
      theme: ''
    });
    setShowAddQuestion(false);
  };

  const deleteQuestion = (themeId: string, questionId: string) => {
    const updatedThemes = quizThemes.map(theme => {
      if (theme.id === themeId) {
        return {
          ...theme,
          questions: theme.questions.filter(q => q.id !== questionId)
        };
      }
      return theme;
    });
    setQuizThemes(updatedThemes);
  };

  // Data Management Functions
  const exportData = () => {
    const data = {
      results: quizResults,
      settings: settings,
      themes: quizThemes
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quiz-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.results) setQuizResults(data.results);
        if (data.settings) setSettings(data.settings);
        if (data.themes) setQuizThemes(data.themes);
        alert('Data imported successfully!');
      } catch (error) {
        alert('Error importing data. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to delete all data? This action cannot be undone.')) {
      setQuizResults([]);
      setQuizThemes(defaultThemes);
      setSettings({
        language: 'English',
        showExplanations: true,
        timeLimit: 0,
        difficulty: 'all',
        soundEffects: true
      });
      localStorage.clear();
      alert('All data cleared successfully!');
    }
  };

  // Filtered and searched data
  const filteredResults = quizResults.filter(result => 
    result.theme.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getFilteredQuestions = (theme: QuizTheme) => {
    return theme.questions.filter(q => 
      filterDifficulty === 'all' || q.difficulty === filterDifficulty
    );
  };

  // Statistics calculations
  const getTotalQuestionsAnswered = () => {
    return quizResults.reduce((total, result) => total + result.totalQuestions, 0);
  };

  const getAverageScore = () => {
    if (quizResults.length === 0) return 0;
    return Math.round(quizResults.reduce((total, result) => total + result.score, 0) / quizResults.length);
  };

  const getBestScore = () => {
    if (quizResults.length === 0) return 0;
    return Math.max(...quizResults.map(result => result.score));
  };

  const getQuizzesThisWeek = () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return quizResults.filter(result => new Date(result.date) >= oneWeekAgo).length;
  };

  // Render Functions
  const renderHome = () => (
    <div id="welcome_fallback" className="container-fluid max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Welcome to QuizMaster Pro
        </h1>
        <p className="text-xl text-gray-600 dark:text-slate-300 mb-8">
          Test your knowledge across multiple topics and track your progress
        </p>
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="stat-card">
            <div className="stat-title">Questions Answered</div>
            <div className="stat-value">{getTotalQuestionsAnswered()}</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Average Score</div>
            <div className="stat-value">{getAverageScore()}%</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Best Score</div>
            <div className="stat-value">{getBestScore()}%</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">This Week</div>
            <div className="stat-value">{getQuizzesThisWeek()}</div>
          </div>
        </div>
      </div>

      {/* Quick Start Quiz */}
      <div className="card mb-8">
        <h2 className="text-2xl font-bold mb-4">Quick Start</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quizThemes.slice(0, 3).map(theme => (
            <div
              key={theme.id}
              className="p-4 border border-gray-200 dark:border-slate-600 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => {
                setSelectedTheme(theme);
                setActiveTab('setup');
              }}
            >
              <div className={`w-12 h-12 ${theme.color} rounded-lg flex items-center justify-center text-white mb-3`}>
                {theme.icon}
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{theme.name}</h3>
              <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">{theme.description}</p>
              <p className="text-xs text-gray-500 dark:text-slate-500 mt-2">
                {theme.questions.length} questions available
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Results */}
      {quizResults.length > 0 && (
        <div className="card">
          <h2 className="text-2xl font-bold mb-4">Recent Results</h2>
          <div className="space-y-3">
            {quizResults.slice(0, 5).map(result => (
              <div key={result.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">{result.theme}</div>
                  <div className="text-sm text-gray-600 dark:text-slate-400">
                    {result.correctAnswers}/{result.totalQuestions} correct • {result.score}%
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-bold ${result.score >= 80 ? 'text-green-600' : result.score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {result.score}%
                  </div>
                  <div className="text-xs text-gray-500 dark:text-slate-500">
                    {new Date(result.date).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderSetup = () => (
    <div className="container-fluid max-w-4xl mx-auto">
      <div className="card">
        <div className="flex items-center mb-6">
          <button
            onClick={() => setActiveTab('home')}
            className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300 mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Quiz Setup</h1>
        </div>

        {/* Theme Selection */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Select a Theme</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quizThemes.map(theme => (
              <div
                key={theme.id}
                id={`theme-${theme.id}`}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedTheme?.id === theme.id
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500'
                }`}
                onClick={() => setSelectedTheme(theme)}
              >
                <div className={`w-12 h-12 ${theme.color} rounded-lg flex items-center justify-center text-white mb-3`}>
                  {theme.icon}
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{theme.name}</h3>
                <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">{theme.description}</p>
                <p className="text-xs text-gray-500 dark:text-slate-500 mt-2">
                  {getFilteredQuestions(theme).length} questions available
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Question Count Selection */}
        {selectedTheme && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Number of Questions</h2>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {[5, 10, 15, 20, 25, 30].map(count => (
                <button
                  key={count}
                  id={`question-count-${count}`}
                  className={`btn transition-all ${
                    questionCount === count
                      ? 'btn-primary'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300'
                  } ${getFilteredQuestions(selectedTheme).length < count ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => setQuestionCount(count)}
                  disabled={getFilteredQuestions(selectedTheme).length < count}
                >
                  {count}
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-600 dark:text-slate-400 mt-2">
              Available: {getFilteredQuestions(selectedTheme).length} questions
            </p>
          </div>
        )}

        {/* AI Question Generation */}
        {selectedTheme && (
          <div className="mb-8 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <Brain className="w-5 h-5 mr-2" />
              AI Question Generator
            </h3>
            <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
              Generate additional questions for {selectedTheme.name} using AI
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => generateQuestionsWithAI(selectedTheme.name, 5)}
                className="btn btn-primary btn-sm"
                disabled={isAiLoading}
              >
                Generate 5 Questions
              </button>
              <button
                onClick={() => generateQuestionsWithAI(selectedTheme.name, 10)}
                className="btn btn-primary btn-sm"
                disabled={isAiLoading}
              >
                Generate 10 Questions
              </button>
            </div>
            {isAiLoading && (
              <div className="mt-3 text-sm text-blue-600 dark:text-blue-400">
                Generating questions... Please wait.
              </div>
            )}
            {aiError && (
              <div className="mt-3 text-sm text-red-600 dark:text-red-400">
                Error: {aiError}
              </div>
            )}
          </div>
        )}

        {/* Start Quiz Button */}
        {selectedTheme && (
          <div className="text-center">
            <button
              id="start-quiz-button"
              onClick={() => startQuiz(selectedTheme, questionCount)}
              className="btn btn-primary btn-lg"
              disabled={getFilteredQuestions(selectedTheme).length === 0}
            >
              <Play className="w-5 h-5 mr-2" />
              Start Quiz
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderQuiz = () => {
    if (currentQuiz.length === 0) return null;

    const currentQuestion = currentQuiz[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / currentQuiz.length) * 100;
    const hasAnswered = userAnswers[currentQuestionIndex] !== undefined;

    return (
      <div className="container-fluid max-w-4xl mx-auto">
        <div className="card">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                Question {currentQuestionIndex + 1} of {currentQuiz.length}
              </span>
              <span className="text-sm text-gray-600 dark:text-slate-400">
                {Math.round(progress)}% Complete
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Question */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {currentQuestion?.question}
            </h2>
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-slate-400">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                currentQuestion?.difficulty === 'easy' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                currentQuestion?.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                {currentQuestion?.difficulty}
              </span>
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {Math.round((Date.now() - questionStartTime) / 1000)}s
              </span>
            </div>
          </div>

          {/* Answer Options */}
          <div className="space-y-3 mb-8">
            {currentQuestion?.options.map((option, index) => {
              const isSelected = userAnswers[currentQuestionIndex] === index;
              const isCorrect = index === currentQuestion.correctAnswer;
              const showResult = hasAnswered;

              return (
                <button
                  key={index}
                  onClick={() => !hasAnswered && handleAnswerSelect(index)}
                  disabled={hasAnswered}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                    !showResult
                      ? 'border-gray-200 dark:border-slate-600 hover:border-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                      : isSelected && isCorrect
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : isSelected && !isCorrect
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                      : isCorrect
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-200 dark:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900 dark:text-white">{option}</span>
                    {showResult && (
                      <div className="flex items-center ml-2">
                        {isSelected && isCorrect && <Check className="w-5 h-5 text-green-600" />}
                        {isSelected && !isCorrect && <X className="w-5 h-5 text-red-600" />}
                        {!isSelected && isCorrect && <Check className="w-5 h-5 text-green-600" />}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {hasAnswered && settings.showExplanations && currentQuestion?.explanation && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
              <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">Explanation:</h4>
              <p className="text-blue-800 dark:text-blue-300">{currentQuestion.explanation}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderResults = () => {
    if (!currentResult) return null;

    const scoreColor = currentResult.score >= 80 ? 'text-green-600' : 
                     currentResult.score >= 60 ? 'text-yellow-600' : 'text-red-600';

    return (
      <div className="container-fluid max-w-4xl mx-auto">
        <div className="card text-center mb-8">
          <div className="mb-6">
            <Trophy className={`w-16 h-16 mx-auto mb-4 ${scoreColor}`} />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Quiz Complete!</h1>
            <p className="text-xl text-gray-600 dark:text-slate-300">
              You scored {currentResult.correctAnswers} out of {currentResult.totalQuestions} questions
            </p>
          </div>

          <div className={`text-6xl font-bold mb-6 ${scoreColor}`}>
            {currentResult.score}%
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="stat-card">
              <div className="stat-title">Score</div>
              <div className="stat-value">{currentResult.score}%</div>
            </div>
            <div className="stat-card">
              <div className="stat-title">Correct</div>
              <div className="stat-value">{currentResult.correctAnswers}</div>
            </div>
            <div className="stat-card">
              <div className="stat-title">Total</div>
              <div className="stat-value">{currentResult.totalQuestions}</div>
            </div>
            <div className="stat-card">
              <div className="stat-title">Time</div>
              <div className="stat-value">{currentResult.timeSpent}s</div>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={resetQuiz}
              className="btn btn-primary"
            >
              <Play className="w-4 h-4 mr-2" />
              Take Another Quiz
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              View Analytics
            </button>
          </div>
        </div>

        {/* Detailed Results */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-4">Question Review</h2>
          <div className="space-y-4">
            {currentQuiz.map((question, index) => {
              const userAnswer = currentResult.answers[index];
              const isCorrect = userAnswer?.isCorrect;

              return (
                <div key={question.id} className="p-4 border border-gray-200 dark:border-slate-600 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {isCorrect ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                        {index + 1}. {question.question}
                      </h4>
                      <div className="space-y-1 text-sm">
                        <p className="text-gray-600 dark:text-slate-400">
                          Your answer: <span className={isCorrect ? 'text-green-600' : 'text-red-600'}>
                            {question.options[userAnswer?.userAnswer || 0]}
                          </span>
                        </p>
                        {!isCorrect && (
                          <p className="text-gray-600 dark:text-slate-400">
                            Correct answer: <span className="text-green-600">
                              {question.options[question.correctAnswer]}
                            </span>
                          </p>
                        )}
                        {question.explanation && (
                          <p className="text-blue-600 dark:text-blue-400 mt-2">
                            {question.explanation}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderAnalytics = () => (
    <div id="analytics-tab" className="container-fluid max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Quiz Analytics</h1>
        
        {/* Search and Filter */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by theme..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="stat-card">
            <div className="stat-title">Total Quizzes</div>
            <div className="stat-value">{quizResults.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Questions Answered</div>
            <div className="stat-value">{getTotalQuestionsAnswered()}</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Average Score</div>
            <div className="stat-value">{getAverageScore()}%</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Best Score</div>
            <div className="stat-value">{getBestScore()}%</div>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="card">
        <h2 className="text-2xl font-bold mb-4">Quiz History</h2>
        {filteredResults.length > 0 ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th className="table-header">Date</th>
                  <th className="table-header">Theme</th>
                  <th className="table-header">Score</th>
                  <th className="table-header">Questions</th>
                  <th className="table-header">Time</th>
                  <th className="table-header">Performance</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                {filteredResults.map(result => (
                  <tr key={result.id}>
                    <td className="table-cell">
                      {new Date(result.date).toLocaleDateString()}
                    </td>
                    <td className="table-cell font-medium">{result.theme}</td>
                    <td className="table-cell">
                      <span className={`font-bold ${
                        result.score >= 80 ? 'text-green-600' : 
                        result.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {result.score}%
                      </span>
                    </td>
                    <td className="table-cell">
                      {result.correctAnswers}/{result.totalQuestions}
                    </td>
                    <td className="table-cell">{result.timeSpent}s</td>
                    <td className="table-cell">
                      <div className="flex items-center">
                        {result.score >= 90 && <Star className="w-4 h-4 text-yellow-500 mr-1" />}
                        {result.score >= 80 ? 'Excellent' : 
                         result.score >= 60 ? 'Good' : 'Needs Practice'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <BarChart3 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-slate-400">No quiz results found.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderSettings = () => (
    <div id="settings-tab" className="container-fluid max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Settings</h1>

      {/* Quiz Settings */}
      <div className="card mb-8">
        <h2 className="text-2xl font-bold mb-4">Quiz Preferences</h2>
        <div className="space-y-6">
          <div>
            <label className="form-label">Default Difficulty</label>
            <select
              value={settings.difficulty}
              onChange={(e) => setSettings(prev => ({ ...prev, difficulty: e.target.value as any }))}
              className="input"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div>
            <label className="form-label">Language</label>
            <select
              value={settings.language}
              onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
              className="input"
            >
              <option value="English">English</option>
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
              <option value="German">German</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="form-label">Show Explanations</label>
              <p className="text-sm text-gray-600 dark:text-slate-400">
                Display explanations after answering questions
              </p>
            </div>
            <button
              onClick={() => setSettings(prev => ({ ...prev, showExplanations: !prev.showExplanations }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.showExplanations ? 'bg-primary-600' : 'bg-gray-200 dark:bg-slate-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.showExplanations ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="form-label">Sound Effects</label>
              <p className="text-sm text-gray-600 dark:text-slate-400">
                Play sounds for correct/incorrect answers
              </p>
            </div>
            <button
              onClick={() => setSettings(prev => ({ ...prev, soundEffects: !prev.soundEffects }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.soundEffects ? 'bg-primary-600' : 'bg-gray-200 dark:bg-slate-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.soundEffects ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Question Management */}
      <div className="card mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Question Management</h2>
          <button
            onClick={() => setShowAddQuestion(true)}
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Question
          </button>
        </div>

        {/* Filter */}
        <div className="flex gap-4 mb-4">
          <select
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
            className="input"
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        {/* Questions by Theme */}
        <div className="space-y-4">
          {quizThemes.map(theme => {
            const filteredQuestions = getFilteredQuestions(theme);
            if (filteredQuestions.length === 0) return null;

            return (
              <div key={theme.id} className="border border-gray-200 dark:border-slate-600 rounded-lg">
                <div className="p-4 bg-gray-50 dark:bg-slate-700 border-b border-gray-200 dark:border-slate-600">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 ${theme.color} rounded-lg flex items-center justify-center text-white mr-3`}>
                        {theme.icon}
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{theme.name}</h3>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-slate-400">
                      {filteredQuestions.length} questions
                    </span>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  {filteredQuestions.map(question => (
                    <div key={question.id} className="flex items-start justify-between p-3 bg-white dark:bg-slate-800 rounded border border-gray-100 dark:border-slate-700">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white mb-1">{question.question}</p>
                        <div className="flex items-center gap-2 text-xs">
                          <span className={`px-2 py-1 rounded-full ${
                            question.difficulty === 'easy' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {question.difficulty}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteQuestion(theme.id, question.id)}
                        className="btn btn-sm bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Data Management */}
      <div className="card">
        <h2 className="text-2xl font-bold mb-4">Data Management</h2>
        <div className="space-y-4">
          <div className="flex gap-4">
            <button
              onClick={exportData}
              className="btn bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-300"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </button>
            <label className="btn bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 cursor-pointer">
              <Upload className="w-4 h-4 mr-2" />
              Import Data
              <input
                type="file"
                accept=".json"
                onChange={importData}
                className="hidden"
              />
            </label>
          </div>
          <div className="border-t border-gray-200 dark:border-slate-600 pt-4">
            <button
              onClick={clearAllData}
              className="btn bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All Data
            </button>
            <p className="text-sm text-gray-600 dark:text-slate-400 mt-2">
              This will permanently delete all quiz results and custom questions.
            </p>
          </div>
        </div>
      </div>

      {/* Add Question Modal */}
      {showAddQuestion && (
        <div className="modal-backdrop" onClick={() => setShowAddQuestion(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Add New Question</h3>
              <button
                onClick={() => setShowAddQuestion(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="form-label">Theme</label>
                <select
                  value={newQuestion.theme}
                  onChange={(e) => setNewQuestion(prev => ({ ...prev, theme: e.target.value }))}
                  className="input"
                  required
                >
                  <option value="">Select a theme</option>
                  {quizThemes.map(theme => (
                    <option key={theme.id} value={theme.id}>{theme.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Question</label>
                <textarea
                  value={newQuestion.question}
                  onChange={(e) => setNewQuestion(prev => ({ ...prev, question: e.target.value }))}
                  className="input"
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="form-label">Answer Options</label>
                {newQuestion.options?.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correctAnswer"
                      checked={newQuestion.correctAnswer === index}
                      onChange={() => setNewQuestion(prev => ({ ...prev, correctAnswer: index }))}
                      className="w-4 h-4"
                    />
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...(newQuestion.options || [])];
                        newOptions[index] = e.target.value;
                        setNewQuestion(prev => ({ ...prev, options: newOptions }));
                      }}
                      className="input flex-1"
                      placeholder={`Option ${index + 1}`}
                      required
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="form-label">Difficulty</label>
                <select
                  value={newQuestion.difficulty}
                  onChange={(e) => setNewQuestion(prev => ({ ...prev, difficulty: e.target.value as any }))}
                  className="input"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="form-label">Explanation (Optional)</label>
                <textarea
                  value={newQuestion.explanation}
                  onChange={(e) => setNewQuestion(prev => ({ ...prev, explanation: e.target.value }))}
                  className="input"
                  rows={2}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                onClick={() => setShowAddQuestion(false)}
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={addCustomQuestion}
                className="btn btn-primary"
              >
                Add Question
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Process AI response for question generation
  useEffect(() => {
    if (aiResult && selectedTheme) {
      try {
        const parsedResult = JSON.parse(aiResult);
        if (parsedResult.questions && Array.isArray(parsedResult.questions)) {
          const newQuestions: Question[] = parsedResult.questions.map((q: any, index: number) => ({
            id: `ai_${Date.now()}_${index}`,
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation || '',
            difficulty: q.difficulty || 'medium',
            theme: selectedTheme.id
          }));

          const updatedThemes = quizThemes.map(theme => {
            if (theme.id === selectedTheme.id) {
              return {
                ...theme,
                questions: [...theme.questions, ...newQuestions]
              };
            }
            return theme;
          });

          setQuizThemes(updatedThemes);
          setAiResult(null);
          alert(`${newQuestions.length} questions added successfully!`);
        }
      } catch (error) {
        console.error('Error parsing AI response:', error);
      }
    }
  }, [aiResult, selectedTheme, quizThemes]);

  return (
    <div id="generation_issue_fallback" className="min-h-screen bg-gray-50 dark:bg-slate-900 theme-transition">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-slate-700 theme-transition">
        <div className="container-fluid">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Brain className="w-8 h-8 text-primary-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">QuizMaster Pro</h1>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <button
                id="home-tab"
                onClick={() => setActiveTab('home')}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'home' 
                    ? 'text-primary-600 border-b-2 border-primary-600' 
                    : 'text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Home
              </button>
              <button
                id="setup-tab"
                onClick={() => setActiveTab('setup')}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'setup' 
                    ? 'text-primary-600 border-b-2 border-primary-600' 
                    : 'text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                New Quiz
              </button>
              <button
                id="analytics-tab-nav"
                onClick={() => setActiveTab('analytics')}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'analytics' 
                    ? 'text-primary-600 border-b-2 border-primary-600' 
                    : 'text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Analytics
              </button>
              <button
                id="settings-tab-nav"
                onClick={() => setActiveTab('settings')}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'settings' 
                    ? 'text-primary-600 border-b-2 border-primary-600' 
                    : 'text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Settings
              </button>
            </nav>

            <div className="flex items-center space-x-4">
              {currentUser && (
                <>
                  <span className="text-sm text-gray-600 dark:text-slate-300">
                    Welcome, {currentUser.first_name}
                  </span>
                  <button
                    onClick={logout}
                    className="btn btn-sm bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300"
                  >
                    <LogOut className="w-4 h-4 mr-1" />
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <div className="md:hidden bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
        <div className="container-fluid">
          <div className="flex space-x-1 py-2">
            {[
              { id: 'home', label: 'Home' },
              { id: 'setup', label: 'New Quiz' },
              { id: 'analytics', label: 'Analytics' },
              { id: 'settings', label: 'Settings' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-3 py-2 text-xs font-medium rounded transition-colors ${
                  activeTab === tab.id 
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200' 
                    : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="py-8">
        {activeTab === 'home' && renderHome()}
        {activeTab === 'setup' && renderSetup()}
        {activeTab === 'quiz' && renderQuiz()}
        {activeTab === 'results' && renderResults()}
        {activeTab === 'analytics' && renderAnalytics()}
        {activeTab === 'settings' && renderSettings()}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 py-8 theme-transition">
        <div className="container-fluid text-center">
          <p className="text-gray-600 dark:text-slate-400">
            Copyright © 2025 Datavtar Private Limited. All rights reserved.
          </p>
        </div>
      </footer>

      {/* AI Layer Component */}
      <AILayer
        ref={aiLayerRef}
        prompt={promptText}
        attachment={selectedFile || undefined}
        onResult={(result) => setAiResult(result)}
        onError={(error) => setAiError(error)}
        onLoading={(loading) => setIsAiLoading(loading)}
      />
    </div>
  );
};

export default App;