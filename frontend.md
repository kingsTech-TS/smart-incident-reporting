# Smart Incident Reporting Platform - Backend Documentation & Frontend Prompt

## Backend Overview
This is the complete backend for a Smart City Incident Reporting and Response System built with FastAPI. It provides all necessary API endpoints for citizens, responders, and admins.

---

## Base URL
```
http://localhost:8000
```

## API Documentation
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

---

## Authentication
All endpoints (except `/api/auth/register` and `/api/auth/login`) require an Authorization header with a Bearer token:
```
Authorization: Bearer <access_token>
```

---

## API Endpoints

### 1. Auth
- `POST /api/auth/register`: Register a new user
- `POST /api/auth/login`: Login to get access/refresh tokens and user info
- `POST /api/auth/refresh`: Refresh access token
- `POST /api/auth/logout`: Logout (placeholder)
- `POST /api/auth/forgot-password`: Send password reset email (placeholder)
- `POST /api/auth/reset-password`: Reset password (placeholder)

### 2. Users
- `GET /api/users`: Get all users (admin only)
- `GET /api/users/me`: Get current user
- `GET /api/users/{user_id}`: Get user by ID

### 3. Incidents
- `POST /api/incidents`: Create a new incident (citizen/admin)
- `GET /api/incidents/nearby`: Get nearby incidents
- `GET /api/incidents/{incident_id}`: Get incident by ID
- `GET /api/incidents`: Get all incidents (role-based filtering)
- `PATCH /api/incidents/{incident_id}`: Update incident
- `PATCH /api/incidents/{incident_id}/assign`: Assign responder (admin only)
- `DELETE /api/incidents/{incident_id}`: Delete incident (admin only)

### 4. Responders
- `GET /api/responders/tasks`: Get assigned incidents
- `PATCH /api/responders/tasks/{incident_id}/status`: Update incident status
- `POST /api/responders/location`: Share live GPS location

### 5. Notifications
- `GET /api/notifications`: Get user's notifications
- `PATCH /api/notifications/{notification_id}/read`: Mark notification as read

### 6. Analytics (Admin only)
- `GET /api/analytics/overview`: Get analytics overview
- `GET /api/analytics/incidents-by-category`: Incidents grouped by category
- `GET /api/analytics/incidents-by-status`: Incidents grouped by status
- `GET /api/analytics/monthly-trends`: Monthly incident trends
- `GET /api/analytics/responder-performance`: Responder performance metrics

### 7. Media
- `POST /api/media/sign-upload`: Get Cloudinary signed upload params

---

## WebSocket
- Connection URL: `ws://localhost:8000/ws/{access_token}`
- Events:
  - `new_incident`: New incident reported
  - `incident_assigned`: Incident assigned to responder
  - `status_updated`: Incident status updated
  - `responder_location`: Responder shared new location
  - `new_notification`: New notification received

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
  "location": {
    "type": "Point",
    "coordinates": [longitude, latitude]
  },
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
  "priority_score": 0-100,
  "created_at": "datetime",
  "updated_at": "datetime",
  "resolved_at": "datetime"
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

---

## Frontend Development Prompt

### Build a complete frontend for the Smart City Incident Reporting and Response System

### Tech Stack
- Next.js (App Router with TypeScript)
- Tailwind CSS for styling
- shadCN UI component library
- Zustand for state management
- Leaflet or React Leaflet for mapping
- Cloudinary Upload Widget for media uploads
- WebSocket client (native browser WebSocket or library like socket.io-client)

### User Roles & Pages (Next.js App Router Structure)

