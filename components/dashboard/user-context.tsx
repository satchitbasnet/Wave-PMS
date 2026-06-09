"use client";

import { createContext, useContext } from "react";

export interface DashboardUser {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  role: string | null;
  orgId: string | null;
}

const UserContext = createContext<DashboardUser | null>(null);

export function UserProvider({
  user,
  children,
}: {
  user: DashboardUser;
  children: React.ReactNode;
}) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export function useDashboardUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useDashboardUser must be used within UserProvider");
  }
  return context;
}
