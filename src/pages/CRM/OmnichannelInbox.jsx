import React, { useState } from 'react';
import { 
  Box, Card, Typography, TextField, IconButton, Avatar, 
  List, ListItem, ListItemAvatar, ListItemText, Divider, 
  Paper, Tooltip, CircularProgress, Badge 
} from '@mui/material';
import { 
  Send as SendIcon, 
  WhatsApp as WhatsAppIcon, 
  Email as EmailIcon, 
  Sms as SmsIcon,
  AutoAwesome as AiIcon,
  AttachFile as AttachFileIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';

// Dummy data for visual design
const DUMMY_THREADS = [
  { id: 1, name: 'Alice Freeman', lastMessage: 'Can I book an appointment?', time: '10:42 AM', source: 'whatsapp', unread: 2 },
  { id: 2, name: 'John Doe', lastMessage: 'Invoice #4029 received, thanks.', time: 'Yesterday', source: 'email', unread: 0 },
  { id: 3, name: 'Sarah Connor', lastMessage: 'Yes, address is correct.', time: 'Tuesday', source: 'sms', unread: 0 },
];

const DUMMY_MESSAGES = [
  { id: 1, text: 'Hi! I saw your ad on Instagram.', sender: 'client', time: '10:35 AM' },
  { id: 2, text: 'Hello Alice! How can we help you today?', sender: 'agent', time: '10:38 AM' },
  { id: 3, text: 'Can I book an appointment for tomorrow at 2 PM?', sender: 'client', time: '10:42 AM' },
];

const getSourceIcon = (source) => {
  switch(source) {
    case 'whatsapp': return <WhatsAppIcon sx={{ color: '#25D366', fontSize: 16 }} />;
    case 'email': return <EmailIcon sx={{ color: '#00f2fe', fontSize: 16 }} />;
    case 'sms': return <SmsIcon sx={{ color: '#b388ff', fontSize: 16 }} />;
    default: return null;
  }
};

const OmnichannelInbox = () => {
  const [activeThread, setActiveThread] = useState(DUMMY_THREADS[0]);
  const [inputText, setInputText] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);

  const handleAiDraft = () => {
    setIsAiThinking(true);
    // Simulate AI API call
    setTimeout(() => {
      setInputText("Hi Alice! Yes, we have a 2 PM slot available tomorrow. Would you like me to confirm that booking for you?");
      setIsAiThinking(false);
    }, 1500);
  };

  return (
    <Box sx={{ p: 3, height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      <Box mb={2}>
        <Typography variant="h4" fontWeight="bold" sx={{ color: 'white' }}>
          Unified Inbox
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage WhatsApp, SMS, and Email conversations in one place with AI assistance.
        </Typography>
      </Box>

      <Card sx={{ flex: 1, display: 'flex', bgcolor: '#1a1a24', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
        
        {/* LEFT SIDEBAR: Threads */}
        <Box sx={{ width: 320, borderRight: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column' }}>
          <Box p={2} sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <TextField 
              fullWidth 
              size="small" 
              placeholder="Search conversations..." 
              sx={{ bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 1 }} 
            />
          </Box>
          <List sx={{ flex: 1, overflowY: 'auto', p: 0 }}>
            {DUMMY_THREADS.map(thread => (
              <React.Fragment key={thread.id}>
                <ListItem 
                  button 
                  selected={activeThread.id === thread.id}
                  onClick={() => setActiveThread(thread)}
                  sx={{ 
                    '&.Mui-selected': { bgcolor: 'rgba(0, 242, 254, 0.1)' },
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' }
                  }}
                >
                  <ListItemAvatar>
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      badgeContent={
                        <Box sx={{ bgcolor: '#1a1a24', borderRadius: '50%', p: 0.2, display: 'flex' }}>
                          {getSourceIcon(thread.source)}
                        </Box>
                      }
                    >
                      <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.1)' }}>{thread.name.charAt(0)}</Avatar>
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText 
                    primary={
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="subtitle2" fontWeight={thread.unread ? 'bold' : 'normal'} color="white">
                          {thread.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">{thread.time}</Typography>
                      </Box>
                    }
                    secondary={
                      <Typography variant="body2" color={thread.unread ? 'white' : 'text.secondary'} noWrap>
                        {thread.lastMessage}
                      </Typography>
                    }
                  />
                  {thread.unread > 0 && (
                    <Box sx={{ bgcolor: '#00f2fe', color: 'black', borderRadius: '10px', px: 1, py: 0.2, ml: 1, fontSize: '0.75rem', fontWeight: 'bold' }}>
                      {thread.unread}
                    </Box>
                  )}
                </ListItem>
                <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />
              </React.Fragment>
            ))}
          </List>
        </Box>

        {/* RIGHT AREA: Chat Window */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', bgcolor: '#12121a' }}>
          
          {/* Chat Header */}
          <Box p={2} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', bgcolor: '#1a1a24' }}>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar>{activeThread.name.charAt(0)}</Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight="bold" color="white">{activeThread.name}</Typography>
                <Box display="flex" alignItems="center" gap={0.5}>
                  {getSourceIcon(activeThread.source)}
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                    via {activeThread.source}
                  </Typography>
                </Box>
              </Box>
            </Box>
            <IconButton sx={{ color: 'white' }}><MoreVertIcon /></IconButton>
          </Box>

          {/* Chat History */}
          <Box sx={{ flex: 1, p: 3, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {DUMMY_MESSAGES.map(msg => {
              const isAgent = msg.sender === 'agent';
              return (
                <Box key={msg.id} sx={{ display: 'flex', justifyContent: isAgent ? 'flex-end' : 'flex-start' }}>
                  <Paper sx={{ 
                    p: 2, 
                    maxWidth: '70%', 
                    bgcolor: isAgent ? '#00f2fe' : '#222230',
                    color: isAgent ? 'black' : 'white',
                    borderRadius: 3,
                    borderBottomRightRadius: isAgent ? 4 : 24,
                    borderBottomLeftRadius: isAgent ? 24 : 4,
                  }}>
                    <Typography variant="body1">{msg.text}</Typography>
                    <Typography variant="caption" sx={{ display: 'block', mt: 1, textAlign: 'right', opacity: 0.7 }}>
                      {msg.time}
                    </Typography>
                  </Paper>
                </Box>
              );
            })}
          </Box>

          {/* Input Toolbar */}
          <Box p={2} sx={{ borderTop: '1px solid rgba(255,255,255,0.1)', bgcolor: '#1a1a24' }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
              <IconButton sx={{ color: 'rgba(255,255,255,0.5)' }}>
                <AttachFileIcon />
              </IconButton>
              
              <TextField 
                fullWidth 
                multiline 
                maxRows={4} 
                placeholder="Type a message..." 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.03)', 
                  borderRadius: 2,
                  '& fieldset': { border: 'none' }
                }} 
              />
              
              <Tooltip title="Draft Reply with AI" placement="top">
                <IconButton 
                  onClick={handleAiDraft}
                  disabled={isAiThinking}
                  sx={{ 
                    bgcolor: 'rgba(179, 136, 255, 0.1)', 
                    color: '#b388ff',
                    '&:hover': { bgcolor: 'rgba(179, 136, 255, 0.2)' }
                  }}
                >
                  {isAiThinking ? <CircularProgress size={24} color="inherit" /> : <AiIcon />}
                </IconButton>
              </Tooltip>

              <IconButton 
                color="primary" 
                disabled={!inputText.trim()}
                sx={{ 
                  bgcolor: inputText.trim() ? '#00f2fe' : 'rgba(255,255,255,0.05)', 
                  color: inputText.trim() ? 'black' : 'rgba(255,255,255,0.3)',
                  '&:hover': { bgcolor: '#4facfe' }
                }}
              >
                <SendIcon />
              </IconButton>
            </Box>
          </Box>

        </Box>
      </Card>
    </Box>
  );
};

export default OmnichannelInbox;
