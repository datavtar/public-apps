import React, { useState, useEffect, useMemo, useCallback, ChangeEvent, FormEvent, KeyboardEvent } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { format, parseISO } from 'date-fns';
import { gu } from 'date-fns/locale'; // Gujarati locale
import { 
  Sun, Moon, Plus, Edit, Trash2, Search, Filter, ArrowUp, ArrowDown, X, 
  Package, Leaf, DollarSign, Calendar, CloudSun, CloudRain, Snowflake, ListFilter, Check, 
  ArrowDownUp // Added missing icon import
} from 'lucide-react';

import styles from './styles/styles.module.css';

// --- Constants (Gujarati) ---
const GUJARATI_TEXT = {
  APP_TITLE: 'ફળ અને શાકભાજી વેચાણ ટ્રેકર',
  ADD_SALE: 'નવું વેચાણ ઉમેરો',
  EDIT_SALE: 'વેચાણ સંપાદિત કરો',
  DELETE_SALE: 'વેચાણ કાઢી નાખો',
  ITEM: 'વસ્તુ',
  FRUIT: 'ફળ',
  VEGETABLE: 'શાકભાજી',
  QUANTITY: 'જથ્થો',
  PRICE_PER_UNIT: 'એકમ દીઠ ભાવ (₹)',
  TOTAL_PRICE: 'કુલ ભાવ (₹)',
  DATE: 'તારીખ',
  SEASON: 'ઋતુ',
  SUMMER: 'ઉનાળો',
  MONSOON: 'ચોમાસું',
  WINTER: 'શિયાળો',
  SEARCH: 'શોધો',
  FILTER_BY_SEASON: 'ઋતુ પ્રમાણે ફિલ્ટર કરો',
  ALL_SEASONS: 'બધી ઋતુઓ',
  TOTAL_REVENUE: 'કુલ આવક',
  TOTAL_ITEMS_SOLD: 'કુલ વેચાયેલ વસ્તુઓ',
  SALES_SUMMARY: 'વેચાણ સારાંશ',
  NO_SALES: 'હજુ સુધી કોઈ વેચાણ નોંધાયેલ નથી.',
  SAVE: 'સાચવો',
  CANCEL: 'રદ કરો',
  CONFIRM_DELETE_TITLE: 'કાઢી નાખવાની પુષ્ટિ કરો',
  CONFIRM_DELETE_MSG: 'શું તમે ખરેખર આ વેચાણ રેકોર્ડ કાઢી નાખવા માંગો છો?',
  DELETE: 'કાઢી નાખો',
  ERROR: 'ભૂલ',
  LOADING: 'લોડ કરી રહ્યું છે...',
  LIGHT: 'પ્રકાશ',
  DARK: 'શ્યામ',
  NAME: 'નામ',
  TYPE: 'પ્રકાર',
  PRICE: 'ભાવ',
  ACTIONS: 'ક્રિયાઓ',
  SORT_BY: 'દ્વારા સૉર્ટ કરો',
  COPYRIGHT: 'કૉપિરાઇટ © 2025 ડેટાવતાર પ્રાઇવેટ લિમિટેડ. સર્વાધિકાર સુરક્ષિત.',
  INVALID_NUMBER: 'કૃપા કરીને માન્ય નંબર દાખલ કરો.',
  REQUIRED_FIELD: 'આ ક્ષેત્ર જરૂરી છે.',
  SALES_PER_SEASON: 'ઋતુ પ્રમાણે વેચાણ',
  ITEM_TYPE_DISTRIBUTION: 'વસ્તુ પ્રકાર વિતરણ',
};

// --- Types and Interfaces ---
type ItemType = typeof GUJARATI_TEXT.FRUIT | typeof GUJARATI_TEXT.VEGETABLE;
type Season = typeof GUJARATI_TEXT.SUMMER | typeof GUJARATI_TEXT.MONSOON | typeof GUJARATI_TEXT.WINTER;

interface SaleItem {
  id: string;
  name: string;
  type: ItemType;
  quantity: number;
  pricePerUnit: number;
  date: string; // ISO string format
  season: Season;
}

interface SortConfig {
  key: keyof SaleItem | null;
  direction: 'ascending' | 'descending';
}

type ModalState = { type: 'add' } | { type: 'edit'; sale: SaleItem } | null;

