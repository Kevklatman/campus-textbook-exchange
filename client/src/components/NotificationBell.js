// src/components/NotificationBell.js
import React, { useContext, useState } from 'react';
import { UserContext } from '../contexts/UserContext';

const NotificationBell = () => {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead } = useContext(UserContext);
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  const handleBellClick = async () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications && unreadCount > 0) {
      await markAllNotificationsAsRead();
    }
  };

  const handleNotificationClick = (notification) => {
    console.log('Notification clicked:', notification);
  };

  return (
    <div className="notification-bell-container">
      <div 
        className="notification-bell" 
        onClick={handleBellClick}
      >
        <span className="bell-icon">🔔</span>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </div>

      {showNotifications && notifications?.length > 0 && (
        <div className="notification-dropdown">
          {notifications.map((notification) => (
            <div 
              key={notification.id} 
              className="notification-item"
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