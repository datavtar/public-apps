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
  ChevronUp
} from 'lucide-react';
import styles from './styles/styles.module.css';

// Types and Interfaces
type ParcelStatus = 'pending' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'delayed' | 'cancelled';

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
  priority: 'low' | 'medium' | 'high';
  serviceType: 'standard' | 'express' | 'overnight';
}

interface FilterOptions {
  status: ParcelStatus | 'all';
  priority: 'all' | 'low' | 'medium' | 'high';
  serviceType: 'all' | 'standard' | 'express' | 'overnight';
  dateRange: 'all' | 'today' | 'week' | 'month';
}

type SortField = 'trackingNumber' | 'status' | 'estimatedDelivery' | 'createdAt' | 'priority';
type SortDirection = 'asc' | 'desc';

const App: React.FC = () => {
  // State Management
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

  // Sample Data
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
      priority: 'high',
      serviceType: 'overnight'
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
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      in_transit: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      out_for_delivery: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      delivered: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      delayed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    };
    return colors[status] || colors.pending;
  };

  const getStatusIcon = (status: ParcelStatus) => {
    const iconProps = { className: 'w-4 h-4' };
    switch (status) {
      case 'pending': return <Clock {...iconProps} />;
      case 'in_transit': return <Truck {...iconProps} />;
      case 'out_for_delivery': return <MapPin {...iconProps} />;
      case 'delivered': return <CheckCircle {...iconProps} />;
      case 'delayed': return <AlertTriangle {...iconProps} />;
      case 'cancelled': return <XCircle {...iconProps} />;
      default: return <Package {...iconProps} />;
    }
  };

  const getPriorityColor = (priority: string): string => {
    if (isHighContrast) {
      const highContrastColors = {
        low: 'bg-gray-400 text-black border-2 border-black',
        medium: 'bg-yellow-400 text-black border-2 border-black',
        high: 'bg-red-500 text-white border-2 border-white'
      };
      return highContrastColors[priority as keyof typeof highContrastColors] || highContrastColors.low;
    }
    
    const colors = {
      low: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return colors[priority as keyof typeof colors] || colors.low;
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
          const priorityOrder = { low: 1, medium: 2, high: 3 };
          aValue = priorityOrder[a.priority as keyof typeof priorityOrder];
          bValue = priorityOrder[b.priority as keyof typeof priorityOrder];
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
    
    return { total, delivered, inTransit, delayed, pending };
  }, [parcels]);

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
    <div className={`min-h-screen transition-all duration-300 ${
      isHighContrast 
        ? 'bg-black text-white' 
        : 'bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white'
    }`}>
      {/* Header */}
      <header className={`shadow-sm border-b transition-all duration-300 ${
        isHighContrast 
          ? 'bg-black border-white' 
          : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700'
      }`}>
        <div className="container-wide py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Package className={`w-8 h-8 ${
                isHighContrast ? 'text-white' : 'text-blue-600 dark:text-blue-400'
              }`} />
              <div>
                <h1 className={`text-2xl font-bold ${
                  isHighContrast ? 'text-white' : 'text-gray-900 dark:text-white'
                }`}>ParcelTracker Pro</h1>
                <p className={`text-sm ${
                  isHighContrast ? 'text-gray-300' : 'text-gray-500 dark:text-slate-400'
                }`}>Logistics Management System</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Notifications */}
              {notifications.length > 0 && (
                <div className="relative">
                  <Bell className="w-6 h-6 text-red-500 animate-pulse" />
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
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
                  className={`p-2 rounded-lg transition-colors ${
                    isHighContrast 
                      ? 'bg-white text-black hover:bg-gray-300 border-2 border-white' 
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                  }`}
                  aria-label="Theme settings"
                >
                  <Settings className="w-5 h-5" />
                </button>
                
                {showThemeSettings && (
                  <div className={`absolute right-0 mt-2 w-64 rounded-lg shadow-lg z-50 border-2 ${
                    isHighContrast 
                      ? 'bg-black border-white' 
                      : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700'
                  }`}>
                    <div className="p-4 space-y-4">
                      <h3 className={`font-semibold text-sm ${
                        isHighContrast ? 'text-white' : 'text-gray-900 dark:text-white'
                      }`}>Display Settings</h3>
                      
                      {/* Dark Mode Toggle */}
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${
                          isHighContrast ? 'text-white' : 'text-gray-700 dark:text-slate-300'
                        }`}>Dark Mode</span>
                        <button
                          onClick={() => setIsDarkMode(!isDarkMode)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                            isDarkMode 
                              ? (isHighContrast ? 'bg-white' : 'bg-blue-600') 
                              : (isHighContrast ? 'bg-gray-600' : 'bg-gray-200')
                          }`}
                          aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full transition duration-200 ease-in-out ${
                            isDarkMode 
                              ? (isHighContrast ? 'translate-x-6 bg-black' : 'translate-x-6 bg-white') 
                              : (isHighContrast ? 'translate-x-1 bg-white' : 'translate-x-1 bg-white')
                          }`} />
                        </button>
                      </div>
                      
                      {/* High Contrast Toggle */}
                      <div className="flex items-center justify-between">
                        <div>
                          <span className={`text-sm block ${
                            isHighContrast ? 'text-white' : 'text-gray-700 dark:text-slate-300'
                          }`}>High Contrast</span>
                          <span className={`text-xs ${
                            isHighContrast ? 'text-gray-300' : 'text-gray-500 dark:text-slate-400'
                          }`}>Enhanced visibility</span>
                        </div>
                        <button
                          onClick={() => setIsHighContrast(!isHighContrast)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 border-2 ${
                            isHighContrast 
                              ? 'bg-white border-white' 
                              : (isHighContrast ? 'bg-gray-600 border-gray-600' : 'bg-gray-200 border-gray-200')
                          }`}
                          aria-label={isHighContrast ? 'Disable high contrast' : 'Enable high contrast'}
                        >
                          <span className={`inline-block h-3 w-3 transform rounded-full transition duration-200 ease-in-out border ${
                            isHighContrast 
                              ? 'translate-x-6 bg-black border-black' 
                              : 'translate-x-1 bg-white border-gray-300'
                          }`} />
                        </button>
                      </div>
                      
                      <div className={`pt-2 border-t text-xs ${
                        isHighContrast 
                          ? 'border-white text-gray-300' 
                          : 'border-gray-200 dark:border-slate-600 text-gray-500 dark:text-slate-400'
                      }`}>
                        High contrast mode improves visibility for users with visual impairments
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
        <div className="container-wide py-2">
          {notifications.map((notification, index) => (
            <div key={index} className={`flex items-center gap-2 p-4 rounded-md mb-2 ${
              isHighContrast 
                ? 'bg-yellow-400 text-black border-2 border-black' 
                : 'bg-yellow-50 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
            }`}>
              <AlertTriangle className="w-5 h-5" />
              <p className="flex-1">{notification}</p>
              <button
                onClick={() => clearNotification(index)}
                className={`transition-colors ${
                  isHighContrast 
                    ? 'text-black hover:text-gray-700' 
                    : 'text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-200'
                }`}
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Stats Dashboard */}
      <div className="container-wide py-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className={`p-4 rounded-lg shadow flex flex-col transition-all duration-300 ${
            isHighContrast 
              ? 'bg-white text-black border-2 border-black' 
              : 'bg-white dark:bg-slate-800 text-gray-900 dark:text-white'
          }`}>
            <div className={`text-sm font-medium ${
              isHighContrast ? 'text-gray-700' : 'text-gray-500 dark:text-slate-400'
            }`}>Total Parcels</div>
            <div className={`text-2xl font-semibold mt-1 ${
              isHighContrast ? 'text-black' : 'text-gray-900 dark:text-white'
            }`}>{stats.total}</div>
          </div>
          <div className={`p-4 rounded-lg shadow flex flex-col transition-all duration-300 ${
            isHighContrast 
              ? 'bg-white text-black border-2 border-black' 
              : 'bg-white dark:bg-slate-800 text-gray-900 dark:text-white'
          }`}>
            <div className={`text-sm font-medium ${
              isHighContrast ? 'text-gray-700' : 'text-gray-500 dark:text-slate-400'
            }`}>Delivered</div>
            <div className={`text-2xl font-semibold mt-1 ${
              isHighContrast ? 'text-green-600' : 'text-green-600'
            }`}>{stats.delivered}</div>
          </div>
          <div className={`p-4 rounded-lg shadow flex flex-col transition-all duration-300 ${
            isHighContrast 
              ? 'bg-white text-black border-2 border-black' 
              : 'bg-white dark:bg-slate-800 text-gray-900 dark:text-white'
          }`}>
            <div className={`text-sm font-medium ${
              isHighContrast ? 'text-gray-700' : 'text-gray-500 dark:text-slate-400'
            }`}>In Transit</div>
            <div className={`text-2xl font-semibold mt-1 ${
              isHighContrast ? 'text-cyan-600' : 'text-blue-600'
            }`}>{stats.inTransit}</div>
          </div>
          <div className={`p-4 rounded-lg shadow flex flex-col transition-all duration-300 ${
            isHighContrast 
              ? 'bg-white text-black border-2 border-black' 
              : 'bg-white dark:bg-slate-800 text-gray-900 dark:text-white'
          }`}>
            <div className={`text-sm font-medium ${
              isHighContrast ? 'text-gray-700' : 'text-gray-500 dark:text-slate-400'
            }`}>Delayed</div>
            <div className={`text-2xl font-semibold mt-1 ${
              isHighContrast ? 'text-red-600' : 'text-red-600'
            }`}>{stats.delayed}</div>
          </div>
          <div className={`p-4 rounded-lg shadow flex flex-col transition-all duration-300 ${
            isHighContrast 
              ? 'bg-white text-black border-2 border-black' 
              : 'bg-white dark:bg-slate-800 text-gray-900 dark:text-white'
          }`}>
            <div className={`text-sm font-medium ${
              isHighContrast ? 'text-gray-700' : 'text-gray-500 dark:text-slate-400'
            }`}>Pending</div>
            <div className={`text-2xl font-semibold mt-1 ${
              isHighContrast ? 'text-yellow-600' : 'text-yellow-600'
            }`}>{stats.pending}</div>
          </div>
        </div>

        {/* Controls */}
        <div className={`p-6 rounded-lg shadow mb-6 transition-all duration-300 ${
          isHighContrast 
            ? 'bg-white text-black border-2 border-black' 
            : 'bg-white dark:bg-slate-800 text-gray-900 dark:text-white'
        }`}>
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                isHighContrast ? 'text-gray-600' : 'text-gray-400'
              }`} />
              <input
                type="text"
                placeholder="Search by tracking number, recipient, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`block w-full pl-10 px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                  isHighContrast 
                    ? 'bg-white text-black border-2 border-black focus:border-blue-500' 
                    : 'border border-gray-300 dark:bg-slate-800 dark:border-slate-600 dark:text-white focus:border-blue-500'
                }`}
              />
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center gap-2 ${
                  isHighContrast 
                    ? 'bg-gray-200 text-black border-2 border-black hover:bg-gray-300 focus:ring-blue-500' 
                    : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600 focus:ring-gray-500'
                }`}
              >
                <Filter className="w-4 h-4" />
                Filters
                {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              <button
                onClick={exportToCSV}
                className={`px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center gap-2 ${
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
                className={`px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center gap-2 ${
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
            <div className={`mt-4 pt-4 border-t transition-all duration-300 ${
              isHighContrast ? 'border-black' : 'border-gray-200 dark:border-slate-600'
            }`}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isHighContrast ? 'text-black' : 'text-gray-700 dark:text-slate-300'
                  }`}>Status</label>
                  <select
                    value={filterOptions.status}
                    onChange={(e) => setFilterOptions(prev => ({ ...prev, status: e.target.value as FilterOptions['status'] }))}
                    className={`block w-full px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                      isHighContrast 
                        ? 'bg-white text-black border-2 border-black focus:border-blue-500' 
                        : 'border border-gray-300 dark:bg-slate-800 dark:border-slate-600 dark:text-white focus:border-blue-500'
                    }`}
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="in_transit">In Transit</option>
                    <option value="out_for_delivery">Out for Delivery</option>
                    <option value="delivered">Delivered</option>
                    <option value="delayed">Delayed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isHighContrast ? 'text-black' : 'text-gray-700 dark:text-slate-300'
                  }`}>Priority</label>
                  <select
                    value={filterOptions.priority}
                    onChange={(e) => setFilterOptions(prev => ({ ...prev, priority: e.target.value as FilterOptions['priority'] }))}
                    className={`block w-full px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                      isHighContrast 
                        ? 'bg-white text-black border-2 border-black focus:border-blue-500' 
                        : 'border border-gray-300 dark:bg-slate-800 dark:border-slate-600 dark:text-white focus:border-blue-500'
                    }`}
                  >
                    <option value="all">All Priorities</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isHighContrast ? 'text-black' : 'text-gray-700 dark:text-slate-300'
                  }`}>Service Type</label>
                  <select
                    value={filterOptions.serviceType}
                    onChange={(e) => setFilterOptions(prev => ({ ...prev, serviceType: e.target.value as FilterOptions['serviceType'] }))}
                    className={`block w-full px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                      isHighContrast 
                        ? 'bg-white text-black border-2 border-black focus:border-blue-500' 
                        : 'border border-gray-300 dark:bg-slate-800 dark:border-slate-600 dark:text-white focus:border-blue-500'
                    }`}
                  >
                    <option value="all">All Service Types</option>
                    <option value="standard">Standard</option>
                    <option value="express">Express</option>
                    <option value="overnight">Overnight</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isHighContrast ? 'text-black' : 'text-gray-700 dark:text-slate-300'
                  }`}>Date Range</label>
                  <select
                    value={filterOptions.dateRange}
                    onChange={(e) => setFilterOptions(prev => ({ ...prev, dateRange: e.target.value as FilterOptions['dateRange'] }))}
                    className={`block w-full px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                      isHighContrast 
                        ? 'bg-white text-black border-2 border-black focus:border-blue-500' 
                        : 'border border-gray-300 dark:bg-slate-800 dark:border-slate-600 dark:text-white focus:border-blue-500'
                    }`}
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">Last 7 Days</option>
                    <option value="month">Last 30 Days</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Parcels Table */}
        <div className={`rounded-lg shadow p-0 transition-all duration-300 ${
          isHighContrast 
            ? 'bg-white border-2 border-black' 
            : 'bg-white dark:bg-slate-800'
        }`}>
          <div className={`overflow-x-auto rounded-lg shadow ${
            isHighContrast ? '' : ''
          }`}>
            <table className={`min-w-full divide-y transition-all duration-300 ${
              isHighContrast 
                ? 'divide-black' 
                : 'divide-gray-200 dark:divide-slate-700'
            }`}>
              <thead>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer transition-all duration-300 ${
                    isHighContrast 
                      ? 'bg-gray-200 text-black border-b-2 border-black' 
                      : 'bg-gray-50 text-gray-500 dark:bg-slate-700 dark:text-slate-300'
                  }`} onClick={() => handleSort('trackingNumber')}>
                    <div className="flex items-center gap-1">
                      Tracking Number
                      {sortField === 'trackingNumber' && (
                        sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                      )}
                    </div>
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer transition-all duration-300 ${
                    isHighContrast 
                      ? 'bg-gray-200 text-black border-b-2 border-black' 
                      : 'bg-gray-50 text-gray-500 dark:bg-slate-700 dark:text-slate-300'
                  }`} onClick={() => handleSort('status')}>
                    <div className="flex items-center gap-1">
                      Status
                      {sortField === 'status' && (
                        sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                      )}
                    </div>
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-all duration-300 ${
                    isHighContrast 
                      ? 'bg-gray-200 text-black border-b-2 border-black' 
                      : 'bg-gray-50 text-gray-500 dark:bg-slate-700 dark:text-slate-300'
                  }`}>Current Location</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer transition-all duration-300 ${
                    isHighContrast 
                      ? 'bg-gray-200 text-black border-b-2 border-black' 
                      : 'bg-gray-50 text-gray-500 dark:bg-slate-700 dark:text-slate-300'
                  }`} onClick={() => handleSort('estimatedDelivery')}>
                    <div className="flex items-center gap-1">
                      Est. Delivery
                      {sortField === 'estimatedDelivery' && (
                        sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                      )}
                    </div>
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-all duration-300 ${
                    isHighContrast 
                      ? 'bg-gray-200 text-black border-b-2 border-black' 
                      : 'bg-gray-50 text-gray-500 dark:bg-slate-700 dark:text-slate-300'
                  }`}>Recipient</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer transition-all duration-300 ${
                    isHighContrast 
                      ? 'bg-gray-200 text-black border-b-2 border-black' 
                      : 'bg-gray-50 text-gray-500 dark:bg-slate-700 dark:text-slate-300'
                  }`} onClick={() => handleSort('priority')}>
                    <div className="flex items-center gap-1">
                      Priority
                      {sortField === 'priority' && (
                        sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                      )}
                    </div>
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-all duration-300 ${
                    isHighContrast 
                      ? 'bg-gray-200 text-black border-b-2 border-black' 
                      : 'bg-gray-50 text-gray-500 dark:bg-slate-700 dark:text-slate-300'
                  }`}>Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y transition-all duration-300 ${
                isHighContrast 
                  ? 'bg-white divide-black' 
                  : 'bg-white divide-gray-200 dark:bg-slate-800 dark:divide-slate-700'
              }`}>
                {filteredAndSortedParcels.length === 0 ? (
                  <tr>
                    <td colSpan={7} className={`px-6 py-4 whitespace-nowrap text-sm text-center py-8 ${
                      isHighContrast ? 'text-gray-600' : 'text-gray-500 dark:text-slate-400'
                    }`}>
                      No parcels found matching your criteria
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedParcels.map((parcel) => (
                    <tr key={parcel.id} className={`transition-colors ${
                      isHighContrast 
                        ? 'hover:bg-gray-100' 
                        : 'hover:bg-gray-50 dark:hover:bg-slate-700'
                    }`}>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                        isHighContrast ? 'text-blue-600' : 'text-blue-600 dark:text-blue-400'
                      }`}>
                        {parcel.trackingNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(parcel.status)}`}>
                          {getStatusIcon(parcel.status)}
                          {parcel.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                        isHighContrast ? 'text-black' : 'text-gray-900 dark:text-slate-200'
                      }`}>
                        <div className="flex items-center gap-1">
                          <MapPin className={`w-4 h-4 ${
                            isHighContrast ? 'text-gray-600' : 'text-gray-400'
                          }`} />
                          {parcel.currentLocation}
                        </div>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                        isHighContrast ? 'text-black' : 'text-gray-900 dark:text-slate-200'
                      }`}>
                        <div className="flex items-center gap-1">
                          <Calendar className={`w-4 h-4 ${
                            isHighContrast ? 'text-gray-600' : 'text-gray-400'
                          }`} />
                          {formatDate(parcel.estimatedDelivery)}
                        </div>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                        isHighContrast ? 'text-black' : 'text-gray-900 dark:text-slate-200'
                      }`}>
                        <div>
                          <div className="font-medium">{parcel.recipient.name}</div>
                          <div className={`text-sm truncate max-w-xs ${
                            isHighContrast ? 'text-gray-600' : 'text-gray-500 dark:text-slate-400'
                          }`}>
                            {parcel.recipient.address}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(parcel.priority)}`}>
                          {parcel.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openModal(parcel)}
                            className={`px-2 py-1 text-sm rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                              isHighContrast 
                                ? 'bg-blue-400 text-black border-2 border-black hover:bg-blue-300 focus:ring-blue-500' 
                                : 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800 focus:ring-blue-500'
                            }`}
                            aria-label={`View details for parcel ${parcel.trackingNumber}`}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(parcel)}
                            className={`px-2 py-1 text-sm rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                              isHighContrast 
                                ? 'bg-gray-300 text-black border-2 border-black hover:bg-gray-200 focus:ring-gray-500' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 focus:ring-gray-500'
                            }`}
                            aria-label={`Edit parcel ${parcel.trackingNumber}`}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteParcel(parcel.id)}
                            className={`px-2 py-1 text-sm rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                              isHighContrast 
                                ? 'bg-red-400 text-black border-2 border-black hover:bg-red-300 focus:ring-red-500' 
                                : 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800 focus:ring-red-500'
                            }`}
                            aria-label={`Delete parcel ${parcel.trackingNumber}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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

      {/* View Parcel Modal */}
      {isModalOpen && selectedParcel && (
        <div className={`modal-backdrop flex items-center justify-center z-50 ${
          isHighContrast ? 'bg-black bg-opacity-90' : 'bg-black bg-opacity-50'
        }`} onClick={closeAllModals} role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className={`w-full max-w-4xl max-h-[90vh] overflow-auto p-6 m-4 z-50 rounded-lg shadow-xl transition-all duration-300 ${
            isHighContrast 
              ? 'bg-white text-black border-4 border-black' 
              : 'bg-white dark:bg-slate-800 text-gray-900 dark:text-white'
          }`} onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h3 id="modal-title" className={`text-xl font-bold ${
                isHighContrast ? 'text-black' : 'text-gray-900 dark:text-white'
              }`}>
                Parcel Details - {selectedParcel.trackingNumber}
              </h3>
              <button
                onClick={closeAllModals}
                className={`transition-colors ${
                  isHighContrast 
                    ? 'text-black hover:text-gray-600' 
                    : 'text-gray-400 hover:text-gray-500 dark:hover:text-slate-300'
                }`}
                aria-label="Close modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Status and Priority */}
              <div className="flex flex-wrap gap-4">
                <span className={`inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedParcel.status)}`}>
                  {getStatusIcon(selectedParcel.status)}
                  {selectedParcel.status.replace('_', ' ')}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(selectedParcel.priority)}`}>
                  {selectedParcel.priority} priority
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  isHighContrast 
                    ? 'bg-blue-400 text-black border-2 border-black' 
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                }`}>
                  {selectedParcel.serviceType}
                </span>
              </div>

              {/* Delivery Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className={`font-semibold mb-3 flex items-center gap-2 ${
                    isHighContrast ? 'text-black' : 'text-gray-900 dark:text-white'
                  }`}>
                    <User className="w-5 h-5" />
                    Recipient Details
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Name:</strong> {selectedParcel.recipient.name}</p>
                    <p><strong>Address:</strong> {selectedParcel.recipient.address}</p>
                    <p><strong>Phone:</strong> {selectedParcel.recipient.phone}</p>
                    <p><strong>Email:</strong> {selectedParcel.recipient.email}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className={`font-semibold mb-3 flex items-center gap-2 ${
                    isHighContrast ? 'text-black' : 'text-gray-900 dark:text-white'
                  }`}>
                    <Package className="w-5 h-5" />
                    Parcel Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Weight:</strong> {selectedParcel.weight} kg</p>
                    <p><strong>Dimensions:</strong> {selectedParcel.dimensions}</p>
                    <p><strong>Service Type:</strong> {selectedParcel.serviceType}</p>
                    <p><strong>Priority:</strong> {selectedParcel.priority}</p>
                  </div>
                </div>
              </div>

              {/* Current Status */}
              <div>
                <h4 className={`font-semibold mb-3 flex items-center gap-2 ${
                  isHighContrast ? 'text-black' : 'text-gray-900 dark:text-white'
                }`}>
                  <MapPin className="w-5 h-5" />
                  Current Status
                </h4>
                <div className={`p-4 rounded-lg transition-all duration-300 ${
                  isHighContrast 
                    ? 'bg-gray-100 border-2 border-black' 
                    : 'bg-gray-50 dark:bg-slate-700'
                }`}>
                  <p className="font-medium">{selectedParcel.currentLocation}</p>
                  <p className={`text-sm ${
                    isHighContrast ? 'text-gray-600' : 'text-gray-500 dark:text-slate-400'
                  }`}>
                    Estimated Delivery: {formatDate(selectedParcel.estimatedDelivery)}
                  </p>
                  {selectedParcel.actualDelivery && (
                    <p className={`text-sm ${
                      isHighContrast ? 'text-green-600' : 'text-green-600 dark:text-green-400'
                    }`}>
                      Delivered: {formatDate(selectedParcel.actualDelivery)}
                    </p>
                  )}
                </div>
              </div>

              {/* Status History */}
              <div>
                <h4 className={`font-semibold mb-3 flex items-center gap-2 ${
                  isHighContrast ? 'text-black' : 'text-gray-900 dark:text-white'
                }`}>
                  <Clock className="w-5 h-5" />
                  Tracking History
                </h4>
                <div className="space-y-3">
                  {selectedParcel.statusHistory.map((history, index) => (
                    <div key={index} className={`flex gap-4 p-3 rounded-lg transition-all duration-300 ${
                      isHighContrast 
                        ? 'bg-gray-100 border-2 border-black' 
                        : 'bg-gray-50 dark:bg-slate-700'
                    }`}>
                      <div className="flex-shrink-0">
                        {getStatusIcon(history.status)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium capitalize">{history.status.replace('_', ' ')}</span>
                          <span className={`text-sm ${
                            isHighContrast ? 'text-gray-600' : 'text-gray-500 dark:text-slate-400'
                          }`}>
                            {formatDateTime(history.timestamp)}
                          </span>
                        </div>
                        <p className={`text-sm ${
                          isHighContrast ? 'text-gray-700' : 'text-gray-600 dark:text-slate-300'
                        }`}>{history.location}</p>
                        {history.notes && (
                          <p className={`text-sm mt-1 ${
                            isHighContrast ? 'text-gray-600' : 'text-gray-500 dark:text-slate-400'
                          }`}>{history.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => openEditModal(selectedParcel)}
                className={`px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center gap-2 ${
                  isHighContrast 
                    ? 'bg-blue-400 text-black border-2 border-black hover:bg-blue-300 focus:ring-blue-500' 
                    : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                }`}
              >
                <Edit className="w-4 h-4" />
                Edit Parcel
              </button>
              <button
                onClick={closeAllModals}
                className={`px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  isHighContrast 
                    ? 'bg-gray-300 text-black border-2 border-black hover:bg-gray-200 focus:ring-gray-500' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 focus:ring-gray-500'
                }`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Parcel Modal */}
      {isAddModalOpen && (
        <AddParcelModal onAdd={addParcel} onClose={closeAllModals} isHighContrast={isHighContrast} />
      )}

      {/* Edit Parcel Modal */}
      {isEditModalOpen && editingParcel && (
        <EditParcelModal parcel={editingParcel} onUpdate={updateParcel} onClose={closeAllModals} isHighContrast={isHighContrast} />
      )}

      {/* Footer */}
      <footer className={`border-t mt-12 transition-all duration-300 ${
        isHighContrast 
          ? 'bg-white border-black' 
          : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700'
      }`}>
        <div className="container-wide py-4">
          <p className={`text-center text-sm ${
            isHighContrast ? 'text-gray-600' : 'text-gray-500 dark:text-slate-400'
          }`}>
            Copyright © 2025 Datavtar Private Limited. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

// Add Parcel Modal Component
interface AddParcelModalProps {
  onAdd: (parcelData: Omit<Parcel, 'id' | 'trackingNumber' | 'createdAt' | 'updatedAt' | 'statusHistory'>) => void;
  onClose: () => void;
  isHighContrast: boolean;
}

const AddParcelModal: React.FC<AddParcelModalProps> = ({ onAdd, onClose, isHighContrast }) => {
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
    priority: 'medium' as 'low' | 'medium' | 'high',
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
      <div className={`w-full max-w-2xl max-h-[90vh] overflow-auto p-6 m-4 z-50 rounded-lg shadow-xl transition-all duration-300 ${
        isHighContrast 
          ? 'bg-white text-black border-4 border-black' 
          : 'bg-white dark:bg-slate-800 text-gray-900 dark:text-white'
      }`} onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4">
          <h3 id="add-modal-title" className={`text-xl font-bold ${
            isHighContrast ? 'text-black' : 'text-gray-900 dark:text-white'
          }`}>
            Add New Parcel
          </h3>
          <button
            onClick={onClose}
            className={`transition-colors ${
              isHighContrast 
                ? 'text-black hover:text-gray-600' 
                : 'text-gray-400 hover:text-gray-500 dark:hover:text-slate-300'
            }`}
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-4">
              <label className={`block text-sm font-medium mb-1 ${
                isHighContrast ? 'text-black' : 'text-gray-700 dark:text-slate-300'
              }`}>Status</label>
              <select
                value={formData.status}
                onChange={(e) => updateFormData('status', e.target.value)}
                className={`block w-full px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                  isHighContrast 
                    ? 'bg-white text-black border-2 border-black focus:border-blue-500' 
                    : 'border border-gray-300 dark:bg-slate-800 dark:border-slate-600 dark:text-white focus:border-blue-500'
                }`}
                required
              >
                <option value="pending">Pending</option>
                <option value="in_transit">In Transit</option>
                <option value="out_for_delivery">Out for Delivery</option>
                <option value="delivered">Delivered</option>
                <option value="delayed">Delayed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className={`block text-sm font-medium mb-1 ${
                isHighContrast ? 'text-black' : 'text-gray-700 dark:text-slate-300'
              }`}>Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => updateFormData('priority', e.target.value)}
                className={`block w-full px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                  isHighContrast 
                    ? 'bg-white text-black border-2 border-black focus:border-blue-500' 
                    : 'border border-gray-300 dark:bg-slate-800 dark:border-slate-600 dark:text-white focus:border-blue-500'
                }`}
                required
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-4">
              <label className={`block text-sm font-medium mb-1 ${
                isHighContrast ? 'text-black' : 'text-gray-700 dark:text-slate-300'
              }`}>Service Type</label>
              <select
                value={formData.serviceType}
                onChange={(e) => updateFormData('serviceType', e.target.value)}
                className={`block w-full px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                  isHighContrast 
                    ? 'bg-white text-black border-2 border-black focus:border-blue-500' 
                    : 'border border-gray-300 dark:bg-slate-800 dark:border-slate-600 dark:text-white focus:border-blue-500'
                }`}
                required
              >
                <option value="standard">Standard</option>
                <option value="express">Express</option>
                <option value="overnight">Overnight</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className={`block text-sm font-medium mb-1 ${
                isHighContrast ? 'text-black' : 'text-gray-700 dark:text-slate-300'
              }`}>Estimated Delivery Date</label>
              <input
                type="date"
                value={formData.estimatedDelivery}
                onChange={(e) => updateFormData('estimatedDelivery', e.target.value)}
                className={`block w-full px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                  isHighContrast 
                    ? 'bg-white text-black border-2 border-black focus:border-blue-500' 
                    : 'border border-gray-300 dark:bg-slate-800 dark:border-slate-600 dark:text-white focus:border-blue-500'
                }`}
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className={`block text-sm font-medium mb-1 ${
              isHighContrast ? 'text-black' : 'text-gray-700 dark:text-slate-300'
            }`}>Current Location</label>
            <input
              type="text"
              value={formData.currentLocation}
              onChange={(e) => updateFormData('currentLocation', e.target.value)}
              className={`block w-full px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                isHighContrast 
                  ? 'bg-white text-black border-2 border-black focus:border-blue-500' 
                  : 'border border-gray-300 dark:bg-slate-800 dark:border-slate-600 dark:text-white focus:border-blue-500'
              }`}
              placeholder="e.g., Warehouse - New York"
              required
            />
          </div>

          {/* Recipient Information */}
          <div>
            <h4 className={`font-semibold mb-3 ${
              isHighContrast ? 'text-black' : 'text-gray-900 dark:text-white'
            }`}>Recipient Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="mb-4">
                <label className={`block text-sm font-medium mb-1 ${
                  isHighContrast ? 'text-black' : 'text-gray-700 dark:text-slate-300'
                }`}>Name</label>
                <input
                  type="text"
                  value={formData.recipient.name}
                  onChange={(e) => updateFormData('recipient.name', e.target.value)}
                  className={`block w-full px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                    isHighContrast 
                      ? 'bg-white text-black border-2 border-black focus:border-blue-500' 
                      : 'border border-gray-300 dark:bg-slate-800 dark:border-slate-600 dark:text-white focus:border-blue-500'
                  }`}
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className={`block text-sm font-medium mb-1 ${
                  isHighContrast ? 'text-black' : 'text-gray-700 dark:text-slate-300'
                }`}>Phone</label>
                <input
                  type="tel"
                  value={formData.recipient.phone}
                  onChange={(e) => updateFormData('recipient.phone', e.target.value)}
                  className={`block w-full px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                    isHighContrast 
                      ? 'bg-white text-black border-2 border-black focus:border-blue-500' 
                      : 'border border-gray-300 dark:bg-slate-800 dark:border-slate-600 dark:text-white focus:border-blue-500'
                  }`}
                  required
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className={`block text-sm font-medium mb-1 ${
                isHighContrast ? 'text-black' : 'text-gray-700 dark:text-slate-300'
              }`}>Email</label>
              <input
                type="email"
                value={formData.recipient.email}
                onChange={(e) => updateFormData('recipient.email', e.target.value)}
                className={`block w-full px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                  isHighContrast 
                    ? 'bg-white text-black border-2 border-black focus:border-blue-500' 
                    : 'border border-gray-300 dark:bg-slate-800 dark:border-slate-600 dark:text-white focus:border-blue-500'
                }`}
                required
              />
            </div>
            
            <div className="mb-4">
              <label className={`block text-sm font-medium mb-1 ${
                isHighContrast ? 'text-black' : 'text-gray-700 dark:text-slate-300'
              }`}>Address</label>
              <textarea
                value={formData.recipient.address}
                onChange={(e) => updateFormData('recipient.address', e.target.value)}
                className={`block w-full px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
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
          <div>
            <h4 className={`font-semibold mb-3 ${
              isHighContrast ? 'text-black' : 'text-gray-900 dark:text-white'
            }`}>Sender Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="mb-4">
                <label className={`block text-sm font-medium mb-1 ${
                  isHighContrast ? 'text-black' : 'text-gray-700 dark:text-slate-300'
                }`}>Name</label>
                <input
                  type="text"
                  value={formData.sender.name}
                  onChange={(e) => updateFormData('sender.name', e.target.value)}
                  className={`block w-full px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                    isHighContrast 
                      ? 'bg-white text-black border-2 border-black focus:border-blue-500' 
                      : 'border border-gray-300 dark:bg-slate-800 dark:border-slate-600 dark:text-white focus:border-blue-500'
                  }`}
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className={`block text-sm font-medium mb-1 ${
                  isHighContrast ? 'text-black' : 'text-gray-700 dark:text-slate-300'
                }`}>Address</label>
                <input
                  type="text"
                  value={formData.sender.address}
                  onChange={(e) => updateFormData('sender.address', e.target.value)}
                  className={`block w-full px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                    isHighContrast 
                      ? 'bg-white text-black border-2 border-black focus:border-blue-500' 
                      : 'border border-gray-300 dark:bg-slate-800 dark:border-slate-600 dark:text-white focus:border-blue-500'
                  }`}
                  required
                />
              </div>
            </div>
          </div>

          {/* Package Details */}
          <div>
            <h4 className={`font-semibold mb-3 ${
              isHighContrast ? 'text-black' : 'text-gray-900 dark:text-white'
            }`}>Package Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="mb-4">
                <label className={`block text-sm font-medium mb-1 ${
                  isHighContrast ? 'text-black' : 'text-gray-700 dark:text-slate-300'
                }`}>Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.weight}
                  onChange={(e) => updateFormData('weight', parseFloat(e.target.value) || 0)}
                  className={`block w-full px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                    isHighContrast 
                      ? 'bg-white text-black border-2 border-black focus:border-blue-500' 
                      : 'border border-gray-300 dark:bg-slate-800 dark:border-slate-600 dark:text-white focus:border-blue-500'
                  }`}
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className={`block text-sm font-medium mb-1 ${
                  isHighContrast ? 'text-black' : 'text-gray-700 dark:text-slate-300'
                }`}>Dimensions</label>
                <input
                  type="text"
                  value={formData.dimensions}
                  onChange={(e) => updateFormData('dimensions', e.target.value)}
                  className={`block w-full px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
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
          
          <div className="flex justify-end gap-2 mt-6">
            <button
              type="submit"
              className={`px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isHighContrast 
                  ? 'bg-blue-400 text-black border-2 border-black hover:bg-blue-300 focus:ring-blue-500' 
                  : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
              }`}
            >
              Add Parcel
            </button>
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isHighContrast 
                  ? 'bg-gray-300 text-black border-2 border-black hover:bg-gray-200 focus:ring-gray-500' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 focus:ring-gray-500'
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
}

const EditParcelModal: React.FC<EditParcelModalProps> = ({ parcel, onUpdate, onClose, isHighContrast }) => {
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
      <div className={`w-full max-w-md max-h-[90vh] overflow-auto p-6 m-4 z-50 rounded-lg shadow-xl transition-all duration-300 ${
        isHighContrast 
          ? 'bg-white text-black border-4 border-black' 
          : 'bg-white dark:bg-slate-800 text-gray-900 dark:text-white'
      }`} onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4">
          <h3 id="edit-modal-title" className={`text-xl font-bold ${
            isHighContrast ? 'text-black' : 'text-gray-900 dark:text-white'
          }`}>
            Edit Parcel - {parcel.trackingNumber}
          </h3>
          <button
            onClick={onClose}
            className={`transition-colors ${
              isHighContrast 
                ? 'text-black hover:text-gray-600' 
                : 'text-gray-400 hover:text-gray-500 dark:hover:text-slate-300'
            }`}
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-4">
              <label className={`block text-sm font-medium mb-1 ${
                isHighContrast ? 'text-black' : 'text-gray-700 dark:text-slate-300'
              }`}>Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as ParcelStatus }))}
                className={`block w-full px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                  isHighContrast 
                    ? 'bg-white text-black border-2 border-black focus:border-blue-500' 
                    : 'border border-gray-300 dark:bg-slate-800 dark:border-slate-600 dark:text-white focus:border-blue-500'
                }`}
                required
              >
                <option value="pending">Pending</option>
                <option value="in_transit">In Transit</option>
                <option value="out_for_delivery">Out for Delivery</option>
                <option value="delivered">Delivered</option>
                <option value="delayed">Delayed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className={`block text-sm font-medium mb-1 ${
                isHighContrast ? 'text-black' : 'text-gray-700 dark:text-slate-300'
              }`}>Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' }))}
                className={`block w-full px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                  isHighContrast 
                    ? 'bg-white text-black border-2 border-black focus:border-blue-500' 
                    : 'border border-gray-300 dark:bg-slate-800 dark:border-slate-600 dark:text-white focus:border-blue-500'
                }`}
                required
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-4">
              <label className={`block text-sm font-medium mb-1 ${
                isHighContrast ? 'text-black' : 'text-gray-700 dark:text-slate-300'
              }`}>Service Type</label>
              <select
                value={formData.serviceType}
                onChange={(e) => setFormData(prev => ({ ...prev, serviceType: e.target.value as 'standard' | 'express' | 'overnight' }))}
                className={`block w-full px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                  isHighContrast 
                    ? 'bg-white text-black border-2 border-black focus:border-blue-500' 
                    : 'border border-gray-300 dark:bg-slate-800 dark:border-slate-600 dark:text-white focus:border-blue-500'
                }`}
                required
              >
                <option value="standard">Standard</option>
                <option value="express">Express</option>
                <option value="overnight">Overnight</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className={`block text-sm font-medium mb-1 ${
                isHighContrast ? 'text-black' : 'text-gray-700 dark:text-slate-300'
              }`}>Estimated Delivery Date</label>
              <input
                type="date"
                value={formData.estimatedDelivery}
                onChange={(e) => setFormData(prev => ({ ...prev, estimatedDelivery: e.target.value }))}
                className={`block w-full px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                  isHighContrast 
                    ? 'bg-white text-black border-2 border-black focus:border-blue-500' 
                    : 'border border-gray-300 dark:bg-slate-800 dark:border-slate-600 dark:text-white focus:border-blue-500'
                }`}
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className={`block text-sm font-medium mb-1 ${
              isHighContrast ? 'text-black' : 'text-gray-700 dark:text-slate-300'
            }`}>Current Location</label>
            <input
              type="text"
              value={formData.currentLocation}
              onChange={(e) => setFormData(prev => ({ ...prev, currentLocation: e.target.value }))}
              className={`block w-full px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                isHighContrast 
                  ? 'bg-white text-black border-2 border-black focus:border-blue-500' 
                  : 'border border-gray-300 dark:bg-slate-800 dark:border-slate-600 dark:text-white focus:border-blue-500'
              }`}
              placeholder="e.g., Warehouse - New York"
              required
            />
          </div>
          
          <div className="flex justify-end gap-2 mt-6">
            <button
              type="submit"
              className={`px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isHighContrast 
                  ? 'bg-blue-400 text-black border-2 border-black hover:bg-blue-300 focus:ring-blue-500' 
                  : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
              }`}
            >
              Update Parcel
            </button>
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isHighContrast 
                  ? 'bg-gray-300 text-black border-2 border-black hover:bg-gray-200 focus:ring-gray-500' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 focus:ring-gray-500'
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