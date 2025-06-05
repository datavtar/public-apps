import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useAuth } from './contexts/authContext';
import styles from './styles/styles.module.css'; // Ensure this file exists
import {
  LayoutDashboard, Truck, User as UserIcon, Route as RouteIcon, CalendarDays, Settings, BrainCircuit, Sun, Moon, LogOut, Menu,
  PlusCircle, Edit3, Trash2, Search as SearchIcon, ArrowUpDown, Eye, X, Save, UploadCloud, DownloadCloud, FileText,
  Package, ChevronDown, ChevronUp, AlertTriangle, CheckCircle2, Info, Users, MapPin, Navigation, Fuel, Gauge, UserCircle, Sparkles, MessageSquare, Send, Image as ImageIcon, Palette
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell as RechartsCell } from 'recharts';
import { useForm, Controller } from 'react-hook-form';
import AILayer from './components/AILayer'; // Import the pre-existing AILayer
import { AILayerHandle } from './components/AILayer.types'; // Import the AILayerHandle type

// Enums
enum Page {
  Dashboard = 'Dashboard',
  Vehicles = 'Vehicles',
  Drivers = 'Drivers',
  Routes = 'Routes',
  Schedules = 'Schedules',
  Shipments = 'Shipments', // Added Shipments
  AITools = 'AITools',
  Settings = 'Settings',
}

enum VehicleStatus {
  Available = 'Available',
  InTransit = 'In Transit',
  Maintenance = 'Maintenance',
  OutOfService = 'Out of Service',
}

enum DriverStatus {
  Available = 'Available',
  OnDuty = 'On Duty',
  OffDuty = 'Off Duty',
}

enum ScheduleStatus {
  Pending = 'Pending',
  InProgress = 'In Progress',
  Completed = 'Completed',
  Delayed = 'Delayed',
  Cancelled = 'Cancelled',
}

enum ShipmentStatus {
  Pending = 'Pending',
  PickedUp = 'Picked Up',
  InTransit = 'In Transit',
  Delivered = 'Delivered',
  Issue = 'Issue',
}

enum AIToolType {
  RouteOptimization = 'Route Optimization',
  LoadBalancing = 'Load Balancing',
  MaintenancePrediction = 'Maintenance Prediction',
  DamageAnalysis = 'Damage Analysis',
}


// Interfaces
interface Vehicle {
  id: string;
  registrationNumber: string;
  type: string; // e.g., Truck, Van, Trailer
  capacityKg: number;
  status: VehicleStatus;
  currentLocation: string; // Simple text for now
  fuelEfficiencyKmL: number; // Added for dashboard
  lastMaintenanceDate: string; // For AI tool
  purchaseDate: string; // For AI tool
}

interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  contactNumber: string;
  status: DriverStatus;
  assignedVehicleId?: string;
}

interface Route {
  id: string;
  name: string;
  origin: string;
  destination: string;
  distanceKm: number;
  estimatedTimeHours: number;
  waypoints?: string; // comma-separated
}

interface Schedule {
  id: string;
  tripId: string;
  vehicleId: string;
  driverId: string;
  routeId: string;
  departureDateTime: string;
  arrivalDateTime: string;
  status: ScheduleStatus;
  notes?: string;
}

interface Shipment {
  id: string;
  shipmentNumber: string;
  customerId: string; // Simple ID or name
  origin: string;
  destination: string;
  goodsDescription: string;
  quantity: number;
  weightKg: number;
  status: ShipmentStatus;
  assignedScheduleId?: string;
}

interface UserSettings {
  theme: 'light' | 'dark';
  notifications: boolean;
  language: string;
}

interface ModalState {
  isOpen: boolean;
  type: 'addVehicle' | 'editVehicle' | 'addDriver' | 'editDriver' | 'addRoute' | 'editRoute' | 'addSchedule' | 'editSchedule' | 'addShipment' | 'editShipment' | 'viewVehicle' | 'viewDriver' | 'viewRoute' | 'viewSchedule' | 'viewShipment' | 'confirmDelete' | 'aiResult' | null;
  data?: any;
}

interface ConfirmationModalData {
  title: string;
  message: string;
  onConfirm: () => void;
}

