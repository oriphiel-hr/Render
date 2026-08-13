'use client';

import { useEffect, useState } from 'react';
import { subscribePush, unsubscribePush } from '../api/index.js';
import { useAuth } from './AuthProvider.jsx';
import { useI18n } from '../lib/i18n/index.jsx';
import { VAPID_PUBLIC_KEY } from '../lib/env.js';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) output[i] = raw.charCodeAt(i);
  return output;
}

export default function PushOptIn() {
  const { t } = useI18n();
  const { token } = useAuth();
  const [supported, setSupported] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const ok =
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      Boolean(VAPID_PUBLIC_KEY);
    setSupported(ok);
    if (!ok || !token) return undefined;
    let cancelled = false;
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => {
        if (!cancelled) setEnabled(Boolean(sub));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (!token || !supported) return null;

  async function enable() {
    setBusy(true);
    setStatus('');
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setStatus(t('pwa.pushDenied'));
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const sub =
        (await reg.pushManager.getSubscription()) ||
        (await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
        }));
      const json = sub.toJSON();
      const data = await subscribePush(token, {
        endpoint: json.endpoint,
        keys: { p256dh: json.keys.p256dh, auth: json.keys.auth }
      });
      if (!data?.success) {
        setStatus(data?.error || t('pwa.pushFailed'));
        return;
      }
      setEnabled(true);
      setStatus(t('pwa.pushEnabled'));
    } catch (_error) {
      setStatus(t('pwa.pushFailed'));
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    setBusy(true);
    setStatus('');
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await unsubscribePush(token, sub.endpoint);
        await sub.unsubscribe();
      }
      setEnabled(false);
      setStatus(t('pwa.pushDisabled'));
    } catch (_error) {
      setStatus(t('pwa.pushFailed'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="push-opt-in">
      <p className="muted">{t('pwa.pushHint')}</p>
      <button
        type="button"
        className={`button ${enabled ? 'button-secondary' : 'button-primary'} button-sm`}
        disabled={busy}
        onClick={enabled ? disable : enable}
      >
        {enabled ? t('pwa.pushDisable') : t('pwa.pushEnable')}
      </button>
      {status && <p className="muted push-opt-status">{status}</p>}
    </div>
  );
}
