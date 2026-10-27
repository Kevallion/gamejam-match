import { redirect } from "next/navigation"

/** Legacy route: Directory now lives under Members (`/find-members?view=directory`). */
export default function DirectoryRedirectPage() {
  redirect("/find-members?view=directory")
}
