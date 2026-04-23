import { GoogleGenerativeAI } from '@google/generative-ai';
// @ts-ignore
import fallbackDataRaw from '../data/fallbackRecommendations.json';

export const GEMINI_MODEL_NAME = 'gemini-1.5-flash';

const SYSTEM_PROMPT = `You are a senior agronomist advising small-scale Indian farmers.
You will receive a JSON object describing a farmer's crop, growth stage,
current weather conditions, satellite NDVI data, and three risk channel
scores (drought, pest pressure, nutrient deficiency).

Your task is to generate 3 to 5 specific, actionable interventions.

Rules you must follow:
1. Every recommendation must include a specific quantity (e.g., "4 cm of water",
   "10 kg urea per acre") or a specific time window (e.g., "before Thursday",
   "within the next 48 hours"). Vague advice like "irrigate as needed" is not acceptable.
2. Prioritise recommendations by risk severity — address the highest-scoring channel first.
3. Write at a Grade 5 comprehension level. Short sentences. Simple words. No jargon.
4. Provide translations directly in the title and description objects for English (en), Hindi (hi), and Kannada (kn).
5. The "voiceText" must be one short sentence in Kannada summarizing the action for voice readout.
6. Return ONLY valid JSON matching the exact schema below. No markdown, no code fences.

Output format (strict JSON):
{
  "recommendations": [
    {
      "id": "rec_001",
      "type": "irrigation",
      "priority": "high",
      "title": { "en": "...", "hi": "...", "kn": "..." },
      "description": { "en": "...", "hi": "...", "kn": "..." },
      "quantity": "4 cm",
      "timing": "within 48 hours",
      "voiceText": "..."
    }
  ],
  "summary": {
    "overallRisk": "high",
    "primaryConcern": "drought stress",
    "actionRequired": true
  }
}

Note: "type" must be one of: "irrigation", "fertilizer", "pest_control", "nutrient", "general".
"priority" must be one of: "high", "medium", "low".
"overallRisk" must be one of: "low", "moderate", "high", "critical".`;

export interface RiskPayload {
  crop: string;
  district: string;
  growthStage: string;
  droughtScore: number;
  pestScore: number;
  nutrientScore: number;
  compositeScore: number;
  droughtLevel: string;
  pestLevel: string;
  nutrientLevel: string;
  droughtDriver: string;
  pestDriver: string;
  nutrientDriver: string;
  tempMax: number;
  tempMin: number;
  humidity: number;
  rainfall7d: number;
  forecastRain: number;
  ndviCurrent: number | null;
  ndviBaseline: number | null;
  ndviDelta: number | null;
  soilType: string;
}

export interface RecommendationItem {
  id: string;
  type: 'irrigation' | 'fertilizer' | 'pest_control' | 'nutrient' | 'general';
  priority: 'high' | 'medium' | 'low';
  title: { en: string; hi: string; kn: string };
  description: { en: string; hi: string; kn: string };
  quantity?: string;
  timing?: string;
  estimatedCost?: number;
  estimatedCostUnit?: string;
  voiceText?: string;
}

export interface RecommendationSummary {
  overallRisk: 'low' | 'moderate' | 'high' | 'critical';
  primaryConcern: string;
  actionRequired: boolean;
}

export interface GeminiResult {
  success: boolean;
  data: {
    recommendations: RecommendationItem[];
    summary: RecommendationSummary;
    generatedBy?: string;
    aiGenerated?: boolean;
  };
}

