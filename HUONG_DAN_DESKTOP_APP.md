# HƯỚNG DẪN CHUYỂN ĐỔI WEB APP SANG DESKTOP APP

## 📦 1. TỔNG QUAN

### 1.1. Lựa chọn Framework

**Option 1: Electron (Khuyến nghị)**

- ✅ Phổ biến nhất, cộng đồng lớn
- ✅ Dễ tích hợp với Angular
- ✅ Cross-platform (Windows, macOS, Linux)
- ✅ Auto-update built-in
- ❌ Kích thước app lớn (~150MB)

**Option 2: Tauri**

- ✅ Nhẹ hơn Electron (~10MB)
- ✅ Bảo mật tốt hơn
- ✅ Rust-based, hiệu năng cao
- ❌ Ít tài liệu hơn
- ❌ Phức tạp hơn để setup

**Quyết định: Sử dụng Electron do dễ triển khai và tài liệu đầy đủ**

---

## 🚀 2. TRIỂN KHAI ELECTRON

### 2.1. Cài đặt Dependencies

**File: `package.json` (root)**

```json
{
  "name": "dogerat-admin-desktop",
  "version": "2.0.0",
  "main": "electron/main.js",
  "scripts": {
    "electron": "electron .",
    "electron:build": "npm run client:build && electron-builder",
    "electron:dev": "concurrently \"npm run dev\" \"wait-on http://localhost:5000 && electron .\""
  },
  "devDependencies": {
    "electron": "^28.0.0",
    "electron-builder": "^24.9.1",
    "concurrently": "^8.2.2",
    "wait-on": "^7.2.0"
  },
  "build": {
    "appId": "com.dogerat.admin",
    "productName": "DogeRat Admin",
    "directories": {
      "output": "dist-electron"
    },
    "files": ["electron/**/*", "client/dist/**/*", "dist/**/*"],
    "win": {
      "target": ["nsis"],
      "icon": "assets/icon.ico"
    },
    "mac": {
      "target": ["dmg"],
      "icon": "assets/icon.icns"
    },
    "linux": {
      "target": ["AppImage"],
      "icon": "assets/icon.png"
    }
  }
}
```

### 2.2. Electron Main Process

**File: `electron/main.js`**

