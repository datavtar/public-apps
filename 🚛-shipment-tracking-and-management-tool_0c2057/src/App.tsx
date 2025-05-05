import React, { useState, useEffect } from 'react';
import {
  Truck,
  Map,
  Package,
  Calendar,
  Bell,
  FileText,
  Search,
  Plus,
  Filter,
  ChevronDown,
  MapPin,
  ArrowDownUp,
  Edit,
  Trash2,
  Menu,
  X,
  Moon,
  Sun,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  BarChart,
  ChevronUp,
  Eye,
  Settings,
  Download
} from 'lucide-react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import { format, addDays, isPast, isToday } from 'date-fns';
import styles from './styles/styles.module.css';

// Delete any default icon reference to avoid missing marker icon issue
delete L.Icon.Default.prototype._getIconUrl;

// Define TypeScript interfaces
interface Shipment {
  id: string;
  trackingNumber: string;
  origin: string;
  destination: string;
  customer: string;
  status: ShipmentStatus;
  estimatedDelivery: string;
  actualDelivery?: string;
  currentLocation: Location;
  description: string;
  carrier: string;
  weight: number;
  createdAt: string;
  alerts: Alert[];
  updates: ShipmentUpdate[];
}

interface Location {
  lat: number;
  lng: number;
  address: string;
}

interface ShipmentUpdate {
  id: string;
  timestamp: string;
  status: ShipmentStatus;
  location: Location;
  notes?: string;
}

interface Alert {
  id: string;
  timestamp: string;
  type: AlertType;
  message: string;
  isRead: boolean;
}

type ShipmentStatus = 'pending' | 'in_transit' | 'delivered' | 'delayed' | 'cancelled';
type AlertType = 'delay' | 'location_change' | 'status_change' | 'delivery_attempt' | 'delivery_confirmation';

