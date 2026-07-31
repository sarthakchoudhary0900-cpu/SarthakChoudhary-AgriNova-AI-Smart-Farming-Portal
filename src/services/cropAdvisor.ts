import type { CropRecResult, WeatherData } from '@/types';
import { cropDatabase, type CropInfo } from '@/data/crops';

export interface CropRecInput {
  state: string;
  district: string;
  season: string;
  soilType: string;
  farmSize: string;
  waterAvailability: string;
  budget: string;
  expectedInvestment: string;
  cropPreference: string;
}

export interface ScoredCrop {
  crop: CropInfo;
  score: number;
  farmingScore: number;
  reasons: string[];
}

function tempScore(crop: CropInfo, weather: WeatherData | null): { score: number; reason: string } {
  if (!weather) return { score: 70, reason: 'Weather data unavailable — using default temperature score.' };
  if (weather.temperature >= crop.idealTempMin && weather.temperature <= crop.idealTempMax) {
    return { score: 100, reason: `Current temperature (${weather.temperature}°C) is ideal for ${crop.name} (optimal: ${crop.idealTempMin}–${crop.idealTempMax}°C).` };
  }
  const diff = weather.temperature < crop.idealTempMin ? crop.idealTempMin - weather.temperature : weather.temperature - crop.idealTempMax;
  if (diff <= 5) return { score: 80, reason: `Temperature (${weather.temperature}°C) is slightly outside the ideal range for ${crop.name} but acceptable.` };
  if (diff <= 10) return { score: 50, reason: `Temperature (${weather.temperature}°C) is moderately outside the ideal range for ${crop.name}.` };
  return { score: 20, reason: `Temperature (${weather.temperature}°C) is far from the ideal range for ${crop.name} (${crop.idealTempMin}–${crop.idealTempMax}°C).` };
}

function humidityScore(crop: CropInfo, weather: WeatherData | null): { score: number; reason: string } {
  if (!weather) return { score: 70, reason: 'Weather data unavailable — using default humidity score.' };
  if (weather.humidity >= crop.idealHumidityMin && weather.humidity <= crop.idealHumidityMax) {
    return { score: 100, reason: `Humidity (${weather.humidity}%) is ideal for ${crop.name} (optimal: ${crop.idealHumidityMin}–${crop.idealHumidityMax}%).` };
  }
  const diff = weather.humidity < crop.idealHumidityMin ? crop.idealHumidityMin - weather.humidity : weather.humidity - crop.idealHumidityMax;
  if (diff <= 10) return { score: 80, reason: `Humidity (${weather.humidity}%) is slightly outside the ideal range for ${crop.name}.` };
  if (diff <= 20) return { score: 50, reason: `Humidity (${weather.humidity}%) is moderately outside the ideal range for ${crop.name}.` };
  return { score: 25, reason: `Humidity (${weather.humidity}%) is far from the ideal range for ${crop.name}.` };
}

function rainfallScore(crop: CropInfo, weather: WeatherData | null): { score: number; reason: string } {
  if (!weather) return { score: 70, reason: 'Weather data unavailable — using default rainfall score.' };
  // Use rain chance as proxy for rainfall availability
  const rainProxy = weather.rainChance * 20; // scale 0-100% to 0-2000mm
  if (rainProxy >= crop.idealRainfallMin && rainProxy <= crop.idealRainfallMax) {
    return { score: 100, reason: `Rainfall prediction (${weather.rainChance}%) aligns well with ${crop.name}'s water requirement (${crop.idealRainfallMin}–${crop.idealRainfallMax}mm).` };
  }
  if (crop.idealRainfallMax <= 600 && weather.rainChance <= 30) {
    return { score: 90, reason: `Low rainfall expected (${weather.rainChance}%) — suitable for drought-tolerant ${crop.name}.` };
  }
  if (crop.idealRainfallMin >= 1000 && weather.rainChance >= 50) {
    return { score: 85, reason: `Good rainfall expected (${weather.rainChance}%) — suitable for water-loving ${crop.name}.` };
  }
  return { score: 50, reason: `Rainfall prediction (${weather.rainChance}%) may not perfectly match ${crop.name}'s requirement (${crop.idealRainfallMin}–${crop.idealRainfallMax}mm).` };
}

