type IconProps = {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
};

const createIcon = (path: React.ReactNode, viewBox = '0 0 24 24') => {
  const Icon = ({ size = 20, className, style }: IconProps) => (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
    >
      {path}
    </svg>
  );
  return Icon;
};

export const DashboardIcon = createIcon(
  <>
    <rect x="3" y="3" width="7" height="9" rx="1.5" />
    <rect x="14" y="3" width="7" height="5" rx="1.5" />
    <rect x="14" y="12" width="7" height="9" rx="1.5" />
    <rect x="3" y="16" width="7" height="5" rx="1.5" />
  </>,
);

export const CalendarIcon = createIcon(
  <>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M8 3v4M16 3v4M3 10h18" />
  </>,
);

export const PatientsIcon = createIcon(
  <>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2.5 20c.8-3.2 3.4-5 6.5-5s5.7 1.8 6.5 5" />
    <circle cx="17" cy="9" r="2.5" />
    <path d="M15.5 15.2c2.7.2 4.9 1.7 5.5 4.3" />
  </>,
);

export const ToothIcon = createIcon(
  <path d="M12 5.5C10.5 4 8.5 3 7 3 4.5 3 3 5 3 7.5c0 4 2 6 2.6 9.3.3 1.8.9 4.2 2.2 4.2 1.4 0 1.3-2.6 1.7-4.3.3-1.3 1.1-2.2 2.5-2.2s2.2.9 2.5 2.2c.4 1.7.3 4.3 1.7 4.3 1.3 0 1.9-2.4 2.2-4.2C19 13.5 21 11.5 21 7.5 21 5 19.5 3 17 3c-1.5 0-3.5 1-5 2.5Z" />,
);

export const StaffIcon = createIcon(
  <>
    <circle cx="12" cy="7" r="3.5" />
    <path d="M5 20c.9-3.6 3.7-5.5 7-5.5s6.1 1.9 7 5.5" />
  </>,
);

export const SettingsIcon = createIcon(
  <>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.03 1.56V21a2 2 0 1 1-4 0v-.09A1.7 1.7 0 0 0 8.98 19.4a1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.56-1.03H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.6 8.98a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34H9a1.7 1.7 0 0 0 1.03-1.56V3a2 2 0 1 1 4 0v.09c0 .68.4 1.3 1.03 1.56a1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87V9c.26.63.88 1.03 1.56 1.03H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.56 1.03Z" />
  </>,
);

export const BellIcon = createIcon(
  <>
    <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.7 21a2 2 0 0 1-3.4 0" />
  </>,
);

export const SearchIcon = createIcon(
  <>
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
  </>,
);

export const LogoutIcon = createIcon(
  <>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="M16 17l5-5-5-5M21 12H9" />
  </>,
);

export const PlusIcon = createIcon(<path d="M12 5v14M5 12h14" />);

export const MinusIcon = createIcon(<path d="M5 12h14" />);

export const ChevronDownIcon = createIcon(<path d="m6 9 6 6 6-6" />);

export const ChevronLeftIcon = createIcon(<path d="m15 6-6 6 6 6" />);

export const ChevronRightIcon = createIcon(<path d="m9 6 6 6-6 6" />);

export const PanelLeftIcon = createIcon(
  <>
    <rect x="3" y="4" width="18" height="16" rx="2.5" />
    <path d="M9.5 4v16" />
  </>,
);

export const MenuIcon = createIcon(
  <>
    <path d="M4 6h16" />
    <path d="M4 12h16" />
    <path d="M4 18h16" />
  </>,
);

export const CloseIcon = createIcon(<path d="m6 6 12 12M18 6 6 18" />);

export const WalletIcon = createIcon(
  <>
    <path d="M3 7a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v1h1a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
    <path d="M16 13.5h.01" />
  </>,
);

export const XCircleIcon = createIcon(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="m9.5 9.5 5 5M14.5 9.5l-5 5" />
  </>,
);

export const EyeIcon = createIcon(
  <>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </>,
);

export const EyeOffIcon = createIcon(
  <>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c6.5 0 10 8 10 8a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3.5 8 10 8a9.74 9.74 0 0 0 5.39-1.61" />
    <path d="M2 2l20 20" />
  </>,
);

export const MailIcon = createIcon(
  <>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3.5 7 8.5 6 8.5-6" />
  </>,
);

