import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { 
  TextInput, 
  Button, 
  Card, 
  Title, 
  Paragraph,
  HelperText 
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../../App';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen: React.FC = () => {
  const [dan, setDan] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const validateDAN = (input: string): boolean => {
    // Remove any formatting
    const cleanDAN = input.replace(/[-\s]/g, '');
    
    // Check if it's exactly 12 digits
    if (cleanDAN.length !== 12 || !/^\d{12}$/.test(cleanDAN)) {
      return false;
    }
    
    // Check if it starts with 234 (Nigeria country code)
    if (!cleanDAN.startsWith('234')) {
      return false;
    }
    
    return true;
  };

  const handleSearch = async () => {
    if (!validateDAN(dan)) {
      Alert.alert(
        'Invalid DAN',
        'Please enter a valid 12-digit Digital Access Number starting with 234'
      );
      return;
    }

    setIsLoading(true);
    try {
      navigation.navigate('Map', { dan: dan.replace(/[-\s]/g, '') });
    } catch (error) {
      Alert.alert('Error', 'Failed to navigate to map');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDAN = (input: string) => {
    // Remove all non-digits
    const digits = input.replace(/\D/g, '');
    
    // Limit to 12 digits
    const limited = digits.slice(0, 12);
    
    // Format as XXX-XX-XXXXXXX
    if (limited.length <= 3) {
      return limited;
    } else if (limited.length <= 5) {
      return `${limited.slice(0, 3)}-${limited.slice(3)}`;
    } else {
      return `${limited.slice(0, 3)}-${limited.slice(3, 5)}-${limited.slice(5)}`;
    }
  };

  const handleDANChange = (text: string) => {
    const formatted = formatDAN(text);
    setDan(formatted);
  };

  const isValidDAN = validateDAN(dan);

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Nigeria Navigation</Title>
          <Paragraph style={styles.subtitle}>
            Enter a Digital Access Number to navigate to any building in Nigeria
          </Paragraph>
          
          <TextInput
            label="Digital Access Number (DAN)"
            value={dan}
            onChangeText={handleDANChange}
            placeholder="234-XX-XXXXXXX"
            keyboardType="numeric"
            maxLength={14} // Including dashes
            style={styles.input}
            error={dan.length > 0 && !isValidDAN}
          />
          
          <HelperText type={dan.length > 0 && !isValidDAN ? 'error' : 'info'}>
            {dan.length > 0 && !isValidDAN 
              ? 'Invalid DAN format. Must be 12 digits starting with 234'
              : 'Format: 234-XX-XXXXXXX (Country-State-Building)'
            }
          </HelperText>
          
          <Button
            mode="contained"
            onPress={handleSearch}
            disabled={!isValidDAN || isLoading}
            loading={isLoading}
            style={styles.button}
          >
            Search & Navigate
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  card: {
    marginTop: 32,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    marginBottom: 8,
  },
  button: {
    marginTop: 16,
  },
});

export default HomeScreen;
