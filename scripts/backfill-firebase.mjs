#!/usr/bin/env node
/**
 * Backfill — Firebase (Auth + Firestore) -> shared Truck Buddy Supabase project.
 *
 * Migrates the TruckBuddy-Social legacy backend onto the shared Supabase
 * project used by the cab app and web portal. Because Supabase's admin API
 * accepts a client-supplied `id`, every Firebase uid is mapped to a
 * deterministic UUIDv5 — so `profiles.id`, `posts.author_id`, etc. all stay
 * consistent and the script is re-runnable without a mapping table.
 *
 * Requirements (env):
 *   FIREBASE_SERVICE_ACCOUNT   path to a service-account JSON  (or
 *                              GOOGLE_APPLICATION_CREDENTIALS)
 *   SUPABASE_URL               e.g. https://<ref>.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY  or SUPABASE_SECRET_KEY
 *
 * Optional:
 *   FIREBASE_PROJECT_ID        default: spring-display-479011-h0
 *   FIREBASE_FIRESTORE_DB      default: the AI Studio named database
 *
 * Usage:
 *   npm i -D firebase-admin
 *   node scripts/backfill-firebase.mjs            # dry run (default)
 *   node scripts/backfill-firebase.mjs --apply    # write
 *
 * Safety:
 *   - Dry run is the default; nothing is written without `--apply`.
 *   - Reads Firebase only; never writes back to Firebase.
 *   - Idempotent: all Supabase writes are upserts keyed by id.
 *   - Firebase passwords are not importable; migrated accounts sign in via
 *     Google or must reset their password.
 */

import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'spring-display-479011-h0';
const FIRESTORE_DB =
  process.env.FIREBASE_FIRESTORE_DB ||
  'ai-studio-truckerssocialas-951787f1-1ca5-43c5-ad4e-9c3f4195b9b6';
const SUPABASE_URL = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || '';
const APPLY = process.argv.includes('--apply');

const stats = {};
function bump(table, n = 1) {
  stats[table] = (stats[table] || 0) + n;
}

/* ------------------------------------------------------------------ */
/* UUIDv5 so Firebase string ids become stable Supabase uuid PKs       */
/* ------------------------------------------------------------------ */
const NS_DNS = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

function uuidv5(name, namespace = NS_DNS) {
  const ns = Buffer.from(namespace.replace(/-/g, ''), 'hex');
  const h = createHash('sha1').update(ns).update(Buffer.from(name, 'utf8')).digest().subarray(0, 16);
  h[6] = (h[6] & 0x0f) | 0x50;
  h[8] = (h[8] & 0x3f) | 0x80;
  const s = h.toString('hex');
  return `${s.slice(0, 8)}-${s.slice(8, 12)}-${s.slice(12, 16)}-${s.slice(16, 20)}-${s.slice(20)}`;
}

