import { Router, Request, Response } from 'express';
import { z } from 'zod';

import { calculateScore, toApiChannels } from '../services/scoring';
import type { WeatherInput, NDVIInput, ScoringInput } from '../services/scoring';
import logger from '../utils/logger';

// ---------------------------------------------------------------------------
// Zod schema — validates the incoming analysis request
// ---------------------------------------------------------------------------

const analyzeSchema = z.object({
  district: z.object({
    id: z.string(),
    name: z.string().min(2),
    state: z.string().min(2),
    lat: z.number(),
    lon: z.number(),
  }),
  crop: z.object({
    id: z.string().min(2),
    name: z.string().min(2),
  }),
  stage: z.object({
    id: z.string().min(2),
    name: z.string().min(2),
  }),
});

// ---------------------------------------------------------------------------
// Helpers — simulate weather + NDVI data (will be replaced by live APIs)
// ---------------------------------------------------------------------------

function getSimulatedWeather(lat: number, lon: number): WeatherInput {
  // Deterministic-ish weather based on lat/lon so the same district
  // always returns consistent results within a session.
  const seed = Math.abs(Math.sin(lat * 12.9898 + lon * 78.233) * 43758.5453) % 1;

  return {
    tempMax: Math.round(28 + seed * 12),          // 28-40 °C
    tempMin: Math.round(18 + seed * 8),            // 18-26 °C
    humidity: Math.round(40 + seed * 45),           // 40-85 %
    rainfall7d: Math.round(seed * 30 * 10) / 10,   // 0-30 mm
    forecastRain: Math.round(seed * 20 * 10) / 10,  // 0-20 mm
  };
}

function getSimulatedNDVI(lat: number, lon: number): NDVIInput {
  const seed = Math.abs(Math.cos(lat * 45.123 + lon * 23.456) * 31415.92) % 1;
  const current = 0.3 + seed * 0.4;   // 0.30 - 0.70
  const baseline = 0.55 + seed * 0.1;  // 0.55 - 0.65

  return {
    current: Math.round(current * 100) / 100,
    baseline: Math.round(baseline * 100) / 100,
    delta: Math.round((current - baseline) * 100) / 100,
  };
}

// ---------------------------------------------------------------------------
// Map stage names from frontend IDs to cropKnowledge.json keys
// ---------------------------------------------------------------------------

const STAGE_ID_MAP: Record<string, string> = {
  germination: 'germination',
  seedling: 'emergence',
  vegetative: 'vegetative',
  flowering: 'flowering',
  grain_filling: 'grain_fill',
  maturity: 'grain_fill', // closest available stage
  // Crop-specific stages that map 1:1
  nursery: 'nursery',
  transplanting: 'transplanting',
  tillering: 'tillering',
  panicle_init: 'panicle_init',
  grain_fill: 'grain_fill',
  sowing: 'sowing',
  jointing: 'jointing',
  planting: 'planting',
  grand_growth: 'grand_growth',
  ripening: 'ripening',
  emergence: 'emergence',
  vegetative_early: 'vegetative_early',
  vegetative_late: 'vegetative_late',
  tasseling: 'tasseling',
  pod_dev: 'pod_dev',
  kernel_fill: 'kernel_fill',
  seed_fill: 'seed_fill',
  boll_formation: 'boll_formation',
  boll_opening: 'boll_opening',
  bulb_init: 'bulb_init',
  bulb_dev: 'bulb_dev',
  harvest_ready: 'harvest_ready',
  fruiting: 'fruiting',
};

// ---------------------------------------------------------------------------
// Score level → frontend-compatible level mapping
// ---------------------------------------------------------------------------

function scoringLevelToFrontend(level: string): 'low' | 'moderate' | 'high' | 'critical' {
  // scoring.ts uses: low, medium, high, critical
  // Frontend expects: low, moderate, high, critical
  if (level === 'medium') return 'moderate';
  return level as 'low' | 'moderate' | 'high' | 'critical';
}

function compositeToFrontendLevel(score: number): 'healthy' | 'at-risk' | 'critical' {
  if (score >= 70) return 'critical';
  if (score >= 40) return 'at-risk';
  return 'healthy';
}

// ---------------------------------------------------------------------------
// Route
// ---------------------------------------------------------------------------

const analyzeRouter = Router();

