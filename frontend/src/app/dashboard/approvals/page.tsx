"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ShieldCheck, CheckCircle, XCircle, RefreshCw, Clock, AlertTriangle, ArrowRight } from "lucide-react";
import { useSocket } from "@/hooks/useSocket";
import { useRouter } from "next/navigation";
import { Loader } from "@/components/ui/Loader";
import { api } from "../../../lib/api";

export default function ApprovalsPage() {
  const [actions, setActions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const router = useRouter();

  const fetchApprovals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/pending-approvals");
      setActions(res.data.actions || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchApprovals();
  }, [fetchApprovals]);

  useSocket('approval:updated', fetchApprovals);

  const handleAction = async (id: string, decision: 'approve' | 'reject') => {
    try {
      await api.post(`/pending-approvals/${id}/${decision}`);
      setSuccessMsg(decision === 'approve' ? 'Approved! Check Campaigns for status update.' : 'Rejected.');
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchApprovals();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#f7f8f9] text-[#1a1510] font-sans selection:bg-brand-gold/30">
      <header className="h-16 border-b border-[#1a1510]/[0.07] bg-white flex items-center justify-between px-4 sm:px-8 shrink-0 z-50 relative">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#1a1510] text-brand-gold rounded-lg flex items-center justify-center shrink-0">
            <ShieldCheck size={17} />
          </div>
          <div>
            <h1 className="text-[13px] font-bold tracking-tight text-[#1a1510] uppercase">Approvals</h1>
            <p className="text-[11px] font-medium text-[#1a1510]/40 truncate">Pending actions requiring your review</p>
          </div>
        </div>
        <button onClick={fetchApprovals} className="w-9 h-9 flex items-center justify-center bg-white border border-[#1a1510]/[0.07] rounded-lg hover:bg-[#f7f8f9] transition-colors">
          <RefreshCw size={15} className="text-[#1a1510]/50" />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto scrollbar-hide pb-32">
        <div className="max-w-4xl mx-auto p-4 sm:p-8 space-y-6">
          {successMsg && (
            <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-3">
              <span className="text-[13px] font-medium text-emerald-700">{successMsg}</span>
              <button onClick={() => router.push('/dashboard/campaigns')} className="flex items-center gap-1.5 text-[12px] font-semibold text-emerald-700 hover:underline">
                Go to Campaigns <ArrowRight size={14} />
              </button>
            </div>
          )}
          <div className="flex items-center gap-2 px-1">
            <Clock size={14} className="text-amber-500" />
            <span className="text-[12px] font-semibold text-[#1a1510]/50">{actions.filter(a => a.status === 'pending').length} pending</span>
          </div>

          <div className="bg-white rounded-2xl border border-[#1a1510]/[0.07] overflow-hidden">
            {loading ? (
              <div className="p-12 flex flex-col items-center justify-center gap-4">
                <Loader size={36} />
                <p className="text-[13px] text-[#1a1510]/40">Loading approvals…</p>
              </div>
            ) : actions.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-16 px-6">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4">
                  <CheckCircle size={24} className="text-emerald-500" />
                </div>
                <p className="text-[15px] font-semibold text-[#1a1510]">All clear</p>
                <p className="text-[13px] text-[#1a1510]/40 mt-1.5">No pending approvals right now.</p>
              </div>
            ) : (
              <div className="divide-y divide-[#1a1510]/[0.06]">
                {actions.map((a) => (
                  <div key={a.id} className="p-5 sm:p-6 hover:bg-[#fafafa] transition-colors">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          a.status === 'pending' ? 'bg-amber-50 text-amber-500' :
                          a.status === 'approved' ? 'bg-emerald-50 text-emerald-500' :
                          'bg-red-50 text-red-500'
                        }`}>
                          {a.status === 'approved' ? <CheckCircle size={18} /> :
                           a.status === 'rejected' ? <XCircle size={18} /> :
                           <AlertTriangle size={18} />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2.5">
                            <h4 className="text-[14px] font-semibold text-[#1a1510] capitalize">{a.action_type?.replace(/_/g, ' ')}</h4>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md capitalize ${
                              a.status === 'approved' ? 'bg-emerald-50 text-emerald-600' :
                              a.status === 'rejected' ? 'bg-red-50 text-red-600' :
                              'bg-amber-50 text-amber-600'
                            }`}>{a.status}</span>
                          </div>
                          {a.description && <p className="text-[13px] text-[#1a1510]/50 mt-1">{a.description}</p>}
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-[11px] text-[#1a1510]/40">
                            {a.client_name && <span>Client: {a.client_name}</span>}
                            {a.created_at && <span>{new Date(a.created_at).toLocaleString()}</span>}
                          </div>
                        </div>
                      </div>
                      {a.status === 'pending' && (
                        <div className="flex items-center gap-2 shrink-0">
                          <button onClick={() => handleAction(a.id, 'approve')} className="h-9 px-4 rounded-lg bg-emerald-50 text-emerald-700 text-[11px] font-semibold hover:bg-emerald-100 transition-colors flex items-center gap-1.5">
                            <CheckCircle size={13} /> Approve
                          </button>
                          <button onClick={() => handleAction(a.id, 'reject')} className="h-9 px-4 rounded-lg bg-red-50 text-red-600 text-[11px] font-semibold hover:bg-red-100 transition-colors flex items-center gap-1.5">
                            <XCircle size={13} /> Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
