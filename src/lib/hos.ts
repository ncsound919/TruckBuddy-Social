/**
 * Hours-of-Service and federal bridge-formula math.
 *
 * Pure so the calculators are testable and cannot silently drop a limit. The
 * HOS evaluator enforces the 11-hour driving, 14-hour on-duty window, the
 * 70-hour/8-day cycle, and the 30-minute break after 8 cumulative driving hours.
 */

export interface HosInput {
  drivingHours: number;
  /** Non-driving on-duty hours (loading, fuel, inspections) for this shift. */
  onDutyHours: number;
  /** Hours already used in the 70-hour/8-day cycle before this shift. */
  cycleHoursUsed: number;
  has30MinBreak: boolean;
}

export interface HosResult {
  isCompliant: boolean;
  drivingRemainingHours: number;
  dutyRemainingHours: number;
  cycleRemainingHours: number;
  reasons: string[];
}

export function evaluateHos(input: HosInput): HosResult {
  const totalDuty = input.drivingHours + input.onDutyHours;
  const drivingRemainingHours = Math.max(0, 11 - input.drivingHours);
  const dutyRemainingHours = Math.max(0, 14 - totalDuty);
  const cycleRemainingHours = Math.max(0, 70 - (input.cycleHoursUsed + totalDuty));

  const reasons: string[] = [];
  if (input.drivingHours > 11) reasons.push('11-hour driving limit exceeded');
  if (totalDuty > 14) reasons.push('14-hour on-duty window exceeded');
  if (input.cycleHoursUsed + totalDuty > 70) reasons.push('70-hour/8-day cycle exceeded');
  if (input.drivingHours > 8 && !input.has30MinBreak) {
    reasons.push('30-minute break required after 8 cumulative driving hours');
  }

  return { isCompliant: reasons.length === 0, drivingRemainingHours, dutyRemainingHours, cycleRemainingHours, reasons };
}

/**
 * Federal bridge formula limit for a given bridge length (feet) and axle count,
 * clamped to the 80,000 lb federal maximum. Returns 0 for a degenerate axle
 * count (N < 2 divides by zero) rather than Infinity.
 */
export function federalBridgeLimit(bridgeLengthFeet: number, axles: number): number {
  if (!Number.isFinite(bridgeLengthFeet) || !Number.isFinite(axles) || axles < 2 || bridgeLengthFeet <= 0) {
    return 0;
  }
  const raw = 500 * ((bridgeLengthFeet * axles) / (axles - 1) + 12 * axles + 36);
  return Math.round(Math.min(raw, 80000));
}
