import { crc32 } from 'js-crc';

/**
 * Generates a 7-digit numeric hash from a latitude and longitude.
 * This function is deterministic and will always produce the same output for the same input.
 * @param latitude - The latitude of the building's centroid.
 * @param longitude - The longitude of the building's centroid.
 * @returns A 7-digit numeric string.
 */
const generateCentroidHash = (latitude: number, longitude: number): string => {
  // Create a consistent string representation of the coordinates
  const coordinateString = `${latitude.toFixed(6)},${longitude.toFixed(6)}`;

  // Calculate CRC32 checksum
  const checksum = crc32(coordinateString);

  // Convert hex checksum to a decimal number
  const numericHash = parseInt(checksum, 16);

  // Ensure the hash is within the 7-digit range (0 to 9,999,999)
  const constrainedHash = numericHash % 10000000;

  // Zero-pad the hash to ensure it is always 7 digits long
  return constrainedHash.toString().padStart(7, '0');
};

/**
 * Generates a full 12-digit Digital Access Number (DAN).
 * DAN = [Country Code][State Code][Building Centroid Hash]
 * @param latitude - The latitude of the building's centroid.
 * @param longitude - The longitude of the building's centroid.
 * @param stateCode - The 2-digit code for the state.
 * @returns The 12-digit DAN string.
 */
export const generateDAN = (latitude: number, longitude: number, stateCode: string): string => {
  const COUNTRY_CODE = '234';

  if (stateCode.length !== 2 || !/^\d{2}$/.test(stateCode)) {
    throw new Error('Invalid state code. Must be a 2-digit string.');
  }

  const centroidHash = generateCentroidHash(latitude, longitude);

  return `${COUNTRY_CODE}${stateCode}${centroidHash}`;
};
