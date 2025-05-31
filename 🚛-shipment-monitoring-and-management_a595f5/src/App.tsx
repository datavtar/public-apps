import React, { useState, useEffect, useMemo } from 'react';
import { 
  Package, 
  Truck, 
  MapPin, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Download, 
  ArrowUp, 
  ArrowDown, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  TrendingUp,
  TrendingDown,
  Eye,
  Calendar,
  User,
  Phone,
  Mail,
  Navigation,
  Moon,
  Sun
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import styles from './styles/styles.module.css';

// Types and Interfaces
interface Shipment {
  id: string;
  trackingNumber: string;
  origin: string;
  destination: string;
  status: 'pending' | 'in-transit' | 'delivered' | 'delayed' | 'cancelled';
  customer: string;
  customerEmail: string;
  customerPhone: string;
  carrier: string;
  estimatedDelivery: string;
  actualDelivery?: string;
  weight: number;
  value: number;
  createdAt: string;
  lastUpdated: string;
  notes?: string;
}

interface ShipmentStats {
  total: number;
  pending: number;
  inTransit: number;
  delivered: number;
  delayed: number;
  cancelled: number;
}

type SortField = 'trackingNumber' | 'customer' | 'status' | 'estimatedDelivery' | 'value';
type SortDirection = 'asc' | 'desc';
type StatusFilter = 'all' | 'pending' | 'in-transit' | 'delivered' | 'delayed' | 'cancelled';

const App: React.FC = () => {
  // State Management
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [filteredShipments, setFilteredShipments] = useState<Shipment[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortField, setSortField] = useState<SortField>('estimatedDelivery');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingShipment, setEditingShipment] = useState<Shipment | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'shipments' | 'analytics'>('dashboard');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize dark mode
  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldUseDarkMode = savedMode ? JSON.parse(savedMode) : prefersDark;
    
    setIsDarkMode(shouldUseDarkMode);
    if (shouldUseDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Load data from localStorage
  useEffect(() => {
    try {
      setIsLoading(true);
      const savedShipments = localStorage.getItem('shipments');
      if (savedShipments) {
        const parsedShipments = JSON.parse(savedShipments);
        setShipments(parsedShipments);
      } else {
        // Initialize with sample data
        const sampleShipments: Shipment[] = [
          {
            id: '1',
            trackingNumber: 'TRK001234',
            origin: 'New York, NY',
            destination: 'Los Angeles, CA',
            status: 'in-transit',
            customer: 'John Smith',
            customerEmail: 'john.smith@email.com',
            customerPhone: '+1-555-0101',
            carrier: 'FedEx',
            estimatedDelivery: '2025-01-15',
            weight: 15.5,
            value: 1250.00,
            createdAt: '2025-01-10',
            lastUpdated: '2025-01-12',
            notes: 'Fragile items - handle with care'
          },
          {
            id: '2',
            trackingNumber: 'TRK001235',
            origin: 'Chicago, IL',
            destination: 'Miami, FL',
            status: 'delivered',
            customer: 'Sarah Johnson',
            customerEmail: 'sarah.johnson@email.com',
            customerPhone: '+1-555-0102',
            carrier: 'UPS',
            estimatedDelivery: '2025-01-11',
            actualDelivery: '2025-01-11',
            weight: 8.2,
            value: 750.00,
            createdAt: '2025-01-08',
            lastUpdated: '2025-01-11'
          },
          {
            id: '3',
            trackingNumber: 'TRK001236',
            origin: 'Seattle, WA',
            destination: 'Boston, MA',
            status: 'delayed',
            customer: 'Mike Wilson',
            customerEmail: 'mike.wilson@email.com',
            customerPhone: '+1-555-0103',
            carrier: 'DHL',
            estimatedDelivery: '2025-01-13',
            weight: 22.1,
            value: 2100.00,
            createdAt: '2025-01-09',
            lastUpdated: '2025-01-13',
            notes: 'Weather delay in transit'
          },
          {
            id: '4',
            trackingNumber: 'TRK001237',
            origin: 'Denver, CO',
            destination: 'Atlanta, GA',
            status: 'pending',
            customer: 'Lisa Brown',
            customerEmail: 'lisa.brown@email.com',
            customerPhone: '+1-555-0104',
            carrier: 'FedEx',
            estimatedDelivery: '2025-01-16',
            weight: 12.3,
            value: 890.00,
            createdAt: '2025-01-12',
            lastUpdated: '2025-01-12'
          },
          {
            id: '5',
            trackingNumber: 'TRK001238',
            origin: 'Phoenix, AZ',
            destination: 'Portland, OR',
            status: 'in-transit',
            customer: 'David Lee',
            customerEmail: 'david.lee@email.com',
            customerPhone: '+1-555-0105',
            carrier: 'UPS',
            estimatedDelivery: '2025-01-14',
            weight: 18.7,
            value: 1650.00,
            createdAt: '2025-01-11',
            lastUpdated: '2025-01-12'
          }
        ];
        setShipments(sampleShipments);
        localStorage.setItem('shipments', JSON.stringify(sampleShipments));
      }
    } catch (error) {
      console.error('Error loading shipments:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save shipments to localStorage whenever shipments change
  useEffect(() => {
    if (shipments.length > 0) {
      localStorage.setItem('shipments', JSON.stringify(shipments));
    }
  }, [shipments]);

  // Filter and sort shipments
  useEffect(() => {
    let filtered = [...shipments];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(shipment => 
        shipment.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.carrier.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(shipment => shipment.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case 'trackingNumber':
          aValue = a.trackingNumber;
          bValue = b.trackingNumber;
          break;
        case 'customer':
          aValue = a.customer;
          bValue = b.customer;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'estimatedDelivery':
          aValue = new Date(a.estimatedDelivery).getTime();
          bValue = new Date(b.estimatedDelivery).getTime();
          break;
        case 'value':
          aValue = a.value;
          bValue = b.value;
          break;
        default:
          aValue = a.trackingNumber;
          bValue = b.trackingNumber;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else {
        return sortDirection === 'asc' 
          ? (aValue as number) - (bValue as number)
          : (bValue as number) - (aValue as number);
      }
    });

    setFilteredShipments(filtered);
  }, [shipments, searchTerm, statusFilter, sortField, sortDirection]);

  // Calculate statistics
  const stats: ShipmentStats = useMemo(() => {
    return {
      total: shipments.length,
      pending: shipments.filter(s => s.status === 'pending').length,
      inTransit: shipments.filter(s => s.status === 'in-transit').length,
      delivered: shipments.filter(s => s.status === 'delivered').length,
      delayed: shipments.filter(s => s.status === 'delayed').length,
      cancelled: shipments.filter(s => s.status === 'cancelled').length
    };
  }, [shipments]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('darkMode', JSON.stringify(newMode));
    
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Get status icon and color
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'in-transit':
        return <Truck className="w-4 h-4" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      case 'delayed':
        return <AlertCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'in-transit':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'delayed':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  // Add new shipment
  const addShipment = (shipmentData: Omit<Shipment, 'id' | 'createdAt' | 'lastUpdated'>) => {
    const newShipment: Shipment = {
      ...shipmentData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    setShipments(prev => [...prev, newShipment]);
  };

  // Update shipment
  const updateShipment = (id: string, shipmentData: Omit<Shipment, 'id' | 'createdAt'>) => {
    setShipments(prev => prev.map(shipment => 
      shipment.id === id 
        ? { ...shipmentData, id, createdAt: shipment.createdAt }
        : shipment
    ));
  };

  // Delete shipment
  const deleteShipment = (id: string) => {
    setShipments(prev => prev.filter(shipment => shipment.id !== id));
  };

  // Export data as CSV
  const exportToCSV = () => {
    const headers = [
      'Tracking Number', 'Origin', 'Destination', 'Status', 'Customer', 
      'Customer Email', 'Customer Phone', 'Carrier', 'Estimated Delivery', 
      'Actual Delivery', 'Weight (lbs)', 'Value ($)', 'Created At', 'Last Updated', 'Notes'
    ];
    
    const csvContent = [
      headers.join(','),
      ...filteredShipments.map(shipment => [
        shipment.trackingNumber,
        `"${shipment.origin}"`,
        `"${shipment.destination}"`,
        shipment.status,
        `"${shipment.customer}"`,
        shipment.customerEmail,
        shipment.customerPhone,
        shipment.carrier,
        shipment.estimatedDelivery,
        shipment.actualDelivery || '',
        shipment.weight,
        shipment.value,
        shipment.createdAt,
        shipment.lastUpdated,
        `"${shipment.notes || ''}"`
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `shipments_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Chart data
  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    return last7Days.map(date => {
      const dayShipments = shipments.filter(s => s.createdAt === date);
      return {
        date,
        shipments: dayShipments.length,
        value: dayShipments.reduce((sum, s) => sum + s.value, 0)
      };
    });
  }, [shipments]);

  const pieData = [
    { name: 'Pending', value: stats.pending, color: '#f59e0b' },
    { name: 'In Transit', value: stats.inTransit, color: '#3b82f6' },
    { name: 'Delivered', value: stats.delivered, color: '#10b981' },
    { name: 'Delayed', value: stats.delayed, color: '#f97316' },
    { name: 'Cancelled', value: stats.cancelled, color: '#ef4444' }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading shipment data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 theme-transition">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 theme-transition">
        <div className="container-wide">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">ShipTracker Pro</h1>
            </div>
            
            <nav className="hidden md:flex items-center gap-6">
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'dashboard'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setCurrentView('shipments')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'shipments'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                Shipments
              </button>
              <button
                onClick={() => setCurrentView('analytics')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'analytics'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                Analytics
              </button>
            </nav>
            
            <div className="flex items-center gap-3">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <div className="md:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container-wide">
          <div className="flex justify-around py-2">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`flex-1 px-3 py-2 text-center text-sm font-medium transition-colors ${
                currentView === 'dashboard'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setCurrentView('shipments')}
              className={`flex-1 px-3 py-2 text-center text-sm font-medium transition-colors ${
                currentView === 'shipments'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              Shipments
            </button>
            <button
              onClick={() => setCurrentView('analytics')}
              className={`flex-1 px-3 py-2 text-center text-sm font-medium transition-colors ${
                currentView === 'analytics'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              Analytics
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container-wide py-6">
        {currentView === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="stat-card">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="stat-title">Total Shipments</div>
                    <div className="stat-value">{stats.total}</div>
                  </div>
                  <Package className="w-8 h-8 text-blue-500" />
                </div>
              </div>
              
              <div className="stat-card">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="stat-title">Pending</div>
                    <div className="stat-value text-yellow-600">{stats.pending}</div>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-500" />
                </div>
              </div>
              
              <div className="stat-card">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="stat-title">In Transit</div>
                    <div className="stat-value text-blue-600">{stats.inTransit}</div>
                  </div>
                  <Truck className="w-8 h-8 text-blue-500" />
                </div>
              </div>
              
              <div className="stat-card">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="stat-title">Delivered</div>
                    <div className="stat-value text-green-600">{stats.delivered}</div>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </div>
              
              <div className="stat-card">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="stat-title">Delayed</div>
                    <div className="stat-value text-orange-600">{stats.delayed}</div>
                  </div>
                  <AlertCircle className="w-8 h-8 text-orange-500" />
                </div>
              </div>
            </div>

            {/* Recent Shipments */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Shipments</h2>
                <button
                  onClick={() => setCurrentView('shipments')}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View All
                </button>
              </div>
              
              <div className="space-y-3">
                {shipments.slice(0, 5).map(shipment => (
                  <div key={shipment.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(shipment.status)}
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{shipment.trackingNumber}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{shipment.customer}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-900 dark:text-white">{shipment.destination}</div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(shipment.status)}`}>
                        {shipment.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentView === 'shipments' && (
          <div className="space-y-6">
            {/* Filters and Search */}
            <div className="card">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search shipments..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="input pl-10"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                      className="input w-auto"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="in-transit">In Transit</option>
                      <option value="delivered">Delivered</option>
                      <option value="delayed">Delayed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={exportToCSV}
                    className="btn bg-green-600 text-white hover:bg-green-700 flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                  <button
                    onClick={() => {
                      setEditingShipment(null);
                      setIsModalOpen(true);
                    }}
                    className="btn btn-primary flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Shipment
                  </button>
                </div>
              </div>
            </div>

            {/* Shipments Table */}
            <div className="card p-0">
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-700">
                      <th className="table-header">
                        <button
                          onClick={() => handleSort('trackingNumber')}
                          className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200"
                        >
                          Tracking #
                          {sortField === 'trackingNumber' && (
                            sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                          )}
                        </button>
                      </th>
                      <th className="table-header">
                        <button
                          onClick={() => handleSort('customer')}
                          className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200"
                        >
                          Customer
                          {sortField === 'customer' && (
                            sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                          )}
                        </button>
                      </th>
                      <th className="table-header">Route</th>
                      <th className="table-header">
                        <button
                          onClick={() => handleSort('status')}
                          className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200"
                        >
                          Status
                          {sortField === 'status' && (
                            sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                          )}
                        </button>
                      </th>
                      <th className="table-header">
                        <button
                          onClick={() => handleSort('estimatedDelivery')}
                          className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200"
                        >
                          Est. Delivery
                          {sortField === 'estimatedDelivery' && (
                            sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                          )}
                        </button>
                      </th>
                      <th className="table-header">
                        <button
                          onClick={() => handleSort('value')}
                          className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200"
                        >
                          Value
                          {sortField === 'value' && (
                            sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                          )}
                        </button>
                      </th>
                      <th className="table-header">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                    {filteredShipments.map(shipment => (
                      <tr key={shipment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="table-cell font-mono text-sm">{shipment.trackingNumber}</td>
                        <td className="table-cell">
                          <div>
                            <div className="font-medium">{shipment.customer}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{shipment.customerEmail}</div>
                          </div>
                        </td>
                        <td className="table-cell">
                          <div className="text-sm">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-gray-400" />
                              {shipment.origin}
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              <Navigation className="w-3 h-3 text-gray-400" />
                              {shipment.destination}
                            </div>
                          </div>
                        </td>
                        <td className="table-cell">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(shipment.status)}`}>
                            {getStatusIcon(shipment.status)}
                            {shipment.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        </td>
                        <td className="table-cell">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-gray-400" />
                            {shipment.estimatedDelivery}
                          </div>
                          {shipment.actualDelivery && (
                            <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                              Delivered: {shipment.actualDelivery}
                            </div>
                          )}
                        </td>
                        <td className="table-cell font-medium">${shipment.value.toLocaleString()}</td>
                        <td className="table-cell">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setEditingShipment(shipment);
                                setIsModalOpen(true);
                              }}
                              className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                              aria-label="Edit shipment"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm('Are you sure you want to delete this shipment?')) {
                                  deleteShipment(shipment.id);
                                }
                              }}
                              className="p-1 text-red-600 hover:text-red-800 transition-colors"
                              aria-label="Delete shipment"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {filteredShipments.length === 0 && (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No shipments found</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">Try adjusting your search or filters</p>
                </div>
              )}
            </div>
          </div>
        )}

        {currentView === 'analytics' && (
          <div className="space-y-6">
            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Shipments Over Time */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Shipments Over Time</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      formatter={(value: number, name: string) => [
                        name === 'shipments' ? value : `$${value.toLocaleString()}`,
                        name === 'shipments' ? 'Shipments' : 'Value'
                      ]}
                    />
                    <Line type="monotone" dataKey="shipments" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              {/* Status Distribution */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Status Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [value, 'Shipments']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Value Chart */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Shipment Value Trends</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `$${value.toLocaleString()}`} />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Total Value']}
                  />
                  <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="stat-card">
                <div className="stat-title">Average Delivery Time</div>
                <div className="stat-value">3.2 days</div>
                <div className="stat-desc flex items-center gap-1">
                  <TrendingDown className="w-4 h-4 text-green-500" />
                  <span className="text-green-600">12% faster</span>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-title">On-Time Delivery Rate</div>
                <div className="stat-value">94.2%</div>
                <div className="stat-desc flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-green-600">2.1% improvement</span>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-title">Average Shipment Value</div>
                <div className="stat-value">${(shipments.reduce((sum, s) => sum + s.value, 0) / shipments.length || 0).toLocaleString()}</div>
                <div className="stat-desc flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  <span className="text-blue-600">8.3% increase</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal */}
      {isModalOpen && (
        <ShipmentModal
          shipment={editingShipment}
          onSave={(shipmentData) => {
            if (editingShipment) {
              updateShipment(editingShipment.id, {
                ...shipmentData,
                lastUpdated: new Date().toISOString().split('T')[0]
              });
            } else {
              addShipment(shipmentData);
            }
            setIsModalOpen(false);
            setEditingShipment(null);
          }}
          onClose={() => {
            setIsModalOpen(false);
            setEditingShipment(null);
          }}
        />
      )}

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="container-wide">
          <div className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Copyright © 2025 of Datavtar Private Limited. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

// Shipment Modal Component
interface ShipmentModalProps {
  shipment?: Shipment | null;
  onSave: (shipment: Omit<Shipment, 'id' | 'createdAt' | 'lastUpdated'>) => void;
  onClose: () => void;
}

const ShipmentModal: React.FC<ShipmentModalProps> = ({ shipment, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    trackingNumber: '',
    origin: '',
    destination: '',
    status: 'pending' as Shipment['status'],
    customer: '',
    customerEmail: '',
    customerPhone: '',
    carrier: '',
    estimatedDelivery: '',
    actualDelivery: '',
    weight: 0,
    value: 0,
    notes: ''
  });

  useEffect(() => {
    if (shipment) {
      setFormData({
        trackingNumber: shipment.trackingNumber,
        origin: shipment.origin,
        destination: shipment.destination,
        status: shipment.status,
        customer: shipment.customer,
        customerEmail: shipment.customerEmail,
        customerPhone: shipment.customerPhone,
        carrier: shipment.carrier,
        estimatedDelivery: shipment.estimatedDelivery,
        actualDelivery: shipment.actualDelivery || '',
        weight: shipment.weight,
        value: shipment.value,
        notes: shipment.notes || ''
      });
    } else {
      setFormData({
        trackingNumber: '',
        origin: '',
        destination: '',
        status: 'pending',
        customer: '',
        customerEmail: '',
        customerPhone: '',
        carrier: '',
        estimatedDelivery: '',
        actualDelivery: '',
        weight: 0,
        value: 0,
        notes: ''
      });
    }
  }, [shipment]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  useEffect(() => {
    document.body.classList.add('modal-open');
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, []);

  return (
    <div className="modal-backdrop" onClick={onClose} onKeyDown={handleKeyDown}>
      <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {shipment ? 'Edit Shipment' : 'Add New Shipment'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label" htmlFor="trackingNumber">Tracking Number</label>
              <input
                id="trackingNumber"
                type="text"
                value={formData.trackingNumber}
                onChange={(e) => setFormData({ ...formData, trackingNumber: e.target.value })}
                className="input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="carrier">Carrier</label>
              <select
                id="carrier"
                value={formData.carrier}
                onChange={(e) => setFormData({ ...formData, carrier: e.target.value })}
                className="input"
                required
              >
                <option value="">Select Carrier</option>
                <option value="FedEx">FedEx</option>
                <option value="UPS">UPS</option>
                <option value="DHL">DHL</option>
                <option value="USPS">USPS</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label" htmlFor="origin">Origin</label>
              <input
                id="origin"
                type="text"
                value={formData.origin}
                onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                className="input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="destination">Destination</label>
              <input
                id="destination"
                type="text"
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                className="input"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="customer">Customer Name</label>
            <input
              id="customer"
              type="text"
              value={formData.customer}
              onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
              className="input"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label" htmlFor="customerEmail">Customer Email</label>
              <input
                id="customerEmail"
                type="email"
                value={formData.customerEmail}
                onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                className="input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="customerPhone">Customer Phone</label>
              <input
                id="customerPhone"
                type="tel"
                value={formData.customerPhone}
                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                className="input"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="form-group">
              <label className="form-label" htmlFor="status">Status</label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Shipment['status'] })}
                className="input"
                required
              >
                <option value="pending">Pending</option>
                <option value="in-transit">In Transit</option>
                <option value="delivered">Delivered</option>
                <option value="delayed">Delayed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="weight">Weight (lbs)</label>
              <input
                id="weight"
                type="number"
                step="0.1"
                min="0"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 0 })}
                className="input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="value">Value ($)</label>
              <input
                id="value"
                type="number"
                step="0.01"
                min="0"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                className="input"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label" htmlFor="estimatedDelivery">Estimated Delivery</label>
              <input
                id="estimatedDelivery"
                type="date"
                value={formData.estimatedDelivery}
                onChange={(e) => setFormData({ ...formData, estimatedDelivery: e.target.value })}
                className="input"
                required
              />
            </div>

            {formData.status === 'delivered' && (
              <div className="form-group">
                <label className="form-label" htmlFor="actualDelivery">Actual Delivery</label>
                <input
                  id="actualDelivery"
                  type="date"
                  value={formData.actualDelivery}
                  onChange={(e) => setFormData({ ...formData, actualDelivery: e.target.value })}
                  className="input"
                />
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="input min-h-[80px] resize-y"
              placeholder="Optional notes about this shipment..."
            />
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {shipment ? 'Update' : 'Create'} Shipment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default App;