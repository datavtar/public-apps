import React, { useState, useEffect } from 'react';
import styles from './styles/styles.module.css';
import { MessageCircle, Users, Settings, LogOut, Sun, Moon, Send, ChevronRight, Phone, Paperclip, Camera, Image, Smile, Mic, Search, Plus, ArrowLeft, Bell, Trash2, Edit, Clock, Mail, Map, Check, X, Info, User, Star, Heart, FileText, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

interface Contact {
 id: string;
 name: string;
 profilePic: string;
 lastMessage: string;
 timestamp: Date;
 unreadCount: number;
}

interface Message {
 id: string;
 senderId: string;
 content: string;
 timestamp: Date;
 status: 'sent' | 'delivered' | 'read' | 'failed';
 type: 'text' | 'image' | 'document' | 'location';
 mediaUrl?: string;
}

interface ChatGroup {
 id: string;
 name: string;
 members: string[];
 profilePic: string;
 lastMessage?: Message;
}

interface Customer {
 id: string;
 name: string;
 phone: string;
 email: string;
 address: string;
 lastContact?: Date;
 orders: number;
 isActive: boolean;
}

interface BroadcastList {
 id: string;
 name: string;
 recipients: string[];
 lastSent?: Date;
}

interface AutoResponse {
 id: string;
 triggerWord: string;
 response: string;
 isActive: boolean;
}

const App: React.FC = () => {
 // State management
 const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
 if (typeof window !== 'undefined') {
 const savedMode = localStorage.getItem('darkMode');
 return savedMode === 'true' || 
 (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
 }
 return false;
 });
 
 const [activeTab, setActiveTab] = useState<'chats' | 'contacts' | 'settings'>('chats');
 const [searchQuery, setSearchQuery] = useState<string>('');
 const [selectedChat, setSelectedChat] = useState<string | null>(null);
 const [messageInput, setMessageInput] = useState<string>('');
 const [showAddCustomerModal, setShowAddCustomerModal] = useState<boolean>(false);
 const [showTemplateModal, setShowTemplateModal] = useState<boolean>(false);
 const [showAutoResponseModal, setShowAutoResponseModal] = useState<boolean>(false);
 
 // Form states
 const [newCustomer, setNewCustomer] = useState<{
 name: string;
 phone: string;
 email: string;
 address: string;
 }>({ name: '', phone: '', email: '', address: '' });
 
 const [newTemplate, setNewTemplate] = useState<{
 name: string;
 content: string;
 }>({ name: '', content: '' });
 
 const [newAutoResponse, setNewAutoResponse] = useState<{
 triggerWord: string;
 response: string;
 isActive: boolean;
 }>({ triggerWord: '', response: '', isActive: true });
 
 // Dummy data
 const [contacts, setContacts] = useState<Contact[]>([
 {
 id: '1',
 name: 'John Doe',
 profilePic: 'https://i.pravatar.cc/150?img=1',
 lastMessage: 'When will my package arrive?',
 timestamp: new Date(2023, 9, 15, 14, 30),
 unreadCount: 2,
 },
 {
 id: '2',
 name: 'Jane Smith',
 profilePic: 'https://i.pravatar.cc/150?img=5',
 lastMessage: 'Thanks for the delivery update!',
 timestamp: new Date(2023, 9, 15, 10, 15),
 unreadCount: 0,
 },
 {
 id: '3',
 name: 'Mark Johnson',
 profilePic: 'https://i.pravatar.cc/150?img=8',
 lastMessage: 'Is there a way to expedite shipping?',
 timestamp: new Date(2023, 9, 14, 18, 45),
 unreadCount: 1,
 },
 {
 id: '4',
 name: 'Sarah Williams',
 profilePic: 'https://i.pravatar.cc/150?img=10',
 lastMessage: 'Package received, thank you!',
 timestamp: new Date(2023, 9, 14, 15, 20),
 unreadCount: 0,
 },
 {
 id: '5',
 name: 'Robert Brown',
 profilePic: 'https://i.pravatar.cc/150?img=12',
 lastMessage: 'Can you provide tracking information?',
 timestamp: new Date(2023, 9, 13, 9, 10),
 unreadCount: 0,
 },
 ]);
 
 const [customers, setCustomers] = useState<Customer[]>([
 {
 id: '1',
 name: 'John Doe',
 phone: '+1 (555) 123-4567',
 email: 'john.doe@example.com',
 address: '123 Main St, Anytown, CA 12345',
 lastContact: new Date(2023, 9, 15, 14, 30),
 orders: 5,
 isActive: true,
 },
 {
 id: '2',
 name: 'Jane Smith',
 phone: '+1 (555) 987-6543',
 email: 'jane.smith@example.com',
 address: '456 Oak Ave, Somewhere, NY 54321',
 lastContact: new Date(2023, 9, 15, 10, 15),
 orders: 3,
 isActive: true,
 },
 {
 id: '3',
 name: 'Mark Johnson',
 phone: '+1 (555) 456-7890',
 email: 'mark.johnson@example.com',
 address: '789 Elm Rd, Nowhere, TX 67890',
 lastContact: new Date(2023, 9, 14, 18, 45),
 orders: 1,
 isActive: true,
 },
 {
 id: '4',
 name: 'Sarah Williams',
 phone: '+1 (555) 234-5678',
 email: 'sarah.williams@example.com',
 address: '101 Pine Dr, Everywhere, FL 13579',
 lastContact: new Date(2023, 9, 14, 15, 20),
 orders: 7,
 isActive: false,
 },
 {
 id: '5',
 name: 'Robert Brown',
 phone: '+1 (555) 876-5432',
 email: 'robert.brown@example.com',
 address: '202 Maple Ln, Anywhere, WA 97531',
 lastContact: new Date(2023, 9, 13, 9, 10),
 orders: 2,
 isActive: true,
 },
 ]);
 
 const [messages, setMessages] = useState<{ [chatId: string]: Message[] }>({
 '1': [
 {
 id: '101',
 senderId: '1',
 content: 'Hi, I ordered a package last week but haven\'t received any updates.',
 timestamp: new Date(2023, 9, 15, 14, 25),
 status: 'read',
 type: 'text',
 },
 {
 id: '102',
 senderId: 'me',
 content: 'Let me check that for you. Could you provide your order number?',
 timestamp: new Date(2023, 9, 15, 14, 27),
 status: 'read',
 type: 'text',
 },
 {
 id: '103',
 senderId: '1',
 content: 'Sure, it\'s ORD-12345.',
 timestamp: new Date(2023, 9, 15, 14, 28),
 status: 'read',
 type: 'text',
 },
 {
 id: '104',
 senderId: '1',
 content: 'When will my package arrive?',
 timestamp: new Date(2023, 9, 15, 14, 30),
 status: 'delivered',
 type: 'text',
 },
 ],
 '2': [
 {
 id: '201',
 senderId: '2',
 content: 'Hello, I just wanted to confirm my delivery for tomorrow.',
 timestamp: new Date(2023, 9, 15, 10, 10),
 status: 'read',
 type: 'text',
 },
 {
 id: '202',
 senderId: 'me',
 content: 'Yes, your delivery is scheduled for tomorrow between 2-4 PM.',
 timestamp: new Date(2023, 9, 15, 10, 12),
 status: 'read',
 type: 'text',
 },
 {
 id: '203',
 senderId: '2',
 content: 'Thanks for the delivery update!',
 timestamp: new Date(2023, 9, 15, 10, 15),
 status: 'read',
 type: 'text',
 },
 ],
 });
 
 const [templates, setTemplates] = useState<{ id: string; name: string; content: string }[]>([
 {
 id: 't1',
 name: 'Delivery Confirmation',
 content: 'Hello, your package with tracking number #TRACKING# is scheduled for delivery on #DATE# between #TIME#. Someone must be present to sign for the package.'
 },
 {
 id: 't2',
 name: 'Shipment Delay',
 content: 'We regret to inform you that your shipment #TRACKING# has been delayed due to #REASON#. The new estimated delivery date is #DATE#. We apologize for any inconvenience.'
 },
 {
 id: 't3',
 name: 'Order Confirmation',
 content: 'Thank you for your order #ORDER#! Your items are being prepared for shipment. You will receive tracking information once your package is on its way.'
 },
 ]);
 
 const [autoResponses, setAutoResponses] = useState<AutoResponse[]>([
 {
 id: 'ar1',
 triggerWord: 'tracking',
 response: 'To check your tracking status, please provide your order number.',
 isActive: true,
 },
 {
 id: 'ar2',
 triggerWord: 'hours',
 response: 'Our business hours are Monday through Friday, 9 AM to 6 PM EST.',
 isActive: true,
 },
 {
 id: 'ar3',
 triggerWord: 'return',
 response: 'For returns, please fill out the return form included with your package or visit our website at www.ourlogistics.com/returns.',
 isActive: false,
 },
 ]);
 
 const [broadcastLists, setBroadcastLists] = useState<BroadcastList[]>([
 {
 id: 'bl1',
 name: 'VIP Customers',
 recipients: ['1', '2'],
 lastSent: new Date(2023, 9, 10, 14, 0),
 },
 {
 id: 'bl2',
 name: 'Local Customers',
 recipients: ['3', '4', '5'],
 lastSent: new Date(2023, 9, 5, 11, 30),
 },
 ]);
 
 // Effects
 useEffect(() => {
 if (isDarkMode) {
 document.documentElement.classList.add('dark');
 localStorage.setItem('darkMode', 'true');
 } else {
 document.documentElement.classList.remove('dark');
 localStorage.setItem('darkMode', 'false');
 }
 }, [isDarkMode]);
 
 // Handlers
 const handleSendMessage = () => {
 if (!messageInput.trim() || !selectedChat) return;
 
 const newMessage: Message = {
 id: `msg-${Date.now()}`,
 senderId: 'me',
 content: messageInput,
 timestamp: new Date(),
 status: 'sent',
 type: 'text',
 };
 
 setMessages(prev => ({
 ...prev,
 [selectedChat]: [...(prev[selectedChat] || []), newMessage],
 }));
 
 // Update last message in contacts
 setContacts(prev => prev.map(contact => {
 if (contact.id === selectedChat) {
 return {
 ...contact,
 lastMessage: messageInput,
 timestamp: new Date(),
 };
 }
 return contact;
 }));
 
 setMessageInput('');
 };
 
 const handleAddCustomer = (e: React.FormEvent) => {
 e.preventDefault();
 
 const newCustomerId = `cust-${Date.now()}`;
 const customerToAdd: Customer = {
 id: newCustomerId,
 name: newCustomer.name,
 phone: newCustomer.phone,
 email: newCustomer.email,
 address: newCustomer.address,
 orders: 0,
 isActive: true,
 };
 
 setCustomers(prev => [...prev, customerToAdd]);
 setContacts(prev => [...prev, {
 id: newCustomerId,
 name: newCustomer.name,
 profilePic: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 20) + 1}`,
 lastMessage: '',
 timestamp: new Date(),
 unreadCount: 0,
 }]);
 
 setNewCustomer({ name: '', phone: '', email: '', address: '' });
 setShowAddCustomerModal(false);
 };
 
 const handleAddTemplate = (e: React.FormEvent) => {
 e.preventDefault();
 
 setTemplates(prev => [...prev, {
 id: `t${prev.length + 1}`,
 name: newTemplate.name,
 content: newTemplate.content,
 }]);
 
 setNewTemplate({ name: '', content: '' });
 setShowTemplateModal(false);
 };
 
 const handleAddAutoResponse = (e: React.FormEvent) => {
 e.preventDefault();
 
 setAutoResponses(prev => [...prev, {
 id: `ar${prev.length + 1}`,
 triggerWord: newAutoResponse.triggerWord,
 response: newAutoResponse.response,
 isActive: newAutoResponse.isActive,
 }]);
 
 setNewAutoResponse({ triggerWord: '', response: '', isActive: true });
 setShowAutoResponseModal(false);
 };
 
 const filteredContacts = contacts.filter(contact => {
 return contact.name.toLowerCase().includes(searchQuery.toLowerCase());
 });
 
 const filteredCustomers = customers.filter(customer => {
 return customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
 customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
 customer.phone.includes(searchQuery);
 });
 
 // Insert template into message
 const insertTemplate = (templateContent: string) => {
 setMessageInput(templateContent.replace('#DATE#', format(new Date(), 'MM/dd/yyyy'))
 .replace('#TIME#', '2-4 PM')
 .replace('#TRACKING#', 'TRK12345678')
 .replace('#ORDER#', 'ORD-' + Math.floor(Math.random() * 10000))
 .replace('#REASON#', 'weather conditions'));
 };
 
 // Toggle auto response active status
 const toggleAutoResponseStatus = (id: string) => {
 setAutoResponses(prev => prev.map(ar => {
 if (ar.id === id) {
 return {
 ...ar,
 isActive: !ar.isActive,
 };
 }
 return ar;
 }));
 };
 
 return (
 <div className={`flex flex-col h-screen ${isDarkMode ? 'dark' : ''} bg-gray-50 dark:bg-gray-900`}>
 {/* Header */}
 <header className="bg-white dark:bg-gray-800 shadow-sm p-4 border-b border-gray-200 dark:border-gray-700">
 <div className="flex items-center justify-between">
 <div className="flex items-center">
 <div className="flex-shrink-0">
 <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400">
 LogiChat
 </h1>
 </div>
 <div className="ml-4 text-sm text-gray-500 dark:text-gray-400 hidden md:block">
 Logistics Communication Platform
 </div>
 </div>
 <div className="flex items-center space-x-4">
 <button 
 className="btn-sm bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 p-2 rounded-full relative"
 aria-label="Notifications"
 >
 <Bell size={20} />
 <span className="absolute top-0 right-0 bg-red-500 h-2 w-2 rounded-full"></span>
 </button>
 <button 
 className="btn-sm bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 p-2 rounded-full"
 onClick={() => setIsDarkMode(!isDarkMode)}
 aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
 >
 {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
 </button>
 </div>
 </div>
 </header>

 {/* Main Content */}
 <div className="flex flex-1 overflow-hidden">
 {/* Sidebar */}
 <div className="w-16 md:w-20 bg-gray-100 dark:bg-gray-800 flex flex-col items-center py-4 border-r border-gray-200 dark:border-gray-700">
 <button
 className={`${activeTab === 'chats' ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400' : 'bg-transparent text-gray-500 dark:text-gray-400'} p-3 rounded-xl mb-4 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors`}
 onClick={() => setActiveTab('chats')}
 aria-label="Chats"
 >
 <MessageCircle size={24} />
 </button>
 <button
 className={`${activeTab === 'contacts' ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400' : 'bg-transparent text-gray-500 dark:text-gray-400'} p-3 rounded-xl mb-4 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors`}
 onClick={() => setActiveTab('contacts')}
 aria-label="Contacts"
 >
 <Users size={24} />
 </button>
 <button
 className={`${activeTab === 'settings' ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400' : 'bg-transparent text-gray-500 dark:text-gray-400'} p-3 rounded-xl mb-4 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors`}
 onClick={() => setActiveTab('settings')}
 aria-label="Settings"
 >
 <Settings size={24} />
 </button>
 <div className="flex-grow"></div>
 <button className="p-3 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" aria-label="Logout">
 <LogOut size={24} />
 </button>
 </div>

 {/* Content */}
 <div className="flex-1 flex flex-col">
 {activeTab === 'chats' && (
 <div className="flex h-full">
 {/* Chat List */}
 <div className={`${selectedChat ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700`}>
 <div className="p-4 border-b border-gray-200 dark:border-gray-700">
 <div className="relative">
 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
 <Search size={18} className="text-gray-400" />
 </div>
 <input
 type="text"
 className="input pl-10 w-full bg-gray-100 dark:bg-gray-700 placeholder-gray-400"
 placeholder="Search conversations"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 />
 </div>
 </div>
 
 <div className="flex-1 overflow-y-auto">
 {filteredContacts.length > 0 ? (
 filteredContacts.map(contact => (
 <div 
 key={contact.id}
 className={`flex items-center p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer ${selectedChat === contact.id ? 'bg-primary-50 dark:bg-primary-900/20' : ''}`}
 onClick={() => setSelectedChat(contact.id)}
 >
 <div className="relative">
 <img 
 src={contact.profilePic} 
 alt={contact.name} 
 className="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-gray-600" 
 />
 {contact.unreadCount > 0 && (
 <div className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
 {contact.unreadCount}
 </div>
 )}
 </div>
 <div className="ml-3 flex-1 overflow-hidden">
 <div className="flex justify-between items-baseline">
 <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">{contact.name}</h3>
 <span className="text-xs text-gray-500 dark:text-gray-400">
 {format(contact.timestamp, 'h:mm a')}
 </span>
 </div>
 <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">
 {contact.lastMessage}
 </p>
 </div>
 </div>
 ))
 ) : (
 <div className="flex flex-col items-center justify-center h-full p-4 text-center">
 <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-full mb-4">
 <Search size={24} className="text-gray-500 dark:text-gray-400" />
 </div>
 <p className="text-gray-500 dark:text-gray-400">No contacts found</p>
 <button 
 className="btn btn-primary mt-4"
 onClick={() => setShowAddCustomerModal(true)}
 >
 Add New Customer
 </button>
 </div>
 )}
 </div>
 </div>
 
 {/* Chat Messages */}
 {selectedChat ? (
 <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900">
 {/* Chat Header */}
 <div className="bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700 flex items-center">
 <button 
 className="md:hidden mr-2 text-gray-500 dark:text-gray-400"
 onClick={() => setSelectedChat(null)}
 aria-label="Back"
 >
 <ArrowLeft size={20} />
 </button>
 <img 
 src={contacts.find(c => c.id === selectedChat)?.profilePic} 
 alt="Profile" 
 className="w-10 h-10 rounded-full object-cover" 
 />
 <div className="ml-3 flex-1">
 <h3 className="font-medium text-gray-900 dark:text-gray-100">
 {contacts.find(c => c.id === selectedChat)?.name}
 </h3>
 <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
 <span className="inline-block h-2 w-2 rounded-full bg-green-500 mr-2"></span>
 Online
 </div>
 </div>
 <div className="flex">
 <button className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full" aria-label="Call">
 <Phone size={20} />
 </button>
 <button className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full" aria-label="More options">
 <Info size={20} />
 </button>
 </div>
 </div>
 
 {/* Messages */}
 <div className="flex-1 overflow-y-auto p-4 space-y-4">
 {messages[selectedChat] ? (
 messages[selectedChat].map((message, index) => (
 <div 
 key={message.id} 
 className={`flex ${message.senderId === 'me' ? 'justify-end' : 'justify-start'}`}
 >
 <div 
 className={`max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg rounded-lg px-4 py-2 ${message.senderId === 'me' 
 ? 'bg-primary-500 text-white' 
 : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200'} shadow-sm`}
 >
 {message.type === 'text' ? (
 <p>{message.content}</p>
 ) : message.type === 'image' ? (
 <div>
 <img src={message.mediaUrl} alt="Message attachment" className="rounded max-w-full" />
 {message.content && <p className="mt-1">{message.content}</p>}
 </div>
 ) : message.type === 'document' ? (
 <div className="flex items-center bg-gray-50 dark:bg-gray-800 rounded p-2">
 <FileText size={20} className="text-gray-500 dark:text-gray-400 mr-2" />
 <span className="text-sm">{message.content}</span>
 </div>
 ) : (
 <div className="flex items-center bg-gray-50 dark:bg-gray-800 rounded p-2">
 <Map size={20} className="text-gray-500 dark:text-gray-400 mr-2" />
 <span className="text-sm">Location shared</span>
 </div>
 )}
 <div className={`text-xs mt-1 ${message.senderId === 'me' ? 'text-primary-200' : 'text-gray-500 dark:text-gray-400'}`}>
 {format(message.timestamp, 'h:mm a')}
 {message.senderId === 'me' && (
 <span className="ml-2">
 {message.status === 'sent' ? (
 <Check size={12} className="inline" />
 ) : message.status === 'delivered' ? (
 <div className="inline-flex">
 <Check size={12} className="inline" />
 <Check size={12} className="inline -ml-1" />
 </div>
 ) : message.status === 'read' ? (
 <div className="inline-flex text-blue-400">
 <Check size={12} className="inline" />
 <Check size={12} className="inline -ml-1" />
 </div>
 ) : (
 <X size={12} className="inline text-red-500" />
 )}
 </span>
 )}
 </div>
 </div>
 </div>
 ))
 ) : (
 <div className="flex items-center justify-center h-full">
 <div className="text-center">
 <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-full inline-block mb-4">
 <MessageSquare size={32} className="text-gray-400" />
 </div>
 <p className="text-gray-500 dark:text-gray-400">No messages yet</p>
 <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Send a message to start a conversation</p>
 </div>
 </div>
 )}
 </div>
 
 {/* Templates Bar */}
 <div className="bg-gray-50 dark:bg-gray-800 p-3 border-t border-gray-200 dark:border-gray-700">
 <div className="flex gap-2 overflow-x-auto pb-2">
 {templates.map(template => (
 <button 
 key={template.id}
 className="btn btn-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 whitespace-nowrap border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-650"
 onClick={() => insertTemplate(template.content)}
 >
 {template.name}
 </button>
 ))}
 </div>
 </div>
 
 {/* Message Input */}
 <div className="bg-white dark:bg-gray-800 p-4 border-t border-gray-200 dark:border-gray-700">
 <div className="flex">
 <div className="flex items-center space-x-2 mr-3">
 <button className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full" aria-label="Attach">
 <Paperclip size={20} />
 </button>
 <button className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full" aria-label="Camera">
 <Camera size={20} />
 </button>
 </div>
 <div className="flex-1 relative">
 <input
 type="text"
 className="input w-full pr-12 bg-gray-100 dark:bg-gray-700"
 placeholder="Type a message"
 value={messageInput}
 onChange={(e) => setMessageInput(e.target.value)}
 onKeyPress={(e) => {
 if (e.key === 'Enter') {
 handleSendMessage();
 }
 }}
 />
 <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full" aria-label="Emoji">
 <Smile size={20} />
 </button>
 </div>
 <button 
 className="ml-3 p-3 bg-primary-500 text-white rounded-full hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
 onClick={handleSendMessage}
 disabled={!messageInput.trim()}
 aria-label="Send message"
 >
 <Send size={18} />
 </button>
 </div>
 </div>
 </div>
 ) : (
 <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
 <div className="text-center max-w-md">
 <div className="mx-auto bg-white dark:bg-gray-800 rounded-full p-8 w-32 h-32 flex items-center justify-center shadow-md mb-6">
 <MessageCircle size={64} className="text-primary-500" />
 </div>
 <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">LogiChat</h2>
 <p className="text-gray-600 dark:text-gray-300 mb-6">
 Select a conversation from the list or start a new chat to communicate with your customers.
 </p>
 <button 
 className="btn btn-primary"
 onClick={() => setShowAddCustomerModal(true)}
 >
 <Plus size={18} className="mr-1" /> Add New Customer
 </button>
 </div>
 </div>
 )}
 </div>
 )}

 {activeTab === 'contacts' && (
 <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
 <div className="bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
 <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Customer Contacts</h2>
 <button 
 className="btn btn-primary"
 onClick={() => setShowAddCustomerModal(true)}
 >
 <Plus size={18} className="mr-1" /> Add Customer
 </button>
 </div>
 
 <div className="p-4">
 <div className="relative">
 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
 <Search size={18} className="text-gray-400" />
 </div>
 <input
 type="text"
 className="input pl-10 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 shadow-sm"
 placeholder="Search customers by name, email, or phone"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 />
 </div>
 </div>
 
 <div className="flex-1 overflow-y-auto p-4">
 <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
 <div className="table-container">
 <table className="table w-full">
 <thead>
 <tr>
 <th className="table-header">Name</th>
 <th className="table-header hidden md:table-cell">Contact</th>
 <th className="table-header hidden lg:table-cell">Orders</th>
 <th className="table-header hidden md:table-cell">Status</th>
 <th className="table-header">Actions</th>
 </tr>
 </thead>
 <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
 {filteredCustomers.length > 0 ? (
 filteredCustomers.map(customer => (
 <tr key={customer.id}>
 <td className="table-cell">
 <div className="flex items-center">
 <div className="flex-shrink-0 h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mr-3">
 <User size={20} className="text-gray-500 dark:text-gray-400" />
 </div>
 <div>
 <div className="font-medium text-gray-900 dark:text-white">{customer.name}</div>
 <div className="text-sm text-gray-500 dark:text-gray-400">{customer.email}</div>
 </div>
 </div>
 </td>
 <td className="table-cell hidden md:table-cell">
 <div className="text-sm text-gray-900 dark:text-gray-200">{customer.phone}</div>
 <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">{customer.address}</div>
 </td>
 <td className="table-cell hidden lg:table-cell">
 <div className="text-sm text-gray-900 dark:text-gray-200">{customer.orders}</div>
 {customer.lastContact && (
 <div className="text-xs text-gray-500 dark:text-gray-400">
 Last contact: {format(customer.lastContact, 'MMM d, yyyy')}
 </div>
 )}
 </td>
 <td className="table-cell hidden md:table-cell">
 <span className={`badge ${customer.isActive ? 'badge-success' : 'badge-error'}`}>
 {customer.isActive ? 'Active' : 'Inactive'}
 </span>
 </td>
 <td className="table-cell">
 <div className="flex space-x-2">
 <button 
 className="btn btn-sm btn-primary"
 onClick={() => {
 const contact = contacts.find(c => c.id === customer.id);
 if (contact) {
 setSelectedChat(customer.id);
 setActiveTab('chats');
 } else {
 // Add as contact if not exists
 setContacts(prev => [...prev, {
 id: customer.id,
 name: customer.name,
 profilePic: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 20) + 1}`,
 lastMessage: '',
 timestamp: new Date(),
 unreadCount: 0,
 }]);
 setSelectedChat(customer.id);
 setActiveTab('chats');
 }
 }}
 >
 <MessageCircle size={16} className="mr-1" /> Message
 </button>
 <button className="btn btn-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600">
 <Edit size={16} />
 </button>
 </div>
 </td>
 </tr>
 ))
 ) : (
 <tr>
 <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
 No customers found. Try a different search or add a new customer.
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 </div>
 )}

 {activeTab === 'settings' && (
 <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 overflow-y-auto">
 <div className="bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700">
 <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Settings</h2>
 </div>
 
 <div className="p-4 space-y-4">
 {/* Message Templates */}
 <div className="card">
 <div className="flex justify-between items-center mb-4">
 <h3 className="text-lg font-medium text-gray-900 dark:text-white">Message Templates</h3>
 <button 
 className="btn btn-sm btn-primary"
 onClick={() => setShowTemplateModal(true)}
 >
 <Plus size={16} className="mr-1" /> Add Template
 </button>
 </div>
 
 <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg divide-y divide-gray-200 dark:divide-gray-600">
 {templates.map(template => (
 <div key={template.id} className="p-4">
 <div className="flex justify-between items-start">
 <div>
 <h4 className="font-medium text-gray-900 dark:text-white">{template.name}</h4>
 <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{template.content}</p>
 </div>
 <div className="flex items-center space-x-2">
 <button className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 rounded" aria-label="Edit template">
 <Edit size={16} />
 </button>
 <button className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded" aria-label="Delete template">
 <Trash2 size={16} />
 </button>
 </div>
 </div>
 </div>
 ))}
 </div>
 </div>

 {/* Auto Responses */}
 <div className="card">
 <div className="flex justify-between items-center mb-4">
 <h3 className="text-lg font-medium text-gray-900 dark:text-white">Auto Responses</h3>
 <button 
 className="btn btn-sm btn-primary"
 onClick={() => setShowAutoResponseModal(true)}
 >
 <Plus size={16} className="mr-1" /> Add Response
 </button>
 </div>
 
 <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg divide-y divide-gray-200 dark:divide-gray-600">
 {autoResponses.map(autoResponse => (
 <div key={autoResponse.id} className="p-4">
 <div className="flex justify-between items-start">
 <div>
 <div className="flex items-center">
 <h4 className="font-medium text-gray-900 dark:text-white">Trigger: "{autoResponse.triggerWord}"</h4>
 <span className={`ml-2 badge ${autoResponse.isActive ? 'badge-success' : 'badge-error'}`}>
 {autoResponse.isActive ? 'Active' : 'Inactive'}
 </span>
 </div>
 <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{autoResponse.response}</p>
 </div>
 <div className="flex items-center space-x-2">
 <button 
 className={`p-2 ${autoResponse.isActive ? 'text-green-500' : 'text-gray-400'} hover:bg-gray-100 dark:hover:bg-gray-600 rounded`}
 onClick={() => toggleAutoResponseStatus(autoResponse.id)}
 aria-label={autoResponse.isActive ? 'Deactivate response' : 'Activate response'}
 >
 {autoResponse.isActive ? <Check size={16} /> : <X size={16} />}
 </button>
 <button className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 rounded" aria-label="Edit auto response">
 <Edit size={16} />
 </button>
 <button className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded" aria-label="Delete auto response">
 <Trash2 size={16} />
 </button>
 </div>
 </div>
 </div>
 ))}
 </div>
 </div>

 {/* Broadcast Lists */}
 <div className="card">
 <div className="flex justify-between items-center mb-4">
 <h3 className="text-lg font-medium text-gray-900 dark:text-white">Broadcast Lists</h3>
 <button className="btn btn-sm btn-primary">
 <Plus size={16} className="mr-1" /> Create List
 </button>
 </div>
 
 <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg divide-y divide-gray-200 dark:divide-gray-600">
 {broadcastLists.map(list => (
 <div key={list.id} className="p-4">
 <div className="flex justify-between items-start">
 <div>
 <h4 className="font-medium text-gray-900 dark:text-white">{list.name}</h4>
 <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
 {list.recipients.length} recipients 
 {list.lastSent && (
 <span className="ml-2">• Last sent: {format(list.lastSent, 'MMM d, yyyy')}</span>
 )}
 </p>
 </div>
 <div className="flex items-center space-x-2">
 <button className="btn btn-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600">
 <MessageCircle size={16} className="mr-1" /> Broadcast
 </button>
 <button className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 rounded" aria-label="Edit broadcast list">
 <Edit size={16} />
 </button>
 </div>
 </div>
 </div>
 ))}
 </div>
 </div>

 {/* General Settings */}
 <div className="card">
 <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">General Settings</h3>
 
 <div className="space-y-4">
 <div className="flex items-center justify-between">
 <div>
 <h4 className="font-medium text-gray-900 dark:text-white">Dark Mode</h4>
 <p className="text-sm text-gray-500 dark:text-gray-400">Toggle between light and dark theme</p>
 </div>
 <button 
 className="theme-toggle"
 onClick={() => setIsDarkMode(!isDarkMode)}
 aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
 >
 <span className={`theme-toggle-thumb ${isDarkMode ? 'theme-toggle-thumb-dark' : ''}`}></span>
 </button>
 </div>
 
 <div className="flex items-center justify-between">
 <div>
 <h4 className="font-medium text-gray-900 dark:text-white">Notifications</h4>
 <p className="text-sm text-gray-500 dark:text-gray-400">Enable desktop notifications</p>
 </div>
 <button className="theme-toggle">
 <span className="theme-toggle-thumb"></span>
 </button>
 </div>
 
 <div className="flex items-center justify-between">
 <div>
 <h4 className="font-medium text-gray-900 dark:text-white">Sound Alerts</h4>
 <p className="text-sm text-gray-500 dark:text-gray-400">Play sounds for new messages</p>
 </div>
 <button className="theme-toggle">
 <span className="theme-toggle-thumb theme-toggle-thumb-dark"></span>
 </button>
 </div>
 </div>
 </div>
 </div>
 </div>
 )}
 </div>
 </div>

 {/* Add Customer Modal */}
 {showAddCustomerModal && (
 <div className="modal-backdrop" onClick={() => setShowAddCustomerModal(false)}>
 <div className="modal-content max-w-md" onClick={e => e.stopPropagation()}>
 <div className="modal-header">
 <h3 className="text-lg font-medium text-gray-900 dark:text-white">Add New Customer</h3>
 <button 
 className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
 onClick={() => setShowAddCustomerModal(false)}
 aria-label="Close"
 >
 ×
 </button>
 </div>
 <form onSubmit={handleAddCustomer}>
 <div className="mt-4 space-y-4">
 <div className="form-group">
 <label className="form-label" htmlFor="customer-name">Name</label>
 <input
 id="customer-name"
 type="text"
 className="input"
 value={newCustomer.name}
 onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
 required
 />
 </div>
 
 <div className="form-group">
 <label className="form-label" htmlFor="customer-phone">Phone</label>
 <input
 id="customer-phone"
 type="tel"
 className="input"
 value={newCustomer.phone}
 onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
 required
 />
 </div>
 
 <div className="form-group">
 <label className="form-label" htmlFor="customer-email">Email</label>
 <input
 id="customer-email"
 type="email"
 className="input"
 value={newCustomer.email}
 onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
 />
 </div>
 
 <div className="form-group">
 <label className="form-label" htmlFor="customer-address">Address</label>
 <input
 id="customer-address"
 type="text"
 className="input"
 value={newCustomer.address}
 onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})}
 />
 </div>
 </div>
 
 <div className="modal-footer">
 <button 
 type="button" 
 className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
 onClick={() => setShowAddCustomerModal(false)}
 >
 Cancel
 </button>
 <button type="submit" className="btn btn-primary">
 Add Customer
 </button>
 </div>
 </form>
 </div>
 </div>
 )}

 {/* Add Template Modal */}
 {showTemplateModal && (
 <div className="modal-backdrop" onClick={() => setShowTemplateModal(false)}>
 <div className="modal-content max-w-md" onClick={e => e.stopPropagation()}>
 <div className="modal-header">
 <h3 className="text-lg font-medium text-gray-900 dark:text-white">Add Message Template</h3>
 <button 
 className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
 onClick={() => setShowTemplateModal(false)}
 aria-label="Close"
 >
 ×
 </button>
 </div>
 <form onSubmit={handleAddTemplate}>
 <div className="mt-4 space-y-4">
 <div className="form-group">
 <label className="form-label" htmlFor="template-name">Template Name</label>
 <input
 id="template-name"
 type="text"
 className="input"
 value={newTemplate.name}
 onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
 required
 />
 </div>
 
 <div className="form-group">
 <label className="form-label" htmlFor="template-content">Template Content</label>
 <textarea
 id="template-content"
 className="input h-32"
 value={newTemplate.content}
 onChange={(e) => setNewTemplate({...newTemplate, content: e.target.value})}
 required
 ></textarea>
 <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
 Use #DATE#, #TIME#, #TRACKING#, #ORDER#, #REASON# as placeholders that will be replaced with actual values.
 </p>
 </div>
 </div>
 
 <div className="modal-footer">
 <button 
 type="button" 
 className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
 onClick={() => setShowTemplateModal(false)}
 >
 Cancel
 </button>
 <button type="submit" className="btn btn-primary">
 Add Template
 </button>
 </div>
 </form>
 </div>
 </div>
 )}

 {/* Add Auto Response Modal */}
 {showAutoResponseModal && (
 <div className="modal-backdrop" onClick={() => setShowAutoResponseModal(false)}>
 <div className="modal-content max-w-md" onClick={e => e.stopPropagation()}>
 <div className="modal-header">
 <h3 className="text-lg font-medium text-gray-900 dark:text-white">Add Auto Response</h3>
 <button 
 className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
 onClick={() => setShowAutoResponseModal(false)}
 aria-label="Close"
 >
 ×
 </button>
 </div>
 <form onSubmit={handleAddAutoResponse}>
 <div className="mt-4 space-y-4">
 <div className="form-group">
 <label className="form-label" htmlFor="trigger-word">Trigger Word/Phrase</label>
 <input
 id="trigger-word"
 type="text"
 className="input"
 value={newAutoResponse.triggerWord}
 onChange={(e) => setNewAutoResponse({...newAutoResponse, triggerWord: e.target.value})}
 required
 />
 <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
 When a customer mentions this word, the auto response will be sent.
 </p>
 </div>
 
 <div className="form-group">
 <label className="form-label" htmlFor="response-content">Response Message</label>
 <textarea
 id="response-content"
 className="input h-32"
 value={newAutoResponse.response}
 onChange={(e) => setNewAutoResponse({...newAutoResponse, response: e.target.value})}
 required
 ></textarea>
 </div>
 
 <div className="flex items-center">
 <input
 id="is-active"
 type="checkbox"
 className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
 checked={newAutoResponse.isActive}
 onChange={(e) => setNewAutoResponse({...newAutoResponse, isActive: e.target.checked})}
 />
 <label htmlFor="is-active" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
 Activate this auto response
 </label>
 </div>
 </div>
 
 <div className="modal-footer">
 <button 
 type="button" 
 className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
 onClick={() => setShowAutoResponseModal(false)}
 >
 Cancel
 </button>
 <button type="submit" className="btn btn-primary">
 Add Auto Response
 </button>
 </div>
 </form>
 </div>
 </div>
 )}

 {/* Footer */}
 <footer className="bg-white dark:bg-gray-800 py-4 px-4 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-500 dark:text-gray-400">
 Copyright (c) 2025 of Datavtar Private Limited. All rights reserved.
 </footer>
 </div>
 );
};

export default App;