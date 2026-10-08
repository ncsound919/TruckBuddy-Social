import { US_STATE_CENTROIDS } from '../features/map/mapData';

const DEFAULT_COORD = { lat: 39.5, lng: -98.35 };

/**
 * A corridor-level coordinate for a "City, ST" home base. Used to place a member
 * on the map the first time they turn sharing on (when no location row exists
 * yet). Falls back to the national centroid when the state is unknown.
 */
export function coordForHomeBase(homeBase: string | null | undefined): { lat: number; lng: number } {
  const m = /,\s*([A-Za-z]{2})\b/.exec(homeBase ?? '');
  const code = m?.[1]?.toUpperCase();
  const hit = code ? US_STATE_CENTROIDS.find((c) => c.code === code) : undefined;
  return hit ? { lat: hit.lat, lng: hit.lng } : { ...DEFAULT_COORD };
}
