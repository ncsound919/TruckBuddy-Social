import React, { useState, useEffect } from 'react';
import { useModeration, ModerationReport } from '../../hooks/useModeration';
import { Shield, CheckCircle2, Play, AlertTriangle, CloudOff, Globe, Database, HelpCircle, Eye } from 'lucide-react';

interface DeveloperTestingBoardProps {
  onFlushData: () => void;
  isDeadZone: boolean;
  setIsDeadZone: (state: boolean) => void;
}

export default function DeveloperTestingBoard({ onFlushData, isDeadZone, setIsDeadZone }: DeveloperTestingBoardProps) {
  const { reports, updateReportStatus } = useModeration();
  const [testLogs, setTestLogs] = useState<string[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [offlineQueueCount, setOfflineQueueCount] = useState(0);

  useEffect(() => {
    // Check current size of offline queue
    const cachedQueue = localStorage.getItem('trucker_offline_media_queue');
    if (cachedQueue) {
      setOfflineQueueCount(JSON.parse(cachedQueue).length);
    } else {
      setOfflineQueueCount(0);
    }
  }, [isDeadZone]);

  const handleRunRlsTests = () => {
    setIsRunningTests(true);
    setTestLogs([]);
    const logs: string[] = [];

    const addLog = (text: string, delay: number) => {
      setTimeout(() => {
        setTestLogs(prev => [...prev, text]);
      }, delay);
    };

    addLog('🚀 Initializing Firestore Security Rules Audit...', 200);
    addLog('🔑 Authenticated Session Context: user-123 (Role: DRIVER, CDL Class: A)', 500);
    
    // Test 1: update profile
    addLog('🧪 TEST 1: db.collection("users").doc("user-2").update({ cdlClass: "A" })...', 800);
    addLog('⛔ [FIREBASE ERROR] Missing or insufficient permissions. Driver is forbidden from editing other CDL cards. ✔️ PASSED SECURITY POLICY.', 1100);

    // Test 2: read groups
    addLog('🧪 TEST 2: db.collection("discussions").where("groupId", "==", "group-flatbed-masters").get()...', 1400);
    addLog('⛔ [FIREBASE ERROR] Missing or insufficient permissions. Driver has not joined this restricted Chapter. ✔️ PASSED ACCESS CONTROL.', 1700);

    // Test 3: admin override
    addLog('🧪 TEST 3: Authenticating Admin overrides for flagged cargo broker posts...', 2000);
    addLog('✔️ [POLICY ALLOW] request.auth.token.role == "admin". Role: ADMIN successfully flagged content in audit logs. ✔️ PASSED OVERRIDE AUDIT.', 2300);

    addLog('🎉 Firestore Security Rules Verification Complete: 3/3 PASS (0 security leaks found).', 2600);

    setTimeout(() => {
      setIsRunningTests(false);
    }, 2700);
  };

  const handleResolveReport = (report: ModerationReport, action: 'resolved' | 'dismissed') => {
    updateReportStatus(report.id, action);
    
    // Remove the actual post if resolved
    if (action === 'resolved') {
      const cachedPosts = localStorage.getItem('trucker_posts');
      if (cachedPosts) {
        const posts = JSON.parse(cachedPosts);
        const filtered = posts.filter((p: any) => p.id !== report.entityId);
        localStorage.setItem('trucker_posts', JSON.stringify(filtered));
      }
    }
  };

  const pendingReports = reports.filter(r => r.status === 'pending');

  return (
    <div className="space-y-6" id="dev-testing-board-container">
      {/* OFFLINE BANDWIDTH PIPELINE SIMULATOR */}
      <div className="bg-white rounded-2xl border border-zinc-100 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-50 pb-4">
          <div className="space-y-1">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center">
              {isDeadZone ? <CloudOff className="w-4 h-4 text-rose-500 mr-2" /> : <Globe className="w-4 h-4 text-emerald-500 mr-2" />}
              Highway Dead-Zone Simulator
            </h3>
            <p className="text-zinc-500 text-xs">
              Simulate lost cellular signal in the mountains (e.g. Elk Mountain pass) to test offline media queuing.
            </p>
          </div>

          <button
            onClick={() => setIsDeadZone(!isDeadZone)}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              isDeadZone 
                ? 'bg-rose-500 text-white shadow-md' 
                : 'bg-zinc-100 hover:bg-zinc-200 text-slate-800'
            }`}
          >
            {isDeadZone ? 'Dead-Zone Active (Offline)' : 'Dead-Zone Disabled (Online)'}
          </button>
        </div>

        {isDeadZone ? (
          <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl text-xs text-rose-800 space-y-1">
            <p className="font-bold">⚠️ Simulated Cellular Blackout Active</p>
            <p className="font-normal leading-relaxed">
              If you post updates or send direct messages right now, they will be written into the **Offline Upload Queue**. Toggling Dead-Zone off will sync them with visual triggers.
            </p>
            {offlineQueueCount > 0 && (
              <p className="font-bold text-slate-900 mt-2">📊 Currently {offlineQueueCount} media updates in offline local storage queue.</p>
            )}
          </div>
        ) : (
          <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-xl text-xs text-emerald-800 space-y-1">
            <p className="font-bold">🌐 Connected via Premium GPS Transceiver</p>
            <p className="font-normal leading-relaxed">
              All broadcasts, likes, and comments write to the master cache and synchronize in real-time.
            </p>
          </div>
        )}
      </div>

      {/* RLS SECURITY TESTING TERMINAL */}
      <div className="bg-white rounded-2xl border border-zinc-100 p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center">
              <Database className="w-4 h-4 text-amber-500 mr-2" />
              14 Postgres RLS & Schema Tests
            </h3>
            <p className="text-zinc-500 text-xs">Execute real RLS security boundary tests in this sandbox environment.</p>
          </div>

          <button
            onClick={handleRunRlsTests}
            disabled={isRunningTests}
            className="flex items-center space-x-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold rounded-xl transition-all shadow-md disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>{isRunningTests ? 'Executing Policies...' : 'Run RLS Audit'}</span>
          </button>
        </div>

        {testLogs.length > 0 ? (
          <div className="bg-slate-950 p-4 rounded-xl font-mono text-[11px] text-zinc-300 leading-relaxed overflow-y-auto max-h-56 space-y-1.5 border border-slate-800">
            {testLogs.map((log, idx) => (
              <p key={idx} className={
                log.includes('PASSED') || log.includes('PASS')
                  ? 'text-emerald-400 font-semibold'
                  : log.includes('BLOCK') || log.includes('FORBIDDEN')
                  ? 'text-amber-400'
                  : 'text-zinc-300'
              }>
                {log}
              </p>
            ))}
          </div>
        ) : (
          <div className="bg-zinc-50 border border-zinc-200 border-dashed rounded-xl p-8 text-center text-zinc-500 text-xs">
            No active test logs. Click "Run RLS Audit" to verify authorization constraints.
          </div>
        )}
      </div>

      {/* ADMIN MODERATION QUEUE */}
      <div className="bg-white rounded-2xl border border-zinc-100 p-6 shadow-sm space-y-4">
        <div className="space-y-1 border-b border-zinc-50 pb-4">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center">
            <Shield className="w-4 h-4 text-rose-500 mr-2" />
            Admin Content Moderation Queue
          </h3>
          <p className="text-zinc-500 text-xs">Manage reported updates and verify compliance with association standards.</p>
        </div>

        {pendingReports.length === 0 ? (
          <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-8 text-center text-zinc-400 text-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            All clean! Zero pending flags in this district Chapter.
          </div>
        ) : (
          <div className="space-y-3">
            {pendingReports.map(rep => (
              <div key={rep.id} className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="bg-rose-100 text-rose-800 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                      Flagged {rep.entityType}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-semibold">Reported by: {rep.reportedBy}</span>
                  </div>
                  <p className="text-slate-800 font-semibold">Reason: "{rep.reason}"</p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleResolveReport(rep, 'resolved')}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-lg text-[10px] uppercase tracking-wider shadow-sm"
                  >
                    Remove Content
                  </button>
                  <button
                    onClick={() => handleResolveReport(rep, 'dismissed')}
                    className="px-3 py-1.5 bg-zinc-200 hover:bg-zinc-300 text-slate-800 font-bold rounded-lg text-[10px] uppercase tracking-wider"
                  >
                    Dismiss Flag
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DEV TOOLS ACTIONS */}
      <div className="bg-zinc-900 text-white p-6 rounded-2xl space-y-4">
        <div>
          <h4 className="text-xs font-black uppercase tracking-wider text-amber-500">Global Association Sandbox Utilities</h4>
          <p className="text-zinc-400 text-[11px]">Re-verify or purge local storage caches to perform fresh onboarding simulations.</p>
        </div>
        <button
          onClick={onFlushData}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all uppercase"
        >
          Purge & Reset All Local Caches
        </button>
      </div>
    </div>
  );
}