const SEASONS: Season[] = [GUJARATI_TEXT.SUMMER, GUJARATI_TEXT.MONSOON, GUJARATI_TEXT.WINTER];
const ITEM_TYPES: ItemType[] = [GUJARATI_TEXT.FRUIT, GUJARATI_TEXT.VEGETABLE];

// --- Helper Functions ---
const generateId = (): string => `_${Math.random().toString(36).substring(2, 9)}`;

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('gu-IN', { style: 'currency', currency: 'INR' }).format(amount);
};

const formatDate = (dateString: string): string => {
  try {
    return format(parseISO(dateString), 'PP', { locale: gu });
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString; // Fallback to original string
  }
};

const getCurrentDateISO = (): string => format(new Date(), 'yyyy-MM-dd');

// --- Main App Component ---
const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('fruitVendorDarkMode');
      return savedMode === 'true' || (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  const [sales, setSales] = useState<SaleItem[]>(() => {
    const savedSales = localStorage.getItem('fruitVendorSales');
    return savedSales ? JSON.parse(savedSales) : [];
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [modalState, setModalState] = useState<ModalState>(null);
  const [saleToDelete, setSaleToDelete] = useState<SaleItem | null>(null);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [seasonFilter, setSeasonFilter] = useState<Season | 'all'>('all');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'date', direction: 'descending' });

  // --- Effects ---
  useEffect(() => {
    // Theme persistence
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('fruitVendorDarkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('fruitVendorDarkMode', 'false');
    }
  }, [isDarkMode]);

  useEffect(() => {
    // Load data and simulate initial loading
    try {
      const savedSales = localStorage.getItem('fruitVendorSales');
      if (savedSales) {
        setSales(JSON.parse(savedSales));
      } else {
        // Add some initial sample data if storage is empty
        const initialSales: SaleItem[] = [
          { id: generateId(), name: 'કેરી', type: GUJARATI_TEXT.FRUIT, quantity: 5, pricePerUnit: 100, date: '2024-05-15', season: GUJARATI_TEXT.SUMMER },
          { id: generateId(), name: 'બટાટા', type: GUJARATI_TEXT.VEGETABLE, quantity: 10, pricePerUnit: 30, date: '2024-07-20', season: GUJARATI_TEXT.MONSOON },
          { id: generateId(), name: 'નારંગી', type: GUJARATI_TEXT.FRUIT, quantity: 8, pricePerUnit: 60, date: '2024-12-01', season: GUJARATI_TEXT.WINTER },
        ];
        setSales(initialSales);
        localStorage.setItem('fruitVendorSales', JSON.stringify(initialSales));
      }
    } catch (err) {
      console.error('Failed to load or parse sales data:', err);
      setError('ડેટા લોડ કરવામાં નિષ્ફળ.');
      localStorage.removeItem('fruitVendorSales'); // Clear corrupted data
    } finally {
      setLoading(false);
    }
  }, []); // Load only once on mount

  useEffect(() => {
    // Save sales data to local storage whenever it changes
    if (!loading) { // Avoid saving during initial load potentially wiping data
      try {
        localStorage.setItem('fruitVendorSales', JSON.stringify(sales));
      } catch (err) {
        console.error('Failed to save sales data:', err);
        setError('ડેટા સાચવવામાં નિષ્ફળ.');
      }
    }
  }, [sales, loading]);

  useEffect(() => {
    // Handle Esc key for modals
    const handleEsc = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeModal();
        closeDeleteConfirmModal();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  // --- Data Handling Logic ---
  const filteredAndSortedSales = useMemo(() => {
    let filtered = [...sales];

    // Filtering
    if (seasonFilter !== 'all') {
      filtered = filtered.filter(sale => sale.season === seasonFilter);
    }
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(sale =>
        sale.name.toLowerCase().includes(lowerSearchTerm) ||
        sale.type.toLowerCase().includes(lowerSearchTerm) ||
        formatDate(sale.date).toLowerCase().includes(lowerSearchTerm)
      );
    }

    // Sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key!];
        const bValue = b[sortConfig.key!];

        let comparison = 0;
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          comparison = aValue - bValue;
        } else if (typeof aValue === 'string' && typeof bValue === 'string') {
          // Date sorting needs specific handling
          if (sortConfig.key === 'date') {
            comparison = new Date(aValue).getTime() - new Date(bValue).getTime();
          } else {
            comparison = aValue.localeCompare(bValue, 'gu'); // Locale compare for Gujarati
          }
        }

        return sortConfig.direction === 'ascending' ? comparison : -comparison;
      });
    }

    return filtered;
  }, [sales, searchTerm, seasonFilter, sortConfig]);

  const requestSort = (key: keyof SaleItem) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: keyof SaleItem) => {
    if (sortConfig.key !== key) {
      return <ArrowDownUp size={14} className="opacity-30" />;
    }
    return sortConfig.direction === 'ascending' ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
  };

  // --- CRUD Functions ---
  const handleAddSale = (newSaleData: Omit<SaleItem, 'id'>) => {
    const newSale: SaleItem = { ...newSaleData, id: generateId() };
    setSales(prevSales => [...prevSales, newSale]);
    closeModal();
  };

  const handleUpdateSale = (updatedSale: SaleItem) => {
    setSales(prevSales => prevSales.map(sale => (sale.id === updatedSale.id ? updatedSale : sale)));
    closeModal();
  };

  const handleDeleteSale = (id: string) => {
    setSales(prevSales => prevSales.filter(sale => sale.id !== id));
    closeDeleteConfirmModal();
  };

  // --- Modal Handling ---
  const openModal = (state: ModalState) => setModalState(state);
  const closeModal = () => setModalState(null);

  const openDeleteConfirmModal = (sale: SaleItem) => setSaleToDelete(sale);
  const closeDeleteConfirmModal = () => setSaleToDelete(null);

  // --- Chart Data Preparation ---
  const salesBySeason = useMemo(() => {
    const data = SEASONS.map(season => ({
      name: season,
      [GUJARATI_TEXT.TOTAL_REVENUE]: 0,
    }));

    sales.forEach(sale => {
      const seasonIndex = data.findIndex(d => d.name === sale.season);
      if (seasonIndex !== -1) {
        data[seasonIndex][GUJARATI_TEXT.TOTAL_REVENUE] += sale.quantity * sale.pricePerUnit;
      }
    });
    return data.filter(d => d[GUJARATI_TEXT.TOTAL_REVENUE] > 0); // Only show seasons with sales
  }, [sales]);

  const itemTypeDistribution = useMemo(() => {
    const dataMap = new Map<ItemType, number>();
    ITEM_TYPES.forEach(type => dataMap.set(type, 0));

    sales.forEach(sale => {
      dataMap.set(sale.type, (dataMap.get(sale.type) || 0) + sale.quantity);
    });

    return Array.from(dataMap.entries())
      .map(([name, value]) => ({ name, value }))
      .filter(d => d.value > 0); // Only show types with sales

  }, [sales]);

  const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  // --- Stats Calculation ---
  const totalRevenue = useMemo(() => sales.reduce((sum, sale) => sum + sale.quantity * sale.pricePerUnit, 0), [sales]);
  const totalItemsSold = useMemo(() => sales.reduce((sum, sale) => sum + sale.quantity, 0), [sales]);

  // --- UI Rendering ---
  if (loading) {
    return <div className="flex-center h-screen text-lg">{GUJARATI_TEXT.LOADING}</div>;
  }

  if (error) {
    return <div className="flex-center h-screen text-red-500 text-lg">{GUJARATI_TEXT.ERROR}: {error}</div>;
  }

  return (
    <div className={`min-h-screen flex flex-col theme-transition-all ${isDarkMode ? 'dark' : ''}`}>
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-md sticky top-0 z-[var(--z-sticky)] theme-transition-bg">
        <div className="container-wide flex-between py-3 px-4">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-primary-600 dark:text-primary-400 flex items-center gap-2">
            <Package size={28} /> {GUJARATI_TEXT.APP_TITLE}
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => openModal({ type: 'add' })}
              className="btn btn-primary btn-responsive flex items-center gap-1"
              aria-label={GUJARATI_TEXT.ADD_SALE}
              name="add-sale"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">{GUJARATI_TEXT.ADD_SALE}</span>
            </button>
            {/* Theme Toggle */}
            <div className="flex items-center">
              <Sun size={18} className={`mr-2 ${!isDarkMode ? 'text-yellow-500' : 'text-gray-400'}`} />
              <button
                className="theme-toggle"
                onClick={() => setIsDarkMode(!isDarkMode)}
                aria-label={isDarkMode ? GUJARATI_TEXT.LIGHT : GUJARATI_TEXT.DARK}
                name="theme-toggle"
              >
                <span className="theme-toggle-thumb"></span>
                <span className="sr-only">{isDarkMode ? GUJARATI_TEXT.LIGHT : GUJARATI_TEXT.DARK}</span>
              </button>
              <Moon size={18} className={`ml-2 ${isDarkMode ? 'text-blue-400' : 'text-gray-400'}`} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container-wide py-6 px-4">
        {/* Stats Section */}
        <section className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="stat-card theme-transition-all">
            <div className="stat-title flex items-center gap-1"><DollarSign size={16} />{GUJARATI_TEXT.TOTAL_REVENUE}</div>
            <div className="stat-value">{formatCurrency(totalRevenue)}</div>
          </div>
          <div className="stat-card theme-transition-all">
            <div className="stat-title flex items-center gap-1"><Package size={16} />{GUJARATI_TEXT.TOTAL_ITEMS_SOLD}</div>
            <div className="stat-value">{totalItemsSold.toLocaleString('gu-IN')}</div>
          </div>
        </section>

        {/* Charts Section */}
        {sales.length > 0 && (
          <section className="mb-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
             <div className="card card-responsive theme-transition-all">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <BarChart size={20} /> {GUJARATI_TEXT.SALES_PER_SEASON}
                </h3>
                <div className={styles.chartContainer}> {/* Apply fixed height */} 
                   <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={salesBySeason} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-slate-700" />
                      <XAxis dataKey="name" tick={{ fill: isDarkMode ? '#e2e8f0' : '#1f2937', fontSize: 12 }} />
                      <YAxis tickFormatter={(value) => `₹${value / 1000}k`} tick={{ fill: isDarkMode ? '#e2e8f0' : '#1f2937', fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: isDarkMode ? '#1e293b' : '#ffffff', border: 'none', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)' }}
                        labelStyle={{ color: isDarkMode ? '#e2e8f0' : '#1f2937', fontWeight: 'bold' }}
                        itemStyle={{ color: isDarkMode ? '#e2e8f0' : '#1f2937' }}
                        formatter={(value: number) => formatCurrency(value)}
                      />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                      <Bar dataKey={GUJARATI_TEXT.TOTAL_REVENUE} fill="var(--color-primary, #4f46e5)" name={GUJARATI_TEXT.TOTAL_REVENUE} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
            </div>
            <div className="card card-responsive theme-transition-all">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <RechartsPieChart size={20} /> {GUJARATI_TEXT.ITEM_TYPE_DISTRIBUTION}
                </h3>
                 <div className={styles.chartContainer}> {/* Apply fixed height */} 
                   <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={itemTypeDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                          const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                          const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
                          const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
                          return (
                            <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={12}>
                              {`${itemTypeDistribution[index].name} (${(percent * 100).toFixed(0)}%)`}
                            </text>
                          );
                        }}
                      >
                        {itemTypeDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                         contentStyle={{ backgroundColor: isDarkMode ? '#1e293b' : '#ffffff', border: 'none', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)' }}
                         labelStyle={{ color: isDarkMode ? '#e2e8f0' : '#1f2937', fontWeight: 'bold' }}
                         itemStyle={{ color: isDarkMode ? '#e2e8f0' : '#1f2937' }}
                         formatter={(value: number, name: string) => [`${value.toLocaleString('gu-IN')} ${GUJARATI_TEXT.QUANTITY}`, name]}
                      />
                       <Legend wrapperStyle={{ fontSize: '12px' }} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                 </div>
            </div>
          </section>
        )}

        {/* Sales Table Section */}
        <section className="card card-responsive theme-transition-all">
          {/* Filters and Search */}
          <div className="mb-4 flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-grow w-full sm:w-auto">
              <input
                type="text"
                placeholder={`${GUJARATI_TEXT.SEARCH} (${GUJARATI_TEXT.NAME}, ${GUJARATI_TEXT.TYPE}, ${GUJARATI_TEXT.DATE})`} // Clarify search fields
                className="input input-responsive pl-10 w-full"
                value={searchTerm}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                aria-label={GUJARATI_TEXT.SEARCH}
                name="search-sales"
              />
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-500" />
            </div>
            <div className="relative w-full sm:w-auto">
              <select
                className="input input-responsive appearance-none pr-8 w-full"
                value={seasonFilter}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setSeasonFilter(e.target.value as Season | 'all')}
                aria-label={GUJARATI_TEXT.FILTER_BY_SEASON}
                name="filter-season"
              >
                <option value="all">{GUJARATI_TEXT.ALL_SEASONS}</option>
                {SEASONS.map(season => (
                  <option key={season} value={season}>{season}</option>
                ))}
              </select>
              <ListFilter size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-500 pointer-events-none" />
            </div>
          </div>

          {/* Sales Table */}
          <div className="table-container theme-transition-all">
            <table className="table">
              <thead>
                <tr>
                  <th className="table-header cursor-pointer" onClick={() => requestSort('name')}>
                    <div className="flex items-center gap-1">{GUJARATI_TEXT.NAME} {getSortIcon('name')}</div>
                  </th>
                  <th className="table-header responsive-hide cursor-pointer" onClick={() => requestSort('type')}>
                     <div className="flex items-center gap-1">{GUJARATI_TEXT.TYPE} {getSortIcon('type')}</div>
                  </th>
                  <th className="table-header cursor-pointer" onClick={() => requestSort('quantity')}>
                    <div className="flex items-center gap-1">{GUJARATI_TEXT.QUANTITY} {getSortIcon('quantity')}</div>
                  </th>
                  <th className="table-header responsive-hide cursor-pointer" onClick={() => requestSort('pricePerUnit')}>
                     <div className="flex items-center gap-1">{GUJARATI_TEXT.PRICE_PER_UNIT} {getSortIcon('pricePerUnit')}</div>
                  </th>
                   <th className="table-header">
                     <div className="flex items-center gap-1">{GUJARATI_TEXT.TOTAL_PRICE}</div>
                  </th>
                  <th className="table-header cursor-pointer" onClick={() => requestSort('date')}>
                    <div className="flex items-center gap-1">{GUJARATI_TEXT.DATE} {getSortIcon('date')}</div>
                  </th>
                  <th className="table-header responsive-hide cursor-pointer" onClick={() => requestSort('season')}>
                     <div className="flex items-center gap-1">{GUJARATI_TEXT.SEASON} {getSortIcon('season')}</div>
                  </th>
                  <th className="table-header">{GUJARATI_TEXT.ACTIONS}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-900 dark:divide-slate-700 theme-transition-all">
                {filteredAndSortedSales.length > 0 ? (
                  filteredAndSortedSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-gray-50 dark:hover:bg-slate-800 theme-transition-bg">
                      <td className="table-cell font-medium text-gray-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          {sale.type === GUJARATI_TEXT.FRUIT ? <Leaf size={16} className="text-green-500" /> : <Package size={16} className="text-orange-500" />}
                          {sale.name}
                        </div>
                         <div className="sm:hidden text-xs text-gray-500 dark:text-slate-400">{sale.type}</div> {/* Show type on mobile */} 
                      </td>
                      <td className="table-cell responsive-hide">{sale.type}</td>
                      <td className="table-cell">{sale.quantity.toLocaleString('gu-IN')}</td>
                      <td className="table-cell responsive-hide">{formatCurrency(sale.pricePerUnit)}</td>
                      <td className="table-cell font-medium">{formatCurrency(sale.quantity * sale.pricePerUnit)}</td>
                      <td className="table-cell">
                        {formatDate(sale.date)}
                         <div className="sm:hidden text-xs text-gray-500 dark:text-slate-400">{sale.season}</div> {/* Show season on mobile */} 
                      </td>
                      <td className="table-cell responsive-hide">
                        <span className={`badge ${sale.season === GUJARATI_TEXT.SUMMER ? 'badge-warning' : sale.season === GUJARATI_TEXT.MONSOON ? 'badge-info' : 'badge-success'}`}>
                          {sale.season === GUJARATI_TEXT.SUMMER && <CloudSun size={14} className="mr-1" />}
                          {sale.season === GUJARATI_TEXT.MONSOON && <CloudRain size={14} className="mr-1" />}
                          {sale.season === GUJARATI_TEXT.WINTER && <Snowflake size={14} className="mr-1" />}
                          {sale.season}
                        </span>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openModal({ type: 'edit', sale })}
                            className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
                            aria-label={`${GUJARATI_TEXT.EDIT_SALE} ${sale.name}`}
                            name={`edit-${sale.id}`}
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => openDeleteConfirmModal(sale)}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            aria-label={`${GUJARATI_TEXT.DELETE_SALE} ${sale.name}`}
                            name={`delete-${sale.id}`}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="table-cell text-center text-gray-500 dark:text-slate-400 py-6">
                      {GUJARATI_TEXT.NO_SALES}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Footer */} 
      <footer className="bg-gray-100 dark:bg-slate-900 text-center py-4 text-sm text-gray-600 dark:text-slate-400 theme-transition-all">
          {GUJARATI_TEXT.COPYRIGHT}
      </footer>

      {/* Add/Edit Modal */} 
      {modalState && (
          <SaleFormModal 
              modalState={modalState}
              onClose={closeModal}
              onSave={modalState.type === 'add' ? handleAddSale : handleUpdateSale}
          />
      )}

      {/* Delete Confirmation Modal */} 
      {saleToDelete && (
          <DeleteConfirmationModal
              saleName={saleToDelete.name}
              onClose={closeDeleteConfirmModal}
              onConfirm={() => handleDeleteSale(saleToDelete.id)}
          />
      )}

    </div>
  );
};

