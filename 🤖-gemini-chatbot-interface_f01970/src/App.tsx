import React, { useState, useEffect, useRef, useCallback, KeyboardEvent, ChangeEvent, FormEvent } from 'react';
import { Send, Trash2, Sun, Moon, MessageSquare, X } from 'lucide-react';
import styles from './styles/styles.module.css';

// Type Definitions within App.tsx
interface Message {
  id: number;
  sender: 'user' | 'bot';
  text: string;
  timestamp: number;
}

type Theme = 'light' | 'dark';

// Main Application Component
const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [theme, setTheme] = useState<Theme>('light');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // --- Local Storage Handling ---
  useEffect(() => {
    // Load theme from local storage or detect system preference
    const savedTheme = localStorage.getItem('chatbotTheme') as Theme | null;
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    setTheme(initialTheme);

    // Load messages from local storage
    const savedMessages = localStorage.getItem('chatbotMessages');
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (error) {
        console.error("Failed to parse messages from local storage:", error);
        localStorage.removeItem('chatbotMessages'); // Clear corrupted data
      }
    }
  }, []);

  useEffect(() => {
    // Apply theme class to document element
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // Save theme to local storage
    localStorage.setItem('chatbotTheme', theme);
  }, [theme]);

  useEffect(() => {
    // Save messages to local storage whenever they change
    localStorage.setItem('chatbotMessages', JSON.stringify(messages));
  }, [messages]);

  // --- Chat Functionality ---
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]); // Scroll whenever messages update

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(event.target.value);
    // Auto-resize textarea
    const textarea = event.target;
    textarea.style.height = 'auto'; // Reset height
    textarea.style.height = `${textarea.scrollHeight}px`; // Set to scroll height
  };

  const addMessage = (sender: 'user' | 'bot', text: string) => {
    const newMessage: Message = {
      id: Date.now(), // Simple unique ID
      sender,
      text,
      timestamp: Date.now(),
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  };

  const deleteMessage = (id: number) => {
    setMessages((prevMessages) => prevMessages.filter(message => message.id !== id));
  }

  const handleSubmit = useCallback((event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    const trimmedInput = inputValue.trim();
    if (!trimmedInput || isLoading) return;

    addMessage('user', trimmedInput);
    setInputValue('');
    if (inputRef.current) { // Reset textarea height after sending
      inputRef.current.style.height = 'auto';
    }
    setIsLoading(true);

    // Simulate bot response (replace with actual API call later)
    setTimeout(() => {
      addMessage('bot', `Gemini 2.0 Flash response placeholder for: "${trimmedInput}". API key needed.`);
      setIsLoading(false);
    }, 1500); // Simulate network delay
  }, [inputValue, isLoading]); // Add dependencies

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); // Prevent newline on Enter
      handleSubmit();
    }
  };

  const formatTimestamp = (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex flex-col h-screen theme-transition-all bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-slate-100 ${styles.appContainer}`}>
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700 shadow-sm sticky top-0 bg-white dark:bg-slate-800 z-10 theme-transition-bg">
        <div className="flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-primary-600" aria-hidden="true" />
            <h1 className="text-xl font-semibold">Gemini Chat</h1>
        </div>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 theme-transition"
          aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
          {theme === 'light' ? (
            <Moon className="w-5 h-5 text-gray-600 dark:text-slate-300" aria-hidden="true" />
          ) : (
            <Sun className="w-5 h-5 text-yellow-500" aria-hidden="true" />
          )}
        </button>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 theme-transition-bg">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 group ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.sender === 'bot' && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex-shrink-0 flex items-center justify-center text-white font-bold text-sm shadow-md">
                G
              </div>
            )}
            <div
              className={`relative p-3 rounded-lg max-w-xs md:max-w-md lg:max-w-lg shadow-md theme-transition-all ${styles.messageBubble} ${ 
                message.sender === 'user'
                  ? 'bg-primary-500 text-white rounded-br-none'
                  : 'bg-white dark:bg-slate-700 text-gray-800 dark:text-slate-200 rounded-bl-none'
              }`}
            >
              <p className="text-sm break-words">{message.text}</p>
              <span className={`absolute text-xs opacity-70 ${message.sender === 'user' ? 'bottom-1 left-2 text-blue-100' : 'bottom-1 right-2 text-gray-500 dark:text-slate-400'}`}>
                {formatTimestamp(message.timestamp)}
              </span>
              {/* Delete Button - shown on hover */} 
              <button 
                  onClick={() => deleteMessage(message.id)}
                  className={`absolute top-0 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 focus:opacity-100 focus:outline-none focus:ring-1 focus:ring-white ${message.sender === 'user' ? 'left-[-28px]' : 'right-[-28px]'}`}
                  aria-label="Delete message"
                  title="Delete message"
              >
                  <Trash2 size={14} />
              </button>
            </div>
             {message.sender === 'user' && (
              <div className="w-8 h-8 rounded-full bg-blue-500 flex-shrink-0 flex items-center justify-center text-white font-bold text-sm shadow-md">
                U
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start gap-3">
             <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex-shrink-0 flex items-center justify-center text-white font-bold text-sm shadow-md">
                G
              </div>
            <div className="p-3 rounded-lg bg-white dark:bg-slate-700 text-gray-500 dark:text-slate-400 rounded-bl-none shadow-md flex items-center gap-2 theme-transition-all">
               <div className={`${styles.typingDot} ${styles.dot1}`}></div>
               <div className={`${styles.typingDot} ${styles.dot2}`}></div>
               <div className={`${styles.typingDot} ${styles.dot3}`}></div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} /> {/* Element to scroll to */}
      </main>

      {/* Input Area */}
      <footer className="p-4 border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 theme-transition-bg sticky bottom-0">
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your message... (Shift+Enter for newline)"
            className="input-responsive flex-1 resize-none overflow-y-auto theme-transition bg-gray-100 dark:bg-slate-700 focus:bg-white dark:focus:bg-slate-600 rounded-lg pr-10" // Adjusted padding for button
            rows={1} // Start with one row
            style={{ maxHeight: '120px' }} // Limit max height
            aria-label="Chat message input"
            disabled={isLoading}
            name="messageInput"
          />
          <button
            type="submit"
            className={`btn btn-primary p-2 rounded-lg flex-shrink-0 ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary-700'}`}
            disabled={isLoading || !inputValue.trim()}
            aria-label="Send message"
            title="Send message"
          >
            <Send className="w-5 h-5" aria-hidden="true" />
          </button>
        </form>
         <p className="text-center text-xs text-gray-500 dark:text-slate-400 mt-3">
            Copyright © {new Date().getFullYear()} Datavtar Private Limited. All rights reserved.
          </p>
      </footer>
    </div>
  );
};

export default App;
