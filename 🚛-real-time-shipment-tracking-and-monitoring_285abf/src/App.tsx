import React, { useState, useEffect, useCallback } from 'react';
import { 
  Package, 
  Truck, 
  MapPin, 
  Calendar, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  XCircle, X,
  BarChart3, 
  PieChart as LucidePieChart,
  Download,
  Settings,
  Bell,
  Sun,
  Moon,
  ArrowUp,
  ArrowDown,
  RefreshCw
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
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

// Types and Interfaces
type ShipmentStatus = 'pending' | 'in_transit' | 'delivered' | 'delayed' | 'cancelled';
type Priority = 'low' | 'medium' | 'high' | 'urgent';
type CarrierType = 'FedEx' | 'UPS' | 'DHL' | 'USPS' | 'Local';

interface Shipment {
  id: string;
  trackingNumber: string;
  customerName: string;
  customerEmail: string;
  origin: string;
  destination: string;
  status: ShipmentStatus;
  priority: Priority;
  carrier: CarrierType;
  estimatedDelivery: string;
  actualDelivery?: string;
  weight: number;
  cost: number;
  createdDate: string;
  lastUpdated: string;
  notes?: string;
}

interface ShipmentFormData extends Omit<Shipment, 'id' | 'createdDate' | 'lastUpdated'> {}

type FilterType = 'all' | ShipmentStatus;
type SortField = 'createdDate' | 'estimatedDelivery' | 'customerName' | 'cost' | 'weight' | 'trackingNumber';
type SortDirection = 'asc' | 'desc';

interface DashboardStats {
  totalShipments: number;
  inTransit: number;
  delivered: number;
  delayed: number;
  revenue: number;
  avgDeliveryTime: number;
}

const App: React.FC = () => {
  // State Management
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [filteredShipments, setFilteredShipments] = useState<Shipment[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<FilterType>('all');
  const [sortField, setSortField] = useState<SortField>('createdDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingShipment, setEditingShipment] = useState<Shipment | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      return savedMode === 'true' || 
        (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  const [currentView, setCurrentView] = useState<'dashboard' | 'shipments' | 'analytics'>('dashboard');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Sample Data
  const sampleShipments: Shipment[] = [
    {
      id: '1',
      trackingNumber: 'TRK001234567',
      customerName: 'John Smith',
      customerEmail: 'john.smith@email.com',
      origin: 'New York, NY',
      destination: 'Los Angeles, CA',
      status: 'in_transit',
      priority: 'high',
      carrier: 'FedEx',
      estimatedDelivery: '2025-01-20',
      weight: 15.5,
      cost: 250.00,
      createdDate: '2025-01-15',
      lastUpdated: '2025-01-17',
      notes: 'Fragile items - handle with care'
    },
    {
      id: '2',
      trackingNumber: 'TRK001234568',
      customerName: 'Sarah Johnson',
      customerEmail: 'sarah.j@email.com',
      origin: 'Chicago, IL',
      destination: 'Miami, FL',
      status: 'delivered',
      priority: 'medium',
      carrier: 'UPS',
      estimatedDelivery: '2025-01-16',
      actualDelivery: '2025-01-16',
      weight: 8.2,
      cost: 180.00,
      createdDate: '2025-01-12',
      lastUpdated: '2025-01-16'
    },
    {
      id: '3',
      trackingNumber: 'TRK001234569',
      customerName: 'Mike Wilson',
      customerEmail: 'mike.w@email.com',
      origin: 'Seattle, WA',
      destination: 'Boston, MA',
      status: 'delayed',
      priority: 'urgent',
      carrier: 'DHL',
      estimatedDelivery: '2025-01-18',
      weight: 22.1,
      cost: 420.00,
      createdDate: '2025-01-14',
      lastUpdated: '2025-01-17',
      notes: 'Weather delay - rescheduled'
    },
    {
      id: '4',
      trackingNumber: 'TRK001234570',
      customerName: 'Emily Davis',
      customerEmail: 'emily.d@email.com',
      origin: 'Phoenix, AZ',
      destination: 'Denver, CO',
      status: 'pending',
      priority: 'low',
      carrier: 'USPS',
      estimatedDelivery: '2025-01-22',
      weight: 5.8,
      cost: 95.00,
      createdDate: '2025-01-17',
      lastUpdated: '2025-01-17'
    },
    {
      id: '5',
      trackingNumber: 'TRK001234571',
      customerName: 'Robert Brown',
      customerEmail: 'robert.b@email.com',
      origin: 'Dallas, TX',
      destination: 'Atlanta, GA',
      status: 'in_transit',
      priority: 'medium',
      carrier: 'FedEx',
      estimatedDelivery: '2025-01-19',
      weight: 12.3,
      cost: 210.00,
      createdDate: '2025-01-16',
      lastUpdated: '2025-01-17'
    }
  ];

  // Load data from localStorage or use sample data
  useEffect(() => {
    try {
      setLoading(true);
      const savedShipments = localStorage.getItem('shipments');
      if (savedShipments) {
        const parsedShipments = JSON.parse(savedShipments);
        setShipments(parsedShipments);
      } else {
        setShipments(sampleShipments);
        localStorage.setItem('shipments', JSON.stringify(sampleShipments));
      }
    } catch (err) {
      setError('Failed to load shipments data');
      setShipments(sampleShipments);
    } finally {
      setLoading(false);
    }
  }, []);

  // Dark mode effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  // Filter and search effect
  useEffect(() => {
    let filtered = [...(shipments || [])];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(shipment =>
        shipment.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.destination.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(shipment => shipment.status === filterStatus);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === 'createdDate' || sortField === 'estimatedDelivery') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredShipments(filtered);
  }, [shipments, searchTerm, filterStatus, sortField, sortDirection]);

  // Save shipments to localStorage
  const saveShipments = useCallback((newShipments: Shipment[]) => {
    try {
      setShipments(newShipments);
      localStorage.setItem('shipments', JSON.stringify(newShipments));
    } catch (err) {
      setError('Failed to save shipments data');
    }
  }, []);

  // Generate dashboard statistics
  const getDashboardStats = useCallback((): DashboardStats => {
    const totalShipments = (shipments || []).length;
    const inTransit = (shipments || []).filter(s => s.status === 'in_transit').length;
    const delivered = (shipments || []).filter(s => s.status === 'delivered').length;
    const delayed = (shipments || []).filter(s => s.status === 'delayed').length;
    const revenue = (shipments || []).reduce((sum, s) => sum + s.cost, 0);
    
    // Calculate average delivery time for delivered shipments
    const deliveredShipments = (shipments || []).filter(s => s.status === 'delivered' && s.actualDelivery);
    const avgDeliveryTime = deliveredShipments.length > 0 
      ? deliveredShipments.reduce((sum, s) => {
          const created = new Date(s.createdDate).getTime();
          const deliveredTime = s.actualDelivery ? new Date(s.actualDelivery).getTime() : 0;
          return sum + (deliveredTime - created) / (1000 * 60 * 60 * 24);
        }, 0) / deliveredShipments.length
      : 0;

    return {
      totalShipments,
      inTransit,
      delivered,
      delayed,
      revenue,
      avgDeliveryTime
    };
  }, [shipments]);

  // Modal handlers
  const openModal = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setIsModalOpen(true);
    document.body.classList.add('modal-open');
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedShipment(null);
    document.body.classList.remove('modal-open');
  };

  const openForm = (shipment?: Shipment) => {
    setEditingShipment(shipment || null);
    setIsFormOpen(true);
    document.body.classList.add('modal-open');
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingShipment(null);
    document.body.classList.remove('modal-open');
  };

  // Shipment operations
  const handleSubmitShipment = (formData: ShipmentFormData) => {
    try {
      const now = new Date().toISOString().split('T')[0];
      
      if (editingShipment) {
        // Update existing shipment
        const updatedShipments = (shipments || []).map(shipment =>
          shipment.id === editingShipment.id
            ? { ...shipment, ...formData, lastUpdated: now }
            : shipment
        );
        saveShipments(updatedShipments);
      } else {
        // Create new shipment
        const newShipment: Shipment = {
          ...formData,
          id: Date.now().toString(),
          createdDate: now,
          lastUpdated: now
        };
        saveShipments([...(shipments || []), newShipment]);
      }
      closeForm();
    } catch (err) {
      setError('Failed to save shipment');
    }
  };

  const handleDeleteShipment = (id: string) => {
    try {
      const updatedShipments = (shipments || []).filter(shipment => shipment.id !== id);
      saveShipments(updatedShipments);
      closeModal();
    } catch (err) {
      setError('Failed to delete shipment');
    }
  };

  const handleUpdateStatus = (id: string, newStatus: ShipmentStatus) => {
    try {
      const now = new Date().toISOString().split('T')[0];
      const updatedShipments = (shipments || []).map(shipment =>
        shipment.id === id
          ? { 
              ...shipment, 
              status: newStatus, 
              lastUpdated: now,
              actualDelivery: newStatus === 'delivered' ? now : shipment.actualDelivery
            }
          : shipment
      );
      saveShipments(updatedShipments);
    } catch (err) {
      setError('Failed to update shipment status');
    }
  };

  // Export data as CSV
  const handleExportData = () => {
    try {
      const headers = ['Tracking Number', 'Customer', 'Origin', 'Destination', 'Status', 'Priority', 'Carrier', 'Est. Delivery', 'Weight', 'Cost'];
      const csvData = (filteredShipments || []).map(shipment => [
        shipment.trackingNumber,
        shipment.customerName,
        shipment.origin,
        shipment.destination,
        shipment.status,
        shipment.priority,
        shipment.carrier,
        shipment.estimatedDelivery,
        shipment.weight,
        shipment.cost
      ]);
      
      const csvContent = [headers, ...csvData]
        .map(row => row.map(field => `"${String(field)}"`).join(','))
        .join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `shipments_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to export data');
    }
  };

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isModalOpen) closeModal();
        if (isFormOpen) closeForm();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, isFormOpen, closeModal, closeForm]); // Added closeModal and closeForm to dependencies

  // Get status color and icon
  const getStatusInfo = (status: ShipmentStatus) => {
    switch (status) {
      case 'pending':
        return { color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200', icon: Clock };
      case 'in_transit':
        return { color: 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-200', icon: Truck };
      case 'delivered':
        return { color: 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200', icon: CheckCircle };
      case 'delayed':
        return { color: 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200', icon: AlertCircle };
      case 'cancelled':
        return { color: 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-200', icon: XCircle };
      default:
        return { color: 'text-gray-600 bg-gray-100', icon: Clock };
    }
  };

  // Get priority color
  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'low':
        return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200';
      case 'high':
        return 'text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-200';
      case 'urgent':
        return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  // Chart data preparation
  const getChartData = () => {
    const s = shipments || []; // Ensure shipments is an array
    const statusData = [
      { name: 'Pending', value: s.filter(item => item.status === 'pending').length, color: '#EAB308' },
      { name: 'In Transit', value: s.filter(item => item.status === 'in_transit').length, color: '#3B82F6' },
      { name: 'Delivered', value: s.filter(item => item.status === 'delivered').length, color: '#10B981' },
      { name: 'Delayed', value: s.filter(item => item.status === 'delayed').length, color: '#EF4444' },
      { name: 'Cancelled', value: s.filter(item => item.status === 'cancelled').length, color: '#6B7280' }
    ];

    const revenueData = [
      { month: 'Jan', revenue: 15000, shipments: 45 },
      { month: 'Feb', revenue: 18000, shipments: 52 },
      { month: 'Mar', revenue: 22000, shipments: 61 },
      { month: 'Apr', revenue: 25000, shipments: 68 },
      { month: 'May', revenue: 28000, shipments: 75 },
      { month: 'Jun', revenue: 32000, shipments: 82 }
    ];

    return { statusData, revenueData };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex items-center gap-2 text-lg text-gray-700 dark:text-gray-300">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Loading shipments...</span>
        </div>
      </div>
    );
  }

  const stats = getDashboardStats();
  const { statusData, revenueData } = getChartData();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 no-print">
        <div className="container-wide mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">ShipTracker Pro</h1>
            </div>
            
            <nav className="hidden md:flex items-center gap-6">
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'dashboard'
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setCurrentView('shipments')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'shipments'
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Shipments
              </button>
              <button
                onClick={() => setCurrentView('analytics')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'analytics'
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Analytics
              </button>
            </nav>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors focus-visible"
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" /> 
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <div className="md:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 no-print">
        <div className="container-wide mx-auto px-4">
          <div className="flex space-x-4 py-2 overflow-x-auto">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                currentView === 'dashboard'
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setCurrentView('shipments')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                currentView === 'shipments'
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              Shipments
            </button>
            <button
              onClick={() => setCurrentView('analytics')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                currentView === 'analytics'
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              Analytics
            </button>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="container-wide mx-auto px-4 py-4 no-print">
          <div className="p-4 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-200 rounded-md flex items-center justify-between notification-slide">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
            <button
              onClick={() => setError('')}
              className="ml-auto text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200 focus-visible"
              aria-label="Close error message"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container-wide mx-auto px-4 py-6 print-avoid-break">
        {currentView === 'dashboard' && (
          <div className="space-y-6">
            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow enhanced-card">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Total Shipments</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalShipments}</div>
                  </div>
                  <Package className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow enhanced-card">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">In Transit</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.inTransit}</div>
                  </div>
                  <Truck className="h-8 w-8 text-yellow-600" />
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow enhanced-card">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Delivered</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.delivered}</div>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow enhanced-card">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Revenue</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">${stats.revenue.toLocaleString()}</div>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </div>

            {/* Recent Shipments */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow print-avoid-break">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Shipments</h2>
                <button
                  onClick={() => setCurrentView('shipments')}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 text-sm font-medium focus-visible no-print"
                >
                  View All
                </button>
              </div>
              
              <div className="space-y-3">
                {(shipments || []).slice(0, 5).map((shipment) => {
                  const statusInfo = getStatusInfo(shipment.status);
                  const StatusIcon = statusInfo.icon;
                  
                  return (
                    <div key={shipment.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg status-indicator">
                      <div className="flex items-center gap-3">
                        <StatusIcon className={`h-5 w-5 ${statusInfo.color.split(' ')[0]}`} />
                        <div>
                          <div className="font-medium text-sm text-gray-900 dark:text-white">
                            {shipment.trackingNumber}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {shipment.customerName} • {shipment.destination}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color} ${shipment.priority === 'urgent' ? 'priority-urgent' : ''} ${shipment.priority === 'high' ? 'priority-high' : ''}`}>
                          {shipment.status.replace('_', ' ')}
                        </span>
                        <button
                          onClick={() => openModal(shipment)}
                          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus-visible no-print"
                          aria-label={`View details for shipment ${shipment.trackingNumber}`}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {currentView === 'shipments' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow no-print">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative form-field-enhanced">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by tracking number, customer, or location..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full p-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 search-input-focus focus-visible"
                    />
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as FilterType)}
                    className="p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-auto focus-visible form-field-enhanced"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="in_transit">In Transit</option>
                    <option value="delivered">Delivered</option>
                    <option value="delayed">Delayed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => openForm()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2 interactive-button focus-visible"
                    >
                      <Plus className="h-4 w-4" />
                      Add Shipment
                    </button>
                    
                    <button
                      onClick={handleExportData}
                      className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 rounded-md flex items-center gap-2 interactive-button focus-visible"
                    >
                      <Download className="h-4 w-4" />
                      Export
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipments Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden print-avoid-break">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Shipments ({(filteredShipments || []).length})
                </h2>
              </div>
              
              <div className="overflow-x-auto table-container">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                      <th scope="col" className="px-6 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600" onClick={() => {
                        if (sortField === 'trackingNumber') {
                          setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                        } else {
                          setSortField('trackingNumber' as SortField);
                          setSortDirection('asc');
                        }
                      }}>
                        <div className="flex items-center gap-1">
                          Tracking #
                          {sortField === 'trackingNumber' && (
                            sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                          )}
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600" onClick={() => {
                        if (sortField === 'customerName') {
                          setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                        } else {
                          setSortField('customerName');
                          setSortDirection('asc');
                        }
                      }}>
                        <div className="flex items-center gap-1">
                          Customer
                          {sortField === 'customerName' && (
                            sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                          )}
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3">Route</th>
                      <th scope="col" className="px-6 py-3">Status</th>
                      <th scope="col" className="px-6 py-3">Priority</th>
                      <th scope="col" className="px-6 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600" onClick={() => {
                        if (sortField === 'estimatedDelivery') {
                          setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                        } else {
                          setSortField('estimatedDelivery');
                          setSortDirection('asc');
                        }
                      }}>
                        <div className="flex items-center gap-1">
                          Delivery
                          {sortField === 'estimatedDelivery' && (
                            sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                          )}
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 no-print">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                    {(filteredShipments || []).map((shipment) => {
                      const statusInfo = getStatusInfo(shipment.status);
                      const StatusIcon = statusInfo.icon;
                      
                      return (
                        <tr key={shipment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 table-row-hover status-transition">
                          <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                            {shipment.trackingNumber}
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">{shipment.customerName}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">{shipment.customerEmail}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm">
                              <div className="flex items-center gap-1 text-gray-900 dark:text-white">
                                <MapPin className="h-3 w-3 text-gray-400 shrink-0" />
                                <span>{shipment.origin}</span>
                              </div>
                              <div className="flex items-center gap-1 mt-1 text-gray-900 dark:text-white">
                                <ArrowDown className="h-3 w-3 text-gray-400 shrink-0" />
                                <span>{shipment.destination}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                              <StatusIcon className="h-3 w-3" />
                              {shipment.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(shipment.priority)} ${shipment.priority === 'urgent' ? 'priority-urgent' : ''} ${shipment.priority === 'high' ? 'priority-high' : ''}`}>
                              {shipment.priority}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 dark:text-white">
                              <div>{new Date(shipment.estimatedDelivery).toLocaleDateString()}</div>
                              <div className="text-gray-500 dark:text-gray-400">{shipment.carrier}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 no-print">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openModal(shipment)}
                                className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 focus-visible"
                                title="View Details"
                                aria-label={`View details for ${shipment.trackingNumber}`}
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => openForm(shipment)}
                                className="p-1 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 focus-visible"
                                title="Edit"
                                aria-label={`Edit shipment ${shipment.trackingNumber}`}
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteShipment(shipment.id)}
                                className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200 focus-visible"
                                title="Delete"
                                aria-label={`Delete shipment ${shipment.trackingNumber}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {currentView === 'analytics' && (
          <div className="space-y-6">
            {/* Analytics Header */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow print-avoid-break">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Analytics Dashboard</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 container-responsive">
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.avgDeliveryTime.toFixed(1)}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Avg Delivery Days</div>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.totalShipments > 0 ? ((stats.delivered / stats.totalShipments) * 100).toFixed(1) : '0.0'}%</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Delivery Rate</div>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.totalShipments > 0 ? ((stats.delayed / stats.totalShipments) * 100).toFixed(1) : '0.0'}%</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Delay Rate</div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print-avoid-break">
              {/* Status Distribution */}
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow chart-container">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Shipment Status Distribution</h3>
                <div className="h-64 will-change-transform">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        dataKey="value"
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        labelLine={false}
                        label={({ name, percent, x, y, midAngle }) => {
                            const RADIAN = Math.PI / 180;
                            const radius = 80 + 20; // radius for label position
                            const lx = x + radius * Math.cos(-midAngle * RADIAN);
                            const ly = y + radius * Math.sin(-midAngle * RADIAN);
                            return (
                              <text x={lx} y={ly} fill={isDarkMode ? "#e5e7eb" : "#374151"} textAnchor={lx > x ? 'start' : 'end'} dominantBaseline="central">
                                {`${name} (${(percent * 100).toFixed(0)}%)`}
                              </text>
                            );
                          }}
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke={isDarkMode ? '#1f2937' : '#ffffff'} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: isDarkMode ? '#374151' : '#ffffff', border: '1px solid #e5e7eb', borderRadius: '0.375rem'}}
                        itemStyle={{ color: isDarkMode ? '#e5e7eb' : '#374151'}}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Revenue Trend */}
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow chart-container">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Revenue Trend</h3>
                <div className="h-64 will-change-transform">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#4b5563" : "#e5e7eb"} />
                      <XAxis dataKey="month" tick={{ fill: isDarkMode ? "#9ca3af" : "#6b7280" }} />
                      <YAxis tick={{ fill: isDarkMode ? "#9ca3af" : "#6b7280" }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: isDarkMode ? '#374151' : '#ffffff', border: '1px solid #e5e7eb', borderRadius: '0.375rem'}}
                        itemStyle={{ color: isDarkMode ? '#e5e7eb' : '#374151'}}
                      />
                      <Legend wrapperStyle={{ color: isDarkMode ? "#e5e7eb" : "#374151"}} />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#3B82F6" 
                        strokeWidth={2}
                        name="Revenue ($)"
                        dot={{ r: 4, fill: "#3B82F6", stroke: isDarkMode ? '#1f2937' : '#ffffff', strokeWidth: 2 }}
                        activeDot={{ r: 6, fill: "#3B82F6", stroke: isDarkMode ? '#1f2937' : '#ffffff', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Shipment Volume */}
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow chart-container">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Monthly Shipment Volume</h3>
                <div className="h-64 will-change-transform">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#4b5563" : "#e5e7eb"} />
                      <XAxis dataKey="month" tick={{ fill: isDarkMode ? "#9ca3af" : "#6b7280" }} />
                      <YAxis tick={{ fill: isDarkMode ? "#9ca3af" : "#6b7280" }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: isDarkMode ? '#374151' : '#ffffff', border: '1px solid #e5e7eb', borderRadius: '0.375rem'}}
                        itemStyle={{ color: isDarkMode ? '#e5e7eb' : '#374151'}}
                      />
                      <Legend wrapperStyle={{ color: isDarkMode ? "#e5e7eb" : "#374151"}} />
                      <Bar dataKey="shipments" fill="#10B981" name="Shipments" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Carrier Performance */}
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow print-avoid-break">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Carrier Performance</h3>
                <div className="space-y-3">
                  {['FedEx', 'UPS', 'DHL', 'USPS', 'Local'].map((carrier) => {
                    const s = shipments || []; // Ensure shipments is an array
                    const carrierShipments = s.filter(item => item.carrier === carrier);
                    const deliveredCount = carrierShipments.filter(item => item.status === 'delivered').length;
                    const deliveryRate = carrierShipments.length > 0 ? (deliveredCount / carrierShipments.length) * 100 : 0;
                    
                    return (
                      <div key={carrier} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div>
                          <div className="font-medium text-sm text-gray-900 dark:text-white">{carrier}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {carrierShipments.length} shipments
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">
                            {deliveryRate.toFixed(1)}%
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">delivery rate</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Shipment Detail Modal */}
      {isModalOpen && selectedShipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 modal-backdrop-enter no-print" onClick={closeModal}>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-2xl m-4 modal-enter custom-scrollbar max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Shipment Details
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus-visible"
                aria-label="Close shipment details modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tracking Number</label>
                  <div className="mt-1 p-2 bg-gray-100 dark:bg-gray-700 rounded text-sm font-mono text-gray-900 dark:text-white">
                    {selectedShipment.trackingNumber}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                  <div className="mt-1 flex items-center gap-2">
                    <select
                      value={selectedShipment.status}
                      onChange={(e) => handleUpdateStatus(selectedShipment.id, e.target.value as ShipmentStatus)}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus-visible form-field-enhanced"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_transit">In Transit</option>
                      <option value="delivered">Delivered</option>
                      <option value="delayed">Delayed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Customer</label>
                  <div className="mt-1 p-2 bg-gray-100 dark:bg-gray-700 rounded text-sm text-gray-900 dark:text-white">
                    <div className="font-medium">{selectedShipment.customerName}</div>
                    <div className="text-gray-500 dark:text-gray-400">{selectedShipment.customerEmail}</div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Priority</label>
                  <div className="mt-1 p-2 bg-gray-100 dark:bg-gray-700 rounded text-sm">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedShipment.priority)} ${selectedShipment.priority === 'urgent' ? 'priority-urgent' : ''} ${selectedShipment.priority === 'high' ? 'priority-high' : ''}`}>
                      {selectedShipment.priority}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Origin</label>
                  <div className="mt-1 p-2 bg-gray-100 dark:bg-gray-700 rounded text-sm text-gray-900 dark:text-white">
                    {selectedShipment.origin}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Destination</label>
                  <div className="mt-1 p-2 bg-gray-100 dark:bg-gray-700 rounded text-sm text-gray-900 dark:text-white">
                    {selectedShipment.destination}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Weight</label>
                  <div className="mt-1 p-2 bg-gray-100 dark:bg-gray-700 rounded text-sm text-gray-900 dark:text-white">
                    {selectedShipment.weight} lbs
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cost</label>
                  <div className="mt-1 p-2 bg-gray-100 dark:bg-gray-700 rounded text-sm text-gray-900 dark:text-white">
                    ${selectedShipment.cost.toFixed(2)}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Carrier</label>
                  <div className="mt-1 p-2 bg-gray-100 dark:bg-gray-700 rounded text-sm text-gray-900 dark:text-white">
                    {selectedShipment.carrier}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Estimated Delivery</label>
                  <div className="mt-1 p-2 bg-gray-100 dark:bg-gray-700 rounded text-sm text-gray-900 dark:text-white">
                    {new Date(selectedShipment.estimatedDelivery).toLocaleDateString()}
                  </div>
                </div>
                
                {selectedShipment.actualDelivery && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Actual Delivery</label>
                    <div className="mt-1 p-2 bg-gray-100 dark:bg-gray-700 rounded text-sm text-gray-900 dark:text-white">
                      {new Date(selectedShipment.actualDelivery).toLocaleDateString()}
                    </div>
                  </div>
                )}
              </div>
              
              {selectedShipment.notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes</label>
                  <div className="mt-1 p-2 bg-gray-100 dark:bg-gray-700 rounded text-sm whitespace-pre-wrap text-gray-900 dark:text-white">
                    {selectedShipment.notes}
                  </div>
                </div>
              )}
              
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Created: {new Date(selectedShipment.createdDate).toLocaleDateString()} • 
                Last Updated: {new Date(selectedShipment.lastUpdated).toLocaleDateString()}
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => { openForm(selectedShipment); closeModal(); }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2 interactive-button focus-visible"
              >
                <Edit className="h-4 w-4" />
                Edit
              </button>
              <button
                onClick={() => handleDeleteShipment(selectedShipment.id)}
                className="px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800 rounded-md flex items-center gap-2 interactive-button focus-visible"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shipment Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 modal-backdrop-enter no-print" onClick={closeForm}>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-2xl m-4 modal-enter" onClick={(e) => e.stopPropagation()}>
            <ShipmentForm
              shipment={editingShipment}
              onSubmit={handleSubmitShipment}
              onCancel={closeForm}
            />
          </div>
        </div>
      )}
      
      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12 no-print">
        <div className="container-wide mx-auto px-4 py-4">
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            Copyright © {new Date().getFullYear()} Datavtar Private Limited. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

// Shipment Form Component
interface ShipmentFormProps {
  shipment?: Shipment | null;
  onSubmit: (data: ShipmentFormData) => void;
  onCancel: () => void;
}

const ShipmentForm: React.FC<ShipmentFormProps> = ({ shipment, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<ShipmentFormData>({
    trackingNumber: shipment?.trackingNumber || '',
    customerName: shipment?.customerName || '',
    customerEmail: shipment?.customerEmail || '',
    origin: shipment?.origin || '',
    destination: shipment?.destination || '',
    status: shipment?.status || 'pending',
    priority: shipment?.priority || 'medium',
    carrier: shipment?.carrier || 'FedEx',
    estimatedDelivery: shipment?.estimatedDelivery || new Date().toISOString().split('T')[0],
    actualDelivery: shipment?.actualDelivery || '',
    weight: shipment?.weight || 0,
    cost: shipment?.cost || 0,
    notes: shipment?.notes || ''
  });
  
  const [errors, setErrors] = useState<Partial<Record<keyof ShipmentFormData, string>>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ShipmentFormData, string>> = {};
    
    if (!formData.trackingNumber.trim()) newErrors.trackingNumber = 'Tracking number is required';
    if (!formData.customerName.trim()) newErrors.customerName = 'Customer name is required';
    if (!formData.customerEmail.trim()) newErrors.customerEmail = 'Customer email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.customerEmail)) {
      newErrors.customerEmail = 'Please enter a valid email address';
    }
    if (!formData.origin.trim()) newErrors.origin = 'Origin is required';
    if (!formData.destination.trim()) newErrors.destination = 'Destination is required';
    if (!formData.estimatedDelivery) newErrors.estimatedDelivery = 'Estimated delivery date is required';
    if (formData.weight <= 0) newErrors.weight = 'Weight must be greater than 0';
    if (formData.cost <= 0) newErrors.cost = 'Cost must be greater than 0';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleInputChange = (field: keyof ShipmentFormData, value: string | number | ShipmentStatus | Priority | CarrierType) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          {shipment ? 'Edit Shipment' : 'Add New Shipment'}
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus-visible"
          aria-label="Close form"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      
      <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-field-enhanced">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="trackingNumber">Tracking Number *</label>
            <input
              id="trackingNumber"
              type="text"
              value={formData.trackingNumber}
              onChange={(e) => handleInputChange('trackingNumber', e.target.value)}
              className={`mt-1 w-full p-2 border ${errors.trackingNumber ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus-visible`}
              placeholder="Enter tracking number"
            />
            {errors.trackingNumber && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.trackingNumber}</p>}
          </div>
          
          <div className="form-field-enhanced">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="carrier">Carrier *</label>
            <select
              id="carrier"
              value={formData.carrier}
              onChange={(e) => handleInputChange('carrier', e.target.value as CarrierType)}
              className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus-visible"
            >
              <option value="FedEx">FedEx</option>
              <option value="UPS">UPS</option>
              <option value="DHL">DHL</option>
              <option value="USPS">USPS</option>
              <option value="Local">Local</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-field-enhanced">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="customerName">Customer Name *</label>
            <input
              id="customerName"
              type="text"
              value={formData.customerName}
              onChange={(e) => handleInputChange('customerName', e.target.value)}
              className={`mt-1 w-full p-2 border ${errors.customerName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus-visible`}
              placeholder="Enter customer name"
            />
            {errors.customerName && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.customerName}</p>}
          </div>
          
          <div className="form-field-enhanced">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="customerEmail">Customer Email *</label>
            <input
              id="customerEmail"
              type="email"
              value={formData.customerEmail}
              onChange={(e) => handleInputChange('customerEmail', e.target.value)}
              className={`mt-1 w-full p-2 border ${errors.customerEmail ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus-visible`}
              placeholder="Enter customer email"
            />
            {errors.customerEmail && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.customerEmail}</p>}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-field-enhanced">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="origin">Origin *</label>
            <input
              id="origin"
              type="text"
              value={formData.origin}
              onChange={(e) => handleInputChange('origin', e.target.value)}
              className={`mt-1 w-full p-2 border ${errors.origin ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus-visible`}
              placeholder="Enter origin location"
            />
            {errors.origin && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.origin}</p>}
          </div>
          
          <div className="form-field-enhanced">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="destination">Destination *</label>
            <input
              id="destination"
              type="text"
              value={formData.destination}
              onChange={(e) => handleInputChange('destination', e.target.value)}
              className={`mt-1 w-full p-2 border ${errors.destination ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus-visible`}
              placeholder="Enter destination location"
            />
            {errors.destination && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.destination}</p>}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-field-enhanced">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="status">Status</label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value as ShipmentStatus)}
              className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus-visible"
            >
              <option value="pending">Pending</option>
              <option value="in_transit">In Transit</option>
              <option value="delivered">Delivered</option>
              <option value="delayed">Delayed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          <div className="form-field-enhanced">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="priority">Priority</label>
            <select
              id="priority"
              value={formData.priority}
              onChange={(e) => handleInputChange('priority', e.target.value as Priority)}
              className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus-visible"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="form-field-enhanced">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="weight">Weight (lbs) *</label>
            <input
              id="weight"
              type="number"
              step="0.1"
              min="0"
              value={formData.weight}
              onChange={(e) => handleInputChange('weight', parseFloat(e.target.value) || 0)}
              className={`mt-1 w-full p-2 border ${errors.weight ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus-visible`}
              placeholder="0.0"
            />
            {errors.weight && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.weight}</p>}
          </div>
          
          <div className="form-field-enhanced">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="cost">Cost ($) *</label>
            <input
              id="cost"
              type="number"
              step="0.01"
              min="0"
              value={formData.cost}
              onChange={(e) => handleInputChange('cost', parseFloat(e.target.value) || 0)}
              className={`mt-1 w-full p-2 border ${errors.cost ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus-visible`}
              placeholder="0.00"
            />
            {errors.cost && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.cost}</p>}
          </div>
          
          <div className="form-field-enhanced">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="estimatedDelivery">Est. Delivery *</label>
            <input
              id="estimatedDelivery"
              type="date"
              value={formData.estimatedDelivery}
              onChange={(e) => handleInputChange('estimatedDelivery', e.target.value)}
              className={`mt-1 w-full p-2 border ${errors.estimatedDelivery ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus-visible`}
            />
            {errors.estimatedDelivery && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.estimatedDelivery}</p>}
          </div>
        </div>
        
        {formData.status === 'delivered' && (
          <div className="form-field-enhanced">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="actualDelivery">Actual Delivery</label>
            <input
              id="actualDelivery"
              type="date"
              value={formData.actualDelivery || ''}
              onChange={(e) => handleInputChange('actualDelivery', e.target.value)}
              className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus-visible"
            />
          </div>
        )}
        
        <div className="form-field-enhanced">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus-visible"
            rows={3}
            placeholder="Enter any additional notes..."
          />
        </div>
      </div>
      
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 rounded-md interactive-button focus-visible"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 interactive-button focus-visible"
        >
          {shipment ? 'Update Shipment' : 'Create Shipment'}
        </button>
      </div>
    </form>
  );
};

export default App;
