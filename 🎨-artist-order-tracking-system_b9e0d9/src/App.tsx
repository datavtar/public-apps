import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import {
  Plus,
  Trash2,
  Edit,
  Search,
  Sun,
  Moon,
  Filter,
  ArrowUpDown,
  CheckCircle,
  XCircle,
  Download,
  Upload,
  Info,
  ShoppingCart
} from 'lucide-react';
import styles from './styles/styles.module.css';

type OrderStatus = 'new' | 'in_progress' | 'completed' | 'cancelled';
type PaymentStatus = 'paid' | 'unpaid' | 'partial';
type ArtworkType = 'painting' | 'sculpture' | 'digital' | 'mixed_media' | 'other';

interface ArtOrder {
  id: string;
  clientName: string;
  email: string;
  phone: string;
  description: string;
  price: number;
  deposit?: number;
  artworkType: ArtworkType;
  createdAt: string;
  deadline?: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  notes?: string;
  materials?: string[];
  dimensions?: {
    width?: number;
    height?: number;
    depth?: number;
    unit: 'cm' | 'inch' | 'mm';
  };
}

interface FilterOptions {
  status: OrderStatus | 'all';
  artworkType: ArtworkType | 'all';
  paymentStatus: PaymentStatus | 'all';
  searchQuery: string;
}

interface SortConfig {
  key: keyof ArtOrder | '';
  direction: 'asc' | 'desc';
}

