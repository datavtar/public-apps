import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  Gift,
  Bell,
  Settings,
  LogOut,
  ChevronRight,
  Plus,
  Star,
  Calendar,
  Check,
  X,
  Edit,
  Trash2,
  Search,
  ShoppingBag,
  Tag,
  CreditCard,
  TrendingUp,
  Filter,
  Sun,
  Moon
} from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import styles from './styles/styles.module.css';

type User = {
  id: string;
  name: string;
  email: string;
  points: number;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  joinedDate: string;
  transactions: Transaction[];
  redeemedRewards: RedeemedReward[];
  notifications: Notification[];
};

type Transaction = {
  id: string;
  date: string;
  amount: number;
  points: number;
  description: string;
};

type Reward = {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  category: 'Discount' | 'Product' | 'Experience' | 'Service';
  expiryDate?: string;
  imageUrl: string;
};

type RedeemedReward = {
  id: string;
  rewardId: string;
  date: string;
  pointsUsed: number;
  status: 'Pending' | 'Redeemed' | 'Expired';
  rewardName: string;
};

type Notification = {
  id: string;
  message: string;
  date: string;
  isRead: boolean;
  type: 'info' | 'reward' | 'points' | 'transaction';
};

type AppTab = 'dashboard' | 'rewards' | 'transactions' | 'notifications' | 'settings';

const TIERS = {
  Bronze: { min: 0, color: '#CD7F32' },
  Silver: { min: 1000, color: '#C0C0C0' },
  Gold: { min: 5000, color: '#FFD700' },
  Platinum: { min: 10000, color: '#E5E4E2' }
};

const DUMMY_REWARDS: Reward[] = [
  {
    id: '1',
    name: '10% Off Next Purchase',
    description: 'Get 10% off your next purchase in-store or online.',
    pointsCost: 500,
    category: 'Discount',
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    imageUrl: 'https://via.placeholder.com/150/FFAA33/000000?text=10%25+Off'
  },
  {
    id: '2',
    name: 'Free Coffee',
    description: 'Enjoy a free coffee at any of our locations.',
    pointsCost: 200,
    category: 'Product',
    expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    imageUrl: 'https://via.placeholder.com/150/33AAFF/000000?text=Coffee'
  },
  {
    id: '3',
    name: 'Movie Tickets',
    description: 'Two movie tickets to any show at participating theaters.',
    pointsCost: 1000,
    category: 'Experience',
    expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    imageUrl: 'https://via.placeholder.com/150/FF3366/000000?text=Movie'
  },
  {
    id: '4',
    name: 'Priority Customer Service',
    description: 'Skip the line and get priority customer service for a month.',
    pointsCost: 800,
    category: 'Service',
    expiryDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    imageUrl: 'https://via.placeholder.com/150/66CC99/000000?text=Priority'
  },
  {
    id: '5',
    name: 'Exclusive Member Gift',
    description: 'Receive an exclusive gift only available to loyalty members.',
    pointsCost: 1500,
    category: 'Product',
    imageUrl: 'https://via.placeholder.com/150/9966CC/000000?text=Gift'
  },
];

