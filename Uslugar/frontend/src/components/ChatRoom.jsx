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
  const jobOwnerId = room.job?.userId || room.job?.ownerId;

  const getSenderLabel = (senderId) => {
    if (senderId === jobOwnerId) return 'Korisnik';
    return 'Pružatelj';
  };

  const formatMessageTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('hr-HR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDateSeparator = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) return 'Danas';
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return 'Jučer';
    return date.toLocaleDateString('hr-HR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  // Group messages by date for separators (chronological order)
  const messagesWithDates = (() => {
    const result = [];
    let lastDate = null;
    const arr = Array.isArray(messages) ? messages : [];
    const sorted = arr.slice().sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    sorted.forEach((msg) => {
      const msgDate = new Date(msg.createdAt).toDateString();
      if (msgDate !== lastDate) {
        lastDate = msgDate;
        result.push({ type: 'date', date: msg.createdAt });
      }
      result.push({ type: 'message', ...msg });
    });
    return result;
  })();

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
      // Backend vraća { messages: [...] }, ne niz
      const list = Array.isArray(response.data)
        ? response.data
        : (response.data?.messages ?? []);
      setMessages(Array.isArray(list) ? list : []);
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

  const handleQuickInsert = (template) => {
    setNewMessage((prev) => (prev ? `${prev}\n${template}` : template));
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Učitavanje poruka...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
      {/* Plavi header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-blue-600 text-white">
        <button
          onClick={onClose}
          className="p-2 -ml-2 rounded-full hover:bg-blue-500 transition-colors"
          aria-label="Natrag na razgovore"
        >
          ←
        </button>
        <h3 className="font-semibold text-lg truncate flex-1">
          {jobTitle}
        </h3>
      </div>

      {/* Poruke */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3"
      >
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8 text-sm">
            Nema poruka. Pošaljite prvu poruku!
          </div>
        ) : (
          messagesWithDates.map((item, index) => {
            if (item.type === 'date') {
              return (
                <div key={`date-${item.date}-${index}`} className="flex items-center gap-3 py-2">
                  <div className="flex-1 border-t border-gray-200 dark:border-gray-600" />
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {formatDateSeparator(item.date)}
                  </span>
                  <div className="flex-1 border-t border-gray-200 dark:border-gray-600" />
                </div>
              );
            }
            const message = item;
            const isKorisnik = message.senderId === jobOwnerId;

            return (
              <div
                key={message.id}
                className={`flex ${isKorisnik ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex flex-col max-w-[85%] sm:max-w-md ${isKorisnik ? 'items-end' : 'items-start'}`}>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    {getSenderLabel(message.senderId)}
                  </span>
                  <div
                    className={`px-4 py-2.5 rounded-2xl ${
                      isKorisnik
                        ? 'bg-green-100 dark:bg-green-900/40 text-gray-900 dark:text-gray-100 rounded-br-md'
                        : 'bg-blue-100 dark:bg-blue-900/40 text-gray-900 dark:text-gray-100 rounded-bl-md'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                    {message.imageUrl && (
                      <img
                        src={message.imageUrl}
                        alt="Prilog"
                        className="mt-2 rounded-lg max-w-full"
                      />
                    )}
                    <p className="text-xs mt-1 opacity-80">
                      {formatMessageTime(message.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Greška */}
      {error && (
        <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Unos */}
      <form onSubmit={handleSend} className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex flex-wrap items-center gap-2 mb-2 text-xs text-gray-600 dark:text-gray-400">
          <span className="font-medium mr-1">Brze poruke:</span>
          <button
            type="button"
            onClick={() => handleQuickInsert('Mogu doći danas između 17–19 h, odgovara li vam?')}
            className="px-3 py-1 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            📅 Dogovori termin
          </button>
          <button
            type="button"
            onClick={() => handleQuickInsert('Možete li mi poslati lokaciju ili adresu?')}
            className="px-3 py-1 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            📍 Zatraži lokaciju
          </button>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Upiši poruku..."
            className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="px-5 py-2.5 bg-gray-600 hover:bg-gray-700 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
          >
            {sending ? '...' : 'Pošalji'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatRoom;

