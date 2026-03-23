/** Human-readable action names for XP toasts (English, matches app UI). */
export const GAMIFICATION_ACTION_LABELS: Record<string, string> = {
  DAILY_LOGIN: "Daily login",
  COMPLETE_PROFILE: "Profile completed",
  POST_ANNOUNCEMENT: "Announcement",
  JOIN_TEAM: "Joined team",
  INVITE_MEMBER: "Invitation sent",
  CREATE_TEAM: "Team created",
  TEAM_COMPLETED: "Jam completed",
}

export const BADGE_DISPLAY_LABELS: Record<string, string> = {
  captain: "Captain",
  team_player: "Team Player",
  early_bird: "Early Bird",
}

export function formatBadgeLabel(badgeId: string): string {
  const key = badgeId.trim().toLowerCase()
  return BADGE_DISPLAY_LABELS[key] ?? badgeId.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}
