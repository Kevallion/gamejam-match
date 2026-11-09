import {
  Bell,
  BookOpen,
  Box,
  Bug,
  CalendarClock,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  CircleDashed,
  CircleX,
  Clock,
  CodeXml,
  Coffee,
  Cpu,
  Crown,
  Dices,
  Ellipsis,
  ExternalLink,
  Feather,
  Flame,
  Gamepad2,
  Globe,
  Hand,
  HandHeart,
  Heart,
  Inbox,
  Info,
  LayoutDashboard,
  LayoutTemplate,
  Link2,
  LoaderCircle,
  Lock,
  LogIn,
  LogOut,
  Mail,
  Medal,
  MessageCircle,
  MessageSquareText,
  Mic,
  Music,
  Palette,
  PenLine,
  Plus,
  RefreshCw,
  Rocket,
  RotateCcw,
  Search,
  Send,
  Settings,
  Share2,
  SlidersHorizontal,
  Smile,
  Sparkles,
  Star,
  Swords,
  Target,
  Trash2,
  TriangleAlert,
  Trophy,
  UserRound,
  UserRoundCheck,
  UserRoundMinus,
  UserRoundPlus,
  UserRoundSearch,
  UsersRound,
  X,
  type LucideIcon,
} from "lucide-react"

/**
 * Central icon map: one Lucide icon per product concept.
 * Always reach for `ICON.concept` instead of importing from lucide-react directly
 * so the same idea renders the same glyph everywhere (see scripts/check-icons.mjs).
 */
export const ICON = {
  // People & squads
  squad: UsersRound,
  jammer: UserRound,
  findJammers: UserRoundSearch,
  invite: UserRoundPlus,
  removeMember: UserRoundMinus,
  accepted: UserRoundCheck,

  // Jam & listing
  jam: Gamepad2,
  roleWanted: Target,
  publish: Rocket,
  dashboard: LayoutDashboard,

  // Communication
  notifications: Bell,
  applications: Inbox,
  invitations: Mail,
  send: Send,
  chat: MessageCircle,
  note: MessageSquareText,

  // Availability & time
  available: Hand,
  dates: CalendarDays,
  time: Clock,
  deadline: CalendarClock,

  // Attributes
  language: Globe,
  engine: Cpu,
  programmingLanguage: CodeXml,

  // Gamification
  xp: Star,
  achievement: Trophy,
  leaderboardFirst: Crown,
  leaderboardOther: Medal,
  kudos: HandHeart,
  recommended: Sparkles,
  support: Heart,
  coffee: Coffee,

  // Actions
  create: Plus,
  edit: PenLine,
  delete: Trash2,
  settings: Settings,
  filters: SlidersHorizontal,
  resetFilters: RotateCcw,
  refresh: RefreshCw,
  loading: LoaderCircle,
  search: Search,
  close: X,
  confirm: Check,

  // Status
  done: CircleCheck,
  declined: CircleX,
  formError: CircleAlert,
  danger: TriangleAlert,
  info: Info,

  // Links & sharing
  link: Link2,
  externalLink: ExternalLink,
  share: Share2,
  locked: Lock,

  // Auth
  signIn: LogIn,
  signOut: LogOut,

  // Navigation
  more: Ellipsis,
  navRight: ChevronRight,
  navLeft: ChevronLeft,
  navDown: ChevronDown,

  // Fallback
  unknownRole: CircleDashed,
} satisfies Record<string, LucideIcon>

export type IconConcept = keyof typeof ICON

/** Role icon + CSS colour token (`--role-*`, consumed via `var(token)`). */
export const ROLE_ICON: Record<string, { icon: LucideIcon; tone: string }> = {
  developer: { icon: CodeXml, tone: "--role-developer" },
  "2d-artist": { icon: Palette, tone: "--role-artist-2d" },
  "3d-artist": { icon: Box, tone: "--role-artist-3d" },
  audio: { icon: Music, tone: "--role-audio" },
  voice_actor: { icon: Mic, tone: "--role-voice" },
  writer: { icon: Feather, tone: "--role-writer" },
  "game-design": { icon: Dices, tone: "--role-design" },
  "ui-ux": { icon: LayoutTemplate, tone: "--role-ux" },
  qa: { icon: Bug, tone: "--role-qa" },
  other: { icon: CircleDashed, tone: "--muted-foreground" },
}

/** Jam style (vibe) icons. */
export const STYLE_ICON: Record<string, LucideIcon> = {
  chill: Coffee,
  learning: BookOpen,
  dedicated: Flame,
  competitive: Swords,
}

/** Kudos category icons. */
export const KUDOS_ICON: Record<string, LucideIcon> = {
  Technical: CodeXml,
  Artistic: Palette,
  Leadership: Crown,
  Friendly: Smile,
}
