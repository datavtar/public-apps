import React, { useState, useEffect } from 'react';
import styles from './styles/styles.module.css';
import {
  User,
  UserPlus,
  Gift,
  ShoppingCart,
  Trophy,
  Wallet,
  Percent,
  ChartLine,
  Calendar,
  Search,
  Filter,
  ArrowUpDown,
  Edit,
  Trash2,
  X,
  Menu,
  Moon,
  Sun,
  Plus,
  DollarSign,
  Check,
  LogOut,
  Crown,
  Tag
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { format } from 'date-fns';

const App: React.FC = () => {
  type Customer = {
    id: string;
    name: string;
    email: string;
    phone: string;
    points: number;
    totalSpent: number;
    tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
    joinDate: string;
    transactions: Transaction[];
    redemptions: Redemption[];
  };

  type Transaction = {
    id: string;
    customerId: string;
    date: string;
    amount: number;
    pointsEarned: number;
    storeLocation: string;
  };

  type Redemption = {
    id: string;
    customerId: string;
    date: string;
    reward: Reward;
    pointsSpent: number;
  };

  type Reward = {
    id: string;
    name: string;
    description: string;
    pointsCost: number;
    category: 'Discount' | 'Product' | 'Experience';
    image?: string;
  };

  type Tier = {
    name: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
    minimumSpend: number;
    pointsMultiplier: number;
    color: string;
    icon: JSX.Element;
  };

  type FilterOptions = {
    searchTerm: string;
    tier: string;
    sortBy: 'name' | 'points' | 'totalSpent' | 'joinDate';
    sortDirection: 'asc' | 'desc';
  };

  type ActiveTab = 'dashboard' | 'customers' | 'transactions' | 'rewards' | 'redeem';

  // Initial Rewards
  const initialRewards: Reward[] = [
    {
      id: '1',
      name: '10% Discount',
      description: 'Get 10% off your next purchase',
      pointsCost: 500,
      category: 'Discount'
    },
    {
      id: '2',
      name: '25% Discount',
      description: 'Get 25% off your next purchase',
      pointsCost: 1000,
      category: 'Discount'
    },
    {
      id: '3',
      name: 'Free T-Shirt',
      description: 'Redeem for a free branded t-shirt',
      pointsCost: 1500,
      category: 'Product'
    },
    {
      id: '4',
      name: 'VIP Shopping Experience',
      description: 'Personal shopping assistant for 1 hour',
      pointsCost: 3000,
      category: 'Experience'
    },
    {
      id: '5',
      name: 'Free Shipping',
      description: 'Free shipping on your next order',
      pointsCost: 300,
      category: 'Discount'
    },
  ];

  // Tiers Configuration
  const tiers: Tier[] = [
    { 
      name: 'Bronze', 
      minimumSpend: 0, 
      pointsMultiplier: 1, 
      color: '#CD7F32',
      icon: <Trophy size={16} />
    },
    { 
      name: 'Silver', 
      minimumSpend: 500, 
      pointsMultiplier: 1.25, 
      color: '#C0C0C0',
      icon: <Trophy size={16} />
    },
    { 
      name: 'Gold', 
      minimumSpend: 1000, 
      pointsMultiplier: 1.5, 
      color: '#FFD700',
      icon: <Crown size={16} />
    },
    { 
      name: 'Platinum', 
      minimumSpend: 2000, 
      pointsMultiplier: 2, 
      color: '#E5E4E2',
      icon: <Crown size={16} />
    }
  ];

  // States
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [rewards, setRewards] = useState<Reward[]>(initialRewards);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [isAddingCustomer, setIsAddingCustomer] = useState<boolean>(false);
  const [isEditingCustomer, setIsEditingCustomer] = useState<boolean>(false);
  const [isAddingTransaction, setIsAddingTransaction] = useState<boolean>(false);
  const [isAddingReward, setIsAddingReward] = useState<boolean>(false);
  const [isEditingReward, setIsEditingReward] = useState<boolean>(false);
  const [isRedeemingReward, setIsRedeemingReward] = useState<boolean>(false);
  const [selectedRewardId, setSelectedRewardId] = useState<string | null>(null);
  const [customerForm, setCustomerForm] = useState<Partial<Customer>>({
    name: '',
    email: '',
    phone: '',
  });
  const [transactionForm, setTransactionForm] = useState<Partial<Transaction>>({
    amount: 0,
    storeLocation: '',
  });
  const [rewardForm, setRewardForm] = useState<Partial<Reward>>({
    name: '',
    description: '',
    pointsCost: 0,
    category: 'Discount',
  });
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    searchTerm: '',
    tier: '',
    sortBy: 'name',
    sortDirection: 'asc',
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Load data from localStorage on initial render
  useEffect(() => {
    try {
      const savedCustomers = localStorage.getItem('loyalty-customers');
      const savedRewards = localStorage.getItem('loyalty-rewards');
      const savedDarkMode = localStorage.getItem('loyalty-dark-mode');

      if (savedCustomers) {
        setCustomers(JSON.parse(savedCustomers));
      } else {
        // Initialize with sample data if no saved customers
        setCustomers(generateSampleCustomers());
      }

      if (savedRewards) {
        setRewards(JSON.parse(savedRewards));
      }

      if (savedDarkMode === 'true') {
        setIsDarkMode(true);
        document.documentElement.classList.add('dark');
      }
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
      // Fall back to sample data if there's an error
      setCustomers(generateSampleCustomers());
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('loyalty-customers', JSON.stringify(customers));
    } catch (error) {
      console.error('Error saving customers to localStorage:', error);
    }
  }, [customers]);

  useEffect(() => {
    try {
      localStorage.setItem('loyalty-rewards', JSON.stringify(rewards));
    } catch (error) {
      console.error('Error saving rewards to localStorage:', error);
    }
  }, [rewards]);

  // Apply dark mode class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('loyalty-dark-mode', isDarkMode.toString());
  }, [isDarkMode]);

  // Generate sample customers data
  const generateSampleCustomers = (): Customer[] => {
    const sampleCustomers: Customer[] = [
      {
        id: '1',
        name: 'John Smith',
        email: 'john.smith@example.com',
        phone: '555-123-4567',
        points: 1250,
        totalSpent: 750,
        tier: 'Silver',
        joinDate: '2023-01-15',
        transactions: [
          {
            id: 't1',
            customerId: '1',
            date: '2023-01-20',
            amount: 250,
            pointsEarned: 250,
            storeLocation: 'Downtown Store'
          },
          {
            id: 't2',
            customerId: '1',
            date: '2023-02-10',
            amount: 500,
            pointsEarned: 625, // Silver tier bonus
            storeLocation: 'Mall Location'
          }
        ],
        redemptions: [
          {
            id: 'r1',
            customerId: '1',
            date: '2023-02-15',
            reward: {
              id: '1',
              name: '10% Discount',
              description: 'Get 10% off your next purchase',
              pointsCost: 500,
              category: 'Discount'
            },
            pointsSpent: 500
          }
        ]
      },
      {
        id: '2',
        name: 'Sarah Johnson',
        email: 'sarah.j@example.com',
        phone: '555-987-6543',
        points: 3000,
        totalSpent: 1500,
        tier: 'Gold',
        joinDate: '2022-11-05',
        transactions: [
          {
            id: 't3',
            customerId: '2',
            date: '2022-11-10',
            amount: 300,
            pointsEarned: 300,
            storeLocation: 'Downtown Store'
          },
          {
            id: 't4',
            customerId: '2',
            date: '2022-12-05',
            amount: 450,
            pointsEarned: 675, // Gold tier bonus
            storeLocation: 'Airport Location'
          },
          {
            id: 't5',
            customerId: '2',
            date: '2023-01-15',
            amount: 750,
            pointsEarned: 1125, // Gold tier bonus
            storeLocation: 'Mall Location'
          }
        ],
        redemptions: []
      },
      {
        id: '3',
        name: 'Michael Brown',
        email: 'michael.b@example.com',
        phone: '555-456-7890',
        points: 350,
        totalSpent: 350,
        tier: 'Bronze',
        joinDate: '2023-03-01',
        transactions: [
          {
            id: 't6',
            customerId: '3',
            date: '2023-03-05',
            amount: 150,
            pointsEarned: 150,
            storeLocation: 'Downtown Store'
          },
          {
            id: 't7',
            customerId: '3',
            date: '2023-03-20',
            amount: 200,
            pointsEarned: 200,
            storeLocation: 'Mall Location'
          }
        ],
        redemptions: []
      },
      {
        id: '4',
        name: 'Emma Wilson',
        email: 'emma.w@example.com',
        phone: '555-789-0123',
        points: 7500,
        totalSpent: 3500,
        tier: 'Platinum',
        joinDate: '2022-06-15',
        transactions: [
          {
            id: 't8',
            customerId: '4',
            date: '2022-06-20',
            amount: 800,
            pointsEarned: 800,
            storeLocation: 'Downtown Store'
          },
          {
            id: 't9',
            customerId: '4',
            date: '2022-08-10',
            amount: 1200,
            pointsEarned: 1800, // Silver tier at that time
            storeLocation: 'Mall Location'
          },
          {
            id: 't10',
            customerId: '4',
            date: '2022-11-05',
            amount: 750,
            pointsEarned: 1500, // Gold tier at that time
            storeLocation: 'Airport Location'
          },
          {
            id: 't11',
            customerId: '4',
            date: '2023-01-20',
            amount: 750,
            pointsEarned: 1500, // Platinum tier
            storeLocation: 'Downtown Store'
          }
        ],
        redemptions: [
          {
            id: 'r2',
            customerId: '4',
            date: '2022-09-15',
            reward: {
              id: '2',
              name: '25% Discount',
              description: 'Get 25% off your next purchase',
              pointsCost: 1000,
              category: 'Discount'
            },
            pointsSpent: 1000
          },
          {
            id: 'r3',
            customerId: '4',
            date: '2022-12-10',
            reward: {
              id: '3',
              name: 'Free T-Shirt',
              description: 'Redeem for a free branded t-shirt',
              pointsCost: 1500,
              category: 'Product'
            },
            pointsSpent: 1500
          }
        ]
      }
    ];

    return sampleCustomers;
  };

  // Helper function to determine customer tier based on total spent
  const determineCustomerTier = (totalSpent: number): 'Bronze' | 'Silver' | 'Gold' | 'Platinum' => {
    if (totalSpent >= tiers[3].minimumSpend) return 'Platinum';
    if (totalSpent >= tiers[2].minimumSpend) return 'Gold';
    if (totalSpent >= tiers[1].minimumSpend) return 'Silver';
    return 'Bronze';
  };

  // Helper function to get tier multiplier
  const getTierMultiplier = (tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum'): number => {
    const tierConfig = tiers.find(t => t.name === tier);
    return tierConfig?.pointsMultiplier || 1;
  };

  // Handle customer form input changes
  const handleCustomerFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomerForm(prev => ({ ...prev, [name]: value }));
  };

  // Handle transaction form input changes
  const handleTransactionFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'amount') {
      setTransactionForm(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setTransactionForm(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle reward form input changes
  const handleRewardFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'pointsCost') {
      setRewardForm(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setRewardForm(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle filter changes
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilterOptions(prev => ({ ...prev, [name]: value }));
  };

  // Toggle sort direction
  const toggleSort = (sortBy: 'name' | 'points' | 'totalSpent' | 'joinDate') => {
    setFilterOptions(prev => ({
      ...prev,
      sortBy,
      sortDirection: prev.sortBy === sortBy && prev.sortDirection === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Add new customer
  const addCustomer = () => {
    if (!customerForm.name || !customerForm.email || !customerForm.phone) {
      alert('Please fill in all required fields!');
      return;
    }

    const newCustomer: Customer = {
      id: Date.now().toString(),
      name: customerForm.name || '',
      email: customerForm.email || '',
      phone: customerForm.phone || '',
      points: 0,
      totalSpent: 0,
      tier: 'Bronze',
      joinDate: new Date().toISOString().split('T')[0],
      transactions: [],
      redemptions: []
    };

    setCustomers(prev => [...prev, newCustomer]);
    setCustomerForm({ name: '', email: '', phone: '' });
    setIsAddingCustomer(false);
  };

  // Update existing customer
  const updateCustomer = () => {
    if (!selectedCustomerId || !customerForm.name || !customerForm.email || !customerForm.phone) {
      alert('Please fill in all required fields!');
      return;
    }

    setCustomers(prev => prev.map(customer => {
      if (customer.id === selectedCustomerId) {
        return {
          ...customer,
          name: customerForm.name || customer.name,
          email: customerForm.email || customer.email,
          phone: customerForm.phone || customer.phone
        };
      }
      return customer;
    }));

    setCustomerForm({ name: '', email: '', phone: '' });
    setIsEditingCustomer(false);
    setSelectedCustomerId(null);
  };

  // Delete customer
  const deleteCustomer = (id: string) => {
    if (window.confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
      setCustomers(prev => prev.filter(customer => customer.id !== id));
    }
  };

  // Start editing customer
  const startEditingCustomer = (customer: Customer) => {
    setSelectedCustomerId(customer.id);
    setCustomerForm({
      name: customer.name,
      email: customer.email,
      phone: customer.phone
    });
    setIsEditingCustomer(true);
  };

  // Add transaction
  const addTransaction = () => {
    if (!selectedCustomerId || !transactionForm.amount || !transactionForm.storeLocation) {
      alert('Please fill in all required fields!');
      return;
    }

    const amount = transactionForm.amount || 0;
    const customer = customers.find(c => c.id === selectedCustomerId);
    
    if (!customer) {
      alert('Customer not found!');
      return;
    }

    // Calculate points based on tier multiplier
    const pointsMultiplier = getTierMultiplier(customer.tier);
    const pointsEarned = Math.floor(amount * pointsMultiplier);

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      customerId: selectedCustomerId,
      date: new Date().toISOString().split('T')[0],
      amount,
      pointsEarned,
      storeLocation: transactionForm.storeLocation || ''
    };

    // Update customer with new transaction, points, and total spent
    const newTotalSpent = customer.totalSpent + amount;
    const newTier = determineCustomerTier(newTotalSpent);

    setCustomers(prev => prev.map(c => {
      if (c.id === selectedCustomerId) {
        return {
          ...c,
          points: c.points + pointsEarned,
          totalSpent: newTotalSpent,
          tier: newTier,
          transactions: [...c.transactions, newTransaction]
        };
      }
      return c;
    }));

    setTransactionForm({ amount: 0, storeLocation: '' });
    setIsAddingTransaction(false);
  };

  // Add new reward
  const addReward = () => {
    if (!rewardForm.name || !rewardForm.description || !rewardForm.pointsCost || !rewardForm.category) {
      alert('Please fill in all required fields!');
      return;
    }

    const newReward: Reward = {
      id: Date.now().toString(),
      name: rewardForm.name || '',
      description: rewardForm.description || '',
      pointsCost: rewardForm.pointsCost || 0,
      category: rewardForm.category as 'Discount' | 'Product' | 'Experience' || 'Discount'
    };

    setRewards(prev => [...prev, newReward]);
    setRewardForm({ name: '', description: '', pointsCost: 0, category: 'Discount' });
    setIsAddingReward(false);
  };

  // Update existing reward
  const updateReward = () => {
    if (!selectedRewardId || !rewardForm.name || !rewardForm.description || !rewardForm.pointsCost || !rewardForm.category) {
      alert('Please fill in all required fields!');
      return;
    }

    setRewards(prev => prev.map(reward => {
      if (reward.id === selectedRewardId) {
        return {
          ...reward,
          name: rewardForm.name || reward.name,
          description: rewardForm.description || reward.description,
          pointsCost: rewardForm.pointsCost || reward.pointsCost,
          category: rewardForm.category as 'Discount' | 'Product' | 'Experience' || reward.category
        };
      }
      return reward;
    }));

    // Update reward in all customer redemptions
    setCustomers(prev => prev.map(customer => {
      const updatedRedemptions = customer.redemptions.map(redemption => {
        if (redemption.reward.id === selectedRewardId) {
          const updatedReward = rewards.find(r => r.id === selectedRewardId);
          if (updatedReward) {
            return { ...redemption, reward: updatedReward };
          }
        }
        return redemption;
      });
      return { ...customer, redemptions: updatedRedemptions };
    }));

    setRewardForm({ name: '', description: '', pointsCost: 0, category: 'Discount' });
    setIsEditingReward(false);
    setSelectedRewardId(null);
  };

  // Delete reward
  const deleteReward = (id: string) => {
    if (window.confirm('Are you sure you want to delete this reward? This action cannot be undone.')) {
      // Check if reward is used in any redemptions
      const isUsed = customers.some(customer => 
        customer.redemptions.some(redemption => redemption.reward.id === id)
      );

      if (isUsed) {
        alert('This reward has been redeemed by customers and cannot be deleted!');
        return;
      }

      setRewards(prev => prev.filter(reward => reward.id !== id));
    }
  };

  // Start editing reward
  const startEditingReward = (reward: Reward) => {
    setSelectedRewardId(reward.id);
    setRewardForm({
      name: reward.name,
      description: reward.description,
      pointsCost: reward.pointsCost,
      category: reward.category
    });
    setIsEditingReward(true);
  };

  // Redeem reward
  const redeemReward = () => {
    if (!selectedCustomerId || !selectedRewardId) {
      alert('Please select a customer and a reward!');
      return;
    }

    const customer = customers.find(c => c.id === selectedCustomerId);
    const reward = rewards.find(r => r.id === selectedRewardId);

    if (!customer || !reward) {
      alert('Customer or reward not found!');
      return;
    }

    if (customer.points < reward.pointsCost) {
      alert(`Customer doesn't have enough points! Needed: ${reward.pointsCost}, Available: ${customer.points}`);
      return;
    }

    const newRedemption: Redemption = {
      id: Date.now().toString(),
      customerId: selectedCustomerId,
      date: new Date().toISOString().split('T')[0],
      reward: { ...reward },
      pointsSpent: reward.pointsCost
    };

    setCustomers(prev => prev.map(c => {
      if (c.id === selectedCustomerId) {
        return {
          ...c,
          points: c.points - reward.pointsCost,
          redemptions: [...c.redemptions, newRedemption]
        };
      }
      return c;
    }));

    setIsRedeemingReward(false);
    setSelectedRewardId(null);
  };

  // Filter and sort customers
  const filteredCustomers = (): Customer[] => {
    return customers
      .filter(customer => {
        const matchesSearch = customer.name.toLowerCase().includes(filterOptions.searchTerm.toLowerCase()) ||
                           customer.email.toLowerCase().includes(filterOptions.searchTerm.toLowerCase()) ||
                           customer.phone.includes(filterOptions.searchTerm);
        const matchesTier = filterOptions.tier === '' || customer.tier === filterOptions.tier;
        return matchesSearch && matchesTier;
      })
      .sort((a, b) => {
        const direction = filterOptions.sortDirection === 'asc' ? 1 : -1;
        switch (filterOptions.sortBy) {
          case 'name':
            return a.name.localeCompare(b.name) * direction;
          case 'points':
            return (a.points - b.points) * direction;
          case 'totalSpent':
            return (a.totalSpent - b.totalSpent) * direction;
          case 'joinDate':
            return (new Date(a.joinDate).getTime() - new Date(b.joinDate).getTime()) * direction;
          default:
            return 0;
        }
      });
  };

  // Get transaction data for charts
  const getTransactionChartData = () => {
    // Create a map to store transactions by month
    const last6Months = new Array(6).fill(0).map((_, index) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - index));
      return {
        month: format(date, 'MMM yyyy'),
        totalSpent: 0,
        pointsEarned: 0,
        count: 0
      };
    });

    // Map month names to indexes in our array
    const monthMap = last6Months.reduce((map, data, index) => {
      map[data.month] = index;
      return map;
    }, {} as Record<string, number>);

    // Aggregate all transactions
    customers.forEach(customer => {
      customer.transactions.forEach(transaction => {
        const transactionDate = new Date(transaction.date);
        const monthKey = format(transactionDate, 'MMM yyyy');
        
        // Only include transactions from the last 6 months
        if (monthKey in monthMap) {
          const index = monthMap[monthKey];
          last6Months[index].totalSpent += transaction.amount;
          last6Months[index].pointsEarned += transaction.pointsEarned;
          last6Months[index].count += 1;
        }
      });
    });

    return last6Months;
  };

  // Get redemption data for charts
  const getRedemptionChartData = () => {
    // Create data for each category
    const categoryData = {
      'Discount': { name: 'Discount', value: 0 },
      'Product': { name: 'Product', value: 0 },
      'Experience': { name: 'Experience', value: 0 }
    };

    // Aggregate all redemptions
    customers.forEach(customer => {
      customer.redemptions.forEach(redemption => {
        const category = redemption.reward.category;
        if (category in categoryData) {
          categoryData[category].value += 1;
        }
      });
    });

    return Object.values(categoryData);
  };

  // Get customer tier distribution data
  const getTierDistributionData = () => {
    const tierCounts = {
      'Bronze': { name: 'Bronze', value: 0 },
      'Silver': { name: 'Silver', value: 0 },
      'Gold': { name: 'Gold', value: 0 },
      'Platinum': { name: 'Platinum', value: 0 }
    };

    customers.forEach(customer => {
      tierCounts[customer.tier].value += 1;
    });

    return Object.values(tierCounts);
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMM d, yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  // Get customer by ID
  const getCustomerById = (id: string): Customer | undefined => {
    return customers.find(c => c.id === id);
  };

  // Get reward by ID
  const getRewardById = (id: string): Reward | undefined => {
    return rewards.find(r => r.id === id);
  };

  // Calculate total points earned, redeemed, and currently available
  const getPointsStats = () => {
    let totalEarned = 0;
    let totalRedeemed = 0;

    customers.forEach(customer => {
      customer.transactions.forEach(transaction => {
        totalEarned += transaction.pointsEarned;
      });

      customer.redemptions.forEach(redemption => {
        totalRedeemed += redemption.pointsSpent;
      });
    });

    const totalAvailable = customers.reduce((sum, customer) => sum + customer.points, 0);

    return { totalEarned, totalRedeemed, totalAvailable };
  };

  // Helper function to render loyalty tier badges with appropriate colors
  const renderTierBadge = (tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum') => {
    const tierConfig = tiers.find(t => t.name === tier) || tiers[0];
    return (
      <span 
        className="badge flex items-center gap-1" 
        style={{ backgroundColor: `${tierConfig.color}20`, color: tierConfig.color, borderColor: tierConfig.color }}
      >
        {tierConfig.icon}
        {tier}
      </span>
    );
  };

  // Close modal when pressing Escape key
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsAddingCustomer(false);
        setIsEditingCustomer(false);
        setIsAddingTransaction(false);
        setIsAddingReward(false);
        setIsEditingReward(false);
        setIsRedeemingReward(false);
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm">
        <div className="container-fluid py-4">
          <div className="flex-between">
            <div className="flex items-center space-x-3">
              <div className="hidden md:flex items-center">
                <Trophy className="text-primary-600 mr-2" size={24} />
                <h1 className="text-xl font-bold">Loyalty Rewards</h1>
              </div>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden btn-sm p-1 text-gray-500 dark:text-gray-400">
                <Menu size={24} />
              </button>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={toggleDarkMode}
                className="theme-toggle"  
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                <span className="theme-toggle-thumb"></span>
                <span className="sr-only">{isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-800 shadow-md">
          <nav className="container-fluid py-2">
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
                  className={`flex items-center space-x-2 w-full p-2 rounded-md ${activeTab === 'dashboard' ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : ''}`}
                >
                  <ChartLine size={18} />
                  <span>Dashboard</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setActiveTab('customers'); setMobileMenuOpen(false); }}
                  className={`flex items-center space-x-2 w-full p-2 rounded-md ${activeTab === 'customers' ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : ''}`}
                >
                  <User size={18} />
                  <span>Customers</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setActiveTab('transactions'); setMobileMenuOpen(false); }}
                  className={`flex items-center space-x-2 w-full p-2 rounded-md ${activeTab === 'transactions' ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : ''}`}
                >
                  <ShoppingCart size={18} />
                  <span>Transactions</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setActiveTab('rewards'); setMobileMenuOpen(false); }}
                  className={`flex items-center space-x-2 w-full p-2 rounded-md ${activeTab === 'rewards' ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : ''}`}
                >
                  <Gift size={18} />
                  <span>Rewards</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setActiveTab('redeem'); setMobileMenuOpen(false); }}
                  className={`flex items-center space-x-2 w-full p-2 rounded-md ${activeTab === 'redeem' ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : ''}`}
                >
                  <Tag size={18} />
                  <span>Redeem</span>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-1">
        {/* Sidebar - desktop only */}
        <div className="hidden md:block w-64 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700">
          <nav className="sticky top-0 p-4 space-y-2">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-2 w-full p-2 rounded-md ${activeTab === 'dashboard' ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : ''}`}
            >
              <ChartLine size={18} />
              <span>Dashboard</span>
            </button>
            <button 
              onClick={() => setActiveTab('customers')}
              className={`flex items-center space-x-2 w-full p-2 rounded-md ${activeTab === 'customers' ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : ''}`}
            >
              <User size={18} />
              <span>Customers</span>
            </button>
            <button 
              onClick={() => setActiveTab('transactions')}
              className={`flex items-center space-x-2 w-full p-2 rounded-md ${activeTab === 'transactions' ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : ''}`}
            >
              <ShoppingCart size={18} />
              <span>Transactions</span>
            </button>
            <button 
              onClick={() => setActiveTab('rewards')}
              className={`flex items-center space-x-2 w-full p-2 rounded-md ${activeTab === 'rewards' ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : ''}`}
            >
              <Gift size={18} />
              <span>Rewards</span>
            </button>
            <button 
              onClick={() => setActiveTab('redeem')}
              className={`flex items-center space-x-2 w-full p-2 rounded-md ${activeTab === 'redeem' ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : ''}`}
            >
              <Tag size={18} />
              <span>Redeem</span>
            </button>
          </nav>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {/* Dashboard */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="flex-between">
                <h2 className="text-xl font-bold">Dashboard</h2>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setActiveTab('customers')}
                    className="btn btn-primary flex items-center space-x-2"
                  >
                    <UserPlus size={16} />
                    <span>Add Customer</span>
                  </button>
                </div>
              </div>
              
              {/* Stats row */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="stat-card">
                  <div className="stat-title">Total Customers</div>
                  <div className="stat-value">{customers.length}</div>
                  <div className="stat-desc flex items-center mt-1">
                    <User size={14} className="mr-1" />
                    Active loyalty members
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-title">Total Points Earned</div>
                  <div className="stat-value">{getPointsStats().totalEarned.toLocaleString()}</div>
                  <div className="stat-desc flex items-center mt-1">
                    <Trophy size={14} className="mr-1" />
                    Across all customers
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-title">Points Redeemed</div>
                  <div className="stat-value">{getPointsStats().totalRedeemed.toLocaleString()}</div>
                  <div className="stat-desc flex items-center mt-1">
                    <Gift size={14} className="mr-1" />
                    Points used for rewards
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-title">Available Rewards</div>
                  <div className="stat-value">{rewards.length}</div>
                  <div className="stat-desc flex items-center mt-1">
                    <Tag size={14} className="mr-1" />
                    Active reward options
                  </div>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="card">
                  <h3 className="text-lg font-medium mb-4">Monthly Transactions</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={getTransactionChartData()}
                                 margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="totalSpent" name="Amount Spent ($)" stroke="#8884d8" activeDot={{ r: 8 }} />
                        <Line type="monotone" dataKey="pointsEarned" name="Points Earned" stroke="#82ca9d" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="card">
                  <h3 className="text-lg font-medium mb-4">Customer Tiers</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getTierDistributionData()}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" name="Customers" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Recent activity */}
              <div className="card">
                <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead>
                      <tr>
                        <th className="table-header">Date</th>
                        <th className="table-header">Customer</th>
                        <th className="table-header">Activity</th>
                        <th className="table-header">Details</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-gray-700">
                      {/* Combine and sort transactions and redemptions */}
                      {customers.flatMap(customer => [
                        ...customer.transactions.map(transaction => ({
                          date: transaction.date,
                          customer: customer.name,
                          activity: 'Purchase',
                          details: `$${transaction.amount.toFixed(2)} - Earned ${transaction.pointsEarned} points`
                        })),
                        ...customer.redemptions.map(redemption => ({
                          date: redemption.date,
                          customer: customer.name,
                          activity: 'Redemption',
                          details: `${redemption.reward.name} - Used ${redemption.pointsSpent} points`
                        }))
                      ])
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .slice(0, 10) // Only show the 10 most recent activities
                      .map((activity, index) => (
                        <tr key={index}>
                          <td className="table-cell">{formatDate(activity.date)}</td>
                          <td className="table-cell">{activity.customer}</td>
                          <td className="table-cell">
                            <span className={`badge ${activity.activity === 'Purchase' ? 'badge-success' : 'badge-info'}`}>
                              {activity.activity}
                            </span>
                          </td>
                          <td className="table-cell">{activity.details}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Customers Tab */}
          {activeTab === 'customers' && (
            <div className="space-y-6">
              <div className="flex-between flex-wrap gap-2">
                <h2 className="text-xl font-bold">Customers</h2>
                <button 
                  onClick={() => {
                    setIsAddingCustomer(true);
                    setCustomerForm({ name: '', email: '', phone: '' });
                  }}
                  className="btn btn-primary flex items-center space-x-2"
                >
                  <UserPlus size={16} />
                  <span>Add Customer</span>
                </button>
              </div>

              {/* Filters */}
              <div className="card p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="form-group mb-0">
                    <label className="form-label">Search</label>
                    <div className="relative">
                      <input
                        type="text"
                        name="searchTerm"
                        value={filterOptions.searchTerm}
                        onChange={handleFilterChange}
                        placeholder="Search name, email, phone..."
                        className="input pr-10"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                        <Search size={18} />
                      </div>
                    </div>
                  </div>
                  <div className="form-group mb-0">
                    <label className="form-label">Filter by Tier</label>
                    <div className="relative">
                      <select
                        name="tier"
                        value={filterOptions.tier}
                        onChange={handleFilterChange}
                        className="input pr-10"
                      >
                        <option value="">All Tiers</option>
                        {tiers.map(tier => (
                          <option key={tier.name} value={tier.name}>{tier.name}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                        <Filter size={18} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customers Table */}
              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead>
                      <tr>
                        <th className="table-header">
                          <button
                            onClick={() => toggleSort('name')}
                            className="flex items-center gap-1"
                            aria-label="Sort by name"
                          >
                            Name <ArrowUpDown size={14} />
                          </button>
                        </th>
                        <th className="table-header">Contact</th>
                        <th className="table-header">
                          <button
                            onClick={() => toggleSort('points')}
                            className="flex items-center gap-1"
                            aria-label="Sort by points"
                          >
                            Points <ArrowUpDown size={14} />
                          </button>
                        </th>
                        <th className="table-header">
                          <button
                            onClick={() => toggleSort('totalSpent')}
                            className="flex items-center gap-1"
                            aria-label="Sort by spent"
                          >
                            Total Spent <ArrowUpDown size={14} />
                          </button>
                        </th>
                        <th className="table-header">Tier</th>
                        <th className="table-header">
                          <button
                            onClick={() => toggleSort('joinDate')}
                            className="flex items-center gap-1"
                            aria-label="Sort by join date"
                          >
                            Join Date <ArrowUpDown size={14} />
                          </button>
                        </th>
                        <th className="table-header">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-gray-700">
                      {filteredCustomers().map(customer => (
                        <tr key={customer.id}>
                          <td className="table-cell font-medium">{customer.name}</td>
                          <td className="table-cell">
                            <div className="text-sm text-gray-500 dark:text-gray-400">{customer.email}</div>
                            <div className="text-sm">{customer.phone}</div>
                          </td>
                          <td className="table-cell">
                            <div className="flex items-center">
                              <Trophy size={14} className="text-yellow-500 mr-1" />
                              {customer.points.toLocaleString()}
                            </div>
                          </td>
                          <td className="table-cell">${customer.totalSpent.toFixed(2)}</td>
                          <td className="table-cell">
                            {renderTierBadge(customer.tier)}
                          </td>
                          <td className="table-cell">{formatDate(customer.joinDate)}</td>
                          <td className="table-cell">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => startEditingCustomer(customer)}
                                className="btn btn-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300"
                                aria-label="Edit customer"
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedCustomerId(customer.id);
                                  setIsAddingTransaction(true);
                                  setTransactionForm({ amount: 0, storeLocation: '' });
                                }}
                                className="btn btn-sm bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-600 dark:text-green-400"
                                aria-label="Add transaction"
                              >
                                <DollarSign size={14} />
                              </button>
                              <button
                                onClick={() => deleteCustomer(customer.id)}
                                className="btn btn-sm bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400"
                                aria-label="Delete customer"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filteredCustomers().length === 0 && (
                  <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                    No customers found. Try adjusting your filters or add a new customer.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Transactions Tab */}
          {activeTab === 'transactions' && (
            <div className="space-y-6">
              <div className="flex-between">
                <h2 className="text-xl font-bold">Transaction History</h2>
              </div>

              {/* Transactions Table */}
              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead>
                      <tr>
                        <th className="table-header">Date</th>
                        <th className="table-header">Customer</th>
                        <th className="table-header">Amount</th>
                        <th className="table-header">Points Earned</th>
                        <th className="table-header">Store Location</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-gray-700">
                      {customers
                        .flatMap(customer => 
                          customer.transactions.map(transaction => ({
                            ...transaction,
                            customerName: customer.name
                          }))
                        )
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map(transaction => (
                          <tr key={transaction.id}>
                            <td className="table-cell">{formatDate(transaction.date)}</td>
                            <td className="table-cell">{transaction.customerName}</td>
                            <td className="table-cell">${transaction.amount.toFixed(2)}</td>
                            <td className="table-cell">
                              <div className="flex items-center">
                                <Trophy size={14} className="text-yellow-500 mr-1" />
                                {transaction.pointsEarned}
                              </div>
                            </td>
                            <td className="table-cell">{transaction.storeLocation}</td>
                          </tr>
                        ))
                      }
                    </tbody>
                  </table>
                </div>
                {customers.flatMap(c => c.transactions).length === 0 && (
                  <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                    No transactions found. Add transactions to customers to see them here.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Rewards Tab */}
          {activeTab === 'rewards' && (
            <div className="space-y-6">
              <div className="flex-between">
                <h2 className="text-xl font-bold">Rewards</h2>
                <button 
                  onClick={() => {
                    setIsAddingReward(true);
                    setRewardForm({ name: '', description: '', pointsCost: 0, category: 'Discount' });
                  }}
                  className="btn btn-primary flex items-center space-x-2"
                >
                  <Plus size={16} />
                  <span>Add Reward</span>
                </button>
              </div>

              {/* Rewards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rewards.map(reward => (
                  <div key={reward.id} className="card relative">
                    <div className="absolute top-4 right-4 flex space-x-2">
                      <button
                        onClick={() => startEditingReward(reward)}
                        className="btn btn-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300"
                        aria-label="Edit reward"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => deleteReward(reward.id)}
                        className="btn btn-sm bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400"
                        aria-label="Delete reward"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="mb-2">
                      <span 
                        className="badge" 
                        style={{ 
                          backgroundColor: reward.category === 'Discount' ? '#ECFDF5' : 
                                         reward.category === 'Product' ? '#EFF6FF' : '#F9FAFB',
                          color: reward.category === 'Discount' ? '#059669' : 
                                  reward.category === 'Product' ? '#3B82F6' : '#6B7280'
                        }}
                      >
                        {reward.category}
                      </span>
                    </div>
                    <h3 className="text-lg font-medium mb-2">{reward.name}</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">{reward.description}</p>
                    <div className="flex justify-between items-center mt-auto">
                      <div className="flex items-center">
                        <Trophy size={16} className="text-yellow-500 mr-1" />
                        <span className="font-medium">{reward.pointsCost.toLocaleString()} points</span>
                      </div>
                      <button
                        onClick={() => {
                          setActiveTab('redeem');
                          setSelectedRewardId(reward.id);
                        }}
                        className="btn btn-sm btn-primary"
                      >
                        Redeem
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {rewards.length === 0 && (
                <div className="card p-8 text-center">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">No rewards available. Add some rewards for your customers!</p>
                  <button 
                    onClick={() => {
                      setIsAddingReward(true);
                      setRewardForm({ name: '', description: '', pointsCost: 0, category: 'Discount' });
                    }}
                    className="btn btn-primary inline-flex items-center"
                  >
                    <Plus size={16} className="mr-2" />
                    Add First Reward
                  </button>
                </div>
              )}

              {/* Redemption Chart */}
              {customers.some(c => c.redemptions.length > 0) && (
                <div className="card mt-8">
                  <h3 className="text-lg font-medium mb-4">Redemption Statistics</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getRedemptionChartData()}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" name="Redemptions" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Redeem Tab */}
          {activeTab === 'redeem' && (
            <div className="space-y-6">
              <div className="flex-between">
                <h2 className="text-xl font-bold">Redeem Rewards</h2>
                <button 
                  onClick={() => setIsRedeemingReward(true)}
                  className="btn btn-primary flex items-center space-x-2"
                >
                  <Gift size={16} />
                  <span>New Redemption</span>
                </button>
              </div>

              {/* Redemption History */}
              <div className="card overflow-hidden">
                <h3 className="text-lg font-medium p-4 border-b border-gray-200 dark:border-gray-700">Redemption History</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead>
                      <tr>
                        <th className="table-header">Date</th>
                        <th className="table-header">Customer</th>
                        <th className="table-header">Reward</th>
                        <th className="table-header">Category</th>
                        <th className="table-header">Points Used</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-gray-700">
                      {customers
                        .flatMap(customer => 
                          customer.redemptions.map(redemption => ({
                            ...redemption,
                            customerName: customer.name
                          }))
                        )
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map(redemption => (
                          <tr key={redemption.id}>
                            <td className="table-cell">{formatDate(redemption.date)}</td>
                            <td className="table-cell">{redemption.customerName}</td>
                            <td className="table-cell">{redemption.reward.name}</td>
                            <td className="table-cell">
                              <span 
                                className="badge" 
                                style={{ 
                                  backgroundColor: redemption.reward.category === 'Discount' ? '#ECFDF5' : 
                                                redemption.reward.category === 'Product' ? '#EFF6FF' : '#F9FAFB',
                                  color: redemption.reward.category === 'Discount' ? '#059669' : 
                                          redemption.reward.category === 'Product' ? '#3B82F6' : '#6B7280'
                                }}
                              >
                                {redemption.reward.category}
                              </span>
                            </td>
                            <td className="table-cell">
                              <div className="flex items-center">
                                <Trophy size={14} className="text-yellow-500 mr-1" />
                                {redemption.pointsSpent.toLocaleString()}
                              </div>
                            </td>
                          </tr>
                        ))
                      }
                    </tbody>
                  </table>
                </div>
                {customers.flatMap(c => c.redemptions).length === 0 && (
                  <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                    No redemptions found. Customers can redeem their points for rewards!
                  </div>
                )}
              </div>

              {/* Available Rewards */}
              <div className="card">
                <h3 className="text-lg font-medium p-4 border-b border-gray-200 dark:border-gray-700">Available Rewards</h3>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rewards.map(reward => (
                    <div key={reward.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="mb-2">
                        <span 
                          className="badge" 
                          style={{ 
                            backgroundColor: reward.category === 'Discount' ? '#ECFDF5' : 
                                          reward.category === 'Product' ? '#EFF6FF' : '#F9FAFB',
                            color: reward.category === 'Discount' ? '#059669' : 
                                    reward.category === 'Product' ? '#3B82F6' : '#6B7280'
                          }}
                        >
                          {reward.category}
                        </span>
                      </div>
                      <h4 className="font-medium mb-1">{reward.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{reward.description}</p>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <Trophy size={14} className="text-yellow-500 mr-1" />
                          <span className="font-medium">{reward.pointsCost.toLocaleString()} points</span>
                        </div>
                        <button
                          onClick={() => {
                            setIsRedeemingReward(true);
                            setSelectedRewardId(reward.id);
                          }}
                          className="btn btn-sm btn-primary"
                        >
                          Select
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 py-4 text-center text-gray-500 dark:text-gray-400 text-sm">
        Copyright © 2025 of Datavtar Private Limited. All rights reserved.
      </footer>

      {/* Add Customer Modal */}
      {isAddingCustomer && (
        <div className="modal-backdrop" onClick={() => setIsAddingCustomer(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Add New Customer</h3>
              <button 
                onClick={() => setIsAddingCustomer(false)}
                className="text-gray-400 hover:text-gray-500"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
            <div className="mt-4 space-y-4">
              <div className="form-group">
                <label className="form-label" htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={customerForm.name}
                  onChange={handleCustomerFormChange}
                  className="input"
                  placeholder="Enter customer name"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={customerForm.email}
                  onChange={handleCustomerFormChange}
                  className="input"
                  placeholder="customer@example.com"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={customerForm.phone}
                  onChange={handleCustomerFormChange}
                  className="input"
                  placeholder="555-123-4567"
                  required
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => setIsAddingCustomer(false)}
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={addCustomer}
                className="btn btn-primary flex items-center space-x-2"
              >
                <UserPlus size={16} />
                <span>Add Customer</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {isEditingCustomer && (
        <div className="modal-backdrop" onClick={() => setIsEditingCustomer(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Edit Customer</h3>
              <button 
                onClick={() => setIsEditingCustomer(false)}
                className="text-gray-400 hover:text-gray-500"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
            <div className="mt-4 space-y-4">
              <div className="form-group">
                <label className="form-label" htmlFor="editName">Full Name</label>
                <input
                  type="text"
                  id="editName"
                  name="name"
                  value={customerForm.name}
                  onChange={handleCustomerFormChange}
                  className="input"
                  placeholder="Enter customer name"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="editEmail">Email Address</label>
                <input
                  type="email"
                  id="editEmail"
                  name="email"
                  value={customerForm.email}
                  onChange={handleCustomerFormChange}
                  className="input"
                  placeholder="customer@example.com"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="editPhone">Phone Number</label>
                <input
                  type="tel"
                  id="editPhone"
                  name="phone"
                  value={customerForm.phone}
                  onChange={handleCustomerFormChange}
                  className="input"
                  placeholder="555-123-4567"
                  required
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => setIsEditingCustomer(false)}
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={updateCustomer}
                className="btn btn-primary flex items-center space-x-2"
              >
                <Check size={16} />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Transaction Modal */}
      {isAddingTransaction && (
        <div className="modal-backdrop" onClick={() => setIsAddingTransaction(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Add Transaction for {getCustomerById(selectedCustomerId || '')?.name}
              </h3>
              <button 
                onClick={() => setIsAddingTransaction(false)}
                className="text-gray-400 hover:text-gray-500"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
            <div className="mt-4 space-y-4">
              <div className="form-group">
                <label className="form-label" htmlFor="amount">Purchase Amount ($)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    value={transactionForm.amount || ''}
                    onChange={handleTransactionFormChange}
                    className="input pl-10"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="storeLocation">Store Location</label>
                <select
                  id="storeLocation"
                  name="storeLocation"
                  value={transactionForm.storeLocation}
                  onChange={handleTransactionFormChange}
                  className="input"
                  required
                >
                  <option value="">Select store location</option>
                  <option value="Downtown Store">Downtown Store</option>
                  <option value="Mall Location">Mall Location</option>
                  <option value="Airport Location">Airport Location</option>
                  <option value="Online Store">Online Store</option>
                </select>
              </div>

              {/* Points calculation preview */}
              <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-md">
                <h4 className="font-medium mb-2 flex items-center">
                  <Trophy size={16} className="text-yellow-500 mr-2" />
                  Points Calculation
                </h4>
                <div className="space-y-1 text-sm">
                  {selectedCustomerId && (
                    <>
                      <div className="flex justify-between">
                        <span>Purchase Amount:</span>
                        <span>${(transactionForm.amount || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Customer Tier:</span>
                        <span>{getCustomerById(selectedCustomerId)?.tier || 'Bronze'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tier Multiplier:</span>
                        <span>
                          {getTierMultiplier(getCustomerById(selectedCustomerId)?.tier || 'Bronze')}x
                        </span>
                      </div>
                      <div className="border-t border-gray-200 dark:border-gray-600 pt-1 mt-1 font-medium flex justify-between">
                        <span>Points to Earn:</span>
                        <span>
                          {Math.floor((transactionForm.amount || 0) * 
                            getTierMultiplier(getCustomerById(selectedCustomerId)?.tier || 'Bronze'))} points
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => setIsAddingTransaction(false)}
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={addTransaction}
                className="btn btn-primary flex items-center space-x-2"
              >
                <ShoppingCart size={16} />
                <span>Add Transaction</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Reward Modal */}
      {isAddingReward && (
        <div className="modal-backdrop" onClick={() => setIsAddingReward(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Add New Reward</h3>
              <button 
                onClick={() => setIsAddingReward(false)}
                className="text-gray-400 hover:text-gray-500"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
            <div className="mt-4 space-y-4">
              <div className="form-group">
                <label className="form-label" htmlFor="rewardName">Reward Name</label>
                <input
                  type="text"
                  id="rewardName"
                  name="name"
                  value={rewardForm.name}
                  onChange={handleRewardFormChange}
                  className="input"
                  placeholder="e.g., 10% Discount"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="rewardDescription">Description</label>
                <textarea
                  id="rewardDescription"
                  name="description"
                  value={rewardForm.description}
                  onChange={handleRewardFormChange}
                  className="input h-24"
                  placeholder="Describe the reward..."
                  required
                ></textarea>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="rewardPoints">Points Cost</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Trophy size={16} className="text-yellow-500" />
                  </div>
                  <input
                    type="number"
                    id="rewardPoints"
                    name="pointsCost"
                    value={rewardForm.pointsCost || ''}
                    onChange={handleRewardFormChange}
                    className="input pl-10"
                    placeholder="500"
                    min="1"
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="rewardCategory">Category</label>
                <select
                  id="rewardCategory"
                  name="category"
                  value={rewardForm.category}
                  onChange={handleRewardFormChange}
                  className="input"
                  required
                >
                  <option value="Discount">Discount</option>
                  <option value="Product">Product</option>
                  <option value="Experience">Experience</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => setIsAddingReward(false)}
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={addReward}
                className="btn btn-primary flex items-center space-x-2"
              >
                <Plus size={16} />
                <span>Add Reward</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Reward Modal */}
      {isEditingReward && (
        <div className="modal-backdrop" onClick={() => setIsEditingReward(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Edit Reward</h3>
              <button 
                onClick={() => setIsEditingReward(false)}
                className="text-gray-400 hover:text-gray-500"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
            <div className="mt-4 space-y-4">
              <div className="form-group">
                <label className="form-label" htmlFor="editRewardName">Reward Name</label>
                <input
                  type="text"
                  id="editRewardName"
                  name="name"
                  value={rewardForm.name}
                  onChange={handleRewardFormChange}
                  className="input"
                  placeholder="e.g., 10% Discount"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="editRewardDescription">Description</label>
                <textarea
                  id="editRewardDescription"
                  name="description"
                  value={rewardForm.description}
                  onChange={handleRewardFormChange}
                  className="input h-24"
                  placeholder="Describe the reward..."
                  required
                ></textarea>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="editRewardPoints">Points Cost</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Trophy size={16} className="text-yellow-500" />
                  </div>
                  <input
                    type="number"
                    id="editRewardPoints"
                    name="pointsCost"
                    value={rewardForm.pointsCost || ''}
                    onChange={handleRewardFormChange}
                    className="input pl-10"
                    placeholder="500"
                    min="1"
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="editRewardCategory">Category</label>
                <select
                  id="editRewardCategory"
                  name="category"
                  value={rewardForm.category}
                  onChange={handleRewardFormChange}
                  className="input"
                  required
                >
                  <option value="Discount">Discount</option>
                  <option value="Product">Product</option>
                  <option value="Experience">Experience</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => setIsEditingReward(false)}
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={updateReward}
                className="btn btn-primary flex items-center space-x-2"
              >
                <Check size={16} />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Redeem Reward Modal */}
      {isRedeemingReward && (
        <div className="modal-backdrop" onClick={() => setIsRedeemingReward(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Redeem Reward</h3>
              <button 
                onClick={() => setIsRedeemingReward(false)}
                className="text-gray-400 hover:text-gray-500"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
            <div className="mt-4 space-y-4">
              <div className="form-group">
                <label className="form-label" htmlFor="redeemCustomer">Select Customer</label>
                <select
                  id="redeemCustomer"
                  value={selectedCustomerId || ''}
                  onChange={(e) => setSelectedCustomerId(e.target.value || null)}
                  className="input"
                  required
                >
                  <option value="">Select a customer</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} - {customer.points.toLocaleString()} points
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="redeemReward">Select Reward</label>
                <select
                  id="redeemReward"
                  value={selectedRewardId || ''}
                  onChange={(e) => setSelectedRewardId(e.target.value || null)}
                  className="input"
                  required
                >
                  <option value="">Select a reward</option>
                  {rewards.map(reward => (
                    <option key={reward.id} value={reward.id}>
                      {reward.name} - {reward.pointsCost.toLocaleString()} points
                    </option>
                  ))}
                </select>
              </div>

              {/* Redemption preview */}
              {selectedCustomerId && selectedRewardId && (
                <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-md">
                  <h4 className="font-medium mb-2 flex items-center">
                    <Tag size={16} className="text-blue-500 mr-2" />
                    Redemption Summary
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Customer:</span>
                      <span>{getCustomerById(selectedCustomerId)?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Available Points:</span>
                      <span>{getCustomerById(selectedCustomerId)?.points.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Selected Reward:</span>
                      <span>{getRewardById(selectedRewardId)?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Reward Cost:</span>
                      <span>{getRewardById(selectedRewardId)?.pointsCost.toLocaleString() || 0} points</span>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-600 pt-2 mt-2 font-medium flex justify-between">
                      <span>Remaining Points:</span>
                      <span>
                        {((getCustomerById(selectedCustomerId)?.points || 0) - 
                          (getRewardById(selectedRewardId)?.pointsCost || 0)).toLocaleString()}
                      </span>
                    </div>

                    {/* Warning if not enough points */}
                    {(getCustomerById(selectedCustomerId)?.points || 0) < 
                      (getRewardById(selectedRewardId)?.pointsCost || 0) && (
                      <div className="alert alert-error mt-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <p>Not enough points! Customer needs {((getRewardById(selectedRewardId)?.pointsCost || 0) - (getCustomerById(selectedCustomerId)?.points || 0)).toLocaleString()} more points.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                onClick={() => setIsRedeemingReward(false)}
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={redeemReward}
                className="btn btn-primary flex items-center space-x-2"
                disabled={!selectedCustomerId || !selectedRewardId || 
                  (getCustomerById(selectedCustomerId)?.points || 0) < (getRewardById(selectedRewardId)?.pointsCost || 0)}
              >
                <Gift size={16} />
                <span>Redeem</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;