const App: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>(Page.Dashboard);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false); // General loading state

  // Data states
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]); // Shipments state
  
  // AI Layer state
  const aiLayerRef = useRef<AILayerHandle>(null);
  const [aiPromptText, setAiPromptText] = useState<string>('');
  const [aiSelectedFile, setAiSelectedFile] = useState<File | null>(null);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiIsLoading, setAiIsLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<any | null>(null);
  const [currentAiTool, setCurrentAiTool] = useState<AIToolType | null>(null);
  const [aiToolInput, setAiToolInput] = useState<any>({});

  const [modalState, setModalState] = useState<ModalState>({ isOpen: false, type: null });
  const [confirmationModalData, setConfirmationModalData] = useState<ConfirmationModalData | null>(null);

  const [userSettings, setUserSettings] = useState<UserSettings>({
    theme: 'light',
    notifications: true,
    language: 'en',
  });
  
  const todayDate = "2025-06-05"; // As requested

  // Initialize data from localStorage or seed data
  useEffect(() => {
    const loadData = <T,>(key: string, seedData: T[]): T[] => {
      try {
        const storedData = localStorage.getItem(key);
        return storedData ? JSON.parse(storedData) : seedData;
      } catch (error) {
        console.error(`Error loading ${key} from localStorage:`, error);
        return seedData; // Fallback to seed data on parse error
      }
    };

    const initialVehicles: Vehicle[] = [
      { id: 'V001', registrationNumber: 'TRUCK001', type: 'Heavy Truck', capacityKg: 10000, status: VehicleStatus.Available, currentLocation: 'Main Depot', fuelEfficiencyKmL: 5, lastMaintenanceDate: '2025-03-15', purchaseDate: '2022-01-10' },
      { id: 'V002', registrationNumber: 'VAN002', type: 'Delivery Van', capacityKg: 1500, status: VehicleStatus.InTransit, currentLocation: 'City Center', fuelEfficiencyKmL: 10, lastMaintenanceDate: '2025-04-20', purchaseDate: '2023-05-01' },
      { id: 'V003', registrationNumber: 'TRUCK003', type: 'Medium Truck', capacityKg: 5000, status: VehicleStatus.Maintenance, currentLocation: 'Service Center', fuelEfficiencyKmL: 7, lastMaintenanceDate: '2025-05-30', purchaseDate: '2022-08-15' },
    ];
    const initialDrivers: Driver[] = [
      { id: 'D001', name: 'John Doe', licenseNumber: 'LIC001', contactNumber: '555-1234', status: DriverStatus.Available },
      { id: 'D002', name: 'Jane Smith', licenseNumber: 'LIC002', contactNumber: '555-5678', status: DriverStatus.OnDuty, assignedVehicleId: 'V002' },
    ];
    const initialRoutes: Route[] = [
      { id: 'R001', name: 'City A to City B', origin: 'City A', destination: 'City B', distanceKm: 250, estimatedTimeHours: 4, waypoints: 'Midpoint Town' },
      { id: 'R002', name: 'Local Delivery Loop', origin: 'Main Depot', destination: 'North Suburb', distanceKm: 80, estimatedTimeHours: 1.5 },
    ];
    const initialSchedules: Schedule[] = [
      { id: 'S001', tripId: 'TRIP001', vehicleId: 'V002', driverId: 'D002', routeId: 'R001', departureDateTime: `${todayDate}T09:00:00`, arrivalDateTime: `${todayDate}T13:00:00`, status: ScheduleStatus.InProgress },
      { id: 'S002', tripId: 'TRIP002', vehicleId: 'V001', driverId: 'D001', routeId: 'R002', departureDateTime: `${todayDate}T14:00:00`, arrivalDateTime: `${todayDate}T15:30:00`, status: ScheduleStatus.Pending },
    ];
     const initialShipments: Shipment[] = [
      { id: 'SH001', shipmentNumber: 'AWB12345', customerId: 'Cust001', origin: 'Warehouse A', destination: 'Client X', goodsDescription: 'Electronics', quantity: 10, weightKg: 500, status: ShipmentStatus.InTransit, assignedScheduleId: 'S001' },
      { id: 'SH002', shipmentNumber: 'AWB67890', customerId: 'Cust002', origin: 'Factory B', destination: 'Retail Store Y', goodsDescription: 'Apparel', quantity: 100, weightKg: 200, status: ShipmentStatus.Pending },
    ];

    setVehicles(loadData('tms_vehicles', initialVehicles));
    setDrivers(loadData('tms_drivers', initialDrivers));
    setRoutes(loadData('tms_routes', initialRoutes));
    setSchedules(loadData('tms_schedules', initialSchedules));
    setShipments(loadData('tms_shipments', initialShipments));

    const storedSettings = localStorage.getItem('tms_userSettings');
    if (storedSettings) {
      const parsedSettings = JSON.parse(storedSettings);
      setUserSettings(parsedSettings);
      if (parsedSettings.theme === 'dark') {
        document.documentElement.classList.add('dark');
      }
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('tms_vehicles', JSON.stringify(vehicles));
      localStorage.setItem('tms_drivers', JSON.stringify(drivers));
      localStorage.setItem('tms_routes', JSON.stringify(routes));
      localStorage.setItem('tms_schedules', JSON.stringify(schedules));
      localStorage.setItem('tms_shipments', JSON.stringify(shipments));
      localStorage.setItem('tms_userSettings', JSON.stringify(userSettings));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  }, [vehicles, drivers, routes, schedules, shipments, userSettings]);

  // Theme toggle
  const toggleTheme = () => {
    setUserSettings(prev => {
      const newTheme = prev.theme === 'light' ? 'dark' : 'light';
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return { ...prev, theme: newTheme };
    });
  };
  
  // Modal management
  const openModal = (type: ModalState['type'], data?: any) => setModalState({ isOpen: true, type, data });
  const closeModal = () => {
    setModalState({ isOpen: false, type: null });
    // Reset AI tool form if closing AI result modal
    if (modalState.type === 'aiResult') {
      setAiToolInput({});
      setAiSelectedFile(null);
      setAiResult(null);
      setAiError(null);
    }
  };
  
  const openConfirmationModal = (title: string, message: string, onConfirm: () => void) => {
    setConfirmationModalData({ title, message, onConfirm });
    openModal('confirmDelete');
  };

  const closeConfirmationModal = () => {
    setConfirmationModalData(null);
    closeModal();
  };

  const handleConfirmDelete = () => {
    if (confirmationModalData) {
      confirmationModalData.onConfirm();
    }
    closeConfirmationModal();
  };

  // CRUD operations (simplified examples)
  const generateId = () => `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const handleSaveVehicle = (data: Vehicle) => {
    if (modalState.data?.id) { // Edit
      setVehicles(vehicles.map(v => v.id === modalState.data.id ? { ...v, ...data } : v));
    } else { // Add
      setVehicles([...vehicles, { ...data, id: generateId() }]);
    }
    closeModal();
  };

  const handleDeleteVehicle = (id: string) => {
    openConfirmationModal(
      "Delete Vehicle",
      "Are you sure you want to delete this vehicle? This action cannot be undone.",
      () => setVehicles(vehicles.filter(v => v.id !== id))
    );
  };

  const handleSaveDriver = (data: Driver) => {
    if (modalState.data?.id) { // Edit
      setDrivers(drivers.map(d => d.id === modalState.data.id ? { ...d, ...data } : d));
    } else { // Add
      setDrivers([...drivers, { ...data, id: generateId() }]);
    }
    closeModal();
  };

  const handleDeleteDriver = (id: string) => {
    openConfirmationModal(
      "Delete Driver",
      "Are you sure you want to delete this driver?",
      () => setDrivers(drivers.filter(d => d.id !== id))
    );
  };

  const handleSaveRoute = (data: Route) => {
    if (modalState.data?.id) {
      setRoutes(routes.map(r => r.id === modalState.data.id ? { ...r, ...data } : r));
    } else {
      setRoutes([...routes, { ...data, id: generateId() }]);
    }
    closeModal();
  };

  const handleDeleteRoute = (id: string) => {
    openConfirmationModal(
      "Delete Route",
      "Are you sure you want to delete this route?",
      () => setRoutes(routes.filter(r => r.id !== id))
    );
  };

  const handleSaveSchedule = (data: Schedule) => {
    if (modalState.data?.id) {
      setSchedules(schedules.map(s => s.id === modalState.data.id ? { ...s, ...data } : s));
    } else {
      setSchedules([...schedules, { ...data, id: generateId(), tripId: `TRIP${Date.now().toString().slice(-4)}` }]);
    }
    closeModal();
  };

  const handleDeleteSchedule = (id: string) => {
    openConfirmationModal(
      "Delete Schedule",
      "Are you sure you want to delete this schedule?",
      () => setSchedules(schedules.filter(s => s.id !== id))
    );
  };
  
  const handleSaveShipment = (data: Shipment) => {
    if (modalState.data?.id) {
      setShipments(shipments.map(s => s.id === modalState.data.id ? { ...s, ...data } : s));
    } else {
      setShipments([...shipments, { ...data, id: generateId(), shipmentNumber: `AWB${Date.now().toString().slice(-5)}` }]);
    }
    closeModal();
  };

  const handleDeleteShipment = (id: string) => {
    openConfirmationModal(
      "Delete Shipment",
      "Are you sure you want to delete this shipment?",
      () => setShipments(shipments.filter(s => s.id !== id))
    );
  };

  // Filtering logic
  const filteredVehicles = vehicles.filter(v => 
    v.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.type.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredDrivers = drivers.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredRoutes = routes.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.destination.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredSchedules = schedules.filter(s => 
    s.tripId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (vehicles.find(v => v.id === s.vehicleId)?.registrationNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (drivers.find(d => d.id === s.driverId)?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredShipments = shipments.filter(s =>
    s.shipmentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.customerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.goodsDescription.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Data Export/Import
  const exportDataToCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) {
      alert("No data to export.");
      return;
    }
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => JSON.stringify(row[header])).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const downloadVehicleTemplate = () => {
    const templateData = [{
      registrationNumber: "EXAMPLE123",
      type: "Truck",
      capacityKg: 10000,
      status: "Available",
      currentLocation: "Depot A",
      fuelEfficiencyKmL: 5,
      lastMaintenanceDate: "YYYY-MM-DD",
      purchaseDate: "YYYY-MM-DD",
    }];
    exportDataToCSV(templateData, 'vehicle_import_template');
  };

  const importVehiclesFromCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      if (lines.length < 2) {
        alert("CSV file is empty or has no data rows.");
        return;
      }
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const newVehicles: Vehicle[] = [];
      
      const requiredHeaders = ["registrationNumber", "type", "capacityKg", "status", "currentLocation", "fuelEfficiencyKmL", "lastMaintenanceDate", "purchaseDate"];
      const missingHeaders = requiredHeaders.filter(rh => !headers.includes(rh));
      if(missingHeaders.length > 0) {
        alert(`CSV file is missing required headers: ${missingHeaders.join(', ')}`);
        return;
      }

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        if (values.length === headers.length) {
          const vehicleData: any = { id: generateId() };
          headers.forEach((header, index) => {
            let value: any = values[index];
            if (header === 'capacityKg' || header === 'fuelEfficiencyKmL') value = parseFloat(value) || 0;
            else if (header === 'status') value = value in VehicleStatus ? value as VehicleStatus : VehicleStatus.Available;
            vehicleData[header] = value;
          });
          newVehicles.push(vehicleData as Vehicle);
        }
      }
      setVehicles(prev => [...prev, ...newVehicles]);
      alert(`${newVehicles.length} vehicles imported successfully.`);
    };
    reader.readAsText(file);
    (event.target as HTMLInputElement).value = ''; // Reset file input
  };

  // Clear data functions
  const clearAllData = (dataType: 'vehicles' | 'drivers' | 'routes' | 'schedules' | 'shipments' | 'all') => {
    openConfirmationModal(
      `Clear Data: ${dataType.charAt(0).toUpperCase() + dataType.slice(1)}`,
      `Are you sure you want to delete all ${dataType} data? This action is irreversible.`,
      () => {
        if (dataType === 'vehicles' || dataType === 'all') setVehicles([]);
        if (dataType === 'drivers' || dataType === 'all') setDrivers([]);
        if (dataType === 'routes' || dataType === 'all') setRoutes([]);
        if (dataType === 'schedules' || dataType === 'all') setSchedules([]);
        if (dataType === 'shipments' || dataType === 'all') setShipments([]);
        alert(`${dataType.charAt(0).toUpperCase() + dataType.slice(1)} data cleared.`);
      }
    );
  };
  
  // AI Tools Handler
  const handleAiToolSubmit = () => {
    setAiResult(null);
    setAiError(null);
    let constructedPrompt = "";

    switch (currentAiTool) {
      case AIToolType.RouteOptimization:
        if (!aiToolInput.origin || !aiToolInput.destination) {
          setAiError("Origin and Destination are required for Route Optimization.");
          return;
        }
        constructedPrompt = `Suggest an optimized route from "${aiToolInput.origin}" to "${aiToolInput.destination}" considering waypoints: "${aiToolInput.waypoints || 'None'}". Provide key considerations or alternatives in brief bullet points. Response should be concise and actionable.`;
        break;
      case AIToolType.LoadBalancing:
         if (!aiToolInput.vehicleCapacity || !aiToolInput.items) {
          setAiError("Vehicle capacity and item details are required for Load Balancing.");
          return;
        }
        constructedPrompt = `Given a vehicle with capacity "${aiToolInput.vehicleCapacity}" and items: "${aiToolInput.items}", provide brief advice on efficient loading order and space utilization. Focus on practical tips.`;
        break;
      case AIToolType.MaintenancePrediction:
        const vehicle = vehicles.find(v => v.id === aiToolInput.vehicleId);
        if (!vehicle) {
          setAiError("Selected vehicle not found for Maintenance Prediction.");
          return;
        }
        constructedPrompt = `Based on the following vehicle data: Registration "${vehicle.registrationNumber}", Type "${vehicle.type}", Purchase Date "${vehicle.purchaseDate}", Last Maintenance Date "${vehicle.lastMaintenanceDate}", Current Mileage (simulated) "${Math.floor(Math.random() * 50000 + 20000)} km", predict potential upcoming maintenance needs and suggest a priority (High, Medium, Low). Provide a short summary.`;
        break;
      case AIToolType.DamageAnalysis:
        if (!aiSelectedFile) {
          setAiError("An image file is required for Damage Analysis.");
          return;
        }
        constructedPrompt = `Analyze this vehicle image for any visible damage. Describe the location and type of damage found. Return JSON with keys: "damage_description", "location_on_vehicle", "estimated_severity" (e.g., minor, moderate, severe). If no damage is clear, indicate that.`;
        break;
      default:
        setAiError("Please select an AI tool.");
        return;
    }
    
    setAiPromptText(constructedPrompt); // Set for AILayer, though we pass directly
    aiLayerRef.current?.sendToAI(constructedPrompt, aiSelectedFile || undefined);
    openModal('aiResult');
  };

  const handleAiToolSelection = (tool: AIToolType) => {
    setCurrentAiTool(tool);
    setAiToolInput({});
    setAiSelectedFile(null);
    setAiResult(null);
    setAiError(null);
  };

  const renderAIToolForm = () => {
    if (!currentAiTool) return <p className="text-center text-gray-500 dark:text-gray-400">Select an AI tool to get started.</p>;

    switch (currentAiTool) {
      case AIToolType.RouteOptimization:
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="aiOrigin" className="form-label">Origin</label>
              <input id="aiOrigin" type="text" className="input" value={aiToolInput.origin || ''} onChange={(e) => setAiToolInput(prev => ({ ...prev, origin: e.target.value }))} />
            </div>
            <div>
              <label htmlFor="aiDestination" className="form-label">Destination</label>
              <input id="aiDestination" type="text" className="input" value={aiToolInput.destination || ''} onChange={(e) => setAiToolInput(prev => ({ ...prev, destination: e.target.value }))} />
            </div>
            <div>
              <label htmlFor="aiWaypoints" className="form-label">Waypoints (comma-separated, optional)</label>
              <input id="aiWaypoints" type="text" className="input" value={aiToolInput.waypoints || ''} onChange={(e) => setAiToolInput(prev => ({ ...prev, waypoints: e.target.value }))} />
            </div>
          </div>
        );
      case AIToolType.LoadBalancing:
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="aiVehicleCapacity" className="form-label">Vehicle Capacity (e.g., 1000kg, 10 CBM)</label>
              <input id="aiVehicleCapacity" type="text" className="input" value={aiToolInput.vehicleCapacity || ''} onChange={(e) => setAiToolInput(prev => ({ ...prev, vehicleCapacity: e.target.value }))} />
            </div>
            <div>
              <label htmlFor="aiItems" className="form-label">Items (Description, quantity, weight/dims per item)</label>
              <textarea id="aiItems" className="input" rows={3} value={aiToolInput.items || ''} onChange={(e) => setAiToolInput(prev => ({ ...prev, items: e.target.value }))}></textarea>
            </div>
          </div>
        );
      case AIToolType.MaintenancePrediction:
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="aiVehicleSelect" className="form-label">Select Vehicle</label>
              <select id="aiVehicleSelect" className="input" value={aiToolInput.vehicleId || ''} onChange={(e) => setAiToolInput(prev => ({ ...prev, vehicleId: e.target.value }))}>
                <option value="">-- Select Vehicle --</option>
                {vehicles.map(v => <option key={v.id} value={v.id}>{v.registrationNumber} ({v.type})</option>)} (
              </select>
            </div>
          </div>
        );
      case AIToolType.DamageAnalysis:
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="aiDamageImage" className="form-label">Upload Vehicle Image</label>
              <input id="aiDamageImage" type="file" accept="image/*" className="input" onChange={(e) => setAiSelectedFile(e.target.files ? e.target.files[0] : null)} />
            </div>
            {aiSelectedFile && <img src={URL.createObjectURL(aiSelectedFile)} alt="Preview" className="mt-2 max-h-48 rounded"/>}
          </div>
        );
      default: return null;
    }
  };
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (modalState.isOpen) {
          closeModal();
        }
        if (confirmationModalData) {
          closeConfirmationModal();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalState.isOpen, confirmationModalData]);


  // Page rendering
  const renderPage = () => {
    switch (currentPage) {
      case Page.Dashboard: return <DashboardContent />;
      case Page.Vehicles: return <EntityManagementPage title="Vehicles" data={filteredVehicles} columns={vehicleColumns} onAdd={() => openModal('addVehicle')} onEdit={(item) => openModal('editVehicle', item)} onView={(item) => openModal('viewVehicle', item)} onDelete={handleDeleteVehicle} />;
      case Page.Drivers: return <EntityManagementPage title="Drivers" data={filteredDrivers} columns={driverColumns} onAdd={() => openModal('addDriver')} onEdit={(item) => openModal('editDriver', item)} onView={(item) => openModal('viewDriver', item)} onDelete={handleDeleteDriver} />;
      case Page.Routes: return <EntityManagementPage title="Routes" data={filteredRoutes} columns={routeColumns} onAdd={() => openModal('addRoute')} onEdit={(item) => openModal('editRoute', item)} onView={(item) => openModal('viewRoute', item)} onDelete={handleDeleteRoute} />;
      case Page.Schedules: return <EntityManagementPage title="Schedules" data={filteredSchedules} columns={scheduleColumns} onAdd={() => openModal('addSchedule')} onEdit={(item) => openModal('editSchedule', item)} onView={(item) => openModal('viewSchedule', item)} onDelete={handleDeleteSchedule} />;
      case Page.Shipments: return <EntityManagementPage title="Shipments" data={filteredShipments} columns={shipmentColumns} onAdd={() => openModal('addShipment')} onEdit={(item) => openModal('editShipment', item)} onView={(item) => openModal('viewShipment', item)} onDelete={handleDeleteShipment} />;
      case Page.AITools: return <AIToolsPage />;
      case Page.Settings: return <SettingsPage />;
      default: return <div>Page not found</div>;
    }
  };
  
  const vehicleColumns = [
    { header: 'Reg. No.', accessor: 'registrationNumber' as keyof Vehicle, id: 'regNoCol' },
    { header: 'Type', accessor: 'type' as keyof Vehicle, id: 'typeCol' },
    { header: 'Capacity (kg)', accessor: 'capacityKg' as keyof Vehicle, id: 'capacityCol' },
    { header: 'Status', accessor: 'status' as keyof Vehicle, id: 'statusCol', render: (item: Vehicle) => <StatusBadge status={item.status} /> },
    { header: 'Location', accessor: 'currentLocation' as keyof Vehicle, id: 'locationCol' },
  ];
  const driverColumns = [
    { header: 'Name', accessor: 'name' as keyof Driver, id: 'nameCol' },
    { header: 'License No.', accessor: 'licenseNumber' as keyof Driver, id: 'licenseCol' },
    { header: 'Contact', accessor: 'contactNumber' as keyof Driver, id: 'contactCol' },
    { header: 'Status', accessor: 'status' as keyof Driver, id: 'statusCol', render: (item: Driver) => <StatusBadge status={item.status} /> },
  ];
  const routeColumns = [
    { header: 'Name', accessor: 'name' as keyof Route, id: 'nameCol' },
    { header: 'Origin', accessor: 'origin' as keyof Route, id: 'originCol' },
    { header: 'Destination', accessor: 'destination' as keyof Route, id: 'destinationCol' },
    { header: 'Distance (km)', accessor: 'distanceKm' as keyof Route, id: 'distanceCol' },
  ];
  const scheduleColumns = [
    { header: 'Trip ID', accessor: 'tripId' as keyof Schedule, id: 'tripIdCol' },
    { header: 'Vehicle', accessor: 'vehicleId' as keyof Schedule, id: 'vehicleCol', render: (item: Schedule) => vehicles.find(v => v.id === item.vehicleId)?.registrationNumber || 'N/A' },
    { header: 'Driver', accessor: 'driverId' as keyof Schedule, id: 'driverCol', render: (item: Schedule) => drivers.find(d => d.id === item.driverId)?.name || 'N/A' },
    { header: 'Departure', accessor: 'departureDateTime' as keyof Schedule, id: 'departureCol', render: (item: Schedule) => new Date(item.departureDateTime).toLocaleString() },
    { header: 'Status', accessor: 'status' as keyof Schedule, id: 'statusCol', render: (item: Schedule) => <StatusBadge status={item.status} /> },
  ];
  const shipmentColumns = [
    { header: 'Shipment No.', accessor: 'shipmentNumber' as keyof Shipment, id: 'shipmentNoCol' },
    { header: 'Customer', accessor: 'customerId' as keyof Shipment, id: 'customerCol' },
    { header: 'Origin', accessor: 'origin' as keyof Shipment, id: 'originColShipment' },
    { header: 'Destination', accessor: 'destination' as keyof Shipment, id: 'destinationColShipment' },
    { header: 'Status', accessor: 'status' as keyof Shipment, id: 'statusColShipment', render: (item: Shipment) => <StatusBadge status={item.status} /> },
  ];

  const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactElement; description?: string, id?: string }> = ({ title, value, icon, description, id }) => (
    <div className="stat-card theme-transition" id={id}>
      <div className="flex justify-between items-start">
        <div className="stat-title">{title}</div>
        <div className="text-primary-500 dark:text-primary-400">{React.cloneElement(icon, { size: 24 })}</div>
      </div>
      <div className="stat-value">{value}</div>
      {description && <div className="stat-desc">{description}</div>}
    </div>
  );

  const DashboardContent: React.FC = () => {
    const vehicleStatusData = Object.values(VehicleStatus).map(status => ({
      name: status,
      value: vehicles.filter(v => v.status === status).length,
    }));
    const scheduleStatusData = Object.values(ScheduleStatus).map(status => ({
      name: status,
      count: schedules.filter(s => s.status === status).length,
    }));
    const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

    return (
      <div className="space-y-6 p-4 md:p-6" id="generation_issue_fallback">
        <h1 className="text-3xl font-semibold text-gray-800 dark:text-white">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Vehicles" value={vehicles.length} icon={<Truck />} id="tour_dashboard_total_vehicles" />
          <StatCard title="Total Drivers" value={drivers.length} icon={<Users />} />
          <StatCard title="Active Schedules" value={schedules.filter(s => s.status === ScheduleStatus.InProgress).length} icon={<CalendarDays />} />
          <StatCard title="Pending Shipments" value={shipments.filter(s => s.status === ShipmentStatus.Pending).length} icon={<Package />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card theme-transition">
            <h2 className="text-xl font-semibold mb-4">Vehicle Status</h2>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie data={vehicleStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {vehicleStatusData.map((entry, index) => (
                    <RechartsCell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
          <div className="card theme-transition">
            <h2 className="text-xl font-semibold mb-4">Schedule Overview (by Status)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={scheduleStatusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="var(--color-primary-500, #3b82f6)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
         <div className="card theme-transition">
            <h2 className="text-xl font-semibold mb-4">Recent Activity (Last 5 Schedules)</h2>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th className="table-header">Trip ID</th>
                    <th className="table-header">Vehicle</th>
                    <th className="table-header">Driver</th>
                    <th className="table-header">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-slate-700">
                  {schedules.slice(-5).reverse().map(schedule => (
                    <tr key={schedule.id}>
                      <td className="table-cell">{schedule.tripId}</td>
                      <td className="table-cell">{vehicles.find(v=>v.id === schedule.vehicleId)?.registrationNumber || 'N/A'}</td>
                      <td className="table-cell">{drivers.find(d=>d.id === schedule.driverId)?.name || 'N/A'}</td>
                      <td className="table-cell"><StatusBadge status={schedule.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
      </div>
    );
  };
  
  interface EntityManagementPageProps<T> {
    title: string;
    data: T[];
    columns: { header: string; accessor: keyof T; id: string; render?: (item: T) => React.ReactNode }[];
    onAdd: () => void;
    onEdit: (item: T) => void;
    onView: (item: T) => void;
    onDelete: (id: string) => void;
  }

  const EntityManagementPage = <T extends { id: string }>({ title, data, columns, onAdd, onEdit, onView, onDelete }: EntityManagementPageProps<T>) => (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-semibold text-gray-800 dark:text-white">{title}</h1>
        <button className="btn btn-primary btn-responsive flex items-center gap-2" onClick={onAdd} id={`tour_${title.toLowerCase()}_add_button`}>
          <PlusCircle size={18} /> Add New {title.slice(0, -1)}
        </button>
      </div>
      <div className="table-container" id={`tour_${title.toLowerCase()}_table`}>
        <table className="table">
          <thead className="table-header">
            <tr>
              {columns.map(col => <th key={col.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">{col.header}</th>)}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-slate-700">
            {data.length === 0 ? (
              <tr><td colSpan={columns.length + 1} className="table-cell text-center">No {title.toLowerCase()} found.</td></tr>
            ) : (
              data.map(item => (
                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                  {columns.map(col => (
                    <td key={`${item.id}-${String(col.accessor)}`} className="table-cell">
                      {col.render ? col.render(item) : String(item[col.accessor] ?? '')}
                    </td>
                  ))}
                  <td className="table-cell space-x-2">
                    <button onClick={() => onView(item)} className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors" aria-label={`View ${item.id}`}><Eye size={18}/></button>
                    <button onClick={() => onEdit(item)} className="p-1 text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300 transition-colors" aria-label={`Edit ${item.id}`}><Edit3 size={18}/></button>
                    <button onClick={() => onDelete(item.id)} className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors" aria-label={`Delete ${item.id}`}><Trash2 size={18}/></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const StatusBadge: React.FC<{ status: VehicleStatus | DriverStatus | ScheduleStatus | ShipmentStatus }> = ({ status }) => {
    let colorClass = '';
    switch (status) {
      case VehicleStatus.Available: case DriverStatus.Available: case ScheduleStatus.Completed: case ShipmentStatus.Delivered: colorClass = 'badge-success'; break;
      case VehicleStatus.InTransit: case DriverStatus.OnDuty: case ScheduleStatus.InProgress: case ShipmentStatus.InTransit: case ShipmentStatus.PickedUp: colorClass = 'badge-info'; break;
      case VehicleStatus.Maintenance: case ScheduleStatus.Delayed: case ShipmentStatus.Issue: colorClass = 'badge-warning'; break;
      case VehicleStatus.OutOfService: case DriverStatus.OffDuty: case ScheduleStatus.Cancelled: case ScheduleStatus.Pending: colorClass = 'badge-error'; break; // Using error for pending for visibility
      default: colorClass = 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
    return <span className={`badge ${colorClass}`}>{status}</span>;
  };

  const AIToolsPage: React.FC = () => (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-3xl font-semibold text-gray-800 dark:text-white">AI Powered Tools</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {Object.values(AIToolType).map(tool => (
          <button 
            key={tool} 
            onClick={() => handleAiToolSelection(tool)}
            className={`btn btn-responsive w-full text-left justify-start gap-2 ${currentAiTool === tool ? 'btn-primary' : 'bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-600'}`}
            id={`tour_ai_tool_${tool.toLowerCase().replace(/\s+/g, '_')}`}
          >
            <Sparkles size={18} /> {tool}
          </button>
        ))}
      </div>

      {currentAiTool && (
        <div className="card theme-transition" id={`tour_ai_${currentAiTool.toLowerCase().replace(/\s+/g, '_')}_form`}>
          <h2 className="text-xl font-semibold mb-4">{currentAiTool}</h2>
          {renderAIToolForm()}
          <div className="mt-6 flex justify-end">
            <button onClick={handleAiToolSubmit} className="btn btn-primary flex items-center gap-2">
              <Send size={18} /> Get AI Insight
            </button>
          </div>
        </div>
      )}
       <AILayer
          ref={aiLayerRef}
          prompt={aiPromptText}
          attachment={aiSelectedFile || undefined}
          onResult={(apiResult) => { setAiResult(apiResult); setAiIsLoading(false); openModal('aiResult'); }}
          onError={(apiError) => { setAiError(apiError); setAiIsLoading(false); openModal('aiResult'); }}
          onLoading={(loadingStatus) => setAiIsLoading(loadingStatus)}
        />
    </div>
  );

  const SettingsPage: React.FC = () => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    return (
      <div className="p-4 md:p-6 space-y-6" id="tour_settings_page">
        <h1 className="text-3xl font-semibold text-gray-800 dark:text-white">Settings</h1>
        
        <div className="card theme-transition">
          <h2 className="text-xl font-semibold mb-4">Appearance</h2>
          <div className="flex items-center justify-between">
            <span className="text-gray-700 dark:text-slate-300">Theme</span>
            <div className="flex items-center space-x-2">
              <Sun size={20} className={userSettings.theme === 'light' ? 'text-yellow-500' : 'text-gray-400'}/>
              <button 
                className="theme-toggle"
                onClick={toggleTheme}
                aria-label={userSettings.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                id="tour_theme_toggle_settings"
              >
                <span className="theme-toggle-thumb"></span>
              </button>
              <Moon size={20} className={userSettings.theme === 'dark' ? 'text-blue-400' : 'text-gray-400'}/>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
             <label htmlFor="languageSelect" className="text-gray-700 dark:text-slate-300">Language</label>
             <select 
                id="languageSelect" 
                className="input w-1/2" 
                value={userSettings.language} 
                onChange={(e) => setUserSettings(prev => ({...prev, language: e.target.value}))}
              >
               <option value="en">English</option>
               <option value="es">Español (Placeholder)</option>
               <option value="fr">Français (Placeholder)</option>
             </select>
           </div>
        </div>

        <div className="card theme-transition">
          <h2 className="text-xl font-semibold mb-4">Data Management</h2>
          <div className="space-y-3">
            <h3 className="font-medium text-gray-700 dark:text-slate-300">Export Data</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              <button onClick={() => exportDataToCSV(vehicles, 'tms_vehicles_export')} className="btn bg-green-500 hover:bg-green-600 text-white btn-responsive flex items-center justify-center gap-2"><DownloadCloud size={18}/> Export Vehicles</button>
              <button onClick={() => exportDataToCSV(drivers, 'tms_drivers_export')} className="btn bg-green-500 hover:bg-green-600 text-white btn-responsive flex items-center justify-center gap-2"><DownloadCloud size={18}/> Export Drivers</button>
              <button onClick={() => exportDataToCSV(routes, 'tms_routes_export')} className="btn bg-green-500 hover:bg-green-600 text-white btn-responsive flex items-center justify-center gap-2"><DownloadCloud size={18}/> Export Routes</button>
              <button onClick={() => exportDataToCSV(schedules, 'tms_schedules_export')} className="btn bg-green-500 hover:bg-green-600 text-white btn-responsive flex items-center justify-center gap-2"><DownloadCloud size={18}/> Export Schedules</button>
              <button onClick={() => exportDataToCSV(shipments, 'tms_shipments_export')} className="btn bg-green-500 hover:bg-green-600 text-white btn-responsive flex items-center justify-center gap-2"><DownloadCloud size={18}/> Export Shipments</button>
               <button onClick={() => exportDataToCSV([...vehicles, ...drivers, ...routes, ...schedules, ...shipments], 'tms_all_data_export')} className="btn bg-blue-500 hover:bg-blue-600 text-white btn-responsive flex items-center justify-center gap-2"><DownloadCloud size={18}/> Export All Data</button>
            </div>
            
            <h3 className="font-medium text-gray-700 dark:text-slate-300 mt-4">Import Data (Vehicles)</h3>
            <div className="flex flex-col sm:flex-row gap-2 items-start">
              <button onClick={downloadVehicleTemplate} className="btn bg-gray-200 dark:bg-slate-600 hover:bg-gray-300 dark:hover:bg-slate-500 text-gray-700 dark:text-slate-200 btn-responsive flex items-center justify-center gap-2">
                <FileText size={18}/> Download Template
              </button>
              <input type="file" accept=".csv" onChange={importVehiclesFromCSV} className="hidden" ref={fileInputRef} />
              <button onClick={() => fileInputRef.current?.click()} className="btn btn-primary btn-responsive flex items-center justify-center gap-2">
                <UploadCloud size={18}/> Import Vehicles CSV
              </button>
            </div>

            <h3 className="font-medium text-gray-700 dark:text-slate-300 mt-4">Clear Data</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              <button onClick={() => clearAllData('vehicles')} className="btn bg-red-500 hover:bg-red-600 text-white btn-responsive flex items-center justify-center gap-2"><Trash2 size={18}/> Clear Vehicles</button>
              <button onClick={() => clearAllData('drivers')} className="btn bg-red-500 hover:bg-red-600 text-white btn-responsive flex items-center justify-center gap-2"><Trash2 size={18}/> Clear Drivers</button>
              <button onClick={() => clearAllData('routes')} className="btn bg-red-500 hover:bg-red-600 text-white btn-responsive flex items-center justify-center gap-2"><Trash2 size={18}/> Clear Routes</button>
              <button onClick={() => clearAllData('schedules')} className="btn bg-red-500 hover:bg-red-600 text-white btn-responsive flex items-center justify-center gap-2"><Trash2 size={18}/> Clear Schedules</button>
              <button onClick={() => clearAllData('shipments')} className="btn bg-red-500 hover:bg-red-600 text-white btn-responsive flex items-center justify-center gap-2"><Trash2 size={18}/> Clear Shipments</button>
              <button onClick={() => clearAllData('all')} className="btn bg-red-700 hover:bg-red-800 text-white btn-responsive flex items-center justify-center gap-2"><AlertTriangle size={18}/> Clear All Data</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const GenericModal: React.FC<{ title: string; children: React.ReactNode; onClose: () => void; footer?: React.ReactNode }> = ({ title, children, onClose, footer }) => (
    <div className="modal-backdrop theme-transition" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-content theme-transition w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 id="modal-title" className="text-xl font-semibold text-gray-800 dark:text-white">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-200 transition-colors" aria-label="Close modal">
            <X size={24} />
          </button>
        </div>
        <div className="mt-4">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );

  const ConfirmationModal: React.FC<{ data: ConfirmationModalData; onClose: () => void; onConfirm: () => void }> = ({ data, onClose, onConfirm }) => (
    <GenericModal title={data.title} onClose={onClose}>
      <p className="text-gray-600 dark:text-slate-300">{data.message}</p>
      <div className="modal-footer">
        <button onClick={onClose} className="btn bg-gray-200 dark:bg-slate-600 hover:bg-gray-300 dark:hover:bg-slate-500 text-gray-700 dark:text-slate-200">Cancel</button>
        <button onClick={onConfirm} className="btn btn-danger bg-red-600 hover:bg-red-700 text-white">Confirm Delete</button>
      </div>
    </GenericModal>
  );

  const DetailViewModal: React.FC<{ title: string; item: any; onClose: () => void; fields: { label: string; key: string; render?: (val: any) => React.ReactNode }[] }> = ({ title, item, onClose, fields }) => {
    if (!item) return null;
    return (
      <GenericModal title={title} onClose={onClose} footer={<button onClick={onClose} className="btn btn-primary">Close</button>}>
        <div className="space-y-3">
          {fields.map(field => (
            <div key={field.key} className="flex flex-col sm:flex-row">
              <span className="font-semibold text-gray-700 dark:text-slate-300 w-full sm:w-1/3">{field.label}:</span>
              <span className="text-gray-600 dark:text-slate-400 w-full sm:w-2/3">
                {field.render ? field.render(item[field.key]) : String(item[field.key] ?? 'N/A')}
              </span>
            </div>
          ))}
        </div>
      </GenericModal>
    );
  };
  
  const renderModalContent = () => {
    if (!modalState.isOpen) return null;

    switch (modalState.type) {
      case 'addVehicle':
      case 'editVehicle':
        return <VehicleForm initialData={modalState.data} onSubmit={handleSaveVehicle} onCancel={closeModal} />;
      case 'addDriver':
      case 'editDriver':
        return <DriverForm initialData={modalState.data} onSubmit={handleSaveDriver} onCancel={closeModal} vehicles={vehicles} />;
      case 'addRoute':
      case 'editRoute':
        return <RouteForm initialData={modalState.data} onSubmit={handleSaveRoute} onCancel={closeModal} />;
      case 'addSchedule':
      case 'editSchedule':
        return <ScheduleForm initialData={modalState.data} onSubmit={handleSaveSchedule} onCancel={closeModal} vehicles={vehicles} drivers={drivers} routes={routes} />;
      case 'addShipment':
      case 'editShipment':
        return <ShipmentForm initialData={modalState.data} onSubmit={handleSaveShipment} onCancel={closeModal} schedules={schedules} />;
      case 'viewVehicle':
        return <DetailViewModal title="Vehicle Details" item={modalState.data} onClose={closeModal} fields={[
          { label: 'Reg. Number', key: 'registrationNumber' }, { label: 'Type', key: 'type' },
          { label: 'Capacity (kg)', key: 'capacityKg' }, { label: 'Status', key: 'status', render: (val) => <StatusBadge status={val} /> },
          { label: 'Current Location', key: 'currentLocation' }, { label: 'Fuel Efficiency (km/L)', key: 'fuelEfficiencyKmL' },
          { label: 'Last Maintenance', key: 'lastMaintenanceDate' }, { label: 'Purchase Date', key: 'purchaseDate' },
        ]} />;
      case 'viewDriver':
        return <DetailViewModal title="Driver Details" item={modalState.data} onClose={closeModal} fields={[
          { label: 'Name', key: 'name' }, { label: 'License No.', key: 'licenseNumber' },
          { label: 'Contact', key: 'contactNumber' }, { label: 'Status', key: 'status', render: (val) => <StatusBadge status={val} /> },
          { label: 'Assigned Vehicle', key: 'assignedVehicleId', render: (val) => vehicles.find(v=>v.id === val)?.registrationNumber || 'N/A' },
        ]} />;
      case 'viewRoute':
        return <DetailViewModal title="Route Details" item={modalState.data} onClose={closeModal} fields={[
          { label: 'Name', key: 'name' }, { label: 'Origin', key: 'origin' }, { label: 'Destination', key: 'destination' },
          { label: 'Distance (km)', key: 'distanceKm' }, { label: 'Est. Time (hours)', key: 'estimatedTimeHours' },
          { label: 'Waypoints', key: 'waypoints' },
        ]} />;
      case 'viewSchedule':
        return <DetailViewModal title="Schedule Details" item={modalState.data} onClose={closeModal} fields={[
          { label: 'Trip ID', key: 'tripId' }, 
          { label: 'Vehicle', key: 'vehicleId', render: (val) => vehicles.find(v=>v.id === val)?.registrationNumber || 'N/A' },
          { label: 'Driver', key: 'driverId', render: (val) => drivers.find(d=>d.id === val)?.name || 'N/A' },
          { label: 'Route', key: 'routeId', render: (val) => routes.find(r=>r.id === val)?.name || 'N/A' },
          { label: 'Departure', key: 'departureDateTime', render: (val) => new Date(val).toLocaleString() },
          { label: 'Arrival', key: 'arrivalDateTime', render: (val) => new Date(val).toLocaleString() },
          { label: 'Status', key: 'status', render: (val) => <StatusBadge status={val} /> },
          { label: 'Notes', key: 'notes' },
        ]} />;
      case 'viewShipment':
        return <DetailViewModal title="Shipment Details" item={modalState.data} onClose={closeModal} fields={[
            { label: 'Shipment No.', key: 'shipmentNumber' }, { label: 'Customer ID', key: 'customerId' },
            { label: 'Origin', key: 'origin' }, { label: 'Destination', key: 'destination' },
            { label: 'Goods', key: 'goodsDescription' }, { label: 'Quantity', key: 'quantity' },
            { label: 'Weight (kg)', key: 'weightKg' }, { label: 'Status', key: 'status', render: (val) => <StatusBadge status={val} /> },
            { label: 'Assigned Schedule', key: 'assignedScheduleId', render: (val) => schedules.find(s=>s.id === val)?.tripId || 'N/A' },
        ]} />;
      case 'confirmDelete':
        if (confirmationModalData) {
          return <ConfirmationModal data={confirmationModalData} onClose={closeConfirmationModal} onConfirm={handleConfirmDelete} />;
        }
        return null;
      case 'aiResult':
        return (
            <GenericModal title={`AI Result: ${currentAiTool || ''}`} onClose={closeModal} footer={<button onClick={closeModal} className="btn btn-primary">Close</button>}>
              {aiIsLoading && <div className="flex-center p-8"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div></div>}
              {aiError && <div className="alert alert-error"><AlertTriangle size={20}/> <pre className="whitespace-pre-wrap">{JSON.stringify(aiError, null, 2)}</pre></div>}
              {aiResult && (
                <div className="prose dark:prose-invert max-w-none">
                  {typeof aiResult === 'string' && aiResult.startsWith('{') && aiResult.endsWith('}') ? (
                    <pre className="whitespace-pre-wrap bg-gray-100 dark:bg-slate-700 p-3 rounded">{JSON.stringify(JSON.parse(aiResult), null, 2)}</pre>
                  ) : (
                    <p>{aiResult}</p>
                  )}
                </div>
              )}
            </GenericModal>
          );
      default: return null;
    }
  };

  const sidebarItems = [
    { name: Page.Dashboard, icon: LayoutDashboard, id: 'tour_sidebar_dashboard' },
    { name: Page.Vehicles, icon: Truck, id: 'tour_sidebar_vehicles' },
    { name: Page.Drivers, icon: UserIcon, id: 'tour_sidebar_drivers' },
    { name: Page.Routes, icon: RouteIcon, id: 'tour_sidebar_routes' },
    { name: Page.Schedules, icon: CalendarDays, id: 'tour_sidebar_schedules' },
    { name: Page.Shipments, icon: Package, id: 'tour_sidebar_shipments' },
    { name: Page.AITools, icon: BrainCircuit, id: 'tour_ai_tools_link' },
    { name: Page.Settings, icon: Settings, id: 'tour_settings_page_link' },
  ];

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-slate-900 theme-transition-all" id="welcome_fallback">
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : styles.sidebarClosed} fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-slate-800 shadow-lg theme-transition-all transform md:relative md:translate-x-0 transition-transform duration-300 ease-in-out`}>
        <div className="p-4">
          <h2 className="text-2xl font-bold text-primary-600 dark:text-primary-400 flex items-center gap-2"><Truck size={28}/> TMS Pro</h2>
        </div>
        <nav className="mt-6">
          {sidebarItems.map(item => (
            <button
              key={item.name}
              id={item.id}
              onClick={() => { setCurrentPage(item.name); setIsSidebarOpen(false); }}
              className={`w-full flex items-center px-4 py-3 text-gray-700 dark:text-slate-200 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors ${currentPage === item.name ? 'bg-primary-100 dark:bg-primary-700 border-l-4 border-primary-500 dark:border-primary-400 font-semibold text-primary-600 dark:text-primary-300' : ''}`}
              aria-current={currentPage === item.name ? 'page' : undefined}
            >
              <item.icon size={20} className="mr-3" />
              {item.name}
            </button>
          ))}
        </nav>
        <div className="absolute bottom-4 left-4 right-4">
           {currentUser && (
             <div className="p-3 bg-gray-100 dark:bg-slate-700 rounded-lg mb-2">
                <div className="flex items-center gap-2">
                    <UserCircle size={32} className="text-primary-500"/>
                    <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-white">{currentUser.first_name} {currentUser.last_name}</p>
                        <p className="text-xs text-gray-500 dark:text-slate-400">{currentUser.email}</p>
                    </div>
                </div>
             </div>
           )}
          <button
            onClick={logout}
            className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-800 hover:bg-red-200 dark:hover:bg-red-700 rounded-md transition-colors"
          >
            <LogOut size={18} className="mr-2" /> Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-slate-800 shadow-md p-4 theme-transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
               <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden p-2 mr-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500">
                <span className="sr-only">Open sidebar</span>
                {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <div className="relative w-full max-w-xs hidden sm:block">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon size={20} className="text-gray-400" />
                </div>
                <input
                  type="search"
                  placeholder={`Search in ${currentPage}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10 input-responsive"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors" aria-label="Toggle theme" id="tour_theme_toggle">
                {userSettings.theme === 'light' ? <Moon size={20} className="text-gray-600 dark:text-slate-300" /> : <Sun size={20} className="text-gray-600 dark:text-slate-300" />}
              </button>
              {/* User dropdown or info can go here */}
            </div>
          </div>
           <div className="relative w-full mt-2 sm:hidden">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon size={20} className="text-gray-400" />
                </div>
                <input
                  type="search"
                  placeholder={`Search in ${currentPage}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10 input-responsive"
                />
              </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-slate-900 theme-transition-bg">
          {isLoading ? <div className="flex-center h-full"><div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-500"></div></div> : renderPage()}
        </main>
         {renderModalContent()}
        {isSidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>}
      </div>
      <footer className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 text-center py-2 text-xs text-gray-500 dark:text-slate-400 shadow-t theme-transition-all no-print">
        Copyright © 2025 Datavtar Private Limited. All rights reserved.
      </footer>
    </div>
  );
};

// Form Components
interface FormProps<T> { initialData?: Partial<T>; onSubmit: (data: T) => void; onCancel: () => void; }

const VehicleForm: React.FC<FormProps<Vehicle>> = ({ initialData, onSubmit, onCancel }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<Vehicle>({ defaultValues: initialData || { status: VehicleStatus.Available, capacityKg: 0, fuelEfficiencyKmL: 0 } });
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormInput label="Registration Number" name="registrationNumber" register={register} errors={errors} required />
      <FormInput label="Type (e.g., Truck, Van)" name="type" register={register} errors={errors} required />
      <FormInput label="Capacity (kg)" name="capacityKg" type="number" register={register} errors={errors} required valueAsNumber />
      <FormSelect label="Status" name="status" register={register} errors={errors} options={Object.values(VehicleStatus)} required />
      <FormInput label="Current Location" name="currentLocation" register={register} errors={errors} />
      <FormInput label="Fuel Efficiency (km/L)" name="fuelEfficiencyKmL" type="number" step="0.1" register={register} errors={errors} valueAsNumber />
      <FormInput label="Last Maintenance Date" name="lastMaintenanceDate" type="date" register={register} errors={errors} />
      <FormInput label="Purchase Date" name="purchaseDate" type="date" register={register} errors={errors} />
      <FormActions onCancel={onCancel} />
    </form>
  );
};