export const LockIcon = createIcon(
  <>
    <rect x="4" y="10" width="16" height="11" rx="2" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    <circle cx="12" cy="15.5" r="1.2" />
  </>,
);

export const ShieldIcon = createIcon(
  <>
    <path d="M12 3l7 3v5.5c0 4.4-2.9 8.1-7 9.5-4.1-1.4-7-5.1-7-9.5V6l7-3Z" />
    <path d="m9 12 2.2 2.2L15.5 10" />
  </>,
);

export const FileTextIcon = createIcon(
  <>
    <path d="M7 3h7l4 4v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
    <path d="M14 3v4h4" />
    <path d="M8.5 12.5h7M8.5 16h7M8.5 9h3" />
  </>,
);

export const ChartIcon = createIcon(
  <>
    <path d="M4 20V4" />
    <path d="M4 20h16" />
    <path d="m8 16 3.5-4.5 3 2.5L20 7" />
  </>,
);

export const MessageIcon = createIcon(
  <path d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9l-5 4v-4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" />,
);

export const ZapIcon = createIcon(<path d="M13 3 4 14h6l-1 7 9-11h-6l1-7Z" />);

export const ExpandIcon = createIcon(
  <>
    <path d="M9 3H4v5" />
    <path d="M15 3h5v5" />
    <path d="M9 21H4v-5" />
    <path d="M15 21h5v-5" />
  </>,
);

export const EditIcon = createIcon(
  <>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </>,
);

export const RefreshIcon = createIcon(
  <>
    <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
    <path d="M3 21v-5h5" />
  </>,
);

export const CheckIcon = createIcon(<path d="M20 6 9 17l-5-5" />);

export const TagIcon = createIcon(
  <>
    <path d="M12.59 2.59 3 12.17V21h8.83l9.58-9.59a2 2 0 0 0 0-2.82l-6.4-6.4a2 2 0 0 0-2.42 0Z" />
    <circle cx="8.5" cy="8.5" r="1.5" />
  </>,
);

export const InfoIcon = createIcon(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5" />
    <path d="M12 8h.01" />
  </>,
);

export const PhoneIcon = createIcon(
  <path d="M6.6 10.8a15.6 15.6 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25c1.1.36 2.28.56 3.5.56a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.6 21 3 13.4 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.22.2 2.4.56 3.5a1 1 0 0 1-.25 1L6.6 10.8Z" />,
);

export const UserPlusIcon = createIcon(
  <>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2.5 20c.8-3.2 3.4-5 6.5-5s5.7 1.8 6.5 5" />
    <path d="M19 8v5M16.5 10.5h5" />
  </>,
);

export const AlertTriangleIcon = createIcon(
  <>
    <path d="M12 3.5 2.5 20h19L12 3.5Z" />
    <path d="M12 10v4" />
    <path d="M12 17h.01" />
  </>,
);

export const TrashIcon = createIcon(
  <>
    <path d="M3 6h18" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </>,
);

type LogoProps = {
  height?: number;
  className?: string;
  style?: React.CSSProperties;
};

// App wordmark: filled tooth glyph + "OS". Uses currentColor so it adapts to
// light/dark contexts (see public/logo-default.svg for the fixed-color asset).
export const Logo = ({ height = 24, className, style }: LogoProps) => (
  <svg
    height={height}
    viewBox="0 0 90 24"
    fill="none"
    className={className}
    style={style}
    role="img"
    aria-label="DentalOS"
  >
    <path
      d="M12 5.5C10.5 4 8.5 3 7 3 4.5 3 3 5 3 7.5c0 4 2 6 2.6 9.3.3 1.8.9 4.2 2.2 4.2 1.4 0 1.3-2.6 1.7-4.3.3-1.3 1.1-2.2 2.5-2.2s2.2.9 2.5 2.2c.4 1.7.3 4.3 1.7 4.3 1.3 0 1.9-2.4 2.2-4.2C19 13.5 21 11.5 21 7.5 21 5 19.5 3 17 3c-1.5 0-3.5 1-5 2.5Z"
      fill="currentColor"
    />
    <text
      x="28"
      y="18.5"
      fontFamily="Arial, Helvetica, sans-serif"
      fontWeight="800"
      fontSize="18"
      letterSpacing="0.3"
      fill="currentColor"
    >
      OS
    </text>
  </svg>
);
