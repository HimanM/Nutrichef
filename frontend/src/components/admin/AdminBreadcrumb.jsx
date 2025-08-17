import React from 'react';
import { HiChevronRight, HiHome } from 'react-icons/hi';
import { Link, useLocation } from 'react-router-dom';

const AdminBreadcrumb = ({ items = [], className = "" }) => {
  const location = useLocation();

  // Generate breadcrumb items based on current path if not provided
  const getBreadcrumbItems = () => {
    if (items.length > 0) return items;

    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbItems = [
      { label: 'Admin', href: '/admin', icon: HiHome }
    ];

    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      if (segment !== 'admin') {
        currentPath += `/${segment}`;
        
        // Convert segment to readable label
        const label = segment
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');

        breadcrumbItems.push({
          label,
          href: `/admin${currentPath}`,
          current: index === pathSegments.length - 1
        });
      }
    });

    return breadcrumbItems;
  };

  const breadcrumbItems = getBreadcrumbItems();

  if (breadcrumbItems.length <= 1) return null;

  return (
    <nav className={`flex items-center space-x-1 text-sm ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1 md:space-x-2">
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          const Icon = item.icon;

          return (
            <li key={item.href || item.label} className="flex items-center">
              {index > 0 && (
                <HiChevronRight className="w-4 h-4 text-gray-400 mx-1 md:mx-2" />
              )}
              
              {isLast ? (
                <span className="flex items-center font-medium text-gray-900">
                  {Icon && <Icon className="w-4 h-4 mr-1 md:mr-2" />}
                  <span className="hidden sm:inline">{item.label}</span>
                  <span className="sm:hidden">{item.shortLabel || item.label}</span>
                </span>
              ) : (
                <Link
                  to={item.href}
                  className="flex items-center text-gray-500 hover:text-emerald-600 transition-colors"
                >
                  {Icon && <Icon className="w-4 h-4 mr-1 md:mr-2" />}
                  <span className="hidden sm:inline hover:underline">{item.label}</span>
                  <span className="sm:hidden hover:underline">{item.shortLabel || item.label}</span>
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default AdminBreadcrumb;
