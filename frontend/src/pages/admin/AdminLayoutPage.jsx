import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminNavigationBar from '../../components/admin/AdminNavigationBar.jsx'; // Tailwind version

const AdminLayoutPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      <AdminNavigationBar />
      <main className="flex-grow">
        <Outlet /> 
      </main>
    </div>
  );
};

export default AdminLayoutPage;
