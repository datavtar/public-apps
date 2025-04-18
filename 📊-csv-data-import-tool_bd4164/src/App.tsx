import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import Papa from 'papaparse';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Camera } from 'react-camera-pro';
import {
  Edit, Trash2, Plus, Search, Filter as FilterIcon, X, Moon, Sun, Upload, Download, Camera as CameraIcon, Video, VideoOff, CircleUserRound, Hash, ListChecks, Package, Save, SortAsc, SortDesc, AlertCircle, ChevronDown
} from 'lucide-react';
import styles from './styles/styles.module.css'; // Use sparingly

// 1. Type Definitions
interface Item {
  id: string;
  name: string;
  category: string;
  value: number;
  lastUpdated: number;
  imageDataUrl?: string | null;
}

type SortField = keyof Pick<Item, 'name' | 'category' | 'value' | 'lastUpdated'>;
type SortDirection = 'asc' | 'desc';

// Default initial data
const initialData: Item[] = [
  { id: '1', name: 'Laptop Pro', category: 'Electronics', value: 1200, lastUpdated: Date.now() - 100000 },
  { id: '2', name: 'Office Chair', category: 'Furniture', value: 150, lastUpdated: Date.now() - 200000 },
  { id: '3', name: 'Wireless Mouse', category: 'Electronics', value: 25, lastUpdated: Date.now() },
  { id: '4', name: 'Coffee Mug', category: 'Kitchenware', value: 15, lastUpdated: Date.now() - 50000 },
  { id: '5', name: 'Notebook', category: 'Stationery', value: 5, lastUpdated: Date.now() - 300000 },
];

// localStorage keys
const LOCAL_STORAGE_KEY = 'reactMinimalAppItems';
const THEME_STORAGE_KEY = 'reactMinimalAppTheme';