#### App Router Directory Structure
```
app/
├── layout.tsx
├── page.tsx (Landing Page)
├── register/
│   └── page.tsx
├── login/
│   └── page.tsx
├── (citizen)/
│   ├── layout.tsx
│   ├── dashboard/
│   │   └── page.tsx
│   ├── report/
│   │   └── page.tsx
│   ├── incidents/
│   │   └── [id]/
│   │       └── page.tsx
│   ├── notifications/
│   │   └── page.tsx
│   └── profile/
│       └── page.tsx
├── (responder)/
│   ├── layout.tsx
│   ├── dashboard/
│   │   └── page.tsx
│   ├── incidents/
│   │   └── [id]/
│   │       └── page.tsx
│   ├── notifications/
│   │   └── page.tsx
│   └── profile/
│       └── page.tsx
└── (admin)/
    ├── layout.tsx
    ├── dashboard/
    │   └── page.tsx
    ├── incidents/
    │   └── [id]/
    │       └── page.tsx
    ├── users/
    │   └── page.tsx
    ├── notifications/
    │   └── page.tsx
    └── profile/
        └── page.tsx
```

#### 1. Common Components & Auth Pages
- Landing/Welcome Page (`app/page.tsx`)
- Register Page (`app/register/page.tsx`)
- Login Page (`app/login/page.tsx`)

#### 2. Citizen Dashboard Pages
- Dashboard (`app/(citizen)/dashboard/page.tsx`): List of user's incidents
- Report Incident (`app/(citizen)/report/page.tsx`): Form to create new incident with media upload
- Incident Details (`app/(citizen)/incidents/[id]/page.tsx`): View incident details and progress
- Notifications Page (`app/(citizen)/notifications/page.tsx`): List and manage notifications
- Profile Page (`app/(citizen)/profile/page.tsx`): View and edit profile

#### 3. Responder Dashboard Pages
- Dashboard (`app/(responder)/dashboard/page.tsx`): List of assigned incidents
- Incident Details (`app/(responder)/incidents/[id]/page.tsx`): View and update assigned incident
- Live Location Sharing: Client component in responder layout
- Notifications Page (`app/(responder)/notifications/page.tsx`)
- Profile Page (`app/(responder)/profile/page.tsx`)

#### 4. Admin Dashboard Pages
- Overview Dashboard (`app/(admin)/dashboard/page.tsx`): Analytics charts and overview stats
- All Incidents (`app/(admin)/incidents/page.tsx`): List of all incidents with filters
- Incident Details (`app/(admin)/incidents/[id]/page.tsx`): View and manage incident
- Users Management (`app/(admin)/users/page.tsx`): List and manage users
- Responder Locations Map: Real-time map in admin dashboard
- Notifications Page (`app/(admin)/notifications/page.tsx`)
- Profile Page (`app/(admin)/profile/page.tsx`)

### Features to Implement

#### 1. Authentication
- Store access and refresh tokens securely (use `localStorage` or HTTP-only cookies)
- Implement refresh token logic
- Auto-logout on token expiration
- Use Next.js Middleware for protected routes and role-based redirection
- Create a client-side Zustand store for auth state
- Mark auth-related components as Client Components with `'use client'`

#### 2. Incident Management
- Create incident form with category, severity, description, location, media
- Media upload using Cloudinary signed upload
- Incident list with filters (status, severity, category, date)
- Incident details page with timeline of status changes

#### 3. Maps & Location
- Interactive map for viewing incidents
- Nearby incidents on map
- Responder locations on map for admins
- Geolocation for reporting and sharing location

#### 4. Notifications
- Real-time notifications via WebSocket
- Notification badge
- Mark as read functionality

#### 5. WebSocket Integration
- Connect to WebSocket on app load
- Listen to real-time events:
  - New incident
  - Incident assigned
  - Status updated
  - Responder location
  - New notification

#### 6. Analytics (Admin)
- Charts and graphs for analytics overview
- Incidents by category and status
- Monthly trends
- Responder performance

### Design Requirements
- Responsive design for all screen sizes
- Clean, modern UI
- Clear role-based navigation
- Loading states
- Error handling
- Form validation
- Skeleton loaders

### Styling
- Use shadCN UI components exclusively for consistent design
- Tailwind CSS for utility-first styling
- Color scheme: Professional and easy to read
- Accessibility considerations
- Responsive grid and layout using Tailwind

### Deployment
- Dockerized frontend
- Environment variables for API URL and Cloudinary config
