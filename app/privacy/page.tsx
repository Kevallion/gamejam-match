import { Navbar } from "@/components/navbar"
import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Privacy Policy — GameJamCrew",
  description:
    "Privacy policy for GameJamCrew — how we collect, use and protect your data on our Game Jam squad finder platform.",
  openGraph: {
    title: "Privacy Policy — GameJamCrew",
    description:
      "Privacy policy for GameJamCrew — how we collect, use and protect your data on our Game Jam squad finder platform.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Privacy Policy — GameJamCrew",
    description:
      "Privacy policy for GameJamCrew — how we collect, use and protect your data on our Game Jam squad finder platform.",
  },
}

export default function PrivacyPage() {
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
              Privacy Policy
            </h1>
            <p className="mt-2 text-muted-foreground">
              Last updated: March 2025
            </p>
          </header>

          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-foreground">
            <div className="rounded-xl border border-lavender/20 bg-lavender/5 p-6">
              <p className="text-lg leading-relaxed text-foreground">
                Here, we&apos;re among Jammers. Your data will never be sold. We only
                keep what&apos;s needed so you can find your squad and make amazing games.
              </p>
            </div>

            <section>
              <h2 className="mb-4 text-xl font-semibold text-foreground">
                1. Data controller
              </h2>
              <p className="leading-relaxed text-muted-foreground">
                GameJamCrew is a community platform for Game Jam squad matching.
                The processing of your personal data is carried out by the site
                editor. For any question relating to this policy, you can contact
                us via the contact details indicated in the Legal notices.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-xl font-semibold text-foreground">
                2. Data we collect
              </h2>
              <p className="leading-relaxed text-muted-foreground">
                We collect only the data necessary for the proper functioning of
                the platform:
              </p>
              <ul className="mt-4 list-disc space-y-2 pl-6 text-muted-foreground">
                <li>
                  <strong className="text-foreground">Email and profile:</strong>{" "}
                  Managed via Supabase (authentication and database) and Discord
                  OAuth (connection). We receive from Discord: identifier, user
                  name, avatar, and optionally your email.
                </li>
                <li>
                  <strong className="text-foreground">Profile data:</strong>{" "}
                  Skills, roles, game engines, and availability information that
                  you voluntarily provide to find or join a squad.
                </li>
                <li>
                  <strong className="text-foreground">Team and application
                  data:</strong>{" "}
                  Descriptions of teams looking for members and applications sent
                  to join them.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="mb-4 text-xl font-semibold text-foreground">
                3. Data retention and minimization
              </h2>
              <p className="leading-relaxed text-muted-foreground">
                In line with the principle of data minimization (GDPR), team and
                availability announcements expire automatically after a defined
                period. Inactive data is not kept indefinitely. You can delete
                your profile and associated data at any time from your
                dashboard.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-xl font-semibold text-foreground">
                4. Cookies
              </h2>
              <p className="leading-relaxed text-muted-foreground">
                We use cookies strictly necessary for the operation of the
                service: Supabase session cookies to keep you logged in. These
                cookies do not require your prior consent under the GDPR, as
                they are essential for the service to function. We do not use
                Google Analytics, advertising pixels, or any third-party tracking
                cookies.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-xl font-semibold text-foreground">
                5. Your rights
              </h2>
              <p className="leading-relaxed text-muted-foreground">
                In accordance with the GDPR, you have the right to access,
                rectification, erasure, restriction of processing, data
                portability, and to object to processing. You can also lodge a
                complaint with a supervisory authority (e.g. CNIL in France). To
                exercise these rights, contact us via the details in the Legal
                notices.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-xl font-semibold text-foreground">
                6. Data security
              </h2>
              <p className="leading-relaxed text-muted-foreground">
                Data is hosted and processed by Supabase and Vercel, providers
                that comply with industry security standards. We implement
                reasonable measures to protect your data from unauthorized
                access, alteration, or disclosure.
              </p>
            </section>
          </div>
        </article>
      </main>
    </div>
  )
}
