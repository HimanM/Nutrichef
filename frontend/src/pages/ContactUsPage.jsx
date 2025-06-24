import React, { useState } from 'react';
import { HiOutlineMail, HiOutlineInformationCircle, HiOutlinePaperAirplane } from 'react-icons/hi';
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

  return (
    <>
      <InteractiveModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalContent.title}
        message={modalContent.message}
        iconType={modalContent.iconType}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
        <div className="section-padding">
          <div className="container-modern">
            {/* Header */}
            <div className="text-center mb-12 animate-fade-in">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="gradient-text">Get in Touch</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Have questions or feedback? We'd love to hear from you!
              </p>
            </div>

            <div className="max-w-4xl mx-auto space-y-8">
              {/* Contact Info Card */}
              <div className="card-glass p-8 animate-fade-in">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mr-4">
                    <HiOutlineInformationCircle className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">Contact Information</h2>
                </div>
                <div className="space-y-4 text-gray-600">
                  <p className="leading-relaxed">
                    Have a question or want to learn more? Reach out to us! We're happy to help with any inquiries you may have about {appName}, our features, or partnership opportunities.
                  </p>
                  <div className="flex items-center space-x-2">
                    <HiOutlineMail className="h-5 w-5 text-emerald-500" />
                    <span>
                      <strong>Email:</strong>{' '}
                      <a 
                        href={`mailto:hghimanmanduja@gmail.com`} 
                        className="text-emerald-600 hover:text-emerald-700 transition-colors"
                      >
                        hghimanmanduja@gmail.com
                      </a>
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Form Card */}
              <div className="card-glass p-8 animate-fade-in">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Send us a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="form-label">Name</label>
                      <input 
                        type="text" 
                        name="name" 
                        id="name" 
                        required 
                        value={formData.name} 
                        onChange={handleChange} 
                        disabled={isLoading} 
                        className="form-input" 
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="form-label">Email</label>
                      <input 
                        type="email" 
                        name="email" 
                        id="email" 
                        required 
                        value={formData.email} 
                        onChange={handleChange} 
                        disabled={isLoading} 
                        className="form-input" 
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="message" className="form-label">Message</label>
                    <textarea 
                      name="message" 
                      id="message" 
                      rows={6} 
                      required 
                      value={formData.message} 
                      onChange={handleChange} 
                      disabled={isLoading} 
                      className="form-input resize-none" 
                      placeholder="Tell us how we can help you..."
                    ></textarea>
                  </div>

                  <div className="text-center">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="btn-primary inline-flex items-center justify-center disabled:opacity-75 disabled:cursor-not-allowed"
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
                            <HiOutlinePaperAirplane className="h-5 w-5 mr-2" /> Send Message
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

export default ContactUsPage;
