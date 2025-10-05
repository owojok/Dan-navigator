import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Button, Card, Text, ActivityIndicator } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import MapboxGL from '@rnmapbox/maps';
import * as Location from 'expo-location';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';

import { useDecodeDAN, useCalculateRoute } from '../api/danApi';
import { useAppStore } from '../store/useAppStore';
import type { RootStackParamList } from '../../App';

// Set your Mapbox access token
MapboxGL.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_TOKEN || 'pk.eyJ1IjoibmlnZXJpYW5hdiIsImEiOiJjbTJkZWZoZXcwMGZzMmxzZGVxZWJhZGZzIn0.example');

type MapScreenRouteProp = RouteProp<RootStackParamList, 'Map'>;
type MapScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Map'>;

const MapScreen: React.FC = () => {
  const route = useRoute<MapScreenRouteProp>();
  const navigation = useNavigation<MapScreenNavigationProp>();
  const { dan } = route.params || {};
  
  const { currentLocation, setCurrentLocation } = useAppStore();
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Decode DAN to get destination
  const { 
    data: danData, 
    isLoading: isDanLoading, 
    error: danError 
  } = useDecodeDAN(dan || '');

  // Calculate route when we have both locations
  const { 
    data: routeData, 
    isLoading: isRouteLoading 
  } = useCalculateRoute(
    currentLocation, 
    danData?.coordinates
  );

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required for navigation');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to get current location');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleStartNavigation = () => {
    if (danData?.coordinates) {
      navigation.navigate('Navigation', { 
        destination: danData.coordinates 
      });
    }
  };

  if (isDanLoading || isLoadingLocation) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (danError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Error: {danError.message || 'Failed to decode DAN'}
        </Text>
        <Button mode="contained" onPress={() => navigation.goBack()}>
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapboxGL.MapView style={styles.map}>
        <MapboxGL.Camera
          centerCoordinate={
            currentLocation 
              ? [currentLocation.longitude, currentLocation.latitude]
              : [3.3792, 6.5244] // Default to Lagos
          }
          zoomLevel={12}
        />

        {/* Current location marker */}
        {currentLocation && (
          <MapboxGL.PointAnnotation
            id="currentLocation"
            coordinate={[currentLocation.longitude, currentLocation.latitude]}
          >
            <View style={styles.currentLocationMarker} />
          </MapboxGL.PointAnnotation>
        )}

        {/* Destination marker */}
        {danData?.coordinates && (
          <MapboxGL.PointAnnotation
            id="destination"
            coordinate={[danData.coordinates.longitude, danData.coordinates.latitude]}
          >
            <View style={styles.destinationMarker} />
          </MapboxGL.PointAnnotation>
        )}

        {/* Route line */}
        {routeData?.geometry && (
          <MapboxGL.ShapeSource id="routeSource" shape={routeData.geometry}>
            <MapboxGL.LineLayer
              id="routeLayer"
              style={{
                lineColor: '#3887be',
                lineWidth: 5,
                lineOpacity: 0.84,
              }}
            />
          </MapboxGL.ShapeSource>
        )}
      </MapboxGL.MapView>

      {/* Route info card */}
      {danData && (
        <Card style={styles.infoCard}>
          <Card.Content>
            <Text variant="titleMedium">Destination Found</Text>
            <Text variant="bodyMedium">DAN: {danData.formatted}</Text>
            <Text variant="bodyMedium">State: {danData.state}</Text>
            
            {routeData && (
              <>
                <Text variant="bodyMedium">
                  Distance: {(routeData.distance / 1000).toFixed(1)} km
                </Text>
                <Text variant="bodyMedium">
                  Duration: {Math.round(routeData.duration / 60)} minutes
                </Text>
              </>
            )}

            <Button
              mode="contained"
              onPress={handleStartNavigation}
              disabled={!routeData || isRouteLoading}
              loading={isRouteLoading}
              style={styles.navButton}
            >
              Start Navigation
            </Button>
          </Card.Content>
        </Card>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 16,
  },
  currentLocationMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#007AFF',
    borderWidth: 3,
    borderColor: 'white',
  },
  destinationMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF3B30',
    borderWidth: 3,
    borderColor: 'white',
  },
  infoCard: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  navButton: {
    marginTop: 12,
  },
});

export default MapScreen;
