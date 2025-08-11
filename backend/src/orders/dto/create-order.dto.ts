export type CreateOrderItemDto = { productId: number; quantity: number };
export type CreateOrderDto = {
  items: CreateOrderItemDto[];
  paymentMethod: 'pix' | 'cartao' | 'dinheiro';
  status?: 'pago' | 'aberto' | 'cancelado'; // opcional; default 'pago'
};
