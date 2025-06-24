import React from 'react';
import { HiOutlineInformationCircle, HiOutlineOfficeBuilding, HiOutlineUserGroup, HiOutlineHeart, HiOutlineLightBulb, HiOutlineSparkles } from 'react-icons/hi';

const AboutUsPage = () => {
  const appName = "NutriChef";

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      <div className="section-padding">
        <div className="container-modern">
          {/* Header */}
          <div className="text-center mb-16 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="gradient-text">About NutriChef</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Empowering individuals to achieve their health and wellness goals through personalized nutrition planning and seamless recipe discovery.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            {/* Mission Card */}
            <div className="card-glass p-8 animate-fade-in">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mr-4">
                  <HiOutlineLightBulb className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Our Mission</h2>
              </div>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  At {appName}, our mission is to empower individuals to achieve their health and wellness goals through personalized nutrition planning and seamless recipe discovery. We believe that healthy eating should be accessible, enjoyable, and tailored to everyone's unique needs and preferences.
                </p>
                <p>
                  We strive to provide a comprehensive platform that simplifies meal planning, offers diverse culinary inspiration, and supports users on their journey to a healthier lifestyle.
                </p>
              </div>
            </div>

            {/* Story Card */}
            <div className="card-glass p-8 animate-fade-in">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-4">
                  <HiOutlineOfficeBuilding className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Our Story</h2>
              </div>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Founded in 2024, {appName} started with a simple idea: to make healthy eating less complicated and more inspiring. Our founders, a passionate group of nutritionists, chefs, and tech enthusiasts, saw a need for a tool that could bridge the gap between dietary knowledge and practical, everyday meal preparation.
                </p>
                <p>
                  From humble beginnings, we've grown into a vibrant community dedicated to making a positive impact on people's lives through better nutrition. We are constantly innovating and expanding our platform to meet the evolving needs of our users.
                </p>
              </div>
            </div>

            {/* Team Card */}
            <div className="card-glass p-8 animate-fade-in">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                  <HiOutlineUserGroup className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Meet the Team</h2>
              </div>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  {appName} is powered by a dedicated team of professionals who are passionate about health, food, and technology. While we can't list everyone here, know that each member of our team is committed to providing you with the best possible experience.
                </p>
                <p>
                  Our diverse backgrounds and expertise come together to create a platform that is both scientifically sound and incredibly user-friendly. We're always excited to hear from our users and continuously work to improve {appName}.
                </p>
              </div>
            </div>

            {/* Values Card */}
            <div className="card-glass p-8 animate-fade-in">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mr-4">
                  <HiOutlineHeart className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Our Values</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <HiOutlineSparkles className="h-8 w-8 text-emerald-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">Innovation</h3>
                  <p className="text-sm text-gray-600">Continuously improving our platform with cutting-edge technology</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <HiOutlineHeart className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">Health First</h3>
                  <p className="text-sm text-gray-600">Prioritizing user health and wellness in everything we do</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <HiOutlineUserGroup className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">Community</h3>
                  <p className="text-sm text-gray-600">Building a supportive community of health-conscious individuals</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUsPage;
