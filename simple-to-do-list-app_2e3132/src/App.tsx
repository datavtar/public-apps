import React, { useState, useEffect } from 'react';
import styles from './styles/styles.module.css';
import { Plus, Pencil, Trash2, X, Check, Sun, Moon, Search } from 'lucide-react';


interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState<string>('');
  const [editTodo, setEditTodo] = useState<Todo | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState<string>('');


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

  const updateTodo = () => {
    if (editTodo) {
      setTodos(
        todos.map((todo) =>
          todo.id === editTodo.id ? { ...editTodo } : todo
        )
      );
      setEditTodo(null);
    }
  };

    const filteredTodos = todos.filter(todo =>
        todo.text.toLowerCase().includes(searchQuery.toLowerCase())
    );


  return (
    <div className={`min-h-screen bg-gray-100 dark:bg-slate-900 text-gray-900 dark:text-slate-100 theme-transition-all ${isDarkMode ? 'dark' : ''}`}>
      <header className="container-fluid py-4 flex justify-between items-center">
            <h1 className="text-2xl sm:text-3xl font-bold">Todo App</h1>

            <div className="flex items-center space-x-2">
                <span className="text-sm dark:text-slate-300">Light</span>
                <button
                    className="theme-toggle"
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                    role="switch"
                    name="themeToggle"
                >
                    <span className="theme-toggle-thumb"></span>
                    <span className="sr-only">{isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}</span>
                </button>
                <span className="text-sm dark:text-slate-300">Dark</span>
            </div>
        </header>

      <main className="container-fluid py-6">
        <div className="card-responsive mb-6">
                <div className="flex items-center gap-2 mb-4">
                <input
                  type="text"
                  placeholder="Search todos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input flex-grow mr-2"
                        role="searchbox"
                        name="searchInput"
                />
                <Search size={20} className="text-gray-500 dark:text-slate-400"/>
            </div>


          <div className="flex items-center gap-2 mb-4">
            <input
              type="text"
              placeholder="Add a new todo..."
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              className="input flex-grow mr-2"
                role="textbox"
                name="newTodoInput"
            />
            <button onClick={addTodo} className="btn btn-primary" role="button" name="addTodoButton">
              <Plus size={20} />
            </button>
          </div>
          

          {filteredTodos.length === 0 ? (
            <p className="text-gray-500 dark:text-slate-400">No todos found.</p>
            ) : (
          <ul className="space-y-4">
            {filteredTodos.map((todo) => (
              <li key={todo.id} className="card-responsive flex items-center justify-between">
                {editTodo?.id === todo.id ? (
                  <>
                    <input
                      type="text"
                      value={editTodo.text}
                      onChange={(e) => setEditTodo({ ...editTodo, text: e.target.value })}
                      className="input flex-grow mr-2"
                        role="textbox"
                        name="editTodoInput"
                    />
                    <button onClick={updateTodo} className="btn btn-primary mr-2" role="button" name="updateTodoButton">
                      <Check size={20} />
                    </button>
                    <button onClick={() => setEditTodo(null)} className="btn btn-secondary" role="button" name="cancelEditButton">
                      <X size={20} />
                    </button>
                  </>
                ) : (
                  <>
                    <span
                      className={`flex-grow text-base sm:text-lg ${todo.completed ? 'line-through text-gray-500 dark:text-slate-400' : ''}`}
                    >
                      {todo.text}
                    </span>
                    <button
                      onClick={() => toggleComplete(todo.id)}
                      className={`btn ${todo.completed ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600'}`}
                        role="checkbox"
                        aria-checked={todo.completed}
                        name={`completeTodoButton-${todo.id}`}
                    >
                      {todo.completed ? <Check size={20}/> : <Check size={20} className='opacity-0' />}
                    </button>
                    <button onClick={() => startEditing(todo)} className="btn btn-primary mx-2" role="button" name={`editTodoButton-${todo.id}`}>
                      <Pencil size={20} />
                    </button>
                    <button onClick={() => deleteTodo(todo.id)} className="btn btn-error" role="button" name={`deleteTodoButton-${todo.id}`}>
                      <Trash2 size={20} />
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
            )}
        </div>
      </main>

      <footer className="container-fluid py-4 text-center text-gray-500 dark:text-slate-400">
        Copyright (c) 2025 of Datavtar Private Limited. All rights reserved.
      </footer>
    </div>
  );
};

export default App;
