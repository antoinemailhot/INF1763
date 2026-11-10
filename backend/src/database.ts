import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

// Ouvre une base SQLite persistante ou une base temporaire en mémoire.
export function createDatabase(
  databasePath?: string,
): Database.Database {
  // Utilise le chemin fourni, la variable d'environnement ou le chemin par défaut.
  const resolvedPath = databasePath === ":memory:"
    ? databasePath
    : resolve(
        databasePath ??
          process.env.DATABASE_PATH ??
          resolve(__dirname, "../data/gestitaches.db"),
      );

  // Crée le dossier parent uniquement pour une base stockée dans un fichier.
  if (resolvedPath !== ":memory:") {
    mkdirSync(dirname(resolvedPath), { recursive: true });
  }

  const database = new Database(resolvedPath);

  // Active le mode WAL pour améliorer la gestion des accès concurrents.
  database.pragma("journal_mode = WAL");

  // Initialise la table des tâches, y compris la date d'échéance.
  database.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (
        strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
      ),
      due_date TEXT
    );
  `);

  // Vérifie les colonnes existantes pour assurer la compatibilité
  // avec les bases de données créées avant l'ajout de due_date.
  const columns = database.pragma("table_info(tasks)") as Array<{
    name: string;
  }>;

  // Ajoute la colonne uniquement si elle n'existe pas déjà.
  if (!columns.some((column) => column.name === "due_date")) {
    database.exec(`
      ALTER TABLE tasks
      ADD COLUMN due_date TEXT;
    `);
  }

  return database;
}
