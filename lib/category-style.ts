// Deterministic fallback emoji/color for a category that hasn't been styled
// yet in /admin/categories — keeps the menu looking finished on day one
// without requiring every category to be manually configured.
const FALLBACK_STYLES: { emoji: string; color: string }[] = [
  { emoji: '🏖️', color: '#9BBDCF' },
  { emoji: '💪', color: '#FF7B9D' },
  { emoji: '🥤', color: '#6FBDB8' },
  { emoji: '🥙', color: '#EC8A1E' },
  { emoji: '🍋', color: '#FAB65F' },
  { emoji: '🧊', color: '#8FA6D9' },
  { emoji: '🔥', color: '#E8654F' },
  { emoji: '🍬', color: '#C88FD9' },
]

function fallbackFor(categoryId: string) {
  let hash = 0
  for (let i = 0; i < categoryId.length; i++) {
    hash = (hash * 31 + categoryId.charCodeAt(i)) >>> 0
  }
  return FALLBACK_STYLES[hash % FALLBACK_STYLES.length]
}

export function getCategoryStyle(
  categoryId: string,
  emoji?: string | null,
  color?: string | null
): { emoji: string; color: string } {
  const fallback = fallbackFor(categoryId)
  return { emoji: emoji ?? fallback.emoji, color: color ?? fallback.color }
}
