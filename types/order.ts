export interface OrderLineItem {
  catalogObjectId: string
  quantity: string
  note?: string
  modifiers?: { catalogObjectId: string }[]
}

export interface CreateOrderPayload {
  locationId: string
  lineItems: OrderLineItem[]
  customerNote?: string
}

export interface OrderMoney {
  amount: number
  currency: string
}

export interface OrderResponse {
  orderId: string
  totalMoney: OrderMoney
  state: string
  createdAt: string
}
