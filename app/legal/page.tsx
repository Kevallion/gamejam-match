import { Navbar } from "@/components/navbar"
import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Legal — GameJamCrew",
  description:
    "Legal notices for GameJamCrew — publisher, hosting, and terms of use of the platform.",
  openGraph: {
    title: "Legal — GameJamCrew",
    description:
      "Legal notices for GameJamCrew — publisher, hosting, and terms of use of the platform.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Legal — GameJamCrew",
    description:
      "Legal notices for GameJamCrew — publisher, hosting, and terms of use of the platform.",
  },
}

export default function LegalPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <article className="mx-auto max-w-3xl px-4 py-16 lg:px-6 lg:py-24">
          <div className="mb-12">
            <Link
              href="/"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              ← Back to Home
            </Link>
          </div>

          <header className="mb-12">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
              Legal notices
            </h1>
            <p className="mt-2 text-muted-foreground">
              Information about the site and its operation
            </p>
          </header>

          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-foreground">
            <section>
              <h2 className="mb-4 text-xl font-semibold text-foreground">
                Publisher
              </h2>
              <p className="leading-relaxed text-muted-foreground">
                This site is published by <strong className="text-foreground">Wisllor</strong>. This is a
                free community platform, developed and maintained on a voluntary
                basis.
              </p>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                For any questions concerning the platform, please use the contact
                channels indicated on the site or the associated Discord
                community.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-xl font-semibold text-foreground">
                Hosting
              </h2>
              <p className="leading-relaxed text-muted-foreground">
                This site is hosted by{" "}
                <a
                  href="https://vercel.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
                >
                  Vercel Inc.
                </a>
                , 340 S Lemon Ave #4133, Walnut, CA 91789, USA.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-xl font-semibold text-foreground">
                Nature of the service
              </h2>
              <p className="leading-relaxed text-muted-foreground">
                GameJamCrew is a <strong className="text-foreground">free community platform</strong> dedicated
                to Game Jams. It allows jammers to find teammates or teams for
                game development events. The service is provided &quot;as is&quot; without
                warranty. Use of the platform implies acceptance of these
                conditions and our Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-xl font-semibold text-foreground">
                Intellectual property
              </h2>
              <p className="leading-relaxed text-muted-foreground">
                The content and structure of the site are protected by
                intellectual property law. The GameJamCrew brand and logo are
                used for the purposes of this project. User-generated content
                (profiles, team descriptions) remains the responsibility of each
                user.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-xl font-semibold text-foreground">
                Applicable law
              </h2>
              <p className="leading-relaxed text-muted-foreground">
                These legal notices are governed by applicable law. In case of
                dispute, the courts of the publisher&apos;s jurisdiction shall have
                exclusive competence.
              </p>
            </section>
          </div>
        </article>
      </main>
    </div>
  )
}
