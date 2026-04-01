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
            <p className="mt-1 text-sm text-muted-foreground">
              Last updated: April 2026
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
                Hosting and technical providers
              </h2>
              <p className="leading-relaxed text-muted-foreground">
                The web application is hosted by{" "}
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
              <p className="mt-4 leading-relaxed text-muted-foreground">
                Authentication, database, and file storage for the service are
                operated by{" "}
                <a
                  href="https://supabase.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
                >
                  Supabase
                </a>
                . Transactional email is sent through{" "}
                <a
                  href="https://resend.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
                >
                  Resend
                </a>
                . Sign-in may use{" "}
                <a
                  href="https://discord.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
                >
                  Discord
                </a>{" "}
                or{" "}
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
                >
                  Google
                </a>{" "}
                OAuth, subject to their respective terms. Optional features (for
                example browser push notifications or supporter tools) may rely
                on additional providers described in our{" "}
                <Link
                  href="/privacy"
                  className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-xl font-semibold text-foreground">
                Nature of the service
              </h2>
              <p className="leading-relaxed text-muted-foreground">
                GameJamCrew is a <strong className="text-foreground">free community platform</strong> dedicated
                to Game Jams. It helps jammers publish team listings, discover
                other players, send applications and invitations, exchange messages
                in team chat, receive in-app or email notifications, and optionally
                enable browser push alerts. The product may display jam information
                sourced from public pages on third-party sites (such as Itch.io)
                when users import a jam link. Gamification elements (for example
                experience points and badges) are provided for engagement only and
                have no monetary value.
              </p>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                The service is provided &quot;as is&quot; without warranty. The publisher
                does not guarantee that you will find a team or a collaborator.
                Interactions, agreements, and projects you enter into with other
                users are solely between you and them. Use of the platform implies
                acceptance of these notices and our{" "}
                <Link
                  href="/privacy"
                  className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-xl font-semibold text-foreground">
                Acceptable use
              </h2>
              <p className="leading-relaxed text-muted-foreground">
                You agree not to misuse the platform: no harassment, hate speech,
                illegal content, spam, impersonation, or attempts to compromise
                security or other users&apos; accounts. Team owners and the publisher
                may remove or restrict content or access that violates these rules
                or disrupts the service, without prejudice to other remedies.
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
                (profiles, team listings, availability posts, application or
                invitation messages, chat messages, and similar contributions)
                remains the responsibility of each user. You warrant that you
                have the rights to any material you upload or post.
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
