import type { Metadata } from "next";
import "@/css/satoshi.css";
import "@/css/style.css";
import "flatpickr/dist/flatpickr.min.css";
import "jsvectormap/dist/jsvectormap.css";
import "@syncfusion/ej2-react-documenteditor/styles/material.css";
import { Providers } from "@/providers";

export const metadata: Metadata = {
  title: {
    template: "Dual Dimension Consulting | %s",
    default: "Dual Dimension Consulting",
  },
  description:
    "Dual Dimension Consulting is a leading consulting firm specializing in Quality Management Systems and ISMS implementation. We help businesses achieve ISO certifications and enhance their operational efficiency.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}