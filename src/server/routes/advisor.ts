import { Router } from 'express';
import { getGeminiClient } from '../gemini-client';

const router = Router();

router.post('/route-advisor', async (req, res) => {
  try {
    const { origin, destination, corridor, cargoWeight, equipmentType } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        corridorReport: `${corridor || 'I-80'} Corridor is active with moderate winter freight volume. Maintain standard 4-second following distance and verify bridge weight limits.`,
        steepGrades: ['Donner Pass (7,057 ft, 6% grade)', 'Sherman Summit / Elk Mountain (8,640 ft)'],
        weighStationsEnRoute: ['Evanston POE (Active)', 'North Platte Scales (PrePass Green)'],
        recommendedRestStops: ['Love\'s Travel Stop (Exit 142)', 'Petro Stopping Center (Exit 311)'],
        status: 'fallback'
      });
    }

    const prompt = `Analyze this commercial freight route for a CDL truck driver:
Origin: ${origin || 'Chicago, IL'}
Destination: ${destination || 'Salt Lake City, UT'}
Primary Corridor: ${corridor || 'I-80'}
Cargo Weight: ${cargoWeight || 42000} lbs
Equipment: ${equipmentType || '53ft Dry Van'}

Provide real-world commercial trucking safety intelligence in JSON format:
{
  "corridorReport": "2-3 sentences overview of road grade, typical high wind hazards, and winter chain laws",
  "steepGrades": ["List of steep mountain passes or brake-check areas with percentage grades"],
  "weighStationsEnRoute": ["List of major state POE or DOT weigh stations with typical bypass tips"],
  "recommendedRestStops": ["2 top truck stops along this lane with ample overnight parking and high-speed diesel"]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: 'application/json',
        temperature: 0.3
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (err: any) {
    console.error('Error in /api/gemini/route-advisor:', err);
    return res.status(500).json({ error: 'Failed to evaluate route safety. Try again later.' });
  }
});

export default router;
