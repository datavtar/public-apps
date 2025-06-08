import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from './contexts/authContext';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import {
  Truck, Users, MapPin, Package, Wrench, ChartBar, Settings, Plus, Edit, Trash2,
  Search, Filter, Download, Upload, Calendar, Clock, DollarSign, TrendingUp,
  Navigation, Fuel, User, FileText, AlertCircle, CheckCircle, XCircle,
  BarChart3, PieChart, Eye, Route, Car, Gauge, Target, Zap, Bell
} from 'lucide-react';
import styles from './styles/styles.module.css';

// Types and Interfaces
interface Vehicle {
  id: string;
  registrationNumber: string;
  type: 'truck' | 'van' | 'bus' | 'trailer';
  make: string;
  model: string;
  year: number;
  capacity: number;
  status: 'active' | 'maintenance' | 'inactive';
  lastMaintenance: string;
  nextMaintenance: string;
  fuelEfficiency: number;
  driver?: string;
  location: string;
  mileage: number;
}

interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
  licenseExpiry: string;
  experience: number;
  status: 'active' | 'on-leave' | 'suspended';
  rating: number;
  totalTrips: number;
  currentVehicle?: string;
  address: string;
}

interface Route {
  id: string;
  name: string;
  origin: string;
  destination: string;
  distance: number;
  estimatedTime: number;
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  driver: string;
  vehicle: string;
  cargo: string;
  startTime: string;
  endTime?: string;
  actualDistance?: number;
  fuelUsed?: number;
}

interface Shipment {
  id: string;
  trackingNumber: string;
  customerName: string;
  customerContact: string;
  origin: string;
  destination: string;
  weight: number;
  volume: number;
  value: number;
  status: 'pending' | 'in-transit' | 'delivered' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  scheduledPickup: string;
  scheduledDelivery: string;
  actualPickup?: string;
  actualDelivery?: string;
  assignedRoute?: string;
  specialInstructions?: string;
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
  notes?: string;
}

interface FuelRecord {
  id: string;
  vehicleId: string;
  date: string;
  quantity: number;
  cost: number;
  pricePerLiter: number;
  odometer: number;
  station: string;
  driver: string;
}

type TabType = 'dashboard' | 'fleet' | 'drivers' | 'routes' | 'shipments' | 'maintenance' | 'reports' | 'settings';

