/**
 * Mileage honesty helpers.
 *
 * A driver's logged miles are self-reported until a real verification channel
 * (OCR/ELD/ECM) exists. Nothing here may label self-entered data as "verified",
 * and a period's total must accumulate rather than overwrite the last run.
 */

/** New proofs are submitted for review, never auto-approved by the client. */
export const MILEAGE_REVIEW_STATUS = 'pending' as const;

/** Human label for a submission method — always qualified as self-reported. */
export function methodLabel(method: string): string {
  switch (method) {
    case 'odometer_photo':
      return 'Odometer photo (self-reported)';
    case 'eld_telematics':
      return 'ELD export (self-reported)';
    case 'scale_bol':
      return 'Scale / BOL (self-reported)';
    default:
      return 'Self-reported';
  }
}

/** Sum a new run into a period's existing total (never overwrite). */
export function accumulateMiles(existing: number | null | undefined, delta: number): number {
  const base = typeof existing === 'number' && existing > 0 ? existing : 0;
  return base + delta;
}
