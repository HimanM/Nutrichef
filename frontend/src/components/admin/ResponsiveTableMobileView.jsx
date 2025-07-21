import React from 'react';
import { HiChevronDown, HiChevronUp } from 'react-icons/hi';

const ResponsiveTableMobileView = ({ 
    data, 
    columns, 
    loading, 
    actions,
    tableTitle,
    showFilters,
    setShowFilters,
    onSort,
    sortColumn,
    sortDirection,
    selectedCard,
    handleCardClick
}) => {
    const renderMobileCard = (item, index) => (
        <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div 
                className="cursor-pointer"
                onClick={() => handleCardClick(item)}
            >
                <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                            {columns[0].render ? columns[0].render(item) : item[columns[0].key]}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                            {columns[1] && (columns[1].render ? columns[1].render(item) : item[columns[1].key])}
                        </p>
                    </div>
                    {selectedCard === item ? (
                        <HiChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                        <HiChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                </div>
                
                {/* Always show key info */}
                <div className="grid grid-cols-1 gap-2 mb-3">
                    {columns.slice(2, 4).map((column) => (
                        <div key={column.key} className="flex justify-between">
                            <span className="text-sm text-gray-500">{column.label}:</span>
                            <span className="text-sm font-medium text-gray-900">
                                {column.render ? column.render(item) : item[column.key]}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Expandable content */}
            {selectedCard === item && (
                <div className="border-t pt-3 mt-3">
                    <div className="grid grid-cols-1 gap-2 mb-4">
                        {columns.slice(4).map((column) => (
                            <div key={column.key} className="flex justify-between">
                                <span className="text-sm text-gray-500">{column.label}:</span>
                                <span className="text-sm font-medium text-gray-900">
                                    {column.render ? column.render(item) : item[column.key]}
                                </span>
                            </div>
                        ))}
                    </div>
                    
                    {/* Actions */}
                    {actions && (
                        <div className="flex flex-wrap gap-2 justify-end">
                            {actions.map((action, actionIndex) => (
                                <button
                                    key={actionIndex}
                                    onClick={() => action.onClick(item)}
                                    className={`px-3 py-2 text-xs font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 min-h-[36px] touch-manipulation ${action.className || 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 focus:ring-emerald-500'}`}
                                    disabled={action.disabled && action.disabled(item)}
                                >
                                    {action.icon && <action.icon className="w-4 h-4 mr-1 inline" />}
                                    {action.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );

    return (
        <div className="lg:hidden">
            <div className="p-4 bg-emerald-50 border-b border-emerald-200">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-emerald-700">{tableTitle}</h3>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="px-3 py-1 text-sm bg-emerald-100 text-emerald-700 rounded-md hover:bg-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                        {showFilters ? 'Hide' : 'Show'} Filters
                    </button>
                </div>
                
                {showFilters && (
                    <div className="mt-3 pt-3 border-t border-emerald-200">
                        <div className="grid grid-cols-2 gap-2">
                            {columns.filter(col => col.sortable).map((column) => (
                                <button
                                    key={column.key}
                                    onClick={() => onSort && onSort(column.key)}
                                    className={`px-3 py-2 text-xs font-medium rounded-md border transition-colors ${
                                        sortColumn === column.key 
                                            ? 'bg-emerald-500 text-white border-emerald-500' 
                                            : 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                                    }`}
                                >
                                    {column.label}
                                    {sortColumn === column.key && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            
            <div className="p-4 space-y-4">
                {loading && (
                    <div className="flex justify-center items-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                        <span className="ml-2 text-gray-600">Loading...</span>
                    </div>
                )}
                {!loading && data.map((item, index) => renderMobileCard(item, index))}
            </div>
        </div>
    );
};

export default ResponsiveTableMobileView;
