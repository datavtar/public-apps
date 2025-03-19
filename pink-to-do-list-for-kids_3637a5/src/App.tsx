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
 const [editingId, setEditingId] = useState<string | null>(null);
 const [editingText, setEditingText] = useState<string>('');
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
 const newId = Date.now().toString();
 setTodos([...todos, { id: newId, text: newTodo, completed: false }]);
 setNewTodo('');
 }
 };

 const toggleComplete = (id: string) => {
 setTodos(
 todos.map((todo) =>
 todo.id === id ? { ...todo, completed: !todo.completed } : todo
 )
 );
 };

 const startEditing = (id: string, text: string) => {
 setEditingId(id);
 setEditingText(text);
 };

 const saveEdit = (id: string) => {
 setTodos(
 todos.map((todo) => (todo.id === id ? { ...todo, text: editingText } : todo))
 );
 setEditingId(null);
 setEditingText('');
 };

 const cancelEdit = () => {
  setEditingId(null);
  setEditingText('');
 }

 const deleteTodo = (id: string) => {
 setTodos(todos.filter((todo) => todo.id !== id));
 };


 return (
 <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 theme-transition-all">

  <div className="flex justify-end p-4">
        <button
          className="theme-toggle p-2 rounded-full focus:outline-none"
          onClick={() => setIsDarkMode(!isDarkMode)}
          aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDarkMode ? (
            <span className="text-yellow-400">☀️</span>
            ) : (
             <span className="text-gray-300">🌙</span>
          )}
        </button>
      </div>

 <div className="container-narrow mx-auto px-4 py-8">
 <h1 className="text-3xl font-bold text-center text-pink-600 dark:text-pink-400 mb-6">My To-Do List</h1>

 <div className="flex flex-col sm:flex-row items-center gap-2 mb-4">
 <input
 type="text"
 value={newTodo}
 onChange={(e) => setNewTodo(e.target.value)}
 placeholder="Add a new todo..."
 className="input flex-grow"
 role="textbox"
 name="newTodoInput"
 />
 <button onClick={addTodo} className="btn btn-primary flex-shrink-0" role="button" name="addTodoButton">
  <PlusCircleIcon className='h-5 w-5'/>
 </button>
 </div>


 <div className="space-y-4">
 {todos.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No tasks yet. Add some!</p>
        ) : (
          todos.map((todo) => (
            <div
              key={todo.id}
              className={`card p-4 flex items-center justify-between rounded-lg shadow-md ${todo.completed ? 'bg-pink-200 dark:bg-pink-700' : 'bg-white dark:bg-gray-800'}`}
              role="listitem"
              name={`todoItem-${todo.id}`}
            >
             <div className="flex items-center flex-grow">
            <button
            onClick={() => toggleComplete(todo.id)}
                    className={`mr-4 rounded-full p-1 ${todo.completed
                      ? 'bg-green-500 text-white'
                      : 'border-2 border-gray-300 dark:border-gray-600'}
                    }
                    `}
                    role="checkbox"
                    aria-checked={todo.completed}
                    name={`completeCheckbox-${todo.id}`}
            >
              {todo.completed && <CheckIcon className="h-4 w-4" />}
              
             </button>


                {editingId === todo.id ? (
                 <div className='flex w-full items-center'>
                  <input
                    type="text"
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    className="input flex-grow mr-2"
                    role="textbox"
                    name={`editTodoInput-${todo.id}`}
                  />
                  
                  <button onClick={() => saveEdit(todo.id)} className="btn-sm bg-green-500 hover:bg-green-600 text-white p-1 mr-2 rounded" role="button" name={`saveEditButton-${todo.id}`}>
                    <CheckIcon className='h-4 w-4' />
                  </button>
                  <button onClick={() => cancelEdit()} className="btn-sm bg-red-500 hover:bg-red-600 text-white p-1 rounded" role="button" name={`cancelEditButton-${todo.id}`}>
                    <XIcon className='h-4 w-4'/>
                  </button>
                  </div>
                ) : (
                  <span
                    className={`${todo.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-gray-200'}`}
                  >
                    {todo.text}
                  </span>
                )}
                </div>


              <div className="flex">
                {editingId !== todo.id && (
                <button
                  onClick={() => startEditing(todo.id, todo.text)}
                  className="btn-sm bg-blue-500 hover:bg-blue-600 text-white p-1 mr-2 rounded"
                  role="button"
                  name={`editButton-${todo.id}`}
                >
                 <PencilIcon className='h-4 w-4'/>
                </button>
                )}
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="btn-sm bg-red-500 hover:bg-red-600 text-white p-1 rounded"
                  role="button"
                  name={`deleteButton-${todo.id}`}
                >
                  <TrashIcon className='h-4 w-4'/>
                </button>
              </div>
            </div>
          ))
        )}

      </div>
    </div>
      <footer className="text-center text-xs text-gray-500 dark:text-gray-400 py-4">
        Copyright (c) 2025 of Datavtar Private Limited. All rights reserved.
      </footer>
  </div>
 );
};

export default App;
