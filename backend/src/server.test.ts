import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import type { Server } from "node:http";
import { app } from "./server.js";

let server: Server;
let baseUrl: string;

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

test("POST /tasks retourne HTTP 400 si la description n'est pas une chaîne", async () => {
  const response = await fetch(`${baseUrl}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "Une tâche", description: false }),
  });

  assert.equal(response.status, 400);
});

test("POST /tasks retourne HTTP 201 si le titre et la description sont des chaînes", async () => {
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
  assert.deepEqual(body, {
    title: "Une tâche",
    description: "Une description",
  });
});
