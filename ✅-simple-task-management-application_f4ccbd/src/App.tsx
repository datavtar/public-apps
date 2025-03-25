import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, X, RotateCcw, Check, Filter, ChevronDown, ChevronUp, Moon, Sun } from 'lucide-react';
import styles from './styles/styles.module.css';

interface Todo {
 id: string;
 task: string;
 completed: boolean;
 dueDate?: string; // Optional due date
}

type FilterType = 'all' | 'active' | 'completed';
type SortType = 'asc' | 'desc' | 'dueDate';

const App: React.FC = () => {
 const [todos, setTodos] = useState<Todo[]>([]);
 const [taskInput, setTaskInput] = useState<string>('');
 const [editTodoId, setEditTodoId] = useState<string | null>(null);
 const [editTaskInput, setEditTaskInput] = useState<string>('');
 const [searchQuery, setSearchQuery] = useState<string>('');
 const [filter, setFilter] = useState<FilterType>('all');
 const [sort, setSort] = useState<SortType>('asc');
 const [dueDateInput, setDueDateInput] = useState<string>('');
 const [editDueDateInput, setEditDueDateInput] = useState<string>('');
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


 const addTodo = () => {
 if (taskInput.trim() === '') return;
 const newTodo: Todo = {
 id: Date.now().toString(),
 task: taskInput,
 completed: false,
 dueDate: dueDateInput || undefined,
 };
 setTodos([...todos, newTodo]);
 setTaskInput('');
 setDueDateInput('');
 };

 const deleteTodo = (id: string) => {
 setTodos(todos.filter((todo) => todo.id !== id));
 };

 const toggleComplete = (id: string) => {
 setTodos(
 todos.map((todo) =>
 todo.id === id ? { ...todo, completed: !todo.completed } : todo
 )
 );
 };

 const startEdit = (id: string, task: string, dueDate?: string) => {
 setEditTodoId(id);
 setEditTaskInput(task);
 setEditDueDateInput(dueDate || '');
 };

 const updateTodo = () => {
 if (editTaskInput.trim() === '') return;
 setTodos(
 todos.map((todo) =>
 todo.id === editTodoId
 ? { ...todo, task: editTaskInput, dueDate: editDueDateInput || undefined }
 : todo
 )
 );
 setEditTodoId(null);
 setEditTaskInput('');
 setEditDueDateInput('');
 };

 const filteredTodos = todos.filter((todo) => {
 const matchesSearch = todo.task.toLowerCase().includes(searchQuery.toLowerCase());
 const matchesFilter = filter === 'all' || (filter === 'completed' && todo.completed) || (filter === 'active' && !todo.completed);
 return matchesSearch && matchesFilter;
 });

 const sortedTodos = [...filteredTodos].sort((a, b) => {
 if (sort === 'asc') {
 return a.task.localeCompare(b.task);
 } else if (sort === 'desc') {
 return b.task.localeCompare(a.task);
 } else {
  const dateA = a.dueDate ? new Date(a.dueDate) : new Date(0);
        const dateB = b.dueDate ? new Date(b.dueDate) : new Date(0);
 return dateA.getTime() - dateB.getTime();
 }
 });

 const resetSearch = () => {
    setSearchQuery('');
  };


 return (
 <div className="min-h-screen bg-gray-100 dark:bg-slate-900 flex flex-col theme-transition-all">

    <div className="flex items-center justify-end p-4">
        <span className="text-sm dark:text-slate-300 mr-2">Light</span>
           <button 
                className="theme-toggle relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" 
                onClick={() => setIsDarkMode(!isDarkMode)}
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                role="switch"
                name="themeToggle"
              >
                <span
                  className={[
                    'inline-block w-4 h-4 transform rounded-full bg-white shadow-lg transition-transform duration-200',
                    isDarkMode ? 'translate-x-6' : 'translate-x-1'
                  ].join(' ')}
                />
              </button>
        <span className="text-sm dark:text-slate-300 ml-2">Dark</span>
      </div>

 <div className="container mx-auto flex-grow p-4">
 <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-slate-200 mb-8">To-Do App</h1>

 <div className="card-responsive bg-white dark:bg-slate-800 shadow rounded-lg p-6">

    <div className="flex flex-col sm:flex-row gap-4 mb-4">
 <div className="flex-grow">
 <label htmlFor="taskInput" className="form-label">Task</label>
 <input
 id="taskInput"
 type="text"
 className="input w-full"
 value={taskInput}
 onChange={(e) => setTaskInput((e.target as HTMLInputElement).value)}
 placeholder="Add a new task..."
                role="textbox"
                name="taskInput"
 />
            </div>
            <div className="flex-grow">
              <label htmlFor="dueDateInput" className="form-label">Due Date (Optional)</label>
              <input
                id="dueDateInput"
                type="date"
                className="input w-full"
                value={dueDateInput}
                onChange={(e) => setDueDateInput((e.target as HTMLInputElement).value)}
                role="textbox"
                name="dueDateInput"
              />
            </div>
 <button className="btn btn-primary self-end" onClick={addTodo} role="button" name="addTodo">
 <Plus className="h-5 w-5 mr-2" /> Add Task
 </button>
 </div>

 <div className="flex items-center gap-2 mb-4">
            <label htmlFor="searchInput" className="sr-only">Search</label>
 <input
 id="searchInput"
 type="text"
 className="input w-full sm:w-auto"
 value={searchQuery}
 onChange={(e) => setSearchQuery((e.target as HTMLInputElement).value)}
 placeholder="Search tasks..."
                role="search"
                name="searchInput"
 />
            {searchQuery && (
              <button onClick={resetSearch} className="text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-300">
                <X className="h-5 w-5" />
              </button>
            )}
            {!searchQuery && (
                <Search className="h-5 w-5 text-gray-500 dark:text-slate-400"/>
            )}
 </div>


 <div className="flex flex-wrap items-center gap-2 mb-4">
 <label htmlFor="filterSelect" className="form-label">Filter:</label>

 <div className="relative">
 <select
 id="filterSelect"
 className="input appearance-none w-full sm:w-auto pr-8"
 value={filter}
 onChange={(e) => setFilter(e.target.value as FilterType)}
                    role="listbox"
                    name="filterSelect"
 >
 <option value="all">All</option>
 <option value="active">Active</option>
 <option value="completed">Completed</option>
 </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 dark:text-slate-400 pointer-events-none" />
            </div>



 <label htmlFor="sortSelect" className="form-label">Sort:</label>
 <div className="relative">
 <select
 id="sortSelect"
 className="input appearance-none w-full sm:w-auto pr-8"
 value={sort}
 onChange={(e) => setSort(e.target.value as SortType)}
                    role="listbox"
                    name="sortSelect"
 >
 <option value="asc">Ascending</option>
 <option value="desc">Descending</option>
                    <option value="dueDate">Due Date</option>
 </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 dark:text-slate-400 pointer-events-none" />
 </div>
 </div>


 {sortedTodos.length > 0 ? (
 <div className="table-container">
 <table className="table w-full">
 <thead className="bg-gray-50 dark:bg-slate-700">
 <tr>
 <th className="table-header">Task</th>
                            <th className="table-header">Due Date</th>
 <th className="table-header">Status</th>
 <th className="table-header">Actions</th>
 </tr>
 </thead>
 <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-gray-700">
 {sortedTodos.map((todo) => (
 <tr key={todo.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
 <td className="table-cell">
 {editTodoId === todo.id ? (
 <input
 type="text"
 className="input w-full"
 value={editTaskInput}
 onChange={(e) => setEditTaskInput((e.target as HTMLInputElement).value)}
                                    role="textbox"
                                    name="editTaskInput"
 />
 ) : (
 <span
 className={
 todo.completed
 ? 'line-through text-gray-500 dark:text-slate-400'
 : 'text-gray-900 dark:text-slate-100'
 }
 >
 {todo.task}
 </span>
 )}
 </td>
                            <td className="table-cell">
                  {editTodoId === todo.id ? (
                    <input
                      type="date"
                      className="input w-full"
                      value={editDueDateInput}
                      onChange={(e) => setEditDueDateInput((e.target as HTMLInputElement).value)}
                      role="textbox"
                      name="editDueDateInput"
                    />
                  ) : (
                    <span className={
                      todo.completed
                        ? 'line-through text-gray-500 dark:text-slate-400'
                        : 'text-gray-900 dark:text-slate-100'
                    }>
                      {todo.dueDate || 'N/A'}
                    </span>
                  )}
                </td>
 <td className="table-cell">
 <button
 onClick={() => toggleComplete(todo.id)}
 className={`badge ${todo.completed ? 'badge-success' : 'badge-warning'}`}
                            role="checkbox"
                            aria-checked={todo.completed}
                            name={`completeStatus-${todo.id}`}
 >
 {todo.completed ? 'Completed' : 'Active'}
 </button>
 </td>
 <td className="table-cell">
 {editTodoId === todo.id ? (
 <>
 <button
 onClick={updateTodo}
 className="btn btn-sm btn-primary mr-2"
                                        role="button"
                                        name="saveEdit"
 >
 <Check className="h-4 w-4" />
 </button>
 <button
 onClick={() => {setEditTodoId(null); setEditTaskInput(''); setEditDueDateInput('')}}
 className="btn btn-sm bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                                    role="button"
                                    name="cancelEdit"
 >
                                    <X className="h-4 w-4"/>
 </button>
 </>
 ) : (
 <>
 <button
 onClick={() => startEdit(todo.id, todo.task, todo.dueDate)}
 className="btn btn-sm btn-primary mr-2"
                                    role="button"
                                    name="editTodo"
 >
 <Edit className="h-4 w-4" />
 </button>
 <button
 onClick={() => deleteTodo(todo.id)}
 className="btn btn-sm btn-error"
                                    role="button"
                                    name="deleteTodo"
 >
 <Trash2 className="h-4 w-4" />
 </button>
 </>
 )}
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 ) : (
 <p className="text-gray-500 dark:text-slate-400">No tasks found.</p>
 )}
 </div>
 </div>

 <footer className="text-center p-4 text-gray-500 dark:text-slate-400">
        Copyright (c) 2025 of Datavtar Private Limited. All rights reserved.
      </footer>

 </div>
 );
};

export default App;
