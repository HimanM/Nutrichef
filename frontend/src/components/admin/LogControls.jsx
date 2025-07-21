import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { HiCog6Tooth, HiEyeSlash, HiAdjustmentsHorizontal } from 'react-icons/hi2';

const LogControls = ({ 
    autoScroll, 
    setAutoScroll, 
    hideLogStreamRequests, 
    setHideLogStreamRequests,
    logLevelFilter, 
    setLogLevelFilter,
    logTypeFilter, 
    setLogTypeFilter,
    logStats 
}) => {
    const logStatsChartData = {
        labels: ['Errors', 'Warnings', 'Requests', 'Others'],
        datasets: [
            {
                data: [
                    logStats.errors,
                    logStats.warnings,
                    logStats.requests,
                    Math.max(0, logStats.total - logStats.errors - logStats.warnings - logStats.requests)
                ],
                backgroundColor: [
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(107, 114, 128, 0.8)'
                ],
                borderColor: [
                    'rgb(239, 68, 68)',
                    'rgb(245, 158, 11)',
                    'rgb(16, 185, 129)',
                    'rgb(107, 114, 128)'
                ],
                borderWidth: 2
            }
        ]
    };

    const logStatsChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    padding: 12,
                    font: {
                        size: 10
                    },
                    usePointStyle: true
                }
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : 0;
                        return `${context.label}: ${context.parsed} (${percentage}%)`;
                    }
                },
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                titleColor: '#1f2937',
                bodyColor: '#1f2937',
                borderColor: '#e5e7eb',
                borderWidth: 1,
                cornerRadius: 8
            }
        },
        cutout: '65%'
    };

    return (
        <div className="card-glass p-4 lg:p-6 border border-white/20 hover:border-emerald-200/50 transition-all duration-300">
            <h3 className="text-base lg:text-lg font-semibold text-gray-700 mb-3 lg:mb-4 flex items-center">
                <HiCog6Tooth className="text-emerald-500 mr-2" />
                Log Controls
            </h3>
            
            {/* Auto-scroll toggle */}
            <div className="flex items-center justify-between mb-4">
                <label htmlFor="autoScroll" className="text-sm font-medium text-gray-700 flex items-center">
                    <HiAdjustmentsHorizontal className="h-4 w-4 mr-2 text-emerald-500" />
                    Auto-scroll
                </label>
                <input
                    type="checkbox"
                    id="autoScroll"
                    checked={autoScroll}
                    onChange={(e) => setAutoScroll(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500"
                />
            </div>

            {/* Hide log stream requests toggle */}
            <div className="flex items-center justify-between mb-4">
                <label htmlFor="hideLogStreamRequests" className="text-sm font-medium text-gray-700 flex items-center">
                    <HiEyeSlash className="h-4 w-4 mr-2 text-emerald-500" />
                    Hide monitoring requests
                </label>
                <input
                    type="checkbox"
                    id="hideLogStreamRequests"
                    checked={hideLogStreamRequests}
                    onChange={(e) => setHideLogStreamRequests(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500"
                />
            </div>

            {/* Log level filter */}
            <div className="mb-4">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Filter by Level
                </label>
                <select
                    value={logLevelFilter}
                    onChange={(e) => setLogLevelFilter(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                    <option value="all">All Levels</option>
                    <option value="success">Success</option>
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="error">Error</option>
                </select>
            </div>

            {/* Log type filter */}
            <div className="mb-4">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Filter by Type
                </label>
                <select
                    value={logTypeFilter}
                    onChange={(e) => setLogTypeFilter(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                    <option value="all">All Types</option>
                    <option value="request">HTTP Requests</option>
                    <option value="error">Errors</option>
                    <option value="warning">Warnings</option>
                    <option value="info">General Info</option>
                </select>
            </div>

            {/* Log statistics */}
            <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Statistics</h4>
                
                {/* Chart */}
                {logStats.total > 0 && (
                    <div className="mb-4" style={{ height: '160px' }}>
                        <Doughnut data={logStatsChartData} options={logStatsChartOptions} />
                    </div>
                )}
                
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Total Logs:</span>
                        <span className="font-medium">{logStats.total}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Errors:</span>
                        <span className="font-medium text-red-600">{logStats.errors}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Warnings:</span>
                        <span className="font-medium text-yellow-600">{logStats.warnings}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Requests:</span>
                        <span className="font-medium text-emerald-600">{logStats.requests}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LogControls;