// Main App Component
const App: React.FC = () => {
  // 2. State Hooks
  const [items, setItems] = useState<Item[]>(() => {
    try {
      const savedItems = localStorage.getItem(LOCAL_STORAGE_KEY);
      return savedItems ? JSON.parse(savedItems) : initialData;
    } catch (error) {
      console.error("Error loading items from localStorage:", error);
      return initialData; // Fallback to initial data
    }
  });
  const [filteredItems, setFilteredItems] = useState<Item[]>(items);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('lastUpdated');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentItem, setCurrentItem] = useState<Item | null>(null); // For editing
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
     try {
        const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
        return savedTheme === 'dark' || (!savedTheme && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);
     } catch {
        return false;
     }
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState<boolean>(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const cameraRef = useRef<any>(null); // Use 'any' as react-camera-pro types might not be perfect

  // 3. Effects
  // Save items to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error("Error saving items to localStorage:", error);
      setError("Could not save items. Local storage might be full or disabled.");
    }
  }, [items]);

  // Apply dark mode class
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem(THEME_STORAGE_KEY, 'light');
    }
  }, [isDarkMode]);

  // Handle Esc key to close modal or camera view within modal
   useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showCamera) {
           setShowCamera(false); // Close camera view first if open inside modal
        } else if (isModalOpen) {
           closeModal(); // Close modal if camera isn't open
        }
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isModalOpen, showCamera]); // Dependencies ensure correct behavior

  // Filter and Sort Logic
  useEffect(() => {
    let result = items.filter(item =>
      (item.name?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) ||
      (item.category?.toLowerCase() ?? '').includes(searchTerm.toLowerCase())
    );

    if (categoryFilter !== 'all') {
      result = result.filter(item => item.category === categoryFilter);
    }

    result.sort((a, b) => {
      const valA = a[sortField] ?? (typeof a[sortField] === 'number' ? 0 : ''); // Provide default for comparison
      const valB = b[sortField] ?? (typeof b[sortField] === 'number' ? 0 : '');

      let comparison = 0;
      if (valA > valB) {
        comparison = 1;
      } else if (valA < valB) {
        comparison = -1;
      }

      return sortDirection === 'asc' ? comparison : comparison * -1;
    });

    setFilteredItems(result);
  }, [items, searchTerm, categoryFilter, sortField, sortDirection]);

  // 4. Handlers
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm((e.target as HTMLInputElement).value);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategoryFilter((e.target as HTMLSelectElement).value);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const openModal = (item: Item | null = null) => {
    setCurrentItem(item);
    // Reset form state *before* setting values
    reset();
    // Set captured image state based on item being edited, or clear it for new items
    setCapturedImage(item?.imageDataUrl ?? null);
    // Pre-fill form values *after* reset
    if (item) {
        setValue('name', item.name);
        setValue('category', item.category);
        setValue('value', item.value);
        setValue('imageDataUrl', item.imageDataUrl);
    } else {
        // Ensure defaults for a new item form (though reset does most of this)
        setValue('name', '');
        setValue('category', '');
        setValue('value', 0);
        setValue('imageDataUrl', null);
    }
    setIsModalOpen(true);
    document.body.classList.add('modal-open');
    // Ensure camera is initially closed when modal opens
    setShowCamera(false);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentItem(null);
    setCapturedImage(null); // Reset captured image on close
    setShowCamera(false); // Ensure camera is closed
    document.body.classList.remove('modal-open');
    reset(); // Reset react-hook-form state
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      setItems(prevItems => prevItems.filter(item => item.id !== id));
    }
  };

  // react-hook-form setup
  const { register, handleSubmit, reset, setValue, watch, formState: { errors: formErrors } } = useForm<Item>({
      defaultValues: {
          name: '',
          category: '',
          value: 0,
          imageDataUrl: null
      }
  });

  // Watch the imageDataUrl to update UI instantly if camera provides image
  const watchedImageDataUrl = watch('imageDataUrl');

  // Sync capturedImage state back to the form value
  useEffect(() => {
    setValue('imageDataUrl', capturedImage);
  }, [capturedImage, setValue]);

  const onSubmit: SubmitHandler<Item> = (data) => {
    // Ensure value is a number, default to 0 if somehow it's not
    const numericValue = typeof data.value === 'number' ? data.value : parseFloat(data.value as any) || 0;

    const itemToSave: Item = {
      ...data,
      id: currentItem?.id ?? Date.now().toString(), // Use existing ID or generate new one
      value: numericValue,
      lastUpdated: Date.now(), // Update timestamp
      // Use the latest image state (from capturedImage, which syncs to form)
      imageDataUrl: capturedImage,
    };

    try {
        if (currentItem) {
            // Update existing item
            setItems(prevItems => prevItems.map(item => item.id === currentItem.id ? itemToSave : item));
        } else {
            // Add new item
            setItems(prevItems => [...prevItems, itemToSave]);
        }
        closeModal();
    } catch (error) {
        console.error("Error saving item:", error);
        setError("Failed to save the item. Please try again.");
    }
  };

  // Theme Toggle Handler
  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  // CSV Import Handler
  const handleCsvImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setIsLoading(false); // Stop loading indicator regardless of outcome inside complete
        try {
          const requiredHeaders = ['name', 'category', 'value'];
          const headers = results.meta.fields;
          if (!headers || !requiredHeaders.every(h => headers.includes(h))) {
             throw new Error(`Invalid CSV format. Required headers: ${requiredHeaders.join(', ')}`);
          }

          const newItems: Item[] = results.data.map((row, index) => {
             const value = parseFloat(row.value);
             if (!row.name?.trim() || !row.category?.trim() || isNaN(value)) {
                 console.warn(`Skipping invalid CSV row ${index + 1}:`, row);
                 return null; // Skip rows with missing/invalid essential data
             }
            return {
              id: Date.now().toString() + index, // Simple unique ID generation
              name: row.name.trim(),
              category: row.category.trim(),
              value: value,
              lastUpdated: Date.now(),
              imageDataUrl: null, // Imported items don't have images initially
            };
          }).filter((item): item is Item => item !== null); // Filter out skipped rows

          if (newItems.length === 0 && results.data.length > 0) {
             throw new Error("No valid items found in CSV. Check headers and data format.");
          }
          if (newItems.length > 0) {
            // Append to existing data
            setItems(prevItems => [...prevItems, ...newItems]);
          }

        } catch (parseError: any) {
           console.error("Error processing CSV data:", parseError);
           setError(`Error processing CSV: ${parseError.message}`);
        } finally {
             // Reset file input to allow re-uploading the same file name
            if(event.target) {
               (event.target as HTMLInputElement).value = '';
            }
        }
      },
      error: (error: Error) => {
        console.error("Error parsing CSV file:", error);
        setError(`Error parsing CSV: ${error.message}`);
        setIsLoading(false);
         // Reset file input on parse error
        if(event.target) {
            (event.target as HTMLInputElement).value = '';
        }
      }
    });
  };

  // CSV Template Download
  const downloadCsvTemplate = () => {
    const headers = ['name', 'category', 'value'];
    const csvContent = headers.join(",") + "\n" + "Sample Item Name,Sample Category,123.45";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "items_template.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Camera Handlers
  const toggleCamera = () => {
     // Only toggle if modal is already open
     if (isModalOpen) {
        setShowCamera(prev => !prev);
        // If opening camera, reset any previously captured image for this modal session
        if (!showCamera) {
            setCapturedImage(currentItem?.imageDataUrl ?? null); // Keep existing if editing, else clear
        }
     }
  };

  const handleCapture = () => {
    if (cameraRef.current) {
      try {
          const photoDataUrl = cameraRef.current.takePhoto();
          if (photoDataUrl) {
            setCapturedImage(photoDataUrl);
            // Update form value immediately as well
            setValue('imageDataUrl', photoDataUrl);
            // Optionally close camera after capture, or let user decide
            setShowCamera(false);
          } else {
             console.error("Camera returned null or undefined data URL");
             setError("Failed to capture photo. Please try again.");
          }
      } catch (camError) {
          console.error("Error taking photo:", camError);
          setError("Could not take photo. Ensure camera permissions are granted.");
      }
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null); // Clear captured image state
    setValue('imageDataUrl', null); // Clear form value as well
    setShowCamera(true); // Re-open camera view immediately
  }

  const removeImage = () => {
    setCapturedImage(null);
    setValue('imageDataUrl', null);
    setShowCamera(false); // Close camera if it was open
  }

  // Chart Data Preparation
  const categoryData = items.reduce((acc, item) => {
    const category = item?.category?.trim() || 'Uncategorized';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.keys(categoryData).map(category => ({
    name: category,
    count: categoryData[category],
  }));

  // Get unique categories for filter dropdown, ensuring 'all' is first
   const uniqueCategories = ['all', ...Array.from(new Set(items.map(item => item.category).filter(Boolean)))];

  // Sort Icon Component - Memoized for performance
  const SortIcon = useCallback<React.FC<{ field: SortField }>>(({ field }) => {
    if (sortField !== field) return <SortAsc size={16} className="opacity-30 group-hover:opacity-70 transition-opacity" /> ;
    return sortDirection === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} /> ;
  }, [sortField, sortDirection]);

  // Helper function for badge colors (can be expanded)
  const getCategoryBadgeClass = (category: string | undefined): string => {
      if (!category) return 'badge-secondary'; // Default for undefined/empty
      const lowerCategory = category.toLowerCase();
      if (lowerCategory.includes('electronic')) return 'badge-info';
      if (lowerCategory.includes('furniture')) return 'badge-warning';
      if (lowerCategory.includes('kitchen')) return 'badge-success';
      if (lowerCategory.includes('stationery')) return 'badge-primary'; // Assuming primary is defined
      return 'badge-secondary'; // Default badge for others
  };

  // 5. Render JSX
  return (
    <div className={`min-h-screen flex flex-col theme-transition-all font-sans ${isDarkMode ? 'dark' : ''}`}>
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 shadow-md p-4 theme-transition-bg sticky top-0 z-[var(--z-sticky)] no-print">
        <div className="container-wide mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
             <Package size={24} className="text-primary-600 dark:text-primary-400" />
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Item Manager</h1>
          </div>
          <div className="flex items-center gap-4">
             {/* Theme Toggle */}
            <div className="flex items-center gap-2" title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}>
                <Sun size={16} className={`text-yellow-500 ${isDarkMode ? 'opacity-50' : ''}`}/>
                 <button
                    role="switch"
                    aria-checked={isDarkMode}
                    onClick={toggleTheme}
                    className="theme-toggle"
                    aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                    <span className="theme-toggle-thumb"></span>
                </button>
                <Moon size={16} className={`text-slate-400 ${!isDarkMode ? 'opacity-50' : ''}`}/>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container-wide mx-auto p-4 md:p-6 lg:p-8 theme-transition-bg">
        {/* Error Display */}
        {error && (
          <div className="alert alert-error mb-4 fade-in flex-between" role="alert">
             <div className="flex items-center gap-2">
                 <AlertCircle size={20} />
                 <span>{error}</span>
             </div>
            <button onClick={() => setError(null)} className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 p-1 rounded-full" aria-label="Dismiss error">
                <X size={18} />
            </button>
          </div>
        )}

        {/* Controls Section */}
        <div className="mb-6 flex flex-col md:flex-row gap-4 justify-between items-center no-print">
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto flex-grow md:flex-grow-0">
                 {/* Search Input */}
                <div className="relative flex-grow w-full sm:w-64">
                    <input
                    type="text"
                    placeholder="Search name or category..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="input input-responsive pl-10 w-full"
                    aria-label="Search items by name or category"
                    />
                    <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>

                {/* Category Filter */}
                <div className="relative flex-grow w-full sm:w-48">
                    <select
                        value={categoryFilter}
                        onChange={handleFilterChange}
                        className="input input-responsive pl-10 w-full appearance-none bg-white dark:bg-slate-800"
                        aria-label="Filter by category"
                    >
                        {uniqueCategories.map(cat => (
                            <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>
                        ))}
                    </select>
                     <FilterIcon size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                     <ChevronDown size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
            </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto justify-end">
                {/* Add Item Button */}
                <button onClick={() => openModal()} className="btn btn-primary btn-responsive flex items-center gap-2 w-full sm:w-auto justify-center" aria-label="Add new item">
                    <Plus size={18} /> Add Item
                </button>
                {/* CSV Controls */}
                 <div className="relative group w-full sm:w-auto">
                    <button className="btn btn-secondary btn-responsive flex items-center gap-2 w-full justify-center" disabled={isLoading} aria-label={isLoading ? "Importing CSV..." : "Import items from CSV file"}>
                        <Upload size={18} /> {isLoading ? 'Importing...' : 'Import CSV'}
                    </button>
                    {!isLoading && (
                        <input
                            type="file"
                            accept=".csv, text/csv"
                            onChange={handleCsvImport}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            aria-hidden="true" // Button has aria-label
                            tabIndex={-1} // Hide from tab order
                        />
                    )}
                 </div>
                <button onClick={downloadCsvTemplate} className="btn bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 btn-responsive flex items-center gap-2 w-full sm:w-auto justify-center" aria-label="Download CSV template file">
                    <Download size={18} /> Template
                </button>
          </div>
        </div>

        {/* Loading Indicator */}
        {isLoading && (
            <div className="flex-center my-4 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-md">
                <div className={styles.spinner}></div>
                <span className="ml-3 text-blue-700 dark:text-blue-300 font-medium">Processing CSV file...</span>
            </div>
        )}

        {/* Items Table */}
        <div className="table-container theme-transition-all">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-cell px-4 py-2 md:px-6 md:py-3 w-1/3 md:w-auto">
                   <button onClick={() => handleSort('name')} className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-slate-100 font-medium group" title="Sort by Name">
                       Name <SortIcon field="name" />
                   </button>
                </th>
                <th className="table-cell px-4 py-2 md:px-6 md:py-3 hidden md:table-cell w-1/4">
                    <button onClick={() => handleSort('category')} className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-slate-100 font-medium group" title="Sort by Category">
                        Category <SortIcon field="category" />
                    </button>
                </th>
                <th className="table-cell px-4 py-2 md:px-6 md:py-3 w-1/4">
                     <button onClick={() => handleSort('value')} className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-slate-100 font-medium group" title="Sort by Value">
                        Value <SortIcon field="value" />
                    </button>
                </th>
                <th className="table-cell px-4 py-2 md:px-6 md:py-3 hidden lg:table-cell w-1/4">
                     <button onClick={() => handleSort('lastUpdated')} className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-slate-100 font-medium group" title="Sort by Last Updated">
                        Last Updated <SortIcon field="lastUpdated" />
                    </button>
                </th>
                <th className="table-cell px-4 py-2 md:px-6 md:py-3 text-right w-auto">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700 theme-transition-all">
              {filteredItems.length > 0 ? (
                filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 theme-transition-bg fade-in">
                    <td className="table-cell px-4 py-2 md:px-6 md:py-4">
                      <div className="flex items-center gap-3">
                        {item.imageDataUrl ? (
                            <img src={item.imageDataUrl} alt={`${item.name} preview`} className="w-10 h-10 rounded-full object-cover shadow-sm flex-shrink-0"/>
                        ) : (
                           <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                               <Package size={18} className="text-gray-400 dark:text-gray-500" />
                           </div>
                        )}
                        <span className="font-medium text-gray-900 dark:text-white truncate" title={item.name}>{item.name}</span>
                      </div>
                    </td>
                    <td className="table-cell px-4 py-2 md:px-6 md:py-4 hidden md:table-cell">
                      <span className={`badge ${getCategoryBadgeClass(item.category)}`}>{item.category || 'N/A'}</span>
                    </td>
                    <td className="table-cell px-4 py-2 md:px-6 md:py-4 text-gray-700 dark:text-slate-300">
                        ${item.value?.toFixed(2) ?? '0.00'}
                    </td>
                     <td className="table-cell px-4 py-2 md:px-6 md:py-4 text-xs text-gray-500 dark:text-slate-400 hidden lg:table-cell">
                        {item.lastUpdated ? new Date(item.lastUpdated).toLocaleString() : 'N/A'}
                    </td>
                    <td className="table-cell px-4 py-2 md:px-6 md:py-4 text-right">
                      <div className="flex justify-end gap-2">
                          <button
                              onClick={() => openModal(item)}
                              className="btn btn-sm bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-800/60 p-1.5 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:focus:ring-offset-slate-800"
                              aria-label={`Edit ${item.name}`}
                              title="Edit Item"
                          >
                              <Edit size={16} />
                          </button>
                          <button
                              onClick={() => handleDelete(item.id)}
                              className="btn btn-sm bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-800/60 p-1.5 rounded focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 dark:focus:ring-offset-slate-800"
                              aria-label={`Delete ${item.name}`}
                              title="Delete Item"
                          >
                              <Trash2 size={16} />
                          </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="table-cell px-4 py-10 md:px-6 text-center text-gray-500 dark:text-slate-400">
                    {isLoading ? 'Loading...' : (searchTerm || categoryFilter !== 'all' ? 'No items match your filters.' : 'No items yet. Click \"Add Item\" to start.')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Chart Section */}
        {chartData.length > 0 && !isLoading && (
             <div className="mt-8 card card-responsive theme-transition-all">
                <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Items by Category</h2>
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                    <BarChart
                        data={chartData}
                        margin={{ top: 5, right: 20, left: -15, bottom: 5 }} // Adjusted margins
                    >
                        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-slate-700/50"/>
                        <XAxis dataKey="name" tick={{ fill: isDarkMode ? '#94a3b8' : '#4b5563', fontSize: 12 }} axisLine={{ stroke: isDarkMode ? '#334155' : '#e5e7eb' }} tickLine={{ stroke: isDarkMode ? '#334155' : '#e5e7eb' }} />
                        <YAxis allowDecimals={false} tick={{ fill: isDarkMode ? '#94a3b8' : '#4b5563', fontSize: 12 }} axisLine={{ stroke: isDarkMode ? '#334155' : '#e5e7eb' }} tickLine={{ stroke: isDarkMode ? '#334155' : '#e5e7eb' }} />
                        <Tooltip
                            cursor={{ fill: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' }}
                            contentStyle={{
                                backgroundColor: isDarkMode ? 'rgb(15 23 42 / 0.9)' : 'rgba(255, 255, 255, 0.95)',
                                borderColor: isDarkMode ? 'rgb(51 65 85)' : 'rgb(209 213 219)',
                                color: isDarkMode ? '#e2e8f0' : '#1f2937',
                                borderRadius: 'var(--radius-md)',
                                boxShadow: 'var(--shadow-md)',
                                padding: 'var(--spacing-sm) var(--spacing-md)',
                            }}
                            itemStyle={{ color: isDarkMode ? '#e2e8f0' : '#1f2937' }}
                         />
                        <Legend wrapperStyle={{ fontSize: '14px', paddingTop: '15px' }} />
                        <Bar dataKey="count" fill={isDarkMode ? 'var(--color-primary-500, #60a5fa)' : 'var(--color-primary-600, #3b82f6)'} name="Item Count" radius={[4, 4, 0, 0]} barSize={30} />
                    </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        )}

      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-gray-500 dark:text-slate-400 border-t border-gray-200 dark:border-slate-700 theme-transition mt-auto no-print">
        Copyright © {new Date().getFullYear()} Datavtar Private Limited. All rights reserved.
      </footer>

      {/* Modal for Add/Edit */}
      {isModalOpen && (
        <div
          className="modal-backdrop fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          onClick={closeModal} // Close on backdrop click
        >
          <div className="modal-content slide-in w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
             <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="modal-header">
                  <h3 id="modal-title" className="text-lg font-semibold text-gray-900 dark:text-white">
                    {currentItem ? 'Edit Item' : 'Add New Item'}
                  </h3>
                  <button
                     type="button"
                     onClick={closeModal}
                     className="text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-200 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
                     aria-label="Close modal"
                     title="Close (Esc)"
                  >
                      <X size={20} />
                  </button>
                </div>

                <div className="mt-4 space-y-4 max-h-[65vh] overflow-y-auto pr-2">
                     {/* Form Fields */}
                     <div className="form-group">
                        <label className="form-label" htmlFor="itemName">Name</label>
                        <input
                            id="itemName"
                            type="text"
                            className={`input ${formErrors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'dark:border-slate-600'}`}
                            {...register('name', { required: 'Item name is required' })}
                            aria-invalid={formErrors.name ? "true" : "false"}
                            aria-describedby={formErrors.name ? "name-error" : undefined}
                            autoFocus
                        />
                        {formErrors.name && <p id="name-error" className="form-error flex items-center gap-1"><AlertCircle size={14}/>{formErrors.name.message}</p>}
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="itemCategory">Category</label>
                        <input
                            id="itemCategory"
                            type="text"
                            className={`input ${formErrors.category ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'dark:border-slate-600'}`}
                            {...register('category', { required: 'Category is required' })}
                             aria-invalid={formErrors.category ? "true" : "false"}
                            aria-describedby={formErrors.category ? "category-error" : undefined}
                       />
                        {formErrors.category && <p id="category-error" className="form-error flex items-center gap-1"><AlertCircle size={14}/>{formErrors.category.message}</p>}
                    </div>
                     <div className="form-group">
                        <label className="form-label" htmlFor="itemValue">Value</label>
                        <input
                            id="itemValue"
                            type="number"
                            step="0.01" // Allow decimals
                            className={`input ${formErrors.value ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'dark:border-slate-600'}`}
                            {...register('value', { required: 'Value is required', valueAsNumber: true, min: { value: 0, message: 'Value cannot be negative'} })}
                             aria-invalid={formErrors.value ? "true" : "false"}
                            aria-describedby={formErrors.value ? "value-error" : undefined}
                       />
                        {formErrors.value && <p id="value-error" className="form-error flex items-center gap-1"><AlertCircle size={14}/>{formErrors.value.message}</p>}
                    </div>

                    {/* Camera Section */}
                    <div className="form-group border-t border-gray-200 dark:border-slate-700 pt-4">
                        <label className="form-label flex items-center gap-2">
                            <CameraIcon size={16} /> Attach Image (Optional)
                        </label>
                        <div className="mt-2 space-y-3">
                            {/* Display existing/captured image preview */}
                            {watchedImageDataUrl && !showCamera && (
                                <div className="relative w-24 h-24">
                                    <img src={watchedImageDataUrl} alt="Item preview" className="rounded-md w-full h-full object-cover shadow-sm border border-gray-300 dark:border-slate-600" />
                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        className="absolute -top-1.5 -right-1.5 btn btn-xs bg-red-500 text-white rounded-full p-0.5 shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 dark:focus:ring-offset-slate-800"
                                        aria-label="Remove image"
                                        title="Remove image"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            )}

                            {/* Show camera view if toggled */}
                            {showCamera && (
                                <div className="space-y-2 fade-in">
                                    <div className="relative aspect-video w-full rounded-md overflow-hidden border border-gray-300 dark:border-slate-600 bg-black">
                                        <Camera
                                           ref={cameraRef}
                                           aspectRatio="cover" // 'cover' might be better than fixed 16/9 for responsiveness
                                           errorMessages={{
                                                noCameraAccessible: 'No camera device accessible. Please connect one.',
                                                permissionDenied: 'Permission denied. Please grant camera access in browser settings.',
                                                switchCamera: 'It is not possible to switch camera to different one.',
                                                canvas: 'Canvas error.'
                                            }}
                                           videoReadyCallback={() => console.log('Camera ready')}
                                        />
                                        <button
                                            type="button"
                                            onClick={handleCapture}
                                            className="absolute bottom-3 left-1/2 transform -translate-x-1/2 btn btn-primary rounded-full p-3 shadow-lg border-2 border-white/50"
                                            aria-label="Take photo"
                                            title="Take photo"
                                        >
                                            <CameraIcon size={20} />
                                        </button>
                                         {/* Add button to close camera view without taking pic */}
                                        <button
                                            type="button"
                                            onClick={() => setShowCamera(false)}
                                            className="absolute top-2 right-2 btn btn-sm bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
                                            aria-label="Close camera view"
                                            title="Close camera view (Esc)"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Buttons to control camera */}
                            {!showCamera && (
                                <button
                                   type="button"
                                   onClick={toggleCamera}
                                   className="btn btn-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 flex items-center gap-1.5"
                                   aria-label={watchedImageDataUrl ? 'Change photo using camera' : 'Open camera to take photo'}
                                >
                                    {watchedImageDataUrl ? <Edit size={16}/> : <Video size={16}/>}
                                    {watchedImageDataUrl ? 'Change Photo' : 'Open Camera'}
                                </button>
                            )}
                             {showCamera && !watchedImageDataUrl && (
                                 <button
                                   type="button"
                                   onClick={retakePhoto} // Effectively just re-opens camera view if nothing was captured
                                   className="btn btn-sm bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300 flex items-center gap-1.5"
                                >
                                    <VideoOff size={16}/> Retake
                                </button>
                             )}
                        </div>
                    </div>
                </div>

                <div className="modal-footer border-t border-gray-200 dark:border-slate-700 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500 btn-responsive"
                    role="button"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-responsive flex items-center gap-2"
                    role="button"
                    aria-label={currentItem ? "Save changes" : "Add item"}
                  >
                    <Save size={18} /> {currentItem ? 'Save Changes' : 'Add Item'}
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
