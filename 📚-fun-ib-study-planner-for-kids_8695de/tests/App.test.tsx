import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';


describe('App Component', () => {
 test('renders the component', () => {
 render(<App />);
 expect(screen.getByText(/My IB Study Planner/i)).toBeInTheDocument();
 });

 test('adds a new task', async () => {
 render(<App />);

 // Open the add task modal
 const addTaskButton = screen.getByRole('button', { name: /^Add Task$/i });
 fireEvent.click(addTaskButton);

 // Fill in the task form
 const taskTitleInput = screen.getByRole('textbox', {name: /Task Title/i});
 fireEvent.change(taskTitleInput, { target: { value: 'New Task Title' } });

 const subjectSelect = screen.getByRole('combobox', {name: /Subject/i});
 fireEvent.change(subjectSelect, { target: { value: 'Math' } });

 const daySelect = screen.getByRole('combobox', {name: /Day/i});
 fireEvent.change(daySelect, { target: { value: 'Monday' } });

 const durationInput = screen.getByRole('spinbutton', {name: /Study Time/i});
 fireEvent.change(durationInput, { target: { value: '60' } });

 const prioritySelect = screen.getByRole('combobox', {name: /Priority/i});
 fireEvent.change(prioritySelect, { target: { value: 'high' } });

 const descriptionInput = screen.getByRole('textbox', {name: /Description/i});
 fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });

 // Submit the form
 const confirmAddTaskButton = screen.getByRole('button', { name: /Add Task$/i });
 fireEvent.click(confirmAddTaskButton);

 // Verify that the task is added
 await screen.findByRole('listitem', { name: /task-/i });
 expect(screen.getByText(/New Task Title/i)).toBeInTheDocument();
 });

 test('opens and closes the add task modal', () => {
 render(<App />);

 const addTaskButton = screen.getByRole('button', { name: /^Add Task$/i });
 fireEvent.click(addTaskButton);

 expect(screen.getByText(/Add New Task/i)).toBeInTheDocument();

 const closeButton = screen.getByRole('button', { name: /Close modal/i });
 fireEvent.click(closeButton);

 // Check that "Add New Task" is not in document
 expect(screen.queryByText(/Add New Task/i)).not.toBeInTheDocument();
 });

 test('adds a new subject', async () => {
 render(<App />);

 const addSubjectButton = screen.getByRole('button', { name: /^Add Subject$/i });
 fireEvent.click(addSubjectButton);

 const subjectNameInput = screen.getByRole('textbox', {name: /Subject Name/i});
 fireEvent.change(subjectNameInput, { target: { value: 'History' } });

 const confirmAddSubjectButton = screen.getByRole('button', { name: /Add Subject$/i });
 fireEvent.click(confirmAddSubjectButton);

 await screen.findByRole('button', { name: /^subject-history$/i });
 expect(screen.getByRole('button', { name: /^subject-history$/i })).toBeInTheDocument();


 });

 test('toggles dark mode', () => {
 render(<App />);

 const themeToggleButton = screen.getByRole('button', { name: /theme-toggle/i });
 fireEvent.click(themeToggleButton);

 expect(document.documentElement.classList.contains('dark')).toBe(true);

 fireEvent.click(themeToggleButton);
 expect(document.documentElement.classList.contains('dark')).toBe(false);
 });

 test('completes a task', async () => {
 render(<App />);

 // Add a task first
 const addTaskButton = screen.getByRole('button', { name: /^Add Task$/i });
 fireEvent.click(addTaskButton);

 const taskTitleInput = screen.getByRole('textbox', {name: /Task Title/i});
 fireEvent.change(taskTitleInput, { target: { value: 'Complete Task' } });

 const subjectSelect = screen.getByRole('combobox', {name: /Subject/i});
 fireEvent.change(subjectSelect, { target: { value: 'Math' } });

 const confirmAddTaskButton = screen.getByRole('button', { name: /Add Task$/i });
 fireEvent.click(confirmAddTaskButton);

 await screen.findByRole('listitem', { name: /task-/i });

 // Complete the task
 const completeTaskButton = screen.getByRole('checkbox', { name: /Mark as complete/i });
 fireEvent.click(completeTaskButton);


 expect(screen.getByRole('listitem', {name: /task-/i})).toHaveClass('bg-gray-50');
 });
});