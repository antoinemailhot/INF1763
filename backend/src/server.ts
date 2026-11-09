import express from "express";
import type Database from "better-sqlite3";
import { createDatabase } from "./database";
import { TaskRepository } from "./taskRepository";

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

  // Valide et enregistre une nouvelle tâche dans SQLite.
  app.post("/tasks", (req, res) => {
    const body: unknown = req.body;

    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      return res.status(400).json({
        error: "Le corps de la requête doit être un objet JSON.",
      });
    }

    const task = body as Record<string, unknown>;

    if (typeof task.title !== "string") {
      return res.status(400).json({
        error: "Le titre est obligatoire et doit être une chaîne de caractères.",
      });
    }

    if (typeof task.description !== "string") {
      return res.status(400).json({
        error: "La description doit être une chaîne de caractères.",
      });
    }

    const createdTask = taskRepository.createTask(
      task.title,
      task.description,
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
