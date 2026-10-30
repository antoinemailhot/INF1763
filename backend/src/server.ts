import express from "express";

export const app = express();

const port = Number(process.env.PORT ?? 3000);

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

  return res.status(201).json({
    title: task.title,
    description: task.description,
  });
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`API PrêtMatériel démarrée sur http://localhost:${port}`);
  });
}
