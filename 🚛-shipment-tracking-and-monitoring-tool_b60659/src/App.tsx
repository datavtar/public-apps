import React, { useState, useEffect } from 'react';
import { Sun, Moon, Truck, Package, Filter, Search, Plus, ArrowUpDown, Edit, Trash2, MapPin, Clock, Calendar, TrendingUp, TrendingDown, ChevronDown, ChevronUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import styles from './styles/styles.module.css';

// Define TypeScript interfaces
interface Shipment {
  id: string;
  trackingNumber: string;
  origin: string;
  destination: string;
  status: ShipmentStatus;
  carrier: string;
  departureDate: string;
  estimatedArrival: string;
  weight: number;
  priority: Priority;
  notes?: string;
  lastUpdated: string;
}

type ShipmentStatus = 'pending' | 'in_transit' | 'delivered' | 'delayed' | 'cancelled';
type Priority = 'low' | 'medium' | 'high';

interface FilterState {
  status: ShipmentStatus | 'all';
  priority: Priority | 'all';
  carrier: string;
  search: string;
}

interface StatusCount {
  name: string;
  value: number;
  color: string;
}

const App: React.FC = () => {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode === 'true' || 
      (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // Data states
  const [shipments, setShipments] = useState<Shipment[]>(() => {
    const savedShipments = localStorage.getItem('shipments');
    return savedShipments ? JSON.parse(savedShipments) : generateSampleShipments();
  });
  
  const [filteredShipments, setFilteredShipments] = useState<Shipment[]>(shipments);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Shipment; direction: 'ascending' | 'descending' } | null>(null);
  
  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    status: 'all',
    priority: 'all',
    carrier: '',
    search: ''
  });
  
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Save dark mode preference
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  // Save shipments to localStorage
  useEffect(() => {
    localStorage.setItem('shipments', JSON.stringify(shipments));
    applyFilters();
  }, [shipments]);

  // Apply filters whenever filters change
  useEffect(() => {
    applyFilters();
  }, [filters]);

  // Handle Escape key for modals
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isModalOpen) setIsModalOpen(false);
        if (isDeleteModalOpen) setIsDeleteModalOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isModalOpen, isDeleteModalOpen]);

  // Calculate dashboard metrics
  const totalShipments = shipments.length;
  const inTransitCount = shipments.filter(s => s.status === 'in_transit').length;
  const delayedCount = shipments.filter(s => s.status === 'delayed').length;
  const deliveredCount = shipments.filter(s => s.status === 'delivered').length;

  const statusCounts: StatusCount[] = [
    { name: 'Pending', value: shipments.filter(s => s.status === 'pending').length, color: '#F59E0B' },
    { name: 'In Transit', value: inTransitCount, color: '#3B82F6' },
    { name: 'Delivered', value: deliveredCount, color: '#10B981' },
    { name: 'Delayed', value: delayedCount, color: '#EF4444' },
    { name: 'Cancelled', value: shipments.filter(s => s.status === 'cancelled').length, color: '#6B7280' }
  ];

  const carrierData = getCarrierData(shipments);

  // Handlers
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleAddShipment = () => {
    setSelectedShipment(null);
    setIsModalOpen(true);
  };

  const handleEditShipment = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedShipment) {
      const updatedShipments = shipments.filter(s => s.id !== selectedShipment.id);
      setShipments(updatedShipments);
      setIsDeleteModalOpen(false);
    }
  };

  const handleSaveShipment = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    
    const newShipment: Shipment = {
      id: selectedShipment?.id || crypto.randomUUID(),
      trackingNumber: (form.elements.namedItem('trackingNumber') as HTMLInputElement).value,
      origin: (form.elements.namedItem('origin') as HTMLInputElement).value,
      destination: (form.elements.namedItem('destination') as HTMLInputElement).value,
      status: (form.elements.namedItem('status') as HTMLSelectElement).value as ShipmentStatus,
      carrier: (form.elements.namedItem('carrier') as HTMLInputElement).value,
      departureDate: (form.elements.namedItem('departureDate') as HTMLInputElement).value,
      estimatedArrival: (form.elements.namedItem('estimatedArrival') as HTMLInputElement).value,
      weight: parseFloat((form.elements.namedItem('weight') as HTMLInputElement).value),
      priority: (form.elements.namedItem('priority') as HTMLSelectElement).value as Priority,
      notes: (form.elements.namedItem('notes') as HTMLTextAreaElement).value,
      lastUpdated: new Date().toISOString()
    };

    if (selectedShipment) {
      // Update existing shipment
      setShipments(shipments.map(s => s.id === selectedShipment.id ? newShipment : s));
    } else {
      // Add new shipment
      setShipments([...shipments, newShipment]);
    }

    setIsModalOpen(false);
  };

  const handleSort = (key: keyof Shipment) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    
    setSortConfig({ key, direction });
    
    const sortedShipments = [...filteredShipments].sort((a, b) => {
      if (a[key] < b[key]) {
        return direction === 'ascending' ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
    
    setFilteredShipments(sortedShipments);
  };

  const applyFilters = () => {
    let result = [...shipments];

    // Filter by status
    if (filters.status !== 'all') {
      result = result.filter(shipment => shipment.status === filters.status);
    }

    // Filter by priority
    if (filters.priority !== 'all') {
      result = result.filter(shipment => shipment.priority === filters.priority);
    }

    // Filter by carrier
    if (filters.carrier) {
      result = result.filter(shipment => 
        shipment.carrier.toLowerCase().includes(filters.carrier.toLowerCase())
      );
    }

    // Search filter (searches across multiple fields)
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      result = result.filter(shipment => 
        shipment.trackingNumber.toLowerCase().includes(searchTerm) ||
        shipment.origin.toLowerCase().includes(searchTerm) ||
        shipment.destination.toLowerCase().includes(searchTerm) ||
        shipment.carrier.toLowerCase().includes(searchTerm)
      );
    }

    // Apply sorting if active
    if (sortConfig) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredShipments(result);
  };

  const resetFilters = () => {
    setFilters({
      status: 'all',
      priority: 'all',
      carrier: '',
      search: ''
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm">
        <div className="container-fluid py-4">
          <div className="flex-between">
            <div className="flex items-center gap-2">
              <Truck className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Shipment Tracker</h1>
            </div>
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-md text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-slate-700 transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      <main className="container-fluid py-6">
        {/* Dashboard */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Dashboard</h2>
          
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="stat-card">
              <div className="stat-title">Total Shipments</div>
              <div className="stat-value">{totalShipments}</div>
              <div className="stat-desc flex items-center gap-1">
                <Package className="h-4 w-4" /> All shipments
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-title">In Transit</div>
              <div className="stat-value">{inTransitCount}</div>
              <div className="stat-desc flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-blue-500" /> {Math.round((inTransitCount / totalShipments) * 100)}% of shipments
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-title">Delayed</div>
              <div className="stat-value">{delayedCount}</div>
              <div className="stat-desc flex items-center gap-1 text-red-500">
                <TrendingDown className="h-4 w-4" /> Needs attention
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-title">Delivered</div>
              <div className="stat-value">{deliveredCount}</div>
              <div className="stat-desc flex items-center gap-1 text-green-500">
                <TrendingUp className="h-4 w-4" /> On time deliveries
              </div>
            </div>
          </div>
          
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Shipment Status</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusCounts}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {statusCounts.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="card">
              <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Shipments by Carrier</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={carrierData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#3B82F6" name="Shipments" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Shipments List */}
        <div className="card">
          <div className="flex-between mb-4 flex-col md:flex-row gap-3">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Shipments</h2>
            
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search shipments..."
                  className="input pr-10"
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
              </div>
              
              <div className="flex gap-2">
                <button 
                  className="btn btn-secondary flex items-center gap-2"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-4 w-4" />
                  {showFilters ? 'Hide Filters' : 'Show Filters'}
                </button>
                
                <button 
                  className="btn btn-primary flex items-center gap-2"
                  onClick={handleAddShipment}
                >
                  <Plus className="h-4 w-4" />
                  Add Shipment
                </button>
              </div>
            </div>
          </div>
          
          {/* Filters */}
          {showFilters && (
            <div className={`${styles.filtersPanel} mb-4 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="form-label">Status</label>
                  <select 
                    className="input"
                    value={filters.status}
                    onChange={(e) => setFilters({...filters, status: e.target.value as ShipmentStatus | 'all'})}
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="in_transit">In Transit</option>
                    <option value="delivered">Delivered</option>
                    <option value="delayed">Delayed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                
                <div>
                  <label className="form-label">Priority</label>
                  <select 
                    className="input"
                    value={filters.priority}
                    onChange={(e) => setFilters({...filters, priority: e.target.value as Priority | 'all'})}
                  >
                    <option value="all">All Priorities</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                
                <div>
                  <label className="form-label">Carrier</label>
                  <input 
                    type="text" 
                    className="input"
                    placeholder="Filter by carrier"
                    value={filters.carrier}
                    onChange={(e) => setFilters({...filters, carrier: e.target.value})}
                  />
                </div>
                
                <div className="flex items-end">
                  <button 
                    className="btn bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600 w-full"
                    onClick={resetFilters}
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Shipments Table */}
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th className="table-header">
                    <button 
                      className="flex items-center gap-1"
                      onClick={() => handleSort('trackingNumber')}
                    >
                      Tracking #
                      <ArrowUpDown className="h-4 w-4" />
                    </button>
                  </th>
                  <th className="table-header">
                    <button 
                      className="flex items-center gap-1"
                      onClick={() => handleSort('origin')}
                    >
                      Origin
                      <ArrowUpDown className="h-4 w-4" />
                    </button>
                  </th>
                  <th className="table-header">
                    <button 
                      className="flex items-center gap-1"
                      onClick={() => handleSort('destination')}
                    >
                      Destination
                      <ArrowUpDown className="h-4 w-4" />
                    </button>
                  </th>
                  <th className="table-header">
                    <button 
                      className="flex items-center gap-1"
                      onClick={() => handleSort('status')}
                    >
                      Status
                      <ArrowUpDown className="h-4 w-4" />
                    </button>
                  </th>
                  <th className="table-header">
                    <button 
                      className="flex items-center gap-1"
                      onClick={() => handleSort('carrier')}
                    >
                      Carrier
                      <ArrowUpDown className="h-4 w-4" />
                    </button>
                  </th>
                  <th className="table-header">
                    <button 
                      className="flex items-center gap-1"
                      onClick={() => handleSort('priority')}
                    >
                      Priority
                      <ArrowUpDown className="h-4 w-4" />
                    </button>
                  </th>
                  <th className="table-header">
                    <button 
                      className="flex items-center gap-1"
                      onClick={() => handleSort('estimatedArrival')}
                    >
                      Est. Arrival
                      <ArrowUpDown className="h-4 w-4" />
                    </button>
                  </th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                {filteredShipments.length > 0 ? (
                  filteredShipments.map((shipment) => (
                    <tr key={shipment.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                      <td className="table-cell font-medium">{shipment.trackingNumber}</td>
                      <td className="table-cell">{shipment.origin}</td>
                      <td className="table-cell">{shipment.destination}</td>
                      <td className="table-cell">
                        <StatusBadge status={shipment.status} />
                      </td>
                      <td className="table-cell">{shipment.carrier}</td>
                      <td className="table-cell">
                        <PriorityBadge priority={shipment.priority} />
                      </td>
                      <td className="table-cell">{formatDate(shipment.estimatedArrival)}</td>
                      <td className="table-cell">
                        <div className="flex gap-2">
                          <button 
                            className="p-1 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                            onClick={() => handleEditShipment(shipment)}
                            aria-label="Edit shipment"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            className="p-1 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                            onClick={() => handleDeleteClick(shipment)}
                            aria-label="Delete shipment"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="table-cell text-center py-8 text-gray-500 dark:text-gray-400">
                      No shipments found. Try adjusting your filters or add a new shipment.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Shipment Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white" id="modal-title">
                {selectedShipment ? 'Edit Shipment' : 'Add New Shipment'}
              </h3>
              <button 
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                onClick={() => setIsModalOpen(false)}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSaveShipment}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="trackingNumber">Tracking Number</label>
                  <input 
                    type="text" 
                    id="trackingNumber"
                    name="trackingNumber"
                    className="input"
                    defaultValue={selectedShipment?.trackingNumber || ''}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="carrier">Carrier</label>
                  <input 
                    type="text" 
                    id="carrier"
                    name="carrier"
                    className="input"
                    defaultValue={selectedShipment?.carrier || ''}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="origin">Origin</label>
                  <input 
                    type="text" 
                    id="origin"
                    name="origin"
                    className="input"
                    defaultValue={selectedShipment?.origin || ''}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="destination">Destination</label>
                  <input 
                    type="text" 
                    id="destination"
                    name="destination"
                    className="input"
                    defaultValue={selectedShipment?.destination || ''}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="status">Status</label>
                  <select 
                    id="status"
                    name="status"
                    className="input"
                    defaultValue={selectedShipment?.status || 'pending'}
                  >
                    <option value="pending">Pending</option>
                    <option value="in_transit">In Transit</option>
                    <option value="delivered">Delivered</option>
                    <option value="delayed">Delayed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="priority">Priority</label>
                  <select 
                    id="priority"
                    name="priority"
                    className="input"
                    defaultValue={selectedShipment?.priority || 'medium'}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="departureDate">Departure Date</label>
                  <input 
                    type="date" 
                    id="departureDate"
                    name="departureDate"
                    className="input"
                    defaultValue={selectedShipment?.departureDate || getCurrentDate()}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="estimatedArrival">Estimated Arrival</label>
                  <input 
                    type="date" 
                    id="estimatedArrival"
                    name="estimatedArrival"
                    className="input"
                    defaultValue={selectedShipment?.estimatedArrival || getCurrentDate(7)}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="weight">Weight (kg)</label>
                  <input 
                    type="number" 
                    id="weight"
                    name="weight"
                    step="0.01"
                    min="0"
                    className="input"
                    defaultValue={selectedShipment?.weight || ''}
                    required
                  />
                </div>
              </div>
              
              <div className="form-group mt-2">
                <label className="form-label" htmlFor="notes">Notes</label>
                <textarea 
                  id="notes"
                  name="notes"
                  className="input h-24"
                  defaultValue={selectedShipment?.notes || ''}
                  placeholder="Additional information about this shipment..."
                ></textarea>
              </div>
              
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {selectedShipment ? 'Update Shipment' : 'Add Shipment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedShipment && (
        <div className="modal-backdrop" onClick={() => setIsDeleteModalOpen(false)}>
          <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Confirm Deletion
              </h3>
              <button 
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                onClick={() => setIsDeleteModalOpen(false)}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
            
            <div className="mt-4">
              <p className="text-gray-600 dark:text-gray-300">
                Are you sure you want to delete the shipment with tracking number <span className="font-semibold">{selectedShipment.trackingNumber}</span>? This action cannot be undone.
              </p>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                className="btn bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
                onClick={handleDeleteConfirm}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 py-4 mt-12">
        <div className="container-fluid text-center text-gray-500 dark:text-gray-400 text-sm">
          Copyright © 2025 of Datavtar Private Limited. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

// Helper components
const StatusBadge: React.FC<{ status: ShipmentStatus }> = ({ status }) => {
  const statusConfig = {
    pending: { className: 'badge-warning', label: 'Pending' },
    in_transit: { className: 'badge-info', label: 'In Transit' },
    delivered: { className: 'badge-success', label: 'Delivered' },
    delayed: { className: 'badge-error', label: 'Delayed' },
    cancelled: { className: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300', label: 'Cancelled' }
  };

  const config = statusConfig[status];

  return (
    <span className={`badge ${config.className}`}>
      {config.label}
    </span>
  );
};

const PriorityBadge: React.FC<{ priority: Priority }> = ({ priority }) => {
  const priorityConfig = {
    low: { className: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300', label: 'Low' },
    medium: { className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', label: 'Medium' },
    high: { className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', label: 'High' }
  };

  const config = priorityConfig[priority];

  return (
    <span className={`badge ${config.className}`}>
      {config.label}
    </span>
  );
};

// Helper functions
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

function getCurrentDate(addDays: number = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + addDays);
  return date.toISOString().split('T')[0];
}

function generateSampleShipments(): Shipment[] {
  const carriers = ['FedEx', 'UPS', 'DHL', 'USPS', 'Amazon Logistics'];
  const origins = ['New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Miami, FL'];
  const destinations = ['Seattle, WA', 'Boston, MA', 'Denver, CO', 'Atlanta, GA', 'San Francisco, CA'];
  const statuses: ShipmentStatus[] = ['pending', 'in_transit', 'delivered', 'delayed', 'cancelled'];
  const priorities: Priority[] = ['low', 'medium', 'high'];
  
  const getRandomItem = <T,>(array: T[]): T => array[Math.floor(Math.random() * array.length)];
  
  const generateTrackingNumber = (): string => {
    const prefix = getRandomItem(['FDX', 'UPS', 'DHL', 'USP', 'AMZ']);
    const numbers = Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
    return `${prefix}${numbers}`;
  };
  
  const getRandomDate = (startDate: Date, endDate: Date): string => {
    const date = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
    return date.toISOString().split('T')[0];
  };
  
  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(now.getDate() + 30);
  
  return Array.from({ length: 20 }, (_, i) => {
    const departureDate = getRandomDate(new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000), now);
    const estimatedArrival = getRandomDate(now, futureDate);
    
    return {
      id: crypto.randomUUID(),
      trackingNumber: generateTrackingNumber(),
      origin: getRandomItem(origins),
      destination: getRandomItem(destinations),
      status: getRandomItem(statuses),
      carrier: getRandomItem(carriers),
      departureDate,
      estimatedArrival,
      weight: parseFloat((Math.random() * 100 + 1).toFixed(2)),
      priority: getRandomItem(priorities),
      notes: Math.random() > 0.5 ? `Sample notes for shipment ${i + 1}` : undefined,
      lastUpdated: new Date().toISOString()
    };
  });
}

function getCarrierData(shipments: Shipment[]): { name: string; value: number }[] {
  const carrierCounts: Record<string, number> = {};
  
  shipments.forEach(shipment => {
    if (carrierCounts[shipment.carrier]) {
      carrierCounts[shipment.carrier]++;
    } else {
      carrierCounts[shipment.carrier] = 1;
    }
  });
  
  return Object.entries(carrierCounts).map(([name, value]) => ({ name, value }));
}

export default App;
