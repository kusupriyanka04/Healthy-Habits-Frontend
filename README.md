# 🌿 HealthyHabits_Tracker

A full-stack habit tracking web application to help you build healthy routines, track daily progress, compete in challenges, and get AI-powered recommendations.

---

## 🌐 Live Demo

- **Frontend:** https://healthy-habits-frontend.vercel.app
- **Backend API:** https://healthy-habits-backend.onrender.com

---

## ✨ Features

- 🔐 **Authentication** — Secure login & register with JWT
- ✅ **Habit Tracking** — Create habits with custom targets, units & categories
- 🔥 **Streaks** — Consecutive day tracking with streak calculation
- 📊 **Analytics** — Calendar heatmap, bar charts, completion history
- 💯 **Wellness Score** — Daily score based on habit completion
- 🤖 **AI Recommendations** — Groq (Llama 3.3) powered habit suggestions
- 🏆 **Challenges** — Private invite-only challenges with leaderboard
- 🔔 **Reminders** — Browser push notifications per habit
- 🌙 **Dark Mode** — Full dark/light theme support
- 📄 **PDF Export** — Export habit report as PDF

---

## 🛠️ Tech Stack

### Frontend
| Tech | Purpose |
|---|---|
| React + Vite | UI framework |
| Tailwind CSS | Styling |
| Framer Motion | Animations |
| Recharts | Charts & analytics |
| React Router | Navigation |
| Axios | API calls |
| jsPDF | PDF export |

### Backend
| Tech | Purpose |
|---|---|
| Node.js + Express | REST API server |
| Supabase | PostgreSQL database |
| JWT | Authentication |
| Groq SDK | AI recommendations |

### Deployment
| Service | Purpose |
|---|---|
| Vercel | Frontend hosting |
| Render | Backend hosting |
| Supabase | Database & auth |
| Groq | AI (free tier) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Supabase account
- Groq API key (free at console.groq.com)

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/HealthyHabits_Tracker.git
cd HealthyHabits_Tracker
```

### 2. Setup Backend
```bash
cd backend
npm install
```

Create `backend/.env`:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
PORT=5000
```

Start backend:
```bash
npm run dev
```

### 3. Setup Frontend
```bash
cd frontend
npm install
```

Start frontend:
```bash
npm run dev
```

Open `http://localhost:5173`

---

## 🗄️ Database Schema

| Table | Purpose |
|---|---|
| `profiles` | User profiles |
| `habits` | User habits with targets & settings |
| `habit_logs` | Daily habit completion logs |
| `challenges` | Habit challenges |
| `challenge_participants` | Challenge members |
| `challenge_logs` | Daily challenge progress |
| `challenge_invites` | Invite codes for challenges |

---

## 📁 Project Structure

```
HealthyHabits_Tracker/
├── frontend/
│   ├── src/
│   │   ├── api/          # Axios config
│   │   ├── components/   # Reusable UI components
│   │   ├── context/      # Auth context
│   │   ├── hooks/        # Custom hooks
│   │   ├── lib/          # Utilities & config
│   │   └── pages/        # Dashboard, Analytics, Challenges, Settings
│   ├── vercel.json       # Vercel rewrite rules
│   └── index.html
│
└── backend/
    ├── src/
    │   ├── controllers/  # Route handlers
    │   ├── middleware/   # Auth middleware
    │   ├── routes/       # API routes
    │   ├── services/     # Supabase & notification services
    │   └── utils/        # Wellness & streak calculators
    └── server.js
```

---

## 🔗 API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/logout` | Logout user |

### Habits
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/habits` | Get all habits |
| POST | `/api/habits` | Create habit |
| PUT | `/api/habits/:id` | Update habit |
| DELETE | `/api/habits/:id` | Delete habit |
| POST | `/api/habits/:id/log` | Log habit progress |

### Analytics
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/analytics/wellness` | Get wellness score |
| GET | `/api/analytics/habits/:id/logs` | Get habit logs |

### AI
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/ai/recommendations` | Get AI habit recommendations |

### Challenges
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/challenges` | Get my challenges |
| POST | `/api/challenges` | Create challenge |
| POST | `/api/challenges/join-by-code` | Join via invite code |
| POST | `/api/challenges/:id/join` | Join challenge |
| POST | `/api/challenges/:id/log` | Log challenge progress |
| GET | `/api/challenges/:id/leaderboard` | Get leaderboard |

---

## 🌍 Deployment

### Backend → Render
1. Connect GitHub repo to Render
2. Set root directory to `backend`
3. Build command: `npm install`
4. Start command: `node server.js`
5. Add all environment variables

### Frontend → Vercel
1. Connect GitHub repo to Vercel
2. Set root directory to `frontend`
3. Framework preset: `Vite`
4. Deploy

---

## 🤖 AI Recommendations

Powered by **Groq's free API** using **Llama 3.3 70B** model.

- Analyses your existing habits and completion rates
- Identifies neglected wellness areas
- Suggests 3 personalised new habits
- Different suggestions every refresh (randomised focus themes)
- Completely free — 14,400 requests/day

---

## 📸 Screenshots

| Dashboard | Analytics | Challenges |
|---|---|---|
| *(Add screenshot)* | *(Add screenshot)* | *(Add screenshot)* |

---

## 👩‍💻 Author

**Kusu Priyanka**

- GitHub: [@yourusername](https://github.com/kusupriyanka04)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">Built with 💚 by Kusu Priyanka</p>
