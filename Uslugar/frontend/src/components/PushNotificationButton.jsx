import { useState } from 'react';
import { usePushNotifications } from '../hooks/usePushNotifications';

export default function PushNotificationButton() {
  const {
    isSupported,
    isSubscribed,
    loading,
    error,
    subscribe,
    unsubscribe
  } = usePushNotifications();

  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState('');

  const handleToggle = async () => {
    if (isSubscribed) {
      const success = await unsubscribe();
      if (success) {
        setMessage('Push notifikacije su isključene');
        setShowMessage(true);
        setTimeout(() => setShowMessage(false), 3000);
      }
    } else {
      const success = await subscribe();
      if (success) {
        setMessage('Push notifikacije su uključene');
        setShowMessage(true);
        setTimeout(() => setShowMessage(false), 3000);
      }
    }
  };

  if (!isSupported) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400">
        Push notifikacije nisu podržane u vašem pregledniku
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleToggle}
        disabled={loading}
        className={`
          px-4 py-2 rounded-lg font-medium transition-colors
          ${isSubscribed
            ? 'bg-red-500 hover:bg-red-600 text-white'
            : 'bg-blue-500 hover:bg-blue-600 text-white'
          }
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        {loading ? (
          'Učitavanje...'
        ) : isSubscribed ? (
          '🔔 Isključi push notifikacije'
        ) : (
          '🔔 Uključi push notifikacije'
        )}
      </button>

      {error && (
        <div className="text-sm text-red-500 dark:text-red-400">
          {error}
        </div>
      )}

      {showMessage && (
        <div className="text-sm text-green-500 dark:text-green-400 animate-fade-in">
          {message}
        </div>
      )}

      {isSubscribed && (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Primat ćete push notifikacije na ovom uređaju
        </div>
      )}
    </div>
  );
}

