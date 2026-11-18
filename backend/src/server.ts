import express from "express";
import type { Database } from "@tursodatabase/database" with {
  "resolution-mode": "import"
};
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

// Valide l'identifiant d'une tâche reçu dans l'URL.
// Retourne l'identifiant numérique, ou le message d'erreur à renvoyer.
function parseTaskId(rawId: string): { id: number } | { error: string } {
  // Accepte uniquement une chaîne composée de chiffres.
  if (!/^[1-9]\d*$/.test(rawId)) {
    return { error: "L'identifiant de la tâche doit être un entier positif." };
  }

  const id = Number(rawId);

  // Vérifie que l'identifiant peut être représenté sans perte de précision.
  if (!Number.isSafeInteger(id) || id <= 0) {
    return { error: "L'identifiant de la tâche est invalide." };
  }

  return { id };
}

// Crée une application Express avec une connexion Turso injectée.
export function createApp(database: Database) {
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
  app.get("/tasks", async (_req, res) => {
    const tasks = await taskRepository.getAllTasks();

    return res.status(200).json(tasks);
  });

  // Supprime définitivement une tâche à partir de son identifiant.
  app.delete("/tasks/:id", async (req, res) => {
    const parsedId = parseTaskId(req.params.id);

    if ("error" in parsedId) {
      return res.status(400).json({ error: parsedId.error });
    }

    // Attend la suppression dans SQLite.
    const deleted = await taskRepository.deleteTask(parsedId.id);

    // Retourne 404 si aucune tâche ne correspond à cet identifiant.
    if (!deleted) {
      return res.status(404).json({
        error: "La tâche demandée est introuvable.",
      });
    }

    // Confirme la suppression sans retourner de corps de réponse.
    return res.status(204).send();
  });

  // Marque une tâche comme complétée ou non complétée (US11).
  app.patch("/tasks/:id", async (req, res) => {
    const parsedId = parseTaskId(req.params.id);

    if ("error" in parsedId) {
      return res.status(400).json({ error: parsedId.error });
    }

    const body: unknown = req.body;

    // Exige un objet JSON contenant un booléen « completed ».
    if (
      typeof body !== "object"
      || body === null
      || Array.isArray(body)
      || typeof (body as Record<string, unknown>).completed !== "boolean"
    ) {
      return res.status(400).json({
        error: "Le champ completed est obligatoire et doit être un booléen.",
      });
    }

    const completed = (body as { completed: boolean }).completed;

    // Attend l'enregistrement du nouvel état dans SQLite.
    const updatedTask = await taskRepository.setTaskCompleted(
      parsedId.id,
      completed,
    );

    if (!updatedTask) {
      return res.status(404).json({
        error: "La tâche demandée est introuvable.",
      });
    }

    return res.status(200).json(updatedTask);
  });

  // Valide et enregistre une nouvelle tâche dans SQLite.
  app.post("/tasks", async (req, res) => {
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

    // Attend la création de la tâche avant de répondre au client.
    const createdTask = await taskRepository.createTask(
      title,
      description,
      dueDate,
    );

    return res.status(201).json(createdTask);
  });

  return app;
}

// Démarre le serveur uniquement lorsque ce fichier est exécuté directement.
async function startServer(): Promise<void> {
  const port = Number(process.env.PORT ?? 3000);

  // Attend l'ouverture de la connexion et l'initialisation de la base.
  const database = await createDatabase();

  const app = createApp(database);
  const server = app.listen(port);

  // Attend que le serveur HTTP soit effectivement prêt.
  try {
    await new Promise<void>((resolve, reject) => {
      server.once("listening", resolve);
      server.once("error", reject);
    });
  } catch (error) {
    // Libère la base si le serveur HTTP ne peut pas démarrer.
    await database.close();
    throw error;
  }

  console.log(`API PrêtMatériel démarrée sur http://localhost:${port}`);

  let shutdownPromise: Promise<void> | undefined;

  // Arrête proprement le serveur et ferme ensuite la base.
  function shutdown(signal: NodeJS.Signals): Promise<void> {
    // Empêche plusieurs signaux de déclencher plusieurs fermetures.
    if (shutdownPromise) {
      return shutdownPromise;
    }

    shutdownPromise = (async () => {
      console.log(`Signal ${signal} reçu. Arrêt du serveur...`);

      try {
        // server.close() cesse d'accepter de nouvelles connexions
        // et attend la fin des connexions HTTP actives.
        await new Promise<void>((resolve, reject) => {
          server.close((error) => {
            if (error) {
              reject(error);
              return;
            }

            resolve();
          });
        });
      } finally {
        // Ferme la connexion SQLite après l'arrêt HTTP.
        await database.close();
        console.log("Connexion à la base de données fermée.");
      }
    })();

    return shutdownPromise;
  }

  // Enregistre les gestionnaires d'arrêt du processus.
  process.once("SIGINT", () => {
    void shutdown("SIGINT").catch((error: unknown) => {
      console.error("Erreur pendant l'arrêt du serveur :", error);
      process.exitCode = 1;
    });
  });

  process.once("SIGTERM", () => {
    void shutdown("SIGTERM").catch((error: unknown) => {
      console.error("Erreur pendant l'arrêt du serveur :", error);
      process.exitCode = 1;
    });
  });
}

// Gère les erreurs de démarrage.
if (require.main === module) {
  void startServer().catch((error: unknown) => {
    console.error("Impossible de démarrer l'API PrêtMatériel :", error);
    process.exitCode = 1;
  });
}
