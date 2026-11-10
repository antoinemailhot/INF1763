import type Database from "better-sqlite3";

// Structure d'une tâche retournée par le dépôt.
export interface Task {
  id: number;
  title: string;
  description: string;
  createdAt: string;
  dueDate: string | null;
}

// Dépôt responsable des opérations de persistance des tâches.
export class TaskRepository {
  constructor(private readonly database: Database.Database) {}

  // Enregistre une tâche et retourne la tâche créée.
  createTask(
    title: string,
    description: string,
    dueDate: string | null = null,
  ): Task {
    const statement = this.database.prepare(`
      INSERT INTO tasks (title, description, due_date)
      VALUES (?, ?, ?)
    `);

    const result = statement.run(title, description, dueDate);

    const task = this.database.prepare(`
      SELECT
        id,
        title,
        description,
        created_at AS createdAt,
        due_date AS dueDate
      FROM tasks
      WHERE id = ?
    `).get(result.lastInsertRowid) as Task | undefined;

    if (!task) {
      throw new Error("Impossible de récupérer la tâche créée.");
    }

    return task;
  }

  // Supprime définitivement une tâche à partir de son identifiant.
  // Retourne true si une tâche a été supprimée, sinon false.
  deleteTask(id: number): boolean {
    const statement = this.database.prepare(`
      DELETE FROM tasks
      WHERE id = ?
    `);

    const result = statement.run(id);

    return result.changes > 0;
  }

  // Récupère toutes les tâches, des plus récentes aux plus anciennes.
  getAllTasks(): Task[] {
    return this.database.prepare(`
      SELECT
        id,
        title,
        description,
        created_at AS createdAt,
        due_date AS dueDate
      FROM tasks
      ORDER BY created_at DESC, id DESC
    `).all() as Task[];
  }
}
