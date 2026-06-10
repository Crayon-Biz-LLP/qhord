"use client";

import React, { Suspense } from "react";
import { AuthModal } from "@/components/login/AuthModal";
import { useRouter, useSearchParams } from "next/navigation";
import { PageLoader } from "@/components/ui/Loader";

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  React.useEffect(() => {
    if (token) {
      localStorage.setItem("auth_token", token);
      const expires = new Date(Date.now() + 7 * 864e5).toUTCString();
      document.cookie = `auth_token=${encodeURIComponent(token)}; expires=${expires}; path=/; SameSite=Lax`;
      router.replace("/dashboard");
    }
  }, [token, router]);

  const handleSuccess = () => {
    router.replace("/dashboard");
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
      initialState="signup"
      onSuccess={handleSuccess}
    />
  );
}

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-[#fdfbf7] flex items-center justify-center">
      <Suspense fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#fdfbf7]">
          <PageLoader label="Loading Registration" />
        </div>
      }>
        <SignupContent />
      </Suspense>
    </div>
  );
}
