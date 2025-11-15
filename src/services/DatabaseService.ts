import SQLite from 'react-native-sqlite-storage';
import RNFS from 'react-native-fs';
import { generateDAN } from '../utils/danGenerator';
import { getStateCode } from '../utils/stateCodes';

// Enable promise-based interface
SQLite.enablePromise(true);

const DATABASE_NAME = 'dan-navigator.db';
const DATABASE_VERSION = '1.0';
const DATABASE_DISPLAY_NAME = 'DAN Navigator Database';
const DATABASE_SIZE = 200000;

export interface Building {
  id: number;
  dan: string;
  latitude: number;
  longitude: number;
  state_code: string;
  building_type: 'public' | 'private' | 'user-submitted';
  name?: string;
  category?: string; // e.g., 'hospital', 'school'
  created_at: string;
}

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;

  public async initDB(): Promise<void> {
    if (this.db) {
      return;
    }

    try {
      this.db = await SQLite.openDatabase(
        DATABASE_NAME,
        DATABASE_VERSION,
        DATABASE_DISPLAY_NAME,
        DATABASE_SIZE
      );
      await this.createTables();
      await this.seedPublicBuildings();
    } catch (error) {
      console.error('Error opening database:', error);
      throw new Error('Failed to initialize database');
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const tx = await this.db.transaction();
    try {
      await tx.executeSql(`
        CREATE TABLE IF NOT EXISTS buildings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          dan TEXT NOT NULL UNIQUE,
          latitude REAL NOT NULL,
          longitude REAL NOT NULL,
          state_code TEXT NOT NULL,
          building_type TEXT NOT NULL CHECK(building_type IN ('public', 'private', 'user-submitted')),
          name TEXT,
          category TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Create indexes for faster queries
      await tx.executeSql('CREATE INDEX IF NOT EXISTS idx_dan ON buildings(dan);');
      await tx.executeSql('CREATE INDEX IF NOT EXISTS idx_building_type ON buildings(building_type);');

      await tx.commit();
    } catch (error) {
      await tx.rollback();
      console.error('Error creating tables:', error);
      throw new Error('Failed to create database tables');
    }
  }

  private async seedPublicBuildings(): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      const tx = await this.db.transaction();

      // Check if data already exists to prevent re-seeding
      const [result] = await tx.executeSql("SELECT COUNT(*) as count FROM buildings WHERE building_type = 'public'");
      if (result.rows.item(0).count > 0) {
        console.log('Public buildings already seeded.');
        await tx.commit();
        return;
      }

      // Read the GeoJSON file from the assets folder
      const geojsonPath = RNFS.MainBundlePath + '/assets/data/public_buildings.geojson';
      const geojsonString = await RNFS.readFile(geojsonPath, 'utf8');
      const geojsonData = JSON.parse(geojsonString);

      const insertQuery = `
        INSERT INTO buildings (dan, latitude, longitude, state_code, building_type, name, category)
        VALUES (?, ?, ?, ?, ?, ?, ?);
      `;

      for (const feature of geojsonData.features) {
        const { name, category, state } = feature.properties;
        const [longitude, latitude] = feature.geometry.coordinates;

        const stateCode = getStateCode(state);
        if (!stateCode) {
          console.warn(`State code not found for state: ${state}`);
          continue;
        }

        const dan = generateDAN(latitude, longitude, stateCode);

        await tx.executeSql(insertQuery, [
          dan,
          latitude,
          longitude,
          stateCode,
          'public',
          name,
          category,
        ]);
      }

      await tx.commit();
      console.log('Public buildings seeded successfully.');
    } catch (error) {
      console.error('Error seeding public buildings:', error);
      // If there's an error, we don't want to throw and crash the app,
      // as seeding is not critical for the app's core functionality.
      // We can decide to rollback or not depending on desired behavior.
    }
  }
}

export const databaseService = new DatabaseService();
