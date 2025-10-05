import * as Location from 'expo-location';
import { Alert } from 'react-native';

export interface NavigationStep {
  instruction: string;
  distance: number;
  duration: number;
  maneuver: {
    type: string;
    modifier?: string;
  };
}

export interface NavigationProgress {
  distanceRemaining: number;
  durationRemaining: number;
  currentStepIndex: number;
  nextInstruction?: string;
}

export class NavigationService {
  private destination: { latitude: number; longitude: number } | null = null;
  private route: any = null;
  private isNavigating = false;
  private locationSubscription: Location.LocationSubscription | null = null;
  private progressCallback: ((progress: NavigationProgress) => void) | null = null;

  async startNavigation(
    destination: { latitude: number; longitude: number },
    route: any,
    onProgress: (progress: NavigationProgress) => void
  ): Promise<boolean> {
    try {
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Location permission is needed for navigation');
        return false;
      }

      this.destination = destination;
      this.route = route;
      this.isNavigating = true;
      this.progressCallback = onProgress;

      // Start location tracking
      this.locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 1000, // Update every second
          distanceInterval: 5, // Update every 5 meters
        },
        this.handleLocationUpdate.bind(this)
      );

      return true;
    } catch (error) {
      console.error('Failed to start navigation:', error);
      return false;
    }
  }

  stopNavigation(): void {
    this.isNavigating = false;
    this.destination = null;
    this.route = null;
    this.progressCallback = null;

    if (this.locationSubscription) {
      this.locationSubscription.remove();
      this.locationSubscription = null;
    }
  }

  private handleLocationUpdate(location: Location.LocationObject): void {
    if (!this.isNavigating || !this.destination || !this.progressCallback) {
      return;
    }

    const currentLocation = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };

    // Calculate distance to destination
    const distanceToDestination = this.calculateDistance(
      currentLocation,
      this.destination
    );

    // Check if arrived (within 20 meters)
    if (distanceToDestination < 0.02) {
      this.handleArrival();
      return;
    }

    // Calculate progress
    const progress: NavigationProgress = {
      distanceRemaining: distanceToDestination,
      durationRemaining: this.estimateDuration(distanceToDestination),
      currentStepIndex: this.getCurrentStepIndex(currentLocation),
      nextInstruction: this.getNextInstruction(currentLocation),
    };

    this.progressCallback(progress);
  }

  private handleArrival(): void {
    Alert.alert(
      'Destination Reached',
      'You have arrived at your destination!',
      [{ text: 'OK', onPress: () => this.stopNavigation() }]
    );
  }

  private calculateDistance(
    point1: { latitude: number; longitude: number },
    point2: { latitude: number; longitude: number }
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(point2.latitude - point1.latitude);
    const dLon = this.toRadians(point2.longitude - point1.longitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(point1.latitude)) *
        Math.cos(this.toRadians(point2.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private estimateDuration(distanceKm: number): number {
    // Rough estimate: 30 km/h average speed in city
    return (distanceKm / 30) * 3600; // seconds
  }

  private getCurrentStepIndex(location: { latitude: number; longitude: number }): number {
    // Simplified implementation - in real app, would use route geometry
    return 0;
  }

  private getNextInstruction(location: { latitude: number; longitude: number }): string {
    // Simplified implementation - in real app, would use route steps
    return 'Continue straight';
  }

  formatDistance(distanceKm: number): string {
    if (distanceKm < 1) {
      return `${Math.round(distanceKm * 1000)}m`;
    }
    return `${distanceKm.toFixed(1)}km`;
  }

  formatDuration(durationSeconds: number): string {
    const hours = Math.floor(durationSeconds / 3600);
    const minutes = Math.floor((durationSeconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }
}

export const navigationService = new NavigationService();
