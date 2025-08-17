import React, { useState } from 'react';
import ResponsiveTableViews from './ResponsiveTableViews.jsx';

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
            <ResponsiveTableViews 
                data={data}
                columns={columns}
                loading={loading}
                onSort={onSort}
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                actions={actions}
                tableTitle={tableTitle}
                showFilters={showFilters}
                setShowFilters={setShowFilters}
                selectedCard={selectedCard}
                handleCardClick={handleCardClick}
            />

            {/* Pagination */}
            {renderPagination()}
        </div>
    );
};

export default ResponsiveTable;
