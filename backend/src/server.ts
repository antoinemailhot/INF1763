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

if (require.main === module) {
  app.listen(port, () => {
    console.log(`API PrêtMatériel démarrée sur http://localhost:${port}`);
  });
}
