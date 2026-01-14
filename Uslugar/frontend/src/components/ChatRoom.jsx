import React, { useState, useEffect, useRef } from 'react';
import { getChatMessages, sendChatMessage, markMessagesAsRead } from '../api/chat';
import api from '../api';

const ChatRoom = ({ room, currentUserId, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const otherParticipant = room.participants?.find(p => p.id !== currentUserId);
  const jobTitle = room.job?.title || 'Posao';

  useEffect(() => {
    loadMessages();
    // Poll for new messages every 3 seconds
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [room.id]);

  useEffect(() => {
    scrollToBottom();
    // Mark messages as read when viewing
    if (messages.length > 0) {
      markMessagesAsRead(room.id).catch(console.error);
    }
  }, [messages, room.id]);

  const loadMessages = async () => {
    try {
      const response = await getChatMessages(room.id);
      setMessages(response.data || []);
      setError('');
    } catch (err) {
      console.error('Error loading messages:', err);
      if (err.response?.status !== 404) {
        setError('Greška pri učitavanju poruka');
      }
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    setSending(true);
    setError('');

    try {
      await sendChatMessage(room.id, messageContent);
      // Reload messages to get the new one
      await loadMessages();
    } catch (err) {
      setError(err.response?.data?.error || 'Greška pri slanju poruke');
      setNewMessage(messageContent); // Restore message on error
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Upravo sada';
    if (minutes < 60) return `Prije ${minutes} min`;
    if (minutes < 1440) return `Prije ${Math.floor(minutes / 60)} h`;
    return date.toLocaleDateString('hr-HR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Učitavanje poruka...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            aria-label="Zatvori chat"
          >
            ←
          </button>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {otherParticipant?.fullName || 'Korisnik'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{jobTitle}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            Nema poruka. Pošaljite prvu poruku!
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.senderId === currentUserId;
            return (
              <div
                key={message.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    isOwn
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  {message.imageUrl && (
                    <img
                      src={message.imageUrl}
                      alt="Prilog"
                      className="mt-2 rounded max-w-full"
                    />
                  )}
                  <p
                    className={`text-xs mt-1 ${
                      isOwn ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {formatTime(message.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error message */}
      {error && (
        <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Napišite poruku..."
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? '...' : 'Pošalji'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatRoom;

