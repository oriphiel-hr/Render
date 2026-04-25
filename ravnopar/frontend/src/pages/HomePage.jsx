export default function HomePage() {
  return (
    <main className="page">
      <section className="hero">
        <h1 style={{ marginBottom: 6 }}>Ravnopar</h1>
        <p className="subtitle">
          Fer dating platforma: bez skrivanja dosega, bez manipulacija, s jasnim pravilima i stvarnim prilikama.
        </p>
        <div className="row">
          <span className="chip">No reach throttling</span>
          <span className="chip">Consent-first</span>
          <span className="chip">Anti-spam limiter</span>
        </div>
      </section>

      <section className="grid-2">
        <article className="card">
          <h3 className="section-title">Kako platforma ostaje poštena</h3>
          <ul className="compact-list">
            <li>Bez umjetnog ogranicavanja dosega.</li>
            <li>Engaged parovi su privremeno van glavnog feeda.</li>
            <li>Korisnici bez kontakta dobivaju fairness boost kroz rangiranje.</li>
            <li>Dostupnost ide AVAILABLE -&gt; FOCUSED_CONTACT -&gt; AVAILABLE.</li>
          </ul>
        </article>
        <article className="card">
          <h3 className="section-title">Zaštita korisnika</h3>
          <ul className="compact-list">
            <li>Obavezna punoljetnost (18+).</li>
            <li>Report/block mehanizam i anti-spam limiter.</li>
            <li>Soft upozorenja kod preuskih preferencija.</li>
            <li>Javni community guidelines i admin fairness audit.</li>
          </ul>
        </article>
      </section>
    </main>
  );
}
