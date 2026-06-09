import { Instagram, Facebook } from 'lucide-react'

const SOCIAL_HANDLES = [
  {
    platform: 'Instagram',
    handle: '@beachfitfuel',
    href: 'https://instagram.com/beachfitfuel',
    icon: <Instagram size={20} />,
    color: '#FF7B9D',
  },
  {
    platform: 'TikTok',
    handle: '@beachfitfuel',
    href: 'https://tiktok.com/@beachfitfuel',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z" />
      </svg>
    ),
    color: '#2C2C2C',
  },
  {
    platform: 'Facebook',
    handle: 'BeachFit Fuel',
    href: 'https://facebook.com/beachfitfuel',
    icon: <Facebook size={20} />,
    color: '#6FBDB8',
  },
]

// Placeholder post colors that suggest drink photos
const PLACEHOLDER_POSTS = [
  { bg: '#FF7B9D', label: '🏖️' },
  { bg: '#FAB65F', label: '🥤' },
  { bg: '#9BBDCF', label: '🌴' },
  { bg: '#6FBDB8', label: '💪' },
]

export function SocialFeed() {
  return (
    <section className="py-16 md:py-20 px-4" style={{ backgroundColor: '#FFF8EE' }}>
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <span className="font-body font-800 text-sm tracking-[0.2em] uppercase" style={{ color: '#6FBDB8' }}>
            Follow Along
          </span>
          <h2 className="font-display text-4xl md:text-5xl tracking-wide text-dark mt-2">
            JOIN THE TRIBE
          </h2>
          <p className="font-body text-dark/60 mt-2 text-base">
            Tag us in your BeachFit Fuel moment for a chance to be featured.
          </p>
        </div>

        {/* Social handles */}
        <div className="flex flex-wrap justify-center gap-4 mb-10">
          {SOCIAL_HANDLES.map((s) => (
            <a
              key={s.platform}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 font-body font-700 text-sm px-5 py-2.5 rounded-full bg-white border border-sky/30 hover:shadow-md transition-shadow"
              style={{ color: s.color }}
            >
              {s.icon}
              {s.handle}
            </a>
          ))}
        </div>

        {/* Placeholder post grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {PLACEHOLDER_POSTS.map((post, i) => (
            <div
              key={i}
              className="aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] transition-transform shadow-sm"
              style={{ backgroundColor: post.bg }}
            >
              <span className="text-4xl">{post.label}</span>
              <span className="font-display text-white tracking-widest text-xs opacity-70">
                @BEACHFITFUEL
              </span>
            </div>
          ))}
        </div>

        <p className="text-center font-body text-dark/40 text-sm mt-6">
          Social feed integration coming soon — follow us to stay in the loop!
        </p>

      </div>
    </section>
  )
}
