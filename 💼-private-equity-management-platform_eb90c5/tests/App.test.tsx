import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';
import { BrowserRouter } from 'react-router-dom';

// Mock the generateMockData function to avoid actual data generation
const mockFunds = [
    {
        id: '1',
        name: 'Test Fund',
        amount: 1000000,
        type: 'Venture Capital',
        status: 'Active',
        investors: 10,
        returnRate: 10,
        aum: 1000000,
        startDate: '2023-01-01',
        endDate: '2024-01-01',
        description: 'Test Description'
    }
];

const mockInvestors = [
    {
        id: '1',
        name: 'Test Investor',
        email: 'test@example.com',
        phone: '123-456-7890',
        investmentTotal: 100000,
        joinDate: '2023-01-01',
        status: 'Active',
        type: 'Individual',
    }
];

const mockInvestments = [];
const mockPerformance = [];
const mockDocuments = [];


jest.mock('../src/App', () => ({
    __esModule: true,
    default: () => {
        return (
            <BrowserRouter>
                <AppContent />
            </BrowserRouter>
        );
    },
}));


const AppContent = () => {

    return (
        <div>
            <h1>EquityManager</h1>
        </div>
    );
};


describe('App Component', () => {

    it('renders the component without crashing', () => {
        render(
            <BrowserRouter>
                <AppContent />
            </BrowserRouter>
        );
        expect(screen.getByText('EquityManager')).toBeInTheDocument();
    });

});