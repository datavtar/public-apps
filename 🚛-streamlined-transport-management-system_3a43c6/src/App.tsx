import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { useAuth } from './contexts/authContext';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import {
  LayoutDashboard, Truck, Users, Map as MapIcon, FileText, Settings, PlusCircle, Edit3, Trash2, Search as SearchIcon, Filter as FilterIcon, ChevronUp, ChevronDown, Sun, Moon, LogOut, UploadCloud, DownloadCloud, File as FileIcon, Brain, RotateCcw, AlertCircle, CheckCircle, XCircle, ClipboardList, PackageSearch, Route as RouteIconLucide, FileSpreadsheet, ExternalLink, Save, Info, Eye, EyeOff, Lightbulb, Palette, CalendarDays, Clock, BarChart3, ArrowUpDown
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell as RechartsCell } from 'recharts';
import { format, parseISO, addDays, subDays, differenceInDays, parse } from 'date-fns';
import { useForm, SubmitHandler } from 'react-hook-form';

// Import styles
import styles from './styles/styles.module.css';

// Constants
const APP_NAME = "Datavtar TMS";
const LOCAL_STORAGE_KEY_PREFIX = "datavtar_tms_";
const TODAY_DATE = new Date(2025, 5, 5); // June 5, 2025

// Helper to get/set localStorage
const getLocalStorageItem = <T,>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}${key}`);
    return item ? (JSON.parse(item) as T) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage key "${key}":`, error);
    return defaultValue;
  }
};

const setLocalStorageItem = <T,>(key: string, value: T): void => {
  try {
    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}${key}`, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing to localStorage key "${key}":`, error);
  }
};

// Interfaces
interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

enum ShipmentStatus {
  PENDING = "Pending",
  IN_TRANSIT = "In Transit",
  DELIVERED = "Delivered",
  DELAYED = "Delayed",
  CANCELLED = "Cancelled"
}

interface ShipmentItem {
  name: string;
  quantity: number;
  unit: string;
}

interface Shipment extends BaseEntity {
  bolNumber: string;
  origin: string;
  destination: string;
  status: ShipmentStatus;
  estimatedDeliveryDate: string;
  actualDeliveryDate?: string;
  items: ShipmentItem[];
  vehicleId?: string;
  driverId?: string;
  notes?: string;
  customerName: string;
  customerContact: string;
  aiGeneratedDescription?: string;
  aiHandlingInstructions?: string;
}

enum VehicleStatus {
  AVAILABLE = "Available",
  IN_USE = "In Use",
  MAINTENANCE = "Maintenance",
  OUT_OF_SERVICE = "Out of Service"
}

enum VehicleType {
  TRUCK_SEMI = "Semi-Trailer Truck",
  TRUCK_BOX = "Box Truck",
  VAN_CARGO = "Cargo Van",
  FLATBED = "Flatbed Truck",
  REEFER = "Refrigerated Truck"
}

interface Vehicle extends BaseEntity {
  registrationNumber: string;
  type: VehicleType;
  capacityKg: number;
  status: VehicleStatus;
  currentLocation?: string;
  maintenanceDate?: string;
}

interface Driver extends BaseEntity {
  name: string;
  licenseNumber: string;
  contactPhone: string;
  contactEmail: string;
  assignedVehicleId?: string;
  status: 'Active' | 'Inactive' | 'On Leave';
}

interface Route extends BaseEntity {
  routeName: string;
  origin: string;
  destination: string;
  distanceKm: number;
  estimatedTimeHours: number;
  waypoints?: string[];
  notes?: string;
  aiPrimaryRouteSuggestion?: string;
  aiAlternativeRouteSuggestion?: string;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description?: string;
  id?: string;
}

type AppSection = "dashboard" | "shipments" | "vehicles" | "drivers" | "routes" | "reports" | "settings";

interface ModalState<T,> {
  isOpen: boolean;
  mode: 'add' | 'edit' | 'view' | 'confirmDelete' | 'ai' | 'import';
  data?: T;
  itemType?: string; // For generic delete confirmation
  title?: string; // For generic AI modal
  onConfirm?: () => void; // For generic delete confirmation
}

const initialShipmentFormValues: Partial<Shipment> = {
  bolNumber: '',
  origin: '',
  destination: '',
  status: ShipmentStatus.PENDING,
  estimatedDeliveryDate: format(TODAY_DATE, 'yyyy-MM-dd'),
  items: [{ name: '', quantity: 1, unit: 'pcs' }],
  customerName: '',
  customerContact: '',
  notes: '',
};

const initialVehicleFormValues: Partial<Vehicle> = {
  registrationNumber: '',
  type: VehicleType.TRUCK_BOX,
  capacityKg: 1000,
  status: VehicleStatus.AVAILABLE,
  currentLocation: '',
};

const initialDriverFormValues: Partial<Driver> = {
  name: '',
  licenseNumber: '',
  contactPhone: '',
  contactEmail: '',
  status: 'Active',
};

