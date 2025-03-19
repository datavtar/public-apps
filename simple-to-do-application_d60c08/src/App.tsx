import React, { useState, useEffect } from 'react';
import styles from './styles/styles.module.css';
import { Plus, Pencil, Trash2, X, Check, Search, ChevronUp, ChevronDown, Sun, Moon } from 'lucide-react';

interface Todo {
  id: string;
  task: string;
  completed: boolean;
  createdAt: number;
  dueDate?: string; // Optional due date
}

const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [taskInput, setTaskInput] = useState<string>('');
  const [dueDateInput, setDueDateInput] = useState<string>('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editTaskInput, setEditTaskInput] = useState<string>('');
  const [editDueDateInput, setEditDueDateInput] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filter, setFilter] = useState<string>('all'); // 'all', 'active', 'completed'
  const [sort, setSort] = useState<'asc' | 'desc'>('asc');
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
    if (taskInput.trim() !== '') {
      const newTodo: Todo = {
        id: Date.now().toString(),
        task: taskInput,
        completed: false,
        createdAt: Date.now(),
        dueDate: dueDateInput,
      };
      setTodos([...todos, newTodo]);
      setTaskInput('');
      setDueDateInput('');
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

  const startEdit = (id: string) => {
    const todoToEdit = todos.find((todo) => todo.id === id);
    if (todoToEdit) {
      setEditId(id);
      setEditTaskInput(todoToEdit.task);
      setEditDueDateInput(todoToEdit.dueDate || '');
    }
  };

  const saveEdit = () => {
    if (editTaskInput.trim() !== '') {
      setTodos(
        todos.map((todo) =>
          todo.id === editId
            ? { ...todo, task: editTaskInput, dueDate: editDueDateInput }
            : todo
        )
      );
      setEditId(null);
      setEditTaskInput('');
      setEditDueDateInput('');
    }
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditTaskInput('');
  };

  const filteredTodos = todos.filter((todo) => {
    const taskMatch = todo.task.toLowerCase().includes(searchQuery.toLowerCase());
    if (filter === 'active') {
      return taskMatch && !todo.completed;
    }
    if (filter === 'completed') {
      return taskMatch && todo.completed;
    }
    return taskMatch;
  });

  const sortedTodos = [...filteredTodos].sort((a, b) => {
    if (sort === 'asc') {
      return a.createdAt - b.createdAt;
    } else {
      return b.createdAt - a.createdAt;
    }
  });

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };


  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900 text-gray-900 dark:text-slate-100 theme-transition-all">
      <div className="container-fluid mx-auto px-4 py-8">
              <div className="flex justify-end mb-4">
                <button
                  onClick={toggleTheme}
                  className="theme-toggle p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
                  aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                  role="button"
                  name="themeToggle"
                >
                  {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
          </div>


      <h1 className="text-3xl font-bold text-center mb-8">Todo App</h1>
        <div className="card bg-white dark:bg-slate-800 shadow-md rounded-lg p-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <input
                type="text"
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                placeholder="Add a new task..."
                className="input flex-grow"
                role="textbox"
                name="taskInput"
              />
              <input
                type="date"
                value={dueDateInput}
                onChange={(e) => setDueDateInput(e.target.value)}
                placeholder="Due date"
                className="input w-full sm:w-auto"
                role="textbox"
                name="dueDateInput"
              />
              <button onClick={addTodo} className="btn btn-primary flex-shrink-0" role="button" name="addTodo">
                <Plus size={20} className='mr-1'/>Add
              </button>
            </div>


 <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative w-full sm:w-1/2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks..."
                className="input pr-10"  // Leave space for the search icon
                role="search"
                name="searchTasks"
              />
              <Search size={20} className="absolute top-3 right-3 text-gray-400" />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="input w-full sm:w-1/4"
              role="listbox"
              name="filterTasks"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
            <button
              onClick={() => setSort(sort === 'asc' ? 'desc' : 'asc')}
              className="btn bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 w-full sm:w-1/4"
              role="button"
              name="sortTasks"
            >
              Sort
              {sort === 'asc' ? (
                <ChevronUp size={20} className='ml-1' />
              ) : (
                <ChevronDown size={20} className='ml-1' />
              )}
            </button>
          </div>

          <div className="table-container">
            <table className="table w-full">
              <thead>
                <tr>
                    <th className="table-header">Task</th>
                    <th className="table-header">Due Date</th>
                    <th className="table-header">Status</th>
                    <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedTodos.map((todo) => (
                  <tr key={todo.id} className="border-b border-gray-200 dark:border-gray-700">
                    <td className="table-cell">
                      {editId === todo.id ? (
                        <input
                          type="text"
                          value={editTaskInput}
                          onChange={(e) => setEditTaskInput(e.target.value)}
                          className="input"
                          role="textbox"
                          name="editTaskInput"
                        />
                      ) : (
                        <span className={todo.completed ? 'line-through text-gray-500' : ''}>{todo.task}</span>
                      )}
                    </td>
                    <td className="table-cell">
                      {editId === todo.id ? (
                         <input
                         type="date"
                         value={editDueDateInput}
                         onChange={(e) => setEditDueDateInput(e.target.value)}
                         className="input w-full sm:w-auto"
                         role="textbox"
                         name="editDueDateInput"
                       />
                      ) : (
                        <span>{todo.dueDate}</span>
                      )}
                    </td>

                    <td className="table-cell">
                      <button
                        onClick={() => toggleComplete(todo.id)}
                        className={`badge ${todo.completed ? 'badge-success' : 'badge-warning'}`}
                        role="button"
                        name={`toggleComplete${todo.id}`}
                      >
                        {todo.completed ? 'Completed' : 'Active'}
                      </button>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        {editId === todo.id ? (
                          <>
                            <button onClick={saveEdit} className="btn btn-sm btn-success" role="button" name="saveEdit">
                              <Check size={16} />
                            </button>
                            <button onClick={cancelEdit} className="btn btn-sm btn-error" role="button" name="cancelEdit">
                              <X size={16} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => startEdit(todo.id)} className="btn btn-sm btn-primary" role="button" name="editTodo">
                              <Pencil size={16} />
                            </button>
                            <button onClick={() => deleteTodo(todo.id)} className="btn btn-sm btn-error" role="button" name="deleteTodo">
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
           </div>
      </div>

        <footer className="text-center text-gray-500 dark:text-slate-400 py-4 mt-8">
        Copyright (c) 2025 of Datavtar Private Limited. All rights reserved.
      </footer>

    </div>
  );
};

export default App;
