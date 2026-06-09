import { SquareClient, SquareEnvironment } from 'square'

// Server-only — never import in Client Components.
// next.config.js serverExternalPackages: ['square'] enforces this.

export const squareClient = new SquareClient({
  token: process.env.SQUARE_ACCESS_TOKEN,
  environment:
    process.env.SQUARE_ENVIRONMENT === 'production'
      ? SquareEnvironment.Production
      : SquareEnvironment.Sandbox,
})

export const LOCATION_IDS = {
  marshall:    process.env.SQUARE_LOCATION_ID_MARSHALL   ?? '',
  battleCreek: process.env.SQUARE_LOCATION_ID_BATTLE_CREEK ?? '',
} as const
