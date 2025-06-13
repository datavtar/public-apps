import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './contexts/authContext';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Users, MessageSquare, Calendar, MapPin, Settings, Search, Plus, Send, 
  User, Bell, Heart, Share2, Bookmark, ChevronRight, Star, Briefcase,
  Coffee, Video, Phone, Filter, Download, Upload, Trash2, Edit, Eye,
  Building, Clock, Award, Target, Globe, Lightbulb, Handshake, Moon, Sun,
  Menu, X, ChevronDown, Tag, FileText, Camera, Mic, Image, CheckCircle,
  AlertCircle, Zap, TrendingUp, Navigation, Shield, Key, Mail, Pin, UserPlus
} from 'lucide-react';

// Types and Interfaces
interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'file';
  reactions?: { emoji: string; count: number; users: string[] }[];
  replies?: Message[];
}

interface ChatRoom {
  id: string;
  name: string;
  description: string;
  category: 'general' | 'location' | 'interest' | 'business';
  location?: string;
  memberCount: number;
  isPrivate: boolean;
  lastMessage?: Message;
  unreadCount: number;
}

interface Event {
  id: string;
  title: string;
  description: string;
  organizer: string;
  organizerId: string;
  date: Date;
  location: string;
  capacity: number;
  attendees: string[];
  tags: string[];
  type: 'networking' | 'workshop' | 'social' | 'business';
  isOnline: boolean;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  title: string;
  company: string;
  bio: string;
  skills: string[];
  interests: string[];
  location: string;
  avatar: string;
  isOnline: boolean;
  lastSeen: Date;
  connections: string[];
  rating: number;
  verified: boolean;
}

interface ForumPost {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  timestamp: Date;
  likes: number;
  likedBy: string[];
  replies: number;
  views: number;
  isPinned: boolean;
}

interface Notification {
  id: string;
  type: 'message' | 'event' | 'connection' | 'mention' | 'like';
  title: string;
  content: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

interface BusinessCard {
  id: string;
  userId: string;
  name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  linkedin: string;
  website: string;
  location: string;
  qrCode: string;
}

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

const App: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { isDark, toggleDarkMode } = useDarkMode();
  const aiLayerRef = useRef<AILayerHandle>(null);

