import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { format } from 'date-fns';
import styles from './styles/styles.module.css';
import {
 Plus,
 Edit,
 Trash2,
 Search,
 ShoppingCart,
 Moon,
 Sun,
 Filter,
 ArrowUpDown,
 X,
 Check,
 Eye,
 AlertCircle
} from 'lucide-react';

// Define types
type OrderStatus = 'pending' | 'completed' | 'cancelled' | 'in-progress';
type SortDirection = 'asc' | 'desc';
type SortField = 'id' | 'customerName' | 'date' | 'totalAmount' | 'status';

interface ArtOrder {
 id: string;
 customerName: string;
 email: string;
 date: string;
 description: string;
 artType: string;
 dimensions: string;
 totalAmount: number;
 status: OrderStatus;
 notes?: string;
}

interface OrderFormInputs {
 id?: string;
 customerName: string;
 email: string;
 date: string;
 description: string;
 artType: string;
 dimensions: string;
 totalAmount: number;
 status: OrderStatus;
 notes?: string;
}

function App() {
 // Theme state
 const [isDarkMode, setIsDarkMode] = useState(() => {
 if (typeof window !== 'undefined') {
 const savedMode = localStorage.getItem('darkMode');
 return savedMode === 'true' || 
 (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
 }
 return false;
 });

 // App state
 const [orders, setOrders] = useState<ArtOrder[]>(() => {
 const savedOrders = localStorage.getItem('artOrders');
 return savedOrders ? JSON.parse(savedOrders) : [
 {
 id: '1',
 customerName: 'Johanna van der Meer',
 email: 'johanna@example.com',
 date: '2025-01-15',
 description: 'Abstract schilderij met blauwe tinten',
 artType: 'Schilderij',
 dimensions: '50x70 cm',
 totalAmount: 350.00,
 status: 'completed',
 notes: 'Klant was erg tevreden'
 },
 {
 id: '2',
 customerName: 'Willem Bakker',
 email: 'willem@example.com',
 date: '2025-02-20',
 description: 'Portret van familie',
 artType: 'Schets',
 dimensions: '30x40 cm',
 totalAmount: 200.00,
 status: 'pending',
 notes: 'Contact opnemen voor meer details'
 },
 {
 id: '3',
 customerName: 'Lisa de Jong',
 email: 'lisa@example.com',
 date: '2025-03-10',
 description: 'Keramiek vaas met bloemendecoratie',
 artType: 'Keramiek',
 dimensions: '25x15 cm',
 totalAmount: 175.50,
 status: 'in-progress',
 notes: 'Nog 1 week nodig voor afronding'
 }
 ];
 });
 
 const [isAddingOrder, setIsAddingOrder] = useState(false);
 const [isEditingOrder, setIsEditingOrder] = useState(false);
 const [currentOrder, setCurrentOrder] = useState<ArtOrder | null>(null);
 const [viewingOrder, setViewingOrder] = useState<ArtOrder | null>(null);
 const [searchTerm, setSearchTerm] = useState('');
 const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
 const [sortConfig, setSortConfig] = useState<{ field: SortField; direction: SortDirection }>({ field: 'date', direction: 'desc' });
 const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
 const [isConfirmingDelete, setIsConfirmingDelete] = useState<string | null>(null);

 // Form handling
 const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<OrderFormInputs>();

 // Handle theme changes
 useEffect(() => {
 if (isDarkMode) {
 document.documentElement.classList.add('dark');
 localStorage.setItem('darkMode', 'true');
 } else {
 document.documentElement.classList.remove('dark');
 localStorage.setItem('darkMode', 'false');
 }
 }, [isDarkMode]);

 // Save orders to localStorage
 useEffect(() => {
 localStorage.setItem('artOrders', JSON.stringify(orders));
 }, [orders]);

 // Auto-hide notifications after 3 seconds
 useEffect(() => {
 if (notification) {
 const timer = setTimeout(() => {
 setNotification(null);
 }, 3000);
 return () => clearTimeout(timer);
 }
 }, [notification]);

 // Form submission handler
 const onSubmit: SubmitHandler<OrderFormInputs> = (data) => {
 if (isEditingOrder && currentOrder) {
 // Update existing order
 const updatedOrders = orders.map(order => 
 order.id === currentOrder.id ? { ...data, id: currentOrder.id } : order
 );
 setOrders(updatedOrders);
 setNotification({ message: 'Bestelling succesvol bijgewerkt!', type: 'success' });
 } else {
 // Add new order
 const newOrder = {
 ...data,
 id: Date.now().toString()
 };
 setOrders([...orders, newOrder]);
 setNotification({ message: 'Nieuwe bestelling toegevoegd!', type: 'success' });
 }
 
 // Reset form and state
 reset();
 setIsAddingOrder(false);
 setIsEditingOrder(false);
 setCurrentOrder(null);
 };

 // Edit order
 const handleEditOrder = (order: ArtOrder) => {
 setCurrentOrder(order);
 setIsEditingOrder(true);
 
 // Set form values
 Object.entries(order).forEach(([key, value]) => {
 setValue(key as keyof OrderFormInputs, value);
 });
 };

 // Delete order
 const handleDeleteOrder = (id: string) => {
 setOrders(orders.filter(order => order.id !== id));
 setIsConfirmingDelete(null);
 setNotification({ message: 'Bestelling verwijderd!', type: 'success' });
 };

 // View order details
 const handleViewOrder = (order: ArtOrder) => {
 setViewingOrder(order);
 };

 // Filter orders based on search term and status
 const filteredOrders = orders.filter(order => {
 const matchesSearch = 
 order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
 order.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
 order.artType.toLowerCase().includes(searchTerm.toLowerCase());
 
 const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
 
 return matchesSearch && matchesStatus;
 });

 // Sort orders
 const sortedOrders = [...filteredOrders].sort((a, b) => {
 const { field, direction } = sortConfig;
 
 if (a[field] < b[field]) {
 return direction === 'asc' ? -1 : 1;
 }
 if (a[field] > b[field]) {
 return direction === 'asc' ? 1 : -1;
 }
 return 0;
 });

 // Handle sort
 const handleSort = (field: SortField) => {
 setSortConfig(prevSort => ({
 field,
 direction: prevSort.field === field && prevSort.direction === 'asc' ? 'desc' : 'asc'
 }));
 };

 // Format currency
 const formatCurrency = (amount: number) => {
 return new Intl.NumberFormat('nl-NL', {
 style: 'currency',
 currency: 'EUR'
 }).format(amount);
 };

 // Format date
 const formatDate = (dateString: string) => {
 return format(new Date(dateString), 'dd-MM-yyyy');
 };

 // Get status badge class
 const getStatusBadgeClass = (status: OrderStatus) => {
 switch (status) {
 case 'completed':
 return 'badge badge-success';
 case 'pending':
 return 'badge badge-warning';
 case 'cancelled':
 return 'badge badge-error';
 case 'in-progress':
 return 'badge badge-info';
 default:
 return 'badge';
 }
 };

 // Render status text in Dutch
 const getStatusText = (status: OrderStatus) => {
 switch (status) {
 case 'completed':
 return 'Voltooid';
 case 'pending':
 return 'In afwachting';
 case 'cancelled':
 return 'Geannuleerd';
 case 'in-progress':
 return 'In uitvoering';
 default:
 return status;
 }
 };

 return (
 <div className="min-h-screen bg-gray-50 dark:bg-gray-900 theme-transition">
 {/* Header */}
 <header className="bg-white dark:bg-gray-800 shadow theme-transition">
 <div className="container-fluid py-4 flex flex-col md:flex-row justify-between items-center">
 <div className="flex items-center mb-4 md:mb-0">
 <ShoppingCart className="w-6 h-6 text-primary-500 mr-2" />
 <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Kunstenaar Bestellingenbeheer</h1>
 </div>
 
 <div className="flex items-center space-x-4">
 <button 
 onClick={() => setIsDarkMode(!isDarkMode)}
 className="theme-toggle p-2 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center"
 aria-label={isDarkMode ? 'Schakel naar lichte modus' : 'Schakel naar donkere modus'}
 >
 {isDarkMode ? (
 <Sun className="w-5 h-5 text-yellow-400" />
 ) : (
 <Moon className="w-5 h-5 text-gray-700" />
 )}
 </button>
 </div>
 </div>
 </header>

 {/* Main content */}
 <main className="container-fluid py-6">
 {/* Notification */}
 {notification && (
 <div className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-error'} mb-6 fade-in`}>
 {notification.type === 'success' ? (
 <Check className="h-5 w-5" />
 ) : (
 <AlertCircle className="h-5 w-5" />
 )}
 <p>{notification.message}</p>
 </div>
 )}

 {/* Order management section */}
 <div className="card mb-6">
 <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
 <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 md:mb-0">Mijn Bestellingen</h2>
 <button 
 onClick={() => {
 setIsAddingOrder(true);
 reset();
 setValue('date', format(new Date(), 'yyyy-MM-dd'));
 setValue('status', 'pending');
 }}
 className="btn btn-primary flex items-center"
 role="button"
 name="add-order"
 >
 <Plus className="w-4 h-4 mr-2" />
 Nieuwe Bestelling
 </button>
 </div>

 {/* Search and filters */}
 <div className="flex flex-col md:flex-row mb-6 gap-4">
 <div className="form-group flex-1">
 <div className="relative">
 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400" />
 <input
 type="text"
 placeholder="Zoeken op naam, beschrijving of type..."
 className="input pl-10"
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 role="searchbox"
 name="search-orders"
 />
 </div>
 </div>
 
 <div className="form-group w-full md:w-auto">
 <div className="flex items-center">
 <Filter className="mr-2 text-gray-500 dark:text-gray-400" />
 <select
 className="input"
 value={statusFilter}
 onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
 role="combobox"
 name="status-filter"
 >
 <option value="all">Alle statussen</option>
 <option value="pending">In afwachting</option>
 <option value="in-progress">In uitvoering</option>
 <option value="completed">Voltooid</option>
 <option value="cancelled">Geannuleerd</option>
 </select>
 </div>
 </div>
 </div>

 {/* Orders table */}
 <div className="table-container">
 {sortedOrders.length > 0 ? (
 <table className="table">
 <thead>
 <tr>
 <th 
 className="table-header cursor-pointer"
 onClick={() => handleSort('customerName')}
 >
 <div className="flex items-center">
 Klant
 <ArrowUpDown className="w-4 h-4 ml-1" />
 </div>
 </th>
 <th 
 className="table-header cursor-pointer hidden md:table-cell"
 onClick={() => handleSort('artType')}
 >
 <div className="flex items-center">
 Type
 <ArrowUpDown className="w-4 h-4 ml-1" />
 </div>
 </th>
 <th 
 className="table-header cursor-pointer"
 onClick={() => handleSort('date')}
 >
 <div className="flex items-center">
 Datum
 <ArrowUpDown className="w-4 h-4 ml-1" />
 </div>
 </th>
 <th 
 className="table-header cursor-pointer hidden md:table-cell"
 onClick={() => handleSort('totalAmount')}
 >
 <div className="flex items-center">
 Bedrag
 <ArrowUpDown className="w-4 h-4 ml-1" />
 </div>
 </th>
 <th 
 className="table-header cursor-pointer"
 onClick={() => handleSort('status')}
 >
 <div className="flex items-center">
 Status
 <ArrowUpDown className="w-4 h-4 ml-1" />
 </div>
 </th>
 <th className="table-header">Acties</th>
 </tr>
 </thead>
 <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
 {sortedOrders.map((order) => (
 <tr key={order.id} className="theme-transition">
 <td className="table-cell">
 <div>
 <p className="font-medium">{order.customerName}</p>
 <p className="text-xs text-gray-500 dark:text-gray-400 hidden md:block">{order.email}</p>
 </div>
 </td>
 <td className="table-cell hidden md:table-cell">{order.artType}</td>
 <td className="table-cell">{formatDate(order.date)}</td>
 <td className="table-cell hidden md:table-cell">{formatCurrency(order.totalAmount)}</td>
 <td className="table-cell">
 <span className={getStatusBadgeClass(order.status)}>
 {getStatusText(order.status)}
 </span>
 </td>
 <td className="table-cell">
 <div className="flex items-center space-x-2">
 <button 
 onClick={() => handleViewOrder(order)}
 className="btn btn-sm bg-blue-500 text-white hover:bg-blue-600"
 aria-label={`Bekijk bestelling van ${order.customerName}`}
 title="Bekijken"
 role="button"
 name={`view-order-${order.id}`}
 >
 <Eye className="w-4 h-4" />
 </button>
 <button 
 onClick={() => handleEditOrder(order)}
 className="btn btn-sm btn-primary"
 aria-label={`Bewerk bestelling van ${order.customerName}`}
 title="Bewerken"
 role="button"
 name={`edit-order-${order.id}`}
 >
 <Edit className="w-4 h-4" />
 </button>
 <button 
 onClick={() => setIsConfirmingDelete(order.id)}
 className="btn btn-sm bg-red-500 text-white hover:bg-red-600"
 aria-label={`Verwijder bestelling van ${order.customerName}`}
 title="Verwijderen"
 role="button"
 name={`delete-order-${order.id}`}
 >
 <Trash2 className="w-4 h-4" />
 </button>
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 ) : (
 <div className="text-center py-8 text-gray-500 dark:text-gray-400">
 <p className="text-lg font-medium">Geen bestellingen gevonden</p>
 <p className="mt-2">Gebruik de knop 'Nieuwe Bestelling' om een bestelling toe te voegen</p>
 </div>
 )}
 </div>
 </div>

 {/* Summary cards */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
 <div className="stat-card">
 <div className="stat-title">Totaal Bestellingen</div>
 <div className="stat-value">{orders.length}</div>
 </div>
 
 <div className="stat-card">
 <div className="stat-title">Voltooide Bestellingen</div>
 <div className="stat-value">{orders.filter(order => order.status === 'completed').length}</div>
 <div className="stat-desc">
 {Math.round(orders.filter(order => order.status === 'completed').length / orders.length * 100) || 0}% van totaal
 </div>
 </div>
 
 <div className="stat-card">
 <div className="stat-title">In Uitvoering</div>
 <div className="stat-value">{orders.filter(order => order.status === 'in-progress').length}</div>
 </div>
 
 <div className="stat-card">
 <div className="stat-title">Totale Omzet</div>
 <div className="stat-value">
 {formatCurrency(orders.reduce((sum, order) => sum + order.totalAmount, 0))}
 </div>
 </div>
 </div>
 </main>

 {/* Add/Edit Order Modal */}
 {(isAddingOrder || isEditingOrder) && (
 <div className="modal-backdrop">
 <div className="modal-content max-w-2xl">
 <div className="modal-header">
 <h3 className="text-lg font-medium text-gray-900 dark:text-white">
 {isEditingOrder ? 'Bestelling Bewerken' : 'Nieuwe Bestelling'}
 </h3>
 <button 
 className="text-gray-400 hover:text-gray-500"
 onClick={() => {
 setIsAddingOrder(false);
 setIsEditingOrder(false);
 setCurrentOrder(null);
 reset();
 }}
 aria-label="Sluiten"
 role="button"
 name="close-modal"
 >
 <X className="w-5 h-5" />
 </button>
 </div>
 
 <form onSubmit={handleSubmit(onSubmit)} className="mt-4">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="form-group">
 <label className="form-label" htmlFor="customerName">Klantnaam</label>
 <input 
 id="customerName" 
 type="text" 
 className={`input ${errors.customerName ? 'border-red-500' : ''}`}
 {...register('customerName', { required: 'Klantnaam is verplicht' })}
 />
 {errors.customerName && (
 <p className="form-error">{errors.customerName.message}</p>
 )}
 </div>
 
 <div className="form-group">
 <label className="form-label" htmlFor="email">E-mail</label>
 <input 
 id="email" 
 type="email" 
 className={`input ${errors.email ? 'border-red-500' : ''}`}
 {...register('email', { 
 required: 'E-mail is verplicht',
 pattern: {
 value: /^\S+@\S+\.\S+$/,
 message: 'Ongeldig e-mailadres'
 }
 })}
 />
 {errors.email && (
 <p className="form-error">{errors.email.message}</p>
 )}
 </div>
 
 <div className="form-group">
 <label className="form-label" htmlFor="date">Datum</label>
 <input 
 id="date" 
 type="date" 
 className={`input ${errors.date ? 'border-red-500' : ''}`}
 {...register('date', { required: 'Datum is verplicht' })}
 />
 {errors.date && (
 <p className="form-error">{errors.date.message}</p>
 )}
 </div>
 
 <div className="form-group">
 <label className="form-label" htmlFor="artType">Type Kunst</label>
 <input 
 id="artType" 
 type="text" 
 className={`input ${errors.artType ? 'border-red-500' : ''}`}
 {...register('artType', { required: 'Type kunst is verplicht' })}
 />
 {errors.artType && (
 <p className="form-error">{errors.artType.message}</p>
 )}
 </div>
 
 <div className="form-group">
 <label className="form-label" htmlFor="dimensions">Afmetingen</label>
 <input 
 id="dimensions" 
 type="text" 
 className={`input ${errors.dimensions ? 'border-red-500' : ''}`}
 {...register('dimensions', { required: 'Afmetingen zijn verplicht' })}
 />
 {errors.dimensions && (
 <p className="form-error">{errors.dimensions.message}</p>
 )}
 </div>
 
 <div className="form-group">
 <label className="form-label" htmlFor="totalAmount">Bedrag (€)</label>
 <input 
 id="totalAmount" 
 type="number" 
 step="0.01" 
 className={`input ${errors.totalAmount ? 'border-red-500' : ''}`}
 {...register('totalAmount', { 
 required: 'Bedrag is verplicht',
 valueAsNumber: true,
 min: {
 value: 0,
 message: 'Bedrag moet positief zijn'
 }
 })}
 />
 {errors.totalAmount && (
 <p className="form-error">{errors.totalAmount.message}</p>
 )}
 </div>
 
 <div className="form-group">
 <label className="form-label" htmlFor="status">Status</label>
 <select 
 id="status" 
 className={`input ${errors.status ? 'border-red-500' : ''}`}
 {...register('status', { required: 'Status is verplicht' })}
 >
 <option value="pending">In afwachting</option>
 <option value="in-progress">In uitvoering</option>
 <option value="completed">Voltooid</option>
 <option value="cancelled">Geannuleerd</option>
 </select>
 {errors.status && (
 <p className="form-error">{errors.status.message}</p>
 )}
 </div>
 </div>
 
 <div className="form-group">
 <label className="form-label" htmlFor="description">Beschrijving</label>
 <textarea 
 id="description" 
 className={`input ${errors.description ? 'border-red-500' : ''}`}
 rows={3}
 {...register('description', { required: 'Beschrijving is verplicht' })}
 />
 {errors.description && (
 <p className="form-error">{errors.description.message}</p>
 )}
 </div>
 
 <div className="form-group">
 <label className="form-label" htmlFor="notes">Notities (optioneel)</label>
 <textarea 
 id="notes" 
 className="input"
 rows={2}
 {...register('notes')}
 />
 </div>
 
 <div className="modal-footer">
 <button 
 type="button" 
 className="btn bg-gray-100 text-gray-700 hover:bg-gray-200"
 onClick={() => {
 setIsAddingOrder(false);
 setIsEditingOrder(false);
 setCurrentOrder(null);
 reset();
 }}
 role="button"
 name="cancel-form"
 >
 Annuleren
 </button>
 <button 
 type="submit" 
 className="btn btn-primary"
 role="button"
 name="submit-form"
 >
 {isEditingOrder ? 'Bijwerken' : 'Toevoegen'}
 </button>
 </div>
 </form>
 </div>
 </div>
 )}

 {/* View Order Modal */}
 {viewingOrder && (
 <div className="modal-backdrop">
 <div className="modal-content max-w-2xl">
 <div className="modal-header">
 <h3 className="text-lg font-medium text-gray-900 dark:text-white">
 Bestellingsdetails
 </h3>
 <button 
 className="text-gray-400 hover:text-gray-500"
 onClick={() => setViewingOrder(null)}
 aria-label="Sluiten"
 role="button"
 name="close-view-modal"
 >
 <X className="w-5 h-5" />
 </button>
 </div>
 
 <div className="mt-4">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
 <div>
 <p className="text-sm text-gray-500 dark:text-gray-400">Klantnaam</p>
 <p className="font-medium">{viewingOrder.customerName}</p>
 </div>
 
 <div>
 <p className="text-sm text-gray-500 dark:text-gray-400">E-mail</p>
 <p className="font-medium">{viewingOrder.email}</p>
 </div>
 
 <div>
 <p className="text-sm text-gray-500 dark:text-gray-400">Datum</p>
 <p className="font-medium">{formatDate(viewingOrder.date)}</p>
 </div>
 
 <div>
 <p className="text-sm text-gray-500 dark:text-gray-400">Type Kunst</p>
 <p className="font-medium">{viewingOrder.artType}</p>
 </div>
 
 <div>
 <p className="text-sm text-gray-500 dark:text-gray-400">Afmetingen</p>
 <p className="font-medium">{viewingOrder.dimensions}</p>
 </div>
 
 <div>
 <p className="text-sm text-gray-500 dark:text-gray-400">Bedrag</p>
 <p className="font-medium">{formatCurrency(viewingOrder.totalAmount)}</p>
 </div>
 
 <div>
 <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
 <p>
 <span className={getStatusBadgeClass(viewingOrder.status)}>
 {getStatusText(viewingOrder.status)}
 </span>
 </p>
 </div>
 </div>
 
 <div className="mb-4">
 <p className="text-sm text-gray-500 dark:text-gray-400">Beschrijving</p>
 <p className="font-medium">{viewingOrder.description}</p>
 </div>
 
 {viewingOrder.notes && (
 <div className="mb-4">
 <p className="text-sm text-gray-500 dark:text-gray-400">Notities</p>
 <p className="font-medium">{viewingOrder.notes}</p>
 </div>
 )}
 
 <div className="modal-footer">
 <button 
 type="button" 
 className="btn btn-primary"
 onClick={() => {
 handleEditOrder(viewingOrder);
 setViewingOrder(null);
 }}
 role="button"
 name="edit-from-view"
 >
 Bewerken
 </button>
 <button 
 type="button" 
 className="btn bg-gray-100 text-gray-700 hover:bg-gray-200"
 onClick={() => setViewingOrder(null)}
 role="button"
 name="close-view"
 >
 Sluiten
 </button>
 </div>
 </div>
 </div>
 </div>
 )}

 {/* Delete Confirmation Modal */}
 {isConfirmingDelete && (
 <div className="modal-backdrop">
 <div className="modal-content max-w-md">
 <div className="modal-header">
 <h3 className="text-lg font-medium text-gray-900 dark:text-white">
 Bestelling Verwijderen
 </h3>
 <button 
 className="text-gray-400 hover:text-gray-500"
 onClick={() => setIsConfirmingDelete(null)}
 aria-label="Sluiten"
 role="button"
 name="close-delete-modal"
 >
 <X className="w-5 h-5" />
 </button>
 </div>
 
 <div className="mt-4">
 <p className="text-gray-600 dark:text-gray-300">
 Weet je zeker dat je deze bestelling wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.
 </p>
 
 <div className="modal-footer">
 <button 
 type="button" 
 className="btn bg-gray-100 text-gray-700 hover:bg-gray-200"
 onClick={() => setIsConfirmingDelete(null)}
 role="button"
 name="cancel-delete"
 >
 Annuleren
 </button>
 <button 
 type="button" 
 className="btn bg-red-500 text-white hover:bg-red-600"
 onClick={() => handleDeleteOrder(isConfirmingDelete)}
 role="button"
 name="confirm-delete"
 >
 Verwijderen
 </button>
 </div>
 </div>
 </div>
 </div>
 )}

 {/* Footer */}
 <footer className="bg-white dark:bg-gray-800 shadow-inner py-4 theme-transition mt-auto">
 <div className="container-fluid text-center text-gray-600 dark:text-gray-300 text-sm">
 <p>Copyright (c) 2025 of Datavtar Private Limited. All rights reserved.</p>
 </div>
 </footer>
 </div>
 );
}

export default App;