```javascript
const { app, BrowserWindow, ipcMain, Menu } = require("electron");
const path = require("path");
const url = require("url");

let mainWindow;
let serverProcess;

// Environment configuration
const isDev = process.env.NODE_ENV === "development";
const serverUrl = process.env.SERVER_URL || "http://localhost:5000";

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    icon: path.join(__dirname, "../assets/icon.png"),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
    show: false, // Don't show until ready
    backgroundColor: "#1a1a2e", // Match dark theme
  });

  // Load the app
  if (isDev) {
    // Development: Load from Angular dev server
    mainWindow.loadURL("http://localhost:4200");
    mainWindow.webContents.openDevTools();
  } else {
    // Production: Load from built files
    mainWindow.loadFile(path.join(__dirname, "../client/dist/index.html"));
  }

  // Show window when ready
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  // Handle window closed
  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  // Create application menu
  createMenu();
}

function createMenu() {
  const template = [
    {
      label: "File",
      submenu: [
        {
          label: "Settings",
          click: () => {
            mainWindow.webContents.send("navigate", "/settings");
          },
        },
        { type: "separator" },
        {
          label: "Exit",
          click: () => {
            app.quit();
          },
        },
      ],
    },
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "forcereload" },
        { type: "separator" },
        { role: "toggledevtools" },
        { type: "separator" },
        { role: "togglefullscreen" },
      ],
    },
    {
      label: "Devices",
      submenu: [
        {
          label: "Device List",
          click: () => {
            mainWindow.webContents.send("navigate", "/devices");
          },
        },
        {
          label: "Refresh",
          click: () => {
            mainWindow.webContents.send("refresh-devices");
          },
        },
      ],
    },
    {
      label: "Help",
      submenu: [
        {
          label: "Documentation",
          click: () => {
            require("electron").shell.openExternal("https://docs.dogerat.com");
          },
        },
        {
          label: "About",
          click: () => {
            showAboutDialog();
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function showAboutDialog() {
  const { dialog } = require("electron");
  dialog.showMessageBox(mainWindow, {
    type: "info",
    title: "About DogeRat Admin",
    message: "DogeRat Web Admin v2.0",
    detail:
      "Advanced Android Device Management Platform\n\n" +
      "Version: 2.0.0\n" +
      "License: Educational Use Only\n\n" +
      "© 2025 DogeRat Team",
    buttons: ["OK"],
  });
}

// Start embedded server (optional)
function startEmbeddedServer() {
  if (!isDev) {
    const { spawn } = require("child_process");
    const serverPath = path.join(__dirname, "../dist/index.js");

    serverProcess = spawn("node", [serverPath], {
      env: {
        ...process.env,
        NODE_ENV: "production",
        PORT: "5000",
      },
    });

    serverProcess.stdout.on("data", (data) => {
      console.log(`Server: ${data}`);
    });

    serverProcess.stderr.on("data", (data) => {
      console.error(`Server Error: ${data}`);
    });
  }
}

// App lifecycle
app.whenReady().then(() => {
  startEmbeddedServer();

  // Wait for server to be ready
  setTimeout(
    () => {
      createWindow();
    },
    isDev ? 0 : 2000,
  );

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  // Stop server process
  if (serverProcess) {
    serverProcess.kill();
  }
});

// IPC Handlers
ipcMain.handle("get-server-url", () => {
  return serverUrl;
});

ipcMain.handle("get-app-version", () => {
  return app.getVersion();
});

ipcMain.on("minimize-window", () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});

ipcMain.on("maximize-window", () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.on("close-window", () => {
  if (mainWindow) {
    mainWindow.close();
  }
});
```

### 2.3. Preload Script

**File: `electron/preload.js`**

```javascript
const { contextBridge, ipcRenderer } = require("electron");

// Expose protected methods
contextBridge.exposeInMainWorld("electronAPI", {
  // App info
  getServerUrl: () => ipcRenderer.invoke("get-server-url"),
  getAppVersion: () => ipcRenderer.invoke("get-app-version"),

  // Window controls
  minimizeWindow: () => ipcRenderer.send("minimize-window"),
  maximizeWindow: () => ipcRenderer.send("maximize-window"),
  closeWindow: () => ipcRenderer.send("close-window"),

  // Navigation
  onNavigate: (callback) => {
    ipcRenderer.on("navigate", (event, route) => callback(route));
  },

  // Device refresh
  onRefreshDevices: (callback) => {
    ipcRenderer.on("refresh-devices", () => callback());
  },
});
```

### 2.4. TypeScript Definitions

**File: `client/src/types/electron.d.ts`**

```typescript
export interface ElectronAPI {
  getServerUrl: () => Promise<string>;
  getAppVersion: () => Promise<string>;
  minimizeWindow: () => void;
  maximizeWindow: () => void;
  closeWindow: () => void;
  onNavigate: (callback: (route: string) => void) => void;
  onRefreshDevices: (callback: () => void) => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
```

### 2.5. Angular Integration

**File: `client/src/app/core/services/electron.service.ts`**

