export type UpdateOrderDto = {
  paymentMethod?: 'pix' | 'cartao' | 'dinheiro';
  status?: 'pago' | 'aberto' | 'cancelado';
};
