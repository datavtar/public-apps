import React, { useState, useEffect } from 'react';
import { createBrowserRouter, RouterProvider, Outlet, Link, useNavigate, useParams } from 'react-router-dom';
import { useForm, SubmitHandler } from 'react-hook-form';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import styles from './styles/styles.module.css';
import { Search, Menu, X, ChevronDown, Plus, Edit, Trash2, Users, Building, PieChart as PieChartIcon, BarChart as BarChartIcon, ArrowRight, Download, Upload, Save, Eye, Sun, Moon, LogOut, Filter, ArrowUpDown } from 'lucide-react';

// Types and Interfaces
type Portfolio = {
  id: string;
  name: string;
  industry: string;
  revenue: number;
  fundingAmount: number;
  investmentDate: string;
  valuation: number;
  equityStake: number;
  status: 'Active' | 'Exited' | 'On Hold';
  description: string;
  contacts?: Contact[];
  documents?: Document[];
  performanceMetrics?: PerformanceMetric[];
};

type Contact = {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
};

type Document = {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
  size: string;
  content?: string; // Base64 encoded content
};

type PerformanceMetric = {
  id: string;
  date: string;
  revenue: number;
  profit: number;
  cashFlow: number;
  employeeCount: number;
};

type Company = {
  id: string;
  name: string;
  industry: string;
  contactPerson: string;
  email: string;
  phone: string;
  joinedDate: string;
  portfolios: Portfolio[];
};

type AppState = {
  companies: Company[];
  currentCompany: Company | null;
};

type SortKey = 'name' | 'industry' | 'revenue' | 'fundingAmount' | 'investmentDate' | 'valuation';
type SortDirection = 'asc' | 'desc';

type FormData = {
  name: string;
  industry: string;
  contactPerson: string;
  email: string;
  phone: string;
};

type PortfolioFormData = {
  name: string;
  industry: string;
  revenue: number;
  fundingAmount: number;
  investmentDate: string;
  valuation: number;
  equityStake: number;
  status: 'Active' | 'Exited' | 'On Hold';
  description: string;
};

type ContactFormData = {
  name: string;
  role: string;
  email: string;
  phone: string;
};

type DocumentFormData = {
  name: string;
  type: string;
  content: string;
};

type PerformanceMetricFormData = {
  date: string;
  revenue: number;
  profit: number;
  cashFlow: number;
  employeeCount: number;
};

type FilterOptions = {
  industry: string;
  status: string;
  minValuation: number | null;
  maxValuation: number | null;
};