function waterScore(crop: CropInfo, input: CropRecInput): { score: number; reason: string } {
  const water = input.waterAvailability.toLowerCase();
  const isHighWater = crop.idealRainfallMin >= 800;
  if (isHighWater) {
    if (water.includes('high') || water.includes('abundant')) return { score: 100, reason: `Your water availability matches ${crop.name}'s high water requirement.` };
    if (water.includes('medium')) return { score: 60, reason: `${crop.name} requires high water — your medium water availability may be insufficient.` };
    return { score: 20, reason: `${crop.name} requires high water — your low water availability is a major constraint.` };
  }
  if (crop.idealRainfallMax <= 500) {
    if (water.includes('low') || water.includes('scarce')) return { score: 100, reason: `Your low water availability is perfect for drought-resistant ${crop.name}.` };
    return { score: 80, reason: `${crop.name} is drought-resistant and adapts well to your water availability.` };
  }
  if (water.includes('medium')) return { score: 90, reason: `Your medium water availability suits ${crop.name}'s moderate water requirement.` };
  if (water.includes('high')) return { score: 75, reason: `${crop.name} can thrive with your high water availability.` };
  return { score: 60, reason: `${crop.name} has moderate water needs — your low water availability may require supplemental irrigation.` };
}

function soilScore(crop: CropInfo, input: CropRecInput): { score: number; reason: string } {
  if (crop.suitableSoils.some(s => input.soilType.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(input.soilType.toLowerCase()))) {
    return { score: 100, reason: `${input.soilType} soil is ideal for ${crop.name}.` };
  }
  return { score: 40, reason: `${input.soilType} soil is not optimal for ${crop.name}. Suitable soils: ${crop.suitableSoils.join(', ')}.` };
}

function stateScore(crop: CropInfo, input: CropRecInput): { score: number; reason: string } {
  if (crop.suitableStates.some(s => input.state.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(input.state.toLowerCase()))) {
    return { score: 100, reason: `${input.state} is a major ${crop.name}-growing state — excellent agro-climatic match.` };
  }
  return { score: 50, reason: `${input.state} is not a primary ${crop.name}-growing region, but cultivation is still possible.` };
}

function budgetScore(crop: CropInfo, input: CropRecInput): { score: number; reason: string } {
  const budget = input.budget.toLowerCase();
  const isHighProfit = crop.expectedProfit.includes('1,00,000') || crop.expectedProfit.includes('1,50,000');
  if (isHighProfit) {
    if (budget.includes('high')) return { score: 100, reason: `Your high budget supports ${crop.name}'s higher investment requirement.` };
    if (budget.includes('medium')) return { score: 60, reason: `${crop.name} requires higher investment — your medium budget may be tight.` };
    return { score: 30, reason: `${crop.name} requires significant investment — your low budget is a constraint.` };
  }
  if (budget.includes('low')) return { score: 90, reason: `${crop.name} is a low-investment crop — fits your budget well.` };
  return { score: 80, reason: `${crop.name} is affordable to cultivate with your budget.` };
}

function preferenceScore(crop: CropInfo, input: CropRecInput): { score: number; reason: string } {
  if (input.cropPreference && crop.name.toLowerCase().includes(input.cropPreference.toLowerCase())) {
    return { score: 100, reason: `${crop.name} matches your stated crop preference.` };
  }
  return { score: 50, reason: '' };
}

function difficultyScore(crop: CropInfo): { score: number; reason: string } {
  if (crop.difficulty === 'Easy') return { score: 90, reason: `${crop.name} is easy to grow — lower risk for farmers.` };
  if (crop.difficulty === 'Medium') return { score: 70, reason: `${crop.name} has medium difficulty — some experience beneficial.` };
  return { score: 50, reason: `${crop.name} is hard to grow — requires significant experience.` };
}

