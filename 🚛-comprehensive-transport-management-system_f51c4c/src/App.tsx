import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Sun, Moon, LayoutDashboard, Truck as LucideTruck, Package, Plus, Edit, Trash2, Search, Filter, ArrowDownUp, ArrowUp, ArrowDown, X as LucideX, Users, CheckCircle, Clock, Menu, ChevronDown, Building, AlertTriangle, Home } from 'lucide-react';
import { format, parseISO } from 'date-fns';

// --- Enums ---
enum VehicleType {
  TRUCK = 'Truck',
  VAN = 'Van',
  BIKE = 'Bike',
  CAR = 'Car',
}

enum VehicleStatus {
  AVAILABLE = 'Available',
  IN_TRANSIT = 'In Transit',
  MAINTENANCE = 'Maintenance',
}

enum ShipmentStatus {
  PENDING = 'Pending',
  ASSIGNED = 'Assigned',
  PICKED_UP = 'Picked Up',
  IN_TRANSIT = 'In Transit',
  DELIVERED = 'Delivered',
  CANCELLED = 'Cancelled',
}

enum Page {
  DASHBOARD = 'Dashboard',
  VEHICLES = 'Vehicles',
  SHIPMENTS = 'Shipments',
}

// --- Interfaces ---
interface Vehicle {
  id: string;
  plateNumber: string;
  type: VehicleType;
  capacity: string;
  status: VehicleStatus;
  driverName?: string;
  createdAt: string;
}

interface Shipment {
  id: string;
  origin: string;
  destination: string;
  cargoDescription: string;
  customerName: string;
  status: ShipmentStatus;
  assignedVehicleId?: string;
  pickupDate: string;
  expectedDeliveryDate: string;
  createdAt: string;
}

interface ModalState<T> {
  isOpen: boolean;
  data?: T;
  type: 'add' | 'edit';
}

interface ConfirmationModalState {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
}

interface SortConfig<T> {
  key: keyof T;
  direction: 'ascending' | 'descending';
}

const APP_NAME = 'SwiftTransact TMS';
const LOCAL_STORAGE_PREFIX = 'swifttransact_tms_';

// --- Chart Colors ---
const PIE_CHART_COLORS_LIGHT = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
const PIE_CHART_COLORS_DARK = ['#60a5fa', '#34d399', '#fbbf24', '#f87171', '#a78bfa', '#f472b6'];

// --- Initial Data ---
const getInitialVehicles = (): Vehicle[] => [
  { id: 'v1', plateNumber: 'TRK-001', type: VehicleType.TRUCK, capacity: '10 Tons', status: VehicleStatus.AVAILABLE, driverName: 'John Doe', createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'v2', plateNumber: 'VAN-002', type: VehicleType.VAN, capacity: '800 Kg', status: VehicleStatus.IN_TRANSIT, driverName: 'Jane Smith', createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'v3', plateNumber: 'BIK-003', type: VehicleType.BIKE, capacity: '50 Kg', status: VehicleStatus.MAINTENANCE, driverName: 'Mike Lee', createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'v4', plateNumber: 'CAR-004', type: VehicleType.CAR, capacity: '4 Seats', status: VehicleStatus.AVAILABLE, driverName: 'Lisa Ray', createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() }
];

const getInitialShipments = (): Shipment[] => [
  { id: 's1', origin: 'Warehouse Alpha', destination: 'Customer Nexus', cargoDescription: 'Electronics Batch #42', customerName: 'Tech Solutions Ltd.', status: ShipmentStatus.DELIVERED, assignedVehicleId: 'v1', pickupDate: format(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'), expectedDeliveryDate: format(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'), createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 's2', origin: 'Port Bravo', destination: 'Distribution Hub Gamma', cargoDescription: 'Apparel Q2 Collection', customerName: 'Fashion Forward Inc.', status: ShipmentStatus.IN_TRANSIT, assignedVehicleId: 'v2', pickupDate: format(new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'), expectedDeliveryDate: format(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'), createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 's3', origin: 'Factory Charlie', destination: 'Retail Outlet Zeta', cargoDescription: 'Custom Furniture Order', customerName: 'Urban Living Co.', status: ShipmentStatus.PENDING, pickupDate: format(new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'), expectedDeliveryDate: format(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'), createdAt: new Date().toISOString() },
  { id: 's4', origin: 'Supplier Delta', destination: 'Warehouse Alpha', cargoDescription: 'Component Parts', customerName: 'Innovate MFG', status: ShipmentStatus.ASSIGNED, assignedVehicleId: 'v4', pickupDate: format(new Date(Date.now() + 0 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'), expectedDeliveryDate: format(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'), createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() }
];

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);

