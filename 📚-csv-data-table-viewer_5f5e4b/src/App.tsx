import React, { useState, useEffect, useRef } from 'react';
import { Upload, File, X, Download, ChevronDown, Filter, ArrowUpDown, Check } from 'lucide-react';
import styles from './styles/styles.module.css';

// Define the type for CSV data
interface CSVRow {
  id: string;
  status: string;
  origin: string;
  destination: string;
  [key: string]: string; // Allow for other columns that might exist in the CSV
}

// Status types for the application
type AppStatus = 'idle' | 'loading' | 'success' | 'error';

// Filter options type
interface FilterOptions {
  status: string[];
  origin: string[];
  destination: string[];
}

// Sort direction type
type SortDirection = 'asc' | 'desc' | null;

// Sort config type
interface SortConfig {
  key: keyof CSVRow | null;
  direction: SortDirection;
}

const App: React.FC = () => {
  // State for CSV data
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [displayData, setDisplayData] = useState<CSVRow[]>([]);
  const [fileError, setFileError] = useState<string>('');
  const [status, setStatus] = useState<AppStatus>('idle');
  const [fileName, setFileName] = useState<string>('');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode === 'true' || 
      (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Filter states
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    status: [],
    origin: [],
    destination: []
  });
  const [showFilterMenu, setShowFilterMenu] = useState<{[key: string]: boolean}>({
    status: false,
    origin: false,
    destination: false
  });
  
  // Sort state
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: null });

  // Apply dark mode effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('csvData');
    const savedFileName = localStorage.getItem('fileName');
    
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData) as CSVRow[];
        setCsvData(parsedData);
        setDisplayData(parsedData);
        setStatus('success');
        
        // Extract filter options
        extractFilterOptions(parsedData);
      } catch (error) {
        console.error('Error parsing saved data:', error);
      }
    }
    
    if (savedFileName) {
      setFileName(savedFileName);
    }
  }, []);

  // Extract unique values for filter options
  const extractFilterOptions = (data: CSVRow[]) => {
    const statusOptions = [...new Set(data.map(row => row.status))].filter(Boolean);
    const originOptions = [...new Set(data.map(row => row.origin))].filter(Boolean);
    const destinationOptions = [...new Set(data.map(row => row.destination))].filter(Boolean);
    
    setFilterOptions({
      status: statusOptions,
      origin: originOptions,
      destination: destinationOptions
    });
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setFileError('');
    
    if (!file) {
      return;
    }
    
    // Check if it's a CSV file
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setFileError('Please upload a valid CSV file');
      return;
    }
    
    setFileName(file.name);
    setStatus('loading');
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const result = parseCSV(text);
        
        if (result.length === 0) {
          setFileError('No data found in the CSV file');
          setStatus('error');
          return;
        }
        
        // Check if the required columns exist
        const firstRow = result[0];
        if (!('status' in firstRow) || !('origin' in firstRow) || !('destination' in firstRow)) {
          setFileError('CSV must contain status, origin, and destination columns');
          setStatus('error');
          return;
        }
        
        // Add unique IDs to each row
        const dataWithIds = result.map((row, index) => ({
          ...row,
          id: `row-${index}`
        }));
        
        setCsvData(dataWithIds);
        setDisplayData(dataWithIds);
        setStatus('success');
        
        // Save to localStorage
        localStorage.setItem('csvData', JSON.stringify(dataWithIds));
        localStorage.setItem('fileName', file.name);
        
        // Extract filter options
        extractFilterOptions(dataWithIds);
      } catch (error) {
        console.error('Error parsing CSV:', error);
        setFileError('Error parsing CSV file. Please check the format.');
        setStatus('error');
      }
    };
    
    reader.onerror = () => {
      setFileError('Error reading the file');
      setStatus('error');
    };
    
    reader.readAsText(file);
  };

  // Parse CSV text to array of objects
  const parseCSV = (text: string): Record<string, string>[] => {
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(header => header.trim());
    
    return lines.slice(1)
      .filter(line => line.trim() !== '')
      .map(line => {
        const values = line.split(',').map(value => value.trim());
        return headers.reduce((obj, header, index) => {
          obj[header] = values[index] || '';
          return obj;
        }, {} as Record<string, string>);
      });
  };

  // Generate a sample CSV template for download
  const generateTemplateCSV = () => {
    const headers = ['status', 'origin', 'destination'];
    const sampleData = [
      ['Active', 'New York', 'Los Angeles'],
      ['Completed', 'Chicago', 'Miami'],
      ['Pending', 'Seattle', 'Boston']
    ];
    
    const csvContent = [
      headers.join(','),
      ...sampleData.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'template.csv');
    a.click();
    URL.revokeObjectURL(url);
  };

  // Clear the current data
  const handleClearData = () => {
    setCsvData([]);
    setDisplayData([]);
    setFileName('');
    setStatus('idle');
    setActiveFilters({});
    setFilterOptions({
      status: [],
      origin: [],
      destination: []
    });
    localStorage.removeItem('csvData');
    localStorage.removeItem('fileName');
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Toggle filter menu
  const toggleFilterMenu = (column: string) => {
    setShowFilterMenu(prevState => ({
      ...prevState,
      [column]: !prevState[column]
    }));
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  // Handle filter change
  const handleFilterChange = (column: string, value: string) => {
    setActiveFilters(prevFilters => {
      const currentFilters = { ...prevFilters };
      
      if (!currentFilters[column]) {
        currentFilters[column] = [];
      }
      
      const index = currentFilters[column].indexOf(value);
      if (index === -1) {
        currentFilters[column] = [...currentFilters[column], value];
      } else {
        currentFilters[column] = currentFilters[column].filter(v => v !== value);
        if (currentFilters[column].length === 0) {
          delete currentFilters[column];
        }
      }
      
      return currentFilters;
    });
  };

  // Apply filters
  useEffect(() => {
    if (csvData.length === 0) return;
    
    let filteredData = [...csvData];
    
    // Apply each active filter
    Object.entries(activeFilters).forEach(([column, values]) => {
      if (values.length > 0) {
        filteredData = filteredData.filter(row => values.includes(row[column]));
      }
    });
    
    // Apply sorting if configured
    if (sortConfig.key && sortConfig.direction) {
      filteredData.sort((a, b) => {
        if (a[sortConfig.key!] < b[sortConfig.key!]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key!] > b[sortConfig.key!]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    setDisplayData(filteredData);
  }, [csvData, activeFilters, sortConfig]);

  // Handle sort request
  const requestSort = (key: keyof CSVRow) => {
    let direction: SortDirection = 'asc';
    
    if (sortConfig.key === key) {
      if (sortConfig.direction === 'asc') {
        direction = 'desc';
      } else if (sortConfig.direction === 'desc') {
        direction = null;
      }
    }
    
    setSortConfig({ key: direction ? key : null, direction });
  };

  // Determine icon and styles for sort
  const getSortDirectionIcon = (key: keyof CSVRow) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown size={16} className="text-gray-400" />;
    }
    
    if (sortConfig.direction === 'asc') {
      return <ChevronDown size={16} className="text-primary-600" />;
    }
    
    if (sortConfig.direction === 'desc') {
      return <ChevronDown size={16} className="text-primary-600 rotate-180" />;
    }
    
    return <ArrowUpDown size={16} className="text-gray-400" />;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 theme-transition-all">
      <header className="bg-white dark:bg-slate-800 shadow-sm theme-transition">
        <div className="container-fluid py-4 flex justify-between items-center">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
            CSV Data Viewer
          </h1>
          <button
            onClick={toggleDarkMode}
            className="theme-toggle"
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <span className="theme-toggle-thumb"></span>
          </button>
        </div>
      </header>

      <main className="container-fluid py-6">
        <div className="card mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Upload CSV Data</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Upload a CSV file containing status, origin, and destination columns
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={generateTemplateCSV}
                className="btn flex items-center justify-center gap-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-600 focus:ring-primary-500"
                aria-label="Download template"
              >
                <Download size={16} />
                <span>Template</span>
              </button>
              
              {csvData.length > 0 && (
                <button
                  onClick={handleClearData}
                  className="btn flex items-center justify-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 focus:ring-red-500"
                  aria-label="Clear data"
                >
                  <X size={16} />
                  <span>Clear Data</span>
                </button>
              )}
            </div>
          </div>
          
          <div className={`border-2 border-dashed rounded-lg p-6 ${isDarkMode ? 'border-slate-700 bg-slate-800/50' : 'border-gray-300 bg-gray-50'} theme-transition text-center`}>
            <div className="flex flex-col items-center">
              <Upload size={40} className="text-gray-400 dark:text-gray-500 mb-2" />
              <h3 className="text-gray-900 dark:text-white font-medium mb-1">
                {status === 'success' ? 'CSV File Uploaded' : 'Upload a CSV File'}
              </h3>
              
              {status === 'success' && fileName && (
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <File size={16} />
                  <span>{fileName}</span>
                </div>
              )}
              
              {status !== 'success' && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Drag and drop a CSV file or click to browse
                </p>
              )}
              
              {fileError && (
                <div className="alert alert-error mb-4">
                  <X size={16} />
                  <span>{fileError}</span>
                </div>
              )}
              
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
                id="csv-upload"
                ref={fileInputRef}
              />
              
              <label
                htmlFor="csv-upload"
                className="btn btn-primary flex items-center gap-2 cursor-pointer"
              >
                <Upload size={16} />
                {status === 'success' ? 'Upload Another File' : 'Browse Files'}
              </label>
            </div>
          </div>
        </div>
        
        {status === 'success' && displayData.length > 0 && (
          <div className="card fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                CSV Data ({displayData.length} rows)
              </h2>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {Object.keys(activeFilters).length > 0 
                  ? `Filtered: ${Object.keys(activeFilters).length} active filters` 
                  : 'No active filters'}
              </div>
            </div>
            
            <div className="table-container mb-4">
              <table className="table">
                <thead>
                  <tr>
                    <th className="table-header">
                      <div className="flex items-center justify-between px-6 py-3">
                        <button
                          className="flex items-center gap-1 focus:outline-none"
                          onClick={() => requestSort('status')}
                          aria-label="Sort by Status"
                        >
                          Status {getSortDirectionIcon('status')}
                        </button>
                        <div className="relative">
                          <button
                            onClick={() => toggleFilterMenu('status')}
                            className={`p-1 rounded-md hover:bg-gray-200 dark:hover:bg-slate-600 ${activeFilters['status']?.length ? 'text-primary-600 dark:text-primary-400' : ''}`}
                            aria-label="Filter by Status"
                          >
                            <Filter size={16} />
                          </button>
                          {showFilterMenu.status && filterOptions.status.length > 0 && (
                            <div className={`${styles.filterDropdown} absolute right-0 top-8 z-[var(--z-dropdown)] bg-white dark:bg-slate-700 shadow-lg rounded-md border border-gray-200 dark:border-slate-600 p-2 min-w-[160px]`}>
                              <div className="max-h-60 overflow-y-auto">
                                {filterOptions.status.map((option) => (
                                  <div key={option} className="flex items-center px-2 py-1 hover:bg-gray-100 dark:hover:bg-slate-600 rounded-md">
                                    <label className="flex items-center w-full cursor-pointer">
                                      <input
                                        type="checkbox"
                                        className="mr-2 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:bg-slate-800 dark:border-slate-600"
                                        checked={activeFilters['status']?.includes(option) || false}
                                        onChange={() => handleFilterChange('status', option)}
                                      />
                                      <span className="text-sm">{option}</span>
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </th>
                    <th className="table-header">
                      <div className="flex items-center justify-between px-6 py-3">
                        <button
                          className="flex items-center gap-1 focus:outline-none"
                          onClick={() => requestSort('origin')}
                          aria-label="Sort by Origin"
                        >
                          Origin {getSortDirectionIcon('origin')}
                        </button>
                        <div className="relative">
                          <button
                            onClick={() => toggleFilterMenu('origin')}
                            className={`p-1 rounded-md hover:bg-gray-200 dark:hover:bg-slate-600 ${activeFilters['origin']?.length ? 'text-primary-600 dark:text-primary-400' : ''}`}
                            aria-label="Filter by Origin"
                          >
                            <Filter size={16} />
                          </button>
                          {showFilterMenu.origin && filterOptions.origin.length > 0 && (
                            <div className={`${styles.filterDropdown} absolute right-0 top-8 z-[var(--z-dropdown)] bg-white dark:bg-slate-700 shadow-lg rounded-md border border-gray-200 dark:border-slate-600 p-2 min-w-[160px]`}>
                              <div className="max-h-60 overflow-y-auto">
                                {filterOptions.origin.map((option) => (
                                  <div key={option} className="flex items-center px-2 py-1 hover:bg-gray-100 dark:hover:bg-slate-600 rounded-md">
                                    <label className="flex items-center w-full cursor-pointer">
                                      <input
                                        type="checkbox"
                                        className="mr-2 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:bg-slate-800 dark:border-slate-600"
                                        checked={activeFilters['origin']?.includes(option) || false}
                                        onChange={() => handleFilterChange('origin', option)}
                                      />
                                      <span className="text-sm">{option}</span>
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </th>
                    <th className="table-header">
                      <div className="flex items-center justify-between px-6 py-3">
                        <button
                          className="flex items-center gap-1 focus:outline-none"
                          onClick={() => requestSort('destination')}
                          aria-label="Sort by Destination"
                        >
                          Destination {getSortDirectionIcon('destination')}
                        </button>
                        <div className="relative">
                          <button
                            onClick={() => toggleFilterMenu('destination')}
                            className={`p-1 rounded-md hover:bg-gray-200 dark:hover:bg-slate-600 ${activeFilters['destination']?.length ? 'text-primary-600 dark:text-primary-400' : ''}`}
                            aria-label="Filter by Destination"
                          >
                            <Filter size={16} />
                          </button>
                          {showFilterMenu.destination && filterOptions.destination.length > 0 && (
                            <div className={`${styles.filterDropdown} absolute right-0 top-8 z-[var(--z-dropdown)] bg-white dark:bg-slate-700 shadow-lg rounded-md border border-gray-200 dark:border-slate-600 p-2 min-w-[160px]`}>
                              <div className="max-h-60 overflow-y-auto">
                                {filterOptions.destination.map((option) => (
                                  <div key={option} className="flex items-center px-2 py-1 hover:bg-gray-100 dark:hover:bg-slate-600 rounded-md">
                                    <label className="flex items-center w-full cursor-pointer">
                                      <input
                                        type="checkbox"
                                        className="mr-2 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:bg-slate-800 dark:border-slate-600"
                                        checked={activeFilters['destination']?.includes(option) || false}
                                        onChange={() => handleFilterChange('destination', option)}
                                      />
                                      <span className="text-sm">{option}</span>
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                  {displayData.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="table-cell text-center py-12 text-gray-500 dark:text-gray-400">
                        No data available
                      </td>
                    </tr>
                  ) : (
                    displayData.map((row) => (
                      <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 theme-transition">
                        <td className="table-cell">
                          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(row.status)}`}>
                            {row.status}
                          </div>
                        </td>
                        <td className="table-cell">{row.origin}</td>
                        <td className="table-cell">{row.destination}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white dark:bg-slate-800 shadow-sm mt-auto py-6 theme-transition text-center text-sm text-gray-500 dark:text-gray-400">
        Copyright © 2025 of Datavtar Private Limited. All rights reserved.
      </footer>
    </div>
  );
};

// Helper function to get status badge style
const getStatusStyle = (status: string): string => {
  const statusLower = status.toLowerCase();
  
  if (statusLower.includes('active') || statusLower.includes('success')) {
    return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
  }
  
  if (statusLower.includes('pending') || statusLower.includes('in progress')) {
    return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
  }
  
  if (statusLower.includes('fail') || statusLower.includes('error') || statusLower.includes('cancel')) {
    return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
  }
  
  if (statusLower.includes('complete')) {
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
  }
  
  return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
};

export default App;
