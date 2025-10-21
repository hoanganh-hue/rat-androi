# Architecture Overview

```
┌──────────────┐      HTTPS        ┌─────────────────────┐
│    Client    │  ─────────────▶  │   Nginx (Frontend)  │
│  Angular 20  │  ◀─────────────  │   serves Angular    │
└──────────────┘                   │   proxies /api      │
        ▲                          └─────────┬──────────┘
        │ WebSocket (Socket.IO)                        │ /api (REST)
        │                                              ▼
        │                                   ┌─────────────────────┐
        │                                   │   Express Server     │
        │                                   │  Node.js + TS       │
        │                                   │  Auth/RBAC/Swagger  │
        │                                   └─────────┬──────────┘
        │                                             │
        │                       Sequelize             │
        │                      (Postgres/MySQL)       ▼
        │                                   ┌─────────────────────┐
        └──────────────────────────────────▶│    Database         │
                                            │  Postgres/MySQL     │
                                            └─────────────────────┘
```

Key Flows

- JWT Auth for API, Socket.IO uses token for real-time
- RBAC enforced at route-level middleware
- Audit middleware logs actions and redacts secrets
