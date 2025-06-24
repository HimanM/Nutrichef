import React from 'react';
// Importing relevant icons for a privacy policy page
import { MdDescription, MdSecurity, MdOutlineGavel, MdOutlineContactSupport, MdOutlineChildCare, MdOutlineNewReleases, MdOutlineVpnKey, MdOutlineShare } from 'react-icons/md';

const PrivacyPolicyPage = () => {
  const appName = "NutriChef";
  const lastUpdatedDate = "October 26, 2023";

  const pStyle = "text-gray-700 leading-relaxed mb-4";
  const subHStyle = "text-xl font-semibold text-gray-100 mb-2 mt-4";

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      <div className="section-padding">
        <div className="container-modern">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text">Privacy Policy</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              How we collect, use, and protect your personal information
            </p>
          </div>

          {/* Main Content - match About Us style */}
          <div className="space-y-10 animate-fade-in">
            {/* Introduction */}
            <div>
              <div className="flex items-center mb-4">
                <MdDescription className="h-7 w-7 mr-3 text-blue-400" />
                <h2 className="text-2xl">Introduction</h2>
              </div>
              <p className={pStyle}>
                Welcome to {appName}! We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about this privacy notice, or our practices with regards to your personal information, please contact us.
              </p>
              <p className={pStyle}>
                This privacy notice describes how we might use your information if you visit our website, use our mobile application, or otherwise engage with our services.
              </p>
            </div>

            {/* Information We Collect Section */}
            <div>
              <div className="flex items-center mb-4">
                <MdOutlineVpnKey className="h-7 w-7 mr-3 text-green-400" />
                <h2 className="text-2xl">Information We Collect</h2>
              </div>
              <p className={pStyle}>
                We collect personal information that you voluntarily provide to us when you register on the {appName} platform, express an interest in obtaining information about us or our products and services, when you participate in activities on the platform or otherwise when you contact us.
              </p>
              <h3 className={subHStyle}>Personal Information Provided by You</h3>
              <p className={pStyle}>
                The personal information that we collect depends on the context of your interactions with us and the {appName} platform, the choices you make and the products and features you use. The personal information we collect may include the following: names, email addresses, passwords, contact preferences, dietary information, health goals, and user generated content like recipes or meal plans.
              </p>
              <h3 className={subHStyle}>Information Automatically Collected</h3>
              <p className={pStyle}>
                We automatically collect certain information when you visit, use or navigate the {appName} platform. This information does not reveal your specific identity (like your name or contact information) but may include device and usage information, such as your IP address, browser and device characteristics, operating system, language preferences, referring URLs, device name, country, location, information about how and when you use our platform and other technical information.
              </p>
            </div>

            {/* How We Use Your Information Section */}
            <div>
              <div className="flex items-center mb-4">
                <MdOutlineGavel className="h-7 w-7 mr-3 text-yellow-400" />
                <h2 className="text-2xl">How We Use Your Information</h2>
              </div>
              <p className={pStyle}>
                We use personal information collected via our {appName} platform for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.
              </p>
              <ul className="list-disc list-inside text-gray-700 leading-relaxed mb-4 pl-4">
                <li>To facilitate account creation and logon process.</li>
                <li>To personalize your experience and to allow us to deliver the type of content and product offerings in which you are most interested.</li>
                <li>To manage user accounts and provide customer support.</li>
                <li>To send administrative information to you.</li>
                <li>To request feedback and to contact you about your use of the {appName} platform.</li>
                <li>To protect our Services (for example, for fraud monitoring and prevention).</li>
                <li>For other business purposes, such as data analysis, identifying usage trends, determining the effectiveness of our promotional campaigns and to evaluate and improve our platform, products, marketing and your experience.</li>
              </ul>
            </div>
            {/* Data Sharing and Disclosure Section */}
            <div>
              <div className="flex items-center mb-4">
                <MdOutlineShare className="h-7 w-7 mr-3 text-emerald-400" />
                <h2 className="text-2xl">Data Sharing and Disclosure</h2>
              </div>
              <p className={pStyle}>
                We may process or share your data that we hold based on the following legal basis: Consent, Legitimate Interests, Performance of a Contract, Legal Obligations. More specifically, we may need to process your data or share your personal information in the following situations: Business Transfers, Affiliates, Business Partners, With your Consent.
              </p>
            </div>
            {/* Data Security Section */}
            <div>
              <div className="flex items-center mb-4">
                <MdSecurity className="h-7 w-7 mr-3 text-red-400" />
                <h2 className="text-2xl">Data Security</h2>
              </div>
              <p className={pStyle}>
                We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, despite our safeguards and efforts to secure your information, no electronic transmission over the Internet or information storage technology can be guaranteed to be 100% secure, so we cannot promise or guarantee that hackers, cybercriminals, or other unauthorized third parties will not be able to defeat our security, and improperly collect, access, steal, or modify your information.
              </p>
            </div>
            {/* Your Rights and Choices Section */}
            <div>
              <div className="flex items-center mb-4">
                <MdOutlineVpnKey className="h-7 w-7 mr-3 text-teal-400" />
                <h2 className="text-2xl">Your Rights and Choices</h2>
              </div>
              <p className={pStyle}>
                In some regions (like the EEA and UK), you have certain rights under applicable data protection laws. These may include the right (i) to request access and obtain a copy of your personal information, (ii) to request rectification or erasure; (iii) to restrict the processing of your personal information; and (iv) if applicable, to data portability. In certain circumstances, you may also have the right to object to the processing of your personal information. To make such a request, please use the contact details provided below.
              </p>
              <p className={pStyle}>
                You can opt-out of marketing communications at any time by clicking on the unsubscribe link in the emails that we send or by contacting us.
              </p>
            </div>
            {/* Children's Privacy Section */}
            <div>
              <div className="flex items-center mb-4">
                <MdOutlineChildCare className="h-7 w-7 mr-3 text-pink-400" />
                <h2 className="text-2xl">Children's Privacy</h2>
              </div>
              <p className={pStyle}>
                We do not knowingly solicit data from or market to children under 18 years of age. By using the {appName} platform, you represent that you are at least 18 or that you are the parent or guardian of such a minor and consent to such minor dependent's use of the platform.
              </p>
            </div>
            {/* Changes to This Policy Section */}
            <div>
              <div className="flex items-center mb-4">
                <MdOutlineNewReleases className="h-7 w-7 mr-3 text-orange-400" />
                <h2 className="text-2xl">Changes to This Policy</h2>
              </div>
              <p className={pStyle}>
                We may update this privacy notice from time to time. The updated version will be indicated by an updated "Revised" date and the updated version will be effective as soon as it is accessible. We encourage you to review this privacy notice frequently to be informed of how we are protecting your information.
              </p>
            </div>
            {/* Contact Us Section */}
            <div>
              <div className="flex items-center mb-4">
                <MdOutlineContactSupport className="h-7 w-7 mr-3 text-cyan-400" />
                <h2 className="text-2xl">Contact Us</h2>
              </div>
              <p className={pStyle}>
                If you have questions or comments about this notice, you may email us at privacy@{appName.toLowerCase()}.example.com or contact us via our <a href="/contact-us" className="hover:underline text-blue-300">Contact Page</a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
