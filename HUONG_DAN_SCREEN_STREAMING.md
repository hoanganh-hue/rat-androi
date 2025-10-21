# HƯỚNG DẪN TRIỂN KHAI SCREEN STREAMING VÀ REMOTE CONTROL

## 📺 1. SCREEN STREAMING IMPLEMENTATION

### 1.1. Architecture Overview

```
Android Device                Backend Server               Web Admin
     |                              |                          |
     |-- Screen Capture API         |                          |
     |-- Encode to JPEG/H264        |                          |
     |                              |                          |
     |-- Socket.IO emit ----------->|                          |
     |   "screen-frame"             |                          |
     |                              |-- Relay frame ---------> |
     |                              |   Socket.IO broadcast    |
     |                              |                          |
     |                              |                     Video Player
     |                              |                     (Canvas/Video)
```

### 1.2. Backend Changes

#### 1.2.1. New Socket.IO Events

**File: `server/index.ts`**

Thêm handlers mới vào Socket.IO connection:

```typescript
// Screen streaming events
socket.on("screen-frame", (data) => {
  const { frame, timestamp } = data;

  // Broadcast frame to admin clients watching this device
  io.to(`admin-watching-${deviceId}`).emit("device-screen-frame", {
    deviceId,
    frame,
    timestamp,
  });
});

socket.on("start-screen-stream", () => {
  logger.info(`Screen stream started for device: ${deviceId}`);
  socket.emit("stream-started", { status: "ok" });
});

socket.on("stop-screen-stream", () => {
  logger.info(`Screen stream stopped for device: ${deviceId}`);
  socket.emit("stream-stopped", { status: "ok" });
});
```

#### 1.2.2. New API Endpoints

**File: `server/routes/devices.routes.ts`**

```typescript
/**
 * POST /api/devices/:id/start-screen-stream
 * Start screen streaming from device
 */
router.post(
  "/:id/start-screen-stream",
  canControlDevices,
  auditLog({ action: "devices.startScreenStream", targetType: "device" }),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const device = await Device.findByPk(req.params.id);

      if (!device) {
        res.status(404).json({ error: "Device not found" });
        return;
      }

      if (!isDeviceOnline(device.device_id)) {
        res.status(503).json({ error: "Device is offline" });
        return;
      }

      // Send start stream command to device
      const sent = emitToDevice(device.device_id, "start-screen-stream", {
        quality: req.body.quality || "medium", // low, medium, high
        fps: req.body.fps || 10,
      });

      if (sent) {
        logger.info(`Screen stream started for device ${device.device_id}`);
        res.json({
          message: "Screen stream started",
          deviceId: device.device_id,
        });
      } else {
        res.status(500).json({ error: "Failed to start stream" });
      }
    } catch (error) {
      logger.error("Start screen stream error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

/**
 * POST /api/devices/:id/stop-screen-stream
 * Stop screen streaming from device
 */
router.post(
  "/:id/stop-screen-stream",
  canControlDevices,
  auditLog({ action: "devices.stopScreenStream", targetType: "device" }),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const device = await Device.findByPk(req.params.id);

      if (!device) {
        res.status(404).json({ error: "Device not found" });
        return;
      }

      // Send stop stream command to device
      const sent = emitToDevice(device.device_id, "stop-screen-stream", {});

      if (sent) {
        logger.info(`Screen stream stopped for device ${device.device_id}`);
        res.json({ message: "Screen stream stopped" });
      } else {
        res.status(500).json({ error: "Failed to stop stream" });
      }
    } catch (error) {
      logger.error("Stop screen stream error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);
```

### 1.3. Frontend Changes

#### 1.3.1. Screen Viewer Component

**File: `client/src/app/pages/screen-viewer/screen-viewer.component.ts`**

