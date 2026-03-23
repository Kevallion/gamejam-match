/**
 * All equippable titles + unlock hints for UI (client-safe).
 * Keep in sync with `lib/gamification.ts` (TITLES_BY_LEVEL, TITLES_BY_ACTION, ROLE_TITLES) and "Rookie Jammer".
 */

export type TitleCatalogEntry = {
  /** Exact string stored in `profiles.current_title` / `unlocked_titles` */
  title: string
  /** Shown on locked tiles and in tooltips */
  unlockHint: string
}

export const TITLE_CATALOG: TitleCatalogEntry[] = [
  { title: "Rookie Jammer", unlockHint: "Starting title — every jammer begins here." },
  { title: "Profile Pioneer", unlockHint: "Complete your onboarding profile." },
  { title: "Town Crier", unlockHint: "Publish an availability announcement." },
  { title: "Squad Founder", unlockHint: "Publish a squad listing (create a team)." },
  { title: "Captain", unlockHint: "Fill every open role slot on your squad listing." },
  { title: "Squad Mate", unlockHint: "Join a team on GameJamCrew." },
  { title: "Recruiter", unlockHint: "Send a squad invitation to another jammer." },
  { title: "Active Scouter", unlockHint: "Reach level 5." },
  { title: "Veteran", unlockHint: "Reach level 10." },
  { title: "Jam Champion", unlockHint: "Claim jam completion rewards on a team you own." },
  // Role keys — 3-tier join progression (see ROLE_TITLES in lib/gamification.ts)
  { title: "Code Monkey", unlockHint: "Join a team as Developer." },
  { title: "Hacker", unlockHint: "Join 3 teams as Developer." },
  { title: "Code Wizard", unlockHint: "Join 5 teams as Developer." },
  { title: "Sketcher", unlockHint: "Join a team as 2D Artist." },
  { title: "Pixel Pusher", unlockHint: "Join 3 teams as 2D Artist." },
  { title: "Master Illustrator", unlockHint: "Join 5 teams as 2D Artist." },
  { title: "Modeler", unlockHint: "Join a team as 3D Artist." },
  { title: "Poly Weaver", unlockHint: "Join 3 teams as 3D Artist." },
  { title: "3D Sculptor", unlockHint: "Join 5 teams as 3D Artist." },
  { title: "Beat Maker", unlockHint: "Join a team as Audio / Music." },
  { title: "Sound Engineer", unlockHint: "Join 3 teams as Audio / Music." },
  { title: "Audio Sorcerer", unlockHint: "Join 5 teams as Audio / Music." },
  { title: "Mic Tester", unlockHint: "Join a team as Voice Actor." },
  { title: "Vocal Talent", unlockHint: "Join 3 teams as Voice Actor." },
  { title: "Golden Voice", unlockHint: "Join 5 teams as Voice Actor." },
  { title: "Scribe", unlockHint: "Join a team as Writer / Narrative." },
  { title: "Storyteller", unlockHint: "Join 3 teams as Writer / Narrative." },
  { title: "Lore Keeper", unlockHint: "Join 5 teams as Writer / Narrative." },
  { title: "Level Builder", unlockHint: "Join a team as Game Designer." },
  { title: "Mechanic Architect", unlockHint: "Join 3 teams as Game Designer." },
  { title: "Mastermind", unlockHint: "Join 5 teams as Game Designer." },
  { title: "Wireframer", unlockHint: "Join a team as UI / UX." },
  { title: "Interface Crafter", unlockHint: "Join 3 teams as UI / UX." },
  { title: "UX Guru", unlockHint: "Join 5 teams as UI / UX." },
  { title: "Bug Hunter", unlockHint: "Join a team as QA / Playtester." },
  { title: "Glitch Finder", unlockHint: "Join 3 teams as QA / Playtester." },
  { title: "The Exterminator", unlockHint: "Join 5 teams as QA / Playtester." },
]

export const TITLE_CATALOG_BY_NAME: Record<string, TitleCatalogEntry> = Object.fromEntries(
  TITLE_CATALOG.map((e) => [e.title, e]),
)

export function parseUnlockedTitlesJson(raw: unknown): string[] {
  if (!Array.isArray(raw)) return ["Rookie Jammer"]
  const out = raw.filter((t): t is string => typeof t === "string" && t.trim().length > 0)
  return out.length > 0 ? out : ["Rookie Jammer"]
}

export function isTitleUnlocked(unlocked: string[], title: string): boolean {
  return unlocked.some((t) => t.trim() === title)
}
