import type { DashboardFixture } from "@/components/dashboard-client"
import type { TeamData } from "@/components/dashboard-my-teams"

const longSquad = "Pixel Pioneers of the Midnight Soundtrack Collective"
const longJam = "GMTK Game Jam 2026 — a very long listing title that should wrap or truncate"

function team(
  partial: Pick<TeamData, "id" | "name" | "jam" | "members" | "maxMembers" | "isOwner"> &
    Partial<TeamData>,
): TeamData {
  return {
    engine: "Godot",
    language: "English",
    description: "A cozy squad building a jam game.",
    roles: [{ label: "Sound designer", emoji: "🎧", color: "bg-teal/15 text-teal" }],
    lookingForRoleKeys: ["sound"],
    level: { label: "Intermediate", emoji: "🎮", color: "bg-muted text-muted-foreground" },
    discord_link: "https://discord.gg/example",
    teamVibe: "Chill",
    ...partial,
  }
}

export const dashboardFixture: DashboardFixture = {
  displayName: "Maya Chen-Okafor",
  profile: {
    id: "preview-user",
    username: "Maya Chen-Okafor",
    discord_username: null,
    avatar_url: null,
    default_role: "sound",
    default_engine: "godot",
    default_language: "english",
    portfolio_url: "https://maya.example",
    xp: 180,
    current_title: "Rookie Jammer",
    programming_languages: ["typescript", "csharp"],
    profile_roles: [{ role: "sound", experience_level: "regular", is_primary: true }],
  },
  teams: [
    team({
      id: "squad-pixel",
      name: longSquad,
      jam: longJam,
      members: 3,
      maxMembers: 5,
      isOwner: true,
    }),
    team({
      id: "squad-neon",
      name: "Neon Afterdark",
      jam: "Cyberpunk roguelite",
      members: 4,
      maxMembers: 4,
      isOwner: false,
      engine: "Unity",
      roles: [{ label: "UI / UX Designer", emoji: "🎨", color: "bg-pink/15 text-pink" }],
      lookingForRoleKeys: [],
      discord_link: null,
      expiresAt: new Date(Date.now() + 20 * 60 * 60 * 1000).toISOString(),
    }),
  ],
  availabilityPosts: [
    {
      id: "post-1",
      user_id: "preview-user",
      availability: "Evenings and weekends through the whole jam",
      expires_at: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
      username: "Maya Chen-Okafor",
      role: "Sound designer",
      engine: "Godot",
      language: "English",
      jam: { id: "jam-1", title: longJam, url: "https://itch.io" },
    },
  ],
  applications: [
    {
      id: "app-alex",
      username: "Alexandra Riverstone",
      avatar_url: null,
      teamName: longSquad,
      role: { label: "UI / UX Designer", emoji: "🎨", color: "" },
      motivation: "I would love to join and handle the interface.",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
  ],
  invitations: [
    {
      id: "inv-sofia",
      team_id: "squad-neon",
      squadName: "Neon Afterdark",
      discordLink: null,
      targetRole: "Producer",
    },
  ],
  sentApplications: [
    {
      id: "sent-1",
      status: "pending",
      teamName: "Harbor Lights Interactive",
      target_role: "Composer",
      discord_link: null,
    },
  ],
  sentInvitations: [
    {
      id: "sent-inv-1",
      status: "pending",
      teamName: longSquad,
      inviteeUserId: "jordan",
      inviteeUsername: "Jordan Lee-Martins",
      inviteeAvatarUrl: null,
      target_role: "Artist",
    },
  ],
  recommendedTeams: [
    {
      id: "squad-harbor",
      team_name: "Harbor Lights Interactive",
      matched_role: "sound",
      role_label: "Sound designer",
      team_engine_label: "Godot",
      matches_your_engine: true,
    },
  ],
  activity: [
    {
      id: "act-1",
      message: "You joined Pixel Pioneers",
      created_at: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "act-2",
      message: "Alexandra Riverstone applied to your squad",
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "act-3",
      message: "You earned First Steps",
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],
}
