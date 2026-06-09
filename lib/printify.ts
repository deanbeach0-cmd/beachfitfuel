const PRINTIFY_BASE = 'https://api.printify.com/v1'

async function printifyFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${PRINTIFY_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${process.env.PRINTIFY_API_TOKEN!}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!res.ok) {
    throw new Error(`Printify API error ${res.status}: ${await res.text()}`)
  }

  return res.json() as Promise<T>
}

export const printify = {
  getProducts: () =>
    printifyFetch<{ data: unknown[] }>(
      `/shops/${process.env.PRINTIFY_SHOP_ID}/products.json`,
      { next: { revalidate: 3600 } } as RequestInit
    ),

  getProduct: (productId: string) =>
    printifyFetch<unknown>(
      `/shops/${process.env.PRINTIFY_SHOP_ID}/products/${productId}.json`,
      { next: { revalidate: 3600 } } as RequestInit
    ),

  createOrder: (body: unknown) =>
    printifyFetch<unknown>(
      `/shops/${process.env.PRINTIFY_SHOP_ID}/orders.json`,
      { method: 'POST', body: JSON.stringify(body) }
    ),
}