const initialRouteFormValues: Partial<Route> = {
  routeName: '',
  origin: '',
  destination: '',
  distanceKm: 0,
  estimatedTimeHours: 0,
  notes: '',
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

  const [activeSection, setActiveSection] = useState<AppSection>("dashboard");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Data states
  const [shipments, setShipments] = useState<Shipment[]>(() => getLocalStorageItem<Shipment[]>("shipments", []));
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => getLocalStorageItem<Vehicle[]>("vehicles", []));
  const [drivers, setDrivers] = useState<Driver[]>(() => getLocalStorageItem<Driver[]>("drivers", []));
  const [routes, setRoutes] = useState<Route[]>(() => getLocalStorageItem<Route[]>("routes", []));

  // Modal states
  const [shipmentModal, setShipmentModal] = useState<ModalState<Shipment,>>({ isOpen: false, mode: 'add' });
  const [vehicleModal, setVehicleModal] = useState<ModalState<Vehicle,>>({ isOpen: false, mode: 'add' });
  const [driverModal, setDriverModal] = useState<ModalState<Driver,>>({ isOpen: false, mode: 'add' });
  const [routeModal, setRouteModal] = useState<ModalState<Route,>>({ isOpen: false, mode: 'add' });
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean, title: string, message: string, onConfirm: () => void }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  const [importModal, setImportModal] = useState<{ isOpen: boolean, dataType: 'shipments' | 'vehicles' | 'drivers' | 'routes' | null }>({isOpen: false, dataType: null });
  const [importedFile, setImportedFile] = useState<File | null>(null);
  const [importError, setImportError] = useState<string | null>(null);


  // AI Layer states
  const aiLayerRef = useRef<AILayerHandle>(null);
  const [aiPromptText, setAiPromptText] = useState<string>("");
  const [aiSelectedFile, setAiSelectedFile] = useState<File | null>(null);
  const [aiResult, setAiResult] = useState<any | null>(null); // Changed from string to any for JSON
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [currentAiContext, setCurrentAiContext] = useState<{ type: 'shipmentDescription' | 'bolExtraction' | 'routeAdvisory', shipmentId?: string, routeId?: string, tempShipmentData?: Partial<Shipment> }>({ type: 'shipmentDescription' });


  // React Hook Form instances
  const shipmentForm = useForm<Shipment>({ defaultValues: initialShipmentFormValues });
  const vehicleForm = useForm<Vehicle>({ defaultValues: initialVehicleFormValues });
  const driverForm = useForm<Driver>({ defaultValues: initialDriverFormValues });
  const routeForm = useForm<Route>({ defaultValues: initialRouteFormValues });

  // Effect for dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  // Effects for saving data to localStorage
  useEffect(() => setLocalStorageItem("shipments", shipments), [shipments]);
  useEffect(() => setLocalStorageItem("vehicles", vehicles), [vehicles]);
  useEffect(() => setLocalStorageItem("drivers", drivers), [drivers]);
  useEffect(() => setLocalStorageItem("routes", routes), [routes]);

  // Close modal on ESC key
 useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (shipmentModal.isOpen) closeModal('shipment');
        if (vehicleModal.isOpen) closeModal('vehicle');
        if (driverModal.isOpen) closeModal('driver');
        if (routeModal.isOpen) closeModal('route');
        if (confirmModal.isOpen) setConfirmModal(prev => ({ ...prev, isOpen: false }));
        if (importModal.isOpen) setImportModal(prev => ({...prev, isOpen: false}));
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [shipmentModal.isOpen, vehicleModal.isOpen, driverModal.isOpen, routeModal.isOpen, confirmModal.isOpen, importModal.isOpen]);


  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  // Generic CRUD operations
  const addToList = <T extends BaseEntity,>(setter: React.Dispatch<React.SetStateAction<T[]>>, item: Omit<T, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newItem = {
      ...item,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as T;
    setter(prev => [...prev, newItem]);
  };

  const updateInList = <T extends BaseEntity,>(setter: React.Dispatch<React.SetStateAction<T[]>>, updatedItem: T) => {
    setter(prev => prev.map(item => item.id === updatedItem.id ? { ...updatedItem, updatedAt: new Date().toISOString() } : item));
  };

  const deleteFromList = <T extends BaseEntity,>(setter: React.Dispatch<React.SetStateAction<T[]>>, id: string) => {
    setter(prev => prev.filter(item => item.id !== id));
  };
  
  // Modal handlers
  const openModal = (type: 'shipment' | 'vehicle' | 'driver' | 'route', mode: ModalState<any,>['mode'], data?: any) => {
    const resetAndSetData = (form: any, initialValues: any) => {
      form.reset(mode === 'edit' || mode === 'view' ? data : initialValues);
    };
    if (type === 'shipment') {
      resetAndSetData(shipmentForm, initialShipmentFormValues);
      setShipmentModal({ isOpen: true, mode, data });
    }
    if (type === 'vehicle') {
      resetAndSetData(vehicleForm, initialVehicleFormValues);
      setVehicleModal({ isOpen: true, mode, data });
    }
    if (type === 'driver') {
      resetAndSetData(driverForm, initialDriverFormValues);
      setDriverModal({ isOpen: true, mode, data });
    }
    if (type === 'route') {
      resetAndSetData(routeForm, initialRouteFormValues);
      setRouteModal({ isOpen: true, mode, data });
    }
  };

  const closeModal = (type: 'shipment' | 'vehicle' | 'driver' | 'route' | 'confirm' | 'import') => {
    if (type === 'shipment') setShipmentModal({ isOpen: false, mode: 'add' });
    if (type === 'vehicle') setVehicleModal({ isOpen: false, mode: 'add' });
    if (type === 'driver') setDriverModal({ isOpen: false, mode: 'add' });
    if (type === 'route') setRouteModal({ isOpen: false, mode: 'add' });
    if (type === 'confirm') setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: () => {} });
    if (type === 'import') {
      setImportModal({ isOpen: false, dataType: null });
      setImportedFile(null);
      setImportError(null);
    }
    setAiResult(null);
    setAiError(null);
    setAiPromptText("");
    setAiSelectedFile(null);
  };
  
  const handleDeleteConfirmation = (id: string, itemType: string, deleteAction: () => void) => {
    setConfirmModal({
      isOpen: true,
      title: `Confirm Deletion`,
      message: `Are you sure you want to delete this ${itemType} (ID: ${id.substring(0,8)})? This action cannot be undone.`,
      onConfirm: () => {
        deleteAction();
        closeModal('confirm');
      }
    });
  };


  // Shipment specific logic
  const handleShipmentSubmit: SubmitHandler<Shipment> = (data) => {
    const dataToSave = { ...data };
    if(aiResult && currentAiContext.type === 'shipmentDescription' && shipmentModal.data?.id === currentAiContext.shipmentId) {
       dataToSave.aiGeneratedDescription = aiResult.description;
       dataToSave.aiHandlingInstructions = aiResult.handling_instructions;
    }

    if (shipmentModal.mode === 'add') {
      addToList(setShipments, dataToSave);
    } else if (shipmentModal.mode === 'edit' && shipmentModal.data) {
      updateInList(setShipments, { ...shipmentModal.data, ...dataToSave });
    }
    closeModal('shipment');
    shipmentForm.reset(initialShipmentFormValues);
    setAiResult(null);
  };

  const handleItemChange = (index: number, field: keyof ShipmentItem, value: string | number) => {
    const currentItems = shipmentForm.getValues('items') || [];
    const updatedItems = currentItems.map((item, i) => 
      i === index ? { ...item, [field]: field === 'quantity' ? Number(value) : value } : item
    );
    shipmentForm.setValue('items', updatedItems);
  };

  const addItemField = () => {
    const currentItems = shipmentForm.getValues('items') || [];
    shipmentForm.setValue('items', [...currentItems, { name: '', quantity: 1, unit: 'pcs' }]);
  };

  const removeItemField = (index: number) => {
    const currentItems = shipmentForm.getValues('items') || [];
    shipmentForm.setValue('items', currentItems.filter((_, i) => i !== index));
  };

  // AI Handlers
  const handleAiShipmentDescription = (shipmentData: Partial<Shipment>) => {
    const cargoInfo = shipmentData.items?.map(item => `${item.quantity} ${item.unit} of ${item.name}`).join(', ') || 'general cargo';
    const prompt = `Generate a detailed shipment description and special handling instructions for the following cargo: ${cargoInfo}. Consider it is moving from ${shipmentData.origin || 'unknown origin'} to ${shipmentData.destination || 'unknown destination'}. Return JSON with keys "description" (string) and "handling_instructions" (string).`;
    setAiPromptText(prompt);
    setAiSelectedFile(null);
    setCurrentAiContext({ type: 'shipmentDescription', shipmentId: shipmentData.id, tempShipmentData: shipmentData });
    setShipmentModal(prev => ({ ...prev, mode: 'ai', title: 'AI Shipment Details Generator' })); // Re-purpose modal for AI input/output
    aiLayerRef.current?.sendToAI(prompt);
  };
  
  const handleAiBolExtraction = (file: File) => {
    if (!file) {
      setAiError("Please select a BOL file to process.");
      return;
    }
    const prompt = `Analyze the attached Bill of Lading. Extract Shipper Name, Consignee Name, a list of items with their names and quantities, and the Bill of Lading number. Return JSON: {"shipper": string, "consignee": string, "items": Array<{"name": string, "quantity": number, "unit": string}>, "bol_number": string}. If a field is not found, return null for its value. For items, if unit is not specified, assume 'pcs'.`;
    setAiPromptText(prompt);
    setAiSelectedFile(file);
    setCurrentAiContext({ type: 'bolExtraction' });
    setShipmentModal(prev => ({ ...prev, mode: 'ai', title: 'AI BOL Data Extractor' }));
    aiLayerRef.current?.sendToAI(prompt, file);
  };

  const handleAiRouteAdvisory = (routeData: Partial<Route>) => {
    if (!routeData.origin || !routeData.destination) {
      setAiError("Origin and Destination are required for route advisory.");
      return;
    }
    const prompt = `Provide a textual advisory for a primary transport route and an alternative route from "${routeData.origin}" to "${routeData.destination}". Consider factors like shortest path, traffic patterns (mock), and potential road closures (mock). Return JSON: {"primary_route_suggestion": string, "alternative_route_suggestion": string}.`;
    setAiPromptText(prompt);
    setAiSelectedFile(null);
    setCurrentAiContext({ type: 'routeAdvisory', routeId: routeData.id });
    setRouteModal(prev => ({ ...prev, mode: 'ai', title: 'AI Route Advisor' }));
    aiLayerRef.current?.sendToAI(prompt);
  };

  useEffect(() => {
    if (aiResult && !isAiLoading) {
      if (currentAiContext.type === 'shipmentDescription' && shipmentModal.isOpen && shipmentModal.mode === 'ai') {
        shipmentForm.setValue('aiGeneratedDescription', aiResult.description || '');
        shipmentForm.setValue('aiHandlingInstructions', aiResult.handling_instructions || '');
      } else if (currentAiContext.type === 'bolExtraction' && shipmentModal.isOpen && shipmentModal.mode === 'ai') {
          shipmentForm.setValue('bolNumber', aiResult.bol_number || '');
          shipmentForm.setValue('customerName', aiResult.shipper || ''); // Assuming shipper is the customer for simplicity
          // Potentially update origin/destination if AI can infer it
          const items = (aiResult.items || []).map((item: any) => ({
            name: item.name || '',
            quantity: Number(item.quantity) || 1,
            unit: item.unit || 'pcs'
          }));
          shipmentForm.setValue('items', items.length > 0 ? items : [{ name: '', quantity: 1, unit: 'pcs' }]);
      } else if (currentAiContext.type === 'routeAdvisory' && routeModal.isOpen && routeModal.mode === 'ai') {
          routeForm.setValue('aiPrimaryRouteSuggestion', aiResult.primary_route_suggestion || '');
          routeForm.setValue('aiAlternativeRouteSuggestion', aiResult.alternative_route_suggestion || '');
      }
    }
  }, [aiResult, isAiLoading, currentAiContext, shipmentModal.isOpen, routeModal.isOpen, shipmentForm, routeForm]);
  

  // Filtered data for display
  const filterData = <T extends { [key: string]: any },>(data: T[], term: string): T[] => {
    if (!term) return data;
    const lowerCaseTerm = term.toLowerCase();
    return data.filter(item => 
      Object.values(item).some(value => 
        String(value).toLowerCase().includes(lowerCaseTerm)
      )
    );
  };

  const filteredShipments = filterData(shipments, searchTerm);
  const filteredVehicles = filterData(vehicles, searchTerm);
  const filteredDrivers = filterData(drivers, searchTerm);
  const filteredRoutes = filterData(routes, searchTerm);

  const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, description, id }) => (
    <div id={id} className="stat-card theme-transition-all">
      <div className="flex-between mb-2">
        <h3 className="stat-title">{title}</h3>
        <Icon className="w-6 h-6 text-primary-500" />
      </div>
      <p className="stat-value">{value}</p>
      {description && <p className="stat-desc mt-1">{description}</p>}
    </div>
  );
  
  const handleFileUploadForImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImportedFile(file);
      setImportError(null);
    }
  };

  const processImportedFile = () => {
    if (!importedFile || !importModal.dataType) {
      setImportError("No file selected or data type missing.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csvData = event.target?.result as string;
        const lines = csvData.split(/\r\n|\n/).filter(line => line.trim() !== '');
        if (lines.length < 2) throw new Error("CSV file must have a header and at least one data row.");
        
        const headers = lines[0].split(',').map(h => h.trim());
        const dataRows = lines.slice(1).map(line => {
          // Basic CSV parsing - does not handle commas within quoted fields
          const values = line.split(',');
          let obj: any = {};
          headers.forEach((header, index) => {
            obj[header] = values[index]?.trim() || "";
          });
          return obj;
        });

        let newItemsCount = 0;
        const now = new Date().toISOString();

        switch (importModal.dataType) {
          case 'shipments':
            const newShipments: Shipment[] = dataRows.map(row => {
              // Add validation and type conversion here
              const items = row.itemsString ? JSON.parse(row.itemsString) : [{name: "Default Item", quantity: 1, unit: "pcs"}];
              return {
                id: crypto.randomUUID(), createdAt: now, updatedAt: now,
                bolNumber: row.bolNumber || `BOL-${Math.random().toString(36).substring(2, 9)}`,
                origin: row.origin || "Unknown Origin",
                destination: row.destination || "Unknown Destination",
                status: (Object.values(ShipmentStatus).includes(row.status as ShipmentStatus) ? row.status : ShipmentStatus.PENDING) as ShipmentStatus,
                estimatedDeliveryDate: row.estimatedDeliveryDate || format(TODAY_DATE, 'yyyy-MM-dd'),
                items: items,
                customerName: row.customerName || "N/A",
                customerContact: row.customerContact || "N/A",
                vehicleId: row.vehicleId,
                driverId: row.driverId,
                notes: row.notes,
              };
            });
            setShipments(prev => [...prev, ...newShipments]);
            newItemsCount = newShipments.length;
            break;
          case 'vehicles':
            const newVehicles: Vehicle[] = dataRows.map(row => ({
              id: crypto.randomUUID(), createdAt: now, updatedAt: now,
              registrationNumber: row.registrationNumber || `VEH-${Math.random().toString(36).substring(2, 7)}`,
              type: (Object.values(VehicleType).includes(row.type as VehicleType) ? row.type : VehicleType.TRUCK_BOX) as VehicleType,
              capacityKg: parseInt(row.capacityKg) || 1000,
              status: (Object.values(VehicleStatus).includes(row.status as VehicleStatus) ? row.status : VehicleStatus.AVAILABLE) as VehicleStatus,
              currentLocation: row.currentLocation,
              maintenanceDate: row.maintenanceDate,
            }));
            setVehicles(prev => [...prev, ...newVehicles]);
            newItemsCount = newVehicles.length;
            break;
          // Add cases for drivers and routes similarly
          default: throw new Error("Invalid data type for import.");
        }
        alert(`${newItemsCount} new ${importModal.dataType} imported successfully!`);
        closeModal('import');

      } catch (e: any) {
        setImportError(`Failed to process CSV: ${e.message}. Ensure the file format is correct and matches the template.`);
        console.error("Import error:", e);
      }
    };
    reader.onerror = () => setImportError("Failed to read file.");
    reader.readAsText(importedFile);
  };

  const getCSVTemplateHeaders = (dataType: 'shipments' | 'vehicles' | 'drivers' | 'routes'): string => {
    switch (dataType) {
      case 'shipments': return "bolNumber,origin,destination,status,estimatedDeliveryDate,customerName,customerContact,itemsString,vehicleId,driverId,notes"; // itemsString as JSON string
      case 'vehicles': return "registrationNumber,type,capacityKg,status,currentLocation,maintenanceDate";
      case 'drivers': return "name,licenseNumber,contactPhone,contactEmail,status,assignedVehicleId";
      case 'routes': return "routeName,origin,destination,distanceKm,estimatedTimeHours,notes,waypointsString"; // waypointsString as JSON array string
      default: return "";
    }
  };

  const downloadCSVTemplate = (dataType: 'shipments' | 'vehicles' | 'drivers' | 'routes') => {
    const headers = getCSVTemplateHeaders(dataType);
    if (!headers) return;
    
    let exampleRow = "";
    if (dataType === 'shipments') exampleRow = `SHIP001,New York,Los Angeles,Pending,${format(addDays(TODAY_DATE, 7), 'yyyy-MM-dd')},John Doe,555-1234,"[{""name"":""Electronics"",""quantity"":10,""unit"":""boxes""},{""name"":""Books"",""quantity"":50,""unit"":""pcs""}]",VEH001,DRV001,Handle with care`;
    if (dataType === 'vehicles') exampleRow = `XYZ-123,Box Truck,5000,Available,Warehouse A,${format(addDays(TODAY_DATE, 30), 'yyyy-MM-dd')}`;
    // Add example rows for drivers and routes

    const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + (exampleRow ? exampleRow + "\n" : "");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${dataType}_template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const exportDataToCSV = (dataType: 'shipments' | 'vehicles' | 'drivers' | 'routes' | 'all') => {
    let dataToExport: any[] = [];
    let filename = `${dataType}_export_${format(TODAY_DATE, 'yyyyMMdd')}.csv`;
    let headers = "";

    const generateCsv = (data: any[], currentHeaders: string) => {
        if (data.length === 0) return "";
        const replacer = (key: string, value: any) => value === null || value === undefined ? '' : value; // Handle null/undefined
        const rows = data.map(row => currentHeaders.split(',').map(fieldName => JSON.stringify(row[fieldName.trim()], replacer)).join(','));
        return [currentHeaders, ...rows].join('\r\n');
    };
    
    if (dataType === 'shipments' || dataType === 'all') {
        headers = getCSVTemplateHeaders('shipments');
        const shipmentsCsv = generateCsv(shipments.map(s => ({...s, itemsString: JSON.stringify(s.items)})), headers);
        if (dataType !== 'all') dataToExport.push({filename: `shipments_export.csv`, content: shipmentsCsv}); else dataToExport.push(shipmentsCsv);
    }
    if (dataType === 'vehicles' || dataType === 'all') {
        headers = getCSVTemplateHeaders('vehicles');
        const vehiclesCsv = generateCsv(vehicles, headers);
        if (dataType !== 'all') dataToExport.push({filename: `vehicles_export.csv`, content: vehiclesCsv}); else dataToExport.push(vehiclesCsv);
    }
    // Add drivers and routes similarly

    if (dataType === 'all') {
        // For 'all', we might zip files or provide multiple downloads. Simple approach: combine into one text or just export shipments.
        // For now, 'all' will just export shipments as an example. A better 'all' would be a ZIP.
        filename = `tms_all_data_export_${format(TODAY_DATE, 'yyyyMMdd')}.csv`; // This needs more thought for multiple types.
        // Let's export shipments only for 'all' for brevity
        headers = getCSVTemplateHeaders('shipments');
        const allDataCsv = generateCsv(shipments.map(s => ({...s, itemsString: JSON.stringify(s.items)})), headers);
        dataToExport = [{ filename, content: allDataCsv }];
    }


    dataToExport.forEach(exportFile => {
        if (!exportFile.content) {
            alert(`No data to export for ${exportFile.filename.split('_')[0]}.`);
            return;
        }
        const csvContent = "data:text/csv;charset=utf-8," + exportFile.content;
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", exportFile.filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
  };

  const clearAllData = () => {
    setConfirmModal({
      isOpen: true,
      title: "Confirm Clear All Data",
      message: "Are you sure you want to delete ALL data (Shipments, Vehicles, Drivers, Routes)? This action is irreversible.",
      onConfirm: () => {
        setShipments([]);
        setVehicles([]);
        setDrivers([]);
        setRoutes([]);
        localStorage.removeItem(`${LOCAL_STORAGE_KEY_PREFIX}shipments`);
        localStorage.removeItem(`${LOCAL_STORAGE_KEY_PREFIX}vehicles`);
        localStorage.removeItem(`${LOCAL_STORAGE_KEY_PREFIX}drivers`);
        localStorage.removeItem(`${LOCAL_STORAGE_KEY_PREFIX}routes`);
        alert("All application data has been cleared.");
        closeModal('confirm');
      }
    });
  };
  

  // Dashboard data
  const shipmentStatusCounts = shipments.reduce((acc, s) => {
    acc[s.status] = (acc[s.status] || 0) + 1;
    return acc;
  }, {} as Record<ShipmentStatus, number>);

  const dashboardChartData = Object.entries(shipmentStatusCounts).map(([name, value]) => ({ name, value }));
  const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const recentActivity = [...shipments, ...vehicles, ...drivers, ...routes]
    .sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const renderDashboard = () => (
    <div className="space-y-6 p-4 md:p-6">
      <h2 id="dashboard-title" className="text-2xl font-semibold text-gray-800 dark:text-white">Dashboard Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard id="stat-total-shipments" title="Total Shipments" value={shipments.length} icon={Truck} description={`${shipments.filter(s=>s.status === ShipmentStatus.IN_TRANSIT).length} in transit`} />
        <StatCard id="stat-total-vehicles" title="Total Vehicles" value={vehicles.length} icon={PackageSearch} description={`${vehicles.filter(v=>v.status === VehicleStatus.AVAILABLE).length} available`} />
        <StatCard id="stat-total-drivers" title="Total Drivers" value={drivers.length} icon={Users} description={`${drivers.filter(d=>d.status === 'Active').length} active`} />
        <StatCard id="stat-total-routes" title="Defined Routes" value={routes.length} icon={RouteIconLucide} description="Managed transport paths" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card card-responsive" id="shipment-status-chart">
          <h3 className="text-lg font-medium mb-4">Shipment Status Distribution</h3>
          {dashboardChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie data={dashboardChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {dashboardChartData.map((entry, index) => (
                    <RechartsCell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-500 dark:text-gray-400">No shipment data available for chart.</p>}
        </div>
        <div className="card card-responsive" id="recent-activity-log">
            <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
            {recentActivity.length > 0 ? (
              <ul className="space-y-3">
                {recentActivity.map(activity => (
                  <li key={activity.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-slate-700 rounded-md">
                    <div>
                      <p className="text-sm font-medium">
                        {(activity as Shipment).bolNumber ? `Shipment ${(activity as Shipment).bolNumber.substring(0,8)}` : 
                         (activity as Vehicle).registrationNumber ? `Vehicle ${(activity as Vehicle).registrationNumber}` :
                         (activity as Driver).name ? `Driver ${(activity as Driver).name}` : 
                         (activity as Route).routeName ? `Route ${(activity as Route).routeName}` : 'Item'} updated
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {format(parseISO(activity.updatedAt), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                    <span className={`badge ${
                      (activity as Shipment).status === ShipmentStatus.DELIVERED ? 'badge-success' :
                      (activity as Shipment).status === ShipmentStatus.DELAYED ? 'badge-warning' :
                      (activity as Vehicle).status === VehicleStatus.MAINTENANCE ? 'badge-info' :
                      'badge-info'
                    }`}>
                      {(activity as Shipment).status || (activity as Vehicle).status || (activity as Driver).status || 'Updated'}
                    </span>
                  </li>
                ))}
              </ul>
            ) : <p className="text-gray-500 dark:text-gray-400">No recent activity.</p>}
        </div>
      </div>
    </div>
  );
  
  const renderSectionHeader = (title: string, addAction: () => void, tourId: string) => (
    <div className="flex-between mb-4 p-4 md:p-0">
      <h2 className="text-xl md:text-2xl font-semibold text-gray-800 dark:text-white">{title}</h2>
      <button id={tourId} onClick={addAction} className="btn btn-primary flex-center gap-2">
        <PlusCircle size={18} /> Add New
      </button>
    </div>
  );

  const renderShipments = () => (
    <div className="p-4 md:p-6">
      {renderSectionHeader("Manage Shipments", () => { shipmentForm.reset(initialShipmentFormValues); openModal('shipment', 'add');}, "add-shipment-button")}
      <div className="table-container">
        <table className="table">
          <thead className="table-header">
            <tr>
              <th className="table-cell">BOL#</th>
              <th className="table-cell">Origin</th>
              <th className="table-cell">Destination</th>
              <th className="table-cell">Status</th>
              <th className="table-cell">Est. Delivery</th>
              <th className="table-cell">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredShipments.map(s => (
              <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                <td className="table-cell font-medium">{s.bolNumber}</td>
                <td className="table-cell">{s.origin}</td>
                <td className="table-cell">{s.destination}</td>
                <td className="table-cell"><span className={`badge ${s.status === ShipmentStatus.DELIVERED ? 'badge-success' : s.status === ShipmentStatus.PENDING ? 'badge-warning' : s.status === ShipmentStatus.IN_TRANSIT ? 'badge-info' : 'badge-error'}`}>{s.status}</span></td>
                <td className="table-cell">{format(parseISO(s.estimatedDeliveryDate), 'MMM d, yyyy')}</td>
                <td className="table-cell space-x-2">
                  <button onClick={() => openModal('shipment', 'edit', s)} className="btn btn-sm bg-blue-500 hover:bg-blue-600 text-white" aria-label={`Edit shipment ${s.bolNumber}`}><Edit3 size={16}/></button>
                  <button onClick={() => handleDeleteConfirmation(s.id, 'shipment', () => deleteFromList(setShipments, s.id))} className="btn btn-sm bg-red-500 hover:bg-red-600 text-white" aria-label={`Delete shipment ${s.bolNumber}`}><Trash2 size={16}/></button>
                  <button onClick={() => openModal('shipment', 'view', s)} className="btn btn-sm bg-gray-500 hover:bg-gray-600 text-white" aria-label={`View shipment ${s.bolNumber}`}><Eye size={16}/></button>
                </td>
              </tr>
            ))}
            {filteredShipments.length === 0 && <tr><td colSpan={6} className="table-cell text-center">No shipments found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderVehicles = () => (
    <div className="p-4 md:p-6">
      {renderSectionHeader("Manage Vehicles", () => { vehicleForm.reset(initialVehicleFormValues); openModal('vehicle', 'add'); }, "add-vehicle-button")}
       <div className="table-container">
        <table className="table">
          <thead className="table-header">
            <tr>
              <th className="table-cell">Reg. Number</th>
              <th className="table-cell">Type</th>
              <th className="table-cell">Capacity (kg)</th>
              <th className="table-cell">Status</th>
              <th className="table-cell">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredVehicles.map(v => (
              <tr key={v.id} className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                <td className="table-cell font-medium">{v.registrationNumber}</td>
                <td className="table-cell">{v.type}</td>
                <td className="table-cell">{v.capacityKg}</td>
                <td className="table-cell"><span className={`badge ${v.status === VehicleStatus.AVAILABLE ? 'badge-success' : v.status === VehicleStatus.IN_USE ? 'badge-info' : 'badge-warning'}`}>{v.status}</span></td>
                <td className="table-cell space-x-2">
                  <button onClick={() => openModal('vehicle', 'edit', v)} className="btn btn-sm bg-blue-500 hover:bg-blue-600 text-white" aria-label={`Edit vehicle ${v.registrationNumber}`}><Edit3 size={16}/></button>
                  <button onClick={() => handleDeleteConfirmation(v.id, 'vehicle', () => deleteFromList(setVehicles, v.id))} className="btn btn-sm bg-red-500 hover:bg-red-600 text-white" aria-label={`Delete vehicle ${v.registrationNumber}`}><Trash2 size={16}/></button>
                </td>
              </tr>
            ))}
             {filteredVehicles.length === 0 && <tr><td colSpan={5} className="table-cell text-center">No vehicles found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderDrivers = () => (
    <div className="p-4 md:p-6">
      {renderSectionHeader("Manage Drivers", () => { driverForm.reset(initialDriverFormValues); openModal('driver', 'add'); }, "add-driver-button")}
      <div className="table-container">
        <table className="table">
          <thead className="table-header">
            <tr>
              <th className="table-cell">Name</th>
              <th className="table-cell">License No.</th>
              <th className="table-cell">Contact</th>
              <th className="table-cell">Status</th>
              <th className="table-cell">Assigned Vehicle</th>
              <th className="table-cell">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDrivers.map(d => (
              <tr key={d.id} className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                <td className="table-cell font-medium">{d.name}</td>
                <td className="table-cell">{d.licenseNumber}</td>
                <td className="table-cell">{d.contactPhone}</td>
                <td className="table-cell"><span className={`badge ${d.status === 'Active' ? 'badge-success' : 'badge-warning'}`}>{d.status}</span></td>
                <td className="table-cell">{vehicles.find(v => v.id === d.assignedVehicleId)?.registrationNumber || 'N/A'}</td>
                <td className="table-cell space-x-2">
                  <button onClick={() => openModal('driver', 'edit', d)} className="btn btn-sm bg-blue-500 hover:bg-blue-600 text-white" aria-label={`Edit driver ${d.name}`}><Edit3 size={16}/></button>
                  <button onClick={() => handleDeleteConfirmation(d.id, 'driver', () => deleteFromList(setDrivers, d.id))} className="btn btn-sm bg-red-500 hover:bg-red-600 text-white" aria-label={`Delete driver ${d.name}`}><Trash2 size={16}/></button>
                </td>
              </tr>
            ))}
            {filteredDrivers.length === 0 && <tr><td colSpan={6} className="table-cell text-center">No drivers found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderRoutes = () => (
    <div className="p-4 md:p-6">
      {renderSectionHeader("Manage Routes", () => { routeForm.reset(initialRouteFormValues); openModal('route', 'add'); }, "add-route-button")}
      <div className="table-container">
        <table className="table">
          <thead className="table-header">
            <tr>
              <th className="table-cell">Route Name</th>
              <th className="table-cell">Origin</th>
              <th className="table-cell">Destination</th>
              <th className="table-cell">Distance (km)</th>
              <th className="table-cell">Est. Time (hrs)</th>
              <th className="table-cell">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRoutes.map(r => (
              <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                <td className="table-cell font-medium">{r.routeName}</td>
                <td className="table-cell">{r.origin}</td>
                <td className="table-cell">{r.destination}</td>
                <td className="table-cell">{r.distanceKm}</td>
                <td className="table-cell">{r.estimatedTimeHours}</td>
                <td className="table-cell space-x-2">
                  <button onClick={() => openModal('route', 'edit', r)} className="btn btn-sm bg-blue-500 hover:bg-blue-600 text-white" aria-label={`Edit route ${r.routeName}`}><Edit3 size={16}/></button>
                  <button onClick={() => handleDeleteConfirmation(r.id, 'route', () => deleteFromList(setRoutes, r.id))} className="btn btn-sm bg-red-500 hover:bg-red-600 text-white" aria-label={`Delete route ${r.routeName}`}><Trash2 size={16}/></button>
                  <button onClick={() => handleAiRouteAdvisory(r)} className="btn btn-sm bg-purple-500 hover:bg-purple-600 text-white flex items-center gap-1" aria-label={`Get AI route advisory for ${r.routeName}`}><Lightbulb size={16}/> AI Advisory</button>
                </td>
              </tr>
            ))}
            {filteredRoutes.length === 0 && <tr><td colSpan={6} className="table-cell text-center">No routes found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
  
  const renderReports = () => {
    const shipmentsByMonth = shipments.reduce((acc, s) => {
      const month = format(parseISO(s.createdAt), 'yyyy-MM');
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const shipmentsByMonthData = Object.entries(shipmentsByMonth)
      .map(([name, value]) => ({ name, shipments: value }))
      .sort((a,b) => a.name.localeCompare(b.name));

    const vehicleUtilization = vehicles.map(v => ({
        name: v.registrationNumber,
        status: v.status,
        daysInUse: shipments.filter(s => s.vehicleId === v.id && s.status === ShipmentStatus.IN_TRANSIT).length * 5 // Mock calculation
    }));
    const vehicleStatusCounts = vehicles.reduce((acc, v) => {
        acc[v.status] = (acc[v.status] || 0) + 1;
        return acc;
    }, {} as Record<VehicleStatus, number>);
    const vehicleStatusData = Object.entries(vehicleStatusCounts).map(([name, value]) => ({name, count: value}));


    return (
        <div className="p-4 md:p-6 space-y-6">
            <h2 id="reports-title" className="text-2xl font-semibold text-gray-800 dark:text-white">Reports & Analytics</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card card-responsive" id="shipments-over-time-chart">
                    <h3 className="text-lg font-medium mb-4">Shipments Over Time</h3>
                    {shipmentsByMonthData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={shipmentsByMonthData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="shipments" fill="var(--color-primary-500, #3b82f6)" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : <p className="text-gray-500 dark:text-gray-400">No shipment data to display trends.</p>}
                </div>
                <div className="card card-responsive" id="vehicle-status-chart">
                    <h3 className="text-lg font-medium mb-4">Vehicle Status Overview</h3>
                    {vehicleStatusData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                             <RechartsPieChart>
                                <Pie data={vehicleStatusData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                {vehicleStatusData.map((entry, index) => (
                                    <RechartsCell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </RechartsPieChart>
                        </ResponsiveContainer>
                    ) : <p className="text-gray-500 dark:text-gray-400">No vehicle data for status overview.</p>}
                </div>
            </div>
             <div className="card card-responsive" id="vehicle-utilization-table">
                <h3 className="text-lg font-medium mb-4">Vehicle Utilization (Mock Data)</h3>
                <div className="table-container">
                    <table className="table">
                        <thead className="table-header">
                            <tr>
                                <th className="table-cell">Vehicle Reg#</th>
                                <th className="table-cell">Status</th>
                                <th className="table-cell">Days In Use (Est.)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vehicleUtilization.slice(0,5).map(v => ( // Show top 5 for brevity
                                <tr key={v.name}>
                                    <td className="table-cell">{v.name}</td>
                                    <td className="table-cell">{v.status}</td>
                                    <td className="table-cell">{v.daysInUse}</td>
                                </tr>
                            ))}
                            {vehicleUtilization.length === 0 && <tr><td colSpan={3} className="table-cell text-center">No vehicle utilization data.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
  };


  const renderSettings = () => (
    <div className="p-4 md:p-6 space-y-8" id="generation_issue_fallback">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Application Settings</h2>
      
      <div className="card card-responsive" id="theme-settings-section">
        <h3 className="text-lg font-medium mb-4">Theme Settings</h3>
        <div className="flex items-center space-x-2">
          <Sun className="text-yellow-500" />
          <button
            onClick={toggleDarkMode}
            className="theme-toggle"
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            id="theme-toggle-button"
          >
            <span className="theme-toggle-thumb"></span>
          </button>
          <Moon className="text-indigo-500" />
          <span className="text-sm text-gray-600 dark:text-gray-300">{isDarkMode ? 'Dark Mode' : 'Light Mode'}</span>
        </div>
      </div>

      <div className="card card-responsive" id="data-management-section">
        <h3 className="text-lg font-medium mb-4">Data Management</h3>
        <div className="space-y-4">
            <h4 className="font-medium text-gray-700 dark:text-gray-200">Import Data (CSV)</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['shipments', 'vehicles', 'drivers', 'routes'] as const).map(type => (
                    <div key={type} className="space-y-1">
                        <button 
                            id={`import-${type}-button`}
                            onClick={() => setImportModal({isOpen: true, dataType: type})}
                            className="btn btn-secondary w-full flex items-center justify-center gap-2">
                            <UploadCloud size={16}/> Import {type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                        <button 
                            onClick={() => downloadCSVTemplate(type)}
                            className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 underline w-full text-center">
                            Download Template
                        </button>
                    </div>
                ))}
            </div>

            <h4 className="font-medium text-gray-700 dark:text-gray-200">Export Data (CSV)</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {(['shipments', 'vehicles', 'drivers', 'routes', 'all'] as const).map(type => (
                     <button 
                        key={type}
                        id={`export-${type}-button`}
                        onClick={() => exportDataToCSV(type)}
                        className="btn btn-secondary w-full flex items-center justify-center gap-2">
                        <DownloadCloud size={16}/> Export {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                ))}
            </div>
           
            <div>
                <h4 className="font-medium text-red-600 dark:text-red-400">Danger Zone</h4>
                 <button 
                    id="clear-all-data-button"
                    onClick={clearAllData}
                    className="btn bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto flex items-center justify-center gap-2">
                    <Trash2 size={16}/> Clear All Application Data
                </button>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">This will permanently delete all shipments, vehicles, drivers, and routes.</p>
            </div>
        </div>
      </div>
      
      <div className="card card-responsive">
        <h3 className="text-lg font-medium mb-4">AI Feature Information</h3>
        <div className="alert alert-info">
            <Info size={20}/>
            <p className="text-sm">AI-powered features in this application (like shipment description generation, BOL extraction, and route advisory) use language models that can sometimes make mistakes or provide inaccurate information. Always review AI-generated content before relying on it for critical decisions. Your inputs may be used to improve AI services as per provider policies.</p>
        </div>
      </div>
    </div>
  );
  
  const navItems: { name: AppSection, label: string, icon: React.ElementType, tourId: string }[] = [
    { name: "dashboard", label: "Dashboard", icon: LayoutDashboard, tourId: "dashboard-tab"},
    { name: "shipments", label: "Shipments", icon: ClipboardList, tourId: "shipments-tab"},
    { name: "vehicles", label: "Vehicles", icon: Truck, tourId: "vehicles-tab"},
    { name: "drivers", label: "Drivers", icon: Users, tourId: "drivers-tab"},
    { name: "routes", label: "Routes", icon: RouteIconLucide, tourId: "routes-tab"},
    { name: "reports", label: "Reports", icon: BarChart3, tourId: "reports-tab"},
    { name: "settings", label: "Settings", icon: Settings, tourId: "settings-tab"},
  ];

  const renderActiveSection = () => {
    switch (activeSection) {
      case "dashboard": return renderDashboard();
      case "shipments": return renderShipments();
      case "vehicles": return renderVehicles();
      case "drivers": return renderDrivers();
      case "routes": return renderRoutes();
      case "reports": return renderReports();
      case "settings": return renderSettings();
      default: return <div className="p-6">Select a section</div>;
    }
  };

  // Main application structure
  return (
    <div className={`flex h-screen bg-gray-100 dark:bg-slate-900 theme-transition-all`} id="welcome_fallback">
      {/* Sidebar */}
      <aside className="w-16 md:w-64 bg-white dark:bg-slate-800 p-2 md:p-4 space-y-2 md:space-y-4 shadow-lg theme-transition-all flex flex-col">
        <div className="text-primary-600 dark:text-primary-400 font-bold text-xl md:text-2xl p-2 md:p-0 flex items-center gap-2 justify-center md:justify-start">
          <Truck size={24} className="md:w-8 md:h-8"/>
          <span className="hidden md:inline">{APP_NAME}</span>
        </div>
        <nav className="flex-grow">
          <ul className="space-y-1 md:space-y-2">
            {navItems.map(item => (
              <li key={item.name}>
                <button
                  id={item.tourId}
                  onClick={() => setActiveSection(item.name)}
                  title={item.label}
                  className={`w-full flex items-center space-x-3 p-2 md:p-3 rounded-md hover:bg-primary-100 dark:hover:bg-primary-700 hover:text-primary-600 dark:hover:text-white transition-colors group
                    ${activeSection === item.name ? 'bg-primary-500 text-white dark:bg-primary-600' : 'text-gray-600 dark:text-gray-300'}`}
                >
                  <item.icon size={20} className={`group-hover:scale-110 transition-transform ${activeSection === item.name ? 'text-white' : 'text-gray-500 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-white'}`} />
                  <span className="hidden md:inline text-sm font-medium">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-auto p-2 border-t border-gray-200 dark:border-slate-700">
            <button
                onClick={logout}
                className="w-full flex items-center space-x-3 p-2 md:p-3 rounded-md text-gray-600 dark:text-gray-300 hover:bg-red-100 dark:hover:bg-red-700 hover:text-red-600 dark:hover:text-white transition-colors group"
                id="logout-button"
            >
                <LogOut size={20} className="group-hover:text-red-600 dark:group-hover:text-white" />
                <span className="hidden md:inline text-sm font-medium">Logout</span>
            </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-slate-800 shadow-sm p-4 flex-between theme-transition-all">
          <div className="flex items-center">
             <input
                type="search"
                placeholder="Search (e.g., BOL, Reg#, Name...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input input-responsive w-full max-w-xs md:max-w-sm hidden sm:block"
                aria-label="Search application content"
              />
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-700 dark:text-gray-300 hidden sm:block">
              Welcome, <span className="font-medium">{currentUser?.first_name || currentUser?.username}</span>
            </div>
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              id="header-theme-toggle"
            >
              {isDarkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-indigo-500" />}
            </button>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-x-hidden overflow-y-auto theme-transition-bg text-gray-800 dark:text-gray-100">
          {renderActiveSection()}
        </div>
        
        {/* Footer */}
        <footer className="text-center p-4 text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 theme-transition-all">
          Copyright © {new Date().getFullYear()} Datavtar Private Limited. All rights reserved.
        </footer>
      </main>

      {/* Modals */}
      {/* Shipment Modal */}
      {(shipmentModal.isOpen) && (
        <div className="modal-backdrop" onClick={() => closeModal('shipment')}>
          <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium">{shipmentModal.mode === 'ai' ? shipmentModal.title : `${shipmentModal.mode === 'add' ? 'Add New' : shipmentModal.mode === 'edit' ? 'Edit' : 'View'} Shipment`}</h3>
              <button onClick={() => closeModal('shipment')} className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400">&times;</button>
            </div>
            
            {shipmentModal.mode === 'ai' && currentAiContext.type === 'bolExtraction' && (
              <div className="form-group">
                <label htmlFor="bolFile" className="form-label">Upload Bill of Lading (Text File)</label>
                <input type="file" id="bolFile" accept=".txt,.csv" onChange={(e) => e.target.files?.[0] && handleAiBolExtraction(e.target.files[0])} className="input" />
                {isAiLoading && <p className="text-sm text-blue-500 mt-2">AI is processing the document...</p>}
                {aiError && <p className="form-error mt-2">{aiError}</p>}
              </div>
            )}

            {(shipmentModal.mode === 'add' || shipmentModal.mode === 'edit' || (shipmentModal.mode === 'ai' && aiResult)) && (
            <form onSubmit={shipmentForm.handleSubmit(handleShipmentSubmit)} className="space-y-4 mt-4 max-h-[60vh] overflow-y-auto pr-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-group">
                        <label htmlFor="bolNumber" className="form-label">BOL Number</label>
                        <input id="bolNumber" {...shipmentForm.register("bolNumber", { required: "BOL Number is required" })} className="input" disabled={shipmentModal.mode === 'view'} />
                        {shipmentForm.formState.errors.bolNumber && <p className="form-error">{shipmentForm.formState.errors.bolNumber.message}</p>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="status" className="form-label">Status</label>
                        <select id="status" {...shipmentForm.register("status")} className="input" disabled={shipmentModal.mode === 'view'}>
                            {Object.values(ShipmentStatus).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="origin" className="form-label">Origin</label>
                        <input id="origin" {...shipmentForm.register("origin", { required: "Origin is required" })} className="input" disabled={shipmentModal.mode === 'view'} />
                        {shipmentForm.formState.errors.origin && <p className="form-error">{shipmentForm.formState.errors.origin.message}</p>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="destination" className="form-label">Destination</label>
                        <input id="destination" {...shipmentForm.register("destination", { required: "Destination is required" })} className="input" disabled={shipmentModal.mode === 'view'} />
                        {shipmentForm.formState.errors.destination && <p className="form-error">{shipmentForm.formState.errors.destination.message}</p>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="estimatedDeliveryDate" className="form-label">Estimated Delivery Date</label>
                        <input type="date" id="estimatedDeliveryDate" {...shipmentForm.register("estimatedDeliveryDate", { required: "Est. Delivery Date is required"})} className="input" disabled={shipmentModal.mode === 'view'} />
                        {shipmentForm.formState.errors.estimatedDeliveryDate && <p className="form-error">{shipmentForm.formState.errors.estimatedDeliveryDate.message}</p>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="actualDeliveryDate" className="form-label">Actual Delivery Date (Optional)</label>
                        <input type="date" id="actualDeliveryDate" {...shipmentForm.register("actualDeliveryDate")} className="input" disabled={shipmentModal.mode === 'view'} />
                    </div>
                     <div className="form-group">
                        <label htmlFor="customerName" className="form-label">Customer Name</label>
                        <input id="customerName" {...shipmentForm.register("customerName", { required: "Customer Name is required" })} className="input" disabled={shipmentModal.mode === 'view'}/>
                        {shipmentForm.formState.errors.customerName && <p className="form-error">{shipmentForm.formState.errors.customerName.message}</p>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="customerContact" className="form-label">Customer Contact (Phone/Email)</label>
                        <input id="customerContact" {...shipmentForm.register("customerContact")} className="input" disabled={shipmentModal.mode === 'view'}/>
                    </div>
                     <div className="form-group">
                        <label htmlFor="vehicleId" className="form-label">Assigned Vehicle (Optional)</label>
                        <select id="vehicleId" {...shipmentForm.register("vehicleId")} className="input" disabled={shipmentModal.mode === 'view'}>
                            <option value="">None</option>
                            {vehicles.filter(v => v.status === VehicleStatus.AVAILABLE || v.id === shipmentForm.getValues('vehicleId')).map(v => <option key={v.id} value={v.id}>{v.registrationNumber} ({v.type})</option>)}
                        </select>
                    </div>
                     <div className="form-group">
                        <label htmlFor="driverId" className="form-label">Assigned Driver (Optional)</label>
                        <select id="driverId" {...shipmentForm.register("driverId")} className="input" disabled={shipmentModal.mode === 'view'}>
                            <option value="">None</option>
                            {drivers.filter(d => d.status === 'Active' || d.id === shipmentForm.getValues('driverId')).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                    </div>
                </div>

                <div className="form-group col-span-1 md:col-span-2">
                    <label className="form-label">Items</label>
                    {shipmentForm.watch('items')?.map((item, index) => (
                        <div key={index} className="grid grid-cols-12 gap-2 mb-2 items-center">
                            <input {...shipmentForm.register(`items.${index}.name` as const, {required: "Item name required"})} placeholder="Item Name" className="input col-span-5" disabled={shipmentModal.mode === 'view'}/>
                            <input type="number" {...shipmentForm.register(`items.${index}.quantity` as const, {required: "Quantity required", min: {value:1, message:"Min 1"}})} placeholder="Qty" className="input col-span-3" disabled={shipmentModal.mode === 'view'}/>
                            <input {...shipmentForm.register(`items.${index}.unit` as const, {required: "Unit required"})} placeholder="Unit (e.g. pcs, kg)" className="input col-span-3" disabled={shipmentModal.mode === 'view'}/>
                            {shipmentModal.mode !== 'view' && shipmentForm.getValues('items').length > 1 && (
                                <button type="button" onClick={() => removeItemField(index)} className="btn btn-sm bg-red-500 text-white col-span-1 flex-center" aria-label="Remove item"><Trash2 size={16}/></button>
                            )}
                        </div>
                    ))}
                     {shipmentModal.mode !== 'view' && <button type="button" onClick={addItemField} className="btn btn-sm btn-secondary mt-1">Add Item</button>}
                </div>
                
                 {shipmentModal.mode !== 'view' && shipmentModal.mode !== 'ai' && (
                    <button type="button" id="ai-description-button" onClick={() => handleAiShipmentDescription(shipmentForm.getValues())} className="btn bg-indigo-500 hover:bg-indigo-600 text-white flex items-center gap-2" disabled={isAiLoading}>
                        <Brain size={18}/> {isAiLoading ? 'AI Processing...' : 'Generate Description & Handling with AI'}
                    </button>
                )}
                {isAiLoading && shipmentModal.mode !== 'ai' && <p className="text-sm text-blue-500 mt-2">AI is working...</p>}
                {aiError && shipmentModal.mode !== 'ai' && <p className="form-error mt-2">{aiError}</p>}

                {(shipmentForm.watch('aiGeneratedDescription') || shipmentModal.mode === 'view' && shipmentModal.data?.aiGeneratedDescription) && (
                    <div className="form-group">
                        <label htmlFor="aiGeneratedDescription" className="form-label">AI Generated Description</label>
                        <textarea id="aiGeneratedDescription" {...shipmentForm.register("aiGeneratedDescription")} rows={3} className="input" disabled={shipmentModal.mode === 'view'}></textarea>
                    </div>
                )}
                {(shipmentForm.watch('aiHandlingInstructions') || shipmentModal.mode === 'view' && shipmentModal.data?.aiHandlingInstructions) && (
                    <div className="form-group">
                        <label htmlFor="aiHandlingInstructions" className="form-label">AI Generated Handling Instructions</label>
                        <textarea id="aiHandlingInstructions" {...shipmentForm.register("aiHandlingInstructions")} rows={3} className="input" disabled={shipmentModal.mode === 'view'}></textarea>
                    </div>
                )}
                <div className="form-group">
                    <label htmlFor="notes" className="form-label">Notes (Optional)</label>
                    <textarea id="notes" {...shipmentForm.register("notes")} rows={3} className="input" disabled={shipmentModal.mode === 'view'}></textarea>
                </div>
                
                {shipmentModal.mode !== 'view' && (
                    <div className="modal-footer">
                        <button type="button" onClick={() => closeModal('shipment')} className="btn bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-slate-600">Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={shipmentForm.formState.isSubmitting || isAiLoading}>
                            {shipmentModal.mode === 'add' ? 'Add Shipment' : 'Save Changes'}
                        </button>
                    </div>
                )}
            </form>
            )}

            {shipmentModal.mode === 'view' && shipmentModal.data && (
                <div className="space-y-3 mt-4 max-h-[60vh] overflow-y-auto pr-2 text-sm">
                    <p><strong>BOL Number:</strong> {shipmentModal.data.bolNumber}</p>
                    <p><strong>Origin:</strong> {shipmentModal.data.origin}</p>
                    <p><strong>Destination:</strong> {shipmentModal.data.destination}</p>
                    <p><strong>Status:</strong> <span className={`badge ${shipmentModal.data.status === ShipmentStatus.DELIVERED ? 'badge-success' : shipmentModal.data.status === ShipmentStatus.PENDING ? 'badge-warning' : 'badge-info'}`}>{shipmentModal.data.status}</span></p>
                    <p><strong>Estimated Delivery:</strong> {format(parseISO(shipmentModal.data.estimatedDeliveryDate), 'PPP')}</p>
                    {shipmentModal.data.actualDeliveryDate && <p><strong>Actual Delivery:</strong> {format(parseISO(shipmentModal.data.actualDeliveryDate), 'PPP')}</p>}
                    <p><strong>Customer:</strong> {shipmentModal.data.customerName} ({shipmentModal.data.customerContact})</p>
                    <p><strong>Items:</strong></p>
                    <ul className="list-disc list-inside ml-4">
                        {shipmentModal.data.items.map((item, i) => <li key={i}>{item.quantity} {item.unit} of {item.name}</li>)}
                    </ul>
                    {shipmentModal.data.vehicleId && <p><strong>Vehicle:</strong> {vehicles.find(v=>v.id === shipmentModal.data?.vehicleId)?.registrationNumber || 'N/A'}</p>}
                    {shipmentModal.data.driverId && <p><strong>Driver:</strong> {drivers.find(d=>d.id === shipmentModal.data?.driverId)?.name || 'N/A'}</p>}
                    {shipmentModal.data.aiGeneratedDescription && <p><strong>AI Description:</strong> {shipmentModal.data.aiGeneratedDescription}</p>}
                    {shipmentModal.data.aiHandlingInstructions && <p><strong>AI Handling:</strong> {shipmentModal.data.aiHandlingInstructions}</p>}
                    {shipmentModal.data.notes && <p><strong>Notes:</strong> {shipmentModal.data.notes}</p>}
                    <p className="text-xs text-gray-500">Created: {format(parseISO(shipmentModal.data.createdAt), 'Pp')}, Updated: {format(parseISO(shipmentModal.data.updatedAt), 'Pp')}</p>
                </div>
            )}
          </div>
        </div>
      )}
      
      {/* Vehicle Modal */}
      {vehicleModal.isOpen && (
          <div className="modal-backdrop" onClick={() => closeModal('vehicle')}>
              <div className="modal-content" onClick={e => e.stopPropagation()}>
                  <div className="modal-header">
                      <h3 className="text-lg font-medium">{vehicleModal.mode === 'add' ? 'Add New' : 'Edit'} Vehicle</h3>
                      <button onClick={() => closeModal('vehicle')} className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400">&times;</button>
                  </div>
                  <form onSubmit={vehicleForm.handleSubmit((data) => {
                      if (vehicleModal.mode === 'add') addToList(setVehicles, data);
                      else if (vehicleModal.data) updateInList(setVehicles, { ...vehicleModal.data, ...data });
                      closeModal('vehicle');
                  })} className="space-y-4 mt-4">
                      <div className="form-group">
                          <label htmlFor="registrationNumber" className="form-label">Registration Number</label>
                          <input id="registrationNumber" {...vehicleForm.register("registrationNumber", { required: true })} className="input" />
                          {vehicleForm.formState.errors.registrationNumber && <p className="form-error">Reg. Number is required</p>}
                      </div>
                      <div className="form-group">
                          <label htmlFor="type" className="form-label">Vehicle Type</label>
                          <select id="type" {...vehicleForm.register("type")} className="input">
                              {Object.values(VehicleType).map(vt => <option key={vt} value={vt}>{vt}</option>)}
                          </select>
                      </div>
                      <div className="form-group">
                          <label htmlFor="capacityKg" className="form-label">Capacity (kg)</label>
                          <input type="number" id="capacityKg" {...vehicleForm.register("capacityKg", { required: true, valueAsNumber: true, min: 1 })} className="input" />
                          {vehicleForm.formState.errors.capacityKg && <p className="form-error">Valid capacity is required</p>}
                      </div>
                      <div className="form-group">
                          <label htmlFor="vehicleStatus" className="form-label">Status</label>
                          <select id="vehicleStatus" {...vehicleForm.register("status")} className="input">
                              {Object.values(VehicleStatus).map(vs => <option key={vs} value={vs}>{vs}</option>)}
                          </select>
                      </div>
                       <div className="form-group">
                          <label htmlFor="currentLocation" className="form-label">Current Location (Optional)</label>
                          <input id="currentLocation" {...vehicleForm.register("currentLocation")} className="input" />
                      </div>
                       <div className="form-group">
                          <label htmlFor="maintenanceDate" className="form-label">Next Maintenance (Optional)</label>
                          <input type="date" id="maintenanceDate" {...vehicleForm.register("maintenanceDate")} className="input" />
                      </div>
                      <div className="modal-footer">
                          <button type="button" onClick={() => closeModal('vehicle')} className="btn bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-slate-600">Cancel</button>
                          <button type="submit" className="btn btn-primary">{vehicleModal.mode === 'add' ? 'Add Vehicle' : 'Save Changes'}</button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* Driver Modal */}
      {driverModal.isOpen && (
          <div className="modal-backdrop" onClick={() => closeModal('driver')}>
              <div className="modal-content" onClick={e => e.stopPropagation()}>
                  <div className="modal-header">
                      <h3 className="text-lg font-medium">{driverModal.mode === 'add' ? 'Add New' : 'Edit'} Driver</h3>
                      <button onClick={() => closeModal('driver')} className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400">&times;</button>
                  </div>
                  <form onSubmit={driverForm.handleSubmit((data) => {
                      if (driverModal.mode === 'add') addToList(setDrivers, data);
                      else if (driverModal.data) updateInList(setDrivers, { ...driverModal.data, ...data });
                      closeModal('driver');
                  })} className="space-y-4 mt-4">
                      <div className="form-group">
                          <label htmlFor="driverName" className="form-label">Full Name</label>
                          <input id="driverName" {...driverForm.register("name", { required: true })} className="input" />
                           {driverForm.formState.errors.name && <p className="form-error">Name is required</p>}
                      </div>
                      <div className="form-group">
                          <label htmlFor="licenseNumber" className="form-label">License Number</label>
                          <input id="licenseNumber" {...driverForm.register("licenseNumber", { required: true })} className="input" />
                           {driverForm.formState.errors.licenseNumber && <p className="form-error">License number is required</p>}
                      </div>
                      <div className="form-group">
                          <label htmlFor="contactPhone" className="form-label">Contact Phone</label>
                          <input type="tel" id="contactPhone" {...driverForm.register("contactPhone", { required: true })} className="input" />
                          {driverForm.formState.errors.contactPhone && <p className="form-error">Phone number is required</p>}
                      </div>
                      <div className="form-group">
                          <label htmlFor="contactEmail" className="form-label">Contact Email</label>
                          <input type="email" id="contactEmail" {...driverForm.register("contactEmail", { required: true, pattern: /^\S+@\S+$/i })} className="input" />
                          {driverForm.formState.errors.contactEmail && <p className="form-error">Valid email is required</p>}
                      </div>
                      <div className="form-group">
                          <label htmlFor="driverStatus" className="form-label">Status</label>
                          <select id="driverStatus" {...driverForm.register("status")} className="input">
                              {(['Active', 'Inactive', 'On Leave'] as const).map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                      </div>
                       <div className="form-group">
                          <label htmlFor="driverAssignedVehicleId" className="form-label">Assigned Vehicle (Optional)</label>
                          <select id="driverAssignedVehicleId" {...driverForm.register("assignedVehicleId")} className="input">
                              <option value="">None</option>
                              {vehicles.filter(v => v.status === VehicleStatus.AVAILABLE || v.id === driverForm.getValues('assignedVehicleId')).map(v => <option key={v.id} value={v.id}>{v.registrationNumber}</option>)}
                          </select>
                      </div>
                      <div className="modal-footer">
                          <button type="button" onClick={() => closeModal('driver')} className="btn bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-slate-600">Cancel</button>
                          <button type="submit" className="btn btn-primary">{driverModal.mode === 'add' ? 'Add Driver' : 'Save Changes'}</button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* Route Modal */}
      {routeModal.isOpen && (
          <div className="modal-backdrop" onClick={() => closeModal('route')}>
              <div className="modal-content max-w-lg" onClick={e => e.stopPropagation()}>
                  <div className="modal-header">
                      <h3 className="text-lg font-medium">{routeModal.mode === 'ai' ? routeModal.title : `${routeModal.mode === 'add' ? 'Add New' : 'Edit'} Route`}</h3>
                      <button onClick={() => closeModal('route')} className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400">&times;</button>
                  </div>
                 {(routeModal.mode === 'add' || routeModal.mode === 'edit' || (routeModal.mode === 'ai' && aiResult)) && (
                  <form onSubmit={routeForm.handleSubmit((data) => {
                      const dataToSave = {...data};
                      if(aiResult && currentAiContext.type === 'routeAdvisory' && routeModal.data?.id === currentAiContext.routeId) {
                           dataToSave.aiPrimaryRouteSuggestion = aiResult.primary_route_suggestion;
                           dataToSave.aiAlternativeRouteSuggestion = aiResult.alternative_route_suggestion;
                      }
                      if (routeModal.mode === 'add') addToList(setRoutes, dataToSave);
                      else if (routeModal.data) updateInList(setRoutes, { ...routeModal.data, ...dataToSave });
                      closeModal('route');
                      setAiResult(null);
                  })} className="space-y-4 mt-4 max-h-[60vh] overflow-y-auto pr-2">
                      <div className="form-group">
                          <label htmlFor="routeName" className="form-label">Route Name</label>
                          <input id="routeName" {...routeForm.register("routeName", { required: true })} className="input" />
                          {routeForm.formState.errors.routeName && <p className="form-error">Route name is required</p>}
                      </div>
                      <div className="form-group">
                          <label htmlFor="routeOrigin" className="form-label">Origin</label>
                          <input id="routeOrigin" {...routeForm.register("origin", { required: true })} className="input" />
                          {routeForm.formState.errors.origin && <p className="form-error">Origin is required</p>}
                      </div>
                      <div className="form-group">
                          <label htmlFor="routeDestination" className="form-label">Destination</label>
                          <input id="routeDestination" {...routeForm.register("destination", { required: true })} className="input" />
                          {routeForm.formState.errors.destination && <p className="form-error">Destination is required</p>}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="form-group">
                            <label htmlFor="distanceKm" className="form-label">Distance (km)</label>
                            <input type="number" id="distanceKm" {...routeForm.register("distanceKm", { required: true, valueAsNumber: true, min: 1 })} className="input" />
                             {routeForm.formState.errors.distanceKm && <p className="form-error">Valid distance is required</p>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="estimatedTimeHours" className="form-label">Est. Time (hours)</label>
                            <input type="number" id="estimatedTimeHours" {...routeForm.register("estimatedTimeHours", { required: true, valueAsNumber: true, min: 0.1 })} className="input" />
                            {routeForm.formState.errors.estimatedTimeHours && <p className="form-error">Valid time is required</p>}
                        </div>
                      </div>
                       {routeModal.mode !== 'view' && routeModal.mode !== 'ai' && (
                          <button type="button" id="ai-route-advisory-button" onClick={() => handleAiRouteAdvisory(routeForm.getValues())} className="btn bg-indigo-500 hover:bg-indigo-600 text-white flex items-center gap-2" disabled={isAiLoading}>
                              <Lightbulb size={18}/> {isAiLoading ? 'AI Processing...' : 'Get Route Advisory with AI'}
                          </button>
                      )}
                      {isAiLoading && routeModal.mode !== 'ai' && <p className="text-sm text-blue-500 mt-2">AI is working...</p>}
                      {aiError && routeModal.mode !== 'ai' && <p className="form-error mt-2">{aiError}</p>}
                      
                      {(routeForm.watch('aiPrimaryRouteSuggestion') || routeModal.mode === 'view' && routeModal.data?.aiPrimaryRouteSuggestion) && (
                          <div className="form-group">
                              <label htmlFor="aiPrimaryRouteSuggestion" className="form-label">AI Primary Route Suggestion</label>
                              <textarea id="aiPrimaryRouteSuggestion" {...routeForm.register("aiPrimaryRouteSuggestion")} rows={2} className="input" readOnly></textarea>
                          </div>
                      )}
                      {(routeForm.watch('aiAlternativeRouteSuggestion') || routeModal.mode === 'view' && routeModal.data?.aiAlternativeRouteSuggestion) && (
                          <div className="form-group">
                              <label htmlFor="aiAlternativeRouteSuggestion" className="form-label">AI Alternative Route Suggestion</label>
                              <textarea id="aiAlternativeRouteSuggestion" {...routeForm.register("aiAlternativeRouteSuggestion")} rows={2} className="input" readOnly></textarea>
                          </div>
                      )}
                      <div className="form-group">
                          <label htmlFor="routeNotes" className="form-label">Notes (Optional)</label>
                          <textarea id="routeNotes" {...routeForm.register("notes")} rows={3} className="input"></textarea>
                      </div>
                      <div className="modal-footer">
                          <button type="button" onClick={() => closeModal('route')} className="btn bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-slate-600">Cancel</button>
                          <button type="submit" className="btn btn-primary">{routeModal.mode === 'add' ? 'Add Route' : 'Save Changes'}</button>
                      </div>
                  </form>
                  )}
                  {routeModal.mode === 'ai' && !aiResult && !isAiLoading && !aiError &&(
                    <p className="mt-4 text-center text-gray-500 dark:text-gray-400">AI processing route advisory. Please wait...</p>
                  )}
                  {routeModal.mode === 'ai' && isAiLoading &&(
                    <p className="mt-4 text-center text-blue-500">AI is working on your route...</p>
                  )}
                  {routeModal.mode === 'ai' && aiError &&(
                    <p className="mt-4 text-center text-red-500">{aiError}</p>
                  )}
              </div>
          </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
         <div className="modal-backdrop" onClick={() => closeModal('confirm')}>
            <div className="modal-content max-w-md" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="text-lg font-medium text-yellow-600 dark:text-yellow-400 flex items-center gap-2"><AlertCircle size={24}/> {confirmModal.title}</h3>
                    <button onClick={() => closeModal('confirm')} className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400">&times;</button>
                </div>
                <p className="my-4 text-gray-700 dark:text-gray-300">{confirmModal.message}</p>
                <div className="modal-footer">
                    <button onClick={() => closeModal('confirm')} className="btn bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-slate-600">Cancel</button>
                    <button onClick={confirmModal.onConfirm} className="btn bg-red-600 hover:bg-red-700 text-white">Confirm Delete</button>
                </div>
            </div>
        </div>
      )}
      
      {/* Import Modal */}
      {importModal.isOpen && importModal.dataType && (
        <div className="modal-backdrop" onClick={() => closeModal('import')}>
            <div className="modal-content max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="text-lg font-medium">Import {importModal.dataType.charAt(0).toUpperCase() + importModal.dataType.slice(1)} from CSV</h3>
                    <button onClick={() => closeModal('import')} className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400">&times;</button>
                </div>
                <div className="mt-4 space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        Select a CSV file to import. Make sure it follows the structure of the{' '}
                        <button onClick={() => downloadCSVTemplate(importModal.dataType!)} className="text-primary-600 hover:underline">template file</button>.
                    </p>
                    <div className="form-group">
                        <label htmlFor="csvFileImport" className="form-label">CSV File</label>
                        <input 
                            type="file" 
                            id="csvFileImport" 
                            accept=".csv" 
                            onChange={handleFileUploadForImport} 
                            className="input file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                        />
                    </div>
                    {importedFile && <p className="text-sm">Selected file: {importedFile.name}</p>}
                    {importError && <p className="form-error">{importError}</p>}
                </div>
                <div className="modal-footer">
                    <button type="button" onClick={() => closeModal('import')} className="btn bg-gray-200 dark:bg-slate-700">Cancel</button>
                    <button type="button" onClick={processImportedFile} className="btn btn-primary" disabled={!importedFile}>Import Data</button>
                </div>
            </div>
        </div>
      )}

      {/* AI Layer (Headless) */}
      <AILayer
        ref={aiLayerRef}
        prompt={aiPromptText}
        attachment={aiSelectedFile || undefined}
        onResult={(apiResult) => {
            try {
                const parsedResult = JSON.parse(apiResult); // Attempt to parse if it's a JSON string
                setAiResult(parsedResult);
            } catch (e) {
                setAiResult(apiResult); // If not JSON, use as is (e.g. plain text summary)
            }
            setAiError(null);
        }}
        onError={(apiError) => {
            setAiError(typeof apiError === 'string' ? apiError : JSON.stringify(apiError));
            setAiResult(null);
        }}
        onLoading={(loadingStatus) => setIsAiLoading(loadingStatus)}
      />
    </div>
  );
};

export default App;