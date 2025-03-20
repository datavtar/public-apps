import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { format, parseISO } from 'date-fns';
import { nl } from 'date-fns/locale';
import { PlusCircle, Search, Edit, Trash2, X, Moon, Sun, Filter, ChevronDown, ChevronUp, CheckCircle2, AlertCircle } from 'lucide-react';
import styles from './styles/styles.module.css';

// Types
type Status = 'pending' | 'in-progress' | 'completed' | 'cancelled';
type ArtType = 'painting' | 'sculpture' | 'digital' | 'mixed-media' | 'other';

interface Order {
 id: string;
 clientName: string;
 description: string;
 price: number;
 depositPaid: boolean;
 createdAt: string;
 dueDate: string;
 status: Status;
 artType: ArtType;
 materials: string[];
 size?: string;
 notes?: string;
}

interface OrderFormInputs {
 clientName: string;
 description: string;
 price: number;
 depositPaid: boolean;
 dueDate: string;
 status: Status;
 artType: ArtType;
 materials: string;
 size?: string;
 notes?: string;
}

interface FilterOptions {
 status: Status | 'all';
 artType: ArtType | 'all';
 search: string;
 sortBy: keyof Order | '';
 sortDirection: 'asc' | 'desc';
}

const App: React.FC = () => {
 // State
 const [orders, setOrders] = useState<Order[]>(() => {
 const savedOrders = localStorage.getItem('orders');
 return savedOrders ? JSON.parse(savedOrders) : [];
 });
 
 const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
 const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
 const [newMaterial, setNewMaterial] = useState<string>('');
 const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
 const [filters, setFilters] = useState<FilterOptions>({
 status: 'all',
 artType: 'all',
 search: '',
 sortBy: '',
 sortDirection: 'asc'
 });
 const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
 const [notification, setNotification] = useState<{message: string; type: 'success' | 'error'} | null>(null);
 const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
 if (typeof window !== 'undefined') {
 const savedMode = localStorage.getItem('darkMode');
 return savedMode === 'true' || 
 (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
 }
 return false;
 });

 // Form
 const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<OrderFormInputs>();
 
 // Materials options
 const commonMaterials = [
 'Oil Paint', 'Acrylic Paint', 'Watercolor', 'Canvas', 'Paper', 'Clay',
 'Wood', 'Metal', 'Digital', 'Pencil', 'Charcoal', 'Ink', 'Pastel'
 ];

 // Effect to save orders to localStorage
 useEffect(() => {
 localStorage.setItem('orders', JSON.stringify(orders));
 }, [orders]);

 // Effect for dark mode
 useEffect(() => {
 if (isDarkMode) {
 document.documentElement.classList.add('dark');
 localStorage.setItem('darkMode', 'true');
 } else {
 document.documentElement.classList.remove('dark');
 localStorage.setItem('darkMode', 'false');
 }
 }, [isDarkMode]);

 // Effect for notification timeout
 useEffect(() => {
 if (notification) {
 const timer = setTimeout(() => {
 setNotification(null);
 }, 3000);
 return () => clearTimeout(timer);
 }
 }, [notification]);

 // Open modal for creating new order
 const openCreateModal = () => {
 reset();
 setEditingOrderId(null);
 setSelectedMaterials([]);
 setIsModalOpen(true);
 };

 // Open modal for editing order
 const openEditModal = (order: Order) => {
 setEditingOrderId(order.id);
 setValue('clientName', order.clientName);
 setValue('description', order.description);
 setValue('price', order.price);
 setValue('depositPaid', order.depositPaid);
 setValue('dueDate', order.dueDate.split('T')[0]); // Format date for input
 setValue('status', order.status);
 setValue('artType', order.artType);
 setValue('materials', order.materials.join(', '));
 setValue('size', order.size || '');
 setValue('notes', order.notes || '');
 setSelectedMaterials(order.materials);
 setIsModalOpen(true);
 };

 // Close modal
 const closeModal = () => {
 setIsModalOpen(false);
 reset();
 setSelectedMaterials([]);
 };

 // Add material to selected list
 const addMaterial = () => {
 if (newMaterial && !selectedMaterials.includes(newMaterial)) {
 setSelectedMaterials([...selectedMaterials, newMaterial]);
 setNewMaterial('');
 }
 };

 // Remove material from selected list
 const removeMaterial = (material: string) => {
 setSelectedMaterials(selectedMaterials.filter(m => m !== material));
 };

 // Select material from common list
 const selectCommonMaterial = (material: string) => {
 if (!selectedMaterials.includes(material)) {
 setSelectedMaterials([...selectedMaterials, material]);
 }
 };

 // Handle form submit for creating or updating order
 const onSubmit: SubmitHandler<OrderFormInputs> = (data) => {
 if (selectedMaterials.length === 0) {
 setNotification({
 message: 'Please select at least one material',
 type: 'error'
 });
 return;
 }

 if (editingOrderId) {
 // Update existing order
 setOrders(orders.map(order => 
 order.id === editingOrderId ? {
 ...order,
 ...data,
 materials: selectedMaterials,
 dueDate: new Date(data.dueDate).toISOString()
 } : order
 ));
 setNotification({
 message: 'Bestelling succesvol bijgewerkt',
 type: 'success'
 });
 } else {
 // Create new order
 const newOrder: Order = {
 id: Date.now().toString(),
 ...data,
 materials: selectedMaterials,
 createdAt: new Date().toISOString(),
 dueDate: new Date(data.dueDate).toISOString()
 };
 setOrders([...orders, newOrder]);
 setNotification({
 message: 'Nieuwe bestelling succesvol toegevoegd',
 type: 'success'
 });
 }
 closeModal();
 };

 // Delete order
 const deleteOrder = (id: string) => {
 if (window.confirm('Weet je zeker dat je deze bestelling wilt verwijderen?')) {
 setOrders(orders.filter(order => order.id !== id));
 setNotification({
 message: 'Bestelling succesvol verwijderd',
 type: 'success'
 });
 }
 };

 // Handle sorting
 const handleSort = (field: keyof Order) => {
 setFilters(prev => ({
 ...prev,
 sortBy: field,
 sortDirection: prev.sortBy === field && prev.sortDirection === 'asc' ? 'desc' : 'asc'
 }));
 };

 // Filter and sort orders
 const filteredOrders = orders.filter(order => {
 const searchMatch = order.clientName.toLowerCase().includes(filters.search.toLowerCase()) ||
 order.description.toLowerCase().includes(filters.search.toLowerCase());
 const statusMatch = filters.status === 'all' || order.status === filters.status;
 const artTypeMatch = filters.artType === 'all' || order.artType === filters.artType;
 
 return searchMatch && statusMatch && artTypeMatch;
 }).sort((a, b) => {
 if (!filters.sortBy) return 0;
 
 const aValue = a[filters.sortBy];
 const bValue = b[filters.sortBy];
 
 if (typeof aValue === 'string' && typeof bValue === 'string') {
 return filters.sortDirection === 'asc' 
 ? aValue.localeCompare(bValue)
 : bValue.localeCompare(aValue);
 }
 
 if (typeof aValue === 'number' && typeof bValue === 'number') {
 return filters.sortDirection === 'asc' 
 ? aValue - bValue 
 : bValue - aValue;
 }
 
 if (aValue instanceof Date && bValue instanceof Date) {
 return filters.sortDirection === 'asc' 
 ? aValue.getTime() - bValue.getTime() 
 : bValue.getTime() - aValue.getTime();
 }
 
 return 0;
 });

 // Format currency
 const formatCurrency = (amount: number): string => {
 return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(amount);
 };

 // Format date
 const formatDate = (dateString: string): string => {
 try {
 return format(parseISO(dateString), 'd MMMM yyyy', { locale: nl });
 } catch (error) {
 return 'Ongeldige datum';
 }
 };

 // Get status badge class
 const getStatusBadgeClass = (status: Status): string => {
 switch (status) {
 case 'pending':
 return 'badge badge-warning';
 case 'in-progress':
 return 'badge badge-info';
 case 'completed':
 return 'badge badge-success';
 case 'cancelled':
 return 'badge badge-error';
 default:
 return 'badge';
 }
 };

 // Get status label in Dutch
 const getStatusLabel = (status: Status): string => {
 switch (status) {
 case 'pending':
 return 'In afwachting';
 case 'in-progress':
 return 'In uitvoering';
 case 'completed':
 return 'Voltooid';
 case 'cancelled':
 return 'Geannuleerd';
 default:
 return status;
 }
 };

 // Get art type label in Dutch
 const getArtTypeLabel = (type: ArtType): string => {
 switch (type) {
 case 'painting':
 return 'Schilderij';
 case 'sculpture':
 return 'Sculptuur';
 case 'digital':
 return 'Digitaal';
 case 'mixed-media':
 return 'Gemengde media';
 case 'other':
 return 'Overig';
 default:
 return type;
 }
 };

 // Reset filters
 const resetFilters = () => {
 setFilters({
 status: 'all',
 artType: 'all',
 search: '',
 sortBy: '',
 sortDirection: 'asc'
 });
 };

 // Toggle dark mode
 const toggleDarkMode = () => {
 setIsDarkMode(!isDarkMode);
 };

 return (
 <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 theme-transition-all">
 {/* Header */}
 <header className="bg-white dark:bg-gray-800 shadow">
 <div className="container-fluid py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
 <h1 className="text-2xl sm:text-3xl font-bold text-primary-600 dark:text-primary-400">
 Kunstenaar Bestellingen
 </h1>
 <div className="flex items-center space-x-4">
 <button 
 onClick={toggleDarkMode}
 className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
 aria-label={isDarkMode ? 'Schakel lichte modus in' : 'Schakel donkere modus in'}
 >
 {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
 </button>
 <button 
 onClick={openCreateModal} 
 className="btn btn-primary flex items-center space-x-2"
 aria-label="Nieuwe bestelling toevoegen"
 >
 <PlusCircle size={20} />
 <span className="hidden sm:inline">Nieuwe Bestelling</span>
 </button>
 </div>
 </div>
 </header>

 {/* Main content */}
 <main className="container-fluid py-6 px-4 sm:px-6 lg:px-8">
 {/* Notification */}
 {notification && (
 <div className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-error'} mb-6 flex items-center`}>
 {notification.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
 <p>{notification.message}</p>
 </div>
 )}

 {/* Search and filters */}
 <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
 <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 items-start md:items-center">
 <div className="flex-1 w-full md:w-auto relative">
 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
 <Search size={18} className="text-gray-400" />
 </div>
 <input
 type="text"
 placeholder="Zoek op naam of beschrijving..."
 className="input pl-10 w-full"
 value={filters.search}
 onChange={(e) => setFilters({...filters, search: e.target.value})}
 aria-label="Zoek bestellingen"
 />
 </div>
 
 <div className="flex space-x-2">
 <button 
 onClick={() => setIsFilterOpen(!isFilterOpen)}
 className="btn bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center space-x-2"
 aria-expanded={isFilterOpen}
 aria-controls="filter-panel"
 >
 <Filter size={18} />
 <span>Filters</span>
 {isFilterOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
 </button>
 
 {(filters.status !== 'all' || filters.artType !== 'all' || filters.sortBy !== '') && (
 <button 
 onClick={resetFilters}
 className="btn bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
 aria-label="Reset filters"
 >
 <X size={18} />
 </button>
 )}
 </div>
 </div>
 
 {isFilterOpen && (
 <div id="filter-panel" className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
 <div className="form-group">
 <label className="form-label">Status</label>
 <select 
 className="input"
 value={filters.status}
 onChange={(e) => setFilters({...filters, status: e.target.value as Status | 'all'})}
 aria-label="Filter op status"
 >
 <option value="all">Alle statussen</option>
 <option value="pending">In afwachting</option>
 <option value="in-progress">In uitvoering</option>
 <option value="completed">Voltooid</option>
 <option value="cancelled">Geannuleerd</option>
 </select>
 </div>
 
 <div className="form-group">
 <label className="form-label">Type kunst</label>
 <select 
 className="input"
 value={filters.artType}
 onChange={(e) => setFilters({...filters, artType: e.target.value as ArtType | 'all'})}
 aria-label="Filter op kunsttype"
 >
 <option value="all">Alle types</option>
 <option value="painting">Schilderij</option>
 <option value="sculpture">Sculptuur</option>
 <option value="digital">Digitaal</option>
 <option value="mixed-media">Gemengde media</option>
 <option value="other">Overig</option>
 </select>
 </div>
 
 <div className="form-group">
 <label className="form-label">Sorteren op</label>
 <select 
 className="input"
 value={filters.sortBy}
 onChange={(e) => setFilters({
 ...filters, 
 sortBy: e.target.value as keyof Order | '',
 sortDirection: 'asc'
 })}
 aria-label="Sorteren op"
 >
 <option value="">Geen sortering</option>
 <option value="clientName">Klantnaam</option>
 <option value="price">Prijs</option>
 <option value="createdAt">Aanmaakdatum</option>
 <option value="dueDate">Leverdatum</option>
 </select>
 </div>
 </div>
 )}
 </div>

 {/* Orders table */}
 <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
 {filteredOrders.length > 0 ? (
 <div className="overflow-x-auto">
 <table className="table w-full">
 <thead>
 <tr>
 <th className="table-header cursor-pointer" onClick={() => handleSort('clientName')}>
 <div className="flex items-center space-x-1">
 <span>Klant</span>
 {filters.sortBy === 'clientName' && (
 filters.sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
 )}
 </div>
 </th>
 <th className="table-header hidden md:table-cell">Beschrijving</th>
 <th className="table-header cursor-pointer" onClick={() => handleSort('price')}>
 <div className="flex items-center space-x-1">
 <span>Prijs</span>
 {filters.sortBy === 'price' && (
 filters.sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
 )}
 </div>
 </th>
 <th className="table-header hidden sm:table-cell">Type</th>
 <th className="table-header hidden lg:table-cell cursor-pointer" onClick={() => handleSort('dueDate')}>
 <div className="flex items-center space-x-1">
 <span>Leverdatum</span>
 {filters.sortBy === 'dueDate' && (
 filters.sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
 )}
 </div>
 </th>
 <th className="table-header">Status</th>
 <th className="table-header">Acties</th>
 </tr>
 </thead>
 <tbody>
 {filteredOrders.map((order) => (
 <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
 <td className="table-cell font-medium">{order.clientName}</td>
 <td className="table-cell hidden md:table-cell">
 <div className="truncate max-w-xs">{order.description}</div>
 </td>
 <td className="table-cell">{formatCurrency(order.price)}</td>
 <td className="table-cell hidden sm:table-cell">{getArtTypeLabel(order.artType)}</td>
 <td className="table-cell hidden lg:table-cell">{formatDate(order.dueDate)}</td>
 <td className="table-cell">
 <span className={getStatusBadgeClass(order.status)}>
 {getStatusLabel(order.status)}
 </span>
 </td>
 <td className="table-cell">
 <div className="flex space-x-2">
 <button 
 onClick={() => openEditModal(order)}
 className="btn btn-sm btn-primary"
 aria-label={`Bewerk bestelling van ${order.clientName}`}
 >
 <Edit size={16} />
 </button>
 <button 
 onClick={() => deleteOrder(order.id)}
 className="btn btn-sm bg-red-500 hover:bg-red-600 text-white"
 aria-label={`Verwijder bestelling van ${order.clientName}`}
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
 ) : (
 <div className="p-6 text-center">
 <p className="text-lg text-gray-500 dark:text-gray-400">
 {filters.search || filters.status !== 'all' || filters.artType !== 'all' ? 
 'Geen bestellingen gevonden met deze filters.' : 
 'Nog geen bestellingen. Klik op "Nieuwe Bestelling" om te beginnen.'}
 </p>
 </div>
 )}
 </div>

 {/* Order count summary */}
 <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
 Totaal: {filteredOrders.length} {filteredOrders.length === 1 ? 'bestelling' : 'bestellingen'} 
 {(filters.status !== 'all' || filters.artType !== 'all' || filters.search) && ` (gefilterd van ${orders.length})`}
 </div>

 {/* Stats cards */}
 <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 <div className="stat-card">
 <div className="stat-title">Totale omzet</div>
 <div className="stat-value">
 {formatCurrency(orders.reduce((sum, order) => sum + order.price, 0))}
 </div>
 <div className="stat-desc">
 Van {orders.length} {orders.length === 1 ? 'bestelling' : 'bestellingen'}
 </div>
 </div>
 
 <div className="stat-card">
 <div className="stat-title">In uitvoering</div>
 <div className="stat-value">
 {orders.filter(order => order.status === 'in-progress').length}
 </div>
 <div className="stat-desc">
 {((orders.filter(order => order.status === 'in-progress').length / (orders.length || 1)) * 100).toFixed(0)}% van totaal
 </div>
 </div>
 
 <div className="stat-card">
 <div className="stat-title">Voltooide werken</div>
 <div className="stat-value">
 {orders.filter(order => order.status === 'completed').length}
 </div>
 <div className="stat-desc">
 {((orders.filter(order => order.status === 'completed').length / (orders.length || 1)) * 100).toFixed(0)}% van totaal
 </div>
 </div>
 
 <div className="stat-card">
 <div className="stat-title">Populairste type</div>
 <div className="stat-value">
 {orders.length > 0 ? 
 getArtTypeLabel(Object.entries(
 orders.reduce((acc, order) => {
 acc[order.artType] = (acc[order.artType] || 0) + 1;
 return acc;
 }, {} as Record<ArtType, number>)
 ).sort((a, b) => b[1] - a[1])[0]?.[0] as ArtType || 'other') : 
 '-'}
 </div>
 <div className="stat-desc">
 Meest voorkomende kunsttype
 </div>
 </div>
 </div>
 </main>

 {/* Create/Edit Order Modal */}
 {isModalOpen && (
 <div className="modal-backdrop">
 <div className="modal-content max-w-3xl">
 <div className="modal-header">
 <h3 className="text-xl font-medium text-gray-900 dark:text-white">
 {editingOrderId ? 'Bestelling bewerken' : 'Nieuwe bestelling'}
 </h3>
 <button 
 onClick={closeModal}
 className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
 aria-label="Sluiten"
 >
 <X size={24} />
 </button>
 </div>
 
 <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="form-group">
 <label className="form-label" htmlFor="clientName">Klantnaam *</label>
 <input 
 id="clientName"
 type="text" 
 className={`input ${errors.clientName ? 'border-red-500 dark:border-red-500' : ''}`} 
 {...register('clientName', { required: 'Klantnaam is verplicht' })}
 aria-invalid={errors.clientName ? 'true' : 'false'}
 />
 {errors.clientName && <p className="form-error">{errors.clientName.message}</p>}
 </div>
 
 <div className="form-group">
 <label className="form-label" htmlFor="price">Prijs (€) *</label>
 <input 
 id="price"
 type="number" 
 step="0.01" 
 min="0"
 className={`input ${errors.price ? 'border-red-500 dark:border-red-500' : ''}`} 
 {...register('price', { 
 required: 'Prijs is verplicht',
 min: { value: 0, message: 'Prijs moet positief zijn' },
 valueAsNumber: true
 })}
 aria-invalid={errors.price ? 'true' : 'false'}
 />
 {errors.price && <p className="form-error">{errors.price.message}</p>}
 </div>
 
 <div className="form-group">
 <label className="form-label" htmlFor="status">Status *</label>
 <select 
 id="status"
 className={`input ${errors.status ? 'border-red-500 dark:border-red-500' : ''}`} 
 {...register('status', { required: 'Status is verplicht' })}
 aria-invalid={errors.status ? 'true' : 'false'}
 >
 <option value="pending">In afwachting</option>
 <option value="in-progress">In uitvoering</option>
 <option value="completed">Voltooid</option>
 <option value="cancelled">Geannuleerd</option>
 </select>
 {errors.status && <p className="form-error">{errors.status.message}</p>}
 </div>
 
 <div className="form-group">
 <label className="form-label" htmlFor="artType">Type kunst *</label>
 <select 
 id="artType"
 className={`input ${errors.artType ? 'border-red-500 dark:border-red-500' : ''}`} 
 {...register('artType', { required: 'Type kunst is verplicht' })}
 aria-invalid={errors.artType ? 'true' : 'false'}
 >
 <option value="painting">Schilderij</option>
 <option value="sculpture">Sculptuur</option>
 <option value="digital">Digitaal</option>
 <option value="mixed-media">Gemengde media</option>
 <option value="other">Overig</option>
 </select>
 {errors.artType && <p className="form-error">{errors.artType.message}</p>}
 </div>
 
 <div className="form-group">
 <label className="form-label" htmlFor="dueDate">Leverdatum *</label>
 <input 
 id="dueDate"
 type="date" 
 className={`input ${errors.dueDate ? 'border-red-500 dark:border-red-500' : ''}`} 
 {...register('dueDate', { required: 'Leverdatum is verplicht' })}
 aria-invalid={errors.dueDate ? 'true' : 'false'}
 />
 {errors.dueDate && <p className="form-error">{errors.dueDate.message}</p>}
 </div>
 
 <div className="form-group">
 <label className="form-label" htmlFor="size">Afmetingen</label>
 <input 
 id="size"
 type="text" 
 placeholder="bijv. 60x80 cm"
 className="input" 
 {...register('size')}
 />
 </div>
 
 <div className="form-group md:col-span-2">
 <label className="form-label">Materialen *</label>
 
 <div className="flex flex-wrap items-center gap-2 mb-2">
 {selectedMaterials.map((material, index) => (
 <div key={index} className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1">
 <span className="text-sm">{material}</span>
 <button 
 type="button" 
 onClick={() => removeMaterial(material)}
 className="ml-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
 aria-label={`Verwijder ${material}`}
 >
 <X size={14} />
 </button>
 </div>
 ))}
 </div>
 
 <div className="flex gap-2 mt-2">
 <input 
 type="text" 
 value={newMaterial}
 onChange={(e) => setNewMaterial(e.target.value)}
 placeholder="Voeg materiaal toe..."
 className="input flex-1" 
 aria-label="Nieuw materiaal"
 />
 <button 
 type="button" 
 onClick={addMaterial}
 className="btn btn-secondary"
 disabled={!newMaterial}
 aria-label="Materiaal toevoegen"
 >
 Toevoegen
 </button>
 </div>
 
 <div className="mt-3">
 <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Veelgebruikte materialen:</p>
 <div className="flex flex-wrap gap-2">
 {commonMaterials.map((material, index) => (
 <button 
 key={index} 
 type="button" 
 onClick={() => selectCommonMaterial(material)}
 className={`text-xs px-2 py-1 rounded-full ${selectedMaterials.includes(material) ? 
 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' : 
 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'}`}
 disabled={selectedMaterials.includes(material)}
 aria-label={`Kies ${material}`}
 aria-pressed={selectedMaterials.includes(material)}
 >
 {material}
 </button>
 ))}
 </div>
 </div>
 </div>
 
 <div className="form-group md:col-span-2">
 <label className="form-label" htmlFor="description">Beschrijving *</label>
 <textarea 
 id="description"
 rows={3} 
 className={`input ${errors.description ? 'border-red-500 dark:border-red-500' : ''}`} 
 {...register('description', { required: 'Beschrijving is verplicht' })}
 aria-invalid={errors.description ? 'true' : 'false'}
 ></textarea>
 {errors.description && <p className="form-error">{errors.description.message}</p>}
 </div>
 
 <div className="form-group md:col-span-2">
 <label className="form-label" htmlFor="notes">Notities</label>
 <textarea 
 id="notes"
 rows={3} 
 className="input" 
 {...register('notes')}
 placeholder="Optionele aantekeningen..."
 ></textarea>
 </div>
 
 <div className="form-group">
 <div className="flex items-center">
 <input 
 id="depositPaid"
 type="checkbox" 
 className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800" 
 {...register('depositPaid')}
 />
 <label htmlFor="depositPaid" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
 Aanbetaling ontvangen
 </label>
 </div>
 </div>
 </div>
 
 <div className="modal-footer">
 <button 
 type="button" 
 onClick={closeModal}
 className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
 >
 Annuleren
 </button>
 <button type="submit" className="btn btn-primary">
 {editingOrderId ? 'Opslaan' : 'Toevoegen'}
 </button>
 </div>
 </form>
 </div>
 </div>
 )}

 {/* Footer */}
 <footer className="bg-white dark:bg-gray-800 shadow py-6 mt-12">
 <div className="container-fluid px-4 sm:px-6 lg:px-8 text-center text-gray-500 dark:text-gray-400 text-sm">
 Copyright &copy; 2025 of Datavtar Private Limited. All rights reserved.
 </div>
 </footer>
 </div>
 );
};

export default App;