import type { PaymentMethod } from '@/common/types/finance';

export type RevenueByDayItem = {
  date: string;
  amount: number;
};

export type RevenueByMethodItem = {
  method: PaymentMethod;
  amount: number;
};

export type RevenueAnalytics = {
  totalPaid: number;
  totalRefunded: number;
  net: number;
  byDay: RevenueByDayItem[];
  byMethod: RevenueByMethodItem[];
};