const App: React.FC = () => {
  // State management
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [rewards, setRewards] = useState<Reward[]>(DUMMY_REWARDS);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('darkMode');
    return saved === 'true' || (saved === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  
  // Refs
  const modalRef = useRef<HTMLDivElement>(null);
  
  // State for forms
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '' });
  const [showLoginForm, setShowLoginForm] = useState<boolean>(true);
  const [showAddTransactionModal, setShowAddTransactionModal] = useState<boolean>(false);
  const [newTransaction, setNewTransaction] = useState<Omit<Transaction, 'id' | 'date'>>({ amount: 0, points: 0, description: '' });
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [showRedeemModal, setShowRedeemModal] = useState<boolean>(false);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  
  // Effect to handle dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);
  
  // Effect to handle loading of user data from localStorage
  useEffect(() => {
    try {
      const savedUserData = localStorage.getItem('currentUser');
      
      // If user data exists in local storage, load it
      if (savedUserData) {
        const userData = JSON.parse(savedUserData) as User;
        setCurrentUser(userData);
        setIsAuthenticated(true);
      }
      
      // Load rewards data
      const savedRewards = localStorage.getItem('rewards');
      if (savedRewards) {
        setRewards(JSON.parse(savedRewards));
      } else {
        // Store default rewards if not present
        localStorage.setItem('rewards', JSON.stringify(DUMMY_REWARDS));
      }
    } catch (err) {
      setError('Failed to load user data');
      console.error('Error loading user data:', err);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Effect to listen for Escape key to close modals
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowAddTransactionModal(false);
        setShowRedeemModal(false);
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);
  
  // Helper function to determine user tier based on points
  const determineUserTier = (points: number): 'Bronze' | 'Silver' | 'Gold' | 'Platinum' => {
    if (points >= TIERS.Platinum.min) return 'Platinum';
    if (points >= TIERS.Gold.min) return 'Gold';
    if (points >= TIERS.Silver.min) return 'Silver';
    return 'Bronze';
  };
  
  // Helper function to generate random ID
  const generateId = (): string => {
    return Math.random().toString(36).substr(2, 9);
  };
  
  // Helper function to format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };
  
  // Handler for login form
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // In a real app, this would be an API call to authenticate
      // For this demo, we'll just check if the user exists in localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find((u: {email: string}) => u.email === loginForm.email);
      
      if (user) {
        // In a real app, you would verify the password here
        setCurrentUser(user);
        setIsAuthenticated(true);
        localStorage.setItem('currentUser', JSON.stringify(user));
        setLoginForm({ email: '', password: '' });
      } else {
        setError('User not found. Please register.');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Handler for register form
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // In a real app, this would be an API call to register the user
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      
      // Check if user already exists
      if (users.some((u: {email: string}) => u.email === registerForm.email)) {
        setError('User already exists. Please login.');
        setLoading(false);
        return;
      }
      
      // Create new user
      const newUser: User = {
        id: generateId(),
        name: registerForm.name,
        email: registerForm.email,
        points: 100, // Welcome bonus
        tier: 'Bronze',
        joinedDate: new Date().toISOString(),
        transactions: [
          {
            id: generateId(),
            date: new Date().toISOString(),
            amount: 0,
            points: 100,
            description: 'Welcome bonus'
          }
        ],
        redeemedRewards: [],
        notifications: [
          {
            id: generateId(),
            message: 'Welcome to our loyalty program! You received 100 points as a welcome bonus.',
            date: new Date().toISOString(),
            isRead: false,
            type: 'info'
          }
        ]
      };
      
      // Save user data
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      
      setCurrentUser(newUser);
      setIsAuthenticated(true);
      setRegisterForm({ name: '', email: '', password: '' });
      setError(null);
    } catch (err) {
      setError('Registration failed. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Handler for logout
  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    setIsAuthenticated(false);
    setActiveTab('dashboard');
  };
  
  // Handler for adding a new transaction
  const handleAddTransaction = () => {
    if (!currentUser) return;
    
    try {
      // Calculate points (simple formula: 1 point per $ spent)
      const points = Math.floor(newTransaction.amount);
      
      // Create new transaction
      const transaction: Transaction = {
        id: generateId(),
        date: new Date().toISOString(),
        amount: newTransaction.amount,
        points: points,
        description: newTransaction.description || `Purchase of $${newTransaction.amount}`
      };
      
      // Update user's points and transactions
      const updatedUser = {
        ...currentUser,
        points: currentUser.points + points,
        transactions: [transaction, ...currentUser.transactions],
        tier: determineUserTier(currentUser.points + points)
      };
      
      // Add a notification for the transaction
      const notification: Notification = {
        id: generateId(),
        message: `You earned ${points} points from a transaction of $${newTransaction.amount}.`,
        date: new Date().toISOString(),
        isRead: false,
        type: 'transaction'
      };
      
      updatedUser.notifications = [notification, ...updatedUser.notifications];
      
      // Update local storage
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      
      // Update users array in local storage
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const updatedUsers = users.map((u: User) => u.id === updatedUser.id ? updatedUser : u);
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      
      // Update state
      setCurrentUser(updatedUser);
      setNewTransaction({ amount: 0, points: 0, description: '' });
      setShowAddTransactionModal(false);
    } catch (err) {
      setError('Failed to add transaction. Please try again.');
      console.error('Transaction error:', err);
    }
  };
  
  // Handler for redeeming a reward
  const handleRedeemReward = () => {
    if (!currentUser || !selectedReward) return;
    
    try {
      // Check if user has enough points
      if (currentUser.points < selectedReward.pointsCost) {
        setError(`Not enough points to redeem ${selectedReward.name}.`);
        return;
      }
      
      // Create redeemed reward
      const redeemedReward: RedeemedReward = {
        id: generateId(),
        rewardId: selectedReward.id,
        date: new Date().toISOString(),
        pointsUsed: selectedReward.pointsCost,
        status: 'Pending',
        rewardName: selectedReward.name
      };
      
      // Update user data
      const updatedUser = {
        ...currentUser,
        points: currentUser.points - selectedReward.pointsCost,
        redeemedRewards: [redeemedReward, ...currentUser.redeemedRewards]
      };
      
      // Add a notification for the redemption
      const notification: Notification = {
        id: generateId(),
        message: `You redeemed ${selectedReward.name} for ${selectedReward.pointsCost} points.`,
        date: new Date().toISOString(),
        isRead: false,
        type: 'reward'
      };
      
      updatedUser.notifications = [notification, ...updatedUser.notifications];
      
      // Update local storage
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      
      // Update users array
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const updatedUsers = users.map((u: User) => u.id === updatedUser.id ? updatedUser : u);
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      
      // Update state
      setCurrentUser(updatedUser);
      setSelectedReward(null);
      setShowRedeemModal(false);
    } catch (err) {
      setError('Failed to redeem reward. Please try again.');
      console.error('Redemption error:', err);
    }
  };
  
  // Handler for marking a notification as read
  const handleMarkNotificationAsRead = (notificationId: string) => {
    if (!currentUser) return;
    
    try {
      // Update notification status
      const updatedNotifications = currentUser.notifications.map(notification => 
        notification.id === notificationId ? { ...notification, isRead: true } : notification
      );
      
      // Update user data
      const updatedUser = {
        ...currentUser,
        notifications: updatedNotifications
      };
      
      // Update local storage
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      
      // Update users array
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const updatedUsers = users.map((u: User) => u.id === updatedUser.id ? updatedUser : u);
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      
      // Update state
      setCurrentUser(updatedUser);
    } catch (err) {
      setError('Failed to update notification. Please try again.');
      console.error('Notification error:', err);
    }
  };
  
  // Handler for marking all notifications as read
  const handleMarkAllNotificationsAsRead = () => {
    if (!currentUser) return;
    
    try {
      // Update all notifications
      const updatedNotifications = currentUser.notifications.map(notification => 
        ({ ...notification, isRead: true })
      );
      
      // Update user data
      const updatedUser = {
        ...currentUser,
        notifications: updatedNotifications
      };
      
      // Update local storage
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      
      // Update users array
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const updatedUsers = users.map((u: User) => u.id === updatedUser.id ? updatedUser : u);
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      
      // Update state
      setCurrentUser(updatedUser);
    } catch (err) {
      setError('Failed to update notifications. Please try again.');
      console.error('Notification error:', err);
    }
  };
  
  // Filter rewards based on search term and category
  const filteredRewards = rewards.filter(reward => {
    const matchesSearch = reward.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        reward.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || reward.category === filterCategory;
    return matchesSearch && matchesCategory;
  });
  
  // Calculate progress to next tier
  const calculateTierProgress = (): { nextTier: string; current: number; target: number; percentage: number } => {
    if (!currentUser) {
      return { nextTier: 'Silver', current: 0, target: TIERS.Silver.min, percentage: 0 };
    }
    
    const { points } = currentUser;
    
    if (points < TIERS.Silver.min) {
      return {
        nextTier: 'Silver',
        current: points,
        target: TIERS.Silver.min,
        percentage: (points / TIERS.Silver.min) * 100
      };
    } else if (points < TIERS.Gold.min) {
      return {
        nextTier: 'Gold',
        current: points - TIERS.Silver.min,
        target: TIERS.Gold.min - TIERS.Silver.min,
        percentage: ((points - TIERS.Silver.min) / (TIERS.Gold.min - TIERS.Silver.min)) * 100
      };
    } else if (points < TIERS.Platinum.min) {
      return {
        nextTier: 'Platinum',
        current: points - TIERS.Gold.min,
        target: TIERS.Platinum.min - TIERS.Gold.min,
        percentage: ((points - TIERS.Gold.min) / (TIERS.Platinum.min - TIERS.Gold.min)) * 100
      };
    } else {
      return {
        nextTier: 'Max Level',
        current: points,
        target: points,
        percentage: 100
      };
    }
  };
  
  // Prepare data for points history chart
  const preparePointsHistoryData = () => {
    if (!currentUser) return [];
    
    // Get last 5 transactions
    const last5Transactions = [...currentUser.transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
      .reverse();
    
    return last5Transactions.map(transaction => ({
      date: formatDate(transaction.date).split(',')[0], // Just get the day and month
      points: transaction.points
    }));
  };
  
  // Prepare data for rewards redemption chart
  const prepareRewardsRedemptionData = () => {
    if (!currentUser) return [];
    
    // Count redemptions by category
    const redemptionByCategory = currentUser.redeemedRewards.reduce<Record<string, number>>((acc, redemption) => {
      const reward = rewards.find(r => r.id === redemption.rewardId);
      if (reward) {
        acc[reward.category] = (acc[reward.category] || 0) + 1;
      }
      return acc;
    }, {});
    
    return Object.entries(redemptionByCategory).map(([category, count]) => ({
      name: category,
      value: count
    }));
  };
  
  // Define colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
  
  // If still loading, show a loading spinner
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400"></div>
      </div>
    );
  }
  
  // If not authenticated, show login/register form
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-slate-900 p-4">
        <div className="flex justify-end w-full max-w-md mb-8">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? (
              <Sun className="h-5 w-5 text-yellow-500" />
            ) : (
              <Moon className="h-5 w-5 text-slate-700" />
            )}
          </button>
        </div>
        
        <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden transition-all duration-300">
          <div className="bg-primary-600 dark:bg-primary-700 p-4 sm:p-6">
            <h1 className="text-xl sm:text-2xl font-bold text-white text-center">
              Customer Loyalty Program
            </h1>
          </div>
          
          <div className="p-4 sm:p-6">
            <div className="flex border-b border-gray-200 dark:border-slate-700 mb-4">
              <button
                className={`px-4 py-2 font-medium text-sm ${showLoginForm ? 'text-primary-600 border-b-2 border-primary-600 dark:text-primary-400 dark:border-primary-400' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'}`}
                onClick={() => setShowLoginForm(true)}
              >
                Login
              </button>
              <button
                className={`px-4 py-2 font-medium text-sm ${!showLoginForm ? 'text-primary-600 border-b-2 border-primary-600 dark:text-primary-400 dark:border-primary-400' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'}`}
                onClick={() => setShowLoginForm(false)}
              >
                Register
              </button>
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-md text-sm">
                {error}
              </div>
            )}
            
            {showLoginForm ? (
              // Login Form
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="form-group">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                    className="input"
                    placeholder="your@email.com"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="password" className="form-label">Password</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    required
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                    className="input"
                    placeholder="••••••••"
                  />
                </div>
                
                <button type="submit" className="btn btn-primary w-full">
                  Login
                </button>
              </form>
            ) : (
              // Register Form
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="form-group">
                  <label htmlFor="name" className="form-label">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={registerForm.name}
                    onChange={(e) => setRegisterForm({...registerForm, name: e.target.value})}
                    className="input"
                    placeholder="John Doe"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="reg-email" className="form-label">Email</label>
                  <input
                    type="email"
                    id="reg-email"
                    name="email"
                    required
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                    className="input"
                    placeholder="your@email.com"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="reg-password" className="form-label">Password</label>
                  <input
                    type="password"
                    id="reg-password"
                    name="password"
                    required
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
                    className="input"
                    placeholder="••••••••"
                  />
                </div>
                
                <button type="submit" className="btn btn-primary w-full">
                  Register
                </button>
              </form>
            )}
            
            <div className="mt-6 text-center text-sm text-gray-500 dark:text-slate-400">
              Join our loyalty program and start earning rewards today!
              <div className="mt-2 flex justify-center space-x-2">
                <Badge label="Discounts" color="#0088FE" />
                <Badge label="Products" color="#00C49F" />
                <Badge label="Experiences" color="#FFBB28" />
              </div>
            </div>
          </div>
        </div>
        
        <footer className="mt-8 text-center text-sm text-gray-500 dark:text-slate-500">
          Copyright © 2025 of Datavtar Private Limited. All rights reserved.
        </footer>
      </div>
    );
  }
  
  // Main application for authenticated users
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Mobile Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm py-4 px-4 md:hidden flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-lg font-bold text-primary-600 dark:text-primary-400">
          Loyalty Program
        </h1>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? (
              <Sun className="h-5 w-5 text-yellow-500" />
            ) : (
              <Moon className="h-5 w-5 text-slate-700" />
            )}
          </button>
          <div className="relative">
            <button 
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 relative"
              onClick={() => setActiveTab('notifications')}
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5 text-gray-600 dark:text-slate-300" />
              {currentUser && currentUser.notifications.some(n => !n.isRead) && (
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
              )}
            </button>
          </div>
        </div>
      </header>
      
      {/* Desktop Sidebar and Mobile Bottom Navigation */}
      <div className="flex flex-col md:flex-row">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex md:flex-col w-64 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 p-4 sticky top-0 h-screen">
          <div className="flex items-center justify-center mb-8">
            <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400">
              Loyalty Program
            </h1>
          </div>
          
          <nav className="flex-1 overflow-y-auto">
            <ul className="space-y-2">
              <NavItem
                icon={<User />}
                label="Dashboard"
                active={activeTab === 'dashboard'}
                onClick={() => setActiveTab('dashboard')}
              />
              <NavItem
                icon={<Gift />}
                label="Rewards"
                active={activeTab === 'rewards'}
                onClick={() => setActiveTab('rewards')}
              />
              <NavItem
                icon={<CreditCard />}
                label="Transactions"
                active={activeTab === 'transactions'}
                onClick={() => setActiveTab('transactions')}
              />
              <NavItem
                icon={<Bell />}
                label="Notifications"
                active={activeTab === 'notifications'}
                onClick={() => setActiveTab('notifications')}
                badge={currentUser?.notifications.filter(n => !n.isRead).length}
              />
              <NavItem
                icon={<Settings />}
                label="Settings"
                active={activeTab === 'settings'}
                onClick={() => setActiveTab('settings')}
              />
            </ul>
          </nav>
          
          <div className="mt-auto pt-4 border-t border-gray-200 dark:border-slate-700">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                  <span className="text-primary-700 dark:text-primary-300 font-medium">
                    {currentUser?.name.charAt(0)}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700 dark:text-slate-200">{currentUser?.name}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400">{currentUser?.email}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 text-sm text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white flex items-center gap-2"
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? (
                  <>
                    <Sun className="h-4 w-4" />
                    <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="h-4 w-4" />
                    <span>Dark Mode</span>
                  </>
                )}
              </button>
              
              <button
                onClick={handleLogout}
                className="p-2 text-sm text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white flex items-center gap-2"
                aria-label="Logout"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 p-4">
          {/* Error display */}
          {error && (
            <div className="alert alert-error mb-4 flex items-center justify-between">
              <div className="flex items-center">
                <X className="h-5 w-5 mr-2" />
                <p>{error}</p>
              </div>
              <button 
                onClick={() => setError(null)}
                className="text-red-700 dark:text-red-300 hover:text-red-900 dark:hover:text-red-100"
                aria-label="Dismiss error"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && currentUser && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 sm:p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* User info and stats */}
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                      Welcome back, {currentUser.name}!
                    </h2>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="stat-card">
                        <div className="stat-title">Available Points</div>
                        <div className="stat-value">{currentUser.points}</div>
                        <div className="stat-desc flex items-center mt-2">
                          <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                          <span className="text-green-500">
                            {currentUser.transactions[0]?.points || 0} points from last transaction
                          </span>
                        </div>
                      </div>
                      
                      <div className="stat-card">
                        <div className="stat-title">Current Tier</div>
                        <div className="flex items-center">
                          <div className="stat-value" style={{ color: TIERS[currentUser.tier].color }}>
                            {currentUser.tier}
                          </div>
                          <div 
                            className="ml-2 h-3 w-3 rounded-full" 
                            style={{ backgroundColor: TIERS[currentUser.tier].color }}
                          ></div>
                        </div>
                        <div className="stat-desc">
                          Member since {formatDate(currentUser.joinedDate)}
                        </div>
                      </div>
                    </div>
                    
                    {/* Progress to next tier */}
                    <div className="mb-6">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                          Progress to {calculateTierProgress().nextTier}
                        </span>
                        <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                          {calculateTierProgress().current} / {calculateTierProgress().target} points
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2.5">
                        <div 
                          className="bg-primary-600 dark:bg-primary-500 h-2.5 rounded-full transition-all duration-500 ease-out" 
                          style={{ width: `${Math.min(calculateTierProgress().percentage, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    {/* Quick actions */}
                    <div className="flex flex-wrap gap-3">
                      <button 
                        onClick={() => setShowAddTransactionModal(true)} 
                        className="btn btn-primary flex items-center justify-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add Transaction</span>
                      </button>
                      
                      <button 
                        onClick={() => setActiveTab('rewards')} 
                        className="btn bg-secondary-600 text-white hover:bg-secondary-700 focus:ring-secondary-500 flex items-center justify-center gap-2"
                      >
                        <Gift className="h-4 w-4" />
                        <span>Browse Rewards</span>
                      </button>
                    </div>
                  </div>
                  
                  {/* Charts */}
                  <div className="space-y-6">
                    {/* Points History Chart */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
                        Recent Points History
                      </h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={preparePointsHistoryData()}>                          
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="points" fill="#8884d8" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    
                    {/* Rewards Redemption Chart */}
                    {currentUser.redeemedRewards.length > 0 && (
                      <div>
                        <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
                          Rewards Redemption
                        </h3>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={prepareRewardsRedemptionData()}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {prepareRewardsRedemptionData().map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Recent Activity */}
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 sm:p-6">
                <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
                  Recent Activity
                </h3>
                
                <div className="space-y-4">
                  {/* Recent Transactions */}
                  {currentUser.transactions.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                        Recent Transactions
                      </h4>
                      <div className="space-y-3">
                        {currentUser.transactions.slice(0, 3).map(transaction => (
                          <div 
                            key={transaction.id} 
                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg"
                          >
                            <div className="flex items-center">
                              <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full mr-3">
                                <ShoppingBag className="h-5 w-5 text-green-600 dark:text-green-400" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-700 dark:text-slate-200">
                                  {transaction.description}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-slate-400">
                                  {formatDate(transaction.date)}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                ${transaction.amount.toFixed(2)}
                              </p>
                              <p className="text-xs font-medium text-green-600 dark:text-green-400">
                                +{transaction.points} points
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Recent Redemptions */}
                  {currentUser.redeemedRewards.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                        Recent Redemptions
                      </h4>
                      <div className="space-y-3">
                        {currentUser.redeemedRewards.slice(0, 3).map(redemption => (
                          <div 
                            key={redemption.id} 
                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg"
                          >
                            <div className="flex items-center">
                              <div className="bg-primary-100 dark:bg-primary-900 p-2 rounded-full mr-3">
                                <Gift className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-700 dark:text-slate-200">
                                  {redemption.rewardName}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-slate-400">
                                  {formatDate(redemption.date)}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                -{redemption.pointsUsed} points
                              </p>
                              <p className="text-xs font-medium text-gray-600 dark:text-slate-400">
                                {redemption.status}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Rewards Tab */}
          {activeTab === 'rewards' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                    Available Rewards
                  </h2>
                  
                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Search className="h-4 w-4 text-gray-500 dark:text-slate-400" />
                      </div>
                      <input
                        type="text"
                        className="input pl-10"
                        placeholder="Search rewards..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    
                    <select
                      className="input"
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      aria-label="Filter by category"
                    >
                      <option value="All">All Categories</option>
                      <option value="Discount">Discounts</option>
                      <option value="Product">Products</option>
                      <option value="Experience">Experiences</option>
                      <option value="Service">Services</option>
                    </select>
                  </div>
                </div>
                
                {currentUser && (
                  <div className="mb-6 p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-slate-300">
                          Your current points balance
                        </p>
                        <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                          {currentUser.points} points
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: TIERS[currentUser.tier].color, color: '#000' }}>
                          {currentUser.tier} Tier
                        </div>
                        {currentUser.tier !== 'Platinum' && (
                          <div className="text-xs text-gray-600 dark:text-slate-400">
                            {calculateTierProgress().target - calculateTierProgress().current} points to next tier
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {filteredRewards.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-gray-500 dark:text-slate-400">No rewards found matching your criteria.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRewards.map(reward => (
                      <div 
                        key={reward.id} 
                        className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div 
                          className="h-48 bg-cover bg-center" 
                          style={{ backgroundImage: `url(${reward.imageUrl})` }}
                        ></div>
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                              {reward.name}
                            </h3>
                            <span className="badge" style={{ backgroundColor: getCategoryColor(reward.category), color: '#fff' }}>
                              {reward.category}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
                            {reward.description}
                          </p>
                          {reward.expiryDate && (
                            <div className="flex items-center text-xs text-gray-500 dark:text-slate-400 mb-4">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span>Expires: {formatDate(reward.expiryDate)}</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-semibold text-gray-900 dark:text-white">
                              {reward.pointsCost} points
                            </span>
                            <button
                              onClick={() => {
                                setSelectedReward(reward);
                                setShowRedeemModal(true);
                              }}
                              disabled={!currentUser || currentUser.points < reward.pointsCost}
                              className={`btn btn-sm ${currentUser && currentUser.points >= reward.pointsCost ? 'btn-primary' : 'bg-gray-300 dark:bg-slate-600 cursor-not-allowed'}`}
                            >
                              Redeem
                            </button>
                          </div>
                          {currentUser && currentUser.points < reward.pointsCost && (
                            <p className="text-xs text-red-500 dark:text-red-400 mt-2">
                              You need {reward.pointsCost - currentUser.points} more points to redeem.
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Redeemed Rewards Section */}
              {currentUser && currentUser.redeemedRewards.length > 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 sm:p-6">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
                    Your Redeemed Rewards
                  </h2>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                      <thead className="bg-gray-50 dark:bg-slate-700">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                            Reward
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                            Date
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                            Points Used
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                        {currentUser.redeemedRewards.map(redemption => (
                          <tr key={redemption.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {redemption.rewardName}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500 dark:text-slate-400">
                                {formatDate(redemption.date)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-white">
                                {redemption.pointsUsed} points
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColorClass(redemption.status)}`}>
                                {redemption.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Transactions Tab */}
          {activeTab === 'transactions' && currentUser && (
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                  Transaction History
                </h2>
                
                <button 
                  onClick={() => setShowAddTransactionModal(true)} 
                  className="btn btn-primary flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Transaction</span>
                </button>
              </div>
              
              {currentUser.transactions.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-500 dark:text-slate-400">
                    No transactions recorded yet. Start adding transactions to earn points!
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                    <thead className="bg-gray-50 dark:bg-slate-700">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                          Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                          Description
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                          Amount
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                          Points Earned
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                      {currentUser.transactions.map(transaction => (
                        <tr key={transaction.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white">
                              {formatDate(transaction.date)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white">
                              {transaction.description}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white">
                              ${transaction.amount.toFixed(2)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-green-600 dark:text-green-400">
                              +{transaction.points}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              {/* Points Summary */}
              <div className="mt-6 p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-slate-300">
                      Total Points Earned
                    </p>
                    <p className="text-xl font-semibold text-gray-900 dark:text-white">
                      {currentUser.transactions.reduce((sum, t) => sum + t.points, 0)}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-slate-300">
                      Total Points Redeemed
                    </p>
                    <p className="text-xl font-semibold text-gray-900 dark:text-white">
                      {currentUser.redeemedRewards.reduce((sum, r) => sum + r.pointsUsed, 0)}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-slate-300">
                      Current Balance
                    </p>
                    <p className="text-xl font-semibold text-gray-900 dark:text-white">
                      {currentUser.points}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Notifications Tab */}
          {activeTab === 'notifications' && currentUser && (
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                  Notifications
                </h2>
                
                {currentUser.notifications.some(n => !n.isRead) && (
                  <button 
                    onClick={handleMarkAllNotificationsAsRead} 
                    className="btn btn-sm bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
              
              {currentUser.notifications.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-500 dark:text-slate-400">
                    No notifications yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {currentUser.notifications.map(notification => (
                    <div 
                      key={notification.id} 
                      className={`p-4 rounded-lg border ${notification.isRead ? 'border-gray-200 dark:border-slate-700' : 'border-l-4 border-primary-500 dark:border-primary-400 bg-gray-50 dark:bg-slate-700'}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start">
                          <div className="mr-3">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div>
                            <p className="text-sm text-gray-700 dark:text-slate-300">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                              {formatDate(notification.date)}
                            </p>
                          </div>
                        </div>
                        {!notification.isRead && (
                          <button 
                            onClick={() => handleMarkNotificationAsRead(notification.id)} 
                            className="text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300"
                            aria-label="Mark as read"
                          >
                            <Check className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Settings Tab */}
          {activeTab === 'settings' && currentUser && (
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 sm:p-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
                Account Settings
              </h2>
              
              <div className="space-y-6">
                {/* Profile Section */}
                <div className="pb-6 border-b border-gray-200 dark:border-slate-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Profile Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-group">
                      <label htmlFor="name" className="form-label">Full Name</label>
                      <input
                        type="text"
                        id="name"
                        className="input"
                        value={currentUser.name}
                        readOnly
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="email" className="form-label">Email Address</label>
                      <input
                        type="email"
                        id="email"
                        className="input"
                        value={currentUser.email}
                        readOnly
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="joined" className="form-label">Joined Date</label>
                      <input
                        type="text"
                        id="joined"
                        className="input"
                        value={formatDate(currentUser.joinedDate)}
                        readOnly
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="tier" className="form-label">Loyalty Tier</label>
                      <input
                        type="text"
                        id="tier"
                        className="input"
                        value={currentUser.tier}
                        readOnly
                        style={{ color: TIERS[currentUser.tier].color }}
                      />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-slate-400 mt-2">
                    * Profile information can only be updated by contacting customer support.
                  </p>
                </div>
                
                {/* Preferences Section */}
                <div className="pb-6 border-b border-gray-200 dark:border-slate-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Preferences
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-slate-300">Dark Mode</p>
                        <p className="text-xs text-gray-500 dark:text-slate-400">Switch between light and dark theme</p>
                      </div>
                      <button
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        className="theme-toggle"
                        aria-label="Toggle dark mode"
                      >
                        <span className="theme-toggle-thumb"></span>
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Account Actions */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Account Actions
                  </h3>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-500 dark:text-slate-400">
                      These actions are irreversible. Please proceed with caution.
                    </p>
                    <button
                      onClick={handleLogout}
                      className="btn bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 flex items-center gap-2"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
        
        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 z-10">
          <div className="flex justify-around">
            <NavItemMobile
              icon={<User />}
              label="Dashboard"
              active={activeTab === 'dashboard'}
              onClick={() => setActiveTab('dashboard')}
            />
            <NavItemMobile
              icon={<Gift />}
              label="Rewards"
              active={activeTab === 'rewards'}
              onClick={() => setActiveTab('rewards')}
            />
            <NavItemMobile
              icon={<CreditCard />}
              label="Transactions"
              active={activeTab === 'transactions'}
              onClick={() => setActiveTab('transactions')}
            />
            <NavItemMobile
              icon={<Bell />}
              label="Notifications"
              active={activeTab === 'notifications'}
              onClick={() => setActiveTab('notifications')}
              badge={currentUser?.notifications.filter(n => !n.isRead).length}
            />
            <NavItemMobile
              icon={<Settings />}
              label="Settings"
              active={activeTab === 'settings'}
              onClick={() => setActiveTab('settings')}
            />
          </div>
        </nav>
      </div>
      
      {/* Add Transaction Modal */}
      {showAddTransactionModal && (
        <div className="modal-backdrop" onClick={() => setShowAddTransactionModal(false)}>
          <div 
            className="modal-content" 
            ref={modalRef} 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Add Transaction</h3>
              <button 
                className="text-gray-400 hover:text-gray-500 dark:text-slate-500 dark:hover:text-slate-400"
                onClick={() => setShowAddTransactionModal(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form className="mt-4 space-y-4">
              <div className="form-group">
                <label htmlFor="amount" className="form-label">Purchase Amount ($)</label>
                <input
                  type="number"
                  id="amount"
                  className="input"
                  value={newTransaction.amount || ''}
                  onChange={(e) => setNewTransaction({...newTransaction, amount: parseFloat(e.target.value) || 0})}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="description" className="form-label">Description (Optional)</label>
                <input
                  type="text"
                  id="description"
                  className="input"
                  value={newTransaction.description || ''}
                  onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                  placeholder="e.g., Grocery shopping, Restaurant bill"
                />
              </div>
              <div className="form-group">
                <p className="text-sm text-gray-600 dark:text-slate-400">
                  You will earn approximately {Math.floor(newTransaction.amount)} points for this transaction.
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                  onClick={() => setShowAddTransactionModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleAddTransaction}
                  disabled={!newTransaction.amount || newTransaction.amount <= 0}
                >
                  Add Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Redeem Reward Modal */}
      {showRedeemModal && selectedReward && (
        <div className="modal-backdrop" onClick={() => setShowRedeemModal(false)}>
          <div 
            className="modal-content" 
            ref={modalRef} 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Redeem Reward</h3>
              <button 
                className="text-gray-400 hover:text-gray-500 dark:text-slate-500 dark:hover:text-slate-400"
                onClick={() => setShowRedeemModal(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4 space-y-4">
              <div className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg">
                <div className="flex items-center mb-3">
                  <div 
                    className="h-10 w-10 rounded bg-cover bg-center mr-3" 
                    style={{ backgroundImage: `url(${selectedReward.imageUrl})` }}
                  ></div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">{selectedReward.name}</h4>
                    <p className="text-xs text-gray-500 dark:text-slate-400">{selectedReward.category}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-slate-400 mb-3">{selectedReward.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedReward.pointsCost} points</span>
                  {selectedReward.expiryDate && (
                    <span className="text-xs text-gray-500 dark:text-slate-400">
                      Expires: {formatDate(selectedReward.expiryDate)}
                    </span>
                  )}
                </div>
              </div>
              
              {currentUser && (
                <div className="p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-700 dark:text-slate-300">Your points balance:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{currentUser.points} points</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-700 dark:text-slate-300">Reward cost:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">-{selectedReward.pointsCost} points</span>
                  </div>
                  <div className="border-t border-gray-200 dark:border-slate-600 pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Remaining balance:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {currentUser.points - selectedReward.pointsCost} points
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="modal-footer">
                <button
                  className="btn bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                  onClick={() => setShowRedeemModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleRedeemReward}
                  disabled={!currentUser || currentUser.points < selectedReward.pointsCost}
                >
                  Confirm Redemption
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <footer className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 py-4 px-4 text-center text-sm text-gray-500 dark:text-slate-500 mt-16 mb-16 md:mb-0">
        Copyright © 2025 of Datavtar Private Limited. All rights reserved.
      </footer>
    </div>
  );
};

// Helper component for desktop navigation
const NavItem: React.FC<{ icon: React.ReactNode; label: string; active: boolean; onClick: () => void; badge?: number }> = ({ 
  icon, label, active, onClick, badge 
}) => {
  return (
    <li>
      <button
        onClick={onClick}
        className={`flex items-center px-3 py-2 rounded-md w-full transition-colors ${active ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300' : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white'}`}
      >
        <span className="mr-3">{icon}</span>
        <span className="flex-1">{label}</span>
        {badge !== undefined && badge > 0 && (
          <span className="ml-auto bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
            {badge}
          </span>
        )}
        <ChevronRight className={`h-4 w-4 ml-auto ${active ? 'text-primary-500 dark:text-primary-400' : 'text-gray-400 dark:text-slate-600'}`} />
      </button>
    </li>
  );
};

// Helper component for mobile navigation
const NavItemMobile: React.FC<{ icon: React.ReactNode; label: string; active: boolean; onClick: () => void; badge?: number }> = ({ 
  icon, label, active, onClick, badge 
}) => {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center py-2 flex-1 text-xs ${active ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-slate-400'}`}
    >
      <div className="relative">
        {icon}
        {badge !== undefined && badge > 0 && (
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
        )}
      </div>
      <span className="mt-1">{label}</span>
    </button>
  );
};

// Helper component for badges
const Badge: React.FC<{ label: string; color: string }> = ({ label, color }) => {
  return (
    <span 
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" 
      style={{ backgroundColor: color, color: '#fff' }}
    >
      {label}
    </span>
  );
};

// Helper function to get category color
const getCategoryColor = (category: string): string => {
  switch (category) {
    case 'Discount': return '#0088FE';
    case 'Product': return '#00C49F';
    case 'Experience': return '#FFBB28';
    case 'Service': return '#FF8042';
    default: return '#999999';
  }
};

// Helper function to get status color class
const getStatusColorClass = (status: string): string => {
  switch (status) {
    case 'Pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'Redeemed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'Expired': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

// Helper function to get notification icon
const getNotificationIcon = (type: string): React.ReactNode => {
  switch (type) {
    case 'info':
      return <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
        <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
      </div>;
    case 'reward':
      return <div className="p-2 rounded-full bg-primary-100 dark:bg-primary-900">
        <Gift className="h-5 w-5 text-primary-600 dark:text-primary-400" />
      </div>;
    case 'points':
      return <div className="p-2 rounded-full bg-green-100 dark:bg-green-900">
        <Star className="h-5 w-5 text-green-600 dark:text-green-400" />
      </div>;
    case 'transaction':
      return <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900">
        <ShoppingBag className="h-5 w-5 text-purple-600 dark:text-purple-400" />
      </div>;
    default:
      return <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-900">
        <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
      </div>;
  }
};

export default App;