```typescript
import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
} from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { SocketService } from "../../core/services/socket.service";
import { ApiService } from "../../core/services/api.service";

@Component({
  selector: "app-screen-viewer",
  templateUrl: "./screen-viewer.component.html",
  styleUrls: ["./screen-viewer.component.scss"],
})
export class ScreenViewerComponent implements OnInit, OnDestroy {
  @ViewChild("canvas", { static: true }) canvas!: ElementRef<HTMLCanvasElement>;

  deviceId!: string;
  isStreaming = false;
  fps = 0;
  quality = "medium";

  private ctx!: CanvasRenderingContext2D;
  private frameCount = 0;
  private lastFpsUpdate = Date.now();

  constructor(
    private route: ActivatedRoute,
    private socketService: SocketService,
    private apiService: ApiService,
  ) {}

  ngOnInit(): void {
    this.deviceId = this.route.snapshot.params["id"];
    this.ctx = this.canvas.nativeElement.getContext("2d")!;

    // Listen for screen frames
    this.socketService.on("device-screen-frame", (data: any) => {
      if (data.deviceId === this.deviceId) {
        this.renderFrame(data.frame);
        this.updateFps();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.isStreaming) {
      this.stopStream();
    }
  }

  startStream(): void {
    this.apiService
      .post(`/devices/${this.deviceId}/start-screen-stream`, {
        quality: this.quality,
        fps: 10,
      })
      .subscribe({
        next: () => {
          this.isStreaming = true;
          // Join room to receive frames
          this.socketService.emit("join-device-stream", {
            deviceId: this.deviceId,
          });
        },
        error: (err) => {
          console.error("Failed to start stream:", err);
        },
      });
  }

  stopStream(): void {
    this.apiService
      .post(`/devices/${this.deviceId}/stop-screen-stream`, {})
      .subscribe({
        next: () => {
          this.isStreaming = false;
          this.socketService.emit("leave-device-stream", {
            deviceId: this.deviceId,
          });
        },
        error: (err) => {
          console.error("Failed to stop stream:", err);
        },
      });
  }

  private renderFrame(frameData: string): void {
    const img = new Image();
    img.onload = () => {
      this.canvas.nativeElement.width = img.width;
      this.canvas.nativeElement.height = img.height;
      this.ctx.drawImage(img, 0, 0);
    };
    img.src = "data:image/jpeg;base64," + frameData;
  }

  private updateFps(): void {
    this.frameCount++;
    const now = Date.now();
    if (now - this.lastFpsUpdate >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.lastFpsUpdate = now;
    }
  }
}
```

**File: `client/src/app/pages/screen-viewer/screen-viewer.component.html`**

```html
<div class="screen-viewer-container">
  <div class="toolbar">
    <h2>Device Screen: {{ deviceId }}</h2>

    <div class="controls">
      <mat-button-toggle-group [(ngModel)]="quality" [disabled]="isStreaming">
        <mat-button-toggle value="low">Low</mat-button-toggle>
        <mat-button-toggle value="medium">Medium</mat-button-toggle>
        <mat-button-toggle value="high">High</mat-button-toggle>
      </mat-button-toggle-group>

      <button
        mat-raised-button
        color="primary"
        (click)="startStream()"
        [disabled]="isStreaming"
      >
        <mat-icon>play_arrow</mat-icon>
        Start Stream
      </button>

      <button
        mat-raised-button
        color="warn"
        (click)="stopStream()"
        [disabled]="!isStreaming"
      >
        <mat-icon>stop</mat-icon>
        Stop Stream
      </button>

      <span class="fps-counter">{{ fps }} FPS</span>
    </div>
  </div>

  <div class="screen-container">
    <canvas #canvas></canvas>
  </div>
</div>
```

---

## 🎮 2. REMOTE CONTROL IMPLEMENTATION

### 2.1. Architecture Overview

```
Web Admin                    Backend Server                Android Device
    |                              |                              |
    |-- Mouse/Touch Event          |                              |
    |                              |                              |
    |-- Socket.IO emit ----------->|                              |
    |   "remote-control-event"     |                              |
    |                              |-- Relay event -------------->|
    |                              |   Socket.IO emit             |
    |                              |                              |
    |                              |                         Input Injection
    |                              |                         (Touch/Keyboard)
```

### 2.2. Backend Changes

#### 2.2.1. Socket.IO Event Handlers

**File: `server/index.ts`**

