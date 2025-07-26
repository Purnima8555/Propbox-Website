import React, { useEffect, useState } from 'react';
import { Bell, CheckCircle, AlertCircle, Info } from 'lucide-react';
import axios from 'axios';

const Notification = ({ onClose, onUnreadChange }) => {
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState(null);
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!userId) {
        setError('Please log in to view notifications');
        return;
      }

      try {
        const response = await axios.get(`http://localhost:3000/api/notifications/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const fetchedNotifications = response.data.notifications;
        console.log("Fetched notifications:", fetchedNotifications);
        setNotifications(fetchedNotifications);

        const unreadCount = fetchedNotifications.filter((n) => !n.read).length;
        if (onUnreadChange) onUnreadChange(unreadCount);
      } catch (error) {
        console.error("Error fetching notifications:", error);
        setError(error.response?.data?.message || 'Failed to load notifications. Please try again.');
      }
    };

    fetchNotifications();
  }, [userId, onUnreadChange]);

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter((notification) => !notification.read);

      const promises = unreadNotifications.map(async (notification) => {
        await axios.patch(
          `http://localhost:3000/api/notifications/${notification._id}/read`,
          {},
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
      });

      await Promise.all(promises);

      const updatedNotifications = notifications.map((notif) => ({
        ...notif,
        read: true,
      }));

      setNotifications(updatedNotifications);
      if (onUnreadChange) onUnreadChange(0);
    } catch (error) {
      console.error("Error marking notifications as read:", error);
      setError(error.response?.data?.message || 'Failed to mark notifications as read.');
    }
  };

  return (
    <div
      className="
        absolute right-1 top-20
        bg-white border-2 border-gray-300 rounded-lg shadow-lg z-50 flex flex-col 
        w-[90vw] sm:w-72 md:w-80 lg:w-96 
        max-h-[60vh] sm:max-h-[400px] lg:max-h-[500px]
      "
    >
      <div className="px-4 py-3 border-b border-gray-200 flex-shrink-0">
        <h3 className="font-medium text-base text-black">Notifications ▾</h3>
      </div>

      {error && (
        <div className="px-4 py-3 text-red-500 text-sm text-center">{error}</div>
      )}

      <ul className="overflow-y-auto flex-grow">
        {notifications.length === 0 && !error && (
          <li className="px-4 py-3 text-gray-500 text-sm text-center">
            No notifications available
          </li>
        )}
        {notifications.map((note) => (
          <li key={note._id} className="px-4 py-3 border-b last:border-b-0 flex gap-3">
            <div className="pt-1 relative">
              {note.type === 'info' ? (
                <Info className="w-5 h-5 text-blue-500" />
              ) : note.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : note.type === 'warning' ? (
                <AlertCircle className="w-5 h-5 text-yellow-500" />
              ) : (
                <Bell className="w-5 h-5 text-red-500" />
              )}
              {!note.read && (
                <span className="absolute top-0 right-0 w-2 h-2 bg-orange-400 rounded-full"></span>
              )}
            </div>
            <div className="text-sm">
              <p className="font-semibold text-black">{note.message}</p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(note.createdAt).toLocaleString()}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <div className="px-4 py-3 border-t flex items-center justify-between text-sm flex-shrink-0">
        <button className="text-blue-600 hover:underline" onClick={onClose}>
          Close Notification
        </button>
        <button className="text-yellow-600 hover:underline" onClick={markAllAsRead}>
          Mark all as read
        </button>
      </div>
    </div>
  );
};

export default Notification;