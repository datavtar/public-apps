import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import styles from './styles/styles.module.css';
import {
  Package, Truck, CheckCircle, AlertTriangle, XCircle, Clock, MapPin, Plus, Edit, Trash2, Search, Filter,
  ArrowUp, ArrowDown, Sun, Moon, Upload, Download, ArrowUpDown, X // Added ArrowUpDown and X
} from 'lucide-react';

// --- Enums & Types --- 

enum ShipmentStatus {
  Pending = 'Pending',
  InTransit = 'In Transit',
  OutForDelivery = 'Out for Delivery',
  Delivered = 'Delivered',
  Delayed = 'Delayed',
  Exception = 'Exception',
}

interface Shipment {
  id: string;
  trackingNumber: string;
  origin: string;
  destination: string;
  status: ShipmentStatus;
  estimatedDelivery: string; // ISO string date
  lastUpdated: string; // ISO string date
}

type SortKey = keyof Shipment;
type SortDirection = 'asc' | 'desc';

interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}

// --- Helper Functions --- 

const getStatusIcon = (status: ShipmentStatus): React.ReactNode => {
  switch (status) {
    case ShipmentStatus.Pending: return <Clock size={18} className="text-gray-500" />;
    case ShipmentStatus.InTransit: return <Truck size={18} className="text-blue-500" />;
    case ShipmentStatus.OutForDelivery: return <Package size={18} className="text-yellow-500" />;
    case ShipmentStatus.Delivered: return <CheckCircle size={18} className="text-green-500" />;
    case ShipmentStatus.Delayed: return <AlertTriangle size={18} className="text-orange-500" />;
    case ShipmentStatus.Exception: return <XCircle size={18} className="text-red-500" />;
    default: return null;
  }
};

const getStatusColor = (status: ShipmentStatus): string => {
  switch (status) {
    case ShipmentStatus.Pending: return '#a0aec0'; // gray-500
    case ShipmentStatus.InTransit: return '#3b82f6'; // blue-500
    case ShipmentStatus.OutForDelivery: return '#f59e0b'; // yellow-500
    case ShipmentStatus.Delivered: return '#22c55e'; // green-500
    case ShipmentStatus.Delayed: return '#f97316'; // orange-500
    case ShipmentStatus.Exception: return '#ef4444'; // red-500
    default: return '#6b7280'; // gray-500
  }
};

const formatDate = (dateString: string): string => {
  try {
    return format(new Date(dateString), 'MMM dd, yyyy');
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

// --- Local Storage Utility --- 

const LOCAL_STORAGE_KEY = 'logistics_shipments';
const THEME_STORAGE_KEY = 'logistics_theme';

const loadShipments = (): Shipment[] => {
  try {
    const storedShipments = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedShipments) {
      return JSON.parse(storedShipments) as Shipment[];
    }
  } catch (error) {
    console.error("Error loading shipments from localStorage:", error);
  }
  // Initial sample data if nothing in local storage
  return [
    { id: '1', trackingNumber: 'DT123456789', origin: 'New York, USA', destination: 'London, UK', status: ShipmentStatus.InTransit, estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), lastUpdated: new Date().toISOString() },
    { id: '2', trackingNumber: 'DT987654321', origin: 'Shanghai, CN', destination: 'Los Angeles, USA', status: ShipmentStatus.Delivered, estimatedDelivery: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
    { id: '3', trackingNumber: 'DT555111222', origin: 'Berlin, DE', destination: 'Paris, FR', status: ShipmentStatus.Pending, estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), lastUpdated: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() },
    { id: '4', trackingNumber: 'DT333444555', origin: 'Sydney, AU', destination: 'Tokyo, JP', status: ShipmentStatus.OutForDelivery, estimatedDelivery: new Date().toISOString(), lastUpdated: new Date().toISOString() },
  ];
};

