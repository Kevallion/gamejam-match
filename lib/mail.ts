import { Resend } from "resend"
import { getEmailLayout } from "@/lib/mail-template"
import { getPublicDashboardUrl, getPublicSiteUrl } from "@/lib/site-url"

const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ||
  'Wisllor | GameJamCrew <notifications@gamejamcrew.com>'

const DEFAULT_REPLY_TO =
  process.env.RESEND_REPLY_TO_EMAIL || "contact@gamejamcrew.com"

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

/**
 * Enveloppe le fragment HTML du corps dans `getEmailLayout`, puis envoie via Resend.
 * Équivalent à : `const fullHtml = getEmailLayout(...); resend.emails.send({ html: fullHtml, ... })`.
 */
export async function sendEmailWithLayout(
  to: string,
  subject: string,
  layoutTitle: string,
  contentHtml: string,
  options?: {
    replyTo?: string
    from?: string
  },
): Promise<boolean> {
  const fullHtml = getEmailLayout(layoutTitle, contentHtml)
  return sendEmailNotification(to, subject, fullHtml, options)
}

/**
 * Smart-match alert: a new team is recruiting for the recipient's main role.
 */
export async function notifySmartMatch(
  toEmail: string,
  userName: string,
  teamName: string,
  matchingRole: string,
): Promise<boolean> {
  const safeUser = escapeHtml(userName)
  const safeTeam = escapeHtml(teamName)
  const safeRole = escapeHtml(
    (matchingRole && matchingRole.trim()) || "new member",
  )

  const dashboardUrl = getPublicDashboardUrl()
  const subject = "A new team needs your skills! 🚀 | GameJamCrew"

  const accent = "#14b8a6"
  const ctaStyle = `display:inline-block;padding:12px 24px;background-color:${accent};color:#ffffff;text-decoration:none;border-radius:6px;font-weight:bold;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;`

  const emphasis = `font-weight:700;color:${accent};`

  const contentHtml = `
      <p style="margin:0 0 8px;font-size:42px;line-height:1;text-align:center;">🚀</p>
      <p style="margin:0 0 20px;color:#1f2937;font-size:16px;font-weight:600;">Hi ${safeUser},</p>
      <p style="margin:0 0 18px;color:#4b5563;font-size:16px;line-height:1.65;">A new team called <strong style="${emphasis}">${safeTeam}</strong> just started recruiting and they are looking for a <strong style="${emphasis}">${safeRole}</strong>.</p>
      <p style="margin:0 0 28px;color:#4b5563;font-size:15px;line-height:1.6;">Since this is your main role, we thought you'd be a perfect match! Don't miss the chance to join a great project.</p>
      <p style="margin:0 0 28px;text-align:center;">
        <a href="${dashboardUrl}" style="${ctaStyle}" target="_blank" rel="noopener noreferrer">Open GameJamCrew</a>
      </p>
      <p style="margin:0;color:#6b7280;font-size:14px;line-height:1.5;">Happy jamming!<br/><span style="color:#9ca3af;">The GameJamCrew team</span></p>
    `

  return sendEmailWithLayout(toEmail, subject, "New Team Match! 🚀", contentHtml)
}

/**
 * Announcement for the first official GameJamCrew community jam (Launch Jam).
 */
