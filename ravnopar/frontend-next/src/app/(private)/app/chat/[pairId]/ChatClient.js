'use client';

import { getInboxSummary } from '../../../../../api/index.js';
import { Navigate } from '../../../../../lib/next-router-compat';
import { useAuth } from '../../../../../components/AuthProvider';
import ChatPage from '../../../../../views/ChatPage';

export default function ChatClient() {
  const { token, profile, hydrated, setNotificationUnread } = useAuth();
  if (!hydrated) return null;
  if (!token) return <Navigate to="/auth" replace />;
  return (
    <ChatPage
      token={token}
      profile={profile}
      onRead={() =>
        getInboxSummary(token).then((d) => {
          if (d?.success) {
            /* unread handled in AuthProvider interval; keep callback for pair read */
          }
        })
      }
    />
  );
}
