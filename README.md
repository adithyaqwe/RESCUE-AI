# 🚀 RescueAI — Autonomous Emergency Dispatch & Response HUD

RescueAI is a production-aspirant, real-time AI emergency dispatch operating system. Built for dispatcher and fleet management teams, it translates chaotic raw distress inputs into triaged emergency profiles, recommends/routes resources, and provides interactive command telemetry in a military-ops styled heads-up display (HUD).

---

## 🗺️ System Architecture

```text
               +-------------------------------------------+
               |             OPERATOR BROWSER              |
               |  (React HUD Frontend, Custom MouseLight)   |
               +-----+-------------------+-----------------+
                     |                   ^
             HTTP /  |                   | Socket.io
             JSON    |                   | Events (Live GPS & System Logs)
                     v                   |
               +-----+-------------------+-----------------+
               |              DISPATCH NODE                |
               |           (Express.js Server)             |
               +-----+---------+---------+-----------------+
                     |         |         |
     AI Triage       |         |         | Database Query
     & Chat Context  |         |         | (Incident/Responder Records)
                     v         |         v
            +--------+-----+   |   +-----+--------+
            |  GEMINI FLASH|   |   |   MONGODB    |
            |   AI ENGINE  |   |   |  (Mongoose)  |
            +--------------+   |   +--------------+
                               v
                     +-------------------+
                     |    GPS MOTOR      |
                     | (Simulation Loop) |
                     +-------------------+
```

---

## ⚡ Signature Features

1. **AI dispatch cognition** — Real-time emergency classification with Gemini. Automatically triages description severity (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`), extracts victim counts, establishes a threat priority score, and dictates dispatcher immediate actions.
2. **Tactical Radar Array** — Real-time interactive SVG map centering on camp/local coordinates. Renders live responder units, tracks simulated GPS routes, and renders trail vectors.
3. **Registry sidebar** — Live searchable & filterable incident table database matching dispatch state.
4. **Command Intelligence chatbot** — Gemini-powered assistant with full operational context history. Dispatchers can query active, unassigned, or en-route telemetry.
5. **Real-time GPS simulation** — Auto-advances dispatched units, logs system logs, updates ETAs, and triggers arrival alerts.
6. **Toast notification banners** — Real-time interrupt system alerting dispatchers of newly filed critical cases.

---

## ⚙️ Quick Start Setup

### Prerequisites
- Node.js (v18+)
- MongoDB running locally (`mongodb://localhost:27017`)

### 1. Setup Backend Server
```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Copy example environment configuration
cp .env.example .env

# Configure .env:
# Add your GEMINI_API_KEY for full AI dispatch capabilities
```

### 2. Start Servers
Run the backend:
```bash
npm run dev
```

Run the frontend:
```bash
# Navigate to frontend
cd ../frontend

# Install dependencies
npm install

# Start Vite server
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## ⌨️ Tactical Controls (Hotkeys)
- <kbd>N</kbd> — Open Reporting Form (Deselect Active Case)
- <kbd>ESC</kbd> — Deselect / Close Detail View
