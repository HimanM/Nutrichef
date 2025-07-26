import React, { useState, useEffect } from 'react';
import { HiServer, HiCircleStack, HiCheckCircle, HiXCircle, HiClock, HiArrowPath, HiPlay, HiPause } from 'react-icons/hi2';
import { useAuth } from '../../context/AuthContext.jsx';
import { useModal } from '../../context/ModalContext.jsx';
import { authenticatedFetch } from '../../utils/apiUtil.js';

const HealthCheckCards = () => {
    const authContextValue = useAuth();
    const { showModal } = useModal();
    const [healthData, setHealthData] = useState({
        flask: { status: 'unknown', message: 'Checking...', timestamp: null },
        database: { status: 'unknown', message: 'Checking...', timestamp: null },
        overall: { status: 'unknown', message: 'Checking...', timestamp: null }
    });
    const [loading, setLoading] = useState(false);
    const [lastChecked, setLastChecked] = useState(null);
    const [autoPing, setAutoPing] = useState(true);
    const [intervalId, setIntervalId] = useState(null);

    useEffect(() => {
        checkHealth();
        
        if (autoPing) {
            const interval = setInterval(checkHealth, 30000);
            setIntervalId(interval);
            return () => clearInterval(interval);
        }
    }, [autoPing]);

    const toggleAutoPing = () => {
        setAutoPing(!autoPing);
        if (intervalId) {
            clearInterval(intervalId);
            setIntervalId(null);
        }
    };

    const checkHealth = async () => {
        setLoading(true);
        try {
            const response = await authenticatedFetch('/api/health/full', {
                method: 'GET'
            }, authContextValue);

            if (response.ok) {
                const data = await response.json();
                setHealthData(data);
                setLastChecked(new Date());
            } else {
                // If health endpoint fails, assume Flask is down
                setHealthData({
                    flask: { status: 'error', message: 'Flask application not responding' },
                    database: { status: 'unknown', message: 'Cannot check - Flask unavailable' },
                    overall: { status: 'error', message: 'System health check failed' }
                });
                setLastChecked(new Date());
            }
        } catch (error) {
            console.error('Health check failed:', error);
            setHealthData({
                flask: { status: 'error', message: 'Connection failed' },
                database: { status: 'unknown', message: 'Cannot check - Connection failed' },
                overall: { status: 'error', message: 'Health check unavailable' }
            });
            setLastChecked(new Date());
        } finally {
            setLoading(false);
        }
    };

    const testEndpoint = async (endpoint, name) => {
        try {
            setLoading(true);
            const response = await authenticatedFetch(`/api/health/${endpoint}`, {
                method: 'GET'
            }, authContextValue);

            const data = await response.json();
            const statusText = response.ok ? 'Success' : 'Error';
            const statusColor = response.ok ? 'success' : 'error';
            
            // Format the response data for display
            const formattedData = {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok,
                timestamp: new Date().toISOString(),
                responseData: data
            };

            await showModal('alert', `${name} Test Result`, 
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="font-semibold text-gray-600">Status:</span>
                            <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                                response.ok ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                                {response.status} {response.statusText}
                            </span>
                        </div>
                        <div>
                            <span className="font-semibold text-gray-600">Timestamp:</span>
                            <span className="ml-2 text-gray-800">{new Date().toLocaleTimeString()}</span>
                        </div>
                    </div>
                    
                    <div>
                        <div className="font-semibold text-gray-600 mb-2">Response Data:</div>
                        <div className="bg-gray-50 rounded-lg p-3 max-h-64 overflow-y-auto">
                            <pre className="text-xs text-gray-800 whitespace-pre-wrap">
                                {JSON.stringify(data, null, 2)}
                            </pre>
                        </div>
                    </div>
                    
                    {data.message && (
                        <div>
                            <div className="font-semibold text-gray-600 mb-1">Message:</div>
                            <div className="text-sm text-gray-800 bg-blue-50 p-2 rounded">
                                {data.message}
                            </div>
                        </div>
                    )}
                </div>, 
                { iconType: statusColor }
            );
        } catch (error) {
            await showModal('alert', `${name} Test Failed`, 
                <div className="space-y-3">
                    <div className="text-red-600 font-medium">Connection Error</div>
                    <div className="text-sm text-gray-700">
                        <div className="font-semibold mb-1">Error Details:</div>
                        <div className="bg-red-50 p-2 rounded text-red-800">
                            {error.message}
                        </div>
                    </div>
                    <div className="text-xs text-gray-500">
                        This usually indicates that the Flask server is not running or not accessible.
                    </div>
                </div>, 
                { iconType: 'error' }
            );
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'ok':
                return <HiCheckCircle className="text-xl lg:text-2xl text-emerald-600" />;
            case 'error':
                return <HiXCircle className="text-xl lg:text-2xl text-red-600" />;
            case 'degraded':
                return <HiClock className="text-xl lg:text-2xl text-yellow-600" />;
            default:
                return <HiClock className="text-xl lg:text-2xl text-gray-400" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'ok':
                return {
                    text: 'text-emerald-600',
                    bg: 'bg-emerald-600',
                    border: 'border-emerald-500',
                    bgLight: 'bg-emerald-50/30'
                };
            case 'error':
                return {
                    text: 'text-red-600',
                    bg: 'bg-red-600',
                    border: 'border-red-500',
                    bgLight: 'bg-red-50/30'
                };
            case 'degraded':
                return {
                    text: 'text-yellow-600',
                    bg: 'bg-yellow-600',
                    border: 'border-yellow-500',
                    bgLight: 'bg-yellow-50/30'
                };
            default:
                return {
                    text: 'text-gray-400',
                    bg: 'bg-gray-400',
                    border: 'border-gray-400',
                    bgLight: 'bg-gray-50/30'
                };
        }
    };

    const healthChecks = [
        {
            title: 'Flask Application',
            status: healthData.flask?.status || 'unknown',
            message: healthData.flask?.message || 'Checking...',
            icon: <HiServer className="text-xl lg:text-2xl" />,
            description: 'Web server status'
        },
        {
            title: 'Database',
            status: healthData.database?.status || 'unknown',
            message: healthData.database?.message || 'Checking...',
            icon: <HiCircleStack className="text-xl lg:text-2xl" />,
            description: 'MySQL connectivity'
        },
        {
            title: 'Overall System',
            status: healthData.overall?.status || 'unknown',
            message: healthData.overall?.message || 'Checking...',
            icon: getStatusIcon(healthData.overall?.status),
            description: 'System health summary'
        }
    ];

    return (
        <div className="mb-6 lg:mb-8">
            <div className="card-glass p-4 lg:p-6 border border-white/20 hover:border-emerald-200/50 transition-all duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
                        System Health Check
                    </h2>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        {lastChecked && (
                            <span className="text-xs sm:text-sm text-gray-500">
                                Last checked: {lastChecked.toLocaleTimeString()}
                            </span>
                        )}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={toggleAutoPing}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                                    autoPing 
                                        ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {autoPing ? <HiPause className="w-3 h-3" /> : <HiPlay className="w-3 h-3" />}
                                <span className="hidden sm:inline">
                                    Auto-ping {autoPing ? 'ON' : 'OFF'}
                                </span>
                                <span className="sm:hidden">
                                    {autoPing ? 'ON' : 'OFF'}
                                </span>
                            </button>
                            <button
                                onClick={checkHealth}
                                disabled={loading}
                                className="p-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center gap-2 text-sm"
                            >
                                <HiArrowPath className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                <span className="hidden sm:inline">Refresh</span>
                            </button>
                        </div>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                    {healthChecks.map((check, index) => {
                        const colors = getStatusColor(check.status);
                        return (
                            <div 
                                key={index} 
                                className={`bg-gradient-to-br from-gray-50/50 to-${colors.bgLight} p-3 sm:p-4 lg:p-5 rounded-xl border border-gray-100/50 hover:${colors.border}/70 transition-all duration-300 shadow-sm hover:shadow-md`}
                            >
                                <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-4">
                                    <h3 className="text-xs sm:text-sm lg:text-base font-semibold text-gray-700 truncate">
                                        {check.title}
                                    </h3>
                                    <div className="flex-shrink-0">
                                        {React.cloneElement(check.icon, { 
                                            className: `text-base sm:text-lg lg:text-2xl ${colors.text}` 
                                        })}
                                    </div>
                                </div>
                                
                                <div className={`text-sm sm:text-base lg:text-lg font-bold ${colors.text} mb-1 lg:mb-2 capitalize`}>
                                    {check.status === 'ok' ? 'Healthy' : check.status === 'error' ? 'Error' : check.status === 'degraded' ? 'Degraded' : 'Unknown'}
                                </div>
                                
                                <div className="text-xs lg:text-sm text-gray-600 mb-2 line-clamp-2">
                                    {check.message}
                                </div>
                                
                                <div className="text-xs text-gray-500">
                                    {check.description}
                                </div>
                                
                                {/* Status indicator bar */}
                                <div className="w-full bg-gray-200 rounded-full h-1 lg:h-1.5 mt-2 lg:mt-3">
                                    <div 
                                        className={`${colors.bg} h-1 lg:h-1.5 rounded-full transition-all duration-500`}
                                        style={{ 
                                            width: check.status === 'ok' ? '100%' : 
                                                   check.status === 'degraded' ? '60%' : 
                                                   check.status === 'error' ? '20%' : '0%' 
                                        }}
                                    ></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                
                {/* Quick Actions */}
                <div className="mt-4 lg:mt-6 pt-4 lg:pt-6 border-t border-gray-200/50">
                    <div className="mb-3">
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Endpoint Tests</h3>
                        <p className="text-xs text-gray-500">Click to test individual health endpoints and view detailed responses</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                        <button
                            onClick={() => testEndpoint('ping', 'Flask Ping')}
                            disabled={loading}
                            className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 disabled:bg-gray-100 disabled:text-gray-400 transition-colors text-xs sm:text-sm font-medium flex items-center justify-center gap-2"
                        >
                            <HiServer className="w-4 h-4" />
                            Test Flask Ping
                        </button>
                        <button
                            onClick={() => testEndpoint('database', 'Database Health')}
                            disabled={loading}
                            className="px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 disabled:bg-gray-100 disabled:text-gray-400 transition-colors text-xs sm:text-sm font-medium flex items-center justify-center gap-2"
                        >
                            <HiCircleStack className="w-4 h-4" />
                            Test Database
                        </button>
                        <button
                            onClick={() => testEndpoint('full', 'Full System Health')}
                            disabled={loading}
                            className="px-3 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 disabled:bg-gray-100 disabled:text-gray-400 transition-colors text-xs sm:text-sm font-medium flex items-center justify-center gap-2"
                        >
                            <HiCheckCircle className="w-4 h-4" />
                            Full Health Test
                        </button>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-100">
                        <button
                            onClick={() => window.open('/api/health/full', '_blank')}
                            className="text-xs text-gray-500 hover:text-gray-700 underline"
                        >
                            View Raw JSON Response
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HealthCheckCards;