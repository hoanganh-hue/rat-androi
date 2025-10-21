// Socket.IO Bridge - Gửi lệnh đến thiết bị Android
import { Server as SocketIOServer, Socket } from "socket.io";
import { CommandType } from "../models";

let io: SocketIOServer | null = null;

// Map to store socket connections: deviceId -> socketId
const deviceSockets = new Map<string, string>();

/**
 * Initialize Socket.IO server
 */
export function initSocketBridge(ioServer: SocketIOServer): void {
  io = ioServer;
  console.log("✅ Socket.IO bridge initialized");
}

/**
 * Register a device socket connection
 */
export function registerDevice(deviceId: string, socketId: string): void {
  deviceSockets.set(deviceId, socketId);
  console.log(`📱 Device registered: ${deviceId} (Socket: ${socketId})`);
}

/**
 * Unregister a device socket connection
 */
export function unregisterDevice(deviceId: string): void {
  deviceSockets.delete(deviceId);
  console.log(`📱 Device unregistered: ${deviceId}`);
}

/**
 * Get socket ID for a device
 */
export function getDeviceSocket(deviceId: string): string | undefined {
  return deviceSockets.get(deviceId);
}

/**
 * Get all connected devices
 */
export function getConnectedDevices(): string[] {
  return Array.from(deviceSockets.keys());
}

/**
 * Emit command to a specific device
 */
export function emitToDevice(
  deviceId: string,
  command: CommandType,
  params: Record<string, any> = {},
): boolean {
  if (!io) {
    console.error("❌ Socket.IO not initialized");
    return false;
  }

  const socketId = deviceSockets.get(deviceId);
  if (!socketId) {
    console.error(`❌ Device ${deviceId} not connected`);
    return false;
  }

  // Convert params to Android app expected format
  const extras = Object.entries(params).map(([key, value]) => ({
    key,
    value: String(value),
  }));

  io.to(socketId).emit("commend", {
    request: command,
    extras,
  });

  console.log(`📤 Command sent to ${deviceId}: ${command}`, params);
  return true;
}

/**
 * Emit command to all connected devices
 */
export function emitToAll(
  command: CommandType,
  params: Record<string, any> = {},
): void {
  if (!io) {
    console.error("❌ Socket.IO not initialized");
    return;
  }

  const extras = Object.entries(params).map(([key, value]) => ({
    key,
    value: String(value),
  }));

  io.emit("commend", {
    request: command,
    extras,
  });

  console.log(`📤 Command broadcast to all devices: ${command}`, params);
}

/**
 * Check if device is currently connected
 */
export function isDeviceOnline(deviceId: string): boolean {
  return deviceSockets.has(deviceId);
}

export default {
  initSocketBridge,
  registerDevice,
  unregisterDevice,
  getDeviceSocket,
  getConnectedDevices,
  emitToDevice,
  emitToAll,
  isDeviceOnline,
};
