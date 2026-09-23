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
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';

const BYOK_PLANS = ['platform', 'enterprise'];

const getSourceIcon = (source) => {
  switch(source?.toLowerCase()) {
    case 'whatsapp': return <WhatsAppIcon sx={{ color: '#25D366', fontSize: 16 }} />;
    case 'email': return <EmailIcon sx={{ color: '#00f2fe', fontSize: 16 }} />;
    case 'sms': return <SmsIcon sx={{ color: '#4facfe', fontSize: 16 }} />;
    default: return <EmailIcon sx={{ color: 'text.secondary', fontSize: 16 }} />;
  }
};

const OmnichannelInbox = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [threads, setThreads] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeThreadId, setActiveThreadId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [managedAssets, setManagedAssets] = useState(null);
  const [planKey, setPlanKey] = useState('');
  const [pendingAttachment, setPendingAttachment] = useState(null);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [attachmentError, setAttachmentError] = useState('');
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Fetch threads on load
  useEffect(() => {
    const fetchThreads = async () => {
      try {
        setLoading(true);
        const res = await api.get('/omnichannel/threads/');
        setThreads(res.data);
        // Deep-link support: /crm/inbox?thread=<id>, e.g. from "Message
        // this contact" in Contact Management. Falls back to the first
        // thread when there's no ?thread= param or it's not found.
        const requestedId = parseInt(searchParams.get('thread'), 10);
        const targetId = res.data.some(t => t.id === requestedId) ? requestedId : res.data[0]?.id;
        if (targetId) {
          handleSelectThread(targetId);
        }
      } catch (err) {
        console.error("Failed to load threads", err);
      } finally {
        setLoading(false);
      }
    };
    
    const fetchAssets = async () => {
      try {
        const res = await api.get('/plans/saas-usage/');
        if(res.data.managed_assets) {
          setManagedAssets(res.data.managed_assets);
        }
        setPlanKey((res.data.plan || '').toLowerCase());
      } catch (err) {
        console.error("Failed to fetch assets", err);
      }
    };

    fetchThreads();
    fetchAssets();
  }, []);

  const handleSelectThread = async (id) => {
    setActiveThreadId(id);
    setLoadingMessages(true);
    setReplyText('');
    
    // Optimistically mark unread as 0
    setThreads(prev => prev.map(t => t.id === id ? { ...t, unread: 0 } : t));

    try {
      const res = await api.get(`/omnichannel/threads/${id}/messages/`);
      setMessages(res.data);
    } catch (err) {
      console.error("Failed to fetch messages", err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSend = async () => {
    if ((!replyText.trim() && !pendingAttachment) || !activeThreadId) return;

    const attachment = pendingAttachment;
    const tempMsg = {
      id: Date.now(),
      text: replyText,
      sender: 'agent',
      time: 'Sending...',
      channel: threads.find(t => t.id === activeThreadId)?.source || 'unknown',
      attachment_url: attachment?.url,
      attachment_name: attachment?.name,
      attachment_type: attachment?.type,
    };

    setMessages(prev => [...prev, tempMsg]);
    setReplyText('');
    setPendingAttachment(null);
    scrollToBottom();

    try {
      const res = await api.post(`/omnichannel/threads/${activeThreadId}/reply/`, {
        content: tempMsg.text,
        attachment_url: attachment?.url,
        attachment_name: attachment?.name,
        attachment_type: attachment?.type,
      });
      // Replace temp message with server confirmed message
      setMessages(prev => prev.map(m => m.id === tempMsg.id ? res.data : m));
    } catch (err) {
      console.error("Failed to send message", err);
      alert("Failed to send reply. Please try again.");
    }
  };

  const handleAttachmentSelect = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file later
    if (!file) return;

    setAttachmentError('');
    setUploadingAttachment(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/omnichannel/attachments/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setPendingAttachment(res.data);
    } catch (err) {
      setAttachmentError(err.response?.data?.error || 'Failed to upload attachment');
    } finally {
      setUploadingAttachment(false);
    }
  };

  const handleAiSuggest = async () => {
    if (!activeThreadId) return;
    setAiGenerating(true);
    try {
      const res = await api.get(`/omnichannel/threads/${activeThreadId}/ai-suggest/`);
      setReplyText(res.data.suggestion);
    } catch (err) {
      console.error("AI suggestion failed", err);
      alert("AI suggestion failed. Make sure AI features are enabled for your tenant.");
    } finally {
      setAiGenerating(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const activeThread = threads.find(t => t.id === activeThreadId);

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" fontWeight="800" sx={{ background: '-webkit-linear-gradient(45deg, #00f2fe, #4facfe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Omnichannel Inbox
        </Typography>
      </Box>
      
      {managedAssets && managedAssets.phone_number && (
        <Box sx={{ p: 2, mb: 3, borderRadius: 2, bgcolor: 'rgba(76, 175, 80, 0.1)', border: '1px solid', borderColor: 'success.main', display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body1" sx={{ color: 'success.light' }}>
            {`✅ Telecom Live! Receiving messages at: ${managedAssets.phone_number} | Support Email: ${managedAssets.email_address || 'Pending'}`}
          </Typography>
        </Box>
      )}

      {managedAssets && !managedAssets.phone_number && BYOK_PLANS.includes(planKey) && (
        <Box sx={{ p: 2, mb: 3, borderRadius: 2, bgcolor: 'rgba(0, 242, 254, 0.08)', border: '1px solid', borderColor: '#00f2fe', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
          <Typography variant="body1" sx={{ color: '#00f2fe' }}>
            🔌 Your plan brings your own WhatsApp/SMS/Email — connect them to start receiving messages here.
          </Typography>
          <Box
            component="button"
            onClick={() => navigate('/settings/integrations')}
            sx={{ bgcolor: '#00f2fe', color: 'black', border: 'none', borderRadius: 1, px: 2, py: 1, fontWeight: 'bold', cursor: 'pointer' }}
          >
            Connect Now
          </Box>
        </Box>
      )}

      {managedAssets && !managedAssets.phone_number && !BYOK_PLANS.includes(planKey) && (
        <Box sx={{ p: 2, mb: 3, borderRadius: 2, bgcolor: 'rgba(255, 152, 0, 0.1)', border: '1px solid', borderColor: 'warning.main', display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body1" sx={{ color: 'warning.light' }}>
            ⏳ Provisioning your dedicated telecom numbers... Please allow 1-2 hours for engineering to assign your numbers.
          </Typography>
        </Box>
      )}

      <Card sx={{ display: 'flex', height: '75vh', bgcolor: '#1a1a24', borderRadius: 3, border: '1px solid rgba(255,255,255,0.05)' }}>
        
        {/* Left Pane - Thread List */}
        <Box sx={{ width: 320, borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ p: 2, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <TextField 
              fullWidth placeholder="Search messages..." size="small"
              sx={{ input: { color: 'white' }, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 1 }}
            />
          </Box>
          <List sx={{ flex: 1, overflow: 'auto', p: 0 }}>
            {loading && <Box sx={{ p: 3, textAlign: 'center' }}><CircularProgress size={24} /></Box>}
            {!loading && threads.length === 0 && <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>No conversations yet.</Box>}
            {threads.map(thread => (
              <React.Fragment key={thread.id}>
                <ListItem 
                  button 
                  selected={activeThreadId === thread.id}
                  onClick={() => handleSelectThread(thread.id)}
                  sx={{ 
                    '&.Mui-selected': { bgcolor: 'rgba(0, 242, 254, 0.1)' },
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.03)' }
                  }}
                >
                  <ListItemAvatar>
                    <Badge badgeContent={thread.unread} color="error">
                      <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white' }}>
                        {thread.name.charAt(0)}
                      </Avatar>
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText 
                    primary={<Typography variant="subtitle2" color="white">{thread.name}</Typography>}
                    secondary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                        {getSourceIcon(thread.source)}
                        <Typography variant="caption" noWrap sx={{ color: 'rgba(255,255,255,0.5)', maxWidth: 160 }}>
                          {thread.lastMessage}
                        </Typography>
                      </Box>
                    }
                  />
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', alignSelf: 'flex-start', mt: 1 }}>
                    {thread.time}
                  </Typography>
                </ListItem>
                <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />
              </React.Fragment>
            ))}
          </List>
        </Box>

        {/* Right Pane - Chat Window */}
        {activeThread ? (
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Chat Header */}
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>{activeThread.name.charAt(0)}</Avatar>
                <Box>
                  <Typography variant="subtitle1" color="white" fontWeight="600">{activeThread.name}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {getSourceIcon(activeThread.source)}
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                      via {activeThread.source}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <IconButton sx={{ color: 'rgba(255,255,255,0.6)' }}><MoreVertIcon /></IconButton>
            </Box>

            {/* Chat Messages */}
            <Box sx={{ flex: 1, p: 2, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
              {loadingMessages ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>
              ) : messages.length === 0 ? (
                <Typography sx={{ textAlign: 'center', mt: 5, color: 'text.secondary' }}>No messages in this thread.</Typography>
              ) : (
                messages.map(msg => {
                  const isAgent = msg.sender === 'agent' || msg.sender === 'ai';
                  return (
                    <Box key={msg.id} sx={{ display: 'flex', justifyContent: isAgent ? 'flex-end' : 'flex-start' }}>
                      <Box sx={{ 
                        maxWidth: '70%', 
                        p: 2, 
                        borderRadius: 2, 
                        bgcolor: isAgent ? 'rgba(0, 242, 254, 0.1)' : 'rgba(255,255,255,0.05)',
                        border: '1px solid',
                        borderColor: isAgent ? 'rgba(0, 242, 254, 0.3)' : 'rgba(255,255,255,0.1)',
                        borderBottomRightRadius: isAgent ? 0 : 8,
                        borderBottomLeftRadius: isAgent ? 8 : 0
                      }}>
                        {msg.attachment_url && msg.attachment_type === 'image' && (
                          <Box
                            component="img"
                            src={msg.attachment_url}
                            alt={msg.attachment_name || 'attachment'}
                            onClick={() => window.open(msg.attachment_url, '_blank')}
                            sx={{ maxWidth: '100%', maxHeight: 220, borderRadius: 1, display: 'block', mb: msg.text ? 1 : 0, cursor: 'pointer' }}
                          />
                        )}
                        {msg.attachment_url && msg.attachment_type !== 'image' && (
                          <Box
                            component="a"
                            href={msg.attachment_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, mb: msg.text ? 1 : 0, borderRadius: 1, bgcolor: 'rgba(255,255,255,0.06)', textDecoration: 'none' }}
                          >
                            <AttachFileIcon fontSize="small" sx={{ color: '#4facfe' }} />
                            <Typography variant="caption" noWrap sx={{ color: '#4facfe', maxWidth: 180 }}>
                              {msg.attachment_name || 'Attachment'}
                            </Typography>
                          </Box>
                        )}
                        {msg.text && <Typography variant="body2" color="white">{msg.text}</Typography>}
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 0.5, mt: 1 }}>
                          {msg.sender === 'ai' && <AiIcon sx={{ fontSize: 12, color: 'secondary.main' }} />}
                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>{msg.time}</Typography>
                        </Box>
                      </Box>
                    </Box>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </Box>

            {/* Chat Input */}
            <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              {attachmentError && (
                <Typography variant="caption" sx={{ color: 'error.main', display: 'block', mb: 1 }}>{attachmentError}</Typography>
              )}
              {pendingAttachment && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, p: 1, borderRadius: 1, bgcolor: 'rgba(79,172,254,0.1)', border: '1px solid rgba(79,172,254,0.3)', width: 'fit-content' }}>
                  <AttachFileIcon fontSize="small" sx={{ color: '#4facfe' }} />
                  <Typography variant="caption" sx={{ color: 'white', maxWidth: 200 }} noWrap>{pendingAttachment.name}</Typography>
                  <IconButton size="small" onClick={() => setPendingAttachment(null)} sx={{ color: 'rgba(255,255,255,0.6)', p: 0.5 }}>
                    ✕
                  </IconButton>
                </Box>
              )}
              <Paper sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', bgcolor: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 2 }}>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAttachmentSelect}
                  style={{ display: 'none' }}
                  accept=".png,.jpg,.jpeg,.gif,.webp,.pdf,.doc,.docx,.xls,.xlsx,.txt,.mp3,.ogg,.wav,.m4a,.mp4,.mov"
                />
                <IconButton
                  sx={{ p: '10px', color: 'rgba(255,255,255,0.6)' }}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAttachment}
                >
                  {uploadingAttachment ? <CircularProgress size={20} /> : <AttachFileIcon />}
                </IconButton>
                <TextField
                  sx={{ ml: 1, flex: 1, '& fieldset': { border: 'none' }, input: { color: 'white' } }}
                  placeholder={`Reply via ${activeThread.source}...`}
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  onKeyPress={(e) => { if (e.key === 'Enter') handleSend(); }}
                />
                <Tooltip title="AI Smart Reply (Requires AI Engine Add-on)">
                  <IconButton
                    color="secondary"
                    sx={{ p: '10px' }}
                    onClick={handleAiSuggest}
                    disabled={aiGenerating}
                  >
                    {aiGenerating ? <CircularProgress size={24} color="secondary" /> : <AiIcon />}
                  </IconButton>
                </Tooltip>
                <IconButton color="primary" sx={{ p: '10px' }} onClick={handleSend} disabled={uploadingAttachment}>
                  <SendIcon />
                </IconButton>
              </Paper>
            </Box>
          </Box>
        ) : (
          <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 2 }}>
            <EmailIcon sx={{ fontSize: 64, color: 'rgba(255,255,255,0.1)' }} />
            <Typography sx={{ color: 'rgba(255,255,255,0.4)' }}>Select a conversation to start messaging</Typography>
          </Box>
        )}
      </Card>
    </Box>
  );
};

export default OmnichannelInbox;
