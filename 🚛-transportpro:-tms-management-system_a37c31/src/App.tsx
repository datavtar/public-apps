import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from './contexts/authContext';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import {
  Truck, Users, Route, BarChart3, Settings, Plus, Search, Filter,
  MapPin, Calendar, DollarSign, Fuel, AlertTriangle, CheckCircle,
  Clock, Edit, Trash2, Download, Upload, Eye, Navigation, Package,
  User, Phone, Mail, FileText, TrendingUp, TrendingDown, Gauge,
  Activity, ShoppingBag, CircleGauge, Star, Medal, Target, Car,
  Database, X, ChevronRight, Menu, LogOut, Globe, Palette, Trash,
  FileImage, Calculator, Building
} from 'lucide-react';

// Types and Interfaces
interface Vehicle {
  id: string;
  vehicleNumber: string;
  type: 'truck' | 'van' | 'trailer' | 'pickup';
  capacity: number;
  driver?: string;
  status: 'active' | 'maintenance' | 'inactive';
  fuelLevel: number;
  lastMaintenance: string;
  nextMaintenance: string;
  location: string;
  mileage: number;
  registrationDate: string;
}

interface Driver {
  id: string;
  name: string;
  phone: string;
  email: string;
  licenseNumber: string;
  licenseExpiry: string;
  experience: number;
  rating: number;
  status: 'available' | 'on-route' | 'off-duty';
  currentVehicle?: string;
  totalDeliveries: number;
  joinDate: string;
}

interface Shipment {
  id: string;
  shipmentNumber: string;
  origin: string;
  destination: string;
  driverId?: string;
  vehicleId?: string;
  status: 'pending' | 'in-transit' | 'delivered' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  weight: number;
  volume: number;
  pickupDate: string;
  deliveryDate: string;
  customer: string;
  customerPhone: string;
  cost: number;
  distance: number;
}

interface Route {
  id: string;
  name: string;
  startPoint: string;
  endPoint: string;
  distance: number;
  estimatedTime: number;
  tollCost: number;
  fuelCost: number;
  waypoints: string[];
  isActive: boolean;
}

interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  type: 'routine' | 'repair' | 'emergency';
  description: string;
  cost: number;
  date: string;
  nextDue: string;
  mechanic: string;
}

interface Settings {
  language: 'en' | 'es' | 'fr' | 'de';
  currency: 'USD' | 'EUR' | 'GBP' | 'INR';
  theme: 'light' | 'dark';
  timezone: string;
  fuelUnit: 'liters' | 'gallons';
  distanceUnit: 'km' | 'miles';
}

