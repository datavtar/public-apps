import React, { useState, useEffect, useMemo } from 'react';
import styles from './styles/styles.module.css';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import {
 Truck,
 Ship,
 Plane,
 Search,
 Filter,
 Plus,
 Edit,
 Trash2,
 Package,
 ChevronDown,
 Sun,
 Moon,
 MapPin,
 AlertTriangle,
 CheckCircle,
 Clock,
 MoreHorizontal,
 RefreshCw,
 X,
 Download,
 ChevronLeft,
 ChevronRight,
 ArrowUpDown
} from 'lucide-react';

// Define types for the application
type ShipmentStatus = 'Delivered' | 'In Transit' | 'Delayed' | 'Scheduled';
type TransportMode = 'Sea' | 'Air' | 'Land';
type Priority = 'High' | 'Medium' | 'Low';

interface Shipment {
 id: string;
 trackingNumber: string;
 origin: string;
 destination: string;
 departureDate: Date;
 estimatedArrival: Date;
 status: ShipmentStatus;
 transportMode: TransportMode;
 carrier: string;
 priority: Priority;
 weight: number;
 items: number;
 notes?: string;
 lastUpdated: Date;
}

interface FilterOptions {
 status: ShipmentStatus | 'All';
 transportMode: TransportMode | 'All';
 priority: Priority | 'All';
 date: 'All' | 'Today' | 'This Week' | 'This Month';
}

type SortKey = keyof Omit<Shipment, 'notes'>;
type SortDirection = 'asc' | 'desc';

interface SortOption {
 key: SortKey;
 direction: SortDirection;
}

interface ShipmentFormData {
 trackingNumber: string;
 origin: string;
 destination: string;
 departureDate: string;
 estimatedArrival: string;
 status: ShipmentStatus;
 transportMode: TransportMode;
 carrier: string;
 priority: Priority;
 weight: number;
 items: number;
 notes?: string;
}

// Mock data generator function
const generateMockShipments = (): Shipment[] => {
 const origins = [
 'Shanghai, China',
 'Rotterdam, Netherlands',
 'Los Angeles, USA',
 'Singapore',
 'Dubai, UAE',
 'Mumbai, India',
 'Hamburg, Germany',
 'Antwerp, Belgium',
 'Tokyo, Japan',
 'Busan, South Korea'
 ];

 const destinations = [
 'New York, USA',
 'Hong Kong',
 'Valencia, Spain',
 'Sydney, Australia',
 'Cape Town, South Africa',
 'Santos, Brazil',
 'London, UK',
 'Montreal, Canada',
 'Colombo, Sri Lanka',
 'Auckland, New Zealand'
 ];

 const carriers = [
 'Maersk',
 'MSC Mediterranean Shipping',
 'COSCO Shipping',
 'CMA CGM',
 'Hapag-Lloyd',
 'ONE (Ocean Network Express)',
 'Evergreen Marine',
 'HMM Co Ltd',
 'Yang Ming Marine Transport',
 'FedEx',
 'DHL',
 'UPS'
 ];

 const statuses: ShipmentStatus[] = ['Delivered', 'In Transit', 'Delayed', 'Scheduled'];
 const transportModes: TransportMode[] = ['Sea', 'Air', 'Land'];
 const priorities: Priority[] = ['High', 'Medium', 'Low'];

 return Array.from({ length: 30 }, (_, i) => {
 const departureDate = new Date();
 departureDate.setDate(departureDate.getDate() - Math.floor(Math.random() * 10));
 
 const estimatedArrival = new Date(departureDate);
 estimatedArrival.setDate(estimatedArrival.getDate() + Math.floor(Math.random() * 30) + 5);
 
 const lastUpdated = new Date();
 lastUpdated.setHours(lastUpdated.getHours() - Math.floor(Math.random() * 24));

 const transportMode = transportModes[Math.floor(Math.random() * transportModes.length)];
 
 return {
 id: `SHP-${100000 + i}`,
 trackingNumber: `TRK-${Math.floor(Math.random() * 100000000)}`,
 origin: origins[Math.floor(Math.random() * origins.length)],
 destination: destinations[Math.floor(Math.random() * destinations.length)],
 departureDate,
 estimatedArrival,
 status: statuses[Math.floor(Math.random() * statuses.length)],
 transportMode,
 carrier: carriers[Math.floor(Math.random() * carriers.length)],
 priority: priorities[Math.floor(Math.random() * priorities.length)],
 weight: Math.floor(Math.random() * 5000) + 100,
 items: Math.floor(Math.random() * 100) + 1,
 notes: Math.random() > 0.7 ? `Note for shipment ${i+1}` : undefined,
 lastUpdated
 };
 });
};

