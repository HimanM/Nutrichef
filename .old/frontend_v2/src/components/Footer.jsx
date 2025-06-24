import React from 'react';

const Footer = () => {
  const appName = "NutriChef";

  return (
    <footer className="bg-gray-800 border-t border-gray-700 py-10 text-center">
      <p className="text-gray-500">&copy; {new Date().getFullYear()} {appName}. All rights reserved.</p>
      <div className="mt-4">
        <a href="/about" className="text-gray-400 hover:text-blue-400 px-3 py-1 text-sm">About Us</a>
        <a href="/privacy" className="text-gray-400 hover:text-blue-400 px-3 py-1 text-sm">Privacy Policy</a>
        <a href="/contact-us" className="text-gray-400 hover:text-blue-400 px-3 py-1 text-sm">Contact</a>
      </div>
    </footer>
  );
};

export default Footer;