function scoreCrop(crop: CropInfo, input: CropRecInput, weather: WeatherData | null): ScoredCrop {
  const temp = tempScore(crop, weather);
  const humidity = humidityScore(crop, weather);
  const rainfall = rainfallScore(crop, weather);
  const water = waterScore(crop, input);
  const soil = soilScore(crop, input);
  const state = stateScore(crop, input);
  const budget = budgetScore(crop, input);
  const pref = preferenceScore(crop, input);
  const diff = difficultyScore(crop);

  // Weighted score
  const farmingScore = Math.round(
    temp.score * 0.15 +
    humidity.score * 0.10 +
    rainfall.score * 0.15 +
    water.score * 0.15 +
    soil.score * 0.10 +
    state.score * 0.10 +
    budget.score * 0.10 +
    pref.score * 0.05 +
    diff.score * 0.10
  );

  // Overall ranking score (includes preference boost)
  const score = farmingScore + (pref.score === 100 ? 15 : 0);

  const reasons: string[] = [
    temp.reason, humidity.reason, rainfall.reason, water.reason, soil.reason, state.reason, budget.reason,
  ].filter(r => r.length > 0);
  if (pref.reason) reasons.push(pref.reason);
  if (diff.reason) reasons.push(diff.reason);

  return { crop, score, farmingScore: Math.min(100, farmingScore), reasons };
}

export function recommendCrop(input: CropRecInput, weather: WeatherData | null = null): CropRecResult {
  const scored = Object.values(cropDatabase).map(c => scoreCrop(c, input, weather));
  scored.sort((a, b) => b.score - a.score);
  const best = scored[0];

  const reasoning = `Based on your location (${input.state}, ${input.district}), ${input.season.toLowerCase()} season, ${input.soilType.toLowerCase()} soil, ${input.waterAvailability.toLowerCase()} water availability, and ${weather ? `current weather (${weather.temperature}°C, ${weather.humidity}% humidity, ${weather.rainChance}% rain chance)` : 'no live weather data'}, ${best.crop.name} is the most suitable choice with a Farming Score of ${best.farmingScore}/100.\n\nKey reasons:\n${best.reasons.map(r => `• ${r}`).join('\n')}`;

  return {
    crop: best.crop.name,
    image: best.crop.image,
    expectedYield: best.crop.expectedYield,
    profitEstimate: best.crop.expectedProfit,
    growingDuration: best.crop.growingDuration,
    waterRequirement: best.crop.waterRequirement,
    diseaseRisk: best.crop.commonDiseases.join(', '),
    fertilizer: `${best.crop.chemicalFertilizer} | Organic: ${best.crop.organicFertilizer}`,
    harvestTime: best.crop.harvestTime,
    marketDemand: best.crop.marketDemand,
    difficulty: best.crop.difficulty,
    reasoning,
    sowingMonth: best.crop.sowingMonth,
    harvestMonth: best.crop.harvestMonth,
    irrigationSchedule: best.crop.irrigationSchedule,
  };
}

export function getFarmingScore(input: CropRecInput, weather: WeatherData | null = null): number {
  const scored = Object.values(cropDatabase).map(c => scoreCrop(c, input, weather));
  scored.sort((a, b) => b.score - a.score);
  return scored[0].farmingScore;
}

export function getTopCrops(input: CropRecInput, weather: WeatherData | null = null, limit = 3): ScoredCrop[] {
  const scored = Object.values(cropDatabase).map(c => scoreCrop(c, input, weather));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}

export const cropNames = Object.keys(cropDatabase);
export const seasons = ['Kharif (Monsoon)', 'Rabi (Winter)', 'Zaid (Summer)'];
export const soilTypes = ['Alluvial', 'Black (Regur)', 'Red & Laterite', 'Sandy', 'Clay', 'Loamy'];
export const waterLevels = ['Low / Rainfed', 'Medium / Partial Irrigation', 'High / Full Irrigation', 'Abundant / Canal'];
export const budgetLevels = ['Low (Under ₹50,000)', 'Medium (₹50,000–2,00,000)', 'High (Above ₹2,00,000)'];