export function buildUserMessage(payload: RiskPayload): string {
  const v = (val: number | null): string => (val !== null ? String(val) : 'unavailable');
  return `Here is the crop situation for this farmer:

Crop: ${payload.crop}
District: ${payload.district}, Karnataka, India
Growth Stage: ${payload.growthStage}

Risk Scores (0 = no risk, 100 = critical):
- Drought Stress: ${payload.droughtScore}/100 (${payload.droughtLevel}) — Driver: ${payload.droughtDriver}
- Pest Pressure: ${payload.pestScore}/100 (${payload.pestLevel}) — Driver: ${payload.pestDriver}
- Nutrient Deficiency: ${payload.nutrientScore}/100 (${payload.nutrientLevel}) — Driver: ${payload.nutrientDriver}
- Composite Health Score: ${payload.compositeScore}/100

Current Weather (7-day summary):
- Max temperature: ${payload.tempMax}°C
- Min temperature: ${payload.tempMin}°C
- Humidity: ${payload.humidity}%
- Rainfall in last 7 days: ${payload.rainfall7d} mm
- Forecasted rainfall next 7 days: ${payload.forecastRain} mm

Satellite NDVI:
- Current NDVI: ${v(payload.ndviCurrent)}
- Baseline NDVI for this crop/stage: ${v(payload.ndviBaseline)}
- Delta: ${v(payload.ndviDelta)} (negative = crop stress detected)

Soil type for this district: ${payload.soilType}

Generate recommendations now.`;
}

