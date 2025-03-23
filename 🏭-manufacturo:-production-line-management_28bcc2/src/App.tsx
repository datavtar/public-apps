import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import {
 Plus,
 Edit,
 Trash2,
 Search,
 Calendar,
 Sun,
 Moon,
 ArrowUpDown,
 Menu,
 X,
 ChevronLeft,
 ChevronRight,
 BarChart,
 Clock,
 Clipboard,
 Users,
 Settings,
 AlertTriangle,
 CheckCircle2,
 Home,
 Factory,
 Package,
 Layers
} from 'lucide-react';
import styles from './styles/styles.module.css';

// Types and Interfaces
type ProductionLine = {
 id: string;
 name: string;
 status: 'active' | 'maintenance' | 'inactive';
 capacity: number;
 lastMaintenance: Date;
 nextMaintenance: Date;
};

type Product = {
 id: string;
 name: string;
 category: string;
 sku: string;
 unitOfMeasure: string;
};

type Schedule = {
 id: string;
 lineId: string;
 productId: string;
 startTime: Date;
 endTime: Date;
 targetQuantity: number;
 priority: 'low' | 'medium' | 'high';
 status: 'scheduled' | 'in-progress' | 'completed' | 'canceled';
};

type MaintenanceLog = {
 id: string;
 lineId: string;
 date: Date;
 description: string;
 technician: string;
 status: 'planned' | 'in-progress' | 'completed';
};

type Alert = {
 id: string;
 message: string;
 type: 'info' | 'warning' | 'error' | 'success';
 timestamp: Date;
 read: boolean;
};

type TabType = 'dashboard' | 'production-lines' | 'scheduling' | 'products' | 'maintenance' | 'reports';

type FilterOption = {
 value: string;
 label: string;
};

type SortConfig = {
 key: string;
 direction: 'asc' | 'desc';
};

type FormMode = 'add' | 'edit' | 'view' | null;

const App: React.FC = () => {
 return (
 <Router>
 <AppContent />
 </Router>
 );
};

