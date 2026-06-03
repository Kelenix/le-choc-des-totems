"use client";

import { useEffect, useState } from "react";
import { useUserStore } from "@/store/userStore";
import { getLocalUser } from "@/lib/auth";
import { LoginModal } from "@/components/auth/LoginModal";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, isAuthenticated, loginRequested, cancelLogin } = useUserStore();
  const [ready, setReady] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  // Initial load from localStorage
  useEffect(() => {
    const user = getLocalUser();
    if (user) {
      setUser(user.id, user.pseudo);
    } else {
      setShowLogin(true);
    }
    setReady(true);
  }, [setUser]);

  // React to vote-triggered login requests
  useEffect(() => {
    if (loginRequested && !isAuthenticated) {
      setShowLogin(true);
    }
  }, [loginRequested, isAuthenticated]);

  if (!ready) {
    return (
      <div className="min-h-screen bg-[#070B14] flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-[#FBBF24] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      {showLogin && !isAuthenticated && (
        <LoginModal onSuccess={() => { setShowLogin(false); cancelLogin(); }} />
      )}
      {children}
    </>
  );
}
