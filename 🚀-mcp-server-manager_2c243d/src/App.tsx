import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './contexts/authContext';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import { 
  Server, 
  Settings, 
  Users, 
  Activity, 
  Code, 
  Monitor, 
  FileText, 
  Download, 
  Upload, 
  Plus, 
  Edit, 
  Trash2, 
  Play, 
  Pause, 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  Eye,
  Copy,
  Search,
  Filter,
  BarChart3,
  Zap,
  Globe,
  Database,
  Terminal,
  Moon,
  Sun,
  LogOut,
  Key,
  Cpu,
  Network,
  MessageSquare,
  Clock,
  TrendingUp,
  Shield,
  RefreshCw,
  ExternalLink,
  Wrench,
  BookOpen,
  Brain, X
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Types and Interfaces
interface MCPServer {
  id: string;
  name: string;
  description: string;
  port: number;
  protocol: 'stdio' | 'sse' | 'websocket';
  status: 'running' | 'stopped' | 'error' | 'starting';
  createdAt: string;
  lastModified: string;
  config: MCPServerConfig;
  agents: Agent[];
  metrics: ServerMetrics;
}

interface MCPServerConfig {
  name: string;
  version: string;
  description: string;
  author: string;
  license: string;
  capabilities: {
    resources: boolean;
    tools: boolean;
    prompts: boolean;
    logging: boolean;
  };
  resources: Resource[];
  tools: Tool[];
  prompts: Prompt[];
  environment: Record<string, string>;
  dependencies: string[];
}

interface Agent {
  id: string;
  name: string;
  type: 'claude' | 'gpt' | 'custom';
  status: 'connected' | 'disconnected' | 'error';
  lastSeen: string;
  messagesExchanged: number;
  connectionTime: string;
  clientInfo: {
    name: string;
    version: string;
    userAgent?: string;
  };
}

interface Resource {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
}

interface Tool {
  name: string;
  description: string;
  inputSchema: any;
}

interface Prompt {
  name: string;
  description: string;
  arguments: any[];
}

interface ServerMetrics {
  uptime: number;
  totalRequests: number;
  totalResponses: number;
  errorCount: number;
  averageResponseTime: number;
  memoryUsage: number;
  cpuUsage: number;
}

interface ServerTemplate {
  name: string;
  description: string;
  config: Partial<MCPServerConfig>;
}

// Dark mode hook
const useDarkMode = () => {
  const [isDark, setIsDark] = useState(false);
  
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldUseDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    
    setIsDark(shouldUseDark);
    document.documentElement.classList.toggle('dark', shouldUseDark);
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        setIsDark(e.matches);
        document.documentElement.classList.toggle('dark', e.matches);
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  const toggleDarkMode = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    localStorage.setItem('theme', newIsDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newIsDark);
  };
  
  return { isDark, toggleDarkMode };
};

