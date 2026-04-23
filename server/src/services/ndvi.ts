import { NDVIInput } from './scoring';
import logger from '../utils/logger';

/**
 * Simulates a graceful fallback for NDVI fetch.
 * In a real-world scenario, this would contact Sentinel-2 via Copernicus Hub.
 * For the hackathon scope, we generate simulated baseline/current values.
 */
export async function getNDVI(lat: number, lng: number, crop: string): Promise<NDVIInput> {
  try {
    // We mock the API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Generate a simulated baseline based loosely on the crop string length (just to be deterministic-ish)
    // Most healthy crops have a baseline NDVI between 0.5 and 0.8
    const baseOffset = (crop.length % 5) * 0.05;
    const baseline = 0.60 + baseOffset;
    
    // Simulate some environmental stress reducing the current NDVI
    // A random drop between 0.05 and 0.25
    const stressDrop = 0.05 + (Math.random() * 0.20);
    const current = Math.max(0, baseline - stressDrop);
    
    const delta = current - baseline;

    return {
      current: Number(current.toFixed(2)),
      baseline: Number(baseline.toFixed(2)),
      delta: Number(delta.toFixed(2))
    };
  } catch (error) {
    logger.error('NDVI service fallback failed', error);
    // As per AGENTS.md: If NDVI API is unreachable → proceed with ndvi: null
    return {
      current: null,
      baseline: null,
      delta: null
    };
  }
}
