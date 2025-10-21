import express from "express";
import request from "supertest";
import { adminOnly, adminOrManager } from "../../middleware/authorize";
import { authenticate, generateToken } from "../../middleware/auth";

describe("authorize middleware (real JWT)", () => {
  it("returns 401 if unauthenticated", async () => {
    const app = express();
    app.get("/admin", adminOnly, (_req, res) => res.json({ ok: true }));
    const res = await request(app).get("/admin");
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("error");
  });

  it("returns 403 for insufficient role", async () => {
    const app = express();
    app.get("/admin", authenticate, adminOnly, (_req, res) =>
      res.json({ ok: true }),
    );
    const viewer = generateToken({ id: 1, username: "u", role: "viewer" });
    const res = await request(app)
      .get("/admin")
      .set("Authorization", `Bearer ${viewer}`);
    expect(res.status).toBe(403);
  });

  it("allows manager for adminOrManager", async () => {
    const app = express();
    app.get("/mgr", authenticate, adminOrManager, (_req, res) =>
      res.json({ ok: true }),
    );
    const mgr = generateToken({ id: 2, username: "m", role: "manager" });
    const res = await request(app)
      .get("/mgr")
      .set("Authorization", `Bearer ${mgr}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });
});
