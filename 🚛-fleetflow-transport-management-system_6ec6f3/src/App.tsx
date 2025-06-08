import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from './contexts/authContext';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import {
  Truck, Users, Route, Package, Wrench, ChartBar, Settings, Plus, Edit, Trash2,
  Search, Filter, Download, Upload, Calendar, MapPin, Clock, DollarSign,
  TrendingUp, AlertTriangle, CheckCircle, XCircle, Eye, FileText, Gauge,
  Navigation, Fuel, User, Phone, Mail, Star, Award, Target, Car, Bus,
  LogOut, Brain, X
} from 'lucide-react';
import styles from './styles/styles.module.css';

// Types and Interfaces
interface Vehicle {
  id: string;
  plateNumber: string;
  type: 'truck' | 'van' | 'bus' | 'motorcycle';
  model: string;
  year: number;
  capacity: number;
  fuelType: 'diesel' | 'petrol' | 'electric' | 'hybrid';
  status: 'active' | 'maintenance' | 'inactive';
  mileage: number;
  lastMaintenance: string;
  nextMaintenance: string;
  driver?: string;
  location: string;
  fuelLevel: number;
  cost: number;
}

interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  phone: string;
  email: string;
  experience: number;
  rating: number;
  status: 'available' | 'on-trip' | 'off-duty';
  vehicleAssigned?: string;
  totalTrips: number;
  joinDate: string;
  emergencyContact: string;
}

interface RouteData {
  id: string;
  name: string;
  origin: string;
  destination: string;
  distance: number;
  estimatedTime: number;
  tollCost: number;
  fuelCost: number;
  status: 'active' | 'completed' | 'cancelled';
  vehicleId?: string;
  driverId?: string;
  waypoints: string[];
  createdDate: string;
}

interface Shipment {
  id: string;
  trackingNumber: string;
  sender: string;
  recipient: string;
  pickupAddress: string;
  deliveryAddress: string;
  weight: number;
  dimensions: string;
  status: 'pending' | 'in-transit' | 'delivered' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  vehicleId?: string;
  driverId?: string;
  routeId?: string;
  pickupDate: string;
  expectedDelivery: string;
  actualDelivery?: string;
  cost: number;
  notes: string;
}

interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  type: 'routine' | 'repair' | 'inspection' | 'emergency';
  description: string;
  cost: number;
  date: string;
  nextDue: string;
  mechanic: string;
  status: 'scheduled' | 'in-progress' | 'completed';
  parts: string[];
  mileage: number;
}

type TabType = 'dashboard' | 'vehicles' | 'drivers' | 'routes' | 'shipments' | 'maintenance' | 'reports' | 'settings';

