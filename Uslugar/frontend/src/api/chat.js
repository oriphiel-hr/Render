// Chat API Client
import api from '../api';

// ============================================================
// CHAT ROOMS
// ============================================================

export const getChatRooms = () => {
  return api.get('/chat/rooms');
};

export const createChatRoom = (jobId, participantId) => {
  return api.post('/chat/rooms', { jobId, participantId });
};

export const getChatRoom = (roomId) => {
  return api.get(`/chat/rooms/${roomId}`);
};

// ============================================================
// CHAT MESSAGES
// ============================================================

export const getChatMessages = (roomId) => {
  return api.get(`/chat/rooms/${roomId}/messages`);
};

export const sendChatMessage = (roomId, content, imageUrl = null) => {
  const body = { content };
  if (imageUrl) {
    body.attachments = [imageUrl];
  }
  return api.post(`/chat/rooms/${roomId}/messages`, body);
};

export const markMessagesAsRead = (roomId) => {
  return api.patch(`/chat/rooms/${roomId}/read`);
};

// ============================================================
// INTERNAL CHAT (Direktor ↔ Team)
// ============================================================

export const getInternalChatRooms = () => {
  return api.get('/chat/internal/rooms');
};

export const createInternalChatRoom = (teamMemberId, roomName = null) => {
  return api.post('/chat/internal/rooms', { teamMemberId, roomName });
};

export const checkInternalChatAccess = (roomId) => {
  return api.get(`/chat/internal/rooms/${roomId}/check`);
};

