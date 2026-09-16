import React, { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import Tooltip from '@mui/material/Tooltip';
import { useNotifications } from '../hooks/useNotifications';

/**
 * Notification Bell Component
 * Displays a bell icon with unread notification count badge
 * Opens NotificationCenter when clicked
 */
const NotificationBell = ({ onClick }) => {
  const { unreadCount, loading } = useNotifications({ 
    autoFetch: true,
    pollInterval: 60000 // Poll every 60 seconds (reduced frequency)
  });

  return (
    <Tooltip title={unreadCount > 0 ? `${unreadCount} unread notifications` : 'No new notifications'}>
      <IconButton 
        color="inherit" 
        onClick={onClick}
        sx={{ position: 'relative' }}
      >
        <Badge 
          badgeContent={unreadCount} 
          color="error"
          max={99}
          invisible={unreadCount === 0}
        >
          {unreadCount > 0 ? (
            <NotificationsIcon />
          ) : (
            <NotificationsNoneIcon />
          )}
        </Badge>
      </IconButton>
    </Tooltip>
  );
};

export default NotificationBell;

