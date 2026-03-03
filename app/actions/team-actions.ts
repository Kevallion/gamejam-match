"use server"

import { getUserEmail } from "@/lib/supabase/admin"
import { sendEmailNotification } from "@/lib/mail"

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://gamejamcrew.com"
const DASHBOARD_URL = `${BASE_URL}/dashboard`

/**
 * Envoie une notification e-mail au propriétaire de l'équipe lorsqu'un nouveau candidat postule.
 * Appelé après l'insertion réussie dans join_requests (côté client).
 * Les erreurs sont gérées silencieusement pour ne pas impacter l'UX.
 */
export async function notifyOwnerNewApplication(
  ownerUserId: string,
  candidateName: string,
  teamName: string
): Promise<void> {
  try {
    const email = await getUserEmail(ownerUserId)
    if (!email) return

    const subject = "Nouveau candidat !"
    const html = `
      <p>Bonjour,</p>
      <p><strong>${escapeHtml(candidateName)}</strong> souhaite rejoindre <strong>${escapeHtml(teamName)}</strong>.</p>
      <p>Connectez-vous sur <a href="${DASHBOARD_URL}">GameJamCrew</a> pour voir son profil.</p>
      <p>— L'équipe GameJamCrew</p>
    `

    void sendEmailNotification(email, subject, html)
  } catch {
    // Erreur silencieuse : ne pas faire crasher l'action principale
  }
}

/**
 * Envoie une notification e-mail au candidat lorsqu'il est accepté dans une équipe.
 * Appelé après l'acceptation réussie (côté client).
 * Les erreurs sont gérées silencieusement pour ne pas impacter l'UX.
 */
export async function notifyCandidateAccepted(
  candidateUserId: string,
  teamName: string
): Promise<void> {
  try {
    const email = await getUserEmail(candidateUserId)
    if (!email) return

    const subject = "Bonne nouvelle ! Vous avez été accepté"
    const html = `
      <p>Bonjour,</p>
      <p>Bonne nouvelle ! Vous avez été accepté dans l'équipe <strong>${escapeHtml(teamName)}</strong>.</p>
      <p>Rejoignez-les vite sur <a href="${DASHBOARD_URL}">GameJamCrew</a> !</p>
      <p>— L'équipe GameJamCrew</p>
    `

    void sendEmailNotification(email, subject, html)
  } catch {
    // Erreur silencieuse : ne pas faire crasher l'action principale
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}
