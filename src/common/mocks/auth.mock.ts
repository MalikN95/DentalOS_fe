import { AuthUser } from '@/store/slices/auth/auth.slice';

export const MOCK_USER: AuthUser = {
  id: 'u-1',
  clinicId: 'c-1',
  email: 'admin@smile.clinic',
  firstName: 'Алексей',
  lastName: 'Ковалёв',
  role: 'admin',
};

export const MOCK_ACCESS_TOKEN = 'mock-access-token';

export const MOCK_CLINIC_NAME = 'Smile Clinic';
