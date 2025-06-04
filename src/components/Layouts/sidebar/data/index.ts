import * as Icons from "../icons";

export const NAV_DATA = [
  {
    label: "MAIN MENU",
    items: [
      {
        title: "Dashboard",
        icon: Icons.HomeIcon,
        roles: ["SUPER_ADMIN", "ADMIN", "USER", "MR"],
        items: [
          {
            title: "Analytics",
            url: "/",
            roles: ["SUPER_ADMIN", "ADMIN", "MR", "USER"],
          },
        ],
      },
      {
        title: "Audit",
        icon: Icons.PieChart,
        roles: ["ADMIN", "MR"],
        items: [
          {
            title: "Audit Programs",
            url: "/audit/audit-program",
            roles: ["ADMIN", "MR"],
          },
          {
            title: "Team Leaders",
            url: "/audit/internal",
            roles: ["ADMIN", "MR"],
          },
          {
            title: "General Audit Notification",
            url: "/audit/external",
            roles: ["ADMIN", "MR"],
          },
        ],
      },
      {
        title: "Document",
        icon: Icons.Folder,
        roles: ["ADMIN", "MR"],
        items: [
          {
            title: "Document",
            url: "/document",
            roles: ["ADMIN", "MR"],
          },
        ],
      },
      {
        title: "Non-Conforming Products",
        icon: Icons.AlertCircle,
        roles: ["ADMIN", "MR"],
        items: [
          {
            title: "Non-Conforming Products",
            url: "/non-conforming-products",
            roles: ["ADMIN", "MR"],
          },
        ],
      },
      {
        title: "Preventive Actions",
        icon: Icons.CheckCircle,
        roles: ["ADMIN", "MR"],
        items: [
          {
            title: "Preventive Actions",
            url: "/preventive-actions",
            roles: ["ADMIN", "MR"],
          },
        ],
      },
      {
        title: "Feedback",
        icon: Icons.Message,
        roles: ["ADMIN", "MR"],
        items: [
          {
            title: "Feedback",
            url: "/feedback",
            roles: ["ADMIN", "MR"],
          },
        ],
      },
      {
        title: "Risk Management",
        icon: Icons.Shield,
        roles: ["ADMIN"],
        items: [
          {
            title: "Risk Management",
            url: "/risk-management",
            roles: ["ADMIN", "MR"],
          },
        ],
      },
      {
        title: "Settings",
        icon: Icons.Settings,
        roles: ["ADMIN", "MR"],
        items: [
          {
            title: "Settings",
            url: "/settings",
            roles: ["ADMIN", "MR"],
          },
        ],
      },
      {
        title: "Reports",
        icon: Icons.BarChart,
        roles: ["ADMIN", "MR"],
        items: [
          {
            title: "Reports",
            url: "/reports",
            roles: ["ADMIN", "MR"],
          },
        ],
      },
      {
        title: "Help",
        icon: Icons.HelpCircle,
        roles: ["ADMIN", "MR"],
        items: [
          {
            title: "Help",
            url: "/help",
            roles: ["ADMIN", "MR"],
          },
        ],
      },
      {
        title: "Calendar",
        icon: Icons.Calendar,
        url: "/calendar",
        roles: ["SUPER_ADMIN", "ADMIN", "USER", "MR"],
        items: [],
      },
      {
        title: "Profile",
        icon: Icons.User,
        url: "/profile",
        roles: ["ADMIN", "USER", "MR"],
        items: [],
      },
      {
        title: "Users",
        icon: Icons.Alphabet,
        roles: ["SUPER_ADMIN", "ADMIN", "USER"],
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
        roles: ["ADMIN"],
        items: [],
      },
      {
        title: "Pages",
        icon: Icons.Alphabet,
        roles: ["SUPER_ADMIN", "ADMIN", "USER"],
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
