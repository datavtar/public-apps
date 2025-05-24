import React, { useState, useEffect, useRef, FormEvent, ChangeEvent, KeyboardEvent } from 'react';
import { Sun, Moon, Plus, Trash2, Edit3, Check, X, Search, Filter as FilterIcon, ListChecks, CalendarDays, SortAsc, SortDesc, Brain, FileText, UploadCloud, DownloadCloud, Info, Circle } from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';

// Import AILayer and its types (assuming they exist as per instructions)
import AILayer from './components/AILayer'; // Path is as per instructions
import { AILayerHandle } from './components/AILayer.types'; // Path is as per instructions

import styles from './styles/styles.module.css';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
  dueDate?: string;
}

type FilterType = 'all' | 'active' | 'completed';
type SortByType = 'createdAt' | 'dueDate' | 'text';
type SortDirectionType = 'asc' | 'desc';

const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoText, setNewTodoText] = useState<string>('');
  const [newTodoDueDate, setNewTodoDueDate] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortByType>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirectionType>('desc');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      return savedMode === 'true' || (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [editText, setEditText] = useState<string>('');
  const [editDueDate, setEditDueDate] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // AI Layer State
  const aiLayerRef = useRef<AILayerHandle>(null);
  const [aiPromptText, setAiPromptText] = useState<string>('');
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<any | null>(null);

  // Load todos from localStorage
  useEffect(() => {
    try {
      const storedTodos = localStorage.getItem('todos');
      if (storedTodos) {
        setTodos(JSON.parse(storedTodos));
      }
    } catch (e) {
      console.error('Failed to parse todos from localStorage:', e);
      setTodos([]); // Fallback to empty array on error
    }
  }, []);

  // Save todos to localStorage
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  // Dark mode effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  // Handle Escape key for edit modal
  useEffect(() => {
    const handleEsc = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        setEditingTodo(null);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);
  
  // Update newTodoText when AI result is available
  useEffect(() => {
    if (aiResult && !isAiLoading && !aiError) {
      setNewTodoText(aiResult);
      setAiResult(null); // Clear result after using it
    }
  }, [aiResult, isAiLoading, aiError]);

  const handleAddTodo = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newTodoText.trim()) {
      setError('Task description cannot be empty.');
      return;
    }
    setError(null);
    const newTodo: Todo = {
      id: Date.now().toString(),
      text: newTodoText.trim(),
      completed: false,
      createdAt: Date.now(),
      dueDate: newTodoDueDate || undefined,
    };
    setTodos([newTodo, ...todos]);
    setNewTodoText('');
    setNewTodoDueDate('');
  };

  const toggleTodo = (id: string) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const startEditTodo = (todo: Todo) => {
    setEditingTodo(todo);
    setEditText(todo.text);
    setEditDueDate(todo.dueDate || '');
    document.body.classList.add('modal-open');
  };

  const handleEditTodo = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editText.trim() || !editingTodo) return;
    setTodos(
      todos.map((todo) =>
        todo.id === editingTodo.id
          ? { ...todo, text: editText.trim(), dueDate: editDueDate || undefined }
          : todo
      )
    );
    setEditingTodo(null);
    document.body.classList.remove('modal-open');
  };

  const cancelEdit = () => {
    setEditingTodo(null);
    document.body.classList.remove('modal-open');
  };

  const filteredAndSortedTodos = todos
    .filter((todo) => {
      const matchesSearch = todo.text.toLowerCase().includes(searchTerm.toLowerCase());
      if (filter === 'active') return !todo.completed && matchesSearch;
      if (filter === 'completed') return todo.completed && matchesSearch;
      return matchesSearch;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'text':
          comparison = a.text.localeCompare(b.text);
          break;
        case 'dueDate':
          if (a.dueDate && b.dueDate) comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          else if (a.dueDate) comparison = -1; // Tasks with due dates first
          else if (b.dueDate) comparison = 1;
          break;
        case 'createdAt':
        default:
          comparison = a.createdAt - b.createdAt;
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  const handleGetAITaskIdea = () => {
    setAiPromptText("Suggest a common daily task for a to-do list. Respond with only the task name, be concise and under 10 words.");
    setAiResult(null);
    setAiError(null);
    // setIsLoading(true); // Optimistic, but AILayer's onLoading is primary
    aiLayerRef.current?.sendToAI();
  };
  
  const exportTodosToCSV = () => {
    const header = ['ID', 'Task', 'Completed', 'Created At', 'Due Date'];
    const rows = todos.map(todo => [
      todo.id,
      `"${todo.text.replace(/"/g, '""')}"`, // Escape quotes
      todo.completed,
      format(new Date(todo.createdAt), 'yyyy-MM-dd HH:mm:ss'),
      todo.dueDate ? format(parseISO(todo.dueDate), 'yyyy-MM-dd') : ''
    ].join(','));

    const csvContent = "data:text/csv;charset=utf-8," + [header.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "todos_export.csv");
    document.body.appendChild(link); 
    link.click();
    document.body.removeChild(link);
  };
  
  const importTodosFromCSV = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) return;
      try {
        const lines = text.split('\n');
        const header = lines[0].split(','); // Assuming ID,Task,Completed,Created At,Due Date
        const importedTodos: Todo[] = [];
        for (let i = 1; i < lines.length; i++) {
          const cells = lines[i].match(/("(?:[^"]|"")*"|[^,]*)(?:,|$)/g);
          if (cells && cells.length >= 4) { // Minimum expected columns
            const id = cells[0].replace(/,$/, '').trim();
            const taskText = cells[1].replace(/,$/, '').trim().replace(/^"|"$/g, '').replace(/""/g, '"');
            const completed = cells[2].replace(/,$/, '').trim().toLowerCase() === 'true';
            const createdAtStr = cells[3].replace(/,$/, '').trim();
            // DueDate might be optional or last, handle carefully
            const dueDateStr = cells[4]?.replace(/,$/, '').trim();
            
            const createdAt = new Date(createdAtStr).getTime();
            if (!taskText || !id || isNaN(createdAt)) continue; // Skip invalid rows

            const todo: Todo = {
              id: id || `imported-${Date.now()}-${i}`, // fallback id
              text: taskText,
              completed: completed,
              createdAt: createdAt,
              dueDate: dueDateStr && isValid(parseISO(dueDateStr)) ? dueDateStr : undefined,
            };
            importedTodos.push(todo);
          }
        }
        // Simple merge: add imported, avoid duplicates by ID if complex logic needed
        // For now, just add non-existing IDs
        const existingIds = new Set(todos.map(t => t.id));
        const newUniqueTodos = importedTodos.filter(it => !existingIds.has(it.id));
        setTodos(prevTodos => [...prevTodos, ...newUniqueTodos]);
        alert(`${newUniqueTodos.length} new tasks imported successfully!`);
      } catch (err) {
        console.error("Error importing CSV:", err);
        alert("Failed to import tasks. Please check file format.");
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset file input
  };

  const downloadCSVTemplate = () => {
    const header = ['ID', 'Task', 'Completed', 'Created At', 'Due Date'];
    const exampleRow = [
      'task-001',
      '"Sample task description, with comma"',
      'false',
      format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
      format(new Date(), 'yyyy-MM-dd')
    ].join(',');
    const csvContent = "data:text/csv;charset=utf-8," + [header.join(','), exampleRow].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "todos_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`min-h-screen flex flex-col theme-transition-all ${styles.appBackground}`}>
      {/* AI Layer Component (Headless) */}
      <AILayer
        ref={aiLayerRef}
        prompt={aiPromptText}
        onResult={(res) => setAiResult(res)}
        onError={(err) => setAiError(err)}
        onLoading={(loading) => setIsAiLoading(loading)}
      />

      <header id="app-header" className="p-4 sm:p-6 bg-primary-600 dark:bg-slate-800 text-white shadow-md no-print">
        <div className="container-narrow flex-between">
          <div className='flex items-center gap-2'>
            <ListChecks size={32} />
            <h1 className="text-2xl sm:text-3xl font-bold">My To-Do App</h1>
          </div>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-full hover:bg-primary-700 dark:hover:bg-slate-700 transition-colors"
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            id="theme-toggle-button"
          >
            {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
          </button>
        </div>
      </header>

      <main className="flex-grow container-narrow py-6 sm:py-8 px-4">
        <form onSubmit={handleAddTodo} className="card card-responsive mb-6 sm:mb-8" id="add-todo-form">
          <h2 className="text-xl font-semibold mb-4">Add New Task</h2>
          {error && <div className="alert alert-error mb-4"><Info size={18} className="mr-1"/>{error}</div>}
          <div className="form-group">
            <label htmlFor="newTodoText" className="form-label">Task Description</label>
            <input
              id="newTodoText"
              name="newTodoText"
              type="text"
              className="input input-responsive"
              value={newTodoText}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setNewTodoText(e.target.value)}
              placeholder="What needs to be done?"
            />
          </div>
          <div className="form-group">
            <label htmlFor="newTodoDueDate" className="form-label">Due Date (Optional)</label>
            <input
              id="newTodoDueDate"
              name="newTodoDueDate"
              type="date"
              className="input input-responsive"
              value={newTodoDueDate}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setNewTodoDueDate(e.target.value)}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            <button type="submit" className="btn btn-primary btn-responsive flex-grow flex-center gap-2" id="add-todo-button">
              <Plus size={18} /> Add Task
            </button>
            <button 
              type="button" 
              onClick={handleGetAITaskIdea} 
              className={`btn btn-secondary btn-responsive flex-grow flex-center gap-2 ${isAiLoading ? styles.buttonLoading : ''}`}
              disabled={isAiLoading}
              id="ai-idea-button"
            >
              <Brain size={18} /> {isAiLoading ? 'Getting Idea...' : 'AI Task Idea'}
            </button>
          </div>
          {aiError && <p className="form-error mt-2">AI Error: {typeof aiError === 'string' ? aiError : JSON.stringify(aiError)}</p>}
        </form>

        <div className="card card-responsive mb-6 sm:mb-8" id="task-controls">
          <h2 className="text-xl font-semibold mb-4">Manage Tasks</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="form-group">
              <label htmlFor="searchTerm" className="form-label">Search Tasks</label>
              <div className="relative">
                <input
                  id="searchTerm"
                  name="searchTerm"
                  type="text"
                  className="input input-responsive pl-10"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                />
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="filter" className="form-label">Filter Tasks</label>
              <div className="relative">
                <select
                  id="filter"
                  name="filter"
                  className="input input-responsive appearance-none pr-10"
                  value={filter}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => setFilter(e.target.value as FilterType)}
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
                <FilterIcon size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Sort Tasks</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 items-center">
              <select
                id="sortBy"
                name="sortBy"
                className="input input-responsive appearance-none pr-10"
                value={sortBy}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setSortBy(e.target.value as SortByType)}
              >
                <option value="createdAt">Creation Date</option>
                <option value="dueDate">Due Date</option>
                <option value="text">Alphabetical</option>
              </select>
              <select
                id="sortDirection"
                name="sortDirection"
                className="input input-responsive appearance-none pr-10"
                value={sortDirection}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setSortDirection(e.target.value as SortDirectionType)}
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
              {(sortDirection === 'asc' ? <SortAsc size={20} className="mx-auto text-gray-600 dark:text-gray-400" /> : <SortDesc size={20} className="mx-auto text-gray-600 dark:text-gray-400" />)}
            </div>
          </div>

          <div className="mt-6 border-t pt-4 flex flex-col sm:flex-row gap-2">
            <button onClick={exportTodosToCSV} className="btn bg-green-500 hover:bg-green-600 text-white btn-responsive flex-grow flex-center gap-2">
              <DownloadCloud size={18} /> Export CSV
            </button>
            <label htmlFor="csvImport" className="btn bg-blue-500 hover:bg-blue-600 text-white btn-responsive flex-grow flex-center gap-2 cursor-pointer">
              <UploadCloud size={18} /> Import CSV
            </label>
            <input type="file" id="csvImport" accept=".csv" onChange={importTodosFromCSV} className="hidden" />
            <button onClick={downloadCSVTemplate} className="btn bg-gray-500 hover:bg-gray-600 text-white btn-responsive flex-grow flex-center gap-2">
              <FileText size={18} /> CSV Template
            </button>
          </div>
        </div>

        {filteredAndSortedTodos.length === 0 && todos.length > 0 && (
          <div className="card card-responsive text-center text-gray-500 dark:text-gray-400">
            No tasks match your current filter or search.
          </div>
        )}
        {todos.length === 0 && (
           <div className="card card-responsive text-center text-gray-500 dark:text-gray-400" id="empty-tasks-message">
            Your to-do list is empty! Add some tasks above.
          </div>
        )}

        <ul className="space-y-3" id="todo-list">
          {filteredAndSortedTodos.map((todo, index) => (
            <li
              key={todo.id}
              id={`todo-item-${todo.id}`}
              className={`card card-sm flex items-center justify-between transition-all duration-300 ${todo.completed ? 'bg-green-50 dark:bg-green-900 opacity-70' : 'bg-white dark:bg-slate-800'} ${styles.todoItemAnimation}`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center flex-grow min-w-0">
                <button 
                  onClick={() => toggleTodo(todo.id)} 
                  className={`mr-3 p-1 rounded-full focus:outline-none focus:ring-2 ${todo.completed ? 'text-green-600 dark:text-green-400 focus:ring-green-500' : 'text-gray-400 dark:text-gray-500 hover:text-primary-500 focus:ring-primary-500'}`}
                  aria-label={todo.completed ? 'Mark as incomplete' : 'Mark as complete'}
                  role="checkbox"
                  aria-checked={todo.completed}
                >
                  {todo.completed ? <Check size={22}/> : <Circle size={22} className="text-gray-300 dark:text-gray-600"/>}
                </button>
                <div className="flex-grow min-w-0">
                  <p className={`text-sm sm:text-base font-medium truncate ${todo.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-gray-100'}`}>{todo.text}</p>
                  <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-1">
                    <CalendarDays size={14}/>
                    <span>Created: {format(new Date(todo.createdAt), 'MMM d, yyyy')}</span>
                    {todo.dueDate && (
                       <span className={`${new Date(todo.dueDate) < new Date() && !todo.completed ? 'text-red-500 font-semibold' : ''}`}>
                         Due: {format(parseISO(todo.dueDate), 'MMM d, yyyy')}
                       </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0 flex items-center gap-1 sm:gap-2 ml-2">
                <button
                  onClick={() => startEditTodo(todo)}
                  className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label={`Edit task: ${todo.text}`}
                  id={`edit-button-${todo.id}`}
                >
                  <Edit3 size={18} />
                </button>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  aria-label={`Delete task: ${todo.text}`}
                  id={`delete-button-${todo.id}`}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </main>

      {editingTodo && (
        <div 
          className="modal-backdrop theme-transition-bg" 
          onClick={cancelEdit} 
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-modal-title"
          id="edit-todo-modal"
        >
          <div className="modal-content theme-transition-all" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleEditTodo}>
              <div className="modal-header">
                <h3 id="edit-modal-title" className="text-lg font-medium text-gray-900 dark:text-white">Edit Task</h3>
                <button type="button" onClick={cancelEdit} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" aria-label="Close modal">
                  <X size={24} />
                </button>
              </div>
              <div className="mt-4 space-y-4">
                <div className="form-group">
                  <label htmlFor="editText" className="form-label">Task Description</label>
                  <input
                    id="editText"
                    name="editText"
                    type="text"
                    className="input"
                    value={editText}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setEditText(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="editDueDate" className="form-label">Due Date (Optional)</label>
                  <input
                    id="editDueDate"
                    name="editDueDate"
                    type="date"
                    className="input"
                    value={editDueDate}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setEditDueDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={cancelEdit} className="btn bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <footer id="app-footer" className="text-center p-4 text-sm text-gray-600 dark:text-gray-400 border-t dark:border-slate-700 no-print theme-transition-bg">
        Copyright © {new Date().getFullYear()} Datavtar Private Limited. All rights reserved.
      </footer>
    </div>
  );
};

export default App;
