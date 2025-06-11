import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useAuth } from './contexts/authContext';
import styles from './styles/styles.module.css';
import { Truck, Search, Plus, MoreVertical, X, ChevronDown, ChevronUp, Edit, Trash2, FileDown, Sun, Moon, Settings, LayoutDashboard, List, BrainCircuit, BarChart3, Map, AlertCircle, CheckCircle, UploadCloud, Bot, Save, Package, Anchor } from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line, CartesianGrid } from 'recharts';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Fix for leaflet's default icon issue with webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});


// --- TYPE DEFINITIONS ---
type ShipmentStatus = 'In Transit' | 'Delivered' | 'Delayed' | 'Pending';
type SortOrder = 'asc' | 'desc';
type SortKey = keyof Shipment;

interface Shipment {
  id: string;
  trackingId: string;
  origin: string;
  destination: string;
  status: ShipmentStatus;
  carrier: string;
  estimatedDelivery: string; // ISO date string
  actualDelivery?: string; // ISO date string
  items: string;
  weight: number; // in kg
}

interface Carrier {
  id: string;
  name: string;
}

type ModalType = 'add' | 'edit' | 'delete' | null;

interface EditableShipment extends Omit<Shipment, 'id'> {}

type AppTab = 'dashboard' | 'shipments' | 'ai-processor' | 'analytics' | 'settings';

// --- MOCK DATA & HELPERS ---
const initialCarriers: Carrier[] = [
  { id: 'c1', name: 'DHL' },
  { id: 'c2', name: 'FedEx' },
  { id: 'c3', name: 'UPS' },
  { id: 'c4', name: 'Maersk' },
];

const getInitialShipments = (): Shipment[] => {
    const today = new Date('2025-06-11T12:00:00Z');
    return [
      { id: 's1', trackingId: 'SHP72301', origin: 'Shanghai, CN', destination: 'Los Angeles, US', status: 'In Transit', carrier: 'Maersk', estimatedDelivery: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(), items: "Electronics", weight: 5000 },
      { id: 's2', trackingId: 'SHP45892', origin: 'Rotterdam, NL', destination: 'New York, US', status: 'Delivered', carrier: 'FedEx', estimatedDelivery: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(), actualDelivery: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(), items: "Apparel", weight: 1200 },
      { id: 's3', trackingId: 'SHP67345', origin: 'Berlin, DE', destination: 'Paris, FR', status: 'Delayed', carrier: 'UPS', estimatedDelivery: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(), items: "Machine Parts", weight: 850 },
      { id: 's4', trackingId: 'SHP99123', origin: 'Singapore, SG', destination: 'Sydney, AU', status: 'Pending', carrier: 'DHL', estimatedDelivery: new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString(), items: "Pharmaceuticals", weight: 300 },
      { id: 's5', trackingId: 'SHP33567', origin: 'Dubai, AE', destination: 'London, UK', status: 'In Transit', carrier: 'FedEx', estimatedDelivery: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(), items: "Luxury Goods", weight: 750 },
      { id: 's6', trackingId: 'SHP82109', origin: 'Tokyo, JP', destination: 'San Francisco, US', status: 'Delivered', carrier: 'UPS', estimatedDelivery: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(), actualDelivery: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(), items: "Automotive Parts", weight: 2500 },
    ];
};

const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

// --- Custom Hook for localStorage ---
function useLocalStorage<T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T,>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue: React.Dispatch<React.SetStateAction<T>> = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}