```typescript
// Remote control events
socket.on("remote-control-event", (data) => {
  const { targetDeviceId, eventType, eventData } = data;

  logger.info(
    `Remote control event: ${eventType} for device: ${targetDeviceId}`,
  );

  // Relay to target device
  emitToDevice(targetDeviceId, "control-event", {
    type: eventType,
    data: eventData,
    timestamp: Date.now(),
  });
});
```

#### 2.2.2. API Endpoints

**File: `server/routes/devices.routes.ts`**

```typescript
/**
 * POST /api/devices/:id/inject-touch
 * Inject touch event to device
 */
router.post(
  "/:id/inject-touch",
  canControlDevices,
  auditLog({ action: "devices.injectTouch", targetType: "device" }),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const device = await Device.findByPk(req.params.id);

      if (!device) {
        res.status(404).json({ error: "Device not found" });
        return;
      }

      const { action, x, y } = req.body; // action: down, up, move

      const sent = emitToDevice(device.device_id, "touch-event", {
        action,
        x,
        y,
        timestamp: Date.now(),
      });

      if (sent) {
        res.json({ message: "Touch event sent" });
      } else {
        res.status(500).json({ error: "Failed to send touch event" });
      }
    } catch (error) {
      logger.error("Inject touch error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

/**
 * POST /api/devices/:id/inject-keyboard
 * Inject keyboard input to device
 */
router.post(
  "/:id/inject-keyboard",
  canControlDevices,
  auditLog({ action: "devices.injectKeyboard", targetType: "device" }),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const device = await Device.findByPk(req.params.id);

      if (!device) {
        res.status(404).json({ error: "Device not found" });
        return;
      }

      const { text, keyCode } = req.body;

      const sent = emitToDevice(device.device_id, "keyboard-event", {
        text,
        keyCode,
        timestamp: Date.now(),
      });

      if (sent) {
        res.json({ message: "Keyboard event sent" });
      } else {
        res.status(500).json({ error: "Failed to send keyboard event" });
      }
    } catch (error) {
      logger.error("Inject keyboard error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);
```

### 2.3. Frontend Remote Control Component

**File: `client/src/app/pages/remote-control/remote-control.component.ts`**

```typescript
import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  HostListener,
} from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { SocketService } from "../../core/services/socket.service";
import { ApiService } from "../../core/services/api.service";

@Component({
  selector: "app-remote-control",
  templateUrl: "./remote-control.component.html",
  styleUrls: ["./remote-control.component.scss"],
})
export class RemoteControlComponent implements OnInit {
  @ViewChild("controlCanvas", { static: true })
  canvas!: ElementRef<HTMLCanvasElement>;

  deviceId!: string;
  isControlActive = false;

  private ctx!: CanvasRenderingContext2D;
  private lastTouch: { x: number; y: number } | null = null;

  constructor(
    private route: ActivatedRoute,
    private socketService: SocketService,
    private apiService: ApiService,
  ) {}

  ngOnInit(): void {
    this.deviceId = this.route.snapshot.params["id"];
    this.ctx = this.canvas.nativeElement.getContext("2d")!;

    // Setup canvas event listeners
    this.setupCanvasListeners();
  }

  private setupCanvasListeners(): void {
    const canvas = this.canvas.nativeElement;

    // Mouse events
    canvas.addEventListener("mousedown", (e) => this.handleTouchStart(e));
    canvas.addEventListener("mousemove", (e) => this.handleTouchMove(e));
    canvas.addEventListener("mouseup", (e) => this.handleTouchEnd(e));

    // Touch events for mobile
    canvas.addEventListener("touchstart", (e) => {
      e.preventDefault();
      this.handleTouchStart(e.touches[0]);
    });
    canvas.addEventListener("touchmove", (e) => {
      e.preventDefault();
      this.handleTouchMove(e.touches[0]);
    });
    canvas.addEventListener("touchend", (e) => {
      e.preventDefault();
      this.handleTouchEnd(e.changedTouches[0]);
    });
  }

  private handleTouchStart(e: MouseEvent | Touch): void {
    if (!this.isControlActive) return;

    const coords = this.getCanvasCoordinates(e);
    this.lastTouch = coords;

    this.sendTouchEvent("down", coords.x, coords.y);
  }

  private handleTouchMove(e: MouseEvent | Touch): void {
    if (!this.isControlActive || !this.lastTouch) return;

    const coords = this.getCanvasCoordinates(e);
    this.sendTouchEvent("move", coords.x, coords.y);
  }

  private handleTouchEnd(e: MouseEvent | Touch): void {
    if (!this.isControlActive) return;

    const coords = this.getCanvasCoordinates(e);
    this.sendTouchEvent("up", coords.x, coords.y);
    this.lastTouch = null;
  }

  private getCanvasCoordinates(e: MouseEvent | Touch): {
    x: number;
    y: number;
  } {
    const rect = this.canvas.nativeElement.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  private sendTouchEvent(action: string, x: number, y: number): void {
    this.socketService.emit("remote-control-event", {
      targetDeviceId: this.deviceId,
      eventType: "touch",
      eventData: { action, x, y },
    });
  }

  @HostListener("window:keydown", ["$event"])
  handleKeyDown(event: KeyboardEvent): void {
    if (!this.isControlActive) return;

    this.sendKeyboardEvent(event.key, event.keyCode);
    event.preventDefault();
  }

  private sendKeyboardEvent(key: string, keyCode: number): void {
    this.apiService
      .post(`/devices/${this.deviceId}/inject-keyboard`, {
        text: key,
        keyCode: keyCode,
      })
      .subscribe();
  }

  toggleControl(): void {
    this.isControlActive = !this.isControlActive;
  }
}
```

