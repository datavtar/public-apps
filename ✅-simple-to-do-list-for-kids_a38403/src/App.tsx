import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { format, parseISO } from 'date-fns';
import { Plus, Trash2, Edit, Save, X, Filter, Search, Moon, Sun, Check, ChevronDown, ChevronUp } from 'lucide-react';
import styles from './styles/styles.module.css';

// Types
interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string; // Store as ISO string for easier sorting/storage
  priority: Priority;
  dueDate?: string; // Store as ISO string
}

type Priority = 'low' | 'medium' | 'high';

type FilterType = 'all' | 'active' | 'completed';

type SortByKey = 'createdAt' | 'dueDate' | 'priority' | 'text';
type SortOrder = 'asc' | 'desc';

interface SortOption {
  key: SortByKey;
  order: SortOrder;
}

interface FormData {
  text: string;
  priority: Priority;
  dueDate?: string;
}

// Utility Functions
const getPriorityValue = (priority: Priority): number => {
  switch (priority) {
    case 'high': return 3;
    case 'medium': return 2;
    case 'low': return 1;
    default: return 0;
  }
};

// Main App Component
function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortOption>({ key: 'createdAt', order: 'desc' });
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      return savedMode === 'true' || (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  // --- Effects ---
  // Load todos from localStorage on initial render
  useEffect(() => {
    const storedTodos = localStorage.getItem('todos');
    if (storedTodos) {
      try {
        setTodos(JSON.parse(storedTodos));
      } catch (error) {
        console.error("Failed to parse todos from localStorage:");
      }
    }
  }, []);

  // Save todos to localStorage whenever todos change
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  // Update document body class for dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [isDarkMode]);

  // --- Form Handling ---
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();

  const onSubmit: SubmitHandler<FormData> = (data) => {
    const newTodo: Todo = {
      id: Date.now().toString(),
      text: data.text,
      completed: false,
      createdAt: new Date().toISOString(),
      priority: data.priority,
      dueDate: data.dueDate ? data.dueDate : undefined,
    };
    setTodos([...todos, newTodo]);
    reset();
  };

  // --- Todo Operations ---
  const toggleComplete = (id: string) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const startEditing = (id: string) => {
    setEditingTodoId(id);
  };

  const saveEditedTodo = (id: string, newText: string, newPriority: Priority, newDueDate?: string) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, text: newText, priority: newPriority, dueDate: newDueDate } : todo
    ));
    setEditingTodoId(null);
  };

  // --- Filtering and Sorting ---
  const filteredTodos = useMemo(() => {
    let filtered = todos;

    if (filter === 'active') {
      filtered = filtered.filter(todo => !todo.completed);
    } else if (filter === 'completed') {
      filtered = filtered.filter(todo => todo.completed);
    }

    if (searchTerm) {
      filtered = filtered.filter(todo =>
        todo.text.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [todos, filter, searchTerm]);

  const sortedTodos = useMemo(() => {
    const sortKey = sortBy.key;
    const sortOrder = sortBy.order;

    const sorted = [...filteredTodos].sort((a, b) => {
      let comparison = 0;

      if (sortKey === 'priority') {
        comparison = getPriorityValue(a.priority) - getPriorityValue(b.priority);
      } else if (sortKey === 'dueDate') {
        const dateA = a.dueDate ? parseISO(a.dueDate).getTime() : -Infinity;  // Treat undefined as earliest
        const dateB = b.dueDate ? parseISO(b.dueDate).getTime() : -Infinity;
        comparison = dateA - dateB;
      } else if (sortKey === 'text') {
        comparison = a.text.localeCompare(b.text);
      } else {
        comparison = parseISO(a.createdAt).getTime() - parseISO(b.createdAt).getTime();
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [filteredTodos, sortBy]);

  // --- Handlers ---
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter(e.target.value as FilterType);
  };

  const handleSortChange = (key: SortByKey) => {
    setSortBy(prev => ({
      key: key,
      order: prev.key === key && prev.order === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  // --- Render ---
  return (
    <div className={`${styles.appContainer} ${isDarkMode ? styles.darkMode : ''}`}>
      <header className={styles.header}>
        <h1>Todo App</h1>
        <button onClick={toggleDarkMode} className={styles.darkModeButton}>
          {isDarkMode ? <Sun /> : <Moon />}
        </button>
      </header>

      <div className={styles.filterSortContainer}>
        <div className={styles.filterContainer}>
          <Filter className={styles.icon} />
          <select value={filter} onChange={handleFilterChange}>
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className={styles.searchContainer}>
          <Search className={styles.icon} />
          <input
            type="search"
            placeholder="Search todos..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        <div className={styles.sortContainer}>
          <span>Sort By:</span>
          <button onClick={() => handleSortChange('createdAt')}>Created At <ChevronDown /></button>
          <button onClick={() => handleSortChange('dueDate')}>Due Date <ChevronDown /></button>
          <button onClick={() => handleSortChange('priority')}>Priority <ChevronDown /></button>
          <button onClick={() => handleSortChange('text')}>Text <ChevronDown /></button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <input type="text" placeholder="Add a todo..." {...register('text', { required: true })} className={styles.input} />
        <select {...register('priority', { required: true })} className={styles.select}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <input type="date" {...register('dueDate')} className={styles.dateInput} />
        <button type="submit" className={styles.addButton}><Plus /></button>
      </form>

      {errors.text && <p className={styles.error}>This field is required</p>}

      <ul className={styles.todoList}>
        {sortedTodos.map(todo => (
          <li key={todo.id} className={`${styles.todoItem} ${todo.completed ? styles.completed : ''}`}>
            {editingTodoId === todo.id ? (
              <div className={styles.editingContainer}>
                <input
                  type="text"
                  defaultValue={todo.text}
                  onBlur={(e) => saveEditedTodo(todo.id, e.target.value, todo.priority, todo.dueDate)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      saveEditedTodo(todo.id, e.target.value, todo.priority, todo.dueDate);
                    }
                  }}
                />
                <select
                  defaultValue={todo.priority}
                  onChange={(e) => saveEditedTodo(todo.id, todo.text, e.target.value as Priority, todo.dueDate)}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <input
                  type="date"
                  defaultValue={todo.dueDate}
                  onBlur={(e) => saveEditedTodo(todo.id, todo.text, todo.priority, e.target.value)}
                />
                <button onClick={() => saveEditedTodo(todo.id, todo.text, todo.priority, todo.dueDate)}><Save /></button>
              </div>
            ) : (
              <>
                <input
                  type="checkbox"
                  id={`todo-${todo.id}`}
                  checked={todo.completed}
                  onChange={() => toggleComplete(todo.id)}
                />
                <label htmlFor={`todo-${todo.id}`} className={styles.todoText}>{todo.text}</label>
                <span className={styles.todoPriority}>({todo.priority})</span>
                {todo.dueDate && <span className={styles.todoDueDate}> (Due: {format(parseISO(todo.dueDate), 'MM/dd/yyyy')})</span>}
                <div className={styles.todoActions}>
                  <button onClick={() => startEditing(todo.id)}><Edit /></button>
                  <button onClick={() => deleteTodo(todo.id)}><Trash2 /></button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;