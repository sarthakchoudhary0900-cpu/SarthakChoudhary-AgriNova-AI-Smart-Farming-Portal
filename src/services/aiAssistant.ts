import type { ChatMessage } from '@/types';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

const SYSTEM_PROMPT = `You are AgriNova AI, a professional farming assistant for Indian farmers. Provide clear, practical, and accurate advice on crops, weather, fertilizers, diseases, government schemes, market prices, water management, and organic farming. Keep responses concise, actionable, and in simple language. If asked about something outside farming, gently redirect to agriculture topics.`;

export async function getAIResponse(message: string, history: ChatMessage[]): Promise<string> {
  if (!GEMINI_API_KEY) {
    return getLocalResponse(message);
  }

  try {
    const conversationHistory = history.slice(-8).map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const res = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
          ...conversationHistory,
          { role: 'user', parts: [{ text: message }] },
        ],
        generationConfig: { temperature: 0.7, maxOutputTokens: 800 },
      }),
    });

    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return text ?? getLocalResponse(message);
  } catch {
    return getLocalResponse(message);
  }
}

/**
 * Stream a response from Gemini API. Calls onChunk for each text piece received.
 * Falls back to local response if API key is missing or request fails.
 */
export async function streamAIResponse(
  message: string,
  history: ChatMessage[],
  onChunk: (text: string) => void,
): Promise<string> {
  if (!GEMINI_API_KEY) {
    const local = getLocalResponse(message);
    // Simulate streaming for local fallback
    const words = local.split(' ');
    for (let i = 0; i < words.length; i++) {
      await new Promise((r) => setTimeout(r, 30));
      onChunk((i === 0 ? '' : ' ') + words[i]);
    }
    return local;
  }

  try {
    const streamUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`;

    const conversationHistory = history.slice(-8).map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const res = await fetch(streamUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
          ...conversationHistory,
          { role: 'user', parts: [{ text: message }] },
        ],
        generationConfig: { temperature: 0.7, maxOutputTokens: 800 },
      }),
    });

    if (!res.ok || !res.body) throw new Error(`API error: ${res.status}`);

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const jsonStr = line.slice(6).trim();
          if (!jsonStr || jsonStr === '[DONE]') continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              fullText += text;
              onChunk(text);
            }
          } catch {
            // skip malformed chunks
          }
        }
      }
    }

    if (!fullText) {
      const fallback = getLocalResponse(message);
      onChunk(fallback);
      return fallback;
    }

    return fullText;
  } catch {
    const fallback = getLocalResponse(message);
    const words = fallback.split(' ');
    for (let i = 0; i < words.length; i++) {
      await new Promise((r) => setTimeout(r, 30));
      onChunk((i === 0 ? '' : ' ') + words[i]);
    }
    return fallback;
  }
}

function getLocalResponse(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes('weather') || lower.includes('rain') || lower.includes('temperature')) {
    return "Weather plays a crucial role in farming. Check the Weather page for real-time conditions in your area. As a general rule: avoid irrigation if rain is expected within 24 hours, and increase watering during high-heat periods. Monitor humidity levels — above 80% increases fungal disease risk.";
  }
  if (lower.includes('fertilizer') || lower.includes('npk') || lower.includes('urea')) {
    return "For balanced nutrition, apply NPK based on your crop and soil test results. A typical basal dose is 50% nitrogen + full phosphorus and potassium at sowing, with the remaining nitrogen split into 2 top dressings. Visit the Fertilizer Advisor page for crop-specific recommendations.";
  }
  if (lower.includes('disease') || lower.includes('pest') || lower.includes('fungus') || lower.includes('blight')) {
    return "For disease management: 1) Identify the disease using our Disease Detection page by uploading a photo. 2) Remove infected plant parts. 3) Apply organic solutions like neem oil first. 4) Use chemical fungicides only if organic methods don't work, following label instructions. 5) Practice crop rotation to prevent recurrence.";
  }
  if (lower.includes('scheme') || lower.includes('government') || lower.includes('subsidy')) {
    return "India offers several farmer schemes: PM-KISAN (₹6,000/year income support), PMFBY (crop insurance), Soil Health Card, and KCC (Kisan Credit Card for low-interest loans). Visit the Government Schemes page for eligibility and how to apply.";
  }
  if (lower.includes('market') || lower.includes('price') || lower.includes('sell')) {
    return "Check the Market Prices page for live crop prices and trends. Generally, sell when prices are above the 7-day average. Consider storing produce when prices are low if you have storage facilities. The e-NAM portal connects you to nationwide markets for better prices.";
  }
  if (lower.includes('water') || lower.includes('irrigation')) {
    return "Efficient irrigation saves water and improves yield. Use drip or sprinkler systems where possible. Water early morning or late evening to reduce evaporation. Check soil moisture before irrigating — overwatering is as harmful as underwatering. Visit the Irrigation Planner for crop-specific schedules.";
  }
  if (lower.includes('organic')) {
    return "Organic farming builds soil health long-term. Key practices: 1) Use compost and vermicompost. 2) Apply neem cake for pest control. 3) Use crop rotation and intercropping. 4) Apply biofertilizers like Rhizobium and Azotobacter. 5) Make jeevamrutha or panchagavya for soil enrichment.";
  }
  if (lower.includes('crop') && (lower.includes('grow') || lower.includes('plant') || lower.includes('best') || lower.includes('rajasthan'))) {
    return "The best crop depends on your location, season, soil, water, and budget. Visit the Smart Crop Recommendation page and fill in your details — our AI will suggest the most suitable crop with expected yield, profit, and growing instructions.";
  }
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('namaste')) {
    return "Namaste! I'm AgriNova AI, your farming assistant. I can help with crops, weather, fertilizers, diseases, government schemes, market prices, water management, and organic farming. What would you like to know?";
  }

  return "I'm here to help with all your farming questions — crops, weather, fertilizers, diseases, government schemes, market prices, irrigation, and organic farming. Could you share more details about what you need? For specific recommendations, try the Crop Advisor, Weather, or Disease Detection pages.";
}