```typescript
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";

@Injectable({
  providedIn: "root",
})
export class ElectronService {
  private isElectron = false;

  constructor(private router: Router) {
    this.isElectron = this.checkElectron();

    if (this.isElectron) {
      this.setupElectronListeners();
    }
  }

  private checkElectron(): boolean {
    return !!(window && window.electronAPI);
  }

  public isElectronApp(): boolean {
    return this.isElectron;
  }

  public async getServerUrl(): Promise<string> {
    if (this.isElectron) {
      return await window.electronAPI.getServerUrl();
    }
    return window.location.origin;
  }

  public async getAppVersion(): Promise<string> {
    if (this.isElectron) {
      return await window.electronAPI.getAppVersion();
    }
    return "Web Version";
  }

  public minimizeWindow(): void {
    if (this.isElectron) {
      window.electronAPI.minimizeWindow();
    }
  }

  public maximizeWindow(): void {
    if (this.isElectron) {
      window.electronAPI.maximizeWindow();
    }
  }

  public closeWindow(): void {
    if (this.isElectron) {
      window.electronAPI.closeWindow();
    }
  }

  private setupElectronListeners(): void {
    // Handle navigation from menu
    window.electronAPI.onNavigate((route: string) => {
      this.router.navigate([route]);
    });

    // Handle device refresh
    window.electronAPI.onRefreshDevices(() => {
      // Emit event to refresh devices component
      window.dispatchEvent(new CustomEvent("refresh-devices"));
    });
  }
}
```

### 2.6. Update API Service for Desktop

**File: `client/src/app/core/services/api.service.ts`**

```typescript
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { ElectronService } from "./electron.service";

@Injectable({
  providedIn: "root",
})
export class ApiService {
  private apiUrl = "";

  constructor(
    private http: HttpClient,
    private electronService: ElectronService,
  ) {
    this.initApiUrl();
  }

  private async initApiUrl(): Promise<void> {
    if (this.electronService.isElectronApp()) {
      // Desktop app: use embedded server
      this.apiUrl = await this.electronService.getServerUrl();
    } else {
      // Web app: use current origin
      this.apiUrl = window.location.origin;
    }
  }

  // ... rest of API methods
}
```

---

## 🔨 3. BUILD & PACKAGE

### 3.1. Development Build

```bash
# Install dependencies
npm install

# Build Angular app
npm run client:build

# Build backend
npm run build

# Run Electron in development
npm run electron:dev
```

### 3.2. Production Build

```bash
# Build everything and package
npm run electron:build

# Output will be in dist-electron/
# Windows: DogeRat-Admin-Setup-2.0.0.exe
# macOS: DogeRat-Admin-2.0.0.dmg
# Linux: DogeRat-Admin-2.0.0.AppImage
```

### 3.3. Build Configuration

**File: `electron-builder.yml`** (Optional, alternative to package.json)

```yaml
appId: com.dogerat.admin
productName: DogeRat Admin
copyright: Copyright © 2025 DogeRat Team

directories:
  output: dist-electron

files:
  - electron/**/*
  - client/dist/**/*
  - dist/**/*
  - package.json

win:
  target:
    - target: nsis
      arch:
        - x64
  icon: assets/icon.ico

nsis:
  oneClick: false
  allowToChangeInstallationDirectory: true
  createDesktopShortcut: true
  createStartMenuShortcut: true

mac:
  target:
    - dmg
  icon: assets/icon.icns
  category: public.app-category.utilities

linux:
  target:
    - AppImage
  icon: assets/icon.png
  category: Utility

publish:
  provider: github
  owner: your-org
  repo: dogerat-admin
```

---

## 📱 4. FEATURES FOR DESKTOP APP

### 4.1. Desktop-Specific Features

**System Tray Integration:**

```javascript
const { Tray } = require("electron");

let tray = null;

function createTray() {
  tray = new Tray(path.join(__dirname, "../assets/tray-icon.png"));

  const contextMenu = Menu.buildFromTemplate([
    { label: "Show", click: () => mainWindow.show() },
    { label: "Hide", click: () => mainWindow.hide() },
    { type: "separator" },
    { label: "Quit", click: () => app.quit() },
  ]);

  tray.setContextMenu(contextMenu);
  tray.setToolTip("DogeRat Admin");
}
```

**Auto-Update:**

```javascript
const { autoUpdater } = require("electron-updater");

autoUpdater.on("update-available", () => {
  mainWindow.webContents.send("update-available");
});

autoUpdater.on("update-downloaded", () => {
  mainWindow.webContents.send("update-downloaded");
});

// Check for updates on startup
app.whenReady().then(() => {
  autoUpdater.checkForUpdatesAndNotify();
});
```

