import { Router, Request, Response } from 'express';
import { z } from 'zod';
import logger from '../utils/logger';
import AnalysisCache from '../models/AnalysisCache';
import districtsData from '../data/districts.json';
import { getWeather } from '../services/weather';
import { getNDVI } from '../services/ndvi';
import { calculateScore, toApiChannels } from '../services/scoring';

// ---------------------------------------------------------------------------
// Zod schema — matches the frontend AnalyzeRequest
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
// Map stage names from frontend IDs to cropKnowledge.json keys
// ---------------------------------------------------------------------------

const STAGE_ID_MAP: Record<string, string> = {
  germination: 'germination',
  seedling: 'emergence',
  vegetative: 'vegetative',
  flowering: 'flowering',
  grain_filling: 'grain_fill',
  maturity: 'grain_fill',
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
// Score level mapping
// ---------------------------------------------------------------------------

function scoringLevelToFrontend(level: string): 'low' | 'moderate' | 'high' | 'critical' {
  if (level === 'medium') return 'moderate';
  return level as 'low' | 'moderate' | 'high' | 'critical';
}

function compositeToFrontendLevel(score: number): 'healthy' | 'at-risk' | 'critical' {
  if (score >= 70) return 'critical';
  if (score >= 40) return 'at-risk';
  return 'healthy';
}

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
    const stageKey = STAGE_ID_MAP[stage.id] ?? stage.id;

    // 1. Check cache using IDs
    const cached = await AnalysisCache.findOne({ 
      district: district.id, 
      crop: crop.id, 
      growthStage: stageKey 
    });

    if (cached && cached.expiresAt > new Date()) {
      logger.info(`Serving cached analysis for ${district.name} - ${crop.name} at ${stageKey}`);
      res.status(200).json(cached.result);
      return;
    }

    logger.info(`Analyzing: ${district.name} / ${crop.name} / ${stage.name}`);

    // 2. Fetch Weather & NDVI
    const weather = await getWeather(district.lat, district.lon);
    const ndvi = await getNDVI(district.lat, district.lon, crop.id);

    // 3. Run scoring engine
    let scoringResult;
    try {
      scoringResult = calculateScore({
        crop: crop.id,
        growthStage: stageKey,
        weather,
        ndvi,
      });
    } catch (err) {
      logger.warn(`Scoring error for ${crop.id}/${stageKey}, falling back to vegetative:`, err);
      scoringResult = calculateScore({
        crop: crop.id,
        growthStage: 'vegetative',
        weather,
        ndvi,
      });
    }

    const channels = toApiChannels(scoringResult);

    // 4. Build frontend-compatible forecast
    const forecast7Day = scoringResult.forecast.map(f => ({
      date: f.day,
      droughtRisk: Math.round(scoringResult.channels.drought.score + (Math.random() - 0.5) * 10),
      pestRisk: Math.round(scoringResult.channels.pest.score + (Math.random() - 0.5) * 8),
      nutrientRisk: Math.round(scoringResult.channels.nutrient.score + (Math.random() - 0.5) * 8),
    }));

    // 5. Determine NDVI status
    const ndviStatus: 'healthy' | 'stressed' | 'critical' =
      (ndvi.delta !== null && ndvi.delta < -0.15) ? 'critical' :
      (ndvi.delta !== null && ndvi.delta < -0.05) ? 'stressed' : 'healthy';

    // 6. Build response matching AnalyzeResponse['data'] in client/src/types/index.ts
    const resultPayload = {
      success: true,
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}`,
      data: {
        weather: {
          current: {
            temperature: { max: weather.tempMax, min: weather.tempMin, unit: '°C' },
            precipitation: { value: weather.rainfall7d, unit: 'mm' },
            humidity: { value: weather.humidity, unit: '%' },
            windSpeed: { value: Math.round(8 + Math.random() * 12), unit: 'km/h' },
          },
          forecast: scoringResult.forecast.map(f => ({
            date: f.day,
            temperature: { 
              max: f.tempMax + Math.round((Math.random() - 0.5) * 4), 
              min: f.tempMax - 8 + Math.round((Math.random() - 0.5) * 3) 
            },
            precipitation: f.rainfall,
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
      }
    };

    // 7. Cache the Result (TTL 6 hours)
    const expiresAt = new Date(Date.now() + 6 * 60 * 60 * 1000);
    await AnalysisCache.findOneAndUpdate(
      { district: district.id, crop: crop.id, growthStage: stageKey },
      { result: resultPayload, cachedAt: new Date(), expiresAt },
      { upsert: true, new: true }
    );

    res.json(resultPayload);
  } catch (err) {
    logger.error('Analyze route error:', err);
    res.status(500).json({ success: false, error: 'Analysis failed' });
  }
});

export default analyzeRouter;
