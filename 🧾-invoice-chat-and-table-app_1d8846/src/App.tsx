import React, { useState, useEffect, useRef, FormEvent, ChangeEvent } from 'react';
import { Moon, Sun, Send, Trash2, Bot, User, AlertTriangle, CheckCircle, FileText, Search, XSquare } from 'lucide-react';
import { format } from 'date-fns'; 
// Assume AILayer and AILayerHandle are in these locations as per instructions
import AILayer from './components/AILayer'; 
import { AILayerHandle } from './components/AILayer.types';

import styles from './styles/styles.module.css';

type Theme = 'light' | 'dark';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai' | 'system';
  timestamp: Date;
  metadata?: any;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  vendor: string;
  amount: number;
  dueDate: string; // YYYY-MM-DD
  status: 'Pending' | 'Paid' | 'Overdue' | 'Unknown';
}

const LOCAL_STORAGE_KEYS = {
  THEME: 'invoiceChatAppTheme',
  MESSAGES: 'invoiceChatAppMessages',
  INVOICES: 'invoiceChatAppInvoices',
};

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>('light');
  const [messages, setMessages] = useState<Message[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [currentMessage, setCurrentMessage] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const aiLayerRef = useRef<AILayerHandle>(null);
  const [aiPromptText, setAiPromptText] = useState<string>('');
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<any | null>(null);

  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load initial data from local storage
  useEffect(() => {
    const storedTheme = localStorage.getItem(LOCAL_STORAGE_KEYS.THEME) as Theme | null;
    if (storedTheme) {
      setTheme(storedTheme);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }

    const storedMessages = localStorage.getItem(LOCAL_STORAGE_KEYS.MESSAGES);
    if (storedMessages) {
      try {
        setMessages(JSON.parse(storedMessages).map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
      } catch (e) {
        console.error("Error parsing stored messages:", e);
        localStorage.removeItem(LOCAL_STORAGE_KEYS.MESSAGES);
      }
    } else {
      setMessages([
        {
          id: crypto.randomUUID(),
          text: 'Welcome! Type a message containing invoice details (e.g., "Invoice INV-123 from Acme Corp for $500 due 2024-12-31 status pending") and I will try to extract them into the table.',
          sender: 'system',
          timestamp: new Date(),
        },
      ]);
    }

    const storedInvoices = localStorage.getItem(LOCAL_STORAGE_KEYS.INVOICES);
    if (storedInvoices) {
      try {
        setInvoices(JSON.parse(storedInvoices));
      } catch (e) {
        console.error("Error parsing stored invoices:", e);
        localStorage.removeItem(LOCAL_STORAGE_KEYS.INVOICES);
      }
    }
    setIsInitialLoading(false);
  }, []);

  // Update theme and save to local storage
  useEffect(() => {
    if (isInitialLoading) return;
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem(LOCAL_STORAGE_KEYS.THEME, theme);
  }, [theme, isInitialLoading]);

  // Save messages to local storage
  useEffect(() => {
    if (isInitialLoading) return;
    localStorage.setItem(LOCAL_STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isInitialLoading]);

  // Save invoices to local storage
  useEffect(() => {
    if (isInitialLoading) return;
    localStorage.setItem(LOCAL_STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
  }, [invoices, isInitialLoading]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const handleMessageInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCurrentMessage(e.target.value);
  };

  const parseAiResponseAndAddInvoice = (apiResultString: string) => {
    try {
      const resultData = JSON.parse(apiResultString);
      
      if (resultData && resultData.invoiceNumber && resultData.vendor && typeof resultData.amount === 'number' && resultData.dueDate) {
        const newInvoice: Invoice = {
          id: crypto.randomUUID(),
          invoiceNumber: String(resultData.invoiceNumber),
          vendor: String(resultData.vendor),
          amount: Number(resultData.amount),
          dueDate: String(resultData.dueDate), // Add validation for YYYY-MM-DD format if needed
          status: ['Pending', 'Paid', 'Overdue'].includes(resultData.status) ? resultData.status : 'Unknown',
        };
        setInvoices(prev => [...prev, newInvoice]);
        setMessages(prev => [
          ...prev,
          {
            id: crypto.randomUUID(),
            text: `Successfully extracted invoice ${newInvoice.invoiceNumber} from ${newInvoice.vendor}. Added to table.`,
            sender: 'system',
            timestamp: new Date(),
            metadata: { icon: <CheckCircle className="w-5 h-5 text-green-500" /> }
          },
        ]);
      } else if (Object.keys(resultData).length === 0 || resultData.message === "No invoice details found.") {
         setMessages(prev => [
          ...prev,
          {
            id: crypto.randomUUID(),
            text: "I couldn't find any invoice details in your message.",
            sender: 'system',
            timestamp: new Date(),
            metadata: { icon: <AlertTriangle className="w-5 h-5 text-yellow-500" /> }
          },
        ]);
      } else {
        throw new Error("AI response did not contain all required invoice fields or was in an unexpected format.");
      }
    } catch (e: any) {
      console.error('Error parsing AI response or invalid invoice data:', e);
      setMessages(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          text: `Error processing AI response: ${e.message || 'Could not extract invoice details.'}`,
          sender: 'system',
          timestamp: new Date(),
          metadata: { icon: <AlertTriangle className="w-5 h-5 text-red-500" /> }
        },
      ]);
      setAiError(`Failed to parse AI response: ${e.message}`);
    }
  };

  useEffect(() => {
    if (aiResult) {
      parseAiResponseAndAddInvoice(aiResult);
      setAiResult(null); // Reset AI result after processing
    }
  }, [aiResult]);

  const handleSendMessage = (e?: FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (!currentMessage.trim()) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      text: currentMessage,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages(prevMessages => [...prevMessages, userMessage]);

    const prompt = `You are an invoice processing assistant specialized in extracting structured data from text. Analyze the following text and extract invoice details. Respond ONLY with a single JSON object. The JSON object must have these keys: "invoiceNumber" (string), "vendor" (string), "amount" (number), "dueDate" (string, format YYYY-MM-DD), "status" (string, one of 'Pending', 'Paid', 'Overdue'). If any detail is missing or cannot be determined, use a sensible default like "N/A" for strings, 0 for amount, or "Unknown" for status. If the text clearly does not contain any invoice information, respond with a JSON object like: {"message": "No invoice details found."}. Do not include any explanations or apologies in your response, only the JSON. Text to analyze: "${currentMessage}"`;
    
    setAiPromptText(prompt);
    setCurrentMessage('');
    setAiError(null); // Clear previous errors
    //setIsAiLoading(true); // AILayer's onLoading will handle this
    
    // Trigger AI layer after state update for promptText
    // Using a small timeout to ensure promptText is updated before sendToAI is called
    setTimeout(() => {
      if (aiLayerRef.current) {
        aiLayerRef.current.sendToAI();
      } else {
        console.error("AILayer ref not available");
        setAiError("AI processing unit is not available. Please try again later.");
        setIsAiLoading(false);
      }
    }, 0);
  };

  const handleDeleteInvoice = (invoiceId: string) => {
    setInvoices(prevInvoices => prevInvoices.filter(inv => inv.id !== invoiceId));
     setMessages(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        text: `Invoice with ID ${invoiceId.substring(0,8)}... removed from table.`,
        sender: 'system',
        timestamp: new Date(),
      },
    ]);
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString; // Fallback if date is invalid
    }
  };

  const filteredInvoices = invoices.filter(invoice => 
    invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    invoice.vendor.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isInitialLoading) {
    return (
      <div className="flex-center min-h-screen bg-slate-100 dark:bg-slate-900">
        <div className="skeleton h-12 w-12 rounded-full"></div>
        <p className="ml-4 text-lg font-medium text-slate-700 dark:text-slate-300">Loading Your Invoice Assistant...</p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col min-h-screen theme-transition-all ${styles.appContainer} bg-gray-100 dark:bg-slate-900 text-gray-900 dark:text-slate-100`}>
      <header className="sticky top-0 z-sticky bg-white dark:bg-slate-800 shadow-md no-print">
        <div className="container-wide mx-auto px-4 py-3 flex-between">
          <div className="flex items-center gap-2">
            <FileText className="h-8 w-8 text-primary-600 dark:text-primary-400" />
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-slate-100">AI Invoice Assistant</h1>
          </div>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {theme === 'light' ? <Moon className="h-6 w-6 text-slate-700" /> : <Sun className="h-6 w-6 text-yellow-400" />}
          </button>
        </div>
      </header>

      <main className="flex-grow flex flex-col md:flex-row container-wide mx-auto p-2 sm:p-4 gap-4 overflow-hidden">
        {/* Chat Section */}
        <section className={`${styles.chatSection} md:w-1/2 flex flex-col card card-responsive theme-transition-all`}>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Bot className="w-6 h-6 text-primary-600 dark:text-primary-400" /> Chat
          </h2>
          <div className={`${styles.messagesContainer} flex-grow overflow-y-auto mb-4 p-2 rounded-md bg-gray-50 dark:bg-slate-700/50`}>
            {messages.map(msg => (
              <div key={msg.id} className={`flex my-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-xl shadow-sm ${msg.sender === 'user' ? 'bg-primary-500 text-white rounded-br-none' : (msg.sender === 'ai' ? 'bg-slate-600 text-white rounded-bl-none' : 'bg-gray-200 dark:bg-slate-600 text-gray-800 dark:text-slate-200 rounded-bl-none')}`}>
                  <div className="flex items-center gap-2 mb-1">
                    {msg.sender === 'user' && <User className="w-4 h-4 opacity-80" />}
                    {msg.sender === 'ai' && <Bot className="w-4 h-4 opacity-80" />}
                    {msg.sender === 'system' && (msg.metadata?.icon || <CheckCircle className="w-4 h-4 opacity-80" />)}
                    <span className="text-xs font-medium opacity-80">
                      {msg.sender.charAt(0).toUpperCase() + msg.sender.slice(1)} - {format(msg.timestamp, 'p')}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
            {isAiLoading && (
                <div className="flex justify-start my-2">
                    <div className={`max-w-[80%] p-3 rounded-xl shadow-sm bg-gray-200 dark:bg-slate-600 text-gray-800 dark:text-slate-200 rounded-bl-none`}>
                        <div className="flex items-center gap-2">
                            <Bot className="w-4 h-4 opacity-80" /> 
                            <span className="text-xs font-medium opacity-80">AI is thinking...</span> 
                            <div className={`${styles.typingIndicator}`}><span></span><span></span><span></span></div>
                        </div>
                    </div>
                </div>
            )}
            {aiError && (
                <div className="alert alert-error mt-2">
                    <AlertTriangle className="h-5 w-5"/>
                    <p className="text-sm">AI Error: {typeof aiError === 'string' ? aiError : JSON.stringify(aiError)}</p>
                </div>
            )}
          </div>
          <form onSubmit={handleSendMessage} className="flex gap-2 items-center mt-auto no-print">
            <input
              type="text"
              value={currentMessage}
              onChange={handleMessageInputChange}
              placeholder="Type your message with invoice details..."
              className="input input-responsive flex-grow dark:placeholder-slate-400"
              aria-label="Chat message input"
            />
            <button 
              type="submit" 
              className="btn btn-primary btn-responsive flex-center gap-1.5"
              disabled={isAiLoading || !currentMessage.trim()}
              aria-label="Send message"
            >
              <Send className="w-4 h-4" /> 
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </section>

        {/* Invoices Table Section */}
        <section className={`${styles.invoiceSection} md:w-1/2 flex flex-col card card-responsive theme-transition-all`}>
          <div className="flex-between mb-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="w-6 h-6 text-primary-600 dark:text-primary-400" /> Identified Invoices
            </h2>
          </div>
          <div className="form-group flex gap-2 items-center no-print">
              <div className="relative flex-grow">
                <Search className="w-5 h-5 text-gray-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input 
                    type="text" 
                    placeholder="Search invoices... (Vendor, Inv #)" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    className="input input-responsive pl-10 dark:placeholder-slate-400"
                    aria-label="Search invoices"
                />
                {searchQuery && (
                    <button 
                        onClick={() => setSearchQuery('')} 
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200"
                        aria-label="Clear search"
                    >
                        <XSquare className="w-5 h-5" />
                    </button>
                )}
              </div>
          </div>
          {filteredInvoices.length === 0 ? (
            <div className="flex-grow flex-center flex-col text-center text-gray-500 dark:text-slate-400">
              <FileText size={48} className="mb-4 opacity-50" />
              <p className="text-lg">No invoices found.</p>
              <p className="text-sm"> {searchQuery ? 'Try adjusting your search.' : 'Invoices identified from chat will appear here.'}</p>
            </div>
          ) : (
            <div className="table-container flex-grow overflow-y-auto">
              <table className="table">
                <thead className="sticky top-0 bg-gray-50 dark:bg-slate-700">
                  <tr>
                    <th className="table-header px-3 py-2 sm:px-4 sm:py-3">Inv #</th>
                    <th className="table-header px-3 py-2 sm:px-4 sm:py-3">Vendor</th>
                    <th className="table-header px-3 py-2 sm:px-4 sm:py-3 text-right">Amount</th>
                    <th className="table-header px-3 py-2 sm:px-4 sm:py-3">Due Date</th>
                    <th className="table-header px-3 py-2 sm:px-4 sm:py-3">Status</th>
                    <th className="table-header px-3 py-2 sm:px-4 sm:py-3 no-print">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                  {filteredInvoices.map(inv => (
                    <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="table-cell px-3 py-2 sm:px-4 sm:py-3 font-medium">{inv.invoiceNumber}</td>
                      <td className="table-cell px-3 py-2 sm:px-4 sm:py-3">{inv.vendor}</td>
                      <td className="table-cell px-3 py-2 sm:px-4 sm:py-3 text-right">{formatCurrency(inv.amount)}</td>
                      <td className="table-cell px-3 py-2 sm:px-4 sm:py-3">{formatDate(inv.dueDate)}</td>
                      <td className="table-cell px-3 py-2 sm:px-4 sm:py-3">
                        <span className={`badge ${inv.status === 'Paid' ? 'badge-success' : inv.status === 'Overdue' ? 'badge-error' : inv.status === 'Pending' ? 'badge-warning' : 'badge-info'}`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="table-cell px-3 py-2 sm:px-4 sm:py-3 no-print">
                        <button 
                          onClick={() => handleDeleteInvoice(inv.id)} 
                          className="btn btn-sm bg-red-500 hover:bg-red-600 text-white flex-center gap-1"
                          aria-label={`Delete invoice ${inv.invoiceNumber}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      <AILayer
        ref={aiLayerRef}
        prompt={aiPromptText}
        attachment={undefined} // No file attachments for this app
        onResult={(apiResult) => setAiResult(apiResult)}
        onError={(apiError) => setAiError(apiError)}
        onLoading={(loadingStatus) => setIsAiLoading(loadingStatus)}
      />

      <footer className="text-center py-4 border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-gray-600 dark:text-slate-400 no-print theme-transition-all">
        Copyright © {new Date().getFullYear()} Datavtar Private Limited. All rights reserved.
      </footer>
    </div>
  );
};

export default App;
