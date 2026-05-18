"use client";

import { Workflows } from "../../../components/dashboard/Workflows/Workflows";
import { useRouter } from "next/navigation";

export default function WorkflowsPage() {
  const router = useRouter();

  return (
    <Workflows onBackToDashboard={() => router.push("/dashboard")} />
  );
}
