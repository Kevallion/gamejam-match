/** Decide whether the dashboard shell should keep the full-page skeleton. */
export function shouldShowDashboardSkeleton(
  tab: string,
  loading: boolean,
  rewardsReady: boolean,
  coreReady = false,
): boolean {
  // Rewards (/dashboard?tab=achievements) can paint as soon as the snapshot is ready.
  if (tab === "achievements") return !rewardsReady
  // Home: once profile + XP are ready, do not wait for recos or the rest of loadData.
  if (tab === "squads" && coreReady) return false
  return loading
}