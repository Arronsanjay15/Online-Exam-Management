// =============================================
// ICON SET
// Small inline SVG icons used across the app.
// Inline SVGs keep the bundle dependency free and
// let every icon inherit the surrounding text colour
// through `currentColor`.
// =============================================

const defaults = {
    xmlns: "http://www.w3.org/2000/svg",
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true"
};

function createIcon(children) {
    return function Icon({ size, className, ...rest }) {
        return (
            <svg
                {...defaults}
                width={size || defaults.width}
                height={size || defaults.height}
                className={className}
                {...rest}
            >
                {children}
            </svg>
        );
    };
}

export const DashboardIcon = createIcon(
    <>
        <path d="M3 9.5 12 3l9 6.5V20a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 20z" />
        <polyline points="9 21 9 13 15 13 15 21" />
    </>
);

export const ExamIcon = createIcon(
    <>
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <line x1="8" y1="8" x2="16" y2="8" />
        <line x1="8" y1="12" x2="16" y2="12" />
        <line x1="8" y1="16" x2="13" y2="16" />
    </>
);

export const QuestionIcon = createIcon(
    <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.5 9a2.5 2.5 0 0 1 4.9.7c0 1.6-2.4 2.3-2.4 3.8" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
    </>
);

export const StudentsIcon = createIcon(
    <>
        <path d="M17 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 5 18.5V20" />
        <circle cx="11" cy="8" r="3.5" />
        <path d="M20 20v-1.5a3.5 3.5 0 0 0-2.6-3.38" />
        <path d="M15.5 4.2a3.5 3.5 0 0 1 0 7.1" />
    </>
);

export const ResultsIcon = createIcon(
    <>
        <line x1="7" y1="20" x2="7" y2="12" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="17" y1="20" x2="17" y2="9" />
    </>
);

export const SettingsIcon = createIcon(
    <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </>
);

export const LogoutIcon = createIcon(
    <>
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
    </>
);

export const SearchIcon = createIcon(
    <>
        <circle cx="11" cy="11" r="7" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </>
);

export const PlusIcon = createIcon(
    <>
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
    </>
);

export const EditIcon = createIcon(
    <>
        <path d="M11 4H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-6" />
        <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z" />
    </>
);

export const TrashIcon = createIcon(
    <>
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <line x1="10" y1="11" x2="10" y2="17" />
        <line x1="14" y1="11" x2="14" y2="17" />
    </>
);

export const ClockIcon = createIcon(
    <>
        <circle cx="12" cy="12" r="9" />
        <polyline points="12 7 12 12 15.5 14" />
    </>
);

export const CalendarIcon = createIcon(
    <>
        <rect x="3" y="4.5" width="18" height="16" rx="2" />
        <line x1="16" y1="2.5" x2="16" y2="6.5" />
        <line x1="8" y1="2.5" x2="8" y2="6.5" />
        <line x1="3" y1="10" x2="21" y2="10" />
    </>
);

export const EyeIcon = createIcon(
    <>
        <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
        <circle cx="12" cy="12" r="3" />
    </>
);

export const EyeOffIcon = createIcon(
    <>
        <path d="M17.94 17.94A10.4 10.4 0 0 1 12 19c-7 0-11-7-11-7a17.7 17.7 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.6 9.6 0 0 1 12 4c7 0 11 7 11 7a17.8 17.8 0 0 1-2.16 3.19" />
        <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
    </>
);

export const MailIcon = createIcon(
    <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <polyline points="3 7 12 13 21 7" />
    </>
);

export const PhoneIcon = createIcon(
    <>
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.2 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
    </>
);

export const UserIcon = createIcon(
    <>
        <path d="M20 21v-1.5a4.5 4.5 0 0 0-4.5-4.5h-7A4.5 4.5 0 0 0 4 19.5V21" />
        <circle cx="12" cy="7.5" r="4" />
    </>
);

export const LockIcon = createIcon(
    <>
        <rect x="4" y="11" width="16" height="10" rx="2" />
        <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </>
);

export const KeyIcon = createIcon(
    <>
        <circle cx="7.5" cy="15.5" r="4.5" />
        <path d="M10.5 12.5 20 3" />
        <path d="M17 6l3 3" />
        <path d="M14 9l3 3" />
    </>
);

export const AwardIcon = createIcon(
    <>
        <circle cx="12" cy="9" r="6" />
        <polyline points="8.5 14.5 7 22 12 19.5 17 22 15.5 14.5" />
    </>
);

export const CheckIcon = createIcon(
    <polyline points="20 6 9 17 4 12" />
);

export const XIcon = createIcon(
    <>
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </>
);

export const PrinterIcon = createIcon(
    <>
        <polyline points="7 9 7 3 17 3 17 9" />
        <path d="M6 18H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2" />
        <rect x="7" y="14" width="10" height="7" />
    </>
);

export const ArrowLeftIcon = createIcon(
    <>
        <line x1="19" y1="12" x2="5" y2="12" />
        <polyline points="12 19 5 12 12 5" />
    </>
);

export const ChevronRightIcon = createIcon(
    <polyline points="9 18 15 12 9 6" />
);

export const BellIcon = createIcon(
    <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </>
);

export const RefreshIcon = createIcon(
    <>
        <polyline points="23 4 23 10 17 10" />
        <polyline points="1 20 1 14 7 14" />
        <path d="M3.5 9a9 9 0 0 1 14.9-3.4L23 10M1 14l4.6 4.4A9 9 0 0 0 20.5 15" />
    </>
);

export const GraduationIcon = createIcon(
    <>
        <path d="M22 10 12 5 2 10l10 5 10-5z" />
        <path d="M6 12v5c3 2.5 9 2.5 12 0v-5" />
    </>
);

export const SlidersIcon = createIcon(
    <>
        <line x1="4" y1="21" x2="4" y2="14" />
        <line x1="4" y1="10" x2="4" y2="3" />
        <line x1="12" y1="21" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12" y2="3" />
        <line x1="20" y1="21" x2="20" y2="16" />
        <line x1="20" y1="12" x2="20" y2="3" />
        <line x1="1" y1="14" x2="7" y2="14" />
        <line x1="9" y1="8" x2="15" y2="8" />
        <line x1="17" y1="16" x2="23" y2="16" />
    </>
);

export const InfoIcon = createIcon(
    <>
        <circle cx="12" cy="12" r="9" />
        <line x1="12" y1="11" x2="12" y2="16" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
    </>
);

export const AlertIcon = createIcon(
    <>
        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
    </>
);

export const ClockSmallIcon = ClockIcon;

export const iconProps = defaults;
