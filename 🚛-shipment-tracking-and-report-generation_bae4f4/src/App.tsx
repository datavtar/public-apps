import React, { useState, useEffect, useRef } from 'react';
import {
  Truck,
  Package,
  Map,
  Calendar,
  Clock,
  Filter,
  Search,
  Plus,
  X,
  Download,
  Upload,
  ChevronDown,
  Edit,
  Trash2,
  ChartBar,
  ChevronUp,
  FileText,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ArrowRightCircle,
  MapPin
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import styles from './styles/styles.module.css';

// Define TypeScript types and interfaces
type ShipmentStatus = 'pending' | 'in_transit' | 'delivered' | 'delayed' | 'cancelled';

interface Shipment {
  id: string;
  trackingNumber: string;
  origin: string;
  destination: string;
  customer: string;
  status: ShipmentStatus;
  departureDate: string;
  estimatedArrival: string;
  actualArrival: string | null;
  weight: number;
  description: string;
  currentLocation?: string;
  carrier: string;
  cost: number;
  lastUpdated: string;
}

interface FilterState {
  status: ShipmentStatus | 'all';
  dateRange: {
    start: string;
    end: string;
  };
  search: string;
}

type ChartData = {
  name: string;
  value: number;
};

const App: React.FC = () => {
  // State management
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [filters, setFilters] = useState<FilterState>({
    status: 'all',
    dateRange: {
      start: '',
      end: ''
    },
    search: ''
  });
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode === 'true' || (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sample default data
  const defaultShipments: Shipment[] = [
    {
      id: '1',
      trackingNumber: 'TRK-12345',
      origin: 'New York, NY',
      destination: 'Los Angeles, CA',
      customer: 'Acme Corp',
      status: 'in_transit',
      departureDate: '2023-05-15',
      estimatedArrival: '2023-05-22',
      actualArrival: null,
      weight: 350,
      description: 'Office equipment',
      currentLocation: 'Denver, CO',
      carrier: 'FastShip Inc.',
      cost: 1200,
      lastUpdated: '2023-05-17T14:32:00Z'
    },
    {
      id: '2',
      trackingNumber: 'TRK-54321',
      origin: 'Chicago, IL',
      destination: 'Miami, FL',
      customer: 'Globe Enterprises',
      status: 'delivered',
      departureDate: '2023-05-10',
      estimatedArrival: '2023-05-15',
      actualArrival: '2023-05-14',
      weight: 225,
      description: 'Medical supplies',
      currentLocation: 'Miami, FL',
      carrier: 'MedEx Logistics',
      cost: 950,
      lastUpdated: '2023-05-14T10:15:00Z'
    },
    {
      id: '3',
      trackingNumber: 'TRK-67890',
      origin: 'Seattle, WA',
      destination: 'Boston, MA',
      customer: 'Tech Solutions LLC',
      status: 'pending',
      departureDate: '2023-05-20',
      estimatedArrival: '2023-05-27',
      actualArrival: null,
      weight: 180,
      description: 'Computer components',
      currentLocation: 'Seattle, WA',
      carrier: 'TechShip',
      cost: 1500,
      lastUpdated: '2023-05-18T09:45:00Z'
    },
    {
      id: '4',
      trackingNumber: 'TRK-98765',
      origin: 'Austin, TX',
      destination: 'Portland, OR',
      customer: 'Green Foods Co.',
      status: 'delayed',
      departureDate: '2023-05-12',
      estimatedArrival: '2023-05-19',
      actualArrival: null,
      weight: 410,
      description: 'Organic food products',
      currentLocation: 'Salt Lake City, UT',
      carrier: 'EcoFreight',
      cost: 1100,
      lastUpdated: '2023-05-16T16:20:00Z'
    },
    {
      id: '5',
      trackingNumber: 'TRK-24680',
      origin: 'Denver, CO',
      destination: 'Atlanta, GA',
      customer: 'Mountain Gear',
      status: 'cancelled',
      departureDate: '2023-05-14',
      estimatedArrival: '2023-05-20',
      actualArrival: null,
      weight: 275,
      description: 'Outdoor equipment',
      currentLocation: 'Denver, CO',
      carrier: 'AlpineShip',
      cost: 850,
      lastUpdated: '2023-05-14T11:30:00Z'
    }
  ];

  // Load data from localStorage or use default data
  useEffect(() => {
    const savedShipments = localStorage.getItem('shipments');
    if (savedShipments) {
      setShipments(JSON.parse(savedShipments));
    } else {
      setShipments(defaultShipments);
      localStorage.setItem('shipments', JSON.stringify(defaultShipments));
    }

    // Apply dark mode
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Save shipments to localStorage whenever they change
  useEffect(() => {
    if (shipments.length > 0) {
      localStorage.setItem('shipments', JSON.stringify(shipments));
    }
  }, [shipments]);

  // Event listeners for Escape key to close modals
  useEffect(() => {
    const handleEscPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isModalOpen) setIsModalOpen(false);
        if (isDeleteModalOpen) setIsDeleteModalOpen(false);
        if (isImportModalOpen) setIsImportModalOpen(false);
        if (isFilterModalOpen) setIsFilterModalOpen(false);
        if (isReportModalOpen) setIsReportModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleEscPress);
    return () => window.removeEventListener('keydown', handleEscPress);
  }, [isModalOpen, isDeleteModalOpen, isImportModalOpen, isFilterModalOpen, isReportModalOpen]);

  // Helper functions
  const applyFilters = (shipmentList: Shipment[]) => {
    return shipmentList.filter(shipment => {
      // Status filter
      if (filters.status !== 'all' && shipment.status !== filters.status) {
        return false;
      }

      // Date range filter
      if (filters.dateRange.start && new Date(shipment.departureDate) < new Date(filters.dateRange.start)) {
        return false;
      }
      if (filters.dateRange.end && new Date(shipment.departureDate) > new Date(filters.dateRange.end)) {
        return false;
      }

      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        return (
          shipment.trackingNumber.toLowerCase().includes(searchTerm) ||
          shipment.origin.toLowerCase().includes(searchTerm) ||
          shipment.destination.toLowerCase().includes(searchTerm) ||
          shipment.customer.toLowerCase().includes(searchTerm) ||
          shipment.description.toLowerCase().includes(searchTerm)
        );
      }

      return true;
    });
  };

  const filteredShipments = applyFilters(shipments);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    localStorage.setItem('darkMode', (!isDarkMode).toString());
  };

  // Modal handlers
  const openNewShipmentModal = () => {
    setSelectedShipment(null);
    setIsModalOpen(true);
  };

  const openEditShipmentModal = (shipment: Shipment) => {
    setSelectedShipment({...shipment});
    setIsModalOpen(true);
  };

  const openDeleteConfirmation = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setIsDeleteModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedShipment(null);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedShipment(null);
  };

  const closeImportModal = () => {
    setIsImportModalOpen(false);
  };

  const closeFilterModal = () => {
    setIsFilterModalOpen(false);
  };

  const closeReportModal = () => {
    setIsReportModalOpen(false);
  };

  // CRUD operations
  const saveShipment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const shipmentData: Partial<Shipment> = {
      trackingNumber: formData.get('trackingNumber') as string,
      origin: formData.get('origin') as string,
      destination: formData.get('destination') as string,
      customer: formData.get('customer') as string,
      status: formData.get('status') as ShipmentStatus,
      departureDate: formData.get('departureDate') as string,
      estimatedArrival: formData.get('estimatedArrival') as string,
      actualArrival: formData.get('actualArrival') as string || null,
      weight: parseFloat(formData.get('weight') as string),
      description: formData.get('description') as string,
      currentLocation: formData.get('currentLocation') as string,
      carrier: formData.get('carrier') as string,
      cost: parseFloat(formData.get('cost') as string),
      lastUpdated: new Date().toISOString()
    };

    if (selectedShipment) {
      // Update existing shipment
      const updatedShipments = shipments.map(shipment => 
        shipment.id === selectedShipment.id ? { ...selectedShipment, ...shipmentData } : shipment
      );
      setShipments(updatedShipments);
    } else {
      // Create new shipment
      const newShipment: Shipment = {
        id: Date.now().toString(),
        ...shipmentData as Omit<Shipment, 'id'>
      };
      setShipments([...shipments, newShipment]);
    }

    closeModal();
  };

  const deleteShipment = () => {
    if (selectedShipment) {
      const updatedShipments = shipments.filter(shipment => shipment.id !== selectedShipment.id);
      setShipments(updatedShipments);
    }
    closeDeleteModal();
  };

  // Import/Export handlers
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const importedData = JSON.parse(content) as Shipment[];
        
        if (Array.isArray(importedData) && importedData.length > 0) {
          // Validate imported data structure
          const isValid = importedData.every(item => 
            item.id && item.trackingNumber && item.origin && item.destination && 
            item.status && item.departureDate && item.estimatedArrival
          );
          
          if (isValid) {
            setShipments(importedData);
            alert('Import successful! Imported ' + importedData.length + ' shipments.');
          } else {
            alert('Import failed: Invalid data structure');
          }
        } else {
          alert('Import failed: No data found or invalid format');
        }
      } catch (error) {
        alert('Import failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
      }
      closeImportModal();
    };
    reader.readAsText(file);
  };

  const exportData = () => {
    const dataStr = JSON.stringify(shipments, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = 'shipments.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const downloadTemplate = () => {
    const templateData = [
      {
        id: 'template-1',
        trackingNumber: 'TRK-XXXXXX',
        origin: 'Origin City, State',
        destination: 'Destination City, State',
        customer: 'Customer Name',
        status: 'pending',
        departureDate: '2023-MM-DD',
        estimatedArrival: '2023-MM-DD',
        actualArrival: null,
        weight: 0,
        description: 'Shipment description',
        currentLocation: 'Current City, State',
        carrier: 'Carrier Name',
        cost: 0,
        lastUpdated: new Date().toISOString()
      }
    ];

    const dataStr = JSON.stringify(templateData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = 'shipment-template.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Generate report data
  const generateStatusChartData = (): ChartData[] => {
    const statusCounts: Record<string, number> = {
      pending: 0,
      in_transit: 0,
      delivered: 0,
      delayed: 0,
      cancelled: 0
    };

    shipments.forEach(shipment => {
      statusCounts[shipment.status]++;
    });

    return [
      { name: 'Pending', value: statusCounts.pending },
      { name: 'In Transit', value: statusCounts.in_transit },
      { name: 'Delivered', value: statusCounts.delivered },
      { name: 'Delayed', value: statusCounts.delayed },
      { name: 'Cancelled', value: statusCounts.cancelled }
    ];
  };

  const generateCarrierChartData = () => {
    const carrierMap: Record<string, number> = {};
    
    shipments.forEach(shipment => {
      if (carrierMap[shipment.carrier]) {
        carrierMap[shipment.carrier]++;
      } else {
        carrierMap[shipment.carrier] = 1;
      }
    });

    return Object.keys(carrierMap).map(carrier => ({
      name: carrier,
      value: carrierMap[carrier]
    }));
  };

  const getStatusColor = (status: ShipmentStatus): string => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'in_transit': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'delivered': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'delayed': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status: ShipmentStatus) => {
    switch (status) {
      case 'pending': return <AlertTriangle size={16} />;
      case 'in_transit': return <ArrowRightCircle size={16} />;
      case 'delivered': return <CheckCircle size={16} />;
      case 'delayed': return <Clock size={16} />;
      case 'cancelled': return <XCircle size={16} />;
      default: return null;
    }
  };

  const getStatusText = (status: ShipmentStatus): string => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'in_transit': return 'In Transit';
      case 'delivered': return 'Delivered';
      case 'delayed': return 'Delayed';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 theme-transition-all">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm">
        <div className="container-fluid py-4 flex-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Truck size={24} className="text-primary-600 dark:text-primary-400" />
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">Shipment Tracker</h1>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={() => setIsFilterModalOpen(true)}
              className="btn-sm md:btn flex items-center gap-1 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-600"
              aria-label="Filter shipments"
            >
              <Filter size={16} />
              <span className="hidden sm:inline">Filter</span>
            </button>
            
            <button 
              onClick={() => setIsImportModalOpen(true)}
              className="btn-sm md:btn flex items-center gap-1 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-600"
              aria-label="Import/Export data"
            >
              <Upload size={16} />
              <span className="hidden sm:inline">Import/Export</span>
            </button>
            
            <button 
              onClick={() => setIsReportModalOpen(true)}
              className="btn-sm md:btn flex items-center gap-1 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-600"
              aria-label="View reports"
            >
              <ChartBar size={16} />
              <span className="hidden sm:inline">Reports</span>
            </button>
            
            <button 
              onClick={toggleDarkMode}
              className="theme-toggle" 
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <span className="theme-toggle-thumb"></span>
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container-fluid py-6">
        <div className="flex-between mb-6 flex-wrap gap-4">
          <div className="flex items-center">
            <div className="relative">
              <input
                type="text"
                placeholder="Search shipments..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                className="input pl-10 pr-4 py-2 w-full md:w-80"
                aria-label="Search shipments"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('list')}
              className={`btn ${viewMode === 'list' ? 'btn-primary' : 'bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-white'}`}
              aria-label="List view"
            >
              <FileText size={18} />
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`btn ${viewMode === 'map' ? 'btn-primary' : 'bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-white'}`}
              aria-label="Map view"
            >
              <Map size={18} />
            </button>
            <button
              onClick={openNewShipmentModal}
              className="btn btn-primary flex items-center gap-2"
              aria-label="Add new shipment"
            >
              <Plus size={18} />
              <span>New Shipment</span>
            </button>
          </div>
        </div>

        {/* Shipment count */}
        <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          <span>Showing {filteredShipments.length} of {shipments.length} shipments</span>
        </div>

        {/* View content */}
        {viewMode === 'list' ? (
          <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-lg shadow">
            {filteredShipments.length > 0 ? (
              <table className="table">
                <thead>
                  <tr>
                    <th className="table-header px-6 py-3">Tracking #</th>
                    <th className="table-header px-6 py-3">Status</th>
                    <th className="table-header px-6 py-3">Origin</th>
                    <th className="table-header px-6 py-3">Destination</th>
                    <th className="table-header px-6 py-3">Customer</th>
                    <th className="table-header px-6 py-3">Departure</th>
                    <th className="table-header px-6 py-3">Est. Arrival</th>
                    <th className="table-header px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                  {filteredShipments.map((shipment) => (
                    <tr key={shipment.id} className="hover:bg-gray-50 dark:hover:bg-slate-700 theme-transition">
                      <td className="table-cell px-6 py-4 font-medium text-gray-900 dark:text-white">
                        {shipment.trackingNumber}
                      </td>
                      <td className="table-cell px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(shipment.status)}`}>
                          <span className="mr-1">{getStatusIcon(shipment.status)}</span>
                          {getStatusText(shipment.status)}
                        </span>
                      </td>
                      <td className="table-cell px-6 py-4">{shipment.origin}</td>
                      <td className="table-cell px-6 py-4">{shipment.destination}</td>
                      <td className="table-cell px-6 py-4">{shipment.customer}</td>
                      <td className="table-cell px-6 py-4">{new Date(shipment.departureDate).toLocaleDateString()}</td>
                      <td className="table-cell px-6 py-4">{new Date(shipment.estimatedArrival).toLocaleDateString()}</td>
                      <td className="table-cell px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => openEditShipmentModal(shipment)}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            aria-label={`Edit shipment ${shipment.trackingNumber}`}
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => openDeleteConfirmation(shipment)}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            aria-label={`Delete shipment ${shipment.trackingNumber}`}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <Package size={48} className="mx-auto mb-4 text-gray-400 dark:text-gray-600" />
                <h3 className="text-lg font-medium mb-2">No shipments found</h3>
                <p>Try adjusting your filters or add a new shipment.</p>
                <button
                  onClick={openNewShipmentModal}
                  className="btn btn-primary mt-4"
                >
                  Add Shipment
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <div className="flex justify-center items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Shipment Map View</h2>
            </div>
            <div className={styles.mapContainer}>
              <div className={styles.map}>
                {/* Simple mockup map */}
                <div className={styles.mapGrid}>
                  {filteredShipments.map((shipment) => (
                    <div 
                      key={shipment.id}
                      className={`${styles.mapPoint} ${styles[shipment.status]}`}
                      style={{
                        left: `${Math.random() * 80 + 10}%`,
                        top: `${Math.random() * 80 + 10}%`
                      }}
                      title={`${shipment.trackingNumber} - ${shipment.origin} to ${shipment.destination}`}
                    >
                      <div className={styles.mapTooltip}>
                        <div className="font-bold">{shipment.trackingNumber}</div>
                        <div>{shipment.origin} → {shipment.destination}</div>
                        <div className="flex items-center mt-1">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(shipment.status)}`}>
                            {getStatusText(shipment.status)}
                          </span>
                        </div>
                      </div>
                      <MapPin size={24} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-center mt-4 gap-2">
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                  <span className="text-sm">Pending</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                  <span className="text-sm">In Transit</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-green-500"></span>
                  <span className="text-sm">Delivered</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                  <span className="text-sm">Delayed</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-red-500"></span>
                  <span className="text-sm">Cancelled</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 shadow-sm mt-auto py-4">
        <div className="container-fluid">
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            Copyright © 2025 of Datavtar Private Limited. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Add/Edit Shipment Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {selectedShipment ? 'Edit Shipment' : 'Add New Shipment'}
              </h3>
              <button 
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200"
                aria-label="Close modal"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={saveShipment}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="form-group">
                  <label htmlFor="trackingNumber" className="form-label">Tracking Number</label>
                  <input
                    type="text"
                    id="trackingNumber"
                    name="trackingNumber"
                    defaultValue={selectedShipment?.trackingNumber || ''}
                    className="input"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="status" className="form-label">Status</label>
                  <select
                    id="status"
                    name="status"
                    defaultValue={selectedShipment?.status || 'pending'}
                    className="input"
                    required
                  >
                    <option value="pending">Pending</option>
                    <option value="in_transit">In Transit</option>
                    <option value="delivered">Delivered</option>
                    <option value="delayed">Delayed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="origin" className="form-label">Origin</label>
                  <input
                    type="text"
                    id="origin"
                    name="origin"
                    defaultValue={selectedShipment?.origin || ''}
                    className="input"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="destination" className="form-label">Destination</label>
                  <input
                    type="text"
                    id="destination"
                    name="destination"
                    defaultValue={selectedShipment?.destination || ''}
                    className="input"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="customer" className="form-label">Customer</label>
                  <input
                    type="text"
                    id="customer"
                    name="customer"
                    defaultValue={selectedShipment?.customer || ''}
                    className="input"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="carrier" className="form-label">Carrier</label>
                  <input
                    type="text"
                    id="carrier"
                    name="carrier"
                    defaultValue={selectedShipment?.carrier || ''}
                    className="input"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="departureDate" className="form-label">Departure Date</label>
                  <input
                    type="date"
                    id="departureDate"
                    name="departureDate"
                    defaultValue={selectedShipment?.departureDate || ''}
                    className="input"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="estimatedArrival" className="form-label">Estimated Arrival</label>
                  <input
                    type="date"
                    id="estimatedArrival"
                    name="estimatedArrival"
                    defaultValue={selectedShipment?.estimatedArrival || ''}
                    className="input"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="actualArrival" className="form-label">Actual Arrival (if delivered)</label>
                  <input
                    type="date"
                    id="actualArrival"
                    name="actualArrival"
                    defaultValue={selectedShipment?.actualArrival || ''}
                    className="input"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="currentLocation" className="form-label">Current Location</label>
                  <input
                    type="text"
                    id="currentLocation"
                    name="currentLocation"
                    defaultValue={selectedShipment?.currentLocation || ''}
                    className="input"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="weight" className="form-label">Weight (kg)</label>
                  <input
                    type="number"
                    id="weight"
                    name="weight"
                    min="0"
                    step="0.01"
                    defaultValue={selectedShipment?.weight || ''}
                    className="input"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="cost" className="form-label">Cost ($)</label>
                  <input
                    type="number"
                    id="cost"
                    name="cost"
                    min="0"
                    step="0.01"
                    defaultValue={selectedShipment?.cost || ''}
                    className="input"
                    required
                  />
                </div>
                
                <div className="form-group md:col-span-2">
                  <label htmlFor="description" className="form-label">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    defaultValue={selectedShipment?.description || ''}
                    className="input"
                    rows={3}
                    required
                  ></textarea>
                </div>
              </div>
              
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  {selectedShipment ? 'Update Shipment' : 'Add Shipment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedShipment && (
        <div className="modal-backdrop" onClick={closeDeleteModal}>
          <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Confirm Deletion
              </h3>
              <button 
                onClick={closeDeleteModal}
                className="text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200"
                aria-label="Close modal"
              >
                <X size={24} />
              </button>
            </div>
            <div className="mt-4">
              <p className="text-gray-600 dark:text-gray-300">
                Are you sure you want to delete shipment <span className="font-semibold">{selectedShipment.trackingNumber}</span>?
                This action cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                onClick={closeDeleteModal}
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={deleteShipment}
                className="btn bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import/Export Modal */}
      {isImportModalOpen && (
        <div className="modal-backdrop" onClick={closeImportModal}>
          <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Import/Export Data
              </h3>
              <button 
                onClick={closeImportModal}
                className="text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200"
                aria-label="Close modal"
              >
                <X size={24} />
              </button>
            </div>
            <div className="mt-4 space-y-6">
              <div>
                <h4 className="text-md font-medium mb-2 text-gray-800 dark:text-gray-200">Import Data</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Upload a JSON file with shipment data. This will replace your current data.
                </p>
                <div className="flex flex-col space-y-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="btn flex items-center justify-center gap-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-600 w-full"
                  >
                    <Upload size={18} />
                    <span>Select File</span>
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".json"
                    className="hidden"
                  />
                  <button
                    onClick={downloadTemplate}
                    className="btn-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center justify-center gap-1 w-full"
                  >
                    <Download size={14} />
                    <span>Download Template</span>
                  </button>
                </div>
              </div>
              
              <div className="border-t border-gray-200 dark:border-slate-700 pt-4">
                <h4 className="text-md font-medium mb-2 text-gray-800 dark:text-gray-200">Export Data</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Download your current shipment data as a JSON file.
                </p>
                <button
                  onClick={exportData}
                  className="btn btn-primary flex items-center justify-center gap-2 w-full"
                >
                  <Download size={18} />
                  <span>Export Data</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Modal */}
      {isFilterModalOpen && (
        <div className="modal-backdrop" onClick={closeFilterModal}>
          <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Filter Shipments
              </h3>
              <button 
                onClick={closeFilterModal}
                className="text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200"
                aria-label="Close modal"
              >
                <X size={24} />
              </button>
            </div>
            <div className="mt-4 space-y-4">
              <div className="form-group">
                <label htmlFor="statusFilter" className="form-label">Status</label>
                <select
                  id="statusFilter"
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value as ShipmentStatus | 'all'})}
                  className="input"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="in_transit">In Transit</option>
                  <option value="delivered">Delivered</option>
                  <option value="delayed">Delayed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="startDate" className="form-label">Departure Date Range</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="startDate" className="text-xs text-gray-500 dark:text-gray-400">From</label>
                    <input
                      type="date"
                      id="startDate"
                      value={filters.dateRange.start}
                      onChange={(e) => setFilters({
                        ...filters, 
                        dateRange: {...filters.dateRange, start: e.target.value}
                      })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label htmlFor="endDate" className="text-xs text-gray-500 dark:text-gray-400">To</label>
                    <input
                      type="date"
                      id="endDate"
                      value={filters.dateRange.end}
                      onChange={(e) => setFilters({
                        ...filters, 
                        dateRange: {...filters.dateRange, end: e.target.value}
                      })}
                      className="input"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                onClick={() => {
                  setFilters({
                    status: 'all',
                    dateRange: { start: '', end: '' },
                    search: ''
                  });
                  closeFilterModal();
                }}
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={closeFilterModal}
                className="btn btn-primary"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reports Modal */}
      {isReportModalOpen && (
        <div className="modal-backdrop" onClick={closeReportModal}>
          <div className="modal-content max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Shipment Reports
              </h3>
              <button 
                onClick={closeReportModal}
                className="text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200"
                aria-label="Close modal"
              >
                <X size={24} />
              </button>
            </div>
            <div className="mt-4 space-y-6">
              <div>
                <h4 className="text-md font-medium mb-4 text-gray-800 dark:text-gray-200">Shipment Status Distribution</h4>
                <div className="h-72">
                  {shipments.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={generateStatusChartData()}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {generateStatusChartData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [value, 'Shipments']} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                      No data available
                    </div>
                  )}
                </div>
              </div>
              
              <div className="border-t border-gray-200 dark:border-slate-700 pt-4">
                <h4 className="text-md font-medium mb-4 text-gray-800 dark:text-gray-200">Shipments by Carrier</h4>
                <div className="h-72">
                  {shipments.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={generateCarrierChartData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => [value, 'Shipments']} />
                        <Legend />
                        <Bar dataKey="value" name="Shipments" fill="#0088FE" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                      No data available
                    </div>
                  )}
                </div>
              </div>
              
              <div className="border-t border-gray-200 dark:border-slate-700 pt-4">
                <h4 className="text-md font-medium mb-4 text-gray-800 dark:text-gray-200">Summary Statistics</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="stat-card">
                    <div className="stat-title">Total Shipments</div>
                    <div className="stat-value">{shipments.length}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-title">In Transit</div>
                    <div className="stat-value">
                      {shipments.filter(s => s.status === 'in_transit').length}
                    </div>
                    <div className="stat-desc">
                      {((shipments.filter(s => s.status === 'in_transit').length / (shipments.length || 1)) * 100).toFixed(0)}% of total
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-title">Delivered</div>
                    <div className="stat-value">
                      {shipments.filter(s => s.status === 'delivered').length}
                    </div>
                    <div className="stat-desc">
                      {((shipments.filter(s => s.status === 'delivered').length / (shipments.length || 1)) * 100).toFixed(0)}% of total
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-title">Total Value</div>
                    <div className="stat-value">
                      ${shipments.reduce((sum, shipment) => sum + shipment.cost, 0).toLocaleString()}
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-title">Delayed Shipments</div>
                    <div className="stat-value">
                      {shipments.filter(s => s.status === 'delayed').length}
                    </div>
                    <div className="stat-desc text-yellow-500">
                      {((shipments.filter(s => s.status === 'delayed').length / (shipments.length || 1)) * 100).toFixed(0)}% of total
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-title">Average Shipment Cost</div>
                    <div className="stat-value">
                      ${(shipments.reduce((sum, shipment) => sum + shipment.cost, 0) / (shipments.length || 1)).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                onClick={closeReportModal}
                className="btn btn-primary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;