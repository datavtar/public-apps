import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import {
  Truck,
  Package,
  MapPin,
  Calendar,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  Moon,
  Sun,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  SortAsc,
  SortDesc,
} from 'lucide-react';
import styles from './styles/styles.module.css';

type ShipmentStatus = 'in_transit' | 'delivered' | 'delayed' | 'scheduled';

interface Shipment {
  id: string;
  trackingNumber: string;
  origin: string;
  destination: string;
  departureDate: Date;
  estimatedArrival: Date;
  status: ShipmentStatus;
  carrier: string;
  weight: number;
  packageCount: number;
  priority: 'low' | 'medium' | 'high';
  notes?: string;
}

interface ShipmentFormData {
  trackingNumber: string;
  origin: string;
  destination: string;
  departureDate: string;
  estimatedArrival: string;
  status: ShipmentStatus;
  carrier: string;
  weight: number;
  packageCount: number;
  priority: 'low' | 'medium' | 'high';
  notes?: string;
}

interface SortConfig {
  key: keyof Shipment;
  direction: 'asc' | 'desc';
}

const App: React.FC = () => {
  // State variables
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentShipment, setCurrentShipment] = useState<Shipment | null>(null);
  const [detailShipment, setDetailShipment] = useState<Shipment | null>(null);
  const [statusFilter, setStatusFilter] = useState<ShipmentStatus | 'all'>('all');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'departureDate', direction: 'desc' });
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      return savedMode === 'true' || 
        (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  
  const formRef = useRef<HTMLFormElement>(null);

  // Mock data
  const mockShipments: Shipment[] = [
    {
      id: '1',
      trackingNumber: 'TRK12345678',
      origin: 'New York, NY',
      destination: 'Los Angeles, CA',
      departureDate: new Date('2025-05-10'),
      estimatedArrival: new Date('2025-05-15'),
      status: 'in_transit',
      carrier: 'FastShip Express',
      weight: 240.5,
      packageCount: 3,
      priority: 'high',
      notes: 'Fragile items included',
    },
    {
      id: '2',
      trackingNumber: 'TRK87654321',
      origin: 'Chicago, IL',
      destination: 'Miami, FL',
      departureDate: new Date('2025-05-05'),
      estimatedArrival: new Date('2025-05-09'),
      status: 'delivered',
      carrier: 'Global Logistics',
      weight: 180.2,
      packageCount: 2,
      priority: 'medium',
    },
    {
      id: '3',
      trackingNumber: 'TRK55566677',
      origin: 'Seattle, WA',
      destination: 'Boston, MA',
      departureDate: new Date('2025-05-12'),
      estimatedArrival: new Date('2025-05-18'),
      status: 'scheduled',
      carrier: 'Coast2Coast',
      weight: 320.0,
      packageCount: 5,
      priority: 'low',
      notes: 'Requires refrigeration',
    },
    {
      id: '4',
      trackingNumber: 'TRK11223344',
      origin: 'Austin, TX',
      destination: 'Denver, CO',
      departureDate: new Date('2025-05-08'),
      estimatedArrival: new Date('2025-05-11'),
      status: 'delayed',
      carrier: 'Speedy Delivery',
      weight: 150.75,
      packageCount: 1,
      priority: 'high',
      notes: 'Weather delay expected',
    },
    {
      id: '5',
      trackingNumber: 'TRK99887766',
      origin: 'San Francisco, CA',
      destination: 'Phoenix, AZ',
      departureDate: new Date('2025-05-09'),
      estimatedArrival: new Date('2025-05-12'),
      status: 'in_transit',
      carrier: 'FastShip Express',
      weight: 210.3,
      packageCount: 2,
      priority: 'medium',
    },
  ];

  // Initialize data
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setShipments(mockShipments);
      setIsLoading(false);
    }, 1000);
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

  // Handle sorting
  const handleSort = (key: keyof Shipment) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Get sorted and filtered shipments
  const getSortedShipments = () => {
    let filteredShipments = [...shipments];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filteredShipments = filteredShipments.filter(shipment => shipment.status === statusFilter);
    }
    
    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filteredShipments = filteredShipments.filter(shipment => 
        shipment.trackingNumber.toLowerCase().includes(searchLower) ||
        shipment.origin.toLowerCase().includes(searchLower) ||
        shipment.destination.toLowerCase().includes(searchLower) ||
        shipment.carrier.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply sorting
    return filteredShipments.sort((a, b) => {
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
  };

  // Add shipment handler
  const handleAddShipment = () => {
    setCurrentShipment(null);
    setIsModalOpen(true);
  };

  // Edit shipment handler
  const handleEditShipment = (shipment: Shipment) => {
    setCurrentShipment(shipment);
    setIsModalOpen(true);
  };

  // View shipment details
  const handleViewDetails = (shipment: Shipment) => {
    setDetailShipment(shipment);
  };

  // Close detail view
  const handleCloseDetails = () => {
    setDetailShipment(null);
  };

  // Delete shipment handler
  const handleDeleteShipment = (id: string) => {
    if (window.confirm('Are you sure you want to delete this shipment?')) {
      setShipments(prevShipments => prevShipments.filter(shipment => shipment.id !== id));
      if (detailShipment?.id === id) {
        setDetailShipment(null);
      }
    }
  };

  // Submit form handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formRef.current) {
      const formData = new FormData(formRef.current);
      const shipmentData: ShipmentFormData = {
        trackingNumber: formData.get('trackingNumber') as string,
        origin: formData.get('origin') as string,
        destination: formData.get('destination') as string,
        departureDate: formData.get('departureDate') as string,
        estimatedArrival: formData.get('estimatedArrival') as string,
        status: formData.get('status') as ShipmentStatus,
        carrier: formData.get('carrier') as string,
        weight: parseFloat(formData.get('weight') as string),
        packageCount: parseInt(formData.get('packageCount') as string, 10),
        priority: formData.get('priority') as 'low' | 'medium' | 'high',
        notes: formData.get('notes') as string || undefined,
      };

      if (currentShipment) {
        // Edit existing shipment
        setShipments(prevShipments => 
          prevShipments.map(shipment => 
            shipment.id === currentShipment.id 
              ? {
                  ...shipment,
                  ...shipmentData,
                  departureDate: new Date(shipmentData.departureDate),
                  estimatedArrival: new Date(shipmentData.estimatedArrival),
                }
              : shipment
          )
        );
        
        // Update detail view if the current shipment is being viewed
        if (detailShipment?.id === currentShipment.id) {
          setDetailShipment({
            ...currentShipment,
            ...shipmentData,
            departureDate: new Date(shipmentData.departureDate),
            estimatedArrival: new Date(shipmentData.estimatedArrival),
          });
        }
      } else {
        // Add new shipment
        const newShipment: Shipment = {
          id: `${Date.now()}`,
          ...shipmentData,
          departureDate: new Date(shipmentData.departureDate),
          estimatedArrival: new Date(shipmentData.estimatedArrival),
        };
        
        setShipments(prevShipments => [...prevShipments, newShipment]);
      }
      
      setIsModalOpen(false);
    }
  };

  // Render status badge with correct color
  const renderStatusBadge = (status: ShipmentStatus) => {
    switch(status) {
      case 'in_transit':
        return <span className="badge badge-info flex items-center gap-1"><Clock size={14} /> In Transit</span>;
      case 'delivered':
        return <span className="badge badge-success flex items-center gap-1"><CheckCircle size={14} /> Delivered</span>;
      case 'delayed':
        return <span className="badge badge-error flex items-center gap-1"><XCircle size={14} /> Delayed</span>;
      case 'scheduled':
        return <span className="badge badge-warning flex items-center gap-1"><AlertTriangle size={14} /> Scheduled</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  // Render priority badge with correct color
  const renderPriorityBadge = (priority: 'low' | 'medium' | 'high') => {
    switch(priority) {
      case 'low':
        return <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Low</span>;
      case 'medium':
        return <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Medium</span>;
      case 'high':
        return <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">High</span>;
      default:
        return <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">{priority}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 theme-transition">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm theme-transition">
        <div className="container-fluid py-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-2">
              <Truck size={32} className="text-primary-600 dark:text-primary-400" />
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Shipment Tracker</h1>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 theme-transition"
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              
              <button 
                className="btn btn-primary flex items-center gap-2" 
                onClick={handleAddShipment}
                aria-label="Add new shipment"
              >
                <Plus size={18} />
                <span className="hidden sm:inline">Add Shipment</span>
              </button>
            </div>
          </div>
          
          {/* Search and filters */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                className="input pl-10"
                placeholder="Search shipments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search shipments"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-gray-400" />
              <select 
                className="input"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as ShipmentStatus | 'all')}
                aria-label="Filter by status"
              >
                <option value="all">All Statuses</option>
                <option value="in_transit">In Transit</option>
                <option value="delivered">Delivered</option>
                <option value="delayed">Delayed</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>
            
            <div className="text-right">
              <button 
                className="btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600 flex items-center gap-2"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setSortConfig({ key: 'departureDate', direction: 'desc' });
                }}
                aria-label="Reset filters"
              >
                <RefreshCw size={16} />
                <span>Reset Filters</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container-fluid py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Shipments List */}
          <div className="lg:col-span-2">
            <div className="card overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Package size={20} />
                  Shipments ({getSortedShipments().length})
                </h2>
              </div>
              
              {isLoading ? (
                <div className="p-8">
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : getSortedShipments().length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-gray-500 dark:text-gray-400">No shipments found. Try adjusting your filters or add a new shipment.</p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th className="table-header" onClick={() => handleSort('trackingNumber')}>
                          <span className="flex items-center gap-1 cursor-pointer hover:text-primary-600">
                            Tracking Number
                            {sortConfig.key === 'trackingNumber' && (
                              sortConfig.direction === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />
                            )}
                          </span>
                        </th>
                        <th className="table-header" onClick={() => handleSort('origin')}>
                          <span className="flex items-center gap-1 cursor-pointer hover:text-primary-600">
                            Origin
                            {sortConfig.key === 'origin' && (
                              sortConfig.direction === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />
                            )}
                          </span>
                        </th>
                        <th className="table-header" onClick={() => handleSort('destination')}>
                          <span className="flex items-center gap-1 cursor-pointer hover:text-primary-600">
                            Destination
                            {sortConfig.key === 'destination' && (
                              sortConfig.direction === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />
                            )}
                          </span>
                        </th>
                        <th className="table-header" onClick={() => handleSort('status')}>
                          <span className="flex items-center gap-1 cursor-pointer hover:text-primary-600">
                            Status
                            {sortConfig.key === 'status' && (
                              sortConfig.direction === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />
                            )}
                          </span>
                        </th>
                        <th className="table-header" onClick={() => handleSort('estimatedArrival')}>
                          <span className="flex items-center gap-1 cursor-pointer hover:text-primary-600">
                            ETA
                            {sortConfig.key === 'estimatedArrival' && (
                              sortConfig.direction === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />
                            )}
                          </span>
                        </th>
                        <th className="table-header">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                      {getSortedShipments().map((shipment) => (
                        <tr key={shipment.id} className={`${detailShipment?.id === shipment.id ? 'bg-blue-50 dark:bg-blue-900/30' : ''} hover:bg-gray-50 dark:hover:bg-gray-700/50 theme-transition`}>
                          <td className="table-cell font-medium">{shipment.trackingNumber}</td>
                          <td className="table-cell">
                            <div className="flex items-center gap-1">
                              <MapPin size={14} className="text-gray-400" />
                              {shipment.origin}
                            </div>
                          </td>
                          <td className="table-cell">
                            <div className="flex items-center gap-1">
                              <MapPin size={14} className="text-gray-400" />
                              {shipment.destination}
                            </div>
                          </td>
                          <td className="table-cell">{renderStatusBadge(shipment.status)}</td>
                          <td className="table-cell">
                            <div className="flex items-center gap-1">
                              <Calendar size={14} className="text-gray-400" />
                              {format(shipment.estimatedArrival, 'MMM dd, yyyy')}
                            </div>
                          </td>
                          <td className="table-cell">
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => handleViewDetails(shipment)}
                                className="p-1.5 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-800/60 theme-transition"
                                aria-label="View shipment details"
                              >
                                <Eye size={16} />
                              </button>
                              <button 
                                onClick={() => handleEditShipment(shipment)}
                                className="p-1.5 rounded-full bg-yellow-100 text-yellow-600 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:hover:bg-yellow-800/60 theme-transition"
                                aria-label="Edit shipment"
                              >
                                <Edit size={16} />
                              </button>
                              <button 
                                onClick={() => handleDeleteShipment(shipment.id)}
                                className="p-1.5 rounded-full bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-800/60 theme-transition"
                                aria-label="Delete shipment"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Detail View */}
          <div className="lg:col-span-1">
            {detailShipment ? (
              <div className="card">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Shipment Details</h2>
                  <button 
                    onClick={handleCloseDetails}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    aria-label="Close details"
                  >
                    &times;
                  </button>
                </div>
                <div className="p-4 space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Tracking Number</h3>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{detailShipment.trackingNumber}</p>
                  </div>
                  
                  <div className="flex justify-between">
                    <div className="space-y-1">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</h3>
                      <div>{renderStatusBadge(detailShipment.status)}</div>
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Priority</h3>
                      <div>{renderPriorityBadge(detailShipment.priority)}</div>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Origin</h3>
                        <p className="text-gray-900 dark:text-white">{detailShipment.origin}</p>
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Destination</h3>
                        <p className="text-gray-900 dark:text-white">{detailShipment.destination}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <div className="space-y-1">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Departure Date</h3>
                      <p className="text-gray-900 dark:text-white">{format(detailShipment.departureDate, 'MMM dd, yyyy')}</p>
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">ETA</h3>
                      <p className="text-gray-900 dark:text-white">{format(detailShipment.estimatedArrival, 'MMM dd, yyyy')}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <div className="space-y-1">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Carrier</h3>
                      <p className="text-gray-900 dark:text-white">{detailShipment.carrier}</p>
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Package Details</h3>
                      <p className="text-gray-900 dark:text-white">{detailShipment.packageCount} {detailShipment.packageCount === 1 ? 'package' : 'packages'}, {detailShipment.weight} lbs</p>
                    </div>
                  </div>
                  
                  {detailShipment.notes && (
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Notes</h3>
                      <p className="mt-1 text-gray-900 dark:text-white">{detailShipment.notes}</p>
                    </div>
                  )}
                  
                  <div className="pt-4 flex justify-end gap-2">
                    <button 
                      onClick={() => handleEditShipment(detailShipment)}
                      className="btn btn-primary flex items-center gap-1"
                    >
                      <Edit size={16} />
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteShipment(detailShipment.id)}
                      className="btn bg-red-500 text-white hover:bg-red-600 flex items-center gap-1"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card-responsive">
                <div className="text-center p-8">
                  <div className="text-gray-400 mb-4">
                    <Eye size={48} className="inline-block" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">No Shipment Selected</h3>
                  <p className="mt-2 text-gray-500 dark:text-gray-400">Select a shipment from the list to view its details</p>
                </div>
              </div>
            )}
            
            {/* Dashboard Stats */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="stat-card">
                <div className="stat-title">Total Shipments</div>
                <div className="stat-value">{shipments.length}</div>
                <div className="stat-desc">All shipments</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-title">In Transit</div>
                <div className="stat-value">{shipments.filter(s => s.status === 'in_transit').length}</div>
                <div className="stat-desc">Currently moving</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-title">Delivered</div>
                <div className="stat-value">{shipments.filter(s => s.status === 'delivered').length}</div>
                <div className="stat-desc">Completed shipments</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-title">Delayed</div>
                <div className="stat-value">{shipments.filter(s => s.status === 'delayed').length}</div>
                <div className="stat-desc">Facing issues</div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {currentShipment ? 'Edit Shipment' : 'Add New Shipment'}
              </h3>
              <button 
                className="text-gray-400 hover:text-gray-500"
                onClick={() => setIsModalOpen(false)}
                aria-label="Close modal"
              >
                &times;
              </button>
            </div>
            
            <form ref={formRef} onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="trackingNumber">Tracking Number</label>
                  <input 
                    id="trackingNumber"
                    name="trackingNumber"
                    type="text"
                    className="input"
                    required
                    defaultValue={currentShipment?.trackingNumber || ''}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="carrier">Carrier</label>
                  <input 
                    id="carrier"
                    name="carrier"
                    type="text"
                    className="input"
                    required
                    defaultValue={currentShipment?.carrier || ''}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="origin">Origin</label>
                  <input 
                    id="origin"
                    name="origin"
                    type="text"
                    className="input"
                    required
                    defaultValue={currentShipment?.origin || ''}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="destination">Destination</label>
                  <input 
                    id="destination"
                    name="destination"
                    type="text"
                    className="input"
                    required
                    defaultValue={currentShipment?.destination || ''}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="departureDate">Departure Date</label>
                  <input 
                    id="departureDate"
                    name="departureDate"
                    type="date"
                    className="input"
                    required
                    defaultValue={currentShipment ? format(currentShipment.departureDate, 'yyyy-MM-dd') : ''}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="estimatedArrival">Estimated Arrival</label>
                  <input 
                    id="estimatedArrival"
                    name="estimatedArrival"
                    type="date"
                    className="input"
                    required
                    defaultValue={currentShipment ? format(currentShipment.estimatedArrival, 'yyyy-MM-dd') : ''}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="status">Status</label>
                  <select 
                    id="status"
                    name="status"
                    className="input"
                    required
                    defaultValue={currentShipment?.status || 'scheduled'}
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="in_transit">In Transit</option>
                    <option value="delivered">Delivered</option>
                    <option value="delayed">Delayed</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="weight">Weight (lbs)</label>
                  <input 
                    id="weight"
                    name="weight"
                    type="number"
                    min="0"
                    step="0.1"
                    className="input"
                    required
                    defaultValue={currentShipment?.weight || ''}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="packageCount">Package Count</label>
                  <input 
                    id="packageCount"
                    name="packageCount"
                    type="number"
                    min="1"
                    className="input"
                    required
                    defaultValue={currentShipment?.packageCount || '1'}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="priority">Priority</label>
                <select 
                  id="priority"
                  name="priority"
                  className="input"
                  required
                  defaultValue={currentShipment?.priority || 'medium'}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="notes">Notes</label>
                <textarea 
                  id="notes"
                  name="notes"
                  className="input h-24"
                  defaultValue={currentShipment?.notes || ''}
                ></textarea>
              </div>
              
              <div className="modal-footer">
                <button 
                  type="button"
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {currentShipment ? 'Update Shipment' : 'Add Shipment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 py-4 border-t border-gray-200 dark:border-gray-700 theme-transition">
        <div className="container-fluid text-center text-gray-500 dark:text-gray-400 text-sm">
          Copyright (c) 2025 of Datavtar Private Limited. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default App;