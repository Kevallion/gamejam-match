/**
 * PostgREST / Postgres errors when a select or write names a column that
 * is not in the schema yet (deploy before the migration).
 */
export function isMissingColumnError(
  error: { code?: string | null; message?: string | null } | null | undefined,
  column: string,
): boolean {
  if (!error) return false
  const message = (error.message ?? "").toLowerCase()
  const needle = column.toLowerCase()
  if (!message.includes(needle)) return false
  const code = (error.code ?? "").toUpperCase()
  return (
    code === "42703" ||
    code === "PGRST204" ||
    message.includes("does not exist") ||
    message.includes("schema cache") ||
    message.includes("could not find")
  )
}
