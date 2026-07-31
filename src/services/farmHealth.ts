import type { WeatherData, CropRecResult } from '@/types';

export interface HealthFactor {
  label: string;
  value: string;
  status: 'good' | 'medium' | 'bad';
  points: number;
}

export interface ScoreChange {
  factor: string;
  delta: number;
  reason: string;
}

export interface FarmHealth {
  score: number;
  label: string;
  recommendation: string;
  factors: HealthFactor[];
  changes: ScoreChange[];
}

export function calculateFarmHealth(
  weather: WeatherData | null,
  crop: CropRecResult | null,
  marketTrend: 'up' | 'down' | 'neutral' = 'neutral',
): FarmHealth {
  if (!weather) {
    return {
      score: 0,
      label: 'Loading...',
      recommendation: 'Fetching weather data to calculate your farm health.',
      factors: [],
      changes: [],
    };
  }

  let score = 50; // Base score
  const factors: HealthFactor[] = [];
  const changes: ScoreChange[] = [];

  // Weather / Temperature (25 points)
  if (weather.temperature >= 15 && weather.temperature <= 32) {
    score += 25;
    factors.push({ label: 'Weather', value: 'Good', status: 'good', points: 25 });
    changes.push({ factor: 'Temperature', delta: 25, reason: `Optimal temperature (${weather.temperature}°C) for crop growth` });
  } else if (weather.temperature >= 10 && weather.temperature <= 38) {
    score += 12;
    factors.push({ label: 'Weather', value: 'Fair', status: 'medium', points: 12 });
    if (weather.temperature > 32) changes.push({ factor: 'Temperature', delta: -13, reason: `Temperature high (${weather.temperature}°C) — heat stress risk` });
    else changes.push({ factor: 'Temperature', delta: -13, reason: `Temperature low (${weather.temperature}°C) — cold stress risk` });
  } else {
    score += 3;
    factors.push({ label: 'Weather', value: 'Extreme', status: 'bad', points: 3 });
    changes.push({ factor: 'Temperature', delta: -22, reason: `Extreme temperature (${weather.temperature}°C) — dangerous for crops` });
  }

  // Humidity / Disease Risk (20 points)
  if (weather.humidity < 60) {
    score += 20;
    factors.push({ label: 'Disease Risk', value: 'Low', status: 'good', points: 20 });
    changes.push({ factor: 'Disease Risk', delta: 20, reason: `Low humidity (${weather.humidity}%) — low fungal disease risk` });
  } else if (weather.humidity < 80) {
    score += 10;
    factors.push({ label: 'Disease Risk', value: 'Medium', status: 'medium', points: 10 });
    changes.push({ factor: 'Disease Risk', delta: -10, reason: `Moderate humidity (${weather.humidity}%) — monitor for fungal diseases` });
  } else {
    score += 2;
    factors.push({ label: 'Disease Risk', value: 'High', status: 'bad', points: 2 });
    changes.push({ factor: 'Disease Risk', delta: -18, reason: `High humidity (${weather.humidity}%) — high fungal disease risk` });
  }

  // Rain / Water Availability (20 points)
  if (weather.rainChance >= 30 && weather.rainChance <= 70) {
    score += 20;
    factors.push({ label: 'Water Availability', value: 'Good', status: 'good', points: 20 });
    changes.push({ factor: 'Rain', delta: 20, reason: `Adequate rainfall expected (${weather.rainChance}%) — good soil moisture` });
  } else if (weather.rainChance >= 20) {
    score += 10;
    factors.push({ label: 'Water Availability', value: 'Fair', status: 'medium', points: 10 });
    changes.push({ factor: 'Rain', delta: -10, reason: `Low rainfall (${weather.rainChance}%) — irrigation may be needed` });
  } else {
    score += 5;
    factors.push({ label: 'Water Availability', value: 'Low', status: 'medium', points: 5 });
    changes.push({ factor: 'Rain', delta: -15, reason: `Very low rainfall (${weather.rainChance}%) — irrigation required` });
  }

  // Soil Moisture (15 points) — derived from humidity + rain
  const soilMoistureEst = Math.round(weather.humidity * 0.4 + weather.rainChance * 0.6);
  if (soilMoistureEst >= 40 && soilMoistureEst <= 70) {
    score += 15;
    factors.push({ label: 'Soil Moisture', value: 'Good', status: 'good', points: 15 });
  } else if (soilMoistureEst >= 25) {
    score += 8;
    factors.push({ label: 'Soil Moisture', value: 'Fair', status: 'medium', points: 8 });
  } else {
    score += 3;
    factors.push({ label: 'Soil Moisture', value: 'Low', status: 'bad', points: 3 });
  }

  // Market Demand (20 points)
  if (marketTrend === 'up') {
    score += 20;
    factors.push({ label: 'Market Demand', value: 'High', status: 'good', points: 20 });
    changes.push({ factor: 'Market Trend', delta: 20, reason: 'Prices are rising — favorable selling conditions' });
  } else if (marketTrend === 'down') {
    score += 5;
    factors.push({ label: 'Market Demand', value: 'Low', status: 'medium', points: 5 });
    changes.push({ factor: 'Market Trend', delta: -15, reason: 'Prices are falling — consider holding produce' });
  } else {
    score += 12;
    factors.push({ label: 'Market Demand', value: 'Stable', status: 'good', points: 12 });
  }

  // Crop-specific adjustments
  if (crop) {
    if (crop.difficulty === 'Easy') {
      score += 5;
      changes.push({ factor: 'Crop Selection', delta: 5, reason: `${crop.crop} is easy to grow — lower risk` });
    } else if (crop.difficulty === 'Medium') {
      score += 2;
    }
    if (crop.marketDemand.toLowerCase().includes('very high')) {
      score += 5;
      changes.push({ factor: 'Market Demand', delta: 5, reason: `${crop.crop} has very high market demand` });
    }
  }

  score = Math.min(100, Math.max(0, Math.round(score)));

  const label = score >= 80 ? 'Excellent Conditions' : score >= 60 ? 'Good Conditions' : score >= 40 ? 'Fair Conditions' : 'Poor Conditions';
  const recommendation = score >= 80
    ? 'Good day for sowing maize. All conditions are favorable for regular farm operations.'
    : score >= 60
    ? 'Conditions are good. Monitor crops and continue regular activities.'
    : score >= 40
    ? 'Fair conditions. Take precautions for extreme weather and monitor crops closely.'
    : 'Poor conditions. Delay sowing and protect existing crops from extreme weather.';

  return { score, label, recommendation, factors, changes };
}

