import type { Database } from "@tursodatabase/database" with {
  "resolution-mode": "import"
};

// Structure d'une tâche retournée par le dépôt.
export interface Task {
  id: number;
  title: string;
  description: string;
  createdAt: string;
  dueDate: string | null;
  completed: boolean;
}

// Structure d'une ligne récupérée dans SQLite.
type TaskRow = {
  id: number;
  title: string;
  description: string;
  createdAt: string;
  dueDate: string | null;
  completed: number;
};

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
  return {
    ...row,
    completed: Number(row.completed) === 1,
  };
}

// Dépôt responsable des opérations asynchrones de persistance.
export class TaskRepository {
  constructor(private readonly database: Database) {}

  // Enregistre une tâche et retourne la tâche créée.
  async createTask(
    title: string,
    description: string,
    dueDate: string | null = null,
  ): Promise<Task> {

    // Insère la tâche dans la base de données.
    const result = await this.database.run(
      `
        INSERT INTO tasks (title, description, due_date)
        VALUES (?, ?, ?)
      `,
      title,
      description,
      dueDate,
    );

    // Récupère la tâche créée à partir de son identifiant.
    const task = await this.getTaskById(
      Number(result.lastInsertRowid),
    );

    if (!task) {
      throw new Error("Impossible de récupérer la tâche créée.");
    }

    return task;
  }

  // Récupère une tâche à partir de son identifiant.
  async getTaskById(
    id: number,
  ): Promise<Task | undefined> {

    const row = await this.database.get(
      `
        SELECT ${TASK_COLUMNS}
        FROM tasks
        WHERE id = ?
      `,
      id,
    ) as TaskRow | undefined;

    return row ? toTask(row) : undefined;
  }

  // Modifie l'état complété d'une tâche.
  // Retourne la tâche mise à jour ou undefined si elle n'existe pas.
  async setTaskCompleted(
    id: number,
    completed: boolean,
  ): Promise<Task | undefined> {

    const result = await this.database.run(
      `
        UPDATE tasks
        SET completed = ?
        WHERE id = ?
      `,
      completed ? 1 : 0,
      id,
    );

    if (result.changes === 0) {
      return undefined;
    }

    return this.getTaskById(id);
  }

  // Supprime définitivement une tâche.
  async deleteTask(id: number): Promise<boolean> {

    const result = await this.database.run(
      `
        DELETE FROM tasks
        WHERE id = ?
      `,
      id,
    );

    return result.changes > 0;
  }

  // Récupère toutes les tâches, des plus récentes aux plus anciennes.
  async getAllTasks(): Promise<Task[]> {

    const rows = await this.database.all(
      `
        SELECT ${TASK_COLUMNS}
        FROM tasks
        ORDER BY created_at DESC, id DESC
      `,
    ) as TaskRow[];

    return rows.map(toTask);
  }
}
