import type { District, Crop, GrowthStage } from '../types';

// ============================================================
// Karnataka Districts (Primary focus per AGENTS.md)
// ============================================================

export const DISTRICTS: District[] = [
  { id: 'KA_01', name: 'Bagalkot', state: 'Karnataka', stateCode: 'KA', lat: 16.1692, lon: 75.6960, primaryLanguage: 'kn' },
  { id: 'KA_02', name: 'Ballari', state: 'Karnataka', stateCode: 'KA', lat: 15.1394, lon: 76.9214, primaryLanguage: 'kn' },
  { id: 'KA_03', name: 'Belagavi', state: 'Karnataka', stateCode: 'KA', lat: 15.8497, lon: 74.4977, primaryLanguage: 'kn' },
  { id: 'KA_04', name: 'Bengaluru Rural', state: 'Karnataka', stateCode: 'KA', lat: 13.1986, lon: 77.7066, primaryLanguage: 'kn' },
  { id: 'KA_05', name: 'Bengaluru Urban', state: 'Karnataka', stateCode: 'KA', lat: 12.9716, lon: 77.5946, primaryLanguage: 'kn' },
  { id: 'KA_06', name: 'Bidar', state: 'Karnataka', stateCode: 'KA', lat: 17.9104, lon: 77.5199, primaryLanguage: 'kn' },
  { id: 'KA_07', name: 'Chamarajanagar', state: 'Karnataka', stateCode: 'KA', lat: 11.9264, lon: 76.9436, primaryLanguage: 'kn' },
  { id: 'KA_08', name: 'Chikkaballapura', state: 'Karnataka', stateCode: 'KA', lat: 13.4353, lon: 77.7270, primaryLanguage: 'kn' },
  { id: 'KA_09', name: 'Dharwad', state: 'Karnataka', stateCode: 'KA', lat: 15.4589, lon: 75.1234, primaryLanguage: 'kn' },
  { id: 'KA_10', name: 'Gadag', state: 'Karnataka', stateCode: 'KA', lat: 15.4160, lon: 75.6140, primaryLanguage: 'kn' },
  { id: 'KA_11', name: 'Hassan', state: 'Karnataka', stateCode: 'KA', lat: 13.0068, lon: 76.1004, primaryLanguage: 'kn' },
  { id: 'KA_12', name: 'Haveri', state: 'Karnataka', stateCode: 'KA', lat: 14.7958, lon: 75.3995, primaryLanguage: 'kn' },
  { id: 'KA_13', name: 'Kalaburagi', state: 'Karnataka', stateCode: 'KA', lat: 17.3297, lon: 76.8343, primaryLanguage: 'kn' },
  { id: 'KA_14', name: 'Kodagu', state: 'Karnataka', stateCode: 'KA', lat: 12.4244, lon: 75.7382, primaryLanguage: 'kn' },
  { id: 'KA_15', name: 'Kolar', state: 'Karnataka', stateCode: 'KA', lat: 13.1359, lon: 78.1294, primaryLanguage: 'kn' },
  { id: 'KA_16', name: 'Koppal', state: 'Karnataka', stateCode: 'KA', lat: 15.3487, lon: 76.1547, primaryLanguage: 'kn' },
  { id: 'KA_17', name: 'Mandya', state: 'Karnataka', stateCode: 'KA', lat: 12.5218, lon: 76.8951, primaryLanguage: 'kn' },
  { id: 'KA_18', name: 'Mysuru', state: 'Karnataka', stateCode: 'KA', lat: 12.2958, lon: 76.6394, primaryLanguage: 'kn' },
  { id: 'KA_19', name: 'Raichur', state: 'Karnataka', stateCode: 'KA', lat: 16.2120, lon: 77.3566, primaryLanguage: 'kn' },
  { id: 'KA_20', name: 'Shivamogga', state: 'Karnataka', stateCode: 'KA', lat: 13.9299, lon: 75.5681, primaryLanguage: 'kn' },
  { id: 'KA_21', name: 'Tumakuru', state: 'Karnataka', stateCode: 'KA', lat: 13.3379, lon: 77.1173, primaryLanguage: 'kn' },
  { id: 'KA_22', name: 'Udupi', state: 'Karnataka', stateCode: 'KA', lat: 13.3409, lon: 74.7421, primaryLanguage: 'kn' },
  { id: 'KA_23', name: 'Vijayapura', state: 'Karnataka', stateCode: 'KA', lat: 16.8302, lon: 75.7100, primaryLanguage: 'kn' },
  { id: 'KA_24', name: 'Yadgir', state: 'Karnataka', stateCode: 'KA', lat: 16.7706, lon: 77.1385, primaryLanguage: 'kn' },
  // Pan-India districts
  { id: 'MH_01', name: 'Pune', state: 'Maharashtra', stateCode: 'MH', lat: 18.5204, lon: 73.8567, primaryLanguage: 'mr' },
  { id: 'MH_02', name: 'Nashik', state: 'Maharashtra', stateCode: 'MH', lat: 20.0059, lon: 73.7897, primaryLanguage: 'mr' },
  { id: 'AP_01', name: 'Kurnool', state: 'Andhra Pradesh', stateCode: 'AP', lat: 15.8281, lon: 78.0373, primaryLanguage: 'te' },
  { id: 'TN_01', name: 'Coimbatore', state: 'Tamil Nadu', stateCode: 'TN', lat: 11.0168, lon: 76.9558, primaryLanguage: 'ta' },
  { id: 'UP_01', name: 'Lucknow', state: 'Uttar Pradesh', stateCode: 'UP', lat: 26.8467, lon: 80.9462, primaryLanguage: 'hi' },
  { id: 'RJ_01', name: 'Jaipur', state: 'Rajasthan', stateCode: 'RJ', lat: 26.9124, lon: 75.7873, primaryLanguage: 'hi' },
];

