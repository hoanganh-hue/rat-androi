import { authenticate, generateToken } from "../../middleware/auth";
import type { NextFunction, Request, Response } from "express";

function createRes() {
  const res: any = {};
  res.statusCode = 200;
  res.status = jest.fn((code: number) => {
    res.statusCode = code;
    return res;
  });
  res.json = jest.fn((_body?: any) => res);
  return res as Response;
}

describe("authenticate middleware (unit)", () => {
  it("returns 401 when missing Authorization header", async () => {
    const req = { headers: {} } as unknown as Request;
    const res = createRes();
    const next = jest.fn() as NextFunction;
    await authenticate(req as any, res as any, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "No token provided" });
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 when token is invalid", async () => {
    const req = {
      headers: { authorization: "Bearer invalid" },
    } as unknown as Request;
    const res = createRes();
    const next = jest.fn() as NextFunction;
    await authenticate(req as any, res as any, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid token" });
    expect(next).not.toHaveBeenCalled();
  });

  it("calls next and attaches user when token is valid", async () => {
    const token = generateToken({ id: 1, username: "admin", role: "admin" });
    const req: any = { headers: { authorization: `Bearer ${token}` } };
    const res = createRes();
    const next = jest.fn() as NextFunction;
    await authenticate(req as any, res as any, next);
    expect(next).toHaveBeenCalled();
    expect(req.user).toMatchObject({ id: 1, username: "admin", role: "admin" });
  });

  it("handles unexpected errors (outer catch)", async () => {
    // Suppress console.error for this test since we're intentionally triggering an error
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    const req: any = {};
    // Make accessing headers throw to trigger outer catch
    Object.defineProperty(req, "headers", {
      get() {
        throw new Error("boom");
      },
    });
    const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn() as NextFunction;
    await authenticate(req as any, res as any, next);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Internal server error" });
    expect(next).not.toHaveBeenCalled();

    // Restore console.error
    consoleErrorSpy.mockRestore();
  });
});
