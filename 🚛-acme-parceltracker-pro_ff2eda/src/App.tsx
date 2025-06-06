import React, { useState, useEffect, useMemo } from 'react';
import { 
  Package, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  MapPin, 
  Clock, 
  Calendar, 
  User, 
  Truck, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Loader, 
  Download, 
  Bell, 
  Eye,
  ArrowUp,
  ArrowDown,
  X,
  Settings,
  ChevronDown,
  ChevronUp,
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  Target,
  Activity
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import { useAuth } from './contexts/authContext';
import styles from './styles/styles.module.css';

// Types and Interfaces
type ParcelStatus = 'pending' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'delayed' | 'cancelled';
type ParcelPriority = 'low' | 'medium' | 'high' | 'critical';

interface Parcel {
  id: string;
  trackingNumber: string;
  status: ParcelStatus;
  currentLocation: string;
  estimatedDelivery: string;
  actualDelivery?: string;
  recipient: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
  sender: {
    name: string;
    address: string;
  };
  weight: number;
  dimensions: string;
  createdAt: string;
  updatedAt: string;
  statusHistory: {
    status: ParcelStatus;
    location: string;
    timestamp: string;
    notes?: string;
  }[];
  priority: ParcelPriority;
  serviceType: 'standard' | 'express' | 'overnight';
}

interface FilterOptions {
  status: ParcelStatus | 'all';
  priority: ParcelPriority | 'all';
  serviceType: 'all' | 'standard' | 'express' | 'overnight';
  dateRange: 'all' | 'today' | 'week' | 'month';
}

interface PrioritySettings {
  name: string;
  color: string;
}

type SortField = 'trackingNumber' | 'status' | 'estimatedDelivery' | 'createdAt' | 'priority';
type SortDirection = 'asc' | 'desc';

const App: React.FC = () => {
  const { currentUser, logout } = useAuth();
  
  // State Management
  const [activeTab, setActiveTab] = useState<'tracking' | 'dashboard'>('tracking');
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    status: 'all',
    priority: 'all',
    serviceType: 'all',
    dateRange: 'all'
  });
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingParcel, setEditingParcel] = useState<Parcel | null>(null);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('darkMode');
      return saved === 'true' || (saved === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  const [isHighContrast, setIsHighContrast] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('highContrast');
      return saved === 'true';
    }
    return false;
  });
  const [showThemeSettings, setShowThemeSettings] = useState<boolean>(false);
  const [criticalPrioritySettings, setCriticalPrioritySettings] = useState<PrioritySettings>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('criticalPrioritySettings');
      return saved ? JSON.parse(saved) : { name: 'Critical', color: 'from-red-500 to-orange-600' };
    }
    return { name: 'Critical', color: 'from-red-500 to-orange-600' };
  });

  // Clock update effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Sample Data with fourth priority
  const sampleParcels: Parcel[] = [
    {
      id: '1',
      trackingNumber: 'TRK001234567',
      status: 'in_transit',
      currentLocation: 'Distribution Center - New York',
      estimatedDelivery: '2025-01-25',
      recipient: {
        name: 'John Smith',
        address: '123 Main St, Boston, MA 02101',
        phone: '+1-555-0123',
        email: 'john.smith@email.com'
      },
      sender: {
        name: 'ABC Electronics',
        address: '456 Industrial Blvd, Newark, NJ 07102'
      },
      weight: 2.5,
      dimensions: '12x8x6 inches',
      createdAt: '2025-01-20T10:00:00Z',
      updatedAt: '2025-01-23T14:30:00Z',
      statusHistory: [
        { status: 'pending', location: 'Warehouse - Newark', timestamp: '2025-01-20T10:00:00Z', notes: 'Package received and processed' },
        { status: 'in_transit', location: 'Distribution Center - New York', timestamp: '2025-01-23T14:30:00Z', notes: 'In transit to destination' }
      ],
      priority: 'medium',
      serviceType: 'standard'
    },
    {
      id: '2',
      trackingNumber: 'TRK001234568',
      status: 'delivered',
      currentLocation: 'Delivered - Customer Address',
      estimatedDelivery: '2025-01-22',
      actualDelivery: '2025-01-22',
      recipient: {
        name: 'Sarah Johnson',
        address: '789 Oak Ave, Chicago, IL 60601',
        phone: '+1-555-0124',
        email: 'sarah.johnson@email.com'
      },
      sender: {
        name: 'Fashion Hub',
        address: '321 Fashion St, Los Angeles, CA 90210'
      },
      weight: 1.2,
      dimensions: '10x8x4 inches',
      createdAt: '2025-01-18T09:15:00Z',
      updatedAt: '2025-01-22T16:45:00Z',
      statusHistory: [
        { status: 'pending', location: 'Warehouse - Los Angeles', timestamp: '2025-01-18T09:15:00Z' },
        { status: 'in_transit', location: 'Hub - Denver', timestamp: '2025-01-20T12:00:00Z' },
        { status: 'out_for_delivery', location: 'Local Facility - Chicago', timestamp: '2025-01-22T08:00:00Z' },
        { status: 'delivered', location: 'Customer Address', timestamp: '2025-01-22T16:45:00Z', notes: 'Delivered to customer' }
      ],
      priority: 'high',
      serviceType: 'express'
    },
    {
      id: '3',
      trackingNumber: 'TRK001234569',
      status: 'delayed',
      currentLocation: 'Sorting Facility - Dallas',
      estimatedDelivery: '2025-01-24',
      recipient: {
        name: 'Mike Wilson',
        address: '456 Pine St, Houston, TX 77001',
        phone: '+1-555-0125',
        email: 'mike.wilson@email.com'
      },
      sender: {
        name: 'Tech Solutions Inc',
        address: '654 Tech Park, Austin, TX 78701'
      },
      weight: 5.8,
      dimensions: '16x12x10 inches',
      createdAt: '2025-01-19T11:30:00Z',
      updatedAt: '2025-01-24T09:15:00Z',
      statusHistory: [
        { status: 'pending', location: 'Warehouse - Austin', timestamp: '2025-01-19T11:30:00Z' },
        { status: 'in_transit', location: 'Hub - Dallas', timestamp: '2025-01-21T14:20:00Z' },
        { status: 'delayed', location: 'Sorting Facility - Dallas', timestamp: '2025-01-24T09:15:00Z', notes: 'Delayed due to weather conditions' }
      ],
      priority: 'critical',
      serviceType: 'overnight'
    },
    {
      id: '4',
      trackingNumber: 'TRK001234570',
      status: 'out_for_delivery',
      currentLocation: 'Local Facility - Miami',
      estimatedDelivery: '2025-01-23',
      recipient: {
        name: 'Lisa Brown',
        address: '789 Beach Blvd, Miami, FL 33101',
        phone: '+1-555-0126',
        email: 'lisa.brown@email.com'
      },
      sender: {
        name: 'Medical Supplies Co',
        address: '321 Health St, Orlando, FL 32801'
      },
      weight: 0.8,
      dimensions: '8x6x4 inches',
      createdAt: '2025-01-21T08:00:00Z',
      updatedAt: '2025-01-23T11:20:00Z',
      statusHistory: [
        { status: 'pending', location: 'Warehouse - Orlando', timestamp: '2025-01-21T08:00:00Z' },
        { status: 'in_transit', location: 'Hub - Tampa', timestamp: '2025-01-22T14:00:00Z' },
        { status: 'out_for_delivery', location: 'Local Facility - Miami', timestamp: '2025-01-23T11:20:00Z', notes: 'Out for delivery' }
      ],
      priority: 'critical',
      serviceType: 'overnight'
    },
    {
      id: '5',
      trackingNumber: 'TRK001234571',
      status: 'pending',
      currentLocation: 'Warehouse - Seattle',
      estimatedDelivery: '2025-01-27',
      recipient: {
        name: 'David Kim',
        address: '456 Tech Ave, San Francisco, CA 94102',
        phone: '+1-555-0127',
        email: 'david.kim@email.com'
      },
      sender: {
        name: 'Books & More',
        address: '123 Library St, Portland, OR 97201'
      },
      weight: 1.5,
      dimensions: '10x7x3 inches',
      createdAt: '2025-01-22T16:00:00Z',
      updatedAt: '2025-01-22T16:00:00Z',
      statusHistory: [
        { status: 'pending', location: 'Warehouse - Seattle', timestamp: '2025-01-22T16:00:00Z', notes: 'Package received and pending processing' }
      ],
      priority: 'low',
      serviceType: 'standard'
    }
  ];

  // Initialize data and theme modes
  useEffect(() => {
    const storedParcels = localStorage.getItem('parcels');
    if (storedParcels) {
      try {
        setParcels(JSON.parse(storedParcels));
      } catch {
        setParcels(sampleParcels);
        localStorage.setItem('parcels', JSON.stringify(sampleParcels));
      }
    } else {
      setParcels(sampleParcels);
      localStorage.setItem('parcels', JSON.stringify(sampleParcels));
    }
  }, []);

  useEffect(() => {
    const classList = document.documentElement.classList;
    
    // Clear all theme classes first
    classList.remove('dark', 'high-contrast');
    
    if (isDarkMode) {
      classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      localStorage.setItem('darkMode', 'false');
    }
    
    if (isHighContrast) {
      classList.add('high-contrast');
      localStorage.setItem('highContrast', 'true');
    } else {
      localStorage.setItem('highContrast', 'false');
    }
  }, [isDarkMode, isHighContrast]);

  // Save critical priority settings to localStorage
  useEffect(() => {
    localStorage.setItem('criticalPrioritySettings', JSON.stringify(criticalPrioritySettings));
  }, [criticalPrioritySettings]);

  // Check for delayed parcels and create notifications
  useEffect(() => {
    const checkDelayedParcels = () => {
      const today = new Date();
      const delayedParcels = parcels.filter(parcel => {
        if (parcel.status === 'delivered' || parcel.status === 'cancelled') return false;
        const estimatedDate = new Date(parcel.estimatedDelivery);
        return estimatedDate < today && parcel.status !== 'delayed';
      });

      if (delayedParcels.length > 0) {
        const newNotifications = delayedParcels.map(parcel => 
          `Parcel ${parcel.trackingNumber} is delayed beyond estimated delivery date`
        );
        setNotifications(prev => [...new Set([...prev, ...newNotifications])]);
        
        // Auto-update status to delayed
        const updatedParcels = parcels.map(parcel => {
          if (delayedParcels.some(delayed => delayed.id === parcel.id)) {
            return {
              ...parcel,
              status: 'delayed' as ParcelStatus,
              updatedAt: new Date().toISOString(),
              statusHistory: [
                ...parcel.statusHistory,
                {
                  status: 'delayed' as ParcelStatus,
                  location: parcel.currentLocation,
                  timestamp: new Date().toISOString(),
                  notes: 'Automatically marked as delayed due to exceeded delivery date'
                }
              ]
            };
          }
          return parcel;
        });
        setParcels(updatedParcels);
        localStorage.setItem('parcels', JSON.stringify(updatedParcels));
      }
    };

    const interval = setInterval(checkDelayedParcels, 60000); // Check every minute
    checkDelayedParcels(); // Initial check
    return () => clearInterval(interval);
  }, [parcels]);

  // Keyboard event handlers
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeAllModals();
        setShowThemeSettings(false);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.theme-settings-dropdown')) {
        setShowThemeSettings(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Utility Functions
  const closeAllModals = () => {
    setIsModalOpen(false);
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedParcel(null);
    setEditingParcel(null);
    document.body.classList.remove('modal-open');
  };

  const openModal = (parcel: Parcel) => {
    setSelectedParcel(parcel);
    setIsModalOpen(true);
    document.body.classList.add('modal-open');
  };

  const openAddModal = () => {
    setIsAddModalOpen(true);
    document.body.classList.add('modal-open');
  };

  const openEditModal = (parcel: Parcel) => {
    setEditingParcel(parcel);
    setIsEditModalOpen(true);
    document.body.classList.add('modal-open');
  };

  const generateTrackingNumber = (): string => {
    return 'TRK' + Date.now().toString().slice(-9);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string): string => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const formatDateOnly = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: ParcelStatus): string => {
    if (isHighContrast) {
      const highContrastColors = {
        pending: 'bg-yellow-400 text-black border-2 border-black',
        in_transit: 'bg-cyan-400 text-black border-2 border-black',
        out_for_delivery: 'bg-purple-400 text-black border-2 border-black',
        delivered: 'bg-green-400 text-black border-2 border-black',
        delayed: 'bg-red-500 text-white border-2 border-white',
        cancelled: 'bg-gray-500 text-white border-2 border-white'
      };
      return highContrastColors[status] || highContrastColors.pending;
    }
    
    const colors = {
      pending: 'bg-amber-100 text-amber-800 border border-amber-300',
      in_transit: 'bg-blue-100 text-blue-800 border border-blue-300',
      out_for_delivery: 'bg-indigo-100 text-indigo-800 border border-indigo-300',
      delivered: 'bg-green-100 text-green-800 border border-green-300',
      delayed: 'bg-red-100 text-red-800 border border-red-300',
      cancelled: 'bg-gray-100 text-gray-800 border border-gray-300'
    };
    return colors[status] || colors.pending;
  };

  const getStatusIcon = (status: ParcelStatus) => {
    const iconClass = isHighContrast ? 'w-4 h-4' : 'w-4 h-4';
    switch (status) {
      case 'pending': return <Clock className={iconClass} />;
      case 'in_transit': return <Truck className={iconClass} />;
      case 'out_for_delivery': return <MapPin className={iconClass} />;
      case 'delivered': return <CheckCircle className={iconClass} />;
      case 'delayed': return <AlertTriangle className={iconClass} />;
      case 'cancelled': return <XCircle className={iconClass} />;
      default: return <Package className={iconClass} />;
    }
  };

  const getPriorityColor = (priority: ParcelPriority): string => {
    if (isHighContrast) {
      const highContrastColors = {
        low: 'bg-gray-400 text-black border-2 border-black',
        medium: 'bg-yellow-400 text-black border-2 border-black',
        high: 'bg-red-500 text-white border-2 border-white',
        critical: 'bg-red-600 text-white border-2 border-white'
      };
      return highContrastColors[priority] || highContrastColors.low;
    }
    
    const colors = {
      low: 'bg-gray-100 text-gray-700 border border-gray-300',
      medium: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
      high: 'bg-orange-100 text-orange-800 border border-orange-300',
      critical: 'bg-red-100 text-red-800 border border-red-300'
    };
    return colors[priority] || colors.low;
  };

  const getPriorityLabel = (priority: ParcelPriority): string => {
    const labels = {
      low: 'Low',
      medium: 'Medium', 
      high: 'High',
      critical: criticalPrioritySettings.name
    };
    return labels[priority] || labels.low;
  };

  // Filter and Sort Logic
  const filteredAndSortedParcels = useMemo(() => {
    let filtered = parcels.filter(parcel => {
      const matchesSearch = 
        parcel.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        parcel.recipient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        parcel.currentLocation.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = filterOptions.status === 'all' || parcel.status === filterOptions.status;
      const matchesPriority = filterOptions.priority === 'all' || parcel.priority === filterOptions.priority;
      const matchesServiceType = filterOptions.serviceType === 'all' || parcel.serviceType === filterOptions.serviceType;

      let matchesDateRange = true;
      if (filterOptions.dateRange !== 'all') {
        const createdDate = new Date(parcel.createdAt);
        const now = new Date();
        const daysDiff = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
        
        switch (filterOptions.dateRange) {
          case 'today':
            matchesDateRange = daysDiff === 0;
            break;
          case 'week':
            matchesDateRange = daysDiff <= 7;
            break;
          case 'month':
            matchesDateRange = daysDiff <= 30;
            break;
        }
      }

      return matchesSearch && matchesStatus && matchesPriority && matchesServiceType && matchesDateRange;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortField) {
        case 'trackingNumber':
          aValue = a.trackingNumber;
          bValue = b.trackingNumber;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'estimatedDelivery':
          aValue = new Date(a.estimatedDelivery);
          bValue = new Date(b.estimatedDelivery);
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case 'priority':
          const priorityOrder = { low: 1, medium: 2, high: 3, critical: 4 };
          aValue = priorityOrder[a.priority];
          bValue = priorityOrder[b.priority];
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [parcels, searchTerm, filterOptions, sortField, sortDirection]);

  // Statistics
  const stats = useMemo(() => {
    const total = parcels.length;
    const delivered = parcels.filter(p => p.status === 'delivered').length;
    const inTransit = parcels.filter(p => p.status === 'in_transit').length;
    const delayed = parcels.filter(p => p.status === 'delayed').length;
    const pending = parcels.filter(p => p.status === 'pending').length;
    const outForDelivery = parcels.filter(p => p.status === 'out_for_delivery').length;
    
    // Calculate average delivery time
    const deliveredParcels = parcels.filter(p => p.status === 'delivered' && p.actualDelivery);
    const avgDeliveryTime = deliveredParcels.length > 0 ? 
      deliveredParcels.reduce((acc, parcel) => {
        const created = new Date(parcel.createdAt);
        const delivered = new Date(parcel.actualDelivery!);
        return acc + (delivered.getTime() - created.getTime());
      }, 0) / deliveredParcels.length / (1000 * 60 * 60 * 24) : 0;
    
    return { total, delivered, inTransit, delayed, pending, outForDelivery, avgDeliveryTime };
  }, [parcels]);

  // Dashboard Analytics Data
  const dashboardData = useMemo(() => {
    // Status distribution for pie chart
    const statusData = [
      { name: 'Delivered', value: stats.delivered, color: '#10B981' },
      { name: 'In Transit', value: stats.inTransit, color: '#3B82F6' },
      { name: 'Out for Delivery', value: stats.outForDelivery, color: '#8B5CF6' },
      { name: 'Pending', value: stats.pending, color: '#F59E0B' },
      { name: 'Delayed', value: stats.delayed, color: '#EF4444' }
    ].filter(item => item.value > 0);

    // Priority distribution
    const priorityData = [
      { name: 'Low', value: parcels.filter(p => p.priority === 'low').length, color: '#6B7280' },
      { name: 'Medium', value: parcels.filter(p => p.priority === 'medium').length, color: '#F59E0B' },
      { name: 'High', value: parcels.filter(p => p.priority === 'high').length, color: '#EF4444' },
      { name: criticalPrioritySettings.name, value: parcels.filter(p => p.priority === 'critical').length, color: '#DC2626' }
    ].filter(item => item.value > 0);

    // Daily delivery trend (last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    const deliveryTrendData = last7Days.map(date => {
      const deliveredCount = parcels.filter(p => 
        p.actualDelivery && p.actualDelivery.startsWith(date)
      ).length;
      const createdCount = parcels.filter(p => 
        p.createdAt.startsWith(date)
      ).length;
      
      return {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        delivered: deliveredCount,
        created: createdCount
      };
    });

    // Service type performance
    const serviceTypeData = [
      {
        type: 'Standard',
        parcels: parcels.filter(p => p.serviceType === 'standard').length,
        delivered: parcels.filter(p => p.serviceType === 'standard' && p.status === 'delivered').length
      },
      {
        type: 'Express',
        parcels: parcels.filter(p => p.serviceType === 'express').length,
        delivered: parcels.filter(p => p.serviceType === 'express' && p.status === 'delivered').length
      },
      {
        type: 'Overnight',
        parcels: parcels.filter(p => p.serviceType === 'overnight').length,
        delivered: parcels.filter(p => p.serviceType === 'overnight' && p.status === 'delivered').length
      }
    ].map(item => ({
      ...item,
      deliveryRate: item.parcels > 0 ? Math.round((item.delivered / item.parcels) * 100) : 0
    }));

    return { statusData, priorityData, deliveryTrendData, serviceTypeData };
  }, [parcels, stats, criticalPrioritySettings.name]);

  // CRUD Operations
  const addParcel = (parcelData: Omit<Parcel, 'id' | 'trackingNumber' | 'createdAt' | 'updatedAt' | 'statusHistory'>) => {
    const newParcel: Parcel = {
      ...parcelData,
      id: Date.now().toString(),
      trackingNumber: generateTrackingNumber(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      statusHistory: [{
        status: parcelData.status,
        location: parcelData.currentLocation,
        timestamp: new Date().toISOString(),
        notes: 'Parcel created'
      }]
    };
    
    const updatedParcels = [...parcels, newParcel];
    setParcels(updatedParcels);
    localStorage.setItem('parcels', JSON.stringify(updatedParcels));
    closeAllModals();
  };

  const updateParcel = (id: string, updates: Partial<Parcel>) => {
    const updatedParcels = parcels.map(parcel => {
      if (parcel.id === id) {
        const updatedParcel = { ...parcel, ...updates, updatedAt: new Date().toISOString() };
        
        // Add status history if status changed
        if (updates.status && updates.status !== parcel.status) {
          updatedParcel.statusHistory = [
            ...parcel.statusHistory,
            {
              status: updates.status,
              location: updates.currentLocation || parcel.currentLocation,
              timestamp: new Date().toISOString(),
              notes: `Status updated to ${updates.status}`
            }
          ];
        }
        
        return updatedParcel;
      }
      return parcel;
    });
    
    setParcels(updatedParcels);
    localStorage.setItem('parcels', JSON.stringify(updatedParcels));
    closeAllModals();
  };

  const deleteParcel = (id: string) => {
    const updatedParcels = parcels.filter(parcel => parcel.id !== id);
    setParcels(updatedParcels);
    localStorage.setItem('parcels', JSON.stringify(updatedParcels));
    closeAllModals();
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const clearNotification = (index: number) => {
    setNotifications(prev => prev.filter((_, i) => i !== index));
  };

  const exportToCSV = () => {
    const headers = ['Tracking Number', 'Status', 'Current Location', 'Estimated Delivery', 'Recipient Name', 'Recipient Address', 'Priority', 'Service Type'];
    const csvContent = [
      headers.join(','),
      ...filteredAndSortedParcels.map(parcel => [
        parcel.trackingNumber,
        parcel.status,
        `"${parcel.currentLocation}"`,
        parcel.estimatedDelivery,
        `"${parcel.recipient.name}"`,
        `"${parcel.recipient.address}"`,
        parcel.priority,
        parcel.serviceType
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `parcels_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div id="welcome_fallback" className={`min-h-screen transition-all duration-300 ${
      isHighContrast 
        ? 'bg-black text-white' 
        : 'bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white'
    }`}>
      {/* Header */}
      <header className={`shadow-lg border-b transition-all duration-300 ${
        isHighContrast 
          ? 'bg-black border-white' 
          : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700'
      }`}>
        <div className="container-wide py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${
                isHighContrast 
                  ? 'bg-white' 
                  : 'bg-blue-600 dark:bg-blue-500'
              }`}>
                <Package className={`w-8 h-8 ${
                  isHighContrast ? 'text-black' : 'text-white'
                }`} />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${
                  isHighContrast ? 'text-white' : 'text-gray-900 dark:text-white'
                }`}>ACME ParcelTracker Pro</h1>
                <p className={`text-sm ${
                  isHighContrast ? 'text-gray-300' : 'text-gray-600 dark:text-slate-400'
                }`}>Professional Logistics Management System</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Digital Clock */}
              <div className={`px-4 py-2 rounded-lg border ${
                isHighContrast 
                  ? 'bg-white text-black border-white' 
                  : 'bg-gray-100 dark:bg-slate-700 border-gray-200 dark:border-slate-600'
              }`}>
                <div className="text-right">
                  <div className={`text-lg font-mono font-semibold ${
                    isHighContrast ? 'text-black' : 'text-gray-900 dark:text-white'
                  }`}>
                    {formatTime(currentTime)}
                  </div>
                  <div className={`text-xs ${
                    isHighContrast ? 'text-gray-600' : 'text-gray-500 dark:text-slate-400'
                  }`}>
                    {formatDateOnly(currentTime)}
                  </div>
                </div>
              </div>

              {/* User Info */}
              {currentUser && (
                <div className={`flex items-center gap-3 px-4 py-2 rounded-lg ${
                  isHighContrast 
                    ? 'bg-white text-black' 
                    : 'bg-gray-100 dark:bg-slate-700'
                }`}>
                  <div className={`p-2 rounded-full ${
                    isHighContrast ? 'bg-gray-200' : 'bg-blue-100 dark:bg-blue-900'
                  }`}>
                    <User className={`w-4 h-4 ${
                      isHighContrast ? 'text-gray-600' : 'text-blue-600 dark:text-blue-400'
                    }`} />
                  </div>
                  <div className="text-sm">
                    <div className="font-medium">{currentUser.first_name} {currentUser.last_name}</div>
                    <div className={`text-xs ${
                      isHighContrast ? 'text-gray-600' : 'text-gray-500 dark:text-slate-400'
                    }`}>{currentUser.role}</div>
                  </div>
                </div>
              )}

              {/* Notifications */}
              {notifications.length > 0 && (
                <div className="relative">
                  <div className={`p-2 rounded-lg ${
                    isHighContrast 
                      ? 'bg-red-500' 
                      : 'bg-red-100 dark:bg-red-900'
                  }`}>
                    <Bell className={`w-5 h-5 ${
                      isHighContrast ? 'text-white' : 'text-red-600 dark:text-red-400'
                    }`} />
                  </div>
                  <span className={`absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center text-xs font-bold rounded-full ${
                    isHighContrast 
                      ? 'bg-yellow-400 text-black border-2 border-white' 
                      : 'bg-red-500 text-white'
                  }`}>
                    {notifications.length}
                  </span>
                </div>
              )}
              
              {/* Theme Settings Dropdown */}
              <div className="relative theme-settings-dropdown">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowThemeSettings(!showThemeSettings);
                  }}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    isHighContrast 
                      ? 'bg-white text-black hover:bg-gray-300 border-2 border-white' 
                      : 'bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600'
                  }`}
                  aria-label="Theme settings"
                >
                  <Settings className="w-5 h-5" />
                </button>
                
                {showThemeSettings && (
                  <div className={`absolute right-0 mt-2 w-72 rounded-lg shadow-xl z-50 border overflow-hidden ${
                    isHighContrast 
                      ? 'bg-black border-white' 
                      : 'bg-white border-gray-200 dark:bg-slate-800 dark:border-slate-600'
                  }`}>
                    <div className="p-6 space-y-6">
                      <h3 className={`font-bold text-lg flex items-center gap-2 ${
                        isHighContrast ? 'text-white' : 'text-gray-900 dark:text-white'
                      }`}>
                        <Settings className="w-5 h-5" />
                        Display Settings
                      </h3>
                      
                      {/* Critical Priority Settings */}
                      <div className="space-y-2">
                        <label className={`text-sm font-medium ${
                          isHighContrast ? 'text-white' : 'text-gray-700 dark:text-slate-300'
                        }`}>Critical Priority Name</label>
                        <input
                          type="text"
                          value={criticalPrioritySettings.name}
                          onChange={(e) => setCriticalPrioritySettings(prev => ({ ...prev, name: e.target.value }))}
                          className={`w-full px-3 py-2 rounded-lg text-sm border ${
                            isHighContrast 
                              ? 'bg-white text-black border-2 border-black' 
                              : 'border-gray-300 dark:bg-slate-700 dark:border-slate-600 dark:text-white'
                          }`}
                        />
                      </div>
                      
                      {/* Dark Mode Toggle */}
                      <div className="flex items-center justify-between">
                        <div>
                          <span className={`text-sm font-medium ${
                            isHighContrast ? 'text-white' : 'text-gray-700 dark:text-slate-300'
                          }`}>Dark Mode</span>
                          <div className={`text-xs mt-1 ${
                            isHighContrast ? 'text-gray-300' : 'text-gray-500 dark:text-slate-400'
                          }`}>Switch to dark theme</div>
                        </div>
                        <button
                          onClick={() => setIsDarkMode(!isDarkMode)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                            isDarkMode 
                              ? (isHighContrast ? 'bg-white' : 'bg-blue-600') 
                              : (isHighContrast ? 'bg-gray-600' : 'bg-gray-300')
                          }`}
                          aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full transition-all duration-300 ${
                            isDarkMode 
                              ? (isHighContrast ? 'translate-x-6 bg-black' : 'translate-x-6 bg-white') 
                              : (isHighContrast ? 'translate-x-1 bg-white' : 'translate-x-1 bg-white')
                          }`} />
                        </button>
                      </div>
                      
                      {/* High Contrast Toggle */}
                      <div className="flex items-center justify-between">
                        <div>
                          <span className={`text-sm font-medium ${
                            isHighContrast ? 'text-white' : 'text-gray-700 dark:text-slate-300'
                          }`}>High Contrast</span>
                          <div className={`text-xs mt-1 ${
                            isHighContrast ? 'text-gray-300' : 'text-gray-500 dark:text-slate-400'
                          }`}>Enhanced visibility</div>
                        </div>
                        <button
                          onClick={() => setIsHighContrast(!isHighContrast)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-300 border ${
                            isHighContrast 
                              ? 'bg-white border-white' 
                              : 'bg-yellow-500 border-yellow-500'
                          }`}
                          aria-label={isHighContrast ? 'Disable high contrast' : 'Enable high contrast'}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full transition-all duration-300 ${
                            isHighContrast 
                              ? 'translate-x-6 bg-black' 
                              : 'translate-x-1 bg-white'
                          }`} />
                        </button>
                      </div>

                      {/* Logout Button */}
                      <div className="pt-4 border-t border-gray-200 dark:border-slate-600">
                        <button
                          onClick={logout}
                          className={`w-full px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                            isHighContrast 
                              ? 'bg-red-500 text-white hover:bg-red-600' 
                              : 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800'
                          }`}
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="container-wide py-4">
          {notifications.map((notification, index) => (
            <div key={index} className={`flex items-center gap-3 p-4 rounded-lg mb-3 transition-all duration-300 ${
              isHighContrast 
                ? 'bg-yellow-400 text-black border-2 border-black' 
                : 'bg-yellow-50 text-yellow-800 border border-yellow-200'
            }`}>
              <AlertTriangle className="w-5 h-5" />
              <p className="flex-1 font-medium">{notification}</p>
              <button
                onClick={() => clearNotification(index)}
                className={`p-1 rounded-lg transition-all duration-300 ${
                  isHighContrast 
                    ? 'text-black hover:bg-gray-200' 
                    : 'text-yellow-600 hover:bg-yellow-100'
                }`}
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="container-wide py-4">
        <div className={`flex gap-1 p-1 rounded-lg ${
          isHighContrast 
            ? 'bg-white border-2 border-black' 
            : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700'
        }`}>
          <button
            id="tracking-tab"
            onClick={() => setActiveTab('tracking')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
              activeTab === 'tracking'
                ? (isHighContrast 
                    ? 'bg-blue-400 text-black border-2 border-black' 
                    : 'bg-blue-600 text-white')
                : (isHighContrast 
                    ? 'text-black hover:bg-gray-200' 
                    : 'text-gray-600 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-700')
            }`}
          >
            <Package className="w-4 h-4" />
            Tracking
          </button>
          <button
            id="dashboard-tab"
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
              activeTab === 'dashboard'
                ? (isHighContrast 
                    ? 'bg-blue-400 text-black border-2 border-black' 
                    : 'bg-blue-600 text-white')
                : (isHighContrast 
                    ? 'text-black hover:bg-gray-200' 
                    : 'text-gray-600 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-700')
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Dashboard
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'tracking' ? (
        <div id="generation_issue_fallback" className="container-wide py-4">
          {/* Stats Dashboard */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {[
              { title: 'Total Parcels', value: stats.total, color: 'blue', icon: Package },
              { title: 'Delivered', value: stats.delivered, color: 'green', icon: CheckCircle },
              { title: 'In Transit', value: stats.inTransit, color: 'blue', icon: Truck },
              { title: 'Delayed', value: stats.delayed, color: 'red', icon: AlertTriangle },
              { title: 'Pending', value: stats.pending, color: 'yellow', icon: Clock }
            ].map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className={`p-4 rounded-lg transition-all duration-300 ${
                  isHighContrast 
                    ? 'bg-white text-black border-4 border-black' 
                    : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 rounded-lg ${
                      isHighContrast 
                        ? 'bg-gray-200' 
                        : stat.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900' :
                          stat.color === 'green' ? 'bg-green-100 dark:bg-green-900' :
                          stat.color === 'red' ? 'bg-red-100 dark:bg-red-900' :
                          'bg-yellow-100 dark:bg-yellow-900'
                    }`}>
                      <IconComponent className={`w-4 h-4 ${
                        isHighContrast ? 'text-gray-700' : 
                        stat.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                        stat.color === 'green' ? 'text-green-600 dark:text-green-400' :
                        stat.color === 'red' ? 'text-red-600 dark:text-red-400' :
                        'text-yellow-600 dark:text-yellow-400'
                      }`} />
                    </div>
                  </div>
                  <div className={`text-xs font-medium mb-1 ${
                    isHighContrast ? 'text-gray-700' : 'text-gray-600 dark:text-slate-400'
                  }`}>{stat.title}</div>
                  <div className={`text-2xl font-bold ${
                    isHighContrast ? 'text-black' : 'text-gray-900 dark:text-white'
                  }`}>{stat.value}</div>
                </div>
              );
            })}
          </div>

          {/* Controls */}
          <div className={`p-6 rounded-lg mb-8 transition-all duration-300 ${
            isHighContrast 
              ? 'bg-white text-black border-4 border-black' 
              : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700'
          }`}>
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <div className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                  isHighContrast ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Search by tracking number, recipient, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`block w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                    isHighContrast 
                      ? 'bg-white text-black border-4 border-black focus:border-blue-500' 
                      : 'border border-gray-300 dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:border-blue-500'
                  }`}
                />
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center gap-2 ${
                    isHighContrast 
                      ? 'bg-gray-200 text-black border-2 border-black hover:bg-gray-300 focus:ring-blue-500' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 focus:ring-blue-500'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  Filters
                  {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                <button
                  onClick={exportToCSV}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center gap-2 ${
                    isHighContrast 
                      ? 'bg-green-400 text-black border-2 border-black hover:bg-green-300 focus:ring-green-500' 
                      : 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
                  }`}
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
                <button
                  onClick={openAddModal}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center gap-2 ${
                    isHighContrast 
                      ? 'bg-blue-400 text-black border-2 border-black hover:bg-blue-300 focus:ring-blue-500' 
                      : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  Add Parcel
                </button>
              </div>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <div className={`mt-6 pt-6 border-t transition-all duration-300 ${
                isHighContrast ? 'border-black' : 'border-gray-200 dark:border-slate-600'
              }`}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Status', value: filterOptions.status, options: [
                      { value: 'all', label: 'All Statuses' },
                      { value: 'pending', label: 'Pending' },
                      { value: 'in_transit', label: 'In Transit' },
                      { value: 'out_for_delivery', label: 'Out for Delivery' },
                      { value: 'delivered', label: 'Delivered' },
                      { value: 'delayed', label: 'Delayed' },
                      { value: 'cancelled', label: 'Cancelled' }
                    ], onChange: (value: string) => setFilterOptions(prev => ({ ...prev, status: value as FilterOptions['status'] })) },
                    { label: 'Priority', value: filterOptions.priority, options: [
                      { value: 'all', label: 'All Priorities' },
                      { value: 'low', label: 'Low' },
                      { value: 'medium', label: 'Medium' },
                      { value: 'high', label: 'High' },
                      { value: 'critical', label: criticalPrioritySettings.name }
                    ], onChange: (value: string) => setFilterOptions(prev => ({ ...prev, priority: value as FilterOptions['priority'] })) },
                    { label: 'Service Type', value: filterOptions.serviceType, options: [
                      { value: 'all', label: 'All Service Types' },
                      { value: 'standard', label: 'Standard' },
                      { value: 'express', label: 'Express' },
                      { value: 'overnight', label: 'Overnight' }
                    ], onChange: (value: string) => setFilterOptions(prev => ({ ...prev, serviceType: value as FilterOptions['serviceType'] })) },
                    { label: 'Date Range', value: filterOptions.dateRange, options: [
                      { value: 'all', label: 'All Time' },
                      { value: 'today', label: 'Today' },
                      { value: 'week', label: 'Last 7 Days' },
                      { value: 'month', label: 'Last 30 Days' }
                    ], onChange: (value: string) => setFilterOptions(prev => ({ ...prev, dateRange: value as FilterOptions['dateRange'] })) }
                  ].map((filter, index) => (
                    <div key={index}>
                      <label className={`block text-sm font-medium mb-1 ${
                        isHighContrast ? 'text-black' : 'text-gray-700 dark:text-slate-300'
                      }`}>{filter.label}</label>
                      <select
                        value={filter.value}
                        onChange={(e) => filter.onChange(e.target.value)}
                        className={`block w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 text-sm ${
                          isHighContrast 
                            ? 'bg-white text-black border-2 border-black focus:border-blue-500' 
                            : 'border border-gray-300 dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:border-blue-500'
                        }`}
                      >
                        {filter.options.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Parcels Table */}
          <div className={`rounded-lg transition-all duration-300 overflow-hidden ${
            isHighContrast 
              ? 'bg-white border-4 border-black' 
              : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700'
          }`}>
            <div className="overflow-x-auto">
              <table className={`min-w-full divide-y transition-all duration-300 ${
                isHighContrast 
                  ? 'divide-black' 
                  : 'divide-gray-200 dark:divide-slate-700'
              }`}>
                <thead>
                  <tr>
                    {[
                      { field: 'trackingNumber', label: 'Tracking Number', sortable: true },
                      { field: 'status', label: 'Status', sortable: true },
                      { field: null, label: 'Current Location', sortable: false },
                      { field: 'estimatedDelivery', label: 'Est. Delivery', sortable: true },
                      { field: null, label: 'Recipient', sortable: false },
                      { field: 'priority', label: 'Priority', sortable: true },
                      { field: null, label: 'Actions', sortable: false }
                    ].map((header, index) => (
                      <th key={index} className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-all duration-300 ${
                        header.sortable ? 'cursor-pointer hover:bg-opacity-70' : ''
                      } ${
                        isHighContrast 
                          ? 'bg-gray-200 text-black border-b-4 border-black' 
                          : 'bg-gray-50 text-gray-500 dark:bg-slate-700 dark:text-slate-300'
                      }`} onClick={header.sortable ? () => handleSort(header.field as SortField) : undefined}>
                        <div className="flex items-center gap-2">
                          {header.label}
                          {header.sortable && sortField === header.field && (
                            <div className={`p-1 rounded ${
                              isHighContrast ? 'bg-white' : 'bg-white bg-opacity-20'
                            }`}>
                              {sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                            </div>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className={`divide-y transition-all duration-300 ${
                  isHighContrast 
                    ? 'bg-white divide-black' 
                    : 'bg-white divide-gray-200 dark:bg-slate-800 dark:divide-slate-700'
                }`}>
                  {filteredAndSortedParcels.length === 0 ? (
                    <tr>
                      <td colSpan={7} className={`px-6 py-12 whitespace-nowrap text-center ${
                        isHighContrast ? 'text-gray-600' : 'text-gray-500 dark:text-slate-400'
                      }`}>
                        <div className="flex flex-col items-center gap-3">
                          <Package className="w-12 h-12 text-gray-300" />
                          <div>
                            <div className="font-medium">No parcels found</div>
                            <div className="text-sm">Try adjusting your search or filter criteria</div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredAndSortedParcels.map((parcel) => (
                      <tr key={parcel.id} className={`transition-all duration-300 ${
                        isHighContrast 
                          ? 'hover:bg-gray-100' 
                          : 'hover:bg-gray-50 dark:hover:bg-slate-700'
                      }`}>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                          isHighContrast ? 'text-blue-600' : 'text-blue-600 dark:text-blue-400'
                        }`}>
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4" />
                            {parcel.trackingNumber}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(parcel.status)}`}>
                            {getStatusIcon(parcel.status)}
                            {parcel.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                          isHighContrast ? 'text-black' : 'text-gray-900 dark:text-slate-200'
                        }`}>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            {parcel.currentLocation}
                          </div>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                          isHighContrast ? 'text-black' : 'text-gray-900 dark:text-slate-200'
                        }`}>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {formatDate(parcel.estimatedDelivery)}
                          </div>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                          isHighContrast ? 'text-black' : 'text-gray-900 dark:text-slate-200'
                        }`}>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <div>
                              <div className="font-medium">{parcel.recipient.name}</div>
                              <div className={`text-xs truncate max-w-xs ${
                                isHighContrast ? 'text-gray-600' : 'text-gray-500 dark:text-slate-400'
                              }`}>
                                {parcel.recipient.address}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(parcel.priority)}`}>
                            {getPriorityLabel(parcel.priority)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-2">
                            {[
                              { onClick: () => openModal(parcel), color: 'blue', icon: Eye, label: 'View details' },
                              { onClick: () => openEditModal(parcel), color: 'yellow', icon: Edit, label: 'Edit parcel' },
                              { onClick: () => deleteParcel(parcel.id), color: 'red', icon: Trash2, label: 'Delete parcel' }
                            ].map((action, index) => {
                              const IconComponent = action.icon;
                              return (
                                <button
                                  key={index}
                                  onClick={action.onClick}
                                  className={`p-2 text-sm rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                    isHighContrast 
                                      ? index === 0 ? 'bg-blue-400 text-black border-2 border-black hover:bg-blue-300 focus:ring-blue-500' :
                                        index === 1 ? 'bg-gray-300 text-black border-2 border-black hover:bg-gray-200 focus:ring-gray-500' :
                                        'bg-red-400 text-black border-2 border-black hover:bg-red-300 focus:ring-red-500'
                                      : action.color === 'blue' ? 'bg-blue-100 text-blue-600 hover:bg-blue-200 focus:ring-blue-500' :
                                        action.color === 'yellow' ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200 focus:ring-yellow-500' :
                                        'bg-red-100 text-red-600 hover:bg-red-200 focus:ring-red-500'
                                  }`}
                                  aria-label={`${action.label} for parcel ${parcel.trackingNumber}`}
                                >
                                  <IconComponent className="w-4 h-4" />
                                </button>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Dashboard Tab */
        <div className="container-wide py-4">
          {/* Enhanced Stats Dashboard */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            {[
              { title: 'Total Parcels', value: stats.total, color: 'blue', icon: Package, trend: '+12%' },
              { title: 'Delivered', value: stats.delivered, color: 'green', icon: CheckCircle, trend: '+8%' },
              { title: 'Avg Delivery Time', value: `${stats.avgDeliveryTime.toFixed(1)} days`, color: 'blue', icon: Clock, trend: '-2%' },
              { title: 'Delayed', value: stats.delayed, color: 'red', icon: AlertTriangle, trend: '-15%' }
            ].map((stat, index) => {
              const IconComponent = stat.icon;
              const isPositiveTrend = stat.trend.startsWith('+') || stat.trend.startsWith('-2%');
              return (
                <div key={index} className={`p-6 rounded-lg transition-all duration-300 ${
                  isHighContrast 
                    ? 'bg-white text-black border-4 border-black' 
                    : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-3 rounded-lg ${
                      isHighContrast 
                        ? 'bg-gray-200' 
                        : stat.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900' :
                          stat.color === 'green' ? 'bg-green-100 dark:bg-green-900' :
                          'bg-red-100 dark:bg-red-900'
                    }`}>
                      <IconComponent className={`w-5 h-5 ${
                        isHighContrast ? 'text-gray-700' : 
                        stat.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                        stat.color === 'green' ? 'text-green-600 dark:text-green-400' :
                        'text-red-600 dark:text-red-400'
                      }`} />
                    </div>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                      isHighContrast 
                        ? (isPositiveTrend ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800')
                        : (isPositiveTrend ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600')
                    }`}>
                      {isPositiveTrend ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {stat.trend}
                    </div>
                  </div>
                  <div className={`text-sm font-medium mb-1 ${
                    isHighContrast ? 'text-gray-700' : 'text-gray-600 dark:text-slate-400'
                  }`}>{stat.title}</div>
                  <div className={`text-2xl font-bold ${
                    isHighContrast ? 'text-black' : 'text-gray-900 dark:text-white'
                  }`}>{stat.value}</div>
                </div>
              );
            })}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Status Distribution Pie Chart */}
            <div className={`p-6 rounded-lg transition-all duration-300 ${
              isHighContrast 
                ? 'bg-white text-black border-4 border-black' 
                : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700'
            }`}>
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-2 rounded-lg ${
                  isHighContrast ? 'bg-gray-200' : 'bg-blue-100 dark:bg-blue-900'
                }`}>
                  <PieChart className={`w-5 h-5 ${
                    isHighContrast ? 'text-gray-700' : 'text-blue-600 dark:text-blue-400'
                  }`} />
                </div>
                <h3 className={`text-lg font-bold ${
                  isHighContrast ? 'text-black' : 'text-gray-900 dark:text-white'
                }`}>Status Distribution</h3>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={dashboardData.statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {dashboardData.statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: isHighContrast ? '#ffffff' : 'rgba(255, 255, 255, 0.95)',
                        border: isHighContrast ? '2px solid #000000' : '1px solid #e5e7eb',
                        borderRadius: '8px',
                        color: isHighContrast ? '#000000' : '#374151'
                      }}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Priority Distribution */}
            <div className={`p-6 rounded-lg transition-all duration-300 ${
              isHighContrast 
                ? 'bg-white text-black border-4 border-black' 
                : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700'
            }`}>
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-2 rounded-lg ${
                  isHighContrast ? 'bg-gray-200' : 'bg-orange-100 dark:bg-orange-900'
                }`}>
                  <Target className={`w-5 h-5 ${
                    isHighContrast ? 'text-gray-700' : 'text-orange-600 dark:text-orange-400'
                  }`} />
                </div>
                <h3 className={`text-lg font-bold ${
                  isHighContrast ? 'text-black' : 'text-gray-900 dark:text-white'
                }`}>Priority Distribution</h3>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dashboardData.priorityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isHighContrast ? '#000000' : '#e5e7eb'} />
                    <XAxis 
                      dataKey="name" 
                      stroke={isHighContrast ? '#000000' : '#6b7280'}
                      fontSize={12}
                      fontWeight="500"
                    />
                    <YAxis 
                      stroke={isHighContrast ? '#000000' : '#6b7280'}
                      fontSize={12}
                      fontWeight="500"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isHighContrast ? '#ffffff' : 'rgba(255, 255, 255, 0.95)',
                        border: isHighContrast ? '2px solid #000000' : '1px solid #e5e7eb',
                        borderRadius: '8px',
                        color: isHighContrast ? '#000000' : '#374151'
                      }}
                    />
                    <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]}>
                      {dashboardData.priorityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Delivery Trends and Service Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Delivery Trends */}
            <div className={`p-6 rounded-lg transition-all duration-300 ${
              isHighContrast 
                ? 'bg-white text-black border-4 border-black' 
                : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700'
            }`}>
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-2 rounded-lg ${
                  isHighContrast ? 'bg-gray-200' : 'bg-green-100 dark:bg-green-900'
                }`}>
                  <TrendingUp className={`w-5 h-5 ${
                    isHighContrast ? 'text-gray-700' : 'text-green-600 dark:text-green-400'
                  }`} />
                </div>
                <h3 className={`text-lg font-bold ${
                  isHighContrast ? 'text-black' : 'text-gray-900 dark:text-white'
                }`}>Delivery Trends (7 Days)</h3>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dashboardData.deliveryTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isHighContrast ? '#000000' : '#e5e7eb'} />
                    <XAxis 
                      dataKey="date" 
                      stroke={isHighContrast ? '#000000' : '#6b7280'}
                      fontSize={12}
                      fontWeight="500"
                    />
                    <YAxis 
                      stroke={isHighContrast ? '#000000' : '#6b7280'}
                      fontSize={12}
                      fontWeight="500"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isHighContrast ? '#ffffff' : 'rgba(255, 255, 255, 0.95)',
                        border: isHighContrast ? '2px solid #000000' : '1px solid #e5e7eb',
                        borderRadius: '8px',
                        color: isHighContrast ? '#000000' : '#374151'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="delivered"
                      stackId="1"
                      stroke="#10B981"
                      fill="#10B981"
                      fillOpacity={0.6}
                      name="Delivered"
                    />
                    <Area
                      type="monotone"
                      dataKey="created"
                      stackId="2"
                      stroke="#3B82F6"
                      fill="#3B82F6"
                      fillOpacity={0.6}
                      name="Created"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Service Type Performance */}
            <div className={`p-6 rounded-lg transition-all duration-300 ${
              isHighContrast 
                ? 'bg-white text-black border-4 border-black' 
                : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700'
            }`}>
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-2 rounded-lg ${
                  isHighContrast ? 'bg-gray-200' : 'bg-purple-100 dark:bg-purple-900'
                }`}>
                  <Activity className={`w-5 h-5 ${
                    isHighContrast ? 'text-gray-700' : 'text-purple-600 dark:text-purple-400'
                  }`} />
                </div>
                <h3 className={`text-lg font-bold ${
                  isHighContrast ? 'text-black' : 'text-gray-900 dark:text-white'
                }`}>Service Performance</h3>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dashboardData.serviceTypeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isHighContrast ? '#000000' : '#e5e7eb'} />
                    <XAxis 
                      dataKey="type" 
                      stroke={isHighContrast ? '#000000' : '#6b7280'}
                      fontSize={12}
                      fontWeight="500"
                    />
                    <YAxis 
                      stroke={isHighContrast ? '#000000' : '#6b7280'}
                      fontSize={12}
                      fontWeight="500"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isHighContrast ? '#ffffff' : 'rgba(255, 255, 255, 0.95)',
                        border: isHighContrast ? '2px solid #000000' : '1px solid #e5e7eb',
                        borderRadius: '8px',
                        color: isHighContrast ? '#000000' : '#374151'
                      }}
                    />
                    <Bar dataKey="parcels" fill="#3B82F6" radius={[2, 2, 0, 0]} name="Total Parcels" />
                    <Bar dataKey="delivered" fill="#10B981" radius={[2, 2, 0, 0]} name="Delivered" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className={`p-6 rounded-lg transition-all duration-300 ${
            isHighContrast 
              ? 'bg-white text-black border-4 border-black' 
              : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700'
          }`}>
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-2 rounded-lg ${
                isHighContrast ? 'bg-gray-200' : 'bg-indigo-100 dark:bg-indigo-900'
              }`}>
                <BarChart3 className={`w-5 h-5 ${
                  isHighContrast ? 'text-gray-700' : 'text-indigo-600 dark:text-indigo-400'
                }`} />
              </div>
              <h3 className={`text-lg font-bold ${
                isHighContrast ? 'text-black' : 'text-gray-900 dark:text-white'
              }`}>Performance Metrics</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {dashboardData.serviceTypeData.map((service, index) => (
                <div key={index} className={`p-4 rounded-lg transition-all duration-300 ${
                  isHighContrast 
                    ? 'bg-gray-100 border-2 border-black' 
                    : 'bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600'
                }`}>
                  <h4 className={`font-medium text-lg mb-3 ${
                    isHighContrast ? 'text-black' : 'text-gray-900 dark:text-white'
                  }`}>{service.type}</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className={`text-sm ${
                        isHighContrast ? 'text-gray-700' : 'text-gray-600 dark:text-slate-300'
                      }`}>Total Parcels:</span>
                      <span className="font-semibold">{service.parcels}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`text-sm ${
                        isHighContrast ? 'text-gray-700' : 'text-gray-600 dark:text-slate-300'
                      }`}>Delivered:</span>
                      <span className="font-semibold text-green-600">{service.delivered}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`text-sm ${
                        isHighContrast ? 'text-gray-700' : 'text-gray-600 dark:text-slate-300'
                      }`}>Success Rate:</span>
                      <span className={`font-semibold ${service.deliveryRate >= 80 ? 'text-green-600' : service.deliveryRate >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {service.deliveryRate}%
                      </span>
                    </div>
                  </div>
                  <div className={`mt-4 w-full h-2 rounded-full overflow-hidden ${
                    isHighContrast ? 'bg-gray-300' : 'bg-gray-200 dark:bg-slate-600'
                  }`}>
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        service.deliveryRate >= 80 
                          ? 'bg-green-500' 
                          : service.deliveryRate >= 60 
                            ? 'bg-yellow-500' 
                            : 'bg-red-500'
                      }`}
                      style={{ width: `${service.deliveryRate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* View Parcel Modal */}
      {isModalOpen && selectedParcel && (
        <ViewParcelModal parcel={selectedParcel} onClose={closeAllModals} onEdit={openEditModal} isHighContrast={isHighContrast} criticalPrioritySettings={criticalPrioritySettings} />
      )}

      {/* Add Parcel Modal */}
      {isAddModalOpen && (
        <AddParcelModal onAdd={addParcel} onClose={closeAllModals} isHighContrast={isHighContrast} criticalPrioritySettings={criticalPrioritySettings} />
      )}

      {/* Edit Parcel Modal */}
      {isEditModalOpen && editingParcel && (
        <EditParcelModal parcel={editingParcel} onUpdate={updateParcel} onClose={closeAllModals} isHighContrast={isHighContrast} criticalPrioritySettings={criticalPrioritySettings} />
      )}

      {/* Footer */}
      <footer className={`border-t mt-16 transition-all duration-300 ${
        isHighContrast 
          ? 'bg-white border-black' 
          : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700'
      }`}>
        <div className="container-wide py-6">
          <p className={`text-center text-sm ${
            isHighContrast ? 'text-gray-600' : 'text-gray-600 dark:text-slate-400'
          }`}>
            Copyright © 2025 Datavtar Private Limited. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

