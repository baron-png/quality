import { IconProps } from "./icon-props"; // adjust import if needed

export type SidebarNavSubItem = {
  title: string;
  url: string;
  roles?: string[];
};

export type SidebarNavItem = {
  title: string;
  icon: (props: IconProps) => JSX.Element;
  url?: string;
  roles?: string[];
  items: SidebarNavSubItem[];
};

export type SidebarNavSection = {
  label: string;
  items: SidebarNavItem[];
};