const App: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const aiLayerRef = useRef<AILayerHandle>(null);

  // Main state
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [fuelRecords, setFuelRecords] = useState<FuelRecord[]>([]);

  // AI and form states
  const [aiPrompt, setAiPrompt] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<any | null>(null);

  // Modal and form states
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'vehicle' | 'driver' | 'route' | 'shipment' | 'maintenance' | 'fuel' | ''>('');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Form data states
  const [vehicleForm, setVehicleForm] = useState({
    registrationNumber: '',
    type: 'truck' as Vehicle['type'],
    make: '',
    model: '',
    year: new Date().getFullYear(),
    capacity: 0,
    status: 'active' as Vehicle['status'],
    lastMaintenance: '',
    nextMaintenance: '',
    fuelEfficiency: 0,
    location: '',
    mileage: 0
  });

  const [driverForm, setDriverForm] = useState({
    name: '',
    email: '',
    phone: '',
    licenseNumber: '',
    licenseExpiry: '',
    experience: 0,
    status: 'active' as Driver['status'],
    rating: 5,
    totalTrips: 0,
    address: ''
  });

  const [routeForm, setRouteForm] = useState({
    name: '',
    origin: '',
    destination: '',
    distance: 0,
    estimatedTime: 0,
    status: 'planned' as Route['status'],
    driver: '',
    vehicle: '',
    cargo: '',
    startTime: ''
  });

  const [shipmentForm, setShipmentForm] = useState({
    trackingNumber: '',
    customerName: '',
    customerContact: '',
    origin: '',
    destination: '',
    weight: 0,
    volume: 0,
    value: 0,
    status: 'pending' as Shipment['status'],
    priority: 'medium' as Shipment['priority'],
    scheduledPickup: '',
    scheduledDelivery: '',
    specialInstructions: ''
  });

  const [maintenanceForm, setMaintenanceForm] = useState({
    vehicleId: '',
    type: 'routine' as MaintenanceRecord['type'],
    description: '',
    cost: 0,
    date: '',
    nextDue: '',
    mechanic: '',
    status: 'scheduled' as MaintenanceRecord['status'],
    parts: [] as string[],
    notes: ''
  });

  // Load data from localStorage on component mount
  useEffect(() => {
    const loadData = () => {
      try {
        const savedVehicles = localStorage.getItem('transport_vehicles');
        const savedDrivers = localStorage.getItem('transport_drivers');
        const savedRoutes = localStorage.getItem('transport_routes');
        const savedShipments = localStorage.getItem('transport_shipments');
        const savedMaintenance = localStorage.getItem('transport_maintenance');
        const savedFuel = localStorage.getItem('transport_fuel');

        if (savedVehicles) setVehicles(JSON.parse(savedVehicles));
        if (savedDrivers) setDrivers(JSON.parse(savedDrivers));
        if (savedRoutes) setRoutes(JSON.parse(savedRoutes));
        if (savedShipments) setShipments(JSON.parse(savedShipments));
        if (savedMaintenance) setMaintenanceRecords(JSON.parse(savedMaintenance));
        if (savedFuel) setFuelRecords(JSON.parse(savedFuel));

        // Initialize with sample data if empty
        if (!savedVehicles) initializeSampleData();
      } catch (error) {
        console.error('Error loading data:', error);
        initializeSampleData();
      }
    };

    loadData();
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem('transport_vehicles', JSON.stringify(vehicles));
    } catch (error) {
      console.error('Error saving vehicles:', error);
    }
  }, [vehicles]);

  useEffect(() => {
    try {
      localStorage.setItem('transport_drivers', JSON.stringify(drivers));
    } catch (error) {
      console.error('Error saving drivers:', error);
    }
  }, [drivers]);

  useEffect(() => {
    try {
      localStorage.setItem('transport_routes', JSON.stringify(routes));
    } catch (error) {
      console.error('Error saving routes:', error);
    }
  }, [routes]);

  useEffect(() => {
    try {
      localStorage.setItem('transport_shipments', JSON.stringify(shipments));
    } catch (error) {
      console.error('Error saving shipments:', error);
    }
  }, [shipments]);

  useEffect(() => {
    try {
      localStorage.setItem('transport_maintenance', JSON.stringify(maintenanceRecords));
    } catch (error) {
      console.error('Error saving maintenance:', error);
    }
  }, [maintenanceRecords]);

  useEffect(() => {
    try {
      localStorage.setItem('transport_fuel', JSON.stringify(fuelRecords));
    } catch (error) {
      console.error('Error saving fuel records:', error);
    }
  }, [fuelRecords]);

  const initializeSampleData = () => {
    const sampleVehicles: Vehicle[] = [
      {
        id: '1',
        registrationNumber: 'TN-01-AB-1234',
        type: 'truck',
        make: 'Tata',
        model: 'Prima',
        year: 2022,
        capacity: 25000,
        status: 'active',
        lastMaintenance: '2025-05-15',
        nextMaintenance: '2025-08-15',
        fuelEfficiency: 8.5,
        driver: '1',
        location: 'Chennai',
        mileage: 45000
      },
      {
        id: '2',
        registrationNumber: 'KA-03-CD-5678',
        type: 'van',
        make: 'Mahindra',
        model: 'Bolero Pickup',
        year: 2023,
        capacity: 1500,
        status: 'active',
        lastMaintenance: '2025-05-20',
        nextMaintenance: '2025-08-20',
        fuelEfficiency: 12.5,
        driver: '2',
        location: 'Bangalore',
        mileage: 25000
      }
    ];

    const sampleDrivers: Driver[] = [
      {
        id: '1',
        name: 'Rajesh Kumar',
        email: 'rajesh@example.com',
        phone: '+91-9876543210',
        licenseNumber: 'DL-123456789',
        licenseExpiry: '2026-12-31',
        experience: 8,
        status: 'active',
        rating: 4.8,
        totalTrips: 145,
        currentVehicle: '1',
        address: 'Chennai, Tamil Nadu'
      },
      {
        id: '2',
        name: 'Suresh Reddy',
        email: 'suresh@example.com',
        phone: '+91-9876543211',
        licenseNumber: 'DL-987654321',
        licenseExpiry: '2027-06-30',
        experience: 5,
        status: 'active',
        rating: 4.6,
        totalTrips: 89,
        currentVehicle: '2',
        address: 'Bangalore, Karnataka'
      }
    ];

    const sampleShipments: Shipment[] = [
      {
        id: '1',
        trackingNumber: 'TMS2025001',
        customerName: 'ABC Electronics',
        customerContact: '+91-9876543212',
        origin: 'Chennai',
        destination: 'Bangalore',
        weight: 1500,
        volume: 25,
        value: 50000,
        status: 'in-transit',
        priority: 'high',
        scheduledPickup: '2025-06-08T09:00',
        scheduledDelivery: '2025-06-09T15:00',
        specialInstructions: 'Handle with care - electronic items'
      }
    ];

    setVehicles(sampleVehicles);
    setDrivers(sampleDrivers);
    setShipments(sampleShipments);
  };

  // AI Processing Functions
  const handleAISubmit = async () => {
    if (!aiPrompt?.trim() && !selectedFile) {
      setAiError("Please provide a prompt or select a file to process.");
      return;
    }

    try {
      setAiResult(null);
      setAiError(null);

      let prompt = aiPrompt;
      if (selectedFile && !aiPrompt?.trim()) {
        // Auto-generate prompt based on file type and current context
        const fileType = selectedFile.type;
        if (fileType.includes('image')) {
          prompt = `Analyze this transport/vehicle related image and extract relevant information. Return JSON with keys: "vehicle_registration", "driver_name", "fuel_quantity", "cost", "maintenance_type", "description", "date", "location", "notes"`;
        } else {
          prompt = `Process this transport management document and extract relevant data. Return JSON with keys: "vehicle_registration", "driver_name", "fuel_quantity", "cost", "maintenance_type", "description", "date", "location", "customer_name", "weight", "destination", "notes"`;
        }
      } else if (selectedFile && aiPrompt?.trim()) {
        // Combine user prompt with extraction context
        prompt = `${aiPrompt}. Also extract relevant transport data and return JSON with keys: "vehicle_registration", "driver_name", "fuel_quantity", "cost", "maintenance_type", "description", "date", "location", "customer_name", "weight", "destination", "notes"`;
      }

      aiLayerRef.current?.sendToAI(prompt, selectedFile || undefined);
    } catch (error) {
      setAiError("Failed to process AI request");
    }
  };

  const processAIResult = (result: string) => {
    try {
      // Try to parse as JSON first
      const jsonData = JSON.parse(result);
      
      // Auto-populate forms based on extracted data
      if (jsonData.vehicle_registration) {
        if (jsonData.fuel_quantity && jsonData.cost) {
          // Fuel record data
          const newFuelRecord: FuelRecord = {
            id: Date.now().toString(),
            vehicleId: jsonData.vehicle_registration,
            date: jsonData.date || new Date().toISOString().split('T')[0],
            quantity: parseFloat(jsonData.fuel_quantity) || 0,
            cost: parseFloat(jsonData.cost) || 0,
            pricePerLiter: jsonData.cost && jsonData.fuel_quantity ? 
              (parseFloat(jsonData.cost) / parseFloat(jsonData.fuel_quantity)) : 0,
            odometer: 0,
            station: jsonData.location || 'Unknown',
            driver: jsonData.driver_name || 'Unknown'
          };
          setFuelRecords(prev => [...prev, newFuelRecord]);
        } else if (jsonData.maintenance_type || jsonData.description) {
          // Maintenance record data
          const newMaintenance: MaintenanceRecord = {
            id: Date.now().toString(),
            vehicleId: jsonData.vehicle_registration,
            type: jsonData.maintenance_type?.toLowerCase() || 'routine',
            description: jsonData.description || 'AI extracted maintenance',
            cost: parseFloat(jsonData.cost) || 0,
            date: jsonData.date || new Date().toISOString().split('T')[0],
            nextDue: '',
            mechanic: jsonData.mechanic || 'Unknown',
            status: 'completed',
            parts: [],
            notes: jsonData.notes || 'Auto-populated from AI analysis'
          };
          setMaintenanceRecords(prev => [...prev, newMaintenance]);
        }
      }

      if (jsonData.customer_name && jsonData.destination) {
        // Shipment data
        const newShipment: Shipment = {
          id: Date.now().toString(),
          trackingNumber: `AI${Date.now()}`,
          customerName: jsonData.customer_name,
          customerContact: jsonData.customer_contact || '',
          origin: jsonData.location || 'Unknown',
          destination: jsonData.destination,
          weight: parseFloat(jsonData.weight) || 0,
          volume: parseFloat(jsonData.volume) || 0,
          value: parseFloat(jsonData.value) || 0,
          status: 'pending',
          priority: 'medium',
          scheduledPickup: jsonData.pickup_date || '',
          scheduledDelivery: jsonData.delivery_date || '',
          specialInstructions: jsonData.notes || 'Auto-created from AI analysis'
        };
        setShipments(prev => [...prev, newShipment]);
      }

      return `✅ Data successfully extracted and populated:\n${JSON.stringify(jsonData, null, 2)}`;
    } catch (error) {
      // Return as markdown if not JSON
      return result;
    }
  };

  // CRUD Operations
  const saveVehicle = () => {
    try {
      if (editingItem) {
        setVehicles(prev => prev.map(v => v.id === editingItem.id ? 
          { ...vehicleForm, id: editingItem.id } : v));
      } else {
        const newVehicle: Vehicle = {
          ...vehicleForm,
          id: Date.now().toString()
        };
        setVehicles(prev => [...prev, newVehicle]);
      }
      closeModal();
    } catch (error) {
      console.error('Error saving vehicle:', error);
    }
  };

  const saveDriver = () => {
    try {
      if (editingItem) {
        setDrivers(prev => prev.map(d => d.id === editingItem.id ? 
          { ...driverForm, id: editingItem.id } : d));
      } else {
        const newDriver: Driver = {
          ...driverForm,
          id: Date.now().toString()
        };
        setDrivers(prev => [...prev, newDriver]);
      }
      closeModal();
    } catch (error) {
      console.error('Error saving driver:', error);
    }
  };

  const saveRoute = () => {
    try {
      if (editingItem) {
        setRoutes(prev => prev.map(r => r.id === editingItem.id ? 
          { ...routeForm, id: editingItem.id } : r));
      } else {
        const newRoute: Route = {
          ...routeForm,
          id: Date.now().toString()
        };
        setRoutes(prev => [...prev, newRoute]);
      }
      closeModal();
    } catch (error) {
      console.error('Error saving route:', error);
    }
  };

  const saveShipment = () => {
    try {
      if (editingItem) {
        setShipments(prev => prev.map(s => s.id === editingItem.id ? 
          { ...shipmentForm, id: editingItem.id } : s));
      } else {
        const newShipment: Shipment = {
          ...shipmentForm,
          id: Date.now().toString()
        };
        setShipments(prev => [...prev, newShipment]);
      }
      closeModal();
    } catch (error) {
      console.error('Error saving shipment:', error);
    }
  };

  const saveMaintenance = () => {
    try {
      if (editingItem) {
        setMaintenanceRecords(prev => prev.map(m => m.id === editingItem.id ? 
          { ...maintenanceForm, id: editingItem.id } : m));
      } else {
        const newMaintenance: MaintenanceRecord = {
          ...maintenanceForm,
          id: Date.now().toString()
        };
        setMaintenanceRecords(prev => [...prev, newMaintenance]);
      }
      closeModal();
    } catch (error) {
      console.error('Error saving maintenance:', error);
    }
  };

  const deleteItem = (type: string, id: string) => {
    try {
      switch (type) {
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
        case 'maintenance':
          setMaintenanceRecords(prev => prev.filter(m => m.id !== id));
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const openModal = (type: 'vehicle' | 'driver' | 'route' | 'shipment' | 'maintenance' | 'fuel', item?: any) => {
    setModalType(type);
    setEditingItem(item || null);
    
    if (item) {
      switch (type) {
        case 'vehicle':
          setVehicleForm({ ...item });
          break;
        case 'driver':
          setDriverForm({ ...item });
          break;
        case 'route':
          setRouteForm({ ...item });
          break;
        case 'shipment':
          setShipmentForm({ ...item });
          break;
        case 'maintenance':
          setMaintenanceForm({ ...item });
          break;
        default:
          break;
      }
    } else {
      // Reset forms for new items
      switch (type) {
        case 'vehicle':
          setVehicleForm({
            registrationNumber: '',
            type: 'truck',
            make: '',
            model: '',
            year: new Date().getFullYear(),
            capacity: 0,
            status: 'active',
            lastMaintenance: '',
            nextMaintenance: '',
            fuelEfficiency: 0,
            location: '',
            mileage: 0
          });
          break;
        case 'driver':
          setDriverForm({
            name: '',
            email: '',
            phone: '',
            licenseNumber: '',
            licenseExpiry: '',
            experience: 0,
            status: 'active',
            rating: 5,
            totalTrips: 0,
            address: ''
          });
          break;
        case 'route':
          setRouteForm({
            name: '',
            origin: '',
            destination: '',
            distance: 0,
            estimatedTime: 0,
            status: 'planned',
            driver: '',
            vehicle: '',
            cargo: '',
            startTime: ''
          });
          break;
        case 'shipment':
          setShipmentForm({
            trackingNumber: `TMS${Date.now()}`,
            customerName: '',
            customerContact: '',
            origin: '',
            destination: '',
            weight: 0,
            volume: 0,
            value: 0,
            status: 'pending',
            priority: 'medium',
            scheduledPickup: '',
            scheduledDelivery: '',
            specialInstructions: ''
          });
          break;
        case 'maintenance':
          setMaintenanceForm({
            vehicleId: '',
            type: 'routine',
            description: '',
            cost: 0,
            date: new Date().toISOString().split('T')[0],
            nextDue: '',
            mechanic: '',
            status: 'scheduled',
            parts: [],
            notes: ''
          });
          break;
        default:
          break;
      }
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType('');
    setEditingItem(null);
  };

  // Export data as CSV
  const exportData = (type: string) => {
    try {
      let data: any[] = [];
      let filename = '';

      switch (type) {
        case 'vehicles':
          data = vehicles;
          filename = 'vehicles.csv';
          break;
        case 'drivers':
          data = drivers;
          filename = 'drivers.csv';
          break;
        case 'routes':
          data = routes;
          filename = 'routes.csv';
          break;
        case 'shipments':
          data = shipments;
          filename = 'shipments.csv';
          break;
        case 'maintenance':
          data = maintenanceRecords;
          filename = 'maintenance.csv';
          break;
        case 'fuel':
          data = fuelRecords;
          filename = 'fuel_records.csv';
          break;
        default:
          return;
      }

      if (data.length === 0) return;

      const headers = Object.keys(data[0]);
      const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => 
          typeof row[header] === 'string' ? `"${row[header]}"` : row[header]
        ).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  // Import data from CSV
  const importData = (type: string, file: File) => {
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const csv = e.target?.result as string;
          const lines = csv.split('\n');
          const headers = lines[0].split(',');
          const data = lines.slice(1).map(line => {
            const values = line.split(',');
            const obj: any = {};
            headers.forEach((header, index) => {
              obj[header.trim()] = values[index]?.replace(/"/g, '').trim();
            });
            return obj;
          }).filter(obj => Object.keys(obj).length > 1);

          switch (type) {
            case 'vehicles':
              setVehicles(data);
              break;
            case 'drivers':
              setDrivers(data);
              break;
            case 'routes':
              setRoutes(data);
              break;
            case 'shipments':
              setShipments(data);
              break;
            case 'maintenance':
              setMaintenanceRecords(data);
              break;
            case 'fuel':
              setFuelRecords(data);
              break;
            default:
              break;
          }
        } catch (error) {
          console.error('Error parsing CSV:', error);
        }
      };
      reader.readAsText(file);
    } catch (error) {
      console.error('Error importing data:', error);
    }
  };

  // Clear all data
  const clearAllData = () => {
    try {
      setVehicles([]);
      setDrivers([]);
      setRoutes([]);
      setShipments([]);
      setMaintenanceRecords([]);
      setFuelRecords([]);
      localStorage.removeItem('transport_vehicles');
      localStorage.removeItem('transport_drivers');
      localStorage.removeItem('transport_routes');
      localStorage.removeItem('transport_shipments');
      localStorage.removeItem('transport_maintenance');
      localStorage.removeItem('transport_fuel');
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  };

  // Filter and search functions
  const getFilteredItems = (items: any[], type: string) => {
    try {
      return items.filter(item => {
        const matchesSearch = searchTerm === '' || 
          Object.values(item).some(value => 
            value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
          );
        
        const matchesFilter = filterStatus === 'all' || 
          item.status?.toLowerCase() === filterStatus.toLowerCase();
        
        return matchesSearch && matchesFilter;
      });
    } catch (error) {
      console.error('Error filtering items:', error);
      return items;
    }
  };

  // Dashboard calculations
  const getDashboardStats = () => {
    try {
      const activeVehicles = vehicles.filter(v => v.status === 'active').length;
      const activeDrivers = drivers.filter(d => d.status === 'active').length;
      const activeRoutes = routes.filter(r => r.status === 'active').length;
      const pendingShipments = shipments.filter(s => s.status === 'pending').length;
      const inTransitShipments = shipments.filter(s => s.status === 'in-transit').length;
      const deliveredShipments = shipments.filter(s => s.status === 'delivered').length;
      
      const totalRevenue = shipments
        .filter(s => s.status === 'delivered')
        .reduce((sum, s) => sum + (s.value || 0), 0);
      
      const totalFuelCost = fuelRecords.reduce((sum, f) => sum + (f.cost || 0), 0);
      const totalMaintenanceCost = maintenanceRecords.reduce((sum, m) => sum + (m.cost || 0), 0);
      
      return {
        activeVehicles,
        activeDrivers,
        activeRoutes,
        pendingShipments,
        inTransitShipments,
        deliveredShipments,
        totalRevenue,
        totalFuelCost,
        totalMaintenanceCost
      };
    } catch (error) {
      console.error('Error calculating dashboard stats:', error);
      return {
        activeVehicles: 0,
        activeDrivers: 0,
        activeRoutes: 0,
        pendingShipments: 0,
        inTransitShipments: 0,
        deliveredShipments: 0,
        totalRevenue: 0,
        totalFuelCost: 0,
        totalMaintenanceCost: 0
      };
    }
  };

  const stats = getDashboardStats();

  // Status badge component
  const StatusBadge: React.FC<{ status: string; type?: string }> = ({ status, type = 'default' }) => {
    const getStatusColor = (status: string) => {
      switch (status.toLowerCase()) {
        case 'active':
        case 'delivered':
        case 'completed':
          return 'badge-success';
        case 'pending':
        case 'scheduled':
          return 'badge-warning';
        case 'in-transit':
        case 'in-progress':
          return 'badge-info';
        case 'cancelled':
        case 'suspended':
        case 'inactive':
          return 'badge-error';
        default:
          return 'badge-info';
      }
    };

    return (
      <span className={`badge ${getStatusColor(status)}`}>
        {status}
      </span>
    );
  };

  // Priority badge component
  const PriorityBadge: React.FC<{ priority: string }> = ({ priority }) => {
    const getPriorityColor = (priority: string) => {
      switch (priority.toLowerCase()) {
        case 'urgent':
          return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
        case 'high':
          return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
        case 'medium':
          return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
        case 'low':
          return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
        default:
          return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      }
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(priority)}`}>
        {priority}
      </span>
    );
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="text-center">
          <Truck className="mx-auto h-12 w-12 text-primary-600 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Transport Management System
          </h2>
          <p className="text-gray-600 dark:text-slate-400">Please log in to access the system</p>
        </div>
      </div>
    );
  }

  return (
    <div id="welcome_fallback" className="min-h-screen bg-gray-50 dark:bg-slate-900 theme-transition">
      {/* AI Layer Component */}
      <AILayer
        ref={aiLayerRef}
        prompt={aiPrompt}
        attachment={selectedFile || undefined}
        onResult={(result) => {
          const processedResult = processAIResult(result);
          setAiResult(processedResult);
        }}
        onError={(error) => setAiError(error)}
        onLoading={(loading) => setIsAiLoading(loading)}
      />

      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-slate-700 theme-transition">
        <div className="container-fluid">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Truck className="h-8 w-8 text-primary-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Transport Management</h1>
                <p className="text-sm text-gray-500 dark:text-slate-400">
                  Welcome, {currentUser?.first_name} {currentUser?.last_name}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Bell className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-pointer" />
              <button
                onClick={logout}
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
              >
                <User className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 theme-transition">
        <div className="container-fluid">
          <div className="flex space-x-8 overflow-x-auto">
            {[
              { key: 'dashboard', label: 'Dashboard', icon: ChartBar },
              { key: 'fleet', label: 'Fleet', icon: Truck },
              { key: 'drivers', label: 'Drivers', icon: Users },
              { key: 'routes', label: 'Routes', icon: Navigation },
              { key: 'shipments', label: 'Shipments', icon: Package },
              { key: 'maintenance', label: 'Maintenance', icon: Wrench },
              { key: 'reports', label: 'Reports', icon: BarChart3 },
              { key: 'settings', label: 'Settings', icon: Settings }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                id={`${key}-tab`}
                onClick={() => setActiveTab(key as TabType)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === key
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-slate-400 dark:hover:text-slate-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="whitespace-nowrap">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container-fluid py-6">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div id="generation_issue_fallback" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
              <div className="text-sm text-gray-500 dark:text-slate-400">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="stat-card">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Truck className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <div className="stat-title">Active Vehicles</div>
                    <div className="stat-value">{stats.activeVehicles}</div>
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <div className="stat-title">Active Drivers</div>
                    <div className="stat-value">{stats.activeDrivers}</div>
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Package className="h-8 w-8 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <div className="stat-title">In Transit</div>
                    <div className="stat-value">{stats.inTransitShipments}</div>
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <DollarSign className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <div className="stat-title">Total Revenue</div>
                    <div className="stat-value">₹{stats.totalRevenue.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button
                  onClick={() => openModal('shipment')}
                  className="btn btn-primary flex items-center justify-center space-x-2 p-4 h-auto"
                >
                  <Plus className="h-5 w-5" />
                  <span>New Shipment</span>
                </button>
                <button
                  onClick={() => openModal('route')}
                  className="btn bg-green-600 text-white hover:bg-green-700 flex items-center justify-center space-x-2 p-4 h-auto"
                >
                  <Route className="h-5 w-5" />
                  <span>Plan Route</span>
                </button>
                <button
                  onClick={() => openModal('maintenance')}
                  className="btn bg-orange-600 text-white hover:bg-orange-700 flex items-center justify-center space-x-2 p-4 h-auto"
                >
                  <Wrench className="h-5 w-5" />
                  <span>Schedule Maintenance</span>
                </button>
                <button
                  onClick={() => openModal('vehicle')}
                  className="btn bg-purple-600 text-white hover:bg-purple-700 flex items-center justify-center space-x-2 p-4 h-auto"
                >
                  <Car className="h-5 w-5" />
                  <span>Add Vehicle</span>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Shipments</h3>
                <div className="space-y-3">
                  {shipments.slice(0, 5).map(shipment => (
                    <div key={shipment.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{shipment.trackingNumber}</div>
                        <div className="text-sm text-gray-500 dark:text-slate-400">{shipment.customerName}</div>
                      </div>
                      <StatusBadge status={shipment.status} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">AI Document Processor</h3>
                <div className="space-y-4">
                  <div>
                    <label className="form-label">Upload Document or Enter Instructions</label>
                    <textarea
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="e.g., Extract vehicle details from this maintenance receipt..."
                      className="input"
                      rows={3}
                    />
                  </div>
                  <div>
                    <input
                      type="file"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      className="input"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    />
                  </div>
                  <button
                    onClick={handleAISubmit}
                    disabled={isAiLoading}
                    className="btn btn-primary w-full"
                  >
                    {isAiLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        Process Document
                      </>
                    )}
                  </button>
                  {aiResult && (
                    <div className="mt-4 p-3 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg">
                      <div className="text-sm text-green-800 dark:text-green-200 whitespace-pre-wrap">{aiResult}</div>
                    </div>
                  )}
                  {aiError && (
                    <div className="mt-4 p-3 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg">
                      <div className="text-sm text-red-800 dark:text-red-200">{aiError.toString()}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fleet Tab */}
        {activeTab === 'fleet' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Fleet Management</h2>
              <button
                onClick={() => openModal('vehicle')}
                className="btn btn-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Vehicle
              </button>
            </div>

            {/* Search and Filter */}
            <div className="card">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search vehicles..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="input pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="input"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <button
                    onClick={() => exportData('vehicles')}
                    className="btn bg-green-600 text-white hover:bg-green-700"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </button>
                </div>
              </div>
            </div>

            {/* Vehicles Table */}
            <div className="card">
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th className="table-header">Registration</th>
                      <th className="table-header">Type</th>
                      <th className="table-header">Make/Model</th>
                      <th className="table-header">Capacity</th>
                      <th className="table-header">Driver</th>
                      <th className="table-header">Status</th>
                      <th className="table-header">Location</th>
                      <th className="table-header">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                    {getFilteredItems(vehicles, 'vehicle').map(vehicle => {
                      const assignedDriver = drivers.find(d => d.id === vehicle.driver);
                      return (
                        <tr key={vehicle.id}>
                          <td className="table-cell font-medium">{vehicle.registrationNumber}</td>
                          <td className="table-cell capitalize">{vehicle.type}</td>
                          <td className="table-cell">{vehicle.make} {vehicle.model}</td>
                          <td className="table-cell">{vehicle.capacity.toLocaleString()} kg</td>
                          <td className="table-cell">{assignedDriver?.name || 'Unassigned'}</td>
                          <td className="table-cell">
                            <StatusBadge status={vehicle.status} />
                          </td>
                          <td className="table-cell">{vehicle.location}</td>
                          <td className="table-cell">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => openModal('vehicle', vehicle)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => deleteItem('vehicle', vehicle.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="h-4 w-4" />
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
          </div>
        )}

        {/* Drivers Tab */}
        {activeTab === 'drivers' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Driver Management</h2>
              <button
                onClick={() => openModal('driver')}
                className="btn btn-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Driver
              </button>
            </div>

            {/* Search and Filter */}
            <div className="card">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search drivers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="input pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="input"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="on-leave">On Leave</option>
                    <option value="suspended">Suspended</option>
                  </select>
                  <button
                    onClick={() => exportData('drivers')}
                    className="btn bg-green-600 text-white hover:bg-green-700"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </button>
                </div>
              </div>
            </div>

            {/* Drivers Table */}
            <div className="card">
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th className="table-header">Name</th>
                      <th className="table-header">License No.</th>
                      <th className="table-header">Experience</th>
                      <th className="table-header">Rating</th>
                      <th className="table-header">Total Trips</th>
                      <th className="table-header">Status</th>
                      <th className="table-header">Vehicle</th>
                      <th className="table-header">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                    {getFilteredItems(drivers, 'driver').map(driver => {
                      const assignedVehicle = vehicles.find(v => v.driver === driver.id);
                      return (
                        <tr key={driver.id}>
                          <td className="table-cell">
                            <div>
                              <div className="font-medium">{driver.name}</div>
                              <div className="text-sm text-gray-500">{driver.email}</div>
                            </div>
                          </td>
                          <td className="table-cell">{driver.licenseNumber}</td>
                          <td className="table-cell">{driver.experience} years</td>
                          <td className="table-cell">
                            <div className="flex items-center">
                              <span className="text-yellow-400 mr-1">★</span>
                              {driver.rating}
                            </div>
                          </td>
                          <td className="table-cell">{driver.totalTrips}</td>
                          <td className="table-cell">
                            <StatusBadge status={driver.status} />
                          </td>
                          <td className="table-cell">
                            {assignedVehicle?.registrationNumber || 'Unassigned'}
                          </td>
                          <td className="table-cell">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => openModal('driver', driver)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => deleteItem('driver', driver.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="h-4 w-4" />
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
          </div>
        )}

        {/* Routes Tab */}
        {activeTab === 'routes' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Route Management</h2>
              <button
                onClick={() => openModal('route')}
                className="btn btn-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Plan Route
              </button>
            </div>

            {/* Search and Filter */}
            <div className="card">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search routes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="input pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="input"
                  >
                    <option value="all">All Status</option>
                    <option value="planned">Planned</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <button
                    onClick={() => exportData('routes')}
                    className="btn bg-green-600 text-white hover:bg-green-700"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </button>
                </div>
              </div>
            </div>

            {/* Routes Table */}
            <div className="card">
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th className="table-header">Route Name</th>
                      <th className="table-header">Origin → Destination</th>
                      <th className="table-header">Distance</th>
                      <th className="table-header">Driver</th>
                      <th className="table-header">Vehicle</th>
                      <th className="table-header">Status</th>
                      <th className="table-header">Start Time</th>
                      <th className="table-header">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                    {getFilteredItems(routes, 'route').map(route => {
                      const routeDriver = drivers.find(d => d.id === route.driver);
                      const routeVehicle = vehicles.find(v => v.id === route.vehicle);
                      return (
                        <tr key={route.id}>
                          <td className="table-cell font-medium">{route.name}</td>
                          <td className="table-cell">
                            <div className="flex items-center">
                              <span>{route.origin}</span>
                              <Navigation className="h-4 w-4 mx-2 text-gray-400" />
                              <span>{route.destination}</span>
                            </div>
                          </td>
                          <td className="table-cell">{route.distance} km</td>
                          <td className="table-cell">{routeDriver?.name || 'Unassigned'}</td>
                          <td className="table-cell">{routeVehicle?.registrationNumber || 'Unassigned'}</td>
                          <td className="table-cell">
                            <StatusBadge status={route.status} />
                          </td>
                          <td className="table-cell">
                            {route.startTime ? new Date(route.startTime).toLocaleString() : 'Not scheduled'}
                          </td>
                          <td className="table-cell">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => openModal('route', route)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => deleteItem('route', route.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="h-4 w-4" />
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
          </div>
        )}

        {/* Shipments Tab */}
        {activeTab === 'shipments' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Shipment Management</h2>
              <button
                onClick={() => openModal('shipment')}
                className="btn btn-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Shipment
              </button>
            </div>

            {/* Search and Filter */}
            <div className="card">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search shipments..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="input pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="input"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="in-transit">In Transit</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <button
                    onClick={() => exportData('shipments')}
                    className="btn bg-green-600 text-white hover:bg-green-700"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </button>
                </div>
              </div>
            </div>

            {/* Shipments Table */}
            <div className="card">
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th className="table-header">Tracking No.</th>
                      <th className="table-header">Customer</th>
                      <th className="table-header">Origin → Destination</th>
                      <th className="table-header">Weight</th>
                      <th className="table-header">Value</th>
                      <th className="table-header">Priority</th>
                      <th className="table-header">Status</th>
                      <th className="table-header">Delivery Date</th>
                      <th className="table-header">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                    {getFilteredItems(shipments, 'shipment').map(shipment => (
                      <tr key={shipment.id}>
                        <td className="table-cell font-medium">{shipment.trackingNumber}</td>
                        <td className="table-cell">
                          <div>
                            <div className="font-medium">{shipment.customerName}</div>
                            <div className="text-sm text-gray-500">{shipment.customerContact}</div>
                          </div>
                        </td>
                        <td className="table-cell">
                          <div className="flex items-center">
                            <span>{shipment.origin}</span>
                            <Navigation className="h-4 w-4 mx-2 text-gray-400" />
                            <span>{shipment.destination}</span>
                          </div>
                        </td>
                        <td className="table-cell">{shipment.weight} kg</td>
                        <td className="table-cell">₹{shipment.value.toLocaleString()}</td>
                        <td className="table-cell">
                          <PriorityBadge priority={shipment.priority} />
                        </td>
                        <td className="table-cell">
                          <StatusBadge status={shipment.status} />
                        </td>
                        <td className="table-cell">
                          {shipment.scheduledDelivery ? 
                            new Date(shipment.scheduledDelivery).toLocaleDateString() : 
                            'Not scheduled'
                          }
                        </td>
                        <td className="table-cell">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openModal('shipment', shipment)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => deleteItem('shipment', shipment.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
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

        {/* Maintenance Tab */}
        {activeTab === 'maintenance' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Maintenance Management</h2>
              <button
                onClick={() => openModal('maintenance')}
                className="btn btn-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Schedule Maintenance
              </button>
            </div>

            {/* Search and Filter */}
            <div className="card">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search maintenance records..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="input pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="input"
                  >
                    <option value="all">All Status</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                  <button
                    onClick={() => exportData('maintenance')}
                    className="btn bg-green-600 text-white hover:bg-green-700"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </button>
                </div>
              </div>
            </div>

            {/* Maintenance Table */}
            <div className="card">
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th className="table-header">Vehicle</th>
                      <th className="table-header">Type</th>
                      <th className="table-header">Description</th>
                      <th className="table-header">Date</th>
                      <th className="table-header">Cost</th>
                      <th className="table-header">Mechanic</th>
                      <th className="table-header">Status</th>
                      <th className="table-header">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                    {getFilteredItems(maintenanceRecords, 'maintenance').map(maintenance => {
                      const vehicle = vehicles.find(v => v.id === maintenance.vehicleId);
                      return (
                        <tr key={maintenance.id}>
                          <td className="table-cell">{vehicle?.registrationNumber || 'Unknown'}</td>
                          <td className="table-cell capitalize">{maintenance.type}</td>
                          <td className="table-cell">{maintenance.description}</td>
                          <td className="table-cell">
                            {new Date(maintenance.date).toLocaleDateString()}
                          </td>
                          <td className="table-cell">₹{maintenance.cost.toLocaleString()}</td>
                          <td className="table-cell">{maintenance.mechanic}</td>
                          <td className="table-cell">
                            <StatusBadge status={maintenance.status} />
                          </td>
                          <td className="table-cell">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => openModal('maintenance', maintenance)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => deleteItem('maintenance', maintenance.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="h-4 w-4" />
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
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h2>
              <button
                onClick={() => exportData('all')}
                className="btn bg-green-600 text-white hover:bg-green-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Export All Data
              </button>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="stat-card">
                <div className="stat-title">Total Vehicles</div>
                <div className="stat-value">{vehicles.length}</div>
                <div className="stat-desc">{stats.activeVehicles} active</div>
              </div>
              <div className="stat-card">
                <div className="stat-title">Total Drivers</div>
                <div className="stat-value">{drivers.length}</div>
                <div className="stat-desc">{stats.activeDrivers} active</div>
              </div>
              <div className="stat-card">
                <div className="stat-title">Total Shipments</div>
                <div className="stat-value">{shipments.length}</div>
                <div className="stat-desc">{stats.deliveredShipments} delivered</div>
              </div>
              <div className="stat-card">
                <div className="stat-title">Fuel Cost</div>
                <div className="stat-value">₹{stats.totalFuelCost.toLocaleString()}</div>
                <div className="stat-desc">This month</div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Vehicle Status Distribution</h3>
                <div className="space-y-3">
                  {['active', 'maintenance', 'inactive'].map(status => {
                    const count = vehicles.filter(v => v.status === status).length;
                    const percentage = vehicles.length > 0 ? (count / vehicles.length) * 100 : 0;
                    return (
                      <div key={status} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full mr-3 ${
                            status === 'active' ? 'bg-green-500' :
                            status === 'maintenance' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}></div>
                          <span className="capitalize">{status}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm text-gray-500 mr-2">{count}</span>
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                status === 'active' ? 'bg-green-500' :
                                status === 'maintenance' ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Shipment Status Distribution</h3>
                <div className="space-y-3">
                  {['pending', 'in-transit', 'delivered', 'cancelled'].map(status => {
                    const count = shipments.filter(s => s.status === status).length;
                    const percentage = shipments.length > 0 ? (count / shipments.length) * 100 : 0;
                    return (
                      <div key={status} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full mr-3 ${
                            status === 'delivered' ? 'bg-green-500' :
                            status === 'in-transit' ? 'bg-blue-500' :
                            status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}></div>
                          <span className="capitalize">{status}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm text-gray-500 mr-2">{count}</span>
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                status === 'delivered' ? 'bg-green-500' :
                                status === 'in-transit' ? 'bg-blue-500' :
                                status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Cost Analysis */}
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Cost Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">₹{stats.totalRevenue.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">Total Revenue</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">₹{stats.totalFuelCost.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">Fuel Costs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">₹{stats.totalMaintenanceCost.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">Maintenance Costs</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Data Management */}
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Data Management</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Export Data</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => exportData('vehicles')}
                        className="btn bg-blue-600 text-white hover:bg-blue-700 text-sm"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Vehicles
                      </button>
                      <button
                        onClick={() => exportData('drivers')}
                        className="btn bg-green-600 text-white hover:bg-green-700 text-sm"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Drivers
                      </button>
                      <button
                        onClick={() => exportData('routes')}
                        className="btn bg-purple-600 text-white hover:bg-purple-700 text-sm"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Routes
                      </button>
                      <button
                        onClick={() => exportData('shipments')}
                        className="btn bg-orange-600 text-white hover:bg-orange-700 text-sm"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Shipments
                      </button>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Import Data</h4>
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept=".csv"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            importData('vehicles', file);
                          }
                        }}
                        className="input text-sm"
                        placeholder="Import Vehicles CSV"
                      />
                      <input
                        type="file"
                        accept=".csv"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            importData('drivers', file);
                          }
                        }}
                        className="input text-sm"
                        placeholder="Import Drivers CSV"
                      />
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Clear Data</h4>
                    <button
                      onClick={clearAllData}
                      className="btn bg-red-600 text-white hover:bg-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear All Data
                    </button>
                  </div>
                </div>
              </div>

              {/* System Information */}
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">System Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-slate-400">Total Vehicles:</span>
                    <span className="font-medium">{vehicles.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-slate-400">Total Drivers:</span>
                    <span className="font-medium">{drivers.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-slate-400">Total Routes:</span>
                    <span className="font-medium">{routes.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-slate-400">Total Shipments:</span>
                    <span className="font-medium">{shipments.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-slate-400">Maintenance Records:</span>
                    <span className="font-medium">{maintenanceRecords.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-slate-400">Data Storage:</span>
                    <span className="font-medium">Local Browser</span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Processing Notice */}
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">AI Processing Notice</h3>
              <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3" />
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    <p className="font-medium mb-1">About AI Document Processing</p>
                    <p>
                      The AI-powered document processor can extract data from invoices, receipts, and maintenance records. 
                      However, AI can make mistakes. Please review all extracted data before saving to ensure accuracy.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {editingItem ? 'Edit' : 'Add'} {modalType === 'vehicle' ? 'Vehicle' : 
                modalType === 'driver' ? 'Driver' : 
                modalType === 'route' ? 'Route' : 
                modalType === 'shipment' ? 'Shipment' : 'Maintenance'}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-500"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4">
              {/* Vehicle Form */}
              {modalType === 'vehicle' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Registration Number</label>
                      <input
                        type="text"
                        value={vehicleForm.registrationNumber}
                        onChange={(e) => setVehicleForm(prev => ({ ...prev, registrationNumber: e.target.value }))}
                        className="input"
                        placeholder="TN-01-AB-1234"
                      />
                    </div>
                    <div>
                      <label className="form-label">Type</label>
                      <select
                        value={vehicleForm.type}
                        onChange={(e) => setVehicleForm(prev => ({ ...prev, type: e.target.value as Vehicle['type'] }))}
                        className="input"
                      >
                        <option value="truck">Truck</option>
                        <option value="van">Van</option>
                        <option value="bus">Bus</option>
                        <option value="trailer">Trailer</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Make</label>
                      <input
                        type="text"
                        value={vehicleForm.make}
                        onChange={(e) => setVehicleForm(prev => ({ ...prev, make: e.target.value }))}
                        className="input"
                        placeholder="Tata"
                      />
                    </div>
                    <div>
                      <label className="form-label">Model</label>
                      <input
                        type="text"
                        value={vehicleForm.model}
                        onChange={(e) => setVehicleForm(prev => ({ ...prev, model: e.target.value }))}
                        className="input"
                        placeholder="Prima"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="form-label">Year</label>
                      <input
                        type="number"
                        value={vehicleForm.year}
                        onChange={(e) => setVehicleForm(prev => ({ ...prev, year: parseInt(e.target.value) || 0 }))}
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="form-label">Capacity (kg)</label>
                      <input
                        type="number"
                        value={vehicleForm.capacity}
                        onChange={(e) => setVehicleForm(prev => ({ ...prev, capacity: parseInt(e.target.value) || 0 }))}
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="form-label">Fuel Efficiency (km/l)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={vehicleForm.fuelEfficiency}
                        onChange={(e) => setVehicleForm(prev => ({ ...prev, fuelEfficiency: parseFloat(e.target.value) || 0 }))}
                        className="input"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Location</label>
                      <input
                        type="text"
                        value={vehicleForm.location}
                        onChange={(e) => setVehicleForm(prev => ({ ...prev, location: e.target.value }))}
                        className="input"
                        placeholder="Chennai"
                      />
                    </div>
                    <div>
                      <label className="form-label">Current Mileage</label>
                      <input
                        type="number"
                        value={vehicleForm.mileage}
                        onChange={(e) => setVehicleForm(prev => ({ ...prev, mileage: parseInt(e.target.value) || 0 }))}
                        className="input"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Driver Form */}
              {modalType === 'driver' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Full Name</label>
                      <input
                        type="text"
                        value={driverForm.name}
                        onChange={(e) => setDriverForm(prev => ({ ...prev, name: e.target.value }))}
                        className="input"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        value={driverForm.email}
                        onChange={(e) => setDriverForm(prev => ({ ...prev, email: e.target.value }))}
                        className="input"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Phone</label>
                      <input
                        type="tel"
                        value={driverForm.phone}
                        onChange={(e) => setDriverForm(prev => ({ ...prev, phone: e.target.value }))}
                        className="input"
                        placeholder="+91-9876543210"
                      />
                    </div>
                    <div>
                      <label className="form-label">License Number</label>
                      <input
                        type="text"
                        value={driverForm.licenseNumber}
                        onChange={(e) => setDriverForm(prev => ({ ...prev, licenseNumber: e.target.value }))}
                        className="input"
                        placeholder="DL-123456789"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">License Expiry</label>
                      <input
                        type="date"
                        value={driverForm.licenseExpiry}
                        onChange={(e) => setDriverForm(prev => ({ ...prev, licenseExpiry: e.target.value }))}
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="form-label">Experience (years)</label>
                      <input
                        type="number"
                        value={driverForm.experience}
                        onChange={(e) => setDriverForm(prev => ({ ...prev, experience: parseInt(e.target.value) || 0 }))}
                        className="input"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Address</label>
                    <textarea
                      value={driverForm.address}
                      onChange={(e) => setDriverForm(prev => ({ ...prev, address: e.target.value }))}
                      className="input"
                      rows={3}
                      placeholder="Full address"
                    />
                  </div>
                </div>
              )}

              {/* Route Form */}
              {modalType === 'route' && (
                <div className="space-y-4">
                  <div>
                    <label className="form-label">Route Name</label>
                    <input
                      type="text"
                      value={routeForm.name}
                      onChange={(e) => setRouteForm(prev => ({ ...prev, name: e.target.value }))}
                      className="input"
                      placeholder="Chennai to Bangalore Express"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Origin</label>
                      <input
                        type="text"
                        value={routeForm.origin}
                        onChange={(e) => setRouteForm(prev => ({ ...prev, origin: e.target.value }))}
                        className="input"
                        placeholder="Chennai"
                      />
                    </div>
                    <div>
                      <label className="form-label">Destination</label>
                      <input
                        type="text"
                        value={routeForm.destination}
                        onChange={(e) => setRouteForm(prev => ({ ...prev, destination: e.target.value }))}
                        className="input"
                        placeholder="Bangalore"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Distance (km)</label>
                      <input
                        type="number"
                        value={routeForm.distance}
                        onChange={(e) => setRouteForm(prev => ({ ...prev, distance: parseInt(e.target.value) || 0 }))}
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="form-label">Estimated Time (hours)</label>
                      <input
                        type="number"
                        value={routeForm.estimatedTime}
                        onChange={(e) => setRouteForm(prev => ({ ...prev, estimatedTime: parseInt(e.target.value) || 0 }))}
                        className="input"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Driver</label>
                      <select
                        value={routeForm.driver}
                        onChange={(e) => setRouteForm(prev => ({ ...prev, driver: e.target.value }))}
                        className="input"
                      >
                        <option value="">Select Driver</option>
                        {drivers.filter(d => d.status === 'active').map(driver => (
                          <option key={driver.id} value={driver.id}>{driver.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Vehicle</label>
                      <select
                        value={routeForm.vehicle}
                        onChange={(e) => setRouteForm(prev => ({ ...prev, vehicle: e.target.value }))}
                        className="input"
                      >
                        <option value="">Select Vehicle</option>
                        {vehicles.filter(v => v.status === 'active').map(vehicle => (
                          <option key={vehicle.id} value={vehicle.id}>{vehicle.registrationNumber}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Start Time</label>
                    <input
                      type="datetime-local"
                      value={routeForm.startTime}
                      onChange={(e) => setRouteForm(prev => ({ ...prev, startTime: e.target.value }))}
                      className="input"
                    />
                  </div>
                </div>
              )}

              {/* Shipment Form */}
              {modalType === 'shipment' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Tracking Number</label>
                      <input
                        type="text"
                        value={shipmentForm.trackingNumber}
                        onChange={(e) => setShipmentForm(prev => ({ ...prev, trackingNumber: e.target.value }))}
                        className="input"
                        placeholder="TMS2025001"
                      />
                    </div>
                    <div>
                      <label className="form-label">Priority</label>
                      <select
                        value={shipmentForm.priority}
                        onChange={(e) => setShipmentForm(prev => ({ ...prev, priority: e.target.value as Shipment['priority'] }))}
                        className="input"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Customer Name</label>
                      <input
                        type="text"
                        value={shipmentForm.customerName}
                        onChange={(e) => setShipmentForm(prev => ({ ...prev, customerName: e.target.value }))}
                        className="input"
                        placeholder="ABC Company"
                      />
                    </div>
                    <div>
                      <label className="form-label">Customer Contact</label>
                      <input
                        type="tel"
                        value={shipmentForm.customerContact}
                        onChange={(e) => setShipmentForm(prev => ({ ...prev, customerContact: e.target.value }))}
                        className="input"
                        placeholder="+91-9876543210"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Origin</label>
                      <input
                        type="text"
                        value={shipmentForm.origin}
                        onChange={(e) => setShipmentForm(prev => ({ ...prev, origin: e.target.value }))}
                        className="input"
                        placeholder="Chennai"
                      />
                    </div>
                    <div>
                      <label className="form-label">Destination</label>
                      <input
                        type="text"
                        value={shipmentForm.destination}
                        onChange={(e) => setShipmentForm(prev => ({ ...prev, destination: e.target.value }))}
                        className="input"
                        placeholder="Bangalore"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="form-label">Weight (kg)</label>
                      <input
                        type="number"
                        value={shipmentForm.weight}
                        onChange={(e) => setShipmentForm(prev => ({ ...prev, weight: parseInt(e.target.value) || 0 }))}
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="form-label">Volume (m³)</label>
                      <input
                        type="number"
                        value={shipmentForm.volume}
                        onChange={(e) => setShipmentForm(prev => ({ ...prev, volume: parseInt(e.target.value) || 0 }))}
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="form-label">Value (₹)</label>
                      <input
                        type="number"
                        value={shipmentForm.value}
                        onChange={(e) => setShipmentForm(prev => ({ ...prev, value: parseInt(e.target.value) || 0 }))}
                        className="input"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Scheduled Pickup</label>
                      <input
                        type="datetime-local"
                        value={shipmentForm.scheduledPickup}
                        onChange={(e) => setShipmentForm(prev => ({ ...prev, scheduledPickup: e.target.value }))}
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="form-label">Scheduled Delivery</label>
                      <input
                        type="datetime-local"
                        value={shipmentForm.scheduledDelivery}
                        onChange={(e) => setShipmentForm(prev => ({ ...prev, scheduledDelivery: e.target.value }))}
                        className="input"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Special Instructions</label>
                    <textarea
                      value={shipmentForm.specialInstructions}
                      onChange={(e) => setShipmentForm(prev => ({ ...prev, specialInstructions: e.target.value }))}
                      className="input"
                      rows={3}
                      placeholder="Handle with care, fragile items..."
                    />
                  </div>
                </div>
              )}

              {/* Maintenance Form */}
              {modalType === 'maintenance' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Vehicle</label>
                      <select
                        value={maintenanceForm.vehicleId}
                        onChange={(e) => setMaintenanceForm(prev => ({ ...prev, vehicleId: e.target.value }))}
                        className="input"
                      >
                        <option value="">Select Vehicle</option>
                        {vehicles.map(vehicle => (
                          <option key={vehicle.id} value={vehicle.id}>{vehicle.registrationNumber}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Type</label>
                      <select
                        value={maintenanceForm.type}
                        onChange={(e) => setMaintenanceForm(prev => ({ ...prev, type: e.target.value as MaintenanceRecord['type'] }))}
                        className="input"
                      >
                        <option value="routine">Routine</option>
                        <option value="repair">Repair</option>
                        <option value="inspection">Inspection</option>
                        <option value="emergency">Emergency</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Description</label>
                    <textarea
                      value={maintenanceForm.description}
                      onChange={(e) => setMaintenanceForm(prev => ({ ...prev, description: e.target.value }))}
                      className="input"
                      rows={3}
                      placeholder="Oil change, brake inspection..."
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="form-label">Date</label>
                      <input
                        type="date"
                        value={maintenanceForm.date}
                        onChange={(e) => setMaintenanceForm(prev => ({ ...prev, date: e.target.value }))}
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="form-label">Cost (₹)</label>
                      <input
                        type="number"
                        value={maintenanceForm.cost}
                        onChange={(e) => setMaintenanceForm(prev => ({ ...prev, cost: parseInt(e.target.value) || 0 }))}
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="form-label">Mechanic</label>
                      <input
                        type="text"
                        value={maintenanceForm.mechanic}
                        onChange={(e) => setMaintenanceForm(prev => ({ ...prev, mechanic: e.target.value }))}
                        className="input"
                        placeholder="John Smith"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Notes</label>
                    <textarea
                      value={maintenanceForm.notes}
                      onChange={(e) => setMaintenanceForm(prev => ({ ...prev, notes: e.target.value }))}
                      className="input"
                      rows={2}
                      placeholder="Additional notes..."
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                onClick={closeModal}
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  switch (modalType) {
                    case 'vehicle':
                      saveVehicle();
                      break;
                    case 'driver':
                      saveDriver();
                      break;
                    case 'route':
                      saveRoute();
                      break;
                    case 'shipment':
                      saveShipment();
                      break;
                    case 'maintenance':
                      saveMaintenance();
                      break;
                    default:
                      break;
                  }
                }}
                className="btn btn-primary"
              >
                {editingItem ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 py-4 theme-transition">
        <div className="container-fluid">
          <div className="text-center text-sm text-gray-500 dark:text-slate-400">
            Copyright © 2025 Datavtar Private Limited. All rights reserved
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;