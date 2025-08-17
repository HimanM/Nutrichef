import React, { useState, useEffect, useRef, useCallback } from 'react';
import { HiOutlineBell, HiOutlineTrash, HiCheck } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import ResponsiveModal from '../ui/ResponsiveModal';
import useResponsiveModal from '../../hooks/useResponsiveModal';
import { useModal } from '../../context/ModalContext.jsx';

const NotificationDropdown = ({ apiUrl = '/api/notifications/', onNavigate }) => {
  const { token, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const responsiveModal = useResponsiveModal(false);
  const { showModal } = useModal();

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated || !token) return;
    try {
      const res = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.IsRead).length);
    } catch {
      // fail silently
    }
  }, [isAuthenticated, token, apiUrl]);

  useEffect(() => {
    if (isAuthenticated) fetchNotifications();
    const interval = setInterval(() => {
      if (isAuthenticated) fetchNotifications();
    }, 60000);
    return () => clearInterval(interval);
  }, [isAuthenticated, fetchNotifications]);

  useEffect(() => {
    const handleResize = () => setOpen(window.innerWidth >= 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNotificationClick = async (notif) => {
    if (!notif.IsRead && token) {
      await fetch(`${apiUrl}${notif.Id}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setNotifications((prev) => prev.map(n => n.Id === notif.Id ? { ...n, IsRead: true } : n));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
    setOpen(false);
    if ((notif.Type === 'forumComment' || notif.Type === 'forumLike') && notif.ReferenceId) {
      const url = `/forum/posts/${notif.ReferenceId}`;
      if (onNavigate) onNavigate(url);
      else navigate(url);
    }
    // Extend for other notification types
  };

  const handleClearAll = async () => {
    if (!token) return;
    const confirmed = await showModal(
      'confirm',
      'Clear All Notifications',
      'Are you sure you want to delete all notifications? This action cannot be undone.',
      { iconType: 'warning', confirmText: 'Clear All', cancelText: 'Cancel' }
    );
    if (!confirmed) return;
    try {
      const res = await fetch(apiUrl + 'clear', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) throw new Error('Failed to clear notifications');
      setNotifications([]);
      setUnreadCount(0);
    } catch {
      alert('Failed to clear notifications.');
    }
  };

  const handleMarkAllRead = async () => {
    if (!token) return;
    await Promise.all(
      notifications.filter(n => !n.IsRead).map(n =>
        fetch(`${apiUrl}${n.Id}/read`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      )
    );
    setNotifications((prev) => prev.map(n => ({ ...n, IsRead: true })));
    setUnreadCount(0);
  };

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClick);
      document.addEventListener('touchstart', handleClick);
    }
    // Listen for custom event to open notifications (for mobile menu)
    const handleOpenNotifications = () => responsiveModal.openModal();
    window.addEventListener('openNotifications', handleOpenNotifications);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('touchstart', handleClick);
      window.removeEventListener('openNotifications', handleOpenNotifications);
    };
  }, [open, responsiveModal]);

  if (!isAuthenticated) return null;

  // Responsive dropdown styling
  const dropdownClass =
    'absolute right-0 mt-2 w-80 max-w-xs bg-white/80 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-100 z-50 animate-fade-in sm:w-96 sm:right-0';

  
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="relative p-2 rounded-full hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-colors duration-200"
        aria-label="Notifications"
        onClick={() => {
          if (window.innerWidth < 640) {
            responsiveModal.openModal();
          } else {
            setOpen((o) => !o);
          }
        }}
      >
        <HiOutlineBell className="w-6 h-6 text-emerald-600" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 bg-emerald-500 text-white text-xs font-bold rounded-full ring-2 ring-white animate-pulse shadow-md">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      {/* Desktop Dropdown */}
      {open && window.innerWidth >= 640 && (
        <div className={dropdownClass} style={{ minWidth: 320 }}>
          <div className="flex items-center justify-between p-4 border-b border-gray-100 font-semibold text-gray-800 bg-emerald-50 rounded-t-xl">
            <span>Notifications</span>
            {notifications.length > 0 && (
              <div className="flex gap-2">
                <button
                  className="p-1 rounded hover:bg-emerald-100 text-emerald-700"
                  title="Mark all as read"
                  onClick={handleMarkAllRead}
                  aria-label="Mark all as read"
                >
                  <HiCheck className="w-5 h-5" />
                </button>
                <button
                  className="p-1 rounded hover:bg-red-100 text-red-500"
                  title="Clear all"
                  onClick={handleClearAll}
                  aria-label="Clear all"
                >
                  <HiOutlineTrash className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 rounded-b-xl">
            {notifications.length === 0 ? (
              <div className="p-4 text-gray-500 text-center">No notifications</div>
            ) : notifications.map((notif) => (
              <button
                key={notif.Id}
                className={`w-full text-left px-4 py-3 text-sm transition-colors duration-150 ${notif.IsRead ? 'bg-white/70 text-gray-700' : 'bg-emerald-50 text-emerald-900 font-semibold'} hover:bg-emerald-100/80 rounded-xl mt-1`}
                onClick={() => handleNotificationClick(notif)}
              >
                <div>{notif.Message}</div>
                <div className="text-xs text-gray-400 mt-1">{new Date(notif.CreatedAt).toLocaleString()}</div>
              </button>
            ))}
          </div>
        </div>
      )}
      {/* Mobile Modal */}
      <ResponsiveModal
        isOpen={responsiveModal.isOpen}
        onClose={responsiveModal.closeModal}
        title="Notifications"
        showCloseButton
      >
        {/* Action Buttons - Better mobile layout */}
        {notifications.length > 0 && (
          <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <span className="text-sm text-gray-600">
                  {unreadCount} unread
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors duration-200 touch-manipulation"
                onClick={handleMarkAllRead}
                disabled={unreadCount === 0}
              >
                <HiCheck className="w-4 h-4" />
                <span className="hidden sm:inline">Mark all read</span>
              </button>
              <button
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors duration-200 touch-manipulation"
                onClick={handleClearAll}
                disabled={notifications.length === 0}
              >
                <HiOutlineTrash className="w-4 h-4" />
                <span className="hidden sm:inline">Clear all</span>
              </button>
            </div>
          </div>
        )}

        {/* Notifications List */}
        <div className="space-y-2">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <HiOutlineBell className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-lg font-medium">No notifications</p>
              <p className="text-sm text-gray-400 mt-1">You're all caught up!</p>
            </div>
          ) : notifications.map((notif) => (
            <div
              key={notif.Id}
              className={`relative rounded-xl border transition-all duration-200 ${
                notif.IsRead 
                  ? 'bg-white border-gray-200 hover:border-gray-300' 
                  : 'bg-emerald-50 border-emerald-200 hover:border-emerald-300'
              }`}
            >
              <button
                className="w-full text-left p-4 rounded-xl hover:bg-gray-50 transition-colors duration-200 touch-manipulation"
                onClick={() => {
                  handleNotificationClick(notif);
                  responsiveModal.closeModal();
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-relaxed ${
                      notif.IsRead ? 'text-gray-700' : 'text-emerald-900 font-medium'
                    }`}>
                      {notif.Message}
                    </p>
                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                      <span>{new Date(notif.CreatedAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{new Date(notif.CreatedAt).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}</span>
                    </p>
                  </div>
                  {!notif.IsRead && (
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    </div>
                  )}
                </div>
              </button>
            </div>
          ))}
        </div>
      </ResponsiveModal>
    </div>
  );
};

export default NotificationDropdown; 