const DriverForm: React.FC<FormProps<Driver> & { vehicles: Vehicle[] }> = ({ initialData, onSubmit, onCancel, vehicles }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<Driver>({ defaultValues: initialData || { status: DriverStatus.Available } });
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormInput label="Name" name="name" register={register} errors={errors} required />
      <FormInput label="License Number" name="licenseNumber" register={register} errors={errors} required />
      <FormInput label="Contact Number" name="contactNumber" register={register} errors={errors} type="tel" />
      <FormSelect label="Status" name="status" register={register} errors={errors} options={Object.values(DriverStatus)} required />
      <FormSelect label="Assigned Vehicle (Optional)" name="assignedVehicleId" register={register} errors={errors} options={vehicles.map(v => ({value: v.id, label: `${v.registrationNumber} (${v.type})`}))} prompt="-- Select Vehicle --" />
      <FormActions onCancel={onCancel} />
    </form>
  );
};

const RouteForm: React.FC<FormProps<Route>> = ({ initialData, onSubmit, onCancel }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<Route>({ defaultValues: initialData || { distanceKm: 0, estimatedTimeHours: 0 } });
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormInput label="Route Name" name="name" register={register} errors={errors} required />
      <FormInput label="Origin" name="origin" register={register} errors={errors} required />
      <FormInput label="Destination" name="destination" register={register} errors={errors} required />
      <FormInput label="Distance (km)" name="distanceKm" type="number" register={register} errors={errors} required valueAsNumber />
      <FormInput label="Estimated Time (hours)" name="estimatedTimeHours" type="number" step="0.1" register={register} errors={errors} required valueAsNumber />
      <FormInput label="Waypoints (comma-separated, optional)" name="waypoints" register={register} errors={errors} />
      <FormActions onCancel={onCancel} />
    </form>
  );
};