const App: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const aiLayerRef = useRef<AILayerHandle>(null);

  // State Management
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>([]);

  // Modal States
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [showShipmentModal, setShowShipmentModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);

  // Form States
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [editingRoute, setEditingRoute] = useState<RouteData | null>(null);
  const [editingShipment, setEditingShipment] = useState<Shipment | null>(null);
  const [editingMaintenance, setEditingMaintenance] = useState<MaintenanceRecord | null>(null);

  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // AI States
  const [aiPrompt, setAiPrompt] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<any>(null);

  // Settings States
  const [settings, setSettings] = useState({
    currency: 'USD',
    distanceUnit: 'km',
    fuelUnit: 'liters',
    timezone: 'UTC',
    theme: 'light',
    notifications: true,
    autoAssign: false
  });

  // Load data from localStorage on component mount
  useEffect(() => {
    const loadedVehicles = localStorage.getItem('transportVehicles');
    const loadedDrivers = localStorage.getItem('transportDrivers');
    const loadedRoutes = localStorage.getItem('transportRoutes');
    const loadedShipments = localStorage.getItem('transportShipments');
    const loadedMaintenance = localStorage.getItem('transportMaintenance');
    const loadedSettings = localStorage.getItem('transportSettings');

    if (loadedVehicles) setVehicles(JSON.parse(loadedVehicles));
    if (loadedDrivers) setDrivers(JSON.parse(loadedDrivers));
    if (loadedRoutes) setRoutes(JSON.parse(loadedRoutes));
    if (loadedShipments) setShipments(JSON.parse(loadedShipments));
    if (loadedMaintenance) setMaintenance(JSON.parse(loadedMaintenance));
    if (loadedSettings) setSettings(JSON.parse(loadedSettings));

    // Initialize with sample data if empty
    if (!loadedVehicles) initializeSampleData();
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('transportVehicles', JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    localStorage.setItem('transportDrivers', JSON.stringify(drivers));
  }, [drivers]);

  useEffect(() => {
    localStorage.setItem('transportRoutes', JSON.stringify(routes));
  }, [routes]);

  useEffect(() => {
    localStorage.setItem('transportShipments', JSON.stringify(shipments));
  }, [shipments]);

  useEffect(() => {
    localStorage.setItem('transportMaintenance', JSON.stringify(maintenance));
  }, [maintenance]);

  useEffect(() => {
    localStorage.setItem('transportSettings', JSON.stringify(settings));
  }, [settings]);

  const initializeSampleData = () => {
    const sampleVehicles: Vehicle[] = [
      {
        id: '1',
        plateNumber: 'TRK-001',
        type: 'truck',
        model: 'Volvo FH16',
        year: 2022,
        capacity: 25000,
        fuelType: 'diesel',
        status: 'active',
        mileage: 45000,
        lastMaintenance: '2025-05-15',
        nextMaintenance: '2025-07-15',
        driver: 'John Smith',
        location: 'New York',
        fuelLevel: 75,
        cost: 120000
      },
      {
        id: '2',
        plateNumber: 'VAN-002',
        type: 'van',
        model: 'Mercedes Sprinter',
        year: 2023,
        capacity: 3500,
        fuelType: 'diesel',
        status: 'active',
        mileage: 12000,
        lastMaintenance: '2025-04-20',
        nextMaintenance: '2025-08-20',
        driver: 'Sarah Johnson',
        location: 'Los Angeles',
        fuelLevel: 60,
        cost: 65000
      }
    ];

    const sampleDrivers: Driver[] = [
      {
        id: '1',
        name: 'John Smith',
        licenseNumber: 'CDL123456',
        phone: '+1-555-0101',
        email: 'john.smith@email.com',
        experience: 8,
        rating: 4.8,
        status: 'on-trip',
        vehicleAssigned: '1',
        totalTrips: 156,
        joinDate: '2020-03-15',
        emergencyContact: '+1-555-0102'
      },
      {
        id: '2',
        name: 'Sarah Johnson',
        licenseNumber: 'CDL789012',
        phone: '+1-555-0201',
        email: 'sarah.johnson@email.com',
        experience: 5,
        rating: 4.6,
        status: 'available',
        vehicleAssigned: '2',
        totalTrips: 89,
        joinDate: '2022-01-10',
        emergencyContact: '+1-555-0202'
      }
    ];

    const sampleRoutes: RouteData[] = [
      {
        id: '1',
        name: 'NY to LA Express',
        origin: 'New York, NY',
        destination: 'Los Angeles, CA',
        distance: 2789,
        estimatedTime: 40,
        tollCost: 150,
        fuelCost: 450,
        status: 'active',
        vehicleId: '1',
        driverId: '1',
        waypoints: ['Chicago, IL', 'Denver, CO'],
        createdDate: '2025-06-01'
      }
    ];

    const sampleShipments: Shipment[] = [
      {
        id: '1',
        trackingNumber: 'SHP001234',
        sender: 'ABC Corp',
        recipient: 'XYZ Industries',
        pickupAddress: '123 Main St, New York, NY',
        deliveryAddress: '456 Oak Ave, Los Angeles, CA',
        weight: 1500,
        dimensions: '2m x 1.5m x 1m',
        status: 'in-transit',
        priority: 'high',
        vehicleId: '1',
        driverId: '1',
        routeId: '1',
        pickupDate: '2025-06-07',
        expectedDelivery: '2025-06-09',
        cost: 2500,
        notes: 'Fragile electronics - handle with care'
      }
    ];

    const sampleMaintenance: MaintenanceRecord[] = [
      {
        id: '1',
        vehicleId: '1',
        type: 'routine',
        description: 'Oil change and filter replacement',
        cost: 150,
        date: '2025-05-15',
        nextDue: '2025-07-15',
        mechanic: 'Mike Wilson',
        status: 'completed',
        parts: ['Engine Oil', 'Oil Filter'],
        mileage: 45000
      }
    ];

    setVehicles(sampleVehicles);
    setDrivers(sampleDrivers);
    setRoutes(sampleRoutes);
    setShipments(sampleShipments);
    setMaintenance(sampleMaintenance);
  };

  // AI Functions
  const handleAIProcess = () => {
    if (!aiPrompt?.trim() && !selectedFile) {
      setAiError("Please provide a prompt or select a file to process.");
      return;
    }

    setAiResult(null);
    setAiError(null);

    try {
      if (selectedFile) {
        const enhancedPrompt = `${aiPrompt || 'Process this transport document and extract relevant information'} - Return data in JSON format with keys: type, vehicle_info, driver_info, route_details, shipment_data, maintenance_info, costs, dates`;
        aiLayerRef.current?.sendToAI(enhancedPrompt, selectedFile);
      } else {
        aiLayerRef.current?.sendToAI(aiPrompt);
      }
    } catch (error) {
      setAiError("Failed to process AI request");
    }
  };

  // CRUD Operations
  const addVehicle = (vehicle: Omit<Vehicle, 'id'>) => {
    const newVehicle: Vehicle = {
      ...vehicle,
      id: Date.now().toString()
    };
    setVehicles(prev => [...prev, newVehicle]);
  };

  const updateVehicle = (id: string, updatedVehicle: Partial<Vehicle>) => {
    setVehicles(prev => prev.map(v => v.id === id ? { ...v, ...updatedVehicle } : v));
  };

  const deleteVehicle = (id: string) => {
    setVehicles(prev => prev.filter(v => v.id !== id));
  };

  const addDriver = (driver: Omit<Driver, 'id'>) => {
    const newDriver: Driver = {
      ...driver,
      id: Date.now().toString()
    };
    setDrivers(prev => [...prev, newDriver]);
  };

  const updateDriver = (id: string, updatedDriver: Partial<Driver>) => {
    setDrivers(prev => prev.map(d => d.id === id ? { ...d, ...updatedDriver } : d));
  };

  const deleteDriver = (id: string) => {
    setDrivers(prev => prev.filter(d => d.id !== id));
  };

  // Export Functions
  const exportToCSV = (data: any[], filename: string) => {
    if (!data.length) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
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
      vehicles: 'plateNumber,type,model,year,capacity,fuelType,status,mileage,location,fuelLevel,cost\nTRK-001,truck,Volvo FH16,2022,25000,diesel,active,45000,New York,75,120000',
      drivers: 'name,licenseNumber,phone,email,experience,rating,status,totalTrips,joinDate,emergencyContact\nJohn Smith,CDL123456,+1-555-0101,john@email.com,8,4.8,available,156,2020-03-15,+1-555-0102',
      shipments: 'trackingNumber,sender,recipient,pickupAddress,deliveryAddress,weight,dimensions,status,priority,pickupDate,expectedDelivery,cost,notes\nSHP001,ABC Corp,XYZ Industries,123 Main St,456 Oak Ave,1500,2x1.5x1,pending,high,2025-06-08,2025-06-10,2500,Handle with care'
    };
    
    const content = templates[type as keyof typeof templates] || '';
    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}_template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filter and Search Functions
  const getFilteredVehicles = () => {
    return vehicles.filter(vehicle => {
      const matchesSearch = vehicle.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           vehicle.model.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'all' || vehicle.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  };

  const getFilteredDrivers = () => {
    return drivers.filter(driver => {
      const matchesSearch = driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           driver.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'all' || driver.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  };

  const getFilteredShipments = () => {
    return shipments.filter(shipment => {
      const matchesSearch = shipment.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           shipment.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           shipment.recipient.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'all' || shipment.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  };

  // Dashboard Metrics
  const dashboardMetrics = {
    totalVehicles: vehicles.length,
    activeVehicles: vehicles.filter(v => v.status === 'active').length,
    totalDrivers: drivers.length,
    availableDrivers: drivers.filter(d => d.status === 'available').length,
    activeShipments: shipments.filter(s => s.status === 'in-transit').length,
    completedShipments: shipments.filter(s => s.status === 'delivered').length,
    totalRevenue: shipments.reduce((sum, s) => sum + s.cost, 0),
    maintenanceDue: vehicles.filter(v => new Date(v.nextMaintenance) <= new Date()).length
  };

  const chartData = [
    { name: 'Jan', revenue: 15000, trips: 45 },
    { name: 'Feb', revenue: 18000, trips: 52 },
    { name: 'Mar', revenue: 22000, trips: 61 },
    { name: 'Apr', revenue: 25000, trips: 68 },
    { name: 'May', revenue: 28000, trips: 75 },
    { name: 'Jun', revenue: 32000, trips: 82 }
  ];

  // Vehicle Form Component
  const VehicleForm = () => {
    const [formData, setFormData] = useState<Partial<Vehicle>>(
      editingVehicle || {
        plateNumber: '',
        type: 'truck',
        model: '',
        year: new Date().getFullYear(),
        capacity: 0,
        fuelType: 'diesel',
        status: 'active',
        mileage: 0,
        lastMaintenance: '',
        nextMaintenance: '',
        location: '',
        fuelLevel: 100,
        cost: 0
      }
    );

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (editingVehicle) {
        updateVehicle(editingVehicle.id, formData);
      } else {
        addVehicle(formData as Omit<Vehicle, 'id'>);
      }
      setShowVehicleModal(false);
      setEditingVehicle(null);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Plate Number</label>
            <input
              type="text"
              className="input w-full"
              value={formData.plateNumber || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, plateNumber: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select
              className="input w-full"
              value={formData.type || 'truck'}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as Vehicle['type'] }))}
            >
              <option value="truck">Truck</option>
              <option value="van">Van</option>
              <option value="bus">Bus</option>
              <option value="motorcycle">Motorcycle</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Model</label>
            <input
              type="text"
              className="input w-full"
              value={formData.model || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Year</label>
            <input
              type="number"
              className="input w-full"
              value={formData.year || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Capacity (kg)</label>
            <input
              type="number"
              className="input w-full"
              value={formData.capacity || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, capacity: parseInt(e.target.value) }))}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Fuel Type</label>
            <select
              className="input w-full"
              value={formData.fuelType || 'diesel'}
              onChange={(e) => setFormData(prev => ({ ...prev, fuelType: e.target.value as Vehicle['fuelType'] }))}
            >
              <option value="diesel">Diesel</option>
              <option value="petrol">Petrol</option>
              <option value="electric">Electric</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              className="input w-full"
              value={formData.status || 'active'}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Vehicle['status'] }))}
            >
              <option value="active">Active</option>
              <option value="maintenance">Maintenance</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <input
              type="text"
              className="input w-full"
              value={formData.location || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              required
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <button
            type="button"
            onClick={() => setShowVehicleModal(false)}
            className="btn"
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            {editingVehicle ? 'Update' : 'Add'} Vehicle
          </button>
        </div>
      </form>
    );
  };

  if (!currentUser) {
    return (
      <div id="welcome_fallback" className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Truck className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">FleetFlow Transport Management</h1>
          <p className="text-gray-600">Please log in to access the transport management system.</p>
        </div>
      </div>
    );
  }

  return (
    <div id="generation_issue_fallback" className="min-h-screen bg-gray-50">
      <AILayer
        ref={aiLayerRef}
        prompt={aiPrompt}
        attachment={selectedFile || undefined}
        onResult={(result) => setAiResult(result)}
        onError={(error) => setAiError(error)}
        onLoading={(loading) => setAiLoading(loading)}
      />

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Truck className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">FleetFlow</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Welcome, {currentUser.first_name}</span>
              <button
                onClick={logout}
                className="btn text-sm"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: ChartBar },
              { id: 'vehicles', label: 'Vehicles', icon: Truck },
              { id: 'drivers', label: 'Drivers', icon: Users },
              { id: 'routes', label: 'Routes', icon: Route },
              { id: 'shipments', label: 'Shipments', icon: Package },
              { id: 'maintenance', label: 'Maintenance', icon: Wrench },
              { id: 'reports', label: 'Reports', icon: FileText },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                id={`${id}-tab`}
                onClick={() => setActiveTab(id as TabType)}
                className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
              <button
                onClick={() => setShowAIModal(true)}
                className="btn btn-primary"
              >
                <Brain className="w-4 h-4 mr-2" />
                AI Assistant
              </button>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Vehicles</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardMetrics.totalVehicles}</p>
                  </div>
                  <Truck className="w-8 h-8 text-blue-600" />
                </div>
                <p className="text-sm text-green-600 mt-2">
                  {dashboardMetrics.activeVehicles} active
                </p>
              </div>

              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Drivers</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardMetrics.totalDrivers}</p>
                  </div>
                  <Users className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-sm text-green-600 mt-2">
                  {dashboardMetrics.availableDrivers} available
                </p>
              </div>

              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Shipments</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardMetrics.activeShipments}</p>
                  </div>
                  <Package className="w-8 h-8 text-orange-600" />
                </div>
                <p className="text-sm text-blue-600 mt-2">
                  {dashboardMetrics.completedShipments} completed
                </p>
              </div>

              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${dashboardMetrics.totalRevenue.toLocaleString()}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-purple-600" />
                </div>
                <p className="text-sm text-green-600 mt-2">
                  <TrendingUp className="w-4 h-4 inline mr-1" />
                  +12% this month
                </p>
              </div>
            </div>

            {/* Charts and Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">Monthly Revenue</h3>
                {/* Chart placeholder - would use recharts here */}
                <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Revenue Chart (Recharts integration)</p>
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold mb-4">Recent Shipments</h3>
                <div className="space-y-3">
                  {shipments.slice(0, 5).map(shipment => (
                    <div key={shipment.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                      <div>
                        <p className="font-medium">{shipment.trackingNumber}</p>
                        <p className="text-sm text-gray-600">{shipment.sender} → {shipment.recipient}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        shipment.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        shipment.status === 'in-transit' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {shipment.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Alerts */}
            {dashboardMetrics.maintenanceDue > 0 && (
              <div className="card bg-yellow-50 border-yellow-200">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-yellow-600" />
                  <div>
                    <h3 className="font-semibold text-yellow-800">Maintenance Due</h3>
                    <p className="text-yellow-700">
                      {dashboardMetrics.maintenanceDue} vehicle(s) require maintenance
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'vehicles' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-2xl font-bold text-gray-900">Vehicle Management</h2>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <button
                  onClick={() => downloadTemplate('vehicles')}
                  className="btn"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Template
                </button>
                <button
                  onClick={() => exportToCSV(vehicles, 'vehicles')}
                  className="btn"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Export
                </button>
                <button
                  onClick={() => setShowVehicleModal(true)}
                  className="btn btn-primary"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Vehicle
                </button>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search vehicles..."
                  className="input pl-10 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="input w-full sm:w-auto"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="maintenance">Maintenance</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Vehicles Table */}
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Plate Number</th>
                      <th>Type</th>
                      <th>Model</th>
                      <th>Status</th>
                      <th>Driver</th>
                      <th>Location</th>
                      <th>Fuel Level</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredVehicles().map(vehicle => (
                      <tr key={vehicle.id}>
                        <td className="font-medium">{vehicle.plateNumber}</td>
                        <td>
                          <div className="flex items-center gap-2">
                            {vehicle.type === 'truck' && <Truck className="w-4 h-4" />}
                            {vehicle.type === 'van' && <Car className="w-4 h-4" />}
                            {vehicle.type === 'bus' && <Bus className="w-4 h-4" />}
                            {vehicle.type === 'motorcycle' && <Car className="w-4 h-4" />}
                            {vehicle.type}
                          </div>
                        </td>
                        <td>{vehicle.model}</td>
                        <td>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            vehicle.status === 'active' ? 'bg-green-100 text-green-800' :
                            vehicle.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {vehicle.status}
                          </span>
                        </td>
                        <td>{vehicle.driver || 'Unassigned'}</td>
                        <td>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            {vehicle.location}
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  vehicle.fuelLevel > 50 ? 'bg-green-500' :
                                  vehicle.fuelLevel > 25 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${vehicle.fuelLevel}%` }}
                              />
                            </div>
                            <span className="text-sm">{vehicle.fuelLevel}%</span>
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setEditingVehicle(vehicle);
                                setShowVehicleModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteVehicle(vehicle.id)}
                              className="text-red-600 hover:text-red-800"
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
          </div>
        )}

        {activeTab === 'drivers' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-2xl font-bold text-gray-900">Driver Management</h2>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <button
                  onClick={() => downloadTemplate('drivers')}
                  className="btn"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Template
                </button>
                <button
                  onClick={() => exportToCSV(drivers, 'drivers')}
                  className="btn"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Export
                </button>
                <button
                  onClick={() => setShowDriverModal(true)}
                  className="btn btn-primary"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Driver
                </button>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search drivers..."
                  className="input pl-10 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="input w-full sm:w-auto"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="available">Available</option>
                <option value="on-trip">On Trip</option>
                <option value="off-duty">Off Duty</option>
              </select>
            </div>

            {/* Drivers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getFilteredDrivers().map(driver => (
                <div key={driver.id} className="card">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{driver.name}</h3>
                        <p className="text-sm text-gray-600">{driver.licenseNumber}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      driver.status === 'available' ? 'bg-green-100 text-green-800' :
                      driver.status === 'on-trip' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {driver.status}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{driver.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="truncate">{driver.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span>{driver.rating}/5.0 ({driver.totalTrips} trips)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-gray-400" />
                      <span>{driver.experience} years experience</span>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                    <button
                      onClick={() => {
                        setEditingDriver(driver);
                        setShowDriverModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteDriver(driver.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'shipments' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-2xl font-bold text-gray-900">Shipment Tracking</h2>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <button
                  onClick={() => downloadTemplate('shipments')}
                  className="btn"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Template
                </button>
                <button
                  onClick={() => exportToCSV(shipments, 'shipments')}
                  className="btn"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Export
                </button>
                <button
                  onClick={() => setShowShipmentModal(true)}
                  className="btn btn-primary"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Shipment
                </button>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search shipments..."
                  className="input pl-10 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="input w-full sm:w-auto"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in-transit">In Transit</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Shipments Table */}
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Tracking Number</th>
                      <th>Sender</th>
                      <th>Recipient</th>
                      <th>Status</th>
                      <th>Priority</th>
                      <th>Pickup Date</th>
                      <th>Expected Delivery</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredShipments().map(shipment => (
                      <tr key={shipment.id}>
                        <td className="font-medium">{shipment.trackingNumber}</td>
                        <td>{shipment.sender}</td>
                        <td>{shipment.recipient}</td>
                        <td>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            shipment.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            shipment.status === 'in-transit' ? 'bg-blue-100 text-blue-800' :
                            shipment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {shipment.status}
                          </span>
                        </td>
                        <td>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            shipment.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                            shipment.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                            shipment.priority === 'medium' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {shipment.priority}
                          </span>
                        </td>
                        <td>{shipment.pickupDate}</td>
                        <td>{shipment.expectedDelivery}</td>
                        <td>
                          <div className="flex items-center gap-2">
                            <button className="text-blue-600 hover:text-blue-800">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingShipment(shipment);
                                setShowShipmentModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">System Preferences</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Currency</label>
                    <select
                      className="input w-full"
                      value={settings.currency}
                      onChange={(e) => setSettings(prev => ({ ...prev, currency: e.target.value }))}
                    >
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Distance Unit</label>
                    <select
                      className="input w-full"
                      value={settings.distanceUnit}
                      onChange={(e) => setSettings(prev => ({ ...prev, distanceUnit: e.target.value }))}
                    >
                      <option value="km">Kilometers</option>
                      <option value="miles">Miles</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Theme</label>
                    <select
                      className="input w-full"
                      value={settings.theme}
                      onChange={(e) => setSettings(prev => ({ ...prev, theme: e.target.value }))}
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="auto">Auto</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold mb-4">Data Management</h3>
                <div className="space-y-4">
                  <button
                    onClick={() => exportToCSV([...vehicles, ...drivers, ...shipments], 'all_transport_data')}
                    className="btn btn-primary w-full"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export All Data
                  </button>
                  <button
                    onClick={() => {
                      setVehicles([]);
                      setDrivers([]);
                      setRoutes([]);
                      setShipments([]);
                      setMaintenance([]);
                    }}
                    className="btn w-full bg-red-600 text-white hover:bg-red-700"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear All Data
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      {showVehicleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
              </h3>
              <VehicleForm />
            </div>
          </div>
        </div>
      )}

      {showAIModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">AI Transport Assistant</h3>
                <button
                  onClick={() => setShowAIModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Ask AI about transport operations, analyze documents, or get insights
                  </label>
                  <textarea
                    className="input w-full h-24 resize-none"
                    placeholder="Ask me about route optimization, fuel efficiency, maintenance schedules, or upload a transport document for analysis..."
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Upload Document (Optional)
                  </label>
                  <input
                    type="file"
                    className="input w-full"
                    accept=".pdf,.jpg,.jpeg,.png,.txt,.csv"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  />
                  {selectedFile && (
                    <p className="text-sm text-gray-600 mt-1">
                      Selected: {selectedFile.name}
                    </p>
                  )}
                </div>

                <button
                  onClick={handleAIProcess}
                  disabled={aiLoading || (!aiPrompt.trim() && !selectedFile)}
                  className="btn btn-primary w-full"
                >
                  {aiLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Processing...
                    </div>
                  ) : (
                    <>
                      <Brain className="w-4 h-4 mr-2" />
                      Analyze with AI
                    </>
                  )}
                </button>

                {aiError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800">Error: {aiError.message || 'Something went wrong'}</p>
                  </div>
                )}

                {aiResult && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold mb-2">AI Analysis Result:</h4>
                    <div className="prose prose-sm max-w-none">
                      <pre className="whitespace-pre-wrap text-sm">{aiResult}</pre>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                      Note: AI responses may contain errors. Please verify information before making decisions.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-600">
            Copyright © 2025 Datavtar Private Limited. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
