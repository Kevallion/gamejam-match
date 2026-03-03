"use server"

import { getUserEmail } from "@/lib/supabase/admin"
import { sendEmailNotification } from "@/lib/mail"

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://gamejamcrew.com"
const DASHBOARD_URL = `${BASE_URL}/dashboard`

/**
 * Sends an email notification to the team owner when a new applicant applies.
 * Called after successful insert into join_requests (client-side).
 * Errors are handled silently so they don't impact the UX.
 */
export async function notifyOwnerNewApplication(
  ownerUserId: string,
  candidateName: string,
  teamName: string
): Promise<void> {
  try {
    const email = await getUserEmail(ownerUserId)
    if (!email) return

    const subject = "New application for your team! 🚀 | GameJamCrew"
    const html = `
      <p>Good news! Someone just applied to join your team.</p>
      <p>Log in to <a href="${DASHBOARD_URL}">GameJamCrew</a> to check out their profile and accept or decline their application.</p>
      <p>— The GameJamCrew team</p>
    `

    void sendEmailNotification(email, subject, html)
  } catch {
    // Silent error: don't crash the main action
  }
}

/**
 * Sends an email notification to a player when they are invited to join a team.
 * Called after successful insert of invitation into join_requests (client-side).
 * Errors are handled silently so they don't impact the UX.
 */
export async function notifyInviteeInvitation(inviteeUserId: string): Promise<void> {
  try {
    const email = await getUserEmail(inviteeUserId)
    if (!email) return

    const subject = "You've been invited to join a team! 🎮 | GameJamCrew"
    const html = `
      <p>Hi there! A team leader just invited you to join their squad for an upcoming Game Jam.</p>
      <p>Log in to <a href="${DASHBOARD_URL}">GameJamCrew</a> to check out their team details and accept or decline the invitation.</p>
      <p>Happy jamming!</p>
      <p>— The GameJamCrew team</p>
    `

    void sendEmailNotification(email, subject, html)
  } catch {
    // Silent error: don't crash the main action
  }
}

/**
 * Sends an email notification to the candidate when their application is declined.
 * Called after successful status update to rejected (client-side).
 * Errors are handled silently so they don't impact the UX.
 */
export async function notifyApplicantDeclined(candidateUserId: string): Promise<void> {
  try {
    const email = await getUserEmail(candidateUserId)
    if (!email) return

    const subject = "Update on your application 📢 | GameJamCrew"
    const html = `
      <p>Hi there. Thank you for applying!</p>
      <p>Unfortunately, the team leader has decided to move forward with another candidate or the team is now full.</p>
      <p>Don't give up! There are plenty of other great teams looking for your skills right now. Log in to <a href="${DASHBOARD_URL}">GameJamCrew</a> to find your perfect squad.</p>
      <p>Keep jamming!</p>
      <p>— The GameJamCrew team</p>
    `

    void sendEmailNotification(email, subject, html)
  } catch {
    // Silent error: don't crash the main action
  }
}

/**
 * Sends an email notification to the candidate when they are accepted into a team.
 * Called after successful acceptance (client-side).
 * Errors are handled silently so they don't impact the UX.
 */
export async function notifyCandidateAccepted(
  candidateUserId: string,
  teamName: string
): Promise<void> {
  try {
    const email = await getUserEmail(candidateUserId)
    if (!email) return

    const subject = "You've been accepted! 🎉 | GameJamCrew"
    const html = `
      <p>Congratulations! Your application to join the team has been accepted.</p>
      <p>Jump into <a href="${DASHBOARD_URL}">GameJamCrew</a> to connect with your new teammates and start jamming!</p>
      <p>— The GameJamCrew team</p>
    `

    void sendEmailNotification(email, subject, html)
  } catch {
    // Silent error: don't crash the main action
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
