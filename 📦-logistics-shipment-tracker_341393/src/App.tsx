import React, { useState, useEffect, useRef, useCallback, FormEvent } from 'react';
import { useAuth } from './contexts/authContext';
import styles from './styles/styles.module.css';
import {
  LayoutDashboard, Package, BarChart3, Settings as SettingsIcon, User, Plus, Edit3, Trash2, Filter as FilterIcon, Search as SearchIcon, Sun, Moon, MapPin, FileUp, FileDown, X, ChevronUp, ChevronDown, AlertTriangle, CheckCircle2, Clock, BrainCircuit, Sparkles, Save, UploadCloud, DownloadCloud, Eye, CalendarDays, Ship, Map as MapIcon, ListFilter, ArrowUpDown, ExternalLink, LogOut // Added LogOut
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell as RechartsCell, LineChart, Line } from 'recharts';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css';
import 'leaflet-defaulticon-compatibility';
import { format, parseISO, addDays, subDays, isValid } from 'date-fns';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';

// Fix for Leaflet default icon issue with Webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});


const APP_VERSION = "1.0.0";
const LOCAL_STORAGE_KEY = 'logisticsAppShipments_v1';
const SETTINGS_STORAGE_KEY = 'logisticsAppSettings_v1';
const TODAY_DATE = new Date('2025-06-06T12:00:00.000Z');

enum ShipmentStatus {
  Pending = 'Pending',
  InTransit = 'In Transit',
  Delayed = 'Delayed',
  Delivered = 'Delivered',
  Cancelled = 'Cancelled',
}

enum Priority {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
}

interface ShipmentLocation {
  lat: number;
  lng: number;
  address?: string;
}

interface Shipment {
  id: string;
  shipmentId: string; // User-friendly ID
  origin: string;
  destination: string;
  status: ShipmentStatus;
  carrier: string;
  estimatedDeliveryDate: string; // ISO string
  actualDeliveryDate?: string; // ISO string
  creationDate: string; // ISO string
  lastUpdate: string; // ISO string
  currentLocation: ShipmentLocation;
  notes?: string;
  priority: Priority;
  parcelWeightKg?: number;
  parcelDimensionsCm?: { length: number; width: number; height: number };
}

type Tab = 'dashboard' | 'shipments' | 'analytics' | 'settings';

interface AppSettings {
  theme: 'light' | 'dark';
  notificationsEnabled: boolean;
  defaultMapView: { lat: number, lng: number, zoom: number };
}

const initialShipments: Shipment[] = [
  { id: 'uuid1', shipmentId: 'SHP001', origin: 'Shanghai, China', destination: 'Los Angeles, USA', status: ShipmentStatus.InTransit, carrier: 'Maersk', estimatedDeliveryDate: addDays(TODAY_DATE, 7).toISOString(), creationDate: subDays(TODAY_DATE, 5).toISOString(), lastUpdate: TODAY_DATE.toISOString(), currentLocation: { lat: 34.0522, lng: -118.2437 }, priority: Priority.High, parcelWeightKg: 500, parcelDimensionsCm: { length: 120, width: 80, height: 100 } },
  { id: 'uuid2', shipmentId: 'SHP002', origin: 'Rotterdam, Netherlands', destination: 'New York, USA', status: ShipmentStatus.Pending, carrier: 'MSC', estimatedDeliveryDate: addDays(TODAY_DATE, 14).toISOString(), creationDate: subDays(TODAY_DATE, 2).toISOString(), lastUpdate: subDays(TODAY_DATE, 1).toISOString(), currentLocation: { lat: 51.9225, lng: 4.47917 }, priority: Priority.Medium },
  { id: 'uuid3', shipmentId: 'SHP003', origin: 'Hamburg, Germany', destination: 'Singapore', status: ShipmentStatus.Delivered, carrier: 'CMA CGM', estimatedDeliveryDate: subDays(TODAY_DATE, 3).toISOString(), actualDeliveryDate: subDays(TODAY_DATE, 2).toISOString(), creationDate: subDays(TODAY_DATE, 20).toISOString(), lastUpdate: subDays(TODAY_DATE, 2).toISOString(), currentLocation: { lat: 1.3521, lng: 103.8198 }, priority: Priority.Low, parcelWeightKg: 1200 },
  { id: 'uuid4', shipmentId: 'SHP004', origin: 'Santos, Brazil', destination: 'Cape Town, South Africa', status: ShipmentStatus.Delayed, carrier: 'Evergreen', estimatedDeliveryDate: addDays(TODAY_DATE, 2).toISOString(), creationDate: subDays(TODAY_DATE, 10).toISOString(), lastUpdate: TODAY_DATE.toISOString(), currentLocation: { lat: -23.9608, lng: -46.3261 }, priority: Priority.High, notes: "Port congestion causing delay." },
  { id: 'uuid5', shipmentId: 'SHP005', origin: 'Dubai, UAE', destination: 'London, UK', status: ShipmentStatus.InTransit, carrier: 'Hapag-Lloyd', estimatedDeliveryDate: addDays(TODAY_DATE, 5).toISOString(), creationDate: subDays(TODAY_DATE, 3).toISOString(), lastUpdate: subDays(TODAY_DATE, 1).toISOString(), currentLocation: { lat: 25.276987, lng: 55.296249 }, priority: Priority.Medium, parcelWeightKg: 250, parcelDimensionsCm: { length: 100, width: 60, height: 50 } },
];

