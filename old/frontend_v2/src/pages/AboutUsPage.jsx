import React from 'react';
import { MdInfoOutline, MdBusiness, MdPeople } from 'react-icons/md';

const AboutUsPage = () => {
  const appName = "NutriChef";

  return (
    <div className="page-container max-w-5xl my-10">
      <h1 className="text-center mb-12">
        About Us
      </h1>

      <div className="max-w-3xl mx-auto mb-10 bg-gray-800 p-6 sm:p-8 shadow-xl rounded-lg">
        <div className="flex items-center mb-4">
          <MdInfoOutline className="h-7 w-7 mr-3 text-blue-400" />
          <h2 className="text-2xl">Our Mission</h2>
        </div>
        <p className="text-gray-300 leading-relaxed mb-3">
          At {appName}, our mission is to empower individuals to achieve their health and wellness goals through personalized nutrition planning and seamless recipe discovery. We believe that healthy eating should be accessible, enjoyable, and tailored to everyone's unique needs and preferences.
        </p>
        <p className="text-gray-300 leading-relaxed">
          We strive to provide a comprehensive platform that simplifies meal planning, offers diverse culinary inspiration, and supports users on their journey to a healthier lifestyle.
        </p>
      </div>

      <div className="max-w-3xl mx-auto mb-10 bg-gray-800 p-6 sm:p-8 shadow-xl rounded-lg">
        <div className="flex items-center mb-4">
          <MdBusiness className="h-7 w-7 mr-3 text-green-400" />
          <h2 className="text-2xl">Our Story</h2>
        </div>
        <p className="text-gray-300 leading-relaxed mb-3">
          Founded in [Year], {appName} started with a simple idea: to make healthy eating less complicated and more inspiring. Our founders, a passionate group of nutritionists, chefs, and tech enthusiasts, saw a need for a tool that could bridge the gap between dietary knowledge and practical, everyday meal preparation.
        </p>
        <p className="text-gray-300 leading-relaxed">
          From humble beginnings, we've grown into a vibrant community dedicated to making a positive impact on people's lives through better nutrition. We are constantly innovating and expanding our platform to meet the evolving needs of our users.
        </p>
      </div>

      <div className="max-w-3xl mx-auto mb-10 bg-gray-800 p-6 sm:p-8 shadow-xl rounded-lg">
        <div className="flex items-center mb-4">
          <MdPeople className="h-7 w-7 mr-3 text-purple-400" />
          <h2 className="text-2xl">Meet the Team</h2>
        </div>
        <p className="text-gray-300 leading-relaxed mb-3">
          {appName} is powered by a dedicated team of professionals who are passionate about health, food, and technology. While we can't list everyone here, know that each member of our team is committed to providing you with the best possible experience.
        </p>
        <p className="text-gray-300 leading-relaxed">
          Our diverse backgrounds and expertise come together to create a platform that is both scientifically sound and incredibly user-friendly. We're always excited to hear from our users and continuously work to improve {appName}.
        </p>
      </div>

    </div>
  );
};

export default AboutUsPage;
