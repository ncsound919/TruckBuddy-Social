import { describe, it, expect } from 'vitest';
import { quantizeCoord } from '../lib/social-api';
import { rowToMemberLocation } from '../lib/social-mappers';

describe('social privacy', () => {
  it('quantizes coordinates to the declared privacy level', () => {
    expect(quantizeCoord(37.774929, 'corridor')).toBe(37.77);
    expect(quantizeCoord(37.774929, 'exact')).toBe(37.775);
    // 2 decimals ~1.1 km: a corridor-level location cannot pin an exact address.
    expect(Math.abs(quantizeCoord(37.774929, 'corridor') - 37.774929)).toBeGreaterThan(0.001);
  });

  it('defaults is_sharing to false when the DB value is missing', () => {
    const loc = rowToMemberLocation({ user_id: 'u1', latitude: 1, longitude: 2, is_sharing: undefined } as never);
    expect(loc.isSharingLocation).toBe(false);
  });

  it('honors an explicit sharing flag', () => {
    const loc = rowToMemberLocation({ user_id: 'u1', latitude: 1, longitude: 2, is_sharing: true } as never);
    expect(loc.isSharingLocation).toBe(true);
  });
});
