import React, { useState, useRef } from 'react';
import { MessageCircle, Scale, Phone, Mail, MapPin, FileText, Users, Shield, ChevronRight, Menu, X, Bot, User, Send, Home, Info, Phone as PhoneIcon, Settings as SettingsIcon, Download, Trash2 } from 'lucide-react';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import AdminLogin from './components/AdminLogin';
import styles from './styles/styles.module.css';

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  message: string;
  timestamp: Date;
}

interface UserData {
  name?: string;
  email?: string;
  phone?: string;
  situation?: string;
}

type Page = 'home' | 'about' | 'resources' | 'chat' | 'settings';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'bot',
      message: 'Hello! I\'m here to help you check your eligibility for the Richmond Bar Foundation\'s Eviction Diversion Program. This program provides free legal assistance to qualifying tenants facing eviction. May I ask about your current situation?',
      timestamp: new Date()
    }
  ]);
  const [userInput, setUserInput] = useState('');
  const [userData, setUserData] = useState<UserData>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [result, setResult] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      return savedMode === 'true' || 
        (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  const aiLayerRef = useRef<AILayerHandle>(null);

  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  React.useEffect(() => {
    const savedMessages = localStorage.getItem('chatMessages');
    const savedUserData = localStorage.getItem('userData');
    
    if (savedMessages) {
      try {
        const messages = JSON.parse(savedMessages).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setChatMessages(messages);
      } catch (e) {
        console.error('Error loading saved messages:', e);
      }
    }
    
    if (savedUserData) {
      try {
        setUserData(JSON.parse(savedUserData));
      } catch (e) {
        console.error('Error loading saved user data:', e);
      }
    }
  }, []);

  React.useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(chatMessages));
  }, [chatMessages]);

  React.useEffect(() => {
    localStorage.setItem('userData', JSON.stringify(userData));
  }, [userData]);

  React.useEffect(() => {
    if (result) {
      const botMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'bot',
        message: result,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, botMessage]);
      setResult(null);
    }
  }, [result]);

  const handleSendMessage = () => {
    if (!userInput.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      message: userInput,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);

    const contextualPrompt = `You are an AI assistant for the Richmond Bar Foundation's Eviction Diversion Program. Help users determine their eligibility for free legal assistance.

Program Eligibility Requirements:
- Must be a tenant facing eviction in Richmond, Virginia
- Household income must be at or below 80% of Area Median Income (AMI)
- Must be willing to participate in mediation process
- Eviction case must be non-payment of rent (not lease violations)
- Must apply before final eviction hearing
- Must be willing to work with landlord on payment plan or other resolution

User's message: "${userInput}"
Previous conversation context: ${chatMessages.slice(-3).map(m => `${m.type}: ${m.message}`).join('\n')}

Provide helpful, empathetic guidance. If eligible, explain next steps. If not eligible, suggest alternative resources. Ask follow-up questions to better assess eligibility when needed. Keep responses conversational and supportive.`;

    setError(null);
    setUserInput('');
    
    try {
      aiLayerRef.current?.sendToAI(contextualPrompt);
    } catch (error) {
      setError('Failed to process your request. Please try again.');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearAllData = () => {
    setChatMessages([
      {
        id: '1',
        type: 'bot',
        message: 'Hello! I\'m here to help you check your eligibility for the Richmond Bar Foundation\'s Eviction Diversion Program. This program provides free legal assistance to qualifying tenants facing eviction. May I ask about your current situation?',
        timestamp: new Date()
      }
    ]);
    setUserData({});
    localStorage.removeItem('chatMessages');
    localStorage.removeItem('userData');
  };

  const downloadChatHistory = () => {
    const csvContent = chatMessages.map(msg => 
      `"${msg.timestamp.toISOString()}","${msg.type}","${msg.message.replace(/"/g, '""')}"`
    ).join('\n');
    
    const header = '"Timestamp","Type","Message"\n';
    const csv = header + csvContent;
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-history-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderNavigation = () => (
    <nav className="bg-white dark:bg-slate-800 shadow-lg sticky top-0 z-50 theme-transition">
      <div className="container-wide">
        <div className="flex-between py-4">
          <div className="flex items-center gap-4">
            <Scale className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Richmond Bar Foundation</h1>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => setCurrentPage('home')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                currentPage === 'home' 
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
                  : 'text-gray-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400'
              }`}
              id="nav-home"
            >
              <Home className="h-4 w-4" />
              Home
            </button>
            <button
              onClick={() => setCurrentPage('about')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                currentPage === 'about' 
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
                  : 'text-gray-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400'
              }`}
            >
              <Info className="h-4 w-4" />
              About Program
            </button>
            <button
              onClick={() => setCurrentPage('chat')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                currentPage === 'chat' 
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
                  : 'text-gray-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400'
              }`}
              id="nav-chat"
            >
              <MessageCircle className="h-4 w-4" />
              Check Eligibility
            </button>
            <button
              onClick={() => setCurrentPage('resources')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                currentPage === 'resources' 
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
                  : 'text-gray-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400'
              }`}
            >
              <PhoneIcon className="h-4 w-4" />
              Resources
            </button>
            <button
              onClick={() => setCurrentPage('settings')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                currentPage === 'settings' 
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
                  : 'text-gray-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400'
              }`}
            >
              <SettingsIcon className="h-4 w-4" />
              Settings
            </button>
          </div>
          
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-700"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4 border-t dark:border-slate-700">
            <div className="flex flex-col gap-2 mt-4">
              <button
                onClick={() => {
                  setCurrentPage('home');
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-left ${
                  currentPage === 'home' 
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
                    : 'text-gray-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400'
                }`}
              >
                <Home className="h-4 w-4" />
                Home
              </button>
              <button
                onClick={() => {
                  setCurrentPage('about');
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-left ${
                  currentPage === 'about' 
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
                    : 'text-gray-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400'
                }`}
              >
                <Info className="h-4 w-4" />
                About Program
              </button>
              <button
                onClick={() => {
                  setCurrentPage('chat');
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-left ${
                  currentPage === 'chat' 
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
                    : 'text-gray-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400'
                }`}
              >
                <MessageCircle className="h-4 w-4" />
                Check Eligibility
              </button>
              <button
                onClick={() => {
                  setCurrentPage('resources');
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-left ${
                  currentPage === 'resources' 
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
                    : 'text-gray-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400'
                }`}
              >
                <PhoneIcon className="h-4 w-4" />
                Resources
              </button>
              <button
                onClick={() => {
                  setCurrentPage('settings');
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-left ${
                  currentPage === 'settings' 
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
                    : 'text-gray-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400'
                }`}
              >
                <SettingsIcon className="h-4 w-4" />
                Settings
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );

  const renderHomePage = () => (
    <div className="min-h-screen" id="welcome_fallback">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-800 py-16 theme-transition">
        <div className="container-wide">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6" id="generation_issue_fallback">
              Eviction Diversion Program
            </h1>
            <p className="text-xl text-gray-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto">
              Free legal assistance for Richmond tenants facing eviction. Get help with mediation, payment plans, and legal representation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setCurrentPage('chat')}
                className="btn btn-primary btn-lg flex items-center gap-2 justify-center" 
                id="hero-check-eligibility"
              >
                <MessageCircle className="h-5 w-5" />
                Check Your Eligibility
              </button>
              <button
                onClick={() => setCurrentPage('about')}
                className="btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 btn-lg flex items-center gap-2 justify-center dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-600"
              >
                <Info className="h-5 w-5" />
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-slate-800 theme-transition">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">How We Can Help</h2>
            <p className="text-lg text-gray-600 dark:text-slate-300 max-w-2xl mx-auto">
              Our program provides comprehensive support to help you avoid eviction and find sustainable housing solutions.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card text-center" id="feature-legal-representation">
              <div className="flex-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4 dark:bg-blue-900">
                <Scale className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Legal Representation</h3>
              <p className="text-gray-600 dark:text-slate-300">
                Free legal assistance from qualified attorneys who specialize in housing law and tenant rights.
              </p>
            </div>
            
            <div className="card text-center">
              <div className="flex-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-4 dark:bg-green-900">
                <Users className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Mediation Services</h3>
              <p className="text-gray-600 dark:text-slate-300">
                Professional mediation between you and your landlord to find mutually acceptable solutions.
              </p>
            </div>
            
            <div className="card text-center">
              <div className="flex-center w-16 h-16 bg-purple-100 rounded-full mx-auto mb-4 dark:bg-purple-900">
                <Shield className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Housing Stability</h3>
              <p className="text-gray-600 dark:text-slate-300">
                Support in creating sustainable payment plans and accessing additional housing resources.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 dark:bg-blue-800 theme-transition">
        <div className="container-wide text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Don't Wait - Get Help Today</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Time is critical in eviction cases. Our eligibility checker takes just a few minutes and can help you understand your options.
          </p>
          <button
            onClick={() => setCurrentPage('chat')}
            className="btn bg-white text-blue-600 hover:bg-blue-50 btn-lg flex items-center gap-2 justify-center mx-auto"
            id="cta-check-eligibility"
          >
            <Bot className="h-5 w-5" />
            Start Eligibility Check
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </section>
    </div>
  );

  const renderAboutPage = () => (
    <div className="min-h-screen py-8">
      <div className="container-wide">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">About the Eviction Diversion Program</h1>
          
          <div className="space-y-8">
            <div className="card">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Program Overview</h2>
              <p className="text-gray-600 dark:text-slate-300 mb-4">
                The Richmond Bar Foundation's Eviction Diversion Program provides free legal assistance to qualifying tenants facing eviction in Richmond, Virginia. Our goal is to help families stay in their homes through mediation, legal representation, and sustainable solutions.
              </p>
              <p className="text-gray-600 dark:text-slate-300">
                Since its inception, the program has helped hundreds of families avoid eviction and maintain housing stability through collaborative problem-solving and legal advocacy.
              </p>
            </div>

            <div className="card">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Eligibility Requirements</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-600 dark:text-slate-300">Must be a tenant facing eviction in Richmond, Virginia</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-600 dark:text-slate-300">Household income at or below 80% of Area Median Income (AMI)</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-600 dark:text-slate-300">Willing to participate in mediation process</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-600 dark:text-slate-300">Eviction case must be for non-payment of rent (not lease violations)</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-600 dark:text-slate-300">Must apply before final eviction hearing</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-600 dark:text-slate-300">Willing to work with landlord on payment plan or other resolution</p>
                </div>
              </div>
            </div>

            <div className="card">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Services Provided</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Legal Services</h3>
                  <ul className="space-y-2 text-gray-600 dark:text-slate-300">
                    <li>• Court representation</li>
                    <li>• Legal advice and consultation</li>
                    <li>• Document preparation</li>
                    <li>• Rights education</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Mediation Support</h3>
                  <ul className="space-y-2 text-gray-600 dark:text-slate-300">
                    <li>• Landlord-tenant mediation</li>
                    <li>• Payment plan negotiation</li>
                    <li>• Settlement agreements</li>
                    <li>• Communication facilitation</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="card bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700">
              <h2 className="text-2xl font-semibold text-blue-900 dark:text-blue-100 mb-4">Ready to Get Started?</h2>
              <p className="text-blue-700 dark:text-blue-200 mb-4">
                Use our eligibility checker to see if you qualify for assistance. The process is quick, confidential, and designed to help you understand your options.
              </p>
              <button
                onClick={() => setCurrentPage('chat')}
                className="btn bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
              >
                <MessageCircle className="h-4 w-4" />
                Check Your Eligibility
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderChatPage = () => (
    <div className="min-h-screen py-8">
      <div className="container-wide">
        <div className="max-w-4xl mx-auto">
          <div className="card p-0 overflow-hidden" id="chat-container">
            {/* Chat Header */}
            <div className="bg-blue-600 text-white p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex-center">
                  <Bot className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Eligibility Assistant</h2>
                  <p className="text-blue-100">I'll help you check if you qualify for our program</p>
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="h-96 overflow-y-auto p-6 space-y-4 bg-gray-50 dark:bg-slate-700" id="chat-messages">
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.type === 'bot' && (
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-sm lg:max-w-md p-3 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white dark:bg-slate-600 text-gray-900 dark:text-white shadow-sm'
                    }`}
                  >
                    <p className="text-sm">{message.message}</p>
                    <p className={`text-xs mt-1 ${
                      message.type === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-slate-400'
                    }`}>
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                  {message.type === 'user' && (
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex-center flex-shrink-0">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-white dark:bg-slate-600 p-3 rounded-lg shadow-sm">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              )}
              
              {error && (
                <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4">
                  <p className="text-red-800 dark:text-red-200 text-sm">
                    Sorry, I encountered an error. Please try again or contact our support team if the problem persists.
                  </p>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="p-6 border-t dark:border-slate-600">
              <div className="flex gap-3">
                <textarea
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Describe your situation or ask about eligibility..."
                  className="input flex-1 resize-none"
                  rows={2}
                  disabled={isLoading}
                  id="chat-input"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isLoading || !userInput.trim()}
                  className="btn btn-primary flex items-center gap-2 self-end disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-4 w-4" />
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderResourcesPage = () => (
    <div className="min-h-screen py-8">
      <div className="container-wide">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Resources & Contact</h1>
          
          <div className="space-y-8">
            {/* Contact Information */}
            <div className="card">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Contact Information</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Phone</h3>
                      <p className="text-gray-600 dark:text-slate-300">(804) 775-0200</p>
                      <p className="text-sm text-gray-500 dark:text-slate-400">Monday - Friday, 9 AM - 5 PM</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Email</h3>
                      <p className="text-gray-600 dark:text-slate-300">eviction@richmondbar.org</p>
                      <p className="text-sm text-gray-500 dark:text-slate-400">We respond within 24 hours</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Office Location</h3>
                      <p className="text-gray-600 dark:text-slate-300">
                        Richmond Bar Foundation<br />
                        100 North 9th Street<br />
                        Richmond, VA 23219
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Online Application</h3>
                      <p className="text-gray-600 dark:text-slate-300">Available 24/7</p>
                      <p className="text-sm text-gray-500 dark:text-slate-400">Use our eligibility checker to get started</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Resources */}
            <div className="card bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-700">
              <h2 className="text-2xl font-semibold text-red-900 dark:text-red-100 mb-4">Emergency Resources</h2>
              <div className="space-y-3">
                <div>
                  <h3 className="font-medium text-red-900 dark:text-red-100">Immediate Eviction Notice?</h3>
                  <p className="text-red-700 dark:text-red-200 text-sm">Call us immediately at (804) 775-0200 or visit our office.</p>
                </div>
                <div>
                  <h3 className="font-medium text-red-900 dark:text-red-100">After Hours Emergency</h3>
                  <p className="text-red-700 dark:text-red-200 text-sm">Contact Virginia Legal Aid Society: 1-866-534-5243</p>
                </div>
              </div>
            </div>

            {/* Additional Resources */}
            <div className="card">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Additional Resources</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Housing Assistance</h3>
                  <ul className="space-y-2 text-gray-600 dark:text-slate-300">
                    <li>• Richmond Redevelopment and Housing Authority</li>
                    <li>• Salvation Army Emergency Services</li>
                    <li>• Catholic Charities Housing Services</li>
                    <li>• Virginia Housing Development Authority</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Financial Assistance</h3>
                  <ul className="space-y-2 text-gray-600 dark:text-slate-300">
                    <li>• Virginia Rent Relief Program</li>
                    <li>• LIHEAP Energy Assistance</li>
                    <li>• Local Community Services Boards</li>
                    <li>• United Way of Greater Richmond</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="card bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700 text-center">
              <h2 className="text-2xl font-semibold text-blue-900 dark:text-blue-100 mb-4">Need Help Now?</h2>
              <p className="text-blue-700 dark:text-blue-200 mb-6">
                Don't wait until it's too late. Check your eligibility today and get the help you need.
              </p>
              <button
                onClick={() => setCurrentPage('chat')}
                className="btn bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2 mx-auto"
              >
                <MessageCircle className="h-4 w-4" />
                Start Eligibility Check
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettingsPage = () => (
    <div className="min-h-screen py-8">
      <div className="container-wide">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Settings</h1>
          
          <div className="space-y-6">
            {/* Theme Settings */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Appearance</h2>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Dark Mode</h3>
                  <p className="text-sm text-gray-600 dark:text-slate-300">Toggle dark mode theme</p>
                </div>
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    isDarkMode ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
                      isDarkMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Data Management */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Data Management</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Chat History</h3>
                    <p className="text-sm text-gray-600 dark:text-slate-300">Download your conversation history</p>
                  </div>
                  <button
                    onClick={downloadChatHistory}
                    className="btn bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </button>
                </div>
                
                <div className="flex items-center justify-between py-2">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Clear All Data</h3>
                    <p className="text-sm text-gray-600 dark:text-slate-300">Remove all saved conversations and data</p>
                  </div>
                  <button
                    onClick={clearAllData}
                    className="btn bg-red-600 text-white hover:bg-red-700 flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Clear Data
                  </button>
                </div>
              </div>
            </div>

            {/* Information */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Information</h2>
              <div className="space-y-3 text-sm text-gray-600 dark:text-slate-300">
                <div className="flex justify-between">
                  <span>Total Messages:</span>
                  <span className="font-medium">{chatMessages.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Data Storage:</span>
                  <span className="font-medium">Browser Local Storage</span>
                </div>
                <div className="flex justify-between">
                  <span>Privacy:</span>
                  <span className="font-medium">All data stays on your device</span>
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
      case 'about':
        return renderAboutPage();
      case 'chat':
        return renderChatPage();
      case 'resources':
        return renderResourcesPage();
      case 'settings':
        return renderSettingsPage();
      default:
        return renderHomePage();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 theme-transition">
      <AILayer
        ref={aiLayerRef}
        prompt=""
        onResult={(apiResult) => setResult(apiResult)}
        onError={(apiError) => setError(apiError)}
        onLoading={(loadingStatus) => setIsLoading(loadingStatus)}
      />
      
      {renderNavigation()}
      {renderCurrentPage()}
      
      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-slate-950 text-white py-8 theme-transition">
        <div className="container-wide">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <Scale className="h-6 w-6 text-blue-400" />
              <span className="text-lg font-semibold">Richmond Bar Foundation</span>
            </div>
            <div className="text-center md:text-right">
              <p className="text-gray-400 text-sm">
                Copyright © 2025 Datavtar Private Limited. All rights reserved.
              </p>
              <AdminLogin linkText="Admin Login" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;