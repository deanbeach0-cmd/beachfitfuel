'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ShoppingBag, Check } from 'lucide-react'
import { useCartStore } from '@/lib/cart-store'
import { enabledVariants, variantImage } from '@/lib/printful'
import type { PrintfulProduct, PrintfulSyncVariant } from '@/types/shop'

interface Props {
  product: PrintfulProduct
}

export function ProductDetail({ product }: Props) {
  const addItem = useCartStore((s) => s.addItem)
  const variants = enabledVariants(product)

  // Unique colors and sizes derived from variants
  const colors = Array.from(new Set(variants.map((v) => v.color).filter(Boolean)))
  const allSizes = Array.from(new Set(variants.map((v) => v.size).filter(Boolean)))

  const [selectedColor, setSelectedColor] = useState<string>(colors[0] ?? '')
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  // Sizes available for the currently selected color
  const sizesForColor = allSizes.filter((size) =>
    variants.some((v) => v.color === selectedColor && v.size === size)
  )

  // Reset size if it's not available in the new color selection
  const effectiveSize = sizesForColor.includes(selectedColor) ? selectedSize : (sizesForColor[0] ?? '')

  // The matching variant for current selection
  const selectedVariant: PrintfulSyncVariant | undefined = variants.find(
    (v) => v.color === selectedColor && v.size === (selectedSize || sizesForColor[0])
  ) ?? variants[0]

  const activeImage = selectedVariant ? variantImage(selectedVariant) : (product.sync_product.thumbnail_url ?? '')

  // Gallery: one image per unique color (first variant per color)
  const galleryVariants = colors
    .map((color) => variants.find((v) => v.color === color))
    .filter((v): v is PrintfulSyncVariant => v !== undefined)

  function handleColorChange(color: string) {
    setSelectedColor(color)
    const firstSizeForColor = allSizes.find((size) =>
      variants.some((v) => v.color === color && v.size === size)
    )
    setSelectedSize(firstSizeForColor ?? '')
  }

  function handleAddToCart() {
    if (!selectedVariant) return
    addItem({
      productId: String(product.sync_product.id),
      variantId: selectedVariant.id,
      quantity,
      price: Math.round(parseFloat(selectedVariant.retail_price) * 100),
      name: `${product.sync_product.name} — ${selectedVariant.color}${selectedVariant.size ? ` / ${selectedVariant.size}` : ''}`,
      imageUrl: activeImage || variantImage(selectedVariant),
      type: 'apparel',
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const price = selectedVariant
    ? `$${parseFloat(selectedVariant.retail_price).toFixed(2)}`
    : '—'

  const currentSize = selectedSize || sizesForColor[0] || effectiveSize

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      {/* Image */}
      <div>
        <div className="aspect-square relative rounded-2xl overflow-hidden shadow-sm mb-3"
          style={{ background: 'linear-gradient(135deg, #FF7B9D22 0%, #EC8A1E22 100%)' }}>
          {activeImage ? (
            <Image
              src={activeImage}
              alt={product.sync_product.name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-8xl">👕</span>
            </div>
          )}
        </div>
        {galleryVariants.length > 1 && (
          <div className="flex gap-2 flex-wrap">
            {galleryVariants.map((v) => (
              <button
                key={v.id}
                onClick={() => handleColorChange(v.color)}
                className="relative w-14 h-14 rounded-lg overflow-hidden border-2 transition-colors"
                style={{ borderColor: selectedColor === v.color ? '#FF7B9D' : 'transparent' }}
                title={v.color}
              >
                <Image src={variantImage(v)} alt={v.color} fill className="object-cover" sizes="56px" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="font-display text-3xl md:text-4xl text-dark tracking-wide mb-2">
            {product.sync_product.name}
          </h1>
          <p className="font-display text-2xl" style={{ color: '#FF7B9D' }}>
            {price}
          </p>
        </div>

        {/* Color selector */}
        {colors.length > 0 && (
          <div>
            <label className="font-body font-bold text-dark text-sm uppercase tracking-widest mb-2 block">
              Color
              {selectedColor && (
                <span className="ml-2 font-normal normal-case tracking-normal text-dark/50">
                  {selectedColor}
                </span>
              )}
            </label>
            <div className="flex flex-wrap gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => handleColorChange(color)}
                  className="px-4 py-2 rounded-lg border-2 font-body text-sm font-semibold transition-all"
                  style={
                    selectedColor === color
                      ? { borderColor: '#FF7B9D', backgroundColor: '#FF7B9D', color: 'white' }
                      : { borderColor: '#e5e7eb', color: '#2C2C2C' }
                  }
                >
                  {color}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Size selector */}
        {sizesForColor.length > 0 && (
          <div>
            <label className="font-body font-bold text-dark text-sm uppercase tracking-widest mb-2 block">
              Size
            </label>
            <div className="flex flex-wrap gap-2">
              {sizesForColor.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className="px-4 py-2 rounded-lg border-2 font-body text-sm font-semibold transition-all"
                  style={
                    currentSize === size
                      ? { borderColor: '#FF7B9D', backgroundColor: '#FF7B9D', color: 'white' }
                      : { borderColor: '#e5e7eb', color: '#2C2C2C' }
                  }
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quantity */}
        <div>
          <label className="font-body font-bold text-dark text-sm uppercase tracking-widest mb-2 block">
            Quantity
          </label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-9 h-9 rounded-full border-2 border-gray-200 font-bold text-dark hover:border-gray-400 transition-colors"
            >
              −
            </button>
            <span className="font-body font-bold text-dark w-6 text-center">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="w-9 h-9 rounded-full border-2 border-gray-200 font-bold text-dark hover:border-gray-400 transition-colors"
            >
              +
            </button>
          </div>
        </div>

        {/* Add to cart */}
        <button
          onClick={handleAddToCart}
          disabled={!selectedVariant}
          className="flex items-center justify-center gap-3 w-full py-4 rounded-full font-display tracking-widest text-white text-lg transition-all disabled:opacity-50"
          style={{ backgroundColor: added ? '#6FBDB8' : '#FF7B9D' }}
        >
          {added ? (
            <><Check className="w-5 h-5" /> ADDED TO CART</>
          ) : (
            <><ShoppingBag className="w-5 h-5" /> ADD TO CART</>
          )}
        </button>

        <p className="font-body text-dark/40 text-xs text-center">
          Ships nationwide. Printed and fulfilled by Printful.
        </p>
      </div>
    </div>
  )
}
