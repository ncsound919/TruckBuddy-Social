import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { accumulateMiles, methodLabel, MILEAGE_REVIEW_STATUS } from '../lib/mileage';

describe('mileage honesty', () => {
  it('accumulates within a period rather than overwriting the last run', () => {
    expect(accumulateMiles(100, 50)).toBe(150);
    expect(accumulateMiles(null, 50)).toBe(50);
    expect(accumulateMiles(0, 50)).toBe(50);
  });

  it('labels every method as self-reported, never "Verified"', () => {
    for (const m of ['odometer_photo', 'eld_telematics', 'scale_bol', 'unknown']) {
      expect(methodLabel(m)).not.toMatch(/verified/i);
      expect(methodLabel(m)).toMatch(/self-reported/i);
    }
  });

  it('submits entries for review rather than auto-approving them', () => {
    expect(MILEAGE_REVIEW_STATUS).toBe('pending');
  });

  it('source no longer hardcodes a verified status or fabricated verification badges', () => {
    const section = readFileSync(
      fileURLToPath(new URL('../features/leaderboard/MileageLeaderboardSection.tsx', import.meta.url)),
      'utf8',
    );
    expect(section).not.toMatch(/status:\s*'verified'/);
    expect(section).not.toMatch(/Verified Odometer OCR/);
    expect(section).not.toMatch(/ELD Telematics Direct Sync/);

    const api = readFileSync(fileURLToPath(new URL('../lib/social-api.ts', import.meta.url)), 'utf8');
    expect(api).not.toMatch(/is_verified:\s*entry\.status === 'verified'/);
  });

  it('the submit modal does not claim a fabricated OCR/ECM verification', () => {
    const modal = readFileSync(
      fileURLToPath(new URL('../features/leaderboard/components/SubmitMileageModal.tsx', import.meta.url)),
      'utf8',
    );
    expect(modal).not.toMatch(/Cummins ECM gateway/);
    expect(modal).not.toMatch(/ECM Odometer Verified/);
  });
});
