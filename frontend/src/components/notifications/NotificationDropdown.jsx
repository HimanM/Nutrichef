import React, { useState, useEffect, useRef } from 'react';
import { HiOutlineBell, HiOutlineTrash, HiCheck } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

const NotificationDropdown = ({ apiUrl = '/api/notifications/', onNavigate }) => {
  const { token, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) fetchNotifications();
    const interval = setInterval(() => {
      if (isAuthenticated) fetchNotifications();
    }, 60000);
    return () => clearInterval(interval);
  }, [isAuthenticated, token]);

  const fetchNotifications = async () => {
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
    } catch (e) {
      // fail silently
    }
  };

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

  const handleClearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
    // Optionally, call backend to clear notifications
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
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('touchstart', handleClick);
    };
  }, [open]);

  if (!isAuthenticated) return null;

  // Responsive dropdown styling
  const dropdownClass =
    'absolute right-0 mt-2 w-80 max-w-xs bg-white rounded-xl shadow-lg border border-gray-100 z-50 animate-fade-in' +
    ' sm:w-96 sm:right-0' +
    ' mobile:w-full mobile:left-0 mobile:right-0 mobile:mt-0 mobile:rounded-b-2xl';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="relative p-2 rounded-full hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
        aria-label="Notifications"
        onClick={() => setOpen((o) => !o)}
      >
        <HiOutlineBell className="w-6 h-6 text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 block w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white animate-pulse"></span>
        )}
      </button>
      {open && (
        <div className={dropdownClass} style={{ minWidth: 320 }}>
          <div className="flex items-center justify-between p-4 border-b border-gray-100 font-semibold text-gray-800 bg-emerald-50 rounded-t-xl">
            <span>Notifications</span>
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
          </div>
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
            {notifications.length === 0 ? (
              <div className="p-4 text-gray-500 text-center">No notifications</div>
            ) : notifications.map((notif) => (
              <button
                key={notif.Id}
                className={`w-full text-left px-4 py-3 text-sm transition-colors duration-150 ${notif.IsRead ? 'bg-white text-gray-700' : 'bg-emerald-50 text-emerald-900 font-semibold'} hover:bg-emerald-100`}
                onClick={() => handleNotificationClick(notif)}
              >
                <div>{notif.Message}</div>
                <div className="text-xs text-gray-400 mt-1">{new Date(notif.CreatedAt).toLocaleString()}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown; 