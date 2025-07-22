import React from 'react';
import { HiCpuChip, HiCircleStack, HiServerStack, HiCog6Tooth } from 'react-icons/hi2';
const SystemMetricsCards = ({ systemMetrics, formatBytes }) => {
    const metrics = [
        {
            title: 'CPU Usage',
            value: `${systemMetrics.cpu_percent?.toFixed(1) || 0}%`,
            icon: <HiCpuChip className="text-xl lg:text-2xl text-emerald-600" />,
            color: 'emerald',
            percentage: systemMetrics.cpu_percent || 0
        },
        {
            title: 'Memory',
            value: `${systemMetrics.memory?.percent?.toFixed(1) || 0}%`,
            icon: <HiCircleStack className="text-xl lg:text-2xl text-emerald-600" />,
            color: 'emerald',
            percentage: systemMetrics.memory?.percent || 0,
            subtitle: `${formatBytes(systemMetrics.memory?.used || 0)} / ${formatBytes(systemMetrics.memory?.total || 0)}`
        },
        {
            title: 'Disk',
            value: `${systemMetrics.disk?.percent?.toFixed(1) || 0}%`,
            icon: <HiServerStack className="text-xl lg:text-2xl text-emerald-600" />,
            color: 'emerald',
            percentage: systemMetrics.disk?.percent || 0,
            subtitle: `${formatBytes(systemMetrics.disk?.used || 0)} / ${formatBytes(systemMetrics.disk?.total || 0)}`
        },
        {
            title: 'Processes',
            value: systemMetrics.process_count || 0,
            icon: <HiCog6Tooth className="text-xl lg:text-2xl text-emerald-600" />,
            color: 'emerald',
            subtitle: 'Active processes'
        }
    ];

    const getColorClasses = (color) => {
        return {
            emerald: {
                text: 'text-emerald-600',
                bg: 'bg-emerald-600',
                border: 'border-emerald-500'
            }
        }[color];
    };

    return (
        <div className="mb-6 lg:mb-8">
            <div className="card-glass p-4 lg:p-6 border border-white/20 hover:border-emerald-200/50 transition-all duration-300">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6">
                    System Metrics
                </h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                {metrics.map((metric, index) => {
                    const colors = getColorClasses(metric.color);
                    return (
                        <div key={index} className="bg-gradient-to-br from-gray-50/50 to-emerald-50/30 p-3 sm:p-4 lg:p-5 rounded-xl border border-gray-100/50 hover:border-emerald-200/70 transition-all duration-300 shadow-sm hover:shadow-md">
                            <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-4">
                                <h3 className="text-xs sm:text-sm lg:text-base font-semibold text-gray-700 truncate">{metric.title}</h3>
                                <div className="flex-shrink-0">
                                    {React.cloneElement(metric.icon, { 
                                        className: "text-base sm:text-lg lg:text-2xl text-emerald-600" 
                                    })}
                                </div>
                            </div>
                            <div className={`text-base sm:text-lg lg:text-3xl font-bold ${colors.text} mb-1 lg:mb-2`}>
                                {metric.value}
                            </div>
                            {metric.percentage !== undefined && (
                                <div className="w-full bg-gray-200 rounded-full h-1.5 lg:h-2 mb-1 lg:mb-2">
                                    <div 
                                        className={`${colors.bg} h-1.5 lg:h-2 rounded-full transition-all duration-500`}
                                        style={{ width: `${metric.percentage}%` }}
                                    ></div>
                                </div>
                            )}
                            {metric.subtitle && (
                                <div className="text-xs lg:text-sm text-gray-500 mt-1 truncate">
                                    {metric.subtitle}
                                </div>
                            )}
                        </div>
                    );
                })}
                </div>
            </div>
        </div>
    );
};

export default SystemMetricsCards;
