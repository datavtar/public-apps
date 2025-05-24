import React, { useState, useEffect } from 'react';
import { Package, Truck, MapPin, Calendar, Search, Filter, Plus, Edit, Trash2, Check, X, Download, Upload, FileText, Eye, ChevronDown, ChevronUp, Clock, Home, BarChart3, Moon, Sun } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, Pie } from 'recharts';
import styles from './styles/styles.module.css';

// Types
interface Shipment {
  id: string;
  trackingNumber: string;
  customerName: string;
  origin: string;
  destination: string;
  currentLocation: string;
  status: 'pending' | 'in_transit' | 'delivered' | 'delayed';
  shipmentDate: string;
  estimatedDelivery: string;
  actualDelivery?: string;
  weight: number;
  value: number;
  carrier: string;
  priority: 'low' | 'medium' | 'high';
  notes?: string;
}

interface FilterState {
  status: string;
  priority: string;
  carrier: string;
  searchTerm: string;
}

type SortField = 'trackingNumber' | 'customerName' | 'status' | 'estimatedDelivery' | 'currentLocation';

type SortOrder = 'asc' | 'desc';

type ViewMode = 'grid' | 'list' | 'dashboard';

const App: React.FC = () => {
  // State management
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [filteredShipments, setFilteredShipments] = useState<Shipment[]>([]);
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('add');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [sortField, setSortField] = useState<SortField>('estimatedDelivery');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [filters, setFilters] = useState<FilterState>({
    status: '',
    priority: '',
    carrier: '',
    searchTerm: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [formData, setFormData] = useState<Partial<Shipment>>({
    trackingNumber: '',
    customerName: '',
    origin: '',
    destination: '',
    currentLocation: '',
    status: 'pending',
    shipmentDate: new Date().toISOString().split('T')[0],
    estimatedDelivery: '',
    weight: 0,
    value: 0,
    carrier: '',
    priority: 'medium',
    notes: ''
  });

  // Sample data for initial load
  const sampleShipments: Shipment[] = [
    {
      id: '1',
      trackingNumber: 'TRK001234',
      customerName: 'ABC Electronics',
      origin: 'New York, NY',
      destination: 'Los Angeles, CA',
      currentLocation: 'Chicago, IL',
      status: 'in_transit',
      shipmentDate: '2025-01-10',
      estimatedDelivery: '2025-01-15',
      weight: 25.5,
      value: 1500,
      carrier: 'Express Logistics',
      priority: 'high',
      notes: 'Fragile items - handle with care'
    },
    {
      id: '2',
      trackingNumber: 'TRK001235',
      customerName: 'Tech Solutions Inc',
      origin: 'Seattle, WA',
      destination: 'Miami, FL',
      currentLocation: 'Denver, CO',
      status: 'in_transit',
      shipmentDate: '2025-01-08',
      estimatedDelivery: '2025-01-14',
      weight: 15.2,
      value: 800,
      carrier: 'Fast Track',
      priority: 'medium'
    },
    {
      id: '3',
      trackingNumber: 'TRK001236',
      customerName: 'Global Manufacturing',
      origin: 'Houston, TX',
      destination: 'Boston, MA',
      currentLocation: 'Boston, MA',
      status: 'delivered',
      shipmentDate: '2025-01-05',
      estimatedDelivery: '2025-01-12',
      actualDelivery: '2025-01-12',
      weight: 42.8,
      value: 3200,
      carrier: 'Reliable Shipping',
      priority: 'low'
    },
    {
      id: '4',
      trackingNumber: 'TRK001237',
      customerName: 'Fashion Forward',
      origin: 'Atlanta, GA',
      destination: 'Portland, OR',
      currentLocation: 'Dallas, TX',
      status: 'delayed',
      shipmentDate: '2025-01-07',
      estimatedDelivery: '2025-01-13',
      weight: 8.7,
      value: 450,
      carrier: 'Express Logistics',
      priority: 'medium',
      notes: 'Delayed due to weather conditions'
    },
    {
      id: '5',
      trackingNumber: 'TRK001238',
      customerName: 'Healthcare Plus',
      origin: 'Phoenix, AZ',
      destination: 'Nashville, TN',
      currentLocation: 'Phoenix, AZ',
      status: 'pending',
      shipmentDate: '2025-01-12',
      estimatedDelivery: '2025-01-18',
      weight: 12.3,
      value: 950,
      carrier: 'MedExpress',
      priority: 'high'
    }
  ];

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedShipments = localStorage.getItem('shipments');
    const savedDarkMode = localStorage.getItem('darkMode');
    
    if (savedShipments) {
      try {
        const parsedShipments = JSON.parse(savedShipments);
        setShipments(parsedShipments);
      } catch (error) {
        console.error('Error parsing saved shipments:', error);
        setShipments(sampleShipments);
      }
    } else {
      setShipments(sampleShipments);
    }

    if (savedDarkMode === 'true') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Save shipments to localStorage whenever shipments change
  useEffect(() => {
    localStorage.setItem('shipments', JSON.stringify(shipments));
  }, [shipments]);

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...shipments];

    // Apply search filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(shipment =>
        shipment.trackingNumber.toLowerCase().includes(searchLower) ||
        shipment.customerName.toLowerCase().includes(searchLower) ||
        shipment.currentLocation.toLowerCase().includes(searchLower) ||
        shipment.destination.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter(shipment => shipment.status === filters.status);
    }

    // Apply priority filter
    if (filters.priority) {
      filtered = filtered.filter(shipment => shipment.priority === filters.priority);
    }

    // Apply carrier filter
    if (filters.carrier) {
      filtered = filtered.filter(shipment => shipment.carrier === filters.carrier);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case 'estimatedDelivery':
          aValue = a.estimatedDelivery;
          bValue = b.estimatedDelivery;
          break;
        case 'trackingNumber':
          aValue = a.trackingNumber;
          bValue = b.trackingNumber;
          break;
        case 'customerName':
          aValue = a.customerName;
          bValue = b.customerName;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'currentLocation':
          aValue = a.currentLocation;
          bValue = b.currentLocation;
          break;
        default:
          aValue = a.trackingNumber;
          bValue = b.trackingNumber;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredShipments(filtered);
  }, [shipments, filters, sortField, sortOrder]);

  // Dark mode toggle
  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  };

  // Modal handlers
  const openModal = (mode: 'add' | 'edit' | 'view', shipment?: Shipment) => {
    setModalMode(mode);
    if (shipment) {
      setSelectedShipment(shipment);
      setFormData(shipment);
    } else {
      setSelectedShipment(null);
      setFormData({
        trackingNumber: '',
        customerName: '',
        origin: '',
        destination: '',
        currentLocation: '',
        status: 'pending',
        shipmentDate: new Date().toISOString().split('T')[0],
        estimatedDelivery: '',
        weight: 0,
        value: 0,
        carrier: '',
        priority: 'medium',
        notes: ''
      });
    }
    setIsModalOpen(true);
    document.body.classList.add('modal-open');
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedShipment(null);
    setFormData({
      trackingNumber: '',
      customerName: '',
      origin: '',
      destination: '',
      currentLocation: '',
      status: 'pending',
      shipmentDate: new Date().toISOString().split('T')[0],
      estimatedDelivery: '',
      weight: 0,
      value: 0,
      carrier: '',
      priority: 'medium',
      notes: ''
    });
    document.body.classList.remove('modal-open');
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.trackingNumber || !formData.customerName || !formData.destination) {
      alert('Please fill in all required fields');
      return;
    }

    if (modalMode === 'add') {
      const newShipment: Shipment = {
        ...formData as Shipment,
        id: Date.now().toString()
      };
      setShipments(prev => [...prev, newShipment]);
    } else if (modalMode === 'edit' && selectedShipment) {
      setShipments(prev => prev.map(shipment => 
        shipment.id === selectedShipment.id 
          ? { ...formData as Shipment, id: selectedShipment.id }
          : shipment
      ));
    }
    
    closeModal();
  };

  // Delete shipment
  const deleteShipment = (id: string) => {
    if (window.confirm('Are you sure you want to delete this shipment?')) {
      setShipments(prev => prev.filter(shipment => shipment.id !== id));
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'weight' || name === 'value' ? parseFloat(value) || 0 : value
    }));
  };

  // Handle filter changes
  const handleFilterChange = (filterType: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      status: '',
      priority: '',
      carrier: '',
      searchTerm: ''
    });
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'badge-success';
      case 'in_transit':
        return 'badge-info';
      case 'delayed':
        return 'badge-error';
      case 'pending':
        return 'badge-warning';
      default:
        return 'badge-info';
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 dark:text-red-400';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'low':
        return 'text-green-600 dark:text-green-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  // Get unique values for filter dropdowns
  const getUniqueCarriers = () => {
    return [...new Set(shipments.map(s => s.carrier).filter(Boolean))];
  };

  // Dashboard statistics
  const getStats = () => {
    const total = shipments.length;
    const delivered = shipments.filter(s => s.status === 'delivered').length;
    const inTransit = shipments.filter(s => s.status === 'in_transit').length;
    const delayed = shipments.filter(s => s.status === 'delayed').length;
    const pending = shipments.filter(s => s.status === 'pending').length;
    
    return { total, delivered, inTransit, delayed, pending };
  };

  // Chart data preparation
  const getChartData = () => {
    const stats = getStats();
    return [
      { name: 'Pending', value: stats.pending, color: '#fbbf24' },
      { name: 'In Transit', value: stats.inTransit, color: '#3b82f6' },
      { name: 'Delivered', value: stats.delivered, color: '#10b981' },
      { name: 'Delayed', value: stats.delayed, color: '#ef4444' }
    ];
  };

  const getDeliveryTrendData = () => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const deliveries = shipments.filter(s => s.actualDelivery === dateStr).length;
      last7Days.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        deliveries
      });
    }
    return last7Days;
  };

  // Export data
  const exportData = () => {
    const dataStr = JSON.stringify(filteredShipments, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'shipments.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Download template
  const downloadTemplate = () => {
    const template = {
      trackingNumber: 'TRK001234',
      customerName: 'Customer Name',
      origin: 'Origin City, State',
      destination: 'Destination City, State',
      currentLocation: 'Current Location',
      status: 'pending | in_transit | delivered | delayed',
      shipmentDate: '2025-01-15',
      estimatedDelivery: '2025-01-20',
      weight: 25.5,
      value: 1500,
      carrier: 'Carrier Name',
      priority: 'low | medium | high',
      notes: 'Optional notes'
    };
    
    const dataStr = JSON.stringify([template], null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'shipment_template.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Import data
  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (Array.isArray(data)) {
          const newShipments = data.map((item, index) => ({
            ...item,
            id: item.id || (Date.now() + index).toString()
          }));
          setShipments(prev => [...prev, ...newShipments]);
          alert(`Successfully imported ${newShipments.length} shipments`);
        } else {
          alert('Invalid file format. Please upload a JSON array.');
        }
      } catch (error) {
        alert('Error reading file. Please check the format and try again.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Keyboard event handler for modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeModal();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  const stats = getStats();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 theme-transition">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-slate-700 theme-transition">
        <div className="container-wide">
          <div className="flex-between py-4">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">ShipTracker Pro</h1>
                <p className="text-sm text-gray-500 dark:text-slate-400">Logistics Management System</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Navigation */}
              <nav className="hidden sm:flex items-center gap-2">
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className={`btn btn-sm ${currentView === 'dashboard' ? 'btn-primary' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-slate-700 dark:text-slate-300'}`}
                >
                  <BarChart3 className="h-4 w-4" />
                  <span className="hidden md:inline">Dashboard</span>
                </button>
                <button
                  onClick={() => setCurrentView('list')}
                  className={`btn btn-sm ${currentView === 'list' ? 'btn-primary' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-slate-700 dark:text-slate-300'}`}
                >
                  <Package className="h-4 w-4" />
                  <span className="hidden md:inline">Shipments</span>
                </button>
              </nav>
              
              {/* Dark mode toggle */}
              <button
                onClick={toggleDarkMode}
                className="btn btn-sm bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-slate-700 dark:text-slate-300"
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            </div>
          </div>
          
          {/* Mobile Navigation */}
          <div className="sm:hidden flex gap-2 pb-4">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`btn btn-sm flex-1 ${currentView === 'dashboard' ? 'btn-primary' : 'bg-gray-200 text-gray-700'}`}
            >
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </button>
            <button
              onClick={() => setCurrentView('list')}
              className={`btn btn-sm flex-1 ${currentView === 'list' ? 'btn-primary' : 'bg-gray-200 text-gray-700'}`}
            >
              <Package className="h-4 w-4" />
              Shipments
            </button>
          </div>
        </div>
      </header>

      <main className="container-wide py-6">
        {/* Dashboard View */}
        {currentView === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="stat-card">
                <div className="stat-title">Total Shipments</div>
                <div className="stat-value">{stats.total}</div>
              </div>
              <div className="stat-card">
                <div className="stat-title">Pending</div>
                <div className="stat-value text-yellow-600">{stats.pending}</div>
              </div>
              <div className="stat-card">
                <div className="stat-title">In Transit</div>
                <div className="stat-value text-blue-600">{stats.inTransit}</div>
              </div>
              <div className="stat-card">
                <div className="stat-title">Delivered</div>
                <div className="stat-value text-green-600">{stats.delivered}</div>
              </div>
              <div className="stat-card">
                <div className="stat-title">Delayed</div>
                <div className="stat-value text-red-600">{stats.delayed}</div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Status Distribution */}
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Shipment Status Distribution</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={getChartData()}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {getChartData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Delivery Trend */}
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Daily Deliveries (Last 7 Days)</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getDeliveryTrendData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="deliveries" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Shipments</h3>
              <div className="space-y-3">
                {filteredShipments.slice(0, 5).map((shipment) => (
                  <div key={shipment.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Truck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{shipment.trackingNumber}</p>
                        <p className="text-sm text-gray-500 dark:text-slate-400">{shipment.customerName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`badge ${getStatusColor(shipment.status)}`}>
                        {shipment.status.replace('_', ' ')}
                      </span>
                      <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{shipment.currentLocation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Shipments List View */}
        {currentView === 'list' && (
          <div className="space-y-6">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => openModal('add')}
                  className="btn btn-primary"
                >
                  <Plus className="h-4 w-4" />
                  Add Shipment
                </button>
                <button
                  onClick={exportData}
                  className="btn bg-green-600 text-white hover:bg-green-700"
                >
                  <Download className="h-4 w-4" />
                  Export
                </button>
                <label className="btn bg-blue-600 text-white hover:bg-blue-700 cursor-pointer">
                  <Upload className="h-4 w-4" />
                  Import
                  <input
                    type="file"
                    accept=".json"
                    onChange={importData}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={downloadTemplate}
                  className="btn bg-purple-600 text-white hover:bg-purple-700"
                >
                  <FileText className="h-4 w-4" />
                  Template
                </button>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`btn ${showFilters ? 'btn-primary' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-slate-700 dark:text-slate-300'}`}
                >
                  <Filter className="h-4 w-4" />
                  Filters
                  {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="card">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="form-label">Search</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search shipments..."
                        value={filters.searchTerm}
                        onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                        className="input pl-10"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="form-label">Status</label>
                    <select
                      value={filters.status}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      className="input"
                    >
                      <option value="">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="in_transit">In Transit</option>
                      <option value="delivered">Delivered</option>
                      <option value="delayed">Delayed</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="form-label">Priority</label>
                    <select
                      value={filters.priority}
                      onChange={(e) => handleFilterChange('priority', e.target.value)}
                      className="input"
                    >
                      <option value="">All Priorities</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="form-label">Carrier</label>
                    <select
                      value={filters.carrier}
                      onChange={(e) => handleFilterChange('carrier', e.target.value)}
                      className="input"
                    >
                      <option value="">All Carriers</option>
                      {getUniqueCarriers().map(carrier => (
                        <option key={carrier} value={carrier}>{carrier}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={clearFilters}
                    className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-slate-700 dark:text-slate-300"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            )}

            {/* Results Summary */}
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-slate-400">
              <span>Showing {filteredShipments.length} of {shipments.length} shipments</span>
              <div className="flex items-center gap-2">
                <span>Sort by:</span>
                <select
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value as SortField)}
                  className="input input-sm"
                >
                  <option value="trackingNumber">Tracking Number</option>
                  <option value="customerName">Customer</option>
                  <option value="status">Status</option>
                  <option value="estimatedDelivery">Delivery Date</option>
                  <option value="currentLocation">Location</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="btn btn-sm bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-slate-700 dark:text-slate-300"
                >
                  {sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Shipments Table/Cards */}
            <div className="space-y-4">
              {/* Desktop Table */}
              <div className="hidden lg:block">
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th className="table-header">Tracking #</th>
                        <th className="table-header">Customer</th>
                        <th className="table-header">Current Location</th>
                        <th className="table-header">Destination</th>
                        <th className="table-header">Status</th>
                        <th className="table-header">Delivery Date</th>
                        <th className="table-header">Priority</th>
                        <th className="table-header">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                      {filteredShipments.map((shipment) => (
                        <tr key={shipment.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                          <td className="table-cell font-medium">{shipment.trackingNumber}</td>
                          <td className="table-cell">{shipment.customerName}</td>
                          <td className="table-cell">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4 text-gray-400" />
                              {shipment.currentLocation}
                            </div>
                          </td>
                          <td className="table-cell">{shipment.destination}</td>
                          <td className="table-cell">
                            <span className={`badge ${getStatusColor(shipment.status)}`}>
                              {shipment.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="table-cell">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              {shipment.estimatedDelivery}
                            </div>
                          </td>
                          <td className={`table-cell font-medium ${getPriorityColor(shipment.priority)}`}>
                            {shipment.priority.toUpperCase()}
                          </td>
                          <td className="table-cell">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => openModal('view', shipment)}
                                className="btn btn-sm bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300"
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => openModal('edit', shipment)}
                                className="btn btn-sm bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-300"
                                title="Edit Shipment"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => deleteShipment(shipment.id)}
                                className="btn btn-sm bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300"
                                title="Delete Shipment"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden space-y-4">
                {filteredShipments.map((shipment) => (
                  <div key={shipment.id} className="card">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">{shipment.trackingNumber}</h3>
                        <p className="text-sm text-gray-500 dark:text-slate-400">{shipment.customerName}</p>
                      </div>
                      <span className={`badge ${getStatusColor(shipment.status)}`}>
                        {shipment.status.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-slate-400">Current:</span>
                        <span className="text-gray-900 dark:text-white">{shipment.currentLocation}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-slate-400">Destination:</span>
                        <span className="text-gray-900 dark:text-white">{shipment.destination}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-slate-400">Est. Delivery:</span>
                        <span className="text-gray-900 dark:text-white">{shipment.estimatedDelivery}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-slate-400">Priority:</span>
                        <span className={`font-medium ${getPriorityColor(shipment.priority)}`}>
                          {shipment.priority.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => openModal('view', shipment)}
                        className="btn btn-sm bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 flex-1"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </button>
                      <button
                        onClick={() => openModal('edit', shipment)}
                        className="btn btn-sm bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 flex-1"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => deleteShipment(shipment.id)}
                        className="btn btn-sm bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 flex-1"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Empty State */}
            {filteredShipments.length === 0 && (
              <div className="text-center py-12">
                <Package className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No shipments found</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                  {shipments.length === 0 ? 'Get started by adding your first shipment.' : 'Try adjusting your filters.'}
                </p>
                {shipments.length === 0 && (
                  <div className="mt-6">
                    <button
                      onClick={() => openModal('add')}
                      className="btn btn-primary"
                    >
                      <Plus className="h-4 w-4" />
                      Add Shipment
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {modalMode === 'add' && 'Add New Shipment'}
                {modalMode === 'edit' && 'Edit Shipment'}
                {modalMode === 'view' && 'Shipment Details'}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {modalMode === 'view' ? (
              // View Mode
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Tracking Number</label>
                    <p className="text-gray-900 dark:text-white font-medium">{selectedShipment?.trackingNumber}</p>
                  </div>
                  <div>
                    <label className="form-label">Customer Name</label>
                    <p className="text-gray-900 dark:text-white">{selectedShipment?.customerName}</p>
                  </div>
                  <div>
                    <label className="form-label">Origin</label>
                    <p className="text-gray-900 dark:text-white">{selectedShipment?.origin}</p>
                  </div>
                  <div>
                    <label className="form-label">Destination</label>
                    <p className="text-gray-900 dark:text-white">{selectedShipment?.destination}</p>
                  </div>
                  <div>
                    <label className="form-label">Current Location</label>
                    <p className="text-gray-900 dark:text-white">{selectedShipment?.currentLocation}</p>
                  </div>
                  <div>
                    <label className="form-label">Status</label>
                    <span className={`badge ${getStatusColor(selectedShipment?.status || '')}`}>
                      {selectedShipment?.status?.replace('_', ' ')}
                    </span>
                  </div>
                  <div>
                    <label className="form-label">Shipment Date</label>
                    <p className="text-gray-900 dark:text-white">{selectedShipment?.shipmentDate}</p>
                  </div>
                  <div>
                    <label className="form-label">Estimated Delivery</label>
                    <p className="text-gray-900 dark:text-white">{selectedShipment?.estimatedDelivery}</p>
                  </div>
                  {selectedShipment?.actualDelivery && (
                    <div>
                      <label className="form-label">Actual Delivery</label>
                      <p className="text-gray-900 dark:text-white">{selectedShipment.actualDelivery}</p>
                    </div>
                  )}
                  <div>
                    <label className="form-label">Weight (kg)</label>
                    <p className="text-gray-900 dark:text-white">{selectedShipment?.weight}</p>
                  </div>
                  <div>
                    <label className="form-label">Value ($)</label>
                    <p className="text-gray-900 dark:text-white">{selectedShipment?.value}</p>
                  </div>
                  <div>
                    <label className="form-label">Carrier</label>
                    <p className="text-gray-900 dark:text-white">{selectedShipment?.carrier}</p>
                  </div>
                  <div>
                    <label className="form-label">Priority</label>
                    <p className={`font-medium ${getPriorityColor(selectedShipment?.priority || '')}`}>
                      {selectedShipment?.priority?.toUpperCase()}
                    </p>
                  </div>
                </div>
                {selectedShipment?.notes && (
                  <div>
                    <label className="form-label">Notes</label>
                    <p className="text-gray-900 dark:text-white">{selectedShipment.notes}</p>
                  </div>
                )}
              </div>
            ) : (
              // Add/Edit Mode
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label" htmlFor="trackingNumber">Tracking Number *</label>
                    <input
                      type="text"
                      id="trackingNumber"
                      name="trackingNumber"
                      value={formData.trackingNumber || ''}
                      onChange={handleInputChange}
                      className="input"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="customerName">Customer Name *</label>
                    <input
                      type="text"
                      id="customerName"
                      name="customerName"
                      value={formData.customerName || ''}
                      onChange={handleInputChange}
                      className="input"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="origin">Origin</label>
                    <input
                      type="text"
                      id="origin"
                      name="origin"
                      value={formData.origin || ''}
                      onChange={handleInputChange}
                      className="input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="destination">Destination *</label>
                    <input
                      type="text"
                      id="destination"
                      name="destination"
                      value={formData.destination || ''}
                      onChange={handleInputChange}
                      className="input"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="currentLocation">Current Location</label>
                    <input
                      type="text"
                      id="currentLocation"
                      name="currentLocation"
                      value={formData.currentLocation || ''}
                      onChange={handleInputChange}
                      className="input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="status">Status</label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status || 'pending'}
                      onChange={handleInputChange}
                      className="input"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_transit">In Transit</option>
                      <option value="delivered">Delivered</option>
                      <option value="delayed">Delayed</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="shipmentDate">Shipment Date</label>
                    <input
                      type="date"
                      id="shipmentDate"
                      name="shipmentDate"
                      value={formData.shipmentDate || ''}
                      onChange={handleInputChange}
                      className="input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="estimatedDelivery">Estimated Delivery</label>
                    <input
                      type="date"
                      id="estimatedDelivery"
                      name="estimatedDelivery"
                      value={formData.estimatedDelivery || ''}
                      onChange={handleInputChange}
                      className="input"
                    />
                  </div>
                  
                  {formData.status === 'delivered' && (
                    <div className="form-group">
                      <label className="form-label" htmlFor="actualDelivery">Actual Delivery</label>
                      <input
                        type="date"
                        id="actualDelivery"
                        name="actualDelivery"
                        value={formData.actualDelivery || ''}
                        onChange={handleInputChange}
                        className="input"
                      />
                    </div>
                  )}
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="weight">Weight (kg)</label>
                    <input
                      type="number"
                      id="weight"
                      name="weight"
                      value={formData.weight || 0}
                      onChange={handleInputChange}
                      className="input"
                      min="0"
                      step="0.1"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="value">Value ($)</label>
                    <input
                      type="number"
                      id="value"
                      name="value"
                      value={formData.value || 0}
                      onChange={handleInputChange}
                      className="input"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="carrier">Carrier</label>
                    <input
                      type="text"
                      id="carrier"
                      name="carrier"
                      value={formData.carrier || ''}
                      onChange={handleInputChange}
                      className="input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="priority">Priority</label>
                    <select
                      id="priority"
                      name="priority"
                      value={formData.priority || 'medium'}
                      onChange={handleInputChange}
                      className="input"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="notes">Notes</label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes || ''}
                    onChange={handleInputChange}
                    className="input"
                    rows={3}
                    placeholder="Optional notes about the shipment..."
                  />
                </div>
                
                <div className="modal-footer">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    <Check className="h-4 w-4" />
                    {modalMode === 'add' ? 'Add Shipment' : 'Update Shipment'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 mt-auto theme-transition">
        <div className="container-wide py-4">
          <p className="text-center text-sm text-gray-500 dark:text-slate-400">
            Copyright © 2025 Datavtar Private Limited. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;