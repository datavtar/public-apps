import React, { useState, useEffect } from 'react';
import styles from './styles/styles.module.css';
import { Plus, Pencil, Trash2, XCircle, CheckCircle, Sun, Moon, RotateCcw, Search } from 'lucide-react';

interface Todo {
 id: string;
 text: string;
 completed: boolean;
}

const App: React.FC = () => {
 const [todos, setTodos] = useState<Todo[]>([]);
 const [newTodo, setNewTodo] = useState<string>('');
 const [editTodoId, setEditTodoId] = useState<string | null>(null);
 const [editTodoText, setEditTodoText] = useState<string>('');
 const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
 const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
 const [searchTerm, setSearchTerm] = useState<string>('');
 const [isDarkMode, setIsDarkMode] = useState<boolean>(false);


 useEffect(() => {
 const savedMode = localStorage.getItem('darkMode');
 const initialDarkMode = savedMode === 'true' || (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
 setIsDarkMode(initialDarkMode);
 }, []);

 useEffect(() => {
 if (isDarkMode) {
 document.documentElement.classList.add('dark');
 localStorage.setItem('darkMode', 'true');
 } else {
 document.documentElement.classList.remove('dark');
 localStorage.setItem('darkMode', 'false');
 }
 }, [isDarkMode]);

 const handleAddTodo = () => {
 if (newTodo.trim() !== '') {
 const newId = Date.now().toString();
 setTodos([...todos, { id: newId, text: newTodo, completed: false }]);
 setNewTodo('');
 }
 };

 const handleDeleteTodo = (id: string) => {
 setTodos(todos.filter((todo) => todo.id !== id));
 };

 const handleToggleComplete = (id: string) => {
 setTodos(
 todos.map((todo) =>
 todo.id === id ? { ...todo, completed: !todo.completed } : todo
 )
 );
 };

 const handleEditStart = (id: string, text: string) => {
 setEditTodoId(id);
 setEditTodoText(text);
 };

 const handleEditCancel = () => {
 setEditTodoId(null);
 setEditTodoText('');
 };

 const handleEditSave = (id: string) => {
 setTodos(
 todos.map((todo) => (todo.id === id ? { ...todo, text: editTodoText } : todo))
 );
 setEditTodoId(null);
 setEditTodoText('');
 };

 const filteredTodos = todos.filter((todo) => {
 if (filter === 'active') return !todo.completed;
 if (filter === 'completed') return todo.completed;
 return true;
 }).filter(todo => todo.text.toLowerCase().includes(searchTerm.toLowerCase()));

 const sortedTodos = [...filteredTodos].sort((a, b) => {
 if (sortOrder === 'asc') {
 return a.text.localeCompare(b.text);
 } else {
 return b.text.localeCompare(a.text);
 }
 });

 const toggleTheme = () => {
 setIsDarkMode(!isDarkMode);
 }

 return (
 <div className={`min-h-screen bg-gray-100 dark:bg-slate-900 text-gray-900 dark:text-slate-100 ${styles.themeTransitionAll}`}>
 <div className="container mx-auto px-4 py-8">

 <div className="flex items-center justify-between mb-6">
 <div>
 <h1 className="text-3xl font-bold">Todo App</h1>
 </div>
 <div className="flex items-center gap-4">
 <div className="flex items-center gap-2">
 <span className="text-sm">Light</span>
 <button
 className="relative w-12 h-6 transition-all duration-200 ease-in-out bg-gray-400 rounded-full dark:bg-blue-600"
 onClick={toggleTheme}
 aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
 role="switch"
 name="themeToggle"
 >
 <span
 className={`absolute left-1 top-1 w-4 h-4 transition-transform duration-200 ease-in-out transform ${isDarkMode ? 'translate-x-6 bg-white' : 'translate-x-0 bg-gray-700' } rounded-full`}
 />
 </button>
 <span className="text-sm">Dark</span>
 </div>

 <button
 onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
 className="btn btn-primary flex items-center gap-1"
 role="button"
 name="sortButton"
 >
 <RotateCcw size={16} />
 <span>{sortOrder === 'asc' ? 'A-Z' : 'Z-A'}</span>
 </button>
 </div>
 </div>

 <div className="card-responsive bg-white dark:bg-slate-800 shadow-md rounded-lg p-4 md:p-6 mb-6">
 <div className="flex flex-col sm:flex-row items-center gap-4">
 <input
 type="text"
 placeholder="Add a new todo..."
 value={newTodo}
 onChange={(e) => setNewTodo(e.target.value)}
 className="input w-full sm:w-auto"
 role="textbox"
 name="addTodoInput"
 />
 <button
 onClick={handleAddTodo}
 className="btn btn-primary w-full sm:w-auto flex items-center gap-x-1 justify-center"
 role="button"
 name="addTodoButton"
 >
 <Plus size={16} />
 <span>Add Todo</span>
 </button>
 </div>
 </div>

 <div className="mb-6 flex items-center justify-between">
 <div className="flex items-center gap-4">
 <button onClick={() => setFilter('all')} className={`btn ${filter === 'all' ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>All</button>
 <button onClick={() => setFilter('active')} className={`btn ${filter === 'active' ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>Active</button>
 <button onClick={() => setFilter('completed')} className={`btn ${filter === 'completed' ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>Completed</button>
 </div>
 <div className="flex-shrink-0">
 <input
 type="search"
 placeholder="Search..."
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 className="input w-full md:w-64"
 role="search"
 name="searchInput"
 />
 </div>
 </div>

 <div className="space-y-4">
 {sortedTodos.map((todo) => (
 <div
 key={todo.id}
 className={`card-responsive flex items-center justify-between bg-white dark:bg-slate-800 shadow rounded-lg p-4 ${todo.completed ? 'opacity-60' : ''}`}
 >
 {editTodoId === todo.id ? (
 <>
 <input
 type="text"
 value={editTodoText}
 onChange={(e) => setEditTodoText(e.target.value)}
 className="input flex-grow mr-2"
 autoFocus
 role="textbox"
 name="editTodoInput"
 />
 <div className="flex items-center gap-x-2">
 <button
 onClick={() => handleEditSave(todo.id)}
 className="btn btn-sm btn-primary flex items-center gap-x-1"
 role="button"
 name="saveEditButton"
 >
 <CheckCircle size={16} />
 <span>Save</span>
 </button>
 <button
 onClick={handleEditCancel}
 className="btn btn-sm bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 flex items-center gap-x-1"
 role="button"
 name="cancelEditButton"
 >
 <XCircle size={16} />
 <span>Cancel</span>
 </button>
 </div>
 </>
 ) : (
 <>
 <div className="flex items-center gap-x-4 w-full">
 <input
 type="checkbox"
 checked={todo.completed}
 onChange={() => handleToggleComplete(todo.id)}
 className="form-checkbox h-5 w-5 text-primary-600 dark:bg-slate-700 dark:checked:bg-primary-500"
 role="checkbox"
 name="completeCheckbox"
 />
 <span className={`flex-grow text-gray-700 dark:text-slate-300 ${todo.completed ? 'line-through' : ''}`}>{todo.text}</span>
 </div>
 <div className="flex items-center gap-x-2">
 <button
 onClick={() => handleEditStart(todo.id, todo.text)}
 className="btn btn-sm btn-primary flex items-center gap-x-1"
 role="button"
 name="editButton"
 disabled={todo.completed}
 >
 <Pencil size={16} />
 <span>Edit</span>
 </button>
 <button
 onClick={() => handleDeleteTodo(todo.id)}
 className="btn btn-sm bg-red-500 text-white hover:bg-red-600 flex items-center gap-x-1"
 role="button"
 name="deleteButton"
 >
 <Trash2 size={16} />
 <span>Delete</span>
 </button>
 </div>
 </>
 )}
 </div>
 ))}
 </div>
 </div>
 <footer className="text-center py-4 text-gray-600 dark:text-gray-400">
 Copyright (c) 2025 of Datavtar Private Limited. All rights reserved.
 </footer>
 </div>
 );
};

export default App;
