import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useAuth } from './contexts/authContext';
import styles from './styles/styles.module.css';
import {
    LayoutDashboard, Truck, User, Map, BarChart2, Settings, PlusCircle, Search, Edit, Trash2, X, Sun, Moon,
    ChevronDown, ChevronUp, ArrowDownUp, Download, Upload, FileText, Bot, Sparkles, Wrench, Calendar, Info,
    Save, ChevronsUpDown, Check, MapPin, Package, Building, Route, AlertTriangle, LogOut
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell,
    TooltipProps
} from 'recharts';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css';
import 'leaflet-defaulticon-compatibility';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';

// Type Definitions
enum ShipmentStatus {
    Pending = 'Pending',
    InProgress = 'In Progress',
    Delivered = 'Delivered',
    Cancelled = 'Cancelled'
}

enum VehicleStatus {
    Available = 'Available',
    OnTrip = 'On Trip',
    Maintenance = 'Maintenance'
}

interface Shipment {
    id: string;
    origin: string;
    destination: string;
    customerName: string;
    cargoDetails: string;
    status: ShipmentStatus;
    assignedVehicleId: string | null;
    assignedDriverId: string | null;
    creationDate: string;
    deliveryDate: string | null;
    route?: [number, number][];
}

interface Vehicle {
    id: string;
    registrationNumber: string;
    type: string;
    capacityKg: number;
    status: VehicleStatus;
    model: string;
    year: number;
    mileage: number;
    currentLocation: [number, number];
}

interface Driver {
    id: string;
    name: string;
    licenseNumber: string;
    contact: string;
    status: 'Active' | 'Inactive';
}

type AppData = {
    shipments: Shipment[];
    vehicles: Vehicle[];
    drivers: Driver[];
};

type View = 'dashboard' | 'shipments' | 'vehicles' | 'drivers' | 'tracking' | 'settings';

type SortConfig = {
    key: keyof Shipment | keyof Vehicle | keyof Driver;
    direction: 'ascending' | 'descending';
} | null;

// Mock Geo Locations for Demo
const LOCATIONS: { [key: string]: [number, number] } = {
    "New York, NY": [40.7128, -74.0060],
    "Los Angeles, CA": [34.0522, -118.2437],
    "Chicago, IL": [41.8781, -87.6298],
    "Houston, TX": [29.7604, -95.3698],
    "Phoenix, AZ": [33.4484, -112.0740],
    "Philadelphia, PA": [39.9526, -75.1652],
    "San Antonio, TX": [29.4241, -98.4936],
    "San Diego, CA": [32.7157, -117.1611],
    "Dallas, TX": [32.7767, -96.7970],
    "San Jose, CA": [37.3382, -121.8863],
};

const LOCATION_NAMES = Object.keys(LOCATIONS);

const generateId = () => `id_${new Date().getTime()}_${Math.random().toString(36).substr(2, 9)}`;

const initialData: AppData = {
    shipments: [
        { id: 'SH001', origin: 'New York, NY', destination: 'Chicago, IL', customerName: 'Global Exports', cargoDetails: 'Electronics, 500kg', status: ShipmentStatus.Delivered, assignedVehicleId: 'V001', assignedDriverId: 'D001', creationDate: '2025-05-10T10:00:00Z', deliveryDate: '2025-05-12T14:00:00Z', route: [LOCATIONS["New York, NY"], [41.2, -80.0], LOCATIONS["Chicago, IL"]] },
        { id: 'SH002', origin: 'Los Angeles, CA', destination: 'Phoenix, AZ', customerName: 'West Coast Imports', cargoDetails: 'Apparel, 300kg', status: ShipmentStatus.InProgress, assignedVehicleId: 'V002', assignedDriverId: 'D002', creationDate: '2025-06-05T11:30:00Z', deliveryDate: null },
        { id: 'SH003', origin: 'Houston, TX', destination: 'Dallas, TX', customerName: 'Texas Goods', cargoDetails: 'Groceries, 1200kg', status: ShipmentStatus.Pending, assignedVehicleId: null, assignedDriverId: null, creationDate: '2025-06-07T09:00:00Z', deliveryDate: null },
        { id: 'SH004', origin: 'San Diego, CA', destination: 'San Jose, CA', customerName: 'Tech Solutions', cargoDetails: 'Computer Parts, 250kg', status: ShipmentStatus.Cancelled, assignedVehicleId: 'V003', assignedDriverId: 'D003', creationDate: '2025-05-20T15:00:00Z', deliveryDate: null },
    ],
    vehicles: [
        { id: 'V001', registrationNumber: 'NY-TRK-01', type: 'Semi-Trailer', capacityKg: 20000, status: VehicleStatus.Available, model: 'Freightliner Cascadia', year: 2022, mileage: 150000, currentLocation: LOCATIONS["Chicago, IL"] },
        { id: 'V002', registrationNumber: 'CA-TRK-02', type: 'Box Truck', capacityKg: 7000, status: VehicleStatus.OnTrip, model: 'Isuzu N-Series', year: 2023, mileage: 50000, currentLocation: [33.7, -117.5] },
        { id: 'V003', registrationNumber: 'TX-TRK-03', type: 'Refrigerated Truck', capacityKg: 15000, status: VehicleStatus.Maintenance, model: 'Kenworth T680', year: 2021, mileage: 250000, currentLocation: LOCATIONS["Dallas, TX"] },
        { id: 'V004', registrationNumber: 'FL-TRK-04', type: 'Flatbed', capacityKg: 22000, status: VehicleStatus.Available, model: 'Peterbilt 579', year: 2024, mileage: 12000, currentLocation: LOCATIONS["Houston, TX"] },
    ],
    drivers: [
        { id: 'D001', name: 'John Smith', licenseNumber: 'DLN12345', contact: '555-0101', status: 'Active' },
        { id: 'D002', name: 'Maria Garcia', licenseNumber: 'DLN67890', contact: '555-0102', status: 'Active' },
        { id: 'D003', name: 'Chen Wang', licenseNumber: 'DLN54321', contact: '555-0103', status: 'Inactive' },
    ]
};

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
        return (
            <div className="p-2 text-sm bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-md shadow-lg">
                <p className="font-bold text-gray-800 dark:text-slate-200">{label}</p>
                <p className="text-primary-500">{`Shipments: ${payload[0].value}`}</p>
            </div>
        );
    }
    return null;
};

