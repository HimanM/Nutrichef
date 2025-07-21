import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import InteractiveModal from '../../components/ui/InteractiveModal';
import ResponsiveTable from '../../components/admin/ResponsiveTable';
import { AiOutlineLoading } from 'react-icons/ai';
import { MdCheckCircle, MdError, MdOutlineRemoveRedEye, MdReply } from 'react-icons/md';
import { HiX, HiEye, HiChat } from 'react-icons/hi';

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

  const handleChangePage = (newPage) => {
    setCurrentPage(newPage);
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

  const columns = [
    { 
      key: 'CreatedAt', 
      label: 'Date', 
      sortable: false,
      render: (msg) => new Date(msg.CreatedAt).toLocaleDateString()
    },
    { key: 'Name', label: 'Name', sortable: false },
    { key: 'Email', label: 'Email', sortable: false },
    { 
      key: 'Message', 
      label: 'Message', 
      sortable: false,
      render: (msg) => (
        <span className="max-w-xs truncate block" title={msg.Message}>
          {getMessageSnippet(msg.Message)}
        </span>
      )
    },
    { 
      key: 'Replied', 
      label: 'Replied', 
      sortable: false,
      render: (msg) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          msg.Replied 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {msg.Replied ? 'Yes' : 'No'}
        </span>
      )
    }
  ];

  const actions = [
    {
      label: 'View / Reply',
      icon: HiEye,
      onClick: (msg) => handleOpenModal(msg),
      className: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 focus:ring-emerald-500'
    }
  ];

  const pagination = {
    currentPage: currentPage,
    totalPages: totalPages,
    onPageChange: handleChangePage,
    onRowsPerPageChange: handleChangeRowsPerPage,
    rowsPerPage: itemsPerPage
  };

  return (
    <div className="section-padding">
      <div className="container-modern">
        <div className="text-center mb-10 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">Contact Messages</h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">View and respond to messages submitted via the contact form.</p>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">{error}</div>
        )}
        
        {loading && messages.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <AiOutlineLoading className="animate-spin text-4xl text-emerald-500" />
            <p className="ml-2">Loading messages...</p>
          </div>
        ) : !loading && !error && messages.length === 0 ? (
          <div className="text-center p-4 bg-gray-50 text-gray-700 rounded-md">
            No messages found.
          </div>
        ) : (
          <ResponsiveTable
            data={messages}
            columns={columns}
            loading={loading}
            actions={actions}
            pagination={pagination}
            tableTitle="Messages"
          />
        )}

        {/* View/Reply Modal */}
        <InteractiveModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={selectedMessage?.Replied ? "View Message" : "Reply to Message"}
          size="lg"
        >
          {selectedMessage && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedMessage.Name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedMessage.Email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date</label>
                    <p className="mt-1 text-sm text-gray-900">{new Date(selectedMessage.CreatedAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      selectedMessage.Replied 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedMessage.Replied ? 'Replied' : 'Pending'}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Message</label>
                  <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{selectedMessage.Message}</p>
                </div>
              </div>

              {!selectedMessage.Replied && (
                <div className="space-y-3">
                  <label htmlFor="replyText" className="block text-sm font-medium text-gray-700">
                    Your Reply
                  </label>
                  <textarea
                    id="replyText"
                    rows={6}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Type your reply here..."
                  />
                  {replyError && (
                    <div className="text-red-600 text-sm">{replyError}</div>
                  )}
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                
                {!selectedMessage.Replied && (
                  <button
                    onClick={handleSendReply}
                    disabled={replyLoading}
                    className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 flex items-center"
                  >
                    {replyLoading ? (
                      <>
                        <AiOutlineLoading className="animate-spin mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <MdReply className="mr-2" />
                        Send Reply
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}
        </InteractiveModal>

        {/* Notification Modal */}
        <InteractiveModal
          isOpen={notificationModalOpen}
          onClose={handleCloseNotificationModal}
          title={notificationModalContent.title}
          size="md"
        >
          <div className="flex items-center space-x-3">
            {notificationModalContent.iconType === 'success' && (
              <MdCheckCircle className="text-green-500 text-xl" />
            )}
            {notificationModalContent.iconType === 'error' && (
              <MdError className="text-red-500 text-xl" />
            )}
            <p className="text-gray-700">{notificationModalContent.message}</p>
          </div>
          <div className="flex justify-end mt-4">
            <button
              onClick={handleCloseNotificationModal}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              OK
            </button>
          </div>
        </InteractiveModal>
      </div>
    </div>
  );
};
export default AdminContactMessagesPage;
