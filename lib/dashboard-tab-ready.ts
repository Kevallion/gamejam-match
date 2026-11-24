/** Decide whether the dashboard shell should keep the full-page skeleton. */
export function shouldShowDashboardSkeleton(
  tab: string,
  loading: boolean,
  rewardsReady: boolean,
): boolean {
  // Rewards (/dashboard?tab=achievements) can paint as soon as the snapshot is ready.
  if (tab === "achievements") return !rewardsReady
  return loading
}