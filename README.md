# STEMM Lab

STEMM Lab is an advanced, offline-first educational application built with **React Native (Expo)**. It is designed to transform a standard smartphone into a comprehensive science laboratory, bringing Science, Technology, Engineering, Mathematics, and Medicine (STEMM) concepts to life through real-world experiments and data collection.

This repository features robust local-first data synchronization, complex state hydration, and direct integration with native device hardware.

---

## 🌟 Core Application Features

### 1. Offline-First Architecture (Local-First Sync)
The app is built to work flawlessly in remote areas (like field trips) where internet connectivity is non-existent.
- **SQLite Persistence:** All user data, sensor logs, and activity results are immediately written to a local SQLite database (`expo-sqlite`).
- **Zustand Store Hydration:** A custom hydration engine (`src/stores/hydrateStores.ts`) reads from SQLite and injects data into Zustand stores on app launch.
- **Bi-Directional Sync:** When the device regains connectivity, the `syncService` automatically pushes local changes to **Firebase Firestore** and pulls any new data (like team leaderboards or community forum posts) down to the local database.

### 2. Interactive STEMM Activities
Guided multi-phase experimental flows (Setup → Prediction → Experimentation → Reflection).
- **Sound Pollution:** Uses `expo-audio` to capture live decibel levels and tags the measurements on an interactive map (`react-native-webview` Leaflet integration).
- **Earthquake Simulator:** Uses the device's vibration motor to simulate seismic activity while testing physical handcrafted structures.
- **Parachute Drop & Hand Fan:** Physics and engineering challenges leveraging `expo-video` for slow-motion recording and playback analysis.
- **Human Performance / Reaction Test:** Measures dominant vs. non-dominant hand reaction times using precision haptics and touch tracking.
- **Breathing Pace Trainer:** Health/Medical activity analyzing breathing patterns at rest vs. post-exercise.

### 3. Native Sensor Hub (`src/components/sensors`)
Users can access a dedicated "Sensors" tab to log standalone scientific measurements:
- **Live Sound Meter:** Captures ambient noise peaks.
- **Vibration Sensor:** Detects and measures physical vibrations.
- **Location Tag:** Pulls precise GPS coordinates.
- **Slow-Mo Video:** Records high-framerate video for analysis.
- **Reaction Timer:** Reflex measurement tool.

### 4. Community & Collaboration
- **Media-Rich Forum:** Students can post questions, upload images and videos (powered by **Cloudinary**), and reply to others.
- **Team Workspaces:** Join teams via invite codes, aggregate scores on a global Leaderboard, and collaborate on shared data.

---

## 🛠️ Technology Stack

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | React Native (Expo SDK 56) | Core application framework |
| **Routing** | Expo Router | File-based navigation (`app/` directory) |
| **State Management**| Zustand | Global UI and application state |
| **Local Database** | SQLite (`expo-sqlite`) | Offline persistence and fast reads |
| **Backend / DB** | Firebase (Firestore, Auth) | Cloud sync, User Authentication |
| **Media Hosting** | Cloudinary | Video and Image storage for the Forum |
| **Localization** | `react-i18next` | Multi-language support |
| **Styling** | Custom Theme Engine | Centralized typography and color tokens (`src/theme/`) |

---

## 📂 Project Architecture

```text
StemmLab/
├── app/                       # Expo Router navigation (screens and layouts)
│   ├── (tabs)/                # Main bottom-tab navigation 
│   │   ├── activities/        # Activity browser and details
│   │   ├── forum.tsx          # Community discussions
│   │   ├── leaderboard.tsx    # Global & Team rankings
│   │   ├── profile.tsx        # User profile & badges
│   │   └── sensors.tsx        # Live hardware sensors
│   └── _layout.tsx            # Root application layout
├── src/
│   ├── components/            
│   │   ├── activities/        # Experiment UIs (EarthquakeForm, SoundPollutionForm, etc.)
│   │   ├── forum/             # ForumComposer, PostCards, MediaAttachments
│   │   ├── sensors/           # Sensor components (SoundMeterPanel, ReactionTestPanel)
│   │   └── ui/                # Core Design System (Button, Input, Card, Modal, Chip)
│   ├── config/                # Firebase and Cloudinary initialization
│   ├── database/              # SQLite schema, migrations, repositories, and ORM mappers
│   ├── hooks/                 # Reusable hooks (useSoundMeter, useVideoRecorder)
│   ├── i18n/                  # Translation dictionaries
│   ├── services/              # API interfaces (auth, sync, team, cloudinary)
│   ├── stores/                # Zustand stores (activityStore, forumStore, sensorStore)
│   ├── theme/                 # Design tokens (Colors, Typography, Spacing, BorderRadius)
│   └── utils/                 # Formatting, search, and helper logic
└── package.json               
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/en/) (v18+)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- iOS Simulator / Android Emulator, or a physical device running **Expo Go**.

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/stemm-lab.git
   cd stemm-lab
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory. You must supply your own Firebase and Cloudinary API keys for remote syncing and media uploads to function properly.
   ```env
   EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
   
   EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
   EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
   ```

4. **Start the development server**
   ```bash
   npx expo start -c
   ```

5. **Run the application**
   - Press `a` in the terminal to launch the Android Emulator.
   - Press `i` to launch the iOS Simulator.
   - Or, scan the QR code using the **Expo Go** app on your physical device.

---

## 🔒 Device Permissions

STEMM Lab requires several native device permissions to function as a scientific tool. Users will be prompted for:
- **Microphone:** Required by the Live Sound Meter for real-time decibel tracking (`expo-audio`).
- **Camera / Media Library:** Required for capturing slow-motion physics experiments and uploading photos to the community forum.
- **Location (GPS):** Required for mapping localized data points in the Sound Pollution mapping experiment.

---

## 📄 License

This project is proprietary and intended for educational STEMM purposes. All rights reserved.
