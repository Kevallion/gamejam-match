"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GoogleIcon } from "@/components/brand-icons"
import { LoaderCircle, LogIn } from "lucide-react"
import { AppIcon } from "@/components/ui/app-icon"
import { signInWithDiscord, signInWithGoogle } from "@/lib/auth-utils"
import {
  requestSignInMagicLink,
  requestSignUpMagicLink,
} from "@/app/actions/auth-otp-actions"
import {
  SIGN_IN_OTP_SUCCESS_MESSAGE,
  SIGN_UP_OTP_SUCCESS_MESSAGE,
  type AuthOtpPurpose,
} from "@/lib/auth-otp"
import { toast } from "sonner"

export type AuthFormProps = {
  initialMode?: AuthOtpPurpose
  next?: string
  /** When set, tab changes stay in this component (modal). Otherwise Sign up can go to /signup. */
  mode?: AuthOtpPurpose
  onModeChange?: (mode: AuthOtpPurpose) => void
}

export function AuthForm({
  initialMode = "signin",
  next,
  mode: controlledMode,
  onModeChange,
}: AuthFormProps) {
  const returnTo = next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard"
  const [uncontrolledMode, setUncontrolledMode] = useState<AuthOtpPurpose>(initialMode)
  const mode = controlledMode ?? uncontrolledMode
  const setMode = (nextMode: AuthOtpPurpose) => {
    onModeChange?.(nextMode)
    if (controlledMode === undefined) setUncontrolledMode(nextMode)
    setMagicSent(false)
  }

  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [isMagicLoading, setIsMagicLoading] = useState(false)
  const [magicSent, setMagicSent] = useState(false)

  const isSignUp = mode === "signup"
  const successMessage = isSignUp ? SIGN_UP_OTP_SUCCESS_MESSAGE : SIGN_IN_OTP_SUCCESS_MESSAGE

  const handleSignInDiscord = async () => {
    if (isLoading) return
    setIsLoading(true)
    try {
      await signInWithDiscord({ next: returnTo })
    } catch (error) {
      toast.error("Sign-in error", {
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
      })
      setIsLoading(false)
    }
  }

  const handleSignInGoogle = async () => {
    if (isLoading) return
    setIsLoading(true)
    try {
      await signInWithGoogle({ next: returnTo })
    } catch (error) {
      toast.error("Sign-in error", {
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
      })
      setIsLoading(false)
    }
  }

  const handleMagicLink = async (event?: FormEvent) => {
    event?.preventDefault()
    if (isMagicLoading || !email.trim()) return
    setIsMagicLoading(true)
    setMagicSent(false)
    try {
      const result = isSignUp
        ? await requestSignUpMagicLink(email, returnTo)
        : await requestSignInMagicLink(email, returnTo)
      if (!result.success) {
        toast.error(isSignUp ? "Unable to send sign-up link" : "Unable to send sign-in link", {
          description: result.error,
        })
        setIsMagicLoading(false)
        return
      }
      setMagicSent(true)
      setIsMagicLoading(false)
      toast.success(isSignUp ? "Check your email" : "Check your email", {
        description: successMessage,
      })
    } catch {
      toast.error("Something went wrong", {
        description: "Please try again.",
      })
      setIsMagicLoading(false)
    }
  }

  return (
    <div className="flex flex-col">
      <div className="space-y-2 px-6 pt-6 pb-4 text-center">
        <h2 className="font-display text-xl font-extrabold tracking-tight text-foreground">
          {isSignUp ? "Create your GameJamCrew account" : "Welcome to GameJamCrew"}
        </h2>
        <p className="text-base text-muted-foreground">
          {isSignUp
            ? "Choose how you want to sign up."
            : "Choose how you want to sign in."}
        </p>
      </div>

      <div className="flex flex-col gap-4 px-6 pb-6">
        <Tabs
          value={mode}
          onValueChange={(value) => {
            if (value === "signin" || value === "signup") setMode(value)
          }}
        >
          <TabsList
            aria-label="Sign in or sign up"
            className="h-12 w-full rounded-xl border border-border bg-muted p-1 shadow-[3px_3px_0_0_var(--neo-shadow)] md:w-full"
          >
            <TabsTrigger
              value="signin"
              className="h-10 flex-1 rounded-lg text-base font-bold hover:bg-card/70 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-muted data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-none"
            >
              Sign in
            </TabsTrigger>
            <TabsTrigger
              value="signup"
              className="h-10 flex-1 rounded-lg text-base font-bold hover:bg-card/70 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-muted data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-none"
            >
              Sign up
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Button
          onClick={handleSignInDiscord}
          disabled={isLoading}
          className="min-h-12 w-full gap-2 rounded-xl bg-[#5865F2] text-base font-bold text-white shadow-[3px_3px_0_0_var(--neo-shadow)] hover:bg-[#4752C4] focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
        >
          {isLoading ? (
            <AppIcon icon={LoaderCircle} size="md" className="animate-spin" />
          ) : (
            <AppIcon icon={LogIn} size="md" />
          )}
          Continue with Discord
        </Button>

        <div className="relative my-1">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-base uppercase">
            <span className="bg-card px-2 text-muted-foreground">OR</span>
          </div>
        </div>

        <Button
          onClick={handleSignInGoogle}
          disabled={isLoading}
          variant="outline"
          className="min-h-12 w-full gap-2 rounded-xl border-border bg-card text-base font-bold shadow-[3px_3px_0_0_var(--neo-shadow)] focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
        >
          {isLoading ? (
            <AppIcon icon={LoaderCircle} size="md" className="animate-spin" />
          ) : (
            <GoogleIcon className="size-4" />
          )}
          Continue with Google
        </Button>

        <div className="relative my-3">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-base">
            <span className="bg-card px-2 text-muted-foreground">Or use your email</span>
          </div>
        </div>

        <form onSubmit={handleMagicLink} className="flex flex-col gap-2">
            <label htmlFor="auth-magic-email" className="sr-only">
              Email
            </label>
            <Input
              id="auth-magic-email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              spellCheck={false}
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl border-border bg-background text-foreground"
            />
          <Button
            type="submit"
            disabled={isMagicLoading || magicSent}
            className="min-h-12 w-full gap-2 rounded-xl text-base font-bold shadow-[3px_3px_0_0_var(--neo-shadow)] focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
            variant="secondary"
          >
            {isMagicLoading ? <AppIcon icon={LoaderCircle} size="md" className="animate-spin" /> : null}
            {magicSent
              ? "Link sent — check your email"
              : isSignUp
                ? "Create an account with a magic link"
                : "Sign in with a magic link"}
          </Button>
        </form>

        {magicSent && (
          <p className="mt-1 text-center text-base text-emerald-500">
            {isSignUp ? (
              SIGN_UP_OTP_SUCCESS_MESSAGE
            ) : (
              <>
                If an account exists for this email, we&apos;ve sent you a sign-in link. New here?{" "}
                <button
                  type="button"
                  className="font-medium text-foreground underline underline-offset-2 hover:text-primary focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={() => setMode("signup")}
                >
                  Create an account
                </button>
              </>
            )}
          </p>
        )}

        <p className="mt-1 text-center text-base text-muted-foreground">
          {isSignUp ? (
            <>
              Already have an account?{" "}
              <button
                type="button"
                className="font-medium text-foreground underline underline-offset-2 hover:text-primary focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => setMode("signin")}
              >
                Sign in
              </button>
            </>
          ) : (
            <>
              New here?{" "}
              <Link
                href="/signup"
                className="font-medium text-foreground underline underline-offset-2 hover:text-primary focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Create an account
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  )
}