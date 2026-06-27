const PEOPLE = [
  { name: 'Ana', city: 'Zagreb', color: '#fbcfe8' },
  { name: 'Marko', city: 'Split', color: '#ddd6fe' },
  { name: 'Iva', city: 'Rijeka', color: '#fde68a' }
];

export default function LandingShowcase() {
  return (
    <section className="landing-showcase" aria-label="Pregled aplikacije">
      <div className="landing-showcase-copy">
        <p className="eyebrow">Pregled iskustva</p>
        <h2 className="landing-heading">Upoznaj ljude kao u dating appu — bez paywalla</h2>
        <p className="muted">
          Swipe kartice, galerija fotografija i chat nakon matcha. Fer pravila ostaju ista.
        </p>
      </div>
      <div className="phone-mockup-wrap">
        <div className="phone-mockup parallax-float">
          <div className="phone-notch" aria-hidden="true" />
          <div className="phone-screen">
            <div className="mock-card">
              <div className="mock-photo" />
              <p className="mock-name">Maja, 28 · Zagreb</p>
              <p className="mock-bio">Volim kavu, planinarenje i fer razgovor.</p>
              <div className="mock-actions">
                <span className="mock-btn mock-pass">✕</span>
                <span className="mock-btn mock-like">♥</span>
              </div>
            </div>
          </div>
        </div>
        <div className="showcase-avatars">
          {PEOPLE.map((person, index) => (
            <div
              key={person.name}
              className="showcase-avatar parallax-float-delayed"
              style={{ '--delay': index, background: person.color }}
            >
              <span>{person.name[0]}</span>
              <small>{person.city}</small>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