// --- Dark Mode Hook ---
const useDarkMode = () => {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const shouldUseDark = savedTheme === 'dark' || (!savedTheme && prefersDark);

        setIsDark(shouldUseDark);
        document.documentElement.classList.toggle('dark', shouldUseDark);

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent) => {
            if (!localStorage.getItem('theme')) {
                setIsDark(e.matches);
                document.documentElement.classList.toggle('dark', e.matches);
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    const toggleDarkMode = () => {
        const newIsDark = !isDark;
        setIsDark(newIsDark);
        localStorage.setItem('theme', newIsDark ? 'dark' : 'light');
        document.documentElement.classList.toggle('dark', newIsDark);
    };

    return { isDark, toggleDarkMode };
};

// --- Main App Component ---
export default function App() {
  const { currentUser, logout } = useAuth();
  const { isDark, toggleDarkMode } = useDarkMode();
  
  const [activeTab, setActiveTab] = useLocalStorage<AppTab>('activeTab', 'dashboard');
  const [shipments, setShipments] = useLocalStorage<Shipment[]>('shipments', getInitialShipments());
  const [carriers, setCarriers] = useLocalStorage<Carrier[]>('carriers', initialCarriers);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ShipmentStatus | 'All'>('All');
  const [carrierFilter, setCarrierFilter] = useState<string>('All');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; order: SortOrder }>({ key: 'estimatedDelivery', order: 'asc' });

  const [modal, setModal] = useState<{ type: ModalType; data: Shipment | null }>({ type: null, data: null });
  const [editableShipment, setEditableShipment] = useState<EditableShipment | null>(null);

  const [newCarrierName, setNewCarrierName] = useState('');

  // AI Layer State
  const aiLayerRef = useRef<AILayerHandle>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiFile, setAiFile] = useState<File | null>(null);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiIsLoading, setAiIsLoading] = useState(false);
  const [aiError, setAiError] = useState<any | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- DERIVED STATE & MEMOIZED VALUES ---
  const filteredAndSortedShipments = useMemo(() => {
    let filtered = shipments
      .filter(s => s.trackingId.toLowerCase().includes(searchTerm.toLowerCase()))
      .filter(s => statusFilter === 'All' || s.status === statusFilter)
      .filter(s => carrierFilter === 'All' || s.carrier === carrierFilter);

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue === undefined || bValue === undefined) return 0;
        if (aValue < bValue) return sortConfig.order === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.order === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return filtered;
  }, [shipments, searchTerm, statusFilter, carrierFilter, sortConfig]);

  const stats = useMemo(() => {
    const total = shipments.length;
    const inTransit = shipments.filter(s => s.status === 'In Transit').length;
    const delivered = shipments.filter(s => s.status === 'Delivered').length;
    const delayed = shipments.filter(s => s.status === 'Delayed').length;
    const pending = shipments.filter(s => s.status === 'Pending').length;
    return { total, inTransit, delivered, delayed, pending };
  }, [shipments]);

  // --- MODAL & FORM HANDLING ---
  const openModal = (type: ModalType, data: Shipment | null = null) => {
    setModal({ type, data });
    if (type === 'edit' && data) {
      setEditableShipment({ ...data });
    } else if (type === 'add') {
      setEditableShipment({
        trackingId: `SHP${Math.floor(10000 + Math.random() * 90000)}`,
        origin: '', destination: '', status: 'Pending', carrier: carriers[0]?.name || '',
        estimatedDelivery: new Date().toISOString().split('T')[0], items: '', weight: 0,
      });
    }
  };

  const closeModal = () => {
    setModal({ type: null, data: null });
    setEditableShipment(null);
    setAiResult(null);
    setAiError(null);
    setAiFile(null);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (!editableShipment) return;
    const { name, value } = e.target;
    setEditableShipment(prev => prev ? { ...prev, [name]: name === 'weight' ? parseFloat(value) : value } : null);
  };

  const handleFormSubmit = () => {
    if (!editableShipment) return;

    if (modal.type === 'add') {
      const newShipment: Shipment = {
        id: `s${Date.now()}`,
        ...editableShipment,
        estimatedDelivery: new Date(editableShipment.estimatedDelivery).toISOString(),
      };
      setShipments(prev => [...prev, newShipment]);
    } else if (modal.type === 'edit' && modal.data) {
      setShipments(prev => prev.map(s => s.id === modal.data!.id ? { ...s, ...editableShipment, estimatedDelivery: new Date(editableShipment.estimatedDelivery).toISOString() } : s));
    }
    closeModal();
  };

  const handleDelete = () => {
    if (modal.type === 'delete' && modal.data) {
      setShipments(prev => prev.filter(s => s.id !== modal.data!.id));
      closeModal();
    }
  };
  
  // --- SORTING ---
  const requestSort = (key: SortKey) => {
    let order: SortOrder = 'asc';
    if (sortConfig.key === key && sortConfig.order === 'asc') {
      order = 'desc';
    }
    setSortConfig({ key, order });
  };
  
  const getSortIcon = (key: SortKey) => {
    if (sortConfig.key !== key) return <ChevronDown size={14} className="opacity-30" />;
    return sortConfig.order === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  // --- SETTINGS PAGE LOGIC ---
  const handleAddCarrier = () => {
    if (newCarrierName.trim() && !carriers.find(c => c.name.toLowerCase() === newCarrierName.trim().toLowerCase())) {
      const newCarrier = { id: `c${Date.now()}`, name: newCarrierName.trim() };
      setCarriers(prev => [...prev, newCarrier]);
      setNewCarrierName('');
    }
  };

  const handleDeleteCarrier = (id: string) => {
    setCarriers(prev => prev.filter(c => c.id !== id));
  };

  const handleExportData = () => {
    const headers = Object.keys(shipments[0]).join(',');
    const rows = shipments.map(row => Object.values(row).join(','));
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "shipments_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteAllData = () => {
    if (window.confirm("Are you sure you want to delete all shipment data? This action cannot be undone.")) {
      setShipments([]);
    }
  };
  
  // --- AI PROCESSOR LOGIC ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        setAiFile(e.target.files[0]);
    }
  };
  
  const handleProcessDocument = () => {
    if (!aiFile) {
        setAiError("Please select a file to process.");
        return;
    }
    setAiResult(null);
    setAiError(null);
    const internalPrompt = `Analyze the provided shipping document. Extract the following details and return them as a single JSON object with these exact keys: "origin" (string), "destination" (string), "items" (string, a brief description of goods), "weight" (number, in kg), and "carrier" (string, if mentioned). If a value isn't found, use an empty string "" for string fields and 0 for the weight. Example: {"origin": "Port of Shanghai", "destination": "Port of Long Beach", "items": "Consumer Electronics", "weight": 1250, "carrier": "Maersk"}`;
    setAiPrompt(internalPrompt);
    
    // Using a timeout to ensure state is set before calling the AI layer.
    setTimeout(() => {
        aiLayerRef.current?.sendToAI(internalPrompt, aiFile);
    }, 100);
  };
  
  useEffect(() => {
    if (aiResult) {
        try {
            const parsed = JSON.parse(aiResult);
            // Pre-fill the add shipment form with extracted data
            setEditableShipment(prev => ({
                ...(prev || {
                    trackingId: `SHP${Math.floor(10000 + Math.random() * 90000)}`,
                    estimatedDelivery: new Date().toISOString().split('T')[0],
                    status: 'Pending',
                }),
                origin: parsed.origin || '',
                destination: parsed.destination || '',
                items: parsed.items || '',
                weight: parsed.weight || 0,
                carrier: parsed.carrier || carriers[0]?.name || ''
            }));
            setActiveTab('shipments');
            openModal('add');
        } catch (e) {
            console.error("Failed to parse AI response:", e);
            setAiError("AI returned data in an unexpected format. Please check the document and try again.");
        }
    }
  }, [aiResult]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  // --- Components for Tabs ---
  const Dashboard = () => {
    const statusData = [
      { name: 'In Transit', value: stats.inTransit, color: '#3b82f6' },
      { name: 'Delivered', value: stats.delivered, color: '#22c55e' },
      { name: 'Delayed', value: stats.delayed, color: '#ef4444' },
      { name: 'Pending', value: stats.pending, color: '#f59e0b' },
    ];
    
    const deliveryPerformanceData = useMemo(() => {
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date('2025-06-11T12:00:00Z');
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
        }).reverse();
        
        return last7Days.map(day => {
            const onTime = shipments.filter(s => s.actualDelivery && s.actualDelivery.startsWith(day) && s.actualDelivery <= s.estimatedDelivery).length;
            const delayed = shipments.filter(s => s.actualDelivery && s.actualDelivery.startsWith(day) && s.actualDelivery > s.estimatedDelivery).length;
            return { name: formatDate(day), 'On-Time': onTime, 'Delayed': delayed };
        });
    }, [shipments]);

    return (
      <div id="dashboard-tab" className="animate-fade-in space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard icon={Truck} title="Total Shipments" value={stats.total} />
            <StatCard icon={Anchor} title="In Transit" value={stats.inTransit} className="text-primary-500" />
            <StatCard icon={CheckCircle} title="Delivered" value={stats.delivered} className="text-success-500" />
            <StatCard icon={AlertCircle} title="Delayed" value={stats.delayed} className="text-error-500" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-2 card card-padding">
                <h3 className="heading-6 mb-4">Shipments by Status</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                        <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                            {statusData.map((entry) => <Cell key={`cell-${entry.name}`} fill={entry.color} />)}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </RechartsPieChart>
                </ResponsiveContainer>
            </div>
            <div className="lg:col-span-3 card card-padding">
                <h3 className="heading-6 mb-4">Delivery Performance (Last 7 Days)</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={deliveryPerformanceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="On-Time" stroke="#22c55e" strokeWidth={2} />
                        <Line type="monotone" dataKey="Delayed" stroke="#ef4444" strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>
    );
  };
  
  const StatCard = ({ icon: Icon, title, value, className = '' }: { icon: React.ElementType, title: string, value: number, className?: string }) => (
    <div className="stat-card flex flex-row items-center gap-4">
        <div className={`p-3 rounded-full bg-primary-100 dark:bg-primary-900/50 ${className}`}>
            <Icon size={24} className={className || 'text-primary-600'} />
        </div>
        <div>
            <p className="stat-title">{title}</p>
            <p className="stat-value">{value}</p>
        </div>
    </div>
  );
  
  const ShipmentsTable = () => (
    <div id="shipments-tab" className="card animate-fade-in">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                    type="text"
                    placeholder="Search by Tracking ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input pl-10 w-full md:w-64"
                />
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as ShipmentStatus | 'All')} className="select">
                    <option value="All">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="In Transit">In Transit</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Delayed">Delayed</option>
                </select>
                <select value={carrierFilter} onChange={e => setCarrierFilter(e.target.value)} className="select">
                    <option value="All">All Carriers</option>
                    {carriers.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
            </div>
            <button id="add-shipment-button" onClick={() => openModal('add')} className="btn btn-primary w-full md:w-auto">
                <Plus size={16} /> Add Shipment
            </button>
        </div>
      <div id="shipments-table" className="table-container">
        <table className="table">
          <thead className="table-header">
            <tr>
              <th className="table-header-cell cursor-pointer" onClick={() => requestSort('trackingId')}>
                  <div className="flex items-center gap-2">Tracking ID {getSortIcon('trackingId')}</div>
              </th>
              <th className="table-header-cell cursor-pointer" onClick={() => requestSort('origin')}>
                  <div className="flex items-center gap-2">Origin {getSortIcon('origin')}</div>
              </th>
              <th className="table-header-cell cursor-pointer" onClick={() => requestSort('destination')}>
                  <div className="flex items-center gap-2">Destination {getSortIcon('destination')}</div>
              </th>
              <th className="table-header-cell cursor-pointer" onClick={() => requestSort('status')}>
                  <div className="flex items-center gap-2">Status {getSortIcon('status')}</div>
              </th>
              <th className="table-header-cell cursor-pointer" onClick={() => requestSort('carrier')}>
                  <div className="flex items-center gap-2">Carrier {getSortIcon('carrier')}</div>
              </th>
              <th className="table-header-cell cursor-pointer" onClick={() => requestSort('estimatedDelivery')}>
                  <div className="flex items-center gap-2">Est. Delivery {getSortIcon('estimatedDelivery')}</div>
              </th>
              <th className="table-header-cell">Actions</th>
            </tr>
          </thead>
          <tbody className="table-body">
            {filteredAndSortedShipments.map(shipment => (
              <tr key={shipment.id} className="table-row">
                <td className="table-cell font-medium text-primary-600 dark:text-primary-400">{shipment.trackingId}</td>
                <td className="table-cell">{shipment.origin}</td>
                <td className="table-cell">{shipment.destination}</td>
                <td className="table-cell"><StatusBadge status={shipment.status} /></td>
                <td className="table-cell">{shipment.carrier}</td>
                <td className="table-cell">{formatDate(shipment.estimatedDelivery)}</td>
                <td className="table-cell">
                  <div className="dropdown">
                    <button className="btn btn-ghost btn-sm">
                      <MoreVertical size={16} />
                    </button>
                    <div className="dropdown-content hidden">
                      <button onClick={() => openModal('edit', shipment)} className="dropdown-item w-full text-left">Edit</button>
                      <button onClick={() => openModal('delete', shipment)} className="dropdown-item w-full text-left text-error-600">Delete</button>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
  
  const StatusBadge = ({ status }: { status: ShipmentStatus }) => {
    const statusClasses = {
      'Delivered': 'badge-success',
      'In Transit': 'badge-primary',
      'Delayed': 'badge-error',
      'Pending': 'badge-warning',
    };
    return <span className={`badge ${statusClasses[status]}`}>{status}</span>;
  };

  const AiProcessor = () => (
    <div id="ai-processor-tab" className="animate-fade-in card max-w-2xl mx-auto card-padding">
        <div className="text-center">
            <Bot size={48} className="mx-auto text-primary-500" />
            <h2 className="heading-4 mt-4">AI Document Processor</h2>
            <p className="text-body text-gray-600 dark:text-gray-400 mt-2">
                Upload a shipping document (e.g., bill of lading, invoice) and our AI will automatically extract the details to create a new shipment entry.
            </p>
        </div>

        <div className="mt-8 space-y-4">
            <div>
                <label htmlFor="file-upload" className="form-label">Shipping Document</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                        <UploadCloud size={48} className="mx-auto text-gray-400" />
                        <div className="flex text-sm text-gray-600 dark:text-gray-400">
                            <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-gray-900 rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                                <span>Upload a file</span>
                                <input id="file-upload" name="file-upload" type="file" className="sr-only" ref={fileInputRef} onChange={handleFileChange} accept="image/*,.pdf"/>
                            </label>
                            <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
                    </div>
                </div>
                {aiFile && <p className="text-sm text-gray-500 mt-2">Selected file: {aiFile.name}</p>}
            </div>

            <button
                onClick={handleProcessDocument}
                disabled={!aiFile || aiIsLoading}
                className="btn btn-primary btn-lg w-full"
            >
                {aiIsLoading ? 'Processing...' : 'Process Document & Create Shipment'}
            </button>
            
            {aiError && <div className="alert alert-error mt-4">{aiError}</div>}
            
            <div className="alert alert-info mt-6">
                <AlertCircle className="h-5 w-5" />
                <p className="text-sm">
                    AI can make mistakes. Please review the extracted information in the next step before saving the new shipment.
                </p>
            </div>
        </div>
    </div>
  );
  
  const Analytics = () => {
    const carrierPerformanceData = useMemo(() => {
        return carriers.map(carrier => {
            const carrierShipments = shipments.filter(s => s.carrier === carrier.name);
            const delivered = carrierShipments.filter(s => s.status === 'Delivered').length;
            const delayed = carrierShipments.filter(s => s.status === 'Delayed').length;
            return { name: carrier.name, Delivered: delivered, Delayed: delayed };
        });
    }, [shipments, carriers]);
    
    // Dummy coordinates for map visualization
    const cityCoordinates: { [key: string]: [number, number] } = {
        'Los Angeles, US': [34.0522, -118.2437], 'New York, US': [40.7128, -74.0060], 'Paris, FR': [48.8566, 2.3522],
        'Sydney, AU': [-33.8688, 151.2093], 'London, UK': [51.5074, -0.1278], 'San Francisco, US': [37.7749, -122.4194],
        'Shanghai, CN': [31.2304, 121.4737], 'Rotterdam, NL': [51.9244, 4.4777], 'Berlin, DE': [52.5200, 13.4050],
        'Singapore, SG': [1.3521, 103.8198], 'Dubai, AE': [25.276987, 55.296249], 'Tokyo, JP': [35.6762, 139.6503],
    };

    return (
        <div id="analytics-tab" className="animate-fade-in space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card card-padding">
                    <h3 className="heading-6 mb-4">Carrier Performance</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={carrierPerformanceData} layout="vertical" margin={{ left: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis type="category" dataKey="name" width={80} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="Delivered" stackId="a" fill="#22c55e" />
                            <Bar dataKey="Delayed" stackId="a" fill="#ef4444" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="card h-[400px]">
                    <MapContainer center={[20, 0]} zoom={2} style={{ height: '100%', width: '100%' }} className="rounded-lg">
                        <TileLayer
                            url={isDark ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"}
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                        />
                        {shipments.filter(s => s.status === 'In Transit').map(shipment => {
                            const originCoords = cityCoordinates[shipment.origin];
                            if (!originCoords) return null;
                            return (
                                <Marker key={shipment.id} position={originCoords}>
                                    <Popup>
                                        <strong>{shipment.trackingId}</strong><br/>
                                        {shipment.origin} to {shipment.destination}<br/>
                                        Status: {shipment.status}
                                    </Popup>
                                </Marker>
                            );
                        })}
                    </MapContainer>
                </div>
            </div>
        </div>
    );
  };

  const Settings = () => (
    <div id="settings-tab" className="animate-fade-in space-y-6 max-w-4xl mx-auto">
        <div className="card card-padding">
            <h3 className="heading-5 mb-4">General Settings</h3>
            <div className="flex-between">
                <span className="form-label">Theme</span>
                <button onClick={toggleDarkMode} className="btn btn-secondary">
                    {isDark ? <Sun size={16}/> : <Moon size={16} />}
                    <span className="ml-2">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
            </div>
        </div>
        <div className="card card-padding">
            <h3 className="heading-5 mb-4">Manage Carriers</h3>
            <div className="flex gap-2 mb-4">
                <input
                    type="text"
                    value={newCarrierName}
                    onChange={(e) => setNewCarrierName(e.target.value)}
                    placeholder="New carrier name"
                    className="input flex-grow"
                />
                <button onClick={handleAddCarrier} className="btn btn-primary"><Plus size={16} /></button>
            </div>
            <ul className="space-y-2">
                {carriers.map(carrier => (
                    <li key={carrier.id} className="flex-between p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                        <span>{carrier.name}</span>
                        <button onClick={() => handleDeleteCarrier(carrier.id)} className="btn btn-ghost btn-sm text-error-500">
                            <Trash2 size={16} />
                        </button>
                    </li>
                ))}
            </ul>
        </div>
        <div className="card card-padding">
            <h3 className="heading-5 mb-4">Data Management</h3>
            <div className="space-y-4">
                <div className="flex-between">
                    <p>Export all shipment data to a CSV file.</p>
                    <button onClick={handleExportData} className="btn btn-secondary">
                        <FileDown size={16} /> Export Data
                    </button>
                </div>
                <div className="flex-between p-4 border border-error-500/30 bg-error-50 dark:bg-error-900/20 rounded-lg">
                    <div>
                        <p className="font-semibold text-error-700 dark:text-error-400">Danger Zone</p>
                        <p className="text-sm text-error-600 dark:text-error-500">This action is irreversible.</p>
                    </div>
                    <button onClick={handleDeleteAllData} className="btn btn-error">
                        <Trash2 size={16} /> Delete All Data
                    </button>
                </div>
            </div>
        </div>
    </div>
  );

  const renderTabContent = () => {
    switch(activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'shipments': return <ShipmentsTable />;
      case 'ai-processor': return <AiProcessor />;
      case 'analytics': return <Analytics />;
      case 'settings': return <Settings />;
      default: return <Dashboard />;
    }
  };

  const TabButton = ({ tabId, icon: Icon, label }: { tabId: AppTab, icon: React.ElementType, label: string }) => (
    <button
      id={`${tabId}-nav-link`}
      onClick={() => setActiveTab(tabId)}
      className={`nav-link ${activeTab === tabId ? 'nav-link-active' : ''}`}
    >
      <Icon size={18} />
      <span>{label}</span>
    </button>
  );

  return (
    <div id="welcome_fallback" className={`flex h-screen bg-gray-50 dark:bg-gray-950 font-sans text-gray-900 dark:text-gray-100 ${styles.appContainer}`}>
      <AILayer
          ref={aiLayerRef}
          prompt={aiPrompt}
          attachment={aiFile || undefined}
          onResult={(apiResult) => setAiResult(apiResult)}
          onError={(apiError) => setAiError(apiError)}
          onLoading={(loadingStatus) => setAiIsLoading(loadingStatus)}
      />
      <aside className="w-64 flex-shrink-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
        <div className="h-16 flex items-center px-4 border-b border-gray-200 dark:border-gray-800">
          <Truck size={24} className="text-primary-500" />
          <h1 className="ml-2 text-xl font-bold">Logistics CC</h1>
        </div>
        <nav className="flex-grow p-4 space-y-2">
          <TabButton tabId="dashboard" icon={LayoutDashboard} label="Dashboard" />
          <TabButton tabId="shipments" icon={List} label="Shipments" />
          <TabButton tabId="ai-processor" icon={BrainCircuit} label="AI Processor" />
          <TabButton tabId="analytics" icon={BarChart3} label="Analytics" />
          <TabButton tabId="settings" icon={Settings} label="Settings" />
        </nav>
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center">
                <img src={`https://i.pravatar.cc/40?u=${currentUser?.id}`} alt="User" className="w-10 h-10 rounded-full" />
                <div className="ml-3">
                    <p className="font-semibold text-sm">{currentUser?.first_name} {currentUser?.last_name}</p>
                    <p className="text-xs text-gray-500">{currentUser?.role}</p>
                </div>
            </div>
            <button onClick={logout} className="btn btn-secondary w-full mt-4">Logout</button>
        </div>
      </aside>
      
      <main id="generation_issue_fallback" className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex-shrink-0 flex items-center justify-between px-6">
            <h2 className="heading-5 capitalize">{activeTab.replace('-', ' ')}</h2>
            <div className="flex items-center gap-4">
                <button
                    onClick={toggleDarkMode}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                    {isDark ? <Sun /> : <Moon />}
                </button>
            </div>
        </header>
        <div className="flex-1 overflow-y-auto p-6">
          {renderTabContent()}
        </div>
        <footer className="text-center py-2 text-xs text-gray-500 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
          Copyright © 2025 of Datavtar Private Limited. All rights reserved.
        </footer>
      </main>

      {modal.type && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal-content animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
                <h3 className="heading-5">{modal.type === 'add' ? 'Add New Shipment' : modal.type === 'edit' ? 'Edit Shipment' : 'Confirm Deletion'}</h3>
                <button onClick={closeModal} className="btn btn-ghost btn-sm p-1"><X size={20}/></button>
            </div>
            {modal.type === 'add' || modal.type === 'edit' ? (
              <>
                <div className="modal-body grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group"><label className="form-label">Tracking ID</label><input type="text" name="trackingId" value={editableShipment?.trackingId || ''} onChange={handleFormChange} className="input" disabled/></div>
                  <div className="form-group"><label className="form-label">Origin</label><input type="text" name="origin" value={editableShipment?.origin || ''} onChange={handleFormChange} className="input"/></div>
                  <div className="form-group"><label className="form-label">Destination</label><input type="text" name="destination" value={editableShipment?.destination || ''} onChange={handleFormChange} className="input"/></div>
                  <div className="form-group"><label className="form-label">Status</label><select name="status" value={editableShipment?.status} onChange={handleFormChange} className="select"><option>Pending</option><option>In Transit</option><option>Delivered</option><option>Delayed</option></select></div>
                  <div className="form-group"><label className="form-label">Carrier</label><select name="carrier" value={editableShipment?.carrier} onChange={handleFormChange} className="select">{carriers.map(c => <option key={c.id}>{c.name}</option>)}</select></div>
                  <div className="form-group"><label className="form-label">Est. Delivery</label><input type="date" name="estimatedDelivery" value={editableShipment?.estimatedDelivery.split('T')[0] || ''} onChange={handleFormChange} className="input"/></div>
                  <div className="form-group col-span-2"><label className="form-label">Items</label><input type="text" name="items" value={editableShipment?.items || ''} onChange={handleFormChange} className="input"/></div>
                  <div className="form-group col-span-2"><label className="form-label">Weight (kg)</label><input type="number" name="weight" value={editableShipment?.weight || 0} onChange={handleFormChange} className="input"/></div>
                </div>
                <div className="modal-footer">
                  <button onClick={closeModal} className="btn btn-secondary">Cancel</button>
                  <button onClick={handleFormSubmit} className="btn btn-primary"><Save size={16}/> Save Changes</button>
                </div>
              </>
            ) : (
                <>
                <div className="modal-body">
                    <p>Are you sure you want to delete shipment <strong>{modal.data?.trackingId}</strong>? This action cannot be undone.</p>
                </div>
                <div className="modal-footer">
                  <button onClick={closeModal} className="btn btn-secondary">Cancel</button>
                  <button onClick={handleDelete} className="btn btn-error"><Trash2 size={16}/> Delete Shipment</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}