const ScheduleForm: React.FC<FormProps<Schedule> & { vehicles: Vehicle[]; drivers: Driver[]; routes: Route[] }> = ({ initialData, onSubmit, onCancel, vehicles, drivers, routes }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<Schedule>({ defaultValues: initialData || { status: ScheduleStatus.Pending } });
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormSelect label="Vehicle" name="vehicleId" register={register} errors={errors} options={vehicles.filter(v => v.status === VehicleStatus.Available || v.id === initialData?.vehicleId).map(v => ({value: v.id, label: `${v.registrationNumber} (${v.type})`}))} required prompt="-- Select Vehicle --" />
      <FormSelect label="Driver" name="driverId" register={register} errors={errors} options={drivers.filter(d => d.status === DriverStatus.Available || d.id === initialData?.driverId).map(d => ({value: d.id, label: d.name}))} required prompt="-- Select Driver --" />
      <FormSelect label="Route" name="routeId" register={register} errors={errors} options={routes.map(r => ({value: r.id, label: r.name}))} required prompt="-- Select Route --" />
      <FormInput label="Departure Date & Time" name="departureDateTime" type="datetime-local" register={register} errors={errors} required />
      <FormInput label="Estimated Arrival Date & Time" name="arrivalDateTime" type="datetime-local" register={register} errors={errors} required />
      <FormSelect label="Status" name="status" register={register} errors={errors} options={Object.values(ScheduleStatus)} required />
      <FormTextarea label="Notes (Optional)" name="notes" register={register} errors={errors} />
      <FormActions onCancel={onCancel} />
    </form>
  );
};

