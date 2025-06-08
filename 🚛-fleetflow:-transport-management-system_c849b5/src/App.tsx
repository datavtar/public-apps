import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from './contexts/authContext';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import {
  Truck, Users, Route, Package, BarChart3, Settings, Plus, Edit, Trash2,
  Search, Filter, Download, Upload, MapPin, Clock, DollarSign, Fuel,
  AlertTriangle, CheckCircle, TrendingUp, TrendingDown, Calendar,
  FileText, Eye, Navigation, Target, Gauge, Activity, User, LogOut
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

// Types and Interfaces
interface Vehicle {
  id: string;
  vehicleNumber: string;
  type: string;
  model: string;
  capacity: number;
  fuelType: string;
  status: 'active' | 'maintenance' | 'inactive';
  driverId?: string;
  lastMaintenance: string;
  mileage: number;
  fuelConsumption: number;
  location: string;
}

interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  phone: string;
  email: string;
  experience: number;
  rating: number;
  status: 'available' | 'assigned' | 'off-duty';
  currentVehicleId?: string;
  totalTrips: number;
  totalDistance: number;
}

interface RouteData {
  id: string;
  name: string;
  origin: string;
  destination: string;
  distance: number;
  estimatedTime: number;
  fuelCost: number;
  tollCost: number;
  status: 'active' | 'completed' | 'planned';
  driverId?: string;
  vehicleId?: string;
  waypoints: string[];
}

interface Shipment {
  id: string;
  trackingNumber: string;
  origin: string;
  destination: string;
  weight: number;
  value: number;
  status: 'pending' | 'in-transit' | 'delivered' | 'delayed';
  driverId?: string;
  vehicleId?: string;
  routeId?: string;
  pickupDate: string;
  expectedDelivery: string;
  actualDelivery?: string;
  customerName: string;
  customerPhone: string;
}

interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  type: string;
  description: string;
  cost: number;
  date: string;
  nextDue: string;
  status: 'completed' | 'scheduled' | 'overdue';
}

type TabType = 'dashboard' | 'vehicles' | 'drivers' | 'routes' | 'shipments' | 'reports' | 'settings';

