import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from './contexts/authContext';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import { 
  Truck, 
  Users, 
  MapPin, 
  Package, 
  BarChart3, 
  Settings, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Download, 
  Upload, 
  Calendar, 
  Clock, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Fuel,
  Wrench,
  Route,
  Navigation,
  User,
  Phone,
  Mail,
  CheckCircle,
  AlertCircle,
  XCircle,
  Car,
  LogOut,
  FileText,
  Camera,
  Brain, Trophy
} from 'lucide-react';
import styles from './styles/styles.module.css';

// Types and Interfaces
interface Vehicle {
  id: string;
  plateNumber: string;
  type: string;
  capacity: number;
  fuelType: string;
  status: 'active' | 'maintenance' | 'inactive';
  driver?: string;
  currentLocation: string;
  mileage: number;
  lastMaintenance: string;
  nextMaintenance: string;
}

interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  phone: string;
  email: string;
  experience: number;
  status: 'available' | 'on-trip' | 'off-duty';
  rating: number;
  totalTrips: number;
  currentVehicle?: string;
}

interface Route {
  id: string;
  name: string;
  startLocation: string;
  endLocation: string;
  distance: number;
  estimatedTime: number;
  tollCost: number;
  fuelCost: number;
  waypoints: string[];
  status: 'active' | 'planned' | 'completed';
}

interface Shipment {
  id: string;
  trackingNumber: string;
  sender: string;
  receiver: string;
  pickupAddress: string;
  deliveryAddress: string;
  weight: number;
  dimensions: string;
  value: number;
  status: 'pending' | 'picked-up' | 'in-transit' | 'delivered' | 'cancelled';
  vehicle?: string;
  driver?: string;
  route?: string;
  pickupDate: string;
  deliveryDate?: string;
  estimatedDelivery: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  specialInstructions?: string;
}

interface DashboardStats {
  totalVehicles: number;
  activeVehicles: number;
  totalDrivers: number;
  availableDrivers: number;
  activeShipments: number;
  completedToday: number;
  revenue: number;
  fuelCosts: number;
}

type TabType = 'dashboard' | 'fleet' | 'drivers' | 'routes' | 'shipments' | 'reports' | 'settings';

