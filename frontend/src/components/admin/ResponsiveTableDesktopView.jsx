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
                <td key={column.key} className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {column.render ? column.render(item) : item[column.key]}
                </td>
            ))}
            {actions && (
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                        {actions.map((action, actionIndex) => (
                            <button
                                key={actionIndex}
                                onClick={() => action.onClick(item)}
                                className={`px-3 py-1 text-xs font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 ${action.className || 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 focus:ring-emerald-500'}`}
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

    return (
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
    );
};

export default ResponsiveTableDesktopView;
