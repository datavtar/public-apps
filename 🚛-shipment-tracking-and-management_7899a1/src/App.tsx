import React, { useState, useEffect, useCallback, ChangeEvent, KeyboardEvent } from 'react';
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { read, utils, writeFile } from 'xlsx';
import Papa from 'papaparse';
import { 
  Upload, Download, Search, Filter, Plus, Edit, Trash2, X, 
  Sun, Moon, ArrowUp, ArrowDown, FileText, FileJson, Table
} from 'lucide-react';

import styles from './styles/styles.module.css';

// Types and Interfaces
type ShipmentStatus = 'Pending' | 'In Transit' | 'Delivered' | 'Delayed' | 'Exception';

interface Shipment {
  id: string;
  trackingNumber: string;
  location: string;
  status: ShipmentStatus;
  expectedDeliveryDate: string; // Store as YYYY-MM-DD string
  actualDeliveryDate?: string; // Store as YYYY-MM-DD string
}

type SortField = keyof Shipment | null;
type SortDirection = 'asc' | 'desc';

interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

// Constants
const LOCAL_STORAGE_KEY = 'shipmentsData';
const SHIPMENT_STATUSES: ShipmentStatus[] = ['Pending', 'In Transit', 'Delivered', 'Delayed', 'Exception'];
const STATUS_COLORS: { [key in ShipmentStatus]: string } = {
  Pending: '#fbbf24', // amber-400
  'In Transit': '#3b82f6', // blue-500
  Delivered: '#22c55e', // green-500
  Delayed: '#f97316', // orange-500
  Exception: '#ef4444', // red-500
};

