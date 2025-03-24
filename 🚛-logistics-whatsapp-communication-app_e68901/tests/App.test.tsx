import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';


describe('App Component', () => {
  test('renders the LogiChat header', () => {
    // Arrange
    render(<App />);

    // Act
    const headerElement = screen.getByText(/LogiChat/i);

    // Assert
    expect(headerElement).toBeInTheDocument();
  });

  test('renders the chats tab as active by default', () => {
    // Arrange
    render(<App />);

    // Act
    const chatsButton = screen.getByRole('button', { name: /Chats/i });

    // Assert
    expect(chatsButton).toHaveClass('bg-primary-100');
  });

  test('toggles dark mode when the dark mode button is clicked', () => {
    // Arrange
    render(<App />);
    const darkModeButton = screen.getByRole('button', {name: /Switch to dark mode/i});

    // Act
    fireEvent.click(darkModeButton);

    // Assert
    expect(document.documentElement).toHaveClass('dark');

    // Act
    fireEvent.click(darkModeButton);

    // Assert
    expect(document.documentElement).not.toHaveClass('dark');
  });

  test('navigates to contacts tab when contacts button is clicked', () => {
    // Arrange
    render(<App />);
    const contactsButton = screen.getByRole('button', { name: /Contacts/i });

    // Act
    fireEvent.click(contactsButton);

    // Assert
    expect(contactsButton).toHaveClass('bg-primary-100');
  });

  test('navigates to settings tab when settings button is clicked', () => {
    // Arrange
    render(<App />);
    const settingsButton = screen.getByRole('button', { name: /Settings/i });

    // Act
    fireEvent.click(settingsButton);

    // Assert
    expect(settingsButton).toHaveClass('bg-primary-100');
  });

  test('opens add customer modal when add new customer button is clicked in chats tab', () => {
    // Arrange
    render(<App />);
    const addCustomerButton = screen.getByRole('button', { name: /Add New Customer/i });

    // Act
    fireEvent.click(addCustomerButton);

    // Assert
    expect(screen.getByText(/Add New Customer/i)).toBeInTheDocument();
  });

  test('opens add customer modal when add customer button is clicked in contacts tab', () => {
    // Arrange
    render(<App />);
    const contactsButton = screen.getByRole('button', { name: /Contacts/i });
    fireEvent.click(contactsButton);
    const addCustomerButton = screen.getByRole('button', { name: /Add Customer/i });

    // Act
    fireEvent.click(addCustomerButton);

    // Assert
    expect(screen.getByText(/Add New Customer/i)).toBeInTheDocument();
  });

  test('closes add customer modal when cancel button is clicked', () => {
    // Arrange
    render(<App />);
    const addCustomerButton = screen.getByRole('button', { name: /Add New Customer/i });
    fireEvent.click(addCustomerButton);
    const cancelButton = screen.getByRole('button', { name: /Cancel/i });

    // Act
    fireEvent.click(cancelButton);

    // Assert
    expect(screen.queryByText(/Add New Customer/i)).not.toBeInTheDocument();
  });

  test('adds a new customer when the add customer form is submitted', async () => {
    // Arrange
    render(<App />);
    const addCustomerButton = screen.getByRole('button', { name: /Add New Customer/i });
    fireEvent.click(addCustomerButton);

    const nameInput = screen.getByLabelText(/Name/i);
    const phoneInput = screen.getByLabelText(/Phone/i);
    const emailInput = screen.getByLabelText(/Email/i);
    const addressInput = screen.getByLabelText(/Address/i);
    const submitButton = screen.getByRole('button', { name: /Add Customer/i });

    // Act
    fireEvent.change(nameInput, { target: { value: 'Test Customer' } });
    fireEvent.change(phoneInput, { target: { value: '123-456-7890' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(addressInput, { target: { value: '123 Test St' } });
    fireEvent.click(submitButton);

    // Wait for the modal to close (state update) - don't wait in tests
    // Assert
    expect(screen.queryByText(/Add New Customer/i)).not.toBeInTheDocument();
  });

  test('opens add template modal when add template button is clicked in settings tab', () => {
    // Arrange
    render(<App />);
    const settingsButton = screen.getByRole('button', { name: /Settings/i });
    fireEvent.click(settingsButton);
    const addTemplateButton = screen.getByRole('button', { name: /Add Template/i });

    // Act
    fireEvent.click(addTemplateButton);

    // Assert
    expect(screen.getByText(/Add Message Template/i)).toBeInTheDocument();
  });

    test('adds a new template when the add template form is submitted', async () => {
        // Arrange
        render(<App />);
        const settingsButton = screen.getByRole('button', { name: /Settings/i });
        fireEvent.click(settingsButton);
        const addTemplateButton = screen.getByRole('button', { name: /Add Template/i });
        fireEvent.click(addTemplateButton);

        const nameInput = screen.getByLabelText(/Template Name/i);
        const contentInput = screen.getByLabelText(/Template Content/i);
        const submitButton = screen.getByRole('button', { name: /Add Template/i });

        // Act
        fireEvent.change(nameInput, { target: { value: 'Test Template' } });
        fireEvent.change(contentInput, { target: { value: 'Test Content' } });
        fireEvent.click(submitButton);

        // Wait for the modal to close (state update) - don't wait in tests
        // Assert
        expect(screen.queryByText(/Add Message Template/i)).not.toBeInTheDocument();
    });

    test('opens add auto response modal when add response button is clicked in settings tab', () => {
        // Arrange
        render(<App />);
        const settingsButton = screen.getByRole('button', { name: /Settings/i });
        fireEvent.click(settingsButton);
        const addResponseButton = screen.getByRole('button', { name: /Add Response/i });

        // Act
        fireEvent.click(addResponseButton);

        // Assert
        expect(screen.getByText(/Add Auto Response/i)).toBeInTheDocument();
    });

    test('adds a new auto response when the add auto response form is submitted', async () => {
        // Arrange
        render(<App />);
        const settingsButton = screen.getByRole('button', { name: /Settings/i });
        fireEvent.click(settingsButton);
        const addResponseButton = screen.getByRole('button', { name: /Add Response/i });
        fireEvent.click(addResponseButton);

        const triggerWordInput = screen.getByLabelText(/Trigger Word\/Phrase/i);
        const responseContentInput = screen.getByLabelText(/Response Message/i);
        const submitButton = screen.getByRole('button', { name: /Add Auto Response/i });

        // Act
        fireEvent.change(triggerWordInput, { target: { value: 'Test Trigger' } });
        fireEvent.change(responseContentInput, { target: { value: 'Test Response' } });
        fireEvent.click(submitButton);

        // Wait for the modal to close (state update) - don't wait in tests
        // Assert
        expect(screen.queryByText(/Add Auto Response/i)).not.toBeInTheDocument();
    });

});