const App: React.FC = () => {
 // Theme management
 const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
 if (typeof window !== 'undefined') {
 const savedMode = localStorage.getItem('darkMode');
 return savedMode === 'true' || 
 (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
 }
 return false;
 });

 // State for shipments and UI
 const [shipments, setShipments] = useState<Shipment[]>([]);
 const [loading, setLoading] = useState<boolean>(true);
 const [searchTerm, setSearchTerm] = useState<string>('');
 const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
 const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
 const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
 const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
 const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<boolean>(false);
 const [filterOpen, setFilterOpen] = useState<boolean>(false);
 const [currentPage, setCurrentPage] = useState<number>(1);
 const pageSize = 10;

 // Sort and filter states
 const [sortOption, setSortOption] = useState<SortOption>({ key: 'departureDate', direction: 'desc' });
 const [filterOptions, setFilterOptions] = useState<FilterOptions>({
 status: 'All',
 transportMode: 'All',
 priority: 'All',
 date: 'All'
 });

 // Form initialization
 const { register, handleSubmit, reset, formState: { errors } } = useForm<ShipmentFormData>();

 // Load mock data on initial render
 useEffect(() => {
 const loadData = async () => {
 try {
 setLoading(true);
 // Simulate API call delay
 await new Promise(resolve => setTimeout(resolve, 800));
 const data = generateMockShipments();
 setShipments(data);
 } catch (error) {
 console.error('Error loading shipments:', error);
 } finally {
 setLoading(false);
 }
 };

 loadData();
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

 // Filter and sort shipments
 const filteredShipments = useMemo(() => {
 let filtered = [...shipments];

 // Apply search filter
 if (searchTerm) {
 const lowerSearchTerm = searchTerm.toLowerCase();
 filtered = filtered.filter(shipment => {
 return (
 shipment.id.toLowerCase().includes(lowerSearchTerm) ||
 shipment.trackingNumber.toLowerCase().includes(lowerSearchTerm) ||
 shipment.origin.toLowerCase().includes(lowerSearchTerm) ||
 shipment.destination.toLowerCase().includes(lowerSearchTerm) ||
 shipment.carrier.toLowerCase().includes(lowerSearchTerm)
 );
 });
 }

 // Apply status filter
 if (filterOptions.status !== 'All') {
 filtered = filtered.filter(shipment => shipment.status === filterOptions.status);
 }

 // Apply transport mode filter
 if (filterOptions.transportMode !== 'All') {
 filtered = filtered.filter(shipment => shipment.transportMode === filterOptions.transportMode);
 }

 // Apply priority filter
 if (filterOptions.priority !== 'All') {
 filtered = filtered.filter(shipment => shipment.priority === filterOptions.priority);
 }

 // Apply date filter
 if (filterOptions.date !== 'All') {
 const today = new Date();
 today.setHours(0, 0, 0, 0);
 
 const thisWeekStart = new Date(today);
 thisWeekStart.setDate(today.getDate() - today.getDay());
 
 const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
 
 filtered = filtered.filter(shipment => {
 const departureDate = new Date(shipment.departureDate);
 departureDate.setHours(0, 0, 0, 0);
 
 switch (filterOptions.date) {
 case 'Today':
 return departureDate.getTime() === today.getTime();
 case 'This Week':
 return departureDate >= thisWeekStart;
 case 'This Month':
 return departureDate >= thisMonthStart;
 default:
 return true;
 }
 });
 }

 // Sort the filtered shipments
 filtered.sort((a, b) => {
 const { key, direction } = sortOption;
 let aValue = a[key];
 let bValue = b[key];
 
 // Handle date comparison
 if (aValue instanceof Date && bValue instanceof Date) {
 return direction === 'asc' 
 ? aValue.getTime() - bValue.getTime() 
 : bValue.getTime() - aValue.getTime();
 }
 
 // Handle string comparison
 if (typeof aValue === 'string' && typeof bValue === 'string') {
 return direction === 'asc' 
 ? aValue.localeCompare(bValue) 
 : bValue.localeCompare(aValue);
 }
 
 // Handle number comparison
 return direction === 'asc' ? (aValue as number) - (bValue as number) : (bValue as number) - (aValue as number);
 });

 return filtered;
 }, [shipments, searchTerm, filterOptions, sortOption]);

 // Pagination logic
 const paginatedShipments = useMemo(() => {
 const startIndex = (currentPage - 1) * pageSize;
 return filteredShipments.slice(startIndex, startIndex + pageSize);
 }, [filteredShipments, currentPage]);

 const totalPages = Math.ceil(filteredShipments.length / pageSize);

 // Event handlers
 const handleSort = (key: SortKey) => {
 setSortOption(prev => ({
 key,
 direction: prev.key === key ? (prev.direction === 'asc' ? 'desc' : 'asc') : 'asc'
 }));
 };

 const handleAddShipment = (data: ShipmentFormData) => {
 const newShipment: Shipment = {
 id: `SHP-${Math.floor(Math.random() * 900000) + 100000}`,
 trackingNumber: data.trackingNumber,
 origin: data.origin,
 destination: data.destination,
 departureDate: new Date(data.departureDate),
 estimatedArrival: new Date(data.estimatedArrival),
 status: data.status,
 transportMode: data.transportMode,
 carrier: data.carrier,
 priority: data.priority,
 weight: data.weight,
 items: data.items,
 notes: data.notes,
 lastUpdated: new Date()
 };

 setShipments(prev => [newShipment, ...prev]);
 setIsAddModalOpen(false);
 reset();
 };

 const handleEditShipment = (data: ShipmentFormData) => {
 if (!selectedShipment) return;

 const updatedShipment: Shipment = {
 ...selectedShipment,
 trackingNumber: data.trackingNumber,
 origin: data.origin,
 destination: data.destination,
 departureDate: new Date(data.departureDate),
 estimatedArrival: new Date(data.estimatedArrival),
 status: data.status,
 transportMode: data.transportMode,
 carrier: data.carrier,
 priority: data.priority,
 weight: data.weight,
 items: data.items,
 notes: data.notes,
 lastUpdated: new Date()
 };

 setShipments(prev => 
 prev.map(shipment => 
 shipment.id === selectedShipment.id ? updatedShipment : shipment
 )
 );
 setIsEditModalOpen(false);
 setSelectedShipment(null);
 reset();
 };

 const handleDeleteShipment = () => {
 if (!selectedShipment) return;

 setShipments(prev => 
 prev.filter(shipment => shipment.id !== selectedShipment.id)
 );
 setIsDeleteConfirmOpen(false);
 setSelectedShipment(null);
 };

 const openAddModal = () => {
 reset();
 setIsAddModalOpen(true);
 };

 const openEditModal = (shipment: Shipment) => {
 setSelectedShipment(shipment);
 reset({
 trackingNumber: shipment.trackingNumber,
 origin: shipment.origin,
 destination: shipment.destination,
 departureDate: format(shipment.departureDate, 'yyyy-MM-dd'),
 estimatedArrival: format(shipment.estimatedArrival, 'yyyy-MM-dd'),
 status: shipment.status,
 transportMode: shipment.transportMode,
 carrier: shipment.carrier,
 priority: shipment.priority,
 weight: shipment.weight,
 items: shipment.items,
 notes: shipment.notes || ''
 });
 setIsEditModalOpen(true);
 };

 const openDetailsModal = (shipment: Shipment) => {
 setSelectedShipment(shipment);
 setIsDetailModalOpen(true);
 };

 const openDeleteConfirm = (shipment: Shipment) => {
 setSelectedShipment(shipment);
 setIsDeleteConfirmOpen(true);
 };

 const refreshData = async () => {
 setLoading(true);
 await new Promise(resolve => setTimeout(resolve, 500));
 const data = generateMockShipments();
 setShipments(data);
 setLoading(false);
 };

 const toggleFilter = () => {
 setFilterOpen(!filterOpen);
 };

 const resetFilters = () => {
 setFilterOptions({
 status: 'All',
 transportMode: 'All',
 priority: 'All',
 date: 'All'
 });
 setSearchTerm('');
 setCurrentPage(1);
 };

 const getTransportModeIcon = (mode: TransportMode) => {
 switch (mode) {
 case 'Sea':
 return <Ship size={18} className="text-blue-500" />;
 case 'Air':
 return <Plane size={18} className="text-sky-500" />;
 case 'Land':
 return <Truck size={18} className="text-green-500" />;
 }
 };

 const getStatusBadgeClass = (status: ShipmentStatus) => {
 switch (status) {
 case 'Delivered':
 return 'badge badge-success';
 case 'In Transit':
 return 'badge badge-info';
 case 'Delayed':
 return 'badge badge-error';
 case 'Scheduled':
 return 'badge badge-warning';
 }
 };

 const getStatusIcon = (status: ShipmentStatus) => {
 switch (status) {
 case 'Delivered':
 return <CheckCircle size={14} />;
 case 'In Transit':
 return <Clock size={14} />;
 case 'Delayed':
 return <AlertTriangle size={14} />;
 case 'Scheduled':
 return <Clock size={14} />;
 }
 };

 const getPriorityBadgeClass = (priority: Priority) => {
 switch (priority) {
 case 'High':
 return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500';
 case 'Medium':
 return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-500';
 case 'Low':
 return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500';
 }
 };

 // Shipment Stats
 const shipmentStats = useMemo(() => {
 return {
 total: shipments.length,
 delivered: shipments.filter(s => s.status === 'Delivered').length,
 inTransit: shipments.filter(s => s.status === 'In Transit').length,
 delayed: shipments.filter(s => s.status === 'Delayed').length,
 scheduled: shipments.filter(s => s.status === 'Scheduled').length,
 sea: shipments.filter(s => s.transportMode === 'Sea').length,
 air: shipments.filter(s => s.transportMode === 'Air').length,
 land: shipments.filter(s => s.transportMode === 'Land').length,
 };
 }, [shipments]);

 return (
 <div className="min-h-screen bg-gray-50 dark:bg-gray-900 theme-transition">
 {/* Header */}
 <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm theme-transition">
 <div className="container-fluid py-3 px-4 sm:px-6 lg:px-8">
 <div className="flex items-center justify-between">
 <div className="flex items-center space-x-3">
 <Package className="text-primary-600 dark:text-primary-400" size={24} />
 <h1 className="text-xl font-bold text-gray-900 dark:text-white">Global Shipment Tracker</h1>
 </div>
 
 <div className="flex items-center space-x-4">
 <button 
 className="theme-toggle flex items-center justify-center w-10 h-10 rounded-full focus:outline-none"
 onClick={() => setIsDarkMode(!isDarkMode)}
 aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
 >
 {isDarkMode ? (
 <Sun size={20} className="text-gray-300 hover:text-white" />
 ) : (
 <Moon size={20} className="text-gray-600 hover:text-gray-900" />
 )}
 </button>
 
 <span className="hidden md:inline text-sm text-gray-600 dark:text-gray-300">
 Logistics Management Portal
 </span>
 </div>
 </div>
 </div>
 </header>

 {/* Dashboard Content */}
 <main className="container-fluid py-6 px-4 sm:px-6 lg:px-8">
 {/* Stats Overview */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
 <div className="stat-card bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500">
 <div className="stat-title text-green-800 dark:text-green-300">Delivered</div>
 <div className="stat-value text-green-600 dark:text-green-400">{shipmentStats.delivered}</div>
 <div className="stat-desc flex items-center text-green-700 dark:text-green-300">
 <CheckCircle size={14} className="mr-1" /> Completed Shipments
 </div>
 </div>

 <div className="stat-card bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500">
 <div className="stat-title text-blue-800 dark:text-blue-300">In Transit</div>
 <div className="stat-value text-blue-600 dark:text-blue-400">{shipmentStats.inTransit}</div>
 <div className="stat-desc flex items-center text-blue-700 dark:text-blue-300">
 <Clock size={14} className="mr-1" /> On the way
 </div>
 </div>

 <div className="stat-card bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500">
 <div className="stat-title text-amber-800 dark:text-amber-300">Scheduled</div>
 <div className="stat-value text-amber-600 dark:text-amber-400">{shipmentStats.scheduled}</div>
 <div className="stat-desc flex items-center text-amber-700 dark:text-amber-300">
 <Clock size={14} className="mr-1" /> Upcoming shipments
 </div>
 </div>

 <div className="stat-card bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500">
 <div className="stat-title text-red-800 dark:text-red-300">Delayed</div>
 <div className="stat-value text-red-600 dark:text-red-400">{shipmentStats.delayed}</div>
 <div className="stat-desc flex items-center text-red-700 dark:text-red-300">
 <AlertTriangle size={14} className="mr-1" /> Needs attention
 </div>
 </div>
 </div>

 {/* Transport Mode Stats */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
 <div className="card bg-white dark:bg-gray-800 flex flex-row items-center">
 <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-l-lg">
 <Ship size={32} className="text-blue-600 dark:text-blue-400" />
 </div>
 <div className="p-4">
 <h3 className="text-lg font-medium text-gray-900 dark:text-white">Sea Freight</h3>
 <p className="text-2xl font-bold text-gray-900 dark:text-white">{shipmentStats.sea}</p>
 <p className="text-sm text-gray-500 dark:text-gray-400">Total sea shipments</p>
 </div>
 </div>

 <div className="card bg-white dark:bg-gray-800 flex flex-row items-center">
 <div className="p-4 bg-sky-100 dark:bg-sky-900/30 rounded-l-lg">
 <Plane size={32} className="text-sky-600 dark:text-sky-400" />
 </div>
 <div className="p-4">
 <h3 className="text-lg font-medium text-gray-900 dark:text-white">Air Freight</h3>
 <p className="text-2xl font-bold text-gray-900 dark:text-white">{shipmentStats.air}</p>
 <p className="text-sm text-gray-500 dark:text-gray-400">Total air shipments</p>
 </div>
 </div>

 <div className="card bg-white dark:bg-gray-800 flex flex-row items-center">
 <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-l-lg">
 <Truck size={32} className="text-green-600 dark:text-green-400" />
 </div>
 <div className="p-4">
 <h3 className="text-lg font-medium text-gray-900 dark:text-white">Land Freight</h3>
 <p className="text-2xl font-bold text-gray-900 dark:text-white">{shipmentStats.land}</p>
 <p className="text-sm text-gray-500 dark:text-gray-400">Total land shipments</p>
 </div>
 </div>
 </div>

 {/* Shipment Table Section */}
 <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
 {/* Table Header with Search and Filters */}
 <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
 <div className="sm:flex sm:justify-between sm:items-center">
 <div className="mb-4 sm:mb-0">
 <h2 className="text-lg font-medium text-gray-900 dark:text-white">Shipments</h2>
 <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
 Showing {paginatedShipments.length} of {filteredShipments.length} shipments
 </p>
 </div>
 <div className="flex flex-col sm:flex-row gap-3">
 <div className="relative">
 <input
 type="text"
 className="input pl-10"
 placeholder="Search shipments..."
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 aria-label="Search shipments"
 />
 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
 </div>
 <div className="flex gap-2">
 <button 
 className="btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600"
 onClick={toggleFilter}
 aria-label="Filter shipments"
 >
 <Filter size={18} className="mr-1" />
 <span>Filter</span>
 </button>
 <button 
 className="btn btn-primary"
 onClick={openAddModal}
 aria-label="Add new shipment"
 >
 <Plus size={18} className="mr-1" />
 <span>New</span>
 </button>
 <button
 className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
 onClick={refreshData}
 aria-label="Refresh data"
 >
 <RefreshCw size={18} />
 </button>
 </div>
 </div>
 </div>

 {/* Filter Options Panel */}
 {filterOpen && (
 <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
 <div className="flex justify-between items-center mb-3">
 <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter Shipments</h3>
 <button 
 className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
 onClick={toggleFilter}
 aria-label="Close filter panel"
 >
 <X size={18} />
 </button>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
 <div className="form-group">
 <label className="form-label text-sm">Status</label>
 <select 
 className="input"
 value={filterOptions.status}
 onChange={(e) => setFilterOptions({...filterOptions, status: e.target.value as ShipmentStatus | 'All'})}
 >
 <option value="All">All Statuses</option>
 <option value="Delivered">Delivered</option>
 <option value="In Transit">In Transit</option>
 <option value="Delayed">Delayed</option>
 <option value="Scheduled">Scheduled</option>
 </select>
 </div>
 <div className="form-group">
 <label className="form-label text-sm">Transport Mode</label>
 <select 
 className="input"
 value={filterOptions.transportMode}
 onChange={(e) => setFilterOptions({...filterOptions, transportMode: e.target.value as TransportMode | 'All'})}
 >
 <option value="All">All Modes</option>
 <option value="Sea">Sea</option>
 <option value="Air">Air</option>
 <option value="Land">Land</option>
 </select>
 </div>
 <div className="form-group">
 <label className="form-label text-sm">Priority</label>
 <select 
 className="input"
 value={filterOptions.priority}
 onChange={(e) => setFilterOptions({...filterOptions, priority: e.target.value as Priority | 'All'})}
 >
 <option value="All">All Priorities</option>
 <option value="High">High</option>
 <option value="Medium">Medium</option>
 <option value="Low">Low</option>
 </select>
 </div>
 <div className="form-group">
 <label className="form-label text-sm">Departure Date</label>
 <select 
 className="input"
 value={filterOptions.date}
 onChange={(e) => setFilterOptions({...filterOptions, date: e.target.value as 'All' | 'Today' | 'This Week' | 'This Month'})}
 >
 <option value="All">All Dates</option>
 <option value="Today">Today</option>
 <option value="This Week">This Week</option>
 <option value="This Month">This Month</option>
 </select>
 </div>
 </div>
 <div className="flex justify-end mt-4">
 <button 
 className="btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600 mr-2"
 onClick={resetFilters}
 >
 Reset
 </button>
 <button 
 className="btn btn-primary"
 onClick={toggleFilter}
 >
 Apply Filters
 </button>
 </div>
 </div>
 )}
 </div>

 {/* Shipments Table */}
 <div className="table-container">
 {loading ? (
 <div className="p-8 text-center">
 <div className="flex justify-center">
 <div className={styles.spinner}></div>
 </div>
 <p className="mt-4 text-gray-500 dark:text-gray-400">Loading shipments...</p>
 </div>
 ) : paginatedShipments.length === 0 ? (
 <div className="p-8 text-center">
 <PackageIcon size={48} className="mx-auto text-gray-400 dark:text-gray-600" />
 <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No shipments found</h3>
 <p className="mt-1 text-gray-500 dark:text-gray-400">
 {filteredShipments.length === 0 
 ? "There are no shipments in the system yet." 
 : "No shipments match your current filters."}
 </p>
 {filteredShipments.length === 0 ? (
 <button 
 className="mt-4 btn btn-primary"
 onClick={openAddModal}
 >
 <Plus size={18} className="mr-1" />
 Add New Shipment
 </button>
 ) : (
 <button 
 className="mt-4 btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600"
 onClick={resetFilters}
 >
 Clear Filters
 </button>
 )}
 </div>
 ) : (
 <table className="table">
 <thead>
 <tr>
 <th 
 className="table-header cursor-pointer"
 onClick={() => handleSort('id')}
 >
 <div className="flex items-center">
 ID
 {sortOption.key === 'id' && (
 <ArrowUpDown size={14} className="ml-1" />
 )}
 </div>
 </th>
 <th className="table-header cursor-pointer" onClick={() => handleSort('trackingNumber')}>
 <div className="flex items-center">
 Tracking #
 {sortOption.key === 'trackingNumber' && (
 <ArrowUpDown size={14} className="ml-1" />
 )}
 </div>
 </th>
 <th className="table-header hidden md:table-cell">
 <div className="flex items-center">
 Route
 </div>
 </th>
 <th 
 className="table-header cursor-pointer"
 onClick={() => handleSort('departureDate')}
 >
 <div className="flex items-center">
 Departure
 {sortOption.key === 'departureDate' && (
 <ArrowUpDown size={14} className="ml-1" />
 )}
 </div>
 </th>
 <th 
 className="table-header hidden lg:table-cell cursor-pointer"
 onClick={() => handleSort('estimatedArrival')}
 >
 <div className="flex items-center">
 ETA
 {sortOption.key === 'estimatedArrival' && (
 <ArrowUpDown size={14} className="ml-1" />
 )}
 </div>
 </th>
 <th 
 className="table-header cursor-pointer"
 onClick={() => handleSort('status')}
 >
 <div className="flex items-center">
 Status
 {sortOption.key === 'status' && (
 <ArrowUpDown size={14} className="ml-1" />
 )}
 </div>
 </th>
 <th className="table-header hidden sm:table-cell">
 <div className="flex items-center">
 Transport
 </div>
 </th>
 <th 
 className="table-header hidden lg:table-cell cursor-pointer"
 onClick={() => handleSort('priority')}
 >
 <div className="flex items-center">
 Priority
 {sortOption.key === 'priority' && (
 <ArrowUpDown size={14} className="ml-1" />
 )}
 </div>
 </th>
 <th className="table-header text-right">Actions</th>
 </tr>
 </thead>
 <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
 {paginatedShipments.map((shipment) => (
 <tr 
 key={shipment.id} 
 className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
 onClick={() => openDetailsModal(shipment)}
 >
 <td className="table-cell font-medium">{shipment.id}</td>
 <td className="table-cell">{shipment.trackingNumber}</td>
 <td className="table-cell hidden md:table-cell">
 <div className="flex flex-col">
 <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
 <MapPin size={14} className="mr-1 text-gray-400" />
 {shipment.origin}
 </div>
 <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mt-1">
 <MapPin size={14} className="mr-1 text-gray-400" />
 {shipment.destination}
 </div>
 </div>
 </td>
 <td className="table-cell whitespace-nowrap">
 {format(shipment.departureDate, 'MMM dd, yyyy')}
 </td>
 <td className="table-cell hidden lg:table-cell whitespace-nowrap">
 {format(shipment.estimatedArrival, 'MMM dd, yyyy')}
 </td>
 <td className="table-cell">
 <span className={getStatusBadgeClass(shipment.status)}>
 {getStatusIcon(shipment.status)}
 <span className="ml-1">{shipment.status}</span>
 </span>
 </td>
 <td className="table-cell hidden sm:table-cell">
 <div className="flex items-center">
 {getTransportModeIcon(shipment.transportMode)}
 <span className="ml-1">{shipment.transportMode}</span>
 </div>
 </td>
 <td className="table-cell hidden lg:table-cell">
 <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityBadgeClass(shipment.priority)}`}>
 {shipment.priority}
 </span>
 </td>
 <td className="table-cell text-right" onClick={(e) => e.stopPropagation()}>
 <div className="flex justify-end space-x-2">
 <button 
 className="btn-sm bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
 onClick={(e) => {
 e.stopPropagation();
 openEditModal(shipment);
 }}
 aria-label="Edit shipment"
 >
 <Edit size={14} />
 </button>
 <button 
 className="btn-sm bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
 onClick={(e) => {
 e.stopPropagation();
 openDeleteConfirm(shipment);
 }}
 aria-label="Delete shipment"
 >
 <Trash2 size={14} />
 </button>
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 )}
 </div>

 {/* Pagination */}
 {!loading && filteredShipments.length > 0 && (
 <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
 <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
 <div>
 <p className="text-sm text-gray-700 dark:text-gray-300">
 Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to{' '}
 <span className="font-medium">
 {Math.min(currentPage * pageSize, filteredShipments.length)}
 </span>{' '}
 of <span className="font-medium">{filteredShipments.length}</span> results
 </p>
 </div>
 <div>
 <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
 <button
 className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 dark:ring-gray-700 dark:hover:bg-gray-700/50 dark:text-gray-500"
 onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
 disabled={currentPage === 1}
 aria-label="Previous page"
 >
 <span className="sr-only">Previous</span>
 <ChevronLeft className="h-5 w-5" aria-hidden="true" />
 </button>
 
 {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
 const pageNum = currentPage > 3 ? currentPage - 3 + idx + 1 : idx + 1;
 return pageNum <= totalPages ? (
 <button
 key={pageNum}
 onClick={() => setCurrentPage(pageNum)}
 className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${currentPage === pageNum
 ? 'z-10 bg-primary-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
 : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 dark:ring-gray-700 dark:hover:bg-gray-700/50 dark:text-gray-200'}`}
 >
 {pageNum}
 </button>
 ) : null;
 })}
 
 <button
 className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 dark:ring-gray-700 dark:hover:bg-gray-700/50 dark:text-gray-500"
 onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
 disabled={currentPage === totalPages}
 aria-label="Next page"
 >
 <span className="sr-only">Next</span>
 <ChevronRight className="h-5 w-5" aria-hidden="true" />
 </button>
 </nav>
 </div>
 </div>

 <div className="flex sm:hidden">
 <button
 className="btn btn-sm bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 mr-2"
 onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
 disabled={currentPage === 1}
 >
 <ChevronLeft className="h-4 w-4" />
 </button>
 <span className="py-2 px-3 text-sm">Page {currentPage} of {totalPages}</span>
 <button
 className="btn btn-sm bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 ml-2"
 onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
 disabled={currentPage === totalPages}
 >
 <ChevronRight className="h-4 w-4" />
 </button>
 </div>
 </div>
 )}
 </div>
 </main>

 {/* Add Shipment Modal */}
 {isAddModalOpen && (
 <div className="modal-backdrop" onClick={() => setIsAddModalOpen(false)}>
 <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
 <div className="modal-header">
 <h3 className="text-lg font-medium text-gray-900 dark:text-white">Add New Shipment</h3>
 <button 
 className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
 onClick={() => setIsAddModalOpen(false)}
 aria-label="Close modal"
 >
 <X size={20} />
 </button>
 </div>
 <form onSubmit={handleSubmit(handleAddShipment)}>
 <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="form-group">
 <label className="form-label" htmlFor="trackingNumber">Tracking Number</label>
 <input 
 id="trackingNumber"
 type="text" 
 className="input"
 {...register('trackingNumber', { required: 'Tracking number is required' })}
 />
 {errors.trackingNumber && <p className="form-error">{errors.trackingNumber.message}</p>}
 </div>

 <div className="form-group">
 <label className="form-label" htmlFor="carrier">Carrier</label>
 <input 
 id="carrier"
 type="text" 
 className="input"
 {...register('carrier', { required: 'Carrier is required' })}
 />
 {errors.carrier && <p className="form-error">{errors.carrier.message}</p>}
 </div>

 <div className="form-group">
 <label className="form-label" htmlFor="origin">Origin</label>
 <input 
 id="origin"
 type="text" 
 className="input"
 {...register('origin', { required: 'Origin is required' })}
 />
 {errors.origin && <p className="form-error">{errors.origin.message}</p>}
 </div>

 <div className="form-group">
 <label className="form-label" htmlFor="destination">Destination</label>
 <input 
 id="destination"
 type="text" 
 className="input"
 {...register('destination', { required: 'Destination is required' })}
 />
 {errors.destination && <p className="form-error">{errors.destination.message}</p>}
 </div>

 <div className="form-group">
 <label className="form-label" htmlFor="departureDate">Departure Date</label>
 <input 
 id="departureDate"
 type="date" 
 className="input"
 {...register('departureDate', { required: 'Departure date is required' })}
 />
 {errors.departureDate && <p className="form-error">{errors.departureDate.message}</p>}
 </div>

 <div className="form-group">
 <label className="form-label" htmlFor="estimatedArrival">Estimated Arrival</label>
 <input 
 id="estimatedArrival"
 type="date" 
 className="input"
 {...register('estimatedArrival', { required: 'Estimated arrival is required' })}
 />
 {errors.estimatedArrival && <p className="form-error">{errors.estimatedArrival.message}</p>}
 </div>

 <div className="form-group">
 <label className="form-label" htmlFor="status">Status</label>
 <select 
 id="status"
 className="input"
 {...register('status', { required: 'Status is required' })}
 >
 <option value="Scheduled">Scheduled</option>
 <option value="In Transit">In Transit</option>
 <option value="Delayed">Delayed</option>
 <option value="Delivered">Delivered</option>
 </select>
 {errors.status && <p className="form-error">{errors.status.message}</p>}
 </div>

 <div className="form-group">
 <label className="form-label" htmlFor="transportMode">Transport Mode</label>
 <select 
 id="transportMode"
 className="input"
 {...register('transportMode', { required: 'Transport mode is required' })}
 >
 <option value="Sea">Sea</option>
 <option value="Air">Air</option>
 <option value="Land">Land</option>
 </select>
 {errors.transportMode && <p className="form-error">{errors.transportMode.message}</p>}
 </div>

 <div className="form-group">
 <label className="form-label" htmlFor="priority">Priority</label>
 <select 
 id="priority"
 className="input"
 {...register('priority', { required: 'Priority is required' })}
 >
 <option value="Low">Low</option>
 <option value="Medium">Medium</option>
 <option value="High">High</option>
 </select>
 {errors.priority && <p className="form-error">{errors.priority.message}</p>}
 </div>

 <div className="form-group">
 <label className="form-label" htmlFor="weight">Weight (kg)</label>
 <input 
 id="weight"
 type="number" 
 className="input"
 min="0"
 step="0.01"
 {...register('weight', { 
 required: 'Weight is required',
 valueAsNumber: true,
 min: { value: 0, message: 'Weight must be positive' }
 })}
 />
 {errors.weight && <p className="form-error">{errors.weight.message}</p>}
 </div>

 <div className="form-group">
 <label className="form-label" htmlFor="items">Number of Items</label>
 <input 
 id="items"
 type="number" 
 className="input"
 min="1"
 step="1"
 {...register('items', { 
 required: 'Number of items is required',
 valueAsNumber: true,
 min: { value: 1, message: 'Must have at least 1 item' }
 })}
 />
 {errors.items && <p className="form-error">{errors.items.message}</p>}
 </div>

 <div className="form-group md:col-span-2">
 <label className="form-label" htmlFor="notes">Notes</label>
 <textarea 
 id="notes"
 className="input h-24"
 {...register('notes')}
 ></textarea>
 </div>
 </div>

 <div className="modal-footer">
 <button 
 type="button"
 className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
 onClick={() => setIsAddModalOpen(false)}
 >
 Cancel
 </button>
 <button type="submit" className="btn btn-primary">
 Add Shipment
 </button>
 </div>
 </form>
 </div>
 </div>
 )}

 {/* Edit Shipment Modal */}
 {isEditModalOpen && selectedShipment && (
 <div className="modal-backdrop" onClick={() => setIsEditModalOpen(false)}>
 <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
 <div className="modal-header">
 <h3 className="text-lg font-medium text-gray-900 dark:text-white">Edit Shipment {selectedShipment.id}</h3>
 <button 
 className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
 onClick={() => setIsEditModalOpen(false)}
 aria-label="Close modal"
 >
 <X size={20} />
 </button>
 </div>
 <form onSubmit={handleSubmit(handleEditShipment)}>
 <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="form-group">
 <label className="form-label" htmlFor="edit-trackingNumber">Tracking Number</label>
 <input 
 id="edit-trackingNumber"
 type="text" 
 className="input"
 {...register('trackingNumber', { required: 'Tracking number is required' })}
 />
 {errors.trackingNumber && <p className="form-error">{errors.trackingNumber.message}</p>}
 </div>

 <div className="form-group">
 <label className="form-label" htmlFor="edit-carrier">Carrier</label>
 <input 
 id="edit-carrier"
 type="text" 
 className="input"
 {...register('carrier', { required: 'Carrier is required' })}
 />
 {errors.carrier && <p className="form-error">{errors.carrier.message}</p>}
 </div>

 <div className="form-group">
 <label className="form-label" htmlFor="edit-origin">Origin</label>
 <input 
 id="edit-origin"
 type="text" 
 className="input"
 {...register('origin', { required: 'Origin is required' })}
 />
 {errors.origin && <p className="form-error">{errors.origin.message}</p>}
 </div>

 <div className="form-group">
 <label className="form-label" htmlFor="edit-destination">Destination</label>
 <input 
 id="edit-destination"
 type="text" 
 className="input"
 {...register('destination', { required: 'Destination is required' })}
 />
 {errors.destination && <p className="form-error">{errors.destination.message}</p>}
 </div>

 <div className="form-group">
 <label className="form-label" htmlFor="edit-departureDate">Departure Date</label>
 <input 
 id="edit-departureDate"
 type="date" 
 className="input"
 {...register('departureDate', { required: 'Departure date is required' })}
 />
 {errors.departureDate && <p className="form-error">{errors.departureDate.message}</p>}
 </div>

 <div className="form-group">
 <label className="form-label" htmlFor="edit-estimatedArrival">Estimated Arrival</label>
 <input 
 id="edit-estimatedArrival"
 type="date" 
 className="input"
 {...register('estimatedArrival', { required: 'Estimated arrival is required' })}
 />
 {errors.estimatedArrival && <p className="form-error">{errors.estimatedArrival.message}</p>}
 </div>

 <div className="form-group">
 <label className="form-label" htmlFor="edit-status">Status</label>
 <select 
 id="edit-status"
 className="input"
 {...register('status', { required: 'Status is required' })}
 >
 <option value="Scheduled">Scheduled</option>
 <option value="In Transit">In Transit</option>
 <option value="Delayed">Delayed</option>
 <option value="Delivered">Delivered</option>
 </select>
 {errors.status && <p className="form-error">{errors.status.message}</p>}
 </div>

 <div className="form-group">
 <label className="form-label" htmlFor="edit-transportMode">Transport Mode</label>
 <select 
 id="edit-transportMode"
 className="input"
 {...register('transportMode', { required: 'Transport mode is required' })}
 >
 <option value="Sea">Sea</option>
 <option value="Air">Air</option>
 <option value="Land">Land</option>
 </select>
 {errors.transportMode && <p className="form-error">{errors.transportMode.message}</p>}
 </div>

 <div className="form-group">
 <label className="form-label" htmlFor="edit-priority">Priority</label>
 <select 
 id="edit-priority"
 className="input"
 {...register('priority', { required: 'Priority is required' })}
 >
 <option value="Low">Low</option>
 <option value="Medium">Medium</option>
 <option value="High">High</option>
 </select>
 {errors.priority && <p className="form-error">{errors.priority.message}</p>}
 </div>

 <div className="form-group">
 <label className="form-label" htmlFor="edit-weight">Weight (kg)</label>
 <input 
 id="edit-weight"
 type="number" 
 className="input"
 min="0"
 step="0.01"
 {...register('weight', { 
 required: 'Weight is required',
 valueAsNumber: true,
 min: { value: 0, message: 'Weight must be positive' }
 })}
 />
 {errors.weight && <p className="form-error">{errors.weight.message}</p>}
 </div>

 <div className="form-group">
 <label className="form-label" htmlFor="edit-items">Number of Items</label>
 <input 
 id="edit-items"
 type="number" 
 className="input"
 min="1"
 step="1"
 {...register('items', { 
 required: 'Number of items is required',
 valueAsNumber: true,
 min: { value: 1, message: 'Must have at least 1 item' }
 })}
 />
 {errors.items && <p className="form-error">{errors.items.message}</p>}
 </div>

 <div className="form-group md:col-span-2">
 <label className="form-label" htmlFor="edit-notes">Notes</label>
 <textarea 
 id="edit-notes"
 className="input h-24"
 {...register('notes')}
 ></textarea>
 </div>
 </div>

 <div className="modal-footer">
 <button 
 type="button"
 className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
 onClick={() => setIsEditModalOpen(false)}
 >
 Cancel
 </button>
 <button type="submit" className="btn btn-primary">
 Save Changes
 </button>
 </div>
 </form>
 </div>
 </div>
 )}

 {/* Delete Confirmation Modal */}
 {isDeleteConfirmOpen && selectedShipment && (
 <div className="modal-backdrop" onClick={() => setIsDeleteConfirmOpen(false)}>
 <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
 <div className="modal-header">
 <h3 className="text-lg font-medium text-gray-900 dark:text-white">Confirm Deletion</h3>
 <button 
 className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
 onClick={() => setIsDeleteConfirmOpen(false)}
 aria-label="Close modal"
 >
 <X size={20} />
 </button>
 </div>
 <div className="mt-2">
 <p className="text-gray-500 dark:text-slate-400">
 Are you sure you want to delete shipment <span className="font-semibold">{selectedShipment.id}</span>? This action cannot be undone.
 </p>
 </div>
 <div className="modal-footer">
 <button 
 className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
 onClick={() => setIsDeleteConfirmOpen(false)}
 >
 Cancel
 </button>
 <button 
 className="btn bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
 onClick={handleDeleteShipment}
 >
 Delete
 </button>
 </div>
 </div>
 </div>
 )}

 {/* Shipment Details Modal */}
 {isDetailModalOpen && selectedShipment && (
 <div className="modal-backdrop" onClick={() => setIsDetailModalOpen(false)}>
 <div className="modal-content max-w-3xl" onClick={(e) => e.stopPropagation()}>
 <div className="modal-header">
 <h3 className="text-lg font-medium text-gray-900 dark:text-white">Shipment Details</h3>
 <button 
 className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
 onClick={() => setIsDetailModalOpen(false)}
 aria-label="Close modal"
 >
 <X size={20} />
 </button>
 </div>
 <div className="mt-4">
 <div className="flex flex-col md:flex-row justify-between">
 <div className="mb-4 md:mb-0">
 <h2 className="text-xl font-bold flex items-center">
 {selectedShipment.id} 
 <span className={`ml-2 text-sm ${getStatusBadgeClass(selectedShipment.status)}`}>
 {getStatusIcon(selectedShipment.status)}
 <span className="ml-1">{selectedShipment.status}</span>
 </span>
 </h2>
 <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
 Tracking: {selectedShipment.trackingNumber}
 </p>
 </div>
 <div className="flex space-x-2">
 <button 
 className="btn-sm bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
 onClick={() => {
 setIsDetailModalOpen(false);
 openEditModal(selectedShipment);
 }}
 >
 <Edit size={14} className="mr-1" />
 <span>Edit</span>
 </button>
 <button className="btn-sm bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600/50">
 <Download size={14} className="mr-1" />
 <span>Export</span>
 </button>
 </div>
 </div>

 <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
 <h4 className="font-medium text-gray-900 dark:text-white mb-3">Shipment Information</h4>
 
 <div className="space-y-3">
 <div className="flex justify-between">
 <span className="text-gray-500 dark:text-gray-400">Carrier:</span>
 <span className="font-medium text-gray-900 dark:text-white">{selectedShipment.carrier}</span>
 </div>
 <div className="flex justify-between">
 <span className="text-gray-500 dark:text-gray-400">Transport Mode:</span>
 <span className="font-medium text-gray-900 dark:text-white flex items-center">
 {getTransportModeIcon(selectedShipment.transportMode)}
 <span className="ml-1">{selectedShipment.transportMode}</span>
 </span>
 </div>
 <div className="flex justify-between">
 <span className="text-gray-500 dark:text-gray-400">Priority:</span>
 <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityBadgeClass(selectedShipment.priority)}`}>
 {selectedShipment.priority}
 </span>
 </div>
 <div className="flex justify-between">
 <span className="text-gray-500 dark:text-gray-400">Weight:</span>
 <span className="font-medium text-gray-900 dark:text-white">{selectedShipment.weight} kg</span>
 </div>
 <div className="flex justify-between">
 <span className="text-gray-500 dark:text-gray-400">Items:</span>
 <span className="font-medium text-gray-900 dark:text-white">{selectedShipment.items}</span>
 </div>
 <div className="flex justify-between">
 <span className="text-gray-500 dark:text-gray-400">Last Updated:</span>
 <span className="font-medium text-gray-900 dark:text-white">
 {format(selectedShipment.lastUpdated, 'MMM dd, yyyy HH:mm')}
 </span>
 </div>
 </div>
 </div>

 <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
 <h4 className="font-medium text-gray-900 dark:text-white mb-3">Route Information</h4>
 
 <div className="space-y-4">
 <div>
 <div className="text-gray-500 dark:text-gray-400 mb-1">Origin:</div>
 <div className="font-medium text-gray-900 dark:text-white flex items-start">
 <MapPin size={18} className="mr-1 text-primary-500 flex-shrink-0 mt-0.5" />
 {selectedShipment.origin}
 </div>
 </div>

 <div>
 <div className="text-gray-500 dark:text-gray-400 mb-1">Destination:</div>
 <div className="font-medium text-gray-900 dark:text-white flex items-start">
 <MapPin size={18} className="mr-1 text-primary-500 flex-shrink-0 mt-0.5" />
 {selectedShipment.destination}
 </div>
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div>
 <div className="text-gray-500 dark:text-gray-400 mb-1">Departure Date:</div>
 <div className="font-medium text-gray-900 dark:text-white">
 {format(selectedShipment.departureDate, 'MMM dd, yyyy')}
 </div>
 </div>

 <div>
 <div className="text-gray-500 dark:text-gray-400 mb-1">Estimated Arrival:</div>
 <div className="font-medium text-gray-900 dark:text-white">
 {format(selectedShipment.estimatedArrival, 'MMM dd, yyyy')}
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>

 {selectedShipment.notes && (
 <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
 <h4 className="font-medium text-gray-900 dark:text-white mb-2">Notes</h4>
 <p className="text-gray-600 dark:text-gray-300">{selectedShipment.notes}</p>
 </div>
 )}
 </div>
 <div className="modal-footer">
 <button 
 className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
 onClick={() => setIsDetailModalOpen(false)}
 >
 Close
 </button>
 </div>
 </div>
 </div>
 )}

 {/* Footer */}
 <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4 px-4 sm:px-6 lg:px-8 mt-auto theme-transition">
 <div className="container-fluid text-center text-gray-500 dark:text-gray-400 text-sm">
 Copyright (c) 2025 of Datavtar Private Limited. All rights reserved.
 </div>
 </footer>
 </div>
 );
};

export default App;

// Define a PackageIcon component to avoid duplication
const PackageIcon: React.FC<{ size: number, className?: string }> = ({ size, className }) => {
 return <Package size={size} className={className} />;
};
