import { useState, useEffect } from 'react';
import { Bell, Car, ChevronDown, Download, Edit, Eye, File, Fingerprint, Globe, Loader, MapPin, Plus, Search, Shield, Terminal, Trash2, Truck, Upload, User, Wallet, Warehouse } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsChart,
  Pie,
  Cell
} from 'recharts';
import styles from './styles/styles.module.css';

// Define types for the Transport Management System
type Vehicle = {
  id: string;
  registrationNumber: string;
  type: 'Truck' | 'Van' | 'Car' | 'Other';
  model: string;
  capacity: number;
  purchaseDate: string;
  lastMaintenanceDate: string;
  status: 'Available' | 'In Transit' | 'Maintenance' | 'Out of Service';
  fuelEfficiency: number;
  currentLocation?: string;
  assignedDriver?: string;
};

type Driver = {
  id: string;
  name: string;
  licenseNumber: string;
  contactNumber: string;
  email: string;
  address: string;
  dateOfJoining: string;
  licenseExpiryDate: string;
  status: 'Available' | 'On Duty' | 'On Leave' | 'Former Employee';
  rating: number;
  assignedVehicleId?: string;
};

type Shipment = {
  id: string;
  shipmentNumber: string;
  customerName: string;
  origin: string;
  destination: string;
  scheduledDate: string;
  deliveryDate: string;
  status: 'Pending' | 'In Transit' | 'Delivered' | 'Cancelled';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  assignedVehicleId?: string;
  assignedDriverId?: string;
  items: ShipmentItem[];
};

type ShipmentItem = {
  id: string;
  name: string;
  quantity: number;
  weight: number;
  dimensions: string;
};

type Expense = {
  id: string;
  date: string;
  amount: number;
  category: 'Fuel' | 'Maintenance' | 'Toll' | 'Insurance' | 'Other';
  description: string;
  vehicleId?: string;
  driverId?: string;
  shipmentId?: string;
};

type MaintenanceRecord = {
  id: string;
  vehicleId: string;
  date: string;
  type: 'Routine' | 'Repair' | 'Inspection';
  description: string;
  cost: number;
  nextMaintenanceDate?: string;
  status: 'Planned' | 'In Progress' | 'Completed';
};

type Tab = 'dashboard' | 'vehicles' | 'drivers' | 'shipments' | 'expenses' | 'maintenance';

type ModalType = {
  isOpen: boolean;
  type: 'add' | 'edit' | 'view' | 'delete' | 'shipmentDetails' | null;
  entity: 'vehicle' | 'driver' | 'shipment' | 'expense' | 'maintenance' | null;
  data?: any;
};

interface DashboardStats {
  totalVehicles: number;
  availableVehicles: number;
  totalDrivers: number;
  availableDrivers: number;
  pendingShipments: number;
  inTransitShipments: number;
  deliveredShipments: number;
  totalExpenses: number;
}

