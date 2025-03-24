import React, { useState, useEffect } from 'react';
import { BookOpen, Clock, Calendar, CheckCircle, Star, Edit, Trash2, Moon, Sun, Plus, X } from 'lucide-react';
import styles from './styles/styles.module.css';

// Define TypeScript interfaces
interface Subject {
 id: string;
 name: string;
 icon: JSX.Element;
 color: string;
}

interface Task {
 id: string;
 title: string;
 subject: string;
 description: string;
 duration: number;
 completed: boolean;
 day: string;
 priority: 'high' | 'medium' | 'low';
}

interface DaySchedule {
 day: string;
 tasks: Task[];
}

const App: React.FC = () => {
 const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
 const savedMode = localStorage.getItem('darkMode');
 return savedMode === 'true' || 
 (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
 });

 const [subjects, setSubjects] = useState<Subject[]>([
 { id: '1', name: 'Math', icon: <Star size={18} />, color: 'bg-blue-500' },
 { id: '2', name: 'Science', icon: <BookOpen size={18} />, color: 'bg-green-500' },
 { id: '3', name: 'Language', icon: <BookOpen size={18} />, color: 'bg-purple-500' },
 { id: '4', name: 'Arts', icon: <Star size={18} />, color: 'bg-pink-500' },
 ]);

 const [weekSchedule, setWeekSchedule] = useState<DaySchedule[]>([
 { day: 'Monday', tasks: [] },
 { day: 'Tuesday', tasks: [] },
 { day: 'Wednesday', tasks: [] },
 { day: 'Thursday', tasks: [] },
 { day: 'Friday', tasks: [] },
 ]);

 const [newTask, setNewTask] = useState<Omit<Task, 'id'>>({ 
 title: '', 
 subject: '', 
 description: '', 
 duration: 30, 
 completed: false,
 day: 'Monday',
 priority: 'medium'
 });

 const [isAddingTask, setIsAddingTask] = useState<boolean>(false);
 const [isEditingTask, setIsEditingTask] = useState<boolean>(false);
 const [editingTaskId, setEditingTaskId] = useState<string>("");
 const [isAddingSubject, setIsAddingSubject] = useState<boolean>(false);
 const [newSubject, setNewSubject] = useState<{name: string, color: string}>({ name: '', color: 'bg-blue-500' });
 const [selectedDay, setSelectedDay] = useState<string>('Monday');
 
 // Available colors for subjects
 const colorOptions = [
 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 
 'bg-yellow-500', 'bg-red-500', 'bg-indigo-500', 'bg-teal-500'
 ];

 useEffect(() => {
 // Apply dark mode class to document
 if (isDarkMode) {
 document.documentElement.classList.add('dark');
 localStorage.setItem('darkMode', 'true');
 } else {
 document.documentElement.classList.remove('dark');
 localStorage.setItem('darkMode', 'false');
 }
 }, [isDarkMode]);

 // Handle adding a new task
 const handleAddTask = () => {
 if (!newTask.title || !newTask.subject) return;

 const updatedSchedule = [...weekSchedule];
 const dayIndex = updatedSchedule.findIndex(day => day.day === newTask.day);
 
 if (dayIndex !== -1) {
 const taskId = Math.random().toString(36).substr(2, 9);
 
 updatedSchedule[dayIndex].tasks.push({
 ...newTask,
 id: taskId,
 });
 
 setWeekSchedule(updatedSchedule);
 setNewTask({ 
 title: '', 
 subject: '', 
 description: '', 
 duration: 30, 
 completed: false,
 day: selectedDay,
 priority: 'medium'
 });
 setIsAddingTask(false);
 }
 };

 // Handle editing a task
 const handleEditTask = () => {
 if (!newTask.title || !newTask.subject) return;

 const updatedSchedule = [...weekSchedule];
 const dayIndex = updatedSchedule.findIndex(day => day.day === newTask.day);
 
 if (dayIndex !== -1) {
 const taskIndex = updatedSchedule[dayIndex].tasks.findIndex(task => task.id === editingTaskId);
 
 if (taskIndex !== -1) {
 updatedSchedule[dayIndex].tasks[taskIndex] = {
 ...newTask,
 id: editingTaskId,
 };
 
 setWeekSchedule(updatedSchedule);
 setNewTask({ 
 title: '', 
 subject: '', 
 description: '', 
 duration: 30, 
 completed: false,
 day: selectedDay,
 priority: 'medium'
 });
 setIsEditingTask(false);
 setEditingTaskId("");
 }
 }
 };

 // Handle task completion toggle
 const toggleTaskCompletion = (dayName: string, taskId: string) => {
 const updatedSchedule = [...weekSchedule];
 const dayIndex = updatedSchedule.findIndex(day => day.day === dayName);
 
 if (dayIndex !== -1) {
 const taskIndex = updatedSchedule[dayIndex].tasks.findIndex(task => task.id === taskId);
 
 if (taskIndex !== -1) {
 updatedSchedule[dayIndex].tasks[taskIndex].completed = !updatedSchedule[dayIndex].tasks[taskIndex].completed;
 setWeekSchedule(updatedSchedule);
 }
 }
 };

 // Handle task deletion
 const deleteTask = (dayName: string, taskId: string) => {
 const updatedSchedule = [...weekSchedule];
 const dayIndex = updatedSchedule.findIndex(day => day.day === dayName);
 
 if (dayIndex !== -1) {
 updatedSchedule[dayIndex].tasks = updatedSchedule[dayIndex].tasks.filter(task => task.id !== taskId);
 setWeekSchedule(updatedSchedule);
 }
 };

 // Handle starting task edit
 const startEditTask = (task: Task) => {
 setNewTask({
 title: task.title,
 subject: task.subject,
 description: task.description,
 duration: task.duration,
 completed: task.completed,
 day: task.day,
 priority: task.priority
 });
 setEditingTaskId(task.id);
 setIsEditingTask(true);
 };

 // Handle adding a new subject
 const handleAddSubject = () => {
 if (!newSubject.name) return;
 
 const subjectId = Math.random().toString(36).substr(2, 9);
 
 setSubjects([
 ...subjects,
 { 
 id: subjectId, 
 name: newSubject.name, 
 icon: <BookOpen size={18} />, 
 color: newSubject.color 
 }
 ]);
 
 setNewSubject({ name: '', color: 'bg-blue-500' });
 setIsAddingSubject(false);
 };

 // Get subject color by name
 const getSubjectColor = (subjectName: string): string => {
 const subject = subjects.find(s => s.name === subjectName);
 return subject ? subject.color : 'bg-gray-500';
 };

 // Get priority badge classes
 const getPriorityBadgeClasses = (priority: 'high' | 'medium' | 'low'): string => {
 switch (priority) {
 case 'high': return 'badge badge-error';
 case 'medium': return 'badge badge-warning';
 case 'low': return 'badge badge-success';
 default: return 'badge badge-info';
 }
 };

 // Format priority label
 const formatPriority = (priority: string): string => {
 return priority.charAt(0).toUpperCase() + priority.slice(1);
 };

 return (
 <div className="min-h-screen bg-gray-50 dark:bg-slate-900 theme-transition-all">
 {/* Header */}
 <header className="bg-white dark:bg-slate-800 shadow theme-transition">
 <div className="container-fluid py-4 px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center">
 <div className="flex items-center mb-4 sm:mb-0">
 <BookOpen className="h-8 w-8 text-primary-500 mr-2" />
 <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My IB Study Planner</h1>
 </div>
 
 <div className="flex items-center space-x-4">
 <button 
 className="btn btn-primary flex items-center"
 onClick={() => setIsAddingTask(true)}
 role="button"
 name="add-task"
 >
 <Plus size={16} className="mr-1" /> Add Task
 </button>
 
 <button 
 className="theme-toggle flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-slate-700"
 onClick={() => setIsDarkMode(!isDarkMode)}
 aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
 role="button"
 name="theme-toggle"
 >
 {isDarkMode ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-slate-700" />}
 </button>
 </div>
 </div>
 </header>

 <main className="container-fluid py-6 px-4 sm:px-6">
 {/* Subject bar */}
 <section className="mb-8">
 <div className="flex items-center justify-between mb-4">
 <h2 className="text-xl font-bold text-gray-900 dark:text-white">My Subjects</h2>
 <button 
 className="btn bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-white hover:bg-gray-200 dark:hover:bg-slate-600 flex items-center"
 onClick={() => setIsAddingSubject(true)}
 role="button"
 name="add-subject"
 >
 <Plus size={16} className="mr-1" /> Add Subject
 </button>
 </div>
 
 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
 {subjects.map(subject => (
 <div 
 key={subject.id} 
 className={`card p-3 flex items-center ${subject.color} text-white rounded-lg shadow-sm hover:shadow transition-shadow cursor-pointer`}
 role="button"
 name={`subject-${subject.name.toLowerCase()}`}
 >
 <div className="p-2 bg-white bg-opacity-20 rounded-full mr-2">
 {subject.icon}
 </div>
 <span className="font-medium">{subject.name}</span>
 </div>
 ))}
 </div>
 </section>

 {/* Week schedule tabs */}
 <section className="bg-white dark:bg-slate-800 rounded-lg shadow mb-6 overflow-hidden theme-transition">
 <div className="flex overflow-x-auto scrollbar-hide border-b border-gray-200 dark:border-slate-700">
 {weekSchedule.map((day) => (
 <button
 key={day.day}
 className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${selectedDay === day.day ? 'text-primary-500 border-b-2 border-primary-500' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
 onClick={() => setSelectedDay(day.day)}
 role="tab"
 name={`day-tab-${day.day.toLowerCase()}`}
 >
 {day.day}
 </button>
 ))}
 </div>

 {/* Day's tasks */}
 <div className="p-4 sm:p-6">
 {weekSchedule.find(day => day.day === selectedDay)?.tasks.length === 0 ? (
 <div className="text-center py-8">
 <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-slate-700 mb-4">
 <Calendar className="h-8 w-8 text-gray-400 dark:text-slate-400" />
 </div>
 <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No tasks for {selectedDay}</h3>
 <p className="text-gray-500 dark:text-slate-400 mb-4">Add tasks to your study schedule for this day.</p>
 <button 
 className="btn btn-primary" 
 onClick={() => {
 setNewTask(prev => ({ ...prev, day: selectedDay }));
 setIsAddingTask(true);
 }}
 role="button"
 name="add-first-task"
 >
 <Plus size={16} className="mr-1" /> Add Task
 </button>
 </div>
 ) : (
 <div className="space-y-4">
 {weekSchedule
 .find(day => day.day === selectedDay)?.tasks
 .sort((a, b) => {
 if (a.completed === b.completed) return 0;
 return a.completed ? 1 : -1;
 })
 .map(task => (
 <div 
 key={task.id} 
 className={`card p-4 border ${task.completed ? 'bg-gray-50 dark:bg-slate-800' : 'bg-white dark:bg-slate-800'} ${styles.taskCard} theme-transition`}
 role="listitem"
 name={`task-${task.id}`}
 >
 <div className="flex items-start justify-between">
 <div className="flex items-start">
 <button 
 className={`flex-shrink-0 w-5 h-5 mr-3 mt-1 rounded-full border ${task.completed ? 'bg-primary-500 border-primary-500' : 'border-gray-300 dark:border-slate-600'} flex items-center justify-center`}
 onClick={() => toggleTaskCompletion(selectedDay, task.id)}
 aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
 role="checkbox"
 aria-checked={task.completed}
 name={`complete-task-${task.id}`}
 >
 {task.completed && <CheckCircle size={14} className="text-white" />}
 </button>
 
 <div className="flex-grow">
 <div className="flex items-center mb-1">
 <span className={`inline-block w-3 h-3 rounded-full ${getSubjectColor(task.subject)} mr-2`}></span>
 <span className="text-xs text-gray-500 dark:text-slate-400">{task.subject}</span>
 <span className={`ml-2 ${getPriorityBadgeClasses(task.priority)}`}>{formatPriority(task.priority)}</span>
 </div>
 
 <h3 className={`text-base font-medium ${task.completed ? 'text-gray-500 dark:text-slate-400 line-through' : 'text-gray-900 dark:text-white'}`}>
 {task.title}
 </h3>
 
 {task.description && (
 <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{task.description}</p>
 )}
 
 <div className="flex items-center mt-2 text-sm text-gray-500 dark:text-slate-400">
 <Clock size={14} className="mr-1" />
 <span>{task.duration} minutes</span>
 </div>
 </div>
 </div>
 
 <div className="flex space-x-2">
 <button 
 className="p-1 text-gray-400 hover:text-gray-500 dark:hover:text-slate-300"
 onClick={() => startEditTask(task)}
 aria-label="Edit task"
 role="button"
 name={`edit-task-${task.id}`}
 >
 <Edit size={16} />
 </button>
 <button 
 className="p-1 text-gray-400 hover:text-red-500"
 onClick={() => deleteTask(selectedDay, task.id)}
 aria-label="Delete task"
 role="button"
 name={`delete-task-${task.id}`}
 >
 <Trash2 size={16} />
 </button>
 </div>
 </div>
 </div>
 ))
 }
 </div>
 )}
 </div>
 </section>

 {/* Progress Card */}
 <section className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 sm:p-6 theme-transition">
 <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">My Progress</h2>
 
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 {weekSchedule.map(day => {
 const totalTasks = day.tasks.length;
 const completedTasks = day.tasks.filter(t => t.completed).length;
 const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
 
 return (
 <div 
 key={day.day} 
 className="stat-card p-4 border border-gray-200 dark:border-slate-700 rounded-lg theme-transition"
 role="status"
 name={`progress-${day.day.toLowerCase()}`}
 >
 <div className="stat-title text-sm font-medium text-gray-500 dark:text-slate-400">{day.day}</div>
 <div className="stat-value text-xl font-bold mt-1 text-gray-900 dark:text-white">
 {completedTasks} / {totalTasks} tasks
 </div>
 <div className="mt-2 w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2.5">
 <div 
 className="bg-primary-500 h-2.5 rounded-full" 
 style={{ width: `${progress}%` }}
 ></div>
 </div>
 </div>
 );
 })}
 </div>
 </section>
 </main>

 {/* Add Task Modal */}
 {isAddingTask && (
 <div className="modal-backdrop fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 dark:bg-opacity-70">
 <div className="modal-content bg-white dark:bg-slate-800 rounded-lg shadow-lg w-full max-w-lg mx-4 theme-transition">
 <div className="modal-header p-4 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
 <h3 className="text-lg font-bold text-gray-900 dark:text-white">Add New Task</h3>
 <button 
 className="text-gray-400 hover:text-gray-500 dark:hover:text-slate-300"
 onClick={() => setIsAddingTask(false)}
 aria-label="Close modal"
 role="button"
 name="close-add-task-modal"
 >
 <X size={20} />
 </button>
 </div>
 
 <div className="p-4">
 <div className="space-y-4">
 <div className="form-group">
 <label className="form-label" htmlFor="task-title">Task Title</label>
 <input 
 id="task-title" 
 type="text" 
 className="input w-full" 
 value={newTask.title}
 onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
 placeholder="Math homework"
 role="textbox"
 name="task-title-input"
 />
 </div>
 
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div className="form-group">
 <label className="form-label" htmlFor="task-subject">Subject</label>
 <select 
 id="task-subject" 
 className="input w-full" 
 value={newTask.subject}
 onChange={(e) => setNewTask({ ...newTask, subject: e.target.value })}
 role="combobox"
 name="task-subject-select"
 >
 <option value="">Select a subject</option>
 {subjects.map(subject => (
 <option key={subject.id} value={subject.name}>{subject.name}</option>
 ))}
 </select>
 </div>
 
 <div className="form-group">
 <label className="form-label" htmlFor="task-day">Day</label>
 <select 
 id="task-day" 
 className="input w-full" 
 value={newTask.day}
 onChange={(e) => setNewTask({ ...newTask, day: e.target.value })}
 role="combobox"
 name="task-day-select"
 >
 {weekSchedule.map(day => (
 <option key={day.day} value={day.day}>{day.day}</option>
 ))}
 </select>
 </div>
 </div>
 
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div className="form-group">
 <label className="form-label" htmlFor="task-duration">Study Time (minutes)</label>
 <input 
 id="task-duration" 
 type="number" 
 min="5"
 max="120"
 step="5"
 className="input w-full" 
 value={newTask.duration}
 onChange={(e) => setNewTask({ ...newTask, duration: parseInt(e.target.value) || 30 })}
 role="spinbutton"
 name="task-duration-input"
 />
 </div>
 
 <div className="form-group">
 <label className="form-label" htmlFor="task-priority">Priority</label>
 <select 
 id="task-priority" 
 className="input w-full" 
 value={newTask.priority}
 onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as 'high' | 'medium' | 'low' })}
 role="combobox"
 name="task-priority-select"
 >
 <option value="low">Low</option>
 <option value="medium">Medium</option>
 <option value="high">High</option>
 </select>
 </div>
 </div>
 
 <div className="form-group">
 <label className="form-label" htmlFor="task-description">Description (optional)</label>
 <textarea 
 id="task-description" 
 className="input w-full" 
 rows={3}
 value={newTask.description}
 onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
 placeholder="What do I need to study?"
 role="textbox"
 name="task-description-input"
 ></textarea>
 </div>
 </div>
 </div>
 
 <div className="modal-footer p-4 border-t border-gray-200 dark:border-slate-700 flex justify-end space-x-2">
 <button 
 className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600" 
 onClick={() => setIsAddingTask(false)}
 role="button"
 name="cancel-add-task-button"
 >
 Cancel
 </button>
 <button 
 className="btn btn-primary" 
 onClick={handleAddTask}
 role="button"
 name="confirm-add-task-button"
 >
 Add Task
 </button>
 </div>
 </div>
 </div>
 )}

 {/* Edit Task Modal */}
 {isEditingTask && (
 <div className="modal-backdrop fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 dark:bg-opacity-70">
 <div className="modal-content bg-white dark:bg-slate-800 rounded-lg shadow-lg w-full max-w-lg mx-4 theme-transition">
 <div className="modal-header p-4 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
 <h3 className="text-lg font-bold text-gray-900 dark:text-white">Edit Task</h3>
 <button 
 className="text-gray-400 hover:text-gray-500 dark:hover:text-slate-300"
 onClick={() => {
 setIsEditingTask(false);
 setEditingTaskId("");
 setNewTask({ 
 title: '', 
 subject: '', 
 description: '', 
 duration: 30, 
 completed: false,
 day: selectedDay,
 priority: 'medium'
 });
 }}
 aria-label="Close modal"
 role="button"
 name="close-edit-task-modal"
 >
 <X size={20} />
 </button>
 </div>
 
 <div className="p-4">
 <div className="space-y-4">
 <div className="form-group">
 <label className="form-label" htmlFor="edit-task-title">Task Title</label>
 <input 
 id="edit-task-title" 
 type="text" 
 className="input w-full" 
 value={newTask.title}
 onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
 role="textbox"
 name="edit-task-title-input"
 />
 </div>
 
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div className="form-group">
 <label className="form-label" htmlFor="edit-task-subject">Subject</label>
 <select 
 id="edit-task-subject" 
 className="input w-full" 
 value={newTask.subject}
 onChange={(e) => setNewTask({ ...newTask, subject: e.target.value })}
 role="combobox"
 name="edit-task-subject-select"
 >
 <option value="">Select a subject</option>
 {subjects.map(subject => (
 <option key={subject.id} value={subject.name}>{subject.name}</option>
 ))}
 </select>
 </div>
 
 <div className="form-group">
 <label className="form-label" htmlFor="edit-task-day">Day</label>
 <select 
 id="edit-task-day" 
 className="input w-full" 
 value={newTask.day}
 onChange={(e) => setNewTask({ ...newTask, day: e.target.value })}
 role="combobox"
 name="edit-task-day-select"
 >
 {weekSchedule.map(day => (
 <option key={day.day} value={day.day}>{day.day}</option>
 ))}
 </select>
 </div>
 </div>
 
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div className="form-group">
 <label className="form-label" htmlFor="edit-task-duration">Study Time (minutes)</label>
 <input 
 id="edit-task-duration" 
 type="number" 
 min="5"
 max="120"
 step="5"
 className="input w-full" 
 value={newTask.duration}
 onChange={(e) => setNewTask({ ...newTask, duration: parseInt(e.target.value) || 30 })}
 role="spinbutton"
 name="edit-task-duration-input"
 />
 </div>
 
 <div className="form-group">
 <label className="form-label" htmlFor="edit-task-priority">Priority</label>
 <select 
 id="edit-task-priority" 
 className="input w-full" 
 value={newTask.priority}
 onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as 'high' | 'medium' | 'low' })}
 role="combobox"
 name="edit-task-priority-select"
 >
 <option value="low">Low</option>
 <option value="medium">Medium</option>
 <option value="high">High</option>
 </select>
 </div>
 </div>
 
 <div className="form-group">
 <label className="form-label" htmlFor="edit-task-description">Description (optional)</label>
 <textarea 
 id="edit-task-description" 
 className="input w-full" 
 rows={3}
 value={newTask.description}
 onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
 role="textbox"
 name="edit-task-description-input"
 ></textarea>
 </div>

 <div className="form-group">
 <div className="flex items-center">
 <input 
 id="edit-task-completed" 
 type="checkbox" 
 className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-gray-300 rounded" 
 checked={newTask.completed}
 onChange={(e) => setNewTask({ ...newTask, completed: e.target.checked })}
 role="checkbox"
 name="edit-task-completed-checkbox"
 />
 <label htmlFor="edit-task-completed" className="ml-2 block text-sm text-gray-700 dark:text-slate-300">
 Mark as completed
 </label>
 </div>
 </div>
 </div>
 </div>
 
 <div className="modal-footer p-4 border-t border-gray-200 dark:border-slate-700 flex justify-end space-x-2">
 <button 
 className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600" 
 onClick={() => {
 setIsEditingTask(false);
 setEditingTaskId("");
 setNewTask({ 
 title: '', 
 subject: '', 
 description: '', 
 duration: 30, 
 completed: false,
 day: selectedDay,
 priority: 'medium'
 });
 }}
 role="button"
 name="cancel-edit-task-button"
 >
 Cancel
 </button>
 <button 
 className="btn btn-primary" 
 onClick={handleEditTask}
 role="button"
 name="confirm-edit-task-button"
 >
 Save Changes
 </button>
 </div>
 </div>
 </div>
 )}

 {/* Add Subject Modal */}
 {isAddingSubject && (
 <div className="modal-backdrop fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 dark:bg-opacity-70">
 <div className="modal-content bg-white dark:bg-slate-800 rounded-lg shadow-lg w-full max-w-md mx-4 theme-transition">
 <div className="modal-header p-4 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
 <h3 className="text-lg font-bold text-gray-900 dark:text-white">Add New Subject</h3>
 <button 
 className="text-gray-400 hover:text-gray-500 dark:hover:text-slate-300"
 onClick={() => setIsAddingSubject(false)}
 aria-label="Close modal"
 role="button"
 name="close-add-subject-modal"
 >
 <X size={20} />
 </button>
 </div>
 
 <div className="p-4">
 <div className="space-y-4">
 <div className="form-group">
 <label className="form-label" htmlFor="subject-name">Subject Name</label>
 <input 
 id="subject-name" 
 type="text" 
 className="input w-full" 
 value={newSubject.name}
 onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
 placeholder="Geography"
 role="textbox"
 name="subject-name-input"
 />
 </div>
 
 <div className="form-group">
 <label className="form-label">Choose a color</label>
 <div className="grid grid-cols-4 gap-2 mt-2">
 {colorOptions.map(color => (
 <button
 key={color}
 className={`w-10 h-10 rounded-full ${color} ${newSubject.color === color ? 'ring-2 ring-offset-2 ring-primary-500' : ''}`}
 onClick={() => setNewSubject({ ...newSubject, color })}
 aria-label={`Select ${color} color`}
 role="button"
 name={`color-${color}`}
 ></button>
 ))}
 </div>
 </div>
 </div>
 </div>
 
 <div className="modal-footer p-4 border-t border-gray-200 dark:border-slate-700 flex justify-end space-x-2">
 <button 
 className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600" 
 onClick={() => setIsAddingSubject(false)}
 role="button"
 name="cancel-add-subject-button"
 >
 Cancel
 </button>
 <button 
 className="btn btn-primary" 
 onClick={handleAddSubject}
 role="button"
 name="confirm-add-subject-button"
 >
 Add Subject
 </button>
 </div>
 </div>
 </div>
 )}

 {/* Footer */}
 <footer className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 py-4 px-4 sm:px-6 text-center text-sm text-gray-500 dark:text-slate-400 theme-transition">
 Copyright (c) 2025 of Datavtar Private Limited. All rights reserved.
 </footer>
 </div>
 );
};

export default App;