"use client";

import { useEffect, type ReactNode } from "react";
import { checkSession, getMe } from "@/lib/api/clientApi";
import { useAuthStore } from "@/lib/store/authStore";

type AuthProviderProps = {
  children: ReactNode;
};

export default function AuthProvider({
  children,
}: AuthProviderProps) {
  const setUser = useAuthStore((state) => state.setUser);
  const clearIsAuthenticated = useAuthStore(
    (state) => state.clearIsAuthenticated
  );

  useEffect(() => {
    async function initializeAuth() {
      try {
        const session = await checkSession();

        if (session) {
          const user = await getMe();
          setUser(user);
        } else {
          clearIsAuthenticated();
        }
      } catch (error) {
        console.error("Authentication error:", error);
        clearIsAuthenticated();
      }
    }

    void initializeAuth();
  }, [setUser, clearIsAuthenticated]);

  return <>{children}</>;
}