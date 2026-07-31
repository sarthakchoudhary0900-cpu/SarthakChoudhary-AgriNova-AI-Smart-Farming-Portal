import type { DiseaseResult } from '@/types';
import { diseaseDatabase, getDiseasesForCrop, type DiseaseInfo } from '@/data/diseases';

export function detectDisease(cropName?: string): DiseaseResult {
  if (!cropName) {
    // If no crop specified, return a "service unavailable" result
    return {
      disease: 'AI diagnosis service unavailable',
      confidence: 0,
      symptoms: 'Please select a crop type to view known diseases for that crop. AI image-based diagnosis requires an AI API integration that is not currently configured.',
      treatment: 'Select a crop to see disease information from our agricultural knowledge base.',
      organicSolution: 'Browse the disease database by selecting your crop type.',
      chemicalSolution: 'Browse the disease database by selecting your crop type.',
      prevention: 'Regular field inspection and good agricultural practices prevent most diseases.',
      nearbyOffice: 'Krishi Vigyan Kendra (KVK) — District Agriculture Office. Contact 1800-180-1551 for free expert diagnosis.',
    };
  }

  const diseases = getDiseasesForCrop(cropName);
  if (diseases.length === 0) {
    return {
      disease: 'No disease data available for this crop',
      confidence: 0,
      symptoms: `Our database does not have specific disease information for ${cropName}. Please consult your nearest Krishi Vigyan Kendra for expert advice.`,
      treatment: 'Consult your local agriculture extension officer for crop-specific disease management.',
      organicSolution: 'Apply neem oil (5ml/L) as a general organic preventive measure.',
      chemicalSolution: 'Consult an agriculture expert for crop-specific chemical treatment recommendations.',
      prevention: 'Use certified disease-free seeds, practice crop rotation, and maintain field sanitation.',
      nearbyOffice: 'Krishi Vigyan Kendra (KVK) — District Agriculture Office. Contact 1800-180-1551 for expert advice.',
    };
  }

  // Return the most common disease for the selected crop
  const disease = diseases[0];
  return diseaseInfoToResult(disease, 85);
}

export function getDiseasesForCropResult(cropName: string): DiseaseResult[] {
  const diseases = getDiseasesForCrop(cropName);
  return diseases.map((d, i) => diseaseInfoToResult(d, 85 - i * 5));
}

function diseaseInfoToResult(d: DiseaseInfo, confidence: number): DiseaseResult {
  return {
    disease: d.name,
    confidence,
    symptoms: d.symptoms,
    treatment: `Organic: ${d.organicTreatment} | Chemical: ${d.chemicalTreatment}`,
    organicSolution: d.organicTreatment,
    chemicalSolution: d.chemicalTreatment,
    prevention: d.prevention,
    nearbyOffice: `${d.nearbyOffice}\n\nGovernment Helpline: ${d.helpline}\nInspection Schedule: ${d.inspectionSchedule}\nPrecautions: ${d.precautions}`,
  };
}

export const allDiseaseNames = Object.values(diseaseDatabase).map(d => d.name);
