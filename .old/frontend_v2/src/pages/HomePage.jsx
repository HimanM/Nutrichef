import React from 'react';
import NavigationBar from '../components/NavigationBar.jsx';
import Footer from '../components/Footer.jsx';
import { HiOutlineCalendar, HiOutlineBookOpen, HiOutlineCamera, HiOutlineLightBulb, HiOutlineSearch } from 'react-icons/hi';
import { FaStore } from "react-icons/fa";
import { Link } from 'react-router-dom';

const FeatureCard = ({ title, description, link = "#", icon, ctaText = "Learn More" }) => (
  <a 
    href={link} 
    className="bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-blue-500/30 hover:bg-gray-700 transition-all duration-300 ease-in-out transform hover:-translate-y-1 flex flex-col items-center text-center"
  >
    <div className="text-blue-500 mb-5">
      {icon}
    </div>
    <h3 className="text-2xl font-semibold text-white mb-3">{title}</h3>
    <p className="text-gray-400 text-sm mb-5 flex-grow">{description}</p>
    <span className="mt-auto text-blue-400 hover:text-blue-300 font-medium transition-colors">
      {ctaText} &rarr;
    </span>
  </a>
);


const HomePage = () => {
  const appName = "NutriChef";

  const features = [
    {
      title: "Smart Meal Planner",
      description: "Plan your weekly meals effortlessly, generate shopping lists, and track nutritional goals.",
      link: "/meal-planner",
      icon: <HiOutlineCalendar className="h-10 w-10" />,
      ctaText: "Plan Your Meals"
    },
    {
      title: "Recipe Discovery",
      description: "Explore a vast library of recipes. Filter by dietary needs, ingredients, or cuisine.",
      link: "/recipes",
      icon: <HiOutlineBookOpen className="h-10 w-10" />,
      ctaText: "Find Recipes"
    },
    {
      title: "Pantry Management",
      description: "Keep tabs on your pantry items, minimize food waste, and get recipe ideas based on what you have.",
      link: "/pantry",
      icon: <FaStore className="h-10 w-10" />,
      ctaText: "Manage Pantry"
    },
    {
      title: "Ingredient Classifier",
      description: "Upload an image of an ingredient and let our AI identify it for you. Quick and easy!",
      link: "/classifier",
      icon: <HiOutlineCamera className="h-10 w-10" />,
      ctaText: "Classify Ingredients"
    },
    {
      title: "Food Substitute Finder",
      description: "Need to swap an ingredient? Find suitable alternatives based on your dietary needs or availability.",
      link: "/ingredient-substitute",
      icon: <HiOutlineLightBulb className="h-10 w-10" />,
      ctaText: "Find Substitutes"
    },
     {
      title: "Nutritional Lookup",
      description: "Access detailed nutritional information for thousands of food items and ingredients instantly.",
      link: "/food-lookup",
      icon: <HiOutlineSearch className="h-10 w-10"/>,
      ctaText: "Lookup Food"
    },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <section className="container mx-auto px-6 py-24 text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-teal-400 mb-6">
          Welcome to {appName}
        </h1>
        <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
          Your intelligent partner for healthier eating. Discover recipes, plan meals, manage your pantry, and understand your food like never before.
        </p>
        <a
          href="#features" 
          className="bg-blue-600 hover:bg-blue-700 text-white hover:text-white font-bold py-4 px-10 rounded-lg text-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-lg hover:shadow-blue-500/50"
        >
          Get Started
        </a>
      </section>

      <section id="features" className="py-20 bg-gray-800/50">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-white mb-16">
            Everything You Need for Smart Nutrition
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>
      </section>
      
      <section className="py-24 bg-gray-900">
        <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold text-white mb-6">Ready to Transform Your Diet?</h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto">
                Join {appName} today and take the first step towards a healthier, more organized culinary life.
            </p>
            <Link
                to="/register"
                className="bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-semibold py-3 px-8 rounded-lg text-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
            >
                Sign Up for Free
            </Link>
        </div>
      </section>

    </div>
  );
};

export default HomePage;
