
# Smart Incident Reporting Platform

A modern, responsive Smart City Incident Reporting and Response System built with Next.js and FastAPI.

## Table of Contents
1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Features](#features)
5. [User Roles](#user-roles)
6. [User Approval System](#user-approval-system)
7. [Getting Started](#getting-started)
8. [API Documentation](#api-documentation)
9. [WebSocket](#websocket)
10. [Data Models](#data-models)

---

## Overview
This platform enables citizens to report incidents, responders to manage assigned tasks, and admins to oversee the entire system with real‑time updates and analytics.

---

## Tech Stack
- **Frontend**: Next.js 16 (App Router) with TypeScript
- **Styling**: Tailwind CSS + shadCN UI
- **State Management**: Zustand
- **Maps**: React Leaflet
- **Real‑Time**: WebSocket
- **Backend**: FastAPI (separate service)
- **Media**: Cloudinary

---

## Project Structure
```
smart-incident-reporting/
├── app/
│   ├── admin/             # Admin dashboard pages
│   ├── citizen/           # Citizen dashboard pages
│   ├── responder/         # Responder dashboard pages
│   ├── login/             # Login page
│   ├── register/          # Registration page
│   ├── forgot-password/   # Forgot password page
│   ├── reset-password/    # Reset password page
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Landing page
│   └── globals.css        # Global styles
├── components/            # Reusable components
│   ├── ui/                # shadCN UI components
│   ├── DashboardLayout.tsx
│   ├── DashboardSidebar.tsx
│   ├── LocationShare.tsx
│   ├── PageHeader.tsx
│   ├── WebSocketProvider.tsx
│   └── ...
├── lib/                   # Utility functions
│   ├── api.ts             # API client wrapper
│   └── utils.ts
├── store/                 # Zustand state management
│   └── useAuthStore.ts
├── middleware.ts          # Next.js middleware
└── package.json
```

---

## Features

### Common Features
- **Authentication**: Secure login/register with JWT tokens
- **Real‑Time Updates**: WebSocket for live notifications and events
- **Responsive Design**: Optimized for all screen sizes
- **Notifications**: In‑app notifications with badge counter

### Citizen Features
- 📝 Report incidents with media (images/videos)
- 📍 Interactive map to select incident location
- 📋 View own incident history and progress
- 🔔 Real‑time status updates on reported incidents

### Responder Features
- 📋 View assigned incidents
- 📍 Live location sharing
- 🗺️ Map view with incident and own location
- 🔄 Update incident status (assigned → in progress → resolved)
- 📍 Open directions in Google Maps

### Admin Features
- 📊 Analytics dashboard with charts and metrics
- 📋 Manage all incidents (assign, update, close)
- 👥 Manage users (activate/deactivate, delete, change roles)
- ✅ Approve/reject responder accounts
- 📍 View real‑time responder locations
- 🔍 Filter and search incidents by multiple criteria

---

## User Roles
| Role         | Description                                                                 |
|--------------|-----------------------------------------------------------------------------|
| `citizen`    | Reports incidents, views own incident history and real‑time status updates  |
| `responder`  | Responds to assigned incidents, updates status, shares live location       |
| `admin`      | Oversees the entire system, manages incidents, users, and views analytics  |

---

## User Approval System
- Citizens are auto-approved on registration
- Responder accounts require admin approval before they can log in
- Admins can approve/reject pending responder accounts
- Admins can change any user's role

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn or pnpm
- Backend service running (see [Backend](#backend) section)

### Installation
1. Clone the repository:
   ```bash
   git clone &lt;repo-url&gt;
   cd smart-incident-reporting
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the project root with:
   ```env
   NEXT_PUBLIC_API_BASE_URL=https://smart-incident-reporting-db.onrender.com
   NEXT_PUBLIC_WS_URL=wss://smart-incident-reporting-db.onrender.com
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production
```bash
npm run build
npm start
```

---

## Backend
The backend is a separate FastAPI service. See the [backend documentation](./frontend.md) for details on API endpoints, WebSocket, and data models.

### Backend URLs
| Environment | Base URL                                  | Swagger UI                                  | ReDoc                                  |
|-------------|-------------------------------------------|---------------------------------------------|----------------------------------------|
| Local       | `http://localhost:8000`                   | `http://localhost:8000/docs`                | `http://localhost:8000/redoc`          |
| Production  | `https://smart-incident-reporting-db.onrender.com` | `https://smart-incident-reporting-db.onrender.com/docs` | `https://smart-incident-reporting-db.onrender.com/redoc` |

---

## API Documentation
All API calls are wrapped in `lib/api.ts` for consistent error handling and token refresh.

### Key Endpoints
For a complete list, refer to the [backend API docs](./frontend.md#api-endpoints).

| Resource       | Method | Endpoint                      | Description                          |
|----------------|--------|-------------------------------|--------------------------------------|
| Auth           | POST   | `/api/auth/login`             | User login                           |
| Auth           | POST   | `/api/auth/register`          | User registration                    |
| Incidents      | POST   | `/api/incidents`              | Create new incident                  |
| Incidents      | GET    | `/api/incidents`              | Get all incidents (role‑based)       |
| Incidents      | PATCH  | `/api/incidents/{id}`         | Update incident                      |
| Responders     | GET    | `/api/responders/tasks`       | Get responder's assigned tasks       |
| Responders     | POST   | `/api/responders/location`    | Share live location                  |
| Analytics      | GET    | `/api/analytics/overview`     | Get analytics overview (admin only)  |
| Users          | GET    | `/api/users`                  | Get all users (admin only)           |
| Users          | PATCH  | `/api/users/{id}/approve`     | Approve/reject user (admin only)     |
| Users          | PATCH  | `/api/users/{id}/role`        | Change user role (admin only)        |

---

## WebSocket
Real‑time communication via WebSocket for live updates.

### Connection
| Environment | URL Pattern                                  |
|-------------|----------------------------------------------|
| Local       | `ws://localhost:8000/ws/{access_token}`      |
| Production  | `wss://smart-incident-reporting-db.onrender.com/ws/{access_token}` |

### Events
| Event                  | Description                                  |
|------------------------|----------------------------------------------|
| `new_incident`         | New incident reported                        |
| `incident_assigned`    | Incident assigned to responder               |
| `status_updated`       | Incident status updated                      |
| `responder_location`   | Responder shared new live location           |
| `new_notification`     | New notification received                    |

---

## Data Models

### User
```json
{
  "id": "string",
  "full_name": "string",
  "email": "string",
  "phone": "string",
  "role": "citizen|responder|admin",
  "is_active": true,
  "is_approved": true,
  "is_online": false,
  "last_online": "datetime",
  "created_at": "datetime"
}
```

### Incident
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "category": "fire|medical|traffic|crime|infrastructure|other",
  "severity": "low|medium|high|critical",
  "status": "pending|assigned|in_progress|resolved|closed",
  "latitude": 0.0,
  "longitude": 0.0,
  "address": "string",
  "media": [
    {
      "url": "string",
      "public_id": "string",
      "resource_type": "string"
    }
  ],
  "reported_by": "user_id",
  "assigned_to": "user_id",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### Notification
```json
{
  "id": "string",
  "user_id": "string",
  "title": "string",
  "message": "string",
  "is_read": false,
  "created_at": "datetime"
}
```

---

## License
MIT