// View Parcel Modal Component
interface ViewParcelModalProps {
  parcel: Parcel;
  onClose: () => void;
  onEdit: (parcel: Parcel) => void;
  isHighContrast: boolean;
  criticalPrioritySettings: PrioritySettings;
}

const ViewParcelModal: React.FC<ViewParcelModalProps> = ({ parcel, onClose, onEdit, isHighContrast, criticalPrioritySettings }) => {
  const getStatusColor = (status: ParcelStatus): string => {
    if (isHighContrast) {
      const highContrastColors = {
        pending: 'bg-yellow-400 text-black border-2 border-black',
        in_transit: 'bg-cyan-400 text-black border-2 border-black',
        out_for_delivery: 'bg-purple-400 text-black border-2 border-black',
        delivered: 'bg-green-400 text-black border-2 border-black',
        delayed: 'bg-red-500 text-white border-2 border-white',
        cancelled: 'bg-gray-500 text-white border-2 border-white'
      };
      return highContrastColors[status] || highContrastColors.pending;
    }
    
    const colors = {
      pending: 'bg-amber-100 text-amber-800 border border-amber-300',
      in_transit: 'bg-blue-100 text-blue-800 border border-blue-300',
      out_for_delivery: 'bg-indigo-100 text-indigo-800 border border-indigo-300',
      delivered: 'bg-green-100 text-green-800 border border-green-300',
      delayed: 'bg-red-100 text-red-800 border border-red-300',
      cancelled: 'bg-gray-100 text-gray-800 border border-gray-300'
    };
    return colors[status] || colors.pending;
  };

  const getStatusIcon = (status: ParcelStatus) => {
    const iconClass = isHighContrast ? 'w-4 h-4' : 'w-4 h-4';
    switch (status) {
      case 'pending': return <Clock className={iconClass} />;
      case 'in_transit': return <Truck className={iconClass} />;
      case 'out_for_delivery': return <MapPin className={iconClass} />;
      case 'delivered': return <CheckCircle className={iconClass} />;
      case 'delayed': return <AlertTriangle className={iconClass} />;
      case 'cancelled': return <XCircle className={iconClass} />;
      default: return <Package className={iconClass} />;
    }
  };

  const getPriorityColor = (priority: ParcelPriority): string => {
    if (isHighContrast) {
      const highContrastColors = {
        low: 'bg-gray-400 text-black border-2 border-black',
        medium: 'bg-yellow-400 text-black border-2 border-black',
        high: 'bg-red-500 text-white border-2 border-white',
        critical: 'bg-red-600 text-white border-2 border-white'
      };
      return highContrastColors[priority] || highContrastColors.low;
    }
    
    const colors = {
      low: 'bg-gray-100 text-gray-700 border border-gray-300',
      medium: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
      high: 'bg-orange-100 text-orange-800 border border-orange-300',
      critical: 'bg-red-100 text-red-800 border border-red-300'
    };
    return colors[priority] || colors.low;
  };

  const getPriorityLabel = (priority: ParcelPriority): string => {
    const labels = {
      low: 'Low',
      medium: 'Medium', 
      high: 'High',
      critical: criticalPrioritySettings.name
    };
    return labels[priority] || labels.low;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string): string => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`modal-backdrop flex items-center justify-center z-50 ${
      isHighContrast ? 'bg-black bg-opacity-90' : 'bg-black bg-opacity-50'
    }`} onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className={`w-full max-w-4xl max-h-[90vh] overflow-auto p-6 m-4 z-50 rounded-lg transition-all duration-300 ${
        isHighContrast 
          ? 'bg-white text-black border-4 border-black' 
          : 'bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-700'
      }`} onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg ${
              isHighContrast ? 'bg-blue-100' : 'bg-blue-100 dark:bg-blue-900'
            }`}>
              <Package className={`w-6 h-6 ${
                isHighContrast ? 'text-blue-600' : 'text-blue-600 dark:text-blue-400'
              }`} />
            </div>
            <div>
              <h3 id="modal-title" className={`text-xl font-bold ${
                isHighContrast ? 'text-black' : 'text-gray-900 dark:text-white'
              }`}>
                Parcel Details
              </h3>
              <p className={`text-lg font-medium ${
                isHighContrast ? 'text-blue-600' : 'text-blue-600 dark:text-blue-400'
              }`}>{parcel.trackingNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-all duration-300 ${
              isHighContrast 
                ? 'text-black hover:bg-gray-200' 
                : 'text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:text-slate-300 dark:hover:bg-slate-700'
            }`}
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-6">
          {/* Status and Priority */}
          <div className="flex flex-wrap gap-3">
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(parcel.status)}`}>
              {getStatusIcon(parcel.status)}
              {parcel.status.replace('_', ' ').toUpperCase()}
            </span>
            <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getPriorityColor(parcel.priority)}`}>
              {getPriorityLabel(parcel.priority).toUpperCase()} PRIORITY
            </span>
            <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
              isHighContrast 
                ? 'bg-blue-400 text-black border-2 border-black' 
                : 'bg-blue-100 text-blue-800 border border-blue-300'
            }`}>
              {parcel.serviceType.toUpperCase()}
            </span>
          </div>

          {/* Main Information Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`p-4 rounded-lg transition-all duration-300 ${
              isHighContrast 
                ? 'bg-gray-100 border-2 border-black' 
                : 'bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600'
            }`}>
              <h4 className={`font-medium text-lg mb-3 flex items-center gap-2 ${
                isHighContrast ? 'text-black' : 'text-gray-900 dark:text-white'
              }`}>
                <User className="w-4 h-4" />
                Recipient Details
              </h4>
              <div className="space-y-2 text-sm">
                <p><strong>Name:</strong> {parcel.recipient.name}</p>
                <p><strong>Address:</strong> {parcel.recipient.address}</p>
                <p><strong>Phone:</strong> {parcel.recipient.phone}</p>
                <p><strong>Email:</strong> {parcel.recipient.email}</p>
              </div>
            </div>
            
            <div className={`p-4 rounded-lg transition-all duration-300 ${
              isHighContrast 
                ? 'bg-gray-100 border-2 border-black' 
                : 'bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600'
            }`}>
              <h4 className={`font-medium text-lg mb-3 flex items-center gap-2 ${
                isHighContrast ? 'text-black' : 'text-gray-900 dark:text-white'
              }`}>
                <Package className="w-4 h-4" />
                Parcel Information
              </h4>
              <div className="space-y-2 text-sm">
                <p><strong>Weight:</strong> {parcel.weight} kg</p>
                <p><strong>Dimensions:</strong> {parcel.dimensions}</p>
                <p><strong>Service Type:</strong> {parcel.serviceType}</p>
                <p><strong>Priority:</strong> {getPriorityLabel(parcel.priority)}</p>
              </div>
            </div>
          </div>

          {/* Current Status */}
          <div className={`p-4 rounded-lg transition-all duration-300 ${
            isHighContrast 
              ? 'bg-gray-100 border-2 border-black' 
              : 'bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600'
          }`}>
            <h4 className={`font-medium text-lg mb-3 flex items-center gap-2 ${
              isHighContrast ? 'text-black' : 'text-gray-900 dark:text-white'
            }`}>
              <MapPin className="w-4 h-4" />
              Current Status
            </h4>
            <div className={`p-3 rounded-lg ${
              isHighContrast 
                ? 'bg-white border-2 border-gray-300' 
                : 'bg-white dark:bg-slate-600 border border-gray-200 dark:border-slate-500'
            }`}>
              <p className="font-medium text-lg">{parcel.currentLocation}</p>
              <p className={`text-sm mt-1 ${
                isHighContrast ? 'text-gray-600' : 'text-gray-600 dark:text-slate-300'
              }`}>
                Estimated Delivery: {formatDate(parcel.estimatedDelivery)}
              </p>
              {parcel.actualDelivery && (
                <p className={`text-sm mt-1 font-medium ${
                  isHighContrast ? 'text-green-600' : 'text-green-600 dark:text-green-400'
                }`}>
                  Delivered: {formatDate(parcel.actualDelivery)}
                </p>
              )}
            </div>
          </div>

          {/* Status History */}
          <div className={`p-4 rounded-lg transition-all duration-300 ${
            isHighContrast 
              ? 'bg-gray-100 border-2 border-black' 
              : 'bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600'
          }`}>
            <h4 className={`font-medium text-lg mb-4 flex items-center gap-2 ${
              isHighContrast ? 'text-black' : 'text-gray-900 dark:text-white'
            }`}>
              <Clock className="w-4 h-4" />
              Tracking History
            </h4>
            <div className="space-y-3">
              {parcel.statusHistory.map((history, index) => (
                <div key={index} className={`flex gap-3 p-3 rounded-lg transition-all duration-300 ${
                  isHighContrast 
                    ? 'bg-white border-2 border-gray-300' 
                    : 'bg-white dark:bg-slate-600 border border-gray-200 dark:border-slate-500'
                }`}>
                  <div className={`flex-shrink-0 p-2 rounded-lg ${
                    isHighContrast ? 'bg-gray-200' : 'bg-gray-100 dark:bg-slate-500'
                  }`}>
                    {getStatusIcon(history.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-medium capitalize">{history.status.replace('_', ' ')}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        isHighContrast ? 'bg-gray-200 text-gray-600' : 'bg-gray-100 text-gray-600 dark:bg-slate-500 dark:text-slate-200'
                      }`}>
                        {formatDateTime(history.timestamp)}
                      </span>
                    </div>
                    <p className={`text-sm font-medium ${
                      isHighContrast ? 'text-gray-700' : 'text-gray-700 dark:text-slate-300'
                    }`}>{history.location}</p>
                    {history.notes && (
                      <p className={`text-sm mt-1 italic ${
                        isHighContrast ? 'text-gray-600' : 'text-gray-600 dark:text-slate-400'
                      }`}>{history.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={() => onEdit(parcel)}
            className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center gap-2 ${
              isHighContrast 
                ? 'bg-blue-400 text-black border-2 border-black hover:bg-blue-300 focus:ring-blue-500' 
                : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
            }`}
          >
            <Edit className="w-4 h-4" />
            Edit Parcel
          </button>
          <button
            onClick={onClose}
            className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isHighContrast 
                ? 'bg-gray-300 text-black border-2 border-black hover:bg-gray-200 focus:ring-gray-500' 
                : 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500'
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Add Parcel Modal Component
interface AddParcelModalProps {
  onAdd: (parcelData: Omit<Parcel, 'id' | 'trackingNumber' | 'createdAt' | 'updatedAt' | 'statusHistory'>) => void;
  onClose: () => void;
  isHighContrast: boolean;
  criticalPrioritySettings: PrioritySettings;
}

const AddParcelModal: React.FC<AddParcelModalProps> = ({ onAdd, onClose, isHighContrast, criticalPrioritySettings }) => {
  const [formData, setFormData] = useState({
    status: 'pending' as ParcelStatus,
    currentLocation: '',
    estimatedDelivery: '',
    recipient: {
      name: '',
      address: '',
      phone: '',
      email: ''
    },
    sender: {
      name: '',
      address: ''
    },
    weight: 0,
    dimensions: '',
    priority: 'medium' as ParcelPriority,
    serviceType: 'standard' as 'standard' | 'express' | 'overnight'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
  };

  const updateFormData = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as any),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  return (
    <div className={`modal-backdrop flex items-center justify-center z-50 ${
      isHighContrast ? 'bg-black bg-opacity-90' : 'bg-black bg-opacity-50'
    }`} onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="add-modal-title">
      <div className={`w-full max-w-3xl max-h-[90vh] overflow-auto p-6 m-4 z-50 rounded-lg transition-all duration-300 ${
        isHighContrast 
          ? 'bg-white text-black border-4 border-black' 
          : 'bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-700'
      }`} onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg ${
              isHighContrast ? 'bg-blue-100' : 'bg-green-100 dark:bg-green-900'
            }`}>
              <Plus className={`w-6 h-6 ${
                isHighContrast ? 'text-blue-600' : 'text-green-600 dark:text-green-400'
              }`} />
            </div>
            <div>
              <h3 id="add-modal-title" className={`text-xl font-bold ${
                isHighContrast ? 'text-black' : 'text-gray-900 dark:text-white'
              }`}>
                Add New Parcel
              </h3>
              <p className={`text-sm ${
                isHighContrast ? 'text-gray-600' : 'text-gray-600 dark:text-slate-400'
              }`}>Create a new parcel entry</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-all duration-300 ${
              isHighContrast 
                ? 'text-black hover:bg-gray-200' 
                : 'text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:text-slate-300 dark:hover:bg-slate-700'
            }`}
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className={`p-4 rounded-lg ${
            isHighContrast 
              ? 'bg-gray-100 border-2 border-black' 
              : 'bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600'
          }`}>
            <h4 className={`font-medium text-lg mb-4 flex items-center gap-2 ${
              isHighContrast ? 'text-black' : 'text-gray-900 dark:text-white'
            }`}>
              <Package className="w-4 h-4" />
              Basic Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Status', field: 'status', type: 'select', options: [
                  { value: 'pending', label: 'Pending' },
                  { value: 'in_transit', label: 'In Transit' },
                  { value: 'out_for_delivery', label: 'Out for Delivery' },
                  { value: 'delivered', label: 'Delivered' },
                  { value: 'delayed', label: 'Delayed' },
                  { value: 'cancelled', label: 'Cancelled' }
                ]},
                { label: 'Priority', field: 'priority', type: 'select', options: [
                  { value: 'low', label: 'Low' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'high', label: 'High' },
                  { value: 'critical', label: criticalPrioritySettings.name }
                ]},
                { label: 'Service Type', field: 'serviceType', type: 'select', options: [
                  { value: 'standard', label: 'Standard' },
                  { value: 'express', label: 'Express' },
                  { value: 'overnight', label: 'Overnight' }
                ]},
                { label: 'Estimated Delivery Date', field: 'estimatedDelivery', type: 'date' }
              ].map((field, index) => (
                <div key={index} className="mb-3">
                  <label className={`block text-sm font-medium mb-1 ${
                    isHighContrast ? 'text-black' : 'text-gray-700 dark:text-slate-300'
                  }`}>{field.label}</label>
                  {field.type === 'select' ? (
                    <select
                      value={formData[field.field as keyof typeof formData] as string}
                      onChange={(e) => updateFormData(field.field, e.target.value)}
                      className={`block w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 text-sm ${
                        isHighContrast 
                          ? 'bg-white text-black border-2 border-black focus:border-blue-500' 
                          : 'border border-gray-300 dark:bg-slate-800 dark:border-slate-600 dark:text-white focus:border-blue-500'
                      }`}
                      required
                    >
                      {field.options?.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      value={formData[field.field as keyof typeof formData] as string}
                      onChange={(e) => updateFormData(field.field, e.target.value)}
                      className={`block w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 text-sm ${
                        isHighContrast 
                          ? 'bg-white text-black border-2 border-black focus:border-blue-500' 
                          : 'border border-gray-300 dark:bg-slate-800 dark:border-slate-600 dark:text-white focus:border-blue-500'
                      }`}
                      required
                    />
                  )}
                </div>
              ))}
            </div>
            
            <div className="mb-3">
              <label className={`block text-sm font-medium mb-1 ${
                isHighContrast ? 'text-black' : 'text-gray-700 dark:text-slate-300'
              }`}>Current Location</label>
              <input
                type="text"
                value={formData.currentLocation}
                onChange={(e) => updateFormData('currentLocation', e.target.value)}
                className={`block w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 text-sm ${
                  isHighContrast 
                    ? 'bg-white text-black border-2 border-black focus:border-blue-500' 
                    : 'border border-gray-300 dark:bg-slate-800 dark:border-slate-600 dark:text-white focus:border-blue-500'
                }`}
                placeholder="e.g., Warehouse - New York"
                required
              />
            </div>
          </div>

          {/* Recipient Information */}
          <div className={`p-4 rounded-lg ${
            isHighContrast 
              ? 'bg-gray-100 border-2 border-black' 
              : 'bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600'
          }`}>
            <h4 className={`font-medium text-lg mb-4 flex items-center gap-2 ${
              isHighContrast ? 'text-black' : 'text-gray-900 dark:text-white'
            }`}>
              <User className="w-4 h-4" />
              Recipient Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Name', field: 'recipient.name', type: 'text' },
                { label: 'Phone', field: 'recipient.phone', type: 'tel' }
              ].map((field, index) => (
                <div key={index} className="mb-3">
                  <label className={`block text-sm font-medium mb-1 ${
                    isHighContrast ? 'text-black' : 'text-gray-700 dark:text-slate-300'
                  }`}>{field.label}</label>
                  <input
                    type={field.type}
                    value={formData.recipient[field.field.split('.')[1] as keyof typeof formData.recipient]}
                    onChange={(e) => updateFormData(field.field, e.target.value)}
                    className={`block w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 text-sm ${
                      isHighContrast 
                        ? 'bg-white text-black border-2 border-black focus:border-blue-500' 
                        : 'border border-gray-300 dark:bg-slate-800 dark:border-slate-600 dark:text-white focus:border-blue-500'
                    }`}
                    required
                  />
                </div>
              ))}
            </div>
            
            <div className="mb-3">
              <label className={`block text-sm font-medium mb-1 ${
                isHighContrast ? 'text-black' : 'text-gray-700 dark:text-slate-300'
              }`}>Email</label>
              <input
                type="email"
                value={formData.recipient.email}
                onChange={(e) => updateFormData('recipient.email', e.target.value)}
                className={`block w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 text-sm ${
                  isHighContrast 
                    ? 'bg-white text-black border-2 border-black focus:border-blue-500' 
                    : 'border border-gray-300 dark:bg-slate-800 dark:border-slate-600 dark:text-white focus:border-blue-500'
                }`}
                required
              />
            </div>
            
            <div className="mb-3">
              <label className={`block text-sm font-medium mb-1 ${
                isHighContrast ? 'text-black' : 'text-gray-700 dark:text-slate-300'
              }`}>Address</label>
              <textarea
                value={formData.recipient.address}
                onChange={(e) => updateFormData('recipient.address', e.target.value)}
                className={`block w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 text-sm ${
                  isHighContrast 
                    ? 'bg-white text-black border-2 border-black focus:border-blue-500' 
                    : 'border border-gray-300 dark:bg-slate-800 dark:border-slate-600 dark:text-white focus:border-blue-500'
                }`}
                rows={3}
                required
              />
            </div>
          </div>

          {/* Sender Information */}
          <div className={`p-4 rounded-lg ${
            isHighContrast 
              ? 'bg-gray-100 border-2 border-black' 
              : 'bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600'
          }`}>
            <h4 className={`font-medium text-lg mb-4 flex items-center gap-2 ${
              isHighContrast ? 'text-black' : 'text-gray-900 dark:text-white'
            }`}>
              <Truck className="w-4 h-4" />
              Sender Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Name', field: 'sender.name' },
                { label: 'Address', field: 'sender.address' }
              ].map((field, index) => (
                <div key={index} className="mb-3">
                  <label className={`block text-sm font-medium mb-1 ${
                    isHighContrast ? 'text-black' : 'text-gray-700 dark:text-slate-300'
                  }`}>{field.label}</label>
                  <input
                    type="text"
                    value={formData.sender[field.field.split('.')[1] as keyof typeof formData.sender]}
                    onChange={(e) => updateFormData(field.field, e.target.value)}
                    className={`block w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 text-sm ${
                      isHighContrast 
                        ? 'bg-white text-black border-2 border-black focus:border-blue-500' 
                        : 'border border-gray-300 dark:bg-slate-800 dark:border-slate-600 dark:text-white focus:border-blue-500'
                    }`}
                    required
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Package Details */}
          <div className={`p-4 rounded-lg ${
            isHighContrast 
              ? 'bg-gray-100 border-2 border-black' 
              : 'bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600'
          }`}>
            <h4 className={`font-medium text-lg mb-4 flex items-center gap-2 ${
              isHighContrast ? 'text-black' : 'text-gray-900 dark:text-white'
            }`}>
              <Package className="w-4 h-4" />
              Package Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="mb-3">
                <label className={`block text-sm font-medium mb-1 ${
                  isHighContrast ? 'text-black' : 'text-gray-700 dark:text-slate-300'
                }`}>Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.weight}
                  onChange={(e) => updateFormData('weight', parseFloat(e.target.value) || 0)}
                  className={`block w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 text-sm ${
                    isHighContrast 
                      ? 'bg-white text-black border-2 border-black focus:border-blue-500' 
                      : 'border border-gray-300 dark:bg-slate-800 dark:border-slate-600 dark:text-white focus:border-blue-500'
                  }`}
                  required
                />
              </div>
              
              <div className="mb-3">
                <label className={`block text-sm font-medium mb-1 ${
                  isHighContrast ? 'text-black' : 'text-gray-700 dark:text-slate-300'
                }`}>Dimensions</label>
                <input
                  type="text"
                  value={formData.dimensions}
                  onChange={(e) => updateFormData('dimensions', e.target.value)}
                  className={`block w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 text-sm ${
                    isHighContrast 
                      ? 'bg-white text-black border-2 border-black focus:border-blue-500' 
                      : 'border border-gray-300 dark:bg-slate-800 dark:border-slate-600 dark:text-white focus:border-blue-500'
                  }`}
                  placeholder="e.g., 12x8x6 inches"
                  required
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="submit"
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center gap-2 ${
                isHighContrast 
                  ? 'bg-blue-400 text-black border-2 border-black hover:bg-blue-300 focus:ring-blue-500' 
                  : 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
              }`}
            >
              <Plus className="w-4 h-4" />
              Add Parcel
            </button>
            <button
              type="button"
              onClick={onClose}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isHighContrast 
                  ? 'bg-gray-300 text-black border-2 border-black hover:bg-gray-200 focus:ring-gray-500' 
                  : 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500'
              }`}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit Parcel Modal Component
interface EditParcelModalProps {
  parcel: Parcel;
  onUpdate: (id: string, updates: Partial<Parcel>) => void;
  onClose: () => void;
  isHighContrast: boolean;
  criticalPrioritySettings: PrioritySettings;
}

const EditParcelModal: React.FC<EditParcelModalProps> = ({ parcel, onUpdate, onClose, isHighContrast, criticalPrioritySettings }) => {
  const [formData, setFormData] = useState({
    status: parcel.status,
    currentLocation: parcel.currentLocation,
    estimatedDelivery: parcel.estimatedDelivery,
    priority: parcel.priority,
    serviceType: parcel.serviceType
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(parcel.id, formData);
  };

  return (
    <div className={`modal-backdrop flex items-center justify-center z-50 ${
      isHighContrast ? 'bg-black bg-opacity-90' : 'bg-black bg-opacity-50'
    }`} onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="edit-modal-title">
      <div className={`w-full max-w-2xl max-h-[90vh] overflow-auto p-6 m-4 z-50 rounded-lg transition-all duration-300 ${
        isHighContrast 
          ? 'bg-white text-black border-4 border-black' 
          : 'bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-700'
      }`} onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg ${
              isHighContrast ? 'bg-blue-100' : 'bg-orange-100 dark:bg-orange-900'
            }`}>
              <Edit className={`w-6 h-6 ${
                isHighContrast ? 'text-blue-600' : 'text-orange-600 dark:text-orange-400'
              }`} />
            </div>
            <div>
              <h3 id="edit-modal-title" className={`text-xl font-bold ${
                isHighContrast ? 'text-black' : 'text-gray-900 dark:text-white'
              }`}>
                Edit Parcel
              </h3>
              <p className={`text-lg font-medium ${
                isHighContrast ? 'text-blue-600' : 'text-blue-600 dark:text-blue-400'
              }`}>{parcel.trackingNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-all duration-300 ${
              isHighContrast 
                ? 'text-black hover:bg-gray-200' 
                : 'text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:text-slate-300 dark:hover:bg-slate-700'
            }`}
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className={`p-4 rounded-lg ${
            isHighContrast 
              ? 'bg-gray-100 border-2 border-black' 
              : 'bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600'
          }`}>
            <h4 className={`font-medium text-lg mb-4 flex items-center gap-2 ${
              isHighContrast ? 'text-black' : 'text-gray-900 dark:text-white'
            }`}>
              <Settings className="w-4 h-4" />
              Update Parcel Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Status', field: 'status', type: 'select', options: [
                  { value: 'pending', label: 'Pending' },
                  { value: 'in_transit', label: 'In Transit' },
                  { value: 'out_for_delivery', label: 'Out for Delivery' },
                  { value: 'delivered', label: 'Delivered' },
                  { value: 'delayed', label: 'Delayed' },
                  { value: 'cancelled', label: 'Cancelled' }
                ]},
                { label: 'Priority', field: 'priority', type: 'select', options: [
                  { value: 'low', label: 'Low' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'high', label: 'High' },
                  { value: 'critical', label: criticalPrioritySettings.name }
                ]},
                { label: 'Service Type', field: 'serviceType', type: 'select', options: [
                  { value: 'standard', label: 'Standard' },
                  { value: 'express', label: 'Express' },
                  { value: 'overnight', label: 'Overnight' }
                ]},
                { label: 'Estimated Delivery Date', field: 'estimatedDelivery', type: 'date' }
              ].map((field, index) => (
                <div key={index} className="mb-3">
                  <label className={`block text-sm font-medium mb-1 ${
                    isHighContrast ? 'text-black' : 'text-gray-700 dark:text-slate-300'
                  }`}>{field.label}</label>
                  {field.type === 'select' ? (
                    <select
                      value={formData[field.field as keyof typeof formData]}
                      onChange={(e) => setFormData(prev => ({ ...prev, [field.field]: e.target.value }))}
                      className={`block w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 text-sm ${
                        isHighContrast 
                          ? 'bg-white text-black border-2 border-black focus:border-blue-500' 
                          : 'border border-gray-300 dark:bg-slate-800 dark:border-slate-600 dark:text-white focus:border-blue-500'
                      }`}
                      required
                    >
                      {field.options?.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      value={formData[field.field as keyof typeof formData]}
                      onChange={(e) => setFormData(prev => ({ ...prev, [field.field]: e.target.value }))}
                      className={`block w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 text-sm ${
                        isHighContrast 
                          ? 'bg-white text-black border-2 border-black focus:border-blue-500' 
                          : 'border border-gray-300 dark:bg-slate-800 dark:border-slate-600 dark:text-white focus:border-blue-500'
                      }`}
                      required
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="mb-3">
              <label className={`block text-sm font-medium mb-1 ${
                isHighContrast ? 'text-black' : 'text-gray-700 dark:text-slate-300'
              }`}>Current Location</label>
              <input
                type="text"
                value={formData.currentLocation}
                onChange={(e) => setFormData(prev => ({ ...prev, currentLocation: e.target.value }))}
                className={`block w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 text-sm ${
                  isHighContrast 
                    ? 'bg-white text-black border-2 border-black focus:border-blue-500' 
                    : 'border border-gray-300 dark:bg-slate-800 dark:border-slate-600 dark:text-white focus:border-blue-500'
                }`}
                placeholder="e.g., Warehouse - New York"
                required
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="submit"
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center gap-2 ${
                isHighContrast 
                  ? 'bg-blue-400 text-black border-2 border-black hover:bg-blue-300 focus:ring-blue-500' 
                  : 'bg-orange-600 text-white hover:bg-orange-700 focus:ring-orange-500'
              }`}
            >
              <Edit className="w-4 h-4" />
              Update Parcel
            </button>
            <button
              type="button"
              onClick={onClose}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isHighContrast 
                  ? 'bg-gray-300 text-black border-2 border-black hover:bg-gray-200 focus:ring-gray-500' 
                  : 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500'
              }`}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default App;