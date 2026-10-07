import { useEffect, useState } from 'react';

import {
  createLiveReport,
  resolveLiveReport,
  subscribeLiveReports,
  type LiveModerationReport,
} from '../lib/social-api';

export interface ModerationReport {
  id: string;
  entityId: string;
  entityType: 'post' | 'listing' | 'road_report';
  reason: string;
  reportedBy: string;
  reportedAt: string;
  status: 'pending' | 'resolved' | 'dismissed';
}

function toUiReport(r: LiveModerationReport): ModerationReport {
  const entityType = (['post', 'listing', 'road_report'].includes(r.targetType)
    ? r.targetType
    : 'post') as ModerationReport['entityType'];
  const status: ModerationReport['status'] =
    r.status === 'open' ? 'pending' : r.status === 'actioned' ? 'resolved' : 'dismissed';
  return {
    id: r.id,
    entityId: r.targetRef,
    entityType,
    reason: r.details || r.reason,
    reportedBy: r.reporterId,
    reportedAt: r.createdAt,
    status,
  };
}

/**
 * Moderation queue backed by Supabase `reports` / `moderation_actions`.
 * RLS decides visibility (your own reports, or all for a moderator) and
 * write permission — there is no client-side queue.
 */
export function useModeration() {
  const [reports, setReports] = useState<ModerationReport[]>([]);

  useEffect(() => subscribeLiveReports((rows) => setReports(rows.map(toUiReport))), []);

  const fileReport = async (
    entityId: string,
    entityType: 'post' | 'listing' | 'road_report',
    reason: string,
  ) => {
    try {
      await createLiveReport({ targetType: entityType, targetId: entityId, reason });
    } catch (e) {
      console.warn('[moderation] failed to file report:', e);
    }
  };

  const updateReportStatus = async (id: string, next: 'resolved' | 'dismissed') => {
    try {
      await resolveLiveReport(id, next === 'dismissed' ? 'dismiss' : 'remove_content');
    } catch (e) {
      console.warn('[moderation] failed to resolve report:', e);
    }
  };

  return { reports, fileReport, updateReportStatus };
}
