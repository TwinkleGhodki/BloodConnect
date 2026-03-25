# BloodConnect
### Blood Donation & Emergency Finder System

A real-time full-stack platform connecting blood donors with hospitals during emergencies, powered by an ML-based donor prediction engine.

## Live Demo
- Frontend: https://bloodconnect.vercel.app
- Backend API: https://bloodconnect-api.onrender.com

## Features
- Real-time donor search by blood type and city
- ML-based donor availability prediction and ranking
- SOS Emergency Mode — finds all compatible donors in under 2 seconds
- Hospital inventory management with automated low-stock alerts
- Donor gamification — badges, donation streaks, leaderboard
- Role-based dashboards for Donors, Hospitals, and Admins
- JWT authentication with bcrypt password hashing

## Tech Stack
| Layer | Technology |
|---|---|
| Frontend | React.js, React Router, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas |
| Auth | JWT + bcryptjs |
| ML Layer | Custom JS prediction algorithm |

## Setup Instructions

### Backend
```bash
cd backend
npm install
# Create .env file with PORT, MONGO_URI, JWT_SECRET
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## Project Structure
```
blood-donation-system/
├── backend/
│   ├── config/        # Database connection
│   ├── models/        # MongoDB schemas
│   ├── routes/        # API endpoints
│   ├── middleware/    # JWT auth middleware
│   └── ml/           # Donor prediction algorithm
└── frontend/
    ├── src/
    │   ├── pages/     # All React pages
    │   └── components/# Reusable components
```

## User Roles
- **Donor** — Register, search requests, accept/decline, earn badges
- **Hospital** — Post requests, trigger SOS, manage inventory
- **Admin** — View all users, verify donors, system analytics

## Impact
- Reduces donor search time from 30+ minutes to under 2 minutes
- ML prediction scores rank donors by response likelihood
- SOS mode notifies all compatible donors instantly