import { describe, it, expect } from 'vitest';
import { evaluateHos, federalBridgeLimit } from '../lib/hos';

describe('evaluateHos', () => {
  it('flags the 70-hour cycle, not just the 11/14 limits', () => {
    const r = evaluateHos({ drivingHours: 6, onDutyHours: 2, cycleHoursUsed: 65, has30MinBreak: true });
    expect(r.isCompliant).toBe(false);
    expect(r.reasons.join(' ')).toMatch(/70-hour/);
  });

  it('flags a missing 30-minute break after 8 cumulative driving hours', () => {
    expect(evaluateHos({ drivingHours: 9, onDutyHours: 1, cycleHoursUsed: 10, has30MinBreak: false }).isCompliant).toBe(false);
    expect(evaluateHos({ drivingHours: 9, onDutyHours: 1, cycleHoursUsed: 10, has30MinBreak: true }).isCompliant).toBe(true);
  });

  it('reports remaining time within all limits', () => {
    const r = evaluateHos({ drivingHours: 6.5, onDutyHours: 2, cycleHoursUsed: 48.5, has30MinBreak: true });
    expect(r.isCompliant).toBe(true);
    expect(r.drivingRemainingHours).toBeCloseTo(4.5);
    expect(r.dutyRemainingHours).toBeCloseTo(5.5);
  });
});

describe('federalBridgeLimit', () => {
  it('clamps to the 80,000 lb federal maximum', () => {
    expect(federalBridgeLimit(60, 5)).toBe(80000);
  });

  it('returns 0 for a degenerate axle count instead of Infinity', () => {
    expect(federalBridgeLimit(51, 1)).toBe(0);
  });

  it('returns the formula value when below the cap', () => {
    const v = federalBridgeLimit(40, 5);
    expect(v).toBeGreaterThan(0);
    expect(v).toBeLessThanOrEqual(80000);
  });
});
