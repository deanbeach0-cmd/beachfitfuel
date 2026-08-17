import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface MenuItemPatchBody {
  id?: string
  is_available?: boolean
  flavor_source_type?: 'modifier' | 'variation' | null
  flavor_modifier_list_id?: string | null
  required_flavor_count?: number | null
}

export async function PATCH(request: NextRequest) {
  const body = (await request.json()) as MenuItemPatchBody
  const { id, is_available, flavor_source_type, flavor_modifier_list_id, required_flavor_count } = body

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 })
  }

  const update: Record<string, unknown> = {}
  if (is_available !== undefined) update.is_available = is_available
  if (flavor_source_type !== undefined) update.flavor_source_type = flavor_source_type
  if (flavor_modifier_list_id !== undefined) update.flavor_modifier_list_id = flavor_modifier_list_id
  if (required_flavor_count !== undefined) update.required_flavor_count = required_flavor_count

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
  }

  const { error } = await supabaseAdmin
    .from('menu_items')
    .update(update)
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
