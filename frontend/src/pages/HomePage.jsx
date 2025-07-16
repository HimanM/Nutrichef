import React from 'react';
import { HiOutlineCalendar, HiOutlineBookOpen, HiOutlineCamera, HiOutlineLightBulb, HiOutlineSearch, HiOutlineArrowRight } from 'react-icons/hi';
import { FaStore } from "react-icons/fa";
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const FeatureCard = ({ title, description, link = "#", icon, ctaText = "Learn More" }) => (
  <div className="group p-3 sm:p-4 lg:p-6 text-center bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-white/20 shadow-soft hover:shadow-lg hover:bg-white/90 hover:border-emerald-200/50 focus:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 animate-fade-in h-full flex flex-col feature-card-mobile sm:feature-card-desktop transition-all duration-300 ease-out">
    <Link 
      to={link} 
      className="h-full flex flex-col"
    >
      <div className="mb-3 sm:mb-4 lg:mb-6 flex items-center justify-center">
        <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl sm:rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:shadow-emerald-500/30 group-hover:scale-105 transition-all duration-300 feature-icon border border-emerald-400/20">
          {icon}
        </div>
      </div>
      <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-800 mb-2 sm:mb-3 group-hover:text-emerald-600 transition-colors duration-200 leading-tight">{title}</h3>
      <p className="text-gray-600 text-sm sm:text-base mb-3 sm:mb-4 lg:mb-6 leading-relaxed flex-grow">{description}</p>
      <div className="flex items-center justify-center text-emerald-600 group-hover:text-emerald-700 font-medium transition-colors duration-200 mt-auto cta-button px-3 sm:px-4 py-2 rounded-lg border border-emerald-200/50 group-hover:border-emerald-300 group-hover:bg-emerald-50/50 text-sm sm:text-base">
        <span className="mr-2">{ctaText}</span>
        <HiOutlineArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
      </div>
    </Link>
  </div>
);

