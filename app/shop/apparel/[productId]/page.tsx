export default function ProductPage({ params }: { params: { productId: string } }) {
  return <main className="p-8"><h1 className="font-display text-4xl">Product {params.productId}</h1></main>
}
