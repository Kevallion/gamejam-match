import { notFound } from "next/navigation"
import { Ds19CardFixtures } from "./ds19-card-fixtures"

export const metadata = {
  title: "DS-19 card height fixtures",
  robots: { index: false, follow: false },
}

export default function Ds19CardFixturesPage() {
  if (process.env.VERCEL_ENV === "production") {
    notFound()
  }
  return <Ds19CardFixtures />
}
