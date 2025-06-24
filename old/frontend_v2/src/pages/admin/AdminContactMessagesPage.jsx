import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import InteractiveModal from '../../components/InteractiveModal';
import { AiOutlineLoading } from 'react-icons/ai';
import { MdCheckCircle, MdError, MdOutlineRemoveRedEye, MdReply } from 'react-icons/md';

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

  // --- Render Helper for Message Snippet ---
  const getMessageSnippet = (message, maxLength = 50) => {
    if (!message) return '';
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
  };


  return (
    <div className="page-container">
      <h1 className="text-2xl font-semibold mb-6">Contact Messages</h1>

      {/* Notification Modal */}
      <InteractiveModal
        isOpen={notificationModalOpen}
        onClose={handleCloseNotificationModal}
        title={notificationModalContent.title}
        message={notificationModalContent.message}
        iconType={notificationModalContent.iconType}
      />

      {/* Main Content: Loading, Error, Table */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <AiOutlineLoading className="animate-spin text-4xl text-blue-500" />
          <p className="ml-2">Loading messages...</p>
        </div>
      )}
      {error && !loading && (
        <div className="text-center p-4 bg-red-100 text-red-700 rounded">
          <MdError className="text-2xl inline mr-2" /> {error}
        </div>
      )}
      {!loading && !error && messages.length === 0 && (
        <div className="text-center p-4 bg-gray-100 text-gray-700 rounded">
          No messages found.
        </div>
      )}

      {!loading && !error && messages.length > 0 && (
        <>
          <div className="overflow-x-auto bg-gray-800 shadow-md rounded-lg">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Message Snippet</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Replied</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {messages.map((msg) => (
                  <tr key={msg.MessageID} className={`${msg.Replied ? 'bg-gray-750 opacity-70' : 'hover:bg-gray-700'} transition-colors duration-150`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{new Date(msg.CreatedAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{msg.Name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{msg.Email}</td>
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
                        className="text-blue-400 hover:text-blue-300 flex items-center"
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

          {/* Pagination Controls */}
          <div className="mt-6 flex justify-between items-center">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1 || loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-300">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages || loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </>
      )}

      {/* Reply/View Modal */}
      {isModalOpen && selectedMessage && (
        <div className="fixed inset-0 bg-gray-800/30 backdrop-blur-sm overflow-y-auto h-full w-full flex justify-center items-center z-40 px-4 py-6">
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">
                {selectedMessage.Replied ? "View Message" : "Reply to Message"} (ID: {selectedMessage.MessageID})
              </h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-200">&times;</button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-400"><strong>From:</strong> {selectedMessage.Name} ({selectedMessage.Email})</p>
              <p className="text-sm text-gray-400"><strong>Received:</strong> {new Date(selectedMessage.CreatedAt).toLocaleString()}</p>
            </div>

            <div>
              <h3 className="text-md font-semibold text-gray-200 mb-1">Original Message:</h3>
              <div className="mb-4 p-3 bg-gray-700 rounded">
                <p className="text-sm text-gray-300 whitespace-pre-wrap">{selectedMessage.Message}</p>
              </div>
            </div>

            {selectedMessage.Replied ? (
              <div className="p-3 bg-green-700 text-green-100 rounded-md text-sm">
                <MdCheckCircle className="inline mr-2 h-5 w-5" /> This message has already been replied to.
              </div>
            ) : (
              <div>
                <h3 className="text-md font-semibold text-gray-200 mb-2">Your Reply:</h3>
                <textarea
                  rows="6"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply here..."
                  className="w-full p-2.5 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-600"
                  disabled={replyLoading}
                />
                {replyError && <p className="text-red-400 text-sm mt-1">{replyError}</p>}
                <div className="mt-4 flex justify-end space-x-3">
                  <button
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-600 hover:bg-gray-500 rounded-md disabled:opacity-50"
                    disabled={replyLoading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendReply}
                    disabled={replyLoading || !replyText.trim()}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {replyLoading && <AiOutlineLoading className="animate-spin mr-2" />}
                    Send Reply
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminContactMessagesPage;
