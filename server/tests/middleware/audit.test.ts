import express from "express";
import request from "supertest";
import { auditLog } from "../../middleware/audit";
import { authenticate, generateToken } from "../../middleware/auth";
import { AuditTrail, User } from "../../models";

describe("auditLog middleware (real database)", () => {
  it("creates an audit record on success and redacts sensitive fields", async () => {
    // Get the actual admin user with UUID
    const adminUser = await User.findOne({
      where: { username: process.env.ADMIN_USERNAME || "testadmin" } as any,
    });
    if (!adminUser) {
      throw new Error("Admin user not found in database");
    }

    const app = express();
    app.use(express.json());
    app.post(
      "/ok",
      authenticate,
      auditLog({ action: "test.action", targetType: "device" }),
      (_req, res) =>
        res.json({ success: true, password: "secret", token: "abc" }),
    );

    const token = generateToken({
      id: adminUser.id,
      username: adminUser.username,
      role: adminUser.role as any,
    });
    const res = await request(app)
      .post("/ok")
      .set("Authorization", `Bearer ${token}`)
      .send({ some: "payload", password: "secret", token: "abc" });
    expect(res.status).toBe(200);

    // Give the async AuditTrail.create more time to complete
    await new Promise((r) => setTimeout(r, 100));

    // Find the audit trail for this specific user
    const last = await AuditTrail.findOne({
      where: { user_id: adminUser.id } as any,
      order: [["timestamp", "DESC"]],
    } as any);

    expect(last).not.toBeNull();
    if (last) {
      expect((last as any).action).toBe("test.action");
      const meta = (last as any).metadata as any;
      expect(meta?.body?.password).toBe("[REDACTED]");
      expect(meta?.body?.token).toBe("[REDACTED]");
    }
  });

  it("does not create audit record on non-2xx response", async () => {
    const before = await AuditTrail.count();

    const app = express();
    app.get("/bad", auditLog({ action: "bad" }), (_req, res) =>
      res.status(400).json({ error: "bad" }),
    );
    const res = await request(app).get("/bad");
    expect(res.status).toBe(400);

    await new Promise((r) => setTimeout(r, 20));
    const after = await AuditTrail.count();
    expect(after).toBe(before);
  });
});
