import React, { useState, useEffect } from 'react';
import { MessageCircle, User, Bot, ArrowRight, FileText, Home, DollarSign, Calendar, Phone, Mail, ExternalLink, X, Check, AlertCircle, Info, ChevronDown, ChevronUp } from 'lucide-react';

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  message: string;
  timestamp: Date;
}

interface EligibilityData {
  hasEvictionCase: boolean | null;
  isCurrentRichmond: boolean | null;
  incomeLevel: 'below80' | 'above80' | null;
  hasLegalRepresentation: boolean | null;
  caseStatus: 'active' | 'resolved' | null;
}

interface UserSession {
  id: string;
  eligibilityData: EligibilityData;
  chatHistory: ChatMessage[];
  isEligible: boolean | null;
  createdAt: Date;
}

type ConversationStep = 
  | 'greeting'
  | 'eviction-case'
  | 'richmond-resident'
  | 'income-level'
  | 'legal-representation'
  | 'case-status'
  | 'eligibility-result'
  | 'resources';

const App: React.FC = () => {
  const [currentSession, setCurrentSession] = useState<UserSession | null>(null);
  const [currentStep, setCurrentStep] = useState<ConversationStep>('greeting');
  const [showResources, setShowResources] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  useEffect(() => {
    // Load existing session from localStorage
    const savedSession = localStorage.getItem('richmond-bar-chatbot-session');
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        session.createdAt = new Date(session.createdAt);
        session.chatHistory = session.chatHistory.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setCurrentSession(session);
        // Determine current step based on session data
        determineCurrentStep(session.eligibilityData);
      } catch (error) {
        console.error('Error loading session:', error);
        startNewSession();
      }
    } else {
      startNewSession();
    }
  }, []);

  const saveSession = (session: UserSession) => {
    localStorage.setItem('richmond-bar-chatbot-session', JSON.stringify(session));
  };

  const determineCurrentStep = (data: EligibilityData): void => {
    if (data.hasEvictionCase === null) {
      setCurrentStep('eviction-case');
    } else if (data.hasEvictionCase === false) {
      setCurrentStep('resources');
    } else if (data.isCurrentRichmond === null) {
      setCurrentStep('richmond-resident');
    } else if (data.isCurrentRichmond === false) {
      setCurrentStep('resources');
    } else if (data.incomeLevel === null) {
      setCurrentStep('income-level');
    } else if (data.incomeLevel === 'above80') {
      setCurrentStep('resources');
    } else if (data.hasLegalRepresentation === null) {
      setCurrentStep('legal-representation');
    } else if (data.hasLegalRepresentation === true) {
      setCurrentStep('resources');
    } else if (data.caseStatus === null) {
      setCurrentStep('case-status');
    } else {
      setCurrentStep('eligibility-result');
    }
  };

  const startNewSession = (): void => {
    const newSession: UserSession = {
      id: `session-${Date.now()}`,
      eligibilityData: {
        hasEvictionCase: null,
        isCurrentRichmond: null,
        incomeLevel: null,
        hasLegalRepresentation: null,
        caseStatus: null
      },
      chatHistory: [],
      isEligible: null,
      createdAt: new Date()
    };

    setCurrentSession(newSession);
    setCurrentStep('greeting');
    addBotMessage('Hello! I\'m here to help you check your eligibility for the Richmond Bar Foundation\'s Eviction Diversion Program. This program provides free legal assistance to tenants facing eviction. Let\'s get started with a few questions.');
    
    setTimeout(() => {
      addBotMessage('Do you currently have an active eviction case filed against you in Richmond?');
      setCurrentStep('eviction-case');
    }, 2000);
  };

  const addMessage = (type: 'user' | 'bot', message: string): void => {
    if (!currentSession) return;

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random()}`,
      type,
      message,
      timestamp: new Date()
    };

    const updatedSession = {
      ...currentSession,
      chatHistory: [...currentSession.chatHistory, newMessage]
    };

    setCurrentSession(updatedSession);
    saveSession(updatedSession);
  };

  const addBotMessage = (message: string): void => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      addMessage('bot', message);
    }, 1000);
  };

  const handleUserResponse = (response: string, dataUpdate: Partial<EligibilityData>): void => {
    if (!currentSession) return;

    addMessage('user', response);

    const updatedEligibilityData = {
      ...currentSession.eligibilityData,
      ...dataUpdate
    };

    const updatedSession = {
      ...currentSession,
      eligibilityData: updatedEligibilityData
    };

    setCurrentSession(updatedSession);
    saveSession(updatedSession);

    // Move to next step
    setTimeout(() => {
      processNextStep(updatedEligibilityData);
    }, 1000);
  };

  const processNextStep = (data: EligibilityData): void => {
    // Check for eviction case first
    if (data.hasEvictionCase === null) {
      addBotMessage('Do you currently have an active eviction case filed against you in Richmond?');
      setCurrentStep('eviction-case');
      return;
    }
    
    // If no eviction case, show resources
    if (data.hasEvictionCase === false) {
      addBotMessage('I understand you don\'t currently have an eviction case. The Eviction Diversion Program is specifically designed for tenants with active eviction cases. However, you may still benefit from other legal resources.');
      setCurrentStep('resources');
      showOtherResources();
      return;
    }
    
    // Check Richmond residency
    if (data.isCurrentRichmond === null) {
      addBotMessage('Are you currently a resident of Richmond, Virginia?');
      setCurrentStep('richmond-resident');
      return;
    }
    
    // If not Richmond resident, show resources
    if (data.isCurrentRichmond === false) {
      addBotMessage('I see you\'re not currently a Richmond resident. The Eviction Diversion Program is specifically for Richmond residents. However, there may be other resources available in your area.');
      setCurrentStep('resources');
      showOtherResources();
      return;
    }
    
    // Check income level
    if (data.incomeLevel === null) {
      addBotMessage('What is your household income level? The program serves households at or below 80% of the Area Median Income (AMI).');
      setCurrentStep('income-level');
      return;
    }
    
    // If income too high, show resources
    if (data.incomeLevel === 'above80') {
      addBotMessage('Based on your income level, you may not qualify for this specific program, but there are other legal resources that might be helpful.');
      setCurrentStep('resources');
      showOtherResources();
      return;
    }
    
    // Check legal representation
    if (data.hasLegalRepresentation === null) {
      addBotMessage('Do you currently have legal representation for your eviction case?');
      setCurrentStep('legal-representation');
      return;
    }
    
    // If already has legal rep, show resources
    if (data.hasLegalRepresentation === true) {
      addBotMessage('Since you already have legal representation, you may not need this program. However, if your situation changes, feel free to return.');
      setCurrentStep('resources');
      showOtherResources();
      return;
    }
    
    // Check case status
    if (data.caseStatus === null) {
      addBotMessage('Is your eviction case still active and ongoing?');
      setCurrentStep('case-status');
      return;
    }
    
    // All questions answered, check final eligibility
    checkEligibility(data);
  };

  const checkEligibility = (data: EligibilityData): void => {
    const isEligible = 
      data.hasEvictionCase === true &&
      data.isCurrentRichmond === true &&
      data.incomeLevel === 'below80' &&
      data.hasLegalRepresentation === false &&
      data.caseStatus === 'active';

    if (!currentSession) return;

    const updatedSession = {
      ...currentSession,
      isEligible
    };

    setCurrentSession(updatedSession);
    saveSession(updatedSession);

    if (isEligible) {
      addBotMessage('Great news! Based on your responses, you appear to be eligible for the Richmond Bar Foundation\'s Eviction Diversion Program. Here\'s what you need to know about next steps.');
      setTimeout(() => {
        showEligibleResources();
      }, 2000);
    } else {
      addBotMessage('Based on your responses, you may not qualify for this specific program, but don\'t worry - there are other resources available that might help with your situation.');
      setTimeout(() => {
        showOtherResources();
      }, 2000);
    }

    setCurrentStep('eligibility-result');
  };

  const showEligibleResources = (): void => {
    addBotMessage('🎉 **You appear to be eligible!** Here\'s how to get started:\n\n📞 **Contact Information:**\n• Phone: (804) 775-0017\n• Email: info@richmondbar.org\n\n📋 **Next Steps:**\n1. Call or email to schedule an intake appointment\n2. Gather your eviction paperwork and any rental documents\n3. Prepare information about your income and household size\n\n⏰ **Important:** Contact them as soon as possible, as early intervention often leads to better outcomes.');
    setShowResources(true);
  };

  const showOtherResources = (): void => {
    addBotMessage('Here are some other resources that might be helpful:\n\n🏛️ **Legal Aid Society:** (804) 648-1012\n🏠 **Housing Resource Center:** (804) 644-0760\n💰 **Emergency Rental Assistance:** Call 211\n📞 **Virginia Legal Aid:** 1-866-534-5243\n\nYou can also visit richmondbar.org for more information about available legal services.');
    setShowResources(true);
  };

  const resetChat = (): void => {
    localStorage.removeItem('richmond-bar-chatbot-session');
    setCurrentSession(null);
    setCurrentStep('greeting');
    setShowResources(false);
    setIsTyping(false);
    startNewSession();
  };

  const faqData = [
    {
      id: 'what-is-program',
      question: 'What is the Eviction Diversion Program?',
      answer: 'The Eviction Diversion Program provides free legal representation to eligible tenants facing eviction in Richmond. The program aims to help tenants avoid eviction through negotiation, mediation, and legal advocacy.'
    },
    {
      id: 'income-requirements',
      question: 'What are the income requirements?',
      answer: 'The program serves households at or below 80% of the Area Median Income (AMI). For 2024, this means approximately $67,200 for a family of four, but amounts vary by household size.'
    },
    {
      id: 'what-help-provided',
      question: 'What kind of help is provided?',
      answer: 'Services include legal representation in court, negotiation with landlords, help understanding your rights as a tenant, assistance with rental assistance applications, and mediation services.'
    },
    {
      id: 'how-to-apply',
      question: 'How do I apply?',
      answer: 'Call (804) 775-0017 or email info@richmondbar.org to schedule an intake appointment. Have your eviction paperwork and income information ready.'
    },
    {
      id: 'cost',
      question: 'Is there a cost for services?',
      answer: 'No, all services provided through the Eviction Diversion Program are completely free for eligible participants.'
    }
  ];

  if (!currentSession) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-pulse bg-gray-200 dark:bg-slate-700 rounded-lg h-16 w-16 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-slate-400">Loading chatbot...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-slate-700">
        <div className="container-fluid py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 text-white p-2 rounded-lg">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  Richmond Bar Foundation
                </h1>
                <p className="text-sm text-gray-600 dark:text-slate-400">
                  Eviction Diversion Program Eligibility
                </p>
              </div>
            </div>
            <button
              onClick={resetChat}
              className="btn bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600 text-sm"
              aria-label="Start new chat"
            >
              New Chat
            </button>
          </div>
        </div>
      </header>

      <div className="container-fluid py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <div className="card-responsive h-[600px] flex flex-col">
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {currentSession.chatHistory.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.type === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.type === 'bot' && (
                      <div className="bg-blue-600 text-white p-2 rounded-full flex-shrink-0 w-8 h-8 flex items-center justify-center">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}
                    <div
                      className={`max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg px-4 py-3 rounded-lg whitespace-pre-line ${
                        message.type === 'user'
                          ? 'bg-blue-600 text-white ml-auto'
                          : 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm'
                      }`}
                    >
                      {message.message}
                    </div>
                    {message.type === 'user' && (
                      <div className="bg-gray-600 text-white p-2 rounded-full flex-shrink-0 w-8 h-8 flex items-center justify-center">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                ))}

                {isTyping && (
                  <div className="flex gap-3 justify-start">
                    <div className="bg-blue-600 text-white p-2 rounded-full flex-shrink-0 w-8 h-8 flex items-center justify-center">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-white dark:bg-slate-700 px-4 py-3 rounded-lg shadow-sm">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Response Buttons */}
              {!isTyping && (
                <div className="border-t border-gray-200 dark:border-slate-600 p-4">
                  {currentStep === 'eviction-case' && (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => handleUserResponse('Yes, I have an active eviction case', { hasEvictionCase: true })}
                        className="btn btn-primary flex-1"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Yes, I have an eviction case
                      </button>
                      <button
                        onClick={() => handleUserResponse('No, I do not have an eviction case', { hasEvictionCase: false })}
                        className="btn bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-300 dark:hover:bg-slate-500 flex-1"
                      >
                        <X className="w-4 h-4 mr-2" />
                        No, I don't have one
                      </button>
                    </div>
                  )}

                  {currentStep === 'richmond-resident' && (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => handleUserResponse('Yes, I am a Richmond resident', { isCurrentRichmond: true })}
                        className="btn btn-primary flex-1"
                      >
                        <Home className="w-4 h-4 mr-2" />
                        Yes, I live in Richmond
                      </button>
                      <button
                        onClick={() => handleUserResponse('No, I do not live in Richmond', { isCurrentRichmond: false })}
                        className="btn bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-300 dark:hover:bg-slate-500 flex-1"
                      >
                        <X className="w-4 h-4 mr-2" />
                        No, I live elsewhere
                      </button>
                    </div>
                  )}

                  {currentStep === 'income-level' && (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => handleUserResponse('My income is at or below 80% AMI', { incomeLevel: 'below80' })}
                        className="btn btn-primary flex-1"
                      >
                        <DollarSign className="w-4 h-4 mr-2" />
                        At or below 80% AMI
                      </button>
                      <button
                        onClick={() => handleUserResponse('My income is above 80% AMI', { incomeLevel: 'above80' })}
                        className="btn bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-300 dark:hover:bg-slate-500 flex-1"
                      >
                        <ArrowRight className="w-4 h-4 mr-2" />
                        Above 80% AMI
                      </button>
                    </div>
                  )}

                  {currentStep === 'legal-representation' && (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => handleUserResponse('No, I do not have legal representation', { hasLegalRepresentation: false })}
                        className="btn btn-primary flex-1"
                      >
                        <X className="w-4 h-4 mr-2" />
                        No, I need legal help
                      </button>
                      <button
                        onClick={() => handleUserResponse('Yes, I already have a lawyer', { hasLegalRepresentation: true })}
                        className="btn bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-300 dark:hover:bg-slate-500 flex-1"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Yes, I have a lawyer
                      </button>
                    </div>
                  )}

                  {currentStep === 'case-status' && (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => handleUserResponse('Yes, my case is still active', { caseStatus: 'active' })}
                        className="btn btn-primary flex-1"
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        Yes, case is active
                      </button>
                      <button
                        onClick={() => handleUserResponse('No, my case has been resolved', { caseStatus: 'resolved' })}
                        className="btn bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-300 dark:hover:bg-slate-500 flex-1"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        No, case is resolved
                      </button>
                    </div>
                  )}

                  {(currentStep === 'eligibility-result' || currentStep === 'resources') && (
                    <div className="flex justify-center">
                      <button
                        onClick={resetChat}
                        className="btn btn-primary"
                      >
                        <ArrowRight className="w-4 h-4 mr-2" />
                        Start New Assessment
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <div className="card-responsive">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-600" />
                Program Overview
              </h3>
              <div className="space-y-3 text-sm text-gray-600 dark:text-slate-400">
                <div className="flex items-start gap-2">
                  <FileText className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
                  <span>Free legal representation for eviction cases</span>
                </div>
                <div className="flex items-start gap-2">
                  <Home className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
                  <span>Available to Richmond residents only</span>
                </div>
                <div className="flex items-start gap-2">
                  <DollarSign className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
                  <span>Income requirements apply (≤80% AMI)</span>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="card-responsive">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-blue-600" />
                  <span className="text-gray-900 dark:text-white">(804) 775-0017</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <span className="text-gray-900 dark:text-white">info@richmondbar.org</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <ExternalLink className="w-4 h-4 text-blue-600" />
                  <a 
                    href="https://www.scdhc.com/eviction-diversion-program" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Program Details
                  </a>
                </div>
              </div>
            </div>

            {/* Eligibility Status */}
            {currentSession.isEligible !== null && (
              <div className="card-responsive">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Eligibility Status</h3>
                <div className={`p-4 rounded-lg flex items-center gap-3 ${
                  currentSession.isEligible 
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                    : 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200'
                }`}>
                  {currentSession.isEligible ? (
                    <>
                      <Check className="w-5 h-5" />
                      <span className="font-medium">Likely Eligible</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-5 h-5" />
                      <span className="font-medium">May Not Qualify</span>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* FAQ */}
            <div className="card-responsive">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h3>
              <div className="space-y-2">
                {faqData.map((faq) => (
                  <div key={faq.id} className="border border-gray-200 dark:border-slate-600 rounded-lg">
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                      className="w-full p-3 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {faq.question}
                      </span>
                      {expandedFaq === faq.id ? (
                        <ChevronUp className="w-4 h-4 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      )}
                    </button>
                    {expandedFaq === faq.id && (
                      <div className="px-3 pb-3">
                        <p className="text-sm text-gray-600 dark:text-slate-400">
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 py-4 mt-auto">
        <div className="container-fluid text-center">
          <p className="text-sm text-gray-600 dark:text-slate-400">
            Copyright © 2025 Datavtar Private Limited. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;