const ShipmentForm: React.FC<FormProps<Shipment> & { schedules: Schedule[] }> = ({ initialData, onSubmit, onCancel, schedules }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<Shipment>({ defaultValues: initialData || { status: ShipmentStatus.Pending, quantity:0, weightKg:0 } });
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormInput label="Customer ID/Name" name="customerId" register={register} errors={errors} required />
      <FormInput label="Origin" name="origin" register={register} errors={errors} required />
      <FormInput label="Destination" name="destination" register={register} errors={errors} required />
      <FormInput label="Goods Description" name="goodsDescription" register={register} errors={errors} required />
      <FormInput label="Quantity" name="quantity" type="number" register={register} errors={errors} required valueAsNumber />
      <FormInput label="Weight (kg)" name="weightKg" type="number" step="0.1" register={register} errors={errors} required valueAsNumber />
      <FormSelect label="Status" name="status" register={register} errors={errors} options={Object.values(ShipmentStatus)} required />
      <FormSelect label="Assign to Schedule (Optional)" name="assignedScheduleId" register={register} errors={errors} options={schedules.map(s => ({value: s.id, label: `${s.tripId} (${routes.find(r=>r.id === s.routeId)?.name || 'N/A'})`}))} prompt="-- Select Schedule --" />
      <FormActions onCancel={onCancel} />
    </form>
  );
};

