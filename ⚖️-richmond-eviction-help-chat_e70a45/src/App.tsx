import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from './contexts/authContext';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import { 
  MessageCircle, 
  Send, 
  User, 
  Bot, 
  Home, 
  Settings, 
  Download, 
  Trash2, 
  FileText, 
  Phone, 
  Mail, 
  MapPin, 
  DollarSign, 
  Users, 
  Scale,
  Heart,
  Sun,
  Moon,
  LogOut,
  Menu,
  X,
  ExternalLink
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Types and Interfaces
interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  eligibilityData?: EligibilityData;
}

interface EligibilityData {
  income?: number;
  householdSize?: number;
  location?: string;
  caseType?: string;
  status?: 'eligible' | 'ineligible' | 'pending' | 'referred';
  nextSteps?: string[];
}

interface EligibilityAssessment {
  id: string;
  userId?: string;
  timestamp: Date;
  messages: ChatMessage[];
  finalStatus?: 'eligible' | 'ineligible' | 'referred';
  eligibilityData: EligibilityData;
}

interface ProgramResource {
  id: string;
  title: string;
  description: string;
  contactInfo: string;
  website?: string;
  eligibility?: string;
}

// Dark Mode Hook
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

const App: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { isDark, toggleDarkMode } = useDarkMode();
  const aiLayerRef = useRef<AILayerHandle>(null);

  // State Management
  const [activeTab, setActiveTab] = useState<'chat' | 'assessments' | 'resources' | 'settings'>('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [currentAssessment, setCurrentAssessment] = useState<EligibilityAssessment | null>(null);

  // Data State
  const [assessments, setAssessments] = useState<EligibilityAssessment[]>([]);
  const [resources, setResources] = useState<ProgramResource[]>([]);

  // Settings State
  const [settings, setSettings] = useState({
    language: 'en',
    notifications: true,
    autoSave: true
  });

  // Initialize default data
  useEffect(() => {
    loadDataFromStorage();
    initializeDefaultResources();
    startNewChat();
  }, []);

  const loadDataFromStorage = () => {
    try {
      const savedAssessments = localStorage.getItem('eviction_assessments');
      const savedSettings = localStorage.getItem('eviction_settings');
      
      if (savedAssessments) {
        const parsed = JSON.parse(savedAssessments);
        setAssessments(parsed.map((a: any) => ({
          ...a,
          timestamp: new Date(a.timestamp),
          messages: a.messages.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp)
          }))
        })));
      }
      
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading data from storage:', error);
    }
  };

  const saveDataToStorage = () => {
    try {
      localStorage.setItem('eviction_assessments', JSON.stringify(assessments));
      localStorage.setItem('eviction_settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving data to storage:', error);
    }
  };

  useEffect(() => {
    saveDataToStorage();
  }, [assessments, settings]);

  const initializeDefaultResources = () => {
    const defaultResources: ProgramResource[] = [
      {
        id: '1',
        title: 'Richmond Bar Foundation Eviction Diversion Program',
        description: 'Free legal assistance for eligible tenants facing eviction',
        contactInfo: '(804) 775-0500',
        website: 'https://www.scdhc.com/eviction-diversion-program',
        eligibility: 'Income-qualified Richmond area residents'
      },
      {
        id: '2',
        title: 'Virginia Legal Aid Society',
        description: 'Comprehensive legal services for low-income individuals',
        contactInfo: '(804) 648-1012',
        website: 'https://www.vlas.org',
        eligibility: 'Income below 125% of federal poverty level'
      },
      {
        id: '3',
        title: 'Richmond Tenants Union',
        description: 'Tenant advocacy and education services',
        contactInfo: '(804) 249-2787',
        eligibility: 'All Richmond area tenants'
      },
      {
        id: '4',
        title: 'Emergency Rental Assistance',
        description: 'Financial assistance for rent and utilities',
        contactInfo: '(804) 646-5750',
        eligibility: 'COVID-19 impact and income qualification required'
      }
    ];
    
    setResources(defaultResources);
  };

  const startNewChat = () => {
    const welcomeMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      type: 'bot',
      content: `Hello! I'm here to help you determine if you qualify for the Richmond Bar Foundation's Eviction Diversion Program. This program provides free legal assistance to eligible tenants facing eviction.

I'll ask you a few questions about your situation to check your eligibility. All information shared here is kept confidential.

To get started, could you please tell me:
1. Are you currently facing an eviction in Richmond, Virginia?
2. What's your current housing situation?

Please share whatever you're comfortable with, and I'll guide you through the process.`,
      timestamp: new Date()
    };

    const newAssessment: EligibilityAssessment = {
      id: `assessment-${Date.now()}`,
      userId: currentUser?.id,
      timestamp: new Date(),
      messages: [welcomeMessage],
      eligibilityData: {}
    };

    setMessages([welcomeMessage]);
    setCurrentAssessment(newAssessment);
    setError(null);
    setAiResult(null);
  };

  const handleSendMessage = async () => {
    if (!currentInput.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      type: 'user',
      content: currentInput,
      timestamp: new Date()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setCurrentInput('');
    setError(null);
    setAiResult(null);

    // Prepare AI context with eligibility criteria
    const eligibilityContext = `
You are an AI assistant helping users determine eligibility for the Richmond Bar Foundation's Eviction Diversion Program. 

ELIGIBILITY CRITERIA:
1. INCOME: Household income must be at or below 50% of Area Median Income (AMI) for Richmond, VA
   - 1 person: $31,450
   - 2 people: $35,950
   - 3 people: $40,450
   - 4 people: $44,900
   - 5 people: $48,500
   - 6 people: $52,100
   - Add $3,600 for each additional person

2. GEOGRAPHIC: Must be facing eviction in Richmond, Virginia or surrounding jurisdictions served by the program

3. CASE TYPE: Must be a residential eviction case (not commercial)

4. TIMING: Must apply before the eviction hearing date

CONVERSATION GUIDELINES:
- Be empathetic and supportive - users are in stressful situations
- Ask one question at a time to avoid overwhelming
- Explain legal terms simply
- If eligible, provide clear next steps for contacting the program
- If ineligible, suggest alternative resources
- Collect: household size, income, location, case timeline

Based on the conversation history and the user's latest message, respond helpfully and guide them through the eligibility screening process. If you have enough information to make a determination, provide a clear eligibility assessment with next steps.

User's message: "${currentInput}"

Previous conversation context: ${JSON.stringify(updatedMessages.slice(-5))}
`;

    try {
      aiLayerRef.current?.sendToAI(eligibilityContext);
    } catch (error) {
      setError('Failed to process your message. Please try again.');
    }
  };

  const handleAIResult = (result: string) => {
    const botMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      type: 'bot',
      content: result,
      timestamp: new Date()
    };

    const updatedMessages = [...messages, botMessage];
    setMessages(updatedMessages);

    // Update current assessment
    if (currentAssessment) {
      const updatedAssessment = {
        ...currentAssessment,
        messages: updatedMessages
      };
      setCurrentAssessment(updatedAssessment);

      // Save to assessments if this looks like a completed assessment
      if (result.toLowerCase().includes('eligible') || result.toLowerCase().includes('next steps')) {
        setAssessments(prev => {
          const existing = prev.find(a => a.id === updatedAssessment.id);
          if (existing) {
            return prev.map(a => a.id === updatedAssessment.id ? updatedAssessment : a);
          } else {
            return [...prev, updatedAssessment];
          }
        });
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const exportAssessments = () => {
    const csvContent = assessments.map(assessment => ({
      'Assessment ID': assessment.id,
      'Date': assessment.timestamp.toLocaleDateString(),
      'User': assessment.userId || 'Anonymous',
      'Status': assessment.finalStatus || 'In Progress',
      'Messages Count': assessment.messages.length,
      'Last Updated': new Date(Math.max(...assessment.messages.map(m => m.timestamp.getTime()))).toLocaleString()
    }));

    const csv = [
      Object.keys(csvContent[0] || {}).join(','),
      ...csvContent.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eviction-assessments-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const clearAllData = () => {
    setAssessments([]);
    setMessages([]);
    setCurrentAssessment(null);
    localStorage.removeItem('eviction_assessments');
    startNewChat();
  };

  const renderChatInterface = () => (
    <div id="chat-interface" className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 rounded-t-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <Scale className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">Eviction Help Assistant</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Richmond Bar Foundation</p>
            </div>
          </div>
          <button
            onClick={startNewChat}
            className="btn btn-secondary btn-sm"
          >
            New Chat
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex gap-3 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.type === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
              }`}>
                {message.type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`rounded-2xl p-4 ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
              }`}>
                {message.type === 'bot' ? (
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    className="prose prose-sm dark:prose-invert max-w-none"
                  >
                    {message.content}
                  </ReactMarkdown>
                ) : (
                  <p>{message.content}</p>
                )}
                <p className={`text-xs mt-2 opacity-70`}>
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex gap-3 max-w-[80%]">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-200 dark:bg-gray-700">
                <Bot className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </div>
              <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-2xl p-4">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 rounded-b-xl">
        {error && (
          <div className="alert alert-error mb-4">
            <p>{error}</p>
          </div>
        )}
        <div className="flex gap-2">
          <textarea
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message here..."
            className="input flex-1 resize-none min-h-[44px] max-h-32"
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!currentInput.trim() || isLoading}
            className="btn btn-primary px-4 flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );

  const renderAssessments = () => (
    <div id="assessments-tab" className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="heading-3">Assessment History</h2>
        <div className="flex gap-2">
          <button onClick={exportAssessments} className="btn btn-secondary btn-sm">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {assessments.length === 0 ? (
        <div className="card card-padding text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="heading-5 mb-2">No Assessments Yet</h3>
          <p className="text-caption">Start a chat to create your first eligibility assessment.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {assessments.map((assessment) => (
            <div key={assessment.id} className="card card-padding">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Assessment {assessment.id.slice(-8)}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {assessment.timestamp.toLocaleString()}
                  </p>
                </div>
                <span className={`badge ${
                  assessment.finalStatus === 'eligible' ? 'badge-success' : 
                  assessment.finalStatus === 'ineligible' ? 'badge-error' : 
                  'badge-gray'
                }`}>
                  {assessment.finalStatus || 'In Progress'}
                </span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                <p><strong>Messages:</strong> {assessment.messages.length}</p>
                {assessment.userId && <p><strong>User:</strong> {assessment.userId}</p>}
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    setMessages(assessment.messages);
                    setCurrentAssessment(assessment);
                    setActiveTab('chat');
                  }}
                  className="btn btn-secondary btn-sm"
                >
                  View Chat
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderResources = () => (
    <div id="resources-tab" className="space-y-6">
      <h2 className="heading-3">Legal Resources & Assistance</h2>
      
      <div className="grid gap-6">
        {resources.map((resource) => (
          <div key={resource.id} className="card card-padding">
            <h3 className="heading-5 mb-2">{resource.title}</h3>
            <p className="text-body mb-4">{resource.description}</p>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <span className="text-sm">{resource.contactInfo}</span>
              </div>
              {resource.website && (
                <div className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-gray-500" />
                  <a 
                    href={resource.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {resource.website}
                  </a>
                </div>
              )}
              {resource.eligibility && (
                <div className="flex items-start gap-2">
                  <Scale className="w-4 h-4 text-gray-500 mt-0.5" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">{resource.eligibility}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="card card-padding bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <h3 className="heading-5 mb-2 text-blue-900 dark:text-blue-100">Emergency Contacts</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-blue-600" />
            <span className="text-sm"><strong>Richmond Bar Foundation:</strong> (804) 775-0500</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-blue-600" />
            <span className="text-sm"><strong>Emergency Legal Aid:</strong> 211 (dial 2-1-1)</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-blue-600" />
            <span className="text-sm"><strong>Crisis Hotline:</strong> (804) 254-8260</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div id="settings-tab" className="space-y-6">
      <h2 className="heading-3">Settings</h2>
      
      {/* App Settings */}
      <div className="card card-padding">
        <h3 className="heading-5 mb-4">Application Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="form-label">Dark Mode</label>
              <p className="form-help">Toggle between light and dark themes</p>
            </div>
            <button
              onClick={toggleDarkMode}
              className={`toggle ${isDark ? 'toggle-checked' : ''}`}
            >
              <div className="toggle-thumb" />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="form-label">Auto-save Conversations</label>
              <p className="form-help">Automatically save chat sessions</p>
            </div>
            <button
              onClick={() => setSettings(prev => ({ ...prev, autoSave: !prev.autoSave }))}
              className={`toggle ${settings.autoSave ? 'toggle-checked' : ''}`}
            >
              <div className="toggle-thumb" />
            </button>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="card card-padding">
        <h3 className="heading-5 mb-4">Data Management</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="form-label">Export Assessment Data</label>
              <p className="form-help">Download all assessment data as CSV</p>
            </div>
            <button onClick={exportAssessments} className="btn btn-secondary btn-sm">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="form-label">Clear All Data</label>
              <p className="form-help">Remove all saved assessments and conversations</p>
            </div>
            <button 
              onClick={clearAllData}
              className="btn btn-error btn-sm"
            >
              <Trash2 className="w-4 h-4" />
              Clear Data
            </button>
          </div>
        </div>
      </div>

      {/* Program Information */}
      <div className="card card-padding bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
        <h3 className="heading-5 mb-2 text-green-900 dark:text-green-100">About This Tool</h3>
        <div className="space-y-2 text-sm text-green-800 dark:text-green-200">
          <p>This chatbot helps determine eligibility for the Richmond Bar Foundation's Eviction Diversion Program.</p>
          <p><strong>Important:</strong> This tool provides preliminary screening only. Final eligibility determination is made by program staff.</p>
          <p><strong>Privacy:</strong> All conversations are stored locally on your device and are not shared.</p>
          <p><strong>Version:</strong> 1.0.0 | <strong>Last Updated:</strong> June 2025</p>
        </div>
      </div>
    </div>
  );

  return (
    <div id="welcome_fallback" className="min-h-screen bg-gray-50 dark:bg-gray-900 theme-transition">
      {/* Navigation */}
      <nav className="navbar bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="btn btn-ghost btn-sm lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-gray-900 dark:text-white">Richmond Bar Foundation</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Eviction Diversion Assistant</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={toggleDarkMode}
            className="btn btn-ghost btn-sm"
            title="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          {currentUser && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {currentUser.first_name} {currentUser.last_name}
              </span>
              <button onClick={logout} className="btn btn-ghost btn-sm">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}>
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 lg:hidden">
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="btn btn-ghost btn-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <nav className="flex-1 p-4">
              <div className="space-y-2">
                <button
                  id="chat-tab"
                  onClick={() => {
                    setActiveTab('chat');
                    setIsSidebarOpen(false);
                  }}
                  className={`nav-link w-full text-left flex items-center gap-3 ${
                    activeTab === 'chat' ? 'nav-link-active' : ''
                  }`}
                >
                  <MessageCircle className="w-4 h-4" />
                  Eligibility Chat
                </button>
                
                <button
                  id="assessments-tab"
                  onClick={() => {
                    setActiveTab('assessments');
                    setIsSidebarOpen(false);
                  }}
                  className={`nav-link w-full text-left flex items-center gap-3 ${
                    activeTab === 'assessments' ? 'nav-link-active' : ''
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Assessment History
                </button>
                
                <button
                  id="resources-tab"
                  onClick={() => {
                    setActiveTab('resources');
                    setIsSidebarOpen(false);
                  }}
                  className={`nav-link w-full text-left flex items-center gap-3 ${
                    activeTab === 'resources' ? 'nav-link-active' : ''
                  }`}
                >
                  <Heart className="w-4 h-4" />
                  Resources
                </button>
                
                <button
                  id="settings-tab"
                  onClick={() => {
                    setActiveTab('settings');
                    setIsSidebarOpen(false);
                  }}
                  className={`nav-link w-full text-left flex items-center gap-3 ${
                    activeTab === 'settings' ? 'nav-link-active' : ''
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
              </div>
            </nav>
            
            {/* Program Info */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                <h4 className="font-medium text-sm text-blue-900 dark:text-blue-100 mb-1">
                  Need Immediate Help?
                </h4>
                <p className="text-xs text-blue-700 dark:text-blue-300 mb-2">
                  Call the Richmond Bar Foundation
                </p>
                <a href="tel:8047750500" className="text-xs font-medium text-blue-600 dark:text-blue-400">
                  (804) 775-0500
                </a>
              </div>
            </div>
          </div>
        </aside>

        {/* Sidebar Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main id="generation_issue_fallback" className="flex-1 min-h-screen">
          <div className="container mx-auto p-4 lg:p-6 max-w-6xl">
            <div className="h-[calc(100vh-6rem)] lg:h-[calc(100vh-8rem)]">
              {activeTab === 'chat' && (
                <div className="h-full bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                  {renderChatInterface()}
                </div>
              )}
              {activeTab === 'assessments' && renderAssessments()}
              {activeTab === 'resources' && renderResources()}
              {activeTab === 'settings' && renderSettings()}
            </div>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Copyright © 2025 Datavtar Private Limited. All rights reserved.
          </p>
        </div>
      </footer>

      {/* AI Layer Component */}
      <AILayer
        ref={aiLayerRef}
        prompt=""
        onResult={handleAIResult}
        onError={(error) => setError(error.message || 'An error occurred')}
        onLoading={setIsLoading}
      />
    </div>
  );
};

export default App;