function getFallbackRecommendations(payload: RiskPayload): GeminiResult {
  const recs: RecommendationOutput = {
    kannada: [],
    hindi: [],
    english: [],
  };

  // Drought recommendation
  if (payload.droughtScore > 40) {
    recs.english.push({
      type: 'irrigation',
      urgency: payload.droughtScore > 70 ? 'immediate' : 'within3days',
      action: `Apply 4 cm of water to your ${payload.crop} field before 7 AM tomorrow.`,
      reason: 'Soil moisture is low and no rain is expected soon.',
    });
    recs.kannada.push({
      type: 'irrigation',
      urgency: payload.droughtScore > 70 ? 'immediate' : 'within3days',
      action: `ನಾಳೆ ಬೆಳಿಗ್ಗೆ 7 ಗಂಟೆಯ ಮೊದಲು ನಿಮ್ಮ ${payload.crop} ಹೊಲಕ್ಕೆ 4 ಸೆಂ.ಮೀ. ನೀರು ಹಾಯಿಸಿ.`,
      reason: 'ಮಣ್ಣು ಒಣಗಿದೆ ಮತ್ತು ಮಳೆ ನಿರೀಕ್ಷೆ ಇಲ್ಲ.',
    });
    recs.hindi.push({
      type: 'irrigation',
      urgency: payload.droughtScore > 70 ? 'immediate' : 'within3days',
      action: `कल सुबह 7 बजे से पहले अपने ${payload.crop} खेत में 4 सेमी पानी दें।`,
      reason: 'मिट्टी सूखी है और बारिश की उम्मीद नहीं है।',
    });
  }

  // Nutrient recommendation
  if (payload.nutrientScore > 40) {
    recs.english.push({
      type: 'fertilizer',
      urgency: 'within3days',
      action: `Apply 15 kg/acre urea within 3 days. Your ${payload.crop} needs nitrogen at the ${payload.growthStage} stage.`,
      reason: 'Nitrogen demand is high at this growth stage.',
    });
    recs.kannada.push({
      type: 'fertilizer',
      urgency: 'within3days',
      action: `3 ದಿನಗಳೊಳಗೆ 15 ಕೆಜಿ/ಎಕರೆ ಯೂರಿಯಾ ಹಾಕಿ. ${payload.growthStage} ಹಂತದಲ್ಲಿ ನಿಮ್ಮ ${payload.crop} ಗೆ ಸಾರಜನಕ ಬೇಕು.`,
      reason: 'ಈ ಬೆಳವಣಿಗೆ ಹಂತದಲ್ಲಿ ಸಾರಜನಕ ಬೇಡಿಕೆ ಹೆಚ್ಚಿದೆ.',
    });
    recs.hindi.push({
      type: 'fertilizer',
      urgency: 'within3days',
      action: `3 दिन में 15 किलो/एकड़ यूरिया डालें। ${payload.growthStage} चरण में ${payload.crop} को नाइट्रोजन चाहिए।`,
      reason: 'इस विकास चरण में नाइट्रोजन की मांग अधिक है।',
    });
  }

  // Pest recommendation
  if (payload.pestScore > 30) {
    recs.english.push({
      type: 'pesticide',
      urgency: 'thisweek',
      action: 'Spray neem oil (5 ml per liter of water) as preventive measure. Check leaves for spots.',
      reason: 'Humidity and temperature are favorable for pest activity.',
    });
    recs.kannada.push({
      type: 'pesticide',
      urgency: 'thisweek',
      action: 'ಬೇವಿನ ಎಣ್ಣೆ (1 ಲೀಟರ್ ನೀರಿಗೆ 5 ಮಿಲಿ) ಸಿಂಪಡಿಸಿ. ಎಲೆಗಳಲ್ಲಿ ಚುಕ್ಕೆ ಪರೀಕ್ಷಿಸಿ.',
      reason: 'ಆರ್ದ್ರತೆ ಮತ್ತು ತಾಪಮಾನ ಕೀಟ ಚಟುವಟಿಕೆಗೆ ಅನುಕೂಲಕರ.',
    });
    recs.hindi.push({
      type: 'pesticide',
      urgency: 'thisweek',
      action: 'नीम तेल (1 लीटर पानी में 5 मिली) का छिड़काव करें। पत्तियों पर धब्बे जांचें।',
      reason: 'नमी और तापमान कीट गतिविधि के लिए अनुकूल हैं।',
    });
  }

  // Always include at least one monitoring recommendation
  recs.english.push({
    type: 'monitoring',
    urgency: 'thisweek',
    action: 'Walk your field every 2 days. Check for yellowing leaves, wilting, or pest damage.',
    reason: 'Early detection helps prevent crop loss.',
  });
  recs.kannada.push({
    type: 'monitoring',
    urgency: 'thisweek',
    action: 'ಪ್ರತಿ 2 ದಿನಕ್ಕೊಮ್ಮೆ ಹೊಲ ನೋಡಿ. ಹಳದಿ ಎಲೆ, ಬಾಡುವಿಕೆ ಅಥವಾ ಕೀಟ ಹಾನಿ ಪರೀಕ್ಷಿಸಿ.',
    reason: 'ಬೇಗ ಗುರುತಿಸಿದರೆ ಬೆಳೆ ನಷ್ಟ ತಡೆಯಬಹುದು.',
  });
  recs.hindi.push({
    type: 'monitoring',
    urgency: 'thisweek',
    action: 'हर 2 दिन खेत की जांच करें। पीली पत्तियां, मुरझाना या कीट नुकसान देखें।',
    reason: 'जल्दी पहचान से फसल नुकसान रोका जा सकता है।',
  });

  return { success: true, recommendations: recs, aiGenerated: false };
function getFallbackRecommendations(_payload: RiskPayload): GeminiResult {
  const fallback = fallbackDataRaw as { recommendations: RecommendationItem[]; summary: RecommendationSummary };
  return { 
    success: true, 
    data: {
      recommendations: fallback.recommendations,
      summary: fallback.summary,
      aiGenerated: false
    }
  };
}

export async function getRecommendations(payload: RiskPayload): Promise<GeminiResult> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY is not set in environment');

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL_NAME,
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: { temperature: 0.2, maxOutputTokens: 1500 },
    });

    const result = await model.generateContent(buildUserMessage(payload));
    let text = result.response.text();

    // Strip markdown code fences if Gemini wraps the output
    text = text.replace(/^\s*```(?:json)?\s*\n?/i, '').replace(/\n?\s*```\s*$/i, '');

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- Gemini returns dynamic JSON
    const parsed = JSON.parse(text);
    if (!parsed.recommendations || !parsed.summary) {
      throw new Error('Gemini response missing required keys');
    }

    return { 
      success: true, 
      data: {
        recommendations: parsed.recommendations,
        summary: parsed.summary,
        generatedBy: GEMINI_MODEL_NAME,
        aiGenerated: true
      }
    };
  } catch (err) {
    console.error(`[gemini] Error generating recommendations: ${String(err)}`);
    return getFallbackRecommendations(payload);
  }
}
