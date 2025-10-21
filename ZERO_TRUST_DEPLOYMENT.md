# Zero-Trust Deployment Guide

**Status**: Production-Ready  
**Last Updated**: 2024-01-01  
**Difficulty**: Intermediate to Advanced

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Option 1: Cloudflare Tunnel](#option-1-cloudflare-tunnel-recommended)
4. [Option 2: Tailscale Mesh](#option-2-tailscale-mesh-network)
5. [Option 3: Reverse Proxy with mTLS](#option-3-reverse-proxy-with-mtls)
6. [Security Configuration](#security-configuration)
7. [Monitoring & Alerting](#monitoring--alerting)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

This guide replaces the insecure ngrok tunnel with production-ready Zero-Trust alternatives that provide:

- ✅ **Authentication before access** (OIDC/SSO or mTLS)
- ✅ **Encrypted tunnels** (TLS 1.3 or WireGuard)
- ✅ **Access control** (IP allowlists, user groups, device posture)
- ✅ **Audit logging** (who accessed what, when)
- ✅ **DDoS protection** (Cloudflare)
- ✅ **No anonymous public exposure**

### Why Not ngrok?

| Issue                   | ngrok      | Cloudflare Tunnel | Tailscale            |
| ----------------------- | ---------- | ----------------- | -------------------- |
| Authentication Required | ❌ No      | ✅ OIDC/SSO       | ✅ Tailscale auth    |
| mTLS Support            | ⚠️ Limited | ✅ Yes            | ✅ WireGuard         |
| Access Logs             | ⚠️ Basic   | ✅ Complete       | ✅ Complete          |
| Free Tier               | ✅ Yes     | ✅ Yes            | ✅ Yes (100 devices) |
| DDoS Protection         | ❌ No      | ✅ Yes            | ⚠️ N/A (private)     |
| ACL Support             | ❌ No      | ✅ Yes            | ✅ Yes               |

---

## 📦 Prerequisites

### All Options

- Docker & Docker Compose installed
- Domain name (for Cloudflare) or Tailscale account
- DogeRat server running locally

### Option-Specific

- **Cloudflare**: Free Cloudflare account + domain on Cloudflare
- **Tailscale**: Free Tailscale account (up to 100 devices)
- **mTLS**: Certificate Authority (Let's Encrypt or internal CA)

---

## 🚀 Option 1: Cloudflare Tunnel (Recommended)

**Best for**: Production deployments, teams, SaaS offerings

### Benefits

- ✅ Free tier available (unlimited bandwidth)
- ✅ DDoS protection included
- ✅ Web Application Firewall (WAF)
- ✅ OIDC/SSO integration (Google, GitHub, Azure AD, Okta, etc.)
- ✅ Granular access policies
- ✅ Complete audit logs

### Step 1: Install cloudflared

```bash
# Linux/macOS
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o cloudflared
chmod +x cloudflared
sudo mv cloudflared /usr/local/bin/

# Or use Docker (included in docker-compose.yml)
```

### Step 2: Authenticate with Cloudflare

```bash
cloudflared tunnel login
```

This opens a browser to authenticate and authorize your Cloudflare account.

### Step 3: Create Tunnel

```bash
# Create tunnel named "dogerat-tunnel"
cloudflared tunnel create dogerat-tunnel

# Note the Tunnel ID and credentials file path
# Example output:
# Tunnel credentials written to: /root/.cloudflared/abc-123-def.json
# Created tunnel dogerat-tunnel with id abc-123-def
```

### Step 4: Configure Tunnel

Edit `cloudflared.yml` and replace `YOUR_TUNNEL_ID`:

```yaml
tunnel: abc-123-def # Your actual tunnel ID
credentials-file: /root/.cloudflared/abc-123-def.json

ingress:
  # API endpoint
  - hostname: api.dogerat.com
    service: http://localhost:5000 # Or http://server:5000 in Docker

  # WebSocket endpoint
  - hostname: ws.dogerat.com
    service: http://localhost:5000

  # Frontend
  - hostname: app.dogerat.com
    service: http://localhost:80

  # Catch-all
  - service: http_status:404
```

### Step 5: Configure DNS

In Cloudflare dashboard:

1. Go to your domain's DNS settings
2. Add CNAME records:
   ```
   api.dogerat.com  CNAME  abc-123-def.cfargotunnel.com
   ws.dogerat.com   CNAME  abc-123-def.cfargotunnel.com
   app.dogerat.com  CNAME  abc-123-def.cfargotunnel.com
   ```

### Step 6: Configure Access Policies

In Cloudflare Zero Trust dashboard (https://one.dash.cloudflare.com/):

1. **Go to Access > Applications**
2. **Add an Application** → Self-hosted
3. Configure:
   ```
   Name: DogeRat API
   Session Duration: 24 hours
   Application Domain: api.dogerat.com
   ```
4. **Add Policy**:

   ```
   Policy Name: Allow Admin Team
   Action: Allow

   Include:
   - Emails: admin@company.com, manager@company.com

   OR

   Include:
   - Email domain: @company.com
   - Group: dogerat-admins (if using IdP groups)
   ```

5. **Repeat for `ws.dogerat.com` and `app.dogerat.com`**

### Step 7: Run Tunnel

#### Option A: Docker Compose (Recommended)

Edit `docker-compose.yml` and uncomment the `cloudflared` service:

```yaml
cloudflared:
  image: cloudflare/cloudflared:latest
  container_name: dogerat-cloudflared
  command: tunnel --config /etc/cloudflared/config.yml run
  volumes:
    - ./cloudflared.yml:/etc/cloudflared/config.yml:ro
    - /root/.cloudflared/abc-123-def.json:/etc/cloudflared/credentials.json:ro
  depends_on:
    - server
  restart: unless-stopped
  networks:
    - dogerat-network
```

Then:

```bash
docker-compose up -d cloudflared
```

#### Option B: Standalone

```bash
cloudflared tunnel --config cloudflared.yml run
```

### Step 8: Test Access

1. Open https://api.dogerat.com/api/health
2. You should be redirected to Cloudflare Access login
3. After login (Google/GitHub/etc.), you'll see the health check response

**Success!** Your API is now protected by Zero-Trust authentication.

### Advanced: mTLS to Origin

For additional security, enable mTLS between Cloudflare and your origin:

1. Generate origin certificate in Cloudflare dashboard
2. Configure nginx to require client certificates
3. Update `cloudflared.yml`:
   ```yaml
   originRequest:
     originServerName: api.dogerat.com
     tlsConfig:
       certPath: /etc/cloudflared/origin-cert.pem
       keyPath: /etc/cloudflared/origin-key.pem
       caPool: /etc/cloudflared/cloudflare-ca.pem
   ```

---

## 🔗 Option 2: Tailscale Mesh Network

**Best for**: Private deployments, small teams, personal use

### Benefits

- ✅ True peer-to-peer (no relay, better latency)
- ✅ WireGuard encryption (fastest VPN protocol)
- ✅ Works behind NAT/firewalls (no port forwarding)
- ✅ MagicDNS (easy service discovery)
- ✅ Free for personal use (up to 100 devices)
- ✅ ACL-based access control

### Step 1: Sign Up for Tailscale

1. Go to https://tailscale.com
2. Sign up with Google/GitHub/Microsoft
3. Note your tailnet name (e.g., `example.ts.net`)

### Step 2: Install Tailscale

#### On Server (Docker)

Use the provided `docker-compose.tailscale.yml`:

```bash
# Get your auth key from https://login.tailscale.com/admin/settings/keys
export TS_AUTHKEY="tskey-auth-xxxxx"

# Start Tailscale sidecar
docker-compose -f docker-compose.tailscale.yml up -d
```

#### On Desktop (Windows/Mac/Linux)

Download from https://tailscale.com/download and install.

### Step 3: Configure ACLs

In Tailscale admin console (https://login.tailscale.com/admin/acls):

```json
{
  "groups": {
    "group:admins": ["user1@example.com", "user2@example.com"],
    "group:operators": ["user3@example.com"]
  },
  "tagOwners": {
    "tag:dogerat-server": ["group:admins"]
  },
  "acls": [
    // Admins can access server on all ports
    {
      "action": "accept",
      "src": ["group:admins"],
      "dst": ["tag:dogerat-server:*"]
    },

    // Operators can only access API port
    {
      "action": "accept",
      "src": ["group:operators"],
      "dst": ["tag:dogerat-server:5000"]
    },

    // Deny all other access
    {
      "action": "deny",
      "src": ["*"],
      "dst": ["*"]
    }
  ]
}
```

### Step 4: Connect and Test

On your desktop:

```bash
# Show Tailscale status
tailscale status

# Access server via Tailscale DNS
curl http://dogerat-server:5000/api/health

# Or use MagicDNS
curl http://dogerat-server.example.ts.net:5000/api/health
```

### Step 5: Update Desktop App Configuration

In desktop app settings:

```
Server URL: http://dogerat-server.example.ts.net:5000
```

**Success!** Your server is now accessible only via your private Tailscale network.

### Advanced: Subnet Routing

To expose your entire Docker network via Tailscale:

```bash
# On server
tailscale up --advertise-routes=172.18.0.0/16

# In admin console, approve the route
```

Now all services in docker-compose (postgres, etc.) are accessible via Tailscale.

---

## 🔐 Option 3: Reverse Proxy with mTLS

**Best for**: On-premise deployments, air-gapped environments

### Benefits

- ✅ Full control (no third-party dependencies)
- ✅ Strong authentication (client certificates)
- ✅ Can be completely offline
- ✅ Custom policies

### Step 1: Generate Certificates

#### Create Certificate Authority (CA)

```bash
# Generate CA private key
openssl genrsa -out ca.key 4096

# Generate CA certificate (valid 10 years)
openssl req -new -x509 -days 3650 -key ca.key -out ca.crt \
  -subj "/C=US/ST=State/L=City/O=DogeRat/CN=DogeRat CA"
```

#### Generate Server Certificate

```bash
# Server private key
openssl genrsa -out server.key 2048

# Server CSR
openssl req -new -key server.key -out server.csr \
  -subj "/C=US/ST=State/L=City/O=DogeRat/CN=api.dogerat.internal"

# Sign with CA (valid 1 year)
openssl x509 -req -in server.csr -CA ca.crt -CAkey ca.key \
  -CAcreateserial -out server.crt -days 365
```

#### Generate Client Certificates (for each user)

```bash
# Client private key
openssl genrsa -out client-admin.key 2048

# Client CSR
openssl req -new -key client-admin.key -out client-admin.csr \
  -subj "/C=US/ST=State/L=City/O=DogeRat/CN=admin@dogerat.com"

# Sign with CA
openssl x509 -req -in client-admin.csr -CA ca.crt -CAkey ca.key \
  -CAcreateserial -out client-admin.crt -days 365

# Create PKCS12 bundle for desktop app
openssl pkcs12 -export -out client-admin.p12 \
  -inkey client-admin.key -in client-admin.crt -certfile ca.crt
```

### Step 2: Configure nginx with mTLS

Create `nginx-mtls.conf`:

```nginx
server {
    listen 443 ssl;
    server_name api.dogerat.internal;

    # Server certificate
    ssl_certificate /etc/nginx/certs/server.crt;
    ssl_certificate_key /etc/nginx/certs/server.key;

    # Client certificate verification
    ssl_client_certificate /etc/nginx/certs/ca.crt;
    ssl_verify_client on;
    ssl_verify_depth 2;

    # TLS settings
    ssl_protocols TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Extract client DN for logging
    proxy_set_header X-Client-DN $ssl_client_s_dn;

    location / {
        proxy_pass http://server:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Step 3: Update docker-compose.yml

```yaml
services:
  nginx-mtls:
    image: nginx:alpine
    container_name: dogerat-nginx-mtls
    volumes:
      - ./nginx-mtls.conf:/etc/nginx/conf.d/default.conf:ro
      - ./certs:/etc/nginx/certs:ro
    ports:
      - "443:443"
    depends_on:
      - server
    networks:
      - dogerat-network
```

### Step 4: Configure Desktop App

Install client certificate (`client-admin.p12`) on desktop and configure app:

```
Server URL: https://api.dogerat.internal
Client Certificate: client-admin.p12
Certificate Password: [your password]
```

### Step 5: Revoke Certificate (if needed)

```bash
# Create CRL (Certificate Revocation List)
openssl ca -config openssl.cnf -gencrl -out crl.pem

# Add certificate serial to revoke
echo "01" >> revoked.txt

# Regenerate CRL
openssl ca -config openssl.cnf -gencrl -out crl.pem

# Update nginx to check CRL
# In nginx.conf:
ssl_crl /etc/nginx/certs/crl.pem;
```

---

## 🔒 Security Configuration

### Best Practices (All Options)

1. **Rotate Credentials Regularly**
   - Cloudflare: Regenerate tunnel tokens every 90 days
   - Tailscale: Rotate auth keys every 90 days
   - mTLS: Renew certificates annually

2. **Monitor Access Logs**
   - Cloudflare: Enable logging in dashboard
   - Tailscale: Review network flow logs
   - mTLS: nginx access logs with client DN

3. **Principle of Least Privilege**
   - Grant minimal required access
   - Use separate policies for different roles
   - Review access quarterly

4. **Enable Multi-Factor Authentication**
   - Cloudflare Access: Require MFA for all users
   - Tailscale: Enable MFA in account settings
   - mTLS: Consider hardware tokens (YubiKey)

5. **Implement Rate Limiting**
   - Cloudflare: Built-in DDoS protection
   - Tailscale: Use ACLs to limit connections
   - mTLS: nginx rate limiting module

### Firewall Rules

**Cloudflare/Tailscale** (outbound only):

```bash
# Allow outbound HTTPS (Cloudflare) or UDP 41641 (Tailscale)
# No inbound ports needed!
```

**mTLS** (inbound required):

```bash
# Allow HTTPS from specific IPs only
sudo ufw allow from 10.0.0.0/8 to any port 443
```

---

## 📊 Monitoring & Alerting

### Cloudflare Tunnel

**Metrics Available**:

- Connection status (up/down)
- Request rate
- Error rate
- Latency

**Alerting** (via Cloudflare Notifications):

1. Go to Notifications in dashboard
2. Add alert for:
   - Tunnel disconnected
   - High error rate (>5%)
   - DDoS attack detected

### Tailscale

**Metrics Available**:

- Device status (online/offline)
- Traffic volume
- Connection quality
- ACL rule hits

**Alerting** (via Tailscale Webhooks):

```bash
# Configure webhook in admin console
curl -X POST https://api.tailscale.com/api/v2/webhooks \
  -H "Authorization: Bearer $TAILSCALE_API_KEY" \
  -d '{
    "url": "https://your-webhook-receiver.com",
    "events": ["node.connected", "node.disconnected"]
  }'
```

### mTLS Nginx

**Log Analysis**:

```bash
# Monitor failed certificate verifications
grep "SSL_do_handshake() failed" /var/log/nginx/error.log

# Alert on rate limit exceeded
grep "limiting requests" /var/log/nginx/error.log | \
  mail -s "Rate limit alert" admin@dogerat.com
```

---

## 🔧 Troubleshooting

### Cloudflare Tunnel

**Issue**: Tunnel won't connect

```bash
# Check cloudflared logs
docker logs dogerat-cloudflared

# Common fixes:
1. Verify tunnel ID in cloudflared.yml
2. Check credentials file path
3. Ensure DNS records are set
4. Verify firewall allows outbound HTTPS
```

**Issue**: Access policy not working

```bash
# Check:
1. Policy is applied to correct hostname
2. User email matches policy rule
3. Session hasn't expired
4. Clear browser cookies and retry
```

### Tailscale

**Issue**: Can't connect to server

```bash
# Check Tailscale status
tailscale status

# Common fixes:
1. Verify both devices are connected: tailscale ping dogerat-server
2. Check ACLs allow your user
3. Ensure MagicDNS is enabled: tailscale status --json | grep MagicDNS
4. Restart Tailscale: sudo systemctl restart tailscaled
```

**Issue**: Slow connection

```bash
# Check if using relay (DERP)
tailscale netcheck

# Force direct connection
tailscale ping --peerapi dogerat-server
```

### mTLS

**Issue**: Certificate verification failed

```bash
# Verify certificate chain
openssl verify -CAfile ca.crt client-admin.crt

# Common fixes:
1. Check certificate dates: openssl x509 -in client-admin.crt -noout -dates
2. Verify CA matches: openssl x509 -in ca.crt -noout -issuer
3. Check CRL if used: openssl crl -in crl.pem -noout -text
```

**Issue**: nginx refuses connection

```bash
# Check nginx error log
docker logs dogerat-nginx-mtls

# Common fixes:
1. Verify ssl_verify_client on is set
2. Check certificate paths in nginx.conf
3. Ensure CA cert is readable: ls -l /etc/nginx/certs/
```

---

## 📚 Additional Resources

- [Cloudflare Zero Trust Documentation](https://developers.cloudflare.com/cloudflare-one/)
- [Tailscale Documentation](https://tailscale.com/kb/)
- [nginx mTLS Guide](https://nginx.org/en/docs/http/ngx_http_ssl_module.html)
- [OpenSSL Documentation](https://www.openssl.org/docs/)
- [Zero Trust Architecture (NIST)](https://www.nist.gov/publications/zero-trust-architecture)

---

## 🎓 Training Resources

### For Administrators

- Cloudflare Zero Trust course (free): https://cloudflare.com/learning/
- Tailscale best practices: https://tailscale.com/kb/1082/firewall-ports/

### For Developers

- Implementing Zero Trust: https://www.cloudflare.com/learning/security/glossary/what-is-zero-trust/
- mTLS tutorial: https://smallstep.com/hello-mtls/

---

**Next Steps**: Choose your preferred option and follow the setup guide. For production deployments, we recommend Cloudflare Tunnel for its comprehensive features and ease of use.

**Need Help?** Join our Discord or open a GitHub issue with the tag `zero-trust-deployment`.
