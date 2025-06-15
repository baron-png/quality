import Signin from "@/components/Auth/Signin";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sign In",
};

export default function SignIn() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-12 dark:bg-gray-900 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl">
        <Breadcrumb pageName="Sign In" />

        <div className="mt-8 overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-gray-800">
          <div className="flex flex-col lg:flex-row">
            {/* Form Section */}
            <div className="w-full p-8 lg:w-1/2 lg:p-12">
              <h2 className="mb-6 text-3xl font-bold text-gray-900 dark:text-white">
                Sign In
              </h2>
              <Signin />
            </div>

            {/* Decorative Section */}
            <div className="hidden w-full bg-gradient-to-br from-indigo-500 to-purple-600 p-8 lg:block lg:w-1/2 lg:p-12">
              <div className="flex h-full flex-col justify-between">
                <div>
                  <Link href="/" className="inline-block">
                    <Image
                      src="/images/logo/logo-light.png"
                      alt="Dual Dimension Consulting Logo"
                      width={176}
                      height={32}
                      className="dark:hidden"
                    />
                    <Image
                      src="/images/logo/logo-dark.png"
                      alt="Dual Dimension Consulting Logo"
                      width={176}
                      height={32}
                      className="hidden dark:block"
                    />
                  </Link>
                  <h3 className="mt-8 text-2xl font-semibold text-white">
                    Welcome Back!
                  </h3>
                  <p className="mt-2 max-w-sm text-sm text-gray-200">
                    Sign in to access your Dual Dimension Consulting account and continue your journey with us.
                  </p>
                </div>
                <div className="mt-8">
                  <Image
                    src="/images/illustrations/sign-in-graphic.svg"
                    alt="Sign In Illustration"
                    width={300}
                    height={300}
                    className="mx-auto opacity-90"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}