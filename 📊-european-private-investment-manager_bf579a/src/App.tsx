import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { format, parseISO, isValid } from 'date-fns';
import { 
  Plus, Edit, Trash2, Search, Filter, Upload, Download, Sun, Moon, X, ArrowUpDown, AreaChart, PieChart, ChevronDown, ChevronUp 
} from 'lucide-react';
import { Chart, registerables } from 'chart.js';
import styles from './styles/styles.module.css';

// Register Chart.js components
Chart.register(...registerables);

// --- Enums & Types --- //

enum AssetClass {
  PrivateEquity = "Private Equity",
  VentureCapital = "Venture Capital",
  RealEstate = "Real Estate",
  Debt = "Debt",
  Infrastructure = "Infrastructure",
}

enum Region {
  UK = "United Kingdom",
  Germany = "Germany",
  France = "France",
  Nordics = "Nordics",
  Benelux = "Benelux",
  SouthernEurope = "Southern Europe",
  CEE = "Central & Eastern Europe",
}

enum InvestmentStatus {
  Active = "Active",
  Exited = "Exited",
  Pending = "Pending",
}

interface Investment {
  id: string;
  name: string;
  assetClass: AssetClass;
  region: Region;
  investmentDate: string; // Store as ISO string (YYYY-MM-DD)
  investedAmount: number;
  currentValue: number;
  status: InvestmentStatus;
}

type InvestmentFormData = Omit<Investment, 'id'>;

type SortField = keyof Investment;
type SortDirection = 'asc' | 'desc';

interface SortConfig {
  field: SortField | null;
  direction: SortDirection;
}

// --- Main Application Component --- //

