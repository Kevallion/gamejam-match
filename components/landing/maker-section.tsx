import { Coffee, Code2 } from "lucide-react"

export function MakerSection() {
  return (
    <section id="maker" className="relative bg-slate-50 py-20 md:py-28">
      {/* thin top border */}
      <div className="absolute inset-x-0 top-0 h-1 bg-slate-200" aria-hidden="true" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* section label */}
        <p className="mb-10 text-center text-xs font-bold uppercase tracking-widest text-slate-400">
          Meet the Maker
        </p>

        <div className="grid grid-cols-1 items-start gap-12 md:grid-cols-2 md:gap-16 lg:gap-24">
          {/* Left — photo */}
          <div className="flex flex-col items-center gap-4 md:items-start">
            <div className="relative">
              {/* neo-brutalist offset border */}
              <div
                className="absolute -right-3 -top-3 h-full w-full rounded-2xl border-2 border-slate-900 bg-teal-400"
                aria-hidden="true"
              />
              <div className="relative h-72 w-72 overflow-hidden rounded-2xl border-2 border-slate-900 bg-slate-200 sm:h-80 sm:w-80">
                {/* placeholder portrait */}
                <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-slate-100">
                  <div className="h-20 w-20 rounded-full border-2 border-slate-300 bg-slate-200" />
                  <div className="h-24 w-full bg-slate-200" />
                </div>
                {/* If you have a real photo: replace the div above with an <Image> */}
                {/*
                <Image
                  src="/images/maker.jpg"
                  alt="The maker of GameJamCrew"
                  fill
                  className="object-cover"
                />
                */}
              </div>
            </div>

            {/* caption */}
            <p className="flex items-center gap-1.5 text-sm font-medium text-slate-500">
              Made with <Coffee className="h-4 w-4 text-amber-500" /> and
              <Code2 className="h-4 w-4 text-teal-500" />
              by a fellow jammer.
            </p>
          </div>

          {/* Right — story */}
          <div className="flex flex-col gap-6">
            <h2 className="text-4xl font-extrabold leading-tight text-slate-900 text-balance md:text-5xl">
              Hey, I&apos;m{" "}
              <span className="relative inline-block">
                <span className="relative z-10 text-teal-500">[Your Name]</span>
                <span
                  className="absolute bottom-1 left-0 z-0 h-3 w-full bg-teal-100"
                  aria-hidden="true"
                />
              </span>
              .<br />
              I built this.
            </h2>

            <div className="flex flex-col gap-4 text-lg leading-relaxed text-slate-600">
              <p>
                {"I've done my share of intense game jams. I got tired of dead teams, abandoned forums,"}
                {" and ghosting mid-project, so I built GameJamCrew to help us connect and actually"}
                {" finish our games."}
              </p>
              <p>
                No VC money, no corporate hidden agenda. Just a passion for game dev.{" "}
                <strong className="font-semibold text-slate-800">
                  See you on the next one!
                </strong>
              </p>
            </div>

            {/* signature */}
            <div className="mt-2 flex flex-col gap-1 border-l-4 border-teal-400 pl-4">
              <p className="text-xl font-bold italic text-slate-800">
                &mdash; Happy Jamming! &#x2694;&#xFE0F;
              </p>
              <p className="text-sm text-slate-400">Founder, GameJamCrew</p>
            </div>

            {/* neo-brutalist stat pills */}
            <div className="mt-4 flex flex-wrap gap-3">
              {[
                { label: "Solo-built", value: "100%" },
                { label: "Game Jams joined", value: "20+" },
                { label: "Games shipped", value: "8" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="flex flex-col items-center rounded-xl border-2 border-slate-900 bg-white px-5 py-3 shadow-[3px_3px_0_#1e293b]"
                >
                  <span className="text-2xl font-extrabold text-teal-500">{stat.value}</span>
                  <span className="text-xs font-semibold text-slate-500">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
