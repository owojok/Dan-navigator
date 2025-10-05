import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export interface DANResponse {
  dan: string;
  formatted: string;
  countryCode: string;
  stateCode: string;
  state: string;
  buildingId: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export interface RouteResponse {
  distance: number;
  duration: number;
  geometry: any;
  steps: any[];
}

// Decode DAN query
export const useDecodeDAN = (dan: string) => {
  return useQuery({
    queryKey: ['dan', dan],
    queryFn: async (): Promise<DANResponse> => {
      const { data } = await apiClient.get(`/dan/decode/${dan}`);
      return data;
    },
    enabled: !!dan && dan.length === 12,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Calculate route query
export const useCalculateRoute = (origin: any, destination: any) => {
  return useQuery({
    queryKey: ['route', origin, destination],
    queryFn: async (): Promise<RouteResponse> => {
      const { data } = await apiClient.post('/route/calculate', {
        origin,
        destination,
      });
      return data;
    },
    enabled: !!origin && !!destination,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
