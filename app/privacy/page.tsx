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
              Last updated: April 2026
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
                  <strong className="text-foreground">Account and sign-in:</strong>{" "}
                  Authentication is handled by Supabase. You may sign in with Discord
                  or Google OAuth, or with a magic link sent to your email. Depending
                  on the provider, we may receive an account identifier, display name,
                  avatar URL, and email address.
                </li>
                <li>
                  <strong className="text-foreground">Public profile:</strong>{" "}
                  Information you choose to add (for example username, bio, skills,
                  default role and engine, languages, portfolio link, Discord
                  username, experience level, and jam-related preferences) to be
                  discoverable by other jammers.
                </li>
                <li>
                  <strong className="text-foreground">Gamification:</strong>{" "}
                  Progress data stored on your profile such as experience points,
                  level, unlocked titles and badges, and related statistics used only
                  to reward engagement on the platform.
                </li>
                <li>
                  <strong className="text-foreground">Teams and recruiting:</strong>{" "}
                  Content you publish when creating or managing a team (name, game
                  concept, roles sought, description, engine, language, Discord
                  invite link when provided, jam association, dates).
                </li>
                <li>
                  <strong className="text-foreground">Join requests and invitations:</strong>{" "}
                  When you apply to a team or receive or send an invitation, we store
                  the request type, status, targeted role, and any message you attach,
                  plus identifiers needed to connect the request to your account and
                  the team.
                </li>
                <li>
                  <strong className="text-foreground">Team chat:</strong>{" "}
                  Messages you post in a team&apos;s chat are stored so members can
                  see the conversation history for that team.
                </li>
                <li>
                  <strong className="text-foreground">Availability posts:</strong>{" "}
                  Optional listings when you advertise yourself as available for a jam,
                  including role, engine, and similar fields you submit; these
                  listings can expire automatically.
                </li>
                <li>
                  <strong className="text-foreground">In-app notifications:</strong>{" "}
                  We store notification records (type, message, link, read state) so
                  you can see updates about applications, invitations, team activity,
                  and similar events in the product.
                </li>
                <li>
                  <strong className="text-foreground">Optional browser push:</strong>{" "}
                  If you enable push notifications, we store subscription data
                  (endpoint and encryption keys) required for your browser to receive
                  alerts. You can disable this at any time from your device or
                  browser settings and we stop using that subscription once removed.
                </li>
                <li>
                  <strong className="text-foreground">Transactional email:</strong>{" "}
                  We send service-related emails (for example sign-in links, smart
                  match alerts, application and invitation updates, team changes,
                  and periodic alerts for new team chat messages subject to rate
                  limits) to the address associated with your
                  account. Sending is done through our email provider; we do not use
                  these emails for advertising.
                </li>
                <li>
                  <strong className="text-foreground">Imported jam metadata:</strong>{" "}
                  When someone submits an Itch.io jam URL, our servers fetch the
                  public jam page to extract non-sensitive catalog information (such
                  as title, link, dates, and imagery) so jams can be selected in the
                  product. This does not include your Itch account credentials.
                </li>
                <li>
                  <strong className="text-foreground">Supporter matching (optional):</strong>{" "}
                  If you support the project through Buy Me a Coffee and use the same
                  email as your GameJamCrew account, their systems may share that
                  email with us via webhook so we can grant optional supporter badges.
                  We only use it to match your existing account, not for marketing.
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
                dashboard. Pending join requests you withdraw may be deleted;
                historical team membership and messages may remain visible to
                former teammates according to product behavior until teams or
                content are removed by owners or by automated cleanup.
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
                5. Subprocessors and sharing
              </h2>
              <p className="leading-relaxed text-muted-foreground">
                We rely on trusted infrastructure and service providers to run
                GameJamCrew. They process data on our instructions only:
                Supabase (authentication and database), Vercel (hosting),
                Resend (transactional email), and when you use them, Discord or
                Google (OAuth login). Public jam pages may be retrieved from
                Itch.io when importing a jam. We do not sell personal data.
                Other users can see information you publish on the platform
                (profiles, teams, availability) according to the product&apos;s
                visibility rules.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-xl font-semibold text-foreground">
                6. Your rights
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
                7. Data security
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
