
"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useAuth } from "@/context/auth-context";
import { useEffect, useState } from "react";
import { getInstitutions } from "@/api/tenantService";

export function TopChannels({ className }: { className?: string }) {
  const { token } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      getInstitutions(token)
        .then((res) => setData(res.tenants ?? []))
        .catch(() => setData([]))
        .finally(() => setLoading(false));
    }
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6 text-lg font-medium text-gray-600 dark:text-gray-300">
        Loading institutions...
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800 dark:shadow-2xl",
        className
      )}
    >
      <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
        Institutions
      </h2>
      <div className="overflow-x-auto">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow className="border-b border-gray-200 dark:border-gray-700">
              <TableHead className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider dark:text-gray-200">
                Profile
              </TableHead>
              <TableHead className="px-4 py-3 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider dark:text-gray-200">
                Domain
              </TableHead>
              <TableHead className="px-4 py-3 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider dark:text-gray-200">
                Email
              </TableHead>
              <TableHead className="px-4 py-3 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider dark:text-gray-200">
                Phone
              </TableHead>
              <TableHead className="px-4 py-3 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider dark:text-gray-200">
                Status
              </TableHead>
              <TableHead className="px-4 py-3 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider dark:text-gray-200">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((institution: any) => (
              <TableRow
                key={institution.id}
                className="border-b border-gray-100 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors"
              >
                <TableCell className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <Image
                      src={institution.logoUrl}
                      className="h-10 w-10 rounded-full object-cover border border-gray-200 dark:border-gray-600"
                      width={40}
                      height={40}
                      alt={`${institution.name} Logo`}
                      role="presentation"
                    />
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {institution.name}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-4 text-center text-sm text-gray-700 dark:text-gray-300">
                  {institution.domain}
                </TableCell>
                <TableCell className="px-4 py-4 text-center text-sm text-gray-700 dark:text-gray-300">
                  {institution.email}
                </TableCell>
                <TableCell className="px-4 py-4 text-center text-sm text-gray-700 dark:text-gray-300">
                  {institution.phone}
                </TableCell>
                <TableCell className="px-4 py-4 text-center">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
                      institution.status === "Active"
                        ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                        : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                    )}
                  >
                    {institution.status}
                  </span>
                </TableCell>
                <TableCell className="px-4 py-4 text-center">
                  <button
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors disabled:opacity-50"
                    onClick={() => alert(`View institution ${institution.id}`)}
                    aria-label={`View details for ${institution.name}`}
                  >
                    View
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {data.length === 0 && (
        <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
          No institutions found.
        </div>
      )}
    </div>
  );
}
