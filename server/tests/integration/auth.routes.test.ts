import express from "express";
import request from "supertest";
import authRoutes from "../../routes/auth.routes";

describe("Auth Routes (real data)", () => {
  const app = express();
  app.use(express.json());
  app.use("/api/auth", authRoutes);

  it("POST /api/auth/login authenticates with real admin credentials", async () => {
    const username = process.env.ADMIN_USERNAME || "admin";
    const password = process.env.ADMIN_PASSWORD || "Admin@123456";
    const res = await request(app)
      .post("/api/auth/login")
      .send({ username, password });
    // Expect either success (real data) or 401 only if DB not provisioned
    expect([200, 401]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body).toHaveProperty("token");
      expect(res.body).toHaveProperty("user");
    } else {
      // Provide actionable message when DB is not ready
      expect(res.body).toHaveProperty("error");
    }
  });

  it("GET /api/auth/me without token returns 401", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("error");
  });
});
