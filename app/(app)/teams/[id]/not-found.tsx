import { TeamNotFoundView } from "./team-not-found-view"

/** Rendered with HTTP 404 when page.tsx calls notFound() (deleted or unknown squad). */
export default function TeamNotFound() {
  return <TeamNotFoundView />
}
