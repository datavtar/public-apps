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
      pending: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg',
      in_transit: 'bg-gradient-to-r from-blue-400 to-purple-500 text-white shadow-lg',
      out_for_delivery: 'bg-gradient-to-r from-purple-400 to-pink-500 text-white shadow-lg',
      delivered: 'bg-gradient-to-r from-green-400 to-teal-500 text-white shadow-lg',
      delayed: 'bg-gradient-to-r from-red-400 to-pink-500 text-white shadow-lg',
      cancelled: 'bg-gradient-to-r from-gray-400 to-gray-600 text-white shadow-lg'
    };
    return colors[status] || colors.pending;
  };

  const getStatusIcon = (status: ParcelStatus) => {
    const iconClass = isHighContrast ? 'w-4 h-4' : 'w-4 h-4 text-white drop-shadow-sm';
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
      low: 'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-md',
      medium: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-md',
      high: 'bg-gradient-to-r from-red-400 to-pink-500 text-white shadow-md'
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
        : 'bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:bg-slate-900 text-gray-900 dark:text-white'
    }`}>
      {/* Header */}
      <header className={`shadow-lg border-b-4 transition-all duration-300 ${
        isHighContrast 
          ? 'bg-black border-white' 
          : 'bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 border-rainbow'
      }`}>
        <div className="container-wide py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${
                isHighContrast 
                  ? 'bg-white' 
                  : 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg transform rotate-12 hover:rotate-0 transition-transform duration-300'
              }`}>
                <Package className={`w-10 h-10 ${
                  isHighContrast ? 'text-black' : 'text-white drop-shadow-md'
                }`} />
              </div>
              <div>
                <h1 className={`text-3xl font-bold ${
                  isHighContrast ? 'text-white' : 'text-white drop-shadow-lg'
                }`}>🎉 ACME ParcelTracker Pro</h1>
                <p className={`text-lg ${
                  isHighContrast ? 'text-gray-300' : 'text-purple-100 drop-shadow-md'
                }`}>✨ Vibrant Logistics Management System</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Notifications */}
              {notifications.length > 0 && (
                <div className="relative">
                  <div className={`p-2 rounded-full ${
                    isHighContrast 
                      ? 'bg-red-500' 
                      : 'bg-gradient-to-r from-red-400 to-pink-500 shadow-lg animate-bounce'
                  }`}>
                    <Bell className="w-6 h-6 text-white animate-pulse" />
                  </div>
                  <span className={`absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center text-xs font-bold rounded-full ${
                    isHighContrast 
                      ? 'bg-yellow-400 text-black border-2 border-white' 
                      : 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg animate-pulse'
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
                  className={`p-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
                    isHighContrast 
                      ? 'bg-white text-black hover:bg-gray-300 border-2 border-white' 
                      : 'bg-gradient-to-r from-green-400 to-blue-500 text-white hover:from-green-500 hover:to-blue-600 shadow-lg'
                  }`}
                  aria-label="Theme settings"
                >
                  <Settings className="w-6 h-6" />
                </button>
                
                {showThemeSettings && (
                  <div className={`absolute right-0 mt-2 w-72 rounded-xl shadow-2xl z-50 border-4 overflow-hidden ${
                    isHighContrast 
                      ? 'bg-black border-white' 
                      : 'bg-gradient-to-br from-white to-purple-50 border-purple-300 dark:bg-slate-800 dark:border-slate-600'
                  }`}>
                    <div className="p-6 space-y-6">
                      <h3 className={`font-bold text-lg flex items-center gap-2 ${
                        isHighContrast ? 'text-white' : 'text-purple-700 dark:text-white'
                      }`}>
                        <Settings className="w-5 h-5" />
                        🎨 Display Settings
                      </h3>
                      
                      {/* Dark Mode Toggle */}
                      <div className="flex items-center justify-between">
                        <div>
                          <span className={`text-sm font-medium ${
                            isHighContrast ? 'text-white' : 'text-gray-700 dark:text-slate-300'
                          }`}>🌙 Dark Mode</span>
                          <div className={`text-xs mt-1 ${
                            isHighContrast ? 'text-gray-300' : 'text-gray-500 dark:text-slate-400'
                          }`}>Switch to dark theme</div>
                        </div>
                        <button
                          onClick={() => setIsDarkMode(!isDarkMode)}
                          className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300 transform hover:scale-105 ${
                            isDarkMode 
                              ? (isHighContrast ? 'bg-white' : 'bg-gradient-to-r from-purple-500 to-blue-600 shadow-lg') 
                              : (isHighContrast ? 'bg-gray-600' : 'bg-gradient-to-r from-gray-300 to-gray-400')
                          }`}
                          aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                        >
                          <span className={`inline-block h-6 w-6 transform rounded-full transition-all duration-300 shadow-lg ${
                            isDarkMode 
                              ? (isHighContrast ? 'translate-x-7 bg-black' : 'translate-x-7 bg-white') 
                              : (isHighContrast ? 'translate-x-1 bg-white' : 'translate-x-1 bg-yellow-400')
                          }`} />
                        </button>
                      </div>
                      
                      {/* High Contrast Toggle */}
                      <div className="flex items-center justify-between">
                        <div>
                          <span className={`text-sm font-medium ${
                            isHighContrast ? 'text-white' : 'text-gray-700 dark:text-slate-300'
                          }`}>⚡ High Contrast</span>
                          <div className={`text-xs mt-1 ${
                            isHighContrast ? 'text-gray-300' : 'text-gray-500 dark:text-slate-400'
                          }`}>Enhanced visibility</div>
                        </div>
                        <button
                          onClick={() => setIsHighContrast(!isHighContrast)}
                          className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-yellow-300 transform hover:scale-105 border-2 ${
                            isHighContrast 
                              ? 'bg-white border-white' 
                              : 'bg-gradient-to-r from-yellow-400 to-orange-500 border-yellow-400 shadow-lg'
                          }`}
                          aria-label={isHighContrast ? 'Disable high contrast' : 'Enable high contrast'}
                        >
                          <span className={`inline-block h-5 w-5 transform rounded-full transition-all duration-300 border shadow-md ${
                            isHighContrast 
                              ? 'translate-x-7 bg-black border-black' 
                              : 'translate-x-1 bg-white border-gray-300'
                          }`} />
                        </button>
                      </div>
                      
                      <div className={`pt-4 border-t-2 text-xs flex items-center gap-2 ${
                        isHighContrast 
                          ? 'border-white text-gray-300' 
                          : 'border-purple-200 text-purple-600 dark:border-slate-600 dark:text-slate-400'
                      }`}>
                        <AlertTriangle className="w-4 h-4" />
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
        <div className="container-wide py-4">
          {notifications.map((notification, index) => (
            <div key={index} className={`flex items-center gap-3 p-4 rounded-xl mb-3 shadow-lg transition-all duration-300 hover:scale-[1.02] ${
              isHighContrast 
                ? 'bg-yellow-400 text-black border-2 border-black' 
                : 'bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 text-white'
            }`}>
              <div className={`p-2 rounded-full ${
                isHighContrast ? 'bg-black' : 'bg-white bg-opacity-20'
              }`}>
                <AlertTriangle className={`w-5 h-5 ${
                  isHighContrast ? 'text-yellow-400' : 'text-white'
                }`} />
              </div>
              <p className="flex-1 font-medium">{notification}</p>
              <button
                onClick={() => clearNotification(index)}
                className={`p-2 rounded-full transition-all duration-300 hover:scale-110 ${
                  isHighContrast 
                    ? 'text-black hover:bg-gray-200' 
                    : 'text-white hover:bg-white hover:bg-opacity-20'
                }`}
                aria-label="Dismiss notification"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Stats Dashboard */}
      <div className="container-wide py-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-8">
          {[
            { title: 'Total Parcels', value: stats.total, color: 'from-purple-400 to-pink-500', icon: Package },
            { title: 'Delivered', value: stats.delivered, color: 'from-green-400 to-teal-500', icon: CheckCircle },
            { title: 'In Transit', value: stats.inTransit, color: 'from-blue-400 to-indigo-500', icon: Truck },
            { title: 'Delayed', value: stats.delayed, color: 'from-red-400 to-pink-500', icon: AlertTriangle },
            { title: 'Pending', value: stats.pending, color: 'from-yellow-400 to-orange-500', icon: Clock }
          ].map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className={`p-6 rounded-2xl shadow-xl transition-all duration-300 transform hover:scale-105 hover:rotate-1 ${
                isHighContrast 
                  ? 'bg-white text-black border-4 border-black' 
                  : `bg-gradient-to-br ${stat.color}`
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-3 rounded-xl ${
                    isHighContrast 
                      ? 'bg-gray-200' 
                      : 'bg-white bg-opacity-20 backdrop-blur-sm'
                  }`}>
                    <IconComponent className={`w-6 h-6 ${
                      isHighContrast ? 'text-gray-700' : 'text-white'
                    }`} />
                  </div>
                </div>
                <div className={`text-sm font-semibold mb-1 ${
                  isHighContrast ? 'text-gray-700' : 'text-white text-opacity-90'
                }`}>{stat.title}</div>
                <div className={`text-3xl font-bold ${
                  isHighContrast ? 'text-black' : 'text-white'
                }`}>{stat.value}</div>
              </div>
            );
          })}
        </div>

        {/* Controls */}
        <div className={`p-8 rounded-2xl shadow-xl mb-8 transition-all duration-300 ${
          isHighContrast 
            ? 'bg-white text-black border-4 border-black' 
            : 'bg-gradient-to-br from-white to-purple-50 dark:bg-slate-800 dark:text-white backdrop-blur-sm'
        }`}>
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 p-1 rounded-lg ${
                isHighContrast 
                  ? 'bg-gray-200' 
                  : 'bg-gradient-to-r from-purple-400 to-pink-500'
              }`}>
                <Search className={`w-4 h-4 ${
                  isHighContrast ? 'text-gray-600' : 'text-white'
                }`} />
              </div>
              <input
                type="text"
                placeholder="🔍 Search by tracking number, recipient, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`block w-full pl-14 pr-4 py-4 rounded-xl shadow-lg focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all duration-300 text-lg ${
                  isHighContrast 
                    ? 'bg-white text-black border-4 border-black focus:border-blue-500' 
                    : 'border-2 border-purple-200 dark:bg-slate-800 dark:border-slate-600 dark:text-white focus:border-purple-500 bg-white'
                }`}
              />
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-offset-2 flex items-center gap-3 transform hover:scale-105 shadow-lg ${
                  isHighContrast 
                    ? 'bg-gray-200 text-black border-2 border-black hover:bg-gray-300 focus:ring-blue-500' 
                    : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 focus:ring-purple-500'
                }`}
              >
                <div className={`p-1 rounded-lg ${
                  isHighContrast ? 'bg-white' : 'bg-white bg-opacity-20'
                }`}>
                  <Filter className="w-4 h-4" />
                </div>
                🎛️ Filters
                {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              <button
                onClick={exportToCSV}
                className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-offset-2 flex items-center gap-3 transform hover:scale-105 shadow-lg ${
                  isHighContrast 
                    ? 'bg-green-400 text-black border-2 border-black hover:bg-green-300 focus:ring-green-500' 
                    : 'bg-gradient-to-r from-green-500 to-teal-600 text-white hover:from-green-600 hover:to-teal-700 focus:ring-green-500'
                }`}
              >
                <div className={`p-1 rounded-lg ${
                  isHighContrast ? 'bg-white' : 'bg-white bg-opacity-20'
                }`}>
                  <Download className="w-4 h-4" />
                </div>
                📊 Export
              </button>
              <button
                onClick={openAddModal}
                className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-offset-2 flex items-center gap-3 transform hover:scale-105 shadow-lg ${
                  isHighContrast 
                    ? 'bg-blue-400 text-black border-2 border-black hover:bg-blue-300 focus:ring-blue-500' 
                    : 'bg-gradient-to-r from-pink-500 to-rose-600 text-white hover:from-pink-600 hover:to-rose-700 focus:ring-pink-500'
                }`}
              >
                <div className={`p-1 rounded-lg ${
                  isHighContrast ? 'bg-white' : 'bg-white bg-opacity-20'
                }`}>
                  <Plus className="w-4 h-4" />
                </div>
                ➕ Add Parcel
              </button>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className={`mt-6 pt-6 border-t-4 transition-all duration-300 ${
              isHighContrast ? 'border-black' : 'border-purple-200 dark:border-slate-600'
            }`}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: '📋 Status', value: filterOptions.status, options: [
                    { value: 'all', label: 'All Statuses' },
                    { value: 'pending', label: '⏳ Pending' },
                    { value: 'in_transit', label: '🚛 In Transit' },
                    { value: 'out_for_delivery', label: '📍 Out for Delivery' },
                    { value: 'delivered', label: '✅ Delivered' },
                    { value: 'delayed', label: '⚠️ Delayed' },
                    { value: 'cancelled', label: '❌ Cancelled' }
                  ], onChange: (value: string) => setFilterOptions(prev => ({ ...prev, status: value as FilterOptions['status'] })) },
                  { label: '⭐ Priority', value: filterOptions.priority, options: [
                    { value: 'all', label: 'All Priorities' },
                    { value: 'low', label: '🟢 Low' },
                    { value: 'medium', label: '🟡 Medium' },
                    { value: 'high', label: '🔴 High' }
                  ], onChange: (value: string) => setFilterOptions(prev => ({ ...prev, priority: value as FilterOptions['priority'] })) },
                  { label: '🚀 Service Type', value: filterOptions.serviceType, options: [
                    { value: 'all', label: 'All Service Types' },
                    { value: 'standard', label: '📦 Standard' },
                    { value: 'express', label: '⚡ Express' },
                    { value: 'overnight', label: '🌙 Overnight' }
                  ], onChange: (value: string) => setFilterOptions(prev => ({ ...prev, serviceType: value as FilterOptions['serviceType'] })) },
                  { label: '📅 Date Range', value: filterOptions.dateRange, options: [
                    { value: 'all', label: 'All Time' },
                    { value: 'today', label: '📅 Today' },
                    { value: 'week', label: '📆 Last 7 Days' },
                    { value: 'month', label: '🗓️ Last 30 Days' }
                  ], onChange: (value: string) => setFilterOptions(prev => ({ ...prev, dateRange: value as FilterOptions['dateRange'] })) }
                ].map((filter, index) => (
                  <div key={index}>
                    <label className={`block text-sm font-bold mb-2 ${
                      isHighContrast ? 'text-black' : 'text-purple-700 dark:text-slate-300'
                    }`}>{filter.label}</label>
                    <select
                      value={filter.value}
                      onChange={(e) => filter.onChange(e.target.value)}
                      className={`block w-full px-4 py-3 rounded-xl shadow-lg focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all duration-300 font-medium ${
                        isHighContrast 
                          ? 'bg-white text-black border-2 border-black focus:border-blue-500' 
                          : 'border-2 border-purple-200 dark:bg-slate-800 dark:border-slate-600 dark:text-white focus:border-purple-500 bg-white'
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
        <div className={`rounded-2xl shadow-2xl p-0 transition-all duration-300 overflow-hidden ${
          isHighContrast 
            ? 'bg-white border-4 border-black' 
            : 'bg-gradient-to-br from-white to-purple-50 dark:bg-slate-800 backdrop-blur-sm'
        }`}>
          <div className="overflow-x-auto">
            <table className={`min-w-full divide-y-4 transition-all duration-300 ${
              isHighContrast 
                ? 'divide-black' 
                : 'divide-purple-200 dark:divide-slate-700'
            }`}>
              <thead>
                <tr>
                  {[
                    { field: 'trackingNumber', label: '📦 Tracking Number', sortable: true },
                    { field: 'status', label: '📊 Status', sortable: true },
                    { field: null, label: '📍 Current Location', sortable: false },
                    { field: 'estimatedDelivery', label: '📅 Est. Delivery', sortable: true },
                    { field: null, label: '👤 Recipient', sortable: false },
                    { field: 'priority', label: '⭐ Priority', sortable: true },
                    { field: null, label: '⚡ Actions', sortable: false }
                  ].map((header, index) => (
                    <th key={index} className={`px-8 py-6 text-left text-sm font-bold uppercase tracking-wider transition-all duration-300 ${
                      header.sortable ? 'cursor-pointer hover:bg-opacity-70' : ''
                    } ${
                      isHighContrast 
                        ? 'bg-gray-200 text-black border-b-4 border-black' 
                        : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    }`} onClick={header.sortable ? () => handleSort(header.field as SortField) : undefined}>
                      <div className="flex items-center gap-2">
                        {header.label}
                        {header.sortable && sortField === header.field && (
                          <div className={`p-1 rounded-lg ${
                            isHighContrast ? 'bg-white' : 'bg-white bg-opacity-20'
                          }`}>
                            {sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                          </div>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y-2 transition-all duration-300 ${
                isHighContrast 
                  ? 'bg-white divide-black' 
                  : 'bg-white divide-purple-100 dark:bg-slate-800 dark:divide-slate-700'
              }`}>
                {filteredAndSortedParcels.length === 0 ? (
                  <tr>
                    <td colSpan={7} className={`px-8 py-12 whitespace-nowrap text-lg text-center ${
                      isHighContrast ? 'text-gray-600' : 'text-purple-500 dark:text-slate-400'
                    }`}>
                      <div className="flex flex-col items-center gap-4">
                        <Package className="w-16 h-16 text-purple-300" />
                        <div>
                          <div className="font-bold">🔍 No parcels found</div>
                          <div className="text-sm">Try adjusting your search or filter criteria</div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedParcels.map((parcel) => (
                    <tr key={parcel.id} className={`transition-all duration-300 hover:shadow-lg ${
                      isHighContrast 
                        ? 'hover:bg-gray-100' 
                        : 'hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:bg-slate-700'
                    }`}>
                      <td className={`px-8 py-6 whitespace-nowrap text-sm font-bold ${
                        isHighContrast ? 'text-blue-600' : 'text-purple-600 dark:text-purple-400'
                      }`}>
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-lg ${
                            isHighContrast ? 'bg-blue-100' : 'bg-gradient-to-r from-purple-400 to-pink-500'
                          }`}>
                            <Package className={`w-4 h-4 ${
                              isHighContrast ? 'text-blue-600' : 'text-white'
                            }`} />
                          </div>
                          {parcel.trackingNumber}
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-sm">
                        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold ${getStatusColor(parcel.status)}`}>
                          {getStatusIcon(parcel.status)}
                          {parcel.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className={`px-8 py-6 whitespace-nowrap text-sm font-medium ${
                        isHighContrast ? 'text-black' : 'text-gray-900 dark:text-slate-200'
                      }`}>
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            isHighContrast ? 'bg-gray-200' : 'bg-gradient-to-r from-blue-400 to-teal-500'
                          }`}>
                            <MapPin className={`w-4 h-4 ${
                              isHighContrast ? 'text-gray-600' : 'text-white'
                            }`} />
                          </div>
                          <div>
                            <div className="font-semibold">{parcel.currentLocation}</div>
                          </div>
                        </div>
                      </td>
                      <td className={`px-8 py-6 whitespace-nowrap text-sm font-medium ${
                        isHighContrast ? 'text-black' : 'text-gray-900 dark:text-slate-200'
                      }`}>
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            isHighContrast ? 'bg-gray-200' : 'bg-gradient-to-r from-yellow-400 to-orange-500'
                          }`}>
                            <Calendar className={`w-4 h-4 ${
                              isHighContrast ? 'text-gray-600' : 'text-white'
                            }`} />
                          </div>
                          <div>
                            <div className="font-semibold">{formatDate(parcel.estimatedDelivery)}</div>
                          </div>
                        </div>
                      </td>
                      <td className={`px-8 py-6 whitespace-nowrap text-sm font-medium ${
                        isHighContrast ? 'text-black' : 'text-gray-900 dark:text-slate-200'
                      }`}>
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            isHighContrast ? 'bg-gray-200' : 'bg-gradient-to-r from-green-400 to-teal-500'
                          }`}>
                            <User className={`w-4 h-4 ${
                              isHighContrast ? 'text-gray-600' : 'text-white'
                            }`} />
                          </div>
                          <div>
                            <div className="font-bold">{parcel.recipient.name}</div>
                            <div className={`text-xs truncate max-w-xs ${
                              isHighContrast ? 'text-gray-600' : 'text-gray-500 dark:text-slate-400'
                            }`}>
                              📍 {parcel.recipient.address}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-sm">
                        <span className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold ${getPriorityColor(parcel.priority)}`}>
                          {parcel.priority.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          {[
                            { onClick: () => openModal(parcel), color: 'from-blue-400 to-purple-500', icon: Eye, label: 'View details' },
                            { onClick: () => openEditModal(parcel), color: 'from-yellow-400 to-orange-500', icon: Edit, label: 'Edit parcel' },
                            { onClick: () => deleteParcel(parcel.id), color: 'from-red-400 to-pink-500', icon: Trash2, label: 'Delete parcel' }
                          ].map((action, index) => {
                            const IconComponent = action.icon;
                            return (
                              <button
                                key={index}
                                onClick={action.onClick}
                                className={`p-3 text-sm rounded-xl font-bold transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-offset-2 transform hover:scale-110 shadow-lg ${
                                  isHighContrast 
                                    ? index === 0 ? 'bg-blue-400 text-black border-2 border-black hover:bg-blue-300 focus:ring-blue-500' :
                                      index === 1 ? 'bg-gray-300 text-black border-2 border-black hover:bg-gray-200 focus:ring-gray-500' :
                                      'bg-red-400 text-black border-2 border-black hover:bg-red-300 focus:ring-red-500'
                                    : `bg-gradient-to-r ${action.color} text-white hover:shadow-xl focus:ring-purple-500`
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

      {/* View Parcel Modal */}
      {isModalOpen && selectedParcel && (
        <ViewParcelModal parcel={selectedParcel} onClose={closeAllModals} onEdit={openEditModal} isHighContrast={isHighContrast} />
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
      <footer className={`border-t-4 mt-16 transition-all duration-300 ${
        isHighContrast 
          ? 'bg-white border-black' 
          : 'bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 border-rainbow'
      }`}>
        <div className="container-wide py-8">
          <p className={`text-center text-lg font-semibold ${
            isHighContrast ? 'text-gray-600' : 'text-white drop-shadow-lg'
          }`}>
            ✨ Copyright © 2025 Datavtar Private Limited. All rights reserved. 🎉
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
}

const ViewParcelModal: React.FC<ViewParcelModalProps> = ({ parcel, onClose, onEdit, isHighContrast }) => {
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
      pending: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg',
      in_transit: 'bg-gradient-to-r from-blue-400 to-purple-500 text-white shadow-lg',
      out_for_delivery: 'bg-gradient-to-r from-purple-400 to-pink-500 text-white shadow-lg',
      delivered: 'bg-gradient-to-r from-green-400 to-teal-500 text-white shadow-lg',
      delayed: 'bg-gradient-to-r from-red-400 to-pink-500 text-white shadow-lg',
      cancelled: 'bg-gradient-to-r from-gray-400 to-gray-600 text-white shadow-lg'
    };
    return colors[status] || colors.pending;
  };

  const getStatusIcon = (status: ParcelStatus) => {
    const iconClass = isHighContrast ? 'w-5 h-5' : 'w-5 h-5 text-white drop-shadow-sm';
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
      low: 'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-md',
      medium: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-md',
      high: 'bg-gradient-to-r from-red-400 to-pink-500 text-white shadow-md'
    };
    return colors[priority as keyof typeof colors] || colors.low;
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
      <div className={`w-full max-w-5xl max-h-[90vh] overflow-auto p-8 m-4 z-50 rounded-2xl shadow-2xl transition-all duration-300 ${
        isHighContrast 
          ? 'bg-white text-black border-4 border-black' 
          : 'bg-gradient-to-br from-white to-purple-50 dark:bg-slate-800 text-gray-900 dark:text-white'
      }`} onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-2xl ${
              isHighContrast ? 'bg-blue-100' : 'bg-gradient-to-r from-purple-500 to-pink-500'
            }`}>
              <Package className={`w-8 h-8 ${
                isHighContrast ? 'text-blue-600' : 'text-white'
              }`} />
            </div>
            <div>
              <h3 id="modal-title" className={`text-2xl font-bold ${
                isHighContrast ? 'text-black' : 'text-purple-700 dark:text-white'
              }`}>
                📦 Parcel Details
              </h3>
              <p className={`text-lg font-semibold ${
                isHighContrast ? 'text-blue-600' : 'text-purple-600 dark:text-purple-400'
              }`}>{parcel.trackingNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-3 rounded-xl transition-all duration-300 transform hover:scale-110 ${
              isHighContrast 
                ? 'text-black hover:bg-gray-200' 
                : 'text-gray-400 hover:text-gray-500 hover:bg-red-100 dark:hover:text-slate-300 dark:hover:bg-slate-700'
            }`}
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="space-y-8">
          {/* Status and Priority */}
          <div className="flex flex-wrap gap-4">
            <span className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl text-sm font-bold ${getStatusColor(parcel.status)}`}>
              {getStatusIcon(parcel.status)}
              🏷️ {parcel.status.replace('_', ' ').toUpperCase()}
            </span>
            <span className={`inline-flex items-center px-6 py-3 rounded-2xl text-sm font-bold ${getPriorityColor(parcel.priority)}`}>
              ⭐ {parcel.priority.toUpperCase()} PRIORITY
            </span>
            <span className={`inline-flex items-center px-6 py-3 rounded-2xl text-sm font-bold ${
              isHighContrast 
                ? 'bg-blue-400 text-black border-2 border-black' 
                : 'bg-gradient-to-r from-indigo-400 to-purple-500 text-white shadow-lg'
            }`}>
              🚀 {parcel.serviceType.toUpperCase()}
            </span>
          </div>

          {/* Main Information Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className={`p-6 rounded-2xl shadow-lg transition-all duration-300 ${
              isHighContrast 
                ? 'bg-gray-100 border-2 border-black' 
                : 'bg-gradient-to-br from-blue-50 to-purple-50 dark:bg-slate-700'
            }`}>
              <h4 className={`font-bold text-lg mb-4 flex items-center gap-3 ${
                isHighContrast ? 'text-black' : 'text-purple-700 dark:text-white'
              }`}>
                <div className={`p-2 rounded-xl ${
                  isHighContrast ? 'bg-white' : 'bg-gradient-to-r from-green-400 to-teal-500'
                }`}>
                  <User className={`w-5 h-5 ${
                    isHighContrast ? 'text-gray-600' : 'text-white'
                  }`} />
                </div>
                👤 Recipient Details
              </h4>
              <div className="space-y-3 text-sm">
                <p><strong>📛 Name:</strong> {parcel.recipient.name}</p>
                <p><strong>📍 Address:</strong> {parcel.recipient.address}</p>
                <p><strong>📞 Phone:</strong> {parcel.recipient.phone}</p>
                <p><strong>📧 Email:</strong> {parcel.recipient.email}</p>
              </div>
            </div>
            
            <div className={`p-6 rounded-2xl shadow-lg transition-all duration-300 ${
              isHighContrast 
                ? 'bg-gray-100 border-2 border-black' 
                : 'bg-gradient-to-br from-purple-50 to-pink-50 dark:bg-slate-700'
            }`}>
              <h4 className={`font-bold text-lg mb-4 flex items-center gap-3 ${
                isHighContrast ? 'text-black' : 'text-purple-700 dark:text-white'
              }`}>
                <div className={`p-2 rounded-xl ${
                  isHighContrast ? 'bg-white' : 'bg-gradient-to-r from-orange-400 to-red-500'
                }`}>
                  <Package className={`w-5 h-5 ${
                    isHighContrast ? 'text-gray-600' : 'text-white'
                  }`} />
                </div>
                📦 Parcel Information
              </h4>
              <div className="space-y-3 text-sm">
                <p><strong>⚖️ Weight:</strong> {parcel.weight} kg</p>
                <p><strong>📏 Dimensions:</strong> {parcel.dimensions}</p>
                <p><strong>🚀 Service Type:</strong> {parcel.serviceType}</p>
                <p><strong>⭐ Priority:</strong> {parcel.priority}</p>
              </div>
            </div>
          </div>

          {/* Current Status */}
          <div className={`p-6 rounded-2xl shadow-lg transition-all duration-300 ${
            isHighContrast 
              ? 'bg-gray-100 border-2 border-black' 
              : 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:bg-slate-700'
          }`}>
            <h4 className={`font-bold text-lg mb-4 flex items-center gap-3 ${
              isHighContrast ? 'text-black' : 'text-purple-700 dark:text-white'
            }`}>
              <div className={`p-2 rounded-xl ${
                isHighContrast ? 'bg-white' : 'bg-gradient-to-r from-blue-400 to-teal-500'
              }`}>
                <MapPin className={`w-5 h-5 ${
                  isHighContrast ? 'text-gray-600' : 'text-white'
                }`} />
              </div>
              📍 Current Status
            </h4>
            <div className={`p-4 rounded-xl ${
              isHighContrast 
                ? 'bg-white border-2 border-gray-300' 
                : 'bg-white bg-opacity-50 backdrop-blur-sm dark:bg-slate-600'
            }`}>
              <p className="font-bold text-lg">📍 {parcel.currentLocation}</p>
              <p className={`text-sm mt-1 ${
                isHighContrast ? 'text-gray-600' : 'text-purple-600 dark:text-slate-300'
              }`}>
                📅 Estimated Delivery: {formatDate(parcel.estimatedDelivery)}
              </p>
              {parcel.actualDelivery && (
                <p className={`text-sm mt-1 font-semibold ${
                  isHighContrast ? 'text-green-600' : 'text-green-600 dark:text-green-400'
                }`}>
                  ✅ Delivered: {formatDate(parcel.actualDelivery)}
                </p>
              )}
            </div>
          </div>

          {/* Status History */}
          <div className={`p-6 rounded-2xl shadow-lg transition-all duration-300 ${
            isHighContrast 
              ? 'bg-gray-100 border-2 border-black' 
              : 'bg-gradient-to-br from-green-50 to-teal-50 dark:bg-slate-700'
          }`}>
            <h4 className={`font-bold text-lg mb-6 flex items-center gap-3 ${
              isHighContrast ? 'text-black' : 'text-purple-700 dark:text-white'
            }`}>
              <div className={`p-2 rounded-xl ${
                isHighContrast ? 'bg-white' : 'bg-gradient-to-r from-purple-400 to-pink-500'
              }`}>
                <Clock className={`w-5 h-5 ${
                  isHighContrast ? 'text-gray-600' : 'text-white'
                }`} />
              </div>
              ⏰ Tracking History
            </h4>
            <div className="space-y-4">
              {parcel.statusHistory.map((history, index) => (
                <div key={index} className={`flex gap-4 p-4 rounded-xl transition-all duration-300 hover:scale-[1.02] ${
                  isHighContrast 
                    ? 'bg-white border-2 border-gray-300' 
                    : 'bg-white bg-opacity-60 backdrop-blur-sm dark:bg-slate-600 shadow-md'
                }`}>
                  <div className={`flex-shrink-0 p-2 rounded-xl ${
                    isHighContrast ? 'bg-gray-200' : 'bg-gradient-to-r from-indigo-400 to-purple-500'
                  }`}>
                    {getStatusIcon(history.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-bold text-lg capitalize">🏷️ {history.status.replace('_', ' ')}</span>
                      <span className={`text-sm px-3 py-1 rounded-lg ${
                        isHighContrast ? 'bg-gray-200 text-gray-600' : 'bg-purple-100 text-purple-600 dark:bg-slate-500 dark:text-slate-200'
                      }`}>
                        📅 {formatDateTime(history.timestamp)}
                      </span>
                    </div>
                    <p className={`font-semibold ${
                      isHighContrast ? 'text-gray-700' : 'text-gray-700 dark:text-slate-300'
                    }`}>📍 {history.location}</p>
                    {history.notes && (
                      <p className={`text-sm mt-2 italic ${
                        isHighContrast ? 'text-gray-600' : 'text-gray-600 dark:text-slate-400'
                      }`}>💬 {history.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-4 mt-8">
          <button
            onClick={() => onEdit(parcel)}
            className={`px-8 py-4 rounded-xl font-bold transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-offset-2 flex items-center gap-3 transform hover:scale-105 shadow-lg ${
              isHighContrast 
                ? 'bg-blue-400 text-black border-2 border-black hover:bg-blue-300 focus:ring-blue-500' 
                : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 focus:ring-blue-500'
            }`}
          >
            <Edit className="w-5 h-5" />
            ✏️ Edit Parcel
          </button>
          <button
            onClick={onClose}
            className={`px-8 py-4 rounded-xl font-bold transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-offset-2 transform hover:scale-105 shadow-lg ${
              isHighContrast 
                ? 'bg-gray-300 text-black border-2 border-black hover:bg-gray-200 focus:ring-gray-500' 
                : 'bg-gradient-to-r from-gray-400 to-gray-600 text-white hover:from-gray-500 hover:to-gray-700 focus:ring-gray-500'
            }`}
          >
            ❌ Close
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
      <div className={`w-full max-w-4xl max-h-[90vh] overflow-auto p-8 m-4 z-50 rounded-2xl shadow-2xl transition-all duration-300 ${
        isHighContrast 
          ? 'bg-white text-black border-4 border-black' 
          : 'bg-gradient-to-br from-white to-purple-50 dark:bg-slate-800 text-gray-900 dark:text-white'
      }`} onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-2xl ${
              isHighContrast ? 'bg-blue-100' : 'bg-gradient-to-r from-green-500 to-teal-600'
            }`}>
              <Plus className={`w-8 h-8 ${
                isHighContrast ? 'text-blue-600' : 'text-white'
              }`} />
            </div>
            <div>
              <h3 id="add-modal-title" className={`text-2xl font-bold ${
                isHighContrast ? 'text-black' : 'text-purple-700 dark:text-white'
              }`}>
                ➕ Add New Parcel
              </h3>
              <p className={`text-lg ${
                isHighContrast ? 'text-gray-600' : 'text-purple-600 dark:text-purple-400'
              }`}>Create a new parcel entry</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-3 rounded-xl transition-all duration-300 transform hover:scale-110 ${
              isHighContrast 
                ? 'text-black hover:bg-gray-200' 
                : 'text-gray-400 hover:text-gray-500 hover:bg-red-100 dark:hover:text-slate-300 dark:hover:bg-slate-700'
            }`}
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className={`p-6 rounded-2xl shadow-lg ${
            isHighContrast 
              ? 'bg-gray-100 border-2 border-black' 
              : 'bg-gradient-to-br from-blue-50 to-purple-50 dark:bg-slate-700'
          }`}>
            <h4 className={`font-bold text-lg mb-4 flex items-center gap-3 ${
              isHighContrast ? 'text-black' : 'text-purple-700 dark:text-white'
            }`}>
              <Package className="w-5 h-5" />
              📦 Basic Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: '📊 Status', field: 'status', type: 'select', options: [
                  { value: 'pending', label: '⏳ Pending' },
                  { value: 'in_transit', label: '🚛 In Transit' },
                  { value: 'out_for_delivery', label: '📍 Out for Delivery' },
                  { value: 'delivered', label: '✅ Delivered' },
                  { value: 'delayed', label: '⚠️ Delayed' },
                  { value: 'cancelled', label: '❌ Cancelled' }
                ]},
                { label: '⭐ Priority', field: 'priority', type: 'select', options: [
                  { value: 'low', label: '🟢 Low' },
                  { value: 'medium', label: '🟡 Medium' },
                  { value: 'high', label: '🔴 High' }
                ]},
                { label: '🚀 Service Type', field: 'serviceType', type: 'select', options: [
                  { value: 'standard', label: '📦 Standard' },
                  { value: 'express', label: '⚡ Express' },
                  { value: 'overnight', label: '🌙 Overnight' }
                ]},
                { label: '📅 Estimated Delivery Date', field: 'estimatedDelivery', type: 'date' }
              ].map((field, index) => (
                <div key={index} className="mb-4">
                  <label className={`block text-sm font-bold mb-2 ${
                    isHighContrast ? 'text-black' : 'text-purple-700 dark:text-slate-300'
                  }`}>{field.label}</label>
                  {field.type === 'select' ? (
                    <select
                      value={formData[field.field as keyof typeof formData] as string}
                      onChange={(e) => updateFormData(field.field, e.target.value)}
                      className={`block w-full px-4 py-3 rounded-xl shadow-lg focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all duration-300 font-medium ${
                        isHighContrast 
                          ? 'bg-white text-black border-2 border-black focus:border-blue-500' 
                          : 'border-2 border-purple-200 dark:bg-slate-800 dark:border-slate-600 dark:text-white focus:border-purple-500 bg-white'
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
                      className={`block w-full px-4 py-3 rounded-xl shadow-lg focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all duration-300 font-medium ${
                        isHighContrast 
                          ? 'bg-white text-black border-2 border-black focus:border-blue-500' 
                          : 'border-2 border-purple-200 dark:bg-slate-800 dark:border-slate-600 dark:text-white focus:border-purple-500 bg-white'
                      }`}
                      required
                    />
                  )}
                </div>
              ))}
            </div>
            
            <div className="mb-4">
              <label className={`block text-sm font-bold mb-2 ${
                isHighContrast ? 'text-black' : 'text-purple-700 dark:text-slate-300'
              }`}>📍 Current Location</label>
              <input
                type="text"
                value={formData.currentLocation}
                onChange={(e) => updateFormData('currentLocation', e.target.value)}
                className={`block w-full px-4 py-3 rounded-xl shadow-lg focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all duration-300 font-medium ${
                  isHighContrast 
                    ? 'bg-white text-black border-2 border-black focus:border-blue-500' 
                    : 'border-2 border-purple-200 dark:bg-slate-800 dark:border-slate-600 dark:text-white focus:border-purple-500 bg-white'
                }`}
                placeholder="e.g., Warehouse - New York"
                required
              />
            </div>
          </div>

          {/* Recipient Information */}
          <div className={`p-6 rounded-2xl shadow-lg ${
            isHighContrast 
              ? 'bg-gray-100 border-2 border-black' 
              : 'bg-gradient-to-br from-green-50 to-teal-50 dark:bg-slate-700'
          }`}>
            <h4 className={`font-bold text-lg mb-4 flex items-center gap-3 ${
              isHighContrast ? 'text-black' : 'text-purple-700 dark:text-white'
            }`}>
              <User className="w-5 h-5" />
              👤 Recipient Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: '📛 Name', field: 'recipient.name', type: 'text' },
                { label: '📞 Phone', field: 'recipient.phone', type: 'tel' }
              ].map((field, index) => (
                <div key={index} className="mb-4">
                  <label className={`block text-sm font-bold mb-2 ${
                    isHighContrast ? 'text-black' : 'text-purple-700 dark:text-slate-300'
                  }`}>{field.label}</label>
                  <input
                    type={field.type}
                    value={formData.recipient[field.field.split('.')[1] as keyof typeof formData.recipient]}
                    onChange={(e) => updateFormData(field.field, e.target.value)}
                    className={`block w-full px-4 py-3 rounded-xl shadow-lg focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all duration-300 font-medium ${
                      isHighContrast 
                        ? 'bg-white text-black border-2 border-black focus:border-blue-500' 
                        : 'border-2 border-purple-200 dark:bg-slate-800 dark:border-slate-600 dark:text-white focus:border-purple-500 bg-white'
                    }`}
                    required
                  />
                </div>
              ))}
            </div>
            
            <div className="mb-4">
              <label className={`block text-sm font-bold mb-2 ${
                isHighContrast ? 'text-black' : 'text-purple-700 dark:text-slate-300'
              }`}>📧 Email</label>
              <input
                type="email"
                value={formData.recipient.email}
                onChange={(e) => updateFormData('recipient.email', e.target.value)}
                className={`block w-full px-4 py-3 rounded-xl shadow-lg focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all duration-300 font-medium ${
                  isHighContrast 
                    ? 'bg-white text-black border-2 border-black focus:border-blue-500' 
                    : 'border-2 border-purple-200 dark:bg-slate-800 dark:border-slate-600 dark:text-white focus:border-purple-500 bg-white'
                }`}
                required
              />
            </div>
            
            <div className="mb-4">
              <label className={`block text-sm font-bold mb-2 ${
                isHighContrast ? 'text-black' : 'text-purple-700 dark:text-slate-300'
              }`}>📍 Address</label>
              <textarea
                value={formData.recipient.address}
                onChange={(e) => updateFormData('recipient.address', e.target.value)}
                className={`block w-full px-4 py-3 rounded-xl shadow-lg focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all duration-300 font-medium ${
                  isHighContrast 
                    ? 'bg-white text-black border-2 border-black focus:border-blue-500' 
                    : 'border-2 border-purple-200 dark:bg-slate-800 dark:border-slate-600 dark:text-white focus:border-purple-500 bg-white'
                }`}
                rows={3}
                required
              />
            </div>
          </div>

          {/* Sender Information */}
          <div className={`p-6 rounded-2xl shadow-lg ${
            isHighContrast 
              ? 'bg-gray-100 border-2 border-black' 
              : 'bg-gradient-to-br from-orange-50 to-red-50 dark:bg-slate-700'
          }`}>
            <h4 className={`font-bold text-lg mb-4 flex items-center gap-3 ${
              isHighContrast ? 'text-black' : 'text-purple-700 dark:text-white'
            }`}>
              <Truck className="w-5 h-5" />
              🏢 Sender Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: '🏢 Name', field: 'sender.name' },
                { label: '📍 Address', field: 'sender.address' }
              ].map((field, index) => (
                <div key={index} className="mb-4">
                  <label className={`block text-sm font-bold mb-2 ${
                    isHighContrast ? 'text-black' : 'text-purple-700 dark:text-slate-300'
                  }`}>{field.label}</label>
                  <input
                    type="text"
                    value={formData.sender[field.field.split('.')[1] as keyof typeof formData.sender]}
                    onChange={(e) => updateFormData(field.field, e.target.value)}
                    className={`block w-full px-4 py-3 rounded-xl shadow-lg focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all duration-300 font-medium ${
                      isHighContrast 
                        ? 'bg-white text-black border-2 border-black focus:border-blue-500' 
                        : 'border-2 border-purple-200 dark:bg-slate-800 dark:border-slate-600 dark:text-white focus:border-purple-500 bg-white'
                    }`}
                    required
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Package Details */}
          <div className={`p-6 rounded-2xl shadow-lg ${
            isHighContrast 
              ? 'bg-gray-100 border-2 border-black' 
              : 'bg-gradient-to-br from-purple-50 to-pink-50 dark:bg-slate-700'
          }`}>
            <h4 className={`font-bold text-lg mb-4 flex items-center gap-3 ${
              isHighContrast ? 'text-black' : 'text-purple-700 dark:text-white'
            }`}>
              <Package className="w-5 h-5" />
              📏 Package Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="mb-4">
                <label className={`block text-sm font-bold mb-2 ${
                  isHighContrast ? 'text-black' : 'text-purple-700 dark:text-slate-300'
                }`}>⚖️ Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.weight}
                  onChange={(e) => updateFormData('weight', parseFloat(e.target.value) || 0)}
                  className={`block w-full px-4 py-3 rounded-xl shadow-lg focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all duration-300 font-medium ${
                    isHighContrast 
                      ? 'bg-white text-black border-2 border-black focus:border-blue-500' 
                      : 'border-2 border-purple-200 dark:bg-slate-800 dark:border-slate-600 dark:text-white focus:border-purple-500 bg-white'
                  }`}
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className={`block text-sm font-bold mb-2 ${
                  isHighContrast ? 'text-black' : 'text-purple-700 dark:text-slate-300'
                }`}>📏 Dimensions</label>
                <input
                  type="text"
                  value={formData.dimensions}
                  onChange={(e) => updateFormData('dimensions', e.target.value)}
                  className={`block w-full px-4 py-3 rounded-xl shadow-lg focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all duration-300 font-medium ${
                    isHighContrast 
                      ? 'bg-white text-black border-2 border-black focus:border-blue-500' 
                      : 'border-2 border-purple-200 dark:bg-slate-800 dark:border-slate-600 dark:text-white focus:border-purple-500 bg-white'
                  }`}
                  placeholder="e.g., 12x8x6 inches"
                  required
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-4 mt-8">
            <button
              type="submit"
              className={`px-8 py-4 rounded-xl font-bold transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-offset-2 flex items-center gap-3 transform hover:scale-105 shadow-lg ${
                isHighContrast 
                  ? 'bg-blue-400 text-black border-2 border-black hover:bg-blue-300 focus:ring-blue-500' 
                  : 'bg-gradient-to-r from-green-500 to-teal-600 text-white hover:from-green-600 hover:to-teal-700 focus:ring-green-500'
              }`}
            >
              <Plus className="w-5 h-5" />
              ➕ Add Parcel
            </button>
            <button
              type="button"
              onClick={onClose}
              className={`px-8 py-4 rounded-xl font-bold transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-offset-2 transform hover:scale-105 shadow-lg ${
                isHighContrast 
                  ? 'bg-gray-300 text-black border-2 border-black hover:bg-gray-200 focus:ring-gray-500' 
                  : 'bg-gradient-to-r from-gray-400 to-gray-600 text-white hover:from-gray-500 hover:to-gray-700 focus:ring-gray-500'
              }`}
            >
              ❌ Cancel
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
      <div className={`w-full max-w-2xl max-h-[90vh] overflow-auto p-8 m-4 z-50 rounded-2xl shadow-2xl transition-all duration-300 ${
        isHighContrast 
          ? 'bg-white text-black border-4 border-black' 
          : 'bg-gradient-to-br from-white to-purple-50 dark:bg-slate-800 text-gray-900 dark:text-white'
      }`} onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-2xl ${
              isHighContrast ? 'bg-blue-100' : 'bg-gradient-to-r from-orange-500 to-red-600'
            }`}>
              <Edit className={`w-8 h-8 ${
                isHighContrast ? 'text-blue-600' : 'text-white'
              }`} />
            </div>
            <div>
              <h3 id="edit-modal-title" className={`text-2xl font-bold ${
                isHighContrast ? 'text-black' : 'text-purple-700 dark:text-white'
              }`}>
                ✏️ Edit Parcel
              </h3>
              <p className={`text-lg font-semibold ${
                isHighContrast ? 'text-blue-600' : 'text-purple-600 dark:text-purple-400'
              }`}>{parcel.trackingNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-3 rounded-xl transition-all duration-300 transform hover:scale-110 ${
              isHighContrast 
                ? 'text-black hover:bg-gray-200' 
                : 'text-gray-400 hover:text-gray-500 hover:bg-red-100 dark:hover:text-slate-300 dark:hover:bg-slate-700'
            }`}
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className={`p-6 rounded-2xl shadow-lg ${
            isHighContrast 
              ? 'bg-gray-100 border-2 border-black' 
              : 'bg-gradient-to-br from-blue-50 to-purple-50 dark:bg-slate-700'
          }`}>
            <h4 className={`font-bold text-lg mb-4 flex items-center gap-3 ${
              isHighContrast ? 'text-black' : 'text-purple-700 dark:text-white'
            }`}>
              <Settings className="w-5 h-5" />
              📊 Update Parcel Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: '📊 Status', field: 'status', type: 'select', options: [
                  { value: 'pending', label: '⏳ Pending' },
                  { value: 'in_transit', label: '🚛 In Transit' },
                  { value: 'out_for_delivery', label: '📍 Out for Delivery' },
                  { value: 'delivered', label: '✅ Delivered' },
                  { value: 'delayed', label: '⚠️ Delayed' },
                  { value: 'cancelled', label: '❌ Cancelled' }
                ]},
                { label: '⭐ Priority', field: 'priority', type: 'select', options: [
                  { value: 'low', label: '🟢 Low' },
                  { value: 'medium', label: '🟡 Medium' },
                  { value: 'high', label: '🔴 High' }
                ]},
                { label: '🚀 Service Type', field: 'serviceType', type: 'select', options: [
                  { value: 'standard', label: '📦 Standard' },
                  { value: 'express', label: '⚡ Express' },
                  { value: 'overnight', label: '🌙 Overnight' }
                ]},
                { label: '📅 Estimated Delivery Date', field: 'estimatedDelivery', type: 'date' }
              ].map((field, index) => (
                <div key={index} className="mb-4">
                  <label className={`block text-sm font-bold mb-2 ${
                    isHighContrast ? 'text-black' : 'text-purple-700 dark:text-slate-300'
                  }`}>{field.label}</label>
                  {field.type === 'select' ? (
                    <select
                      value={formData[field.field as keyof typeof formData]}
                      onChange={(e) => setFormData(prev => ({ ...prev, [field.field]: e.target.value }))}
                      className={`block w-full px-4 py-3 rounded-xl shadow-lg focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all duration-300 font-medium ${
                        isHighContrast 
                          ? 'bg-white text-black border-2 border-black focus:border-blue-500' 
                          : 'border-2 border-purple-200 dark:bg-slate-800 dark:border-slate-600 dark:text-white focus:border-purple-500 bg-white'
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
                      className={`block w-full px-4 py-3 rounded-xl shadow-lg focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all duration-300 font-medium ${
                        isHighContrast 
                          ? 'bg-white text-black border-2 border-black focus:border-blue-500' 
                          : 'border-2 border-purple-200 dark:bg-slate-800 dark:border-slate-600 dark:text-white focus:border-purple-500 bg-white'
                      }`}
                      required
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="mb-4">
              <label className={`block text-sm font-bold mb-2 ${
                isHighContrast ? 'text-black' : 'text-purple-700 dark:text-slate-300'
              }`}>📍 Current Location</label>
              <input
                type="text"
                value={formData.currentLocation}
                onChange={(e) => setFormData(prev => ({ ...prev, currentLocation: e.target.value }))}
                className={`block w-full px-4 py-3 rounded-xl shadow-lg focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all duration-300 font-medium ${
                  isHighContrast 
                    ? 'bg-white text-black border-2 border-black focus:border-blue-500' 
                    : 'border-2 border-purple-200 dark:bg-slate-800 dark:border-slate-600 dark:text-white focus:border-purple-500 bg-white'
                }`}
                placeholder="e.g., Warehouse - New York"
                required
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-4 mt-8">
            <button
              type="submit"
              className={`px-8 py-4 rounded-xl font-bold transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-offset-2 flex items-center gap-3 transform hover:scale-105 shadow-lg ${
                isHighContrast 
                  ? 'bg-blue-400 text-black border-2 border-black hover:bg-blue-300 focus:ring-blue-500' 
                  : 'bg-gradient-to-r from-orange-500 to-red-600 text-white hover:from-orange-600 hover:to-red-700 focus:ring-orange-500'
              }`}
            >
              <Edit className="w-5 h-5" />
              💾 Update Parcel
            </button>
            <button
              type="button"
              onClick={onClose}
              className={`px-8 py-4 rounded-xl font-bold transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-offset-2 transform hover:scale-105 shadow-lg ${
                isHighContrast 
                  ? 'bg-gray-300 text-black border-2 border-black hover:bg-gray-200 focus:ring-gray-500' 
                  : 'bg-gradient-to-r from-gray-400 to-gray-600 text-white hover:from-gray-500 hover:to-gray-700 focus:ring-gray-500'
              }`}
            >
              ❌ Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default App;