const App: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { isDark, toggleDarkMode } = useDarkMode();
  const aiLayerRef = useRef<AILayerHandle>(null);

  // Core state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [servers, setServers] = useState<MCPServer[]>([]);
  const [selectedServer, setSelectedServer] = useState<MCPServer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // Form states
  const [serverForm, setServerForm] = useState<Partial<MCPServer>>({});
  const [agentForm, setAgentForm] = useState<Partial<Agent>>({});
  const [importData, setImportData] = useState('');

  // AI states
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiError, setAiError] = useState<any | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Settings state
  const [settings, setSettings] = useState({
    autoRefresh: true,
    refreshInterval: 5000,
    theme: 'system',
    notifications: true,
    defaultProtocol: 'stdio' as const,
    maxAgentsPerServer: 10
  });

  // Load data on mount
  useEffect(() => {
    loadServers();
    loadSettings();
  }, []);

  // Auto-refresh effect
  useEffect(() => {
    if (settings.autoRefresh && activeTab === 'dashboard') {
      const interval = setInterval(() => {
        updateServerMetrics();
      }, settings.refreshInterval);
      return () => clearInterval(interval);
    }
  }, [settings.autoRefresh, settings.refreshInterval, activeTab]);

  // Data management functions
  const loadServers = () => {
    const saved = localStorage.getItem('mcp_servers');
    if (saved) {
      const parsedServers = JSON.parse(saved);
      setServers(parsedServers);
      if (parsedServers.length > 0) {
        setSelectedServer(parsedServers[0]);
      }
    } else {
      // Initialize with sample data
      const sampleServers = generateSampleServers();
      setServers(sampleServers);
      setSelectedServer(sampleServers[0]);
      localStorage.setItem('mcp_servers', JSON.stringify(sampleServers));
    }
  };

  const saveServers = (updatedServers: MCPServer[]) => {
    setServers(updatedServers);
    localStorage.setItem('mcp_servers', JSON.stringify(updatedServers));
  };

  const loadSettings = () => {
    const saved = localStorage.getItem('mcp_settings');
    if (saved) {
      setSettings({ ...settings, ...JSON.parse(saved) });
    }
  };

  const saveSettings = (newSettings: typeof settings) => {
    setSettings(newSettings);
    localStorage.setItem('mcp_settings', JSON.stringify(newSettings));
  };

  const generateSampleServers = (): MCPServer[] => {
    return [
      {
        id: '1',
        name: 'File System MCP',
        description: 'MCP server for file system operations',
        port: 3000,
        protocol: 'stdio',
        status: 'running',
        createdAt: '2025-06-10T10:00:00Z',
        lastModified: '2025-06-14T09:30:00Z',
        config: {
          name: 'filesystem-mcp',
          version: '1.0.0',
          description: 'Provides file system access capabilities',
          author: 'AI Engineer',
          license: 'MIT',
          capabilities: {
            resources: true,
            tools: true,
            prompts: false,
            logging: true
          },
          resources: [
            {
              uri: 'file:///workspace',
              name: 'Workspace',
              description: 'Main workspace directory',
              mimeType: 'application/directory'
            }
          ],
          tools: [
            {
              name: 'read_file',
              description: 'Read contents of a file',
              inputSchema: {
                type: 'object',
                properties: {
                  path: { type: 'string', description: 'File path to read' }
                },
                required: ['path']
              }
            },
            {
              name: 'write_file',
              description: 'Write contents to a file',
              inputSchema: {
                type: 'object',
                properties: {
                  path: { type: 'string', description: 'File path to write' },
                  content: { type: 'string', description: 'Content to write' }
                },
                required: ['path', 'content']
              }
            }
          ],
          prompts: [],
          environment: {
            'WORKSPACE_PATH': '/workspace',
            'MAX_FILE_SIZE': '10MB'
          },
          dependencies: ['fs', 'path']
        },
        agents: [
          {
            id: 'agent1',
            name: 'Claude Assistant',
            type: 'claude',
            status: 'connected',
            lastSeen: '2025-06-14T09:45:00Z',
            messagesExchanged: 1247,
            connectionTime: '2025-06-14T08:00:00Z',
            clientInfo: {
              name: 'Claude Desktop',
              version: '1.2.3'
            }
          },
          {
            id: 'agent2',
            name: 'GPT Agent',
            type: 'gpt',
            status: 'connected',
            lastSeen: '2025-06-14T09:40:00Z',
            messagesExchanged: 892,
            connectionTime: '2025-06-14T07:30:00Z',
            clientInfo: {
              name: 'GPT Client',
              version: '2.1.0'
            }
          }
        ],
        metrics: {
          uptime: 86400,
          totalRequests: 2139,
          totalResponses: 2139,
          errorCount: 12,
          averageResponseTime: 45,
          memoryUsage: 128,
          cpuUsage: 15
        }
      },
      {
        id: '2',
        name: 'Database MCP',
        description: 'MCP server for database operations',
        port: 3001,
        protocol: 'websocket',
        status: 'running',
        createdAt: '2025-06-12T14:20:00Z',
        lastModified: '2025-06-14T08:15:00Z',
        config: {
          name: 'database-mcp',
          version: '2.1.0',
          description: 'Database query and management capabilities',
          author: 'AI Engineer',
          license: 'MIT',
          capabilities: {
            resources: true,
            tools: true,
            prompts: true,
            logging: true
          },
          resources: [
            {
              uri: 'db://localhost:5432/main',
              name: 'Main Database',
              description: 'Primary application database',
              mimeType: 'application/sql'
            }
          ],
          tools: [
            {
              name: 'execute_query',
              description: 'Execute SQL query',
              inputSchema: {
                type: 'object',
                properties: {
                  query: { type: 'string', description: 'SQL query to execute' },
                  parameters: { type: 'array', description: 'Query parameters' }
                },
                required: ['query']
              }
            }
          ],
          prompts: [
            {
              name: 'generate_report',
              description: 'Generate database report',
              arguments: [
                { name: 'table', type: 'string', description: 'Table name' },
                { name: 'period', type: 'string', description: 'Time period' }
              ]
            }
          ],
          environment: {
            'DB_HOST': 'localhost',
            'DB_PORT': '5432',
            'DB_NAME': 'main'
          },
          dependencies: ['pg', 'sql-formatter']
        },
        agents: [
          {
            id: 'agent3',
            name: 'Data Analyst AI',
            type: 'custom',
            status: 'connected',
            lastSeen: '2025-06-14T09:42:00Z',
            messagesExchanged: 456,
            connectionTime: '2025-06-14T06:00:00Z',
            clientInfo: {
              name: 'Custom Analytics Client',
              version: '1.0.0'
            }
          }
        ],
        metrics: {
          uptime: 72000,
          totalRequests: 456,
          totalResponses: 456,
          errorCount: 3,
          averageResponseTime: 120,
          memoryUsage: 256,
          cpuUsage: 8
        }
      },
      {
        id: '3',
        name: 'API Gateway MCP',
        description: 'MCP server for external API integrations',
        port: 3002,
        protocol: 'sse',
        status: 'stopped',
        createdAt: '2025-06-13T16:45:00Z',
        lastModified: '2025-06-14T07:00:00Z',
        config: {
          name: 'api-gateway-mcp',
          version: '1.5.2',
          description: 'External API integration and management',
          author: 'AI Engineer',
          license: 'Apache-2.0',
          capabilities: {
            resources: false,
            tools: true,
            prompts: true,
            logging: true
          },
          resources: [],
          tools: [
            {
              name: 'http_request',
              description: 'Make HTTP requests',
              inputSchema: {
                type: 'object',
                properties: {
                  url: { type: 'string', description: 'Request URL' },
                  method: { type: 'string', enum: ['GET', 'POST', 'PUT', 'DELETE'] },
                  headers: { type: 'object', description: 'Request headers' },
                  body: { type: 'object', description: 'Request body' }
                },
                required: ['url', 'method']
              }
            }
          ],
          prompts: [
            {
              name: 'api_documentation',
              description: 'Generate API documentation',
              arguments: [
                { name: 'endpoint', type: 'string', description: 'API endpoint' }
              ]
            }
          ],
          environment: {
            'API_TIMEOUT': '30000',
            'MAX_RETRIES': '3'
          },
          dependencies: ['axios', 'retry-axios']
        },
        agents: [],
        metrics: {
          uptime: 0,
          totalRequests: 0,
          totalResponses: 0,
          errorCount: 0,
          averageResponseTime: 0,
          memoryUsage: 0,
          cpuUsage: 0
        }
      }
    ];
  };

  const updateServerMetrics = () => {
    const updatedServers = servers.map(server => ({
      ...server,
      metrics: {
        ...server.metrics,
        uptime: server.status === 'running' ? server.metrics.uptime + 5 : 0,
        totalRequests: server.metrics.totalRequests + Math.floor(Math.random() * 5),
        totalResponses: server.metrics.totalResponses + Math.floor(Math.random() * 5),
        cpuUsage: Math.max(0, Math.min(100, server.metrics.cpuUsage + (Math.random() - 0.5) * 10)),
        memoryUsage: Math.max(0, Math.min(1024, server.metrics.memoryUsage + (Math.random() - 0.5) * 20))
      }
    }));
    saveServers(updatedServers);
  };

  // Server management functions
  const createServer = () => {
    if (!serverForm.name || !serverForm.port) return;

    const newServer: MCPServer = {
      id: Date.now().toString(),
      name: serverForm.name,
      description: serverForm.description || '',
      port: serverForm.port,
      protocol: serverForm.protocol || 'stdio',
      status: 'stopped',
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      config: {
        name: serverForm.name.toLowerCase().replace(/\s+/g, '-'),
        version: '1.0.0',
        description: serverForm.description || '',
        author: currentUser?.first_name + ' ' + currentUser?.last_name || 'Unknown',
        license: 'MIT',
        capabilities: {
          resources: true,
          tools: true,
          prompts: true,
          logging: true
        },
        resources: [],
        tools: [],
        prompts: [],
        environment: {},
        dependencies: []
      },
      agents: [],
      metrics: {
        uptime: 0,
        totalRequests: 0,
        totalResponses: 0,
        errorCount: 0,
        averageResponseTime: 0,
        memoryUsage: 0,
        cpuUsage: 0
      }
    };

    const updatedServers = [...servers, newServer];
    saveServers(updatedServers);
    setServerForm({});
    setShowCreateModal(false);
  };

  const updateServer = () => {
    if (!selectedServer || !serverForm.name || !serverForm.port) return;

    const updatedServers = servers.map(server =>
      server.id === selectedServer.id
        ? {
            ...server,
            ...serverForm,
            lastModified: new Date().toISOString()
          }
        : server
    );

    saveServers(updatedServers);
    setSelectedServer(updatedServers.find(s => s.id === selectedServer.id) || null);
    setServerForm({});
    setShowEditModal(false);
  };

  const deleteServer = () => {
    if (!selectedServer) return;

    const updatedServers = servers.filter(server => server.id !== selectedServer.id);
    saveServers(updatedServers);
    setSelectedServer(updatedServers[0] || null);
    setShowDeleteModal(false);
  };

  const toggleServerStatus = (serverId: string) => {
    const updatedServers = servers.map(server => {
      if (server.id === serverId) {
        const newStatus = server.status === 'running' ? 'stopped' : 'running';
        return {
          ...server,
          status: newStatus,
          lastModified: new Date().toISOString()
        };
      }
      return server;
    });
    saveServers(updatedServers);
    if (selectedServer?.id === serverId) {
      setSelectedServer(updatedServers.find(s => s.id === serverId) || null);
    }
  };

  // Agent management functions
  const addAgent = () => {
    if (!selectedServer || !agentForm.name || !agentForm.type) return;

    const newAgent: Agent = {
      id: Date.now().toString(),
      name: agentForm.name,
      type: agentForm.type,
      status: 'disconnected',
      lastSeen: new Date().toISOString(),
      messagesExchanged: 0,
      connectionTime: new Date().toISOString(),
      clientInfo: {
        name: agentForm.name,
        version: '1.0.0'
      }
    };

    const updatedServers = servers.map(server =>
      server.id === selectedServer.id
        ? {
            ...server,
            agents: [...server.agents, newAgent],
            lastModified: new Date().toISOString()
          }
        : server
    );

    saveServers(updatedServers);
    setSelectedServer(updatedServers.find(s => s.id === selectedServer.id) || null);
    setAgentForm({});
    setShowAgentModal(false);
  };

  const removeAgent = (agentId: string) => {
    if (!selectedServer) return;

    const updatedServers = servers.map(server =>
      server.id === selectedServer.id
        ? {
            ...server,
            agents: server.agents.filter(agent => agent.id !== agentId),
            lastModified: new Date().toISOString()
          }
        : server
    );

    saveServers(updatedServers);
    setSelectedServer(updatedServers.find(s => s.id === selectedServer.id) || null);
  };

  // AI functions
  const handleAIOptimization = () => {
    if (!selectedServer) return;

    const prompt = `Analyze this MCP server configuration and provide optimization suggestions:

Server: ${selectedServer.name}
Protocol: ${selectedServer.protocol}
Current Status: ${selectedServer.status}
Agents Connected: ${selectedServer.agents.length}
Error Count: ${selectedServer.metrics.errorCount}
Average Response Time: ${selectedServer.metrics.averageResponseTime}ms
CPU Usage: ${selectedServer.metrics.cpuUsage}%
Memory Usage: ${selectedServer.metrics.memoryUsage}MB

Configuration:
${JSON.stringify(selectedServer.config, null, 2)}

Please provide optimization recommendations in JSON format with the following structure:
{
  "performance_improvements": ["suggestion1", "suggestion2"],
  "security_recommendations": ["security1", "security2"],
  "configuration_optimizations": ["config1", "config2"],
  "resource_management": ["resource1", "resource2"],
  "monitoring_suggestions": ["monitor1", "monitor2"]
}`;

    setAiPrompt(prompt);
    setAiResult(null);
    setAiError(null);

    aiLayerRef.current?.sendToAI(prompt);
  };

  const handleConfigGeneration = () => {
    const prompt = `Generate a comprehensive MCP server configuration for: ${aiPrompt}

Please provide a complete MCP server configuration in JSON format with the following structure:
{
  "name": "server-name",
  "version": "1.0.0",
  "description": "Server description",
  "author": "AI Engineer",
  "license": "MIT",
  "capabilities": {
    "resources": true,
    "tools": true,
    "prompts": true,
    "logging": true
  },
  "resources": [
    {
      "uri": "resource_uri",
      "name": "Resource Name",
      "description": "Resource description",
      "mimeType": "mime/type"
    }
  ],
  "tools": [
    {
      "name": "tool_name",
      "description": "Tool description",
      "inputSchema": {
        "type": "object",
        "properties": {},
        "required": []
      }
    }
  ],
  "prompts": [
    {
      "name": "prompt_name",
      "description": "Prompt description",
      "arguments": []
    }
  ],
  "environment": {},
  "dependencies": []
}`;

    setAiResult(null);
    setAiError(null);

    aiLayerRef.current?.sendToAI(prompt);
  };

  // Export/Import functions
  const exportServers = () => {
    const dataStr = JSON.stringify(servers, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `mcp-servers-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const exportServerConfig = (server: MCPServer) => {
    const configStr = JSON.stringify(server.config, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(configStr);
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', `${server.name.toLowerCase().replace(/\s+/g, '-')}-config.json`);
    linkElement.click();
  };

  const downloadTemplate = () => {
    const template = {
      name: "example-mcp-server",
      version: "1.0.0",
      description: "Example MCP server configuration",
      author: "Your Name",
      license: "MIT",
      capabilities: {
        resources: true,
        tools: true,
        prompts: true,
        logging: true
      },
      resources: [
        {
          uri: "example://resource",
          name: "Example Resource",
          description: "An example resource",
          mimeType: "application/json"
        }
      ],
      tools: [
        {
          name: "example_tool",
          description: "An example tool",
          inputSchema: {
            type: "object",
            properties: {
              input: {
                type: "string",
                description: "Input parameter"
              }
            },
            required: ["input"]
          }
        }
      ],
      prompts: [
        {
          name: "example_prompt",
          description: "An example prompt",
          arguments: [
            {
              name: "context",
              type: "string",
              description: "Context for the prompt"
            }
          ]
        }
      ],
      environment: {
        "EXAMPLE_VAR": "example_value"
      },
      dependencies: ["dependency1", "dependency2"]
    };

    const templateStr = JSON.stringify(template, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(templateStr);
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', 'mcp-server-template.json');
    linkElement.click();
  };

  const importServers = () => {
    try {
      const importedData = JSON.parse(importData);
      if (Array.isArray(importedData)) {
        const validServers = importedData.filter(item => 
          item.name && item.port && item.config
        );
        const updatedServers = [...servers, ...validServers];
        saveServers(updatedServers);
        setImportData('');
        setShowImportModal(false);
      }
    } catch (error) {
      setAiError('Invalid JSON format');
    }
  };

  // Utility functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-green-600 dark:text-green-400';
      case 'stopped': return 'text-gray-600 dark:text-gray-400';
      case 'error': return 'text-red-600 dark:text-red-400';
      case 'starting': return 'text-yellow-600 dark:text-yellow-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <CheckCircle className="w-4 h-4" />;
      case 'stopped': return <XCircle className="w-4 h-4" />;
      case 'error': return <AlertCircle className="w-4 h-4" />;
      case 'starting': return <RefreshCw className="w-4 h-4 animate-spin" />;
      default: return <XCircle className="w-4 h-4" />;
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const filteredServers = servers.filter(server => {
    const matchesSearch = server.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         server.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || server.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Chart data
  const getChartData = () => {
    return servers.map(server => ({
      name: server.name,
      requests: server.metrics.totalRequests,
      responses: server.metrics.totalResponses,
      errors: server.metrics.errorCount,
      cpu: server.metrics.cpuUsage,
      memory: server.metrics.memoryUsage,
      responseTime: server.metrics.averageResponseTime
    }));
  };

  const getStatusDistribution = () => {
    const statusCounts = servers.reduce((acc, server) => {
      acc[server.status] = (acc[server.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status,
      value: count,
      color: status === 'running' ? '#22c55e' : status === 'error' ? '#ef4444' : '#64748b'
    }));
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div id="welcome_fallback" className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-xl">
                <Server className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">MCP Server Manager</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Model Context Protocol Server Management</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>{servers.filter(s => s.status === 'running').length} Active</span>
              </div>
              
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span>Welcome, {currentUser.first_name}</span>
                <button
                  onClick={logout}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Monitor },
              { id: 'servers', label: 'Servers', icon: Server },
              { id: 'agents', label: 'Agents', icon: Users },
              { id: 'monitoring', label: 'Monitoring', icon: Activity },
              { id: 'config', label: 'Configuration', icon: Code },
              { id: 'ai-assistant', label: 'AI Assistant', icon: Brain },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  id={`${tab.id}-tab`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div id="generation_issue_fallback" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Servers</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{servers.length}</p>
                  </div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Server className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Servers</p>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                      {servers.filter(s => s.status === 'running').length}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Connected Agents</p>
                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                      {servers.reduce((acc, server) => acc + server.agents.length, 0)}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Requests</p>
                    <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                      {servers.reduce((acc, server) => acc + server.metrics.totalRequests, 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Server Performance</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={getChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="requests" fill="#3b82f6" />
                    <Bar dataKey="errors" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Server Status Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={getStatusDistribution()}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {getStatusDistribution().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Servers</h3>
              <div className="space-y-4">
                {servers.slice(0, 5).map((server) => (
                  <div key={server.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center gap-2 ${getStatusColor(server.status)}`}>
                        {getStatusIcon(server.status)}
                        <span className="font-medium">{server.name}</span>
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {server.protocol.toUpperCase()} • Port {server.port}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span>{server.agents.length} agents</span>
                      <span>{server.metrics.totalRequests} requests</span>
                      <button
                        onClick={() => toggleServerStatus(server.id)}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          server.status === 'running'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        }`}
                      >
                        {server.status === 'running' ? 'Stop' : 'Start'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Servers Tab */}
        {activeTab === 'servers' && (
          <div className="space-y-6">
            {/* Server Management Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">MCP Servers</h2>
                <p className="text-gray-600 dark:text-gray-400">Manage your Model Context Protocol servers</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowImportModal(true)}
                  className="btn btn-secondary flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Import
                </button>
                <button
                  onClick={exportServers}
                  className="btn btn-secondary flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create Server
                </button>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search servers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10 w-full"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="select"
                >
                  <option value="all">All Status</option>
                  <option value="running">Running</option>
                  <option value="stopped">Stopped</option>
                  <option value="error">Error</option>
                </select>
              </div>
            </div>

            {/* Servers Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredServers.map((server) => (
                <div key={server.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center gap-2 ${getStatusColor(server.status)}`}>
                        {getStatusIcon(server.status)}
                        <h3 className="font-semibold text-gray-900 dark:text-white">{server.name}</h3>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setSelectedServer(server);
                          setServerForm(server);
                          setShowEditModal(true);
                        }}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        title="Edit Server"
                      >
                        <Edit className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedServer(server);
                          setShowDeleteModal(true);
                        }}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        title="Delete Server"
                      >
                        <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                      </button>
                    </div>
                  </div>

                  <p className="text-gray-600 dark:text-gray-400 mb-4">{server.description}</p>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Protocol</span>
                      <span className="font-medium text-gray-900 dark:text-white">{server.protocol.toUpperCase()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Port</span>
                      <span className="font-medium text-gray-900 dark:text-white">{server.port}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Agents</span>
                      <span className="font-medium text-gray-900 dark:text-white">{server.agents.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Uptime</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {server.status === 'running' ? formatUptime(server.metrics.uptime) : 'Stopped'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <button
                      onClick={() => toggleServerStatus(server.id)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        server.status === 'running'
                          ? 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800'
                          : 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800'
                      }`}
                    >
                      {server.status === 'running' ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                      {server.status === 'running' ? 'Stop' : 'Start'}
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedServer(server)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </button>
                      <button
                        onClick={() => exportServerConfig(server)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Export Config"
                      >
                        <Download className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredServers.length === 0 && (
              <div className="text-center py-12">
                <Server className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No servers found</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {searchTerm || filterStatus !== 'all' ? 'Try adjusting your search or filter' : 'Get started by creating your first MCP server'}
                </p>
                {!searchTerm && filterStatus === 'all' && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="btn btn-primary"
                  >
                    Create Your First Server
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Agents Tab */}
        {activeTab === 'agents' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Agent Management</h2>
                <p className="text-gray-600 dark:text-gray-400">Manage AI agents connected to your MCP servers</p>
              </div>
              {selectedServer && (
                <button
                  onClick={() => setShowAgentModal(true)}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Agent
                </button>
              )}
            </div>

            {/* Server Selection */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Select Server</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {servers.map((server) => (
                  <button
                    key={server.id}
                    onClick={() => setSelectedServer(server)}
                    className={`p-4 text-left rounded-lg border-2 transition-colors ${
                      selectedServer?.id === server.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={getStatusColor(server.status)}>
                        {getStatusIcon(server.status)}
                      </div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{server.name}</h4>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {server.agents.length} agents connected
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Agents List */}
            {selectedServer && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Agents for {selectedServer.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {selectedServer.agents.length} agents connected
                  </p>
                </div>

                <div className="p-6">
                  {selectedServer.agents.length > 0 ? (
                    <div className="space-y-4">
                      {selectedServer.agents.map((agent) => (
                        <div key={agent.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className={`w-3 h-3 rounded-full ${
                              agent.status === 'connected' ? 'bg-green-500' : 
                              agent.status === 'error' ? 'bg-red-500' : 'bg-gray-500'
                            }`}></div>
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-white">{agent.name}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {agent.type.toUpperCase()} • {agent.clientInfo.name} v{agent.clientInfo.version}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right text-sm">
                              <p className="text-gray-900 dark:text-white font-medium">
                                {agent.messagesExchanged} messages
                              </p>
                              <p className="text-gray-600 dark:text-gray-400">
                                Last seen: {new Date(agent.lastSeen).toLocaleTimeString()}
                              </p>
                            </div>
                            <button
                              onClick={() => removeAgent(agent.id)}
                              className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors"
                              title="Remove Agent"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No agents connected</h4>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Add your first agent to start using this MCP server
                      </p>
                      <button
                        onClick={() => setShowAgentModal(true)}
                        className="btn btn-primary"
                      >
                        Add Agent
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Monitoring Tab */}
        {activeTab === 'monitoring' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Server Monitoring</h2>
                <p className="text-gray-600 dark:text-gray-400">Real-time monitoring and analytics</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Auto-refresh: {settings.autoRefresh ? 'On' : 'Off'}</span>
                </div>
                <button
                  onClick={updateServerMetrics}
                  className="btn btn-secondary flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Request Volume</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={getChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="requests" stroke="#3b82f6" strokeWidth={2} />
                    <Line type="monotone" dataKey="responses" stroke="#22c55e" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Response Times</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={getChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="responseTime" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Resource Usage */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">CPU Usage</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={getChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="cpu" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Memory Usage</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={getChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="memory" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Server Status Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Server Status</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Server
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Uptime
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Requests
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Errors
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Avg Response
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        CPU
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Memory
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {servers.map((server) => (
                      <tr key={server.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className={getStatusColor(server.status)}>
                              {getStatusIcon(server.status)}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {server.name}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {server.protocol}:{server.port}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            server.status === 'running' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            server.status === 'error' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                          }`}>
                            {server.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {server.status === 'running' ? formatUptime(server.metrics.uptime) : '--'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {server.metrics.totalRequests.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {server.metrics.errorCount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {server.metrics.averageResponseTime}ms
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {server.metrics.cpuUsage.toFixed(1)}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {server.metrics.memoryUsage}MB
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Configuration Tab */}
        {activeTab === 'config' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Server Configuration</h2>
                <p className="text-gray-600 dark:text-gray-400">Manage MCP server configurations</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={downloadTemplate}
                  className="btn btn-secondary flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download Template
                </button>
              </div>
            </div>

            {/* Server Selection for Config */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Select Server</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {servers.map((server) => (
                  <button
                    key={server.id}
                    onClick={() => setSelectedServer(server)}
                    className={`p-4 text-left rounded-lg border-2 transition-colors ${
                      selectedServer?.id === server.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={getStatusColor(server.status)}>
                        {getStatusIcon(server.status)}
                      </div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{server.name}</h4>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      v{server.config.version} • {server.config.license}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Configuration Editor */}
            {selectedServer && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Configuration for {selectedServer.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowConfigModal(true)}
                      className="btn btn-secondary flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => exportServerConfig(selectedServer)}
                      className="btn btn-secondary flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Export
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Basic Info */}
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">Basic Information</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm text-gray-600 dark:text-gray-400">Name</label>
                          <p className="font-medium text-gray-900 dark:text-white">{selectedServer.config.name}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600 dark:text-gray-400">Version</label>
                          <p className="font-medium text-gray-900 dark:text-white">{selectedServer.config.version}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600 dark:text-gray-400">Author</label>
                          <p className="font-medium text-gray-900 dark:text-white">{selectedServer.config.author}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600 dark:text-gray-400">License</label>
                          <p className="font-medium text-gray-900 dark:text-white">{selectedServer.config.license}</p>
                        </div>
                      </div>
                    </div>

                    {/* Capabilities */}
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">Capabilities</h4>
                      <div className="space-y-2">
                        {Object.entries(selectedServer.config.capabilities).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              value ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                              'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                            }`}>
                              {value ? 'Enabled' : 'Disabled'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Resources */}
                  <div className="mt-6">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">Resources ({selectedServer.config.resources.length})</h4>
                    {selectedServer.config.resources.length > 0 ? (
                      <div className="space-y-3">
                        {selectedServer.config.resources.map((resource, index) => (
                          <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-medium text-gray-900 dark:text-white">{resource.name}</h5>
                              <span className="text-xs text-gray-500 dark:text-gray-400">{resource.mimeType}</span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{resource.description}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{resource.uri}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400">No resources configured</p>
                    )}
                  </div>

                  {/* Tools */}
                  <div className="mt-6">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">Tools ({selectedServer.config.tools.length})</h4>
                    {selectedServer.config.tools.length > 0 ? (
                      <div className="space-y-3">
                        {selectedServer.config.tools.map((tool, index) => (
                          <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <h5 className="font-medium text-gray-900 dark:text-white mb-1">{tool.name}</h5>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{tool.description}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400">No tools configured</p>
                    )}
                  </div>

                  {/* Environment Variables */}
                  <div className="mt-6">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">Environment Variables</h4>
                    {Object.keys(selectedServer.config.environment).length > 0 ? (
                      <div className="space-y-2">
                        {Object.entries(selectedServer.config.environment).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{key}</span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">{value}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400">No environment variables configured</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* AI Assistant Tab */}
        {activeTab === 'ai-assistant' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">AI Assistant</h2>
                <p className="text-gray-600 dark:text-gray-400">Get AI-powered help with MCP server management</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* AI Actions */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={handleAIOptimization}
                    disabled={!selectedServer || isAiLoading}
                    className="w-full btn btn-primary flex items-center gap-2 justify-center"
                  >
                    <Zap className="w-4 h-4" />
                    {isAiLoading ? 'Analyzing...' : 'Optimize Selected Server'}
                  </button>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Generate Configuration For:
                    </label>
                    <textarea
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="E.g., 'A file system server with read/write capabilities' or 'A database server for PostgreSQL'"
                      className="textarea w-full h-20"
                    />
                    <button
                      onClick={handleConfigGeneration}
                      disabled={!aiPrompt.trim() || isAiLoading}
                      className="w-full btn btn-secondary flex items-center gap-2 justify-center"
                    >
                      <Brain className="w-4 h-4" />
                      {isAiLoading ? 'Generating...' : 'Generate Configuration'}
                    </button>
                  </div>
                </div>

                {selectedServer && (
                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">Selected Server</h4>
                    <p className="text-sm text-blue-800 dark:text-blue-300">{selectedServer.name}</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      {selectedServer.agents.length} agents • {selectedServer.metrics.totalRequests} requests
                    </p>
                  </div>
                )}
              </div>

              {/* AI Response */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">AI Response</h3>
                
                {isAiLoading && (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600 dark:text-gray-400">AI is analyzing...</span>
                  </div>
                )}

                {aiError && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-red-800 dark:text-red-200">Error: {aiError.toString()}</p>
                  </div>
                )}

                {aiResult && (
                  <div className="space-y-4">
                    <div className="prose dark:prose-invert max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {aiResult}
                      </ReactMarkdown>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(aiResult);
                      }}
                      className="btn btn-secondary flex items-center gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      Copy Response
                    </button>
                  </div>
                )}

                {!isAiLoading && !aiResult && !aiError && (
                  <div className="text-center py-8">
                    <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      Select a server and click "Optimize" or enter a description to generate configuration
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* AI Tips */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">AI Tips</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">Server Optimization</h4>
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    Get personalized recommendations for improving your server performance, security, and configuration.
                  </p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h4 className="font-medium text-green-900 dark:text-green-200 mb-2">Configuration Generation</h4>
                  <p className="text-sm text-green-800 dark:text-green-300">
                    Describe your use case and get a complete MCP server configuration with tools, resources, and prompts.
                  </p>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <h4 className="font-medium text-purple-900 dark:text-purple-200 mb-2">Best Practices</h4>
                  <p className="text-sm text-purple-800 dark:text-purple-300">
                    Learn about MCP protocol best practices, security considerations, and performance optimization.
                  </p>
                </div>
                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <h4 className="font-medium text-orange-900 dark:text-orange-200 mb-2">Troubleshooting</h4>
                  <p className="text-sm text-orange-800 dark:text-orange-300">
                    Get help diagnosing connection issues, performance problems, and configuration errors.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>
              <p className="text-gray-600 dark:text-gray-400">Configure your MCP Server Manager preferences</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* General Settings */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">General Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={settings.autoRefresh}
                        onChange={(e) => saveSettings({ ...settings, autoRefresh: e.target.checked })}
                        className="checkbox"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Auto-refresh dashboard
                      </span>
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Automatically update server metrics and status
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Refresh Interval (seconds)
                    </label>
                    <select
                      value={settings.refreshInterval}
                      onChange={(e) => saveSettings({ ...settings, refreshInterval: parseInt(e.target.value) })}
                      className="select w-full"
                    >
                      <option value={5000}>5 seconds</option>
                      <option value={10000}>10 seconds</option>
                      <option value={30000}>30 seconds</option>
                      <option value={60000}>1 minute</option>
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={settings.notifications}
                        onChange={(e) => saveSettings({ ...settings, notifications: e.target.checked })}
                        className="checkbox"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Enable notifications
                      </span>
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Get notified about server status changes
                    </p>
                  </div>
                </div>
              </div>

              {/* Server Defaults */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Server Defaults</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Default Protocol
                    </label>
                    <select
                      value={settings.defaultProtocol}
                      onChange={(e) => saveSettings({ ...settings, defaultProtocol: e.target.value as 'stdio' | 'sse' | 'websocket' })}
                      className="select w-full"
                    >
                      <option value="stdio">STDIO</option>
                      <option value="sse">Server-Sent Events</option>
                      <option value="websocket">WebSocket</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Max Agents per Server
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={settings.maxAgentsPerServer}
                      onChange={(e) => saveSettings({ ...settings, maxAgentsPerServer: parseInt(e.target.value) })}
                      className="input w-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Data Management */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Data Management</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={exportServers}
                  className="btn btn-secondary flex items-center gap-2 justify-center"
                >
                  <Download className="w-4 h-4" />
                  Export All Data
                </button>
                
                <button
                  onClick={() => setShowImportModal(true)}
                  className="btn btn-secondary flex items-center gap-2 justify-center"
                >
                  <Upload className="w-4 h-4" />
                  Import Data
                </button>
                
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete all data? This cannot be undone.')) {
                      localStorage.removeItem('mcp_servers');
                      localStorage.removeItem('mcp_settings');
                      window.location.reload();
                    }
                  }}
                  className="btn btn-error flex items-center gap-2 justify-center"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear All Data
                </button>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                Export your data for backup or import existing configurations. Use with caution when clearing data.
              </p>
            </div>

            {/* About */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">About</h3>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <p><strong>MCP Server Manager</strong> - A comprehensive tool for managing Model Context Protocol servers</p>
                <p>Version: 1.0.0</p>
                <p>Built with React, TypeScript, and Tailwind CSS</p>
                <p>Supports MCP protocol versions 1.x</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      {/* Create Server Modal */}
      {showCreateModal && (
        <div className="modal-backdrop" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="heading-5">Create New MCP Server</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="modal-body space-y-4">
              <div className="form-group">
                <label className="form-label">Server Name</label>
                <input
                  type="text"
                  value={serverForm.name || ''}
                  onChange={(e) => setServerForm({ ...serverForm, name: e.target.value })}
                  className="input w-full"
                  placeholder="My MCP Server"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  value={serverForm.description || ''}
                  onChange={(e) => setServerForm({ ...serverForm, description: e.target.value })}
                  className="textarea w-full"
                  rows={3}
                  placeholder="Server description..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Port</label>
                  <input
                    type="number"
                    value={serverForm.port || ''}
                    onChange={(e) => setServerForm({ ...serverForm, port: parseInt(e.target.value) })}
                    className="input w-full"
                    placeholder="3000"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Protocol</label>
                  <select
                    value={serverForm.protocol || 'stdio'}
                    onChange={(e) => setServerForm({ ...serverForm, protocol: e.target.value as 'stdio' | 'sse' | 'websocket' })}
                    className="select w-full"
                  >
                    <option value="stdio">STDIO</option>
                    <option value="sse">Server-Sent Events</option>
                    <option value="websocket">WebSocket</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => setShowCreateModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={createServer}
                className="btn btn-primary"
                disabled={!serverForm.name || !serverForm.port}
              >
                Create Server
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Server Modal */}
      {showEditModal && selectedServer && (
        <div className="modal-backdrop" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="heading-5">Edit Server</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="modal-body space-y-4">
              <div className="form-group">
                <label className="form-label">Server Name</label>
                <input
                  type="text"
                  value={serverForm.name || ''}
                  onChange={(e) => setServerForm({ ...serverForm, name: e.target.value })}
                  className="input w-full"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  value={serverForm.description || ''}
                  onChange={(e) => setServerForm({ ...serverForm, description: e.target.value })}
                  className="textarea w-full"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Port</label>
                  <input
                    type="number"
                    value={serverForm.port || ''}
                    onChange={(e) => setServerForm({ ...serverForm, port: parseInt(e.target.value) })}
                    className="input w-full"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Protocol</label>
                  <select
                    value={serverForm.protocol || 'stdio'}
                    onChange={(e) => setServerForm({ ...serverForm, protocol: e.target.value as 'stdio' | 'sse' | 'websocket' })}
                    className="select w-full"
                  >
                    <option value="stdio">STDIO</option>
                    <option value="sse">Server-Sent Events</option>
                    <option value="websocket">WebSocket</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => setShowEditModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={updateServer}
                className="btn btn-primary"
                disabled={!serverForm.name || !serverForm.port}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Server Modal */}
      {showDeleteModal && selectedServer && (
        <div className="modal-backdrop" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="heading-5">Delete Server</h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="modal-body">
              <p className="text-gray-600 dark:text-gray-400">
                Are you sure you want to delete <strong>{selectedServer.name}</strong>? 
                This action cannot be undone and will remove all associated agents and configurations.
              </p>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={deleteServer}
                className="btn btn-error"
              >
                Delete Server
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Agent Modal */}
      {showAgentModal && selectedServer && (
        <div className="modal-backdrop" onClick={() => setShowAgentModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="heading-5">Add Agent to {selectedServer.name}</h3>
              <button
                onClick={() => setShowAgentModal(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="modal-body space-y-4">
              <div className="form-group">
                <label className="form-label">Agent Name</label>
                <input
                  type="text"
                  value={agentForm.name || ''}
                  onChange={(e) => setAgentForm({ ...agentForm, name: e.target.value })}
                  className="input w-full"
                  placeholder="My AI Agent"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Agent Type</label>
                <select
                  value={agentForm.type || 'custom'}
                  onChange={(e) => setAgentForm({ ...agentForm, type: e.target.value as 'claude' | 'gpt' | 'custom' })}
                  className="select w-full"
                >
                  <option value="claude">Claude</option>
                  <option value="gpt">GPT</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => setShowAgentModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={addAgent}
                className="btn btn-primary"
                disabled={!agentForm.name || !agentForm.type}
              >
                Add Agent
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="modal-backdrop" onClick={() => setShowImportModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="heading-5">Import Server Data</h3>
              <button
                onClick={() => setShowImportModal(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="modal-body space-y-4">
              <div className="form-group">
                <label className="form-label">JSON Data</label>
                <textarea
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  className="textarea w-full h-40"
                  placeholder="Paste your exported JSON data here..."
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={downloadTemplate}
                  className="btn btn-secondary flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download Template
                </button>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Use the template to understand the expected format
                </span>
              </div>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => setShowImportModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={importServers}
                className="btn btn-primary"
                disabled={!importData.trim()}
              >
                Import Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Layer */}
      <AILayer
        ref={aiLayerRef}
        prompt={aiPrompt}
        attachment={selectedFile || undefined}
        onResult={(result) => setAiResult(result)}
        onError={(error) => setAiError(error)}
        onLoading={(loading) => setIsAiLoading(loading)}
      />

      {/* Footer */}
      <footer className="mt-12 py-8 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            Copyright © 2025 Datavtar Private Limited. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;