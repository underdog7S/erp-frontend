import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box, Card, Typography, TextField, IconButton, Avatar,
  List, ListItem, ListItemAvatar, ListItemText, Divider,
  Paper, CircularProgress, Badge, Dialog, DialogTitle, DialogContent,
  DialogActions, Button, Autocomplete, ToggleButtonGroup, ToggleButton
} from '@mui/material';
import { Send as SendIcon, Add as AddIcon, Forum as ForumIcon } from '@mui/icons-material';
import api from '../../services/api';

const CHANNEL_POLL_MS = 8000;
const MESSAGE_POLL_MS = 4000;

const TeamChat = () => {
  const [channels, setChannels] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeChannelId, setActiveChannelId] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [loadingChannels, setLoadingChannels] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [newChatMode, setNewChatMode] = useState('dm');
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedGroupMembers, setSelectedGroupMembers] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [creating, setCreating] = useState(false);
  const messagesEndRef = useRef(null);

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
    const interval = setInterval(fetchChannels, CHANNEL_POLL_MS);
    return () => clearInterval(interval);
  }, [fetchChannels]);

  const fetchMessages = useCallback(async (channelId) => {
    if (!channelId) return;
    try {
      const res = await api.get(`/team-chat/channels/${channelId}/messages/`);
      setMessages(res.data);
    } catch (err) {
      console.error('Failed to load messages', err);
    }
  }, []);

  const handleSelectChannel = async (id) => {
    setActiveChannelId(id);
    setLoadingMessages(true);
    setChannels(prev => prev.map(c => c.id === id ? { ...c, unread_count: 0 } : c));
    await fetchMessages(id);
    setLoadingMessages(false);
    api.post(`/team-chat/channels/${id}/read/`).catch(() => {});
  };

  useEffect(() => {
    if (!activeChannelId) return;
    const interval = setInterval(() => fetchMessages(activeChannelId), MESSAGE_POLL_MS);
    return () => clearInterval(interval);
  }, [activeChannelId, fetchMessages]);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => { scrollToBottom(); }, [messages]);

  const handleSend = async () => {
    if (!messageText.trim() || !activeChannelId) return;
    const content = messageText;
    setMessageText('');
    try {
      const res = await api.post(`/team-chat/channels/${activeChannelId}/messages/`, { content });
      const { ai_reply, ...sentMessage } = res.data;
      setMessages(prev => ai_reply ? [...prev, sentMessage, ai_reply] : [...prev, sentMessage]);
      fetchChannels();
    } catch (err) {
      console.error('Failed to send message', err);
      alert('Failed to send message. Please try again.');
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
      alert(err.response?.data?.error || 'Failed to start conversation');
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
      alert(err.response?.data?.error || 'Failed to create group');
    } finally {
      setCreating(false);
    }
  };

  const activeChannel = channels.find(c => c.id === activeChannelId);

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="800" sx={{ background: '-webkit-linear-gradient(45deg, #00f2fe, #4facfe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Team Chat
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openNewChat}>
          New
        </Button>
      </Box>

      <Card sx={{ display: 'flex', height: '75vh', bgcolor: '#1a1a24', borderRadius: 3, border: '1px solid rgba(255,255,255,0.05)' }}>
        <Box sx={{ width: 320, borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column' }}>
          <List sx={{ flex: 1, overflow: 'auto', p: 0 }}>
            {loadingChannels && <Box sx={{ p: 3, textAlign: 'center' }}><CircularProgress size={24} /></Box>}
            {!loadingChannels && channels.length === 0 && (
              <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
                No conversations yet. Click "New" to message a teammate.
              </Box>
            )}
            {channels.map(channel => (
              <React.Fragment key={channel.id}>
                <ListItem
                  button
                  selected={activeChannelId === channel.id}
                  onClick={() => handleSelectChannel(channel.id)}
                  sx={{
                    '&.Mui-selected': { bgcolor: 'rgba(0, 242, 254, 0.1)' },
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.03)' }
                  }}
                >
                  <ListItemAvatar>
                    <Badge badgeContent={channel.unread_count} color="error">
                      <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white' }}>
                        {channel.name.charAt(0)}
                      </Avatar>
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText
                    primary={<Typography variant="subtitle2" color="white">{channel.name}</Typography>}
                    secondary={
                      <Typography variant="caption" noWrap sx={{ color: 'rgba(255,255,255,0.5)', display: 'block', maxWidth: 220 }}>
                        {channel.last_message || 'No messages yet'}
                      </Typography>
                    }
                  />
                </ListItem>
                <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />
              </React.Fragment>
            ))}
          </List>
        </Box>

        {activeChannel ? (
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <Avatar sx={{ bgcolor: 'primary.main' }}>{activeChannel.name.charAt(0)}</Avatar>
              <Typography variant="subtitle1" color="white" fontWeight="600">{activeChannel.name}</Typography>
            </Box>

            <Box sx={{ flex: 1, p: 2, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
              {loadingMessages ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>
              ) : messages.length === 0 ? (
                <Typography sx={{ textAlign: 'center', mt: 5, color: 'text.secondary' }}>No messages yet. Say hello!</Typography>
              ) : (
                messages.map(msg => (
                  <Box key={msg.id} sx={{ display: 'flex', justifyContent: msg.is_mine ? 'flex-end' : 'flex-start' }}>
                    <Box sx={{
                      maxWidth: '70%', p: 2, borderRadius: 2,
                      bgcolor: msg.is_mine ? 'rgba(0, 242, 254, 0.1)' : 'rgba(255,255,255,0.05)',
                      border: '1px solid',
                      borderColor: msg.is_mine ? 'rgba(0, 242, 254, 0.3)' : 'rgba(255,255,255,0.1)',
                      borderBottomRightRadius: msg.is_mine ? 0 : 8,
                      borderBottomLeftRadius: msg.is_mine ? 8 : 0
                    }}>
                      {!msg.is_mine && (
                        <Typography variant="caption" sx={{ color: '#4facfe', display: 'block', mb: 0.5, fontWeight: 600 }}>
                          {msg.sender_name}
                        </Typography>
                      )}
                      <Typography variant="body2" color="white">{msg.content}</Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', display: 'block', textAlign: 'right', mt: 0.5 }}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                    </Box>
                  </Box>
                ))
              )}
              <div ref={messagesEndRef} />
            </Box>

            <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <Paper sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', bgcolor: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 2 }}>
                <TextField
                  sx={{ ml: 1, flex: 1, '& fieldset': { border: 'none' }, input: { color: 'white' } }}
                  placeholder="Type a message..."
                  value={messageText}
                  onChange={e => setMessageText(e.target.value)}
                  onKeyPress={(e) => { if (e.key === 'Enter') handleSend(); }}
                />
                <IconButton color="primary" sx={{ p: '10px' }} onClick={handleSend}>
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
        )}
      </Card>

      <Dialog open={newChatOpen} onClose={() => setNewChatOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>New Conversation</DialogTitle>
        <DialogContent>
          <ToggleButtonGroup
            value={newChatMode}
            exclusive
            onChange={(e, val) => val && setNewChatMode(val)}
            sx={{ mb: 2, mt: 1 }}
            size="small"
          >
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
              <TextField
                fullWidth label="Group Name" value={groupName}
                onChange={e => setGroupName(e.target.value)}
                sx={{ mb: 2 }} autoFocus
              />
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
