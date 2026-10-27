import { useEffect, useState } from 'react'
import { apiFetch } from './api'
import './App.css'

type ApiStatus = 'loading' | 'available' | 'unavailable'

function App() {
  const [apiStatus, setApiStatus] = useState<ApiStatus>('loading')

  useEffect(() => {
    let active = true

    async function checkApi() {
      try {
        const response = await apiFetch('/health')

        if (!response.ok) {
          throw new Error(`Erreur HTTP : ${response.status}`)
        }

        const data: { status?: string } = await response.json()

        if (data.status !== 'ok') {
          throw new Error('Réponse de santé invalide')
        }

        if (active) {
          setApiStatus('available')
        }
      } catch {
        if (active) {
          setApiStatus('unavailable')
        }
      }
    }

    void checkApi()

    return () => {
      active = false
    }
  }, [])

  const statusContent = {
    loading: {
      title: 'Vérification de l’API en cours',
      description:
        'PrêtMatériel vérifie actuellement la disponibilité du serveur.',
    },
    available: {
      title: 'API disponible',
      description:
        'Le serveur répond correctement. L’interface peut communiquer avec l’API.',
    },
    unavailable: {
      title: 'API indisponible',
      description:
        'Impossible de joindre correctement le serveur. Vérifiez que l’API est démarrée et que VITE_API_BASE_URL est configurée correctement.',
    },
  } satisfies Record<ApiStatus, { title: string; description: string }>

  const status = statusContent[apiStatus]

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

          <div
            className="status-card"
            role="status"
            aria-live="polite"
            aria-busy={apiStatus === 'loading'}
          >
            <span
              className={`status-indicator status-indicator--${apiStatus}`}
              aria-hidden="true"
            />
            <div>
              <h2>{status.title}</h2>
              <p>{status.description}</p>
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
