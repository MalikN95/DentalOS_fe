export type PaymentMethod = 'cash' | 'card' | 'transfer' | 'gift_certificate' | 'membership';

export type InvoiceStatus = 'pending' | 'partially_paid' | 'paid' | 'refunded' | 'cancelled';

export type ApiInvoiceItem = {
  id: string;
  serviceId: string | null;
  title: string;
  quantity: number;
  price: string;
  amount: string;
};

export type ApiPayment = {
  id: string;
  invoiceId: string;
  method: PaymentMethod;
  amount: string;
  giftCertificateId: string | null;
  receiptNumber: string | null;
  createdAt: string;
};

export type ApiInvoicePatient = {
  firstName: string;
  lastName: string;
};

export type ApiInvoice = {
  id: string;
  patientId: string;
  patient: ApiInvoicePatient;
  appointmentId: string | null;
  number: string;
  status: InvoiceStatus;
  subtotal: string;
  discountAmount: string;
  total: string;
  createdAt: string;
  items: ApiInvoiceItem[];
};

export type ApiInvoiceWithPayments = ApiInvoice & {
  payments: ApiPayment[];
};

export type CreateInvoiceItemPayload = {
  serviceId?: string;
  title?: string;
  quantity: number;
  price?: number;
};

export type CreateInvoicePayload = {
  patientId: string;
  appointmentId?: string;
  items: CreateInvoiceItemPayload[];
};

export type CreatePaymentPayload = {
  invoiceId: string;
  method: PaymentMethod;
  amount: number;
  receiptNumber?: string;
};

export type ListInvoicesParams = {
  page: number;
  limit: number;
  status?: InvoiceStatus;
  from?: string;
  to?: string;
};
