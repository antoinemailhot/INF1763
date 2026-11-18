import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";

// Type de connexion retourné par la bibliothèque Turso.
// L'import de type ne génère aucun require() dans le JavaScript.
import type { Database } from "@tursodatabase/database" with {
  "resolution-mode": "import"
};

// Initialise une base SQLite persistante ou une base en mémoire.
export async function createDatabase(
  databasePath?: string,
): Promise<Database> {

  // Détermine le chemin de la base de données.
  const resolvedPath = databasePath === ":memory:"
    ? databasePath
    : resolve(
        databasePath ??
          process.env.DATABASE_PATH ??
          resolve(__dirname, "../data/gestitaches.db"),
      );

  // Crée le dossier parent de manière asynchrone.
  if (resolvedPath !== ":memory:") {
    await mkdir(dirname(resolvedPath), { recursive: true });
  }

  // Charge dynamiquement le module ESM depuis notre environnement CommonJS.
  const { connect } = await import("@tursodatabase/database");

  // Ouvre la connexion SQLite de manière asynchrone.
  const database = await connect(resolvedPath);

  try {
    // Active le mode WAL.
    await database.exec("PRAGMA journal_mode = WAL;");

    // Initialise la table avec toutes les colonnes actuelles.
    await database.exec(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (
          strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
        ),
        due_date TEXT,
        completed INTEGER NOT NULL DEFAULT 0
      );
    `);

    // Récupère les colonnes existantes.
    const columns = await database.all(
      "PRAGMA table_info(tasks);",
    ) as Array<{ name: string }>;

    // Ajoute due_date si elle manque dans une ancienne base.
    if (!columns.some((column) => column.name === "due_date")) {
      await database.exec(`
        ALTER TABLE tasks
        ADD COLUMN due_date TEXT;
      `);
    }

    // Ajoute completed si elle manque dans une ancienne base.
    if (!columns.some((column) => column.name === "completed")) {
      await database.exec(`
        ALTER TABLE tasks
        ADD COLUMN completed INTEGER NOT NULL DEFAULT 0;
      `);
    }

    // Retourne la connexion après initialisation.
    return database;

  } catch (error) {

    // Ferme la connexion si l'initialisation échoue.
    await database.close();

    // Transmet l'erreur au code appelant.
    throw error;
  }
}