const App: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const aiLayerRef = useRef<AILayerHandle>(null);

  // State Management
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit' | 'view'>('add');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [currentEntity, setCurrentEntity] = useState<'vehicle' | 'driver' | 'route' | 'shipment'>('vehicle');

  // AI State
  const [aiPrompt, setAiPrompt] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<any>(null);
  const [showAiModal, setShowAiModal] = useState(false);

  // Form States
  const [vehicleForm, setVehicleForm] = useState({
    plateNumber: '',
    type: 'truck',
    capacity: '',
    fuelType: 'diesel',
    currentLocation: '',
    mileage: '',
    lastMaintenance: '',
    nextMaintenance: ''
  });

  const [driverForm, setDriverForm] = useState({
    name: '',
    licenseNumber: '',
    phone: '',
    email: '',
    experience: ''
  });

  const [routeForm, setRouteForm] = useState({
    name: '',
    startLocation: '',
    endLocation: '',
    distance: '',
    estimatedTime: '',
    tollCost: '',
    fuelCost: '',
    waypoints: ''
  });

  const [shipmentForm, setShipmentForm] = useState({
    sender: '',
    receiver: '',
    pickupAddress: '',
    deliveryAddress: '',
    weight: '',
    dimensions: '',
    value: '',
    pickupDate: '',
    estimatedDelivery: '',
    priority: 'medium',
    specialInstructions: ''
  });

  // Load data from localStorage on component mount
  useEffect(() => {
    const loadData = () => {
      const savedVehicles = localStorage.getItem('transportpro_vehicles');
      const savedDrivers = localStorage.getItem('transportpro_drivers');
      const savedRoutes = localStorage.getItem('transportpro_routes');
      const savedShipments = localStorage.getItem('transportpro_shipments');

      if (savedVehicles) setVehicles(JSON.parse(savedVehicles));
      else initializeSampleData();
      
      if (savedDrivers) setDrivers(JSON.parse(savedDrivers));
      if (savedRoutes) setRoutes(JSON.parse(savedRoutes));
      if (savedShipments) setShipments(JSON.parse(savedShipments));
    };

    loadData();
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('transportpro_vehicles', JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    localStorage.setItem('transportpro_drivers', JSON.stringify(drivers));
  }, [drivers]);

  useEffect(() => {
    localStorage.setItem('transportpro_routes', JSON.stringify(routes));
  }, [routes]);

  useEffect(() => {
    localStorage.setItem('transportpro_shipments', JSON.stringify(shipments));
  }, [shipments]);

  const initializeSampleData = () => {
    const sampleVehicles: Vehicle[] = [
      {
        id: '1',
        plateNumber: 'TRP-001',
        type: 'Truck',
        capacity: 5000,
        fuelType: 'Diesel',
        status: 'active',
        driver: 'John Smith',
        currentLocation: 'New York, NY',
        mileage: 125000,
        lastMaintenance: '2024-05-15',
        nextMaintenance: '2024-07-15'
      },
      {
        id: '2',
        plateNumber: 'TRP-002',
        type: 'Van',
        capacity: 1500,
        fuelType: 'Gasoline',
        status: 'active',
        driver: 'Sarah Johnson',
        currentLocation: 'Los Angeles, CA',
        mileage: 87000,
        lastMaintenance: '2024-04-20',
        nextMaintenance: '2024-06-20'
      }
    ];

    const sampleDrivers: Driver[] = [
      {
        id: '1',
        name: 'John Smith',
        licenseNumber: 'CDL123456',
        phone: '+1-555-0123',
        email: 'john.smith@email.com',
        experience: 8,
        status: 'on-trip',
        rating: 4.8,
        totalTrips: 245,
        currentVehicle: 'TRP-001'
      },
      {
        id: '2',
        name: 'Sarah Johnson',
        licenseNumber: 'CDL789012',
        phone: '+1-555-0456',
        email: 'sarah.johnson@email.com',
        experience: 5,
        status: 'available',
        rating: 4.6,
        totalTrips: 189,
        currentVehicle: 'TRP-002'
      }
    ];

    const sampleRoutes: Route[] = [
      {
        id: '1',
        name: 'NY-LA Express',
        startLocation: 'New York, NY',
        endLocation: 'Los Angeles, CA',
        distance: 2800,
        estimatedTime: 40,
        tollCost: 150,
        fuelCost: 420,
        waypoints: ['Chicago, IL', 'Denver, CO', 'Las Vegas, NV'],
        status: 'active'
      }
    ];

    const sampleShipments: Shipment[] = [
      {
        id: '1',
        trackingNumber: 'TRP240001',
        sender: 'Acme Corp',
        receiver: 'Global Industries',
        pickupAddress: '123 Main St, New York, NY 10001',
        deliveryAddress: '456 Oak Ave, Los Angeles, CA 90210',
        weight: 2500,
        dimensions: '120x80x60 cm',
        value: 15000,
        status: 'in-transit',
        vehicle: 'TRP-001',
        driver: 'John Smith',
        route: 'NY-LA Express',
        pickupDate: '2024-06-08',
        estimatedDelivery: '2024-06-12',
        priority: 'high'
      }
    ];

    setVehicles(sampleVehicles);
    setDrivers(sampleDrivers);
    setRoutes(sampleRoutes);
    setShipments(sampleShipments);
  };

  // Calculate Dashboard Stats
  const getDashboardStats = (): DashboardStats => {
    const activeVehicles = vehicles.filter(v => v.status === 'active').length;
    const availableDrivers = drivers.filter(d => d.status === 'available').length;
    const activeShipments = shipments.filter(s => ['pending', 'picked-up', 'in-transit'].includes(s.status)).length;
    const completedToday = shipments.filter(s => s.status === 'delivered' && s.deliveryDate === new Date().toISOString().split('T')[0]).length;
    const revenue = shipments.filter(s => s.status === 'delivered').reduce((sum, s) => sum + (s.value * 0.1), 0);
    const fuelCosts = routes.reduce((sum, r) => sum + r.fuelCost, 0);

    return {
      totalVehicles: vehicles.length,
      activeVehicles,
      totalDrivers: drivers.length,
      availableDrivers,
      activeShipments,
      completedToday,
      revenue,
      fuelCosts
    };
  };

  // AI Functions
  const handleAiDocumentProcessing = () => {
    if (!aiPrompt.trim() && !selectedFile) {
      setAiError("Please provide a prompt or select a file to process.");
      return;
    }

    setAiResult(null);
    setAiError(null);

    const fullPrompt = selectedFile 
      ? `${aiPrompt || 'Extract shipment details from this document'} Please analyze this document and extract shipment information. Return JSON with fields: sender, receiver, pickupAddress, deliveryAddress, weight, dimensions, value, priority, specialInstructions`
      : aiPrompt;

    try {
      aiLayerRef.current?.sendToAI(fullPrompt, selectedFile || undefined);
    } catch (error) {
      setAiError("Failed to process AI request");
    }
  };

  const processAiResult = (result: string) => {
    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const extractedData = JSON.parse(jsonMatch[0]);
        setShipmentForm(prev => ({
          ...prev,
          ...extractedData,
          weight: extractedData.weight?.toString() || '',
          value: extractedData.value?.toString() || ''
        }));
        setShowAiModal(false);
        setModalType('add');
        setCurrentEntity('shipment');
        setShowModal(true);
      }
    } catch (error) {
      // If not JSON, just show the result
      setAiResult(result);
    }
  };

  // CRUD Operations
  const handleAddVehicle = () => {
    const newVehicle: Vehicle = {
      id: Date.now().toString(),
      plateNumber: vehicleForm.plateNumber,
      type: vehicleForm.type,
      capacity: parseInt(vehicleForm.capacity),
      fuelType: vehicleForm.fuelType,
      status: 'active',
      currentLocation: vehicleForm.currentLocation,
      mileage: parseInt(vehicleForm.mileage),
      lastMaintenance: vehicleForm.lastMaintenance,
      nextMaintenance: vehicleForm.nextMaintenance
    };

    setVehicles(prev => [...prev, newVehicle]);
    resetVehicleForm();
    setShowModal(false);
  };

  const handleAddDriver = () => {
    const newDriver: Driver = {
      id: Date.now().toString(),
      name: driverForm.name,
      licenseNumber: driverForm.licenseNumber,
      phone: driverForm.phone,
      email: driverForm.email,
      experience: parseInt(driverForm.experience),
      status: 'available',
      rating: 5.0,
      totalTrips: 0
    };

    setDrivers(prev => [...prev, newDriver]);
    resetDriverForm();
    setShowModal(false);
  };

  const handleAddRoute = () => {
    const newRoute: Route = {
      id: Date.now().toString(),
      name: routeForm.name,
      startLocation: routeForm.startLocation,
      endLocation: routeForm.endLocation,
      distance: parseInt(routeForm.distance),
      estimatedTime: parseInt(routeForm.estimatedTime),
      tollCost: parseFloat(routeForm.tollCost),
      fuelCost: parseFloat(routeForm.fuelCost),
      waypoints: routeForm.waypoints.split(',').map(w => w.trim()).filter(w => w),
      status: 'planned'
    };

    setRoutes(prev => [...prev, newRoute]);
    resetRouteForm();
    setShowModal(false);
  };

  const handleAddShipment = () => {
    const newShipment: Shipment = {
      id: Date.now().toString(),
      trackingNumber: `TRP${Date.now().toString().slice(-6)}`,
      sender: shipmentForm.sender,
      receiver: shipmentForm.receiver,
      pickupAddress: shipmentForm.pickupAddress,
      deliveryAddress: shipmentForm.deliveryAddress,
      weight: parseFloat(shipmentForm.weight),
      dimensions: shipmentForm.dimensions,
      value: parseFloat(shipmentForm.value),
      status: 'pending',
      pickupDate: shipmentForm.pickupDate,
      estimatedDelivery: shipmentForm.estimatedDelivery,
      priority: shipmentForm.priority as 'low' | 'medium' | 'high' | 'urgent',
      specialInstructions: shipmentForm.specialInstructions
    };

    setShipments(prev => [...prev, newShipment]);
    resetShipmentForm();
    setShowModal(false);
  };

  const handleDelete = (id: string, entity: string) => {
    switch (entity) {
      case 'vehicle':
        setVehicles(prev => prev.filter(v => v.id !== id));
        break;
      case 'driver':
        setDrivers(prev => prev.filter(d => d.id !== id));
        break;
      case 'route':
        setRoutes(prev => prev.filter(r => r.id !== id));
        break;
      case 'shipment':
        setShipments(prev => prev.filter(s => s.id !== id));
        break;
    }
  };

  // Form Reset Functions
  const resetVehicleForm = () => {
    setVehicleForm({
      plateNumber: '',
      type: 'truck',
      capacity: '',
      fuelType: 'diesel',
      currentLocation: '',
      mileage: '',
      lastMaintenance: '',
      nextMaintenance: ''
    });
  };

  const resetDriverForm = () => {
    setDriverForm({
      name: '',
      licenseNumber: '',
      phone: '',
      email: '',
      experience: ''
    });
  };

  const resetRouteForm = () => {
    setRouteForm({
      name: '',
      startLocation: '',
      endLocation: '',
      distance: '',
      estimatedTime: '',
      tollCost: '',
      fuelCost: '',
      waypoints: ''
    });
  };

  const resetShipmentForm = () => {
    setShipmentForm({
      sender: '',
      receiver: '',
      pickupAddress: '',
      deliveryAddress: '',
      weight: '',
      dimensions: '',
      value: '',
      pickupDate: '',
      estimatedDelivery: '',
      priority: 'medium',
      specialInstructions: ''
    });
  };

  // Utility Functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'available':
      case 'delivered':
        return 'badge-success';
      case 'maintenance':
      case 'on-trip':
      case 'in-transit':
        return 'badge-warning';
      case 'inactive':
      case 'off-duty':
      case 'cancelled':
        return 'badge-error';
      default:
        return 'badge-gray';
    }
  };

  const exportData = () => {
    const data = {
      vehicles,
      drivers,
      routes,
      shipments,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transportpro_data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAllData = () => {
    setVehicles([]);
    setDrivers([]);
    setRoutes([]);
    setShipments([]);
    localStorage.removeItem('transportpro_vehicles');
    localStorage.removeItem('transportpro_drivers');
    localStorage.removeItem('transportpro_routes');
    localStorage.removeItem('transportpro_shipments');
  };

  const stats = getDashboardStats();

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = vehicle.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || vehicle.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch = driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         driver.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || driver.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const filteredShipments = shipments.filter(shipment => {
    const matchesSearch = shipment.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shipment.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shipment.receiver.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || shipment.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (!currentUser) {
    return (
      <div className="flex-center min-h-screen">
        <div className="text-center">
          <h2 className="heading-3">Loading TransportPro...</h2>
          <p className="text-caption mt-2">Please wait while we authenticate you.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900" id="welcome_fallback">
      <AILayer
        ref={aiLayerRef}
        prompt={aiPrompt}
        attachment={selectedFile || undefined}
        onResult={(result) => {
          setAiResult(result);
          processAiResult(result);
        }}
        onError={(error) => setAiError(error)}
        onLoading={(loading) => setIsAiLoading(loading)}
      />

      {/* Header */}
      <header className="navbar bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Truck className="w-8 h-8 text-primary-600" />
            <h1 className="heading-5 text-primary-600">TransportPro</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600 dark:text-gray-300">
            Welcome, {currentUser.first_name}
          </span>
          <button 
            onClick={logout}
            className="btn btn-ghost btn-sm flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white dark:bg-gray-800 shadow-sm border-r min-h-screen">
          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`w-full text-left nav-link flex items-center gap-3 ${
                    activeTab === 'dashboard' ? 'nav-link-active' : ''
                  }`}
                  id="dashboard-tab"
                >
                  <BarChart3 className="w-5 h-5" />
                  Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('fleet')}
                  className={`w-full text-left nav-link flex items-center gap-3 ${
                    activeTab === 'fleet' ? 'nav-link-active' : ''
                  }`}
                  id="fleet-tab"
                >
                  <Truck className="w-5 h-5" />
                  Fleet Management
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('drivers')}
                  className={`w-full text-left nav-link flex items-center gap-3 ${
                    activeTab === 'drivers' ? 'nav-link-active' : ''
                  }`}
                  id="drivers-tab"
                >
                  <Users className="w-5 h-5" />
                  Drivers
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('routes')}
                  className={`w-full text-left nav-link flex items-center gap-3 ${
                    activeTab === 'routes' ? 'nav-link-active' : ''
                  }`}
                  id="routes-tab"
                >
                  <Route className="w-5 h-5" />
                  Routes
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('shipments')}
                  className={`w-full text-left nav-link flex items-center gap-3 ${
                    activeTab === 'shipments' ? 'nav-link-active' : ''
                  }`}
                  id="shipments-tab"
                >
                  <Package className="w-5 h-5" />
                  Shipments
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('reports')}
                  className={`w-full text-left nav-link flex items-center gap-3 ${
                    activeTab === 'reports' ? 'nav-link-active' : ''
                  }`}
                  id="reports-tab"
                >
                  <FileText className="w-5 h-5" />
                  Reports
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full text-left nav-link flex items-center gap-3 ${
                    activeTab === 'settings' ? 'nav-link-active' : ''
                  }`}
                  id="settings-tab"
                >
                  <Settings className="w-5 h-5" />
                  Settings
                </button>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6" id="generation_issue_fallback">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="heading-3">Dashboard Overview</h2>
                <button
                  onClick={() => setShowAiModal(true)}
                  className="btn btn-primary flex items-center gap-2"
                  id="ai-assistant-btn"
                >
                  <Brain className="w-4 h-4" />
                  AI Assistant
                </button>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="stat-card">
                  <div className="stat-title">Total Vehicles</div>
                  <div className="stat-value flex items-center gap-2">
                    <Truck className="w-6 h-6 text-primary-600" />
                    {stats.totalVehicles}
                  </div>
                  <div className="stat-change stat-increase">
                    {stats.activeVehicles} active
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-title">Total Drivers</div>
                  <div className="stat-value flex items-center gap-2">
                    <Users className="w-6 h-6 text-primary-600" />
                    {stats.totalDrivers}
                  </div>
                  <div className="stat-change stat-increase">
                    {stats.availableDrivers} available
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-title">Active Shipments</div>
                  <div className="stat-value flex items-center gap-2">
                    <Package className="w-6 h-6 text-warning-600" />
                    {stats.activeShipments}
                  </div>
                  <div className="stat-change">
                    {stats.completedToday} completed today
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-title">Revenue</div>
                  <div className="stat-value flex items-center gap-2">
                    <DollarSign className="w-6 h-6 text-success-600" />
                    ${stats.revenue.toLocaleString()}
                  </div>
                  <div className="stat-change stat-increase">
                    <TrendingUp className="w-4 h-4" />
                    +12.5%
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card card-padding">
                  <h3 className="heading-5 mb-4">Recent Shipments</h3>
                  <div className="space-y-3">
                    {shipments.slice(0, 5).map((shipment) => (
                      <div key={shipment.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div>
                          <div className="font-medium">{shipment.trackingNumber}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            {shipment.sender} → {shipment.receiver}
                          </div>
                        </div>
                        <span className={`badge ${getStatusColor(shipment.status)}`}>
                          {shipment.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card card-padding">
                  <h3 className="heading-5 mb-4">Vehicle Status</h3>
                  <div className="space-y-3">
                    {vehicles.slice(0, 5).map((vehicle) => (
                      <div key={vehicle.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Car className="w-5 h-5 text-primary-600" />
                          <div>
                            <div className="font-medium">{vehicle.plateNumber}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-300">
                              {vehicle.currentLocation}
                            </div>
                          </div>
                        </div>
                        <span className={`badge ${getStatusColor(vehicle.status)}`}>
                          {vehicle.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Fleet Management Tab */}
          {activeTab === 'fleet' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="heading-3">Fleet Management</h2>
                <button
                  onClick={() => {
                    setModalType('add');
                    setCurrentEntity('vehicle');
                    resetVehicleForm();
                    setShowModal(true);
                  }}
                  className="btn btn-primary flex items-center gap-2"
                  id="add-vehicle-btn"
                >
                  <Plus className="w-4 h-4" />
                  Add Vehicle
                </button>
              </div>

              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search vehicles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input pl-10"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="select w-auto"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Vehicles Table */}
              <div className="table-container">
                <table className="table">
                  <thead className="table-header">
                    <tr>
                      <th className="table-header-cell">Plate Number</th>
                      <th className="table-header-cell">Type</th>
                      <th className="table-header-cell">Capacity</th>
                      <th className="table-header-cell">Driver</th>
                      <th className="table-header-cell">Status</th>
                      <th className="table-header-cell">Location</th>
                      <th className="table-header-cell">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {filteredVehicles.map((vehicle) => (
                      <tr key={vehicle.id} className="table-row">
                        <td className="table-cell font-medium">{vehicle.plateNumber}</td>
                        <td className="table-cell">{vehicle.type}</td>
                        <td className="table-cell">{vehicle.capacity} kg</td>
                        <td className="table-cell">{vehicle.driver || 'Unassigned'}</td>
                        <td className="table-cell">
                          <span className={`badge ${getStatusColor(vehicle.status)}`}>
                            {vehicle.status}
                          </span>
                        </td>
                        <td className="table-cell">{vehicle.currentLocation}</td>
                        <td className="table-cell">
                          <div className="flex items-center gap-2">
                            <button className="btn btn-ghost btn-sm">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="btn btn-ghost btn-sm">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(vehicle.id, 'vehicle')}
                              className="btn btn-ghost btn-sm text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Drivers Tab */}
          {activeTab === 'drivers' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="heading-3">Driver Management</h2>
                <button
                  onClick={() => {
                    setModalType('add');
                    setCurrentEntity('driver');
                    resetDriverForm();
                    setShowModal(true);
                  }}
                  className="btn btn-primary flex items-center gap-2"
                  id="add-driver-btn"
                >
                  <Plus className="w-4 h-4" />
                  Add Driver
                </button>
              </div>

              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search drivers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input pl-10"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="select w-auto"
                >
                  <option value="all">All Status</option>
                  <option value="available">Available</option>
                  <option value="on-trip">On Trip</option>
                  <option value="off-duty">Off Duty</option>
                </select>
              </div>

              {/* Drivers Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDrivers.map((driver) => (
                  <div key={driver.id} className="card card-padding">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="avatar avatar-lg bg-primary-100 text-primary-600">
                        <User className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{driver.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          License: {driver.licenseNumber}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-gray-400" />
                        {driver.phone}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-gray-400" />
                        {driver.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Trophy className="w-4 h-4 text-gray-400" />
                        {driver.experience} years experience
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className={`badge ${getStatusColor(driver.status)}`}>
                        {driver.status}
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium">{driver.rating}</span>
                        <span className="text-yellow-500">★</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-4">
                      <button className="btn btn-ghost btn-sm flex-1">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="btn btn-ghost btn-sm flex-1">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(driver.id, 'driver')}
                        className="btn btn-ghost btn-sm flex-1 text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Routes Tab */}
          {activeTab === 'routes' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="heading-3">Route Management</h2>
                <button
                  onClick={() => {
                    setModalType('add');
                    setCurrentEntity('route');
                    resetRouteForm();
                    setShowModal(true);
                  }}
                  className="btn btn-primary flex items-center gap-2"
                  id="add-route-btn"
                >
                  <Plus className="w-4 h-4" />
                  Add Route
                </button>
              </div>

              {/* Routes Table */}
              <div className="table-container">
                <table className="table">
                  <thead className="table-header">
                    <tr>
                      <th className="table-header-cell">Route Name</th>
                      <th className="table-header-cell">Start Location</th>
                      <th className="table-header-cell">End Location</th>
                      <th className="table-header-cell">Distance</th>
                      <th className="table-header-cell">Est. Time</th>
                      <th className="table-header-cell">Total Cost</th>
                      <th className="table-header-cell">Status</th>
                      <th className="table-header-cell">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {routes.map((route) => (
                      <tr key={route.id} className="table-row">
                        <td className="table-cell font-medium">{route.name}</td>
                        <td className="table-cell">{route.startLocation}</td>
                        <td className="table-cell">{route.endLocation}</td>
                        <td className="table-cell">{route.distance} km</td>
                        <td className="table-cell">{route.estimatedTime}h</td>
                        <td className="table-cell">${(route.tollCost + route.fuelCost).toFixed(2)}</td>
                        <td className="table-cell">
                          <span className={`badge ${getStatusColor(route.status)}`}>
                            {route.status}
                          </span>
                        </td>
                        <td className="table-cell">
                          <div className="flex items-center gap-2">
                            <button className="btn btn-ghost btn-sm">
                              <Navigation className="w-4 h-4" />
                            </button>
                            <button className="btn btn-ghost btn-sm">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(route.id, 'route')}
                              className="btn btn-ghost btn-sm text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Shipments Tab */}
          {activeTab === 'shipments' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="heading-3">Shipment Management</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAiModal(true)}
                    className="btn btn-secondary flex items-center gap-2"
                  >
                    <Brain className="w-4 h-4" />
                    AI Extract
                  </button>
                  <button
                    onClick={() => {
                      setModalType('add');
                      setCurrentEntity('shipment');
                      resetShipmentForm();
                      setShowModal(true);
                    }}
                    className="btn btn-primary flex items-center gap-2"
                    id="add-shipment-btn"
                  >
                    <Plus className="w-4 h-4" />
                    Add Shipment
                  </button>
                </div>
              </div>

              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search shipments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input pl-10"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="select w-auto"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="picked-up">Picked Up</option>
                  <option value="in-transit">In Transit</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Shipments Table */}
              <div className="table-container">
                <table className="table">
                  <thead className="table-header">
                    <tr>
                      <th className="table-header-cell">Tracking #</th>
                      <th className="table-header-cell">Sender</th>
                      <th className="table-header-cell">Receiver</th>
                      <th className="table-header-cell">Weight</th>
                      <th className="table-header-cell">Value</th>
                      <th className="table-header-cell">Priority</th>
                      <th className="table-header-cell">Status</th>
                      <th className="table-header-cell">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {filteredShipments.map((shipment) => (
                      <tr key={shipment.id} className="table-row">
                        <td className="table-cell font-medium">{shipment.trackingNumber}</td>
                        <td className="table-cell">{shipment.sender}</td>
                        <td className="table-cell">{shipment.receiver}</td>
                        <td className="table-cell">{shipment.weight} kg</td>
                        <td className="table-cell">${shipment.value.toLocaleString()}</td>
                        <td className="table-cell">
                          <span className={`badge ${
                            shipment.priority === 'urgent' ? 'badge-error' :
                            shipment.priority === 'high' ? 'badge-warning' :
                            shipment.priority === 'medium' ? 'badge-primary' : 'badge-gray'
                          }`}>
                            {shipment.priority}
                          </span>
                        </td>
                        <td className="table-cell">
                          <span className={`badge ${getStatusColor(shipment.status)}`}>
                            {shipment.status}
                          </span>
                        </td>
                        <td className="table-cell">
                          <div className="flex items-center gap-2">
                            <button className="btn btn-ghost btn-sm">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="btn btn-ghost btn-sm">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(shipment.id, 'shipment')}
                              className="btn btn-ghost btn-sm text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              <h2 className="heading-3">Reports & Analytics</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card card-padding">
                  <h3 className="heading-5 mb-4">Performance Metrics</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>On-time Delivery Rate</span>
                      <span className="font-semibold text-success-600">94.5%</span>
                    </div>
                    <div className="progress">
                      <div className="progress-bar" style={{ width: '94.5%' }}></div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span>Fleet Utilization</span>
                      <span className="font-semibold text-primary-600">87.2%</span>
                    </div>
                    <div className="progress">
                      <div className="progress-bar" style={{ width: '87.2%' }}></div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span>Customer Satisfaction</span>
                      <span className="font-semibold text-success-600">4.8/5</span>
                    </div>
                    <div className="progress">
                      <div className="progress-bar" style={{ width: '96%' }}></div>
                    </div>
                  </div>
                </div>

                <div className="card card-padding">
                  <h3 className="heading-5 mb-4">Cost Analysis</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Fuel className="w-4 h-4 text-warning-600" />
                        <span>Fuel Costs</span>
                      </div>
                      <span className="font-semibold">$12,450</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Wrench className="w-4 h-4 text-error-600" />
                        <span>Maintenance</span>
                      </div>
                      <span className="font-semibold">$3,200</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-primary-600" />
                        <span>Driver Wages</span>
                      </div>
                      <span className="font-semibold">$18,750</span>
                    </div>
                    
                    <div className="border-t pt-2 mt-4">
                      <div className="flex items-center justify-between font-semibold">
                        <span>Total Operating Cost</span>
                        <span>$34,400</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card card-padding">
                <h3 className="heading-5 mb-4">Monthly Trends</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-success-600">342</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Deliveries This Month</div>
                    <div className="text-xs text-success-600 flex items-center justify-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3" />
                      +8.2%
                    </div>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-primary-600">98.1%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Success Rate</div>
                    <div className="text-xs text-success-600 flex items-center justify-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3" />
                      +2.1%
                    </div>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-warning-600">4.2h</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Avg. Delivery Time</div>
                    <div className="text-xs text-success-600 flex items-center justify-center gap-1 mt-1">
                      <TrendingDown className="w-3 h-3" />
                      -12min
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h2 className="heading-3">Settings</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card card-padding">
                  <h3 className="heading-5 mb-4">Data Management</h3>
                  <div className="space-y-4">
                    <button
                      onClick={exportData}
                      className="btn btn-secondary w-full flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Export All Data
                    </button>
                    
                    <button
                      onClick={clearAllData}
                      className="btn btn-error w-full flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Clear All Data
                    </button>
                  </div>
                </div>

                <div className="card card-padding">
                  <h3 className="heading-5 mb-4">System Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Version</span>
                      <span className="font-medium">1.0.0</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Backup</span>
                      <span className="font-medium">June 10, 2025</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Database Size</span>
                      <span className="font-medium">2.4 MB</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card card-padding">
                <h3 className="heading-5 mb-4">Preferences</h3>
                <div className="space-y-4">
                  <div className="form-group">
                    <label className="form-label">Default Currency</label>
                    <select className="select">
                      <option>USD - US Dollar</option>
                      <option>EUR - Euro</option>
                      <option>GBP - British Pound</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Distance Unit</label>
                    <select className="select">
                      <option>Kilometers</option>
                      <option>Miles</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Weight Unit</label>
                    <select className="select">
                      <option>Kilograms</option>
                      <option>Pounds</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modal for Adding/Editing */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="heading-5">
                {modalType === 'add' ? 'Add' : 'Edit'} {currentEntity.charAt(0).toUpperCase() + currentEntity.slice(1)}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="btn btn-ghost btn-sm"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>

            <div className="modal-body">
              {currentEntity === 'vehicle' && (
                <div className="space-y-4">
                  <div className="form-group">
                    <label className="form-label">Plate Number</label>
                    <input
                      type="text"
                      value={vehicleForm.plateNumber}
                      onChange={(e) => setVehicleForm(prev => ({ ...prev, plateNumber: e.target.value }))}
                      className="input"
                      placeholder="Enter plate number"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="form-group">
                      <label className="form-label">Vehicle Type</label>
                      <select
                        value={vehicleForm.type}
                        onChange={(e) => setVehicleForm(prev => ({ ...prev, type: e.target.value }))}
                        className="select"
                      >
                        <option value="truck">Truck</option>
                        <option value="van">Van</option>
                        <option value="motorcycle">Motorcycle</option>
                        <option value="trailer">Trailer</option>
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Capacity (kg)</label>
                      <input
                        type="number"
                        value={vehicleForm.capacity}
                        onChange={(e) => setVehicleForm(prev => ({ ...prev, capacity: e.target.value }))}
                        className="input"
                        placeholder="Enter capacity"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="form-group">
                      <label className="form-label">Fuel Type</label>
                      <select
                        value={vehicleForm.fuelType}
                        onChange={(e) => setVehicleForm(prev => ({ ...prev, fuelType: e.target.value }))}
                        className="select"
                      >
                        <option value="diesel">Diesel</option>
                        <option value="gasoline">Gasoline</option>
                        <option value="electric">Electric</option>
                        <option value="hybrid">Hybrid</option>
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Mileage</label>
                      <input
                        type="number"
                        value={vehicleForm.mileage}
                        onChange={(e) => setVehicleForm(prev => ({ ...prev, mileage: e.target.value }))}
                        className="input"
                        placeholder="Enter mileage"
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Current Location</label>
                    <input
                      type="text"
                      value={vehicleForm.currentLocation}
                      onChange={(e) => setVehicleForm(prev => ({ ...prev, currentLocation: e.target.value }))}
                      className="input"
                      placeholder="Enter current location"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="form-group">
                      <label className="form-label">Last Maintenance</label>
                      <input
                        type="date"
                        value={vehicleForm.lastMaintenance}
                        onChange={(e) => setVehicleForm(prev => ({ ...prev, lastMaintenance: e.target.value }))}
                        className="input"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Next Maintenance</label>
                      <input
                        type="date"
                        value={vehicleForm.nextMaintenance}
                        onChange={(e) => setVehicleForm(prev => ({ ...prev, nextMaintenance: e.target.value }))}
                        className="input"
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentEntity === 'driver' && (
                <div className="space-y-4">
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      value={driverForm.name}
                      onChange={(e) => setDriverForm(prev => ({ ...prev, name: e.target.value }))}
                      className="input"
                      placeholder="Enter full name"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">License Number</label>
                    <input
                      type="text"
                      value={driverForm.licenseNumber}
                      onChange={(e) => setDriverForm(prev => ({ ...prev, licenseNumber: e.target.value }))}
                      className="input"
                      placeholder="Enter license number"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="form-group">
                      <label className="form-label">Phone Number</label>
                      <input
                        type="tel"
                        value={driverForm.phone}
                        onChange={(e) => setDriverForm(prev => ({ ...prev, phone: e.target.value }))}
                        className="input"
                        placeholder="Enter phone number"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Experience (years)</label>
                      <input
                        type="number"
                        value={driverForm.experience}
                        onChange={(e) => setDriverForm(prev => ({ ...prev, experience: e.target.value }))}
                        className="input"
                        placeholder="Years of experience"
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      value={driverForm.email}
                      onChange={(e) => setDriverForm(prev => ({ ...prev, email: e.target.value }))}
                      className="input"
                      placeholder="Enter email address"
                    />
                  </div>
                </div>
              )}

              {currentEntity === 'route' && (
                <div className="space-y-4">
                  <div className="form-group">
                    <label className="form-label">Route Name</label>
                    <input
                      type="text"
                      value={routeForm.name}
                      onChange={(e) => setRouteForm(prev => ({ ...prev, name: e.target.value }))}
                      className="input"
                      placeholder="Enter route name"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="form-group">
                      <label className="form-label">Start Location</label>
                      <input
                        type="text"
                        value={routeForm.startLocation}
                        onChange={(e) => setRouteForm(prev => ({ ...prev, startLocation: e.target.value }))}
                        className="input"
                        placeholder="Start location"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">End Location</label>
                      <input
                        type="text"
                        value={routeForm.endLocation}
                        onChange={(e) => setRouteForm(prev => ({ ...prev, endLocation: e.target.value }))}
                        className="input"
                        placeholder="End location"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="form-group">
                      <label className="form-label">Distance (km)</label>
                      <input
                        type="number"
                        value={routeForm.distance}
                        onChange={(e) => setRouteForm(prev => ({ ...prev, distance: e.target.value }))}
                        className="input"
                        placeholder="Distance in km"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Estimated Time (hours)</label>
                      <input
                        type="number"
                        value={routeForm.estimatedTime}
                        onChange={(e) => setRouteForm(prev => ({ ...prev, estimatedTime: e.target.value }))}
                        className="input"
                        placeholder="Time in hours"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="form-group">
                      <label className="form-label">Toll Cost ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={routeForm.tollCost}
                        onChange={(e) => setRouteForm(prev => ({ ...prev, tollCost: e.target.value }))}
                        className="input"
                        placeholder="Toll cost"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Fuel Cost ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={routeForm.fuelCost}
                        onChange={(e) => setRouteForm(prev => ({ ...prev, fuelCost: e.target.value }))}
                        className="input"
                        placeholder="Fuel cost"
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Waypoints (comma separated)</label>
                    <input
                      type="text"
                      value={routeForm.waypoints}
                      onChange={(e) => setRouteForm(prev => ({ ...prev, waypoints: e.target.value }))}
                      className="input"
                      placeholder="City 1, City 2, City 3"
                    />
                  </div>
                </div>
              )}

              {currentEntity === 'shipment' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="form-group">
                      <label className="form-label">Sender</label>
                      <input
                        type="text"
                        value={shipmentForm.sender}
                        onChange={(e) => setShipmentForm(prev => ({ ...prev, sender: e.target.value }))}
                        className="input"
                        placeholder="Sender name"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Receiver</label>
                      <input
                        type="text"
                        value={shipmentForm.receiver}
                        onChange={(e) => setShipmentForm(prev => ({ ...prev, receiver: e.target.value }))}
                        className="input"
                        placeholder="Receiver name"
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Pickup Address</label>
                    <input
                      type="text"
                      value={shipmentForm.pickupAddress}
                      onChange={(e) => setShipmentForm(prev => ({ ...prev, pickupAddress: e.target.value }))}
                      className="input"
                      placeholder="Pickup address"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Delivery Address</label>
                    <input
                      type="text"
                      value={shipmentForm.deliveryAddress}
                      onChange={(e) => setShipmentForm(prev => ({ ...prev, deliveryAddress: e.target.value }))}
                      className="input"
                      placeholder="Delivery address"
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="form-group">
                      <label className="form-label">Weight (kg)</label>
                      <input
                        type="number"
                        value={shipmentForm.weight}
                        onChange={(e) => setShipmentForm(prev => ({ ...prev, weight: e.target.value }))}
                        className="input"
                        placeholder="Weight"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Dimensions</label>
                      <input
                        type="text"
                        value={shipmentForm.dimensions}
                        onChange={(e) => setShipmentForm(prev => ({ ...prev, dimensions: e.target.value }))}
                        className="input"
                        placeholder="L x W x H"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Value ($)</label>
                      <input
                        type="number"
                        value={shipmentForm.value}
                        onChange={(e) => setShipmentForm(prev => ({ ...prev, value: e.target.value }))}
                        className="input"
                        placeholder="Package value"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="form-group">
                      <label className="form-label">Pickup Date</label>
                      <input
                        type="date"
                        value={shipmentForm.pickupDate}
                        onChange={(e) => setShipmentForm(prev => ({ ...prev, pickupDate: e.target.value }))}
                        className="input"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Estimated Delivery</label>
                      <input
                        type="date"
                        value={shipmentForm.estimatedDelivery}
                        onChange={(e) => setShipmentForm(prev => ({ ...prev, estimatedDelivery: e.target.value }))}
                        className="input"
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select
                      value={shipmentForm.priority}
                      onChange={(e) => setShipmentForm(prev => ({ ...prev, priority: e.target.value }))}
                      className="select"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Special Instructions</label>
                    <textarea
                      value={shipmentForm.specialInstructions}
                      onChange={(e) => setShipmentForm(prev => ({ ...prev, specialInstructions: e.target.value }))}
                      className="textarea"
                      placeholder="Any special handling instructions"
                      rows={3}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                onClick={() => setShowModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (currentEntity === 'vehicle') handleAddVehicle();
                  else if (currentEntity === 'driver') handleAddDriver();
                  else if (currentEntity === 'route') handleAddRoute();
                  else if (currentEntity === 'shipment') handleAddShipment();
                }}
                className="btn btn-primary"
              >
                {modalType === 'add' ? 'Add' : 'Update'} {currentEntity.charAt(0).toUpperCase() + currentEntity.slice(1)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Modal */}
      {showAiModal && (
        <div className="modal-backdrop" onClick={() => setShowAiModal(false)}>
          <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="heading-5 flex items-center gap-2">
                <Brain className="w-5 h-5" />
                AI Document Processing
              </h3>
              <button
                onClick={() => setShowAiModal(false)}
                className="btn btn-ghost btn-sm"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>

            <div className="modal-body space-y-4">
              <div className="form-group">
                <label className="form-label">Upload Document</label>
                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="input"
                  accept="image/*,.pdf,.doc,.docx"
                />
                <p className="form-help">
                  Upload shipping documents, invoices, or delivery receipts for automatic data extraction
                </p>
              </div>

              <div className="form-group">
                <label className="form-label">Additional Instructions (Optional)</label>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="textarea"
                  placeholder="Any specific information you want to extract or additional context..."
                  rows={3}
                />
              </div>

              {isAiLoading && (
                <div className="text-center py-4">
                  <div className="animate-spin inline-block w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full"></div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                    Processing document with AI...
                  </p>
                </div>
              )}

              {aiError && (
                <div className="alert alert-error">
                  <AlertCircle className="w-4 h-4" />
                  <span>Error: {aiError.message || 'Failed to process document'}</span>
                </div>
              )}

              {aiResult && (
                <div className="alert alert-success">
                  <CheckCircle className="w-4 h-4" />
                  <span>Document processed successfully! Check the shipment form.</span>
                </div>
              )}

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Note:</strong> AI can extract information from shipping documents, invoices, delivery receipts, 
                  and other transport-related documents. The extracted data will automatically populate the shipment form.
                </p>
              </div>
            </div>

            <div className="modal-footer">
              <button
                onClick={() => setShowAiModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleAiDocumentProcessing}
                disabled={(!aiPrompt.trim() && !selectedFile) || isAiLoading}
                className="btn btn-primary"
              >
                {isAiLoading ? 'Processing...' : 'Process Document'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t mt-auto">
        <div className="container py-4">
          <p className="text-center text-sm text-gray-600 dark:text-gray-300">
            Copyright © 2025 Datavtar Private Limited. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;