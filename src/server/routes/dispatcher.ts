import { Router } from 'express';
import { getGeminiClient } from '../gemini-client';

const router = Router();

router.post('/dispatcher', async (req, res) => {
  try {
    const { prompt, history } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(503).json({ error: 'Dispatcher AI is offline. Missing GEMINI_API_KEY.' });
    }

    const systemInstruction = `You are an AI Dispatch Copilot for a commercial truck driver on the Truck Buddy Network network.
Your goal is to help them stay safe and compliant on the highway.
Answer questions about HOS rules, DOT inspection checklists, route safety, weather, cargo securement, etc.
Use trucker jargon where appropriate, but remain professional and focused on safety and compliance.
Respond concisely in 2-4 paragraphs.`;

    const contents = [
      ...(Array.isArray(history) ? history.map((item: any) => ({
        role: item.sender === 'dispatcher' ? 'model' : 'user',
        parts: [{ text: item.text || '' }]
      })) : []),
      {
        role: 'user',
        parts: [{ text: prompt || 'Hello Dispatcher' }]
      }
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
        maxOutputTokens: 300,
      }
    });

    return res.json({ text: response.text || "Ten-four. I'm experiencing some dead-zones, try asking that again." });
  } catch (err: any) {
    console.error('Error in /api/gemini/dispatcher:', err);
    return res.status(500).json({ error: 'Failed to contact dispatcher' });
  }
});

export default router;
