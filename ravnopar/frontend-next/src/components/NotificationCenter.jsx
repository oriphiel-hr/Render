'use client';

import { useEffect, useState } from 'react';
import Link from './/Link.jsx';
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead
} from '../api/index.js';
import { useI18n } from '../lib/i18n/index.jsx';

export default function NotificationCenter({ token, onChange }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);

  async function load() {
    if (!token) return;
    const data = await getNotifications(token);
    if (data?.success) {
      setItems(data.items || []);
      setUnread(data.unread || 0);
      onChange?.(data.unread || 0);
    }
  }

  useEffect(() => {
    load();
    const timer = window.setInterval(load, 20000);
    return () => window.clearInterval(timer);
  }, [token]);

  async function readOne(id) {
    await markNotificationRead(token, id);
    await load();
  }

  async function readAll() {
    await markAllNotificationsRead(token);
    await load();
  }

  if (!token) return null;

  return (
    <div className="notification-center">
      <button
        type="button"
        className="button button-ghost notification-bell"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        🔔
        {unread > 0 && <span className="notification-badge">{unread}</span>}
      </button>
      {open && (
        <div className="notification-panel card">
          <div className="notification-panel-head">
            <h2 className="section-title">{t('notifications.title')}</h2>
            {unread > 0 && (
              <button type="button" className="button button-ghost button-sm" onClick={readAll}>
                {t('notifications.markAllRead')}
              </button>
            )}
          </div>
          {items.length === 0 ? (
            <p className="muted">{t('notifications.empty')}</p>
          ) : (
            <ul className="notification-list">
              {items.map((item) => (
                <li key={item.id} className={item.readAt ? 'read' : 'unread'}>
                  <strong>{item.title}</strong>
                  <p className="muted">{item.body}</p>
                  {item.linkPath && (
                    <Link
                      to={item.linkPath}
                      className="notification-link"
                      onClick={() => {
                        readOne(item.id);
                        setOpen(false);
                      }}
                    >
                      {t('notifications.open')}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
