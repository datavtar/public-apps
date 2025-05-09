import React, { useState, useEffect, useRef } from 'react';
import { format, parseISO, isValid } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import {
  Upload,
  Download,
  FileText,
  Trash2,
  Plus,
  Edit,
  Search,
  Filter,
  ArrowDownUp,
  Check,
  X,
  MapPin,
  Truck,
  ShoppingBag as ShipmentIcon,
  Calendar,
  ChevronDown,
  ChevronUp,
  Package
} from 'lucide-react';

// Define our data type
interface Shipment {
  id: string;
  shipmentId: string;
  location: string;
  status: ShipmentStatus;
  deliveryDate: string;
  createdAt: string;
}

enum ShipmentStatus {
  InTransit = 'In Transit',
  Delivered = 'Delivered',
  Pending = 'Pending',
  Cancelled = 'Cancelled',
  OutForDelivery = 'Out For Delivery'
}

// CSV parser type
interface CSVRow {
  [key: string]: string;
}

const App: React.FC = () => {
  // State
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [filter, setFilter] = useState<ShipmentStatus | ''>('');
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Shipment | '';
    direction: 'asc' | 'desc';
  }>({ key: '', direction: 'asc' });
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentShipment, setCurrentShipment] = useState<Shipment | null>(null);
  const [error, setError] = useState<string>('');
  
  // Form refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Static Data for Analytics
  const statuses = Object.values(ShipmentStatus);
  
  // Load data from local storage on component mount
  useEffect(() => {
    try {
      const savedShipments = localStorage.getItem('shipments');
      if (savedShipments) {
        setShipments(JSON.parse(savedShipments));
      } else {
        // Initialize with sample data if no saved data exists
        const sampleData: Shipment[] = [
          {
            id: '1',
            shipmentId: 'SHIP001',
            location: 'New York',
            status: ShipmentStatus.InTransit,
            deliveryDate: '2024-03-15',
            createdAt: new Date().toISOString()
          },
          {
            id: '2',
            shipmentId: 'SHIP002',
            location: 'Los Angeles',
            status: ShipmentStatus.Delivered,
            deliveryDate: '2024-03-10',
            createdAt: new Date().toISOString()
          },
          {
            id: '3',
            shipmentId: 'SHIP003',
            location: 'Chicago',
            status: ShipmentStatus.Pending,
            deliveryDate: '2024-03-22',
            createdAt: new Date().toISOString()
          },
          {
            id: '4',
            shipmentId: 'SHIP004',
            location: 'Miami',
            status: ShipmentStatus.OutForDelivery,
            deliveryDate: '2024-03-18',
            createdAt: new Date().toISOString()
          },
          {
            id: '5',
            shipmentId: 'SHIP005',
            location: 'Seattle',
            status: ShipmentStatus.Cancelled,
            deliveryDate: '2024-03-25',
            createdAt: new Date().toISOString()
          }
        ];
        setShipments(sampleData);
        localStorage.setItem('shipments', JSON.stringify(sampleData));
      }
    } catch (err) {
      console.error('Error loading shipments:', err);
      setError('Failed to load shipments data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save data to local storage when it changes
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('shipments', JSON.stringify(shipments));
    }
  }, [shipments, isLoading]);

  // Close modal on escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  // Handle clicking outside modal to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node) && isModalOpen) {
        closeModal();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isModalOpen]);

  // Filtered and sorted shipments
  const filteredShipments = shipments.filter((shipment) => {
    // Filter by search term (case insensitive)
    const matchesSearch =
      shipment.shipmentId.toLowerCase().includes(search.toLowerCase()) ||
      shipment.location.toLowerCase().includes(search.toLowerCase());

    // Filter by status if a filter is selected
    const matchesFilter = filter ? shipment.status === filter : true;

    return matchesSearch && matchesFilter;
  });

  // Sort shipments if a sort config exists
  const sortedShipments = [...filteredShipments].sort((a, b) => {
    if (sortConfig.key === '') return 0;
    
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

  // Analytics data for charts
  const statusData = statuses.map(status => {
    return {
      name: status,
      value: shipments.filter(shipment => shipment.status === status).length
    };
  });

  const locationData = shipments.reduce<{ name: string; count: number }[]>((acc, shipment) => {
    const locationEntry = acc.find(item => item.name === shipment.location);
    if (locationEntry) {
      locationEntry.count += 1;
    } else {
      acc.push({ name: shipment.location, count: 1 });
    }
    return acc;
  }, []);

  // Request sort
  const requestSort = (key: keyof Shipment) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Handlers
  const openAddModal = () => {
    setCurrentShipment(null);
    setIsModalOpen(true);
  };

  const openEditModal = (shipment: Shipment) => {
    setCurrentShipment(shipment);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setError('');
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this shipment?')) {
      setShipments(shipments.filter(shipment => shipment.id !== id));
    }
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const shipmentId = formData.get('shipmentId') as string;
    const location = formData.get('location') as string;
    const status = formData.get('status') as ShipmentStatus;
    const deliveryDate = formData.get('deliveryDate') as string;

    // Basic validation
    if (!shipmentId || !location || !status || !deliveryDate) {
      setError('All fields are required');
      return;
    }

    // Validate date format
    if (!isValid(parseISO(deliveryDate))) {
      setError('Invalid delivery date format');
      return;
    }

    // Check for duplicate Shipment ID when adding new shipment
    if (!currentShipment && shipments.some(s => s.shipmentId === shipmentId)) {
      setError('Shipment ID already exists');
      return;
    }

    if (currentShipment) {
      // Update existing shipment
      setShipments(shipments.map(shipment =>
        shipment.id === currentShipment.id
          ? {
              ...shipment,
              shipmentId,
              location,
              status,
              deliveryDate
            }
          : shipment
      ));
    } else {
      // Add new shipment
      const newShipment: Shipment = {
        id: Date.now().toString(),
        shipmentId,
        location,
        status,
        deliveryDate,
        createdAt: new Date().toISOString()
      };
      setShipments([...shipments, newShipment]);
    }

    closeModal();
  };

  // Parse CSV data
  const parseCSV = (text: string): CSVRow[] => {
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(header => header.trim());
    
    return lines.slice(1).filter(line => line.trim() !== '').map(line => {
      const values = line.split(',').map(value => value.trim());
      return headers.reduce((obj: CSVRow, header, index) => {
        obj[header] = values[index] || '';
        return obj;
      }, {});
    });
  };

  // Process imported file
  const processImportedData = (data: CSVRow[]) => {
    try {
      const newShipments: Shipment[] = data.map((row, index) => {
        // Handle different field name formats
        const shipmentId = row['Shipment ID'] || row['shipmentId'] || row['shipment_id'] || '';
        const location = row['Location'] || row['location'] || '';
        const status = (row['Status'] || row['status'] || '') as ShipmentStatus;
        const deliveryDate = row['Delivery Date'] || row['deliveryDate'] || row['delivery_date'] || '';
        
        // Validate required fields
        if (!shipmentId || !location || !status || !deliveryDate) {
          throw new Error(`Row ${index + 1} has missing required fields`);
        }
        
        // Validate date format
        if (!isValid(parseISO(deliveryDate))) {
          throw new Error(`Row ${index + 1} has invalid delivery date format`);
        }
        
        // Validate status
        if (!Object.values(ShipmentStatus).includes(status as ShipmentStatus)) {
          throw new Error(`Row ${index + 1} has invalid status: ${status}`);
        }
        
        return {
          id: Date.now().toString() + index,
          shipmentId,
          location,
          status: status as ShipmentStatus,
          deliveryDate,
          createdAt: new Date().toISOString()
        };
      });
      
      setShipments([...shipments, ...newShipments]);
      return true;
    } catch (err) {
      setError(`Import error: ${(err as Error).message}`);
      return false;
    }
  };

  // Handle file import
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        
        let data: CSVRow[] = [];
        
        // Determine file type and parse accordingly
        if (file.name.endsWith('.json')) {
          // Parse JSON
          data = JSON.parse(content);
        } else if (file.name.endsWith('.csv') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
          // Parse CSV
          data = parseCSV(content);
        } else {
          setError('Unsupported file format. Please upload JSON, CSV, or Excel file.');
          return;
        }
        
        const success = processImportedData(data);
        if (success) {
          alert('Data imported successfully');
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      } catch (err) {
        console.error('Error importing file:', err);
        setError(`Failed to import file: ${(err as Error).message}`);
      }
    };
    
    reader.onerror = () => {
      setError('Error reading file');
    };
    
    if (file.name.endsWith('.json') || file.name.endsWith('.csv') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      reader.readAsText(file);
    } else {
      setError('Unsupported file format. Please upload JSON, CSV, or Excel file.');
    }
  };

  // Generate template for download
  const generateTemplate = (format: 'csv' | 'json') => {
    const templateData = [
      {
        'Shipment ID': 'SHIP001',
        'Location': 'New York',
        'Status': 'In Transit',
        'Delivery Date': '2024-03-15'
      },
      {
        'Shipment ID': 'SHIP002',
        'Location': 'Los Angeles',
        'Status': 'Delivered',
        'Delivery Date': '2024-03-10'
      }
    ];
    
    let content = '';
    let filename = '';
    let type = '';
    
    if (format === 'csv') {
      // Generate CSV
      const headers = Object.keys(templateData[0]).join(',');
      const rows = templateData.map(item => 
        Object.values(item).join(',')
      ).join('\n');
      content = `${headers}\n${rows}`;
      filename = 'shipment_template.csv';
      type = 'text/csv';
    } else {
      // Generate JSON
      content = JSON.stringify(templateData, null, 2);
      filename = 'shipment_template.json';
      type = 'application/json';
    }
    
    // Create download link
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Status color mapping
  const getStatusColor = (status: ShipmentStatus): string => {
    switch (status) {
      case ShipmentStatus.Delivered:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case ShipmentStatus.InTransit:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case ShipmentStatus.Pending:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case ShipmentStatus.Cancelled:
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case ShipmentStatus.OutForDelivery:
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  // Chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  // Format date for display
  const formatDate = (dateString: string): string => {
    try {
      const date = parseISO(dateString);
      if (isValid(date)) {
        return format(date, 'MMM dd, yyyy');
      }
      return dateString;
    } catch (error) {
      return dateString;
    }
  };

  // Dark mode toggle
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode === 'true' || 
      (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 theme-transition-all">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow">
        <div className="container-fluid py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <Package size={24} className="text-primary-600 dark:text-primary-400" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Shipment Tracker</h1>
            </div>
            <div className="flex items-center space-x-4">
              {/* Theme toggle */}
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">Light</span>
                <button 
                  className="theme-toggle"
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  <span className="theme-toggle-thumb"></span>
                  <span className="sr-only">{isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}</span>
                </button>
                <span className="text-xs text-gray-500 dark:text-gray-400">Dark</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container-fluid py-6">
        {/* Action Bar */}
        <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                className="input pl-10"
                placeholder="Search shipments..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search shipments"
              />
            </div>

            {/* Filter by status */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter size={18} className="text-gray-400" />
              </div>
              <select
                className="input pl-10 pr-8 appearance-none"
                value={filter}
                onChange={(e) => setFilter(e.target.value as ShipmentStatus | '')}
                aria-label="Filter by status"
              >
                <option value="">All Statuses</option>
                {Object.values(ShipmentStatus).map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <ChevronDown size={18} className="text-gray-400" />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Import/Export */}
            <div className="flex gap-2">
              <div className="relative">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileImport}
                  accept=".json,.csv,.xlsx,.xls"
                  className="sr-only"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="btn btn-secondary flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Upload size={16} />
                  <span>Import</span>
                </label>
              </div>
              
              <div className="dropdown relative">
                <button 
                  className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 flex items-center justify-center gap-1"
                  onClick={() => {
                    const dropdown = document.getElementById('template-dropdown');
                    dropdown?.classList.toggle('hidden');
                  }}
                >
                  <Download size={16} />
                  <span>Download</span>
                  <ChevronDown size={16} />
                </button>
                <div id="template-dropdown" className="hidden absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 shadow-lg rounded-md overflow-hidden z-[var(--z-dropdown)]">
                  <ul className="py-1">
                    <li>
                      <button 
                        onClick={() => generateTemplate('csv')} 
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-2"
                      >
                        <FileText size={16} />
                        <span>CSV Template</span>
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => generateTemplate('json')} 
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-2"
                      >
                        <FileText size={16} />
                        <span>JSON Template</span>
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            {/* Add New */}
            <button
              onClick={openAddModal}
              className="btn btn-primary flex items-center justify-center gap-2"
            >
              <Plus size={16} />
              <span>Add Shipment</span>
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="alert alert-error mb-4">
            <X size={20} />
            <p>{error}</p>
          </div>
        )}

        {/* Shipments Cards (Mobile View) */}
        <div className="grid grid-cols-1 gap-4 md:hidden">
          {isLoading ? (
            // Loading skeleton for mobile
            <div className="space-y-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="card animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/3"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : sortedShipments.length > 0 ? (
            sortedShipments.map((shipment) => (
              <div key={shipment.id} className="card">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <ShipmentIcon size={18} className="text-gray-500" />
                    {shipment.shipmentId}
                  </h3>
                  <span className={`badge ${getStatusColor(shipment.status)}`}>
                    {shipment.status}
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <MapPin size={16} className="text-gray-500 mt-0.5" />
                    <span>{shipment.location}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Calendar size={16} className="text-gray-500 mt-0.5" />
                    <span>Delivery: {formatDate(shipment.deliveryDate)}</span>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={() => openEditModal(shipment)}
                    className="btn btn-sm bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 flex items-center gap-1"
                    aria-label={`Edit ${shipment.shipmentId}`}
                  >
                    <Edit size={14} />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(shipment.id)}
                    className="btn btn-sm bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 flex items-center gap-1"
                    aria-label={`Delete ${shipment.shipmentId}`}
                  >
                    <Trash2 size={14} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="card text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No shipments found. Add a new shipment or import data.</p>
            </div>
          )}
        </div>

        {/* Shipments Table (Desktop View) */}
        <div className="hidden md:block">
          <div className="card overflow-hidden">
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th className="table-header px-6 py-3">
                      <button
                        className="flex items-center space-x-1 focus:outline-none"
                        onClick={() => requestSort('shipmentId')}
                        aria-label="Sort by Shipment ID"
                      >
                        <span>Shipment ID</span>
                        <ArrowDownUp size={14} className="text-gray-400" />
                      </button>
                    </th>
                    <th className="table-header px-6 py-3">
                      <button
                        className="flex items-center space-x-1 focus:outline-none"
                        onClick={() => requestSort('location')}
                        aria-label="Sort by Location"
                      >
                        <span>Location</span>
                        <ArrowDownUp size={14} className="text-gray-400" />
                      </button>
                    </th>
                    <th className="table-header px-6 py-3">
                      <button
                        className="flex items-center space-x-1 focus:outline-none"
                        onClick={() => requestSort('status')}
                        aria-label="Sort by Status"
                      >
                        <span>Status</span>
                        <ArrowDownUp size={14} className="text-gray-400" />
                      </button>
                    </th>
                    <th className="table-header px-6 py-3">
                      <button
                        className="flex items-center space-x-1 focus:outline-none"
                        onClick={() => requestSort('deliveryDate')}
                        aria-label="Sort by Delivery Date"
                      >
                        <span>Delivery Date</span>
                        <ArrowDownUp size={14} className="text-gray-400" />
                      </button>
                    </th>
                    <th className="table-header px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                  {isLoading ? (
                    // Loading skeleton for table
                    [...Array(5)].map((_, index) => (
                      <tr key={index} className="animate-pulse">
                        <td className="table-cell">
                          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4"></div>
                        </td>
                        <td className="table-cell">
                          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/2"></div>
                        </td>
                        <td className="table-cell">
                          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/2"></div>
                        </td>
                        <td className="table-cell">
                          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/2"></div>
                        </td>
                        <td className="table-cell">
                          <div className="flex justify-end">
                            <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-24"></div>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : sortedShipments.length > 0 ? (
                    sortedShipments.map((shipment) => (
                      <tr key={shipment.id} className="hover:bg-gray-50 dark:hover:bg-slate-750">
                        <td className="table-cell font-medium">{shipment.shipmentId}</td>
                        <td className="table-cell">
                          <div className="flex items-center gap-1">
                            <MapPin size={16} className="text-gray-500" />
                            <span>{shipment.location}</span>
                          </div>
                        </td>
                        <td className="table-cell">
                          <span className={`badge ${getStatusColor(shipment.status)}`}>
                            {shipment.status}
                          </span>
                        </td>
                        <td className="table-cell">{formatDate(shipment.deliveryDate)}</td>
                        <td className="table-cell">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openEditModal(shipment)}
                              className="btn btn-sm bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 flex items-center gap-1"
                              aria-label={`Edit ${shipment.shipmentId}`}
                            >
                              <Edit size={14} />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleDelete(shipment.id)}
                              className="btn btn-sm bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 flex items-center gap-1"
                              aria-label={`Delete ${shipment.shipmentId}`}
                            >
                              <Trash2 size={14} />
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="table-cell text-center py-8">
                        <p className="text-gray-500 dark:text-gray-400">No shipments found. Add a new shipment or import data.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        {/* Dashboard Analytics */}
        {!isLoading && shipments.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Shipment Analytics</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Status Distribution */}
              <div className="card">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Status Distribution</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => entry.name}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name) => [`${value} shipments`, name]}
                        contentStyle={{ background: isDarkMode ? '#1e293b' : '#fff', border: '1px solid #ccc' }}
                        itemStyle={{ color: isDarkMode ? '#e2e8f0' : '#1f2937' }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Location Distribution */}
              <div className="card">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Shipments by Location</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={locationData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => [`${value} shipments`, 'Count']}
                        contentStyle={{ background: isDarkMode ? '#1e293b' : '#fff', border: '1px solid #ccc' }}
                        itemStyle={{ color: isDarkMode ? '#e2e8f0' : '#1f2937' }}
                      />
                      <Legend />
                      <Bar dataKey="count" name="Shipments" fill="#8884d8">
                        {locationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 mt-auto py-4">
        <div className="container-fluid text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Copyright © {new Date().getFullYear()} Datavtar Private Limited. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div ref={modalRef} className="modal-content">
            <div className="modal-header">
              <h3 id="modal-title" className="text-lg font-medium text-gray-900 dark:text-white">
                {currentShipment ? 'Edit Shipment' : 'Add New Shipment'}
              </h3>
              <button 
                aria-label="Close modal" 
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                onClick={closeModal}
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit} className="mt-4">
              <div className="space-y-4">
                {/* Shipment ID */}
                <div className="form-group">
                  <label htmlFor="shipmentId" className="form-label">
                    Shipment ID
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <ShipmentIcon size={16} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="shipmentId"
                      name="shipmentId"
                      className="input pl-9"
                      defaultValue={currentShipment?.shipmentId || ''}
                      readOnly={!!currentShipment}
                      required
                    />
                  </div>
                </div>
                
                {/* Location */}
                <div className="form-group">
                  <label htmlFor="location" className="form-label">
                    Location
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin size={16} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      className="input pl-9"
                      defaultValue={currentShipment?.location || ''}
                      required
                    />
                  </div>
                </div>
                
                {/* Status */}
                <div className="form-group">
                  <label htmlFor="status" className="form-label">
                    Status
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Truck size={16} className="text-gray-400" />
                    </div>
                    <select
                      id="status"
                      name="status"
                      className="input pl-9 pr-10 appearance-none"
                      defaultValue={currentShipment?.status || ''}
                      required
                    >
                      <option value="" disabled>Select status</option>
                      {Object.values(ShipmentStatus).map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <ChevronDown size={16} className="text-gray-400" />
                    </div>
                  </div>
                </div>
                
                {/* Delivery Date */}
                <div className="form-group">
                  <label htmlFor="deliveryDate" className="form-label">
                    Delivery Date
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar size={16} className="text-gray-400" />
                    </div>
                    <input
                      type="date"
                      id="deliveryDate"
                      name="deliveryDate"
                      className="input pl-9"
                      defaultValue={currentShipment?.deliveryDate || ''}
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex items-center justify-center gap-2"
                >
                  <Check size={16} />
                  {currentShipment ? 'Update' : 'Add'} Shipment
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