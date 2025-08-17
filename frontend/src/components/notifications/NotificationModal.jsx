import React, { useState, useEffect } from 'react';
import ResponsiveModal from '../ui/ResponsiveModal';
import { HiCheck, HiOutlineTrash } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext.jsx';

const NotificationModal = ({ isOpen, onClose }) => {
  const { token, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [_unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated && isOpen) fetchNotifications();
    // Optionally, poll for updates
    // eslint-disable-next-line
  }, [isAuthenticated, token, isOpen]);

  const fetchNotifications = async () => {
    if (!isAuthenticated || !token) return;
    try {
      const res = await fetch('/api/notifications/', {
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
      // Fail silently
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.IsRead && token) {
      await fetch(`/api/notifications/${notif.Id}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setNotifications((prev) => prev.map(n => n.Id === notif.Id ? { ...n, IsRead: true } : n));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
    onClose();
    // Optionally, navigate to notification target
  };

  const handleClearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
    // Optionally, call backend to clear notifications
  };

  const handleMarkAllRead = async () => {
    if (!token) return;
    await Promise.all(
      notifications.filter(n => !n.IsRead).map(n =>
        fetch(`/api/notifications/${n.Id}/read`, {
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

  return (
    <ResponsiveModal isOpen={isOpen} onClose={onClose} title="Notifications">
      <div className="flex items-center justify-end gap-2 mb-2">
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
      <div className="divide-y divide-gray-100">
        {notifications.length === 0 ? (
          <div className="p-4 text-gray-500 text-center">No notifications</div>
        ) : notifications.map((notif) => (
          <button
            key={notif.Id}
            className={`w-full text-left px-2 py-3 text-sm transition-colors duration-150 ${notif.IsRead ? 'bg-white text-gray-700' : 'bg-emerald-50 text-emerald-900 font-semibold'} hover:bg-emerald-100`}
            onClick={() => handleNotificationClick(notif)}
          >
            <div>{notif.Message}</div>
            <div className="text-xs text-gray-400 mt-1">{new Date(notif.CreatedAt).toLocaleString()}</div>
          </button>
        ))}
      </div>
    </ResponsiveModal>
  );
};

export default NotificationModal; 