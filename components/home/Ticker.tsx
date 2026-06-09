const TICKER_TEXT =
  'FUEL YOUR DAY THE FUN WAY · BEACH BOMBS · 0 SUGAR · LOW CAL · 25G PROTEIN SHAKES · TO-GO PACKS SHIP NATIONWIDE · BATTLE CREEK OPENING SOON'

export function Ticker() {
  return (
    <div
      className="overflow-hidden py-3 select-none"
      style={{ backgroundColor: '#FF7B9D' }}
      aria-hidden="true"
    >
      {/* Duplicate text so the loop is seamless — animation moves -50% */}
      <div className="flex whitespace-nowrap animate-ticker">
        {[0, 1].map((i) => (
          <span
            key={i}
            className="font-display text-white tracking-widest text-base md:text-lg px-8"
            style={{ letterSpacing: '0.15em' }}
          >
            {TICKER_TEXT} &nbsp;&nbsp;&nbsp; {TICKER_TEXT} &nbsp;&nbsp;&nbsp;
          </span>
        ))}
      </div>
    </div>
  )
}
