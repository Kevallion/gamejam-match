import { notFound } from "next/navigation"
import { allowQaFixtures } from "@/lib/allow-qa-fixtures"
import { Ds19CardFixtures } from "./ds19-card-fixtures"

export const metadata = {
  title: "DS-19 card height fixtures",
  robots: { index: false, follow: false },
}

export default function Ds19CardFixturesPage() {
  if (!allowQaFixtures()) {
    notFound()
  }
  return <Ds19CardFixtures />
}
