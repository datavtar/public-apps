import React, { useState, useEffect, useRef } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, ReferenceLine, Area, AreaChart
} from 'recharts';
import {
  ArrowUp, ArrowDown, TrendingUp, TrendingDown, RefreshCw, Clock, Filter,
  AlertTriangle, Settings, Download, Share, Sliders, MessageCircle, Info,
  ChevronDown, Bell, Zap, Eye, ChevronRight, BarChart as BarChartIcon, Search,
  Calendar, Check, X, Database, Server, Globe
} from 'lucide-react';
import styles from './styles/styles.module.css';

// Define TypeScript types and interfaces
type TradeSignal = {
  id: string;
  timestamp: string;
  type: 'BUY' | 'SELL';
  strike: number;
  expiryDate: string;
  premium: number;
  confidence: number;
  status: 'OPEN' | 'CLOSED';
  result?: 'PROFIT' | 'LOSS';
  profitLoss?: number;
  notes?: string;
};

type MarketData = {
  timestamp: string;
  value: number;
  volume?: number;
  rsi?: number;
  macd?: number;
  signal?: number;
  bollingerUpper?: number;
  bollingerLower?: number;
};

type NotificationType = {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  timestamp: string;
  read: boolean;
};

type Settings = {
  refreshInterval: number;
  signalThreshold: number;
  rsiOverbought: number;
  rsiOversold: number;
  enableNotifications: boolean;
  darkMode: boolean;
};

type Option = {
  strike: number;
  expiryDate: string;
  type: 'CALL' | 'PUT';
  premium: number;
  openInterest: number;
  volume: number;
  change: number;
  iv: number;
};

type DataSource = {
  id: string;
  name: string;
  url: string;
  trustScore: number;
  lastFetched: string;
  lastValue?: number;
  status: 'active' | 'error' | 'inactive';
  errorCount: number;
  responseTime: number; // in milliseconds
  historyAgreement: number; // percentage of agreement with other sources
};

type ModalType = 'settings' | 'notification' | 'trade' | 'filter' | 'dataSources' | null;

