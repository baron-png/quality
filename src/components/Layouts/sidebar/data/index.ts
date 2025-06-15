import * as Icons from "../icons";

export const NAV_DATA = [
  {
    label: "MAIN MENU",
    items: [
      {
        title: "Dashboard",
        icon: Icons.HomeIcon,
        roles: ["SUPER_ADMIN", "SYSTEM_ADMIN", "USER", "MR"],
        items: [
          {
            title: "Analytics",
            url: "/dashboard",
            roles: ["SUPER_ADMIN", "SYSTEM_ADMIN", "MR", "USER"],
          },
        ],
      },
      {
        title: "Audit",
        icon: Icons.PieChart,
        roles: ["SYSTEM_ADMIN", "MR"],
        items: [
          {
            title: "Audit Programs",
            url: "/audit/audit-program",
            roles: ["SYSTEM_ADMIN", "MR"],
          },
          {
            title: "Team Leaders",
            url: "/audit/internal",
            roles: ["SYSTEM_ADMIN", "MR"],
          },
          {
            title: "General Audit Notification",
            url: "/audit/external",
            roles: ["SYSTEM_ADMIN", "MR"],
          },
        ],
      },
      {
        title: "Document",
        icon: Icons.Folder,
        roles: ["SYSTEM_ADMIN", "MR"],
        items: [
          {
            title: "Document",
            url: "/document",
            roles: ["SYSTEM_ADMIN", "MR"],
          },
        ],
      },
      {
        title: "Non-Conforming Products",
        icon: Icons.AlertCircle,
        roles: ["SYSTEM_ADMIN", "MR"],
        items: [
          {
            title: "Non-Conforming Products",
            url: "/non-conforming-products",
            roles: ["SYSTEM_ADMIN", "MR"],
          },
        ],
      },
      {
        title: "Preventive Actions",
        icon: Icons.CheckCircle,
        roles: ["SYSTEM_ADMIN", "MR"],
        items: [
          {
            title: "Preventive Actions",
            url: "/preventive-actions",
            roles: ["SYSTEM_ADMIN", "MR"],
          },
        ],
      },
      {
        title: "Feedback",
        icon: Icons.Message,
        roles: ["SYSTEM_ADMIN", "MR"],
        items: [
          {
            title: "Feedback",
            url: "/feedback",
            roles: ["SYSTEM_ADMIN", "MR"],
          },
        ],
      },
      {
        title: "Risk Management",
        icon: Icons.Shield,
        roles: ["SYSTEM_ADMIN",],
        items: [
          {
            title: "Risk Management",
            url: "/risk-management",
            roles: ["SYSTEM_ADMIN", "MR"],
          },
        ],
      },
      {
        title: "Settings",
        icon: Icons.Settings,
        roles: ["SYSTEM_ADMIN", "MR"],
        items: [
          {
            title: "Settings",
            url: "/settings",
            roles: ["SYSTEM_ADMIN", "MR"],
          },
        ],
      },
      {
        title: "Reports",
        icon: Icons.BarChart,
        roles: ["SYSTEM_ADMIN", "MR"],
        items: [
          {
            title: "Reports",
            url: "/reports",
            roles: ["SYSTEM_ADMIN", "MR"],
          },
        ],
      },
      {
        title: "Help",
        icon: Icons.HelpCircle,
        roles: ["SYSTEM_ADMIN", "MR"],
        items: [
          {
            title: "Help",
            url: "/help",
            roles: ["SYSTEM_ADMIN", "MR"],
          },
        ],
      },
      {
        title: "Calendar",
        icon: Icons.Calendar,
        url: "/calendar",
        roles: ["SUPER_ADMIN","SYSTEM_ADMIN", "USER", "MR"],
        items: [],
      },
      {
        title: "Profile",
        icon: Icons.User,
        url: "/profile",
        roles: ["SYSTEM_ADMIN", "USER", "MR"],
        items: [],
      },
      {
        title: "Users",
        icon: Icons.Alphabet,
        roles: ["SUPER_ADMIN", "SYSTEM_ADMIN", "USER"],
        items: [
          {
            title: "Form Elements",
            url: "/forms/form-elements",
          },
          {
            title: "Form Layout",
            url: "/forms/form-layout",
          },
        ],
      },
      {
        title: "Institutions",
        icon: Icons.Table,
        url: "/tables",
        roles: ["SUPER_ADMIN"],
        items: [
          {
            title: "Tables",
            url: "/tables",
          },
          {
            title: "Add Institution",
            url: "/tables/add-institution",
          },
        ],
      },
      {
        title: "Manage Institution",
        icon: Icons.Table, // Or choose a more appropriate icon if you have one
        url: "/manage-institution",
        roles: ["SYSTEM_ADMIN",],
        items: [],
      },
      {
        title: "Pages",
        icon: Icons.Alphabet,
        roles: ["SUPER_ADMIN", "SYSTEM_ADMIN", "USER"],
        items: [
          {
            title: "Settings",
            url: "/pages/settings",
          },
        ],
      },
    ],
  },
  {
    label: "OTHERS",
    items: [
      {
        title: "Charts",
        icon: Icons.PieChart,
        items: [
          {
            title: "Basic Chart",
            url: "/charts/basic-chart",
          },
        ],
      },
      {
        title: "UI Elements",
        icon: Icons.FourCircle,
        items: [
          {
            title: "Alerts",
            url: "/ui-elements/alerts",
          },
          {
            title: "Buttons",
            url: "/ui-elements/buttons",
          },
        ],
      },
      {
        title: "Authentication",
        icon: Icons.Authentication,
        items: [
          {
            title: "Sign In",
            url: "/auth/sign-in",
          },
        ],
      },
    ],
  },
];
