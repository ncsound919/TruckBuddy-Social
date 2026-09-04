import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// API route for AI Dispatcher
app.post('/api/gemini/dispatcher', async (req, res) => {
  const { prompt, history } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    // Elegant fallback if no key is present to guarantee a fully working prototype
    console.log('Gemini API key is missing or default. Running mock knowledge engine fallback.');
    const query = prompt.toLowerCase();
    
    // Heuristic response matcher
    const { mockDispatcherAnswers, fallbackDispatcherAnswer } = await import('./src/data.js').catch(() => ({
      mockDispatcherAnswers: [
        {
          keywords: ['hos', 'split', 'sleeper', 'break', 'fmcsa'],
          answer: "FMCSA split sleeper berth rule allows you to split your required 10-hour off-duty time into an 8/2 or 7/3 split. The shorter period must be at least 2 consecutive hours, and the longer period must be at least 7 consecutive hours in the sleeper. Neither period counts against your 14-hour driving window."
        },
        {
          keywords: ['wind', 'wyoming', 'i80', 'i-80', 'weather'],
          answer: "I-80 Wyoming (especially Elk Mountain and Laramie MM 250-290) is notorious for sudden high-wind advisories and winter storm whiteouts. If the 'Light & High Profile Vehicle' ban is active, pull over safely at the nearest Travel Center (Cheyenne or Rawlins)."
        },
        {
          keywords: ['dot', 'inspection', 'level 1', 'checklist'],
          answer: "A DOT Level 1 inspection is the most comprehensive roadside audit covering driver credentials (CDL, Medical Card, ELD log) and vehicle mechanics (brakes, lights, securement, tires, fuel system, coupling devices)."
        }
      ],
      fallbackDispatcherAnswer: "I'm your AI Dispatch Copilot. Ask me anything about FMCSA Hours of Service (HOS) rules, Wyoming I-80 wind conditions, DOT inspection checklists, cargo securement standards, or owner-operator tax deductions!"
    }));

    let match = mockDispatcherAnswers.find(item => 
      item.keywords.some(kw => query.includes(kw))
    );

    const answer = match 
      ? `${match.answer}\n\n*(Note: Running in offline local assistant mode. Setup your GEMINI_API_KEY to unlock unlimited conversational intelligence!)*`
      : `${fallbackDispatcherAnswer}\n\n*(Note: Running in offline local assistant mode. Setup your GEMINI_API_KEY to unlock unlimited conversational intelligence!)*`;

    return res.json({ text: answer });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const systemInstruction = `You are "Dispatch Copilot", an elite professional Highway Dispatcher, FMCSA Compliance Advisor, and Route Consultant for commercial truck drivers.
Your goal is to help drivers on the highway stay safe, compliant, and profitable.
Guidelines:
1. Provide accurate commercial vehicle safety and compliance advice (FMCSA guidelines, HOS rules, cargo securement, scales guidelines).
2. Answer inquiries professionally, using authentic, respectful trucker lingo (e.g. referring to drivers as "Driver" or "Cap", using road terms naturally but professionally). Keep it crisp, authoritative, yet friendly and supportive.
3. Help with weather logistics (e.g., advising on Donner Pass or Wyoming I-80 winter safety, tarping requirements for steel or lumber flatbed loads, etc.).
4. Do not talk about general topics. Stay strictly focused on trucking, logistics, vehicle maintenance, CDL guidelines, route planning, and owner-operator finance advice.
Keep your responses concise, highly structured, and easy to read on a mobile phone dashboard screen while parked. Use bullet points for checklists.`;

    const chatHistory = history ? history.map((h: any) => ({
      role: h.sender === 'user' ? 'user' : 'model',
      parts: [{ text: h.text }]
    })) : [];

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        ...chatHistory,
        { role: 'user', parts: [{ text: prompt }] }
      ],
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    const reply = response.text || "Sorry, Driver. I couldn't process that route query. Try again.";
    return res.json({ text: reply });

  } catch (error: any) {
    console.error('Error calling Gemini API:', error);
    return res.status(500).json({ error: 'AI Dispatcher is temporarily resting. Please try again shortly.', details: error.message });
  }
});

// API route for Driver-to-Driver Direct Messenger
app.post('/api/gemini/driver-chat', async (req, res) => {
  const { driverName, driverBio, driverRig, userPrompt, chatHistory } = req.body;

  if (!userPrompt) {
    return res.status(400).json({ error: 'Message text is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    // Return realistic trucker feedback offline
    const fallbacks = [
      `Ten-four on that! Running dry-van in this storm is intense. Keep the wheels rolling, Willie!`,
      `Appreciate the heads-up! Just scaled and weight looks good. Catch you in the hammer lane.`,
      `Copy that, Willie! Let me double check with my dispatcher when I make my next rest stop.`,
      `Sounds good. Watch out for radar state troopers near mile marker 70! Keep the shiny side up!`
    ];
    const randomFallback = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    return res.json({ text: `${randomFallback} *(Offline Mode)*` });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const systemInstruction = `You are playing the role of a professional commercial truck driver in direct messages chat with another driver (Willie "Overdrive" Nelson).
Your driver persona is:
- Name: ${driverName}
- Driver Background/Bio: ${driverBio}
- Custom Rig/Tractor: ${driverRig}

Keep your responses short, conversational, and direct, as if you are typing quickly on your phone while waiting at a shipper loading dock or parked at a Travel Plaza.
Use authentic, friendly trucker slang naturally (e.g., "Ten-four", "copy that", "good buddy", "hammer lane", "bear trap", "keep the shiny side up", "reefer", "weigh scale").
Respond directly to Willie's message, keeping the conversation brief and helpful.`;

    const formattedHistory = chatHistory ? chatHistory.map((h: any) => ({
      role: h.role,
      parts: [{ text: h.text }]
    })) : [];

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        ...formattedHistory,
        { role: 'user', parts: [{ text: userPrompt }] }
      ],
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.8,
      }
    });

    const reply = response.text || "Ten-four driver! Good signal here.";
    return res.json({ text: reply });

  } catch (error: any) {
    console.error('Error calling Gemini API for driver-chat:', error);
    return res.status(500).json({ error: 'Driver is offline' });
  }
});

// Vite Integration Middleware
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
    console.log(`Truckers Association server active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
