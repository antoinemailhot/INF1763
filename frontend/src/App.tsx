import { useEffect, useState } from 'react'
import { apiFetch } from './api'
import './App.css'

type ApiStatus = 'loading' | 'available' | 'unavailable'
type TasksStatus = 'loading' | 'loaded' | 'empty' | 'error'

interface Task {
  id: number
  title: string
  description: string
  createdAt: string
}

// Vérifie la structure des tâches reçues de l'API.
function isTask(value: unknown): value is Task {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const task = value as Record<string, unknown>

  return (
    typeof task.id === 'number' &&
    Number.isInteger(task.id) &&
    task.id > 0 &&
    typeof task.title === 'string' &&
    typeof task.description === 'string' &&
    typeof task.createdAt === 'string'
  )
}

// Formate la date de création pour l'affichage en français.
function formatTaskDate(value: string): string {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Date inconnue'
  }

  return new Intl.DateTimeFormat('fr-CA', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function App() {
  const [apiStatus, setApiStatus] = useState<ApiStatus>('loading')
  const [tasksStatus, setTasksStatus] = useState<TasksStatus>('loading')
  const [tasks, setTasks] = useState<Task[]>([])

  useEffect(() => {
    let active = true

    // Vérifie la disponibilité de l'API.
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

    // Récupère toutes les tâches au chargement initial.
    async function loadTasks() {
      try {
        const response = await apiFetch('/tasks')

        if (!response.ok) {
          throw new Error(`Erreur HTTP : ${response.status}`)
        }

        const data: unknown = await response.json()

        if (!Array.isArray(data) || !data.every(isTask)) {
          throw new Error('La réponse de l’API contient des tâches invalides.')
        }

        if (active) {
          setTasks(data)
          setTasksStatus(data.length === 0 ? 'empty' : 'loaded')
        }
      } catch {
        if (active) {
          setTasksStatus('error')
        }
      }
    }

    // Lance les deux requêtes indépendamment.
    void checkApi()
    void loadTasks()

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

          <section className="tasks-section" aria-labelledby="tasks-title">
            <div className="tasks-heading">
              <div>
                <p className="eyebrow">SUIVI DES ACTIVITÉS</p>
                <h2 id="tasks-title">Liste des tâches</h2>
              </div>

              {tasksStatus === 'loaded' && (
                <span className="tasks-count">
                  {tasks.length} {tasks.length > 1 ? 'tâches' : 'tâche'}
                </span>
              )}
            </div>

            {tasksStatus === 'loading' && (
              <div className="tasks-message" role="status" aria-live="polite">
                <span className="loading-spinner" aria-hidden="true" />
                <p>Chargement des tâches en cours...</p>
              </div>
            )}

            {tasksStatus === 'error' && (
              <div className="tasks-message tasks-message--error" role="alert">
                <h3>Impossible de récupérer les tâches</h3>
                <p>
                  Une erreur est survenue lors de la communication avec
                  le serveur. Vérifiez que l’API est démarrée et réessayez
                  en rechargeant la page.
                </p>
              </div>
            )}

            {tasksStatus === 'empty' && (
              <div className="tasks-message tasks-message--empty">
                <h3>Aucune tâche pour le moment</h3>
                <p>
                  Les tâches enregistrées apparaîtront ici lorsqu’elles
                  seront disponibles.
                </p>
              </div>
            )}

            {tasksStatus === 'loaded' && (
              <ul className="tasks-list">
                {tasks.map((task) => (
                  <li className="task-card" key={task.id}>
                    <div className="task-card-content">
                      <h3>{task.title}</h3>
                      <p>{task.description}</p>
                      <time dateTime={task.createdAt}>
                        Créée le {formatTaskDate(task.createdAt)}
                      </time>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
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