  // Core state
  const [activeTab, setActiveTab] = useState('chats');
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showBusinessCard, setShowBusinessCard] = useState(false);

  // AI state
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<any | null>(null);
  const [showAiAssistant, setShowAiAssistant] = useState(false);

  // Data states
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [messages, setMessages] = useState<{ [roomId: string]: Message[] }>({});
  const [events, setEvents] = useState<Event[]>([]);
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);
  const [forumPosts, setForumPosts] = useState<ForumPost[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [businessCards, setBusinessCards] = useState<BusinessCard[]>([]);

  // Form states
  const [newMessage, setNewMessage] = useState('');
  const [newEventForm, setNewEventForm] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    capacity: 20,
    type: 'networking' as Event['type'],
    isOnline: false,
    tags: ''
  });
  const [newRoomForm, setNewRoomForm] = useState({
    name: '',
    description: '',
    category: 'general' as ChatRoom['category'],
    location: '',
    isPrivate: false
  });

  // Initialize data
  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = () => {
    // Load from localStorage or set defaults
    const savedRooms = localStorage.getItem('weconnect_rooms');
    const savedMessages = localStorage.getItem('weconnect_messages');
    const savedEvents = localStorage.getItem('weconnect_events');
    const savedProfiles = localStorage.getItem('weconnect_profiles');
    const savedPosts = localStorage.getItem('weconnect_posts');
    const savedNotifications = localStorage.getItem('weconnect_notifications');
    const savedBusinessCards = localStorage.getItem('weconnect_business_cards');

    if (savedRooms) {
      setChatRooms(JSON.parse(savedRooms));
    } else {
      const defaultRooms: ChatRoom[] = [
        {
          id: '1',
          name: 'General Discussion',
          description: 'General conversations and networking',
          category: 'general',
          memberCount: 245,
          isPrivate: false,
          unreadCount: 3,
          lastMessage: {
            id: '1',
            senderId: 'user1',
            senderName: 'Priya Sharma',
            senderAvatar: '/api/placeholder/32/32',
            content: 'Looking forward to the networking event tomorrow!',
            timestamp: new Date(2025, 5, 12, 15, 30),
            type: 'text'
          }
        },
        {
          id: '2',
          name: 'Mumbai BKC',
          description: 'WeWork Bandra Kurla Complex community',
          category: 'location',
          location: 'Mumbai BKC',
          memberCount: 89,
          isPrivate: false,
          unreadCount: 0
        },
        {
          id: '3',
          name: 'Tech Entrepreneurs',
          description: 'For startup founders and tech entrepreneurs',
          category: 'business',
          memberCount: 156,
          isPrivate: false,
          unreadCount: 7
        },
        {
          id: '4',
          name: 'Coffee & Code',
          description: 'Developers and programmers hangout',
          category: 'interest',
          memberCount: 78,
          isPrivate: false,
          unreadCount: 2
        }
      ];
      setChatRooms(defaultRooms);
      localStorage.setItem('weconnect_rooms', JSON.stringify(defaultRooms));
    }

    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    } else {
      const defaultMessages = {
        '1': [
          {
            id: '1',
            senderId: 'user1',
            senderName: 'Priya Sharma',
            senderAvatar: '/api/placeholder/32/32',
            content: 'Looking forward to the networking event tomorrow!',
            timestamp: new Date(2025, 5, 12, 15, 30),
            type: 'text' as const
          },
          {
            id: '2',
            senderId: 'user2',
            senderName: 'Rahul Gupta',
            senderAvatar: '/api/placeholder/32/32',
            content: 'Me too! It should be great for finding potential collaborators.',
            timestamp: new Date(2025, 5, 12, 15, 45),
            type: 'text' as const
          }
        ]
      };
      setMessages(defaultMessages);
      localStorage.setItem('weconnect_messages', JSON.stringify(defaultMessages));
    }

    if (savedEvents) {
      setEvents(JSON.parse(savedEvents).map((e: any) => ({ ...e, date: new Date(e.date) })));
    } else {
      const defaultEvents: Event[] = [
        {
          id: '1',
          title: 'Monthly Networking Mixer',
          description: 'Connect with fellow entrepreneurs and professionals in a relaxed environment',
          organizer: 'WeWork Community Team',
          organizerId: 'wework1',
          date: new Date(2025, 5, 14, 18, 0),
          location: 'WeWork BKC, Mumbai',
          capacity: 50,
          attendees: ['user1', 'user2', 'user3'],
          tags: ['networking', 'business', 'mixer'],
          type: 'networking',
          isOnline: false
        },
        {
          id: '2',
          title: 'Digital Marketing Workshop',
          description: 'Learn advanced digital marketing strategies from industry experts',
          organizer: 'Anjali Mehta',
          organizerId: 'user4',
          date: new Date(2025, 5, 16, 14, 0),
          location: 'Online',
          capacity: 100,
          attendees: ['user1', 'user5'],
          tags: ['workshop', 'marketing', 'digital'],
          type: 'workshop',
          isOnline: true
        }
      ];
      setEvents(defaultEvents);
      localStorage.setItem('weconnect_events', JSON.stringify(defaultEvents));
    }

    if (savedProfiles) {
      setUserProfiles(JSON.parse(savedProfiles).map((p: any) => ({ ...p, lastSeen: new Date(p.lastSeen) })));
    } else {
      const defaultProfiles: UserProfile[] = [
        {
          id: 'user1',
          name: 'Priya Sharma',
          email: 'priya@example.com',
          title: 'Product Manager',
          company: 'TechCorp India',
          bio: 'Passionate about building products that solve real problems. Love connecting with fellow entrepreneurs.',
          skills: ['Product Management', 'Strategy', 'Analytics'],
          interests: ['Startups', 'Technology', 'Travel'],
          location: 'Mumbai BKC',
          avatar: '/api/placeholder/40/40',
          isOnline: true,
          lastSeen: new Date(),
          connections: ['user2', 'user3'],
          rating: 4.8,
          verified: true
        },
        {
          id: 'user2',
          name: 'Rahul Gupta',
          email: 'rahul@example.com',
          title: 'Software Engineer',
          company: 'StartupXYZ',
          bio: 'Full-stack developer with a passion for creating innovative solutions.',
          skills: ['React', 'Node.js', 'Python'],
          interests: ['Coding', 'Gaming', 'Photography'],
          location: 'Bangalore',
          avatar: '/api/placeholder/40/40',
          isOnline: false,
          lastSeen: new Date(2025, 5, 12, 14, 0),
          connections: ['user1', 'user4'],
          rating: 4.6,
          verified: true
        }
      ];
      setUserProfiles(defaultProfiles);
      localStorage.setItem('weconnect_profiles', JSON.stringify(defaultProfiles));
    }

    if (savedPosts) {
      setForumPosts(JSON.parse(savedPosts).map((p: any) => ({ ...p, timestamp: new Date(p.timestamp) })));
    } else {
      const defaultPosts: ForumPost[] = [
        {
          id: '1',
          authorId: 'user1',
          authorName: 'Priya Sharma',
          authorAvatar: '/api/placeholder/32/32',
          title: 'Best Practices for Remote Team Management',
          content: 'Sharing some insights from managing distributed teams across multiple time zones...',
          category: 'Business',
          tags: ['remote-work', 'management', 'productivity'],
          timestamp: new Date(2025, 5, 12, 10, 0),
          likes: 23,
          likedBy: ['user2', 'user3'],
          replies: 8,
          views: 156,
          isPinned: false
        }
      ];
      setForumPosts(defaultPosts);
      localStorage.setItem('weconnect_posts', JSON.stringify(defaultPosts));
    }

    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications).map((n: any) => ({ ...n, timestamp: new Date(n.timestamp) })));
    } else {
      const defaultNotifications: Notification[] = [
        {
          id: '1',
          type: 'event',
          title: 'Event Reminder',
          content: 'Monthly Networking Mixer starts in 2 hours',
          timestamp: new Date(2025, 5, 14, 16, 0),
          read: false
        },
        {
          id: '2',
          type: 'connection',
          title: 'New Connection Request',
          content: 'Anjali Mehta wants to connect with you',
          timestamp: new Date(2025, 5, 13, 14, 30),
          read: false
        }
      ];
      setNotifications(defaultNotifications);
      localStorage.setItem('weconnect_notifications', JSON.stringify(defaultNotifications));
    }

    if (savedBusinessCards) {
      setBusinessCards(JSON.parse(savedBusinessCards));
    } else {
      const defaultCards: BusinessCard[] = [
        {
          id: '1',
          userId: currentUser?.id || 'current',
          name: currentUser?.first_name + ' ' + currentUser?.last_name || 'Your Name',
          title: 'Your Title',
          company: 'Your Company',
          email: currentUser?.email || 'your.email@example.com',
          phone: '+91 98765 43210',
          linkedin: 'linkedin.com/in/yourprofile',
          website: 'yourwebsite.com',
          location: 'Mumbai, India',
          qrCode: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2ZmZiIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+UVIgQ29kZTwvdGV4dD48L3N2Zz4='
        }
      ];
      setBusinessCards(defaultCards);
      localStorage.setItem('weconnect_business_cards', JSON.stringify(defaultCards));
    }
  };

  // Save data to localStorage
  const saveData = () => {
    localStorage.setItem('weconnect_rooms', JSON.stringify(chatRooms));
    localStorage.setItem('weconnect_messages', JSON.stringify(messages));
    localStorage.setItem('weconnect_events', JSON.stringify(events));
    localStorage.setItem('weconnect_profiles', JSON.stringify(userProfiles));
    localStorage.setItem('weconnect_posts', JSON.stringify(forumPosts));
    localStorage.setItem('weconnect_notifications', JSON.stringify(notifications));
    localStorage.setItem('weconnect_business_cards', JSON.stringify(businessCards));
  };

  useEffect(() => {
    saveData();
  }, [chatRooms, messages, events, userProfiles, forumPosts, notifications, businessCards]);

  // AI Assistant Functions
  const handleAiAssistant = () => {
    if (!aiPrompt.trim()) {
      setAiError("Please enter a message for the AI assistant.");
      return;
    }

    setAiResult(null);
    setAiError(null);

    const fullPrompt = `${aiPrompt}

Context: You are an AI assistant for WeConnect, a community platform for WeWork customers in India. Help users with networking, event planning, professional advice, and community engagement. Be friendly, professional, and culturally aware of the Indian business environment.`;

    aiLayerRef.current?.sendToAI(fullPrompt);
  };

  // Chat Functions
  const sendMessage = () => {
    if (!newMessage.trim() || !selectedRoom) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: currentUser?.id || 'current',
      senderName: currentUser?.first_name + ' ' + currentUser?.last_name || 'You',
      senderAvatar: '/api/placeholder/32/32',
      content: newMessage,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => ({
      ...prev,
      [selectedRoom]: [...(prev[selectedRoom] || []), message]
    }));

    setNewMessage('');
  };

  // Event Functions
  const createEvent = () => {
    if (!newEventForm.title.trim()) return;

    const event: Event = {
      id: Date.now().toString(),
      title: newEventForm.title,
      description: newEventForm.description,
      organizer: currentUser?.first_name + ' ' + currentUser?.last_name || 'You',
      organizerId: currentUser?.id || 'current',
      date: new Date(newEventForm.date),
      location: newEventForm.location,
      capacity: newEventForm.capacity,
      attendees: [currentUser?.id || 'current'],
      tags: newEventForm.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      type: newEventForm.type,
      isOnline: newEventForm.isOnline
    };

    setEvents(prev => [event, ...prev]);
    setNewEventForm({
      title: '',
      description: '',
      date: '',
      location: '',
      capacity: 20,
      type: 'networking',
      isOnline: false,
      tags: ''
    });
    setShowCreateEvent(false);
  };

  const joinEvent = (eventId: string) => {
    setEvents(prev => prev.map(event => 
      event.id === eventId 
        ? { ...event, attendees: [...event.attendees, currentUser?.id || 'current'] }
        : event
    ));
  };

  // Room Functions
  const createRoom = () => {
    if (!newRoomForm.name.trim()) return;

    const room: ChatRoom = {
      id: Date.now().toString(),
      name: newRoomForm.name,
      description: newRoomForm.description,
      category: newRoomForm.category,
      location: newRoomForm.location,
      memberCount: 1,
      isPrivate: newRoomForm.isPrivate,
      unreadCount: 0
    };

    setChatRooms(prev => [room, ...prev]);
    setNewRoomForm({
      name: '',
      description: '',
      category: 'general',
      location: '',
      isPrivate: false
    });
    setShowCreateRoom(false);
  };

  // Export Functions
  const exportData = () => {
    const data = {
      rooms: chatRooms,
      events: events,
      profiles: userProfiles,
      posts: forumPosts,
      businessCards: businessCards,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `weconnect-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Clear all data
  const clearAllData = () => {
    setChatRooms([]);
    setMessages({});
    setEvents([]);
    setUserProfiles([]);
    setForumPosts([]);
    setNotifications([]);
    setBusinessCards([]);
    localStorage.removeItem('weconnect_rooms');
    localStorage.removeItem('weconnect_messages');
    localStorage.removeItem('weconnect_events');
    localStorage.removeItem('weconnect_profiles');
    localStorage.removeItem('weconnect_posts');
    localStorage.removeItem('weconnect_notifications');
    localStorage.removeItem('weconnect_business_cards');
    alert('All data has been cleared!');
  };

  // Filter functions
  const filteredRooms = chatRooms.filter(room =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const unreadNotifications = notifications.filter(n => !n.read).length;

  // Mobile menu component
  const MobileMenu = () => (
    <div className={`fixed inset-0 z-50 lg:hidden ${showMobileMenu ? 'block' : 'hidden'}`}>
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowMobileMenu(false)} />
      <div className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-900 shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">WeConnect</h2>
          <button 
            onClick={() => setShowMobileMenu(false)}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="p-4 space-y-2">
          {[
            { id: 'chats', label: 'Chats', icon: MessageSquare },
            { id: 'events', label: 'Events', icon: Calendar },
            { id: 'forum', label: 'Forum', icon: Users },
            { id: 'network', label: 'Network', icon: Globe },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setShowMobileMenu(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeTab === tab.id 
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' 
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">WeConnect</h1>
          <p className="text-gray-600 dark:text-gray-400">Please log in to access the WeWork community.</p>
        </div>
      </div>
    );
  }

  return (
    <div id="welcome_fallback" className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* AI Layer */}
      <AILayer
        ref={aiLayerRef}
        prompt={aiPrompt}
        onResult={(result) => setAiResult(result)}
        onError={(error) => setAiError(error)}
        onLoading={(loading) => setAiLoading(loading)}
      />

      {/* Mobile Menu */}
      <MobileMenu />

      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button 
                className="lg:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setShowMobileMenu(true)}
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Building className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">WeConnect</h1>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-64 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <button 
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              <button className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <Bell className="w-5 h-5" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadNotifications}
                  </span>
                )}
              </button>

              <div className="flex items-center gap-3">
                <img
                  src="/api/placeholder/32/32"
                  alt="Profile"
                  className="w-8 h-8 rounded-full"
                />
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {currentUser.first_name} {currentUser.last_name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{currentUser.email}</p>
                </div>
                <button onClick={logout} className="btn btn-sm btn-secondary">
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Sidebar Navigation */}
          <div className="hidden lg:block w-64 space-y-2">
            <nav id="generation_issue_fallback" className="space-y-1">
              {[
                { id: 'chats', label: 'Chats', icon: MessageSquare, badge: chatRooms.reduce((sum, room) => sum + room.unreadCount, 0) },
                { id: 'events', label: 'Events', icon: Calendar, badge: events.filter(e => new Date(e.date) > new Date()).length },
                { id: 'forum', label: 'Forum', icon: Users, badge: null },
                { id: 'network', label: 'Network', icon: Globe, badge: null },
                { id: 'ai-assistant', label: 'AI Assistant', icon: Zap, badge: null },
                { id: 'settings', label: 'Settings', icon: Settings, badge: null }
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    id={`${tab.id}-tab`}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === tab.id 
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' 
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      {tab.label}
                    </div>
                    {tab.badge !== null && tab.badge > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <button 
                onClick={() => setShowBusinessCard(true)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <User className="w-5 h-5" />
                My Business Card
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Chats Tab */}
            {activeTab === 'chats' && (
              <div className="flex gap-6 h-[calc(100vh-200px)]">
                {/* Chat Rooms List */}
                <div className="w-80 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Chat Rooms</h2>
                      <button 
                        onClick={() => setShowCreateRoom(true)}
                        className="btn btn-sm btn-primary"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex gap-2">
                      {['all', 'general', 'location', 'business', 'interest'].map(filter => (
                        <button
                          key={filter}
                          className="px-3 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors capitalize"
                        >
                          {filter}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="overflow-y-auto max-h-96">
                    {filteredRooms.map(room => (
                      <button
                        key={room.id}
                        onClick={() => setSelectedRoom(room.id)}
                        className={`w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 transition-colors ${
                          selectedRoom === room.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-gray-900 dark:text-white">{room.name}</h3>
                              {room.isPrivate && <Shield className="w-3 h-3 text-gray-400" />}
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{room.description}</p>
                            <div className="flex items-center gap-4 mt-1">
                              <span className="text-xs text-gray-400">{room.memberCount} members</span>
                              {room.location && (
                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {room.location}
                                </span>
                              )}
                            </div>
                            {room.lastMessage && (
                              <p className="text-xs text-gray-400 mt-1 truncate">
                                {room.lastMessage.senderName}: {room.lastMessage.content}
                              </p>
                            )}
                          </div>
                          {room.unreadCount > 0 && (
                            <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                              {room.unreadCount}
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col">
                  {selectedRoom ? (
                    <>
                      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {chatRooms.find(r => r.id === selectedRoom)?.name}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {chatRooms.find(r => r.id === selectedRoom)?.memberCount} members
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                              <Phone className="w-4 h-4" />
                            </button>
                            <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                              <Video className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {(messages[selectedRoom] || []).map(message => (
                          <div key={message.id} className="flex gap-3">
                            <img
                              src={message.senderAvatar}
                              alt={message.senderName}
                              className="w-8 h-8 rounded-full"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm text-gray-900 dark:text-white">
                                  {message.senderName}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {message.timestamp.toLocaleTimeString()}
                                </span>
                              </div>
                              <p className="text-gray-800 dark:text-gray-200">{message.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                            placeholder="Type your message..."
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                            <Camera className="w-5 h-5" />
                          </button>
                          <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                            <Image className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={sendMessage}
                            disabled={!newMessage.trim()}
                            className="btn btn-primary px-4"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center">
                        <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Select a chat room</h3>
                        <p className="text-gray-500 dark:text-gray-400">Choose a room from the sidebar to start chatting</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Events Tab */}
            {activeTab === 'events' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Events</h2>
                  <button 
                    onClick={() => setShowCreateEvent(true)}
                    className="btn btn-primary"
                  >
                    <Plus className="w-4 h-4" />
                    Create Event
                  </button>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredEvents.map(event => (
                    <div key={event.id} className="card bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{event.title}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{event.description}</p>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            event.type === 'networking' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' :
                            event.type === 'workshop' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                            event.type === 'social' ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200' :
                            'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                          }`}>
                            {event.type}
                          </span>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                            <Calendar className="w-4 h-4" />
                            {event.date.toLocaleDateString()} at {event.date.toLocaleTimeString()}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                            {event.isOnline ? <Globe className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                            {event.location}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                            <Users className="w-4 h-4" />
                            {event.attendees.length} / {event.capacity} attendees
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1 mb-4">
                          {event.tags.map(tag => (
                            <span key={tag} className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            by {event.organizer}
                          </span>
                          {!event.attendees.includes(currentUser?.id || 'current') ? (
                            <button 
                              onClick={() => joinEvent(event.id)}
                              className="btn btn-sm btn-primary"
                            >
                              Join Event
                            </button>
                          ) : (
                            <span className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                              <CheckCircle className="w-4 h-4" />
                              Joined
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Forum Tab */}
            {activeTab === 'forum' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Community Forum</h2>
                  <button className="btn btn-primary">
                    <Plus className="w-4 h-4" />
                    New Post
                  </button>
                </div>

                <div className="space-y-4">
                  {forumPosts.map(post => (
                    <div key={post.id} className="card bg-white dark:bg-gray-800 p-6">
                      <div className="flex items-start gap-4">
                        <img
                          src={post.authorAvatar}
                          alt={post.authorName}
                          className="w-10 h-10 rounded-full"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-gray-900 dark:text-white">{post.title}</h3>
                            {post.isPinned && <Pin className="w-4 h-4 text-blue-500" />}
                          </div>
                          <div className="flex items-center gap-4 mb-3">
                            <span className="text-sm text-gray-600 dark:text-gray-300">{post.authorName}</span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {post.timestamp.toLocaleDateString()}
                            </span>
                            <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                              {post.category}
                            </span>
                          </div>
                          <p className="text-gray-800 dark:text-gray-200 mb-4">{post.content}</p>
                          <div className="flex flex-wrap gap-1 mb-4">
                            {post.tags.map(tag => (
                              <span key={tag} className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded">
                                #{tag}
                              </span>
                            ))}
                          </div>
                          <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                            <button className="flex items-center gap-1 hover:text-red-500 transition-colors">
                              <Heart className="w-4 h-4" />
                              {post.likes}
                            </button>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="w-4 h-4" />
                              {post.replies}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              {post.views}
                            </span>
                            <button className="flex items-center gap-1 hover:text-blue-500 transition-colors">
                              <Share2 className="w-4 h-4" />
                              Share
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Network Tab */}
            {activeTab === 'network' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Professional Network</h2>
                  <div className="flex gap-2">
                    <button className="btn btn-secondary">
                      <Filter className="w-4 h-4" />
                      Filter
                    </button>
                    <button className="btn btn-primary">
                      <UserPlus className="w-4 h-4" />
                      Invite
                    </button>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {userProfiles.map(profile => (
                    <div key={profile.id} className="card bg-white dark:bg-gray-800 p-6">
                      <div className="text-center mb-4">
                        <div className="relative inline-block">
                          <img
                            src={profile.avatar}
                            alt={profile.name}
                            className="w-16 h-16 rounded-full mx-auto mb-3"
                          />
                          <div className={`absolute bottom-3 right-0 w-4 h-4 rounded-full border-2 border-white ${
                            profile.isOnline ? 'bg-green-500' : 'bg-gray-400'
                          }`} />
                          {profile.verified && (
                            <CheckCircle className="absolute top-0 right-0 w-5 h-5 text-blue-500 bg-white rounded-full" />
                          )}
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{profile.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{profile.title}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{profile.company}</p>
                        <div className="flex items-center justify-center gap-1 mt-2">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-sm text-gray-600 dark:text-gray-300">{profile.rating}</span>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">{profile.bio}</p>

                      <div className="space-y-3 mb-4">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Skills</p>
                          <div className="flex flex-wrap gap-1">
                            {profile.skills.slice(0, 3).map(skill => (
                              <span key={skill} className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded">
                                {skill}
                              </span>
                            ))}
                            {profile.skills.length > 3 && (
                              <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                                +{profile.skills.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <MapPin className="w-4 h-4" />
                          {profile.location}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button className="flex-1 btn btn-primary btn-sm">
                          Connect
                        </button>
                        <button className="btn btn-secondary btn-sm">
                          <MessageSquare className="w-4 h-4" />
                        </button>
                        <button className="btn btn-secondary btn-sm">
                          <Mail className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Assistant Tab */}
            {activeTab === 'ai-assistant' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">AI Assistant</h2>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Zap className="w-4 h-4" />
                    Powered by AI
                  </div>
                </div>

                <div className="card bg-white dark:bg-gray-800 p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="form-label" htmlFor="ai-prompt">
                        Ask your AI assistant anything about networking, events, or professional advice
                      </label>
                      <textarea
                        id="ai-prompt"
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="e.g., Help me write a networking message, suggest events for tech entrepreneurs, give tips for remote collaboration..."
                        className="textarea w-full h-32"
                        rows={4}
                      />
                    </div>

                    <div className="flex gap-3">
                      <button 
                        onClick={handleAiAssistant}
                        disabled={aiLoading || !aiPrompt.trim()}
                        className="btn btn-primary"
                      >
                        {aiLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Ask AI
                          </>
                        )}
                      </button>
                      <button 
                        onClick={() => {
                          setAiPrompt('');
                          setAiResult(null);
                          setAiError(null);
                        }}
                        className="btn btn-secondary"
                      >
                        Clear
                      </button>
                    </div>

                    {aiError && (
                      <div className="alert alert-error">
                        <AlertCircle className="w-5 h-5" />
                        <div>
                          <p className="font-medium">Error</p>
                          <p className="text-sm">{typeof aiError === 'string' ? aiError : 'An error occurred while processing your request.'}</p>
                        </div>
                      </div>
                    )}

                    {aiResult && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Zap className="w-5 h-5 text-blue-500" />
                          <h3 className="font-medium text-gray-900 dark:text-white">AI Response</h3>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                          <div className="prose dark:prose-invert max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {aiResult}
                            </ReactMarkdown>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          ⚠️ AI responses may contain inaccuracies. Please verify important information independently.
                        </p>
                      </div>
                    )}

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">Quick Actions</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[
                          { label: 'Suggest networking opportunities', prompt: 'Based on my profile as a product manager in tech, suggest networking opportunities and events I should attend in Mumbai.' },
                          { label: 'Draft introduction message', prompt: 'Help me write a professional introduction message for connecting with other entrepreneurs on WeConnect.' },
                          { label: 'Event planning tips', prompt: 'Give me tips for organizing a successful tech networking event for 50 people in Mumbai.' },
                          { label: 'Professional advice', prompt: 'What are some best practices for building meaningful professional relationships in a co-working environment?' }
                        ].map((action, index) => (
                          <button
                            key={index}
                            onClick={() => setAiPrompt(action.prompt)}
                            className="text-left p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          >
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{action.label}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{action.prompt}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>

                <div className="grid gap-6 lg:grid-cols-2">
                  {/* Profile Settings */}
                  <div className="card bg-white dark:bg-gray-800 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Profile Settings</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <img
                          src="/api/placeholder/64/64"
                          alt="Profile"
                          className="w-16 h-16 rounded-full"
                        />
                        <div>
                          <button className="btn btn-sm btn-primary">Change Photo</button>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            JPG, PNG or GIF. Max size 2MB.
                          </p>
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Display Name</label>
                        <input type="text" className="input" defaultValue={`${currentUser.first_name} ${currentUser.last_name}`} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Bio</label>
                        <textarea className="textarea" rows={3} placeholder="Tell others about yourself..."></textarea>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Skills</label>
                        <input type="text" className="input" placeholder="e.g., JavaScript, Marketing, Design" />
                      </div>
                    </div>
                  </div>

                  {/* Notification Settings */}
                  <div className="card bg-white dark:bg-gray-800 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notifications</h3>
                    <div className="space-y-4">
                      {[
                        { label: 'New messages', checked: true },
                        { label: 'Event reminders', checked: true },
                        { label: 'Connection requests', checked: true },
                        { label: 'Forum mentions', checked: false },
                        { label: 'Weekly digest', checked: true }
                      ].map((setting, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-gray-700 dark:text-gray-300">{setting.label}</span>
                          <input type="checkbox" defaultChecked={setting.checked} className="checkbox" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Privacy Settings */}
                  <div className="card bg-white dark:bg-gray-800 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Privacy</h3>
                    <div className="space-y-4">
                      {[
                        { label: 'Show online status', checked: true },
                        { label: 'Allow direct messages', checked: true },
                        { label: 'Show in member directory', checked: true },
                        { label: 'Share email with connections', checked: false }
                      ].map((setting, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-gray-700 dark:text-gray-300">{setting.label}</span>
                          <input type="checkbox" defaultChecked={setting.checked} className="checkbox" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Data Management */}
                  <div className="card bg-white dark:bg-gray-800 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Data Management</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Export Data</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          Download your chat history, connections, and activity data.
                        </p>
                        <button onClick={exportData} className="btn btn-secondary">
                          <Download className="w-4 h-4" />
                          Export Data
                        </button>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Clear All Data</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          This will permanently delete all your data from WeConnect.
                        </p>
                        <button onClick={clearAllData} className="btn btn-error">
                          <Trash2 className="w-4 h-4" />
                          Clear All Data
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Event Modal */}
      {showCreateEvent && (
        <div className="modal-backdrop" onClick={() => setShowCreateEvent(false)}>
          <div className="modal-content max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Create New Event</h3>
              <button onClick={() => setShowCreateEvent(false)} className="btn-ghost p-2">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="modal-body space-y-4">
              <div className="form-group">
                <label className="form-label form-label-required">Event Title</label>
                <input
                  type="text"
                  value={newEventForm.title}
                  onChange={(e) => setNewEventForm(prev => ({ ...prev, title: e.target.value }))}
                  className="input"
                  placeholder="e.g., Tech Networking Mixer"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  value={newEventForm.description}
                  onChange={(e) => setNewEventForm(prev => ({ ...prev, description: e.target.value }))}
                  className="textarea"
                  rows={3}
                  placeholder="Describe your event..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label form-label-required">Date & Time</label>
                  <input
                    type="datetime-local"
                    value={newEventForm.date}
                    onChange={(e) => setNewEventForm(prev => ({ ...prev, date: e.target.value }))}
                    className="input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Capacity</label>
                  <input
                    type="number"
                    value={newEventForm.capacity}
                    onChange={(e) => setNewEventForm(prev => ({ ...prev, capacity: Number(e.target.value) }))}
                    className="input"
                    min="1"
                    max="500"
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input
                  type="text"
                  value={newEventForm.location}
                  onChange={(e) => setNewEventForm(prev => ({ ...prev, location: e.target.value }))}
                  className="input"
                  placeholder="e.g., WeWork BKC or Online"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Event Type</label>
                  <select
                    value={newEventForm.type}
                    onChange={(e) => setNewEventForm(prev => ({ ...prev, type: e.target.value as Event['type'] }))}
                    className="select"
                  >
                    <option value="networking">Networking</option>
                    <option value="workshop">Workshop</option>
                    <option value="social">Social</option>
                    <option value="business">Business</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Online Event</label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="checkbox"
                      checked={newEventForm.isOnline}
                      onChange={(e) => setNewEventForm(prev => ({ ...prev, isOnline: e.target.checked }))}
                      className="checkbox"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-300">This is an online event</span>
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Tags</label>
                <input
                  type="text"
                  value={newEventForm.tags}
                  onChange={(e) => setNewEventForm(prev => ({ ...prev, tags: e.target.value }))}
                  className="input"
                  placeholder="networking, tech, startup (comma-separated)"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowCreateEvent(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={createEvent} className="btn btn-primary" disabled={!newEventForm.title.trim()}>
                Create Event
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Room Modal */}
      {showCreateRoom && (
        <div className="modal-backdrop" onClick={() => setShowCreateRoom(false)}>
          <div className="modal-content max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Create Chat Room</h3>
              <button onClick={() => setShowCreateRoom(false)} className="btn-ghost p-2">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="modal-body space-y-4">
              <div className="form-group">
                <label className="form-label form-label-required">Room Name</label>
                <input
                  type="text"
                  value={newRoomForm.name}
                  onChange={(e) => setNewRoomForm(prev => ({ ...prev, name: e.target.value }))}
                  className="input"
                  placeholder="e.g., Mumbai Entrepreneurs"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  value={newRoomForm.description}
                  onChange={(e) => setNewRoomForm(prev => ({ ...prev, description: e.target.value }))}
                  className="textarea"
                  rows={3}
                  placeholder="Describe the purpose of this room..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    value={newRoomForm.category}
                    onChange={(e) => setNewRoomForm(prev => ({ ...prev, category: e.target.value as ChatRoom['category'] }))}
                    className="select"
                  >
                    <option value="general">General</option>
                    <option value="location">Location</option>
                    <option value="business">Business</option>
                    <option value="interest">Interest</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Location (if applicable)</label>
                  <input
                    type="text"
                    value={newRoomForm.location}
                    onChange={(e) => setNewRoomForm(prev => ({ ...prev, location: e.target.value }))}
                    className="input"
                    placeholder="e.g., Mumbai BKC"
                  />
                </div>
              </div>
              <div className="form-group">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newRoomForm.isPrivate}
                    onChange={(e) => setNewRoomForm(prev => ({ ...prev, isPrivate: e.target.checked }))}
                    className="checkbox"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-300">Private room (invite only)</span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowCreateRoom(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={createRoom} className="btn btn-primary" disabled={!newRoomForm.name.trim()}>
                Create Room
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Business Card Modal */}
      {showBusinessCard && (
        <div className="modal-backdrop" onClick={() => setShowBusinessCard(false)}>
          <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">My Business Card</h3>
              <button onClick={() => setShowBusinessCard(false)} className="btn-ghost p-2">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="modal-body">
              {businessCards.length > 0 && (
                <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg p-6 text-white">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold">{businessCards[0].name}</h3>
                      <p className="text-blue-100">{businessCards[0].title}</p>
                      <p className="text-blue-200 text-sm">{businessCards[0].company}</p>
                    </div>
                    <div className="w-16 h-16 bg-white rounded-lg p-2">
                      <img src={businessCards[0].qrCode} alt="QR Code" className="w-full h-full" />
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {businessCards[0].email}
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {businessCards[0].phone}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {businessCards[0].location}
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      {businessCards[0].website}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowBusinessCard(false)} className="btn btn-secondary">
                Close
              </button>
              <button className="btn btn-primary">
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-12 py-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Copyright © 2025 Datavtar Private Limited. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;