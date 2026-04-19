const supportPillars = [
  {
    title: 'Daily Routine Support',
    text: 'Create visual structure around school prep, calm transitions, and bedtime so daily life is more predictable.',
  },
  {
    title: 'Learning Through Play',
    text: 'Use reward loops and guided mini-games to support focus, confidence, and emotional vocabulary.',
  },
  {
    title: 'Emotional Regulation',
    text: 'Give families simple tools for identifying feelings, building calming habits, and reducing overload.',
  },
];

const quickActions = [
  'Start a calming activity',
  'Open the parent support hub',
  'Launch a rewards-based learning game',
];

export default function App() {
  return (
    <div className="page-shell">
      <header className="hero">
        <div className="hero-copy">
          <p className="eyebrow">AR AutisReality</p>
          <h1>Supportive routines, interactive learning, and emotional regulation in one app.</h1>
          <p className="hero-text">
            This starter app gives the project a real buildable foundation: a clear mission,
            responsive interface, and room for parent resources, games, and regulation tools.
          </p>
          <div className="hero-actions">
            <button type="button">Explore Parent Tools</button>
            <button type="button" className="secondary">Preview Learning Games</button>
          </div>
        </div>
        <section className="status-card" aria-label="Project snapshot">
          <h2>Usable baseline</h2>
          <ul>
            <li>Responsive landing experience</li>
            <li>Local dev server with Vite</li>
            <li>Production build script</li>
            <li>GitHub Actions build validation</li>
          </ul>
        </section>
      </header>

      <main>
        <section className="section-grid" aria-labelledby="pillars-title">
          <div className="section-heading">
            <p className="eyebrow">Core pillars</p>
            <h2 id="pillars-title">A structure ready for real product features</h2>
          </div>
          <div className="card-grid">
            {supportPillars.map((pillar) => (
              <article key={pillar.title} className="feature-card">
                <h3>{pillar.title}</h3>
                <p>{pillar.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="split-panel" aria-labelledby="launch-title">
          <div>
            <p className="eyebrow">First launch</p>
            <h2 id="launch-title">What you can run now</h2>
            <p>
              Use this as the starting surface for the real app. The current experience is intentionally
              small but fully buildable, so future work can add auth, dashboards, games, and family-specific flows.
            </p>
          </div>
          <ol className="steps-list">
            {quickActions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </section>
      </main>
    </div>
  );
}