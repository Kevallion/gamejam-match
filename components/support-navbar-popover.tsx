"use client"

import { useCallback, type ReactNode } from "react"
import { Coffee, Facebook, Heart, Linkedin, X } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  BUY_ME_A_COFFEE_URL,
  SUPPORT_POPOVER_BODY,
  SUPPORT_POPOVER_HEADING,
  SUPPORT_POPOVER_TITLE,
  buildFacebookShareUrl,
  buildJamSquadTwitterIntentUrl,
  buildLinkedInShareUrl,
  buildRedditSubmitUrl,
  getShareableSiteUrl,
} from "@/lib/support-project"
import { cn } from "@/lib/utils"

/** Reddit mark — not provided by lucide-react; SVG uses currentColor for hover theming. */
function RedditIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.758a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.562-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.688-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
    </svg>
  )
}

function openShareUrl(url: string) {
  window.open(url, "_blank", "noopener,noreferrer")
}

function SocialShareButton({
  tooltip,
  onClick,
  className,
  children,
}: {
  tooltip: string
  onClick: () => void
  className?: string
  children: ReactNode
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(
            "size-9 shrink-0 rounded-xl text-muted-foreground transition-colors",
            className,
          )}
          onClick={onClick}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={4} className="max-w-[14rem] text-xs">
        {tooltip}
      </TooltipContent>
    </Tooltip>
  )
}

export function SupportNavbarPopover({ className }: { className?: string }) {
  const shareOnX = useCallback(() => {
    openShareUrl(buildJamSquadTwitterIntentUrl(getShareableSiteUrl()))
  }, [])

  const shareOnReddit = useCallback(() => {
    openShareUrl(buildRedditSubmitUrl(getShareableSiteUrl()))
  }, [])

  const shareOnFacebook = useCallback(() => {
    openShareUrl(buildFacebookShareUrl(getShareableSiteUrl()))
  }, [])

  const shareOnLinkedIn = useCallback(() => {
    openShareUrl(buildLinkedInShareUrl(getShareableSiteUrl()))
  }, [])

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "rounded-xl text-rose-500 hover:bg-rose-500/10 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300",
            className,
          )}
          aria-label="Support GameJamCrew"
        >
          <Heart className="size-4 fill-current opacity-90" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className={cn(
          "glass-card w-[min(100vw-2rem,22rem)] max-w-[22rem] rounded-2xl border border-white/20 p-4 shadow-xl shadow-black/15",
          "dark:border-white/10 dark:shadow-black/40",
        )}
      >
        <div className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-rose-500/15 blur-2xl" aria-hidden />
        <div className="relative space-y-3">
          <div className="space-y-2">
            <h2 className="text-base font-bold tracking-tight text-foreground">{SUPPORT_POPOVER_TITLE}</h2>
            <p className="text-sm font-semibold leading-snug text-foreground">{SUPPORT_POPOVER_HEADING}</p>
            <p className="text-sm leading-relaxed text-muted-foreground">{SUPPORT_POPOVER_BODY}</p>
          </div>
          <Button
            asChild
            className="h-10 w-full rounded-xl bg-[#FFDD00] font-semibold text-[#0d0d0d] shadow-sm hover:bg-[#ffea4d]"
          >
            <Link href={BUY_ME_A_COFFEE_URL} target="_blank" rel="noopener noreferrer">
              <Coffee className="mr-2 size-4" aria-hidden />
              Buy me a coffee
            </Link>
          </Button>

          <div className="space-y-2 border-t border-border/40 pt-3">
            <p className="text-xs font-semibold tracking-tight text-muted-foreground">Spread the word</p>
            <div className="flex flex-row flex-wrap items-center justify-center gap-2">
              <SocialShareButton
                tooltip="Share on X (Twitter) with a pre-filled post about JamSquad"
                onClick={shareOnX}
                className="hover:bg-neutral-950/10 hover:text-neutral-950 dark:hover:bg-white/10 dark:hover:text-white"
              >
                <X className="size-5" strokeWidth={2.25} aria-hidden />
              </SocialShareButton>
              <SocialShareButton
                tooltip="Submit to Reddit with title and link to this site"
                onClick={shareOnReddit}
                className="hover:bg-orange-500/15 hover:text-orange-600 dark:hover:text-orange-400"
              >
                <RedditIcon className="size-5" />
              </SocialShareButton>
              <SocialShareButton
                tooltip="Share this page on Facebook"
                onClick={shareOnFacebook}
                className="hover:bg-[#1877F2]/15 hover:text-[#1877F2]"
              >
                <Facebook className="size-5" aria-hidden />
              </SocialShareButton>
              <SocialShareButton
                tooltip="Share on LinkedIn (opens LinkedIn share dialog)"
                onClick={shareOnLinkedIn}
                className="hover:bg-[#0A66C2]/15 hover:text-[#0A66C2]"
              >
                <Linkedin className="size-5" aria-hidden />
              </SocialShareButton>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
