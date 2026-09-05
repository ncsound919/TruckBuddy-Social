import { Router } from 'express';
import { getGeminiClient } from '../gemini-client';

const router = Router();

router.post('/driver-chat', async (req, res) => {
  try {
    const { driverName, driverBio, driverRig, userPrompt, chatHistory } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      const fallbackResponses: Record<string, string> = {
        'DieselDuchess': `Ten-four! Handling heavy freight right now on this 4-axle lowboy. Rolling smooth, watching the axle scales and keeping steady. How's your run treating you?`,
        'GearJammer_77': `Copy that, good buddy! Just scaled out on I-10 with a load of reefer freight. Keeping the temp locked at 34 degrees and moving east. Stay safe out there!`,
        'FlatbedFrank': `10-4 on that! Got 6 steel coils chained down with 3/8" Grade 70 transport chains, binders locked tight. Keep the greasy side down and shiny side up!`,
        'default': `Ten-four driver! Read you loud and clear over the radio. Stay alert in the blind spots and have a safe shift!`
      };
      const text = fallbackResponses[driverName] || fallbackResponses['default'];
      return res.json({ text, status: 'fallback_active' });
    }

    const systemInstruction = `You are roleplaying as "${driverName}", a professional American commercial truck driver (CDL Class-A) on the "Truck Buddy Network Association" network.
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
      model: 'gemini-2.0-flash',
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
      error: 'Communication failure due to signal loss.' 
    });
  }
});

export default router;
