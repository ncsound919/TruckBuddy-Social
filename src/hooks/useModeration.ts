import { useState, useEffect } from 'react';

export interface ModerationReport {
  id: string;
  entityId: string;
  entityType: 'post' | 'listing' | 'road_report';
  reason: string;
  reportedBy: string;
  reportedAt: string;
  status: 'pending' | 'resolved' | 'dismissed';
}

export function useModeration() {
  const [reports, setReports] = useState<ModerationReport[]>([]);

  useEffect(() => {
    const cached = localStorage.getItem('trucker_moderation_reports');
    if (cached) {
      setReports(JSON.parse(cached));
    } else {
      const initial: ModerationReport[] = [
        {
          id: 'rep-1',
          entityId: 'post-2',
          entityType: 'post',
          reason: 'Spam advertising cargo brokers without commercial broker licenses.',
          reportedBy: 'DieselDuchess',
          reportedAt: new Date(Date.now() - 3600000).toISOString(),
          status: 'pending'
        }
      ];
      setReports(initial);
      localStorage.setItem('trucker_moderation_reports', JSON.stringify(initial));
    }
  }, []);

  const saveReports = (updated: ModerationReport[]) => {
    setReports(updated);
    localStorage.setItem('trucker_moderation_reports', JSON.stringify(updated));
  };

  const fileReport = (entityId: string, entityType: 'post' | 'listing' | 'road_report', reason: string) => {
    const newReport: ModerationReport = {
      id: `rep-${Date.now()}`,
      entityId,
      entityType,
      reason,
      reportedBy: 'OverdriveWill',
      reportedAt: new Date().toISOString(),
      status: 'pending'
    };

    const updated = [newReport, ...reports];
    saveReports(updated);
  };

  const updateReportStatus = (id: string, newStatus: 'resolved' | 'dismissed') => {
    const updated = reports.map(r => r.id === id ? { ...r, status: newStatus } : r);
    saveReports(updated);
  };

  return {
    reports,
    fileReport,
    updateReportStatus
  };
}
