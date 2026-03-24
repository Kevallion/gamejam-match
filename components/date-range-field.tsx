"use client"

import type { ReactNode } from "react"
import { format } from "date-fns"
import type { DateRange, Matcher } from "react-day-picker"
import { CalendarDays } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { cn } from "@/lib/utils"

/** Shared chrome for all range date pickers (create team, availability, manage). */
export const DATE_RANGE_POPOVER_CONTENT_CLASS =
  "w-auto rounded-2xl border-border/60 p-0 shadow-xl shadow-primary/10"

const TRIGGER_CLASS =
  "h-12 w-full justify-start gap-3 rounded-xl border-border/60 bg-secondary/50"

const DRAWER_CONTENT_CLASS = "rounded-t-3xl border-border/60 bg-card"

export type DateRangeFieldProps = {
  label: string
  value: DateRange | undefined
  onChange: (next: DateRange | undefined) => void
  placeholder: string
  drawerTitle: string
  /** `short`: "MMM d" (availability); `long`: "MMM d, yyyy" (jam listings). */
  dateFormat?: "short" | "long"
  /** Separator between start and end in the trigger label. */
  rangeSeparator?: string
  disabled?: Matcher
  /** Desktop only; mobile always uses 1 month. */
  numberOfMonthsDesktop?: 1 | 2
  helperText?: ReactNode
  /** Optional id for the visible label */
  labelId?: string
}

function formatRangeLabel(
  range: DateRange | undefined,
  dateFormat: "short" | "long",
  separator: string,
  placeholder: string,
): string {
  if (!range?.from) return placeholder
  const fmt =
    dateFormat === "short"
      ? (d: Date) => format(d, "MMM d")
      : (d: Date) => format(d, "MMM d, yyyy")
  if (range.to) return `${fmt(range.from)}${separator}${fmt(range.to)}`
  return fmt(range.from)
}

/**
 * Calendrier plage unique pour toute l’app : mêmes classes trigger, popover, drawer et Calendar.
 */
export function DateRangeField({
  label,
  value,
  onChange,
  placeholder,
  drawerTitle,
  dateFormat = "long",
  rangeSeparator,
  disabled,
  numberOfMonthsDesktop = 2,
  helperText,
  labelId,
}: DateRangeFieldProps) {
  const isMobile = useIsMobile()
  const sep =
    rangeSeparator ?? (dateFormat === "short" ? " - " : " → ")
  const display = formatRangeLabel(value, dateFormat, sep, placeholder)

  const calendar = (
    <Calendar
      mode="range"
      selected={value}
      onSelect={onChange}
      disabled={disabled}
      numberOfMonths={isMobile ? 1 : numberOfMonthsDesktop}
    />
  )

  return (
    <div className="flex flex-col gap-2.5">
      <Label
        id={labelId}
        className="text-sm font-bold text-foreground"
      >
        {label}
      </Label>
      {isMobile ? (
        <Drawer>
          <DrawerTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className={cn(
                TRIGGER_CLASS,
                !value?.from && "text-muted-foreground",
              )}
            >
              <CalendarDays className="size-4 shrink-0 text-primary" />
              {display}
            </Button>
          </DrawerTrigger>
          <DrawerContent className={DRAWER_CONTENT_CLASS}>
            <DrawerHeader className="text-left">
              <DrawerTitle className="text-base font-semibold text-foreground">
                {drawerTitle}
              </DrawerTitle>
            </DrawerHeader>
            <div className="px-4 pb-4">{calendar}</div>
            <DrawerFooter className="flex flex-row gap-3 px-4 pb-6 pt-0">
              <DrawerClose asChild>
                <Button type="button" className="flex-1 rounded-xl">
                  Done
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ) : (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className={cn(
                TRIGGER_CLASS,
                !value?.from && "text-muted-foreground",
              )}
            >
              <CalendarDays className="size-4 shrink-0 text-primary" />
              {display}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className={DATE_RANGE_POPOVER_CONTENT_CLASS}
            align="start"
          >
            {calendar}
          </PopoverContent>
        </Popover>
      )}
      {helperText ? (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      ) : null}
    </div>
  )
}
