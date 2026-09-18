import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, Card, Typography, TextField, IconButton, Avatar, Select, MenuItem, 
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

const DUMMY_THREADS = [
  { id: 1, name: 'Alice Freeman', lastMessage: 'Can I book an appointment?', time: '10:42 AM', source: 'whatsapp', unread: 2 },
  { id: 2, name: 'John Doe', lastMessage: 'Invoice #4029 received, thanks.', time: 'Yesterday', source: 'email', unread: 0 },
  { id: 3, name: 'Sarah Connor', lastMessage: 'Yes, address is correct.', time: 'Tuesday', source: 'sms', unread: 0 },
];

const INITIAL_MESSAGES = [
  { id: 1, text: 'Hi! I saw your ad on Instagram.', sender: 'client', time: '10:35 AM', channel: 'whatsapp' },
  { id: 2, text: 'Hello Alice! How can we help you today?', sender: 'agent', time: '10:38 AM', channel: 'whatsapp' },
  { id: 3, text: 'Can I book an appointment for tomorrow at 2 PM?', sender: 'client', time: '10:42 AM', channel: 'whatsapp' },
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
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [replyChannel, setReplyChannel] = useState(DUMMY_THREADS[0].source);
  const ws = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // 1. Fetch current tenant slug (using 'default' for demo purposes)
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const tenantSlug = user.tenant_slug || 'default';
    
    // 2. Open WebSocket connection (Dynamic for Production HTTPS/WSS)
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // Use API URL host if available, otherwise fallback to current hostname
    let wsHost = window.location.hostname + (window.location.port ? ':' + window.location.port : '');
    if (process.env.REACT_APP_API_URL) {
      try {
        wsHost = new URL(process.env.REACT_APP_API_URL).host;
      } catch (e) {
        console.error("Invalid REACT_APP_API_URL", e);
      }
    }
    const wsUrl = `${protocol}//${wsHost}/ws/inbox/${tenantSlug}/`;
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log("Connected to Real-time Omnichannel WebSocket");
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'new_message') {
        const newMsg = {
          id: data.message_data.id,
          text: data.message_data.text,
          sender: data.message_data.sender,
          time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        };
        // Append to chat window instantly
        setMessages(prev => [...prev, newMsg]);
      }
    };

    ws.current.onerror = (error) => {
      console.error("WebSocket Error:", error);
    };

    return () => {
      if (ws.current) ws.current.close();
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    
    const newMsg = {
      id: Date.now(),
      text: inputText,
      sender: 'agent',
      channel: replyChannel,
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    };
    
    setMessages([...messages, newMsg]);
    setInputText('');
    
    // In a real app, you would POST this to Django to send via Meta API
  };

  const handleAiDraft = () => {
    setIsAiThinking(true);
    // Simulate AI API call for frontend UX
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
        
        {/* LEFT SIDEBAR */}
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
                  onClick={() => { setActiveThread(thread); setReplyChannel(thread.source); }}
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

          <Box sx={{ flex: 1, p: 3, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {messages.map(msg => {
              const isAgent = msg.sender === 'agent' || msg.sender === 'ai';
              const ch = msg.channel || activeThread.source;
              
              // Colors based on channel UX Guide
              let bg = '#222230';
              let textColor = 'white';
              
              if (isAgent) {
                if (ch === 'whatsapp') { bg = '#056162'; textColor = 'white'; } // Dark WhatsApp Green
                else if (ch === 'sms') { bg = '#007aff'; textColor = 'white'; } // iMessage Blue
                else if (ch === 'email') { bg = '#2a2a35'; textColor = 'white'; } // Email Gray
                
                if (msg.sender === 'ai') bg = '#4a148c'; // Deep purple for AI
              } else {
                if (ch === 'whatsapp') { bg = '#262d31'; textColor = 'white'; }
                else if (ch === 'email') { bg = '#2a2a35'; textColor = 'white'; }
              }

              return (
                <Box key={msg.id} sx={{ display: 'flex', justifyContent: isAgent ? 'flex-end' : 'flex-start', mb: 1 }}>
                  <Paper sx={{ 
                    p: ch === 'email' ? 3 : 1.5, 
                    maxWidth: ch === 'email' ? '85%' : '70%', 
                    bgcolor: bg,
                    color: textColor,
                    borderRadius: 3,
                    borderBottomRightRadius: isAgent ? 4 : 24,
                    borderBottomLeftRadius: isAgent ? 24 : 4,
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                  }}>
                    {ch === 'email' && !isAgent && (
                      <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1, borderBottom: '1px solid rgba(255,255,255,0.1)', pb: 1 }}>
                        Subject: Inquiry regarding services
                      </Typography>
                    )}
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{msg.text}</Typography>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        {getSourceIcon(ch)}
                        {msg.sender === 'ai' && (
                          <Chip size="small" icon={<AiIcon style={{fontSize:12}}/>} label="Auto-Replied by AI" sx={{ height: 20, fontSize: '0.65rem', bgcolor: 'rgba(255,255,255,0.15)', color: 'white' }} />
                        )}
                      </Box>
                      <Typography variant="caption" sx={{ opacity: 0.7, ml: 2 }}>
                        {msg.time}
                      </Typography>
                    </Box>
                  </Paper>
                </Box>
              );
            })}
            <div ref={messagesEndRef} />
          </Box>

          <Box p={2} sx={{ borderTop: '1px solid rgba(255,255,255,0.1)', bgcolor: '#1a1a24', display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1 }}>
              <Typography variant="caption" color="text.secondary">Replying via:</Typography>
              <Select
                size="small"
                value={replyChannel}
                onChange={(e) => setReplyChannel(e.target.value)}
                sx={{ 
                  height: 24, fontSize: '0.75rem', color: 'white', 
                  '.MuiOutlinedInput-notchedOutline': { border: 'none' },
                  bgcolor: 'rgba(255,255,255,0.05)'
                }}
              >
                <MenuItem value="whatsapp"><Box display="flex" alignItems="center" gap={1}><WhatsAppIcon sx={{fontSize:14, color:'#25D366'}}/> WhatsApp</Box></MenuItem>
                <MenuItem value="email"><Box display="flex" alignItems="center" gap={1}><EmailIcon sx={{fontSize:14, color:'#00f2fe'}}/> Email</Box></MenuItem>
                <MenuItem value="sms"><Box display="flex" alignItems="center" gap={1}><SmsIcon sx={{fontSize:14, color:'#b388ff'}}/> SMS</Box></MenuItem>
              </Select>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
              <IconButton sx={{ color: 'rgba(255,255,255,0.5)' }}><AttachFileIcon /></IconButton>
              
              <TextField 
                fullWidth 
                multiline 
                maxRows={4} 
                placeholder="Type a message..." 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
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
                onClick={handleSend}
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
