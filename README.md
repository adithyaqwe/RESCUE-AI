# 🚀 RESCUEAI — Institutional Municipal Emergency Operations Center (EOC) CAD & GIS Platform

RESCUEAI is an enterprise-grade, real-time emergency operations center (EOC) CAD & GIS dispatch platform. Engineered for municipal emergency management, fire service, ambulance dispatch, and police operations, it translates chaotic raw distress inputs into triaged emergency profiles, recommends nearest available apparatus, calculates real-time routes, and provides interactive 2D/3D light GIS command cartography.

---

## 🗺️ System Architecture

```text
               +-------------------------------------------------------------+
               |                 MUNICIPAL OPERATOR DESK                     |
               | (React Light EOC CAD, Inter Typography, Custom MouseLight)  |
               +----------------------+--------------------------------------+
                                      |                      ^
                              HTTP /  |                      | Socket.io
                              JSON    |                      | Real-Time Events
                                      v                      |
               +----------------------+--------------------------------------+
               |                   DISPATCH NODE                             |
               |                (Express.js Server)                          |
               +----------------------+----------+-----------+---------------+
                                      |          |           |
                      AI Dispatch     |          |           | Database Query
                      & Triage        |          |           | (Mongoose Records)
                                      v          |           v
                             +--------+------+   |   +-------+-------+
                             | GEMINI FLASH  |   |   |   MONGODB     |
                             |  AI ENGINE    |   |   |  (Mongoose)   |
                             +---------------+   |   +---------------+
                                                 v
                                       +-------------------+
                                       |  AVL GPS MOTOR    |
                                       | (Simulation Loop) |
                                       +-------------------+
```

---

## ⚡ Key Features

1. **Light Municipal GIS Cartography**:
   - **Positron Light Cartography**: Warm off-white land canvas, light gray roads, subtle blue water channels (`#D0E1F9`), and muted green park spaces.
   - **Subtle 3D Buildings**: Low extrusion height, muted architectural gray footprints (`#E4E7E1` to `#D5D9D1`) with 2D/3D toggleability.
   - **Real Vadodara Geography**: Vadodara, Makarpura GIDC, Akota, Alkapuri, Manjalpur, Fatehgunj, Old Padra Road, NH48, and Vishwamitri River.
2. **Small Professional GIS Markers & Progressive Disclosure**:
   - Small rectangular unit badges (`gis-unit-badge-clean`) with vehicle icons (🚑 Ambulance, 🚒 Fire Engine, 🚔 Police, 🩺 Medical) + Callsign + status accent dot.
   - Clean 22px red circular incident symbols with zoom-based progressive disclosure (`zoom >= 14.5`).
   - Forest green dispatch route lines (`#164E3D`) with white casing and direction chevrons.
3. **Flagship 3-Column Operations Command Center**:
   - **Incident Queue (380px)**: Compact list with 3px priority indicator lines, Indian address hierarchy, casualties, and search filtering.
   - **Live GIS Map**: Flexible central workspace.
   - **Dispatch Intelligence (360px)**: Decision-support dossier rendering call details, casualties, status pipeline, recommended apparatus, ETA, route condition, and primary dispatch actions.
4. **Enterprise Apparatus Roster & Call Archive**:
   - High-density data tables formatted with ~52–60px row heights, compact typography, status dots, and hover highlights.
5. **Emergency Call Intake Workflow**:
   - Operator-first form layout with preset shortcuts, caller narrative entry, required field indicators, and clear submission actions.
6. **Bottom Telemetry Bar**:
   - OS-style status footer displaying apparatus status breakdown (`Available`, `En route`, `On scene`, `Offline`), active call counts, critical incident counts, CAD Live link, and EOC station location.

---

## ⚙️ Quick Start Setup

### Prerequisites
- Node.js (v18+)
- MongoDB running locally (`mongodb://localhost:27017/rescue-ai`)

### 1. Setup Backend Server
```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Start backend server
npm run dev
```

### 2. Setup Frontend Application
```bash
# Navigate to frontend
cd ../frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## ⌨️ Operational Hotkeys
- <kbd>ESC</kbd> — Deselect / Close Incident Dossier View