const App: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const aiLayerRef = useRef<AILayerHandle>(null);

  // State Management
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  
  // Modal and Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'vehicle' | 'driver' | 'route' | 'shipment' | 'maintenance'>('vehicle');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // AI States
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiError, setAiError] = useState<any>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Form States
  const [formData, setFormData] = useState<any>({});

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedVehicles = localStorage.getItem('transport_vehicles');
    const savedDrivers = localStorage.getItem('transport_drivers');
    const savedRoutes = localStorage.getItem('transport_routes');
    const savedShipments = localStorage.getItem('transport_shipments');
    const savedMaintenance = localStorage.getItem('transport_maintenance');

    if (savedVehicles) setVehicles(JSON.parse(savedVehicles));
    if (savedDrivers) setDrivers(JSON.parse(savedDrivers));
    if (savedRoutes) setRoutes(JSON.parse(savedRoutes));
    if (savedShipments) setShipments(JSON.parse(savedShipments));
    if (savedMaintenance) setMaintenanceRecords(JSON.parse(savedMaintenance));

    // Initialize with sample data if empty
    if (!savedVehicles) {
      const sampleVehicles: Vehicle[] = [
        {
          id: '1',
          vehicleNumber: 'TRK-001',
          type: 'Truck',
          model: 'Volvo FH16',
          capacity: 25000,
          fuelType: 'Diesel',
          status: 'active',
          driverId: '1',
          lastMaintenance: '2025-05-15',
          mileage: 45000,
          fuelConsumption: 8.5,
          location: 'Mumbai'
        },
        {
          id: '2',
          vehicleNumber: 'TRK-002',
          type: 'Van',
          model: 'Mercedes Sprinter',
          capacity: 3500,
          fuelType: 'Diesel',
          status: 'maintenance',
          lastMaintenance: '2025-06-01',
          mileage: 32000,
          fuelConsumption: 12.0,
          location: 'Delhi'
        }
      ];
      setVehicles(sampleVehicles);
      localStorage.setItem('transport_vehicles', JSON.stringify(sampleVehicles));
    }

    if (!savedDrivers) {
      const sampleDrivers: Driver[] = [
        {
          id: '1',
          name: 'Rajesh Kumar',
          licenseNumber: 'MH12-2019-0001234',
          phone: '+91-9876543210',
          email: 'rajesh.kumar@email.com',
          experience: 8,
          rating: 4.5,
          status: 'assigned',
          currentVehicleId: '1',
          totalTrips: 156,
          totalDistance: 125000
        },
        {
          id: '2',
          name: 'Amit Singh',
          licenseNumber: 'DL07-2020-0005678',
          phone: '+91-9876543211',
          email: 'amit.singh@email.com',
          experience: 5,
          rating: 4.2,
          status: 'available',
          totalTrips: 89,
          totalDistance: 67000
        }
      ];
      setDrivers(sampleDrivers);
      localStorage.setItem('transport_drivers', JSON.stringify(sampleDrivers));
    }

    if (!savedShipments) {
      const sampleShipments: Shipment[] = [
        {
          id: '1',
          trackingNumber: 'SHP-2025-001',
          origin: 'Mumbai',
          destination: 'Delhi',
          weight: 15000,
          value: 250000,
          status: 'in-transit',
          driverId: '1',
          vehicleId: '1',
          pickupDate: '2025-06-07',
          expectedDelivery: '2025-06-09',
          customerName: 'ABC Industries',
          customerPhone: '+91-9876543212'
        }
      ];
      setShipments(sampleShipments);
      localStorage.setItem('transport_shipments', JSON.stringify(sampleShipments));
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('transport_vehicles', JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    localStorage.setItem('transport_drivers', JSON.stringify(drivers));
  }, [drivers]);

  useEffect(() => {
    localStorage.setItem('transport_routes', JSON.stringify(routes));
  }, [routes]);

  useEffect(() => {
    localStorage.setItem('transport_shipments', JSON.stringify(shipments));
  }, [shipments]);

  useEffect(() => {
    localStorage.setItem('transport_maintenance', JSON.stringify(maintenanceRecords));
  }, [maintenanceRecords]);

  // Modal Management
  const openModal = (type: typeof modalType, item?: any) => {
    setModalType(type);
    setEditingItem(item || null);
    setFormData(item || {});
    setIsModalOpen(true);
    document.body.classList.add('modal-open');
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormData({});
    document.body.classList.remove('modal-open');
  };

  // AI Functions
  const handleAiAnalysis = async (prompt: string, file?: File) => {
    if (!prompt?.trim() && !file) {
      setAiError("Please provide input for AI analysis.");
      return;
    }

    setAiResult(null);
    setAiError(null);

    try {
      aiLayerRef.current?.sendToAI(prompt, file);
    } catch (error) {
      setAiError("Failed to process AI request");
    }
  };

  const optimizeRoute = () => {
    const prompt = `Analyze the current route data and provide optimization suggestions. Consider factors like distance, fuel consumption, traffic patterns, and delivery time windows. Return recommendations in JSON format with keys: "optimized_routes", "fuel_savings", "time_savings", "recommendations".

Current Routes Data:
${JSON.stringify(routes, null, 2)}

Current Vehicles Data:
${JSON.stringify(vehicles, null, 2)}`;

    handleAiAnalysis(prompt);
  };

  const analyzeShipmentDoc = (file: File) => {
    const prompt = `Extract shipment information from this document and return structured data in JSON format with keys: "tracking_number", "origin", "destination", "weight", "value", "customer_name", "customer_phone", "pickup_date", "expected_delivery", "special_instructions".`;
    
    handleAiAnalysis(prompt, file);
  };

  const predictMaintenance = () => {
    const prompt = `Analyze vehicle data and predict maintenance requirements. Consider mileage, last maintenance date, fuel consumption patterns, and usage intensity. Return predictions in JSON format with keys: "vehicles_needing_maintenance", "priority_level", "estimated_costs", "recommended_actions".

Vehicle Data:
${JSON.stringify(vehicles, null, 2)}

Maintenance Records:
${JSON.stringify(maintenanceRecords, null, 2)}`;

    handleAiAnalysis(prompt);
  };

  // CRUD Operations
  const handleSave = () => {
    if (!formData.id) {
      formData.id = Date.now().toString();
    }

    switch (modalType) {
      case 'vehicle':
        if (editingItem) {
          setVehicles(vehicles.map(v => v.id === editingItem.id ? formData : v));
        } else {
          setVehicles([...vehicles, formData]);
        }
        break;
      case 'driver':
        if (editingItem) {
          setDrivers(drivers.map(d => d.id === editingItem.id ? formData : d));
        } else {
          setDrivers([...drivers, formData]);
        }
        break;
      case 'route':
        if (editingItem) {
          setRoutes(routes.map(r => r.id === editingItem.id ? formData : r));
        } else {
          setRoutes([...routes, formData]);
        }
        break;
      case 'shipment':
        if (editingItem) {
          setShipments(shipments.map(s => s.id === editingItem.id ? formData : s));
        } else {
          setShipments([...shipments, formData]);
        }
        break;
      case 'maintenance':
        if (editingItem) {
          setMaintenanceRecords(maintenanceRecords.map(m => m.id === editingItem.id ? formData : m));
        } else {
          setMaintenanceRecords([...maintenanceRecords, formData]);
        }
        break;
    }
    closeModal();
  };

  const handleDelete = (type: string, id: string) => {
    switch (type) {
      case 'vehicle':
        setVehicles(vehicles.filter(v => v.id !== id));
        break;
      case 'driver':
        setDrivers(drivers.filter(d => d.id !== id));
        break;
      case 'route':
        setRoutes(routes.filter(r => r.id !== id));
        break;
      case 'shipment':
        setShipments(shipments.filter(s => s.id !== id));
        break;
      case 'maintenance':
        setMaintenanceRecords(maintenanceRecords.filter(m => m.id !== id));
        break;
    }
  };

  // Export Functions
  const exportToCsv = (data: any[], filename: string) => {
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0]).join(',');
    const csvContent = [
      headers,
      ...data.map(row => Object.values(row).map(val => 
        typeof val === 'string' && val.includes(',') ? `"${val}"` : val
      ).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadTemplate = (type: string) => {
    const templates = {
      vehicles: [{ vehicleNumber: 'TRK-XXX', type: 'Truck', model: 'Model Name', capacity: 25000, fuelType: 'Diesel', status: 'active', location: 'City Name', mileage: 0, fuelConsumption: 8.5, lastMaintenance: '2025-06-08' }],
      drivers: [{ name: 'Driver Name', licenseNumber: 'LICENSE-XXX', phone: '+91-XXXXXXXXXX', email: 'driver@email.com', experience: 5, status: 'available', rating: 4.0, totalTrips: 0, totalDistance: 0 }],
      shipments: [{ trackingNumber: 'SHP-XXX', origin: 'Origin City', destination: 'Destination City', weight: 1000, value: 50000, status: 'pending', pickupDate: '2025-06-08', expectedDelivery: '2025-06-10', customerName: 'Customer Name', customerPhone: '+91-XXXXXXXXXX' }]
    };
    
    exportToCsv(templates[type as keyof typeof templates] || [], `${type}_template`);
  };

  // Import Functions
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string;
        const lines = csv.split('\n');
        const headers = lines[0].split(',');
        const data = lines.slice(1).filter(line => line.trim()).map(line => {
          const values = line.split(',');
          const obj: any = {};
          headers.forEach((header, index) => {
            obj[header.trim()] = values[index]?.trim() || '';
          });
          obj.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
          return obj;
        });

        switch (type) {
          case 'vehicles':
            setVehicles([...vehicles, ...data]);
            break;
          case 'drivers':
            setDrivers([...drivers, ...data]);
            break;
          case 'shipments':
            setShipments([...shipments, ...data]);
            break;
        }
      } catch (error) {
        setAiError('Error parsing CSV file. Please check the format.');
      }
    };
    reader.readAsText(file);
  };

  // Dashboard Metrics
  const dashboardMetrics = {
    totalVehicles: vehicles.length,
    activeVehicles: vehicles.filter(v => v.status === 'active').length,
    totalDrivers: drivers.length,
    availableDrivers: drivers.filter(d => d.status === 'available').length,
    totalShipments: shipments.length,
    inTransitShipments: shipments.filter(s => s.status === 'in-transit').length,
    totalRevenue: shipments.reduce((sum, s) => sum + (s.value || 0), 0),
    fuelCosts: vehicles.reduce((sum, v) => sum + (v.fuelConsumption * 100), 0)
  };

  // Chart Data
  const vehicleStatusData = [
    { name: 'Active', value: vehicles.filter(v => v.status === 'active').length, color: '#10b981' },
    { name: 'Maintenance', value: vehicles.filter(v => v.status === 'maintenance').length, color: '#f59e0b' },
    { name: 'Inactive', value: vehicles.filter(v => v.status === 'inactive').length, color: '#ef4444' }
  ];

  const monthlyRevenueData = [
    { month: 'Jan', revenue: 420000, expenses: 180000 },
    { month: 'Feb', revenue: 380000, expenses: 160000 },
    { month: 'Mar', revenue: 450000, expenses: 200000 },
    { month: 'Apr', revenue: 520000, expenses: 220000 },
    { month: 'May', revenue: 480000, expenses: 210000 },
    { month: 'Jun', revenue: 580000, expenses: 250000 }
  ];

  // Render Functions
  const renderModal = () => {
    if (!isModalOpen) return null;

    const getModalTitle = () => {
      const titles = {
        vehicle: 'Vehicle',
        driver: 'Driver',
        route: 'Route',
        shipment: 'Shipment',
        maintenance: 'Maintenance'
      };
      return `${editingItem ? 'Edit' : 'Add'} ${titles[modalType]}`;
    };

    const renderFormFields = () => {
      switch (modalType) {
        case 'vehicle':
          return (
            <>
              <div className="form-group">
                <label className="form-label">Vehicle Number</label>
                <input
                  type="text"
                  className="input"
                  value={formData.vehicleNumber || ''}
                  onChange={(e) => setFormData({...formData, vehicleNumber: e.target.value})}
                  placeholder="TRK-001"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select
                    className="input"
                    value={formData.type || ''}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                  >
                    <option value="">Select Type</option>
                    <option value="Truck">Truck</option>
                    <option value="Van">Van</option>
                    <option value="Trailer">Trailer</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Model</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.model || ''}
                    onChange={(e) => setFormData({...formData, model: e.target.value})}
                    placeholder="Volvo FH16"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Capacity (kg)</label>
                  <input
                    type="number"
                    className="input"
                    value={formData.capacity || ''}
                    onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value)})}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Fuel Type</label>
                  <select
                    className="input"
                    value={formData.fuelType || ''}
                    onChange={(e) => setFormData({...formData, fuelType: e.target.value})}
                  >
                    <option value="">Select Fuel</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Petrol">Petrol</option>
                    <option value="Electric">Electric</option>
                    <option value="CNG">CNG</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="input"
                  value={formData.status || ''}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                  <option value="">Select Status</option>
                  <option value="active">Active</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </>
          );
        case 'driver':
          return (
            <>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className="input"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Driver Name"
                />
              </div>
              <div className="form-group">
                <label className="form-label">License Number</label>
                <input
                  type="text"
                  className="input"
                  value={formData.licenseNumber || ''}
                  onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
                  placeholder="MH12-2019-0001234"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    className="input"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="+91-9876543210"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="input"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="driver@email.com"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Experience (years)</label>
                  <input
                    type="number"
                    className="input"
                    value={formData.experience || ''}
                    onChange={(e) => setFormData({...formData, experience: parseInt(e.target.value)})}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Rating</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    className="input"
                    value={formData.rating || ''}
                    onChange={(e) => setFormData({...formData, rating: parseFloat(e.target.value)})}
                  />
                </div>
              </div>
            </>
          );
        case 'shipment':
          return (
            <>
              <div className="form-group">
                <label className="form-label">Tracking Number</label>
                <input
                  type="text"
                  className="input"
                  value={formData.trackingNumber || ''}
                  onChange={(e) => setFormData({...formData, trackingNumber: e.target.value})}
                  placeholder="SHP-2025-001"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Origin</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.origin || ''}
                    onChange={(e) => setFormData({...formData, origin: e.target.value})}
                    placeholder="Mumbai"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Destination</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.destination || ''}
                    onChange={(e) => setFormData({...formData, destination: e.target.value})}
                    placeholder="Delhi"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Weight (kg)</label>
                  <input
                    type="number"
                    className="input"
                    value={formData.weight || ''}
                    onChange={(e) => setFormData({...formData, weight: parseInt(e.target.value)})}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Value (₹)</label>
                  <input
                    type="number"
                    className="input"
                    value={formData.value || ''}
                    onChange={(e) => setFormData({...formData, value: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Customer Name</label>
                <input
                  type="text"
                  className="input"
                  value={formData.customerName || ''}
                  onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                  placeholder="Customer Name"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Customer Phone</label>
                <input
                  type="tel"
                  className="input"
                  value={formData.customerPhone || ''}
                  onChange={(e) => setFormData({...formData, customerPhone: e.target.value})}
                  placeholder="+91-9876543210"
                />
              </div>
            </>
          );
        default:
          return null;
      }
    };

    return (
      <div className="modal-backdrop" onClick={closeModal}>
        <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">{getModalTitle()}</h3>
            <button 
              onClick={closeModal}
              className="text-gray-400 hover:text-gray-500 transition-colors"
              aria-label="Close modal"
            >
              ×
            </button>
          </div>
          <div className="mt-4">
            {renderFormFields()}
          </div>
          <div className="modal-footer">
            <button 
              onClick={closeModal}
              className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              className="btn btn-primary"
            >
              {editingItem ? 'Update' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderDashboard = () => (
    <div id="dashboard-tab" className="space-y-6">
      <div className="flex-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h2>
        <div className="flex gap-2">
          <button
            onClick={optimizeRoute}
            className="btn btn-primary flex items-center gap-2"
            disabled={isAiLoading}
          >
            <Target size={16} />
            AI Route Optimization
          </button>
          <button
            onClick={predictMaintenance}
            className="btn bg-orange-500 text-white hover:bg-orange-600 flex items-center gap-2"
            disabled={isAiLoading}
          >
            <Activity size={16} />
            Predict Maintenance
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat-card bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <div className="stat-title text-blue-600 dark:text-blue-400">Total Vehicles</div>
              <div className="stat-value text-blue-900 dark:text-blue-100">{dashboardMetrics.totalVehicles}</div>
              <div className="stat-desc text-blue-600 dark:text-blue-400">{dashboardMetrics.activeVehicles} active</div>
            </div>
            <Truck className="h-12 w-12 text-blue-500" />
          </div>
        </div>

        <div className="stat-card bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between">
            <div>
              <div className="stat-title text-green-600 dark:text-green-400">Total Drivers</div>
              <div className="stat-value text-green-900 dark:text-green-100">{dashboardMetrics.totalDrivers}</div>
              <div className="stat-desc text-green-600 dark:text-green-400">{dashboardMetrics.availableDrivers} available</div>
            </div>
            <Users className="h-12 w-12 text-green-500" />
          </div>
        </div>

        <div className="stat-card bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between">
            <div>
              <div className="stat-title text-purple-600 dark:text-purple-400">Active Shipments</div>
              <div className="stat-value text-purple-900 dark:text-purple-100">{dashboardMetrics.inTransitShipments}</div>
              <div className="stat-desc text-purple-600 dark:text-purple-400">of {dashboardMetrics.totalShipments} total</div>
            </div>
            <Package className="h-12 w-12 text-purple-500" />
          </div>
        </div>

        <div className="stat-card bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
          <div className="flex items-center justify-between">
            <div>
              <div className="stat-title text-amber-600 dark:text-amber-400">Monthly Revenue</div>
              <div className="stat-value text-amber-900 dark:text-amber-100">₹{(dashboardMetrics.totalRevenue / 1000).toFixed(0)}K</div>
              <div className="stat-desc text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <TrendingUp size={14} />
                12% from last month
              </div>
            </div>
            <DollarSign className="h-12 w-12 text-amber-500" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-medium mb-4">Vehicle Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={vehicleStatusData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({name, value}) => `${name}: ${value}`}
              >
                {vehicleStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="text-lg font-medium mb-4">Monthly Revenue vs Expenses</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyRevenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`₹${value}`, '']} />
              <Bar dataKey="revenue" fill="#10b981" name="Revenue" />
              <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Results Section */}
      {(aiResult || aiError || isAiLoading) && (
        <div className="card">
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
            <Activity size={20} />
            AI Analysis Results
          </h3>
          {isAiLoading && (
            <div className="flex items-center gap-2 text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              Analyzing data...
            </div>
          )}
          {aiError && (
            <div className="alert alert-error">
              <AlertTriangle size={16} />
              <p>{aiError.toString()}</p>
            </div>
          )}
          {aiResult && (
            <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4 whitespace-pre-wrap">
              <p className="text-sm text-gray-600 dark:text-slate-400 mb-2">
                AI analysis complete. Review the insights below:
              </p>
              {aiResult}
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderVehicles = () => (
    <div id="vehicles-tab" className="space-y-6">
      <div className="flex-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Vehicle Management</h2>
        <div className="flex gap-2">
          <button
            onClick={() => downloadTemplate('vehicles')}
            className="btn bg-gray-500 text-white hover:bg-gray-600 flex items-center gap-2"
          >
            <Download size={16} />
            Template
          </button>
          <label className="btn bg-blue-500 text-white hover:bg-blue-600 flex items-center gap-2 cursor-pointer">
            <Upload size={16} />
            Import CSV
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => handleFileImport(e, 'vehicles')}
            />
          </label>
          <button
            onClick={() => openModal('vehicle')}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus size={16} />
            Add Vehicle
          </button>
        </div>
      </div>

      <div className="flex gap-4 mb-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search vehicles..."
            className="input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="input w-48"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="maintenance">Maintenance</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th className="table-header">Vehicle Number</th>
              <th className="table-header">Type</th>
              <th className="table-header">Model</th>
              <th className="table-header">Capacity</th>
              <th className="table-header">Status</th>
              <th className="table-header">Driver</th>
              <th className="table-header">Location</th>
              <th className="table-header">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
            {vehicles
              .filter(vehicle => 
                (filterStatus === 'all' || vehicle.status === filterStatus) &&
                (searchTerm === '' || 
                  vehicle.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  vehicle.model.toLowerCase().includes(searchTerm.toLowerCase())
                )
              )
              .map((vehicle) => {
                const assignedDriver = drivers.find(d => d.id === vehicle.driverId);
                return (
                  <tr key={vehicle.id}>
                    <td className="table-cell font-medium">{vehicle.vehicleNumber}</td>
                    <td className="table-cell">{vehicle.type}</td>
                    <td className="table-cell">{vehicle.model}</td>
                    <td className="table-cell">{vehicle.capacity?.toLocaleString()} kg</td>
                    <td className="table-cell">
                      <span className={`badge ${
                        vehicle.status === 'active' ? 'badge-success' :
                        vehicle.status === 'maintenance' ? 'badge-warning' : 'badge-error'
                      }`}>
                        {vehicle.status}
                      </span>
                    </td>
                    <td className="table-cell">{assignedDriver?.name || 'Unassigned'}</td>
                    <td className="table-cell">{vehicle.location}</td>
                    <td className="table-cell">
                      <div className="flex gap-1">
                        <button
                          onClick={() => openModal('vehicle', vehicle)}
                          className="btn btn-sm bg-blue-500 text-white hover:bg-blue-600"
                          aria-label="Edit vehicle"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete('vehicle', vehicle.id)}
                          className="btn btn-sm bg-red-500 text-white hover:bg-red-600"
                          aria-label="Delete vehicle"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            }
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderDrivers = () => (
    <div id="drivers-tab" className="space-y-6">
      <div className="flex-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Driver Management</h2>
        <div className="flex gap-2">
          <button
            onClick={() => downloadTemplate('drivers')}
            className="btn bg-gray-500 text-white hover:bg-gray-600 flex items-center gap-2"
          >
            <Download size={16} />
            Template
          </button>
          <label className="btn bg-blue-500 text-white hover:bg-blue-600 flex items-center gap-2 cursor-pointer">
            <Upload size={16} />
            Import CSV
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => handleFileImport(e, 'drivers')}
            />
          </label>
          <button
            onClick={() => openModal('driver')}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus size={16} />
            Add Driver
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th className="table-header">Name</th>
              <th className="table-header">License Number</th>
              <th className="table-header">Phone</th>
              <th className="table-header">Experience</th>
              <th className="table-header">Rating</th>
              <th className="table-header">Status</th>
              <th className="table-header">Total Trips</th>
              <th className="table-header">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
            {drivers.map((driver) => (
              <tr key={driver.id}>
                <td className="table-cell font-medium">{driver.name}</td>
                <td className="table-cell">{driver.licenseNumber}</td>
                <td className="table-cell">{driver.phone}</td>
                <td className="table-cell">{driver.experience} years</td>
                <td className="table-cell">
                  <div className="flex items-center gap-1">
                    <span>{driver.rating}</span>
                    <span className="text-yellow-400">★</span>
                  </div>
                </td>
                <td className="table-cell">
                  <span className={`badge ${
                    driver.status === 'available' ? 'badge-success' :
                    driver.status === 'assigned' ? 'badge-info' : 'badge-error'
                  }`}>
                    {driver.status}
                  </span>
                </td>
                <td className="table-cell">{driver.totalTrips}</td>
                <td className="table-cell">
                  <div className="flex gap-1">
                    <button
                      onClick={() => openModal('driver', driver)}
                      className="btn btn-sm bg-blue-500 text-white hover:bg-blue-600"
                      aria-label="Edit driver"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete('driver', driver.id)}
                      className="btn btn-sm bg-red-500 text-white hover:bg-red-600"
                      aria-label="Delete driver"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderShipments = () => (
    <div id="shipments-tab" className="space-y-6">
      <div className="flex-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Shipment Tracking</h2>
        <div className="flex gap-2">
          <label className="btn bg-purple-500 text-white hover:bg-purple-600 flex items-center gap-2 cursor-pointer">
            <Upload size={16} />
            AI Doc Scan
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setSelectedFile(file);
                  analyzeShipmentDoc(file);
                }
              }}
            />
          </label>
          <button
            onClick={() => downloadTemplate('shipments')}
            className="btn bg-gray-500 text-white hover:bg-gray-600 flex items-center gap-2"
          >
            <Download size={16} />
            Template
          </button>
          <button
            onClick={() => openModal('shipment')}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus size={16} />
            Add Shipment
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th className="table-header">Tracking Number</th>
              <th className="table-header">Route</th>
              <th className="table-header">Weight</th>
              <th className="table-header">Value</th>
              <th className="table-header">Status</th>
              <th className="table-header">Customer</th>
              <th className="table-header">Expected Delivery</th>
              <th className="table-header">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
            {shipments.map((shipment) => (
              <tr key={shipment.id}>
                <td className="table-cell font-medium">{shipment.trackingNumber}</td>
                <td className="table-cell">{shipment.origin} → {shipment.destination}</td>
                <td className="table-cell">{shipment.weight?.toLocaleString()} kg</td>
                <td className="table-cell">₹{shipment.value?.toLocaleString()}</td>
                <td className="table-cell">
                  <span className={`badge ${
                    shipment.status === 'delivered' ? 'badge-success' :
                    shipment.status === 'in-transit' ? 'badge-info' :
                    shipment.status === 'delayed' ? 'badge-warning' : 'badge-error'
                  }`}>
                    {shipment.status}
                  </span>
                </td>
                <td className="table-cell">{shipment.customerName}</td>
                <td className="table-cell">{shipment.expectedDelivery}</td>
                <td className="table-cell">
                  <div className="flex gap-1">
                    <button
                      onClick={() => openModal('shipment', shipment)}
                      className="btn btn-sm bg-blue-500 text-white hover:bg-blue-600"
                      aria-label="Edit shipment"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete('shipment', shipment.id)}
                      className="btn btn-sm bg-red-500 text-white hover:bg-red-600"
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
      </div>
    </div>
  );

  const renderReports = () => (
    <div id="reports-tab" className="space-y-6">
      <div className="flex-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h2>
        <div className="flex gap-2">
          <button
            onClick={() => exportToCsv(vehicles, 'vehicles_report')}
            className="btn bg-green-500 text-white hover:bg-green-600 flex items-center gap-2"
          >
            <Download size={16} />
            Export Vehicles
          </button>
          <button
            onClick={() => exportToCsv(shipments, 'shipments_report')}
            className="btn bg-blue-500 text-white hover:bg-blue-600 flex items-center gap-2"
          >
            <Download size={16} />
            Export Shipments
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-medium mb-4">Fleet Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyRevenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`₹${value}`, '']} />
              <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} />
              <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="text-lg font-medium mb-4">Driver Performance</h3>
          <div className="space-y-4">
            {drivers.slice(0, 5).map((driver) => (
              <div key={driver.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                <div>
                  <p className="font-medium">{driver.name}</p>
                  <p className="text-sm text-gray-500 dark:text-slate-400">{driver.totalTrips} trips</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{driver.rating} ★</p>
                  <p className="text-sm text-gray-500 dark:text-slate-400">{(driver.totalDistance / 1000).toFixed(0)}K km</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div id="settings-tab" className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-medium mb-4">Data Management</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-slate-400 mb-2">
                Export all data for backup purposes
              </p>
              <button
                onClick={() => {
                  const allData = {
                    vehicles,
                    drivers,
                    routes,
                    shipments,
                    maintenanceRecords,
                    exportDate: new Date().toISOString()
                  };
                  const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `transport_backup_${new Date().toISOString().split('T')[0]}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="btn bg-blue-500 text-white hover:bg-blue-600 flex items-center gap-2"
              >
                <Download size={16} />
                Export All Data
              </button>
            </div>
            
            <div>
              <p className="text-sm text-gray-600 dark:text-slate-400 mb-2">
                Clear all data (cannot be undone)
              </p>
              <button
                onClick={() => {
                  if (window.confirm?.('Are you sure you want to delete all data? This cannot be undone.')) {
                    setVehicles([]);
                    setDrivers([]);
                    setRoutes([]);
                    setShipments([]);
                    setMaintenanceRecords([]);
                    localStorage.clear();
                  }
                }}
                className="btn bg-red-500 text-white hover:bg-red-600 flex items-center gap-2"
              >
                <Trash2 size={16} />
                Clear All Data
              </button>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-medium mb-4">AI Assistant</h3>
          <div className="space-y-4">
            <div>
              <label className="form-label">Custom Analysis Prompt</label>
              <textarea
                className="input"
                rows={4}
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Enter your custom analysis request..."
              />
            </div>
            <button
              onClick={() => handleAiAnalysis(aiPrompt)}
              disabled={isAiLoading || !aiPrompt.trim()}
              className="btn btn-primary flex items-center gap-2"
            >
              <Activity size={16} />
              {isAiLoading ? 'Analyzing...' : 'Run Analysis'}
            </button>
            {aiResult && (
              <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4 mt-4">
                <h4 className="font-medium mb-2">Analysis Result:</h4>
                <pre className="text-sm whitespace-pre-wrap">{aiResult}</pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'vehicles':
        return renderVehicles();
      case 'drivers':
        return renderDrivers();
      case 'shipments':
        return renderShipments();
      case 'reports':
        return renderReports();
      case 'settings':
        return renderSettings();
      default:
        return renderDashboard();
    }
  };

  return (
    <div id="welcome_fallback" className="min-h-screen bg-gray-50 dark:bg-slate-900 theme-transition">
      <AILayer
        ref={aiLayerRef}
        prompt={aiPrompt}
        attachment={selectedFile || undefined}
        onResult={(result) => setAiResult(result)}
        onError={(error) => setAiError(error)}
        onLoading={(loading) => setIsAiLoading(loading)}
      />

      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-slate-700 theme-transition">
        <div className="container-fluid py-4">
          <div className="flex-between">
            <div id="generation_issue_fallback" className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-500 rounded-lg">
                <Truck className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">FleetFlow</h1>
                <p className="text-sm text-gray-500 dark:text-slate-400">Transport Management System</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {currentUser && (
                <>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300">
                    <User size={16} />
                    <span>Welcome, {currentUser.first_name}</span>
                  </div>
                  <button
                    onClick={logout}
                    className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300 flex items-center gap-2"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 theme-transition">
        <div className="container-fluid">
          <div className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'vehicles', label: 'Vehicles', icon: Truck },
              { id: 'drivers', label: 'Drivers', icon: Users },
              { id: 'shipments', label: 'Shipments', icon: Package },
              { id: 'reports', label: 'Reports', icon: FileText },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-300'
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container-fluid py-8">
        {renderTabContent()}
      </main>

      {/* Modal */}
      {renderModal()}

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 mt-12 theme-transition">
        <div className="container-fluid py-4 text-center text-sm text-gray-500 dark:text-slate-400">
          Copyright © 2025 Datavtar Private Limited. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default App;