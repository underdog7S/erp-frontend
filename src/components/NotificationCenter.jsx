import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  ListItemIcon,
  Divider,
  Chip,
  Button,
  Menu,
  MenuItem,
  CircularProgress,
  Alert,
  Tooltip,
  Badge
} from '@mui/material';
import {
  Close as CloseIcon,
  FilterList as FilterListIcon,
  CheckCircle as ReadIcon,
  Delete as DeleteIcon,
  MoreVert as MoreIcon,
  Info as InfoIcon,
  CheckCircle as SuccessIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Notifications as ReminderIcon,
  Campaign as AnnouncementIcon,
  NotificationsActive as AlertIcon,
  NotificationsNone as NotificationsNoneIcon
} from '@mui/icons-material';
import { useNotifications } from '../hooks/useNotifications';
import { useTheme } from '@mui/material/styles';

const DRAWER_WIDTH = 400;

/**
 * Notification Center Component
 * Full-featured notification panel with filtering, actions, and preferences
 */
const NotificationCenter = ({ open, onClose }) => {
  const theme = useTheme();
  const {
    notifications,
    stats,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    removeNotification,
    bulkDelete,
    refresh
  } = useNotifications({
    autoFetch: true,
    pollInterval: 60000, // Poll every 60 seconds (reduced frequency)
    filters: { exclude_expired: 'true' }
  });

  const [filterMenuAnchor, setFilterMenuAnchor] = useState(null);
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [moduleFilter, setModuleFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState([]);

  // Filter notifications
  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread' && n.read) return false;
    if (filter === 'read' && !n.read) return false;
    if (moduleFilter !== 'all' && n.module !== moduleFilter) return false;
    return true;
  });

  // Get icon for notification type
  const getNotificationIcon = (type) => {
    const iconProps = { fontSize: 'small', sx: { mr: 1 } };
    switch (type) {
      case 'success':
        return <SuccessIcon color="success" {...iconProps} />;
      case 'warning':
        return <WarningIcon color="warning" {...iconProps} />;
      case 'error':
        return <ErrorIcon color="error" {...iconProps} />;
      case 'reminder':
        return <ReminderIcon color="info" {...iconProps} />;
      case 'announcement':
        return <AnnouncementIcon color="primary" {...iconProps} />;
      case 'alert':
        return <AlertIcon color="error" {...iconProps} />;
      default:
        return <InfoIcon color="info" {...iconProps} />;
    }
  };

  // Get color for priority
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      default:
        return 'default';
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    await markAsRead(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    setActionMenuAnchor(null);
  };

  const handleDelete = async (notificationId) => {
    await removeNotification(notificationId);
    setActionMenuAnchor(null);
    setSelectedNotification(null);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length > 0) {
      await bulkDelete(selectedIds);
      setSelectedIds([]);
      setActionMenuAnchor(null);
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }
    if (notification.action_url) {
      window.location.href = notification.action_url;
    }
  };

  const handleSelectNotification = (notificationId) => {
    setSelectedIds(prev =>
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
        },
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Notifications
            {stats && stats.unread > 0 && (
              <Chip
                label={stats.unread}
                color="error"
                size="small"
                sx={{ ml: 1 }}
              />
            )}
          </Typography>
          <Box>
            <Tooltip title="Filter">
              <IconButton
                size="small"
                onClick={(e) => setFilterMenuAnchor(e.currentTarget)}
              >
                <FilterListIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Actions">
              <IconButton
                size="small"
                onClick={(e) => setActionMenuAnchor(e.currentTarget)}
              >
                <MoreIcon />
              </IconButton>
            </Tooltip>
            <IconButton size="small" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Filter Menu */}
        <Menu
          anchorEl={filterMenuAnchor}
          open={Boolean(filterMenuAnchor)}
          onClose={() => setFilterMenuAnchor(null)}
        >
          <MenuItem onClick={() => { setFilter('all'); setFilterMenuAnchor(null); }}>
            All Notifications
          </MenuItem>
          <MenuItem onClick={() => { setFilter('unread'); setFilterMenuAnchor(null); }}>
            Unread Only
          </MenuItem>
          <MenuItem onClick={() => { setFilter('read'); setFilterMenuAnchor(null); }}>
            Read Only
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => { setModuleFilter('all'); setFilterMenuAnchor(null); }}>
            All Modules
          </MenuItem>
          <MenuItem onClick={() => { setModuleFilter('education'); setFilterMenuAnchor(null); }}>
            Education
          </MenuItem>
          <MenuItem onClick={() => { setModuleFilter('pharmacy'); setFilterMenuAnchor(null); }}>
            Pharmacy
          </MenuItem>
          <MenuItem onClick={() => { setModuleFilter('retail'); setFilterMenuAnchor(null); }}>
            Retail
          </MenuItem>
          <MenuItem onClick={() => { setModuleFilter('hotel'); setFilterMenuAnchor(null); }}>
            Hotel
          </MenuItem>
          <MenuItem onClick={() => { setModuleFilter('restaurant'); setFilterMenuAnchor(null); }}>
            Restaurant
          </MenuItem>
          <MenuItem onClick={() => { setModuleFilter('salon'); setFilterMenuAnchor(null); }}>
            Salon
          </MenuItem>
        </Menu>

        {/* Action Menu */}
        <Menu
          anchorEl={actionMenuAnchor}
          open={Boolean(actionMenuAnchor)}
          onClose={() => setActionMenuAnchor(null)}
        >
          <MenuItem onClick={handleMarkAllAsRead}>
            <ReadIcon sx={{ mr: 1 }} />
            Mark All as Read
          </MenuItem>
          {selectedIds.length > 0 && (
            <MenuItem onClick={handleBulkDelete}>
              <DeleteIcon sx={{ mr: 1 }} />
              Delete Selected ({selectedIds.length})
            </MenuItem>
          )}
          <MenuItem onClick={refresh}>
            Refresh
          </MenuItem>
        </Menu>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ m: 2 }} onClose={() => {}}>
            {error}
          </Alert>
        )}

        {/* Notifications List */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {loading && notifications.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <CircularProgress />
            </Box>
          ) : filteredNotifications.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <NotificationsNoneIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="body2" color="text.secondary">
                No notifications
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {filteredNotifications.map((notification) => (
                <React.Fragment key={notification.id}>
                  <ListItem
                    disablePadding
                    sx={{
                      backgroundColor: notification.read ? 'transparent' : 'action.hover',
                      borderLeft: notification.read ? 'none' : `3px solid ${theme.palette.primary.main}`,
                      '&:hover': {
                        backgroundColor: 'action.selected',
                      },
                    }}
                  >
                    <ListItemButton
                      onClick={() => handleNotificationClick(notification)}
                      sx={{ py: 1.5 }}
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        {getNotificationIcon(notification.notification_type)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: notification.read ? 400 : 600 }}>
                              {notification.title}
                            </Typography>
                            {notification.priority && notification.priority !== 'low' && (
                              <Chip
                                label={notification.priority}
                                size="small"
                                color={getPriorityColor(notification.priority)}
                                sx={{ height: 20, fontSize: '0.65rem' }}
                              />
                            )}
                            {notification.module && notification.module !== 'general' && (
                              <Chip
                                label={notification.module}
                                size="small"
                                variant="outlined"
                                sx={{ height: 20, fontSize: '0.65rem' }}
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                              {notification.message}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                              {notification.time_ago}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItemButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(notification.id)}
                      sx={{ mr: 1 }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>

        {/* Footer Actions */}
        {filteredNotifications.length > 0 && (
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={handleMarkAllAsRead}
              disabled={filteredNotifications.filter(n => !n.read).length === 0}
            >
              Mark All as Read
            </Button>
          </Box>
        )}
      </Box>
    </Drawer>
  );
};

export default NotificationCenter;

