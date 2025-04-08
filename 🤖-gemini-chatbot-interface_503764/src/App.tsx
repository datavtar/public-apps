import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sun, Moon, Send, ArrowDown, User, MessageCircle, Bot, ArrowUp, X, ThumbsUp, ThumbsDown, Copy, Check, Trash2 } from 'lucide-react';
import styles from './styles/styles.module.css';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  feedback?: 'positive' | 'negative' | null;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

const App: React.FC = () => {
  // State management
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [input, setInput] = useState<string>('');
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const savedConversations = localStorage.getItem('conversations');
    return savedConversations ? JSON.parse(savedConversations) : [];
  });
  const [currentConversationId, setCurrentConversationId] = useState<string>(() => {
    const savedCurrentId = localStorage.getItem('currentConversationId');
    return savedCurrentId || '';
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() => {
    const savedState = localStorage.getItem('sidebarOpen');
    return savedState ? JSON.parse(savedState) : window.innerWidth > 768;
  });
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem('geminiApiKey') || '';
  });
  const [showApiKeyModal, setShowApiKeyModal] = useState<boolean>(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Get current conversation
  const currentConversation = conversations.find(c => c.id === currentConversationId);
  
  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('conversations', JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem('currentConversationId', currentConversationId);
  }, [currentConversationId]);

  useEffect(() => {
    localStorage.setItem('sidebarOpen', JSON.stringify(isSidebarOpen));
  }, [isSidebarOpen]);

  useEffect(() => {
    localStorage.setItem('geminiApiKey', apiKey);
  }, [apiKey]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConversation?.messages]);

  // Close modal when Escape key is pressed
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showApiKeyModal) {
        setShowApiKeyModal(false);
      }
    };
    
    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, [showApiKeyModal]);

  // Create a new conversation
  const createNewConversation = useCallback(() => {
    const newId = Date.now().toString();
    const newConversation: Conversation = {
      id: newId,
      title: 'New Conversation',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setConversations(prev => [newConversation, ...prev]);
    setCurrentConversationId(newId);
    setInput('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Initialize with a new conversation if there are none
  useEffect(() => {
    if (conversations.length === 0) {
      createNewConversation();
    }
  }, [conversations.length, createNewConversation]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || isLoading) return;
    if (!apiKey) {
      setShowApiKeyModal(true);
      return;
    }
    
    // Create a new conversation if none is selected
    if (!currentConversationId) {
      createNewConversation();
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    // Update conversation with user message
    setConversations(prevConversations => {
      return prevConversations.map(conv => {
        if (conv.id === currentConversationId) {
          // Update conversation title if it's the first message
          const title = conv.messages.length === 0 
            ? input.trim().substring(0, 30) + (input.trim().length > 30 ? '...' : '') 
            : conv.title;
          
          return {
            ...conv,
            title,
            messages: [...conv.messages, userMessage],
            updatedAt: new Date()
          };
        }
        return conv;
      });
    });

    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      // Call the Gemini API
      const response = await fetchGeminiResponse(userMessage.content, currentConversationId);
      
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      // Update conversation with assistant response
      setConversations(prevConversations => {
        return prevConversations.map(conv => {
          if (conv.id === currentConversationId) {
            return {
              ...conv,
              messages: [...conv.messages, assistantMessage],
              updatedAt: new Date()
            };
          }
          return conv;
        });
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching the response');
    } finally {
      setIsLoading(false);
    }
  };

  // Mock function for fetching Gemini response
  // In a real app, this would call the Gemini API
  const fetchGeminiResponse = async (message: string, conversationId: string): Promise<string> => {
    // In a real implementation, this would make an API request to Gemini
    const conversation = conversations.find(c => c.id === conversationId);
    const conversationHistory = conversation?.messages.map(m => ({
      role: m.role,
      parts: [{ text: m.content }]
    })) || [];

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // This is where you would make the actual API call
      // For now, we'll return a placeholder response
      if (!apiKey) {
        throw new Error('API key is missing');
      }

      // Simulate different responses based on the input to make it feel more realistic
      if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
        return "Hello! I'm Gemini, an AI assistant. How can I help you today?";
      } else if (message.toLowerCase().includes('weather')) {
        return "I don't have real-time data access, but I can help you understand weather patterns or direct you to reliable weather services.";
      } else if (message.toLowerCase().includes('code') || message.toLowerCase().includes('programming')) {
        return "I can help with coding questions! What language or framework are you working with?";
      } else if (message.toLowerCase().includes('help')) {
        return "I'm here to assist you with information, answer questions, brainstorm ideas, or just chat. What would you like to know about?";
      }
      
      return "Thank you for your message. In a real implementation, this would call the Gemini API with your API key. Once you add a valid API key, you'll be able to get actual AI responses.";
    } catch (error) {
      console.error('Error fetching response:', error);
      throw error;
    }
  };

  // Delete a conversation
  const deleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    setConversations(prev => prev.filter(conv => conv.id !== id));
    
    // If we deleted the current conversation, select another one
    if (id === currentConversationId) {
      const remainingConversations = conversations.filter(conv => conv.id !== id);
      if (remainingConversations.length > 0) {
        setCurrentConversationId(remainingConversations[0].id);
      } else {
        createNewConversation();
      }
    }
  };

  // Handle message feedback
  const provideFeedback = (messageId: string, feedback: 'positive' | 'negative') => {
    setConversations(prevConversations => {
      return prevConversations.map(conv => {
        if (conv.id === currentConversationId) {
          return {
            ...conv,
            messages: conv.messages.map(msg => {
              if (msg.id === messageId) {
                return {
                  ...msg,
                  feedback: msg.feedback === feedback ? null : feedback
                };
              }
              return msg;
            })
          };
        }
        return conv;
      });
    });
  };

  // Copy message to clipboard
  const copyToClipboard = (text: string, messageId: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopiedMessageId(messageId);
        setTimeout(() => setCopiedMessageId(null), 2000);
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
      });
  };

  // Auto-resize textarea
  const handleTextareaInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  // Handle API key submission
  const handleApiKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const keyInput = document.getElementById('api-key-input') as HTMLInputElement;
    if (keyInput?.value) {
      setApiKey(keyInput.value);
      setShowApiKeyModal(false);
    }
  };

  return (
    <div className={`${darkMode ? 'dark' : ''} min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col`}>
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <button 
            className="md:hidden btn btn-sm" 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            <MessageCircle size={20} />
          </button>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Bot size={24} className="text-primary-600" /> Gemini Chat
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button 
            className="btn btn-sm" 
            onClick={() => setShowApiKeyModal(true)}
            aria-label="Set API Key"
          >
            {apiKey ? "Change API Key" : "Set API Key"}
          </button>
          <button 
            className="btn btn-sm theme-toggle" 
            onClick={() => setDarkMode(!darkMode)}
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            <span className="theme-toggle-thumb"></span>
            <span className="sr-only">{darkMode ? "Switch to light mode" : "Switch to dark mode"}</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside 
          className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:relative z-30 md:z-auto w-72 h-[calc(100vh-4rem)] bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transform transition-transform duration-300 ease-in-out`}
        >
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="font-medium text-gray-800 dark:text-white">Conversations</h2>
            <button 
              className="btn btn-sm btn-primary" 
              onClick={createNewConversation}
              aria-label="New Conversation"
            >
              <Plus size={18} /> New
            </button>
          </div>
          <div className="flex-1 overflow-y-auto py-2 px-3">
            {conversations.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No conversations yet
              </div>
            ) : (
              <ul className="space-y-1">
                {conversations.map(conversation => (
                  <li key={conversation.id}>
                    <button
                      className={`w-full text-left px-3 py-2 rounded-md flex justify-between items-center group hover:bg-gray-100 dark:hover:bg-gray-700 ${currentConversationId === conversation.id ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                      onClick={() => setCurrentConversationId(conversation.id)}
                    >
                      <div className="truncate flex-1">{conversation.title}</div>
                      <button
                        className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                        onClick={(e) => deleteConversation(conversation.id, e)}
                        aria-label="Delete conversation"
                      >
                        <Trash2 size={16} />
                      </button>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 flex flex-col max-h-[calc(100vh-4rem)] relative">
          {/* Overlay for mobile when sidebar is open */}
          {isSidebarOpen && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden" 
              onClick={() => setIsSidebarOpen(false)}
              aria-hidden="true"
            ></div>
          )}
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {!currentConversation?.messages.length ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <Bot size={64} className="text-gray-300 dark:text-gray-600 mb-4" />
                <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">Welcome to Gemini Chat</h2>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mb-6">
                  Start a conversation with Gemini. Ask questions, get creative, or brainstorm ideas.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full max-w-xl">
                  {[
                    "Explain quantum computing",
                    "Write a short story about a robot",
                    "How do I improve my coding skills?",
                    "Suggest a healthy meal plan"
                  ].map((suggestion, index) => (
                    <button
                      key={index}
                      className="btn bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 text-left p-3 rounded-lg text-sm"
                      onClick={() => setInput(suggestion)}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto w-full">
                {currentConversation.messages.map((message) => (
                  <div 
                    key={message.id} 
                    className={`mb-6 ${message.role === 'assistant' ? '' : 'text-right'}`}
                  >
                    <div 
                      className={`inline-block max-w-[80%] md:max-w-[70%] p-4 rounded-lg shadow-sm ${message.role === 'assistant' ? 'bg-white dark:bg-gray-800 text-left' : 'bg-primary-50 dark:bg-primary-900 ml-auto'}`}
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <div className={`p-1.5 rounded-full ${message.role === 'assistant' ? 'bg-primary-100 dark:bg-primary-800' : 'bg-gray-200 dark:bg-gray-700'}`}>
                          {message.role === 'assistant' ? (
                            <Bot size={16} className="text-primary-600 dark:text-primary-400" />
                          ) : (
                            <User size={16} className="text-gray-600 dark:text-gray-400" />
                          )}
                        </div>
                        <div className="font-medium">
                          {message.role === 'assistant' ? 'Gemini' : 'You'}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex-1 text-right">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                      <div className="whitespace-pre-wrap text-gray-800 dark:text-gray-200">
                        {message.content}
                      </div>
                      {message.role === 'assistant' && (
                        <div className="mt-3 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <button 
                              className={`p-1 rounded ${message.feedback === 'positive' ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                              onClick={() => provideFeedback(message.id, 'positive')}
                              aria-label="Thumbs up"
                            >
                              <ThumbsUp size={14} />
                            </button>
                            <button 
                              className={`p-1 rounded ${message.feedback === 'negative' ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                              onClick={() => provideFeedback(message.id, 'negative')}
                              aria-label="Thumbs down"
                            >
                              <ThumbsDown size={14} />
                            </button>
                          </div>
                          <button 
                            className="flex items-center gap-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            onClick={() => copyToClipboard(message.content, message.id)}
                            aria-label="Copy to clipboard"
                          >
                            {copiedMessageId === message.id ? (
                              <>
                                <Check size={14} />
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy size={14} />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="mb-6">
                    <div className="inline-block max-w-[80%] md:max-w-[70%] p-4 rounded-lg shadow-sm bg-white dark:bg-gray-800">
                      <div className="flex items-start gap-2 mb-2">
                        <div className="p-1.5 rounded-full bg-primary-100 dark:bg-primary-800">
                          <Bot size={16} className="text-primary-600 dark:text-primary-400" />
                        </div>
                        <div className="font-medium">Gemini</div>
                      </div>
                      <div className={styles.typingIndicator}>
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                )}
                {error && (
                  <div className="alert alert-error">
                    <X size={16} />
                    <p>{error}</p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
          
          {/* Input form */}
          <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
            <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
              <div className="relative">
                <textarea
                  ref={inputRef}
                  className="input w-full pr-12 min-h-[50px] max-h-[200px] resize-none"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onInput={handleTextareaInput}
                  placeholder="Send a message..."
                  rows={1}
                  disabled={isLoading}
                  aria-label="Message input"
                />
                <button
                  type="submit"
                  className="absolute right-2 bottom-2 p-2 rounded-full bg-primary-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!input.trim() || isLoading}
                  aria-label="Send message"
                >
                  <Send size={18} />
                </button>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                Gemini may display inaccurate info, including about people, so double-check its responses.
              </div>
            </form>
          </div>
        </main>
      </div>

      {/* API Key Modal */}
      {showApiKeyModal && (
        <div className="modal-backdrop" onClick={() => setShowApiKeyModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium">Enter your Gemini API Key</h3>
              <button 
                onClick={() => setShowApiKeyModal(false)} 
                className="text-gray-400 hover:text-gray-500"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 my-4">
              To use this chat application, you need to provide your Gemini API key. 
              You can obtain one from the Google AI Studio dashboard.
            </p>
            <form onSubmit={handleApiKeySubmit}>
              <div className="form-group">
                <label htmlFor="api-key-input" className="form-label">API Key</label>
                <input 
                  id="api-key-input" 
                  type="password" 
                  className="input" 
                  defaultValue={apiKey}
                  placeholder="Enter your Gemini API key"
                  autoComplete="off"
                />
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                  onClick={() => setShowApiKeyModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save API Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-3 px-4 text-center text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        Copyright © 2025 of Datavtar Private Limited. All rights reserved.
      </footer>
    </div>
  );
};

// Custom Plus icon since we don't have direct access to Plus from lucide-react
const Plus: React.FC<{ size?: number }> = ({ size = 24 }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

export default App;
