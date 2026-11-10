import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import type { Server } from "node:http";
import { createDatabase } from "./database.js";
import { createApp } from "./server.js";

const database = createDatabase(":memory:");
const app = createApp(database);

let server: Server;
let baseUrl: string;

// Capture les journaux produits pendant une requête.
async function captureLogs<T>(
  action: () => Promise<T>,
): Promise<{ result: T; logs: string[] }> {
  const logs: string[] = [];
  const originalLog = console.log;

  console.log = (...args: unknown[]) => {
    logs.push(args.map(String).join(" "));
  };

  try {
    const result = await action();
    return { result, logs };
  } finally {
    console.log = originalLog;
  }
}

before(async () => {
  server = app.listen(0);

  await new Promise<void>((resolve, reject) => {
    server.once("listening", resolve);
    server.once("error", reject);
  });

  const address = server.address();

  if (!address || typeof address === "string") {
    throw new Error("Impossible de déterminer le port du serveur de test.");
  }

  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });

  database.close();
});

test("GET / retourne HTTP 200 et les informations de l'API", async () => {
  const response = await fetch(`${baseUrl}/`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.deepEqual(body, {
    status: "ok",
    service: "pretmateriel-api",
  });
});

test("GET /health retourne HTTP 200 et le statut OK", async () => {
  const response = await fetch(`${baseUrl}/health`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.deepEqual(body, {
    status: "ok",
  });
});

test("GET /tasks retourne une liste vide si aucune tâche n'existe", async () => {
  const response = await fetch(`${baseUrl}/tasks`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.deepEqual(body, []);
});

test("POST /tasks retourne HTTP 400 si le titre est absent", async () => {
  const response = await fetch(`${baseUrl}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ description: "Une description" }),
  });

  assert.equal(response.status, 400);
});

test("POST /tasks retourne HTTP 400 si le titre n'est pas une chaîne", async () => {
  const response = await fetch(`${baseUrl}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: 123, description: "Une description" }),
  });

  assert.equal(response.status, 400);
});

test("POST /tasks retourne HTTP 400 si le titre est vide", async () => {
  const response = await fetch(`${baseUrl}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "", description: "Une description" }),
  });

  assert.equal(response.status, 400);
});

test("POST /tasks retourne HTTP 400 si le titre contient uniquement des espaces", async () => {
  const response = await fetch(`${baseUrl}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "   ", description: "Une description" }),
  });

  assert.equal(response.status, 400);
});

test("POST /tasks retourne HTTP 400 si la description n'est pas une chaîne", async () => {
  const response = await fetch(`${baseUrl}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "Une tâche", description: false }),
  });

  assert.equal(response.status, 400);
});

test("POST /tasks retourne HTTP 201 et enregistre une tâche sans date d'échéance", async () => {
  const response = await fetch(`${baseUrl}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "Une tâche",
      description: "Une description",
    }),
  });

  const body = await response.json();

  assert.equal(response.status, 201);
  assert.equal(body.id, 1);
  assert.equal(body.title, "Une tâche");
  assert.equal(body.description, "Une description");
  assert.equal(body.dueDate, null);
  assert.equal(typeof body.createdAt, "string");
  assert.ok(!Number.isNaN(Date.parse(body.createdAt)));
});

test("POST /tasks accepte une description absente", async () => {
  const response = await fetch(`${baseUrl}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "Tâche sans description" }),
  });

  const body = await response.json();

  assert.equal(response.status, 201);
  assert.equal(body.title, "Tâche sans description");
  assert.equal(body.description, "");
  assert.equal(body.dueDate, null);
});

test("POST /tasks accepte une date d'échéance valide", async () => {
  const response = await fetch(`${baseUrl}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "Tâche avec échéance",
      description: "Une description",
      dueDate: "2026-12-08",
    }),
  });

  const body = await response.json();

  assert.equal(response.status, 201);
  assert.equal(body.dueDate, "2026-12-08");
});

test("POST /tasks retourne HTTP 400 si la date d'échéance est invalide", async () => {
  const response = await fetch(`${baseUrl}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "Tâche avec date invalide",
      description: "Une description",
      dueDate: "2026-02-30",
    }),
  });

  assert.equal(response.status, 400);
});

test("POST /tasks retourne HTTP 400 si la date ne respecte pas le format attendu", async () => {
  const response = await fetch(`${baseUrl}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "Tâche avec mauvais format",
      description: "Une description",
      dueDate: "08/12/2026",
    }),
  });

  assert.equal(response.status, 400);
});

test("GET /tasks retourne les tâches enregistrées avec leur date d'échéance", async () => {
  const response = await fetch(`${baseUrl}/tasks`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.length, 3);

  assert.equal(body[0].title, "Tâche avec échéance");
  assert.equal(body[0].dueDate, "2026-12-08");

  assert.equal(body[1].title, "Tâche sans description");
  assert.equal(body[1].description, "");
  assert.equal(body[1].dueDate, null);

  assert.equal(body[2].title, "Une tâche");
  assert.equal(body[2].dueDate, null);
});

test("Journalise GET /health avec le statut HTTP 200", async () => {
  const { result: response, logs } = await captureLogs(() =>
    fetch(`${baseUrl}/health`),
  );

  assert.equal(response.status, 200);
  assert.ok(logs.includes("GET /health - 200"));
});

test("Journalise une route inexistante avec le statut HTTP 404", async () => {
  const { result: response, logs } = await captureLogs(() =>
    fetch(`${baseUrl}/route-inexistante`),
  );

  assert.equal(response.status, 404);
  assert.ok(logs.includes("GET /route-inexistante - 404"));
});

test("Journalise POST /tasks avec le statut HTTP 400", async () => {
  const { result: response, logs } = await captureLogs(() =>
    fetch(`${baseUrl}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: 123, description: "Une description" }),
    }),
  );

  assert.equal(response.status, 400);
  assert.ok(logs.includes("POST /tasks - 400"));
});
