"use server"

import { headers } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import {
  normalizeAuthEmail,
  resolveAuthOtpError,
  successfulAuthOtpResult,
  type AuthOtpPurpose,
  type AuthOtpResult,
} from "@/lib/auth-otp"

function safeNextPath(next: string | null | undefined): string {
  if (typeof next !== "string") return "/dashboard"
  const path = next.trim()
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) {
    return "/dashboard"
  }
  return path
}

function isSafeHost(host: string): boolean {
  return /^[a-z0-9.:-]+$/i.test(host) && !host.includes("..")
}

async function requestOrigin(): Promise<string | null> {
  const h = await headers()
  const host = (h.get("x-forwarded-host") ?? h.get("host") ?? "").split(",")[0]?.trim()
  if (!host || !isSafeHost(host)) return null
  const forwarded = (h.get("x-forwarded-proto") ?? "").split(",")[0]?.trim()
  const proto =
    forwarded === "http" || forwarded === "https"
      ? forwarded
      : host.startsWith("localhost") || host.startsWith("127.0.0.1")
        ? "http"
        : "https"
  return `${proto}://${host}`
}

async function requestMagicLink(
  emailInput: string,
  purpose: AuthOtpPurpose,
  next?: string,
): Promise<AuthOtpResult> {
  const email = normalizeAuthEmail(emailInput)
  if (!email) {
    return { success: false, error: "Please enter a valid email address.", kind: "invalid_email" }
  }

  const origin = await requestOrigin()
  if (!origin) {
    return { success: false, error: "Something went wrong. Please try again.", kind: "other" }
  }

  const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(safeNextPath(next))}`
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: purpose === "signup",
      emailRedirectTo: redirectTo,
    },
  })

  if (error) return resolveAuthOtpError(error, purpose)
  return successfulAuthOtpResult()
}

export async function requestSignInMagicLink(
  email: string,
  next?: string,
): Promise<AuthOtpResult> {
  return requestMagicLink(email, "signin", next)
}

export async function requestSignUpMagicLink(
  email: string,
  next?: string,
): Promise<AuthOtpResult> {
  return requestMagicLink(email, "signup", next)
}