import React, { useState } from 'react';
import { HiChevronDown, HiChevronUp } from 'react-icons/hi';

const ResponsiveTable = ({ 
    data, 
    columns, 
    loading, 
    onSort, 
    sortColumn, 
    sortDirection, 
    actions,
    pagination,
    tableTitle = "Data Table"
}) => {
    const [selectedCard, setSelectedCard] = useState(null);
    const [showFilters, setShowFilters] = useState(false);

    const handleCardClick = (item) => {
        setSelectedCard(selectedCard === item ? null : item);
    };

    const renderSortIcon = (column) => {
        if (sortColumn !== column.key) return null;
        return sortDirection === 'asc' ? 
            <HiChevronUp className="w-4 h-4 inline ml-1" /> : 
            <HiChevronDown className="w-4 h-4 inline ml-1" />;
    };

    const renderTableHeader = () => (
        <thead className="bg-emerald-50">
            <tr>
                {columns.map((column) => (
                    <th
                        key={column.key}
                        className={`px-4 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider ${
                            column.sortable && onSort ? 'cursor-pointer hover:text-emerald-900' : ''
                        }`}
                        onClick={() => column.sortable && onSort && onSort(column.key)}
                    >
                        {column.label}
                        {column.sortable && renderSortIcon(column)}
                    </th>
                ))}
                {actions && <th className="px-4 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">Actions</th>}
            </tr>
        </thead>
    );

    const renderTableRow = (item, index) => (
        <tr key={index} className="hover:bg-emerald-50">
            {columns.map((column) => (
                <td key={column.key} className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    {column.render ? column.render(item) : item[column.key]}
                </td>
            ))}
            {actions && (
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                        {actions.map((action, actionIndex) => (
                            <button
                                key={actionIndex}
                                onClick={() => action.onClick(item)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 ${action.className || 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 focus:ring-emerald-500'}`}
                                disabled={action.disabled && action.disabled(item)}
                            >
                                {action.icon && <action.icon className="w-4 h-4 mr-1 inline" />}
                                {action.label}
                            </button>
                        ))}
                    </div>
                </td>
            )}
        </tr>
    );

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

    const renderPagination = () => {
        if (!pagination) return null;
        
        const { currentPage, totalPages, onPageChange, onRowsPerPageChange, rowsPerPage } = pagination;
        
        return (
            <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 bg-white rounded-b-3xl">
                <div className="flex-1 flex justify-between sm:hidden">
                    <button 
                        onClick={() => onPageChange(currentPage - 1)} 
                        disabled={currentPage === 1} 
                        className="px-3 py-2 text-xs font-medium rounded-md shadow-sm bg-emerald-50 text-emerald-700 hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span className="text-sm text-gray-700">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button 
                        onClick={() => onPageChange(currentPage + 1)} 
                        disabled={currentPage === totalPages} 
                        className="px-3 py-2 text-xs font-medium rounded-md shadow-sm bg-emerald-50 text-emerald-700 hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                        <p className="text-xs text-gray-500">
                            Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <label htmlFor="rowsPerPage" className="text-xs text-gray-500">Rows:</label>
                        <select 
                            id="rowsPerPage" 
                            value={rowsPerPage} 
                            onChange={onRowsPerPageChange} 
                            className="px-2 py-1 bg-gray-100 border border-gray-200 text-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 text-xs"
                        >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                            <button 
                                onClick={() => onPageChange(currentPage - 1)} 
                                disabled={currentPage === 1} 
                                className="px-3 py-1.5 text-xs font-medium rounded-l-md border border-gray-200 bg-gray-100 text-gray-500 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                            >
                                Prev
                            </button>
                            <button 
                                onClick={() => onPageChange(currentPage + 1)} 
                                disabled={currentPage === totalPages} 
                                className="px-3 py-1.5 text-xs font-medium rounded-r-md border border-gray-200 bg-gray-100 text-gray-500 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </nav>
                    </div>
                </div>
            </div>
        );
    };

    if (loading && data.length === 0) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
                <span className="ml-2 text-gray-600">Loading {tableTitle.toLowerCase()}...</span>
            </div>
        );
    }

    return (
        <div className="card-glass shadow-xl rounded-3xl overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden lg:block">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        {renderTableHeader()}
                        <tbody className="bg-white divide-y divide-gray-100">
                            {loading && (
                                <tr>
                                    <td colSpan={columns.length + (actions ? 1 : 0)} className="text-center py-4">
                                        <div className="flex justify-center items-center">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500"></div>
                                            <span className="ml-2 text-gray-600">Loading...</span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                            {!loading && data.map((item, index) => renderTableRow(item, index))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Card Layout */}
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

            {/* Pagination */}
            {renderPagination()}
        </div>
    );
};

export default ResponsiveTable;
