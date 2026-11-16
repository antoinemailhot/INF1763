import type Database from "better-sqlite3";

// Structure d'une tâche retournée par le dépôt.
export interface Task {
  id: number;
  title: string;
  description: string;
  createdAt: string;
  dueDate: string | null;
  completed: boolean;
}

// Structure d'une ligne lue dans SQLite, où les booléens sont des entiers.
type TaskRow = Omit<Task, "completed"> & { completed: number };

// Colonnes sélectionnées pour construire une tâche.
const TASK_COLUMNS = `
  id,
  title,
  description,
  created_at AS createdAt,
  due_date AS dueDate,
  completed
`;

// Convertit une ligne SQLite en tâche.
function toTask(row: TaskRow): Task {
  return { ...row, completed: row.completed === 1 };
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

    const task = this.getTaskById(Number(result.lastInsertRowid));

    if (!task) {
      throw new Error("Impossible de récupérer la tâche créée.");
    }

    return task;
  }

  // Récupère une tâche à partir de son identifiant.
  getTaskById(id: number): Task | undefined {
    const row = this.database.prepare(`
      SELECT ${TASK_COLUMNS}
      FROM tasks
      WHERE id = ?
    `).get(id) as TaskRow | undefined;

    return row ? toTask(row) : undefined;
  }

  // Modifie l'état complété d'une tâche.
  // Retourne la tâche mise à jour, ou undefined si elle n'existe pas.
  setTaskCompleted(id: number, completed: boolean): Task | undefined {
    const result = this.database.prepare(`
      UPDATE tasks
      SET completed = ?
      WHERE id = ?
    `).run(completed ? 1 : 0, id);

    if (result.changes === 0) {
      return undefined;
    }

    return this.getTaskById(id);
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
    const rows = this.database.prepare(`
      SELECT ${TASK_COLUMNS}
      FROM tasks
      ORDER BY created_at DESC, id DESC
    `).all() as TaskRow[];

    return rows.map(toTask);
  }
}
