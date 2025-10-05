import { Pool } from 'pg';

export interface BuildingFootprint {
  coordinates: number[][];
  state: string;
  properties?: Record<string, any>;
}

export interface DANResult {
  dan: string;
  formatted: string;
  centroid: {
    latitude: number;
    longitude: number;
  };
  state: string;
  stateCode: string;
}

export class DANService {
  private static readonly STATE_CODES: Record<string, string> = {
    'AB': '01', 'AD': '02', 'AK': '03', 'AN': '04', 'BA': '05',
    'BY': '06', 'BE': '07', 'BO': '08', 'CR': '09', 'DE': '10',
    'EB': '11', 'ED': '12', 'EK': '13', 'EN': '14', 'FC': '15',
    'GO': '16', 'IM': '17', 'JI': '18', 'KD': '19', 'KN': '20',
    'KT': '21', 'KE': '22', 'KO': '23', 'KW': '24', 'LA': '25',
    'NA': '26', 'NI': '27', 'OG': '28', 'ON': '29', 'OS': '30',
    'OY': '31', 'PL': '32', 'RI': '33', 'SO': '34', 'TA': '35',
    'YO': '36', 'ZA': '37'
  };

  private static readonly NIGERIA_BOUNDS = {
    minLat: 4.2,
    maxLat: 13.9,
    minLon: 2.7,
    maxLon: 14.7
  };

  constructor(private db: Pool) {}

  generateDAN(footprint: BuildingFootprint): DANResult {
    const { coordinates, state } = footprint;
    
    if (!DANService.STATE_CODES[state.toUpperCase()]) {
      throw new Error(`Invalid state code: ${state}`);
    }

    const centroid = this.calculateCentroid(coordinates);
    const buildingId = this.generateBuildingId(centroid.latitude, centroid.longitude);
    const stateCode = DANService.STATE_CODES[state.toUpperCase()];
    const dan = `234${stateCode}${buildingId}`;

    return {
      dan,
      formatted: `${dan.slice(0, 3)}-${dan.slice(3, 5)}-${dan.slice(5)}`,
      centroid,
      state: state.toUpperCase(),
      stateCode
    };
  }

  async decodeDAN(dan: string): Promise<{
    dan: string;
    formatted: string;
    coordinates: { latitude: number; longitude: number };
    state: string;
    stateCode: string;
  }> {
    const cleanDAN = dan.replace(/[-\s]/g, '');
    
    if (cleanDAN.length !== 12 || !cleanDAN.startsWith('234')) {
      throw new Error('Invalid DAN format');
    }

    const stateCode = cleanDAN.slice(3, 5);
    const buildingId = cleanDAN.slice(5);

    // Find state from code
    const stateEntry = Object.entries(DANService.STATE_CODES)
      .find(([_, code]) => code === stateCode);
    
    if (!stateEntry) {
      throw new Error(`Invalid state code: ${stateCode}`);
    }

    // Query database for exact coordinates
    try {
      const result = await this.db.query(
        'SELECT ST_X(centroid) as longitude, ST_Y(centroid) as latitude FROM buildings WHERE dan = $1',
        [cleanDAN]
      );

      if (result.rows.length === 0) {
        throw new Error('Building not found in database');
      }

      const { latitude, longitude } = result.rows[0];

      return {
        dan: cleanDAN,
        formatted: `${cleanDAN.slice(0, 3)}-${cleanDAN.slice(3, 5)}-${cleanDAN.slice(5)}`,
        coordinates: { latitude: parseFloat(latitude), longitude: parseFloat(longitude) },
        state: stateEntry[0],
        stateCode
      };
    } catch (dbError) {
      // Fallback to approximate coordinates if not in database
      const approxCoords = this.approximateCoordinatesFromDAN(buildingId);
      
      return {
        dan: cleanDAN,
        formatted: `${cleanDAN.slice(0, 3)}-${cleanDAN.slice(3, 5)}-${cleanDAN.slice(5)}`,
        coordinates: approxCoords,
        state: stateEntry[0],
        stateCode
      };
    }
  }

  private calculateCentroid(coordinates: number[][]): { latitude: number; longitude: number } {
    if (!coordinates || coordinates.length === 0) {
      throw new Error('Invalid coordinates');
    }

    let totalLat = 0;
    let totalLon = 0;
    let count = 0;

    for (const coord of coordinates) {
      if (coord.length >= 2) {
        totalLon += coord[0];
        totalLat += coord[1];
        count++;
      }
    }

    if (count === 0) {
      throw new Error('No valid coordinates found');
    }

    return {
      latitude: totalLat / count,
      longitude: totalLon / count
    };
  }

  private generateBuildingId(latitude: number, longitude: number): string {
    const normalizedLat = Math.max(0, Math.min(1, 
      (latitude - DANService.NIGERIA_BOUNDS.minLat) / 
      (DANService.NIGERIA_BOUNDS.maxLat - DANService.NIGERIA_BOUNDS.minLat)
    ));
    
    const normalizedLon = Math.max(0, Math.min(1,
      (longitude - DANService.NIGERIA_BOUNDS.minLon) / 
      (DANService.NIGERIA_BOUNDS.maxLon - DANService.NIGERIA_BOUNDS.minLon)
    ));

    const latInt = Math.floor(normalizedLat * 9999);
    const lonInt = Math.floor(normalizedLon * 999);
    
    const buildingId = latInt * 1000 + lonInt;
    return buildingId.toString().padStart(7, '0');
  }

  private approximateCoordinatesFromDAN(buildingId: string): { latitude: number; longitude: number } {
    const buildingIdInt = parseInt(buildingId);
    const latInt = Math.floor(buildingIdInt / 1000);
    const lonInt = buildingIdInt % 1000;

    const normalizedLat = latInt / 9999;
    const normalizedLon = lonInt / 999;

    const latitude = DANService.NIGERIA_BOUNDS.minLat + 
      normalizedLat * (DANService.NIGERIA_BOUNDS.maxLat - DANService.NIGERIA_BOUNDS.minLat);
    
    const longitude = DANService.NIGERIA_BOUNDS.minLon + 
      normalizedLon * (DANService.NIGERIA_BOUNDS.maxLon - DANService.NIGERIA_BOUNDS.minLon);

    return { latitude, longitude };
  }
}
