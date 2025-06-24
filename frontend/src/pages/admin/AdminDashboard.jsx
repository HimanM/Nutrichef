import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { HiUsers, HiOutlineBookOpen, HiOutlineChartBar, HiOutlineMail } from 'react-icons/hi';

// FeatureCard Component (adapted from HomePage.jsx)
const FeatureCard = ({ title, description, link = "#", icon, ctaText = "Go" }) => (
  <a href={link} className="card-glass group hover-lift p-6 text-center animate-fade-in block">
    <div className="mb-4 flex items-center justify-center">
      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:shadow-emerald-500/25 transition-all duration-300">
        {icon}
      </div>
    </div>
    <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-emerald-600 transition-colors duration-200">{title}</h3>
    <p className="text-gray-600 text-sm mb-4 leading-relaxed">{description}</p>
    <div className="flex items-center justify-center text-emerald-600 group-hover:text-emerald-700 font-medium transition-colors duration-200">
      <span className="mr-2">{ctaText}</span>
    </div>
  </a>
);

const AdminDashboard = () => {
  const adminFeatures = [
    {
      title: "Manage Users",
      description: "View, edit, and manage user accounts and roles.",
      link: "/admin/users",
      icon: <HiUsers className="h-10 w-10" />
    },
    {
      title: "Manage Recipes",
      description: "Approve, edit, or delete user-submitted recipes. Manage recipe content.",
      link: "/admin/recipes",
      icon: <HiOutlineBookOpen className="h-10 w-10" />
    },
    {
      title: "Classification Scores",
      description: "Review and analyze ingredient classification accuracy and scores.",
      link: "/admin/classification-scores",
      icon: <HiOutlineChartBar className="h-10 w-10" />
    },
    {
      title: "Contact Messages",
      description: "View and respond to messages submitted via the contact form.",
      link: "/admin/contact-messages",
      icon: <HiOutlineMail className="h-10 w-10" />
    }
    // Add more admin features as needed
  ];

  return (
    <div className="section-padding">
      <div className="container-modern">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">Admin Dashboard</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Welcome to the Admin Panel. Use the links below or the navigation bar to manage different sections of NutriChef.
          </p>
        </div>
        <div className="card-glass p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {adminFeatures.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
