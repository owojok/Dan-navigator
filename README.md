# Nigeria Navigation App

A modern cross-platform mobile navigation application for Nigeria using Digital Access Numbers (DAN) for precise building identification and navigation.

## Features

- **Digital Access Number (DAN)**: Unique 12-digit identifier for every building in Nigeria
- **Cross-Platform**: Built with React Native 0.81.4 and Expo SDK 54
- **Modern Architecture**: Uses Zustand for state management and TanStack Query for server state
- **Real-time Navigation**: Live GPS tracking with turn-by-turn directions
- **Mapbox Integration**: High-quality maps and routing using Mapbox SDK v10.1.45

## Technology Stack

### Frontend (Mobile App)
- React Native 0.81.4
- Expo SDK 54
- TypeScript 5.6.3
- React Navigation v7
- Mapbox React Native SDK v10.1.45
- Zustand v4.5.5 (State Management)
- TanStack Query v5.59.0 (Server State)
- React Native Paper v5.12.5 (UI Components)

### Backend
- Node.js 20.x LTS
- Express.js 4.19.2
- TypeScript 5.6.3
- PostgreSQL 16 with PostGIS
- Winston (Logging)
- Helmet (Security)

## Prerequisites

- Node.js 20.19.0 or higher
- npm or yarn
- React Native development environment
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)
- PostgreSQL with PostGIS extension

## Installation

### 1. Clone and Install Dependencies

```bash
# Install main dependencies
npm install

# Install iOS dependencies (macOS only)
cd ios && pod install && cd ..
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api
EXPO_PUBLIC_MAPBOX_TOKEN=your_mapbox_access_token_here
```

Create a `.env` file in the backend directory:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/nigeria_nav
MAPBOX_ACCESS_TOKEN=your_mapbox_access_token_here
PORT=3000
NODE_ENV=development
```

### 3. Database Setup

```sql
-- Create database
CREATE DATABASE nigeria_nav;

-- Enable PostGIS extension
CREATE EXTENSION postgis;

-- Create buildings table
CREATE TABLE buildings (
    id SERIAL PRIMARY KEY,
    dan VARCHAR(12) UNIQUE NOT NULL,
    centroid GEOMETRY(POINT, 4326) NOT NULL,
    state_code VARCHAR(2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create spatial index
CREATE INDEX idx_buildings_centroid ON buildings USING GIST (centroid);
CREATE INDEX idx_buildings_dan ON buildings (dan);
```

### 4. Backend Setup

```bash
cd backend
npm install
npm run build
npm run dev
```

### 5. Start the Mobile App

```bash
# Start Expo development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

## Project Structure

```
nigeria-nav-app/
├── src/                    # Mobile app source code
│   ├── screens/           # Screen components
│   ├── components/        # Reusable UI components
│   ├── services/         # Business logic services
│   ├── store/            # Zustand state management
│   ├── api/              # API layer with TanStack Query
│   ├── utils/            # Utility functions
│   └── types/            # TypeScript type definitions
├── android/               # Android native code
├── ios/                   # iOS native code
├── backend/               # Backend API server
│   └── src/
│       ├── routes/       # API route definitions
│       ├── services/     # Business logic
│       ├── middleware/   # Express middleware
│       └── utils/        # Utility functions
└── assets/               # Static assets
```

## Digital Access Number (DAN) System

The DAN system uses a 12-digit format: `234-XX-XXXXXXX`

- **234**: Nigeria country code
- **XX**: State code (01-37)
- **XXXXXXX**: Building identifier derived from coordinates

### State Codes

| State | Code | State | Code | State | Code |
|-------|------|-------|------|-------|------|
| Abia | 01 | Adamawa | 02 | Akwa Ibom | 03 |
| Anambra | 04 | Bauchi | 05 | Bayelsa | 06 |
| Benue | 07 | Borno | 08 | Cross River | 09 |
| Delta | 10 | Ebonyi | 11 | Edo | 12 |
| Ekiti | 13 | Enugu | 14 | FCT | 15 |
| Gombe | 16 | Imo | 17 | Jigawa | 18 |
| Kaduna | 19 | Kano | 20 | Katsina | 21 |
| Kebbi | 22 | Kogi | 23 | Kwara | 24 |
| Lagos | 25 | Nasarawa | 26 | Niger | 27 |
| Ogun | 28 | Ondo | 29 | Osun | 30 |
| Oyo | 31 | Plateau | 32 | Rivers | 33 |
| Sokoto | 34 | Taraba | 35 | Yobe | 36 |
| Zamfara | 37 | | | | |

## API Endpoints

### DAN Service
- `GET /api/dan/decode/:dan` - Decode DAN to coordinates
- `POST /api/dan/generate` - Generate DAN from building footprint

### Route Service
- `POST /api/route/calculate` - Calculate route between two points

## Usage

1. **Enter DAN**: Input a 12-digit DAN in the format 234-XX-XXXXXXX
2. **View Location**: The app displays the building location on the map
3. **Calculate Route**: Route is automatically calculated from your current location
4. **Start Navigation**: Begin turn-by-turn navigation to the destination

## Development

### Running Tests

```bash
# Run mobile app tests
npm test

# Run backend tests
cd backend && npm test
```

### Linting

```bash
# Lint mobile app
npm run lint

# Lint backend
cd backend && npm run lint
```

### Building for Production

```bash
# Build mobile app
npm run build

# Build backend
cd backend && npm run build
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue on the GitHub repository.