const App = () => {
  // State for the selected tab
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  
  // State for dark mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode === 'true' || (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // States for data
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  
  // State for modal
  const [modal, setModal] = useState<ModalType>({
    isOpen: false,
    type: null,
    entity: null,
  });

  // State for search
  const [searchTerm, setSearchTerm] = useState<string>('');

  // State for loading
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize data from localStorage
  useEffect(() => {
    // Dark mode
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Load data from localStorage
    const savedVehicles = localStorage.getItem('tms_vehicles');
    const savedDrivers = localStorage.getItem('tms_drivers');
    const savedShipments = localStorage.getItem('tms_shipments');
    const savedExpenses = localStorage.getItem('tms_expenses');
    const savedMaintenanceRecords = localStorage.getItem('tms_maintenance');

    if (savedVehicles) {
      setVehicles(JSON.parse(savedVehicles));
    } else {
      // Set sample vehicles data if none exists
      const sampleVehicles = generateSampleVehicles();
      setVehicles(sampleVehicles);
      localStorage.setItem('tms_vehicles', JSON.stringify(sampleVehicles));
    }

    if (savedDrivers) {
      setDrivers(JSON.parse(savedDrivers));
    } else {
      // Set sample drivers data if none exists
      const sampleDrivers = generateSampleDrivers();
      setDrivers(sampleDrivers);
      localStorage.setItem('tms_drivers', JSON.stringify(sampleDrivers));
    }

    if (savedShipments) {
      setShipments(JSON.parse(savedShipments));
    } else {
      // Set sample shipments data if none exists
      const sampleShipments = generateSampleShipments();
      setShipments(sampleShipments);
      localStorage.setItem('tms_shipments', JSON.stringify(sampleShipments));
    }

    if (savedExpenses) {
      setExpenses(JSON.parse(savedExpenses));
    } else {
      // Set sample expenses data if none exists
      const sampleExpenses = generateSampleExpenses();
      setExpenses(sampleExpenses);
      localStorage.setItem('tms_expenses', JSON.stringify(sampleExpenses));
    }

    if (savedMaintenanceRecords) {
      setMaintenanceRecords(JSON.parse(savedMaintenanceRecords));
    } else {
      // Set sample maintenance records data if none exists
      const sampleMaintenanceRecords = generateSampleMaintenanceRecords();
      setMaintenanceRecords(sampleMaintenanceRecords);
      localStorage.setItem('tms_maintenance', JSON.stringify(sampleMaintenanceRecords));
    }

    setIsLoading(false);
  }, [isDarkMode]);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('tms_vehicles', JSON.stringify(vehicles));
      localStorage.setItem('tms_drivers', JSON.stringify(drivers));
      localStorage.setItem('tms_shipments', JSON.stringify(shipments));
      localStorage.setItem('tms_expenses', JSON.stringify(expenses));
      localStorage.setItem('tms_maintenance', JSON.stringify(maintenanceRecords));
    }
  }, [vehicles, drivers, shipments, expenses, maintenanceRecords, isLoading]);

  // Save dark mode preference
  useEffect(() => {
    localStorage.setItem('darkMode', isDarkMode.toString());
  }, [isDarkMode]);

  // Handle escape key to close modals
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && modal.isOpen) {
        closeModal();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [modal]);

  // Dashboard stats calculation
  const getDashboardStats = (): DashboardStats => {
    return {
      totalVehicles: vehicles.length,
      availableVehicles: vehicles.filter(v => v.status === 'Available').length,
      totalDrivers: drivers.length,
      availableDrivers: drivers.filter(d => d.status === 'Available').length,
      pendingShipments: shipments.filter(s => s.status === 'Pending').length,
      inTransitShipments: shipments.filter(s => s.status === 'In Transit').length,
      deliveredShipments: shipments.filter(s => s.status === 'Delivered').length,
      totalExpenses: expenses.reduce((sum, expense) => sum + expense.amount, 0)
    };
  };

  // Helper function to generate a unique ID
  const generateId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  };

  // Modal functions
  const openModal = (type: 'add' | 'edit' | 'view' | 'delete' | 'shipmentDetails', entity: 'vehicle' | 'driver' | 'shipment' | 'expense' | 'maintenance', data?: any) => {
    setModal({ isOpen: true, type, entity, data });
  };

  const closeModal = () => {
    setModal({ isOpen: false, type: null, entity: null });
  };

  // CRUD operations for vehicles
  const addVehicle = (vehicle: Omit<Vehicle, 'id'>) => {
    const newVehicle: Vehicle = {
      ...vehicle,
      id: generateId(),
    };
    setVehicles([...vehicles, newVehicle]);
    closeModal();
  };

  const updateVehicle = (updatedVehicle: Vehicle) => {
    setVehicles(vehicles.map(vehicle => vehicle.id === updatedVehicle.id ? updatedVehicle : vehicle));
    closeModal();
  };

  const deleteVehicle = (id: string) => {
    setVehicles(vehicles.filter(vehicle => vehicle.id !== id));
    closeModal();
  };

  // CRUD operations for drivers
  const addDriver = (driver: Omit<Driver, 'id'>) => {
    const newDriver: Driver = {
      ...driver,
      id: generateId(),
    };
    setDrivers([...drivers, newDriver]);
    closeModal();
  };

  const updateDriver = (updatedDriver: Driver) => {
    setDrivers(drivers.map(driver => driver.id === updatedDriver.id ? updatedDriver : driver));
    closeModal();
  };

  const deleteDriver = (id: string) => {
    setDrivers(drivers.filter(driver => driver.id !== id));
    closeModal();
  };

  // CRUD operations for shipments
  const addShipment = (shipment: Omit<Shipment, 'id'>) => {
    const newShipment: Shipment = {
      ...shipment,
      id: generateId(),
    };
    setShipments([...shipments, newShipment]);
    closeModal();
  };

  const updateShipment = (updatedShipment: Shipment) => {
    setShipments(shipments.map(shipment => shipment.id === updatedShipment.id ? updatedShipment : shipment));
    closeModal();
  };

  const deleteShipment = (id: string) => {
    setShipments(shipments.filter(shipment => shipment.id !== id));
    closeModal();
  };

  // CRUD operations for expenses
  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expense,
      id: generateId(),
    };
    setExpenses([...expenses, newExpense]);
    closeModal();
  };

  const updateExpense = (updatedExpense: Expense) => {
    setExpenses(expenses.map(expense => expense.id === updatedExpense.id ? updatedExpense : expense));
    closeModal();
  };

  const deleteExpense = (id: string) => {
    setExpenses(expenses.filter(expense => expense.id !== id));
    closeModal();
  };

  // CRUD operations for maintenance records
  const addMaintenanceRecord = (record: Omit<MaintenanceRecord, 'id'>) => {
    const newRecord: MaintenanceRecord = {
      ...record,
      id: generateId(),
    };
    setMaintenanceRecords([...maintenanceRecords, newRecord]);
    closeModal();
  };

  const updateMaintenanceRecord = (updatedRecord: MaintenanceRecord) => {
    setMaintenanceRecords(maintenanceRecords.map(record => record.id === updatedRecord.id ? updatedRecord : record));
    closeModal();
  };

  const deleteMaintenanceRecord = (id: string) => {
    setMaintenanceRecords(maintenanceRecords.filter(record => record.id !== id));
    closeModal();
  };

  // Filter function based on search term
  const filterData = <T extends { [key: string]: any }>(data: T[], keys: string[]): T[] => {
    if (!searchTerm) return data;
    const lowercasedTerm = searchTerm.toLowerCase();
    return data.filter(item => {
      return keys.some(key => {
        const value = item[key];
        return value && value.toString().toLowerCase().includes(lowercasedTerm);
      });
    });
  };

  // Filter vehicles
  const filteredVehicles = filterData(vehicles, ['registrationNumber', 'type', 'model', 'status']);
  
  // Filter drivers
  const filteredDrivers = filterData(drivers, ['name', 'licenseNumber', 'contactNumber', 'status']);
  
  // Filter shipments
  const filteredShipments = filterData(shipments, ['shipmentNumber', 'customerName', 'origin', 'destination', 'status']);
  
  // Filter expenses
  const filteredExpenses = filterData(expenses, ['category', 'description']);
  
  // Filter maintenance records
  const filteredMaintenanceRecords = filterData(maintenanceRecords, ['type', 'description', 'status']);

  // Shipment Pie Chart Data
  const shipmentStatusData = [
    { name: 'Pending', value: shipments.filter(s => s.status === 'Pending').length },
    { name: 'In Transit', value: shipments.filter(s => s.status === 'In Transit').length },
    { name: 'Delivered', value: shipments.filter(s => s.status === 'Delivered').length },
    { name: 'Cancelled', value: shipments.filter(s => s.status === 'Cancelled').length }
  ];

  // Expense Bar Chart Data
  const expenseData = [
    { name: 'Fuel', value: expenses.filter(e => e.category === 'Fuel').reduce((sum, e) => sum + e.amount, 0) },
    { name: 'Maintenance', value: expenses.filter(e => e.category === 'Maintenance').reduce((sum, e) => sum + e.amount, 0) },
    { name: 'Toll', value: expenses.filter(e => e.category === 'Toll').reduce((sum, e) => sum + e.amount, 0) },
    { name: 'Insurance', value: expenses.filter(e => e.category === 'Insurance').reduce((sum, e) => sum + e.amount, 0) },
    { name: 'Other', value: expenses.filter(e => e.category === 'Other').reduce((sum, e) => sum + e.amount, 0) }
  ];

  // Pie chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  // Sample data generators
  function generateSampleVehicles(): Vehicle[] {
    return [
      {
        id: 'v1',
        registrationNumber: 'TMS-1001',
        type: 'Truck',
        model: 'Volvo FH16',
        capacity: 25000,
        purchaseDate: '2022-01-15',
        lastMaintenanceDate: '2023-09-10',
        status: 'Available',
        fuelEfficiency: 8.5,
        currentLocation: 'Warehouse A',
      },
      {
        id: 'v2',
        registrationNumber: 'TMS-1002',
        type: 'Van',
        model: 'Mercedes Sprinter',
        capacity: 3500,
        purchaseDate: '2022-03-20',
        lastMaintenanceDate: '2023-08-15',
        status: 'In Transit',
        fuelEfficiency: 12.3,
        currentLocation: 'Route 66',
        assignedDriver: 'd1',
      },
      {
        id: 'v3',
        registrationNumber: 'TMS-1003',
        type: 'Truck',
        model: 'Scania R500',
        capacity: 20000,
        purchaseDate: '2021-11-05',
        lastMaintenanceDate: '2023-07-22',
        status: 'Maintenance',
        fuelEfficiency: 7.8,
      },
      {
        id: 'v4',
        registrationNumber: 'TMS-1004',
        type: 'Car',
        model: 'Toyota Corolla',
        capacity: 500,
        purchaseDate: '2023-02-10',
        lastMaintenanceDate: '2023-08-01',
        status: 'Available',
        fuelEfficiency: 18.2,
        currentLocation: 'Office HQ',
      },
    ];
  }

  function generateSampleDrivers(): Driver[] {
    return [
      {
        id: 'd1',
        name: 'John Smith',
        licenseNumber: 'DL-123456',
        contactNumber: '+1 (555) 123-4567',
        email: 'john.smith@example.com',
        address: '123 Main St, Springfield, IL',
        dateOfJoining: '2021-05-12',
        licenseExpiryDate: '2025-05-11',
        status: 'On Duty',
        rating: 4.8,
        assignedVehicleId: 'v2',
      },
      {
        id: 'd2',
        name: 'Emma Johnson',
        licenseNumber: 'DL-789012',
        contactNumber: '+1 (555) 234-5678',
        email: 'emma.johnson@example.com',
        address: '456 Elm St, Springfield, IL',
        dateOfJoining: '2022-02-20',
        licenseExpiryDate: '2026-02-19',
        status: 'Available',
        rating: 4.5,
      },
      {
        id: 'd3',
        name: 'Michael Davis',
        licenseNumber: 'DL-345678',
        contactNumber: '+1 (555) 345-6789',
        email: 'michael.davis@example.com',
        address: '789 Oak St, Springfield, IL',
        dateOfJoining: '2021-07-15',
        licenseExpiryDate: '2024-07-14',
        status: 'On Leave',
        rating: 4.2,
      },
    ];
  }

  function generateSampleShipments(): Shipment[] {
    return [
      {
        id: 's1',
        shipmentNumber: 'SHP-10001',
        customerName: 'Acme Inc.',
        origin: 'Chicago, IL',
        destination: 'New York, NY',
        scheduledDate: '2023-10-15',
        deliveryDate: '2023-10-18',
        status: 'In Transit',
        priority: 'High',
        assignedVehicleId: 'v2',
        assignedDriverId: 'd1',
        items: [
          {
            id: 'i1',
            name: 'Electronics',
            quantity: 5,
            weight: 500,
            dimensions: '100x50x30 cm',
          },
          {
            id: 'i2',
            name: 'Office Supplies',
            quantity: 10,
            weight: 200,
            dimensions: '80x40x20 cm',
          },
        ],
      },
      {
        id: 's2',
        shipmentNumber: 'SHP-10002',
        customerName: 'XYZ Corp',
        origin: 'Boston, MA',
        destination: 'Washington, DC',
        scheduledDate: '2023-10-20',
        deliveryDate: '2023-10-22',
        status: 'Pending',
        priority: 'Medium',
        items: [
          {
            id: 'i3',
            name: 'Furniture',
            quantity: 3,
            weight: 1500,
            dimensions: '200x100x80 cm',
          },
        ],
      },
      {
        id: 's3',
        shipmentNumber: 'SHP-10003',
        customerName: 'Global Traders',
        origin: 'Miami, FL',
        destination: 'Atlanta, GA',
        scheduledDate: '2023-09-25',
        deliveryDate: '2023-09-28',
        status: 'Delivered',
        priority: 'Low',
        items: [
          {
            id: 'i4',
            name: 'Clothing',
            quantity: 50,
            weight: 100,
            dimensions: '60x40x30 cm',
          },
        ],
      },
    ];
  }

  function generateSampleExpenses(): Expense[] {
    return [
      {
        id: 'e1',
        date: '2023-09-15',
        amount: 250.50,
        category: 'Fuel',
        description: 'Diesel refill for Truck TMS-1001',
        vehicleId: 'v1',
      },
      {
        id: 'e2',
        date: '2023-09-12',
        amount: 500.00,
        category: 'Maintenance',
        description: 'Regular service for Van TMS-1002',
        vehicleId: 'v2',
      },
      {
        id: 'e3',
        date: '2023-09-10',
        amount: 75.25,
        category: 'Toll',
        description: 'Highway toll for Route 66',
        shipmentId: 's1',
      },
      {
        id: 'e4',
        date: '2023-09-01',
        amount: 2000.00,
        category: 'Insurance',
        description: 'Monthly insurance premium for fleet',
      },
    ];
  }

  function generateSampleMaintenanceRecords(): MaintenanceRecord[] {
    return [
      {
        id: 'm1',
        vehicleId: 'v1',
        date: '2023-09-10',
        type: 'Routine',
        description: 'Oil change and filter replacement',
        cost: 150.00,
        nextMaintenanceDate: '2023-10-10',
        status: 'Completed',
      },
      {
        id: 'm2',
        vehicleId: 'v2',
        date: '2023-08-15',
        type: 'Routine',
        description: 'Brake inspection and tire rotation',
        cost: 200.00,
        nextMaintenanceDate: '2023-11-15',
        status: 'Completed',
      },
      {
        id: 'm3',
        vehicleId: 'v3',
        date: '2023-10-05',
        type: 'Repair',
        description: 'Engine overhaul',
        cost: 2500.00,
        status: 'In Progress',
      },
    ];
  }

  // Get the vehicle or driver name by ID
  const getVehicleById = (id?: string): Vehicle | undefined => {
    if (!id) return undefined;
    return vehicles.find(vehicle => vehicle.id === id);
  };

  const getDriverById = (id?: string): Driver | undefined => {
    if (!id) return undefined;
    return drivers.find(driver => driver.id === id);
  };

  // Download template function
  const downloadTemplate = (entity: 'vehicle' | 'driver' | 'shipment' | 'expense' | 'maintenance') => {
    let template: any = {};
    let filename = '';

    switch (entity) {
      case 'vehicle':
        template = {
          registrationNumber: 'ABC-1234',
          type: 'Truck',  // Options: Truck, Van, Car, Other
          model: 'Model Name',
          capacity: 10000,  // in kg
          purchaseDate: '2023-01-01',
          lastMaintenanceDate: '2023-09-01',
          status: 'Available',  // Options: Available, In Transit, Maintenance, Out of Service
          fuelEfficiency: 10.5,  // km/l
          currentLocation: 'Warehouse A',
        };
        filename = 'vehicle_template.json';
        break;
      case 'driver':
        template = {
          name: 'John Doe',
          licenseNumber: 'DL-123456',
          contactNumber: '+1 (555) 123-4567',
          email: 'john.doe@example.com',
          address: '123 Main St, City, State',
          dateOfJoining: '2023-01-01',
          licenseExpiryDate: '2025-01-01',
          status: 'Available',  // Options: Available, On Duty, On Leave, Former Employee
          rating: 4.5,  // out of 5
        };
        filename = 'driver_template.json';
        break;
      case 'shipment':
        template = {
          shipmentNumber: 'SHP-12345',
          customerName: 'Customer Name',
          origin: 'Origin City, State',
          destination: 'Destination City, State',
          scheduledDate: '2023-10-01',
          deliveryDate: '2023-10-05',
          status: 'Pending',  // Options: Pending, In Transit, Delivered, Cancelled
          priority: 'Medium',  // Options: Low, Medium, High, Urgent
          items: [
            {
              name: 'Item Name',
              quantity: 1,
              weight: 100,  // in kg
              dimensions: '100x50x30 cm'
            }
          ]
        };
        filename = 'shipment_template.json';
        break;
      case 'expense':
        template = {
          date: '2023-09-15',
          amount: 100.00,
          category: 'Fuel',  // Options: Fuel, Maintenance, Toll, Insurance, Other
          description: 'Expense description',
        };
        filename = 'expense_template.json';
        break;
      case 'maintenance':
        template = {
          vehicleId: 'vehicle_id_here',
          date: '2023-09-15',
          type: 'Routine',  // Options: Routine, Repair, Inspection
          description: 'Maintenance description',
          cost: 100.00,
          nextMaintenanceDate: '2023-10-15',
          status: 'Planned',  // Options: Planned, In Progress, Completed
        };
        filename = 'maintenance_template.json';
        break;
    }

    const jsonString = JSON.stringify(template, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, entity: 'vehicle' | 'driver' | 'shipment' | 'expense' | 'maintenance') => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);

        switch (entity) {
          case 'vehicle':
            addVehicle(data as Omit<Vehicle, 'id'>);
            break;
          case 'driver':
            addDriver(data as Omit<Driver, 'id'>);
            break;
          case 'shipment':
            addShipment(data as Omit<Shipment, 'id'>);
            break;
          case 'expense':
            addExpense(data as Omit<Expense, 'id'>);
            break;
          case 'maintenance':
            addMaintenanceRecord(data as Omit<MaintenanceRecord, 'id'>);
            break;
        }
      } catch (error) {
        alert('Invalid JSON file. Please upload a valid template.');
      }
    };
    reader.readAsText(file);
  };

  // Handle form submission for vehicle
  const handleVehicleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    
    const vehicle: Partial<Vehicle> = {
      registrationNumber: formData.get('registrationNumber') as string,
      type: formData.get('type') as 'Truck' | 'Van' | 'Car' | 'Other',
      model: formData.get('model') as string,
      capacity: Number(formData.get('capacity')),
      purchaseDate: formData.get('purchaseDate') as string,
      lastMaintenanceDate: formData.get('lastMaintenanceDate') as string,
      status: formData.get('status') as 'Available' | 'In Transit' | 'Maintenance' | 'Out of Service',
      fuelEfficiency: Number(formData.get('fuelEfficiency')),
      currentLocation: formData.get('currentLocation') as string,
      assignedDriver: formData.get('assignedDriver') as string || undefined,
    };

    if (modal.type === 'add') {
      addVehicle(vehicle as Omit<Vehicle, 'id'>);
    } else if (modal.type === 'edit' && modal.data) {
      updateVehicle({ ...modal.data, ...vehicle });
    }
  };

  // Handle form submission for driver
  const handleDriverSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    
    const driver: Partial<Driver> = {
      name: formData.get('name') as string,
      licenseNumber: formData.get('licenseNumber') as string,
      contactNumber: formData.get('contactNumber') as string,
      email: formData.get('email') as string,
      address: formData.get('address') as string,
      dateOfJoining: formData.get('dateOfJoining') as string,
      licenseExpiryDate: formData.get('licenseExpiryDate') as string,
      status: formData.get('status') as 'Available' | 'On Duty' | 'On Leave' | 'Former Employee',
      rating: Number(formData.get('rating')),
      assignedVehicleId: formData.get('assignedVehicleId') as string || undefined,
    };

    if (modal.type === 'add') {
      addDriver(driver as Omit<Driver, 'id'>);
    } else if (modal.type === 'edit' && modal.data) {
      updateDriver({ ...modal.data, ...driver });
    }
  };

  // Handle form submission for shipment
  const handleShipmentSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    
    // Get items from the form
    const itemsCount = Number(formData.get('itemsCount') || '0');
    const items: ShipmentItem[] = [];

    for (let i = 0; i < itemsCount; i++) {
      items.push({
        id: formData.get(`item_id_${i}`) as string || generateId(),
        name: formData.get(`item_name_${i}`) as string,
        quantity: Number(formData.get(`item_quantity_${i}`)),
        weight: Number(formData.get(`item_weight_${i}`)),
        dimensions: formData.get(`item_dimensions_${i}`) as string,
      });
    }

    const shipment: Partial<Shipment> = {
      shipmentNumber: formData.get('shipmentNumber') as string,
      customerName: formData.get('customerName') as string,
      origin: formData.get('origin') as string,
      destination: formData.get('destination') as string,
      scheduledDate: formData.get('scheduledDate') as string,
      deliveryDate: formData.get('deliveryDate') as string,
      status: formData.get('status') as 'Pending' | 'In Transit' | 'Delivered' | 'Cancelled',
      priority: formData.get('priority') as 'Low' | 'Medium' | 'High' | 'Urgent',
      assignedVehicleId: formData.get('assignedVehicleId') as string || undefined,
      assignedDriverId: formData.get('assignedDriverId') as string || undefined,
      items,
    };

    if (modal.type === 'add') {
      addShipment(shipment as Omit<Shipment, 'id'>);
    } else if (modal.type === 'edit' && modal.data) {
      updateShipment({ ...modal.data, ...shipment });
    }
  };

  // Handle form submission for expense
  const handleExpenseSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    
    const expense: Partial<Expense> = {
      date: formData.get('date') as string,
      amount: Number(formData.get('amount')),
      category: formData.get('category') as 'Fuel' | 'Maintenance' | 'Toll' | 'Insurance' | 'Other',
      description: formData.get('description') as string,
      vehicleId: formData.get('vehicleId') as string || undefined,
      driverId: formData.get('driverId') as string || undefined,
      shipmentId: formData.get('shipmentId') as string || undefined,
    };

    if (modal.type === 'add') {
      addExpense(expense as Omit<Expense, 'id'>);
    } else if (modal.type === 'edit' && modal.data) {
      updateExpense({ ...modal.data, ...expense });
    }
  };

  // Handle form submission for maintenance record
  const handleMaintenanceSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    
    const record: Partial<MaintenanceRecord> = {
      vehicleId: formData.get('vehicleId') as string,
      date: formData.get('date') as string,
      type: formData.get('type') as 'Routine' | 'Repair' | 'Inspection',
      description: formData.get('description') as string,
      cost: Number(formData.get('cost')),
      nextMaintenanceDate: formData.get('nextMaintenanceDate') as string || undefined,
      status: formData.get('status') as 'Planned' | 'In Progress' | 'Completed',
    };

    if (modal.type === 'add') {
      addMaintenanceRecord(record as Omit<MaintenanceRecord, 'id'>);
    } else if (modal.type === 'edit' && modal.data) {
      updateMaintenanceRecord({ ...modal.data, ...record });
    }
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex-center h-screen">
        <Loader className="animate-spin mr-2" />
        <span>Loading Transport Management System...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm transition-colors duration-300">
        <div className="container-fluid py-4">
          <div className="flex-between">
            <div className="flex items-center gap-3">
              <Truck className="text-primary-600 dark:text-primary-400" size={32} />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transport Management System</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <button className="p-2 relative">
                  <Bell size={20} className="text-gray-600 dark:text-gray-300" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
              </div>
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="theme-toggle" 
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                <span className="theme-toggle-thumb"></span>
              </button>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary-500 flex-center text-white font-semibold">
                  <User size={18} />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Admin</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white dark:bg-gray-800 shadow-sm hidden md:block transition-colors duration-300">
          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-primary-50 text-primary-600 dark:bg-primary-900 dark:text-primary-400' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700'}`}
                >
                  <Terminal size={18} />
                  Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('vehicles')}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'vehicles' ? 'bg-primary-50 text-primary-600 dark:bg-primary-900 dark:text-primary-400' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700'}`}
                >
                  <Truck size={18} />
                  Vehicles
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('drivers')}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'drivers' ? 'bg-primary-50 text-primary-600 dark:bg-primary-900 dark:text-primary-400' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700'}`}
                >
                  <User size={18} />
                  Drivers
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('shipments')}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'shipments' ? 'bg-primary-50 text-primary-600 dark:bg-primary-900 dark:text-primary-400' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700'}`}
                >
                  <Globe size={18} />
                  Shipments
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('expenses')}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'expenses' ? 'bg-primary-50 text-primary-600 dark:bg-primary-900 dark:text-primary-400' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700'}`}
                >
                  <Wallet size={18} />
                  Expenses
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('maintenance')}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'maintenance' ? 'bg-primary-50 text-primary-600 dark:bg-primary-900 dark:text-primary-400' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700'}`}
                >
                  <Shield size={18} />
                  Maintenance
                </button>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Main content */}
        <div className="flex-1 p-6 overflow-auto">
          {/* Dashboard */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Last updated: {new Date().toLocaleString()}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="stat-card">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="stat-title">Vehicles</p>
                      <p className="stat-value">{getDashboardStats().totalVehicles}</p>
                      <p className="stat-desc">{getDashboardStats().availableVehicles} available</p>
                    </div>
                    <div className="p-2 bg-indigo-100 rounded-md dark:bg-indigo-900">
                      <Truck className="text-indigo-600 dark:text-indigo-400" size={24} />
                    </div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="stat-title">Drivers</p>
                      <p className="stat-value">{getDashboardStats().totalDrivers}</p>
                      <p className="stat-desc">{getDashboardStats().availableDrivers} available</p>
                    </div>
                    <div className="p-2 bg-green-100 rounded-md dark:bg-green-900">
                      <User className="text-green-600 dark:text-green-400" size={24} />
                    </div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="stat-title">Shipments</p>
                      <p className="stat-value">{getDashboardStats().pendingShipments + getDashboardStats().inTransitShipments}</p>
                      <p className="stat-desc">{getDashboardStats().inTransitShipments} in transit</p>
                    </div>
                    <div className="p-2 bg-yellow-100 rounded-md dark:bg-yellow-900">
                      <Globe className="text-yellow-600 dark:text-yellow-400" size={24} />
                    </div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="stat-title">Total Expenses</p>
                      <p className="stat-value">{formatCurrency(getDashboardStats().totalExpenses)}</p>
                      <p className="stat-desc">All time</p>
                    </div>
                    <div className="p-2 bg-red-100 rounded-md dark:bg-red-900">
                      <Wallet className="text-red-600 dark:text-red-400" size={24} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-300">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Shipment Status</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsChart>
                        <Pie
                          data={shipmentStatusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {shipmentStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-300">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Expenses by Category</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={expenseData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                        <Legend />
                        <Bar dataKey="value" fill="#8884d8" name="Amount" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-300">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Recent Activity</h3>
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th className="table-header">Date</th>
                        <th className="table-header">Event</th>
                        <th className="table-header">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                      <tr>
                        <td className="table-cell">Today, 9:30 AM</td>
                        <td className="table-cell">Shipment SHP-10001 has departed</td>
                        <td className="table-cell"><span className="badge badge-success">Completed</span></td>
                      </tr>
                      <tr>
                        <td className="table-cell">Yesterday, 3:45 PM</td>
                        <td className="table-cell">Vehicle TMS-1003 scheduled for maintenance</td>
                        <td className="table-cell"><span className="badge badge-warning">Pending</span></td>
                      </tr>
                      <tr>
                        <td className="table-cell">10/15/2023, 11:20 AM</td>
                        <td className="table-cell">Driver John Smith started a new trip</td>
                        <td className="table-cell"><span className="badge badge-info">In Progress</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Vehicles tab */}
          {activeTab === 'vehicles' && (
            <div className="space-y-6">
              <div className="flex-between flex-wrap gap-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Vehicles Management</h2>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search vehicles..."
                      className="input input-sm pl-9"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      className="btn btn-sm bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center gap-1"
                      onClick={() => downloadTemplate('vehicle')}
                    >
                      <Download size={14} />
                      Template
                    </button>
                    <label className="btn btn-sm bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center gap-1">
                      <Upload size={14} />
                      Import
                      <input 
                        type="file" 
                        className="hidden" 
                        accept=".json" 
                        onChange={(e) => handleFileUpload(e, 'vehicle')}
                      />
                    </label>
                    <button 
                      className="btn btn-sm btn-primary flex items-center gap-1"
                      onClick={() => openModal('add', 'vehicle')}
                    >
                      <Plus size={14} />
                      Add Vehicle
                    </button>
                  </div>
                </div>
              </div>

              {/* Vehicles list */}
              <div className="overflow-x-auto table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th className="table-header">Reg Number</th>
                      <th className="table-header">Type</th>
                      <th className="table-header">Model</th>
                      <th className="table-header">Status</th>
                      <th className="table-header">Driver</th>
                      <th className="table-header">Last Maintenance</th>
                      <th className="table-header">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                    {filteredVehicles.length > 0 ? (
                      filteredVehicles.map((vehicle) => (
                        <tr key={vehicle.id}>
                          <td className="table-cell">{vehicle.registrationNumber}</td>
                          <td className="table-cell">{vehicle.type}</td>
                          <td className="table-cell">{vehicle.model}</td>
                          <td className="table-cell">
                            <span className={`badge ${vehicle.status === 'Available' ? 'badge-success' : vehicle.status === 'In Transit' ? 'badge-info' : vehicle.status === 'Maintenance' ? 'badge-warning' : 'badge-error'}`}>
                              {vehicle.status}
                            </span>
                          </td>
                          <td className="table-cell">{vehicle.assignedDriver ? getDriverById(vehicle.assignedDriver)?.name || 'Unknown' : 'Unassigned'}</td>
                          <td className="table-cell">{vehicle.lastMaintenanceDate}</td>
                          <td className="table-cell">
                            <div className="flex items-center space-x-2">
                              <button 
                                className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                onClick={() => openModal('view', 'vehicle', vehicle)}
                                aria-label="View vehicle details"
                              >
                                <Eye size={16} />
                              </button>
                              <button 
                                className="p-1 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                onClick={() => openModal('edit', 'vehicle', vehicle)}
                                aria-label="Edit vehicle"
                              >
                                <Edit size={16} />
                              </button>
                              <button 
                                className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                onClick={() => openModal('delete', 'vehicle', vehicle)}
                                aria-label="Delete vehicle"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="table-cell text-center py-8 text-gray-500 dark:text-gray-400">
                          No vehicles found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Drivers tab */}
          {activeTab === 'drivers' && (
            <div className="space-y-6">
              <div className="flex-between flex-wrap gap-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Drivers Management</h2>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search drivers..."
                      className="input input-sm pl-9"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      className="btn btn-sm bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center gap-1"
                      onClick={() => downloadTemplate('driver')}
                    >
                      <Download size={14} />
                      Template
                    </button>
                    <label className="btn btn-sm bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center gap-1">
                      <Upload size={14} />
                      Import
                      <input 
                        type="file" 
                        className="hidden" 
                        accept=".json" 
                        onChange={(e) => handleFileUpload(e, 'driver')}
                      />
                    </label>
                    <button 
                      className="btn btn-sm btn-primary flex items-center gap-1"
                      onClick={() => openModal('add', 'driver')}
                    >
                      <Plus size={14} />
                      Add Driver
                    </button>
                  </div>
                </div>
              </div>

              {/* Drivers list */}
              <div className="overflow-x-auto table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th className="table-header">Name</th>
                      <th className="table-header">License Number</th>
                      <th className="table-header">Contact</th>
                      <th className="table-header">Status</th>
                      <th className="table-header">Rating</th>
                      <th className="table-header">Assigned Vehicle</th>
                      <th className="table-header">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                    {filteredDrivers.length > 0 ? (
                      filteredDrivers.map((driver) => (
                        <tr key={driver.id}>
                          <td className="table-cell">{driver.name}</td>
                          <td className="table-cell">{driver.licenseNumber}</td>
                          <td className="table-cell">{driver.contactNumber}</td>
                          <td className="table-cell">
                            <span className={`badge ${driver.status === 'Available' ? 'badge-success' : driver.status === 'On Duty' ? 'badge-info' : driver.status === 'On Leave' ? 'badge-warning' : 'badge-error'}`}>
                              {driver.status}
                            </span>
                          </td>
                          <td className="table-cell">
                            <div className="flex items-center">
                              <span className="mr-1">{driver.rating.toFixed(1)}</span>
                              <span className="text-yellow-400">★</span>
                            </div>
                          </td>
                          <td className="table-cell">{driver.assignedVehicleId ? getVehicleById(driver.assignedVehicleId)?.registrationNumber || 'Unknown' : 'Unassigned'}</td>
                          <td className="table-cell">
                            <div className="flex items-center space-x-2">
                              <button 
                                className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                onClick={() => openModal('view', 'driver', driver)}
                                aria-label="View driver details"
                              >
                                <Eye size={16} />
                              </button>
                              <button 
                                className="p-1 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                onClick={() => openModal('edit', 'driver', driver)}
                                aria-label="Edit driver"
                              >
                                <Edit size={16} />
                              </button>
                              <button 
                                className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                onClick={() => openModal('delete', 'driver', driver)}
                                aria-label="Delete driver"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="table-cell text-center py-8 text-gray-500 dark:text-gray-400">
                          No drivers found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Shipments tab */}
          {activeTab === 'shipments' && (
            <div className="space-y-6">
              <div className="flex-between flex-wrap gap-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Shipments Management</h2>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search shipments..."
                      className="input input-sm pl-9"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      className="btn btn-sm bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center gap-1"
                      onClick={() => downloadTemplate('shipment')}
                    >
                      <Download size={14} />
                      Template
                    </button>
                    <label className="btn btn-sm bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center gap-1">
                      <Upload size={14} />
                      Import
                      <input 
                        type="file" 
                        className="hidden" 
                        accept=".json" 
                        onChange={(e) => handleFileUpload(e, 'shipment')}
                      />
                    </label>
                    <button 
                      className="btn btn-sm btn-primary flex items-center gap-1"
                      onClick={() => openModal('add', 'shipment')}
                    >
                      <Plus size={14} />
                      Add Shipment
                    </button>
                  </div>
                </div>
              </div>

              {/* Shipments list */}
              <div className="overflow-x-auto table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th className="table-header">Shipment #</th>
                      <th className="table-header">Customer</th>
                      <th className="table-header">Origin → Destination</th>
                      <th className="table-header">Status</th>
                      <th className="table-header">Priority</th>
                      <th className="table-header">Vehicle / Driver</th>
                      <th className="table-header">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                    {filteredShipments.length > 0 ? (
                      filteredShipments.map((shipment) => (
                        <tr key={shipment.id}>
                          <td className="table-cell">{shipment.shipmentNumber}</td>
                          <td className="table-cell">{shipment.customerName}</td>
                          <td className="table-cell">
                            <div className="flex items-center">
                              <span className="truncate max-w-[100px]" title={shipment.origin}>{shipment.origin}</span>
                              <span className="mx-1">→</span>
                              <span className="truncate max-w-[100px]" title={shipment.destination}>{shipment.destination}</span>
                            </div>
                          </td>
                          <td className="table-cell">
                            <span className={`badge ${shipment.status === 'Delivered' ? 'badge-success' : shipment.status === 'In Transit' ? 'badge-info' : shipment.status === 'Pending' ? 'badge-warning' : 'badge-error'}`}>
                              {shipment.status}
                            </span>
                          </td>
                          <td className="table-cell">
                            <span className={`badge ${shipment.priority === 'Low' ? 'bg-gray-100 text-gray-800' : shipment.priority === 'Medium' ? 'bg-blue-100 text-blue-800' : shipment.priority === 'High' ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'}`}>
                              {shipment.priority}
                            </span>
                          </td>
                          <td className="table-cell">
                            <div className="flex flex-col">
                              <span>{shipment.assignedVehicleId ? getVehicleById(shipment.assignedVehicleId)?.registrationNumber || 'Unknown' : 'Unassigned'}</span>
                              {shipment.assignedDriverId && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {getDriverById(shipment.assignedDriverId)?.name || 'Unknown'}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="table-cell">
                            <div className="flex items-center space-x-2">
                              <button 
                                className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                onClick={() => openModal('shipmentDetails', 'shipment', shipment)}
                                aria-label="View shipment details"
                              >
                                <Eye size={16} />
                              </button>
                              <button 
                                className="p-1 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                onClick={() => openModal('edit', 'shipment', shipment)}
                                aria-label="Edit shipment"
                              >
                                <Edit size={16} />
                              </button>
                              <button 
                                className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                onClick={() => openModal('delete', 'shipment', shipment)}
                                aria-label="Delete shipment"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="table-cell text-center py-8 text-gray-500 dark:text-gray-400">
                          No shipments found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Expenses tab */}
          {activeTab === 'expenses' && (
            <div className="space-y-6">
              <div className="flex-between flex-wrap gap-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Expenses Management</h2>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search expenses..."
                      className="input input-sm pl-9"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      className="btn btn-sm bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center gap-1"
                      onClick={() => downloadTemplate('expense')}
                    >
                      <Download size={14} />
                      Template
                    </button>
                    <label className="btn btn-sm bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center gap-1">
                      <Upload size={14} />
                      Import
                      <input 
                        type="file" 
                        className="hidden" 
                        accept=".json" 
                        onChange={(e) => handleFileUpload(e, 'expense')}
                      />
                    </label>
                    <button 
                      className="btn btn-sm btn-primary flex items-center gap-1"
                      onClick={() => openModal('add', 'expense')}
                    >
                      <Plus size={14} />
                      Add Expense
                    </button>
                  </div>
                </div>
              </div>

              {/* Expenses list */}
              <div className="overflow-x-auto table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th className="table-header">Date</th>
                      <th className="table-header">Category</th>
                      <th className="table-header">Amount</th>
                      <th className="table-header">Description</th>
                      <th className="table-header">Vehicle</th>
                      <th className="table-header">Driver/Shipment</th>
                      <th className="table-header">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                    {filteredExpenses.length > 0 ? (
                      filteredExpenses.map((expense) => (
                        <tr key={expense.id}>
                          <td className="table-cell">{expense.date}</td>
                          <td className="table-cell">
                            <span className={`badge ${expense.category === 'Fuel' ? 'bg-green-100 text-green-800' : expense.category === 'Maintenance' ? 'bg-blue-100 text-blue-800' : expense.category === 'Toll' ? 'bg-yellow-100 text-yellow-800' : expense.category === 'Insurance' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                              {expense.category}
                            </span>
                          </td>
                          <td className="table-cell font-medium">{formatCurrency(expense.amount)}</td>
                          <td className="table-cell truncate max-w-[200px]" title={expense.description}>{expense.description}</td>
                          <td className="table-cell">{expense.vehicleId ? getVehicleById(expense.vehicleId)?.registrationNumber || 'Unknown' : 'N/A'}</td>
                          <td className="table-cell">
                            <div className="flex flex-col">
                              {expense.driverId && (
                                <span>{getDriverById(expense.driverId)?.name || 'Unknown'}</span>
                              )}
                              {expense.shipmentId && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {shipments.find(s => s.id === expense.shipmentId)?.shipmentNumber || 'Unknown'}
                                </span>
                              )}
                              {!expense.driverId && !expense.shipmentId && 'N/A'}
                            </div>
                          </td>
                          <td className="table-cell">
                            <div className="flex items-center space-x-2">
                              <button 
                                className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                onClick={() => openModal('view', 'expense', expense)}
                                aria-label="View expense details"
                              >
                                <Eye size={16} />
                              </button>
                              <button 
                                className="p-1 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                onClick={() => openModal('edit', 'expense', expense)}
                                aria-label="Edit expense"
                              >
                                <Edit size={16} />
                              </button>
                              <button 
                                className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                onClick={() => openModal('delete', 'expense', expense)}
                                aria-label="Delete expense"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="table-cell text-center py-8 text-gray-500 dark:text-gray-400">
                          No expenses found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Maintenance tab */}
          {activeTab === 'maintenance' && (
            <div className="space-y-6">
              <div className="flex-between flex-wrap gap-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Maintenance Records</h2>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search records..."
                      className="input input-sm pl-9"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      className="btn btn-sm bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center gap-1"
                      onClick={() => downloadTemplate('maintenance')}
                    >
                      <Download size={14} />
                      Template
                    </button>
                    <label className="btn btn-sm bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center gap-1">
                      <Upload size={14} />
                      Import
                      <input 
                        type="file" 
                        className="hidden" 
                        accept=".json" 
                        onChange={(e) => handleFileUpload(e, 'maintenance')}
                      />
                    </label>
                    <button 
                      className="btn btn-sm btn-primary flex items-center gap-1"
                      onClick={() => openModal('add', 'maintenance')}
                    >
                      <Plus size={14} />
                      Add Record
                    </button>
                  </div>
                </div>
              </div>

              {/* Maintenance records list */}
              <div className="overflow-x-auto table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th className="table-header">Vehicle</th>
                      <th className="table-header">Date</th>
                      <th className="table-header">Type</th>
                      <th className="table-header">Description</th>
                      <th className="table-header">Cost</th>
                      <th className="table-header">Next Maintenance</th>
                      <th className="table-header">Status</th>
                      <th className="table-header">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                    {filteredMaintenanceRecords.length > 0 ? (
                      filteredMaintenanceRecords.map((record) => (
                        <tr key={record.id}>
                          <td className="table-cell">{getVehicleById(record.vehicleId)?.registrationNumber || 'Unknown'}</td>
                          <td className="table-cell">{record.date}</td>
                          <td className="table-cell">{record.type}</td>
                          <td className="table-cell truncate max-w-[200px]" title={record.description}>{record.description}</td>
                          <td className="table-cell">{formatCurrency(record.cost)}</td>
                          <td className="table-cell">{record.nextMaintenanceDate || 'N/A'}</td>
                          <td className="table-cell">
                            <span className={`badge ${record.status === 'Completed' ? 'badge-success' : record.status === 'In Progress' ? 'badge-info' : 'badge-warning'}`}>
                              {record.status}
                            </span>
                          </td>
                          <td className="table-cell">
                            <div className="flex items-center space-x-2">
                              <button 
                                className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                onClick={() => openModal('view', 'maintenance', record)}
                                aria-label="View maintenance record details"
                              >
                                <Eye size={16} />
                              </button>
                              <button 
                                className="p-1 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                onClick={() => openModal('edit', 'maintenance', record)}
                                aria-label="Edit maintenance record"
                              >
                                <Edit size={16} />
                              </button>
                              <button 
                                className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                onClick={() => openModal('delete', 'maintenance', record)}
                                aria-label="Delete maintenance record"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="table-cell text-center py-8 text-gray-500 dark:text-gray-400">
                          No maintenance records found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <div className="container-fluid py-4">
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            Copyright © 2025 of Datavtar Private Limited. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Modals */}
      {modal.isOpen && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {/* Vehicle Modals */}
            {modal.entity === 'vehicle' && modal.type === 'view' && (
              <div>
                <div className="modal-header">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Vehicle Details</h3>
                  <button 
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    onClick={closeModal}
                  >
                    ×
                  </button>
                </div>
                <div className="mt-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Registration Number</p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">{modal.data?.registrationNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Type</p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">{modal.data?.type}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Model</p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">{modal.data?.model}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">{modal.data?.status}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Capacity</p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">{modal.data?.capacity} kg</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Fuel Efficiency</p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">{modal.data?.fuelEfficiency} km/l</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Purchase Date</p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">{modal.data?.purchaseDate}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Maintenance</p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">{modal.data?.lastMaintenanceDate}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Location</p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">{modal.data?.currentLocation || 'N/A'}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Assigned Driver</p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">
                        {modal.data?.assignedDriver ? getDriverById(modal.data.assignedDriver)?.name || 'Unknown' : 'Unassigned'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    className="btn bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                    onClick={closeModal}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            {modal.entity === 'vehicle' && (modal.type === 'add' || modal.type === 'edit') && (
              <div>
                <div className="modal-header">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {modal.type === 'add' ? 'Add New Vehicle' : 'Edit Vehicle'}
                  </h3>
                  <button 
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    onClick={closeModal}
                  >
                    ×
                  </button>
                </div>
                <form onSubmit={handleVehicleSubmit}>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-group">
                      <label className="form-label" htmlFor="registrationNumber">Registration Number</label>
                      <input 
                        type="text" 
                        id="registrationNumber" 
                        name="registrationNumber" 
                        className="input"
                        defaultValue={modal.data?.registrationNumber || ''}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="type">Type</label>
                      <select 
                        id="type" 
                        name="type" 
                        className="input"
                        defaultValue={modal.data?.type || 'Truck'}
                        required
                      >
                        <option value="Truck">Truck</option>
                        <option value="Van">Van</option>
                        <option value="Car">Car</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="model">Model</label>
                      <input 
                        type="text" 
                        id="model" 
                        name="model" 
                        className="input"
                        defaultValue={modal.data?.model || ''}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="capacity">Capacity (kg)</label>
                      <input 
                        type="number" 
                        id="capacity" 
                        name="capacity" 
                        className="input"
                        min="0"
                        step="0.01"
                        defaultValue={modal.data?.capacity || '0'}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="purchaseDate">Purchase Date</label>
                      <input 
                        type="date" 
                        id="purchaseDate" 
                        name="purchaseDate" 
                        className="input"
                        defaultValue={modal.data?.purchaseDate || ''}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="lastMaintenanceDate">Last Maintenance Date</label>
                      <input 
                        type="date" 
                        id="lastMaintenanceDate" 
                        name="lastMaintenanceDate" 
                        className="input"
                        defaultValue={modal.data?.lastMaintenanceDate || ''}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="status">Status</label>
                      <select 
                        id="status" 
                        name="status" 
                        className="input"
                        defaultValue={modal.data?.status || 'Available'}
                        required
                      >
                        <option value="Available">Available</option>
                        <option value="In Transit">In Transit</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Out of Service">Out of Service</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="fuelEfficiency">Fuel Efficiency (km/l)</label>
                      <input 
                        type="number" 
                        id="fuelEfficiency" 
                        name="fuelEfficiency" 
                        className="input"
                        min="0"
                        step="0.1"
                        defaultValue={modal.data?.fuelEfficiency || '0'}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="currentLocation">Current Location</label>
                      <input 
                        type="text" 
                        id="currentLocation" 
                        name="currentLocation" 
                        className="input"
                        defaultValue={modal.data?.currentLocation || ''}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="assignedDriver">Assigned Driver</label>
                      <select 
                        id="assignedDriver" 
                        name="assignedDriver" 
                        className="input"
                        defaultValue={modal.data?.assignedDriver || ''}
                      >
                        <option value="">None</option>
                        {drivers.map(driver => (
                          <option key={driver.id} value={driver.id}>{driver.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button 
                      type="button"
                      className="btn bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                      onClick={closeModal}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="btn btn-primary"
                    >
                      {modal.type === 'add' ? 'Add Vehicle' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {modal.entity === 'vehicle' && modal.type === 'delete' && (
              <div>
                <div className="modal-header">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Confirm Delete</h3>
                  <button 
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    onClick={closeModal}
                  >
                    ×
                  </button>
                </div>
                <div className="mt-4">
                  <p className="text-gray-600 dark:text-gray-300">Are you sure you want to delete the vehicle <span className="font-semibold">{modal.data?.registrationNumber}</span>? This action cannot be undone.</p>
                </div>
                <div className="modal-footer">
                  <button 
                    className="btn bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                  <button 
                    className="btn bg-red-500 text-white hover:bg-red-600"
                    onClick={() => deleteVehicle(modal.data?.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}

            {/* Driver Modals */}
            {modal.entity === 'driver' && modal.type === 'view' && (
              <div>
                <div className="modal-header">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Driver Details</h3>
                  <button 
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    onClick={closeModal}
                  >
                    ×
                  </button>
                </div>
                <div className="mt-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">{modal.data?.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">License Number</p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">{modal.data?.licenseNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">License Expiry Date</p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">{modal.data?.licenseExpiryDate}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Contact Number</p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">{modal.data?.contactNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">{modal.data?.email}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Address</p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">{modal.data?.address}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Date of Joining</p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">{modal.data?.dateOfJoining}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">{modal.data?.status}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Rating</p>
                      <div className="flex items-center">
                        <span className="text-base font-semibold text-gray-900 dark:text-white mr-1">{modal.data?.rating.toFixed(1)}</span>
                        <span className="text-yellow-400">★</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Assigned Vehicle</p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">
                        {modal.data?.assignedVehicleId ? getVehicleById(modal.data.assignedVehicleId)?.registrationNumber || 'Unknown' : 'Unassigned'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    className="btn bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                    onClick={closeModal}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            {modal.entity === 'driver' && (modal.type === 'add' || modal.type === 'edit') && (
              <div>
                <div className="modal-header">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {modal.type === 'add' ? 'Add New Driver' : 'Edit Driver'}
                  </h3>
                  <button 
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    onClick={closeModal}
                  >
                    ×
                  </button>
                </div>
                <form onSubmit={handleDriverSubmit}>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-group md:col-span-2">
                      <label className="form-label" htmlFor="name">Full Name</label>
                      <input 
                        type="text" 
                        id="name" 
                        name="name" 
                        className="input"
                        defaultValue={modal.data?.name || ''}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="licenseNumber">License Number</label>
                      <input 
                        type="text" 
                        id="licenseNumber" 
                        name="licenseNumber" 
                        className="input"
                        defaultValue={modal.data?.licenseNumber || ''}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="licenseExpiryDate">License Expiry Date</label>
                      <input 
                        type="date" 
                        id="licenseExpiryDate" 
                        name="licenseExpiryDate" 
                        className="input"
                        defaultValue={modal.data?.licenseExpiryDate || ''}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="contactNumber">Contact Number</label>
                      <input 
                        type="tel" 
                        id="contactNumber" 
                        name="contactNumber" 
                        className="input"
                        defaultValue={modal.data?.contactNumber || ''}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="email">Email</label>
                      <input 
                        type="email" 
                        id="email" 
                        name="email" 
                        className="input"
                        defaultValue={modal.data?.email || ''}
                        required
                      />
                    </div>
                    <div className="form-group md:col-span-2">
                      <label className="form-label" htmlFor="address">Address</label>
                      <input 
                        type="text" 
                        id="address" 
                        name="address" 
                        className="input"
                        defaultValue={modal.data?.address || ''}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="dateOfJoining">Date of Joining</label>
                      <input 
                        type="date" 
                        id="dateOfJoining" 
                        name="dateOfJoining" 
                        className="input"
                        defaultValue={modal.data?.dateOfJoining || ''}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="status">Status</label>
                      <select 
                        id="status" 
                        name="status" 
                        className="input"
                        defaultValue={modal.data?.status || 'Available'}
                        required
                      >
                        <option value="Available">Available</option>
                        <option value="On Duty">On Duty</option>
                        <option value="On Leave">On Leave</option>
                        <option value="Former Employee">Former Employee</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="rating">Rating (1-5)</label>
                      <input 
                        type="number" 
                        id="rating" 
                        name="rating" 
                        className="input"
                        min="1"
                        max="5"
                        step="0.1"
                        defaultValue={modal.data?.rating || '4.0'}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="assignedVehicleId">Assigned Vehicle</label>
                      <select 
                        id="assignedVehicleId" 
                        name="assignedVehicleId" 
                        className="input"
                        defaultValue={modal.data?.assignedVehicleId || ''}
                      >
                        <option value="">None</option>
                        {vehicles.map(vehicle => (
                          <option key={vehicle.id} value={vehicle.id}>{vehicle.registrationNumber}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button 
                      type="button"
                      className="btn bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                      onClick={closeModal}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="btn btn-primary"
                    >
                      {modal.type === 'add' ? 'Add Driver' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {modal.entity === 'driver' && modal.type === 'delete' && (
              <div>
                <div className="modal-header">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Confirm Delete</h3>
                  <button 
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    onClick={closeModal}
                  >
                    ×
                  </button>
                </div>
                <div className="mt-4">
                  <p className="text-gray-600 dark:text-gray-300">Are you sure you want to delete the driver <span className="font-semibold">{modal.data?.name}</span>? This action cannot be undone.</p>
                </div>
                <div className="modal-footer">
                  <button 
                    className="btn bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                  <button 
                    className="btn bg-red-500 text-white hover:bg-red-600"
                    onClick={() => deleteDriver(modal.data?.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}

            {/* Shipment Modals */}
            {modal.entity === 'shipment' && modal.type === 'shipmentDetails' && (
              <div>
                <div className="modal-header">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Shipment Details</h3>
                  <button 
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    onClick={closeModal}
                  >
                    ×
                  </button>
                </div>
                <div className="mt-4 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Shipment Number</p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">{modal.data?.shipmentNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Customer</p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">{modal.data?.customerName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Origin</p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">{modal.data?.origin}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Destination</p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">{modal.data?.destination}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Scheduled Date</p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">{modal.data?.scheduledDate}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Delivery Date</p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">{modal.data?.deliveryDate}</p>
                    </div>
                    <div className="flex gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</p>
                        <span className={`badge ${modal.data?.status === 'Delivered' ? 'badge-success' : modal.data?.status === 'In Transit' ? 'badge-info' : modal.data?.status === 'Pending' ? 'badge-warning' : 'badge-error'}`}>
                          {modal.data?.status}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Priority</p>
                        <span className={`badge ${modal.data?.priority === 'Low' ? 'bg-gray-100 text-gray-800' : modal.data?.priority === 'Medium' ? 'bg-blue-100 text-blue-800' : modal.data?.priority === 'High' ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'}`}>
                          {modal.data?.priority}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Assigned Vehicle</p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">
                        {modal.data?.assignedVehicleId ? getVehicleById(modal.data.assignedVehicleId)?.registrationNumber || 'Unknown' : 'Unassigned'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Assigned Driver</p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">
                        {modal.data?.assignedDriverId ? getDriverById(modal.data.assignedDriverId)?.name || 'Unknown' : 'Unassigned'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-md font-bold text-gray-900 dark:text-white mb-2">Shipment Items</h4>
                    <div className="overflow-x-auto">
                      <table className="table">
                        <thead>
                          <tr>
                            <th className="table-header">Name</th>
                            <th className="table-header">Quantity</th>
                            <th className="table-header">Weight (kg)</th>
                            <th className="table-header">Dimensions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                          {modal.data?.items.map((item: ShipmentItem) => (
                            <tr key={item.id}>
                              <td className="table-cell">{item.name}</td>
                              <td className="table-cell">{item.quantity}</td>
                              <td className="table-cell">{item.weight}</td>
                              <td className="table-cell">{item.dimensions}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <MapPin className="text-primary-600 dark:text-primary-400 mr-2" size={16} />
                    <p className="text-sm text-gray-600 dark:text-gray-300">Tracking link: <a href="#" className="text-primary-600 dark:text-primary-400 hover:underline">track.tms.com/{modal.data?.shipmentNumber}</a></p>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    className="btn bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                    onClick={closeModal}
                  >
                    Close
                  </button>
                  <button 
                    className="btn btn-primary flex items-center gap-1"
                    onClick={() => openModal('edit', 'shipment', modal.data)}
                  >
                    <Edit size={14} />
                    Edit
                  </button>
                </div>
              </div>
            )}

            {modal.entity === 'shipment' && (modal.type === 'add' || modal.type === 'edit') && (
              <div>
                <div className="modal-header">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {modal.type === 'add' ? 'Add New Shipment' : 'Edit Shipment'}
                  </h3>
                  <button 
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    onClick={closeModal}
                  >
                    ×
                  </button>
                </div>
                <form onSubmit={handleShipmentSubmit}>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-group">
                      <label className="form-label" htmlFor="shipmentNumber">Shipment Number</label>
                      <input 
                        type="text" 
                        id="shipmentNumber" 
                        name="shipmentNumber" 
                        className="input"
                        defaultValue={modal.data?.shipmentNumber || `SHP-${Math.floor(10000 + Math.random() * 90000)}`}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="customerName">Customer Name</label>
                      <input 
                        type="text" 
                        id="customerName" 
                        name="customerName" 
                        className="input"
                        defaultValue={modal.data?.customerName || ''}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="origin">Origin</label>
                      <input 
                        type="text" 
                        id="origin" 
                        name="origin" 
                        className="input"
                        defaultValue={modal.data?.origin || ''}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="destination">Destination</label>
                      <input 
                        type="text" 
                        id="destination" 
                        name="destination" 
                        className="input"
                        defaultValue={modal.data?.destination || ''}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="scheduledDate">Scheduled Date</label>
                      <input 
                        type="date" 
                        id="scheduledDate" 
                        name="scheduledDate" 
                        className="input"
                        defaultValue={modal.data?.scheduledDate || ''}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="deliveryDate">Expected Delivery Date</label>
                      <input 
                        type="date" 
                        id="deliveryDate" 
                        name="deliveryDate" 
                        className="input"
                        defaultValue={modal.data?.deliveryDate || ''}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="status">Status</label>
                      <select 
                        id="status" 
                        name="status" 
                        className="input"
                        defaultValue={modal.data?.status || 'Pending'}
                        required
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Transit">In Transit</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="priority">Priority</label>
                      <select 
                        id="priority" 
                        name="priority" 
                        className="input"
                        defaultValue={modal.data?.priority || 'Medium'}
                        required
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Urgent">Urgent</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="assignedVehicleId">Assigned Vehicle</label>
                      <select 
                        id="assignedVehicleId" 
                        name="assignedVehicleId" 
                        className="input"
                        defaultValue={modal.data?.assignedVehicleId || ''}
                      >
                        <option value="">None</option>
                        {vehicles.map(vehicle => (
                          <option key={vehicle.id} value={vehicle.id}>{vehicle.registrationNumber}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="assignedDriverId">Assigned Driver</label>
                      <select 
                        id="assignedDriverId" 
                        name="assignedDriverId" 
                        className="input"
                        defaultValue={modal.data?.assignedDriverId || ''}
                      >
                        <option value="">None</option>
                        {drivers.map(driver => (
                          <option key={driver.id} value={driver.id}>{driver.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2 mt-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-md font-bold text-gray-900 dark:text-white">Shipment Items</h4>
                        <button 
                          type="button"
                          className="btn btn-sm btn-primary flex items-center gap-1"
                          onClick={() => {
                            const itemsCountField = document.getElementById('itemsCount') as HTMLInputElement;
                            const currentCount = Number(itemsCountField.value);
                            itemsCountField.value = (currentCount + 1).toString();

                            // Force a re-render by updating a hidden input
                            const rerender = document.getElementById('rerender') as HTMLInputElement;
                            rerender.value = Date.now().toString();
                          }}
                        >
                          <Plus size={14} />
                          Add Item
                        </button>
                      </div>
                      
                      <input 
                        type="hidden" 
                        id="itemsCount" 
                        name="itemsCount" 
                        defaultValue={modal.data?.items?.length || '1'}
                      />
                      <input type="hidden" id="rerender" name="rerender" />

                      <div className="overflow-x-auto mt-2">
                        <table className="table">
                          <thead>
                            <tr>
                              <th className="table-header">Name</th>
                              <th className="table-header">Quantity</th>
                              <th className="table-header">Weight (kg)</th>
                              <th className="table-header">Dimensions</th>
                              <th className="table-header">Action</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                            {Array.from({ length: modal.data?.items?.length || 1 }, (_, index) => (
                              <tr key={index}>
                                <td className="table-cell p-2">
                                  <input 
                                    type="hidden" 
                                    name={`item_id_${index}`} 
                                    defaultValue={modal.data?.items?.[index]?.id || ''}
                                  />
                                  <input 
                                    type="text" 
                                    name={`item_name_${index}`} 
                                    className="input input-sm"
                                    defaultValue={modal.data?.items?.[index]?.name || ''}
                                    required
                                  />
                                </td>
                                <td className="table-cell p-2">
                                  <input 
                                    type="number" 
                                    name={`item_quantity_${index}`} 
                                    className="input input-sm w-20"
                                    min="1"
                                    defaultValue={modal.data?.items?.[index]?.quantity || '1'}
                                    required
                                  />
                                </td>
                                <td className="table-cell p-2">
                                  <input 
                                    type="number" 
                                    name={`item_weight_${index}`} 
                                    className="input input-sm w-24"
                                    min="0"
                                    step="0.01"
                                    defaultValue={modal.data?.items?.[index]?.weight || '0'}
                                    required
                                  />
                                </td>
                                <td className="table-cell p-2">
                                  <input 
                                    type="text" 
                                    name={`item_dimensions_${index}`} 
                                    className="input input-sm"
                                    placeholder="LxWxH"
                                    defaultValue={modal.data?.items?.[index]?.dimensions || ''}
                                    required
                                  />
                                </td>
                                <td className="table-cell p-2">
                                  <button 
                                    type="button"
                                    className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                    onClick={() => {
                                      const itemsCountField = document.getElementById('itemsCount') as HTMLInputElement;
                                      const currentCount = Number(itemsCountField.value);
                                      if (currentCount > 1) {
                                        itemsCountField.value = (currentCount - 1).toString();
                                        
                                        // Force a re-render by updating a hidden input
                                        const rerender = document.getElementById('rerender') as HTMLInputElement;
                                        rerender.value = Date.now().toString();
                                      }
                                    }}
                                    disabled={modal.data?.items?.length === 1 || !modal.data?.items}
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button 
                      type="button"
                      className="btn bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                      onClick={closeModal}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="btn btn-primary"
                    >
                      {modal.type === 'add' ? 'Add Shipment' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {modal.entity === 'shipment' && modal.type === 'delete' && (
              <div>
                <div className="modal-header">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Confirm Delete</h3>
                  <button 
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    onClick={closeModal}
                  >
                    ×
                  </button>
                </div>
                <div className="mt-4">
                  <p className="text-gray-600 dark:text-gray-300">Are you sure you want to delete the shipment <span className="font-semibold">{modal.data?.shipmentNumber}</span>? This action cannot be undone.</p>
                </div>
                <div className="modal-footer">
                  <button 
                    className="btn bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                  <button 
                    className="btn bg-red-500 text-white hover:bg-red-600"
                    onClick={() => deleteShipment(modal.data?.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}

            {/* Expense Modals */}
            {modal.entity === 'expense' && modal.type === 'view' && (
              <div>
                <div className="modal-header">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Expense Details</h3>
                  <button 
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    onClick={closeModal}
                  >
                    ×
                  </button>
                </div>
                <div className="mt-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Date</p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">{modal.data?.date}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Amount</p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">{formatCurrency(modal.data?.amount)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">{modal.data?.category}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">{modal.data?.description}</p>
                    </div>
                    {modal.data?.vehicleId && (
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Vehicle</p>
                        <p className="text-base font-semibold text-gray-900 dark:text-white">
                          {getVehicleById(modal.data.vehicleId)?.registrationNumber || 'Unknown'}
                        </p>
                      </div>
                    )}
                    {modal.data?.driverId && (
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Driver</p>
                        <p className="text-base font-semibold text-gray-900 dark:text-white">
                          {getDriverById(modal.data.driverId)?.name || 'Unknown'}
                        </p>
                      </div>
                    )}
                    {modal.data?.shipmentId && (
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Shipment</p>
                        <p className="text-base font-semibold text-gray-900 dark:text-white">
                          {shipments.find(s => s.id === modal.data?.shipmentId)?.shipmentNumber || 'Unknown'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    className="btn bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                    onClick={closeModal}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            {modal.entity === 'expense' && (modal.type === 'add' || modal.type === 'edit') && (
              <div>
                <div className="modal-header">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {modal.type === 'add' ? 'Add New Expense' : 'Edit Expense'}
                  </h3>
                  <button 
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    onClick={closeModal}
                  >
                    ×
                  </button>
                </div>
                <form onSubmit={handleExpenseSubmit}>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-group">
                      <label className="form-label" htmlFor="date">Date</label>
                      <input 
                        type="date" 
                        id="date" 
                        name="date" 
                        className="input"
                        defaultValue={modal.data?.date || new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="amount">Amount</label>
                      <input 
                        type="number" 
                        id="amount" 
                        name="amount" 
                        className="input"
                        min="0"
                        step="0.01"
                        defaultValue={modal.data?.amount || '0'}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="category">Category</label>
                      <select 
                        id="category" 
                        name="category" 
                        className="input"
                        defaultValue={modal.data?.category || 'Fuel'}
                        required
                      >
                        <option value="Fuel">Fuel</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Toll">Toll</option>
                        <option value="Insurance">Insurance</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="form-group md:col-span-2">
                      <label className="form-label" htmlFor="description">Description</label>
                      <input 
                        type="text" 
                        id="description" 
                        name="description" 
                        className="input"
                        defaultValue={modal.data?.description || ''}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="vehicleId">Related Vehicle (Optional)</label>
                      <select 
                        id="vehicleId" 
                        name="vehicleId" 
                        className="input"
                        defaultValue={modal.data?.vehicleId || ''}
                      >
                        <option value="">None</option>
                        {vehicles.map(vehicle => (
                          <option key={vehicle.id} value={vehicle.id}>{vehicle.registrationNumber}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="driverId">Related Driver (Optional)</label>
                      <select 
                        id="driverId" 
                        name="driverId" 
                        className="input"
                        defaultValue={modal.data?.driverId || ''}
                      >
                        <option value="">None</option>
                        {drivers.map(driver => (
                          <option key={driver.id} value={driver.id}>{driver.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group md:col-span-2">
                      <label className="form-label" htmlFor="shipmentId">Related Shipment (Optional)</label>
                      <select 
                        id="shipmentId" 
                        name="shipmentId" 
                        className="input"
                        defaultValue={modal.data?.shipmentId || ''}
                      >
                        <option value="">None</option>
                        {shipments.map(shipment => (
                          <option key={shipment.id} value={shipment.id}>{shipment.shipmentNumber} - {shipment.customerName}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button 
                      type="button"
                      className="btn bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                      onClick={closeModal}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="btn btn-primary"
                    >
                      {modal.type === 'add' ? 'Add Expense' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {modal.entity === 'expense' && modal.type === 'delete' && (
              <div>
                <div className="modal-header">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Confirm Delete</h3>
                  <button 
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    onClick={closeModal}
                  >
                    ×
                  </button>
                </div>
                <div className="mt-4">
                  <p className="text-gray-600 dark:text-gray-300">Are you sure you want to delete this expense of <span className="font-semibold">{formatCurrency(modal.data?.amount)}</span>? This action cannot be undone.</p>
                </div>
                <div className="modal-footer">
                  <button 
                    className="btn bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                  <button 
                    className="btn bg-red-500 text-white hover:bg-red-600"
                    onClick={() => deleteExpense(modal.data?.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}

            {/* Maintenance Modals */}
            {modal.entity === 'maintenance' && modal.type === 'view' && (
              <div>
                <div className="modal-header">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Maintenance Record Details</h3>
                  <button 
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    onClick={closeModal}
                  >
                    ×
                  </button>
                </div>
                <div className="mt-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Vehicle</p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">
                        {getVehicleById(modal.data?.vehicleId)?.registrationNumber || 'Unknown'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Date</p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">{modal.data?.date}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Type</p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">{modal.data?.type}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</p>
                      <span className={`badge ${modal.data?.status === 'Completed' ? 'badge-success' : modal.data?.status === 'In Progress' ? 'badge-info' : 'badge-warning'}`}>
                        {modal.data?.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Cost</p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">{formatCurrency(modal.data?.cost)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Next Maintenance Date</p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">{modal.data?.nextMaintenanceDate || 'N/A'}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">{modal.data?.description}</p>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    className="btn bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                    onClick={closeModal}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            {modal.entity === 'maintenance' && (modal.type === 'add' || modal.type === 'edit') && (
              <div>
                <div className="modal-header">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {modal.type === 'add' ? 'Add New Maintenance Record' : 'Edit Maintenance Record'}
                  </h3>
                  <button 
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    onClick={closeModal}
                  >
                    ×
                  </button>
                </div>
                <form onSubmit={handleMaintenanceSubmit}>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-group">
                      <label className="form-label" htmlFor="vehicleId">Vehicle</label>
                      <select 
                        id="vehicleId" 
                        name="vehicleId" 
                        className="input"
                        defaultValue={modal.data?.vehicleId || ''}
                        required
                      >
                        <option value="">Select a vehicle</option>
                        {vehicles.map(vehicle => (
                          <option key={vehicle.id} value={vehicle.id}>{vehicle.registrationNumber}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="date">Date</label>
                      <input 
                        type="date" 
                        id="date" 
                        name="date" 
                        className="input"
                        defaultValue={modal.data?.date || new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="type">Type</label>
                      <select 
                        id="type" 
                        name="type" 
                        className="input"
                        defaultValue={modal.data?.type || 'Routine'}
                        required
                      >
                        <option value="Routine">Routine</option>
                        <option value="Repair">Repair</option>
                        <option value="Inspection">Inspection</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="status">Status</label>
                      <select 
                        id="status" 
                        name="status" 
                        className="input"
                        defaultValue={modal.data?.status || 'Planned'}
                        required
                      >
                        <option value="Planned">Planned</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="cost">Cost</label>
                      <input 
                        type="number" 
                        id="cost" 
                        name="cost" 
                        className="input"
                        min="0"
                        step="0.01"
                        defaultValue={modal.data?.cost || '0'}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="nextMaintenanceDate">Next Maintenance Date (optional)</label>
                      <input 
                        type="date" 
                        id="nextMaintenanceDate" 
                        name="nextMaintenanceDate" 
                        className="input"
                        defaultValue={modal.data?.nextMaintenanceDate || ''}
                      />
                    </div>
                    <div className="form-group md:col-span-2">
                      <label className="form-label" htmlFor="description">Description</label>
                      <textarea 
                        id="description" 
                        name="description" 
                        className="input"
                        rows={3}
                        defaultValue={modal.data?.description || ''}
                        required
                      ></textarea>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button 
                      type="button"
                      className="btn bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                      onClick={closeModal}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="btn btn-primary"
                    >
                      {modal.type === 'add' ? 'Add Record' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {modal.entity === 'maintenance' && modal.type === 'delete' && (
              <div>
                <div className="modal-header">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Confirm Delete</h3>
                  <button 
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    onClick={closeModal}
                  >
                    ×
                  </button>
                </div>
                <div className="mt-4">
                  <p className="text-gray-600 dark:text-gray-300">Are you sure you want to delete this maintenance record? This action cannot be undone.</p>
                </div>
                <div className="modal-footer">
                  <button 
                    className="btn bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                  <button 
                    className="btn bg-red-500 text-white hover:bg-red-600"
                    onClick={() => deleteMaintenanceRecord(modal.data?.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
