export type ApiNotification = {
  id: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
};

export type NotificationList = {
  items: ApiNotification[];
  total: number;
  unreadCount: number;
  page: number;
  limit: number;
};
