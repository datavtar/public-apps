import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import {
  Truck,
  Package,
  MapPin,
  Calendar,
  Filter,
  Search,
  Plus,
  Edit,
  Trash2,
  Moon,
  Sun,
  ArrowDownUp,
  X,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';
import styles from './styles/styles.module.css';

// Define TypeScript interfaces
interface Shipment {
  id: string;
  trackingNumber: string;
  origin: string;
  destination: string;
  status: ShipmentStatus;
  carrier: string;
  departureDate: string;
  estimatedArrival: string;
  actualArrival?: string;
  items: ShipmentItem[];
  notes: string;
  priority: ShipmentPriority;
  customerId: string;
  cost: number;
  weight: number;
  createdAt: string;
  updatedAt: string;
}

interface ShipmentItem {
  id: string;
  name: string;
  quantity: number;
  weight: number;
  value: number;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface ShipmentFormData {
  trackingNumber: string;
  origin: string;
  destination: string;
  status: ShipmentStatus;
  carrier: string;
  departureDate: string;
  estimatedArrival: string;
  actualArrival?: string;
  notes: string;
  priority: ShipmentPriority;
  customerId: string;
  cost: number;
  weight: number;
  items: ShipmentItem[];
}

enum ShipmentStatus {
  PENDING = 'Pending',
  IN_TRANSIT = 'In Transit',
  DELIVERED = 'Delivered',
  DELAYED = 'Delayed',
  CANCELLED = 'Cancelled'
}

enum ShipmentPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  URGENT = 'Urgent'
}

// Sample data generator
const generateSampleData = (): { shipments: Shipment[], customers: Customer[] } => {
  const customers: Customer[] = [
    {
      id: '1',
      name: 'Acme Corporation',
      email: 'contact@acme.com',
      phone: '555-123-4567',
      address: '123 Main St, Metropolis, USA'
    },
    {
      id: '2',
      name: 'Globex Industries',
      email: 'info@globex.com',
      phone: '555-987-6543',
      address: '456 Tech Blvd, Silicon Valley, USA'
    },
    {
      id: '3',
      name: 'Wayne Enterprises',
      email: 'orders@wayne.com',
      phone: '555-789-0123',
      address: '789 Gotham Ave, Gotham City, USA'
    },
    {
      id: '4',
      name: 'Stark Industries',
      email: 'logistics@stark.com',
      phone: '555-456-7890',
      address: '1 Avengers Tower, New York, USA'
    },
    {
      id: '5',
      name: 'Oscorp',
      email: 'shipping@oscorp.com',
      phone: '555-321-0987',
      address: '42 Science Way, Boston, USA'
    }
  ];

  const carriers = ['FedEx', 'UPS', 'DHL', 'USPS', 'Amazon Logistics'];
  const statuses = Object.values(ShipmentStatus);
  const priorities = Object.values(ShipmentPriority);
  const itemNames = ['Electronics', 'Furniture', 'Clothing', 'Food Products', 'Medical Supplies', 'Machinery Parts', 'Books', 'Toys'];

  const shipments: Shipment[] = [];
  
  for (let i = 1; i <= 20; i++) {
    const departureDate = new Date();
    departureDate.setDate(departureDate.getDate() - Math.floor(Math.random() * 10));
    
    const estimatedArrival = new Date(departureDate);
    estimatedArrival.setDate(estimatedArrival.getDate() + Math.floor(Math.random() * 14) + 3);
    
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    let actualArrival;
    if (status === ShipmentStatus.DELIVERED) {
      actualArrival = new Date(estimatedArrival);
      actualArrival.setDate(actualArrival.getDate() + (Math.random() > 0.7 ? 1 : -1) * Math.floor(Math.random() * 3));
    }
    
    const items: ShipmentItem[] = [];
    const itemCount = Math.floor(Math.random() * 3) + 1;
    
    for (let j = 1; j <= itemCount; j++) {
      items.push({
        id: `item-${i}-${j}`,
        name: itemNames[Math.floor(Math.random() * itemNames.length)],
        quantity: Math.floor(Math.random() * 10) + 1,
        weight: parseFloat((Math.random() * 100).toFixed(2)),
        value: parseFloat((Math.random() * 1000).toFixed(2))
      });
    }
    
    const totalWeight = items.reduce((sum, item) => sum + item.weight * item.quantity, 0);
    const totalValue = items.reduce((sum, item) => sum + item.value * item.quantity, 0);
    
    shipments.push({
      id: `shipment-${i}`,
      trackingNumber: `TRK${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`,
      origin: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Miami'][Math.floor(Math.random() * 5)],
      destination: ['Seattle', 'Denver', 'Boston', 'Atlanta', 'San Francisco'][Math.floor(Math.random() * 5)],
      status: status,
      carrier: carriers[Math.floor(Math.random() * carriers.length)],
      departureDate: departureDate.toISOString().split('T')[0],
      estimatedArrival: estimatedArrival.toISOString().split('T')[0],
      actualArrival: actualArrival ? actualArrival.toISOString().split('T')[0] : undefined,
      items: items,
      notes: '',
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      customerId: customers[Math.floor(Math.random() * customers.length)].id,
      cost: parseFloat((Math.random() * 2000 + 500).toFixed(2)),
      weight: parseFloat(totalWeight.toFixed(2)),
      createdAt: new Date(departureDate).toISOString(),
      updatedAt: new Date().toISOString()
    });
  }
  
  return { shipments, customers };
};

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  
  // Main data state
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  
  // UI state
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'shipments' | 'customers'>('dashboard');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterPriority, setFilterPriority] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Shipment; direction: 'asc' | 'desc' } | null>(null);
  const [shipmentFormData, setShipmentFormData] = useState<ShipmentFormData>({
    trackingNumber: '',
    origin: '',
    destination: '',
    status: ShipmentStatus.PENDING,
    carrier: '',
    departureDate: '',
    estimatedArrival: '',
    notes: '',
    priority: ShipmentPriority.MEDIUM,
    customerId: '',
    cost: 0,
    weight: 0,
    items: [{ id: Date.now().toString(), name: '', quantity: 1, weight: 0, value: 0 }]
  });
  
  const [editingShipment, setEditingShipment] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Load data from localStorage on initial render
  useEffect(() => {
    try {
      const savedShipments = localStorage.getItem('shipments');
      const savedCustomers = localStorage.getItem('customers');
      
      if (savedShipments && savedCustomers) {
        setShipments(JSON.parse(savedShipments));
        setCustomers(JSON.parse(savedCustomers));
      } else {
        // Generate sample data if none exists
        const { shipments: sampleShipments, customers: sampleCustomers } = generateSampleData();
        setShipments(sampleShipments);
        setCustomers(sampleCustomers);
        
        // Save to localStorage
        localStorage.setItem('shipments', JSON.stringify(sampleShipments));
        localStorage.setItem('customers', JSON.stringify(sampleCustomers));
      }
    } catch (error) {
      console.error('Error loading data:', error);
      // Fallback to sample data
      const { shipments: sampleShipments, customers: sampleCustomers } = generateSampleData();
      setShipments(sampleShipments);
      setCustomers(sampleCustomers);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update localStorage when data changes
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('shipments', JSON.stringify(shipments));
      localStorage.setItem('customers', JSON.stringify(customers));
    }
  }, [shipments, customers, loading]);

  // Apply dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Handle escape key press for modal
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showModal) {
        closeModal();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [showModal]);

  // Handle modal click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        closeModal();
      }
    };

    if (showModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showModal]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const openModal = (shipmentId?: string) => {
    if (shipmentId) {
      // Edit existing shipment
      const shipment = shipments.find(s => s.id === shipmentId);
      if (shipment) {
        setShipmentFormData({
          trackingNumber: shipment.trackingNumber,
          origin: shipment.origin,
          destination: shipment.destination,
          status: shipment.status,
          carrier: shipment.carrier,
          departureDate: shipment.departureDate,
          estimatedArrival: shipment.estimatedArrival,
          actualArrival: shipment.actualArrival,
          notes: shipment.notes,
          priority: shipment.priority,
          customerId: shipment.customerId,
          cost: shipment.cost,
          weight: shipment.weight,
          items: [...shipment.items]
        });
        setEditingShipment(shipmentId);
      }
    } else {
      // New shipment
      resetForm();
      setEditingShipment(null);
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const resetForm = () => {
    setShipmentFormData({
      trackingNumber: '',
      origin: '',
      destination: '',
      status: ShipmentStatus.PENDING,
      carrier: '',
      departureDate: '',
      estimatedArrival: '',
      notes: '',
      priority: ShipmentPriority.MEDIUM,
      customerId: customers.length > 0 ? customers[0].id : '',
      cost: 0,
      weight: 0,
      items: [{ id: Date.now().toString(), name: '', quantity: 1, weight: 0, value: 0 }]
    });
  };

  const handleSort = (key: keyof Shipment) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setShipmentFormData(prev => ({
      ...prev,
      [name]: name === 'cost' || name === 'weight' ? parseFloat(value) || 0 : value
    }));
  };

  const handleItemChange = (e: React.ChangeEvent<HTMLInputElement>, itemId: string, field: keyof ShipmentItem) => {
    const { value } = e.target;
    setShipmentFormData(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === itemId) {
          let newValue: string | number = value;
          if (field === 'quantity' || field === 'weight' || field === 'value') {
            newValue = parseFloat(value) || 0;
          }
          return { ...item, [field]: newValue };
        }
        return item;
      })
    }));
  };

  const addItemField = () => {
    setShipmentFormData(prev => ({
      ...prev,
      items: [...prev.items, { id: Date.now().toString(), name: '', quantity: 1, weight: 0, value: 0 }]
    }));
  };

  const removeItemField = (itemId: string) => {
    setShipmentFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingShipment) {
      // Update existing shipment
      setShipments(prev => prev.map(shipment => {
        if (shipment.id === editingShipment) {
          return {
            ...shipment,
            ...shipmentFormData,
            updatedAt: new Date().toISOString()
          };
        }
        return shipment;
      }));
    } else {
      // Create new shipment
      const newShipment: Shipment = {
        ...shipmentFormData,
        id: `shipment-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setShipments(prev => [...prev, newShipment]);
    }
    
    closeModal();
  };

  const deleteShipment = (id: string) => {
    if (window.confirm('Are you sure you want to delete this shipment?')) {
      setShipments(prev => prev.filter(shipment => shipment.id !== id));
    }
  };

  // Filter and sort shipments
  const filteredShipments = shipments.filter(shipment => {
    const matchesSearch = 
      shipment.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.carrier.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus ? shipment.status === filterStatus : true;
    const matchesPriority = filterPriority ? shipment.priority === filterPriority : true;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const sortedShipments = [...filteredShipments].sort((a, b) => {
    if (!sortConfig) return 0;

    const key = sortConfig.key;
    
    // Handle different data types
    if (typeof a[key] === 'string' && typeof b[key] === 'string') {
      const aValue = (a[key] as string).toLowerCase();
      const bValue = (b[key] as string).toLowerCase();
      if (sortConfig.direction === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    } else if (typeof a[key] === 'number' && typeof b[key] === 'number') {
      if (sortConfig.direction === 'asc') {
        return (a[key] as number) - (b[key] as number);
      } else {
        return (b[key] as number) - (a[key] as number);
      }
    } else if (key === 'departureDate' || key === 'estimatedArrival' || key === 'actualArrival') {
      // Date comparison
      const aDate = a[key] ? new Date(a[key] as string).getTime() : 0;
      const bDate = b[key] ? new Date(b[key] as string).getTime() : 0;
      if (sortConfig.direction === 'asc') {
        return aDate - bDate;
      } else {
        return bDate - aDate;
      }
    }
    return 0;
  });

  // Calculate dashboard metrics
  const totalShipments = shipments.length;
  const inTransitCount = shipments.filter(s => s.status === ShipmentStatus.IN_TRANSIT).length;
  const deliveredCount = shipments.filter(s => s.status === ShipmentStatus.DELIVERED).length;
  const delayedCount = shipments.filter(s => s.status === ShipmentStatus.DELAYED).length;
  const pendingCount = shipments.filter(s => s.status === ShipmentStatus.PENDING).length;
  const cancelledCount = shipments.filter(s => s.status === ShipmentStatus.CANCELLED).length;

  // Prepare data for charts
  const statusChartData = [
    { name: 'In Transit', value: inTransitCount },
    { name: 'Delivered', value: deliveredCount },
    { name: 'Delayed', value: delayedCount },
    { name: 'Pending', value: pendingCount },
    { name: 'Cancelled', value: cancelledCount }
  ];

  const priorityChartData = [
    { name: 'Low', value: shipments.filter(s => s.priority === ShipmentPriority.LOW).length },
    { name: 'Medium', value: shipments.filter(s => s.priority === ShipmentPriority.MEDIUM).length },
    { name: 'High', value: shipments.filter(s => s.priority === ShipmentPriority.HIGH).length },
    { name: 'Urgent', value: shipments.filter(s => s.priority === ShipmentPriority.URGENT).length }
  ];

  // Prepare data for carrier distribution
  const carrierCounts: { [key: string]: number } = {};
  shipments.forEach(shipment => {
    carrierCounts[shipment.carrier] = (carrierCounts[shipment.carrier] || 0) + 1;
  });

  const carrierChartData = Object.keys(carrierCounts).map(carrier => ({
    name: carrier,
    value: carrierCounts[carrier]
  }));

  // Get shipments this month vs last month for trend analysis
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const thisMonthShipments = shipments.filter(s => new Date(s.createdAt) >= currentMonthStart);
  const lastMonthShipments = shipments.filter(s => {
    const date = new Date(s.createdAt);
    return date >= lastMonthStart && date < currentMonthStart;
  });

  const shipmentsTrend = thisMonthShipments.length - lastMonthShipments.length;
  const shipmentsTrendPercentage = lastMonthShipments.length ? 
    ((thisMonthShipments.length - lastMonthShipments.length) / lastMonthShipments.length * 100).toFixed(1) : 
    '0';

  // Prepare data for timeline chart (shipments by date)
  const shipmentsByDate: { [key: string]: number } = {};
  
  // Get the last 30 days
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateString = date.toISOString().split('T')[0];
    shipmentsByDate[dateString] = 0;
  }
  
  // Count shipments by created date
  shipments.forEach(shipment => {
    const createdDate = shipment.createdAt.split('T')[0];
    if (shipmentsByDate[createdDate] !== undefined) {
      shipmentsByDate[createdDate]++;
    }
  });
  
  const timelineChartData = Object.entries(shipmentsByDate).map(([date, count]) => ({
    date,
    count
  }));

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  const PRIORITY_COLORS = {
    [ShipmentPriority.LOW]: '#00C49F',
    [ShipmentPriority.MEDIUM]: '#0088FE',
    [ShipmentPriority.HIGH]: '#FFBB28',
    [ShipmentPriority.URGENT]: '#FF8042'
  };
  const STATUS_COLORS = {
    [ShipmentStatus.PENDING]: '#8884d8',
    [ShipmentStatus.IN_TRANSIT]: '#0088FE',
    [ShipmentStatus.DELIVERED]: '#00C49F',
    [ShipmentStatus.DELAYED]: '#FFBB28',
    [ShipmentStatus.CANCELLED]: '#FF8042'
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 theme-transition-all">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow theme-transition">
        <div className="container-fluid py-4">
          <div className="flex-between">
            <div className="flex items-center gap-2">
              <Truck size={24} className="text-primary-600 dark:text-primary-400" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Logistics Dashboard</h1>
            </div>
            <button
              onClick={toggleDarkMode}
              className="btn-sm bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full p-2 flex items-center justify-center"
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 theme-transition">
        <div className="container-fluid">
          <div className="flex overflow-x-auto">
            <button 
              className={`px-4 py-3 font-medium text-sm flex items-center gap-2 border-b-2 ${activeTab === 'dashboard' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 hover:border-gray-300 dark:hover:text-gray-300'} transition-colors`}
              onClick={() => setActiveTab('dashboard')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="9" />
                <rect x="14" y="3" width="7" height="5" />
                <rect x="14" y="12" width="7" height="9" />
                <rect x="3" y="16" width="7" height="5" />
              </svg>
              Dashboard
            </button>
            <button 
              className={`px-4 py-3 font-medium text-sm flex items-center gap-2 border-b-2 ${activeTab === 'shipments' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 hover:border-gray-300 dark:hover:text-gray-300'} transition-colors`}
              onClick={() => setActiveTab('shipments')}
            >
              <Truck size={20} />
              Shipments
            </button>
            <button 
              className={`px-4 py-3 font-medium text-sm flex items-center gap-2 border-b-2 ${activeTab === 'customers' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 hover:border-gray-300 dark:hover:text-gray-300'} transition-colors`}
              onClick={() => setActiveTab('customers')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              Customers
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container-fluid py-6">
        {loading ? (
          <div className="flex-center min-h-[40vh]">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600 dark:border-primary-400 mb-2"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <div>
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Dashboard Overview</h2>
                
                {/* Stats Overview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="stat-card theme-transition">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="stat-title">Total Shipments</p>
                        <p className="stat-value">{totalShipments}</p>
                        <p className="stat-desc flex items-center">
                          {shipmentsTrend >= 0 ? (
                            <span className="text-green-500 flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
                              </svg>
                              {shipmentsTrendPercentage}%
                            </span>
                          ) : (
                            <span className="text-red-500 flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                              </svg>
                              {Math.abs(Number(shipmentsTrendPercentage))}%
                            </span>
                          )} from last month
                        </p>
                      </div>
                      <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
                        <Truck size={24} className="text-primary-600 dark:text-primary-400" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="stat-card theme-transition">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="stat-title">In Transit</p>
                        <p className="stat-value">{inTransitCount}</p>
                        <p className="stat-desc">{((inTransitCount / totalShipments) * 100).toFixed(1)}% of total</p>
                      </div>
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  <div className="stat-card theme-transition">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="stat-title">Delivered</p>
                        <p className="stat-value">{deliveredCount}</p>
                        <p className="stat-desc">{((deliveredCount / totalShipments) * 100).toFixed(1)}% of total</p>
                      </div>
                      <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                        <CheckCircle size={24} className="text-green-600 dark:text-green-400" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="stat-card theme-transition">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="stat-title">Delayed</p>
                        <p className="stat-value">{delayedCount}</p>
                        <p className="stat-desc">{((delayedCount / totalShipments) * 100).toFixed(1)}% of total</p>
                      </div>
                      <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                        <AlertTriangle size={24} className="text-yellow-600 dark:text-yellow-400" />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  {/* Status Distribution */}
                  <div className="card theme-transition">
                    <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Shipment Status Distribution</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={statusChartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {statusChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name as ShipmentStatus] || COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value} shipments`, 'Count']} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4 justify-center">
                      {Object.entries(ShipmentStatus).map(([key, value]) => (
                        <div key={key} className="flex items-center">
                          <div className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: STATUS_COLORS[value] }}></div>
                          <span className="text-xs text-gray-600 dark:text-gray-400">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Priority Distribution */}
                  <div className="card theme-transition">
                    <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Shipment Priority Distribution</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={priorityChartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip formatter={(value) => [`${value} shipments`, 'Count']} />
                          <Bar dataKey="value" name="Count">
                            {priorityChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[entry.name as ShipmentPriority] || COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  {/* Shipments Timeline */}
                  <div className="card theme-transition lg:col-span-2">
                    <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Shipments Timeline (Last 30 days)</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={timelineChartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="date" 
                            tickFormatter={(date) => {
                              const d = new Date(date);
                              return `${d.getMonth() + 1}/${d.getDate()}`;
                            }}
                          />
                          <YAxis />
                          <Tooltip 
                            labelFormatter={(label) => {
                              const d = new Date(label);
                              return d.toLocaleDateString();
                            }}
                            formatter={(value) => [`${value} shipments`, 'Count']}
                          />
                          <Line type="monotone" dataKey="count" stroke="#0088FE" activeDot={{ r: 8 }} name="Shipments" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  {/* Carrier Distribution */}
                  <div className="card theme-transition lg:col-span-2">
                    <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Carrier Distribution</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={carrierChartData} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" width={100} />
                          <Tooltip formatter={(value) => [`${value} shipments`, 'Count']} />
                          <Bar dataKey="value" fill="#8884d8" name="Count" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
                
                {/* Recent Shipments */}
                <div className="card theme-transition">
                  <div className="flex-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Shipments</h3>
                    <button 
                      className="btn-sm btn-primary flex-center gap-2"
                      onClick={() => setActiveTab('shipments')}
                    >
                      View All <ArrowRight size={16} />
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800 dark:text-gray-400">
                        <tr>
                          <th className="px-4 py-3">Tracking #</th>
                          <th className="px-4 py-3">From → To</th>
                          <th className="px-4 py-3">Carrier</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3">Est. Delivery</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {sortedShipments.slice(0, 5).map(shipment => (
                          <tr key={shipment.id} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{shipment.trackingNumber}</td>
                            <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                              {shipment.origin} <ArrowRight size={14} className="inline mx-1" /> {shipment.destination}
                            </td>
                            <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{shipment.carrier}</td>
                            <td className="px-4 py-3">
                              <span className={`${styles.statusBadge} ${styles[`status${shipment.status.replace(/\s+/g, '')}`]}`}>
                                {shipment.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{shipment.estimatedArrival}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Shipments Tab */}
            {activeTab === 'shipments' && (
              <div>
                <div className="flex-between flex-col md:flex-row gap-4 mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Shipments</h2>
                  <div className="flex gap-2 w-full md:w-auto">
                    <button 
                      className="btn-primary flex-center gap-2 w-full md:w-auto"
                      onClick={() => openModal()}
                    >
                      <Plus size={16} />
                      Add Shipment
                    </button>
                  </div>
                </div>
                
                {/* Filters */}
                <div className="card theme-transition mb-6">
                  <div className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[200px]">
                      <label htmlFor="search" className="sr-only">Search</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Search size={16} className="text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="search"
                          className="input pl-10"
                          placeholder="Search tracking #, origin, destination..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="w-full sm:w-auto">
                      <label htmlFor="statusFilter" className="sr-only">Filter by Status</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Filter size={16} className="text-gray-400" />
                        </div>
                        <select
                          id="statusFilter"
                          className="input pl-10 pr-8 appearance-none"
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value)}
                        >
                          <option value="">All Statuses</option>
                          {Object.values(ShipmentStatus).map(status => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="w-full sm:w-auto">
                      <label htmlFor="priorityFilter" className="sr-only">Filter by Priority</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Filter size={16} className="text-gray-400" />
                        </div>
                        <select
                          id="priorityFilter"
                          className="input pl-10 pr-8 appearance-none"
                          value={filterPriority}
                          onChange={(e) => setFilterPriority(e.target.value)}
                        >
                          <option value="">All Priorities</option>
                          {Object.values(ShipmentPriority).map(priority => (
                            <option key={priority} value={priority}>{priority}</option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Shipments Table */}
                <div className="card theme-transition overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800 dark:text-gray-400">
                        <tr>
                          <th 
                            className="px-4 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => handleSort('trackingNumber')}
                          >
                            <div className="flex items-center gap-1">
                              Tracking #
                              {sortConfig?.key === 'trackingNumber' && (
                                <ArrowDownUp size={14} className={sortConfig.direction === 'asc' ? 'rotate-180' : ''} />
                              )}
                            </div>
                          </th>
                          <th 
                            className="px-4 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => handleSort('origin')}
                          >
                            <div className="flex items-center gap-1">
                              Origin
                              {sortConfig?.key === 'origin' && (
                                <ArrowDownUp size={14} className={sortConfig.direction === 'asc' ? 'rotate-180' : ''} />
                              )}
                            </div>
                          </th>
                          <th 
                            className="px-4 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => handleSort('destination')}
                          >
                            <div className="flex items-center gap-1">
                              Destination
                              {sortConfig?.key === 'destination' && (
                                <ArrowDownUp size={14} className={sortConfig.direction === 'asc' ? 'rotate-180' : ''} />
                              )}
                            </div>
                          </th>
                          <th 
                            className="px-4 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => handleSort('carrier')}
                          >
                            <div className="flex items-center gap-1">
                              Carrier
                              {sortConfig?.key === 'carrier' && (
                                <ArrowDownUp size={14} className={sortConfig.direction === 'asc' ? 'rotate-180' : ''} />
                              )}
                            </div>
                          </th>
                          <th 
                            className="px-4 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => handleSort('status')}
                          >
                            <div className="flex items-center gap-1">
                              Status
                              {sortConfig?.key === 'status' && (
                                <ArrowDownUp size={14} className={sortConfig.direction === 'asc' ? 'rotate-180' : ''} />
                              )}
                            </div>
                          </th>
                          <th 
                            className="px-4 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => handleSort('priority')}
                          >
                            <div className="flex items-center gap-1">
                              Priority
                              {sortConfig?.key === 'priority' && (
                                <ArrowDownUp size={14} className={sortConfig.direction === 'asc' ? 'rotate-180' : ''} />
                              )}
                            </div>
                          </th>
                          <th 
                            className="px-4 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => handleSort('departureDate')}
                          >
                            <div className="flex items-center gap-1">
                              Departure
                              {sortConfig?.key === 'departureDate' && (
                                <ArrowDownUp size={14} className={sortConfig.direction === 'asc' ? 'rotate-180' : ''} />
                              )}
                            </div>
                          </th>
                          <th 
                            className="px-4 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => handleSort('estimatedArrival')}
                          >
                            <div className="flex items-center gap-1">
                              Est. Arrival
                              {sortConfig?.key === 'estimatedArrival' && (
                                <ArrowDownUp size={14} className={sortConfig.direction === 'asc' ? 'rotate-180' : ''} />
                              )}
                            </div>
                          </th>
                          <th className="px-4 py-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {sortedShipments.length > 0 ? (
                          sortedShipments.map(shipment => (
                            <tr key={shipment.id} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                              <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{shipment.trackingNumber}</td>
                              <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{shipment.origin}</td>
                              <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{shipment.destination}</td>
                              <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{shipment.carrier}</td>
                              <td className="px-4 py-3">
                                <span className={`${styles.statusBadge} ${styles[`status${shipment.status.replace(/\s+/g, '')}`]}`}>
                                  {shipment.status}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`${styles.priorityBadge} ${styles[`priority${shipment.priority}`]}`}>
                                  {shipment.priority}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{shipment.departureDate}</td>
                              <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{shipment.estimatedArrival}</td>
                              <td className="px-4 py-3">
                                <div className="flex gap-2">
                                  <button 
                                    className="p-1 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                    onClick={() => openModal(shipment.id)}
                                    aria-label="Edit shipment"
                                  >
                                    <Edit size={16} />
                                  </button>
                                  <button 
                                    className="p-1 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                    onClick={() => deleteShipment(shipment.id)}
                                    aria-label="Delete shipment"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr className="bg-white dark:bg-gray-800">
                            <td colSpan={9} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                              No shipments found matching your criteria.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Customers Tab */}
            {activeTab === 'customers' && (
              <div>
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Customers</h2>
                
                <div className="card theme-transition">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800 dark:text-gray-400">
                        <tr>
                          <th className="px-4 py-3">ID</th>
                          <th className="px-4 py-3">Name</th>
                          <th className="px-4 py-3">Email</th>
                          <th className="px-4 py-3">Phone</th>
                          <th className="px-4 py-3">Address</th>
                          <th className="px-4 py-3">Shipments</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {customers.map(customer => {
                          const customerShipments = shipments.filter(s => s.customerId === customer.id);
                          return (
                            <tr key={customer.id} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                              <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{customer.id}</td>
                              <td className="px-4 py-3 text-gray-900 dark:text-white">{customer.name}</td>
                              <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{customer.email}</td>
                              <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{customer.phone}</td>
                              <td className="px-4 py-3 text-gray-500 dark:text-gray-400 max-w-[200px] truncate">{customer.address}</td>
                              <td className="px-4 py-3">
                                <span className="badge badge-info">{customerShipments.length} shipments</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 shadow-inner py-4 border-t border-gray-200 dark:border-gray-700 theme-transition">
        <div className="container-fluid text-center text-gray-500 dark:text-gray-400 text-sm">
          Copyright © 2025 of Datavtar Private Limited. All rights reserved.
        </div>
      </footer>

      {/* Add/Edit Shipment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[var(--z-modal-backdrop)]">
          <div 
            ref={modalRef}
            className="modal-content w-full max-w-4xl max-h-[90vh] overflow-auto p-6 m-4 z-[var(--z-modal)]" 
            role="dialog" 
            aria-modal="true"
            aria-labelledby="shipment-modal-title"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 id="shipment-modal-title" className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingShipment ? 'Edit Shipment' : 'Add New Shipment'}
              </h3>
              <button 
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                onClick={closeModal}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="form-group">
                  <label htmlFor="trackingNumber" className="form-label">Tracking Number</label>
                  <input
                    type="text"
                    id="trackingNumber"
                    name="trackingNumber"
                    className="input"
                    placeholder="Enter tracking number"
                    value={shipmentFormData.trackingNumber}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="carrier" className="form-label">Carrier</label>
                  <input
                    type="text"
                    id="carrier"
                    name="carrier"
                    className="input"
                    placeholder="Enter carrier name"
                    value={shipmentFormData.carrier}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="origin" className="form-label">Origin</label>
                  <input
                    type="text"
                    id="origin"
                    name="origin"
                    className="input"
                    placeholder="Enter origin location"
                    value={shipmentFormData.origin}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="destination" className="form-label">Destination</label>
                  <input
                    type="text"
                    id="destination"
                    name="destination"
                    className="input"
                    placeholder="Enter destination location"
                    value={shipmentFormData.destination}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="departureDate" className="form-label">Departure Date</label>
                  <input
                    type="date"
                    id="departureDate"
                    name="departureDate"
                    className="input"
                    value={shipmentFormData.departureDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="estimatedArrival" className="form-label">Estimated Arrival Date</label>
                  <input
                    type="date"
                    id="estimatedArrival"
                    name="estimatedArrival"
                    className="input"
                    value={shipmentFormData.estimatedArrival}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="status" className="form-label">Status</label>
                  <select
                    id="status"
                    name="status"
                    className="input"
                    value={shipmentFormData.status}
                    onChange={handleInputChange}
                    required
                  >
                    {Object.values(ShipmentStatus).map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="priority" className="form-label">Priority</label>
                  <select
                    id="priority"
                    name="priority"
                    className="input"
                    value={shipmentFormData.priority}
                    onChange={handleInputChange}
                    required
                  >
                    {Object.values(ShipmentPriority).map(priority => (
                      <option key={priority} value={priority}>{priority}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="actualArrival" className="form-label">Actual Arrival Date</label>
                  <input
                    type="date"
                    id="actualArrival"
                    name="actualArrival"
                    className="input"
                    value={shipmentFormData.actualArrival || ''}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="customerId" className="form-label">Customer</label>
                  <select
                    id="customerId"
                    name="customerId"
                    className="input"
                    value={shipmentFormData.customerId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select a customer</option>
                    {customers.map(customer => (
                      <option key={customer.id} value={customer.id}>{customer.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="cost" className="form-label">Shipping Cost ($)</label>
                  <input
                    type="number"
                    id="cost"
                    name="cost"
                    className="input"
                    placeholder="Enter shipping cost"
                    value={shipmentFormData.cost}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="weight" className="form-label">Total Weight (kg)</label>
                  <input
                    type="number"
                    id="weight"
                    name="weight"
                    className="input"
                    placeholder="Enter total weight"
                    value={shipmentFormData.weight}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="notes" className="form-label">Notes</label>
                <textarea
                  id="notes"
                  name="notes"
                  className="input min-h-[80px]"
                  placeholder="Enter any additional notes"
                  value={shipmentFormData.notes}
                  onChange={handleInputChange}
                ></textarea>
              </div>
              
              <div className="form-group">
                <div className="flex justify-between items-center mb-2">
                  <label className="form-label mb-0">Shipment Items</label>
                  <button 
                    type="button" 
                    className="btn-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 flex items-center gap-1"
                    onClick={addItemField}
                  >
                    <Plus size={14} /> Add Item
                  </button>
                </div>
                
                {shipmentFormData.items.map((item, index) => (
                  <div key={item.id} className="grid grid-cols-1 sm:grid-cols-5 gap-2 p-3 mb-2 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="form-group sm:col-span-2 mb-0">
                      <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Item Name</label>
                      <input
                        type="text"
                        className="input"
                        placeholder="Item name"
                        value={item.name}
                        onChange={(e) => handleItemChange(e, item.id, 'name')}
                        required
                      />
                    </div>
                    <div className="form-group mb-0">
                      <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Quantity</label>
                      <input
                        type="number"
                        className="input"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(e, item.id, 'quantity')}
                        min="1"
                        required
                      />
                    </div>
                    <div className="form-group mb-0">
                      <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Weight (kg)</label>
                      <input
                        type="number"
                        className="input"
                        placeholder="Weight"
                        value={item.weight}
                        onChange={(e) => handleItemChange(e, item.id, 'weight')}
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                    <div className="flex gap-2 items-end">
                      {index > 0 && (
                        <button 
                          type="button"
                          className="btn-sm bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-600 dark:text-red-300 flex items-center justify-center h-[38px] w-[38px]" 
                          onClick={() => removeItemField(item.id)}
                          aria-label="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end gap-2 mt-6">
                <button 
                  type="button" 
                  className="btn bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                >
                  {editingShipment ? 'Update Shipment' : 'Create Shipment'}
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