import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import {
 Search,
 Truck,
 Package,
 Calendar,
 MapPin,
 User,
 BarChart4,
 AlertCircle,
 Check,
 X,
 Edit,
 Trash2,
 Plus,
 Filter,
 RefreshCw,
 Moon,
 Sun,
 ChevronDown,
 ArrowDownUp,
 Eye,
 Settings,
 Bell,
 LogOut,
 Menu,
 Layers,
 Info
} from 'lucide-react';
import styles from './styles/styles.module.css';

type ShipmentStatus = 'In Transit' | 'Delivered' | 'Delayed' | 'Processing' | 'Cancelled';

interface Shipment {
 id: string;
 trackingNumber: string;
 origin: string;
 destination: string;
 status: ShipmentStatus;
 departureDate: Date;
 estimatedArrival: Date;
 customer: string;
 carrier: string;
 priority: 'Low' | 'Medium' | 'High';
 weight: number;
 items: number;
 notes?: string;
}

interface ShipmentFormData {
 trackingNumber: string;
 origin: string;
 destination: string;
 status: ShipmentStatus;
 departureDate: string;
 estimatedArrival: string;
 customer: string;
 carrier: string;
 priority: 'Low' | 'Medium' | 'High';
 weight: number;
 items: number;
 notes?: string;
}

interface ShipmentStat {
 title: string;
 value: number;
 changePercent: number;
 icon: React.ReactNode;
 bgColor: string;
}

interface FilterState {
 status: ShipmentStatus | 'All';
 priority: 'Low' | 'Medium' | 'High' | 'All';
 search: string;
}

