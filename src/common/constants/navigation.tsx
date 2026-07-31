import type { Dictionary } from '@/common/locale/dictionaries/ru';
import { STAFF_ROLES, type StaffRole } from '@/common/types/staff';
import {
  CalendarIcon,
  DashboardIcon,
  PatientsIcon,
  SettingsIcon,
  StaffIcon,
  ToothIcon,
  WalletIcon,
} from '@/components/icons/icons';

export type NavItem = {
  id: string;
  labelKey: keyof Dictionary['nav'];
  href: string;
  icon: React.ReactNode;
  badgeCount?: number;
  /** Restricts the item to these roles; omit to show it to everyone. */
  roles?: StaffRole[];
};

// A doctor only ever works their own schedule/patients — the clinic-wide
// dashboard and settings aren't theirs to see.
const NON_DOCTOR_ROLES = STAFF_ROLES.filter((role) => role !== 'doctor');

export const NAV_ITEMS: NavItem[] = [
  {
    id: 'dashboard',
    labelKey: 'dashboard',
    href: '/',
    icon: <DashboardIcon />,
    roles: NON_DOCTOR_ROLES,
  },
  {
    id: 'appointments',
    labelKey: 'appointments',
    href: '/appointments',
    icon: <CalendarIcon />,
  },
  { id: 'patients', labelKey: 'patients', href: '/patients', icon: <PatientsIcon /> },
  {
    id: 'treatment-plans',
    labelKey: 'treatmentPlans',
    href: '/treatment-plans',
    icon: <ToothIcon />,
  },
  { id: 'staff', labelKey: 'staff', href: '/staff', icon: <StaffIcon /> },
  {
    id: 'my-schedule',
    labelKey: 'mySchedule',
    href: '/my-schedule',
    icon: <CalendarIcon />,
    roles: ['doctor'],
  },
  {
    id: 'finance',
    labelKey: 'finance',
    href: '/finance',
    icon: <WalletIcon />,
    roles: ['owner', 'admin', 'accountant'],
  },
  {
    id: 'settings',
    labelKey: 'settings',
    href: '/settings',
    icon: <SettingsIcon />,
    roles: NON_DOCTOR_ROLES,
  },
];

export const getNavItemByPathname = (pathname: string): NavItem => {
  const match = NAV_ITEMS.find((item) => item.href !== '/' && pathname.startsWith(item.href));

  return match ?? NAV_ITEMS[0];
};
