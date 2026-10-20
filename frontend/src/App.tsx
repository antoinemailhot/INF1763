import './App.css'

function App() {
  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="/" aria-label="PrêtMatériel — Accueil">
          <span className="brand-mark" aria-hidden="true">
            PM
          </span>
          <span className="brand-name">PrêtMatériel</span>
        </a>

        <span className="header-label">Gestion du matériel</span>
      </header>

      <main>
        <section className="hero">
          <p className="eyebrow">UNE GESTION PLUS SIMPLE</p>

          <h1>
            Le matériel dont vous avez besoin,
            <span> au bon moment.</span>
          </h1>

          <p className="hero-description">
            PrêtMatériel est une application conçue pour faciliter la gestion
            du matériel et le suivi des prêts au sein de votre organisation.
          </p>

          <div className="status-card">
            <span className="status-indicator" aria-hidden="true" />
            <div>
              <h2>Application en préparation</h2>
              <p>
                L’interface initiale est en place. Les prochaines étapes
                permettront d’intégrer progressivement les fonctionnalités.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <span>PrêtMatériel</span>
        <span>Une base simple pour mieux gérer les prêts.</span>
      </footer>
    </div>
  )
}

export default App
