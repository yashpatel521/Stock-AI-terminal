# ⚡ Stock AI Terminal: Institutional-Grade Market Intelligence

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)](https://nextjs.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.0-06B6D4?logo=tailwind-css)](https://tailwindcss.com/)
[![SQLite](https://img.shields.io/badge/Database-SQLite-003B57?logo=sqlite)](https://sqlite.org/)
[![Drizzle ORM](https://img.shields.io/badge/ORM-Drizzle-C5F74F?logo=drizzle)](https://orm.drizzle.team/)
[![NextAuth](https://img.shields.io/badge/Auth-NextAuth.js-0070F3?logo=next.js)](https://next-auth.js.org/)
[![Gemini AI](https://img.shields.io/badge/AI-Gemini_2.5_Flash-9B51E0?logo=google-gemini)](https://deepmind.google/technologies/gemini/)

An open-source, high-performance stock scanning and analysis cockpit. Real-time pricing feeds, institutional-grade AI strategy reports, interactive TradingView-style charting, and multi-user isolation.

Designed with a premium **Wealthsimple-inspired** interface featuring an instant, cyclical light-and-dark theme system.

---

## 🚀 Key Features

* **⚡ Real-Time Streaming Watchlist**: Live quote streams pushed directly over Finnhub WebSockets. Ticker rows flash dynamic green and red indicators on trade event pulses.
* **🔮 Global AI Market Scanner (`/stockreport`)**: A single-button institutional scanning loop. Feeds a comprehensive macroeconomic prompt (CPI, PPI, dark pool flows, technical indicators, sector strengths) to Gemini to compute the **5 best stock setups today** with price levels and confidence metrics.
* **🧠 Individual Analyst Copilot**: Generates multi-factor trade reports (catalysts, entry coordinates, stop-loss zones, and risk ratings) using Gemini, storing logs *time-wise* inside SQLite.
* **📈 Unified Terminal Cockpit**: Tabbed workstation combining interactive 90-day candlestick charts (`lightweight-charts`), paginated Yahoo Finance headlines, and your ticker's past research history.
* **🌓 Cyclical Theme Switcher**: Wealthsimple-style light mode (pure off-white grids) and carbon cockpit dark mode (dark navy dashboards) syncing to your local system's preferences at the click of a button.
* **🔒 Isolated Multi-User Watchlists**: Secure NextAuth session credentials mapping watchlists and AI report logs specifically to database user IDs.

---

## 🎨 Design Theme Philosophy

Stock AI Terminal is styled with custom Tailwind CSS v4 variables mapping theme attributes dynamically:

| Component | ☀️ Light Theme (Wealthsimple) | 🌙 Dark Theme (Cockpit Slate) |
| :--- | :--- | :--- |
| **Global Background** | Soft Off-white (`#F9FAFB`) | Deep Charcoal (`#0D0F14`) |
| **Cards & Panels** | Pure White (`#FFFFFF`) | Cockpit Grey (`#151821`) |
| **Borders & Dividers** | Thin Light-grey (`#E5E7EB`) | Dark Carbon (`#222632`) |
| **Primary Buttons** | Pitch Black (`bg-black`) | Crisp White (`bg-white`) |
| **Accent Colors** | Emerald `#00B074` / Ruby `#DF2E38` | Emerald `#089981` / Crimson `#F23645` |

---

## 🛠️ Technology Stack

* **Frontend**: Next.js (App Router, Client Components, Server Actions)
* **Styling**: Tailwind CSS v4 (using CSS `@theme` variables)
* **Charts**: TradingView's lightweight-charts engine
* **Database**: SQLite powered by Drizzle ORM
* **Authentication**: NextAuth.js JWT credential provider
* **AI Engine**: Google Gemini Pro (via `@google/generative-ai` SDK)
* **API Providers**: Yahoo Finance (headlines & history) and Finnhub (live Websocket quotes)

---

## 🏁 Getting Started & Local Setup

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/yashpatel521/Stock-AI-terminal.git
cd Stock-AI-terminal
npm install
```

### 2. Environment Variables Configuration
Create a `.env` file in the root directory and add the following keys:
```env
# Google Gemini API Credentials
GEMINI_API_KEY=your_gemini_api_key_here

# Finnhub API Key (for WebSocket quotes)
FINNHUB_TOKEN=your_finnhub_token_here

# NextAuth Config
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate_a_random_32_character_string_here
```

### 3. Initialize the Database
```bash
# Push schemas to SQLite
npx drizzle-kit push
```

### 4. Run local server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) inside your browser. Register an account, log in, search for tickers, and trigger the AI analyst!

---

## 📁 Project Architecture

```
├── app
│   ├── (protected)       # Session protected router pages (Dashboard, Watchlist, Ideas)
│   ├── api               # Next.js Serverless Route Endpoints
│   │   ├── analyze       # Gemini individual ticker research POST/GET
│   │   ├── market-scan   # Institutional scan (/stockreport) POST/GET
│   │   ├── watchlist     # SQLite watchlist controller handlers
│   │   └── stock-info    # Yahoo Finance headlines + Finnhub quote endpoints
│   ├── layout.tsx        # App entry layout (Outfits/Inter Fonts)
│   └── globals.css       # Tailwind CSS import & Multi-Theme variables setup
├── components
│   ├── ThemeProvider.tsx # Client theme context controller
│   ├── Header.tsx        # Top actions and theme cyclical switcher
│   ├── Sidebar.tsx       # Sidebar navigation tabs
│   ├── StockChart.tsx    # Lightweight interactive candlestick chart canvas
│   └── AIRecommendations.tsx # Market Scan (/stockreport) & Research History tables
├── db
│   ├── db.ts             # SQLite connection wrapper
│   └── schema.ts         # Users, watchlist, analyses, and scans Drizzle schemas
└── store
    └── useStockStore.ts  # Zustand global store for state, user and socket quote events
```

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.
