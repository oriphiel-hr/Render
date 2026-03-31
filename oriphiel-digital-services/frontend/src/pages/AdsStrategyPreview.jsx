import { jsPDF } from 'jspdf';

export const INDUSTRIES = [
  'Građevina i adaptacije',
  'Autoservis i auto usluge',
  'Ljepota i wellness',
  'Zdravstvo i stomatologija',
  'Nekretnine',
  'E-commerce'
];

export const GOALS = [
  { id: 'LEADS', label: 'Više upita (leadovi)' },
  { id: 'CALLS', label: 'Više poziva' },
  { id: 'SALES', label: 'Online prodaja' },
  { id: 'AWARENESS', label: 'Vidljivost brenda' }
];

export const PAYMENT_MODELS = [
  { id: 'PERFORMANCE', label: 'Performance (fokus na rezultat)' },
  { id: 'BALANCED', label: 'Balansirani model' },
  { id: 'TEST', label: 'Testni model (A/B i učenje)' }
];

export function buildStrategy(industry, goal, paymentModel) {
  const base = {
    channels: ['Search kampanje', 'Remarketing', 'Brand zaštita'],
    setup: ['Tracking plan', 'Struktura kampanja po uslugama', 'Mjerne konverzije i dashboard'],
    expectations: ['Prvi signal kvalitete prometa: 2-4 tjedna', 'Stabilnija optimizacija: 6-8 tjedana']
  };

  if (goal === 'CALLS') {
    base.channels = ['Call-only/Search kampanje', 'Lokacijske ekstenzije', 'Remarketing na posjetitelje'];
  }
  if (goal === 'SALES') {
    base.channels = ['Search + Performance Max', 'Dynamic remarketing', 'Brand + competitor segmentacija'];
  }
  if (goal === 'AWARENESS') {
    base.channels = ['YouTube/Display awareness', 'Search za demand capture', 'Remarketing frekvencijski cap'];
  }

  if (industry === 'E-commerce') {
    base.setup.push('Feed audit i segmentacija proizvoda');
  }
  if (industry === 'Nekretnine') {
    base.setup.push('Segmentacija po mikrolokacijama i tipu upita');
  }
  if (industry === 'Građevina i adaptacije') {
    base.setup.push('Kampanje po hitnim vs. planskim uslugama');
  }

  if (paymentModel === 'PERFORMANCE') {
    base.expectations.push('Agresivniji budžet na ad grupe s najboljim CPA/CPL signalom');
  } else if (paymentModel === 'BALANCED') {
    base.expectations.push('Stabilna distribucija budžeta između akvizicije i retargetinga');
  } else {
    base.expectations.push('30 dana testnog perioda: više varijanti oglasa i landing poruka');
  }

  return base;
}

export default function AdsStrategyPreview({
  industry,
  goal,
  paymentModel,
  strategy,
  onChangeIndustry,
  onChangeGoal,
  onChangePaymentModel
}) {
  function downloadRecommendationPdf() {
    const doc = new jsPDF();
    let y = 16;

    doc.setFontSize(16);
    doc.text('Oriphiel - Google Ads preporuka', 14, y);
    y += 10;

    doc.setFontSize(11);
    doc.text(`Djelatnost: ${industry}`, 14, y);
    y += 6;
    doc.text(`Primarni cilj: ${GOALS.find((g) => g.id === goal)?.label || goal}`, 14, y);
    y += 6;
    doc.text(
      `Model suradnje: ${PAYMENT_MODELS.find((m) => m.id === paymentModel)?.label || paymentModel}`,
      14,
      y
    );
    y += 10;

    const writeList = (title, rows) => {
      doc.setFont(undefined, 'bold');
      doc.text(title, 14, y);
      y += 6;
      doc.setFont(undefined, 'normal');
      rows.forEach((row) => {
        const wrapped = doc.splitTextToSize(`- ${row}`, 180);
        doc.text(wrapped, 16, y);
        y += wrapped.length * 5;
      });
      y += 3;
    };

    writeList('Predlozeni kanali', strategy.channels);
    writeList('Sto dobivas u setupu', strategy.setup);
    writeList('Sto mozes ocekivati', strategy.expectations);

    doc.save('oriphiel-google-ads-preporuka.pdf');
  }

  return (
    <section style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, marginBottom: 24 }}>
      <h2 style={{ marginTop: 0 }}>Testni model: strategija Google oglasa</h2>
      <p style={{ marginTop: 0 }}>
        Klijent bira djelatnost i cilj, a model daje okvir što dobiva i što može očekivati.
      </p>

      <div style={{ display: 'grid', gap: 10, marginBottom: 14 }}>
        <label>
          Djelatnost
          <select value={industry} onChange={(e) => onChangeIndustry(e.target.value)} style={{ width: '100%' }}>
            {INDUSTRIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label>
          Primarni cilj
          <select value={goal} onChange={(e) => onChangeGoal(e.target.value)} style={{ width: '100%' }}>
            {GOALS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Model suradnje
          <select
            value={paymentModel}
            onChange={(e) => onChangePaymentModel(e.target.value)}
            style={{ width: '100%' }}
          >
            {PAYMENT_MODELS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div style={{ display: 'grid', gap: 12 }}>
        <div>
          <strong>Predloženi kanali</strong>
          <ul>
            {strategy.channels.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <strong>Što dobivaš u setupu</strong>
          <ul>
            {strategy.setup.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <strong>Što možeš očekivati</strong>
          <ul>
            {strategy.expectations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
      <button type="button" onClick={downloadRecommendationPdf} style={{ marginTop: 10 }}>
        Preuzmi preporuku (PDF)
      </button>
    </section>
  );
}
