import express, { type Express } from "express";
import fs from "fs";
import path from "path";

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
  // Get the directory - use process.cwd() as fallback for test environment
  // In production, vite.ts is compiled to dist/server/vite.js
  const currentDir =
    typeof __dirname !== "undefined" ? __dirname : process.cwd();

  const distPath = path.resolve(currentDir, "..", "client", "dist", "client");

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
