import React, { useState, useEffect, useRef, FormEvent, ChangeEvent, useCallback } from 'react';
import { useAuth } from './contexts/authContext';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import styles from './styles/styles.module.css';

import {
  LayoutDashboard, Truck, User, Users, BarChart2, Settings, LogOut, Plus, Edit, Trash2, Search, Filter,
  Sun, Moon, MapPin, Package, ChevronDown, ChevronUp, AlertCircle, CheckCircle2, Upload, Download, FileText,
  Save, X, Maximize, Minimize, MessageSquare, BrainCircuit, Camera as LucideCamera, RotateCcw, Image as LucideImage,
  ClipboardList, Route, CalendarDays, Anchor, Ship, Plane, Car, Gauge, Building
} from 'lucide-react';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { format, parseISO, addDays, differenceInDays, isValid } from 'date-fns';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css';
import * as L from 'leaflet';
import 'leaflet-defaulticon-compatibility';

import { Camera as ReactCameraPro, CameraRef } from 'react-camera-pro';


// Constants
const APP_NAME = "LogiPro TMS";
const TODAY_DATE = new Date(2025, 5, 5); // June 5, 2025
const LOCAL_STORAGE_PREFIX = "logipro_tms_";

// Enums
enum ShipmentStatus {
  PENDING = "Pending",
  INFO_RECEIVED = "Info Received",
  IN_TRANSIT = "In Transit",
  OUT_FOR_DELIVERY = "Out for Delivery",
  DELIVERED = "Delivered",
  DELAYED = "Delayed",
  CANCELLED = "Cancelled",
  EXCEPTION = "Exception"
}

enum VehicleType {
  TRUCK_SEMI = "Semi-Trailer Truck",
  TRUCK_BOX = "Box Truck",
  VAN_CARGO = "Cargo Van",
  FLATBED = "Flatbed Truck",
  REEFER = "Refrigerated Truck",
  CONTAINER_SHIP = "Container Ship",
  CARGO_PLANE = "Cargo Plane",
  RAIL_CAR = "Rail Car"
}

enum VehicleStatus {
  AVAILABLE = "Available",
  IN_USE = "In Use",
  MAINTENANCE = "Maintenance",
  OUT_OF_SERVICE = "Out of Service"
}

enum Priority {
  LOW = "Low",
  MEDIUM = "Medium",
  HIGH = "High",
  URGENT = "Urgent"
}

// Interfaces
interface Identifiable {
  id: string;
}

interface Customer extends Identifiable {
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  notes?: string;
  createdAt: string;
}

interface Driver extends Identifiable {
  name: string;
  licenseNumber: string;
  phone: string;
  email?: string;
  assignedVehicleId?: string;
  status: "Active" | "Inactive" | "On Leave";
  yearsOfExperience: number;
  createdAt: string;
}

interface Vehicle extends Identifiable {
  name: string; // e.g., "Truck 007", "The Enterprise"
  type: VehicleType;
  registrationNumber: string;
  capacityWeightKg: number;
  capacityVolumeM3: number;
  status: VehicleStatus;
  currentLocation?: string; // Could be a city name or coordinates string for simplicity
  fuelLevelPercent?: number; // 0-100
  maintenanceDate?: string;
  driverId?: string;
  createdAt: string;
}

interface ShipmentItem {
  name: string;
  quantity: number;
  weightKg: number;
  dimensionsCm?: { l: number, w: number, h: number };
  isFragile: boolean;
}

interface Shipment extends Identifiable {
  shipmentNumber: string; // Auto-generated, e.g., TMS-YYYYMMDD-XXXX
  origin: string;
  destination: string;
  customerId: string;
  assignedVehicleId?: string;
  assignedDriverId?: string;
  status: ShipmentStatus;
  priority: Priority;
  estimatedPickupDate: string;
  estimatedDeliveryDate: string;
  actualPickupDate?: string;
  actualDeliveryDate?: string;
  items: ShipmentItem[];
  totalWeightKg: number;
  totalVolumeM3?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  proofOfDeliveryImage?: string; // base64 string
  trackingHistory: { status: ShipmentStatus, timestamp: string, location?: string, notes?: string }[];
}

interface ConfirmationDialogState {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  title?: string;
}

type EntityType = 'shipments' | 'vehicles' | 'drivers' | 'customers';

interface AppData {
  shipments: Shipment[];
  vehicles: Vehicle[];
  drivers: Driver[];
  customers: Customer[];
}

type SortConfig<T,> = {
  key: keyof T;
  direction: 'ascending' | 'descending';
} | null;

// Helper Functions
const generateId = (): string => Math.random().toString(36).substr(2, 9);

const generateShipmentNumber = (): string => {
  const datePart = format(new Date(), "yyyyMMdd");
  const randomPart = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `TMS-${datePart}-${randomPart}`;
};

const getFromLocalStorage = <T,>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  const storedValue = localStorage.getItem(LOCAL_STORAGE_PREFIX + key);
  if (storedValue) {
    try {
      return JSON.parse(storedValue) as T;
    } catch (error) {
      console.error(`Error parsing localStorage key "${key}":`, error);
      return defaultValue;
    }
  }
  return defaultValue;
};

const saveToLocalStorage = <T,>(key: string, value: T): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCAL_STORAGE_PREFIX + key, JSON.stringify(value));
};

