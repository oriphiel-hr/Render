import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getMessages, sendMessage } from '../api/index.js';
import PageMeta from '../components/PageMeta.jsx';

export default function ChatPage({ token, profile }) {
  const { pairId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [body, setBody] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef(null);

  async function loadMessages() {
    setLoading(true);
    try {
      const data = await getMessages(token, pairId);
      if (data?.success) {
        setMessages(data.items || []);
      } else {
        setStatus(data?.error || 'Chat nije dostupan.');
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMessages();
    const timer = window.setInterval(loadMessages, 8000);
    return () => window.clearInterval(timer);
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
      <PageMeta title="Razgovor" description="Privatni chat nakon prihvaćenog kontakta." />
      <p className="auth-footer">
        <Link to="/app">← Moj prostor</Link>
      </p>
      <section className="card chat-panel">
        <h1 className="section-title">Razgovor</h1>
        {loading && <p className="muted">Učitavanje poruka...</p>}
        {status && <p className="status-banner status-error">{status}</p>}
        <div className="chat-messages" aria-live="polite">
          {messages.length === 0 && !loading && (
            <p className="muted chat-empty">Pošalji prvu poruku — predstavi se i budi iskren/a.</p>
          )}
          {messages.map((msg) => {
            const mine = msg.senderId === profile?.id;
            return (
              <div key={msg.id} className={`chat-bubble ${mine ? 'mine' : 'theirs'}`}>
                <p>{msg.body}</p>
                <time className="chat-time">
                  {new Date(msg.createdAt).toLocaleString('hr-HR', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </time>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
        <form className="chat-form" onSubmit={submit}>
          <textarea
            className="input"
            rows={3}
            maxLength={2000}
            placeholder="Napiši poruku..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
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