export async function sendLaunchJamAnnouncement(
  to: string,
  username: string,
): Promise<boolean> {
  const safeName = escapeHtml(username)
  const dashboardUrl = getPublicDashboardUrl()
  const subject =
    "🚀 GameJamCrew Launch Jam: The prize pool is waiting for you!"

  const accent = "#14b8a6"
  const p =
    "margin:0 0 16px;color:#4b5563;font-size:16px;line-height:1.65;"
  const h =
    "margin:24px 0 10px;color:#1f2937;font-size:15px;font-weight:700;letter-spacing:0.02em;text-transform:uppercase;"
  const ctaStyle = `display:inline-block;padding:14px 28px;background-color:${accent};color:#ffffff;text-decoration:none;border-radius:6px;font-weight:700;font-size:15px;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;`

  const contentHtml = `
      <p style="margin:0 0 8px;font-size:40px;line-height:1;text-align:center;">🚀</p>
      <p style="margin:0 0 20px;color:#1f2937;font-size:18px;font-weight:600;">Hi ${safeName},</p>
      <p style="${p}">We are excited to celebrate the <strong style="font-weight:700;color:#1f2937;">first official GameJamCrew community jam</strong>, our Launch Jam. Whether you are looking for a squad or ready to lead one, this is your moment to connect and build something great together.</p>

      <p style="${h}">The prize pool</p>
      <p style="${p}"><strong style="font-weight:700;color:${accent};">Tier 1:</strong> Every participating team is eligible for <strong style="color:#1f2937;">guaranteed $40 Steam Gift Cards</strong>.</p>
      <p style="${p}"><strong style="font-weight:700;color:${accent};">Tier 2:</strong> If we reach <strong style="color:#1f2937;">600+ jammers</strong> across the event, the pool increases to <strong style="color:#1f2937;">$100</strong> in Steam rewards.</p>

      <p style="${h}">Rules</p>
      <p style="${p}">Teams must have <strong style="color:#1f2937;">3 to 4 members</strong> (maximum). Your squad <strong style="color:#1f2937;">must be officially formed on gamejamcrew.com</strong>; ad-hoc groups outside the platform are not eligible.</p>

      <p style="${h}">Timeline</p>
      <p style="${p}"><strong style="color:#1f2937;">Kick-off:</strong> May 1st at 6:00 PM (CET)<br/>
      <strong style="color:#1f2937;">Submission deadline:</strong> May 17th at 8:00 PM (CET)</p>
      <p style="${p}"><strong style="color:#1f2937;">Jam page:</strong> <a href="https://itch.io/jam/gamejamcrew-jam" style="color:${accent};text-decoration:underline;font-weight:600;" target="_blank" rel="noopener noreferrer">https://itch.io/jam/gamejamcrew-jam</a></p>

      <p style="margin:28px 0 24px;text-align:center;">
        <a href="${dashboardUrl}" style="${ctaStyle}" target="_blank" rel="noopener noreferrer">FIND YOUR SQUAD</a>
      </p>
      <p style="margin:0;color:#6b7280;font-size:14px;line-height:1.5;">See you in the jam,<br/><span style="color:#9ca3af;">The GameJamCrew team</span></p>
    `

  return sendEmailWithLayout(
    to,
    subject,
    "GameJamCrew Launch Jam",
    contentHtml,
  )
}

/**
 * Follow-up après la création d'une équipe :
 * - annonce que le squad est live
 * - encourage à inviter des membres via "Find Members"
 * - donne un lien direct vers la page de gestion de l'équipe
 */
export async function sendTeamCreationFollowUp(
  to: string,
  teamName: string,
  teamId: string,
): Promise<boolean> {
  const safeTeamName = escapeHtml(teamName)

  const siteUrl = getPublicSiteUrl()
  const findMembersUrl = `${siteUrl}/find-members`
  const manageTeamUrl = `${siteUrl}/teams/${teamId}/manage`

  const subject = "Your squad is live! | GameJamCrew"
  const layoutTitle = "Your squad is live"

  const accent = "#14b8a6"
  const ctaStyle = `display:inline-block;padding:12px 24px;background-color:${accent};color:#ffffff;text-decoration:none;border-radius:6px;font-weight:bold;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;`

  const contentHtml = `
      <p style="margin:0 0 16px;color:#1f2937;font-size:16px;font-weight:700;line-height:1.6;">
        Your squad is now live.
      </p>
      <p style="margin:0 0 16px;color:#4b5563;font-size:16px;line-height:1.65;">
        Your team <strong style="color:#1f2937;">${safeTeamName}</strong> is ready. Next step: browse <strong style="color:#1f2937;">"Find Members"</strong> to invite people manually.
      </p>
      <p style="margin:0 0 24px;text-align:center;">
        <a href="${findMembersUrl}" style="${ctaStyle}" target="_blank" rel="noopener noreferrer">Find Members</a>
      </p>
      <p style="margin:0 0 16px;color:#4b5563;font-size:15px;line-height:1.6;">
        You can manage everything from your <a href="${manageTeamUrl}" style="color:${accent};text-decoration:underline;font-weight:700;" target="_blank" rel="noopener noreferrer">team management page</a>.
      </p>
      <p style="margin:0;color:#6b7280;font-size:14px;line-height:1.5;">
        — The GameJamCrew team
      </p>
    `

  return sendEmailWithLayout(to, subject, layoutTitle, contentHtml)
}

