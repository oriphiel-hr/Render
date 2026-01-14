import React, { useState, useEffect } from 'react';
import { getChatRooms } from '../api/chat';
import ChatRoom from './ChatRoom';

const ChatList = ({ currentUserId, onClose }) => {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadRooms();
    // Refresh rooms every 10 seconds
    const interval = setInterval(loadRooms, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadRooms = async () => {
    try {
      const response = await getChatRooms();
      setRooms(response.data || []);
      setError('');
    } catch (err) {
      console.error('Error loading chat rooms:', err);
      setError('Greška pri učitavanju chat soba');
    } finally {
      setLoading(false);
    }
  };

  const getOtherParticipant = (room) => {
    return room.participants?.find(p => p.id !== currentUserId);
  };

  const getLastMessage = (room) => {
    if (room.messages && room.messages.length > 0) {
      return room.messages[0];
    }
    return null;
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Upravo sada';
    if (minutes < 60) return `Prije ${minutes} min`;
    if (minutes < 1440) return `Prije ${Math.floor(minutes / 60)} h`;
    return date.toLocaleDateString('hr-HR', { day: '2-digit', month: '2-digit' });
  };

  if (selectedRoom) {
    return (
      <ChatRoom
        room={selectedRoom}
        currentUserId={currentUserId}
        onClose={() => {
          setSelectedRoom(null);
          loadRooms(); // Refresh to get updated unread counts
        }}
      />
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">💬 Chat</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          aria-label="Zatvori"
        >
          ✕
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Rooms List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500">Učitavanje...</div>
          </div>
        ) : rooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="text-6xl mb-4">💬</div>
            <p className="text-gray-500 dark:text-gray-400 mb-2">Nemate aktivnih chat soba</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Chat sobe se automatski kreiraju kada prihvatite ponudu ili kada vam se ponuda prihvati.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {rooms.map((room) => {
              const otherParticipant = getOtherParticipant(room);
              const lastMessage = getLastMessage(room);
              const jobTitle = room.job?.title || 'Posao';

              return (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoom(room)}
                  className="w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                      {otherParticipant?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                          {otherParticipant?.fullName || 'Korisnik'}
                        </h3>
                        {lastMessage && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
                            {formatTime(lastMessage.createdAt)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate mb-1">
                        {jobTitle}
                      </p>
                      {lastMessage && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                          {lastMessage.content}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList;

