"use client";

import { ApprovalDashboard } from "../../../components/approvals/ApprovalDashboard";

export default function ApprovalsPage() {
  return (
    <div className="flex-1 flex flex-col h-full bg-[#f7f8f9] overflow-y-auto p-8 animate-fade-in">
      <ApprovalDashboard />
    </div>
  );
}
