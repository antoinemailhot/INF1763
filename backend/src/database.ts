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

  // Initialise la structure de la base de données.
  database.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (
        strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
      )
    );
  `);

  return database;
}
