import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import InteractiveModal from '../../components/InteractiveModal';
import { AiOutlineLoading } from 'react-icons/ai';
import { MdCheckCircle, MdError, MdOutlineRemoveRedEye, MdReply } from 'react-icons/md';
import { HiX } from 'react-icons/hi';

const AdminContactMessagesPage = () => {
  const { token } = useAuth(); // Assuming useAuth provides the JWT token

  // --- State Management ---
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Or make this configurable

  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // For view/reply modal
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);
  const [replyError, setReplyError] = useState('');

  const [notificationModalOpen, setNotificationModalOpen] = useState(false);
  const [notificationModalContent, setNotificationModalContent] = useState({ title: '', message: '', iconType: 'info' });

  // --- Fetch Messages ---
  const fetchMessages = useCallback(async (page) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/contact/admin/messages?page=${page}&per_page=${itemsPerPage}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || `HTTP error ${response.status}`);
      }
      const data = await response.json();
      setMessages(data.messages || []);
      setCurrentPage(data.pagination.page);
      setTotalPages(data.pagination.total_pages);
    } catch (err) {
      setError(err.message || 'Failed to fetch messages.');
      setMessages([]); // Clear messages on error
    } finally {
      setLoading(false);
    }
  }, [token, itemsPerPage]);

  useEffect(() => {
    if (token) {
      fetchMessages(currentPage);
    }
  }, [fetchMessages, currentPage, token]);

  // --- Modal Handlers ---
  const handleOpenModal = (message) => {
    setSelectedMessage(message);
    setReplyText(''); // Clear previous reply text
    setReplyError('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMessage(null);
  };

  const handleCloseNotificationModal = () => {
    setNotificationModalOpen(false);
  };

  // --- Handle Send Reply ---
  const handleSendReply = async () => {
    if (!selectedMessage || !replyText.trim()) {
      setReplyError("Reply text cannot be empty.");
      return;
    }
    setReplyLoading(true);
    setReplyError('');

    try {
      const response = await fetch(`/api/contact/admin/messages/${selectedMessage.MessageID}/reply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reply_subject: `Re: Your inquiry to NutriChef (ID: ${selectedMessage.MessageID})`,
          reply_body: replyText,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.msg || `HTTP error ${response.status}`);
      }

      setReplyLoading(false);
      handleCloseModal(); // Close reply modal
      setNotificationModalContent({ title: 'Success', message: `Reply sent successfully to ${selectedMessage.Email}!`, iconType: 'success' });
      setNotificationModalOpen(true);

      // Update message in state or re-fetch
      // For simplicity, re-fetching current page to get updated status
      fetchMessages(currentPage);

    } catch (err) {
      setReplyLoading(false);
      setReplyError(err.message || 'Failed to send reply.');
      // Optionally, show this error in the main notification modal too
      // setNotificationModalContent({ title: 'Reply Error', message: err.message || 'Failed to send reply.', iconType: 'error' });
      // setNotificationModalOpen(true);
    }
  };

  // --- Pagination Handlers ---
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleChangeRowsPerPage = (event) => {
    setItemsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(1);
  };

  // --- Render Helper for Message Snippet ---
  const getMessageSnippet = (message, maxLength = 50) => {
    if (!message) return '';
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
  };

  const commonButtonClassNameBase = "px-3 py-1.5 text-xs font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50";

  return (
    <div className="section-padding">
      <div className="container-modern">
        <div className="text-center mb-10 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">Contact Messages</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">View and respond to messages submitted via the contact form.</p>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">{error}</div>
        )}
        
        {loading && (
          <div className="flex justify-center items-center h-64">
            <AiOutlineLoading className="animate-spin text-4xl text-emerald-500" />
            <p className="ml-2">Loading messages...</p>
          </div>
        )}
        
        {!loading && !error && messages.length === 0 && (
          <div className="text-center p-4 bg-gray-50 text-gray-700 rounded-md">
            No messages found.
          </div>
        )}

        {!loading && !error && messages.length > 0 && (
          <div className="card-glass shadow-lg rounded-3xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-emerald-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">Message</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">Replied</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {messages.map((msg) => (
                    <tr key={msg.MessageID} className={`${msg.Replied ? 'bg-gray-100 opacity-70' : 'hover:bg-emerald-50'} transition-colors duration-150`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{new Date(msg.CreatedAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{msg.Name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{msg.Email}</td>
                      <td className="px-6 py-4 text-sm text-gray-400 max-w-xs truncate" title={msg.Message}>{getMessageSnippet(msg.Message)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {msg.Replied ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-600 text-green-100">
                            Yes
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-600 text-red-100">
                            No
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleOpenModal(msg)}
                          className="text-emerald-600 hover:text-emerald-700 flex items-center"
                          title={msg.Replied ? "View Message" : "View & Reply"}
                        >
                          {msg.Replied ? <MdOutlineRemoveRedEye className="mr-1 h-5 w-5" /> : <MdReply className="mr-1 h-5 w-5" />}
                          {msg.Replied ? "View" : "Reply"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 bg-white rounded-b-3xl">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button onClick={handlePreviousPage} disabled={currentPage === 1 || loading} className={`btn-primary ${commonButtonClassNameBase}`}>Previous</button>
                  <button onClick={handleNextPage} disabled={currentPage === totalPages || loading} className={`btn-primary ${commonButtonClassNameBase}`}>Next</button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs text-gray-500">
                      Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <label htmlFor="adminMessageRowsPerPageSelect" className="text-xs text-gray-500">Rows:</label>
                    <select id="adminMessageRowsPerPageSelect" value={itemsPerPage} onChange={handleChangeRowsPerPage} className="px-2 py-1 bg-gray-100 border border-gray-200 text-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 text-xs">
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button onClick={handlePreviousPage} disabled={currentPage === 1 || loading} className={`${commonButtonClassNameBase} bg-gray-100 text-gray-500 hover:bg-gray-200 border-gray-200 rounded-l-md border`}>Prev</button>
                      <button onClick={handleNextPage} disabled={currentPage === totalPages || loading} className={`${commonButtonClassNameBase} bg-gray-100 text-gray-500 hover:bg-gray-200 border-gray-200 rounded-r-md border`}>Next</button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Notification Modal */}
        <InteractiveModal
          isOpen={notificationModalOpen}
          onClose={handleCloseNotificationModal}
          title={notificationModalContent.title}
          message={notificationModalContent.message}
          iconType={notificationModalContent.iconType}
        />

        {/* Reply/View Modal */}
        {selectedMessage && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto h-full w-full flex justify-center items-center z-50 px-4 py-6"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setSelectedMessage(null);
              }
            }}
          >
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden border border-emerald-100">
              {/* Header */}
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-semibold">Message Details</h3>
                    <p className="text-emerald-100 text-sm mt-1">ID: {selectedMessage.MessageID}</p>
                  </div>
                  <button
                    onClick={() => setSelectedMessage(null)}
                    className="text-white hover:text-emerald-200 transition-colors duration-200 p-1"
                  >
                    <HiX className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column - Original Message */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg font-semibold text-emerald-700 mb-3 flex items-center">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                        Original Message
                      </h4>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">From:</label>
                          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <p className="text-gray-800 font-medium">{selectedMessage.Name}</p>
                            <p className="text-gray-600 text-sm">{selectedMessage.Email}</p>
                          </div>
                        </div>
                        
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">Message:</label>
                          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 min-h-[100px]">
                            <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{selectedMessage.Message}</p>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">Received:</label>
                          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <p className="text-gray-800">{new Date(selectedMessage.CreatedAt).toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Reply Section */}
                  <div className="space-y-4">
                    {selectedMessage.Replied ? (
                      <div>
                        <h4 className="text-lg font-semibold text-emerald-700 mb-3 flex items-center">
                          <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                          Reply Sent
                        </h4>
                        <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                          <div className="flex items-center mb-2">
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium mr-2">
                              ✓ Sent
                            </span>
                            <span className="text-sm text-gray-600">
                              {selectedMessage.ReplyDate ? new Date(selectedMessage.ReplyDate).toLocaleString() : 'Recently'}
                            </span>
                          </div>
                          <div className="bg-white p-3 rounded border border-emerald-200">
                            <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{selectedMessage.Reply}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h4 className="text-lg font-semibold text-emerald-700 mb-3 flex items-center">
                          <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                          Send Reply
                        </h4>
                        
                        <div className="space-y-3">
                          <div>
                            <label htmlFor="replyText" className="block text-sm font-medium text-gray-600 mb-2">Your Reply:</label>
                            <textarea
                              id="replyText"
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-100 resize-none"
                              rows="8"
                              placeholder="Type your reply to this message..."
                            />
                            {replyError && (
                              <p className="text-red-600 text-sm mt-2 flex items-center">
                                <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                                {replyError}
                              </p>
                            )}
                          </div>
                          
                          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                            <div className="flex items-start">
                              <span className="text-blue-600 mr-2 mt-0.5">💡</span>
                              <div className="text-sm text-blue-800">
                                <p className="font-medium mb-1">Reply Guidelines:</p>
                                <ul className="text-xs space-y-1">
                                  <li>• Be professional and courteous</li>
                                  <li>• Address their specific concerns</li>
                                  <li>• Provide helpful information or next steps</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex gap-3 pt-2">
                            <button
                              onClick={handleSendReply}
                              disabled={!replyText.trim() || replyLoading}
                              className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                            >
                              {replyLoading ? (
                                <>
                                  <AiOutlineLoading className="animate-spin w-4 h-4 mr-2" />
                                  Sending...
                                </>
                              ) : (
                                <>
                                  <MdReply className="w-4 h-4 mr-2" />
                                  Send Reply
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => setSelectedMessage(null)}
                              className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors duration-200"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminContactMessagesPage;
