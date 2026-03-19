"use client"

import * as React from "react"
import Image from "next/image"
import Autoplay from "embla-carousel-autoplay"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel"
import { Button } from "@/components/ui/button"

interface SlideData {
  id: string
  title: string
  subtitle: string
  description: string
  backgroundImage: string
  accentColor: "teal" | "pink" | "lavender" | "peach" | "mint"
  cta?: {
    label: string
    href: string
  }
}

const slides: SlideData[] = [
  {
    id: "hook",
    title: "L'industrie du jeu video change",
    subtitle: "2024 - 2025",
    description: "Les grands studios ferment, les licenciements s'enchainent. Mais une nouvelle ere commence...",
    backgroundImage: "/carousel-bg-1-hook.jpg",
    accentColor: "pink",
  },
  {
    id: "promise",
    title: "Une nouvelle porte s'ouvre",
    subtitle: "Pour les independants",
    description: "Les meilleurs jeux de demain ne viendront pas des grandes entreprises. Ils viendront de vous.",
    backgroundImage: "/carousel-bg-2-promise.jpg",
    accentColor: "teal",
    cta: {
      label: "Rejoindre la communaute",
      href: "#teams",
    },
  },
  {
    id: "heart",
    title: "Le coeur avant le budget",
    subtitle: "Ce qui compte vraiment",
    description: "Minecraft, Undertale, Stardew Valley... Tous crees par des passionnes avec zero budget.",
    backgroundImage: "/carousel-bg-3-heart.jpg",
    accentColor: "pink",
  },
  {
    id: "vision",
    title: "Ta vision, ton equipe",
    subtitle: "GameJam Crew",
    description: "Trouve les co-equipiers parfaits pour ta prochaine game jam. Programmeurs, artistes, musicians...",
    backgroundImage: "/carousel-bg-4-vision.jpg",
    accentColor: "lavender",
    cta: {
      label: "Trouver une equipe",
      href: "#teams",
    },
  },
  {
    id: "energy",
    title: "L'etincelle creatrice",
    subtitle: "48h pour tout changer",
    description: "Les game jams sont le terrain de jeu parfait pour experimenter, apprendre et creer sans limites.",
    backgroundImage: "/carousel-bg-5-energy.jpg",
    accentColor: "peach",
  },
]

const accentColorClasses = {
  teal: "bg-teal text-teal-foreground",
  pink: "bg-pink text-pink-foreground",
  lavender: "bg-lavender text-lavender-foreground",
  peach: "bg-peach text-peach-foreground",
  mint: "bg-mint text-mint-foreground",
}

const accentRingClasses = {
  teal: "ring-teal/50",
  pink: "ring-pink/50",
  lavender: "ring-lavender/50",
  peach: "ring-peach/50",
  mint: "ring-mint/50",
}

export function CarouselHero() {
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)
  const [count, setCount] = React.useState(0)

  React.useEffect(() => {
    if (!api) return

    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap())

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap())
    })
  }, [api])

  const scrollPrev = React.useCallback(() => {
    api?.scrollPrev()
  }, [api])

  const scrollNext = React.useCallback(() => {
    api?.scrollNext()
  }, [api])

  const scrollTo = React.useCallback(
    (index: number) => {
      api?.scrollTo(index)
    },
    [api]
  )

  return (
    <section className="relative w-full py-8 sm:py-12 lg:py-16">
      <div className="mx-auto max-w-6xl px-4 lg:px-6">
        <Carousel
          setApi={setApi}
          opts={{
            align: "start",
            loop: true,
          }}
          plugins={[
            Autoplay({
              delay: 6000,
              stopOnInteraction: true,
            }),
          ]}
          className="relative w-full"
        >
          <CarouselContent className="-ml-0">
            {slides.map((slide) => (
              <CarouselItem key={slide.id} className="pl-0">
                <div className="relative aspect-[16/9] sm:aspect-[2/1] lg:aspect-[21/9] w-full overflow-hidden rounded-2xl border border-border/30">
                  {/* Background Image */}
                  <Image
                    src={slide.backgroundImage}
                    alt=""
                    fill
                    className="object-cover"
                    priority
                  />
                  
                  {/* Dark overlay for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/50 to-background/20" />
                  
                  {/* Content */}
                  <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8 lg:p-12">
                    <div className="max-w-2xl space-y-3 sm:space-y-4">
                      {/* Subtitle badge */}
                      <span
                        className={cn(
                          "inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider",
                          accentColorClasses[slide.accentColor]
                        )}
                      >
                        {slide.subtitle}
                      </span>
                      
                      {/* Title */}
                      <h2 className="text-2xl font-bold leading-tight text-foreground sm:text-3xl lg:text-4xl text-balance drop-shadow-lg">
                        {slide.title}
                      </h2>
                      
                      {/* Description */}
                      <p className="text-sm text-muted-foreground sm:text-base lg:text-lg max-w-xl text-pretty drop-shadow-md">
                        {slide.description}
                      </p>
                      
                      {/* CTA Button */}
                      {slide.cta && (
                        <div className="pt-2">
                          <Button
                            asChild
                            size="lg"
                            className={cn(
                              "rounded-full font-semibold transition-all hover:scale-105",
                              accentColorClasses[slide.accentColor]
                            )}
                          >
                            <a href={slide.cta.href}>{slide.cta.label}</a>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* Navigation Buttons */}
          <Button
            variant="outline"
            size="icon"
            className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full border-border/50 bg-card/80 backdrop-blur-sm hover:bg-card hover:border-primary/50 transition-all"
            onClick={scrollPrev}
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="sr-only">Slide precedente</span>
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full border-border/50 bg-card/80 backdrop-blur-sm hover:bg-card hover:border-primary/50 transition-all"
            onClick={scrollNext}
          >
            <ChevronRight className="h-5 w-5" />
            <span className="sr-only">Slide suivante</span>
          </Button>

          {/* Dot Indicators */}
          <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
            {Array.from({ length: count }).map((_, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  current === index
                    ? cn("w-6 bg-primary", accentRingClasses[slides[index]?.accentColor ?? "teal"])
                    : "w-2 bg-foreground/30 hover:bg-foreground/50"
                )}
                aria-label={`Aller au slide ${index + 1}`}
              />
            ))}
          </div>
        </Carousel>
      </div>
    </section>
  )
}
