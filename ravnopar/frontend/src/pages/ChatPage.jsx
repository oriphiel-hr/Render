import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getMessages, markPairRead, messagesStreamUrl, sendMessage } from '../api/index.js';
import PageMeta from '../components/PageMeta.jsx';

export default function ChatPage({ token, profile, onRead }) {
  const { pairId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [body, setBody] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef(null);
  const sinceRef = useRef(new Date().toISOString());

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
        if (payload.messages?.length) {
          setMessages((prev) => {
            const ids = new Set(prev.map((m) => m.id));
            const merged = [...prev];
            payload.messages.forEach((m) => {
              if (!ids.has(m.id)) merged.push(m);
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

    return () => {
      mounted = false;
      source.close();
    };
  }, [token, pairId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

  return (
    <main className="page chat-page">
      <PageMeta title="Razgovor" />
      <p className="auth-footer"><Link to="/app">← Moj prostor</Link></p>
      <section className="card chat-panel">
        <h1 className="section-title">Razgovor</h1>
        {loading && <p className="muted">Učitavanje...</p>}
        {status && <p className="status-banner status-error">{status}</p>}
        <div className="chat-messages">
          {messages.length === 0 && !loading && <p className="muted chat-empty">Pošalji prvu poruku.</p>}
          {messages.map((msg) => (
            <div key={msg.id} className={`chat-bubble ${msg.senderId === profile?.id ? 'mine' : 'theirs'}`}>
              <p>{msg.body}</p>
              <time className="chat-time">{new Date(msg.createdAt).toLocaleString('hr-HR')}</time>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
        <form className="chat-form" onSubmit={submit}>
          <textarea className="input" rows={3} maxLength={2000} placeholder="Napiši poruku..." value={body} onChange={(e) => setBody(e.target.value)} />
          <div className="form-actions row">
            <button type="submit" className="button button-primary" disabled={busy || !body.trim()}>{busy ? 'Slanje...' : 'Pošalji'}</button>
            <button type="button" className="button button-ghost" onClick={() => navigate('/app')}>Natrag</button>
          </div>
        </form>
      </section>
    </main>
  );
}
