'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  /** Photo URLs in display order. The first is the hero. */
  photos: string[]
  /** Product name — used for the image alt text and the carousel label. */
  alt: string
  /** Rendered when there are no photos, or when a photo's URL fails to load. */
  fallback: React.ReactNode
  /** Tint behind the photo — the category color at 20% alpha. */
  backgroundColor: string
}

const AUTO_ADVANCE_MS = 5000
const SIZES = '(max-width: 1024px) 100vw, 50vw'

// Matches the single-photo hero the detail page has always rendered, so an item
// with one photo looks untouched by this component.
const HERO_CLASSES =
  'aspect-square relative rounded-2xl overflow-hidden shadow-sm mb-3 flex items-center justify-center'

export function PhotoCarousel({ photos, alt, fallback, backgroundColor }: Props) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)
  const [failed, setFailed] = useState<ReadonlySet<string>>(() => new Set())
  // Hover/focus pauses rotation; explicit navigation stops it for good.
  const [paused, setPaused] = useState(false)
  const [autoAdvance, setAutoAdvance] = useState(true)
  const [reducedMotion, setReducedMotion] = useState(false)

  // Read inside callbacks that must not re-subscribe on every change.
  const reducedMotionRef = useRef(false)
  const indexRef = useRef(0)
  indexRef.current = index

  const markFailed = useCallback((url: string) => {
    setFailed((prev) => (prev.has(url) ? prev : new Set(prev).add(url)))
  }, [])

  const scrollToIndex = useCallback((i: number, smooth = true) => {
    const track = trackRef.current
    if (!track) return
    track.scrollTo({
      left: i * track.clientWidth,
      behavior: smooth && !reducedMotionRef.current ? 'smooth' : 'auto',
    })
  }, [])

  /** Customer took over — move there and stop rotating. */
  const goTo = useCallback(
    (i: number) => {
      setAutoAdvance(false)
      scrollToIndex(Math.max(0, Math.min(photos.length - 1, i)))
    },
    [photos.length, scrollToIndex]
  )

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = () => {
      reducedMotionRef.current = mq.matches
      setReducedMotion(mq.matches)
    }
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  // Derive the active slide from scroll position, so a manual swipe and a
  // programmatic jump both land in the same place. Equal-width slides make the
  // rounding exact.
  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    let frame = 0
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        if (!track.clientWidth) return
        setIndex(Math.round(track.scrollLeft / track.clientWidth))
      })
    }
    track.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      track.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [])

  // Slide offsets are pixel-based, so a resize has to re-anchor the current one.
  useEffect(() => {
    const onResize = () => scrollToIndex(indexRef.current, false)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [scrollToIndex])

  useEffect(() => {
    if (!autoAdvance || paused || reducedMotion || photos.length < 2) return
    const timer = setInterval(() => {
      const track = trackRef.current
      // Don't advance in a backgrounded tab — the customer would come back to
      // an arbitrary photo and a burst of queued scrolling.
      if (!track || !track.clientWidth || document.hidden) return
      const next = (Math.round(track.scrollLeft / track.clientWidth) + 1) % photos.length
      track.scrollTo({
        left: next * track.clientWidth,
        // Wrapping back to the first photo jumps rather than sweeping smoothly
        // backwards past every slide.
        behavior: next === 0 ? 'auto' : 'smooth',
      })
    }, AUTO_ADVANCE_MS)
    return () => clearInterval(timer)
  }, [autoAdvance, paused, reducedMotion, photos.length])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      goTo(index + 1)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      goTo(index - 1)
    }
  }

  // Nothing to rotate — render the plain hero exactly as before.
  if (photos.length <= 1) {
    const only = photos[0]
    return (
      <div className={HERO_CLASSES} style={{ backgroundColor }}>
        {only && !failed.has(only) ? (
          <Image
            src={only}
            alt={alt}
            fill
            className="object-cover"
            sizes={SIZES}
            priority
            onError={() => markFailed(only)}
          />
        ) : (
          fallback
        )}
      </div>
    )
  }

  return (
    <div>
      <div
        className="relative mb-3"
        role="region"
        aria-roledescription="carousel"
        aria-label={`${alt} photos`}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        {/* Native scroll-snap gives touch swipe and momentum for free, and is
            driven programmatically by the arrows, thumbnails and the timer. */}
        <div
          ref={trackRef}
          className="flex overflow-x-auto snap-x snap-mandatory rounded-2xl shadow-sm [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
        >
          {photos.map((url, i) => (
            <div
              key={url}
              className="w-full flex-shrink-0 snap-center aspect-square relative flex items-center justify-center"
              style={{ backgroundColor }}
              role="group"
              aria-roledescription="slide"
              aria-label={`Photo ${i + 1} of ${photos.length}`}
            >
              {failed.has(url) ? (
                fallback
              ) : (
                <Image
                  src={url}
                  alt={i === 0 ? alt : `${alt} — photo ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes={SIZES}
                  priority={i === 0}
                  onError={() => markFailed(url)}
                />
              )}
            </div>
          ))}
        </div>

        {/* Touch users swipe, so the arrows only earn their space from sm: up. */}
        <button
          type="button"
          onClick={() => goTo(index - 1)}
          disabled={index === 0}
          aria-label="Previous photo"
          className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full items-center justify-center shadow-sm transition-opacity disabled:opacity-0"
          style={{ backgroundColor: 'rgba(255,255,255,0.9)' }}
        >
          <ChevronLeft className="w-5 h-5 text-dark" />
        </button>
        <button
          type="button"
          onClick={() => goTo(index + 1)}
          disabled={index === photos.length - 1}
          aria-label="Next photo"
          className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full items-center justify-center shadow-sm transition-opacity disabled:opacity-0"
          style={{ backgroundColor: 'rgba(255,255,255,0.9)' }}
        >
          <ChevronRight className="w-5 h-5 text-dark" />
        </button>
      </div>

      {/* One scrolling row rather than a wrapping block — a real item in the
          catalog has 26 photos, which wraps into a wall of thumbnails. */}
      <div
        className="flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
      >
        {photos.map((url, i) => (
          <button
            key={url}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Show photo ${i + 1} of ${photos.length}`}
            aria-current={index === i}
            className="relative w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors"
            style={{ borderColor: index === i ? '#FF7B9D' : 'transparent', backgroundColor }}
          >
            {!failed.has(url) && (
              <Image src={url} alt="" fill className="object-cover" sizes="56px" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
