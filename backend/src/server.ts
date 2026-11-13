import express from "express";
import type Database from "better-sqlite3";
import { createDatabase } from "./database";
import { TaskRepository } from "./taskRepository";

// Vérifie qu'une date respecte le format YYYY-MM-DD et existe réellement.
function isValidDateOnly(value: string): boolean {
  // Vérifie d'abord la structure de la date.
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  // Vérifie ensuite la validité réelle de la date dans le calendrier.
  const date = new Date(`${value}T00:00:00.000Z`);

  return !Number.isNaN(date.getTime())
    && date.toISOString().slice(0, 10) === value;
}

// Crée une application Express avec une connexion SQLite injectée.
export function createApp(database: Database.Database) {
  const app = express();
  const taskRepository = new TaskRepository(database);

  // Journalise chaque requête lorsque la réponse HTTP est terminée.
  app.use((req, res, next) => {
    res.on("finish", () => {
      console.log(`${req.method} ${req.originalUrl} - ${res.statusCode}`);
    });

    next();
  });

  // Analyse les corps des requêtes JSON.
  app.use(express.json());

  app.get("/", (_req, res) => {
    res.status(200).json({
      status: "ok",
      service: "pretmateriel-api",
    });
  });

  app.get("/health", (_req, res) => {
    res.status(200).json({
      status: "ok",
    });
  });

  // Retourne toutes les tâches enregistrées dans SQLite.
  app.get("/tasks", (_req, res) => {
    const tasks = taskRepository.getAllTasks();

    return res.status(200).json(tasks);
  });

  // Supprime définitivement une tâche à partir de son identifiant.
  app.delete("/tasks/:id", (req, res) => {
    const rawId = req.params.id;

    // Accepte uniquement une chaîne composée de chiffres.
    if (!/^[1-9]\d*$/.test(rawId)) {
      return res.status(400).json({
        error: "L'identifiant de la tâche doit être un entier positif.",
      });
    }

    const id = Number(rawId);

    // Vérifie que l'identifiant peut être représenté sans perte de précision.
    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({
        error: "L'identifiant de la tâche est invalide.",
      });
    }

    // Effectue la suppression dans SQLite.
    const deleted = taskRepository.deleteTask(id);

    // Retourne 404 si aucune tâche ne correspond à cet identifiant.
    if (!deleted) {
      return res.status(404).json({
        error: "La tâche demandée est introuvable.",
      });
    }

    // Confirme la suppression sans retourner de corps de réponse.
    return res.status(204).send();
  });

  // Valide et enregistre une nouvelle tâche dans SQLite.
  app.post("/tasks", (req, res) => {
    const body: unknown = req.body;

    // Vérifie que le corps de la requête est un objet JSON.
    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      return res.status(400).json({
        error: "Le corps de la requête doit être un objet JSON.",
      });
    }

    const task = body as Record<string, unknown>;

    // Vérifie que le titre est une chaîne de caractères.
    if (typeof task.title !== "string") {
      return res.status(400).json({
        error: "Le titre est obligatoire et doit être une chaîne de caractères.",
      });
    }

    // Refuse les titres vides ou composés uniquement d'espaces.
    const title = task.title.trim();

    if (title.length === 0) {
      return res.status(400).json({
        error: "Le titre ne peut pas être vide.",
      });
    }

    // La description est facultative, mais doit être une chaîne si fournie.
    if (
      task.description !== undefined
      && typeof task.description !== "string"
    ) {
      return res.status(400).json({
        error: "La description doit être une chaîne de caractères.",
      });
    }

    const description = typeof task.description === "string"
      ? task.description
      : "";

    // La date d'échéance est facultative.
    // Une valeur absente ou null est enregistrée comme NULL dans SQLite.
    let dueDate: string | null = null;

    if (task.dueDate !== undefined && task.dueDate !== null) {
      if (typeof task.dueDate !== "string" || !isValidDateOnly(task.dueDate)) {
        return res.status(400).json({
          error: "La date d'échéance doit être une date valide au format YYYY-MM-DD.",
        });
      }

      dueDate = task.dueDate;
    }

    // Enregistre la tâche et retourne les données créées.
    const createdTask = taskRepository.createTask(
      title,
      description,
      dueDate,
    );

    return res.status(201).json(createdTask);
  });

  return app;
}

// Démarre le serveur uniquement lorsque ce fichier est exécuté directement.
if (require.main === module) {
  const port = Number(process.env.PORT ?? 3000);
  const database = createDatabase();
  const app = createApp(database);

  app.listen(port, () => {
    console.log(`API PrêtMatériel démarrée sur http://localhost:${port}`);
  });
}