export interface AIInsight {
  priority: 'High' | 'Medium' | 'Low';
  reason: string;
  benefit: string;
  action: string;
  icon: string;
}

export function generateAIInsights(
  weather: WeatherData | null,
  crop: CropRecResult | null,
  marketTrend: 'up' | 'down' | 'neutral' = 'neutral',
  marketCropName?: string,
): AIInsight[] {
  const insights: AIInsight[] = [];
  if (!weather) return insights;

  // Rain-based insight
  if (weather.rainChance >= 70) {
    insights.push({
      priority: 'High',
      reason: `Heavy rainfall expected in 24 hours (${weather.rainChance}% probability).`,
      benefit: 'Prevents waterlogging, nutrient leaching, and crop damage.',
      action: 'Delay irrigation and fertilizer application. Ensure proper field drainage.',
      icon: '🌧️',
    });
  } else if (weather.rainChance <= 20 && weather.temperature > 25) {
    insights.push({
      priority: 'Medium',
      reason: `Dry conditions with low rain probability (${weather.rainChance}%).`,
      benefit: 'Maintains optimal soil moisture and prevents water stress.',
      action: 'Increase irrigation frequency. Apply mulch to conserve soil moisture.',
      icon: '☀️',
    });
  }

  // Humidity / disease insight
  if (weather.humidity >= 80) {
    insights.push({
      priority: 'High',
      reason: `Current humidity is very high (${weather.humidity}%), favoring fungal growth.`,
      benefit: 'Early detection prevents crop loss and reduces fungicide costs.',
      action: 'Inspect crops every morning for fungal symptoms. Improve field ventilation.',
      icon: '💧',
    });
  } else if (weather.humidity >= 60) {
    insights.push({
      priority: 'Medium',
      reason: `Moderate humidity (${weather.humidity}%) — moderate disease risk.`,
      benefit: 'Proactive monitoring keeps disease pressure under control.',
      action: 'Monitor crops for early signs of fungal disease. Maintain air circulation.',
      icon: '💧',
    });
  }

  // Temperature insight
  if (weather.temperature >= 38) {
    insights.push({
      priority: 'High',
      reason: `Temperature above 38°C (${weather.temperature}°C) — heat stress risk.`,
      benefit: 'Reduces heat damage and water loss from crops.',
      action: 'Water crops early morning (6–8 AM). Provide shade for sensitive plants.',
      icon: '🌡️',
    });
  } else if (weather.temperature <= 5) {
    insights.push({
      priority: 'High',
      reason: `Cold conditions (${weather.temperature}°C) — frost risk.`,
      benefit: 'Prevents cold damage to sensitive crops.',
      action: 'Cover crops with protective sheets. Delay sowing of cold-sensitive varieties.',
      icon: '❄️',
    });
  }

  // Wind insight
  if (weather.windSpeed >= 30) {
    insights.push({
      priority: 'High',
      reason: `Strong wind expected (${weather.windSpeed} km/h).`,
      benefit: 'Prevents pesticide drift and physical crop damage.',
      action: 'Delay pesticide spraying. Stake tall crops and protect young seedlings.',
      icon: '💨',
    });
  }

  // UV insight
  if (weather.uvIndex >= 8) {
    insights.push({
      priority: 'Low',
      reason: `Very high UV index (${weather.uvIndex}).`,
      benefit: 'Protects workers from sun exposure and heat exhaustion.',
      action: 'Workers should use sun protection. Avoid midday field work.',
      icon: '🔆',
    });
  }

  // Market insight
  if (marketTrend === 'up' && marketCropName) {
    insights.push({
      priority: 'Low',
      reason: `${marketCropName} prices are increasing this week.`,
      benefit: 'Selling at the right time can improve profit by 8–15%.',
      action: 'Consider selling within the next 3–5 days to maximize returns.',
      icon: '📈',
    });
  } else if (marketTrend === 'down' && marketCropName) {
    insights.push({
      priority: 'Low',
      reason: `${marketCropName} prices are declining.`,
      benefit: 'Avoiding selling at the bottom protects your income.',
      action: 'Consider storing produce if possible and waiting for prices to recover.',
      icon: '📉',
    });
  }

  // Crop-specific insight
  if (crop) {
    insights.push({
      priority: 'Medium',
      reason: `${crop.crop} requires ${crop.waterRequirement.toLowerCase()} water.`,
      benefit: 'Matching irrigation to crop needs saves water and improves yield.',
      action: crop.irrigationSchedule || 'Follow recommended irrigation schedule for your crop.',
      icon: '🌱',
    });
  }

  // Sort by priority
  const order = { High: 0, Medium: 1, Low: 2 };
  insights.sort((a, b) => order[a.priority] - order[b.priority]);

  return insights.slice(0, 5);
}
