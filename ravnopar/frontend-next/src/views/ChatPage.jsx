'use client';

import { useEffect, useRef, useState } from 'react';
import Link from '../components/Link.jsx';
import { useNavigate, useParams } from '../lib/next-router-compat.js';
import {
  getMessages,
  markPairRead,
  messagesStreamUrl,
  reactToMessage,
  sendMessage,
  sendTypingPulse
} from '../api/index.js';
import PageMeta from '../components/PageMeta.jsx';
import { useI18n } from '../lib/i18n/index.jsx';

const REACTIONS = ['❤️', '😂', '👍', '🔥'];

export default function ChatPage({ token, profile, onRead }) {
  const { t, labels } = useI18n();
  const { pairId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [body, setBody] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [reactionFor, setReactionFor] = useState(null);
  const bottomRef = useRef(null);
  const messagesRef = useRef(null);
  const sinceRef = useRef(new Date().toISOString());
  const typingTimer = useRef(null);

  async function loadMessages() {
    const data = await getMessages(token, pairId);
    if (data?.success) {
      setMessages(data.items || []);
      if (data.items?.length) {
        sinceRef.current = data.items[data.items.length - 1].createdAt;
      }
    } else {
      setStatus(data?.error || t('chat.unavailable'));
    }
  }

  useEffect(() => {
    document.body.classList.add('chat-open');
    return () => document.body.classList.remove('chat-open');
  }, []);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return undefined;
    function syncKeyboardInset() {
      const inset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      document.documentElement.style.setProperty('--keyboard-inset', `${inset}px`);
    }
    syncKeyboardInset();
    vv.addEventListener('resize', syncKeyboardInset);
    vv.addEventListener('scroll', syncKeyboardInset);
    return () => {
      vv.removeEventListener('resize', syncKeyboardInset);
      vv.removeEventListener('scroll', syncKeyboardInset);
      document.documentElement.style.removeProperty('--keyboard-inset');
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      await loadMessages();
      await markPairRead(token, pairId);
      onRead?.();
      if (mounted) setLoading(false);
    })();

    const streamUrl = messagesStreamUrl(token, pairId, sinceRef.current);
    const source = new EventSource(streamUrl);
    source.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.typing?.length) setPartnerTyping(true);
        if (payload.messages?.length) {
          setPartnerTyping(false);
          setMessages((prev) => {
            const ids = new Set(prev.map((m) => m.id));
            const merged = [...prev];
            payload.messages.forEach((m) => {
              if (!ids.has(m.id)) merged.push(m);
              else {
                const idx = merged.findIndex((x) => x.id === m.id);
                if (idx >= 0) merged[idx] = { ...merged[idx], ...m };
              }
            });
            return merged.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          });
          sinceRef.current = payload.messages[payload.messages.length - 1].createdAt;
          markPairRead(token, pairId).then(() => onRead?.());
        }
      } catch (_error) {
        /* ignore */
      }
    };

    const typingClear = window.setInterval(() => {
      setPartnerTyping((v) => (v ? false : v));
    }, 5000);

    return () => {
      mounted = false;
      source.close();
      window.clearInterval(typingClear);
    };
  }, [token, pairId]);

  useEffect(() => {
    const el = messagesRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
      return;
    }
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, partnerTyping]);

  function notifyTyping() {
    sendTypingPulse(token, pairId);
    if (typingTimer.current) window.clearTimeout(typingTimer.current);
    typingTimer.current = window.setTimeout(() => sendTypingPulse(token, pairId), 2000);
  }

  async function submit(event) {
    event.preventDefault();
    if (!body.trim()) return;
    setBusy(true);
    setStatus('');
    try {
      const data = await sendMessage(token, pairId, body.trim());
      if (data?.success) {
        setBody('');
        await loadMessages();
      } else {
        setStatus(data?.error || t('chat.sendFailed'));
      }
    } finally {
      setBusy(false);
    }
  }

  function onComposerKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (!busy && body.trim()) {
        event.currentTarget.form?.requestSubmit();
      }
    }
  }

  async function pickReaction(messageId, emoji) {
    const data = await reactToMessage(token, pairId, messageId, emoji);
    if (data?.success) {
      setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, reaction: emoji } : m)));
    }
    setReactionFor(null);
  }

  return (
    <main className="page chat-page">
      <PageMeta titleKey="chat" />
      <p className="auth-footer chat-back-link">
        <Link to="/app">{t('chat.backToApp')}</Link>
      </p>
      <section className="card chat-panel">
        <h1 className="section-title">{t('chat.title')}</h1>
        {loading && <p className="muted">{t('chat.loading')}</p>}
        {status && <p className="status-banner status-error">{status}</p>}
        <div className="chat-messages" ref={messagesRef}>
          {messages.length === 0 && !loading && (
            <p className="muted chat-empty">{t('chat.empty')}</p>
          )}
          {messages.map((msg) => (
            <div key={msg.id} className={`chat-bubble-wrap ${msg.senderId === profile?.id ? 'mine' : 'theirs'}`}>
              <div className={`chat-bubble ${msg.senderId === profile?.id ? 'mine' : 'theirs'}`}>
                <p>{msg.body}</p>
                {msg.reaction && <span className="chat-reaction">{msg.reaction}</span>}
                <div className="chat-meta">
                  <time className="chat-time">{labels.formatDateTime(msg.createdAt)}</time>
                  {msg.senderId === profile?.id && msg.readByPartner && (
                    <span className="chat-read">{t('chat.read')}</span>
                  )}
                </div>
              </div>
              <button
                type="button"
                className="chat-react-btn"
                onClick={() => setReactionFor(reactionFor === msg.id ? null : msg.id)}
                aria-label={t('chat.react')}
              >
                +
              </button>
              {reactionFor === msg.id && (
                <div className="chat-reaction-picker">
                  {REACTIONS.map((emoji) => (
                    <button key={emoji} type="button" onClick={() => pickReaction(msg.id, emoji)}>
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          {partnerTyping && <p className="chat-typing">{t('chat.typing')}</p>}
          <div ref={bottomRef} />
        </div>
        <form className="chat-form" onSubmit={submit}>
          <textarea
            className="input chat-composer"
            rows={2}
            maxLength={2000}
            enterKeyHint="send"
            placeholder={t('chat.placeholder')}
            value={body}
            onChange={(e) => {
              setBody(e.target.value);
              notifyTyping();
            }}
            onKeyDown={onComposerKeyDown}
          />
          <div className="form-actions row chat-form-actions">
            <button type="submit" className="button button-primary" disabled={busy || !body.trim()}>
              {busy ? t('chat.sending') : t('chat.send')}
            </button>
            <button type="button" className="button button-ghost" onClick={() => navigate('/app')}>
              {t('chat.back')}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
