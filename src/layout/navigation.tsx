import type { ReactNode } from 'react';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import GridOnOutlinedIcon from '@mui/icons-material/GridOnOutlined';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import StarBorderOutlinedIcon from '@mui/icons-material/StarBorderOutlined';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import PeopleOutlineOutlinedIcon from '@mui/icons-material/PeopleOutlineOutlined';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import { routes } from '../config/routes';

export interface NavItem {
  label: string;
  to: string;
  icon: ReactNode;
  subtitle: string;
  // The label on a phone's bottom tabs, where it differs
  short?: string;
}

export const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: 'Overview',
    items: [
      {
        label: 'Dashboard',
        short: 'Home',
        to: routes.portal.dashboard,
        icon: <HomeOutlinedIcon />,
        subtitle: 'How this month is going',
      },
    ],
  },
  {
    label: 'Monthly work',
    items: [
      {
        label: 'Marks entry',
        short: 'Marks',
        to: routes.portal.marks,
        icon: <GridOnOutlinedIcon />,
        subtitle: 'Enter marks for a test',
      },
      {
        label: 'Tests',
        to: routes.portal.tests,
        icon: <AssignmentTurnedInOutlinedIcon />,
        subtitle: 'Monthly tests and what each one covers',
      },
      {
        label: 'Conduct',
        to: routes.portal.conduct,
        icon: <StarBorderOutlinedIcon />,
        subtitle: 'Behaviour and uniform, per month',
      },
      {
        label: 'Reports',
        to: routes.portal.reports,
        icon: <PrintOutlinedIcon />,
        subtitle: 'Preview and print result cards',
      },
    ],
  },
  {
    label: 'School setup',
    items: [
      {
        label: 'Students',
        to: routes.portal.student,
        icon: <PeopleOutlineOutlinedIcon />,
        subtitle: 'Everyone enrolled at the school',
      },
      {
        label: 'Classes',
        to: routes.portal.classes,
        icon: <LayersOutlinedIcon />,
        subtitle: 'Classes group students and decide their subjects',
      },
      {
        label: 'Subjects',
        to: routes.portal.subjects,
        icon: <MenuBookOutlinedIcon />,
        subtitle: 'Subjects and grade boundaries',
      },
      {
        label: 'Settings',
        to: routes.portal.settings,
        icon: <TuneOutlinedIcon />,
        subtitle: 'School details printed on every card',
      },
    ],
  },
];

export const profileNavItem: NavItem = {
  label: 'Your profile',
  to: routes.portal.profile,
  icon: <PersonOutlineOutlinedIcon />,
  subtitle: 'Your name, email and password',
};

const allItems = [...navGroups.flatMap((g) => g.items), profileNavItem];

export const isActive = (pathname: string, to: string) =>
  pathname === to || pathname.startsWith(`${to}/`);

export const navItemFor = (pathname: string) =>
  allItems.find((item) => isActive(pathname, item.to));

// Bottom tabs on phones; the rest sit behind More
const tabRoutes = [
  routes.portal.dashboard,
  routes.portal.marks,
  routes.portal.reports,
  routes.portal.student,
];
export const tabItems = tabRoutes.map(
  (to) => allItems.find((item) => item.to === to) as NavItem
);
export const moreItems = allItems.filter(
  (item) => !tabRoutes.includes(item.to)
);
