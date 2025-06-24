import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { HiUsers, HiOutlineBookOpen, HiOutlineChartBar, HiOutlineMail } from 'react-icons/hi';

// FeatureCard Component (adapted from HomePage.jsx)
const FeatureCard = ({ title, description, link, icon }) => (
  <RouterLink
    to={link}
    className="bg-gray-700 p-6 rounded-lg shadow-lg hover:bg-gray-600 transition-all duration-300 ease-in-out transform hover:-translate-y-1 flex flex-col items-center text-center"
  >
    <div className="text-blue-400 mb-4">{icon}</div>
    <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
    <p className="text-gray-300 text-sm mb-4 flex-grow">{description}</p>
    <span className="mt-auto text-blue-300 hover:text-blue-200 font-medium transition-colors">
      Go to {title} &rarr;
    </span>
  </RouterLink>
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
    <div className="page-container my-8"> {/* Applied page-container and margin */}
      <h1 className="text-3xl mb-4 border-b border-gray-700 pb-3"> {/* Uses global h1, updated border */}
            Admin Dashboard
      </h1>
      <p className="text-gray-300 mb-6 text-md"> {/* text-gray-300 */}
        Welcome to the Admin Panel. Use the links below or the navigation bar to manage different sections of NutriChef.
      </p>
      <div className="bg-gray-800 shadow-xl rounded-lg p-6 sm:p-8"> {/* bg-gray-800 */}
        

        <div>
          <h2 className="text-2xl font-semibold text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {adminFeatures.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>

        {/* Placeholder for future dashboard widgets/stats if any */}
        {/*
        <div className="mt-10 border-t border-gray-700 pt-6"> // border-gray-700
          <h2 className="text-xl font-semibold mb-4">Site Statistics (Placeholder)</h2> // Uses global h2
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-700 p-4 rounded-lg shadow"> // bg-gray-700
              <p className="text-3xl font-bold text-blue-400">123</p> // text-blue-400
              <p className="text-gray-400">Registered Users</p> // text-gray-400
            </div>
            <div className="bg-gray-700 p-4 rounded-lg shadow"> // bg-gray-700
              <p className="text-3xl font-bold text-blue-400">456</p> // text-blue-400
              <p className="text-gray-400">Total Recipes</p> // text-gray-400
            </div>
            <div className="bg-gray-700 p-4 rounded-lg shadow"> // bg-gray-700
              <p className="text-3xl font-bold text-blue-400">789</p> // text-blue-400
              <p className="text-gray-400">Classifications Today</p> // text-gray-400
            </div>
          </div>
        </div>
        */}
      </div>
    </div>
  );
};

export default AdminDashboard;
