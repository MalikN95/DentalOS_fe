export type RevenueByDayItem = {
  date: string;
  amount: number;
};

export type RevenueAnalytics = {
  totalPaid: number;
  totalRefunded: number;
  net: number;
  byDay: RevenueByDayItem[];
};
