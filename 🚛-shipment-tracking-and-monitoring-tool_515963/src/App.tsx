import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import {
  Truck,
  Package,
  MapPin,
  Calendar,
  Search,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Filter,
  Clock,
  Moon,
  Sun,
  X,
  BarChart2,
  Download,
  RefreshCw,
  SortAsc,
  SortDesc,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import styles from './styles/styles.module.css';

const App: React.FC = () => {
  // Types
  type ShipmentStatus = 'in_transit' | 'delivered' | 'delayed' | 'pending';
  type TransportMode = 'road' | 'sea' | 'air' | 'rail';
  type PriorityLevel = 'low' | 'medium' | 'high';
  
  interface Shipment {
    id: string;
    trackingNumber: string;
    origin: string;
    destination: string;
    status: ShipmentStatus;
    departureDate: string;
    arrivalDate: string;
    customer: string;
    transportMode: TransportMode;
    weight: number;
    priority: PriorityLevel;
    notes?: string;
    createdAt: string;
    updatedAt: string;
  }

  interface ShipmentFormInputs {
    trackingNumber: string;
    origin: string;
    destination: string;
    status: ShipmentStatus;
    departureDate: string;
    arrivalDate: string;
    customer: string;
    transportMode: TransportMode;
    weight: number;
    priority: PriorityLevel;
    notes?: string;
  }

  interface FilterOptions {
    status: ShipmentStatus | 'all';
    transportMode: TransportMode | 'all';
    priority: PriorityLevel | 'all';
    dateRange: {
      from: string;
      to: string;
    };
  }

  // State management
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentShipment, setCurrentShipment] = useState<Shipment | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    status: 'all',
    transportMode: 'all',
    priority: 'all',
    dateRange: {
      from: '',
      to: ''
    }
  });
  const [isStatsOpen, setIsStatsOpen] = useState<boolean>(false);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Shipment; direction: 'asc' | 'desc' } | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      return savedMode === 'true' || 
        (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  // Form handling
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ShipmentFormInputs>();

  // Theme handling
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
      // Generate sample data if no shipments exist
      const sampleShipments: Shipment[] = generateSampleShipments();
      setShipments(sampleShipments);
      localStorage.setItem('shipments', JSON.stringify(sampleShipments));
    }
  }, []);

  // Save shipments to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('shipments', JSON.stringify(shipments));
  }, [shipments]);

  // Sample data generation
  const generateSampleShipments = (): Shipment[] => {
    const statuses: ShipmentStatus[] = ['in_transit', 'delivered', 'delayed', 'pending'];
    const transportModes: TransportMode[] = ['road', 'sea', 'air', 'rail'];
    const priorities: PriorityLevel[] = ['low', 'medium', 'high'];
    const origins = ['New York', 'Los Angeles', 'Chicago', 'Miami', 'Seattle'];
    const destinations = ['London', 'Tokyo', 'Paris', 'Berlin', 'Sydney'];
    const customers = ['Acme Inc.', 'Global Enterprises', 'Tech Solutions', 'Best Logistics', 'Prime Shipping'];

    return Array.from({ length: 15 }, (_, i) => {
      const departureDate = new Date();
      departureDate.setDate(departureDate.getDate() - Math.floor(Math.random() * 30));
      
      const arrivalDate = new Date(departureDate);
      arrivalDate.setDate(arrivalDate.getDate() + Math.floor(Math.random() * 60) + 5);
      
      return {
        id: `ship-${i + 1}`,
        trackingNumber: `TRK${100000 + i}`,
        origin: origins[Math.floor(Math.random() * origins.length)],
        destination: destinations[Math.floor(Math.random() * destinations.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        departureDate: departureDate.toISOString().split('T')[0],
        arrivalDate: arrivalDate.toISOString().split('T')[0],
        customer: customers[Math.floor(Math.random() * customers.length)],
        transportMode: transportModes[Math.floor(Math.random() * transportModes.length)],
        weight: Math.floor(Math.random() * 1000) + 10,
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        notes: i % 3 === 0 ? `Special instructions for shipment ${i + 1}` : undefined,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString(),
        updatedAt: new Date().toISOString()
      };
    });
  };

  // Open modal for adding or editing shipment
  const openShipmentModal = (shipment?: Shipment) => {
    if (shipment) {
      setCurrentShipment(shipment);
      
      // Set form values
      setValue('trackingNumber', shipment.trackingNumber);
      setValue('origin', shipment.origin);
      setValue('destination', shipment.destination);
      setValue('status', shipment.status);
      setValue('departureDate', shipment.departureDate);
      setValue('arrivalDate', shipment.arrivalDate);
      setValue('customer', shipment.customer);
      setValue('transportMode', shipment.transportMode);
      setValue('weight', shipment.weight);
      setValue('priority', shipment.priority);
      setValue('notes', shipment.notes || '');
    } else {
      setCurrentShipment(null);
      reset({
        trackingNumber: '',
        origin: '',
        destination: '',
        status: 'pending',
        departureDate: new Date().toISOString().split('T')[0],
        arrivalDate: '',
        customer: '',
        transportMode: 'road',
        weight: 0,
        priority: 'medium',
        notes: ''
      });
    }
    setIsModalOpen(true);
  };

  // Close the modal
  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentShipment(null);
    reset();
  };

  // Handle form submission
  const onSubmit = (data: ShipmentFormInputs) => {
    if (currentShipment) {
      // Update existing shipment
      const updatedShipments = shipments.map(shipment => 
        shipment.id === currentShipment.id 
          ? { ...currentShipment, ...data, updatedAt: new Date().toISOString() } 
          : shipment
      );
      setShipments(updatedShipments);
    } else {
      // Add new shipment
      const newShipment: Shipment = {
        id: `ship-${Date.now()}`,
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setShipments([...shipments, newShipment]);
    }
    closeModal();
  };

  // Delete shipment
  const deleteShipment = (id: string) => {
    if (window.confirm('Are you sure you want to delete this shipment?')) {
      setShipments(shipments.filter(shipment => shipment.id !== id));
    }
  };

  // Filter and search shipments
  const filteredShipments = shipments.filter(shipment => {
    // Search
    const matchesSearch = 
      searchQuery === '' ||
      shipment.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.customer.toLowerCase().includes(searchQuery.toLowerCase());
      
    // Filters
    const matchesStatus = filterOptions.status === 'all' || shipment.status === filterOptions.status;
    const matchesTransportMode = filterOptions.transportMode === 'all' || shipment.transportMode === filterOptions.transportMode;
    const matchesPriority = filterOptions.priority === 'all' || shipment.priority === filterOptions.priority;
    
    // Date range
    let matchesDateRange = true;
    if (filterOptions.dateRange.from) {
      matchesDateRange = matchesDateRange && shipment.departureDate >= filterOptions.dateRange.from;
    }
    if (filterOptions.dateRange.to) {
      matchesDateRange = matchesDateRange && shipment.departureDate <= filterOptions.dateRange.to;
    }
    
    return matchesSearch && matchesStatus && matchesTransportMode && matchesPriority && matchesDateRange;
  });

  // Sort shipments
  const sortedShipments = React.useMemo(() => {
    let sortableShipments = [...filteredShipments];
    if (sortConfig !== null) {
      sortableShipments.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableShipments;
  }, [filteredShipments, sortConfig]);

  // Handle sorting
  const requestSort = (key: keyof Shipment) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Apply filters
  const applyFilters = () => {
    setIsFilterOpen(false);
  };

  // Reset filters
  const resetFilters = () => {
    setFilterOptions({
      status: 'all',
      transportMode: 'all',
      priority: 'all',
      dateRange: {
        from: '',
        to: ''
      }
    });
    setIsFilterOpen(false);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Status badge class
  const getStatusBadgeClass = (status: ShipmentStatus): string => {
    switch (status) {
      case 'delivered':
        return 'badge badge-success';
      case 'in_transit':
        return 'badge badge-info';
      case 'delayed':
        return 'badge badge-error';
      case 'pending':
        return 'badge badge-warning';
      default:
        return 'badge';
    }
  };

  // Status display name
  const getStatusDisplayName = (status: ShipmentStatus): string => {
    switch (status) {
      case 'delivered':
        return 'Delivered';
      case 'in_transit':
        return 'In Transit';
      case 'delayed':
        return 'Delayed';
      case 'pending':
        return 'Pending';
      default:
        return status;
    }
  };

  // Priority badge class
  const getPriorityBadgeClass = (priority: PriorityLevel): string => {
    switch (priority) {
      case 'high':
        return 'badge badge-error';
      case 'medium':
        return 'badge badge-warning';
      case 'low':
        return 'badge badge-info';
      default:
        return 'badge';
    }
  };

  // Transport mode icon
  const getTransportModeIcon = (mode: TransportMode) => {
    switch (mode) {
      case 'road':
        return <Truck className="w-4 h-4" />;
      case 'sea':
        return <Package className="w-4 h-4" />;
      case 'air':
        return <Package className="w-4 h-4" />;
      case 'rail':
        return <Package className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  // Calculate dashboard data
  const dashboardData = React.useMemo(() => {
    const totalShipments = shipments.length;
    const inTransitCount = shipments.filter(s => s.status === 'in_transit').length;
    const deliveredCount = shipments.filter(s => s.status === 'delivered').length;
    const delayedCount = shipments.filter(s => s.status === 'delayed').length;
    const pendingCount = shipments.filter(s => s.status === 'pending').length;

    // Monthly data for chart
    const currentDate = new Date();
    const last6Months: string[] = [];
    for (let i = 5; i >= 0; i--) {
      const month = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      last6Months.push(format(month, 'MMM yyyy'));
    }

    const monthlyData = last6Months.map(monthYear => {
      const [monthStr, yearStr] = monthYear.split(' ');
      const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(monthStr);
      const year = parseInt(yearStr, 10);

      const monthShipments = shipments.filter(shipment => {
        const shipmentDate = new Date(shipment.departureDate);
        return shipmentDate.getMonth() === month && shipmentDate.getFullYear() === year;
      });

      return {
        name: monthYear,
        shipments: monthShipments.length,
        delivered: monthShipments.filter(s => s.status === 'delivered').length,
        delayed: monthShipments.filter(s => s.status === 'delayed').length
      };
    });

    // Data for pie chart
    const statusData = [
      { name: 'In Transit', value: inTransitCount },
      { name: 'Delivered', value: deliveredCount },
      { name: 'Delayed', value: delayedCount },
      { name: 'Pending', value: pendingCount }
    ];

    return {
      totalShipments,
      inTransitCount,
      deliveredCount,
      delayedCount,
      pendingCount,
      monthlyData,
      statusData
    };
  }, [shipments]);

  // Pie chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FF8042', '#FFBB28'];

  // Download shipment data as CSV
  const downloadCSV = () => {
    const headers = ['Tracking Number', 'Origin', 'Destination', 'Status', 'Departure Date', 'Arrival Date', 'Customer', 'Transport Mode', 'Weight', 'Priority'];
    const csvRows = [
      headers.join(','),
      ...shipments.map(shipment => [
        shipment.trackingNumber,
        `"${shipment.origin}"`,
        `"${shipment.destination}"`,
        shipment.status,
        shipment.departureDate,
        shipment.arrivalDate,
        `"${shipment.customer}"`,
        shipment.transportMode,
        shipment.weight,
        shipment.priority
      ].join(','))
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `shipments_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Empty template for new shipments
  const downloadTemplate = () => {
    const headers = ['Tracking Number', 'Origin', 'Destination', 'Status', 'Departure Date', 'Arrival Date', 'Customer', 'Transport Mode', 'Weight', 'Priority', 'Notes'];
    const exampleRow = [
      'TRK12345',
      'New York',
      'London',
      'pending', // valid values: pending, in_transit, delivered, delayed
      '2023-01-01',
      '2023-01-15',
      'Customer Name',
      'road', // valid values: road, sea, air, rail
      '100',
      'medium', // valid values: low, medium, high
      'Special handling instructions'
    ];
    const csvRows = [
      headers.join(','),
      exampleRow.join(',')
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'shipment_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 theme-transition-all`}>
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm p-4 sm:p-6">
        <div className="container-fluid">
          <div className="flex-between flex-wrap gap-4">
            <div className="flex items-center">
              <Truck className="w-8 h-8 text-primary-500 mr-3" />
              <h1 className="text-xl sm:text-2xl font-bold">Shipment Tracker</h1>
            </div>
            <div className="flex items-center gap-4">
              <button 
                className="btn btn-primary flex items-center gap-2"
                onClick={() => setIsStatsOpen(true)}
                aria-label="View Dashboard"
              >
                <BarChart2 className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </button>
              <button 
                className="theme-toggle icon-btn"
                onClick={() => setIsDarkMode(!isDarkMode)}
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container-fluid py-6 px-4 sm:px-6">
        {/* Controls */}
        <div className="flex-between flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search shipments..."
                className="input pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search shipments"
              />
            </div>
            <button 
              className="btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600 flex items-center gap-2"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              aria-label="Filter shipments"
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filter</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button 
              className="btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600 flex items-center gap-2"
              onClick={downloadCSV}
              aria-label="Export to CSV"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
            <button 
              className="btn btn-primary flex items-center gap-2"
              onClick={() => openShipmentModal()}
              aria-label="Add new shipment"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Shipment</span>
            </button>
          </div>
        </div>

        {/* Filter panel */}
        {isFilterOpen && (
          <div className="card mb-6">
            <div className="flex-between mb-4">
              <h3 className="text-lg font-medium">Filter Shipments</h3>
              <button 
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                onClick={() => setIsFilterOpen(false)}
                aria-label="Close filter panel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="form-group">
                <label className="form-label" htmlFor="status-filter">Status</label>
                <select
                  id="status-filter"
                  className="input"
                  value={filterOptions.status}
                  onChange={(e) => setFilterOptions({
                    ...filterOptions,
                    status: e.target.value as ShipmentStatus | 'all'
                  })}
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="in_transit">In Transit</option>
                  <option value="delivered">Delivered</option>
                  <option value="delayed">Delayed</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="transport-filter">Transport Mode</label>
                <select
                  id="transport-filter"
                  className="input"
                  value={filterOptions.transportMode}
                  onChange={(e) => setFilterOptions({
                    ...filterOptions,
                    transportMode: e.target.value as TransportMode | 'all'
                  })}
                >
                  <option value="all">All Modes</option>
                  <option value="road">Road</option>
                  <option value="sea">Sea</option>
                  <option value="air">Air</option>
                  <option value="rail">Rail</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="priority-filter">Priority</label>
                <select
                  id="priority-filter"
                  className="input"
                  value={filterOptions.priority}
                  onChange={(e) => setFilterOptions({
                    ...filterOptions,
                    priority: e.target.value as PriorityLevel | 'all'
                  })}
                >
                  <option value="all">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="form-group sm:col-span-2 md:col-span-1">
                <label className="form-label">Departure Date Range</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    className="input"
                    value={filterOptions.dateRange.from}
                    onChange={(e) => setFilterOptions({
                      ...filterOptions,
                      dateRange: {
                        ...filterOptions.dateRange,
                        from: e.target.value
                      }
                    })}
                    aria-label="From date"
                  />
                  <input
                    type="date"
                    className="input"
                    value={filterOptions.dateRange.to}
                    onChange={(e) => setFilterOptions({
                      ...filterOptions,
                      dateRange: {
                        ...filterOptions.dateRange,
                        to: e.target.value
                      }
                    })}
                    aria-label="To date"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button 
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                onClick={resetFilters}
              >
                Reset
              </button>
              <button 
                className="btn btn-primary"
                onClick={applyFilters}
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}

        {/* Dashboard/Stats Modal */}
        {isStatsOpen && (
          <div className="modal-backdrop" onClick={() => setIsStatsOpen(false)}>
            <div className="modal-content max-w-4xl" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="text-lg font-medium">Shipment Dashboard</h3>
                <button 
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  onClick={() => setIsStatsOpen(false)}
                  aria-label="Close dashboard"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4">
                {/* Summary cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="stat-card">
                    <div className="stat-title">Total Shipments</div>
                    <div className="stat-value">{dashboardData.totalShipments}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-title">In Transit</div>
                    <div className="stat-value">{dashboardData.inTransitCount}</div>
                    <div className="stat-desc">{((dashboardData.inTransitCount / dashboardData.totalShipments) * 100).toFixed(1)}% of total</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-title">Delivered</div>
                    <div className="stat-value">{dashboardData.deliveredCount}</div>
                    <div className="stat-desc">{((dashboardData.deliveredCount / dashboardData.totalShipments) * 100).toFixed(1)}% of total</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-title">Delayed</div>
                    <div className="stat-value">{dashboardData.delayedCount}</div>
                    <div className="stat-desc">{((dashboardData.delayedCount / dashboardData.totalShipments) * 100).toFixed(1)}% of total</div>
                  </div>
                </div>

                {/* Line chart */}
                <div className="card mb-6">
                  <h4 className="text-base font-medium mb-4">Monthly Shipment Trends</h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={dashboardData.monthlyData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="shipments" stroke="#3b82f6" activeDot={{ r: 8 }} />
                        <Line type="monotone" dataKey="delivered" stroke="#10b981" />
                        <Line type="monotone" dataKey="delayed" stroke="#ef4444" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Pie chart */}
                <div className="card">
                  <h4 className="text-base font-medium mb-4">Shipment Status Distribution</h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={dashboardData.statusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {dashboardData.statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Shipments table */}
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th className="table-header cursor-pointer" onClick={() => requestSort('trackingNumber')}>
                  <div className="flex items-center gap-1">
                    Tracking #
                    {sortConfig?.key === 'trackingNumber' && (
                      sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th className="table-header cursor-pointer" onClick={() => requestSort('origin')}>
                  <div className="flex items-center gap-1">
                    Origin
                    {sortConfig?.key === 'origin' && (
                      sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th className="table-header cursor-pointer" onClick={() => requestSort('destination')}>
                  <div className="flex items-center gap-1">
                    Destination
                    {sortConfig?.key === 'destination' && (
                      sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th className="table-header cursor-pointer" onClick={() => requestSort('status')}>
                  <div className="flex items-center gap-1">
                    Status
                    {sortConfig?.key === 'status' && (
                      sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th className="table-header cursor-pointer hidden md:table-cell" onClick={() => requestSort('departureDate')}>
                  <div className="flex items-center gap-1">
                    Departure
                    {sortConfig?.key === 'departureDate' && (
                      sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th className="table-header cursor-pointer hidden md:table-cell" onClick={() => requestSort('arrivalDate')}>
                  <div className="flex items-center gap-1">
                    Arrival
                    {sortConfig?.key === 'arrivalDate' && (
                      sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th className="table-header cursor-pointer hidden sm:table-cell" onClick={() => requestSort('customer')}>
                  <div className="flex items-center gap-1">
                    Customer
                    {sortConfig?.key === 'customer' && (
                      sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th className="table-header hidden lg:table-cell">Transport</th>
                <th className="table-header hidden lg:table-cell cursor-pointer" onClick={() => requestSort('priority')}>
                  <div className="flex items-center gap-1">
                    Priority
                    {sortConfig?.key === 'priority' && (
                      sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {sortedShipments.length > 0 ? (
                sortedShipments.map((shipment) => (
                  <tr key={shipment.id}>
                    <td className="table-cell font-medium">{shipment.trackingNumber}</td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        {shipment.origin}
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        {shipment.destination}
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className={getStatusBadgeClass(shipment.status)}>
                        {getStatusDisplayName(shipment.status)}
                      </span>
                    </td>
                    <td className="table-cell hidden md:table-cell">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        {formatDate(shipment.departureDate)}
                      </div>
                    </td>
                    <td className="table-cell hidden md:table-cell">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        {formatDate(shipment.arrivalDate)}
                      </div>
                    </td>
                    <td className="table-cell hidden sm:table-cell">{shipment.customer}</td>
                    <td className="table-cell hidden lg:table-cell">
                      <div className="flex items-center gap-1">
                        {getTransportModeIcon(shipment.transportMode)}
                        <span className="capitalize">{shipment.transportMode}</span>
                      </div>
                    </td>
                    <td className="table-cell hidden lg:table-cell">
                      <span className={getPriorityBadgeClass(shipment.priority)}>
                        {shipment.priority}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex space-x-2">
                        <button
                          className="icon-btn text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          onClick={() => openShipmentModal(shipment)}
                          aria-label={`Edit shipment ${shipment.trackingNumber}`}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          className="icon-btn text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          onClick={() => deleteShipment(shipment.id)}
                          aria-label={`Delete shipment ${shipment.trackingNumber}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="table-cell text-center py-8">
                    <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                      <Package className="w-12 h-12 mb-2" />
                      <p>No shipments found</p>
                      {searchQuery || filterOptions.status !== 'all' || filterOptions.transportMode !== 'all' || filterOptions.priority !== 'all' ? (
                        <button
                          className="btn btn-sm bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 mt-2"
                          onClick={resetFilters}
                        >
                          Clear filters
                        </button>
                      ) : (
                        <button
                          className="btn btn-sm btn-primary mt-2"
                          onClick={() => openShipmentModal()}
                        >
                          Add your first shipment
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Add/Edit shipment modal */}
        {isModalOpen && (
          <div className="modal-backdrop" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="text-lg font-medium">
                  {currentShipment ? 'Edit Shipment' : 'Add New Shipment'}
                </h3>
                <button 
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  onClick={closeModal}
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Tracking Number */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="trackingNumber">Tracking Number*</label>
                    <input
                      id="trackingNumber"
                      type="text"
                      className={`input ${errors.trackingNumber ? 'input-error' : ''}`}
                      {...register('trackingNumber', { required: 'Tracking number is required' })}
                    />
                    {errors.trackingNumber && (
                      <p className="form-error">{errors.trackingNumber.message}</p>
                    )}
                  </div>

                  {/* Customer */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="customer">Customer Name*</label>
                    <input
                      id="customer"
                      type="text"
                      className={`input ${errors.customer ? 'input-error' : ''}`}
                      {...register('customer', { required: 'Customer name is required' })}
                    />
                    {errors.customer && (
                      <p className="form-error">{errors.customer.message}</p>
                    )}
                  </div>

                  {/* Origin */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="origin">Origin*</label>
                    <input
                      id="origin"
                      type="text"
                      className={`input ${errors.origin ? 'input-error' : ''}`}
                      {...register('origin', { required: 'Origin is required' })}
                    />
                    {errors.origin && (
                      <p className="form-error">{errors.origin.message}</p>
                    )}
                  </div>

                  {/* Destination */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="destination">Destination*</label>
                    <input
                      id="destination"
                      type="text"
                      className={`input ${errors.destination ? 'input-error' : ''}`}
                      {...register('destination', { required: 'Destination is required' })}
                    />
                    {errors.destination && (
                      <p className="form-error">{errors.destination.message}</p>
                    )}
                  </div>

                  {/* Departure Date */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="departureDate">Departure Date*</label>
                    <input
                      id="departureDate"
                      type="date"
                      className={`input ${errors.departureDate ? 'input-error' : ''}`}
                      {...register('departureDate', { required: 'Departure date is required' })}
                    />
                    {errors.departureDate && (
                      <p className="form-error">{errors.departureDate.message}</p>
                    )}
                  </div>

                  {/* Arrival Date */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="arrivalDate">Arrival Date*</label>
                    <input
                      id="arrivalDate"
                      type="date"
                      className={`input ${errors.arrivalDate ? 'input-error' : ''}`}
                      {...register('arrivalDate', { required: 'Arrival date is required' })}
                    />
                    {errors.arrivalDate && (
                      <p className="form-error">{errors.arrivalDate.message}</p>
                    )}
                  </div>

                  {/* Status */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="status">Status*</label>
                    <select
                      id="status"
                      className={`input ${errors.status ? 'input-error' : ''}`}
                      {...register('status', { required: 'Status is required' })}
                    >
                      <option value="pending">Pending</option>
                      <option value="in_transit">In Transit</option>
                      <option value="delivered">Delivered</option>
                      <option value="delayed">Delayed</option>
                    </select>
                    {errors.status && (
                      <p className="form-error">{errors.status.message}</p>
                    )}
                  </div>

                  {/* Transport Mode */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="transportMode">Transport Mode*</label>
                    <select
                      id="transportMode"
                      className={`input ${errors.transportMode ? 'input-error' : ''}`}
                      {...register('transportMode', { required: 'Transport mode is required' })}
                    >
                      <option value="road">Road</option>
                      <option value="sea">Sea</option>
                      <option value="air">Air</option>
                      <option value="rail">Rail</option>
                    </select>
                    {errors.transportMode && (
                      <p className="form-error">{errors.transportMode.message}</p>
                    )}
                  </div>

                  {/* Weight */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="weight">Weight (kg)*</label>
                    <input
                      id="weight"
                      type="number"
                      className={`input ${errors.weight ? 'input-error' : ''}`}
                      min="0"
                      step="0.1"
                      {...register('weight', { 
                        required: 'Weight is required',
                        min: { value: 0, message: 'Weight must be greater than 0' },
                        valueAsNumber: true
                      })}
                    />
                    {errors.weight && (
                      <p className="form-error">{errors.weight.message}</p>
                    )}
                  </div>

                  {/* Priority */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="priority">Priority*</label>
                    <select
                      id="priority"
                      className={`input ${errors.priority ? 'input-error' : ''}`}
                      {...register('priority', { required: 'Priority is required' })}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                    {errors.priority && (
                      <p className="form-error">{errors.priority.message}</p>
                    )}
                  </div>
                </div>

                {/* Notes */}
                <div className="form-group">
                  <label className="form-label" htmlFor="notes">Notes</label>
                  <textarea
                    id="notes"
                    className="input min-h-24"
                    {...register('notes')}
                  />
                </div>

                <div className="flex justify-between items-center mt-6">
                  <div>
                    {!currentShipment && (
                      <button
                        type="button"
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm flex items-center gap-1"
                        onClick={downloadTemplate}
                      >
                        <Download className="w-4 h-4" />
                        Download template
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                      onClick={closeModal}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      {currentShipment ? 'Update Shipment' : 'Add Shipment'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 shadow-sm p-4 sm:p-6 mt-auto">
        <div className="container-fluid text-center text-gray-500 dark:text-gray-400 text-sm">
          Copyright © 2025 of Datavtar Private Limited. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default App;