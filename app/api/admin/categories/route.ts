import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function PATCH(request: NextRequest) {
  const body = (await request.json()) as {
    square_category_id?: string
    emoji?: string | null
    color?: string | null
    is_visible?: boolean
  }
  const { square_category_id, emoji, color, is_visible } = body

  if (!square_category_id) {
    return NextResponse.json({ error: 'square_category_id is required' }, { status: 400 })
  }

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (emoji !== undefined) update.emoji = emoji
  if (color !== undefined) update.color = color
  if (is_visible !== undefined) update.is_visible = is_visible

  const { error } = await supabaseAdmin
    .from('square_categories')
    .update(update)
    .eq('square_category_id', square_category_id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