// Helper form components
interface FormElementProps {
  label: string;
  name: string;
  register: any; // simplified for brevity
  errors: any; // simplified
  required?: boolean;
  type?: string;
  options?: (string | { value: string; label: string })[];
  prompt?: string;
  valueAsNumber?: boolean;
  step?: string;
}

const FormInput: React.FC<FormElementProps> = ({ label, name, register, errors, required, type = 'text', valueAsNumber, step }) => (
  <div className="form-group">
    <label htmlFor={name} className="form-label">{label}{required && <span className="text-red-500">*</span>}</label>
    <input id={name} type={type} {...register(name, { required: required && `${label} is required`, valueAsNumber })} className={`input ${errors[name] ? 'border-red-500' : ''}`} step={step}/>
    {errors[name] && <p className="form-error">{errors[name].message}</p>}
  </div>
);

const FormSelect: React.FC<FormElementProps> = ({ label, name, register, errors, required, options = [], prompt }) => (
  <div className="form-group">
    <label htmlFor={name} className="form-label">{label}{required && <span className="text-red-500">*</span>}</label>
    <select id={name} {...register(name, { required: required && `${label} is required` })} className={`input ${errors[name] ? 'border-red-500' : ''}`}>
      {prompt && <option value="">{prompt}</option>}
      {options.map(opt => typeof opt === 'string' ? 
        <option key={opt} value={opt}>{opt}</option> :
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      )}
    </select>
    {errors[name] && <p className="form-error">{errors[name].message}</p>}
  </div>
);

const FormTextarea: React.FC<FormElementProps> = ({ label, name, register, errors, required }) => (
  <div className="form-group">
    <label htmlFor={name} className="form-label">{label}{required && <span className="text-red-500">*</span>}</label>
    <textarea id={name} {...register(name, { required: required && `${label} is required` })} className={`input ${errors[name] ? 'border-red-500' : ''}`} rows={3}></textarea>
    {errors[name] && <p className="form-error">{errors[name].message}</p>}
  </div>
);

const FormActions: React.FC<{ onCancel: () => void }> = ({ onCancel }) => (
  <div className="modal-footer">
    <button type="button" onClick={onCancel} className="btn bg-gray-200 dark:bg-slate-600 hover:bg-gray-300 dark:hover:bg-slate-500 text-gray-700 dark:text-slate-200">Cancel</button>
    <button type="submit" className="btn btn-primary flex items-center gap-2"><Save size={18}/> Save</button>
  </div>
);


export default App;
