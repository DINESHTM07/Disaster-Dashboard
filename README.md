# DisasterWatch (Disaster Dashboard)

A lightweight, open-source dashboard that visualizes real-time earthquake data and local weather to help users monitor and respond to natural disasters quickly and easily.

## 🔍 Project Overview

- **Live earthquake data** from the USGS feeds (hour/day/week/month)
- **Local weather** (Open-Meteo) to provide context for affected areas
- **Map and list views** for fast triage and exploration
- **Filtering and sorting** (magnitude, timeframe, location)
- **Offline-friendly** caching and retry logic for resilience

## 🚀 Features

- Real-time earthquake feed with magnitude, location, depth, and time
- Detailed view for each event including USGS detail link
- Search and proximity filters (latitude/longitude/radius)
- Auto-refresh and manual refresh controls
- Light/dark theme and accessibility-friendly markup

## ⚙️ Getting Started (Local)

1. Clone the repository:

```bash
git clone https://github.com/DINESHTM07/Disaster-Dashboard.git
cd Disaster-Dashboard
```

2. Serve the project locally (any static server). Examples:

- Using Python 3:

```bash
python -m http.server 8000
# Then open http://localhost:8000 in your browser
```

- Using npm package `serve`:

```bash
npx serve .
```

3. Open `index.html` in your browser or navigate to the local server URL.

## 🛠 Development

- The code is organized under `js/`, `css/`, and `assets/`.
- Key files:
  - `js/config.js` — constants, API endpoints, and presets
  - `js/api.js` — data fetching, caching, and retries
  - `js/app.js` — main app logic and UI orchestration
  - `js/utils.js` — helper functions

Contributions are welcome — open an issue or send a pull request.

## 📄 License

This project is licensed under the **MIT License** — see the `LICENSE` file for details.

## ✉️ Contact

- **Name**: Dinesh Senthilkumar
- **Email**: duke02101@gmail.com
- **LinkedIn**: https://www.linkedin.com/in/dineshcreativedev/
- **GitHub**: https://github.com/DINESHTM07
- **X (Twitter)**: https://x.com/DINRAEUS


