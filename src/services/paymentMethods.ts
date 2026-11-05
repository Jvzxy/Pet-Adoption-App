export type PaymentMethod = 'cod' | 'xendit_card' | 'xendit_gcash' | 'xendit_maya';

export const isXenditEnabled = process.env.EXPO_PUBLIC_XENDIT_ENABLED === 'true';

export function getPaymentMethodLabel(method: PaymentMethod): string {
  switch (method) {
    case 'xendit_card':
      return 'Card';
    case 'xendit_gcash':
      return 'GCash';
    case 'xendit_maya':
      return 'Maya';
    default:
      return 'Cash on delivery';
  }
}