const saveShipments = (shipments: Shipment[]) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(shipments));
  } catch (error) {
    console.error("Error saving shipments to localStorage:", error);
  }
};

const loadTheme = (): boolean => {
  try {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (storedTheme) {
      return storedTheme === 'dark';
    }
    // Default to system preference if no setting saved
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  } catch (error) {
    console.error("Error loading theme from localStorage:", error);
    return false;
  }
};

const saveTheme = (isDark: boolean) => {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, isDark ? 'dark' : 'light');
  } catch (error) {
    console.error("Error saving theme to localStorage:", error);
  }
};

// --- Main App Component ---

const App: React.FC = () => {
  const [shipments, setShipments] = useState<Shipment[]>(loadShipments);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(loadTheme);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<ShipmentStatus | 'all'>('all');
  const [sortConfig, setSortConfig] = useState<SortConfig | null>({
    key: 'lastUpdated',
    direction: 'desc',
  });
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingShipment, setEditingShipment] = useState<Shipment | null>(null);

  // Form state for add/edit modal
  const [formState, setFormState] = useState<Omit<Shipment, 'id' | 'lastUpdated'>>({
    trackingNumber: '',
    origin: '',
    destination: '',
    status: ShipmentStatus.Pending,
    estimatedDelivery: '',
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof Omit<Shipment, 'id' | 'lastUpdated'>, string>>>({});

  // --- Effects ---

  // Save shipments to localStorage whenever they change
  useEffect(() => {
    saveShipments(shipments);
  }, [shipments]);

  // Apply dark mode class and save preference
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    saveTheme(isDarkMode);
  }, [isDarkMode]);

  // Add ESC key listener for modal
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeModal();
      }
    };
    if (isModalOpen) {
      window.addEventListener('keydown', handleEsc);
    } else {
      window.removeEventListener('keydown', handleEsc);
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModalOpen]);

  // --- Data Filtering and Sorting ---

  const filteredAndSortedShipments = useMemo(() => {
    let filtered = shipments.filter(shipment => {
      const searchTermLower = searchTerm.toLowerCase();
      const matchesSearch = (
        shipment.trackingNumber.toLowerCase().includes(searchTermLower) ||
        shipment.origin.toLowerCase().includes(searchTermLower) ||
        shipment.destination.toLowerCase().includes(searchTermLower)
      );
      const matchesFilter = filterStatus === 'all' || shipment.status === filterStatus;
      return matchesSearch && matchesFilter;
    });

    if (sortConfig !== null) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [shipments, searchTerm, filterStatus, sortConfig]);

  // --- Event Handlers ---

  const handleSort = (key: SortKey) => {
    let direction: SortDirection = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const toggleTheme = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  const openModal = (shipmentToEdit: Shipment | null = null) => {
    setEditingShipment(shipmentToEdit);
    if (shipmentToEdit) {
      setFormState({
        trackingNumber: shipmentToEdit.trackingNumber,
        origin: shipmentToEdit.origin,
        destination: shipmentToEdit.destination,
        status: shipmentToEdit.status,
        estimatedDelivery: shipmentToEdit.estimatedDelivery ? format(new Date(shipmentToEdit.estimatedDelivery), 'yyyy-MM-dd') : '',
      });
    } else {
      // Reset form for adding new
      setFormState({
        trackingNumber: '',
        origin: '',
        destination: '',
        status: ShipmentStatus.Pending,
        estimatedDelivery: '',
      });
    }
    setFormErrors({}); // Clear previous errors
    setIsModalOpen(true);
    document.body.classList.add('modal-open');
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingShipment(null);
    document.body.classList.remove('modal-open');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState(prevState => ({
      ...prevState,
      [name]: value,
    }));
    // Clear error for this field on change
    setFormErrors(prevErrors => ({
        ...prevErrors,
        [name]: undefined
    }));
  };

  const validateForm = (): boolean => {
      const errors: Partial<Record<keyof Omit<Shipment, 'id' | 'lastUpdated'>, string>> = {};
      if (!formState.trackingNumber.trim()) errors.trackingNumber = 'Tracking number is required';
      if (!formState.origin.trim()) errors.origin = 'Origin is required';
      if (!formState.destination.trim()) errors.destination = 'Destination is required';
      if (!formState.estimatedDelivery) {
          errors.estimatedDelivery = 'Estimated delivery date is required';
      } else {
          try {
              new Date(formState.estimatedDelivery).toISOString();
          } catch {
              errors.estimatedDelivery = 'Invalid date format';
          }
      }
      setFormErrors(errors);
      return Object.keys(errors).length === 0;
  }

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    const now = new Date().toISOString();
    const shipmentData = {
      ...formState,
      estimatedDelivery: new Date(formState.estimatedDelivery).toISOString(), // Ensure ISO string format
      lastUpdated: now,
    };

    if (editingShipment) {
      // Update existing shipment
      setShipments(prevShipments =>
        prevShipments.map(s =>
          s.id === editingShipment.id ? { ...s, ...shipmentData } : s
        )
      );
    } else {
      // Add new shipment
      const newShipment: Shipment = {
        ...shipmentData,
        id: Date.now().toString(), // Simple unique ID
      };
      setShipments(prevShipments => [newShipment, ...prevShipments]);
    }
    closeModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this shipment?')) {
      setShipments(prevShipments => prevShipments.filter(s => s.id !== id));
    }
  };

  // --- Chart Data ---
  const chartData = useMemo(() => {
    const statusCounts = shipments.reduce((acc, shipment) => {
      acc[shipment.status] = (acc[shipment.status] || 0) + 1;
      return acc;
    }, {} as Record<ShipmentStatus, number>);

    return Object.entries(statusCounts).map(([name, value]) => ({
      name: name as ShipmentStatus,
      value,
    }));
  }, [shipments]);

  // --- Sort Indicator ---
  const SortIndicator: React.FC<{ columnKey: SortKey }> = ({ columnKey }) => {
    if (!sortConfig || sortConfig.key !== columnKey) {
      // Fixed: Use ArrowUpDown instead of ArrowDownUp
      return <ArrowUpDown size={14} className="ml-1 opacity-30" />;
    }
    return sortConfig.direction === 'asc' ? (
      <ArrowUp size={14} className="ml-1" />
    ) : (
      <ArrowDown size={14} className="ml-1" />
    );
  };

  // --- JSX ---
  return (
    <div className={`min-h-screen flex flex-col theme-transition-all ${styles.appContainer} ${isDarkMode ? 'dark' : ''}`}>
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-md sticky top-0 z-[var(--z-sticky)] theme-transition-bg">
        <div className="container-wide py-3 px-4 flex-between">
          <h1 className="text-xl sm:text-2xl font-bold text-primary-600 dark:text-primary-400 flex items-center gap-2">
            <Truck size={24} />
            <span>Logistics Dashboard</span>
          </h1>
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              className="btn btn-primary btn-sm sm:btn-responsive flex items-center gap-1"
              onClick={() => openModal()}
              aria-label="Add new shipment"
              name="add-shipment-button"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Add Shipment</span>
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              name="theme-toggle-button"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container-wide py-4 sm:py-6 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Shipments List (Takes 2/3 width on large screens) */}
          <div className="lg:col-span-2">
            <div className="card card-responsive mb-6">
              <h2 className="text-lg sm:text-xl font-semibold mb-4">Shipment Overview</h2>
              {/* Controls: Search, Filter */}
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="flex-grow relative">
                  <input
                    type="text"
                    placeholder="Search Tracking #, Origin, Destination..."
                    className="input input-responsive pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    aria-label="Search shipments"
                    name="search-input"
                  />
                  <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
                <div className="relative">
                  <select
                    className="input input-responsive appearance-none pr-8"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as ShipmentStatus | 'all')}
                    aria-label="Filter by status"
                    name="filter-status-select"
                  >
                    <option value="all">All Statuses</option>
                    {Object.values(ShipmentStatus).map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                  <Filter size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Shipments Table */}
              <div className="table-container">
                <table className="table">
                  <thead className="table-header">
                    <tr>
                      {/* FIX: Removed extra quote in onClick */}
                      <th className="table-cell px-4 py-2 sm:px-6 sm:py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-600" onClick={() => handleSort('trackingNumber')}>
                        <div className="flex items-center">Tracking # <SortIndicator columnKey='trackingNumber' /></div>
                      </th>
                      {/* FIX: Removed extra quote in onClick */}
                      <th className="table-cell px-4 py-2 sm:px-6 sm:py-3 hidden md:table-cell cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-600" onClick={() => handleSort('origin')}>
                         <div className="flex items-center">Origin <SortIndicator columnKey='origin' /></div>
                      </th>
                      {/* FIX: Removed extra quote in onClick */}
                      <th className="table-cell px-4 py-2 sm:px-6 sm:py-3 hidden lg:table-cell cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-600" onClick={() => handleSort('destination')}>
                         <div className="flex items-center">Destination <SortIndicator columnKey='destination' /></div>
                      </th>
                      {/* FIX: Removed extra quote in onClick */}
                      <th className="table-cell px-4 py-2 sm:px-6 sm:py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-600" onClick={() => handleSort('status')}>
                         <div className="flex items-center">Status <SortIndicator columnKey='status' /></div>
                      </th>
                      {/* FIX: Removed extra quote in onClick */}
                      <th className="table-cell px-4 py-2 sm:px-6 sm:py-3 hidden sm:table-cell cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-600" onClick={() => handleSort('estimatedDelivery')}>
                         <div className="flex items-center">Est. Delivery <SortIndicator columnKey='estimatedDelivery' /></div>
                      </th>
                      <th className="table-cell px-4 py-2 sm:px-6 sm:py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700 theme-transition-all">
                    {filteredAndSortedShipments.length > 0 ? (
                      filteredAndSortedShipments.map(shipment => (
                        <tr key={shipment.id} className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                          <td className="table-cell px-4 py-2 sm:px-6 sm:py-4 font-medium text-gray-900 dark:text-white">{shipment.trackingNumber}</td>
                          <td className="table-cell px-4 py-2 sm:px-6 sm:py-4 hidden md:table-cell">{shipment.origin}</td>
                          <td className="table-cell px-4 py-2 sm:px-6 sm:py-4 hidden lg:table-cell">{shipment.destination}</td>
                          <td className="table-cell px-4 py-2 sm:px-6 sm:py-4">
                            <span className={`badge flex items-center gap-1.5 ${styles[`badge-${shipment.status.toLowerCase().replace(/ /g, '-')}`]}`}>
                              {getStatusIcon(shipment.status)}
                              {shipment.status}
                            </span>
                          </td>
                          <td className="table-cell px-4 py-2 sm:px-6 sm:py-4 hidden sm:table-cell">{formatDate(shipment.estimatedDelivery)}</td>
                          <td className="table-cell px-4 py-2 sm:px-6 sm:py-4 text-right space-x-1 sm:space-x-2">
                            <button
                              className="btn btn-sm p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                              onClick={() => openModal(shipment)}
                              aria-label={`Edit shipment ${shipment.trackingNumber}`}
                              name={`edit-${shipment.id}`}
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              className="btn btn-sm p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                              onClick={() => handleDelete(shipment.id)}
                              aria-label={`Delete shipment ${shipment.trackingNumber}`}
                              name={`delete-${shipment.id}`}
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="table-cell px-4 py-10 sm:px-6 sm:py-10 text-center text-gray-500 dark:text-slate-400">
                          No shipments found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Status Chart (Takes 1/3 width on large screens) */}
          <div className="lg:col-span-1">
            <div className="card card-responsive">
              <h2 className="text-lg sm:text-xl font-semibold mb-4">Shipment Status Distribution</h2>
              {chartData.length > 0 ? (
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <RechartsPieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getStatusColor(entry.name)} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number, name: string) => [`${value} shipments`, name]} />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center text-gray-500 dark:text-slate-400 py-10">No data available for chart.</div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 dark:bg-slate-900 text-center py-4 theme-transition-bg mt-auto">
        <p className="text-sm text-gray-600 dark:text-slate-400">
          Copyright © {new Date().getFullYear()} Datavtar Private Limited. All rights reserved.
        </p>
      </footer>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div
          className="modal-backdrop fade-in"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div
            className="modal-content slide-in theme-transition-all w-full max-w-lg"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
          >
            <form onSubmit={handleFormSubmit}>
              <div className="modal-header">
                <h3 id="modal-title" className="text-lg font-semibold">
                  {editingShipment ? 'Edit Shipment' : 'Add New Shipment'}
                </h3>
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  onClick={closeModal}
                  aria-label="Close modal"
                >
                  {/* Fixed: Imported X icon is now available */}
                  <X size={24} />
                </button>
              </div>

              <div className="mt-4 space-y-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="trackingNumber">Tracking Number</label>
                  <input
                    id="trackingNumber"
                    name="trackingNumber"
                    type="text"
                    required
                    className={`input ${formErrors.trackingNumber ? 'border-red-500 dark:border-red-400' : ''}`}
                    value={formState.trackingNumber}
                    onChange={handleInputChange}
                    aria-describedby={formErrors.trackingNumber ? "trackingNumber-error" : undefined}
                  />
                  {formErrors.trackingNumber && <p id="trackingNumber-error" className="form-error">{formErrors.trackingNumber}</p>}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label" htmlFor="origin">Origin</label>
                    <input
                      id="origin"
                      name="origin"
                      type="text"
                      required
                      className={`input ${formErrors.origin ? 'border-red-500 dark:border-red-400' : ''}`}
                      value={formState.origin}
                      onChange={handleInputChange}
                      aria-describedby={formErrors.origin ? "origin-error" : undefined}
                    />
                     {formErrors.origin && <p id="origin-error" className="form-error">{formErrors.origin}</p>}
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="destination">Destination</label>
                    <input
                      id="destination"
                      name="destination"
                      type="text"
                      required
                      className={`input ${formErrors.destination ? 'border-red-500 dark:border-red-400' : ''}`}
                      value={formState.destination}
                      onChange={handleInputChange}
                       aria-describedby={formErrors.destination ? "destination-error" : undefined}
                    />
                    {formErrors.destination && <p id="destination-error" className="form-error">{formErrors.destination}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="form-group">
                        <label className="form-label" htmlFor="status">Status</label>
                        <select
                            id="status"
                            name="status"
                            required
                            className={`input ${formErrors.status ? 'border-red-500 dark:border-red-400' : ''}`}
                            value={formState.status}
                            onChange={handleInputChange}
                        >
                            {Object.values(ShipmentStatus).map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="estimatedDelivery">Est. Delivery Date</label>
                        <input
                            id="estimatedDelivery"
                            name="estimatedDelivery"
                            type="date"
                            required
                            className={`input ${formErrors.estimatedDelivery ? 'border-red-500 dark:border-red-400' : ''}`}
                            value={formState.estimatedDelivery}
                            onChange={handleInputChange}
                            aria-describedby={formErrors.estimatedDelivery ? "estimatedDelivery-error" : undefined}
                        />
                        {formErrors.estimatedDelivery && <p id="estimatedDelivery-error" className="form-error">{formErrors.estimatedDelivery}</p>}
                    </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500"
                  onClick={closeModal}
                  name="cancel-modal-button"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" name="save-shipment-button">
                  {editingShipment ? 'Save Changes' : 'Add Shipment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;