analyzeRouter.post('/', async (req: Request, res: Response): Promise<void> => {
  const parsed = analyzeSchema.safeParse(req.body);
  if (!parsed.success) {
    logger.warn('Analyze validation failed:', parsed.error.issues);
    res.status(400).json({ success: false, error: 'Invalid request body' });
    return;
  }

  try {
    const { district, crop, stage } = parsed.data;

    logger.info(`Analyzing: ${district.name} / ${crop.name} / ${stage.name}`);

    // Get weather + NDVI (simulated for now)
    const weather = getSimulatedWeather(district.lat, district.lon);
    const ndvi = getSimulatedNDVI(district.lat, district.lon);

    // Map the frontend stage ID to cropKnowledge key
    const stageKey = STAGE_ID_MAP[stage.id] ?? stage.id;

    // Run scoring engine
    const scoringInput: ScoringInput = {
      crop: crop.id,
      growthStage: stageKey,
      weather,
      ndvi,
    };

    let scoringResult;
    try {
      scoringResult = calculateScore(scoringInput);
    } catch (err) {
      // If crop/stage combo not found, try with 'vegetative' as fallback
      logger.warn(`Scoring error for ${crop.id}/${stageKey}, falling back to vegetative:`, err);
      scoringResult = calculateScore({
        ...scoringInput,
        growthStage: 'vegetative',
      });
    }

    const channels = toApiChannels(scoringResult);

    // Build the forecast in frontend-expected format
    const forecast7Day = scoringResult.forecast.map(f => ({
      date: f.day,
      droughtRisk: Math.round(scoringResult.channels.drought.score + (Math.random() - 0.5) * 10),
      pestRisk: Math.round(scoringResult.channels.pest.score + (Math.random() - 0.5) * 8),
      nutrientRisk: Math.round(scoringResult.channels.nutrient.score + (Math.random() - 0.5) * 8),
    }));

    // Determine NDVI status
    const ndviStatus: 'healthy' | 'stressed' | 'critical' =
      (ndvi.delta !== null && ndvi.delta < -0.15) ? 'critical' :
      (ndvi.delta !== null && ndvi.delta < -0.05) ? 'stressed' : 'healthy';

    // Build response matching frontend AnalyzeResponse['data'] shape
    const responseData = {
      weather: {
        current: {
          temperature: { max: weather.tempMax, min: weather.tempMin, unit: '°C' },
          precipitation: { value: weather.rainfall7d, unit: 'mm' },
          humidity: { value: weather.humidity, unit: '%' },
          windSpeed: { value: Math.round(8 + Math.random() * 12), unit: 'km/h' },
        },
        forecast: forecast7Day.map(d => ({
          date: d.date,
          temperature: { max: weather.tempMax + Math.round((Math.random() - 0.5) * 4), min: weather.tempMin + Math.round((Math.random() - 0.5) * 3) },
          precipitation: Math.round(weather.forecastRain / 7 * 10) / 10,
          humidity: weather.humidity + Math.round((Math.random() - 0.5) * 10),
        })),
        fetchedAt: new Date().toISOString(),
        isFresh: true,
      },
      ndvi: {
        value: ndvi.current ?? 0.45,
        anomaly: ndvi.delta ?? -0.1,
        status: ndviStatus,
        fetchedAt: new Date().toISOString(),
        isFresh: true,
      },
      riskScores: {
        droughtStress: {
          score: channels.channels.drought.score,
          level: scoringLevelToFrontend(channels.channels.drought.level),
          factors: [channels.channels.drought.driver],
        },
        pestPressure: {
          score: channels.channels.pest.score,
          level: scoringLevelToFrontend(channels.channels.pest.level),
          factors: [channels.channels.pest.driver],
        },
        nutrientDeficiency: {
          score: channels.channels.nutrient.score,
          level: scoringLevelToFrontend(channels.channels.nutrient.level),
          factors: [channels.channels.nutrient.driver],
        },
        composite: {
          score: scoringResult.compositeScore,
          level: compositeToFrontendLevel(scoringResult.compositeScore),
          trend: 'stable' as const,
        },
      },
      forecast7Day,
    };

    logger.info(`Analysis complete — composite score: ${scoringResult.compositeScore}`);

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}`,
      data: responseData,
    });
  } catch (err) {
    logger.error('Analyze route error:', err);
    res.status(500).json({ success: false, error: 'Analysis failed' });
  }
});

export default analyzeRouter;
import logger from '../utils/logger';
import AnalysisCache from '../models/AnalysisCache';
// @ts-ignore
import districtsData from '../data/districts.json';
import { getWeather } from '../services/weather';
import { getNDVI } from '../services/ndvi';
import { calculateScore, toApiChannels } from '../services/scoring';

const router = Router();

// Validation schema per API Contract
const analyzeRequestSchema = z.object({
  district: z.string().min(1),
  state: z.string().min(1),
  crop: z.string().min(1),
  growthStage: z.string().min(1),
  language: z.enum(['english', 'hindi', 'kannada'])
});

router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = analyzeRequestSchema.parse(req.body);
    const { district, crop, growthStage } = validatedData;

    // 1. Check cache
    const cached = await AnalysisCache.findOne({ district, crop, growthStage });
    if (cached && cached.expiresAt > new Date()) {
      logger.info(`Serving cached analysis for ${district} - ${crop} at ${growthStage}`);
      res.status(200).json({
        success: true,
        data: cached.result
      });
      return;
    }

    // 2. Lookup Lat/Lng
    const districts = districtsData as Record<string, { lat: number; lng: number }>;
    const coords = districts[district];
    if (!coords) {
      res.status(400).json({ success: false, error: `Coordinates not found for district: ${district}` });
      return;
    }

    // 3. Fetch Weather & NDVI
    // If getWeather throws (e.g. Open-Meteo is down), it is caught below and returns 500
    const weather = await getWeather(coords.lat, coords.lng);
    const ndvi = await getNDVI(coords.lat, coords.lng, crop);

    // 4. Calculate Score
    const scoringResult = calculateScore({
      crop,
      growthStage,
      weather,
      ndvi
    });

    const apiChannels = toApiChannels(scoringResult);

    // 5. Build Final Payload exactly matching AGENTS.md API contract
    const resultPayload = {
      district,
      crop,
      growthStage,
      compositeScore: scoringResult.compositeScore,
      channels: apiChannels.channels,
      forecast: scoringResult.forecast,
      ndvi,
      weather
    };

    // 6. Cache the Result (TTL 6 hours)
    const expiresAt = new Date(Date.now() + 6 * 60 * 60 * 1000);
    await AnalysisCache.findOneAndUpdate(
      { district, crop, growthStage },
      { result: resultPayload, cachedAt: new Date(), expiresAt },
      { upsert: true, new: true }
    );

    // 7. Return Response
    res.status(200).json({
      success: true,
      data: resultPayload
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, error: 'Invalid input parameters' });
      return;
    }
    logger.error('Error in /api/analyze:', error);
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Internal Server Error' });
  }
});

export default router;
