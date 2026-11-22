"use client"

import { createContext, useContext, type ReactNode } from "react"

type AppShellContextValue = {
  active: true
}

const AppShellContext = createContext<AppShellContextValue | null>(null)

export function AppShellProvider({ children }: { children: ReactNode }) {
  return <AppShellContext.Provider value={{ active: true }}>{children}</AppShellContext.Provider>
}

/** True when the signed-in web-app chrome (hotbar / Me) is wrapping the page. */
export function useIsInAppShell(): boolean {
  return useContext(AppShellContext)?.active === true
}
