import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "GameJamCrew <onboarding@resend.dev>"

/**
 * Envoie une notification e-mail transactionnelle via Resend.
 * Les erreurs sont loguées mais ne sont pas propagées pour ne pas bloquer l'action principale.
 */
export async function sendEmailNotification(
  to: string,
  subject: string,
  html: string
): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[mail] RESEND_API_KEY non configuré, e-mail non envoyé.")
    return
  }

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject,
      html,
    })

    if (error) {
      console.error("[mail] Erreur Resend:", error)
    }
  } catch (err) {
    console.error("[mail] Erreur lors de l'envoi:", err)
  }
}
