"use client";

import React, { Suspense } from "react";
import { AuthModal } from "@/components/login/AuthModal";
import { useRouter, useSearchParams } from "next/navigation";
import { PageLoader } from "@/components/ui/Loader";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/dashboard";
  const token = searchParams.get("token");

  React.useEffect(() => {
    if (token) {
      if (window.opener && window.opener !== window) {
        // Running inside the Google OAuth popup — send token back to the parent tab and close
        window.opener.postMessage(
          { type: "GOOGLE_AUTH_SUCCESS", token },
          window.location.origin
        );
        window.close();
        return;
      }
      // Normal (non-popup) flow — store token and navigate
      localStorage.setItem("auth_token", token);
      const expires = new Date(Date.now() + 7 * 864e5).toUTCString();
      document.cookie = `auth_token=${encodeURIComponent(token)}; expires=${expires}; path=/; SameSite=Lax`;
      router.replace(from);
    }
  }, [token, from, router]);

  const handleSuccess = () => {
    router.replace(from);
  };

  const handleClose = () => {
    router.replace("/");
  };

  if (token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fdfbf7]">
        <PageLoader label="Establishing Session" />
      </div>
    );
  }

  return (
    <AuthModal
      isOpen={true}
      onClose={handleClose}
      initialState="signin"
      onSuccess={handleSuccess}
    />
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#fdfbf7] flex items-center justify-center">
      <Suspense fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#fdfbf7]">
          <PageLoader label="Loading Login Portal" />
        </div>
      }>
        <LoginContent />
      </Suspense>
    </div>
  );
}