// ============================================================
// Crops
// ============================================================

export const CROPS: Crop[] = [
  { id: 'ragi', name: { en: 'Ragi', hi: 'रागी', kn: 'ರಾಗಿ' }, category: 'cereal', icon: '🌾' },
  { id: 'wheat', name: { en: 'Wheat', hi: 'गेहूं', kn: 'ಗೋಧಿ' }, category: 'cereal', icon: '🌿' },
  { id: 'rice', name: { en: 'Rice', hi: 'चावल', kn: 'ಭತ್ತ' }, category: 'cereal', icon: '🍚' },
  { id: 'maize', name: { en: 'Maize', hi: 'मक्का', kn: 'ಜೋಳ' }, category: 'cereal', icon: '🌽' },
  { id: 'cotton', name: { en: 'Cotton', hi: 'कपास', kn: 'ಹತ್ತಿ' }, category: 'fiber', icon: '☁️' },
  { id: 'groundnut', name: { en: 'Groundnut', hi: 'मूंगफली', kn: 'ನೆಲಗಡಲೆ' }, category: 'oilseed', icon: '🥜' },
  { id: 'sunflower', name: { en: 'Sunflower', hi: 'सूरजमुखी', kn: 'ಸೂರ್ಯಕಾಂತಿ' }, category: 'oilseed', icon: '🌻' },
  { id: 'sugarcane', name: { en: 'Sugarcane', hi: 'गन्ना', kn: 'ಕಬ್ಬು' }, category: 'cash', icon: '🎋' },
  { id: 'tomato', name: { en: 'Tomato', hi: 'टमाटर', kn: 'ಟೊಮ್ಯಾಟೊ' }, category: 'vegetable', icon: '🍅' },
  { id: 'onion', name: { en: 'Onion', hi: 'प्याज', kn: 'ಈರುಳ್ಳಿ' }, category: 'vegetable', icon: '🧅' },
  { id: 'tur', name: { en: 'Tur Dal', hi: 'तुअर दाल', kn: 'ತೊಗರಿ' }, category: 'pulse', icon: '🫘' },
  { id: 'soybean', name: { en: 'Soybean', hi: 'सोयाबीन', kn: 'ಸೋಯಾ' }, category: 'oilseed', icon: '🫛' },
];

// ============================================================
// Growth Stages (shared across most crops)
// ============================================================

