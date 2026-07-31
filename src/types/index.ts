import type { Session, User } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  state: string;
  district: string;
  farm_size: string;
  preferred_language: string;
  photo_url: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  user_id: string | null;
  created_at: string;
}

export interface CropRecommendation {
  id: string;
  user_id: string;
  inputs: Record<string, unknown>;
  result: Record<string, unknown>;
  created_at: string;
}

export interface DiseaseScan {
  id: string;
  user_id: string;
  image_url: string;
  result: Record<string, unknown>;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface SavedCrop {
  id: string;
  user_id: string;
  crop_name: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface SearchHistoryItem {
  id: string;
  user_id: string;
  query: string;
  category: string;
  created_at: string;
}

export interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  pressure: number;
  cloudCover: number;
  windSpeed: number;
  visibility: number;
  rainChance: number;
  uvIndex: number;
  sunrise: string;
  sunset: string;
  weatherCode: number;
  description: string;
  icon: string;
  location: string;
}

export interface CropRecResult {
  crop: string;
  image: string;
  expectedYield: string;
  profitEstimate: string;
  growingDuration: string;
  waterRequirement: string;
  diseaseRisk: string;
  fertilizer: string;
  harvestTime: string;
  marketDemand: string;
  difficulty: string;
  reasoning: string;
  sowingMonth?: string;
  harvestMonth?: string;
  irrigationSchedule?: string;
}

export interface DiseaseResult {
  disease: string;
  confidence: number;
  symptoms: string;
  treatment: string;
  organicSolution: string;
  chemicalSolution: string;
  prevention: string;
  nearbyOffice: string;
}

export interface MarketPrice {
  id: string;
  name: string;
  image: string;
  currentPrice: number;
  yesterdayPrice: number;
  highestPrice: number;
  lowestPrice: number;
  bestMarket: string;
  trend: number[];
  weeklyTrend: number[];
  monthlyTrend: number[];
  state: string;
  lastUpdated: string;
  unit: string;
}

export interface GovScheme {
  id: string;
  title: string;
  category: string;
  eligibility: string;
  benefits: string;
  documents: string[];
  deadline: string;
  website: string;
}

export interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  image: string;
  date: string;
  source: string;
}
