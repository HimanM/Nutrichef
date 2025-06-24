import React from 'react';
import { HiOutlineCalendar, HiOutlineBookOpen, HiOutlineCamera, HiOutlineLightBulb, HiOutlineSearch, HiOutlineArrowRight } from 'react-icons/hi';
import { FaStore } from "react-icons/fa";
import { Link } from 'react-router-dom';

const FeatureCard = ({ title, description, link = "#", icon, ctaText = "Learn More" }) => (
  <div className="group p-6 text-center bg-white/80 rounded-xl transition-all duration-200 hover:bg-emerald-50 focus:bg-emerald-50 focus:outline-none animate-fade-in">
    <Link 
      to={link} 
      className="block"
    >
      <div className="mb-6 flex items-center justify-center">
        <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:shadow-emerald-500/25 transition-all duration-300">
          {icon}
        </div>
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-3 group-hover:text-emerald-600 transition-colors duration-200">{title}</h3>
      <p className="text-gray-600 text-sm mb-6 leading-relaxed">{description}</p>
      <div className="flex items-center justify-center text-emerald-600 group-hover:text-emerald-700 font-medium transition-colors duration-200">
        <span className="mr-2">{ctaText}</span>
        <HiOutlineArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
      </div>
    </Link>
  </div>
);

const HomePage = () => {
  const appName = "NutriChef";

  const features = [
    {
      title: "Smart Meal Planner",
      description: "Plan your weekly meals effortlessly, generate shopping lists, and track nutritional goals with AI-powered recommendations.",
      link: "/meal-planner",
      icon: <HiOutlineCalendar className="h-8 w-8" />,
      ctaText: "Plan Your Meals"
    },
    {
      title: "Recipe Discovery",
      description: "Explore a vast library of recipes. Filter by dietary needs, ingredients, or cuisine preferences.",
      link: "/recipes",
      icon: <HiOutlineBookOpen className="h-8 w-8" />,
      ctaText: "Find Recipes"
    },
    {
      title: "Pantry Management",
      description: "Keep tabs on your pantry items, minimize food waste, and get recipe ideas based on what you have.",
      link: "/pantry",
      icon: <FaStore className="h-8 w-8" />,
      ctaText: "Manage Pantry"
    },
    {
      title: "Ingredient Classifier",
      description: "Upload an image of an ingredient and let our AI identify it for you. Quick and accurate recognition!",
      link: "/classifier",
      icon: <HiOutlineCamera className="h-8 w-8" />,
      ctaText: "Classify Ingredients"
    },
    {
      title: "Food Substitute Finder",
      description: "Need to swap an ingredient? Find suitable alternatives based on your dietary needs or availability.",
      link: "/ingredient-substitute",
      icon: <HiOutlineLightBulb className="h-8 w-8" />,
      ctaText: "Find Substitutes"
    },
    {
      title: "Nutritional Lookup",
      description: "Access detailed nutritional information for thousands of food items and ingredients instantly.",
      link: "/food-lookup",
      icon: <HiOutlineSearch className="h-8 w-8"/>,
      ctaText: "Lookup Food"
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden section-padding">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-blue-50"></div>
        <div className="absolute inset-0 opacity-50" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2310b981' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        <div className="container-modern relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="animate-fade-in">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
                <span className="gradient-text">Welcome to</span>
                <br />
                <span className="text-gray-800">{appName}</span>
              </h1>
              <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed text-balance">
                Your intelligent partner for healthier eating. Discover recipes, plan meals, manage your pantry, and understand your food like never before with AI-powered insights.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  to="/register"
                  className="btn-primary text-lg px-8 py-4"
                >
                  Get Started Free
                </Link>
                <Link
                  to="/recipes"
                  className="btn-outline text-lg px-8 py-4"
                >
                  Explore Recipes
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Floating elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-orange-500/10 rounded-full blur-xl animate-float" style={{ animationDelay: '2s' }}></div>
      </section>

      {/* Features Section */}
      <section className="section-padding bg-white">
        <div className="container-modern">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="gradient-text">Everything You Need</span>
              <br />
              <span className="text-gray-800">for Smart Nutrition</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover powerful tools designed to make healthy eating effortless and enjoyable.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} style={{ animationDelay: `${index * 0.1}s` }}>
                <FeatureCard {...feature} />
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="section-padding bg-gradient-to-br from-emerald-50 to-blue-50">
        <div className="container-modern">
          <div className="text-center max-w-3xl mx-auto">
            <div className="animate-fade-in">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
                Ready to Transform Your Diet?
              </h2>
              <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                Join {appName} today and take the first step towards a healthier, more organized culinary life. Start your journey to better nutrition with our AI-powered platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  to="/register"
                  className="btn-primary text-lg px-8 py-4"
                >
                  Sign Up for Free
                </Link>
                <Link
                  to="/about"
                  className="btn-ghost text-lg px-8 py-4"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
