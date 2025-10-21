# DogeRat Web Admin v2.0

<div align="center">

![DogeRat Logo](https://via.placeholder.com/150x150.png?text=DogeRat)

**Advanced Android Device Management Platform with Web-Based Administration**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![Angular](https://img.shields.io/badge/angular-20.3-red)](https://angular.io/)
[![TypeScript](https://img.shields.io/badge/typescript-5.6-blue)](https://www.typescriptlang.org/)

[Features](#features) • [Quick Start](#quick-start) • [Documentation](#documentation) • [API Docs](#api-documentation) • [Contributing](#contributing)

</div>

---

## Quick Links

- Contributing Guide: `CONTRIBUTING.md`
- License (MIT): `LICENSE`

## 📋 Overview

DogeRat Web Admin is a powerful, secure, and scalable platform for remotely managing Android devices. Version 2.0 introduces a complete web-based admin panel, replacing the legacy Telegram bot interface with a modern, role-based access control system.

### Key Highlights

- 🎨 **Modern UI**: Angular 20 with Material Design dark theme
- 🔐 **Security First**: JWT authentication, RBAC, rate limiting, HTTPS
- ⚡ **Real-Time**: Socket.IO for instant device communication
- 🐳 **Docker Ready**: Complete containerization with Docker Compose
- 📊 **Comprehensive**: Dashboard, device management, audit logs, user management
- 🌍 **Production Ready**: CI/CD, health checks, monitoring

---

## ✨ Features

### Device Management
- ✅ Real-time device status (online/offline)
- ✅ Device list with filtering and search
- ✅ Detailed device information and logs
- ✅ Bulk device operations

### Remote Commands
- 📱 **Data Collection**: Contacts, SMS, call logs, location, clipboard
- 📷 **Media**: Camera (main/selfie), screenshots, gallery, microphone
- 🔧 **Actions**: Toast messages, vibration, audio playback, open URLs
- 🔐 **Advanced**: Keylogger, phishing pages, file explorer, encryption

### User Management (Admin Only)
- 👥 Create, edit, and delete users
- 🎭 Role-based access control (Admin, Manager, Operator, Viewer)
- 📝 User activity tracking

### Audit & Security
- 📊 Complete audit trail of all actions
- 🔍 Filter logs by user, action, date range
- 📥 Export audit logs to CSV
- 🛡️ Input validation, rate limiting, CORS

### Dashboard
- 📈 Device statistics (total, online, offline)
- 📊 Charts and visualizations
- ⏱️ Recent activity timeline
- ⚡ Quick actions panel

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 18.0.0
- **Docker** & **Docker Compose** (recommended)
- **PostgreSQL** ≥ 15 or **MySQL** ≥ 8 (if not using Docker)

### Option 1: Docker (Recommended)

```bash
# 1. Clone the repository
git clone https://github.com/your-org/dogerat-web-admin.git
cd dogerat-web-admin

# 2. Create environment file
cp .env.example .env
# Edit .env and set your DATABASE_URL, JWT_SECRET, etc.

# 3. Start all services
docker-compose up -d

# 4. Access the application
# Frontend: http://localhost
# Backend API: http://localhost:5000
# API Docs: http://localhost:5000/api-docs

# 5. Default admin credentials
# Username: admin
# Password: Admin@123456 (CHANGE THIS IMMEDIATELY!)
```

### Option 2: Manual Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-org/dogerat-web-admin.git
cd dogerat-web-admin

# 2. Install dependencies
npm install
cd client && npm install && cd ..

# 3. Configure environment
cp .env.example .env
# Edit .env with your configuration

# 4. Setup database
npm run db:migrate
npm run db:seed

# 5. Development (2 terminals)
# Backend (terminal 1)
npm run dev

# Frontend (terminal 2)
cd client && npm start

# Access Angular dev at http://localhost:4200

# 6. Production-like (single server)
# Build Angular and bundle server, then serve static Angular from Express
npm run build
npm start

# Access at http://localhost:5000
```

---

## 📚 Documentation

### Environment Variables

See [ENV_VARIABLES.md](ENV_VARIABLES.md) for detailed configuration options.

**Essential Variables:**
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dogerat
DB_TYPE=postgres  # or 'mysql'

# Security
JWT_SECRET=your-super-secret-key-change-this
JWT_EXPIRY=24h

# Server
PORT=5000
CORS_ORIGIN=http://localhost:4200

# Admin Setup
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=ChangeMe123!
```

### Database Schema

See [docs/database-schema.md](docs/database-schema.md) for complete schema documentation.

**Main Tables:**
- `users` - User accounts with RBAC
- `devices` - Connected Android devices
- `device_logs` - Data collected from devices
- `commands` - Commands sent to devices
- `audit_trail` - Security audit logs

### API Documentation

Interactive API documentation available at `/api-docs` when server is running.

OpenAPI spec: `docs/api-spec.yaml`

**Main Endpoints:**
- `POST /api/auth/login` - User authentication
- `GET /api/devices` - List all devices
- `POST /api/devices/:id/command` - Send command to device
- `GET /api/audit` - View audit logs (Admin/Manager)
- `POST /api/users` - Create user (Admin only)

Full API specification: [docs/api-spec.yaml](docs/api-spec.yaml)

---

## 🎭 User Roles & Permissions

| Role | Permissions |
|------|------------|
| **Admin** | Full access: user management, audit logs, all device operations |
| **Manager** | View devices, read-only commands, view audit logs |
| **Operator** | Execute device commands, view device list |
| **Viewer** | Read-only access to device list and status |

---

## 🐳 Docker Deployment

### Production Deployment

```bash
# 1. Build images
docker-compose build

# 2. Start services
docker-compose up -d

# 3. View logs
docker-compose logs -f

# 4. Stop services
docker-compose down

# 5. Clean up (removes volumes)
docker-compose down -v
```

### Health Checks

All services include health checks:
- **Database**: `pg_isready` check every 10s
- **Backend**: HTTP `/api/health` check every 30s
- **Frontend**: nginx health check every 30s

### Scaling

```bash
# Scale backend servers
docker-compose up -d --scale server=3
```

---

## 🛠️ Development

### Project Structure

```
dogerat-web-admin/
├── client/                 # Angular frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/      # Services, guards, interceptors
│   │   │   ├── pages/     # Page components
│   │   │   ├── shared/    # Shared components
│   │   │   └── layout/    # Layout components
│   │   ├── environments/
│   │   ├── styles.css
│   │   └── theme.scss
│   └── Dockerfile
├── server/                 # Node.js backend
│   ├── routes/            # API routes
│   ├── models/            # Sequelize models
│   ├── middleware/        # Auth, validation, audit
│   ├── utils/             # Logger, Socket.IO bridge
│   ├── scripts/           # Database scripts
│   └── Dockerfile
├── docs/                   # Documentation
├── docker-compose.yml
└── package.json
```

### Available Scripts

**Backend:**
```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run check            # TypeScript type checking
npm run db:migrate       # Run database migrations
npm run db:seed          # Seed admin user
npm run db:seed:demo     # Seed demo data
npm run db:setup         # Migrate + seed
```

**Frontend:**
```bash
cd client
npm start                # Start dev server (http://localhost:4200)
npm run build            # Build for production
npm test                 # Run tests
```

### Code Style

- **TypeScript** for both frontend and backend
- **ESLint** + **Prettier** for code formatting
- **Angular** style guide for frontend
- **REST** API design principles for backend

---

## 🔒 Security

### Best Practices

1. **Change default credentials** immediately after first login
2. **Use strong JWT_SECRET** (generate with `openssl rand -base64 64`)
3. **Enable HTTPS** in production (use nginx reverse proxy)
4. **Configure CORS** properly (set specific `CORS_ORIGIN`)
5. **Regular updates** - keep dependencies up to date
6. **Backup database** regularly (use `npm run db:backup`)
7. **Review audit logs** for suspicious activity

### Security Features

- ✅ JWT authentication with expiry
- ✅ Bcrypt password hashing (12 rounds)
- ✅ Role-based access control (RBAC)
- ✅ Rate limiting (100 req/15min per IP)
- ✅ Input validation on all endpoints
- ✅ CORS protection
- ✅ Helmet security headers
- ✅ Complete audit trail

### Reporting Security Issues

Please report security vulnerabilities to: security@dogerat.com

Additional docs:
- Deployment guide: `docs/deployment.md`
- Security guide: `docs/security.md`
- Architecture overview: `docs/architecture.md`

---

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## ⚠️ Disclaimer

**For Educational and Internal Use Only**

This software is provided for educational purposes and internal system administration. The developers provide no warranty and will not be responsible for any direct or indirect damage caused by the usage of this tool. 

**Do not use for illegal activities.** Users assume full responsibility for any misuse.

---

## 🙏 Acknowledgments

- Angular Team for the amazing framework
- Express.js community
- Socket.IO developers
- All contributors and supporters

---

## 📞 Support

- 📧 Email: support@dogerat.com
- 💬 Telegram: [@dogerat_support](https://t.me/dogerat_support)
- 🐛 Issues: [GitHub Issues](https://github.com/your-org/dogerat-web-admin/issues)
- 📖 Docs: [Full Documentation](https://docs.dogerat.com)

---

<div align="center">

**Made with ❤️ by the DogeRat Team**

[⬆ Back to Top](#dogerat-web-admin-v20)

</div>
