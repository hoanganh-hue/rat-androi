import express from "express";
import request from "supertest";
import { authValidation, validate } from "../../middleware/validation";

describe("validation middleware (real route)", () => {
  const app = express();
  app.use(express.json());
  app.post("/login", ...authValidation.login, validate, (_req, res) =>
    res.json({ ok: true }),
  );

  it("returns 400 when login body is invalid", async () => {
    const res = await request(app).post("/login").send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("passes through when body is valid", async () => {
    const res = await request(app)
      .post("/login")
      .send({ username: "user", password: "pass" });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });
});
