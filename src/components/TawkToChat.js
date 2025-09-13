import React, { useEffect, useState } from 'react';
import { Box, Fab, Badge, Tooltip } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';

const TawkToChat = ({ 
  siteId = process.env.REACT_APP_TAWK_TO_SITE_ID || 'your_site_id', 
  widgetId = process.env.REACT_APP_TAWK_TO_WIDGET_ID || 'your_widget_id',
  position = 'bottom-right',
  showBadge = true,
  badgeCount = 0,
  customStyle = {}
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Load Tawk.to script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://embed.tawk.to/${siteId}/${widgetId}`;
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');

    script.onload = () => {
      setIsLoaded(true);
      initializeTawkTo();
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup
      if (window.Tawk_API) {
        window.Tawk_API.endChat();
      }
    };
  }, [siteId, widgetId]);

  const initializeTawkTo = () => {
    if (window.Tawk_API) {
      // Set visitor information
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.email) {
        window.Tawk_API.setAttributes({
          'name': user.first_name + ' ' + user.last_name,
          'email': user.email,
          'role': user.role || 'User',
          'tenant': user.tenant || 'Unknown',
          'industry': user.industry || 'Unknown'
        });
      }

      // Listen for chat events
      window.Tawk_API.onLoad = function() {
        console.log('Tawk.to chat loaded');
      };

      window.Tawk_API.onStatusChange = function(status) {
        console.log('Chat status:', status);
      };

      window.Tawk_API.onBeforeLoad = function() {
        console.log('Tawk.to chat loading...');
      };

      window.Tawk_API.onAfterLoad = function() {
        console.log('Tawk.to chat loaded successfully');
      };
    }
  };

  const handleChatToggle = () => {
    if (window.Tawk_API) {
      if (isOpen) {
        window.Tawk_API.hideWidget();
        setIsOpen(false);
      } else {
        window.Tawk_API.showWidget();
        setIsOpen(true);
      }
    }
  };

  const handleChatClose = () => {
    if (window.Tawk_API) {
      window.Tawk_API.hideWidget();
      setIsOpen(false);
    }
  };

  // Custom styles based on position
  const getPositionStyles = () => {
    const baseStyles = {
      position: 'fixed',
      zIndex: 9999,
      ...customStyle
    };

    switch (position) {
      case 'bottom-right':
        return { ...baseStyles, bottom: 20, right: 20 };
      case 'bottom-left':
        return { ...baseStyles, bottom: 20, left: 20 };
      case 'top-right':
        return { ...baseStyles, top: 20, right: 20 };
      case 'top-left':
        return { ...baseStyles, top: 20, left: 20 };
      default:
        return { ...baseStyles, bottom: 20, right: 20 };
    }
  };

  if (!isLoaded) {
    return null;
  }

  return (
    <Box sx={getPositionStyles()}>
      {showBadge && badgeCount > 0 && (
        <Badge 
          badgeContent={badgeCount} 
          color="error"
          sx={{ 
            position: 'absolute',
            top: -8,
            right: -8,
            zIndex: 10000
          }}
        />
      )}
      
      <Tooltip title={isOpen ? "Close Chat" : "Open Chat"}>
        <Fab
          color="primary"
          aria-label="chat"
          onClick={handleChatToggle}
          sx={{
            width: 56,
            height: 56,
            boxShadow: 3,
            '&:hover': {
              boxShadow: 6,
            }
          }}
        >
          {isOpen ? <CloseIcon /> : <ChatIcon />}
        </Fab>
      </Tooltip>
    </Box>
  );
};

// Higher-order component to wrap Tawk.to functionality
export const withTawkTo = (WrappedComponent, tawkProps = {}) => {
  return function WithTawkToComponent(props) {
    return (
      <>
        <WrappedComponent {...props} />
        <TawkToChat {...tawkProps} />
      </>
    );
  };
};

// Hook to use Tawk.to functionality
export const useTawkTo = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(!!window.Tawk_API);
  }, []);

  const sendMessage = (message) => {
    if (window.Tawk_API && isLoaded) {
      window.Tawk_API.sendMessage(message);
    }
  };

  const setVisitorInfo = (info) => {
    if (window.Tawk_API && isLoaded) {
      window.Tawk_API.setAttributes(info);
    }
  };

  const showWidget = () => {
    if (window.Tawk_API && isLoaded) {
      window.Tawk_API.showWidget();
    }
  };

  const hideWidget = () => {
    if (window.Tawk_API && isLoaded) {
      window.Tawk_API.hideWidget();
    }
  };

  const endChat = () => {
    if (window.Tawk_API && isLoaded) {
      window.Tawk_API.endChat();
    }
  };

  return {
    isLoaded,
    sendMessage,
    setVisitorInfo,
    showWidget,
    hideWidget,
    endChat
  };
};

export default TawkToChat; 