function App() {
  // --- State --- //
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      return savedMode === 'true' || (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterCriteria, setFilterCriteria] = useState<{ assetClass: string; region: string; status: string }>({ assetClass: '', region: '', status: '' });
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'name', direction: 'asc' });
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [importData, setImportData] = useState<string>('');
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // --- Chart Refs --- //
  const valueByAssetClassChartRef = useRef<HTMLCanvasElement>(null);
  const valueByRegionChartRef = useRef<HTMLCanvasElement>(null);
  const chartsRef = useRef<{ [key: string]: Chart | null }>({});

  // --- Effects --- //

  // Load data from local storage on mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('investments_data');
      if (savedData) {
        setInvestments(JSON.parse(savedData));
      }
    } catch (err) {
      console.error("Error loading data from local storage:", err);
      setError("Failed to load investment data. Please clear local storage or contact support.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save data to local storage on change
  useEffect(() => {
    if (!isLoading) { // Don't save during initial load
      try {
        localStorage.setItem('investments_data', JSON.stringify(investments));
      } catch (err) {
        console.error("Error saving data to local storage:", err);
        setError("Failed to save investment data.");
      }
    }
  }, [investments, isLoading]);

  // Apply dark mode class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  // --- Data Processing & Filtering/Sorting --- //

  const filteredInvestments = useMemo(() => {
    return investments
      .filter(inv => 
        inv.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (filterCriteria.assetClass === '' || inv.assetClass === filterCriteria.assetClass) &&
        (filterCriteria.region === '' || inv.region === filterCriteria.region) &&
        (filterCriteria.status === '' || inv.status === filterCriteria.status)
      );
  }, [investments, searchTerm, filterCriteria]);

  const sortedInvestments = useMemo(() => {
    if (!sortConfig.field) return filteredInvestments;

    return [...filteredInvestments].sort((a, b) => {
      const aValue = a[sortConfig.field!];
      const bValue = b[sortConfig.field!];

      let comparison = 0;
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      } else if (sortConfig.field === 'investmentDate') {
        comparison = new Date(aValue as string).getTime() - new Date(bValue as string).getTime();
      }

      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [filteredInvestments, sortConfig]);

  // --- Handlers --- //

  const handleAddInvestment = () => {
    setEditingInvestment(null);
    setIsModalOpen(true);
  };

  const handleEditInvestment = (investment: Investment) => {
    setEditingInvestment(investment);
    setIsModalOpen(true);
  };

  const handleDeleteInvestment = (id: string) => {
    if (window.confirm('Are you sure you want to delete this investment?')) {
      setInvestments(prev => prev.filter(inv => inv.id !== id));
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingInvestment(null);
  };

  const handleFormSubmit: SubmitHandler<InvestmentFormData> = (data) => {
    const investmentData = {
        ...data,
        investedAmount: Number(data.investedAmount),
        currentValue: Number(data.currentValue),
    };

    if (editingInvestment) {
      setInvestments(prev => prev.map(inv => inv.id === editingInvestment.id ? { ...investmentData, id: inv.id } : inv));
    } else {
      const newInvestment: Investment = {
        ...investmentData,
        id: Date.now().toString(36) + Math.random().toString(36).substring(2), // Simple unique enough ID
      };
      setInvestments(prev => [...prev, newInvestment]);
    }
    handleModalClose();
  };

  const handleSort = (field: SortField) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleImportClick = () => {
    setImportData('');
    setIsImportModalOpen(true);
  };

  const handleImportModalClose = () => {
    setIsImportModalOpen(false);
    setImportData('');
  };

  const handleImportSubmit = () => {
    if (!importData.trim()) {
      alert('Please paste data into the text area.');
      return;
    }
    // Basic CSV parsing simulation (assumes Name, AssetClass, Region, Date(YYYY-MM-DD), Invested, Current, Status)
    const lines = importData.trim().split('\n');
    const newInvestments: Investment[] = [];
    const errors: string[] = [];

    lines.forEach((line, index) => {
      const values = line.split(',').map(v => v.trim());
      if (values.length !== 7) {
        errors.push(`Line ${index + 1}: Invalid number of columns (expected 7).`);
        return;
      }
      
      const [name, assetClassStr, regionStr, dateStr, investedStr, currentStr, statusStr] = values;

      const investedAmount = parseFloat(investedStr);
      const currentValue = parseFloat(currentStr);
      const investmentDate = parseISO(dateStr); // Expects YYYY-MM-DD

      // Basic Validation
      if (!name) errors.push(`Line ${index + 1}: Name is missing.`);
      if (!Object.hasOwnProperty.call(AssetClass, assetClassStr)) errors.push(`Line ${index + 1}: Invalid Asset Class '${assetClassStr}'. Valid: ${Object.values(AssetClass).join(', ')}.`);
      if (!Object.hasOwnProperty.call(Region, regionStr)) errors.push(`Line ${index + 1}: Invalid Region '${regionStr}'. Valid: ${Object.values(Region).join(', ')}.`);
      if (!isValid(investmentDate)) errors.push(`Line ${index + 1}: Invalid Date format '${dateStr}'. Use YYYY-MM-DD.`);
      if (isNaN(investedAmount)) errors.push(`Line ${index + 1}: Invalid Invested Amount '${investedStr}'.`);
      if (isNaN(currentValue)) errors.push(`Line ${index + 1}: Invalid Current Value '${currentStr}'.`);
      if (!Object.hasOwnProperty.call(InvestmentStatus, statusStr)) errors.push(`Line ${index + 1}: Invalid Status '${statusStr}'. Valid: ${Object.values(InvestmentStatus).join(', ')}.`);

      if (errors.length === 0) { // Only add if no errors for this line (in a real app, you might collect all errors first)
          newInvestments.push({
              id: Date.now().toString(36) + Math.random().toString(36).substring(2) + index,
              name,
              assetClass: assetClassStr as AssetClass,
              region: regionStr as Region,
              investmentDate: format(investmentDate, 'yyyy-MM-dd'),
              investedAmount,
              currentValue,
              status: statusStr as InvestmentStatus,
          });
      }
    });

    if (errors.length > 0) {
      alert(`Import errors:\n${errors.join('\n')}`);
    } else if (newInvestments.length > 0) {
      setInvestments(prev => [...prev, ...newInvestments]);
      handleImportModalClose();
      alert(`${newInvestments.length} investments imported successfully!`);
    } else {
      alert('No valid investments found in the provided data.');
    }
  };

  const handleExport = () => {
    if (investments.length === 0) {
      alert('No investments to export.');
      return;
    }
    // Generate CSV content
    const header = Object.keys(investments[0]).join(',') + '\n';
    const csvContent = investments.map(inv => Object.values(inv).join(',')).join('\n');
    const fullCsv = header + csvContent;

    // Create a Blob and trigger download
    const blob = new Blob([fullCsv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) { // Feature detection
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `investments_export_${format(new Date(), 'yyyyMMdd')}.csv`);
      link.style.visibility = 'hidden'
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // --- Chart Generation Functions --- //

  const generateValueByAssetClassChart = useCallback(() => {
    if (!valueByAssetClassChartRef.current) return;

    const assetClassValues: { [key in AssetClass]: number } = Object.values(AssetClass).reduce((acc, assetClass) => {
      acc[assetClass] = 0;
      return acc;
    }, {} as { [key in AssetClass]: number });

    sortedInvestments.forEach(inv => {
      assetClassValues[inv.assetClass] += inv.currentValue;
    });

    const labels = Object.keys(assetClassValues);
    const data = Object.values(assetClassValues);

    if (chartsRef.current['valueByAssetClassChart']) {
      chartsRef.current['valueByAssetClassChart']!.destroy();
    }

    chartsRef.current['valueByAssetClassChart'] = new Chart(valueByAssetClassChartRef.current, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          label: 'Current Value by Asset Class',
          data: data,
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
            'rgba(255, 159, 64, 0.6)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Current Value by Asset Class',
          }
        }
      }
    });
  }, [sortedInvestments]);

  const generateValueByRegionChart = useCallback(() => {
    if (!valueByRegionChartRef.current) return;

    const regionValues: { [key in Region]: number } = Object.values(Region).reduce((acc, region) => {
      acc[region] = 0;
      return acc;
    }, {} as { [key in Region]: number });

    sortedInvestments.forEach(inv => {
      regionValues[inv.region] += inv.currentValue;
    });

    const labels = Object.keys(regionValues);
    const data = Object.values(regionValues);

    if (chartsRef.current['valueByRegionChart']) {
      chartsRef.current['valueByRegionChart']!.destroy();
    }

    chartsRef.current['valueByRegionChart'] = new Chart(valueByRegionChartRef.current, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Current Value by Region',
          data: data,
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
            'rgba(255, 159, 64, 0.6)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Current Value by Region',
          },
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }, [sortedInvestments]);

  useEffect(() => {
    generateValueByAssetClassChart();
    generateValueByRegionChart();

    return () => {
      // Cleanup charts on unmount
      if (chartsRef.current) {
        Object.values(chartsRef.current).forEach(chart => {
          chart?.destroy();
        });
      }
    };
  }, [generateValueByAssetClassChart, generateValueByRegionChart]);

  // --- Render --- //

  return (
    <div className={`${styles.appContainer} ${isDarkMode ? styles.darkMode : ''}`}>
      {/* Dark Mode Toggle */}
      <button className={styles.darkModeToggle} onClick={() => setIsDarkMode(!isDarkMode)}>
        {isDarkMode ? <Sun /> : <Moon />}
      </button>

      {/* Header */}
      <header className={styles.header}>
        <h1>Investment Portfolio</h1>
        <div className={styles.headerActions}>
          <button className={styles.primaryButton} onClick={handleAddInvestment}>
            <Plus /> Add Investment
          </button>
          <button className={styles.importButton} onClick={handleImportClick}>
            <Upload /> Import CSV
          </button>
          <button className={styles.exportButton} onClick={handleExport}>
            <Download /> Export CSV
          </button>
        </div>
      </header>

      {/* Search and Filter Bar */}
      <div className={styles.searchFilterBar}>
        <div className={styles.searchBar}>
          <Search className={styles.searchIcon} />
          <input
            type="search"
            placeholder="Search investments..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <button className={styles.filterButton} onClick={() => setShowFilters(!showFilters)}>
          <Filter /> Filters {showFilters ? <ChevronUp /> : <ChevronDown />}
        </button>
      </div>

      {/* Filter Options (conditionally rendered) */}
      {showFilters && (
        <div className={styles.filterOptions}>
          <select value={filterCriteria.assetClass} onChange={e => setFilterCriteria(prev => ({ ...prev, assetClass: e.target.value }))}>
            <option value="">All Asset Classes</option>
            {Object.values(AssetClass).map(ac => (<option key={ac} value={ac}>{ac}</option>))}
          </select>

          <select value={filterCriteria.region} onChange={e => setFilterCriteria(prev => ({ ...prev, region: e.target.value }))}>
            <option value="">All Regions</option>
            {Object.values(Region).map(r => (<option key={r} value={r}>{r}</option>))}
          </select>

          <select value={filterCriteria.status} onChange={e => setFilterCriteria(prev => ({ ...prev, status: e.target.value }))}>
            <option value="">All Statuses</option>
            {Object.values(InvestmentStatus).map(s => (<option key={s} value={s}>{s}</option>))}
          </select>

          <button className={styles.clearFiltersButton} onClick={() => setFilterCriteria({ assetClass: '', region: '', status: '' })}>Clear Filters</button>
        </div>
      )}

      {/* Error Message */}
      {error && <div className={styles.error}>{error}</div>}

      {/* Loading Spinner */}
      {isLoading && <div className={styles.loading}>Loading investments...</div>}

      {/* Investment List Table */}
      {!isLoading && (
        <div className={styles.tableContainer}>
          <table className={styles.investmentTable}>
            <thead>
              <tr>
                <th onClick={() => handleSort('name')}>Name <ArrowUpDown /></th>
                <th onClick={() => handleSort('assetClass')}>Asset Class <ArrowUpDown /></th>
                <th onClick={() => handleSort('region')}>Region <ArrowUpDown /></th>
                <th onClick={() => handleSort('investmentDate')}>Investment Date <ArrowUpDown /></th>
                <th onClick={() => handleSort('investedAmount')}>Invested Amount <ArrowUpDown /></th>
                <th onClick={() => handleSort('currentValue')}>Current Value <ArrowUpDown /></th>
                <th onClick={() => handleSort('status')}>Status <ArrowUpDown /></th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedInvestments.map(investment => (
                <tr key={investment.id}>
                  <td>{investment.name}</td>
                  <td>{investment.assetClass}</td>
                  <td>{investment.region}</td>
                  <td>{format(parseISO(investment.investmentDate), 'yyyy-MM-dd')}</td>
                  <td>{investment.investedAmount}</td>
                  <td>{investment.currentValue}</td>
                  <td>{investment.status}</td>
                  <td>
                    <button className={styles.editButton} onClick={() => handleEditInvestment(investment)}><Edit /></button>
                    <button className={styles.deleteButton} onClick={() => handleDeleteInvestment(investment.id)}><Trash2 /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {sortedInvestments.length === 0 && (<div className={styles.noInvestments}>No investments found.</div>)}
        </div>
      )}

      {/* Charts */}
      <div className={styles.chartsContainer}>
        <div className={styles.chart}>
          <canvas ref={valueByAssetClassChartRef} width={400} height={400}></canvas>
        </div>
        <div className={styles.chart}>
          <canvas ref={valueByRegionChartRef} width={400} height={400}></canvas>
        </div>
      </div>

      {/* Investment Modal */}
      {isModalOpen && <InvestmentModal isOpen={isModalOpen} onClose={handleModalClose} onSubmit={handleFormSubmit} editingInvestment={editingInvestment} />}

      {/* Import Modal */}
      {isImportModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>Import Investments from CSV</h2>
              <button className={styles.closeButton} onClick={handleImportModalClose}><X /></button>
            </div>
            <div className={styles.modalBody}>
              <p>Paste your CSV data below (Name, AssetClass, Region, Date(YYYY-MM-DD), Invested, Current, Status):</p>
              <textarea
                value={importData}
                onChange={e => setImportData(e.target.value)}
                placeholder="Name,AssetClass,Region,InvestmentDate,InvestedAmount,CurrentValue,Status\nInvestment 1,Private Equity,UK,2023-01-01,100000,110000,Active"
                className={styles.importTextarea}
              />
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.secondaryButton} onClick={handleImportModalClose}>Cancel</button>
              <button className={styles.primaryButton} onClick={handleImportSubmit}>Import</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Investment Modal Component --- //

interface InvestmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: SubmitHandler<InvestmentFormData>;
  editingInvestment: Investment | null;
}

const InvestmentModal: React.FC<InvestmentModalProps> = ({ isOpen, onClose, onSubmit, editingInvestment }) => {
  const { register, handleSubmit, control, formState: { errors } } = useForm<InvestmentFormData>({
    defaultValues: editingInvestment || {
      name: '',
      assetClass: AssetClass.PrivateEquity,
      region: Region.UK,
      investmentDate: format(new Date(), 'yyyy-MM-dd'),
      investedAmount: 0,
      currentValue: 0,
      status: InvestmentStatus.Active,
    },
  });

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>{editingInvestment ? 'Edit Investment' : 'Add Investment'}</h2>
          <button className={styles.closeButton} onClick={onClose}><X /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className={styles.modalBody}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Name</label>
            <input type="text" id="name" {...register('name', { required: 'Name is required' })} className={styles.formControl} />
            {errors.name && <p className={styles.error}>{errors.name.message}</p>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="assetClass">Asset Class</label>
            <select id="assetClass" {...register('assetClass', { required: 'Asset Class is required' })} className={styles.formControl}>
              {Object.values(AssetClass).map(ac => (<option key={ac} value={ac}>{ac}</option>))}
            </select>
            {errors.assetClass && <p className={styles.error}>{errors.assetClass.message}</p>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="region">Region</label>
            <select id="region" {...register('region', { required: 'Region is required' })} className={styles.formControl}>
              {Object.values(Region).map(r => (<option key={r} value={r}>{r}</option>))}
            </select>
            {errors.region && <p className={styles.error}>{errors.region.message}</p>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="investmentDate">Investment Date</label>
            <input type="date" id="investmentDate" {...register('investmentDate', { required: 'Investment Date is required' })} className={styles.formControl} />
            {errors.investmentDate && <p className={styles.error}>{errors.investmentDate.message}</p>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="investedAmount">Invested Amount</label>
            <input type="number" id="investedAmount" {...register('investedAmount', { required: 'Invested Amount is required', valueAsNumber: true })} className={styles.formControl} />
            {errors.investedAmount && <p className={styles.error}>{errors.investedAmount.message}</p>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="currentValue">Current Value</label>
            <input type="number" id="currentValue" {...register('currentValue', { required: 'Current Value is required', valueAsNumber: true })} className={styles.formControl} />
            {errors.currentValue && <p className={styles.error}>{errors.currentValue.message}</p>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="status">Status</label>
            <select id="status" {...register('status', { required: 'Status is required' })} className={styles.formControl}>
              {Object.values(InvestmentStatus).map(s => (<option key={s} value={s}>{s}</option>))}
            </select>
            {errors.status && <p className={styles.error}>{errors.status.message}</p>}
          </div>

          <div className={styles.modalFooter}>
            <button type="button" className={styles.secondaryButton} onClick={onClose}>Cancel</button>
            <button type="submit" className={styles.primaryButton}>{editingInvestment ? 'Update' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default App;