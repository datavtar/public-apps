import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, XCircle, RotateCcw, ChevronDown, ArrowUp, ArrowDown } from 'lucide-react';

// Define types and interfaces
interface InventoryItem {
 id: string;
 name: string;
 quantity: number;
 lastUpdated: string;
 movementType: 'in' | 'out';
}

type FormMode = 'add' | 'edit' | null;

const App: React.FC = () => {
 const [inventory, setInventory] = useState<InventoryItem[]>([]);
 const [loading, setLoading] = useState<boolean>(false);
 const [error, setError] = useState<string | null>(null);
 const [formMode, setFormMode] = useState<FormMode>(null);
 const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
 const [newItem, setNewItem] = useState<InventoryItem>({
 id: '',
 name: '',
 quantity: 0,
 lastUpdated: '',
 movementType: 'in',
 });

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof InventoryItem | null; direction: 'ascending' | 'descending' }>({
    key: null,
    direction: 'ascending',
  });
  const [filterType, setFilterType] = useState<'all' | 'in' | 'out'>('all');

 // Mock data loading with useEffect
 useEffect(() => {
 setLoading(true);
 const mockData: InventoryItem[] = [
 {
 id: '1',
 name: 'Item A',
 quantity: 10,
 lastUpdated: '2024-07-24',
 movementType: 'in',
 },
 {
 id: '2',
 name: 'Item B',
 quantity: 5,
 lastUpdated: '2024-07-23',
 movementType: 'out',
 },
 {
 id: '3',
 name: 'Item C',
 quantity: 12,
 lastUpdated: '2024-07-24',
 movementType: 'in',
 },
 ];

 setTimeout(() => {
 setInventory(mockData);
 setLoading(false);
 }, 1000);
 }, []);

  const handleAdd = () => {
    setFormMode('add');
    setNewItem({
      id: Date.now().toString(), // Generate unique ID
      name: '',
      quantity: 0,
      lastUpdated: new Date().toLocaleDateString(),
      movementType: 'in',
    });
  };

  const handleEdit = (item: InventoryItem) => {
    setFormMode('edit');
    setSelectedItem(item);
    setNewItem({ ...item }); // Copy item to form
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      setInventory(inventory.filter((item) => item.id !== id));
    }
  };

  const handleSave = () => {

	if (!newItem.name || !newItem.quantity) {
      setError('Please fill in all fields');
	    setTimeout(() => setError(null), 3000);
      return;
    }

    if (newItem.quantity <= 0) {
        setError('Quantity must be a postive number.');
        setTimeout(() => setError(null), 3000);
        return
    }

    const updatedItem = { ...newItem, lastUpdated: new Date().toLocaleDateString() };

    if (formMode === 'add') {
      setInventory([...inventory, updatedItem]);
    } else {
      setInventory(
        inventory.map((item) => (item.id === selectedItem!.id ? updatedItem : item))
      );
      setSelectedItem(null);
    }
    setFormMode(null);
    setNewItem({
      id: '',
      name: '',
      quantity: 0,
      lastUpdated: '',
      movementType: 'in',
    });
  };

  const handleCancel = () => {
    setFormMode(null);
    setNewItem({
      id: '',
      name: '',
      quantity: 0,
      lastUpdated: '',
      movementType: 'in',
    });
    setSelectedItem(null);
  };

 const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
 setSearchTerm(event.target.value);
 };

  const handleSort = (key: keyof InventoryItem) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

    const sortedAndFilteredInventory = React.useMemo(() => {
      let filteredItems = inventory;

      if (searchTerm) {
        filteredItems = filteredItems.filter((item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

    if (filterType !== 'all') {
      filteredItems = filteredItems.filter((item) => item.movementType === filterType);
    }

      if (sortConfig.key) {
        filteredItems.sort((a, b) => {
          const keyA = a[sortConfig.key!];
          const keyB = b[sortConfig.key!];

          if (keyA < keyB) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
          }
          if (keyA > keyB) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
          }
          return 0;
        });
      }
      return filteredItems;
    }, [inventory, searchTerm, sortConfig, filterType]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-slate-100">
       <div className="container-fluid p-4">
        <h1 className="text-2xl font-bold mb-4">Warehouse Inventory Tracker</h1>

        <div className="flex flex-col sm:flex-row gap-4 mb-4">
 <div className="relative ">
            <input
 type="text"
 placeholder="Search Items..."
 className="input w-full pr-10"
 onChange={handleSearch}
 value={searchTerm}
 role="searchbox"
 name="searchInput"
 />
            {searchTerm ? (
 <button
 className="absolute top-0 right-0 h-full px-3 text-gray-500 hover:text-red-500"
 onClick={() => setSearchTerm('')}
 >
 <XCircle className="h-5 w-5" />
 </button>
            ) : (
              <Search className="absolute top-1/2 -translate-y-1/2 right-3 h-5 w-5 text-gray-500" />
            )}
 </div>


          <button
 className="btn btn-primary flex items-center gap-2"
 onClick={handleAdd}
 role="button"
 name="addButton"
 >
 <Plus className='h-4 w-4' /> Add Item
 </button>

          <div className="flex gap-2">
 <button
 className={`btn ${filterType === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
 onClick={() => setFilterType('all')}
 >
 All
 </button>
 <button
 className={`btn ${filterType === 'in' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}
 onClick={() => setFilterType('in')}
 >
 In
 </button>
 <button
 className={`btn ${filterType === 'out' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'}`}
 onClick={() => setFilterType('out')}
 >
 Out
 </button>
 </div>
        </div>

 {loading && (
 <div className="flex justify-center items-center py-4">
 <RotateCcw className="animate-spin h-6 w-6 text-blue-500" />
 </div>
        )}
        {error && <div className="alert alert-error">{error}</div>}

 {formMode && (
 <div className="card-responsive mb-4">
 <h2 className="text-lg font-medium mb-2">{formMode === 'add' ? 'Add New Item' : 'Edit Item'}</h2>
 <div className="space-y-4">
 <div className="form-group">
 <label className="form-label" htmlFor="name">Item Name</label>
 <input
 id="name"
 type="text"
 className="input"
 value={newItem.name}
 onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
 role="textbox"
 name="name"
 />
 </div>
 <div className="form-group">
 <label className="form-label" htmlFor="quantity">Quantity</label>
 <input
 id="quantity"
 type="number"
 className="input"
 value={newItem.quantity}
 onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value, 10) || 0 })}
 role="spinbutton"
 name="quantity"
 />
 </div>
 <div className="form-group">
 <label className="form-label" htmlFor="movementType">Movement Type</label>
 <select
 id="movementType"
 className="input"
 value={newItem.movementType}
 onChange={(e) => setNewItem({ ...newItem, movementType: e.target.value as 'in' | 'out' })}
 role="combobox"
 name="movementType"
 >
 <option value="in">In</option>
 <option value="out">Out</option>
 </select>
 </div>
 <div className="flex justify-end gap-2">
 <button className="btn bg-gray-500 text-white hover:bg-gray-600" onClick={handleCancel} role='button' name='cancelButton'>
 Cancel
 </button>
 <button className="btn btn-primary" onClick={handleSave} role='button' name='saveButton'>
 Save
 </button>
 </div>
 </div>
 </div>
        )}

 <div className="table-container">
 <table className="table">
 <thead className="bg-gray-50 dark:bg-slate-700">
 <tr>
 <th className="table-header" onClick={() => handleSort('name')}>
 <div className="flex items-center cursor-pointer">
 Item Name
 {sortConfig.key === 'name' && (
 <span className="ml-1">
 {sortConfig.direction === 'ascending' ? <ArrowUp className='h-4 w-4' /> : <ArrowDown className='h-4 w-4' />} 
 </span>
                    )}
 </div>
                </th>
 <th className="table-header" onClick={() => handleSort('quantity')}>
 <div className="flex items-center cursor-pointer">
 Quantity
 {sortConfig.key === 'quantity' && (
 <span className="ml-1">
                          {sortConfig.direction === 'ascending' ? <ArrowUp className='h-4 w-4' /> : <ArrowDown className='h-4 w-4' />} 
 </span>
                    )}
 </div>
                </th>
 <th className="table-header" onClick={() => handleSort('lastUpdated')}> 
 <div className="flex items-center cursor-pointer">
 Last Updated
 {sortConfig.key === 'lastUpdated' && (
 <span className="ml-1">
                          {sortConfig.direction === 'ascending' ? <ArrowUp className='h-4 w-4' /> : <ArrowDown className='h-4 w-4' />} 
 </span>
                    )}
 </div>
 </th>
 <th className="table-header" onClick={() => handleSort('movementType')}>Movement Type
 <div className="flex items-center cursor-pointer">
 Movement Type
                        {sortConfig.key === 'movementType' && (
 <span className="ml-1">
 {sortConfig.direction === 'ascending' ? <ArrowUp className='h-4 w-4' /> : <ArrowDown className='h-4 w-4' />} 
 </span>
 )}
 </div>
                </th>
 <th className="table-header">Actions</th>
 </tr>
 </thead>
 <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
 {sortedAndFilteredInventory.map((item) => (
 <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-slate-600">
 <td className="table-cell">{item.name}</td>
 <td className="table-cell">{item.quantity}</td>
 <td className="table-cell">{item.lastUpdated}</td>
 <td className="table-cell">{item.movementType === 'in' ? (
 <span className="badge badge-success">In</span>
 ) : (
 <span className="badge badge-error">Out</span>
 )}</td>
 <td className="table-cell">
 <button
 className="btn btn-sm btn-primary mr-2"
 onClick={() => handleEdit(item)}
 role="button"
 name={`editButton-${item.id}`}
 >
 <Edit className='h-4 w-4' />
 </button>
 <button
 className="btn btn-sm bg-red-500 text-white hover:bg-red-600"
 onClick={() => handleDelete(item.id)}
 role="button"
 name={`deleteButton-${item.id}`}
 >
 <Trash2 className='h-4 w-4' />
 </button>
 </td>
 </tr>
                ))}
 {!sortedAndFilteredInventory.length && (
 <tr>
 <td colSpan={5} className="text-center py-4">
 No items found.
 </td>
 </tr>
                )}
 </tbody>
 </table>
 </div>


      </div>

 <footer className="text-center p-4 mt-8 border-t border-gray-200 dark:border-slate-700">
 Copyright &copy; 2025 of Datavtar Private Limited. All rights reserved.
 </footer>
 </div>
  );
};

export default App;
