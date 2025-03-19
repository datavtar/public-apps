import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash, Check, X, Search, SlidersHorizontal } from 'lucide-react';

interface Todo {
 id: string;
 task: string;
 completed: boolean;
}

const App: React.FC = () => {
 const [todos, setTodos] = useState<Todo[]>([]);
 const [taskInput, setTaskInput] = useState<string>('');
 const [editId, setEditId] = useState<string | null>(null);
 const [editText, setEditText] = useState<string>('');
 const [searchQuery, setSearchQuery] = useState<string>('');
 const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
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
 if (taskInput.trim() !== '') {
 const newTodo: Todo = {
 id: Date.now().toString(),
 task: taskInput,
 completed: false,
 };
 setTodos([...todos, newTodo]);
 setTaskInput('');
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

 const startEdit = (id: string, task: string) => {
 setEditId(id);
 setEditText(task);
 };

 const saveEdit = (id: string) => {
 setTodos(
 todos.map((todo) => (todo.id === id ? { ...todo, task: editText } : todo))
 );
 setEditId(null);
 setEditText('');
 };

 const cancelEdit = () => {
 setEditId(null);
 setEditText('');
 };

 const filteredTodos = todos.filter((todo) => {
 const matchesSearch = todo.task.toLowerCase().includes(searchQuery.toLowerCase());
 const matchesFilter = filter === 'all' || (filter === 'active' && !todo.completed) || (filter === 'completed' && todo.completed);
 return matchesSearch && matchesFilter;
 });


 return (
 <div className="min-h-screen bg-gray-100 dark:bg-slate-900 text-gray-900 dark:text-slate-100 theme-transition-all">

   <div className="flex items-center justify-between p-4">

     <div className="flex items-center space-x-2">
    <span className="text-sm dark:text-slate-300">Light</span>
      <button 
        className="theme-toggle relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-slate-900 focus:ring-primary-500"
        onClick={() => setIsDarkMode(!isDarkMode)}
        aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className="theme-toggle-thumb inline-block w-4 h-4 transform translate-x-0.5 translate-y-0.5 bg-white rounded-full transition-transform" style={{ transform: isDarkMode ? 'translateX(1.625rem)' : 'translateX(0.125rem)' }}></span>
    
    </button>
     <span className="text-sm dark:text-slate-300">Dark</span>
  </div>
   </div>

   <div className="container mx-auto px-4 py-8">
     <h1 className="text-3xl font-bold text-center mb-6">Todo App</h1>

     <div className="flex flex-col sm:flex-row gap-4 mb-6">
       <input
         type="text"
         value={taskInput}
         onChange={(e) => setTaskInput(e.target.value)}
         placeholder="Add a new todo..."
         className="input w-full sm:w-auto"
         role="textbox"
         name="todoInput"
       />
       <button onClick={addTodo} className="btn btn-primary flex items-center gap-2">
         <Plus className="h-4 w-4" /> Add Todo
       </button>
     </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative w-full sm:w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <input
          type="text"
          placeholder="Search todos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10 w-full"
            role="search"
          name="searchInput"
        />
          </div>

      <div className="relative w-full sm:w-48">
        <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as 'all' | 'active' | 'completed')}
              className="input pl-10 w-full appearance-none"
              role="listbox"
          name="filterSelect"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>
      </div>
    </div>

       <div className="space-y-4">
       {filteredTodos.length === 0 ? (
          <p className="text-gray-500 dark:text-slate-400">No todos found.</p>
        ) : (
          filteredTodos.map((todo) => (
            <div
              key={todo.id}
                className={`card p-4 flex items-center justify-between ${todo.completed ? 'opacity-60' : ''}`}
            >
              <div className="flex items-center gap-4">
                <button
                  onClick={() => toggleComplete(todo.id)}
                    className={`rounded-full h-6 w-6 flex items-center justify-center ${todo.completed
                      ? 'bg-green-500 text-white'
                      : 'border border-gray-300 dark:border-gray-700'}`}
                >
                  {todo.completed && <Check className="h-4 w-4" />}
                </button>
                {editId === todo.id ? (
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                      className="input flex-grow"
                      role="textbox"
                    name="editInput"
                  />
                ) : (
                  <span className={todo.completed ? 'line-through text-gray-500 dark:text-slate-400' : ''}>
                      {todo.task}
                  </span>
                )}
              </div>
                <div className="flex items-center gap-2">

                {editId === todo.id ? (
                  <>
                    <button
                      onClick={() => saveEdit(todo.id)}
                      className="btn btn-primary btn-sm flex items-center gap-1"
                        title="Save"
                    >
                      <Check className="h-3 w-3" />
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="btn btn-sm bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center gap-1"
                        title="Cancel"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => startEdit(todo.id, todo.task)}
                        className="btn btn-primary btn-sm flex items-center gap-1"
                        title="Edit"
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className="btn btn-sm bg-red-500 text-white hover:bg-red-600 flex items-center gap-1"
                        title="Delete"
                    >
                      <Trash className="h-3 w-3" />
                    </button>
                  </>
                )}

              </div>
            </div>
          ))
         )}
          </div>


   </div>
     <footer className="text-center p-4 mt-8 text-gray-500 dark:text-slate-400">
      Copyright (c) 2025 of Datavtar Private Limited. All rights reserved.
    </footer>
 </div>
 );
};

export default App;
