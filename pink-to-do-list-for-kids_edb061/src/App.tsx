import React, { useState, useEffect } from 'react';
import { PlusCircleIcon, PencilIcon, TrashIcon, CheckIcon, XIcon } from 'lucide-react';

interface Todo {
 id: string;
 text: string;
 completed: boolean;
}

const App: React.FC = () => {
 const [todos, setTodos] = useState<Todo[]>([]);
 const [newTodo, setNewTodo] = useState<string>('');
 const [editTodo, setEditTodo] = useState<Todo | null>(null);
 const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
 const [searchQuery, setSearchQuery] = useState<string>('');
 const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

 useEffect(() => {
  const savedMode = localStorage.getItem('darkMode');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setIsDarkMode(savedMode === 'true' || (savedMode === null && prefersDark));
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

 const addTodo = () => {
  if (newTodo.trim() !== '') {
   setTodos([...todos, { id: Date.now().toString(), text: newTodo, completed: false }]);
   setNewTodo('');
  }
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

 const startEditing = (todo: Todo) => {
  setEditTodo(todo);
 };

 const updateTodo = (id: string, newText: string) => {
        if (newText.trim() === '') {
            alert('Task cannot be empty');
            return;
        }
  setTodos(
   todos.map((todo) => (todo.id === id ? { ...todo, text: newText } : todo))
  );
  setEditTodo(null);
 };

 const filteredTodos = todos.filter((todo) => {
  const matchesSearch = todo.text.toLowerCase().includes(searchQuery.toLowerCase());
  if (filter === 'all') return matchesSearch;
  if (filter === 'active') return matchesSearch && !todo.completed;
  if (filter === 'completed') return matchesSearch && todo.completed;
  return true;
 });

 const sortedTodos = [...filteredTodos].sort((a, b) => {
        return a.text.localeCompare(b.text);
    });

 const ThemeToggle = () => (
        <button
            className="theme-toggle p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-400"
            onClick={() => setIsDarkMode(!isDarkMode)}
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            name={isDarkMode ? 'light-mode-button' : 'dark-mode-button'}
            role="button"
        >
            {isDarkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
            )}
        </button>
    );

 return (
  <div className={`min-h-screen bg-pink-100 dark:bg-gray-900 text-gray-800 dark:text-pink-200 theme-transition-all ${isDarkMode ? 'dark' : ''}`}>
   <div className="container mx-auto px-4 py-8">
     <div className="flex justify-between items-center mb-4">
                <h1 className="text-3xl font-bold text-pink-600 dark:text-pink-400">My To-Do List</h1>
       <ThemeToggle />
            </div>

    <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
     <input
      type="text"
      placeholder="Add a new todo..."
      value={newTodo}
      onChange={(e) => setNewTodo(e.target.value)}
      className="input flex-grow bg-pink-50 dark:bg-gray-700 text-gray-900 dark:text-pink-100 border-pink-300 dark:border-gray-600 placeholder-pink-400 dark:placeholder-pink-300 focus:ring-pink-500 focus:border-pink-500 w-full rounded-md px-3 py-2" 
      name="add-todo-input"
      role="textbox"
     />
     <button
      onClick={addTodo}
      className="btn-responsive bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-4 rounded-md inline-flex items-center gap-2"
      name="add-todo-button"
      role="button"
     >
      <PlusCircleIcon className="h-5 w-5" />
      <span>Add</span>
     </button>
    </div>

    <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
                    <input
                        type="text"
                        placeholder="Search todos..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input flex-grow bg-pink-50 dark:bg-gray-700 text-gray-900 dark:text-pink-100 border-pink-300 dark:border-gray-600 placeholder-pink-400 dark:placeholder-pink-300 focus:ring-pink-500 focus:border-pink-500 w-full rounded-md px-3 py-2" 
                        name="search-todo-input"
                        role="searchbox"
     />
     <select
      value={filter}
      onChange={(e) => setFilter(e.target.value as 'all' | 'active' | 'completed')}
      className="select bg-pink-50 dark:bg-gray-700 text-gray-900 dark:text-pink-100 border-pink-300 dark:border-gray-600 focus:ring-pink-500 focus:border-pink-500 rounded-md px-3 py-2"
      name="filter-select"
      role="listbox"
     >
      <option value="all">All</option>
      <option value="active">Active</option>
      <option value="completed">Completed</option>
     </select>
    </div>

    
     {sortedTodos.length === 0 && (
      <div className="text-center text-pink-500 dark:text-pink-300">No tasks found.</div>
     )}

    <div className="space-y-4">
     {sortedTodos.map((todo) => (
      <div
       key={todo.id}
       className={`card-responsive p-4 rounded-lg shadow-md flex items-center justify-between bg-pink-50 dark:bg-gray-800 border ${todo.completed ? 'border-green-400 dark:border-green-600' : 'border-pink-200 dark:border-gray-700'}`}
      >
       {editTodo?.id === todo.id ? (
        <div className="flex items-center w-full gap-2">
         <input
          type="text"
          defaultValue={editTodo.text}
          onBlur={(e) => updateTodo(todo.id, e.target.value)}
          onKeyDown={(e) => {
           if (e.key === 'Enter') {
            updateTodo(todo.id, (e.target as HTMLInputElement).value);
           }
          }}
          className="input flex-grow bg-pink-100 dark:bg-gray-700 text-gray-900 dark:text-pink-100 border-pink-300 dark:border-gray-600 focus:ring-pink-500 focus:border-pink-500 rounded-md px-3 py-2"
          autoFocus
          name={`edit-todo-input-${todo.id}`}
          role="textbox"
         />
         <button
          onClick={() => updateTodo(todo.id, editTodo.text)}
          className="text-green-500 hover:text-green-700 p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-green-400"
          name={`save-todo-button-${todo.id}`}
          role="button"
         >
          <CheckIcon className="h-5 w-5" />
         </button>
         <button
          onClick={() => setEditTodo(null)}
          className="text-red-500 hover:text-red-700 p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-red-400"
          name={`cancel-edit-button-${todo.id}`}
          role="button"
         >
          <XIcon className="h-5 w-5" />
         </button>
        </div>
       ) : (
        <div className="flex items-center justify-between w-full">
         <div className="flex items-center">
          <button
           onClick={() => toggleComplete(todo.id)}
           className={`p-3 rounded-full focus:outline-none focus:ring-2 ${todo.completed
            ? 'bg-green-200 dark:bg-green-700 text-green-600 dark:text-green-400 focus:ring-green-400'
            : 'bg-pink-200 dark:bg-gray-600 text-pink-500 dark:text-pink-300 focus:ring-pink-400'}`}
           name={`complete-button-${todo.id}`}
           role="button"
          >
           {todo.completed ? (
            <CheckIcon className="h-6 w-6" />
           ) : (
            <div className="h-6 w-6"></div>
           )}
          </button>
          <span className={`ml-3 text-lg ${todo.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-pink-200'}`}>
           {todo.text}
          </span>
         </div>
         <div className="flex items-center">
          <button
           onClick={() => startEditing(todo)}
           className="text-pink-500 hover:text-pink-700 dark:hover:text-pink-300 p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-400 mr-2"
           name={`edit-button-${todo.id}`}
           role="button"
          >
           <PencilIcon className="h-5 w-5" />
          </button>
          <button
           onClick={() => deleteTodo(todo.id)}
           className="text-red-500 hover:text-red-700 dark:hover:text-red-400 p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-red-400"
           name={`delete-button-${todo.id}`}
           role="button"
          >
           <TrashIcon className="h-5 w-5" />
          </button>
         </div>
        </div>
       )}
      </div>
     ))}
    </div>
   </div>
            <footer className="text-center text-pink-600 dark:text-pink-400 py-4 mt-8">
                Copyright (c) 2025 of Datavtar Private Limited. All rights reserved.
            </footer>
  </div>
 );
};

export default App;