const App: React.FC = () => {
  // State variables with initial values
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [signals, setSignals] = useState<TradeSignal[]>([]);
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [options, setOptions] = useState<Option[]>([]);
  const [settings, setSettings] = useState<Settings>({
    refreshInterval: 30,
    signalThreshold: 75,
    rsiOverbought: 70,
    rsiOversold: 30,
    enableNotifications: true,
    darkMode: false
  });
  
  const [currentNifty, setCurrentNifty] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('1D');
  const [accuracy, setAccuracy] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedSignal, setSelectedSignal] = useState<TradeSignal | null>(null);
  const [isFiltering, setIsFiltering] = useState<boolean>(false);
  const [filterCriteria, setFilterCriteria] = useState({ type: '', status: '', dateRange: '' });
  const [unreadCount, setUnreadCount] = useState<number>(0);
  
  // New state variables for live data fetching
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [activeSource, setActiveSource] = useState<string>('');
  const [lastSourceCheck, setLastSourceCheck] = useState<string>(new Date().toISOString());
  const [isLiveDataFetching, setIsLiveDataFetching] = useState<boolean>(false);
  const [fetchingLogs, setFetchingLogs] = useState<{timestamp: string, message: string, type: 'info' | 'warning' | 'error'}[]>([]);

  // Refs
  const modalRef = useRef<HTMLDivElement>(null);
  const dataFetchingInterval = useRef<NodeJS.Timeout | null>(null);
  const sourcesCheckInterval = useRef<NodeJS.Timeout | null>(null);

  // Settings for changing dark/light mode
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  // Initialize data sources
  useEffect(() => {
    const initialSources: DataSource[] = [
      {
        id: 'nse-india',
        name: 'NSE India',
        url: 'https://www.nseindia.com/api/market-data',
        trustScore: 90,
        lastFetched: '',
        status: 'inactive',
        errorCount: 0,
        responseTime: 0,
        historyAgreement: 95
      },
      {
        id: 'investing-com',
        name: 'Investing.com',
        url: 'https://in.investing.com/indices/nifty-50',
        trustScore: 85,
        lastFetched: '',
        status: 'inactive',
        errorCount: 0,
        responseTime: 0,
        historyAgreement: 90
      },
      {
        id: 'yahoo-finance',
        name: 'Yahoo Finance',
        url: 'https://finance.yahoo.com/quote/%5ENSEI',
        trustScore: 80,
        lastFetched: '',
        status: 'inactive',
        errorCount: 0,
        responseTime: 0,
        historyAgreement: 92
      },
      {
        id: 'moneycontrol',
        name: 'Moneycontrol',
        url: 'https://www.moneycontrol.com/indian-indices/nifty-50-9.html',
        trustScore: 75,
        lastFetched: '',
        status: 'inactive',
        errorCount: 0,
        responseTime: 0,
        historyAgreement: 88
      }
    ];

    const savedSources = localStorage.getItem('nifty_analyzer_data_sources');
    if (savedSources) {
      try {
        const parsedSources = JSON.parse(savedSources);
        setDataSources(parsedSources);
      } catch (e) {
        logError('Failed to parse saved data sources, using defaults');
        setDataSources(initialSources);
      }
    } else {
      setDataSources(initialSources);
    }
  }, []);

  // Load data from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('nifty_analyzer_settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }

    const savedSignals = localStorage.getItem('nifty_analyzer_signals');
    if (savedSignals) {
      setSignals(JSON.parse(savedSignals));
    }

    const savedNotifications = localStorage.getItem('nifty_analyzer_notifications');
    if (savedNotifications) {
      const parsedNotifications = JSON.parse(savedNotifications);
      setNotifications(parsedNotifications);
      setUnreadCount(parsedNotifications.filter((n: NotificationType) => !n.read).length);
    }

    const savedLogs = localStorage.getItem('nifty_analyzer_fetching_logs');
    if (savedLogs) {
      try {
        setFetchingLogs(JSON.parse(savedLogs));
      } catch (e) {
        setFetchingLogs([]);
      }
    }

    // Generate demo data if not found
    if (!savedSignals || JSON.parse(savedSignals).length === 0) {
      generateDemoData();
    }

    // Start live data fetching after loading saved data
    setTimeout(() => {
      setIsLoading(false);
      initializeLiveDataFetching();
    }, 1500);
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('nifty_analyzer_settings', JSON.stringify(settings));
      localStorage.setItem('nifty_analyzer_signals', JSON.stringify(signals));
      localStorage.setItem('nifty_analyzer_notifications', JSON.stringify(notifications));
      localStorage.setItem('nifty_analyzer_data_sources', JSON.stringify(dataSources));
      localStorage.setItem('nifty_analyzer_fetching_logs', JSON.stringify(fetchingLogs));
    }
  }, [settings, signals, notifications, dataSources, fetchingLogs, isLoading]);

  // Calculate accuracy
  useEffect(() => {
    if (signals.length > 0) {
      const closedTrades = signals.filter(signal => signal.status === 'CLOSED');
      if (closedTrades.length > 0) {
        const profitableTrades = closedTrades.filter(signal => signal.result === 'PROFIT');
        const calculatedAccuracy = (profitableTrades.length / closedTrades.length) * 100;
        setAccuracy(parseFloat(calculatedAccuracy.toFixed(2)));
      }
    }
  }, [signals]);

  // Initialize live data fetching
  const initializeLiveDataFetching = () => {
    // Start fetching live data
    setIsLiveDataFetching(true);
    logInfo('Initializing live data fetching');
    
    // Initial fetch
    fetchLiveData();
    
    // Set up regular fetching interval (every 30 seconds)
    if (dataFetchingInterval.current) {
      clearInterval(dataFetchingInterval.current);
    }
    
    dataFetchingInterval.current = setInterval(() => {
      fetchLiveData();
    }, settings.refreshInterval * 1000);
    
    // Set up sources check interval (every 2 hours)
    if (sourcesCheckInterval.current) {
      clearInterval(sourcesCheckInterval.current);
    }
    
    sourcesCheckInterval.current = setInterval(() => {
      checkAndUpdateDataSources();
    }, 2 * 60 * 60 * 1000); // 2 hours
    
    return () => {
      if (dataFetchingInterval.current) {
        clearInterval(dataFetchingInterval.current);
      }
      if (sourcesCheckInterval.current) {
        clearInterval(sourcesCheckInterval.current);
      }
    };
  };

  // Function to fetch live data
  const fetchLiveData = async () => {
    if (dataSources.length === 0) return;
    
    // If no active source is selected, use the one with highest trust score
    if (!activeSource) {
      const bestSource = [...dataSources].sort((a, b) => b.trustScore - a.trustScore)[0];
      setActiveSource(bestSource.id);
      logInfo(`Selected ${bestSource.name} as initial data source based on trust score`);
    }
    
    // Simulate fetching from the active source
    const currentSource = dataSources.find(source => source.id === activeSource);
    
    if (!currentSource) {
      logError('Active data source not found');
      return;
    }
    
    try {
      // Start timing the request
      const startTime = Date.now();
      
      // Simulate API call with random success/failure and response times
      // In a real implementation, this would be an actual API call to the source URL
      const simulateFetch = () => {
        return new Promise<number>((resolve, reject) => {
          // 10% chance of error for simulating API failures
          const willFail = Math.random() < 0.1;
          
          // Random response time between 100-2000ms
          const responseTime = 100 + Math.random() * 1900;
          
          setTimeout(() => {
            if (willFail) {
              reject(new Error('Failed to fetch data from source'));
            } else {
              // Generate a realistic NIFTY value
              // In a real implementation, this would be parsed from the API response
              const baseValue = 22450;
              const variation = Math.random() * 200 - 100; // +/- 100 points
              resolve(baseValue + variation);
            }
          }, responseTime);
        });
      };
      
      // Fetch from active source
      const niftyValue = await simulateFetch();
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      // Update the data source information
      const updatedSources = dataSources.map(source => {
        if (source.id === activeSource) {
          return {
            ...source,
            status: 'active' as const,
            lastFetched: new Date().toISOString(),
            lastValue: niftyValue,
            responseTime: responseTime,
            errorCount: 0 // Reset error count on successful fetch
          };
        }
        return source;
      });
      
      setDataSources(updatedSources);
      
      // Update current NIFTY value
      setCurrentNifty(niftyValue);
      
      // Update market data for chart
      updateMarketDataWithNewValue(niftyValue);
      
      logInfo(`Successfully fetched NIFTY value (${niftyValue.toFixed(2)}) from ${currentSource.name} in ${responseTime}ms`);
    } catch (error) {
      // Handle error from active source
      const errorMessage = error instanceof Error ? error.message : 'Unknown error fetching data';
      logError(`Error fetching from ${currentSource.name}: ${errorMessage}`);
      
      // Update source with error information
      const updatedSources = dataSources.map(source => {
        if (source.id === activeSource) {
          const newErrorCount = source.errorCount + 1;
          return {
            ...source,
            status: 'error' as const,
            errorCount: newErrorCount,
            lastFetched: new Date().toISOString()
          };
        }
        return source;
      });
      
      setDataSources(updatedSources);
      
      // If current source has too many errors, switch to a backup source
      const currentSourceData = updatedSources.find(s => s.id === activeSource);
      if (currentSourceData && currentSourceData.errorCount >= 3) {
        switchToBackupSource(updatedSources);
      }
    }
  };

  // Function to update market data with new value
  const updateMarketDataWithNewValue = (newValue: number) => {
    setMarketData(prevData => {
      // Handle empty data case
      if (prevData.length === 0) {
        // Initialize with historical data simulation
        const timeIntervals = selectedTimeframe === '1D' ? 60 : 
                           selectedTimeframe === '1W' ? 24 * 7 : 
                           selectedTimeframe === '1M' ? 30 : 90;
        
        const newData: MarketData[] = [];
        const now = new Date();
        
        for (let i = timeIntervals; i >= 0; i--) {
          const timestamp = new Date(now.getTime() - (i * 5 * 60 * 1000));
          const timeStr = timestamp.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false
          });
          const dateStr = timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          const displayTime = selectedTimeframe === '1D' ? timeStr : dateStr;
          
          // Generate a realistic NIFTY movement pattern around the current value
          const randomFactor = Math.sin(i * 0.1) * 30 + (Math.random() * 20 - 10);
          const value = newValue + randomFactor - 50; // Start a bit lower than current
          
          // Calculate technical indicators
          const rsi = 50 + Math.sin(i * 0.2) * 20; // Simulated RSI between 30-70
          const macd = Math.sin(i * 0.1) * 5;
          const signal = Math.sin((i + 2) * 0.1) * 5;
          const bollingerUpper = value + 50 + Math.random() * 20;
          const bollingerLower = value - 50 - Math.random() * 20;
          const volume = 100000 + Math.random() * 50000;

          newData.push({
            timestamp: displayTime,
            value: parseFloat(value.toFixed(2)),
            volume: Math.round(volume),
            rsi,
            macd,
            signal,
            bollingerUpper,
            bollingerLower
          });
        }
        
        return newData;
      }
      
      // Create a copy of the previous data
      const newData = [...prevData];
      
      // Get the last data point
      const lastPoint = newData[newData.length - 1];
      
      // Generate time stamp
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false
      });
      const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const displayTime = selectedTimeframe === '1D' ? timeStr : dateStr;
      
      // Update technical indicators based on new value
      const newRsi = Math.max(10, Math.min(90, lastPoint.rsi! + (Math.random() * 6 - 3)));
      const newMacd = lastPoint.macd! + (Math.random() * 0.6 - 0.3);
      const newSignal = lastPoint.signal! + (Math.random() * 0.4 - 0.2);
      const newVolume = 100000 + Math.random() * 50000;
      
      // Update the data
      newData.shift();
      newData.push({
        timestamp: displayTime,
        value: parseFloat(newValue.toFixed(2)),
        volume: Math.round(newVolume),
        rsi: newRsi,
        macd: newMacd,
        signal: newSignal,
        bollingerUpper: newValue + 50 + Math.random() * 20,
        bollingerLower: newValue - 50 - Math.random() * 20
      });
      
      // Generate signal if conditions are met
      generateSignalIfNeeded(newValue, newRsi, newMacd, newSignal);
      
      // Generate option chain when we get new market data
      if (options.length === 0) {
        generateOptionChainData(newValue);
      }
      
      return newData;
    });
  };

  // Function to check and update data sources
  const checkAndUpdateDataSources = async () => {
    logInfo('Performing scheduled check of all data sources');
    setLastSourceCheck(new Date().toISOString());
    
    // Create a copy of data sources to work with
    const sourcesToCheck = [...dataSources];
    const results: {sourceId: string, value?: number, responseTime: number, error?: string}[] = [];
    
    // Simulate fetching from all sources
    for (const source of sourcesToCheck) {
      try {
        const startTime = Date.now();
        
        // Simulate API call with random success/failure and response times
        const simulateFetch = () => {
          return new Promise<number>((resolve, reject) => {
            // Different failure rates based on source reputation
            const failureRate = source.trustScore > 85 ? 0.05 : 
                              source.trustScore > 75 ? 0.1 : 0.15;
            
            const willFail = Math.random() < failureRate;
            
            // Random response time between 100-3000ms
            const responseTime = 100 + Math.random() * 2900;
            
            setTimeout(() => {
              if (willFail) {
                reject(new Error(`Failed to fetch data from ${source.name}`));
              } else {
                // Generate a realistic NIFTY value with some variance between sources
                const baseValue = 22450;
                const sourceSpecificBias = (source.id.charCodeAt(0) % 10) - 5; // -5 to +4 bias per source
                const variation = Math.random() * 100 - 50 + sourceSpecificBias; // +/- 50 points with source bias
                resolve(baseValue + variation);
              }
            }, responseTime);
          });
        };
        
        // Fetch from this source
        const niftyValue = await simulateFetch();
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        results.push({
          sourceId: source.id,
          value: niftyValue,
          responseTime
        });
        
        logInfo(`Source check: ${source.name} returned ${niftyValue.toFixed(2)} in ${responseTime}ms`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        results.push({
          sourceId: source.id,
          responseTime: 0,
          error: errorMessage
        });
        
        logError(`Source check: ${source.name} failed - ${errorMessage}`);
      }
    }
    
    // Calculate average value from successful sources
    const successfulResults = results.filter(r => r.value !== undefined);
    let averageValue = 0;
    
    if (successfulResults.length > 0) {
      averageValue = successfulResults.reduce((sum, r) => sum + (r.value || 0), 0) / successfulResults.length;
    }
    
    // Update data sources with new information and calculate agreement
    const updatedSources = dataSources.map(source => {
      const result = results.find(r => r.sourceId === source.id);
      
      if (!result) return source;
      
      if (result.error) {
        // Source had an error
        return {
          ...source,
          status: 'error' as const,
          errorCount: source.errorCount + 1,
          lastFetched: new Date().toISOString()
        };
      }
      
      // Calculate how close this source is to the average (agreement)
      const sourceValue = result.value || 0;
      const deviation = Math.abs(sourceValue - averageValue);
      const maxDeviation = 100; // Maximum expected deviation
      const agreement = 100 - (deviation / maxDeviation * 100);
      
      // Update history agreement (80% previous value, 20% new agreement)
      const newHistoryAgreement = source.historyAgreement * 0.8 + agreement * 0.2;
      
      // Calculate new trust score based on:
      // - History agreement (40%)
      // - Response time (20%) - faster is better
      // - Error rate (40%) - fewer errors is better
      const maxAcceptableResponseTime = 2000; // 2 seconds
      const responseTimeScore = Math.max(0, 100 - (result.responseTime / maxAcceptableResponseTime * 100));
      
      const errorRateScore = Math.max(0, 100 - source.errorCount * 10);
      
      const newTrustScore = (
        newHistoryAgreement * 0.4 + 
        responseTimeScore * 0.2 + 
        errorRateScore * 0.4
      );
      
      return {
        ...source,
        status: 'active' as const,
        lastFetched: new Date().toISOString(),
        lastValue: sourceValue,
        responseTime: result.responseTime,
        historyAgreement: parseFloat(newHistoryAgreement.toFixed(2)),
        trustScore: parseFloat(newTrustScore.toFixed(2))
      };
    });
    
    setDataSources(updatedSources);
    
    // Determine the best source based on trust score
    const bestSource = [...updatedSources].sort((a, b) => b.trustScore - a.trustScore)[0];
    
    // If best source is different from current active source, switch to it
    if (bestSource.id !== activeSource) {
      logInfo(`Switching to ${bestSource.name} as the most trusted data source (score: ${bestSource.trustScore})`);
      setActiveSource(bestSource.id);
      
      // Add notification
      const newNotification: NotificationType = {
        id: Date.now().toString(),
        message: `Data source switched to ${bestSource.name} based on reliability analysis`,
        type: 'info',
        timestamp: new Date().toISOString(),
        read: false
      };
      
      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);
    } else {
      logInfo(`Keeping ${bestSource.name} as the most trusted data source (score: ${bestSource.trustScore})`);
    }
    
    // If we have at least one successful result, update the NIFTY value
    if (bestSource && bestSource.lastValue) {
      setCurrentNifty(bestSource.lastValue);
      updateMarketDataWithNewValue(bestSource.lastValue);
    }
  };

  // Function to switch to a backup source
  const switchToBackupSource = (currentSources: DataSource[]) => {
    // Filter out the current source and any sources with too many errors
    const availableSources = currentSources.filter(
      s => s.id !== activeSource && s.errorCount < 3
    );
    
    if (availableSources.length === 0) {
      logError('No reliable backup sources available');
      return;
    }
    
    // Sort by trust score
    const sortedSources = [...availableSources].sort((a, b) => b.trustScore - a.trustScore);
    const newSource = sortedSources[0];
    
    logWarning(`Switching from ${currentSources.find(s => s.id === activeSource)?.name} to backup source ${newSource.name}`);
    
    setActiveSource(newSource.id);
    
    // Add notification
    const newNotification: NotificationType = {
      id: Date.now().toString(),
      message: `Primary data source unavailable, switched to ${newSource.name}`,
      type: 'warning',
      timestamp: new Date().toISOString(),
      read: false
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);
    
    // Immediately try fetching from the new source
    fetchLiveData();
  };

  // Logger functions
  const logInfo = (message: string) => {
    const newLog = { timestamp: new Date().toISOString(), message, type: 'info' as const };
    setFetchingLogs(prev => [newLog, ...prev.slice(0, 99)]); // Keep last 100 logs
  };

  const logWarning = (message: string) => {
    const newLog = { timestamp: new Date().toISOString(), message, type: 'warning' as const };
    setFetchingLogs(prev => [newLog, ...prev.slice(0, 99)]);
  };

  const logError = (message: string) => {
    const newLog = { timestamp: new Date().toISOString(), message, type: 'error' as const };
    setFetchingLogs(prev => [newLog, ...prev.slice(0, 99)]);
  };

  // Handle closing modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        closeModal();
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeModal();
      }
    };

    if (isModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isModalOpen]);

  // Clean up intervals on component unmount
  useEffect(() => {
    return () => {
      if (dataFetchingInterval.current) {
        clearInterval(dataFetchingInterval.current);
      }
      if (sourcesCheckInterval.current) {
        clearInterval(sourcesCheckInterval.current);
      }
    };
  }, []);

  // Function to generate demo data
  const generateDemoData = () => {
    // Generate demo signals
    const demoSignals: TradeSignal[] = [
      {
        id: '1',
        timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
        type: 'BUY',
        strike: 22500,
        expiryDate: new Date(Date.now() + 86400000 * 7).toLocaleDateString(),
        premium: 150,
        confidence: 87,
        status: 'CLOSED',
        result: 'PROFIT',
        profitLoss: 3200,
        notes: 'Strong momentum after support bounce'
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        type: 'SELL',
        strike: 22400,
        expiryDate: new Date(Date.now() + 86400000 * 7).toLocaleDateString(),
        premium: 120,
        confidence: 82,
        status: 'OPEN',
        notes: 'Resistance zone rejection with bearish divergence'
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
        type: 'BUY',
        strike: 22300,
        expiryDate: new Date(Date.now() + 86400000 * 3).toLocaleDateString(),
        premium: 135,
        confidence: 78,
        status: 'CLOSED',
        result: 'PROFIT',
        profitLoss: 2100,
        notes: 'Gap up after positive news'
      },
      {
        id: '4',
        timestamp: new Date(Date.now() - 86400000 * 8).toISOString(), // 8 days ago
        type: 'SELL',
        strike: 22600,
        expiryDate: new Date(Date.now() - 86400000 * 1).toLocaleDateString(),
        premium: 175,
        confidence: 81,
        status: 'CLOSED',
        result: 'LOSS',
        profitLoss: -1200,
        notes: 'Unexpected market reversal due to global cues'
      }
    ];

    setSignals(demoSignals);

    // Generate demo notifications
    const demoNotifications: NotificationType[] = [
      {
        id: '1',
        message: 'New BUY signal generated for NIFTY 22500 CE',
        type: 'success',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        read: false
      },
      {
        id: '2',
        message: 'Market showing potential volatility ahead of economic data release',
        type: 'warning',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        read: false
      },
      {
        id: '3',
        message: 'Your previous trade (ID: 3) resulted in profit of ₹2,100',
        type: 'info',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        read: true
      },
      {
        id: '4',
        message: 'Live data connection established with NSE India',
        type: 'info',
        timestamp: new Date().toISOString(),
        read: false
      }
    ];

    setNotifications(demoNotifications);
    setUnreadCount(demoNotifications.filter(n => !n.read).length);
  };

  // Function to generate option chain data
  const generateOptionChainData = (currentPrice: number) => {
    const strikes = [];
    // Generate strikes around the current price
    for (let i = -5; i <= 5; i++) {
      const strike = Math.round((currentPrice + i * 100) / 50) * 50; // Round to nearest 50
      strikes.push(strike);
    }

    // Generate expiry dates
    const now = new Date();
    const weeklyExpiry = new Date(now);
    // Go to next Thursday
    weeklyExpiry.setDate(now.getDate() + ((4 + 7 - now.getDay()) % 7));
    const nextWeekExpiry = new Date(weeklyExpiry);
    nextWeekExpiry.setDate(weeklyExpiry.getDate() + 7);
    const monthlyExpiry = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Last day of current month

    const expiryDates = [
      weeklyExpiry.toLocaleDateString(),
      nextWeekExpiry.toLocaleDateString(),
      monthlyExpiry.toLocaleDateString()
    ];

    // Generate option chain
    const generatedOptions: Option[] = [];

    expiryDates.forEach(expiryDate => {
      strikes.forEach(strike => {
        // CALL option
        const callPremium = Math.max(5, Math.round((currentPrice - strike + 50 + Math.random() * 30) * 10) / 10);
        const callOI = Math.round(10000 + Math.random() * 50000);
        const callVolume = Math.round(callOI * (0.3 + Math.random() * 0.4));
        const callChange = Math.round((Math.random() * 16 - 8) * 10) / 10;
        const callIV = Math.round((15 + Math.random() * 10) * 10) / 10;

        generatedOptions.push({
          strike,
          expiryDate,
          type: 'CALL',
          premium: callPremium,
          openInterest: callOI,
          volume: callVolume,
          change: callChange,
          iv: callIV
        });

        // PUT option
        const putPremium = Math.max(5, Math.round((strike - currentPrice + 50 + Math.random() * 30) * 10) / 10);
        const putOI = Math.round(10000 + Math.random() * 50000);
        const putVolume = Math.round(putOI * (0.3 + Math.random() * 0.4));
        const putChange = Math.round((Math.random() * 16 - 8) * 10) / 10;
        const putIV = Math.round((15 + Math.random() * 10) * 10) / 10;

        generatedOptions.push({
          strike,
          expiryDate,
          type: 'PUT',
          premium: putPremium,
          openInterest: putOI,
          volume: putVolume,
          change: putChange,
          iv: putIV
        });
      });
    });

    setOptions(generatedOptions);
  };

  // Function to generate trading signals
  const generateSignalIfNeeded = (price: number, rsi: number, macd: number, signal: number) => {
    // Only generate a signal if conditions are favorable and at random intervals
    if (Math.random() > 0.98) { // 2% chance to generate a signal on each update
      // Analyze conditions to determine signal type
      const isBuySignal = macd > signal && rsi < 65;
      const isSellSignal = macd < signal && rsi > 35;
      
      if (isBuySignal || isSellSignal) {
        const type = isBuySignal ? 'BUY' : 'SELL';
        const confidence = Math.round(75 + Math.random() * 15);
        
        // Only generate if confidence is above threshold
        if (confidence > settings.signalThreshold) {
          // Determine strike price based on current price and signal type
          const strikeStep = 50; // NIFTY options typically have 50-point intervals
          let strike;
          
          if (type === 'BUY') {
            // For BUY signals, round to nearest higher strike that's a multiple of strikeStep
            strike = Math.ceil(price / strikeStep) * strikeStep;
          } else {
            // For SELL signals, round to nearest lower strike that's a multiple of strikeStep
            strike = Math.floor(price / strikeStep) * strikeStep;
          }
          
          // Determine expiry date (next weekly expiry)
          const now = new Date();
          const expiry = new Date(now);
          // Set to next Thursday (4 is Thursday in JavaScript's getDay() where 0 is Sunday)
          expiry.setDate(now.getDate() + ((4 + 7 - now.getDay()) % 7));
          
          // Generate premium based on distance from strike and volatility
          const premium = Math.round(Math.abs(price - strike) * 0.3 + 50 + (Math.random() * 30));
          
          const newSignal: TradeSignal = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            type,
            strike,
            expiryDate: expiry.toLocaleDateString(),
            premium,
            confidence,
            status: 'OPEN',
            notes: generateSignalNotes(type, rsi, macd - signal)
          };
          
          // Add signal to state
          setSignals(prevSignals => [newSignal, ...prevSignals]);
          
          // Create notification for the new signal
          const newNotification: NotificationType = {
            id: Date.now().toString(),
            message: `New ${type} signal generated for NIFTY ${strike} ${type === 'BUY' ? 'CE' : 'PE'}`,
            type: 'success',
            timestamp: new Date().toISOString(),
            read: false
          };
          
          // Add notification
          setNotifications(prevNotifications => [newNotification, ...prevNotifications]);
          setUnreadCount(prevCount => prevCount + 1);
        }
      }
    }
    
    // Randomly close a trade if it exists and is open
    if (Math.random() > 0.95) { // 5% chance to close a trade on each update
      setSignals(prevSignals => {
        const openSignals = prevSignals.filter(s => s.status === 'OPEN');
        if (openSignals.length === 0) return prevSignals;
        
        const signalToClose = openSignals[Math.floor(Math.random() * openSignals.length)];
        const isProfit = Math.random() > 0.3; // 70% chance of profit for demo purposes
        const profitLossAmount = isProfit ? 
          Math.round(signalToClose.premium * (1 + Math.random())) * 100 : 
          -Math.round(signalToClose.premium * Math.random()) * 100;
        
        const updatedSignals = prevSignals.map(s => {
          if (s.id === signalToClose.id) {
            return {
              ...s,
              status: 'CLOSED',
              result: isProfit ? 'PROFIT' : 'LOSS',
              profitLoss: profitLossAmount
            };
          }
          return s;
        });
        
        // Create notification for closed trade
        const resultNotification: NotificationType = {
          id: Date.now().toString(),
          message: `Your ${signalToClose.type} trade for NIFTY ${signalToClose.strike} has closed with a ${isProfit ? 'PROFIT' : 'LOSS'} of ₹${Math.abs(profitLossAmount).toLocaleString()}`,
          type: isProfit ? 'success' : 'error',
          timestamp: new Date().toISOString(),
          read: false
        };
        
        // Add notification
        setNotifications(prevNotifications => [resultNotification, ...prevNotifications]);
        setUnreadCount(prevCount => prevCount + 1);
        
        return updatedSignals;
      });
    }
  };

  // Generate notes for a signal
  const generateSignalNotes = (type: 'BUY' | 'SELL', rsi: number, macdHistogram: number): string => {
    const notes = [];
    
    if (type === 'BUY') {
      if (rsi < 30) notes.push('Oversold conditions');
      if (macdHistogram > 0) notes.push('Positive MACD crossover');
      notes.push('Strong support level identified');
      
      if (Math.random() > 0.5) notes.push('Bullish chart pattern forming');
      if (Math.random() > 0.7) notes.push('Increasing volume on upticks');
    } else {
      if (rsi > 70) notes.push('Overbought conditions');
      if (macdHistogram < 0) notes.push('Negative MACD crossover');
      notes.push('Resistance level rejection');
      
      if (Math.random() > 0.5) notes.push('Bearish chart pattern forming');
      if (Math.random() > 0.7) notes.push('Decreasing volume on rallies');
    }
    
    return notes.join('. ') + '.';
  };

  // Modal handlers
  const openModal = (type: ModalType, signal: TradeSignal | null = null) => {
    setModalType(type);
    setIsModalOpen(true);
    if (signal) setSelectedSignal(signal);
    document.body.classList.add('modal-open');
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalType(null);
    setSelectedSignal(null);
    document.body.classList.remove('modal-open');
  };

  const markAllNotificationsAsRead = () => {
    const updatedNotifications = notifications.map(notification => ({
      ...notification,
      read: true
    }));
    setNotifications(updatedNotifications);
    setUnreadCount(0);
  };

  const handleExportData = () => {
    const data = {
      signals,
      settings
    };
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nifty_analyzer_data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const toggleFilterPanel = () => {
    setIsFiltering(!isFiltering);
  };

  // Function to apply filters to signals
  const getFilteredSignals = () => {
    return signals.filter(signal => {
      let match = true;
      
      if (filterCriteria.type && signal.type !== filterCriteria.type) {
        match = false;
      }
      
      if (filterCriteria.status && signal.status !== filterCriteria.status) {
        match = false;
      }
      
      // Add date range filtering if implemented
      
      return match;
    });
  };

  // Function to get active data source information
  const getActiveSourceInfo = () => {
    return dataSources.find(source => source.id === activeSource);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 dark:bg-slate-900">
        <div className="w-24 h-24 relative animate-spin">
          <RefreshCw size={80} className="text-primary-600 dark:text-primary-400" />
        </div>
        <h2 className="mt-6 text-xl font-semibold text-gray-700 dark:text-gray-200">Loading NIFTY Analyzer</h2>
        <p className="mt-2 text-gray-500 dark:text-gray-400">Connecting to market data sources...</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 dark:bg-slate-900">
        <AlertTriangle size={64} className="text-red-500" />
        <h2 className="mt-6 text-xl font-semibold text-gray-700 dark:text-gray-200">Error Loading Data</h2>
        <p className="mt-2 text-gray-500 dark:text-gray-400">{error}</p>
        <button 
          className="mt-6 btn btn-primary"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-md py-3 px-4 sticky top-0 z-10">
        <div className="container-fluid">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center">
              <BarChartIcon className="h-8 w-8 text-primary-600 dark:text-primary-400 mr-2" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">NIFTY Options Analyzer</h1>
            </div>

            <div className="flex items-center space-x-3">
              <div className="hidden md:flex items-center space-x-2 mr-4">
                <Clock size={18} className="text-gray-500 dark:text-gray-400" />
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Last updated: {new Date().toLocaleTimeString()}
                </span>
              </div>

              <div className="relative">
                <button 
                  className="btn bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600 flex items-center"
                  onClick={() => openModal('notification')}
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </div>

              <button 
                className="btn bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600"
                onClick={() => openModal('settings')}
              >
                <Settings size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow container-fluid py-6">
        {/* Live data info banner */}
        <div className={`${styles.liveBanner} mb-6 p-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-between shadow-md`}>
          <div className="flex items-center">
            <div className={`${styles.pulsingDot} mr-2`}></div>
            <span className="font-medium">
              LIVE DATA: {getActiveSourceInfo()?.name || 'Connecting...'}
            </span>
          </div>
          <button 
            className="text-white bg-white/20 hover:bg-white/30 transition px-3 py-1 rounded-md text-sm flex items-center"
            onClick={() => openModal('dataSources')}
          >
            <Database size={14} className="mr-1" />
            Data Sources
          </button>
        </div>

        {/* Market overview section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Current price and change */}
          <div className="card">
            <div className="flex flex-col">
              <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">NIFTY Current Value</h3>
              <div className="flex items-baseline mt-2">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  {currentNifty.toLocaleString('en-IN', {maximumFractionDigits: 2})}
                </span>
                <span className="ml-2 flex items-center text-green-600 dark:text-green-400">
                  <ArrowUp size={16} className="mr-1" />
                  <span>0.8%</span>
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className={`badge ${accuracy >= 80 ? 'badge-success' : accuracy >= 70 ? 'badge-warning' : 'badge-error'}`}>
                  Signal Accuracy: {accuracy}%
                </span>
                <span className="badge badge-info">
                  <Clock size={12} className="mr-1" /> Real-time
                </span>
                <span className="badge badge-success">
                  <Globe size={12} className="mr-1" /> Live Data
                </span>
              </div>
            </div>
          </div>

          {/* Daily summary */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">Market Summary</h3>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Daily Range</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {(currentNifty - 45).toFixed(2)} - {(currentNifty + 72).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Volume</p>
                <p className="font-medium text-gray-900 dark:text-white">14.2M</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Support</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {Math.floor(currentNifty / 100) * 100 - 50}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Resistance</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {Math.ceil(currentNifty / 100) * 100 + 50}
                </p>
              </div>
            </div>
          </div>

          {/* Technical indicators */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">Technical Indicators</h3>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">RSI (14)</p>
                <p className={`font-medium ${marketData.length && marketData[marketData.length - 1].rsi! > 70 ? 'text-red-600 dark:text-red-400' : marketData.length && marketData[marketData.length - 1].rsi! < 30 ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
                  {marketData.length ? marketData[marketData.length - 1].rsi!.toFixed(2) : '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">MACD</p>
                <p className={`font-medium ${marketData.length && marketData[marketData.length - 1].macd! > marketData[marketData.length - 1].signal! ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {marketData.length ? marketData[marketData.length - 1].macd!.toFixed(2) : '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Bollinger Bands</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {marketData.length ? (marketData[marketData.length - 1].value >= marketData[marketData.length - 1].bollingerUpper! ? 'Upper Band' : marketData[marketData.length - 1].value <= marketData[marketData.length - 1].bollingerLower! ? 'Lower Band' : 'Middle Band') : '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Trend</p>
                <div className="flex items-center">
                  {marketData.length > 5 && marketData[marketData.length - 1].value > marketData[marketData.length - 5].value ? (
                    <>
                      <TrendingUp size={16} className="text-green-600 dark:text-green-400 mr-1" />
                      <p className="font-medium text-green-600 dark:text-green-400">Bullish</p>
                    </>
                  ) : (
                    <>
                      <TrendingDown size={16} className="text-red-600 dark:text-red-400 mr-1" />
                      <p className="font-medium text-red-600 dark:text-red-400">Bearish</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chart section */}
        <div className="card mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-0">NIFTY Price Chart</h2>

            <div className="flex items-center space-x-2">
              <div className="flex bg-gray-100 dark:bg-slate-700 rounded-md overflow-hidden">
                {['1D', '1W', '1M', '3M'].map(timeframe => (
                  <button
                    key={timeframe}
                    className={`px-3 py-1.5 text-sm font-medium ${selectedTimeframe === timeframe ? 'bg-primary-500 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'}`}
                    onClick={() => setSelectedTimeframe(timeframe)}
                  >
                    {timeframe}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="h-72 sm:h-80 lg:h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={marketData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis 
                  dataKey="timestamp" 
                  tick={{ fontSize: 12 }} 
                  tickFormatter={(value) => value}
                />
                <YAxis 
                  domain={[dataMin => Math.floor(dataMin * 0.998), dataMax => Math.ceil(dataMax * 1.002)]}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: settings.darkMode ? '#1e293b' : '#fff', borderColor: settings.darkMode ? '#334155' : '#e2e8f0' }}
                  itemStyle={{ color: settings.darkMode ? '#e2e8f0' : '#1f2937' }}
                  labelStyle={{ color: settings.darkMode ? '#94a3b8' : '#6b7280' }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#4f46e5" 
                  strokeWidth={2} 
                  dot={false} 
                  name="NIFTY" 
                />
                <Line 
                  type="monotone" 
                  dataKey="bollingerUpper" 
                  stroke="#059669" 
                  strokeWidth={1} 
                  strokeDasharray="3 3" 
                  dot={false} 
                  name="Upper Band" 
                />
                <Line 
                  type="monotone" 
                  dataKey="bollingerLower" 
                  stroke="#dc2626" 
                  strokeWidth={1} 
                  strokeDasharray="3 3" 
                  dot={false} 
                  name="Lower Band" 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Trading signals section */}
        <div className="card mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-0">Trading Signals</h2>
            <div className="flex items-center space-x-2">
              <button 
                className="btn bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600 flex items-center"
                onClick={toggleFilterPanel}
              >
                <Filter size={16} className="mr-1" />
                Filter
              </button>

              <button 
                className="btn bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600 flex items-center"
                onClick={handleExportData}
              >
                <Download size={16} className="mr-1" />
                Export
              </button>
            </div>
          </div>

          {/* Filter panel */}
          {isFiltering && (
            <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-md mb-4 border border-gray-200 dark:border-slate-700">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="form-label">Signal Type</label>
                  <select 
                    className="input"
                    value={filterCriteria.type}
                    onChange={(e) => setFilterCriteria({...filterCriteria, type: e.target.value})}
                  >
                    <option value="">All Types</option>
                    <option value="BUY">BUY</option>
                    <option value="SELL">SELL</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Status</label>
                  <select 
                    className="input"
                    value={filterCriteria.status}
                    onChange={(e) => setFilterCriteria({...filterCriteria, status: e.target.value})}
                  >
                    <option value="">All Status</option>
                    <option value="OPEN">OPEN</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Date Range</label>
                  <select 
                    className="input"
                    value={filterCriteria.dateRange}
                    onChange={(e) => setFilterCriteria({...filterCriteria, dateRange: e.target.value})}
                  >
                    <option value="">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Signals table */}
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead className="table-header">
                <tr>
                  <th className="table-cell">Date & Time</th>
                  <th className="table-cell">Type</th>
                  <th className="table-cell">Strike</th>
                  <th className="table-cell">Expiry</th>
                  <th className="table-cell">Premium</th>
                  <th className="table-cell">Confidence</th>
                  <th className="table-cell">Status</th>
                  <th className="table-cell">P/L</th>
                  <th className="table-cell">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                {getFilteredSignals().map(signal => (
                  <tr key={signal.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                    <td className="table-cell">{formatDate(signal.timestamp)}</td>
                    <td className="table-cell">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${signal.type === 'BUY' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                        {signal.type === 'BUY' ? (
                          <ArrowUp size={12} className="mr-1" />
                        ) : (
                          <ArrowDown size={12} className="mr-1" />
                        )}
                        {signal.type}
                      </span>
                    </td>
                    <td className="table-cell">{signal.strike}</td>
                    <td className="table-cell">{signal.expiryDate}</td>
                    <td className="table-cell">₹{signal.premium}</td>
                    <td className="table-cell">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                          <div 
                            className={`h-2.5 rounded-full ${signal.confidence >= 85 ? 'bg-green-500' : signal.confidence >= 75 ? 'bg-blue-500' : 'bg-yellow-500'}`} 
                            style={{ width: `${signal.confidence}%` }}
                          ></div>
                        </div>
                        <span className="ml-2 text-xs">{signal.confidence}%</span>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${signal.status === 'OPEN' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : signal.result === 'PROFIT' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                        {signal.status === 'OPEN' ? 'OPEN' : signal.result}
                      </span>
                    </td>
                    <td className="table-cell">
                      {signal.status === 'CLOSED' && (
                        <span className={signal.profitLoss! >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                          {signal.profitLoss! >= 0 ? '+' : ''}
                          ₹{Math.abs(signal.profitLoss!).toLocaleString()}
                        </span>
                      )}
                    </td>
                    <td className="table-cell">
                      <button 
                        className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                        onClick={() => openModal('trade', signal)}
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {getFilteredSignals().length === 0 && (
                  <tr>
                    <td colSpan={9} className="table-cell text-center py-8 text-gray-500 dark:text-gray-400">
                      No trading signals match your filters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Options Chain section */}
        <div className="card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-0">Options Chain</h2>
            <div className="flex items-center">
              <div className="relative">
                <input 
                  type="text" 
                  className="input pl-9 w-full sm:w-auto" 
                  placeholder="Search strike price..."
                />
                <Search size={16} className="absolute top-1/2 transform -translate-y-1/2 left-3 text-gray-400" />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead className="table-header">
                <tr>
                  <th colSpan={5} className="text-center bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200">CALLS</th>
                  <th className="bg-gray-100 dark:bg-gray-800 text-center">Strike</th>
                  <th colSpan={5} className="text-center bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-200">PUTS</th>
                </tr>
                <tr>
                  <th className="table-cell bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200">IV</th>
                  <th className="table-cell bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200">Volume</th>
                  <th className="table-cell bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200">OI</th>
                  <th className="table-cell bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200">Change</th>
                  <th className="table-cell bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200">Premium</th>
                  <th className="table-cell bg-gray-100 dark:bg-gray-800 text-center"></th>
                  <th className="table-cell bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-200">Premium</th>
                  <th className="table-cell bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-200">Change</th>
                  <th className="table-cell bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-200">OI</th>
                  <th className="table-cell bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-200">Volume</th>
                  <th className="table-cell bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-200">IV</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                {options.length > 0 && Object.values(options
                  .filter(option => option.expiryDate === options[0].expiryDate)
                  .reduce((acc, option) => {
                    if (!acc[option.strike]) {
                      acc[option.strike] = { strike: option.strike, call: null, put: null };
                    }
                    if (option.type === 'CALL') {
                      acc[option.strike].call = option;
                    } else {
                      acc[option.strike].put = option;
                    }
                    return acc;
                  }, {} as Record<number, { strike: number, call: Option | null, put: Option | null }>)
                ).sort((a, b) => b.strike - a.strike)
                .slice(0, 7) // Only show a limited number of rows for compactness
                .map(({ strike, call, put }) => (
                  <tr key={strike} className={`${strike === Math.round(currentNifty / 50) * 50 ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''}`}>
                    <td className="table-cell bg-blue-50/50 dark:bg-blue-900/20">{call?.iv || '-'}%</td>
                    <td className="table-cell bg-blue-50/50 dark:bg-blue-900/20">{call?.volume?.toLocaleString() || '-'}</td>
                    <td className="table-cell bg-blue-50/50 dark:bg-blue-900/20">{call?.openInterest?.toLocaleString() || '-'}</td>
                    <td className="table-cell bg-blue-50/50 dark:bg-blue-900/20">
                      <span className={call?.change && call.change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                        {call?.change ? (call.change >= 0 ? '+' : '') + call.change + '%' : '-'}
                      </span>
                    </td>
                    <td className="table-cell bg-blue-50/50 dark:bg-blue-900/20 font-medium">
                      ₹{call?.premium.toFixed(2) || '-'}
                    </td>
                    <td className="table-cell bg-gray-100 dark:bg-gray-800 text-center font-bold">{strike}</td>
                    <td className="table-cell bg-red-50/50 dark:bg-red-900/20 font-medium">
                      ₹{put?.premium.toFixed(2) || '-'}
                    </td>
                    <td className="table-cell bg-red-50/50 dark:bg-red-900/20">
                      <span className={put?.change && put.change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                        {put?.change ? (put.change >= 0 ? '+' : '') + put.change + '%' : '-'}
                      </span>
                    </td>
                    <td className="table-cell bg-red-50/50 dark:bg-red-900/20">{put?.openInterest?.toLocaleString() || '-'}</td>
                    <td className="table-cell bg-red-50/50 dark:bg-red-900/20">{put?.volume?.toLocaleString() || '-'}</td>
                    <td className="table-cell bg-red-50/50 dark:bg-red-900/20">{put?.iv || '-'}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-center mt-4">
              <select className="input mr-4">
                <option>Weekly Expiry ({new Date(Date.now() + 86400000 * 3).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })})</option>
                <option>Next Week ({new Date(Date.now() + 86400000 * 10).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })})</option>
                <option>Monthly Expiry ({new Date(Date.now() + 86400000 * 24).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })})</option>
              </select>
              <button className="btn btn-primary flex items-center">
                <ChevronDown size={16} className="mr-1" />
                Show More Strikes
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 py-4 px-4 text-center text-gray-500 dark:text-gray-400 text-sm">
        <div className="container-fluid">
          <p>Copyright © 2025 of Datavtar Private Limited. All rights reserved.</p>
        </div>
      </footer>

      {/* Modals */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div 
            ref={modalRef}
            className="modal-content" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Settings Modal */}
            {modalType === 'settings' && (
              <>
                <div className="modal-header">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Settings</h3>
                  <button className="text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200" onClick={closeModal}>
                    <X size={24} />
                  </button>
                </div>
                <div className="mt-4 space-y-6">
                  <div>
                    <label className="form-label">Data Refresh Interval (seconds)</label>
                    <input 
                      type="range" 
                      min="5" 
                      max="60" 
                      step="5" 
                      className="w-full" 
                      value={settings.refreshInterval}
                      onChange={(e) => setSettings({...settings, refreshInterval: parseInt(e.target.value)})}
                    />
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span>5s</span>
                      <span>{settings.refreshInterval}s</span>
                      <span>60s</span>
                    </div>
                  </div>

                  <div>
                    <label className="form-label">Signal Confidence Threshold</label>
                    <input 
                      type="range" 
                      min="50" 
                      max="95" 
                      step="5" 
                      className="w-full" 
                      value={settings.signalThreshold}
                      onChange={(e) => setSettings({...settings, signalThreshold: parseInt(e.target.value)})}
                    />
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span>50%</span>
                      <span>{settings.signalThreshold}%</span>
                      <span>95%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="form-label m-0">Enable Notifications</label>
                    <button 
                      className={`theme-toggle ${settings.enableNotifications ? 'bg-primary-500' : 'bg-gray-200 dark:bg-slate-600'}`}
                      onClick={() => setSettings({...settings, enableNotifications: !settings.enableNotifications})}
                    >
                      <span 
                        className={`theme-toggle-thumb ${settings.enableNotifications ? 'translate-x-5' : 'translate-x-1'}`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="form-label m-0">Dark Mode</label>
                    <button 
                      className={`theme-toggle ${settings.darkMode ? 'bg-primary-500' : 'bg-gray-200 dark:bg-slate-600'}`}
                      onClick={() => setSettings({...settings, darkMode: !settings.darkMode})}
                    >
                      <span 
                        className={`theme-toggle-thumb ${settings.darkMode ? 'translate-x-5' : 'translate-x-1'}`}
                      />
                    </button>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    className="btn btn-primary"
                    onClick={closeModal}
                  >
                    Save Changes
                  </button>
                </div>
              </>
            )}

            {/* Notification Modal */}
            {modalType === 'notification' && (
              <>
                <div className="modal-header">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Notifications</h3>
                  <button className="text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200" onClick={closeModal}>
                    <X size={24} />
                  </button>
                </div>
                <div className="mt-2">
                  {notifications.length === 0 ? (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-8">No notifications</p>
                  ) : (
                    <div>
                      <div className="flex justify-end mb-2">
                        <button 
                          className="text-sm text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
                          onClick={markAllNotificationsAsRead}
                        >
                          Mark all as read
                        </button>
                      </div>
                      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {notifications.map(notification => (
                          <li key={notification.id} className={`py-4 ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                            <div className="flex items-start">
                              <div className="flex-shrink-0 mt-0.5">
                                {notification.type === 'success' && (
                                  <Check size={18} className="text-green-500 dark:text-green-400" />
                                )}
                                {notification.type === 'warning' && (
                                  <AlertTriangle size={18} className="text-yellow-500 dark:text-yellow-400" />
                                )}
                                {notification.type === 'error' && (
                                  <X size={18} className="text-red-500 dark:text-red-400" />
                                )}
                                {notification.type === 'info' && (
                                  <Info size={18} className="text-blue-500 dark:text-blue-400" />
                                )}
                              </div>
                              <div className="ml-3 flex-1">
                                <p className="text-sm text-gray-900 dark:text-gray-100">{notification.message}</p>
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                  {formatDate(notification.timestamp)}
                                </p>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Trade Detail Modal */}
            {modalType === 'trade' && selectedSignal && (
              <>
                <div className="modal-header">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Trade Details</h3>
                  <button className="text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200" onClick={closeModal}>
                    <X size={24} />
                  </button>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between mb-6">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${selectedSignal.type === 'BUY' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                      {selectedSignal.type === 'BUY' ? (
                        <ArrowUp size={14} className="mr-1" />
                      ) : (
                        <ArrowDown size={14} className="mr-1" />
                      )}
                      {selectedSignal.type} SIGNAL
                    </span>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${selectedSignal.status === 'OPEN' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : selectedSignal.result === 'PROFIT' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                      {selectedSignal.status === 'OPEN' ? 'OPEN' : selectedSignal.result}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Date & Time</p>
                      <p className="font-medium text-gray-900 dark:text-white">{formatDate(selectedSignal.timestamp)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Strike Price</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedSignal.strike}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Expiry Date</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedSignal.expiryDate}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Premium</p>
                      <p className="font-medium text-gray-900 dark:text-white">₹{selectedSignal.premium}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Confidence</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedSignal.confidence}%</p>
                    </div>
                    {selectedSignal.status === 'CLOSED' && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Profit/Loss</p>
                        <p className={`font-medium ${selectedSignal.profitLoss! >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {selectedSignal.profitLoss! >= 0 ? '+' : ''}
                          ₹{Math.abs(selectedSignal.profitLoss!).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mb-6">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Signal Notes</p>
                    <div className="bg-gray-50 dark:bg-slate-700 rounded-md p-3">
                      <p className="text-gray-700 dark:text-gray-300">{selectedSignal.notes}</p>
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-md p-4 mb-4">
                    <h4 className="text-blue-800 dark:text-blue-200 font-medium mb-2 flex items-center">
                      <Info size={16} className="mr-1" />
                      Trading Recommendation
                    </h4>
                    <p className="text-blue-700 dark:text-blue-300 text-sm">
                      {selectedSignal.type === 'BUY' ? (
                        `Buy ${selectedSignal.strike} CE at ₹${selectedSignal.premium} with a stop loss of ₹${Math.round(selectedSignal.premium * 0.7)} and target of ₹${Math.round(selectedSignal.premium * 1.5)}.`
                      ) : (
                        `Buy ${selectedSignal.strike} PE at ₹${selectedSignal.premium} with a stop loss of ₹${Math.round(selectedSignal.premium * 0.7)} and target of ₹${Math.round(selectedSignal.premium * 1.5)}.`
                      )}
                    </p>
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-gray-300 dark:hover:bg-slate-600" onClick={closeModal}>
                    Close
                  </button>
                  <button className="btn btn-primary flex items-center">
                    <Share size={16} className="mr-1" />
                    Share
                  </button>
                </div>
              </>
            )}

            {/* Data Sources Modal */}
            {modalType === 'dataSources' && (
              <>
                <div className="modal-header">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Live Data Sources</h3>
                  <button className="text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200" onClick={closeModal}>
                    <X size={24} />
                  </button>
                </div>
                <div className="mt-4">
                  <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                    <div className="flex items-start">
                      <Info size={18} className="text-blue-500 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        The system automatically selects the most reliable data source based on historical performance, response time, and data accuracy. Sources are checked every 2 hours.
                      </p>
                    </div>
                    <p className="text-xs text-blue-600 dark:text-blue-300 mt-2">
                      Last full check: {formatDate(lastSourceCheck)}
                    </p>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="table w-full">
                      <thead className="table-header">
                        <tr>
                          <th className="table-cell">Source</th>
                          <th className="table-cell">Status</th>
                          <th className="table-cell">Trust Score</th>
                          <th className="table-cell">Last Value</th>
                          <th className="table-cell">Response Time</th>
                          <th className="table-cell">Last Updated</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                        {dataSources.sort((a, b) => b.trustScore - a.trustScore).map(source => (
                          <tr key={source.id} className={`hover:bg-gray-50 dark:hover:bg-slate-700 ${source.id === activeSource ? 'bg-green-50 dark:bg-green-900/20' : ''}`}>
                            <td className="table-cell font-medium flex items-center">
                              {source.id === activeSource && (
                                <div className={`${styles.pulsingDot} mr-2`}></div>
                              )}
                              {source.name}
                              {source.id === activeSource && (
                                <span className="ml-1 text-xs text-green-600 dark:text-green-400">(Active)</span>
                              )}
                            </td>
                            <td className="table-cell">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${source.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : source.status === 'error' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                                {source.status.charAt(0).toUpperCase() + source.status.slice(1)}
                              </span>
                            </td>
                            <td className="table-cell">
                              <div className="flex items-center">
                                <div className="w-16 bg-gray-200 rounded-full h-1.5 dark:bg-gray-700 mr-2">
                                  <div 
                                    className={`h-1.5 rounded-full ${source.trustScore >= 85 ? 'bg-green-500' : source.trustScore >= 75 ? 'bg-blue-500' : source.trustScore >= 65 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                                    style={{ width: `${source.trustScore}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs">{source.trustScore.toFixed(1)}</span>
                              </div>
                            </td>
                            <td className="table-cell">
                              {source.lastValue ? (
                                <span className="font-medium">
                                  {source.lastValue.toLocaleString('en-IN', {maximumFractionDigits: 2})}
                                </span>
                              ) : '-'}
                            </td>
                            <td className="table-cell">
                              {source.responseTime ? `${source.responseTime}ms` : '-'}
                            </td>
                            <td className="table-cell text-xs">
                              {source.lastFetched ? formatDate(source.lastFetched) : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Recent Activity Logs</h4>
                    <div className="bg-gray-50 dark:bg-slate-700 rounded-md p-3 max-h-40 overflow-y-auto">
                      {fetchingLogs.slice(0, 10).map((log, index) => (
                        <div key={index} className={`text-xs mb-1 pb-1 ${index < fetchingLogs.length - 1 ? 'border-b border-gray-200 dark:border-slate-600' : ''}`}>
                          <span className={`${log.type === 'error' ? 'text-red-600 dark:text-red-400' : log.type === 'warning' ? 'text-yellow-600 dark:text-yellow-400' : 'text-blue-600 dark:text-blue-400'}`}>
                            [{new Date(log.timestamp).toLocaleTimeString()}]
                          </span>
                          <span className="ml-2 text-gray-700 dark:text-gray-300">{log.message}</span>
                        </div>
                      ))}
                      {fetchingLogs.length === 0 && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">No activity logs available</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-gray-300 dark:hover:bg-slate-600" onClick={closeModal}>
                    Close
                  </button>
                  <button 
                    className="btn btn-primary flex items-center"
                    onClick={checkAndUpdateDataSources}
                  >
                    <RefreshCw size={16} className="mr-1" />
                    Check Now
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Mobile alert for new signal */}
      {signals.length > 0 && signals[0].status === 'OPEN' && (
        <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:w-80 bg-white dark:bg-slate-800 shadow-lg rounded-lg overflow-hidden border border-primary-500 dark:border-primary-400 z-50">
          <div className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <Zap size={18} className="text-yellow-500 dark:text-yellow-400 mr-2" />
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">New Trading Signal</h3>
              </div>
              <button className="text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200">
                <X size={18} />
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {signals[0].type} signal for NIFTY {signals[0].strike} {signals[0].type === 'BUY' ? 'CE' : 'PE'} generated with {signals[0].confidence}% confidence.
            </p>
            <div className="mt-3 flex justify-end">
              <button 
                className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium flex items-center"
                onClick={() => openModal('trade', signals[0])}
              >
                View Details <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
