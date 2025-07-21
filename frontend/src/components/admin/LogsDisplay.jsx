import React from 'react';
import { HiCommandLine, HiExclamationTriangle, HiCheckCircle, HiInformationCircle, HiGlobeAlt } from 'react-icons/hi2';

const LogsDisplay = ({ filteredLogs, logs, logContainerRef }) => {
    const getLogTypeIcon = (type) => {
        switch (type) {
            case 'error': 
                return <HiExclamationTriangle className="text-red-500" />;
            case 'warning': 
                return <HiExclamationTriangle className="text-yellow-500" />;
            case 'success': 
                return <HiCheckCircle className="text-emerald-500" />;
            case 'request': 
                return <HiGlobeAlt className="text-blue-500" />;
            case 'info': 
                return <HiInformationCircle className="text-blue-500" />;
            default: 
                return <HiCommandLine className="text-gray-500" />;
        }
    };

    return (
        <div className="card-glass p-4 lg:p-6 border border-white/20 hover:border-emerald-200/50 transition-all duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 lg:mb-4 space-y-2 sm:space-y-0">
                <h3 className="text-base lg:text-lg font-semibold text-gray-700 flex items-center">
                    <HiCommandLine className="text-emerald-500 mr-2" />
                    Real-time Logs
                </h3>
                <div className="text-sm text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded-lg">
                    {filteredLogs.length} entries
                </div>
            </div>
            
            <div 
                ref={logContainerRef}
                className="max-h-64 sm:max-h-80 lg:max-h-[500px] xl:max-h-[600px] overflow-y-auto space-y-1 lg:space-y-2 pr-2"
                style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#10b981 #f1f1f1'
                }}
            >
                {filteredLogs.length === 0 ? (
                    <div className="text-center text-gray-500 py-8 lg:py-12">
                        <HiCommandLine className="text-3xl lg:text-4xl mb-3 mx-auto text-gray-400" />
                        <p className="text-sm lg:text-base">
                            {logs.length === 0 ? 'Waiting for logs...' : 'No logs match the current filters'}
                        </p>
                    </div>
                ) : (
                    filteredLogs.map((log, index) => (
                        <div 
                            key={index} 
                            className={`p-2 lg:p-3 rounded-lg border-l-4 transition-colors hover:shadow-sm ${
                                log.color === 'success' ? 'border-l-emerald-500 bg-emerald-50 hover:bg-emerald-100/70' :
                                log.color === 'info' ? 'border-l-blue-500 bg-blue-50 hover:bg-blue-100/70' :
                                log.color === 'warning' ? 'border-l-yellow-500 bg-yellow-50 hover:bg-yellow-100/70' :
                                'border-l-red-500 bg-red-50 hover:bg-red-100/70'
                            }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center mb-1 flex-wrap gap-1">
                                        <span className="text-xs font-medium text-gray-500 bg-white/80 px-2 py-1 rounded">
                                            {new Date(log.timestamp).toLocaleTimeString()}
                                        </span>
                                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded font-medium">
                                            {log.level}
                                        </span>
                                        {log.logger && (
                                            <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded font-medium">
                                                {log.logger}
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-xs lg:text-sm text-gray-800 flex items-start">
                                        <span className="mr-2 flex-shrink-0 mt-0.5">{getLogTypeIcon(log.type)}</span>
                                        <span className="flex-1 break-words leading-relaxed">{log.message}</span>
                                    </div>
                                    {(log.module || log.function) && (
                                        <div className="text-xs text-gray-500 mt-1 break-words bg-gray-50 px-2 py-1 rounded">
                                            {log.module}{log.function ? `::${log.function}` : ''}{log.line ? `:${log.line}` : ''}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default LogsDisplay;
