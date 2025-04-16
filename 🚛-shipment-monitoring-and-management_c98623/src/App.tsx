import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import {
  Truck,
  Package,
  Warehouse,
  Map,
  MapPin,
  Calendar,
  Clock,
  Search,
  Plus,
  Edit,
  Trash2,
  ChevronDown,
  X,
  Filter,
  Moon,
  Sun,
  ArrowDownUp,
  FileText
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import styles from './styles/styles.module.css';

interface Shipment {
  id: string;
  trackingNumber: string;
  origin: string;
  destination: string;
  status: ShipmentStatus;
  carrier: string;
  departureDate: string;
  estimatedArrival: string;
  priority: Priority;
  items: number;
  weight: number;
  notes?: string;
  lastUpdated: string;
}

enum ShipmentStatus {
  Pending = 'Pending',
  InTransit = 'In Transit',
  Delivered = 'Delivered',
  Delayed = 'Delayed',
  Cancelled = 'Cancelled'
}

enum Priority {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Critical = 'Critical'
}

interface FilterOptions {
  status: ShipmentStatus | '';
  priority: Priority | '';
  search: string;
  sortField: 'trackingNumber' | 'departureDate' | 'estimatedArrival' | 'priority';
  sortDirection: 'asc' | 'desc';
}

const App: React.FC = () => {
  // State management
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentShipment, setCurrentShipment] = useState<Shipment | null>(null);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    status: '',
    priority: '',
    search: '',
    sortField: 'departureDate',
    sortDirection: 'desc',
  });
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      return savedMode === 'true' || 
        (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  // Modal escape key handler
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isModalOpen) {
        setIsModalOpen(false);
        document.body.classList.remove('modal-open');
      }
    };
    
    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, [isModalOpen]);

  // Dark mode handler
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  // Load shipments from localStorage on mount
  useEffect(() => {
    const savedShipments = localStorage.getItem('shipments');
    if (savedShipments) {
      setShipments(JSON.parse(savedShipments));
    } else {
      // Initialize with sample data if none exists
      const sampleShipments: Shipment[] = [
        {
          id: '1',
          trackingNumber: 'TRK123456789',
          origin: 'New York, NY',
          destination: 'Los Angeles, CA',
          status: ShipmentStatus.InTransit,
          carrier: 'FastShip Express',
          departureDate: '2023-04-15',
          estimatedArrival: '2023-04-22',
          priority: Priority.High,
          items: 24,
          weight: 450,
          notes: 'Handle with care. Contains fragile electronics.',
          lastUpdated: '2023-04-16T14:30:00Z'
        },
        {
          id: '2',
          trackingNumber: 'TRK987654321',
          origin: 'Chicago, IL',
          destination: 'Miami, FL',
          status: ShipmentStatus.Pending,
          carrier: 'Reliable Logistics',
          departureDate: '2023-04-20',
          estimatedArrival: '2023-04-27',
          priority: Priority.Medium,
          items: 12,
          weight: 300,
          notes: 'Standard packaging',
          lastUpdated: '2023-04-14T09:15:00Z'
        },
        {
          id: '3',
          trackingNumber: 'TRK456789123',
          origin: 'Seattle, WA',
          destination: 'Boston, MA',
          status: ShipmentStatus.Delivered,
          carrier: 'Oceanic Shipping Co.',
          departureDate: '2023-04-05',
          estimatedArrival: '2023-04-12',
          priority: Priority.Low,
          items: 8,
          weight: 175,
          notes: 'Delivered on time',
          lastUpdated: '2023-04-12T16:45:00Z'
        },
        {
          id: '4',
          trackingNumber: 'TRK789123456',
          origin: 'Denver, CO',
          destination: 'Atlanta, GA',
          status: ShipmentStatus.Delayed,
          carrier: 'Mountain Transit',
          departureDate: '2023-04-10',
          estimatedArrival: '2023-04-18',
          priority: Priority.Critical,
          items: 36,
          weight: 720,
          notes: 'Delayed due to weather conditions',
          lastUpdated: '2023-04-15T10:30:00Z'
        },
        {
          id: '5',
          trackingNumber: 'TRK654321987',
          origin: 'Portland, OR',
          destination: 'Nashville, TN',
          status: ShipmentStatus.Cancelled,
          carrier: 'Pacific Routes',
          departureDate: '2023-04-18',
          estimatedArrival: '2023-04-25',
          priority: Priority.Medium,
          items: 15,
          weight: 280,
          notes: 'Cancelled by customer',
          lastUpdated: '2023-04-17T11:20:00Z'
        }
      ];
      setShipments(sampleShipments);
      localStorage.setItem('shipments', JSON.stringify(sampleShipments));
    }
  }, []);

  // Save shipments to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('shipments', JSON.stringify(shipments));
  }, [shipments]);

  // Open modal for new shipment
  const handleOpenAddModal = () => {
    const newShipment: Shipment = {
      id: Math.random().toString(36).substring(2, 9),
      trackingNumber: '',
      origin: '',
      destination: '',
      status: ShipmentStatus.Pending,
      carrier: '',
      departureDate: new Date().toISOString().split('T')[0],
      estimatedArrival: '',
      priority: Priority.Medium,
      items: 0,
      weight: 0,
      notes: '',
      lastUpdated: new Date().toISOString()
    };
    setCurrentShipment(newShipment);
    setIsModalOpen(true);
    document.body.classList.add('modal-open');
  };

  // Open modal for editing existing shipment
  const handleOpenEditModal = (shipment: Shipment) => {
    setCurrentShipment({...shipment});
    setIsModalOpen(true);
    document.body.classList.add('modal-open');
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    document.body.classList.remove('modal-open');
    setCurrentShipment(null);
  };

  // Handle input change in the form
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (!currentShipment) return;
    
    const { name, value } = e.target;
    const updatedShipment = { ...currentShipment };
    
    if (name === 'items' || name === 'weight') {
      (updatedShipment as any)[name] = parseFloat(value) || 0;
    } else {
      (updatedShipment as any)[name] = value;
    }
    
    setCurrentShipment(updatedShipment);
  };

  // Save shipment (add new or update existing)
  const handleSaveShipment = (e: FormEvent) => {
    e.preventDefault();
    if (!currentShipment) return;

    const updatedShipment = {
      ...currentShipment,
      lastUpdated: new Date().toISOString()
    };

    const updatedShipments = shipments.some(s => s.id === updatedShipment.id)
      ? shipments.map(s => s.id === updatedShipment.id ? updatedShipment : s)
      : [...shipments, updatedShipment];

    setShipments(updatedShipments);
    handleCloseModal();
  };

  // Delete shipment
  const handleDeleteShipment = (id: string) => {
    if (window.confirm('Are you sure you want to delete this shipment?')) {
      const updatedShipments = shipments.filter(s => s.id !== id);
      setShipments(updatedShipments);
    }
  };

  // Handle filter changes
  const handleFilterChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilterOptions(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Toggle sort direction
  const handleSort = (field: 'trackingNumber' | 'departureDate' | 'estimatedArrival' | 'priority') => {
    setFilterOptions(prev => ({
      ...prev,
      sortField: field,
      sortDirection: prev.sortField === field && prev.sortDirection === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilterOptions({
      status: '',
      priority: '',
      search: '',
      sortField: 'departureDate',
      sortDirection: 'desc',
    });
  };

  // Apply filters and sorting to shipments
  const filteredShipments = shipments
    .filter(shipment => {
      // Apply status filter
      if (filterOptions.status && shipment.status !== filterOptions.status) {
        return false;
      }
      
      // Apply priority filter
      if (filterOptions.priority && shipment.priority !== filterOptions.priority) {
        return false;
      }
      
      // Apply search filter (case insensitive)
      if (filterOptions.search) {
        const searchLower = filterOptions.search.toLowerCase();
        return (
          shipment.trackingNumber.toLowerCase().includes(searchLower) ||
          shipment.origin.toLowerCase().includes(searchLower) ||
          shipment.destination.toLowerCase().includes(searchLower) ||
          shipment.carrier.toLowerCase().includes(searchLower) ||
          (shipment.notes && shipment.notes.toLowerCase().includes(searchLower))
        );
      }
      
      return true;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      // Sort by the selected field
      switch (filterOptions.sortField) {
        case 'trackingNumber':
          comparison = a.trackingNumber.localeCompare(b.trackingNumber);
          break;
        case 'departureDate':
          comparison = new Date(a.departureDate).getTime() - new Date(b.departureDate).getTime();
          break;
        case 'estimatedArrival':
          comparison = new Date(a.estimatedArrival).getTime() - new Date(b.estimatedArrival).getTime();
          break;
        case 'priority':
          const priorityOrder = { [Priority.Low]: 1, [Priority.Medium]: 2, [Priority.High]: 3, [Priority.Critical]: 4 };
          comparison = (priorityOrder[a.priority] || 0) - (priorityOrder[b.priority] || 0);
          break;
        default:
          comparison = 0;
      }
      
      // Apply sort direction
      return filterOptions.sortDirection === 'asc' ? comparison : -comparison;
    });

  // Calculate statistics for the dashboard
  const totalShipments = shipments.length;
  const shipmentsInTransit = shipments.filter(s => s.status === ShipmentStatus.InTransit).length;
  const shipmentsPending = shipments.filter(s => s.status === ShipmentStatus.Pending).length;
  const shipmentsDelivered = shipments.filter(s => s.status === ShipmentStatus.Delivered).length;
  const shipmentsDelayed = shipments.filter(s => s.status === ShipmentStatus.Delayed).length;

  // Create data for the charts
  const statusChartData = [
    { name: 'Pending', value: shipmentsPending, color: '#FFC107' },
    { name: 'In Transit', value: shipmentsInTransit, color: '#3B82F6' },
    { name: 'Delivered', value: shipmentsDelivered, color: '#10B981' },
    { name: 'Delayed', value: shipmentsDelayed, color: '#EF4444' },
    { name: 'Cancelled', value: shipments.filter(s => s.status === ShipmentStatus.Cancelled).length, color: '#6B7280' }
  ];

  // Priority chart data
  const priorityChartData = [
    { name: 'Low', value: shipments.filter(s => s.priority === Priority.Low).length, color: '#10B981' },
    { name: 'Medium', value: shipments.filter(s => s.priority === Priority.Medium).length, color: '#3B82F6' },
    { name: 'High', value: shipments.filter(s => s.priority === Priority.High).length, color: '#FFC107' },
    { name: 'Critical', value: shipments.filter(s => s.priority === Priority.Critical).length, color: '#EF4444' }
  ];

  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get status badge class
  const getStatusBadgeClass = (status: ShipmentStatus) => {
    switch (status) {
      case ShipmentStatus.Pending: return 'badge badge-warning';
      case ShipmentStatus.InTransit: return 'badge badge-info';
      case ShipmentStatus.Delivered: return 'badge badge-success';
      case ShipmentStatus.Delayed: return 'badge badge-error';
      case ShipmentStatus.Cancelled: return 'badge bg-gray-500 text-white';
      default: return 'badge';
    }
  };

  // Get priority badge class
  const getPriorityBadgeClass = (priority: Priority) => {
    switch (priority) {
      case Priority.Low: return 'badge bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case Priority.Medium: return 'badge bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case Priority.High: return 'badge bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case Priority.Critical: return 'badge bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'badge';
    }
  };

  // Download sample CSV template
  const handleDownloadTemplate = () => {
    const headers = "trackingNumber,origin,destination,status,carrier,departureDate,estimatedArrival,priority,items,weight,notes";
    const sampleData = "TRK123456789,New York NY,Los Angeles CA,Pending,FastShip Express,2023-05-01,2023-05-08,Medium,10,200,Handle with care";
    const csvContent = `${headers}\n${sampleData}`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'shipment_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 theme-transition">
      {/* Navigation */}
      <nav className="bg-white dark:bg-slate-800 shadow-sm theme-transition">
        <div className="container-fluid py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Truck className="h-8 w-8 text-primary-600 dark:text-primary-500" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">LogiTrack</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white focus:outline-none"
                aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="container-fluid py-6">
        {/* Dashboard Summary Cards */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Shipment Dashboard</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <div className="stat-title">Total Shipments</div>
                  <div className="stat-value">{totalShipments}</div>
                </div>
                <div className="p-3 rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-300">
                  <Package size={24} />
                </div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <div className="stat-title">In Transit</div>
                  <div className="stat-value">{shipmentsInTransit}</div>
                </div>
                <div className="p-3 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                  <Truck size={24} />
                </div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <div className="stat-title">Delivered</div>
                  <div className="stat-value">{shipmentsDelivered}</div>
                </div>
                <div className="p-3 rounded-full bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300">
                  <Warehouse size={24} />
                </div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <div className="stat-title">Delayed</div>
                  <div className="stat-value">{shipmentsDelayed}</div>
                </div>
                <div className="p-3 rounded-full bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300">
                  <Clock size={24} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Charts Section */}
        <section className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card overflow-hidden">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Shipment Status Breakdown</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} shipments`, 'Count']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="card overflow-hidden">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Shipment Priority Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorityChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip formatter={(value) => [`${value} shipments`, 'Count']} />
                  <Legend />
                  <Bar dataKey="value" name="Shipments">
                    {priorityChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* Shipments Management Section */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Shipments</h2>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                className="btn btn-primary flex items-center justify-center gap-2"
                onClick={handleOpenAddModal}
              >
                <Plus size={18} />
                <span>Add Shipment</span>
              </button>
              <button
                className="btn bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center justify-center gap-2"
                onClick={handleDownloadTemplate}
              >
                <FileText size={18} />
                <span>Download Template</span>
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    name="search"
                    value={filterOptions.search}
                    onChange={handleFilterChange}
                    placeholder="Search shipments..."
                    className="input pl-10"
                  />
                  <div className="absolute left-3 top-2.5 text-gray-400">
                    <Search size={18} />
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsFilterOpen(!isFilterOpen)} 
                  className="btn bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center justify-center gap-2"
                >
                  <Filter size={18} />
                  <span className="hidden sm:inline">Filters</span>
                  <ChevronDown size={16} className={`transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
                </button>
                
                <button 
                  onClick={handleResetFilters}
                  className="btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-slate-700 dark:border-slate-600 dark:text-gray-200 dark:hover:bg-slate-600"
                >
                  <X size={18} />
                  <span className="hidden sm:inline ml-1">Reset</span>
                </button>
              </div>
            </div>
            
            {isFilterOpen && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label htmlFor="status" className="form-label">Status</label>
                  <select 
                    id="status" 
                    name="status" 
                    value={filterOptions.status}
                    onChange={handleFilterChange}
                    className="input"
                  >
                    <option value="">All Statuses</option>
                    {Object.values(ShipmentStatus).map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="priority" className="form-label">Priority</label>
                  <select 
                    id="priority" 
                    name="priority" 
                    value={filterOptions.priority}
                    onChange={handleFilterChange}
                    className="input"
                  >
                    <option value="">All Priorities</option>
                    {Object.values(Priority).map(priority => (
                      <option key={priority} value={priority}>{priority}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Shipments Table */}
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th className="table-header px-6 py-3">
                    <button 
                      className="flex items-center space-x-1 focus:outline-none"
                      onClick={() => handleSort('trackingNumber')}
                    >
                      <span>Tracking Number</span>
                      <ArrowDownUp size={14} />
                    </button>
                  </th>
                  <th className="table-header px-6 py-3">Origin / Destination</th>
                  <th className="table-header px-6 py-3">
                    <button 
                      className="flex items-center space-x-1 focus:outline-none"
                      onClick={() => handleSort('departureDate')}
                    >
                      <span>Departure</span>
                      <ArrowDownUp size={14} />
                    </button>
                  </th>
                  <th className="table-header px-6 py-3">
                    <button 
                      className="flex items-center space-x-1 focus:outline-none"
                      onClick={() => handleSort('estimatedArrival')}
                    >
                      <span>Arrival</span>
                      <ArrowDownUp size={14} />
                    </button>
                  </th>
                  <th className="table-header px-6 py-3">Status</th>
                  <th className="table-header px-6 py-3">
                    <button 
                      className="flex items-center space-x-1 focus:outline-none"
                      onClick={() => handleSort('priority')}
                    >
                      <span>Priority</span>
                      <ArrowDownUp size={14} />
                    </button>
                  </th>
                  <th className="table-header px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                {filteredShipments.length > 0 ? (
                  filteredShipments.map(shipment => (
                    <tr key={shipment.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                      <td className="table-cell">
                        <div className="font-medium text-gray-900 dark:text-white">{shipment.trackingNumber}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{shipment.carrier}</div>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-start gap-1">
                          <MapPin size={16} className="text-gray-400 mt-0.5" />
                          <div>
                            <div>{shipment.origin}</div>
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                              <span className="text-xs">&rarr;</span>
                              <span className="ml-1">{shipment.destination}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center">
                          <Calendar size={14} className="text-gray-400 mr-1" />
                          <span>{formatDate(shipment.departureDate)}</span>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center">
                          <Calendar size={14} className="text-gray-400 mr-1" />
                          <span>{formatDate(shipment.estimatedArrival)}</span>
                        </div>
                      </td>
                      <td className="table-cell">
                        <span className={getStatusBadgeClass(shipment.status)}>{shipment.status}</span>
                      </td>
                      <td className="table-cell">
                        <span className={getPriorityBadgeClass(shipment.priority)}>{shipment.priority}</span>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleOpenEditModal(shipment)}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            aria-label="Edit shipment"
                          >
                            <Edit size={18} />
                          </button>
                          <button 
                            onClick={() => handleDeleteShipment(shipment.id)}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            aria-label="Delete shipment"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="table-cell text-center py-8">
                      <div className="flex flex-col items-center justify-center">
                        <Package size={32} className="text-gray-400 mb-2" />
                        <p className="text-gray-500 dark:text-gray-400">No shipments found</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500">Try adjusting your filters or add a new shipment</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Shipment Modal */}
      {isModalOpen && currentShipment && (
        <div 
          className="modal-backdrop"
          onClick={handleCloseModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div 
            className="modal-content max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 id="modal-title" className="text-xl font-semibold text-gray-900 dark:text-white">
                {currentShipment.id ? 'Edit Shipment' : 'Add New Shipment'}
              </h3>
              <button 
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                aria-label="Close modal"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSaveShipment}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label htmlFor="trackingNumber" className="form-label">Tracking Number *</label>
                  <input
                    type="text"
                    id="trackingNumber"
                    name="trackingNumber"
                    value={currentShipment.trackingNumber}
                    onChange={handleInputChange}
                    placeholder="Enter tracking number"
                    className="input"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="carrier" className="form-label">Carrier *</label>
                  <input
                    type="text"
                    id="carrier"
                    name="carrier"
                    value={currentShipment.carrier}
                    onChange={handleInputChange}
                    placeholder="Enter carrier name"
                    className="input"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="origin" className="form-label">Origin *</label>
                  <input
                    type="text"
                    id="origin"
                    name="origin"
                    value={currentShipment.origin}
                    onChange={handleInputChange}
                    placeholder="Enter origin location"
                    className="input"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="destination" className="form-label">Destination *</label>
                  <input
                    type="text"
                    id="destination"
                    name="destination"
                    value={currentShipment.destination}
                    onChange={handleInputChange}
                    placeholder="Enter destination location"
                    className="input"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="departureDate" className="form-label">Departure Date *</label>
                  <input
                    type="date"
                    id="departureDate"
                    name="departureDate"
                    value={currentShipment.departureDate}
                    onChange={handleInputChange}
                    className="input"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="estimatedArrival" className="form-label">Estimated Arrival *</label>
                  <input
                    type="date"
                    id="estimatedArrival"
                    name="estimatedArrival"
                    value={currentShipment.estimatedArrival}
                    onChange={handleInputChange}
                    className="input"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="status" className="form-label">Status *</label>
                  <select
                    id="status"
                    name="status"
                    value={currentShipment.status}
                    onChange={handleInputChange}
                    className="input"
                    required
                  >
                    {Object.values(ShipmentStatus).map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="priority" className="form-label">Priority *</label>
                  <select
                    id="priority"
                    name="priority"
                    value={currentShipment.priority}
                    onChange={handleInputChange}
                    className="input"
                    required
                  >
                    {Object.values(Priority).map(priority => (
                      <option key={priority} value={priority}>{priority}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="items" className="form-label">Number of Items *</label>
                  <input
                    type="number"
                    id="items"
                    name="items"
                    value={currentShipment.items}
                    onChange={handleInputChange}
                    min="0"
                    className="input"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="weight" className="form-label">Weight (kg) *</label>
                  <input
                    type="number"
                    id="weight"
                    name="weight"
                    value={currentShipment.weight}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="input"
                    required
                  />
                </div>
                
                <div className="form-group md:col-span-2">
                  <label htmlFor="notes" className="form-label">Notes</label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={currentShipment.notes || ''}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Enter additional notes or instructions"
                    className="input"
                  ></textarea>
                </div>
              </div>
              
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Save Shipment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 shadow-sm mt-8 py-6 text-center text-gray-600 dark:text-gray-400 theme-transition">
        <div className="container-fluid">
          <p>Copyright © 2025 of Datavtar Private Limited. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;