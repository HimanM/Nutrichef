import React from 'react';
import { HiChevronDown, HiChevronUp } from 'react-icons/hi';

const ResponsiveTableDesktopView = ({ 
    data, 
    columns, 
    loading, 
    onSort, 
    sortColumn, 
    sortDirection, 
    actions
}) => {
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
                        style={{ 
                            maxWidth: column.maxWidth || '300px',
                            minWidth: column.minWidth || '120px'
                        }}
                        onClick={() => column.sortable && onSort && onSort(column.key)}
                    >
                        <div className="truncate">
                            {column.label}
                            {column.sortable && renderSortIcon(column)}
                        </div>
                    </th>
                ))}
                {actions && (
                    <th 
                        className="px-4 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider"
                        style={{ minWidth: '160px', maxWidth: '200px' }}
                    >
                        Actions
                    </th>
                )}
            </tr>
        </thead>
    );

    const renderTableRow = (item, index) => (
        <tr key={index} className="hover:bg-emerald-50">
            {columns.map((column) => (
                <td 
                    key={column.key} 
                    className="px-4 py-4 text-sm text-gray-900"
                    style={{ 
                        maxWidth: column.maxWidth || '300px',
                        minWidth: column.minWidth || '120px'
                    }}
                >
                    <div className="overflow-hidden">
                        {column.render ? column.render(item) : (
                            <div 
                                className="truncate"
                                title={typeof item[column.key] === 'string' ? item[column.key] : ''}
                            >
                                {item[column.key]}
                            </div>
                        )}
                    </div>
                </td>
            ))}
            {actions && (
                <td className="px-4 py-4 text-sm font-medium" style={{ minWidth: '160px', maxWidth: '200px' }}>
                    <div className="flex space-x-1 flex-wrap gap-y-1">
                        {actions.map((action, actionIndex) => (
                            <button
                                key={actionIndex}
                                onClick={() => action.onClick(item)}
                                className={`px-2 py-1 text-xs font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 ${action.className || 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 focus:ring-emerald-500'}`}
                                disabled={action.disabled && action.disabled(item)}
                            >
                                {action.icon && <action.icon className="w-3 h-3 mr-1 inline" />}
                                {action.label}
                            </button>
                        ))}
                    </div>
                </td>
            )}
        </tr>
    );

    return (
        <div className="hidden lg:block">
            <div className="overflow-hidden">
                <table className="w-full table-fixed divide-y divide-gray-200">
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
    );
};

export default ResponsiveTableDesktopView;
