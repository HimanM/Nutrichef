import React from 'react';
import { Line } from 'react-chartjs-2';
import { HiChartBar, HiSignal } from 'react-icons/hi2';

const PerformanceChart = ({ chartData, connectionStatus }) => {
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    usePointStyle: true,
                    padding: 20,
                    font: {
                        size: 12
                    }
                }
            },
            title: {
                display: false
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                titleColor: '#1f2937',
                bodyColor: '#1f2937',
                borderColor: '#e5e7eb',
                borderWidth: 1,
                cornerRadius: 8,
                padding: 12
            }
        },
        scales: {
            x: {
                display: true,
                title: {
                    display: true,
                    text: 'Time',
                    color: '#6b7280',
                    font: {
                        size: 11
                    }
                },
                grid: {
                    display: false
                },
                ticks: {
                    color: '#6b7280',
                    font: {
                        size: 10
                    },
                    maxTicksLimit: 8
                }
            },
            y: {
                display: true,
                title: {
                    display: true,
                    text: 'Percentage (%)',
                    color: '#6b7280',
                    font: {
                        size: 11
                    }
                },
                min: 0,
                max: 100,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)'
                },
                ticks: {
                    color: '#6b7280',
                    font: {
                        size: 10
                    }
                }
            }
        },
        interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
        },
        animation: {
            duration: 300
        }
    };

    return (
        <div className="mb-6 lg:mb-8">
            <div className="card-glass p-4 lg:p-6 border border-white/20 hover:border-emerald-200/50 transition-all duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-2 sm:space-y-0">
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
                        Performance Chart
                    </h2>
                    <div className="flex items-center text-xs lg:text-sm text-gray-600">
                        <div className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'} mr-2`}></div>
                        <HiSignal className="h-3 w-3 mr-1" />
                        <span>Live Updates</span>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-gray-50/50 to-emerald-50/30 p-4 lg:p-5 rounded-xl border border-gray-100/50">
                    <div style={{ height: '280px' }} className="lg:h-80">
                        <Line data={chartData} options={chartOptions} />
                    </div>
                    <div className="mt-2 lg:mt-3 text-center text-xs text-gray-500">
                        Showing last 20 data points • Updates every few seconds
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PerformanceChart;
