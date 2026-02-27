import React, { useState, useEffect } from 'react';
import { getChatRooms } from '../api/chat';
import ChatRoom from './ChatRoom';

const ChatList = ({ currentUserId, onClose }) => {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadRooms();
    // Refresh rooms every 10 seconds
    const interval = setInterval(loadRooms, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadRooms = async () => {
    try {
      const response = await getChatRooms();
      // Backend može vratiti niz ili objekt s poljem rooms
      const list = Array.isArray(response.data)
        ? response.data
        : (response.data?.rooms ?? []);
      setRooms(Array.isArray(list) ? list : []);
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
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) return date.toLocaleTimeString('hr-HR', { hour: '2-digit', minute: '2-digit' });
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Upravo sada';
    if (minutes < 60) return `Prije ${minutes} min`;
    if (minutes < 1440) return `Prije ${Math.floor(minutes / 60)} h`;
    return date.toLocaleDateString('hr-HR', { day: '2-digit', month: '2-digit' });
  };

  const isSelectedRoom = (room) => selectedRoom?.id === room.id;

  if (selectedRoom) {
    return (
      <ChatRoom
        room={selectedRoom}
        currentUserId={currentUserId}
        onClose={() => {
          setSelectedRoom(null);
          loadRooms();
        }}
      />
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Nove poruke</h2>
        <button
          onClick={onClose}
          className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-200 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label="Zatvori"
        >
          ✕
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Search */}
      <div className="px-4 pt-3 pb-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Pretraži po imenu ili naslovu posla..."
          className="w-full text-sm px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Rooms List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-gray-500 dark:text-gray-400 text-sm">Učitavanje...</div>
          </div>
        ) : rooms.length === 0 ? (
          (() => {
            const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
            const isProvider = storedUser?.role === 'PROVIDER' || !!storedUser?.legalStatusId;
            const hint = isProvider
              ? 'Chat sobe se automatski kreiraju kada naručitelj prihvati vašu ponudu za posao.'
              : 'Chat sobe se automatski kreiraju kada prihvatite ponudu pružatelja za vaš posao (Moji poslovi → odabir ponude).';
            return (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <div className="text-5xl mb-4 opacity-60">💬</div>
                <p className="text-gray-600 dark:text-gray-400 mb-2 font-medium">Nemate aktivnih razgovora</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 max-w-xs">
                  {hint}
                </p>
              </div>
            );
          })()
        ) : (
          (() => {
            const term = search.trim().toLowerCase();
            const filteredRooms = term
              ? rooms.filter((room) => {
                  const other = getOtherParticipant(room);
                  const name = (other?.fullName || '').toLowerCase();
                  const jobTitle = (room.job?.title || '').toLowerCase();
                  return name.includes(term) || jobTitle.includes(term);
                })
              : rooms;

            if (filteredRooms.length === 0) {
              return (
                <div className="px-4 py-6 text-sm text-gray-500 dark:text-gray-400">
                  Nema razgovora koji odgovaraju pretrazi.
                </div>
              );
            }

            return (
              <div className="divide-y divide-gray-100 dark:divide-gray-700/80">
                {filteredRooms.map((room) => {
                  const otherParticipant = getOtherParticipant(room);
                  const lastMessage = getLastMessage(room);
                  const jobTitle = room.job?.title || 'Posao';
                  const selected = isSelectedRoom(room);

                  return (
                    <button
                      key={room.id}
                      onClick={() => setSelectedRoom(room)}
                      className={`w-full px-4 py-3 text-left transition-colors flex items-start gap-3 border-l-4 ${
                        selected
                          ? 'border-l-blue-600 bg-blue-50/70 dark:bg-blue-900/20 dark:border-l-blue-500'
                          : 'border-l-transparent hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      <div className="w-11 h-11 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                        {otherParticipant?.fullName?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <span className="font-semibold text-gray-900 dark:text-white truncate">
                            {otherParticipant?.fullName || 'Korisnik'}
                          </span>
                          {lastMessage && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                              {formatTime(lastMessage.createdAt)}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mb-0.5">
                          {jobTitle}
                        </p>
                        {lastMessage && (
                          <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                            {lastMessage.content}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            );
          })()
        )}
      </div>
    </div>
  );
};

export default ChatList;

