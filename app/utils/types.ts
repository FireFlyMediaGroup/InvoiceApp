export type Currency = 'USD' | 'EUR' | 'GBP';

export interface CurrencyAmount {
  amount: number;
  currency: Currency;
}

export interface FormState {
  status: 'idle' | 'error' | 'success';
  message?: string;
}

export interface InvoiceFormData {
  total: number;
  currency: Currency;
  invoiceItemRate: number;
}
