// src/components/NotificationBell.js
import React, { useContext, useState, useEffect, useRef } from 'react';
import { UserContext } from '../contexts/UserContext';

const NotificationBell = () => {
  const { notifications, markAllNotificationsAsRead } = useContext(UserContext);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);  // Add ref for the dropdown container

  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  // Handle clicks outside the notification component
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);

    // Cleanup the event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleBellClick = async (e) => {
    e.stopPropagation();  // Prevent event from bubbling up
    setShowNotifications(!showNotifications);
    if (!showNotifications && unreadCount > 0) {
      await markAllNotificationsAsRead();
    }
  };

  const sortedNotifications = notifications
    ?.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    ?.slice(0, 3);  // Ensure we only show 3 notifications max

  return (
    <div className="notification-bell-container" ref={notificationRef}>
      <div 
        className="notification-bell" 
        onClick={handleBellClick}
      >
        <span className="bell-icon">🔔</span>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </div>

      {showNotifications && sortedNotifications?.length > 0 && (
        <div className="notification-dropdown">
          {sortedNotifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`notification-item ${!notification.read ? 'unread' : ''}`}
            >
              <p>{notification.message}</p>
              <span className="notification-date">
                {new Date(notification.created_at).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;