const formatDate = (dateString?: string) => dateString ? format(parseISO(dateString), 'PPpp') : 'N/A';
const formatDateForInput = (dateString?: string) => dateString ? format(parseISO(dateString), 'yyyy-MM-dd') : '';

// --- Main App Component ---
const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem(LOCAL_STORAGE_PREFIX + 'darkMode');
      return savedMode === 'true' || (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  const [currentPage, setCurrentPage] = useState<Page>(Page.DASHBOARD);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);

  const [vehicleModal, setVehicleModal] = useState<ModalState<Vehicle>>({ isOpen: false, type: 'add' });
  const [shipmentModal, setShipmentModal] = useState<ModalState<Shipment>>({ isOpen: false, type: 'add' });
  const [confirmationModal, setConfirmationModal] = useState<ConfirmationModalState>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  const [searchTermVehicles, setSearchTermVehicles] = useState('');
  const [filterVehicleType, setFilterVehicleType] = useState<VehicleType | ''>('');
  const [filterVehicleStatus, setFilterVehicleStatus] = useState<VehicleStatus | ''>('');
  const [sortConfigVehicles, setSortConfigVehicles] = useState<SortConfig<Vehicle> | null>(null);

  const [searchTermShipments, setSearchTermShipments] = useState('');
  const [filterShipmentStatus, setFilterShipmentStatus] = useState<ShipmentStatus | ''>('');
  const [sortConfigShipments, setSortConfigShipments] = useState<SortConfig<Shipment> | null>(null);

  // --- Effects ---
  useEffect(() => {
    // Load data from localStorage or use initial data
    const loadData = <T,>(key: string, initialDataFn: () => T[]): T[] => {
      try {
        const item = localStorage.getItem(LOCAL_STORAGE_PREFIX + key);
        return item ? JSON.parse(item) : initialDataFn();
      } catch (error) {
        console.error(`Error loading ${key} from localStorage:`, error);
        return initialDataFn();
      }
    };
    setVehicles(loadData<Vehicle>('vehicles', getInitialVehicles));
    setShipments(loadData<Shipment>('shipments', getInitialShipments));
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(LOCAL_STORAGE_PREFIX + 'vehicles', JSON.stringify(vehicles));
      } catch (error) {
        console.error('Error saving vehicles to localStorage:', error);
      }
    }
  }, [vehicles, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(LOCAL_STORAGE_PREFIX + 'shipments', JSON.stringify(shipments));
      } catch (error) {
        console.error('Error saving shipments to localStorage:', error);
      }
    }
  }, [shipments, isLoading]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_PREFIX + 'darkMode', String(isDarkMode));
      document.documentElement.classList.toggle('dark', isDarkMode);
    }
  }, [isDarkMode]);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prevMode => !prevMode);
  }, []);

  // --- Generic Sorting Logic ---
  const handleSort = useCallback(<T,>(
    sortConfig: SortConfig<T> | null,
    setSortConfig: React.Dispatch<React.SetStateAction<SortConfig<T> | null>>,
    key: keyof T
  ) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  }, []);

  const getSortIcon = useCallback((currentKey: string, sortConfig: SortConfig<any> | null) => {
    if (!sortConfig || sortConfig.key !== currentKey) {
      return <ArrowDownUp size={16} className="text-gray-400" />;
    }
    return sortConfig.direction === 'ascending' ? <ArrowUp size={16} /> : <ArrowDown size={16} />;
  }, []);


  // --- Vehicle Management ---
  const filteredAndSortedVehicles = useMemo(() => {
    let currentVehicles = vehicles;

    // Filter by type
    if (filterVehicleType) {
      currentVehicles = currentVehicles.filter(v => v.type === filterVehicleType);
    }

    // Filter by status
    if (filterVehicleStatus) {
      currentVehicles = currentVehicles.filter(v => v.status === filterVehicleStatus);
    }

    // Search
    if (searchTermVehicles) {
      currentVehicles = currentVehicles.filter(v =>
        Object.values(v).some(value =>
          String(value).toLowerCase().includes(searchTermVehicles.toLowerCase())
        )
      );
    }

    // Sort
    if (sortConfigVehicles) {
      currentVehicles = [...currentVehicles].sort((a, b) => {
        const aValue = String(a[sortConfigVehicles.key]).toLowerCase();
        const bValue = String(b[sortConfigVehicles.key]).toLowerCase();

        if (aValue < bValue) return sortConfigVehicles.direction === 'ascending' ? -1 : 1;
        if (aValue > bValue) return sortConfigVehicles.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }

    return currentVehicles;
  }, [vehicles, searchTermVehicles, filterVehicleType, filterVehicleStatus, sortConfigVehicles]);

  const handleAddVehicle = useCallback((newVehicle: Omit<Vehicle, 'id' | 'createdAt'>) => {
    setVehicles(prev => [...prev, { ...newVehicle, id: generateId(), createdAt: new Date().toISOString() }]);
    setVehicleModal({ isOpen: false, type: 'add' });
  }, []);

  const handleEditVehicle = useCallback((updatedVehicle: Vehicle) => {
    setVehicles(prev => prev.map(v => (v.id === updatedVehicle.id ? updatedVehicle : v)));
    setVehicleModal({ isOpen: false, type: 'add' }); // type doesn't matter after closing
  }, []);

  const handleDeleteVehicle = useCallback((id: string) => {
    setConfirmationModal({
      isOpen: true,
      title: 'Confirm Deletion',
      message: 'Are you sure you want to delete this vehicle? This action cannot be undone.',
      onConfirm: () => {
        setVehicles(prev => prev.filter(v => v.id !== id));
        setShipments(prev => prev.map(s => s.assignedVehicleId === id ? { ...s, assignedVehicleId: undefined, status: ShipmentStatus.PENDING } : s));
        setConfirmationModal({ ...confirmationModal, isOpen: false });
      },
    });
  }, [confirmationModal]);

  const openVehicleModal = useCallback((type: 'add' | 'edit', vehicle?: Vehicle) => {
    setVehicleModal({ isOpen: true, type, data: vehicle });
  }, []);

  const closeVehicleModal = useCallback(() => {
    setVehicleModal({ isOpen: false, type: 'add' });
  }, []);

  // --- Shipment Management ---
  const filteredAndSortedShipments = useMemo(() => {
    let currentShipments = shipments;

    // Filter by status
    if (filterShipmentStatus) {
      currentShipments = currentShipments.filter(s => s.status === filterShipmentStatus);
    }

    // Search
    if (searchTermShipments) {
      currentShipments = currentShipments.filter(s =>
        Object.values(s).some(value =>
          String(value).toLowerCase().includes(searchTermShipments.toLowerCase())
        )
      );
    }

    // Sort
    if (sortConfigShipments) {
      currentShipments = [...currentShipments].sort((a, b) => {
        const aValue = String(a[sortConfigShipments.key]).toLowerCase();
        const bValue = String(b[sortConfigShipments.key]).toLowerCase();

        if (aValue < bValue) return sortConfigShipments.direction === 'ascending' ? -1 : 1;
        if (aValue > bValue) return sortConfigShipments.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }

    return currentShipments;
  }, [shipments, searchTermShipments, filterShipmentStatus, sortConfigShipments]);

  const handleAddShipment = useCallback((newShipment: Omit<Shipment, 'id' | 'createdAt'>) => {
    setShipments(prev => [...prev, { ...newShipment, id: generateId(), createdAt: new Date().toISOString() }]);
    setShipmentModal({ isOpen: false, type: 'add' });
  }, []);

  const handleEditShipment = useCallback((updatedShipment: Shipment) => {
    setShipments(prev => prev.map(s => (s.id === updatedShipment.id ? updatedShipment : s)));
    setShipmentModal({ isOpen: false, type: 'add' });
  }, []);

  const handleDeleteShipment = useCallback((id: string) => {
    setConfirmationModal({
      isOpen: true,
      title: 'Confirm Deletion',
      message: 'Are you sure you want to delete this shipment? This action cannot be undone.',
      onConfirm: () => {
        setShipments(prev => prev.filter(s => s.id !== id));
        setConfirmationModal({ ...confirmationModal, isOpen: false });
      },
    });
  }, [confirmationModal]);

  const openShipmentModal = useCallback((type: 'add' | 'edit', shipment?: Shipment) => {
    setShipmentModal({ isOpen: true, type, data: shipment });
  }, []);

  const closeShipmentModal = useCallback(() => {
    setShipmentModal({ isOpen: false, type: 'add' });
  }, []);

  const closeConfirmationModal = useCallback(() => {
    setConfirmationModal({ ...confirmationModal, isOpen: false });
  }, [confirmationModal]);

  // --- Dashboard Data ---
  const dashboardData = useMemo(() => {
    const totalVehicles = vehicles.length;
    const totalShipments = shipments.length;

    const vehicleStatusCounts = vehicles.reduce((acc, vehicle) => {
      acc[vehicle.status] = (acc[vehicle.status] || 0) + 1;
      return acc;
    }, {} as Record<VehicleStatus, number>);

    const shipmentStatusCounts = shipments.reduce((acc, shipment) => {
      acc[shipment.status] = (acc[shipment.status] || 0) + 1;
      return acc;
    }, {} as Record<ShipmentStatus, number>);

    const shipmentsByVehicleType = shipments.filter(s => s.assignedVehicleId)
        .reduce((acc, shipment) => {
            const vehicle = vehicles.find(v => v.id === shipment.assignedVehicleId);
            if (vehicle) {
                acc[vehicle.type] = (acc[vehicle.type] || 0) + 1;
            }
            return acc;
        }, {} as Record<VehicleType, number>);

    const pieChartVehicleData = Object.entries(vehicleStatusCounts).map(([status, count]) => ({
      name: status,
      value: count,
    }));

    const pieChartShipmentData = Object.entries(shipmentStatusCounts).map(([status, count]) => ({
      name: status,
      value: count,
    }));

    const barChartShipmentsByVehicleTypeData = Object.entries(shipmentsByVehicleType).map(([type, count]) => ({
        name: type,
        count: count,
    }));

    const upcomingShipments = shipments.filter(s =>
        (s.status === ShipmentStatus.PENDING || s.status === ShipmentStatus.ASSIGNED) &&
        parseISO(s.pickupDate) >= new Date(Date.now() - 24 * 60 * 60 * 1000) // Consider today or future
    ).sort((a, b) => parseISO(a.pickupDate).getTime() - parseISO(b.pickupDate).getTime())
    .slice(0, 5); // Limit to 5 upcoming

    const recentDeliveries = shipments.filter(s =>
        s.status === ShipmentStatus.DELIVERED &&
        parseISO(s.expectedDeliveryDate) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
    ).sort((a, b) => parseISO(b.expectedDeliveryDate).getTime() - parseISO(a.expectedDeliveryDate).getTime())
    .slice(0, 5); // Limit to 5 recent

    return {
      totalVehicles,
      totalShipments,
      pieChartVehicleData,
      pieChartShipmentData,
      barChartShipmentsByVehicleTypeData,
      upcomingShipments,
      recentDeliveries,
    };
  }, [vehicles, shipments]);

  const PIE_COLORS = isDarkMode ? PIE_CHART_COLORS_DARK : PIE_CHART_COLORS_LIGHT;


  // --- Reusable Components (Rendered within App) ---

  const Sidebar = () => (
    <nav className={`fixed z-30 inset-y-0 left-0 w-64 bg-gray-800 text-white p-4 transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:h-auto md:w-64 dark:bg-gray-900`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-blue-400">{APP_NAME}</h2>
        <button className="md:hidden" onClick={() => setIsSidebarOpen(false)}>
          <LucideX size={24} className="text-white" />
        </button>
      </div>
      <ul>
        <li className="mb-2">
          <button
            onClick={() => { setCurrentPage(Page.DASHBOARD); setIsSidebarOpen(false); }}
            className={`flex items-center w-full p-3 rounded-lg text-left ${currentPage === Page.DASHBOARD ? 'bg-blue-600' : 'hover:bg-gray-700 dark:hover:bg-gray-800'}`}
          >
            <LayoutDashboard size={20} className="mr-3" /> Dashboard
          </button>
        </li>
        <li className="mb-2">
          <button
            onClick={() => { setCurrentPage(Page.VEHICLES); setIsSidebarOpen(false); }}
            className={`flex items-center w-full p-3 rounded-lg text-left ${currentPage === Page.VEHICLES ? 'bg-blue-600' : 'hover:bg-gray-700 dark:hover:bg-gray-800'}`}
          >
            <LucideTruck size={20} className="mr-3" /> Vehicles
          </button>
        </li>
        <li className="mb-2">
          <button
            onClick={() => { setCurrentPage(Page.SHIPMENTS); setIsSidebarOpen(false); }}
            className={`flex items-center w-full p-3 rounded-lg text-left ${currentPage === Page.SHIPMENTS ? 'bg-blue-600' : 'hover:bg-gray-700 dark:hover:bg-gray-800'}`}
          >
            <Package size={20} className="mr-3" /> Shipments
          </button>
        </li>
      </ul>
    </nav>
  );

  const Header = () => (
    <header className="bg-white p-4 shadow-md flex items-center justify-between sticky top-0 z-20 dark:bg-gray-800 dark:text-white">
      <div className="flex items-center">
        <button className="md:hidden mr-4 text-gray-600 dark:text-gray-300" onClick={() => setIsSidebarOpen(true)}>
          <Menu size={24} />
        </button>
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white hidden md:block">
          {currentPage === Page.DASHBOARD && 'Dashboard'}
          {currentPage === Page.VEHICLES && 'Vehicle Management'}
          {currentPage === Page.SHIPMENTS && 'Shipment Management'}
        </h1>
      </div>
      <div className="flex items-center space-x-4">
        <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
          {isDarkMode ? <Sun size={24} className="text-yellow-400" /> : <Moon size={24} className="text-gray-700" />}
        </button>
        <span className="text-gray-600 dark:text-gray-300">Admin User</span>
        <Users size={24} className="text-gray-600 dark:text-gray-300" />
      </div>
    </header>
  );

  const DashboardPage = () => (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen-minus-header">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Dashboard Overview</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-800">
          <div className="flex items-center mb-4">
            <LayoutDashboard size={24} className="text-blue-500 mr-3" />
            <h3 className="text-lg font-semibold text-gray-700 dark:text-white">Total Vehicles</h3>
          </div>
          <p className="text-4xl font-bold text-gray-900 dark:text-blue-400">{dashboardData.totalVehicles}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-800">
          <div className="flex items-center mb-4">
            <Package size={24} className="text-green-500 mr-3" />
            <h3 className="text-lg font-semibold text-gray-700 dark:text-white">Total Shipments</h3>
          </div>
          <p className="text-4xl font-bold text-gray-900 dark:text-green-400">{dashboardData.totalShipments}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-800">
          <div className="flex items-center mb-4">
            <Clock size={24} className="text-orange-500 mr-3" />
            <h3 className="text-lg font-semibold text-gray-700 dark:text-white">Pending Shipments</h3>
          </div>
          <p className="text-4xl font-bold text-gray-900 dark:text-orange-400">
            {dashboardData.pieChartShipmentData.find(d => d.name === ShipmentStatus.PENDING)?.value || 0}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-800">
          <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-white">Vehicle Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={dashboardData.pieChartVehicleData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {dashboardData.pieChartVehicleData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `${value}`} />
              <Legend />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-800">
          <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-white">Shipment Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={dashboardData.pieChartShipmentData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {dashboardData.pieChartShipmentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `${value}`} />
              <Legend />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-800">
            <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-white">Shipments by Vehicle Type</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart
                    data={dashboardData.barChartShipmentsByVehicleTypeData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#4a5568' : '#e2e8f0'} />
                    <XAxis dataKey="name" stroke={isDarkMode ? '#a0aec0' : '#4a5568'} />
                    <YAxis stroke={isDarkMode ? '#a0aec0' : '#4a5568'} />
                    <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#2d3748' : '#ffffff', border: 'none', borderRadius: '8px' }}
                             labelStyle={{ color: isDarkMode ? '#ffffff' : '#1a202c' }}
                             itemStyle={{ color: isDarkMode ? '#a0aec0' : '#4a5568' }} />
                    <Legend />
                    <Bar dataKey="count" fill="#8884d8" name="Shipments" />
                </BarChart>
            </ResponsiveContainer>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-800">
            <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-white">Upcoming Shipments</h3>
            {dashboardData.upcomingShipments.length > 0 ? (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {dashboardData.upcomingShipments.map(s => (
                        <li key={s.id} className="py-3 flex justify-between items-center">
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white">{s.cargoDescription} to {s.destination}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Pickup: {formatDate(s.pickupDate)}</p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                s.status === ShipmentStatus.PENDING ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                                s.status === ShipmentStatus.ASSIGNED ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' : ''
                            }`}>
                                {s.status}
                            </span>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-gray-500 dark:text-gray-400">No upcoming shipments.</p>
            )}
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-800">
        <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-white">Recent Deliveries</h3>
        {dashboardData.recentDeliveries.length > 0 ? (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {dashboardData.recentDeliveries.map(s => (
                    <li key={s.id} className="py-3 flex justify-between items-center">
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white">{s.cargoDescription} to {s.destination}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Delivered: {formatDate(s.expectedDeliveryDate)}</p>
                        </div>
                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                            {s.status}
                        </span>
                    </li>
                ))}
            </ul>
        ) : (
            <p className="text-gray-500 dark:text-gray-400">No recent deliveries.</p>
        )}
    </div>
    </div>
  );

  const VehiclesPage = () => (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen-minus-header">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Vehicle Management</h2>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search vehicles..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={searchTermVehicles}
            onChange={(e) => setSearchTermVehicles(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <select
            className="p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={filterVehicleType}
            onChange={(e) => setFilterVehicleType(e.target.value as VehicleType | '')}
          >
            <option value="">All Types</option>
            {Object.values(VehicleType).map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <select
            className="p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={filterVehicleStatus}
            onChange={(e) => setFilterVehicleStatus(e.target.value as VehicleStatus | '')}
          >
            <option value="">All Statuses</option>
            {Object.values(VehicleStatus).map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          <button
            onClick={() => openVehicleModal('add')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700"
          >
            <Plus size={20} className="mr-2" /> Add Vehicle
          </button>
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow-md dark:bg-gray-800">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {([
                { key: 'plateNumber', label: 'Plate Number' },
                { key: 'type', label: 'Type' },
                { key: 'capacity', label: 'Capacity' },
                { key: 'status', label: 'Status' },
                { key: 'driverName', label: 'Driver Name' },
                { key: 'createdAt', label: 'Added On' },
              ] as { key: keyof Vehicle, label: string }[]).map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer dark:text-gray-300"
                  onClick={() => handleSort(sortConfigVehicles, setSortConfigVehicles, column.key)}
                >
                  <div className="flex items-center">
                    {column.label}
                    {getSortIcon(column.key as string, sortConfigVehicles)}
                  </div>
                </th>
              ))}
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
            {filteredAndSortedVehicles.length > 0 ? (
              filteredAndSortedVehicles.map((vehicle) => (
                <tr key={vehicle.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{vehicle.plateNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{vehicle.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{vehicle.capacity}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      vehicle.status === VehicleStatus.AVAILABLE ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                      vehicle.status === VehicleStatus.IN_TRANSIT ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                    }`}>
                      {vehicle.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{vehicle.driverName || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{formatDate(vehicle.createdAt)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onClick={() => openVehicleModal('edit', vehicle)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-3">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => handleDeleteVehicle(vehicle.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">No vehicles found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const ShipmentsPage = () => (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen-minus-header">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Shipment Management</h2>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search shipments..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={searchTermShipments}
            onChange={(e) => setSearchTermShipments(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <select
            className="p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={filterShipmentStatus}
            onChange={(e) => setFilterShipmentStatus(e.target.value as ShipmentStatus | '')}
          >
            <option value="">All Statuses</option>
            {Object.values(ShipmentStatus).map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          <button
            onClick={() => openShipmentModal('add')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700"
          >
            <Plus size={20} className="mr-2" /> Add Shipment
          </button>
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow-md dark:bg-gray-800">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {([
                { key: 'origin', label: 'Origin' },
                { key: 'destination', label: 'Destination' },
                { key: 'cargoDescription', label: 'Cargo' },
                { key: 'customerName', label: 'Customer' },
                { key: 'status', label: 'Status' },
                { key: 'assignedVehicleId', label: 'Assigned Vehicle' },
                { key: 'pickupDate', label: 'Pickup Date' },
                { key: 'expectedDeliveryDate', label: 'Delivery Date' },
                { key: 'createdAt', label: 'Created On' },
              ] as { key: keyof Shipment, label: string }[]).map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer dark:text-gray-300"
                  onClick={() => handleSort(sortConfigShipments, setSortConfigShipments, column.key)}
                >
                  <div className="flex items-center">
                    {column.label}
                    {getSortIcon(column.key as string, sortConfigShipments)}
                  </div>
                </th>
              ))}
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
            {filteredAndSortedShipments.length > 0 ? (
              filteredAndSortedShipments.map((shipment) => (
                <tr key={shipment.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{shipment.origin}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{shipment.destination}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{shipment.cargoDescription}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{shipment.customerName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      shipment.status === ShipmentStatus.DELIVERED ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                      shipment.status === ShipmentStatus.IN_TRANSIT ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                      shipment.status === ShipmentStatus.PENDING ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                      shipment.status === ShipmentStatus.ASSIGNED ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' :
                      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' // Cancelled
                    }`}>
                      {shipment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {shipment.assignedVehicleId ? vehicles.find(v => v.id === shipment.assignedVehicleId)?.plateNumber || 'N/A' : 'Unassigned'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{formatDate(shipment.pickupDate)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{formatDate(shipment.expectedDeliveryDate)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{formatDate(shipment.createdAt)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onClick={() => openShipmentModal('edit', shipment)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-3">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => handleDeleteShipment(shipment.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={10} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">No shipments found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const VehicleModal: React.FC<{
    modalState: ModalState<Vehicle>;
    onClose: () => void;
    onSave: (vehicle: Omit<Vehicle, 'id' | 'createdAt'> | Vehicle) => void;
  }> = ({ modalState, onClose, onSave }) => {
    const isEdit = modalState.type === 'edit';
    const initialVehicle = modalState.data || {
      id: '', plateNumber: '', type: VehicleType.TRUCK, capacity: '', status: VehicleStatus.AVAILABLE, driverName: '', createdAt: ''
    };

    const [formState, setFormState] = useState<Omit<Vehicle, 'id' | 'createdAt'> | Vehicle>(initialVehicle);

    useEffect(() => {
      setFormState(initialVehicle);
    }, [modalState.isOpen, initialVehicle]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSave(formState);
    };

    if (!modalState.isOpen) return null;

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md dark:bg-gray-800 dark:text-white">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold">{isEdit ? 'Edit Vehicle' : 'Add New Vehicle'}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100">
              <LucideX size={24} />
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="plateNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Plate Number</label>
              <input
                type="text"
                id="plateNumber"
                name="plateNumber"
                value={formState.plateNumber}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
              <select
                id="type"
                name="type"
                value={formState.type}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              >
                {Object.values(VehicleType).map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Capacity</label>
              <input
                type="text"
                id="capacity"
                name="capacity"
                value={formState.capacity}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
              <select
                id="status"
                name="status"
                value={formState.status}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              >
                {Object.values(VehicleStatus).map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            <div className="mb-6">
              <label htmlFor="driverName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Driver Name (Optional)</label>
              <input
                type="text"
                id="driverName"
                name="driverName"
                value={formState.driverName || ''}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {isEdit ? 'Save Changes' : 'Add Vehicle'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const ShipmentModal: React.FC<{
    modalState: ModalState<Shipment>;
    onClose: () => void;
    onSave: (shipment: Omit<Shipment, 'id' | 'createdAt'> | Shipment) => void;
    vehicles: Vehicle[];
  }> = ({ modalState, onClose, onSave, vehicles }) => {
    const isEdit = modalState.type === 'edit';
    const initialShipment = modalState.data || {
      id: '', origin: '', destination: '', cargoDescription: '', customerName: '', status: ShipmentStatus.PENDING,
      pickupDate: formatDateForInput(new Date().toISOString()),
      expectedDeliveryDate: formatDateForInput(new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()),
      createdAt: ''
    };

    const [formState, setFormState] = useState<Omit<Shipment, 'id' | 'createdAt'> | Shipment>(initialShipment);

    useEffect(() => {
      setFormState(initialShipment);
    }, [modalState.isOpen, initialShipment]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSave(formState);
    };

    const availableVehicles = vehicles.filter(v => v.status === VehicleStatus.AVAILABLE || v.id === formState.assignedVehicleId);


    if (!modalState.isOpen) return null;

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md dark:bg-gray-800 dark:text-white">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold">{isEdit ? 'Edit Shipment' : 'Add New Shipment'}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100">
              <LucideX size={24} />
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="origin" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Origin</label>
              <input
                type="text"
                id="origin"
                name="origin"
                value={formState.origin}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="destination" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Destination</label>
              <input
                type="text"
                id="destination"
                name="destination"
                value={formState.destination}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="cargoDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cargo Description</label>
              <textarea
                id="cargoDescription"
                name="cargoDescription"
                value={formState.cargoDescription}
                onChange={handleChange}
                rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              ></textarea>
            </div>
            <div className="mb-4">
              <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Customer Name</label>
              <input
                type="text"
                id="customerName"
                name="customerName"
                value={formState.customerName}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
              <select
                id="status"
                name="status"
                value={formState.status}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              >
                {Object.values(ShipmentStatus).map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label htmlFor="assignedVehicleId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Assigned Vehicle (Optional)</label>
              <select
                id="assignedVehicleId"
                name="assignedVehicleId"
                value={formState.assignedVehicleId || ''}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">Unassigned</option>
                {availableVehicles.map(vehicle => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.plateNumber} ({vehicle.type}, {vehicle.status})
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label htmlFor="pickupDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Pickup Date</label>
              <input
                type="date"
                id="pickupDate"
                name="pickupDate"
                value={formatDateForInput(formState.pickupDate)}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            <div className="mb-6">
              <label htmlFor="expectedDeliveryDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Expected Delivery Date</label>
              <input
                type="date"
                id="expectedDeliveryDate"
                name="expectedDeliveryDate"
                value={formatDateForInput(formState.expectedDeliveryDate)}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {isEdit ? 'Save Changes' : 'Add Shipment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const ConfirmationModal: React.FC<{
    modalState: ConfirmationModalState;
    onClose: () => void;
  }> = ({ modalState, onClose }) => {
    if (!modalState.isOpen) return null;

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm dark:bg-gray-800 dark:text-white">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">{modalState.title}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100">
              <LucideX size={24} />
            </button>
          </div>
          <p className="mb-6 text-gray-700 dark:text-gray-300">{modalState.message}</p>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                modalState.onConfirm();
                onClose();
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    );
  };


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white">
        <div className="text-lg font-medium">Loading Application...</div>
      </div>
    );
  }

  return (
    <div className={`flex min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          {currentPage === Page.DASHBOARD && <DashboardPage />}
          {currentPage === Page.VEHICLES && <VehiclesPage />}
          {currentPage === Page.SHIPMENTS && <ShipmentsPage />}
        </main>
      </div>

      <VehicleModal
        modalState={vehicleModal}
        onClose={closeVehicleModal}
        onSave={vehicleModal.type === 'add' ? handleAddVehicle : handleEditVehicle}
      />
      <ShipmentModal
        modalState={shipmentModal}
        onClose={closeShipmentModal}
        onSave={shipmentModal.type === 'add' ? handleAddShipment : handleEditShipment}
        vehicles={vehicles}
      />
      <ConfirmationModal
        modalState={confirmationModal}
        onClose={closeConfirmationModal}
      />
    </div>
  );
};

export default App;