import { Resend } from "resend"

const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "GameJamCrew <onboarding@resend.dev>"

/**
 * Sends a transactional email notification via Resend.
 * Errors are logged but not propagated so they don't block the main action.
 */
export async function sendEmailNotification(
  to: string,
  subject: string,
  html: string
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn("[mail] RESEND_API_KEY not configured, email not sent.")
    return
  }

  try {
    const resend = new Resend(apiKey)
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject,
      html,
    })

    if (error) {
      console.error("[mail] Resend error:", error)
    }
  } catch (err) {
    console.error("[mail] Send error:", err)
  }
}