const AppContent: React.FC = () => {
 // State Management
 const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
 if (typeof window !== 'undefined') {
 const savedMode = localStorage.getItem('darkMode');
 return savedMode === 'true' || 
 (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
 }
 return false;
 });
 
 const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
 const [activeTab, setActiveTab] = useState<TabType>('dashboard');
 const [searchTerm, setSearchTerm] = useState<string>('');
 const [currentAlerts, setCurrentAlerts] = useState<Alert[]>([
 {
 id: '1',
 message: 'Production Line 2 requires maintenance',
 type: 'warning',
 timestamp: new Date(),
 read: false
 },
 {
 id: '2',
 message: 'Scheduling conflict detected for tomorrow',
 type: 'error',
 timestamp: new Date(),
 read: false
 },
 {
 id: '3',
 message: 'Production target achieved for Product X',
 type: 'success',
 timestamp: new Date(),
 read: true
 }
 ]);
 
 // Mock Data
 const [productionLines, setProductionLines] = useState<ProductionLine[]>([
 {
 id: '1',
 name: 'Assembly Line A',
 status: 'active',
 capacity: 500,
 lastMaintenance: new Date(2023, 8, 15),
 nextMaintenance: new Date(2023, 11, 15)
 },
 {
 id: '2',
 name: 'Packaging Line B',
 status: 'maintenance',
 capacity: 350,
 lastMaintenance: new Date(2023, 9, 20),
 nextMaintenance: new Date(2023, 10, 20)
 },
 {
 id: '3',
 name: 'Processing Line C',
 status: 'active',
 capacity: 450,
 lastMaintenance: new Date(2023, 7, 10),
 nextMaintenance: new Date(2023, 10, 10)
 },
 {
 id: '4',
 name: 'Quality Control D',
 status: 'inactive',
 capacity: 200,
 lastMaintenance: new Date(2023, 8, 5),
 nextMaintenance: new Date(2023, 11, 5)
 }
 ]);
 
 const [products, setProducts] = useState<Product[]>([
 {
 id: '1',
 name: 'Widget Pro',
 category: 'Electronics',
 sku: 'WDG-001',
 unitOfMeasure: 'piece'
 },
 {
 id: '2',
 name: 'Gadget Plus',
 category: 'Electronics',
 sku: 'GDG-002',
 unitOfMeasure: 'piece'
 },
 {
 id: '3',
 name: 'Premium Solution',
 category: 'Chemicals',
 sku: 'CHM-001',
 unitOfMeasure: 'liter'
 },
 {
 id: '4',
 name: 'Industrial Component',
 category: 'Mechanical',
 sku: 'MEC-005',
 unitOfMeasure: 'piece'
 }
 ]);
 
 const [schedules, setSchedules] = useState<Schedule[]>([
 {
 id: '1',
 lineId: '1',
 productId: '1',
 startTime: new Date(2023, 9, 25, 8, 0),
 endTime: new Date(2023, 9, 25, 16, 0),
 targetQuantity: 400,
 priority: 'high',
 status: 'scheduled'
 },
 {
 id: '2',
 lineId: '3',
 productId: '2',
 startTime: new Date(2023, 9, 25, 8, 0),
 endTime: new Date(2023, 9, 25, 14, 0),
 targetQuantity: 250,
 priority: 'medium',
 status: 'in-progress'
 },
 {
 id: '3',
 lineId: '1',
 productId: '3',
 startTime: new Date(2023, 9, 26, 8, 0),
 endTime: new Date(2023, 9, 26, 17, 0),
 targetQuantity: 300,
 priority: 'medium',
 status: 'scheduled'
 },
 {
 id: '4',
 lineId: '4',
 productId: '4',
 startTime: new Date(2023, 9, 24, 9, 0),
 endTime: new Date(2023, 9, 24, 13, 0),
 targetQuantity: 150,
 priority: 'low',
 status: 'completed'
 }
 ]);
 
 const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLog[]>([
 {
 id: '1',
 lineId: '2',
 date: new Date(2023, 9, 20),
 description: 'Regular maintenance and calibration',
 technician: 'John Smith',
 status: 'in-progress'
 },
 {
 id: '2',
 lineId: '1',
 date: new Date(2023, 8, 15),
 description: 'Component replacement and cleaning',
 technician: 'Maria Rodriguez',
 status: 'completed'
 },
 {
 id: '3',
 lineId: '3',
 date: new Date(2023, 10, 10),
 description: 'Annual inspection and certification',
 technician: 'Alex Johnson',
 status: 'planned'
 }
 ]);
 
 // UI Control State
 const [selectedLine, setSelectedLine] = useState<ProductionLine | null>(null);
 const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
 const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
 const [selectedMaintenance, setSelectedMaintenance] = useState<MaintenanceLog | null>(null);
 
 const [formMode, setFormMode] = useState<FormMode>(null);
 
 const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'name', direction: 'asc' });
 const [statusFilter, setStatusFilter] = useState<string>('all');
 
 const location = useLocation();
 
 // Effects
 useEffect(() => {
 // Apply dark mode to document
 if (isDarkMode) {
 document.documentElement.classList.add('dark');
 localStorage.setItem('darkMode', 'true');
 } else {
 document.documentElement.classList.remove('dark');
 localStorage.setItem('darkMode', 'false');
 }
 }, [isDarkMode]);
 
 useEffect(() => {
 // Close mobile menu when changing routes
 setIsMobileMenuOpen(false);
 
 // Set active tab based on current route
 const path = location.pathname;
 if (path.includes('production-lines')) {
 setActiveTab('production-lines');
 } else if (path.includes('scheduling')) {
 setActiveTab('scheduling');
 } else if (path.includes('products')) {
 setActiveTab('products');
 } else if (path.includes('maintenance')) {
 setActiveTab('maintenance');
 } else if (path.includes('reports')) {
 setActiveTab('reports');
 } else {
 setActiveTab('dashboard');
 }
 }, [location]);
 
 // Helper functions
 const getProductNameById = (id: string): string => {
 const product = products.find(p => p.id === id);
 return product ? product.name : 'Unknown Product';
 };
 
 const getLineNameById = (id: string): string => {
 const line = productionLines.find(l => l.id === id);
 return line ? line.name : 'Unknown Line';
 };
 
 const formatDate = (date: Date): string => {
 return format(date, 'MMM d, yyyy');
 };
 
 const formatDateTime = (date: Date): string => {
 return format(date, 'MMM d, yyyy h:mm a');
 };
 
 const getStatusBadgeClass = (status: string): string => {
 switch(status) {
 case 'active':
 case 'completed':
 return 'badge badge-success';
 case 'maintenance':
 case 'in-progress':
 return 'badge badge-warning';
 case 'inactive':
 case 'canceled':
 return 'badge badge-error';
 case 'planned':
 case 'scheduled':
 return 'badge badge-info';
 default:
 return 'badge';
 }
 };
 
 const getPriorityBadgeClass = (priority: string): string => {
 switch(priority) {
 case 'high':
 return 'badge badge-error';
 case 'medium':
 return 'badge badge-warning';
 case 'low':
 return 'badge badge-info';
 default:
 return 'badge';
 }
 };
 
 const handleSort = (key: string) => {
 let direction: 'asc' | 'desc' = 'asc';
 if (sortConfig.key === key && sortConfig.direction === 'asc') {
 direction = 'desc';
 }
 setSortConfig({ key, direction });
 };
 
 const sortedProductionLines = [...productionLines].sort((a, b) => {
 if (sortConfig.key === 'name') {
 return sortConfig.direction === 'asc'
 ? a.name.localeCompare(b.name)
 : b.name.localeCompare(a.name);
 }
 if (sortConfig.key === 'capacity') {
 return sortConfig.direction === 'asc'
 ? a.capacity - b.capacity
 : b.capacity - a.capacity;
 }
 return 0;
 });
 
 const filteredProductionLines = sortedProductionLines.filter((line) => {
 return (
 (statusFilter === 'all' || line.status === statusFilter) &&
 (line.name.toLowerCase().includes(searchTerm.toLowerCase()))
 );
 });
 
 const handleAddLine = () => {
 setSelectedLine(null);
 setFormMode('add');
 };
 
 const handleEditLine = (line: ProductionLine) => {
 setSelectedLine(line);
 setFormMode('edit');
 };
 
 const handleDeleteLine = (id: string) => {
 if (window.confirm('Are you sure you want to delete this production line?')) {
 setProductionLines(productionLines.filter((line) => line.id !== id));
 }
 };
 
 const handleAddProduct = () => {
 setSelectedProduct(null);
 setFormMode('add');
 };
 
 const handleEditProduct = (product: Product) => {
 setSelectedProduct(product);
 setFormMode('edit');
 };
 
 const handleDeleteProduct = (id: string) => {
 if (window.confirm('Are you sure you want to delete this product?')) {
 setProducts(products.filter((product) => product.id !== id));
 }
 };
 
 const handleAddSchedule = () => {
 setSelectedSchedule(null);
 setFormMode('add');
 };
 
 const handleEditSchedule = (schedule: Schedule) => {
 setSelectedSchedule(schedule);
 setFormMode('edit');
 };
 
 const handleDeleteSchedule = (id: string) => {
 if (window.confirm('Are you sure you want to delete this schedule?')) {
 setSchedules(schedules.filter((schedule) => schedule.id !== id));
 }
 };
 
 const handleAddMaintenance = () => {
 setSelectedMaintenance(null);
 setFormMode('add');
 };
 
 const handleEditMaintenance = (maintenance: MaintenanceLog) => {
 setSelectedMaintenance(maintenance);
 setFormMode('edit');
 };
 
 const handleDeleteMaintenance = (id: string) => {
 if (window.confirm('Are you sure you want to delete this maintenance log?')) {
 setMaintenanceLogs(maintenanceLogs.filter((log) => log.id !== id));
 }
 };
 
 const closeForm = () => {
 setFormMode(null);
 setSelectedLine(null);
 setSelectedProduct(null);
 setSelectedSchedule(null);
 setSelectedMaintenance(null);
 };
 
 // Forms using react-hook-form
 const LineForm: React.FC = () => {
 const { register, handleSubmit, formState: { errors } } = useForm<ProductionLine>({
 defaultValues: selectedLine || {
 id: '',
 name: '',
 status: 'inactive',
 capacity: 0,
 lastMaintenance: new Date(),
 nextMaintenance: new Date()
 }
 });
 
 const onSubmit = (data: ProductionLine) => {
 if (formMode === 'add') {
 const newLine = {
 ...data,
 id: Math.random().toString(36).substr(2, 9)
 };
 setProductionLines([...productionLines, newLine]);
 } else if (formMode === 'edit' && selectedLine) {
 setProductionLines(
 productionLines.map((line) => (line.id === selectedLine.id ? { ...line, ...data } : line))
 );
 }
 closeForm();
 };
 
 return (
 <div className="modal-backdrop">
 <div className="modal-content max-w-lg">
 <div className="modal-header">
 <h3 className="text-lg font-medium text-gray-900 dark:text-white">
 {formMode === 'add' ? 'Add New Production Line' : 'Edit Production Line'}
 </h3>
 <button className="text-gray-400 hover:text-gray-500" onClick={closeForm} aria-label="Close">
 <X size={20} />
 </button>
 </div>
 <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
 <div className="form-group">
 <label className="form-label" htmlFor="name">Line Name</label>
 <input
 id="name"
 className="input"
 {...register('name', { required: 'Line name is required' })}
 />
 {errors.name && <p className="form-error">{errors.name.message}</p>}
 </div>
 
 <div className="form-group">
 <label className="form-label" htmlFor="status">Status</label>
 <select
 id="status"
 className="input"
 {...register('status')}
 >
 <option value="active">Active</option>
 <option value="maintenance">Maintenance</option>
 <option value="inactive">Inactive</option>
 </select>
 </div>
 
 <div className="form-group">
 <label className="form-label" htmlFor="capacity">Capacity (units/day)</label>
 <input
 id="capacity"
 type="number"
 className="input"
 {...register('capacity', { 
 required: 'Capacity is required',
 min: { value: 1, message: 'Capacity must be at least 1' } 
 })}
 />
 {errors.capacity && <p className="form-error">{errors.capacity.message}</p>}
 </div>
 
 <div className="form-group">
 <label className="form-label" htmlFor="lastMaintenance">Last Maintenance</label>
 <input
 id="lastMaintenance"
 type="date"
 className="input"
 {...register('lastMaintenance', { 
 valueAsDate: true,
 required: 'Last maintenance date is required' 
 })}
 />
 {errors.lastMaintenance && <p className="form-error">{errors.lastMaintenance.message}</p>}
 </div>
 
 <div className="form-group">
 <label className="form-label" htmlFor="nextMaintenance">Next Maintenance</label>
 <input
 id="nextMaintenance"
 type="date"
 className="input"
 {...register('nextMaintenance', { 
 valueAsDate: true,
 required: 'Next maintenance date is required' 
 })}
 />
 {errors.nextMaintenance && <p className="form-error">{errors.nextMaintenance.message}</p>}
 </div>
 
 <div className="modal-footer">
 <button type="button" className="btn bg-gray-100 text-gray-700 hover:bg-gray-200" onClick={closeForm}>
 Cancel
 </button>
 <button type="submit" className="btn btn-primary">
 {formMode === 'add' ? 'Add Line' : 'Save Changes'}
 </button>
 </div>
 </form>
 </div>
 </div>
 );
 };
 
 const ProductForm: React.FC = () => {
 const { register, handleSubmit, formState: { errors } } = useForm<Product>({
 defaultValues: selectedProduct || {
 id: '',
 name: '',
 category: '',
 sku: '',
 unitOfMeasure: 'piece'
 }
 });
 
 const onSubmit = (data: Product) => {
 if (formMode === 'add') {
 const newProduct = {
 ...data,
 id: Math.random().toString(36).substr(2, 9)
 };
 setProducts([...products, newProduct]);
 } else if (formMode === 'edit' && selectedProduct) {
 setProducts(
 products.map((product) => (product.id === selectedProduct.id ? { ...product, ...data } : product))
 );
 }
 closeForm();
 };
 
 return (
 <div className="modal-backdrop">
 <div className="modal-content max-w-lg">
 <div className="modal-header">
 <h3 className="text-lg font-medium text-gray-900 dark:text-white">
 {formMode === 'add' ? 'Add New Product' : 'Edit Product'}
 </h3>
 <button className="text-gray-400 hover:text-gray-500" onClick={closeForm} aria-label="Close">
 <X size={20} />
 </button>
 </div>
 <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
 <div className="form-group">
 <label className="form-label" htmlFor="productName">Product Name</label>
 <input
 id="productName"
 className="input"
 {...register('name', { required: 'Product name is required' })}
 />
 {errors.name && <p className="form-error">{errors.name.message}</p>}
 </div>
 
 <div className="form-group">
 <label className="form-label" htmlFor="category">Category</label>
 <input
 id="category"
 className="input"
 {...register('category', { required: 'Category is required' })}
 />
 {errors.category && <p className="form-error">{errors.category.message}</p>}
 </div>
 
 <div className="form-group">
 <label className="form-label" htmlFor="sku">SKU</label>
 <input
 id="sku"
 className="input"
 {...register('sku', { required: 'SKU is required' })}
 />
 {errors.sku && <p className="form-error">{errors.sku.message}</p>}
 </div>
 
 <div className="form-group">
 <label className="form-label" htmlFor="unitOfMeasure">Unit of Measure</label>
 <select
 id="unitOfMeasure"
 className="input"
 {...register('unitOfMeasure')}
 >
 <option value="piece">Piece</option>
 <option value="kg">Kilogram</option>
 <option value="liter">Liter</option>
 <option value="meter">Meter</option>
 </select>
 </div>
 
 <div className="modal-footer">
 <button type="button" className="btn bg-gray-100 text-gray-700 hover:bg-gray-200" onClick={closeForm}>
 Cancel
 </button>
 <button type="submit" className="btn btn-primary">
 {formMode === 'add' ? 'Add Product' : 'Save Changes'}
 </button>
 </div>
 </form>
 </div>
 </div>
 );
 };
 
 const ScheduleForm: React.FC = () => {
 const { register, handleSubmit, formState: { errors } } = useForm<Schedule>({
 defaultValues: selectedSchedule || {
 id: '',
 lineId: '',
 productId: '',
 startTime: new Date(),
 endTime: new Date(),
 targetQuantity: 0,
 priority: 'medium',
 status: 'scheduled'
 }
 });
 
 const onSubmit = (data: Schedule) => {
 if (formMode === 'add') {
 const newSchedule = {
 ...data,
 id: Math.random().toString(36).substr(2, 9)
 };
 setSchedules([...schedules, newSchedule]);
 } else if (formMode === 'edit' && selectedSchedule) {
 setSchedules(
 schedules.map((schedule) => (schedule.id === selectedSchedule.id ? { ...schedule, ...data } : schedule))
 );
 }
 closeForm();
 };
 
 return (
 <div className="modal-backdrop">
 <div className="modal-content max-w-lg">
 <div className="modal-header">
 <h3 className="text-lg font-medium text-gray-900 dark:text-white">
 {formMode === 'add' ? 'Add New Production Schedule' : 'Edit Production Schedule'}
 </h3>
 <button className="text-gray-400 hover:text-gray-500" onClick={closeForm} aria-label="Close">
 <X size={20} />
 </button>
 </div>
 <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
 <div className="form-group">
 <label className="form-label" htmlFor="lineId">Production Line</label>
 <select
 id="lineId"
 className="input"
 {...register('lineId', { required: 'Production line is required' })}
 >
 <option value="">Select a Production Line</option>
 {productionLines.map((line) => (
 <option key={line.id} value={line.id}>{line.name}</option>
 ))}
 </select>
 {errors.lineId && <p className="form-error">{errors.lineId.message}</p>}
 </div>
 
 <div className="form-group">
 <label className="form-label" htmlFor="productId">Product</label>
 <select
 id="productId"
 className="input"
 {...register('productId', { required: 'Product is required' })}
 >
 <option value="">Select a Product</option>
 {products.map((product) => (
 <option key={product.id} value={product.id}>{product.name}</option>
 ))}
 </select>
 {errors.productId && <p className="form-error">{errors.productId.message}</p>}
 </div>
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="form-group">
 <label className="form-label" htmlFor="startTime">Start Time</label>
 <input
 id="startTime"
 type="datetime-local"
 className="input"
 {...register('startTime', { 
 valueAsDate: true,
 required: 'Start time is required' 
 })}
 />
 {errors.startTime && <p className="form-error">{errors.startTime.message}</p>}
 </div>
 
 <div className="form-group">
 <label className="form-label" htmlFor="endTime">End Time</label>
 <input
 id="endTime"
 type="datetime-local"
 className="input"
 {...register('endTime', { 
 valueAsDate: true,
 required: 'End time is required' 
 })}
 />
 {errors.endTime && <p className="form-error">{errors.endTime.message}</p>}
 </div>
 </div>
 
 <div className="form-group">
 <label className="form-label" htmlFor="targetQuantity">Target Quantity</label>
 <input
 id="targetQuantity"
 type="number"
 className="input"
 {...register('targetQuantity', { 
 required: 'Target quantity is required',
 min: { value: 1, message: 'Target quantity must be at least 1' } 
 })}
 />
 {errors.targetQuantity && <p className="form-error">{errors.targetQuantity.message}</p>}
 </div>
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="form-group">
 <label className="form-label" htmlFor="priority">Priority</label>
 <select
 id="priority"
 className="input"
 {...register('priority')}
 >
 <option value="low">Low</option>
 <option value="medium">Medium</option>
 <option value="high">High</option>
 </select>
 </div>
 
 <div className="form-group">
 <label className="form-label" htmlFor="status">Status</label>
 <select
 id="status"
 className="input"
 {...register('status')}
 >
 <option value="scheduled">Scheduled</option>
 <option value="in-progress">In Progress</option>
 <option value="completed">Completed</option>
 <option value="canceled">Canceled</option>
 </select>
 </div>
 </div>
 
 <div className="modal-footer">
 <button type="button" className="btn bg-gray-100 text-gray-700 hover:bg-gray-200" onClick={closeForm}>
 Cancel
 </button>
 <button type="submit" className="btn btn-primary">
 {formMode === 'add' ? 'Add Schedule' : 'Save Changes'}
 </button>
 </div>
 </form>
 </div>
 </div>
 );
 };
 
 const MaintenanceForm: React.FC = () => {
 const { register, handleSubmit, formState: { errors } } = useForm<MaintenanceLog>({
 defaultValues: selectedMaintenance || {
 id: '',
 lineId: '',
 date: new Date(),
 description: '',
 technician: '',
 status: 'planned'
 }
 });
 
 const onSubmit = (data: MaintenanceLog) => {
 if (formMode === 'add') {
 const newMaintenance = {
 ...data,
 id: Math.random().toString(36).substr(2, 9)
 };
 setMaintenanceLogs([...maintenanceLogs, newMaintenance]);
 } else if (formMode === 'edit' && selectedMaintenance) {
 setMaintenanceLogs(
 maintenanceLogs.map((log) => (log.id === selectedMaintenance.id ? { ...log, ...data } : log))
 );
 }
 closeForm();
 };
 
 return (
 <div className="modal-backdrop">
 <div className="modal-content max-w-lg">
 <div className="modal-header">
 <h3 className="text-lg font-medium text-gray-900 dark:text-white">
 {formMode === 'add' ? 'Add New Maintenance Log' : 'Edit Maintenance Log'}
 </h3>
 <button className="text-gray-400 hover:text-gray-500" onClick={closeForm} aria-label="Close">
 <X size={20} />
 </button>
 </div>
 <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
 <div className="form-group">
 <label className="form-label" htmlFor="maintenanceLineId">Production Line</label>
 <select
 id="maintenanceLineId"
 className="input"
 {...register('lineId', { required: 'Production line is required' })}
 >
 <option value="">Select a Production Line</option>
 {productionLines.map((line) => (
 <option key={line.id} value={line.id}>{line.name}</option>
 ))}
 </select>
 {errors.lineId && <p className="form-error">{errors.lineId.message}</p>}
 </div>
 
 <div className="form-group">
 <label className="form-label" htmlFor="maintenanceDate">Maintenance Date</label>
 <input
 id="maintenanceDate"
 type="date"
 className="input"
 {...register('date', { 
 valueAsDate: true,
 required: 'Maintenance date is required' 
 })}
 />
 {errors.date && <p className="form-error">{errors.date.message}</p>}
 </div>
 
 <div className="form-group">
 <label className="form-label" htmlFor="description">Description</label>
 <textarea
 id="description"
 className="input"
 rows={3}
 {...register('description', { required: 'Description is required' })}
 ></textarea>
 {errors.description && <p className="form-error">{errors.description.message}</p>}
 </div>
 
 <div className="form-group">
 <label className="form-label" htmlFor="technician">Technician</label>
 <input
 id="technician"
 className="input"
 {...register('technician', { required: 'Technician name is required' })}
 />
 {errors.technician && <p className="form-error">{errors.technician.message}</p>}
 </div>
 
 <div className="form-group">
 <label className="form-label" htmlFor="maintenanceStatus">Status</label>
 <select
 id="maintenanceStatus"
 className="input"
 {...register('status')}
 >
 <option value="planned">Planned</option>
 <option value="in-progress">In Progress</option>
 <option value="completed">Completed</option>
 </select>
 </div>
 
 <div className="modal-footer">
 <button type="button" className="btn bg-gray-100 text-gray-700 hover:bg-gray-200" onClick={closeForm}>
 Cancel
 </button>
 <button type="submit" className="btn btn-primary">
 {formMode === 'add' ? 'Add Maintenance Log' : 'Save Changes'}
 </button>
 </div>
 </form>
 </div>
 </div>
 );
 };
 
 // Dashboard Components
 const DashboardPage: React.FC = () => {
 return (
 <div className="space-y-6">
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
 <div className="stat-card">
 <div className="stat-title">Production Lines</div>
 <div className="stat-value">{productionLines.length}</div>
 <div className="stat-desc">
 {productionLines.filter(l => l.status === 'active').length} Active
 </div>
 </div>
 
 <div className="stat-card">
 <div className="stat-title">Products</div>
 <div className="stat-value">{products.length}</div>
 <div className="stat-desc">In Production</div>
 </div>
 
 <div className="stat-card">
 <div className="stat-title">Today's Schedules</div>
 <div className="stat-value">
 {schedules.filter(s => 
 new Date(s.startTime).toDateString() === new Date().toDateString()
 ).length}
 </div>
 <div className="stat-desc">
 {schedules.filter(s => 
 new Date(s.startTime).toDateString() === new Date().toDateString() && 
 s.status === 'in-progress'
 ).length} In Progress
 </div>
 </div>
 
 <div className="stat-card">
 <div className="stat-title">Pending Maintenance</div>
 <div className="stat-value">
 {maintenanceLogs.filter(m => m.status !== 'completed').length}
 </div>
 <div className="stat-desc">
 {maintenanceLogs.filter(m => m.status === 'in-progress').length} In Progress
 </div>
 </div>
 </div>
 
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 <div className="card lg:col-span-2">
 <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Today's Production Schedule</h3>
 <div className="table-container">
 <table className="table">
 <thead>
 <tr>
 <th className="table-header">Line</th>
 <th className="table-header">Product</th>
 <th className="table-header hidden md:table-cell">Time</th>
 <th className="table-header hidden sm:table-cell">Target</th>
 <th className="table-header">Status</th>
 </tr>
 </thead>
 <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
 {schedules
 .filter(s => new Date(s.startTime).toDateString() === new Date().toDateString())
 .slice(0, 5)
 .map((schedule) => (
 <tr key={schedule.id}>
 <td className="table-cell">{getLineNameById(schedule.lineId)}</td>
 <td className="table-cell">{getProductNameById(schedule.productId)}</td>
 <td className="table-cell hidden md:table-cell">
 {format(new Date(schedule.startTime), 'h:mm a')} - {format(new Date(schedule.endTime), 'h:mm a')}
 </td>
 <td className="table-cell hidden sm:table-cell">{schedule.targetQuantity}</td>
 <td className="table-cell">
 <span className={getStatusBadgeClass(schedule.status)}>
 {schedule.status.charAt(0).toUpperCase() + schedule.status.slice(1)}
 </span>
 </td>
 </tr>
 ))}
 {schedules.filter(s => new Date(s.startTime).toDateString() === new Date().toDateString()).length === 0 && (
 <tr>
 <td colSpan={5} className="table-cell text-center py-4">No schedules for today</td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 {schedules.filter(s => new Date(s.startTime).toDateString() === new Date().toDateString()).length > 5 && (
 <div className="mt-2 text-right">
 <Link to="/scheduling" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium">
 View All Schedules
 </Link>
 </div>
 )}
 </div>
 
 <div className="card">
 <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Alerts &amp; Notifications</h3>
 <div className="space-y-4">
 {currentAlerts.map((alert) => (
 <div 
 key={alert.id}
 className={`alert ${alert.type === 'warning' ? 'alert-warning' : 
 alert.type === 'error' ? 'alert-error' : 
 alert.type === 'success' ? 'alert-success' : 'alert-info'}`}
 >
 {alert.type === 'warning' && <AlertTriangle size={16} className="shrink-0" />}
 {alert.type === 'error' && <AlertTriangle size={16} className="shrink-0" />}
 {alert.type === 'success' && <CheckCircle2 size={16} className="shrink-0" />}
 {alert.type === 'info' && <CheckCircle2 size={16} className="shrink-0" />}
 <div>
 <p className="text-sm font-medium">{alert.message}</p>
 <p className="text-xs opacity-70">{formatDateTime(new Date(alert.timestamp))}</p>
 </div>
 </div>
 ))}
 {currentAlerts.length === 0 && (
 <div className="text-center py-4 text-gray-500 dark:text-gray-400">
 No alerts or notifications
 </div>
 )}
 </div>
 </div>
 </div>
 
 <div className="card">
 <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Upcoming Maintenance</h3>
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
 {maintenanceLogs
 .filter(log => log.status !== 'completed')
 .slice(0, 3)
 .map((log) => (
 <div key={log.id} className="card-responsive bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
 <h4 className="font-medium">{getLineNameById(log.lineId)}</h4>
 <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{log.description}</p>
 <div className="flex justify-between items-center mt-3">
 <div className="text-xs text-gray-500 dark:text-gray-400">
 <Calendar size={14} className="inline mr-1" />
 {formatDate(new Date(log.date))}
 </div>
 <span className={getStatusBadgeClass(log.status)}>
 {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
 </span>
 </div>
 </div>
 ))}
 {maintenanceLogs.filter(log => log.status !== 'completed').length === 0 && (
 <div className="col-span-full text-center py-4 text-gray-500 dark:text-gray-400">
 No upcoming maintenance scheduled
 </div>
 )}
 </div>
 {maintenanceLogs.filter(log => log.status !== 'completed').length > 3 && (
 <div className="mt-4 text-right">
 <Link to="/maintenance" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium">
 View All Maintenance
 </Link>
 </div>
 )}
 </div>
 </div>
 );
 };
 
 const ProductionLinesPage: React.FC = () => {
 return (
 <div className="space-y-6">
 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
 <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Production Lines</h1>
 <button 
 className="btn btn-primary flex items-center" 
 onClick={handleAddLine}
 aria-label="Add New Production Line"
 >
 <Plus size={16} className="mr-1" /> Add Line
 </button>
 </div>
 
 <div className="flex flex-col sm:flex-row gap-4 justify-between">
 <div className="relative flex-1 max-w-md">
 <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
 <input
 type="text"
 className="input pl-10"
 placeholder="Search production lines..."
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 aria-label="Search production lines"
 />
 </div>
 
 <div className="flex flex-col sm:flex-row gap-2">
 <select
 className="input"
 value={statusFilter}
 onChange={(e) => setStatusFilter(e.target.value)}
 aria-label="Filter by status"
 >
 <option value="all">All Statuses</option>
 <option value="active">Active</option>
 <option value="maintenance">Maintenance</option>
 <option value="inactive">Inactive</option>
 </select>
 </div>
 </div>
 
 <div className="table-container">
 <table className="table">
 <thead>
 <tr>
 <th 
 className="table-header cursor-pointer"
 onClick={() => handleSort('name')}
 >
 <div className="flex items-center">
 Name
 <ArrowUpDown size={14} className="ml-1" />
 </div>
 </th>
 <th className="table-header">Status</th>
 <th 
 className="table-header cursor-pointer hidden md:table-cell"
 onClick={() => handleSort('capacity')}
 >
 <div className="flex items-center">
 Capacity
 <ArrowUpDown size={14} className="ml-1" />
 </div>
 </th>
 <th className="table-header hidden lg:table-cell">Last Maintenance</th>
 <th className="table-header hidden sm:table-cell">Next Maintenance</th>
 <th className="table-header text-right">Actions</th>
 </tr>
 </thead>
 <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
 {filteredProductionLines.map((line) => (
 <tr key={line.id}>
 <td className="table-cell font-medium">{line.name}</td>
 <td className="table-cell">
 <span className={getStatusBadgeClass(line.status)}>
 {line.status.charAt(0).toUpperCase() + line.status.slice(1)}
 </span>
 </td>
 <td className="table-cell hidden md:table-cell">{line.capacity} units/day</td>
 <td className="table-cell hidden lg:table-cell">{formatDate(new Date(line.lastMaintenance))}</td>
 <td className="table-cell hidden sm:table-cell">{formatDate(new Date(line.nextMaintenance))}</td>
 <td className="table-cell text-right">
 <div className="flex justify-end gap-2">
 <button 
 className="btn btn-sm bg-gray-100 text-gray-700 hover:bg-gray-200"
 onClick={() => handleEditLine(line)}
 aria-label={`Edit ${line.name}`}
 >
 <Edit size={14} />
 </button>
 <button 
 className="btn btn-sm bg-red-100 text-red-700 hover:bg-red-200"
 onClick={() => handleDeleteLine(line.id)}
 aria-label={`Delete ${line.name}`}
 >
 <Trash2 size={14} />
 </button>
 </div>
 </td>
 </tr>
 ))}
 {filteredProductionLines.length === 0 && (
 <tr>
 <td colSpan={6} className="table-cell text-center py-8">
 No production lines found. {searchTerm && 'Try a different search term.'}
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 </div>
 );
 };
 
 const ProductsPage: React.FC = () => {
 return (
 <div className="space-y-6">
 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
 <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Products</h1>
 <button 
 className="btn btn-primary flex items-center" 
 onClick={handleAddProduct}
 aria-label="Add New Product"
 >
 <Plus size={16} className="mr-1" /> Add Product
 </button>
 </div>
 
 <div className="relative max-w-md">
 <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
 <input
 type="text"
 className="input pl-10"
 placeholder="Search products..."
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 aria-label="Search products"
 />
 </div>
 
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
 {products
 .filter(product => product.name.toLowerCase().includes(searchTerm.toLowerCase()))
 .map((product) => (
 <div key={product.id} className="card">
 <div className="flex justify-between items-start">
 <div>
 <h3 className="text-lg font-medium text-gray-900 dark:text-white">{product.name}</h3>
 <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Category: {product.category}</p>
 <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">SKU: {product.sku}</p>
 <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Unit: {product.unitOfMeasure}</p>
 </div>
 <div className="flex gap-2">
 <button 
 className="btn btn-sm bg-gray-100 text-gray-700 hover:bg-gray-200"
 onClick={() => handleEditProduct(product)}
 aria-label={`Edit ${product.name}`}
 >
 <Edit size={14} />
 </button>
 <button 
 className="btn btn-sm bg-red-100 text-red-700 hover:bg-red-200"
 onClick={() => handleDeleteProduct(product.id)}
 aria-label={`Delete ${product.name}`}
 >
 <Trash2 size={14} />
 </button>
 </div>
 </div>
 <div className="mt-4">
 <div className="text-xs text-gray-500 dark:text-slate-400">
 Current Schedule:
 </div>
 {schedules.some(s => s.productId === product.id && s.status !== 'completed') ? (
 <div className="mt-1 text-sm">
 {schedules
 .filter(s => s.productId === product.id && s.status !== 'completed')
 .slice(0, 1)
 .map(s => (
 <div key={s.id} className="flex items-center justify-between">
 <div className="flex items-center">
 <Calendar size={14} className="mr-1 text-gray-500" />
 <span>{format(new Date(s.startTime), 'MMM d')}</span>
 </div>
 <span className={getStatusBadgeClass(s.status)}>
 {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
 </span>
 </div>
 ))}
 </div>
 ) : (
 <div className="mt-1 text-xs text-gray-400 dark:text-gray-500">
 No active schedules
 </div>
 )}
 </div>
 </div>
 ))}
 {products.filter(product => product.name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
 <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
 No products found. {searchTerm && 'Try a different search term.'}
 </div>
 )}
 </div>
 </div>
 );
 };
 
 const SchedulingPage: React.FC = () => {
 return (
 <div className="space-y-6">
 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
 <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Production Scheduling</h1>
 <button 
 className="btn btn-primary flex items-center" 
 onClick={handleAddSchedule}
 aria-label="Add New Schedule"
 >
 <Plus size={16} className="mr-1" /> Add Schedule
 </button>
 </div>
 
 <div className="flex flex-col md:flex-row gap-4 justify-between">
 <div className="relative flex-1 max-w-md">
 <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
 <input
 type="text"
 className="input pl-10"
 placeholder="Search schedules..."
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 aria-label="Search schedules"
 />
 </div>
 
 <div className="flex flex-wrap gap-2">
 <select
 className="input"
 value={statusFilter}
 onChange={(e) => setStatusFilter(e.target.value)}
 aria-label="Filter by status"
 >
 <option value="all">All Statuses</option>
 <option value="scheduled">Scheduled</option>
 <option value="in-progress">In Progress</option>
 <option value="completed">Completed</option>
 <option value="canceled">Canceled</option>
 </select>
 </div>
 </div>
 
 <div className="table-container">
 <table className="table">
 <thead>
 <tr>
 <th className="table-header">Line</th>
 <th className="table-header">Product</th>
 <th className="table-header hidden md:table-cell">Start Time</th>
 <th className="table-header hidden md:table-cell">End Time</th>
 <th className="table-header hidden sm:table-cell">Target Qty</th>
 <th className="table-header">Priority</th>
 <th className="table-header">Status</th>
 <th className="table-header text-right">Actions</th>
 </tr>
 </thead>
 <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
 {schedules
 .filter(schedule => {
 const searchMatch = getProductNameById(schedule.productId).toLowerCase().includes(searchTerm.toLowerCase()) ||
 getLineNameById(schedule.lineId).toLowerCase().includes(searchTerm.toLowerCase());
 const statusMatch = statusFilter === 'all' || schedule.status === statusFilter;
 return searchMatch && statusMatch;
 })
 .map((schedule) => (
 <tr key={schedule.id}>
 <td className="table-cell">{getLineNameById(schedule.lineId)}</td>
 <td className="table-cell">{getProductNameById(schedule.productId)}</td>
 <td className="table-cell hidden md:table-cell">{formatDateTime(new Date(schedule.startTime))}</td>
 <td className="table-cell hidden md:table-cell">{formatDateTime(new Date(schedule.endTime))}</td>
 <td className="table-cell hidden sm:table-cell">{schedule.targetQuantity}</td>
 <td className="table-cell">
 <span className={getPriorityBadgeClass(schedule.priority)}>
 {schedule.priority.charAt(0).toUpperCase() + schedule.priority.slice(1)}
 </span>
 </td>
 <td className="table-cell">
 <span className={getStatusBadgeClass(schedule.status)}>
 {schedule.status.charAt(0).toUpperCase() + schedule.status.slice(1)}
 </span>
 </td>
 <td className="table-cell text-right">
 <div className="flex justify-end gap-2">
 <button 
 className="btn btn-sm bg-gray-100 text-gray-700 hover:bg-gray-200"
 onClick={() => handleEditSchedule(schedule)}
 aria-label={`Edit schedule for ${getProductNameById(schedule.productId)}`}
 >
 <Edit size={14} />
 </button>
 <button 
 className="btn btn-sm bg-red-100 text-red-700 hover:bg-red-200"
 onClick={() => handleDeleteSchedule(schedule.id)}
 aria-label={`Delete schedule for ${getProductNameById(schedule.productId)}`}
 >
 <Trash2 size={14} />
 </button>
 </div>
 </td>
 </tr>
 ))}
 {schedules
 .filter(schedule => {
 const searchMatch = getProductNameById(schedule.productId).toLowerCase().includes(searchTerm.toLowerCase()) ||
 getLineNameById(schedule.lineId).toLowerCase().includes(searchTerm.toLowerCase());
 const statusMatch = statusFilter === 'all' || schedule.status === statusFilter;
 return searchMatch && statusMatch;
 })
 .length === 0 && (
 <tr>
 <td colSpan={8} className="table-cell text-center py-8">
 No schedules found. {searchTerm && 'Try a different search term.'}
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 </div>
 );
 };
 
 const MaintenancePage: React.FC = () => {
 return (
 <div className="space-y-6">
 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
 <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Maintenance Logs</h1>
 <button 
 className="btn btn-primary flex items-center" 
 onClick={handleAddMaintenance}
 aria-label="Add New Maintenance Log"
 >
 <Plus size={16} className="mr-1" /> Add Maintenance
 </button>
 </div>
 
 <div className="flex flex-col md:flex-row gap-4 justify-between">
 <div className="relative flex-1 max-w-md">
 <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
 <input
 type="text"
 className="input pl-10"
 placeholder="Search maintenance logs..."
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 aria-label="Search maintenance logs"
 />
 </div>
 
 <div className="flex flex-wrap gap-2">
 <select
 className="input"
 value={statusFilter}
 onChange={(e) => setStatusFilter(e.target.value)}
 aria-label="Filter by status"
 >
 <option value="all">All Statuses</option>
 <option value="planned">Planned</option>
 <option value="in-progress">In Progress</option>
 <option value="completed">Completed</option>
 </select>
 </div>
 </div>
 
 <div className="table-container">
 <table className="table">
 <thead>
 <tr>
 <th className="table-header">Production Line</th>
 <th className="table-header">Date</th>
 <th className="table-header hidden md:table-cell">Description</th>
 <th className="table-header hidden sm:table-cell">Technician</th>
 <th className="table-header">Status</th>
 <th className="table-header text-right">Actions</th>
 </tr>
 </thead>
 <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
 {maintenanceLogs
 .filter(log => {
 const searchMatch = getLineNameById(log.lineId).toLowerCase().includes(searchTerm.toLowerCase()) ||
 log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
 log.technician.toLowerCase().includes(searchTerm.toLowerCase());
 const statusMatch = statusFilter === 'all' || log.status === statusFilter;
 return searchMatch && statusMatch;
 })
 .map((log) => (
 <tr key={log.id}>
 <td className="table-cell">{getLineNameById(log.lineId)}</td>
 <td className="table-cell">{formatDate(new Date(log.date))}</td>
 <td className="table-cell hidden md:table-cell">
 <div className="max-w-xs truncate">{log.description}</div>
 </td>
 <td className="table-cell hidden sm:table-cell">{log.technician}</td>
 <td className="table-cell">
 <span className={getStatusBadgeClass(log.status)}>
 {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
 </span>
 </td>
 <td className="table-cell text-right">
 <div className="flex justify-end gap-2">
 <button 
 className="btn btn-sm bg-gray-100 text-gray-700 hover:bg-gray-200"
 onClick={() => handleEditMaintenance(log)}
 aria-label={`Edit maintenance log for ${getLineNameById(log.lineId)}`}
 >
 <Edit size={14} />
 </button>
 <button 
 className="btn btn-sm bg-red-100 text-red-700 hover:bg-red-200"
 onClick={() => handleDeleteMaintenance(log.id)}
 aria-label={`Delete maintenance log for ${getLineNameById(log.lineId)}`}
 >
 <Trash2 size={14} />
 </button>
 </div>
 </td>
 </tr>
 ))}
 {maintenanceLogs
 .filter(log => {
 const searchMatch = getLineNameById(log.lineId).toLowerCase().includes(searchTerm.toLowerCase()) ||
 log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
 log.technician.toLowerCase().includes(searchTerm.toLowerCase());
 const statusMatch = statusFilter === 'all' || log.status === statusFilter;
 return searchMatch && statusMatch;
 })
 .length === 0 && (
 <tr>
 <td colSpan={6} className="table-cell text-center py-8">
 No maintenance logs found. {searchTerm && 'Try a different search term.'}
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 </div>
 );
 };
 
 const ReportsPage: React.FC = () => {
 return (
 <div className="space-y-6">
 <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Production Reports</h1>
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="card">
 <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Production Line Utilization</h3>
 <div className="aspect-w-16 aspect-h-9 bg-gray-100 dark:bg-gray-800 rounded-lg">
 <div className="flex items-center justify-center h-full">
 <div className="w-full px-4">
 {productionLines.map((line) => (
 <div key={line.id} className="mb-4">
 <div className="flex justify-between items-center mb-1">
 <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{line.name}</span>
 <span className="text-sm text-gray-600 dark:text-gray-400">
 {line.status === 'active' ? '100%' : line.status === 'maintenance' ? '0%' : '50%'}
 </span>
 </div>
 <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
 <div 
 className={`h-2.5 rounded-full ${line.status === 'active' ? 'bg-green-500' : 
 line.status === 'maintenance' ? 'bg-yellow-500' : 'bg-blue-500'}`}
 style={{ width: line.status === 'active' ? '100%' : line.status === 'maintenance' ? '0%' : '50%' }}
 ></div>
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>
 </div>
 
 <div className="card">
 <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Schedule Completion</h3>
 <div className="aspect-w-16 aspect-h-9 bg-gray-100 dark:bg-gray-800 rounded-lg">
 <div className="flex items-center justify-center h-full">
 <div className="grid grid-cols-2 gap-4 w-full p-4">
 <div className="text-center">
 <div className="text-3xl font-bold text-green-500">
 {schedules.filter(s => s.status === 'completed').length}
 </div>
 <div className="text-sm text-gray-500 dark:text-gray-400">Completed</div>
 </div>
 <div className="text-center">
 <div className="text-3xl font-bold text-yellow-500">
 {schedules.filter(s => s.status === 'in-progress').length}
 </div>
 <div className="text-sm text-gray-500 dark:text-gray-400">In Progress</div>
 </div>
 <div className="text-center">
 <div className="text-3xl font-bold text-blue-500">
 {schedules.filter(s => s.status === 'scheduled').length}
 </div>
 <div className="text-sm text-gray-500 dark:text-gray-400">Scheduled</div>
 </div>
 <div className="text-center">
 <div className="text-3xl font-bold text-red-500">
 {schedules.filter(s => s.status === 'canceled').length}
 </div>
 <div className="text-sm text-gray-500 dark:text-gray-400">Canceled</div>
 </div>
 </div>
 </div>
 </div>
 </div>
 
 <div className="card">
 <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Maintenance Status</h3>
 <div className="aspect-w-16 aspect-h-9 bg-gray-100 dark:bg-gray-800 rounded-lg">
 <div className="flex items-center justify-center h-full">
 <div className="grid grid-cols-3 gap-4 w-full p-4">
 <div className="text-center">
 <div className="text-3xl font-bold text-blue-500">
 {maintenanceLogs.filter(m => m.status === 'planned').length}
 </div>
 <div className="text-sm text-gray-500 dark:text-gray-400">Planned</div>
 </div>
 <div className="text-center">
 <div className="text-3xl font-bold text-yellow-500">
 {maintenanceLogs.filter(m => m.status === 'in-progress').length}
 </div>
 <div className="text-sm text-gray-500 dark:text-gray-400">In Progress</div>
 </div>
 <div className="text-center">
 <div className="text-3xl font-bold text-green-500">
 {maintenanceLogs.filter(m => m.status === 'completed').length}
 </div>
 <div className="text-sm text-gray-500 dark:text-gray-400">Completed</div>
 </div>
 </div>
 </div>
 </div>
 </div>
 
 <div className="card">
 <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Product Distribution</h3>
 <div className="aspect-w-16 aspect-h-9 bg-gray-100 dark:bg-gray-800 rounded-lg">
 <div className="flex items-center justify-center h-full">
 <div className="w-full px-4">
 {products.map((product) => {
 const productSchedules = schedules.filter(s => s.productId === product.id);
 const percentage = productSchedules.length > 0 
 ? Math.round((productSchedules.length / schedules.length) * 100) 
 : 0;
 
 return (
 <div key={product.id} className="mb-4">
 <div className="flex justify-between items-center mb-1">
 <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{product.name}</span>
 <span className="text-sm text-gray-600 dark:text-gray-400">{percentage}%</span>
 </div>
 <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
 <div 
 className="h-2.5 rounded-full bg-blue-500"
 style={{ width: `${percentage}%` }}
 ></div>
 </div>
 </div>
 );
 })}
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
 };
 
 return (
 <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 theme-transition-all ${styles.manufacturo}`}>
 <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 theme-transition">
 <div className="container-fluid py-3">
 <div className="flex items-center justify-between">
 <div className="flex items-center">
 <button 
 className="md:hidden btn btn-sm mr-2" 
 onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
 aria-label="Toggle menu"
 >
 {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
 </button>
 
 <Link to="/" className="flex items-center">
 <Factory size={24} className="text-primary-600 dark:text-primary-400" />
 <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">Manufacturo</span>
 </Link>
 </div>
 
 <div className="flex items-center gap-3">
 <div className="hidden sm:flex items-center space-x-2">
 <span className="text-sm dark:text-slate-300">Light</span>
 <button 
 className={styles.themeToggle} 
 onClick={() => setIsDarkMode(!isDarkMode)}
 aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
 >
 <span className={`${styles.themeToggleThumb} ${isDarkMode ? styles.themeToggleThumbDark : ''}`}></span>
 </button>
 <span className="text-sm dark:text-slate-300">Dark</span>
 </div>
 
 <div className="sm:hidden">
 <button 
 className="btn btn-sm" 
 onClick={() => setIsDarkMode(!isDarkMode)}
 aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
 >
 {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
 </button>
 </div>
 </div>
 </div>
 </div>
 </header>
 
 <div className="flex min-h-[calc(100vh-64px)]">
 <nav className={`md:w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 theme-transition ${isMobileMenuOpen ? styles.mobileMenuOpen : styles.mobileMenuClosed} md:relative md:block`}>
 <div className="p-4 space-y-2">
 <Link 
 to="/" 
 className={`flex items-center space-x-2 p-2 rounded-md ${activeTab === 'dashboard' ? 'bg-primary-50 text-primary-600 dark:bg-gray-700 dark:text-primary-400' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}`}
 onClick={() => setActiveTab('dashboard')}
 >
 <Home size={20} />
 <span>Dashboard</span>
 </Link>
 
 <Link 
 to="/production-lines" 
 className={`flex items-center space-x-2 p-2 rounded-md ${activeTab === 'production-lines' ? 'bg-primary-50 text-primary-600 dark:bg-gray-700 dark:text-primary-400' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}`}
 onClick={() => setActiveTab('production-lines')}
 >
 <Factory size={20} />
 <span>Production Lines</span>
 </Link>
 
 <Link 
 to="/scheduling" 
 className={`flex items-center space-x-2 p-2 rounded-md ${activeTab === 'scheduling' ? 'bg-primary-50 text-primary-600 dark:bg-gray-700 dark:text-primary-400' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}`}
 onClick={() => setActiveTab('scheduling')}
 >
 <Calendar size={20} />
 <span>Scheduling</span>
 </Link>
 
 <Link 
 to="/products" 
 className={`flex items-center space-x-2 p-2 rounded-md ${activeTab === 'products' ? 'bg-primary-50 text-primary-600 dark:bg-gray-700 dark:text-primary-400' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}`}
 onClick={() => setActiveTab('products')}
 >
 <Package size={20} />
 <span>Products</span>
 </Link>
 
 <Link 
 to="/maintenance" 
 className={`flex items-center space-x-2 p-2 rounded-md ${activeTab === 'maintenance' ? 'bg-primary-50 text-primary-600 dark:bg-gray-700 dark:text-primary-400' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}`}
 onClick={() => setActiveTab('maintenance')}
 >
 <Settings size={20} />
 <span>Maintenance</span>
 </Link>
 
 <Link 
 to="/reports" 
 className={`flex items-center space-x-2 p-2 rounded-md ${activeTab === 'reports' ? 'bg-primary-50 text-primary-600 dark:bg-gray-700 dark:text-primary-400' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}`}
 onClick={() => setActiveTab('reports')}
 >
 <BarChart size={20} />
 <span>Reports</span>
 </Link>
 </div>
 
 <div className="mt-auto p-4 border-t border-gray-200 dark:border-gray-700">
 <div className="flex items-center space-x-2 p-2 text-gray-700 dark:text-gray-300">
 <Users size={20} />
 <span>Team Access</span>
 </div>
 
 <div className="flex items-center space-x-2 p-2 text-gray-700 dark:text-gray-300">
 <Settings size={20} />
 <span>Settings</span>
 </div>
 </div>
 </nav>
 
 <main className="flex-1 p-4 md:p-6 overflow-auto">
 <div className="container-fluid">
 <Routes>
 <Route path="/" element={<DashboardPage />} />
 <Route path="/production-lines" element={<ProductionLinesPage />} />
 <Route path="/scheduling" element={<SchedulingPage />} />
 <Route path="/products" element={<ProductsPage />} />
 <Route path="/maintenance" element={<MaintenancePage />} />
 <Route path="/reports" element={<ReportsPage />} />
 <Route path="*" element={<DashboardPage />} />
 </Routes>
 </div>
 </main>
 </div>
 
 {formMode === 'add' || formMode === 'edit' ? (
 <>
 {activeTab === 'production-lines' && <LineForm />}
 {activeTab === 'products' && <ProductForm />}
 {activeTab === 'scheduling' && <ScheduleForm />}
 {activeTab === 'maintenance' && <MaintenanceForm />}
 </>
 ) : null}
 
 <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4 theme-transition">
 <div className="container-fluid">
 <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
 Copyright &copy; 2025 of Datavtar Private Limited. All rights reserved.
 </p>
 </div>
 </footer>
 </div>
 );
};

export default App;