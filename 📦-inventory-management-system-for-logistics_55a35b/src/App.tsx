import React, { useState, useEffect, useMemo, useCallback, ChangeEvent, FormEvent } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { 
  Package, Warehouse, Tag, Plus, Edit, Trash2, Search, Filter, Sun, Moon, X, ArrowUpDown, 
  ChevronUp, ChevronDown, Download, Upload 
} from 'lucide-react';
import styles from './styles/styles.module.css';

// Define Types directly in the file
interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  category: string;
  location: string;
  lastUpdated: string; // ISO string format for dates
}

type SortKey = keyof InventoryItem;
type SortDirection = 'asc' | 'desc';

interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}

type InventoryFormInputs = Omit<InventoryItem, 'id' | 'lastUpdated'>;

// Utility function to generate unique IDs
const generateId = (): string => Date.now().toString(36) + Math.random().toString(36).substring(2);

// Main App Component
function App(): JSX.Element {
  // State Hooks
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      return savedMode === 'true' || (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterLocation, setFilterLocation] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Form Handling with react-hook-form
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors: formErrors },
  } = useForm<InventoryFormInputs>();

  // Load data from localStorage on initial render
  useEffect(() => {
    try {
      setIsLoading(true);
      const savedItems = localStorage.getItem('inventoryItems');
      if (savedItems) {
        setItems(JSON.parse(savedItems));
      } else {
        // Add some default data if nothing is saved
        setItems([
          { id: generateId(), name: 'Heavy Duty Wrench', sku: 'HDW-001', quantity: 50, category: 'Tools', location: 'Aisle 3', lastUpdated: new Date().toISOString() },
          { id: generateId(), name: 'Safety Gloves (Medium)', sku: 'SGM-015', quantity: 200, category: 'Safety Gear', location: 'Bin 21', lastUpdated: new Date().toISOString() },
          { id: generateId(), name: 'Copper Wiring (100m)', sku: 'CW-100', quantity: 25, category: 'Materials', location: 'Shelf B1', lastUpdated: new Date().toISOString() },
        ]);
      }
      setError(null);
    } catch (err) {
      console.error('Failed to load items from localStorage:', err);
      setError('Failed to load inventory data. Please try refreshing the page.');
      setItems([]); // Ensure items is an empty array on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save data to localStorage whenever items change
  useEffect(() => {
    // Don't save during initial load if items haven't been set yet
    if (!isLoading) {
      try {
        localStorage.setItem('inventoryItems', JSON.stringify(items));
        setError(null);
      } catch (err) {
        console.error('Failed to save items to localStorage:', err);
        setError('Failed to save inventory data. Changes might not persist.');
      }
    }
  }, [items, isLoading]);

  // Dark Mode Effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  // Modal Escape Key Handler
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeModal();
      }
    };
    if (isModalOpen) {
      window.addEventListener('keydown', handleEsc);
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isModalOpen]); // Dependency array ensures listener is added/removed correctly

  // Filtering and Sorting Logic
  const filteredAndSortedItems = useMemo(() => {
    let filtered = [...items];

    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(lowerSearchTerm) ||
          item.sku.toLowerCase().includes(lowerSearchTerm) ||
          item.category.toLowerCase().includes(lowerSearchTerm) ||
          item.location.toLowerCase().includes(lowerSearchTerm)
      );
    }

    if (filterCategory) {
      filtered = filtered.filter((item) => item.category === filterCategory);
    }

    if (filterLocation) {
      filtered = filtered.filter((item) => item.location === filterLocation);
    }

    if (sortConfig !== null) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        // Type-aware comparison
        let comparison = 0;
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          comparison = aValue - bValue;
        } else if (typeof aValue === 'string' && typeof bValue === 'string') {
          comparison = aValue.localeCompare(bValue);
        } else {
          // Fallback for mixed types or other types (treat as strings)
          comparison = String(aValue).localeCompare(String(bValue));
        }

        return sortConfig.direction === 'asc' ? comparison : -comparison;
      });
    }

    return filtered;
  }, [items, searchTerm, filterCategory, filterLocation, sortConfig]);

  // Handlers
  const handleSearchChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  }, []);

  const handleFilterCategoryChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
    setFilterCategory(event.target.value);
  }, []);

  const handleFilterLocationChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
    setFilterLocation(event.target.value);
  }, []);

  const requestSort = useCallback((key: SortKey) => {
    let direction: SortDirection = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  }, [sortConfig]);

  const openModal = useCallback((item: InventoryItem | null = null) => {
    if (item) {
      setEditingItem(item);
      // Pre-fill form with item data
      setValue('name', item.name);
      setValue('sku', item.sku);
      setValue('quantity', item.quantity);
      setValue('category', item.category);
      setValue('location', item.location);
    } else {
      setEditingItem(null);
      reset(); // Clear form for new item
    }
    setIsModalOpen(true);
    document.body.classList.add('modal-open');
  }, [reset, setValue]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingItem(null);
    reset();
    document.body.classList.remove('modal-open');
  }, [reset]);

  const onSubmit: SubmitHandler<InventoryFormInputs> = useCallback((data) => {
    const newItem: InventoryItem = {
      id: editingItem ? editingItem.id : generateId(),
      ...data,
      quantity: Number(data.quantity), // Ensure quantity is a number
      lastUpdated: new Date().toISOString(),
    };

    setItems((prevItems) =>
      editingItem
        ? prevItems.map((item) => (item.id === editingItem.id ? newItem : item))
        : [...prevItems, newItem]
    );
    closeModal();
  }, [editingItem, closeModal]);

  const deleteItem = useCallback((id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      setItems((prevItems) => prevItems.filter((item) => item.id !== id));
    }
  }, []);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode((prevMode) => !prevMode);
  }, []);

  // Derived data for filters and chart
  const categories = useMemo(() => [...new Set(items.map(item => item.category))], [items]);
  const locations = useMemo(() => [...new Set(items.map(item => item.location))], [items]);

  const chartData = useMemo(() => {
    const dataMap = new Map<string, number>();
    items.forEach(item => {
      dataMap.set(item.category, (dataMap.get(item.category) || 0) + item.quantity);
    });
    return Array.from(dataMap, ([name, quantity]) => ({ name, quantity }));
  }, [items]);

  // Render Helpers
  const getSortIcon = (key: SortKey) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUpDown className="w-3 h-3 ml-1 opacity-40" />;
    }
    return sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />;
  };

  // --- Render --- //
  return (
    <div className={`min-h-screen flex flex-col theme-transition-all ${isDarkMode ? 'dark' : ''}`}>
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm sticky top-0 z-[var(--z-sticky)] theme-transition-bg">
        <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 md:py-4">
            <h1 className="text-xl md:text-2xl font-bold text-primary-600 dark:text-primary-400 flex items-center gap-2">
              <Package className="w-6 h-6" />
              <span>Inventory Manager</span>
            </h1>
            <div className="flex items-center gap-3 md:gap-4">
              {/* Theme Toggle */}
              <div className="flex items-center">
                <Sun className="w-4 h-4 mr-2 text-yellow-500" />
                <button
                  onClick={toggleDarkMode}
                  className="theme-toggle" 
                  role="switch"
                  aria-checked={isDarkMode}
                  aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  <span className="theme-toggle-thumb"></span>
                </button>
                <Moon className="w-4 h-4 ml-2 text-slate-400" />
              </div>
              {/* Add Item Button */}
              <button
                onClick={() => openModal()}
                className="btn btn-primary btn-responsive flex items-center gap-1"
                aria-label="Add new inventory item"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Item</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container-wide mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {error && (
          <div className="alert alert-error mb-4" role="alert">
            <X className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Controls: Search & Filters */}
        <div className="mb-4 md:mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          {/* Search Input */}
          <div className="sm:col-span-2 lg:col-span-2">
            <label htmlFor="search" className="form-label">Search</label>
            <div className="relative">
              <input
                id="search"
                name="search"
                type="text"
                placeholder="Search by name, SKU, category..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="input input-responsive pl-10"
              />
              <Search className="w-5 h-5 text-gray-400 dark:text-slate-500 absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label htmlFor="filterCategory" className="form-label flex items-center gap-1">
              <Filter className="w-4 h-4" /> Category
            </label>
            <select
              id="filterCategory"
              name="filterCategory"
              value={filterCategory}
              onChange={handleFilterCategoryChange}
              className="input input-responsive"
            >
              <option value="">All Categories</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          {/* Location Filter */}
          <div>
            <label htmlFor="filterLocation" className="form-label flex items-center gap-1">
              <Warehouse className="w-4 h-4" /> Location
            </label>
            <select
              id="filterLocation"
              name="filterLocation"
              value={filterLocation}
              onChange={handleFilterLocationChange}
              className="input input-responsive"
            >
              <option value="">All Locations</option>
              {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
            </select>
          </div>
        </div>

        {/* Inventory Table */}
        {isLoading ? (
          <div className="space-y-3 mt-8">
            <div className="skeleton-text w-full h-10"></div>
            <div className="skeleton-text w-full h-8"></div>
            <div className="skeleton-text w-full h-8"></div>
            <div className="skeleton-text w-full h-8"></div>
          </div>
        ) : filteredAndSortedItems.length === 0 && !error ? (
          <div className="text-center py-10 text-gray-500 dark:text-slate-400">
            No inventory items found matching your criteria.
          </div>
        ) : (
          <div className="table-container theme-transition-all">
            <table className="table">
              <thead className="theme-transition-bg">
                <tr>
                  {/* Sortable Headers */}
                  {(["name", "sku", "quantity", "category", "location", "lastUpdated"] as SortKey[]).map((key) => (
                    <th key={key} className="table-header px-4 py-3 sm:px-6 sm:py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-600" onClick={() => requestSort(key)}>
                      <div className="flex items-center">
                        <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                        {getSortIcon(key)}
                      </div>
                    </th>
                  ))}
                  <th className="table-header px-4 py-3 sm:px-6 sm:py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700 theme-transition-all">
                {filteredAndSortedItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 theme-transition-bg">
                    <td className="table-cell px-4 py-3 sm:px-6 sm:py-4 font-medium text-gray-900 dark:text-white">{item.name}</td>
                    <td className="table-cell px-4 py-3 sm:px-6 sm:py-4"><Tag className="inline w-4 h-4 mr-1 text-gray-400" />{item.sku}</td>
                    <td className="table-cell px-4 py-3 sm:px-6 sm:py-4 text-center">{item.quantity}</td>
                    <td className="table-cell px-4 py-3 sm:px-6 sm:py-4">{item.category}</td>
                    <td className="table-cell px-4 py-3 sm:px-6 sm:py-4"><Warehouse className="inline w-4 h-4 mr-1 text-gray-400" />{item.location}</td>
                    <td className="table-cell px-4 py-3 sm:px-6 sm:py-4 text-xs text-gray-500 dark:text-slate-400">
                      {new Date(item.lastUpdated).toLocaleString()}
                    </td>
                    <td className="table-cell px-4 py-3 sm:px-6 sm:py-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => openModal(item)}
                        className="btn btn-sm bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800 p-1 rounded"
                        aria-label={`Edit item ${item.name}`}
                        title="Edit Item"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="btn btn-sm bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800 p-1 rounded"
                        aria-label={`Delete item ${item.name}`}
                        title="Delete Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Optional: Dashboard/Chart */}
        {!isLoading && items.length > 0 && (
           <div className="mt-8 md:mt-12 card card-responsive theme-transition-all">
              <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-slate-200">Inventory Summary by Category (Quantity)</h2>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <BarChart
                    data={chartData}
                    margin={{
                      top: 5, right: 30, left: 0, bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-slate-700" />
                    <XAxis dataKey="name" className="text-xs fill-gray-600 dark:fill-slate-400" />
                    <YAxis allowDecimals={false} className="text-xs fill-gray-600 dark:fill-slate-400"/>
                    <Tooltip 
                      cursor={{fill: 'rgba(200,200,200,0.1)'}}
                      contentStyle={{ 
                          backgroundColor: isDarkMode ? 'rgb(30 41 59)' : '#ffffff', 
                          borderColor: isDarkMode ? 'rgb(71 85 105)' : '#cccccc',
                          borderRadius: '0.375rem',
                          color: isDarkMode ? '#e2e8f0' : '#1f2937'
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '0.875rem', paddingTop: '10px' }}/>
                    <Bar dataKey="quantity" fill={isDarkMode ? "#60a5fa" : "#3b82f6"} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
           </div>
        )}
      </main>

      {/* Footer */} 
      <footer className="bg-gray-50 dark:bg-slate-900 py-4 text-center text-xs text-gray-500 dark:text-slate-400 theme-transition-all mt-auto">
        Copyright © {new Date().getFullYear()} Datavtar Private Limited. All rights reserved.
      </footer>

      {/* Modal for Add/Edit Item */} 
      {isModalOpen && (
        <div
          className="modal-backdrop fade-in"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div
            className={`modal-content theme-transition-all ${styles.modalSlideIn}`}
            onClick={(e) => e.stopPropagation()} // Prevent closing modal when clicking inside
          >
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="modal-header">
                <h3 id="modal-title" className="text-lg font-medium text-gray-900 dark:text-white">
                  {editingItem ? 'Edit Inventory Item' : 'Add New Inventory Item'}
                </h3>
                <button
                  type="button"
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 p-1 rounded-full"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Fields */} 
              <div className="mt-4 space-y-4">
                <div className="form-group">
                  <label htmlFor="name" className="form-label">Item Name</label>
                  <input
                    id="name"
                    {...register('name', { required: 'Item name is required' })}
                    className={`input ${formErrors.name ? 'border-red-500 dark:border-red-400' : ''}`}
                    aria-invalid={formErrors.name ? 'true' : 'false'}
                  />
                  {formErrors.name && <p className="form-error" role="alert">{formErrors.name.message}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label htmlFor="sku" className="form-label">SKU</label>
                    <input
                      id="sku"
                      {...register('sku', { required: 'SKU is required' })}
                      className={`input ${formErrors.sku ? 'border-red-500 dark:border-red-400' : ''}`}
                      aria-invalid={formErrors.sku ? 'true' : 'false'}
                    />
                    {formErrors.sku && <p className="form-error" role="alert">{formErrors.sku.message}</p>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="quantity" className="form-label">Quantity</label>
                    <input
                      id="quantity"
                      type="number"
                      {...register('quantity', { 
                        required: 'Quantity is required', 
                        valueAsNumber: true,
                        min: { value: 0, message: 'Quantity cannot be negative' } 
                      })}
                      className={`input ${formErrors.quantity ? 'border-red-500 dark:border-red-400' : ''}`}
                      aria-invalid={formErrors.quantity ? 'true' : 'false'}
                    />
                    {formErrors.quantity && <p className="form-error" role="alert">{formErrors.quantity.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label htmlFor="category" className="form-label">Category</label>
                    <input
                      id="category"
                      {...register('category', { required: 'Category is required' })}
                      className={`input ${formErrors.category ? 'border-red-500 dark:border-red-400' : ''}`}
                      aria-invalid={formErrors.category ? 'true' : 'false'}
                    />
                    {/* Improvement: Could be a datalist or select based on existing categories */} 
                    {formErrors.category && <p className="form-error" role="alert">{formErrors.category.message}</p>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="location" className="form-label">Location</label>
                    <input
                      id="location"
                      {...register('location', { required: 'Location is required' })}
                      className={`input ${formErrors.location ? 'border-red-500 dark:border-red-400' : ''}`}
                      aria-invalid={formErrors.location ? 'true' : 'false'}
                    />
                    {/* Improvement: Could be a datalist or select based on existing locations */} 
                    {formErrors.location && <p className="form-error" role="alert">{formErrors.location.message}</p>}
                  </div>
                </div>
              </div>

              {/* Modal Footer */} 
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingItem ? 'Save Changes' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
