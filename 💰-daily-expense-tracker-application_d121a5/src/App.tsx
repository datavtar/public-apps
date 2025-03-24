import React, { useState, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { Calendar, Edit2, Trash2, PlusCircle, X, ChevronLeft, ChevronRight, Search, Filter, ArrowUp, ArrowDown, Save } from 'lucide-react';


interface Expense {
 id: number;
 description: string;
 amount: number;
 date: Date;
 category: string;
}

const categories = ['Food', 'Transportation', 'Entertainment', 'Utilities', 'Other'];

const App: React.FC = () => {
 const [expenses, setExpenses] = useState<Expense[]>([]);
 const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);

 const [isModalOpen, setIsModalOpen] = useState(false);
 const [currentExpense, setCurrentExpense] = useState<Expense | null>(null);


 const [searchTerm, setSearchTerm] = useState('');
 const [filterCategory, setFilterCategory] = useState('');
 const [sortType, setSortType] = useState<'date' | 'amount'>('date');
 const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);

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

 const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleDateChange = (date: Date) => {
     setSelectedDate(date);
    if (currentExpense) {
      setCurrentExpense({ ...currentExpense, date });
      
    }
    setShowCalendar(false);
  };


 const startOfMonthDate = startOfMonth(currentMonth);
  const endOfMonthDate = endOfMonth(currentMonth);

   const daysInMonth = eachDayOfInterval({
    start: startOfMonthDate,
    end: endOfMonthDate,
  });

  const renderCalendar = () => {

  return (
      <div className="absolute z-10 p-4 bg-white dark:bg-slate-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
              <button
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded" name='prev-month' role='button'
              >
                  <ChevronLeft size={16} />
              </button>
              <span className="text-lg font-semibold">{format(currentMonth, 'MMMM yyyy')}</span>
              <button
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                   className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded" name='next-month' role='button'
              >
                  <ChevronRight size={16} />
              </button>
          </div>
        <div className="grid grid-cols-7 gap-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 dark:text-gray-400">
              {day}
            </div>
          ))}
          {daysInMonth.map((day) => {
            const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
            return (
              <button
                key={day.toISOString()}
                onClick={() => handleDateChange(day)}
                className={`p-2 rounded-full hover:bg-primary-200 dark:hover:bg-primary-700 ${isSelected ? 'bg-primary-500 text-white dark:bg-primary-400' : ''}`}
              >
                {format(day, 'd')}
              </button>
            );
          })}
        </div>
      </div>
    );
  };


 useEffect(() => {
  const storedExpenses = localStorage.getItem('expenses');
  if (storedExpenses) {
   setExpenses(JSON.parse(storedExpenses).map((e: Expense) => ({
    ...e,
    date: new Date(e.date),
   })));
  }
 }, []);

 useEffect(() => {
  localStorage.setItem('expenses', JSON.stringify(expenses));
  handleFilterAndSort();
 }, [expenses, searchTerm, filterCategory, sortType, sortOrder]);


 const addOrUpdateExpense = (e: React.FormEvent) => {
  e.preventDefault();
  if (currentExpense) {
   if (currentExpense.id === 0) {
    // Add new expense
    const newExpense = { ...currentExpense, id: Date.now() };
    setExpenses([...expenses, newExpense]);
   } else {
    // Update existing expense
    setExpenses(
     expenses.map((expense) => (expense.id === currentExpense.id ? currentExpense : expense))
    );
   }
   setCurrentExpense(null);
   setIsModalOpen(false);
    setSelectedDate(null);
  }
 };

 const deleteExpense = (id: number) => {
  setExpenses(expenses.filter((expense) => expense.id !== id));
 };


  const handleFilterAndSort = () => {
    let filtered = [...expenses];

    if (searchTerm) {
      filtered = filtered.filter(expense =>
        expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterCategory) {
      filtered = filtered.filter(expense => expense.category === filterCategory);
    }

    filtered.sort((a, b) => {
      const order = sortOrder === 'asc' ? 1 : -1;
      if (sortType === 'date') {
        return order * (a.date.getTime() - b.date.getTime());
      } else {
        return order * (a.amount - b.amount);
      }
    });

    setFilteredExpenses(filtered);
  };

 const openModal = (expense?: Expense) => {
    if (expense) {
        setCurrentExpense({...expense});
        setSelectedDate(expense.date);
    } else {
        setCurrentExpense({ id: 0, description: '', amount: 0, date: new Date(), category: 'Food' });
         setSelectedDate(new Date());
    }
  setIsModalOpen(true);
 };


 return (
  <div className="min-h-screen bg-gray-100 dark:bg-slate-900 flex flex-col">

    <div className="py-4 px-6 bg-primary-500 text-white flex items-center justify-between">
        <h1 className="text-2xl font-bold">Expense Tracker</h1>
        <div className="flex items-center space-x-2">
            <span className="text-sm">Light</span>
                <button 
                    className="theme-toggle relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 focus:outline-none"
                    onClick={toggleDarkMode}
                    aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                    name='theme-toggle'
                    role='button'
                >
                    <span
                    className={`
                        theme-toggle-thumb
                        inline-block w-4 h-4 transform bg-white rounded-full shadow-sm transition-transform duration-200 ease-in-out
                        ${isDarkMode ? 'translate-x-6' : 'translate-x-1'}
                    `}
                    >
                    </span>
                    <span className="sr-only">{isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}</span>
                </button>
            <span className="text-sm">Dark</span>
        </div>
    </div>

   <div className="container-fluid p-4 flex-grow">

    <div className="mb-4 flex flex-col sm:flex-row gap-2 sm:gap-4">
     <button className="btn btn-primary flex items-center" onClick={() => openModal()} name='add-expense' role='button'>
      <PlusCircle className="mr-2" size={16} /> Add Expense
     </button>
     
      <div className="relative w-full sm:w-1/2 lg:w-1/4">
        <input
          type="text"
          placeholder="Search..."
          className="input pr-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm((e.target as HTMLInputElement).value)}
          name = "search"
          role='searchbox'
        />
         <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
      </div>
      <select
        className="input w-full sm:w-1/2 lg:w-1/4 "
        value={filterCategory}
        onChange={(e) => setFilterCategory((e.target as HTMLSelectElement).value)}
        name = "filter"
        role = "listbox"
      >
        <option value="">All Categories</option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
            <button 
                onClick={() => setSortType('date')} 
                className="btn-responsive p-2 border rounded hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center"
                name='sort-by-date'
                role='button'
            >
                Date
                {sortType === 'date' && sortOrder === 'asc' && <ArrowUp className="ml-1" size={16} />}
                {sortType === 'date' && sortOrder === 'desc' && <ArrowDown className="ml-1" size={16} />}
            </button>
            <button 
                onClick={() => setSortType('amount')} 
                className="btn-responsive p-2 border rounded hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center"
                name='sort-by-amount'
                role='button'
            >
                Amount
                {sortType === 'amount' && sortOrder === 'asc' && <ArrowUp className="ml-1" size={16}/>}
                {sortType === 'amount' && sortOrder === 'desc' && <ArrowDown className="ml-1" size={16}/>}
            </button>
            <button 
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')} 
                className="btn-responsive p-2 border rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                name='toggle-sort-order'
                role='button'
            >
                {sortOrder === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16}/>}
            </button>
    </div>

    <div className="table-container">
     <table className="table">
      <thead>
       <tr>
        <th className="table-header">Description</th>
        <th className="table-header">Amount</th>
        <th className="table-header">Date</th>
        <th className="table-header">Category</th>
        <th className="table-header">Actions</th>
       </tr>
      </thead>
      <tbody>
       {filteredExpenses.map((expense) => (
        <tr key={expense.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
         <td className="table-cell">{expense.description}</td>
         <td className="table-cell">${expense.amount.toFixed(2)}</td>
         <td className="table-cell">{format(expense.date, 'yyyy-MM-dd')}</td>
         <td className="table-cell">{expense.category}</td>
         <td className="table-cell">
          <button
           className="btn btn-sm btn-primary mr-2"
           onClick={() => openModal(expense)}
           name={`edit-expense-${expense.id}`}
           role='button'
          >
           <Edit2 size={16} />
          </button>
          <button
           className="btn btn-sm bg-red-500 text-white hover:bg-red-600"
           onClick={() => deleteExpense(expense.id)}
            name={`delete-expense-${expense.id}`}
            role='button'
          >
           <Trash2 size={16} />
          </button>
         </td>
        </tr>
       ))}
      </tbody>
     </table>
    </div>

    {isModalOpen && currentExpense && (
     <div className="modal-backdrop">
      <div className="modal-content">
       <div className="modal-header">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{currentExpense.id === 0 ? 'Add Expense' : 'Edit Expense'}</h3>
        <button className="text-gray-400 hover:text-gray-500" onClick={() => {setIsModalOpen(false); setCurrentExpense(null); setSelectedDate(null);}} name='close-modal' role='button'>
         <X size={20} />
        </button>
       </div>
       <form onSubmit={addOrUpdateExpense} className="space-y-4">
        <div className="form-group">
         <label className="form-label" htmlFor="description">Description</label>
         <input
          id="description"
          type="text"
          className="input"
          value={currentExpense.description}
          onChange={(e) =>
           setCurrentExpense({ ...currentExpense, description: (e.target as HTMLInputElement).value })
          }
          required
          name='description'
          role='textbox'
         />
        </div>
        <div className="form-group">
         <label className="form-label" htmlFor="amount">Amount</label>
         <input
          id="amount"
          type="number"
          className="input"
          value={currentExpense.amount}
          onChange={(e) =>
           setCurrentExpense({
            ...currentExpense,
            amount: parseFloat((e.target as HTMLInputElement).value),
           })
          }
          required
          name='amount'
          role='spinbutton'
         />
        </div>
        <div className="form-group">
        <label className="form-label" htmlFor="date">Date</label>
        <div className="relative">
            <input
            id="date"
            type="text"
            className="input pr-10"
            value={format(selectedDate!, 'yyyy-MM-dd')}
            readOnly
            onClick={() => setShowCalendar(true)}
            name='date'
            role='textbox'
            />
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} onClick={() => setShowCalendar(!showCalendar)} />
            {showCalendar && renderCalendar()}
        </div>
        </div>

        <div className="form-group">
         <label className="form-label" htmlFor="category">Category</label>
         <select
          id="category"
          className="input"
          value={currentExpense.category}
          onChange={(e) =>
           setCurrentExpense({ ...currentExpense, category: (e.target as HTMLSelectElement).value })
          }
          name='category'
          role='listbox'
         >
          {categories.map((category) => (
           <option key={category} value={category}>
            {category}
           </option>
          ))}
         </select>
        </div>
        <div className="modal-footer">
         <button type="button" className="btn bg-gray-100 text-gray-700 hover:bg-gray-200" onClick={() => {setIsModalOpen(false); setCurrentExpense(null); setSelectedDate(null);}} name='cancel' role='button'>
          Cancel
         </button>
         <button type="submit" className="btn btn-primary" name='save' role='button'>
          <Save className-mr-2 size={16}/>
          Save
         </button>
        </div>
       </form>
      </div>
     </div>
    )}
   </div>
   <footer className="text-center py-4 text-gray-500 dark:text-gray-400">
    Copyright (c) 2025 of Datavtar Private Limited. All rights reserved.
   </footer>
  </div>
 );
};

export default App;