/* ------------------------------------------------------------------ */
/* Supabase REST helpers                                               */
/* ------------------------------------------------------------------ */
async function sbFetch(path, init = {}) {
  const res = await fetch(`${SUPABASE_URL}${path}`, {
    ...init,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
  const text = await res.text();
  if (!res.ok) {
    const err = new Error(`supabase ${res.status} ${path}: ${text.slice(0, 300)}`);
    err.status = res.status;
    throw err;
  }
  return text ? JSON.parse(text) : null;
}

async function upsert(table, rows, onConflict = 'id') {
  if (!rows.length) return;
  bump(table, rows.length);
  if (!APPLY) return;
  await sbFetch(`/rest/v1/${table}?on_conflict=${onConflict}`, {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify(rows),
  });
}

async function createAuthUser({ id, email, metadata }) {
  if (!APPLY) {
    bump('auth.users');
    return { created: true };
  }
  try {
    await sbFetch('/auth/v1/admin/users', {
      method: 'POST',
      body: JSON.stringify({
        id,
        email,
        email_confirm: true,
        user_metadata: metadata,
      }),
    });
    bump('auth.users');
    return { created: true };
  } catch (err) {
    if (err.status === 422 || /already/i.test(err.message)) return { created: false, skipped: true };
    throw err;
  }
}

/* ------------------------------------------------------------------ */
/* Firestore helpers                                                   */
/* ------------------------------------------------------------------ */
function ts(value) {
  if (!value) return null;
  if (typeof value.toDate === 'function') return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return new Date(value).toISOString();
  return null;
}

const str = (v) => (typeof v === 'string' && v ? v : null);
const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);

/** Collect a top-level collection into an array of { id, ...data }. */
async function collection(db, name) {
  const snap = await db.collection(name).get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/** Collect a subcollection for each parent doc. */
async function subcollection(db, parent, sub) {
  const out = [];
  const parents = await db.collection(parent).get();
  for (const p of parents.docs) {
    const snap = await p.ref.collection(sub).get();
    for (const d of snap.docs) out.push({ id: d.id, _parentId: p.id, ...d.data() });
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Main                                                                */
/* ------------------------------------------------------------------ */
async function main() {
  const saPath = process.env.FIREBASE_SERVICE_ACCOUNT || process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!saPath) throw new Error('FIREBASE_SERVICE_ACCOUNT (or GOOGLE_APPLICATION_CREDENTIALS) is required');
  if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');

  console.log(`mode: ${APPLY ? 'APPLY (writing)' : 'DRY RUN (no writes)'}`);
  console.log(`firebase: ${PROJECT_ID} / ${FIRESTORE_DB}`);
  console.log(`supabase: ${SUPABASE_URL}\n`);

  if (!getApps().length) {
    initializeApp({ credential: cert(JSON.parse(readFileSync(saPath, 'utf8'))), projectId: PROJECT_ID });
  }

  /* ---- Auth + users ---- */
  const auth = getAuth();
  const firebaseUsers = [];
  let pageToken;
  do {
    const page = await auth.listUsers(1000, pageToken);
    firebaseUsers.push(...page.users);
    pageToken = page.pageToken;
  } while (pageToken);

  const uidMap = new Map(); // firebaseUid -> supabase uuid
  const emailToUid = new Map();
  for (const u of firebaseUsers) {
    const id = uuidv5(`firebase:${u.uid}`);
    uidMap.set(u.uid, id);
    if (u.email) emailToUid.set(u.email.toLowerCase(), id);
  }

  console.log(`firebase users: ${firebaseUsers.length}`);
  let noEmail = 0;
  for (const u of firebaseUsers) {
    if (!u.email) {
      noEmail += 1;
      continue;
    }
    await createAuthUser({
      id: uidMap.get(u.uid),
      email: u.email,
      metadata: {
        full_name: u.displayName || undefined,
        avatar_url: u.photoURL || undefined,
        firebase_uid: u.uid,
      },
    });
  }
  if (noEmail) console.log(`  skipped ${noEmail} user(s) with no email (anonymous/phone-only)`);

  const db = getFirestore(undefined, FIRESTORE_DB);
  const resolve = (uid) => uidMap.get(uid) || (uid ? uuidv5(`firebase:${uid}`) : null);

  /* ---- users -> profiles ---- */
  const userDocs = await collection(db, 'users');
  const profileRows = userDocs.map((d) => ({
    id: resolve(d.id),
    email: str(d.email) || '',
    username: str(d.username),
    display_name: str(d.displayName) || str(d.username) || 'Driver',
    avatar_url: str(d.avatarUrl),
    bio: str(d.bio),
    role: str(d.role) || 'driver',
    cdl_class: str(d.cdlClass),
    years_experience: num(d.yearsExperience),
    current_rig: str(d.currentRig),
    home_base: str(d.homeBase),
    lanes: Array.isArray(d.lanes) ? d.lanes : null,
    carrier_name: str(d.carrierName),
    primary_corridor: str(d.primaryCorridor),
    is_verified: Boolean(d.isVerified),
    safe_miles: num(d.safeMiles) ?? 0,
    badges: Array.isArray(d.badges) ? d.badges : [],
    metadata: { firebaseUid: d.id, instructorInfo: d.instructorInfo, creatorInfo: d.creatorInfo },
  }));
  await upsert('profiles', profileRows);

  /* ---- posts + comments + likes ---- */
  const postDocs = await collection(db, 'posts');
  const postRows = [];
  const likeRows = [];
  for (const p of postDocs) {
    const postId = uuidv5(`post:${p.id}`);
    postRows.push({
      id: postId,
      author_id: resolve(p.author?.id),
      post_type: p.postType === 'image' ? 'photo' : str(p.postType) || 'text',
      caption: str(p.caption) ?? str(p.content),
      content: str(p.content) ?? str(p.caption),
      tags: Array.isArray(p.tags) ? p.tags : [],
      location_name: str(p.locationName),
      created_at: ts(p.createdAt) || ts(p.serverCreatedAt) || new Date().toISOString(),
      metadata: { mediaUrl: str(p.mediaUrl), poll: p.poll ?? null, firebaseId: p.id },
    });
    for (const uid of Array.isArray(p.upvotedUserIds) ? p.upvotedUserIds : []) {
      if (uidMap.has(uid)) likeRows.push({ post_id: postId, user_id: resolve(uid) });
    }
  }
  await upsert('posts', postRows.filter((r) => r.author_id));
  await upsert('likes', likeRows, 'post_id,user_id');

  const commentDocs = await subcollection(db, 'posts', 'comments');
  const commentRows = commentDocs
    .map((c) => ({
      id: uuidv5(`comment:${c._parentId}:${c.id}`),
      post_id: uuidv5(`post:${c._parentId}`),
      author_id: resolve(c.author?.id),
      body: str(c.body) || str(c.text) || str(c.content) || '',
      created_at: ts(c.createdAt) || new Date().toISOString(),
    }))
    .filter((c) => c.author_id && c.body);
  await upsert('comments', commentRows);

  /* ---- roadStatuses + reactions ---- */
  const statusDocs = await collection(db, 'roadStatuses');
  const statusRows = [];
  const reactionRows = [];
  for (const s of statusDocs) {
    const statusId = uuidv5(`status:${s.id}`);
    statusRows.push({
      id: statusId,
      driver_id: resolve(s.driver?.id),
      status_text: str(s.statusText) || '',
      corridor: str(s.corridor),
      mile_marker: str(s.mileMarker),
      emoji: str(s.emoji),
      media_url: str(s.mediaUrl),
      created_at: ts(s.timestamp) || new Date().toISOString(),
    });
    const interactions = s.userInteractions && typeof s.userInteractions === 'object' ? s.userInteractions : {};
    const reactionMap = { wave: 'wave', highBeam: 'high_beam', horn: 'horn', cheers: 'cheers' };
    for (const [uid, reaction] of Object.entries(interactions)) {
      if (uidMap.has(uid) && reactionMap[reaction]) {
        reactionRows.push({ status_id: statusId, user_id: resolve(uid), reaction: reactionMap[reaction] });
      }
    }
  }
  await upsert('road_statuses', statusRows.filter((r) => r.driver_id));
  await upsert('road_status_reactions', reactionRows, 'status_id,user_id,reaction');

  /* ---- safetyReports ---- */
  const reportDocs = await collection(db, 'safetyReports');
  await upsert(
    'safety_reports',
    reportDocs
      .map((r) => ({
        id: uuidv5(`report:${r.id}`),
        author_id: resolve(r.author?.id),
        category: str(r.reportType) || str(r.type) || 'hazard',
        title: str(r.title) || 'Road Advisory',
        body: str(r.description),
        latitude: num(r.lat),
        longitude: num(r.lng),
        location_name: str(r.locationName),
        upvote_count: num(r.upvotes) ?? 0,
        downvote_count: num(r.downvotes) ?? 0,
        created_at: ts(r.createdAt) || ts(r.serverCreatedAt) || new Date().toISOString(),
        metadata: { corridor: str(r.corridor), severity: str(r.severity), statusValue: str(r.statusValue), firebaseId: r.id },
      }))
      .filter((r) => r.author_id),
  );

  /* ---- convoys + members + messages ---- */
  const convoyDocs = await collection(db, 'convoys');
  const convoyRows = [];
  const memberRows = [];
  for (const c of convoyDocs) {
    const convoyId = uuidv5(`convoy:${c.id}`);
    convoyRows.push({
      id: convoyId,
      title: str(c.title) || str(c.name) || 'Highway Convoy',
      leader_id: resolve(c.leader?.id),
      description: str(c.notes),
      origin: str(c.origin),
      destination: str(c.destination),
      is_active: c.isActive !== false,
      created_at: ts(c.createdAt) || new Date().toISOString(),
      metadata: {
        corridor: str(c.corridor),
        cbChannel: num(c.cbChannel),
        cruisingSpeedMph: num(c.cruisingSpeedMph),
        currentMileMarker: str(c.currentMileMarker),
        direction: str(c.direction),
        maxMembers: num(c.maxMembers),
        hazmatAllowed: Boolean(c.hazmatAllowed),
        oversizeAllowed: Boolean(c.oversizeAllowed),
        cargoType: str(c.cargoType),
        status: str(c.status),
        fuelSavingsPercent: num(c.fuelSavingsPercent),
        firebaseId: c.id,
      },
    });
    for (const m of Array.isArray(c.members) ? c.members : []) {
      if (uidMap.has(m?.id)) memberRows.push({ convoy_id: convoyId, user_id: resolve(m.id), role: 'member' });
    }
  }
  await upsert('convoys', convoyRows.filter((r) => r.leader_id));
  await upsert('convoy_members', memberRows, 'convoy_id,user_id');

  const convoyMessages = await subcollection(db, 'convoys', 'messages');
  await upsert(
    'convoy_messages',
    convoyMessages
      .map((m) => ({
        id: uuidv5(`convoymsg:${m._parentId}:${m.id}`),
        convoy_id: uuidv5(`convoy:${m._parentId}`),
        sender_id: resolve(m.sender?.id),
        message: str(m.message) || str(m.text) || '',
        created_at: ts(m.timestamp) || new Date().toISOString(),
      }))
      .filter((m) => m.sender_id && m.message),
  );

  /* ---- memberLocations ---- */
  const locationDocs = await collection(db, 'memberLocations');
  await upsert(
    'member_locations',
    locationDocs
      .map((l) => ({
        user_id: resolve(l.driver?.id),
        latitude: num(l.lat),
        longitude: num(l.lng),
        location_name: str(l.city) || str(l.locationName),
        status: str(l.status),
        is_sharing: l.isSharingLocation !== false,
        updated_at: ts(l.lastUpdated) || new Date().toISOString(),
        metadata: {
          city: str(l.city),
          state: str(l.state),
          corridor: str(l.corridor),
          mileMarker: str(l.mileMarker),
          speedMph: num(l.speedMph),
          heading: str(l.heading),
          destinationCity: str(l.destinationCity),
          rigType: str(l.rigType),
          privacyLevel: str(l.privacyLevel),
          firebaseId: l.id,
        },
      }))
      .filter((l) => l.user_id && l.latitude != null && l.longitude != null),
    'user_id',
  );

  /* ---- mileageLeaderboard + proofs ---- */
  const mileageDocs = await collection(db, 'mileageLeaderboard');
  await upsert(
    'mileage_entries',
    mileageDocs
      .map((m) => ({
        user_id: resolve(m.driver?.id),
        period: new Date().toISOString().slice(0, 7),
        miles: num(m.totalMiles) ?? num(m.monthlyMiles) ?? 0,
        is_verified: Boolean(m.isVerified),
        metadata: {
          weeklyMiles: num(m.weeklyMiles),
          monthlyMiles: num(m.monthlyMiles),
          annualMiles: num(m.annualMiles),
          allTimeMiles: num(m.allTimeMiles),
          driverCategory: str(m.driverCategory),
          verifiedProofsCount: num(m.verifiedProofsCount),
          streakDays: num(m.consecutiveSafeDays),
          firebaseId: m.id,
        },
      }))
      .filter((m) => m.user_id),
    'user_id,period',
  );

  const proofDocs = await collection(db, 'mileageProofs');
  await upsert(
    'mileage_proofs',
    proofDocs
      .map((p) => ({
        id: uuidv5(`proof:${p.id}`),
        user_id: resolve(p.userId || p.driver?.id),
        miles_logged: num(p.milesLogged) ?? num(p.miles) ?? 0,
        period: p.dateLogged ? String(p.dateLogged).slice(0, 7) : null,
        evidence_url: str(p.proofImageUrl),
        status: p.status === 'verified' ? 'approved' : p.status === 'flagged' ? 'rejected' : 'pending',
        created_at: ts(p.dateLogged) || ts(p.submittedAt) || new Date().toISOString(),
        metadata: { method: str(p.method), eldProvider: str(p.eldProvider), routeCorridor: str(p.routeCorridor), verificationCode: str(p.verificationCode), firebaseId: p.id },
      }))
      .filter((p) => p.user_id),
  );

  /* ---- listings ---- */
  const listingDocs = await collection(db, 'listings');
  await upsert(
    'listings',
    listingDocs
      .map((l) => ({
        id: uuidv5(`listing:${l.id}`),
        seller_id: resolve(l.seller?.id),
        title: str(l.title) || '',
        description: str(l.description),
        price: num(l.price) ?? 0,
        category: str(l.category) || 'parts',
        condition: str(l.condition),
        location: str(l.location),
        status: str(l.status) || 'active',
        created_at: ts(l.createdAt) || ts(l.serverCreatedAt) || new Date().toISOString(),
        metadata: { mediaUrl: str(l.mediaUrl), corridor: str(l.corridor), firebaseId: l.id },
      }))
      .filter((l) => l.seller_id && l.title),
  );

  /* ---- summary ---- */
  console.log('\nplanned writes:');
  for (const [table, n] of Object.entries(stats).sort()) console.log(`  ${table.padEnd(24)} ${n}`);
  console.log(
    APPLY
      ? '\ndone. Counters are trigger-maintained, so node counts may differ from Firebase.'
      : '\ndry run complete — re-run with --apply to write.',
  );
  console.log('note: Firebase passwords are not importable; users must reset or use Google sign-in.');
}

main().catch((err) => {
  console.error(`\nbackfill failed: ${err.message}`);
  process.exit(1);
});
