// src/components/NotificationBell.js
import React, { useContext, useState, useEffect, useRef } from 'react';
import { useHistory } from 'react-router-dom';  // or useNavigate for React Router v6
import { UserContext } from '../contexts/UserContext';

const NotificationBell = () => {
  const history = useHistory();  // or const navigate = useNavigate(); for React Router v6
  const { notifications, markAllNotificationsAsRead } = useContext(UserContext);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleBellClick = async (e) => {
    e.stopPropagation();
    setShowNotifications(!showNotifications);
    if (!showNotifications && unreadCount > 0) {
      await markAllNotificationsAsRead();
    }
  };

  const handleNotificationClick = (notification) => {
    history.push(`/posts/${notification.post_id}`);  // or navigate for React Router v6
    setShowNotifications(false); // Close the dropdown after clicking
  };

  const sortedNotifications = notifications
    ?.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    ?.slice(0, 3);

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
              onClick={() => handleNotificationClick(notification)}
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