export const GROWTH_STAGES: GrowthStage[] = [
  {
    id: 'germination',
    name: { en: 'Germination', hi: 'अंकुरण', kn: 'ಮೊಳಕೆ' },
    description: { en: 'Seeds sprouting, 0-7 days', hi: 'बीज अंकुरित, 0-7 दिन', kn: 'ಬೀಜ ಮೊಳಕೆಯೊಡೆಯುತ್ತಿದೆ, 0-7 ದಿನ' },
    icon: '🌱',
    durationDays: { min: 0, max: 7 },
  },
  {
    id: 'seedling',
    name: { en: 'Seedling', hi: 'पौध', kn: 'ಸಸಿ' },
    description: { en: 'Young plants, 7-21 days', hi: 'छोटे पौधे, 7-21 दिन', kn: 'ಎಳೆ ಗಿಡಗಳು, 7-21 ದಿನ' },
    icon: '🌿',
    durationDays: { min: 7, max: 21 },
  },
  {
    id: 'vegetative',
    name: { en: 'Vegetative Growth', hi: 'वानस्पतिक वृद्धि', kn: 'ಸಸ್ಯ ಬೆಳವಣಿಗೆ' },
    description: { en: 'Rapid leaf & stem growth, 21-55 days', hi: 'तेज पत्ती और तना वृद्धि', kn: 'ಎಲೆ ಮತ್ತು ಕಾಂಡ ಬೆಳವಣಿಗೆ' },
    icon: '🌳',
    durationDays: { min: 21, max: 55 },
  },
  {
    id: 'flowering',
    name: { en: 'Flowering', hi: 'फूल आना', kn: 'ಹೂಬಿಡುವಿಕೆ' },
    description: { en: 'Critical pollination stage, 55-75 days', hi: 'महत्वपूर्ण परागण अवस्था', kn: 'ನಿರ್ಣಾಯಕ ಪರಾಗಸ್ಪರ್ಶ ಹಂತ' },
    icon: '🌸',
    durationDays: { min: 55, max: 75 },
  },
  {
    id: 'grain_filling',
    name: { en: 'Grain Filling', hi: 'दाना भरना', kn: 'ಧಾನ್ಯ ತುಂಬುವಿಕೆ' },
    description: { en: 'Yield formation, 75-105 days', hi: 'उपज निर्माण, 75-105 दिन', kn: 'ಇಳುವರಿ ರಚನೆ, 75-105 ದಿನ' },
    icon: '🌾',
    durationDays: { min: 75, max: 105 },
  },
  {
    id: 'maturity',
    name: { en: 'Maturity', hi: 'परिपक्वता', kn: 'ಪರಿಪಕ್ವತೆ' },
    description: { en: 'Ready for harvest, 105-120 days', hi: 'कटाई के लिए तैयार', kn: 'ಕೊಯ್ಲಿಗೆ ಸಿದ್ಧ' },
    icon: '✂️',
    durationDays: { min: 105, max: 120 },
  },
];

// ============================================================
// Mock Analysis Data (fallback when API is unavailable)
// ============================================================

export function getMockAnalysis(district: string, crop: string, stage: string) {
  const droughtScore = Math.floor(Math.random() * 40) + 40;
  const pestScore = Math.floor(Math.random() * 35) + 20;
  const nutrientScore = Math.floor(Math.random() * 40) + 30;
  const composite = Math.round(droughtScore * 0.4 + pestScore * 0.3 + nutrientScore * 0.3);

  const toLevel = (s: number): 'low' | 'moderate' | 'high' | 'critical' =>
    s < 25 ? 'low' : s < 50 ? 'moderate' : s < 75 ? 'high' : 'critical';

  const today = new Date();
  const forecast7Day = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i + 1);
    return {
      date: d.toISOString().split('T')[0],
      droughtRisk: Math.max(0, Math.min(100, droughtScore + (Math.random() - 0.5) * 20)),
      pestRisk: Math.max(0, Math.min(100, pestScore + (Math.random() - 0.5) * 15)),
      nutrientRisk: Math.max(0, Math.min(100, nutrientScore + (Math.random() - 0.5) * 15)),
    };
  });

  return {
    weather: {
      current: {
        temperature: { max: 32 + Math.floor(Math.random() * 6), min: 22 + Math.floor(Math.random() * 4), unit: '°C' },
        precipitation: { value: Math.round(Math.random() * 5 * 10) / 10, unit: 'mm' },
        humidity: { value: 45 + Math.floor(Math.random() * 35), unit: '%' },
        windSpeed: { value: 8 + Math.floor(Math.random() * 15), unit: 'km/h' },
      },
      forecast: forecast7Day.map(d => ({
        date: d.date,
        temperature: { max: 30 + Math.floor(Math.random() * 8), min: 20 + Math.floor(Math.random() * 6) },
        precipitation: Math.round(Math.random() * 10 * 10) / 10,
        humidity: 40 + Math.floor(Math.random() * 40),
      })),
      fetchedAt: new Date().toISOString(),
      isFresh: true,
    },
    ndvi: {
      value: 0.45 + Math.random() * 0.25,
      anomaly: -0.05 - Math.random() * 0.2,
      status: (droughtScore > 65 ? 'critical' : droughtScore > 45 ? 'stressed' : 'healthy') as 'healthy' | 'stressed' | 'critical',
      fetchedAt: new Date().toISOString(),
      isFresh: true,
    },
    riskScores: {
      droughtStress: {
        score: droughtScore,
        level: toLevel(droughtScore),
        factors: ['precipitation_deficit', 'high_et0', 'ndvi_decline'],
      },
      pestPressure: {
        score: pestScore,
        level: toLevel(pestScore),
        factors: ['humidity_moderate', 'temp_favorable'],
      },
      nutrientDeficiency: {
        score: nutrientScore,
        level: toLevel(nutrientScore),
        factors: ['ndvi_below_threshold', `${crop}_demand_peak`],
      },
      composite: {
        score: composite,
        level: (composite >= 70 ? 'critical' : composite >= 40 ? 'at-risk' : 'healthy') as 'healthy' | 'at-risk' | 'critical',
        trend: 'stable' as 'stable',
      },
    },
    forecast7Day,
  };
}

