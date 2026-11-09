"use client"

import { useCallback, type ReactNode } from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { Coffee, Heart } from "lucide-react"
import Link from "next/link"
import { FacebookIcon, LinkedInIcon, RedditIcon, XIcon } from "@/components/brand-icons"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { TooltipContent } from "@/components/ui/tooltip"
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
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger asChild>
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
      </TooltipPrimitive.Trigger>
      <TooltipContent side="bottom" sideOffset={4} className="z-[110] max-w-[14rem] text-xs">
        {tooltip}
      </TooltipContent>
    </TooltipPrimitive.Root>
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
        onOpenAutoFocus={(e) => e.preventDefault()}
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
              <Coffee className="size-4" aria-hidden />
              Buy me a coffee
            </Link>
          </Button>

          <div className="space-y-2 border-t border-border/40 pt-3">
            <p className="text-xs font-semibold tracking-tight text-muted-foreground">Spread the word</p>
            <TooltipPrimitive.Provider delayDuration={350} skipDelayDuration={200}>
              <div className="flex flex-row flex-wrap items-center justify-center gap-2">
              <SocialShareButton
                tooltip="Share on X (Twitter) with a pre-filled post about JamSquad"
                onClick={shareOnX}
                className="hover:bg-neutral-950/10 hover:text-neutral-950 dark:hover:bg-white/10 dark:hover:text-white"
              >
                <XIcon className="size-5" aria-hidden />
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
                <FacebookIcon className="size-5" aria-hidden />
              </SocialShareButton>
              <SocialShareButton
                tooltip="Share on LinkedIn (opens LinkedIn share dialog)"
                onClick={shareOnLinkedIn}
                className="hover:bg-[#0A66C2]/15 hover:text-[#0A66C2]"
              >
                <LinkedInIcon className="size-5" aria-hidden />
              </SocialShareButton>
              </div>
            </TooltipPrimitive.Provider>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
