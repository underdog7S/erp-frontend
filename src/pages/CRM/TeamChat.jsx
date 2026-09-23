import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box, Card, Typography, TextField, IconButton, Avatar,
  List, ListItemButton, ListItemAvatar, ListItemText, Divider,
  Paper, CircularProgress, Badge, Dialog, DialogTitle, DialogContent,
  DialogActions, Button, Autocomplete, ToggleButtonGroup, ToggleButton,
  Chip, Alert, useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Send as SendIcon, Add as AddIcon, Forum as ForumIcon,
  ArrowBack as ArrowBackIcon, AutoAwesome as AiIcon
} from '@mui/icons-material';
import api from '../../services/api';

const CHANNEL_POLL_MS = 8000;
const MESSAGE_POLL_MS = 3000;

const AI_SUGGESTIONS = [
  'What can you do?',
  'Check stock of a product',
  'Log a new lead',
];

// Minimal, dependency-free formatting for AI replies: **bold** and line breaks.
const renderText = (text) =>
  String(text || '').split('\n').map((line, i, arr) => (
    <React.Fragment key={i}>
      {line.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
        part.startsWith('**') && part.endsWith('**')
          ? <strong key={j}>{part.slice(2, -2)}</strong>
          : part
      )}
      {i < arr.length - 1 && <br />}
    </React.Fragment>
  ));

const mergeMessages = (existing, incoming) => {
  const byId = new Map(existing.filter(m => !m.pending).map(m => [m.id, m]));
  incoming.forEach(m => byId.set(m.id, m));
  const pending = existing.filter(m => m.pending);
  return [...Array.from(byId.values()).sort((a, b) => a.id - b.id), ...pending];
};