// Main App component
const App: React.FC = () => {
  // State management
  const [shipments, setShipments] = useState<Shipment[]>(() => {
    const savedShipments = localStorage.getItem('shipments');
    return savedShipments ? JSON.parse(savedShipments) : sampleShipments;
  });
  
  const [filteredShipments, setFilteredShipments] = useState<Shipment[]>(shipments);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<ShipmentStatus | 'all'>('all');
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newShipment, setNewShipment] = useState<Partial<Shipment>>(createEmptyShipment());
  const [showSidebar, setShowSidebar] = useState<boolean>(false);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Shipment; direction: 'ascending' | 'descending' } | null>(null);
  const [activeTab, setActiveTab] = useState<'shipments' | 'map' | 'analytics' | 'alerts'>('shipments');
  const [allAlerts, setAllAlerts] = useState<Alert[]>(() => {
    return shipments.flatMap(s => s.alerts).sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  });
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode === 'true' || 
      (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  
  // Save shipments to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('shipments', JSON.stringify(shipments));
    // Update filtered shipments when shipments change
    filterShipments();
    // Update all alerts when shipments change
    const newAllAlerts = shipments.flatMap(s => s.alerts).sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    setAllAlerts(newAllAlerts);
  }, [shipments]);
  
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
  
  // Filter shipments based on search term and status filter
  useEffect(() => {
    filterShipments();
  }, [searchTerm, statusFilter, shipments, sortConfig]);
  
  // Modal escape key handler
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowAddModal(false);
        setSelectedShipment(null);
      }
    };
    
    window.addEventListener('keydown', handleEscapeKey);
    return () => window.removeEventListener('keydown', handleEscapeKey);
  }, []);
  
  // Filter and sort shipments
  const filterShipments = () => {
    let filtered = [...shipments];
    
    // Apply search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(shipment => 
        shipment.trackingNumber.toLowerCase().includes(term) || 
        shipment.customer.toLowerCase().includes(term) || 
        shipment.origin.toLowerCase().includes(term) || 
        shipment.destination.toLowerCase().includes(term)
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(shipment => shipment.status === statusFilter);
    }
    
    // Apply sorting
    if (sortConfig) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    
    setFilteredShipments(filtered);
  };
  
  // Handle sorting
  const requestSort = (key: keyof Shipment) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  // Create empty shipment for the add form
  function createEmptyShipment(): Partial<Shipment> {
    return {
      trackingNumber: '',
      origin: '',
      destination: '',
      customer: '',
      status: 'pending',
      estimatedDelivery: format(addDays(new Date(), 3), 'yyyy-MM-dd'),
      currentLocation: {
        lat: 40.7128,
        lng: -74.0060,
        address: 'New York, NY'
      },
      description: '',
      carrier: '',
      weight: 0,
      alerts: [],
      updates: []
    };
  }
  
  // Add a new shipment
  const handleAddShipment = () => {
    const shipmentToAdd: Shipment = {
      id: `ship_${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...newShipment as Omit<Shipment, 'id' | 'createdAt'>,
      alerts: [],
      updates: [{
        id: `update_${Date.now()}`,
        timestamp: new Date().toISOString(),
        status: newShipment.status as ShipmentStatus,
        location: newShipment.currentLocation as Location,
        notes: 'Shipment created'
      }]
    };
    
    setShipments([shipmentToAdd, ...shipments]);
    setShowAddModal(false);
    setNewShipment(createEmptyShipment());
  };
  
  // Delete a shipment
  const handleDeleteShipment = (id: string) => {
    if (window.confirm('Are you sure you want to delete this shipment?')) {
      setShipments(shipments.filter(s => s.id !== id));
      if (selectedShipment?.id === id) {
        setSelectedShipment(null);
      }
    }
  };
  
  // Update shipment status
  const handleUpdateStatus = (shipmentId: string, newStatus: ShipmentStatus, notes: string = '') => {
    setShipments(shipments.map(shipment => {
      if (shipment.id !== shipmentId) return shipment;
      
      const updatedShipment = { ...shipment, status: newStatus };
      
      // Add a new update to the shipment's updates array
      const newUpdate: ShipmentUpdate = {
        id: `update_${Date.now()}`,
        timestamp: new Date().toISOString(),
        status: newStatus,
        location: shipment.currentLocation,
        notes
      };
      
      updatedShipment.updates = [newUpdate, ...updatedShipment.updates];
      
      // If status is delivered, set actualDelivery date
      if (newStatus === 'delivered' && !updatedShipment.actualDelivery) {
        updatedShipment.actualDelivery = new Date().toISOString();
        
        // Add delivery confirmation alert
        const deliveryAlert: Alert = {
          id: `alert_${Date.now()}`,
          timestamp: new Date().toISOString(),
          type: 'delivery_confirmation',
          message: `Shipment #${updatedShipment.trackingNumber} has been delivered.`,
          isRead: false
        };
        
        updatedShipment.alerts = [deliveryAlert, ...updatedShipment.alerts];
      }
      
      // If status is delayed, add delay alert
      if (newStatus === 'delayed') {
        const delayAlert: Alert = {
          id: `alert_${Date.now()}`,
          timestamp: new Date().toISOString(),
          type: 'delay',
          message: `Shipment #${updatedShipment.trackingNumber} has been delayed. ${notes}`,
          isRead: false
        };
        
        updatedShipment.alerts = [delayAlert, ...updatedShipment.alerts];
      }
      
      return updatedShipment;
    }));
    
    // If we're updating the currently selected shipment, update it in state
    if (selectedShipment && selectedShipment.id === shipmentId) {
      const updatedSelectedShipment = shipments.find(s => s.id === shipmentId);
      if (updatedSelectedShipment) {
        setSelectedShipment(updatedSelectedShipment);
      }
    }
  };
  
  // Mark an alert as read
  const markAlertAsRead = (alertId: string) => {
    setShipments(shipments.map(shipment => {
      const updatedAlerts = shipment.alerts.map(alert => 
        alert.id === alertId ? { ...alert, isRead: true } : alert
      );
      
      return { ...shipment, alerts: updatedAlerts };
    }));
  };
  
  // Get the status badge component based on status
  const getStatusBadge = (status: ShipmentStatus) => {
    switch(status) {
      case 'pending':
        return <span className="badge badge-warning">Pending</span>;
      case 'in_transit':
        return <span className="badge badge-info">In Transit</span>;
      case 'delivered':
        return <span className="badge badge-success">Delivered</span>;
      case 'delayed':
        return <span className="badge badge-error">Delayed</span>;
      case 'cancelled':
        return <span className="badge bg-gray-500 text-white">Cancelled</span>;
      default:
        return <span className="badge">Unknown</span>;
    }
  };
  
  // Get the alert icon based on alert type
  const getAlertIcon = (type: AlertType) => {
    switch(type) {
      case 'delay':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'location_change':
        return <MapPin className="h-5 w-5 text-blue-500" />;
      case 'status_change':
        return <Truck className="h-5 w-5 text-purple-500" />;
      case 'delivery_attempt':
        return <Clock className="h-5 w-5 text-orange-500" />;
      case 'delivery_confirmation':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };
  
  // Calculate statistics for analytics
  const getAnalyticsData = () => {
    const totalShipments = shipments.length;
    const inTransit = shipments.filter(s => s.status === 'in_transit').length;
    const delivered = shipments.filter(s => s.status === 'delivered').length;
    const delayed = shipments.filter(s => s.status === 'delayed').length;
    const pending = shipments.filter(s => s.status === 'pending').length;
    const cancelled = shipments.filter(s => s.status === 'cancelled').length;
    
    // Delivery performance - on-time vs delayed vs early
    let onTime = 0;
    let early = 0;
    let late = 0;
    
    shipments.forEach(shipment => {
      if (shipment.status === 'delivered' && shipment.actualDelivery && shipment.estimatedDelivery) {
        const estimated = new Date(shipment.estimatedDelivery);
        const actual = new Date(shipment.actualDelivery);
        
        if (actual < estimated) {
          early++;
        } else if (actual.setHours(0,0,0,0) === estimated.setHours(0,0,0,0)) {
          onTime++;
        } else {
          late++;
        }
      }
    });
    
    return {
      statusDistribution: [
        { name: 'In Transit', value: inTransit },
        { name: 'Delivered', value: delivered },
        { name: 'Delayed', value: delayed },
        { name: 'Pending', value: pending },
        { name: 'Cancelled', value: cancelled }
      ],
      deliveryPerformance: [
        { name: 'On Time', value: onTime },
        { name: 'Early', value: early },
        { name: 'Late', value: late }
      ],
      shipmentsByDay: getShipmentsByDay(),
      totalShipments,
      inTransitPercentage: totalShipments > 0 ? (inTransit / totalShipments) * 100 : 0,
      deliveredPercentage: totalShipments > 0 ? (delivered / totalShipments) * 100 : 0,
      delayedPercentage: totalShipments > 0 ? (delayed / totalShipments) * 100 : 0
    };
  };
  
  // Get shipments by day for the last 7 days
  const getShipmentsByDay = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return format(date, 'yyyy-MM-dd');
    }).reverse();
    
    return last7Days.map(date => {
      const count = shipments.filter(s => 
        s.createdAt.split('T')[0] === date
      ).length;
      
      return {
        date: format(new Date(date), 'MMM dd'),
        count
      };
    });
  };
  
  // Chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
  // Handle shipment selection
  const handleShipmentClick = (shipment: Shipment) => {
    setSelectedShipment(shipment);
  };
  
  // Close shipment detail view
  const closeShipmentDetail = () => {
    setSelectedShipment(null);
  };
  
  // Mark all alerts as read
  const markAllAlertsAsRead = () => {
    setShipments(shipments.map(shipment => ({
      ...shipment,
      alerts: shipment.alerts.map(alert => ({ ...alert, isRead: true }))
    })));
  };
  
  // Download shipment report as CSV
  const downloadShipmentReport = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // CSV Header
    csvContent += "Tracking Number,Customer,Origin,Destination,Status,Created At,Estimated Delivery\n";
    
    // CSV Rows
    shipments.forEach(shipment => {
      const row = [
        shipment.trackingNumber,
        shipment.customer,
        shipment.origin,
        shipment.destination,
        shipment.status,
        new Date(shipment.createdAt).toLocaleDateString(),
        new Date(shipment.estimatedDelivery).toLocaleDateString()
      ];
      csvContent += row.join(",") + "\n";
    });
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `shipment_report_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    
    // Download file
    link.click();
    
    // Clean up
    document.body.removeChild(link);
  };
  
  // Check if a date is past due (for highlighting)
  const isPastDue = (dateString: string) => {
    return isPast(new Date(dateString)) && !isToday(new Date(dateString));
  };
  
  // Update shipment form information
  const handleShipmentFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('currentLocation.')) {
      const locationField = name.split('.')[1];
      setNewShipment(prev => ({
        ...prev,
        currentLocation: {
          ...prev?.currentLocation as Location,
          [locationField]: locationField === 'lat' || locationField === 'lng' 
            ? parseFloat(value) 
            : value
        }
      }));
    } else {
      setNewShipment(prev => ({
        ...prev,
        [name]: name === 'weight' ? parseFloat(value) : value
      }));
    }
  };
  
  // Generate Dashboard content
  const renderDashboard = () => {
    const analytics = getAnalyticsData();
    
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stats */}
        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div className="stat-card">
            <div className="stat-title">Total Shipments</div>
            <div className="stat-value">{analytics.totalShipments}</div>
            <div className="flex mt-2 text-sm">
              <Package className="w-4 h-4 mr-1 text-blue-500" />
              <span>Active tracking</span>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-title">In Transit</div>
            <div className="stat-value flex items-baseline">
              {shipments.filter(s => s.status === 'in_transit').length}
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                {analytics.inTransitPercentage.toFixed(0)}%
              </span>
            </div>
            <div className="flex mt-2 text-sm">
              <Truck className="w-4 h-4 mr-1 text-green-500" />
              <span>On the move</span>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-title">Delivered</div>
            <div className="stat-value flex items-baseline">
              {shipments.filter(s => s.status === 'delivered').length}
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                {analytics.deliveredPercentage.toFixed(0)}%
              </span>
            </div>
            <div className="flex mt-2 text-sm">
              <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
              <span>Successfully delivered</span>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-title">Delayed</div>
            <div className="stat-value flex items-baseline">
              {shipments.filter(s => s.status === 'delayed').length}
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                {analytics.delayedPercentage.toFixed(0)}%
              </span>
            </div>
            <div className="flex mt-2 text-sm">
              <AlertTriangle className="w-4 h-4 mr-1 text-yellow-500" />
              <span>Potential issues</span>
            </div>
          </div>
        </div>
        
        {/* Shipment Status Distribution Chart */}
        <div className="card col-span-1 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Shipment Status Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.statusDistribution.filter(item => item.value > 0)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {analytics.statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Recent Shipments */}
        <div className="card overflow-hidden">
          <h3 className="text-lg font-semibold mb-4">Delivery Performance</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.deliveryPerformance.filter(item => item.value > 0)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#82ca9d" name="Shipments" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Shipments Over Time */}
        <div className="card col-span-1 lg:col-span-3">
          <h3 className="text-lg font-semibold mb-4">Shipments Over Time (Last 7 Days)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.shipmentsByDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#8884d8" name="Shipments" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Recent Activity */}
        <div className="card col-span-1 lg:col-span-3">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Recent Activity</h3>
            <button 
              className="text-blue-500 text-sm hover:text-blue-700 flex items-center"
              onClick={downloadShipmentReport}
            >
              <Download className="h-4 w-4 mr-1" />
              Export Report
            </button>
          </div>
          
          <div className="overflow-auto max-h-[400px]">
            <div className="space-y-3">
              {allAlerts.slice(0, 5).map(alert => (
                <div 
                  key={alert.id} 
                  className={`flex items-start p-3 rounded-lg border-l-4 ${alert.isRead ? 'border-gray-300 bg-gray-50 dark:bg-gray-800 dark:border-gray-700' : 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'}`}
                >
                  <div className="flex-shrink-0 mr-3 mt-1">
                    {getAlertIcon(alert.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{alert.message}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {format(new Date(alert.timestamp), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                  {!alert.isRead && (
                    <button 
                      className="text-xs text-blue-500 hover:text-blue-700 ml-2"
                      onClick={() => markAlertAsRead(alert.id)}
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              ))}
              
              {allAlerts.length === 0 && (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  No recent activity
                </div>
              )}
            </div>
          </div>
          
          {allAlerts.length > 5 && (
            <div className="mt-4 text-center">
              <button 
                className="text-blue-500 text-sm hover:text-blue-700"
                onClick={() => setActiveTab('alerts')}
              >
                View all activity
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  // Generate Shipments list
  const renderShipments = () => {
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search by tracking #, customer, origin, or destination"
              className="input pl-10 w-full sm:w-80"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="relative">
              <select
                className="input pl-3 pr-10 appearance-none w-full"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as ShipmentStatus | 'all')}
                aria-label="Filter by status"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in_transit">In Transit</option>
                <option value="delivered">Delivered</option>
                <option value="delayed">Delayed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <Filter className="h-4 w-4 text-gray-400" />
              </div>
            </div>
            
            <button
              className="btn btn-primary w-full sm:w-auto"
              onClick={() => setShowAddModal(true)}
            >
              <Plus className="h-4 w-4 mr-2" /> Add Shipment
            </button>
          </div>
        </div>
        
        {filteredShipments.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-gray-500 dark:text-gray-400 mb-4">No shipments found</p>
            <button
              className="btn btn-primary"
              onClick={() => setShowAddModal(true)}
            >
              <Plus className="h-4 w-4 mr-2" /> Add Shipment
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th className="table-header" onClick={() => requestSort('trackingNumber')}>
                    <div className="flex items-center cursor-pointer">
                      <span>Tracking #</span>
                      <ArrowDownUp className="h-4 w-4 ml-1" />
                    </div>
                  </th>
                  <th className="table-header" onClick={() => requestSort('customer')}>
                    <div className="flex items-center cursor-pointer">
                      <span>Customer</span>
                      <ArrowDownUp className="h-4 w-4 ml-1" />
                    </div>
                  </th>
                  <th className="table-header responsive-hide" onClick={() => requestSort('origin')}>
                    <div className="flex items-center cursor-pointer">
                      <span>Origin</span>
                      <ArrowDownUp className="h-4 w-4 ml-1" />
                    </div>
                  </th>
                  <th className="table-header responsive-hide" onClick={() => requestSort('destination')}>
                    <div className="flex items-center cursor-pointer">
                      <span>Destination</span>
                      <ArrowDownUp className="h-4 w-4 ml-1" />
                    </div>
                  </th>
                  <th className="table-header" onClick={() => requestSort('status')}>
                    <div className="flex items-center cursor-pointer">
                      <span>Status</span>
                      <ArrowDownUp className="h-4 w-4 ml-1" />
                    </div>
                  </th>
                  <th className="table-header responsive-hide" onClick={() => requestSort('estimatedDelivery')}>
                    <div className="flex items-center cursor-pointer">
                      <span>Est. Delivery</span>
                      <ArrowDownUp className="h-4 w-4 ml-1" />
                    </div>
                  </th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                {filteredShipments.map((shipment) => (
                  <tr key={shipment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="table-cell font-medium text-gray-900 dark:text-white">
                      {shipment.trackingNumber}
                    </td>
                    <td className="table-cell">{shipment.customer}</td>
                    <td className="table-cell responsive-hide">{shipment.origin}</td>
                    <td className="table-cell responsive-hide">{shipment.destination}</td>
                    <td className="table-cell">{getStatusBadge(shipment.status)}</td>
                    <td 
                      className={`table-cell responsive-hide ${isPastDue(shipment.estimatedDelivery) && shipment.status !== 'delivered' ? 'text-red-600 dark:text-red-400' : ''}`}
                    >
                      {format(new Date(shipment.estimatedDelivery), 'MMM dd, yyyy')}
                    </td>
                    <td className="table-cell">
                      <div className="flex space-x-2">
                        <button
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          onClick={() => handleShipmentClick(shipment)}
                          aria-label="View shipment details"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          onClick={() => handleDeleteShipment(shipment.id)}
                          aria-label="Delete shipment"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };
  
  // Generate Map view
  const renderMap = () => {
    return (
      <div className="flex flex-col h-[calc(100vh-180px)]">
        <div className="mb-4">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Showing location for {filteredShipments.length} shipments</div>
          <div className="flex flex-wrap gap-2">
            <span className="badge badge-info">In Transit: {shipments.filter(s => s.status === 'in_transit').length}</span>
            <span className="badge badge-warning">Pending: {shipments.filter(s => s.status === 'pending').length}</span>
            <span className="badge badge-error">Delayed: {shipments.filter(s => s.status === 'delayed').length}</span>
          </div>
        </div>
        
        <div className="flex-1 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700">
          <MapContainer center={[39.8283, -98.5795]} zoom={4} className="h-full w-full">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {filteredShipments.map((shipment) => {
              const location = shipment.currentLocation;
              let markerColor = '#3B82F6'; // blue for in_transit
              
              if (shipment.status === 'delivered') {
                markerColor = '#22C55E'; // green
              } else if (shipment.status === 'delayed') {
                markerColor = '#EF4444'; // red
              } else if (shipment.status === 'pending') {
                markerColor = '#F59E0B'; // amber
              }
              
              const icon = L.divIcon({
                className: '',
                html: `<div class="${styles.customMarker}" style="background-color: ${markerColor}; border-top-color: ${markerColor}"></div>`,
                iconSize: [30, 30],
                iconAnchor: [15, 30]
              });
              
              return (
                <Marker 
                  key={shipment.id} 
                  position={[location.lat, location.lng]} 
                  icon={icon}
                >
                  <Popup>
                    <div className="text-sm">
                      <p className="font-bold">{shipment.trackingNumber}</p>
                      <p>Customer: {shipment.customer}</p>
                      <p>Status: {shipment.status.replace('_', ' ')}</p>
                      <p>Est. Delivery: {format(new Date(shipment.estimatedDelivery), 'MMM dd, yyyy')}</p>
                      <p className="mt-1">Current Location: {shipment.currentLocation.address}</p>
                      
                      <div className="mt-2">
                        <button 
                          className="text-blue-600 text-xs font-medium hover:underline"
                          onClick={() => handleShipmentClick(shipment)}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
      </div>
    );
  };
  
  // Generate Alerts view
  const renderAlerts = () => {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">All Alerts</h2>
          {allAlerts.some(alert => !alert.isRead) && (
            <button 
              className="btn btn-sm bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200"
              onClick={markAllAlertsAsRead}
            >
              Mark all as read
            </button>
          )}
        </div>
        
        {allAlerts.length === 0 ? (
          <div className="card text-center py-8">
            <div className="text-gray-500 dark:text-gray-400">No alerts at the moment</div>
          </div>
        ) : (
          <div className="space-y-4">
            {allAlerts.map(alert => (
              <div 
                key={alert.id} 
                className={`p-4 rounded-lg border-l-4 ${alert.isRead ? 'border-gray-300 bg-gray-50 dark:bg-gray-800 dark:border-gray-700' : 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'}`}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-3">
                    {getAlertIcon(alert.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h3 className="text-sm font-medium">
                        {alert.type.split('_').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </h3>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {format(new Date(alert.timestamp), 'MMM dd, yyyy HH:mm')}
                      </span>
                    </div>
                    <p className="mt-1 text-sm">{alert.message}</p>
                    
                    {!alert.isRead && (
                      <div className="mt-2 text-right">
                        <button 
                          className="text-xs text-blue-500 hover:text-blue-700"
                          onClick={() => markAlertAsRead(alert.id)}
                        >
                          Mark as read
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };
  
  // Render shipment details
  const renderShipmentDetail = () => {
    if (!selectedShipment) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={closeShipmentDetail}>
        <div 
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" 
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-start p-4 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-xl font-semibold">Shipment Details</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Tracking #: {selectedShipment.trackingNumber}</p>
            </div>
            <button 
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              onClick={closeShipmentDetail}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <h3 className="text-lg font-medium">Shipment Information</h3>
                <div className="mt-2 space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Customer:</span>
                    <p>{selectedShipment.customer}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Carrier:</span>
                    <p>{selectedShipment.carrier}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Weight:</span>
                    <p>{selectedShipment.weight} kg</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Description:</span>
                    <p>{selectedShipment.description}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium">Route Details</h3>
                <div className="mt-2 space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Origin:</span>
                    <p>{selectedShipment.origin}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Destination:</span>
                    <p>{selectedShipment.destination}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Location:</span>
                    <p>{selectedShipment.currentLocation.address}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Delivery Timeline</h3>
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Status:</span>
                {getStatusBadge(selectedShipment.status)}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Created:</span>
                  <p>{format(new Date(selectedShipment.createdAt), 'MMM dd, yyyy HH:mm')}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Estimated Delivery:</span>
                  <p className={isPastDue(selectedShipment.estimatedDelivery) && selectedShipment.status !== 'delivered' ? 'text-red-600 dark:text-red-400 font-medium' : ''}>
                    {format(new Date(selectedShipment.estimatedDelivery), 'MMM dd, yyyy')}
                  </p>
                </div>
                {selectedShipment.actualDelivery && (
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Actual Delivery:</span>
                    <p>{format(new Date(selectedShipment.actualDelivery), 'MMM dd, yyyy HH:mm')}</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Update Status Section */}
            {selectedShipment.status !== 'delivered' && selectedShipment.status !== 'cancelled' && (
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h3 className="text-lg font-medium mb-3">Update Shipment Status</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedShipment.status !== 'in_transit' && (
                    <button 
                      className="btn btn-sm bg-blue-500 hover:bg-blue-600 text-white"
                      onClick={() => handleUpdateStatus(selectedShipment.id, 'in_transit', 'Shipment is now in transit')}
                    >
                      Mark as In Transit
                    </button>
                  )}
                  
                  <button 
                    className="btn btn-sm bg-green-500 hover:bg-green-600 text-white"
                    onClick={() => handleUpdateStatus(selectedShipment.id, 'delivered', 'Shipment has been delivered')}
                  >
                    Mark as Delivered
                  </button>
                  
                  <button 
                    className="btn btn-sm bg-yellow-500 hover:bg-yellow-600 text-white"
                    onClick={() => {
                      const notes = prompt('Please enter a reason for the delay:');
                      if (notes) {
                        handleUpdateStatus(selectedShipment.id, 'delayed', notes);
                      }
                    }}
                  >
                    Mark as Delayed
                  </button>
                  
                  <button 
                    className="btn btn-sm bg-gray-500 hover:bg-gray-600 text-white"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to cancel this shipment?')) {
                        handleUpdateStatus(selectedShipment.id, 'cancelled', 'Shipment has been cancelled');
                      }
                    }}
                  >
                    Cancel Shipment
                  </button>
                </div>
              </div>
            )}
            
            {/* Shipment Updates History */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">Shipment Updates</h3>
              <div className="space-y-4 max-h-64 overflow-y-auto">
                {selectedShipment.updates.map((update, index) => (
                  <div key={update.id} className="flex">
                    <div className="flex-shrink-0 mr-3 relative">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${index === 0 ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                        <Truck className="h-4 w-4 text-white" />
                      </div>
                      {index !== selectedShipment.updates.length - 1 && (
                        <div className="absolute w-0.5 bg-gray-300 dark:bg-gray-600 top-8 bottom-0 left-4 -ml-px"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="text-sm font-medium">
                        {update.status.split('_').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {format(new Date(update.timestamp), 'MMM dd, yyyy HH:mm')}
                      </div>
                      {update.notes && (
                        <div className="text-sm mt-1">{update.notes}</div>
                      )}
                      <div className="text-xs mt-1">
                        Location: {update.location.address}
                      </div>
                    </div>
                  </div>
                ))}
                
                {selectedShipment.updates.length === 0 && (
                  <div className="text-gray-500 dark:text-gray-400 text-sm">No updates recorded yet</div>
                )}
              </div>
            </div>
            
            {/* Map View */}
            <div>
              <h3 className="text-lg font-medium mb-3">Current Location</h3>
              <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 h-64 mb-4">
                <MapContainer 
                  center={[selectedShipment.currentLocation.lat, selectedShipment.currentLocation.lng]} 
                  zoom={13} 
                  className="h-full w-full"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={[selectedShipment.currentLocation.lat, selectedShipment.currentLocation.lng]}>
                    <Popup>
                      <div className="text-sm">
                        <p className="font-bold">{selectedShipment.trackingNumber}</p>
                        <p>Current Location: {selectedShipment.currentLocation.address}</p>
                      </div>
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Generate Add Shipment Modal
  const renderAddShipmentModal = () => {
    if (!showAddModal) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddModal(false)}>
        <div 
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto" 
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold">Add New Shipment</h2>
            <button 
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              onClick={() => setShowAddModal(false)}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="p-4">
            <form onSubmit={(e) => { e.preventDefault(); handleAddShipment(); }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="trackingNumber">Tracking Number*</label>
                  <input
                    id="trackingNumber"
                    type="text"
                    name="trackingNumber"
                    className="input"
                    value={newShipment.trackingNumber || ''}
                    onChange={handleShipmentFormChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="customer">Customer*</label>
                  <input
                    id="customer"
                    type="text"
                    name="customer"
                    className="input"
                    value={newShipment.customer || ''}
                    onChange={handleShipmentFormChange}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="origin">Origin*</label>
                  <input
                    id="origin"
                    type="text"
                    name="origin"
                    className="input"
                    value={newShipment.origin || ''}
                    onChange={handleShipmentFormChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="destination">Destination*</label>
                  <input
                    id="destination"
                    type="text"
                    name="destination"
                    className="input"
                    value={newShipment.destination || ''}
                    onChange={handleShipmentFormChange}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="carrier">Carrier*</label>
                  <input
                    id="carrier"
                    type="text"
                    name="carrier"
                    className="input"
                    value={newShipment.carrier || ''}
                    onChange={handleShipmentFormChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="weight">Weight (kg)*</label>
                  <input
                    id="weight"
                    type="number"
                    name="weight"
                    min="0"
                    step="0.01"
                    className="input"
                    value={newShipment.weight || 0}
                    onChange={handleShipmentFormChange}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="status">Status*</label>
                  <select
                    id="status"
                    name="status"
                    className="input"
                    value={newShipment.status || 'pending'}
                    onChange={handleShipmentFormChange as React.ChangeEventHandler<HTMLSelectElement>}
                    required
                  >
                    <option value="pending">Pending</option>
                    <option value="in_transit">In Transit</option>
                    <option value="delivered">Delivered</option>
                    <option value="delayed">Delayed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="estimatedDelivery">Estimated Delivery*</label>
                  <input
                    id="estimatedDelivery"
                    type="date"
                    name="estimatedDelivery"
                    className="input"
                    value={newShipment.estimatedDelivery || format(addDays(new Date(), 3), 'yyyy-MM-dd')}
                    onChange={handleShipmentFormChange}
                    min={format(new Date(), 'yyyy-MM-dd')}
                    required
                  />
                </div>
              </div>
              
              <div className="form-group mb-4">
                <label className="form-label" htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  className="input"
                  rows={3}
                  value={newShipment.description || ''}
                  onChange={handleShipmentFormChange}
                ></textarea>
              </div>
              
              <div className="form-group mb-4">
                <label className="form-label">Current Location*</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label text-xs" htmlFor="currentLocation.address">Address</label>
                    <input
                      id="currentLocation.address"
                      type="text"
                      name="currentLocation.address"
                      className="input"
                      value={newShipment.currentLocation?.address || ''}
                      onChange={handleShipmentFormChange}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="form-label text-xs" htmlFor="currentLocation.lat">Latitude</label>
                      <input
                        id="currentLocation.lat"
                        type="number"
                        name="currentLocation.lat"
                        className="input"
                        value={newShipment.currentLocation?.lat || 0}
                        onChange={handleShipmentFormChange}
                        required
                        step="any"
                      />
                    </div>
                    <div>
                      <label className="form-label text-xs" htmlFor="currentLocation.lng">Longitude</label>
                      <input
                        id="currentLocation.lng"
                        type="number"
                        name="currentLocation.lng"
                        className="input"
                        value={newShipment.currentLocation?.lng || 0}
                        onChange={handleShipmentFormChange}
                        required
                        step="any"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  className="btn bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Add Shipment
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="container-fluid py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center">
              <button 
                className="md:hidden mr-2 text-gray-600 dark:text-gray-300"
                onClick={() => setShowSidebar(!showSidebar)}
                aria-label="Toggle sidebar"
              >
                <Menu className="h-6 w-6" />
              </button>
              <div className="flex items-center">
                <Truck className="h-8 w-8 text-primary-600 dark:text-primary-400 mr-2" />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Shipment Tracker</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                className="theme-toggle"
                onClick={() => setIsDarkMode(!isDarkMode)}
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? <Sun className="h-5 w-5 text-yellow-500" /> : <Moon className="h-5 w-5 text-gray-500" />}
                <span className="sr-only">
                  {isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                </span>
              </button>
              
              <div className="relative">
                <button className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                  <Bell className="h-6 w-6" />
                  {allAlerts.some(a => !a.isRead) && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      {allAlerts.filter(a => !a.isRead).length}
                    </span>
                  )}
                </button>
              </div>
              
              <button className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                <Settings className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <div className="container-fluid py-6">
        <div className="flex flex-col md:flex-row md:space-x-6">
          {/* Sidebar - Mobile Overlay */}
          <div 
            className={`fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden ${showSidebar ? 'block' : 'hidden'}`}
            onClick={() => setShowSidebar(false)}
          ></div>
          
          {/* Sidebar */}
          <div 
            className={`
              w-64 bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden transition-all duration-300 ease-in-out
              fixed md:static top-0 bottom-0 left-0 z-50 md:z-0 transform ${showSidebar ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
            `}
          >
            <div className="flex justify-between items-center p-4 md:hidden">
              <h2 className="text-lg font-semibold">Menu</h2>
              <button 
                className="text-gray-600 dark:text-gray-300"
                onClick={() => setShowSidebar(false)}
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <nav className="p-4">
              <ul className="space-y-2">
                <li>
                  <button 
                    className={`flex items-center p-2 w-full rounded-lg text-left transition-colors ${activeTab === 'shipments' ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                    onClick={() => { setActiveTab('shipments'); setShowSidebar(false); }}
                  >
                    <Package className="h-5 w-5 mr-2" />
                    <span>Shipments</span>
                  </button>
                </li>
                <li>
                  <button 
                    className={`flex items-center p-2 w-full rounded-lg text-left transition-colors ${activeTab === 'map' ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                    onClick={() => { setActiveTab('map'); setShowSidebar(false); }}
                  >
                    <Map className="h-5 w-5 mr-2" />
                    <span>Map View</span>
                  </button>
                </li>
                <li>
                  <button 
                    className={`flex items-center p-2 w-full rounded-lg text-left transition-colors ${activeTab === 'analytics' ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                    onClick={() => { setActiveTab('analytics'); setShowSidebar(false); }}
                  >
                    <BarChart className="h-5 w-5 mr-2" />
                    <span>Analytics</span>
                  </button>
                </li>
                <li>
                  <button 
                    className={`flex items-center p-2 w-full rounded-lg text-left transition-colors ${activeTab === 'alerts' ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                    onClick={() => { setActiveTab('alerts'); setShowSidebar(false); }}
                  >
                    <Bell className="h-5 w-5 mr-2" />
                    <div className="flex items-center justify-between w-full">
                      <span>Alerts</span>
                      {allAlerts.some(a => !a.isRead) && (
                        <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {allAlerts.filter(a => !a.isRead).length}
                        </span>
                      )}
                    </div>
                  </button>
                </li>
              </ul>
              
              <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Useful Links</h3>
                <ul className="space-y-2">
                  <li>
                    <a 
                      href="#" 
                      className="flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                    >
                      <FileText className="h-5 w-5 mr-2" />
                      <span>Documentation</span>
                    </a>
                  </li>
                  <li>
                    <button 
                      className="flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 w-full text-left"
                      onClick={downloadShipmentReport}
                    >
                      <Download className="h-5 w-5 mr-2" />
                      <span>Export Data</span>
                    </button>
                  </li>
                </ul>
              </div>
            </nav>
          </div>
          
          {/* Main Content */}
          <div className="flex-1 md:mt-0 mt-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 md:p-6">
              {/* Tab Content */}
              {activeTab === 'shipments' && renderShipments()}
              {activeTab === 'map' && renderMap()}
              {activeTab === 'analytics' && renderDashboard()}
              {activeTab === 'alerts' && renderAlerts()}
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 shadow mt-8 py-4">
        <div className="container-fluid text-center text-gray-500 dark:text-gray-400 text-sm">
          Copyright © 2025 of Datavtar Private Limited. All rights reserved.
        </div>
      </footer>
      
      {/* Modals */}
      {renderAddShipmentModal()}
      {renderShipmentDetail()}
    </div>
  );
};

// Sample data
const sampleShipments: Shipment[] = [
  {
    id: 'ship_1',
    trackingNumber: 'TRK123456789',
    origin: 'New York, NY',
    destination: 'Los Angeles, CA',
    customer: 'Acme Corporation',
    status: 'in_transit',
    estimatedDelivery: '2025-03-15',
    currentLocation: {
      lat: 39.7392,
      lng: -104.9903,
      address: 'Denver, CO'
    },
    description: 'Electronic components - fragile',
    carrier: 'FastShip Express',
    weight: 12.5,
    createdAt: '2025-03-01T10:30:00.000Z',
    alerts: [
      {
        id: 'alert_1',
        timestamp: '2025-03-05T14:20:00.000Z',
        type: 'location_change',
        message: 'Shipment TRK123456789 has arrived in Denver, CO',
        isRead: true
      }
    ],
    updates: [
      {
        id: 'update_3',
        timestamp: '2025-03-05T14:20:00.000Z',
        status: 'in_transit',
        location: {
          lat: 39.7392,
          lng: -104.9903,
          address: 'Denver, CO'
        },
        notes: 'Shipment arrived at distribution center'
      },
      {
        id: 'update_2',
        timestamp: '2025-03-03T09:15:00.000Z',
        status: 'in_transit',
        location: {
          lat: 41.8781,
          lng: -87.6298,
          address: 'Chicago, IL'
        },
        notes: 'Shipment in transit'
      },
      {
        id: 'update_1',
        timestamp: '2025-03-01T10:30:00.000Z',
        status: 'pending',
        location: {
          lat: 40.7128,
          lng: -74.0060,
          address: 'New York, NY'
        },
        notes: 'Shipment created'
      }
    ]
  },
  {
    id: 'ship_2',
    trackingNumber: 'TRK987654321',
    origin: 'Chicago, IL',
    destination: 'Miami, FL',
    customer: 'Global Traders',
    status: 'delivered',
    estimatedDelivery: '2025-03-10',
    actualDelivery: '2025-03-09T16:45:00.000Z',
    currentLocation: {
      lat: 25.7617,
      lng: -80.1918,
      address: 'Miami, FL'
    },
    description: 'Office supplies',
    carrier: 'Reliable Logistics',
    weight: 28.3,
    createdAt: '2025-03-02T08:45:00.000Z',
    alerts: [
      {
        id: 'alert_2',
        timestamp: '2025-03-09T16:45:00.000Z',
        type: 'delivery_confirmation',
        message: 'Shipment TRK987654321 has been delivered to the recipient',
        isRead: false
      }
    ],
    updates: [
      {
        id: 'update_6',
        timestamp: '2025-03-09T16:45:00.000Z',
        status: 'delivered',
        location: {
          lat: 25.7617, // Fixed: Removed 'a' before the number
          lng: -80.1918,
          address: 'Miami, FL'
        },
        notes: 'Delivered to recipient'
      },
      {
        id: 'update_5',
        timestamp: '2025-03-07T10:30:00.000Z',
        status: 'in_transit',
        location: {
          lat: 33.7490,
          lng: -84.3880,
          address: 'Atlanta, GA'
        },
        notes: 'Shipment in transit'
      },
      {
        id: 'update_4',
        timestamp: '2025-03-02T08:45:00.000Z',
        status: 'pending',
        location: {
          lat: 41.8781,
          lng: -87.6298,
          address: 'Chicago, IL'
        },
        notes: 'Shipment created'
      }
    ]
  },
  {
    id: 'ship_3',
    trackingNumber: 'TRK456789123',
    origin: 'Seattle, WA',
    destination: 'Boston, MA',
    customer: 'Tech Innovations',
    status: 'delayed',
    estimatedDelivery: '2025-03-12',
    currentLocation: {
      lat: 43.0722,
      lng: -89.4008,
      address: 'Madison, WI'
    },
    description: 'Server equipment',
    carrier: 'Premier Freight',
    weight: 45.7,
    createdAt: '2025-03-04T14:20:00.000Z',
    alerts: [
      {
        id: 'alert_3',
        timestamp: '2025-03-08T11:15:00.000Z',
        type: 'delay',
        message: 'Shipment TRK456789123 has been delayed due to weather conditions',
        isRead: false
      }
    ],
    updates: [
      {
        id: 'update_9',
        timestamp: '2025-03-08T11:15:00.000Z',
        status: 'delayed',
        location: {
          lat: 43.0722,
          lng: -89.4008,
          address: 'Madison, WI'
        },
        notes: 'Shipment delayed due to severe weather conditions'
      },
      {
        id: 'update_8',
        timestamp: '2025-03-06T16:30:00.000Z',
        status: 'in_transit',
        location: {
          lat: 45.5051,
          lng: -122.6750,
          address: 'Portland, OR'
        },
        notes: 'Shipment in transit'
      },
      {
        id: 'update_7',
        timestamp: '2025-03-04T14:20:00.000Z',
        status: 'pending',
        location: {
          lat: 47.6062,
          lng: -122.3321,
          address: 'Seattle, WA'
        },
        notes: 'Shipment created'
      }
    ]
  },
  {
    id: 'ship_4',
    trackingNumber: 'TRK789123456',
    origin: 'San Francisco, CA',
    destination: 'Austin, TX',
    customer: 'Green Energy Co',
    status: 'pending',
    estimatedDelivery: '2025-03-18',
    currentLocation: {
      lat: 37.7749,
      lng: -122.4194,
      address: 'San Francisco, CA'
    },
    description: 'Solar panel components',
    carrier: 'EcoShip Logistics',
    weight: 78.2,
    createdAt: '2025-03-06T09:10:00.000Z',
    alerts: [],
    updates: [
      {
        id: 'update_10',
        timestamp: '2025-03-06T09:10:00.000Z',
        status: 'pending',
        location: {
          lat: 37.7749,
          lng: -122.4194,
          address: 'San Francisco, CA'
        },
        notes: 'Shipment created'
      }
    ]
  }
];

export default App;