const App: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      return savedMode === 'true' || (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
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

  const toggleTheme = () => setIsDarkMode(prev => !prev);

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  // Data states
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalType, setModalType] = useState<'shipment' | 'vehicle' | 'driver' | 'customer' | null>(null);
  const [editingItem, setEditingItem] = useState<Shipment | Vehicle | Driver | Customer | null>(null);

  const [confirmationDialog, setConfirmationDialog] = useState<ConfirmationDialogState | null>(null);

  // AI Layer state
  const aiLayerRef = useRef<AILayerHandle>(null);
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiError, setAiError] = useState<any | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiInputData, setAiInputData] = useState<{ origin?: string, destination?: string, items?: string, vehicleType?: VehicleType, shipmentDetails?: string }>({});


  // Camera state
  const cameraRef = useRef<CameraRef>(null);
  const [showCamera, setShowCamera] = useState<boolean>(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [shipmentForImage, setShipmentForImage] = useState<Shipment | null>(null);


  // Sorting states
  const [shipmentSortConfig, setShipmentSortConfig] = useState<SortConfig<Shipment,>>(null);
  const [vehicleSortConfig, setVehicleSortConfig] = useState<SortConfig<Vehicle,>>(null);
  const [driverSortConfig, setDriverSortConfig] = useState<SortConfig<Driver,>>(null);
  const [customerSortConfig, setCustomerSortConfig] = useState<SortConfig<Customer,>>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;


  const { register, handleSubmit, reset, control, formState: { errors }, setValue, watch } = useForm();
  const shipmentItemsForm = watch("items"); // For dynamic items in shipment form


  // Load initial data from localStorage or set defaults
  useEffect(() => {
    setIsLoading(true);
    const initialCustomers = getFromLocalStorage<Customer[]>('customers', [
      { id: 'cust1', name: 'Global Exports Inc.', contactPerson: 'Alice Wonderland', email: 'alice@globalexports.com', phone: '555-0101', address: '123 Export Lane, Tradetown, USA', createdAt: format(addDays(TODAY_DATE, -30), 'yyyy-MM-dd') },
      { id: 'cust2', name: 'Local Imports Co.', contactPerson: 'Bob The Builder', email: 'bob@localimports.co', phone: '555-0102', address: '456 Import St, Commerce City, USA', notes: 'Prefers morning deliveries', createdAt: format(addDays(TODAY_DATE, -60), 'yyyy-MM-dd') },
    ]);
    const initialDrivers = getFromLocalStorage<Driver[]>('drivers', [
      { id: 'driver1', name: 'John Doe', licenseNumber: 'DL12345XYZ', phone: '555-0201', status: 'Active', yearsOfExperience: 5, createdAt: format(addDays(TODAY_DATE, -90), 'yyyy-MM-dd') },
      { id: 'driver2', name: 'Jane Smith', licenseNumber: 'DL67890ABC', phone: '555-0202', status: 'Active', yearsOfExperience: 8, email: 'jane@example.com', createdAt: format(addDays(TODAY_DATE, -120), 'yyyy-MM-dd') },
    ]);
    const initialVehicles = getFromLocalStorage<Vehicle[]>('vehicles', [
      { id: 'vehicle1', name: 'Truck 101', type: VehicleType.TRUCK_BOX, registrationNumber: 'TRK101', capacityWeightKg: 5000, capacityVolumeM3: 30, status: VehicleStatus.AVAILABLE, driverId: 'driver1', fuelLevelPercent: 80, createdAt: format(addDays(TODAY_DATE, -45), 'yyyy-MM-dd') },
      { id: 'vehicle2', name: 'Van 202', type: VehicleType.VAN_CARGO, registrationNumber: 'VAN202', capacityWeightKg: 1500, capacityVolumeM3: 10, status: VehicleStatus.IN_USE, driverId: 'driver2', maintenanceDate: format(addDays(TODAY_DATE, 15), 'yyyy-MM-dd'), createdAt: format(addDays(TODAY_DATE, -75), 'yyyy-MM-dd') },
      { id: 'vehicle3', name: 'Big Rig 007', type: VehicleType.TRUCK_SEMI, registrationNumber: 'RIG007', capacityWeightKg: 20000, capacityVolumeM3: 80, status: VehicleStatus.AVAILABLE, fuelLevelPercent: 60, createdAt: format(addDays(TODAY_DATE, -15), 'yyyy-MM-dd') },
    ]);
    const initialShipments = getFromLocalStorage<Shipment[]>('shipments', [
      {
        id: 'ship1', shipmentNumber: generateShipmentNumber(), origin: 'Warehouse A, New York', destination: 'Client Hub, Chicago', customerId: 'cust1', assignedVehicleId: 'vehicle1', assignedDriverId: 'driver1', status: ShipmentStatus.IN_TRANSIT, priority: Priority.HIGH,
        estimatedPickupDate: format(addDays(TODAY_DATE, -2), 'yyyy-MM-dd'), actualPickupDate: format(addDays(TODAY_DATE, -2), 'yyyy-MM-dd'), estimatedDeliveryDate: format(addDays(TODAY_DATE, 1), 'yyyy-MM-dd'),
        items: [{ name: 'Electronics Bundle', quantity: 50, weightKg: 5, isFragile: true }], totalWeightKg: 250, createdAt: format(addDays(TODAY_DATE, -3), 'yyyy-MM-dd'), updatedAt: format(addDays(TODAY_DATE, -1), 'yyyy-MM-dd'),
        trackingHistory: [
          { status: ShipmentStatus.INFO_RECEIVED, timestamp: format(addDays(TODAY_DATE, -3), "yyyy-MM-dd'T'HH:mm:ss") },
          { status: ShipmentStatus.IN_TRANSIT, timestamp: format(addDays(TODAY_DATE, -2), "yyyy-MM-dd'T'HH:mm:ss"), location: "Departed New York" }
        ]
      },
      {
        id: 'ship2', shipmentNumber: generateShipmentNumber(), origin: 'Factory Z, Los Angeles', destination: 'Retail Store Y, San Francisco', customerId: 'cust2', status: ShipmentStatus.PENDING, priority: Priority.MEDIUM,
        estimatedPickupDate: format(TODAY_DATE, 'yyyy-MM-dd'), estimatedDeliveryDate: format(addDays(TODAY_DATE, 2), 'yyyy-MM-dd'),
        items: [{ name: 'Apparel Batch', quantity: 200, weightKg: 1, isFragile: false }], totalWeightKg: 200, createdAt: format(addDays(TODAY_DATE, -1), 'yyyy-MM-dd'), updatedAt: format(addDays(TODAY_DATE, -1), 'yyyy-MM-dd'),
        trackingHistory: [{ status: ShipmentStatus.INFO_RECEIVED, timestamp: format(addDays(TODAY_DATE, -1), "yyyy-MM-dd'T'HH:mm:ss") }]
      },
    ]);

    setCustomers(initialCustomers);
    setDrivers(initialDrivers);
    setVehicles(initialVehicles);
    setShipments(initialShipments);
    setIsLoading(false);
  }, []);

  // Persist data to localStorage whenever it changes
  useEffect(() => { saveToLocalStorage('customers', customers); }, [customers]);
  useEffect(() => { saveToLocalStorage('drivers', drivers); }, [drivers]);
  useEffect(() => { saveToLocalStorage('vehicles', vehicles); }, [vehicles]);
  useEffect(() => { saveToLocalStorage('shipments', shipments); }, [shipments]);

  const openModal = (type: 'shipment' | 'vehicle' | 'driver' | 'customer', itemToEdit: Shipment | Vehicle | Driver | Customer | null = null) => {
    setModalType(type);
    setEditingItem(itemToEdit);
    reset(); // Clear previous form data

    if (itemToEdit) {
      // Pre-fill form for editing
      Object.entries(itemToEdit).forEach(([key, value]) => {
        // For date fields, ensure they are in yyyy-MM-dd format for input type="date"
        if (['estimatedPickupDate', 'estimatedDeliveryDate', 'actualPickupDate', 'actualDeliveryDate', 'maintenanceDate', 'createdAt'].includes(key) && typeof value === 'string') {
          try {
            setValue(key as any, format(parseISO(value as string), 'yyyy-MM-dd'));
          } catch (e) {
            setValue(key as any, value); // if parsing fails, use original value
          }
        } else {
          setValue(key as any, value);
        }
      });
      if (type === 'shipment' && 'items' in itemToEdit) {
        setValue('items', itemToEdit.items);
      }
    } else {
      // Default values for new items
      if (type === 'shipment') {
        setValue('priority', Priority.MEDIUM);
        setValue('status', ShipmentStatus.PENDING);
        setValue('items', [{ name: '', quantity: 1, weightKg: 0, isFragile: false }]);
      }
      if (type === 'vehicle') {
        setValue('status', VehicleStatus.AVAILABLE);
        setValue('capacityWeightKg', 1000);
        setValue('capacityVolumeM3', 10);
      }
      if (type === 'driver') {
        setValue('status', 'Active');
        setValue('yearsOfExperience', 0);
      }
    }
    setIsModalOpen(true);
    document.body.classList.add('modal-open');
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalType(null);
    setEditingItem(null);
    reset();
    document.body.classList.remove('modal-open');
  };
  
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (confirmationDialog?.isOpen) {
          setConfirmationDialog(prev => prev ? { ...prev, isOpen: false } : null);
        } else if (isModalOpen) {
          closeModal();
        } else if (showCamera) {
          setShowCamera(false);
          setCapturedImage(null);
          setShipmentForImage(null);
        }
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isModalOpen, confirmationDialog, showCamera]);


  const showAppConfirmation = (title: string, message: string, onConfirmAction: () => void) => {
    setConfirmationDialog({ isOpen: true, title, message, onConfirm: () => {
      onConfirmAction();
      setConfirmationDialog(null);
    }});
  };

  // CRUD Operations
  const handleSave: SubmitHandler<any> = (data) => {
    const now = format(new Date(), 'yyyy-MM-dd');
    const timestamp = format(new Date(), "yyyy-MM-dd'T'HH:mm:ss");

    if (modalType === 'shipment') {
      const shipmentData = data as Omit<Shipment, 'id' | 'shipmentNumber' | 'createdAt' | 'updatedAt' | 'totalWeightKg' | 'trackingHistory'> & { items: ShipmentItem[] };
      const totalWeightKg = shipmentData.items.reduce((sum, item) => sum + (Number(item.weightKg) * Number(item.quantity)), 0);
      
      if (editingItem) { // Update
        const updatedShipment = { 
          ...(editingItem as Shipment), 
          ...shipmentData, 
          totalWeightKg, 
          updatedAt: now,
          trackingHistory: [
            ...((editingItem as Shipment).trackingHistory || []),
            { status: shipmentData.status, timestamp, notes: "Shipment details updated." }
          ]
        };
        setShipments(prev => prev.map(s => s.id === editingItem!.id ? updatedShipment : s));
      } else { // Create
        const newShipment: Shipment = {
          id: generateId(),
          shipmentNumber: generateShipmentNumber(),
          ...shipmentData,
          totalWeightKg,
          createdAt: now,
          updatedAt: now,
          trackingHistory: [{ status: shipmentData.status, timestamp, notes: "Shipment created." }]
        };
        setShipments(prev => [newShipment, ...prev]);
      }
    } else if (modalType === 'vehicle') {
      const vehicleData = data as Omit<Vehicle, 'id' | 'createdAt'>;
      if (editingItem) {
        setVehicles(prev => prev.map(v => v.id === editingItem!.id ? { ...v, ...vehicleData } : v));
      } else {
        setVehicles(prev => [{ ...vehicleData, id: generateId(), createdAt: now }, ...prev]);
      }
    } else if (modalType === 'driver') {
      const driverData = data as Omit<Driver, 'id' | 'createdAt'>;
      if (editingItem) {
        setDrivers(prev => prev.map(d => d.id === editingItem!.id ? { ...d, ...driverData } : d));
      } else {
        setDrivers(prev => [{ ...driverData, id: generateId(), createdAt: now }, ...prev]);
      }
    } else if (modalType === 'customer') {
      const customerData = data as Omit<Customer, 'id' | 'createdAt'>;
      if (editingItem) {
        setCustomers(prev => prev.map(c => c.id === editingItem!.id ? { ...c, ...customerData } : c));
      } else {
        setCustomers(prev => [{ ...customerData, id: generateId(), createdAt: now }, ...prev]);
      }
    }
    closeModal();
  };

  const handleDelete = (type: EntityType, id: string) => {
    showAppConfirmation("Confirm Deletion", `Are you sure you want to delete this ${type.slice(0, -1)}? This action cannot be undone.`, () => {
      if (type === 'shipments') setShipments(prev => prev.filter(s => s.id !== id));
      if (type === 'vehicles') setVehicles(prev => prev.filter(v => v.id !== id));
      if (type === 'drivers') setDrivers(prev => prev.filter(d => d.id !== id));
      if (type === 'customers') setCustomers(prev => prev.filter(c => c.id !== id));
    });
  };

  // Generic sorting function
  const requestSort = <T,>(key: keyof T, type: 'shipment' | 'vehicle' | 'driver' | 'customer') => {
    let direction: 'ascending' | 'descending' = 'ascending';
    let currentSortConfig: SortConfig<T,> = null;

    switch(type) {
      case 'shipment': 
        currentSortConfig = shipmentSortConfig as SortConfig<T,>;
        break;
      case 'vehicle':
        currentSortConfig = vehicleSortConfig as SortConfig<T,>;
        break;
      case 'driver':
        currentSortConfig = driverSortConfig as SortConfig<T,>;
        break;
      case 'customer':
        currentSortConfig = customerSortConfig as SortConfig<T,>;
        break;
    }

    if (currentSortConfig && currentSortConfig.key === key && currentSortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    
    const newSortConfig = { key, direction } as SortConfig<T,>;

    switch(type) {
      case 'shipment': 
        setShipmentSortConfig(newSortConfig as unknown as SortConfig<Shipment,>);
        break;
      case 'vehicle':
        setVehicleSortConfig(newSortConfig as unknown as SortConfig<Vehicle,>);
        break;
      case 'driver':
        setDriverSortConfig(newSortConfig as unknown as SortConfig<Driver,>);
        break;
      case 'customer':
        setCustomerSortConfig(newSortConfig as unknown as SortConfig<Customer,>);
        break;
    }
  };

  const getSortedData = <T extends Identifiable,>(data: T[], sortConfig: SortConfig<T,>): T[] => {
    if (!sortConfig) return data;
    return [...data].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  };


  // Filtering logic
  const getFilteredData = <T extends { status?: string, name?: string, shipmentNumber?: string, origin?: string, destination?: string },>(
    data: T[],
    term: string,
    statusFilter: string
  ): T[] => {
    let filtered = data;
    if (statusFilter && data.length > 0 && 'status' in data[0]!) {
      filtered = filtered.filter(item => (item.status as string)?.toLowerCase() === statusFilter.toLowerCase());
    }
    if (term) {
      const lowerTerm = term.toLowerCase();
      filtered = filtered.filter(item =>
        Object.values(item).some(val =>
          String(val).toLowerCase().includes(lowerTerm)
        )
      );
    }
    return filtered;
  };


  // Paginated Data
  const getPaginatedData = <T,>(data: T[]): T[] => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return data.slice(startIndex, startIndex + itemsPerPage);
  };

  const totalPages = (dataLength: number) => Math.ceil(dataLength / itemsPerPage);


  const handleAiSend = (predefinedPromptKey?: 'routeOptimization' | 'riskAssessment' | 'loadConfig') => {
    let finalPrompt = aiPrompt;
    if (predefinedPromptKey) {
        switch(predefinedPromptKey) {
            case 'routeOptimization':
                finalPrompt = `Suggest an optimized delivery route from "${aiInputData.origin || 'Unknown Origin'}" to "${aiInputData.destination || 'Unknown Destination'}" for a ${aiInputData.vehicleType || 'standard truck'}. Consider typical traffic patterns and road suitability. Provide key waypoints or concise turn-by-turn directions.`;
                break;
            case 'riskAssessment':
                finalPrompt = `Assess potential risks for a shipment containing "${aiInputData.items || 'general goods'}" from "${aiInputData.origin || 'Unknown Origin'}" to "${aiInputData.destination || 'Unknown Destination'}". Provide a risk level (Low, Medium, High) and 2-3 actionable mitigation tips. Return response as JSON: {"risk_level": "Low|Medium|High", "mitigation_tips": ["tip1", "tip2"] }`;
                break;
            case 'loadConfig':
                finalPrompt = `Provide loading configuration advice for a ${aiInputData.vehicleType || 'standard truck'} carrying the following items: ${aiInputData.items || 'various packages'}. Focus on safety, stability, and maximizing space utilization. Offer 3 practical tips.`;
                break;
        }
    }

    if (!finalPrompt.trim()) {
      setAiError("Please enter a prompt or select an AI task.");
      return;
    }
    setAiResult(null);
    setAiError(null);
    aiLayerRef.current?.sendToAI(finalPrompt);
  };


  // Settings functions
  const handleImportShipments = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const text = e.target?.result as string;
        try {
            const lines = text.split('\n').filter(line => line.trim() !== '');
            const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, '')); // e.g. "Origin Point" -> "originpoint"
            
            const newShipments: Shipment[] = lines.slice(1).map(line => {
                const values = line.split(',');
                const shipmentObject: any = {};
                headers.forEach((header, index) => {
                    // Basic mapping, needs to be more robust for real use
                    let key = header;
                    if (header === "estimateddeliverydate") key = "estimatedDeliveryDate";
                    if (header === "estimatedpickupdate") key = "estimatedPickupDate";
                    if (header === "customerid") key = "customerId"; // Ensure mapping crucial fields
                    // ... more mappings needed for all Shipment fields

                    shipmentObject[key] = values[index]?.trim();
                });

                // Create a valid Shipment object, filling defaults for missing required fields
                return {
                    id: generateId(),
                    shipmentNumber: shipmentObject.shipmentnumber || generateShipmentNumber(),
                    origin: shipmentObject.origin || 'N/A',
                    destination: shipmentObject.destination || 'N/A',
                    customerId: shipmentObject.customerid || customers[0]?.id || 'N/A', // Default to first customer or N/A
                    status: shipmentObject.status as ShipmentStatus || ShipmentStatus.PENDING,
                    priority: shipmentObject.priority as Priority || Priority.MEDIUM,
                    estimatedPickupDate: shipmentObject.estimatedpickupdate ? format(parseISO(shipmentObject.estimatedpickupdate), 'yyyy-MM-dd') : format(TODAY_DATE, 'yyyy-MM-dd'),
                    estimatedDeliveryDate: shipmentObject.estimateddeliverydate ? format(parseISO(shipmentObject.estimateddeliverydate), 'yyyy-MM-dd') : format(addDays(TODAY_DATE,3), 'yyyy-MM-dd'),
                    items: shipmentObject.items ? JSON.parse(shipmentObject.items) : [{ name: 'Imported Item', quantity: 1, weightKg: 1, isFragile: false }],
                    totalWeightKg: shipmentObject.items ? JSON.parse(shipmentObject.items).reduce((sum:number, i:ShipmentItem) => sum + i.weightKg * i.quantity, 0) : 1,
                    createdAt: format(new Date(), 'yyyy-MM-dd'),
                    updatedAt: format(new Date(), 'yyyy-MM-dd'),
                    trackingHistory: [{status: ShipmentStatus.INFO_RECEIVED, timestamp: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"), notes: "Imported via CSV"}]
                };
            });
            setShipments(prev => [...prev, ...newShipments.filter(s => s.origin !== 'N/A')]); // Add valid new shipments
            alert('Shipments imported successfully!');
        } catch (error) {
            console.error("Import error:", error);
            alert('Error importing shipments. Please check file format and content.');
        }
    };
    event.target.value = ''; // Reset file input
  };

  const getShipmentTemplateCSV = () => {
    const headers = "ShipmentNumber,Origin,Destination,CustomerID,Status,Priority,EstimatedPickupDate,EstimatedDeliveryDate,ItemsJSON\n";
    const exampleRow = `"${generateShipmentNumber()}","New York, NY","Los Angeles, CA","cust1","Pending","Medium","${format(TODAY_DATE, 'yyyy-MM-dd')}","${format(addDays(TODAY_DATE, 5), 'yyyy-MM-dd')}","[{""name"":""Sample Item"",""quantity"":10,""weightKg"":5,""isFragile"":false}]"`;
    const csvContent = headers + exampleRow;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "shipment_template.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  };

  const exportAllData = () => {
    const dataToExport: AppData = { shipments, vehicles, drivers, customers };
    const jsonString = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "logipro_tms_backup.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const deleteAllData = () => {
    showAppConfirmation("Confirm Total Data Deletion", "WARNING: This will delete ALL data (Shipments, Vehicles, Drivers, Customers) from the application. This action is irreversible. Are you absolutely sure?", () => {
      setShipments([]);
      setVehicles([]);
      setDrivers([]);
      setCustomers([]);
      localStorage.removeItem(LOCAL_STORAGE_PREFIX + 'shipments');
      localStorage.removeItem(LOCAL_STORAGE_PREFIX + 'vehicles');
      localStorage.removeItem(LOCAL_STORAGE_PREFIX + 'drivers');
      localStorage.removeItem(LOCAL_STORAGE_PREFIX + 'customers');
      alert('All data has been deleted.');
    });
  };


  // Camera specific functions
  const handleTakePhoto = () => {
    if (cameraRef.current) {
      const photo = cameraRef.current.takePhoto();
      setCapturedImage(photo);
    }
  };

  const handleSavePhotoToShipment = () => {
    if (capturedImage && shipmentForImage) {
      const updatedShipment = { ...shipmentForImage, proofOfDeliveryImage: capturedImage, updatedAt: format(new Date(), 'yyyy-MM-dd') };
      setShipments(prev => prev.map(s => s.id === shipmentForImage.id ? updatedShipment : s));
      setShowCamera(false);
      setCapturedImage(null);
      setShipmentForImage(null);
      alert('Photo saved as proof of delivery!');
    }
  };

  const openCameraForShipment = (shipment: Shipment) => {
    setShipmentForImage(shipment);
    setShowCamera(true);
    setCapturedImage(null); // Clear previous capture
  };
  
  // Map component to reset view
  const ChangeView = ({ center, zoom }: { center: L.LatLngExpression, zoom: number }) => {
    const map = useMap();
    map.setView(center, zoom);
    return null;
  };
  
  const defaultMapCenter: L.LatLngExpression = [39.8283, -98.5795]; // Center of USA
  const defaultMapZoom = 4;

  // Render functions for different views

  const renderDashboard = () => {
    const stats = [
      { title: 'Total Shipments', value: shipments.length, icon: <Truck className="w-8 h-8 text-primary-500" />, id: "total-shipments-stat" },
      { title: 'Vehicles Available', value: vehicles.filter(v => v.status === VehicleStatus.AVAILABLE).length, icon: <Car className="w-8 h-8 text-green-500" />, id: "vehicles-available-stat" },
      { title: 'Active Drivers', value: drivers.filter(d => d.status === 'Active').length, icon: <User className="w-8 h-8 text-blue-500" />, id: "active-drivers-stat" },
      { title: 'Pending Deliveries', value: shipments.filter(s => s.status === ShipmentStatus.PENDING || s.status === ShipmentStatus.OUT_FOR_DELIVERY).length, icon: <Package className="w-8 h-8 text-yellow-500" />, id: "pending-deliveries-stat" },
    ];

    const shipmentStatusCounts = Object.values(ShipmentStatus).map(status => ({
      name: status,
      count: shipments.filter(s => s.status === status).length
    })).filter(s => s.count > 0);

    const shipmentsByPriority = Object.values(Priority).map(p => ({
        name: p,
        value: shipments.filter(s => s.priority === p).length
    })).filter(item => item.value > 0);
    const pieColors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];


    return (
      <div id="dashboard-overview" className="p-4 md:p-6 space-y-6 fade-in">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Dashboard</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {stats.map(stat => (
            <div key={stat.title} id={stat.id} className="stat-card theme-transition card-responsive">
              <div className="flex items-center justify-between">
                <p className="stat-title">{stat.title}</p>
                {stat.icon}
              </div>
              <p className="stat-value">{stat.value}</p>
              {/* <p className="stat-desc">↗︎ 14% from last month</p> Sample description */}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card theme-transition p-4 md:p-6" id="shipments-status-chart">
                <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-slate-200">Shipments by Status</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={shipmentStatusCounts} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-slate-700" />
                        <XAxis dataKey="name" tick={{ fill: 'var(--color-text-base)' }} />
                        <YAxis tick={{ fill: 'var(--color-text-base)' }} />
                        <Tooltip
                            contentStyle={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid #ccc' }}
                            itemStyle={{ color: 'var(--color-text-base)' }}
                        />
                        <Legend wrapperStyle={{ color: 'var(--color-text-base)' }} />
                        <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <div className="card theme-transition p-4 md:p-6" id="shipments-priority-chart">
                <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-slate-200">Shipments by Priority</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                        <Pie
                            data={shipmentsByPriority}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                            {shipmentsByPriority.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid #ccc' }}/>
                        <Legend wrapperStyle={{ color: 'var(--color-text-base)' }} />
                    </RechartsPieChart>
                </ResponsiveContainer>
            </div>
        </div>

        <div className="card theme-transition p-4 md:p-6" id="quick-actions-dashboard">
             <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-slate-200">Quick Actions</h3>
             <div className="flex flex-wrap gap-4">
                <button onClick={() => openModal('shipment')} className="btn btn-primary btn-responsive flex items-center gap-2"><Plus size={18} /> New Shipment</button>
                <button onClick={() => openModal('vehicle')} className="btn btn-secondary btn-responsive flex items-center gap-2"><Truck size={18} /> Add Vehicle</button>
                <button onClick={() => setActiveTab('ai_assistant')} className="btn bg-indigo-500 hover:bg-indigo-600 text-white btn-responsive flex items-center gap-2"><BrainCircuit size={18} /> AI Assistant</button>
             </div>
        </div>
      </div>
    );
  };

  const renderEntityTable = <T extends Identifiable & { name?: string, shipmentNumber?: string, status?: string, origin?: string, destination?: string, customerId?: string, estimatedDeliveryDate?: string, type?: VehicleType | string, licenseNumber?: string, contactPerson?: string },>(
    entityType: EntityType,
    data: T[],
    columns: Array<{ key: keyof T, header: string, sortable?: boolean, render?: (item: T) => React.ReactNode }>,
    sortConfig: SortConfig<T,>,
    requestSortFn: (key: keyof T, type: EntityType) => void,
    filterStatusOptions?: string[] | readonly string[]
  ) => {
    const filteredData = getFilteredData(data, searchTerm, filterStatus);
    const sortedData = getSortedData(filteredData, sortConfig);
    const paginatedData = getPaginatedData(sortedData);
    const totalDataPages = totalPages(sortedData.length);

    const getStatusBadge = (status: string) => {
        let colorClass = 'badge-info';
        if (status === ShipmentStatus.DELIVERED || status === VehicleStatus.AVAILABLE || status === 'Active') colorClass = 'badge-success';
        else if (status === ShipmentStatus.CANCELLED || status === ShipmentStatus.EXCEPTION || status === VehicleStatus.OUT_OF_SERVICE || status === 'Inactive') colorClass = 'badge-error';
        else if (status === ShipmentStatus.DELAYED || status === ShipmentStatus.IN_TRANSIT || status === VehicleStatus.MAINTENANCE) colorClass = 'badge-warning';
        return <span className={`badge ${colorClass}`}>{status}</span>;
    };

    const getPriorityBadge = (priority: string) => {
        let colorClass = 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'; // Low
        if (priority === Priority.MEDIUM) colorClass = 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
        if (priority === Priority.HIGH) colorClass = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
        if (priority === Priority.URGENT) colorClass = 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
        return <span className={`badge ${colorClass}`}>{priority}</span>;
    };


    return (
      <div id={`${entityType}-list`} className="p-4 md:p-6 space-y-4 fade-in">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white capitalize">{entityType} Management</h2>
          <button onClick={() => openModal(entityType.slice(0, -1) as 'shipment' | 'vehicle' | 'driver' | 'customer')} id={`add-${entityType.slice(0,-1)}-button`} className="btn btn-primary btn-responsive flex items-center gap-2"><Plus size={18}/> New {entityType.slice(0, -1)}</button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-grow w-full md:w-auto">
                <input
                    type="text"
                    placeholder={`Search ${entityType}...`}
                    className="input input-responsive pl-10 w-full"
                    value={searchTerm}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => { setSearchTerm(e.target.value); setCurrentPage(1);}}
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
            {filterStatusOptions && (
                <div className="relative flex-grow w-full md:w-auto">
                    <select
                        className="input input-responsive pl-10 w-full"
                        value={filterStatus}
                        onChange={(e: ChangeEvent<HTMLSelectElement>) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                    >
                        <option value="">All Statuses</option>
                        {filterStatusOptions.map(status => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                     <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
            )}
        </div>

        {isLoading ? <div className="skeleton-text h-64 w-full"></div> :
        paginatedData.length === 0 ? (
          <div className="text-center py-10 text-gray-500 dark:text-slate-400">
            <Package size={48} className="mx-auto mb-4" />
            <p className="text-xl">No {entityType} found.</p>
            <p>Try adjusting your search or filters, or add a new {entityType.slice(0, -1)}.</p>
          </div>
        ) : (
        <div className="table-container theme-transition">
          <table id={`${entityType}-table`} className="table">
            <thead className="table-header">
              <tr>
                {columns.map(col => (
                  <th key={String(col.key)} className="table-cell px-4 py-3 cursor-pointer" onClick={col.sortable ? () => requestSortFn(col.key, entityType) : undefined}>
                    <div className="flex items-center gap-1">
                        {col.header}
                        {col.sortable && sortConfig?.key === col.key && (sortConfig.direction === 'ascending' ? <ChevronUp size={16}/> : <ChevronDown size={16}/>)}
                        {col.sortable && (!sortConfig || sortConfig.key !== col.key) && <ChevronDown size={16} className="opacity-30" />}
                    </div>
                  </th>
                ))}
                <th className="table-cell px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700 theme-transition">
              {paginatedData.map(item => (
                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 theme-transition">
                  {columns.map(col => (
                    <td key={`${item.id}-${String(col.key)}`} className="table-cell px-4 py-3">
                      {col.render ? col.render(item) : col.key === 'status' && typeof item[col.key] === 'string' ? getStatusBadge(item[col.key] as string) : col.key === 'priority' && typeof item[col.key] === 'string' ? getPriorityBadge(item[col.key] as string) : String(item[col.key] ?? 'N/A')}
                    </td>
                  ))}
                  <td className="table-cell px-4 py-3 text-right whitespace-nowrap">
                    {entityType === 'shipments' && <button onClick={() => openCameraForShipment(item as unknown as Shipment)} className="p-1 text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 mr-2" title="Attach Proof of Delivery"><LucideCamera size={18}/></button>}
                    <button onClick={() => openModal(entityType.slice(0, -1) as 'shipment' | 'vehicle' | 'driver' | 'customer', item)} className="p-1 text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 mr-2" title={`Edit ${entityType.slice(0,-1)}`}><Edit size={18}/></button>
                    <button onClick={() => handleDelete(entityType, item.id)} className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300" title={`Delete ${entityType.slice(0,-1)}`}><Trash2 size={18}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
        {totalDataPages > 1 && (
          <div className="flex justify-between items-center mt-4">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="btn btn-sm bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 disabled:opacity-50">Previous</button>
            <span className="text-sm text-gray-700 dark:text-slate-300">Page {currentPage} of {totalDataPages}</span>
            <button onClick={() => setCurrentPage(p => Math.min(totalDataPages, p + 1))} disabled={currentPage === totalDataPages} className="btn btn-sm bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 disabled:opacity-50">Next</button>
          </div>
        )}
      </div>
    );
  };

  const renderShipments = () => {
    const columns: Array<{ key: keyof Shipment, header: string, sortable?: boolean, render?: (item: Shipment) => React.ReactNode }> = [
      { key: 'shipmentNumber', header: 'Shipment #', sortable: true },
      { key: 'origin', header: 'Origin', sortable: true },
      { key: 'destination', header: 'Destination', sortable: true },
      { key: 'customerId', header: 'Customer', sortable: true, render: (item) => customers.find(c => c.id === item.customerId)?.name || 'N/A' },
      { key: 'status', header: 'Status', sortable: true },
      { key: 'priority', header: 'Priority', sortable: true },
      { key: 'estimatedDeliveryDate', header: 'Est. Delivery', sortable: true, render: (item) => format(parseISO(item.estimatedDeliveryDate), 'MMM dd, yyyy') },
      { key: 'totalWeightKg', header: 'Weight (kg)', sortable: true, render: (item) => item.totalWeightKg.toFixed(2) },
      { key: 'assignedVehicleId', header: 'Vehicle', render: (item) => vehicles.find(v => v.id === item.assignedVehicleId)?.name || <span className="text-xs italic text-gray-500 dark:text-slate-400">Unassigned</span> },
    ];
    return renderEntityTable('shipments', shipments, columns, shipmentSortConfig as SortConfig<Shipment,>, requestSort as any, Object.values(ShipmentStatus));
  };
  
  const renderVehicles = () => {
    const columns: Array<{ key: keyof Vehicle, header: string, sortable?: boolean, render?: (item: Vehicle) => React.ReactNode }> = [
      { key: 'name', header: 'Name', sortable: true },
      { key: 'type', header: 'Type', sortable: true },
      { key: 'registrationNumber', header: 'Reg. #', sortable: true },
      { key: 'status', header: 'Status', sortable: true },
      { key: 'capacityWeightKg', header: 'Capacity (kg)', sortable: true },
      { key: 'driverId', header: 'Driver', render: (item) => drivers.find(d => d.id === item.driverId)?.name || <span className="text-xs italic text-gray-500 dark:text-slate-400">Unassigned</span> },
    ];
    return renderEntityTable('vehicles', vehicles, columns, vehicleSortConfig as SortConfig<Vehicle,>, requestSort as any, Object.values(VehicleStatus));
  };

  const renderDrivers = () => {
    const columns: Array<{ key: keyof Driver, header: string, sortable?: boolean, render?: (item: Driver) => React.ReactNode }> = [
      { key: 'name', header: 'Name', sortable: true },
      { key: 'licenseNumber', header: 'License #', sortable: true },
      { key: 'phone', header: 'Phone', sortable: true },
      { key: 'status', header: 'Status', sortable: true },
      { key: 'yearsOfExperience', header: 'Experience (Yrs)', sortable: true },
      { key: 'assignedVehicleId', header: 'Vehicle', render: (item) => vehicles.find(v => v.id === item.assignedVehicleId)?.name || <span className="text-xs italic text-gray-500 dark:text-slate-400">Unassigned</span> },
    ];
    return renderEntityTable('drivers', drivers, columns, driverSortConfig as SortConfig<Driver,>, requestSort as any, ["Active", "Inactive", "On Leave"]);
  };

  const renderCustomers = () => {
    const columns: Array<{ key: keyof Customer, header: string, sortable?: boolean, render?: (item: Customer) => React.ReactNode }> = [
      { key: 'name', header: 'Company Name', sortable: true },
      { key: 'contactPerson', header: 'Contact Person', sortable: true },
      { key: 'email', header: 'Email', sortable: true },
      { key: 'phone', header: 'Phone', sortable: true },
    ];
    return renderEntityTable('customers', customers, columns, customerSortConfig as SortConfig<Customer,>, requestSort as any);
  };


  const renderReports = () => {
    const shipmentsPerMonthData = Array.from({ length: 12 }, (_, i) => {
        const monthDate = new Date(TODAY_DATE.getFullYear(), i, 1);
        return {
            name: format(monthDate, 'MMM'),
            shipments: shipments.filter(s => {
                try {
                    return parseISO(s.createdAt).getMonth() === i && parseISO(s.createdAt).getFullYear() === TODAY_DATE.getFullYear();
                } catch { return false; }
            }).length,
        };
    });

    const vehicleStatusData = Object.values(VehicleStatus).map(status => ({
        name: status,
        value: vehicles.filter(v => v.status === status).length,
    })).filter(item => item.value > 0);
    const pieColors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD'];

    const onTimeDeliveryRate = () => {
        const completedShipments = shipments.filter(s => s.status === ShipmentStatus.DELIVERED && s.actualDeliveryDate && s.estimatedDeliveryDate);
        if (completedShipments.length === 0) return { rate: 0, onTime: 0, delayed: 0 };
        const onTime = completedShipments.filter(s => {
            try {
              return differenceInDays(parseISO(s.actualDeliveryDate!), parseISO(s.estimatedDeliveryDate!)) <= 0;
            } catch { return false; }
        }).length;
        const rate = (onTime / completedShipments.length) * 100;
        return { rate: parseFloat(rate.toFixed(1)), onTime, delayed: completedShipments.length - onTime };
    };
    const deliveryStats = onTimeDeliveryRate();


    return (
      <div id="reports-tab" className="p-4 md:p-6 space-y-6 fade-in">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Reports & Analytics</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="stat-card theme-transition card-responsive" id="on-time-delivery-stat">
                <div className="flex items-center justify-between">
                    <p className="stat-title">On-Time Delivery Rate</p>
                    <Gauge className="w-8 h-8 text-green-500" />
                </div>
                <p className="stat-value">{deliveryStats.rate}%</p>
                <p className="stat-desc">{deliveryStats.onTime} On-Time, {deliveryStats.delayed} Delayed</p>
            </div>
            <div className="stat-card theme-transition card-responsive" id="total-vehicles-stat">
                <div className="flex items-center justify-between">
                    <p className="stat-title">Total Vehicles</p>
                    <Truck className="w-8 h-8 text-blue-500" />
                </div>
                <p className="stat-value">{vehicles.length}</p>
                <p className="stat-desc">{vehicles.filter(v => v.status === VehicleStatus.IN_USE).length} In Use</p>
            </div>
             <div className="stat-card theme-transition card-responsive" id="total-customers-stat">
                <div className="flex items-center justify-between">
                    <p className="stat-title">Total Customers</p>
                    <Building className="w-8 h-8 text-purple-500" />
                </div>
                <p className="stat-value">{customers.length}</p>
                <p className="stat-desc">Servicing clients worldwide</p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card theme-transition p-4 md:p-6" id="shipments-monthly-chart">
                <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-slate-200">Shipments per Month ({TODAY_DATE.getFullYear()})</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={shipmentsPerMonthData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-slate-700" />
                        <XAxis dataKey="name" tick={{ fill: 'var(--color-text-base)' }} />
                        <YAxis tick={{ fill: 'var(--color-text-base)' }} />
                        <Tooltip contentStyle={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid #ccc' }} />
                        <Bar dataKey="shipments" name="Shipments" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="card theme-transition p-4 md:p-6" id="vehicle-status-chart">
                <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-slate-200">Vehicle Status Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                     <RechartsPieChart>
                        <Pie data={vehicleStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} >
                            {vehicleStatusData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid #ccc' }}/>
                        <Legend wrapperStyle={{ color: 'var(--color-text-base)' }} />
                    </RechartsPieChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>
    );
  };


  const renderAiAssistant = () => {
    return (
      <div id="ai-assistant-tab" className="p-4 md:p-6 space-y-6 fade-in">
        <div className="flex items-center gap-3">
          <BrainCircuit size={32} className="text-primary-500" />
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">AI Assistant</h2>
        </div>
        <p className="text-gray-600 dark:text-slate-300">Leverage AI to optimize your logistics operations. Please note that AI suggestions are for guidance and should be reviewed by a human operator.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Route Optimization Card */}
            <div className="card theme-transition p-4" id="ai-route-optimizer-card">
                <h3 className="font-semibold text-lg mb-2 text-gray-700 dark:text-slate-200">Route Optimization</h3>
                <div className="form-group">
                    <label htmlFor="ai-origin" className="form-label">Origin</label>
                    <input id="ai-origin" type="text" className="input input-sm" value={aiInputData.origin || ''} onChange={e => setAiInputData(p => ({...p, origin: e.target.value}))} placeholder="e.g., New York, NY" />
                </div>
                <div className="form-group">
                    <label htmlFor="ai-destination" className="form-label">Destination</label>
                    <input id="ai-destination" type="text" className="input input-sm" value={aiInputData.destination || ''} onChange={e => setAiInputData(p => ({...p, destination: e.target.value}))} placeholder="e.g., Los Angeles, CA" />
                </div>
                <div className="form-group">
                    <label htmlFor="ai-vehicle-type-route" className="form-label">Vehicle Type</label>
                    <select id="ai-vehicle-type-route" className="input input-sm" value={aiInputData.vehicleType || ''} onChange={e => setAiInputData(p => ({...p, vehicleType: e.target.value as VehicleType}))}>
                        <option value="">Select Vehicle Type</option>
                        {Object.values(VehicleType).map(vt => <option key={vt} value={vt}>{vt}</option>)}
                    </select>
                </div>
                <button onClick={() => handleAiSend('routeOptimization')} className="btn btn-primary w-full mt-2">Get Route Suggestion</button>
            </div>

            {/* Risk Assessment Card */}
            <div className="card theme-transition p-4" id="ai-risk-assessment-card">
                <h3 className="font-semibold text-lg mb-2 text-gray-700 dark:text-slate-200">Shipment Risk Assessment</h3>
                 <div className="form-group">
                    <label htmlFor="ai-items-risk" className="form-label">Items Description</label>
                    <input id="ai-items-risk" type="text" className="input input-sm" value={aiInputData.items || ''} onChange={e => setAiInputData(p => ({...p, items: e.target.value}))} placeholder="e.g., Fragile electronics, 50 units" />
                </div>
                <div className="form-group">
                    <label htmlFor="ai-origin-risk" className="form-label">Origin</label>
                    <input id="ai-origin-risk" type="text" className="input input-sm" value={aiInputData.origin || ''} onChange={e => setAiInputData(p => ({...p, origin: e.target.value}))} placeholder="Source location" />
                </div>
                <div className="form-group">
                    <label htmlFor="ai-destination-risk" className="form-label">Destination</label>
                    <input id="ai-destination-risk" type="text" className="input input-sm" value={aiInputData.destination || ''} onChange={e => setAiInputData(p => ({...p, destination: e.target.value}))} placeholder="Target location" />
                </div>
                <button onClick={() => handleAiSend('riskAssessment')} className="btn btn-primary w-full mt-2">Assess Risk</button>
            </div>
            
            {/* Load Configuration Card */}
            <div className="card theme-transition p-4" id="ai-load-config-card">
                <h3 className="font-semibold text-lg mb-2 text-gray-700 dark:text-slate-200">Load Configuration Advice</h3>
                <div className="form-group">
                    <label htmlFor="ai-vehicle-type-load" className="form-label">Vehicle Type</label>
                     <select id="ai-vehicle-type-load" className="input input-sm" value={aiInputData.vehicleType || ''} onChange={e => setAiInputData(p => ({...p, vehicleType: e.target.value as VehicleType}))}>
                        <option value="">Select Vehicle Type</option>
                        {Object.values(VehicleType).map(vt => <option key={vt} value={vt}>{vt}</option>)}
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="ai-items-load" className="form-label">Package List / Items</label>
                    <textarea id="ai-items-load" className="input input-sm" value={aiInputData.items || ''} onChange={e => setAiInputData(p => ({...p, items: e.target.value}))} placeholder="e.g., 10 boxes (50x50x50cm, 20kg each), 5 pallets (100x120cm, 500kg each)" rows={3}></textarea>
                </div>
                <button onClick={() => handleAiSend('loadConfig')} className="btn btn-primary w-full mt-2">Get Loading Advice</button>
            </div>
        </div>

        {/* General AI Prompt Area */}
        <div className="card theme-transition p-4 mt-6" id="ai-general-prompt-card">
            <h3 className="font-semibold text-lg mb-2 text-gray-700 dark:text-slate-200">Custom AI Prompt</h3>
            <textarea
                id="ai-prompt-input"
                className="input w-full mb-2"
                rows={3}
                value={aiPrompt}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setAiPrompt(e.target.value)}
                placeholder="Ask the AI assistant anything related to logistics..."
            />
            <button onClick={() => handleAiSend()} className="btn btn-primary">Send to AI</button>
        </div>

        {isAiLoading && <div className="mt-4 p-4 rounded-md bg-blue-50 dark:bg-slate-700 text-blue-700 dark:text-blue-300 flex items-center gap-2"><AlertCircle size={20}/> Processing AI request...</div>}
        {aiError && <div className="mt-4 p-4 rounded-md bg-red-50 dark:bg-red-900/50 text-red-700 dark:text-red-300 flex items-center gap-2"><AlertCircle size={20}/> Error: {typeof aiError === 'string' ? aiError : JSON.stringify(aiError)}</div>}
        {aiResult && (
          <div className="mt-4 p-4 card theme-transition" id="ai-result-display">
            <h3 className="font-semibold text-lg mb-2 text-gray-700 dark:text-slate-200">AI Response:</h3>
            <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: aiResult.replace(/\n/g, '<br/>') /* Basic markdown, ideally use a library */ }}></div>
          </div>
        )}
      </div>
    );
  };

  const renderSettings = () => {
    return (
      <div id="settings-tab" className="p-4 md:p-6 space-y-8 fade-in">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Settings</h2>

        {/* Theme Settings */}
        <div className="card theme-transition p-4 md:p-6" id="settings-theme-toggle">
          <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-slate-200">Appearance</h3>
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-slate-300">Dark Mode</span>
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <span className="theme-toggle-thumb"></span>
            </button>
          </div>
        </div>

        {/* Data Management */}
        <div className="card theme-transition p-4 md:p-6" id="settings-data-management">
          <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-slate-200">Data Management</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-1 text-gray-600 dark:text-slate-300">Import Shipments (CSV)</h4>
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-2">Upload a CSV file to bulk import shipments. Ensure it matches the template format.</p>
              <div className="flex items-center gap-2">
                <input type="file" id="csv-upload" accept=".csv" onChange={handleImportShipments} className="hidden" />
                <label htmlFor="csv-upload" className="btn btn-secondary btn-responsive flex items-center gap-2 cursor-pointer"><Upload size={18}/> Upload CSV</label>
                <button onClick={getShipmentTemplateCSV} className="btn bg-gray-200 hover:bg-gray-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-200 btn-responsive flex items-center gap-2"><FileText size={18}/>Download Template</button>
              </div>
            </div>
            <hr className="dark:border-slate-700"/>
            <div>
              <h4 className="font-medium mb-1 text-gray-600 dark:text-slate-300">Export Data</h4>
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-2">Download all your application data (Shipments, Vehicles, Drivers, Customers) as a JSON file.</p>
              <button onClick={exportAllData} className="btn btn-secondary btn-responsive flex items-center gap-2"><Download size={18}/> Export All Data (JSON)</button>
            </div>
            <hr className="dark:border-slate-700"/>
            <div>
              <h4 className="font-medium mb-1 text-red-600 dark:text-red-400">Delete All Data</h4>
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-2">Permanently remove all data from the application. This action cannot be undone.</p>
              <button onClick={deleteAllData} className="btn bg-red-600 hover:bg-red-700 text-white btn-responsive flex items-center gap-2"><Trash2 size={18}/> Delete All Data</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Modal content rendering
  const renderModalContent = () => {
    if (!modalType) return null;
    
    const commonFields = (
      <>
        <div className="form-group">
          <label className="form-label" htmlFor="name">Name</label>
          <input id="name" type="text" className="input" {...register("name", { required: `${modalType} name is required` })} />
          {errors.name && <p className="form-error">{errors.name.message as string}</p>}
        </div>
      </>
    );

    switch (modalType) {
      case 'shipment':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label" htmlFor="origin">Origin</label>
                <input id="origin" type="text" className="input" {...register("origin", { required: "Origin is required" })} placeholder="e.g., 123 Main St, Anytown USA" />
                {errors.origin && <p className="form-error">{errors.origin.message as string}</p>}
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="destination">Destination</label>
                <input id="destination" type="text" className="input" {...register("destination", { required: "Destination is required" })} placeholder="e.g., 456 Oak Ave, Otherville USA" />
                {errors.destination && <p className="form-error">{errors.destination.message as string}</p>}
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="customerId">Customer</label>
                <select id="customerId" className="input" {...register("customerId", { required: "Customer is required" })}>
                  <option value="">Select Customer</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {errors.customerId && <p className="form-error">{errors.customerId.message as string}</p>}
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="status">Status</label>
                <select id="status" className="input" {...register("status", { required: "Status is required" })}>
                  {Object.values(ShipmentStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="priority">Priority</label>
                <select id="priority" className="input" {...register("priority", { required: "Priority is required" })}>
                  {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="assignedVehicleId">Assigned Vehicle</label>
                <select id="assignedVehicleId" className="input" {...register("assignedVehicleId")}>
                  <option value="">Select Vehicle (Optional)</option>
                  {vehicles.filter(v => v.status === VehicleStatus.AVAILABLE || v.id === editingItem?.['assignedVehicleId' as keyof typeof editingItem]).map(v => <option key={v.id} value={v.id}>{v.name} ({v.type})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="assignedDriverId">Assigned Driver</label>
                <select id="assignedDriverId" className="input" {...register("assignedDriverId")}>
                  <option value="">Select Driver (Optional)</option>
                  {drivers.filter(d => d.status === 'Active' || d.id === editingItem?.['assignedDriverId' as keyof typeof editingItem]).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="estimatedPickupDate">Estimated Pickup Date</label>
                <input id="estimatedPickupDate" type="date" className="input" {...register("estimatedPickupDate", { required: "Est. Pickup Date is required" })} />
                {errors.estimatedPickupDate && <p className="form-error">{errors.estimatedPickupDate.message as string}</p>}
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="estimatedDeliveryDate">Estimated Delivery Date</label>
                <input id="estimatedDeliveryDate" type="date" className="input" {...register("estimatedDeliveryDate", { required: "Est. Delivery Date is required" })} />
                {errors.estimatedDeliveryDate && <p className="form-error">{errors.estimatedDeliveryDate.message as string}</p>}
              </div>
              {editingItem && (
                  <>
                    <div className="form-group">
                        <label className="form-label" htmlFor="actualPickupDate">Actual Pickup Date</label>
                        <input id="actualPickupDate" type="date" className="input" {...register("actualPickupDate")} />
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="actualDeliveryDate">Actual Delivery Date</label>
                        <input id="actualDeliveryDate" type="date" className="input" {...register("actualDeliveryDate")} />
                    </div>
                  </>
              )}
            </div>
            
            <div className="form-group mt-4">
              <label className="form-label">Items</label>
              { (shipmentItemsForm || []).map((item: ShipmentItem, index: number) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-2 p-2 border dark:border-slate-700 rounded">
                  <input type="text" placeholder="Item Name" className="input input-sm" {...register(`items.${index}.name`, { required: true })} />
                  <input type="number" placeholder="Qty" className="input input-sm" {...register(`items.${index}.quantity`, { required: true, valueAsNumber: true, min: 1 })} />
                  <input type="number" placeholder="Weight (kg)" className="input input-sm" {...register(`items.${index}.weightKg`, { required: true, valueAsNumber: true, min: 0 })} />
                  <div className="flex items-center gap-2 col-span-1 md:col-span-1">
                    <input type="checkbox" id={`items.${index}.isFragile`} className="form-checkbox rounded text-primary-600 dark:bg-slate-700 dark:border-slate-600" {...register(`items.${index}.isFragile`)} />
                    <label htmlFor={`items.${index}.isFragile`} className="text-sm">Fragile</label>
                  </div>
                  <button type="button" onClick={() => {
                    const currentItems = shipmentItemsForm ? [...shipmentItemsForm] : [];
                    setValue("items", currentItems.filter((_, i) => i !== index));
                  }} className="btn btn-sm bg-red-500 hover:bg-red-600 text-white col-span-1">Remove</button>
                </div>
              ))}
              <button type="button" onClick={() => {
                const currentItems = shipmentItemsForm ? [...shipmentItemsForm] : [];
                setValue("items", [...currentItems, { name: '', quantity: 1, weightKg: 0, isFragile: false }]);
               }} className="btn btn-sm bg-green-500 hover:bg-green-600 text-white mt-1">Add Item</button>
            </div>

            <div className="form-group mt-2">
              <label className="form-label" htmlFor="notes">Notes</label>
              <textarea id="notes" className="input" {...register("notes")} rows={3}></textarea>
            </div>
          </>
        );
      case 'vehicle':
        return (
          <>
            {commonFields}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                    <label className="form-label" htmlFor="type">Vehicle Type</label>
                    <select id="type" className="input" {...register("type", { required: "Vehicle type is required" })}>
                        {Object.values(VehicleType).map(vt => <option key={vt} value={vt}>{vt}</option>)}
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-label" htmlFor="registrationNumber">Registration Number</label>
                    <input id="registrationNumber" type="text" className="input" {...register("registrationNumber", { required: "Registration number is required" })} />
                    {errors.registrationNumber && <p className="form-error">{errors.registrationNumber.message as string}</p>}
                </div>
                <div className="form-group">
                    <label className="form-label" htmlFor="capacityWeightKg">Capacity (Weight in kg)</label>
                    <input id="capacityWeightKg" type="number" className="input" {...register("capacityWeightKg", { required: "Capacity is required", valueAsNumber: true, min: 0 })} />
                    {errors.capacityWeightKg && <p className="form-error">{errors.capacityWeightKg.message as string}</p>}
                </div>
                 <div className="form-group">
                    <label className="form-label" htmlFor="capacityVolumeM3">Capacity (Volume in m³)</label>
                    <input id="capacityVolumeM3" type="number" className="input" {...register("capacityVolumeM3", { valueAsNumber: true, min: 0 })} />
                </div>
                <div className="form-group">
                    <label className="form-label" htmlFor="status-vehicle">Status</label>
                    <select id="status-vehicle" className="input" {...register("status", { required: "Status is required" })}>
                        {Object.values(VehicleStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                 <div className="form-group">
                    <label className="form-label" htmlFor="driverId">Assigned Driver</label>
                    <select id="driverId" className="input" {...register("driverId")}>
                        <option value="">Unassigned</option>
                        {drivers.filter(d => d.status === 'Active' || d.id === editingItem?.['driverId' as keyof typeof editingItem]).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                </div>
                 <div className="form-group">
                    <label className="form-label" htmlFor="fuelLevelPercent">Fuel Level (%)</label>
                    <input id="fuelLevelPercent" type="number" className="input" {...register("fuelLevelPercent", { valueAsNumber: true, min: 0, max: 100 })} />
                </div>
                <div className="form-group">
                    <label className="form-label" htmlFor="maintenanceDate">Next Maintenance</label>
                    <input id="maintenanceDate" type="date" className="input" {...register("maintenanceDate")} />
                </div>
            </div>
          </>
        );
      case 'driver':
        return (
          <>
            {commonFields}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                    <label className="form-label" htmlFor="licenseNumber">License Number</label>
                    <input id="licenseNumber" type="text" className="input" {...register("licenseNumber", { required: "License number is required" })} />
                    {errors.licenseNumber && <p className="form-error">{errors.licenseNumber.message as string}</p>}
                </div>
                <div className="form-group">
                    <label className="form-label" htmlFor="phone-driver">Phone</label>
                    <input id="phone-driver" type="tel" className="input" {...register("phone", { required: "Phone number is required" })} />
                    {errors.phone && <p className="form-error">{errors.phone.message as string}</p>}
                </div>
                <div className="form-group">
                    <label className="form-label" htmlFor="email-driver">Email (Optional)</label>
                    <input id="email-driver" type="email" className="input" {...register("email")} />
                </div>
                <div className="form-group">
                    <label className="form-label" htmlFor="status-driver">Status</label>
                    <select id="status-driver" className="input" {...register("status", { required: "Status is required" })}>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="On Leave">On Leave</option>
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-label" htmlFor="yearsOfExperience">Years of Experience</label>
                    <input id="yearsOfExperience" type="number" className="input" {...register("yearsOfExperience", { required: "Years of experience is required", valueAsNumber: true, min:0 })} />
                    {errors.yearsOfExperience && <p className="form-error">{errors.yearsOfExperience.message as string}</p>}
                </div>
                 <div className="form-group">
                    <label className="form-label" htmlFor="assignedVehicleId-driver">Assigned Vehicle</label>
                    <select id="assignedVehicleId-driver" className="input" {...register("assignedVehicleId")}>
                        <option value="">Unassigned</option>
                        {vehicles.filter(v => v.status === VehicleStatus.AVAILABLE || v.id === editingItem?.['assignedVehicleId' as keyof typeof editingItem]).map(v => <option key={v.id} value={v.id}>{v.name} ({v.type})</option>)}
                    </select>
                </div>
            </div>
          </>
        );
      case 'customer':
        return (
          <>
            {commonFields}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                    <label className="form-label" htmlFor="contactPerson">Contact Person</label>
                    <input id="contactPerson" type="text" className="input" {...register("contactPerson", { required: "Contact person is required" })} />
                    {errors.contactPerson && <p className="form-error">{errors.contactPerson.message as string}</p>}
                </div>
                <div className="form-group">
                    <label className="form-label" htmlFor="email-customer">Email</label>
                    <input id="email-customer" type="email" className="input" {...register("email", { required: "Email is required", pattern: {value: /^\S+@\S+$/i, message: "Invalid email format"} })} />
                    {errors.email && <p className="form-error">{errors.email.message as string}</p>}
                </div>
                <div className="form-group">
                    <label className="form-label" htmlFor="phone-customer">Phone</label>
                    <input id="phone-customer" type="tel" className="input" {...register("phone", { required: "Phone number is required" })} />
                    {errors.phone && <p className="form-error">{errors.phone.message as string}</p>}
                </div>
            </div>
            <div className="form-group">
                <label className="form-label" htmlFor="address">Address</label>
                <textarea id="address" className="input" {...register("address", { required: "Address is required" })} rows={2}></textarea>
                {errors.address && <p className="form-error">{errors.address.message as string}</p>}
            </div>
            <div className="form-group">
                <label className="form-label" htmlFor="notes-customer">Notes (Optional)</label>
                <textarea id="notes-customer" className="input" {...register("notes")} rows={2}></textarea>
            </div>
          </>
        );
      default:
        return null;
    }
  };
  
  // Main layout and navigation
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, tourId: 'dashboard-tab' },
    { id: 'shipments', label: 'Shipments', icon: Package, tourId: 'shipments-tab' },
    { id: 'vehicles', label: 'Vehicles', icon: Truck, tourId: 'vehicles-tab' },
    { id: 'drivers', label: 'Drivers', icon: User, tourId: 'drivers-tab' },
    { id: 'customers', label: 'Customers', icon: Users, tourId: 'customers-tab' },
    { id: 'ai_assistant', label: 'AI Assistant', icon: BrainCircuit, tourId: 'ai-assistant-tab' },
    { id: 'reports', label: 'Reports', icon: BarChart2, tourId: 'reports-tab' },
    { id: 'settings', label: 'Settings', icon: Settings, tourId: 'settings-tab' },
  ];

  // Detail View Modal for Shipment
  const [shipmentDetailModal, setShipmentDetailModal] = useState<{isOpen: boolean, shipment: Shipment | null}>({isOpen: false, shipment: null});

  const openShipmentDetailModal = (shipment: Shipment) => {
    setShipmentDetailModal({isOpen: true, shipment});
    document.body.classList.add('modal-open');
  };
  const closeShipmentDetailModal = () => {
    setShipmentDetailModal({isOpen: false, shipment: null});
    document.body.classList.remove('modal-open');
  };

  const RenderShipmentDetailModal = () => {
    if (!shipmentDetailModal.isOpen || !shipmentDetailModal.shipment) return null;
    const { shipment } = shipmentDetailModal;
    const customer = customers.find(c => c.id === shipment.customerId);
    const vehicle = vehicles.find(v => v.id === shipment.assignedVehicleId);
    const driver = drivers.find(d => d.id === shipment.assignedDriverId);

    // For Leaflet map
    // For simplicity, using fixed coordinates if origin/destination are known cities, otherwise a default.
    const getLocationCoords = (locationName: string): L.LatLngExpression => {
        const knownLocations: {[key: string]: L.LatLngExpression} = {
            "New York": [40.7128, -74.0060],
            "Chicago": [41.8781, -87.6298],
            "Los Angeles": [34.0522, -118.2437],
            "San Francisco": [37.7749, -122.4194],
        };
        // Try to find a match, case-insensitively
        const key = Object.keys(knownLocations).find(k => locationName.toLowerCase().includes(k.toLowerCase()));
        return key ? knownLocations[key] : defaultMapCenter;
    };
    
    const originCoords = shipment.origin ? getLocationCoords(shipment.origin) : defaultMapCenter;
    const destinationCoords = shipment.destination ? getLocationCoords(shipment.destination) : defaultMapCenter;
    const mapCenter = originCoords !== defaultMapCenter ? originCoords : destinationCoords !== defaultMapCenter ? destinationCoords : defaultMapCenter;

    return (
        <div className="modal-backdrop" onClick={closeShipmentDetailModal} id="shipment-detail-modal-backdrop">
            <div className="modal-content !max-w-3xl theme-transition" onClick={(e) => e.stopPropagation()} id="shipment-detail-modal-content">
                <div className="modal-header">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Shipment Details: {shipment.shipmentNumber}</h3>
                    <button onClick={closeShipmentDetailModal} className="text-gray-400 hover:text-gray-500 dark:text-slate-400 dark:hover:text-slate-300"><X size={24}/></button>
                </div>
                <div className="mt-4 space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Basic Info */}
                        <div className="card card-sm theme-transition">
                            <h4 className="font-semibold mb-2 text-gray-700 dark:text-slate-200">Basic Information</h4>
                            <p><strong>Status:</strong> <span className={`badge ${shipment.status === ShipmentStatus.DELIVERED ? 'badge-success' : 'badge-info'}`}>{shipment.status}</span></p>
                            <p><strong>Priority:</strong> <span className={`badge ${shipment.priority === Priority.URGENT ? 'badge-error' : 'badge-warning'}`}>{shipment.priority}</span></p>
                            <p><strong>Customer:</strong> {customer?.name || 'N/A'}</p>
                            <p><strong>Origin:</strong> {shipment.origin}</p>
                            <p><strong>Destination:</strong> {shipment.destination}</p>
                        </div>
                        {/* Dates */}
                        <div className="card card-sm theme-transition">
                             <h4 className="font-semibold mb-2 text-gray-700 dark:text-slate-200">Dates</h4>
                            <p><strong>Est. Pickup:</strong> {format(parseISO(shipment.estimatedPickupDate), 'MMM dd, yyyy')}</p>
                            <p><strong>Est. Delivery:</strong> {format(parseISO(shipment.estimatedDeliveryDate), 'MMM dd, yyyy')}</p>
                            {shipment.actualPickupDate && <p><strong>Actual Pickup:</strong> {format(parseISO(shipment.actualPickupDate), 'MMM dd, yyyy')}</p>}
                            {shipment.actualDeliveryDate && <p><strong>Actual Delivery:</strong> {format(parseISO(shipment.actualDeliveryDate), 'MMM dd, yyyy')}</p>}
                        </div>
                    </div>
                     {/* Assignment Info */}
                    <div className="card card-sm theme-transition">
                        <h4 className="font-semibold mb-2 text-gray-700 dark:text-slate-200">Assignment</h4>
                        <p><strong>Vehicle:</strong> {vehicle ? `${vehicle.name} (${vehicle.type})` : 'Not Assigned'}</p>
                        <p><strong>Driver:</strong> {driver?.name || 'Not Assigned'}</p>
                    </div>
                    {/* Items */}
                    <div className="card card-sm theme-transition">
                        <h4 className="font-semibold mb-2 text-gray-700 dark:text-slate-200">Items ({shipment.items.length}) - Total Weight: {shipment.totalWeightKg.toFixed(2)} kg</h4>
                        <ul className="list-disc list-inside text-sm space-y-1">
                            {shipment.items.map((item, idx) => (
                                <li key={idx}>{item.quantity}x {item.name} ({item.weightKg} kg each) {item.isFragile ? <span className="text-red-500">(Fragile)</span> : ''}</li>
                            ))}
                        </ul>
                    </div>
                    {/* Tracking History */}
                    {shipment.trackingHistory && shipment.trackingHistory.length > 0 && (
                        <div className="card card-sm theme-transition">
                            <h4 className="font-semibold mb-2 text-gray-700 dark:text-slate-200">Tracking History</h4>
                            <div className="max-h-48 overflow-y-auto">
                                {shipment.trackingHistory.slice().reverse().map((track, idx) => (
                                    <div key={idx} className={`py-2 ${idx < shipment.trackingHistory.length -1 ? 'border-b dark:border-slate-700' : ''}`}>
                                        <p className="text-sm"><strong>{track.status}</strong> - {format(parseISO(track.timestamp), 'MMM dd, yyyy HH:mm')}</p>
                                        {track.location && <p className="text-xs text-gray-500 dark:text-slate-400">Location: {track.location}</p>}
                                        {track.notes && <p className="text-xs text-gray-500 dark:text-slate-400">Notes: {track.notes}</p>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {/* Map */}
                    <div className="card card-sm theme-transition h-64 md:h-80" id="shipment-detail-map-container">
                        <h4 className="font-semibold mb-2 text-gray-700 dark:text-slate-200">Shipment Route Overview</h4>
                        <MapContainer center={mapCenter} zoom={defaultMapZoom} scrollWheelZoom={false} style={{ height: 'calc(100% - 2rem)' }} className="rounded">
                             <ChangeView center={mapCenter} zoom={defaultMapZoom} />
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            {shipment.origin && originCoords !== defaultMapCenter && <Marker position={originCoords}><Popup>Origin: {shipment.origin}</Popup></Marker>}
                            {shipment.destination && destinationCoords !== defaultMapCenter && <Marker position={destinationCoords}><Popup>Destination: {shipment.destination}</Popup></Marker>}
                        </MapContainer>
                    </div>
                    {/* Proof of Delivery */}
                    <div className="card card-sm theme-transition" id="shipment-detail-pod">
                        <h4 className="font-semibold mb-2 text-gray-700 dark:text-slate-200">Proof of Delivery</h4>
                        {shipment.proofOfDeliveryImage ? (
                            <img src={shipment.proofOfDeliveryImage} alt="Proof of Delivery" className="max-w-xs max-h-64 rounded shadow"/>
                        ) : (
                            <p className="text-sm text-gray-500 dark:text-slate-400">No image uploaded.</p>
                        )}
                        <button onClick={() => { closeShipmentDetailModal(); openCameraForShipment(shipment); }} className="btn btn-sm btn-secondary mt-2 flex items-center gap-1">
                            <LucideCamera size={16}/> {shipment.proofOfDeliveryImage ? 'Replace Image' : 'Upload Image'}
                        </button>
                    </div>
                </div>
                <div className="modal-footer">
                    <button onClick={() => { closeShipmentDetailModal(); openModal('shipment', shipment); }} className="btn btn-primary">Edit Shipment</button>
                    <button onClick={closeShipmentDetailModal} className="btn bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-200">Close</button>
                </div>
            </div>
        </div>
    )
  };

  // Sidebar rendering with hover effect for labels
  const renderSidebar = () => (
    <nav className={`w-16 hover:w-60 ${styles.sidebar} bg-slate-800 dark:bg-slate-900 text-white flex flex-col transition-all duration-300 ease-in-out shadow-lg group fixed inset-y-0 left-0 z-20`}>
      <div className="flex items-center justify-center h-16 border-b border-slate-700 dark:border-slate-800">
        <Truck size={28} className="text-primary-400 transition-transform duration-300 group-hover:rotate-[360deg]" />
        <span className={`ml-2 text-xl font-semibold ${styles.sidebarLabel} opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-100`}>{APP_NAME}</span>
      </div>
      <ul className="flex-grow mt-4 space-y-1">
        {navigationItems.map(item => (
          <li key={item.id} id={item.tourId}>
            <button
              onClick={() => setActiveTab(item.id)}
              title={item.label}
              className={`w-full flex items-center py-3 px-4 rounded-md transition-colors duration-200
                ${activeTab === item.id ? 'bg-primary-600 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}
                ${styles.sidebarItem}`}
            >
              <item.icon size={22} className="flex-shrink-0" />
              <span className={`ml-4 ${styles.sidebarLabel} opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-100 whitespace-nowrap`}>{item.label}</span>
            </button>
          </li>
        ))}
      </ul>
      <div className="p-4 border-t border-slate-700 dark:border-slate-800">
         <button
            onClick={logout}
            title="Logout"
            className={`w-full flex items-center py-3 px-4 rounded-md text-slate-300 hover:bg-red-600 hover:text-white transition-colors duration-200 ${styles.sidebarItem}`}
        >
            <LogOut size={22} className="flex-shrink-0" />
            <span className={`ml-4 ${styles.sidebarLabel} opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-100 whitespace-nowrap`}>Logout</span>
        </button>
      </div>
    </nav>
  );


  // App component return
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900" id="welcome_fallback">
        <div className="flex flex-col items-center">
          <Truck size={64} className="text-primary-500 animate-bounce" />
          <p className="mt-4 text-xl font-semibold text-gray-700 dark:text-slate-200">Loading {APP_NAME}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen bg-slate-100 dark:bg-slate-900 theme-transition-all ${styles.appContainer}`} id="welcome_fallback">
      {renderSidebar()}
      <div className={`flex-1 flex flex-col overflow-hidden ${styles.mainContentArea}`}>
        {/* Header */}
        <header className="bg-white dark:bg-slate-800 shadow-sm p-4 flex justify-between items-center theme-transition z-10" id="generation_issue_fallback">
          <h1 className="text-xl font-semibold text-gray-700 dark:text-slate-200 capitalize">
            {navigationItems.find(nav => nav.id === activeTab)?.label || APP_NAME}
          </h1>
          <div className="flex items-center gap-4">
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-300" title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            {currentUser && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300">
                <User size={18} />
                <span>{currentUser.first_name} {currentUser.last_name} ({currentUser.role})</span>
              </div>
            )}
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-0 bg-slate-50 dark:bg-slate-850 theme-transition">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'shipments' && renderShipments()}
          {activeTab === 'vehicles' && renderVehicles()}
          {activeTab === 'drivers' && renderDrivers()}
          {activeTab === 'customers' && renderCustomers()}
          {activeTab === 'ai_assistant' && renderAiAssistant()}
          {activeTab === 'reports' && renderReports()}
          {activeTab === 'settings' && renderSettings()}
        </main>

        {/* Footer */}
        <footer className="bg-white dark:bg-slate-800 text-center p-3 text-xs text-gray-500 dark:text-slate-400 border-t dark:border-slate-700 theme-transition">
          Copyright © {new Date().getFullYear()} Datavtar Private Limited. All rights reserved.
        </footer>
      </div>

      {/* Modal */}
      {isModalOpen && modalType && (
        <div className="modal-backdrop" onClick={closeModal} id={`${modalType}-modal-backdrop`}>
          <div className="modal-content !max-w-xl theme-transition" onClick={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => e.stopPropagation()} id={`${modalType}-modal-content`}>
            <form onSubmit={handleSubmit(handleSave)}>
              <div className="modal-header">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                  {editingItem ? 'Edit' : 'Add'} {modalType.charAt(0).toUpperCase() + modalType.slice(1)}
                </h3>
                <button type="button" onClick={closeModal} className="text-gray-400 hover:text-gray-500 dark:text-slate-400 dark:hover:text-slate-300"><X size={24}/></button>
              </div>
              <div className="mt-4 space-y-3 max-h-[65vh] overflow-y-auto pr-2">
                {renderModalContent()}
              </div>
              <div className="modal-footer mt-6">
                <button type="button" onClick={closeModal} className="btn bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-200">Cancel</button>
                <button type="submit" className="btn btn-primary flex items-center gap-2"><Save size={18}/> Save {modalType}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {RenderShipmentDetailModal()}


      {/* Confirmation Dialog */}
      {confirmationDialog?.isOpen && (
        <div className="modal-backdrop" id="confirmation-modal-backdrop">
          <div className="modal-content !max-w-md theme-transition" onClick={(e) => e.stopPropagation()} id="confirmation-modal-content">
            <div className="modal-header">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{confirmationDialog.title || "Confirm Action"}</h3>
               <button onClick={() => setConfirmationDialog(null)} className="text-gray-400 hover:text-gray-500 dark:text-slate-400 dark:hover:text-slate-300"><X size={24}/></button>
            </div>
            <p className="mt-2 text-sm text-gray-600 dark:text-slate-300">{confirmationDialog.message}</p>
            <div className="modal-footer mt-6">
              <button onClick={() => setConfirmationDialog(null)} className="btn bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-200">Cancel</button>
              <button onClick={confirmationDialog.onConfirm} className="btn btn-primary bg-red-600 hover:bg-red-700 focus:ring-red-500">Confirm</button>
            </div>
          </div>
        </div>
      )}
      
      {/* Camera Modal */}
        {showCamera && (
            <div className="modal-backdrop flex items-center justify-center" id="camera-modal-backdrop">
                <div className="modal-content !max-w-lg theme-transition p-4" onClick={e => e.stopPropagation()} id="camera-modal-content">
                    <div className="modal-header">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Take Photo for Shipment {shipmentForImage?.shipmentNumber}</h3>
                        <button onClick={() => setShowCamera(false)} className="text-gray-400 hover:text-gray-500 dark:text-slate-400 dark:hover:text-slate-300"><X size={24}/></button>
                    </div>
                    <div className="my-4 aspect-video bg-slate-200 dark:bg-slate-700 rounded overflow-hidden relative">
                        {capturedImage ? (
                            <img src={capturedImage} alt="Captured" className="w-full h-full object-contain" />
                        ) : (
                            <ReactCameraPro ref={cameraRef} aspectRatio="cover" errorMessages={{noCameraAccessible: "No camera found or permission denied."}}/>
                        )}
                    </div>
                     <div className="modal-footer flex-wrap justify-center">
                        {capturedImage ? (
                            <>
                                <button onClick={() => setCapturedImage(null)} className="btn btn-secondary flex items-center gap-1"><RotateCcw size={16}/> Retake</button>
                                <button onClick={handleSavePhotoToShipment} className="btn btn-primary flex items-center gap-1"><LucideImage size={16}/> Save Photo</button>
                            </>
                        ) : (
                            <button onClick={handleTakePhoto} className="btn btn-primary flex items-center gap-1"><LucideCamera size={16}/> Take Photo</button>
                        )}
                        {cameraRef.current && cameraRef.current.getNumberOfCameras() > 1 && !capturedImage && (
                            <button onClick={() => cameraRef.current?.switchCamera()} className="btn btn-secondary">Switch Camera</button>
                        )}
                    </div>
                </div>
            </div>
        )}


      {/* AI Layer (Headless) */}
      <AILayer
        ref={aiLayerRef}
        prompt={aiPrompt} // This is for the custom prompt, specific tasks use internally generated prompts
        onResult={(res) => setAiResult(res)}
        onError={(err) => setAiError(err)}
        onLoading={(loading) => setIsAiLoading(loading)}
      />
    </div>
  );
};

export default App;