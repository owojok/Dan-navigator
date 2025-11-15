# Nigeria Navigation App

A modern cross-platform mobile navigation application for Nigeria using Digital Access Numbers (DAN) for precise building identification and navigation.

## Features

- **Digital Access Number (DAN)**: Unique 12-digit identifier for every building in Nigeria.
- **Cross-Platform**: Built with React Native.
- **Real-time Navigation**: Live GPS tracking.
- **QR Code Integration**: Share and scan DANs via QR codes.
- **Offline Capabilities**: Pre-seeds a local database with public building data.

## Technology Stack

- React Native
- TypeScript
- React Navigation
- Mapbox
- Zustand (State Management)
- TanStack Query (Server State)
- React Native Paper (UI Components)
- SQLite (On-device database)

## Prerequisites

- Node.js (LTS version recommended)
- npm or yarn
- A configured React Native development environment (see the [official documentation](https://reactnative.dev/docs/environment-setup))
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

## Installation

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd <repository-directory>

# Install dependencies
npm install
```

### 2. Environment Setup

This project uses Mapbox for mapping and navigation. You will need to obtain an access token from the [Mapbox website](https://www.mapbox.com/).

Once you have your token, create a `.env` file in the root of the project and add the following line:

```env
EXPO_PUBLIC_MAPBOX_TOKEN=your_mapbox_access_token_here
```

## Running the App

```bash
# Start the Metro bundler
npm start

# Run on an Android device/emulator
npm run android

# Run on an iOS device/simulator (macOS only)
npm run ios
```

## Project Structure

```
dan-navigator/
├── src/                    # Mobile app source code
│   ├── api/              # API layer with TanStack Query
│   ├── screens/          # Screen components
│   ├── services/         # Business logic and services (Database, Navigation)
│   ├── store/            # Zustand state management
│   └── utils/            # Utility functions (DAN Generation, State Codes)
├── assets/               # Static assets (images, data)
├── android/              # Android native code
└── ios/                  # iOS native code
```

## The Digital Access Number (DAN) System

The DAN is a permanent, immutable 12-digit identifier for every building in Nigeria. It's generated using a deterministic formula, ensuring that a building's DAN never changes.

**Format**: `[Country Code][State Code][Building Hash]`

- **Country Code**: `234` (3 digits)
- **State Code**: A 2-digit code representing one of Nigeria's 36 states or the FCT.
- **Building Hash**: A 7-digit hash generated from the building's geographic coordinates (latitude and longitude).

This system ensures that every building has a permanent, easy-to-use address for navigation, logistics, and emergency services.

### Public Building Data

The app comes pre-loaded with a database of public buildings, such as hospitals, schools, and police stations. This data is sourced from a GeoJSON file located in the `assets/data` directory and is seeded into the local SQLite database when the app is first launched.
