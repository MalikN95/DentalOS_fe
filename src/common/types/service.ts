export type ApiServiceOption = {
  id: string;
  name: string;
  price: string;
  durationMinutes: number;
};

export type ServiceCategoryOption = {
  id: string;
  name: string;
};

export type ApiService = {
  id: string;
  categoryId: string | null;
  category: ServiceCategoryOption | null;
  name: string;
  price: string;
  durationMinutes: number;
  description: string | null;
  preparation: string | null;
  isActive: boolean;
  acceptsOnlineBooking: boolean;
};

export type CreateServicePayload = {
  categoryId?: string | null;
  name: string;
  price: string;
  durationMinutes: number;
  description?: string | null;
  preparation?: string | null;
  isActive?: boolean;
  acceptsOnlineBooking?: boolean;
};

export type UpdateServicePayload = Partial<CreateServicePayload>;

export type ListServicesParams = {
  page: number;
  limit: number;
  categoryId?: string;
  search?: string;
};