---

## 🚀 3. TESTING GUIDE

### 3.1. Screen Streaming Test

1. Start backend server
2. Connect Android device
3. Open web admin and navigate to device screen viewer
4. Click "Start Stream"
5. Verify frames are being received and displayed
6. Check FPS counter
7. Test quality settings (low/medium/high)
8. Click "Stop Stream"

### 3.2. Remote Control Test

1. Start screen streaming
2. Enable remote control mode
3. Test touch events:
   - Single tap
   - Long press
   - Swipe gestures
   - Multi-touch (if supported)
4. Test keyboard input
5. Verify responsiveness and latency

### 3.3. Performance Metrics

**Target values:**

- Screen streaming FPS: 5-15 FPS
- Latency: < 500ms
- Touch response: < 200ms
- CPU usage: < 30%
- Network bandwidth: 100-500 KB/s

---

## 📱 4. ANDROID CLIENT REQUIREMENTS

### 4.1. Required Permissions

```xml
<uses-permission android:name="android.permission.CAPTURE_VIDEO_OUTPUT" />
<uses-permission android:name="android.permission.CAPTURE_SECURE_VIDEO_OUTPUT" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
```

### 4.2. Screen Capture Implementation

```java
// MediaProjection API for screen capture
MediaProjectionManager projectionManager =
    (MediaProjectionManager) getSystemService(Context.MEDIA_PROJECTION_SERVICE);

Intent captureIntent = projectionManager.createScreenCaptureIntent();
startActivityForResult(captureIntent, REQUEST_CODE);
```

### 4.3. Input Injection Implementation

**Option 1: Accessibility Service**

- Requires ACCESSIBILITY_SERVICE permission
- Can inject touch and keyboard events
- Works on non-rooted devices

**Option 2: Root Access**

- Direct input injection via /dev/input
- Faster and more reliable
- Requires rooted device

---

## 🔒 5. SECURITY CONSIDERATIONS

### 5.1. Authentication

- Verify user permissions before streaming
- Token-based authentication for stream access
- Session timeout for idle streams

### 5.2. Encryption

- Use HTTPS for all API calls
- Consider encrypting screen frames
- Secure WebSocket connections

### 5.3. Privacy

- Notify user when screen is being captured
- Show persistent notification
- Option to disable sensitive content

### 5.4. Rate Limiting

- Limit frame rate to prevent DoS
- Throttle remote control events
- Monitor bandwidth usage

---

**Document Version**: 1.0  
**Last Updated**: 21/10/2025  
**Status**: Implementation Ready