export default function App() {
    const { currentUser, logout } = useAuth();
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [view, setView] = useState<View>('dashboard');
    const [data, setData] = useState<AppData>({ shipments: [], vehicles: [], drivers: [] });
    const [isLoading, setIsLoading] = useState(true);

    const [modal, setModal] = useState<{ type: string | null, data?: any }>({ type: null });
    const [deleteConfirm, setDeleteConfirm] = useState<{ type: string | null, id: string | null }>({ type: null, id: null });
    
    const [searchTerm, setSearchTerm] = useState('');
    const [shipmentStatusFilter, setShipmentStatusFilter] = useState<ShipmentStatus | 'all'>('all');
    const [sortConfig, setSortConfig] = useState<SortConfig>(null);

    const [selectedShipmentOnMap, setSelectedShipmentOnMap] = useState<Shipment | null>(null);
    
    // AI related state
    const aiLayerRef = useRef<AILayerHandle>(null);
    const [aiResult, setAiResult] = useState<string | null>(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState<any | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);


    useEffect(() => {
        const savedDarkMode = localStorage.getItem('darkMode') === 'true';
        setIsDarkMode(savedDarkMode);
        document.documentElement.classList.toggle('dark', savedDarkMode);

        try {
            const savedData = localStorage.getItem('transportAppData');
            if (savedData) {
                setData(JSON.parse(savedData));
            } else {
                setData(initialData); // Load initial data if nothing in storage
            }
        } catch (error) {
            console.error("Failed to parse data from localStorage", error);
            setData(initialData);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!isLoading) {
            localStorage.setItem('transportAppData', JSON.stringify(data));
        }
    }, [data, isLoading]);
    
    const toggleDarkMode = () => {
        setIsDarkMode(prev => {
            const newMode = !prev;
            localStorage.setItem('darkMode', String(newMode));
            document.documentElement.classList.toggle('dark', newMode);
            return newMode;
        });
    };
    
    const handleSave = (type: 'shipment' | 'vehicle' | 'driver', itemData: any) => {
        const collection = `${type}s` as keyof AppData;
        
        setData(prev => {
            const newCollection = itemData.id 
                ? prev[collection].map((i: any) => i.id === itemData.id ? itemData : i)
                : [...prev[collection], { ...itemData, id: generateId() }];
            return { ...prev, [collection]: newCollection };
        });
        setModal({ type: null });
    };

    const handleDelete = (type: string, id: string) => {
        const collection = `${type}s` as keyof AppData;
        setData(prev => ({
            ...prev,
            [collection]: prev[collection].filter((i: any) => i.id !== id)
        }));
        setDeleteConfirm({ type: null, id: null });
    };

    const requestSort = (key: keyof Shipment | keyof Vehicle | keyof Driver) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };
    
    const sortedAndFilteredData = useMemo(() => {
        let items: any[] = [];
        if (view === 'shipments') items = [...data.shipments];
        if (view === 'vehicles') items = [...data.vehicles];
        if (view === 'drivers') items = [...data.drivers];
    
        // Filtering
        if (view === 'shipments') {
             if (shipmentStatusFilter !== 'all') {
                items = items.filter(s => s.status === shipmentStatusFilter);
            }
            if (searchTerm) {
                items = items.filter(s => 
                    s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    s.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    s.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    s.destination.toLowerCase().includes(searchTerm.toLowerCase())
                );
            }
        } else if (searchTerm) {
             items = items.filter(item => 
                Object.values(item).some(val => 
                    String(val).toLowerCase().includes(searchTerm.toLowerCase())
                )
            );
        }

        // Sorting
        if (sortConfig !== null) {
            items.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return items;
    }, [data, view, searchTerm, shipmentStatusFilter, sortConfig]);

    const handleFileUploadForAI = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setAiResult(null);
        setAiError(null);
        const prompt = `Extract structured data from this transport document. The document could be an invoice, bill of lading, or a shipping order. Extract sender name, receiver name, origin address, destination address, cargo details/items, and total weight. Return the result as a single compact JSON object with keys: "customerName", "origin", "destination", "cargoDetails". If a value is not found, return an empty string for it.`;
        
        aiLayerRef.current?.sendToAI(prompt, file);
    };

    useEffect(() => {
        if (aiResult && modal.type === 'add-shipment') {
            try {
                const parsedResult = JSON.parse(aiResult);
                // Update form state if modal is open with form
                setModal(prev => ({
                    ...prev,
                    data: {
                        ...prev.data,
                        customerName: parsedResult.customerName || '',
                        origin: parsedResult.origin || '',
                        destination: parsedResult.destination || '',
                        cargoDetails: parsedResult.cargoDetails || '',
                    }
                }));
            } catch (error) {
                console.error("AI result is not valid JSON:", error);
                setAiError("AI returned data in an unexpected format. Please enter details manually.");
            }
        } else if (aiResult && modal.type === 'predict-maintenance') {
            try {
                const parsedResult = JSON.parse(aiResult);
                setModal(prev => ({
                    ...prev,
                    data: {
                        ...prev.data,
                        prediction: parsedResult
                    }
                }));
            } catch (error) {
                setAiError("Could not parse maintenance prediction.");
            }
        } else if (aiResult && selectedShipmentOnMap) {
             try {
                const parsedResult = JSON.parse(aiResult);
                if (parsedResult.route) {
                    setData(prev => ({
                        ...prev,
                        shipments: prev.shipments.map(s => s.id === selectedShipmentOnMap.id ? {...s, route: parsedResult.route} : s)
                    }));
                }
            } catch (error) {
                setAiError("Could not parse route information.");
            }
        }
    }, [aiResult, modal.type, selectedShipmentOnMap]);


    const renderStatusBadge = (status: ShipmentStatus | VehicleStatus) => {
        const baseClasses = "badge";
        switch (status) {
            case ShipmentStatus.Delivered:
            case VehicleStatus.Available:
                return <span className={`${baseClasses} badge-success`}>{status}</span>;
            case ShipmentStatus.InProgress:
            case VehicleStatus.OnTrip:
                return <span className={`${baseClasses} badge-info`}>{status}</span>;
            case ShipmentStatus.Pending:
            case VehicleStatus.Maintenance:
                return <span className={`${baseClasses} badge-warning`}>{status}</span>;
            case ShipmentStatus.Cancelled:
                return <span className={`${baseClasses} badge-error`}>{status}</span>;
            default:
                return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>{status}</span>;
        }
    };
    
    const handleOptimizeRoute = (shipment: Shipment) => {
        setSelectedShipmentOnMap(shipment);
        const prompt = `Generate an optimized driving route from ${shipment.origin} to ${shipment.destination}. Return a JSON object with a single key "route", which is an array of [lat, lng] coordinates for the polyline. Include at least 3 waypoints between origin and destination.`;
        aiLayerRef.current?.sendToAI(prompt);
    }
    
    // Key-down handler for closing modals
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setModal({ type: null });
                setDeleteConfirm({ type: null, id: null });
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const MainContent = () => {
        switch (view) {
            case 'dashboard': return <DashboardView />;
            case 'shipments': return <ShipmentsView />;
            case 'vehicles': return <VehiclesView />;
            case 'drivers': return <DriversView />;
            case 'tracking': return <TrackingView />;
            case 'settings': return <SettingsView />;
            default: return <DashboardView />;
        }
    };

    const DashboardView = () => {
        const stats = {
            totalShipments: data.shipments.length,
            inProgress: data.shipments.filter(s => s.status === ShipmentStatus.InProgress).length,
            vehiclesAvailable: data.vehicles.filter(v => v.status === VehicleStatus.Available).length,
            deliveriesThisMonth: data.shipments.filter(s => s.status === ShipmentStatus.Delivered && new Date(s.deliveryDate!).getMonth() === new Date().getMonth()).length
        };
        
        const chartData = useMemo(() => {
            const months = Array.from({ length: 6 }, (_, i) => subMonths(new Date("2025-06-08"), 5 - i));
            return months.map(month => ({
                name: format(month, 'MMM yy'),
                shipments: data.shipments.filter(s => {
                    const creationDate = new Date(s.creationDate);
                    return creationDate >= startOfMonth(month) && creationDate <= endOfMonth(month);
                }).length
            }));
        }, [data.shipments]);

        const statusDistribution = useMemo(() => {
            const counts = data.shipments.reduce((acc, s) => {
                acc[s.status] = (acc[s.status] || 0) + 1;
                return acc;
            }, {} as Record<ShipmentStatus, number>);
            return Object.entries(counts).map(([name, value]) => ({ name, value }));
        }, [data.shipments]);

        const PIE_COLORS = {
            [ShipmentStatus.Pending]: '#f59e0b', // amber-500
            [ShipmentStatus.InProgress]: '#3b82f6', // blue-500
            [ShipmentStatus.Delivered]: '#22c55e', // green-500
            [ShipmentStatus.Cancelled]: '#ef4444', // red-500
        };

        return (
            <div id="dashboard-tab" className="p-4 sm:p-6 space-y-6 fade-in">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">Dashboard</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard icon={<Truck className="text-blue-500"/>} title="Total Shipments" value={stats.totalShipments} />
                    <StatCard icon={<Route className="text-yellow-500"/>} title="In Progress" value={stats.inProgress} />
                    <StatCard icon={<Check className="text-green-500"/>} title="Vehicles Available" value={stats.vehiclesAvailable} />
                    <StatCard icon={<Package className="text-purple-500"/>} title="Deliveries This Month" value={stats.deliveriesThisMonth} />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    <div className="lg:col-span-3 card h-96">
                        <h3 className="font-semibold mb-4 text-gray-700 dark:text-slate-300">Shipments Overview (Last 6 Months)</h3>
                        <ResponsiveContainer>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128,128,128,0.2)" />
                                <XAxis dataKey="name" tick={{ fill: isDarkMode ? '#cbd5e1' : '#64748b' }} axisLine={{ stroke: isDarkMode ? '#475569' : '#e2e8f0' }} tickLine={false} />
                                <YAxis tick={{ fill: isDarkMode ? '#cbd5e1' : '#64748b' }} axisLine={{ stroke: isDarkMode ? '#475569' : '#e2e8f0' }} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(128,128,128,0.1)' }}/>
                                <Legend />
                                <Bar dataKey="shipments" fill="var(--color-primary, #3b82f6)" name="Shipments" barSize={20} radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="lg:col-span-2 card h-96 flex flex-col">
                        <h3 className="font-semibold mb-4 text-gray-700 dark:text-slate-300">Status Distribution</h3>
                        <ResponsiveContainer>
                           <PieChart>
                                <Pie data={statusDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                                      const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                      const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
                                      const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
                                      return (
                                        <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize="12">
                                          {`${(percent * 100).toFixed(0)}%`}
                                        </text>
                                      );
                                    }}>
                                    {statusDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[entry.name as ShipmentStatus]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value, name) => [value, name]}/>
                                <Legend iconSize={10} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                 <div className="card">
                    <h3 className="font-semibold mb-4 text-gray-700 dark:text-slate-300">Recent Shipments</h3>
                    <div className="overflow-x-auto">
                        <table className="table">
                             <thead>
                                <tr>
                                    <th className="table-header">ID</th>
                                    <th className="table-header">Customer</th>
                                    <th className="table-header">Destination</th>
                                    <th className="table-header">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                                {data.shipments.slice(0, 5).map(shipment => (
                                    <tr key={shipment.id} className="hover:bg-gray-50 dark:hover:bg-slate-800">
                                        <td className="table-cell font-mono text-xs">{shipment.id}</td>
                                        <td className="table-cell">{shipment.customerName}</td>
                                        <td className="table-cell">{shipment.destination}</td>
                                        <td className="table-cell">{renderStatusBadge(shipment.status)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };
    
    const StatCard = ({ icon, title, value }: { icon: React.ReactNode; title: string; value: string | number }) => (
        <div className="stat-card theme-transition-all hover:shadow-lg hover:-translate-y-1">
            <div className="flex justify-between items-start">
                <div className="stat-title">{title}</div>
                <div className="p-2 bg-gray-100 dark:bg-slate-700 rounded-full">
                    {icon}
                </div>
            </div>
            <div className="stat-value">{value}</div>
        </div>
    );
    
    const ShipmentsView = () => (
        <div id="shipments-tab" className="p-4 sm:p-6 space-y-4 fade-in">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">Shipments</h1>
                <button id="add-shipment-button" className="btn btn-primary flex-center gap-2 w-full sm:w-auto" onClick={() => setModal({ type: 'add-shipment', data: { status: ShipmentStatus.Pending } })}>
                    <PlusCircle size={18} /> New Shipment
                </button>
            </div>
            <div className="card">
                 <div className="flex flex-col md:flex-row gap-4 mb-4">
                    <div className="relative flex-grow">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                        <input
                            type="text"
                            placeholder="Search by ID, customer, location..."
                            className="input pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className="input"
                        value={shipmentStatusFilter}
                        onChange={(e) => setShipmentStatusFilter(e.target.value as ShipmentStatus | 'all')}
                    >
                        <option value="all">All Statuses</option>
                        {Object.values(ShipmentStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th className="table-header cursor-pointer" onClick={() => requestSort('id')}>ID <ArrowDownUp size={12} className="inline"/></th>
                                <th className="table-header cursor-pointer" onClick={() => requestSort('customerName')}>Customer <ArrowDownUp size={12} className="inline"/></th>
                                <th className="table-header">Origin</th>
                                <th className="table-header">Destination</th>
                                <th className="table-header cursor-pointer" onClick={() => requestSort('status')}>Status <ArrowDownUp size={12} className="inline"/></th>
                                <th className="table-header">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                            {sortedAndFilteredData.map((shipment: Shipment) => (
                                <tr key={shipment.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                                    <td className="table-cell font-mono text-xs">{shipment.id}</td>
                                    <td className="table-cell">{shipment.customerName}</td>
                                    <td className="table-cell">{shipment.origin}</td>
                                    <td className="table-cell">{shipment.destination}</td>
                                    <td className="table-cell">{renderStatusBadge(shipment.status)}</td>
                                    <td className="table-cell space-x-2">
                                        <button className="p-1 text-gray-500 hover:text-blue-500" onClick={() => setModal({type: 'edit-shipment', data: shipment})}><Edit size={16}/></button>
                                        <button className="p-1 text-gray-500 hover:text-red-500" onClick={() => setDeleteConfirm({type: 'shipment', id: shipment.id})}><Trash2 size={16}/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
    
    const VehiclesView = () => (
         <div id="vehicles-tab" className="p-4 sm:p-6 space-y-4 fade-in">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">Vehicles</h1>
                <button className="btn btn-primary flex-center gap-2 w-full sm:w-auto" onClick={() => setModal({ type: 'add-vehicle', data: { status: VehicleStatus.Available } })}>
                    <PlusCircle size={18} /> Add Vehicle
                </button>
            </div>
            <div className="card">
                <div className="grid-responsive">
                    {sortedAndFilteredData.map((v: Vehicle) => (
                        <div key={v.id} className="card card-sm bg-gray-50 dark:bg-slate-700/50 flex flex-col justify-between gap-4">
                            <div>
                                <div className="flex-between">
                                    <h3 className="font-bold text-lg text-gray-800 dark:text-white">{v.registrationNumber}</h3>
                                    {renderStatusBadge(v.status)}
                                </div>
                                <p className="text-sm text-gray-500 dark:text-slate-400">{v.model} ({v.year})</p>
                                <div className="mt-4 space-y-2 text-sm">
                                    <p><span className="font-medium">Type:</span> {v.type}</p>
                                    <p><span className="font-medium">Capacity:</span> {v.capacityKg} kg</p>
                                    <p><span className="font-medium">Mileage:</span> {v.mileage.toLocaleString()} km</p>
                                    <p className="flex items-center gap-1"><MapPin size={14}/> {v.currentLocation.join(', ')}</p>
                                </div>
                            </div>
                            <div className="flex gap-2 mt-2">
                                <button className="btn btn-sm bg-white dark:bg-slate-600 border border-gray-300 dark:border-slate-500 flex-1 text-sm flex-center gap-1" onClick={() => setModal({ type: 'edit-vehicle', data: v })}><Edit size={14}/> Edit</button>
                                <button className="btn btn-sm bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 flex-1 text-sm flex-center gap-1" onClick={() => setModal({type: 'predict-maintenance', data: v})}><Sparkles size={14}/> Predict</button>
                                <button className="p-2 text-gray-500 hover:text-red-500" onClick={() => setDeleteConfirm({ type: 'vehicle', id: v.id })}><Trash2 size={16}/></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
    
     const DriversView = () => (
        <div id="drivers-tab" className="p-4 sm:p-6 space-y-4 fade-in">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">Drivers</h1>
                <button className="btn btn-primary flex-center gap-2 w-full sm:w-auto" onClick={() => setModal({ type: 'add-driver', data: { status: 'Active' } })}>
                    <PlusCircle size={18} /> Add Driver
                </button>
            </div>
            <div className="card">
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th className="table-header">Name</th>
                                <th className="table-header">License No.</th>
                                <th className="table-header">Contact</th>
                                <th className="table-header">Status</th>
                                <th className="table-header">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                            {sortedAndFilteredData.map((driver: Driver) => (
                                <tr key={driver.id}>
                                    <td className="table-cell">{driver.name}</td>
                                    <td className="table-cell">{driver.licenseNumber}</td>
                                    <td className="table-cell">{driver.contact}</td>
                                    <td className="table-cell">
                                        <span className={`badge ${driver.status === 'Active' ? 'badge-success' : 'badge-error'}`}>{driver.status}</span>
                                    </td>
                                    <td className="table-cell space-x-2">
                                        <button className="p-1 text-gray-500 hover:text-blue-500" onClick={() => setModal({ type: 'edit-driver', data: driver })}><Edit size={16}/></button>
                                        <button className="p-1 text-gray-500 hover:text-red-500" onClick={() => setDeleteConfirm({ type: 'driver', id: driver.id })}><Trash2 size={16}/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
    
    const TrackingView = () => (
        <div id="tracking-tab" className={`${styles.mapPageContainer} fade-in`}>
            <div className={styles.mapSidebar}>
                <h2 className="text-xl font-bold p-4 border-b dark:border-slate-700">Live Shipments</h2>
                <div className="overflow-y-auto">
                    {data.shipments.filter(s => s.status === ShipmentStatus.InProgress).map(shipment => (
                        <div key={shipment.id} className={`p-4 border-b dark:border-slate-700 cursor-pointer ${selectedShipmentOnMap?.id === shipment.id ? 'bg-blue-50 dark:bg-blue-900/50' : 'hover:bg-gray-50 dark:hover:bg-slate-800'}`}
                             onClick={() => setSelectedShipmentOnMap(shipment)}>
                            <p className="font-bold">{shipment.id}</p>
                            <p className="text-sm text-gray-600 dark:text-slate-400">{shipment.origin} → {shipment.destination}</p>
                            <button disabled={aiLoading} onClick={(e) => {e.stopPropagation(); handleOptimizeRoute(shipment)}} className="btn btn-sm btn-primary mt-2 w-full text-xs flex-center gap-1 disabled:opacity-50">
                                <Sparkles size={14}/> Optimize Route
                            </button>
                        </div>
                    ))}
                </div>
            </div>
            <MapContainer center={[39.8283, -98.5795]} zoom={4} className={styles.mapView} id="map-view">
                <TileLayer
                    url={isDarkMode ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"}
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />
                {data.vehicles.filter(v=>v.status === 'On Trip').map(v => {
                    const shipment = data.shipments.find(s => s.assignedVehicleId === v.id && s.status === 'In Progress');
                    return (
                        <Marker key={v.id} position={v.currentLocation}>
                            <Popup>
                                <b>{v.registrationNumber}</b> ({v.type})<br/>
                                {shipment ? `Handling shipment: ${shipment.id}` : "On trip (unassigned)"}
                            </Popup>
                        </Marker>
                    )
                })}
                {selectedShipmentOnMap?.route && (
                    <Polyline positions={selectedShipmentOnMap.route} color="blue" />
                )}
            </MapContainer>
        </div>
    );
    
    const SettingsView = () => {
        const handleExport = () => {
            const csvData = "data:text/csv;charset=utf-8," + "category,data\n" + 
                Object.entries(data).map(([key, value]) => `"${key}","${JSON.stringify(value).replace(/"/g, '""')}"`).join("\n");
            const encodedUri = encodeURI(csvData);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "optiroute_data_export.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };
        
        const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const text = e.target?.result as string;
                    const rows = text.split("\n").slice(1); // skip header
                    const importedData: AppData = {shipments:[], vehicles:[], drivers:[]};
                    rows.forEach(row => {
                        const [key, value] = row.match(/(?:"[^"]*"|[^,]+)/g) || [];
                        if(key && value) {
                            importedData[key.replace(/"/g, '') as keyof AppData] = JSON.parse(value.slice(1, -1).replace(/""/g, '"'));
                        }
                    });
                    setData(importedData);
                    alert("Data imported successfully!");
                } catch (error) {
                    console.error("Import failed:", error);
                    alert("Failed to import data. Please check file format.");
                }
            };
            reader.readAsText(file);
        };

        const handleReset = () => {
             setData({ shipments: [], vehicles: [], drivers: [] });
             setDeleteConfirm({ type: null, id: null });
             alert("All application data has been deleted.");
        }
        
        return (
            <div id="settings-tab" className="p-4 sm:p-6 space-y-6 fade-in container-narrow">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">Settings</h1>
                <div className="card">
                    <h3 className="text-lg font-semibold mb-2">Data Management</h3>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">Manage your application data. Exports include all shipments, vehicles, and drivers.</p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button onClick={handleExport} className="btn bg-green-600 hover:bg-green-700 text-white flex-1 flex-center gap-2"><Download size={16}/> Export All Data</button>
                        <label className="btn bg-blue-600 hover:bg-blue-700 text-white flex-1 flex-center gap-2 cursor-pointer">
                            <Upload size={16}/> Import Data
                            <input type="file" accept=".csv" className="hidden" onChange={handleImport}/>
                        </label>
                    </div>
                     <div className="mt-2 text-center text-sm">
                        <a href="data:text/csv;charset=utf-8,category,data%0A%22shipments%22,%22[]%22%0A%22vehicles%22,%22[]%22%0A%22drivers%22,%22[]%22" download="import_template.csv" className="text-blue-500 hover:underline">Download Import Template</a>
                    </div>
                </div>
                <div className="card border-red-500/50 dark:border-red-500/30">
                     <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">Danger Zone</h3>
                     <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">This action is irreversible and will delete all data in the application.</p>
                     <button onClick={() => setDeleteConfirm({ type: 'all-data', id: 'all' })} className="btn bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto">
                        Delete All Application Data
                    </button>
                </div>
                 {deleteConfirm.type === 'all-data' &&
                    <ConfirmationModal
                        title="Confirm Data Deletion"
                        message="Are you sure you want to delete ALL application data? This action cannot be undone."
                        onConfirm={handleReset}
                        onCancel={() => setDeleteConfirm({type: null, id: null})}
                    />
                }
            </div>
        );
    };

    const Modal = ({ children, title }: { children: React.ReactNode, title: string }) => (
        <div className="modal-backdrop" onClick={() => setModal({ type: null })}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{title}</h3>
                    <button onClick={() => setModal({ type: null })} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700">
                        <X size={20} />
                    </button>
                </div>
                <div className="mt-4">{children}</div>
            </div>
        </div>
    );
    
    const ConfirmationModal = ({ title, message, onConfirm, onCancel }: { title: string, message: string, onConfirm: () => void, onCancel: () => void }) => (
         <div className="modal-backdrop">
            <div className="modal-content w-full max-w-sm">
                <div className="text-center">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/50 sm:mx-0 sm:h-10 sm:w-10">
                        <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:mt-5">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">{title}</h3>
                        <div className="mt-2">
                            <p className="text-sm text-gray-500 dark:text-slate-400">{message}</p>
                        </div>
                    </div>
                </div>
                <div className="mt-5 sm:mt-6 grid grid-cols-2 gap-3">
                    <button onClick={onConfirm} className="btn btn-primary bg-red-600 hover:bg-red-700 focus:ring-red-500 w-full">Confirm</button>
                    <button onClick={onCancel} className="btn bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-800 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-600 w-full">Cancel</button>
                </div>
            </div>
        </div>
    );

    const ShipmentForm = ({ initialShipmentData, onSave }: { initialShipmentData: Partial<Shipment>, onSave: (data: Shipment) => void }) => {
        const [shipment, setShipment] = useState(initialShipmentData);
        
        useEffect(() => {
            setShipment(initialShipmentData);
        }, [initialShipmentData]);

        const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
            const { name, value } = e.target;
            setShipment(prev => ({ ...prev, [name]: value }));
        };

        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            onSave(shipment as Shipment);
        };
        
        return (
            <form onSubmit={handleSubmit} className="space-y-4">
                 <div className="card bg-blue-50 dark:bg-slate-800 border-l-4 border-blue-400 p-4">
                     <h4 className="font-semibold flex items-center gap-2"><Sparkles size={16} className="text-blue-500"/> AI Assistant</h4>
                     <p className="text-sm text-gray-600 dark:text-slate-400 mb-2">Upload a document (e.g., bill of lading) to autofill fields.</p>
                     <button type="button" onClick={() => fileInputRef.current?.click()} className="btn btn-sm bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-sm">
                        <Upload size={14}/> Upload Document
                     </button>
                     <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUploadForAI} accept="image/*,.pdf" />
                     {aiLoading && <p className="text-sm mt-2 text-blue-600 animate-pulse">Analyzing document...</p>}
                     {aiError && <p className="text-sm mt-2 text-red-600">{aiError}</p>}
                 </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-group">
                        <label className="form-label">Customer Name</label>
                        <input name="customerName" value={shipment.customerName || ''} onChange={handleChange} className="input" required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Cargo Details</label>
                        <input name="cargoDetails" value={shipment.cargoDetails || ''} onChange={handleChange} className="input" required />
                    </div>
                     <div className="form-group">
                        <label className="form-label">Origin</label>
                         <ComboBox locations={LOCATION_NAMES} value={shipment.origin || ''} onChange={(val) => setShipment(p => ({...p, origin: val}))}/>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Destination</label>
                         <ComboBox locations={LOCATION_NAMES} value={shipment.destination || ''} onChange={(val) => setShipment(p => ({...p, destination: val}))}/>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Status</label>
                        <select name="status" value={shipment.status || ''} onChange={handleChange} className="input">
                            {Object.values(ShipmentStatus).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Assigned Vehicle</label>
                        <select name="assignedVehicleId" value={shipment.assignedVehicleId || ''} onChange={handleChange} className="input">
                            <option value="">None</option>
                            {data.vehicles.filter(v => v.status === VehicleStatus.Available).map(v => <option key={v.id} value={v.id}>{v.registrationNumber}</option>)}
                        </select>
                    </div>
                     <div className="form-group">
                        <label className="form-label">Assigned Driver</label>
                        <select name="assignedDriverId" value={shipment.assignedDriverId || ''} onChange={handleChange} className="input">
                            <option value="">None</option>
                            {data.drivers.filter(d => d.status === 'Active').map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                    </div>
                </div>
                 <div className="modal-footer">
                    <button type="button" onClick={() => setModal({ type: null })} className="btn bg-gray-200 dark:bg-slate-600 text-gray-800 dark:text-slate-200">Cancel</button>
                    <button type="submit" className="btn btn-primary flex items-center gap-1"><Save size={16}/> Save</button>
                </div>
            </form>
        );
    };

    const VehicleForm = ({ initialVehicleData, onSave }: { initialVehicleData: Partial<Vehicle>, onSave: (data: Vehicle) => void }) => {
        const [vehicle, setVehicle] = useState(initialVehicleData);
        
        const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
            const { name, value, type } = e.target;
            setVehicle(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) : value }));
        };

        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            onSave(vehicle as Vehicle);
        };
        
        return (
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-group">
                        <label className="form-label">Registration No.</label>
                        <input name="registrationNumber" value={vehicle.registrationNumber || ''} onChange={handleChange} className="input" required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Type</label>
                        <input name="type" value={vehicle.type || ''} onChange={handleChange} className="input" required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Capacity (kg)</label>
                        <input name="capacityKg" type="number" value={vehicle.capacityKg || ''} onChange={handleChange} className="input" required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Model</label>
                        <input name="model" value={vehicle.model || ''} onChange={handleChange} className="input" required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Year</label>
                        <input name="year" type="number" value={vehicle.year || ''} onChange={handleChange} className="input" required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Mileage (km)</label>
                        <input name="mileage" type="number" value={vehicle.mileage || ''} onChange={handleChange} className="input" required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Status</label>
                        <select name="status" value={vehicle.status || ''} onChange={handleChange} className="input">
                            {Object.values(VehicleStatus).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>
                <div className="modal-footer">
                    <button type="button" onClick={() => setModal({ type: null })} className="btn bg-gray-200 dark:bg-slate-600 text-gray-800 dark:text-slate-200">Cancel</button>
                    <button type="submit" className="btn btn-primary flex items-center gap-1"><Save size={16}/> Save</button>
                </div>
            </form>
        );
    };

    const DriverForm = ({ initialDriverData, onSave }: { initialDriverData: Partial<Driver>, onSave: (data: Driver) => void }) => {
        const [driver, setDriver] = useState(initialDriverData);

        const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
            const { name, value } = e.target;
            setDriver(prev => ({ ...prev, [name]: value }));
        };

        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            onSave(driver as Driver);
        };

        return (
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input name="name" value={driver.name || ''} onChange={handleChange} className="input" required />
                    </div>
                     <div className="form-group">
                        <label className="form-label">License Number</label>
                        <input name="licenseNumber" value={driver.licenseNumber || ''} onChange={handleChange} className="input" required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Contact Number</label>
                        <input name="contact" value={driver.contact || ''} onChange={handleChange} className="input" required />
                    </div>
                     <div className="form-group">
                        <label className="form-label">Status</label>
                        <select name="status" value={driver.status || 'Active'} onChange={handleChange} className="input">
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>
                </div>
                 <div className="modal-footer">
                    <button type="button" onClick={() => setModal({ type: null })} className="btn bg-gray-200 dark:bg-slate-600 text-gray-800 dark:text-slate-200">Cancel</button>
                    <button type="submit" className="btn btn-primary flex items-center gap-1"><Save size={16}/> Save</button>
                </div>
            </form>
        );
    };

    const MaintenancePredictionModal = ({ vehicle }: { vehicle: Vehicle }) => {
        useEffect(() => {
            const prompt = `Based on the following vehicle data, predict the next likely maintenance requirements and suggest a date. Vehicle: ${vehicle.model}, Year: ${vehicle.year}, Mileage: ${vehicle.mileage}km. Return a JSON object with keys "next_service_date" (formatted as YYYY-MM-DD) and "checklist" (an array of strings).`;
            aiLayerRef.current?.sendToAI(prompt);
        }, [vehicle]);

        const prediction = modal.data.prediction;

        return (
            <Modal title={`Maintenance Prediction for ${vehicle.registrationNumber}`}>
                {aiLoading && <div className="flex-center p-8"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div></div>}
                {aiError && <div className="alert alert-error">{aiError}</div>}
                {prediction && (
                    <div className="space-y-4">
                        <div className="p-4 bg-green-50 dark:bg-green-900/50 rounded-lg">
                           <h4 className="font-bold text-lg text-green-800 dark:text-green-300 flex items-center gap-2"><Calendar size={18}/> Predicted Service Date</h4>
                           <p className="text-2xl font-mono">{prediction.next_service_date || "Not available"}</p>
                        </div>
                        <div>
                           <h4 className="font-semibold text-gray-800 dark:text-white mb-2 flex items-center gap-2"><Wrench size={18}/> Recommended Checklist</h4>
                           <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-slate-300">
                               {prediction.checklist?.map((item: string, index: number) => <li key={index}>{item}</li>) || <li>No checklist provided.</li>}
                           </ul>
                        </div>
                    </div>
                )}
                 <div className="mt-4 p-2 text-xs text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-700/50 rounded-md flex items-start gap-2">
                     <Info size={16} className="flex-shrink-0 mt-0.5"/>
                     <span>This is an AI-powered prediction and should be used as a guideline. Always consult with a professional mechanic for accurate maintenance schedules.</span>
                 </div>
            </Modal>
        )
    };
    
    // Custom ComboBox for location selection
    const ComboBox = ({ locations, value, onChange }: { locations: string[], value: string, onChange: (value: string) => void }) => {
        const [isOpen, setIsOpen] = useState(false);
        const [query, setQuery] = useState('');
        const comboRef = useRef<HTMLDivElement>(null);

        const filteredLocations = query === '' ? locations : locations.filter(loc => loc.toLowerCase().includes(query.toLowerCase()));

        useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                if (comboRef.current && !comboRef.current.contains(event.target as Node)) {
                    setIsOpen(false);
                }
            };
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }, []);

        return (
            <div className="relative" ref={comboRef}>
                <div className="relative">
                    <input type="text" className="input"
                        value={query || value}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => setIsOpen(true)}
                        placeholder="Select location..."
                    />
                    <button type="button" className="absolute inset-y-0 right-0 flex items-center pr-2" onClick={() => setIsOpen(!isOpen)}>
                        <ChevronsUpDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </button>
                </div>
                {isOpen && (
                    <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-slate-800 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                        {filteredLocations.map(loc => (
                            <li key={loc} className="relative cursor-default select-none py-2 pl-10 pr-4 text-gray-900 dark:text-white hover:bg-blue-100 dark:hover:bg-blue-900"
                                onClick={() => {
                                    onChange(loc);
                                    setQuery('');
                                    setIsOpen(false);
                                }}>
                                {value === loc && <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600"><Check className="h-5 w-5" aria-hidden="true" /></span>}
                                {loc}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        );
    };

    if (isLoading) {
        return <div className="flex-center h-screen bg-gray-100 dark:bg-slate-900"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div></div>;
    }

    return (
        <div id="welcome_fallback" className={`flex h-screen bg-gray-100 dark:bg-slate-900 text-gray-800 dark:text-slate-200 font-sans theme-transition-all ${isDarkMode ? 'dark' : ''}`}>
             <AILayer ref={aiLayerRef} prompt={""} onResult={setAiResult} onError={setAiError} onLoading={setAiLoading}/>
            
            <aside id="generation_issue_fallback" className="w-20 lg:w-64 bg-white dark:bg-slate-800 shadow-md flex flex-col theme-transition-bg">
                <div className="flex items-center justify-center lg:justify-start lg:pl-6 h-16 border-b dark:border-slate-700">
                    <Truck className="h-8 w-8 text-primary-500" />
                    <h1 className="hidden lg:block ml-3 text-xl font-bold text-gray-800 dark:text-white">OptiRoute</h1>
                </div>
                <nav className="flex-grow mt-4">
                    <NavItem icon={<LayoutDashboard size={20}/>} text="Dashboard" active={view === 'dashboard'} onClick={() => setView('dashboard')} />
                    <NavItem icon={<Package size={20}/>} text="Shipments" active={view === 'shipments'} onClick={() => setView('shipments')} />
                    <NavItem icon={<Truck size={20}/>} text="Vehicles" active={view === 'vehicles'} onClick={() => setView('vehicles')} />
                    <NavItem icon={<User size={20}/>} text="Drivers" active={view === 'drivers'} onClick={() => setView('drivers')} />
                    <NavItem icon={<Map size={20}/>} text="Tracking" active={view === 'tracking'} onClick={() => setView('tracking')} />
                    <NavItem icon={<Settings size={20}/>} text="Settings" active={view === 'settings'} onClick={() => setView('settings')} />
                </nav>
                <div className="p-4 border-t dark:border-slate-700">
                    <div className="flex items-center justify-center lg:justify-between">
                         <div className="hidden lg:flex items-center gap-2">
                             <div className="w-8 h-8 rounded-full bg-blue-200 dark:bg-blue-800 flex-center font-bold text-blue-600 dark:text-blue-200">
                                {currentUser?.first_name.charAt(0)}{currentUser?.last_name.charAt(0)}
                             </div>
                             <span className="text-sm font-medium">{currentUser?.first_name}</span>
                         </div>
                         <button onClick={logout} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700" aria-label="Logout">
                            <LogOut size={20} />
                         </button>
                    </div>
                </div>
            </aside>
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 bg-white dark:bg-slate-800 shadow-sm flex items-center justify-end px-6 flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700" aria-label="Toggle theme">
                            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto">
                    <MainContent/>
                </main>
            </div>
            {modal.type && (modal.type === 'add-shipment' || modal.type === 'edit-shipment') &&
                <Modal title={modal.type === 'add-shipment' ? 'New Shipment' : 'Edit Shipment'}>
                    <ShipmentForm initialShipmentData={modal.data} onSave={(d) => handleSave('shipment', d)} />
                </Modal>
            }
             {modal.type && (modal.type === 'add-vehicle' || modal.type === 'edit-vehicle') &&
                <Modal title={modal.type === 'add-vehicle' ? 'New Vehicle' : 'Edit Vehicle'}>
                    <VehicleForm initialVehicleData={modal.data} onSave={(d) => handleSave('vehicle', d)} />
                </Modal>
            }
            {modal.type && (modal.type === 'add-driver' || modal.type === 'edit-driver') &&
                <Modal title={modal.type === 'add-driver' ? 'New Driver' : 'Edit Driver'}>
                    <DriverForm initialDriverData={modal.data} onSave={(d) => handleSave('driver', d)} />
                </Modal>
            }
            {modal.type === 'predict-maintenance' && <MaintenancePredictionModal vehicle={modal.data} />}
            {deleteConfirm.id && 
                <ConfirmationModal 
                    title={`Confirm Deletion`}
                    message={`Are you sure you want to delete this ${deleteConfirm.type}? This action cannot be undone.`}
                    onConfirm={() => handleDelete(deleteConfirm.type!, deleteConfirm.id!)}
                    onCancel={() => setDeleteConfirm({type: null, id: null})}
                />
            }
            <footer className="text-center py-2 text-xs text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800">
                Copyright © 2025 of Datavtar Private Limited. All rights reserved.
            </footer>
        </div>
    );
}

const NavItem = ({ icon, text, active, onClick }: { icon: React.ReactNode, text: string, active: boolean, onClick: () => void }) => (
    <button onClick={onClick} className={`flex items-center w-full text-left px-6 py-3 my-1 transition-colors duration-200 ${
        active 
        ? 'bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400 border-r-4 border-primary-500' 
        : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700'
    }`}>
        {icon}
        <span className="hidden lg:inline ml-4 font-medium">{text}</span>
    </button>
);