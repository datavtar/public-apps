import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Home, Users, FileText, Settings, Phone, Mail, MapPin, ExternalLink, Menu, X, Sun, Moon, Download, Upload, Trash2, Check, AlertCircle, Info, ChevronRight, Scale, Shield, Heart, Building } from 'lucide-react';
import { useAuth } from './contexts/authContext';
import LoginForm from './components/LoginForm';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import styles from './styles/styles.module.css';

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface EligibilityResult {
  eligible: boolean;
  reasons: string[];
  nextSteps: string[];
  confidence: number;
}

interface ProgramInfo {
  title: string;
  description: string;
  requirements: string[];
  benefits: string[];
}

type PageType = 'home' | 'chatbot' | 'resources' | 'about' | 'settings';

const App: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      return savedMode === 'true' || 
        (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Chatbot state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [promptText, setPromptText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any | null>(null);
  const [eligibilityResult, setEligibilityResult] = useState<EligibilityResult | null>(null);
  const [conversationStage, setConversationStage] = useState<'greeting' | 'questioning' | 'assessment' | 'complete'>('greeting');
  
  const aiLayerRef = useRef<AILayerHandle>(null);
  
  // Settings state
  const [language, setLanguage] = useState(() => localStorage.getItem('language') || 'English');
  const [timezone, setTimezone] = useState(() => localStorage.getItem('timezone') || 'EST');
  const [programData, setProgramData] = useState<ProgramInfo>(() => {
    const saved = localStorage.getItem('programData');
    return saved ? JSON.parse(saved) : {
      title: 'Eviction Diversion Program',
      description: 'A program designed to help tenants and landlords resolve rental disputes outside of court.',
      requirements: [
        'Must be a Richmond area resident',
        'Must have received eviction notice or summons',
        'Must have income at or below 80% of Area Median Income',
        'Must be willing to participate in mediation',
        'Must not have participated in the program within the last 12 months'
      ],
      benefits: [
        'Free legal assistance',
        'Mediation services',
        'Rental assistance referrals',
        'Court representation if needed',
        'Housing stability resources'
      ]
    };
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

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('timezone', timezone);
  }, [timezone]);

  useEffect(() => {
    localStorage.setItem('programData', JSON.stringify(programData));
  }, [programData]);

  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    const savedMessages = localStorage.getItem('chatMessages');
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        if (parsed && Array.isArray(parsed)) {
          setMessages(parsed.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          })));
        } else {
          console.error('Failed to parse saved messages into an array or parsed data is null/not an array:', parsed);
          setMessages([]); // Fallback to empty messages or handle appropriately
        }
      } catch (e) {
        console.error('Failed to parse saved messages (JSON syntax error):', e);
        setMessages([]); // Fallback in case of parsing error
      }
    }
  }, []);

  useEffect(() => {
    if (result) {
      try {
        const parsedResult = JSON.parse(result);
        if (parsedResult.eligible !== undefined) {
          setEligibilityResult(parsedResult);
          setConversationStage('complete');
        }
        
        const botMessage: ChatMessage = {
          id: Date.now().toString(),
          text: parsedResult.response || result,
          isUser: false,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
      } catch (e) {
        const botMessage: ChatMessage = {
          id: Date.now().toString(),
          text: result,
          isUser: false,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
      }
      setResult(null);
    }
  }, [result]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputMessage,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    
    const context = `You are a helpful chatbot for the Richmond Bar Foundation's Eviction Diversion Program eligibility checker. 

Program Requirements:
- Must be a Richmond area resident
- Must have received eviction notice or summons
- Must have income at or below 80% of Area Median Income (AMI)
- Must be willing to participate in mediation
- Must not have participated in the program within the last 12 months

Program Benefits:
- Free legal assistance
- Mediation services
- Rental assistance referrals
- Court representation if needed
- Housing stability resources

Conversation Context: ${messages.map(m => `${m.isUser ? 'User' : 'Assistant'}: ${m.text}`).join('\n')}

User's latest message: ${inputMessage}

Please respond helpfully to determine eligibility. If you have enough information to make an assessment, respond with JSON format: {"eligible": boolean, "reasons": ["reason1", "reason2"], "nextSteps": ["step1", "step2"], "confidence": 0.8, "response": "human readable response"}

Otherwise, ask follow-up questions to gather more information about their situation.`;

    setPromptText(context);
    setInputMessage('');
    setError(null);
    
    try {
      aiLayerRef.current?.sendToAI(context);
    } catch (error) {
      setError('Failed to process AI request');
    }
  };

  const startNewConversation = () => {
    setMessages([]);
    setEligibilityResult(null);
    setConversationStage('greeting');
    
    const welcomeMessage: ChatMessage = {
      id: Date.now().toString(),
      text: "Hello! I'm here to help you check your eligibility for the Richmond Bar Foundation's Eviction Diversion Program. To get started, could you tell me about your current housing situation? Have you received an eviction notice or court summons?",
      isUser: false,
      timestamp: new Date()
    };
    
    setMessages([welcomeMessage]);
  };

  const exportData = () => {
    const data = {
      messages,
      programData,
      settings: { language, timezone },
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `richmond-bar-chatbot-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      localStorage.removeItem('chatMessages');
      localStorage.removeItem('programData');
      localStorage.removeItem('language');
      localStorage.removeItem('timezone');
      setMessages([]);
      setEligibilityResult(null);
      setLanguage('English');
      setTimezone('EST');
      setProgramData({
        title: 'Eviction Diversion Program',
        description: 'A program designed to help tenants and landlords resolve rental disputes outside of court.',
        requirements: [
          'Must be a Richmond area resident',
          'Must have received eviction notice or summons',
          'Must have income at or below 80% of Area Median Income',
          'Must be willing to participate in mediation',
          'Must not have participated in the program within the last 12 months'
        ],
        benefits: [
          'Free legal assistance',
          'Mediation services',
          'Rental assistance referrals',
          'Court representation if needed',
          'Housing stability resources'
        ]
      });
      alert('All data has been cleared.');
    }
  };

  const renderNavigation = () => (
    <nav className="bg-white dark:bg-slate-800 shadow-lg sticky top-0 z-50 theme-transition">
      <div className="container-wide">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Scale className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Richmond Bar Foundation
            </h1>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => setCurrentPage('home')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                currentPage === 'home' 
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                  : 'text-gray-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
              id="nav-home"
            >
              <Home className="h-4 w-4" />
              Home
            </button>
            <button
              onClick={() => setCurrentPage('chatbot')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                currentPage === 'chatbot'
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                  : 'text-gray-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
              id="nav-chatbot"
            >
              <MessageCircle className="h-4 w-4" />
              Eligibility Check
            </button>
            <button
              onClick={() => setCurrentPage('resources')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                currentPage === 'resources'
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                  : 'text-gray-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
              id="nav-resources"
            >
              <FileText className="h-4 w-4" />
              Resources
            </button>
            <button
              onClick={() => setCurrentPage('about')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                currentPage === 'about'
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                  : 'text-gray-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
              id="nav-about"
            >
              <Users className="h-4 w-4" />
              About
            </button>
            <button
              onClick={() => setCurrentPage('settings')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                currentPage === 'settings'
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                  : 'text-gray-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
              id="nav-settings"
            >
              <Settings className="h-4 w-4" />
              Settings
            </button>
            
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-md text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>
          
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        
        {isMobileMenuOpen && (
          <div className="md:hidden border-t dark:border-slate-700 py-2">
            <div className="flex flex-col gap-2">
              <button
                onClick={() => { setCurrentPage('home'); setIsMobileMenuOpen(false); }}
                className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                  currentPage === 'home'
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : 'text-gray-600 dark:text-slate-300'
                }`}
              >
                <Home className="h-4 w-4" />
                Home
              </button>
              <button
                onClick={() => { setCurrentPage('chatbot'); setIsMobileMenuOpen(false); }}
                className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                  currentPage === 'chatbot'
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : 'text-gray-600 dark:text-slate-300'
                }`}
              >
                <MessageCircle className="h-4 w-4" />
                Eligibility Check
              </button>
              <button
                onClick={() => { setCurrentPage('resources'); setIsMobileMenuOpen(false); }}
                className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                  currentPage === 'resources'
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : 'text-gray-600 dark:text-slate-300'
                }`}
              >
                <FileText className="h-4 w-4" />
                Resources
              </button>
              <button
                onClick={() => { setCurrentPage('about'); setIsMobileMenuOpen(false); }}
                className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                  currentPage === 'about'
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : 'text-gray-600 dark:text-slate-300'
                }`}
              >
                <Users className="h-4 w-4" />
                About
              </button>
              <button
                onClick={() => { setCurrentPage('settings'); setIsMobileMenuOpen(false); }}
                className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                  currentPage === 'settings'
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : 'text-gray-600 dark:text-slate-300'
                }`}
              >
                <Settings className="h-4 w-4" />
                Settings
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );

  const renderHomePage = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800" id="welcome_fallback">
      <div className="container-wide py-12">
        {/* Hero Section */}
        <div className="text-center mb-16" id="generation_issue_fallback">
          <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Shield className="h-4 w-4" />
            Free Legal Assistance
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Eviction Diversion Program
          </h1>
          <p className="text-xl text-gray-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto">
            Get help resolving rental disputes before they reach court. Our program provides free legal assistance, 
            mediation services, and resources to help you stay in your home.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setCurrentPage('chatbot')}
              className="btn btn-primary btn-lg inline-flex items-center gap-2"
              id="start-eligibility-check"
            >
              <MessageCircle className="h-5 w-5" />
              Check Your Eligibility
            </button>
            <button
              onClick={() => setCurrentPage('resources')}
              className="btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 btn-lg inline-flex items-center gap-2"
            >
              <FileText className="h-5 w-5" />
              View Resources
            </button>
          </div>
        </div>

        {/* Program Overview */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="card card-lg">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Program Requirements
            </h2>
            <ul className="space-y-3">
              {programData.requirements.map((req, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-slate-300">{req}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="card card-lg">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Program Benefits
            </h2>
            <ul className="space-y-3">
              {programData.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Heart className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-slate-300">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* How It Works */}
        <div className="card card-lg mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-8">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                1. Check Eligibility
              </h3>
              <p className="text-gray-600 dark:text-slate-300">
                Use our AI-powered chatbot to determine if you qualify for the program.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                2. Get Connected
              </h3>
              <p className="text-gray-600 dark:text-slate-300">
                We'll connect you with legal assistance and mediation services.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Home className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                3. Resolve Issues
              </h3>
              <p className="text-gray-600 dark:text-slate-300">
                Work with mediators to resolve disputes and maintain housing stability.
              </p>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          <div className="stat-card text-center">
            <div className="stat-value text-blue-600 dark:text-blue-400">85%</div>
            <div className="stat-title">Success Rate</div>
          </div>
          <div className="stat-card text-center">
            <div className="stat-value text-green-600 dark:text-green-400">1,200+</div>
            <div className="stat-title">Families Helped</div>
          </div>
          <div className="stat-card text-center">
            <div className="stat-value text-purple-600 dark:text-purple-400">Free</div>
            <div className="stat-title">Cost to You</div>
          </div>
          <div className="stat-card text-center">
            <div className="stat-value text-orange-600 dark:text-orange-400">24/7</div>
            <div className="stat-title">Online Access</div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="card card-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <div className="flex items-start gap-4">
            <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-xl font-semibold text-red-900 dark:text-red-300 mb-2">
                Emergency Assistance
              </h3>
              <p className="text-red-800 dark:text-red-200 mb-4">
                If you have received an eviction notice and have less than 5 days to respond, 
                please call our emergency hotline immediately.
              </p>
              <a 
                href="tel:804-783-7722" 
                className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                <Phone className="h-4 w-4" />
                (804) 783-7722
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderChatbot = () => (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="container-wide py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Eligibility Assessment
            </h1>
            <p className="text-gray-600 dark:text-slate-300">
              Chat with our AI assistant to check if you qualify for the Eviction Diversion Program
            </p>
          </div>

          <div className="card card-lg" id="chatbot-container">
            {/* Chat Messages */}
            <div className="h-96 overflow-y-auto mb-6 border border-gray-200 dark:border-slate-600 rounded-lg p-4 bg-gray-50 dark:bg-slate-800">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500 dark:text-slate-400">
                  <div className="text-center">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>Start a conversation to check your eligibility</p>
                    <button
                      onClick={startNewConversation}
                      className="btn btn-primary mt-4"
                      id="start-conversation"
                    >
                      Start Eligibility Check
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.isUser
                            ? 'bg-blue-600 text-white'
                            : 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-600'
                        }`}
                      >
                        <p className="text-sm">{message.text}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg px-4 py-2">
                        <div className="flex items-center gap-2">
                          <div className={styles.loadingDots}>
                            <div></div>
                            <div></div>
                            <div></div>
                          </div>
                          <span className="text-sm text-gray-600 dark:text-slate-400">AI is thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Eligibility Result */}
            {eligibilityResult && (
              <div className={`mb-6 p-4 rounded-lg border ${
                eligibilityResult.eligible
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
              }`}>
                <div className="flex items-start gap-3">
                  {eligibilityResult.eligible ? (
                    <Check className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
                  ) : (
                    <X className="h-6 w-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
                  )}
                  <div className="flex-1">
                    <h3 className={`text-lg font-semibold mb-2 ${
                      eligibilityResult.eligible
                        ? 'text-green-900 dark:text-green-300'
                        : 'text-red-900 dark:text-red-300'
                    }`}>
                      {eligibilityResult.eligible ? 'You appear to be eligible!' : 'You may not be eligible'}
                    </h3>
                    
                    {eligibilityResult.reasons && eligibilityResult.reasons.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-medium mb-2">Reasons:</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {eligibilityResult.reasons.map((reason, index) => (
                            <li key={index} className="text-sm">{reason}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {eligibilityResult.nextSteps && eligibilityResult.nextSteps.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Next Steps:</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {eligibilityResult.nextSteps.map((step, index) => (
                            <li key={index} className="text-sm">{step}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="mt-4 text-xs opacity-70">
                      Confidence: {Math.round((eligibilityResult.confidence || 0) * 100)}%
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Input Area */}
            {messages.length > 0 && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type your response..."
                    className="input flex-1"
                    disabled={isLoading}
                    id="chat-input"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={isLoading || !inputMessage.trim()}
                    className="btn btn-primary flex items-center gap-2"
                  >
                    <ChevronRight className="h-4 w-4" />
                    Send
                  </button>
                </div>
                
                <div className="flex justify-center">
                  <button
                    onClick={startNewConversation}
                    className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                  >
                    Start New Conversation
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                  <span className="text-red-800 dark:text-red-200">Error: {error}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <AILayer
        ref={aiLayerRef}
        prompt={promptText}
        attachment={selectedFile || undefined}
        onResult={(apiResult) => setResult(apiResult)}
        onError={(apiError) => setError(apiError)}
        onLoading={(loadingStatus) => setIsLoading(loadingStatus)}
      />
    </div>
  );

  const renderResources = () => (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="container-wide py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Helpful Resources
          </h1>
          <p className="text-xl text-gray-600 dark:text-slate-300 max-w-3xl mx-auto">
            Find additional support and information to help with your housing situation.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Emergency Resources */}
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Emergency Assistance
              </h3>
            </div>
            <p className="text-gray-600 dark:text-slate-300 mb-4">
              Immediate help for urgent housing situations.
            </p>
            <ul className="space-y-2">
              <li>
                <a href="tel:804-783-7722" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Emergency Hotline: (804) 783-7722
                </a>
              </li>
              <li>
                <a href="tel:211" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  United Way: 211
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Resources */}
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <Scale className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Legal Assistance
              </h3>
            </div>
            <p className="text-gray-600 dark:text-slate-300 mb-4">
              Free and low-cost legal help for housing issues.
            </p>
            <ul className="space-y-2">
              <li>
                <a href="https://www.valegalaid.org" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Virginia Legal Aid Society
                </a>
              </li>
              <li>
                <a href="https://www.richbar.org" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Richmond Bar Association
                </a>
              </li>
            </ul>
          </div>

          {/* Financial Assistance */}
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <Heart className="h-6 w-6 text-green-600 dark:text-green-400" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Financial Help
              </h3>
            </div>
            <p className="text-gray-600 dark:text-slate-300 mb-4">
              Programs to help with rent and utility payments.
            </p>
            <ul className="space-y-2">
              <li>
                <a href="https://www.scdhc.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  SCDHC Rental Assistance
                </a>
              </li>
              <li>
                <a href="https://www.salvationarmyrichmond.org" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Salvation Army Richmond
                </a>
              </li>
            </ul>
          </div>

          {/* Tenant Rights */}
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Know Your Rights
              </h3>
            </div>
            <p className="text-gray-600 dark:text-slate-300 mb-4">
              Information about tenant rights and landlord responsibilities.
            </p>
            <ul className="space-y-2">
              <li>
                <a href="https://www.nolo.com/legal-encyclopedia/virginia-tenant-rights" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Virginia Tenant Rights Guide
                </a>
              </li>
              <li>
                <a href="https://www.dhcd.virginia.gov" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  VA Dept. of Housing
                </a>
              </li>
            </ul>
          </div>

          {/* Housing Counseling */}
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <Users className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Housing Counseling
              </h3>
            </div>
            <p className="text-gray-600 dark:text-slate-300 mb-4">
              Professional guidance for housing decisions and challenges.
            </p>
            <ul className="space-y-2">
              <li>
                <a href="https://www.consumerfinance.gov/find-a-housing-counselor" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Find a Housing Counselor
                </a>
              </li>
              <li>
                <a href="https://www.hudexchange.info" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  HUD Exchange Resources
                </a>
              </li>
            </ul>
          </div>

          {/* Mental Health Support */}
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <Heart className="h-6 w-6 text-pink-600 dark:text-pink-400" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Mental Health Support
              </h3>
            </div>
            <p className="text-gray-600 dark:text-slate-300 mb-4">
              Counseling and support services during difficult times.
            </p>
            <ul className="space-y-2">
              <li>
                <a href="tel:988" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Crisis Lifeline: 988
                </a>
              </li>
              <li>
                <a href="https://www.richmondbehavioralhealth.org" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Richmond Behavioral Health
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Important Notice */}
        <div className="mt-12 card bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-4">
            <Info className="h-6 w-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-300 mb-2">
                Important Notice
              </h3>
              <p className="text-blue-800 dark:text-blue-200">
                This information is provided for educational purposes only and does not constitute legal advice. 
                For specific legal guidance about your situation, please consult with a qualified attorney or 
                contact our program directly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAbout = () => (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="container-wide py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              About the Richmond Bar Foundation
            </h1>
            <p className="text-xl text-gray-600 dark:text-slate-300">
              Committed to ensuring equal access to justice for all members of our community.
            </p>
          </div>

          <div className="space-y-12">
            {/* Mission */}
            <div className="card card-lg">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Our Mission
              </h2>
              <p className="text-gray-600 dark:text-slate-300 text-lg leading-relaxed">
                The Richmond Bar Foundation is dedicated to improving the administration of justice 
                and increasing access to legal services for low-income individuals and families in 
                the Richmond metropolitan area. Through innovative programs like the Eviction Diversion 
                Program, we work to prevent homelessness and promote housing stability.
              </p>
            </div>

            {/* About the Program */}
            <div className="card card-lg">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                About the Eviction Diversion Program
              </h2>
              <p className="text-gray-600 dark:text-slate-300 mb-6">
                Launched in partnership with local courts and housing organizations, the Eviction 
                Diversion Program helps tenants and landlords resolve disputes before they result 
                in eviction proceedings. Our approach focuses on:
              </p>
              <ul className="grid md:grid-cols-2 gap-4">
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-slate-300">Early intervention and mediation</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-slate-300">Financial assistance referrals</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-slate-300">Legal representation when needed</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-slate-300">Housing stability resources</span>
                </li>
              </ul>
            </div>

            {/* Contact Information */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="card">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Contact Us
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <span className="text-gray-700 dark:text-slate-300">(804) 783-7722</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <span className="text-gray-700 dark:text-slate-300">info@richbar.org</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-slate-300">
                      1510 E. Main Street<br />
                      Richmond, VA 23219
                    </span>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Office Hours
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-slate-400">Monday - Friday:</span>
                    <span className="text-gray-900 dark:text-white">9:00 AM - 5:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-slate-400">Saturday:</span>
                    <span className="text-gray-900 dark:text-white">9:00 AM - 1:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-slate-400">Sunday:</span>
                    <span className="text-gray-900 dark:text-white">Closed</span>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-slate-400 mt-3">
                    Emergency hotline available 24/7
                  </div>
                </div>
              </div>
            </div>

            {/* Partners */}
            <div className="card card-lg">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Our Partners
              </h2>
              <p className="text-gray-600 dark:text-slate-300 mb-6">
                We work closely with these organizations to provide comprehensive support:
              </p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                  <Building className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  <span className="text-gray-900 dark:text-white">Richmond City Courts</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                  <Home className="h-6 w-6 text-green-600 dark:text-green-400" />
                  <span className="text-gray-900 dark:text-white">SCDHC</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                  <Heart className="h-6 w-6 text-red-600 dark:text-red-400" />
                  <span className="text-gray-900 dark:text-white">Virginia Legal Aid</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  <span className="text-gray-900 dark:text-white">United Way</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                  <Shield className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  <span className="text-gray-900 dark:text-white">Salvation Army</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                  <Building className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-gray-900 dark:text-white">Local Churches</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="container-wide py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Settings
            </h1>
            <p className="text-gray-600 dark:text-slate-300">
              Customize your experience and manage application data
            </p>
          </div>

          <div className="space-y-6">
            {/* Language & Preferences */}
            <div className="card" id="settings-preferences">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Preferences
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="form-group">
                  <label className="form-label">Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="input"
                  >
                    <option value="English">English</option>
                    <option value="Spanish">Español</option>
                    <option value="French">Français</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Timezone</label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="input"
                  >
                    <option value="EST">Eastern Time (EST)</option>
                    <option value="CST">Central Time (CST)</option>
                    <option value="MST">Mountain Time (MST)</option>
                    <option value="PST">Pacific Time (PST)</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Theme</label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setIsDarkMode(false)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md border transition-colors ${
                      !isDarkMode
                        ? 'bg-blue-100 border-blue-300 text-blue-700'
                        : 'bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300'
                    }`}
                  >
                    <Sun className="h-4 w-4" />
                    Light
                  </button>
                  <button
                    onClick={() => setIsDarkMode(true)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md border transition-colors ${
                      isDarkMode
                        ? 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300'
                        : 'bg-white border-gray-300 text-gray-700'
                    }`}
                  >
                    <Moon className="h-4 w-4" />
                    Dark
                  </button>
                </div>
              </div>
            </div>

            {/* Program Data Management */}
            {currentUser && (
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Program Information Management
                </h2>
                
                <div className="form-group">
                  <label className="form-label">Program Title</label>
                  <input
                    type="text"
                    value={programData.title}
                    onChange={(e) => setProgramData(prev => ({ ...prev, title: e.target.value }))}
                    className="input"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Program Description</label>
                  <textarea
                    value={programData.description}
                    onChange={(e) => setProgramData(prev => ({ ...prev, description: e.target.value }))}
                    className="input"
                    rows={3}
                  />
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="form-group">
                    <label className="form-label">Requirements</label>
                    <textarea
                      value={programData.requirements.join('\n')}
                      onChange={(e) => setProgramData(prev => ({ 
                        ...prev, 
                        requirements: e.target.value.split('\n').filter(req => req.trim())
                      }))}
                      className="input"
                      rows={6}
                      placeholder="Each requirement on a new line"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Benefits</label>
                    <textarea
                      value={programData.benefits.join('\n')}
                      onChange={(e) => setProgramData(prev => ({ 
                        ...prev, 
                        benefits: e.target.value.split('\n').filter(benefit => benefit.trim())
                      }))}
                      className="input"
                      rows={6}
                      placeholder="Each benefit on a new line"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Data Management */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Data Management
              </h2>
              <p className="text-gray-600 dark:text-slate-300 mb-6">
                Export or clear your application data. All data is stored locally in your browser.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={exportData}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export Data
                </button>
                
                <button
                  onClick={clearAllData}
                  className="btn bg-red-600 text-white hover:bg-red-700 flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear All Data
                </button>
              </div>
              
              <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                      Data Storage Notice
                    </h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      All chat conversations and settings are stored locally in your browser. 
                      No data is sent to external servers except for AI processing during eligibility checks.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Usage Statistics
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="stat-card text-center">
                  <div className="stat-value text-blue-600 dark:text-blue-400">{messages.length}</div>
                  <div className="stat-title">Total Messages</div>
                </div>
                <div className="stat-card text-center">
                  <div className="stat-value text-green-600 dark:text-green-400">
                    {messages.filter(m => !m.isUser).length}
                  </div>
                  <div className="stat-title">AI Responses</div>
                </div>
                <div className="stat-card text-center">
                  <div className="stat-value text-purple-600 dark:text-purple-400">
                    {eligibilityResult ? 1 : 0}
                  </div>
                  <div className="stat-title">Assessments</div>
                </div>
                <div className="stat-card text-center">
                  <div className="stat-value text-orange-600 dark:text-orange-400">
                    {messages.length > 0 ? new Date(Math.max(...messages.map(m => new Date(m.timestamp).getTime()))).toLocaleDateString() : 'N/A'}
                  </div>
                  <div className="stat-title">Last Activity</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return renderHomePage();
      case 'chatbot':
        return renderChatbot();
      case 'resources':
        return renderResources();
      case 'about':
        return renderAbout();
      case 'settings':
        return renderSettings();
      default:
        return renderHomePage();
    }
  };

  const renderFooter = () => (
    <footer className="bg-gray-900 dark:bg-slate-950 text-white py-12">
      <div className="container-wide">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <Scale className="h-8 w-8 text-blue-400" />
              <h3 className="text-xl font-bold">Richmond Bar Foundation</h3>
            </div>
            <p className="text-gray-300 mb-4">
              Ensuring equal access to justice for all members of our community through 
              innovative programs and dedicated service.
            </p>
            <div className="flex items-center gap-4">
              <a href="tel:804-783-7722" className="flex items-center gap-2 text-blue-400 hover:text-blue-300">
                <Phone className="h-4 w-4" />
                (804) 783-7722
              </a>
              <a href="mailto:info@richbar.org" className="flex items-center gap-2 text-blue-400 hover:text-blue-300">
                <Mail className="h-4 w-4" />
                info@richbar.org
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setCurrentPage('chatbot')}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Eligibility Check
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentPage('resources')}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Resources
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentPage('about')}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  About Us
                </button>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Emergency</h4>
            <ul className="space-y-2">
              <li>
                <a href="tel:804-783-7722" className="text-gray-300 hover:text-white transition-colors">
                  Eviction Hotline
                </a>
              </li>
              <li>
                <a href="tel:211" className="text-gray-300 hover:text-white transition-colors">
                  United Way 211
                </a>
              </li>
              <li>
                <a href="tel:988" className="text-gray-300 hover:text-white transition-colors">
                  Crisis Lifeline
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              Copyright © 2025 of Datavtar Private Limited. All rights reserved.
            </p>
            
            {!currentUser ? (
              <div className="mt-4 md:mt-0">
                <LoginForm title="Admin Login" subtitle="Content Management" />
              </div>
            ) : (
              <div className="flex items-center gap-4 mt-4 md:mt-0">
                <span className="text-sm text-gray-400">
                  Admin: {currentUser.first_name} {currentUser.last_name}
                </span>
                <button
                  onClick={logout}
                  className="text-sm text-blue-400 hover:text-blue-300"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 theme-transition">
      {renderNavigation()}
      <main>
        {renderCurrentPage()}
      </main>
      {renderFooter()}
    </div>
  );
};

export default App;