/**
 * Follow-up après une publication joueur :
 * - félicite
 * - encourage à compléter le profil à 100%
 * - recommande de parcourir la section "Teams"
 */
export async function sendPlayerPostFollowUp(
  to: string,
  username: string,
): Promise<boolean> {
  const safeUsername = escapeHtml(username)

  const siteUrl = getPublicSiteUrl()
  const teamsUrl = `${siteUrl}/teams`
  const profileUrl = `${siteUrl}/create-profile`

  const subject = "Nice work! Next up: your profile and Teams | GameJamCrew"
  const layoutTitle = "Nice work!"

  const accent = "#14b8a6"
  const ctaStyle = `display:inline-block;padding:12px 24px;background-color:${accent};color:#ffffff;text-decoration:none;border-radius:6px;font-weight:bold;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;`

  const contentHtml = `
      <p style="margin:0 0 16px;color:#1f2937;font-size:16px;font-weight:700;line-height:1.6;">
        Congrats, ${safeUsername}!
      </p>
      <p style="margin:0 0 16px;color:#4b5563;font-size:16px;line-height:1.65;">
        You are off to a great start. For the best matchmaking, complete your profile to <strong style="color:#1f2937;">100%</strong>.
      </p>
      <p style="margin:0 0 24px;color:#4b5563;font-size:15px;line-height:1.6;">
        Then browse the <strong style="color:#1f2937;">"Teams"</strong> section to find the right squad for your playstyle.
      </p>
      <p style="margin:0 0 24px;text-align:center;">
        <a href="${teamsUrl}" style="${ctaStyle}" target="_blank" rel="noopener noreferrer">Browse Teams</a>
      </p>
      <p style="margin:0;color:#6b7280;font-size:14px;line-height:1.5;">
        Update your profile here: <a href="${profileUrl}" style="color:${accent};text-decoration:underline;font-weight:700;" target="_blank" rel="noopener noreferrer">Create Profile</a>
      </p>
    `

  return sendEmailWithLayout(to, subject, layoutTitle, contentHtml)
}

/**
 * Sends a transactional email notification via Resend.
 * Errors are logged but not propagated so they don't block the main action.
 *
 * By default, uses RESEND_FROM_EMAIL and RESEND_REPLY_TO_EMAIL,
 * but both can be overridden per call via options.
 */
export async function sendEmailNotification(
  to: string,
  subject: string,
  html: string,
  options?: {
    replyTo?: string
    from?: string
  }
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn("[mail] RESEND_API_KEY not configured, email not sent.")
    return false
  }

  try {
    const resend = new Resend(apiKey)
    const { error } = await resend.emails.send({
      from: options?.from || FROM_EMAIL,
      to: [to],
      subject,
      html,
      replyTo: options?.replyTo || DEFAULT_REPLY_TO,
    })

    if (error) {
      console.error("[mail] Resend error:", error)
      return false
    }
    return true
  } catch (err) {
    console.error("[mail] Send error:", err)
    return false
  }
}
