import {
  CalendarIcon,
  DashboardIcon,
  PatientsIcon,
  SettingsIcon,
  StaffIcon,
  ToothIcon,
} from '@/components/icons/icons';
import { SidebarItem } from '@/components/layout/Sidebar/Sidebar';

export const NAV_ITEMS: SidebarItem[] = [
  { id: 'dashboard', label: 'Дашборд', href: '/', icon: <DashboardIcon /> },
  {
    id: 'appointments',
    label: 'Записи',
    href: '/appointments',
    icon: <CalendarIcon />,
    badgeCount: 3,
  },
  { id: 'patients', label: 'Пациенты', href: '/patients', icon: <PatientsIcon /> },
  { id: 'treatment-plans', label: 'Планы лечения', href: '/treatment-plans', icon: <ToothIcon /> },
  { id: 'staff', label: 'Сотрудники', href: '/staff', icon: <StaffIcon /> },
  { id: 'settings', label: 'Настройки', href: '/settings', icon: <SettingsIcon /> },
];

export const getNavItemByPathname = (pathname: string): SidebarItem => {
  const match = NAV_ITEMS.find((item) => item.href !== '/' && pathname.startsWith(item.href));

  return match ?? NAV_ITEMS[0];
};
