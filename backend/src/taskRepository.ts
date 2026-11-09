import type Database from "better-sqlite3";

// Structure d'une tâche retournée par le dépôt.
export interface Task {
  id: number;
  title: string;
  description: string;
  createdAt: string;
}

// Dépôt responsable des opérations de persistance des tâches.
export class TaskRepository {
  constructor(private readonly database: Database.Database) {}

  // Enregistre une tâche et retourne la tâche créée.
  createTask(title: string, description: string): Task {
    const statement = this.database.prepare(`
      INSERT INTO tasks (title, description)
      VALUES (?, ?)
    `);

    const result = statement.run(title, description);

    const task = this.database.prepare(`
      SELECT
        id,
        title,
        description,
        created_at AS createdAt
      FROM tasks
      WHERE id = ?
    `).get(result.lastInsertRowid) as Task | undefined;

    if (!task) {
      throw new Error("Impossible de récupérer la tâche créée.");
    }

    return task;
  }

  // Récupère toutes les tâches, des plus récentes aux plus anciennes.
  getAllTasks(): Task[] {
    return this.database.prepare(`
      SELECT
        id,
        title,
        description,
        created_at AS createdAt
      FROM tasks
      ORDER BY created_at DESC, id DESC
    `).all() as Task[];
  }
}
