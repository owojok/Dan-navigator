import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface Location {
  latitude: number;
  longitude: number;
}

interface AppState {
  currentLocation: Location | null;
  isLocationPermissionGranted: boolean;
  mapboxAccessToken: string | null;
  
  // Actions
  setCurrentLocation: (location: Location) => void;
  setLocationPermission: (granted: boolean) => void;
  setMapboxToken: (token: string) => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    (set) => ({
      currentLocation: null,
      isLocationPermissionGranted: false,
      mapboxAccessToken: null,
      
      setCurrentLocation: (location) => 
        set({ currentLocation: location }, false, 'setCurrentLocation'),
      
      setLocationPermission: (granted) => 
        set({ isLocationPermissionGranted: granted }, false, 'setLocationPermission'),
      
      setMapboxToken: (token) => 
        set({ mapboxAccessToken: token }, false, 'setMapboxToken'),
    }),
    { name: 'app-store' }
  )
);
