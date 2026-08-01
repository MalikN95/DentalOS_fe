export type ReviewStatus = 'pending' | 'published' | 'hidden';

export type ApiReview = {
  id: string;
  rating: number;
  comment: string | null;
  status: ReviewStatus;
  featured: boolean;
  showInBooking: boolean;
  createdAt: string;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
  };
  doctorProfile: {
    id: string;
    user: {
      firstName: string;
      lastName: string;
    };
  };
};

export type ListReviewsParams = {
  page: number;
  limit: number;
  status?: ReviewStatus;
  doctorProfileId?: string;
  patientId?: string;
  featured?: boolean;
  showInBooking?: boolean;
};
