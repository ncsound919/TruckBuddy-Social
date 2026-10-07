import { describe, it, expect } from 'vitest';
import { toReportReason, rowToLiveReport } from '../lib/social-api';

describe('moderation DB mapping', () => {
  it('maps free-text reasons onto the report_reason enum', () => {
    expect(toReportReason('Spam advertising cargo brokers without a license')).toBe('spam');
    expect(toReportReason('This is harassment')).toBe('harassment');
    expect(toReportReason('explicit abuse')).toBe('inappropriate');
    expect(toReportReason('spreading false rumors')).toBe('misinformation');
    expect(toReportReason('something else entirely')).toBe('other');
  });

  it('maps a reports row to the live shape, keeping the original ref', () => {
    const r = rowToLiveReport({
      id: '11111111-1111-1111-1111-111111111111',
      reporter_id: 'u1',
      target_type: 'post',
      target_id: '22222222-2222-2222-2222-222222222222',
      target_ref: 'post-2',
      reason: 'spam',
      details: 'Spam advertising',
      status: 'open',
      created_at: '2026-10-07T00:00:00.000Z',
    });
    expect(r.targetRef).toBe('post-2');
    expect(r.status).toBe('open');
    expect(r.reason).toBe('spam');
  });
});
