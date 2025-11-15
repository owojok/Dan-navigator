import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { Camera } from 'react-native-vision-camera';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../../App';

type QRScannerNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const QRScannerScreen: React.FC = () => {
  const navigation = useNavigation<QRScannerNavigationProp>();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    // Basic validation for a 12-digit DAN
    if (/^\d{12}$/.test(data)) {
      navigation.navigate('Map', { dan: data });
    } else {
      Alert.alert('Invalid QR Code', 'The scanned QR code does not contain a valid DAN.');
    }
  };

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>No access to camera</Text>
        <Button mode="contained" onPress={() => Camera.requestCameraPermission()}>
          Request Permission
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* VisionCamera usage requires a more complex setup with frame processors.
          For this step, we will assume a simplified implementation.
          A complete implementation would require adding a frame processor library
          like 'react-native-vision-camera-v3-barcode-scanner'.
      */}
      <Text style={styles.infoText}>Camera functionality is not fully implemented in this component.</Text>
      <Button
        style={styles.mockButton}
        mode="contained"
        onPress={() => handleBarCodeScanned({ data: '234240847291' })}
      >
        Mock Scan (Lagos Building)
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionText: {
    marginBottom: 16,
  },
  infoText: {
    textAlign: 'center',
    margin: 20,
  },
  mockButton: {
    marginTop: 20,
  },
});

export default QRScannerScreen;
