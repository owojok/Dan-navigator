import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Button, ProgressBar } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';

import { navigationService, NavigationProgress } from '../services/NavigationService';
import { useCalculateRoute } from '../api/danApi';
import { useAppStore } from '../store/useAppStore';
import type { RootStackParamList } from '../../App';

type NavigationScreenRouteProp = RouteProp<RootStackParamList, 'Navigation'>;

const NavigationScreen: React.FC = () => {
  const route = useRoute<NavigationScreenRouteProp>();
  const navigation = useNavigation();
  const { destination } = route.params;
  const { currentLocation } = useAppStore();

  const [progress, setProgress] = useState<NavigationProgress | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  const { data: routeData } = useCalculateRoute(currentLocation, destination);

  useEffect(() => {
    if (routeData && currentLocation) {
      startNavigation();
    }

    return () => {
      navigationService.stopNavigation();
    };
  }, [routeData, currentLocation]);

  const startNavigation = async () => {
    if (!routeData || !currentLocation) return;

    const success = await navigationService.startNavigation(
      destination,
      routeData,
      handleProgressUpdate
    );

    setIsNavigating(success);
  };

  const handleProgressUpdate = (newProgress: NavigationProgress) => {
    setProgress(newProgress);
  };

  const handleStopNavigation = () => {
    navigationService.stopNavigation();
    setIsNavigating(false);
    navigation.goBack();
  };

  if (!isNavigating || !progress) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Starting navigation...</Text>
      </View>
    );
  }

  const progressPercentage = routeData 
    ? 1 - (progress.distanceRemaining / (routeData.distance / 1000))
    : 0;

  return (
    <View style={styles.container}>
      <Card style={styles.progressCard}>
        <Card.Content>
          <Text variant="headlineSmall" style={styles.instruction}>
            {progress.nextInstruction || 'Continue straight'}
          </Text>
          
          <ProgressBar 
            progress={Math.max(0, Math.min(1, progressPercentage))} 
            style={styles.progressBar}
          />
          
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text variant="bodyLarge">
                {navigationService.formatDistance(progress.distanceRemaining)}
              </Text>
              <Text variant="bodySmall">Remaining</Text>
            </View>
            
            <View style={styles.stat}>
              <Text variant="bodyLarge">
                {navigationService.formatDuration(progress.durationRemaining)}
              </Text>
              <Text variant="bodySmall">ETA</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        onPress={handleStopNavigation}
        style={styles.stopButton}
        buttonColor="#FF3B30"
      >
        Stop Navigation
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressCard: {
    marginTop: 32,
  },
  instruction: {
    textAlign: 'center',
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  stopButton: {
    position: 'absolute',
    bottom: 32,
    left: 16,
    right: 16,
  },
});

export default NavigationScreen;
