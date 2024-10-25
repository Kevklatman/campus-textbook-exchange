import React, { useContext, useState, useEffect, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';
import { PostContext } from '../contexts/PostContext';

const NotificationBell = () => {
  const history = useHistory();
  const { 
    notifications, 
    markAllNotificationsAsRead, 
    startNotificationPolling, 
    stopNotificationPolling 
  } = useContext(UserContext);
  const { posts, fetchAllPosts } = useContext(PostContext);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  useEffect(() => {
    // Start polling when component mounts
    startNotificationPolling();
    
    // Stop polling when component unmounts
    return () => {
      stopNotificationPolling();
    };
  }, [startNotificationPolling, stopNotificationPolling]);

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

  const handleNotificationClick = async (notification) => {
    if (posts.length === 0) {
      await fetchAllPosts();
    }
    history.push(`/posts/${notification.post_id}`);
    setShowNotifications(false);
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