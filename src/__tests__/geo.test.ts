import { describe, it, expect } from 'vitest';
import { coordForHomeBase } from '../lib/geo';

describe('coordForHomeBase', () => {
  it('resolves a state centroid from a "City, ST" home base', () => {
    const tx = coordForHomeBase('Dallas, TX');
    expect(tx.lat).toBeGreaterThan(25);
    expect(tx.lat).toBeLessThan(50);
    expect(tx.lng).toBeLessThan(-80);
  });

  it('gives different coordinates for different states', () => {
    expect(coordForHomeBase('Dallas, TX')).not.toEqual(coordForHomeBase('Fresno, CA'));
  });

  it('falls back to a national centroid for an unknown or missing home base', () => {
    expect(coordForHomeBase('Nowhere')).toEqual({ lat: 39.5, lng: -98.35 });
    expect(coordForHomeBase(null)).toEqual({ lat: 39.5, lng: -98.35 });
    expect(coordForHomeBase(undefined)).toEqual({ lat: 39.5, lng: -98.35 });
  });
});