// ============================================================
// Mock Recommendations
// ============================================================

export function getMockRecommendations(language: 'en' | 'hi' | 'kn') {
  return [
    {
      id: 'rec_001',
      type: 'irrigation' as const,
      priority: 'high' as const,
      title: {
        en: 'Immediate Irrigation Required',
        hi: 'तुरंत सिंचाई आवश्यक',
        kn: 'ತಕ್ಷಣದ ನೀರಾವರಿ ಅಗತ್ಯ',
      },
      description: {
        en: 'Apply 2 liters of water per square meter today. Soil moisture is critically low with no rain forecast for 7 days.',
        hi: 'आज प्रति वर्ग मीटर 2 लीटर पानी दें। अगले 7 दिनों तक बारिश की संभावना नहीं है।',
        kn: 'ಇಂದು ಪ್ರತಿ ಚದರ ಮೀಟರ್‌ಗೆ 2 ಲೀಟರ್ ನೀರು ಹಾಕಿ. 7 ದಿನ ಮಳೆ ಇಲ್ಲ.',
      },
      quantity: '2 L/m²',
      timing: 'Today before 9 AM',
      estimatedCost: 0,
      estimatedCostUnit: 'labor only',
      voiceText: 'ಇಂದು ಬೆಳಿಗ್ಗೆ 9 ಗಂಟೆಯ ಮೊದಲು ನೀರು ಹಾಕಿ. ಪ್ರತಿ ಚದರ ಮೀಟರ್‌ಗೆ 2 ಲೀಟರ್.',
    },
    {
      id: 'rec_002',
      type: 'fertilizer' as const,
      priority: 'high' as const,
      title: {
        en: 'Apply Urea Top-Dressing',
        hi: 'यूरिया टॉप ड्रेसिंग करें',
        kn: 'ಯೂರಿಯಾ ಸಾರವರ್ಧನ ಮಾಡಿ',
      },
      description: {
        en: 'Apply 15 kg/acre urea 5 days after next rainfall. Crop is showing nitrogen deficiency signs.',
        hi: 'अगली बारिश के 5 दिन बाद 15 किलो/एकड़ यूरिया डालें। फसल में नाइट्रोजन की कमी दिख रही है।',
        kn: 'ಮುಂದಿನ ಮಳೆಯ 5 ದಿನ ಬಳಿಕ 15 ಕೆಜಿ/ಎಕರೆ ಯೂರಿಯಾ ಹಾಕಿ.',
      },
      quantity: '15 kg/acre',
      timing: '5 days after next rain',
      estimatedCost: 360,
      estimatedCostUnit: 'INR/acre',
      voiceText: 'ಮಳೆ ನಿಂತ 5 ದಿನ ನಂತರ 15 ಕೆಜಿ ಯೂರಿಯಾ ಹಾಕಿ.',
    },
    {
      id: 'rec_003',
      type: 'pest_control' as const,
      priority: 'medium' as const,
      title: {
        en: 'Preventive Pest Monitoring',
        hi: 'कीट निगरानी करें',
        kn: 'ಕೀಟ ಮೇಲ್ವಿಚಾರಣೆ ಮಾಡಿ',
      },
      description: {
        en: 'Spray neem oil (5ml/L) as a preventive measure. Check leaves weekly for pest signs.',
        hi: 'नीम तेल (5ml/L) का छिड़काव करें। हर हफ्ते पत्तियों की जांच करें।',
        kn: 'ತೇಗೆ ಎಣ್ಣೆ (5ml/L) ಸಿಂಪಡಿಸಿ. ಪ್ರತಿ ವಾರ ಎಲೆ ತಪಾಸಣೆ ಮಾಡಿ.',
      },
      quantity: '5 ml/L water',
      timing: 'Within 7 days',
      estimatedCost: 150,
      estimatedCostUnit: 'INR/acre',
      voiceText: 'ವಾರದೊಳಗೆ ತೇಗೆ ಎಣ್ಣೆ ಸಿಂಪಡಿಸಿ.',
    },
  ];
}
