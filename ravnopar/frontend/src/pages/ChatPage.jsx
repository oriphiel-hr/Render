import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  getMessages,
  markPairRead,
  messagesStreamUrl,
  reactToMessage,
  sendMessage,
  sendTypingPulse
} from '../api/index.js';
import PageMeta from '../components/PageMeta.jsx';

const REACTIONS = ['❤️', '😂', '👍', '🔥'];

export default function ChatPage({ token, profile, onRead }) {
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
      setStatus(data?.error || 'Chat nije dostupan.');
    }
  }

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
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
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
        setStatus(data?.error || 'Slanje poruke nije uspjelo.');
      }
    } finally {
      setBusy(false);
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
      <PageMeta title="Razgovor" />
      <p className="auth-footer"><Link to="/app">← Moj prostor</Link></p>
      <section className="card chat-panel">
        <h1 className="section-title">Razgovor</h1>
        {loading && <p className="muted">Učitavanje...</p>}
        {status && <p className="status-banner status-error">{status}</p>}
        <div className="chat-messages">
          {messages.length === 0 && !loading && <p className="muted chat-empty">Pošalji prvu poruku — možeš i icebreaker s profila.</p>}
          {messages.map((msg) => (
            <div key={msg.id} className={`chat-bubble-wrap ${msg.senderId === profile?.id ? 'mine' : 'theirs'}`}>
              <div className={`chat-bubble ${msg.senderId === profile?.id ? 'mine' : 'theirs'}`}>
                <p>{msg.body}</p>
                {msg.reaction && <span className="chat-reaction">{msg.reaction}</span>}
                <div className="chat-meta">
                  <time className="chat-time">{new Date(msg.createdAt).toLocaleString('hr-HR')}</time>
                  {msg.senderId === profile?.id && msg.readByPartner && (
                    <span className="chat-read">Pročitano</span>
                  )}
                </div>
              </div>
              <button
                type="button"
                className="chat-react-btn"
                onClick={() => setReactionFor(reactionFor === msg.id ? null : msg.id)}
                aria-label="Reagiraj"
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
          {partnerTyping && <p className="chat-typing">Piše…</p>}
          <div ref={bottomRef} />
        </div>
        <form className="chat-form" onSubmit={submit}>
          <textarea
            className="input"
            rows={3}
            maxLength={2000}
            placeholder="Napiši poruku..."
            value={body}
            onChange={(e) => {
              setBody(e.target.value);
              notifyTyping();
            }}
          />
          <div className="form-actions row">
            <button type="submit" className="button button-primary" disabled={busy || !body.trim()}>
              {busy ? 'Slanje...' : 'Pošalji'}
            </button>
            <button type="button" className="button button-ghost" onClick={() => navigate('/app')}>
              Natrag
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