const TeamChat = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [channels, setChannels] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeChannelId, setActiveChannelId] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const [loadingChannels, setLoadingChannels] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [showThreadOnMobile, setShowThreadOnMobile] = useState(false);

  const [newChatOpen, setNewChatOpen] = useState(false);
  const [newChatMode, setNewChatMode] = useState('dm');
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedGroupMembers, setSelectedGroupMembers] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [creating, setCreating] = useState(false);

  const scrollRef = useRef(null);
  const bottomRef = useRef(null);
  const stickToBottom = useRef(true);
  const lastServerIdRef = useRef(0);

  const activeChannel = channels.find(c => c.id === activeChannelId);
  const isAiChannel = activeChannel?.channel_type === 'ai';

  const fetchChannels = useCallback(async () => {
    try {
      const res = await api.get('/team-chat/channels/');
      setChannels(res.data);
    } catch (err) {
      console.error('Failed to load channels', err);
    }
  }, []);

  useEffect(() => {
    setLoadingChannels(true);
    fetchChannels().finally(() => setLoadingChannels(false));
    const interval = setInterval(() => {
      if (!document.hidden) fetchChannels();
    }, CHANNEL_POLL_MS);
    return () => clearInterval(interval);
  }, [fetchChannels]);

  // Only pulls messages newer than the last one we have, so polling is tiny.
  const fetchMessages = useCallback(async (channelId, { full = false } = {}) => {
    if (!channelId) return;
    try {
      const params = !full && lastServerIdRef.current ? { after: lastServerIdRef.current } : {};
      const res = await api.get(`/team-chat/channels/${channelId}/messages/`, { params });
      if (res.data.length) {
        lastServerIdRef.current = Math.max(lastServerIdRef.current, ...res.data.map(m => m.id));
        setMessages(prev => (full ? mergeMessages([], res.data).concat(prev.filter(m => m.pending)) : mergeMessages(prev, res.data)));
      } else if (full) {
        setMessages(prev => prev.filter(m => m.pending));
      }
    } catch (err) {
      console.error('Failed to load messages', err);
    }
  }, []);

  const handleSelectChannel = async (id) => {
    setActiveChannelId(id);
    setShowThreadOnMobile(true);
    setSendError('');
    setMessageText('');
    setMessages([]);
    lastServerIdRef.current = 0;
    stickToBottom.current = true;
    setChannels(prev => prev.map(c => c.id === id ? { ...c, unread_count: 0 } : c));
    setLoadingMessages(true);
    await fetchMessages(id, { full: true });
    setLoadingMessages(false);
    api.post(`/team-chat/channels/${id}/read/`).catch(() => {});
  };

  useEffect(() => {
    if (!activeChannelId) return undefined;
    const interval = setInterval(() => {
      if (!document.hidden) fetchMessages(activeChannelId);
    }, MESSAGE_POLL_MS);
    return () => clearInterval(interval);
  }, [activeChannelId, fetchMessages]);

  // Follow new messages only if the reader is already at the bottom, so
  // polling never yanks the view away while they're reading history.
  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  };
  useEffect(() => {
    if (stickToBottom.current) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, sending]);

  const send = async (textOverride) => {
    const content = (textOverride ?? messageText).trim();
    if (!content || !activeChannelId || sending) return;

    const tempId = `tmp-${Date.now()}`;
    setMessages(prev => [...prev, {
      id: tempId, content, is_mine: true, pending: true,
      created_at: new Date().toISOString(),
    }]);
    setMessageText('');
    setSendError('');
    setSending(true);
    stickToBottom.current = true;

    try {
      const res = await api.post(`/team-chat/channels/${activeChannelId}/messages/`, { content });
      const { ai_reply, ...sent } = res.data;
      const arrived = ai_reply ? [sent, ai_reply] : [sent];
      lastServerIdRef.current = Math.max(lastServerIdRef.current, ...arrived.map(m => m.id));
      setMessages(prev => mergeMessages(prev.filter(m => m.id !== tempId), arrived));
      fetchChannels();
    } catch (err) {
      setMessages(prev => prev.filter(m => m.id !== tempId));
      setMessageText(content);
      setSendError(err.response?.data?.error || 'Message could not be sent. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const openNewChat = async () => {
    setNewChatOpen(true);
    setNewChatMode('dm');
    setSelectedMember(null);
    setSelectedGroupMembers([]);
    setGroupName('');
    try {
      const res = await api.get('/team-chat/members/');
      setMembers(res.data);
    } catch (err) {
      console.error('Failed to load teammates', err);
    }
  };

  const handleStartDm = async () => {
    if (!selectedMember) return;
    setCreating(true);
    try {
      const res = await api.post(`/team-chat/dm/${selectedMember.id}/`);
      setNewChatOpen(false);
      await fetchChannels();
      handleSelectChannel(res.data.id);
    } catch (err) {
      setSendError(err.response?.data?.error || 'Failed to start conversation');
    } finally {
      setCreating(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedGroupMembers.length === 0) return;
    setCreating(true);
    try {
      const res = await api.post('/team-chat/channels/', {
        name: groupName,
        member_ids: selectedGroupMembers.map(m => m.id),
      });
      setNewChatOpen(false);
      await fetchChannels();
      handleSelectChannel(res.data.id);
    } catch (err) {
      setSendError(err.response?.data?.error || 'Failed to create group');
    } finally {
      setCreating(false);
    }
  };

  const formatTime = (iso) =>
    new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const listPane = (
    <Box sx={{
      width: isMobile ? '100%' : 320, flexShrink: 0,
      borderRight: isMobile ? 'none' : '1px solid rgba(255,255,255,0.05)',
      display: 'flex', flexDirection: 'column', minHeight: 0,
    }}>
      <List sx={{ flex: 1, overflow: 'auto', p: 0 }}>
        {loadingChannels && <Box sx={{ p: 3, textAlign: 'center' }}><CircularProgress size={24} /></Box>}
        {!loadingChannels && channels.length === 0 && (
          <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
            No conversations yet. Click "New" to message a teammate.
          </Box>
        )}
        {channels.map(channel => (
          <React.Fragment key={channel.id}>
            <ListItemButton
              selected={activeChannelId === channel.id}
              onClick={() => handleSelectChannel(channel.id)}
              sx={{
                '&.Mui-selected': { bgcolor: 'rgba(0, 242, 254, 0.1)' },
                '&:hover': { bgcolor: 'rgba(255,255,255,0.03)' },
              }}
            >
              <ListItemAvatar>
                <Badge badgeContent={channel.unread_count} color="error">
                  <Avatar sx={{
                    bgcolor: channel.channel_type === 'ai' ? 'secondary.main' : 'rgba(255,255,255,0.1)',
                    color: 'white',
                  }}>
                    {channel.channel_type === 'ai' ? <AiIcon fontSize="small" /> : channel.name.charAt(0)}
                  </Avatar>
                </Badge>
              </ListItemAvatar>
              <ListItemText
                primary={<Typography variant="subtitle2" color="white" noWrap>{channel.name}</Typography>}
                secondary={
                  <Typography variant="caption" noWrap sx={{ color: 'rgba(255,255,255,0.5)', display: 'block' }}>
                    {channel.last_message || 'No messages yet'}
                  </Typography>
                }
              />
            </ListItemButton>
            <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />
          </React.Fragment>
        ))}
      </List>
    </Box>
  );

  const threadPane = activeChannel ? (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0 }}>
      <Box sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 1.5, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        {isMobile && (
          <IconButton onClick={() => setShowThreadOnMobile(false)} sx={{ color: 'white' }} aria-label="Back to conversations">
            <ArrowBackIcon />
          </IconButton>
        )}
        <Avatar sx={{ bgcolor: isAiChannel ? 'secondary.main' : 'primary.main' }}>
          {isAiChannel ? <AiIcon fontSize="small" /> : activeChannel.name.charAt(0)}
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle1" color="white" fontWeight="600" noWrap>{activeChannel.name}</Typography>
          {isAiChannel && <Typography variant="caption" color="text.secondary">Private - only you see this conversation</Typography>}
        </Box>
      </Box>

      <Box ref={scrollRef} onScroll={handleScroll} sx={{ flex: 1, minHeight: 0, p: 2, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {loadingMessages ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>
        ) : messages.length === 0 ? (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography sx={{ color: 'text.secondary', mb: 2 }}>
              {isAiChannel ? 'Ask me anything, or try one of these:' : 'No messages yet. Say hello!'}
            </Typography>
            {isAiChannel && (
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
                {AI_SUGGESTIONS.map(s => (
                  <Chip key={s} label={s} onClick={() => send(s)} clickable color="secondary" variant="outlined" />
                ))}
              </Box>
            )}
          </Box>
        ) : (
          messages.map(msg => (
            <Box key={msg.id} sx={{ display: 'flex', justifyContent: msg.is_mine ? 'flex-end' : 'flex-start' }}>
              <Box sx={{
                maxWidth: { xs: '88%', md: '70%' }, px: 1.75, py: 1, borderRadius: 2,
                opacity: msg.pending ? 0.6 : 1,
                bgcolor: msg.is_mine ? 'rgba(0, 242, 254, 0.1)' : 'rgba(255,255,255,0.05)',
                border: '1px solid',
                borderColor: msg.is_mine ? 'rgba(0, 242, 254, 0.3)' : 'rgba(255,255,255,0.1)',
                borderBottomRightRadius: msg.is_mine ? 0 : 8,
                borderBottomLeftRadius: msg.is_mine ? 8 : 0,
                wordBreak: 'break-word',
              }}>
                {!msg.is_mine && (
                  <Typography variant="caption" sx={{ color: '#4facfe', display: 'block', fontWeight: 600 }}>
                    {msg.sender_name}
                  </Typography>
                )}
                <Typography variant="body2" color="white" component="div">{renderText(msg.content)}</Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', display: 'block', textAlign: 'right', mt: 0.25 }}>
                  {msg.pending ? 'Sending...' : formatTime(msg.created_at)}
                </Typography>
              </Box>
            </Box>
          ))
        )}
        {sending && isAiChannel && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
            <Box sx={{ px: 1.75, py: 1, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={14} color="secondary" />
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>AI is thinking...</Typography>
            </Box>
          </Box>
        )}
        <div ref={bottomRef} />
      </Box>

      <Box sx={{ p: 1.5, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        {sendError && <Alert severity="error" onClose={() => setSendError('')} sx={{ mb: 1 }}>{sendError}</Alert>}
        <Paper sx={{ p: '2px 4px', display: 'flex', alignItems: 'flex-end', bgcolor: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 2 }}>
          <TextField
            sx={{ ml: 1, flex: 1, '& fieldset': { border: 'none' }, textarea: { color: 'white' } }}
            placeholder={isAiChannel ? 'Ask the AI Assistant...' : 'Type a message... (Shift+Enter for a new line)'}
            value={messageText}
            multiline
            maxRows={5}
            onChange={e => setMessageText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
            }}
          />
          <IconButton color="primary" sx={{ p: '10px' }} onClick={() => send()} disabled={!messageText.trim() || sending} aria-label="Send">
            <SendIcon />
          </IconButton>
        </Paper>
      </Box>
    </Box>
  ) : (
    <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 2 }}>
      <ForumIcon sx={{ fontSize: 64, color: 'rgba(255,255,255,0.1)' }} />
      <Typography sx={{ color: 'rgba(255,255,255,0.4)' }}>Select a conversation, or start a new one</Typography>
    </Box>
  );

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 2, px: { xs: 1, md: 0 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" fontWeight="800" sx={{ background: '-webkit-linear-gradient(45deg, #00f2fe, #4facfe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Team Chat
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openNewChat}>New</Button>
      </Box>

      <Card sx={{ display: 'flex', height: { xs: 'calc(100vh - 190px)', md: '75vh' }, bgcolor: '#1a1a24', borderRadius: 3, border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
        {(!isMobile || !showThreadOnMobile) && listPane}
        {(!isMobile || showThreadOnMobile) && threadPane}
      </Card>

      <Dialog open={newChatOpen} onClose={() => setNewChatOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>New Conversation</DialogTitle>
        <DialogContent>
          <ToggleButtonGroup value={newChatMode} exclusive onChange={(e, val) => val && setNewChatMode(val)} sx={{ mb: 2, mt: 1 }} size="small">
            <ToggleButton value="dm">Direct Message</ToggleButton>
            <ToggleButton value="group">Group</ToggleButton>
          </ToggleButtonGroup>

          {newChatMode === 'dm' ? (
            <Autocomplete
              options={members}
              getOptionLabel={(m) => `${m.name} (${m.email})`}
              value={selectedMember}
              onChange={(e, val) => setSelectedMember(val)}
              renderInput={(params) => <TextField {...params} label="Select a teammate" autoFocus />}
            />
          ) : (
            <>
              <TextField fullWidth label="Group Name" value={groupName} onChange={e => setGroupName(e.target.value)} sx={{ mb: 2 }} autoFocus />
              <Autocomplete
                multiple
                options={members}
                getOptionLabel={(m) => `${m.name} (${m.email})`}
                value={selectedGroupMembers}
                onChange={(e, val) => setSelectedGroupMembers(val)}
                renderInput={(params) => <TextField {...params} label="Add members" />}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewChatOpen(false)}>Cancel</Button>
          {newChatMode === 'dm' ? (
            <Button variant="contained" onClick={handleStartDm} disabled={!selectedMember || creating}>
              {creating ? 'Starting...' : 'Start Chat'}
            </Button>
          ) : (
            <Button variant="contained" onClick={handleCreateGroup} disabled={!groupName.trim() || selectedGroupMembers.length === 0 || creating}>
              {creating ? 'Creating...' : 'Create Group'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TeamChat;
