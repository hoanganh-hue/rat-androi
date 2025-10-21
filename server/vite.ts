import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

// Serve static assets built by Angular CLI under client/dist/client
export function serveStatic(app: Express) {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const distPath = path.resolve(
    __dirname,
    "..",
    "client",
    "dist",
    "client",
  );

  if (!fs.existsSync(distPath)) {
    log(
      `Static directory not found: ${distPath}. Build the Angular client with "npm run client:build" first.`,
      "static",
    );
    return;
  }

  app.use(express.static(distPath));

  // SPA fallback to index.html
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}

