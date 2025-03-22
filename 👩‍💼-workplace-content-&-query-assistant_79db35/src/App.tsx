import React, { useState, useEffect, useRef } from 'react';
import { Search, Send, Moon, Sun, ArrowRight, Loader, ExternalLink, Info, Link } from 'lucide-react';
import styles from './styles/styles.module.css';

type Message = {
 id: string;
 content: string;
 type: 'user' | 'assistant';
 timestamp: Date;
};

type Resource = {
 id: string;
 title: string;
 description: string;
 type: 'article' | 'video' | 'website';
 url: string;
};

type FAQItem = {
 id: string;
 question: string;
 answer: string;
};

const App: React.FC = () => {
 const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
 if (typeof window !== 'undefined') {
 const savedMode = localStorage.getItem('darkMode');
 return savedMode === 'true' || 
 (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
 }
 return false;
 });

 const [messages, setMessages] = useState<Message[]>([]);
 const [inputValue, setInputValue] = useState<string>('');
 const [isLoading, setIsLoading] = useState<boolean>(false);
 const [activeTab, setActiveTab] = useState<'chat' | 'resources' | 'faq'>('chat');
 const messagesEndRef = useRef<HTMLDivElement>(null);

 // Sample resources
 const resources: Resource[] = [
 {
 id: '1',
 title: 'Workplace Communication Best Practices',
 description: 'Effective communication strategies for modern workplace environments.',
 type: 'article',
 url: 'https://example.com/communication-best-practices'
 },
 {
 id: '2',
 title: 'Resolving Team Conflicts Professionally',
 description: 'Video guide on handling disagreements in a professional manner.',
 type: 'video',
 url: 'https://youtube.com/watch?v=example1'
 },
 {
 id: '3',
 title: 'Remote Work Productivity Tips',
 description: 'Strategies to maintain productivity when working remotely.',
 type: 'article',
 url: 'https://example.com/remote-productivity'
 },
 {
 id: '4',
 title: 'Effective Team Management',
 description: 'Learn how to manage teams effectively in various workplace settings.',
 type: 'video',
 url: 'https://youtube.com/watch?v=example2'
 },
 {
 id: '5',
 title: 'Workplace Harassment Prevention',
 description: 'Essential information on recognizing and preventing workplace harassment.',
 type: 'website',
 url: 'https://example.com/harassment-prevention'
 },
 ];

 // Sample FAQs
 const faqs: FAQItem[] = [
 {
 id: '1',
 question: 'How do I request time off?',
 answer: 'You can request time off through the HR portal. Navigate to the "Time Off" section and follow the prompts to submit your request. Allow at least two weeks for approval.'
 },
 {
 id: '2',
 question: 'What is our remote work policy?',
 answer: 'Our company allows hybrid work with 2 days in office and 3 days remote. Specific arrangements should be discussed with your manager. All remote work requires a secure internet connection and availability during core hours.'
 },
 {
 id: '3',
 question: 'How do I report a workplace issue?',
 answer: 'Workplace issues can be reported through the confidential reporting system or directly to HR. For urgent matters, please contact the HR director immediately.'
 },
 {
 id: '4',
 question: 'What are the expense reimbursement procedures?',
 answer: 'Submit all expenses through the finance portal within 30 days of purchase. Receipts are required for all items over $25. Approvals typically take 5-7 business days.'
 },
 {
 id: '5',
 question: 'How can I access company resources when working remotely?',
 answer: 'Use the VPN for accessing internal systems. Cloud resources are available directly through your company account. For technical issues, contact the IT helpdesk.'
 },
 ];

 // Sample answers based on common workplace queries
 const getSampleAnswer = (query: string): string => {
 const normalizedQuery = query.toLowerCase();
 
 if (normalizedQuery.includes('vacation') || normalizedQuery.includes('time off') || normalizedQuery.includes('leave')) {
 return "To request time off, please use the HR portal and submit your request at least two weeks in advance. Your manager will receive a notification and approve or deny the request. You can check the status of your request in the 'Pending Requests' section.";
 }
 
 if (normalizedQuery.includes('salary') || normalizedQuery.includes('pay') || normalizedQuery.includes('compensation')) {
 return "Salary discussions should be directed to your manager or HR representative. Annual reviews typically occur in Q1, and this is the best time to discuss compensation adjustments. For immediate questions about your paycheck, please contact payroll@company.com.";
 }
 
 if (normalizedQuery.includes('harassment') || normalizedQuery.includes('bullying') || normalizedQuery.includes('discrimination')) {
 return "Our company has a zero-tolerance policy for workplace harassment. If you've experienced or witnessed inappropriate behavior, please report it immediately to HR or use our anonymous reporting tool. All reports are treated confidentially and investigated promptly.";
 }
 
 if (normalizedQuery.includes('remote') || normalizedQuery.includes('work from home') || normalizedQuery.includes('wfh')) {
 return "Our remote work policy allows for flexible arrangements based on team and role requirements. Please discuss specific arrangements with your manager. When working remotely, ensure you have a secure internet connection and are available during core hours (10 AM - 3 PM).";
 }
 
 if (normalizedQuery.includes('benefit') || normalizedQuery.includes('health') || normalizedQuery.includes('insurance')) {
 return "Our benefits package includes health, dental, and vision insurance, a 401(k) with company matching, and wellness programs. For detailed information, visit the Benefits section of the HR portal or contact benefits@company.com. Open enrollment occurs annually in November.";
 }
 
 if (normalizedQuery.includes('training') || normalizedQuery.includes('development') || normalizedQuery.includes('learning')) {
 return "We offer various professional development opportunities including online courses through our learning platform, conference attendance, and mentorship programs. Speak with your manager about creating a development plan and accessing the training budget allocated for your team.";
 }

 if (normalizedQuery.includes('technical') || normalizedQuery.includes('it support') || normalizedQuery.includes('computer')) {
 return "For technical issues, please contact our IT helpdesk at support@company.com or ext. 4357 (HELP). For common issues, check the IT knowledge base on the intranet. Remote IT support is available during business hours via screen sharing.";
 }
 
 // Default response for queries that don't match specific categories
 return "I don't have specific information about that query. You might want to check our company intranet, employee handbook, or reach out to HR for more detailed information. I can also suggest some relevant resources that might help answer your question.";
 };

 const handleSendMessage = () => {
 if (inputValue.trim() === '') return;
 
 // Add user message
 const userMessage: Message = {
 id: Date.now().toString(),
 content: inputValue,
 type: 'user',
 timestamp: new Date()
 };
 
 setMessages(prev => [...prev, userMessage]);
 setInputValue('');
 setIsLoading(true);
 
 // Simulate API response with a delay
 setTimeout(() => {
 const botResponse: Message = {
 id: (Date.now() + 1).toString(),
 content: getSampleAnswer(inputValue),
 type: 'assistant',
 timestamp: new Date()
 };
 
 setMessages(prev => [...prev, botResponse]);
 setIsLoading(false);
 }, 1000);
 };

 const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
 if (e.key === 'Enter' && !e.shiftKey) {
 e.preventDefault();
 handleSendMessage();
 }
 };

 // Scroll to bottom when messages change
 useEffect(() => {
 messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
 }, [messages]);

 // Handle dark mode toggle
 useEffect(() => {
 if (isDarkMode) {
 document.documentElement.classList.add('dark');
 localStorage.setItem('darkMode', 'true');
 } else {
 document.documentElement.classList.remove('dark');
 localStorage.setItem('darkMode', 'false');
 }
 }, [isDarkMode]);

 const renderResourceCard = (resource: Resource) => {
 const iconMap = {
 'article': <Info className="h-5 w-5 text-blue-500" />,
 'video': <ExternalLink className="h-5 w-5 text-red-500" />,
 'website': <Link className="h-5 w-5 text-green-500" />
 };

 return (
 <div key={resource.id} className="card theme-transition hover:shadow-md">
 <div className="flex items-start space-x-3">
 <div className="flex-shrink-0 pt-1">
 {iconMap[resource.type]}
 </div>
 <div className="flex-1">
 <h3 className="text-lg font-medium text-gray-900 dark:text-white">{resource.title}</h3>
 <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">{resource.description}</p>
 <p className="mt-2 text-xs text-gray-400 dark:text-slate-500 capitalize">{resource.type}</p>
 <div className="mt-3">
 <a 
 href={resource.url} 
 target="_blank" 
 rel="noopener noreferrer"
 className="btn btn-sm btn-primary inline-flex items-center"
 >
 View Resource <ArrowRight className="ml-1 h-4 w-4" />
 </a>
 </div>
 </div>
 </div>
 </div>
 );
 };

 const renderFAQItem = (faq: FAQItem) => (
 <div key={faq.id} className="card theme-transition hover:shadow-md">
 <h3 className="text-lg font-medium text-gray-900 dark:text-white">{faq.question}</h3>
 <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">{faq.answer}</p>
 </div>
 );

 return (
 <div className="min-h-screen bg-gray-50 dark:bg-gray-900 theme-transition">
 <header className="bg-white dark:bg-gray-800 shadow-sm theme-transition">
 <div className="container-fluid py-4">
 <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
 <div>
 <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
 Workplace Content Management
 </h1>
 <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
 Find answers to your workplace questions and access helpful resources
 </p>
 </div>
 <div className="mt-3 sm:mt-0 flex items-center">
 <button 
 className="theme-toggle ml-3"
 onClick={() => setIsDarkMode(!isDarkMode)}
 aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
 role="switch"
 aria-checked={isDarkMode}
 >
 {isDarkMode ? 
 <Sun className="h-5 w-5 text-gray-400" /> : 
 <Moon className="h-5 w-5 text-gray-600" />}
 <span className="sr-only">{isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}</span>
 </button>
 </div>
 </div>
 </div>
 </header>

 <main className="container-fluid py-6">
 <div className="tabs mb-6">
 <button 
 className={`tab-item ${activeTab === 'chat' ? 'tab-active' : ''}`}
 onClick={() => setActiveTab('chat')}
 role="tab"
 aria-selected={activeTab === 'chat'}
 >
 Chat
 </button>
 <button 
 className={`tab-item ${activeTab === 'resources' ? 'tab-active' : ''}`}
 onClick={() => setActiveTab('resources')}
 role="tab"
 aria-selected={activeTab === 'resources'}
 >
 Resources
 </button>
 <button 
 className={`tab-item ${activeTab === 'faq' ? 'tab-active' : ''}`}
 onClick={() => setActiveTab('faq')}
 role="tab"
 aria-selected={activeTab === 'faq'}
 >
 FAQ
 </button>
 </div>

 <div className={`tab-content ${activeTab === 'chat' ? 'block' : 'hidden'}`}>
 <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden theme-transition">
 <div className="p-4 border-b border-gray-200 dark:border-gray-700">
 <h2 className="text-lg font-medium text-gray-900 dark:text-white">Workplace Assistant</h2>
 <p className="text-sm text-gray-500 dark:text-gray-400">Ask any workplace-related questions</p>
 </div>
 
 <div className={`chat-container ${styles.chatContainer}`}>
 {messages.length === 0 ? (
 <div className="flex flex-col items-center justify-center h-64 p-6 text-center">
 <div className="text-gray-400 dark:text-gray-500 mb-4">
 <Search className="h-12 w-12 mx-auto" />
 </div>
 <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No messages yet</h3>
 <p className="text-sm text-gray-500 dark:text-gray-400">
 Start a conversation by asking about workplace policies, procedures, or resources.
 </p>
 </div>
 ) : (
 <div className="p-4 space-y-4 overflow-y-auto" style={{ maxHeight: '500px' }}>
 {messages.map((message) => (
 <div 
 key={message.id} 
 className={`chat-message ${message.type === 'user' ? styles.userMessage : styles.assistantMessage}`}
 >
 <div className="chat-bubble">
 <p className="message-content">{message.content}</p>
 <span className="text-xs text-gray-400 dark:text-gray-500 mt-1 block">
 {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
 </span>
 </div>
 </div>
 ))}
 {isLoading && (
 <div className={`chat-message ${styles.assistantMessage}`}>
 <div className="chat-bubble flex items-center space-x-2">
 <Loader className="h-4 w-4 animate-spin text-gray-500" />
 <span className="text-gray-500 dark:text-gray-400">Typing...</span>
 </div>
 </div>
 )}
 <div ref={messagesEndRef} />
 </div>
 )}
 </div>
 
 <div className="p-4 border-t border-gray-200 dark:border-gray-700">
 <div className="flex space-x-2">
 <input
 type="text"
 className="input flex-1"
 placeholder="Type your question here..."
 value={inputValue}
 onChange={(e) => setInputValue(e.target.value)}
 onKeyDown={handleKeyDown}
 disabled={isLoading}
 aria-label="Message input"
 />
 <button 
 className="btn btn-primary inline-flex items-center"
 onClick={handleSendMessage}
 disabled={isLoading || inputValue.trim() === ''}
 aria-label="Send message"
 >
 {isLoading ? (
 <Loader className="h-5 w-5 animate-spin" />
 ) : (
 <>
 <span className="mr-1">Send</span>
 <Send className="h-4 w-4" />
 </>
 )}
 </button>
 </div>
 <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
 Ask about company policies, procedures, or other workplace questions
 </p>
 </div>
 </div>
 </div>

 <div className={`tab-content ${activeTab === 'resources' ? 'block' : 'hidden'}`}>
 <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden p-6 theme-transition">
 <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-6">Workplace Resources</h2>
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 {resources.map(renderResourceCard)}
 </div>
 </div>
 </div>

 <div className={`tab-content ${activeTab === 'faq' ? 'block' : 'hidden'}`}>
 <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden p-6 theme-transition">
 <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-6">Frequently Asked Questions</h2>
 
 <div className="space-y-6">
 {faqs.map(renderFAQItem)}
 </div>
 </div>
 </div>
 </main>

 <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4 theme-transition">
 <div className="container-fluid text-center text-sm text-gray-500 dark:text-gray-400">
 Copyright (c) 2025 of Datavtar Private Limited. All rights reserved.
 </div>
 </footer>
 </div>
 );
};

export default App;
