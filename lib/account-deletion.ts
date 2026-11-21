/** Label that replaces a deleted account's username in other members' notifications. */
export const DELETED_USER_LABEL = "A deleted user"

/**
 * Same rule as the SQL trigger `anonymize_deleted_user_notifications`
 * (supabase/migrations/20261120130000_anonymize_deleted_user_notifications.sql):
 * notification texts start with "<name> …" or "Player <name> …", so only that
 * leading position is rewritten. A team name or free text containing the same
 * word is left untouched.
 */
export function anonymizeDeletedUserMessage(message: string, username: string | null | undefined): string {
  const name = username?.trim() ?? ""
  if (!name) return message
  const playerPrefix = `Player ${name} `
  if (message.startsWith(playerPrefix)) {
    return `${DELETED_USER_LABEL} ${message.slice(playerPrefix.length)}`
  }
  const namePrefix = `${name} `
  if (message.startsWith(namePrefix)) {
    return `${DELETED_USER_LABEL} ${message.slice(namePrefix.length)}`
  }
  return message
}
