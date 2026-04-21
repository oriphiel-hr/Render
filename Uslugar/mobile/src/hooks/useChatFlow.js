import { useEffect, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import {
  getChatMessages,
  getChatRooms,
  markAllMessagesRead,
  sendChatMessage,
  uploadChatImage
} from '@uslugar/shared';

export function useChatFlow({
  apiBaseUrl,
  token,
  setLoading,
  setMessage,
  handleApiError
}) {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [threadLocked, setThreadLocked] = useState(false);
  const [lockReason, setLockReason] = useState(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!token) return;
    loadRooms();
  }, [token]);

  useEffect(() => {
    if (!token || selectedRoom?.id) return;
    const interval = setInterval(() => {
      loadRooms();
    }, 10000);
    return () => clearInterval(interval);
  }, [token, selectedRoom?.id]);

  useEffect(() => {
    if (!token || !selectedRoom?.id) return;
    const interval = setInterval(() => {
      loadMessages(selectedRoom.id);
    }, 5000);
    return () => clearInterval(interval);
  }, [token, selectedRoom?.id]);

  const resetRoom = () => {
    setSelectedRoom(null);
    setMessages([]);
    setChatInput('');
    setThreadLocked(false);
    setLockReason(null);
  };

  const loadRooms = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await getChatRooms({ apiBaseUrl, token });
      const list = Array.isArray(data) ? data : data?.rooms || [];
      setRooms(Array.isArray(list) ? list : []);
    } catch (error) {
      await handleApiError(error, 'Ne mogu ucitati chat sobe.');
    } finally {
      setLoading(false);
    }
  };

  const openRoom = async (room) => {
    setSelectedRoom(room);
    setMessages([]);
    setChatInput('');
    await loadMessages(room.id);
  };

  const loadMessages = async (roomId) => {
    if (!roomId) return;
    setLoading(true);
    try {
      const data = await getChatMessages({
        apiBaseUrl,
        token,
        roomId
      });
      const list = Array.isArray(data) ? data : data?.messages || [];
      setMessages(Array.isArray(list) ? list : []);
      setThreadLocked(Boolean(data?.threadLocked));
      setLockReason(data?.lockReason || null);
      await markAllMessagesRead({ apiBaseUrl, token, roomId });
    } catch (error) {
      await handleApiError(error, 'Ne mogu ucitati poruke.');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!selectedRoom?.id || threadLocked) return;
    const content = chatInput.trim();
    if (!content) {
      setMessage('Poruka ne moze biti prazna.');
      return;
    }
    setSending(true);
    setMessage('');
    try {
      await sendChatMessage({
        apiBaseUrl,
        token,
        roomId: selectedRoom.id,
        content
      });
      setChatInput('');
      await loadMessages(selectedRoom.id);
    } catch (error) {
      await handleApiError(error, 'Ne mogu poslati poruku.');
    } finally {
      setSending(false);
    }
  };

  const sendImageAttachment = async ({ uri, name, type }) => {
    if (!selectedRoom?.id || threadLocked) return;
    setSending(true);
    setMessage('');
    try {
      const upload = await uploadChatImage({
        apiBaseUrl,
        token,
        roomId: selectedRoom.id,
        uri,
        name,
        type
      });
      const imageUrl = upload?.imageUrl;
      if (!imageUrl) {
        throw new Error('Upload slike nije uspio.');
      }
      await sendChatMessage({
        apiBaseUrl,
        token,
        roomId: selectedRoom.id,
        content: '',
        attachments: [{ imageUrl }]
      });
      await loadMessages(selectedRoom.id);
    } catch (error) {
      await handleApiError(error, 'Ne mogu poslati sliku.');
    } finally {
      setSending(false);
    }
  };

  const pickAndSendImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setMessage('Potreban je pristup galeriji za slanje slike.');
      return;
    }
    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8
    });
    if (picked.canceled || !picked.assets?.length) return;
    const asset = picked.assets[0];
    const fileName = asset.fileName || `chat-${Date.now()}.jpg`;
    await sendImageAttachment({
      uri: asset.uri,
      name: fileName,
      type: asset.mimeType || 'image/jpeg'
    });
  };

  return {
    rooms,
    selectedRoom,
    messages,
    chatInput,
    setChatInput,
    threadLocked,
    lockReason,
    sending,
    resetRoom,
    loadRooms,
    openRoom,
    loadMessages,
    sendMessage,
    sendImageAttachment,
    pickAndSendImage
  };
}
