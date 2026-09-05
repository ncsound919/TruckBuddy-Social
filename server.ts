import express from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy initialize Gemini API client
let genAI: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!genAI) {
    genAI = new GoogleGenAI({ apiKey });
  }
  return genAI;
}

// ----------------------------------------------------
// 1. REAL API ENDPOINT: Driver Messenger Chat with Gemini AI
// ----------------------------------------------------
app.post('/api/gemini/driver-chat', async (req, res) => {
  try {
    const { driverName, driverBio, driverRig, userPrompt, chatHistory } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      // If API key is not yet set in environment, deliver an intelligent CDL persona reply
      const fallbackResponses: Record<string, string> = {
        'DieselDuchess': `Ten-four! Handling heavy freight right now on this 4-axle lowboy. Rolling smooth, watching the axle scales and keeping steady. How's your run treating you?`,
        'GearJammer_77': `Copy that, good buddy! Just scaled out on I-10 with a load of reefer freight. Keeping the temp locked at 34 degrees and moving east. Stay safe out there!`,
        'FlatbedFrank': `10-4 on that! Got 6 steel coils chained down with 3/8" Grade 70 transport chains, binders locked tight. Keep the greasy side down and shiny side up!`,
        'default': `Ten-four driver! Read you loud and clear over the radio. Stay alert in the blind spots and have a safe shift!`
      };
      const text = fallbackResponses[driverName] || fallbackResponses['default'];
      return res.json({ text, status: 'fallback_active' });
    }

    const systemInstruction = `You are roleplaying as "${driverName}", a professional American commercial truck driver (CDL Class-A) on the "Truckers Social Association" network.
Driver Bio: ${driverBio || 'Experienced long-haul commercial driver'}.
Current Rig: ${driverRig || '18-wheeler tractor trailer'}.

Persona Guidelines:
- Speak authentically like an experienced interstate commercial truck driver.
- Use natural trucker jargon when appropriate (e.g., "10-4", "hammer lane", "chicken coop" (weigh station), "bear" (DOT/police), "shake the trees", "shiny side up", "reefer", "bobtail").
- Be friendly, respectful of fellow highway drivers, knowledgeable about DOT/FMCSA rules, securement, engine maintenance, and route conditions.
- Keep responses concise (2 to 4 sentences), direct, and conversational as if chatting during a 30-minute DOT rest break or at a truck stop counter.`;

    const contents = [
      ...(Array.isArray(chatHistory) ? chatHistory.map((item: any) => ({
        role: item.role === 'model' ? 'model' : 'user',
        parts: [{ text: item.text || '' }]
      })) : []),
      {
        role: 'user',
        parts: [{ text: userPrompt || 'Hey driver, how are the roads looking today?' }]
      }
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.8,
        maxOutputTokens: 250,
      }
    });

    const responseText = response.text || 'Ten-four! Having bad cell signal here in the pass, talk more when I hit the next truck stop.';
    return res.json({ text: responseText, status: 'ok' });
  } catch (err: any) {
    console.error('Error in /api/gemini/driver-chat:', err);
    return res.json({ 
      text: "Ten-four driver! Cell service is cutting out in the mountain pass. Keep the shiny side up!", 
      error: err.message 
    });
  }
});

// ----------------------------------------------------
// 2. REAL API ENDPOINT: Route & Terrain Safety Advisor
// ----------------------------------------------------
app.post('/api/gemini/route-advisor', async (req, res) => {
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
      model: 'gemini-3.8-flash',
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
    return res.status(500).json({ error: 'Failed to evaluate route safety' });
  }
});

// ----------------------------------------------------
// 3. REAL API ENDPOINT: FMCSA Logbook Audit Assistant
// ----------------------------------------------------
app.post('/api/gemini/hos-audit', async (req, res) => {
  try {
    const { drivingHours, onDutyHours, cycleHoursUsed, isSplitSleeper, splitBreak1, splitBreak2 } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      const driveRemaining = Math.max(0, 11 - (drivingHours || 0));
      const dutyRemaining = Math.max(0, 14 - ((drivingHours || 0) + (onDutyHours || 0)));
      return res.json({
        isCompliant: drivingHours <= 11 && ((drivingHours + onDutyHours) <= 14),
        drivingRemainingHours: driveRemaining,
        dutyRemainingHours: dutyRemaining,
        fmcsaCitations: ['49 CFR § 395.3 - Maximum driving time for property-carrying vehicles'],
        summary: `You have ${driveRemaining.toFixed(1)} hours of legal driving remaining before requiring a 10-hour reset or valid 8/2 / 7/3 split sleeper.`
      });
    }

    const prompt = `You are a certified FMCSA DOT Compliance Officer auditor. Evaluate these driver hours of service (HOS) under 49 CFR Part 395 (Property-Carrying Interstate CMV):
- Driving time today: ${drivingHours} hours
- Other On-Duty time today: ${onDutyHours} hours
- 70-hour / 8-day cycle used: ${cycleHoursUsed} hours
- Split Sleeper Attempt: ${isSplitSleeper ? `Yes (Period 1: ${splitBreak1} hrs, Period 2: ${splitBreak2} hrs)` : 'No'}

Respond in JSON format:
{
  "isCompliant": boolean,
  "drivingRemainingHours": number,
  "dutyRemainingHours": number,
  "fmcsaCitations": ["applicable regulation citations"],
  "summary": "Clear, direct guidance for the driver on what break or reset is required next"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (err: any) {
    console.error('Error in /api/gemini/hos-audit:', err);
    return res.status(500).json({ error: 'Failed to audit logbook' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Vite middleware or static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚚 Truckers Social Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