// Helper Functions
const generateId = (): string => `shipment_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

const formatDate = (date: Date | string | undefined): string => {
  if (!date) return '';
  try {
    const d = typeof date === 'string' ? new Date(date + 'T00:00:00') : date; // Ensure date is parsed correctly regardless of timezone
    if (isNaN(d.getTime())) return ''; // Invalid date
    return d.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  } catch (error) {
    console.error('Error formatting date:', date, error);
    return '';
  }
};

const parseDateSafe = (dateString: string | undefined | null): string => {
  if (!dateString) return '';
  try {
    // Common date formats (add more as needed)
    // Check for YYYY-MM-DD first
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      const parsed = new Date(dateString + 'T00:00:00');
      if (!isNaN(parsed.getTime())) return formatDate(parsed);
    }
    
    // Try parsing other formats that Date() might handle
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
        return formatDate(date);
    }

    // Try excel date serial number
    if (typeof dateString === 'number' && dateString > 0) {
      const excelEpoch = new Date(1899, 11, 30); // Excel epoch starts Dec 30, 1899
      const dateFromExcel = new Date(excelEpoch.getTime() + dateString * 24 * 60 * 60 * 1000);
      if (!isNaN(dateFromExcel.getTime())) {
          return formatDate(dateFromExcel);
      }
    }

  } catch (e) {
    console.warn(`Could not parse date: ${dateString}`, e);
  }
  return ''; // Return empty if parsing fails
};

// Main App Component
const App: React.FC = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [filteredShipments, setFilteredShipments] = useState<Shipment[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingShipment, setEditingShipment] = useState<Shipment | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<ShipmentStatus | ''>('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: null, direction: 'asc' });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      return savedMode === 'true' || (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  // --- Effects ---

  // Load initial data and theme
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      const initialShipments = savedData ? JSON.parse(savedData) : [
        // Add some default data for demonstration
        {
          id: generateId(),
          trackingNumber: 'TRACK12345',
          location: 'New York Hub', 
          status: 'In Transit',
          expectedDeliveryDate: formatDate(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)), // 3 days from now
          actualDeliveryDate: ''
        },
        {
          id: generateId(),
          trackingNumber: 'TRACK67890',
          location: 'Los Angeles Warehouse', 
          status: 'Pending',
          expectedDeliveryDate: formatDate(new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)), // 5 days from now
          actualDeliveryDate: ''
        },
         {
          id: generateId(),
          trackingNumber: 'TRACK54321',
          location: 'Chicago Distribution', 
          status: 'Delivered',
          expectedDeliveryDate: formatDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)), // 2 days ago
          actualDeliveryDate: formatDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)) // 2 days ago
        },
      ];
      setShipments(initialShipments);
    } catch (err) {
      console.error("Failed to load shipments from local storage:", err);
      setError("Failed to load saved shipment data. Please refresh the page or clear local storage.");
      setShipments([]); // Start with empty if storage is corrupted
    }
    setIsLoading(false);
  }, []);

  // Save data to local storage
  useEffect(() => {
    if (!isLoading) { // Only save after initial load
        try {
             localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(shipments));
        } catch (err) {
             console.error("Failed to save shipments to local storage:", err);
             setError("Could not save shipment data. Changes might be lost upon closing.");
        }
    }
  }, [shipments, isLoading]);

  // Apply dark mode class
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  // Filtering and Sorting Logic
  useEffect(() => {
    let result = [...shipments];

    // Search
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(s => 
        s.trackingNumber.toLowerCase().includes(lowerSearchTerm) ||
        s.location.toLowerCase().includes(lowerSearchTerm)
      );
    }

    // Filter by status
    if (statusFilter) {
      result = result.filter(s => s.status === statusFilter);
    }

    // Sorting
    if (sortConfig.field) {
      result.sort((a, b) => {
        const field = sortConfig.field as keyof Shipment;
        const valA = a[field] ?? '';
        const valB = b[field] ?? '';

        let comparison = 0;
        if (valA > valB) {
          comparison = 1;
        } else if (valA < valB) {
          comparison = -1;
        }
        return sortConfig.direction === 'desc' ? comparison * -1 : comparison;
      });
    }

    setFilteredShipments(result);
  }, [shipments, searchTerm, statusFilter, sortConfig]);
  
  // Close modal on Escape key
  useEffect(() => {
    const handleEsc = (event: globalThis.KeyboardEvent) => {
       if (event.key === 'Escape') {
          closeModal();
       }
    };
    window.addEventListener('keydown', handleEsc);

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, []); // Empty dependency array ensures this effect runs only once

  // --- Event Handlers ---

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value as ShipmentStatus | '');
  };

  const requestSort = (field: SortField) => {
    if (!field) return;
    let direction: SortDirection = 'asc';
    if (sortConfig.field === field && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ field, direction });
  };

  const openModal = (shipment: Shipment | null = null) => {
    setEditingShipment(shipment ? { ...shipment } : null);
    setError(null); // Clear previous errors
    document.body.classList.add('modal-open');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingShipment(null);
    setError(null);
    document.body.classList.remove('modal-open');
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newShipmentData: Omit<Shipment, 'id'> = {
      trackingNumber: formData.get('trackingNumber') as string,
      location: formData.get('location') as string,
      status: formData.get('status') as ShipmentStatus,
      expectedDeliveryDate: formatDate(formData.get('expectedDeliveryDate') as string),
      actualDeliveryDate: formatDate(formData.get('actualDeliveryDate') as string),
    };
    
    // Basic Validation
    if (!newShipmentData.trackingNumber || !newShipmentData.location || !newShipmentData.status || !newShipmentData.expectedDeliveryDate) {
      setError('Please fill in all required fields (Tracking #, Location, Status, Expected Delivery Date).');
      return;
    }
    
    setError(null); // Clear error on successful validation

    if (editingShipment) {
      // Update existing shipment
      setShipments(prevShipments => 
        prevShipments.map(s => s.id === editingShipment.id ? { ...editingShipment, ...newShipmentData } : s)
      );
    } else {
      // Add new shipment
      const newShipment: Shipment = {
        ...newShipmentData,
        id: generateId(),
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

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsLoading(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) throw new Error('File data is empty.');
        let parsedShipments: Partial<Shipment>[] = [];

        if (file.type === 'application/json') {
          parsedShipments = JSON.parse(data as string);
        } else if (file.type === 'text/csv') {
          const result = Papa.parse<Partial<Shipment>>(data as string, { header: true, skipEmptyLines: true });
          if (result.errors.length > 0) {
            throw new Error(`CSV Parsing Error: ${result.errors[0].message}`);
          }
          parsedShipments = result.data;
        } else if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.type === 'application/vnd.ms-excel') {
          const workbook = read(data, { type: 'array', cellDates: true }); // Try reading dates directly
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          // Attempt to read dates as strings to handle potential formatting issues before parsing
          parsedShipments = utils.sheet_to_json<Partial<Shipment>>(worksheet, { raw: false, dateNF: 'yyyy-mm-dd' });
        } else {
          throw new Error('Unsupported file type. Please upload CSV, Excel (XLSX), or JSON.');
        }

        const newShipments: Shipment[] = parsedShipments.map((item, index) => {
           // Validate and sanitize each item
           const status = SHIPMENT_STATUSES.includes(item.status as ShipmentStatus) ? item.status as ShipmentStatus : 'Pending';
           const expectedDate = parseDateSafe(item.expectedDeliveryDate);
           const actualDate = parseDateSafe(item.actualDeliveryDate);

           if (!item.trackingNumber || !item.location || !expectedDate) {
             console.warn(`Skipping invalid shipment data at row ${index + 1}:`, item);
             return null; // Skip invalid entries
           }

           return {
             id: item.id || generateId(), // Use existing ID or generate new
             trackingNumber: String(item.trackingNumber ?? ''),
             location: String(item.location ?? ''),
             status: status,
             expectedDeliveryDate: expectedDate,
             actualDeliveryDate: actualDate,
           };
        }).filter((s): s is Shipment => s !== null); // Filter out null (invalid) entries
        
        // Merge strategy: Update existing by trackingNumber, add new ones
        setShipments(prevShipments => {
            const existingTrackingNumbers = new Set(prevShipments.map(s => s.trackingNumber));
            const shipmentsToAdd = newShipments.filter(ns => !existingTrackingNumbers.has(ns.trackingNumber));
            
            const updatedShipments = prevShipments.map(ps => {
                const update = newShipments.find(ns => ns.trackingNumber === ps.trackingNumber);
                return update ? { ...ps, ...update, id: ps.id } : ps; // Keep original ID on update
            });

            return [...updatedShipments, ...shipmentsToAdd];
        });

      } catch (err: any) {
        console.error("File processing error:", err);
        setError(`Error processing file: ${err.message}`);
      } finally {
        setIsLoading(false);
        // Reset file input value to allow uploading the same file again
        event.target.value = ''; 
      }
    };

    reader.onerror = (err) => {
      console.error("File reading error:", err);
      setError("Failed to read the uploaded file.");
      setIsLoading(false);
      event.target.value = '';
    };

    if (file.type === 'application/json' || file.type === 'text/csv') {
      reader.readAsText(file);
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.type === 'application/vnd.ms-excel') {
      reader.readAsArrayBuffer(file);
    } else {
        setError('Unsupported file type. Please upload CSV, Excel (XLSX), or JSON.');
        setIsLoading(false);
        event.target.value = '';
    }
  };

  const handleDownloadTemplate = (format: 'csv' | 'json' | 'xlsx') => {
    const templateData: Omit<Shipment, 'id'>[] = [
      {
        trackingNumber: 'TRACK99999',
        location: 'Example Location', 
        status: 'Pending',
        expectedDeliveryDate: 'YYYY-MM-DD', 
        actualDeliveryDate: 'YYYY-MM-DD (Optional)'
      }
    ];

    if (format === 'csv') {
      const csv = Papa.unparse(templateData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', 'shipment_template.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (format === 'json') {
      const json = JSON.stringify(templateData, null, 2);
      const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', 'shipment_template.json');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (format === 'xlsx') {
        const worksheet = utils.json_to_sheet(templateData);
        const workbook = utils.book_new();
        utils.book_append_sheet(workbook, worksheet, 'Shipments');
        // Add comments or instructions for date format if possible/easy
        // worksheet['E1'].c = [{a: "System", t: "Enter date as YYYY-MM-DD"}]; // Basic comment example
        // worksheet['F1'].c = [{a: "System", t: "Enter date as YYYY-MM-DD (Optional)"}];
        writeFile(workbook, 'shipment_template.xlsx');
    }
  };

  // --- Render Logic ---

  const getSortIcon = (field: SortField) => {
    if (sortConfig.field !== field) return null;
    return sortConfig.direction === 'asc' ? <ArrowUp className="h-4 w-4 inline ml-1" /> : <ArrowDown className="h-4 w-4 inline ml-1" />;
  };

  const shipmentStatusData = SHIPMENT_STATUSES.map(status => ({
    name: status,
    value: shipments.filter(s => s.status === status).length,
    fill: STATUS_COLORS[status],
  })).filter(item => item.value > 0); // Only show statuses with data

  return (
    <div className={`min-h-screen flex flex-col theme-transition-all ${styles.appContainer} bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-slate-100`}>
      {/* Header */} 
      <header className="bg-white dark:bg-slate-800 shadow-md p-4 sticky top-0 z-[var(--z-sticky)] theme-transition">
        <div className="container-wide mx-auto flex-between flex-wrap gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-primary-600 dark:text-primary-400">Shipment Tracker</h1>
          <div className="flex items-center gap-2 sm:gap-4">
             <span className="text-sm hidden sm:inline">Light</span>
             <button 
              className="theme-toggle flex-shrink-0" 
              onClick={() => setIsDarkMode(!isDarkMode)}
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              role="switch"
              aria-checked={isDarkMode}
            >
              <span className="theme-toggle-thumb"></span>
              {isDarkMode ? <Moon className="h-3 w-3 absolute right-1 top-1/2 -translate-y-1/2 text-yellow-300" /> : <Sun className="h-3 w-3 absolute left-1 top-1/2 -translate-y-1/2 text-orange-400" />}
            </button>
             <span className="text-sm hidden sm:inline">Dark</span>
          </div>
        </div>
      </header>

      {/* Main Content */} 
      <main className="flex-grow container-wide mx-auto p-4 md:p-6 lg:p-8">
        {isLoading && <p className="text-center text-lg font-medium">Loading shipments...</p>}
        {error && (
          <div className="alert alert-error mb-4">
            <X className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto text-sm font-medium hover:text-red-700 dark:hover:text-red-300">Dismiss</button>
          </div>
        )}

        {!isLoading && (
          <div className="space-y-6">
            {/* Dashboard Section */} 
            <section aria-labelledby="dashboard-title">
                 <h2 id="dashboard-title" className="text-lg sm:text-xl font-semibold mb-4">Dashboard</h2>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="stat-card theme-transition-bg">
                        <div className="stat-title">Total Shipments</div>
                        <div className="stat-value">{shipments.length}</div>
                    </div>
                    <div className="stat-card theme-transition-bg col-span-1 md:col-span-2">
                         <div className="stat-title mb-2">Shipment Status Overview</div>
                         {shipments.length > 0 ? (
                           <ResponsiveContainer width="100%" height={150}> 
                               <RechartsPieChart >
                                   <Pie
                                       data={shipmentStatusData}
                                       cx="50%"
                                       cy="50%"
                                       innerRadius={40} 
                                       outerRadius={60}
                                       paddingAngle={5}
                                       dataKey="value"
                                       nameKey="name"
                                   >
                                       {shipmentStatusData.map((entry, index) => (
                                           <Cell key={`cell-${index}`} fill={entry.fill} />
                                       ))}
                                   </Pie>
                                   <Tooltip 
                                       contentStyle={{ 
                                           backgroundColor: isDarkMode ? 'rgb(30 41 59)' : 'white', 
                                           borderColor: isDarkMode ? 'rgb(51 65 85)' : 'rgb(226, 232, 240)',
                                           borderRadius: 'var(--radius-md)',
                                           boxShadow: 'var(--shadow-md)'
                                       }}
                                       itemStyle={{ color: isDarkMode ? 'rgb(226, 232, 240)' : 'rgb(31, 41, 55)' }}
                                   />
                                   <Legend 
                                     iconSize={10} 
                                     layout="vertical" 
                                     verticalAlign="middle" 
                                     align="right" 
                                     wrapperStyle={{ fontSize: '12px', lineHeight: '18px' }} 
                                    />
                               </RechartsPieChart>
                            </ResponsiveContainer>
                         ) : (
                            <p className="text-center text-gray-500 dark:text-slate-400 py-10">No shipment data to display chart.</p>
                         )}
                     </div>
                 </div>
            </section>

            {/* Controls Section */} 
            <section aria-labelledby="controls-title" className="card theme-transition-bg">
                 <h2 id="controls-title" className="sr-only">Shipment Controls</h2>
                 <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 flex-wrap">
                    {/* Search and Filter */} 
                    <div className="flex flex-col sm:flex-row gap-2 flex-grow">
                        <div className="relative flex-grow">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Search className="h-5 w-5 text-gray-400" />
                            </span>
                            <input 
                                type="search" 
                                placeholder="Search Tracking # or Location..." 
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="input input-responsive pl-10" 
                                aria-label="Search shipments"
                            />
                        </div>
                         <div className="relative">
                              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                  <Filter className="h-5 w-5 text-gray-400" />
                              </span>
                              <select 
                                  value={statusFilter}
                                  onChange={handleFilterChange}
                                  className="input input-responsive pl-10 appearance-none" 
                                  aria-label="Filter by status"
                              >
                                  <option value="">All Statuses</option>
                                  {SHIPMENT_STATUSES.map(status => (
                                      <option key={status} value={status}>{status}</option>
                                  ))}
                              </select>
                              <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <ChevronDown className="h-4 w-4 text-gray-400" /> 
                              </span>
                          </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-2 items-stretch">
                        <button 
                           onClick={() => openModal()} 
                           className="btn btn-primary btn-responsive flex items-center justify-center gap-2"
                           aria-label="Add new shipment"
                        >
                            <Plus className="h-4 w-4" />
                            Add Shipment
                        </button>
                        <div className="relative group">
                           <label 
                               htmlFor="file-upload" 
                               className="btn bg-secondary-600 text-white hover:bg-secondary-700 focus:ring-secondary-500 btn-responsive flex items-center justify-center gap-2 cursor-pointer"
                               role="button" 
                               aria-label="Upload shipments file"
                            >
                                <Upload className="h-4 w-4" />
                                Upload
                            </label>
                            <input 
                                id="file-upload" 
                                type="file" 
                                className="hidden" 
                                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, application/json" 
                                onChange={handleFileUpload}
                                aria-hidden="true"
                            />
                            {/* Template Download Dropdown */}
                            <div className="absolute right-0 mt-1 w-48 rounded-md shadow-lg bg-white dark:bg-slate-700 ring-1 ring-black ring-opacity-5 focus:outline-none opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-150 z-[var(--z-dropdown)]">
                                <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                                    <button onClick={() => handleDownloadTemplate('csv')} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-600 flex items-center gap-2" role="menuitem">
                                        <FileText className="h-4 w-4"/> Download CSV Template
                                    </button>
                                    <button onClick={() => handleDownloadTemplate('xlsx')} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-600 flex items-center gap-2" role="menuitem">
                                         <Table className="h-4 w-4"/> Download Excel Template
                                     </button>
                                    <button onClick={() => handleDownloadTemplate('json')} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-600 flex items-center gap-2" role="menuitem">
                                        <FileJson className="h-4 w-4"/> Download JSON Template
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Shipments Table */} 
            <section aria-labelledby="shipments-table-title">
                <h2 id="shipments-table-title" className="sr-only">Shipments List</h2>
                <div className="table-container theme-transition-bg">
                    <table className="table">
                        <thead className="table-header theme-transition-bg">
                            <tr>
                                <th className="table-cell px-4 py-2 sm:px-6 sm:py-3 cursor-pointer" onClick={() => requestSort('trackingNumber')} role="columnheader" aria-sort={sortConfig.field === 'trackingNumber' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}>
                                    Tracking # {getSortIcon('trackingNumber')}
                                </th>
                                <th className="table-cell px-4 py-2 sm:px-6 sm:py-3 hidden md:table-cell cursor-pointer" onClick={() => requestSort('location')} role="columnheader" aria-sort={sortConfig.field === 'location' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}>
                                    Location {getSortIcon('location')}
                                </th>
                                <th className="table-cell px-4 py-2 sm:px-6 sm:py-3 cursor-pointer" onClick={() => requestSort('status')} role="columnheader" aria-sort={sortConfig.field === 'status' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}>
                                    Status {getSortIcon('status')}
                                </th>
                                <th className="table-cell px-4 py-2 sm:px-6 sm:py-3 hidden sm:table-cell cursor-pointer" onClick={() => requestSort('expectedDeliveryDate')} role="columnheader" aria-sort={sortConfig.field === 'expectedDeliveryDate' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}>
                                    Expected Delivery {getSortIcon('expectedDeliveryDate')}
                                </th>
                                <th className="table-cell px-4 py-2 sm:px-6 sm:py-3 hidden lg:table-cell cursor-pointer" onClick={() => requestSort('actualDeliveryDate')} role="columnheader" aria-sort={sortConfig.field === 'actualDeliveryDate' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}>
                                    Actual Delivery {getSortIcon('actualDeliveryDate')}
                                </th>
                                <th className="table-cell px-4 py-2 sm:px-6 sm:py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700 theme-transition-bg">
                            {filteredShipments.length > 0 ? (
                                filteredShipments.map(shipment => (
                                    <tr key={shipment.id} className="hover:bg-gray-50 dark:hover:bg-slate-700 theme-transition">
                                        <td className="table-cell px-4 py-3 sm:px-6 sm:py-4 font-medium text-gray-900 dark:text-white">{shipment.trackingNumber}</td>
                                        <td className="table-cell px-4 py-3 sm:px-6 sm:py-4 hidden md:table-cell">{shipment.location}</td>
                                        <td className="table-cell px-4 py-3 sm:px-6 sm:py-4">
                                            <span className={`badge`} style={{ backgroundColor: STATUS_COLORS[shipment.status] + '30', color: STATUS_COLORS[shipment.status] }}>{shipment.status}</span>
                                        </td>
                                        <td className="table-cell px-4 py-3 sm:px-6 sm:py-4 hidden sm:table-cell">{shipment.expectedDeliveryDate || '-'}</td>
                                        <td className="table-cell px-4 py-3 sm:px-6 sm:py-4 hidden lg:table-cell">{shipment.actualDeliveryDate || '-'}</td>
                                        <td className="table-cell px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <button 
                                                   onClick={() => openModal(shipment)} 
                                                   className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 p-1 rounded hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors" 
                                                   aria-label={`Edit shipment ${shipment.trackingNumber}`}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button 
                                                   onClick={() => handleDelete(shipment.id)} 
                                                   className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1 rounded hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors" 
                                                   aria-label={`Delete shipment ${shipment.trackingNumber}`}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="text-center py-10 text-gray-500 dark:text-slate-400">
                                        No shipments found matching your criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
          </div>
        )}
      </main>

      {/* Footer */} 
      <footer className="text-center py-4 text-sm text-gray-500 dark:text-slate-400 border-t border-gray-200 dark:border-slate-700 mt-8 theme-transition-bg">
          Copyright © {new Date().getFullYear()} Datavtar Private Limited. All rights reserved.
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
                className="modal-content slide-in theme-transition-all" 
                onClick={(e) => e.stopPropagation()} 
              >
                  <form onSubmit={handleFormSubmit} className="space-y-4">
                      <div className="modal-header">
                          <h3 id="modal-title" className="text-lg font-semibold">{editingShipment ? 'Edit Shipment' : 'Add New Shipment'}</h3>
                          <button 
                              type="button" 
                              onClick={closeModal} 
                              className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors" 
                              aria-label="Close modal"
                           >
                              <X className="h-5 w-5" />
                          </button>
                      </div>
                      
                      {error && (
                        <div className="alert alert-error text-sm">
                           <X className="h-4 w-4 flex-shrink-0" />
                           <span>{error}</span>
                        </div>
                      )}

                      <div className="form-group">
                          <label className="form-label" htmlFor="trackingNumber">Tracking Number <span className="text-red-500">*</span></label>
                          <input 
                             id="trackingNumber" 
                             name="trackingNumber" 
                             type="text" 
                             className="input" 
                             defaultValue={editingShipment?.trackingNumber ?? ''} 
                             required 
                          />
                      </div>
                      <div className="form-group">
                          <label className="form-label" htmlFor="location">Location <span className="text-red-500">*</span></label>
                          <input 
                             id="location" 
                             name="location" 
                             type="text" 
                             className="input" 
                             defaultValue={editingShipment?.location ?? ''} 
                             required 
                          />
                      </div>
                      <div className="form-group">
                          <label className="form-label" htmlFor="status">Status <span className="text-red-500">*</span></label>
                          <select 
                             id="status" 
                             name="status" 
                             className="input appearance-none" 
                             defaultValue={editingShipment?.status ?? 'Pending'} 
                             required
                          >
                              {SHIPMENT_STATUSES.map(status => (
                                  <option key={status} value={status}>{status}</option>
                              ))}
                          </select>
                          <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none top-7">
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                          </span>
                      </div>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <div className="form-group">
                              <label className="form-label" htmlFor="expectedDeliveryDate">Expected Delivery Date <span className="text-red-500">*</span></label>
                              <input 
                                 id="expectedDeliveryDate" 
                                 name="expectedDeliveryDate" 
                                 type="date" 
                                 className="input" 
                                 defaultValue={formatDate(editingShipment?.expectedDeliveryDate)} 
                                 required 
                                 aria-label="Expected Delivery Date"
                              />
                          </div>
                           <div className="form-group">
                              <label className="form-label" htmlFor="actualDeliveryDate">Actual Delivery Date</label>
                              <input 
                                 id="actualDeliveryDate" 
                                 name="actualDeliveryDate" 
                                 type="date" 
                                 className="input" 
                                 defaultValue={formatDate(editingShipment?.actualDeliveryDate)} 
                                 aria-label="Actual Delivery Date"
                              />
                          </div>
                       </div>

                      <div className="modal-footer">
                          <button 
                             type="button" 
                             onClick={closeModal} 
                             className="btn bg-gray-100 dark:bg-slate-600 text-gray-700 dark:text-slate-200 hover:bg-gray-200 dark:hover:bg-slate-500"
                             aria-label="Cancel"
                           >
                              Cancel
                          </button>
                          <button 
                             type="submit" 
                             className="btn btn-primary"
                             aria-label={editingShipment ? 'Save changes' : 'Add shipment'}
                          >
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

// Need ChevronDown for dropdown indicators, import if not already done
import { ChevronDown } from 'lucide-react';

export default App;
