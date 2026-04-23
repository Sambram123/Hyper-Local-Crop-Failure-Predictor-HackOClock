import { GoogleGenerativeAI } from '@google/generative-ai';

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
4. The "reason" field must be one sentence that explains WHY, so a farmer with no
   agricultural training can understand it.
5. Generate the same recommendations in Kannada (kn), Hindi (hi), and English (en).
   Each language array must have the same number of items in the same order.
6. Return ONLY valid JSON. No markdown, no code fences, no explanation outside JSON.

Output format (strict):
{
  "kannada": [
    {
      "type": "irrigation" | "fertilizer" | "pesticide" | "monitoring" | "other",
      "urgency": "immediate" | "within3days" | "thisweek",
      "action": "<specific action in Kannada script>",
      "reason": "<one sentence reason in Kannada script>"
    }
  ],
  "hindi": [ { same structure } ],
  "english": [ { same structure } ]
}`;

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

export interface Recommendation {
  type: 'irrigation' | 'fertilizer' | 'pesticide' | 'monitoring' | 'other';
  urgency: 'immediate' | 'within3days' | 'thisweek';
  action: string;
  reason: string;
}

export interface RecommendationOutput {
  kannada: Recommendation[];
  hindi: Recommendation[];
  english: Recommendation[];
}

export interface GeminiResult {
  success: boolean;
  recommendations: RecommendationOutput;
  aiGenerated: boolean;
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

function getFallbackRecommendations(_payload: RiskPayload): GeminiResult {
  throw new Error('Fallback not yet implemented');
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
    text = text.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '');

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- Gemini returns dynamic JSON
    const parsed: RecommendationOutput = JSON.parse(text);
    if (!parsed.kannada || !parsed.hindi || !parsed.english) {
      throw new Error('Gemini response missing required language keys');
    }

    return { success: true, recommendations: parsed, aiGenerated: true };
  } catch (err) {
    console.error(`[gemini] Error generating recommendations: ${String(err)}`);
    return getFallbackRecommendations(payload);
  }
}
