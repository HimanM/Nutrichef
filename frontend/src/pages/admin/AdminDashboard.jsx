import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { HiUsers, HiOutlineBookOpen, HiOutlineChartBar, HiOutlineMail, HiTerminal } from 'react-icons/hi';

// FeatureCard Component (adapted from HomePage.jsx)
const FeatureCard = ({ title, description, link = "#", icon, ctaText = "Go" }) => (
  <a href={link} className="card-glass group hover-lift p-4 sm:p-5 text-center animate-fade-in h-full flex flex-col feature-card-mobile sm:feature-card-desktop border border-white/20 hover:border-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300 ease-out">
    <div className="mb-3 sm:mb-4 flex items-center justify-center">
      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:shadow-emerald-500/30 group-hover:scale-105 transition-all duration-300 feature-icon border border-emerald-400/20">
        {React.cloneElement(icon, { className: "h-5 w-5 sm:h-6 sm:w-6" })}
      </div>
    </div>
    <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-800 mb-2 group-hover:text-emerald-600 transition-colors duration-200">{title}</h3>
    <p className="text-gray-600 text-xs sm:text-sm leading-relaxed flex-grow mb-3">{description}</p>
    <div className="flex items-center justify-center text-emerald-600 group-hover:text-emerald-700 font-medium transition-colors duration-200 mt-auto cta-button px-3 py-1.5 rounded-lg border border-emerald-200/50 group-hover:border-emerald-300 group-hover:bg-emerald-50/50 text-xs sm:text-sm">
      <span className="mr-1">{ctaText}</span>
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
    },
    {
      title: "System Logs Monitor",
      description: "Monitor real-time system logs, performance metrics, and server health.",
      link: "/admin/logs-monitor",
      icon: <HiTerminal className="h-10 w-10" />
    }
    // Add more admin features as needed
  ];

  return (
    <div className="py-8 sm:py-12 md:py-16 lg:py-20 relative">
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%2310b981' fill-opacity='0.03'%3E%3Cpath d='M20 20c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm-30 0c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10-10-4.477-10-10z'/%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      <div className="container-modern px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-6 sm:mb-8 animate-fade-in">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 gradient-text">Admin Dashboard</h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-4">
            Welcome to the Admin Panel. Use the links below or the navigation bar to manage different sections of NutriChef.
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full mx-auto mt-4 sm:mt-5"></div>
        </div>
        <div className="card-container bg-none p-4 sm:p-5 md:p-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 sm:mb-5 flex items-center">
            Quick Actions
          </h2>
          <div className="bg-gradient-to-br from-gray-50/50 to-emerald-50/30 rounded-2xl p-4 sm:p-5 md:p-6 border border-gray-100/50 shadow-soft">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-5 quick-links-grid">
              {adminFeatures.map((feature, index) => (
                <div key={index} className="h-full">
                  <FeatureCard {...feature} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
