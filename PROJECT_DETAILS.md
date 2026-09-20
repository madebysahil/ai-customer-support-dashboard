# AI Customer Support Dashboard - Project Details

## 🚀 Project Overview
The **AI Customer Support Dashboard** is a modern, enterprise-grade web application built to help support agents and managers efficiently handle customer inquiries. It integrates AI-powered copilots to assist agents, analyzes sentiment, and provides rich analytics—all through a beautifully designed interface.

---

## 🛠️ Technology Stack

### Frontend (Client-Side)
- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS & `shadcn/ui` components
- **State Management & Fetching:** React Query & React Hook Form
- **Hosting:** Vercel

### Backend (Server-Side)
- **Framework:** Node.js with Express.js
- **Language:** TypeScript
- **Database ORM:** Prisma
- **Authentication:** JWT (JSON Web Tokens) with secure HttpOnly Cookies and Refresh Token Rotation
- **Hosting:** Render

### Database
- **Engine:** PostgreSQL (hosted on Neon)
- **Extensions:** `pgvector` for AI embeddings

---

## 🔐 Authentication & Security

The platform utilizes a robust authentication flow tailored for cross-domain security (Vercel Frontend ↔ Render Backend).

1. **Login Flow:** User provides credentials, backend validates via `bcrypt`.
2. **Token Generation:** The backend issues a short-lived `accessToken` (15m) and a long-lived `refreshToken` (7d).
3. **Cookie Security:** The `refreshToken` is stored in a secure, `HttpOnly`, `SameSite=none` cookie, making it inaccessible to XSS attacks while allowing cross-domain API requests.
4. **Session Refreshing:** Upon page reloads, the frontend automatically hits `/api/v1/auth/refresh` to transparently acquire a new access token and fetch the user's latest profile data (Name, Role, Avatar).
5. **Role-Based Access Control (RBAC):** Users are assigned roles (`ADMINISTRATOR`, `MANAGER`, `SUPPORT_AGENT`) that dictate what API routes and UI views they can access.

---

## 💻 Core Features

### 1. Unified Dashboard
A command center displaying Key Performance Indicators (KPIs) like Open Tickets, Live Conversations, AI Resolution Rates, and Average Response Time. Includes quick links to Priority Queues and recent chats.

### 2. Multi-Role Profiles
Distinct accounts for Admins and Agents. 
- **Admins** have full access to analytics, all chat histories, and platform configuration.
- **Agents** have restricted access to handle their assigned tickets and utilize AI tools to write responses.
- Avatars dynamically sync across the platform based on the user's role.

### 3. Quick Access Demo Mode
To speed up testing and demonstrations, the login page features "Quick Login" buttons that automatically inject credentials for the Admin and Agent demo accounts.

### 4. Notification System (Preview)
Integrated UI for real-time notifications alerting agents of high-priority tickets, escalations, or incoming chats.

---

## 🌐 Deployment Status

The application is fully live and successfully deployed across cloud providers.

| Service | Provider | Status | URL |
|---------|----------|--------|-----|
| **Database** | Neon Serverless | 🟢 Active | *Private Connection String* |
| **Backend API** | Render Web Service | 🟢 Active | `https://ai-customer-support-dashboard-1lae.onrender.com` |
| **Frontend UI** | Vercel | 🟢 Active | `https://ai-customer-support-dashboard-front-roan.vercel.app` |

### Recent Fixes & Optimizations
- Resolved Next.js build issues on Vercel by ensuring strict TypeScript interface compliance.
- Fixed cross-domain cookie blocking by configuring `SameSite=none` for Render cookies and removing incompatible edge middleware on Vercel.
- Patched the auth hydration state so refreshing the dashboard correctly re-loads user profiles.
- Corrected CSS Flexbox constraints on the Settings page to prevent layout squishing.
