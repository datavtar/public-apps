import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, User, Bot, Settings, BarChart3, FileText, Download, Upload, Trash2, Edit, Save, X, Home, HelpCircle, Users, Shield, Moon, Sun, ChevronRight, CheckCircle, AlertCircle, ExternalLink, Phone, Mail, MapPin, Clock } from 'lucide-react';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import AdminLogin from './components/AdminLogin';
import { useAuth } from './contexts/authContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Types
interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  eligibilityData?: EligibilityData;
}

interface EligibilityData {
  isEligible: boolean;
  reasons: string[];
  nextSteps: string[];
  confidence: number;
}

interface ChatSession {
  id: string;
  messages: Message[];
  startTime: Date;
  endTime?: Date;
  userInfo?: {
    eligibilityStatus: 'eligible' | 'not-eligible' | 'needs-review';
    requirements: Record<string, boolean>;
  };
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  isActive: boolean;
}

interface AdminSettings {
  welcomeMessage: string;
  maxChatDuration: number;
  enableAnalytics: boolean;
  autoResponseDelay: number;
}

const App: React.FC = () => {
  // Auth
  const { currentUser } = useAuth();

  // Dark mode hook
  const useDarkMode = () => {
    const [isDark, setIsDark] = useState(false);
    
    useEffect(() => {
      const savedTheme = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const shouldUseDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
      
      setIsDark(shouldUseDark);
      document.documentElement.classList.toggle('dark', shouldUseDark);
      
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        if (!localStorage.getItem('theme')) {
          setIsDark(e.matches);
          document.documentElement.classList.toggle('dark', e.matches);
        }
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);
    
    const toggleDarkMode = () => {
      const newIsDark = !isDark;
      setIsDark(newIsDark);
      localStorage.setItem('theme', newIsDark ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', newIsDark);
    };
    
    return { isDark, toggleDarkMode };
  };

  const { isDark, toggleDarkMode } = useDarkMode();

  // AI Layer
  const aiLayerRef = useRef<AILayerHandle>(null);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiError, setAiError] = useState<any | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Main state
  const [activeTab, setActiveTab] = useState<'home' | 'chat' | 'resources' | 'admin'>('home');
  const [currentMessage, setCurrentMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [adminSettings, setAdminSettings] = useState<AdminSettings>({
    welcomeMessage: "Hello! I'm here to help you check your eligibility for the Richmond Bar Foundation's Eviction Diversion Program. I'll ask you a few questions to determine if you qualify for assistance.",
    maxChatDuration: 30,
    enableAnalytics: true,
    autoResponseDelay: 1000
  });

  // Admin state
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);
  const [newFAQ, setNewFAQ] = useState({ question: '', answer: '', category: 'general' });
  const [showNewFAQForm, setShowNewFAQForm] = useState(false);

  // Load data on mount
  useEffect(() => {
    loadFromStorage();
  }, []);

  // Save data when it changes
  useEffect(() => {
    saveToStorage();
  }, [chatSessions, faqs, adminSettings]);

  // Handle AI responses
  useEffect(() => {
    if (aiResult) {
      try {
        // Try to parse as JSON for eligibility assessment
        const eligibilityData = JSON.parse(aiResult);
        if (eligibilityData.isEligible !== undefined) {
          handleEligibilityResponse(eligibilityData);
        } else {
          handleRegularResponse(aiResult);
        }
      } catch {
        // If not JSON, treat as regular markdown response
        handleRegularResponse(aiResult);
      }
      setAiResult(null);
    }
  }, [aiResult]);

  const loadFromStorage = () => {
    const savedSessions = localStorage.getItem('richmond-chat-sessions');
    const savedFaqs = localStorage.getItem('richmond-faqs');
    const savedSettings = localStorage.getItem('richmond-admin-settings');

    if (savedSessions) {
      const sessions = JSON.parse(savedSessions);
      setChatSessions(sessions.map((s: any) => ({
        ...s,
        startTime: new Date(s.startTime),
        endTime: s.endTime ? new Date(s.endTime) : undefined,
        messages: s.messages.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }))
      })));
    }

    if (savedFaqs) {
      setFaqs(JSON.parse(savedFaqs));
    } else {
      // Initialize with default FAQs
      setFaqs([
        {
          id: '1',
          question: 'What is the Richmond Bar Eviction Diversion Program?',
          answer: 'The Eviction Diversion Program helps tenants and landlords resolve disputes outside of court through mediation and legal assistance.',
          category: 'general',
          isActive: true
        },
        {
          id: '2',
          question: 'Who is eligible for the program?',
          answer: 'Tenants facing eviction in Richmond who meet income requirements and have not been through the program before may be eligible.',
          category: 'eligibility',
          isActive: true
        }
      ]);
    }

    if (savedSettings) {
      setAdminSettings(JSON.parse(savedSettings));
    }
  };

  const saveToStorage = () => {
    localStorage.setItem('richmond-chat-sessions', JSON.stringify(chatSessions));
    localStorage.setItem('richmond-faqs', JSON.stringify(faqs));
    localStorage.setItem('richmond-admin-settings', JSON.stringify(adminSettings));
  };

  const startNewChat = () => {
    const session: ChatSession = {
      id: Date.now().toString(),
      messages: [
        {
          id: '1',
          text: adminSettings.welcomeMessage,
          isUser: false,
          timestamp: new Date()
        }
      ],
      startTime: new Date()
    };

    setCurrentSession(session);
    setMessages(session.messages);
    setActiveTab('chat');
  };

  const sendMessage = async () => {
    if (!currentMessage.trim() || !currentSession) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: currentMessage,
      isUser: true,
      timestamp: new Date()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setCurrentMessage('');

    // Update current session
    const updatedSession = {
      ...currentSession,
      messages: updatedMessages
    };
    setCurrentSession(updatedSession);

    // AI prompt for eligibility assessment
    const conversationHistory = updatedMessages.map(m => 
      `${m.isUser ? 'User' : 'Assistant'}: ${m.text}`
    ).join('\n');

    const prompt = `You are an eligibility assistant for the Richmond Bar Foundation's Eviction Diversion Program. Based on the conversation history, assess if the user is eligible and provide helpful guidance.

Conversation History:
${conversationHistory}

Based on Richmond Bar's Eviction Diversion Program criteria, analyze the user's situation and respond in JSON format with:
{
  "isEligible": boolean,
  "reasons": ["list of reasons for eligibility status"],
  "nextSteps": ["recommended actions for the user"],
  "confidence": number (0-100),
  "response": "conversational response to the user's message"
}

Key eligibility criteria to consider:
- Tenant facing eviction in Richmond area
- Income below certain thresholds
- Not previously used the program
- Case not yet decided by court
- Good faith effort to resolve dispute

Provide a helpful, empathetic response that guides the user through next steps.`;

    try {
      setAiError(null);
      aiLayerRef.current?.sendToAI(prompt);
    } catch (error) {
      setAiError('Failed to process your request. Please try again.');
    }
  };

  const handleEligibilityResponse = (eligibilityData: any) => {
    const botMessage: Message = {
      id: Date.now().toString(),
      text: eligibilityData.response || 'Thank you for providing that information.',
      isUser: false,
      timestamp: new Date(),
      eligibilityData: {
        isEligible: eligibilityData.isEligible,
        reasons: eligibilityData.reasons || [],
        nextSteps: eligibilityData.nextSteps || [],
        confidence: eligibilityData.confidence || 50
      }
    };

    const updatedMessages = [...messages, botMessage];
    setMessages(updatedMessages);

    if (currentSession) {
      const updatedSession = {
        ...currentSession,
        messages: updatedMessages,
        userInfo: {
          eligibilityStatus: eligibilityData.isEligible ? 'eligible' as const : 'not-eligible' as const,
          requirements: {}
        }
      };
      setCurrentSession(updatedSession);

      // Update sessions list
      const sessionIndex = chatSessions.findIndex(s => s.id === currentSession.id);
      if (sessionIndex >= 0) {
        const newSessions = [...chatSessions];
        newSessions[sessionIndex] = updatedSession;
        setChatSessions(newSessions);
      } else {
        setChatSessions([...chatSessions, updatedSession]);
      }
    }
  };

  const handleRegularResponse = (response: string) => {
    const botMessage: Message = {
      id: Date.now().toString(),
      text: response,
      isUser: false,
      timestamp: new Date()
    };

    const updatedMessages = [...messages, botMessage];
    setMessages(updatedMessages);

    if (currentSession) {
      const updatedSession = {
        ...currentSession,
        messages: updatedMessages
      };
      setCurrentSession(updatedSession);
    }
  };

  const exportChatData = () => {
    const csvContent = [
      ['Session ID', 'Start Time', 'End Time', 'Message Count', 'Eligibility Status'],
      ...chatSessions.map(session => [
        session.id,
        session.startTime.toISOString(),
        session.endTime?.toISOString() || 'Ongoing',
        session.messages.length.toString(),
        session.userInfo?.eligibilityStatus || 'Unknown'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'richmond-bar-chat-sessions.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAllData = () => {
    const confirmed = window.confirm('Are you sure you want to delete all chat data? This action cannot be undone.');
    if (confirmed) {
      setChatSessions([]);
      setCurrentSession(null);
      setMessages([]);
      localStorage.removeItem('richmond-chat-sessions');
    }
  };

  const addFAQ = () => {
    if (!newFAQ.question.trim() || !newFAQ.answer.trim()) return;

    const faq: FAQ = {
      id: Date.now().toString(),
      question: newFAQ.question,
      answer: newFAQ.answer,
      category: newFAQ.category,
      isActive: true
    };

    setFaqs([...faqs, faq]);
    setNewFAQ({ question: '', answer: '', category: 'general' });
    setShowNewFAQForm(false);
  };

  const updateFAQ = (faq: FAQ) => {
    setFaqs(faqs.map(f => f.id === faq.id ? faq : f));
    setEditingFAQ(null);
  };

  const deleteFAQ = (id: string) => {
    setFaqs(faqs.filter(f => f.id !== id));
  };

  const renderHome = () => (
    <div id="welcome_fallback" className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Shield className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Richmond Bar Foundation
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold text-blue-600 dark:text-blue-400 mb-4">
              Eviction Diversion Program
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              Get help avoiding eviction through mediation and legal assistance. 
              Check your eligibility in minutes with our AI-powered assistant.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="card card-padding card-hover bg-white dark:bg-gray-800 shadow-xl rounded-2xl">
              <MessageCircle className="w-16 h-16 text-blue-600 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Check Eligibility</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Chat with our AI assistant to determine if you qualify for the eviction diversion program.
              </p>
              <button 
                id="start-chat-button"
                onClick={startNewChat}
                className="btn btn-primary btn-lg w-full rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                Start Eligibility Check
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="card card-padding bg-white dark:bg-gray-800 shadow-xl rounded-2xl">
              <HelpCircle className="w-16 h-16 text-green-600 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Get Resources</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Access helpful resources, contact information, and frequently asked questions.
              </p>
              <button 
                id="resources-button"
                onClick={() => setActiveTab('resources')}
                className="btn btn-secondary btn-lg w-full rounded-xl"
              >
                View Resources
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Program Benefits */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-12">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Program Benefits</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h4 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Avoid Court</h4>
                <p className="text-gray-600 dark:text-gray-300">Resolve disputes through mediation instead of eviction court</p>
              </div>
              <div className="text-center">
                <Users className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h4 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Legal Support</h4>
                <p className="text-gray-600 dark:text-gray-300">Get assistance from qualified legal professionals</p>
              </div>
              <div className="text-center">
                <Clock className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <h4 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Fast Resolution</h4>
                <p className="text-gray-600 dark:text-gray-300">Quick process to help you stay in your home</p>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-blue-50 dark:bg-gray-800 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Need Immediate Help?</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex items-center justify-center gap-3 text-gray-700 dark:text-gray-300">
                <Phone className="w-5 h-5 text-blue-600" />
                <span>(804) 780-0700</span>
              </div>
              <div className="flex items-center justify-center gap-3 text-gray-700 dark:text-gray-300">
                <Mail className="w-5 h-5 text-blue-600" />
                <span>help@richmondbar.org</span>
              </div>
              <div className="flex items-center justify-center gap-3 text-gray-700 dark:text-gray-300">
                <MapPin className="w-5 h-5 text-blue-600" />
                <span>Richmond, VA</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderChat = () => (
    <div id="chat-tab" className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Chat Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">Eligibility Assistant</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isAiLoading ? 'Typing...' : 'Online'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('home')}
            className="btn btn-ghost"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-md rounded-2xl p-4 ${
              message.isUser
                ? 'bg-blue-600 text-white ml-auto'
                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
            }`}>
              {!message.isUser && (
                <div className="flex items-center gap-2 mb-2">
                  <Bot className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Assistant</span>
                </div>
              )}
              
              <div className={message.isUser ? 'text-white' : 'prose prose-sm dark:prose-invert max-w-none'}>
                {message.isUser ? (
                  message.text
                ) : (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {message.text}
                  </ReactMarkdown>
                )}
              </div>

              {message.eligibilityData && (
                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    {message.eligibilityData.isEligible ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    )}
                    <span className="font-medium text-sm">
                      {message.eligibilityData.isEligible ? 'Likely Eligible' : 'May Not Be Eligible'}
                    </span>
                  </div>
                  {message.eligibilityData.nextSteps.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Next Steps:</p>
                      <ul className="text-xs space-y-1">
                        {message.eligibilityData.nextSteps.map((step, index) => (
                          <li key={index} className="flex items-start gap-1">
                            <span className="text-blue-600 mt-0.5">•</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <div className="text-xs opacity-70 mt-2">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}

        {isAiLoading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-blue-600" />
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
        {aiError && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-400 text-sm">
              {aiError.toString()}
            </p>
          </div>
        )}
        
        <div className="flex gap-2">
          <input
            type="text"
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type your message..."
            className="input flex-1 rounded-full"
            disabled={isAiLoading}
          />
          <button
            onClick={sendMessage}
            disabled={!currentMessage.trim() || isAiLoading}
            className="btn btn-primary rounded-full w-12 h-12 flex items-center justify-center"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderResources = () => (
    <div id="resources-tab" className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Resources & Information</h1>

        {/* Emergency Contact */}
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-bold text-red-800 dark:text-red-400 mb-4">
            ⚠️ Facing Immediate Eviction?
          </h2>
          <p className="text-red-700 dark:text-red-300 mb-4">
            If you have received an eviction notice or court date, contact us immediately for urgent assistance.
          </p>
          <div className="flex flex-wrap gap-4">
            <a href="tel:+18047800700" className="btn btn-error">
              <Phone className="w-4 h-4" />
              Call (804) 780-0700
            </a>
            <a href="mailto:help@richmondbar.org" className="btn btn-secondary">
              <Mail className="w-4 h-4" />
              Email Us
            </a>
          </div>
        </div>

        {/* Program Information */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="card card-padding">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Eligibility Requirements</h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Tenant in Richmond metropolitan area</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Facing eviction proceedings</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Income below 80% of area median income</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Case not yet decided by court</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span>First time using the program</span>
              </li>
            </ul>
          </div>

          <div className="card card-padding">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Services Provided</h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <Users className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>Mediation between tenant and landlord</span>
              </li>
              <li className="flex items-start gap-2">
                <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>Legal representation and advice</span>
              </li>
              <li className="flex items-start gap-2">
                <FileText className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>Document preparation assistance</span>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>Emergency rental assistance referrals</span>
              </li>
            </ul>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="card card-padding mb-8">
          <h3 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">Frequently Asked Questions</h3>
          <div className="space-y-4">
            {faqs.filter(faq => faq.isActive).map((faq) => (
              <details key={faq.id} className="group">
                <summary className="cursor-pointer p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                  <span className="font-medium text-gray-900 dark:text-white">{faq.question}</span>
                </summary>
                <div className="p-4 text-gray-600 dark:text-gray-300">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{faq.answer}</ReactMarkdown>
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* External Resources */}
        <div className="card card-padding">
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Additional Resources</h3>
          <div className="grid gap-4">
            <a 
              href="https://www.scdhc.com/eviction-diversion-program" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
            >
              <ExternalLink className="w-5 h-5 text-blue-600" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">SCDHC Eviction Diversion Program</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">Official program information and guidelines</p>
              </div>
            </a>
            
            <a 
              href="https://www.richmondgov.com/SocialServices/EmergencyAssistance.aspx" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
            >
              <ExternalLink className="w-5 h-5 text-green-600" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Richmond Emergency Assistance</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">City of Richmond rental assistance programs</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAdmin = () => {
    if (!currentUser) {
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto text-center">
            <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Admin Access Required</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">Please log in to access the admin panel.</p>
          </div>
        </div>
      );
    }

    return (
      <div id="admin-tab" className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Welcome, {currentUser.first_name} {currentUser.last_name}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Analytics */}
            <div className="lg:col-span-2">
              <div className="card card-padding mb-8">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Chat Analytics</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="stat-card">
                    <div className="stat-title">Total Sessions</div>
                    <div className="stat-value">{chatSessions.length}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-title">Eligible Users</div>
                    <div className="stat-value text-green-600">
                      {chatSessions.filter(s => s.userInfo?.eligibilityStatus === 'eligible').length}
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-title">Not Eligible</div>
                    <div className="stat-value text-red-600">
                      {chatSessions.filter(s => s.userInfo?.eligibilityStatus === 'not-eligible').length}
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-title">Needs Review</div>
                    <div className="stat-value text-yellow-600">
                      {chatSessions.filter(s => s.userInfo?.eligibilityStatus === 'needs-review').length}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mb-4">
                  <button onClick={exportChatData} className="btn btn-primary">
                    <Download className="w-4 h-4" />
                    Export Data
                  </button>
                  <button onClick={clearAllData} className="btn btn-error">
                    <Trash2 className="w-4 h-4" />
                    Clear All Data
                  </button>
                </div>

                {/* Recent Sessions */}
                <div className="table-container">
                  <table className="table">
                    <thead className="table-header">
                      <tr>
                        <th className="table-header-cell">Session ID</th>
                        <th className="table-header-cell">Start Time</th>
                        <th className="table-header-cell">Messages</th>
                        <th className="table-header-cell">Status</th>
                      </tr>
                    </thead>
                    <tbody className="table-body">
                      {chatSessions.slice(-10).reverse().map((session) => (
                        <tr key={session.id} className="table-row">
                          <td className="table-cell font-mono text-xs">{session.id.slice(-8)}</td>
                          <td className="table-cell">{session.startTime.toLocaleDateString()}</td>
                          <td className="table-cell">{session.messages.length}</td>
                          <td className="table-cell">
                            <span className={`badge ${
                              session.userInfo?.eligibilityStatus === 'eligible' ? 'badge-success' :
                              session.userInfo?.eligibilityStatus === 'not-eligible' ? 'badge-error' :
                              'badge-gray'
                            }`}>
                              {session.userInfo?.eligibilityStatus || 'Unknown'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Settings */}
            <div>
              <div className="card card-padding mb-8">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Settings</h2>
                <div className="space-y-4">
                  <div className="form-group">
                    <label className="form-label">Welcome Message</label>
                    <textarea
                      value={adminSettings.welcomeMessage}
                      onChange={(e) => setAdminSettings({
                        ...adminSettings,
                        welcomeMessage: e.target.value
                      })}
                      className="textarea"
                      rows={3}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Max Chat Duration (minutes)</label>
                    <input
                      type="number"
                      value={adminSettings.maxChatDuration}
                      onChange={(e) => setAdminSettings({
                        ...adminSettings,
                        maxChatDuration: parseInt(e.target.value) || 30
                      })}
                      className="input"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="analytics"
                      checked={adminSettings.enableAnalytics}
                      onChange={(e) => setAdminSettings({
                        ...adminSettings,
                        enableAnalytics: e.target.checked
                      })}
                      className="checkbox"
                    />
                    <label htmlFor="analytics" className="form-label">Enable Analytics</label>
                  </div>
                </div>
              </div>

              {/* FAQ Management */}
              <div className="card card-padding">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">FAQ Management</h2>
                  <button
                    onClick={() => setShowNewFAQForm(!showNewFAQForm)}
                    className="btn btn-primary btn-sm"
                  >
                    <User className="w-4 h-4" />
                    Add FAQ
                  </button>
                </div>

                {showNewFAQForm && (
                  <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Question"
                        value={newFAQ.question}
                        onChange={(e) => setNewFAQ({ ...newFAQ, question: e.target.value })}
                        className="input"
                      />
                      <textarea
                        placeholder="Answer"
                        value={newFAQ.answer}
                        onChange={(e) => setNewFAQ({ ...newFAQ, answer: e.target.value })}
                        className="textarea"
                        rows={3}
                      />
                      <select
                        value={newFAQ.category}
                        onChange={(e) => setNewFAQ({ ...newFAQ, category: e.target.value })}
                        className="select"
                      >
                        <option value="general">General</option>
                        <option value="eligibility">Eligibility</option>
                        <option value="process">Process</option>
                      </select>
                      <div className="flex gap-2">
                        <button onClick={addFAQ} className="btn btn-primary btn-sm">
                          <Save className="w-4 h-4" />
                          Save
                        </button>
                        <button 
                          onClick={() => setShowNewFAQForm(false)} 
                          className="btn btn-secondary btn-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {faqs.map((faq) => (
                    <div key={faq.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      {editingFAQ?.id === faq.id ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={editingFAQ.question}
                            onChange={(e) => setEditingFAQ({ ...editingFAQ, question: e.target.value })}
                            className="input input-sm"
                          />
                          <textarea
                            value={editingFAQ.answer}
                            onChange={(e) => setEditingFAQ({ ...editingFAQ, answer: e.target.value })}
                            className="textarea"
                            rows={2}
                          />
                          <div className="flex gap-1">
                            <button 
                              onClick={() => updateFAQ(editingFAQ)} 
                              className="btn btn-primary btn-xs"
                            >
                              <Save className="w-3 h-3" />
                            </button>
                            <button 
                              onClick={() => setEditingFAQ(null)} 
                              className="btn btn-secondary btn-xs"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="font-medium text-sm text-gray-900 dark:text-white">{faq.question}</p>
                              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{faq.answer.slice(0, 100)}...</p>
                            </div>
                            <div className="flex gap-1">
                              <button 
                                onClick={() => setEditingFAQ(faq)} 
                                className="btn btn-ghost btn-xs"
                              >
                                <Edit className="w-3 h-3" />
                              </button>
                              <button 
                                onClick={() => deleteFAQ(faq.id)} 
                                className="btn btn-ghost btn-xs text-red-600"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div id="generation_issue_fallback" className="min-h-screen bg-gray-50 dark:bg-gray-900 theme-transition">
      {/* AI Layer */}
      <AILayer
        ref={aiLayerRef}
        prompt=""
        onResult={(result) => setAiResult(result)}
        onError={(error) => setAiError(error)}
        onLoading={(loading) => setIsAiLoading(loading)}
      />

      {/* Navigation */}
      {activeTab !== 'chat' && (
        <nav className="navbar sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-8 h-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900 dark:text-white">Richmond Bar</span>
              </div>

              <div className="flex items-center gap-6">
                <button
                  id="home-tab"
                  onClick={() => setActiveTab('home')}
                  className={`nav-link ${activeTab === 'home' ? 'nav-link-active' : ''}`}
                >
                  <Home className="w-4 h-4" />
                  Home
                </button>
                <button
                  onClick={() => setActiveTab('resources')}
                  className={`nav-link ${activeTab === 'resources' ? 'nav-link-active' : ''}`}
                >
                  <FileText className="w-4 h-4" />
                  Resources
                </button>
                {currentUser && (
                  <button
                    onClick={() => setActiveTab('admin')}
                    className={`nav-link ${activeTab === 'admin' ? 'nav-link-active' : ''}`}
                  >
                    <Settings className="w-4 h-4" />
                    Admin
                  </button>
                )}
                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Toggle dark mode"
                >
                  {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </nav>
      )}

      {/* Content */}
      <main className={activeTab === 'chat' ? '' : 'pt-0'}>
        {activeTab === 'home' && renderHome()}
        {activeTab === 'chat' && renderChat()}
        {activeTab === 'resources' && renderResources()}
        {activeTab === 'admin' && renderAdmin()}
      </main>

      {/* Footer */}
      {activeTab !== 'chat' && (
        <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Copyright © 2025 Datavtar Private Limited. All rights reserved.
              </div>
              <AdminLogin linkText="Admin Login" />
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default App;