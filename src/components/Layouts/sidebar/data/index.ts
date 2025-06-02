import * as Icons from "../icons";

export const NAV_DATA = [
  {
    label: "MAIN MENU",
    items: [
      {
        title: "Dashboard",
        icon: Icons.HomeIcon,
        roles: ["SUPER_ADMIN", "ADMIN", "USER"],
        items: [
          {
            title: "Analytics",
            url: "/",
            roles: ["SUPER_ADMIN", "ADMIN", "USER"],
          },
        ],
      },
      {
        title: "Audit",
        icon: Icons.PieChart,
        roles: ["ADMIN"],
        items: [
          {
            title: "Audit Programs",
            url: "/audit/audit-program",
            roles: ["ADMIN"],
          },
          {
            title: "Team Leaders",
            url: "/audit/internal",
            roles: ["ADMIN"],
          },
          {
            title: "General Audit Notification",
            url: "/audit/external",
            roles: ["ADMIN"],
          },
        ],
      },
      {
        title: "Document",
        icon: Icons.Folder,
        roles: ["ADMIN"],
        items: [
          {
            title: "Document",
            url: "/document",
            roles: ["ADMIN"],
          },
        ],
      },
      {
        title: "Non-Conforming Products",
        icon: Icons.AlertCircle,
        roles: ["ADMIN"],
        items: [
          {
            title: "Non-Conforming Products",
            url: "/non-conforming-products",
            roles: ["ADMIN"],
          },
        ],
      },
      {
        title: "Preventive Actions",
        icon: Icons.CheckCircle,
        roles: ["ADMIN"],
        items: [
          {
            title: "Preventive Actions",
            url: "/preventive-actions",
            roles: ["ADMIN"],
          },
        ],
      },
      {
        title: "Feedback",
        icon: Icons.Message,
        roles: ["ADMIN"],
        items: [
          {
            title: "Feedback",
            url: "/feedback",
            roles: ["ADMIN"],
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
            roles: ["ADMIN"],
          },
        ],
      },
      {
        title: "Settings",
        icon: Icons.Settings,
        roles: ["ADMIN"],
        items: [
          {
            title: "Settings",
            url: "/settings",
            roles: ["ADMIN"],
          },
        ],
      },
      {
        title: "Reports",
        icon: Icons.BarChart,
        roles: ["ADMIN"],
        items: [
          {
            title: "Reports",
            url: "/reports",
            roles: ["ADMIN"],
          },
        ],
      },
      {
        title: "Help",
        icon: Icons.HelpCircle,
        roles: ["ADMIN"],
        items: [
          {
            title: "Help",
            url: "/help",
            roles: ["ADMIN"],
          },
        ],
      },
      {
        title: "Calendar",
        icon: Icons.Calendar,
        url: "/calendar",
        roles: ["SUPER_ADMIN", "ADMIN", "USER"],
        items: [],
      },
      {
        title: "Profile",
        icon: Icons.User,
        url: "/profile",
        roles: ["ADMIN", "USER"],
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