function App() {
 // Theme management
 const [isDarkMode, setIsDarkMode] = useState(() => {
 if (typeof window !== 'undefined') {
 const savedMode = localStorage.getItem('darkMode');
 return savedMode === 'true' || 
 (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
 }
 return false;
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

 // Sample data
 const [shipments, setShipments] = useState<Shipment[]>([
 {
 id: '1',
 trackingNumber: 'SHP-2023-001',
 origin: 'New York, NY',
 destination: 'Los Angeles, CA',
 status: 'In Transit',
 departureDate: new Date(2023, 5, 1),
 estimatedArrival: new Date(2023, 5, 7),
 customer: 'Acme Corp',
 carrier: 'FastShip Express',
 priority: 'High',
 weight: 250,
 items: 12,
 notes: 'Handle with care. Contains fragile items.'
 },
 {
 id: '2',
 trackingNumber: 'SHP-2023-002',
 origin: 'Seattle, WA',
 destination: 'Miami, FL',
 status: 'Delivered',
 departureDate: new Date(2023, 4, 15),
 estimatedArrival: new Date(2023, 4, 22),
 customer: 'Global Traders',
 carrier: 'OceanLink',
 priority: 'Medium',
 weight: 1250,
 items: 45,
 notes: 'Bulk shipment of electronics'
 },
 {
 id: '3',
 trackingNumber: 'SHP-2023-003',
 origin: 'Chicago, IL',
 destination: 'Houston, TX',
 status: 'Delayed',
 departureDate: new Date(2023, 5, 5),
 estimatedArrival: new Date(2023, 5, 9),
 customer: 'TechSupplies Inc.',
 carrier: 'RapidFreight',
 priority: 'High',
 weight: 520,
 items: 8,
 notes: 'Delay due to weather conditions'
 },
 {
 id: '4',
 trackingNumber: 'SHP-2023-004',
 origin: 'Denver, CO',
 destination: 'Atlanta, GA',
 status: 'Processing',
 departureDate: new Date(2023, 5, 10),
 estimatedArrival: new Date(2023, 5, 15),
 customer: 'Retail Solutions',
 carrier: 'EcoShip',
 priority: 'Low',
 weight: 150,
 items: 22,
 notes: ''
 },
 {
 id: '5',
 trackingNumber: 'SHP-2023-005',
 origin: 'Boston, MA',
 destination: 'San Francisco, CA',
 status: 'In Transit',
 departureDate: new Date(2023, 5, 3),
 estimatedArrival: new Date(2023, 5, 9),
 customer: 'Healthcare Products',
 carrier: 'MedExpress',
 priority: 'High',
 weight: 180,
 items: 5,
 notes: 'Temperature controlled shipment'
 },
 {
 id: '6',
 trackingNumber: 'SHP-2023-006',
 origin: 'Austin, TX',
 destination: 'Portland, OR',
 status: 'Cancelled',
 departureDate: new Date(2023, 4, 25),
 estimatedArrival: new Date(2023, 5, 1),
 customer: 'FoodCo Distributors',
 carrier: 'FreshFreight',
 priority: 'Medium',
 weight: 750,
 items: 30,
 notes: 'Cancelled by customer'
 }
 ]);

 // Sorting state
 const [sortField, setSortField] = useState<keyof Shipment | null>(null);
 const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

 // Filter state
 const [filters, setFilters] = useState<FilterState>({
 status: 'All',
 priority: 'All',
 search: ''
 });

 const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);

 // Modal state for adding/editing shipments
 const [modalOpen, setModalOpen] = useState(false);
 const [currentShipment, setCurrentShipment] = useState<Shipment | null>(null);

 // Mobile nav state
 const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

 // View details modal state
 const [detailsModalOpen, setDetailsModalOpen] = useState(false);
 const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);

 const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ShipmentFormData>();

 // Derived metrics for dashboard
 const totalShipments = shipments.length;
 const inTransitCount = shipments.filter(s => s.status === 'In Transit').length;
 const delayedCount = shipments.filter(s => s.status === 'Delayed').length;
 const deliveredCount = shipments.filter(s => s.status === 'Delivered').length;

 // Sample stats for dashboard
 const shipmentStats: ShipmentStat[] = [
 {
 title: 'Total Shipments',
 value: totalShipments,
 changePercent: 12,
 icon: <Package className="h-6 w-6 text-blue-500" />,
 bgColor: 'bg-blue-50 dark:bg-blue-900/20'
 },
 {
 title: 'In Transit',
 value: inTransitCount,
 changePercent: 8,
 icon: <Truck className="h-6 w-6 text-green-500" />,
 bgColor: 'bg-green-50 dark:bg-green-900/20'
 },
 {
 title: 'Delayed',
 value: delayedCount,
 changePercent: -5,
 icon: <AlertCircle className="h-6 w-6 text-red-500" />,
 bgColor: 'bg-red-50 dark:bg-red-900/20'
 },
 {
 title: 'Delivered',
 value: deliveredCount,
 changePercent: 18,
 icon: <Check className="h-6 w-6 text-purple-500" />,
 bgColor: 'bg-purple-50 dark:bg-purple-900/20'
 }
 ];

 // Sort function
 const sortShipments = (field: keyof Shipment) => {
 if (sortField === field) {
 setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
 } else {
 setSortField(field);
 setSortDirection('asc');
 }
 };

 // Filter function
 const filteredShipments = shipments.filter(shipment => {
 // Status filter
 if (filters.status !== 'All' && shipment.status !== filters.status) {
 return false;
 }
 
 // Priority filter
 if (filters.priority !== 'All' && shipment.priority !== filters.priority) {
 return false;
 }
 
 // Search filter
 if (filters.search) {
 const searchValue = filters.search.toLowerCase();
 return (
 shipment.trackingNumber.toLowerCase().includes(searchValue) ||
 shipment.customer.toLowerCase().includes(searchValue) ||
 shipment.origin.toLowerCase().includes(searchValue) ||
 shipment.destination.toLowerCase().includes(searchValue) ||
 shipment.carrier.toLowerCase().includes(searchValue)
 );
 }
 
 return true;
 });

 // Apply sorting to filtered shipments
 const sortedShipments = [...filteredShipments].sort((a, b) => {
 if (!sortField) return 0;
 
 let comparison = 0;
 
 if (sortField === 'departureDate' || sortField === 'estimatedArrival') {
 comparison = a[sortField].getTime() - b[sortField].getTime();
 } else if (typeof a[sortField] === 'string') {
 comparison = (a[sortField] as string).localeCompare(b[sortField] as string);
 } else if (typeof a[sortField] === 'number') {
 comparison = (a[sortField] as number) - (b[sortField] as number);
 }
 
 return sortDirection === 'asc' ? comparison : -comparison;
 });

 // Form submission handler
 const onSubmit = (data: ShipmentFormData) => {
 if (currentShipment) {
 // Edit existing shipment
 const updatedShipments = shipments.map(shipment => {
 if (shipment.id === currentShipment.id) {
 return {
 ...shipment,
 ...data,
 departureDate: new Date(data.departureDate),
 estimatedArrival: new Date(data.estimatedArrival),
 weight: Number(data.weight),
 items: Number(data.items)
 };
 }
 return shipment;
 });
 setShipments(updatedShipments);
 } else {
 // Add new shipment
 const newShipment: Shipment = {
 id: `SHP-${Math.floor(Math.random() * 10000)}`,
 ...data,
 departureDate: new Date(data.departureDate),
 estimatedArrival: new Date(data.estimatedArrival),
 weight: Number(data.weight),
 items: Number(data.items)
 };
 setShipments([...shipments, newShipment]);
 }
 
 closeModal();
 };

 // Open modal to add a new shipment
 const addShipment = () => {
 setCurrentShipment(null);
 reset({
 trackingNumber: '',
 origin: '',
 destination: '',
 status: 'Processing',
 departureDate: format(new Date(), 'yyyy-MM-dd'),
 estimatedArrival: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
 customer: '',
 carrier: '',
 priority: 'Medium',
 weight: 0,
 items: 0,
 notes: ''
 });
 setModalOpen(true);
 };

 // Open modal to edit an existing shipment
 const editShipment = (shipment: Shipment) => {
 setCurrentShipment(shipment);
 setValue('trackingNumber', shipment.trackingNumber);
 setValue('origin', shipment.origin);
 setValue('destination', shipment.destination);
 setValue('status', shipment.status);
 setValue('departureDate', format(shipment.departureDate, 'yyyy-MM-dd'));
 setValue('estimatedArrival', format(shipment.estimatedArrival, 'yyyy-MM-dd'));
 setValue('customer', shipment.customer);
 setValue('carrier', shipment.carrier);
 setValue('priority', shipment.priority);
 setValue('weight', shipment.weight);
 setValue('items', shipment.items);
 setValue('notes', shipment.notes || '');
 setModalOpen(true);
 };

 // Delete a shipment
 const deleteShipment = (id: string) => {
 if (window.confirm('Are you sure you want to delete this shipment?')) {
 setShipments(shipments.filter(shipment => shipment.id !== id));
 }
 };

 // Open shipment details modal
 const viewShipmentDetails = (shipment: Shipment) => {
 setSelectedShipment(shipment);
 setDetailsModalOpen(true);
 };

 // Close modals
 const closeModal = () => {
 setModalOpen(false);
 setCurrentShipment(null);
 reset();
 };

 const closeDetailsModal = () => {
 setDetailsModalOpen(false);
 setSelectedShipment(null);
 };

 // Status badge class getter
 const getStatusBadgeClass = (status: ShipmentStatus) => {
 switch (status) {
 case 'In Transit': return 'badge badge-info';
 case 'Delivered': return 'badge badge-success';
 case 'Delayed': return 'badge badge-error';
 case 'Processing': return 'badge badge-warning';
 case 'Cancelled': return 'badge bg-gray-500 text-white';
 default: return 'badge';
 }
 };

 // Priority badge class getter
 const getPriorityBadgeClass = (priority: 'Low' | 'Medium' | 'High') => {
 switch (priority) {
 case 'Low': return 'badge bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
 case 'Medium': return 'badge bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
 case 'High': return 'badge bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
 default: return 'badge';
 }
 };

 return (
 <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white theme-transition-all">
 {/* Header */}
 <header className="sticky top-0 z-20 bg-white dark:bg-gray-800 shadow-sm">
 <div className="container-fluid px-4 sm:px-6 py-4 flex justify-between items-center">
 <div className="flex items-center">
 <button 
 className="md:hidden mr-2" 
 onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
 aria-label="Toggle menu"
 >
 <Menu className="h-6 w-6" />
 </button>
 <div className="flex items-center">
 <Layers className="h-6 w-6 text-primary-500" />
 <h1 className="text-xl font-bold ml-2">ShipTrack</h1>
 </div>
 </div>
 
 <div className="flex items-center space-x-4">
 <button 
 className="theme-toggle" 
 onClick={() => setIsDarkMode(!isDarkMode)}
 aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
 >
 {isDarkMode ? (
 <Sun className="h-5 w-5" />
 ) : (
 <Moon className="h-5 w-5" />
 )}
 </button>
 
 <button className="relative p-1 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300" aria-label="Notifications">
 <Bell className="h-6 w-6" />
 <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500"></span>
 </button>
 
 <div className="hidden md:flex items-center border-l border-gray-200 dark:border-gray-700 pl-4 ml-2">
 <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-medium">JD</div>
 <div className="ml-2">
 <p className="text-sm font-medium">John Doe</p>
 <p className="text-xs text-gray-500 dark:text-gray-400">Logistics Manager</p>
 </div>
 </div>
 </div>
 </div>
 </header>

 <div className="flex flex-col md:flex-row">
 {/* Sidebar - desktop */}
 <aside className="hidden md:block w-64 sticky top-16 h-[calc(100vh-4rem)] bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
 <nav className="px-4 py-6 space-y-1">
 <a href="#" className="flex items-center px-4 py-3 text-sm font-medium rounded-lg bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-100">
 <BarChart4 className="mr-3 h-5 w-5" />
 Dashboard
 </a>
 <a href="#" className="flex items-center px-4 py-3 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50">
 <Truck className="mr-3 h-5 w-5" />
 Shipments
 </a>
 <a href="#" className="flex items-center px-4 py-3 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50">
 <User className="mr-3 h-5 w-5" />
 Customers
 </a>
 <a href="#" className="flex items-center px-4 py-3 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50">
 <MapPin className="mr-3 h-5 w-5" />
 Locations
 </a>
 <a href="#" className="flex items-center px-4 py-3 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50">
 <Settings className="mr-3 h-5 w-5" />
 Settings
 </a>
 
 <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
 <a href="#" className="flex items-center px-4 py-3 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50">
 <LogOut className="mr-3 h-5 w-5" />
 Logout
 </a>
 </div>
 </nav>
 </aside>

 {/* Mobile menu */}
 {mobileMenuOpen && (
 <div className="fixed inset-0 z-50 lg:hidden">
 <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setMobileMenuOpen(false)}></div>
 
 <div className="relative flex flex-col w-full max-w-xs pb-12 overflow-y-auto bg-white dark:bg-gray-800 shadow-xl">
 <div className="px-4 pt-5 pb-2 flex">
 <button
 className="ml-auto p-1 rounded-md text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
 onClick={() => setMobileMenuOpen(false)}
 >
 <X className="h-6 w-6" />
 </button>
 </div>
 
 <nav className="px-4 py-6 space-y-1">
 <a href="#" className="flex items-center px-4 py-3 text-sm font-medium rounded-lg bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-100">
 <BarChart4 className="mr-3 h-5 w-5" />
 Dashboard
 </a>
 <a href="#" className="flex items-center px-4 py-3 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50">
 <Truck className="mr-3 h-5 w-5" />
 Shipments
 </a>
 <a href="#" className="flex items-center px-4 py-3 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50">
 <User className="mr-3 h-5 w-5" />
 Customers
 </a>
 <a href="#" className="flex items-center px-4 py-3 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50">
 <MapPin className="mr-3 h-5 w-5" />
 Locations
 </a>
 <a href="#" className="flex items-center px-4 py-3 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50">
 <Settings className="mr-3 h-5 w-5" />
 Settings
 </a>
 
 <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
 <a href="#" className="flex items-center px-4 py-3 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50">
 <LogOut className="mr-3 h-5 w-5" />
 Logout
 </a>
 </div>
 </nav>
 </div>
 </div>
 )}

 {/* Main content */}
 <main className="flex-1 p-4 sm:p-6 lg:p-8">
 <div className="space-y-6">
 {/* Page header */}
 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
 <h2 className="text-2xl font-bold">Shipment Dashboard</h2>
 <button
 className="btn btn-primary mt-3 sm:mt-0 flex items-center justify-center"
 onClick={addShipment}
 >
 <Plus className="h-4 w-4 mr-2" />
 Add Shipment
 </button>
 </div>

 {/* Stats cards */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 {shipmentStats.map((stat, index) => (
 <div key={index} className="card fade-in theme-transition">
 <div className="flex items-center">
 <div className={`rounded-full p-3 mr-4 ${stat.bgColor}`}>
 {stat.icon}
 </div>
 <div>
 <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.title}</p>
 <div className="flex items-end mt-1">
 <p className="text-2xl font-semibold">{stat.value}</p>
 <p className={`ml-2 text-xs font-medium ${stat.changePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
 {stat.changePercent >= 0 ? '+' : ''}{stat.changePercent}%
 </p>
 </div>
 </div>
 </div>
 </div>
 ))}
 </div>

 {/* Search and filters */}
 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
 <div className="relative flex-1 max-w-lg">
 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
 <Search className="h-5 w-5 text-gray-400" />
 </div>
 <input
 type="text"
 className="input pl-10"
 placeholder="Search shipments..."
 value={filters.search}
 onChange={(e) => setFilters({...filters, search: e.target.value})}
 />
 </div>
 
 <div className="flex items-center mt-4 sm:mt-0 space-x-3">
 <div className="relative">
 <button 
 className="btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600 flex items-center"
 onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
 >
 <Filter className="h-4 w-4 mr-2" />
 Filters
 <ChevronDown className="h-4 w-4 ml-2" />
 </button>
 
 {isFilterMenuOpen && (
 <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-700">
 <div className="p-3">
 <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</h4>
 <div className="mt-2 space-y-2">
 {['All', 'In Transit', 'Delivered', 'Delayed', 'Processing', 'Cancelled'].map(status => (
 <label key={status} className="flex items-center">
 <input
 type="radio"
 className="form-radio"
 checked={filters.status === status}
 onChange={() => setFilters({...filters, status: status as ShipmentStatus | 'All'})}
 />
 <span className="ml-2 text-sm">{status}</span>
 </label>
 ))}
 </div>
 
 <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-4">Priority</h4>
 <div className="mt-2 space-y-2">
 {['All', 'Low', 'Medium', 'High'].map(priority => (
 <label key={priority} className="flex items-center">
 <input
 type="radio"
 className="form-radio"
 checked={filters.priority === priority}
 onChange={() => setFilters({...filters, priority: priority as 'Low' | 'Medium' | 'High' | 'All'})}
 />
 <span className="ml-2 text-sm">{priority}</span>
 </label>
 ))}
 </div>
 
 <div className="flex justify-end mt-4">
 <button 
 className="btn btn-sm btn-primary"
 onClick={() => setIsFilterMenuOpen(false)}
 >
 Apply Filters
 </button>
 </div>
 </div>
 </div>
 )}
 </div>
 
 <button 
 className="btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600 flex items-center"
 onClick={() => setFilters({ status: 'All', priority: 'All', search: '' })}
 >
 <RefreshCw className="h-4 w-4 mr-2" />
 Reset
 </button>
 </div>
 </div>

 {/* Shipment table */}
 <div className="overflow-x-auto">
 <div className="table-container">
 <table className="table">
 <thead>
 <tr>
 <th 
 className="table-header cursor-pointer"
 onClick={() => sortShipments('trackingNumber')}
 >
 <div className="flex items-center">
 Tracking #
 {sortField === 'trackingNumber' && (
 <ArrowDownUp className="h-4 w-4 ml-1" />
 )}
 </div>
 </th>
 <th 
 className="table-header cursor-pointer hidden md:table-cell"
 onClick={() => sortShipments('origin')}
 >
 <div className="flex items-center">
 Origin
 {sortField === 'origin' && (
 <ArrowDownUp className="h-4 w-4 ml-1" />
 )}
 </div>
 </th>
 <th 
 className="table-header cursor-pointer hidden md:table-cell"
 onClick={() => sortShipments('destination')}
 >
 <div className="flex items-center">
 Destination
 {sortField === 'destination' && (
 <ArrowDownUp className="h-4 w-4 ml-1" />
 )}
 </div>
 </th>
 <th 
 className="table-header cursor-pointer"
 onClick={() => sortShipments('status')}
 >
 <div className="flex items-center">
 Status
 {sortField === 'status' && (
 <ArrowDownUp className="h-4 w-4 ml-1" />
 )}
 </div>
 </th>
 <th 
 className="table-header cursor-pointer hidden sm:table-cell"
 onClick={() => sortShipments('departureDate')}
 >
 <div className="flex items-center">
 Departure
 {sortField === 'departureDate' && (
 <ArrowDownUp className="h-4 w-4 ml-1" />
 )}
 </div>
 </th>
 <th 
 className="table-header cursor-pointer hidden lg:table-cell"
 onClick={() => sortShipments('customer')}
 >
 <div className="flex items-center">
 Customer
 {sortField === 'customer' && (
 <ArrowDownUp className="h-4 w-4 ml-1" />
 )}
 </div>
 </th>
 <th 
 className="table-header cursor-pointer hidden lg:table-cell"
 onClick={() => sortShipments('priority')}
 >
 <div className="flex items-center">
 Priority
 {sortField === 'priority' && (
 <ArrowDownUp className="h-4 w-4 ml-1" />
 )}
 </div>
 </th>
 <th className="table-header">Actions</th>
 </tr>
 </thead>
 <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
 {sortedShipments.length > 0 ? (
 sortedShipments.map((shipment) => (
 <tr key={shipment.id}>
 <td className="table-cell font-medium">{shipment.trackingNumber}</td>
 <td className="table-cell hidden md:table-cell">{shipment.origin}</td>
 <td className="table-cell hidden md:table-cell">{shipment.destination}</td>
 <td className="table-cell">
 <span className={getStatusBadgeClass(shipment.status)}>
 {shipment.status}
 </span>
 </td>
 <td className="table-cell hidden sm:table-cell">{format(shipment.departureDate, 'MMM dd, yyyy')}</td>
 <td className="table-cell hidden lg:table-cell">{shipment.customer}</td>
 <td className="table-cell hidden lg:table-cell">
 <span className={getPriorityBadgeClass(shipment.priority)}>
 {shipment.priority}
 </span>
 </td>
 <td className="table-cell">
 <div className="flex space-x-2">
 <button 
 className="p-1 text-gray-500 hover:text-blue-600 transition-colors dark:text-gray-400 dark:hover:text-blue-400"
 onClick={() => viewShipmentDetails(shipment)}
 aria-label="View details"
 >
 <Eye className="h-5 w-5" />
 </button>
 <button 
 className="p-1 text-gray-500 hover:text-green-600 transition-colors dark:text-gray-400 dark:hover:text-green-400"
 onClick={() => editShipment(shipment)}
 aria-label="Edit shipment"
 >
 <Edit className="h-5 w-5" />
 </button>
 <button 
 className="p-1 text-gray-500 hover:text-red-600 transition-colors dark:text-gray-400 dark:hover:text-red-400"
 onClick={() => deleteShipment(shipment.id)}
 aria-label="Delete shipment"
 >
 <Trash2 className="h-5 w-5" />
 </button>
 </div>
 </td>
 </tr>
 ))
 ) : (
 <tr>
 <td colSpan={8} className="table-cell text-center py-8">
 <div className="flex flex-col items-center justify-center">
 <Info className="h-12 w-12 text-gray-400 mb-2" />
 <p className="text-gray-500 dark:text-gray-400">No shipments found matching your filters.</p>
 <button 
 className="btn btn-sm btn-primary mt-4"
 onClick={() => setFilters({ status: 'All', priority: 'All', search: '' })}
 >
 Reset Filters
 </button>
 </div>
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 </main>
 </div>

 {/* Add/Edit Shipment Modal */}
 {modalOpen && (
 <div className="modal-backdrop">
 <div className="modal-content max-w-2xl">
 <div className="modal-header">
 <h3 className="text-lg font-medium text-gray-900 dark:text-white">
 {currentShipment ? 'Edit Shipment' : 'Add New Shipment'}
 </h3>
 <button 
 className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
 onClick={closeModal}
 aria-label="Close"
 >
 <X className="h-6 w-6" />
 </button>
 </div>
 
 <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div className="form-group">
 <label className="form-label" htmlFor="trackingNumber">Tracking Number</label>
 <input
 id="trackingNumber"
 className={`input ${errors.trackingNumber ? 'border-red-500' : ''}`}
 {...register('trackingNumber', { required: 'Tracking number is required' })}
 />
 {errors.trackingNumber && <p className="form-error">{errors.trackingNumber.message}</p>}
 </div>
 
 <div className="form-group">
 <label className="form-label" htmlFor="customer">Customer</label>
 <input
 id="customer"
 className={`input ${errors.customer ? 'border-red-500' : ''}`}
 {...register('customer', { required: 'Customer is required' })}
 />
 {errors.customer && <p className="form-error">{errors.customer.message}</p>}
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div className="form-group">
 <label className="form-label" htmlFor="origin">Origin</label>
 <input
 id="origin"
 className={`input ${errors.origin ? 'border-red-500' : ''}`}
 {...register('origin', { required: 'Origin is required' })}
 />
 {errors.origin && <p className="form-error">{errors.origin.message}</p>}
 </div>
 
 <div className="form-group">
 <label className="form-label" htmlFor="destination">Destination</label>
 <input
 id="destination"
 className={`input ${errors.destination ? 'border-red-500' : ''}`}
 {...register('destination', { required: 'Destination is required' })}
 />
 {errors.destination && <p className="form-error">{errors.destination.message}</p>}
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
 <div className="form-group">
 <label className="form-label" htmlFor="status">Status</label>
 <select
 id="status"
 className="input"
 {...register('status', { required: 'Status is required' })}
 >
 <option value="Processing">Processing</option>
 <option value="In Transit">In Transit</option>
 <option value="Delivered">Delivered</option>
 <option value="Delayed">Delayed</option>
 <option value="Cancelled">Cancelled</option>
 </select>
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
 </div>
 
 <div className="form-group">
 <label className="form-label" htmlFor="carrier">Carrier</label>
 <input
 id="carrier"
 className={`input ${errors.carrier ? 'border-red-500' : ''}`}
 {...register('carrier', { required: 'Carrier is required' })}
 />
 {errors.carrier && <p className="form-error">{errors.carrier.message}</p>}
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
 <div className="form-group sm:col-span-2">
 <label className="form-label" htmlFor="departureDate">Departure Date</label>
 <input
 id="departureDate"
 type="date"
 className={`input ${errors.departureDate ? 'border-red-500' : ''}`}
 {...register('departureDate', { required: 'Departure date is required' })}
 />
 {errors.departureDate && <p className="form-error">{errors.departureDate.message}</p>}
 </div>
 
 <div className="form-group sm:col-span-2">
 <label className="form-label" htmlFor="estimatedArrival">Estimated Arrival</label>
 <input
 id="estimatedArrival"
 type="date"
 className={`input ${errors.estimatedArrival ? 'border-red-500' : ''}`}
 {...register('estimatedArrival', { required: 'Estimated arrival is required' })}
 />
 {errors.estimatedArrival && <p className="form-error">{errors.estimatedArrival.message}</p>}
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div className="form-group">
 <label className="form-label" htmlFor="weight">Weight (kg)</label>
 <input
 id="weight"
 type="number"
 className={`input ${errors.weight ? 'border-red-500' : ''}`}
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
 className={`input ${errors.items ? 'border-red-500' : ''}`}
 {...register('items', { 
 required: 'Number of items is required',
 valueAsNumber: true,
 min: { value: 1, message: 'At least one item is required' }
 })}
 />
 {errors.items && <p className="form-error">{errors.items.message}</p>}
 </div>
 </div>

 <div className="form-group">
 <label className="form-label" htmlFor="notes">Notes</label>
 <textarea
 id="notes"
 rows={3}
 className="input"
 {...register('notes')}
 ></textarea>
 </div>

 <div className="modal-footer">
 <button
 type="button"
 className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
 onClick={closeModal}
 >
 Cancel
 </button>
 <button type="submit" className="btn btn-primary">
 {currentShipment ? 'Update Shipment' : 'Add Shipment'}
 </button>
 </div>
 </form>
 </div>
 </div>
 )}

 {/* Shipment Details Modal */}
 {detailsModalOpen && selectedShipment && (
 <div className="modal-backdrop">
 <div className="modal-content max-w-3xl">
 <div className="modal-header">
 <h3 className="text-lg font-medium text-gray-900 dark:text-white">
 Shipment Details
 </h3>
 <button 
 className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
 onClick={closeDetailsModal}
 aria-label="Close"
 >
 <X className="h-6 w-6" />
 </button>
 </div>
 
 <div className="mt-4 space-y-6">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm text-gray-500 dark:text-gray-400">Tracking Number</p>
 <p className="text-lg font-semibold">{selectedShipment.trackingNumber}</p>
 </div>
 <span className={getStatusBadgeClass(selectedShipment.status)}>
 {selectedShipment.status}
 </span>
 </div>
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="space-y-4">
 <div>
 <p className="text-sm text-gray-500 dark:text-gray-400">Origin</p>
 <div className="flex items-start mt-1">
 <MapPin className="h-5 w-5 text-gray-400 mt-0.5 mr-1.5 flex-shrink-0" />
 <p>{selectedShipment.origin}</p>
 </div>
 </div>
 
 <div>
 <p className="text-sm text-gray-500 dark:text-gray-400">Destination</p>
 <div className="flex items-start mt-1">
 <MapPin className="h-5 w-5 text-gray-400 mt-0.5 mr-1.5 flex-shrink-0" />
 <p>{selectedShipment.destination}</p>
 </div>
 </div>
 
 <div>
 <p className="text-sm text-gray-500 dark:text-gray-400">Customer</p>
 <div className="flex items-start mt-1">
 <User className="h-5 w-5 text-gray-400 mt-0.5 mr-1.5 flex-shrink-0" />
 <p>{selectedShipment.customer}</p>
 </div>
 </div>
 </div>
 
 <div className="space-y-4">
 <div>
 <p className="text-sm text-gray-500 dark:text-gray-400">Carrier</p>
 <div className="flex items-start mt-1">
 <Truck className="h-5 w-5 text-gray-400 mt-0.5 mr-1.5 flex-shrink-0" />
 <p>{selectedShipment.carrier}</p>
 </div>
 </div>
 
 <div>
 <p className="text-sm text-gray-500 dark:text-gray-400">Departure Date</p>
 <div className="flex items-start mt-1">
 <Calendar className="h-5 w-5 text-gray-400 mt-0.5 mr-1.5 flex-shrink-0" />
 <p>{format(selectedShipment.departureDate, 'MMMM dd, yyyy')}</p>
 </div>
 </div>
 
 <div>
 <p className="text-sm text-gray-500 dark:text-gray-400">Estimated Arrival</p>
 <div className="flex items-start mt-1">
 <Calendar className="h-5 w-5 text-gray-400 mt-0.5 mr-1.5 flex-shrink-0" />
 <p>{format(selectedShipment.estimatedArrival, 'MMMM dd, yyyy')}</p>
 </div>
 </div>
 </div>
 </div>
 
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
 <div>
 <p className="text-sm text-gray-500 dark:text-gray-400">Priority</p>
 <span className={`mt-1 inline-block ${getPriorityBadgeClass(selectedShipment.priority)}`}>
 {selectedShipment.priority}
 </span>
 </div>
 
 <div>
 <p className="text-sm text-gray-500 dark:text-gray-400">Weight</p>
 <p className="mt-1">{selectedShipment.weight} kg</p>
 </div>
 
 <div>
 <p className="text-sm text-gray-500 dark:text-gray-400">Items</p>
 <p className="mt-1">{selectedShipment.items} items</p>
 </div>
 </div>
 
 {selectedShipment.notes && (
 <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
 <p className="text-sm text-gray-500 dark:text-gray-400">Notes</p>
 <p className="mt-1 text-gray-700 dark:text-gray-300 whitespace-pre-line">{selectedShipment.notes}</p>
 </div>
 )}
 </div>
 
 <div className="modal-footer">
 <button
 type="button"
 className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
 onClick={closeDetailsModal}
 >
 Close
 </button>
 <button 
 className="btn btn-primary"
 onClick={() => {
 closeDetailsModal();
 editShipment(selectedShipment);
 }}
 >
 Edit Shipment
 </button>
 </div>
 </div>
 </div>
 )}

 {/* Footer */}
 <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4 px-6 text-center text-sm text-gray-600 dark:text-gray-400">
 Copyright (c) 2025 of Datavtar Private Limited. All rights reserved.
 </footer>
 </div>
 );
}

export default App;