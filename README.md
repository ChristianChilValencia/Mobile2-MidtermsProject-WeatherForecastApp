Here’s a cleaner, Markdown-formatted version of your Weather Forecast App documentation for your GitHub README:

---

# 🌦️ Weather Forecast App

A mobile application built with **Ionic + Angular** that provides real-time weather and forecasts using the **OpenWeatherMap API**.

---

## 📱 Features

### Core
- **Current Weather:** Temperature, humidity, wind speed
- **24-Hour Forecast:** Scrollable hourly data with icons
- **5-Day Forecast:** Daily summaries
- **Location Detection:** Auto-fetch by GPS
- **City Search:** Search weather by city

### User Preferences
- **Theme Switcher:** Light/Dark mode
- **Temperature Units:** Celsius / Fahrenheit
- **Offline Support:** View cached data offline
- **Weather Alerts:** Toggleable severe weather notifications

---

## ⚙️ Technical Overview

### Architecture
- Ionic + Angular framework
- Capacitor for native functionality
- Responsive design
- Service-based modular codebase

### Key Components
- `HomePage`: Main UI for weather display
- `CommonService`: Shared logic for themes, location, notifications

### API Integration
- **OpenWeatherMap Endpoints:**
  - `/weather`: Current weather
  - `/forecast`: Hourly & 5-day forecast
  - `/geo/1.0/reverse`: Location detection

### Storage
- Uses Capacitor Preferences API
- Persists:
  - Temperature unit
  - Theme
  - Last searched city
  - Notification settings

### Native Features
- **Geolocation:** Get current location
- **Network Status:** Handle offline mode
- **Notifications:** Show severe alerts

---

## 🧑‍🎨 UI Design

- Glassmorphism cards with blur effects
- Visual weather icons
- Full theme support (Dark/Light)
- Responsive layouts
- Action sheet for quick settings

---

## 🚀 Getting Started

### Prerequisites
- Node.js + npm
- Ionic CLI: `npm install -g @ionic/cli`
- Android Studio (Android builds)
- Xcode (iOS builds on macOS)

### Installation
```bash
# Clone the repo
git clone [repository-url]
cd weatherApp

# Install dependencies
npm install

# Run in dev mode
ionic serve
```

### Build for Mobile
# Add platforms
ionic cap add android
ionic cap add ios

# Build + Sync
ionic build
ionic cap sync

# Open in IDE
ionic cap open android
ionic cap open ios
