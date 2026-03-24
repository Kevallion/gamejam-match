import { getPublicSiteUrl } from "@/lib/site-url"

const SOCIAL = {
  x: "https://x.com/GameJamCrew",
  instagram: "https://www.instagram.com/gamejamcrew/",
  linkedin: "https://www.linkedin.com/company/gamejamcrew",
} as const

/** Light theme — page background */
const BG = "#f9fafb"
/** Main content card */
const CARD_BG = "#ffffff"
const TEXT_HEADING = "#1f2937"
const TEXT_BODY = "#4b5563"
const TEXT_MUTED = "#9ca3af"
const ACCENT = "#14b8a6"
const CARD_BORDER = "#e5e7eb"
const DIVIDER = "#d1d5db"

const CARD_SHADOW =
  "0 4px 6px -1px rgba(15,23,42,0.06),0 2px 4px -2px rgba(15,23,42,0.05)"

/** Échapper le texte inséré dans du HTML d’e-mail (noms, titres, etc.). */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

/**
 * Envelope HTML for transactional emails. `title` is escaped; `content` is injected as HTML (caller must sanitize user input).
 */
export function getEmailLayout(title: string, content: string): string {
  const safeTitle = escapeHtml(title)
  const baseUrl = getPublicSiteUrl()

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="x-ua-compatible" content="ie=edge" />
  <title>${safeTitle}</title>
</head>
<body style="margin:0;padding:0;background-color:${BG};color:${TEXT_BODY};font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:16px;line-height:1.6;-webkit-font-smoothing:antialiased;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${BG};margin:0;padding:0;">
    <tr>
      <td align="center" style="padding:32px 16px 28px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px;margin:0 auto;">
          <tr>
            <td align="center" style="padding-bottom:14px;border-bottom:2px solid ${ACCENT};">
              <div style="font-size:30px;font-weight:800;letter-spacing:-0.04em;line-height:1.15;">
                <span style="color:${TEXT_HEADING};">GameJam</span><span style="color:${ACCENT};">Crew</span>
              </div>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:24px 8px 20px;">
              <h1 style="margin:0;font-size:20px;font-weight:700;color:${TEXT_HEADING};line-height:1.35;letter-spacing:-0.02em;">${safeTitle}</h1>
            </td>
          </tr>
          <tr>
            <td style="background-color:${CARD_BG};border:1px solid ${CARD_BORDER};border-radius:12px;padding:32px 28px;color:${TEXT_BODY};box-shadow:${CARD_SHADOW};">
              ${content}
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:26px 12px 8px;font-size:13px;color:${TEXT_MUTED};">
              <p style="margin:0 0 12px;font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:${TEXT_MUTED};">Follow GameJamCrew</p>
              <p style="margin:0 0 14px;line-height:2;font-size:15px;">
                <a href="${SOCIAL.x}" target="_blank" rel="noopener noreferrer" style="color:${ACCENT};text-decoration:none;font-weight:700;">X</a>
                <span style="color:${DIVIDER};margin:0 14px;font-weight:400;">·</span>
                <a href="${SOCIAL.instagram}" target="_blank" rel="noopener noreferrer" style="color:${ACCENT};text-decoration:none;font-weight:700;">Instagram</a>
                <span style="color:${DIVIDER};margin:0 14px;font-weight:400;">·</span>
                <a href="${SOCIAL.linkedin}" target="_blank" rel="noopener noreferrer" style="color:${ACCENT};text-decoration:none;font-weight:700;">LinkedIn</a>
              </p>
              <p style="margin:0;font-size:11px;line-height:1.65;color:${TEXT_MUTED};">
                <a href="${SOCIAL.x}" target="_blank" rel="noopener noreferrer" style="color:#6b7280;text-decoration:underline;">x.com/GameJamCrew</a>
                <span style="color:${DIVIDER};margin:0 8px;">·</span>
                <a href="${SOCIAL.instagram}" target="_blank" rel="noopener noreferrer" style="color:#6b7280;text-decoration:underline;">instagram.com/gamejamcrew</a>
                <span style="color:${DIVIDER};margin:0 8px;">·</span>
                <a href="${SOCIAL.linkedin}" target="_blank" rel="noopener noreferrer" style="color:#6b7280;text-decoration:underline;">linkedin.com/company/gamejamcrew</a>
              </p>
              <p style="margin:18px 0 0;font-size:12px;line-height:1.55;color:${TEXT_MUTED};">
                <a href="${baseUrl}/dashboard" style="color:${TEXT_MUTED};text-decoration:underline;">Unsubscribe</a> from these emails by adjusting your notification preferences in your dashboard.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
