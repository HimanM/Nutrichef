import React, { useState } from 'react';
import { MdMailOutline, MdInfoOutline } from 'react-icons/md';
import InteractiveModal from '../components/InteractiveModal';

const ContactUsPage = () => {
  const appName = "NutriChef";
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '', iconType: 'info' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/contact/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const responseData = await response.json();

      if (response.ok) {
        setModalContent({
          title: 'Success!',
          message: responseData.MessageID
            ? `Your message (ID: ${responseData.MessageID}) has been sent successfully! We will get back to you soon.`
            : 'Your message has been sent successfully! We will get back to you soon.',
          iconType: 'success',
        });
        setFormData({ name: '', email: '', message: '' });
      } else {
        setModalContent({
          title: 'Error Sending Message',
          message: responseData.msg || 'Failed to send message. Please try again later.',
          iconType: 'error',
        });
      }
    } catch (error) {
      console.error('Contact form submission error:', error);
      setModalContent({
        title: 'Network Error',
        message: 'Could not connect to the server. Please check your internet connection and try again.',
        iconType: 'error',
      });
    } finally {
      setIsLoading(false);
      setIsModalOpen(true);
    }
  };

  const commonInputClassName = "mt-1 block w-full px-3 py-2.5 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-white disabled:bg-gray-600 disabled:opacity-75";
  const commonLabelClassName = "block text-sm font-medium text-gray-300";

  return (
    <>
      <InteractiveModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalContent.title}
        message={modalContent.message}
        iconType={modalContent.iconType}
      />
      <div className="page-container max-w-5xl my-10">
        <h1 className="text-center mb-8">
          Contact Us
        </h1>

        <div className="max-w-3xl mx-auto mb-8 bg-gray-800 p-6 shadow-lg rounded-lg">
          <div className="flex items-center mb-3">
            <MdInfoOutline className="h-6 w-6 mr-2 text-blue-400" />
            <h2 className="text-2xl">Get in Touch</h2>
          </div>
          <p className="text-gray-300 leading-relaxed mb-2">
            Have a question or want to learn more? Reach out to us! We're happy to help with any inquiries you may have about {appName}, our features, or partnership opportunities.
          </p>
          <p className="text-gray-300">
            <strong>Email:</strong> <a href={`mailto:contact@${appName.toLowerCase()}.example.com`} className="hover:underline">contact@{appName.toLowerCase()}.example.com</a>
          </p>
        </div>

        <div className="max-w-3xl mx-auto mb-8 bg-gray-800 p-6 shadow-lg rounded-lg">
          <h2 className="text-2xl mb-6">Send us a Message</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className={commonLabelClassName}>Name</label>
                <input type="text" name="name" id="name" required value={formData.name} onChange={handleChange} disabled={isLoading} className={commonInputClassName} />
              </div>
              <div>
                <label htmlFor="email" className={commonLabelClassName}>Email</label>
                <input type="email" name="email" id="email" required value={formData.email} onChange={handleChange} disabled={isLoading} className={commonInputClassName} />
              </div>
            </div>
            <div>
              <label htmlFor="message" className={commonLabelClassName}>Message</label>
              <textarea name="message" id="message" rows={4} required value={formData.message} onChange={handleChange} disabled={isLoading} className={commonInputClassName}></textarea>
            </div>

            <div className="text-center">
              <button
                type="submit"
                disabled={isLoading}
                className="gradient-button w-full sm:w-auto inline-flex items-center justify-center disabled:opacity-75"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    Sending...
                    </>
                  ) : (
                    <>
                      <MdMailOutline className="h-5 w-5 mr-2" /> Send Message
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
    </>
  );
};

export default ContactUsPage;
