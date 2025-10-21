# DogeRat Production Transformation Plan

**Version**: 3.1.0  
**Status**: Implementation in Progress  
**Target Completion**: 8 weeks (4 milestones)

---

## 🎯 Executive Summary

This document outlines the comprehensive transformation plan to convert DogeRat from a development/demo system to a **legal, secure, and production-ready** platform suitable for enterprise deployment.

### Core Principles

1. **Legal & Transparent**: Only manage systems with written authorization and consent logs
2. **Security First**: Strong authentication, RBAC, end-to-end encryption, no anonymous tunnels
3. **100% Feature Parity**: Desktop app must fully reflect server capabilities via standardized APIs
4. **Observable & Traceable**: Immutable audit logs, security alerts, kill-switch capability

---

## 📋 Milestone Overview

| Milestone | Duration | Status | Description |
|-----------|----------|--------|-------------|
| **M1** | 2 weeks | 🟡 In Progress | Foundation: Docker, OpenAPI, Zero-Trust, CI/CD |
| **M2** | 3 weeks | ⚪ Planned | Command Model, Testing, Desktop Skeleton |
| **M3** | 2 weeks | ⚪ Planned | Security Hardening, Observability, SBOM |
| **M4** | 1-2 weeks | ⚪ Planned | Desktop App, Code Signing, Release |

---

## 🚀 Milestone 1: Foundation (Weeks 1-2)

**Status**: 🟡 In Progress

### Objectives

- ✅ Optimize Docker builds for security and minimal footprint
- ✅ Create comprehensive OpenAPI 3.1 specification
- ✅ Implement Zero-Trust alternatives to ngrok
- ✅ Establish CI/CD pipeline with security scanning
- ⚪ Create desktop app skeleton with authentication

### Completed Tasks

#### 1.1 Docker Optimization ✅

**Files Modified**:
- `server/Dockerfile` - Enhanced multi-stage build with non-root user
- `client/Dockerfile` - Security-hardened nginx with non-root user
- `client/nginx.conf` - Added comprehensive security headers

**Improvements**:
- Non-root user execution (nodejs:nodejs, nginx:nginx)
- Minimal Alpine-based images
- Security headers (CSP, X-Frame-Options, etc.)
- Health checks with proper timeouts
- Build-time dependencies separated from runtime

**Security Benefits**:
- Reduced attack surface (minimal base images)
- Principle of least privilege (non-root)
- Defense in depth (multiple security layers)

#### 1.2 OpenAPI 3.1 Specification ✅

**File Created**: `docs/openapi-v3.1.yaml`

**Features**:
- Complete API documentation for all endpoints
- Idempotency support with `request_id`
- Command status lifecycle (QUEUED → RUNNING → SUCCEEDED/FAILED)
- SSE endpoint specification for real-time updates
- Comprehensive schemas for all models
- Security schemes (JWT Bearer authentication)
- RBAC documentation (Admin, Manager, Operator, Viewer)

