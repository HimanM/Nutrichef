import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminNavigationBar from '../../components/admin/AdminNavigationBar.jsx'; // Tailwind version

const AdminLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <AdminNavigationBar />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet /> 
      </main>
      
    </div>
  );
};

export default AdminLayout;