// Main App Component
const App: React.FC = () => {
  const router = createBrowserRouter([
    {
      path: '/',
      element: <Layout />,
      children: [
        { index: true, element: <Dashboard /> },
        { path: '/companies', element: <CompaniesList /> },
        { path: '/companies/add', element: <AddCompany /> },
        { path: '/companies/:companyId', element: <CompanyDetail /> },
        { path: '/companies/:companyId/edit', element: <EditCompany /> },
        { path: '/companies/:companyId/portfolios/add', element: <AddPortfolio /> },
        { path: '/companies/:companyId/portfolios/:portfolioId', element: <PortfolioDetail /> },
        { path: '/companies/:companyId/portfolios/:portfolioId/edit', element: <EditPortfolio /> },
        { path: '/companies/:companyId/portfolios/:portfolioId/contacts/add', element: <AddContact /> },
        { path: '/companies/:companyId/portfolios/:portfolioId/documents/add', element: <AddDocument /> },
        { path: '/companies/:companyId/portfolios/:portfolioId/metrics/add', element: <AddPerformanceMetric /> },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
};

// Layout Component
const Layout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode === 'true' || 
      (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 theme-transition">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm">
        <div className="container-fluid py-4">
          <div className="flex-between">
            <div className="flex-start">
              <Link to="/" className="text-primary-600 dark:text-primary-400 font-bold text-xl">
                EquityManager
              </Link>
            </div>

            {/* Desktop navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link to="/" className="nav-link">Dashboard</Link>
              <Link to="/companies" className="nav-link">Companies</Link>
              <button 
                className="theme-toggle ml-4" 
                onClick={toggleDarkMode}
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </nav>

            {/* Mobile menu button */}
            <div className="flex md:hidden">
              <button 
                className="theme-toggle mr-4" 
                onClick={toggleDarkMode}
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button
                type="button"
                className="text-gray-600 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile navigation */}
          {isMobileMenuOpen && (
            <nav className="md:hidden mt-4 space-y-3 pb-3">
              <Link 
                to="/" 
                className="block nav-link-mobile" 
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link 
                to="/companies" 
                className="block nav-link-mobile" 
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Companies
              </Link>
            </nav>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="container-fluid py-6">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 shadow-inner py-6 mt-auto">
        <div className="container-fluid text-center text-gray-500 dark:text-gray-400 text-sm">
          Copyright © 2025 of Datavtar Private Limited. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

// Dashboard Component
const Dashboard: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Load companies from localStorage
    const loadCompanies = () => {
      const savedCompanies = localStorage.getItem('companies');
      if (savedCompanies) {
        setCompanies(JSON.parse(savedCompanies));
      }
      setLoading(false);
    };

    loadCompanies();
  }, []);

  // Calculate statistics
  const totalCompanies = companies.length;
  const totalPortfolios = companies.reduce((sum, company) => sum + company.portfolios.length, 0);
  
  // Get all portfolios for charts
  const allPortfolios = companies.flatMap(company => company.portfolios);
  
  // Industry distribution for pie chart
  const industryData = allPortfolios.reduce((acc: {name: string, value: number}[], portfolio) => {
    const existingIndustry = acc.find(item => item.name === portfolio.industry);
    if (existingIndustry) {
      existingIndustry.value += 1;
    } else {
      acc.push({ name: portfolio.industry, value: 1 });
    }
    return acc;
  }, []);

  // Status distribution for pie chart
  const statusData = allPortfolios.reduce((acc: {name: string, value: number}[], portfolio) => {
    const existingStatus = acc.find(item => item.name === portfolio.status);
    if (existingStatus) {
      existingStatus.value += 1;
    } else {
      acc.push({ name: portfolio.status, value: 1 });
    }
    return acc;
  }, []);

  // Top 5 portfolios by valuation
  const topPortfoliosByValuation = [...allPortfolios]
    .sort((a, b) => b.valuation - a.valuation)
    .slice(0, 5);

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) {
    return (
      <div className="flex-center min-h-[50vh]">
        <div className="space-y-3">
          <div className="skeleton-text w-1/2"></div>
          <div className="skeleton-text w-full"></div>
          <div className="skeleton-text w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <button 
          className="btn btn-primary flex items-center gap-2" 
          onClick={() => navigate('/companies/add')}
        >
          <Plus size={16} /> Add Company
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="stat-title">Total Companies</div>
          <div className="stat-value">{totalCompanies}</div>
          <div className="stat-desc">
            <Link to="/companies" className="text-primary-500 hover:text-primary-600 flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-title">Total Portfolios</div>
          <div className="stat-value">{totalPortfolios}</div>
          <div className="stat-desc">Across all companies</div>
        </div>

        <div className="stat-card">
          <div className="stat-title">Active Portfolios</div>
          <div className="stat-value">
            {allPortfolios.filter(p => p.status === 'Active').length}
          </div>
          <div className="stat-desc">
            {Math.round((allPortfolios.filter(p => p.status === 'Active').length / (totalPortfolios || 1)) * 100)}% of total
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-title">Total Valuation</div>
          <div className="stat-value">
            ${allPortfolios.reduce((sum, p) => sum + p.valuation, 0).toLocaleString()}
          </div>
          <div className="stat-desc">Combined portfolio value</div>
        </div>
      </div>

      {totalPortfolios > 0 ? (
        <>
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            {/* Portfolio Distribution by Industry */}
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <PieChartIcon size={18} /> Portfolio Distribution by Industry
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={industryData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {industryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} portfolios`, 'Count']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Portfolio Status Distribution */}
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <PieChartIcon size={18} /> Portfolio Status Distribution
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} portfolios`, 'Count']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Top Portfolios by Valuation */}
          <div className="card mt-8">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <BarChartIcon size={18} /> Top Portfolios by Valuation
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topPortfoliosByValuation.map(p => ({
                    name: p.name,
                    valuation: p.valuation,
                  }))}
                  margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end" 
                    height={70} 
                    interval={0}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    tickFormatter={(value) => `$${value.toLocaleString()}`}
                  />
                  <Tooltip 
                    formatter={(value) => [`$${(value as number).toLocaleString()}`, 'Valuation']}
                  />
                  <Legend />
                  <Bar dataKey="valuation" name="Valuation" fill="#0088FE" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      ) : (
        <div className="card mt-8 p-8 text-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Portfolios Yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Get started by adding your first company and portfolio.
          </p>
          <button 
            className="btn btn-primary inline-flex items-center gap-2" 
            onClick={() => navigate('/companies/add')}
          >
            <Plus size={16} /> Add Company
          </button>
        </div>
      )}
    </div>
  );
};

// Companies List Component
const CompaniesList: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Load companies from localStorage
    const loadCompanies = () => {
      const savedCompanies = localStorage.getItem('companies');
      if (savedCompanies) {
        setCompanies(JSON.parse(savedCompanies));
      }
      setLoading(false);
    };

    loadCompanies();
  }, []);

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this company?')) {
      const updatedCompanies = companies.filter(company => company.id !== id);
      setCompanies(updatedCompanies);
      localStorage.setItem('companies', JSON.stringify(updatedCompanies));
    }
  };

  const filteredCompanies = companies.filter(company => {
    return (
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (loading) {
    return (
      <div className="flex-center min-h-[50vh]">
        <div className="space-y-3">
          <div className="skeleton-text w-1/2"></div>
          <div className="skeleton-text w-full"></div>
          <div className="skeleton-text w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex-between flex-col sm:flex-row gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Companies</h1>
        <button 
          className="btn btn-primary flex items-center gap-2 sm:self-start" 
          onClick={() => navigate('/companies/add')}
        >
          <Plus size={16} /> Add Company
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search size={18} className="text-gray-500 dark:text-gray-400" />
        </div>
        <input
          type="text"
          className="input pl-10"
          placeholder="Search companies by name, industry, or contact person..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredCompanies.length > 0 ? (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th className="table-header">Name</th>
                <th className="table-header hidden md:table-cell">Industry</th>
                <th className="table-header hidden md:table-cell">Contact Person</th>
                <th className="table-header hidden lg:table-cell">Email</th>
                <th className="table-header hidden lg:table-cell">Joined Date</th>
                <th className="table-header">Portfolios</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCompanies.map((company) => (
                <tr key={company.id}>
                  <td className="table-cell font-medium text-gray-900 dark:text-white">
                    <Link to={`/companies/${company.id}`} className="hover:text-primary-600 dark:hover:text-primary-400">
                      {company.name}
                    </Link>
                  </td>
                  <td className="table-cell hidden md:table-cell">{company.industry}</td>
                  <td className="table-cell hidden md:table-cell">{company.contactPerson}</td>
                  <td className="table-cell hidden lg:table-cell">{company.email}</td>
                  <td className="table-cell hidden lg:table-cell">{company.joinedDate}</td>
                  <td className="table-cell">
                    <span className="badge badge-info">{company.portfolios.length}</span>
                  </td>
                  <td className="table-cell">
                    <div className="flex-start gap-2">
                      <button
                        className="btn-icon"
                        onClick={() => navigate(`/companies/${company.id}`)}
                        aria-label="View company details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className="btn-icon"
                        onClick={() => navigate(`/companies/${company.id}/edit`)}
                        aria-label="Edit company"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="btn-icon text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        onClick={() => handleDelete(company.id)}
                        aria-label="Delete company"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card p-8 text-center">
          {searchTerm ? (
            <>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No matching companies found</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Try adjusting your search or clear the search field to see all companies.
              </p>
            </>
          ) : (
            <>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Companies Yet</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Get started by adding your first company.
              </p>
              <button 
                className="btn btn-primary inline-flex items-center gap-2" 
                onClick={() => navigate('/companies/add')}
              >
                <Plus size={16} /> Add Company
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

// Add Company Component
const AddCompany: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
  const navigate = useNavigate();

  const onSubmit: SubmitHandler<FormData> = (data) => {
    // Create new company object
    const newCompany: Company = {
      id: crypto.randomUUID(),
      name: data.name,
      industry: data.industry,
      contactPerson: data.contactPerson,
      email: data.email,
      phone: data.phone,
      joinedDate: format(new Date(), 'yyyy-MM-dd'),
      portfolios: [],
    };

    // Get existing companies from localStorage
    const existingCompanies = localStorage.getItem('companies');
    const companies = existingCompanies ? JSON.parse(existingCompanies) : [];

    // Add new company and save back to localStorage
    companies.push(newCompany);
    localStorage.setItem('companies', JSON.stringify(companies));

    // Navigate back to companies list
    navigate('/companies');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center mb-6">
        <button
          className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 mr-4"
          onClick={() => navigate('/companies')}
        >
          Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Company</h1>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="form-group">
            <label htmlFor="name" className="form-label">Company Name</label>
            <input
              id="name"
              type="text"
              className={`input ${errors.name ? 'input-error' : ''}`}
              {...register('name', { required: 'Company name is required' })}
            />
            {errors.name && <p className="form-error">{errors.name.message}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="industry" className="form-label">Industry</label>
            <input
              id="industry"
              type="text"
              className={`input ${errors.industry ? 'input-error' : ''}`}
              {...register('industry', { required: 'Industry is required' })}
            />
            {errors.industry && <p className="form-error">{errors.industry.message}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="contactPerson" className="form-label">Contact Person</label>
            <input
              id="contactPerson"
              type="text"
              className={`input ${errors.contactPerson ? 'input-error' : ''}`}
              {...register('contactPerson', { required: 'Contact person is required' })}
            />
            {errors.contactPerson && <p className="form-error">{errors.contactPerson.message}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              id="email"
              type="email"
              className={`input ${errors.email ? 'input-error' : ''}`}
              {...register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
            />
            {errors.email && <p className="form-error">{errors.email.message}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="phone" className="form-label">Phone</label>
            <input
              id="phone"
              type="tel"
              className={`input ${errors.phone ? 'input-error' : ''}`}
              {...register('phone', { required: 'Phone number is required' })}
            />
            {errors.phone && <p className="form-error">{errors.phone.message}</p>}
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              onClick={() => navigate('/companies')}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary flex items-center gap-2">
              <Save size={16} /> Save Company
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit Company Component
const EditCompany: React.FC = () => {
  const { companyId } = useParams<{ companyId: string }>();
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<Company | null>(null);
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<FormData>();
  const navigate = useNavigate();

  useEffect(() => {
    // Load company data from localStorage
    const loadCompany = () => {
      const savedCompanies = localStorage.getItem('companies');
      if (savedCompanies && companyId) {
        const companies: Company[] = JSON.parse(savedCompanies);
        const foundCompany = companies.find(c => c.id === companyId);
        
        if (foundCompany) {
          setCompany(foundCompany);
          setValue('name', foundCompany.name);
          setValue('industry', foundCompany.industry);
          setValue('contactPerson', foundCompany.contactPerson);
          setValue('email', foundCompany.email);
          setValue('phone', foundCompany.phone);
        }
      }
      setLoading(false);
    };

    loadCompany();
  }, [companyId, setValue]);

  const onSubmit: SubmitHandler<FormData> = (data) => {
    if (!company || !companyId) return;

    // Update company data
    const updatedCompany: Company = {
      ...company,
      name: data.name,
      industry: data.industry,
      contactPerson: data.contactPerson,
      email: data.email,
      phone: data.phone,
    };

    // Get all companies and update the edited one
    const savedCompanies = localStorage.getItem('companies');
    if (savedCompanies) {
      const companies: Company[] = JSON.parse(savedCompanies);
      const updatedCompanies = companies.map(c => 
        c.id === companyId ? updatedCompany : c
      );
      
      // Save back to localStorage
      localStorage.setItem('companies', JSON.stringify(updatedCompanies));
    }

    // Navigate back to company details
    navigate(`/companies/${companyId}`);
  };

  if (loading) {
    return (
      <div className="flex-center min-h-[50vh]">
        <div className="space-y-3">
          <div className="skeleton-text w-1/2"></div>
          <div className="skeleton-text w-full"></div>
          <div className="skeleton-text w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="card p-8 text-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Company Not Found</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          The company you're looking for doesn't exist or has been removed.
        </p>
        <button 
          className="btn btn-primary" 
          onClick={() => navigate('/companies')}
        >
          Back to Companies
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center mb-6">
        <button
          className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 mr-4"
          onClick={() => navigate(`/companies/${companyId}`)}
        >
          Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Company</h1>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="form-group">
            <label htmlFor="name" className="form-label">Company Name</label>
            <input
              id="name"
              type="text"
              className={`input ${errors.name ? 'input-error' : ''}`}
              {...register('name', { required: 'Company name is required' })}
            />
            {errors.name && <p className="form-error">{errors.name.message}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="industry" className="form-label">Industry</label>
            <input
              id="industry"
              type="text"
              className={`input ${errors.industry ? 'input-error' : ''}`}
              {...register('industry', { required: 'Industry is required' })}
            />
            {errors.industry && <p className="form-error">{errors.industry.message}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="contactPerson" className="form-label">Contact Person</label>
            <input
              id="contactPerson"
              type="text"
              className={`input ${errors.contactPerson ? 'input-error' : ''}`}
              {...register('contactPerson', { required: 'Contact person is required' })}
            />
            {errors.contactPerson && <p className="form-error">{errors.contactPerson.message}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              id="email"
              type="email"
              className={`input ${errors.email ? 'input-error' : ''}`}
              {...register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
            />
            {errors.email && <p className="form-error">{errors.email.message}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="phone" className="form-label">Phone</label>
            <input
              id="phone"
              type="tel"
              className={`input ${errors.phone ? 'input-error' : ''}`}
              {...register('phone', { required: 'Phone number is required' })}
            />
            {errors.phone && <p className="form-error">{errors.phone.message}</p>}
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              onClick={() => navigate(`/companies/${companyId}`)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary flex items-center gap-2">
              <Save size={16} /> Update Company
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Company Detail Component
const CompanyDetail: React.FC = () => {
  const { companyId } = useParams<{ companyId: string }>();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection } | null>(null);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    industry: '',
    status: '',
    minValuation: null,
    maxValuation: null,
  });
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Load company data from localStorage
    const loadCompany = () => {
      const savedCompanies = localStorage.getItem('companies');
      if (savedCompanies && companyId) {
        const companies: Company[] = JSON.parse(savedCompanies);
        const foundCompany = companies.find(c => c.id === companyId);
        setCompany(foundCompany || null);
      }
      setLoading(false);
    };

    loadCompany();
  }, [companyId]);

  const handleDeleteCompany = () => {
    if (!company) return;
    
    if (window.confirm(`Are you sure you want to delete ${company.name}?`)) {
      const savedCompanies = localStorage.getItem('companies');
      if (savedCompanies) {
        const companies: Company[] = JSON.parse(savedCompanies);
        const updatedCompanies = companies.filter(c => c.id !== companyId);
        localStorage.setItem('companies', JSON.stringify(updatedCompanies));
        navigate('/companies');
      }
    }
  };

  const handleDeletePortfolio = (portfolioId: string) => {
    if (!company) return;
    
    if (window.confirm('Are you sure you want to delete this portfolio?')) {
      const updatedPortfolios = company.portfolios.filter(p => p.id !== portfolioId);
      const updatedCompany = { ...company, portfolios: updatedPortfolios };
      
      // Update company in localStorage
      const savedCompanies = localStorage.getItem('companies');
      if (savedCompanies) {
        const companies: Company[] = JSON.parse(savedCompanies);
        const updatedCompanies = companies.map(c => 
          c.id === companyId ? updatedCompany : c
        );
        
        localStorage.setItem('companies', JSON.stringify(updatedCompanies));
        setCompany(updatedCompany);
      }
    }
  };

  const handleSort = (key: SortKey) => {
    let direction: SortDirection = 'asc';
    
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    
    setSortConfig({ key, direction });
  };

  const resetFilters = () => {
    setFilterOptions({
      industry: '',
      status: '',
      minValuation: null,
      maxValuation: null,
    });
    setShowFilters(false);
  };

  // Get filtered and sorted portfolios
  const filteredPortfolios = company?.portfolios.filter(portfolio => {
    const nameMatch = portfolio.name.toLowerCase().includes(searchTerm.toLowerCase());
    const industryMatch = !filterOptions.industry || portfolio.industry === filterOptions.industry;
    const statusMatch = !filterOptions.status || portfolio.status === filterOptions.status;
    const minValuationMatch = !filterOptions.minValuation || portfolio.valuation >= filterOptions.minValuation;
    const maxValuationMatch = !filterOptions.maxValuation || portfolio.valuation <= filterOptions.maxValuation;
    
    return nameMatch && industryMatch && statusMatch && minValuationMatch && maxValuationMatch;
  }) || [];

  // Sort portfolios
  const sortedPortfolios = [...filteredPortfolios];
  
  if (sortConfig) {
    sortedPortfolios.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  // Get unique industries for filter dropdown
  const industries = company?.portfolios
    .map(p => p.industry)
    .filter((value, index, self) => self.indexOf(value) === index) || [];

  if (loading) {
    return (
      <div className="flex-center min-h-[50vh]">
        <div className="space-y-3">
          <div className="skeleton-text w-1/2"></div>
          <div className="skeleton-text w-full"></div>
          <div className="skeleton-text w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="card p-8 text-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Company Not Found</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          The company you're looking for doesn't exist or has been removed.
        </p>
        <button 
          className="btn btn-primary" 
          onClick={() => navigate('/companies')}
        >
          Back to Companies
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex-between flex-col sm:flex-row gap-4">
        <div className="flex items-center">
          <button
            className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 mr-4"
            onClick={() => navigate('/companies')}
          >
            Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{company.name}</h1>
        </div>
        <div className="flex gap-2">
          <button 
            className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 flex items-center gap-2" 
            onClick={() => navigate(`/companies/${companyId}/edit`)}
          >
            <Edit size={16} /> Edit
          </button>
          <button 
            className="btn bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-800 dark:text-red-200 dark:hover:bg-red-700 flex items-center gap-2" 
            onClick={handleDeleteCompany}
          >
            <Trash2 size={16} /> Delete
          </button>
        </div>
      </div>

      {/* Company Details Card */}
      <div className="card">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Building size={18} /> Company Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Industry</h3>
              <p className="mt-1 text-base text-gray-900 dark:text-white">{company.industry}</p>
            </div>
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Contact Person</h3>
              <p className="mt-1 text-base text-gray-900 dark:text-white">{company.contactPerson}</p>
            </div>
          </div>
          <div>
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</h3>
              <p className="mt-1 text-base text-gray-900 dark:text-white">{company.email}</p>
            </div>
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</h3>
              <p className="mt-1 text-base text-gray-900 dark:text-white">{company.phone}</p>
            </div>
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Joined Date</h3>
              <p className="mt-1 text-base text-gray-900 dark:text-white">{company.joinedDate}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Portfolios Section */}
      <div className="flex-between flex-col sm:flex-row gap-4 mt-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Users size={20} /> Portfolios ({company.portfolios.length})
        </h2>
        <button 
          className="btn btn-primary flex items-center gap-2" 
          onClick={() => navigate(`/companies/${companyId}/portfolios/add`)}
        >
          <Plus size={16} /> Add Portfolio
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search size={18} className="text-gray-500 dark:text-gray-400" />
          </div>
          <input
            type="text"
            className="input pl-10"
            placeholder="Search portfolios by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button 
            className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 flex items-center gap-2" 
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={16} /> {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          {(filterOptions.industry || filterOptions.status || filterOptions.minValuation || filterOptions.maxValuation) && (
            <button 
              className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600" 
              onClick={resetFilters}
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="card p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="form-group mb-0">
              <label htmlFor="industry-filter" className="form-label">Industry</label>
              <select
                id="industry-filter"
                className="input"
                value={filterOptions.industry}
                onChange={(e) => setFilterOptions({...filterOptions, industry: e.target.value})}
              >
                <option value="">All Industries</option>
                {industries.map(industry => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
            </div>

            <div className="form-group mb-0">
              <label htmlFor="status-filter" className="form-label">Status</label>
              <select
                id="status-filter"
                className="input"
                value={filterOptions.status}
                onChange={(e) => setFilterOptions({...filterOptions, status: e.target.value as any})}
              >
                <option value="">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Exited">Exited</option>
                <option value="On Hold">On Hold</option>
              </select>
            </div>

            <div className="form-group mb-0">
              <label htmlFor="min-valuation" className="form-label">Min Valuation ($)</label>
              <input
                id="min-valuation"
                type="number"
                className="input"
                value={filterOptions.minValuation || ''}
                onChange={(e) => setFilterOptions({
                  ...filterOptions, 
                  minValuation: e.target.value ? Number(e.target.value) : null
                })}
              />
            </div>

            <div className="form-group mb-0">
              <label htmlFor="max-valuation" className="form-label">Max Valuation ($)</label>
              <input
                id="max-valuation"
                type="number"
                className="input"
                value={filterOptions.maxValuation || ''}
                onChange={(e) => setFilterOptions({
                  ...filterOptions, 
                  maxValuation: e.target.value ? Number(e.target.value) : null
                })}
              />
            </div>
          </div>
        </div>
      )}

      {sortedPortfolios.length > 0 ? (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th 
                  className="table-header cursor-pointer"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-2">
                    Name
                    <ArrowUpDown size={14} />
                  </div>
                </th>
                <th 
                  className="table-header hidden md:table-cell cursor-pointer"
                  onClick={() => handleSort('industry')}
                >
                  <div className="flex items-center gap-2">
                    Industry
                    <ArrowUpDown size={14} />
                  </div>
                </th>
                <th 
                  className="table-header hidden lg:table-cell cursor-pointer"
                  onClick={() => handleSort('revenue')}
                >
                  <div className="flex items-center gap-2">
                    Revenue
                    <ArrowUpDown size={14} />
                  </div>
                </th>
                <th 
                  className="table-header hidden md:table-cell cursor-pointer"
                  onClick={() => handleSort('investmentDate')}
                >
                  <div className="flex items-center gap-2">
                    Investment Date
                    <ArrowUpDown size={14} />
                  </div>
                </th>
                <th 
                  className="table-header cursor-pointer"
                  onClick={() => handleSort('valuation')}
                >
                  <div className="flex items-center gap-2">
                    Valuation
                    <ArrowUpDown size={14} />
                  </div>
                </th>
                <th className="table-header">Status</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedPortfolios.map((portfolio) => (
                <tr key={portfolio.id}>
                  <td className="table-cell font-medium text-gray-900 dark:text-white">
                    <Link 
                      to={`/companies/${companyId}/portfolios/${portfolio.id}`}
                      className="hover:text-primary-600 dark:hover:text-primary-400"
                    >
                      {portfolio.name}
                    </Link>
                  </td>
                  <td className="table-cell hidden md:table-cell">{portfolio.industry}</td>
                  <td className="table-cell hidden lg:table-cell">${portfolio.revenue.toLocaleString()}</td>
                  <td className="table-cell hidden md:table-cell">{portfolio.investmentDate}</td>
                  <td className="table-cell">${portfolio.valuation.toLocaleString()}</td>
                  <td className="table-cell">
                    <span className={`badge ${
                      portfolio.status === 'Active' ? 'badge-success' : 
                      portfolio.status === 'Exited' ? 'badge-info' :
                      'badge-warning'
                    }`}>
                      {portfolio.status}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="flex-start gap-2">
                      <button
                        className="btn-icon"
                        onClick={() => navigate(`/companies/${companyId}/portfolios/${portfolio.id}`)}
                        aria-label="View portfolio details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className="btn-icon"
                        onClick={() => navigate(`/companies/${companyId}/portfolios/${portfolio.id}/edit`)}
                        aria-label="Edit portfolio"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="btn-icon text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        onClick={() => handleDeletePortfolio(portfolio.id)}
                        aria-label="Delete portfolio"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card p-8 text-center">
          {searchTerm || filterOptions.industry || filterOptions.status || filterOptions.minValuation || filterOptions.maxValuation ? (
            <>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No matching portfolios</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Try adjusting your search or filters to find the portfolios you're looking for.
              </p>
            </>
          ) : (
            <>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Portfolios Yet</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Get started by adding your first portfolio for this company.
              </p>
              <button 
                className="btn btn-primary inline-flex items-center gap-2" 
                onClick={() => navigate(`/companies/${companyId}/portfolios/add`)}
              >
                <Plus size={16} /> Add Portfolio
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

// Add Portfolio Component
const AddPortfolio: React.FC = () => {
  const { companyId } = useParams<{ companyId: string }>();
  const { register, handleSubmit, formState: { errors } } = useForm<PortfolioFormData>();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Load company data from localStorage
    const loadCompany = () => {
      const savedCompanies = localStorage.getItem('companies');
      if (savedCompanies && companyId) {
        const companies: Company[] = JSON.parse(savedCompanies);
        const foundCompany = companies.find(c => c.id === companyId);
        setCompany(foundCompany || null);
      }
      setLoading(false);
    };

    loadCompany();
  }, [companyId]);

  const onSubmit: SubmitHandler<PortfolioFormData> = (data) => {
    if (!company || !companyId) return;

    // Create new portfolio
    const newPortfolio: Portfolio = {
      id: crypto.randomUUID(),
      name: data.name,
      industry: data.industry,
      revenue: Number(data.revenue),
      fundingAmount: Number(data.fundingAmount),
      investmentDate: data.investmentDate,
      valuation: Number(data.valuation),
      equityStake: Number(data.equityStake),
      status: data.status,
      description: data.description,
      contacts: [],
      documents: [],
      performanceMetrics: [],
    };

    // Add portfolio to company
    const updatedCompany = {
      ...company,
      portfolios: [...company.portfolios, newPortfolio],
    };

    // Update company in localStorage
    const savedCompanies = localStorage.getItem('companies');
    if (savedCompanies) {
      const companies: Company[] = JSON.parse(savedCompanies);
      const updatedCompanies = companies.map(c => 
        c.id === companyId ? updatedCompany : c
      );
      
      localStorage.setItem('companies', JSON.stringify(updatedCompanies));
    }

    // Navigate back to company detail
    navigate(`/companies/${companyId}`);
  };

  if (loading) {
    return (
      <div className="flex-center min-h-[50vh]">
        <div className="space-y-3">
          <div className="skeleton-text w-1/2"></div>
          <div className="skeleton-text w-full"></div>
          <div className="skeleton-text w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="card p-8 text-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Company Not Found</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          The company you're trying to add a portfolio to doesn't exist or has been removed.
        </p>
        <button 
          className="btn btn-primary" 
          onClick={() => navigate('/companies')}
        >
          Back to Companies
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center mb-6">
        <button
          className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 mr-4"
          onClick={() => navigate(`/companies/${companyId}`)}
        >
          Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Portfolio for {company.name}</h1>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="form-group">
            <label htmlFor="name" className="form-label">Portfolio Name</label>
            <input
              id="name"
              type="text"
              className={`input ${errors.name ? 'input-error' : ''}`}
              {...register('name', { required: 'Portfolio name is required' })}
            />
            {errors.name && <p className="form-error">{errors.name.message}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="industry" className="form-label">Industry</label>
            <input
              id="industry"
              type="text"
              className={`input ${errors.industry ? 'input-error' : ''}`}
              {...register('industry', { required: 'Industry is required' })}
            />
            {errors.industry && <p className="form-error">{errors.industry.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group">
              <label htmlFor="revenue" className="form-label">Annual Revenue ($)</label>
              <input
                id="revenue"
                type="number"
                className={`input ${errors.revenue ? 'input-error' : ''}`}
                {...register('revenue', { 
                  required: 'Revenue is required', 
                  min: { value: 0, message: 'Revenue must be a positive number' } 
                })}
              />
              {errors.revenue && <p className="form-error">{errors.revenue.message}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="fundingAmount" className="form-label">Funding Amount ($)</label>
              <input
                id="fundingAmount"
                type="number"
                className={`input ${errors.fundingAmount ? 'input-error' : ''}`}
                {...register('fundingAmount', { 
                  required: 'Funding amount is required', 
                  min: { value: 0, message: 'Funding amount must be a positive number' } 
                })}
              />
              {errors.fundingAmount && <p className="form-error">{errors.fundingAmount.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group">
              <label htmlFor="investmentDate" className="form-label">Investment Date</label>
              <input
                id="investmentDate"
                type="date"
                className={`input ${errors.investmentDate ? 'input-error' : ''}`}
                {...register('investmentDate', { required: 'Investment date is required' })}
              />
              {errors.investmentDate && <p className="form-error">{errors.investmentDate.message}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="valuation" className="form-label">Current Valuation ($)</label>
              <input
                id="valuation"
                type="number"
                className={`input ${errors.valuation ? 'input-error' : ''}`}
                {...register('valuation', { 
                  required: 'Valuation is required', 
                  min: { value: 0, message: 'Valuation must be a positive number' } 
                })}
              />
              {errors.valuation && <p className="form-error">{errors.valuation.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group">
              <label htmlFor="equityStake" className="form-label">Equity Stake (%)</label>
              <input
                id="equityStake"
                type="number"
                step="0.01"
                className={`input ${errors.equityStake ? 'input-error' : ''}`}
                {...register('equityStake', { 
                  required: 'Equity stake is required', 
                  min: { value: 0, message: 'Equity stake must be a positive number' },
                  max: { value: 100, message: 'Equity stake cannot exceed 100%' }
                })}
              />
              {errors.equityStake && <p className="form-error">{errors.equityStake.message}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="status" className="form-label">Status</label>
              <select
                id="status"
                className={`input ${errors.status ? 'input-error' : ''}`}
                {...register('status', { required: 'Status is required' })}
              >
                <option value="Active">Active</option>
                <option value="Exited">Exited</option>
                <option value="On Hold">On Hold</option>
              </select>
              {errors.status && <p className="form-error">{errors.status.message}</p>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description" className="form-label">Description</label>
            <textarea
              id="description"
              rows={4}
              className={`input ${errors.description ? 'input-error' : ''}`}
              {...register('description', { required: 'Description is required' })}
            ></textarea>
            {errors.description && <p className="form-error">{errors.description.message}</p>}
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              onClick={() => navigate(`/companies/${companyId}`)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary flex items-center gap-2">
              <Save size={16} /> Save Portfolio
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit Portfolio Component
const EditPortfolio: React.FC = () => {
  const { companyId, portfolioId } = useParams<{ companyId: string; portfolioId: string }>();
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<PortfolioFormData>();
  const [company, setCompany] = useState<Company | null>(null);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Load company and portfolio data from localStorage
    const loadData = () => {
      const savedCompanies = localStorage.getItem('companies');
      if (savedCompanies && companyId && portfolioId) {
        const companies: Company[] = JSON.parse(savedCompanies);
        const foundCompany = companies.find(c => c.id === companyId);
        
        if (foundCompany) {
          setCompany(foundCompany);
          const foundPortfolio = foundCompany.portfolios.find(p => p.id === portfolioId);
          
          if (foundPortfolio) {
            setPortfolio(foundPortfolio);
            
            // Set form values
            setValue('name', foundPortfolio.name);
            setValue('industry', foundPortfolio.industry);
            setValue('revenue', foundPortfolio.revenue);
            setValue('fundingAmount', foundPortfolio.fundingAmount);
            setValue('investmentDate', foundPortfolio.investmentDate);
            setValue('valuation', foundPortfolio.valuation);
            setValue('equityStake', foundPortfolio.equityStake);
            setValue('status', foundPortfolio.status);
            setValue('description', foundPortfolio.description);
          }
        }
      }
      setLoading(false);
    };

    loadData();
  }, [companyId, portfolioId, setValue]);

  const onSubmit: SubmitHandler<PortfolioFormData> = (data) => {
    if (!company || !portfolio || !companyId) return;

    // Update portfolio data
    const updatedPortfolio: Portfolio = {
      ...portfolio,
      name: data.name,
      industry: data.industry,
      revenue: Number(data.revenue),
      fundingAmount: Number(data.fundingAmount),
      investmentDate: data.investmentDate,
      valuation: Number(data.valuation),
      equityStake: Number(data.equityStake),
      status: data.status,
      description: data.description,
    };

    // Update company portfolios
    const updatedPortfolios = company.portfolios.map(p => 
      p.id === portfolioId ? updatedPortfolio : p
    );
    
    const updatedCompany = {
      ...company,
      portfolios: updatedPortfolios,
    };

    // Update company in localStorage
    const savedCompanies = localStorage.getItem('companies');
    if (savedCompanies) {
      const companies: Company[] = JSON.parse(savedCompanies);
      const updatedCompanies = companies.map(c => 
        c.id === companyId ? updatedCompany : c
      );
      
      localStorage.setItem('companies', JSON.stringify(updatedCompanies));
    }

    // Navigate to portfolio detail
    navigate(`/companies/${companyId}/portfolios/${portfolioId}`);
  };

  if (loading) {
    return (
      <div className="flex-center min-h-[50vh]">
        <div className="space-y-3">
          <div className="skeleton-text w-1/2"></div>
          <div className="skeleton-text w-full"></div>
          <div className="skeleton-text w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!company || !portfolio) {
    return (
      <div className="card p-8 text-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Portfolio Not Found</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          The portfolio you're trying to edit doesn't exist or has been removed.
        </p>
        <button 
          className="btn btn-primary" 
          onClick={() => navigate(`/companies/${companyId}`)}
        >
          Back to Company
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center mb-6">
        <button
          className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 mr-4"
          onClick={() => navigate(`/companies/${companyId}/portfolios/${portfolioId}`)}
        >
          Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Portfolio</h1>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="form-group">
            <label htmlFor="name" className="form-label">Portfolio Name</label>
            <input
              id="name"
              type="text"
              className={`input ${errors.name ? 'input-error' : ''}`}
              {...register('name', { required: 'Portfolio name is required' })}
            />
            {errors.name && <p className="form-error">{errors.name.message}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="industry" className="form-label">Industry</label>
            <input
              id="industry"
              type="text"
              className={`input ${errors.industry ? 'input-error' : ''}`}
              {...register('industry', { required: 'Industry is required' })}
            />
            {errors.industry && <p className="form-error">{errors.industry.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group">
              <label htmlFor="revenue" className="form-label">Annual Revenue ($)</label>
              <input
                id="revenue"
                type="number"
                className={`input ${errors.revenue ? 'input-error' : ''}`}
                {...register('revenue', { 
                  required: 'Revenue is required', 
                  min: { value: 0, message: 'Revenue must be a positive number' } 
                })}
              />
              {errors.revenue && <p className="form-error">{errors.revenue.message}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="fundingAmount" className="form-label">Funding Amount ($)</label>
              <input
                id="fundingAmount"
                type="number"
                className={`input ${errors.fundingAmount ? 'input-error' : ''}`}
                {...register('fundingAmount', { 
                  required: 'Funding amount is required', 
                  min: { value: 0, message: 'Funding amount must be a positive number' } 
                })}
              />
              {errors.fundingAmount && <p className="form-error">{errors.fundingAmount.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group">
              <label htmlFor="investmentDate" className="form-label">Investment Date</label>
              <input
                id="investmentDate"
                type="date"
                className={`input ${errors.investmentDate ? 'input-error' : ''}`}
                {...register('investmentDate', { required: 'Investment date is required' })}
              />
              {errors.investmentDate && <p className="form-error">{errors.investmentDate.message}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="valuation" className="form-label">Current Valuation ($)</label>
              <input
                id="valuation"
                type="number"
                className={`input ${errors.valuation ? 'input-error' : ''}`}
                {...register('valuation', { 
                  required: 'Valuation is required', 
                  min: { value: 0, message: 'Valuation must be a positive number' } 
                })}
              />
              {errors.valuation && <p className="form-error">{errors.valuation.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group">
              <label htmlFor="equityStake" className="form-label">Equity Stake (%)</label>
              <input
                id="equityStake"
                type="number"
                step="0.01"
                className={`input ${errors.equityStake ? 'input-error' : ''}`}
                {...register('equityStake', { 
                  required: 'Equity stake is required', 
                  min: { value: 0, message: 'Equity stake must be a positive number' },
                  max: { value: 100, message: 'Equity stake cannot exceed 100%' }
                })}
              />
              {errors.equityStake && <p className="form-error">{errors.equityStake.message}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="status" className="form-label">Status</label>
              <select
                id="status"
                className={`input ${errors.status ? 'input-error' : ''}`}
                {...register('status', { required: 'Status is required' })}
              >
                <option value="Active">Active</option>
                <option value="Exited">Exited</option>
                <option value="On Hold">On Hold</option>
              </select>
              {errors.status && <p className="form-error">{errors.status.message}</p>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description" className="form-label">Description</label>
            <textarea
              id="description"
              rows={4}
              className={`input ${errors.description ? 'input-error' : ''}`}
              {...register('description', { required: 'Description is required' })}
            ></textarea>
            {errors.description && <p className="form-error">{errors.description.message}</p>}
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              onClick={() => navigate(`/companies/${companyId}/portfolios/${portfolioId}`)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary flex items-center gap-2">
              <Save size={16} /> Update Portfolio
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Portfolio Detail Component
const PortfolioDetail: React.FC = () => {
  const { companyId, portfolioId } = useParams<{ companyId: string; portfolioId: string }>();
  const [company, setCompany] = useState<Company | null>(null);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'contacts' | 'documents' | 'metrics'>('overview');
  const navigate = useNavigate();

  useEffect(() => {
    // Load company and portfolio data from localStorage
    const loadData = () => {
      const savedCompanies = localStorage.getItem('companies');
      if (savedCompanies && companyId && portfolioId) {
        const companies: Company[] = JSON.parse(savedCompanies);
        const foundCompany = companies.find(c => c.id === companyId);
        
        if (foundCompany) {
          setCompany(foundCompany);
          const foundPortfolio = foundCompany.portfolios.find(p => p.id === portfolioId);
          
          if (foundPortfolio) {
            setPortfolio(foundPortfolio);
          }
        }
      }
      setLoading(false);
    };

    loadData();
  }, [companyId, portfolioId]);

  const handleDeletePortfolio = () => {
    if (!company || !portfolio) return;
    
    if (window.confirm(`Are you sure you want to delete ${portfolio.name}?`)) {
      // Update company portfolios
      const updatedPortfolios = company.portfolios.filter(p => p.id !== portfolioId);
      const updatedCompany = { ...company, portfolios: updatedPortfolios };
      
      // Update company in localStorage
      const savedCompanies = localStorage.getItem('companies');
      if (savedCompanies) {
        const companies: Company[] = JSON.parse(savedCompanies);
        const updatedCompanies = companies.map(c => 
          c.id === companyId ? updatedCompany : c
        );
        
        localStorage.setItem('companies', JSON.stringify(updatedCompanies));
      }
      
      // Navigate back to company detail
      navigate(`/companies/${companyId}`);
    }
  };

  const handleDeleteContact = (contactId: string) => {
    if (!company || !portfolio) return;
    
    if (window.confirm('Are you sure you want to delete this contact?')) {
      // Remove contact
      const updatedContacts = portfolio.contacts?.filter(c => c.id !== contactId) || [];
      
      // Create updated portfolio and company
      const updatedPortfolio = { ...portfolio, contacts: updatedContacts };
      const updatedPortfolios = company.portfolios.map(p => 
        p.id === portfolioId ? updatedPortfolio : p
      );
      const updatedCompany = { ...company, portfolios: updatedPortfolios };
      
      // Update in localStorage
      const savedCompanies = localStorage.getItem('companies');
      if (savedCompanies) {
        const companies: Company[] = JSON.parse(savedCompanies);
        const updatedCompanies = companies.map(c => 
          c.id === companyId ? updatedCompany : c
        );
        
        localStorage.setItem('companies', JSON.stringify(updatedCompanies));
        setCompany(updatedCompany);
        setPortfolio(updatedPortfolio);
      }
    }
  };

  const handleDeleteDocument = (documentId: string) => {
    if (!company || !portfolio) return;
    
    if (window.confirm('Are you sure you want to delete this document?')) {
      // Remove document
      const updatedDocuments = portfolio.documents?.filter(d => d.id !== documentId) || [];
      
      // Create updated portfolio and company
      const updatedPortfolio = { ...portfolio, documents: updatedDocuments };
      const updatedPortfolios = company.portfolios.map(p => 
        p.id === portfolioId ? updatedPortfolio : p
      );
      const updatedCompany = { ...company, portfolios: updatedPortfolios };
      
      // Update in localStorage
      const savedCompanies = localStorage.getItem('companies');
      if (savedCompanies) {
        const companies: Company[] = JSON.parse(savedCompanies);
        const updatedCompanies = companies.map(c => 
          c.id === companyId ? updatedCompany : c
        );
        
        localStorage.setItem('companies', JSON.stringify(updatedCompanies));
        setCompany(updatedCompany);
        setPortfolio(updatedPortfolio);
      }
    }
  };

  const handleDeleteMetric = (metricId: string) => {
    if (!company || !portfolio) return;
    
    if (window.confirm('Are you sure you want to delete this performance metric?')) {
      // Remove metric
      const updatedMetrics = portfolio.performanceMetrics?.filter(m => m.id !== metricId) || [];
      
      // Create updated portfolio and company
      const updatedPortfolio = { ...portfolio, performanceMetrics: updatedMetrics };
      const updatedPortfolios = company.portfolios.map(p => 
        p.id === portfolioId ? updatedPortfolio : p
      );
      const updatedCompany = { ...company, portfolios: updatedPortfolios };
      
      // Update in localStorage
      const savedCompanies = localStorage.getItem('companies');
      if (savedCompanies) {
        const companies: Company[] = JSON.parse(savedCompanies);
        const updatedCompanies = companies.map(c => 
          c.id === companyId ? updatedCompany : c
        );
        
        localStorage.setItem('companies', JSON.stringify(updatedCompanies));
        setCompany(updatedCompany);
        setPortfolio(updatedPortfolio);
      }
    }
  };

  const handleDownloadDocument = (document: Document) => {
    if (!document.content) {
      alert('Document content is not available');
      return;
    }

    // Create a download link for the document
    const link = document.createElement('a');
    link.href = document.content;
    link.download = document.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Format the metrics data for the chart
  const metricsData = portfolio?.performanceMetrics?.sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  }) || [];

  if (loading) {
    return (
      <div className="flex-center min-h-[50vh]">
        <div className="space-y-3">
          <div className="skeleton-text w-1/2"></div>
          <div className="skeleton-text w-full"></div>
          <div className="skeleton-text w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!company || !portfolio) {
    return (
      <div className="card p-8 text-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Portfolio Not Found</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          The portfolio you're looking for doesn't exist or has been removed.
        </p>
        <button 
          className="btn btn-primary" 
          onClick={() => navigate(`/companies/${companyId}`)}
        >
          Back to Company
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex-between flex-col sm:flex-row gap-4">
        <div className="flex items-center">
          <button
            className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 mr-4"
            onClick={() => navigate(`/companies/${companyId}`)}
          >
            Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{portfolio.name}</h1>
          <span className={`ml-3 badge ${
            portfolio.status === 'Active' ? 'badge-success' : 
            portfolio.status === 'Exited' ? 'badge-info' :
            'badge-warning'
          }`}>
            {portfolio.status}
          </span>
        </div>
        <div className="flex gap-2">
          <button 
            className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 flex items-center gap-2" 
            onClick={() => navigate(`/companies/${companyId}/portfolios/${portfolioId}/edit`)}
          >
            <Edit size={16} /> Edit
          </button>
          <button 
            className="btn bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-800 dark:text-red-200 dark:hover:bg-red-700 flex items-center gap-2" 
            onClick={handleDeletePortfolio}
          >
            <Trash2 size={16} /> Delete
          </button>
        </div>
      </div>

      {/* Portfolio Navigation Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <ul className="flex flex-wrap -mb-px">
          <li className="mr-2">
            <button
              className={`inline-block py-4 px-4 text-sm font-medium border-b-2 ${activeTab === 'overview' ? 'text-primary-600 border-primary-600 dark:text-primary-400 dark:border-primary-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
          </li>
          <li className="mr-2">
            <button
              className={`inline-block py-4 px-4 text-sm font-medium border-b-2 ${activeTab === 'contacts' ? 'text-primary-600 border-primary-600 dark:text-primary-400 dark:border-primary-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
              onClick={() => setActiveTab('contacts')}
            >
              Contacts {portfolio.contacts?.length ? `(${portfolio.contacts.length})` : ''}
            </button>
          </li>
          <li className="mr-2">
            <button
              className={`inline-block py-4 px-4 text-sm font-medium border-b-2 ${activeTab === 'documents' ? 'text-primary-600 border-primary-600 dark:text-primary-400 dark:border-primary-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
              onClick={() => setActiveTab('documents')}
            >
              Documents {portfolio.documents?.length ? `(${portfolio.documents.length})` : ''}
            </button>
          </li>
          <li className="mr-2">
            <button
              className={`inline-block py-4 px-4 text-sm font-medium border-b-2 ${activeTab === 'metrics' ? 'text-primary-600 border-primary-600 dark:text-primary-400 dark:border-primary-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
              onClick={() => setActiveTab('metrics')}
            >
              Performance Metrics {portfolio.performanceMetrics?.length ? `(${portfolio.performanceMetrics.length})` : ''}
            </button>
          </li>
        </ul>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="stat-card">
                <div className="stat-title">Current Valuation</div>
                <div className="stat-value">${portfolio.valuation.toLocaleString()}</div>
                <div className="stat-desc">Based on latest assessment</div>
              </div>

              <div className="stat-card">
                <div className="stat-title">Funding Amount</div>
                <div className="stat-value">${portfolio.fundingAmount.toLocaleString()}</div>
                <div className="stat-desc">Initial investment</div>
              </div>

              <div className="stat-card">
                <div className="stat-title">Equity Stake</div>
                <div className="stat-value">{portfolio.equityStake}%</div>
                <div className="stat-desc">Ownership percentage</div>
              </div>
            </div>

            <div className="card">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Industry</h3>
                    <p className="mt-1 text-base text-gray-900 dark:text-white">{portfolio.industry}</p>
                  </div>
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Annual Revenue</h3>
                    <p className="mt-1 text-base text-gray-900 dark:text-white">${portfolio.revenue.toLocaleString()}</p>
                  </div>
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Investment Date</h3>
                    <p className="mt-1 text-base text-gray-900 dark:text-white">{portfolio.investmentDate}</p>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</h3>
                <div className="mt-1 text-base text-gray-900 dark:text-white prose dark:prose-invert max-w-none">
                  <p>{portfolio.description}</p>
                </div>
              </div>
            </div>

            {portfolio.performanceMetrics && portfolio.performanceMetrics.length > 0 && (
              <div className="card">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <BarChartIcon size={18} /> Performance Overview
                </h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={metricsData.map(metric => ({
                        date: metric.date,
                        revenue: metric.revenue,
                        profit: metric.profit,
                        cashFlow: metric.cashFlow,
                      }))}
                      margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        angle={-45} 
                        textAnchor="end" 
                        height={70} 
                        interval={0}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        tickFormatter={(value) => `$${value.toLocaleString()}`}
                      />
                      <Tooltip 
                        formatter={(value) => [`$${(value as number).toLocaleString()}`]}
                      />
                      <Legend />
                      <Bar dataKey="revenue" name="Revenue" fill="#0088FE" />
                      <Bar dataKey="profit" name="Profit" fill="#00C49F" />
                      <Bar dataKey="cashFlow" name="Cash Flow" fill="#FFBB28" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Contacts Tab */}
        {activeTab === 'contacts' && (
          <div className="space-y-6">
            <div className="flex-between">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Contacts</h2>
              <button 
                className="btn btn-primary flex items-center gap-2" 
                onClick={() => navigate(`/companies/${companyId}/portfolios/${portfolioId}/contacts/add`)}
              >
                <Plus size={16} /> Add Contact
              </button>
            </div>

            {portfolio.contacts && portfolio.contacts.length > 0 ? (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th className="table-header">Name</th>
                      <th className="table-header">Role</th>
                      <th className="table-header">Email</th>
                      <th className="table-header hidden md:table-cell">Phone</th>
                      <th className="table-header">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolio.contacts.map((contact) => (
                      <tr key={contact.id}>
                        <td className="table-cell font-medium text-gray-900 dark:text-white">{contact.name}</td>
                        <td className="table-cell">{contact.role}</td>
                        <td className="table-cell">{contact.email}</td>
                        <td className="table-cell hidden md:table-cell">{contact.phone}</td>
                        <td className="table-cell">
                          <button
                            className="btn-icon text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                            onClick={() => handleDeleteContact(contact.id)}
                            aria-label="Delete contact"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="card p-8 text-center">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Contacts Yet</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Add contacts for this portfolio to keep track of key people.
                </p>
                <button 
                  className="btn btn-primary inline-flex items-center gap-2" 
                  onClick={() => navigate(`/companies/${companyId}/portfolios/${portfolioId}/contacts/add`)}
                >
                  <Plus size={16} /> Add Contact
                </button>
              </div>
            )}
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div className="space-y-6">
            <div className="flex-between">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Documents</h2>
              <button 
                className="btn btn-primary flex items-center gap-2" 
                onClick={() => navigate(`/companies/${companyId}/portfolios/${portfolioId}/documents/add`)}
              >
                <Plus size={16} /> Add Document
              </button>
            </div>

            {portfolio.documents && portfolio.documents.length > 0 ? (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th className="table-header">Name</th>
                      <th className="table-header">Type</th>
                      <th className="table-header hidden md:table-cell">Upload Date</th>
                      <th className="table-header hidden md:table-cell">Size</th>
                      <th className="table-header">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolio.documents.map((document) => (
                      <tr key={document.id}>
                        <td className="table-cell font-medium text-gray-900 dark:text-white">{document.name}</td>
                        <td className="table-cell">{document.type}</td>
                        <td className="table-cell hidden md:table-cell">{document.uploadDate}</td>
                        <td className="table-cell hidden md:table-cell">{document.size}</td>
                        <td className="table-cell">
                          <div className="flex-start gap-2">
                            {document.content && (
                              <button
                                className="btn-icon text-primary-500 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                                onClick={() => handleDownloadDocument(document)}
                                aria-label="Download document"
                              >
                                <Download size={16} />
                              </button>
                            )}
                            <button
                              className="btn-icon text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                              onClick={() => handleDeleteDocument(document.id)}
                              aria-label="Delete document"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="card p-8 text-center">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Documents Yet</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Upload documents related to this portfolio for easy access.
                </p>
                <button 
                  className="btn btn-primary inline-flex items-center gap-2" 
                  onClick={() => navigate(`/companies/${companyId}/portfolios/${portfolioId}/documents/add`)}
                >
                  <Plus size={16} /> Add Document
                </button>
              </div>
            )}
          </div>
        )}

        {/* Performance Metrics Tab */}
        {activeTab === 'metrics' && (
          <div className="space-y-6">
            <div className="flex-between">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Performance Metrics</h2>
              <button 
                className="btn btn-primary flex items-center gap-2" 
                onClick={() => navigate(`/companies/${companyId}/portfolios/${portfolioId}/metrics/add`)}
              >
                <Plus size={16} /> Add Metric
              </button>
            </div>

            {portfolio.performanceMetrics && portfolio.performanceMetrics.length > 0 ? (
              <>
                <div className="card mb-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <BarChartIcon size={18} /> Performance Over Time
                  </h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={metricsData.map(metric => ({
                          date: metric.date,
                          revenue: metric.revenue,
                          profit: metric.profit,
                          cashFlow: metric.cashFlow,
                        }))}
                        margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          angle={-45} 
                          textAnchor="end" 
                          height={70} 
                          interval={0}
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis 
                          tickFormatter={(value) => `$${value.toLocaleString()}`}
                        />
                        <Tooltip 
                          formatter={(value) => [`$${(value as number).toLocaleString()}`]}
                        />
                        <Legend />
                        <Bar dataKey="revenue" name="Revenue" fill="#0088FE" />
                        <Bar dataKey="profit" name="Profit" fill="#00C49F" />
                        <Bar dataKey="cashFlow" name="Cash Flow" fill="#FFBB28" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th className="table-header">Date</th>
                        <th className="table-header">Revenue</th>
                        <th className="table-header">Profit</th>
                        <th className="table-header hidden md:table-cell">Cash Flow</th>
                        <th className="table-header hidden md:table-cell">Employee Count</th>
                        <th className="table-header">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {portfolio.performanceMetrics.map((metric) => (
                        <tr key={metric.id}>
                          <td className="table-cell font-medium text-gray-900 dark:text-white">{metric.date}</td>
                          <td className="table-cell">${metric.revenue.toLocaleString()}</td>
                          <td className="table-cell">${metric.profit.toLocaleString()}</td>
                          <td className="table-cell hidden md:table-cell">${metric.cashFlow.toLocaleString()}</td>
                          <td className="table-cell hidden md:table-cell">{metric.employeeCount}</td>
                          <td className="table-cell">
                            <button
                              className="btn-icon text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                              onClick={() => handleDeleteMetric(metric.id)}
                              aria-label="Delete metric"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="card p-8 text-center">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Performance Metrics Yet</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Add performance metrics to track the growth of this portfolio over time.
                </p>
                <button 
                  className="btn btn-primary inline-flex items-center gap-2" 
                  onClick={() => navigate(`/companies/${companyId}/portfolios/${portfolioId}/metrics/add`)}
                >
                  <Plus size={16} /> Add Metric
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Add Contact Component
const AddContact: React.FC = () => {
  const { companyId, portfolioId } = useParams<{ companyId: string; portfolioId: string }>();
  const { register, handleSubmit, formState: { errors } } = useForm<ContactFormData>();
  const [company, setCompany] = useState<Company | null>(null);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Load company and portfolio data from localStorage
    const loadData = () => {
      const savedCompanies = localStorage.getItem('companies');
      if (savedCompanies && companyId && portfolioId) {
        const companies: Company[] = JSON.parse(savedCompanies);
        const foundCompany = companies.find(c => c.id === companyId);
        
        if (foundCompany) {
          setCompany(foundCompany);
          const foundPortfolio = foundCompany.portfolios.find(p => p.id === portfolioId);
          
          if (foundPortfolio) {
            setPortfolio(foundPortfolio);
          }
        }
      }
      setLoading(false);
    };

    loadData();
  }, [companyId, portfolioId]);

  const onSubmit: SubmitHandler<ContactFormData> = (data) => {
    if (!company || !portfolio) return;

    // Create new contact
    const newContact: Contact = {
      id: crypto.randomUUID(),
      name: data.name,
      role: data.role,
      email: data.email,
      phone: data.phone,
    };

    // Add contact to portfolio
    const updatedContacts = [...(portfolio.contacts || []), newContact];
    const updatedPortfolio = { ...portfolio, contacts: updatedContacts };
    
    // Update portfolio in company
    const updatedPortfolios = company.portfolios.map(p => 
      p.id === portfolioId ? updatedPortfolio : p
    );
    const updatedCompany = { ...company, portfolios: updatedPortfolios };
    
    // Update in localStorage
    const savedCompanies = localStorage.getItem('companies');
    if (savedCompanies) {
      const companies: Company[] = JSON.parse(savedCompanies);
      const updatedCompanies = companies.map(c => 
        c.id === companyId ? updatedCompany : c
      );
      
      localStorage.setItem('companies', JSON.stringify(updatedCompanies));
    }

    // Navigate back to portfolio detail
    navigate(`/companies/${companyId}/portfolios/${portfolioId}?tab=contacts`);
  };

  if (loading) {
    return (
      <div className="flex-center min-h-[50vh]">
        <div className="space-y-3">
          <div className="skeleton-text w-1/2"></div>
          <div className="skeleton-text w-full"></div>
          <div className="skeleton-text w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!company || !portfolio) {
    return (
      <div className="card p-8 text-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Portfolio Not Found</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          The portfolio you're trying to add a contact to doesn't exist or has been removed.
        </p>
        <button 
          className="btn btn-primary" 
          onClick={() => navigate(`/companies/${companyId}`)}
        >
          Back to Company
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center mb-6">
        <button
          className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 mr-4"
          onClick={() => navigate(`/companies/${companyId}/portfolios/${portfolioId}?tab=contacts`)}
        >
          Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Contact</h1>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="form-group">
            <label htmlFor="name" className="form-label">Name</label>
            <input
              id="name"
              type="text"
              className={`input ${errors.name ? 'input-error' : ''}`}
              {...register('name', { required: 'Name is required' })}
            />
            {errors.name && <p className="form-error">{errors.name.message}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="role" className="form-label">Role</label>
            <input
              id="role"
              type="text"
              className={`input ${errors.role ? 'input-error' : ''}`}
              {...register('role', { required: 'Role is required' })}
            />
            {errors.role && <p className="form-error">{errors.role.message}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              id="email"
              type="email"
              className={`input ${errors.email ? 'input-error' : ''}`}
              {...register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
            />
            {errors.email && <p className="form-error">{errors.email.message}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="phone" className="form-label">Phone</label>
            <input
              id="phone"
              type="tel"
              className={`input ${errors.phone ? 'input-error' : ''}`}
              {...register('phone', { required: 'Phone number is required' })}
            />
            {errors.phone && <p className="form-error">{errors.phone.message}</p>}
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              onClick={() => navigate(`/companies/${companyId}/portfolios/${portfolioId}?tab=contacts`)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary flex items-center gap-2">
              <Save size={16} /> Save Contact
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Add Document Component
const AddDocument: React.FC = () => {
  const { companyId, portfolioId } = useParams<{ companyId: string; portfolioId: string }>();
  const { register, handleSubmit, formState: { errors } } = useForm<DocumentFormData>();
  const [company, setCompany] = useState<Company | null>(null);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Load company and portfolio data from localStorage
    const loadData = () => {
      const savedCompanies = localStorage.getItem('companies');
      if (savedCompanies && companyId && portfolioId) {
        const companies: Company[] = JSON.parse(savedCompanies);
        const foundCompany = companies.find(c => c.id === companyId);
        
        if (foundCompany) {
          setCompany(foundCompany);
          const foundPortfolio = foundCompany.portfolios.find(p => p.id === portfolioId);
          
          if (foundPortfolio) {
            setPortfolio(foundPortfolio);
          }
        }
      }
      setLoading(false);
    };

    loadData();
  }, [companyId, portfolioId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const onSubmit: SubmitHandler<DocumentFormData> = (data) => {
    if (!company || !portfolio || !file) return;

    // Create a FileReader to read the file as a Data URL
    const reader = new FileReader();
    reader.onloadend = () => {
      // Create new document
      const newDocument: Document = {
        id: crypto.randomUUID(),
        name: data.name,
        type: data.type || file.type,
        uploadDate: format(new Date(), 'yyyy-MM-dd'),
        size: formatFileSize(file.size),
        content: reader.result?.toString() || '',
      };

      // Add document to portfolio
      const updatedDocuments = [...(portfolio.documents || []), newDocument];
      const updatedPortfolio = { ...portfolio, documents: updatedDocuments };
      
      // Update portfolio in company
      const updatedPortfolios = company.portfolios.map(p => 
        p.id === portfolioId ? updatedPortfolio : p
      );
      const updatedCompany = { ...company, portfolios: updatedPortfolios };
      
      // Update in localStorage
      const savedCompanies = localStorage.getItem('companies');
      if (savedCompanies) {
        const companies: Company[] = JSON.parse(savedCompanies);
        const updatedCompanies = companies.map(c => 
          c.id === companyId ? updatedCompany : c
        );
        
        localStorage.setItem('companies', JSON.stringify(updatedCompanies));
      }

      // Navigate back to portfolio detail
      navigate(`/companies/${companyId}/portfolios/${portfolioId}?tab=documents`);
    };

    // Read the file as a Data URL
    reader.readAsDataURL(file);
  };

  // Helper function to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  // Download template document
  const downloadTemplate = () => {
    // Create a simple text file as a template
    const templateContent = {
      portfolioName: portfolio?.name || '',
      date: format(new Date(), 'yyyy-MM-dd'),
      fields: [
        'Financial Data',
        'Market Analysis',
        'Risk Assessment',
        'Growth Projections',
        'Operational Overview',
      ],
      note: 'This is a template for portfolio documentation.'
    };

    const blob = new Blob([JSON.stringify(templateContent, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'portfolio_document_template.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex-center min-h-[50vh]">
        <div className="space-y-3">
          <div className="skeleton-text w-1/2"></div>
          <div className="skeleton-text w-full"></div>
          <div className="skeleton-text w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!company || !portfolio) {
    return (
      <div className="card p-8 text-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Portfolio Not Found</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          The portfolio you're trying to add a document to doesn't exist or has been removed.
        </p>
        <button 
          className="btn btn-primary" 
          onClick={() => navigate(`/companies/${companyId}`)}
        >
          Back to Company
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center mb-6">
        <button
          className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 mr-4"
          onClick={() => navigate(`/companies/${companyId}/portfolios/${portfolioId}?tab=documents`)}
        >
          Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Document</h1>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="mb-4">
            <button
              type="button"
              className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 flex items-center gap-2"
              onClick={downloadTemplate}
            >
              <Download size={16} /> Download Template
            </button>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Download a template to see the expected format for documentation.
            </p>
          </div>

          <div className="form-group">
            <label htmlFor="name" className="form-label">Document Name</label>
            <input
              id="name"
              type="text"
              className={`input ${errors.name ? 'input-error' : ''}`}
              {...register('name', { required: 'Document name is required' })}
            />
            {errors.name && <p className="form-error">{errors.name.message}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="type" className="form-label">Document Type</label>
            <select
              id="type"
              className={`input ${errors.type ? 'input-error' : ''}`}
              {...register('type', { required: 'Document type is required' })}
            >
              <option value="Financial Report">Financial Report</option>
              <option value="Legal Document">Legal Document</option>
              <option value="Market Analysis">Market Analysis</option>
              <option value="Business Plan">Business Plan</option>
              <option value="Contract">Contract</option>
              <option value="Other">Other</option>
            </select>
            {errors.type && <p className="form-error">{errors.type.message}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="file" className="form-label">Upload File</label>
            <input
              id="file"
              type="file"
              className={`input p-2 ${!file ? 'input-error' : ''}`}
              onChange={handleFileChange}
              required
            />
            {!file && <p className="form-error">Please select a file</p>}
            {file && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Selected file: {file.name} ({formatFileSize(file.size)})
              </p>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              onClick={() => navigate(`/companies/${companyId}/portfolios/${portfolioId}?tab=documents`)}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary flex items-center gap-2"
              disabled={!file}
            >
              <Upload size={16} /> Upload Document
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Add Performance Metric Component
const AddPerformanceMetric: React.FC = () => {
  const { companyId, portfolioId } = useParams<{ companyId: string; portfolioId: string }>();
  const { register, handleSubmit, formState: { errors } } = useForm<PerformanceMetricFormData>();
  const [company, setCompany] = useState<Company | null>(null);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Load company and portfolio data from localStorage
    const loadData = () => {
      const savedCompanies = localStorage.getItem('companies');
      if (savedCompanies && companyId && portfolioId) {
        const companies: Company[] = JSON.parse(savedCompanies);
        const foundCompany = companies.find(c => c.id === companyId);
        
        if (foundCompany) {
          setCompany(foundCompany);
          const foundPortfolio = foundCompany.portfolios.find(p => p.id === portfolioId);
          
          if (foundPortfolio) {
            setPortfolio(foundPortfolio);
          }
        }
      }
      setLoading(false);
    };

    loadData();
  }, [companyId, portfolioId]);

  const onSubmit: SubmitHandler<PerformanceMetricFormData> = (data) => {
    if (!company || !portfolio) return;

    // Create new performance metric
    const newMetric: PerformanceMetric = {
      id: crypto.randomUUID(),
      date: data.date,
      revenue: Number(data.revenue),
      profit: Number(data.profit),
      cashFlow: Number(data.cashFlow),
      employeeCount: Number(data.employeeCount),
    };

    // Add metric to portfolio
    const updatedMetrics = [...(portfolio.performanceMetrics || []), newMetric];
    const updatedPortfolio = { ...portfolio, performanceMetrics: updatedMetrics };
    
    // Update portfolio in company
    const updatedPortfolios = company.portfolios.map(p => 
      p.id === portfolioId ? updatedPortfolio : p
    );
    const updatedCompany = { ...company, portfolios: updatedPortfolios };
    
    // Update in localStorage
    const savedCompanies = localStorage.getItem('companies');
    if (savedCompanies) {
      const companies: Company[] = JSON.parse(savedCompanies);
      const updatedCompanies = companies.map(c => 
        c.id === companyId ? updatedCompany : c
      );
      
      localStorage.setItem('companies', JSON.stringify(updatedCompanies));
    }

    // Navigate back to portfolio detail
    navigate(`/companies/${companyId}/portfolios/${portfolioId}?tab=metrics`);
  };

  if (loading) {
    return (
      <div className="flex-center min-h-[50vh]">
        <div className="space-y-3">
          <div className="skeleton-text w-1/2"></div>
          <div className="skeleton-text w-full"></div>
          <div className="skeleton-text w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!company || !portfolio) {
    return (
      <div className="card p-8 text-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Portfolio Not Found</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          The portfolio you're trying to add a metric to doesn't exist or has been removed.
        </p>
        <button 
          className="btn btn-primary" 
          onClick={() => navigate(`/companies/${companyId}`)}
        >
          Back to Company
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center mb-6">
        <button
          className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 mr-4"
          onClick={() => navigate(`/companies/${companyId}/portfolios/${portfolioId}?tab=metrics`)}
        >
          Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add Performance Metric</h1>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="form-group">
            <label htmlFor="date" className="form-label">Date</label>
            <input
              id="date"
              type="date"
              className={`input ${errors.date ? 'input-error' : ''}`}
              {...register('date', { required: 'Date is required' })}
            />
            {errors.date && <p className="form-error">{errors.date.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group">
              <label htmlFor="revenue" className="form-label">Revenue ($)</label>
              <input
                id="revenue"
                type="number"
                className={`input ${errors.revenue ? 'input-error' : ''}`}
                {...register('revenue', { 
                  required: 'Revenue is required', 
                  min: { value: 0, message: 'Revenue must be a positive number' } 
                })}
              />
              {errors.revenue && <p className="form-error">{errors.revenue.message}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="profit" className="form-label">Profit ($)</label>
              <input
                id="profit"
                type="number"
                className={`input ${errors.profit ? 'input-error' : ''}`}
                {...register('profit', { 
                  required: 'Profit is required'
                })}
              />
              {errors.profit && <p className="form-error">{errors.profit.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group">
              <label htmlFor="cashFlow" className="form-label">Cash Flow ($)</label>
              <input
                id="cashFlow"
                type="number"
                className={`input ${errors.cashFlow ? 'input-error' : ''}`}
                {...register('cashFlow', { 
                  required: 'Cash flow is required'
                })}
              />
              {errors.cashFlow && <p className="form-error">{errors.cashFlow.message}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="employeeCount" className="form-label">Employee Count</label>
              <input
                id="employeeCount"
                type="number"
                className={`input ${errors.employeeCount ? 'input-error' : ''}`}
                {...register('employeeCount', { 
                  required: 'Employee count is required', 
                  min: { value: 0, message: 'Employee count must be a positive number' } 
                })}
              />
              {errors.employeeCount && <p className="form-error">{errors.employeeCount.message}</p>}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              onClick={() => navigate(`/companies/${companyId}/portfolios/${portfolioId}?tab=metrics`)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary flex items-center gap-2">
              <Save size={16} /> Save Metric
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default App;
