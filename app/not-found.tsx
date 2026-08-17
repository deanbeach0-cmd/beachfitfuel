import Link from 'next/link'

export default function NotFound() {
  return (
    <div
      className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center gap-8"
      style={{ backgroundColor: '#FFF8EE' }}
    >
      <div
        className="w-28 h-28 rounded-full flex items-center justify-center"
        style={{ backgroundColor: '#FF7B9D22' }}
      >
        <span className="text-6xl">🌴</span>
      </div>

      <div className="flex flex-col gap-3">
        <span
          className="font-display text-8xl md:text-9xl tracking-widest"
          style={{ color: '#FF7B9D' }}
        >
          404
        </span>
        <h1 className="font-display text-3xl md:text-4xl tracking-wide text-dark">
          WASHED OUT TO SEA
        </h1>
        <p className="font-body text-dark/60 max-w-sm mx-auto leading-relaxed">
          Looks like this page got carried away by a wave. Let&apos;s get you back to shore.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/"
          className="font-display tracking-widest text-base px-8 py-4 rounded-full text-white transition-transform hover:scale-105"
          style={{ backgroundColor: '#FF7B9D' }}
        >
          GO HOME
        </Link>
        <Link
          href="/menu/marshall"
          className="font-display tracking-widest text-base px-8 py-4 rounded-full transition-transform hover:scale-105"
          style={{ backgroundColor: 'white', color: '#2C2C2C', border: '1.5px solid #9BBDCF' }}
        >
          VIEW MENU
        </Link>
      </div>
    </div>
  )
}
