import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Filter, ChevronDown, XCircle, RotateCcw, CheckCircle, AlertTriangle, Loader2, ArrowUp, ArrowDown, Circle, Settings, Sun, Moon } from 'lucide-react';
import styles from './styles/styles.module.css';

// Define types and interfaces
interface Shipment {
 id: string;
 origin: string;
 destination: string;
 status: ShipmentStatus;
 notes?: string;
}

enum ShipmentStatus {
  PENDING = 'Pending',
  IN_TRANSIT = 'In Transit',
  DELIVERED = 'Delivered',
  DELAYED = 'Delayed',
  CANCELLED = 'Cancelled',
}

const statusColors: Record<ShipmentStatus, string> = {
  [ShipmentStatus.PENDING]: 'bg-gray-400',
  [ShipmentStatus.IN_TRANSIT]: 'bg-blue-500',
  [ShipmentStatus.DELIVERED]: 'bg-green-500',
  [ShipmentStatus.DELAYED]: 'bg-yellow-500',
  [ShipmentStatus.CANCELLED]: 'bg-red-500',
};


const App: React.FC = () => {
 const [shipments, setShipments] = useState<Shipment[]>([]);
 const [loading, setLoading] = useState<boolean>(false);
 const [error, setError] = useState<string | null>(null);

  // State for Add/Edit Modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [currentShipment, setCurrentShipment] = useState<Shipment | null>(null);

 // Theme State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      return savedMode === 'true' || 
        (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
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

 // State for Search and Filter
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<ShipmentStatus | ''>('');


 // Mock data loading with simulated delay
  useEffect(() => {
    setLoading(true);
    const mockShipments: Shipment[] = [
      { id: '1', origin: 'New York', destination: 'Los Angeles', status: ShipmentStatus.IN_TRANSIT, notes: 'On schedule' },
      { id: '2', origin: 'Chicago', destination: 'Miami', status: ShipmentStatus.DELIVERED, notes: 'Delivered on time' },
      { id: '3', origin: 'Houston', destination: 'Seattle', status: ShipmentStatus.DELAYED, notes: 'Delayed due to weather' },
      { id: '4', origin: 'Phoenix', destination: 'Boston', status: ShipmentStatus.PENDING, notes: '' },
      { id: '5', origin: 'Los Angeles', destination: 'New York', status: ShipmentStatus.CANCELLED, notes: 'Cancelled by customer' },
    ];

    const timer = setTimeout(() => {
    setShipments(mockShipments);
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);


 // Utility function for generating a unique ID
 const generateId = () => {
    return Math.random().toString(36).substring(2, 15);
  };


 // CRUD operations
  const addShipment = (newShipmentData: Omit<Shipment, 'id'>) => {
    const newShipment: Shipment = { ...newShipmentData, id: generateId() };
    setShipments([...shipments, newShipment]);
    setIsModalOpen(false);
  };

  const updateShipment = (updatedShipment: Shipment) => {
    setShipments(shipments.map((shipment) => (shipment.id === updatedShipment.id ? updatedShipment : shipment)));
    setIsModalOpen(false);
  };

  const deleteShipment = (id: string) => {
    setShipments(shipments.filter((shipment) => shipment.id !== id));
  };

    // Search and filter logic
  const filteredShipments = shipments.filter((shipment) => {
    const searchMatch = Object.values(shipment).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
    const statusMatch = filterStatus ? shipment.status === filterStatus : true;
    return searchMatch && statusMatch;
  });


  // Reset form fields
  const resetForm = () => {
    setCurrentShipment(null);
  };

  const handleAddClick = () => {
    setModalMode('add');
    setCurrentShipment(null); // Reset current shipment for add mode
    setIsModalOpen(true);
  };


  const handleEditClick = (shipment: Shipment) => {
    setModalMode('edit');
    setCurrentShipment(shipment);
    setIsModalOpen(true);
  };

    // Sorting functionality
  const [sortConfig, setSortConfig] = useState<{ key: keyof Shipment; direction: 'ascending' | 'descending' } | null>(null);

  const requestSort = (key: keyof Shipment) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedShipments = React.useMemo(() => {
    let sortableShipments = [...filteredShipments];
    if (sortConfig !== null) {
      sortableShipments.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableShipments;
  }, [filteredShipments, sortConfig]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900 theme-transition-all">

    <div className="flex justify-end p-4">
        <button
          className="theme-toggle mr-4"
          onClick={() => setIsDarkMode(!isDarkMode)}
          aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDarkMode ? <Sun className="h-6 w-6 text-yellow-500" /> : <Moon className="h-6 w-6 text-blue-500" />}
        </button>
      </div>


      <div className="container-fluid p-4">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">Shipment Monitoring</h1>

         <div className="flex flex-col sm:flex-row gap-4 my-4 items-center">
          <div className="relative w-full sm:w-1/2 md:w-1/3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <input
              type="text"
              placeholder="Search shipments..."
              className="input pl-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="relative w-full sm:w-1/2 md:w-1/3">
             <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <select
              className="input pl-10 w-full appearance-none"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as ShipmentStatus | '')}
            >
              <option value="">All Statuses</option>
              {Object.values(ShipmentStatus).map((status) => (
                <option key={status} value={status}> {status}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500 dark:text-gray-400 pointer-events-none" />
          </div>
          <button
            onClick={handleAddClick}
            className="btn btn-primary w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" /> Add Shipment
          </button>
        </div>

         {loading && (
          <div className="flex items-center justify-center p-4">
           <Loader2 className="animate-spin h-8 w-8 text-primary-500" />
          </div>
        )}

        {error && (
          <div className="alert alert-error">
            <AlertTriangle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th className="table-header" onClick={() => requestSort('id')}>ID  {sortConfig?.key === 'id' ? (sortConfig.direction === 'ascending' ? <ArrowUp className='h-4 w-4 inline' /> : <ArrowDown className='h-4 w-4 inline' />) : null}</th>
                  <th className="table-header" onClick={() => requestSort('origin')}>Origin {sortConfig?.key === 'origin' ? (sortConfig.direction === 'ascending' ?  <ArrowUp className='h-4 w-4 inline' /> : <ArrowDown className='h-4 w-4 inline' />) : null}</th>
                  <th className="table-header" onClick={() => requestSort('destination')}>Destination {sortConfig?.key === 'destination' ? (sortConfig.direction === 'ascending' ? <ArrowUp className='h-4 w-4 inline' /> : <ArrowDown className='h-4 w-4 inline' />) : null}</th>
                  <th className="table-header" onClick={() => requestSort('status')}>Status {sortConfig?.key === 'status' ? (sortConfig.direction === 'ascending' ? <ArrowUp className='h-4 w-4 inline' /> : <ArrowDown className='h-4 w-4 inline' />) : null}</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedShipments.map((shipment) => (
                  <tr key={shipment.id} className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                    <td className="table-cell">{shipment.id}</td>
                    <td className="table-cell">{shipment.origin}</td>
                    <td className="table-cell">{shipment.destination}</td>
                    <td className="table-cell">
                      <span className={`badge ${statusColors[shipment.status]}`}>{shipment.status}</span>
                    </td>
                    <td className="table-cell">
                      <button
                        onClick={() => handleEditClick(shipment)}
                        className="btn btn-sm btn-primary mr-2"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteShipment(shipment.id)}
                        className="btn btn-sm bg-red-500 text-white hover:bg-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

       {/* Modal for Add/Edit */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">{modalMode === 'add' ? 'Add Shipment' : 'Edit Shipment'}</h3>
              <button className="text-gray-400 hover:text-gray-500" onClick={() => setIsModalOpen(false)}>
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            <div className="modal-body">
              <div className="space-y-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="origin">Origin</label>
                  <input
                    id="origin"
                    type="text"
                    className="input"
                    value={currentShipment?.origin || ''}
                    onChange={(e) => setCurrentShipment({ ...currentShipment, origin: (e.target as HTMLInputElement).value } as Shipment)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="destination">Destination</label>
                  <input
                    id="destination"
                    type="text"
                    className="input"
                    value={currentShipment?.destination || ''}
                    onChange={(e) => setCurrentShipment({ ...currentShipment, destination: (e.target as HTMLInputElement).value } as Shipment)}
                    />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="status">Status</label>
                  <select
                    id="status"
                    className="input"
                    value={currentShipment?.status || ''}
                    onChange={(e) =>
                      setCurrentShipment({
                        ...currentShipment,
                        status: (e.target as HTMLSelectElement).value as ShipmentStatus,
                      } as Shipment)
                    }
                  >
                    <option value="">Select Status</option>
                    {Object.values(ShipmentStatus).map((status) => (
                      <option key={status} value={status}> {status} </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="notes">Notes</label>
                  <textarea
                    id="notes"
                    className="input"
                    value={currentShipment?.notes || ''}
                    onChange={(e) =>
                      setCurrentShipment({ ...currentShipment, notes: (e.target as HTMLTextAreaElement).value } as Shipment)
                    }
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn bg-gray-100 text-gray-700 hover:bg-gray-200" onClick={() => { setIsModalOpen(false); resetForm();}}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  if (modalMode === 'add') {
                    addShipment({
                      origin: currentShipment?.origin || '',
                      destination: currentShipment?.destination || '',
                      status: currentShipment?.status || ShipmentStatus.PENDING,
                      notes: currentShipment?.notes,
                    });
                  } else {
                    if (currentShipment) {
                      updateShipment(currentShipment);
                    }
                  }
                }}
              >
                {modalMode === 'add' ? 'Add' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
      <footer className="text-center p-4 text-gray-500 dark:text-slate-400">
        Copyright (c) 2025 of Datavtar Private Limited. All rights reserved.
      </footer>
    </div>
  );
};

export default App;
