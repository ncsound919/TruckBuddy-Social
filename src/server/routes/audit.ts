import { Router } from 'express';
import { getGeminiClient } from '../gemini-client';

const router = Router();

router.post('/hos-audit', async (req, res) => {
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
      model: 'gemini-2.0-flash',
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

export default router;
