import React, { useState, useEffect, useRef, useCallback } from 'react';
import { HiTrash, HiInformationCircle, HiChartBar } from 'react-icons/hi2';
import { useAuth } from '../../context/AuthContext.jsx';
import { useModal } from '../../context/ModalContext.jsx';
import { authenticatedFetch } from '../../utils/apiUtil.js';
import { AdminErrorDisplay, AdminFullPageError } from '../../components/common/ErrorDisplay.jsx';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    ArcElement
} from 'chart.js';

// Import custom components
import SystemMetricsCards from '../../components/admin/SystemMetricsCards.jsx';
import HealthCheckCards from '../../components/admin/HealthCheckCards.jsx';
import PerformanceChart from '../../components/admin/PerformanceChart.jsx';
import LogControls from '../../components/admin/LogControls.jsx';
import LogsDisplay from '../../components/admin/LogsDisplay.jsx';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    ArcElement
);

// Spinner component
const PageLoaderSpinner = () => (
    <svg className="animate-spin h-10 w-10 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const AdminLogsMonitorPage = () => {
    const authContextValue = useAuth();
    const { showModal } = useModal();

    const [logs, setLogs] = useState([]);
    const [systemMetrics, setSystemMetrics] = useState({});
    const [connectionStatus, setConnectionStatus] = useState('connecting');
    const [autoScroll, setAutoScroll] = useState(true);
    const [logLevelFilter, setLogLevelFilter] = useState('all');
    const [logTypeFilter, setLogTypeFilter] = useState('all');
    const [hideLogStreamRequests, setHideLogStreamRequests] = useState(true);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);

    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [
            {
                label: 'CPU Usage (%)',
                data: [],
                borderColor: 'rgb(239, 68, 68)',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                tension: 0.4,
                fill: true,
            },
            {
                label: 'Memory Usage (%)',
                data: [],
                borderColor: 'rgb(245, 158, 11)',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                tension: 0.4,
                fill: true,
            }
        ]
    });
    const [logStats, setLogStats] = useState({
        total: 0,
        errors: 0,
        warnings: 0,
        requests: 0
    });

    const logContainerRef = useRef(null);
    const eventSourceRef = useRef(null);
    const performanceDataRef = useRef({
        labels: [],
        cpu: [],
        memory: []
    });

    const connectToStream = useCallback(() => {
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
        }

        const token = localStorage.getItem('authToken');
        if (!token) {
            setConnectionStatus('error');
            return;
        }

        eventSourceRef.current = new EventSource(`/api/admin/logs/stream?token=${token}`);

        eventSourceRef.current.onopen = () => {
            setConnectionStatus('connected');
        };

        eventSourceRef.current.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.type === 'logs') {
                data.data.forEach(addLogEntry);
            } else if (data.type === 'metrics') {
                setSystemMetrics(data.data);
                updatePerformanceChart(data.data);
            }
        };

        eventSourceRef.current.onerror = () => {
            setConnectionStatus('error');

            // Try to reconnect after 5 seconds
            setTimeout(connectToStream, 5000);
        };
    }, []);

    const loadInitialData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [logsResponse, metricsResponse] = await Promise.all([
                authenticatedFetch('/api/admin/logs/recent?limit=50', { method: 'GET' }, authContextValue),
                authenticatedFetch('/api/admin/system/metrics', { method: 'GET' }, authContextValue)
            ]);

            if (!logsResponse.ok) {
                throw new Error(`Failed to fetch logs: ${logsResponse.status}`);
            }
            if (!metricsResponse.ok) {
                throw new Error(`Failed to fetch metrics: ${metricsResponse.status}`);
            }

            const logsData = await logsResponse.json();
            const metricsData = await metricsResponse.json();

            logsData.logs.forEach(addLogEntry);
            setSystemMetrics(metricsData);
        } catch (error) {
            console.error('Error loading initial data:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }, [authContextValue]);

    useEffect(() => {
        connectToStream();
        loadInitialData();
        initializeChart();

        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }
        };
    }, [connectToStream, loadInitialData]);

    useEffect(() => {
        if (autoScroll && logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [logs, autoScroll]);



    const addLogEntry = (logEntry) => {
        setLogs(prevLogs => {
            const newLogs = [...prevLogs, logEntry];
            // Keep only last 100 logs to prevent memory issues
            return newLogs.slice(-100);
        });

        setLogStats(prevStats => {
            const newStats = { ...prevStats };
            newStats.total++;

            if (logEntry.type === 'error') newStats.errors++;
            else if (logEntry.type === 'warning') newStats.warnings++;
            else if (logEntry.type === 'request') newStats.requests++;

            return newStats;
        });
    };

    const initializeChart = () => {
        // Initialize chart with empty data
        setChartData({
            labels: [],
            datasets: [
                {
                    label: 'CPU Usage (%)',
                    data: [],
                    borderColor: 'rgb(239, 68, 68)',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    tension: 0.4,
                    fill: true,
                },
                {
                    label: 'Memory Usage (%)',
                    data: [],
                    borderColor: 'rgb(245, 158, 11)',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    tension: 0.4,
                    fill: true,
                }
            ]
        });
    };

    const updatePerformanceChart = (metrics) => {
        if (!metrics) return;

        const now = new Date().toLocaleTimeString();
        const data = performanceDataRef.current;

        data.labels.push(now);
        data.cpu.push(metrics.cpu_percent || 0);
        data.memory.push(metrics.memory?.percent || 0);

        // Keep only last 20 data points
        if (data.labels.length > 20) {
            data.labels.shift();
            data.cpu.shift();
            data.memory.shift();
        }

        // Update chart data
        setChartData(prevData => ({
            ...prevData,
            labels: [...data.labels],
            datasets: [
                {
                    ...prevData.datasets[0],
                    data: [...data.cpu]
                },
                {
                    ...prevData.datasets[1],
                    data: [...data.memory]
                }
            ]
        }));
    };

    const getConnectionStatusColor = () => {
        switch (connectionStatus) {
            case 'connected': return 'bg-emerald-500';
            case 'error': return 'bg-red-500';
            case 'connecting': return 'bg-yellow-500 animate-pulse';
            default: return 'bg-gray-500';
        }
    };

    const shouldDisplayLog = (log) => {
        if (logLevelFilter !== 'all' && log.color !== logLevelFilter) {
            return false;
        }
        if (logTypeFilter !== 'all' && log.type !== logTypeFilter) {
            return false;
        }
        if (hideLogStreamRequests && log.type === 'request' && log.message) {
            // Hide log monitoring API requests
            if (log.message.includes('/api/admin/logs/') ||
                log.message.includes('/api/admin/system/metrics') ||
                log.message.includes('logs/stream')) {
                return false;
            }
        }
        return true;
    };

    const filteredLogs = logs.filter(shouldDisplayLog);

    const clearLogs = async () => {
        try {
            const userConfirmed = await showModal(
                'confirm',
                'Clear All Logs',
                'Are you sure you want to clear all logs? This action cannot be undone.',
                { iconType: 'warning' }
            );

            if (!userConfirmed) return;

            setModalLoading(true);
            const response = await authenticatedFetch('/api/admin/logs/clear',
                { method: 'POST' },
                authContextValue
            );

            if (!response.ok) {
                throw new Error(`Failed to clear logs: ${response.status}`);
            }

            setLogs([]);
            setLogStats({ total: 0, errors: 0, warnings: 0, requests: 0 });

            await showModal('alert', 'Success', 'All logs have been cleared successfully.', {
                iconType: 'success'
            });
        } catch (error) {
            console.error('Error clearing logs:', error);
            await showModal('alert', 'Error', 'Failed to clear logs. Please try again.', {
                iconType: 'error'
            });
        } finally {
            setModalLoading(false);
        }
    };

    const showSystemInfo = async () => {
        try {
            setModalLoading(true);
            const response = await authenticatedFetch('/api/admin/system/info',
                { method: 'GET' },
                authContextValue
            );

            if (!response.ok) {
                throw new Error(`Failed to get system info: ${response.status}`);
            }

            const info = await response.json();
            const infoText = `
System: ${info.platform?.system || 'Unknown'}
Release: ${info.platform?.release || 'Unknown'}
Machine: ${info.platform?.machine || 'Unknown'}
Processor: ${info.platform?.processor || 'Unknown'}
Python Version: ${info.platform?.python_version?.split(' ')[0] || 'Unknown'}
Environment: ${info.flask_info?.environment || 'Unknown'}
            `.trim();

            await showModal('alert', 'System Information', infoText, {
                iconType: 'info'
            });
        } catch (error) {
            console.error('Error getting system info:', error);
            await showModal('alert', 'Error', 'Failed to retrieve system information.', {
                iconType: 'error'
            });
        } finally {
            setModalLoading(false);
        }
    };

    const formatBytes = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    // Loading state
    if (loading && logs.length === 0) {
        return (
            <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
                <PageLoaderSpinner />
            </div>
        );
    }

    // Error state  
    if (error && logs.length === 0) {
        return (
            <AdminFullPageError 
                error={`Error loading system monitoring: ${error}`}
                title="System Monitoring"
                onRetry={loadInitialData}
            />
        );
    }

    return (
        <div className="section-padding">
            <div className="container-modern">
                {/* Header */}
                <div className="text-center mb-8 sm:mb-10 animate-fade-in">
                    <h1 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">System Monitoring</h1>
                    <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
                        Real-time logs and system metrics monitoring
                    </p>
                    <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full mx-auto mt-6"></div>
                </div>

                {/* Error Alert */}
                {error && logs.length > 0 && (
                    <div className="mb-4">
                        <AdminErrorDisplay 
                            error={`Could not refresh data: ${error}`}
                            type="warning"
                        />
                    </div>
                )}

                {/* Status and Controls */}
                <div className="card-glass p-4 lg:p-6 border border-white/20 hover:border-emerald-200/50 transition-all duration-300 mb-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center text-white shadow-sm">
                                <HiChartBar className="h-4 w-4" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-800">Live Monitoring</h2>
                                <div className="flex items-center gap-2 text-sm">
                                    <div className={`w-3 h-3 rounded-full ${getConnectionStatusColor()}`}></div>
                                    <span className="text-gray-600 capitalize">{connectionStatus}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                onClick={clearLogs}
                                disabled={modalLoading}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center gap-2 text-sm"
                            >
                                <HiTrash className="w-4 h-4" />
                                Clear Logs
                            </button>

                            <button
                                onClick={showSystemInfo}
                                disabled={modalLoading}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center gap-2 text-sm"
                            >
                                <HiInformationCircle className="w-4 h-4" />
                                System Info
                            </button>
                        </div>
                    </div>
                </div>

                {/* Health Check Cards */}
                <div className="mb-6">
                    <HealthCheckCards />
                </div>

                {/* System Metrics */}
                <div className="mb-6">
                    <SystemMetricsCards
                        systemMetrics={systemMetrics}
                        formatBytes={formatBytes}
                    />
                </div>

                {/* Performance Chart */}
                <div className="mb-6">
                    <PerformanceChart
                        chartData={chartData}
                    />
                </div>

                {/* Log Controls and Display Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                    {/* Log Controls */}
                    <div className="xl:col-span-1 order-2 xl:order-1">

                        <LogControls
                            logStats={logStats}
                            logLevelFilter={logLevelFilter}
                            setLogLevelFilter={setLogLevelFilter}
                            logTypeFilter={logTypeFilter}
                            setLogTypeFilter={setLogTypeFilter}
                            hideLogStreamRequests={hideLogStreamRequests}
                            setHideLogStreamRequests={setHideLogStreamRequests}
                            autoScroll={autoScroll}
                            setAutoScroll={setAutoScroll}
                        />
                    </div>

                    {/* Logs Display */}
                    <div className="xl:col-span-3 order-1 xl:order-2">
                        <LogsDisplay
                            filteredLogs={filteredLogs}
                            logs={logs}
                            logContainerRef={logContainerRef}
                            autoScroll={autoScroll}
                            setAutoScroll={setAutoScroll}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogsMonitorPage;