const App: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [shipments, setShipments] = useState<Shipment[]>(() => {
    const savedShipments = localStorage.getItem(LOCAL_STORAGE_KEY);
    return savedShipments ? JSON.parse(savedShipments) : initialShipments;
  });
  const [appSettings, setAppSettings] = useState<AppSettings>(() => {
    const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
    return savedSettings ? JSON.parse(savedSettings) : {
      theme: 'light',
      notificationsEnabled: true,
      defaultMapView: { lat: 20, lng: 0, zoom: 2 }
    };
  });

  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<ShipmentStatus | ''>('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Shipment; direction: 'asc' | 'desc' } | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<'addShipment' | 'editShipment' | 'viewShipment' | 'aiInsights' | 'confirmDelete' | 'confirmDeleteAllData' | null>(null);
  const [currentShipment, setCurrentShipment] = useState<Shipment | null>(null);
  const [shipmentToProcess, setShipmentToProcess] = useState<Shipment | null>(null); // For AI or delete confirmation

  const [isLoading, setIsLoading] = useState(false); // General loading state
  const [error, setError] = useState<string | null>(null);

  // AI Layer states
  const aiLayerRef = useRef<AILayerHandle>(null);
  const [aiPromptText, setAiPromptText] = useState<string>('');
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<any | null>(null);
  const [selectedAiFile, setSelectedAiFile] = useState<File | null>(null);

  const [showToast, setShowToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  // Form state for adding/editing shipments
  const [formData, setFormData] = useState<Partial<Shipment>>({});

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(shipments));
  }, [shipments]);

  useEffect(() => {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(appSettings));
    if (appSettings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [appSettings]);
  
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeModal();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const displayToast = (message: string, type: 'success' | 'error') => {
    setShowToast({ message, type });
    setTimeout(() => setShowToast(null), 3000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
        const newFormData = { ...prev }; 

        if (name.startsWith('currentLocation.')) {
            const key = name.split('.')[1] as keyof ShipmentLocation;
            const loc = prev.currentLocation || { lat: NaN, lng: NaN, address: '' }; // Ensure object exists with defaults
            newFormData.currentLocation = {
                ...loc,
                [key]: key === 'lat' || key === 'lng' ? parseFloat(value) : value,
            };
        } else if (name.startsWith('parcelDimensionsCm.')) {
            const key = name.split('.')[1] as keyof NonNullable<Shipment['parcelDimensionsCm']>;
            const dims = prev.parcelDimensionsCm || { length: 0, width: 0, height: 0 }; // Ensure object exists with defaults
            newFormData.parcelDimensionsCm = {
                ...dims,
                [key]: parseFloat(value) || 0, 
            };
        } else if (name === 'parcelWeightKg') {
            newFormData[name] = parseFloat(value) || 0; 
        }
        else {
            newFormData[name as keyof Partial<Shipment>] = value;
        }
        return newFormData;
    });
  };

  const validateFormData = (data: Partial<Shipment>): boolean => {
    if (!data.shipmentId?.trim() || !data.origin?.trim() || !data.destination?.trim() || !data.carrier?.trim() || !data.estimatedDeliveryDate || !data.status || !data.priority) {
        setError("Please fill all required fields: Shipment ID, Origin, Destination, Carrier, ETA, Status, and Priority.");
        return false;
    }
    if (data.currentLocation?.lat == null || data.currentLocation?.lng == null || isNaN(data.currentLocation.lat) || isNaN(data.currentLocation.lng)) {
        setError("Valid current location (Latitude and Longitude) is required.");
        return false;
    }
    if (data.estimatedDeliveryDate && !isValid(parseISO(data.estimatedDeliveryDate))) {
        setError("Invalid Estimated Delivery Date format.");
        return false;
    }
    if (data.actualDeliveryDate && data.actualDeliveryDate.trim() !== '' && !isValid(parseISO(data.actualDeliveryDate))) {
        setError("Invalid Actual Delivery Date format.");
        return false;
    }
    setError(null);
    return true;
  };
  
  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validateFormData(formData)) return;

    setIsLoading(true);
    
    // Ensure dates are stored as ISO strings if they are valid
    const processedFormData = { ...formData };
    if (processedFormData.estimatedDeliveryDate) {
      // Assuming formData.estimatedDeliveryDate is 'yyyy-MM-dd' from date input
      processedFormData.estimatedDeliveryDate = parseISO(processedFormData.estimatedDeliveryDate).toISOString();
    }
    if (processedFormData.actualDeliveryDate && processedFormData.actualDeliveryDate.trim() !== '') {
      processedFormData.actualDeliveryDate = parseISO(processedFormData.actualDeliveryDate).toISOString();
    } else if (processedFormData.actualDeliveryDate !== undefined) {
      delete processedFormData.actualDeliveryDate; // Remove if empty or just whitespace
    }

    if (modalContent === 'addShipment') {
      const newShipment: Shipment = {
        id: `uuid-${Date.now()}`,
        creationDate: new Date().toISOString(),
        lastUpdate: new Date().toISOString(),
        ...processedFormData,
        currentLocation: processedFormData.currentLocation || { lat: 0, lng: 0 }, // Ensure currentLocation is initialized
      } as Shipment; // Casting because we validated required fields
      setShipments(prev => [newShipment, ...prev]);
      displayToast("Shipment added successfully!", "success");
    } else if (modalContent === 'editShipment' && currentShipment) {
      setShipments(prev => prev.map(s => s.id === currentShipment.id ? { ...s, ...processedFormData, lastUpdate: new Date().toISOString() } as Shipment : s));
      displayToast("Shipment updated successfully!", "success");
    }
    setIsLoading(false);
    closeModal();
  };

  const openModal = (type: 'addShipment' | 'editShipment' | 'viewShipment' | 'aiInsights' | 'confirmDelete' | 'confirmDeleteAllData', shipment?: Shipment) => {
    document.body.classList.add('modal-open');
    setModalContent(type);
    setCurrentShipment(shipment || null);
    setShipmentToProcess(shipment || null);
    setError(null); // Clear previous form errors

    if (type === 'addShipment') {
      setFormData({ // Set default/initial values for new shipment
        status: ShipmentStatus.Pending,
        priority: Priority.Medium,
        estimatedDeliveryDate: addDays(TODAY_DATE, 7).toISOString().split('T')[0], // Default to 7 days from today, format yyyy-MM-dd for date input
        currentLocation: { lat: 0, lng: 0 },
        parcelWeightKg: 0,
        parcelDimensionsCm: { length: 0, width: 0, height: 0 },
      });
    } else if ((type === 'editShipment' || type === 'viewShipment') && shipment) {
      setFormData({
        ...shipment,
        estimatedDeliveryDate: shipment.estimatedDeliveryDate ? format(parseISO(shipment.estimatedDeliveryDate), 'yyyy-MM-dd') : '',
        actualDeliveryDate: shipment.actualDeliveryDate ? format(parseISO(shipment.actualDeliveryDate), 'yyyy-MM-dd') : '',
      });
    } else if (type === 'aiInsights' && shipment) {
      setShipmentToProcess(shipment);
      setAiResult(null);
      setAiError(null);
      const prompt = `Analyze the following shipment data and provide insights regarding potential risks, delivery estimation accuracy, and any optimization suggestions. Shipment Details: ${JSON.stringify(shipment)}. Respond in markdown format.`;
      setAiPromptText(prompt);
    } else if (type === 'confirmDeleteAllData') {
      // No specific form data needed for this modal type
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    document.body.classList.remove('modal-open');
    setIsModalOpen(false);
    setModalContent(null);
    setCurrentShipment(null);
    setShipmentToProcess(null);
    setFormData({});
    setAiResult(null);
    setAiError(null);
    setAiPromptText('');
    setSelectedAiFile(null);
    setError(null);
  };

  const handleDeleteShipment = () => {
    if (shipmentToProcess) {
      setShipments(prev => prev.filter(s => s.id !== shipmentToProcess.id));
      displayToast("Shipment deleted successfully!", "success");
    }
    closeModal();
  };

  const handleAiSubmit = () => {
    if (!aiPromptText.trim() && !selectedAiFile) {
      setAiError("Please provide a prompt or select a file for AI analysis.");
      return;
    }
    setAiResult(null);
    setAiError(null);
    if(aiLayerRef.current) {
        aiLayerRef.current.sendToAI(aiPromptText, selectedAiFile || undefined);
    }
  };
  
  const handleFileSelectForAI = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedAiFile(file);
      if (!aiPromptText.trim()) {
        setAiPromptText(`Analyze the attached document related to shipment ${shipmentToProcess?.shipmentId || 'N/A'}. Extract key information such as shipper, consignee, goods description, and any tracking numbers. Summarize findings. Return as JSON.`);
      }
      displayToast(`${file.name} selected for AI analysis.`, "success");
    }
  };

  const filteredShipments = shipments
    .filter(s => s.shipmentId.toLowerCase().includes(searchTerm.toLowerCase()) || s.origin.toLowerCase().includes(searchTerm.toLowerCase()) || s.destination.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(s => filterStatus ? s.status === filterStatus : true);

  const sortedShipments = [...filteredShipments].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
    
    let valA = a[key];
    let valB = b[key];

    if (key === 'estimatedDeliveryDate' || key === 'actualDeliveryDate' || key === 'creationDate' || key === 'lastUpdate') {
        valA = valA ? parseISO(valA as string).getTime() : 0;
        valB = valB ? parseISO(valB as string).getTime() : 0;
    } else if (typeof valA === 'string' && typeof valB === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
    } else if (typeof valA === 'number' && typeof valB === 'number') {
        // Already numbers, do nothing
    } else { 
        valA = String(valA).toLowerCase();
        valB = String(valB).toLowerCase();
    }

    if (valA < valB) return direction === 'asc' ? -1 : 1;
    if (valA > valB) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  const requestSort = (key: keyof Shipment) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  const getSortIcon = (key: keyof Shipment) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUpDown className="w-4 h-4 inline ml-1 text-gray-400" />;
    }
    return sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4 inline ml-1" /> : <ChevronDown className="w-4 h-4 inline ml-1" />;
  };

  const toggleTheme = () => {
    setAppSettings(prev => ({ ...prev, theme: prev.theme === 'light' ? 'dark' : 'light' }));
  };

  const handleImportShipments = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsLoading(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const lines = text.split('\n').filter(line => line.trim() !== '');
          const headers = lines[0].split(',').map(h => h.trim());
          const imported: Shipment[] = lines.slice(1).map((line, index) => {
            const values = line.split(',');
            const shipmentData = headers.reduce((obj, header, i) => {
              let value: any = values[i]?.trim();
              if (header === 'currentLocation.lat' || header === 'currentLocation.lng' || header === 'parcelWeightKg' || header.startsWith('parcelDimensionsCm.')) {
                value = parseFloat(value);
              } else if (header === 'status') {
                value = value as ShipmentStatus;
              } else if (header === 'priority') {
                value = value as Priority;
              }
              
              if (header.startsWith('currentLocation.')) {
                const locKey = header.split('.')[1] as keyof ShipmentLocation;
                if (!obj.currentLocation) obj.currentLocation = { lat: 0, lng: 0 };
                (obj.currentLocation as ShipmentLocation)[locKey] = value;
              } else if (header.startsWith('parcelDimensionsCm.')) {
                const dimKey = header.split('.')[1] as keyof NonNullable<Shipment['parcelDimensionsCm']>;
                 if (!obj.parcelDimensionsCm) obj.parcelDimensionsCm = { length: 0, width: 0, height: 0 };
                (obj.parcelDimensionsCm as NonNullable<Shipment['parcelDimensionsCm']>)[dimKey] = value;
              } else {
                obj[header as keyof Shipment] = value;
              }
              return obj;
            }, {} as any);

            return {
              ...shipmentData,
              id: `imported-${Date.now()}-${index}`,
              creationDate: new Date().toISOString(),
              lastUpdate: new Date().toISOString(),
            } as Shipment;
          });
          setShipments(prev => [...prev, ...imported.filter(s => s.shipmentId)]); 
          displayToast(`${imported.length} shipments imported successfully!`, "success");
        } catch (err) {
          console.error("Import error:", err);
          displayToast("Error importing shipments. Please check file format.", "error");
        } finally {
          setIsLoading(false);
        }
      };
      reader.readAsText(file);
      (event.target as HTMLInputElement).value = ""; 
    }
  };

  const exportShipmentsToCSV = () => {
    setIsLoading(true);
    const headers = ['id', 'shipmentId', 'origin', 'destination', 'status', 'carrier', 'estimatedDeliveryDate', 'actualDeliveryDate', 'creationDate', 'lastUpdate', 'currentLocation.lat', 'currentLocation.lng', 'currentLocation.address', 'notes', 'priority', 'parcelWeightKg', 'parcelDimensionsCm.length', 'parcelDimensionsCm.width', 'parcelDimensionsCm.height'];
    const csvRows = [
      headers.join(','),
      ...shipments.map(s => [
        s.id, s.shipmentId, s.origin, s.destination, s.status, s.carrier, s.estimatedDeliveryDate, s.actualDeliveryDate || '', s.creationDate, s.lastUpdate, s.currentLocation.lat, s.currentLocation.lng, s.currentLocation.address || '', s.notes || '', s.priority, s.parcelWeightKg || '', s.parcelDimensionsCm?.length || '', s.parcelDimensionsCm?.width || '', s.parcelDimensionsCm?.height || ''
      ].map(String).map(v => `"${v.replace(/"/g, '""')}"`).join(','))
    ];
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `shipments_export_${format(new Date(), 'yyyyMMddHHmmss')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      displayToast("Shipments exported successfully!", "success");
    }
    setIsLoading(false);
  };
  
  const getCSVTemplate = () => {
    const headers = ['shipmentId', 'origin', 'destination', 'status', 'carrier', 'estimatedDeliveryDate', 'currentLocation.lat', 'currentLocation.lng', 'currentLocation.address', 'notes', 'priority', 'parcelWeightKg', 'parcelDimensionsCm.length', 'parcelDimensionsCm.width', 'parcelDimensionsCm.height'];
    const exampleRow = ['SHP-EXAMPLE', 'New York, USA', 'London, UK', ShipmentStatus.Pending, 'Example Carrier', addDays(TODAY_DATE,10).toISOString().split('T')[0], '40.7128', '-74.0060', '123 Main St, NY', 'Fragile items', Priority.Medium, '10', '50', '30', '20'];
    const csvString = [headers.join(','), exampleRow.join(',')].join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'shipments_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    displayToast("CSV template downloaded.", "success");
  };

  const handleDeleteAllDataRequest = () => {
    openModal('confirmDeleteAllData');
  };

  const executeDeleteAllData = () => {
    setShipments([]);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    displayToast("All shipment data deleted.", "success");
    closeModal();
  };

  const renderStatusBadge = (status: ShipmentStatus) => {
    let colorClasses = '';
    let IconComponent: React.ElementType = Clock;
    switch (status) {
      case ShipmentStatus.Pending:
        colorClasses = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
        IconComponent = Clock;
        break;
      case ShipmentStatus.InTransit:
        colorClasses = 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
        IconComponent = Ship;
        break;
      case ShipmentStatus.Delayed:
        colorClasses = 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
        IconComponent = AlertTriangle;
        break;
      case ShipmentStatus.Delivered:
        colorClasses = 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
        IconComponent = CheckCircle2;
        break;
      case ShipmentStatus.Cancelled:
        colorClasses = 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
        IconComponent = X;
        break;
    }
    return (
      <span className={`badge ${colorClasses} flex items-center gap-1 text-xs`}>
        <IconComponent className="w-3 h-3" />
        {status}
      </span>
    );
  };
  
  const renderPriorityBadge = (priority: Priority) => {
    let colorClasses = '';
    switch (priority) {
      case Priority.Low: colorClasses = 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'; break;
      case Priority.Medium: colorClasses = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'; break;
      case Priority.High: colorClasses = 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'; break;
    }
    return <span className={`badge ${colorClasses} text-xs`}>{priority}</span>;
  };
  
  // Chart Data calculations
  const shipmentsByStatus = Object.values(ShipmentStatus).map(status => ({
    name: status,
    value: shipments.filter(s => s.status === status).length,
  }));

  const onTimeDeliveryRate = (() => {
    const delivered = shipments.filter(s => s.status === ShipmentStatus.Delivered && s.actualDeliveryDate);
    if (delivered.length === 0) return [{ name: 'N/A', value: 0, fill: '#8884d8' }];
    const onTime = delivered.filter(s => parseISO(s.actualDeliveryDate!).getTime() <= parseISO(s.estimatedDeliveryDate).getTime()).length;
    const late = delivered.length - onTime;
    return [
      { name: 'On Time', value: onTime, fill: '#82ca9d' },
      { name: 'Late', value: late, fill: '#ff7300' },
    ];
  })();

  const shipmentsOverTime = (() => {
    const data: { [key: string]: number } = {};
    shipments.forEach(s => {
        if(s.creationDate) {
            const month = format(parseISO(s.creationDate), 'yyyy-MM');
            data[month] = (data[month] || 0) + 1;
        }
    });
    return Object.entries(data)
        .map(([name, value]) => ({ name, shipments: value }))
        .sort((a,b) => a.name.localeCompare(b.name)); 
  })();

  const MapUpdater = ({ center, zoom }: { center: [number, number], zoom: number }) => {
    const map = useMap();
    useEffect(() => {
        map.setView(center, zoom);
    }, [center, zoom, map]);
    return null;
  };

  const kpiCardData = [
    { id: 'total-shipments-kpi', title: 'Total Shipments', value: shipments.length, icon: <Package className="w-6 h-6 text-primary-500" /> },
    { id: 'in-transit-kpi', title: 'In Transit', value: shipments.filter(s => s.status === ShipmentStatus.InTransit).length, icon: <Ship className="w-6 h-6 text-blue-500" /> },
    { id: 'delayed-kpi', title: 'Delayed', value: shipments.filter(s => s.status === ShipmentStatus.Delayed).length, icon: <AlertTriangle className="w-6 h-6 text-red-500" /> },
    { id: 'delivered-kpi', title: 'Delivered', value: shipments.filter(s => s.status === ShipmentStatus.Delivered).length, icon: <CheckCircle2 className="w-6 h-6 text-green-500" /> },
  ];

  const renderDashboard = () => (
    <div id="dashboard-content" className="space-y-6 p-4 md:p-6">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {kpiCardData.map(kpi => (
          <div key={kpi.id} id={kpi.id} className="stat-card theme-transition">
            <div className="flex justify-between items-center">
              <p className="stat-title">{kpi.title}</p>
              {kpi.icon}
            </div>
            <p className="stat-value">{kpi.value}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div id="shipment-status-chart" className="card theme-transition lg:col-span-1 h-[300px] md:h-[400px]">
          <h3 className="text-lg font-medium mb-4">Shipment Statuses</h3>
          <ResponsiveContainer width="100%" height="85%">
            <PieChart>
              <Pie data={shipmentsByStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {shipmentsByStatus.map((entry, index) => (
                  <RechartsCell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'][index % 5]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div id="shipments-map" className="card theme-transition lg:col-span-2 h-[300px] md:h-[400px] overflow-hidden">
           <h3 className="text-lg font-medium mb-4">Live Shipment Locations</h3>
           <MapContainer center={[appSettings.defaultMapView.lat, appSettings.defaultMapView.lng]} zoom={appSettings.defaultMapView.zoom} scrollWheelZoom={true} style={{ height: 'calc(100% - 40px)', width: '100%' }} className="rounded-md">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {shipments.filter(s => s.status === ShipmentStatus.InTransit || s.status === ShipmentStatus.Delayed).map(shipment => (
              shipment.currentLocation.lat && shipment.currentLocation.lng &&
              <Marker key={shipment.id} position={[shipment.currentLocation.lat, shipment.currentLocation.lng]}>
                <Popup>
                  <b>{shipment.shipmentId}</b><br />
                  Status: {shipment.status}<br />
                  Origin: {shipment.origin}<br />
                  Destination: {shipment.destination}<br />
                  <button className="btn btn-xs btn-primary mt-1" onClick={() => openModal('viewShipment', shipment)}>View Details</button>
                </Popup>
              </Marker>
            ))}
            <MapUpdater center={[appSettings.defaultMapView.lat, appSettings.defaultMapView.lng]} zoom={appSettings.defaultMapView.zoom}/>
          </MapContainer>
        </div>
      </div>
    </div>
  );

  const renderShipments = () => (
    <div id="shipments-content" className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Shipments List</h2>
        <button id="add-shipment-button" className="btn btn-primary flex items-center gap-2 w-full sm:w-auto" onClick={() => openModal('addShipment')}>
          <Plus className="w-5 h-5" /> Add New Shipment
        </button>
      </div>
      <div className="card theme-transition p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="form-group">
            <label htmlFor="search-shipments" className="form-label sr-only">Search Shipments</label>
            <div className="relative">
              <input
                id="search-shipments-input"
                type="text"
                placeholder="Search by ID, Origin, Destination..."
                className="input pl-10"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="filter-status" className="form-label sr-only">Filter by Status</label>
            <div className="relative">
                <select
                    id="filter-status-select"
                    className="input appearance-none pl-10"
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value as ShipmentStatus | '')}
                >
                    <option value="">All Statuses</option>
                    {Object.values(ShipmentStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <ListFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>
        <div id="shipments-table-container" className="table-container">
          <table id="shipments-table" className="table">
            <thead>
              <tr>
                {([
                    {key: 'shipmentId', label: 'Shipment ID'},
                    {key: 'origin', label: 'Origin'},
                    {key: 'destination', label: 'Destination'},
                    {key: 'status', label: 'Status'},
                    {key: 'priority', label: 'Priority'},
                    {key: 'estimatedDeliveryDate', label: 'ETA'},
                    {key: 'carrier', label: 'Carrier'},
                    {key: 'lastUpdate', label: 'Last Update'},
                 ] as {key: keyof Shipment, label: string}[]).map(col => (
                    <th key={col.key} className="table-header px-3 py-2 md:px-4 md:py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-600" onClick={() => requestSort(col.key)}>
                        {col.label} {getSortIcon(col.key)}
                    </th>
                ))}
                <th className="table-header px-3 py-2 md:px-4 md:py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
              {isLoading && <tr><td colSpan={9} className="table-cell text-center"><div className="skeleton-text w-1/2 mx-auto"></div></td></tr>}
              {!isLoading && sortedShipments.length === 0 && <tr><td colSpan={9} className="table-cell text-center">No shipments found.</td></tr>}
              {!isLoading && sortedShipments.map(s => (
                <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-slate-750 transition-colors">
                  <td className="table-cell px-3 py-2 md:px-4 md:py-3 font-medium">{s.shipmentId}</td>
                  <td className="table-cell px-3 py-2 md:px-4 md:py-3">{s.origin}</td>
                  <td className="table-cell px-3 py-2 md:px-4 md:py-3">{s.destination}</td>
                  <td className="table-cell px-3 py-2 md:px-4 md:py-3">{renderStatusBadge(s.status)}</td>
                  <td className="table-cell px-3 py-2 md:px-4 md:py-3">{renderPriorityBadge(s.priority)}</td>
                  <td className="table-cell px-3 py-2 md:px-4 md:py-3">{s.estimatedDeliveryDate ? format(parseISO(s.estimatedDeliveryDate), 'MMM dd, yyyy') : 'N/A'}</td>
                  <td className="table-cell px-3 py-2 md:px-4 md:py-3">{s.carrier}</td>
                  <td className="table-cell px-3 py-2 md:px-4 md:py-3">{format(parseISO(s.lastUpdate), 'MMM dd, yyyy HH:mm')}</td>
                  <td className="table-cell px-3 py-2 md:px-4 md:py-3">
                    <div className="flex items-center space-x-1 md:space-x-2">
                      <button id={`view-shipment-${s.id}`} title="View Details" className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded" onClick={() => openModal('viewShipment', s)}><Eye className="w-4 h-4 text-gray-600 dark:text-gray-300" /></button>
                      <button id={`edit-shipment-${s.id}`} title="Edit" className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded" onClick={() => openModal('editShipment', s)}><Edit3 className="w-4 h-4 text-blue-600 dark:text-blue-400" /></button>
                      <button id={`delete-shipment-${s.id}`} title="Delete" className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded" onClick={() => openModal('confirmDelete', s)}><Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" /></button>
                      <button id={`ai-analyze-${s.id}`} title="AI Insights" className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded" onClick={() => openModal('aiInsights', s)}><Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div id="analytics-content" className="p-4 md:p-6 space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Shipment Analytics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div id="shipments-by-status-chart" className="card theme-transition h-[350px] md:h-[400px]">
          <h3 className="text-lg font-medium mb-4">Shipments by Status</h3>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={shipmentsByStatus}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-slate-700" />
              <XAxis dataKey="name" tick={{ fill: appSettings.theme === 'dark' ? '#e2e8f0' : '#1f2937', fontSize: 12 }} />
              <YAxis tick={{ fill: appSettings.theme === 'dark' ? '#e2e8f0' : '#1f2937', fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: appSettings.theme === 'dark' ? '#0f172a' : '#ffffff', border: `1px solid ${appSettings.theme === 'dark' ? '#334155' : '#e5e7eb'}` }} />
              <Legend />
              <Bar dataKey="value" name="Count" fill="#8884d8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div id="on-time-delivery-chart" className="card theme-transition h-[350px] md:h-[400px]">
          <h3 className="text-lg font-medium mb-4">On-Time Delivery Performance</h3>
          <ResponsiveContainer width="100%" height="85%">
            <PieChart>
              <Pie data={onTimeDeliveryRate} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                {onTimeDeliveryRate.map((entry, index) => (
                  <RechartsCell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: appSettings.theme === 'dark' ? '#0f172a' : '#ffffff', border: `1px solid ${appSettings.theme === 'dark' ? '#334155' : '#e5e7eb'}` }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div id="shipments-over-time-chart" className="card theme-transition h-[350px] md:h-[400px]">
        <h3 className="text-lg font-medium mb-4">Shipments Created Over Time (Monthly)</h3>
        <ResponsiveContainer width="100%" height="85%">
            <LineChart data={shipmentsOverTime}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-slate-700" />
                <XAxis dataKey="name" tick={{ fill: appSettings.theme === 'dark' ? '#e2e8f0' : '#1f2937', fontSize: 12 }} />
                <YAxis tick={{ fill: appSettings.theme === 'dark' ? '#e2e8f0' : '#1f2937', fontSize: 12 }} allowDecimals={false}/>
                <Tooltip contentStyle={{ backgroundColor: appSettings.theme === 'dark' ? '#0f172a' : '#ffffff', border: `1px solid ${appSettings.theme === 'dark' ? '#334155' : '#e5e7eb'}` }} />
                <Legend />
                <Line type="monotone" dataKey="shipments" stroke="#82ca9d" strokeWidth={2} activeDot={{ r: 8 }} />
            </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div id="settings-content" className="p-4 md:p-6 space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Application Settings</h2>
      <div className="card theme-transition">
        <h3 className="text-lg font-medium mb-4">General Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="form-label">Dark Mode</span>
            <button id="theme-toggle-button" onClick={toggleTheme} className="theme-toggle" aria-label={appSettings.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
              <span className="theme-toggle-thumb"></span>
            </button>
          </div>
          <div className="form-group">
            <label htmlFor="defaultLat" className="form-label">Default Map Latitude</label>
            <input id="defaultLat" type="number" name="defaultLat" className="input" value={appSettings.defaultMapView.lat} onChange={(e) => setAppSettings(prev => ({...prev, defaultMapView: {...prev.defaultMapView, lat: parseFloat(e.target.value) }}))} />
          </div>
          <div className="form-group">
            <label htmlFor="defaultLng" className="form-label">Default Map Longitude</label>
            <input id="defaultLng" type="number" name="defaultLng" className="input" value={appSettings.defaultMapView.lng} onChange={(e) => setAppSettings(prev => ({...prev, defaultMapView: {...prev.defaultMapView, lng: parseFloat(e.target.value) }}))} />
          </div>
          <div className="form-group">
            <label htmlFor="defaultZoom" className="form-label">Default Map Zoom</label>
            <input id="defaultZoom" type="number" name="defaultZoom" className="input" min="1" max="18" value={appSettings.defaultMapView.zoom} onChange={(e) => setAppSettings(prev => ({...prev, defaultMapView: {...prev.defaultMapView, zoom: parseInt(e.target.value) }}))} />
          </div>
        </div>
      </div>
      <div className="card theme-transition">
        <h3 className="text-lg font-medium mb-4">Data Management</h3>
        <div className="space-y-4 md:space-y-0 md:flex md:space-x-4">
            <div className="flex-1 space-y-2">
                <label htmlFor="import-csv-button" id="import-csv-label" className="btn btn-secondary w-full flex items-center justify-center gap-2 cursor-pointer">
                    <UploadCloud className="w-5 h-5" /> Import Shipments (CSV)
                </label>
                <input id="import-csv-button" type="file" accept=".csv" className="hidden" onChange={handleImportShipments} />
                <button id="download-template-button" className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500 w-full flex items-center justify-center gap-2" onClick={getCSVTemplate}>
                    <DownloadCloud className="w-5 h-5" /> Download CSV Template
                </button>
            </div>
            <div className="flex-1 space-y-2">
                <button id="export-csv-button" className="btn btn-secondary w-full flex items-center justify-center gap-2" onClick={exportShipmentsToCSV}>
                  <FileDown className="w-5 h-5" /> Export Shipments (CSV)
                </button>
                <button id="delete-all-data-button" className="btn bg-red-500 text-white hover:bg-red-600 w-full flex items-center justify-center gap-2" onClick={handleDeleteAllDataRequest}>
                  <Trash2 className="w-5 h-5" /> Delete All Data
                </button>
            </div>
        </div>
      </div>
      <div className="card theme-transition">
        <h3 className="text-lg font-medium mb-4">About</h3>
        <p className="text-sm text-gray-600 dark:text-slate-300">Logistics Monitoring App v{APP_VERSION}</p>
        <p className="text-sm text-gray-600 dark:text-slate-300">Today's Reference Date: {format(TODAY_DATE, 'PPP')}</p>
      </div>
    </div>
  );

  const renderModal = () => {
    if (!isModalOpen) return null;

    const commonModalFields = (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
                <label className="form-label" htmlFor="shipmentId">Shipment ID</label>
                <input id="shipmentId" name="shipmentId" type="text" className="input" value={formData.shipmentId || ''} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
                <label className="form-label" htmlFor="status">Status</label>
                <select id="status" name="status" className="input" value={formData.status || ''} onChange={handleInputChange} required>
                    {Object.values(ShipmentStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
                <label className="form-label" htmlFor="origin">Origin</label>
                <input id="origin" name="origin" type="text" className="input" value={formData.origin || ''} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
                <label className="form-label" htmlFor="destination">Destination</label>
                <input id="destination" name="destination" type="text" className="input" value={formData.destination || ''} onChange={handleInputChange} required />
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
                <label className="form-label" htmlFor="carrier">Carrier</label>
                <input id="carrier" name="carrier" type="text" className="input" value={formData.carrier || ''} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
                <label className="form-label" htmlFor="priority">Priority</label>
                <select id="priority" name="priority" className="input" value={formData.priority || ''} onChange={handleInputChange} required>
                    {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
                <label className="form-label" htmlFor="estimatedDeliveryDate">Estimated Delivery Date</label>
                <input id="estimatedDeliveryDate" name="estimatedDeliveryDate" type="date" className="input" value={formData.estimatedDeliveryDate || ''} onChange={handleInputChange} required/>
            </div>
            <div className="form-group">
                <label className="form-label" htmlFor="actualDeliveryDate">Actual Delivery Date</label>
                <input id="actualDeliveryDate" name="actualDeliveryDate" type="date" className="input" value={formData.actualDeliveryDate || ''} onChange={handleInputChange} />
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
                <label className="form-label" htmlFor="currentLocationLat">Current Latitude</label>
                <input id="currentLocationLat" name="currentLocation.lat" type="number" step="any" className="input" value={formData.currentLocation?.lat ?? ''} onChange={handleInputChange} required/>
            </div>
            <div className="form-group">
                <label className="form-label" htmlFor="currentLocationLng">Current Longitude</label>
                <input id="currentLocationLng" name="currentLocation.lng" type="number" step="any" className="input" value={formData.currentLocation?.lng ?? ''} onChange={handleInputChange} required/>
            </div>
        </div>
        <div className="form-group">
            <label className="form-label" htmlFor="currentLocationAddress">Current Address (Optional)</label>
            <input id="currentLocationAddress" name="currentLocation.address" type="text" className="input" value={formData.currentLocation?.address || ''} onChange={handleInputChange} />
        </div>
        <div className="form-group">
            <label className="form-label" htmlFor="parcelWeightKg">Parcel Weight (kg)</label>
            <input id="parcelWeightKg" name="parcelWeightKg" type="number" step="0.1" className="input" value={formData.parcelWeightKg || ''} onChange={handleInputChange} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="form-group">
                <label className="form-label" htmlFor="parcelDimensionsCmLength">Length (cm)</label>
                <input id="parcelDimensionsCmLength" name="parcelDimensionsCm.length" type="number" className="input" value={formData.parcelDimensionsCm?.length || ''} onChange={handleInputChange} />
            </div>
            <div className="form-group">
                <label className="form-label" htmlFor="parcelDimensionsCmWidth">Width (cm)</label>
                <input id="parcelDimensionsCmWidth" name="parcelDimensionsCm.width" type="number" className="input" value={formData.parcelDimensionsCm?.width || ''} onChange={handleInputChange} />
            </div>
            <div className="form-group">
                <label className="form-label" htmlFor="parcelDimensionsCmHeight">Height (cm)</label>
                <input id="parcelDimensionsCmHeight" name="parcelDimensionsCm.height" type="number" className="input" value={formData.parcelDimensionsCm?.height || ''} onChange={handleInputChange} />
            </div>
        </div>
        <div className="form-group">
            <label className="form-label" htmlFor="notes">Notes</label>
            <textarea id="notes" name="notes" className="input" value={formData.notes || ''} onChange={handleInputChange} rows={3}></textarea>
        </div>
      </>
    );
    
    let modalTitle = "";
    let modalBody: React.ReactNode;

    switch (modalContent) {
      case 'addShipment':
      case 'editShipment':
        modalTitle = modalContent === 'addShipment' ? 'Add New Shipment' : 'Edit Shipment';
        modalBody = (
          <form onSubmit={handleFormSubmit} id="shipment-form" className="space-y-4">
            {commonModalFields}
            {error && <p className="form-error" role="alert">{error}</p>}
            <div className="modal-footer">
              <button type="button" className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500" onClick={closeModal}>Cancel</button>
              <button type="submit" className="btn btn-primary flex items-center gap-2" disabled={isLoading}>
                {isLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                <Save className="w-4 h-4 mr-1" /> {modalContent === 'addShipment' ? 'Add Shipment' : 'Save Changes'}
              </button>
            </div>
          </form>
        );
        break;
      case 'viewShipment':
        modalTitle = `Shipment Details: ${currentShipment?.shipmentId}`;
        modalBody = currentShipment ? (
          <div className="space-y-3 text-sm">
            <p><strong>Origin:</strong> {currentShipment.origin}</p>
            <p><strong>Destination:</strong> {currentShipment.destination}</p>
            <p><strong>Status:</strong> {renderStatusBadge(currentShipment.status)}</p>
            <p><strong>Priority:</strong> {renderPriorityBadge(currentShipment.priority)}</p>
            <p><strong>Carrier:</strong> {currentShipment.carrier}</p>
            <p><strong>ETA:</strong> {currentShipment.estimatedDeliveryDate ? format(parseISO(currentShipment.estimatedDeliveryDate), 'PPP') : 'N/A'}</p>
            {currentShipment.actualDeliveryDate && <p><strong>Actual Delivery:</strong> {format(parseISO(currentShipment.actualDeliveryDate), 'PPP')}</p>}
            <p><strong>Current Location:</strong> Lat: {currentShipment.currentLocation.lat}, Lng: {currentShipment.currentLocation.lng}</p>
            {currentShipment.currentLocation.address && <p><strong>Address:</strong> {currentShipment.currentLocation.address}</p>}
            {currentShipment.parcelWeightKg && <p><strong>Weight:</strong> {currentShipment.parcelWeightKg} kg</p>}
            {currentShipment.parcelDimensionsCm && <p><strong>Dimensions:</strong> {currentShipment.parcelDimensionsCm.length}x{currentShipment.parcelDimensionsCm.width}x{currentShipment.parcelDimensionsCm.height} cm</p>}
            {currentShipment.notes && <p><strong>Notes:</strong> {currentShipment.notes}</p>}
            <p><strong>Created:</strong> {format(parseISO(currentShipment.creationDate), 'PPP HH:mm')}</p>
            <p><strong>Last Update:</strong> {format(parseISO(currentShipment.lastUpdate), 'PPP HH:mm')}</p>
            <div className="modal-footer">
              <button type="button" className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500" onClick={closeModal}>Close</button>
            </div>
          </div>
        ) : <p>Shipment data not found.</p>;
        break;
      case 'aiInsights':
        modalTitle = `AI Insights for ${shipmentToProcess?.shipmentId}`;
        modalBody = (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-slate-300">AI is analyzing shipment data for {shipmentToProcess?.shipmentId}. You can also upload a relevant document (e.g., Bill of Lading as PDF/Image) for analysis.</p>
            <div className="form-group">
                <label htmlFor="ai-file-upload" className="form-label">Upload Document (Optional)</label>
                <input id="ai-file-upload" type="file" accept=".pdf,.png,.jpg,.jpeg,.txt" className="input" onChange={handleFileSelectForAI} />
            </div>
            <div className="form-group">
                <label htmlFor="ai-prompt-override" className="form-label">AI Prompt (Edit if needed)</label>
                <textarea id="ai-prompt-override" rows={3} className="input" value={aiPromptText} onChange={(e) => setAiPromptText(e.target.value)} placeholder="Enter your prompt for AI analysis..."/>
            </div>
            {isAiLoading && <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-slate-300"><div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div> Processing...</div>}
            {aiError && <p className="form-error" role="alert">AI Error: {typeof aiError === 'string' ? aiError : JSON.stringify(aiError)}</p>}
            {aiResult && (
              <div className="prose prose-sm dark:prose-invert max-w-none p-3 border border-gray-200 dark:border-slate-700 rounded-md bg-gray-50 dark:bg-slate-900 max-h-60 overflow-y-auto">
                <div dangerouslySetInnerHTML={{ __html: aiResult.replace(/\n/g, '<br />') }} />
              </div>
            )}
             <p className="text-xs text-gray-500 dark:text-slate-400">AI responses can sometimes be inaccurate. Please verify critical information.</p>
            <div className="modal-footer">
              <button type="button" className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500" onClick={closeModal}>Cancel</button>
              <button type="button" className="btn btn-primary flex items-center gap-2" onClick={handleAiSubmit} disabled={isAiLoading || (!aiPromptText.trim() && !selectedAiFile)}>
                {isAiLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <BrainCircuit className="w-4 h-4" />} 
                Get AI Insights
              </button>
            </div>
          </div>
        );
        break;
      case 'confirmDelete':
        modalTitle = `Confirm Deletion`;
        modalBody = (
            <div className="space-y-4">
                <p>Are you sure you want to delete shipment <strong>{shipmentToProcess?.shipmentId}</strong>? This action cannot be undone.</p>
                <div className="modal-footer">
                    <button type="button" className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500" onClick={closeModal}>Cancel</button>
                    <button type="button" className="btn bg-red-500 text-white hover:bg-red-600" onClick={handleDeleteShipment}>Delete Shipment</button>
                </div>
            </div>
        );
        break;
      case 'confirmDeleteAllData':
        modalTitle = `Confirm Delete All Data`;
        modalBody = (
            <div className="space-y-4">
                <p>Are you sure you want to delete <strong>ALL</strong> shipment data? This action cannot be undone.</p>
                <div className="modal-footer">
                    <button type="button" className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500" onClick={closeModal}>Cancel</button>
                    <button type="button" className="btn bg-red-500 text-white hover:bg-red-600" onClick={executeDeleteAllData}>Delete All Data</button>
                </div>
            </div>
        );
        break;
      default:
        modalBody = <p>Modal content not available.</p>;
    }

    return (
      <div id="app-modal" className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="modal-title" onClick={closeModal}>
        <div className="modal-content theme-transition-all" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3 id="modal-title" className="text-xl font-semibold text-gray-800 dark:text-white">{modalTitle}</h3>
            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-200" aria-label="Close modal">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="mt-4">
            {modalBody}
          </div>
        </div>
      </div>
    );
  };
  
  const navItems = [
    { id: 'dashboard-tab', label: 'Dashboard', icon: LayoutDashboard, tab: 'dashboard' as Tab },
    { id: 'shipments-tab', label: 'Shipments', icon: Package, tab: 'shipments' as Tab },
    { id: 'analytics-tab', label: 'Analytics', icon: BarChart3, tab: 'analytics' as Tab },
    { id: 'settings-tab', label: 'Settings', icon: SettingsIcon, tab: 'settings' as Tab },
  ];

  return (
    <div id="welcome_fallback" className={`flex h-screen bg-gray-100 dark:bg-slate-900 text-gray-900 dark:text-slate-100 theme-transition-all ${styles.appContainer}"`}>
      <AILayer
        ref={aiLayerRef}
        prompt={aiPromptText}
        attachment={selectedAiFile || undefined}
        onResult={(apiResult) => { setAiResult(apiResult); }}
        onError={(apiError) => { setAiError(apiError); }}
        onLoading={(loadingStatus) => setIsAiLoading(loadingStatus)}
      />
      {/* Sidebar */}
      <aside id="app-sidebar" className="w-16 md:w-64 bg-white dark:bg-slate-800 p-2 md:p-4 space-y-2 md:space-y-4 shadow-lg theme-transition-all flex flex-col justify-between print:hidden">
        <div>
            <div id="app-logo-container" className="flex items-center justify-center md:justify-start gap-2 mb-6 md:mb-8 p-2">
                <Ship className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                <span id="generation_issue_fallback" className="hidden md:inline text-xl font-bold text-primary-600 dark:text-primary-400">LogisticsPro</span>
            </div>
            <nav>
            <ul>
                {navItems.map(item => (
                <li key={item.tab}>
                    <button
                    id={item.id}
                    onClick={() => setActiveTab(item.tab)}
                    className={`w-full flex items-center justify-center md:justify-start space-x-3 p-3 my-1 rounded-md font-medium transition-colors duration-150
                                ${activeTab === item.tab ? 'bg-primary-500 text-white' : 'hover:bg-primary-100 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-300'}`}
                    >
                    <item.icon className="w-5 h-5 md:w-6 md:h-6" />
                    <span className="hidden md:inline">{item.label}</span>
                    </button>
                </li>
                ))}
            </ul>
            </nav>
        </div>
        <div className="mt-auto">
             <div id="user-profile-button" className="flex items-center justify-center md:justify-start p-2 space-x-3 border-t border-gray-200 dark:border-slate-700 pt-4">
                <User className="w-8 h-8 p-1 rounded-full bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-slate-300" />
                <div className="hidden md:block">
                    <p className="text-sm font-medium">{currentUser?.first_name} {currentUser?.last_name}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">{currentUser?.email}</p>
                </div>
            </div>
            <button
                id="logout-button"
                onClick={logout}
                className="w-full flex items-center justify-center md:justify-start space-x-3 p-3 mt-2 rounded-md font-medium text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-slate-700 transition-colors duration-150"
            >
                <LogOut className="w-5 h-5 md:w-6 md:h-6" />
                <span className="hidden md:inline">Logout</span>
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
         {/* Top Bar - for theme toggle or other global actions if needed outside sidebar */}
         <header className="bg-white dark:bg-slate-800 shadow-sm p-4 flex justify-end items-center print:hidden">
            <button id="mobile-theme-toggle" onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 md:hidden" aria-label={appSettings.theme === 'dark' ? "Switch to light mode" : "Switch to dark mode"}>
                {appSettings.theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
         </header>
        <div className="flex-1 overflow-x-hidden overflow-y-auto theme-transition-bg">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'shipments' && renderShipments()}
          {activeTab === 'analytics' && renderAnalytics()}
          {activeTab === 'settings' && renderSettings()}
        </div>
         <footer className="text-center py-4 border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-gray-500 dark:text-slate-400 print:hidden">
          Copyright © 2025 Datavtar Private Limited. All rights reserved.
        </footer>
      </main>

      {renderModal()}

      {showToast && (
        <div id="toast-notification" className={`fixed bottom-5 right-5 p-4 rounded-md shadow-lg text-white animate-slide-in ${showToast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`} role="alert">
          {showToast.message}
        </div>
      )}
    </div>
  );
};

export default App;