// --- Modal Components (kept within App.tsx) ---

interface SaleFormModalProps {
  modalState: ModalState;
  onClose: () => void;
  onSave: (data: SaleItem | Omit<SaleItem, 'id'>) => void;
}

const SaleFormModal: React.FC<SaleFormModalProps> = ({ modalState, onClose, onSave }) => {
  const isEditMode = modalState?.type === 'edit';
  const initialData = isEditMode ? modalState.sale : null;

  const [formData, setFormData] = useState<Omit<SaleItem, 'id'>>({
    name: initialData?.name ?? '',
    type: initialData?.type ?? GUJARATI_TEXT.FRUIT,
    quantity: initialData?.quantity ?? 1,
    pricePerUnit: initialData?.pricePerUnit ?? 0,
    date: initialData?.date ?? getCurrentDateISO(),
    season: initialData?.season ?? GUJARATI_TEXT.SUMMER,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = GUJARATI_TEXT.REQUIRED_FIELD;
    if (formData.quantity <= 0 || isNaN(formData.quantity)) newErrors.quantity = GUJARATI_TEXT.INVALID_NUMBER;
    if (formData.pricePerUnit < 0 || isNaN(formData.pricePerUnit)) newErrors.pricePerUnit = GUJARATI_TEXT.INVALID_NUMBER;
    if (!formData.date) newErrors.date = GUJARATI_TEXT.REQUIRED_FIELD;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isNumericField = name === 'quantity' || name === 'pricePerUnit';
    
    setFormData(prev => ({
      ...prev,
      [name]: isNumericField ? parseFloat(value) || 0 : value,
    }));

    // Clear error on change
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (validate()) {
      if (isEditMode && initialData) {
        onSave({ ...formData, id: initialData.id });
      } else {
        onSave(formData);
      }
    }
  };

  useEffect(() => {
    // Focus the first input element when the modal opens
    const firstInput = document.getElementById('sale-name-input');
    firstInput?.focus();
  }, []);

  return (
    <div
      className="modal-backdrop theme-transition-all"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="sale-modal-title"
    >
      <div
        className="modal-content theme-transition-all w-full max-w-lg" // Wider modal for form
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <form onSubmit={handleSubmit}>
          <div className="modal-header">
            <h3 id="sale-modal-title" className="text-lg font-semibold flex items-center gap-2">
              {isEditMode ? <Edit size={20} /> : <Plus size={20} />}
              {isEditMode ? GUJARATI_TEXT.EDIT_SALE : GUJARATI_TEXT.ADD_SALE}
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-200"
              aria-label={GUJARATI_TEXT.CANCEL}
            >
              <X size={24} />
            </button>
          </div>

          <div className="mt-4 space-y-4">
            {/* Name */} 
            <div className="form-group">
              <label htmlFor="sale-name-input" className="form-label">{GUJARATI_TEXT.NAME}</label>
              <input
                id="sale-name-input"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className={`input input-responsive ${errors.name ? 'border-red-500' : ''}`}
                required
                aria-describedby={errors.name ? 'name-error' : undefined}
              />
              {errors.name && <p id="name-error" className="form-error">{errors.name}</p>}
            </div>

            {/* Type */} 
            <div className="form-group">
              <label htmlFor="sale-type-select" className="form-label">{GUJARATI_TEXT.TYPE}</label>
              <select
                id="sale-type-select"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="input input-responsive"
              >
                {ITEM_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>

            {/* Quantity and Price */} 
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-group">
                <label htmlFor="sale-quantity-input" className="form-label">{GUJARATI_TEXT.QUANTITY}</label>
                <input
                  id="sale-quantity-input"
                  name="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={handleChange}
                  min="1"
                  step="any" // Allow decimals if needed, or set to 1
                  className={`input input-responsive ${errors.quantity ? 'border-red-500' : ''}`}
                  required
                  aria-describedby={errors.quantity ? 'quantity-error' : undefined}
                />
                {errors.quantity && <p id="quantity-error" className="form-error">{errors.quantity}</p>}
              </div>
              <div className="form-group">
                <label htmlFor="sale-price-input" className="form-label">{GUJARATI_TEXT.PRICE_PER_UNIT}</label>
                <input
                  id="sale-price-input"
                  name="pricePerUnit"
                  type="number"
                  value={formData.pricePerUnit}
                  onChange={handleChange}
                  min="0"
                  step="any"
                  className={`input input-responsive ${errors.pricePerUnit ? 'border-red-500' : ''}`}
                  required
                  aria-describedby={errors.pricePerUnit ? 'price-error' : undefined}
                />
                {errors.pricePerUnit && <p id="price-error" className="form-error">{errors.pricePerUnit}</p>}
              </div>
            </div>

            {/* Date and Season */} 
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div className="form-group">
                  <label htmlFor="sale-date-input" className="form-label">{GUJARATI_TEXT.DATE}</label>
                  <input
                    id="sale-date-input"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleChange}
                    className={`input input-responsive ${errors.date ? 'border-red-500' : ''}`}
                    required
                    aria-describedby={errors.date ? 'date-error' : undefined}
                  />
                   {errors.date && <p id="date-error" className="form-error">{errors.date}</p>}
                </div>
                 <div className="form-group">
                  <label htmlFor="sale-season-select" className="form-label">{GUJARATI_TEXT.SEASON}</label>
                  <select
                    id="sale-season-select"
                    name="season"
                    value={formData.season}
                    onChange={handleChange}
                    className="input input-responsive"
                  >
                    {SEASONS.map(season => <option key={season} value={season}>{season}</option>)}
                  </select>
                </div>
            </div>

          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="btn bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500 btn-responsive"
              name="cancel-modal"
            >
              {GUJARATI_TEXT.CANCEL}
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-responsive flex items-center gap-1"
              name="save-modal"
            >
              <Check size={18} />
              {GUJARATI_TEXT.SAVE}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface DeleteConfirmationModalProps {
  saleName: string;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ saleName, onClose, onConfirm }) => {

   useEffect(() => {
        // Focus the confirm button when the modal opens
        const confirmButton = document.getElementById('confirm-delete-button');
        confirmButton?.focus();
    }, []);
    
  return (
    <div
      className="modal-backdrop theme-transition-all"
      onClick={onClose}
      role="alertdialog" // More specific role for confirmation
      aria-modal="true"
      aria-labelledby="delete-confirm-title"
      aria-describedby="delete-confirm-desc"
    >
      <div
        className="modal-content theme-transition-all max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3 id="delete-confirm-title" className="text-lg font-semibold flex items-center gap-2">
            <Trash2 size={20} className="text-red-500" /> {GUJARATI_TEXT.CONFIRM_DELETE_TITLE}
          </h3>
           <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-200"
              aria-label={GUJARATI_TEXT.CANCEL}
            >
              <X size={24} />
            </button>
        </div>
        <p id="delete-confirm-desc" className="mt-2 text-gray-600 dark:text-slate-300">
          {GUJARATI_TEXT.CONFIRM_DELETE_MSG.replace('આ વેચાણ રેકોર્ડ', `"${saleName}"`)} 
        </p>
        <div className="modal-footer">
          <button
            type="button"
            onClick={onClose}
            className="btn bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500 btn-responsive"
            name="cancel-delete"
          >
            {GUJARATI_TEXT.CANCEL}
          </button>
          <button
            id="confirm-delete-button"
            type="button"
            onClick={onConfirm}
            className="btn bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 btn-responsive flex items-center gap-1"
            name="confirm-delete"
          >
            <Trash2 size={18} /> {GUJARATI_TEXT.DELETE}
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
