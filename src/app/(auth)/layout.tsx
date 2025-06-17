import { Toaster } from "react-hot-toast";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "Dual Dimension Consulting | %s",
    default: "Dual Dimension Consulting - Authentication",
  },
  description: "Dual Dimension Consulting - Login or Signup to access our services.",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          className: "bg-white dark:bg-gray-2",
          style: {
            color: "#000",
            fontSize: "14px",
            fontFamily: "Satoshi, sans-serif",
          },
        }}
      />
      <main className="min-h-screen">{children}</main>
    </>
  );
}