const App: React.FC = () => {
  // State management
  const [orders, setOrders] = useState<ArtOrder[]>([]);
  const [currentOrder, setCurrentOrder] = useState<ArtOrder | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    status: 'all',
    artworkType: 'all',
    paymentStatus: 'all',
    searchQuery: ''
  });
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'createdAt', direction: 'desc' });
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      return savedMode === 'true' || 
        (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [statsView, setStatsView] = useState<boolean>(false);
  const [notificationMessage, setNotificationMessage] = useState<string>('');
  const [showNotification, setShowNotification] = useState<boolean>(false);
  const [notificationType, setNotificationType] = useState<'success' | 'error'>('success');

  // Get orders from localStorage on component mount
  useEffect(() => {
    const storedOrders = localStorage.getItem('artOrders');
    if (storedOrders) {
      setOrders(JSON.parse(storedOrders));
    }
  }, []);

  // Apply dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  // Save orders to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('artOrders', JSON.stringify(orders));
  }, [orders]);

  // Auto-hide notification after 3 seconds
  useEffect(() => {
    if (showNotification) {
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [showNotification]);

  // Helper functions
  const showNotify = (message: string, type: 'success' | 'error') => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
  };

  const generateId = (): string => {
    return Math.random().toString(36).substring(2, 9);
  };

  const handleAddNewOrder = () => {
    const newOrder: ArtOrder = {
      id: generateId(),
      clientName: '',
      email: '',
      phone: '',
      description: '',
      price: 0,
      deposit: 0,
      artworkType: 'painting',
      createdAt: new Date().toISOString(),
      status: 'new',
      paymentStatus: 'unpaid',
      dimensions: {
        unit: 'cm'
      },
      materials: []
    };
    
    setCurrentOrder(newOrder);
    setModalMode('add');
    setIsModalOpen(true);
    document.body.classList.add('modal-open');
  };

  const handleEditOrder = (order: ArtOrder) => {
    setCurrentOrder({ ...order });
    setModalMode('edit');
    setIsModalOpen(true);
    document.body.classList.add('modal-open');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    document.body.classList.remove('modal-open');
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentOrder) return;
    
    // Validate required fields
    if (!currentOrder.clientName.trim() || !currentOrder.description.trim()) {
      showNotify('Klantnaam en beschrijving zijn verplicht', 'error');
      return;
    }

    if (modalMode === 'add') {
      setOrders([...orders, currentOrder]);
      showNotify('Bestelling succesvol toegevoegd', 'success');
    } else {
      setOrders(orders.map(order => order.id === currentOrder.id ? currentOrder : order));
      showNotify('Bestelling succesvol bijgewerkt', 'success');
    }
    
    handleCloseModal();
  };

  const confirmDelete = (id: string) => {
    setOrderToDelete(id);
    setShowDeleteConfirm(true);
  };

  const handleDeleteOrder = () => {
    if (!orderToDelete) return;
    
    setOrders(orders.filter(order => order.id !== orderToDelete));
    setShowDeleteConfirm(false);
    setOrderToDelete(null);
    showNotify('Bestelling succesvol verwijderd', 'success');
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setOrderToDelete(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!currentOrder) return;

    const { name, value } = e.target;

    // Handle nested properties
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setCurrentOrder({
        ...currentOrder,
        [parent]: {
          ...currentOrder[parent as keyof ArtOrder] as Record<string, any>,
          [child]: value
        }
      });
    } else if (name === 'price' || name === 'deposit') {
      // Handle numeric values
      setCurrentOrder({
        ...currentOrder,
        [name]: parseFloat(value) || 0
      });
    } else if (name === 'materials') {
      // Split comma-separated materials into array
      setCurrentOrder({
        ...currentOrder,
        materials: value.split(',').map(material => material.trim()).filter(Boolean)
      });
    } else if (name === 'dimensions.width' || name === 'dimensions.height' || name === 'dimensions.depth') {
      // Handle dimensions
      const dimensionKey = name.split('.')[1];
      setCurrentOrder({
        ...currentOrder,
        dimensions: {
          ...currentOrder.dimensions,
          [dimensionKey]: parseFloat(value) || undefined
        }
      });
    } else {
      // For all other fields
      setCurrentOrder({
        ...currentOrder,
        [name]: value
      });
    }
  };

  const handleToggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleSort = (key: keyof ArtOrder) => {
    // If clicking the same key, toggle direction
    if (sortConfig.key === key) {
      setSortConfig({
        ...sortConfig,
        direction: sortConfig.direction === 'asc' ? 'desc' : 'asc'
      });
    } else {
      // If clicking a new key, set to ascending first
      setSortConfig({
        key,
        direction: 'asc'
      });
    }
  };

  // Filter and sort orders
  const filteredAndSortedOrders = [...orders]
    .filter(order => {
      const matchesStatus = filterOptions.status === 'all' || order.status === filterOptions.status;
      const matchesType = filterOptions.artworkType === 'all' || order.artworkType === filterOptions.artworkType;
      const matchesPayment = filterOptions.paymentStatus === 'all' || order.paymentStatus === filterOptions.paymentStatus;
      
      const matchesSearch = 
        filterOptions.searchQuery === '' ||
        order.clientName.toLowerCase().includes(filterOptions.searchQuery.toLowerCase()) ||
        order.description.toLowerCase().includes(filterOptions.searchQuery.toLowerCase()) ||
        order.email.toLowerCase().includes(filterOptions.searchQuery.toLowerCase());
      
      return matchesStatus && matchesType && matchesPayment && matchesSearch;
    })
    .sort((a, b) => {
      if (sortConfig.key === '') return 0;
      
      const key = sortConfig.key;
      let aValue: any = a[key];
      let bValue: any = b[key];
      
      // Handle dates specially
      if (key === 'createdAt' || key === 'deadline') {
        aValue = aValue ? new Date(aValue).getTime() : 0;
        bValue = bValue ? new Date(bValue).getTime() : 0;
      }
      
      // Handle string comparison
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      // Handle number comparison
      if (aValue === undefined) aValue = 0;
      if (bValue === undefined) bValue = 0;
      
      return sortConfig.direction === 'asc'
        ? aValue - bValue
        : bValue - aValue;
    });

  // Calculate statistics for charts
  const getStatusCounts = () => {
    const statusCounts: Record<OrderStatus, number> = {
      new: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0
    };
    
    orders.forEach(order => {
      statusCounts[order.status] += 1;
    });
    
    return Object.entries(statusCounts).map(([status, count]) => ({
      name: getStatusLabel(status as OrderStatus),
      value: count
    }));
  };

  const getArtworkTypeCounts = () => {
    const typeCounts: Record<ArtworkType, number> = {
      painting: 0,
      sculpture: 0,
      digital: 0,
      mixed_media: 0,
      other: 0
    };
    
    orders.forEach(order => {
      typeCounts[order.artworkType] += 1;
    });
    
    return Object.entries(typeCounts).map(([type, count]) => ({
      name: getArtworkTypeLabel(type as ArtworkType),
      value: count
    }));
  };

  const getPaymentStatusCounts = () => {
    const paymentCounts: Record<PaymentStatus, number> = {
      paid: 0,
      unpaid: 0,
      partial: 0
    };
    
    orders.forEach(order => {
      paymentCounts[order.paymentStatus] += 1;
    });
    
    return Object.entries(paymentCounts).map(([status, count]) => ({
      name: getPaymentStatusLabel(status as PaymentStatus),
      value: count
    }));
  };

  // Helper functions for displaying labels
  const getStatusLabel = (status: OrderStatus): string => {
    switch (status) {
      case 'new': return 'Nieuw';
      case 'in_progress': return 'In Uitvoering';
      case 'completed': return 'Voltooid';
      case 'cancelled': return 'Geannuleerd';
      default: return status;
    }
  };

  const getStatusBadgeClass = (status: OrderStatus): string => {
    switch (status) {
      case 'new': return 'badge-info';
      case 'in_progress': return 'badge-warning';
      case 'completed': return 'badge-success';
      case 'cancelled': return 'badge-error';
      default: return 'badge-info';
    }
  };

  const getPaymentStatusLabel = (status: PaymentStatus): string => {
    switch (status) {
      case 'paid': return 'Betaald';
      case 'unpaid': return 'Niet Betaald';
      case 'partial': return 'Gedeeltelijk Betaald';
      default: return status;
    }
  };

  const getPaymentStatusBadgeClass = (status: PaymentStatus): string => {
    switch (status) {
      case 'paid': return 'badge-success';
      case 'unpaid': return 'badge-error';
      case 'partial': return 'badge-warning';
      default: return 'badge-info';
    }
  };

  const getArtworkTypeLabel = (type: ArtworkType): string => {
    switch (type) {
      case 'painting': return 'Schilderij';
      case 'sculpture': return 'Sculptuur';
      case 'digital': return 'Digitaal';
      case 'mixed_media': return 'Gemengde Media';
      case 'other': return 'Anders';
      default: return type;
    }
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Niet ingesteld';
    return format(new Date(dateString), 'dd MMM yyyy', { locale: nl });
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  const formatDimensions = (dimensions?: ArtOrder['dimensions']): string => {
    if (!dimensions) return 'Niet ingesteld';
    
    const { width, height, depth, unit } = dimensions;
    let result = '';
    
    if (width) result += `${width}`;
    if (height) result += result ? ` × ${height}` : `${height}`;
    if (depth) result += result ? ` × ${depth}` : `${depth}`;
    
    return result ? `${result} ${unit}` : 'Niet ingesteld';
  };

  const getOrderTemplateAsCSV = (): string => {
    const headers = [
      'Klantnaam',
      'Email',
      'Telefoon',
      'Beschrijving',
      'Prijs',
      'Aanbetaling',
      'Type Kunstwerk',
      'Status',
      'Betalingsstatus',
      'Notities',
      'Materialen',
      'Breedte (cm)',
      'Hoogte (cm)',
      'Diepte (cm)',
      'Deadline'
    ];

    return headers.join(',');
  };

  const downloadTemplate = () => {
    const csvContent = getOrderTemplateAsCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'kunstwerk_bestelling_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Color scheme for charts
  const CHART_COLORS = ['#4f46e5', '#0891b2', '#16a34a', '#f59e0b', '#dc2626', '#8b5cf6'];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 theme-transition">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm theme-transition">
        <div className="container-fluid py-4">
          <div className="flex-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="text-primary-600 dark:text-primary-400" size={24} />
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white theme-transition">
                Kunst Bestellingen Beheer
              </h1>
            </div>
            <button
              onClick={handleToggleDarkMode}
              className="btn-sm bg-gray-100 dark:bg-gray-700 p-2 rounded-full theme-transition"
              aria-label={isDarkMode ? 'Schakel naar lichtmodus' : 'Schakel naar donkermodus'}
            >
              {isDarkMode ? (
                <Sun size={18} className="text-amber-500" />
              ) : (
                <Moon size={18} className="text-indigo-600" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-fluid py-6">
        {/* Notification */}
        {showNotification && (
          <div className={`alert ${notificationType === 'success' ? 'alert-success' : 'alert-error'} mb-4`}>
            {notificationType === 'success' ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <XCircle className="h-5 w-5" />
            )}
            <p>{notificationMessage}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex-between flex-col sm:flex-row gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <button
              className="btn btn-primary flex items-center justify-center gap-2"
              onClick={handleAddNewOrder}
            >
              <Plus size={18} />
              <span>Nieuwe Bestelling</span>
            </button>
            <button
              className={`btn ${statsView ? 'btn-primary' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'} flex items-center justify-center gap-2`}
              onClick={() => setStatsView(!statsView)}
            >
              <Info size={18} />
              <span>{statsView ? 'Toon Bestellingen' : 'Toon Statistieken'}</span>
            </button>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-auto">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                className="input pl-10"
                placeholder="Zoeken..."
                value={filterOptions.searchQuery}
                onChange={(e) => setFilterOptions({...filterOptions, searchQuery: e.target.value})}
              />
            </div>
            <button 
              className="btn bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 flex items-center justify-center gap-2"
              onClick={() => downloadTemplate()}
            >
              <Download size={18} />
              <span>Template</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="form-group">
            <label className="form-label flex items-center gap-2" htmlFor="status-filter">
              <Filter size={16} />
              <span>Status</span>
            </label>
            <select
              id="status-filter"
              className="input"
              value={filterOptions.status}
              onChange={(e) => setFilterOptions({...filterOptions, status: e.target.value as OrderStatus | 'all'})}
            >
              <option value="all">Alle Statussen</option>
              <option value="new">Nieuw</option>
              <option value="in_progress">In Uitvoering</option>
              <option value="completed">Voltooid</option>
              <option value="cancelled">Geannuleerd</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label flex items-center gap-2" htmlFor="artwork-filter">
              <Filter size={16} />
              <span>Type Kunstwerk</span>
            </label>
            <select
              id="artwork-filter"
              className="input"
              value={filterOptions.artworkType}
              onChange={(e) => setFilterOptions({...filterOptions, artworkType: e.target.value as ArtworkType | 'all'})}
            >
              <option value="all">Alle Types</option>
              <option value="painting">Schilderij</option>
              <option value="sculpture">Sculptuur</option>
              <option value="digital">Digitaal</option>
              <option value="mixed_media">Gemengde Media</option>
              <option value="other">Anders</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label flex items-center gap-2" htmlFor="payment-filter">
              <Filter size={16} />
              <span>Betalingsstatus</span>
            </label>
            <select
              id="payment-filter"
              className="input"
              value={filterOptions.paymentStatus}
              onChange={(e) => setFilterOptions({...filterOptions, paymentStatus: e.target.value as PaymentStatus | 'all'})}
            >
              <option value="all">Alle Betalingsstatussen</option>
              <option value="paid">Betaald</option>
              <option value="unpaid">Niet Betaald</option>
              <option value="partial">Gedeeltelijk Betaald</option>
            </select>
          </div>
        </div>

        {/* Statistics View */}
        {statsView && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Bestellingsstatistieken
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Status Chart */}
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Bestellingsstatus</h3>
                <div className="mt-4 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getStatusCounts()}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {getStatusCounts().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} bestellingen`, 'Aantal']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Artwork Type Chart */}
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Type Kunstwerk</h3>
                <div className="mt-4 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getArtworkTypeCounts()}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {getArtworkTypeCounts().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} bestellingen`, 'Aantal']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Payment Status Chart */}
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Betalingsstatus</h3>
                <div className="mt-4 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getPaymentStatusCounts()}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {getPaymentStatusCounts().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} bestellingen`, 'Aantal']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              <div className="stat-card">
                <div className="stat-title">Totaal Bestellingen</div>
                <div className="stat-value">{orders.length}</div>
                <div className="stat-desc">Alle bestellingen</div>
              </div>
              <div className="stat-card">
                <div className="stat-title">Te Ontvangen</div>
                <div className="stat-value">
                  {formatPrice(
                    orders
                      .filter(order => order.paymentStatus !== 'paid')
                      .reduce((total, order) => {
                        const unpaidAmount = order.paymentStatus === 'partial' 
                          ? order.price - (order.deposit || 0)
                          : order.price;
                        return total + unpaidAmount;
                      }, 0)
                  )}
                </div>
                <div className="stat-desc">Nog te ontvangen betalingen</div>
              </div>
              <div className="stat-card">
                <div className="stat-title">Ontvangen</div>
                <div className="stat-value">
                  {formatPrice(
                    orders
                      .reduce((total, order) => {
                        const paidAmount = order.paymentStatus === 'paid' 
                          ? order.price
                          : (order.paymentStatus === 'partial' ? (order.deposit || 0) : 0);
                        return total + paidAmount;
                      }, 0)
                  )}
                </div>
                <div className="stat-desc">Reeds ontvangen betalingen</div>
              </div>
              <div className="stat-card">
                <div className="stat-title">Openstaande Opdrachten</div>
                <div className="stat-value">
                  {orders.filter(order => order.status !== 'completed' && order.status !== 'cancelled').length}
                </div>
                <div className="stat-desc">Nog af te ronden opdrachten</div>
              </div>
            </div>
          </div>
        )}

        {/* Orders Table */}
        {!statsView && (
          <div className="table-container overflow-hidden">
            {filteredAndSortedOrders.length > 0 ? (
              <table className="table">
                <thead>
                  <tr>
                    <th className="table-header" onClick={() => handleSort('clientName')}>
                      <div className="flex items-center gap-1">
                        <span>Klantnaam</span>
                        {sortConfig.key === 'clientName' && (
                          <ArrowUpDown size={16} className="text-gray-500" />
                        )}
                      </div>
                    </th>
                    <th className="table-header hidden sm:table-cell" onClick={() => handleSort('artworkType')}>
                      <div className="flex items-center gap-1">
                        <span>Type</span>
                        {sortConfig.key === 'artworkType' && (
                          <ArrowUpDown size={16} className="text-gray-500" />
                        )}
                      </div>
                    </th>
                    <th className="table-header" onClick={() => handleSort('price')}>
                      <div className="flex items-center gap-1">
                        <span>Prijs</span>
                        {sortConfig.key === 'price' && (
                          <ArrowUpDown size={16} className="text-gray-500" />
                        )}
                      </div>
                    </th>
                    <th className="table-header hidden md:table-cell" onClick={() => handleSort('createdAt')}>
                      <div className="flex items-center gap-1">
                        <span>Aangemaakt</span>
                        {sortConfig.key === 'createdAt' && (
                          <ArrowUpDown size={16} className="text-gray-500" />
                        )}
                      </div>
                    </th>
                    <th className="table-header hidden lg:table-cell" onClick={() => handleSort('deadline')}>
                      <div className="flex items-center gap-1">
                        <span>Deadline</span>
                        {sortConfig.key === 'deadline' && (
                          <ArrowUpDown size={16} className="text-gray-500" />
                        )}
                      </div>
                    </th>
                    <th className="table-header">
                      <div className="flex items-center gap-1">
                        <span>Status</span>
                      </div>
                    </th>
                    <th className="table-header hidden md:table-cell">
                      <div className="flex items-center gap-1">
                        <span>Betaling</span>
                      </div>
                    </th>
                    <th className="table-header">Acties</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                  {filteredAndSortedOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="table-cell">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{order.clientName}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">{order.description}</div>
                      </td>
                      <td className="table-cell hidden sm:table-cell">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {getArtworkTypeLabel(order.artworkType)}
                        </span>
                      </td>
                      <td className="table-cell">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatPrice(order.price)}
                        </span>
                      </td>
                      <td className="table-cell hidden md:table-cell">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(order.createdAt)}
                        </span>
                      </td>
                      <td className="table-cell hidden lg:table-cell">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {order.deadline ? formatDate(order.deadline) : '–'}
                        </span>
                      </td>
                      <td className="table-cell">
                        <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </td>
                      <td className="table-cell hidden md:table-cell">
                        <span className={`badge ${getPaymentStatusBadgeClass(order.paymentStatus)}`}>
                          {getPaymentStatusLabel(order.paymentStatus)}
                        </span>
                      </td>
                      <td className="table-cell">
                        <div className="flex space-x-2">
                          <button 
                            className="btn-sm bg-primary-100 text-primary-700 hover:bg-primary-200 dark:bg-primary-900 dark:text-primary-300 dark:hover:bg-primary-800"
                            onClick={() => handleEditOrder(order)}
                            aria-label="Bewerk bestelling"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            className="btn-sm bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800"
                            onClick={() => confirmDelete(order.id)}
                            aria-label="Verwijder bestelling"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
                <div className="text-gray-500 dark:text-gray-400 mb-4">
                  <ShoppingCart size={48} className="mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium">Geen bestellingen gevonden</p>
                  <p className="mt-1">Voeg een nieuwe bestelling toe of pas je filters aan.</p>
                </div>
                <button
                  className="btn btn-primary mt-4"
                  onClick={handleAddNewOrder}
                >
                  Bestelling Toevoegen
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Order Modal */}
      {isModalOpen && currentOrder && (
        <div 
          className="modal-backdrop" 
          onClick={handleCloseModal} 
          role="dialog" 
          aria-modal="true" 
          aria-labelledby="order-form-title"
        >
          <div 
            className="modal-content max-w-xl" 
            onClick={(e) => e.stopPropagation()}
            role="document"
          >
            <div className="modal-header">
              <h3 id="order-form-title" className="text-lg font-medium text-gray-900 dark:text-white">
                {modalMode === 'add' ? 'Nieuwe Bestelling' : 'Bestelling Bewerken'}
              </h3>
              <button 
                className="text-gray-400 hover:text-gray-500"
                onClick={handleCloseModal}
                aria-label="Sluit modal"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmitOrder}>
              <div className="mt-4 grid grid-cols-1 gap-y-4">
                {/* Client Information */}
                <h4 className="text-md font-medium text-gray-700 dark:text-gray-300">Klantgegevens</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label" htmlFor="clientName">Klantnaam *</label>
                    <input
                      id="clientName"
                      type="text"
                      name="clientName"
                      className="input"
                      value={currentOrder.clientName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="email">Email</label>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      className="input"
                      value={currentOrder.email}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="phone">Telefoon</label>
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    className="input"
                    value={currentOrder.phone}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Order Information */}
                <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mt-2">Bestelgegevens</h4>
                <div className="form-group">
                  <label className="form-label" htmlFor="description">Beschrijving *</label>
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    className="input"
                    value={currentOrder.description}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label" htmlFor="artworkType">Type Kunstwerk</label>
                    <select
                      id="artworkType"
                      name="artworkType"
                      className="input"
                      value={currentOrder.artworkType}
                      onChange={handleInputChange}
                    >
                      <option value="painting">Schilderij</option>
                      <option value="sculpture">Sculptuur</option>
                      <option value="digital">Digitaal</option>
                      <option value="mixed_media">Gemengde Media</option>
                      <option value="other">Anders</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="deadline">Deadline</label>
                    <input
                      id="deadline"
                      type="date"
                      name="deadline"
                      className="input"
                      value={currentOrder.deadline ? currentOrder.deadline.split('T')[0] : ''}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="form-group">
                    <label className="form-label" htmlFor="price">Prijs (€)</label>
                    <input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      name="price"
                      className="input"
                      value={currentOrder.price}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="deposit">Aanbetaling (€)</label>
                    <input
                      id="deposit"
                      type="number"
                      min="0"
                      step="0.01"
                      name="deposit"
                      className="input"
                      value={currentOrder.deposit || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="paymentStatus">Betalingsstatus</label>
                    <select
                      id="paymentStatus"
                      name="paymentStatus"
                      className="input"
                      value={currentOrder.paymentStatus}
                      onChange={handleInputChange}
                    >
                      <option value="unpaid">Niet Betaald</option>
                      <option value="partial">Gedeeltelijk Betaald</option>
                      <option value="paid">Betaald</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="status">Status</label>
                  <select
                    id="status"
                    name="status"
                    className="input"
                    value={currentOrder.status}
                    onChange={handleInputChange}
                  >
                    <option value="new">Nieuw</option>
                    <option value="in_progress">In Uitvoering</option>
                    <option value="completed">Voltooid</option>
                    <option value="cancelled">Geannuleerd</option>
                  </select>
                </div>
                
                {/* Additional Information */}
                <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mt-2">Extra Details</h4>
                <div className="form-group">
                  <label className="form-label" htmlFor="materials">Materialen (gescheiden door komma's)</label>
                  <input
                    id="materials"
                    type="text"
                    name="materials"
                    className="input"
                    value={currentOrder.materials?.join(', ') || ''}
                    onChange={handleInputChange}
                    placeholder="bijv. acryl, canvas, hout"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Afmetingen</label>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400" htmlFor="dimensions.width">Breedte</label>
                      <input
                        id="dimensions.width"
                        type="number"
                        min="0"
                        step="0.1"
                        name="dimensions.width"
                        className="input"
                        value={currentOrder.dimensions?.width || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400" htmlFor="dimensions.height">Hoogte</label>
                      <input
                        id="dimensions.height"
                        type="number"
                        min="0"
                        step="0.1"
                        name="dimensions.height"
                        className="input"
                        value={currentOrder.dimensions?.height || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400" htmlFor="dimensions.depth">Diepte</label>
                      <input
                        id="dimensions.depth"
                        type="number"
                        min="0"
                        step="0.1"
                        name="dimensions.depth"
                        className="input"
                        value={currentOrder.dimensions?.depth || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="mt-2">
                    <label className="text-xs text-gray-500 dark:text-gray-400" htmlFor="dimensions.unit">Eenheid</label>
                    <select
                      id="dimensions.unit"
                      name="dimensions.unit"
                      className="input"
                      value={currentOrder.dimensions?.unit || 'cm'}
                      onChange={handleInputChange}
                    >
                      <option value="cm">cm</option>
                      <option value="inch">inch</option>
                      <option value="mm">mm</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="notes">Notities</label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    className="input"
                    value={currentOrder.notes || ''}
                    onChange={handleInputChange}
                    placeholder="Extra opmerkingen of details..."
                  />
                </div>
              </div>
              
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  onClick={handleCloseModal}
                >
                  Annuleren
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  {modalMode === 'add' ? 'Toevoegen' : 'Bijwerken'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div 
          className="modal-backdrop" 
          role="dialog" 
          aria-modal="true" 
          aria-labelledby="delete-confirmation-title"
        >
          <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 id="delete-confirmation-title" className="text-lg font-medium text-gray-900 dark:text-white">
                Bestelling Verwijderen
              </h3>
              <button 
                className="text-gray-400 hover:text-gray-500"
                onClick={handleCancelDelete}
                aria-label="Sluit modal"
              >
                ×
              </button>
            </div>
            <div className="mt-2">
              <p className="text-gray-500 dark:text-slate-400">
                Weet je zeker dat je deze bestelling wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                onClick={handleCancelDelete}
              >
                Annuleren
              </button>
              <button
                className="btn bg-red-500 text-white hover:bg-red-600"
                onClick={handleDeleteOrder}
              >
                Verwijderen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4 mt-8 theme-transition">
        <div className="container-fluid">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Copyright © 2025 of Datavtar Private Limited. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;