const HomePage = () => {
  const appName = "NutriChef";
  const { isAuthenticated, currentUser } = useAuth();

  const features = [
    {
      title: "Smart Meal Planner",
      description: "Plan your weekly meals effortlessly, generate shopping lists, and track nutritional goals with AI-powered recommendations.",
      link: "/meal-planner",
      icon: <HiOutlineCalendar className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8" />,
      ctaText: "Plan Your Meals"
    },
    {
      title: "Recipe Discovery",
      description: "Explore a vast library of recipes. Filter by dietary needs, ingredients, or cuisine preferences.",
      link: "/recipes",
      icon: <HiOutlineBookOpen className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8" />,
      ctaText: "Find Recipes"
    },
    {
      title: "Pantry Management",
      description: "Keep tabs on your pantry items, minimize food waste, and get recipe ideas based on what you have.",
      link: "/pantry",
      icon: <FaStore className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8" />,
      ctaText: "Manage Pantry"
    },
    {
      title: "Ingredient Classifier",
      description: "Upload an image of an ingredient and let our AI identify it for you. Quick and accurate recognition!",
      link: "/classifier",
      icon: <HiOutlineCamera className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8" />,
      ctaText: "Classify Ingredients"
    },
    {
      title: "Food Substitute Finder",
      description: "Need to swap an ingredient? Find suitable alternatives based on your dietary needs or availability.",
      link: "/ingredient-substitute",
      icon: <HiOutlineLightBulb className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8" />,
      ctaText: "Find Substitutes"
    },
    {
      title: "Nutritional Lookup",
      description: "Access detailed nutritional information for thousands of food items and ingredients instantly.",
      link: "/food-lookup",
      icon: <HiOutlineSearch className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8"/>,
      ctaText: "Lookup Food"
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-screen flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-blue-50"></div>
        <div className="absolute inset-0 opacity-50" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2310b981' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        <div className="container-modern relative z-10 px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="animate-fade-in">
              {isAuthenticated ? (
                // Authenticated user hero
                <>
                  <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 sm:mb-8 leading-tight">
                    <span className="gradient-text">Welcome back,</span>
                    <br />
                    <span className="text-gray-800">{currentUser?.name || 'Chef'}!</span>
                  </h1>
                  <p className="text-lg sm:text-xl text-gray-600 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed text-balance px-4">
                    Ready to continue your culinary journey? Explore your favorite tools and discover new recipes tailored just for you.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4">
                    <Link
                      to="/meal-planner"
                      className="btn-primary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto"
                    >
                      Plan My Meals
                    </Link>
                    <Link
                      to="/recipes"
                      className="btn-outline text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto"
                    >
                      Discover Recipes
                    </Link>
                  </div>
                </>
              ) : (
                // Non-authenticated user hero
                <>
                  <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 sm:mb-8 leading-tight">
                    <span className="gradient-text">Welcome to</span>
                    <br />
                    <span className="text-gray-800">{appName}</span>
                  </h1>
                  <p className="text-lg sm:text-xl text-gray-600 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed text-balance px-4">
                    Your intelligent partner for healthier eating. Discover recipes, plan meals, manage your pantry, and understand your food like never before with AI-powered insights.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4">
                    <Link
                      to="/register"
                      className="btn-primary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto"
                    >
                      Get Started Free
                    </Link>
                    <Link
                      to="/recipes"
                      className="btn-outline text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto"
                    >
                      Explore Recipes
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Floating elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-orange-500/10 rounded-full blur-xl animate-float" style={{ animationDelay: '2s' }}></div>
      </section>

      {/* Features Section */}
      <section className="py-8 sm:py-12 lg:py-16 bg-white relative">
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%2310b981' fill-opacity='0.03'%3E%3Cpath d='M20 20c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm-30 0c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10-10-4.477-10-10z'/%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        <div className="container-modern px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 lg:mb-6">
              {isAuthenticated ? (
                <>
                  <span className="gradient-text">Your Tools</span>
                  <br />
                  <span className="text-gray-800">for Smart Nutrition</span>
                </>
              ) : (
                <>
                  <span className="gradient-text">Everything You Need</span>
                  <br />
                  <span className="text-gray-800">for Smart Nutrition</span>
                </>
              )}
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-4">
              {isAuthenticated 
                ? "Quick access to all your favorite NutriChef features. Choose what you need and start cooking smarter today."
                : "Discover powerful tools designed to make healthy eating effortless and enjoyable."
              }
            </p>
            <div className="w-16 sm:w-24 h-1 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full mx-auto mt-4 sm:mt-6"></div>
          </div>
          
          <div >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 quick-links-grid">
              {features.map((feature, index) => (
                <div key={index} style={{ animationDelay: `${index * 0.1}s` }} className="h-full">
                  <FeatureCard {...feature} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section - Only show for non-authenticated users */}
      {!isAuthenticated && (
        <section className="py-8 sm:py-12 lg:py-16 bg-gradient-to-br from-emerald-50 to-blue-50">
          <div className="container-modern px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <div className="animate-fade-in">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-3 sm:mb-4 lg:mb-6">
                  Ready to Transform Your Diet?
                </h2>
                <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 lg:mb-10 leading-relaxed px-4">
                  Join {appName} today and take the first step towards a healthier, more organized culinary life. Start your journey to better nutrition with our AI-powered platform.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4">
                  <Link
                    to="/register"
                    className="btn-primary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto"
                  >
                    Sign Up for Free
                  </Link>
                  <Link
                    to="/about"
                    className="btn-ghost text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto"
                  >
                    Learn More
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* For authenticated users, show a personalized dashboard-like section */}
      {isAuthenticated && (
        <section className="py-8 sm:py-12 lg:py-16 bg-gradient-to-br from-emerald-50 to-blue-50">
          <div className="container-modern px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <div className="animate-fade-in">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-3 sm:mb-4 lg:mb-6">
                  Your Culinary Dashboard
                </h2>
                <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 lg:mb-10 leading-relaxed px-4">
                  Access all your favorite tools and continue building your healthy lifestyle with {appName}'s comprehensive features.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4">
                  <Link
                    to="/pantry"
                    className="btn-primary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto"
                  >
                    Manage Pantry
                  </Link>
                  <Link
                    to="/classifier"
                    className="btn-outline text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto"
                  >
                    Identify Ingredients
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;