**Benefits**:
- Auto-generate client SDKs (TypeScript, Rust, C#)
- Contract testing to ensure feature parity
- Clear API versioning strategy (/v1)
- Developer-friendly documentation

#### 1.3 Zero-Trust Gateway Configuration ✅

**Files Created**:
- `cloudflared.yml` - Cloudflare Tunnel configuration
- `docker-compose.tailscale.yml` - Tailscale mesh network setup

**Cloudflare Tunnel Benefits**:
- mTLS between tunnel and origin
- OIDC/SSO authentication before API access
- Access logs and fine-grained policies
- No public exposure without authentication
- WAF capabilities

**Tailscale Benefits**:
- WireGuard-based encrypted mesh
- Direct peer-to-peer connections
- MagicDNS for service discovery
- ACL-based access control
- Works behind NAT/firewalls

#### 1.4 CI/CD with Security Scanning ✅

**File Created**: `.github/workflows/ci-cd-security.yml`

**Pipeline Stages**:
1. **Lint & Type Check**: TypeScript validation, Prettier formatting
2. **SCA (Supply Chain Analysis)**: 
   - npm audit for vulnerable dependencies
   - Syft SBOM generation (SPDX format)
   - Grype vulnerability scanning
3. **Secret Scanning**: TruffleHog for exposed credentials
4. **SAST (Static Analysis)**: CodeQL security queries
5. **Unit/Integration Tests**: Full test suite with PostgreSQL
6. **E2E Tests**: Playwright browser tests
7. **Docker Build & Scan**: Trivy + Grype container scanning
8. **Sign & Push**: Cosign image signing, SBOM attachment
9. **DAST (Dynamic Analysis)**: OWASP ZAP baseline scan

**Security Coverage**:
- ✅ Dependency vulnerabilities (SCA)
- ✅ Secret leaks (Secret scanning)
- ✅ Code vulnerabilities (SAST)
- ✅ Container vulnerabilities (Trivy/Grype)
- ✅ Runtime vulnerabilities (DAST)
- ✅ Supply chain integrity (SBOM + signing)

#### 1.5 Enhanced Command Model ✅

**File Modified**: `server/models/Command.ts`

**New Features**:
- `request_id` field for idempotency (UUID, unique index)
- Enhanced status enum: QUEUED, RUNNING, SUCCEEDED, FAILED
- `retry_count` field for tracking retries
- Proper indexing for performance

**Idempotency Pattern**:
```typescript
// Client sends request with ID
POST /api/devices/123/command
X-Request-ID: 550e8400-e29b-41d4-a716-446655440000
{
  "command": "screenshot",
  "params": {}
}

// If same request_id sent again, server returns cached result
// HTTP 409 with original command status
```

### Remaining M1 Tasks

#### 1.6 Desktop App Skeleton (Planned)

**Technology Decision**: Tauri vs Electron

| Factor | Tauri | Electron |
|--------|-------|----------|
| Bundle Size | ~3-10 MB | ~100-150 MB |
| Memory | ~50 MB | ~100-200 MB |
| Security | Rust backend, no Node runtime | Node.js runtime risks |
| Ecosystem | Smaller, newer | Mature, extensive |
| Auto-update | Built-in | electron-updater |
| Code Signing | tauri-action | electron-builder |

**Recommendation**: Tauri for minimal footprint and security

**Skeleton Features**:
- Login screen with JWT authentication
- Connection status indicator
- Basic API client with retry logic
- Settings panel (server URL, theme)
- Auto-update mechanism (with signature verification)

**File Structure**:
```
desktop/
├── src-tauri/          # Rust backend
│   ├── src/
│   │   ├── main.rs     # App entry point
│   │   ├── api.rs      # HTTP client
│   │   └── auth.rs     # JWT handling
│   ├── Cargo.toml      # Rust dependencies
│   └── tauri.conf.json # App config
├── src/                # Frontend (React/Vue/Svelte)
│   ├── pages/
│   │   ├── Login.tsx
│   │   └── Dashboard.tsx
│   └── api/
│       └── client.ts   # API wrapper
└── package.json
```

---

## 🔄 Milestone 2: Command Model & Testing (Weeks 3-5)

**Status**: ⚪ Planned

### Objectives

- Implement robust idempotent command execution
- Add real-time status streaming (SSE/WebSocket)
- Create Command Center UI for desktop app
- Implement contract tests for API parity
- Add comprehensive E2E test coverage

### 2.1 Idempotent Command Execution

**Server Implementation**:
```typescript
// Middleware to check for duplicate request_id
async function checkIdempotency(req, res, next) {
  const requestId = req.headers['x-request-id'] || req.body.request_id;
  
  if (requestId) {
    const existing = await Command.findOne({ 
      where: { request_id: requestId } 
    });
    
    if (existing) {
      // Return cached response
      return res.status(409).json({
        message: 'Duplicate request',
        command: existing,
        duplicate: true
      });
    }
  }
  
  next();
}
```

**State Machine**:
```
QUEUED ──> PENDING ──> RUNNING ──> SUCCEEDED
                │          │
                │          └──> FAILED
                │
                └──> TIMEOUT
```

### 2.2 Real-Time Status Updates

**SSE Endpoint**: `/api/commands/stream`

```typescript
// Server
app.get('/api/commands/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  const listener = (command: Command) => {
    res.write(`event: command-update\n`);
    res.write(`data: ${JSON.stringify(command)}\n\n`);
  };
  
  eventEmitter.on('command:update', listener);
  
  req.on('close', () => {
    eventEmitter.off('command:update', listener);
  });
});
```

**Desktop Client**:
```typescript
// Auto-reconnecting SSE client
const eventSource = new EventSource('/api/commands/stream', {
  headers: { Authorization: `Bearer ${token}` }
});

eventSource.addEventListener('command-update', (e) => {
  const command = JSON.parse(e.data);
  updateCommandStatus(command);
});
```

### 2.3 Command Center UI

**Features**:
- Command queue visualization (pending, running)
- Live status updates with progress indicators
- Command history with filters (date, device, status)
- Retry failed commands with exponential backoff
- Bulk command operations
- Safety confirmations for dangerous commands

### 2.4 Contract Testing

**Tools**: Pact or Dredd

```yaml
# Example Pact contract
interactions:
  - description: Send screenshot command
    request:
      method: POST
      path: /api/devices/abc-123/command
      headers:
        Authorization: Bearer token
      body:
        command: screenshot
        request_id: 550e8400-e29b-41d4-a716-446655440000
    response:
      status: 200
      body:
        command:
          id: matching(type, "uuid")
          status: "queued"
```

### 2.5 E2E Test Coverage

**Scenarios**:
- User login → view devices → send command → view result
- Command retry after network failure
- Idempotency: duplicate request returns same result
- Real-time updates: command status changes reflected in UI
- Offline mode: commands queued locally, synced when online
- Permission denial: operator can't access user management

---

## 🔒 Milestone 3: Security & Observability (Weeks 6-7)

**Status**: ⚪ Planned

### Objectives

- Enhance RBAC with Just-In-Time (JIT) access
- Implement immutable audit logs
- Add OpenTelemetry instrumentation
- Harden Docker images (distroless)
- Generate and sign SBOMs

### 3.1 Just-In-Time Access

**Concept**: Temporary elevation for sensitive operations

```typescript
// Request elevated access
POST /api/auth/request-elevation
{
  "reason": "Need to delete device ABC-123",
  "duration_minutes": 15,
  "operations": ["device.delete"]
}

// Response: temporary token with elevated permissions
{
  "elevated_token": "eyJ...",
  "expires_at": "2024-01-01T12:15:00Z",
  "permissions": ["device.delete"]
}
```

### 3.2 Immutable Audit Logs

**Implementation Options**:
- **S3 Object Lock**: Write-Once-Read-Many (WORM)
- **Blockchain**: Tamper-proof audit trail
- **Append-only database**: PostgreSQL with triggers preventing updates/deletes

**Log Structure**:
```json
{
  "id": "uuid",
  "timestamp": "2024-01-01T12:00:00Z",
  "user_id": "uuid",
  "action": "command.execute",
  "target_id": "device-uuid",
  "request_id": "command-request-id",
  "result": "success",
  "ip_address": "1.2.3.4",
  "user_agent": "DogeRat-Desktop/1.0",
  "hash_previous": "sha256-of-previous-log",
  "signature": "digital-signature"
}
```

### 3.3 OpenTelemetry

**Instrumentation**:
```typescript
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

const sdk = new NodeSDK({
  serviceName: 'dogerat-server',
  traceExporter: new OTLPTraceExporter(),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter()
  }),
  instrumentations: [getNodeAutoInstrumentations()]
});

sdk.start();
```

**Metrics to Track**:
- Request rate, latency, error rate (RED metrics)
- Command queue depth
- Device connection count
- Database query performance
- WebSocket connection health

### 3.4 Distroless Docker Images

**Benefits**:
- No shell, package manager, or unnecessary binaries
- Minimal attack surface (~20 MB vs ~50 MB Alpine)
- Only application dependencies

```dockerfile
# Use Google's distroless image
FROM gcr.io/distroless/nodejs20-debian12

COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/node_modules /app/node_modules

USER nonroot:nonroot

CMD ["/app/dist/index.js"]
```

### 3.5 SBOM Generation & Signing

**Process**:
1. Generate SBOM: `syft <image> -o spdx-json > sbom.json`
2. Sign SBOM: `cosign sign-blob --key cosign.key sbom.json > sbom.sig`
3. Attach to image: `cosign attach sbom --sbom sbom.json <image>`
4. Verify: `cosign verify --key cosign.pub <image>`

---

## 🖥️ Milestone 4: Desktop App & Release (Weeks 8-9)

**Status**: ⚪ Planned

### Objectives

- Complete Windows desktop application
- Implement code signing with EV certificate
- Add secure auto-update mechanism
- Create MSI/MSIX installers
- Pilot release with go-live checklist

### 4.1 Desktop App Features

**Core Capabilities** (100% API parity):
- ✅ Device management (list, view details, delete)
- ✅ Command execution (all 20+ command types)
- ✅ Real-time status updates
- ✅ Command history and filtering
- ✅ User management (admin only)
- ✅ Audit log viewer
- ✅ Settings (server URL, theme, notifications)

**Safety Features**:
- ⚠️ Confirmation dialogs for dangerous commands
- 🔐 Re-authentication for admin operations
- 📊 Command queue visibility
- 🚨 Connection status indicators
- 💾 Offline queue (sync when reconnected)

### 4.2 Code Signing

**EV Certificate** (Extended Validation):
- Required for Windows SmartScreen reputation
- Must be on hardware token (USB)
- Issued by trusted CA (DigiCert, Sectigo)

**Signing Process**:
```bash
# Sign with SignTool (Windows SDK)
signtool sign /f cert.pfx /p password /tr http://timestamp.digicert.com /td sha256 /fd sha256 installer.msi

# Or use tauri-action (GitHub Actions)
uses: tauri-apps/tauri-action@v0
with:
  signingIdentity: ${{ secrets.APPLE_SIGNING_IDENTITY }}
  signingPassword: ${{ secrets.APPLE_SIGNING_PASSWORD }}
```

### 4.3 Auto-Update

**Tauri Updater**:
```json
// tauri.conf.json
{
  "updater": {
    "active": true,
    "endpoints": [
      "https://releases.dogerat.com/{{target}}/{{current_version}}"
    ],
    "pubkey": "dW50cnVzdGVkIGNvbW1lbnQ6IG1pbmlzaWdu...",
    "windows": {
      "installMode": "passive"
    }
  }
}
```

**Security**:
- ✅ Signature verification (Ed25519)
- ✅ HTTPS only
- ✅ Rollback protection
- ✅ User consent required

### 4.4 Installer Creation

**MSIX** (Modern Windows):
- Installed from Microsoft Store or sideloaded
- Automatic updates via Store
- Sandboxed execution

**MSI** (Traditional):
- Better compatibility (Windows 7+)
- Group Policy deployment
- Silent install support

**WiX Toolset** example:
```xml
<Product Id="*" Name="DogeRat Desktop" Version="1.0.0">
  <Package InstallerVersion="200" Compressed="yes" />
  <Media Id="1" Cabinet="media1.cab" EmbedCab="yes" />
  
  <Directory Id="TARGETDIR" Name="SourceDir">
    <Directory Id="ProgramFilesFolder">
      <Directory Id="INSTALLDIR" Name="DogeRat">
        <Component Id="MainExecutable">
          <File Id="DogeRatExe" Source="dogerat.exe" KeyPath="yes" />
        </Component>
      </Directory>
    </Directory>
  </Directory>
</Product>
```

### 4.5 Go-Live Checklist

**Pre-Release**:
- [ ] All tests passing (unit, integration, E2E)
- [ ] Security scans clean (SAST, DAST, SCA)
- [ ] Performance benchmarks met (API <200ms p95)
- [ ] Load testing completed (1000 concurrent devices)
- [ ] Disaster recovery tested (backup/restore)
- [ ] Documentation complete (API, user manual, admin guide)

**Security Validation**:
- [ ] Penetration testing completed
- [ ] Vulnerability disclosure policy published
- [ ] Incident response plan documented
- [ ] Security contact published (security@dogerat.com)
- [ ] GDPR/privacy policy if handling personal data

**Operational Readiness**:
- [ ] Monitoring dashboards configured (Grafana)
- [ ] Alerting rules set (PagerDuty/Slack)
- [ ] Log aggregation working (Loki/Elasticsearch)
- [ ] Backup strategy tested (daily, 30-day retention)
- [ ] Runbooks documented (restart, rollback, scale)

**Legal & Compliance**:
- [ ] Terms of Service published
- [ ] Privacy Policy published
- [ ] Consent mechanism implemented
- [ ] Data retention policy defined
- [ ] Right to deletion implemented (GDPR)

**Release**:
- [ ] Beta testing with 5-10 users (2 weeks)
- [ ] Release notes published
- [ ] Migration guide (if upgrading from v2.0)
- [ ] Support channels ready (email, Discord, GitHub)
- [ ] Rollback plan prepared

---

## 📊 Success Metrics

### Security
- **Zero critical vulnerabilities** in production
- **100% audit coverage** for sensitive operations
- **<5 minutes** to revoke access (kill-switch)
- **100% TLS** for all communications

### Performance
- **<200ms p95 latency** for API calls
- **<1s** command delivery to device
- **1000+ concurrent devices** supported
- **99.9% uptime** SLA

### Quality
- **85%+ test coverage** (maintained)
- **Zero data loss** events
- **<1 hour** mean time to recovery (MTTR)
- **Weekly security scans** (automated)

### Compliance
- **100% consent logs** for all managed devices
- **Written authorization** on file for all deployments
- **Audit trail retention** 90+ days
- **Privacy policy** published and followed

---

## 🚀 Getting Started

### For Developers

1. **Review OpenAPI spec**: `docs/openapi-v3.1.yaml`
2. **Run CI locally**: `act` (GitHub Actions locally)
3. **Check security**: `npm audit && docker scan`
4. **Generate SBOM**: `syft . -o spdx-json`

### For Operators

1. **Choose access method**: Cloudflare Tunnel or Tailscale
2. **Configure auth**: OIDC/OAuth2 or mTLS
3. **Set up monitoring**: OpenTelemetry + Grafana
4. **Enable audit logs**: Immutable storage (S3 WORM)

### For Users

1. **Download desktop app**: https://releases.dogerat.com
2. **Verify signature**: `cosign verify ...`
3. **Login**: Use company SSO
4. **Grant consent**: Accept device management terms

---

## 📞 Support & Contact

- **Security Issues**: security@dogerat.com (GPG key available)
- **Documentation**: https://docs.dogerat.com
- **GitHub Issues**: https://github.com/your-org/dogerat/issues
- **Discord**: https://discord.gg/dogerat

---

## 📄 License & Legal

This software is licensed under the MIT License. **Use responsibly and legally**.

**⚠️ Legal Notice**: This tool must only be used on devices you own or have explicit written authorization to manage. Unauthorized access to devices is illegal. The developers assume no liability for misuse.

**Privacy**: If managing devices with personal data, ensure GDPR/CCPA compliance:
- Publish privacy policy
- Obtain explicit consent
- Implement right to deletion
- Maintain consent audit trail
- Appoint DPO if required

---

**Document Version**: 1.0  
**Last Updated**: 2024-01-01  
**Next Review**: 2024-02-01
