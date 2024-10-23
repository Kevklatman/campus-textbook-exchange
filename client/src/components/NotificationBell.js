// src/components/NotificationBell.js
import React, { useContext, useState } from 'react';
import { Bell } from 'lucide-react';
import { UserContext } from '../contexts/UserContext';

const NotificationBell = () => {
  const { notifications, markNotificationAsRead } = useContext(UserContext);
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  const handleNotificationClick = async (notification) => {
    await markNotificationAsRead(notification.id);
  };

  return (
    <div className="notification-bell-container">
      <div 
        className="notification-bell" 
        onClick={() => setShowNotifications(!showNotifications)}
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </div>

      {showNotifications && notifications?.length > 0 && (
        <div className="notification-dropdown">
          {notifications.map((notification) => (
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