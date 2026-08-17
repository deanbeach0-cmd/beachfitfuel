import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { squareClient } from '@/lib/square'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type UpsertRow = {
  location_id: string
  square_item_id: string
  square_category_id: string | null
  name: string
  description: string | null
  price: number
  image_url: string | null
  image_urls: string[] | null
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const syncSecret = process.env.SYNC_SECRET

  if (!syncSecret || authHeader !== `Bearer ${syncSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get Marshall's Supabase location ID
    const { data: location, error: locationError } = await supabaseAdmin
      .from('locations')
      .select('id')
      .eq('slug', 'marshall')
      .single()

    if (locationError || !location) {
      return NextResponse.json(
        { error: 'Marshall location not found in Supabase' },
        { status: 500 }
      )
    }

    // Fetch ITEM, CATEGORY, MODIFIER_LIST and MODIFIER catalog objects together
    // — Page is AsyncIterable, handles pagination automatically
    const allObjects: Record<string, unknown>[] = []

    const page = await squareClient.catalog.list({ types: 'ITEM,CATEGORY,MODIFIER_LIST,MODIFIER' })
    for await (const obj of page) {
      allObjects.push(obj as unknown as Record<string, unknown>)
    }

    const squareCategories = allObjects.filter((o) => o.type === 'CATEGORY' && !o.isDeleted)
    const squareModifierLists = allObjects.filter((o) => o.type === 'MODIFIER_LIST' && !o.isDeleted)
    const squareModifiers = allObjects.filter((o) => o.type === 'MODIFIER' && !o.isDeleted)
    const squareItems = allObjects.filter(
      (o) => o.type === 'ITEM' && !o.isDeleted && !(o.itemData as Record<string, unknown> | undefined)?.isArchived
    )

    // --- Sync categories first. square_categories IS the site's category
    // taxonomy — is_visible/emoji/color are owned by /admin/categories and
    // never overwritten here, only square_category_name is kept in sync. ---
    const categoryRows = squareCategories
      .filter((c) => typeof c.id === 'string')
      .map((c) => ({
        square_category_id: c.id as string,
        square_category_name:
          ((c.categoryData as Record<string, unknown> | undefined)?.name as string | undefined) ?? 'Unnamed Category',
      }))

    const { data: existingCategories } = await supabaseAdmin
      .from('square_categories')
      .select('square_category_id')

    const knownCategoryIds = new Set((existingCategories ?? []).map((row) => row.square_category_id))

    const categoriesToInsert = categoryRows.filter((c) => !knownCategoryIds.has(c.square_category_id))
    const categoriesToUpdate = categoryRows.filter((c) => knownCategoryIds.has(c.square_category_id))

    if (categoriesToInsert.length > 0) {
      const { error } = await supabaseAdmin.from('square_categories').insert(categoriesToInsert)
      if (error) throw new Error(`Category insert failed: ${error.message}`)
    }

    for (const c of categoriesToUpdate) {
      const { error } = await supabaseAdmin
        .from('square_categories')
        .update({ square_category_name: c.square_category_name, updated_at: new Date().toISOString() })
        .eq('square_category_id', c.square_category_id)
      if (error) throw new Error(`Category update failed for "${c.square_category_name}": ${error.message}`)
    }

    // --- Sync modifier lists (e.g. "To Go Pack Flavors") — raw data only,
    // which list is actually used as an item's flavor picker is an admin choice. ---
    const modifierListRows = squareModifierLists
      .filter((l) => typeof l.id === 'string')
      .map((l) => ({
        square_modifier_list_id: l.id as string,
        name: ((l.modifierListData as Record<string, unknown> | undefined)?.name as string | undefined) ?? 'Unnamed List',
      }))

    const { data: existingModifierLists } = await supabaseAdmin
      .from('square_modifier_lists')
      .select('square_modifier_list_id')

    const knownModifierListIds = new Set((existingModifierLists ?? []).map((row) => row.square_modifier_list_id))
    const modifierListsToInsert = modifierListRows.filter((l) => !knownModifierListIds.has(l.square_modifier_list_id))
    const modifierListsToUpdate = modifierListRows.filter((l) => knownModifierListIds.has(l.square_modifier_list_id))

    if (modifierListsToInsert.length > 0) {
      const { error } = await supabaseAdmin.from('square_modifier_lists').insert(modifierListsToInsert)
      if (error) throw new Error(`Modifier list insert failed: ${error.message}`)
    }
    for (const l of modifierListsToUpdate) {
      const { error } = await supabaseAdmin
        .from('square_modifier_lists')
        .update({ name: l.name, updated_at: new Date().toISOString() })
        .eq('square_modifier_list_id', l.square_modifier_list_id)
      if (error) throw new Error(`Modifier list update failed for "${l.name}": ${error.message}`)
    }

    // --- Sync individual modifiers (the flavor options themselves) — full
    // replace is safe since these have no site-owned fields to preserve. ---
    const modifierRows = squareModifiers
      .filter((m) => typeof m.id === 'string')
      .map((m) => {
        const data = m.modifierData as Record<string, unknown> | undefined
        const priceMoney = data?.priceMoney as Record<string, unknown> | undefined
        return {
          square_modifier_id: m.id as string,
          square_modifier_list_id: (data?.modifierListId as string | undefined) ?? '',
          name: (data?.name as string | undefined) ?? 'Unnamed',
          price_cents: priceMoney?.amount ? Number(priceMoney.amount) : 0,
          display_order: (data?.ordinal as number | undefined) ?? 0,
        }
      })
      .filter((m) => m.square_modifier_list_id)

    if (modifierRows.length > 0) {
      const { error } = await supabaseAdmin.from('square_modifiers').upsert(modifierRows, { onConflict: 'square_modifier_id' })
      if (error) throw new Error(`Modifier upsert failed: ${error.message}`)
    }

    if (squareItems.length === 0) {
      return NextResponse.json({
        success: true,
        added: 0,
        updated: 0,
        total: 0,
        items: [],
        categories: { added: categoriesToInsert.length, updated: categoriesToUpdate.length },
      })
    }

    // Map Square items → Supabase rows (only Square-owned fields)
    const rows: (UpsertRow & {
      modifierListIds: string[]
      variations: { square_variation_id: string; name: string; price_cents: number; display_order: number }[]
    })[] = squareItems
      .filter((item) => typeof item.id === 'string')
      .map((item) => {
        const itemData = item.itemData as Record<string, unknown> | undefined
        const variations = (itemData?.variations as Record<string, unknown>[] | undefined) ?? []

        const regularVariation =
          variations.find(
            (v) =>
              (v.itemVariationData as Record<string, unknown> | undefined)?.pricingType ===
              'FIXED_PRICING'
          ) ?? variations[0]

        const priceMoney = (
          (regularVariation?.itemVariationData as Record<string, unknown> | undefined)
            ?.priceMoney as Record<string, unknown> | undefined
        )
        const price = priceMoney?.amount ? Number(priceMoney.amount) / 100 : 0

        // Prefer ecomImageUris (already-hosted URLs) over Square catalog image IDs.
        // Some items have several photos in Square — keep the full set for the
        // detail-page gallery, not just the first one.
        const ecomImageUris = itemData?.ecomImageUris as string[] | undefined
        const imageUrl = ecomImageUris?.[0] ?? null
        const imageUrls = ecomImageUris && ecomImageUris.length > 0 ? ecomImageUris : null

        // reportingCategory is Square's concept of an item's primary category;
        // fall back to the first entry in `categories` if it's unset.
        const reportingCategory = itemData?.reportingCategory as Record<string, unknown> | undefined
        const categories = itemData?.categories as Record<string, unknown>[] | undefined
        const squareCategoryId =
          (reportingCategory?.id as string | undefined) ?? (categories?.[0]?.id as string | undefined) ?? null

        const modifierListInfo = (itemData?.modifierListInfo as Record<string, unknown>[] | undefined) ?? []
        const modifierListIds = modifierListInfo
          .map((m) => m.modifierListId as string | undefined)
          .filter((id): id is string => !!id)

        const itemVariations = variations
          .filter((v) => typeof v.id === 'string')
          .map((v) => {
            const vd = v.itemVariationData as Record<string, unknown> | undefined
            const vPriceMoney = vd?.priceMoney as Record<string, unknown> | undefined
            return {
              square_variation_id: v.id as string,
              name: (vd?.name as string | undefined) ?? 'Regular',
              price_cents: vPriceMoney?.amount ? Number(vPriceMoney.amount) : 0,
              display_order: (vd?.ordinal as number | undefined) ?? 0,
            }
          })

        return {
          location_id: location.id as string,
          square_item_id: item.id as string,
          square_category_id: squareCategoryId,
          name: (itemData?.name as string | undefined) ?? 'Unnamed Item',
          description:
            (itemData?.descriptionPlaintext as string | undefined) ??
            (itemData?.description as string | undefined) ??
            null,
          price,
          image_url: imageUrl,
          image_urls: imageUrls,
          modifierListIds,
          variations: itemVariations,
        }
      })

    // Fetch existing rows to distinguish adds from updates
    const { data: existing } = await supabaseAdmin
      .from('menu_items')
      .select('id, square_item_id')
      .not('square_item_id', 'is', null)

    const existingMap = new Map<string, string>()
    for (const row of existing ?? []) {
      if (row.square_item_id) existingMap.set(row.square_item_id, row.id)
    }

    const toInsert = rows.filter((r) => !existingMap.has(r.square_item_id))
    const toUpdate = rows.filter((r) => existingMap.has(r.square_item_id))

    // New items default to available; visibility is controlled entirely by
    // /admin/categories (category-level) and /admin/categories item toggles
    // (item-level is_available) from here on.
    if (toInsert.length > 0) {
      const insertPayload = toInsert.map((r) => ({
        location_id: r.location_id,
        square_item_id: r.square_item_id,
        square_category_id: r.square_category_id,
        name: r.name,
        description: r.description,
        price: r.price,
        image_url: r.image_url,
        image_urls: r.image_urls,
        is_available: true,
      }))
      const { error: insertError } = await supabaseAdmin.from('menu_items').insert(insertPayload)
      if (insertError) throw new Error(`Insert failed: ${insertError.message}`)

      // Re-fetch to pick up the newly assigned ids for the just-inserted items
      const { data: refreshed } = await supabaseAdmin
        .from('menu_items')
        .select('id, square_item_id')
        .in('square_item_id', toInsert.map((r) => r.square_item_id))
      for (const row of refreshed ?? []) {
        if (row.square_item_id) existingMap.set(row.square_item_id, row.id)
      }
    }

    // Update existing items — only Square-owned fields. is_available is
    // site-owned (admin can hide an item) and must never be reset here.
    for (const item of toUpdate) {
      const rowId = existingMap.get(item.square_item_id)!
      const { error: updateError } = await supabaseAdmin
        .from('menu_items')
        .update({
          name: item.name,
          description: item.description,
          price: item.price,
          image_url: item.image_url,
          image_urls: item.image_urls,
          square_category_id: item.square_category_id,
        })
        .eq('id', rowId)

      if (updateError) {
        throw new Error(`Update failed for "${item.name}": ${updateError.message}`)
      }
    }

    // --- Sync each item's modifier-list attachments and variations (raw
    // data — full replace per item keeps it accurate as Square changes). ---
    const menuItemIds = rows.map((r) => existingMap.get(r.square_item_id)).filter((id): id is string => !!id)

    if (menuItemIds.length > 0) {
      await supabaseAdmin.from('menu_item_modifier_lists').delete().in('menu_item_id', menuItemIds)
      await supabaseAdmin.from('square_item_variations').delete().in('menu_item_id', menuItemIds)
    }

    const modifierLinkRows = rows.flatMap((r) => {
      const menuItemId = existingMap.get(r.square_item_id)
      if (!menuItemId) return []
      return r.modifierListIds.map((square_modifier_list_id) => ({ menu_item_id: menuItemId, square_modifier_list_id }))
    })
    if (modifierLinkRows.length > 0) {
      const { error } = await supabaseAdmin.from('menu_item_modifier_lists').insert(modifierLinkRows)
      if (error) throw new Error(`Modifier link insert failed: ${error.message}`)
    }

    const variationRows = rows.flatMap((r) => {
      const menuItemId = existingMap.get(r.square_item_id)
      if (!menuItemId || r.variations.length <= 1) return []
      return r.variations.map((v) => ({ ...v, menu_item_id: menuItemId }))
    })
    if (variationRows.length > 0) {
      const { error } = await supabaseAdmin.from('square_item_variations').insert(variationRows)
      if (error) throw new Error(`Variation insert failed: ${error.message}`)
    }

    return NextResponse.json({
      success: true,
      added: toInsert.length,
      updated: toUpdate.length,
      total: rows.length,
      categories: { added: categoriesToInsert.length, updated: categoriesToUpdate.length },
      modifierLists: modifierListRows.length,
      modifiers: modifierRows.length,
      items: rows.map((r) => ({
        name: r.name,
        squareId: r.square_item_id,
        price: r.price,
        status: existingMap.has(r.square_item_id) ? 'updated' : 'added',
      })),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