**Notifications:**

```javascript
const { Notification } = require("electron");

function showNotification(title, body) {
  new Notification({
    title: title,
    body: body,
    icon: path.join(__dirname, "../assets/icon.png"),
  }).show();
}
```

### 4.2. Local Storage

Desktop app có thể sử dụng local file storage:

```javascript
const Store = require("electron-store");
const store = new Store();

// Save settings
store.set("serverUrl", "http://localhost:5000");
store.set("autoConnect", true);

// Get settings
const serverUrl = store.get("serverUrl");
```

---

## 🧪 5. TESTING

### 5.1. Development Testing

```bash
# Terminal 1: Start backend
npm run dev

# Terminal 2: Start Angular
cd client && npm start

# Terminal 3: Start Electron
npm run electron
```

### 5.2. Production Testing

```bash
# Build and test
npm run electron:build

# Test the installer
# Windows: Install from dist-electron/*.exe
# macOS: Mount dist-electron/*.dmg
# Linux: Run dist-electron/*.AppImage
```

---

## 📦 6. DISTRIBUTION

### 6.1. GitHub Releases

1. Tag version: `git tag v2.0.0`
2. Push tag: `git push --tags`
3. GitHub Actions auto-build and create release
4. Attach installers to release

### 6.2. Auto-Update Setup

```javascript
// In main.js
const { autoUpdater } = require("electron-updater");

autoUpdater.setFeedURL({
  provider: "github",
  owner: "your-org",
  repo: "dogerat-admin",
});

autoUpdater.checkForUpdatesAndNotify();
```

---

## 🎯 7. INSTALLATION GUIDE

### 7.1. Windows Installation

1. Download `DogeRat-Admin-Setup-2.0.0.exe`
2. Run installer
3. Follow installation wizard
4. Desktop shortcut created
5. Launch from Desktop or Start Menu

### 7.2. macOS Installation

1. Download `DogeRat-Admin-2.0.0.dmg`
2. Mount DMG file
3. Drag app to Applications folder
4. Launch from Applications

### 7.3. Linux Installation

1. Download `DogeRat-Admin-2.0.0.AppImage`
2. Make executable: `chmod +x DogeRat-Admin-2.0.0.AppImage`
3. Run: `./DogeRat-Admin-2.0.0.AppImage`

---

## 🔧 8. CONFIGURATION

### 8.1. Settings Page for Desktop

Add settings page in Angular for desktop-specific configuration:

```typescript
// settings.component.ts
export class SettingsComponent {
  serverUrl = "http://localhost:5000";
  autoStart = false;
  minimizeToTray = true;

  async saveSettings(): Promise<void> {
    if (this.electronService.isElectronApp()) {
      // Save to electron-store
      // IPC call to main process
    }
  }
}
```

---

## 📊 9. COMPARISON: WEB vs DESKTOP

| Feature       | Web App           | Desktop App           |
| ------------- | ----------------- | --------------------- |
| Installation  | None              | Required              |
| Updates       | Automatic         | Auto-update or manual |
| Performance   | Browser-dependent | Native, faster        |
| System Access | Limited           | Full access           |
| Offline Mode  | Limited           | Possible              |
| File System   | Restricted        | Full access           |
| Notifications | Browser-based     | Native OS             |
| System Tray   | No                | Yes                   |
| Auto-start    | No                | Yes                   |

---

## ⚡ 10. OPTIMIZATION

### 10.1. Bundle Size Reduction

```javascript
// In electron-builder config
{
  "asar": true,
  "asarUnpack": ["**/*.node"],
  "compression": "maximum"
}
```

### 10.2. Performance Tips

1. Use code splitting in Angular
2. Lazy load modules
3. Enable production mode
4. Minify JavaScript
5. Optimize images
6. Use Brotli compression

---

**Document Version**: 1.0  
**Last Updated**: 21/10/2025  
**Estimated Implementation Time**: 3-5 days  
**Status**: Ready for Implementation
