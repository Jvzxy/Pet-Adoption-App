export type PaymentMethod = 'cod' | 'paymongo_card' | 'paymongo_gcash' | 'paymongo_maya';

export const isPayMongoEnabled = process.env.EXPO_PUBLIC_PAYMONGO_ENABLED === 'true';

export function getPaymentMethodLabel(method: PaymentMethod): string {
  switch (method) {
    case 'paymongo_card':
      return 'Card';
    case 'paymongo_gcash':
      return 'GCash';
    case 'paymongo_maya':
      return 'Maya';
    default:
      return 'Cash on delivery';
  }
}
