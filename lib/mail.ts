import { Resend } from "resend"

const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ||
  'Wisllor | GameJam Crew <notifications@gamejamcrew.com>'

const DEFAULT_REPLY_TO =
  process.env.RESEND_REPLY_TO_EMAIL || "contact@gamejamcrew.com"

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
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn("[mail] RESEND_API_KEY not configured, email not sent.")
    return
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
    }
  } catch (err) {
    console.error("[mail] Send error:", err)
  }
}
