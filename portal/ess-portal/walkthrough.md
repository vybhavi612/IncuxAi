# ESS Portal Implementation - Phase 1 & 2 Complete!

I have successfully scaffolded the Employee Self-Service (ESS) Portal based on your BTech project documentation. Both the backend and frontend are ready to run.

## What has been built:
1. **Node.js + Express Backend**: 
   - Initialized at `ess-portal/backend`
   - Uses `db.json` as a mock database
   - Has working JWT-based authentication endpoints (`/api/auth/register`, `/api/auth/login`)
   - Includes Role-Based Access Control middleware (`checkRole`)
   - Seeded with two default users.

2. **Vite + React Frontend**:
   - Initialized at `ess-portal/frontend`
   - Tailwind CSS v4 configured with modern premium UI tokens (glassmorphism style).
   - Global `AuthContext` for managing JWT and user roles.
   - Dynamic `Sidebar` component that filters links based on user roles.
   - Beautiful `Login` and `Dashboard` pages.

## How to Test and Run the Application

### 1. Start the Backend Server
Open a terminal, navigate to the backend folder, and start the server:
```bash
cd ess-portal/backend
node server.js
```
*The server will start on port 5000.*

### 2. Start the Frontend Application
Open a new terminal window, navigate to the frontend folder, and start the Vite development server:
```bash
cd ess-portal/frontend
npm run dev
```
*The frontend will start on port 5173.*

### 3. Log In
Open your browser to `http://localhost:5173` and log in using one of the pre-seeded accounts:

**Admin Account**
- Email: `admin@company.com`
- Password: `admin123`

**Employee Account**
- Email: `john@company.com`
- Password: `emp123`

> [!TIP]
> Notice how the sidebar navigation items change dynamically depending on whether you log in as the Admin or the Employee!

## Next Steps
This completes Phase 1 and 2! If you're ready, we can proceed to Phase 3 (Employee & Attendance Module). Let me know!