const App: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [settings, setSettings] = useState<Settings>({
    language: 'en',
    currency: 'USD',
    theme: 'light',
    timezone: 'UTC',
    fuelUnit: 'liters',
    distanceUnit: 'km'
  });

  // Modal states
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [showShipmentModal, setShowShipmentModal] = useState(false);
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteItem, setDeleteItem] = useState<{type: string; id: string} | null>(null);

  // Form states
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [editingShipment, setEditingShipment] = useState<Shipment | null>(null);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);
  const [editingMaintenance, setEditingMaintenance] = useState<MaintenanceRecord | null>(null);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // AI Layer states
  const aiLayerRef = useRef<AILayerHandle>(null);
  const [promptText, setPromptText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<any | null>(null);
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiContext, setAiContext] = useState('');

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedVehicles = localStorage.getItem('tms_vehicles');
    const savedDrivers = localStorage.getItem('tms_drivers');
    const savedShipments = localStorage.getItem('tms_shipments');
    const savedRoutes = localStorage.getItem('tms_routes');
    const savedMaintenance = localStorage.getItem('tms_maintenance');
    const savedSettings = localStorage.getItem('tms_settings');

    if (savedVehicles) {
      setVehicles(JSON.parse(savedVehicles));
    } else {
      // Initialize with sample data
      const sampleVehicles: Vehicle[] = [
        {
          id: '1',
          vehicleNumber: 'TRK-001',
          type: 'truck',
          capacity: 5000,
          driver: '1',
          status: 'active',
          fuelLevel: 75,
          lastMaintenance: '2025-05-15',
          nextMaintenance: '2025-07-15',
          location: 'New York, NY',
          mileage: 45000,
          registrationDate: '2023-01-15'
        },
        {
          id: '2',
          vehicleNumber: 'VAN-002',
          type: 'van',
          capacity: 1500,
          driver: '2',
          status: 'active',
          fuelLevel: 60,
          lastMaintenance: '2025-04-20',
          nextMaintenance: '2025-08-20',
          location: 'Chicago, IL',
          mileage: 32000,
          registrationDate: '2023-03-10'
        }
      ];
      setVehicles(sampleVehicles);
      localStorage.setItem('tms_vehicles', JSON.stringify(sampleVehicles));
    }

    if (savedDrivers) {
      setDrivers(JSON.parse(savedDrivers));
    } else {
      const sampleDrivers: Driver[] = [
        {
          id: '1',
          name: 'John Smith',
          phone: '+1-555-0123',
          email: 'john.smith@email.com',
          licenseNumber: 'DL123456789',
          licenseExpiry: '2026-12-31',
          experience: 8,
          rating: 4.8,
          status: 'on-route',
          currentVehicle: '1',
          totalDeliveries: 1250,
          joinDate: '2020-03-15'
        },
        {
          id: '2',
          name: 'Sarah Johnson',
          phone: '+1-555-0124',
          email: 'sarah.johnson@email.com',
          licenseNumber: 'DL987654321',
          licenseExpiry: '2027-06-30',
          experience: 5,
          rating: 4.6,
          status: 'available',
          currentVehicle: '2',
          totalDeliveries: 890,
          joinDate: '2021-07-20'
        }
      ];
      setDrivers(sampleDrivers);
      localStorage.setItem('tms_drivers', JSON.stringify(sampleDrivers));
    }

    if (savedShipments) {
      setShipments(JSON.parse(savedShipments));
    } else {
      const sampleShipments: Shipment[] = [
        {
          id: '1',
          shipmentNumber: 'SHP-001',
          origin: 'New York, NY',
          destination: 'Boston, MA',
          driverId: '1',
          vehicleId: '1',
          status: 'in-transit',
          priority: 'high',
          weight: 2500,
          volume: 15,
          pickupDate: '2025-06-09',
          deliveryDate: '2025-06-10',
          customer: 'ABC Corp',
          customerPhone: '+1-555-9999',
          cost: 850,
          distance: 215
        },
        {
          id: '2',
          shipmentNumber: 'SHP-002',
          origin: 'Chicago, IL',
          destination: 'Detroit, MI',
          driverId: '2',
          vehicleId: '2',
          status: 'pending',
          priority: 'medium',
          weight: 1200,
          volume: 8,
          pickupDate: '2025-06-11',
          deliveryDate: '2025-06-12',
          customer: 'XYZ Industries',
          customerPhone: '+1-555-8888',
          cost: 450,
          distance: 280
        }
      ];
      setShipments(sampleShipments);
      localStorage.setItem('tms_shipments', JSON.stringify(sampleShipments));
    }

    if (savedRoutes) {
      setRoutes(JSON.parse(savedRoutes));
    } else {
      const sampleRoutes: Route[] = [
        {
          id: '1',
          name: 'East Coast Express',
          startPoint: 'New York, NY',
          endPoint: 'Boston, MA',
          distance: 215,
          estimatedTime: 4.5,
          tollCost: 35,
          fuelCost: 65,
          waypoints: ['Hartford, CT'],
          isActive: true
        },
        {
          id: '2',
          name: 'Midwest Connector',
          startPoint: 'Chicago, IL',
          endPoint: 'Detroit, MI',
          distance: 280,
          estimatedTime: 5.2,
          tollCost: 25,
          fuelCost: 85,
          waypoints: ['Kalamazoo, MI'],
          isActive: true
        }
      ];
      setRoutes(sampleRoutes);
      localStorage.setItem('tms_routes', JSON.stringify(sampleRoutes));
    }

    if (savedMaintenance) {
      setMaintenanceRecords(JSON.parse(savedMaintenance));
    } else {
      const sampleMaintenance: MaintenanceRecord[] = [
        {
          id: '1',
          vehicleId: '1',
          type: 'routine',
          description: 'Oil change and tire rotation',
          cost: 150,
          date: '2025-05-15',
          nextDue: '2025-07-15',
          mechanic: 'Mike\'s Auto'
        },
        {
          id: '2',
          vehicleId: '2',
          type: 'repair',
          description: 'Brake pad replacement',
          cost: 320,
          date: '2025-04-20',
          nextDue: '2025-08-20',
          mechanic: 'City Garage'
        }
      ];
      setMaintenanceRecords(sampleMaintenance);
      localStorage.setItem('tms_maintenance', JSON.stringify(sampleMaintenance));
    }

    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('tms_vehicles', JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    localStorage.setItem('tms_drivers', JSON.stringify(drivers));
  }, [drivers]);

  useEffect(() => {
    localStorage.setItem('tms_shipments', JSON.stringify(shipments));
  }, [shipments]);

  useEffect(() => {
    localStorage.setItem('tms_routes', JSON.stringify(routes));
  }, [routes]);

  useEffect(() => {
    localStorage.setItem('tms_maintenance', JSON.stringify(maintenanceRecords));
  }, [maintenanceRecords]);

  useEffect(() => {
    localStorage.setItem('tms_settings', JSON.stringify(settings));
  }, [settings]);

  // Handle AI operations
  const handleAiAnalysis = (context: string, file?: File) => {
    setAiContext(context);
    setSelectedFile(file || null);
    setShowAiModal(true);
    
    let prompt = '';
    if (context === 'vehicle_document') {
      prompt = 'Analyze this vehicle document and extract relevant information. Return JSON with keys: "vehicleNumber", "type", "capacity", "registrationDate", "location", "mileage"';
    } else if (context === 'driver_document') {
      prompt = 'Analyze this driver document and extract relevant information. Return JSON with keys: "name", "phone", "email", "licenseNumber", "licenseExpiry", "experience"';
    } else if (context === 'shipment_document') {
      prompt = 'Analyze this shipment document and extract relevant information. Return JSON with keys: "origin", "destination", "customer", "customerPhone", "weight", "volume", "pickupDate", "deliveryDate", "cost"';
    } else if (context === 'maintenance_invoice') {
      prompt = 'Analyze this maintenance invoice and extract relevant information. Return JSON with keys: "vehicleId", "type", "description", "cost", "date", "mechanic"';
    }
    
    setPromptText(prompt);
    
    if (file) {
      aiLayerRef.current?.sendToAI(prompt, file);
    }
  };

  const handleAiResult = (result: string) => {
    setAiResult(result);
    
    try {
      const parsedResult = JSON.parse(result);
      
      if (aiContext === 'vehicle_document') {
        const newVehicle: Vehicle = {
          id: Date.now().toString(),
          vehicleNumber: parsedResult.vehicleNumber || '',
          type: parsedResult.type || 'truck',
          capacity: parsedResult.capacity || 0,
          driver: '',
          status: 'inactive',
          fuelLevel: 100,
          lastMaintenance: new Date().toISOString().split('T')[0],
          nextMaintenance: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          location: parsedResult.location || '',
          mileage: parsedResult.mileage || 0,
          registrationDate: parsedResult.registrationDate || new Date().toISOString().split('T')[0]
        };
        setVehicles([...vehicles, newVehicle]);
      } else if (aiContext === 'driver_document') {
        const newDriver: Driver = {
          id: Date.now().toString(),
          name: parsedResult.name || '',
          phone: parsedResult.phone || '',
          email: parsedResult.email || '',
          licenseNumber: parsedResult.licenseNumber || '',
          licenseExpiry: parsedResult.licenseExpiry || '',
          experience: parsedResult.experience || 0,
          rating: 5.0,
          status: 'available',
          totalDeliveries: 0,
          joinDate: new Date().toISOString().split('T')[0]
        };
        setDrivers([...drivers, newDriver]);
      } else if (aiContext === 'shipment_document') {
        const newShipment: Shipment = {
          id: Date.now().toString(),
          shipmentNumber: `SHP-${Date.now()}`,
          origin: parsedResult.origin || '',
          destination: parsedResult.destination || '',
          status: 'pending',
          priority: 'medium',
          weight: parsedResult.weight || 0,
          volume: parsedResult.volume || 0,
          pickupDate: parsedResult.pickupDate || new Date().toISOString().split('T')[0],
          deliveryDate: parsedResult.deliveryDate || new Date().toISOString().split('T')[0],
          customer: parsedResult.customer || '',
          customerPhone: parsedResult.customerPhone || '',
          cost: parsedResult.cost || 0,
          distance: 0
        };
        setShipments([...shipments, newShipment]);
      } else if (aiContext === 'maintenance_invoice') {
        const newMaintenance: MaintenanceRecord = {
          id: Date.now().toString(),
          vehicleId: parsedResult.vehicleId || '',
          type: parsedResult.type || 'routine',
          description: parsedResult.description || '',
          cost: parsedResult.cost || 0,
          date: parsedResult.date || new Date().toISOString().split('T')[0],
          nextDue: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          mechanic: parsedResult.mechanic || ''
        };
        setMaintenanceRecords([...maintenanceRecords, newMaintenance]);
      }
      
      setShowAiModal(false);
    } catch (error) {
      console.error('Failed to parse AI response:', error);
    }
  };

  // CRUD operations
  const addVehicle = (vehicle: Omit<Vehicle, 'id'>) => {
    const newVehicle = { ...vehicle, id: Date.now().toString() };
    setVehicles([...vehicles, newVehicle]);
  };

  const updateVehicle = (id: string, vehicle: Partial<Vehicle>) => {
    setVehicles(vehicles.map(v => v.id === id ? { ...v, ...vehicle } : v));
  };

  const deleteVehicle = (id: string) => {
    setVehicles(vehicles.filter(v => v.id !== id));
  };

  const addDriver = (driver: Omit<Driver, 'id'>) => {
    const newDriver = { ...driver, id: Date.now().toString() };
    setDrivers([...drivers, newDriver]);
  };

  const updateDriver = (id: string, driver: Partial<Driver>) => {
    setDrivers(drivers.map(d => d.id === id ? { ...d, ...driver } : d));
  };

  const deleteDriver = (id: string) => {
    setDrivers(drivers.filter(d => d.id !== id));
  };

  const addShipment = (shipment: Omit<Shipment, 'id'>) => {
    const newShipment = { ...shipment, id: Date.now().toString() };
    setShipments([...shipments, newShipment]);
  };

  const updateShipment = (id: string, shipment: Partial<Shipment>) => {
    setShipments(shipments.map(s => s.id === id ? { ...s, ...shipment } : s));
  };

  const deleteShipment = (id: string) => {
    setShipments(shipments.filter(s => s.id !== id));
  };

  const addRoute = (route: Omit<Route, 'id'>) => {
    const newRoute = { ...route, id: Date.now().toString() };
    setRoutes([...routes, newRoute]);
  };

  const updateRoute = (id: string, route: Partial<Route>) => {
    setRoutes(routes.map(r => r.id === id ? { ...r, ...route } : r));
  };

  const deleteRoute = (id: string) => {
    setRoutes(routes.filter(r => r.id !== id));
  };

  // Export functions
  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const downloadTemplate = (type: string) => {
    let template = '';
    if (type === 'vehicles') {
      template = 'vehicleNumber,type,capacity,status,fuelLevel,location,mileage,registrationDate\nTRK-001,truck,5000,active,75,New York NY,45000,2023-01-15';
    } else if (type === 'drivers') {
      template = 'name,phone,email,licenseNumber,licenseExpiry,experience\nJohn Smith,+1-555-0123,john@email.com,DL123456789,2026-12-31,8';
    } else if (type === 'shipments') {
      template = 'origin,destination,customer,customerPhone,weight,volume,pickupDate,deliveryDate,cost,priority\nNew York NY,Boston MA,ABC Corp,+1-555-9999,2500,15,2025-06-09,2025-06-10,850,high';
    }
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}_template.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const clearAllData = () => {
    setVehicles([]);
    setDrivers([]);
    setShipments([]);
    setRoutes([]);
    setMaintenanceRecords([]);
    localStorage.removeItem('tms_vehicles');
    localStorage.removeItem('tms_drivers');
    localStorage.removeItem('tms_shipments');
    localStorage.removeItem('tms_routes');
    localStorage.removeItem('tms_maintenance');
  };

  const handleDeleteConfirm = (type: string, id: string) => {
    setDeleteItem({ type, id });
    setShowDeleteConfirm(true);
  };

  const executeDelete = () => {
    if (!deleteItem) return;
    
    switch (deleteItem.type) {
      case 'vehicle':
        deleteVehicle(deleteItem.id);
        break;
      case 'driver':
        deleteDriver(deleteItem.id);
        break;
      case 'shipment':
        deleteShipment(deleteItem.id);
        break;
      case 'route':
        deleteRoute(deleteItem.id);
        break;
    }
    
    setShowDeleteConfirm(false);
    setDeleteItem(null);
  };

  // Calculate dashboard metrics
  const activeVehicles = vehicles.filter(v => v.status === 'active').length;
  const availableDrivers = drivers.filter(d => d.status === 'available').length;
  const activeShipments = shipments.filter(s => s.status === 'in-transit').length;
  const pendingShipments = shipments.filter(s => s.status === 'pending').length;
  const totalRevenue = shipments.reduce((sum, s) => sum + s.cost, 0);
  const avgFuelLevel = vehicles.reduce((sum, v) => sum + v.fuelLevel, 0) / (vehicles.length || 1);

  // Render functions
  const renderDashboard = () => (
    <div className="space-y-6" id="welcome_fallback">
      <div className="flex items-center justify-between">
        <h1 className="heading-2" id="generation_issue_fallback">Transport Management Dashboard</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowAiModal(true)}
            className="btn btn-primary flex items-center gap-2"
            id="ai-assistant-btn"
          >
            <Activity className="w-4 h-4" />
            AI Assistant
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" id="dashboard-metrics">
        <div className="card card-padding hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-caption">Active Vehicles</p>
              <p className="text-2xl font-bold text-primary-600">{activeVehicles}</p>
              <p className="text-xs text-success-600">↑ 12% from last month</p>
            </div>
            <Truck className="w-8 h-8 text-primary-500" />
          </div>
        </div>

        <div className="card card-padding hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-caption">Available Drivers</p>
              <p className="text-2xl font-bold text-primary-600">{availableDrivers}</p>
              <p className="text-xs text-success-600">↑ 5% from last week</p>
            </div>
            <Users className="w-8 h-8 text-primary-500" />
          </div>
        </div>

        <div className="card card-padding hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-caption">Active Shipments</p>
              <p className="text-2xl font-bold text-primary-600">{activeShipments}</p>
              <p className="text-xs text-warning-600">→ Same as yesterday</p>
            </div>
            <Package className="w-8 h-8 text-primary-500" />
          </div>
        </div>

        <div className="card card-padding hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-caption">Monthly Revenue</p>
              <p className="text-2xl font-bold text-primary-600">${totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-success-600">↑ 18% from last month</p>
            </div>
            <DollarSign className="w-8 h-8 text-primary-500" />
          </div>
        </div>
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card card-padding">
          <h3 className="heading-5 mb-4">Fleet Status Overview</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Active Vehicles</span>
              <span className="font-semibold">{activeVehicles}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-success-500 h-2 rounded-full" 
                style={{ width: `${(activeVehicles / vehicles.length) * 100}%` }}
              ></div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Maintenance Required</span>
              <span className="font-semibold">{vehicles.filter(v => v.status === 'maintenance').length}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-warning-500 h-2 rounded-full" 
                style={{ width: `${(vehicles.filter(v => v.status === 'maintenance').length / vehicles.length) * 100}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Average Fuel Level</span>
              <span className="font-semibold">{avgFuelLevel.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary-500 h-2 rounded-full" 
                style={{ width: `${avgFuelLevel}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="card card-padding">
          <h3 className="heading-5 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-success-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Shipment SHP-001 delivered</p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-warning-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Vehicle TRK-001 maintenance due</p>
                <p className="text-xs text-gray-500">5 hours ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <Plus className="w-5 h-5 text-primary-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium">New driver Sarah Johnson added</p>
                <p className="text-xs text-gray-500">1 day ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Shipments Table */}
      <div className="card card-padding">
        <div className="flex items-center justify-between mb-4">
          <h3 className="heading-5">Active Shipments</h3>
          <button
            onClick={() => setActiveTab('shipments')}
            className="btn btn-sm btn-secondary"
          >
            View All
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">Shipment #</th>
                <th className="table-header-cell">Route</th>
                <th className="table-header-cell">Driver</th>
                <th className="table-header-cell">Status</th>
                <th className="table-header-cell">Delivery Date</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {shipments.filter(s => s.status === 'in-transit').slice(0, 5).map(shipment => {
                const driver = drivers.find(d => d.id === shipment.driverId);
                return (
                  <tr key={shipment.id} className="table-row">
                    <td className="table-cell font-medium">{shipment.shipmentNumber}</td>
                    <td className="table-cell">{shipment.origin} → {shipment.destination}</td>
                    <td className="table-cell">{driver?.name || 'Unassigned'}</td>
                    <td className="table-cell">
                      <span className="badge badge-primary">In Transit</span>
                    </td>
                    <td className="table-cell">{shipment.deliveryDate}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderFleetManagement = () => {
    const filteredVehicles = vehicles.filter(vehicle => {
      const matchesSearch = vehicle.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           vehicle.type.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'all' || vehicle.status === filterStatus;
      return matchesSearch && matchesFilter;
    });

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="heading-2">Fleet Management</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => downloadTemplate('vehicles')}
              className="btn btn-secondary"
              id="download-vehicle-template"
            >
              <Download className="w-4 h-4" />
              Template
            </button>
            <label className="btn btn-secondary cursor-pointer">
              <Upload className="w-4 h-4" />
              Import
              <input
                type="file"
                accept=".csv,.jpg,.jpeg,.png,.pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleAiAnalysis('vehicle_document', file);
                  }
                }}
              />
            </label>
            <button
              onClick={() => {
                setEditingVehicle(null);
                setShowVehicleModal(true);
              }}
              className="btn btn-primary"
              id="add-vehicle-btn"
            >
              <Plus className="w-4 h-4" />
              Add Vehicle
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search vehicles..."
              className="input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="maintenance">Maintenance</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Vehicles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="vehicles-grid">
          {filteredVehicles.map(vehicle => {
            const driver = drivers.find(d => d.id === vehicle.driver);
            return (
              <div key={vehicle.id} className="card card-padding hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{vehicle.vehicleNumber}</h3>
                    <p className="text-sm text-gray-500 capitalize">{vehicle.type}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingVehicle(vehicle);
                        setShowVehicleModal(true);
                      }}
                      className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteConfirm('vehicle', vehicle.id)}
                      className="p-2 text-gray-400 hover:text-error-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    <span className={`badge ${
                      vehicle.status === 'active' ? 'badge-success' :
                      vehicle.status === 'maintenance' ? 'badge-warning' : 'badge-gray'
                    }`}>
                      {vehicle.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Driver</span>
                    <span className="text-sm font-medium">{driver?.name || 'Unassigned'}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Capacity</span>
                    <span className="text-sm font-medium">{vehicle.capacity} kg</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Fuel Level</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            vehicle.fuelLevel > 50 ? 'bg-success-500' :
                            vehicle.fuelLevel > 25 ? 'bg-warning-500' : 'bg-error-500'
                          }`}
                          style={{ width: `${vehicle.fuelLevel}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{vehicle.fuelLevel}%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Location</span>
                    <span className="text-sm font-medium">{vehicle.location}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Mileage</span>
                    <span className="text-sm font-medium">{vehicle.mileage.toLocaleString()} km</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredVehicles.length === 0 && (
          <div className="text-center py-12">
            <Truck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No vehicles found matching your criteria</p>
          </div>
        )}
      </div>
    );
  };

  const renderDriverManagement = () => {
    const filteredDrivers = drivers.filter(driver => {
      const matchesSearch = driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           driver.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'all' || driver.status === filterStatus;
      return matchesSearch && matchesFilter;
    });

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="heading-2">Driver Management</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => downloadTemplate('drivers')}
              className="btn btn-secondary"
              id="download-driver-template"
            >
              <Download className="w-4 h-4" />
              Template
            </button>
            <label className="btn btn-secondary cursor-pointer">
              <Upload className="w-4 h-4" />
              Import
              <input
                type="file"
                accept=".csv,.jpg,.jpeg,.png,.pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleAiAnalysis('driver_document', file);
                  }
                }}
              />
            </label>
            <button
              onClick={() => {
                setEditingDriver(null);
                setShowDriverModal(true);
              }}
              className="btn btn-primary"
              id="add-driver-btn"
            >
              <Plus className="w-4 h-4" />
              Add Driver
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search drivers..."
              className="input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="on-route">On Route</option>
            <option value="off-duty">Off Duty</option>
          </select>
        </div>

        {/* Drivers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="drivers-grid">
          {filteredDrivers.map(driver => {
            const vehicle = vehicles.find(v => v.id === driver.currentVehicle);
            return (
              <div key={driver.id} className="card card-padding hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{driver.name}</h3>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < Math.floor(driver.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="text-xs text-gray-500 ml-1">{driver.rating}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingDriver(driver);
                        setShowDriverModal(true);
                      }}
                      className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteConfirm('driver', driver.id)}
                      className="p-2 text-gray-400 hover:text-error-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    <span className={`badge ${
                      driver.status === 'available' ? 'badge-success' :
                      driver.status === 'on-route' ? 'badge-primary' : 'badge-gray'
                    }`}>
                      {driver.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Current Vehicle</span>
                    <span className="text-sm font-medium">{vehicle?.vehicleNumber || 'None'}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Experience</span>
                    <span className="text-sm font-medium">{driver.experience} years</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Deliveries</span>
                    <span className="text-sm font-medium">{driver.totalDeliveries}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">License Expiry</span>
                    <span className="text-sm font-medium">{driver.licenseExpiry}</span>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{driver.phone}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-sm truncate">{driver.email}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredDrivers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No drivers found matching your criteria</p>
          </div>
        )}
      </div>
    );
  };

  const renderShipments = () => {
    const filteredShipments = shipments.filter(shipment => {
      const matchesSearch = shipment.shipmentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           shipment.customer.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'all' || shipment.status === filterStatus;
      return matchesSearch && matchesFilter;
    });

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="heading-2">Shipments & Routes</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => downloadTemplate('shipments')}
              className="btn btn-secondary"
              id="download-shipment-template"
            >
              <Download className="w-4 h-4" />
              Template
            </button>
            <label className="btn btn-secondary cursor-pointer">
              <Upload className="w-4 h-4" />
              Import
              <input
                type="file"
                accept=".csv,.jpg,.jpeg,.png,.pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleAiAnalysis('shipment_document', file);
                  }
                }}
              />
            </label>
            <button
              onClick={() => {
                setEditingShipment(null);
                setShowShipmentModal(true);
              }}
              className="btn btn-primary"
              id="add-shipment-btn"
            >
              <Plus className="w-4 h-4" />
              Add Shipment
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search shipments..."
              className="input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="select"
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
        <div className="card card-padding" id="shipments-table">
          <div className="overflow-x-auto">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-header-cell">Shipment #</th>
                  <th className="table-header-cell">Route</th>
                  <th className="table-header-cell">Customer</th>
                  <th className="table-header-cell">Driver</th>
                  <th className="table-header-cell">Vehicle</th>
                  <th className="table-header-cell">Status</th>
                  <th className="table-header-cell">Priority</th>
                  <th className="table-header-cell">Delivery Date</th>
                  <th className="table-header-cell">Cost</th>
                  <th className="table-header-cell">Actions</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {filteredShipments.map(shipment => {
                  const driver = drivers.find(d => d.id === shipment.driverId);
                  const vehicle = vehicles.find(v => v.id === shipment.vehicleId);
                  return (
                    <tr key={shipment.id} className="table-row">
                      <td className="table-cell font-medium">{shipment.shipmentNumber}</td>
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="truncate">{shipment.origin} → {shipment.destination}</span>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div>
                          <p className="font-medium">{shipment.customer}</p>
                          <p className="text-xs text-gray-500">{shipment.customerPhone}</p>
                        </div>
                      </td>
                      <td className="table-cell">{driver?.name || 'Unassigned'}</td>
                      <td className="table-cell">{vehicle?.vehicleNumber || 'Unassigned'}</td>
                      <td className="table-cell">
                        <span className={`badge ${
                          shipment.status === 'pending' ? 'badge-warning' :
                          shipment.status === 'in-transit' ? 'badge-primary' :
                          shipment.status === 'delivered' ? 'badge-success' : 'badge-error'
                        }`}>
                          {shipment.status}
                        </span>
                      </td>
                      <td className="table-cell">
                        <span className={`badge ${
                          shipment.priority === 'high' ? 'badge-error' :
                          shipment.priority === 'medium' ? 'badge-warning' : 'badge-gray'
                        }`}>
                          {shipment.priority}
                        </span>
                      </td>
                      <td className="table-cell">{shipment.deliveryDate}</td>
                      <td className="table-cell">${shipment.cost}</td>
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingShipment(shipment);
                              setShowShipmentModal(true);
                            }}
                            className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteConfirm('shipment', shipment.id)}
                            className="p-1 text-gray-400 hover:text-error-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {filteredShipments.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No shipments found matching your criteria</p>
          </div>
        )}
      </div>
    );
  };

  const renderReports = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="heading-2">Reports & Analytics</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => exportToCSV(vehicles, 'vehicles_report')}
            className="btn btn-secondary"
            id="export-vehicles-report"
          >
            <Download className="w-4 h-4" />
            Export Vehicles
          </button>
          <button
            onClick={() => exportToCSV(shipments, 'shipments_report')}
            className="btn btn-secondary"
          >
            <Download className="w-4 h-4" />
            Export Shipments
          </button>
        </div>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" id="reports-overview">
        <div className="card card-padding">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Truck className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Fleet Utilization</p>
              <p className="text-2xl font-bold">85%</p>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-primary-500 h-2 rounded-full" style={{ width: '85%' }}></div>
          </div>
        </div>

        <div className="card card-padding">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-success-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-success-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Revenue This Month</p>
              <p className="text-2xl font-bold">${totalRevenue.toLocaleString()}</p>
            </div>
          </div>
          <p className="text-sm text-success-600">↑ 12% vs last month</p>
        </div>

        <div className="card card-padding">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-warning-100 rounded-lg">
              <Fuel className="w-6 h-6 text-warning-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Fuel Costs</p>
              <p className="text-2xl font-bold">$12,450</p>
            </div>
          </div>
          <p className="text-sm text-warning-600">↑ 5% vs last month</p>
        </div>

        <div className="card card-padding">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-info-100 rounded-lg">
              <Package className="w-6 h-6 text-info-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">On-Time Delivery</p>
              <p className="text-2xl font-bold">94%</p>
            </div>
          </div>
          <p className="text-sm text-success-600">↑ 2% vs last month</p>
        </div>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card card-padding">
          <h3 className="heading-5 mb-4">Monthly Revenue Trend</h3>
          <div className="h-64 flex items-end justify-between gap-2">
            {[65, 78, 82, 95, 88, 92].map((value, index) => (
              <div key={index} className="flex flex-col items-center gap-2">
                <div 
                  className="bg-primary-500 w-8 rounded-t"
                  style={{ height: `${(value / 100) * 200}px` }}
                ></div>
                <span className="text-xs text-gray-500">
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][index]}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card card-padding">
          <h3 className="heading-5 mb-4">Vehicle Status Distribution</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-success-500 rounded-full"></div>
                <span className="text-sm">Active</span>
              </div>
              <span className="text-sm font-medium">{vehicles.filter(v => v.status === 'active').length}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-warning-500 rounded-full"></div>
                <span className="text-sm">Maintenance</span>
              </div>
              <span className="text-sm font-medium">{vehicles.filter(v => v.status === 'maintenance').length}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                <span className="text-sm">Inactive</span>
              </div>
              <span className="text-sm font-medium">{vehicles.filter(v => v.status === 'inactive').length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Reports Table */}
      <div className="card card-padding">
        <h3 className="heading-5 mb-4">Driver Performance Report</h3>
        <div className="overflow-x-auto">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">Driver</th>
                <th className="table-header-cell">Total Deliveries</th>
                <th className="table-header-cell">Rating</th>
                <th className="table-header-cell">Experience</th>
                <th className="table-header-cell">Status</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {drivers.map(driver => (
                <tr key={driver.id} className="table-row">
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-primary-600" />
                      </div>
                      <span className="font-medium">{driver.name}</span>
                    </div>
                  </td>
                  <td className="table-cell">{driver.totalDeliveries}</td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      {driver.rating}
                    </div>
                  </td>
                  <td className="table-cell">{driver.experience} years</td>
                  <td className="table-cell">
                    <span className={`badge ${
                      driver.status === 'available' ? 'badge-success' :
                      driver.status === 'on-route' ? 'badge-primary' : 'badge-gray'
                    }`}>
                      {driver.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <h1 className="heading-2">Settings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <div className="card card-padding" id="general-settings">
          <h3 className="heading-5 mb-4">General Settings</h3>
          <div className="space-y-4">
            <div className="form-group">
              <label className="form-label">Language</label>
              <select
                className="select"
                value={settings.language}
                onChange={(e) => setSettings({...settings, language: e.target.value as Settings['language']})}
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Currency</label>
              <select
                className="select"
                value={settings.currency}
                onChange={(e) => setSettings({...settings, currency: e.target.value as Settings['currency']})}
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="INR">INR (₹)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Theme</label>
              <select
                className="select"
                value={settings.theme}
                onChange={(e) => setSettings({...settings, theme: e.target.value as Settings['theme']})}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Timezone</label>
              <select
                className="select"
                value={settings.timezone}
                onChange={(e) => setSettings({...settings, timezone: e.target.value})}
              >
                <option value="UTC">UTC</option>
                <option value="EST">Eastern Standard Time</option>
                <option value="PST">Pacific Standard Time</option>
                <option value="CST">Central Standard Time</option>
              </select>
            </div>
          </div>
        </div>

        {/* Unit Settings */}
        <div className="card card-padding">
          <h3 className="heading-5 mb-4">Unit Preferences</h3>
          <div className="space-y-4">
            <div className="form-group">
              <label className="form-label">Fuel Unit</label>
              <select
                className="select"
                value={settings.fuelUnit}
                onChange={(e) => setSettings({...settings, fuelUnit: e.target.value as Settings['fuelUnit']})}
              >
                <option value="liters">Liters</option>
                <option value="gallons">Gallons</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Distance Unit</label>
              <select
                className="select"
                value={settings.distanceUnit}
                onChange={(e) => setSettings({...settings, distanceUnit: e.target.value as Settings['distanceUnit']})}
              >
                <option value="km">Kilometers</option>
                <option value="miles">Miles</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="card card-padding">
          <h3 className="heading-5 mb-4">Data Management</h3>
          <div className="space-y-4">
            <button
              onClick={() => exportToCSV([...vehicles, ...drivers, ...shipments], 'complete_data_export')}
              className="btn btn-secondary w-full"
              id="export-all-data"
            >
              <Download className="w-4 h-4" />
              Export All Data
            </button>

            <button
              onClick={clearAllData}
              className="btn btn-error w-full"
              id="clear-all-data"
            >
              <Trash2 className="w-4 h-4" />
              Clear All Data
            </button>
          </div>
        </div>

        {/* Master Data */}
        <div className="card card-padding">
          <h3 className="heading-5 mb-4">Master Data</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Truck className="w-8 h-8 text-primary-500 mx-auto mb-2" />
                <p className="text-sm font-medium">{vehicles.length}</p>
                <p className="text-xs text-gray-500">Vehicles</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Users className="w-8 h-8 text-primary-500 mx-auto mb-2" />
                <p className="text-sm font-medium">{drivers.length}</p>
                <p className="text-xs text-gray-500">Drivers</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Package className="w-8 h-8 text-primary-500 mx-auto mb-2" />
                <p className="text-sm font-medium">{shipments.length}</p>
                <p className="text-xs text-gray-500">Shipments</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Route className="w-8 h-8 text-primary-500 mx-auto mb-2" />
                <p className="text-sm font-medium">{routes.length}</p>
                <p className="text-xs text-gray-500">Routes</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Modal Components
  const VehicleModal = () => {
    const [formData, setFormData] = useState<Partial<Vehicle>>(
      editingVehicle || {
        vehicleNumber: '',
        type: 'truck',
        capacity: 0,
        driver: '',
        status: 'active',
        fuelLevel: 100,
        lastMaintenance: new Date().toISOString().split('T')[0],
        nextMaintenance: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        location: '',
        mileage: 0,
        registrationDate: new Date().toISOString().split('T')[0]
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
      <div className="modal-backdrop" onClick={() => setShowVehicleModal(false)}>
        <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3 className="heading-4">{editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}</h3>
            <button
              onClick={() => setShowVehicleModal(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="modal-body space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label form-label-required">Vehicle Number</label>
                <input
                  type="text"
                  className="input"
                  value={formData.vehicleNumber || ''}
                  onChange={(e) => setFormData({...formData, vehicleNumber: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label form-label-required">Type</label>
                <select
                  className="select"
                  value={formData.type || 'truck'}
                  onChange={(e) => setFormData({...formData, type: e.target.value as Vehicle['type']})}
                >
                  <option value="truck">Truck</option>
                  <option value="van">Van</option>
                  <option value="trailer">Trailer</option>
                  <option value="pickup">Pickup</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label form-label-required">Capacity (kg)</label>
                <input
                  type="number"
                  className="input"
                  value={formData.capacity || ''}
                  onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value) || 0})}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Driver</label>
                <select
                  className="select"
                  value={formData.driver || ''}
                  onChange={(e) => setFormData({...formData, driver: e.target.value})}
                >
                  <option value="">Unassigned</option>
                  {drivers.map(driver => (
                    <option key={driver.id} value={driver.id}>{driver.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="select"
                  value={formData.status || 'active'}
                  onChange={(e) => setFormData({...formData, status: e.target.value as Vehicle['status']})}
                >
                  <option value="active">Active</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Fuel Level (%)</label>
                <input
                  type="number"
                  className="input"
                  min="0"
                  max="100"
                  value={formData.fuelLevel || 100}
                  onChange={(e) => setFormData({...formData, fuelLevel: parseInt(e.target.value) || 0})}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Location</label>
                <input
                  type="text"
                  className="input"
                  value={formData.location || ''}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mileage (km)</label>
                <input
                  type="number"
                  className="input"
                  value={formData.mileage || ''}
                  onChange={(e) => setFormData({...formData, mileage: parseInt(e.target.value) || 0})}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Registration Date</label>
                <input
                  type="date"
                  className="input"
                  value={formData.registrationDate || ''}
                  onChange={(e) => setFormData({...formData, registrationDate: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Last Maintenance</label>
                <input
                  type="date"
                  className="input"
                  value={formData.lastMaintenance || ''}
                  onChange={(e) => setFormData({...formData, lastMaintenance: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Next Maintenance</label>
                <input
                  type="date"
                  className="input"
                  value={formData.nextMaintenance || ''}
                  onChange={(e) => setFormData({...formData, nextMaintenance: e.target.value})}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                onClick={() => setShowVehicleModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {editingVehicle ? 'Update Vehicle' : 'Add Vehicle'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const DriverModal = () => {
    const [formData, setFormData] = useState<Partial<Driver>>(
      editingDriver || {
        name: '',
        phone: '',
        email: '',
        licenseNumber: '',
        licenseExpiry: '',
        experience: 0,
        rating: 5.0,
        status: 'available',
        currentVehicle: '',
        totalDeliveries: 0,
        joinDate: new Date().toISOString().split('T')[0]
      }
    );

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (editingDriver) {
        updateDriver(editingDriver.id, formData);
      } else {
        addDriver(formData as Omit<Driver, 'id'>);
      }
      setShowDriverModal(false);
      setEditingDriver(null);
    };

    return (
      <div className="modal-backdrop" onClick={() => setShowDriverModal(false)}>
        <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3 className="heading-4">{editingDriver ? 'Edit Driver' : 'Add New Driver'}</h3>
            <button
              onClick={() => setShowDriverModal(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="modal-body space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label form-label-required">Full Name</label>
                <input
                  type="text"
                  className="input"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label form-label-required">Phone</label>
                <input
                  type="tel"
                  className="input"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label form-label-required">Email</label>
                <input
                  type="email"
                  className="input"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label form-label-required">License Number</label>
                <input
                  type="text"
                  className="input"
                  value={formData.licenseNumber || ''}
                  onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label form-label-required">License Expiry</label>
                <input
                  type="date"
                  className="input"
                  value={formData.licenseExpiry || ''}
                  onChange={(e) => setFormData({...formData, licenseExpiry: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Experience (years)</label>
                <input
                  type="number"
                  className="input"
                  min="0"
                  value={formData.experience || ''}
                  onChange={(e) => setFormData({...formData, experience: parseInt(e.target.value) || 0})}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="select"
                  value={formData.status || 'available'}
                  onChange={(e) => setFormData({...formData, status: e.target.value as Driver['status']})}
                >
                  <option value="available">Available</option>
                  <option value="on-route">On Route</option>
                  <option value="off-duty">Off Duty</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Current Vehicle</label>
                <select
                  className="select"
                  value={formData.currentVehicle || ''}
                  onChange={(e) => setFormData({...formData, currentVehicle: e.target.value})}
                >
                  <option value="">None</option>
                  {vehicles.map(vehicle => (
                    <option key={vehicle.id} value={vehicle.id}>{vehicle.vehicleNumber}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Join Date</label>
                <input
                  type="date"
                  className="input"
                  value={formData.joinDate || ''}
                  onChange={(e) => setFormData({...formData, joinDate: e.target.value})}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                onClick={() => setShowDriverModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {editingDriver ? 'Update Driver' : 'Add Driver'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const ShipmentModal = () => {
    const [formData, setFormData] = useState<Partial<Shipment>>(
      editingShipment || {
        shipmentNumber: `SHP-${Date.now()}`,
        origin: '',
        destination: '',
        driverId: '',
        vehicleId: '',
        status: 'pending',
        priority: 'medium',
        weight: 0,
        volume: 0,
        pickupDate: new Date().toISOString().split('T')[0],
        deliveryDate: new Date().toISOString().split('T')[0],
        customer: '',
        customerPhone: '',
        cost: 0,
        distance: 0
      }
    );

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (editingShipment) {
        updateShipment(editingShipment.id, formData);
      } else {
        addShipment(formData as Omit<Shipment, 'id'>);
      }
      setShowShipmentModal(false);
      setEditingShipment(null);
    };

    return (
      <div className="modal-backdrop" onClick={() => setShowShipmentModal(false)}>
        <div className="modal-content max-w-3xl" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3 className="heading-4">{editingShipment ? 'Edit Shipment' : 'Add New Shipment'}</h3>
            <button
              onClick={() => setShowShipmentModal(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="modal-body space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label form-label-required">Shipment Number</label>
                <input
                  type="text"
                  className="input"
                  value={formData.shipmentNumber || ''}
                  onChange={(e) => setFormData({...formData, shipmentNumber: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Priority</label>
                <select
                  className="select"
                  value={formData.priority || 'medium'}
                  onChange={(e) => setFormData({...formData, priority: e.target.value as Shipment['priority']})}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label form-label-required">Origin</label>
                <input
                  type="text"
                  className="input"
                  value={formData.origin || ''}
                  onChange={(e) => setFormData({...formData, origin: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label form-label-required">Destination</label>
                <input
                  type="text"
                  className="input"
                  value={formData.destination || ''}
                  onChange={(e) => setFormData({...formData, destination: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label form-label-required">Customer</label>
                <input
                  type="text"
                  className="input"
                  value={formData.customer || ''}
                  onChange={(e) => setFormData({...formData, customer: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Customer Phone</label>
                <input
                  type="tel"
                  className="input"
                  value={formData.customerPhone || ''}
                  onChange={(e) => setFormData({...formData, customerPhone: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Driver</label>
                <select
                  className="select"
                  value={formData.driverId || ''}
                  onChange={(e) => setFormData({...formData, driverId: e.target.value})}
                >
                  <option value="">Unassigned</option>
                  {drivers.filter(d => d.status === 'available').map(driver => (
                    <option key={driver.id} value={driver.id}>{driver.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Vehicle</label>
                <select
                  className="select"
                  value={formData.vehicleId || ''}
                  onChange={(e) => setFormData({...formData, vehicleId: e.target.value})}
                >
                  <option value="">Unassigned</option>
                  {vehicles.filter(v => v.status === 'active').map(vehicle => (
                    <option key={vehicle.id} value={vehicle.id}>{vehicle.vehicleNumber}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Weight (kg)</label>
                <input
                  type="number"
                  className="input"
                  min="0"
                  value={formData.weight || ''}
                  onChange={(e) => setFormData({...formData, weight: parseFloat(e.target.value) || 0})}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Volume (m³)</label>
                <input
                  type="number"
                  className="input"
                  min="0"
                  step="0.1"
                  value={formData.volume || ''}
                  onChange={(e) => setFormData({...formData, volume: parseFloat(e.target.value) || 0})}
                />
              </div>

              <div className="form-group">
                <label className="form-label form-label-required">Pickup Date</label>
                <input
                  type="date"
                  className="input"
                  value={formData.pickupDate || ''}
                  onChange={(e) => setFormData({...formData, pickupDate: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label form-label-required">Delivery Date</label>
                <input
                  type="date"
                  className="input"
                  value={formData.deliveryDate || ''}
                  onChange={(e) => setFormData({...formData, deliveryDate: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Cost</label>
                <input
                  type="number"
                  className="input"
                  min="0"
                  step="0.01"
                  value={formData.cost || ''}
                  onChange={(e) => setFormData({...formData, cost: parseFloat(e.target.value) || 0})}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Distance (km)</label>
                <input
                  type="number"
                  className="input"
                  min="0"
                  value={formData.distance || ''}
                  onChange={(e) => setFormData({...formData, distance: parseFloat(e.target.value) || 0})}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="select"
                  value={formData.status || 'pending'}
                  onChange={(e) => setFormData({...formData, status: e.target.value as Shipment['status']})}
                >
                  <option value="pending">Pending</option>
                  <option value="in-transit">In Transit</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                onClick={() => setShowShipmentModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {editingShipment ? 'Update Shipment' : 'Add Shipment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const DeleteConfirmModal = () => (
    <div className="modal-backdrop" onClick={() => setShowDeleteConfirm(false)}>
      <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="heading-4">Confirm Delete</h3>
          <button
            onClick={() => setShowDeleteConfirm(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="modal-body">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-error-100 rounded-full">
              <AlertTriangle className="w-6 h-6 text-error-600" />
            </div>
            <div>
              <p className="font-medium">Are you sure you want to delete this {deleteItem?.type}?</p>
              <p className="text-sm text-gray-500 mt-1">This action cannot be undone.</p>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button
            onClick={() => setShowDeleteConfirm(false)}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={executeDelete}
            className="btn btn-error"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  const AiModal = () => (
    <div className="modal-backdrop" onClick={() => setShowAiModal(false)}>
      <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="heading-4">AI Assistant</h3>
          <button
            onClick={() => setShowAiModal(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="modal-body space-y-4">
          <div className="form-group">
            <label className="form-label">Ask AI Assistant</label>
            <textarea
              className="textarea"
              placeholder="Ask questions about your transport operations, get insights, or request analysis..."
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Upload Document (Optional)</label>
            <input
              type="file"
              className="input"
              accept=".jpg,.jpeg,.png,.pdf,.csv"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            />
            <p className="form-help">
              Upload invoices, receipts, driver documents, or vehicle papers for AI analysis
            </p>
          </div>

          {isAiLoading && (
            <div className="flex items-center gap-3 p-4 bg-primary-50 rounded-lg">
              <div className="animate-spin w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full"></div>
              <span className="text-primary-700">AI is analyzing...</span>
            </div>
          )}

          {aiError && (
            <div className="alert alert-error">
              <AlertTriangle className="w-5 h-5" />
              <span>Error: {aiError.message || 'Something went wrong'}</span>
            </div>
          )}

          {aiResult && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">AI Response:</h4>
              <div className="text-sm whitespace-pre-wrap">{aiResult}</div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button
            onClick={() => setShowAiModal(false)}
            className="btn btn-secondary"
          >
            Close
          </button>
          <button
            onClick={() => {
              if (promptText.trim() || selectedFile) {
                const fullPrompt = promptText || 'Analyze this document and provide insights for transport management.';
                aiLayerRef.current?.sendToAI(fullPrompt, selectedFile || undefined);
              }
            }}
            className="btn btn-primary"
            disabled={isAiLoading || (!promptText.trim() && !selectedFile)}
          >
            {isAiLoading ? 'Analyzing...' : 'Send to AI'}
          </button>
        </div>
      </div>
    </div>
  );

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-500 text-white rounded-lg">
                  <Truck className="w-6 h-6" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">TransportPro</h1>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>Welcome, {currentUser.first_name}</span>
              </div>
              <button
                onClick={logout}
                className="btn btn-secondary"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'fleet', label: 'Fleet', icon: Truck },
              { id: 'drivers', label: 'Drivers', icon: Users },
              { id: 'shipments', label: 'Shipments', icon: Package },
              { id: 'reports', label: 'Reports', icon: FileText },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  id={`${tab.id}-tab`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'fleet' && renderFleetManagement()}
          {activeTab === 'drivers' && renderDriverManagement()}
          {activeTab === 'shipments' && renderShipments()}
          {activeTab === 'reports' && renderReports()}
          {activeTab === 'settings' && renderSettings()}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            Copyright © 2025 Datavtar Private Limited. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Modals */}
      {showVehicleModal && <VehicleModal />}
      {showDriverModal && <DriverModal />}
      {showShipmentModal && <ShipmentModal />}
      {showDeleteConfirm && <DeleteConfirmModal />}
      {showAiModal && <AiModal />}

      {/* AI Layer */}
      <AILayer
        ref={aiLayerRef}
        prompt={promptText}
        attachment={selectedFile || undefined}
        onResult={handleAiResult}
        onError={(error) => setAiError(error)}
        onLoading={(loading) => setIsAiLoading(loading)}
      />
    </div>
  );
};

export default App;