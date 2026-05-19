"use client";

import { Analytics } from "../../../components/dashboard/Analytics/Analytics";
import { useRouter } from "next/navigation";

export default function AnalyticsPage() {
  const router = useRouter();

  return (
    <Analytics onBackToDashboard={() => router.push("/dashboard")} />
  );
}
