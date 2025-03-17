import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';


describe('App Component', () => {
 test('renders the App component', () => {
 render(<App />);
 expect(screen.getByText('Todo App')).toBeInTheDocument();
 });

 test('adds a new todo', async () => {
 render(<App />);
 const addTodoInput = screen.getByRole('textbox', { name: /addTodoInput/i });
 const addTodoButton = screen.getByRole('button', { name: /addTodoButton/i });

 fireEvent.change(addTodoInput, { target: { value: 'Test Todo' } });
 fireEvent.click(addTodoButton);

 await waitFor(() => {
 expect(screen.getByText('Test Todo')).toBeInTheDocument();
 });
 });

 test('deletes a todo', async () => {
 render(<App />);
 const addTodoInput = screen.getByRole('textbox', { name: /addTodoInput/i });
 const addTodoButton = screen.getByRole('button', { name: /addTodoButton/i });
 fireEvent.change(addTodoInput, { target: { value: 'Test Todo' } });
 fireEvent.click(addTodoButton);

 await waitFor(() => {
 expect(screen.getByText('Test Todo')).toBeInTheDocument();
 });

 const deleteButton = screen.getByRole('button', { name: /deleteButton/i });
 fireEvent.click(deleteButton);

 await waitFor(() => {
 expect(screen.queryByText('Test Todo')).toBeNull();
 });
 });

 test('toggles a todo complete', async () => {
 render(<App />);
 const addTodoInput = screen.getByRole('textbox', { name: /addTodoInput/i });
 const addTodoButton = screen.getByRole('button', { name: /addTodoButton/i });
 fireEvent.change(addTodoInput, { target: { value: 'Test Todo' } });
 fireEvent.click(addTodoButton);

 await waitFor(() => {
 expect(screen.getByText('Test Todo')).toBeInTheDocument();
 });

 const completeCheckbox = screen.getByRole('checkbox', { name: /completeCheckbox/i });
 fireEvent.click(completeCheckbox);

 await waitFor(() => {
 expect(completeCheckbox).toBeChecked();
 });
 });

 test('edits a todo', async () => {
 render(<App />);
 const addTodoInput = screen.getByRole('textbox', { name: /addTodoInput/i });
 const addTodoButton = screen.getByRole('button', { name: /addTodoButton/i });
 fireEvent.change(addTodoInput, { target: { value: 'Test Todo' } });
 fireEvent.click(addTodoButton);

 await waitFor(() => {
 expect(screen.getByText('Test Todo')).toBeInTheDocument();
 });

 const editButton = screen.getByRole('button', { name: /editButton/i });
 fireEvent.click(editButton);

 const editTodoInput = screen.getByRole('textbox', { name: /editTodoInput/i });
 fireEvent.change(editTodoInput, { target: { value: 'Updated Todo' } });

 const saveEditButton = screen.getByRole('button', { name: /saveEditButton/i });
 fireEvent.click(saveEditButton);

 await waitFor(() => {
 expect(screen.getByText('Updated Todo')).toBeInTheDocument();
 });
 });

 test('filters todos', async () => {
 render(<App />);
 const addTodoInput = screen.getByRole('textbox', { name: /addTodoInput/i });
 const addTodoButton = screen.getByRole('button', { name: /addTodoButton/i });

 fireEvent.change(addTodoInput, { target: { value: 'Active Todo' } });
 fireEvent.click(addTodoButton);
 fireEvent.change(addTodoInput, { target: { value: 'Completed Todo' } });
 fireEvent.click(addTodoButton);

 await waitFor(() => {
 expect(screen.getByText('Active Todo')).toBeInTheDocument();
 expect(screen.getByText('Completed Todo')).toBeInTheDocument();
 });

 const completeCheckbox = screen.getAllByRole('checkbox', { name: /completeCheckbox/i })[1];
 fireEvent.click(completeCheckbox);


 fireEvent.click(screen.getByText('Active'));

 await waitFor(() => {
 expect(screen.getByText('Active Todo')).toBeInTheDocument();
 expect(screen.queryByText('Completed Todo')).toBeNull();
 });

 fireEvent.click(screen.getByText('Completed'));

 await waitFor(() => {
 expect(screen.queryByText('Active Todo')).toBeNull();
 expect(screen.getByText('Completed Todo')).toBeInTheDocument();
 });

 fireEvent.click(screen.getByText('All'));

 await waitFor(() => {
 expect(screen.getByText('Active Todo')).toBeInTheDocument();
 expect(screen.getByText('Completed Todo')).toBeInTheDocument();
 });
 });

 test('sorts todos', async () => {
 render(<App />);
 const addTodoInput = screen.getByRole('textbox', { name: /addTodoInput/i });
 const addTodoButton = screen.getByRole('button', { name: /addTodoButton/i });
 fireEvent.change(addTodoInput, { target: { value: 'B Todo' } });
 fireEvent.click(addTodoButton);
 fireEvent.change(addTodoInput, { target: { value: 'A Todo' } });
 fireEvent.click(addTodoButton);

 await waitFor(() => {
 expect(screen.getByText('B Todo')).toBeInTheDocument();
 expect(screen.getByText('A Todo')).toBeInTheDocument();
 });

 const sortButton = screen.getByRole('button', { name: /sortButton/i });
 fireEvent.click(sortButton);

 const todos = await screen.findAllByText(/Todo/i);

 expect(todos[0]).toHaveTextContent('B Todo');


 fireEvent.click(sortButton);

 const todos2 = await screen.findAllByText(/Todo/i);

 expect(todos2[0]).toHaveTextContent('A Todo');


 });

 test('searches todos', async () => {
 render(<App />);
 const addTodoInput = screen.getByRole('textbox', { name: /addTodoInput/i });
 const addTodoButton = screen.getByRole('button', { name: /addTodoButton/i });
 fireEvent.change(addTodoInput, { target: { value: 'Searchable Todo' } });
 fireEvent.click(addTodoButton);
 fireEvent.change(addTodoInput, { target: { value: 'Another Todo' } });
 fireEvent.click(addTodoButton);

 await waitFor(() => {
 expect(screen.getByText('Searchable Todo')).toBeInTheDocument();
 expect(screen.getByText('Another Todo')).toBeInTheDocument();
 });

 const searchInput = screen.getByRole('search', { name: /searchInput/i });
 fireEvent.change(searchInput, { target: { value: 'Searchable' } });

 await waitFor(() => {
 expect(screen.getByText('Searchable Todo')).toBeInTheDocument();
 expect(screen.queryByText('Another Todo')).toBeNull();
 });
 });

 test('toggles dark mode', async () => {
 render(<App />);
 const themeToggle = screen.getByRole('switch', { name: /themeToggle/i });

 fireEvent.click(themeToggle);

 await waitFor(() => {
 expect(document.documentElement.classList.contains('dark')).toBe(true);
 });

 fireEvent.click(themeToggle);

 await waitFor(() => {
 expect(document.documentElement.classList.contains('dark')).toBe(false);
 });
 });
});